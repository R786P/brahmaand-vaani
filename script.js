console.log("✅ Divine AI Loaded - Local God Images!");

// 🎬 GOD IMAGES (Local Files from assets/gods/)
const GODS = {
  generic: {
    name: 'Cosmic Guide',
    image: 'assets/gods/ganesh.png',  // Default image
    prompt: 'You are a wise cosmic divine guide. Answer in spiritual Hindi with blessings.',
    color: '#ffd700',
    music: 'cosmic'
  },
  shiva: {
    name: 'Lord Shiva (Mahadev)',
    image: 'assets/gods/shiva.png',  // ✅ Your uploaded image
    prompt: 'You are Lord Shiva from Devon Ke Dev Mahadev. Calm, powerful, wise. Answer in Hindi with "Har Har Mahadev" blessings.',
    color: '#4ecdc4',
    music: 'shiva'
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: 'assets/gods/vishnu.png',  // ✅ Your uploaded image
    prompt: 'You are Lord Vishnu - protector of dharma. Answer with compassion in Hindi.',
    color: '#3498db',
    music: 'vishnu'
  },
  durga: {
    name: 'Maa Durga',
    image: 'assets/gods/durga.png',  // ✅ Your uploaded image
    prompt: 'You are Maa Durga - fierce and protective mother goddess. Answer with strength. Use "Jay Mata Di".',
    color: '#e74c3c',
    music: 'durga'
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: 'assets/gods/ganesh.png',  // ✅ Your uploaded image
    prompt: 'You are Lord Ganesh - remover of obstacles. Answer with wisdom. Use "Om Gan Ganpataye Namah".',
    color: '#f1c40f',
    music: 'ganesh'
  },
  krishna: {
    name: 'Shri Krishna',
    image: 'assets/gods/krishna.png',  // ✅ Your uploaded image
    prompt: 'You are Lord Krishna - playful, wise, full of love. Answer in sweet Hindi with Gita wisdom. Use "Radhe Radhe" as blessing.',
    color: '#fbbf24',
    music: 'krishna'
  }
};

// Fallback (agar local images load na ho)
const FALLBACK_IMAGES = {
  generic: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%231a1a3a" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23ffd700" font-size="60">🌌</text></svg>',
  shiva: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%232c3e50" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%234ecdc4" font-size="60">🕉️</text></svg>',
  vishnu: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%232980b9" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="60">🪷</text></svg>',
  durga: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%23c0392b" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="60">🦁</text></svg>',
  ganesh: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%23f39c12" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="60">🐘</text></svg>',
  krishna: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%231e3a8a" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23fbbf24" font-size="60">🦚</text></svg>'
};

// 🎵 MELODIOUS DEVOTIONAL MUSIC
const MUSIC_FILES = {
  cosmic: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-impulse-3000-12346.mp3',
  shiva: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=indian-flute-11392.mp3',
  vishnu: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_659021d73d.mp3?filename=peaceful-meditation-12146.mp3',
  durga: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=indian-meditation-11656.mp3',
  ganesh: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_22736f0d35.mp3?filename=indian-spiritual-11432.mp3',
  krishna: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_c697c58e84.mp3?filename=flute-11323.mp3'
};

let currentGod = 'generic';
let recognition;
let synth = window.speechSynthesis;
let availableVoices = [];
let selectedVoiceGender = 'auto';
let queryInput, sendBtn, voiceBtn, voiceStatus, responseArea, godResponse, hologramGod, godImage, reactionBubble;
let bgMusic = null;
let isMusicPlaying = false;
let currentMusicTrack = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log("🔍 DOM Loaded");
  
  queryInput = document.getElementById('user-query');
  sendBtn = document.getElementById('send-btn');
  voiceBtn = document.getElementById('voice-btn');
  voiceStatus = document.getElementById('voice-status');
  responseArea = document.getElementById('response-area');
  godResponse = document.getElementById('god-response');
  hologramGod = document.getElementById('hologram-god');
  godImage = document.getElementById('god-image');
  reactionBubble = document.getElementById('reaction-bubble');
  bgMusic = document.getElementById('bg-music');
  
  if (!queryInput || !sendBtn) {
    console.error("❌ Elements not found!");
    return;
  }
  
  loadVoices();
  
  sendBtn.addEventListener('click', handleSend);
  queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  
  document.querySelectorAll('.god-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const godKey = e.target.dataset.god;
      if (godKey) selectGod(godKey);
    });
  });
  
  const voiceGenderSelect = document.getElementById('voice-gender');
  if (voiceGenderSelect) {
    voiceGenderSelect.addEventListener('change', (e) => {
      selectedVoiceGender = e.target.value;
      loadVoices();
    });
  }
  
  setupVoice();
  setupMusic();
  initUniverse();
  
  console.log("🚀 Divine AI Ready!");
});

function loadVoices() {
  if (!synth) return;
  availableVoices = synth.getVoices();
  console.log(`🎤 Voices: ${availableVoices.length}`);
}

// ✅ DIVINE VOICE SETTINGS (Slow, Melodious, God-like)
function getPreferredVoice() {
  if (!availableVoices.length) return null;
  
  const hindiVoices = availableVoices.filter(v => 
    v.lang === 'hi-IN' || v.lang === 'hi' || 
    v.name.toLowerCase().includes('hindi') ||
    v.name.toLowerCase().includes('india')
  );
  
  const candidates = hindiVoices.length ? hindiVoices : availableVoices;
  
  if (selectedVoiceGender === 'auto') return candidates[0];
  
  const keywords = selectedVoiceGender === 'male' 
    ? ['male', 'man', 'deep', 'low', 'kumar', 'raj'] 
    : ['female', 'woman', 'sweet', 'high', 'priya', 'zira'];
  
  for (const voice of candidates) {
    if (keywords.some(k => voice.name.toLowerCase().includes(k))) {
      return voice;
    }
  }
  
  return candidates[0];
}

// ✅ DIVINE SPEECH SETTINGS
function speakText(text) {
  if (!synth || !text) return;
  if (synth.speaking) synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
  
  utterance.lang = 'hi-IN';
  
  // 🕉️ Divine Voice Settings
  utterance.rate = 0.75;      // Slower (more divine)
  utterance.pitch = 0.95;     // Deeper (god-like)
  utterance.volume = 0.9;
  
  utterance.onstart = () => {
    const btn = document.getElementById('speak-response');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-volume-high"></i> Sun rahe hain...';
      btn.disabled = true;
    }
  };
  
  utterance.onend = () => {
    const btn = document.getElementById('speak-response');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-volume-high"></i> Suniye';
      btn.disabled = false;
    }
  };
  
  synth.speak(utterance);
}

function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  const activeChip = document.querySelector(`.god-chip[data-god="${godKey}"]`);
  if (activeChip) activeChip.classList.add('active');
  
  console.log(`🖼️ Loading: ${god.name} → ${god.image}`);
  
  // Load image with fallback
  godImage.src = god.image;
  godImage.onerror = () => {
    console.warn(`⚠️ Image failed: ${god.image}`);
    godImage.src = FALLBACK_IMAGES[godKey];
  };
  
  // Show with animation
  hologramGod.classList.remove('visible');
  setTimeout(() => hologramGod.classList.add('visible'), 50);
  
  // Special effects
  hologramGod.classList.remove('krishna-active', 'shiva-active');
  if (godKey === 'krishna') {
    hologramGod.classList.add('krishna-active');
  } else if (godKey === 'shiva') {
    hologramGod.classList.add('shiva-active');
  }
  
  showReaction(`🙏 ${god.name}`);
  if (god.color) {
    document.documentElement.style.setProperty('--primary', god.color);
  }
  
  // Change Music
  if (god.music) {
    changeMusic(god.music);
  }
  
  console.log(`✅ God: ${god.name}`);
}

// ✅ SMOOTH MUSIC TRANSITION
function changeMusic(musicKey) {
  if (!bgMusic) return;
  
  const newMusicUrl = MUSIC_FILES[musicKey] || MUSIC_FILES['cosmic'];
  
  if (currentMusicTrack === musicKey && !bgMusic.paused) {
    return;
  }
  
  console.log(`🎵 Changing music to: ${musicKey}`);
  currentMusicTrack = musicKey;
  
  const fadeOut = setInterval(() => {
    if (bgMusic.volume > 0.1) {
      bgMusic.volume -= 0.1;
    } else {
      clearInterval(fadeOut);
      bgMusic.src = newMusicUrl;
      bgMusic.volume = 0;
      
      if (isMusicPlaying) {
        bgMusic.play().then(() => {
          const fadeIn = setInterval(() => {
            if (bgMusic.volume < 0.5) {
              bgMusic.volume += 0.05;
            } else {
              clearInterval(fadeIn);
            }
          }, 100);
        }).catch(e => console.log("Music blocked:", e));
      }
    }
  }, 100);
}

function showReaction(text) {
  if (reactionBubble) {
    reactionBubble.textContent = text;
    reactionBubble.classList.add('show');
    setTimeout(() => reactionBubble.classList.remove('show'), 2500);
  }
}

async function handleSend() {
  const query = queryInput?.value?.trim();
  if (!query) return;
  
  if (godResponse) godResponse.innerHTML = '✨ <em>Divine wisdom aa rahi hai...</em>';
  if (responseArea) responseArea.classList.add('show');
  if (queryInput) queryInput.disabled = true;
  if (sendBtn) sendBtn.disabled = true;
  
  try {
    const reply = await fetchAIResponse(query, GODS[currentGod]?.prompt || '');
    if (godResponse) godResponse.textContent = reply;
    showReaction("✨ Aashirwaad");
  } catch (error) {
    console.error("❌ Error:", error);
    if (godResponse) godResponse.textContent = `⚠️ Error: ${error.message}`;
  } finally {
    if (queryInput) {
      queryInput.disabled = false;
      queryInput.value = '';
      queryInput.focus();
    }
    if (sendBtn) sendBtn.disabled = false;
  }
}

async function fetchAIResponse(message, systemPrompt) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, system_prompt: systemPrompt })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Server ${response.status}: ${err}`);
  }
  
  const data = await response.json();
  return data.reply || "Koi reply nahi aaya.";
}

function setupVoice() {
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      if (queryInput) queryInput.value = t;
      handleSend();
    };
    
    recognition.onend = () => {
      if (voiceStatus) voiceStatus.classList.remove('show');
      if (voiceBtn) {
        voiceBtn.classList.remove('listening');
        const vt = voiceBtn.querySelector('#voice-text');
        if (vt) vt.textContent = 'Sunna';
      }
    };
    
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('listening')) {
          recognition.stop();
        } else {
          if (voiceStatus) voiceStatus.classList.add('show');
          voiceBtn.classList.add('listening');
          const vt = voiceBtn.querySelector('#voice-text');
          if (vt) vt.textContent = 'Rukiye...';
          recognition.start();
        }
      });
    }
  } else if (voiceBtn) {
    voiceBtn.disabled = true;
  }
}

function setupMusic() {
  const toggleBtn = document.getElementById('toggle-music');
  const musicSelect = document.getElementById('music-select');
  
  if (!bgMusic) return;
  
  let isPlaying = false;
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        const fadeOut = setInterval(() => {
          if (bgMusic.volume > 0.1) {
            bgMusic.volume -= 0.1;
          } else {
            clearInterval(fadeOut);
            bgMusic.pause();
            document.getElementById('music-text').textContent = 'OFF';
          }
        }, 100);
      } else {
        const sel = musicSelect?.value || 'cosmic';
        currentMusicTrack = sel;
        bgMusic.src = MUSIC_FILES[sel] || MUSIC_FILES['cosmic'];
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
          const fadeIn = setInterval(() => {
            if (bgMusic.volume < 0.5) {
              bgMusic.volume += 0.05;
            } else {
              clearInterval(fadeIn);
            }
          }, 100);
          document.getElementById('music-text').textContent = 'ON';
        }).catch(e => console.log("Music blocked:", e));
      }
      isPlaying = !isPlaying;
      isMusicPlaying = isPlaying;
    });
  }
  
  if (musicSelect) {
    musicSelect.addEventListener('change', (e) => {
      const sel = e.target.value;
      currentMusicTrack = sel;
      if (isPlaying) {
        changeMusic(sel);
      }
    });
  }
}

if (document.getElementById('speak-response')) {
  document.getElementById('speak-response').addEventListener('click', () => {
    const text = godResponse?.textContent;
    if (!text) return;
    speakText(text);
  });
}

function initUniverse() {
  if (typeof THREE === 'undefined') {
    console.log("🌌 Three.js not loaded");
    return;
  }
  
  const container = document.getElementById('universe-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  
  const stars = new THREE.BufferGeometry();
  const count = 500;
  const positions = new Float32Array(count * 3);
  for(let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 2000;
    positions[i+1] = (Math.random() - 0.5) * 2000;
    positions[i+2] = (Math.random() - 0.5) * 2000;
  }
  stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 })));
  
  camera.position.z = 500;
  
  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.0002;
    renderer.render(scene, camera);
  }
  animate();
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  console.log("✅ Universe initialized");
}

if (synth) {
  synth.onvoiceschanged = loadVoices;
  setTimeout(loadVoices, 100);
}
