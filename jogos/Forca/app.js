/* ==========================
   Forca Fun (Kid/Teen UI)
   - SVG Hangman animado
   - Sons WebAudio (sem arquivos)
   - Moedas/XP/Sequência
   - LocalStorage (progresso, bests, stats)
   - Fácil de adicionar palavras e categorias
========================== */

const LS_KEY = "forca_fun_v1";

/* 1) COMO ADICIONAR PALAVRAS:
   - levels[0].words.push("NOVO NOME");
   - levels.push({ cat:"Nomes", words:["MARIA","JOAO","AILTON"] });
*/
const levels = [
  { cat:"Animais", words:["LEAO","GATO","CACHORRO","ELEFANTE","TIGRE","GIRAFA","MACACO","COBRA","CAVALO","BALEIA","TUBARAO"] },
  { cat:"Natureza", words:["MONTANHA","FLORESTA","OCEANO","DESERTO","CACHOEIRA","VULCAO","ILHA","RIO","LAGO","GELEIRA"] },
  { cat:"Objetos", words:["CADEIRA","MESA","LIVRO","LAPIS","CELULAR","TECLADO","MOCHILA","TELEVISAO","GARRAFA"] },
  { cat:"Tecnologia", words:["ALGORITMO","JAVASCRIPT","COMPUTADOR","SOFTWARE","HARDWARE","INTERNET","PROCESSADOR","MEMORIA"] },
  { cat:"Mente", words:["FOCO","MEMORIA","DISCIPLINA","ATENCAO","CORAGEM","PACIENCIA","RESILIENCIA"] }
];

// ==========================
// DOM
// ==========================
const levelLabel = document.getElementById("levelLabel");
const categoryChip = document.getElementById("categoryChip");
const tipText = document.getElementById("tipText");

const timerEl = document.getElementById("timer");
const errorsEl = document.getElementById("errors");
const hintsEl = document.getElementById("hints");

const xpLabel = document.getElementById("xpLabel");
const coinsLabel = document.getElementById("coinsLabel");
const streakLabel = document.getElementById("streakLabel");

const messageEl = document.getElementById("message");
const wordEl = document.getElementById("word");
const keyboardEl = document.getElementById("keyboard");

const btnHint = document.getElementById("btnHint");
const btnNew = document.getElementById("btnNew");
const btnSkip = document.getElementById("btnSkip");

const toggleSound = document.getElementById("toggleSound");
const toggleVibe = document.getElementById("toggleVibe");

// SVG parts
const faceEl = document.getElementById("part-face");
const order = ["part-rope","part-head","part-body","part-armL","part-armR","part-legL","part-legR"];

// ==========================
// Estado
// ==========================
let state = loadState();

let levelIndex = state.levelIndex ?? 0;
let word = "";
let guessed = new Set();
let errors = 0;
let hints = 2;
let locked = false;

let seconds = 0;
let timerInt = null;

// ==========================
// Áudio (WebAudio)
// ==========================
let audioCtx = null;

function ensureAudio() {
  if (!toggleSound.checked) return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
  return audioCtx;
}

function tone({ type="sine", freq=440, dur=0.12, gain=0.06, bend=0 }) {
  const ctx = ensureAudio();
  if (!ctx) return;

  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  if (bend) o.frequency.exponentialRampToValueAtTime(freq * bend, ctx.currentTime + dur);

  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

  o.connect(g);
  g.connect(ctx.destination);

  o.start();
  o.stop(ctx.currentTime + dur + 0.02);
}

function sfxSuccess(){
  tone({ type:"triangle", freq: 660, dur: 0.10, gain:0.07, bend:1.25 });
  setTimeout(()=> tone({ type:"triangle", freq: 880, dur: 0.10, gain:0.06, bend:1.18 }), 80);
}
function sfxWrong(){
  tone({ type:"square", freq: 220, dur: 0.10, gain:0.05, bend:0.75 });
  setTimeout(()=> tone({ type:"square", freq: 180, dur: 0.10, gain:0.05, bend:0.70 }), 70);
}
function sfxWin(){
  tone({ type:"sine", freq: 523.25, dur: 0.12, gain:0.06, bend:1.2 });
  setTimeout(()=> tone({ type:"sine", freq: 659.25, dur: 0.12, gain:0.06, bend:1.2 }), 120);
  setTimeout(()=> tone({ type:"sine", freq: 783.99, dur: 0.14, gain:0.07, bend:1.15 }), 240);
}
function sfxLose(){
  tone({ type:"sawtooth", freq: 180, dur: 0.18, gain:0.05, bend:0.6 });
  setTimeout(()=> tone({ type:"sawtooth", freq: 140, dur: 0.18, gain:0.05, bend:0.55 }), 140);
}

window.addEventListener("pointerdown", () => ensureAudio(), { once:true });

// ==========================
// Utils
// ==========================
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

function formatTime(s){
  const m = Math.floor(s/60);
  const r = s%60;
  return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}

function vibrate(ms=25){
  if (!toggleVibe.checked) return;
  navigator.vibrate?.(ms);
}

function setMessage(text){
  messageEl.textContent = text;
}

function sanitizeWord(w){
  return String(w||"")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^A-Z ]/g,"")
    .replace(/\s+/g," ")
    .trim();
}

// ==========================
// SVG
// ==========================
function resetHangman(){
  order.forEach(id => document.getElementById(id)?.classList.remove("show"));
  faceEl?.classList.remove("show");
}

function showHangman(n){
  resetHangman();
  // mostra 1..6 partes (erro 6 = perdeu)
  for(let i=0;i<Math.min(n,6);i++){
    document.getElementById(order[i])?.classList.add("show");
  }
  if(n>=6){
    document.getElementById("part-legL")?.classList.add("show");
    document.getElementById("part-legR")?.classList.add("show");
    faceEl?.classList.add("show");
  }
}

// ==========================
// Render
// ==========================
function renderWord(){
  wordEl.innerHTML="";
  for(const ch of word){
    const box=document.createElement("div");
    box.className="letter";
    box.textContent = ch===" " ? " " : (guessed.has(ch) ? ch : "");
    wordEl.appendChild(box);
  }
}

function renderKeyboard(){
  keyboardEl.innerHTML="";
  ALPHABET.forEach(l=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="key";
    btn.textContent=l;
    btn.addEventListener("click", ()=> guess(l, btn));
    keyboardEl.appendChild(btn);
  });
}

function markKey(btn, cls){
  btn.classList.add("used");
  if(cls) btn.classList.add(cls);
}

function updateHUD(){
  errorsEl.textContent = String(errors);
  hintsEl.textContent = String(hints);
  xpLabel.textContent = String(state.xp ?? 0);
  coinsLabel.textContent = String(state.coins ?? 0);
  streakLabel.textContent = String(state.streak ?? 0);
}

// ==========================
// Game
// ==========================
function startRound({ keepTimer=false } = {}){
  locked=true;

  // timer
  clearInterval(timerInt);
  if(!keepTimer){
    seconds=0;
    timerEl.textContent="00:00";
  }
  timerInt=setInterval(()=>{
    seconds++;
    timerEl.textContent=formatTime(seconds);
  },1000);

  errors=0;
  hints=2;
  guessed=new Set();

  const lvl = levels[levelIndex % levels.length];
  const picked = lvl.words[randInt(0, lvl.words.length-1)];
  word = sanitizeWord(picked);

  levelLabel.textContent = `Nível ${levelIndex + 1} • ${lvl.cat}`;
  categoryChip.textContent = lvl.cat;

  resetHangman();
  showHangman(0);

  renderKeyboard();
  renderWord();

  tipText.textContent = "Dica: use o 💡 quando travar!";
  setMessage("Escolha uma letra! ✨");

  updateHUD();
  saveState();

  setTimeout(()=> locked=false, 180);
}

function guess(letter, btn){
  if(locked) return;
  if(btn.classList.contains("used")) return;

  if(word.includes(letter)){
    guessed.add(letter);
    markKey(btn, "correct");
    sfxSuccess();
    vibrate(15);
    renderWord();

    // XP pequeno por acerto
    state.xp = (state.xp ?? 0) + 5;

    // completou?
    if(checkWin()){
      win();
    }else{
      setMessage("Boa! 😄");
      updateHUD();
      saveState();
    }
  }else{
    errors++;
    markKey(btn, "wrong");
    sfxWrong();
    vibrate(45);

    showHangman(errors);

    // errou: streak zera
    state.streak = 0;

    if(errors>=6){
      lose();
    }else{
      setMessage("Quase! tenta outra 😅");
      updateHUD();
      saveState();
    }
  }
}

function checkWin(){
  for(const ch of word){
    if(ch!==" " && !guessed.has(ch)) return false;
  }
  return true;
}

function useHint(){
  if(locked) return;
  if(hints<=0){
    setMessage("Você já usou todas as dicas 😄");
    return;
  }

  const remaining = [...new Set([...word].filter(ch=>ch!==" " && !guessed.has(ch)))];
  if(!remaining.length) return;

  hints--;
  const pick = remaining[randInt(0, remaining.length-1)];
  guessed.add(pick);

  // marca o botão
  const keyBtn=[...keyboardEl.querySelectorAll(".key")].find(b=>b.textContent===pick);
  if(keyBtn && !keyBtn.classList.contains("used")) markKey(keyBtn,"correct");

  tone({ type:"triangle", freq: 520, dur: 0.08, gain:0.05, bend:1.15 });
  vibrate(20);

  setMessage(`💡 A letra "${pick}" está na palavra!`);
  renderWord();
  updateHUD();
  saveState();

  if(checkWin()) win();
}

function win(){
  locked=true;
  clearInterval(timerInt);

  // recompensa
  state.coins = (state.coins ?? 0) + 4;
  state.xp = (state.xp ?? 0) + 25;
  state.streak = (state.streak ?? 0) + 1;

  // best time
  const bestKey = `best_${levelIndex}`;
  const prev = state.bests?.[bestKey];
  if(!state.bests) state.bests = {};
  if(prev == null || seconds < prev) state.bests[bestKey] = seconds;

  sfxWin();
  setMessage(`🎉 Você venceu! +4🪙 +25⭐ • ${formatTime(seconds)}`);
  tipText.textContent = "Mandou bem! Vamos pro próximo nível?";

  levelIndex++;
  state.levelIndex = levelIndex;
  updateHUD();
  saveState();

  setTimeout(()=> startRound(), 1200);
}

function lose(){
  locked=true;
  clearInterval(timerInt);
  sfxLose();
  showHangman(6);

  setMessage(`😵 Você perdeu! A palavra era: ${word}`);
  tipText.textContent = "Sem problema. Treino deixa você forte! 💪";

  updateHUD();
  saveState();

  setTimeout(()=> startRound(), 1500);
}

function skipWord(){
  if(locked) return;
  const cost = 3;
  state.coins = state.coins ?? 0;
  if(state.coins < cost){
    setMessage(`Você precisa de ${cost}🪙 para pular 😅`);
    vibrate(30);
    return;
  }
  state.coins -= cost;
  state.streak = 0;
  state.levelIndex = levelIndex; // mantém
  saveState();
  updateHUD();

  tone({ type:"sine", freq: 740, dur: 0.10, gain:0.05, bend:1.08 });
  setMessage("⏭ Pulou! Nova palavra chegando...");
  setTimeout(()=> startRound({ keepTimer:false }), 350);
}

// ==========================
// LocalStorage
// ==========================
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { xp:0, coins:0, streak:0, levelIndex:0, bests:{} };
  }catch{
    return { xp:0, coins:0, streak:0, levelIndex:0, bests:{} };
  }
}

function saveState(){
  const payload = {
    ...state,
    levelIndex
  };
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

// ==========================
// Events
// ==========================
btnHint.addEventListener("click", useHint);
btnNew.addEventListener("click", ()=> startRound());
btnSkip.addEventListener("click", skipWord);

// inicia
startRound();
