import os
import re
from flask import Flask, render_template_string, request, jsonify, Response
from groq import Groq
import requests

app = Flask(__name__)

# --- CONFIGURATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM" # Rachel Voice (Stable)

client = Groq(api_key=GROQ_API_KEY)

# --- HTML/CSS/JS (Single File for Mobile Ease) ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brahmaand Vaani 🕉️</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f0c29; color: #fff; margin: 0; display: flex; flex-direction: column; height: 100vh; }
        .header { background: linear-gradient(to right, #24243e, #302b63); padding: 15px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .chat-box { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .message { max-width: 80%; padding: 10px 15px; border-radius: 15px; line-height: 1.4; font-size: 15px; }
        .user { align-self: flex-end; background: #00b09b; color: white; border-bottom-right-radius: 2px; }
        .bot { align-self: flex-start; background: #333; color: #ddd; border-bottom-left-radius: 2px; }
        .input-area { padding: 10px; background: #1a1a2e; display: flex; gap: 10px; }
        input { flex: 1; padding: 12px; border-radius: 25px; border: none; outline: none; background: #333; color: white; }
        button { padding: 12px 20px; border-radius: 25px; border: none; background: #f12711; color: white; font-weight: bold; cursor: pointer; }
        button:disabled { background: #555; }
        .loading { font-size: 12px; color: #aaa; text-align: center; display: none; }
        /* Audio Player Hidden */
        #audio-player { display: none; }
    </style>
</head>
<body>
    <div class="header">
        <h2>🕉️ Brahmaand Vaani</h2>
        <small>Divine AI Assistant</small>
    </div>
    
    <div class="chat-box" id="chat-box">
        <div class="message bot">Har Har Mahadev! 🙏 Main kaise aapki seva kar sakta hoon?</div>
    </div>
    
    <div class="loading" id="loading">Brahmaand vaani sun raha hai...</div>

    <div class="input-area">
        <input type="text" id="user-input" placeholder="Apna prashna puchein..." autocomplete="off">
        <button onclick="sendMessage()" id="send-btn">➤</button>
    </div>

    <audio id="audio-player"></audio>

    <script>
        const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('user-input');
        const loading = document.getElementById('loading');
        const audioPlayer = document.getElementById('audio-player');
        const sendBtn = document.getElementById('send-btn');

        // Enter key to send
        userInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") sendMessage();
        });

        async function sendMessage() {
            const text = userInput.value.trim();
            if (!text) return;

            // 1. Show User Message
            addMessage(text, 'user');
            userInput.value = '';
            loading.style.display = 'block';
            sendBtn.disabled = true;

            try {
                // 2. Call Backend
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                const data = await response.json();

                // 3. Show Bot Message
                addMessage(data.reply, 'bot');

                // 4. Play Audio (TTS)
                if (data.audio) {
                    playAudio(data.audio);
                }

            } catch (error) {
                addMessage("Kshama karein, kuch technical dosh hua. 🙏", 'bot');
                console.error(error);
            } finally {
                loading.style.display = 'none';
                sendBtn.disabled = false;
                userInput.focus();
            }
        }

        function addMessage(text, sender) {
            const div = document.createElement('div');
            div.className = `message ${sender}`;
            div.innerText = text;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function playAudio(base64Audio) {
            // Convert Base64 to Blob
            const fetchAudio = async () => {
                const res = await fetch(base64Audio);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                audioPlayer.src = url;
                
                // Mobile Autoplay Fix: Play immediately
                audioPlayer.play().catch(e => {
                    console.log("Autoplay blocked, waiting for interaction");
                    // Show play button if blocked
                    addMessage("🔊 Audio ready hai, tap karke sunein.", 'bot');
                });
            };
            fetchAudio();
        }
    </script>
</body>
</html>
"""

# --- ROUTES ---

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({"error": "No message"}), 400

        # 1. Get AI Response (GROQ)
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": user_message}],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=500
        )
        ai_reply = chat_completion.choices[0].message.content

        # 2. Get Audio (ElevenLabs)
        audio_base64 = get_tts_audio(ai_reply)

        return jsonify({
            "reply": ai_reply,
            "audio": audio_base64
        })

    except Exception as e:
        return jsonify({"reply": "Kuch gadbad ho gayi. Check logs.", "error": str(e)}), 500

def get_tts_audio(text):
    try:
        if not ELEVENLABS_API_KEY:
            return None
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            # Convert binary audio to Base64 Data URL for frontend
            import base64
            audio_b64 = base64.b64encode(response.content).decode('utf-8')
            return f"data:audio/mpeg;base64,{audio_b64}"
        else:
            print(f"TTS Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"TTS Exception: {e}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
