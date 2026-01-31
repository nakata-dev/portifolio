/* =========================================================
  FinPalma MVP - JS puro (2026)
  Comentários pontuais para facilitar manutenção:
  - Estado único salvo no LocalStorage
  - FX por lançamento (taxa congelada)
  - Progresso/alertas em cima de metas
  - Agenda com alerta sonoro + fala
  - NOVO: Salário/Receita principal + fixos + líquido calculado
========================================================= */

const LS_KEY = "finpalma_mvp_v1";

// Mensagem fixa do WhatsApp (conforme o prompt)
const WHATSAPP_MESSAGE =
  "Olá, gostei do seu sistema e já uso ele a algum tempo, gostaria de saber quanto fica para acrescentar mais funcionalidades e tornar um sistema totalmente meu e que atenda as minhas necessidades?";

// Frankfurter API (sem key) para câmbio. Documentação: https://frankfurter.dev/
const FX_API = "https://api.frankfurter.dev/v1";

// Estado do app (persistido em LocalStorage)
let state = {
  settings: {
    name: "",
    theme: "light",
    displayMode: "BOTH",      // BRL | ORIGINAL | BOTH
    defaultCurrency: "BRL",   // moeda padrão do site
    whatsappNumber: ""        // preenchido no menu
  },
  goals: {
    monthly: 0,
    yearly: 0,
    yearsTarget: 0,
    yearsCount: 5,
    monthlySavingHint: 0
  },

  // NOVO: salário / receita principal (mensal)
  salary: {
    kind: "CLT",          // CLT | PJ
    name: "",
    company: "",
    currency: "BRL",
    gross: 0,
    fixed: 0,
    fx: {
      base: "BRL",
      rate: 1,
      date: null,
      source: "none"
    }
  },

  transactions: [],
  skill: { name: "" },
  tasks: [],
  reminders: [],
  fxCache: {} // cache simples de câmbio para reduzir chamadas
};

// Fallback de moedas caso o usuário esteja offline e não consiga carregar do endpoint
const FALLBACK_CURRENCIES = [
  "BRL","USD","EUR","GBP","JPY","CAD","AUD","CHF","MXN","ARS","CLP","COP","PEN","UYU","CNY","KRW","INR"
];

// ------------------ Helpers DOM ------------------
const $ = (sel) => document.querySelector(sel);

const asNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const fmt = (val, currency) => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(val || 0);
  } catch {
    return `${(val || 0).toFixed(2)} ${currency}`;
  }
};

// Toast minimalista para feedback rápido (evita telas longas com mensagens fixas)
function showToast(title, msg, ms = 3200) {
  $("#toastTitle").textContent = title;
  $("#toastMsg").textContent = msg;
  $("#toast").classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => $("#toast").classList.remove("show"), ms);
}

// Scroll com ajuste para header fixo
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ------------------ Persistência ------------------
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...state,
        ...parsed,
        settings: { ...state.settings, ...(parsed.settings || {}) },
        goals: { ...state.goals, ...(parsed.goals || {}) },

        // merge seguro do salário
        salary: { ...state.salary, ...(parsed.salary || {}) },
        salaryFx: undefined, // compat futura (não usado)

        skill: { ...state.skill, ...(parsed.skill || {}) },
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
        fxCache: parsed.fxCache || {}
      };

      // Garante defaults internos do salary.fx
      state.salary.fx = { ...{ base:"BRL", rate:1, date:null, source:"none" }, ...(state.salary.fx || {}) };
      if (!state.salary.currency) state.salary.currency = "BRL";
    }
  } catch (e) {
    console.warn("Falha ao carregar estado:", e);
  }
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// ------------------ Tema ------------------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  state.settings.theme = theme;
  save();
}

// ------------------ Drawer ------------------
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

// ------------------ Moedas ------------------
async function loadCurrencies() {
  let codes = [...FALLBACK_CURRENCIES];

  // Tentativa de pegar lista real do endpoint (melhor UX para usuários globais)
  try {
    const resp = await fetch(`${FX_API}/currencies`, { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      codes = Object.keys(data).sort();
    }
  } catch {
    // offline: permanece fallback
  }

  const selTx = $("#txCurrency");
  const selDef = $("#setDefaultCurrency");
  const selSal = $("#salCurrency");

  selTx.innerHTML = "";
  selDef.innerHTML = "";
  selSal.innerHTML = "";

  codes.forEach((code) => {
    const opt1 = document.createElement("option");
    opt1.value = code;
    opt1.textContent = code;
    selTx.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = code;
    opt2.textContent = code;
    selDef.appendChild(opt2);

    const opt3 = document.createElement("option");
    opt3.value = code;
    opt3.textContent = code;
    selSal.appendChild(opt3);
  });

  // Defaults
  selDef.value = state.settings.defaultCurrency || "BRL";
  selTx.value = state.settings.defaultCurrency || "BRL";

  // salary default
  selSal.value = state.salary.currency || "BRL";
}

// ------------------ FX (taxa congelada) ------------------
function fxKey(from, to, dateStr) {
  return `${from}->${to}|${dateStr || "latest"}`;
}

async function fetchFxRate(from, to, dateStr) {
  // Cache de 12h para reduzir chamadas e manter app leve
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

// ------------------ FX para transações ------------------
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

// ------------------ NOVO: FX para salário ------------------
async function fillSalaryRateFromApi() {
  const cur = $("#salCurrency").value;
  // salário é mensal, então para simplificar usamos latest (o usuário pode colar uma taxa manual se quiser congelar diferente)
  if (!cur || cur === "BRL") {
    $("#salRate").value = "";
    showToast("Taxa", "BRL não precisa de taxa.");
    return;
  }

  try {
    const rate = await fetchFxRate(cur, "BRL", null);
    $("#salRate").value = Number(rate).toFixed(6);
    showToast("Taxa encontrada", `1 ${cur} ≈ ${Number(rate).toFixed(4)} BRL`);
  } catch {
    showToast("Não consegui buscar a taxa", "Você pode informar a taxa manualmente.");
  }
}

// ------------------ Transações ------------------
function clearTxFormSoft() {
  // Mantém tipo/moeda para entrada rápida (UX “uma mão”)
  $("#txAmount").value = "";
  $("#txDesc").value = "";
  $("#txRate").value = "";
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7); // YYYY-MM
}

function getFilteredTransactions() {
  const m = $("#filterMonth").value; // YYYY-MM
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

function addTransaction() {
  const type = $("#txType").value;
  const date = $("#txDate").value || new Date().toISOString().slice(0, 10);
  const category = ($("#txCategory").value || "").trim() || "Geral";
  const desc = ($("#txDesc").value || "").trim() || (type === "income" ? "Receita" : "Gasto");
  const amount = asNum($("#txAmount").value);
  const currency = $("#txCurrency").value || state.settings.defaultCurrency || "BRL";

  if (amount <= 0) {
    showToast("Valor inválido", "Informe um valor maior que zero.");
    return;
  }

  // Se não for BRL, exige taxa (API ou manual)
  let rate = 1;
  let fxSource = "none";
  const rateInput = asNum($("#txRate").value);

  if (currency !== "BRL") {
    if (rateInput > 0) {
      rate = rateInput;
      fxSource = "manual_or_cached";
    } else {
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
      date: date,
      source: currency === "BRL" ? "none" : fxSource
    },
    amountBRL
  };

  state.transactions.unshift(tx);

  // Pequena “inteligência”: guarda última categoria usada para acelerar entradas
  state._lastCategory = category;
  save();

  renderAll();
  clearTxFormSoft();

  showToast(
    "Lançamento adicionado",
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

  // Para “pouca rolagem”: mostra até 18 e incentiva filtro por mês
  txs.slice(0, 18).forEach((t) => {
    const isIncome = t.type === "income";
    const main = isIncome ? "Receita" : "Gasto";
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
          <div class="item-meta">${t.date} • ${t.category} • ${main}</div>
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

// ------------------ Metas + Projeções ------------------
function saveGoals() {
  state.goals.monthly = asNum($("#goalMonthly").value);
  state.goals.yearly = asNum($("#goalYearly").value);
  state.goals.yearsTarget = asNum($("#goalYears").value);
  state.goals.yearsCount = Math.max(1, Math.floor(asNum($("#yearsCount").value) || 1));
  state.goals.monthlySavingHint = asNum($("#monthlySavingHint").value);
  save();

  renderGoals();
  renderProgress();
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

// ------------------ NOVO: Salário / Receita principal ------------------
function computeSalaryNet() {
  const cur = $("#salCurrency").value || "BRL";
  const gross = asNum($("#salGross").value);
  const fixed = asNum($("#salFixed").value);
  const net = Math.max(0, gross - fixed);

  // FX
  const rateInput = asNum($("#salRate").value);
  const rate = (cur === "BRL") ? 1 : (rateInput > 0 ? rateInput : 0);
  const netBRL = (cur === "BRL") ? net : (rate > 0 ? net * rate : 0);

  return { cur, gross, fixed, net, rate, netBRL };
}

function updateSalaryPreview() {
  const { cur, net, rate, netBRL } = computeSalaryNet();

  $("#salNet").textContent = net ? fmt(net, cur) : fmt(0, cur);

  if (cur === "BRL") {
    $("#salNetBRL").textContent = fmt(net, "BRL");
    $("#salStatus").textContent = "BRL (sem conversão)";
    $("#salHint").textContent = "Dica: você pode usar o líquido como base de economia mensal.";
  } else {
    if (rate > 0) {
      $("#salNetBRL").textContent = fmt(netBRL, "BRL");
      $("#salStatus").textContent = `Convertendo com taxa ${rate.toFixed(6)}`
      $("#salHint").textContent = "Taxa definida. Histórico fica consistente se você não mudar a taxa.";
    } else {
      $("#salNetBRL").textContent = "—";
      $("#salStatus").textContent = "Defina a taxa para ver BRL";
      $("#salHint").textContent = "Clique em “Buscar taxa” ou informe a taxa manualmente.";
    }
  }
}

function saveSalary() {
  const kind = $("#salType").value;
  const name = ($("#salName").value || "").trim();
  const company = ($("#salCompany").value || "").trim();

  const { cur, gross, fixed, net, rate } = computeSalaryNet();

  // Se moeda ≠ BRL, exige taxa para salvar (para manter lógica clara)
  if (cur !== "BRL" && rate <= 0) {
    showToast("Falta a taxa", "Para moeda estrangeira, busque ou informe a taxa antes de salvar.");
    return;
  }

  state.salary.kind = kind;
  state.salary.name = name;
  state.salary.company = company;
  state.salary.currency = cur;
  state.salary.gross = gross;
  state.salary.fixed = fixed;

  state.salary.fx = {
    base: "BRL",
    rate: cur === "BRL" ? 1 : rate,
    date: new Date().toISOString().slice(0, 10),
    source: cur === "BRL" ? "none" : "manual_or_cached"
  };

  save();
  renderSalary();
  showToast("Salário salvo", "Receita principal atualizada.");
}

function renderSalary() {
  // Inputs
  $("#salType").value = state.salary.kind || "CLT";
  $("#salName").value = state.salary.name || "";
  $("#salCompany").value = state.salary.company || "";
  $("#salCurrency").value = state.salary.currency || "BRL";
  $("#salGross").value = state.salary.gross || "";
  $("#salFixed").value = state.salary.fixed || "";

  // Taxa (apenas se moeda ≠ BRL)
  if ((state.salary.currency || "BRL") !== "BRL") {
    const rate = asNum(state.salary.fx?.rate || 0);
    $("#salRate").value = rate > 0 ? rate.toFixed(6) : "";
  } else {
    $("#salRate").value = "";
  }

  updateSalaryPreview();
}

function useNetAsSavingHint() {
  const { cur, net, rate } = computeSalaryNet();
  // A meta/projeção trabalha em BRL. Se salário está em outra moeda, converte para BRL usando taxa atual.
  const netBRL = (cur === "BRL") ? net : (rate > 0 ? net * rate : 0);

  if (cur !== "BRL" && netBRL <= 0) {
    showToast("Não dá ainda", "Defina a taxa para converter o líquido para BRL.");
    return;
  }

  $("#monthlySavingHint").value = (cur === "BRL") ? net.toFixed(2) : netBRL.toFixed(2);
  state.goals.monthlySavingHint = asNum($("#monthlySavingHint").value);
  save();

  renderGoals();
  renderProgress();
  showToast("Aplicado", "Usei seu líquido como economia mensal (BRL).");
}

// ------------------ Progresso + Alertas ------------------
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

  // MVP “inteligente”: se não houver dados, usa a economia mensal informada
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
    $("#progressSummary").textContent =
      "Defina a meta de 1 ano para receber alertas automáticos.";
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

// Gráfico leve em canvas (sem libs) para manter o MVP minimalista
function drawChart(series, requiredPerMonth, monthIdx) {
  const canvas = $("#chart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Grid
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

  // Linha do zero
  ctx.strokeStyle = "rgba(44,62,80,0.22)";
  ctx.beginPath();
  ctx.moveTo(gx0, yOf(0));
  ctx.lineTo(gx1, yOf(0));
  ctx.stroke();

  // Barras
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

  // Linha do necessário/mês
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

// ------------------ Skill / Tarefas ------------------
function saveSkill() {
  state.skill.name = ($("#skillName").value || "").trim();
  save();
  renderSkill();
  showToast("Skill salva", state.skill.name ? `Foco: ${state.skill.name}` : "Sem skill definida.");
}

function renderSkill() {
  $("#skillName").value = state.skill.name || "";
  $("#skillStatus").textContent = state.skill.name ? `Skill: ${state.skill.name}` : "Defina uma skill";
}

function addTask() {
  const title = ($("#taskTitle").value || "").trim();
  if (!title) {
    showToast("Tarefa", "Escreva uma tarefa antes de adicionar.");
    return;
  }

  state.tasks.unshift({
    id: uid(),
    title,
    done: false,
    skill: state.skill.name || ""
  });

  $("#taskTitle").value = "";
  save();
  renderTasks();
}

function toggleTask(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  save();
  renderTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(x => x.id !== id);
  save();
  renderTasks();
}

function renderTasks() {
  const list = $("#taskList");
  if (state.tasks.length === 0) {
    list.innerHTML = `
      <div class="item">
        <p class="item-title" style="margin:0;">Sem tarefas.</p>
        <div class="item-meta">Adicione tarefas rápidas para sua skill.</div>
      </div>`;
    return;
  }

  list.innerHTML = "";
  state.tasks.slice(0, 10).forEach((t) => {
    const badge = t.done ? "ok" : "bad";
    const badgeText = t.done ? "feito" : "pendente";

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item-top">
        <div>
          <p class="item-title">${t.title}</p>
          <div class="item-meta">${t.skill ? `Skill: ${t.skill}` : "Sem skill vinculada"}</div>
        </div>
        <div class="item-amt">
          <div class="tag ${badge}">${badgeText}</div>
        </div>
      </div>
      <div class="row" style="margin-top:10px; justify-content:flex-end;">
        <button class="btn secondary" data-tog="${t.id}">${t.done ? "Reabrir" : "Concluir"}</button>
        <button class="btn danger" data-del="${t.id}">Excluir</button>
      </div>
    `;

    el.querySelector("[data-tog]")?.addEventListener("click", () => toggleTask(t.id));
    el.querySelector("[data-del]")?.addEventListener("click", () => deleteTask(t.id));
    list.appendChild(el);
  });

  if (state.tasks.length > 10) {
    const more = document.createElement("div");
    more.className = "pill";
    more.textContent = `Mostrando 10 de ${state.tasks.length}. (Mantendo a tela leve e sem muita rolagem.)`;
    list.appendChild(more);
  }
}

// ------------------ Agenda / Lembretes ------------------
function addReminder() {
  const d = $("#remDate").value;
  const t = $("#remTime").value;
  const practice = ($("#remPractice").value || "").trim();

  if (!d || !t || !practice) {
    showToast("Agenda", "Preencha dia, hora e prática.");
    return;
  }

  const dt = new Date(`${d}T${t}:00`);
  if (isNaN(dt.getTime())) {
    showToast("Agenda", "Data/hora inválida.");
    return;
  }

  state.reminders.unshift({
    id: uid(),
    when: dt.toISOString(),
    practice,
    fired: false
  });

  save();
  renderReminders();
  showToast("Agendado", "Prática adicionada à agenda.");
  $("#remPractice").value = "";
}

function deleteReminder(id) {
  state.reminders = state.reminders.filter(r => r.id !== id);
  save();
  renderReminders();
}

function renderReminders() {
  const list = $("#remList");
  if (state.reminders.length === 0) {
    list.innerHTML = `
      <div class="item">
        <p class="item-title" style="margin:0;">Agenda vazia.</p>
        <div class="item-meta">Agende práticas para receber alertas.</div>
      </div>`;
    return;
  }

  list.innerHTML = "";
  state.reminders.slice(0, 10).forEach((r) => {
    const when = new Date(r.when);
    const nice = when.toLocaleString("pt-BR");
    const status = r.fired ? "ok" : "bad";
    const statusText = r.fired ? "alertado" : "pendente";

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item-top">
        <div>
          <p class="item-title">${r.practice}</p>
          <div class="item-meta">${nice}</div>
        </div>
        <div class="item-amt">
          <div class="tag ${status}">${statusText}</div>
        </div>
      </div>
      <div class="row" style="margin-top:10px; justify-content:flex-end;">
        <button class="btn danger" data-del="${r.id}">Excluir</button>
      </div>
    `;

    el.querySelector("[data-del]")?.addEventListener("click", () => deleteReminder(r.id));
    list.appendChild(el);
  });

  if (state.reminders.length > 10) {
    const more = document.createElement("div");
    more.className = "pill";
    more.textContent = `Mostrando 10 de ${state.reminders.length}.`;
    list.appendChild(more);
  }
}

// Beep simples (AudioContext) + fala (SpeechSynthesis) para alertas
function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 280);
  } catch {}
}

function speak(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 1.02;
    speechSynthesis.speak(u);
  } catch {}
}

function reminderLoop() {
  const now = Date.now();
  let changed = false;

  for (const r of state.reminders) {
    if (r.fired) continue;
    const when = Date.parse(r.when);
    if (!isNaN(when) && now >= when) {
      r.fired = true;
      changed = true;

      const name = state.settings.name || "amigo";
      const msg = `Olá ${name}, não se esqueça que hoje você tem que fazer ${r.practice}.`;

      // Observação importante: navegadores podem bloquear áudio sem interação prévia do usuário.
      playBeep();
      speak(msg);
      showToast("Lembrete de prática", msg, 6000);
    }
  }

  if (changed) {
    save();
    renderReminders();
  }
}

// ------------------ WhatsApp ------------------
function openWhatsApp() {
  const num = (state.settings.whatsappNumber || "").replace(/\D/g, "");
  const text = encodeURIComponent(WHATSAPP_MESSAGE);

  if (!num) {
    showToast("WhatsApp", "Defina seu número no menu (Configurações) para abrir o chat.");
    openDrawer();
    return;
  }

  const url = `https://wa.me/${num}?text=${text}`;
  window.open(url, "_blank", "noopener");
}

// ------------------ Backup JSON ------------------
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
      skill: { ...state.skill, ...(data.skill || {}) },
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      reminders: Array.isArray(data.reminders) ? data.reminders : [],
      fxCache: data.fxCache || {}
    };

    state.salary.fx = { ...{ base:"BRL", rate:1, date:null, source:"none" }, ...(state.salary.fx || {}) };

    save();
    renderAll();
    showToast("Backup importado", "Seus dados foram restaurados.");
  } catch {
    showToast("Erro ao importar", "O arquivo não parece um backup válido.");
  }
}

// ------------------ Render geral ------------------
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

  // salário
  renderSalary();

  renderTransactions();
  renderProgress();
  renderSkill();
  renderTasks();
  renderReminders();
}

// ------------------ Init ------------------
function init() {
  load();

  // Defaults
  const today = new Date().toISOString().slice(0, 10);
  $("#txDate").value = today;
  $("#remDate").value = today;

  // Menu
  $("#btnMenu").addEventListener("click", openDrawer);
  $("#btnCloseMenu").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);

  // Fechar drawer ao clicar em links e navegar com scroll suave
  document.querySelectorAll(".navlink").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      closeDrawer();
      const href = a.getAttribute("href") || "";
      const id = href.replace("#", "");
      setTimeout(() => scrollToId(id), 80);
    });
  });

  // Configurações
  $("#setTheme").addEventListener("change", (e) => applyTheme(e.target.value));
  $("#setDisplayMode").addEventListener("change", (e) => {
    state.settings.displayMode = e.target.value;
    save();
    renderTransactions();
  });
  $("#setName").addEventListener("input", (e) => {
    state.settings.name = e.target.value;
    save();
  });
  $("#setWhatsapp").addEventListener("input", (e) => {
    state.settings.whatsappNumber = e.target.value;
    save();
  });
  $("#setDefaultCurrency").addEventListener("change", (e) => {
    state.settings.defaultCurrency = e.target.value;
    $("#txCurrency").value = e.target.value; // ajuda na entrada rápida
    save();
  });

  // Backup
  $("#btnExport").addEventListener("click", exportJSON);
  $("#fileImport").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importJSON(file);
    e.target.value = "";
  });

  // Reset
  $("#btnReset").addEventListener("click", () => {
    if (!confirm("Tem certeza? Isso apaga tudo do LocalStorage.")) return;
    localStorage.removeItem(LS_KEY);

    // Recria estado padrão
    state = {
      settings: { name: "", theme: "light", displayMode: "BOTH", defaultCurrency: "BRL", whatsappNumber: "" },
      goals: { monthly: 0, yearly: 0, yearsTarget: 0, yearsCount: 5, monthlySavingHint: 0 },
      salary: { kind:"CLT", name:"", company:"", currency:"BRL", gross:0, fixed:0, fx:{ base:"BRL", rate:1, date:null, source:"none" } },
      transactions: [],
      skill: { name: "" },
      tasks: [],
      reminders: [],
      fxCache: {}
    };

    save();
    renderAll();
    showToast("Resetado", "Dados apagados.");
  });

  // Metas
  $("#btnSaveGoals").addEventListener("click", saveGoals);

  // Transações
  $("#btnFetchRate").addEventListener("click", fillRateFromApi);
  $("#btnAddTx").addEventListener("click", addTransaction);
  $("#btnClearTx").addEventListener("click", () => {
    if (!confirm("Limpar todos os lançamentos?")) return;
    state.transactions = [];
    save();
    renderAll();
  });

  $("#filterMonth").addEventListener("change", () => renderTransactions());
  $("#btnClearFilter").addEventListener("click", () => {
    $("#filterMonth").value = "";
    renderTransactions();
  });

  // “Inteligência” leve: reaproveita última categoria
  if (state._lastCategory && !$("#txCategory").value) $("#txCategory").value = state._lastCategory;
  $("#txCategory").addEventListener("blur", () => {
    const v = ($("#txCategory").value || "").trim();
    if (v) {
      state._lastCategory = v;
      save();
    }
  });

  // NOVO: Salário eventos
  $("#btnSalFetchRate").addEventListener("click", fillSalaryRateFromApi);
  $("#btnSaveSalary").addEventListener("click", saveSalary);
  $("#btnUseNetAsSaving").addEventListener("click", useNetAsSavingHint);

  // Preview em tempo real (sem ficar “pesado”)
  ["salType","salName","salCompany","salCurrency","salGross","salFixed","salRate"].forEach((id)=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateSalaryPreview);
    el.addEventListener("change", updateSalaryPreview);
  });

  // Skill/Tarefas
  $("#btnSaveSkill").addEventListener("click", saveSkill);
  $("#btnAddTask").addEventListener("click", addTask);
  $("#btnClearTasks").addEventListener("click", () => {
    if (!confirm("Limpar todas as tarefas?")) return;
    state.tasks = [];
    save();
    renderTasks();
  });

  // Agenda
  $("#btnAddReminder").addEventListener("click", addReminder);
  $("#btnClearReminders").addEventListener("click", () => {
    if (!confirm("Limpar toda a agenda?")) return;
    state.reminders = [];
    save();
    renderReminders();
  });

  // WhatsApp
  $("#waBtn").addEventListener("click", openWhatsApp);

  // Carrega moedas e renderiza
  loadCurrencies().finally(() => {
    // Ajusta selects pós-carregamento
    $("#txCurrency").value = state.settings.defaultCurrency || "BRL";
    $("#salCurrency").value = state.salary.currency || "BRL";
    renderAll();
  });

  // Loop dos lembretes (somente enquanto a página estiver aberta)
  setInterval(reminderLoop, 15000);

  // Recalcula progresso ao voltar para a aba
  window.addEventListener("focus", () => renderProgress());
}

init();
