// app.js
const tabuleiro = document.getElementById("tabuleiro");
const mensagem = document.getElementById("mensagem");

const modoPvpBtn = document.getElementById("modoPvp");
const modoCpuBtn = document.getElementById("modoCpu");

const chipJogador = document.getElementById("chipJogador");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreEEl = document.getElementById("scoreE");

const salvarPlacarEl = document.getElementById("salvarPlacar");
const zerarPlacarBtn = document.getElementById("zerarPlacar");

const temaToggleBtn = document.getElementById("temaToggle");

const LS_SAVE = "ttt_saveEnabled_v1";
const LS_SCORE = "ttt_score_v1";
const LS_THEME = "ttt_theme_v1"; // "light" | "dark" | "auto"

let jogadorAtual = "X";
let fimDeJogo = false;

let modo = "pvp"; // "pvp" | "cpu"
let humano = "X";
let cpu = "O";

let score = { X: 0, O: 0, E: 0 };
let saveEnabled = false;

const celulas = [];
let board = Array(9).fill("");

/* =========================
   Tema (toggle com persistência)
========================= */
function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode) {
  const html = document.documentElement;
  html.classList.remove("theme-light", "theme-dark");

  let effective = mode;
  if (mode === "auto") effective = systemPrefersDark() ? "dark" : "light";

  html.classList.add(effective === "dark" ? "theme-dark" : "theme-light");

  if (temaToggleBtn) {
    temaToggleBtn.textContent = effective === "dark" ? "☀️" : "🌙";
    temaToggleBtn.setAttribute("aria-pressed", effective === "dark" ? "true" : "false");
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", effective === "dark" ? "#0b0d12" : "#f4f4f4");
}

function loadTheme() {
  let mode = "auto";
  try {
    const raw = localStorage.getItem(LS_THEME);
    if (raw === "light" || raw === "dark" || raw === "auto") mode = raw;
  } catch {}
  applyTheme(mode);
  return mode;
}

let themeMode = loadTheme();

if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener?.("change", () => {
    if (themeMode === "auto") applyTheme("auto");
  });
}

if (temaToggleBtn) {
  temaToggleBtn.addEventListener("click", () => {
    // alterna entre light/dark
    const html = document.documentElement;
    const isDark = html.classList.contains("theme-dark");
    themeMode = isDark ? "light" : "dark";
    applyTheme(themeMode);
    try { localStorage.setItem(LS_THEME, themeMode); } catch {}
  });
}

/* =========================
   Som de clique (Web Audio)
========================= */
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = AudioContext ? new AudioContext() : null;
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

function playClickSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(640, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.07);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.10, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.11);
}

/* =========================
   Persistência (opcional)
========================= */
function loadPrefs() {
  try {
    const raw = localStorage.getItem(LS_SAVE);
    saveEnabled = raw === "1";
  } catch {
    saveEnabled = false;
  }
  if (salvarPlacarEl) salvarPlacarEl.checked = saveEnabled;

  if (saveEnabled) {
    try {
      const rawScore = localStorage.getItem(LS_SCORE);
      if (rawScore) {
        const parsed = JSON.parse(rawScore);
        if (parsed && typeof parsed === "object") {
          score = {
            X: Number(parsed.X) || 0,
            O: Number(parsed.O) || 0,
            E: Number(parsed.E) || 0
          };
        }
      }
    } catch {}
  }
  renderScore();
}

function savePrefs() {
  try {
    localStorage.setItem(LS_SAVE, saveEnabled ? "1" : "0");
  } catch {}
  if (!saveEnabled) return;

  try {
    localStorage.setItem(LS_SCORE, JSON.stringify(score));
  } catch {}
}

/* =========================
   UI helpers
========================= */
function setChip(jog) {
  chipJogador.textContent = jog;
  chipJogador.classList.toggle("chip-x", jog === "X");
  chipJogador.classList.toggle("chip-o", jog === "O");
}

function renderScore() {
  scoreXEl.textContent = `X: ${score.X}`;
  scoreOEl.textContent = `O: ${score.O}`;
  scoreEEl.textContent = `E: ${score.E}`;
}

function setModo(newModo) {
  modo = newModo;

  const pvp = modo === "pvp";
  modoPvpBtn.classList.toggle("active", pvp);
  modoCpuBtn.classList.toggle("active", !pvp);
  modoPvpBtn.setAttribute("aria-pressed", pvp ? "true" : "false");
  modoCpuBtn.setAttribute("aria-pressed", !pvp ? "true" : "false");

  humano = "X";
  cpu = "O";

  reiniciarJogo(true);
  mensagem.textContent = pvp ? "Vez do jogador X" : "Sua vez (X)";
}

function setFimDeJogo(disabled) {
  celulas.forEach((btn) => {
    btn.disabled = disabled;
    btn.setAttribute("aria-disabled", disabled ? "true" : "false");
  });
}

/* =========================
   Cria tabuleiro acessível
========================= */
function buildBoard() {
  tabuleiro.innerHTML = "";
  celulas.length = 0;

  for (let i = 0; i < 9; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "celula";
    btn.dataset.index = String(i);
    btn.setAttribute("aria-label", `Célula ${i + 1}: vazia`);

    btn.addEventListener("click", () => {
      ensureAudio();
      playClickSound();
      onHumanAction(i);
    });

    tabuleiro.appendChild(btn);
    celulas.push(btn);
  }
}

/* =========================
   Regras do jogo
========================= */
const WINS = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function winnerOf(b) {
  for (const [a,b1,c] of WINS) {
    const v = b[a];
    if (v && v === b[b1] && v === b[c]) return { win: v, line: [a,b1,c] };
  }
  return { win: "", line: null };
}

function isDraw(b) {
  return b.every((x) => x !== "") && !winnerOf(b).win;
}

function setCell(i, v) {
  board[i] = v;
  const btn = celulas[i];
  btn.textContent = v;
  btn.setAttribute("aria-label", `Célula ${i + 1}: ${v ? v : "vazia"}`);
}

function clearWinHighlights() {
  celulas.forEach((c) => c.classList.remove("win"));
}

function highlightLine(indices) {
  indices.forEach((i) => celulas[i].classList.add("win"));
}

/* =========================
   Reinício automático (3..2..1)
========================= */
let roundTimer = null;
let roundCount = 0;

function clearRoundTimer() {
  if (roundTimer) {
    window.clearInterval(roundTimer);
    roundTimer = null;
  }
}

function startAutoNextRound(textoFinal) {
  clearRoundTimer();
  setFimDeJogo(true);

  roundCount = 3;
  mensagem.textContent = `${textoFinal} Próxima partida em ${roundCount}…`;

  roundTimer = window.setInterval(() => {
    roundCount -= 1;

    if (roundCount <= 0) {
      clearRoundTimer();
      reiniciarJogo(true);
      mensagem.textContent = modo === "cpu" ? "Sua vez (X)" : "Vez do jogador X";
      return;
    }

    mensagem.textContent = `${textoFinal} Próxima partida em ${roundCount}…`;
  }, 750);
}

/* =========================
   Fluxo de jogada
========================= */
function onHumanAction(index) {
  if (fimDeJogo) return;
  if (board[index] !== "") return;

  if (modo === "cpu" && jogadorAtual !== humano) return;

  jogar(index);
}

function jogar(index) {
  if (fimDeJogo || board[index] !== "") return;

  setCell(index, jogadorAtual);

  const w = winnerOf(board);
  if (w.win) {
    fimDeJogo = true;
    highlightLine(w.line);

    const textoFinal = (modo === "cpu")
      ? (w.win === humano ? "Você venceu! 🎉" : "O computador venceu! 🤖")
      : `Jogador ${w.win} venceu!`;

    score[w.win] += 1;
    renderScore();
    savePrefs();

    startAutoNextRound(textoFinal);
    return;
  }

  if (isDraw(board)) {
    fimDeJogo = true;

    score.E += 1;
    renderScore();
    savePrefs();

    startAutoNextRound("Empate!");
    return;
  }

  jogadorAtual = jogadorAtual === "X" ? "O" : "X";
  setChip(jogadorAtual);

  if (modo === "cpu") {
    if (jogadorAtual === cpu) {
      mensagem.textContent = "Vez do computador…";
      window.setTimeout(() => cpuMove(), 220);
    } else {
      mensagem.textContent = "Sua vez (X)";
    }
  } else {
    mensagem.textContent = `Vez do jogador ${jogadorAtual}`;
  }
}

/* =========================
   CPU (minimax)
========================= */
function availableMoves(b) {
  const moves = [];
  for (let i = 0; i < 9; i++) if (b[i] === "") moves.push(i);
  return moves;
}

function minimax(b, turn) {
  const w = winnerOf(b).win;
  if (w === cpu) return { score: 10 };
  if (w === humano) return { score: -10 };
  if (isDraw(b)) return { score: 0 };

  const moves = availableMoves(b);
  const results = [];

  for (const m of moves) {
    const copy = b.slice();
    copy[m] = turn;
    const nextTurn = turn === "X" ? "O" : "X";
    const r = minimax(copy, nextTurn);
    results.push({ move: m, score: r.score });
  }

  if (turn === cpu) {
    let best = results[0];
    for (const r of results) if (r.score > best.score) best = r;
    return best;
  } else {
    let best = results[0];
    for (const r of results) if (r.score < best.score) best = r;
    return best;
  }
}

function cpuMove() {
  if (fimDeJogo) return;
  if (jogadorAtual !== cpu) return;

  const best = minimax(board.slice(), cpu);
  const idx = typeof best.move === "number" ? best.move : -1;

  if (idx >= 0 && board[idx] === "") jogar(idx);
}

/* =========================
   Reiniciar partida (interno)
========================= */
function reiniciarJogo(keepTurnX) {
  clearRoundTimer();
  clearWinHighlights();

  board = Array(9).fill("");
  celulas.forEach((btn, i) => {
    btn.textContent = "";
    btn.disabled = false;
    btn.setAttribute("aria-disabled", "false");
    btn.setAttribute("aria-label", `Célula ${i + 1}: vazia`);
  });

  fimDeJogo = false;
  jogadorAtual = keepTurnX ? "X" : jogadorAtual;
  setChip(jogadorAtual);
}

/* =========================
   Eventos
========================= */
modoPvpBtn.addEventListener("click", () => setModo("pvp"));
modoCpuBtn.addEventListener("click", () => setModo("cpu"));

salvarPlacarEl.addEventListener("change", () => {
  saveEnabled = !!salvarPlacarEl.checked;
  savePrefs();
});

zerarPlacarBtn.addEventListener("click", () => {
  score = { X: 0, O: 0, E: 0 };
  renderScore();
  savePrefs();
});

/* =========================
   Init
========================= */
buildBoard();
loadPrefs();
setChip("X");
mensagem.textContent = "Vez do jogador X";
