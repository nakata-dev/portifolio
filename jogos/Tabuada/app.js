/* ==========================
   Tabuada Turbo (Kids)
   - Níveis: tabuada 1 (fácil) até 9 (difícil)
   - Mobile-friendly: botões grandes e alternativas
   - Timer com barra
   - Streak + moedas (gamificação leve)
   - Dica (remove 2 alternativas)
   - Som (WebAudio) acerto/erro
   - LocalStorage: progresso, moedas, config som
========================== */

const LS_KEY = "tabuada_turbo_v1";

const levelEl = document.getElementById("level");
const timeEl = document.getElementById("time");
const streakEl = document.getElementById("streak");
const coinsEl = document.getElementById("coins");

const aEl = document.getElementById("a");
const bEl = document.getElementById("b");
const problemEl = document.getElementById("problem");
const feedbackEl = document.getElementById("feedback");
const barEl = document.getElementById("bar");
const answersEl = document.getElementById("answers");

const starsEl = document.getElementById("stars");
const soundBtn = document.getElementById("soundBtn");
const btnHint = document.getElementById("btnHint");
const btnReset = document.getElementById("btnReset");

// Estado
let level = 1;               // 1..9
let timeLeft = 10;
let timer = null;

let solution = 0;
let currentA = 1;
let currentB = 1;

let streak = 0;
let coins = 0;

let soundOn = true;

// Difficulty curve
function timeForLevel(lvl){
  // mais alto = menos tempo, mas sem ficar cruel
  return Math.max(10 - Math.floor(lvl/2), 6);
}

function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return;
    const data = JSON.parse(raw);
    level = clamp(data.level ?? 1, 1, 9);
    streak = data.streak ?? 0;
    coins = data.coins ?? 0;
    soundOn = data.soundOn ?? true;
  }catch{}
}

function save(){
  localStorage.setItem(LS_KEY, JSON.stringify({
    level, streak, coins, soundOn
  }));
}

function renderHUD(){
  levelEl.textContent = String(level);
  streakEl.textContent = String(streak);
  coinsEl.textContent = String(coins);
  timeEl.textContent = String(timeLeft);
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
}

function randInt(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function clamp(n,min,max){
  return Math.max(min, Math.min(max, n));
}

/* ---------- Sounds (WebAudio) ---------- */
let audioCtx = null;

function beep(type){
  if(!soundOn) return;
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  o.type = "sine";

  // acerto / erro
  if(type === "good"){
    o.frequency.value = 880;      // A5
    g.gain.value = 0.07;
  } else {
    o.frequency.value = 220;      // A3
    g.gain.value = 0.08;
  }

  o.connect(g);
  g.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  g.gain.setValueAtTime(g.gain.value, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  o.start(now);
  o.stop(now + 0.2);
}

/* ---------- Minimal animation ---------- */
function sparkle(){
  // fundo simples com “estrelinhas” (sem exagero)
  starsEl.innerHTML = "";
  const count = 14;
  for(let i=0;i<count;i++){
    const s = document.createElement("div");
    s.style.position = "absolute";
    s.style.width = "6px";
    s.style.height = "6px";
    s.style.borderRadius = "999px";
    s.style.background = "rgba(255,255,255,.9)";
    s.style.left = randInt(8, 92) + "%";
    s.style.top = randInt(10, 90) + "%";
    s.style.opacity = (Math.random()*0.6 + 0.2).toFixed(2);
    s.style.filter = "blur(.2px)";
    starsEl.appendChild(s);
  }
  starsEl.classList.remove("show");
  void starsEl.offsetWidth;
  starsEl.classList.add("show");
}

/* ---------- Game ---------- */
function startRound(){
  clearInterval(timer);
  feedbackEl.textContent = "";
  answersEl.innerHTML = "";

  // A = tabuada do nível, B varia
  currentA = level;
  currentB = randInt(0, 10); // 0..10 (fundamental)
  solution = currentA * currentB;

  aEl.textContent = String(currentA);
  bEl.textContent = String(currentB);

  // alternativas (4)
  const options = new Set([solution]);
  while(options.size < 4){
    // gera erros “próximos” para ficar educativo
    const delta = randInt(-6, 6);
    let v = solution + delta;
    if(v < 0) v = randInt(0, 10 * level);
    options.add(v);
  }

  const arr = Array.from(options);
  shuffle(arr);

  arr.forEach(v => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.type = "button";
    btn.textContent = String(v);
    btn.addEventListener("click", () => choose(v, btn));
    answersEl.appendChild(btn);
  });

  timeLeft = timeForLevel(level);
  renderHUD();
  updateBar();

  timer = setInterval(() => {
    timeLeft--;
    renderHUD();
    updateBar();
    if(timeLeft <= 0){
      timeOut();
    }
  }, 1000);
}

function updateBar(){
  const total = timeForLevel(level);
  const pct = (timeLeft / total) * 100;
  barEl.style.width = pct + "%";
}

function choose(value, btn){
  if(timer == null) return;

  if(value === solution){
    // correto
    clearInterval(timer);
    timer = null;

    btn.classList.add("good");
    feedbackEl.textContent = "✅ Certo! Muito bem!";
    beep("good");
    sparkle();

    streak++;
    coins += 1;

    // sobe de nível com streak (leve e motivador)
    // a cada 5 acertos seguidos sobe 1 nível, até 9
    if(streak % 5 === 0 && level < 9){
      level++;
      feedbackEl.textContent = "🌟 Subiu de nível! Tabuada " + level;
    }

    save();
    renderHUD();

    setTimeout(startRound, 750);
  } else {
    // errado
    btn.classList.add("bad");
    feedbackEl.textContent = "❌ Ops! Tente de novo 🙂";
    beep("bad");

    // quebra sequência
    streak = 0;
    save();
    renderHUD();
  }
}

function timeOut(){
  clearInterval(timer);
  timer = null;

  feedbackEl.textContent = "⏳ Tempo acabou! Vamos tentar outra.";
  beep("bad");
  streak = 0;

  save();
  renderHUD();

  setTimeout(startRound, 900);
}

/* ---------- Hint ---------- */
function useHint(){
  // dica: remove 2 respostas erradas (custa moedas)
  if(coins < 2){
    feedbackEl.textContent = "🪙 Você precisa de 2 moedas para usar dica.";
    return;
  }

  const buttons = Array.from(document.querySelectorAll(".answer-btn"));
  const wrong = buttons.filter(b => Number(b.textContent) !== solution);
  if(wrong.length <= 1) return;

  coins -= 2;
  save();
  renderHUD();

  // remove duas erradas
  shuffle(wrong);
  wrong.slice(0,2).forEach(b => {
    b.disabled = true;
    b.style.opacity = ".35";
    b.style.transform = "scale(.98)";
  });

  feedbackEl.textContent = "💡 Dica usada! Agora ficou mais fácil.";
}

/* ---------- Controls ---------- */
soundBtn.addEventListener("click", async () => {
  soundOn = !soundOn;
  save();
  renderHUD();

  // iOS/Android: garantir permissão no primeiro toque
  if(soundOn && !audioCtx){
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      await audioCtx.resume();
    }catch{}
  }
});

btnHint.addEventListener("click", useHint);

btnReset.addEventListener("click", () => {
  const ok = confirm("Recomeçar do nível 1? (mantém moedas)");
  if(!ok) return;
  level = 1;
  streak = 0;
  save();
  renderHUD();
  startRound();
});

/* ---------- Utils ---------- */
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ---------- Init ---------- */
load();
renderHUD();
startRound();
