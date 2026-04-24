// Shared utilities for TLdle games

// Animated background canvas
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.2,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    alpha: Math.random() * 0.4 + 0.2
  });
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  stars.forEach(star => {
    star.x += star.vx;
    star.y += star.vy;

    if (star.x < 0) star.x = canvas.width;
    if (star.x > canvas.width) star.x = 0;
    if (star.y < 0) star.y = canvas.height;
    if (star.y > canvas.height) star.y = 0;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${star.alpha})`;
    ctx.fill();
  });
  
  requestAnimationFrame(animateStars);
}
animateStars();

// Particles
const particlesContainer = document.getElementById('particles');
function createParticle() {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.animationDelay = Math.random() * 10 + 's';
  particle.style.animationDuration = (Math.random() * 6 + 8) + 's';
  particlesContainer.appendChild(particle);
  
  setTimeout(() => particle.remove(), 12000);
}

setInterval(createParticle, 1200);
for (let i = 0; i < 8; i++) {
  setTimeout(createParticle, i * 1200);
}

// Utility functions
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate() {
  const today = new Date();
  return today.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase();
}

// Countdown timer
function startCountdown(countdownId, resultCountdownId) {
  function tick() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const fmt = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    const el1 = document.getElementById(countdownId);
    const el2 = document.getElementById(resultCountdownId);
    if (el1) el1.textContent = fmt;
    if (el2) el2.textContent = fmt;

    if (diff < 1000) {
      setTimeout(() => location.reload(), 1100);
    }
  }
  
  tick();
  setInterval(tick, 1000);
}

// Celebration effects
function celebrate() {
  const statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    statsRow.classList.add('celebrate');
    setTimeout(() => statsRow.classList.remove('celebrate'), 600);
  }
  
  // Extra particles
  for (let i = 0; i < 20; i++) {
    setTimeout(createParticle, i * 50);
  }
}

// Input shake animation
function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.3s ease';
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    60% { transform: translateX(8px); }
  }
`;
document.head.appendChild(shakeStyle);

// Easter egg toasts — add more messages to this array to extend
(function() {
  const EASTER_EGGS = [
    '🎂 Happy Birthday Wert!',
    'Remove daggers pls',
    "This was Akaino's idea",
  ];

  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    .egg-toast {
      position: fixed; bottom: 32px; left: 50%;
      transform: translateX(-50%) translateY(80px);
      z-index: 200;
      background: var(--bg-layer2, #13151f);
      border: 1px solid var(--gold-medium, #d4af37);
      border-radius: 14px; padding: 14px 28px;
      font-family: 'Cinzel', serif; font-size: 15px;
      letter-spacing: 2px; color: var(--gold-bright, #f4d58d);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(212,175,55,0.2);
      opacity: 0; transition: opacity 0.6s ease, transform 0.6s ease;
      white-space: nowrap; pointer-events: none;
    }
    .egg-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  `;
  document.head.appendChild(toastStyle);

  if (Math.random() < 0.5) {
    const msg = EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)];
    const toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 800);
  }
})();

// Autocomplete highlight
function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx)
    + `<mark style="background:rgba(201,168,76,0.25);color:var(--gold-bright);border-radius:2px;">${text.slice(idx, idx + query.length)}</mark>`
    + text.slice(idx + query.length);
}