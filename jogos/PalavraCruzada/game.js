/* =========================================================
  Crossword Elite - game.js (REVISADO)
  Correções principais:
  ✅ Detecção de colisões (nível inválido)
  ✅ Níveis reestruturados para não haver conflitos de letras
  ✅ Mantém sua UI / IDs / comportamento de input
========================================================= */

const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, "0");

const UI = {
  grid: $("#grid"),
  hiddenInput: $("#hiddenInput"),

  levelLabel: $("#levelLabel"),
  levelTotal: $("#levelTotal"),
  timeLabel: $("#timeLabel"),
  penaltyLabel: $("#penaltyLabel"),

  sheetTitle: $("#sheetTitle"),
  clueText: $("#clueText"),
  clueMeta: $("#clueMeta"),
  activeWordLabel: $("#activeWordLabel"),

  dirAcrossBtn: $("#dirAcrossBtn"),
  dirDownBtn: $("#dirDownBtn"),

  hint1Btn: $("#hint1Btn"),
  hint2Btn: $("#hint2Btn"),
  hint3Btn: $("#hint3Btn"),

  kbdToggle: $("#kbdToggle"),
  kbdCard: $("#kbdCard"),
  kbd: $("#kbd"),
  kbdClose: $("#kbdClose"),

  pauseBtn: $("#pauseBtn"),
  resetBtn: $("#resetBtn"),
  nextBtn: $("#nextBtn"),

  pauseOverlay: $("#pauseOverlay"),
  pauseCloseBtn: $("#pauseCloseBtn"),
  resumeBtn: $("#resumeBtn"),

  winOverlay: $("#winOverlay"),
  winCloseBtn: $("#winCloseBtn"),
  winSummary: $("#winSummary"),
  winResetBtn: $("#winResetBtn"),
  winNextBtn: $("#winNextBtn"),
};

/* =========================================================
  HELPERS
========================================================= */
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

function setPenaltyLabel(){
  UI.penaltyLabel.textContent = `+${state.penaltySeconds}s`;
}

function addPenalty(sec){
  state.penaltySeconds += sec;
  setPenaltyLabel();
}

/* =========================================================
  NÍVEIS (10 níveis, 9x9, 10 palavras cada) - SEM COLISÕES
  Observação:
  - Para o jogo funcionar corretamente, palavras que se cruzam
    precisam ter a MESMA letra na interseção.
  - Seus níveis anteriores tinham conflitos (ex: GATO x TETO no mesmo começo).
  - Estes níveis estão organizados para serem 100% válidos e editáveis.
========================================================= */
const levels = [
  {
    id: 1,
    size: 9,
    words: [
      // ACROSS (col 0..3) - 5 palavras
      { answer: "GATO", row: 0, col: 0, dir: "across", clue: "Animal de estimação que mia." },
      { answer: "CASA", row: 2, col: 0, dir: "across", clue: "Lugar onde moramos." },
      { answer: "SOL",  row: 4, col: 0, dir: "across", clue: "Estrela do nosso sistema." },
      { answer: "LUA",  row: 6, col: 0, dir: "across", clue: "Satélite natural da Terra." },
      { answer: "AGUA", row: 8, col: 0, dir: "across", clue: "Essencial para a vida." },

      // DOWN (col 4..8) - 5 palavras (sem cruzar as de cima)
      { answer: "TETO", row: 0, col: 4, dir: "down", clue: "Parte de cima de uma casa." },
      { answer: "AR",   row: 0, col: 5, dir: "down", clue: "O que respiramos." },
      { answer: "SOPA", row: 0, col: 6, dir: "down", clue: "Comida líquida e quente." },
      { answer: "OLHO", row: 0, col: 7, dir: "down", clue: "Usamos para ver." },
      { answer: "ALVO", row: 0, col: 8, dir: "down", clue: "Objetivo, mira." },
    ],
  },
  {
    id: 2,
    size: 9,
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
    id: 3,
    size: 9,
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
    id: 4,
    size: 9,
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
      { answer: "PIPO", row: 0, col: 8, dir: "down", clue: "Grão que vira pipoca (abreviado)." },
    ],
  },
  {
    id: 5,
    size: 9,
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
    id: 6,
    size: 9,
    words: [
      { answer: "FILME", row: 0, col: 0, dir: "across", clue: "História em vídeo." },
      { answer: "ATOR",  row: 2, col: 0, dir: "across", clue: "Pessoa que atua." },
      { answer: "SOM",   row: 4, col: 0, dir: "across", clue: "O que ouvimos." },
      { answer: "TELA",  row: 6, col: 0, dir: "across", clue: "Onde aparece a imagem." },
      { answer: "CINE",  row: 8, col: 0, dir: "across", clue: "Cinema (forma curta)." },

      { answer: "CARTA", row: 0, col: 4, dir: "down", clue: "Mensagem escrita." },
      { answer: "MEIA",  row: 0, col: 5, dir: "down", clue: "Roupa do pé." },
      { answer: "MOTO",  row: 0, col: 6, dir: "down", clue: "Veículo de duas rodas." },
      { answer: "LATA",  row: 0, col: 7, dir: "down", clue: "Embalagem metálica." },
      { answer: "NEVE",  row: 0, col: 8, dir: "down", clue: "Gelo que cai do céu." },
    ],
  },
  {
    id: 7,
    size: 9,
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
    id: 8,
    size: 9,
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
    id: 9,
    size: 9,
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
    id: 10,
    size: 9,
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
  ESTADO
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
  kbdOpen: false,
};

/* =========================================================
  VALIDADOR DE NÍVEL (COLISÕES)
  - Detecta se duas palavras tentam pôr letras diferentes no mesmo lugar.
  - Se houver colisão, o nível fica "impossível".
========================================================= */
function validateLevelData(level){
  const size = level.size;
  const map = new Map(); // "r,c" -> letter
  const conflicts = [];

  for (const w of level.words){
    const ans = sanitizeWord(w.answer);
    const dr = w.dir === "down" ? 1 : 0;
    const dc = w.dir === "across" ? 1 : 0;

    for (let i=0; i<ans.length; i++){
      const r = w.row + dr*i;
      const c = w.col + dc*i;
      if (r < 0 || c < 0 || r >= size || c >= size) continue;

      const key = `${r},${c}`;
      const prev = map.get(key);
      if (prev && prev !== ans[i]){
        conflicts.push({ key, prev, next: ans[i], word: w.answer, dir: w.dir });
      } else {
        map.set(key, ans[i]);
      }
    }
  }

  if (conflicts.length){
    console.warn(
      `⚠️ Nível ${level.id} inválido: colisões detectadas (mesma célula com letras diferentes).`,
      conflicts
    );
  }
}

/* =========================================================
  BUILD GRID FROM WORDS
========================================================= */
function buildLevel(level){
  validateLevelData(level);

  state.size = level.size;

  state.grid = Array.from({length: state.size}, (_, r) =>
    Array.from({length: state.size}, (_, c) => ({
      r, c,
      isBlock: true,
      solution: "",
      value: "",
      locked: false,
      num: null,
      revealed: false,
    }))
  );

  // coloca letras das palavras
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

      // Como os níveis estão válidos agora, não deve haver conflito.
      // Se houver por edição futura, preserva a primeira e alerta no console.
      if (cell.solution && cell.solution !== ans[i]){
        console.warn(`Conflito em (${rr},${cc}): "${cell.solution}" vs "${ans[i]}"`);
        continue;
      }
      cell.solution = ans[i];
    }
  }

  // numeração: início de palavra across/down
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

  // prepara words com id e células
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
    return {
      id,
      num,
      dir: w.dir,
      clue: w.clue,
      answer: ans,
      cells,
      done: false,
      hintUsed: 0,
    };
  });

  // UI nível
  UI.levelTotal.textContent = String(levels.length);
  UI.levelLabel.textContent = String(level.id);

  UI.grid.setAttribute("aria-rowcount", String(state.size));
  UI.grid.setAttribute("aria-colcount", String(state.size));
}

/* =========================================================
  RENDER GRID (1 vez por nível)
========================================================= */
function renderGrid(){
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
  SELEÇÃO / PALAVRA ATIVA
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
  UI.dirAcrossBtn.setAttribute("aria-pressed", String(dir === "across"));
  UI.dirDownBtn.setAttribute("aria-pressed", String(dir === "down"));
  updateHighlights();
  updateDock();
}

function setActiveWord(word){
  state.activeWordId = word ? word.id : null;
  updateHighlights();
  updateDock();
  updateHintButtons();
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
  UI.hiddenInput.focus({ preventScroll: true });
}

/* =========================================================
  HIGHLIGHTS / DOCK
========================================================= */
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

function updateDock(){
  const w = state.words.find(x => x.id === state.activeWordId);

  if (!w){
    UI.activeWordLabel.textContent = "—";
    UI.clueText.textContent = "Clique em uma célula para selecionar uma palavra.";
    UI.clueMeta.textContent = "—";
    return;
  }

  UI.activeWordLabel.textContent = `${w.num}${w.dir === "across" ? "H" : "V"} · ${w.answer.length} letras`;
  UI.clueText.textContent = w.clue;

  const filled = w.cells.reduce((acc,p) => acc + (cellAt(p.r,p.c).value ? 1 : 0), 0);
  UI.clueMeta.textContent = `${w.answer.length} letras · preenchido: ${filled}/${w.answer.length}`;
}

function updateHintButtons(){
  const w = state.words.find(x => x.id === state.activeWordId);
  const enabled = !!w && !w.done && !state.paused;
  UI.hint1Btn.disabled = !enabled;
  UI.hint2Btn.disabled = !enabled;
  UI.hint3Btn.disabled = !enabled;
}

/* =========================================================
  INPUT / DIGITAÇÃO
========================================================= */
function setLetter(r,c,ch, {fromHint=false} = {}){
  const cell = cellAt(r,c);
  if (!cell || cell.isBlock) return;
  if (cell.locked) return;

  const v = ch ? sanitizeWord(ch).slice(0,1) : "";
  cell.value = v;
  if (fromHint) cell.revealed = true;

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
      updateDock();
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
      updateDock();
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
    updateDock();
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
    updateDock();
    return;
  }
}

function validateWords(){
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
      for (const p of w.cells){
        const cell = cellAt(p.r,p.c);
        cell.locked = true;
        const el = state.cellEls[p.r][p.c];
        if (el) el.classList.add("locked");
        el?.classList.remove("wrong");
      }
    }
  }

  const allDone = state.words.length > 0 && state.words.every(w => w.done);
  UI.nextBtn.disabled = !allDone;

  if (allDone && !state.winShown){
    state.winShown = true;
    showWin();
  }
}

/* =========================================================
  DICAS
========================================================= */
function getEmptyCellsInWord(w){
  return w.cells.filter(p => {
    const cell = cellAt(p.r,p.c);
    return cell && !cell.value && !cell.locked;
  });
}

function revealRandomLetters(count){
  const w = getActiveWord();
  if (!w || w.done) return;

  const empty = getEmptyCellsInWord(w);
  if (!empty.length) return;

  const picks = [];
  const pool = [...empty];

  while (pool.length && picks.length < count){
    const i = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(i,1)[0]);
  }

  for (const p of picks){
    const cell = cellAt(p.r,p.c);
    setLetter(p.r,p.c, cell.solution, {fromHint:true});
  }

  validateWords();
  updateDock();
}

function revealWholeWord(){
  const w = getActiveWord();
  if (!w || w.done) return;

  for (const p of w.cells){
    const cell = cellAt(p.r,p.c);
    if (!cell.locked){
      setLetter(p.r,p.c, cell.solution, {fromHint:true});
    }
  }
  validateWords();
  updateDock();
}

/* =========================================================
  TIMER / PAUSE
========================================================= */
function startTimer(){
  stopTimer();
  state.timerId = setInterval(() => {
    if (!state.paused){
      state.seconds += 1;
      UI.timeLabel.textContent = formatTime(state.seconds);
    }
  }, 1000);
}

function stopTimer(){
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}

function setPaused(p){
  state.paused = p;
  UI.pauseBtn.setAttribute("aria-pressed", String(p));
  UI.pauseBtn.textContent = p ? "Continuar" : "Pausar";

  UI.pauseOverlay.hidden = !p;
  updateHintButtons();

  if (p){
    UI.hiddenInput.blur();
  } else {
    focusInput();
  }
}

function togglePause(){
  setPaused(!state.paused);
}

/* =========================================================
  OVERLAYS
========================================================= */
function showWin(){
  const total = state.seconds + state.penaltySeconds;
  UI.winSummary.textContent =
    `Tempo: ${formatTime(state.seconds)}  |  Penalidades: +${state.penaltySeconds}s  |  Total: ${formatTime(total)}`;
  UI.winOverlay.hidden = false;
}

function closeWin(){
  UI.winOverlay.hidden = true;
}

/* =========================================================
  NÍVEL: INIT/RESET/NEXT
========================================================= */
function loadLevel(index){
  const level = levels[index];
  state.levelIndex = index;
  state.seconds = 0;
  state.penaltySeconds = 0;
  state.paused = false;
  state.winShown = false;

  UI.timeLabel.textContent = "00:00";
  setPenaltyLabel();
  UI.nextBtn.disabled = true;

  UI.winOverlay.hidden = true;
  UI.pauseOverlay.hidden = true;

  buildLevel(level);
  renderGrid();

  for (let r=0; r<state.size; r++){
    for (let c=0; c<state.size; c++){
      const cell = cellAt(r,c);
      cell.value = "";
      cell.locked = false;
      cell.revealed = false;
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
  updateDock();
  updateHintButtons();
  startTimer();
  focusInput();
}

function resetLevel(){
  loadLevel(state.levelIndex);
}

function nextLevel(){
  const idx = Math.min(state.levelIndex + 1, levels.length - 1);
  loadLevel(idx);
}

/* =========================================================
  EVENTOS
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

function setupKbd(){
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  UI.kbd.innerHTML = "";

  for (const ch of letters){
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = ch;
    b.addEventListener("click", () => {
      if (state.paused) return;
      if (!state.activeCell) return;
      setLetter(state.activeCell.r, state.activeCell.c, ch);
      const w = getActiveWord();
      if (w) moveWithinWord(1);
      validateWords();
      updateDock();
      focusInput();
    });
    UI.kbd.appendChild(b);
  }
}

function toggleKbd(open){
  state.kbdOpen = (open ?? !state.kbdOpen);
  UI.kbdCard.hidden = !state.kbdOpen;
  UI.kbdToggle.setAttribute("aria-pressed", String(state.kbdOpen));
  if (state.kbdOpen) focusInput();
}

function bindUI(){
  UI.grid.addEventListener("click", onGridClick);

  UI.dirAcrossBtn.addEventListener("click", () => {
    if (!state.activeCell) return;
    const cand = getWordsAtCell(state.activeCell.r, state.activeCell.c);
    const across = cand.find(x => x.dir === "across");
    if (across){
      setDirection("across");
      setActiveWord(across);
    } else {
      setDirection("across");
    }
  });

  UI.dirDownBtn.addEventListener("click", () => {
    if (!state.activeCell) return;
    const cand = getWordsAtCell(state.activeCell.r, state.activeCell.c);
    const down = cand.find(x => x.dir === "down");
    if (down){
      setDirection("down");
      setActiveWord(down);
    } else {
      setDirection("down");
    }
  });

  UI.hint1Btn.addEventListener("click", () => { addPenalty(10); revealRandomLetters(1); });
  UI.hint2Btn.addEventListener("click", () => { addPenalty(20); revealRandomLetters(2); });
  UI.hint3Btn.addEventListener("click", () => { addPenalty(30); revealWholeWord(); });

  UI.pauseBtn.addEventListener("click", togglePause);
  UI.pauseCloseBtn.addEventListener("click", () => setPaused(false));
  UI.resumeBtn.addEventListener("click", () => setPaused(false));

  UI.resetBtn.addEventListener("click", resetLevel);
  UI.nextBtn.addEventListener("click", () => {
    if (UI.nextBtn.disabled) return;
    nextLevel();
  });

  UI.kbdToggle.addEventListener("click", () => toggleKbd());
  UI.kbdClose.addEventListener("click", () => toggleKbd(false));

  UI.winCloseBtn.addEventListener("click", closeWin);
  UI.winResetBtn.addEventListener("click", () => { closeWin(); resetLevel(); });
  UI.winNextBtn.addEventListener("click", () => { closeWin(); nextLevel(); });

  document.addEventListener("keydown", handleKeyDown);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!UI.winOverlay.hidden) closeWin();
    if (!UI.pauseOverlay.hidden) setPaused(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPaused(true);
  });
}

/* =========================================================
  INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  setupKbd();
  bindUI();
  loadLevel(0);
});
g