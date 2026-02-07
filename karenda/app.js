// app.js
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LS_KEY = "nakata_finance_v2";

  const monthsShort = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const monthsLong  = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const today = new Date();
  let ui = {
    view: "calendar",
    calMode: "year",
    year: today.getFullYear(),
    month: today.getMonth(),
    financeFilter: "all",
    selectedDateISO: toISO(today),
  };

  const defaultState = () => ({
    settings: {
      // display currency toggle (global view)
      displayCurrency: "JPY", // JPY | BRL

      // câmbio manual: 1 JPY = fxJPYBRL BRL
      fxJPYBRL: 0.033, // exemplo

      // salário/hora (mantido em JPY por enquanto)
      rateNormal: 1200,
      rateExtra: 1500,
      autoCalc: true,

      shiftLabels: { A: "Dia", B: "Noite", C: "Madrugada" },
      shiftColors: { A: "#7c5cff", B: "#00c2ff", C: "#ffb020" },

      theme: "dark",
      fxLastUpdated: null, // ISO string
    },
    workEntries: {},
    financeEntries: [],
    investments: [],
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
    if(!raw) return defaultState();
    try{
      const parsed = JSON.parse(raw);
      // merge suave + defaults
      const def = defaultState();
      const merged = {
        ...def,
        ...parsed,
        settings: { ...def.settings, ...(parsed.settings||{}) },
        workEntries: parsed.workEntries || {},
        financeEntries: parsed.financeEntries || [],
        investments: parsed.investments || [],
        reminders: parsed.reminders || [],
        patterns: { ...def.patterns, ...(parsed.patterns||{}) }
      };

      // migração rápida de versões antigas caso existam chaves:
      // - se tiver settings.currency antigo, use como displayCurrency
      if(parsed?.settings?.currency && !parsed?.settings?.displayCurrency){
        merged.settings.displayCurrency = parsed.settings.currency;
      }
      return merged;
    }catch{
      return defaultState();
    }
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

  function money(v){
    return moneyIn(state.settings.displayCurrency, v);
  }

  function monthKey(y, m){
    return `${y}-${String(m+1).padStart(2,"0")}`;
  }

  function isSameMonth(iso, y, m){
    return iso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`);
  }

  // currency conversion
  function convert(amount, fromCur, toCur){
    const a = clampNumber(amount);
    if(fromCur === toCur) return a;

    const fx = clampNumber(state.settings.fxJPYBRL);
    if(!fx || fx <= 0) return a; // fallback neutro (evita NaN)

    // fx: 1 JPY = fx BRL
    if(fromCur === "JPY" && toCur === "BRL") return a * fx;
    if(fromCur === "BRL" && toCur === "JPY") return a / fx;

    return a;
  }

  function fxLabel(){
    const fx = clampNumber(state.settings.fxJPYBRL);
    return `Câmbio: 1¥ = R$${fx.toFixed(3)}`;
  }

  // ---------- UI Wiring ----------
  function wireNav(){
    $$(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        goView(btn.dataset.go);
      });
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

    $("#btnAddFinance").addEventListener("click", () => openFinanceSheet());
    $("#btnAddInvest").addEventListener("click", () => openInvestSheet());

    $$(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        $$(".chip").forEach(c => {
          c.classList.toggle("chip-active", c === chip);
          c.setAttribute("aria-selected", c === chip ? "true" : "false");
        });
        ui.financeFilter = chip.dataset.finFilter;
        renderFinance();
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

    $("#btnDaySave").addEventListener("click", saveDayEntry);
    $("#btnDayClear").addEventListener("click", clearDayEntry);
    $("#btnDayDuplicate").addEventListener("click", duplicateDayEntry);

    $("#btnFinSave").addEventListener("click", saveFinanceEntry);
    $("#btnFinCancel").addEventListener("click", () => closeSheet("sheetFinance"));

    $("#btnInvSave").addEventListener("click", saveInvest);
    $("#btnInvCancel").addEventListener("click", () => closeSheet("sheetInvest"));

    $$("[data-close-modal]").forEach(el => {
      el.addEventListener("click", () => closeModal());
    });
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
      card.setAttribute("aria-label", `Abrir ${monthsLong[m]}`);

      const dotClass = (stats.daysWithRecords > 0) ? "dot" : "dot none";

      // mostra ganho estimado já convertido para moeda de visualização
      const incomeDisplay = convert(stats.estimatedIncomeJPY, "JPY", state.settings.displayCurrency);

      card.innerHTML = `
        <div class="month-name">${monthsShort[m]}</div>
        <div class="month-meta">
          <span class="pill"><span class="${dotClass}"></span><span>${stats.daysWithRecords} dias</span></span>
          <span class="pill">${moneyIn(state.settings.displayCurrency, incomeDisplay)}</span>
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
          <span class="${badgeClass}" title="${shift || "—"}"></span>
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

    // ganho do trabalho é calculado em JPY (rateNormal/rateExtra), e depois convertido para exibição
    const incomeDisplay = convert(stats.estimatedIncomeJPY, "JPY", state.settings.displayCurrency);
    $("#sumIncome").textContent = moneyIn(state.settings.displayCurrency, incomeDisplay);

    const fin = financeMonthStats(ui.year, ui.month);
    $("#sumBalance").textContent = moneyIn(state.settings.displayCurrency, fin.balanceDisplay);

    if(ui.view === "finance"){
      $("#finMonthBalance").textContent = moneyIn(state.settings.displayCurrency, fin.balanceDisplay);
      $("#finIn").textContent = moneyIn(state.settings.displayCurrency, fin.inDisplay);
      $("#finOut").textContent = moneyIn(state.settings.displayCurrency, fin.outDisplay);
    }
  }

  function renderFinance(){
    if(ui.view !== "finance"){
      renderSummaryBar();
      return;
    }

    renderSummaryBar();

    const listWrap = $("#financeList");
    listWrap.innerHTML = `<div class="list" id="financeScroll"></div>`;
    const list = $("#financeScroll");

    const items = state.financeEntries
      .filter(e => isSameMonth(e.dateISO, ui.year, ui.month))
      .filter(e => {
        if(ui.financeFilter === "all") return true;
        if(ui.financeFilter === "pay") return e.type === "pay";
        if(ui.financeFilter === "recv") return e.type === "recv";
        if(ui.financeFilter === "loan") return (e.type === "loan_in" || e.type === "loan_out");
        return true;
      })
      .sort((a,b) => (a.dateISO > b.dateISO ? -1 : 1));

    $("#financeEmpty").classList.toggle("hidden", items.length !== 0);
    if(items.length === 0) return;

    for(const e of items){
      const isIn = (e.type === "recv" || e.type === "loan_in");
      const sign = isIn ? "+" : "-";
      const typeLabel =
        e.type === "pay" ? "Pagamento" :
        e.type === "recv" ? "Recebimento" :
        e.type === "loan_in" ? "Empréstimo (entrada)" : "Empréstimo (saída)";

      const statusLabel = e.status === "paid" ? "pago" : "pendente";

      const cur = e.currency || "JPY";
      const displayCur = state.settings.displayCurrency;

      const amountDisplay = convert(e.amount, cur, displayCur);
      const origText = (cur !== displayCur) ? `orig: ${moneyIn(cur, e.amount)}` : "";

      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML = `
        <div class="item-left">
          <div class="item-title">${e.category || typeLabel}</div>
          <div class="item-sub">${typeLabel} • ${e.dateISO} • ${statusLabel}${e.note ? " • " + e.note : ""}</div>
        </div>
        <div class="item-right">
          <div class="amount">${sign} ${moneyIn(displayCur, amountDisplay)}</div>
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
  }

  function renderInvest(){
    const displayCur = state.settings.displayCurrency;

    const totalDisplay = state.investments.reduce((acc, it) => {
      const cur = it.currency || "JPY";
      return acc + convert(it.value, cur, displayCur);
    }, 0);

    const monthDepDisplay = state.investments.reduce((acc, it) => {
      const cur = it.currency || "JPY";
      return acc + convert(it.depositMonth, cur, displayCur);
    }, 0);

    const roiAvg = (() => {
      const vals = state.investments
        .map(it => clampNumber(it.roi))
        .filter(v => Number.isFinite(v));
      if(vals.length === 0) return 0;
      return vals.reduce((a,b) => a+b, 0) / vals.length;
    })();

    $("#invTotal").textContent = moneyIn(displayCur, totalDisplay);
    $("#invMonth").textContent = moneyIn(displayCur, monthDepDisplay);
    $("#invRoi").textContent = `${Math.round(roiAvg * 10) / 10}%`;

    const listWrap = $("#investList");
    listWrap.innerHTML = `<div class="list" id="investScroll"></div>`;
    const list = $("#investScroll");

    $("#investEmpty").classList.toggle("hidden", state.investments.length !== 0);
    if(state.investments.length === 0) return;

    for(const it of state.investments){
      const cur = it.currency || "JPY";
      const valueDisp = convert(it.value, cur, displayCur);
      const depDisp = convert(it.depositMonth, cur, displayCur);

      const origText = (cur !== displayCur) ? `orig: ${moneyIn(cur, it.value)}` : "";

      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML = `
        <div class="item-left">
          <div class="item-title">${it.name}</div>
          <div class="item-sub">Atual ${moneyIn(displayCur, valueDisp)} • Aporte ${moneyIn(displayCur, depDisp)}${it.note ? " • " + it.note : ""}</div>
        </div>
        <div class="item-right">
          <div class="amount">${moneyIn(displayCur, valueDisp)}</div>
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

    // ganhos do trabalho: JPY (rateNormal/rateExtra) + addon (JPY)
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
    const displayCur = state.settings.displayCurrency;

    let inDisplay = 0;
    let outDisplay = 0;

    for(const e of state.financeEntries){
      if(!isSameMonth(e.dateISO, y, m)) continue;

      const cur = e.currency || "JPY";
      const amtDisp = convert(e.amount, cur, displayCur);

      if(e.type === "recv" || e.type === "loan_in") inDisplay += amtDisp;
      else outDisplay += amtDisp;
    }

    return { inDisplay, outDisplay, balanceDisplay: inDisplay - outDisplay };
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

  function openFinanceSheet(){
    $("#finType").value = "pay";
    $("#finStatus").value = "paid";
    $("#finCurrency").value = state.settings.displayCurrency; // ajuda: já abre na moeda que está vendo
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

  // Settings modal now includes FX + Update FX button
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
    // tenta 2 fontes, sem depender de API key
    // Retorna fx: 1 JPY = BRL
    try{
      // Frankfurter (ECB) nem sempre tem JPY->BRL direto, mas costuma funcionar:
      // https://api.frankfurter.app/latest?from=JPY&to=BRL
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
      // exchangerate.host
      // https://api.exchangerate.host/latest?base=JPY&symbols=BRL
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
          <br>
          Você pode usar separadores: vírgula, espaço, barra.
        </div>
      </div>

      <label class="field">
        <span>Padrão ativo (ex.: AABBEE ou AAAA, EE, BBBB, EE)</span>
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
          Isso preenche os dias do mês com o padrão repetido.
          Depois você pode ajustar dia por dia tocando no calendário.
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

      if(!res.ok){
        toast(res.error);
        return;
      }

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
    if(!s) return { ok:false, error:"Digite um padrão (ex.: AABBEE ou AAAA, EE, BBBB, EE)." };

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
      return { ok:false, error:"Use apenas A, B, C e E (folga). Ex.: AABBEE ou AAAA, EE, BBBB, EE." };
    }
    if(s.length < 2) return { ok:false, error:"Padrão muito curto. Use pelo menos 2 caracteres." };

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

  // ---------- Utilities ----------
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

  // Start view
  goView("calendar");
})();
