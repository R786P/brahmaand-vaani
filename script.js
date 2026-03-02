console.log("✅ Divine AI Loaded - TV Serial Style!");

// 🎬 TV Serial & Animated Movie Style God Images
const GODS = {
  generic: {
    name: 'Cosmic Guide',
    image: 'https://cdn.pixabay.com/photo/2023/08/07/07/34/ai-generated-8175065_1280.png',
    prompt: 'You are a wise cosmic divine guide. Answer in spiritual Hindi with blessings.',
    color: '#ffd700'
  },
  shiva: {
    name: 'Lord Shiva',
    image: 'https://i.pinimg.com/736x/87/5c/67/875c67c7e5c5f5e5d5e5f5e5d5e5f5e5.jpg',
    prompt: 'You are Lord Shiva from Devon Ke Dev Mahadev. Calm, powerful, wise. Answer in Hindi with "Har Har Mahadev" blessings.',
    color: '#4ecdc4'
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: 'https://i.pinimg.com/736x/23/4d/5e/234d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg',
    prompt: 'You are Lord Vishnu - protector of dharma. Answer with compassion and wisdom in Hindi.',
    color: '#3498db'
  },
  durga: {
    name: 'Maa Durga',
    image: 'https://i.pinimg.com/736x/34/5e/6f/345e6f7a8b9c0d1e2f3a4b5c6d7e8f9a.jpg',
    prompt: 'You are Maa Durga - fierce and protective mother goddess. Answer with strength and courage in Hindi. Use "Jay Mata Di".',
    color: '#e74c3c'
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: 'https://i.pinimg.com/736x/45/6f/7a/456f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg',
    prompt: 'You are Lord Ganesh - remover of obstacles. Answer with wisdom and positivity in Hindi. Use "Om Gan Ganpataye Namah".',
    color: '#f1c40f'
  },
  // 🦚 Krishna - Favorite God!
  krishna: {
    name: 'Shri Krishna',
    image: 'https://i.pinimg.com/736x/56/7a/8b/567a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg',
    prompt: 'You are Lord Krishna from Little Krishna animated series and TV serials. Playful, wise, full of love. Answer in sweet Hindi with Gita wisdom. Use "Radhe Radhe" as blessing.',
    color: '#fbbf24'
  }
};

// Fallback images agar upar wale load na ho
const FALLBACK_IMAGES = {
  generic: 'https://via.placeholder.com/220x300/1a1a3a/ffd700?text=Cosmic+Guide',
  shiva: 'https://via.placeholder.com/220x300/2c3e50/ffffff?text=Om+Namah+Shivay',
  vishnu: 'https://via.placeholder.com/220x300/2980b9/ffffff?text=Om+Namo+Narayan',
  durga: 'https://via.placeholder.com/220x300/c0392b/ffffff?text=Jay+Mata+Di',
  ganesh: 'https://via.placeholder.com/220x300/f39c12/ffffff?text=Om+Gan+Ganpataye',
  krishna: 'https://via.placeholder.com/220x300/1e3a8a/fbbf24?text=Radhe+Radhe+🦚'
};

let currentGod = 'generic';
let recognition;
let synth = window.speechSynthesis;
let queryInput, sendBtn, voiceBtn, voiceStatus, responseArea, godResponse, hologramGod, godImage, reactionBubble;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("🔍 DOM Loaded - Initializing Divine AI...");
  
  // Get all elements
  queryInput = document.getElementById('user-query');
  sendBtn = document.getElementById('send-btn');
  voiceBtn = document.getElementById('voice-btn');
  voiceStatus = document.getElementById('voice-status');
  responseArea = document.getElementById('response-area');
  godResponse = document.getElementById('god-response');
  hologramGod = document.getElementById('hologram-god');
  godImage = document.getElementById('god-image');
  reactionBubble = document.getElementById('reaction-bubble');
  
  // Error check
  if (!queryInput || !sendBtn) {
    console.error("❌ Critical elements not found!");
    alert("⚠️ Page load error. Please refresh.");
    return;
  }
  console.log("✅ All elements found!");
  
  // Event Listeners
  sendBtn.addEventListener('click', handleSend);
  queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log("⌨️ Enter pressed");
      handleSend();
    }
  });
  
  // God chips click handler
  document.querySelectorAll('.god-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const godKey = e.target.dataset.god;
      if (godKey) {
        console.log(`🎭 God chip clicked: ${godKey}`);
        selectGod(godKey);
      }
    });
  });
  
  // Initialize voice
  setupVoice();
  
  // Initialize Three.js universe
  initUniverse();
  
  console.log("🚀 Divine AI Ready! Type or speak your question.");
});

// Select God Function
function selectGod(godKey) {
  console.log(`🎭 Selecting God: ${godKey}`);
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  // Update active chip
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  const activeChip = document.querySelector(`.god-chip[data-god="${godKey}"]`);
  if (activeChip) activeChip.classList.add('active');
  
  // Set image with fallback
  godImage.src = god.image;
  godImage.onerror = () => {
    console.warn(`⚠️ Image failed, using fallback for ${godKey}`);
    godImage.src = FALLBACK_IMAGES[godKey];
  };
  
  // Show hologram with animation
  hologramGod.classList.remove('visible');
  setTimeout(() => hologramGod.classList.add('visible'), 50);
  
  // Special effects per god
  hologramGod.classList.remove('krishna-active', 'shiva-active');
  if (godKey === 'krishna') {
    hologramGod.classList.add('krishna-active');
    // Add peacock particles
    document.querySelectorAll('.particle').forEach((p, i) => {
      if (i % 3 === 0) p.classList.add('krishna');
    });
  } else if (godKey === 'shiva') {
    hologramGod.classList.add('shiva-active');
  }
  
  // Show reaction
  showReaction(`🙏 ${god.name}`);
  
  // Change theme color
  if (god.color) {
    document.documentElement.style.setProperty('--primary', god.color);
  }
  
  console.log(`✅ God ${god.name} activated!`);
}

// Show Reaction Bubble
function showReaction(text) {
  if (reactionBubble) {
    reactionBubble.textContent = text;
    reactionBubble.classList.add('show');
    setTimeout(() => reactionBubble.classList.remove('show'), 2500);
  }
}

// Handle Send Query
async function handleSend() {
  console.log("📤 handleSend called");
  
  const query = queryInput?.value?.trim();
  if (!query) {
    console.warn("⚠️ Empty query");
    queryInput?.focus();
    return;
  }
  
  console.log(`💬 User Query: "${query}"`);
  
  // Show loading state
  if (godResponse) godResponse.innerHTML = '✨ <em>Divine wisdom aa rahi hai...</em>';
  if (responseArea) responseArea.classList.add('show');
  if (queryInput) queryInput.disabled = true;
  if (sendBtn) sendBtn.disabled = true;
  
  try {
    console.log("🔄 Calling API: /api/chat");
    const reply = await fetchAIResponse(query, GODS[currentGod]?.prompt || '');
    console.log("✅ Reply received:", reply.substring(0, 100) + "...");
    
    if (godResponse) godResponse.textContent = reply;
    showReaction("✨ Aashirwaad");
    
  } catch (error) {
    console.error("❌ API Error:", error);
    if (godResponse) {
      godResponse.textContent = `⚠️ Connection error: ${error.message}. Check console.`;
    }
    alert(`❌ Error: ${error.message}\n\n1. Check Render logs\n2. Check browser console (F12)`);
  } finally {
    if (queryInput) {
      queryInput.disabled = false;
      queryInput.value = '';
      queryInput.focus();
    }
    if (sendBtn) sendBtn.disabled = false;
    console.log("🔄 Reset complete");
  }
}

// Fetch AI Response from Backend
async function fetchAIResponse(message, systemPrompt) {
  const apiUrl = '/api/chat';
  console.log(`🌐 Fetching: ${apiUrl}`);
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: message, 
      system_prompt: systemPrompt 
    })
  });
  
  console.log(`📡 Response Status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  return data.reply || "Koi reply nahi aaya.";
}

// Voice Recognition Setup
function setupVoice() {
  if ('webkitSpeechRecognition' in window) {
    console.log("🎤 Voice recognition supported");
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`🗣️ Voice input: "${transcript}"`);
      if (queryInput) queryInput.value = transcript;
      handleSend();
    };
    
    recognition.onend = () => {
      console.log("🎤 Voice recognition ended");
      if (voiceStatus) voiceStatus.classList.remove('show');
      if (voiceBtn) {
        voiceBtn.classList.remove('listening');
        const vt = voiceBtn.querySelector('#voice-text');
        if (vt) vt.textContent = 'Sunna';
      }
    };
    
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        console.log("🎤 Voice button clicked");
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
  } else {
    console.warn("⚠️ Voice recognition not supported");
    if (voiceBtn) voiceBtn.disabled = true;
  }
}

// Text-to-Speech
if (document.getElementById('speak-response')) {
  document.getElementById('speak-response').addEventListener('click', () => {
    const text = godResponse?.textContent;
    if (!text || synth.speaking) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    synth.speak(utterance);
    console.log("🔊 Speaking response");
  });
}

// Background Music
const musicFiles = {
  'cosmic': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'shiva': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'vishnu': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'krishna': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'durga': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'
};

let isMusicPlaying = false;
const toggleMusicBtn = document.getElementById('toggle-music');
const musicSelect = document.getElementById('music-select');
const bgMusic = document.getElementById('bg-music');

if (toggleMusicBtn) {
  toggleMusicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
      bgMusic.pause();
      document.getElementById('music-text').textContent = 'OFF';
    } else {
      const selected = musicSelect?.value || 'cosmic';
      bgMusic.src = musicFiles[selected] || musicFiles['cosmic'];
      bgMusic.volume = 0.4;
      bgMusic.play().catch(e => console.log("Audio play blocked:", e));
      document.getElementById('music-text').textContent = 'ON';
    }
    isMusicPlaying = !isMusicPlaying;
  });
}

if (musicSelect) {
  musicSelect.addEventListener('change', (e) => {
    if (isMusicPlaying && bgMusic) {
      bgMusic.src = musicFiles[e.target.value] || musicFiles['cosmic'];
      bgMusic.play();
    }
  });
}

// Three.js Universe Background
function initUniverse() {
  if (typeof THREE === 'undefined') {
    console.warn("⚠️ Three.js not loaded");
    return;
  }
  
  console.log("🌌 Initializing Three.js Universe...");
  const container = document.getElementById('universe-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  // Stars
  const stars = new THREE.BufferGeometry();
  const count = 2000;
  const positions = new Float32Array(count * 3);
  for(let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 2000;
    positions[i+1] = (Math.random() - 0.5) * 2000;
    positions[i+2] = (Math.random() - 0.5) * 2000;
  }
  stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 1.5, 
    transparent: true, 
    opacity: 0.9 
  });
  const starField = new THREE.Points(stars, material);
  scene.add(starField);
  
  camera.position.z = 500;
  
  function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0003;
    starField.rotation.x += 0.0001;
    renderer.render(scene, camera);
  }
  animate();
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  console.log("✅ Universe initialized!");
}
