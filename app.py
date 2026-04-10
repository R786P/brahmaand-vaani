import os, logging, requests, base64
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = Flask(__name__, static_folder='assets', template_folder='templates')
CORS(app)

# Sirf Hugging Face use karenge
HF_API_KEY = os.getenv("HF_API_KEY")
logger.info(f"🔑 HF_API_KEY loaded: {'Yes' if HF_API_KEY else 'No'}")

if HF_API_KEY:
    client = InferenceClient(token=HF_API_KEY)
    logger.info("✅ Hugging Face client initialized")
else:
    client = None
    logger.error("❌ HF_API_KEY not found!")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

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
        logger.info(f"📩 Received request: {data}")
        
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')

        if not client:
            logger.error("❌ Hugging Face client not initialized!")
            return jsonify({
                "reply": "⚠️ API key not configured. Please add HF_API_KEY in environment variables."
            }), 500

        if not message:
            return jsonify({"reply": "⚠️ Kuch likh toh rahe ho?"}), 400

        logger.info(f"🤔 Processing: {message[:50]}...")
        
        # Hugging Face API call
        response = client.chat.completions.create(
            model="meta-llama/Meta-Llama-3-8B-Instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            max_tokens=500,
            temperature=0.7
        )

        reply = response.choices[0].message.content
        logger.info(f"✅ Reply generated: {reply[:50]}...")
        
        return jsonify({"reply": reply})

    except Exception as e:
        logger.error(f"❌ Chat Error: {str(e)}", exc_info=True)
        return jsonify({
            "reply": f"⚠️ Error: {str(e)}",
            "details": "Check Render logs for more info"
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

@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok",
        "hf_client": "connected" if client else "not connected",
        "elevenlabs": "configured" if ELEVENLABS_API_KEY else "not configured"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    logger.info(f"🚀 Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
