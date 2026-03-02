import os, logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Root folder compatible Flask app
app = Flask(__name__, static_folder='', template_folder='')
CORS(app)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route('/')
def home():
    logger.info("🏠 Home route accessed")
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    logger.info(f"📁 Serving static file: {filename}")
    return send_from_directory('', filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    logger.info("📨 POST /api/chat received")
    try:
        data = request.json
        
        # ✅ FIXED: Proper condition check
        if not data:
            logger.warning("⚠️ No JSON data in request")
            return jsonify({"reply": "❌ Invalid request format"}), 400
        
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')
        
        logger.info(f"💬 Query: {message[:50]}...")
        
        # Call GROQ API
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        reply = completion.choices[0].message.content
        logger.info("✅ Reply generated successfully")
        return jsonify({"reply": reply})
    
    except Exception as e:
        logger.error(f"❌ API Error: {str(e)}", exc_info=True)
        return jsonify({"reply": f"⚠️ Error: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🚀 Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
