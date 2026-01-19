// =========================
// CORES (5 copos)
// =========================
const COLORS = [
  { id: "blue",   name:"Azul",     hex:"#2E7DFF" },
  { id: "red",    name:"Vermelho", hex:"#FF3D5C" },
  { id: "green",  name:"Verde",    hex:"#00E59B" },
  { id: "yellow", name:"Amarelo",  hex:"#FFD84A" },
  { id: "black",  name:"Preto",    hex:"#1B1F27" },
];

let soundOn = true;
let timers = { overlay: null, phase: null };

const PHASE = {
  INTRO: "INTRO",
  COUNTDOWN: "COUNTDOWN",
  MEMORIZE: "MEMORIZE",
  PLAY: "PLAY",
  RESULT: "RESULT"
};

let state = {
  turn: 1,
  round: 1,
  score1: 0,
  score2: 0,

  // progressão
  totalCorrect: 0,
  level: 1,

  target: [],
  build: [],
  phase: PHASE.INTRO,

  countdownSeconds: 3,
  memLeft: 0
};

// DOM
const el = {
  // HUD
  turnText: document.getElementById("turnText"),
  turnBadge: document.getElementById("turnBadge"),
  phaseHint: document.getElementById("phaseHint"),
  leaderHint: document.getElementById("leaderHint"),
  round: document.getElementById("round"),
  level: document.getElementById("level"),
  memBase: document.getElementById("memBase"),
  memLeft: document.getElementById("memLeft"),
  p1: document.getElementById("p1"),
  p2: document.getElementById("p2"),
  chipJ1: document.getElementById("chipJ1"),
  chipJ2: document.getElementById("chipJ2"),
  emojiJ1: document.getElementById("emojiJ1"),
  emojiJ2: document.getElementById("emojiJ2"),

  // carta
  challengeBox: document.getElementById("challengeBox"),
  targetSeq: document.getElementById("targetSeq"),
  placeholders: document.getElementById("placeholders"),
  feedback: document.getElementById("feedback"),

  // play
  build: document.getElementById("build"),
  buildHint: document.getElementById("buildHint"),
  palette: document.getElementById("palette"),

  // buttons
  bellBtn: document.getElementById("bellBtn"),
  undoBtn: document.getElementById("undoBtn"),
  clearBtn: document.getElementById("clearBtn"),
  newMatchBtn: document.getElementById("newMatchBtn"),

  // overlay + modal
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayBig: document.getElementById("overlayBig"),
  overlaySub: document.getElementById("overlaySub"),
  rulesBtn: document.getElementById("rulesBtn"),
  soundBtn: document.getElementById("soundBtn"),
  modal: document.getElementById("modal"),
  closeModal: document.getElementById("closeModal"),
};

// -------------------------
// Audio beep
// -------------------------
function beep(type="ok"){
  if(!soundOn) return;
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);

    const now = ctx.currentTime;
    const freq = type === "ok" ? 650 : 230;

    o.frequency.setValueAtTime(freq, now);
    o.type = "sine";
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.10, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    o.start(now);
    o.stop(now + 0.2);
    setTimeout(()=>ctx.close(), 300);
  }catch(e){}
}

// -------------------------
// Util
// -------------------------
function shuffle(arr){
  for(let i = arr.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setFeedback(msg){ el.feedback.textContent = msg; }

function arraysEqual(a,b){
  return a.length===b.length && a.every((v,i)=>v===b[i]);
}

function stopAllTimers(){
  if(timers.overlay) clearInterval(timers.overlay);
  if(timers.phase) clearInterval(timers.phase);
  timers.overlay = null;
  timers.phase = null;
}

// -------------------------
// Progressão (simples e efetiva)
// - nível sobe a cada 2 acertos totais (máx 20)
// - tempo de memorização reduz até 2s
// -------------------------
function levelFromCorrect(totalCorrect){
  return Math.min(20, 1 + Math.floor(totalCorrect / 2));
}

function memorizeSecondsForLevel(lv){
  if(lv <= 4) return 5;
  if(lv <= 8) return 4;
  if(lv <= 14) return 3;
  return 2;
}

// -------------------------
// UI helpers
// -------------------------
function setCardHidden(hidden){
  el.challengeBox.classList.toggle("is-hidden", hidden);
}

function updateLeaderUI(){
  const s1 = state.score1;
  const s2 = state.score2;

  el.p1.textContent = s1;
  el.p2.textContent = s2;

  // reset classes
  el.chipJ1.classList.remove("leader","loser");
  el.chipJ2.classList.remove("leader","loser");

  if(s1 === s2){
    el.leaderHint.textContent = "🤝 Empate";
    el.emojiJ1.textContent = "🙂";
    el.emojiJ2.textContent = "🙂";
  } else if(s1 > s2){
    el.leaderHint.textContent = "👑 Jogador 1 na frente";
    el.emojiJ1.textContent = "👑";
    el.emojiJ2.textContent = "😰";
    el.chipJ1.classList.add("leader");
    el.chipJ2.classList.add("loser");
  } else {
    el.leaderHint.textContent = "👑 Jogador 2 na frente";
    el.emojiJ1.textContent = "😰";
    el.emojiJ2.textContent = "👑";
    el.chipJ2.classList.add("leader");
    el.chipJ1.classList.add("loser");
  }
}

function renderHUD(){
  state.level = levelFromCorrect(state.totalCorrect);

  el.turnText.textContent = state.turn === 1 ? "Jogador 1" : "Jogador 2";
  el.turnBadge.textContent = state.turn === 1 ? "J1" : "J2";
  el.round.textContent = state.round;
  el.level.textContent = state.level;

  const memBase = memorizeSecondsForLevel(state.level);
  el.memBase.textContent = memBase;

  el.memLeft.textContent = (state.phase === PHASE.MEMORIZE) ? state.memLeft : "-";

  const hints = {
    [PHASE.INTRO]: "Round iniciando…",
    [PHASE.COUNTDOWN]: "Prepare: vai aparecer a carta!",
    [PHASE.MEMORIZE]: "Olhe bem. Memorize a ordem!",
    [PHASE.PLAY]: "Agora sem olhar: monte a sequência.",
    [PHASE.RESULT]: "Conferindo…"
  };
  el.phaseHint.textContent = hints[state.phase] || "";

  // dica de montagem contextual
  if(state.phase === PHASE.PLAY){
    el.buildHint.textContent = "Toque nas cores para preencher 1–5. Toque em um slot para remover. 🔔 para confirmar.";
  } else if(state.phase === PHASE.MEMORIZE){
    el.buildHint.textContent = "Aguarde: memorizar primeiro. Depois você monta.";
  } else {
    el.buildHint.textContent = "Siga o fluxo do round. Você vai entender em segundos 🙂";
  }

  updateLeaderUI();
}

// -------------------------
// Render carta e placeholders
// -------------------------
function cupEl(colorId){
  const c = COLORS.find(x=>x.id===colorId);
  const div = document.createElement("div");
  div.className = "cup";
  div.style.background = c.hex;
  if(colorId === "black"){
    div.style.border = "1px solid rgba(255,255,255,.18)";
  }
  return div;
}

function placeholderEl(){
  const d = document.createElement("div");
  d.className = "placeholder";
  d.textContent = "?";
  return d;
}

function renderTarget(){
  el.targetSeq.innerHTML = "";
  state.target.forEach(id => el.targetSeq.appendChild(cupEl(id)));
}

function renderPlaceholders(){
  el.placeholders.innerHTML = "";
  for(let i=0;i<5;i++) el.placeholders.appendChild(placeholderEl());
}

// -------------------------
// Build (agora MUITO claro)
// - mostra cor preenchendo o slot inteiro
// - tocar no slot removendo aquela posição
// -------------------------
function renderBuild(){
  el.build.innerHTML = "";

  for(let i=0;i<5;i++){
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.setAttribute("role", "button");
    slot.setAttribute("aria-label", `Posição ${i+1}`);

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = i + 1;

    slot.appendChild(badge);

    if(state.build[i]){
      slot.classList.add("filled");
      const c = COLORS.find(x=>x.id===state.build[i]);

      const fill = document.createElement("div");
      fill.className = "fill";
      fill.style.background = c.hex;

      slot.appendChild(fill);
      slot.setAttribute("aria-label", `Posição ${i+1}: ${c.name}`);

      // remover essa posição ao tocar
      slot.addEventListener("click", ()=>{
        if(state.phase !== PHASE.PLAY) return;
        state.build.splice(i, 1); // remove a posição i e puxa o resto
        renderBuild();
        setFeedback("");
      });
    } else {
      const num = document.createElement("div");
      num.className = "num";
      num.textContent = i + 1;
      slot.appendChild(num);

      slot.addEventListener("click", ()=>{
        // opcional: tocar em vazio remove último
        if(state.phase !== PHASE.PLAY) return;
        if(state.build.length > 0){
          state.build.pop();
          renderBuild();
          setFeedback("");
        }
      });
    }

    el.build.appendChild(slot);
  }
}

// -------------------------
// Paleta
// -------------------------
function renderPalette(){
  el.palette.innerHTML = "";

  COLORS.forEach(c=>{
    const btn = document.createElement("button");
    btn.className = "colorBtn";
    btn.type = "button";
    btn.style.background = c.hex;
    btn.title = c.name;
    btn.setAttribute("aria-label", `Escolher ${c.name}`);

    btn.addEventListener("click", ()=>{
      if(state.phase !== PHASE.PLAY) return;
      if(state.build.length >= 5) return;

      state.build.push(c.id);
      renderBuild();
      setFeedback("");
    });

    el.palette.appendChild(btn);
  });
}

function setControlsEnabled(enabled){
  el.palette.querySelectorAll("button").forEach(b => b.disabled = !enabled);
  el.bellBtn.disabled = !enabled;
  el.undoBtn.disabled = !enabled;
  el.clearBtn.disabled = !enabled;
}

// -------------------------
// Overlay
// -------------------------
function showOverlay(title, big, sub){
  el.overlayTitle.textContent = title;
  el.overlayBig.textContent = big;
  el.overlaySub.textContent = sub;
  el.overlay.classList.add("show");
  el.overlay.setAttribute("aria-hidden", "false");
}

function hideOverlay(){
  el.overlay.classList.remove("show");
  el.overlay.setAttribute("aria-hidden", "true");
}

// -------------------------
// Flow do round
// -------------------------
function newChallenge(){
  const ids = COLORS.map(c=>c.id);
  state.target = shuffle(ids).slice(0,5);
  state.build = [];
  renderTarget();
  renderBuild();
  renderPlaceholders();
}

function startRoundFlow(){
  stopAllTimers();
  newChallenge();

  state.phase = PHASE.INTRO;
  renderHUD();
  setControlsEnabled(false);
  setCardHidden(false);
  setFeedback("");

  showOverlay(`Round ${state.round}`, "", "Prepare-se: vem 3, 2, 1… e você olha a carta.");
  setTimeout(()=> startCountdown(), 650);
}

function startCountdown(){
  state.phase = PHASE.COUNTDOWN;
  renderHUD();

  let c = state.countdownSeconds;
  showOverlay(`Round ${state.round}`, String(c), "Quando acabar, memorize a ordem.");
  timers.overlay = setInterval(()=>{
    c--;
    if(c <= 0){
      clearInterval(timers.overlay);
      timers.overlay = null;
      hideOverlay();
      startMemorize();
      return;
    }
    el.overlayBig.textContent = String(c);
  }, 1000);
}

function startMemorize(){
  state.phase = PHASE.MEMORIZE;

  const memSeconds = memorizeSecondsForLevel(state.level);
  state.memLeft = memSeconds;

  setCardHidden(false);
  setControlsEnabled(false);
  renderHUD();
  setFeedback("👀 Memorize a ordem!");

  timers.phase = setInterval(()=>{
    state.memLeft--;
    renderHUD();
    if(state.memLeft <= 0){
      clearInterval(timers.phase);
      timers.phase = null;
      startPlay();
    }
  }, 1000);
}

function startPlay(){
  state.phase = PHASE.PLAY;

  setCardHidden(true);     // esconde sem vazar cor
  state.build = [];
  renderBuild();

  setControlsEnabled(true);
  renderHUD();
  setFeedback("🙈 Agora é memória! Monte e confirme.");
}

// -------------------------
// Ações (confirmar/undo/limpar)
// -------------------------
function confirmBell(){
  if(state.phase !== PHASE.PLAY) return;

  if(state.build.length < 5){
    setFeedback("⚠️ Preencha as 5 posições antes de confirmar!");
    return;
  }

  state.phase = PHASE.RESULT;
  setControlsEnabled(false);
  renderHUD();

  const ok = arraysEqual(state.build, state.target);

  if(ok){
    state.totalCorrect++;
    if(state.turn === 1) state.score1++;
    else state.score2++;
    beep("ok");
    setFeedback("✅ Correto! +1 ponto.");
  }else{
    beep("nope");
    setFeedback("❌ Errado! Passou a vez.");
  }

  setTimeout(()=>{
    if(state.turn === 1){
      state.turn = 2;
    }else{
      state.turn = 1;
      state.round++;
    }
    renderHUD();
    startRoundFlow();
  }, 900);
}

function undo(){
  if(state.phase !== PHASE.PLAY) return;
  if(state.build.length === 0) return;
  state.build.pop();
  renderBuild();
  setFeedback("");
}

function clearBuild(){
  if(state.phase !== PHASE.PLAY) return;
  state.build = [];
  renderBuild();
  setFeedback("");
}

function newMatch(){
  stopAllTimers();
  state.turn = 1;
  state.round = 1;
  state.score1 = 0;
  state.score2 = 0;
  state.totalCorrect = 0;
  state.level = 1;
  renderHUD();
  setFeedback("🆕 Nova partida!");
  startRoundFlow();
}

// -------------------------
// Eventos
// -------------------------
el.bellBtn.addEventListener("click", confirmBell);
el.undoBtn.addEventListener("click", undo);
el.clearBtn.addEventListener("click", clearBuild);
el.newMatchBtn.addEventListener("click", newMatch);

el.soundBtn.addEventListener("click", ()=>{
  soundOn = !soundOn;
  el.soundBtn.textContent = soundOn ? "🔊" : "🔇";
});

el.rulesBtn.addEventListener("click", ()=>{
  el.modal.classList.add("show");
  el.modal.setAttribute("aria-hidden", "false");
});
el.closeModal.addEventListener("click", ()=>{
  el.modal.classList.remove("show");
  el.modal.setAttribute("aria-hidden", "true");
});
el.modal.addEventListener("click", (e)=>{
  if(e.target === el.modal){
    el.modal.classList.remove("show");
    el.modal.setAttribute("aria-hidden", "true");
  }
});

// -------------------------
// Init
// -------------------------
renderPalette();
renderBuild();
renderPlaceholders();
setControlsEnabled(false);
renderHUD();
startRoundFlow();
