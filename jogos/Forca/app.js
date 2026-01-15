/* Forca Pro - versão responsiva + SVG + sons */
const levels = [
  { cat:"Animais", words:["LEAO","GATO","CACHORRO","ELEFANTE","TIGRE","GIRAFA","MACACO","COBRA","CAVALO","BALEIA","TUBARAO","RINOCERONTE"] },
  { cat:"Natureza", words:["MONTANHA","FLORESTA","OCEANO","DESERTO","CACHOEIRA","VULCAO","PLANICIE","ILHA","RIO","LAGO","TUNDRA","GELEIRA"] },
  { cat:"Objetos", words:["CADEIRA","MESA","LIVRO","LAPIS","CELULAR","COMPUTADOR","TECLADO","MOCHILA","TELEVISAO","GARRAFA"] },
  { cat:"Tecnologia", words:["ALGORITMO","JAVASCRIPT","COMPUTADOR","PROGRAMACAO","INTELIGENCIA","SOFTWARE","HARDWARE","PROCESSADOR","MEMORIA","INTERNET","CRIPTOGRAFIA"] },
  { cat:"Corpo Humano", words:["CEREBRO","CORACAO","PULMAO","ESTOMAGO","COLUNA","MUSCULO","ESQUELETO","ARTICULACAO","SANGUE","NEURONIO"] },
  { cat:"Mente", words:["DISCIPLINA","RESILIENCIA","ATENCAO","FOCO","MEMORIA","VONTADE","CONCENTRACAO","AUTOCONTROLE","PERSISTENCIA"] },
  { cat:"Emocoes", words:["ALEGRIA","TRISTEZA","MEDO","CORAGEM","ANSIEDADE","ESPERANCA","ORGULHO","GRATIDAO","EMPATIA","SERENIDADE"] },
  { cat:"Filosofia", words:["CONSCIENCIA","SABEDORIA","PROPOSITO","EXISTENCIA","REALIDADE","VERDADE","ESSENCIA","ETICA","MORAL","LOGICA"] },
  { cat:"Sociedade", words:["CULTURA","EDUCACAO","JUSTICA","LIBERDADE","TRABALHO","POLITICA","COMUNICACAO","ECONOMIA","RESPONSABILIDADE"] },
  { cat:"Abstrato", words:["TEMPO","INFINITO","CAOS","ORDEM","SILENCIO","ENERGIA","CONSCIENCIA","EQUILIBRIO","TRANSFORMACAO"] }
];

const $ = (id) => document.getElementById(id);

const levelLabel = $("levelLabel");
const wordEl = $("word");
const keyboardEl = $("keyboard");
const errorsEl = $("errors");
const hintsEl = $("hints");
const timerEl = $("timer");
const messageEl = $("message");
const tipEl = $("tip");

const btnHint = $("btnHint");
const btnRestart = $("btnRestart");

const soundToggle = $("soundToggle");
const vibeToggle  = $("vibeToggle");

// Partes do SVG (1..6) + carinha (no final)
const parts = [
  $("p1"), $("p2"), $("p3"), $("p4"), $("p5"), $("p6"),
  $("face1"), $("face2"), $("face3"), $("face4"), $("face5")
];

let levelIndex = 0;
let word = "";
let guessed = [];
let errors = 0;
let hints = 2;

let seconds = 0;
let timerInt = null;
let locked = false;

// ---------- Sons (WebAudio, sem arquivos) ----------
let audioCtx = null;

function ensureAudio(){
  if(!soundToggle.checked) return null;
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if(audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
  return audioCtx;
}

function beep({freq=440, dur=0.12, type="sine", gain=0.06, sweep=null}={}){
  const ctx = ensureAudio();
  if(!ctx) return;

  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;

  o.connect(g);
  g.connect(ctx.destination);

  const t = ctx.currentTime;
  if(sweep){
    o.frequency.setValueAtTime(sweep.from, t);
    o.frequency.exponentialRampToValueAtTime(sweep.to, t + dur);
  }

  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  o.start(t);
  o.stop(t + dur);
}

function sfxCorrect(){
  // “tadá” curto
  beep({freq:523, dur:0.08, type:"triangle", gain:0.07});
  setTimeout(()=>beep({freq:659, dur:0.09, type:"triangle", gain:0.07}), 90);
  setTimeout(()=>beep({freq:784, dur:0.10, type:"triangle", gain:0.07}), 180);
}

function sfxWrong(){
  // “bloop” engraçado
  beep({dur:0.18, type:"sawtooth", gain:0.06, sweep:{from:260, to:90}});
}

function sfxWin(){
  beep({freq:523, dur:0.10, type:"square", gain:0.06});
  setTimeout(()=>beep({freq:659, dur:0.10, type:"square", gain:0.06}), 120);
  setTimeout(()=>beep({freq:784, dur:0.12, type:"square", gain:0.06}), 240);
  setTimeout(()=>beep({freq:988, dur:0.14, type:"square", gain:0.06}), 380);
}

function sfxLose(){
  beep({dur:0.25, type:"sawtooth", gain:0.06, sweep:{from:220, to:60}});
  setTimeout(()=>beep({dur:0.18, type:"sawtooth", gain:0.05, sweep:{from:160, to:50}}), 260);
}

function vibe(ms){
  if(!vibeToggle.checked) return;
  navigator.vibrate?.(ms);
}

// ---------- Game ----------
function startLevel(){
  locked = true;
  clearInterval(timerInt);
  seconds = 0;
  errors = 0;
  hints = 2;
  guessed = [];
  messageEl.textContent = "";

  // limpa SVG
  parts.forEach(p => p.classList.remove("show"));

  const level = levels[levelIndex];
  word = pickWord(level.words);
  levelLabel.textContent = `Nível ${levelIndex+1} • ${level.cat}`;

  tipEl.textContent = "Dica: tente vogais primeiro 😉";

  renderKeyboard();
  renderWord();
  updateHUD();

  timerInt = setInterval(()=>{
    seconds++;
    timerEl.textContent = format(seconds);
  }, 1000);

  setTimeout(()=>locked=false, 200);
}

function pickWord(list){
  // normaliza e remove espaços extras
  const w = (list[Math.random()*list.length|0] || "").toUpperCase().trim();
  return w;
}

function updateHUD(){
  timerEl.textContent = format(seconds);
  errorsEl.textContent = errors;
  hintsEl.textContent = hints;
}

function renderWord(){
  wordEl.innerHTML = "";
  [...word].forEach(ch=>{
    const s = document.createElement("div");
    s.className = "letter";
    s.textContent = guessed.includes(ch) || ch === " " ? ch : "";
    if(ch === " "){
      s.style.borderBottomColor = "transparent";
      s.style.width = "14px";
    }
    wordEl.appendChild(s);
  });
}

function renderKeyboard(){
  keyboardEl.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l=>{
    const btn = document.createElement("button");
    btn.className = "key";
    btn.type = "button";
    btn.textContent = l;
    btn.addEventListener("click", ()=>guess(l, btn));
    keyboardEl.appendChild(btn);
  });
}

function guess(letter, btn){
  if(locked) return;
  if(btn.classList.contains("used")) return;

  btn.classList.add("used");

  if(word.includes(letter)){
    guessed.push(letter);
    btn.classList.add("correct");
    sfxCorrect();
    vibe(30);
    renderWord();
    checkWin();
  }else{
    errors++;
    btn.classList.add("wrong");
    sfxWrong();
    vibe(70);
    revealHangman(errors);
    updateHUD();

    if(errors >= 6) lose();
  }
}

function revealHangman(err){
  // 1..6 mostram as partes principais
  const map = ["p1","p2","p3","p4","p5","p6"];
  const id = map[err-1];
  const el = document.getElementById(id);
  if(el) el.classList.add("show");

  // quando perde, mostra carinha (X_X)
  if(err >= 6){
    ["face1","face2","face3","face4","face5"].forEach(fid=>{
      document.getElementById(fid)?.classList.add("show");
    });
  }
}

function useHint(){
  if(locked || hints <= 0) return;

  const remaining = [...new Set([...word].filter(ch => ch !== " " && !guessed.includes(ch)))];
  if(!remaining.length) return;

  // escolhe uma letra ainda não revelada (mais "útil")
  const pick = remaining[Math.random()*remaining.length|0];
  guessed.push(pick);
  hints--;
  sfxCorrect();
  vibe(25);
  renderWord();
  updateHUD();
  checkWin();
}

function checkWin(){
  if([...word].every(ch => ch === " " || guessed.includes(ch))){
    locked = true;
    clearInterval(timerInt);
    sfxWin();
    messageEl.textContent = `🎉 Boa! Você acertou em ${format(seconds)}.`;
    setTimeout(()=>{
      levelIndex++;
      if(levelIndex < levels.length){
        startLevel();
      }else{
        messageEl.textContent = "🏆 Você concluiu todos os níveis!";
      }
    }, 1100);
  }
}

function lose(){
  locked = true;
  clearInterval(timerInt);
  sfxLose();
  messageEl.textContent = `😵 Não foi dessa vez! A palavra era: ${word}`;
  setTimeout(startLevel, 1400);
}

btnHint.addEventListener("click", useHint);
btnRestart.addEventListener("click", startLevel);

// desbloqueia áudio no primeiro toque
window.addEventListener("pointerdown", () => ensureAudio(), { once:true });

function format(s){
  return `${String(s/60|0).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}

startLevel();
