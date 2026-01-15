/* ==========================
   Caça-Palavras PRO (Clean)
   - Mobile-first, dark minimal
   - Seleção por arraste: trava em 8 direções
   - Dica inteligente (primeira letra de uma palavra não encontrada)
   - Timer + movimentos
   - LocalStorage: nível, melhores tempos e progresso
   - Editor de níveis (JSON)
========================== */

const LS_KEY = "wordsearch_pro_v1";

// Direções possíveis: 8
const DIRS = [
  [1,0],[-1,0],[0,1],[0,-1],
  [1,1],[-1,-1],[1,-1],[-1,1]
];

// Níveis padrão (você edita fácil)
const DEFAULT_LEVELS = [
  { size: 6,  words: ["SOL","MAR","LUZ","DIA"], directions: 2 },
  { size: 6,  words: ["VENTO","NORTE","SUL"], directions: 3 },
  { size: 7,  words: ["FOGO","TERRA","AGUA"], directions: 4 },
  { size: 7,  words: ["ENERGIA","MENTE","CORPO"], directions: 5 },
  { size: 8,  words: ["EQUILIBRIO","FOCO","CAOS"], directions: 6 },
  { size: 8,  words: ["DISCIPLINA","PACIENCIA","FORCA"], directions: 7 },
  { size: 9,  words: ["CONSCIENCIA","ATENCAO","CLAREZA"], directions: 8 },
  { size: 9,  words: ["RESILIENCIA","PROPOSITO","INTENCAO"], directions: 8 },
  { size:10,  words: ["AUTOCONHECIMENTO","SABEDORIA"], directions: 8 },
  { size:10,  words: ["TRANSFORMACAO","EVOLUCAO","PRESENCA"], directions: 8 }
];

const $ = (id) => document.getElementById(id);

const boardEl = $("board");
const wordListEl = $("wordList");
const levelLabel = $("levelLabel");
const progressBar = $("progressBar");
const messageEl = $("message");

const timeLabel = $("timeLabel");
const movesLabel = $("movesLabel");

const btnHint = $("btnHint");
const btnRestart = $("btnRestart");
const btnNext = $("btnNext");
const btnDev = $("btnDev");

const devPanel = $("devPanel");
const levelsInput = $("levelsInput");
const applyLevels = $("applyLevels");
const resetLevels = $("resetLevels");
const closeDev = $("closeDev");

// Estado do jogo
let levels = loadLevels();
let levelIndex = loadProgress().levelIndex ?? 0;

let grid = [];
let placements = [];          // { word, cells:[{x,y}] }
let foundWords = new Set();

let selecting = false;
let selectedCells = [];       // DOM cells
let selectionVector = null;   // [dx,dy]
let locked = false;

let moves = 0;

// Timer
let startTime = 0;
let timerId = null;

// ---------- Boot ----------
wireUI();
startLevel(levelIndex);

// ---------- UI wiring ----------
function wireUI() {
  btnHint.addEventListener("click", hint);
  btnRestart.addEventListener("click", () => startLevel(levelIndex, { resetStats:true }));
  btnNext.addEventListener("click", nextLevel);

  btnDev.addEventListener("click", toggleDevPanel);

  closeDev.addEventListener("click", () => {
    devPanel.hidden = true;
  });

  applyLevels.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(levelsInput.value);
      if (!Array.isArray(parsed)) throw new Error("JSON deve ser um array");
      validateLevels(parsed);

      levels = parsed;
      saveLevels(levels);
      levelIndex = 0;
      saveProgress({ levelIndex });

      devPanel.hidden = true;
      startLevel(0, { resetStats:true });
      toast("✔ Níveis aplicados!");
    } catch (e) {
      toast("❌ JSON inválido. Confira o formato.");
    }
  });

  resetLevels.addEventListener("click", () => {
    const ok = confirm("Restaurar níveis padrão?");
    if (!ok) return;
    levels = structuredClone(DEFAULT_LEVELS);
    saveLevels(levels);
    levelIndex = 0;
    saveProgress({ levelIndex });

    devPanel.hidden = true;
    startLevel(0, { resetStats:true });
    toast("✔ Níveis padrão restaurados.");
  });

  // Pointer events (arraste)
  boardEl.addEventListener("pointerdown", onPointerDown);
  boardEl.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  // Preenche textarea do editor com exemplo
  levelsInput.value = JSON.stringify(levels, null, 2);
}

function toggleDevPanel() {
  devPanel.hidden = !devPanel.hidden;
  if (!devPanel.hidden) levelsInput.value = JSON.stringify(levels, null, 2);
}

// ---------- Level logic ----------
function startLevel(index, opts = {}) {
  locked = true;

  const level = levels[index];
  if (!level) {
    toast("🏆 Jogo finalizado!");
    return;
  }

  // stats
  if (opts.resetStats) {
    moves = 0;
    movesLabel.textContent = "0";
  }

  // timer
  stopTimer();
  startTime = Date.now();
  timerId = setInterval(updateTimer, 250);
  updateTimer();

  foundWords.clear();
  selectedCells = [];
  selectionVector = null;

  const size = level.size;
  levelLabel.textContent = `Nível ${index + 1} • ${size}×${size}`;
  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  // grid init
  grid = Array.from({ length: size }, () => Array(size).fill(""));
  placements = [];

  // place words
  placeAllWords(level);
  fillGridRandom();

  // render
  renderBoard(size);
  renderWords(level.words);

  updateProgress();

  // desbloqueia após pequeno delay (evita "toques fantasmas")
  setTimeout(() => locked = false, 180);

  // persist
  saveProgress({ levelIndex });
}

function nextLevel() {
  // Permite ir ao próximo manualmente (bom para dev)
  levelIndex = Math.min(levelIndex + 1, levels.length - 1);
  saveProgress({ levelIndex });
  startLevel(levelIndex, { resetStats:true });
}

function placeAllWords(level) {
  const maxDir = clamp(level.directions ?? 8, 1, 8);

  level.words.forEach(rawWord => {
    const word = sanitizeWord(rawWord);
    if (!word) return;

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 400) {
      attempts++;

      const dir = DIRS[Math.floor(Math.random() * maxDir)];
      const reversed = Math.random() < 0.35;
      const letters = (reversed ? word.split("").reverse() : word.split(""));

      const x = randInt(0, level.size - 1);
      const y = randInt(0, level.size - 1);

      if (canPlace(x, y, dir, letters, level.size)) {
        const cells = [];
        letters.forEach((ch, i) => {
          const nx = x + dir[0] * i;
          const ny = y + dir[1] * i;
          grid[ny][nx] = ch;
          cells.push({ x: nx, y: ny });
        });

        placements.push({ word, cells });
        placed = true;
      }
    }

    if (!placed) {
      console.warn("Não consegui posicionar:", word);
    }
  });
}

function canPlace(x, y, dir, letters, size) {
  for (let i = 0; i < letters.length; i++) {
    const nx = x + dir[0] * i;
    const ny = y + dir[1] * i;
    if (nx < 0 || ny < 0 || nx >= size || ny >= size) return false;
    const existing = grid[ny][nx];
    if (existing && existing !== letters[i]) return false;
  }
  return true;
}

function fillGridRandom() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const size = grid.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x]) {
        grid[y][x] = alphabet[randInt(0, alphabet.length - 1)];
      }
    }
  }
}

// ---------- Rendering ----------
function renderBoard(size) {
  boardEl.innerHTML = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[y][x];
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      boardEl.appendChild(cell);
    }
  }
}

function renderWords(words) {
  wordListEl.innerHTML = "";
  const cleanWords = words.map(w => sanitizeWord(w)).filter(Boolean);

  cleanWords.forEach(w => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.dataset.word = w;
    wordListEl.appendChild(span);
  });
}

// ---------- Selection ----------
function onPointerDown(e) {
  if (locked) return;

  const cell = e.target.closest(".cell");
  if (!cell) return;

  selecting = true;
  clearSelection();

  selectedCells.push(cell);
  cell.classList.add("active");
}

function onPointerMove(e) {
  if (!selecting || locked) return;

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const cell = el?.closest?.(".cell");
  if (!cell) return;
  if (selectedCells.includes(cell)) return;

  const last = selectedCells[selectedCells.length - 1];
  const dx = Number(cell.dataset.x) - Number(last.dataset.x);
  const dy = Number(cell.dataset.y) - Number(last.dataset.y);

  // só aceita passos adjacentes
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;

  if (!selectionVector) {
    // trava no primeiro movimento (direção)
    selectionVector = [dx, dy];
  } else {
    // mantém direção fixa
    if (dx !== selectionVector[0] || dy !== selectionVector[1]) return;
  }

  selectedCells.push(cell);
  cell.classList.add("active");
}

function onPointerUp() {
  if (!selecting) return;
  selecting = false;
  validateSelection();
}

function clearSelection() {
  selectedCells.forEach(c => c.classList.remove("active"));
  selectedCells = [];
  selectionVector = null;
}

function validateSelection() {
  if (selectedCells.length < 2) {
    clearSelection();
    return;
  }

  moves++;
  movesLabel.textContent = String(moves);

  const selectedWord = selectedCells.map(c => c.textContent).join("");
  const reversed = selectedWord.split("").reverse().join("");

  // match: palavra posicionada e ainda não encontrada
  const match = placements.find(p =>
    !foundWords.has(p.word) && (p.word === selectedWord || p.word === reversed)
  );

  if (match) {
    foundWords.add(match.word);

    selectedCells.forEach(c => {
      c.classList.remove("active");
      c.classList.add("found");
    });

    const tag = document.querySelector(`[data-word="${match.word}"]`);
    tag?.classList.add("found");

    navigator.vibrate?.(60);
    toast(`✔ Encontrou: ${match.word}`);
  }

  clearSelection();
  updateProgress();
}

// ---------- Progress / Finish ----------
function updateProgress() {
  const total = placements.length || 1;
  const pct = (foundWords.size / total) * 100;
  progressBar.style.width = pct + "%";

  if (pct === 100 && !locked) {
    locked = true;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    saveBestTime(levelIndex, elapsed);

    toast("✔ Nível concluído!");
    setTimeout(() => {
      levelIndex++;
      if (levelIndex < levels.length) {
        saveProgress({ levelIndex });
        startLevel(levelIndex, { resetStats:true });
      } else {
        stopTimer();
        toast("🏆 Jogo finalizado!");
      }
    }, 650);
  }
}

// ---------- Hint ----------
function hint() {
  if (locked) return;

  // pega uma palavra não encontrada
  const remaining = placements.filter(p => !foundWords.has(p.word));
  if (remaining.length === 0) return;

  const pick = remaining[randInt(0, remaining.length - 1)];
  const first = pick.cells[0]; // primeira letra posicionada

  // destaca rapidamente a célula
  const cellEl = findCellEl(first.x, first.y);
  if (!cellEl) return;

  cellEl.classList.add("hint");
  setTimeout(() => cellEl.classList.remove("hint"), 800);

  toast("💡 Dica: primeira letra destacada.");
}

function findCellEl(x, y) {
  return boardEl.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

// ---------- Timer ----------
function updateTimer() {
  const s = Math.floor((Date.now() - startTime) / 1000);
  timeLabel.textContent = formatTime(s);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ---------- Storage ----------
function loadProgress() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj?.progress || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  const data = readAllStorage();
  data.progress = { ...(data.progress || {}), ...progress };
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function loadLevels() {
  const data = readAllStorage();
  if (Array.isArray(data.levels) && data.levels.length) return data.levels;
  return structuredClone(DEFAULT_LEVELS);
}

function saveLevels(levelsArr) {
  const data = readAllStorage();
  data.levels = levelsArr;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function saveBestTime(levelIdx, seconds) {
  const data = readAllStorage();
  data.bestTimes = data.bestTimes || {};
  const key = String(levelIdx);
  const prev = data.bestTimes[key];

  if (prev == null || seconds < prev) {
    data.bestTimes[key] = seconds;
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }
}

function readAllStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ---------- Levels validation (dev-friendly) ----------
function validateLevels(arr) {
  arr.forEach((lvl, idx) => {
    if (typeof lvl !== "object") throw new Error("Nível inválido");
    if (!Number.isInteger(lvl.size) || lvl.size < 4 || lvl.size > 14) throw new Error("size inválido");
    if (!Array.isArray(lvl.words) || lvl.words.length < 1) throw new Error("words inválidas");
    lvl.words.forEach(w => {
      const s = sanitizeWord(w);
      if (!s) throw new Error("word vazia");
      if (s.length > lvl.size) throw new Error(`word grande demais no nível ${idx + 1}: ${s}`);
    });
    if (lvl.directions != null) {
      if (!Number.isInteger(lvl.directions) || lvl.directions < 1 || lvl.directions > 8) throw new Error("directions inválido");
    }
  });
}

// ---------- Helpers ----------
function sanitizeWord(w) {
  return String(w || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z]/g, "")
    .trim();
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toast(text) {
  messageEl.textContent = text;
}
