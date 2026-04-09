import os, logging, requests, base64, time
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = Flask(__name__, static_folder='assets', template_folder='templates')
CORS(app)

# Initialize Clients
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY")

hf_client = InferenceClient(token=HF_API_KEY) if HF_API_KEY else None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('assets', filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=500
        )

        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        logger.error(f"❌ Chat Error: {str(e)}")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

@app.route('/api/tts', methods=['POST'])
def elevenlabs_tts():
    """Audio only (Fast - CSS Animation ke saath)"""
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
                "audio": f"data:audio/mpeg;base64,{audio_base64}",
                "success": True,
                "video": None
            })
        else:
            return jsonify({"error": f"ElevenLabs error: {response.status_code}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/talking-head', methods=['POST'])
def talking_head():
    """Video with Lip Sync using Hugging Face (SadTalker)"""
    try:
        data = request.json
        text = data.get('text', '')
        image_path = data.get('image_path', '/assets/gods/cosmic.png')
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')

        if not HF_API_KEY:
            logger.warning("⚠️ HF_API_KEY not set, using audio fallback")
            return jsonify({"video": None, "use_css_animation": True})

        logger.info(f"🎬 Generating talking head: {text[:30]}...")

        # Step 1: Generate Audio (ElevenLabs)
        tts_url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        tts_headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        tts_payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
        }
        
        audio_resp = requests.post(tts_url, json=tts_payload, headers=tts_headers, timeout=30)
        if audio_resp.status_code != 200:
            return jsonify({"error": "Audio generation failed", "use_css_animation": True}), 500
        
        audio_bytes = audio_resp.content
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

        # Step 2: Generate Video (Hugging Face SadTalker)
        # Using SadTalker Space API
        try:
            logger.info("📡 Sending to Hugging Face SadTalker...")
            
            # Build full image URL (your domain + asset path)
            base_url = request.host_url.rstrip('/')
            full_image_url = f"{base_url}{image_path}"
            
            # SadTalker API Call
            hf_response = requests.post(
                "https://api-inference.huggingface.co/models/sadtalker/sadtalker",
                headers={"Authorization": f"Bearer {HF_API_KEY}"},
                json={
                    "source_image": full_image_url,
                    "driven_audio": f"data:audio/wav;base64,{base64.b64encode(audio_bytes).decode('utf-8')}",
                    "enhancer": "gfpgan",
                    "preprocess": "full",
                    "still": False,
                    "batch_size": 1
                },
                timeout=60
            )
            
            if hf_response.status_code == 200:
                # HF returns video bytes
                video_base64 = base64.b64encode(hf_response.content).decode('utf-8')
                video_url = f"data:video/mp4;base64,{video_base64}"
                logger.info("✅ Video generated successfully!")
                
                return jsonify({
                    "video": video_url,
                    "audio": f"data:audio/mpeg;base64,{audio_base64}",
                    "use_css_animation": False,
                    "success": True
                })
            else:
                logger.warning(f"⚠️ HF Video failed: {hf_response.status_code}")
                # Fallback to audio + CSS
                return jsonify({
                    "video": None,
                    "audio": f"data:audio/mpeg;base64,{audio_base64}",
                    "use_css_animation": True,
                    "success": True
                })
                
        except Exception as hf_error:
            logger.error(f"❌ HF Error: {str(hf_error)}")
            # Fallback to audio + CSS
            return jsonify({
                "video": None,
                "audio": f"data:audio/mpeg;base64,{audio_base64}",
                "use_css_animation": True,
                "success": True
            })

    except Exception as e:
        logger.error(f"❌ Talking Head Error: {str(e)}")
        return jsonify({"error": str(e), "use_css_animation": True}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    logger.info(f"🚀 Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
