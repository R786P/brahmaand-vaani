// God personas with keywords and images
const GODS = {
  shiva: {
    keywords: ['shiva', 'mahadev', 'bholenath', 'meditation', 'destruction', 'kailash'],
    image: 'assets/gods/shiva.png',
    prompt: 'You are Lord Shiva - calm, wise, and powerful. Answer in Hindi with blessings.',
    music: 'shiva-flute'
  },
  vishnu: {
    keywords: ['vishnu', 'narayan', 'preservation', 'dharma', 'krishna', 'ram'],
    image: 'assets/gods/vishnu.png',
    prompt: 'You are Lord Vishnu - protector of dharma. Answer with compassion and wisdom in Hindi.',
    music: 'vishnu-conch'
  },
  durga: {
    keywords: ['durga', 'maa', 'shakti', 'power', 'courage', 'battle'],
    image: 'assets/gods/durga.png',
    prompt: 'You are Maa Durga - fierce and protective. Answer with strength and encouragement in Hindi.',
    music: 'durga-drum'
  },
  generic: {
    keywords: [],
    image: 'assets/gods/cosmic.png',
    prompt: 'You are a divine cosmic guide. Answer wisely in Hindi.',
    music: 'cosmic-ambient'
  }
};

let recognition;
let synth = window.speechSynthesis;
let currentGod = 'generic';
let bgMusic = document.getElementById('bg-music');

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.continuous = false;
  
  recognition.onresult = (event) => {
    const query = event.results[0][0].transcript;
    document.getElementById('user-query').value = query;
    handleQuery(query);
  };
  
  recognition.onend = () => {
    document.getElementById('voice-status').classList.add('hidden');
  };
}

// DOM Elements
const voiceBtn = document.getElementById('voice-btn');
const sendBtn = document.getElementById('send-btn');
const queryInput = document.getElementById('user-query');
const responseArea = document.getElementById('response-area');
const godResponse = document.getElementById('god-response');
const hologramGod = document.getElementById('hologram-god');
const godImage = document.getElementById('god-image');
const reactionBubble = document.getElementById('reaction-bubble');

// Voice Input Toggle
voiceBtn.addEventListener('click', () => {
  if (recognition) {
    document.getElementById('voice-status').classList.remove('hidden');
    recognition.start();
    voiceBtn.textContent = '🔴 Sun raha hoon...';
  } else {
    alert('Voice recognition not supported in this browser.');
  }
});

// Send Query
sendBtn.addEventListener('click', () => {
  const query = queryInput.value.trim();
  if (query) handleQuery(query);
});

queryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Detect God from Query
function detectGod(query) {
  const lower = query.toLowerCase();
  for (let [god, data] of Object.entries(GODS)) {
    if (data.keywords.some(k => lower.includes(k))) {
      return god;
    }
  }
  return 'generic';
}

// Show God with Hologram Effect
function showGod(godKey) {
  const god = GODS[godKey];
  godImage.src = god.image;
  hologramGod.classList.remove('hidden');
  
  // Reaction simulation
  showReaction("🙏 Sun raha hoon...");
  
  // Change background music
  changeMusic(god.music);
}

function showReaction(text) {
  reactionBubble.textContent = text;
  reactionBubble.classList.remove('hidden');
  setTimeout(() => {
    reactionBubble.classList.add('hidden');
  }, 2000);
}

// Call AI Backend (GROQ via Flask or direct)
async function getAIResponse(query, godPrompt) {
  // Option 1: Direct GROQ API (if you have API key in frontend - not recommended for prod)
  // Option 2: Flask backend (recommended)
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: query, 
      system_prompt: godPrompt 
    })
  });
  
  const data = await response.json();
  return data.reply;
}

// Handle Full Query Flow
async function handleQuery(query) {
  currentGod = detectGod(query);
  showGod(currentGod);
  
  // Show typing indicator
  godResponse.innerHTML = '<em>Divine wisdom aa rahi hai...</em>';
  responseArea.classList.remove('hidden');
  
  try {
    const reply = await getAIResponse(query, GODS[currentGod].prompt);
    godResponse.textContent = reply;
    
    // Eye contact simulation: pulse effect
    hologramGod.style.animation = 'none';
    setTimeout(() => {
      hologramGod.style.animation = 'hologram-float 3s ease-in-out infinite';
      showReaction("✨ Aashirwaad");
    }, 500);
    
  } catch (error) {
    godResponse.textContent = "Kshama karein, divine connection mein samasya hai. 🙏";
    console.error(error);
  }
}

// Text-to-Speech for Response
document.getElementById('speak-response').addEventListener('click', () => {
  const text = godResponse.textContent;
  if (synth.speaking) synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.9;
  synth.speak(utterance);
});

// Background Music Control
const musicFiles = {
  'shiva-flute': 'assets/music/shiva-flute.mp3',
  'vishnu-conch': 'assets/music/vishnu-conch.mp3',
  'durga-drum': 'assets/music/durga-drum.mp3',
  'cosmic-ambient': 'assets/music/cosmic.mp3'
};

document.getElementById('toggle-music').addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    document.getElementById('toggle-music').textContent = '🎵 Music: ON';
  } else {
    bgMusic.pause();
    document.getElementById('toggle-music').textContent = '🔇 Music: OFF';
  }
});

document.getElementById('music-select').addEventListener('change', (e) => {
  bgMusic.src = musicFiles[e.target.value];
  bgMusic.play();
});

// Initialize with cosmic background
function initUniverse() {
  const container = document.getElementById('universe-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  
  // Stars
  const stars = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);
  
  for(let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 2000;
    positions[i+1] = (Math.random() - 0.5) * 2000;
    positions[i+2] = (Math.random() - 0.5) * 2000;
  }
  
  stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
  const starField = new THREE.Points(stars, starMaterial);
  scene.add(starField);
  
  camera.position.z = 500;
  
  function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animate();
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

initUniverse();

// Auto-play music (user interaction required)
document.body.addEventListener('click', () => {
  if (!bgMusic.src) {
    bgMusic.src = musicFiles['cosmic-ambient'];
  }
}, { once: true });
