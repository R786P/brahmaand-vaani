// ============================================
// 🕉️ BRAHMAAND VAANI - With HF Video Support
// ✅ Video (if available) + CSS Animation (fallback)
// ============================================

console.log("✅ Divine AI Loaded - HF Video + ElevenLabs Ready!");

const GODS = {
  shiva: {
    name: 'Lord Shiva (Mahadev)',
    image: '/assets/gods/shiva.png',
    prompt: 'You are Lord Shiva. Answer in Hindi with spiritual wisdom. Use "Har Har Mahadev" occasionally.',
    color: '#4ecdc4',
    voice: 'pNInz6obpgDQGcFmaJgB'
  },
  krishna: {
    name: 'Shri Krishna',
    image: '/assets/gods/krishna.png',
    prompt: 'You are Lord Krishna. Answer in sweet Hindi. Use "Radhe Radhe" occasionally.',
    color: '#fbbf24',
    voice: 'TxGEqnHWrfWFTfGW9XjX'
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: '/assets/gods/vishnu.png',
    prompt: 'You are Lord Vishnu. Answer with compassion in Hindi.',
    color: '#3498db',
    voice: 'AZnzlk1XvdvUeBnXmlld'
  },
  durga: {
    name: 'Maa Durga',
    image: '/assets/gods/durga.png',
    prompt: 'You are Maa Durga. Answer with strength. Use "Jay Mata Di".',
    color: '#e74c3c',
    voice: 'EXAVITQu4vr4xnSDxMaL'
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: '/assets/gods/ganesh.png',
    prompt: 'You are Lord Ganesh. Answer with wisdom. Use "Om Gan Ganpataye".',
    color: '#f1c40f',
    voice: 'MF3mGyEYCl7XYWbV9V6O'
  },
  generic: {
    name: 'Cosmic Guide',
    image: '/assets/gods/cosmic.png',
    prompt: 'You are a wise cosmic divine guide.',
    color: '#ffd700',
    voice: '21m00Tcm4TlvDq8ikWAM'
  }
};

let currentGod = 'generic';
let isListening = false;
let recognition = null;
let currentAudio = null;
let currentVideo = null;

let queryInput, sendBtn, responseArea, godResponse, hologramGod, godImage, reactionBubble, voiceBtn, voiceText, voiceStatus, speakBtn, musicToggle, musicText, musicSelect, bgMusic, godVideo;

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
  godVideo = document.getElementById('god-video');
  
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
  
  initVoiceRecognition();
  initMusicControls();
  selectGod(currentGod);
  
  console.log("🚀 Brahmaand Vaani Ready! 🕉️");
});

function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  document.querySelector(`.god-chip[data-god="${godKey}"]`)?.classList.add('active');
  
  if (godImage) {
    godImage.src = god.image;
    godImage.alt = god.name;
    godImage.style.display = 'block';
  }
  if (godVideo) {
    godVideo.style.display = 'none';
    godVideo.src = '';
  }
  if (hologramGod) {
    hologramGod.classList.remove('visible', 'krishna-active', 'shiva-active', 'talking');
    void hologramGod.offsetWidth;
    hologramGod.classList.add('visible');
    applyGodEffect(godKey);
  }
  
  showReaction(`🙏 ${god.name}`);
  
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

async function handleSend() {
  const query = queryInput?.value?.trim();
  if (!query) return;
  
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
    
    if (!chatResponse.ok) throw new Error(`Chat API error: ${chatResponse.status}`);
    
    const chatData = await chatResponse.json();
    const reply = chatData.reply || "Kuch gadbad ho gayi.";
    
    godResponse.innerHTML = `<em>${god.name}:</em><br><br>${formatReply(reply)}`;
    
    // Step 2: Generate Talking Head (Video + Audio)
    await generateTalkingHead(reply, god);
    
  } catch (error) {
    console.error("❌ Error:", error);
    godResponse.textContent = `⚠️ Error: ${error.message}`;
    showReaction("⚠️ Kuch gadbad ho gayi");
  } finally {
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
  return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

async function generateTalkingHead(text, god) {
  showReaction("🎬 Processing...");
  
  try {
    const response = await fetch('/api/talking-head', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        image_path: god.image,
        voice_id: god.voice
      })
    });
    
    const data = await response.json();
    
    if (data.video && !data.use_css_animation) {
      // ✅ Play Real Video (HF Lip-Sync)
      console.log("🎥 Playing HF Video");
      playVideo(data.video);
    } else if (data.audio) {
      // ⚠️ Fallback: Audio + CSS Animation
      console.log("🔊 Playing Audio + CSS Animation");
      playAudioWithAnimation(data.audio);
    } else {
      throw new Error("No audio or video received");
    }
    
  } catch (error) {
    console.error("❌ Talking Head Error:", error);
    showReaction("⚠️ Using fallback animation");
    // Last fallback - just show text
  }
}

function playVideo(videoUrl) {
  if (!godVideo || !hologramGod || !godImage) return;
  
  // Hide image, show video
  godImage.style.display = 'none';
  godVideo.style.display = 'block';
  godVideo.src = videoUrl;
  
  hologramGod.classList.add('visible');
  showReaction("🎬 Playing video...");
  
  godVideo.onended = () => {
    godVideo.style.display = 'none';
    godVideo.src = '';
    godImage.style.display = 'block';
    showReaction("✨ Aashirwaad");
  };
  
  godVideo.onerror = () => {
    console.error("❌ Video playback error");
    godVideo.style.display = 'none';
    godImage.style.display = 'block';
    showReaction("⚠️ Video error");
  };
  
  godVideo.play().catch(e => console.error("Play error:", e));
}

function playAudioWithAnimation(audioBase64) {
  if (!hologramGod) return;
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  const audio = new Audio(audioBase64);
  currentAudio = audio;
  audio.volume = 0.9;
  
  // Start CSS talking animation
  hologramGod.classList.add('talking');
  showReaction("🔊 Bol rahe hain...");
  
  audio.onended = () => {
    hologramGod.classList.remove('talking');
    showReaction("✨ Aashirwaad");
    currentAudio = null;
  };
  
  audio.onerror = () => {
    hologramGod.classList.remove('talking');
    showReaction("⚠️ Audio error");
    currentAudio = null;
  };
  
  audio.play().catch(e => console.error("Audio play error:", e));
}

async function speakLastResponse() {
  if (!godResponse) return;
  const text = godResponse.textContent.replace(/^[^:]+:\s*/, '').trim();
  if (text) {
    const god = GODS[currentGod];
    await generateTalkingHead(text, god);
  }
}

function initVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    if (voiceBtn) voiceBtn.style.display = 'none';
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  
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
    if (queryInput) queryInput.value = transcript;
  };
  
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    isListening = false;
    if (voiceBtn) voiceBtn.classList.remove('listening');
    if (voiceText) voiceText.textContent = 'Sunna';
    if (voiceStatus) voiceStatus.classList.remove('show');
  };
  
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (!recognition) return;
      if (isListening) recognition.stop();
      else recognition.start();
    });
  }
}

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
      } catch (e) {
        isPlaying = false;
      }
    } else {
      bgMusic.pause();
      if (musicText) musicText.textContent = 'OFF';
      musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i> OFF';
    }
  });
}

console.log("✅ All systems initialized - Har Har Mahadev! 🕉️");
