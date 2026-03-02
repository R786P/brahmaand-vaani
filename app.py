import os
from flask import Flask, render_template, request, jsonify, url_for
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# IMPORTANT: template_folder aur static_folder ko '' (empty) rakho root ke liye
app = Flask(__name__, template_folder='', static_folder='')
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Home Route
@app.route('/')
def home():
    return render_template('index.html')

# API Route
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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
