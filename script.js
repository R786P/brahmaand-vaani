console.log("✅ Divine AI Loaded - TV Serial Style Realistic Gods!");

// 🎬 TV SERIAL STYLE REALISTIC GOD IMAGES (Your Custom Images)
const GODS = {
  generic: {
    name: 'Cosmic Guide',
    image: 'https://drive.google.com/uc?export=view&id=1bUWexdkrqPXsDDROCx9N-_4ZZzqne98Y',
    prompt: 'You are a wise cosmic divine guide. Answer in spiritual Hindi with blessings.',
    color: '#ffd700'
  },
  shiva: {
    name: 'Lord Shiva (Mahadev)',
    // ✅ Your Shiva Image - Devon Ke Dev Style
    image: 'https://drive.google.com/uc?export=view&id=1bUWexdkrqPXsDDROCx9N-_4ZZzqne98Y',
    prompt: 'You are Lord Shiva as shown in Devon Ke Dev Mahadev. Calm, powerful, wise with third eye and trishul. Answer in Hindi with "Har Har Mahadev" blessings.',
    color: '#4ecdc4'
  },
  vishnu: {
    name: 'Lord Vishnu',
    // ✅ Your Vishnu Image - TV Serial Style
    image: 'https://drive.google.com/uc?export=view&id=1Je1B-8jo3Se_M0iCfmmVz5Z5jh9GI9Zd',
    prompt: 'You are Lord Vishnu - protector of dharma with conch and discus. Answer with compassion in Hindi.',
    color: '#3498db'
  },
  durga: {
    name: 'Maa Durga',
    // ✅ Your Durga Image - Warrior Goddess
    image: 'https://drive.google.com/uc?export=view&id=1E_O2UmWeYcGZZ47wvG5qwbXZImy9wapt',
    prompt: 'You are Maa Durga - fierce and protective mother goddess with lion. Answer with strength and courage. Use "Jay Mata Di".',
    color: '#e74c3c'
  },
  ganesh: {
    name: 'Lord Ganesh',
    // ✅ Your Ganesh Image - Vighnaharta Style
    image: 'https://drive.google.com/uc?export=view&id=13SnwfSt3oMrbojnlf_MQ2RaepGYzD6R7',
    prompt: 'You are Lord Ganesh - remover of obstacles with modak. Answer with wisdom and positivity. Use "Om Gan Ganpataye Namah".',
    color: '#f1c40f'
  },
  krishna: {
    name: 'Shri Krishna',
    // ✅ Your Krishna Image - With Flute & Peacock Feather
    image: 'https://drive.google.com/uc?export=view&id=1NwMFXuxOHMp6-AgWB2ob5HR4z1NLk9qZ',
    prompt: 'You are Lord Krishna - playful, wise, full of love with flute and peacock feather. Answer in sweet Hindi with Gita wisdom. Use "Radhe Radhe" as blessing.',
    color: '#fbbf24'
  }
};

// Fallback images (agar Google Drive links kaam na karein)
const FALLBACK_IMAGES = {
  generic: 'https://via.placeholder.com/220x300/1a1a3a/ffd700?text=🌌+Cosmic+Guide',
  shiva: 'https://via.placeholder.com/220x300/2c3e50/4ecdc4?text=🕉️+Om+Namah+Shivay',
  vishnu: 'https://via.placeholder.com/220x300/2980b9/ffffff?text=🪷+Om+Namo+Narayan',
  durga: 'https://via.placeholder.com/220x300/c0392b/ffffff?text=🦁+Jay+Mata+Di',
  ganesh: 'https://via.placeholder.com/220x300/f39c12/ffffff?text=🐘+Om+Gan+Ganpataye',
  krishna: 'https://via.placeholder.com/220x300/1e3a8a/fbbf24?text=🦚+Radhe+Radhe'
};

let currentGod = 'generic';
let recognition;
let synth = window.speechSynthesis;
let availableVoices = [];
let selectedVoiceGender = 'auto';
let queryInput, sendBtn, voiceBtn, voiceStatus, responseArea, godResponse, hologramGod, godImage, reactionBubble;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("🔍 DOM Loaded - TV Serial Style Gods");
  
  queryInput = document.getElementById('user-query');
  sendBtn = document.getElementById('send-btn');
  voiceBtn = document.getElementById('voice-btn');
  voiceStatus = document.getElementById('voice-status');
  responseArea = document.getElementById('response-area');
  godResponse = document.getElementById('god-response');
  hologramGod = document.getElementById('hologram-god');
  godImage = document.getElementById('god-image');
  reactionBubble = document.getElementById('reaction-bubble');
  
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
  
  console.log("🚀 Divine AI Ready - TV Serial Style!");
});

function loadVoices() {
  if (!synth) return;
  availableVoices = synth.getVoices();
  console.log(`🎤 Voices loaded: ${availableVoices.length}`);
}

function getPreferredVoice() {
  if (!availableVoices.length) return null;
  
  const hindiVoices = availableVoices.filter(v => 
    v.lang === 'hi-IN' || v.lang === 'hi' || v.lang.includes('India')
  );
  
  const candidates = hindiVoices.length ? hindiVoices : availableVoices;
  
  if (selectedVoiceGender === 'auto') return candidates[0];
  
  const keywords = selectedVoiceGender === 'male' 
    ? ['male', 'man', 'deep', 'low'] 
    : ['female', 'woman', 'sweet', 'high'];
  
  for (const voice of candidates) {
    if (keywords.some(k => voice.name.toLowerCase().includes(k))) {
      return voice;
    }
  }
  
  return candidates[0];
}

function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  const activeChip = document.querySelector(`.god-chip[data-god="${godKey}"]`);
  if (activeChip) activeChip.classList.add('active');
  
  // Load image with fallback
  console.log(`🖼️ Loading image for ${god.name}: ${god.image}`);
  godImage.src = god.image;
  godImage.onerror = () => {
    console.warn(`⚠️ Image failed for ${godKey}, using fallback`);
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
  
  console.log(`✅ God selected: ${god.name} (TV Serial Style)`);
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

function speakText(text) {
  if (!synth || !text) return;
  if (synth.speaking) synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
  
  utterance.lang = 'hi-IN';
  utterance.rate = 0.85;
  utterance.pitch = selectedVoiceGender === 'female' ? 1.1 : (selectedVoiceGender === 'male' ? 0.9 : 1.0);
  utterance.volume = 1.0;
  
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
  const bgMusic = document.getElementById('bg-music');
  const toggleBtn = document.getElementById('toggle-music');
  const musicSelect = document.getElementById('music-select');
  
  const musicFiles = {
    'cosmic': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'shiva': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'vishnu': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'krishna': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'durga': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'
  };
  
  let isPlaying = false;
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        bgMusic.pause();
        document.getElementById('music-text').textContent = 'OFF';
      } else {
        const sel = musicSelect?.value || 'cosmic';
        bgMusic.src = musicFiles[sel] || musicFiles['cosmic'];
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log("Music blocked:", e));
        document.getElementById('music-text').textContent = 'ON';
      }
      isPlaying = !isPlaying;
    });
  }
  
  if (musicSelect) {
    musicSelect.addEventListener('change', (e) => {
      if (isPlaying && bgMusic) {
        bgMusic.src = musicFiles[e.target.value];
        bgMusic.play();
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
  if (typeof THREE === 'undefined') return;
  
  const container = document.getElementById('universe-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  
  const stars = new THREE.BufferGeometry();
  const count = 2000;
  const positions = new Float32Array(count * 3);
  for(let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 2000;
    positions[i+1] = (Math.random() - 0.5) * 2000;
    positions[i+2] = (Math.random() - 0.5) * 2000;
  }
  stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.9 })));
  
  camera.position.z = 500;
  
  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.0003;
    renderer.render(scene, camera);
  }
  animate();
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

if (synth) {
  synth.onvoiceschanged = loadVoices;
  setTimeout(loadVoices, 100);
}
