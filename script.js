// GODS Configuration with ONLINE Placeholder Images
const GODS = {
  generic: {
    name: 'Cosmic Guide',
    image: 'https://via.placeholder.com/200x280/1a1a3a/ffd700?text=Cosmic',
    prompt: 'You are a wise cosmic guide. Answer in short, spiritual Hindi.',
    color: '#ffd700'
  },
  shiva: {
    name: 'Lord Shiva',
    image: 'https://via.placeholder.com/200x280/2c3e50/ffffff?text=Om+Namah+Shivay',
    prompt: 'You are Lord Shiva. Answer calmly in Hindi with blessings. Use "Har Har Mahadev".',
    color: '#4ecdc4'
  },
  vishnu: {
    name: 'Lord Vishnu',
    image: 'https://via.placeholder.com/200x280/2980b9/ffffff?text=Om+Namo+Narayan',
    prompt: 'You are Lord Vishnu. Answer with compassion and dharma in Hindi.',
    color: '#3498db'
  },
  durga: {
    name: 'Maa Durga',
    image: 'https://via.placeholder.com/200x280/c0392b/ffffff?text=Jay+Mata+Di',
    prompt: 'You are Maa Durga. Answer with strength and protection in Hindi.',
    color: '#e74c3c'
  },
  ganesh: {
    name: 'Lord Ganesh',
    image: 'https://via.placeholder.com/200x280/f39c12/ffffff?text=Om+Gan+Ganpataye',
    prompt: 'You are Lord Ganesh. Answer with wisdom and remove obstacles in Hindi.',
    color: '#f1c40f'
  }
};

let currentGod = 'generic';
let recognition;
let synth = window.speechSynthesis;
let bgMusic = document.getElementById('bg-music');

// DOM Elements
const queryInput = document.getElementById('user-query');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const voiceStatus = document.getElementById('voice-status');
const voiceText = document.getElementById('voice-text');
const responseArea = document.getElementById('response-area');
const godResponse = document.getElementById('god-response');
const hologramGod = document.getElementById('hologram-god');
const godImage = document.getElementById('god-image');
const reactionBubble = document.getElementById('reaction-bubble');

// --- 1. God Selection Logic ---
function selectGod(godKey) {
  currentGod = godKey;
  const god = GODS[godKey];
  
  // Update UI Chips
  document.querySelectorAll('.god-chip').forEach(chip => chip.classList.remove('active'));
  event.target.classList.add('active');
  
  // Show God with Animation
  godImage.src = god.image;
  hologramGod.classList.add('visible');
  showReaction(`🙏 ${god.name}`);
  
  // Change Theme Color
  document.documentElement.style.setProperty('--primary', god.color);
}

function showReaction(text) {
  reactionBubble.textContent = text;
  reactionBubble.classList.add('show');
  setTimeout(() => reactionBubble.classList.remove('show'), 2500);
}

// --- 2. Typing & Sending Logic ---
sendBtn.addEventListener('click', handleSend);
queryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

async function handleSend() {
  const query = queryInput.value.trim();
  if (!query) return;
  
  // Show loading
  godResponse.innerHTML = '<i class="fas fa-sparkles"></i> Divine wisdom aa rahi hai...';
  responseArea.classList.add('show');
  queryInput.disabled = true;
  sendBtn.disabled = true;
  
  try {
    const reply = await fetchAIResponse(query, GODS[currentGod].prompt);
    godResponse.textContent = reply;
    showReaction("✨ Aashirwaad");
    
    // Auto-speak toggle (optional)
    // speakText(reply);
    
  } catch (error) {
    godResponse.textContent = "Kshama karein, connection mein samasya hai. 🙏";
    console.error("API Error:", error);
  } finally {
    queryInput.disabled = false;
    sendBtn.disabled = false;
    queryInput.value = '';
    queryInput.focus();
  }
}

// --- 3. API Call to Flask Backend ---
async function fetchAIResponse(message, systemPrompt) {
  // Relative path use karein taaki Render par kaam kare
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: message, 
      system_prompt: systemPrompt 
    })
  });
  
  if (!response.ok) throw new Error('Network error');
  const data = await response.json();
  return data.reply;
}

// --- 4. Voice Recognition (Web Speech API) ---
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.continuous = false;
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    queryInput.value = transcript;
    handleSend(); // Auto-send after voice
  };
  
  recognition.onend = () => {
    voiceStatus.classList.remove('show');
    voiceBtn.classList.remove('listening');
    voiceText.textContent = 'Sunna';
  };
}

voiceBtn.addEventListener('click', () => {
  if (!recognition) {
    alert('Voice not supported in this browser');
    return;
  }
  
  if (voiceBtn.classList.contains('listening')) {
    recognition.stop();
  } else {
    voiceStatus.classList.add('show');
    voiceBtn.classList.add('listening');
    voiceText.textContent = 'Rukiye...';
    recognition.start();
  }
});

// --- 5. Text-to-Speech ---
document.getElementById('speak-response').addEventListener('click', () => {
  const text = godResponse.textContent;
  if (synth.speaking) synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.9;
  synth.speak(utterance);
});

// --- 6. Background Music ---
const musicFiles = {
  'cosmic': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Demo music
  'shiva': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'vishnu': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
};

let isMusicPlaying = false;
document.getElementById('toggle-music').addEventListener('click', () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    document.getElementById('music-text').textContent = 'OFF';
  } else {
    const selected = document.getElementById('music-select').value;
    bgMusic.src = musicFiles[selected] || musicFiles['cosmic'];
    bgMusic.volume = 0.4;
    bgMusic.play().catch(e => console.log("Audio play blocked:", e));
    document.getElementById('music-text').textContent = 'ON';
  }
  isMusicPlaying = !isMusicPlaying;
});

document.getElementById('music-select').addEventListener('change', (e) => {
  if (isMusicPlaying) {
    bgMusic.src = musicFiles[e.target.value] || musicFiles['cosmic'];
    bgMusic.play();
  }
});

// --- 7. Three.js Universe Background ---
function initUniverse() {
  const container = document.getElementById('universe-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  // Stars
  const stars = new THREE.BufferGeometry();
  const count = 1500;
  const positions = new Float32Array(count * 3);
  for(let i=0; i<count*3; i+=3) {
    positions[i] = (Math.random()-0.5) * 2000;
    positions[i+1] = (Math.random()-0.5) * 2000;
    positions[i+2] = (Math.random()-0.5) * 2000;
  }
  stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.8 });
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
}

// Initialize on load
if (typeof THREE !== 'undefined') initUniverse();
