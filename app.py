import os, logging, requests, base64, json
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = Flask(__name__, static_folder='assets', template_folder='templates')
CORS(app)

# 🔑 API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

logger.info("="*60)
logger.info("🔑 API Keys Status:")
logger.info(f"GROQ_API_KEY:        {'✅ Loaded' if GROQ_API_KEY else '❌ Missing'}")
logger.info(f"HF_API_KEY:          {'✅ Loaded' if HF_API_KEY else '❌ Missing'}")
logger.info(f"ELEVENLABS_API_KEY:  {'✅ Loaded' if ELEVENLABS_API_KEY else '❌ Missing'}")
logger.info("="*60)

# Initialize Groq Client
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("✅ Groq client initialized")
    except Exception as e:
        logger.error(f"❌ Groq client error: {str(e)}")

# Initialize Hugging Face Client
hf_client = None
if HF_API_KEY:
    try:
        hf_client = InferenceClient(token=HF_API_KEY)
        logger.info("✅ Hugging Face client initialized")
    except Exception as e:
        logger.error(f"❌ HF client error: {str(e)}")

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
        "GROQ_API_KEY": "loaded" if GROQ_API_KEY else "missing",
        "HF_API_KEY": "loaded" if HF_API_KEY else "missing",
        "ELEVENLABS_API_KEY": "loaded" if ELEVENLABS_API_KEY else "missing",
        "Groq_Client": "ready" if groq_client else "not ready",
        "HF_Client": "ready" if hf_client else "not ready",
        "message": "All systems operational!"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Groq API se chat reply"""
    try:
        data = request.get_json()
        logger.info(f"📥 Chat request received")
        
        if not data:
            return jsonify({"reply": "⚠️ Invalid request"}), 400
        
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')
        
        if not message:
            return jsonify({"reply": "⚠️ Kuch toh likho!"}), 400
        
        if not groq_client:
            logger.error("❌ Groq client not initialized!")
            return jsonify({
                "reply": "⚠️ Groq API key not configured.",
                "debug": "Check GROQ_API_KEY in environment variables"
            }), 500
        
        logger.info(f"🤖 Processing with Groq...")
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        reply = completion.choices[0].message.content
        logger.info(f"✅ Groq reply generated")
        
        return jsonify({"reply": reply})

    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Groq Chat Error: {error_msg}", exc_info=True)
        
        if "api_key" in error_msg.lower() or "unauthorized" in error_msg.lower():
            return jsonify({
                "reply": "⚠️ Groq API Key invalid",
                "details": "Get new key from https://console.groq.com"
            }), 401
        elif "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            return jsonify({
                "reply": "⚠️ Groq quota khatam",
                "details": "Wait 24 hours or upgrade"
            }), 429
        else:
            return jsonify({
                "reply": f"⚠️ Error: {error_msg}"
            }), 500

@app.route('/api/talking-head', methods=['POST'])
def talking_head():
    """Hugging Face se video generate (Lip-sync)"""
    try:
        data = request.json
        text = data.get('text', '')
        image_path = data.get('image_path', '/assets/gods/cosmic.png')
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')
        
        if not hf_client:
            logger.error("❌ HF client not initialized!")
            return jsonify({
                "video": None,
                "use_css_animation": True,
                "reason": "HF_API_KEY not configured"
            })
        
        logger.info(f"🎬 Generating talking head with HF...")
        
        # Step 1: Generate Audio (ElevenLabs)
        if not ELEVENLABS_API_KEY:
            return jsonify({
                "video": None,
                "use_css_animation": True,
                "reason": "ElevenLabs API key missing"
            })
        
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
            return jsonify({
                "video": None,
                "use_css_animation": True,
                "reason": "Audio generation failed"
            })
        
        audio_bytes = audio_resp.content
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Step 2: Generate Video (Hugging Face SadTalker)
        try:
            base_url = request.host_url.rstrip('/')
            full_image_url = f"{base_url}{image_path}"
            
            hf_response = requests.post(
                "https://api-inference.huggingface.co/models/sadtalker/sadtalker",
                headers={"Authorization": f"Bearer {HF_API_KEY}"},
                json={
                    "source_image": full_image_url,
                    "driven_audio": f"audio/wav;base64,{audio_base64}",
                    "enhancer": "gfpgan",
                    "preprocess": "full",
                    "still": False
                },
                timeout=60
            )
            
            if hf_response.status_code == 200:
                video_base64 = base64.b64encode(hf_response.content).decode('utf-8')
                video_url = f"data:video/mp4;base64,{video_base64}"
                logger.info("✅ HF Video generated!")
                
                return jsonify({
                    "video": video_url,
                    "audio": f"audio/mpeg;base64,{audio_base64}",
                    "use_css_animation": False,
                    "success": True
                })
            else:
                logger.warning(f"⚠️ HF Video failed: {hf_response.status_code}")
                return jsonify({
                    "video": None,
                    "audio": f"audio/mpeg;base64,{audio_base64}",
                    "use_css_animation": True,
                    "success": True
                })
                
        except Exception as hf_error:
            logger.error(f"❌ HF Video Error: {str(hf_error)}")
            return jsonify({
                "video": None,
                "audio": f"audio/mpeg;base64,{audio_base64}",
                "use_css_animation": True,
                "success": True
            })

    except Exception as e:
        logger.error(f"❌ Talking Head Error: {str(e)}")
        return jsonify({
            "error": str(e),
            "use_css_animation": True
        }), 500

@app.route('/api/tts', methods=['POST'])
def elevenlabs_tts():
    """✅ FIXED: ElevenLabs TTS - Proper error handling + audio encoding"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid request"}), 400
            
        text = data.get('text', '')
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')

        if not ELEVENLABS_API_KEY:
            logger.error("❌ ELEVENLABS_API_KEY not set!")
            return jsonify({"error": "ElevenLabs API key missing"}), 500

        if not text:
            return jsonify({"error": "Text is empty"}), 400

        logger.info(f"🎤 ElevenLabs request: voice={voice_id}, text_len={len(text)}")

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
                "style": 0.0,
                "use_speaker_boost": True
            }
        }

        logger.info(f"📡 Calling ElevenLabs API...")
        response = requests.post(url, json=payload, headers=headers, timeout=30)

        logger.info(f"📡 ElevenLabs response: {response.status_code}")

        if response.status_code == 200:
            # ✅ Raw audio bytes received
            audio_bytes = response.content
            logger.info(f"✅ Audio received: {len(audio_bytes)} bytes")
            
            # ✅ Base64 encode for browser
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            # ✅ Return proper data URI format
            return jsonify({
                "audio": f"data:audio/mpeg;base64,{audio_base64}",
                "success": True,
                "length": len(audio_base64)
            })
            
        else:
            # ❌ Error handling
            error_text = response.text[:500] if response.text else "No error message"
            logger.error(f"❌ ElevenLabs error {response.status_code}: {error_text}")
            
            return jsonify({
                "error": f"ElevenLabs error: {response.status_code}",
                "details": error_text,
                "hint": "Check API key, voice_id, or credits at elevenlabs.io"
            }), response.status_code

    except requests.exceptions.Timeout:
        logger.error("⏱️ ElevenLabs timeout")
        return jsonify({
            "error": "Request timeout - ElevenLabs server slow",
            "hint": "Try again in a few seconds"
        }), 503
        
    except requests.exceptions.ConnectionError:
        logger.error("🔌 ElevenLabs connection error")
        return jsonify({
            "error": "Cannot connect to ElevenLabs",
            "hint": "Check internet connection"
        }), 503
        
    except Exception as e:
        logger.error(f"❌ TTS Unexpected Error: {str(e)}", exc_info=True)
        return jsonify({
            "error": f"Server error: {str(e)}",
            "hint": "Check Render logs for details"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    logger.info(f"🚀 Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
