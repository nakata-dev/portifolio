/* =========================================================
  Crossword Elite - game.js (LIMPO + RECOMPENSAS)
  ✅ UI inferior removida (sem dock / sem botões embaixo)
  ✅ dica fica só em #clueText (agora no topo)
  ✅ moedas + som + animação ao completar palavra
========================================================= */

const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, "0");

function on(el, ev, fn, opt){
  if (!el) return;
  el.addEventListener(ev, fn, opt);
}
function setText(el, txt){
  if (!el) return;
  el.textContent = txt;
}
function setAttr(el, k, v){
  if (!el) return;
  el.setAttribute(k, v);
}

const UI = {
  grid: $("#grid"),
  hiddenInput: $("#hiddenInput"),

  levelLabel: $("#levelLabel"),
  levelTotal: $("#levelTotal"),
  timeLabel: $("#timeLabel"),
  penaltyLabel: $("#penaltyLabel"),
  coinLabel: $("#coinLabel"),

  clueText: $("#clueText"),

  pauseOverlay: $("#pauseOverlay"),
  pauseCloseBtn: $("#pauseCloseBtn"),
  resumeBtn: $("#resumeBtn"),

  winOverlay: $("#winOverlay"),
  winCloseBtn: $("#winCloseBtn"),
  winSummary: $("#winSummary"),
  winResetBtn: $("#winResetBtn"),
  winNextBtn: $("#winNextBtn"),

  fxLayer: $("#fxLayer"),
};

function sanitizeWord(str){
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}
function inBounds(r, c){ return r >= 0 && c >= 0 && r < state.size && c < state.size; }
function cellAt(r,c){ return state.grid[r]?.[c] || null; }
function isAlphaKey(k){ return /^[a-zA-ZÀ-ÿ]$/.test(k); }
function formatTime(total){
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

/* =========================================================
  AUDIO (sem arquivos externos)
========================================================= */
let _ac = null;
function audioContext(){
  if (_ac) return _ac;
  try{
    _ac = new (window.AudioContext || window.webkitAudioContext)();
  }catch(_e){
    _ac = null;
  }
  return _ac;
}

function playChime(kind = "word"){
  const ac = audioContext();
  if (!ac) return;

  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 0.0001;
  master.connect(ac.destination);

  const o1 = ac.createOscillator();
  const o2 = ac.createOscillator();
  const g1 = ac.createGain();
  const g2 = ac.createGain();

  o1.type = "sine";
  o2.type = "triangle";

  const base = (kind === "level") ? 523.25 : 440;
  o1.frequency.setValueAtTime(base, now);
  o2.frequency.setValueAtTime(base * 1.5, now);

  o1.frequency.exponentialRampToValueAtTime(base * (kind === "level" ? 2.0 : 1.25), now + (kind === "level" ? 0.18 : 0.10));
  o2.frequency.exponentialRampToValueAtTime(base * (kind === "level" ? 2.4 : 1.6), now + (kind === "level" ? 0.22 : 0.12));

  g1.gain.setValueAtTime(0.0001, now);
  g2.gain.setValueAtTime(0.0001, now);

  g1.gain.exponentialRampToValueAtTime(kind === "level" ? 0.10 : 0.07, now + 0.02);
  g2.gain.exponentialRampToValueAtTime(kind === "level" ? 0.06 : 0.04, now + 0.02);

  g1.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "level" ? 0.28 : 0.18));
  g2.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "level" ? 0.34 : 0.22));

  o1.connect(g1); g1.connect(master);
  o2.connect(g2); g2.connect(master);

  master.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "level" ? 0.36 : 0.24));

  o1.start(now);
  o2.start(now);
  o1.stop(now + (kind === "level" ? 0.40 : 0.26));
  o2.stop(now + (kind === "level" ? 0.40 : 0.26));
}

/* =========================================================
  FX
========================================================= */
function rectCenter(el){
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}

function spawnCoin(fromEl, toEl, delayMs = 0){
  if (!UI.fxLayer || !fromEl || !toEl) return;

  const start = rectCenter(fromEl);
  const end = rectCenter(toEl);

  const coin = document.createElement("div");
  coin.className = "fx-coin";
  coin.textContent = "🪙";
  coin.style.left = `${start.x}px`;
  coin.style.top = `${start.y}px`;
  UI.fxLayer.appendChild(coin);

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = reduce ? 0 : 520;

  const anim = coin.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.75)`, opacity: 0.95 }
    ],
    { duration: dur, delay: delayMs, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
  );

  anim.onfinish = () => coin.remove();
}

function spawnSpark(fromEl){
  if (!UI.fxLayer || !fromEl) return;

  const p = rectCenter(fromEl);
  const spark = document.createElement("div");
  spark.className = "fx-spark";
  spark.style.left = `${p.x}px`;
  spark.style.top = `${p.y}px`;
  UI.fxLayer.appendChild(spark);

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = reduce ? 0 : 420;

  const driftX = (Math.random() * 60 - 30);
  const driftY = - (40 + Math.random() * 40);

  const anim = spark.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)", opacity: 0.95 },
      { transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(0.6)`, opacity: 0 }
    ],
    { duration: dur, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
  );

  anim.onfinish = () => spark.remove();
}

function pulseCoins(){
  const pill = document.querySelector(".hud-coins");
  if (!pill) return;
  pill.classList.remove("pulse");
  void pill.offsetWidth;
  pill.classList.add("pulse");
}

/* =========================================================
  LEVELS (seus 10)
========================================================= */
const levels = [
  {
    id: 1, size: 9,
    words: [
      { answer: "GATO", row: 0, col: 0, dir: "across", clue: "Animal de estimação que mia." },
      { answer: "CASA", row: 2, col: 0, dir: "across", clue: "Lugar onde moramos." },
      { answer: "SOL",  row: 4, col: 0, dir: "across", clue: "Estrela do nosso sistema." },
      { answer: "LUA",  row: 6, col: 0, dir: "across", clue: "Satélite natural da Terra." },
      { answer: "AGUA", row: 8, col: 0, dir: "across", clue: "Essencial para a vida." },

      { answer: "TETO", row: 0, col: 4, dir: "down", clue: "Parte de cima de uma casa." },
      { answer: "AR",   row: 0, col: 5, dir: "down", clue: "O que respiramos." },
      { answer: "SOPA", row: 0, col: 6, dir: "down", clue: "Comida líquida e quente." },
      { answer: "OLHO", row: 0, col: 7, dir: "down", clue: "Usamos para ver." },
      { answer: "ALVO", row: 0, col: 8, dir: "down", clue: "Objetivo, mira." },
    ],
  },
  {
    id: 2, size: 9,
    words: [
      { answer: "LIVRO", row: 0, col: 0, dir: "across", clue: "Cheio de páginas e histórias." },
      { answer: "AULA",  row: 2, col: 0, dir: "across", clue: "Momento de aprender." },
      { answer: "JOGO",  row: 4, col: 0, dir: "across", clue: "Diversão com regras." },
      { answer: "PAPEL", row: 6, col: 0, dir: "across", clue: "Usado para escrever." },
      { answer: "AZUL",  row: 8, col: 0, dir: "across", clue: "Cor do céu limpo." },

      { answer: "LEAO",  row: 0, col: 4, dir: "down", clue: "Rei da selva." },
      { answer: "VENTO", row: 0, col: 5, dir: "down", clue: "Ar em movimento." },
      { answer: "RISO",  row: 0, col: 6, dir: "down", clue: "Som da alegria." },
      { answer: "LAPIS", row: 0, col: 7, dir: "down", clue: "Usado para escrever e desenhar." },
      { answer: "FOTO",  row: 0, col: 8, dir: "down", clue: "Imagem registrada." },
    ],
  },
  {
    id: 3, size: 9,
    words: [
      { answer: "PRAIA", row: 0, col: 0, dir: "across", clue: "Lugar com areia e mar." },
      { answer: "MAR",   row: 2, col: 0, dir: "across", clue: "Água salgada enorme." },
      { answer: "BARCO", row: 4, col: 0, dir: "across", clue: "Navega na água." },
      { answer: "AREIA", row: 6, col: 0, dir: "across", clue: "O chão da praia." },
      { answer: "PEIXE", row: 8, col: 0, dir: "across", clue: "Animal que vive na água." },

      { answer: "PALMA", row: 0, col: 4, dir: "down", clue: "Tipo de árvore tropical." },
      { answer: "RIMA",  row: 0, col: 5, dir: "down", clue: "Palavras com som parecido." },
      { answer: "ECO",   row: 0, col: 6, dir: "down", clue: "Repetição do som." },
      { answer: "NAVIO", row: 0, col: 7, dir: "down", clue: "Barco grande." },
      { answer: "ARCO",  row: 0, col: 8, dir: "down", clue: "Curva; também arma de flechas." },
    ],
  },
  {
    id: 4, size: 9,
    words: [
      { answer: "DOCE", row: 0, col: 0, dir: "across", clue: "Sabor de açúcar." },
      { answer: "BOLO", row: 2, col: 0, dir: "across", clue: "Sobremesa de festa." },
      { answer: "SUCO", row: 4, col: 0, dir: "across", clue: "Bebida de fruta." },
      { answer: "MEL",  row: 6, col: 0, dir: "across", clue: "Produzido pelas abelhas." },
      { answer: "SAL",  row: 8, col: 0, dir: "across", clue: "Tempero branco comum." },

      { answer: "DADO", row: 0, col: 4, dir: "down", clue: "Cubo usado em jogos." },
      { answer: "CEU",  row: 0, col: 5, dir: "down", clue: "Onde ficam as nuvens." },
      { answer: "COCO", row: 0, col: 6, dir: "down", clue: "Fruta de palmeira." },
      { answer: "LOJA", row: 0, col: 7, dir: "down", clue: "Lugar de comprar coisas." },
      { answer: "PIPO", row: 0, col: 8, dir: "down", clue: "Grão que vira pipoca (curto)." },
    ],
  },
  {
    id: 5, size: 9,
    words: [
      { answer: "MATA", row: 0, col: 0, dir: "across", clue: "Floresta; vegetação densa." },
      { answer: "RATO", row: 2, col: 0, dir: "across", clue: "Pequeno roedor." },
      { answer: "URSO", row: 4, col: 0, dir: "across", clue: "Animal grande e peludo." },
      { answer: "NINHO",row: 6, col: 0, dir: "across", clue: "Casa de pássaros." },
      { answer: "RUA",  row: 8, col: 0, dir: "across", clue: "Via da cidade." },

      { answer: "FARO",  row: 0, col: 4, dir: "down", clue: "Sentido do cheiro." },
      { answer: "LENTE", row: 0, col: 5, dir: "down", clue: "Parte dos óculos." },
      { answer: "ESTOJO",row: 0, col: 6, dir: "down", clue: "Guarda lápis e canetas." },
      { answer: "SINO",  row: 0, col: 7, dir: "down", clue: "Faz 'ding-dong'." },
      { answer: "TERRA", row: 0, col: 8, dir: "down", clue: "Nosso planeta." },
    ],
  },
  {
    id: 6, size: 9,
    words: [
      { answer: "FILME", row: 0, col: 0, dir: "across", clue: "História em vídeo." },
      { answer: "ATOR",  row: 2, col: 0, dir: "across", clue: "Pessoa que atua." },
      { answer: "SOM",   row: 4, col: 0, dir: "across", clue: "O que ouvimos." },
      { answer: "TELA",  row: 6, col: 0, dir: "across", clue: "Onde aparece a imagem." },
      { answer: "CINE",  row: 8, col: 0, dir: "across", clue: "Cinema (curto)." },

      { answer: "CARTA", row: 0, col: 4, dir: "down", clue: "Mensagem escrita." },
      { answer: "MEIA",  row: 0, col: 5, dir: "down", clue: "Roupa do pé." },
      { answer: "MOTO",  row: 0, col: 6, dir: "down", clue: "Veículo de duas rodas." },
      { answer: "LATA",  row: 0, col: 7, dir: "down", clue: "Embalagem metálica." },
      { answer: "NEVE",  row: 0, col: 8, dir: "down", clue: "Gelo que cai do céu." },
    ],
  },
  {
    id: 7, size: 9,
    words: [
      { answer: "JANE", row: 0, col: 0, dir: "across", clue: "Apelido de Janeiro (curto)." },
      { answer: "FEV",  row: 2, col: 0, dir: "across", clue: "Apelido de Fevereiro (curto)." },
      { answer: "MAR",  row: 4, col: 0, dir: "across", clue: "Mês 3 do ano (curto)." },
      { answer: "ABR",  row: 6, col: 0, dir: "across", clue: "Mês 4 do ano (curto)." },
      { answer: "MAI",  row: 8, col: 0, dir: "across", clue: "Mês 5 do ano (curto)." },

      { answer: "FITA", row: 0, col: 4, dir: "down", clue: "Tira usada para amarrar." },
      { answer: "RISO", row: 0, col: 5, dir: "down", clue: "Som de alegria." },
      { answer: "ELO",  row: 0, col: 6, dir: "down", clue: "Parte de uma corrente." },
      { answer: "RUA",  row: 0, col: 7, dir: "down", clue: "Onde passam carros." },
      { answer: "DIA",  row: 0, col: 8, dir: "down", clue: "24 horas." },
    ],
  },
  {
    id: 8, size: 9,
    words: [
      { answer: "MUSI", row: 0, col: 0, dir: "across", clue: "Música (curto)." },
      { answer: "NOTA", row: 2, col: 0, dir: "across", clue: "Dó, Ré, Mi..." },
      { answer: "RITMO",row: 4, col: 0, dir: "across", clue: "Organização do tempo na música." },
      { answer: "CORO", row: 6, col: 0, dir: "across", clue: "Grupo que canta junto." },
      { answer: "SOM",  row: 8, col: 0, dir: "across", clue: "O que ouvimos." },

      { answer: "SINO",  row: 0, col: 4, dir: "down", clue: "Toca e faz barulho." },
      { answer: "TOMO",  row: 0, col: 5, dir: "down", clue: "Volume de um livro." },
      { answer: "ORO",   row: 0, col: 6, dir: "down", clue: "Metal precioso." },
      { answer: "MOLA",  row: 0, col: 7, dir: "down", clue: "Peça que estica e volta." },
      { answer: "VIOLA", row: 0, col: 8, dir: "down", clue: "Instrumento de cordas (var.)." },
    ],
  },
  {
    id: 9, size: 9,
    words: [
      { answer: "BRASIL",row: 0, col: 0, dir: "across", clue: "País da América do Sul." },
      { answer: "RIO",   row: 2, col: 0, dir: "across", clue: "Curso de água." },
      { answer: "CIDADE",row: 4, col: 0, dir: "across", clue: "Lugar com muitas pessoas." },
      { answer: "PONTE", row: 6, col: 0, dir: "across", clue: "Passagem sobre rio/vale." },
      { answer: "PARQUE",row: 8, col: 0, dir: "across", clue: "Lugar de lazer ao ar livre." },

      { answer: "BOLA", row: 0, col: 4, dir: "down", clue: "Usada em esportes." },
      { answer: "RODA", row: 0, col: 5, dir: "down", clue: "Parte que gira." },
      { answer: "ILHA", row: 0, col: 6, dir: "down", clue: "Terra cercada por água." },
      { answer: "LUA",  row: 0, col: 7, dir: "down", clue: "Satélite da Terra." },
      { answer: "NORTE",row: 0, col: 8, dir: "down", clue: "Ponto cardeal." },
    ],
  },
  {
    id: 10, size: 9,
    words: [
      { answer: "HOJE",  row: 0, col: 0, dir: "across", clue: "O dia atual." },
      { answer: "ONTEM", row: 2, col: 0, dir: "across", clue: "O dia anterior." },
      { answer: "AGORA", row: 4, col: 0, dir: "across", clue: "Neste momento." },
      { answer: "FOTO",  row: 6, col: 0, dir: "across", clue: "Imagem registrada." },
      { answer: "ROTA",  row: 8, col: 0, dir: "across", clue: "Caminho a seguir." },

      { answer: "FUTURO",row: 0, col: 4, dir: "down", clue: "O que ainda vai acontecer." },
      { answer: "TEMA",  row: 0, col: 5, dir: "down", clue: "Assunto principal." },
      { answer: "USO",   row: 0, col: 6, dir: "down", clue: "Utilização." },
      { answer: "ORAR",  row: 0, col: 7, dir: "down", clue: "Fazer uma prece." },
      { answer: "IDEIA", row: 0, col: 8, dir: "down", clue: "Pensamento, plano." },
    ],
  },
];

/* =========================================================
  STATE
========================================================= */
const state = {
  levelIndex: 0,
  size: 9,
  grid: [],
  cellEls: [],
  words: [],
  activeCell: null,
  activeWordId: null,
  dir: "across",
  penaltySeconds: 0,
  seconds: 0,
  timerId: null,
  paused: false,
  winShown: false,
  coins: 0,
};

/* =========================================================
  BUILD + RENDER
========================================================= */
function buildLevel(level){
  state.size = level.size;

  state.grid = Array.from({length: state.size}, (_, r) =>
    Array.from({length: state.size}, (_, c) => ({
      r, c,
      isBlock: true,
      solution: "",
      value: "",
      locked: false,
      num: null,
    }))
  );

  for (const w of level.words){
    const ans = sanitizeWord(w.answer);
    const dr = w.dir === "down" ? 1 : 0;
    const dc = w.dir === "across" ? 1 : 0;

    for (let i = 0; i < ans.length; i++){
      const rr = w.row + dr*i;
      const cc = w.col + dc*i;
      if (!inBounds(rr,cc)) continue;

      const cell = cellAt(rr,cc);
      cell.isBlock = false;
      if (!cell.solution) cell.solution = ans[i];
    }
  }

  let n = 1;
  const startMap = new Map();
  for (let r=0; r<state.size; r++){
    for (let c=0; c<state.size; c++){
      const cell = cellAt(r,c);
      if (cell.isBlock) continue;

      const leftBlocked = (c === 0) || cellAt(r, c-1)?.isBlock;
      const upBlocked = (r === 0) || cellAt(r-1, c)?.isBlock;

      const hasAcross = leftBlocked && !cellAt(r, c+1)?.isBlock;
      const hasDown = upBlocked && !cellAt(r+1, c)?.isBlock;

      if (hasAcross || hasDown){
        startMap.set(`${r},${c}`, n);
        cell.num = n;
        n++;
      }
    }
  }

  state.words = level.words.map((w, idx) => {
    const ans = sanitizeWord(w.answer);
    const dr = w.dir === "down" ? 1 : 0;
    const dc = w.dir === "across" ? 1 : 0;

    const cells = [];
    for (let i = 0; i < ans.length; i++){
      const rr = w.row + dr*i;
      const cc = w.col + dc*i;
      if (inBounds(rr,cc) && !cellAt(rr,cc).isBlock) cells.push({r: rr, c: cc});
    }

    const num = startMap.get(`${w.row},${w.col}`) || (idx+1);
    const id = `${w.dir}-${num}`;
    return { id, num, dir: w.dir, clue: w.clue, answer: ans, cells, done: false };
  });

  setText(UI.levelTotal, String(levels.length));
  setText(UI.levelLabel, String(level.id));

  setAttr(UI.grid, "aria-rowcount", String(state.size));
  setAttr(UI.grid, "aria-colcount", String(state.size));
}

function renderGrid(){
  if (!UI.grid) return;
  UI.grid.style.setProperty("--cols", state.size);
  UI.grid.innerHTML = "";
  state.cellEls = Array.from({length: state.size}, () => Array(state.size).fill(null));

  for (let r=0; r<state.size; r++){
    for (let c=0; c<state.size; c++){
      const cell = cellAt(r,c);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cell" + (cell.isBlock ? " block" : "");
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-rowindex", String(r+1));
      btn.setAttribute("aria-colindex", String(c+1));
      btn.dataset.r = String(r);
      btn.dataset.c = String(c);
      btn.tabIndex = cell.isBlock ? -1 : 0;

      if (!cell.isBlock && cell.num){
        const num = document.createElement("span");
        num.className = "num";
        num.textContent = String(cell.num);
        btn.appendChild(num);
      }

      const letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = "";
      btn.appendChild(letter);

      state.cellEls[r][c] = btn;
      UI.grid.appendChild(btn);
    }
  }
}

/* =========================================================
  SELEÇÃO + DICA (SÓ O ESSENCIAL)
========================================================= */
function getWordsAtCell(r,c){
  const list = [];
  for (const w of state.words){
    if (w.cells.some(p => p.r === r && p.c === c)) list.push(w);
  }
  return list;
}

function setDirection(dir){
  state.dir = dir;
}

function setActiveWord(word){
  state.activeWordId = word ? word.id : null;
  updateHighlights();
  updateClue();
}

function setActiveCell(r,c, preferToggle=false){
  const cell = cellAt(r,c);
  if (!cell || cell.isBlock) return;

  const candidates = getWordsAtCell(r,c);

  if (!candidates.length){
    state.activeCell = {r,c};
    setActiveWord(null);
    focusInput();
    return;
  }

  let chosen =
    candidates.find(w => w.dir === state.dir) ||
    candidates.find(w => w.dir === "across") ||
    candidates[0];

  // ✅ 2º toque na mesma célula alterna direção (ótimo no mobile)
  if (preferToggle && candidates.length >= 2){
    const other = candidates.find(w => w.dir !== chosen.dir);
    if (other) chosen = other;
  }

  state.activeCell = {r,c};
  setDirection(chosen.dir);
  setActiveWord(chosen);
  focusInput();
}

function focusInput(){
  UI.hiddenInput?.focus({ preventScroll: true });
}

function clearCellClasses(){
  for (let r=0; r<state.size; r++){
    for (let c=0; c<state.size; c++){
      const el = state.cellEls[r][c];
      if (!el) continue;
      el.classList.remove("active", "in-word");
    }
  }
}

function updateHighlights(){
  clearCellClasses();
  if (!state.activeCell) return;

  const {r,c} = state.activeCell;
  const activeEl = state.cellEls[r]?.[c];
  if (activeEl) activeEl.classList.add("active");

  const w = state.words.find(x => x.id === state.activeWordId);
  if (!w) return;

  for (const p of w.cells){
    const el = state.cellEls[p.r]?.[p.c];
    if (el) el.classList.add("in-word");
  }
}

function updateClue(){
  const w = state.words.find(x => x.id === state.activeWordId);
  if (!w){
    setText(UI.clueText, "Clique em uma célula para selecionar uma palavra.");
    return;
  }
  setText(UI.clueText, w.clue);
}

/* =========================================================
  COINS
========================================================= */
function setCoins(n){
  state.coins = Math.max(0, n|0);
  setText(UI.coinLabel, String(state.coins));
}
function addCoins(amount){
  setCoins(state.coins + amount);
  pulseCoins();
}

/* =========================================================
  INPUT
========================================================= */
function setLetter(r,c,ch){
  const cell = cellAt(r,c);
  if (!cell || cell.isBlock) return;
  if (cell.locked) return;

  const v = ch ? sanitizeWord(ch).slice(0,1) : "";
  cell.value = v;

  const el = state.cellEls[r][c];
  if (el){
    const span = el.querySelector(".letter");
    if (span) span.textContent = v;
  }

  validateCell(r,c);
}

function validateCell(r,c){
  const cell = cellAt(r,c);
  const el = state.cellEls[r][c];
  if (!cell || !el || cell.isBlock) return;

  el.classList.remove("wrong");
  if (!cell.value) return;

  if (cell.value !== cell.solution && !cell.locked){
    el.classList.add("wrong");
  }
}

function getActiveWord(){
  return state.words.find(x => x.id === state.activeWordId) || null;
}

function moveWithinWord(step){
  const w = getActiveWord();
  if (!w || !state.activeCell) return;

  const idx = w.cells.findIndex(p => p.r === state.activeCell.r && p.c === state.activeCell.c);
  if (idx < 0) return;

  let next = idx + step;
  while (next >= 0 && next < w.cells.length){
    const p = w.cells[next];
    const cell = cellAt(p.r,p.c);
    if (cell && !cell.isBlock){
      state.activeCell = {r: p.r, c: p.c};
      updateHighlights();
      return;
    }
    next += step;
  }
}

function handleKeyDown(e){
  if (state.paused) return;

  if (e.key === "Tab"){
    e.preventDefault();
    if (!state.activeCell) return;

    const candidates = getWordsAtCell(state.activeCell.r, state.activeCell.c);
    if (candidates.length >= 2){
      const otherDir = state.dir === "across" ? "down" : "across";
      const other = candidates.find(x => x.dir === otherDir);
      if (other){
        setDirection(otherDir);
        setActiveWord(other);
      }
    }
    return;
  }

  const nav = {
    ArrowUp: [-1,0],
    ArrowDown: [1,0],
    ArrowLeft: [0,-1],
    ArrowRight: [0,1],
  };
  if (nav[e.key]){
    e.preventDefault();
    if (!state.activeCell) return;

    let [dr,dc] = nav[e.key];
    let rr = state.activeCell.r + dr;
    let cc = state.activeCell.c + dc;

    while (inBounds(rr,cc) && cellAt(rr,cc).isBlock){
      rr += dr;
      cc += dc;
    }
    if (inBounds(rr,cc) && !cellAt(rr,cc).isBlock){
      state.activeCell = {r: rr, c: cc};
      updateHighlights();
      focusInput();
    }
    return;
  }

  if (e.key === "Backspace"){
    e.preventDefault();
    if (!state.activeCell) return;

    const cell = cellAt(state.activeCell.r, state.activeCell.c);
    if (!cell || cell.isBlock) return;

    if (cell.value){
      setLetter(state.activeCell.r, state.activeCell.c, "");
    } else {
      moveWithinWord(-1);
      const prev = cellAt(state.activeCell.r, state.activeCell.c);
      if (prev && !prev.locked) setLetter(state.activeCell.r, state.activeCell.c, "");
    }

    validateWords();
    return;
  }

  if (isAlphaKey(e.key)){
    e.preventDefault();
    if (!state.activeCell) return;

    const ch = sanitizeWord(e.key);
    if (!ch) return;

    setLetter(state.activeCell.r, state.activeCell.c, ch);

    const w = getActiveWord();
    if (w) moveWithinWord(1);

    validateWords();
    return;
  }
}

/* =========================================================
  RECOMPENSAS
========================================================= */
function rewardWord(w){
  const amount = Math.max(3, Math.min(8, w.answer.length));
  addCoins(amount);

  const fromP = w.cells[Math.max(0, w.cells.length - 1)];
  const fromEl = state.cellEls[fromP.r]?.[fromP.c];
  const toEl = UI.coinLabel || document.querySelector(".hud-coins");

  spawnSpark(fromEl);
  const coinsToSpawn = Math.min(6, amount);
  for (let i=0; i<coinsToSpawn; i++){
    spawnCoin(fromEl, toEl, i * 45);
  }

  playChime("word");
}

function rewardLevel(){
  addCoins(10);
  playChime("level");

  const centerEl = UI.grid;
  if (centerEl){
    for (let i=0; i<10; i++){
      setTimeout(() => spawnSpark(centerEl), i * 35);
    }
    const toEl = UI.coinLabel || document.querySelector(".hud-coins");
    for (let i=0; i<6; i++){
      spawnCoin(centerEl, toEl, i * 60);
    }
  }
}

/* =========================================================
  VALIDAÇÃO
========================================================= */
function validateWords(){
  let justCompleted = [];

  for (const w of state.words){
    if (w.done) continue;

    let allFilled = true;
    let allCorrect = true;

    for (let i=0; i<w.cells.length; i++){
      const p = w.cells[i];
      const cell = cellAt(p.r,p.c);
      if (!cell.value) allFilled = false;
      if (!cell.value || cell.value !== cell.solution) allCorrect = false;
    }

    if (allFilled && allCorrect){
      w.done = true;
      justCompleted.push(w);

      for (const p of w.cells){
        const cell = cellAt(p.r,p.c);
        cell.locked = true;
        const el = state.cellEls[p.r][p.c];
        if (el) el.classList.add("locked");
        el?.classList.remove("wrong");
      }
    }
  }

  for (const w of justCompleted) rewardWord(w);

  const allDone = state.words.length > 0 && state.words.every(w => w.done);
  if (allDone && !state.winShown){
    state.winShown = true;
    rewardLevel();
    showWin();
  }
}

/* =========================================================
  TIMER / PAUSE
========================================================= */
function startTimer(){
  stopTimer();
  state.timerId = setInterval(() => {
    if (!state.paused){
      state.seconds += 1;
      setText(UI.timeLabel, formatTime(state.seconds));
    }
  }, 1000);
}
function stopTimer(){
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}
function setPaused(p){
  state.paused = p;
  if (UI.pauseOverlay) UI.pauseOverlay.hidden = !p;
  if (p) UI.hiddenInput?.blur();
  else focusInput();
}
function togglePause(){ setPaused(!state.paused); }

/* overlays */
function showWin(){
  const total = state.seconds + state.penaltySeconds;
  setText(UI.winSummary, `Tempo: ${formatTime(state.seconds)} | Total: ${formatTime(total)} | Moedas: ${state.coins}`);
  if (UI.winOverlay) UI.winOverlay.hidden = false;
}
function closeWin(){
  if (UI.winOverlay) UI.winOverlay.hidden = true;
}

/* =========================================================
  NÍVEL
========================================================= */
function loadLevel(index){
  const level = levels[index];
  state.levelIndex = index;
  state.seconds = 0;
  state.penaltySeconds = 0;
  state.paused = false;
  state.winShown = false;
  setCoins(0);

  setText(UI.timeLabel, "00:00");
  if (UI.penaltyLabel) UI.penaltyLabel.textContent = "+0s";

  if (UI.winOverlay) UI.winOverlay.hidden = true;
  if (UI.pauseOverlay) UI.pauseOverlay.hidden = true;

  buildLevel(level);
  renderGrid();

  for (let r=0; r<state.size; r++){
    for (let c=0; c<state.size; c++){
      const cell = cellAt(r,c);
      cell.value = "";
      cell.locked = false;
    }
  }

  outer:
  for (let r=0; r<state.size; r++){
    for (let c=0; c<state.size; c++){
      if (!cellAt(r,c).isBlock){
        state.activeCell = {r,c};
        break outer;
      }
    }
  }

  const candidates = getWordsAtCell(state.activeCell.r, state.activeCell.c);
  const chosen = candidates.find(w => w.dir === "across") || candidates[0] || null;
  if (chosen){
    setDirection(chosen.dir);
    setActiveWord(chosen);
  } else {
    setActiveWord(null);
  }

  updateHighlights();
  updateClue();
  startTimer();
  focusInput();
}

function resetLevel(){ loadLevel(state.levelIndex); }
function nextLevel(){
  const idx = Math.min(state.levelIndex + 1, levels.length - 1);
  loadLevel(idx);
}

/* =========================================================
  EVENTS
========================================================= */
function onGridClick(e){
  const btn = e.target.closest(".cell");
  if (!btn) return;

  const r = Number(btn.dataset.r);
  const c = Number(btn.dataset.c);
  if (cellAt(r,c).isBlock) return;

  const isSameCell = state.activeCell && state.activeCell.r === r && state.activeCell.c === c;
  setActiveCell(r,c, isSameCell);
}

function bindUI(){
  on(UI.grid, "click", onGridClick);

  on(UI.pauseCloseBtn, "click", () => setPaused(false));
  on(UI.resumeBtn, "click", () => setPaused(false));

  on(UI.winCloseBtn, "click", closeWin);
  on(UI.winResetBtn, "click", () => { closeWin(); resetLevel(); });
  on(UI.winNextBtn, "click", () => { closeWin(); nextLevel(); });

  document.addEventListener("keydown", handleKeyDown);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (UI.winOverlay && !UI.winOverlay.hidden) closeWin();
    if (UI.pauseOverlay && !UI.pauseOverlay.hidden) setPaused(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPaused(true);
  });

  // iOS: desbloqueia áudio no 1º toque
  const unlock = () => {
    const ac = audioContext();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume().catch(()=>{});
  };
  document.addEventListener("pointerdown", unlock, { once: true, capture: true });
}

/* =========================================================
  INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  bindUI();
  loadLevel(0);
});
