console.log("✅ Divine AI Loaded - ElevenLabs + Talking Animation!");

const GODS = {
  generic: {
    name: 'Cosmic Guide',
    image: 'assets/gods/ganesh.png',
    prompt: 'You are a wise cosmic divine guide. Answer in spiritual Hindi.',
    color: '#ffd700',
    music: 'cosmic',
    elevenlabsVoice: '21m00Tcm4TlvDq8ikWAM'  // Rachel
  },
  shiva: {
    name: 'Lord Shiva (Mahadev)',
    image: 'assets/gods/shiva.png',
    prompt: 'You are Lord Shiva. Answer in Hindi with "Har Har Mahadev".',
    color: '#4ecdc4',
    music: 'shiva',
    elevenlabsVoice: 'pNInz6obpgDQGcFmaJgB'  // Adam (deep male)
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: 'assets/gods/vishnu.png',
    prompt: 'You are Lord Vishnu. Answer with compassion in Hindi.',
    color: '#3498db',
    music: 'vishnu',
    elevenlabsVoice: 'AZnzlk1XvdvUeBnXmlld'  // Dome (calm male)
  },
  durga: {
    name: 'Maa Durga',
    image: 'assets/gods/durga.png',
    prompt: 'You are Maa Durga. Answer with strength. Use "Jay Mata Di".',
    color: '#e74c3c',
    music: 'durga',
    elevenlabsVoice: 'EXAVITQu4vr4xnSDxMaL'  // Bella (strong female)
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: 'assets/gods/ganesh.png',
    prompt: 'You are Lord Ganesh. Answer with wisdom. Use "Om Gan Ganpataye".',
    color: '#f1c40f',
    music: 'ganesh',
    elevenlabsVoice: 'MF3mGyEYCl7XYWbV9V6O'  // Elli (warm female)
  },
  krishna: {
    name: 'Shri Krishna',
    image: 'assets/gods/krishna.png',
    prompt: 'You are Lord Krishna. Answer in sweet Hindi. Use "Radhe Radhe".',
    color: '#fbbf24',
    music: 'krishna',
    elevenlabsVoice: 'TxGEqnHWrfWFTfGW9XjX'  // Josh (playful male)
  }
};

const FALLBACK_IMAGES = {
  generic: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%231a1a3a" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23ffd700" font-size="60">🌌</text></svg>',
  shiva: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%232c3e50" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%234ecdc4" font-size="60">🕉️</text></svg>',
  vishnu: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%232980b9" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="60">🪷</text></svg>',
  durga: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%23c0392b" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="60">🦁</text></svg>',
  ganesh: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%23f39c12" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="60">🐘</text></svg>',
  krishna: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300"><rect fill="%231e3a8a" width="220" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23fbbf24" font-size="60">🦚</text></svg>'
};

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
let currentAudio = null;

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
  
  setupVoice();
  setupMusic();
  initUniverse();
  
  console.log("🚀 Divine AI Ready!");
});

function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  const activeChip = document.querySelector(`.god-chip[data-god="${godKey}"]`);
  if (activeChip) activeChip.classList.add('active');
  
  console.log(`🖼️ Loading: ${god.name}`);
  
  godImage.src = god.image;
  godImage.onerror = () => {
    console.warn(`⚠️ Image failed: ${godKey}`);
    godImage.src = FALLBACK_IMAGES[godKey];
  };
  
  hologramGod.classList.remove('visible');
  setTimeout(() => hologramGod.classList.add('visible'), 50);
  
  hologramGod.classList.remove('krishna-active', 'shiva-active', 'talking');
  if (godKey === 'krishna') {
    hologramGod.classList.add('krishna-active');
  } else if (godKey === 'shiva') {
    hologramGod.classList.add('shiva-active');
  }
  
  showReaction(`🙏 ${god.name}`);
  if (god.color) {
    document.documentElement.style.setProperty('--primary', god.color);
  }
  
  if (god.music) {
    changeMusic(god.music);
  }
  
  console.log(`✅ God: ${god.name}`);
}

// ✅ TALKING ANIMATION START
function startTalkingAnimation() {
  console.log("🎬 Talking animation started");
  hologramGod.classList.add('talking');
  
  // Add mouth movement
  if (!document.getElementById('mouth-overlay')) {
    const mouth = document.createElement('div');
    mouth.id = 'mouth-overlay';
    mouth.style.cssText = `
      position: absolute;
      bottom: 25%;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 15px;
      background: rgba(255, 200, 150, 0.8);
      border-radius: 0 0 20px 20px;
      animation: mouthMove 0.3s ease-in-out infinite;
      z-index: 20;
      pointer-events: none;
    `;
    hologramGod.appendChild(mouth);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes mouthMove {
        0%, 100% { height: 10px; border-radius: 0 0 15px 15px; }
        50% { height: 25px; border-radius: 0 0 25px 25px; }
      }
      #hologram-god.talking #god-image {
        animation: hologram-float 4s ease-in-out infinite, headBob 0.5s ease-in-out infinite;
      }
      @keyframes headBob {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-3px) rotate(0.5deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ✅ TALKING ANIMATION STOP
function stopTalkingAnimation() {
  console.log("🎬 Talking animation stopped");
  hologramGod.classList.remove('talking');
  const mouth = document.getElementById('mouth-overlay');
  if (mouth) mouth.remove();
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
      throw new Error(`ElevenLabs error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ ElevenLabs audio received");
    
    // Start talking animation
    startTalkingAnimation();
    
    // Play audio
    currentAudio = new Audio(data.audio);
    currentAudio.volume = 0.9;
    
    currentAudio.onplay = () => {
      console.log("🔊 Playing divine voice...");
    };
    
    currentAudio.onended = () => {
      console.log("🔊 Audio ended");
      stopTalkingAnimation();
      showReaction("✨ Aashirwaad");
    };
    
    currentAudio.onerror = (e) => {
      console.error("❌ Audio error:", e);
      stopTalkingAnimation();
    };
    
    await currentAudio.play();
    
  } catch (error) {
    console.error("❌ ElevenLabs error:", error);
    showReaction("⚠️ Voice error");
    stopTalkingAnimation();
    
    // Fallback to browser TTS
    fallbackSpeak(text);
  }
}

// Fallback to browser TTS
function fallbackSpeak(text) {
  if (!synth || !text) return;
  if (synth.speaking) synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.75;
  utterance.pitch = 0.95;
  utterance.volume = 0.9;
  
  utterance.onstart = () => startTalkingAnimation();
  utterance.onend = () => stopTalkingAnimation();
  
  synth.speak(utterance);
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
    
    // Speak with ElevenLabs + Animation
    await speakWithElevenLabs(reply);
    
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

function changeMusic(musicKey) {
  if (!bgMusic) return;
  
  const newMusicUrl = MUSIC_FILES[musicKey] || MUSIC_FILES['cosmic'];
  
  if (currentMusicTrack === musicKey && !bgMusic.paused) return;
  
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
