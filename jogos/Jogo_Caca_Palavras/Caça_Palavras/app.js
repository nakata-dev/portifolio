/* ==========================
   Caça-Palavras PRO (Clean) - PATCH 2026
   ✅ Android sem travar (geração assíncrona)
   ✅ 100 níveis 5..8, 9 palavras, 8 direções
   ✅ Garantia de 9 palavras com fallback
   ✅ NOVO: cada palavra tem uma cor fixa (melhor para idosos)
========================== */

const LS_KEY = "wordsearch_pro_v1";
const SCHEMA_VERSION = 2;

const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, -1], [1, -1], [-1, 1]
];

const MAX_BOARD_RETRIES = 90;
const MAX_WORD_ATTEMPTS = 220;
const YIELD_EVERY = 6;
const FALLBACK_SETS_TRIES = 22;

const $ = (id) => document.getElementById(id);

/* =========================
   Helpers
========================= */
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

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function safeClone(obj) {
  if (typeof structuredClone === "function") {
    try { return structuredClone(obj); } catch {}
  }
  return JSON.parse(JSON.stringify(obj));
}

function makeLCG(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pickDeterministicUnique(arr, n, seed) {
  const rng = makeLCG(seed);
  const copy = arr.slice();

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  const picked = [];
  for (let i = 0; i < copy.length && picked.length < n; i++) {
    if (!picked.includes(copy[i])) picked.push(copy[i]);
  }
  return picked;
}

/* =========================
   Cores por palavra
   - Paleta com ALTO contraste (menos parecidas)
   - Escolhidas para funcionar bem em fundo escuro
   - Preferência por cores mais claras (texto escuro nas células continua legível)
========================= */
const WORD_COLORS = [
  "#FF595E", // vermelho vivo
  "#FFCA3A", // amarelo forte
  "#8AC926", // verde-lima
  "#4D96FF", // azul vivo
  "#FF922B", // laranja forte
  "#63E6BE", // verde-água
  "#F783AC", // rosa
  "#B197FC", // lilás claro
  "#22D3EE", // ciano
  "#A9E34B", // verde neon suave
  "#FFD8A8", // pêssego claro (boa diferença no tabuleiro)
  "#E599F7", // roxo claro
];

function hashWordToColor(word) {
  let h = 2166136261;
  for (let i = 0; i < word.length; i++) {
    h ^= word.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % WORD_COLORS.length;
  return WORD_COLORS[idx];
}

/* =========================
   Bancos + níveis 100
========================= */
function sanitizeBank(list) {
  return list.map(sanitizeWord).filter(Boolean);
}

const WORD_BANKS = {
  5: sanitizeBank([
    "SOL","MAR","LUA","RIO","DIA","NOZ","PAZ","SOM","SAL","CHA","MEL","CEU","ECO","VOZ","AVE","FIM",
    "COR","AZUL","VER","ROXO","NEVE","FOGO","AR","LA","RE","MAO","PE","TE",
    "OURO","VIDA","ALMA","LUZ","RUA","CASA"
  ]).filter(w => w.length >= 2 && w.length <= 5),

  6: sanitizeBank([
    "GATO","URSO","BOLA","PRAIA","ONDA","BARCO","FOLHA","RAIZ","FOCO","CALMA","SAUDE","FORCA",
    "DADO","CARTA","JANELA","MANGA","MELAO","ESCOLA","AMOR","RISOS","TEMPO","NORTE","SUL"
  ]).filter(w => w.length >= 3 && w.length <= 6),

  7: sanitizeBank([
    "AMIZADE","FAMILIA","SORRISO","CUIDADO","BONDADE","ENERGIA","ESTUDAR","LEITURA","CANETA",
    "CADERNO","MOCHILA","CIENCIA","PLANETA","GALAXIA","ORBITA","COMETA","ESTRELA",
    "JARDIM","SEMENTE","TRONCO","VIAGEM","CAMINHO","BUSSOLA","NATUREZA"
  ]).filter(w => w.length >= 3 && w.length <= 7),

  8: sanitizeBank([
    "PACIENCIA","CORAGEM","PROGRESSO","DISCIPLINA","HABITO","ROTINA","SUCESSO","APRENDER",
    "ESTUDAR","LEITURA","MEMORIA","AVENTURA","MONTANHA","INTERNET","SEGURANCA",
    "PROGRAMAR","ALGORITMO","LOGICA","CODIGO","FUNCAO","EVENTO","SISTEMA","DOWNLOAD"
  ]).filter(w => w.length >= 3 && w.length <= 8),
};

function buildLevelsBySize(size, count, bank, wordsPerLevel, baseSeed) {
  const out = [];
  const cleanBank = bank.filter(w => w.length <= size);

  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i * 977;
    const picks = pickDeterministicUnique(cleanBank, wordsPerLevel, seed);

    while (picks.length < wordsPerLevel) {
      const extra = cleanBank[randInt(0, cleanBank.length - 1)];
      if (!picks.includes(extra)) picks.push(extra);
    }

    out.push({ size, words: picks, directions: 8 });
  }
  return out;
}

function buildDefaultLevels100() {
  const out = [];
  out.push(...buildLevelsBySize(5, 25, WORD_BANKS[5], 9, 50101));
  out.push(...buildLevelsBySize(6, 25, WORD_BANKS[6], 9, 60101));
  out.push(...buildLevelsBySize(7, 25, WORD_BANKS[7], 9, 70101));
  out.push(...buildLevelsBySize(8, 25, WORD_BANKS[8], 9, 80101));
  return out;
}

const DEFAULT_LEVELS = buildDefaultLevels100();

/* =========================
   DOM
========================= */
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

/* =========================
   Storage
========================= */
function readAllStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

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

function getOverrideWords(levelIdx) {
  const data = readAllStorage();
  return data?.overrides?.[String(levelIdx)] || null;
}

function setOverrideWords(levelIdx, words) {
  const data = readAllStorage();
  data.overrides = data.overrides || {};
  data.overrides[String(levelIdx)] = words.slice(0, 9);
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function clearOverrides() {
  const data = readAllStorage();
  data.overrides = {};
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function loadLevels() {
  const data = readAllStorage();

  if (Number(data.schemaVersion || 0) !== SCHEMA_VERSION) {
    const fresh = safeClone(DEFAULT_LEVELS);
    localStorage.setItem(LS_KEY, JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      levels: fresh,
      progress: { levelIndex: 0 },
      bestTimes: {},
      overrides: {}
    }));
    return fresh;
  }

  if (Array.isArray(data.levels) && data.levels.length === 100) return data.levels;
  return safeClone(DEFAULT_LEVELS);
}

function saveLevels(levelsArr) {
  const data = readAllStorage();
  data.schemaVersion = SCHEMA_VERSION;
  data.levels = levelsArr;
  if (!data.overrides) data.overrides = {};
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

/* =========================
   Validação editor
========================= */
function validateLevels(arr) {
  arr.forEach((lvl, idx) => {
    if (typeof lvl !== "object") throw new Error("Nível inválido");
    if (!Number.isInteger(lvl.size) || lvl.size < 5 || lvl.size > 8) throw new Error("size inválido (use 5 a 8)");
    if (!Array.isArray(lvl.words) || lvl.words.length !== 9) throw new Error(`Nível ${idx + 1}: precisa ter 9 palavras`);
    lvl.words.forEach(w => {
      const s = sanitizeWord(w);
      if (!s) throw new Error("word vazia");
      if (s.length > lvl.size) throw new Error(`word grande demais no nível ${idx + 1}: ${s}`);
    });
    if (lvl.directions != null && lvl.directions !== 8) throw new Error("directions deve ser 8");
  });
}

/* =========================
   Estado
========================= */
let levels = loadLevels();
let levelIndex = loadProgress().levelIndex ?? 0;
levelIndex = clamp(levelIndex, 0, Math.max(0, levels.length - 1));

let grid = [];
let placements = [];
let foundWords = new Set();

let selecting = false;
let selectedCells = [];
let selectionVector = null;
let locked = false;

let moves = 0;

let startTime = 0;
let timerId = null;

let genToken = 0;

let wordColorMap = new Map();

/* =========================
   Boot
========================= */
wireUI();
startLevel(levelIndex);

/* =========================
   UI
========================= */
function wireUI() {
  btnHint.addEventListener("click", hint);
  btnRestart.addEventListener("click", () => startLevel(levelIndex, { resetStats: true }));
  btnNext.addEventListener("click", nextLevel);

  btnDev.addEventListener("click", toggleDevPanel);

  closeDev.addEventListener("click", () => { devPanel.hidden = true; });

  applyLevels.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(levelsInput.value);
      if (!Array.isArray(parsed)) throw new Error("JSON deve ser um array");
      validateLevels(parsed);

      levels = parsed.map(l => ({
        size: l.size,
        words: (l.words || []).map(sanitizeWord).filter(Boolean).slice(0, 9),
        directions: 8
      }));

      saveLevels(levels);
      clearOverrides();

      levelIndex = 0;
      saveProgress({ levelIndex });

      devPanel.hidden = true;
      startLevel(0, { resetStats: true });
      toast("✔ Níveis aplicados!");
    } catch (e) {
      toast("❌ JSON inválido. Confira o formato.");
      console.error(e);
    }
  });

  resetLevels.addEventListener("click", () => {
    const ok = confirm("Restaurar níveis padrão?");
    if (!ok) return;

    levels = safeClone(DEFAULT_LEVELS);
    saveLevels(levels);
    clearOverrides();

    levelIndex = 0;
    saveProgress({ levelIndex });

    devPanel.hidden = true;
    startLevel(0, { resetStats: true });
    toast("✔ Níveis padrão restaurados.");
  });

  boardEl.addEventListener("pointerdown", onPointerDown);
  boardEl.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  window.addEventListener("pointercancel", () => {
    if (!selecting) return;
    selecting = false;
    clearSelection();
  });

  levelsInput.value = JSON.stringify(levels, null, 2);
}

function toggleDevPanel() {
  devPanel.hidden = !devPanel.hidden;
  if (!devPanel.hidden) levelsInput.value = JSON.stringify(levels, null, 2);
}

/* =========================
   Level
========================= */
async function startLevel(index, opts = {}) {
  const myToken = ++genToken;
  locked = true;

  const level = levels[index];
  if (!level) {
    toast("🏆 Jogo finalizado!");
    stopTimer();
    return;
  }

  if (opts.resetStats) {
    moves = 0;
    movesLabel.textContent = "0";
  }

  stopTimer();
  startTime = Date.now();
  timerId = setInterval(updateTimer, 250);
  updateTimer();

  foundWords.clear();
  clearSelection();
  wordColorMap.clear();

  const size = level.size;
  levelLabel.textContent = `Nível ${index + 1} • ${size}×${size}`;
  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  toast("Gerando tabuleiro…");

  grid = Array.from({ length: size }, () => Array(size).fill(""));
  placements = [];
  renderBoard(size);
  renderWords([]);
  updateProgress();

  const override = getOverrideWords(index);
  const baseWords = override && Array.isArray(override) && override.length === 9
    ? override
    : (level.words || []).map(sanitizeWord).filter(Boolean).slice(0, 9);

  const result = await generateBoardGuaranteedWithFallback({
    size,
    words: baseWords,
    levelIndex: index,
    token: myToken
  });

  if (myToken !== genToken) return;

  if (!result.ok) {
    grid = Array.from({ length: size }, () => Array(size).fill(""));
    placements = [];
    renderBoard(size);
    renderWords([]);
    updateProgress();
    toast("❌ Não consegui montar este nível. Toque em Reiniciar.");
    locked = false;
    return;
  }

  if (result.usedFallback) setOverrideWords(index, result.words);

  fillGridRandom();
  renderBoard(size);

  for (const w of placements.map(p => p.word)) {
    wordColorMap.set(w, hashWordToColor(w));
  }

  renderWords(placements.map(p => p.word));
  updateProgress();

  toast("Boa sorte! 😄");
  setTimeout(() => {
    if (myToken === genToken) locked = false;
  }, 120);

  saveProgress({ levelIndex });
}

function nextLevel() {
  levelIndex = Math.min(levelIndex + 1, levels.length - 1);
  saveProgress({ levelIndex });
  startLevel(levelIndex, { resetStats: true });
}

/* =========================
   Geração + fallback
========================= */
async function generateBoardGuaranteedWithFallback({ size, words, levelIndex, token }) {
  const clean = words.map(sanitizeWord).filter(Boolean).slice(0, 9);
  if (clean.length !== 9) return { ok: false, usedFallback: false, words: clean };

  let ok = await generateBoardGuaranteedAsync({ size, words: clean, token });
  if (token !== genToken) return { ok: false, usedFallback: false, words: clean };
  if (ok) return { ok: true, usedFallback: false, words: clean };

  const bank = WORD_BANKS[size] || [];
  if (!bank.length) return { ok: false, usedFallback: false, words: clean };

  for (let t = 0; t < FALLBACK_SETS_TRIES; t++) {
    if (token !== genToken) return { ok: false, usedFallback: false, words: clean };

    const seed = 100000 + (size * 999) + (levelIndex * 37) + (t * 7919);
    const alt = pickDeterministicUnique(bank, 9, seed);

    if (alt.length !== 9) continue;
    if (alt.some(w => w.length > size)) continue;

    ok = await generateBoardGuaranteedAsync({ size, words: alt, token });
    if (token !== genToken) return { ok: false, usedFallback: false, words: clean };

    if (ok) return { ok: true, usedFallback: true, words: alt };

    if (t % YIELD_EVERY === 0) await nextTick();
  }

  return { ok: false, usedFallback: false, words: clean };
}

async function generateBoardGuaranteedAsync({ size, words, token }) {
  for (const w of words) if (!w || w.length > size) return false;

  const allowedDirs = buildAllowedDirs(8);
  const wordsSorted = [...words].sort((a, b) => b.length - a.length);

  for (let attempt = 0; attempt < MAX_BOARD_RETRIES; attempt++) {
    if (token !== genToken) return false;

    grid = Array.from({ length: size }, () => Array(size).fill(""));
    placements = [];

    const placedAll = await tryPlaceAllWordsAsync(wordsSorted, allowedDirs, size, token, attempt);
    if (token !== genToken) return false;

    if (placedAll && placements.length === 9) return true;
    if (attempt % YIELD_EVERY === 0) await nextTick();
  }

  return false;
}

async function tryPlaceAllWordsAsync(wordsSorted, allowedDirs, size, token, attemptBase) {
  for (let wi = 0; wi < wordsSorted.length; wi++) {
    if (token !== genToken) return false;

    const word = wordsSorted[wi];
    const placed = await tryPlaceWordAsync(word, allowedDirs, size, token, wi, attemptBase);
    if (!placed) return false;

    if ((wi + attemptBase) % YIELD_EVERY === 0) await nextTick();
  }
  return true;
}

async function tryPlaceWordAsync(word, allowedDirs, size, token, wi, attemptBase) {
  const isReversed = Math.random() < 0.35;
  const letters = (isReversed ? word.split("").reverse() : word.split(""));

  for (let k = 0; k < MAX_WORD_ATTEMPTS; k++) {
    if (token !== genToken) return false;

    const dir = allowedDirs[randInt(0, allowedDirs.length - 1)];

    const candidates = buildAnchoredCandidates(letters, dir, size);
    if (!candidates.length) {
      candidates.push(...buildAllStartCandidates(letters.length, dir, size));
      shuffleInPlace(candidates);
    }

    const limit = Math.min(candidates.length, 30);
    for (let i = 0; i < limit; i++) {
      const { x, y } = candidates[i];
      if (canPlace(x, y, dir, letters, size)) {
        writeWord(word, letters, x, y, dir, isReversed);
        return true;
      }
    }

    if ((k + wi + attemptBase) % 80 === 0) await nextTick();
  }

  return false;
}

function buildAnchoredCandidates(letters, dir, size) {
  const filled = getFilledCells();
  if (!filled.length) return [];

  const out = [];
  for (let f = 0; f < filled.length; f++) {
    const anchor = filled[f];

    for (let i = 0; i < letters.length; i++) {
      if (letters[i] !== anchor.ch) continue;

      const x = anchor.x - dir[0] * i;
      const y = anchor.y - dir[1] * i;

      const endX = x + dir[0] * (letters.length - 1);
      const endY = y + dir[1] * (letters.length - 1);

      if (x < 0 || y < 0 || endX < 0 || endY < 0) continue;
      if (x >= size || y >= size || endX >= size || endY >= size) continue;

      out.push({ x, y });
    }
  }

  shuffleInPlace(out);
  return out;
}

function buildAllStartCandidates(len, dir, size) {
  const out = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const endX = x + dir[0] * (len - 1);
      const endY = y + dir[1] * (len - 1);
      if (endX < 0 || endY < 0 || endX >= size || endY >= size) continue;
      out.push({ x, y });
    }
  }
  return out;
}

function writeWord(word, letters, x, y, dir, isReversed) {
  const cells = [];
  for (let i = 0; i < letters.length; i++) {
    const nx = x + dir[0] * i;
    const ny = y + dir[1] * i;
    grid[ny][nx] = letters[i];
    cells.push({ x: nx, y: ny });
  }

  const hintIndex = isReversed ? (letters.length - 1) : 0;
  const hint = { x: x + dir[0] * hintIndex, y: y + dir[1] * hintIndex };

  placements.push({ word, cells, hint });
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

function buildAllowedDirs(directions) {
  const n = clamp(directions ?? 8, 1, 8);
  const all = DIRS.map(d => d.slice());
  shuffleInPlace(all);
  const subset = all.slice(0, n);

  const hasDiagonal = subset.some(d => Math.abs(d[0]) === 1 && Math.abs(d[1]) === 1);
  if (!hasDiagonal && n >= 2) subset[subset.length - 1] = [1, 1];

  return subset;
}

function fillGridRandom() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const size = grid.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x]) grid[y][x] = alphabet[randInt(0, alphabet.length - 1)];
    }
  }
}

/* =========================
   Render
========================= */
function renderBoard(size) {
  boardEl.innerHTML = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[y]?.[x] || "";
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      boardEl.appendChild(cell);
    }
  }
}

function renderWords(words) {
  wordListEl.innerHTML = "";
  const cleanWords = (words || []).map(sanitizeWord).filter(Boolean);

  cleanWords.forEach(w => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.dataset.word = w;

    const color = hashWordToColor(w);
    span.style.setProperty("--wcolor", color);

    wordListEl.appendChild(span);
  });

  if (cleanWords.length === 0) toast("⚠ Nenhuma palavra disponível neste nível.");
}

/* =========================
   Seleção
========================= */
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

  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;

  if (!selectionVector) selectionVector = [dx, dy];
  else if (dx !== selectionVector[0] || dy !== selectionVector[1]) return;

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

  const match = placements.find(p =>
    !foundWords.has(p.word) && (p.word === selectedWord || p.word === reversed)
  );

  if (match) {
    foundWords.add(match.word);

    const color = wordColorMap.get(match.word) || hashWordToColor(match.word);

    selectedCells.forEach(c => {
      c.classList.remove("active");
      c.classList.add("found");
      c.style.setProperty("--wcolor", color);
    });

    const tag = document.querySelector(`[data-word="${match.word}"]`);
    if (tag) tag.style.setProperty("--wcolor", color);
    tag?.classList.add("found");

    navigator.vibrate?.(60);
    toast(`✔ Encontrou: ${match.word}`);
  }

  clearSelection();
  updateProgress();
}

/* =========================
   Progresso / fim
========================= */
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
        startLevel(levelIndex, { resetStats: true });
      } else {
        stopTimer();
        toast("🏆 Jogo finalizado!");
      }
    }, 650);
  }
}

/* =========================
   Dica
========================= */
function hint() {
  if (locked) return;

  const remaining = placements.filter(p => !foundWords.has(p.word));
  if (remaining.length === 0) return;

  const pick = remaining[randInt(0, remaining.length - 1)];
  const target = pick.hint || pick.cells[0];

  const cellEl = boardEl.querySelector(`.cell[data-x="${target.x}"][data-y="${target.y}"]`);
  if (!cellEl) return;

  cellEl.classList.add("hint");
  setTimeout(() => cellEl.classList.remove("hint"), 900);

  toast("💡 Dica: primeira letra destacada.");
}

/* =========================
   Timer
========================= */
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

/* =========================
   Util
========================= */
function toast(text) {
  messageEl.textContent = text;
}

function getFilledCells() {
  const out = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid.length; x++) {
      const ch = grid[y][x];
      if (ch) out.push({ x, y, ch });
    }
  }
  return out;
}
