import os, logging, requests, base64
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = Flask(__name__, static_folder='', template_folder='')
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('', filename)

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🚀 Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
