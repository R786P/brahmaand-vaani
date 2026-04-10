import os, logging, requests, base64, json
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = Flask(__name__, static_folder='assets', template_folder='templates')
CORS(app)

# API Keys
HF_API_KEY = os.getenv("HF_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

logger.info("="*50)
logger.info("🔑 API Keys Status:")
logger.info(f"HF_API_KEY: {'✅' if HF_API_KEY else '❌'}")
logger.info(f"GROQ_API_KEY: {'✅' if GROQ_API_KEY else '❌'}")
logger.info(f"ELEVENLABS_API_KEY: {'✅' if ELEVENLABS_API_KEY else '❌'}")
logger.info("="*50)

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Hugging Face NEW endpoint
HF_API_URL = "https://router.huggingface.co/hf-inference/models/meta-llama/Meta-Llama-3-8B-Instruct"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('assets', filename)

@app.route('/api/health')
def health():
    return jsonify({
        "status": "✅ OK",
        "HF_API_KEY": "loaded" if HF_API_KEY else "missing",
        "GROQ_API_KEY": "loaded" if GROQ_API_KEY else "missing",
        "ELEVENLABS_API_KEY": "loaded" if ELEVENLABS_API_KEY else "missing",
        "message": "Server running with HF + Groq fallback!"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"reply": "⚠️ Invalid request"}), 400
        
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')
        
        if not message:
            return jsonify({"reply": "⚠️ Kuch toh likho!"}), 400
        
        logger.info(f"💬 User: {message}")
        
        # ========== TRY HUGGING FACE FIRST ==========
        if HF_API_KEY:
            try:
                logger.info("🔄 Trying Hugging Face...")
                
                hf_headers = {
                    "Authorization": f"Bearer {HF_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                hf_payload = {
                    "inputs": f"<|system|>\n{system_prompt}<|end|>\n<|user|>\n{message}<|end|>\n<|assistant|>",
                    "parameters": {
                        "max_new_tokens": 500,
                        "temperature": 0.7,
                        "return_full_text": False
                    }
                }
                
                hf_response = requests.post(
                    HF_API_URL,
                    headers=hf_headers,
                    json=hf_payload,
                    timeout=20
                )
                
                if hf_response.status_code == 200:
                    result = hf_response.json()
                    logger.info("✅ Hugging Face success!")
                    
                    # Extract text
                    if isinstance(result, list) and len(result) > 0:
                        reply = result[0].get('generated_text', '').strip()
                    elif isinstance(result, dict):
                        reply = result.get('generated_text', '').strip()
                    else:
                        reply = str(result).strip()
                    
                    if reply:
                        logger.info(f"🤖 HF Reply: {reply[:100]}...")
                        return jsonify({"reply": reply, "source": "huggingface"})
                
                logger.warning(f"⚠️ HF failed: {hf_response.status_code}")
                
            except Exception as hf_error:
                logger.error(f"❌ HF Error: {str(hf_error)}")
                # Continue to Groq
        
        # ========== FALLBACK TO GROQ ==========
        if groq_client:
            try:
                logger.info("🔄 Trying Groq...")
                
                completion = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                
                reply = completion.choices[0].message.content.strip()
                logger.info(f"🤖 Groq Reply: {reply[:100]}...")
                
                return jsonify({"reply": reply, "source": "groq"})
                
            except Exception as groq_error:
                logger.error(f"❌ Groq Error: {str(groq_error)}")
        
        # ========== BOTH FAILED ==========
        return jsonify({
            "reply": "⚠️ Dono APIs (HF + Groq) fail ho gayi. API keys check karein.",
            "debug": {
                "hf_available": bool(HF_API_KEY),
                "groq_available": bool(groq_client)
            }
        }), 500

    except Exception as e:
        logger.error(f"❌ Chat Error: {str(e)}", exc_info=True)
        return jsonify({"reply": f"⚠️ Server Error: {str(e)}"}), 500

@app.route('/api/tts', methods=['POST'])
def elevenlabs_tts():
    try:
        data = request.json
        text = data.get('text', '')
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')

        if not ELEVENLABS_API_KEY:
            return jsonify({"error": "ElevenLabs API key missing"}), 500

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            audio_base64 = base64.b64encode(response.content).decode('utf-8')
            return jsonify({
                "audio": f"audio/mpeg;base64,{audio_base64}",
                "success": True
            })
        else:
            return jsonify({"error": f"ElevenLabs error: {response.status_code}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/talking-head', methods=['POST'])
def talking_head():
    """Hugging Face se video generation (image + audio se lip-sync)"""
    try:
        data = request.json
        image_path = data.get('image_path', '/assets/gods/cosmic.png')
        audio_base64 = data.get('audio', '')
        
        if not HF_API_KEY:
            return jsonify({"error": "HF_API_KEY missing for video generation"}), 500
        
        logger.info("🎬 Generating talking head video with HF...")
        
        # Yahan aap SadTalker ya Wav2Lip API use kar sakte hain
        # Abhi placeholder response
        return jsonify({
            "video": None,
            "message": "Video generation - coming soon",
            "use_css_animation": True
        })
        
    except Exception as e:
        logger.error(f"❌ Video Error: {str(e)}")
        return jsonify({"error": str(e), "use_css_animation": True}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    logger.info(f"🚀 Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
