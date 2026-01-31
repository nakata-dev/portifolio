const LS_KEY = "finpalma_mvp_v1";

const WHATSAPP_MESSAGE =
  "Olá, gostei do seu sistema e já uso ele a algum tempo, gostaria de saber quanto fica para acrescentar mais funcionalidades e tornar um sistema totalmente meu e que atenda as minhas necessidades?";

const FX_API = "https://api.frankfurter.dev/v1";

let state = {
  settings: {
    name: "",
    theme: "light",
    displayMode: "BOTH",
    defaultCurrency: "BRL",
    whatsappNumber: ""
  },
  goals: {
    monthly: 0,
    yearly: 0,
    yearsTarget: 0,
    yearsCount: 5,
    monthlySavingHint: 0
  },
  salary: {
    kind: "CLT",
    name: "",
    company: "",
    currency: "BRL",
    gross: 0,
    fixed: 0,
    fx: { base: "BRL", rate: 1, date: null, source: "none" }
  },
  transactions: [],
  fxCache: {},
  categoryCounts: {}
};

const FALLBACK_CURRENCIES = [
  "BRL","USD","EUR","GBP","JPY","CAD","AUD","CHF","MXN","ARS","CLP","COP","PEN","UYU","CNY","KRW","INR"
];

const $ = (sel) => document.querySelector(sel);

const asNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const fmt = (val, currency) => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(val || 0);
  } catch {
    return `${(val || 0).toFixed(2)} ${currency}`;
  }
};

function showToast(title, msg, ms = 3200) {
  $("#toastTitle").textContent = title;
  $("#toastMsg").textContent = msg;
  $("#toast").classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => $("#toast").classList.remove("show"), ms);
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ------------------ Persistência ------------------ */
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    state = {
      ...state,
      ...parsed,
      settings: { ...state.settings, ...(parsed.settings || {}) },
      goals: { ...state.goals, ...(parsed.goals || {}) },
      salary: { ...state.salary, ...(parsed.salary || {}) },
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      fxCache: parsed.fxCache || {},
      categoryCounts: parsed.categoryCounts || {}
    };

    state.salary.fx = { ...{ base:"BRL", rate:1, date:null, source:"none" }, ...(state.salary.fx || {}) };
    if (!state.salary.currency) state.salary.currency = "BRL";
  } catch (e) {
    console.warn("Falha ao carregar estado:", e);
  }
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/* ------------------ Tema ------------------ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  state.settings.theme = theme;
  save();
}

/* ------------------ Drawer ------------------ */
function openDrawer() {
  $("#overlay").classList.add("show");
  $("#drawer").classList.add("show");
  $("#overlay").setAttribute("aria-hidden", "false");
}
function closeDrawer() {
  $("#overlay").classList.remove("show");
  $("#drawer").classList.remove("show");
  $("#overlay").setAttribute("aria-hidden", "true");
}

/* ------------------ Moedas ------------------ */
async function loadCurrencies() {
  let codes = [...FALLBACK_CURRENCIES];

  try {
    const resp = await fetch(`${FX_API}/currencies`, { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      codes = Object.keys(data).sort();
    }
  } catch {}

  const selTx = $("#txCurrency");
  const selDef = $("#setDefaultCurrency");
  const selSal = $("#salCurrency");

  selTx.innerHTML = "";
  selDef.innerHTML = "";
  selSal.innerHTML = "";

  codes.forEach((code) => {
    const o1 = document.createElement("option");
    o1.value = code; o1.textContent = code;
    selTx.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = code; o2.textContent = code;
    selDef.appendChild(o2);

    const o3 = document.createElement("option");
    o3.value = code; o3.textContent = code;
    selSal.appendChild(o3);
  });

  selDef.value = state.settings.defaultCurrency || "BRL";
  selTx.value = state.settings.defaultCurrency || "BRL";
  selSal.value = state.salary.currency || "BRL";
}

/* ------------------ FX ------------------ */
function fxKey(from, to, dateStr) {
  return `${from}->${to}|${dateStr || "latest"}`;
}

async function fetchFxRate(from, to, dateStr) {
  const key = fxKey(from, to, dateStr);
  const cached = state.fxCache[key];
  const now = Date.now();
  const TTL = 12 * 60 * 60 * 1000;

  if (cached && (now - cached.ts) < TTL) return cached.rate;

  const path = dateStr ? `/${dateStr}` : `/latest`;
  const url = `${FX_API}${path}?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`;

  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error("Falha ao obter taxa");
  const data = await resp.json();

  const rate = data?.rates?.[to];
  if (!rate) throw new Error("Taxa indisponível");

  state.fxCache[key] = { rate, ts: now };
  save();
  return rate;
}

/* ------------------ UX: Tipo + Moeda ------------------ */
function updateTxTypeUI() {
  const type = $("#txType").value;

  if (type === "income") {
    $("#txCategory").placeholder = "Ex.: Salário, Cliente, Venda, Dividendos";
    $("#txDescLabel").textContent = "Origem / Detalhes";
    $("#txDesc").placeholder = "Ex.: Salário (Empresa X) ou Cliente (Fulano)";
  } else {
    $("#txCategory").placeholder = "Ex.: Alimentação, Transporte, Casa";
    $("#txDescLabel").textContent = "Descrição";
    $("#txDesc").placeholder = "Ex.: Mercado, Restaurante, Metrô";
  }
}

function updateTxCurrencyUI() {
  const cur = $("#txCurrency").value || "BRL";

  $("#txAmountLabel").textContent = `Valor (${cur})`;
  $("#txAmount").placeholder = cur === "BRL" ? "Ex.: 45.90" : `Ex.: 1200 (${cur})`;

  $("#txCurrencyHint").textContent =
    cur === "BRL"
      ? "Moeda atual do lançamento: BRL (sem conversão)"
      : `Moeda atual do lançamento: ${cur} (será convertido para BRL)`;

  if (cur === "BRL") {
    $("#txRateLabel").textContent = "Taxa (BRL não precisa) | opcional";
    $("#txRate").value = "";
    $("#txRate").placeholder = "—";
  } else {
    $("#txRateLabel").textContent = `Taxa (1 ${cur} = ? BRL)`;
    $("#txRate").placeholder = "Ex.: 0.035";

    const key = fxKey(cur, "BRL", null);
    const cached = state.fxCache[key];
    if (cached && !asNum($("#txRate").value)) {
      $("#txRate").value = Number(cached.rate).toFixed(6);
    }
  }
}

async function fillRateFromApi() {
  const cur = $("#txCurrency").value;
  const date = $("#txDate").value;

  if (!cur || cur === "BRL") {
    $("#txRate").value = "";
    showToast("Taxa", "BRL não precisa de taxa.");
    return;
  }

  try {
    const rate = await fetchFxRate(cur, "BRL", date || null);
    $("#txRate").value = Number(rate).toFixed(6);
    showToast("Taxa encontrada", `1 ${cur} ≈ ${Number(rate).toFixed(4)} BRL`);
  } catch {
    showToast("Não consegui buscar a taxa", "Você pode informar a taxa manualmente.");
  }
}

/* ------------------ Categorias: autocomplete ------------------ */
function bumpCategory(cat) {
  if (!cat) return;
  state.categoryCounts[cat] = (state.categoryCounts[cat] || 0) + 1;
}

function rebuildCategoryCountsFromHistory() {
  const counts = {};
  for (const t of state.transactions) {
    const c = (t.category || "").trim();
    if (!c) continue;
    counts[c] = (counts[c] || 0) + 1;
  }
  state.categoryCounts = counts;
  save();
}

function renderCategoryDatalist() {
  const dl = $("#catList");
  if (!dl) return;
  dl.innerHTML = "";

  const entries = Object.entries(state.categoryCounts || {})
    .sort((a,b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 14);

  const fallback = ["Alimentação","Transporte","Casa","Saúde","Lazer","Educação","Assinaturas","Salário","Cliente","Venda"];

  const set = new Set();
  entries.forEach(([k]) => set.add(k));
  fallback.forEach((k) => set.add(k));

  Array.from(set).slice(0, 18).forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    dl.appendChild(opt);
  });
}

/* ------------------ Utilitários de mês ------------------ */
function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}

function getReportMonth() {
  const m = ($("#filterMonth").value || "").trim();
  if (m) return m;
  return new Date().toISOString().slice(0,7);
}

function monthLabel(yyyyMm) {
  const [y, m] = yyyyMm.split("-");
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const mi = Math.max(1, Math.min(12, Number(m || 1))) - 1;
  return `${months[mi]}/${y}`;
}

/* ------------------ Totais ------------------ */
function getFilteredTransactions() {
  const m = $("#filterMonth").value;
  if (!m) return state.transactions;
  return state.transactions.filter((t) => monthKey(t.date) === m);
}

function computeTotals(txs) {
  let incomeBRL = 0, expenseBRL = 0;
  for (const t of txs) {
    const v = t.amountBRL || 0;
    if (t.type === "income") incomeBRL += v;
    else expenseBRL += v;
  }
  return { incomeBRL, expenseBRL, saved: incomeBRL - expenseBRL };
}

/* ------------------ Score de saúde financeira ------------------ */
/*
  Objetivo: um número simples (0–100) que seja intuitivo.
  Componentes:
  - Taxa de economia do mês: saved/income (0..1) => até 60 pontos
  - Ritmo vs meta anual: saved / (metaAnual/12) (0..1+) => até 40 pontos
  Se não existir meta anual, o score vira "savings rate" com peso total (100).
*/
function computeHealthScoreForMonth(yyyyMm) {
  const txsMonth = state.transactions.filter(t => monthKey(t.date) === yyyyMm);
  const totals = computeTotals(txsMonth);

  const income = totals.incomeBRL;
  const saved = totals.saved;

  if (income <= 0 && totals.expenseBRL <= 0) {
    return {
      score: null,
      label: "Sem dados",
      level: "none",
      dot: "neutral",
      tip: "Adicione lançamentos (receitas e gastos) para calcular sua saúde financeira."
    };
  }

  if (income <= 0 && totals.expenseBRL > 0) {
    return {
      score: 0,
      label: "Crítico",
      level: "critical",
      dot: "bad",
      tip: "Você teve gastos, mas nenhuma receita no mês. Registre a receita (ex.: salário) para ter um retrato real."
    };
  }

  const savingsRate = clamp(saved / income, 0, 1); // negativo vira 0
  const base = Math.round(savingsRate * 60);

  const yearlyTarget = asNum(state.goals?.yearly || 0);
  const requiredPerMonth = yearlyTarget > 0 ? (yearlyTarget / 12) : 0;

  let goalPts = 0;
  if (requiredPerMonth > 0) {
    const ratio = clamp(saved / requiredPerMonth, 0, 1); // bateu a meta -> 1
    goalPts = Math.round(ratio * 40);
  } else {
    // sem meta anual: usar só savingsRate como score total
    return deriveHealthMeta({
      score: Math.round(savingsRate * 100),
      savingsRate,
      hasGoal: false,
      requiredPerMonth: 0,
      saved,
      income
    });
  }

  const score = clamp(base + goalPts, 0, 100);

  return deriveHealthMeta({
    score,
    savingsRate,
    hasGoal: true,
    requiredPerMonth,
    saved,
    income
  });
}

function deriveHealthMeta({ score, savingsRate, hasGoal, requiredPerMonth, saved, income }) {
  let label = "Atenção";
  let level = "warn";
  let dot = "warn";
  let tip = "Ajuste gastos ou aumente receita para melhorar seu ritmo.";

  if (score >= 85) {
    label = "Ótimo";
    level = "great";
    dot = "ok";
    tip = "Seu mês está bem alinhado. Mantenha consistência e evite picos de gastos desnecessários.";
  } else if (score >= 70) {
    label = "Bom";
    level = "good";
    dot = "ok";
    tip = "Bom ritmo. Se quiser turbinar, defina um teto por categoria e revise assinaturas.";
  } else if (score >= 45) {
    label = "Atenção";
    level = "warn";
    dot = "warn";
    tip = "Você está no meio do caminho. Tente aumentar a taxa de economia e cortar vazamentos pequenos.";
  } else {
    label = "Crítico";
    level = "critical";
    dot = "bad";
    tip = "Risco de não bater metas. Priorize reduzir gastos variáveis e registrar receitas corretamente.";
  }

  // Dicas mais específicas (curtas)
  if (income > 0 && saved < 0) {
    tip = "Você gastou mais do que recebeu. Ajuste o mês (cortes) ou aumente a entrada (receitas).";
  } else if (income > 0 && savingsRate < 0.10) {
    tip = "Sua economia está baixa (menos de 10%). Se possível, estabeleça um mínimo fixo para economizar.";
  }

  if (hasGoal && requiredPerMonth > 0) {
    const ratio = saved / requiredPerMonth;
    if (ratio < 1) {
      const falta = Math.max(0, requiredPerMonth - saved);
      tip = `Para bater sua meta anual, faltou economizar cerca de ${fmt(falta, "BRL")} neste mês.`;
    } else {
      tip = "Você atingiu (ou superou) o necessário do mês para a meta anual. Excelente consistência.";
    }
  }

  return { score, label, level, dot, tip };
}

function renderHealthScore() {
  const m = getReportMonth();
  const h = computeHealthScoreForMonth(m);

  const scoreEl = $("#healthScore");
  const labelEl = $("#healthLabel");
  const dotEl = document.querySelector("#healthPill .score-dot");
  const tipEl = $("#healthTip");

  if (!scoreEl || !labelEl || !dotEl || !tipEl) return;

  if (h.score === null) {
    labelEl.textContent = `Saúde: ${h.label}`;
    scoreEl.textContent = "—";
    dotEl.style.background = "rgba(44,62,80,0.35)";
    tipEl.textContent = h.tip;
    return;
  }

  labelEl.textContent = `Saúde: ${h.label}`;
  scoreEl.textContent = `${h.score}/100`;

  // Cor do dot sem “inventar” paleta nova: usa ok/danger e intermediário com marinho
  if (h.dot === "ok") dotEl.style.background = "rgba(36,122,67,0.85)";
  else if (h.dot === "bad") dotEl.style.background = "rgba(179,58,58,0.80)";
  else dotEl.style.background = "rgba(44,62,80,0.55)";

  tipEl.textContent = h.tip;
}

/* ------------------ Transações ------------------ */
function clearTxFormSoft() {
  $("#txAmount").value = "";
  $("#txDesc").value = "";
  if ($("#txCurrency").value === "BRL") $("#txRate").value = "";
}

function addTransaction() {
  const type = $("#txType").value;
  const date = $("#txDate").value || new Date().toISOString().slice(0, 10);

  const categoryRaw = ($("#txCategory").value || "").trim();
  const category = categoryRaw || (type === "income" ? "Receita" : "Geral");

  const descRaw = ($("#txDesc").value || "").trim();
  const desc =
    descRaw ||
    (type === "income"
      ? "Receita (origem não informada)"
      : "Gasto (descrição não informada)");

  const amount = asNum($("#txAmount").value);
  const currency = $("#txCurrency").value || state.settings.defaultCurrency || "BRL";

  if (amount <= 0) {
    showToast("Valor inválido", "Informe um valor maior que zero.");
    return;
  }

  let rate = 1;
  const rateInput = asNum($("#txRate").value);

  if (currency !== "BRL") {
    if (rateInput > 0) rate = rateInput;
    else {
      showToast("Falta a taxa", "Clique em 'Buscar taxa' ou informe a taxa manualmente.");
      return;
    }
  }

  const amountBRL = currency === "BRL" ? amount : (amount * rate);

  const tx = {
    id: uid(),
    type,
    date,
    category,
    desc,
    amount,
    currency,
    fx: {
      base: "BRL",
      rate: currency === "BRL" ? 1 : rate,
      date,
      source: currency === "BRL" ? "none" : "manual_or_cached"
    },
    amountBRL
  };

  state.transactions.unshift(tx);
  bumpCategory(category);
  save();

  renderAll();
  clearTxFormSoft();

  showToast(
    type === "income" ? "Receita adicionada" : "Gasto adicionado",
    currency === "BRL"
      ? `${desc} • ${fmt(amount, "BRL")}`
      : `${desc} • ${fmt(amount, currency)} (~${fmt(amountBRL, "BRL")})`
  );
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  save();
  renderAll();
  showToast("Excluído", "Lançamento removido.");
}

function renderTransactions() {
  const list = $("#txList");
  const txs = getFilteredTransactions();
  const totals = computeTotals(txs);

  $("#totalsPill").textContent =
    `Receitas ${fmt(totals.incomeBRL, "BRL")} • Gastos ${fmt(totals.expenseBRL, "BRL")} • Economia ${fmt(totals.saved, "BRL")}`;

  if (txs.length === 0) {
    list.innerHTML = `
      <div class="item">
        <p class="item-title" style="margin:0;">Nada por aqui ainda.</p>
        <div class="item-meta">Adicione um lançamento acima para começar.</div>
      </div>`;
    return;
  }

  const mode = state.settings.displayMode;
  list.innerHTML = "";

  txs.slice(0, 18).forEach((t) => {
    const isIncome = t.type === "income";
    const sign = isIncome ? "+" : "-";

    const originalStr = fmt(t.amount, t.currency);
    const brlStr = fmt(t.amountBRL, "BRL");

    let amtLine = "";
    if (mode === "BRL") amtLine = `${sign} ${brlStr}`;
    else if (mode === "ORIGINAL") amtLine = `${sign} ${originalStr}`;
    else amtLine = `${sign} ${originalStr}  •  ~${brlStr}`;

    const badgeClass = isIncome ? "ok" : "bad";
    const badgeText = isIncome ? "entrada" : "saída";

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item-top">
        <div>
          <p class="item-title">${t.desc}</p>
          <div class="item-meta">${t.date} • ${t.category} • ${isIncome ? "Receita" : "Gasto"}</div>
        </div>
        <div class="item-amt">
          <div style="font-weight:800; font-size:13px;">${amtLine}</div>
          <div class="tag ${badgeClass}">${badgeText}</div>
        </div>
      </div>

      <details>
        <summary>Detalhes</summary>
        <div class="item-meta" style="margin-top:8px;">
          Moeda: <strong>${t.currency}</strong> • Base: <strong>BRL</strong><br/>
          Taxa usada: <strong>${Number(t.fx?.rate || 1).toFixed(6)}</strong> (data: ${t.fx?.date || t.date})<br/>
          Convertido (BRL): <strong>${brlStr}</strong>
        </div>

        <div class="row" style="margin-top:10px; justify-content:flex-end;">
          <button class="btn danger" data-del="${t.id}">Excluir</button>
        </div>
      </details>
    `;

    el.querySelector("[data-del]")?.addEventListener("click", () => deleteTransaction(t.id));
    list.appendChild(el);
  });

  if (txs.length > 18) {
    const more = document.createElement("div");
    more.className = "pill";
    more.textContent = `Mostrando 18 de ${txs.length}. Use o filtro de mês para navegar sem rolar demais.`;
    list.appendChild(more);
  }
}

/* ------------------ Metas ------------------ */
function saveGoals() {
  state.goals.monthly = asNum($("#goalMonthly").value);
  state.goals.yearly = asNum($("#goalYearly").value);
  state.goals.yearsTarget = asNum($("#goalYears").value);
  state.goals.yearsCount = Math.max(1, Math.floor(asNum($("#yearsCount").value) || 1));
  state.goals.monthlySavingHint = asNum($("#monthlySavingHint").value);
  save();

  renderGoals();
  renderProgress();
  renderHealthScore();
  showToast("Metas salvas", "Projeções atualizadas.");
}

function renderGoals() {
  const g = state.goals;
  const mSave = g.monthlySavingHint;

  const needYear = g.yearly > 0 ? (g.yearly / 12) : 0;
  const needYears = (g.yearsTarget > 0 && g.yearsCount > 0) ? (g.yearsTarget / (12 * g.yearsCount)) : 0;

  $("#needYear").textContent = needYear ? fmt(needYear, "BRL") : "—";
  $("#needYears").textContent = needYears ? fmt(needYears, "BRL") : "—";

  const projYear = mSave > 0 ? (mSave * 12) : 0;
  const projYears = (mSave > 0 && g.yearsCount > 0) ? (mSave * 12 * g.yearsCount) : 0;

  $("#projYear").textContent = projYear ? fmt(projYear, "BRL") : "—";
  $("#projYears").textContent = projYears ? fmt(projYears, "BRL") : "—";

  let status = "Preencha para ver projeções ✨";
  if (g.yearly > 0 && mSave > 0) {
    status = mSave >= needYear
      ? "Você está no ritmo para a meta de 1 ano ✅"
      : "Ritmo abaixo da meta de 1 ano ⚠️";
  }
  $("#goalsStatus").textContent = status;
}

/* ------------------ Auto (média gastos 3m) ------------------ */
function computeMonthlyExpensesMapBRL() {
  const map = new Map();
  for (const t of state.transactions) {
    if (t.type !== "expense") continue;
    const m = monthKey(t.date);
    map.set(m, (map.get(m) || 0) + (t.amountBRL || 0));
  }
  return map;
}

function computeAvgVariableExpensesLastNMonthsBRL(n = 3) {
  const expMap = computeMonthlyExpensesMapBRL();
  const months = Array.from(expMap.keys()).sort();
  if (months.length === 0) return { avg: 0, usedMonths: [] };

  const usedMonths = months.slice(-n);
  const sum = usedMonths.reduce((acc, m) => acc + (expMap.get(m) || 0), 0);
  return { avg: sum / usedMonths.length, usedMonths };
}

/* ------------------ Salário ------------------ */
function computeSalaryNetFromInputs() {
  const cur = $("#salCurrency").value || "BRL";
  const gross = asNum($("#salGross").value);
  const fixed = asNum($("#salFixed").value);
  const net = Math.max(0, gross - fixed);

  const rateInput = asNum($("#salRate").value);
  const rate = (cur === "BRL") ? 1 : (rateInput > 0 ? rateInput : 0);
  const netBRL = (cur === "BRL") ? net : (rate > 0 ? net * rate : 0);

  return { cur, gross, fixed, net, rate, netBRL };
}

function updateSalaryRateLabel() {
  const cur = $("#salCurrency").value || "BRL";
  $("#salRateLabel").textContent = cur === "BRL"
    ? "Taxa (BRL não precisa) | opcional"
    : `Taxa (1 ${cur} = ? BRL)`;
  $("#salRate").placeholder = cur === "BRL" ? "—" : "Ex.: 0.035";
}

function updateSalaryPreview() {
  updateSalaryRateLabel();

  const { cur, net, rate, netBRL } = computeSalaryNetFromInputs();
  $("#salNet").textContent = fmt(net, cur);

  if (cur === "BRL") $("#salNetBRL").textContent = fmt(net, "BRL");
  else $("#salNetBRL").textContent = (rate > 0 ? fmt(netBRL, "BRL") : "—");

  const { avg, usedMonths } = computeAvgVariableExpensesLastNMonthsBRL(3);
  $("#avgVar3m").textContent = avg > 0 ? fmt(avg, "BRL") : "—";

  const baseNet = (cur === "BRL") ? net : netBRL;
  const canCompute = baseNet > 0 && (cur === "BRL" || rate > 0);
  if (!canCompute) {
    $("#suggestSaving").textContent = "—";
    return;
  }

  const suggested = Math.max(0, baseNet - avg);
  $("#suggestSaving").textContent = fmt(suggested, "BRL");

  if (usedMonths.length === 0) $("#salHint").textContent = "Registre gastos para o Auto sugerir com base real.";
  else if (usedMonths.length < 3) $("#salHint").textContent = `Auto usando ${usedMonths.length} mês(es) com dados.`;
  else $("#salHint").textContent = "Auto pronto: líquido − média de gastos.";
}

async function fillSalaryRateFromApi() {
  const cur = $("#salCurrency").value;
  if (!cur || cur === "BRL") {
    $("#salRate").value = "";
    showToast("Taxa", "BRL não precisa de taxa.");
    return;
  }

  try {
    const rate = await fetchFxRate(cur, "BRL", null);
    $("#salRate").value = Number(rate).toFixed(6);
    showToast("Taxa encontrada", `1 ${cur} ≈ ${Number(rate).toFixed(4)} BRL`);
    updateSalaryPreview();
  } catch {
    showToast("Não consegui buscar a taxa", "Você pode informar a taxa manualmente.");
  }
}

function saveSalary() {
  const kind = $("#salType").value;
  const name = ($("#salName").value || "").trim();
  const company = ($("#salCompany").value || "").trim();

  const { cur, gross, fixed, net, rate } = computeSalaryNetFromInputs();

  if (gross <= 0) {
    showToast("Salário", "Informe um valor bruto maior que zero.");
    return;
  }
  if (cur !== "BRL" && rate <= 0) {
    showToast("Falta a taxa", "Para moeda estrangeira, busque ou informe a taxa antes de salvar.");
    return;
  }

  state.salary = {
    kind,
    name,
    company,
    currency: cur,
    gross,
    fixed,
    fx: {
      base: "BRL",
      rate: cur === "BRL" ? 1 : rate,
      date: new Date().toISOString().slice(0, 10),
      source: cur === "BRL" ? "none" : "manual_or_cached"
    }
  };

  save();
  renderSalary();
  renderProgress();
  renderHealthScore();
  showToast("Salário salvo", `Líquido: ${fmt(net, cur)} (${fmt(cur==="BRL"?net:net*rate, "BRL")})`);
}

function renderSalary() {
  $("#salType").value = state.salary.kind || "CLT";
  $("#salName").value = state.salary.name || "";
  $("#salCompany").value = state.salary.company || "";
  $("#salCurrency").value = state.salary.currency || "BRL";
  $("#salGross").value = state.salary.gross || "";
  $("#salFixed").value = state.salary.fixed || "";

  if ((state.salary.currency || "BRL") !== "BRL") {
    const r = asNum(state.salary.fx?.rate || 0);
    $("#salRate").value = r > 0 ? r.toFixed(6) : "";
  } else {
    $("#salRate").value = "";
  }

  updateSalaryPreview();
}

function useNetAsSavingHint() {
  const { cur, net, netBRL } = computeSalaryNetFromInputs();
  const val = (cur === "BRL") ? net : netBRL;

  if (val <= 0) {
    showToast("Não dá ainda", "Complete o salário (e taxa, se for moeda estrangeira).");
    return;
  }

  $("#monthlySavingHint").value = val.toFixed(2);
  state.goals.monthlySavingHint = asNum($("#monthlySavingHint").value);
  save();
  renderGoals();
  renderProgress();
  renderHealthScore();
  showToast("Aplicado", "Usei seu líquido como economia mensal (BRL).");
}

function autoSavingHint() {
  const { cur, net, rate, netBRL } = computeSalaryNetFromInputs();
  const baseNet = (cur === "BRL") ? net : netBRL;

  if (baseNet <= 0) {
    showToast("Auto", "Preencha seu salário (líquido) para eu calcular.");
    return;
  }
  if (cur !== "BRL" && rate <= 0) {
    showToast("Auto", "Defina a taxa para converter o salário para BRL.");
    return;
  }

  const { avg, usedMonths } = computeAvgVariableExpensesLastNMonthsBRL(3);
  const suggested = Math.max(0, baseNet - avg);

  $("#monthlySavingHint").value = suggested.toFixed(2);
  state.goals.monthlySavingHint = asNum($("#monthlySavingHint").value);
  save();

  renderGoals();
  renderProgress();
  renderHealthScore();

  showToast(
    "Auto aplicado",
    `Líquido ${fmt(baseNet, "BRL")} − Média gastos ${fmt(avg, "BRL")} = ${fmt(suggested, "BRL")} (usando ${usedMonths.length || 0} mês(es))`
  );
}

function postSalaryThisMonth() {
  const s = state.salary;
  const cur = s.currency || "BRL";
  const gross = asNum(s.gross);
  const fixed = asNum(s.fixed);
  const net = Math.max(0, gross - fixed);

  if (gross <= 0) {
    showToast("Salário", "Salve seu salário antes de lançar como receita.");
    scrollToId("sec-goals");
    return;
  }

  const rate = cur === "BRL" ? 1 : asNum(s.fx?.rate || 0);
  if (cur !== "BRL" && rate <= 0) {
    showToast("Salário", "Defina e salve a taxa do salário (para moeda estrangeira).");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const company = (s.company || "").trim();
  const who = company ? ` (${company})` : "";
  const desc = `Salário${who}`;

  const amount = net;
  const amountBRL = cur === "BRL" ? amount : (amount * rate);

  const tx = {
    id: uid(),
    type: "income",
    date: today,
    category: "Salário",
    desc,
    amount,
    currency: cur,
    fx: { base: "BRL", rate: cur === "BRL" ? 1 : rate, date: today, source: "salary" },
    amountBRL
  };

  state.transactions.unshift(tx);
  bumpCategory("Salário");
  save();
  renderAll();

  showToast("Salário lançado", `${fmt(amount, cur)} (~${fmt(amountBRL, "BRL")})`);
}

/* --------- Radar do mês --------- */
function computeRadarThisMonth() {
  const now = new Date();
  const m = now.toISOString().slice(0, 7);

  let exp = 0;
  for (const t of state.transactions) {
    if (t.type !== "expense") continue;
    if (monthKey(t.date) !== m) continue;
    exp += (t.amountBRL || 0);
  }

  const s = state.salary;
  const cur = s.currency || "BRL";
  const gross = asNum(s.gross);
  const fixed = asNum(s.fixed);
  const net = Math.max(0, gross - fixed);
  const rate = cur === "BRL" ? 1 : asNum(s.fx?.rate || 0);
  const netBRL = cur === "BRL" ? net : (rate > 0 ? net * rate : 0);

  if (netBRL <= 0) {
    return { text: "Radar do mês: salve seu salário para ver % do líquido." };
  }

  const pct = Math.min(999, (exp / netBRL) * 100);
  const text = `Radar do mês: ${fmt(exp, "BRL")} em gastos (≈ ${pct.toFixed(0)}% do seu líquido)`;
  return { text };
}

function renderRadar() {
  const el = $("#monthRadar");
  if (!el) return;
  const r = computeRadarThisMonth();
  el.textContent = r.text;
}

/* ------------------ Progresso ------------------ */
function computeMonthlySavingsSeries(year) {
  const series = Array(12).fill(0);
  for (const t of state.transactions) {
    const d = new Date(t.date + "T00:00:00");
    if (d.getFullYear() !== year) continue;
    const idx = d.getMonth();
    const v = t.amountBRL || 0;
    series[idx] += (t.type === "income" ? v : -v);
  }
  return series;
}

function renderProgress() {
  const g = state.goals;
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth();

  const monthlySeries = computeMonthlySavingsSeries(year);
  const hasAny = monthlySeries.some((v) => Math.abs(v) > 0.0001);
  const effectiveSeries = hasAny ? monthlySeries : Array(12).fill(asNum(g.monthlySavingHint || 0));

  const yearlyTarget = asNum(g.yearly || 0);
  const requiredPerMonth = yearlyTarget > 0 ? (yearlyTarget / 12) : 0;

  let actualCum = 0;
  for (let i = 0; i <= monthIdx; i++) actualCum += effectiveSeries[i];
  const requiredCum = requiredPerMonth * (monthIdx + 1);

  if (yearlyTarget > 0) {
    $("#progressSummary").textContent =
      `Meta 1 ano: ${fmt(yearlyTarget, "BRL")} • Necessário/mês: ${fmt(requiredPerMonth, "BRL")} • Até agora: ${fmt(actualCum, "BRL")}`;
  } else {
    $("#progressSummary").textContent = "Defina a meta de 1 ano para receber alertas automáticos.";
  }

  let alertText = "—";
  if (yearlyTarget > 0) {
    if (actualCum < requiredCum) {
      alertText = `Você economizou menos do que o necessário para cumprir sua meta de 1 ano. (Faltou ~${fmt(requiredCum - actualCum, "BRL")} até este mês)`;
    } else {
      alertText = `Ritmo OK para a meta de 1 ano ✅ (Margem ~${fmt(actualCum - requiredCum, "BRL")})`;
    }
  }
  $("#progressAlert").textContent = alertText;

  drawChart(effectiveSeries, requiredPerMonth, monthIdx);
}

function drawChart(series, requiredPerMonth, monthIdx) {
  const canvas = $("#chart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(44,62,80,0.12)";
  ctx.lineWidth = 1;

  const pad = 28;
  const gx0 = pad, gy0 = pad, gx1 = w - pad, gy1 = h - pad;
  const gw = gx1 - gx0, gh = gy1 - gy0;

  for (let i = 0; i <= 4; i++) {
    const y = gy0 + (gh / 4) * i;
    ctx.beginPath();
    ctx.moveTo(gx0, y);
    ctx.lineTo(gx1, y);
    ctx.stroke();
  }

  const maxAbs = Math.max(1, ...series.map(v => Math.abs(v)), Math.abs(requiredPerMonth));
  const maxY = maxAbs * 1.35;

  const yOf = (val) => {
    const mid = gy0 + gh / 2;
    return mid - (val / maxY) * (gh / 2);
  };

  ctx.strokeStyle = "rgba(44,62,80,0.22)";
  ctx.beginPath();
  ctx.moveTo(gx0, yOf(0));
  ctx.lineTo(gx1, yOf(0));
  ctx.stroke();

  const barW = gw / 12;
  for (let i = 0; i < 12; i++) {
    const x = gx0 + i * barW + barW * 0.18;
    const bw = barW * 0.64;
    const v = series[i];
    const y0 = yOf(0);
    const yv = yOf(v);
    const top = Math.min(y0, yv);
    const height = Math.abs(y0 - yv);

    const fill = v >= 0 ? "rgba(146,168,209,0.75)" : "rgba(179,58,58,0.45)";
    ctx.fillStyle = fill;
    ctx.fillRect(x, top, bw, Math.max(2, height));

    if (i === monthIdx) {
      ctx.strokeStyle = "rgba(44,62,80,0.35)";
      ctx.strokeRect(x - 2, gy0, bw + 4, gh);
    }
  }

  if (requiredPerMonth > 0) {
    ctx.strokeStyle = "rgba(44,62,80,0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const yReq = yOf(requiredPerMonth);
    ctx.moveTo(gx0, yReq);
    ctx.lineTo(gx1, yReq);
    ctx.stroke();

    ctx.fillStyle = "rgba(44,62,80,0.75)";
    ctx.font = "12px system-ui";
    ctx.fillText("necessário/mês", gx0 + 6, yReq - 6);
  }
}

/* ------------------ PDF mensal (Imprimir -> Salvar como PDF) ------------------ */
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function groupTotalsByCategoryBRL(txs) {
  const map = new Map();
  for (const t of txs) {
    const cat = (t.category || "Geral").trim() || "Geral";
    const cur = map.get(cat) || { income: 0, expense: 0 };
    if (t.type === "income") cur.income += (t.amountBRL || 0);
    else cur.expense += (t.amountBRL || 0);
    map.set(cat, cur);
  }
  const arr = Array.from(map.entries()).map(([cat, v]) => ({
    cat,
    income: v.income,
    expense: v.expense,
    net: v.income - v.expense
  }));
  arr.sort((a,b) => (b.expense - a.expense) || (b.income - a.income));
  return arr;
}

function buildMonthlyReportHtml(yyyyMm) {
  const txs = state.transactions
    .filter(t => monthKey(t.date) === yyyyMm)
    .slice()
    .sort((a,b) => (a.date || "").localeCompare(b.date || ""));

  const totals = computeTotals(txs);
  const createdAt = new Date().toLocaleString("pt-BR");

  // Score do relatório (mesma lógica da UI)
  const health = computeHealthScoreForMonth(yyyyMm);

  const s = state.salary || {};
  const salCur = s.currency || "BRL";
  const salGross = asNum(s.gross);
  const salFixed = asNum(s.fixed);
  const salNet = Math.max(0, salGross - salFixed);
  const salRate = salCur === "BRL" ? 1 : asNum(s.fx?.rate || 0);
  const salNetBRL = salCur === "BRL" ? salNet : (salRate > 0 ? salNet * salRate : 0);

  const g = state.goals || {};
  const yearlyTarget = asNum(g.yearly || 0);
  const requiredPerMonth = yearlyTarget > 0 ? (yearlyTarget / 12) : 0;

  const cats = groupTotalsByCategoryBRL(txs).slice(0, 10);

  const rows = txs.map(t => {
    const type = t.type === "income" ? "Receita" : "Gasto";
    const orig = fmt(t.amount || 0, t.currency || "BRL");
    const brl = fmt(t.amountBRL || 0, "BRL");
    return `
      <tr>
        <td>${escapeHtml(t.date)}</td>
        <td>${escapeHtml(type)}</td>
        <td>${escapeHtml(t.category)}</td>
        <td>${escapeHtml(t.desc)}</td>
        <td style="text-align:right; white-space:nowrap;">${escapeHtml(orig)}</td>
        <td style="text-align:right; white-space:nowrap;">${escapeHtml(brl)}</td>
      </tr>
    `;
  }).join("");

  const catRows = cats.map(c => `
    <tr>
      <td>${escapeHtml(c.cat)}</td>
      <td style="text-align:right; white-space:nowrap;">${escapeHtml(fmt(c.income, "BRL"))}</td>
      <td style="text-align:right; white-space:nowrap;">${escapeHtml(fmt(c.expense, "BRL"))}</td>
      <td style="text-align:right; white-space:nowrap;">${escapeHtml(fmt(c.net, "BRL"))}</td>
    </tr>
  `).join("");

  const hasSalary = salGross > 0;
  const salaryBlock = hasSalary ? `
    <div class="card">
      <h3>Salário / Receita principal (referência)</h3>
      <div class="kpis">
        <div><span class="k">Tipo</span><span class="v">${escapeHtml(s.kind || "—")}</span></div>
        <div><span class="k">Empresa</span><span class="v">${escapeHtml(s.company || "—")}</span></div>
        <div><span class="k">Moeda</span><span class="v">${escapeHtml(salCur)}</span></div>
        <div><span class="k">Bruto</span><span class="v">${escapeHtml(fmt(salGross, salCur))}</span></div>
        <div><span class="k">Fixos</span><span class="v">${escapeHtml(fmt(salFixed, salCur))}</span></div>
        <div><span class="k">Líquido</span><span class="v">${escapeHtml(fmt(salNet, salCur))}</span></div>
        <div><span class="k">Líquido (BRL)</span><span class="v">${escapeHtml(fmt(salNetBRL, "BRL"))}</span></div>
        <div><span class="k">Taxa usada</span><span class="v">${escapeHtml(salCur === "BRL" ? "—" : `1 ${salCur} = ${Number(salRate || 0).toFixed(6)} BRL`)}</span></div>
      </div>
      <p class="note">Observação: este bloco é referência do salário salvo. O relatório do mês se baseia nos lançamentos.</p>
    </div>
  ` : `
    <div class="card">
      <h3>Salário / Receita principal</h3>
      <p class="note">Nenhum salário salvo. Você pode salvar na seção “Metas de ganhos”, e lançar o salário do mês como receita.</p>
    </div>
  `;

  const goalsBlock = yearlyTarget > 0 ? `
    <div class="card">
      <h3>Metas (BRL)</h3>
      <div class="kpis">
        <div><span class="k">Meta anual</span><span class="v">${escapeHtml(fmt(yearlyTarget, "BRL"))}</span></div>
        <div><span class="k">Necessário/mês</span><span class="v">${escapeHtml(fmt(requiredPerMonth, "BRL"))}</span></div>
      </div>
      <p class="note">Se “Economia (mês)” estiver abaixo do necessário/mês, é um sinal de alerta para ajuste.</p>
    </div>
  ` : `
    <div class="card">
      <h3>Metas</h3>
      <p class="note">Meta anual não definida. Defina para o relatório incluir comparativo de ritmo.</p>
    </div>
  `;

  // Score no PDF (badge)
  let scoreBadge = `<span class="badge neutral">Saúde: sem dados</span>`;
  if (health.score !== null) {
    const cls = health.level === "great" || health.level === "good" ? "ok"
      : health.level === "critical" ? "bad"
      : "warn";
    scoreBadge = `<span class="badge ${cls}">Saúde: ${escapeHtml(health.label)} • ${health.score}/100</span>`;
  }

  return `
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Relatório mensal ${escapeHtml(monthLabel(yyyyMm))}</title>
<style>
  :root { color-scheme: light; }
  body{
    margin:0;
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    font-variant-numeric: tabular-nums;
    color:#1b2630;
    background:#ffffff;
  }
  .page{
    padding: 18px;
    max-width: 980px;
    margin: 0 auto;
  }
  header{
    display:flex;
    align-items:flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #d9e2ea;
    margin-bottom: 12px;
  }
  .brand{
    display:flex;
    gap: 10px;
    align-items:center;
  }
  .mark{
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: linear-gradient(135deg,#92A8D1,#2C3E50);
    position: relative;
    overflow:hidden;
  }
  .gridlines{
    position:absolute; inset: 8px;
    border: 1px solid rgba(240,244,247,0.35);
    border-radius: 8px;
  }
  .gridlines:before, .gridlines:after{
    content:"";
    position:absolute; inset:0;
    background:
      linear-gradient(to right, rgba(240,244,247,0.35) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(240,244,247,0.35) 1px, transparent 1px);
    background-size: 7px 7px;
    opacity: .55;
  }
  .brand h1{
    margin:0;
    font-size: 16px;
    letter-spacing: .2px;
  }
  .brand p{
    margin:5px 0 0;
    color:#4a5b6a;
    font-size: 12px;
    line-height: 1.35;
  }
  .right{
    text-align:right;
    font-size:12px;
    color:#4a5b6a;
    white-space:nowrap;
  }
  .badge{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid #d9e2ea;
    background: #f5f8fb;
    font-weight: 750;
    font-size: 12px;
    margin-top: 8px;
    justify-content: flex-end;
  }
  .badge.ok{ border-color: rgba(36,122,67,0.35); }
  .badge.bad{ border-color: rgba(179,58,58,0.35); }
  .badge.warn{ border-color: rgba(44,62,80,0.35); }
  .badge.neutral{ border-color: #d9e2ea; }

  .grid{
    display:grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media(min-width: 860px){
    .grid-2{ grid-template-columns: 1fr 1fr; }
  }
  .card{
    border: 1px solid #d9e2ea;
    border-radius: 14px;
    padding: 12px;
  }
  h3{
    margin:0 0 10px;
    font-size: 13px;
    color:#22313d;
    letter-spacing: .2px;
  }
  .kpis{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
  }
  .kpis div{
    display:flex;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px dashed #e6eef5;
    padding-bottom: 6px;
  }
  .k{ color:#4a5b6a; font-size: 12px; }
  .v{ font-weight: 700; font-size: 12px; color:#1b2630; }
  .note{
    margin:10px 0 0;
    color:#4a5b6a;
    font-size: 11px;
    line-height: 1.35;
  }
  table{
    width:100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  th, td{
    border-bottom: 1px solid #e6eef5;
    padding: 8px 6px;
    vertical-align: top;
  }
  th{
    text-align:left;
    color:#4a5b6a;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: .2px;
  }
  .sum{
    display:flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .pill{
    border: 1px solid #d9e2ea;
    border-radius: 999px;
    padding: 8px 10px;
    font-size: 12px;
    background: #f5f8fb;
  }
  .foot{
    margin-top: 14px;
    font-size: 11px;
    color:#4a5b6a;
    border-top: 1px solid #d9e2ea;
    padding-top: 10px;
    text-align:center;
  }
  @media print{
    .page{ padding: 0; }
    header{ margin-bottom: 8px; }
    .card{ break-inside: avoid; }
    table{ break-inside: auto; }
    tr{ break-inside: avoid; break-after: auto; }
  }
</style>
</head>
<body>
  <div class="page">
    <header>
      <div>
        <div class="brand">
          <div class="mark" aria-hidden="true"><div class="gridlines"></div></div>
          <div>
            <h1>FinPalma • Relatório mensal: ${escapeHtml(monthLabel(yyyyMm))}</h1>
            <p>Base: lançamentos do mês, com conversão em BRL quando aplicável. Metas sempre em BRL.</p>
          </div>
        </div>
      </div>
      <div class="right">
        Gerado em<br/><strong>${escapeHtml(createdAt)}</strong><br/>
        ${scoreBadge}
      </div>
    </header>

    <div class="card" style="margin-bottom:12px;">
      <h3>Resumo do mês (BRL)</h3>
      <div class="sum">
        <div class="pill"><strong>Receitas:</strong> ${escapeHtml(fmt(totals.incomeBRL, "BRL"))}</div>
        <div class="pill"><strong>Gastos:</strong> ${escapeHtml(fmt(totals.expenseBRL, "BRL"))}</div>
        <div class="pill"><strong>Economia:</strong> ${escapeHtml(fmt(totals.saved, "BRL"))}</div>
        <div class="pill"><strong>Qtd. lançamentos:</strong> ${txs.length}</div>
      </div>
      <p class="note">${escapeHtml(health.tip || "")}</p>
    </div>

    <div class="grid grid-2">
      ${salaryBlock}
      ${goalsBlock}
    </div>

    <div class="card" style="margin-top:12px;">
      <h3>Totais por categoria (Top 10, BRL)</h3>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th style="text-align:right;">Receitas</th>
            <th style="text-align:right;">Gastos</th>
            <th style="text-align:right;">Saldo</th>
          </tr>
        </thead>
        <tbody>
          ${catRows || `<tr><td colspan="4" style="color:#4a5b6a;">Sem dados de categoria neste mês.</td></tr>`}
        </tbody>
      </table>
      <p class="note">Sugestão: se “Gastos” estiver alto em uma categoria, é um bom lugar para otimizar.</p>
    </div>

    <div class="card" style="margin-top:12px;">
      <h3>Lançamentos detalhados</h3>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descrição/Origem</th>
            <th style="text-align:right;">Valor (moeda)</th>
            <th style="text-align:right;">Valor (BRL)</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="6" style="color:#4a5b6a;">Sem lançamentos neste mês.</td></tr>`}
        </tbody>
      </table>
      <p class="note">Os valores em BRL usam a taxa salva no lançamento, para consistência histórica.</p>
    </div>

    <div class="foot">
      Copyright ©️ 2026 - Ailton A. Nakata
    </div>
  </div>

<script>
  setTimeout(() => { try { window.print(); } catch(e) {} }, 450);
</script>
</body>
</html>
  `;
}

function generatePdfForMonth() {
  const m = getReportMonth();

  const w = window.open("", "_blank");
  if (!w) {
    showToast("PDF", "Seu navegador bloqueou pop-ups. Permita pop-ups para gerar o PDF.");
    return;
  }

  const html = buildMonthlyReportHtml(m);
  w.document.open();
  w.document.write(html);
  w.document.close();

  showToast("PDF", `Relatório de ${monthLabel(m)} aberto. Use “Imprimir” → “Salvar como PDF”.`, 5200);
}

/* ------------------ WhatsApp ------------------ */
function openWhatsApp() {
  const num = (state.settings.whatsappNumber || "").replace(/\D/g, "");
  const text = encodeURIComponent(WHATSAPP_MESSAGE);

  if (!num) {
    showToast("WhatsApp", "Defina seu número no menu (Configurações) para abrir o chat.");
    openDrawer();
    return;
  }

  const url = `https://wa.me/${+5544998398116}?text=${text}`;
  window.open(url, "_blank", "noopener");
}

/* ------------------ Backup ------------------ */
function exportJSON() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `finpalma-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast("Backup exportado", "Arquivo JSON baixado com seus dados.");
}

async function importJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("Formato inválido");

    state = {
      ...state,
      ...data,
      settings: { ...state.settings, ...(data.settings || {}) },
      goals: { ...state.goals, ...(data.goals || {}) },
      salary: { ...state.salary, ...(data.salary || {}) },
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      fxCache: data.fxCache || {},
      categoryCounts: data.categoryCounts || {}
    };

    state.salary.fx = { ...{ base:"BRL", rate:1, date:null, source:"none" }, ...(state.salary.fx || {}) };

    if (!state.categoryCounts || Object.keys(state.categoryCounts).length === 0) {
      rebuildCategoryCountsFromHistory();
    } else {
      save();
    }

    renderAll();
    showToast("Backup importado", "Seus dados foram restaurados.");
  } catch {
    showToast("Erro ao importar", "O arquivo não parece um backup válido.");
  }
}

/* ------------------ Render geral ------------------ */
function renderSettings() {
  $("#setName").value = state.settings.name || "";
  $("#setTheme").value = state.settings.theme || "light";
  $("#setDisplayMode").value = state.settings.displayMode || "BOTH";
  $("#setDefaultCurrency").value = state.settings.defaultCurrency || "BRL";
  $("#setWhatsapp").value = state.settings.whatsappNumber || "";
  applyTheme(state.settings.theme || "light");
}

function renderGoalsInputs() {
  const g = state.goals;
  $("#goalMonthly").value = g.monthly || "";
  $("#goalYearly").value = g.yearly || "";
  $("#goalYears").value = g.yearsTarget || "";
  $("#yearsCount").value = g.yearsCount || 5;
  $("#monthlySavingHint").value = g.monthlySavingHint || "";
}

function renderAll() {
  renderSettings();
  renderGoalsInputs();
  renderGoals();

  renderSalary();

  renderCategoryDatalist();
  updateTxTypeUI();
  updateTxCurrencyUI();

  renderTransactions();
  renderRadar();
  renderProgress();
  renderHealthScore();
}

/* ------------------ Init ------------------ */
function init() {
  load();

  const today = new Date().toISOString().slice(0, 10);
  $("#txDate").value = today;

  $("#btnMenu").addEventListener("click", openDrawer);
  $("#btnCloseMenu").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);

  document.querySelectorAll(".navlink").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      closeDrawer();
      const id = (a.getAttribute("href") || "").replace("#", "");
      setTimeout(() => scrollToId(id), 80);
    });
  });

  $("#setTheme").addEventListener("change", (e) => applyTheme(e.target.value));
  $("#setDisplayMode").addEventListener("change", (e) => {
    state.settings.displayMode = e.target.value;
    save();
    renderTransactions();
  });
  $("#setName").addEventListener("input", (e) => { state.settings.name = e.target.value; save(); });
  $("#setWhatsapp").addEventListener("input", (e) => { state.settings.whatsappNumber = e.target.value; save(); });

  $("#setDefaultCurrency").addEventListener("change", (e) => {
    state.settings.defaultCurrency = e.target.value;
    $("#txCurrency").value = e.target.value;
    save();
    updateTxCurrencyUI();
  });

  $("#btnExport").addEventListener("click", exportJSON);
  $("#fileImport").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importJSON(file);
    e.target.value = "";
  });

  $("#btnReset").addEventListener("click", () => {
    if (!confirm("Tem certeza? Isso apaga tudo do LocalStorage.")) return;
    localStorage.removeItem(LS_KEY);
    state = {
      settings: { name: "", theme: "light", displayMode: "BOTH", defaultCurrency: "BRL", whatsappNumber: "" },
      goals: { monthly: 0, yearly: 0, yearsTarget: 0, yearsCount: 5, monthlySavingHint: 0 },
      salary: { kind:"CLT", name:"", company:"", currency:"BRL", gross:0, fixed:0, fx:{ base:"BRL", rate:1, date:null, source:"none" } },
      transactions: [],
      fxCache: {},
      categoryCounts: {}
    };
    save();
    renderAll();
    showToast("Resetado", "Dados apagados.");
  });

  $("#btnSaveGoals").addEventListener("click", saveGoals);

  $("#txType").addEventListener("change", () => {
    updateTxTypeUI();
    $("#txDesc").value = "";
  });

  $("#txCurrency").addEventListener("change", () => {
    updateTxCurrencyUI();
    if ($("#txCurrency").value !== "BRL") $("#txRate").value = "";
  });

  $("#btnFetchRate").addEventListener("click", fillRateFromApi);
  $("#btnAddTx").addEventListener("click", addTransaction);

  $("#btnClearTx").addEventListener("click", () => {
    if (!confirm("Limpar todos os lançamentos?")) return;
    state.transactions = [];
    save();
    renderAll();
  });

  $("#filterMonth").addEventListener("change", () => {
    renderTransactions();
    renderHealthScore();
  });

  $("#btnClearFilter").addEventListener("click", () => {
    $("#filterMonth").value = "";
    renderTransactions();
    renderHealthScore();
  });

  $("#btnPdf").addEventListener("click", generatePdfForMonth);

  $("#btnSalFetchRate").addEventListener("click", fillSalaryRateFromApi);
  $("#btnSaveSalary").addEventListener("click", saveSalary);
  $("#btnUseNetAsSaving").addEventListener("click", useNetAsSavingHint);
  $("#btnAutoSavingHint").addEventListener("click", autoSavingHint);
  $("#btnPostSalaryMonth").addEventListener("click", postSalaryThisMonth);

  ["salType","salName","salCompany","salCurrency","salGross","salFixed","salRate"].forEach((id)=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateSalaryPreview);
    el.addEventListener("change", updateSalaryPreview);
  });

  $("#salCurrency").addEventListener("change", () => {
    updateSalaryPreview();
    if ($("#salCurrency").value !== "BRL") $("#salRate").value = "";
  });

  $("#waBtn").addEventListener("click", openWhatsApp);

  loadCurrencies().finally(() => {
    $("#txCurrency").value = state.settings.defaultCurrency || "BRL";
    $("#salCurrency").value = state.salary.currency || "BRL";
    if (!state.categoryCounts || Object.keys(state.categoryCounts).length === 0) {
      rebuildCategoryCountsFromHistory();
    }
    renderAll();
  });

  setInterval(() => renderRadar(), 20000);

  window.addEventListener("focus", () => {
    renderRadar();
    renderProgress();
    renderHealthScore();
  });
}

init();
