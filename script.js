console.log("✅ Divine AI Loaded - With Voice Selector!");

// 🎨 GODS with CLEAR, VISIBLE Images (Using reliable sources)
const GODS = {
  generic: {
    name: 'Cosmic Guide',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135793.png',
    prompt: 'You are a wise cosmic divine guide. Answer in spiritual Hindi with blessings.',
    color: '#ffd700'
  },
  shiva: {
    name: 'Lord Shiva',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
    prompt: 'You are Lord Shiva. Calm, powerful, wise. Answer in Hindi with "Har Har Mahadev" blessings.',
    color: '#4ecdc4'
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135794.png',
    prompt: 'You are Lord Vishnu - protector of dharma. Answer with compassion in Hindi.',
    color: '#3498db'
  },
  durga: {
    name: 'Maa Durga',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135791.png',
    prompt: 'You are Maa Durga - fierce and protective. Answer with strength. Use "Jay Mata Di".',
    color: '#e74c3c'
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135792.png',
    prompt: 'You are Lord Ganesh - remover of obstacles. Answer with wisdom. Use "Om Gan Ganpataye".',
    color: '#f1c40f'
  },
  krishna: {
    name: 'Shri Krishna',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135790.png',
    prompt: 'You are Lord Krishna. Playful, wise, full of love. Answer in sweet Hindi. Use "Radhe Radhe".',
    color: '#fbbf24'
  }
};

// Fallback with colored placeholders
const FALLBACK_IMAGES = {
  generic: 'https://via.placeholder.com/220x300/1a1a3a/ffd700?text=🌌+Cosmic',
  shiva: 'https://via.placeholder.com/220x300/2c3e50/4ecdc4?text=🕉️+Shiva',
  vishnu: 'https://via.placeholder.com/220x300/2980b9/ffffff?text=🪷+Vishnu',
  durga: 'https://via.placeholder.com/220x300/c0392b/ffffff?text=🦁+Durga',
  ganesh: 'https://via.placeholder.com/220x300/f39c12/ffffff?text=🐘+Ganesh',
  krishna: 'https://via.placeholder.com/220x300/1e3a8a/fbbf24?text=🦚+Krishna'
};

let currentGod = 'generic';
let recognition;
let synth = window.speechSynthesis;
let availableVoices = [];
let selectedVoiceGender = 'auto'; // 'male', 'female', or 'auto'
let queryInput, sendBtn, voiceBtn, voiceStatus, responseArea, godResponse, hologramGod, godImage, reactionBubble;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("🔍 DOM Loaded");
  
  // Get elements
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
  
  // Load voices
  loadVoices();
  
  // Event listeners
  sendBtn.addEventListener('click', handleSend);
  queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  
  // God chips
  document.querySelectorAll('.god-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const godKey = e.target.dataset.god;
      if (godKey) selectGod(godKey);
    });
  });
  
  // Voice gender selector
  const voiceGenderSelect = document.getElementById('voice-gender');
  if (voiceGenderSelect) {
    voiceGenderSelect.addEventListener('change', (e) => {
      selectedVoiceGender = e.target.value;
      console.log(`🎤 Voice gender changed to: ${selectedVoiceGender}`);
      loadVoices(); // Reload voices with new preference
    });
  }
  
  setupVoice();
  setupMusic();
  initUniverse();
  
  console.log("🚀 Divine AI Ready!");
});

// ✅ Load and Categorize Voices (Male/Female)
function loadVoices() {
  if (!synth) return;
  
  availableVoices = synth.getVoices();
  console.log(`🎤 Total voices available: ${availableVoices.length}`);
  
  // Log all voices for debugging
  availableVoices.forEach((v, i) => {
    console.log(`${i}. ${v.name} - ${v.lang} - ${v.default ? '(default)' : ''}`);
  });
  
  console.log(`🎯 Selected voice gender: ${selectedVoiceGender}`);
}

// ✅ Get Best Voice Based on Gender Preference
function getPreferredVoice() {
  if (!availableVoices.length) return null;
  
  // Filter Hindi and English-India voices
  const hindiVoices = availableVoices.filter(v => 
    v.lang === 'hi-IN' || 
    v.lang === 'hi' ||
    v.lang.includes('India') ||
    v.name.toLowerCase().includes('hindi') ||
    v.name.toLowerCase().includes('india')
  );
  
  const enInVoices = availableVoices.filter(v => 
    v.lang === 'en-IN' || v.lang.startsWith('en-IN')
  );
  
  let candidates = hindiVoices.length ? hindiVoices : enInVoices;
  if (!candidates.length) candidates = availableVoices;
  
  // If auto, return first candidate
  if (selectedVoiceGender === 'auto') {
    console.log(`🎤 Auto voice selected: ${candidates[0].name}`);
    return candidates[0];
  }
  
  // Try to find male/female voice based on name keywords
  const genderKeywords = {
    'male': ['male', 'man', 'boy', 'deep', 'low', 'aditya', 'kumar', 'raj'],
    'female': ['female', 'woman', 'girl', 'sweet', 'high', 'priya', 'kanya', 'zira']
  };
  
  const keywords = genderKeywords[selectedVoiceGender];
  
  for (const voice of candidates) {
    const voiceName = voice.name.toLowerCase();
    if (keywords.some(k => voiceName.includes(k))) {
      console.log(`🎤 ${selectedVoiceGender} voice found: ${voice.name}`);
      return voice;
    }
  }
  
  // If not found, return first candidate
  console.log(`⚠️ No ${selectedVoiceGender} voice found, using: ${candidates[0].name}`);
  return candidates[0];
}

// Select God Function
function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  // Update chips
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  const activeChip = document.querySelector(`.god-chip[data-god="${godKey}"]`);
  if (activeChip) activeChip.classList.add('active');
  
  // Set image with error handling
  godImage.src = god.image;
  godImage.onerror = () => {
    console.warn(`⚠️ Image failed for ${godKey}, using fallback`);
    godImage.src = FALLBACK_IMAGES[godKey];
    godImage.onerror = () => {
      console.error(`❌ Fallback also failed for ${godKey}`);
      godImage.src = `image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='300'%3E%3Crect fill='%23${god.color.substring(1)}' width='220' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='24'%3E${god.name}%3C/text%3E%3C/svg%3E`;
    };
  };
  
  // Show hologram
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
  
  console.log(`✅ God selected: ${god.name}`);
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

// ✅ Enhanced Text-to-Speech with Gender Selection
function speakText(text) {
  if (!synth || !text) return;
  
  if (synth.speaking) synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get preferred voice based on gender selection
  const voice = getPreferredVoice();
  if (voice) {
    utterance.voice = voice;
    console.log(`🔊 Using voice: ${voice.name} (${voice.lang})`);
  }
  
  utterance.lang = 'hi-IN';
  utterance.rate = 0.85;
  utterance.pitch = selectedVoiceGender === 'female' ? 1.1 : (selectedVoiceGender === 'male' ? 0.9 : 1.0);
  utterance.volume = 1.0;
  
  utterance.onstart = () => {
    const speakBtn = document.getElementById('speak-response');
    if (speakBtn) {
      speakBtn.innerHTML = '<i class="fas fa-volume-high"></i> Sun rahe hain...';
      speakBtn.disabled = true;
    }
  };
  
  utterance.onend = () => {
    const speakBtn = document.getElementById('speak-response');
    if (speakBtn) {
      speakBtn.innerHTML = '<i class="fas fa-volume-high"></i> Suniye';
      speakBtn.disabled = false;
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

// Load voices when they change
if (synth) {
  synth.onvoiceschanged = loadVoices;
  // Initial load
  setTimeout(loadVoices, 100);
}
