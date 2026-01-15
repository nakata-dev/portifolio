const LS_KEY = "simon_neon_v1";

const COLORS = ["blue","green","yellow","red","orange"];
const COLOR_FREQ = { blue: 440, green: 554, yellow: 659, red: 330, orange: 494 };

// DOM
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const bestEl  = document.getElementById("best");
const modeLabelEl = document.getElementById("modeLabel");
const messageEl = document.getElementById("message");

const speedLabelEl  = document.getElementById("speedLabel");
const streakLabelEl = document.getElementById("streakLabel");

const btnStart = document.getElementById("btnStart");
const btnMode  = document.getElementById("btnMode");
const btnReset = document.getElementById("btnReset");

const btnSound = document.getElementById("btnSound");
const btnVibe  = document.getElementById("btnVibe");

const modeSheet = document.getElementById("modeSheet");
const overlay   = document.getElementById("overlay");
const btnCloseSheet = document.getElementById("btnCloseSheet");

const pads = Array.from(document.querySelectorAll(".pad"));

// Audio
let audioCtx = null;
let soundOn = true;

// Vibe
let vibeOn = true;

// Game state
let mode = "classic"; // classic | sprint | zen
let level = 1;
let score = 0;
let best = 0;

let sequence = [];
let player = [];

let canTap = false;
let playing = false;

let speed = 1.0;
let combo = 0;

let sprintTimer = null;

boot();

/* ---------- Boot ---------- */
function boot(){
  const data = readStore();
  best = data.best ?? 0;
  soundOn = data.soundOn ?? true;
  vibeOn = data.vibeOn ?? true;
  mode = data.mode ?? "classic";

  updateHUD();
  updateToggles();
  setMode(mode, true);

  wireUI();
  toast("Toque em Iniciar para começar.");
}

function wireUI(){
  btnStart.addEventListener("click", () => {
    unlockAudio();
    startGame();
  });

  btnReset.addEventListener("click", () => {
    unlockAudio();
    resetGame(true);
    toast("Resetado. Toque em Iniciar.");
  });

  btnMode.addEventListener("click", () => openSheet());

  btnCloseSheet.addEventListener("click", closeSheet);
  overlay.addEventListener("click", closeSheet);

  document.querySelectorAll(".mode").forEach(btn => {
    btn.addEventListener("click", () => {
      const m = btn.dataset.mode;
      setMode(m);
      closeSheet();
    });
  });

  btnSound.addEventListener("click", async () => {
    unlockAudio();
    soundOn = !soundOn;
    saveStore();
    updateToggles();
    if(soundOn) {
      try{ await audioCtx?.resume(); }catch{}
    }
  });

  btnVibe.addEventListener("click", () => {
    vibeOn = !vibeOn;
    saveStore();
    updateToggles();
    vibrate(25);
  });

  pads.forEach(p => p.addEventListener("click", () => {
    unlockAudio();
    handleTap(p.dataset.color);
  }));

  // ESC fecha o sheet no desktop
  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeSheet();
  });
}

/* ---------- Sheet ---------- */
function openSheet(){
  overlay.hidden = false;
  modeSheet.hidden = false;
}
function closeSheet(){
  overlay.hidden = true;
  modeSheet.hidden = true;
}

/* ---------- Mode ---------- */
function setMode(m, silent=false){
  mode = m;
  saveStore();

  const label = mode === "classic" ? "Clássico"
              : mode === "sprint"  ? "Sprint"
              : "Zen";

  modeLabelEl.textContent = label;

  if(!silent){
    resetGame(false);
    toast(`Modo: ${label}. Toque em Iniciar.`);
  }
}

function modeRules(){
  if(mode === "sprint"){
    return { baseDelay: 520, timeLimit: 2600 };
  }
  if(mode === "zen"){
    return { baseDelay: 720, timeLimit: null };
  }
  return { baseDelay: 650, timeLimit: null };
}

/* ---------- Game ---------- */
function startGame(){
  if(playing) return;

  resetGame(false);
  playing = true;

  toast("Observe a sequência...");
  nextRound(true);
}

function resetGame(full){
  stopSprintTimer();
  canTap = false;
  playing = false;

  level = 1;
  score = 0;
  combo = 0;
  speed = 1.0;

  sequence = [];
  player = [];

  if(full){
    // recorde não zera
  }

  updateHUD();
  clearLit();
}

function nextRound(increment){
  canTap = false;
  player = [];

  if(increment) sequence.push(randomColor());

  speed = Math.min(1.85, 1.0 + (level - 1) * 0.08);
  updateHUD();

  playSequence().then(() => {
    toast("Sua vez!");
    canTap = true;
    startSprintTimerIfNeeded();
  });
}

async function playSequence(){
  const { baseDelay } = modeRules();
  const step = Math.max(260, Math.floor(baseDelay / speed));

  for(let i=0;i<sequence.length;i++){
    const color = sequence[i];
    light(color, 220);
    tone(color, 0.13);
    await wait(step);
  }
}

function handleTap(color){
  if(!canTap) return;

  light(color, 180);
  tone(color, 0.10);
  vibrate(18);

  player.push(color);

  const idx = player.length - 1;

  if(player[idx] !== sequence[idx]){
    if(mode === "zen"){
      combo = 0;
      updateHUD();
      toast("Quase! Vamos repetir a rodada 🙂");
      canTap = false;
      stopSprintTimer();
      flashError();
      setTimeout(() => nextRound(false), 900); // repete sem aumentar
      return;
    }

    gameOver();
    return;
  }

  combo++;
  score += 10 + Math.min(10, combo);
  updateHUD();

  if(player.length === sequence.length){
    stopSprintTimer();
    canTap = false;

    toneSuccess();
    toast("✔ Boa! Próxima rodada...");

    level++;
    updateHUD();

    setTimeout(() => nextRound(true), 850);
  }
}

function gameOver(){
  stopSprintTimer();
  canTap = false;
  playing = false;

  combo = 0;
  toneError();
  flashError();

  if(score > best){
    best = score;
    saveStore();
    toast("🏆 Novo recorde! Toque em Iniciar.");
  } else {
    toast("Você errou! Toque em Iniciar para tentar de novo.");
  }

  updateHUD();
}

/* ---------- Sprint timer ---------- */
function startSprintTimerIfNeeded(){
  const { timeLimit } = modeRules();
  if(!timeLimit) return;

  stopSprintTimer();
  sprintTimer = setTimeout(() => {
    toneError();
    flashError();
    toast("⏳ Tempo! Sprint exige velocidade 🔥");
    gameOver();
  }, timeLimit);
}

function stopSprintTimer(){
  if(sprintTimer) clearTimeout(sprintTimer);
  sprintTimer = null;
}

/* ---------- Visual helpers ---------- */
function light(color, ms){
  const el = pads.find(p => p.dataset.color === color);
  if(!el) return;
  el.classList.add("lit");
  setTimeout(() => el.classList.remove("lit"), ms);
}

function clearLit(){
  pads.forEach(p => p.classList.remove("lit"));
}

function flashError(){
  document.body.style.filter = "saturate(1.2)";
  document.body.style.backgroundColor = "#22060b";
  setTimeout(() => {
    document.body.style.filter = "";
    document.body.style.backgroundColor = "";
  }, 260);
}

/* ---------- HUD ---------- */
function updateHUD(){
  levelEl.textContent = String(level);
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);

  const label = mode === "classic" ? "Clássico"
              : mode === "sprint"  ? "Sprint"
              : "Zen";
  modeLabelEl.textContent = label;

  speedLabelEl.textContent = `Vel: ${speed.toFixed(2)}x`;
  streakLabelEl.textContent = `Combo: ${combo}`;
}

function toast(t){
  messageEl.textContent = t;
}

/* ---------- Audio (WebAudio) ---------- */
function unlockAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  try{ audioCtx.resume?.(); }catch{}
}

function tone(color, dur=0.12){
  if(!soundOn) return;
  if(!audioCtx) unlockAudio();

  const freq = COLOR_FREQ[color] ?? 440;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  o.type = "sine";
  o.frequency.value = freq;

  o.connect(g);
  g.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  o.start(now);
  o.stop(now + dur + 0.02);
}

function toneSuccess(){
  if(!soundOn) return;
  tone("green", 0.10);
  setTimeout(() => tone("blue", 0.10), 90);
  setTimeout(() => tone("yellow", 0.10), 180);
}

function toneError(){
  if(!soundOn) return;
  if(!audioCtx) unlockAudio();

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  o.type = "square";
  o.frequency.value = 180;

  o.connect(g);
  g.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.14, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  o.start(now);
  o.stop(now + 0.20);
}

/* ---------- Vibration ---------- */
function vibrate(ms){
  if(!vibeOn) return;
  navigator.vibrate?.(ms);
}

/* ---------- Storage ---------- */
function readStore(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch{
    return {};
  }
}

function saveStore(){
  localStorage.setItem(LS_KEY, JSON.stringify({
    best,
    soundOn,
    vibeOn,
    mode
  }));
}

function updateToggles(){
  btnSound.textContent = soundOn ? "🔊" : "🔇";
  btnVibe.textContent = vibeOn ? "📳" : "🚫";
}

/* ---------- Utils ---------- */
function randomColor(){
  return COLORS[(Math.random() * COLORS.length) | 0];
}

function wait(ms){
  return new Promise(res => setTimeout(res, ms));
}
