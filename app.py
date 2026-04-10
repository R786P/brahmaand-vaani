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

HF_API_KEY = os.getenv("HF_API_KEY")
client = InferenceClient(token=HF_API_KEY) if HF_API_KEY else None

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
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')

        if not client:
            logger.error("❌ HF Client not initialized!")
            return jsonify({"reply": "⚠️ API key not configured. Check Render env vars."}), 500

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
        return jsonify({"reply": reply})

    except Exception as e:
        logger.error(f"❌ Chat Error: {str(e)}")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
