/* =========================================================
   Cacheta TOP | Placar PRO
   ✅ Burger Menu + 3 jogos (Cacheta / Truco / Buraco)
   ✅ LocalStorage separado por jogo
========================================================= */

const BASE_KEY = "placar_pro_v2";
let activeGame = localStorage.getItem(`${BASE_KEY}_activeGame`) || "cacheta";

const GAMES = {
  cacheta: {
    key: "cacheta",
    title: "Cacheta TOP",
    subtitle: "Marque quedas no celular sem perder o jogo.",
    themeClass: "theme-cacheta",
    roundsDefault: 10,
    maxScore: 15,
    padNumbers: Array.from({ length: 16 }, (_, i) => 15 - i), // 15..0
    turboTitle: "⚡ Modo Turbo Cacheta",
    turbo: [
      { id: "turbo1", label: "➖ -1 Queda", delta: -1 },
      { id: "turbo2", label: "➕ +1", delta: 1 },
      { id: "turbo3", label: "🔥 +2 Fechou", delta: 2 },
      { id: "turbo4", label: "👑 +3 Bateu", delta: 3 },
      { id: "turbo5", label: "🧼 Zerar", set: 0 }
    ]
  },

  truco: {
    key: "truco",
    title: "Truco TOP",
    subtitle: "Marcação rápida até 12 pontos (do jeito certo).",
    themeClass: "theme-truco",
    roundsDefault: 12,
    maxScore: 12,
    padNumbers: Array.from({ length: 13 }, (_, i) => 12 - i), // 12..0
    turboTitle: "⚡ Modo Turbo Truco",
    turbo: [
      { id: "turbo1", label: "➖ -1", delta: -1 },
      { id: "turbo2", label: "➕ +1", delta: 1 },
      { id: "turbo3", label: "🗣️ +3 TRUCO", delta: 3 },
      { id: "turbo4", label: "💥 +6 SEIS", delta: 6 },
      { id: "turbo5", label: "🏁 +12 FECHOU", set: 12 }
    ]
  },

  buraco: {
    key: "buraco",
    title: "Buraco TOP",
    subtitle: "Pontuação alta com atalhos rápidos e práticos.",
    themeClass: "theme-buraco",
    roundsDefault: 10,
    maxScore: 5000,
    padNumbers: [2000,1500,1000,800,600,500,400,300,250,200,150,100,50,0],
    turboTitle: "⚡ Modo Turbo Buraco",
    turbo: [
      { id: "turbo1", label: "➖ -50", delta: -50 },
      { id: "turbo2", label: "➕ +50", delta: 50 },
      { id: "turbo3", label: "🔥 +100", delta: 100 },
      { id: "turbo4", label: "🏆 +500", delta: 500 },
      { id: "turbo5", label: "🧼 Zerar", set: 0 }
    ]
  }
};

// estado do placar
let state = loadState(activeGame) || createDefaultState(activeGame);

// Célula atual clicada
let activeCell = null;

// valores do bottom sheet
let sheetValue = "—";
let sheetMark = "";

const $ = (s) => document.querySelector(s);

function storageKey(gameKey) {
  return `${BASE_KEY}_${gameKey}`;
}

function createDefaultState(gameKey) {
  const cfg = GAMES[gameKey];
  return {
    game: gameKey,
    rounds: cfg.roundsDefault,
    maxPlayers: 9,
    players: Array.from({ length: 4 }, () => ({
      name: "",
      scores: Array(cfg.roundsDefault).fill("—"),
      marks: Array(cfg.roundsDefault).fill("")
    }))
  };
}

/* ---------------------- LocalStorage ---------------------- */
function saveState() {
  localStorage.setItem(storageKey(activeGame), JSON.stringify(state));
}

function loadState(gameKey) {
  try {
    const raw = localStorage.getItem(storageKey(gameKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.players) return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ---------------------- Render ---------------------- */
function render() {
  normalizeState();
  applyGameUI();
  renderRoundsHeader();
  renderPlayers();
  updateStats();
  saveState();
  updateDrawerActive();
}

function normalizeState() {
  state.players.forEach(p => {
    p.scores = [...(p.scores || []), ...Array(state.rounds).fill("—")].slice(0, state.rounds);
    p.marks = [...(p.marks || []), ...Array(state.rounds).fill("")].slice(0, state.rounds);
  });
}

function renderRoundsHeader() {
  const row = $("#roundsRow");
  row.innerHTML = `<th class="sticky name-col">Jogador</th>`;
  for (let i = 0; i < state.rounds; i++) row.innerHTML += `<th>${i + 1}</th>`;
}

function renderPlayers() {
  const tbody = $("#playersBody");
  tbody.innerHTML = "";

  state.players.forEach((p, pIndex) => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.className = "sticky name-col";
    tdName.innerHTML = `
      <input
        class="name-input"
        placeholder="Jogador ${pIndex + 1}"
        value="${escapeHTML(p.name || "")}"
        data-player="${pIndex}"
      />
    `;
    tr.appendChild(tdName);

    for (let r = 0; r < state.rounds; r++) {
      const td = document.createElement("td");
      td.className = "cell";
      td.dataset.player = String(pIndex);
      td.dataset.round = String(r);

      const value = p.scores[r] ?? "—";
      const mark = p.marks[r] ?? "";

      td.appendChild(buildScore(value, mark));
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".name-input").forEach(inp => {
    inp.addEventListener("input", (e) => {
      const idx = Number(e.target.dataset.player);
      state.players[idx].name = e.target.value;
      saveState();
      updateStats();
    });
  });
}

function buildScore(value, mark) {
  const box = document.createElement("div");
  box.className = "score";

  if (mark === "○") box.classList.add("win");
  if (mark === "▲") box.classList.add("thanks");

  box.textContent = value;

  if (mark) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = mark;
    box.appendChild(badge);
  }

  return box;
}

/* ---------------------- Estatísticas ---------------------- */
function updateStats() {
  $("#statPlayers").textContent = String(state.players.length);
  $("#statRounds").textContent = String(state.rounds);

  const leader = getLeader();
  $("#statLeader").textContent = leader || "—";
}

function getLeader() {
  const totals = state.players.map(p => ({
    name: (p.name || "").trim() || "—",
    total: sumPlayer(p)
  }));

  if (!totals.some(t => t.total > 0)) return null;
  totals.sort((a, b) => b.total - a.total);
  return totals[0].name;
}

function sumPlayer(player) {
  return player.scores.reduce((acc, v) => {
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);
}

/* ---------------------- Aplicar UI do jogo ---------------------- */
function applyGameUI() {
  const cfg = GAMES[activeGame];

  // título/subtitle
  $("#appTitle").innerHTML = `${cfg.title} <span class="pro">PRO</span>`;
  $("#appSubtitle").textContent = cfg.subtitle;

  // tema
  document.body.classList.remove("theme-cacheta", "theme-truco", "theme-buraco");
  document.body.classList.add(cfg.themeClass);

  // rodadas select
  $("#roundsSelect").value = String(state.rounds);

  // turbo
  $("#turboTitle").textContent = cfg.turboTitle;

  cfg.turbo.forEach(btn => {
    const el = $("#" + btn.id);
    if (!el) return;

    el.textContent = btn.label;

    // limpa data attrs antigos
    el.removeAttribute("data-delta");
    el.removeAttribute("data-set");

    if (btn.delta !== undefined) el.dataset.delta = String(btn.delta);
    if (btn.set !== undefined) el.dataset.set = String(btn.set);
  });
}

/* ======================= Bottom Sheet ======================= */
function openSheet(cell) {
  activeCell = cell;

  const pIndex = Number(cell.dataset.player);
  const rIndex = Number(cell.dataset.round);

  const name = (state.players[pIndex].name || "").trim() || `Jogador ${pIndex + 1}`;
  const curValue = state.players[pIndex].scores[rIndex] ?? "—";
  const curMark = state.players[pIndex].marks[rIndex] ?? "";

  sheetValue = curValue;
  sheetMark = curMark;

  $("#prevPlayer").textContent = name;
  $("#prevRound").textContent = `Rodada ${rIndex + 1}`;
  $("#prevScore").textContent = curValue;

  renderPad();
  setActiveMarker();

  document.body.classList.add("sheet-open");
  $("#sheetOverlay").setAttribute("aria-hidden", "false");
}

function closeSheet() {
  document.body.classList.remove("sheet-open");
  $("#sheetOverlay").setAttribute("aria-hidden", "true");
  activeCell = null;
}

function renderPad() {
  const cfg = GAMES[activeGame];
  const pad = $("#padGrid");
  pad.innerHTML = "";

  cfg.padNumbers.forEach((n) => {
    const k = document.createElement("div");
    k.className = "key";
    k.textContent = String(n);

    if (String(sheetValue) === String(n)) k.classList.add("active");

    k.addEventListener("click", () => {
      sheetValue = String(n);
      $("#prevScore").textContent = sheetValue;
      highlightPad();
    });

    pad.appendChild(k);
  });

  const empty = document.createElement("div");
  empty.className = "key";
  empty.textContent = "—";
  if (sheetValue === "—") empty.classList.add("active");

  empty.addEventListener("click", () => {
    sheetValue = "—";
    $("#prevScore").textContent = "—";
    highlightPad();
  });

  pad.appendChild(empty);
}

function highlightPad() {
  document.querySelectorAll(".key").forEach(k => {
    k.classList.toggle("active", k.textContent === String(sheetValue));
  });
}

function setActiveMarker() {
  document.querySelectorAll(".marker-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mark === sheetMark);
  });
}

function getSheetNumber() {
  const n = Number(String(sheetValue).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function setSheetNumber(n) {
  const cfg = GAMES[activeGame];
  const clamped = Math.max(0, Math.min(cfg.maxScore, n));
  sheetValue = String(clamped);
  $("#prevScore").textContent = sheetValue;
  highlightPad();
}

function applySheet() {
  if (!activeCell) return;

  const pIndex = Number(activeCell.dataset.player);
  const rIndex = Number(activeCell.dataset.round);

  state.players[pIndex].scores[rIndex] = sheetValue;
  state.players[pIndex].marks[rIndex] = sheetMark;

  saveState();
  render();
  closeSheet();
  toast("✅ Marcado!");
}

/* ---------------------- Players ---------------------- */
function addPlayer() {
  if (state.players.length >= state.maxPlayers) {
    toast("⚠ Máximo de jogadores atingido.");
    return;
  }

  state.players.push({
    name: "",
    scores: Array(state.rounds).fill("—"),
    marks: Array(state.rounds).fill("")
  });

  render();
  toast("➕ Jogador adicionado");
}

function removePlayer() {
  if (state.players.length <= 2) {
    toast("⚠ Mínimo 2 jogadores.");
    return;
  }
  if (!confirm("Remover o último jogador?")) return;

  state.players.pop();
  render();
  toast("➖ Jogador removido");
}

function resetScores() {
  if (!confirm("Resetar apenas os pontos? (mantém nomes)")) return;

  state.players.forEach(p => {
    p.scores = Array(state.rounds).fill("—");
    p.marks = Array(state.rounds).fill("");
  });

  render();
  toast("♻ Pontos zerados!");
}

function newMatch() {
  if (!confirm("Nova partida? (zera tudo, inclusive nomes)")) return;

  state = createDefaultState(activeGame);
  saveState();
  render();
  toast("🆕 Nova partida!");
}

function changeRounds(val) {
  const rounds = Number(val);
  if (!Number.isFinite(rounds)) return;

  state.rounds = rounds;

  state.players.forEach(p => {
    p.scores = [...p.scores, ...Array(rounds).fill("—")].slice(0, rounds);
    p.marks = [...p.marks, ...Array(rounds).fill("")].slice(0, rounds);
  });

  render();
  toast(`🎯 Rodadas: ${rounds}`);
}

/* ---------------------- Burger / Drawer ---------------------- */
function openDrawer() {
  document.body.classList.add("drawer-open");
  $("#drawerOverlay").setAttribute("aria-hidden", "false");
  $("#btnBurger").setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  document.body.classList.remove("drawer-open");
  $("#drawerOverlay").setAttribute("aria-hidden", "true");
  $("#btnBurger").setAttribute("aria-expanded", "false");
}

function toggleDrawer() {
  if (document.body.classList.contains("drawer-open")) closeDrawer();
  else openDrawer();
}

function updateDrawerActive() {
  document.querySelectorAll(".drawer-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.game === activeGame);
    const pill = btn.querySelector(".drawer-pill");
    if (pill) pill.textContent = (btn.dataset.game === activeGame) ? "Atual" : "Novo";
  });
}

function switchGame(gameKey) {
  if (!GAMES[gameKey]) return;

  // salva jogo atual
  saveState();

  // troca jogo ativo
  activeGame = gameKey;
  localStorage.setItem(`${BASE_KEY}_activeGame`, activeGame);

  // carrega estado do jogo (se não tiver, cria)
  state = loadState(activeGame) || createDefaultState(activeGame);

  closeDrawer();
  render();
  toast(`🎴 ${GAMES[activeGame].title} ativado!`);
}

/* ---------------------- WhatsApp ---------------------- */
function setupWhatsAppLink() {
  // ✅ TROQUE AQUI pelo seu número com DDD +55
  const phone = "5599999999999";

  const msg = encodeURIComponent("Olá! Vi seu Placar PRO no portfólio. Podemos conversar?");
  $("#whatsLink").href = `https://wa.me/${phone}?text=${msg}`;
}

/* ---------------------- Toast ---------------------- */
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1700);
}

/* ---------------------- Segurança HTML ---------------------- */
function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* ---------------------- Eventos ---------------------- */
function bindEvents() {
  // abrir sheet ao tocar na célula
  $("#playersBody").addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    openSheet(cell);
  });

  $("#sheetOverlay").addEventListener("click", closeSheet);
  $("#btnCloseSheet").addEventListener("click", closeSheet);

  $("#btnApply").addEventListener("click", applySheet);

  $("#btnClearCell").addEventListener("click", () => {
    sheetValue = "—";
    sheetMark = "";
    $("#prevScore").textContent = "—";
    highlightPad();
    setActiveMarker();
  });

  // marcadores
  document.querySelectorAll(".marker-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      sheetMark = btn.dataset.mark;
      setActiveMarker();
    });
  });

  // ✅ TURBO: delta / set
  document.querySelectorAll(".turbo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const setVal = btn.dataset.set;
      if (setVal !== undefined) {
        setSheetNumber(Number(setVal));
        return;
      }

      const delta = Number(btn.dataset.delta || 0);
      const atual = getSheetNumber();
      setSheetNumber(atual + delta);
    });
  });

  // Players
  $("#btnAddPlayer").addEventListener("click", addPlayer);
  $("#btnRemovePlayer").addEventListener("click", removePlayer);
  $("#btnReset").addEventListener("click", resetScores);
  $("#btnNew").addEventListener("click", newMatch);

  $("#roundsSelect").addEventListener("change", (e) => changeRounds(e.target.value));

  // Drawer
  $("#btnBurger").addEventListener("click", toggleDrawer);
  $("#drawerOverlay").addEventListener("click", closeDrawer);
  $("#btnCloseDrawer").addEventListener("click", closeDrawer);

  document.querySelectorAll(".drawer-item").forEach(btn => {
    btn.addEventListener("click", () => switchGame(btn.dataset.game));
  });

  // teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSheet();
      closeDrawer();
    }
  });
}

/* ---------------------- Init ---------------------- */
function init() {
  setupWhatsAppLink();
  bindEvents();
  render();
}

init();
