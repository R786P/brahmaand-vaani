import os, logging, requests, base64, json
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = Flask(__name__, static_folder='assets', template_folder='templates')
CORS(app)

# Check API Keys
HF_API_KEY = os.getenv("HF_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

logger.info("="*50)
logger.info("🔑 API Keys Status:")
logger.info(f"HF_API_KEY: {'✅ Loaded' if HF_API_KEY else '❌ Missing'}")
logger.info(f"ELEVENLABS_API_KEY: {'✅ Loaded' if ELEVENLABS_API_KEY else '❌ Missing'}")
logger.info("="*50)

# Hugging Face direct API use (client ki jagah)
HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"

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
        "ELEVENLABS_API_KEY": "loaded" if ELEVENLABS_API_KEY else "missing",
        "message": "Server is running!"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        logger.info(f"📥 Request received: {data}")
        
        if not data:
            return jsonify({"reply": "⚠️ Invalid request format"}), 400
        
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')
        
        if not message:
            return jsonify({"reply": "⚠️ Kuch toh likho bhai!"}), 400
        
        if not HF_API_KEY:
            logger.error("❌ HF_API_KEY not found!")
            return jsonify({
                "reply": "⚠️ Server configuration error. HF_API_KEY missing.",
                "debug": "Please check Render environment variables"
            }), 500
        
        logger.info(f"🤔 Processing: '{message}'")
        
        # Direct Hugging Face API call (more reliable)
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": f"<|system|>\n{system_prompt}<|end|>\n<|user|>\n{message}<|end|>\n<|assistant|>",
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        logger.info("📡 Calling Hugging Face API...")
        
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        logger.info(f"📡 API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ Success: {result}")
            
            # Extract text from response
            if isinstance(result, list) and len(result) > 0:
                reply = result[0].get('generated_text', 'No response')
            elif isinstance(result, dict):
                reply = result.get('generated_text', 'No response')
            else:
                reply = str(result)
            
            return jsonify({"reply": reply.strip()})
        
        else:
            error_msg = response.text[:200]
            logger.error(f"❌ HF API Error: {response.status_code} - {error_msg}")
            
            return jsonify({
                "reply": f"⚠️ API Error: {response.status_code}",
                "details": error_msg,
                "hint": "Model might be loading. Try again in 30 seconds."
            }), 500

    except requests.exceptions.Timeout:
        logger.error("⏱️ Request timeout")
        return jsonify({
            "reply": "⏱️ Request timeout. Model is loading. Try again in 30 seconds."
        }), 503
        
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            "reply": f"⚠️ Server Error: {str(e)}",
            "hint": "Check Render logs for details"
        }), 500

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    logger.info(f"🚀 Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
