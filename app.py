import os, logging
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

@app.route('/')
def home():
    logger.info("🏠 Home route accessed")
    return render_template('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    logger.info(f"📁 Serving: {filename}")
    return send_from_directory('', filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    logger.info("📨 POST /api/chat")
    try:
        data = request.json
        if not data:
            return jsonify({"reply": "❌ Invalid request"}), 400
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
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({"reply": f"⚠️ Error: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🚀 Server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
