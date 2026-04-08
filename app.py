import os, logging, requests, base64, io
from flask import Flask, render_template, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = Flask(__name__, static_folder='', template_folder='')
CORS(app)

# Initialize clients
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# SadTalker Inference Client
sadtalker_client = InferenceClient(token=HF_API_KEY) if HF_API_KEY else None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('', filename)

# ==================== EXISTING ROUTES (UNCHANGED) ====================

@app.route('/api/tts', methods=['POST'])
def elevenlabs_tts():
    try:
        data = request.json
        text = data.get('text', '')
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')
        
        logger.info(f"🎤 ElevenLabs request: {text[:50]}...")
        
        if not ELEVENLABS_API_KEY:
            logger.error("❌ ELEVENLABS_API_KEY not set!")
            return jsonify({"error": "ElevenLabs API key not configured"}), 500
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.5,
                "use_speaker_boost": True
            }
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            audio_base64 = base64.b64encode(response.content).decode('utf-8')
            logger.info("✅ ElevenLabs audio generated")
            return jsonify({
                "audio": f"data:audio/mpeg;base64,{audio_base64}",
                "success": True
            })
        else:
            logger.error(f"❌ ElevenLabs error {response.status_code}: {response.text}")
            return jsonify({
                "error": f"ElevenLabs error: {response.status_code}",
                "details": response.text
            }), response.status_code
    
    except Exception as e:
        logger.error(f"❌ TTS Error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        if not data:
            return jsonify({"reply": "Invalid request"}), 400
        
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

# ==================== NEW: TALKING AVATAR ROUTE ====================

@app.route('/api/talking-avatar', methods=['POST'])
def generate_talking_avatar():
    """
    Generate talking avatar video using SadTalker via Hugging Face Inference API
    Expects: multipart/form-data with 'image' and 'audio' files
    Returns: MP4 video file
    """
    try:
        if not HF_API_KEY:
            logger.error("❌ HUGGINGFACE_API_KEY not set!")
            return jsonify({"error": "Hugging Face API key not configured"}), 500
        
        if 'image' not in request.files or 'audio' not in request.files:
            return jsonify({"error": "Both image and audio files are required"}), 400
        
        image_file = request.files['image']
        audio_file = request.files['audio']
        
        if image_file.filename == '' or audio_file.filename == '':
            return jsonify({"error": "Empty filename provided"}), 400
        
        logger.info(f"🎬 Talking Avatar request: {image_file.filename} + {audio_file.filename}")
        
        # Read files as bytes
        image_bytes = image_file.read()
        audio_bytes = audio_file.read()
        
        # Option 1: Using InferenceClient (if supported by model)
        # Option 2: Direct API call (more reliable for SadTalker)
        
        # Using direct API call for SadTalker
        api_url = "https://api-inference.huggingface.co/models/vinthony/SadTalker"
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Accept": "video/mp4"
        }
        
        # SadTalker expects a specific JSON format
        # We'll send image as base64 and audio as base64
        import json
        payload = {
            "inputs": {
                "image": base64.b64encode(image_bytes).decode('utf-8'),
                "audio": base64.b64encode(audio_bytes).decode('utf-8')
            },
            "parameters": {
                "preprocess": "crop",
                "still": True,
                "expression_scale": 1.0
            }
        }
        
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=120  # SadTalker can take time
        )
        
        if response.status_code == 200:
            logger.info("✅ SadTalker video generated")
            # Return video as downloadable file
            return send_file(
                io.BytesIO(response.content),
                mimetype='video/mp4',
                as_attachment=True,
                download_name='talking_avatar.mp4'
            )
        
        elif response.status_code == 503:
            # Model is loading - common with HF free tier
            logger.warning("⏳ Model loading, please retry in 30 seconds")
            return jsonify({
                "error": "Model is loading. Please wait 30 seconds and try again.",
                "estimated_time": response.json().get("estimated_time", 30)
            }), 503
        
        else:
            logger.error(f"❌ SadTalker error {response.status_code}: {response.text}")
            return jsonify({
                "error": f"SadTalker error: {response.status_code}",
                "details": response.text[:500]  # Limit response size
            }), response.status_code
    
    except Exception as e:
        logger.error(f"❌ Talking Avatar Error: {str(e)}", exc_info=True)
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# ==================== HEALTH CHECK (Optional) ====================

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "services": {
            "groq": bool(os.getenv("GROQ_API_KEY")),
            "elevenlabs": bool(ELEVENLABS_API_KEY),
            "huggingface": bool(HF_API_KEY)
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🚀 Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
