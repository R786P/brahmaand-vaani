import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

load_dotenv()  # Load .env variables

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Allow cross-origin requests

# Initialize Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# --- Frontend Routes ---
@app.route('/')
def home():
    return render_template('index.html')

# Serve static files explicitly if needed (optional but safe)
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# --- API Route ---
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        system_prompt = data.get('system_prompt', 'You are a helpful divine guide.')
        
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
        return jsonify({"reply": reply})
    
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    # Render needs 0.0.0.0 and dynamic port
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
