/* =========================================================
   Crossword Elite - Game Logic (ES6+)
   - Mobile-first, acessível, responsivo
   - Seleção horizontal/vertical, input letra a letra
   - Dicas com penalidade (+10s por letra, +30s por palavra)
   - 10 níveis iniciais, cada nível com >= 10 palavras
========================================================= */

/* =========================
   CONFIG
========================= */
const CONFIG = {
  hintPenaltyPerLetter: 10,
  hintPenaltyWord: 30,
  defaultDir: "H",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
};

/* =========================
   LEVEL DATA
   - Formato: { id, size, words: [{ answer, row, col, dir, clue, extras }] }
   - blocks é opcional: se não existir, será gerado automaticamente
========================= */
const levels = [
  {
    id: 1,
    size: 11,
    words: [
      { answer: "JANELA", row: 1, col: 1, dir: "H", clue: "Abertura na parede para entrada de luz/vento.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "PORTA",  row: 3, col: 1, dir: "H", clue: "Entrada principal de uma casa.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "TELHADO",row: 5, col: 1, dir: "H", clue: "Cobertura superior de uma casa.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GARAGEM",row: 7, col: 1, dir: "H", clue: "Lugar para guardar carro/moto.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JARDIM", row: 9, col: 1, dir: "H", clue: "Área com plantas e flores.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GATO",   row: 0, col: 9, dir: "V", clue: "Animal de estimação que mia.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 4, col:10, dir: "V", clue: "Atividade divertida com regras.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Pessoa/livro que orienta um caminho.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNHO",  row: 5, col: 9, dir: "V", clue: "Mês do ano (Festas Juninas).", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 0, col:10, dir: "V", clue: "Água em estado sólido e frio.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 2,
    size: 11,
    words: [
      { answer: "JORNAL", row: 1, col: 1, dir: "H", clue: "Publicação com notícias.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 3, col: 1, dir: "H", clue: "Passatempo com desafio.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELADO", row: 5, col: 1, dir: "H", clue: "Muito frio.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JANELA", row: 7, col: 1, dir: "H", clue: "Abre para ventilar e iluminar.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GIRAFA", row: 9, col: 1, dir: "H", clue: "Animal de pescoço comprido.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GEMA",   row: 0, col: 9, dir: "V", clue: "Parte amarela do ovo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 4, col:10, dir: "V", clue: "Algo que você joga por diversão.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Ajuda a encontrar um caminho.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JATO",   row: 2, col: 9, dir: "V", clue: "Saída forte de água/ar.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 0, col:10, dir: "V", clue: "Água congelada.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 3,
    size: 11,
    words: [
      { answer: "JESUS",  row: 1, col: 1, dir: "H", clue: "Nome próprio (com J).", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GEADA",  row: 3, col: 1, dir: "H", clue: "Camada fina de gelo no amanhecer.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNTO",  row: 5, col: 1, dir: "H", clue: "O contrário de separado.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GOSTO",  row: 7, col: 1, dir: "H", clue: "Sabor ou preferência.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JANTA",  row: 9, col: 1, dir: "H", clue: "Refeição da noite.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "JOGO",   row: 0, col: 9, dir: "V", clue: "Atividade recreativa.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GOMA",   row: 4, col:10, dir: "V", clue: "Substância pegajosa/borracha.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JILO",   row: 6, col: 8, dir: "V", clue: "Legume amargo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 5, col: 9, dir: "V", clue: "Orienta o trajeto.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 0, col:10, dir: "V", clue: "Congelado.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 4,
    size: 11,
    words: [
      { answer: "JOGO",   row: 1, col: 1, dir: "H", clue: "Algo que você joga.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GANSO",  row: 3, col: 1, dir: "H", clue: "Ave que parece pato.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNTA",  row: 5, col: 1, dir: "H", clue: "Reúne, coloca junto.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELAR",  row: 7, col: 1, dir: "H", clue: "Deixar bem frio.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JARRO",  row: 9, col: 1, dir: "H", clue: "Recipiente para água/flores.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GALO",   row: 0, col: 9, dir: "V", clue: "Ave que canta de manhã.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JATO",   row: 4, col:10, dir: "V", clue: "Saída forte (água/ar).", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 6, col: 8, dir: "V", clue: "Diversão com regras.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 5, col: 9, dir: "V", clue: "Orientação/caminho.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 0, col:10, dir: "V", clue: "Água sólida.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 5,
    size: 11,
    words: [
      { answer: "GENTE",  row: 1, col: 1, dir: "H", clue: "Pessoas (coletivo).", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNHO",  row: 3, col: 1, dir: "H", clue: "Mês do calendário.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 5, col: 1, dir: "H", clue: "Atividade divertida.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GIRAR",  row: 7, col: 1, dir: "H", clue: "Dar voltas.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JARRA",  row: 9, col: 1, dir: "H", clue: "Recipiente para líquidos.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "JOGO",   row: 0, col: 9, dir: "V", clue: "Passatempo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GOMA",   row: 4, col:10, dir: "V", clue: "Cola/borracha.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Direciona a rota.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GALO",   row: 5, col: 9, dir: "V", clue: "Ave doméstica.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 0, col:10, dir: "V", clue: "Congelado.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 6,
    size: 11,
    words: [
      { answer: "JIBOIA", row: 1, col: 1, dir: "H", clue: "Serpente não venenosa.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 3, col: 1, dir: "H", clue: "Água congelada.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGAR",  row: 5, col: 1, dir: "H", clue: "Brincar/participar de um jogo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GIRASSOL",row: 7, col: 1, dir: "H", clue: "Flor que acompanha o sol.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JANELA", row: 9, col: 1, dir: "H", clue: "Abre para ventilar.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GATO",   row: 0, col: 9, dir: "V", clue: "Animal que mia.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JATO",   row: 4, col:10, dir: "V", clue: "Fluxo forte.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Orienta.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNTO",  row: 5, col: 9, dir: "V", clue: "Tudo no mesmo lugar.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GEMA",   row: 0, col:10, dir: "V", clue: "Parte amarela do ovo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 7,
    size: 11,
    words: [
      { answer: "JURADO", row: 1, col: 1, dir: "H", clue: "Pessoa que julga uma competição.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 3, col: 1, dir: "H", clue: "Congelado.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNTA",  row: 5, col: 1, dir: "H", clue: "Reúne.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELADO", row: 7, col: 1, dir: "H", clue: "Muito frio.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JANTAR", row: 9, col: 1, dir: "H", clue: "Fazer a refeição da noite.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GALO",   row: 0, col: 9, dir: "V", clue: "Ave que canta cedo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 4, col:10, dir: "V", clue: "Diversão.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Orientação.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JATO",   row: 5, col: 9, dir: "V", clue: "Saída forte.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GEMA",   row: 0, col:10, dir: "V", clue: "Parte amarela do ovo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 8,
    size: 11,
    words: [
      { answer: "JOGADA", row: 1, col: 1, dir: "H", clue: "Movimento em um jogo/esporte.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GIRAR",  row: 3, col: 1, dir: "H", clue: "Dar voltas.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNTO",  row: 5, col: 1, dir: "H", clue: "Na mesma posição.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GOSTO",  row: 7, col: 1, dir: "H", clue: "Sabor/preferência.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JARRA",  row: 9, col: 1, dir: "H", clue: "Recipiente grande.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GATO",   row: 0, col: 9, dir: "V", clue: "Mia e ronrona.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 4, col:10, dir: "V", clue: "Diversão com regras.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Direciona.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNHO",  row: 5, col: 9, dir: "V", clue: "Mês do ano.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 0, col:10, dir: "V", clue: "Água sólida.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 9,
    size: 11,
    words: [
      { answer: "JOGOS",  row: 1, col: 1, dir: "H", clue: "Diversões com regras.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELAR",  row: 3, col: 1, dir: "H", clue: "Deixar frio.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JUNTA",  row: 5, col: 1, dir: "H", clue: "Reúne.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GIRASSOL",row: 7, col: 1, dir: "H", clue: "Flor amarela.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JANELA", row: 9, col: 1, dir: "H", clue: "Abre na parede.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GALO",   row: 0, col: 9, dir: "V", clue: "Canta cedo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JATO",   row: 4, col:10, dir: "V", clue: "Fluxo forte.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Orienta.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 5, col: 9, dir: "V", clue: "Passatempo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GEMA",   row: 0, col:10, dir: "V", clue: "Parte do ovo.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },

  {
    id: 10,
    size: 11,
    words: [
      { answer: "JUNHO",  row: 1, col: 1, dir: "H", clue: "Mês (Festas Juninas).", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELADO", row: 3, col: 1, dir: "H", clue: "Muito frio.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGAR",  row: 5, col: 1, dir: "H", clue: "Brincar/participar.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GOSTO",  row: 7, col: 1, dir: "H", clue: "Preferência.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JANTAR", row: 9, col: 1, dir: "H", clue: "Refeição da noite.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },

      { answer: "GATO",   row: 0, col: 9, dir: "V", clue: "Animal doméstico.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JOGO",   row: 4, col:10, dir: "V", clue: "Diversão com regras.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GUIA",   row: 6, col: 8, dir: "V", clue: "Ajuda a ir ao destino.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "JATO",   row: 5, col: 9, dir: "V", clue: "Saída forte.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
      { answer: "GELO",   row: 0, col:10, dir: "V", clue: "Água congelada.", extras: ["Revela 1 letra", "Revela 2 letras", "Mostra a palavra"] },
    ],
  },
];

/* =========================
   STATE
========================= */
const state = {
  levelIndex: 0,
  dir: CONFIG.defaultDir,
  activeWordId: null,
  activeCell: { r: 0, c: 0 },
  timeSec: 0,
  penaltySec: 0,
  timerId: null,
  paused: false,

  gridSize: 0,
  solution: [],
  blocks: [],
  typed: [],
  locked: [],
  wrong: [],
  wordMap: new Map(), // id -> word info
};

/* =========================
   DOM
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ui = {
  levelLabel: $("#levelLabel"),
  timeLabel: $("#timeLabel"),
  penaltyLabel: $("#penaltyLabel"),

  btnPause: $("#btnPause"),
  btnReset: $("#btnReset"),
  btnNext: $("#btnNext"),
  btnToggleKeyboard: $("#btnToggleKeyboard"),

  dirH: $("#dirH"),
  dirV: $("#dirV"),

  clueText: $("#clueText"),
  extrasArea: $("#extrasArea"),
  progressText: $("#progressText"),

  grid: $("#grid"),
  srInput: $("#srInput"),

  listAcross: $("#listAcross"),
  listDown: $("#listDown"),

  keyboardArea: $("#keyboardArea"),
  keyboard: $("#keyboard"),

  overlayPause: $("#overlayPause"),
  overlayWin: $("#overlayWin"),
  overlayWinTitle: $("#overlayWinTitle"),
  overlayWinTime: $("#overlayWinTime"),
  overlayWinPenalty: $("#overlayWinPenalty"),
  btnReplay: $("#btnReplay"),
  btnWinNext: $("#btnWinNext"),
  btnClosePause: $("#btnClosePause"),
  btnCloseWin: $("#btnCloseWin"),
};

/* =========================
   HELPERS
========================= */
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function formatTime(sec){
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function keyFor(r,c){ return `${r},${c}`; }

function inBounds(r,c){ return r >= 0 && c >= 0 && r < state.gridSize && c < state.gridSize; }

function getLevel(){ return levels[state.levelIndex]; }

function buildEmptyGrid(size, fill = ""){
  return Array.from({length: size}, () => Array.from({length: size}, () => fill));
}

function calcWordCells(word){
  const cells = [];
  const ans = word.answer.toUpperCase();
  for(let i=0;i<ans.length;i++){
    const r = word.dir === "H" ? word.row : word.row + i;
    const c = word.dir === "H" ? word.col + i : word.col;
    cells.push({ r, c, ch: ans[i] });
  }
  return cells;
}

/* Auto-block: tudo que não tem letra na solução vira bloco */
function buildAutoBlocks(solution){
  const blocks = [];
  for(let r=0;r<solution.length;r++){
    for(let c=0;c<solution.length;c++){
      if(!solution[r][c]) blocks.push({ row: r, col: c });
    }
  }
  return blocks;
}

function applyBlocksToGrid(grid, blocks){
  const blocked = buildEmptyGrid(grid.length, false);
  blocks.forEach(b => { if(inBounds(b.row,b.col)) blocked[b.row][b.col] = true; });
  return blocked;
}

function wordsByDir(){
  const level = getLevel();
  const across = [];
  const down = [];
  level.words.forEach((w, idx) => {
    const id = idx + 1;
    const item = { ...w, id, answer: w.answer.toUpperCase() };
    (item.dir === "H" ? across : down).push(item);
  });
  return { across, down };
}

/* =========================
   BUILD LEVEL
========================= */
function loadLevel(index){
  state.levelIndex = clamp(index, 0, levels.length - 1);

  const level = getLevel();
  state.gridSize = level.size;

  state.solution = buildEmptyGrid(level.size, "");
  state.typed = buildEmptyGrid(level.size, "");
  state.locked = buildEmptyGrid(level.size, false);
  state.wrong = buildEmptyGrid(level.size, false);

  // Preenche solução com palavras
  const wm = new Map();
  level.words.forEach((w, idx) => {
    const id = idx + 1;
    const word = { ...w, id, answer: w.answer.toUpperCase() };
    const cells = calcWordCells(word);
    cells.forEach(({r,c,ch}) => {
      if(inBounds(r,c)) state.solution[r][c] = ch;
    });
    wm.set(id, { ...word, cells });
  });
  state.wordMap = wm;

  // Blocks (auto se não vier)
  const blocks = level.blocks?.length ? level.blocks : buildAutoBlocks(state.solution);
  state.blocks = applyBlocksToGrid(state.solution, blocks);

  // Reset seleção
  state.dir = CONFIG.defaultDir;
  state.activeWordId = null;
  state.activeCell = findFirstPlayableCell() || { r:0, c:0 };

  // Timer e overlay
  stopTimer();
  state.timeSec = 0;
  state.penaltySec = 0;
  state.paused = false;

  hideAllOverlays();
  startTimer();

  renderAll();
  ensureActiveWordFromCell(state.activeCell.r, state.activeCell.c, true);
}

/* primeira célula jogável */
function findFirstPlayableCell(){
  for(let r=0;r<state.gridSize;r++){
    for(let c=0;c<state.gridSize;c++){
      if(!state.blocks[r][c]) return { r, c };
    }
  }
  return null;
}

/* =========================
   TIMER
========================= */
function startTimer(){
  stopTimer();
  state.timerId = setInterval(() => {
    if(state.paused) return;
    state.timeSec += 1;
    updateHud();
  }, 1000);
}

function stopTimer(){
  if(state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}

function addPenalty(sec){
  state.penaltySec += sec;
  state.timeSec += sec;
  updateHud();
}

function updateHud(){
  if(ui.levelLabel) ui.levelLabel.textContent = `Nível ${getLevel().id} / ${levels.length}`;
  if(ui.timeLabel) ui.timeLabel.textContent = formatTime(state.timeSec);
  if(ui.penaltyLabel) ui.penaltyLabel.textContent = `+${state.penaltySec}s`;
}

/* =========================
   OVERLAYS
========================= */
function hideAllOverlays(){
  if(ui.overlayPause) ui.overlayPause.hidden = true;
  if(ui.overlayWin) ui.overlayWin.hidden = true;
}

function setPaused(p){
  state.paused = p;
  if(ui.btnPause) ui.btnPause.textContent = state.paused ? "Continuar" : "Pausar";
  if(ui.overlayPause) ui.overlayPause.hidden = !state.paused;
}

/* =========================
   RENDER
========================= */
function renderAll(){
  updateHud();
  renderGrid();
  renderLists();
  renderSpotlight();
  renderKeyboard();
  updateNextButtonState();
}

function renderGrid(){
  if(!ui.grid) return;
  ui.grid.style.setProperty("--cols", state.gridSize);

  ui.grid.innerHTML = "";
  const frag = document.createDocumentFragment();

  for(let r=0;r<state.gridSize;r++){
    for(let c=0;c<state.gridSize;c++){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cell";
      btn.dataset.r = String(r);
      btn.dataset.c = String(c);

      if(state.blocks[r][c]){
        btn.classList.add("block");
        btn.setAttribute("aria-label", "Bloco");
        btn.tabIndex = -1;
      } else {
        const letter = state.typed[r][c] || "";
        btn.innerHTML = `<span class="num"></span><span class="letter">${letter}</span>`;
        btn.setAttribute("aria-label", `Linha ${r+1}, Coluna ${c+1}`);
      }

      if(!state.blocks[r][c] && state.wrong[r][c]) btn.classList.add("wrong");
      if(!state.blocks[r][c] && state.locked[r][c]) btn.classList.add("locked");

      frag.appendChild(btn);
    }
  }

  ui.grid.appendChild(frag);
  paintActiveHighlights();
}

function renderLists(){
  const { across, down } = wordsByDir();

  if(ui.listAcross) ui.listAcross.innerHTML = "";
  if(ui.listDown) ui.listDown.innerHTML = "";

  const buildItem = (w) => {
    const li = document.createElement("li");
    li.className = "clue-item";
    li.dataset.wordId = String(w.id);
    li.dataset.dir = w.dir;

    const done = isWordCompleteAndCorrect(w.id);
    if(done) li.classList.add("done");
    if(state.activeWordId === w.id) li.classList.add("active");

    li.innerHTML = `
      <div class="clue-line">
        <strong>${w.id}. ${w.answer.length} letras</strong>
        <span class="status">${done ? "✓" : ""}</span>
      </div>
      <div class="clue-text">${w.clue}</div>
    `;
    return li;
  };

  across.forEach(w => ui.listAcross && ui.listAcross.appendChild(buildItem(w)));
  down.forEach(w => ui.listDown && ui.listDown.appendChild(buildItem(w)));
}

function renderSpotlight(){
  const word = state.activeWordId ? state.wordMap.get(state.activeWordId) : null;
  if(ui.clueText) ui.clueText.textContent = word ? word.clue : "Toque em uma célula para começar.";

  // Direção
  if(ui.dirH) ui.dirH.setAttribute("aria-pressed", String(state.dir === "H"));
  if(ui.dirV) ui.dirV.setAttribute("aria-pressed", String(state.dir === "V"));

  // Progresso
  if(ui.progressText && word){
    const filled = countFilled(word);
    ui.progressText.textContent = `${word.answer.length} letras • preenchido: ${filled}/${word.answer.length}`;
  } else if(ui.progressText){
    ui.progressText.textContent = "";
  }

  // Extras
  if(ui.extrasArea){
    ui.extrasArea.innerHTML = "";
    const b1 = makeHintButton("Dica 1", `(+${CONFIG.hintPenaltyPerLetter}s)`, () => useHintLetters(1));
    const b2 = makeHintButton("Dica 2", `(+${CONFIG.hintPenaltyPerLetter*2}s)`, () => useHintLetters(2));
    const b3 = makeHintButton("Palavra", `(+${CONFIG.hintPenaltyWord}s)`, () => revealWord());
    ui.extrasArea.appendChild(b1);
    ui.extrasArea.appendChild(b2);
    ui.extrasArea.appendChild(b3);
  }
}

function makeHintButton(label, cost, onClick){
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-secondary hint-btn";
  btn.innerHTML = `<span>${label}</span><span class="hint-cost">${cost}</span>`;
  btn.addEventListener("click", onClick);
  if(!state.activeWordId || state.paused) btn.disabled = true;
  return btn;
}

function renderKeyboard(){
  if(!ui.keyboard || !ui.keyboardArea) return;

  // toggle
  if(ui.btnToggleKeyboard){
    ui.btnToggleKeyboard.textContent = ui.keyboardArea.hidden ? "Teclado" : "Teclado ✓";
  }

  ui.keyboard.innerHTML = "";
  const frag = document.createDocumentFragment();

  for(const ch of CONFIG.alphabet){
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = ch;
    b.addEventListener("click", () => handleLetterInput(ch));
    frag.appendChild(b);
  }

  const back = document.createElement("button");
  back.type = "button";
  back.textContent = "⌫";
  back.addEventListener("click", () => handleBackspace());
  frag.appendChild(back);

  ui.keyboard.appendChild(frag);
}

/* =========================
   SELECTION / ACTIVE WORD
========================= */
function findWordsAtCell(r,c){
  const hits = [];
  state.wordMap.forEach((w) => {
    if(w.cells.some(cell => cell.r === r && cell.c === c)) hits.push(w);
  });
  return hits;
}

function ensureActiveWordFromCell(r,c,force){
  const hits = findWordsAtCell(r,c).filter(w => !isWordLocked(w.id));
  if(!hits.length){
    state.activeWordId = null;
    state.activeCell = { r, c };
    paintActiveHighlights();
    renderSpotlight();
    return;
  }

  let chosen = null;

  if(force){
    chosen = hits.find(w => w.dir === state.dir) || hits[0];
  } else if(state.activeWordId && hits.some(w => w.id === state.activeWordId)){
    chosen = state.wordMap.get(state.activeWordId);
  } else {
    chosen = hits.find(w => w.dir === state.dir) || hits[0];
  }

  state.activeWordId = chosen.id;
  state.activeCell = { r, c };

  paintActiveHighlights();
  renderLists();
  renderSpotlight();
}

function toggleDirection(){
  state.dir = state.dir === "H" ? "V" : "H";
  if(state.activeWordId){
    const w = state.wordMap.get(state.activeWordId);
    // tenta manter a célula atual, mas escolher word da outra direção se existir nela
    ensureActiveWordFromCell(state.activeCell.r, state.activeCell.c, true);
  }
  renderSpotlight();
  paintActiveHighlights();
}

function paintActiveHighlights(){
  if(!ui.grid) return;

  // limpa classes
  $$(".cell", ui.grid).forEach(cell => {
    cell.classList.remove("active","in-word");
  });

  const { r, c } = state.activeCell;
  const activeBtn = ui.grid.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  if(activeBtn && !activeBtn.classList.contains("block")) activeBtn.classList.add("active");

  const word = state.activeWordId ? state.wordMap.get(state.activeWordId) : null;
  if(!word) return;

  word.cells.forEach(({r,c}) => {
    const el = ui.grid.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if(el && !el.classList.contains("block")) el.classList.add("in-word");
  });
}

/* =========================
   INPUT / NAV
========================= */
function focusSRInput(){
  if(ui.srInput) ui.srInput.focus({ preventScroll: true });
}

function moveInWord(delta){
  const w = state.activeWordId ? state.wordMap.get(state.activeWordId) : null;
  if(!w) return;

  // encontra índice da célula atual dentro da palavra
  const idx = w.cells.findIndex(x => x.r === state.activeCell.r && x.c === state.activeCell.c);
  const nextIdx = clamp(idx + delta, 0, w.cells.length - 1);
  const next = w.cells[nextIdx];
  state.activeCell = { r: next.r, c: next.c };
  paintActiveHighlights();
}

function handleLetterInput(ch){
  if(state.paused) return;
  const { r, c } = state.activeCell;
  if(!inBounds(r,c) || state.blocks[r][c] || state.locked[r][c]) return;

  state.typed[r][c] = ch.toUpperCase();

  validateCell(r,c);
  updateCellUI(r,c);

  // auto-avança
  moveToNextEditableCell(+1);

  // valida palavra
  validateActiveWordIfComplete();
  if(checkLevelComplete()) showWinOverlay();
}

function handleBackspace(){
  if(state.paused) return;
  const { r, c } = state.activeCell;
  if(!inBounds(r,c) || state.blocks[r][c]) return;

  // se a célula atual tem letra (e não lock), apaga ela
  if(!state.locked[r][c] && state.typed[r][c]){
    state.typed[r][c] = "";
    state.wrong[r][c] = false;
    updateCellUI(r,c);
    return;
  }

  // senão, volta e apaga anterior (se não lock)
  moveToPrevEditableCell();
  const p = state.activeCell;
  if(!state.locked[p.r][p.c]){
    state.typed[p.r][p.c] = "";
    state.wrong[p.r][p.c] = false;
    updateCellUI(p.r,p.c);
  }
}

function moveToNextEditableCell(delta){
  const w = state.activeWordId ? state.wordMap.get(state.activeWordId) : null;
  if(!w) return;

  const idx = w.cells.findIndex(x => x.r === state.activeCell.r && x.c === state.activeCell.c);
  for(let i=idx+delta;i<w.cells.length;i++){
    const cell = w.cells[i];
    if(!state.locked[cell.r][cell.c]){
      state.activeCell = { r: cell.r, c: cell.c };
      paintActiveHighlights();
      return;
    }
  }
}

function moveToPrevEditableCell(){
  const w = state.activeWordId ? state.wordMap.get(state.activeWordId) : null;
  if(!w) return;

  const idx = w.cells.findIndex(x => x.r === state.activeCell.r && x.c === state.activeCell.c);
  for(let i=idx-1;i>=0;i--){
    const cell = w.cells[i];
    if(!state.locked[cell.r][cell.c]){
      state.activeCell = { r: cell.r, c: cell.c };
      paintActiveHighlights();
      return;
    }
  }
}

/* =========================
   VALIDATION
========================= */
function validateCell(r,c){
  if(state.blocks[r][c] || !state.typed[r][c]) {
    state.wrong[r][c] = false;
    return;
  }
  state.wrong[r][c] = state.typed[r][c] !== state.solution[r][c];
}

function updateCellUI(r,c){
  if(!ui.grid) return;
  const el = ui.grid.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  if(!el) return;

  const letterEl = el.querySelector(".letter");
  if(letterEl) letterEl.textContent = state.typed[r][c] || "";

  el.classList.toggle("wrong", !!state.wrong[r][c]);
  el.classList.toggle("locked", !!state.locked[r][c]);
}

function isWordLocked(wordId){
  const w = state.wordMap.get(wordId);
  if(!w) return false;
  return w.cells.every(({r,c}) => state.locked[r][c]);
}

function countFilled(word){
  let n = 0;
  word.cells.forEach(({r,c}) => { if(state.typed[r][c]) n++; });
  return n;
}

function isWordCompleteAndCorrect(wordId){
  const w = state.wordMap.get(wordId);
  if(!w) return false;

  for(const cell of w.cells){
    if(!state.typed[cell.r][cell.c]) return false;
    if(state.typed[cell.r][cell.c] !== cell.ch) return false;
  }
  return true;
}

function lockWord(wordId){
  const w = state.wordMap.get(wordId);
  if(!w) return;

  w.cells.forEach(({r,c}) => {
    state.locked[r][c] = true;
    state.wrong[r][c] = false;
    updateCellUI(r,c);
  });
}

function validateActiveWordIfComplete(){
  if(!state.activeWordId) return;
  if(isWordCompleteAndCorrect(state.activeWordId)){
    lockWord(state.activeWordId);
    renderLists();
  }
}

function checkLevelComplete(){
  // nível completo se todas as palavras estiverem corretas
  for(const [id] of state.wordMap){
    if(!isWordCompleteAndCorrect(id)) return false;
  }
  return true;
}

function updateNextButtonState(){
  if(!ui.btnNext) return;
  ui.btnNext.disabled = (state.levelIndex >= levels.length - 1);
}

function showWinOverlay(){
  stopTimer();
  setPaused(true); // congela

  if(ui.overlayWin){
    ui.overlayWin.hidden = false;
  }
  if(ui.overlayWinTitle) ui.overlayWinTitle.textContent = "Nível concluído ✨";
  if(ui.overlayWinTime) ui.overlayWinTime.textContent = `Tempo: ${formatTime(state.timeSec)}`;
  if(ui.overlayWinPenalty) ui.overlayWinPenalty.textContent = `Penalidades: +${state.penaltySec}s`;

  // botão próximo do modal: bloqueia se não existir
  if(ui.btnWinNext) ui.btnWinNext.disabled = (state.levelIndex >= levels.length - 1);
}

function hideWinOverlay(){
  if(ui.overlayWin) ui.overlayWin.hidden = true;
}

/* =========================
   HINTS
========================= */
function useHintLetters(n){
  if(!state.activeWordId || state.paused) return;
  const w = state.wordMap.get(state.activeWordId);
  if(!w) return;

  // pega células vazias (não lock)
  const empty = w.cells.filter(({r,c}) => !state.typed[r][c] && !state.locked[r][c]);
  if(!empty.length) return;

  // embaralha
  for(let i=empty.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [empty[i], empty[j]] = [empty[j], empty[i]];
  }

  const pick = empty.slice(0, n);
  pick.forEach(({r,c,ch}) => {
    state.typed[r][c] = ch;
    state.wrong[r][c] = false;
    updateCellUI(r,c);
  });

  addPenalty(CONFIG.hintPenaltyPerLetter * pick.length);
  validateActiveWordIfComplete();
  if(checkLevelComplete()) showWinOverlay();
  renderSpotlight();
}

function revealWord(){
  if(!state.activeWordId || state.paused) return;
  const w = state.wordMap.get(state.activeWordId);
  if(!w) return;

  w.cells.forEach(({r,c,ch}) => {
    if(!state.locked[r][c]){
      state.typed[r][c] = ch;
      state.wrong[r][c] = false;
      updateCellUI(r,c);
    }
  });

  addPenalty(CONFIG.hintPenaltyWord);
  lockWord(state.activeWordId);
  renderLists();
  if(checkLevelComplete()) showWinOverlay();
  renderSpotlight();
}

/* =========================
   EVENTS
========================= */
function onGridClick(e){
  const cell = e.target.closest(".cell");
  if(!cell || !ui.grid.contains(cell)) return;

  const r = Number(cell.dataset.r);
  const c = Number(cell.dataset.c);

  if(state.blocks[r][c]) return;

  // se clicar na mesma célula e já existe palavra ativa, alterna direção
  if(state.activeCell.r === r && state.activeCell.c === c && state.activeWordId){
    toggleDirection();
  } else {
    state.activeCell = { r, c };
    ensureActiveWordFromCell(r,c,true);
  }

  focusSRInput();
}

function onListClick(e){
  const item = e.target.closest(".clue-item");
  if(!item) return;

  const id = Number(item.dataset.wordId);
  const w = state.wordMap.get(id);
  if(!w) return;

  state.dir = w.dir;
  state.activeWordId = id;

  // move foco para primeira célula não travada, senão a primeira
  const first = w.cells.find(({r,c}) => !state.locked[r][c]) || w.cells[0];
  state.activeCell = { r: first.r, c: first.c };

  paintActiveHighlights();
  renderLists();
  renderSpotlight();
  focusSRInput();
}

function onKeyDown(e){
  if(state.paused){
    if(e.key === "Escape") setPaused(false);
    return;
  }

  if(e.key === "Escape"){
    setPaused(true);
    return;
  }

  if(e.key === "Tab"){
    e.preventDefault();
    toggleDirection();
    return;
  }

  if(e.key === "Backspace"){
    e.preventDefault();
    handleBackspace();
    return;
  }

  // setas navegam dentro da palavra
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){
    e.preventDefault();
    if(!state.activeWordId) return;
    if(e.key === "ArrowLeft" || e.key === "ArrowUp") moveInWord(-1);
    if(e.key === "ArrowRight" || e.key === "ArrowDown") moveInWord(+1);
    return;
  }

  // letras
  const k = e.key.toUpperCase();
  if(CONFIG.alphabet.includes(k)){
    e.preventDefault();
    handleLetterInput(k);
  }
}

function onVisibilityChange(){
  if(document.hidden && !state.paused){
    setPaused(true);
  }
}

/* =========================
   CONTROLS
========================= */
function resetLevel(){
  loadLevel(state.levelIndex);
}

function nextLevel(){
  if(state.levelIndex >= levels.length - 1) return;
  loadLevel(state.levelIndex + 1);
}

function setupControls(){
  ui.grid?.addEventListener("click", onGridClick);
  ui.listAcross?.addEventListener("click", onListClick);
  ui.listDown?.addEventListener("click", onListClick);

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("visibilitychange", onVisibilityChange);

  ui.btnPause?.addEventListener("click", () => setPaused(!state.paused));
  ui.btnReset?.addEventListener("click", () => resetLevel());

  ui.btnNext?.addEventListener("click", () => {
    // opcional: só permite se concluiu
    if(!checkLevelComplete()){
      const ok = confirm("Você ainda não concluiu. Ir mesmo assim?");
      if(!ok) return;
    }
    nextLevel();
  });

  ui.btnToggleKeyboard?.addEventListener("click", () => {
    if(!ui.keyboardArea) return;
    ui.keyboardArea.hidden = !ui.keyboardArea.hidden;
    renderKeyboard();
  });

  ui.dirH?.addEventListener("click", () => { state.dir = "H"; ensureActiveWordFromCell(state.activeCell.r, state.activeCell.c, true); });
  ui.dirV?.addEventListener("click", () => { state.dir = "V"; ensureActiveWordFromCell(state.activeCell.r, state.activeCell.c, true); });

  ui.btnReplay?.addEventListener("click", () => { hideWinOverlay(); resetLevel(); });
  ui.btnWinNext?.addEventListener("click", () => { hideWinOverlay(); nextLevel(); });

  ui.btnClosePause?.addEventListener("click", () => setPaused(false));
  ui.btnCloseWin?.addEventListener("click", () => { hideWinOverlay(); setPaused(false); startTimer(); });

  // input invisível para mobile focar teclado do sistema quando quiser
  ui.srInput?.addEventListener("input", () => { ui.srInput.value = ""; });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  setupControls();
  loadLevel(0);
});
