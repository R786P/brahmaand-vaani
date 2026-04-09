// ============================================
// 🕉️ BRAHMAAND VAANI - Divine AI Chat
// ✅ Local Assets + Talking Animation + ElevenLabs
// ============================================

console.log("✅ Divine AI Loaded - ElevenLabs Ready!");

// === GOD CONFIGURATION ===
const GODS = {
  shiva: {
    name: 'Lord Shiva (Mahadev)',
    image: '/assets/gods/shiva.png',
    prompt: 'You are Lord Shiva. Answer in Hindi with spiritual wisdom. Use "Har Har Mahadev" occasionally. Keep responses concise and divine.',
    color: '#4ecdc4',
    elevenlabsVoice: 'pNInz6obpgDQGcFmaJgB' // Adam - deep, calm
  },
  krishna: {
    name: 'Shri Krishna',
    image: '/assets/gods/krishna.png',
    prompt: 'You are Lord Krishna. Answer in sweet, playful Hindi. Use "Radhe Radhe" occasionally. Share wisdom through stories and metaphors.',
    color: '#fbbf24',
    elevenlabsVoice: 'TxGEqnHWrfWFTfGW9XjX' // Josh - warm, melodic
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: '/assets/gods/vishnu.png',
    prompt: 'You are Lord Vishnu, the preserver. Answer with compassion and protection in Hindi. Use "Hari Om" occasionally.',
    color: '#3498db',
    elevenlabsVoice: 'AZnzlk1XvdvUeBnXmlld' // Doma - warm, authoritative
  },
  durga: {
    name: 'Maa Durga',
    image: '/assets/gods/durga.png',
    prompt: 'You are Maa Durga, the warrior goddess. Answer with strength and courage in Hindi. Use "Jay Mata Di" occasionally.',
    color: '#e74c3c',
    elevenlabsVoice: 'EXAVITQu4vr4xnSDxMaL' // Bella - strong, confident
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: '/assets/gods/ganesh.png',
    prompt: 'You are Lord Ganesh, the remover of obstacles. Answer with wisdom and positivity in Hindi. Use "Om Gan Ganpataye" occasionally.',
    color: '#f1c40f',
    elevenlabsVoice: 'MF3mGyEYCl7XYWbV9V6O' // Josh - friendly, wise
  },
  generic: {
    name: 'Cosmic Guide',
    image: '/assets/gods/cosmic.png',
    prompt: 'You are a wise cosmic divine guide. Answer with compassion and spiritual wisdom in Hindi.',
    color: '#ffd700',
    elevenlabsVoice: '21m00Tcm4TlvDq8ikWAM' // Rachel - neutral, clear
  }
};

// === GLOBAL VARIABLES ===
let currentGod = 'generic';
let isListening = false;
let recognition = null;
let currentAudio = null;

// DOM Elements (will be initialized)
let queryInput, sendBtn, responseArea, godResponse, hologramGod, godImage, reactionBubble, voiceBtn, voiceText, voiceStatus, speakBtn, musicToggle, musicText, musicSelect, bgMusic;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  queryInput = document.getElementById('user-query');
  sendBtn = document.getElementById('send-btn');
  responseArea = document.getElementById('response-area');
  godResponse = document.getElementById('god-response');
  hologramGod = document.getElementById('hologram-god');
  godImage = document.getElementById('god-image');
  reactionBubble = document.getElementById('reaction-bubble');
  voiceBtn = document.getElementById('voice-btn');
  voiceText = document.getElementById('voice-text');
  voiceStatus = document.getElementById('voice-status');
  speakBtn = document.getElementById('speak-response');
  musicToggle = document.getElementById('toggle-music');
  musicText = document.getElementById('music-text');
  musicSelect = document.getElementById('music-select');
  bgMusic = document.getElementById('bg-music');
  
  // Event Listeners
  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (queryInput) {
    queryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
  if (speakBtn) speakBtn.addEventListener('click', () => speakLastResponse());
  
  // God Chips
  document.querySelectorAll('.god-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const godKey = e.currentTarget.dataset.god;
      if (godKey && GODS[godKey]) selectGod(godKey);
    });
  });
  
  // Voice Recognition Setup
  initVoiceRecognition();
  
  // Music Controls
  initMusicControls();
  
  // Load initial god
  selectGod(currentGod);
  
  console.log("🚀 Brahmaand Vaani Ready! 🕉️");
});

// === GOD SELECTION ===
function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  // Update UI
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  document.querySelector(`.god-chip[data-god="${godKey}"]`)?.classList.add('active');
  
  // Update hologram image
  if (godImage) {
    godImage.src = god.image;
    godImage.alt = god.name;
    godImage.onerror = () => {
      console.warn(`⚠️ Image not found: ${god.image}`);
      godImage.src = GODS.generic.image; // Fallback
    };
  }
  
  // Show hologram
  if (hologramGod) {
    hologramGod.classList.remove('visible', 'krishna-active', 'shiva-active');
    void hologramGod.offsetWidth; // Trigger reflow
    hologramGod.classList.add('visible');
    applyGodEffect(godKey);
  }
  
  // Show reaction
  showReaction(`🙏 ${god.name}`);
  
  // Update theme color
  if (god.color) {
    document.documentElement.style.setProperty('--primary', god.color);
  }
  
  console.log(`🕉️ Selected: ${god.name}`);
}

function applyGodEffect(godKey) {
  if (!hologramGod) return;
  
  hologramGod.classList.remove('krishna-active', 'shiva-active');
  
  if (godKey === 'krishna') {
    hologramGod.classList.add('krishna-active');
    createKrishnaParticles();
  } else if (godKey === 'shiva') {
    hologramGod.classList.add('shiva-active');
  }
}

function createKrishnaParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'particle krishna';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = Math.random() * 100 + 'vh';
      p.style.animationDuration = (10 + Math.random() * 10) + 's';
      container.appendChild(p);
      setTimeout(() => p.remove(), 20000);
    }, i * 400);
  }
}

function showReaction(text) {
  if (!reactionBubble) return;
  reactionBubble.textContent = text;
  reactionBubble.classList.add('show');
  setTimeout(() => reactionBubble.classList.remove('show'), 3000);
}

// === SEND MESSAGE ===
async function handleSend() {
  const query = queryInput?.value?.trim();
  if (!query) return;
  
  // UI Updates
  godResponse.innerHTML = '✨ <em>Divine wisdom aa rahi hai...</em>';
  responseArea?.classList.add('show');
  if (queryInput) queryInput.disabled = true;
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bhej rahe...';
  }
  
  try {
    const god = GODS[currentGod];
    
    // Step 1: Get reply from Groq API
    const chatResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        system_prompt: god.prompt
      })
    });
    
    if (!chatResponse.ok) {
      throw new Error(`Chat API error: ${chatResponse.status}`);
    }
    
    const chatData = await chatResponse.json();
    const reply = chatData.reply || "Kuch gadbad ho gayi. Dobara try karein.";
    
    // Display reply
    if (godResponse) {
      godResponse.innerHTML = `<em>${god.name}:</em><br><br>${formatReply(reply)}`;
    }
    
    // Step 2: Speak with ElevenLabs (auto)
    await speakWithElevenLabs(reply);
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (godResponse) {
      godResponse.textContent = `⚠️ Error: ${error.message}`;
    }
    showReaction("⚠️ Kuch gadbad ho gayi");
  } finally {
    // Reset UI
    if (queryInput) {
      queryInput.disabled = false;
      queryInput.value = '';
      queryInput.focus();
    }
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Bhejiye';
    }
  }
}

function formatReply(text) {
  // Add basic formatting
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// === ELEVENLABS TTS + TALKING ANIMATION ===
async function speakWithElevenLabs(text) {
  const god = GODS[currentGod];
  if (!text) return;
  
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ ElevenLabs audio received");
    
    // Start talking animation BEFORE playing
    startTalkingAnimation();
    
    // Play audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    const audio = new Audio(data.audio);
    currentAudio = audio;
    audio.volume = 0.9;
    
    audio.onended = () => {
      console.log("🔊 Audio ended");
      stopTalkingAnimation();
      showReaction("✨ Aashirwaad");
      currentAudio = null;
    };
    
    audio.onerror = (e) => {
      console.error("❌ Audio error:", e);
      stopTalkingAnimation();
      showReaction("⚠️ Audio error");
      currentAudio = null;
    };
    
    await audio.play();
    
  } catch (error) {
    console.error("❌ ElevenLabs error:", error);
    stopTalkingAnimation();
    showReaction(`⚠️ ${error.message}`);
    
    // Fallback to browser TTS
    fallbackSpeak(text);
  }
}

// Speak last response manually
async function speakLastResponse() {
  if (!godResponse) return;
  const text = godResponse.textContent.replace(/^[^:]+:\s*/, '').trim();
  if (text) {
    await speakWithElevenLabs(text);
  }
}

// Fallback: Browser SpeechSynthesis
function fallbackSpeak(text) {
  if (!window.speechSynthesis || !text) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.85;
  utterance.pitch = 0.95;
  
  utterance.onstart = () => {
    startTalkingAnimation();
    showReaction("🔊 Bol rahe hain...");
  };
  
  utterance.onend = () => {
    stopTalkingAnimation();
    showReaction("✨ Aashirwaad");
  };
  
  utterance.onerror = (e) => {
    console.error("❌ SpeechSynthesis error:", e);
    stopTalkingAnimation();
  };
  
  window.speechSynthesis.speak(utterance);
}

// === TALKING ANIMATION CONTROLS ===
function startTalkingAnimation() {
  console.log("🎬 Talking animation STARTED");
  if (hologramGod) {
    hologramGod.classList.add('talking');
  }
}

function stopTalkingAnimation() {
  console.log("🎬 Talking animation STOPPED");
  if (hologramGod) {
    hologramGod.classList.remove('talking');
  }
}

// === VOICE RECOGNITION (Speech-to-Text) ===
function initVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn("⚠️ Speech recognition not supported");
    if (voiceBtn) voiceBtn.style.display = 'none';
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    isListening = true;
    if (voiceBtn) voiceBtn.classList.add('listening');
    if (voiceText) voiceText.textContent = 'Rukiye...';
    if (voiceStatus) voiceStatus.classList.add('show');
    showReaction("🎤 Sun raha hoon...");
  };
  
  recognition.onend = () => {
    isListening = false;
    if (voiceBtn) voiceBtn.classList.remove('listening');
    if (voiceText) voiceText.textContent = 'Sunna';
    if (voiceStatus) voiceStatus.classList.remove('show');
  };
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (queryInput) {
      queryInput.value = transcript;
      queryInput.focus();
    }
    console.log("🎤 Recognized:", transcript);
  };
  
  recognition.onerror = (event) => {
    console.error("❌ Speech recognition error:", event.error);
    isListening = false;
    if (voiceBtn) voiceBtn.classList.remove('listening');
    if (voiceText) voiceText.textContent = 'Sunna';
    if (voiceStatus) voiceStatus.classList.remove('show');
    showReaction("⚠️ Sunne mein error");
  };
  
  // Voice button click handler
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (!recognition) return;
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }
}

// === MUSIC CONTROLS ===
function initMusicControls() {
  if (!musicToggle || !bgMusic) return;
  
  let isPlaying = false;
  
  musicToggle.addEventListener('click', async () => {
    isPlaying = !isPlaying;
    
    if (isPlaying) {
      try {
        await bgMusic.play();
        if (musicText) musicText.textContent = 'ON';
        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i> ON';
        showReaction("🎵 Music ON");
      } catch (e) {
        console.warn("⚠️ Autoplay blocked:", e);
        isPlaying = false;
        showReaction("⚠️ Tap to play music");
      }
    } else {
      bgMusic.pause();
      if (musicText) musicText.textContent = 'OFF';
      musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i> OFF';
      showReaction("🔇 Music OFF");
    }
  });
  
  // Music selection (placeholder - add your audio files)
  if (musicSelect) {
    musicSelect.addEventListener('change', (e) => {
      const track = e.target.value;
      console.log("🎵 Switching to:", track);
      // Example: bgMusic.src = `/assets/music/${track}.mp3`;
      showReaction(`🎵 ${track} selected`);
    });
  }
}

// === UTILITY: Preload Images ===
function preloadImages() {
  Object.values(GODS).forEach(god => {
    const img = new Image();
    img.src = god.image;
    console.log(`🖼️ Preloaded: ${god.image}`);
  });
}

// Call preload after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadImages);
} else {
  preloadImages();
}

// === ERROR HANDLING: Global ===
window.addEventListener('error', (e) => {
  console.error("💥 Global error:", e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error("💥 Unhandled promise:", e.reason);
});

console.log("✅ All systems initialized - Har Har Mahadev! 🕉️");
