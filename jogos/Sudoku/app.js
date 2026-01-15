/* ==========================
   Sudoku Pro (Portfolio)
   - UI carismática + minimal dark
   - Mobile-first: aproveita tela
   - LocalStorage completo (salvar/continuar)
   - Notas (modo lápis)
   - Destaque: linha/coluna/bloco + mesmo número
   - Undo
   - Dica / Apagar / Reset nível
========================== */

const LS_KEY = "sudoku_pro_portfolio_v2";

const levels = [
  { name: "Fácil", remove: 35 },
  { name: "Médio", remove: 45 },
  { name: "Difícil", remove: 52 },
  { name: "Especialista", remove: 58 },
  { name: "Mestre", remove: 62 }
];

const $ = (id) => document.getElementById(id);

const gridEl = $("grid");
const keyboardEl = $("keyboard");
const levelLabel = $("levelLabel");
const messageEl = $("message");

const timerEl = $("timer");
const errorsEl = $("errors");
const hintsEl = $("hints");
const bestScoreEl = $("bestScore");

const btnHint = $("btnHint");
const btnErase = $("btnErase");
const btnPencil = $("btnPencil");
const btnUndo = $("btnUndo");
const btnSave = $("btnSave");
const btnReset = $("btnReset");
const btnNew = $("btnNew");
const btnContinue = $("btnContinue");

let levelIndex = 0;

let solution = [];
let puzzle = [];
let fixed = [];     // boolean 9x9
let notes = [];     // Set per cell: notes[y][x] = Set<number>
let selected = null;

let errors = 0;
let hints = 3;

let seconds = 0;
let timerInt = null;

let pencilMode = false;
let history = [];   // stack for undo: {x,y,prevVal,newVal,prevNotes,newNotes,prevErrors,prevHints}

boot();

/* ---------- Boot ---------- */
function boot() {
  buildKeyboard();
  wireUI();

  const saved = loadState();
  if (saved?.hasSave) {
    btnContinue.disabled = false;
    btnContinue.classList.remove("dim");
    toast("Jogo salvo encontrado. Você pode continuar.");
  } else {
    btnContinue.disabled = false; // ainda deixamos, mas ele avisa
  }

  // inicia um novo jogo
  startNewGame(0);
}

/* ---------- UI ---------- */
function wireUI() {
  btnHint.addEventListener("click", useHint);
  btnErase.addEventListener("click", clearCell);
  btnPencil.addEventListener("click", togglePencil);
  btnUndo.addEventListener("click", undo);
  btnSave.addEventListener("click", saveGame);
  btnReset.addEventListener("click", resetLevel);
  btnNew.addEventListener("click", () => startNewGame(levelIndex));
  btnContinue.addEventListener("click", continueGame);
}

function toast(text) {
  messageEl.textContent = text;
}

/* ---------- Game lifecycle ---------- */
function startNewGame(index) {
  stopTimer();
  seconds = 0;

  errors = 0;
  hints = 3;
  history = [];
  selected = null;

  levelIndex = clamp(index, 0, levels.length - 1);
  levelLabel.textContent = `Nível: ${levels[levelIndex].name}`;

  solution = generateSolvedGrid();
  puzzle = removeNumbers(solution, levels[levelIndex].remove);

  fixed = Array.from({ length: 9 }, (_, y) =>
    Array.from({ length: 9 }, (_, x) => puzzle[y][x] !== 0)
  );

  notes = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set())
  );

  renderGrid();
  updateHUD();
  updateBestScoreLabel();

  timerInt = setInterval(() => {
    seconds++;
    updateHUD();
    autosaveTick();
  }, 1000);

  // limpa save antigo desse nível? não. Mantém, mas salva o novo quando usuário clica salvar
  toast("Novo jogo iniciado. Boa sorte. ✅");
}

function continueGame() {
  const saved = loadState();
  if (!saved?.hasSave) {
    toast("Nenhum jogo salvo. Comece um novo e clique em Salvar.");
    return;
  }

  // restaura
  levelIndex = clamp(saved.levelIndex ?? 0, 0, levels.length - 1);
  levelLabel.textContent = `Nível: ${levels[levelIndex].name}`;

  solution = saved.solution;
  puzzle = saved.puzzle;
  fixed = saved.fixed;

  notes = saved.notes.map(row =>
    row.map(arr => new Set(arr))
  );

  errors = saved.errors ?? 0;
  hints = saved.hints ?? 3;
  seconds = saved.seconds ?? 0;
  history = []; // não persistimos undo, simplifica e aumenta robustez
  selected = null;

  renderGrid();
  updateHUD();
  updateBestScoreLabel();

  stopTimer();
  timerInt = setInterval(() => {
    seconds++;
    updateHUD();
    autosaveTick();
  }, 1000);

  toast("Continuando jogo salvo. 👌");
}

function resetLevel() {
  const ok = confirm("Resetar o nível atual? (mantém seu melhor score)");
  if (!ok) return;
  startNewGame(levelIndex);
}

/* ---------- HUD + Best Score ---------- */
function updateHUD() {
  timerEl.textContent = formatTime(seconds);
  errorsEl.textContent = String(errors);
  hintsEl.textContent = String(hints);
}

function computeScore() {
  // score mais “confiável”: penaliza tempo, erros e dicas usadas
  const usedHints = 3 - hints;
  const score = Math.max(0, 1200 - (seconds * 2) - (errors * 120) - (usedHints * 60));
  return score;
}

function updateBestScoreLabel() {
  const data = readStorage();
  const best = data.bestScores?.[String(levelIndex)];
  bestScoreEl.textContent = best != null ? String(best) : "—";
}

function saveBestScoreIfNeeded() {
  const score = computeScore();
  const data = readStorage();
  data.bestScores = data.bestScores || {};
  const key = String(levelIndex);
  const prev = data.bestScores[key];

  if (prev == null || score > prev) {
    data.bestScores[key] = score;
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }
  updateBestScoreLabel();
}

/* ---------- Grid render ---------- */
function renderGrid() {
  gridEl.innerHTML = "";

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);

      // bordas de bloco 3x3 (direita e baixo)
      if (x === 2 || x === 5) cell.classList.add("blockEdgeRight");
      if (y === 2 || y === 5) cell.classList.add("blockEdgeBottom");

      const v = puzzle[y][x];
      if (v !== 0) {
        cell.textContent = v;
      } else {
        // notas
        const note = buildNoteGrid(notes[y][x]);
        if (note) cell.appendChild(note);
      }

      if (fixed[y][x]) cell.classList.add("fixed");

      cell.addEventListener("click", () => selectCell(x, y));
      gridEl.appendChild(cell);
    }
  }
}

function buildNoteGrid(set) {
  if (!set || set.size === 0) return null;
  const wrap = document.createElement("div");
  wrap.className = "note";
  for (let i = 1; i <= 9; i++) {
    const s = document.createElement("span");
    s.textContent = set.has(i) ? String(i) : "";
    wrap.appendChild(s);
  }
  return wrap;
}

/* ---------- Selection + Highlights ---------- */
function selectCell(x, y) {
  if (fixed[y][x]) return;
  selected = { x, y };

  document.querySelectorAll(".cell").forEach(c => {
    c.classList.remove("selected", "peer", "same");
  });

  const selectedEl = getCellEl(x, y);
  selectedEl?.classList.add("selected");

  // peers: row/col/block
  for (let i = 0; i < 9; i++) {
    getCellEl(i, y)?.classList.add("peer");
    getCellEl(x, i)?.classList.add("peer");
  }

  const bx = Math.floor(x / 3) * 3;
  const by = Math.floor(y / 3) * 3;
  for (let yy = 0; yy < 3; yy++) {
    for (let xx = 0; xx < 3; xx++) {
      getCellEl(bx + xx, by + yy)?.classList.add("peer");
    }
  }

  // same numbers highlight
  const v = puzzle[y][x];
  if (v) {
    for (let yy = 0; yy < 9; yy++) {
      for (let xx = 0; xx < 9; xx++) {
        if (puzzle[yy][xx] === v) getCellEl(xx, yy)?.classList.add("same");
      }
    }
  }

  toast(pencilMode ? "Modo lápis: toque em um número para adicionar/remover nota." : "Digite um número.");
}

/* ---------- Input ---------- */
function buildKeyboard() {
  keyboardEl.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const k = document.createElement("div");
    k.className = "key";
    k.textContent = String(i);
    k.addEventListener("click", () => inputNumber(i));
    keyboardEl.appendChild(k);
  }
}

function inputNumber(n) {
  if (!selected) return;

  const { x, y } = selected;
  if (fixed[y][x]) return;

  if (pencilMode) {
    toggleNote(x, y, n);
    return;
  }

  const prevVal = puzzle[y][x];
  const prevNotes = new Set(notes[y][x]);

  puzzle[y][x] = n;
  notes[y][x].clear();

  const cellEl = getCellEl(x, y);
  if (!cellEl) return;

  // render value
  cellEl.innerHTML = "";
  cellEl.textContent = n;

  // valida
  const wasError = cellEl.classList.contains("error");
  if (n !== solution[y][x]) {
    cellEl.classList.add("error");
    if (!wasError) errors++;
    toast("Número incorreto. Cuidado com os erros.");
    if (errors >= 3) {
      gameOver();
      return;
    }
  } else {
    cellEl.classList.remove("error");
    // remove notas conflitantes ao redor (qualidade de app)
    clearNotesInPeers(x, y, n);
  }

  history.push({
    x, y,
    prevVal, newVal: n,
    prevNotes: Array.from(prevNotes),
    newNotes: [],
    prevErrors: errors, // pós ajuste já aconteceu; para simplificar, guardamos estado anterior real abaixo
  });

  // corrigir snapshot de erros/hints antes do input
  // (melhor: empilhar antes; aqui vamos fazer um snapshot manual)
  history[history.length - 1].prevErrors = (n !== solution[y][x] && !wasError) ? errors - 1 : errors;
  history[history.length - 1].prevHints = hints;

  refreshHighlights();
  updateHUD();
  checkWin();
}

function clearCell() {
  if (!selected) return;
  const { x, y } = selected;
  if (fixed[y][x]) return;

  const prevVal = puzzle[y][x];
  const prevNotes = new Set(notes[y][x]);

  puzzle[y][x] = 0;
  const cellEl = getCellEl(x, y);
  if (!cellEl) return;

  cellEl.classList.remove("error");
  cellEl.innerHTML = "";
  const note = buildNoteGrid(notes[y][x]);
  if (note) cellEl.appendChild(note);

  history.push({
    x, y,
    prevVal, newVal: 0,
    prevNotes: Array.from(prevNotes),
    newNotes: Array.from(notes[y][x]),
    prevErrors: errors,
    prevHints: hints
  });

  refreshHighlights();
  updateHUD();
  toast("Célula apagada.");
}

function togglePencil() {
  pencilMode = !pencilMode;
  btnPencil.setAttribute("aria-pressed", String(pencilMode));
  btnPencil.classList.toggle("ghost", !pencilMode);
  toast(pencilMode ? "✎ Modo lápis ativado." : "Modo lápis desativado.");
}

function toggleNote(x, y, n) {
  if (puzzle[y][x] !== 0) {
    toast("Apague o número para usar notas aqui.");
    return;
  }

  const prevNotes = new Set(notes[y][x]);
  if (notes[y][x].has(n)) notes[y][x].delete(n);
  else notes[y][x].add(n);

  history.push({
    x, y,
    prevVal: 0, newVal: 0,
    prevNotes: Array.from(prevNotes),
    newNotes: Array.from(notes[y][x]),
    prevErrors: errors,
    prevHints: hints
  });

  // render notes
  const cellEl = getCellEl(x, y);
  if (!cellEl) return;
  cellEl.innerHTML = "";
  const note = buildNoteGrid(notes[y][x]);
  if (note) cellEl.appendChild(note);

  toast("Nota atualizada.");
}

/* ---------- Smart helpers ---------- */
function clearNotesInPeers(x, y, n) {
  // remove a nota 'n' em peers (linha/col/bloco), se existirem
  for (let i = 0; i < 9; i++) {
    notes[y][i]?.delete(n);
    notes[i][x]?.delete(n);
  }
  const bx = Math.floor(x / 3) * 3;
  const by = Math.floor(y / 3) * 3;
  for (let yy = 0; yy < 3; yy++) {
    for (let xx = 0; xx < 3; xx++) {
      notes[by + yy][bx + xx]?.delete(n);
    }
  }

  // re-render peers vazios (somente se a célula está vazia)
  rerenderNotesPeers(x, y);
}

function rerenderNotesPeers(x, y) {
  // atualiza visual das células vazias nos peers (leve e “app-like”)
  const peers = new Set();
  for (let i = 0; i < 9; i++) {
    peers.add(`${i},${y}`);
    peers.add(`${x},${i}`);
  }
  const bx = Math.floor(x / 3) * 3;
  const by = Math.floor(y / 3) * 3;
  for (let yy = 0; yy < 3; yy++) {
    for (let xx = 0; xx < 3; xx++) {
      peers.add(`${bx + xx},${by + yy}`);
    }
  }

  peers.forEach(key => {
    const [px, py] = key.split(",").map(Number);
    if (fixed[py][px]) return;
    if (puzzle[py][px] !== 0) return;
    const cellEl = getCellEl(px, py);
    if (!cellEl) return;
    cellEl.innerHTML = "";
    const note = buildNoteGrid(notes[py][px]);
    if (note) cellEl.appendChild(note);
  });
}

function refreshHighlights() {
  if (!selected) return;
  selectCell(selected.x, selected.y);
}

/* ---------- Hint / Undo ---------- */
function useHint() {
  if (!selected) { toast("Selecione uma célula vazia."); return; }
  if (hints <= 0) { toast("Sem dicas disponíveis."); return; }

  const { x, y } = selected;
  if (fixed[y][x]) return;

  const prevVal = puzzle[y][x];
  const prevNotes = new Set(notes[y][x]);

  puzzle[y][x] = solution[y][x];
  notes[y][x].clear();

  const cellEl = getCellEl(x, y);
  cellEl.innerHTML = "";
  cellEl.textContent = puzzle[y][x];
  cellEl.classList.remove("error");

  hints--;

  history.push({
    x, y,
    prevVal, newVal: puzzle[y][x],
    prevNotes: Array.from(prevNotes),
    newNotes: [],
    prevErrors: errors,
    prevHints: hints + 1
  });

  clearNotesInPeers(x, y, puzzle[y][x]);
  updateHUD();
  toast("💡 Dica aplicada.");
  checkWin();
}

function undo() {
  const last = history.pop();
  if (!last) { toast("Nada para desfazer."); return; }

  const { x, y } = last;

  puzzle[y][x] = last.prevVal;
  notes[y][x] = new Set(last.prevNotes);

  errors = last.prevErrors ?? errors;
  hints = last.prevHints ?? hints;

  const cellEl = getCellEl(x, y);
  cellEl.classList.remove("error");
  cellEl.innerHTML = "";

  if (puzzle[y][x] !== 0) {
    cellEl.textContent = puzzle[y][x];
  } else {
    const note = buildNoteGrid(notes[y][x]);
    if (note) cellEl.appendChild(note);
  }

  updateHUD();
  refreshHighlights();
  toast("↶ Desfeito.");
}

/* ---------- Win/Lose ---------- */
function checkWin() {
  const ok = puzzle.every((row, y) => row.every((v, x) => v && v === solution[y][x]));
  if (!ok) return;

  stopTimer();
  saveBestScoreIfNeeded();

  const score = computeScore();
  toast(`✔ Concluído! Pontuação: ${score}`);

  // avança nível automaticamente
  setTimeout(() => {
    levelIndex++;
    if (levelIndex < levels.length) {
      startNewGame(levelIndex);
    } else {
      toast("🏆 Você zerou o Sudoku!");
    }
  }, 1200);

  // limpa save do jogo concluído (boa prática)
  clearSavedGame();
}

function gameOver() {
  stopTimer();
  toast("❌ Muitas tentativas incorretas. Reinicie o nível para tentar de novo.");
}

/* ---------- Save / Storage ---------- */
function saveGame() {
  const data = readStorage();
  data.save = {
    hasSave: true,
    levelIndex,
    solution,
    puzzle,
    fixed,
    notes: notes.map(row => row.map(set => Array.from(set))),
    errors,
    hints,
    seconds,
    savedAt: Date.now()
  };
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  toast("💾 Jogo salvo com sucesso.");
  updateBestScoreLabel();
}

function continueAutoSave() {
  // salva silenciosamente (para confiança). sem mexer no "savedAt" todo segundo.
  const data = readStorage();
  data.autosave = {
    hasSave: true,
    levelIndex,
    solution,
    puzzle,
    fixed,
    notes: notes.map(row => row.map(set => Array.from(set))),
    errors,
    hints,
    seconds
  };
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function autosaveTick() {
  // autosave leve a cada 10s
  if (seconds % 10 === 0) continueAutoSave();
}

function continueGameFromAutosave() {
  const data = readStorage();
  const a = data.autosave;
  if (!a?.hasSave) return null;
  return { ...a, hasSave: true };
}

function loadState() {
  const data = readStorage();
  if (data.save?.hasSave) return data.save;
  const auto = continueGameFromAutosave();
  if (auto) return auto;
  return null;
}

function clearSavedGame() {
  const data = readStorage();
  delete data.save;
  delete data.autosave;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function readStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/* ---------- Generator (backtracking) ---------- */
function generateSolvedGrid() {
  const g = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(g);
  return g;
}

function solve(g) {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (!g[y][x]) {
        for (let n of shuffle([1,2,3,4,5,6,7,8,9])) {
          if (valid(g, x, y, n)) {
            g[y][x] = n;
            if (solve(g)) return true;
            g[y][x] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function valid(g, x, y, n) {
  for (let i = 0; i < 9; i++) if (g[y][i] === n || g[i][x] === n) return false;
  const sx = Math.floor(x / 3) * 3;
  const sy = Math.floor(y / 3) * 3;
  for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 3; xx++)
    if (g[sy + yy][sx + xx] === n) return false;
  return true;
}

function removeNumbers(g, count) {
  const p = g.map(r => r.slice());
  while (count > 0) {
    const x = (Math.random() * 9) | 0;
    const y = (Math.random() * 9) | 0;
    if (p[y][x]) {
      p[y][x] = 0;
      count--;
    }
  }
  return p;
}

/* ---------- Helpers ---------- */
function getCellEl(x, y) {
  return gridEl.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function stopTimer() {
  if (timerInt) clearInterval(timerInt);
  timerInt = null;
}

function formatTime(s) {
  const m = (s / 60) | 0;
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function shuffle(arr) {
  // Fisher-Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
