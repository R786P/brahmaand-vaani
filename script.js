console.log("✅ Divine AI Loaded - ElevenLabs Ready!");

const GODS = {
  shiva: {
    name: 'Lord Shiva (Mahadev)',
    image: 'assets/gods/shiva.png',
    prompt: 'You are Lord Shiva. Answer in Hindi with "Har Har Mahadev".',
    color: '#4ecdc4',
    elevenlabsVoice: 'pNInz6obpgDQGcFmaJgB'
  },
  krishna: {
    name: 'Shri Krishna',
    image: 'assets/gods/krishna.png',
    prompt: 'You are Lord Krishna. Answer in sweet Hindi. Use "Radhe Radhe".',
    color: '#fbbf24',
    elevenlabsVoice: 'TxGEqnHWrfWFTfGW9XjX'
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: 'assets/gods/vishnu.png',
    prompt: 'You are Lord Vishnu. Answer with compassion in Hindi.',
    color: '#3498db',
    elevenlabsVoice: 'AZnzlk1XvdvUeBnXmlld'
  },
  durga: {
    name: 'Maa Durga',
    image: 'assets/gods/durga.png',
    prompt: 'You are Maa Durga. Answer with strength. Use "Jay Mata Di".',
    color: '#e74c3c',
    elevenlabsVoice: 'EXAVITQu4vr4xnSDxMaL'
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: 'assets/gods/ganesh.png',
    prompt: 'You are Lord Ganesh. Answer with wisdom. Use "Om Gan Ganpataye".',
    color: '#f1c40f',
    elevenlabsVoice: 'MF3mGyEYCl7XYWbV9V6O'
  },
  generic: {
    name: 'Cosmic Guide',
    image: 'assets/gods/ganesh.png',
    prompt: 'You are a wise cosmic guide.',
    color: '#ffd700',
    elevenlabsVoice: '21m00Tcm4TlvDq8ikWAM'
  }
};

let currentGod = 'generic';
let queryInput, sendBtn, responseArea, godResponse, hologramGod, godImage, reactionBubble;

document.addEventListener('DOMContentLoaded', () => {
  queryInput = document.getElementById('user-query');
  sendBtn = document.getElementById('send-btn');
  responseArea = document.getElementById('response-area');
  godResponse = document.getElementById('god-response');
  hologramGod = document.getElementById('hologram-god');
  godImage = document.getElementById('god-image');
  reactionBubble = document.getElementById('reaction-bubble');
  
  sendBtn.addEventListener('click', handleSend);
  
  document.querySelectorAll('.god-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const godKey = e.target.dataset.god;
      if (godKey) selectGod(godKey);
    });
  });
  
  console.log("🚀 Ready!");
});

function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  document.querySelector(`.god-chip[data-god="${godKey}"]`)?.classList.add('active');
  
  godImage.src = god.image;
  hologramGod.classList.add('visible');
  showReaction(`🙏 ${god.name}`);
  
  if (god.color) {
    document.documentElement.style.setProperty('--primary', god.color);
  }
}

async function handleSend() {
  const query = queryInput?.value?.trim();
  if (!query) return;
  
  godResponse.innerHTML = '✨ <em>Divine wisdom aa rahi hai...</em>';
  responseArea.classList.add('show');
  queryInput.disabled = true;
  sendBtn.disabled = true;
  
  try {
    // Step 1: Get reply from Groq
    const chatResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        system_prompt: GODS[currentGod].prompt
      })
    });
    
    const chatData = await chatResponse.json();
    const reply = chatData.reply;
    godResponse.textContent = reply;
    
    // Step 2: Speak with ElevenLabs
    await speakWithElevenLabs(reply);
    
  } catch (error) {
    console.error("❌ Error:", error);
    godResponse.textContent = `⚠️ Error: ${error.message}`;
  } finally {
    queryInput.disabled = false;
    sendBtn.disabled = false;
    queryInput.value = '';
    queryInput.focus();
  }
}

// ✅ ELEVENLABS TTS + ANIMATION
async function speakWithElevenLabs(text) {
  const god = GODS[currentGod];
  
  try {
    console.log("🎤 Requesting ElevenLabs TTS...");
    showReaction("🔊 Bol rahe hain...");
    
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        voice_id: god.elevenlabsVoice
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ ElevenLabs audio received");
    
    // Start animation
    startTalkingAnimation();
    
    // Play audio
    const audio = new Audio(data.audio);
    audio.volume = 0.9;
    
    audio.onended = () => {
      console.log("🔊 Audio ended");
      stopTalkingAnimation();
      showReaction("✨ Aashirwaad");
    };
    
    audio.onerror = (e) => {
      console.error("❌ Audio error:", e);
      stopTalkingAnimation();
    };
    
    await audio.play();
    
  } catch (error) {
    console.error("❌ ElevenLabs error:", error);
    showReaction(`⚠️ ${error.message}`);
    stopTalkingAnimation();
    
    // Fallback to browser TTS
    fallbackSpeak(text);
  }
}

function fallbackSpeak(text) {
  if (!window.speechSynthesis) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.75;
  utterance.pitch = 0.95;
  
  utterance.onstart = () => startTalkingAnimation();
  utterance.onend = () => stopTalkingAnimation();
  
  window.speechSynthesis.speak(utterance);
}

function startTalkingAnimation() {
  console.log("🎬 Animation started");
  hologramGod.classList.add('talking');
}

function stopTalkingAnimation() {
  console.log("🎬 Animation stopped");
  hologramGod.classList.remove('talking');
}

function showReaction(text) {
  if (reactionBubble) {
    reactionBubble.textContent = text;
    reactionBubble.classList.add('show');
    setTimeout(() => reactionBubble.classList.remove('show'), 3000);
  }
}
