//TESTANDO ATUALIZAÇÃO JS
const LS_KEY = "finance_pro_v4";
const FX_API = "https://api.frankfurter.dev/v1";

const $ = (s) => document.querySelector(s);
const DAYS_IN_MONTH = 31;

const CURRENCIES = ["JPY", "BRL", "USD"];
const CURRENCY_LABEL = { JPY: "JPY (¥)", BRL: "BRL (R$)", USD: "USD ($)" };

const defaultState = () => ({
  month: "",
  settings: {
    name: "",
    company: "",
    rangeText: "",
    hourValue: 0,
    overtimeMult: 1.25,
    autosave: "on",
    aNormal: 8, aExtra: 3,
    bNormal: 7, bExtra: 4,
    dayScale: 1
  },

  monthData: {
    daysA: 0,
    daysB: 0,
    bonusJPY: 0,
    sentJPY: 0,
    savedJPY: 0,
    expenses: {
      fixed: [{ id: uid(), desc: "Aluguel", monthly: 0, values: Array(DAYS_IN_MONTH).fill(0), useDaily: false }],
      variable: [{ id: uid(), desc: "Mercado", monthly: 0, values: Array(DAYS_IN_MONTH).fill(0), useDaily: false }]
    }
  },

  // Persistente (atravessa meses)
  deals: { receber: [], pagar: [] },

  // FX (base JPY)
  fx: { base: "JPY", brl: null, usd: null, date: null, fetchedAt: null }
});

let state = load() || defaultState();

// ---------- utils ----------
function uid(){ return Math.random().toString(16).slice(2) + Date.now().toString(16); }
function clampNum(v){ const n = Number(String(v).replace(",", ".")); return Number.isFinite(n) ? n : 0; }
function escapeHTML(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}
function todayISO(){ return new Date().toISOString().slice(0,10); }
function monthOf(dateISO){ return String(dateISO || "").slice(0,7); }

function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1500);
}

function formatByCurrency(n, currency){
  const v = clampNum(n);
  try{
    return new Intl.NumberFormat("pt-BR", { style:"currency", currency }).format(v);
  }catch{
    if(currency === "JPY") return `¥ ${Math.round(v).toLocaleString("pt-BR")}`;
    if(currency === "BRL") return `R$ ${v.toFixed(2)}`;
    return `$ ${v.toFixed(2)}`;
  }
}

function formatJPY(n){
  const v = Math.round(clampNum(n));
  return `JP¥ ${v.toLocaleString("pt-BR")}`;
}

// Converte valor em moeda X para JPY (usando FX base JPY)
function toJPY(amount, currency){
  const v = clampNum(amount);
  if(currency === "JPY") return v;

  // fx: 1 JPY = rate BRL/USD
  if(currency === "BRL"){
    const r = state.fx?.brl;
    if(!r) return null;
    return v / r;
  }

  if(currency === "USD"){
    const r = state.fx?.usd;
    if(!r) return null;
    return v / r;
  }

  return null;
}

function warnIfMissingFX(currency){
  if(currency === "JPY") return false;
  if(currency === "BRL" && !state.fx?.brl) return true;
  if(currency === "USD" && !state.fx?.usd) return true;
  return false;
}

// ---------- storage ----------
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!parsed?.settings || !parsed?.monthData) return null;
    normalize(parsed);
    return parsed;
  }catch{ return null; }
}

// mês separado
function getMonthKey(month){ return `${LS_KEY}__month__${month}`; }

function loadMonth(month){
  try{
    const raw = localStorage.getItem(getMonthKey(month));
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!parsed) return null;
    return parsed;
  }catch{ return null; }
}

function saveMonth(){
  if(!state.month) return;
  localStorage.setItem(getMonthKey(state.month), JSON.stringify(state.monthData));
}

function normalize(st){
  const exp = st?.monthData?.expenses;
  if(exp){
    ["fixed","variable"].forEach(k=>{
      exp[k] = Array.isArray(exp[k]) ? exp[k] : [];
      exp[k].forEach(row=>{
        row.id = row.id ?? uid();
        row.desc = row.desc ?? "";
        row.monthly = clampNum(row.monthly ?? 0);
        row.useDaily = !!row.useDaily;
        row.values = Array.isArray(row.values) ? row.values : [];
        row.values = [...row.values, ...Array(DAYS_IN_MONTH).fill(0)].slice(0, DAYS_IN_MONTH);
      });
    });
  }

  st.deals = st.deals || { receber: [], pagar: [] };
  ["receber","pagar"].forEach(k=>{
    st.deals[k] = Array.isArray(st.deals[k]) ? st.deals[k] : [];
    st.deals[k].forEach(d=>{
      d.id = d.id ?? uid();
      d.title = d.title ?? "";
      d.person = d.person ?? "";
      d.currency = CURRENCIES.includes(d.currency) ? d.currency : "JPY";
      d.total = clampNum(d.total ?? 0);
      d.createdAt = d.createdAt ?? todayISO();
      d.payments = Array.isArray(d.payments) ? d.payments : [];
      d.payments.forEach(p=>{
        p.id = p.id ?? uid();
        p.date = p.date ?? todayISO();
        p.amount = clampNum(p.amount ?? 0); // na moeda do deal
      });
    });
  });

  st.settings.dayScale = clampNum(st.settings.dayScale || 1) || 1;
}

// ---------- fx ----------
function fxCacheKey(date){ return `${LS_KEY}__fx__${date}`; }

async function fetchFX(force=false){
  const today = new Date().toISOString().slice(0,10);
  const cachedRaw = localStorage.getItem(fxCacheKey(today));
  if(!force && cachedRaw){
    try{
      const cached = JSON.parse(cachedRaw);
      if(cached?.brl && cached?.usd){
        state.fx = cached;
        renderFX();
        return;
      }
    }catch{}
  }

  try{
    const url = `${FX_API}/latest?base=JPY&symbols=BRL,USD`;
    const res = await fetch(url);
    if(!res.ok) throw new Error("FX fail");
    const data = await res.json();

    state.fx = {
      base: "JPY",
      brl: data?.rates?.BRL ?? null,
      usd: data?.rates?.USD ?? null,
      date: data?.date ?? today,
      fetchedAt: Date.now()
    };

    localStorage.setItem(fxCacheKey(today), JSON.stringify(state.fx));
    save();
    renderFX();
  }catch{
    renderFX(true);
  }
}

function renderFX(error=false){
  const meta = $("#fxMeta");
  if(error) meta.textContent = "Falha ao buscar câmbio. Usando cache (se existir).";
  else meta.textContent = state.fx?.date ? `Atualizado: ${state.fx.date}` : "Sem dados ainda.";

  $("#rateBRL").textContent = state.fx?.brl ? state.fx.brl.toFixed(6) : "—";
  $("#rateUSD").textContent = state.fx?.usd ? state.fx.usd.toFixed(6) : "—";

  renderSavings();
}

// ---------- calc turnos ----------
function calcTurnValuePerDay(kind){
  const h = clampNum(state.settings.hourValue);
  const mult = clampNum(state.settings.overtimeMult || 1.25);
  const aNorm = clampNum(state.settings.aNormal);
  const aExt  = clampNum(state.settings.aExtra);
  const bNorm = clampNum(state.settings.bNormal);
  const bExt  = clampNum(state.settings.bExtra);

  return kind === "A" ? h * (aNorm + aExt * mult) : h * (bNorm + bExt * mult);
}

function calcIncomeTurnsJPY(){
  const daysA = clampNum(state.monthData.daysA);
  const daysB = clampNum(state.monthData.daysB);
  const bonus = clampNum(state.monthData.bonusJPY);

  const dayA = calcTurnValuePerDay("A");
  const dayB = calcTurnValuePerDay("B");

  return (daysA * dayA) + (daysB * dayB) + bonus;
}

// ---------- despesas ----------
function rowCost(row){
  if(row.useDaily){
    return row.values.reduce((a,v)=>a+clampNum(v),0);
  }
  return clampNum(row.monthly);
}

function sumExpenses(kind){
  const rows = state.monthData.expenses[kind] || [];
  return rows.reduce((acc, r)=> acc + rowCost(r), 0);
}

// ---------- deals ----------
function dealPaidTotal(deal){
  return (deal.payments || []).reduce((a,p)=> a + clampNum(p.amount), 0); // na moeda do deal
}
function dealRemaining(deal){
  return Math.max(0, clampNum(deal.total) - dealPaidTotal(deal)); // na moeda do deal
}
function dealPaymentsInMonthJPY(deal, month){
  return (deal.payments || []).reduce((a,p)=>{
    if(monthOf(p.date) !== month) return a;

    const j = toJPY(p.amount, deal.currency);
    if(j === null) return a; // sem FX -> ignora na soma do saldo
    return a + j;
  }, 0);
}
function dealRemainingJPY(deal){
  const rem = dealRemaining(deal);
  const j = toJPY(rem, deal.currency);
  return j === null ? null : j;
}

function monthReceivedPaid(month){
  const receivedJPY = (state.deals.receber || []).reduce((a,d)=> a + dealPaymentsInMonthJPY(d, month), 0);
  const paidJPY = (state.deals.pagar || []).reduce((a,d)=> a + dealPaymentsInMonthJPY(d, month), 0);
  return { receivedJPY, paidJPY };
}

// ---------- totals ----------
function calcTotals(){
  const month = state.month || new Date().toISOString().slice(0,7);

  const turns = calcIncomeTurnsJPY();
  const fixed = sumExpenses("fixed");
  const vari = sumExpenses("variable");

  const { receivedJPY, paidJPY } = monthReceivedPaid(month);

  const income = turns + receivedJPY;
  const expenses = fixed + vari + paidJPY;

  const balance = income - expenses;
  const sent = clampNum(state.monthData.sentJPY);
  const diff = balance - sent;

  return {
    income, turns,
    receivedJPY, paidJPY,
    fixed, vari, expenses,
    balance, sent, diff
  };
}

// ---------- expenses UI ----------
function renderExpenseLists(){
  renderExpenseList("fixed", "#listFixed");
  renderExpenseList("variable", "#listVar");
}

function renderExpenseList(kind, targetSel){
  const wrap = $(targetSel);
  wrap.innerHTML = "";

  const rows = state.monthData.expenses[kind];

  rows.forEach(row=>{
    const el = document.createElement("div");
    el.className = "exp-row";
    el.dataset.kind = kind;
    el.dataset.id = row.id;

    const total = rowCost(row);

    el.innerHTML = `
      <div class="exp-top">
        <input class="desc-input" data-field="desc" value="${escapeHTML(row.desc)}" placeholder="Ex: Aluguel" />
        <input class="money" data-field="monthly" type="number" inputmode="decimal" min="0" step="0.01"
               value="${row.monthly ?? 0}" ${row.useDaily ? "disabled" : ""} />
      </div>

      <div class="exp-actions">
        <div class="left">
          <button class="small-btn" type="button" data-action="toggleDaily">
            ${row.useDaily ? "Mensal" : "Dias"}
          </button>
          <span class="exp-mini">Total: <b>${formatJPY(total)}</b></span>
        </div>
        <button class="kill" type="button" data-action="remove" title="Remover">×</button>
      </div>

      <div class="days-panel ${row.useDaily ? "open" : ""}" data-panel="days">
        <div class="days-grid">
          ${Array.from({length:DAYS_IN_MONTH}, (_,i)=>`
            <div class="day-cell">
              <div class="day-label">Dia ${i+1}</div>
              <input class="day-input" type="number" inputmode="decimal" min="0" step="0.01"
                     data-field="day" data-day="${i}" value="${row.values[i] ?? 0}" />
            </div>
          `).join("")}
        </div>
      </div>
    `;

    wrap.appendChild(el);
  });
}

function findRow(kind, id){
  return (state.monthData.expenses[kind] || []).find(r=>r.id===id);
}

function addExpenseRow(kind){
  state.monthData.expenses[kind].push({
    id: uid(),
    desc: "",
    monthly: 0,
    values: Array(DAYS_IN_MONTH).fill(0),
    useDaily: false
  });
  renderExpenseLists();
  renderTotalsOnly();
  autosaveSoon();
  toast("Item adicionado ✅");
}

function removeExpenseRow(kind, id){
  state.monthData.expenses[kind] = state.monthData.expenses[kind].filter(r=>r.id!==id);
  renderExpenseLists();
  renderTotalsOnly();
  autosaveSoon();
  toast("Item removido ✅");
}

// ---------- deals UI ----------
function renderDeals(){
  renderDealList("receber", "#dealReceber");
  renderDealList("pagar", "#dealPagar");

  const month = state.month || new Date().toISOString().slice(0,7);
  const { receivedJPY, paidJPY } = monthReceivedPaid(month);

  $("#receivedMonthJPY").textContent = formatJPY(receivedJPY);
  $("#paidMonthJPY").textContent = formatJPY(paidJPY);
  $("#dealsNetJPY").textContent = formatJPY(receivedJPY - paidJPY);

  const remR = (state.deals.receber || []).reduce((a,d)=>{
    const j = dealRemainingJPY(d);
    return a + (j === null ? 0 : j);
  }, 0);

  const remP = (state.deals.pagar || []).reduce((a,d)=>{
    const j = dealRemainingJPY(d);
    return a + (j === null ? 0 : j);
  }, 0);

  $("#totalReceberRemaining").textContent = formatJPY(remR);
  $("#totalPagarRemaining").textContent = formatJPY(remP);
}

function renderDealList(kind, sel){
  const wrap = $(sel);
  wrap.innerHTML = "";

  const list = state.deals[kind] || [];

  if(list.length === 0){
    const empty = document.createElement("div");
    empty.className = "exp-row";
    empty.innerHTML = `<div class="deal-sub">Nenhum item. Use “+” para adicionar.</div>`;
    wrap.appendChild(empty);
    return;
  }

  list.forEach(deal=>{
    const paid = dealPaidTotal(deal);
    const rem = dealRemaining(deal);
    const pct = deal.total > 0 ? Math.min(100, Math.round((paid / deal.total) * 100)) : 0;

    const fxWarn = warnIfMissingFX(deal.currency);
    const remJPY = dealRemainingJPY(deal);

    const el = document.createElement("div");
    el.className = "deal-row";
    el.dataset.kind = kind;
    el.dataset.id = deal.id;

    el.innerHTML = `
      <div class="deal-top">
        <div class="deal-title">${escapeHTML((deal.title || "").trim() || "—")}</div>
        <div class="deal-sub">
          ${escapeHTML((deal.person || "").trim() || "Sem pessoa")} • criado em ${escapeHTML(deal.createdAt || "—")}
          • <span class="chip">Moeda: ${escapeHTML(CURRENCY_LABEL[deal.currency] || deal.currency)}</span>
          ${fxWarn ? `<span class="chip">⚠ sem câmbio</span>` : ""}
        </div>

        <div class="deal-metrics">
          <div class="metric">
            <span>Valor inicial</span>
            <strong>${escapeHTML(formatByCurrency(deal.total, deal.currency))}</strong>
          </div>
          <div class="metric">
            <span>Restante</span>
            <strong>${escapeHTML(formatByCurrency(rem, deal.currency))}</strong>
          </div>
        </div>

        <div class="deal-sub">
          Convertido (restante em JPY): <b>${remJPY === null ? "—" : formatJPY(remJPY)}</b>
        </div>

        <div class="progress" aria-label="Progresso">
          <i style="width:${pct}%"></i>
        </div>
      </div>

      <div class="deal-actions">
        <button class="small-btn" type="button" data-action="openPay">Registrar</button>
        <button class="kill" type="button" data-action="removeDeal" title="Remover">×</button>
      </div>
    `;

    wrap.appendChild(el);
  });
}

function pickCurrencyPrompt(){
  const raw = (prompt("Moeda do item? Digite: JPY, BRL ou USD", "JPY") || "JPY").trim().toUpperCase();
  if(!CURRENCIES.includes(raw)) return "JPY";
  return raw;
}

function addDeal(kind){
  const isReceber = kind === "receber";
  const title = prompt(isReceber ? "O que você vendeu? (ex: Armário)" : "O que você comprou? (ex: Carro)");
  if(title === null) return;

  const person = prompt(isReceber ? "Para quem foi vendido? (opcional)" : "De quem comprou? (opcional)") ?? "";
  const currency = pickCurrencyPrompt();

  if(warnIfMissingFX(currency)){
    toast("⚠ Sem câmbio carregado. Atualize o câmbio para converter no saldo.");
  }

  const totalStr = prompt(`Valor total da negociação (${currency})`);
  if(totalStr === null) return;

  const total = clampNum(totalStr);
  if(total <= 0){
    toast("Informe um valor válido.");
    return;
  }

  state.deals[kind].unshift({
    id: uid(),
    title: String(title || "").trim(),
    person: String(person || "").trim(),
    currency,
    total,
    createdAt: todayISO(),
    payments: []
  });

  save();
  renderDeals();
  renderTotalsOnly();
  toast(isReceber ? "Venda registrada ✅" : "Compra registrada ✅");
}

function removeDeal(kind, id){
  if(!confirm("Remover este item?")) return;
  state.deals[kind] = (state.deals[kind] || []).filter(d=>d.id !== id);
  save();
  renderDeals();
  renderTotalsOnly();
  toast("Removido ✅");
}

// ---------- deals sheet ----------
let activeDeal = null; // {kind, id}

function openDealSheet(kind, id){
  const deal = (state.deals[kind] || []).find(d=>d.id===id);
  if(!deal) return;

  activeDeal = { kind, id };

  $("#dealSheetTitle").textContent = kind === "receber" ? "Registrar recebimento" : "Registrar pagamento";
  $("#dealSheetSub").textContent = `${(deal.title || "—").toUpperCase()} • ${deal.person || "Sem pessoa"}`;

  $("#dealCurrency").textContent = CURRENCY_LABEL[deal.currency] || deal.currency;

  $("#payDate").value = todayISO();
  $("#payAmount").value = "";

  $("#payAmountLabel").textContent = `Valor (${deal.currency})`;
  $("#payAmountHint").textContent = deal.currency === "JPY"
    ? "Lançamento entra direto no saldo."
    : "Será convertido para JPY no saldo do mês (use câmbio atualizado).";

  refreshDealSheetUI(deal);
  renderPaymentsList(deal);

  document.body.classList.add("sheet-open");
  $("#dealOverlay").setAttribute("aria-hidden","false");
}

function closeDealSheet(){
  document.body.classList.remove("sheet-open");
  $("#dealOverlay").setAttribute("aria-hidden","true");
  activeDeal = null;
}

function refreshDealSheetUI(deal){
  const paid = dealPaidTotal(deal);
  const rem = dealRemaining(deal);
  const pct = deal.total > 0 ? Math.min(100, Math.round((paid / deal.total) * 100)) : 0;

  $("#dealRemaining").textContent = formatByCurrency(rem, deal.currency);

  const paidJPY = toJPY(paid, deal.currency);
  const remJPY = toJPY(rem, deal.currency);

  const extra = (paidJPY === null || remJPY === null)
    ? "Conversão para JPY indisponível (atualize o câmbio)."
    : `Convertido: pago ${formatJPY(paidJPY)} • restante ${formatJPY(remJPY)}`;

  $("#dealProgress").textContent = `Pago/Recebido: ${formatByCurrency(paid, deal.currency)} • Progresso: ${pct}% • ${extra}`;
}

function addPaymentToActiveDeal(){
  if(!activeDeal) return;

  const { kind, id } = activeDeal;
  const deal = (state.deals[kind] || []).find(d=>d.id===id);
  if(!deal) return;

  const date = $("#payDate").value || todayISO();
  const amount = clampNum($("#payAmount").value);

  if(amount <= 0){
    toast("Valor inválido.");
    return;
  }

  const rem = dealRemaining(deal);
  const finalAmount = Math.min(amount, rem);

  deal.payments.push({ id: uid(), date, amount: finalAmount });

  save();
  renderDeals();
  renderTotalsOnly();

  $("#payAmount").value = "";
  refreshDealSheetUI(deal);
  renderPaymentsList(deal);

  toast("Lançado ✅");
}

function renderPaymentsList(deal){
  const wrap = $("#paymentsList");
  wrap.innerHTML = "";

  const list = [...(deal.payments || [])].sort((a,b)=> (a.date > b.date ? -1 : 1));

  if(list.length === 0){
    wrap.innerHTML = `<div class="muted">Nenhum lançamento registrado ainda.</div>`;
    return;
  }

  list.forEach(p=>{
    const el = document.createElement("div");
    el.className = "pay-item";
    el.dataset.pid = p.id;

    const j = toJPY(p.amount, deal.currency);
    const jInfo = (j === null) ? "JPY: —" : `JPY: ${formatJPY(j)}`;

    el.innerHTML = `
      <div class="left">
        <b>${escapeHTML(formatByCurrency(p.amount, deal.currency))}</b>
        <span>${escapeHTML(p.date)} • ${escapeHTML(jInfo)}</span>
      </div>
      <button class="kill" type="button" data-action="removePay" title="Remover">×</button>
    `;

    wrap.appendChild(el);
  });
}

function removePayment(pid){
  if(!activeDeal) return;
  const { kind, id } = activeDeal;
  const deal = (state.deals[kind] || []).find(d=>d.id===id);
  if(!deal) return;

  if(!confirm("Remover este lançamento?")) return;

  deal.payments = (deal.payments || []).filter(p=>p.id !== pid);
  save();
  renderDeals();
  renderTotalsOnly();
  refreshDealSheetUI(deal);
  renderPaymentsList(deal);
  toast("Removido ✅");
}

// ---------- autosave suave ----------
let autosaveTimer = null;
let isTyping = false;

function autosaveSoon(){
  if(state.settings.autosave !== "on") return;
  if(isTyping) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(()=>{
    saveMonth();
    save();
  }, 350);
}

function bindTypingGuard(){
  document.addEventListener("focusin", (e)=>{
    if(e.target && (e.target.tagName==="INPUT" || e.target.tagName==="TEXTAREA")){
      isTyping = true;
    }
  });

  document.addEventListener("focusout", (e)=>{
    if(e.target && (e.target.tagName==="INPUT" || e.target.tagName==="TEXTAREA")){
      isTyping = false;
      autosaveSoon();
    }
  });
}

// ---------- render totals ----------
function renderTotalsOnly(){
  const t = calcTotals();

  $("#incomeJPY").textContent = formatJPY(t.income);
  $("#expensesJPY").textContent = formatJPY(t.expenses);
  $("#balanceJPY").textContent = formatJPY(t.balance);

  const dayA = calcTurnValuePerDay("A");
  const dayB = calcTurnValuePerDay("B");

  $("#incomeFormula").textContent =
    `Fórmula: A(${state.monthData.daysA}×${Math.round(dayA)}) + B(${state.monthData.daysB}×${Math.round(dayB)}) + bônus(${Math.round(state.monthData.bonusJPY)}) + recebidos(${Math.round(t.receivedJPY)})`;

  $("#totalFixed").textContent = formatJPY(t.fixed);
  $("#totalVar").textContent = formatJPY(t.vari);

  $("#kpiIncome").textContent = formatJPY(t.income);
  $("#kpiExpenses").textContent = formatJPY(t.expenses);
  $("#kpiBalance").textContent = formatJPY(t.balance);
  $("#kpiDiff").textContent = formatJPY(t.diff);

  renderDeals();
  saveMonth();
  save();
  renderReport();
}

function renderSavings(){
  const jpy = clampNum(state.monthData.savedJPY);
  const brlRate = state.fx?.brl;
  const usdRate = state.fx?.usd;

  const brl = brlRate ? jpy * brlRate : 0;
  const usd = usdRate ? jpy * usdRate : 0;

  $("#savedBRL").textContent = brlRate ? formatByCurrency(brl, "BRL") : "—";
  $("#savedUSD").textContent = usdRate ? formatByCurrency(usd, "USD") : "—";

  renderReport();
}

// ---------- PDF report ----------
function setKV(container, items){
  container.innerHTML = items.map(([k,v]) => `
    <div class="print-kv"><span>${escapeHTML(k)}</span><b>${escapeHTML(v)}</b></div>
  `).join("");
}

function setTable(table, rows){
  table.innerHTML = `
    <thead><tr><th>Descrição</th><th>Valor (JPY)</th></tr></thead>
    <tbody>
      ${rows.map(r=>`
        <tr>
          <td>${escapeHTML((r.desc||"").trim() || "—")}</td>
          <td>${escapeHTML(formatJPY(rowCost(r)))}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function renderReport(){
  const t = calcTotals();
  const month = state.month || new Date().toISOString().slice(0,7);

  setKV($("#printMeta"), [
    ["Mês", month],
    ["Nome", state.settings.name || "—"],
    ["Empresa", state.settings.company || "—"],
    ["Faixa", state.settings.rangeText || "—"],
    ["Valor/hora (JPY)", String(state.settings.hourValue || 0)],
    ["Hora extra (x)", String(state.settings.overtimeMult || 1.25)],
    ["Câmbio", state.fx?.date ? `JPY→BRL ${state.fx.brl?.toFixed(6) ?? "—"} | JPY→USD ${state.fx.usd?.toFixed(6) ?? "—"}` : "—"]
  ]);

  setKV($("#printIncome"), [
    ["Dias Turno A", String(state.monthData.daysA ?? 0)],
    ["Dias Turno B", String(state.monthData.daysB ?? 0)],
    ["Bônus (JPY)", formatJPY(state.monthData.bonusJPY ?? 0)],
    ["Receita de turnos (JPY)", formatJPY(t.turns)],
    ["Recebidos (mês) (JPY)", formatJPY(t.receivedJPY)],
    ["Receita total (JPY)", formatJPY(t.income)]
  ]);

  setKV($("#printDealsMonth"), [
    ["Recebidos no mês (JPY)", formatJPY(t.receivedJPY)],
    ["Pagos no mês (JPY)", formatJPY(t.paidJPY)],
    ["Líquido (JPY)", formatJPY(t.receivedJPY - t.paidJPY)]
  ]);

  setTable($("#printFixed"), state.monthData.expenses.fixed || []);
  setTable($("#printVar"), state.monthData.expenses.variable || []);

  setKV($("#printTotals"), [
    ["Despesas Fixas (JPY)", formatJPY(t.fixed)],
    ["Despesas Variáveis (JPY)", formatJPY(t.vari)],
    ["Pagos (mês) (JPY)", formatJPY(t.paidJPY)],
    ["Despesas totais (JPY)", formatJPY(t.expenses)],
    ["Saldo (JPY)", formatJPY(t.balance)],
    ["Enviado (JPY)", formatJPY(state.monthData.sentJPY ?? 0)],
    ["Diferença (JPY)", formatJPY(t.diff)]
  ]);

  const jpy = clampNum(state.monthData.savedJPY);
  const brl = state.fx?.brl ? jpy * state.fx.brl : 0;
  const usd = state.fx?.usd ? jpy * state.fx.usd : 0;

  setKV($("#printSavings"), [
    ["Economizado (JPY)", formatJPY(jpy)],
    ["Receita em Real (R$)", state.fx?.brl ? formatByCurrency(brl, "BRL") : "—"],
    ["Receita em Dólar ($)", state.fx?.usd ? formatByCurrency(usd, "USD") : "—"]
  ]);
}

// ---------- drawer ----------
function openDrawer(){
  document.body.classList.add("drawer-open");
  $("#drawerOverlay").setAttribute("aria-hidden","false");
  $("#btnBurger").setAttribute("aria-expanded","true");
}
function closeDrawer(){
  document.body.classList.remove("drawer-open");
  $("#drawerOverlay").setAttribute("aria-hidden","true");
  $("#btnBurger").setAttribute("aria-expanded","false");
}
function toggleDrawer(){
  if(document.body.classList.contains("drawer-open")) closeDrawer();
  else openDrawer();
}

// ---------- day scale ----------
function applyDayScale(){
  const s = clampNum(state.settings.dayScale || 1);
  const clamped = Math.max(0.9, Math.min(1.25, s));
  state.settings.dayScale = clamped;
  document.documentElement.style.setProperty("--dayScale", String(clamped));
  save();
}

function changeDayScale(delta){
  state.settings.dayScale = (clampNum(state.settings.dayScale) || 1) + delta;
  applyDayScale();
  toast(`Fonte da grade: ${(state.settings.dayScale*100).toFixed(0)}%`);
}

// ---------- bind UI ----------
function bindUI(){
  $("#btnBurger").addEventListener("click", toggleDrawer);
  $("#btnCloseDrawer").addEventListener("click", closeDrawer);
  $("#drawerOverlay").addEventListener("click", closeDrawer);

  document.querySelectorAll(".drawer-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const sel = btn.dataset.scroll;
      closeDrawer();
      if(sel) document.querySelector(sel)?.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  $("#btnFontDown").addEventListener("click", ()=>changeDayScale(-0.05));
  $("#btnFontUp").addEventListener("click", ()=>changeDayScale(0.05));

  $("#month").addEventListener("change", (e)=>{
    const m = e.target.value;
    state.month = m;

    const loaded = loadMonth(m);
    state.monthData = loaded ? loaded : defaultState().monthData;

    normalize(state);
    renderAll();
    save();
    toast("Mês carregado ✅");
  });

  const bindSetting = (id, key, parser=clampNum)=>{
    $(id).addEventListener("input", (e)=>{
      state.settings[key] = (parser===String) ? e.target.value : parser(e.target.value);
      renderTotalsOnly();
      autosaveSoon();
      save();
    });
  };

  bindSetting("#name","name", String);
  bindSetting("#company","company", String);
  bindSetting("#rangeText","rangeText", String);
  bindSetting("#hourValue","hourValue", clampNum);
  bindSetting("#overtimeMult","overtimeMult", clampNum);

  $("#autosave").addEventListener("change", (e)=>{
    state.settings.autosave = e.target.value;
    save();
    toast(`Auto-salvar: ${state.settings.autosave==="on" ? "ligado" : "desligado"}`);
  });

  bindSetting("#aNormal","aNormal", clampNum);
  bindSetting("#aExtra","aExtra", clampNum);
  bindSetting("#bNormal","bNormal", clampNum);
  bindSetting("#bExtra","bExtra", clampNum);

  const bindMonth = (id, key)=>{
    $(id).addEventListener("input", (e)=>{
      state.monthData[key] = clampNum(e.target.value);
      renderTotalsOnly();
      autosaveSoon();
    });
  };

  bindMonth("#daysA","daysA");
  bindMonth("#daysB","daysB");
  bindMonth("#bonusJPY","bonusJPY");
  bindMonth("#sentJPY","sentJPY");
  bindMonth("#savedJPY","savedJPY");

  document.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      addExpenseRow(btn.dataset.add);
    });
  });

  // Delegação nas despesas
  $("#secExpenses").addEventListener("input", (e)=>{
    const rowEl = e.target.closest(".exp-row");
    if(!rowEl) return;

    const kind = rowEl.dataset.kind;
    const id = rowEl.dataset.id;
    const row = findRow(kind, id);
    if(!row) return;

    const field = e.target.dataset.field;

    if(field === "desc"){
      row.desc = e.target.value;
      autosaveSoon();
      renderTotalsOnly();
      return;
    }

    if(field === "monthly"){
      row.monthly = clampNum(e.target.value);
      renderTotalsOnly();
      autosaveSoon();
      return;
    }

    if(field === "day"){
      const day = Number(e.target.dataset.day);
      row.values[day] = clampNum(e.target.value);
      renderTotalsOnly();
      autosaveSoon();
      return;
    }
  });

  $("#secExpenses").addEventListener("click", (e)=>{
    const rowEl = e.target.closest(".exp-row");
    if(!rowEl) return;

    const kind = rowEl.dataset.kind;
    const id = rowEl.dataset.id;
    const row = findRow(kind, id);
    if(!row) return;

    const action = e.target.dataset.action;
    if(!action) return;

    if(action === "remove"){
      removeExpenseRow(kind, id);
      return;
    }

    if(action === "toggleDaily"){
      row.useDaily = !row.useDaily;
      if(row.useDaily) row.monthly = 0;
      renderExpenseLists();
      renderTotalsOnly();
      autosaveSoon();
      return;
    }
  });

  // Deals add
  document.querySelectorAll("[data-deal-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      addDeal(btn.dataset.dealAdd);
    });
  });

  // Deals delegate
  $("#secDeals").addEventListener("click", (e)=>{
    const rowEl = e.target.closest(".deal-row");
    if(!rowEl) return;

    const kind = rowEl.dataset.kind;
    const id = rowEl.dataset.id;

    const action = e.target.dataset.action;
    if(!action) return;

    if(action === "removeDeal"){
      removeDeal(kind, id);
      return;
    }

    if(action === "openPay"){
      openDealSheet(kind, id);
      return;
    }
  });

  // deal sheet
  $("#dealOverlay").addEventListener("click", closeDealSheet);
  $("#btnCloseDealSheet").addEventListener("click", closeDealSheet);
  $("#btnAddPayment").addEventListener("click", addPaymentToActiveDeal);
  $("#btnFinishDeal").addEventListener("click", closeDealSheet);

  $("#paymentsList").addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-action='removePay']");
    if(!btn) return;
    const item = e.target.closest(".pay-item");
    if(!item) return;
    removePayment(item.dataset.pid);
  });

  $("#btnSave").addEventListener("click", ()=>{
    saveMonth();
    save();
    toast("Salvo ✅");
  });

  $("#btnClearMonth").addEventListener("click", ()=>{
    if(!state.month) return;
    if(!confirm("Limpar os dados deste mês?")) return;
    localStorage.removeItem(getMonthKey(state.month));
    state.monthData = defaultState().monthData;
    renderAll();
    autosaveSoon();
    toast("Mês limpo ✅");
  });

  $("#btnPDF").addEventListener("click", ()=>{
    renderReport();
    window.print();
  });

  $("#btnRefreshFX").addEventListener("click", ()=>fetchFX(true));
}

// ---------- render all ----------
function renderAll(){
  $("#month").value = state.month || new Date().toISOString().slice(0,7);

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

  applyDayScale();
  renderExpenseLists();
  renderDeals();
  renderTotalsOnly();
  renderFX();
  renderSavings();
  renderReport();
}

// ---------- init ----------
function init(){
  const current = new Date().toISOString().slice(0,7);
  state.month = state.month || current;

  const loaded = loadMonth(state.month);
  if(loaded) state.monthData = loaded;

  normalize(state);

  bindTypingGuard();
  bindUI();

  renderAll();
  fetchFX(false);
  save();
}

init();

