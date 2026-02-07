// app.js
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LS_KEY = "nakata_finance_v4";

  const monthsShort = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const monthsLong  = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const today = new Date();
  let ui = {
    view: "calendar",
    calMode: "year",
    year: today.getFullYear(),
    month: today.getMonth(),
    financeFilter: "all",
    financeMode: "entries", // entries | budget
    selectedDateISO: toISO(today),
  };

  const defaultState = () => ({
    settings: {
      displayCurrency: "JPY", // JPY | BRL
      fxJPYBRL: 0.033,        // 1 JPY = BRL
      rateNormal: 1200,
      rateExtra: 1500,
      autoCalc: true,
      shiftLabels: { A: "Dia", B: "Noite", C: "Madrugada" },
      shiftColors: { A: "#7c5cff", B: "#00c2ff", C: "#ffb020" },
      theme: "dark",
      fxLastUpdated: null
    },
    workEntries: {},
    financeEntries: [],
    investments: [],
    expenseTemplates: [],
    sales: [],   // NEW: contratos de venda parcelada
    reminders: [],
    patterns: { active: "AABBEE" }
  });

  let state = loadState();

  // ---------- Boot ----------
  applyTheme(state.settings.theme);
  applyShiftColors();
  renderCurrencyToggle();

  wireNav();
  wireTopbar();
  wireSheets();
  wireDrawer();
  renderAll();

  // ---------- State ----------
  function loadState(){
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      try{
        const parsed = JSON.parse(raw);
        return mergeWithDefault(parsed);
      }catch{
        return defaultState();
      }
    }

    // migration from older keys
    const oldKeys = ["nakata_finance_v3","nakata_finance_v2"];
    for(const k of oldKeys){
      const old = localStorage.getItem(k);
      if(!old) continue;
      try{
        const parsed = JSON.parse(old);
        const merged = mergeWithDefault(parsed);
        localStorage.setItem(LS_KEY, JSON.stringify(merged));
        return merged;
      }catch{}
    }

    return defaultState();
  }

  function mergeWithDefault(parsed){
    const def = defaultState();
    const merged = {
      ...def,
      ...parsed,
      settings: { ...def.settings, ...(parsed.settings||{}) },
      workEntries: parsed.workEntries || {},
      financeEntries: parsed.financeEntries || [],
      investments: parsed.investments || [],
      expenseTemplates: parsed.expenseTemplates || [],
      sales: parsed.sales || [],
      reminders: parsed.reminders || [],
      patterns: { ...def.patterns, ...(parsed.patterns||{}) }
    };

    // migration: settings.currency antigo -> displayCurrency
    if(parsed?.settings?.currency && !parsed?.settings?.displayCurrency){
      merged.settings.displayCurrency = parsed.settings.currency;
    }

    return merged;
  }

  function saveState(){
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  function resetState(){
    state = defaultState();
    saveState();
    applyTheme(state.settings.theme);
    applyShiftColors();
    renderCurrencyToggle();
    toast("Dados resetados.");
    renderAll();
  }

  // ---------- Helpers ----------
  function toISO(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }

  function fromISO(iso){
    const [y,m,d] = iso.split("-").map(Number);
    return new Date(y, m-1, d);
  }

  function clampNumber(v){
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  function sym(cur){
    return cur === "BRL" ? "R$" : "¥";
  }

  function moneyIn(cur, v){
    const n = Math.round(Number(v||0));
    return `${sym(cur)}${n.toLocaleString("pt-BR")}`;
  }

  function isSameMonth(iso, y, m){
    return iso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`);
  }

  function convert(amount, fromCur, toCur){
    const a = clampNumber(amount);
    if(fromCur === toCur) return a;

    const fx = clampNumber(state.settings.fxJPYBRL);
    if(!fx || fx <= 0) return a;

    if(fromCur === "JPY" && toCur === "BRL") return a * fx;
    if(fromCur === "BRL" && toCur === "JPY") return a / fx;

    return a;
  }

  function fxLabel(){
    const fx = clampNumber(state.settings.fxJPYBRL);
    return `Câmbio: 1¥ = R$${fx.toFixed(3)}`;
  }

  function normalizeText(s){
    return String(s||"")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  }

  function cryptoId(){
    return (crypto?.randomUUID?.() || `id_${Math.random().toString(16).slice(2)}_${Date.now()}`);
  }

  function escapeHTML(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function addMonths(date, n){
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setMonth(d.getMonth() + n);
    return d;
  }

  // ---------- UI Wiring ----------
  function wireNav(){
    $$(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => goView(btn.dataset.go));
    });
  }

  function wireTopbar(){
    $("#btnMenu").addEventListener("click", openDrawer);

    $("#btnTheme").addEventListener("click", () => {
      const next = (state.settings.theme === "dark") ? "light" : "dark";
      state.settings.theme = next;
      saveState();
      applyTheme(next);
      toast(next === "dark" ? "Tema escuro" : "Tema claro");
    });

    $("#btnCurrency").addEventListener("click", () => {
      state.settings.displayCurrency = (state.settings.displayCurrency === "JPY") ? "BRL" : "JPY";
      saveState();
      renderCurrencyToggle();
      toast(state.settings.displayCurrency === "JPY" ? "Visualizando em ¥" : "Visualizando em R$");
      renderAll();
    });

    $("#segYear").addEventListener("click", () => setCalMode("year"));
    $("#segMonth").addEventListener("click", () => setCalMode("month"));

    $("#btnPrevMonth").addEventListener("click", () => {
      ui.month -= 1;
      if(ui.month < 0){ ui.month = 11; ui.year -= 1; }
      renderCalendar();
    });
    $("#btnNextMonth").addEventListener("click", () => {
      ui.month += 1;
      if(ui.month > 11){ ui.month = 0; ui.year += 1; }
      renderCalendar();
    });

    // finance mode toggle
    $("#segFinEntries").addEventListener("click", () => setFinanceMode("entries"));
    $("#segFinBudget").addEventListener("click", () => setFinanceMode("budget"));

    // finance primary button (changes by mode)
    $("#btnFinancePrimary").addEventListener("click", () => {
      if(ui.financeMode === "budget"){
        openExpenseSheet();
        return;
      }
      openFinanceCreateChooser();
    });

    $("#btnFinancePDF").addEventListener("click", () => {
      printMonthPDF(ui.year, ui.month);
    });

    $("#btnAddInvest").addEventListener("click", () => openInvestSheet());

    // finance chips
    $$(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $$(".chip").forEach(c => {
          c.classList.toggle("chip-active", c === chip);
          c.setAttribute("aria-selected", c === chip ? "true" : "false");
        });
        ui.financeFilter = chip.dataset.finFilter;
        renderFinanceEntries();
      });
    });
  }

  function renderCurrencyToggle(){
    const cur = state.settings.displayCurrency;
    $("#currencyLabel").textContent = cur === "JPY" ? "¥" : "R$";
  }

  function wireSheets(){
    $$("[data-close-sheet]").forEach(el => {
      el.addEventListener("click", () => closeSheet(el.dataset.closeSheet));
    });

    // day sheet
    $("#btnDaySave").addEventListener("click", saveDayEntry);
    $("#btnDayClear").addEventListener("click", clearDayEntry);
    $("#btnDayDuplicate").addEventListener("click", duplicateDayEntry);

    // finance sheet
    $("#btnFinSave").addEventListener("click", saveFinanceEntry);

    // expense template sheet
    $("#btnExpSave").addEventListener("click", saveExpenseTemplate);

    // sale sheet
    $("#btnSaleSave").addEventListener("click", saveSaleContract);

    // invest sheet
    $("#btnInvSave").addEventListener("click", saveInvest);

    // modal close
    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => closeModal()));
  }

  function wireDrawer(){
    $("#btnCloseMenu").addEventListener("click", closeDrawer);
    $("#drawer").addEventListener("click", (e) => {
      if(e.target.id === "drawer") closeDrawer();
    });

    $$(".drawer-item[data-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const what = btn.dataset.open;
        closeDrawer();
        if(what === "settings") openSettingsModal();
        if(what === "patterns") openPatternsModal();
        if(what === "reminders") openRemindersModal();
      });
    });

    $("#btnReset").addEventListener("click", () => {
      closeDrawer();
      openConfirmModal(
        "Resetar dados",
        "Isso apaga os dados salvos localmente neste navegador.",
        () => resetState()
      );
    });
  }

  function goView(view){
    ui.view = view;
    $$(".view").forEach(v => v.classList.toggle("view-active", v.dataset.view === view));
    $$(".nav-item").forEach(n => n.classList.toggle("nav-active", n.dataset.go === view));

    const title = view === "calendar" ? "Calendário" : (view === "finance" ? "Financeiro" : "Investimentos");
    $("#appTitle").textContent = title;

    if(view === "calendar"){
      $("#appSubtitle").textContent = ui.calMode === "year" ? "Visão anual" : `${monthsLong[ui.month]} • ${ui.year}`;
    } else if(view === "finance"){
      $("#appSubtitle").textContent = `${monthsLong[ui.month]} • ${ui.year}`;
    } else {
      $("#appSubtitle").textContent = "Resumo rápido";
    }

    renderAll();
  }

  function setCalMode(mode){
    ui.calMode = mode;
    $("#segYear").classList.toggle("seg-active", mode === "year");
    $("#segMonth").classList.toggle("seg-active", mode === "month");
    $("#segYear").setAttribute("aria-pressed", mode === "year" ? "true" : "false");
    $("#segMonth").setAttribute("aria-pressed", mode === "month" ? "true" : "false");

    $("#yearGrid").classList.toggle("hidden", mode !== "year");
    $("#monthArea").classList.toggle("hidden", mode !== "month");
    $("#monthNav").style.display = (mode === "month") ? "flex" : "none";

    $("#appSubtitle").textContent = mode === "year" ? "Visão anual" : `${monthsLong[ui.month]} • ${ui.year}`;
    renderCalendar();
  }

  function setFinanceMode(mode){
    ui.financeMode = mode;

    $("#segFinEntries").classList.toggle("seg-active", mode === "entries");
    $("#segFinBudget").classList.toggle("seg-active", mode === "budget");
    $("#segFinEntries").setAttribute("aria-pressed", mode === "entries" ? "true" : "false");
    $("#segFinBudget").setAttribute("aria-pressed", mode === "budget" ? "true" : "false");

    $("#financeFiltersRow").classList.toggle("hidden", mode !== "entries");
    $("#financeEntriesWrap").classList.toggle("hidden", mode !== "entries");
    $("#financeBudgetWrap").classList.toggle("hidden", mode !== "budget");
    $("#budgetSummaryBar").classList.toggle("hidden", mode !== "budget");

    $("#financePrimaryLabel").textContent = (mode === "entries") ? "Novo" : "Adicionar";

    $("#finBigLabel").textContent = (mode === "entries") ? "Saldo do mês" : "Saldo real (mês)";
    $("#finInLabel").textContent = (mode === "entries") ? "Entradas" : "Pago";
    $("#finOutLabel").textContent = (mode === "entries") ? "Saídas" : "Planejado";

    renderFinance();
  }

  // ---------- Render ----------
  function renderAll(){
    $("#fxNoteFin").textContent = fxLabel();
    $("#fxNoteInv").textContent = fxLabel();
    renderCalendar();
    renderFinance();
    renderInvest();
  }

  function renderCalendar(){
    renderYearGrid();
    renderMonthGrid();
    renderMonthLabel();
    renderSummaryBar();
  }

  function renderMonthLabel(){
    $("#monthLabel").textContent = `${monthsShort[ui.month]} ${ui.year}`;
  }

  function renderYearGrid(){
    const grid = $("#yearGrid");
    grid.innerHTML = "";

    for(let m=0; m<12; m++){
      const stats = monthStats(ui.year, m);

      const card = document.createElement("button");
      card.className = "month-card";
      card.setAttribute("type", "button");

      const dotClass = (stats.daysWithRecords > 0) ? "dot" : "dot none";
      const dispCur = state.settings.displayCurrency;
      const incomeDisplay = convert(stats.estimatedIncomeJPY, "JPY", dispCur);

      card.innerHTML = `
        <div class="month-name">${monthsShort[m]}</div>
        <div class="month-meta">
          <span class="pill"><span class="${dotClass}"></span><span>${stats.daysWithRecords} dias</span></span>
          <span class="pill">${moneyIn(dispCur, incomeDisplay)}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        ui.month = m;
        setCalMode("month");
      });

      grid.appendChild(card);
    }
  }

  function renderMonthGrid(){
    const area = $("#monthGrid");
    area.innerHTML = "";
    if(ui.calMode !== "month") return;

    const first = new Date(ui.year, ui.month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(ui.year, ui.month+1, 0).getDate();
    const totalCells = 42;

    for(let i=0; i<totalCells; i++){
      const cell = document.createElement("div");
      const dayNum = (i - startDow) + 1;

      if(dayNum < 1 || dayNum > daysInMonth){
        cell.className = "day empty";
        cell.innerHTML = `<div class="day-top"><span class="day-num"> </span><span class="badge"></span></div>`;
        area.appendChild(cell);
        continue;
      }

      const dateISO = `${ui.year}-${String(ui.month+1).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
      const entry = state.workEntries[dateISO];
      const shift = entry?.shift || "";
      const normal = clampNumber(entry?.normal);
      const extra = clampNumber(entry?.extra);

      const badgeClass = shift ? `badge ${shift}` : "badge";
      const isToday = dateISO === toISO(new Date());

      cell.className = "day";
      cell.innerHTML = `
        <div class="day-top">
          <span class="day-num">${dayNum}${isToday ? " •" : ""}</span>
          <span class="${badgeClass}"></span>
        </div>
        <div class="day-mini">
          ${normal ? `<span class="chip-mini">N ${normal}h</span>` : ``}
          ${extra ? `<span class="chip-mini">E ${extra}h</span>` : ``}
        </div>
      `;

      cell.addEventListener("click", () => openDaySheet(dateISO));
      area.appendChild(cell);
    }
  }

  function renderSummaryBar(){
    const stats = monthStats(ui.year, ui.month);
    $("#sumNormal").textContent = `${stats.totalNormal}h`;
    $("#sumExtra").textContent = `${stats.totalExtra}h`;

    const dispCur = state.settings.displayCurrency;
    const incomeDisplay = convert(stats.estimatedIncomeJPY, "JPY", dispCur);
    $("#sumIncome").textContent = moneyIn(dispCur, incomeDisplay);

    const fin = financeMonthStats(ui.year, ui.month);
    $("#sumBalance").textContent = moneyIn(dispCur, fin.balanceDisplay);

    if(ui.view === "finance"){
      renderFinanceHeader(fin);
      renderFinanceProjections();
    }
  }

  function renderFinance(){
    if(ui.view !== "finance"){
      renderSummaryBar();
      return;
    }

    const fin = financeMonthStats(ui.year, ui.month);
    renderFinanceHeader(fin);
    renderFinanceProjections();

    if(ui.financeMode === "entries"){
      renderFinanceEntries();
    } else {
      renderFinanceBudget(fin);
    }
  }

  function renderFinanceHeader(fin){
    const dispCur = state.settings.displayCurrency;

    if(ui.financeMode === "entries"){
      $("#finMonthBalance").textContent = moneyIn(dispCur, fin.balanceDisplay);
      $("#finIn").textContent = moneyIn(dispCur, fin.inDisplay);
      $("#finOut").textContent = moneyIn(dispCur, fin.outDisplay);
      return;
    }

    const bud = budgetStats(ui.year, ui.month);
    $("#finMonthBalance").textContent = moneyIn(dispCur, fin.balanceDisplay);
    $("#finIn").textContent = moneyIn(dispCur, bud.paidTowardsPlannedDisplay);
    $("#finOut").textContent = moneyIn(dispCur, bud.plannedTotalDisplay);
  }

  function renderFinanceProjections(){
    const dispCur = state.settings.displayCurrency;

    const work = monthStats(ui.year, ui.month);
    const workIncomeDisplay = convert(work.estimatedIncomeJPY, "JPY", dispCur);

    const fin = financeMonthStats(ui.year, ui.month);

    // Entradas reais (sem empréstimo): recebimentos + recebimentos vindos de vendas (são "recv" também)
    const inNoLoan = fin.recvOnlyDisplay;
    const outNoLoan = fin.payOnlyDisplay;

    // Bruto real: salário estimado + recebimentos (sem empréstimo)
    const grossReal = workIncomeDisplay + inNoLoan;
    // Líquido real: bruto - pagamentos (sem empréstimo)
    const netReal = grossReal - outNoLoan;

    const bud = budgetStats(ui.year, ui.month);

    // Bruto previsto: igual ao real (salário estimado + recebimentos lançados)
    const grossForecast = grossReal;
    // Líquido previsto: líquido real - restante do planejado (fixas/variáveis ainda não pagas)
    const netForecast = netReal - bud.remainingDisplay;

    $("#projGrossReal").textContent = moneyIn(dispCur, grossReal);
    $("#projNetReal").textContent = moneyIn(dispCur, netReal);
    $("#projGrossForecast").textContent = moneyIn(dispCur, grossForecast);
    $("#projNetForecast").textContent = moneyIn(dispCur, netForecast);
  }

  function renderFinanceEntries(){
    const listWrap = $("#financeList");
    listWrap.innerHTML = `<div class="list" id="financeScroll"></div>`;
    const list = $("#financeScroll");

    const dispCur = state.settings.displayCurrency;

    // 1) Lançamentos financeiros (pag/recv/loans)
    let entries = state.financeEntries
      .filter(e => isSameMonth(e.dateISO, ui.year, ui.month))
      .filter(e => {
        if(ui.financeFilter === "all") return true;
        if(ui.financeFilter === "pay") return e.type === "pay";
        if(ui.financeFilter === "recv") return e.type === "recv";
        if(ui.financeFilter === "loan") return (e.type === "loan_in" || e.type === "loan_out");
        if(ui.financeFilter === "sales") return false;
        return true;
      })
      .sort((a,b) => (a.dateISO > b.dateISO ? -1 : 1));

    // 2) Contratos de venda (sempre disponíveis em qualquer mês, mas filtro "Vendas" mostra)
    const salesForView = state.sales
      .filter(s => ui.financeFilter === "sales" || ui.financeFilter === "all")
      .slice()
      .sort((a,b) => (a.createdAt > b.createdAt ? -1 : 1));

    const hasAnything = entries.length > 0 || salesForView.length > 0;
    $("#financeEmpty").classList.toggle("hidden", hasAnything);

    // Render contracts first when filter is sales
    if(ui.financeFilter === "sales"){
      for(const s of salesForView){
        list.appendChild(renderSaleCard(s, dispCur));
      }
      return;
    }

    // Render normal entries
    for(const e of entries){
      const isIn = (e.type === "recv" || e.type === "loan_in");
      const sign = isIn ? "+" : "-";
      const typeLabel =
        e.type === "pay" ? "Pagamento" :
        e.type === "recv" ? "Recebimento" :
        e.type === "loan_in" ? "Empréstimo (entrada)" : "Empréstimo (saída)";

      const statusLabel = e.status === "paid" ? "pago" : "pendente";
      const cur = e.currency || "JPY";

      const amountDisplay = convert(e.amount, cur, dispCur);
      const origText = (cur !== dispCur) ? `orig: ${moneyIn(cur, e.amount)}` : "";

      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML = `
        <div class="item-left">
          <div class="item-title">${escapeHTML(e.category || typeLabel)}</div>
          <div class="item-sub">${typeLabel} • ${e.dateISO} • ${statusLabel}${e.note ? " • " + escapeHTML(e.note) : ""}</div>
        </div>
        <div class="item-right">
          <div class="amount">${sign} ${moneyIn(dispCur, amountDisplay)}</div>
          <div class="tag ${isIn ? "good" : "bad"}">${isIn ? "entrada" : "saída"}</div>
          ${origText ? `<div class="tag orig">${origText}</div>` : ``}
        </div>
      `;

      el.addEventListener("click", () => {
        openConfirmModal(
          "Excluir lançamento?",
          `${typeLabel} • ${moneyIn(cur, e.amount)} • ${e.dateISO}`,
          () => {
            state.financeEntries = state.financeEntries.filter(x => x.id !== e.id);
            saveState();
            toast("Lançamento removido.");
            renderFinance();
            renderSummaryBar();
          }
        );
      });

      list.appendChild(el);
    }

    // Render sales after (compact cards)
    if(salesForView.length){
      const sep = document.createElement("div");
      sep.style.margin = "6px 2px 2px 2px";
      sep.style.color = "var(--muted)";
      sep.style.fontSize = "11px";
      sep.style.fontWeight = "850";
      sep.textContent = "Vendas / Recebimentos";
      list.appendChild(sep);

      for(const s of salesForView){
        list.appendChild(renderSaleCard(s, dispCur));
      }
    }
  }

  function renderSaleCard(sale, dispCur){
    const cur = sale.currency || "BRL";
    const totalDisp = convert(sale.total, cur, dispCur);

    const schedule = getSaleSchedule(sale);
    const paidCount = sale.paidInstallments || 0;
    const remainingCount = Math.max(sale.installments - paidCount, 0);

    const next = schedule.find(x => !x.paid);
    const nextText = next ? `${next.dueISO} (${moneyIn(cur, next.amount)})` : "Quitado ✅";

    const endISO = schedule.length ? schedule[schedule.length-1].dueISO : "—";

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item-left">
        <div class="item-title">${escapeHTML(sale.item)} • ${escapeHTML(sale.buyer)}</div>
        <div class="item-sub">Total ${moneyIn(cur, sale.total)} • ${sale.installments}x • termina em ${endISO}</div>
      </div>
      <div class="item-right">
        <div class="amount">${moneyIn(dispCur, totalDisp)}</div>
        <div class="tag sale">${paidCount}/${sale.installments} pago</div>
        <div class="tag">${nextText}</div>
      </div>
    `;

    el.addEventListener("click", () => openSaleActionsModal(sale.id));
    return el;
  }

  function openSaleActionsModal(saleId){
    const sale = state.sales.find(s => s.id === saleId);
    if(!sale){ toast("Venda não encontrada."); return; }

    const schedule = getSaleSchedule(sale);
    const next = schedule.find(x => !x.paid);

    const body = `
      <div class="field">
        <span>Venda</span>
        <div style="color:var(--muted); font-weight:850; line-height:1.35">
          <b>${escapeHTML(sale.item)}</b> • ${escapeHTML(sale.buyer)}<br>
          Total: ${moneyIn(sale.currency, sale.total)} • ${sale.installments}x<br>
          Próxima: ${next ? `${next.dueISO} (${moneyIn(sale.currency, next.amount)})` : "Quitado ✅"}
        </div>
      </div>

      <div class="field">
        <span>Opções</span>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="ghost-btn grow" id="btnSalePayNext">
            <i class="fa-solid fa-check"></i><span>Marcar próxima como paga</span>
          </button>
          <button class="ghost-btn grow" id="btnSalePDF">
            <i class="fa-regular fa-file-pdf"></i><span>PDF do contrato</span>
          </button>
        </div>
        <div style="margin-top:8px; display:flex; gap:8px;">
          <button class="ghost-btn grow" id="btnSaleDelete">
            <i class="fa-regular fa-trash-can"></i><span>Excluir venda</span>
          </button>
        </div>
      </div>
    `;

    openModal(
      "Venda / Recebimento",
      body,
      `
        <button class="primary-btn grow" data-close-modal="true">
          <i class="fa-solid fa-xmark"></i><span>Fechar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => closeModal()));

    $("#btnSalePDF").addEventListener("click", () => {
      closeModal();
      printSalePDF(saleId);
    });

    $("#btnSaleDelete").addEventListener("click", () => {
      closeModal();
      openConfirmModal("Excluir venda?", "Este contrato será removido.", () => {
        state.sales = state.sales.filter(s => s.id !== saleId);
        saveState();
        toast("Venda removida.");
        renderFinance();
      });
    });

    $("#btnSalePayNext").addEventListener("click", () => {
      if(!next){ toast("Já está quitado."); return; }

      // Apply late fee if paid after due date (simple: flat percentage over parcel value)
      const paidDate = new Date();
      const due = fromISO(next.dueISO);
      const late = paidDate > endOfDay(due);

      let receivedAmount = next.amount;
      if(late && clampNumber(sale.lateFeePct) > 0){
        receivedAmount = Math.round(receivedAmount * (1 + clampNumber(sale.lateFeePct)/100));
      }

      // Mark installment as paid
      sale.paidInstallments = (sale.paidInstallments || 0) + 1;

      // Create a Finance entry as "Recebimento" so it appears in month balance
      state.financeEntries.push({
        id: cryptoId(),
        type: "recv",
        status: "paid",
        currency: sale.currency,
        amount: receivedAmount,
        dateISO: toISO(paidDate),
        category: `Venda: ${sale.item}`,
        note: `Comprador: ${sale.buyer}${late ? ` • atraso (+${sale.lateFeePct}%)` : ""}`
      });

      saveState();
      toast("Parcela registrada como recebida.");
      closeModal();
      renderFinance();
      renderSummaryBar();
    });
  }

  function endOfDay(d){
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  function getSaleSchedule(sale){
    const total = clampNumber(sale.total);
    const installments = Math.max(1, Math.round(clampNumber(sale.installments)));
    const base = Math.floor(total / installments);
    let remainder = total - base * installments;

    const start = sale.startISO ? fromISO(sale.startISO) : new Date();
    const dueDay = Math.min(28, Math.max(1, Math.round(clampNumber(sale.dueDay || 10))));

    const paidCount = sale.paidInstallments || 0;

    const schedule = [];
    for(let i=0; i<installments; i++){
      const amount = base + (remainder > 0 ? 1 : 0);
      if(remainder > 0) remainder -= 1;

      const monthDate = addMonths(start, i);
      // set due day
      const due = new Date(monthDate.getFullYear(), monthDate.getMonth(), dueDay);
      const dueISO = toISO(due);

      schedule.push({
        index: i+1,
        dueISO,
        amount,
        paid: (i < paidCount)
      });
    }
    return schedule;
  }

  function renderFinanceBudget(){
    const dispCur = state.settings.displayCurrency;
    const bud = budgetStats(ui.year, ui.month);

    $("#budFixed").textContent = moneyIn(dispCur, bud.fixedTotalDisplay);
    $("#budVar").textContent = moneyIn(dispCur, bud.variableTotalDisplay);
    $("#budRemaining").textContent = moneyIn(dispCur, bud.remainingDisplay);
    $("#budForecast").textContent = moneyIn(dispCur, bud.forecastBalanceDisplay);

    const hasAny = state.expenseTemplates.length > 0;
    $("#budgetEmpty").classList.toggle("hidden", hasAny);

    const wrap = $("#budgetLists");
    wrap.innerHTML = "";
    if(!hasAny) return;

    renderExpenseGroup("Fixas", "fixed", bud.fixedTotalDisplay);
    renderExpenseGroup("Variáveis", "variable", bud.variableTotalDisplay);

    function renderExpenseGroup(title, type, totalDisplay){
      const group = state.expenseTemplates
        .filter(x => x.type === type)
        .slice()
        .sort((a,b) => (normalizeText(a.name) > normalizeText(b.name) ? 1 : -1));

      const header = document.createElement("div");
      header.className = "bud-header";
      header.innerHTML = `
        <div class="bud-title">${title}</div>
        <div class="bud-pill">${moneyIn(dispCur, totalDisplay)}</div>
      `;
      wrap.appendChild(header);

      if(group.length === 0){
        const empty = document.createElement("div");
        empty.className = "item";
        empty.innerHTML = `
          <div class="item-left">
            <div class="item-title" style="color:var(--muted); font-weight:850;">Sem ${title.toLowerCase()}</div>
            <div class="item-sub">Toque em “Adicionar” para criar</div>
          </div>
          <div class="item-right">
            <div class="tag">—</div>
          </div>
        `;
        wrap.appendChild(empty);
        return;
      }

      for(const it of group){
        const active = (it.active !== false);
        const cur = it.currency || "JPY";
        const amountDisplay = convert(it.amount, cur, dispCur);

        const meta = [
          it.dayOfMonth ? `dia ${it.dayOfMonth}` : null,
          active ? "ativa (todo mês)" : "inativa",
          it.note ? it.note : null
        ].filter(Boolean).join(" • ");

        const origText = (cur !== dispCur) ? `orig: ${moneyIn(cur, it.amount)}` : "";

        const el = document.createElement("div");
        el.className = "item";
        el.innerHTML = `
          <div class="item-left">
            <div class="item-title">${escapeHTML(it.name)}</div>
            <div class="item-sub">${escapeHTML(meta || "—")}</div>
          </div>
          <div class="item-right">
            <div class="amount">- ${moneyIn(dispCur, amountDisplay)}</div>
            ${origText ? `<div class="tag orig">${origText}</div>` : ``}
            <div class="tag">${active ? "conta no mês" : "fora do mês"}</div>
          </div>
        `;

        el.addEventListener("click", () => {
          openConfirmModal(
            "Remover despesa?",
            `${it.name} • ${moneyIn(cur, it.amount)}`,
            () => {
              state.expenseTemplates = state.expenseTemplates.filter(x => x.id !== it.id);
              saveState();
              toast("Despesa removida.");
              renderFinance();
            }
          );
        });

        wrap.appendChild(el);
      }
    }
  }

  function renderInvest(){
    const dispCur = state.settings.displayCurrency;

    const totalDisplay = state.investments.reduce((acc, it) => {
      const cur = it.currency || "JPY";
      return acc + convert(it.value, cur, dispCur);
    }, 0);

    const monthDepDisplay = state.investments.reduce((acc, it) => {
      const cur = it.currency || "JPY";
      return acc + convert(it.depositMonth, cur, dispCur);
    }, 0);

    const roiAvg = (() => {
      const vals = state.investments
        .map(it => clampNumber(it.roi))
        .filter(v => Number.isFinite(v));
      if(vals.length === 0) return 0;
      return vals.reduce((a,b) => a+b, 0) / vals.length;
    })();

    $("#invTotal").textContent = moneyIn(dispCur, totalDisplay);
    $("#invMonth").textContent = moneyIn(dispCur, monthDepDisplay);
    $("#invRoi").textContent = `${Math.round(roiAvg * 10) / 10}%`;

    const listWrap = $("#investList");
    listWrap.innerHTML = `<div class="list" id="investScroll"></div>`;
    const list = $("#investScroll");

    $("#investEmpty").classList.toggle("hidden", state.investments.length !== 0);
    if(state.investments.length === 0) return;

    for(const it of state.investments){
      const cur = it.currency || "JPY";
      const valueDisp = convert(it.value, cur, dispCur);
      const depDisp = convert(it.depositMonth, cur, dispCur);
      const origText = (cur !== dispCur) ? `orig: ${moneyIn(cur, it.value)}` : "";

      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML = `
        <div class="item-left">
          <div class="item-title">${escapeHTML(it.name)}</div>
          <div class="item-sub">Atual ${moneyIn(dispCur, valueDisp)} • Aporte ${moneyIn(dispCur, depDisp)}${it.note ? " • " + escapeHTML(it.note) : ""}</div>
        </div>
        <div class="item-right">
          <div class="amount">${moneyIn(dispCur, valueDisp)}</div>
          <div class="tag">${(clampNumber(it.roi) || 0)}%</div>
          ${origText ? `<div class="tag orig">${origText}</div>` : ``}
        </div>
      `;

      el.addEventListener("click", () => {
        openConfirmModal(
          "Excluir ativo?",
          `${it.name} • ${moneyIn(cur, it.value)}`,
          () => {
            state.investments = state.investments.filter(x => x.id !== it.id);
            saveState();
            toast("Ativo removido.");
            renderInvest();
          }
        );
      });

      list.appendChild(el);
    }
  }

  // ---------- Stats ----------
  function monthStats(y, m){
    let totalNormal = 0;
    let totalExtra = 0;
    let addon = 0;
    let daysWithRecords = 0;

    const prefix = `${y}-${String(m+1).padStart(2,"0")}-`;
    for(const [iso, entry] of Object.entries(state.workEntries)){
      if(!iso.startsWith(prefix)) continue;
      const n = clampNumber(entry.normal);
      const e = clampNumber(entry.extra);
      const a = clampNumber(entry.addon);
      if(n || e || a || entry.shift || entry.note) daysWithRecords++;
      totalNormal += n;
      totalExtra += e;
      addon += a;
    }

    const estimatedIncomeJPY = calcIncomeJPY(totalNormal, totalExtra) + addon;

    return {
      totalNormal: Math.round(totalNormal * 10)/10,
      totalExtra: Math.round(totalExtra * 10)/10,
      estimatedIncomeJPY,
      daysWithRecords
    };
  }

  function calcIncomeJPY(normalHours, extraHours){
    const s = state.settings;
    const normal = clampNumber(normalHours) * clampNumber(s.rateNormal);
    const extra = clampNumber(extraHours) * clampNumber(s.rateExtra);
    return normal + extra;
  }

  function financeMonthStats(y, m){
    const dispCur = state.settings.displayCurrency;

    let inDisplay = 0;
    let outDisplay = 0;

    let recvOnlyDisplay = 0; // without loans
    let payOnlyDisplay = 0;  // payments only

    for(const e of state.financeEntries){
      if(!isSameMonth(e.dateISO, y, m)) continue;
      const cur = e.currency || "JPY";
      const amtDisp = convert(e.amount, cur, dispCur);

      const isIn = (e.type === "recv" || e.type === "loan_in");
      if(isIn) inDisplay += amtDisp;
      else outDisplay += amtDisp;

      if(e.type === "recv") recvOnlyDisplay += amtDisp;
      if(e.type === "pay") payOnlyDisplay += amtDisp;
    }

    return {
      inDisplay,
      outDisplay,
      balanceDisplay: inDisplay - outDisplay,
      recvOnlyDisplay,
      payOnlyDisplay
    };
  }

  function budgetStats(y, m){
    const dispCur = state.settings.displayCurrency;

    const active = state.expenseTemplates.filter(x => x.active !== false);

    let fixedTotalDisplay = 0;
    let variableTotalDisplay = 0;

    for(const t of active){
      const cur = t.currency || "JPY";
      const amtDisp = convert(t.amount, cur, dispCur);
      if(t.type === "fixed") fixedTotalDisplay += amtDisp;
      else variableTotalDisplay += amtDisp;
    }

    const plannedTotalDisplay = fixedTotalDisplay + variableTotalDisplay;

    // "Pago" contra planejado: match simples por categoria == nome (pagamentos pagos)
    const templateNames = new Set(active.map(t => normalizeText(t.name)));
    let paidTowardsPlannedDisplay = 0;

    for(const e of state.financeEntries){
      if(!isSameMonth(e.dateISO, y, m)) continue;
      if(e.type !== "pay") continue;
      if(e.status !== "paid") continue;

      const cat = normalizeText(e.category || "");
      if(!cat) continue;

      if(templateNames.has(cat)){
        const cur = e.currency || "JPY";
        paidTowardsPlannedDisplay += convert(e.amount, cur, dispCur);
      }
    }

    const remainingDisplay = Math.max(plannedTotalDisplay - paidTowardsPlannedDisplay, 0);

    const fin = financeMonthStats(y, m);
    const forecastBalanceDisplay = fin.balanceDisplay - remainingDisplay;

    return {
      fixedTotalDisplay,
      variableTotalDisplay,
      plannedTotalDisplay,
      paidTowardsPlannedDisplay,
      remainingDisplay,
      forecastBalanceDisplay
    };
  }

  // ---------- Sheets / Modals ----------
  function openSheet(id){
    const el = $("#"+id);
    el.classList.add("show");
    el.setAttribute("aria-hidden", "false");
  }

  function closeSheet(id){
    const el = $("#"+id);
    el.classList.remove("show");
    el.setAttribute("aria-hidden", "true");
  }

  function openDaySheet(dateISO){
    ui.selectedDateISO = dateISO;
    $("#daySheetDate").textContent = dateISO;

    const entry = state.workEntries[dateISO] || {};
    $("#dayShift").value = entry.shift || "A";
    $("#dayStatus").value = entry.status || "work";
    $("#dayNormal").value = entry.normal ?? "";
    $("#dayExtra").value = entry.extra ?? "";
    $("#dayAddon").value = entry.addon ?? "";
    $("#dayNote").value = entry.note ?? "";

    openSheet("sheetDay");
  }

  function saveDayEntry(){
    const iso = ui.selectedDateISO;

    const shift = $("#dayShift").value;
    const status = $("#dayStatus").value;
    const normal = clampNumber($("#dayNormal").value);
    const extra = clampNumber($("#dayExtra").value);
    const addon = Math.round(clampNumber($("#dayAddon").value));
    const note = String($("#dayNote").value || "").trim();

    const isOff = (shift === "F" || status === "off");
    const entry = {
      shift,
      status: isOff ? "off" : "work",
      normal: isOff ? 0 : normal,
      extra: isOff ? 0 : extra,
      addon: isOff ? 0 : addon,
      note
    };

    const hasAny = entry.shift || entry.normal || entry.extra || entry.addon || entry.note;
    if(!hasAny){
      delete state.workEntries[iso];
    }else{
      state.workEntries[iso] = entry;
    }

    saveState();
    closeSheet("sheetDay");
    toast("Dia salvo.");
    renderCalendar();
    renderSummaryBar();
  }

  function clearDayEntry(){
    const iso = ui.selectedDateISO;
    delete state.workEntries[iso];
    saveState();
    closeSheet("sheetDay");
    toast("Dia limpo.");
    renderCalendar();
    renderSummaryBar();
  }

  function duplicateDayEntry(){
    const iso = ui.selectedDateISO;
    const entry = state.workEntries[iso];
    if(!entry){
      toast("Nada para duplicar.");
      return;
    }
    const d = fromISO(iso);
    d.setDate(d.getDate() + 1);
    const nextISO = toISO(d);
    state.workEntries[nextISO] = { ...entry };
    saveState();
    toast(`Duplicado para ${nextISO}.`);
    renderCalendar();
  }

  function openFinanceCreateChooser(){
    openModal(
      "Novo",
      `
        <div class="field">
          <span>O que você quer adicionar?</span>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="ghost-btn" id="btnCreateEntry">
              <i class="fa-solid fa-receipt"></i><span>Lançamento (pag/recv/empréstimo)</span>
            </button>
            <button class="ghost-btn" id="btnCreateSale">
              <i class="fa-solid fa-hand-holding-dollar"></i><span>Venda / Recebimento (parcelado)</span>
            </button>
          </div>
        </div>
      `,
      `
        <button class="primary-btn grow" data-close-modal="true">
          <i class="fa-solid fa-xmark"></i><span>Fechar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => closeModal()));

    $("#btnCreateEntry").addEventListener("click", () => {
      closeModal();
      openFinanceSheet();
    });

    $("#btnCreateSale").addEventListener("click", () => {
      closeModal();
      openSaleSheet();
    });
  }

  function openFinanceSheet(){
    $("#finType").value = "pay";
    $("#finStatus").value = "paid";
    $("#finCurrency").value = state.settings.displayCurrency;
    $("#finAmount").value = "";
    $("#finCategory").value = "";
    $("#finNote").value = "";
    $("#finDate").value = toISO(new Date(ui.year, ui.month, today.getDate()));
    openSheet("sheetFinance");
  }

  function saveFinanceEntry(){
    const type = $("#finType").value;
    const status = $("#finStatus").value;
    const currency = $("#finCurrency").value;
    const amount = Math.round(clampNumber($("#finAmount").value));
    const dateISO = $("#finDate").value || toISO(new Date());
    const category = String($("#finCategory").value || "").trim();
    const note = String($("#finNote").value || "").trim();

    if(!amount || amount <= 0){
      toast("Informe um valor válido.");
      return;
    }

    const entry = {
      id: cryptoId(),
      type,
      status,
      currency,
      amount,
      dateISO,
      category,
      note
    };

    state.financeEntries.push(entry);
    saveState();
    closeSheet("sheetFinance");
    toast("Lançamento salvo.");
    renderFinance();
    renderSummaryBar();
  }

  function openExpenseSheet(presetType = "fixed"){
    $("#expType").value = presetType;
    $("#expCurrency").value = state.settings.displayCurrency;
    $("#expName").value = "";
    $("#expAmount").value = "";
    $("#expDay").value = "";
    $("#expActive").value = "true";
    $("#expNote").value = "";
    openSheet("sheetExpense");
  }

  function saveExpenseTemplate(){
    const type = $("#expType").value; // fixed|variable
    const currency = $("#expCurrency").value;
    const name = String($("#expName").value || "").trim();
    const amount = Math.round(clampNumber($("#expAmount").value));
    const dayOfMonth = Math.round(clampNumber($("#expDay").value));
    const active = $("#expActive").value === "true";
    const note = String($("#expNote").value || "").trim();

    if(!name){
      toast("Informe o nome da despesa.");
      return;
    }
    if(!amount || amount <= 0){
      toast("Informe um valor válido.");
      return;
    }
    if(dayOfMonth && (dayOfMonth < 1 || dayOfMonth > 31)){
      toast("Dia do mês inválido (1–31).");
      return;
    }

    state.expenseTemplates.push({
      id: cryptoId(),
      type,
      currency,
      name,
      amount,
      dayOfMonth: dayOfMonth || null,
      active,
      note
    });

    saveState();
    closeSheet("sheetExpense");
    toast("Despesa salva (vale todo mês).");
    renderFinance();
  }

  function openSaleSheet(){
    $("#saleCurrency").value = "BRL";
    $("#saleTotal").value = "";
    $("#saleItem").value = "";
    $("#saleBuyer").value = "";
    $("#saleStart").value = toISO(new Date());
    $("#saleDueDay").value = "10";
    $("#saleInstallments").value = "5";
    $("#saleLateFeePct").value = "0";
    $("#saleNote").value = "";
    openSheet("sheetSale");
  }

  function saveSaleContract(){
    const currency = $("#saleCurrency").value;
    const total = Math.round(clampNumber($("#saleTotal").value));
    const item = String($("#saleItem").value || "").trim();
    const buyer = String($("#saleBuyer").value || "").trim();
    const startISO = $("#saleStart").value || toISO(new Date());
    const dueDay = Math.round(clampNumber($("#saleDueDay").value));
    const installments = Math.round(clampNumber($("#saleInstallments").value));
    const lateFeePct = clampNumber($("#saleLateFeePct").value);
    const note = String($("#saleNote").value || "").trim();

    if(!item || !buyer){
      toast("Informe item e comprador.");
      return;
    }
    if(!total || total <= 0){
      toast("Informe um total válido.");
      return;
    }
    if(!installments || installments < 1 || installments > 120){
      toast("Parcelas inválidas (1–120).");
      return;
    }
    if(!dueDay || dueDay < 1 || dueDay > 28){
      toast("Dia de vencimento inválido (1–28).");
      return;
    }

    state.sales.push({
      id: cryptoId(),
      currency,
      total,
      item,
      buyer,
      startISO,
      dueDay,
      installments,
      lateFeePct: Math.max(0, lateFeePct),
      paidInstallments: 0,
      note,
      createdAt: new Date().toISOString()
    });

    saveState();
    closeSheet("sheetSale");
    toast("Venda cadastrada.");
    renderFinance();
  }

  function openInvestSheet(){
    $("#invCurrency").value = state.settings.displayCurrency;
    $("#invName").value = "";
    $("#invValue").value = "";
    $("#invDeposit").value = "";
    $("#invRoi").value = "";
    $("#invNote").value = "";
    openSheet("sheetInvest");
  }

  function saveInvest(){
    const currency = $("#invCurrency").value;
    const name = String($("#invName").value || "").trim();
    const value = Math.round(clampNumber($("#invValue").value));
    const depositMonth = Math.round(clampNumber($("#invDeposit").value));
    const roi = clampNumber($("#invRoi").value);
    const note = String($("#invNote").value || "").trim();

    if(!name){
      toast("Informe o nome do ativo.");
      return;
    }

    state.investments.push({
      id: cryptoId(),
      currency,
      name,
      value: value || 0,
      depositMonth: depositMonth || 0,
      roi: Number.isFinite(roi) ? roi : 0,
      note
    });

    saveState();
    closeSheet("sheetInvest");
    toast("Ativo salvo.");
    renderInvest();
  }

  // ---------- Drawer ----------
  function openDrawer(){
    $("#drawer").classList.add("show");
    $("#drawer").setAttribute("aria-hidden", "false");
  }
  function closeDrawer(){
    $("#drawer").classList.remove("show");
    $("#drawer").setAttribute("aria-hidden", "true");
  }

  // ---------- Modal ----------
  function openModal(title, bodyHTML, actionsHTML){
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = bodyHTML;
    $("#modalActions").innerHTML = actionsHTML || "";
    $("#modal").classList.add("show");
    $("#modal").setAttribute("aria-hidden", "false");
  }
  function closeModal(){
    $("#modal").classList.remove("show");
    $("#modal").setAttribute("aria-hidden", "true");
  }

  function openConfirmModal(title, text, onConfirm){
    openModal(
      title,
      `<div class="field">
         <span>Confirmação</span>
         <div style="color:var(--muted); font-weight:750; line-height:1.35">${escapeHTML(text)}</div>
       </div>`,
      `
        <button class="ghost-btn grow" data-close-modal="true">
          <i class="fa-regular fa-circle-xmark"></i><span>Cancelar</span>
        </button>
        <button class="primary-btn grow" id="btnConfirmOk">
          <i class="fa-solid fa-check"></i><span>Confirmar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => closeModal()));
    $("#btnConfirmOk").addEventListener("click", () => {
      closeModal();
      onConfirm?.();
    });
  }

  // Settings modal includes FX update
  function openSettingsModal(){
    const s = state.settings;

    openModal(
      "Configurações",
      `
      <div class="grid2">
        <label class="field">
          <span>Moeda de visualização</span>
          <select id="setDisplayCurrency">
            <option value="JPY" ${s.displayCurrency==="JPY"?"selected":""}>¥ (JPY)</option>
            <option value="BRL" ${s.displayCurrency==="BRL"?"selected":""}>R$ (BRL)</option>
          </select>
        </label>

        <label class="field">
          <span>Câmbio (1 ¥ = R$)</span>
          <input id="setFx" inputmode="decimal" value="${String(s.fxJPYBRL)}">
        </label>
      </div>

      <div class="grid2">
        <label class="field">
          <span>¥/h normal</span>
          <input id="setRateNormal" inputmode="numeric" value="${s.rateNormal}">
        </label>
        <label class="field">
          <span>¥/h extra</span>
          <input id="setRateExtra" inputmode="numeric" value="${s.rateExtra}">
        </label>
      </div>

      <label class="field">
        <span>Auto calcular ganhos do mês</span>
        <select id="setAutoCalc">
          <option value="true" ${s.autoCalc ? "selected":""}>Ligado</option>
          <option value="false" ${!s.autoCalc ? "selected":""}>Desligado</option>
        </select>
      </label>

      <div class="grid2">
        <label class="field">
          <span>Cor turno A (Dia)</span>
          <input id="setShiftA" value="${s.shiftColors.A}">
        </label>
        <label class="field">
          <span>Cor turno B (Noite)</span>
          <input id="setShiftB" value="${s.shiftColors.B}">
        </label>
      </div>

      <label class="field">
        <span>Cor turno C (Madrugada)</span>
        <input id="setShiftC" value="${s.shiftColors.C}">
      </label>

      <div class="field">
        <span>Atualizar câmbio (online)</span>
        <div style="display:flex; gap:8px;">
          <button class="ghost-btn grow" id="btnUpdateFx">
            <i class="fa-solid fa-rotate"></i><span>Atualizar</span>
          </button>
          <div style="flex:1; color:var(--muted); font-weight:750; font-size:11px; line-height:1.35; display:flex; align-items:center;">
            Se falhar, continua usando o valor manual.
          </div>
        </div>
        <div style="margin-top:6px; color:var(--muted); font-weight:750; font-size:11px;">
          Última atualização: ${s.fxLastUpdated ? escapeHTML(s.fxLastUpdated) : "—"}
        </div>
      </div>
      `,
      `
        <button class="ghost-btn grow" data-close-modal="true">
          <i class="fa-regular fa-circle-xmark"></i><span>Cancelar</span>
        </button>
        <button class="primary-btn grow" id="btnSaveSettings">
          <i class="fa-regular fa-floppy-disk"></i><span>Salvar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => closeModal()));

    $("#btnUpdateFx").addEventListener("click", async () => {
      toast("Buscando câmbio...");
      const fx = await fetchFxJPYBRL();
      if(fx && fx > 0){
        $("#setFx").value = String(fx.toFixed(4));
        toast(`Câmbio atualizado: 1¥=R$${fx.toFixed(3)}`);
      }else{
        toast("Não consegui atualizar. Usando câmbio manual.");
      }
    });

    $("#btnSaveSettings").addEventListener("click", () => {
      state.settings.displayCurrency = $("#setDisplayCurrency").value;

      const fx = clampNumber($("#setFx").value);
      if(fx > 0) state.settings.fxJPYBRL = fx;

      state.settings.rateNormal = Math.round(clampNumber($("#setRateNormal").value));
      state.settings.rateExtra = Math.round(clampNumber($("#setRateExtra").value));
      state.settings.autoCalc = $("#setAutoCalc").value === "true";

      state.settings.shiftColors.A = String($("#setShiftA").value || "#7c5cff").trim();
      state.settings.shiftColors.B = String($("#setShiftB").value || "#00c2ff").trim();
      state.settings.shiftColors.C = String($("#setShiftC").value || "#ffb020").trim();

      saveState();
      applyShiftColors();
      renderCurrencyToggle();
      closeModal();
      toast("Configurações salvas.");
      renderAll();
    });
  }

  async function fetchFxJPYBRL(){
    try{
      let r = await fetch("https://api.frankfurter.app/latest?from=JPY&to=BRL", { cache: "no-store" });
      if(r.ok){
        const j = await r.json();
        const fx = j?.rates?.BRL;
        if(Number.isFinite(fx)) {
          state.settings.fxLastUpdated = new Date().toISOString();
          saveState();
          return fx;
        }
      }
    }catch{}
    try{
      let r = await fetch("https://api.exchangerate.host/latest?base=JPY&symbols=BRL", { cache: "no-store" });
      if(r.ok){
        const j = await r.json();
        const fx = j?.rates?.BRL;
        if(Number.isFinite(fx)) {
          state.settings.fxLastUpdated = new Date().toISOString();
          saveState();
          return fx;
        }
      }
    }catch{}
    return null;
  }

  // --------- PATTERNS (mantido) ---------
  function openPatternsModal(){
    const currentRaw = state.patterns.active || "AABBEE";
    const normalized = normalizePattern(currentRaw).pattern || "AABBEE";
    const preview = patternPreview(normalized, 14);

    openModal(
      "Padrões de escala",
      `
      <div class="field">
        <span>Como funciona (bem simples)</span>
        <div style="color:var(--muted); font-weight:750; line-height:1.35">
          Você cria uma sequência e o app repete essa sequência nos dias do mês.
          <br><br>
          <b>A</b>=Dia • <b>B</b>=Noite • <b>C</b>=Madrugada • <b>E</b> ou <b>-</b>=Folga
        </div>
      </div>

      <label class="field">
        <span>Padrão ativo (ex.: AABBEE)</span>
        <input id="patActive" value="${escapeHTML(currentRaw)}" />
      </label>

      <div class="field">
        <span>Prévia (primeiros dias)</span>
        <div id="patPreview" style="color:var(--muted); font-weight:800; line-height:1.4">
          ${escapeHTML(preview)}
        </div>
      </div>

      <div class="field">
        <span>Aplicar ao mês atual</span>
        <div style="color:var(--muted); font-weight:750; line-height:1.35">
          Isso preenche o mês com padrão repetido. Depois você ajusta tocando nos dias.
        </div>
      </div>
      `,
      `
        <button class="ghost-btn grow" data-close-modal="true">
          <i class="fa-regular fa-circle-xmark"></i><span>Fechar</span>
        </button>
        <button class="primary-btn grow" id="btnApplyPattern">
          <i class="fa-solid fa-wand-magic-sparkles"></i><span>Aplicar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => closeModal()));

    $("#patActive").addEventListener("input", () => {
      const raw = $("#patActive").value;
      const res = normalizePattern(raw);
      const out = res.ok ? patternPreview(res.pattern, 14) : `⚠️ ${res.error}`;
      $("#patPreview").textContent = out;
    });

    $("#btnApplyPattern").addEventListener("click", () => {
      const raw = String($("#patActive").value || "").trim();
      const res = normalizePattern(raw);
      if(!res.ok){ toast(res.error); return; }

      state.patterns.active = res.pattern;
      applyPatternToMonth(ui.year, ui.month, res.pattern);
      saveState();
      closeModal();
      toast("Padrão aplicado ao mês.");
      renderCalendar();
      renderSummaryBar();
    });
  }

  function normalizePattern(raw){
    let s = String(raw || "").trim();
    if(!s) return { ok:false, error:"Digite um padrão (ex.: AABBEE)." };

    s = s
      .toUpperCase()
      .replaceAll("FOLGA", "E")
      .replaceAll("OFF", "E")
      .replaceAll("_", "")
      .replaceAll(" ", "")
      .replaceAll(",", "")
      .replaceAll(";", "")
      .replaceAll("/", "")
      .replaceAll("\\", "")
      .replaceAll(".", "")
      .replaceAll("|", "")
      .replaceAll("—", "-");

    s = s.replaceAll("-", "E");

    if(!/^[ABCE]+$/.test(s)){
      return { ok:false, error:"Use apenas A, B, C e E (folga)." };
    }
    if(s.length < 2) return { ok:false, error:"Padrão muito curto." };

    return { ok:true, pattern:s };
  }

  function patternPreview(pat, count){
    const labels = { A:"A", B:"B", C:"C", E:"Folga" };
    const arr = [];
    for(let i=0; i<count; i++){
      const ch = pat[i % pat.length];
      arr.push(labels[ch] || ch);
    }
    return arr.join(" ");
  }

  function applyPatternToMonth(y, m, pat){
    const daysInMonth = new Date(y, m+1, 0).getDate();
    for(let d=1; d<=daysInMonth; d++){
      const iso = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const ch = pat[(d-1) % pat.length];

      if(ch === "E"){
        state.workEntries[iso] = { shift:"F", status:"off", normal:0, extra:0, addon:0, note:"" };
      }else{
        state.workEntries[iso] = { shift: ch, status:"work", normal:8, extra:0, addon:0, note:"" };
      }
    }
  }

  // ---------- Reminders (mantido) ----------
  function openRemindersModal(){
    const items = state.reminders
      .slice()
      .sort((a,b) => a.dateISO > b.dateISO ? 1 : -1)
      .map(r => `
        <div class="item" data-rem="${r.id}">
          <div class="item-left">
            <div class="item-title">${escapeHTML(r.title)}</div>
            <div class="item-sub">${r.dateISO} • ${r.importance} • som: ${r.sound ? "on" : "off"}</div>
          </div>
          <div class="item-right">
            <div class="tag">${r.importance}</div>
          </div>
        </div>
      `).join("");

    openModal(
      "Lembretes & aniversários",
      `
      <div class="grid2">
        <label class="field">
          <span>Data</span>
          <input id="remDate" type="date" />
        </label>
        <label class="field">
          <span>Importância</span>
          <select id="remImp">
            <option value="low">baixa</option>
            <option value="med" selected>média</option>
            <option value="high">alta</option>
          </select>
        </label>
      </div>

      <label class="field">
        <span>Título</span>
        <input id="remTitle" placeholder="ex: Aniversário da mãe" />
      </label>

      <label class="field">
        <span>Lembrete sonoro</span>
        <select id="remSound">
          <option value="true" selected>Ligado</option>
          <option value="false">Desligado</option>
        </select>
      </label>

      <div class="field">
        <span>Lista (toque para excluir)</span>
        <div class="list" style="max-height: 220px; overflow:auto; padding-right:4px;">
          ${items || `<div style="color:var(--muted); font-weight:750; padding:10px;">Sem lembretes ainda.</div>`}
        </div>
      </div>
      `,
      `
        <button class="ghost-btn grow" data-close-modal="true">
          <i class="fa-regular fa-circle-xmark"></i><span>Fechar</span>
        </button>
        <button class="primary-btn grow" id="btnAddRem">
          <i class="fa-solid fa-plus"></i><span>Adicionar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach(el => el.addEventListener("click", () => closeModal()));

    $("#btnAddRem").addEventListener("click", () => {
      const dateISO = $("#remDate").value;
      const title = String($("#remTitle").value || "").trim();
      const importance = $("#remImp").value;
      const sound = $("#remSound").value === "true";
      if(!dateISO || !title){
        toast("Informe data e título.");
        return;
      }
      state.reminders.push({ id: cryptoId(), dateISO, title, importance, sound });
      saveState();
      toast("Lembrete adicionado.");
      closeModal();
      openRemindersModal();
    });

    $$(".item[data-rem]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-rem");
        openConfirmModal("Excluir lembrete?", "Este lembrete será removido.", () => {
          state.reminders = state.reminders.filter(r => r.id !== id);
          saveState();
          toast("Lembrete removido.");
          closeModal();
          openRemindersModal();
        });
      });
    });
  }

  // ---------- PDF (print-to-PDF) ----------
  function printMonthPDF(y, m){
    const dispCur = state.settings.displayCurrency;

    const work = monthStats(y, m);
    const fin = financeMonthStats(y, m);
    const bud = budgetStats(y, m);

    const workIncome = convert(work.estimatedIncomeJPY, "JPY", dispCur);

    const grossReal = workIncome + fin.recvOnlyDisplay;
    const netReal = grossReal - fin.payOnlyDisplay;
    const netForecast = netReal - bud.remainingDisplay;

    const title = `Resumo do mês • ${monthsLong[m]} ${y}`;

    const html = `
      <html><head><meta charset="utf-8">
      <title>${escapeHTML(title)}</title>
      <style>
        body{font-family: Arial, sans-serif; padding:18px; color:#111;}
        h1{font-size:18px; margin:0 0 8px 0;}
        .muted{color:#555; font-size:12px;}
        .grid{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;}
        .card{border:1px solid #ddd; border-radius:10px; padding:10px;}
        .k{font-size:11px; color:#666;}
        .v{font-size:16px; font-weight:800; margin-top:6px;}
        table{width:100%; border-collapse:collapse; margin-top:12px;}
        th,td{border:1px solid #ddd; padding:8px; font-size:12px;}
        th{background:#f4f4f4; text-align:left;}
      </style></head><body>
        <h1>${escapeHTML(title)}</h1>
        <div class="muted">Moeda: ${dispCur} • ${escapeHTML(fxLabel())}</div>

        <div class="grid">
          <div class="card"><div class="k">Horas normais</div><div class="v">${work.totalNormal}h</div></div>
          <div class="card"><div class="k">Horas extras</div><div class="v">${work.totalExtra}h</div></div>
          <div class="card"><div class="k">Bruto (real)</div><div class="v">${moneyIn(dispCur, grossReal)}</div></div>
          <div class="card"><div class="k">Líquido (prev.)</div><div class="v">${moneyIn(dispCur, netForecast)}</div></div>
        </div>

        <table>
          <tr><th>Item</th><th>Valor</th></tr>
          <tr><td>Ganho do trabalho (estimado)</td><td>${moneyIn(dispCur, workIncome)}</td></tr>
          <tr><td>Recebimentos (sem empréstimos)</td><td>${moneyIn(dispCur, fin.recvOnlyDisplay)}</td></tr>
          <tr><td>Pagamentos (sem empréstimos)</td><td>${moneyIn(dispCur, fin.payOnlyDisplay)}</td></tr>
          <tr><td>Fixas planejadas</td><td>${moneyIn(dispCur, bud.fixedTotalDisplay)}</td></tr>
          <tr><td>Variáveis planejadas</td><td>${moneyIn(dispCur, bud.variableTotalDisplay)}</td></tr>
          <tr><td>Restante do planejado</td><td>${moneyIn(dispCur, bud.remainingDisplay)}</td></tr>
          <tr><td>Líquido (real)</td><td>${moneyIn(dispCur, netReal)}</td></tr>
          <tr><td>Líquido (previsto)</td><td>${moneyIn(dispCur, netForecast)}</td></tr>
        </table>

        <div class="muted" style="margin-top:12px;">
          Dica: no celular, use “Compartilhar / Salvar como PDF” depois de imprimir.
        </div>
      </body></html>
    `;

    const w = window.open("", "_blank");
    if(!w){ toast("Bloqueado pelo navegador. Permita pop-ups."); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  function printSalePDF(saleId){
    const sale = state.sales.find(s => s.id === saleId);
    if(!sale){ toast("Venda não encontrada."); return; }

    const schedule = getSaleSchedule(sale);
    const endISO = schedule.length ? schedule[schedule.length-1].dueISO : "—";

    const rows = schedule.map(x => `
      <tr>
        <td>${x.index}/${sale.installments}</td>
        <td>${x.dueISO}</td>
        <td>${moneyIn(sale.currency, x.amount)}</td>
        <td>${x.paid ? "Pago" : "Pendente"}</td>
      </tr>
    `).join("");

    const title = `Contrato de venda • ${sale.item} • ${sale.buyer}`;

    const html = `
      <html><head><meta charset="utf-8">
      <title>${escapeHTML(title)}</title>
      <style>
        body{font-family: Arial, sans-serif; padding:18px; color:#111;}
        h1{font-size:18px; margin:0 0 8px 0;}
        .muted{color:#555; font-size:12px; line-height:1.35;}
        .card{border:1px solid #ddd; border-radius:10px; padding:10px; margin-top:12px;}
        table{width:100%; border-collapse:collapse; margin-top:12px;}
        th,td{border:1px solid #ddd; padding:8px; font-size:12px;}
        th{background:#f4f4f4; text-align:left;}
      </style></head><body>
        <h1>${escapeHTML(title)}</h1>
        <div class="muted">
          Item: <b>${escapeHTML(sale.item)}</b><br>
          Comprador: <b>${escapeHTML(sale.buyer)}</b><br>
          Total: <b>${moneyIn(sale.currency, sale.total)}</b> • Parcelas: <b>${sale.installments}x</b><br>
          Início: ${sale.startISO} • Vencimento: dia ${sale.dueDay} • Término previsto: ${endISO}<br>
          Juros/Multa por atraso: ${sale.lateFeePct || 0}% (aplicado na parcela quando paga após o vencimento)
          ${sale.note ? `<br>Obs: ${escapeHTML(sale.note)}` : ""}
        </div>

        <div class="card">
          <div class="muted"><b>Parcelas</b></div>
          <table>
            <tr><th>#</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr>
            ${rows}
          </table>
        </div>

        <div class="muted" style="margin-top:12px;">
          Dica: no celular, use “Compartilhar / Salvar como PDF” depois de imprimir.
        </div>
      </body></html>
    `;

    const w = window.open("", "_blank");
    if(!w){ toast("Bloqueado pelo navegador. Permita pop-ups."); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  // ---------- Theme / Colors ----------
  function applyTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    const icon = $("#btnTheme i");
    icon.className = (theme === "dark") ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }

  function applyShiftColors(){
    const c = state.settings.shiftColors;
    document.documentElement.style.setProperty("--shiftA", c.A);
    document.documentElement.style.setProperty("--shiftB", c.B);
    document.documentElement.style.setProperty("--shiftC", c.C);
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg){
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // ---------- Drawer / modal already wired ----------
  // Start view
  goView("calendar");
})();
