// TLdle Weapon Game Logic

// Weapon manifest — use exact display names matching the filenames in Weapons/
// To add a weapon: add the name here and a metadata entry below
const WEAPON_NAMES = [
  "Aelon's Rejuvenating Longbow",
  "Ahzreil's Siphoning Sword",
  "Celestial Cyclone Warblade",
  "Codex of Deep Secrets",
  "Crimson Doomblade",
  "Crimson Hellskewer",
  "Immortal Titanic Quakeblade",
  "Karnix's Netherblade",
  "Karnix's Netherbow",
  "Mystic Truestrike Longbow",
  "Naru's Sawfang Spear",
  "Peerless Obsidian Razors",
  "Queen Bellandir's Languishing Blade",
  "Sacred Manuscript",
  "Staff of Enlightened Reform",
  "Stormbringer Crossbows",
  "Titanspine Longbow",
  "Unrelenting Annihilation Crossbows",
  "Unshakeable Knight's Sword",
  "Windsheer Spear",
];

// Weapon metadata (type + range)
const WEAPON_META = {
  "Aelon's Rejuvenating Longbow":        {type:'Longbow',       range:'Ranged'},
  "Ahzreil's Siphoning Sword":           {type:'Sword & Shield',range:'Melee'},
  "Celestial Cyclone Warblade":          {type:'Greatsword',    range:'Melee'},
  "Codex of Deep Secrets":               {type:'Wand & Tome',   range:'Ranged'},
  "Crimson Doomblade":                   {type:'Sword & Shield',range:'Melee'},
  "Crimson Hellskewer":                  {type:'Spear',         range:'Melee'},
  "Immortal Titanic Quakeblade":         {type:'Greatsword',    range:'Melee'},
  "Karnix's Netherblade":                {type:'Sword & Shield',range:'Melee'},
  "Karnix's Netherbow":                  {type:'Crossbow',      range:'Ranged'},
  "Mystic Truestrike Longbow":           {type:'Longbow',       range:'Ranged'},
  "Naru's Sawfang Spear":                {type:'Spear',         range:'Melee'},
  "Peerless Obsidian Razors":            {type:'Daggers',       range:'Melee'},
  "Queen Bellandir's Languishing Blade": {type:'Greatsword',    range:'Melee'},
  "Sacred Manuscript":                   {type:'Wand & Tome',   range:'Ranged'},
  "Staff of Enlightened Reform":         {type:'Staff',         range:'Ranged'},
  "Stormbringer Crossbows":              {type:'Crossbow',      range:'Ranged'},
  "Titanspine Longbow":                  {type:'Longbow',       range:'Ranged'},
  "Unrelenting Annihilation Crossbows":  {type:'Crossbow',      range:'Ranged'},
  "Unshakeable Knight's Sword":          {type:'Sword & Shield',range:'Melee'},
  "Windsheer Spear":                     {type:'Spear',         range:'Melee'},
};

// Build weapons array — file names match display names exactly
const weapons = WEAPON_NAMES
  .map(name => ({ file: name, name, url: `Weapons/${encodeURIComponent(name)}.webp` }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Daily puzzle
const EPOCH = new Date('2026-01-01T00:00:00');

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

function getDayIndex() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.floor((today - EPOCH) / 86400000);
  return ((days % weapons.length) + weapons.length) % weapons.length;
}

function getTodayWeapon() {
  return weapons[getDayIndex()];
}

// Storage keys
const STORAGE_KEYS = {
  state: 'tldle_weapon_state',
  stats: 'tldle_weapon_stats',
  log: 'tldle_weapon_log',
  hints: 'tldle_weapon_hints'
};

// State management
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.state));
    return s && s.date === getTodayStr() ? s : null;
  } catch { return null; }
}

function saveState(patch) {
  const cur = loadState() || { date: getTodayStr(), guesses: [], gameOver: false, won: false };
  localStorage.setItem(STORAGE_KEYS.state, JSON.stringify({ ...cur, ...patch, date: getTodayStr() }));
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)) || 
      { played: 0, wins: 0, streak: 0, maxStreak: 0, lastWonDate: null };
  } catch {
    return { played: 0, wins: 0, streak: 0, maxStreak: 0, lastWonDate: null };
  }
}

function saveStats(s) {
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(s));
  const globalStats = JSON.parse(localStorage.getItem('tldle-stats') || '{}');
  globalStats.streak = Math.max(globalStats.streak || 0, s.streak);
  localStorage.setItem('tldle-stats', JSON.stringify(globalStats));
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.log)) || [];
  } catch { return []; }
}

function appendLog(entry) {
  const log = loadLog().filter(e => e.date !== entry.date);
  log.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(log.slice(0, 365)));
}

// Hint preferences
function loadHintPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.hints)) || { type: false, range: false };
  } catch { return { type: false, range: false }; }
}

function saveHintPrefs(prefs) {
  localStorage.setItem(STORAGE_KEYS.hints, JSON.stringify(prefs));
}

// Game state
let guesses = [];
let gameOver = false;
let stats = { played: 0, wins: 0, streak: 0, maxStreak: 0 };
let hintPrefs = { type: false, range: false };
const MAX_GUESSES = 6;

// Eye icons
const EYE_OPEN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

// Initialize game
function init() {
  stats = loadStats();

  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();
  if (stats.streak > 0 && stats.lastWonDate !== todayStr && stats.lastWonDate !== yesterdayStr) {
    stats.streak = 0;
    saveStats(stats);
  }

  updateStats();
  
  document.getElementById('dateDisplay').textContent = formatDate();
  
  const weapon = getTodayWeapon();
  const canvas = document.getElementById('weaponCanvas');
  drawWeaponImage(weapon.url, canvas);

  const state = loadState();
  guesses = [];
  gameOver = false;

  if (state && state.guesses.length) {
    state.guesses.forEach(g => {
      const w = weapons.find(x => x.name === g.name) || { name: g.name, url: `Weapons/${encodeURIComponent(g.name)}.webp` };
      guesses.push({ ...w, correct: g.correct });
      addGuessRow(w, g.correct);
    });

    document.getElementById('attemptCount').textContent = guesses.length;

    const blur = Math.max(0, 12 - guesses.length * 2);
    if (blur <= 0 || state.gameOver) {
      canvas.classList.add('revealed');
    } else {
      canvas.style.filter = `blur(${blur}px) brightness(${0.5 + guesses.length * 0.08})`;
    }

    if (state.gameOver) {
      gameOver = true;
      showResult(state.won, state.guesses.length);
    }
  }

  document.getElementById('guessInput').disabled = gameOver;
  document.getElementById('btnSubmit').disabled = gameOver;
  
  if (!gameOver) {
    document.getElementById('guessInput').focus();
  }

  hintPrefs = loadHintPrefs();
  renderHints(false);
  renderHistory();
  startCountdown('countdown', 'resultCountdown');
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

function celebrate() {
  const statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    statsRow.classList.add('celebrate');
    setTimeout(() => statsRow.classList.remove('celebrate'), 600);
  }
  
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = '0s';
        particle.style.animationDuration = '3s';
        particlesContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
      }, i * 50);
    }
  }
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.3s ease';
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx)
    + `<mark style="background:rgba(110,184,255,0.2);color:var(--blue-bright);border-radius:2px;">${text.slice(idx, idx + query.length)}</mark>`
    + text.slice(idx + query.length);
}

// Draw weapon image
function drawWeaponImage(url, canvas) {
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.onerror = () => {
    const gradient = ctx.createRadialGradient(70, 70, 20, 70, 70, 90);
    gradient.addColorStop(0, '#4a8fc9');
    gradient.addColorStop(1, '#1a1d2b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  img.src = url;
}

// Submit guess
function submitGuess() {
  if (gameOver) return;
  
  const input = document.getElementById('guessInput');
  const val = input.value.trim();
  if (!val) return;

  const match = weapons.find(w => w.name.toLowerCase() === val.toLowerCase());
  if (!match) {
    shakeElement(input);
    return;
  }

  if (guesses.some(g => g.name.toLowerCase() === match.name.toLowerCase())) {
    input.value = '';
    return;
  }

  const correct = match.name.toLowerCase() === getTodayWeapon().name.toLowerCase();
  guesses.push({ ...match, correct });

  addGuessRow(match, correct);
  document.getElementById('attemptCount').textContent = guesses.length;
  input.value = '';
  document.getElementById('autocompleteList').classList.remove('open');

  const blur = Math.max(0, 12 - guesses.length * 2);
  const canvas = document.getElementById('weaponCanvas');
  
  if (blur <= 0) {
    canvas.classList.add('revealed');
  } else {
    canvas.style.filter = `blur(${blur}px) brightness(${0.5 + guesses.length * 0.08})`;
  }

  saveState({ guesses: guesses.map(g => ({ name: g.name, correct: g.correct })), gameOver: false });
  renderHints(true);

  if (correct) {
    canvas.classList.add('revealed');
    endGame(true);
  } else if (guesses.length >= MAX_GUESSES) {
    canvas.classList.add('revealed');
    endGame(false);
  }
}

// Add guess row
function addGuessRow(weapon, correct) {
  const list = document.getElementById('guessesList');
  const row = document.createElement('div');
  row.className = `guess-row ${correct ? 'correct' : 'wrong'}`;
  row.innerHTML = `
    <span class="guess-name">${weapon.name}</span>
    <span class="guess-icon">${correct ? '✦' : '✕'}</span>
  `;
  list.prepend(row);
}

// End game
function endGame(won) {
  gameOver = true;
  stats.played++;
  
  if (won) {
    stats.wins++;
    stats.streak = stats.lastWonDate === getYesterdayStr() ? stats.streak + 1 : 1;
    stats.lastWonDate = getTodayStr();
    stats.maxStreak = Math.max(stats.maxStreak || 0, stats.streak);
    celebrate();
  } else {
    stats.streak = 0;
  }
  
  saveStats(stats);
  updateStats();

  saveState({ 
    guesses: guesses.map(g => ({ name: g.name, correct: g.correct })), 
    gameOver: true, 
    won 
  });

  appendLog({
    date: getTodayStr(),
    weapon: getTodayWeapon().name,
    won,
    attempts: guesses.length,
    guesses: guesses.map(g => g.name)
  });

  document.getElementById('guessInput').disabled = true;
  document.getElementById('btnSubmit').disabled = true;

  renderHints(false);
  showResult(won, guesses.length);
  renderHistory();
}

// Show result
function showResult(won, attempts) {
  const banner = document.getElementById('resultBanner');
  banner.className = `result-banner ${won ? 'win' : 'lose'}`;
  
  const weapon = getTodayWeapon();
  document.getElementById('resultTitle').textContent = 
    won ? (attempts === 1 ? '✦ Perfect!' : '✦ Correct!') : 'Better luck tomorrow!';
  
  document.getElementById('resultAnswer').innerHTML = won
    ? `Found <strong>${weapon.name}</strong> in <strong>${attempts}</strong> ${attempts === 1 ? 'attempt' : 'attempts'}!`
    : `The weapon was <strong>${weapon.name}</strong>`;
  
  banner.style.display = 'block';
}

// Update stats
function updateStats() {
  document.getElementById('statPlayed').textContent = stats.played;
  document.getElementById('statWins').textContent = stats.wins;
  document.getElementById('statStreak').textContent = stats.streak;
  document.getElementById('statBest').textContent = stats.maxStreak || 0;
}

// Render hints
function renderHints(animate) {
  const meta = WEAPON_META[getTodayWeapon().file] || {};
  updateHintBadge('type', meta.type || '—', 3, animate);
  updateHintBadge('range', meta.range || '—', 5, animate);
}

function updateHintBadge(key, value, threshold, animate) {
  const badge = document.getElementById('hint' + key.charAt(0).toUpperCase() + key.slice(1));
  const valueEl = document.getElementById('value' + key.charAt(0).toUpperCase() + key.slice(1));
  const btn = document.getElementById('toggle' + key.charAt(0).toUpperCase() + key.slice(1));
  
  const enabled = hintPrefs[key];
  const n = guesses.length;
  const unlocked = n >= threshold || gameOver;

  btn.innerHTML = enabled ? EYE_OPEN : EYE_CLOSED;
  btn.style.color = enabled ? '' : 'var(--border-medium)';

  if (unlocked && enabled) {
    valueEl.textContent = value;
    if (!badge.classList.contains('revealed')) {
      badge.classList.add('revealed');
      if (animate) {
        badge.classList.remove('hint-pop');
        void badge.offsetWidth;
        badge.classList.add('hint-pop');
      }
    }
  } else if (unlocked && !enabled) {
    badge.classList.remove('revealed');
    valueEl.innerHTML = '<span style="color:var(--text-dim);font-size:14px;">Hidden</span>';
  } else {
    badge.classList.remove('revealed');
    const rem = threshold - n;
    valueEl.innerHTML = `<span style="color:var(--text-secondary);font-size:14px;">After ${rem} more</span>`;
  }
}

// Toggle hint
function toggleHint(key) {
  hintPrefs[key] = !hintPrefs[key];
  saveHintPrefs(hintPrefs);
  renderHints(false);
}

// Render history
function renderHistory() {
  const log = loadLog();
  const countEl = document.getElementById('historyCount');
  const bodyEl = document.getElementById('historyBody');
  
  countEl.textContent = `${log.length} game${log.length !== 1 ? 's' : ''}`;

  if (!log.length) {
    bodyEl.innerHTML = '<div class="history-empty">No games recorded yet.</div>';
    return;
  }

  bodyEl.innerHTML = log.map(e => {
    const d = new Date(e.date + 'T12:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const resClass = e.won ? 'win' : 'lose';
    const resText = e.won ? `✦ ${e.attempts}/${MAX_GUESSES}` : '✕ DNF';
    return `
      <div class="history-entry">
        <div class="history-date">${label}</div>
        <div class="history-weapon">${e.weapon}</div>
        <div class="history-result ${resClass}">${resText}</div>
      </div>`;
  }).join('');
}

// Toggle history
function toggleHistory() {
  const body = document.getElementById('historyBody');
  const chevron = document.getElementById('historyChevron');
  const open = body.classList.toggle('open');
  chevron.classList.toggle('open', open);
}

// Autocomplete
let acIndex = -1;

document.getElementById('guessInput').addEventListener('input', function() {
  const val = this.value.trim().toLowerCase();
  const list = document.getElementById('autocompleteList');
  list.innerHTML = '';
  acIndex = -1;

  if (!val) {
    list.classList.remove('open');
    return;
  }

  const guessedNames = new Set(guesses.map(g => g.name.toLowerCase()));
  const matches = weapons.filter(w =>
    w.name.toLowerCase().includes(val) && !guessedNames.has(w.name.toLowerCase())
  ).slice(0, 8);

  if (!matches.length) {
    list.classList.remove('open');
    return;
  }

  matches.forEach(w => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.innerHTML = `<span>${highlightMatch(w.name, val)}</span>`;
    item.addEventListener('mousedown', () => {
      document.getElementById('guessInput').value = w.name;
      list.classList.remove('open');
      submitGuess();
    });
    list.appendChild(item);
  });

  list.classList.add('open');
});

document.getElementById('guessInput').addEventListener('keydown', function(e) {
  const list = document.getElementById('autocompleteList');
  const items = list.querySelectorAll('.autocomplete-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    acIndex = Math.min(acIndex + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('active', i === acIndex));
    if (items[acIndex]) this.value = items[acIndex].querySelector('span').textContent;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    acIndex = Math.max(acIndex - 1, -1);
    items.forEach((el, i) => el.classList.toggle('active', i === acIndex));
    if (acIndex >= 0 && items[acIndex]) this.value = items[acIndex].querySelector('span').textContent;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (acIndex === -1 && items.length > 0) {
      this.value = items[0].querySelector('span').textContent;
    }
    list.classList.remove('open');
    submitGuess();
  } else if (e.key === 'Escape') {
    list.classList.remove('open');
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('.autocomplete-container')) {
    document.getElementById('autocompleteList').classList.remove('open');
  }
});

// Event listeners
document.getElementById('btnSubmit').addEventListener('click', submitGuess);
document.getElementById('toggleType').addEventListener('click', () => toggleHint('type'));
document.getElementById('toggleRange').addEventListener('click', () => toggleHint('range'));
document.getElementById('historyToggle').addEventListener('click', toggleHistory);

// Start
init();