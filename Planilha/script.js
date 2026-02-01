"use strict";

const LS_KEY = "fin_site_turnos_v3";
const FX_API = "https://api.frankfurter.dev/v1/latest"; // base + symbols :contentReference[oaicite:1]{index=1}

/* Util DOM */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clampNumber(n) { return Number.isFinite(n) ? n : 0; }

function parseNumberFromInput(value) {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/[^\d,.\-]/g, "")
    .replace(/\.(?=.*\.)/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;

  if (lastComma > lastDot) normalized = cleaned.replace(/\./g, "").replace(",", ".");
  else normalized = cleaned.replace(/,/g, "");

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value, currency = "JPY") {
  const v = clampNumber(value);
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2
    }).format(v);
  } catch {
    const symbol = currency === "JPY" ? "¥" : currency === "BRL" ? "R$" : "$";
    return `${symbol} ${currency === "JPY" ? Math.round(v) : v.toFixed(2)}`;
  }
}

function nowISO() { return new Date().toISOString(); }

function getMonthISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function safeText(s) { return String(s ?? "").replace(/[<>]/g, ""); }

function daysInMonth(monthKey) {
  // monthKey: YYYY-MM
  const [yy, mm] = String(monthKey).split("-");
  const y = Number(yy);
  const m = Number(mm);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return 30;
  return new Date(y, m, 0).getDate();
}

/* Store */
function makeMatrixRow(label = "") {
  return { label, values: Array.from({ length: 31 }, () => 0) };
}

function defaultMonthData() {
  return {
    daysA: 0,
    daysB: 0,
    bonus: 0,
    sent: 0,

    // nova estrutura: planilha por dia
    fixedMatrix: [makeMatrixRow("Aluguel")],
    variableMatrix: [makeMatrixRow("Mercado")]
  };
}

function defaultSettings() {
  return {
    currency: "JPY",
    autosave: "on",
    personName: "",
    companyName: "",
    hourlyRateLabel: "",
    hourlyRate: 0,
    overtimeMultiplier: 1.25,
    normalHoursA: 8,
    extraHoursA: 3,
    normalHoursB: 7,
    extraHoursB: 4,
    viewMode: "TABLE"
  };
}

let store = {
  settings: defaultSettings(),
  months: {},
  meta: { lastSavedAt: null },

  // cache FX por base
  fx: {
    cache: {
      // "JPY": { date, rates: { BRL, USD }, fetchedAt }
    }
  }
};

let ui = {
  dirty: false,
  autosaveTimer: null,
  pendingModalAction: null
};

/* Persistência */
function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);

    store.settings = { ...defaultSettings(), ...(parsed.settings || {}) };
    store.months = parsed.months && typeof parsed.months === "object" ? parsed.months : {};
    store.meta = { ...(parsed.meta || {}), lastSavedAt: parsed?.meta?.lastSavedAt ?? null };
    store.fx = parsed.fx && typeof parsed.fx === "object" ? parsed.fx : store.fx;

    // migração: se existir fixedExpenses/variableExpenses (versão anterior), converte
    Object.keys(store.months).forEach((k) => {
      const m = store.months[k];
      if (!m) return;

      if (!Array.isArray(m.fixedMatrix)) {
        m.fixedMatrix = [];
        if (Array.isArray(m.fixedExpenses)) {
          m.fixedExpenses.forEach((it) => {
            const row = makeMatrixRow(String(it?.label ?? ""));
            row.values[0] = clampNumber(it?.amount ?? 0);
            m.fixedMatrix.push(row);
          });
        }
        if (m.fixedMatrix.length === 0) m.fixedMatrix = [makeMatrixRow("Aluguel")];
      }

      if (!Array.isArray(m.variableMatrix)) {
        m.variableMatrix = [];
        if (Array.isArray(m.variableExpenses)) {
          m.variableExpenses.forEach((it) => {
            const row = makeMatrixRow(String(it?.label ?? ""));
            row.values[0] = clampNumber(it?.amount ?? 0);
            m.variableMatrix.push(row);
          });
        }
        if (m.variableMatrix.length === 0) m.variableMatrix = [makeMatrixRow("Mercado")];
      }

      // remove estruturas antigas (não é obrigatório, mas reduz confusão)
      delete m.fixedExpenses;
      delete m.variableExpenses;
    });
  } catch {
    store = { settings: defaultSettings(), months: {}, meta: { lastSavedAt: null }, fx: { cache: {} } };
  }
}

function persistStore() {
  store.meta.lastSavedAt = nowISO();
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

/* UI helpers */
function setDirty(isDirty) {
  ui.dirty = !!isDirty;
  const saveBtn = $("#saveBtn");
  const status = $("#saveStatus");
  if (!saveBtn || !status) return;

  if (ui.dirty) {
    saveBtn.disabled = false;
    status.textContent = "Alterações pendentes";
  } else {
    saveBtn.disabled = true;
    status.textContent = "Sem alterações";
  }
}

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  window.clearTimeout(el._t);
  el._t = window.setTimeout(() => { el.hidden = true; }, 2400);
}

function lockScroll(lock) {
  document.body.classList.toggle("no-scroll", !!lock);
}

function openDrawer() {
  const drawer = $("#navDrawer");
  const backdrop = $(".backdrop");
  const btn = $(".hamburger");
  if (!drawer || !backdrop || !btn) return;

  drawer.hidden = false;
  backdrop.hidden = false;
  btn.setAttribute("aria-expanded", "true");
  lockScroll(true);
}

function closeDrawer() {
  const drawer = $("#navDrawer");
  const backdrop = $(".backdrop");
  const btn = $(".hamburger");
  if (!drawer || !backdrop || !btn) return;

  drawer.hidden = true;
  backdrop.hidden = true;
  btn.setAttribute("aria-expanded", "false");

  const modal = $("#confirmModal");
  if (!modal || modal.hidden) lockScroll(false);
}

function openModal(message, onConfirm) {
  closeDrawer();

  const modal = $("#confirmModal");
  const msg = $("#confirmMessage");
  if (!modal || !msg) return;

  msg.textContent = message || "Tem certeza?";
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  ui.pendingModalAction = typeof onConfirm === "function" ? onConfirm : null;

  lockScroll(true);
}

function closeModal() {
  const modal = $("#confirmModal");
  if (!modal) return;

  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  ui.pendingModalAction = null;

  const drawer = $("#navDrawer");
  if (!drawer || drawer.hidden) lockScroll(false);
}

function scrollToConfig() {
  closeDrawer();
  const el = $("#config");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  const hourly = $("#hourlyRate");
  if (hourly) setTimeout(() => hourly.focus(), 350);
}

/* Mês */
function ensureMonth(monthKey) {
  if (!store.months[monthKey]) store.months[monthKey] = defaultMonthData();
  const m = store.months[monthKey];

  if (!Array.isArray(m.fixedMatrix)) m.fixedMatrix = [makeMatrixRow("Aluguel")];
  if (!Array.isArray(m.variableMatrix)) m.variableMatrix = [makeMatrixRow("Mercado")];

  // garante 31 colunas
  m.fixedMatrix.forEach((r) => {
    if (!Array.isArray(r.values)) r.values = Array.from({ length: 31 }, () => 0);
    if (r.values.length < 31) r.values = r.values.concat(Array.from({ length: 31 - r.values.length }, () => 0));
    if (r.values.length > 31) r.values = r.values.slice(0, 31);
  });

  m.variableMatrix.forEach((r) => {
    if (!Array.isArray(r.values)) r.values = Array.from({ length: 31 }, () => 0);
    if (r.values.length < 31) r.values = r.values.concat(Array.from({ length: 31 - r.values.length }, () => 0));
    if (r.values.length > 31) r.values = r.values.slice(0, 31);
  });

  return m;
}

function getSelectedMonth() {
  const el = $("#monthSelect");
  const m = el ? el.value : "";
  return m || getMonthISO();
}

function setSelectedMonth(monthKey) {
  const el = $("#monthSelect");
  if (el) el.value = monthKey;
}

/* Cálculo */
function calcDailyRates(settings) {
  const hourly = clampNumber(settings.hourlyRate);
  const mult = clampNumber(settings.overtimeMultiplier || 1);

  const nA = clampNumber(settings.normalHoursA);
  const eA = clampNumber(settings.extraHoursA);

  const nB = clampNumber(settings.normalHoursB);
  const eB = clampNumber(settings.extraHoursB);

  const dailyA = hourly * (nA + eA * mult);
  const dailyB = hourly * (nB + eB * mult);

  const formulaA = `${hourly} × (${nA} + ${eA}×${mult})`;
  const formulaB = `${hourly} × (${nB} + ${eB}×${mult})`;

  return { dailyA, dailyB, formulaA, formulaB };
}

function sumMatrix(matrix, limitDays = 31) {
  if (!Array.isArray(matrix)) return 0;
  const lim = Math.max(1, Math.min(31, limitDays));
  let total = 0;
  for (const row of matrix) {
    const vals = Array.isArray(row?.values) ? row.values : [];
    for (let i = 0; i < lim; i++) total += clampNumber(vals[i]);
  }
  return total;
}

function rowSum(row, limitDays = 31) {
  const vals = Array.isArray(row?.values) ? row.values : [];
  const lim = Math.max(1, Math.min(31, limitDays));
  let total = 0;
  for (let i = 0; i < lim; i++) total += clampNumber(vals[i]);
  return total;
}

function calcMonth(monthData, settings, monthKey) {
  const { dailyA, dailyB } = calcDailyRates(settings);

  const daysA = clampNumber(monthData.daysA);
  const daysB = clampNumber(monthData.daysB);
  const bonus = clampNumber(monthData.bonus);

  const income = (dailyA * daysA) + (dailyB * daysB) + bonus;

  const dCount = daysInMonth(monthKey);
  const fixed = sumMatrix(monthData.fixedMatrix, dCount);
  const variable = sumMatrix(monthData.variableMatrix, dCount);
  const expenses = fixed + variable;

  const balance = income - expenses;

  const sent = clampNumber(monthData.sent);
  const diff = balance - sent;

  return { income, fixed, variable, expenses, balance, sent, diff, dailyA, dailyB };
}

/* FX (câmbio diário) */
function fxMetaText(meta) {
  const fxEl = $("#fxMeta");
  if (!fxEl) return;
  fxEl.textContent = meta;
}

function getFxCached(base) {
  const c = store?.fx?.cache?.[base];
  if (!c) return null;
  if (!c.rates || typeof c.rates !== "object") return null;
  return c;
}

async function fetchFx(base) {
  // Se base for BRL/USD, ainda buscamos para consistência, mas podemos tratar como 1.
  if (!base) return null;

  // cache curto para não bater API a cada tecla
  const cached = getFxCached(base);
  if (cached && cached.fetchedAt) {
    const age = Date.now() - new Date(cached.fetchedAt).getTime();
    if (age < 1000 * 60 * 30) return cached; // 30 min
  }

  // se base já é BRL ou USD, ainda queremos o outro
  const symbols = ["BRL", "USD"].filter((s) => s !== base).join(",");
  if (!symbols) {
    const pack = { date: new Date().toISOString().slice(0,10), rates: { [base]: 1 }, fetchedAt: nowISO(), base };
    store.fx.cache[base] = pack;
    return pack;
  }

  const url = `${FX_API}?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols)}`;

  try {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) throw new Error("FX_HTTP_" + resp.status);
    const data = await resp.json();

    const pack = {
      base: data.base || base,
      date: data.date || null,
      rates: data.rates || {},
      fetchedAt: nowISO()
    };

    // normaliza: se base é BRL, BRL=1
    pack.rates[pack.base] = 1;

    store.fx.cache[base] = pack;
    setDirty(true);
    scheduleAutosave();

    return pack;
  } catch {
    // fallback no cache antigo
    return cached || null;
  }
}

function convertAmount(amount, base, target, fxPack) {
  if (base === target) return amount;
  if (!fxPack || !fxPack.rates) return null;
  const rate = fxPack.rates[target];
  if (!Number.isFinite(rate)) return null;
  return amount * rate;
}

/* Render */
function writeSettingsToUI() {
  const cur = $("#currencySelect");
  if (cur) cur.value = store.settings.currency;

  $$("[data-bind-setting]").forEach((el) => {
    const key = el.getAttribute("data-bind-setting");
    const v = store.settings[key];
    el.value = v != null ? String(v) : "";
  });
}

function writeMonthToInputs(monthKey) {
  const data = ensureMonth(monthKey);
  $$("[data-bind]").forEach((input) => {
    const key = input.getAttribute("data-bind");
    const v = data[key] ?? 0;
    input.value = Number.isFinite(v) ? String(v) : "0";
  });
}

function renderMatrixHeader(kind, monthKey) {
  const dCount = daysInMonth(monthKey);

  const thead = kind === "fixed" ? $("#fixedMatrixThead") : $("#variableMatrixThead");
  if (!thead) return;

  let html = `
    <tr>
      <th class="matrix__cell matrix__cell--head matrix__cell--sticky matrix__cell--desc">Descrição</th>
  `.trim();

  for (let d = 1; d <= dCount; d++) {
    html += `<th class="matrix__cell matrix__cell--head">${d}</th>`;
  }

  html += `<th class="matrix__cell matrix__cell--head matrix__cell--total">Total</th></tr>`;
  thead.innerHTML = html;
}

function renderMatrixBody(kind, monthKey) {
  const data = ensureMonth(monthKey);
  const dCount = daysInMonth(monthKey);

  const matrix = kind === "fixed" ? data.fixedMatrix : data.variableMatrix;
  const tbody = kind === "fixed" ? $("#fixedMatrixTbody") : $("#variableMatrixTbody");
  if (!tbody) return;

  if (!Array.isArray(matrix) || matrix.length === 0) {
    tbody.innerHTML = `
      <tr class="matrix__row">
        <td class="matrix__cell matrix__cell--sticky matrix__cell--desc">Sem itens</td>
        <td class="matrix__cell" colspan="${dCount + 1}">Adicione uma linha.</td>
      </tr>
    `;
    return;
  }

  const rowsHtml = matrix.map((row, rIdx) => {
    const label = safeText(row?.label ?? "");
    const vals = Array.isArray(row?.values) ? row.values : [];
    const rTotal = rowSum(row, dCount);

    let line = `
      <tr class="matrix__row">
        <td class="matrix__cell matrix__cell--sticky matrix__cell--desc">
          <div class="matrix-desc">
            <input class="matrix-input" data-mx="label" data-kind="${kind}" data-r="${rIdx}" placeholder="Ex: Aluguel" value="${label}">
            <button class="btn btn--danger btn--icon matrix-del" type="button" data-action="remove-matrix-row" data-kind="${kind}" data-r="${rIdx}" aria-label="Remover linha">✕</button>
          </div>
        </td>
    `.trim();

    for (let c = 0; c < dCount; c++) {
      const v = clampNumber(vals[c]);
      line += `
        <td class="matrix__cell">
          <input class="matrix-input matrix-input--money" data-mx="val" data-kind="${kind}" data-r="${rIdx}" data-c="${c}"
                 inputmode="numeric" placeholder="-" value="${v ? v : ""}">
        </td>
      `.trim();
    }

    line += `
        <td class="matrix__cell matrix__cell--total matrix__cell--right" id="${kind}-rowtotal-${rIdx}">
          ${safeText(formatMoney(rTotal, store.settings.currency))}
        </td>
      </tr>
    `.trim();

    return line;
  }).join("");

  tbody.innerHTML = rowsHtml;
}

function renderMatrices(monthKey) {
  renderMatrixHeader("fixed", monthKey);
  renderMatrixHeader("variable", monthKey);
  renderMatrixBody("fixed", monthKey);
  renderMatrixBody("variable", monthKey);
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

/* Computados (sem destruir inputs ao digitar) */
async function renderComputedOnly(monthKey) {
  const data = ensureMonth(monthKey);
  const currency = store.settings.currency;
  const c = calcMonth(data, store.settings, monthKey);

  // KPIs
  setText("#kpiIncome", formatMoney(c.income, currency));
  setText("#kpiExpenses", formatMoney(c.expenses, currency));
  setText("#kpiBalance", formatMoney(c.balance, currency));
  setText("#kpiSent", formatMoney(c.sent, currency));
  setText("#kpiDiff", formatMoney(c.diff, currency));

  // Tabela totals
  setText("#tableIncome", formatMoney(c.income, currency));
  setText("#tableExpenses", formatMoney(c.expenses, currency));
  setText("#tableBalance", formatMoney(c.balance, currency));
  setText("#tableDiff", formatMoney(c.diff, currency));

  // Mini diária
  const dr = calcDailyRates(store.settings);
  setText("#miniDailyA", formatMoney(dr.dailyA, currency));
  setText("#miniDailyB", formatMoney(dr.dailyB, currency));
  setText("#miniDailyAFormula", `Fórmula: ${dr.formulaA}`);
  setText("#miniDailyBFormula", `Fórmula: ${dr.formulaB}`);

  // Cards
  setText("#cardPerson", store.settings.personName?.trim() ? store.settings.personName : "-");
  setText("#cardCompany", store.settings.companyName?.trim() ? store.settings.companyName : "-");
  setText("#cardHourly", formatMoney(store.settings.hourlyRate || 0, currency));
  setText("#cardHourlyRange", store.settings.hourlyRateLabel?.trim() ? store.settings.hourlyRateLabel : "-");

  setText("#cardDaysA", String(data.daysA || 0));
  setText("#cardDaysB", String(data.daysB || 0));
  setText("#cardDailyA", formatMoney(c.dailyA, currency));
  setText("#cardDailyB", formatMoney(c.dailyB, currency));

  setText("#cardFixed", formatMoney(c.fixed, currency));
  setText("#cardVariable", formatMoney(c.variable, currency));
  setText("#cardExpenses", formatMoney(c.expenses, currency));

  setText("#cardIncome", formatMoney(c.income, currency));
  setText("#cardBalance", formatMoney(c.balance, currency));
  setText("#cardSent", formatMoney(c.sent, currency));
  setText("#cardDiff", formatMoney(c.diff, currency));

  // Totais das matrizes
  setText("#fixedMatrixTotal", formatMoney(c.fixed, currency));
  setText("#variableMatrixTotal", formatMoney(c.variable, currency));

  // FX conversão
  const fxPack = await fetchFx(currency);

  if (!fxPack) {
    fxMetaText("Sem câmbio (offline). Os valores em R$ e $ dependem de internet.");
    setText("#incomeBRL", "R$ -");
    setText("#incomeUSD", "$ -");
    setText("#savedBRL", "R$ -");
    setText("#savedUSD", "$ -");
    setText("#cardIncomeBRL", "R$ -");
    setText("#cardIncomeUSD", "$ -");
    setText("#cardSavedBRL", "R$ -");
    setText("#cardSavedUSD", "$ -");
    return;
  }

  const base = fxPack.base || currency;
  const date = fxPack.date ? fxPack.date : "data indisponível";
  const rBRL = Number.isFinite(fxPack.rates?.BRL) ? fxPack.rates.BRL : null;
  const rUSD = Number.isFinite(fxPack.rates?.USD) ? fxPack.rates.USD : null;

  const metaParts = [];
  metaParts.push(`Base: ${base}`);
  metaParts.push(`Data: ${date}`);
  if (rBRL != null) metaParts.push(`1 ${base} = ${rBRL.toFixed(6)} BRL`);
  if (rUSD != null) metaParts.push(`1 ${base} = ${rUSD.toFixed(6)} USD`);
  fxMetaText(metaParts.join(" • "));

  const incomeBRL = convertAmount(c.income, base, "BRL", fxPack);
  const incomeUSD = convertAmount(c.income, base, "USD", fxPack);

  const savedBase = c.diff; // economizado = Diferença (Saldo - Enviado)
  const savedBRL = convertAmount(savedBase, base, "BRL", fxPack);
  const savedUSD = convertAmount(savedBase, base, "USD", fxPack);

  setText("#incomeBRL", incomeBRL == null ? "R$ -" : formatMoney(incomeBRL, "BRL"));
  setText("#incomeUSD", incomeUSD == null ? "$ -" : formatMoney(incomeUSD, "USD"));
  setText("#savedBRL", savedBRL == null ? "R$ -" : formatMoney(savedBRL, "BRL"));
  setText("#savedUSD", savedUSD == null ? "$ -" : formatMoney(savedUSD, "USD"));

  setText("#cardIncomeBRL", incomeBRL == null ? "R$ -" : formatMoney(incomeBRL, "BRL"));
  setText("#cardIncomeUSD", incomeUSD == null ? "$ -" : formatMoney(incomeUSD, "USD"));
  setText("#cardSavedBRL", savedBRL == null ? "R$ -" : formatMoney(savedBRL, "BRL"));
  setText("#cardSavedUSD", savedUSD == null ? "$ -" : formatMoney(savedUSD, "USD"));
}

function renderAll(monthKey) {
  renderMatrices(monthKey);
  return renderComputedOnly(monthKey);
}

/* View Mode */
function setViewMode(mode) {
  store.settings.viewMode = mode;
  const table = $("#tableView");
  const cards = $("#cardsView");
  const btn = $("#toggleViewBtn");
  if (!table || !cards || !btn) return;

  const isCards = mode === "CARDS";
  cards.hidden = !isCards;
  table.hidden = isCards;

  btn.setAttribute("aria-pressed", String(isCards));
  btn.textContent = isCards ? "Ver: Tabela" : "Ver: Cards";
}

function toggleViewMode() {
  setViewMode(store.settings.viewMode === "TABLE" ? "CARDS" : "TABLE");
  setDirty(true);
  scheduleAutosave();
}

/* Autosave (não atrapalha digitação) */
function isEditingNow() {
  const ae = document.activeElement;
  if (!ae) return false;
  const tag = (ae.tagName || "").toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}

function scheduleAutosave() {
  if (store.settings.autosave !== "on") return;
  window.clearTimeout(ui.autosaveTimer);

  ui.autosaveTimer = window.setTimeout(() => {
    if (!ui.dirty) return;

    if (isEditingNow()) {
      scheduleAutosave();
      return;
    }

    saveCurrentMonth({ silent: true });
  }, 2600);
}

/* Save/Clear/Reset */
function saveCurrentMonth({ silent = false } = {}) {
  ensureMonth(getSelectedMonth());
  persistStore();
  setDirty(false);

  const dt = new Date(store.meta.lastSavedAt);
  const ls = $("#lastSaved");
  if (ls) ls.textContent = `Salvo: ${dt.toLocaleString("pt-BR")}`;

  if (!silent) toast("Salvo com sucesso ✅");
  else {
    const st = $("#saveStatus");
    if (st) st.textContent = "Auto-salvo";
    window.setTimeout(() => {
      if (!ui.dirty && st) st.textContent = "Sem alterações";
    }, 1500);
  }

  renderComputedOnly(getSelectedMonth());
}

function clearCurrentMonth() {
  const monthKey = getSelectedMonth();
  store.months[monthKey] = defaultMonthData();
  writeMonthToInputs(monthKey);
  renderAll(monthKey);
  setDirty(true);
  scheduleAutosave();
  toast("Mês limpo.");
}

function resetApp() {
  localStorage.removeItem(LS_KEY);
  store = { settings: defaultSettings(), months: {}, meta: { lastSavedAt: null }, fx: { cache: {} } };
  init();
  toast("Reset concluído (dados apagados).");
}

/* Export PDF */
function exportPdf() {
  toast("Exportar PDF: pronto para implementar template profissional na próxima etapa.");
}

/* Inputs mês (não destrói tabela) */
function handleMonthInputChange(e) {
  const monthKey = getSelectedMonth();
  const data = ensureMonth(monthKey);

  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  const key = t.getAttribute("data-bind");
  if (!key) return;

  const val = parseNumberFromInput(t.value);
  const intFields = new Set(["daysA", "daysB"]);

  data[key] = intFields.has(key) ? Math.max(0, Math.round(val)) : val;

  setDirty(true);
  renderComputedOnly(monthKey);
  scheduleAutosave();
}

/* Inputs matrizes */
function updateRowTotal(kind, rIdx, monthKey) {
  const data = ensureMonth(monthKey);
  const dCount = daysInMonth(monthKey);
  const matrix = kind === "fixed" ? data.fixedMatrix : data.variableMatrix;

  const row = matrix?.[rIdx];
  if (!row) return;

  const total = rowSum(row, dCount);
  const el = $(`#${kind}-rowtotal-${rIdx}`);
  if (el) el.textContent = formatMoney(total, store.settings.currency);
}

function handleMatrixInput(target) {
  const monthKey = getSelectedMonth();
  const data = ensureMonth(monthKey);

  const kind = target.getAttribute("data-kind");
  const r = Number(target.getAttribute("data-r"));
  const mx = target.getAttribute("data-mx");

  const matrix = kind === "fixed" ? data.fixedMatrix : data.variableMatrix;
  if (!Array.isArray(matrix) || !Number.isInteger(r) || r < 0 || r >= matrix.length) return;

  if (mx === "label") {
    matrix[r].label = String(target.value ?? "");
  }

  if (mx === "val") {
    const c = Number(target.getAttribute("data-c"));
    if (!Number.isInteger(c) || c < 0 || c > 30) return;
    const v = Math.max(0, parseNumberFromInput(target.value));
    matrix[r].values[c] = v;
    updateRowTotal(kind, r, monthKey);
  }

  setDirty(true);
  renderComputedOnly(monthKey);
  scheduleAutosave();
}

function addMatrixRow(kind) {
  const monthKey = getSelectedMonth();
  const data = ensureMonth(monthKey);
  const matrix = kind === "fixed" ? data.fixedMatrix : data.variableMatrix;
  matrix.push(makeMatrixRow(""));
  setDirty(true);
  renderAll(monthKey);
  scheduleAutosave();
  toast("Linha adicionada.");
}

function removeMatrixRow(kind, rIdx) {
  const monthKey = getSelectedMonth();
  const data = ensureMonth(monthKey);
  const matrix = kind === "fixed" ? data.fixedMatrix : data.variableMatrix;

  const idx = Number(rIdx);
  if (!Number.isInteger(idx) || idx < 0 || idx >= matrix.length) return;

  matrix.splice(idx, 1);
  setDirty(true);
  renderAll(monthKey);
  scheduleAutosave();
  toast("Linha removida.");
}

/* Settings */
function handleSettingChange(el) {
  const key = el.getAttribute("data-bind-setting");
  const raw = el.value;

  const numberKeys = new Set([
    "hourlyRate",
    "overtimeMultiplier",
    "normalHoursA",
    "extraHoursA",
    "normalHoursB",
    "extraHoursB"
  ]);

  if (numberKeys.has(key)) {
    store.settings[key] = Math.max(0, parseNumberFromInput(raw));
    if (key.startsWith("normalHours") || key.startsWith("extraHours")) {
      store.settings[key] = Math.round(store.settings[key]);
    }
    if (key === "overtimeMultiplier") store.settings[key] = Math.max(1, store.settings[key] || 1);
  } else {
    store.settings[key] = String(raw ?? "");
  }

  setDirty(true);

  // quando muda moeda, recalcula e refaz FX
  if (key === "autosave" || key === "personName" || key === "companyName" || key === "hourlyRateLabel") {
    renderComputedOnly(getSelectedMonth());
  } else {
    renderComputedOnly(getSelectedMonth());
  }

  scheduleAutosave();
}

/* Eventos */
function bindEvents() {
  document.addEventListener("click", (e) => {
    const modal = $("#confirmModal");
    if (modal && !modal.hidden && e.target === modal) {
      closeModal();
      return;
    }

    const t = e.target.closest("[data-action]");
    if (!t) return;

    const action = t.getAttribute("data-action");

    if (action === "toggle-drawer") openDrawer();
    if (action === "close-drawer") closeDrawer();

    if (action === "jump-config") scrollToConfig();

    if (action === "toggle-view") toggleViewMode();
    if (action === "save") saveCurrentMonth({ silent: false });

    if (action === "clear") {
      const monthKey = getSelectedMonth();
      openModal(`Limpar os dados do mês ${monthKey}?`, () => {
        clearCurrentMonth();
        closeModal();
      });
    }

    if (action === "export-pdf") exportPdf();

    if (action === "modal-cancel") closeModal();
    if (action === "modal-confirm") {
      if (typeof ui.pendingModalAction === "function") ui.pendingModalAction();
      else closeModal();
    }

    if (action === "reset-app") {
      openModal("Isso apagará TODOS os meses salvos neste dispositivo. Confirmar?", () => {
        resetApp();
        closeModal();
      });
    }

    if (action === "add-matrix-row") {
      const kind = t.getAttribute("data-kind");
      addMatrixRow(kind);
    }

    if (action === "remove-matrix-row") {
      const kind = t.getAttribute("data-kind");
      const r = t.getAttribute("data-r");
      removeMatrixRow(kind, r);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrawer();
      closeModal();
    }
  });

  const backdrop = $(".backdrop");
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  // inputs do mês
  $$("[data-bind]").forEach((input) => {
    input.addEventListener("input", handleMonthInputChange, { passive: true });
    input.addEventListener("blur", () => scheduleAutosave(), { passive: true });
  });

  // troca mês
  const month = $("#monthSelect");
  if (month) {
    month.addEventListener("change", async () => {
      const monthKey = getSelectedMonth();
      ensureMonth(monthKey);
      writeMonthToInputs(monthKey);
      renderAll(monthKey);
      setDirty(false);
    });
  }

  // troca moeda
  const cur = $("#currencySelect");
  if (cur) {
    cur.addEventListener("change", async (e) => {
      store.settings.currency = e.target.value;
      setDirty(true);
      await renderAll(getSelectedMonth()); // refaz totais e FX
      scheduleAutosave();
    });
  }

  // settings
  $$("[data-bind-setting]").forEach((el) => {
    el.addEventListener("input", () => handleSettingChange(el), { passive: true });
    el.addEventListener("change", () => handleSettingChange(el), { passive: true });
    el.addEventListener("blur", () => scheduleAutosave(), { passive: true });
  });

  // matrizes: delegação
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (!t.hasAttribute("data-mx")) return;
    handleMatrixInput(t);
  }, { passive: true });

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (!t.hasAttribute("data-mx")) return;
    handleMatrixInput(t);
  }, { passive: true });

  window.addEventListener("beforeunload", (e) => {
    if (!ui.dirty) return;
    e.preventDefault();
    e.returnValue = "";
  });
}

/* Init */
async function init() {
  loadStore();

  closeModal();
  closeDrawer();
  lockScroll(false);

  const monthKey = getMonthISO();
  setSelectedMonth(monthKey);
  ensureMonth(monthKey);

  writeSettingsToUI();

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const desired = store.settings.viewMode || (isMobile ? "CARDS" : "TABLE");
  setViewMode(desired);

  writeMonthToInputs(monthKey);
  await renderAll(monthKey);

  if (store.meta.lastSavedAt) {
    const dt = new Date(store.meta.lastSavedAt);
    const ls = $("#lastSaved");
    if (ls) ls.textContent = `Salvo: ${dt.toLocaleString("pt-BR")}`;
  }

  setDirty(false);
  bindEvents();

  const needsSetup =
    !store.settings.personName?.trim() ||
    !store.settings.companyName?.trim() ||
    (store.settings.hourlyRate || 0) <= 0;

  if (needsSetup) {
    toast("Configure Nome, Empresa e Valor/hora para começar.");
    const hourly = $("#hourlyRate");
    if (hourly) setTimeout(() => hourly.focus(), 400);

    const adv = $("#advancedSettings");
    if (adv) adv.open = false;
  }
}

init();
