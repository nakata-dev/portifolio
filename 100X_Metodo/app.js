/* ==========================
   Método 100x PRO (Clean)
   - 3 modos: text / words / password
   - etapas: lines / chunks / full
   - dicas com tempo (F8/botão)
   - tentativas por etapa
   - streak / best streak / acertos
   - histórico de sessões
   - LocalStorage + Export/Import
========================== */

const LS_KEY = "metodo_100x_pro_v2";

const $ = (id) => document.getElementById(id);

// UI
const modeRow = $("modeRow");
const sourceLabel = $("sourceLabel");
const sourceInput = $("sourceInput");
const sourceHint = $("sourceHint");

const difficultyEl = $("difficulty");
const stepModeEl = $("stepMode");
const hintSecondsEl = $("hintSeconds");
const maxTriesEl = $("maxTries");
const autosaveEl = $("autosave");

const btnStart = $("btnStart");
const btnSave = $("btnSave");
const btnClearSource = $("btnClearSource");

const stageTitle = $("stageTitle");
const stageSubtitle = $("stageSubtitle");

const btnHint = $("btnHint");
const btnCheck = $("btnCheck");
const btnSkip = $("btnSkip");
const btnRestartStage = $("btnRestartStage");
const btnFinishSession = $("btnFinishSession");

const mBtnHint = $("mBtnHint");
const mBtnCheck = $("mBtnCheck");
const mBtnSkip = $("mBtnSkip");

const hintBox = $("hintBox");
const answerInput = $("answerInput");
const feedback = $("feedback");
const diffBox = $("diffBox");

const statStage = $("statStage");
const statHits = $("statHits");
const statBestStreak = $("statBestStreak");

const historyList = $("historyList");

const btnHelp = $("btnHelp");
const helpModal = $("helpModal");
const btnCloseHelp = $("btnCloseHelp");

const btnExport = $("btnExport");
const btnImport = $("btnImport");
const btnResetAll = $("btnResetAll");

const ding = $("ding");

// App state
let state = loadState();

let steps = [];
let activeIndex = state.progress?.index ?? 0;
let triesLeft = state.progress?.triesLeft ?? (state.config?.maxTries ?? 10);
let hits = state.stats?.hits ?? 0;
let streak = state.stats?.streak ?? 0;
let bestStreak = state.stats?.bestStreak ?? 0;

let hintTimer = null;

// ---------- Init ----------
applyStateToUI();
rebuildStepsIfPossible();
renderAll();

// ---------- Events ----------
modeRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;

  setMode(btn.dataset.mode);
});

btnStart.addEventListener("click", startOrContinue);
btnSave.addEventListener("click", manualSave);
btnClearSource.addEventListener("click", clearSource);

btnHint.addEventListener("click", showHint);
btnCheck.addEventListener("click", validate);
btnSkip.addEventListener("click", skipStage);
btnRestartStage.addEventListener("click", restartStage);
btnFinishSession.addEventListener("click", () => finishSession(false));

mBtnHint.addEventListener("click", showHint);
mBtnCheck.addEventListener("click", validate);
mBtnSkip.addEventListener("click", skipStage);

[difficultyEl, stepModeEl, hintSecondsEl, maxTriesEl, autosaveEl].forEach(el => {
  el.addEventListener("change", () => {
    state.config = readConfigFromUI();
    autosaveMaybe();
    rebuildStepsIfPossible();
    renderAll();
  });
});

answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    validate();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "F8") {
    if (!hasActiveTraining()) return;
    e.preventDefault();
    showHint();
  }
  const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
  if (isSave) {
    e.preventDefault();
    manualSave();
  }
});

btnHelp.addEventListener("click", () => helpModal.showModal());
btnCloseHelp.addEventListener("click", () => helpModal.close());

btnExport.addEventListener("click", exportData);
btnImport.addEventListener("click", importData);
btnResetAll.addEventListener("click", resetAll);

// ---------- Core ----------
function setMode(mode) {
  if (!["text", "words", "password"].includes(mode)) return;

  state.mode = mode;
  document.querySelectorAll(".chip").forEach(c => {
    const active = c.dataset.mode === mode;
    c.classList.toggle("active", active);
    c.setAttribute("aria-selected", String(active));
  });

  updateSourceLabel();
  autosaveMaybe();
  rebuildStepsIfPossible();
  renderAll();
}

function startOrContinue() {
  const raw = sourceInput.value.trim();
  if (!raw) {
    toast("Cole um conteúdo para treinar.");
    return;
  }

  // Se conteúdo mudou, reconstruir etapas e reiniciar (mais previsível)
  const contentChanged = (raw !== (state.source || ""));
  state.source = raw;

  if (contentChanged || !state.progress) {
    activeIndex = 0;
    triesLeft = Number(state.config.maxTries || 10);
    hits = 0;
    streak = 0;
    // bestStreak mantém histórico do usuário
  }

  rebuildSteps();

  state.progress = { index: activeIndex, triesLeft };
  state.stats = { hits, streak, bestStreak };
  autosaveMaybe();

  hintBox.style.display = "none";
  diffBox.style.display = "none";
  answerInput.value = "";
  answerInput.focus();

  renderAll();
  toast("Treino iniciado. Bora. ✅");
}

function validate() {
  if (!hasActiveTraining()) {
    toast("Sem treino ativo. Cole um conteúdo e clique em Iniciar.");
    return;
  }

  const target = steps[activeIndex];
  const answer = answerInput.value;

  const result = diffMarkup(answer, target);
  diffBox.style.display = "block";
  diffBox.innerHTML = result.html;

  if (result.ok) {
    hits++;
    streak++;
    bestStreak = Math.max(bestStreak, streak);

    playDing();
    toast("✅ Correto! Próxima etapa.");

    activeIndex++;
    triesLeft = Number(state.config.maxTries || 10);

    if (activeIndex >= steps.length) {
      finishSession(true);
      return;
    }

    state.progress = { index: activeIndex, triesLeft };
    state.stats = { hits, streak, bestStreak };
    autosaveMaybe();

    answerInput.value = "";
    hintBox.style.display = "none";

    renderAll();
    return;
  }

  // Errou
  triesLeft--;
  streak = 0;

  state.progress = { index: activeIndex, triesLeft: Math.max(triesLeft, 0) };
  state.stats = { hits, streak, bestStreak };
  autosaveMaybe();

  if (triesLeft <= 0) {
    toast("❌ Tentativas esgotadas. Use a dica (F8) ou repita a etapa.");
    triesLeft = 0;
  } else {
    toast(`❌ Ainda não. Tentativas restantes: ${triesLeft}`);
  }

  renderAll(false);
}

function skipStage() {
  if (!hasActiveTraining()) return;

  const ok = confirm("Pular esta etapa?");
  if (!ok) return;

  activeIndex = Math.min(activeIndex + 1, steps.length);
  triesLeft = Number(state.config.maxTries || 10);

  state.progress = { index: activeIndex, triesLeft };
  autosaveMaybe();

  answerInput.value = "";
  hintBox.style.display = "none";

  if (activeIndex >= steps.length) finishSession(true);
  else renderAll();
}

function restartStage() {
  if (!hasActiveTraining()) return;

  triesLeft = Number(state.config.maxTries || 10);
  state.progress = { index: activeIndex, triesLeft };
  autosaveMaybe();

  answerInput.value = "";
  hintBox.style.display = "none";
  toast("🔁 Etapa reiniciada.");
  renderAll(false);
}

function finishSession(completed) {
  if (completed) {
    playDing();
    toast("🏁 Parabéns! Você concluiu todas as etapas.");
    addHistoryEntry();
    // Zera progresso para nova sessão
    state.progress = null;
    activeIndex = 0;
    triesLeft = Number(state.config.maxTries || 10);
    answerInput.value = "";
    diffBox.style.display = "none";
  } else {
    toast("Sessão finalizada. Você pode continuar depois (progresso salvo).");
    // Mantém progresso
    state.progress = { index: activeIndex, triesLeft };
  }

  state.stats = { hits, streak, bestStreak };
  autosaveMaybe();
  renderAll();
}

function showHint() {
  if (!hasActiveTraining()) return;

  const seconds = clamp(Number(state.config.hintSeconds || 6), 2, 20);
  const target = steps[activeIndex];
  clearTimeout(hintTimer);

  hintBox.style.display = "block";

  if (state.mode === "password") {
    // mascara e revela rapidamente
    const masked = target.replace(/[^\n]/g, "•");
    hintBox.textContent = masked;

    setTimeout(() => {
      hintBox.textContent = target;
    }, Math.min(900, seconds * 300));

    hintTimer = setTimeout(() => {
      hintBox.style.display = "none";
    }, seconds * 1000);

    return;
  }

  if (state.mode === "words") {
    // mostra embaralhado como dica
    const list = target.split("\n").filter(Boolean);
    hintBox.textContent = shuffle(list.slice()).join("\n");
    hintTimer = setTimeout(() => (hintBox.style.display = "none"), seconds * 1000);
    return;
  }

  hintBox.textContent = target;
  hintTimer = setTimeout(() => (hintBox.style.display = "none"), seconds * 1000);
}

// ---------- Steps ----------
function hasActiveTraining() {
  return steps.length > 0 && activeIndex < steps.length;
}

function rebuildStepsIfPossible() {
  const raw = (state.source || sourceInput.value || "").trim();
  if (!raw) {
    steps = [];
    return;
  }
  rebuildSteps();
}

function rebuildSteps() {
  const raw = (state.source || "").trim();
  const mode = state.mode || "text";
  const stepMode = state.config.stepMode || "lines";

  if (!raw) { steps = []; return; }

  if (mode === "text") {
    const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const base = lines.length ? lines : [raw];

    if (stepMode === "lines") {
      steps = base.map((_, i) => base.slice(0, i + 1).join("\n"));
    } else if (stepMode === "chunks") {
      const chunkSize = 3;
      const chunks = [];
      for (let i = 0; i < base.length; i += chunkSize) {
        chunks.push(base.slice(0, i + chunkSize).join("\n"));
      }
      steps = chunks;
    } else {
      steps = [base.join("\n")];
    }
  }

  if (mode === "words") {
    const words = raw.split(/[\n,;]+/).map(w => w.trim()).filter(Boolean);
    if (words.length === 0) { steps = []; return; }

    if (stepMode === "full") steps = [words.join("\n")];
    else steps = words.map((_, i) => words.slice(0, i + 1).join("\n"));
  }

  if (mode === "password") {
    const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const list = lines.length ? lines : [raw];

    if (stepMode === "full") steps = [list.join("\n")];
    else steps = list.map((_, i) => list.slice(0, i + 1).join("\n"));
  }

  // Ajuste seguro do índice
  activeIndex = clamp(activeIndex, 0, Math.max(steps.length - 1, 0));
  triesLeft = clamp(triesLeft, 0, Number(state.config.maxTries || 10));

  state.progress = state.progress || { index: activeIndex, triesLeft };
  state.progress.index = activeIndex;
  state.progress.triesLeft = triesLeft;

  autosaveMaybe();
}

// ---------- Diff ----------
function normalize(str, difficulty) {
  const s = String(str).replace(/\r\n/g, "\n");
  if (difficulty === "easy") return s.replace(/\s/g, "").toLowerCase();

  if (difficulty === "normal") {
    return s
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return s; // hard
}

function diffMarkup(answer, target) {
  const difficulty = state.config.difficulty || "normal";
  const ok = normalize(answer, difficulty) === normalize(target, difficulty);

  // Diff didático sempre com strings "cruas"
  const t = String(target).replace(/\r\n/g, "\n");
  const a = String(answer).replace(/\r\n/g, "\n");
  const max = Math.max(t.length, a.length);

  let html = "";
  for (let i = 0; i < max; i++) {
    const tc = t[i];
    const ac = a[i];

    if (tc === undefined && ac !== undefined) {
      html += `<span class="badchar">${escapeHtml(ac)}</span>`;
      continue;
    }
    if (tc !== undefined && ac === undefined) {
      html += `<span class="miss">_</span>`;
      continue;
    }
    if (tc === ac) html += `<span class="ok">${escapeHtml(tc)}</span>`;
    else html += `<span class="badchar">${escapeHtml(ac)}</span>`;
  }

  return { ok, html };
}

// ---------- History ----------
function addHistoryEntry() {
  state.history = state.history || [];
  state.history.unshift({
    finishedAt: Date.now(),
    mode: state.mode,
    steps: steps.length,
    hits,
    bestStreak
  });
  state.history = state.history.slice(0, 50); // limite
}

function renderHistory() {
  const list = state.history || [];
  historyList.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.className = "muted small";
    li.textContent = "Nenhuma sessão concluída ainda.";
    historyList.appendChild(li);
    return;
  }

  list.forEach(item => {
    const li = document.createElement("li");
    li.className = "history-item";

    const modeLabel =
      item.mode === "text" ? "Texto" :
      item.mode === "words" ? "Palavras" : "Senhas";

    const date = new Date(item.finishedAt).toLocaleString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    li.innerHTML = `
      <div>
        <strong>✅ ${modeLabel} • ${item.steps} etapas</strong>
        <div class="meta">${date}</div>
      </div>
      <div class="meta">
        Acertos: <strong>${item.hits}</strong><br>
        Best streak: <strong>${item.bestStreak}</strong>
      </div>
    `;
    historyList.appendChild(li);
  });
}

// ---------- Render ----------
function renderAll(resetDiff = true) {
  updateSourceLabel();
  renderStats();
  renderTrainer(resetDiff);
  renderHistory();
}

function renderStats() {
  statHits.textContent = String(hits);
  statBestStreak.textContent = String(bestStreak);
  statStage.textContent = steps.length
    ? `${Math.min(activeIndex + 1, steps.length)}/${steps.length}`
    : "0/0";
}

function renderTrainer(resetDiff) {
  if (!steps.length) {
    stageTitle.textContent = "Pronto para iniciar";
    stageSubtitle.textContent = "Cole um conteúdo e clique em iniciar.";
    if (resetDiff) {
      diffBox.style.display = "none";
      diffBox.innerHTML = "";
    }
    return;
  }

  if (activeIndex >= steps.length) {
    stageTitle.textContent = "Sessão concluída";
    stageSubtitle.textContent = "Inicie novamente para treinar mais.";
    return;
  }

  const modeLabel =
    state.mode === "text" ? "Texto" :
    state.mode === "words" ? "Palavras" : "Senhas";

  stageTitle.textContent = `Etapa ${activeIndex + 1} de ${steps.length}`;
  stageSubtitle.textContent = `${modeLabel} • Tentativas: ${triesLeft}`;

  if (resetDiff) {
    diffBox.style.display = "none";
    diffBox.innerHTML = "";
  }
}

// ---------- Storage ----------
function readConfigFromUI() {
  return {
    difficulty: difficultyEl.value,
    stepMode: stepModeEl.value,
    hintSeconds: Number(hintSecondsEl.value || 6),
    maxTries: Number(maxTriesEl.value || 10),
    autosave: autosaveEl.value
  };
}

function applyStateToUI() {
  state.mode = state.mode || "text";
  state.config = state.config || defaultState().config;

  // Mode chips
  document.querySelectorAll(".chip").forEach(c => {
    const active = c.dataset.mode === state.mode;
    c.classList.toggle("active", active);
    c.setAttribute("aria-selected", String(active));
  });

  difficultyEl.value = state.config.difficulty || "normal";
  stepModeEl.value = state.config.stepMode || "lines";
  hintSecondsEl.value = state.config.hintSeconds ?? 6;
  maxTriesEl.value = state.config.maxTries ?? 10;
  autosaveEl.value = state.config.autosave ?? "on";

  sourceInput.value = state.source || "";
  updateSourceLabel();
}

function updateSourceLabel() {
  const mode = state.mode || "text";

  if (mode === "text") {
    sourceLabel.textContent = "Cole seu texto";
    sourceHint.textContent = "Dica: use linhas/frases. Você pode treinar por blocos também.";
  }
  if (mode === "words") {
    sourceLabel.textContent = "Cole suas palavras";
    sourceHint.textContent = "Separe com vírgula ou uma por linha. Ex: HTML, CSS, JavaScript.";
  }
  if (mode === "password") {
    sourceLabel.textContent = "Cole suas senhas";
    sourceHint.textContent = "Uma senha por linha. A dica mascara e revela por pouco tempo.";
  }
}

function autosaveMaybe() {
  state.config = readConfigFromUI();
  if (state.config.autosave === "on") persist();
}

function persist() {
  const safe = sanitizeState({
    ...state,
    source: state.source ?? sourceInput.value.trim(),
    config: readConfigFromUI(),
    progress: state.progress,
    stats: { hits, streak, bestStreak },
    history: state.history || []
  });
  localStorage.setItem(LS_KEY, JSON.stringify(safe));
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    return sanitizeState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    mode: "text",
    source: "",
    config: { difficulty: "normal", stepMode: "lines", hintSeconds: 6, maxTries: 10, autosave: "on" },
    progress: null,
    stats: { hits: 0, streak: 0, bestStreak: 0 },
    history: []
  };
}

function sanitizeState(obj) {
  const base = defaultState();
  if (!obj || typeof obj !== "object") return base;

  base.mode = ["text", "words", "password"].includes(obj.mode) ? obj.mode : base.mode;
  base.source = typeof obj.source === "string" ? obj.source : base.source;

  if (obj.config && typeof obj.config === "object") {
    base.config.difficulty = ["easy", "normal", "hard"].includes(obj.config.difficulty) ? obj.config.difficulty : base.config.difficulty;
    base.config.stepMode = ["lines", "chunks", "full"].includes(obj.config.stepMode) ? obj.config.stepMode : base.config.stepMode;
    base.config.hintSeconds = clamp(Number(obj.config.hintSeconds || base.config.hintSeconds), 2, 20);
    base.config.maxTries = clamp(Number(obj.config.maxTries || base.config.maxTries), 1, 50);
    base.config.autosave = (obj.config.autosave === "off") ? "off" : "on";
  }

  if (obj.progress && typeof obj.progress === "object") {
    base.progress = {
      index: clamp(Number(obj.progress.index || 0), 0, 999999),
      triesLeft: clamp(Number(obj.progress.triesLeft || base.config.maxTries), 0, base.config.maxTries)
    };
  } else {
    base.progress = null;
  }

  if (obj.stats && typeof obj.stats === "object") {
    base.stats = {
      hits: clamp(Number(obj.stats.hits || 0), 0, 999999),
      streak: clamp(Number(obj.stats.streak || 0), 0, 999999),
      bestStreak: clamp(Number(obj.stats.bestStreak || 0), 0, 999999)
    };
  }

  if (Array.isArray(obj.history)) {
    base.history = obj.history.slice(0, 50).map(h => ({
      finishedAt: Number(h.finishedAt || Date.now()),
      mode: ["text","words","password"].includes(h.mode) ? h.mode : "text",
      steps: Number(h.steps || 0),
      hits: Number(h.hits || 0),
      bestStreak: Number(h.bestStreak || 0)
    }));
  }

  return base;
}

// ---------- Export/Import/Reset ----------
function exportData() {
  persist();
  const data = localStorage.getItem(LS_KEY) || JSON.stringify(defaultState(), null, 2);

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "metodo-100x-pro.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const obj = JSON.parse(text);

      state = sanitizeState(obj);
      localStorage.setItem(LS_KEY, JSON.stringify(state));

      // rehidrata variáveis
      activeIndex = state.progress?.index ?? 0;
      triesLeft = state.progress?.triesLeft ?? state.config.maxTries;
      hits = state.stats?.hits ?? 0;
      streak = state.stats?.streak ?? 0;
      bestStreak = state.stats?.bestStreak ?? 0;

      applyStateToUI();
      rebuildStepsIfPossible();
      renderAll();

      toast("⬆️ Importado com sucesso!");
    } catch {
      alert("Arquivo inválido. Envie um JSON exportado pelo app.");
    }
  };

  input.click();
}

function resetAll() {
  const ok = confirm("Resetar TUDO? Isso apaga conteúdo, progresso e histórico.");
  if (!ok) return;
  localStorage.removeItem(LS_KEY);
  location.reload();
}

// ---------- UI helpers ----------
function manualSave() {
  state.source = sourceInput.value.trim();
  state.config = readConfigFromUI();
  state.progress = state.progress || { index: activeIndex, triesLeft };
  state.stats = { hits, streak, bestStreak };
  persist();
  toast("💾 Salvo!");
}

function clearSource() {
  const ok = confirm("Limpar o conteúdo colado?");
  if (!ok) return;

  sourceInput.value = "";
  state.source = "";
  // não apaga histórico por padrão
  state.progress = null;
  steps = [];
  activeIndex = 0;
  triesLeft = Number(state.config.maxTries || 10);
  hits = 0;
  streak = 0;

  persist();
  renderAll();
  toast("🧽 Conteúdo limpo.");
}

function toast(msg) {
  feedback.innerHTML = msg;
}

function playDing() {
  ding.currentTime = 0;
  ding.play().catch(() => {});
}

// ---------- Utils ----------
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
