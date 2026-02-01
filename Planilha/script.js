const LS_KEY = "finance_pro_v1";
const FX_API = "https://api.frankfurter.dev/v1";

const $ = (s) => document.querySelector(s);

const DAYS_IN_MONTH = 31;

const defaultState = () => ({
  month: "",

  settings: {
    name: "",
    company: "",
    rangeText: "",
    hourValue: 0,
    overtimeMult: 1.25,
    autosave: "on",

    aNormal: 8,
    aExtra: 3,
    bNormal: 7,
    bExtra: 4,
  },

  monthData: {
    daysA: 0,
    daysB: 0,
    bonusJPY: 0,

    sentJPY: 0,
    savedJPY: 0,

    expenses: {
      fixed: [
        { id: uid(), desc: "Aluguel", values: Array(DAYS_IN_MONTH).fill(0) }
      ],
      variable: [
        { id: uid(), desc: "Mercado", values: Array(DAYS_IN_MONTH).fill(0) }
      ],
    }
  },

  fx: {
    base: "JPY",
    brl: null,
    usd: null,
    date: null,
    fetchedAt: null
  }
});

let state = load() || defaultState();

// --- Utils ---
function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function clampNum(v) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatJPY(n) {
  const v = Math.round(clampNum(n));
  return `JP¥ ${v.toLocaleString("pt-BR")}`;
}

function formatMoney(n, currency) {
  const v = clampNum(n);
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(v);
  } catch {
    const sign = currency === "USD" ? "$" : "R$";
    return `${sign} ${v.toFixed(2)}`;
  }
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1600);
}

// --- Storage ---
function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.settings || !parsed.monthData) return null;
    normalize(parsed);
    return parsed;
  } catch {
    return null;
  }
}

function normalize(st) {
  const exp = st.monthData?.expenses;
  if (!exp) return;

  ["fixed", "variable"].forEach((k) => {
    exp[k] = Array.isArray(exp[k]) ? exp[k] : [];
    exp[k].forEach(row => {
      row.values = Array.isArray(row.values) ? row.values : [];
      row.values = [...row.values, ...Array(DAYS_IN_MONTH).fill(0)].slice(0, DAYS_IN_MONTH);
      row.desc = row.desc ?? "";
      row.id = row.id ?? uid();
    });
  });
}

// --- Month handling (salvar por mês) ---
function getMonthKey(month) {
  return `${LS_KEY}__month__${month}`;
}

function loadMonth(month) {
  try {
    const raw = localStorage.getItem(getMonthKey(month));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;

    if (!parsed.expenses) parsed.expenses = { fixed: [], variable: [] };
    normalize({ monthData: { expenses: parsed.expenses } });

    return parsed;
  } catch {
    return null;
  }
}

function saveMonth() {
  if (!state.month) return;
  localStorage.setItem(getMonthKey(state.month), JSON.stringify(state.monthData));
}

function clearMonth() {
  if (!state.month) return;
  if (!confirm("Limpar os dados deste mês?")) return;
  localStorage.removeItem(getMonthKey(state.month));
  state.monthData = defaultState().monthData;
  renderAll();
  autosaveSoon();
  toast("Mês limpo ✅");
}

// --- FX (cache diário) ---
function fxCacheKey(date) {
  return `${LS_KEY}__fx__${date}`;
}

async function fetchFX(force = false) {
  const today = new Date().toISOString().slice(0, 10);
  const cachedRaw = localStorage.getItem(fxCacheKey(today));
  if (!force && cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (cached && cached.brl && cached.usd) {
        state.fx = cached;
        renderFX();
        return;
      }
    } catch {}
  }

  try {
    const url = `${FX_API}/latest?base=JPY&symbols=BRL,USD`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("FX fail");
    const data = await res.json();

    const brl = data?.rates?.BRL ?? null;
    const usd = data?.rates?.USD ?? null;

    state.fx = {
      base: "JPY",
      brl,
      usd,
      date: data?.date ?? today,
      fetchedAt: Date.now()
    };

    localStorage.setItem(fxCacheKey(today), JSON.stringify(state.fx));
    save();
    renderFX();
  } catch {
    renderFX(true);
  }
}

function renderFX(error = false) {
  const meta = $("#fxMeta");
  if (error) {
    meta.textContent = "Falha ao buscar câmbio. Usando cache, se existir.";
  } else if (state.fx?.date) {
    meta.textContent = `Atualizado: ${state.fx.date}`;
  } else {
    meta.textContent = "Sem dados ainda.";
  }

  $("#rateBRL").textContent = state.fx?.brl ? state.fx.brl.toFixed(6) : "—";
  $("#rateUSD").textContent = state.fx?.usd ? state.fx.usd.toFixed(6) : "—";

  renderSavings();
}

// --- Calculations ---
function calcTurnValuePerDay(kind) {
  const h = clampNum(state.settings.hourValue);
  const mult = clampNum(state.settings.overtimeMult || 1.25);

  const aNorm = clampNum(state.settings.aNormal);
  const aExt = clampNum(state.settings.aExtra);
  const bNorm = clampNum(state.settings.bNormal);
  const bExt = clampNum(state.settings.bExtra);

  if (kind === "A") {
    return h * (aNorm + aExt * mult);
  }
  return h * (bNorm + bExt * mult);
}

function calcIncomeJPY() {
  const daysA = clampNum(state.monthData.daysA);
  const daysB = clampNum(state.monthData.daysB);
  const bonus = clampNum(state.monthData.bonusJPY);

  const dayA = calcTurnValuePerDay("A");
  const dayB = calcTurnValuePerDay("B");

  return (daysA * dayA) + (daysB * dayB) + bonus;
}

function sumExpenses(kind) {
  const rows = state.monthData.expenses[kind] || [];
  return rows.reduce((acc, row) => {
    const rowSum = row.values.reduce((a, v) => a + clampNum(v), 0);
    return acc + rowSum;
  }, 0);
}

function calcTotals() {
  const income = calcIncomeJPY();
  const fixed = sumExpenses("fixed");
  const vari = sumExpenses("variable");
  const expenses = fixed + vari;
  const balance = income - expenses;
  const sent = clampNum(state.monthData.sentJPY);
  const diff = balance - sent;

  return { income, fixed, vari, expenses, balance, sent, diff };
}

// --- Matrix builders ---
function buildMatrixThead(targetId) {
  const thead = $(targetId);
  thead.innerHTML = "";

  const tr = document.createElement("tr");

  const thDesc = document.createElement("th");
  thDesc.className = "sticky sticky-top desc-col";
  thDesc.textContent = "Descrição";
  tr.appendChild(thDesc);

  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    const th = document.createElement("th");
    th.className = "sticky-top";
    th.textContent = String(d);
    tr.appendChild(th);
  }

  const thTotal = document.createElement("th");
  thTotal.className = "sticky-top";
  thTotal.textContent = "Total";
  tr.appendChild(thTotal);

  thead.appendChild(tr);
}

function buildMatrixTfoot(targetId, kind) {
  const tfoot = $(targetId);
  tfoot.innerHTML = "";

  const tr = document.createElement("tr");

  const tdLabel = document.createElement("td");
  tdLabel.className = "sticky desc-col";
  tdLabel.textContent = "Total por dia";
  tr.appendChild(tdLabel);

  const rows = state.monthData.expenses[kind];
  for (let d = 0; d < DAYS_IN_MONTH; d++) {
    const td = document.createElement("td");
    const totalDay = rows.reduce((acc, row) => acc + clampNum(row.values[d]), 0);
    td.textContent = Math.round(totalDay).toLocaleString("pt-BR");
    tr.appendChild(td);
  }

  const tdGrand = document.createElement("td");
  const grand = rows.reduce((acc, row) => acc + row.values.reduce((a, v) => a + clampNum(v), 0), 0);
  tdGrand.textContent = Math.round(grand).toLocaleString("pt-BR");
  tr.appendChild(tdGrand);

  tfoot.appendChild(tr);
}

function buildMatrixBody(tbodyId, kind) {
  const tbody = $(tbodyId);
  tbody.innerHTML = "";

  const rows = state.monthData.expenses[kind];

  rows.forEach((row) => {
    const tr = document.createElement("tr");

    const tdDesc = document.createElement("td");
    tdDesc.className = "sticky desc-col";
    tdDesc.innerHTML = `
      <div class="desc-cell">
        <input class="desc-input" data-kind="${kind}" data-id="${row.id}" data-field="desc" value="${escapeHTML(row.desc)}" placeholder="Ex: Aluguel" />
        <button class="kill" type="button" data-kind="${kind}" data-id="${row.id}" title="Remover">×</button>
      </div>
    `;
    tr.appendChild(tdDesc);

    for (let d = 0; d < DAYS_IN_MONTH; d++) {
      const td = document.createElement("td");
      const v = clampNum(row.values[d]);
      td.innerHTML = `
        <input class="money" type="number" inputmode="decimal" min="0" step="0.01"
          data-kind="${kind}" data-id="${row.id}" data-field="v" data-day="${d}"
          value="${v}" />
      `;
      tr.appendChild(td);
    }

    const tdTotal = document.createElement("td");
    tdTotal.className = "row-total";
    tdTotal.dataset.totalFor = row.id;
    tdTotal.textContent = Math.round(row.values.reduce((a, v) => a + clampNum(v), 0)).toLocaleString("pt-BR");
    tr.appendChild(tdTotal);

    tbody.appendChild(tr);
  });
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// --- Autosave suave (sem salvar no meio da digitação) ---
let autosaveTimer = null;
let isTyping = false;

function autosaveSoon() {
  if (state.settings.autosave !== "on") return;
  if (isTyping) return;

  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    saveMonth();
    save();
  }, 450);
}

function bindTypingGuard() {
  document.addEventListener("focusin", (e) => {
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") {
      isTyping = true;
    }
  });

  document.addEventListener("focusout", (e) => {
    const tag = e.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") {
      isTyping = false;
      autosaveSoon();
    }
  });
}

// --- UI ---
function bindUI() {
  // drawer
  $("#btnBurger").addEventListener("click", toggleDrawer);
  $("#btnCloseDrawer").addEventListener("click", closeDrawer);
  $("#drawerOverlay").addEventListener("click", closeDrawer);

  document.querySelectorAll(".drawer-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const sel = btn.dataset.scroll;
      closeDrawer();
      if (sel) document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // month
  $("#month").addEventListener("change", (e) => {
    const m = e.target.value;
    state.month = m;

    const loaded = loadMonth(m);
    state.monthData = loaded ? loaded : defaultState().monthData;

    normalize(state);
    renderAll();

    // salva só o "mês atual" e settings (1 vez, não agressivo)
    save();
    toast("Mês carregado ✅");
  });

  // settings fields (agora sem salvar a cada tecla)
  const bindSetting = (id, key, parser = clampNum) => {
    $(id).addEventListener("input", (e) => {
      state.settings[key] = (parser === String) ? e.target.value : parser(e.target.value);
      renderTotalsOnly();
      autosaveSoon();
    });
  };

  bindSetting("#name", "name", String);
  bindSetting("#company", "company", String);
  bindSetting("#rangeText", "rangeText", String);
  bindSetting("#hourValue", "hourValue", clampNum);
  bindSetting("#overtimeMult", "overtimeMult", clampNum);

  $("#autosave").addEventListener("change", (e) => {
    state.settings.autosave = e.target.value;
    save();
    toast(`Auto-salvar: ${state.settings.autosave === "on" ? "ligado" : "desligado"}`);
  });

  bindSetting("#aNormal", "aNormal", clampNum);
  bindSetting("#aExtra", "aExtra", clampNum);
  bindSetting("#bNormal", "bNormal", clampNum);
  bindSetting("#bExtra", "bExtra", clampNum);

  // month data (sem salvar agressivo)
  const bindMonth = (id, key) => {
    $(id).addEventListener("input", (e) => {
      state.monthData[key] = clampNum(e.target.value);

      // atualiza o que precisa sem travar
      if (key === "savedJPY") {
        renderSavings();
      } else {
        renderTotalsOnly();
      }

      autosaveSoon();
    });
  };

  bindMonth("#daysA", "daysA");
  bindMonth("#daysB", "daysB");
  bindMonth("#bonusJPY", "bonusJPY");
  bindMonth("#sentJPY", "sentJPY");
  bindMonth("#savedJPY", "savedJPY");

  // matrix add
  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.add;
      addExpenseRow(kind);
    });
  });

  // matrix delegation
  $("#tbodyFixed").addEventListener("input", onMatrixInput);
  $("#tbodyVar").addEventListener("input", onMatrixInput);

  $("#tbodyFixed").addEventListener("click", onMatrixClick);
  $("#tbodyVar").addEventListener("click", onMatrixClick);

  // save / clear / pdf / fx
  $("#btnSave").addEventListener("click", () => {
    saveMonth();
    save();
    toast("Salvo ✅");
  });

  $("#btnClearMonth").addEventListener("click", clearMonth);

  $("#btnPDF").addEventListener("click", () => {
    window.print();
  });

  $("#btnRefreshFX").addEventListener("click", () => fetchFX(true));
}

function onMatrixClick(e) {
  const kill = e.target.closest(".kill");
  if (!kill) return;
  const kind = kill.dataset.kind;
  const id = kill.dataset.id;
  removeExpenseRow(kind, id);
}

function onMatrixInput(e) {
  const el = e.target;
  if (!el) return;

  const kind = el.dataset.kind;
  const id = el.dataset.id;
  const field = el.dataset.field;

  const rows = state.monthData.expenses[kind];
  const row = rows.find(r => r.id === id);
  if (!row) return;

  if (field === "desc") {
    row.desc = el.value;
    autosaveSoon();
    return;
  }

  if (field === "v") {
    const day = Number(el.dataset.day);
    row.values[day] = clampNum(el.value);

    const td = document.querySelector(`[data-total-for="${id}"]`);
    if (td) td.textContent = Math.round(row.values.reduce((a, v) => a + clampNum(v), 0)).toLocaleString("pt-BR");

    renderTotalsOnly();
    renderFootersOnly();
    autosaveSoon();
  }
}

function addExpenseRow(kind) {
  state.monthData.expenses[kind].push({
    id: uid(),
    desc: "",
    values: Array(DAYS_IN_MONTH).fill(0)
  });
  renderMatrices();
  autosaveSoon();
  toast("Item adicionado ✅");
}

function removeExpenseRow(kind, id) {
  state.monthData.expenses[kind] = state.monthData.expenses[kind].filter(r => r.id !== id);
  renderMatrices();
  renderTotalsOnly();
  autosaveSoon();
  toast("Item removido ✅");
}

// --- Rendering ---
function renderAll() {
  const current = new Date().toISOString().slice(0, 7);
  if (!state.month) state.month = current;

  $("#month").value = state.month;

  $("#name").value = state.settings.name || "";
  $("#company").value = state.settings.company || "";
  $("#rangeText").value = state.settings.rangeText || "";
  $("#hourValue").value = state.settings.hourValue || 0;
  $("#overtimeMult").value = state.settings.overtimeMult || 1.25;
  $("#autosave").value = state.settings.autosave || "on";

  $("#aNormal").value = state.settings.aNormal ?? 8;
  $("#aExtra").value = state.settings.aExtra ?? 3;
  $("#bNormal").value = state.settings.bNormal ?? 7;
  $("#bExtra").value = state.settings.bExtra ?? 4;

  $("#daysA").value = state.monthData.daysA ?? 0;
  $("#daysB").value = state.monthData.daysB ?? 0;
  $("#bonusJPY").value = state.monthData.bonusJPY ?? 0;

  $("#sentJPY").value = state.monthData.sentJPY ?? 0;
  $("#savedJPY").value = state.monthData.savedJPY ?? 0;

  renderMatrices();
  renderTotalsOnly();
  renderFX();
  renderSavings();
}

function renderMatrices() {
  buildMatrixThead("#theadFixed");
  buildMatrixThead("#theadVar");

  buildMatrixBody("#tbodyFixed", "fixed");
  buildMatrixBody("#tbodyVar", "variable");

  renderFootersOnly();
}

function renderFootersOnly() {
  buildMatrixTfoot("#tfootFixed", "fixed");
  buildMatrixTfoot("#tfootVar", "variable");
}

function renderTotalsOnly() {
  const t = calcTotals();

  $("#incomeJPY").textContent = formatJPY(t.income);
  $("#expensesJPY").textContent = formatJPY(t.expenses);
  $("#balanceJPY").textContent = formatJPY(t.balance);

  const dayA = calcTurnValuePerDay("A");
  const dayB = calcTurnValuePerDay("B");
  $("#incomeFormula").textContent =
    `Fórmula: A(${state.monthData.daysA}×${Math.round(dayA)}) + B(${state.monthData.daysB}×${Math.round(dayB)}) + bônus(${Math.round(state.monthData.bonusJPY)})`;

  $("#totalFixed").textContent = formatJPY(t.fixed);
  $("#totalVar").textContent = formatJPY(t.vari);

  $("#kpiIncome").textContent = formatJPY(t.income);
  $("#kpiExpenses").textContent = formatJPY(t.expenses);
  $("#kpiBalance").textContent = formatJPY(t.balance);
  $("#kpiDiff").textContent = formatJPY(t.diff);
}

function renderSavings() {
  const jpy = clampNum(state.monthData.savedJPY);
  const brlRate = state.fx?.brl;
  const usdRate = state.fx?.usd;

  const brl = brlRate ? jpy * brlRate : 0;
  const usd = usdRate ? jpy * usdRate : 0;

  $("#savedBRL").textContent = brlRate ? formatMoney(brl, "BRL") : "—";
  $("#savedUSD").textContent = usdRate ? formatMoney(usd, "USD") : "—";
}

// --- Drawer ---
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

// --- Init ---
function init() {
  const current = new Date().toISOString().slice(0, 7);
  state.month = state.month || current;

  const loaded = loadMonth(state.month);
  if (loaded) state.monthData = loaded;

  normalize(state);

  bindTypingGuard();
  bindUI();

  renderAll();
  fetchFX(false);
  save();
}

init();
