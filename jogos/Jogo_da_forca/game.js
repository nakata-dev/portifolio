const LS_KEY = "forca_neon_v1";

const wordEl = document.getElementById("word");
const badEl = document.getElementById("badletters");
const msgEl = document.getElementById("msg");
const triesEl = document.getElementById("tries");
const barEl = document.getElementById("bar");
const hintsEl = document.getElementById("hints");

const bestEl = document.getElementById("best");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");

const kbdEl = document.getElementById("kbd");
const btnNew = document.getElementById("btnNew");
const btnHint = document.getElementById("btnHint");

const categoryEl = document.getElementById("category");
const btnSound = document.getElementById("btnSound");
const btnVibe = document.getElementById("btnVibe");

const BANK = {
  names: [
    "ALICE","XUXA","AKIO","MARIA","JOAO","LUCAS","MATEUS","MARCOS","ANA","CARLA","BRUNA",
    "FELIPE","RAFAEL","GABRIEL","LUIZA","SOPHIA","ISABELA","JULIA","MARIANA","VICTORIA",
    "LARISSA","BEATRIZ","CAMILA","LETICIA","NATALIA","RENATA","ALINE","TAMIRES","SANDRA",
    "PAULA","DANIELA","MARCELA","TATIANA","VANESSA","JULIANA","MIRELLA","GIOVANNA","RAQUEL",
    "ALESSANDRA","MAYARA","KARINA","JESSICA","MELISSA","FABIANA","PRISCILA","SILVIA","ADRIANA",
    "ELIANA","CINTIA","MARTA","LILIANA","REGINA","CLAUDIA","SUSANA","VERA","DANIEL","RODRIGO",
    "BRUNO","LEANDRO","DIEGO","VINICIUS","LEONARDO","ALEXANDRE","WILLIAN","FUKUDOME","FABIENNE",
    "JULIETTE","SABRINA","MIDORI","GEOVANA","MAYSA"
  ],
  space: [
    "SOL","CEUS","MARTE","JUPITER","SATURNO","URANO","NETUNO","PLUTAO","GALAXIA","UNIVERSO",
    "CONSTELACAO","LEAO","TOURO","GEMEOS","CANCER","VIRGEM","LIBRA","ESCORPIAO","SAGITARIO",
    "CAPRICORNIO","AQUARIO","PEIXES","ESTRELA","LUA"
  ],
  heroes: [
    "BATMAN","ARANHA","MULHER MARAVILHA"
  ]
};

const ALL = [...BANK.names, ...BANK.space, ...BANK.heroes];

let target = "";
let shown = [];
let bad = [];
let used = new Set();

let maxTries = 6;
let triesLeft = maxTries;

let hintsLeft = 2;

let audioCtx = null;
let soundOn = true;
let vibeOn = true;

let stats = {
  best: 0,
  wins: 0,
  losses: 0,
  category: "all",
  soundOn: true,
  vibeOn: true
};

/* ------------ Boot ------------ */
init();

function init(){
  loadStore();
  categoryEl.value = stats.category;
  soundOn = stats.soundOn;
  vibeOn = stats.vibeOn;
  updateToggleIcons();

  bestEl.textContent = stats.best;
  winsEl.textContent = stats.wins;
  lossesEl.textContent = stats.losses;

  buildKeyboard();
  newGame();

  btnNew.addEventListener("click", () => newGame());
  btnHint.addEventListener("click", () => useHint());

  categoryEl.addEventListener("change", () => {
    stats.category = categoryEl.value;
    saveStore();
    newGame();
  });

  btnSound.addEventListener("click", () => {
    unlockAudio();
    soundOn = !soundOn;
    stats.soundOn = soundOn;
    saveStore();
    updateToggleIcons();
    if(soundOn) beep(660, 0.06);
  });

  btnVibe.addEventListener("click", () => {
    vibeOn = !vibeOn;
    stats.vibeOn = vibeOn;
    saveStore();
    updateToggleIcons();
    vibrate(25);
  });

  // Teclado físico
  window.addEventListener("keydown", (e) => {
    const key = (e.key || "").toUpperCase();
    if(key.length === 1 && key >= "A" && key <= "Z"){
      press(key);
    }
    if(key === "ENTER") newGame();
  });
}

/* ------------ Game core ------------ */
function newGame(){
  msgEl.textContent = "Escolha uma letra.";
  bad = [];
  used.clear();
  triesLeft = maxTries;
  hintsLeft = 2;

  target = pickWord();
  shown = Array.from(target).map(ch => ch === " " ? " " : "_");

  // reset UI keys
  document.querySelectorAll(".key").forEach(k => {
    k.disabled = false;
    k.classList.remove("good","bad");
  });

  render();
}

function pickWord(){
  const cat = stats.category;
  let list = ALL;
  if(cat === "names") list = BANK.names;
  if(cat === "space") list = BANK.space;
  if(cat === "heroes") list = BANK.heroes;

  return list[(Math.random() * list.length) | 0].toUpperCase();
}

function press(letter){
  if(isFinished()) return;
  if(used.has(letter)) return;

  used.add(letter);

  const hit = target.includes(letter);
  if(hit){
    for(let i=0;i<target.length;i++){
      if(target[i] === letter) shown[i] = letter;
    }
    markKey(letter, true);
    vibrate(14);
    beep(880, 0.06);
  } else {
    bad.push(letter);
    triesLeft--;
    markKey(letter, false);
    vibrate(25);
    beep(180, 0.08);
  }

  render();
  checkEnd();
}

function useHint(){
  if(isFinished()) return;
  if(hintsLeft <= 0){
    msgEl.textContent = "Sem dicas restantes.";
    return;
  }

  // pega uma letra que ainda falta
  const missing = [];
  for(let i=0;i<target.length;i++){
    const ch = target[i];
    if(ch !== " " && shown[i] === "_") missing.push(ch);
  }
  if(!missing.length) return;

  const letter = missing[(Math.random() * missing.length) | 0];
  hintsLeft--;
  press(letter);
  msgEl.textContent = `💡 Dica usada: revelado "${letter}"`;
}

function checkEnd(){
  if(!shown.includes("_")){
    msgEl.textContent = "🎉 Você venceu!";
    finish(true);
  } else if(triesLeft <= 0){
    msgEl.textContent = `😵 Você perdeu. Era: ${target}`;
    finish(false);
  }
}

function finish(win){
  // desativa teclado
  document.querySelectorAll(".key").forEach(k => k.disabled = true);

  if(win){
    stats.wins++;
    const score = triesLeft * 10 + hintsLeft * 5 + Math.max(0, target.replace(/ /g,"").length - bad.length);
    if(score > stats.best) stats.best = score;

    beep(660, 0.07); setTimeout(()=>beep(880,0.07),90); setTimeout(()=>beep(990,0.07),180);
    vibrate(50);
  }else{
    stats.losses++;
    beep(140, 0.12);
    vibrate(80);
  }

  saveStore();
  bestEl.textContent = stats.best;
  winsEl.textContent = stats.wins;
  lossesEl.textContent = stats.losses;
}

function isFinished(){
  return triesLeft <= 0 || !shown.includes("_");
}

/* ------------ UI ------------ */
function render(){
  wordEl.textContent = shown.join(" ");
  badEl.innerHTML = "";
  bad.forEach(l => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = l;
    badEl.appendChild(pill);
  });

  triesEl.textContent = triesLeft;
  hintsEl.textContent = hintsLeft;

  // barra
  const pct = (triesLeft / maxTries) * 100;
  barEl.style.width = pct + "%";
}

function buildKeyboard(){
  kbdEl.innerHTML = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  alphabet.forEach(ch => {
    const b = document.createElement("button");
    b.className = "key";
    b.type = "button";
    b.textContent = ch;
    b.addEventListener("click", () => press(ch));
    kbdEl.appendChild(b);
  });
}

function markKey(letter, ok){
  const btn = [...document.querySelectorAll(".key")].find(b => b.textContent === letter);
  if(!btn) return;
  btn.disabled = true;
  btn.classList.add(ok ? "good" : "bad");
}

/* ------------ Sound/Vibe ------------ */
function unlockAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  try{ audioCtx.resume?.(); }catch{}
}

function beep(freq=440, dur=0.07){
  if(!soundOn) return;
  unlockAudio();

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
  o.stop(now + dur + 0.03);
}

function vibrate(ms){
  if(!vibeOn) return;
  navigator.vibrate?.(ms);
}

function updateToggleIcons(){
  btnSound.textContent = soundOn ? "🔊" : "🔇";
  btnVibe.textContent = vibeOn ? "📳" : "🚫";
}

/* ------------ LocalStorage ------------ */
function loadStore(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return;
    const data = JSON.parse(raw);
    stats = { ...stats, ...data };
  }catch{}
}

function saveStore(){
  localStorage.setItem(LS_KEY, JSON.stringify(stats));
}
