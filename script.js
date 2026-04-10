// ============================================
// 🕉️ BRAHMAAND VAANI - Stable Version
// ✅ Chat + Images + Voice + Talking Animation
// ============================================

console.log("✅ Divine AI Loaded!");

const GODS = {
  shiva: {
    name: 'Lord Shiva',
    image: '/assets/gods/shiva.png',  // ⚠️ Check: .png hai ya .jpg?
    prompt: 'You are Lord Shiva. Answer in Hindi with "Har Har Mahadev".',
    color: '#4ecdc4',
    voice: 'pNInz6obpgDQGcFmaJgB'
  },
  krishna: {
    name: 'Shri Krishna',
    image: '/assets/gods/krishna.png',
    prompt: 'You are Lord Krishna. Answer in Hindi with "Radhe Radhe".',
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
    prompt: 'You are Lord Ganesh. Answer with wisdom.',
    color: '#f1c40f',
    voice: 'MF3mGyEYCl7XYWbV9V6O'
  },
  generic: {
    name: 'Cosmic Guide',
    image: '/assets/gods/cosmic.png',
    prompt: 'You are a divine guide.',
    color: '#ffd700',
    voice: '21m00Tcm4TlvDq8ikWAM'
  }
};

let currentGod = 'generic';
let currentAudio = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 DOM Ready!");
  
  // Initialize God
  selectGod(currentGod);
  
  // Send Button
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }
  
  // God Chips
  document.querySelectorAll('.god-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const godKey = e.currentTarget.dataset.god;
      if (godKey) selectGod(godKey);
    });
  });
  
  // Speak Button
  const speakBtn = document.getElementById('speak-response');
  if (speakBtn) {
    speakBtn.addEventListener('click', speakLastResponse);
  }
  
  console.log("✅ All listeners attached!");
});

function selectGod(godKey) {
  if (!GODS[godKey]) godKey = 'generic';
  currentGod = godKey;
  const god = GODS[godKey];
  
  // Update UI
  document.querySelectorAll('.god-chip').forEach(c => c.classList.remove('active'));
  document.querySelector(`.god-chip[data-god="${godKey}"]`)?.classList.add('active');
  
  // Update Image
  const godImage = document.getElementById('god-image');
  const hologramGod = document.getElementById('hologram-god');
  
  if (godImage) {
    console.log("🖼️ Loading image:", god.image);
    godImage.src = god.image;
    godImage.alt = god.name;
    
    // Check if image loads
    godImage.onerror = () => {
      console.error("❌ Image failed to load:", god.image);
      godImage.src = GODS.generic.image;
    };
    godImage.onload = () => {
      console.log("✅ Image loaded successfully!");
    };
  }
  
  // Show hologram
  if (hologramGod) {
    hologramGod.classList.remove('visible');
    void hologramGod.offsetWidth; // Trigger reflow
    hologramGod.classList.add('visible');
  }
  
  // Show reaction
  showReaction(`🙏 ${god.name}`);
  
  // Update theme color
  if (god.color) {
    document.documentElement.style.setProperty('--primary', god.color);
  }
  
  console.log(`🕉️ Selected: ${god.name}`);
}

async function handleSend() {
  const queryInput = document.getElementById('user-query');
  const sendBtn = document.getElementById('send-btn');
  const responseArea = document.getElementById('response-area');
  const godResponse = document.getElementById('god-response');
  
  const query = queryInput?.value?.trim();
  if (!query) return;
  
  console.log("📤 Sending:", query);
  
  // UI Updates
  godResponse.innerHTML = '✨ <em>Divine wisdom aa rahi hai...</em>';
  responseArea?.classList.add('show');
  queryInput.disabled = true;
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bhej rahe...';
  
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
    const reply = chatData.reply || "Kuch gadbad ho gayi.";
    
    console.log("📥 Reply received:", reply.substring(0, 50) + "...");
    
    godResponse.innerHTML = `<em>${god.name}:</em><br><br>${reply}`;
    
    // Step 2: Speak with ElevenLabs
    await speakWithElevenLabs(reply);
    
  } catch (error) {
    console.error("❌ Error:", error);
    godResponse.textContent = `⚠️ Error: ${error.message}`;
    showReaction("⚠️ Kuch gadbad ho gayi");
  } finally {
    queryInput.disabled = false;
    queryInput.value = '';
    queryInput.focus();
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Bhejiye';
  }
}

async function speakWithElevenLabs(text) {
  const god = GODS[currentGod];
  const hologramGod = document.getElementById('hologram-god');
  const reactionBubble = document.getElementById('reaction-bubble');
  
  if (!text) return;
  
  console.log("🎤 Requesting TTS...");
  showReaction("🔊 Bol rahe hain...");
  
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        voice_id: god.voice
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ TTS response received");
    
    if (data.audio) {
      // Start talking animation
      if (hologramGod) {
        hologramGod.classList.add('talking');
      }
      
      // Play audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      
      const audio = new Audio(`data:${data.audio}`);
      currentAudio = audio;
      audio.volume = 0.9;
      
      audio.onended = () => {
        console.log("🔊 Audio ended");
        if (hologramGod) {
          hologramGod.classList.remove('talking');
        }
        showReaction("✨ Aashirwaad");
        currentAudio = null;
      };
      
      audio.onerror = (e) => {
        console.error("❌ Audio error:", e);
        if (hologramGod) {
          hologramGod.classList.remove('talking');
        }
        showReaction("⚠️ Audio error");
        currentAudio = null;
      };
      
      await audio.play();
      console.log("🔊 Audio playing...");
    }
    
  } catch (error) {
    console.error("❌ TTS Error:", error);
    showReaction(`⚠️ ${error.message}`);
    if (hologramGod) {
      hologramGod.classList.remove('talking');
    }
  }
}

async function speakLastResponse() {
  const godResponse = document.getElementById('god-response');
  if (!godResponse) return;
  
  const text = godResponse.textContent.replace(/^[^:]+:\s*/, '').trim();
  if (text) {
    await speakWithElevenLabs(text);
  }
}

function showReaction(text) {
  const bubble = document.getElementById('reaction-bubble');
  if (bubble) {
    bubble.textContent = text;
    bubble.classList.add('show');
    setTimeout(() => bubble.classList.remove('show'), 3000);
  }
}

console.log("✅ Script loaded - Har Har Mahadev! 🕉️");
