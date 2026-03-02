import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ✅ FIXED: static_folder='' aur template_folder='' set kiya hai root ke liye
app = Flask(__name__, static_folder='', template_folder='')
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 1. Home Route - index.html serve karega
@app.route('/')
def home():
    return render_template('index.html')

# 2. ✅ FIXED: Static files (CSS/JS) ko manually serve karne ka route
# Browser jab style.css maangega, toh yeh function use root se bhej dega
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('', filename)

# 3. API Route
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
        print(f"Error: {str(e)}")
        return jsonify({"reply": "Kshama karein, divine connection mein samasya hai. 🙏"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
