// app.js (REFEITO / ESTÁVEL)
// Ajustes incluídos apenas via JS:
// - Correção geral de robustez
// - Scroll horizontal na visão mensal em telas menores
// - Tutorial rápido de uso
// - Padrões de escala mais intuitivos e dinâmicos
// - Presets de escala + início em dia específico + manter dias anteriores
// - Blindagem extra para evitar erros por elementos ausentes

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const on = (sel, evt, handler, root = document) => {
    const el = $(sel, root);
    if (!el) return false;
    el.addEventListener(evt, handler);
    return true;
  };

  const LS_KEY = "nakata_finance_v5";
  const UI_KEY = "nakata_finance_ui_v1";

  const monthsShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthsLong = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const today = new Date();

  let ui = {
    view: "calendar",
    calMode: "year",
    year: today.getFullYear(),
    month: today.getMonth(),
    financeFilter: "all",
    financeMode: "entries",
    selectedDateISO: toISO(today)
  };

  const defaultUIState = () => ({
    tutorialSeen: false
  });

  const defaultState = () => ({
    settings: {
      displayCurrency: "JPY",
      fxJPYBRL: 0.033,
      rateNormal: 1200,
      rateExtra: 1500,
      autoCalc: true,

      extraFixedEnabled: false,
      extraFixedHours: 2,

      multSunday: 1.35,
      multHoliday: 1.35,
      multOffWorked: 1.25,

      soundMoney: false,

      shiftLabels: { A: "Dia", B: "Noite", C: "Madrugada" },
      shiftColors: { A: "#7c5cff", B: "#00c2ff", C: "#ffb020" },
      theme: "dark",
      fxLastUpdated: null
    },
    workEntries: {},
    financeEntries: [],
    investments: [],
    expenseTemplates: [],
    sales: [],
    employmentHistory: [],
    reminders: [],
    patterns: { active: "AABBEE" }
  });

  let state = loadState();
  let uiState = loadUIState();

  const moneyPulseMem = { key: "", last: 0 };

  injectReminderStyles();
  injectRuntimeFixStyles();

  applyTheme(state.settings.theme);
  applyShiftColors();
  renderCurrencyToggle();

  wireNav();
  wireTopbar();
  wireSheets();
  wireDrawer();
  wireGlobalKeyboard();

  renderAll();
  goView("calendar");

  setTimeout(() => {
    ensureTutorialDrawerItem();
    maybeOpenTutorialFirstTime();
  }, 50);

  // -----------------------------
  // STATE
  // -----------------------------
  function loadState() {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        return mergeWithDefault(JSON.parse(raw));
      } catch {
        return defaultState();
      }
    }

    const oldKeys = ["nakata_finance_v4", "nakata_finance_v3", "nakata_finance_v2"];
    for (const k of oldKeys) {
      const old = localStorage.getItem(k);
      if (!old) continue;
      try {
        const merged = mergeWithDefault(JSON.parse(old));
        localStorage.setItem(LS_KEY, JSON.stringify(merged));
        return merged;
      } catch {}
    }

    return defaultState();
  }

  function loadUIState() {
    const raw = localStorage.getItem(UI_KEY);
    if (!raw) return defaultUIState();
    try {
      return { ...defaultUIState(), ...JSON.parse(raw) };
    } catch {
      return defaultUIState();
    }
  }

  function saveUIState() {
    localStorage.setItem(UI_KEY, JSON.stringify(uiState));
  }

  function mergeWithDefault(parsed) {
    const def = defaultState();
    const merged = {
      ...def,
      ...parsed,
      settings: { ...def.settings, ...(parsed.settings || {}) },
      workEntries: parsed.workEntries || {},
      financeEntries: parsed.financeEntries || [],
      investments: parsed.investments || [],
      expenseTemplates: parsed.expenseTemplates || [],
      sales: parsed.sales || [],
      employmentHistory: parsed.employmentHistory || [],
      reminders: parsed.reminders || [],
      patterns: { ...def.patterns, ...(parsed.patterns || {}) }
    };

    if (parsed?.settings?.currency && !parsed?.settings?.displayCurrency) {
      merged.settings.displayCurrency = parsed.settings.currency;
    }

    merged.sales = merged.sales.map((s) => ({
      downPayment: 0,
      paidInstallments: 0,
      ...s
    }));

    return merged;
  }

  function saveState() {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  function resetState() {
    state = defaultState();
    saveState();
    applyTheme(state.settings.theme);
    applyShiftColors();
    renderCurrencyToggle();
    toast("Dados resetados.");
    renderAll();
  }

  // -----------------------------
  // HELPERS
  // -----------------------------
  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function fromISO(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function clampNumber(v) {
    const n = Number(String(v ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  function sym(cur) {
    return cur === "BRL" ? "R$" : "¥";
  }

  function moneyIn(cur, v) {
    const n = Number(v || 0);
    if (cur === "BRL") {
      return `${sym(cur)}${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `${sym(cur)}${Math.round(n).toLocaleString("pt-BR")}`;
  }

  function isSameMonth(iso, y, m) {
    return String(iso).startsWith(`${y}-${String(m + 1).padStart(2, "0")}`);
  }

  function convert(amount, fromCur, toCur) {
    const a = clampNumber(amount);
    if (fromCur === toCur) return a;

    const fx = clampNumber(state.settings.fxJPYBRL);
    if (!fx || fx <= 0) return a;

    if (fromCur === "JPY" && toCur === "BRL") return a * fx;
    if (fromCur === "BRL" && toCur === "JPY") return a / fx;

    return a;
  }

  function fxLabel() {
    const fx = clampNumber(state.settings.fxJPYBRL);
    return `Câmbio: 1¥ = R$${fx.toFixed(3)}`;
  }

  function normalizeText(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  }

  function cryptoId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function addMonths(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setMonth(d.getMonth() + n);
    return d;
  }

  function endOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  function startOfMonth(y, m) {
    return new Date(y, m, 1);
  }

  function endOfMonth(y, m) {
    return new Date(y, m + 1, 0, 23, 59, 59, 999);
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  function dayOfWeekISO(iso) {
    return fromISO(iso).getDay();
  }

  function autoDayTypeForISO(iso) {
    const dow = dayOfWeekISO(iso);
    if (dow === 0) return "sunday";
    return "normal";
  }

  function multiplierForDayType(dt) {
    const s = state.settings;
    if (dt === "sunday") return Math.max(0.01, clampNumber(s.multSunday) || 1);
    if (dt === "holiday") return Math.max(0.01, clampNumber(s.multHoliday) || 1);
    if (dt === "off_worked") return Math.max(0.01, clampNumber(s.multOffWorked) || 1);
    return 1;
  }

  // -----------------------------
  // REMINDERS HELPERS
  // -----------------------------
  function remKeyFromISO(iso) {
    const parts = String(iso || "").split("-");
    if (parts.length !== 3) return "";
    return `${parts[1]}-${parts[2]}`;
  }

  function guessReminderType(title) {
    const t = normalizeText(title);
    if (t.includes("anivers") || t.includes("niver") || t.includes("birthday")) return "bday";
    return "rem";
  }

  function getRemindersForISO(dateISO) {
    const key = remKeyFromISO(dateISO);
    return (state.reminders || []).filter((r) => remKeyFromISO(r.dateISO) === key);
  }

  function remindersCountForMonth(y, m) {
    const mm = String(m + 1).padStart(2, "0");
    let count = 0;
    for (const r of state.reminders || []) {
      const k = remKeyFromISO(r.dateISO);
      if (k.startsWith(mm + "-")) count++;
    }
    return count;
  }

  function topReminderLevel(reminders) {
    let level = "low";
    for (const r of reminders) {
      const imp = r.importance || "med";
      if (imp === "high") return "high";
      if (imp === "med") level = "med";
    }
    return level;
  }

  function reminderTitlePreview(reminders) {
    if (!reminders || reminders.length === 0) return "";
    const first = reminders[0];
    const more = reminders.length > 1 ? ` (+${reminders.length - 1})` : "";
    return `${first.title}${more}`;
  }

  // -----------------------------
  // WIRING
  // -----------------------------
  function wireNav() {
    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => goView(btn.dataset.go));
    });
  }

  function wireTopbar() {
    on("#btnMenu", "click", openDrawer);

    on("#btnTheme", "click", () => {
      const next = state.settings.theme === "dark" ? "light" : "dark";
      state.settings.theme = next;
      saveState();
      applyTheme(next);
      toast(next === "dark" ? "Tema escuro" : "Tema claro");
    });

    on("#btnCurrency", "click", () => {
      state.settings.displayCurrency = state.settings.displayCurrency === "JPY" ? "BRL" : "JPY";
      saveState();
      renderCurrencyToggle();
      toast(state.settings.displayCurrency === "JPY" ? "Visualizando em ¥" : "Visualizando em R$");
      renderAll();
    });

    on("#segYear", "click", () => setCalMode("year"));
    on("#segMonth", "click", () => setCalMode("month"));

    on("#btnPrevMonth", "click", () => {
      ui.month -= 1;
      if (ui.month < 0) {
        ui.month = 11;
        ui.year -= 1;
      }
      renderCalendar();
    });

    on("#btnNextMonth", "click", () => {
      ui.month += 1;
      if (ui.month > 11) {
        ui.month = 0;
        ui.year += 1;
      }
      renderCalendar();
    });

    on("#segFinEntries", "click", () => setFinanceMode("entries"));
    on("#segFinBudget", "click", () => setFinanceMode("budget"));

    on("#btnFinancePrimary", "click", () => {
      if (ui.financeMode === "budget") {
        openExpenseSheet();
        return;
      }
      openFinanceCreateChooser();
    });

    on("#btnFinancePDF", "click", () => {
      printMonthPDF(ui.year, ui.month);
    });

    on("#btnAddInvest", "click", () => openInvestSheet());

    $$(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        $$(".chip").forEach((c) => {
          c.classList.toggle("chip-active", c === chip);
          c.setAttribute("aria-selected", c === chip ? "true" : "false");
        });
        ui.financeFilter = chip.dataset.finFilter;
        renderFinanceEntries();
      });
    });
  }

  function renderCurrencyToggle() {
    const cur = state.settings.displayCurrency;
    const lbl = $("#currencyLabel");
    if (lbl) lbl.textContent = cur === "JPY" ? "¥" : "R$";
  }

  function wireSheets() {
    $$("[data-close-sheet]").forEach((el) => {
      el.addEventListener("click", () => closeSheet(el.dataset.closeSheet));
    });

    on("#btnDaySave", "click", saveDayEntry);
    on("#btnDayClear", "click", clearDayEntry);
    on("#btnDayDuplicate", "click", duplicateDayEntry);

    on("#dayExtra", "input", () => {
      const extraEl = $("#dayExtra");
      if (extraEl) extraEl.dataset.autofilled = "0";
    });

    on("#dayShift", "change", applyExtraFixedLive);
    on("#dayStatus", "change", applyExtraFixedLive);

    on("#btnFinSave", "click", saveFinanceEntry);
    on("#btnExpSave", "click", saveExpenseTemplate);
    on("#btnSaleSave", "click", saveSaleContract);
    on("#btnInvSave", "click", saveInvest);

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
  }

  function wireDrawer() {
    on("#btnCloseMenu", "click", closeDrawer);

    const drawer = $("#drawer");
    if (drawer) {
      drawer.addEventListener("click", (e) => {
        if (e.target.id === "drawer") closeDrawer();
      });
    }

    $$(".drawer-item[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const what = btn.dataset.open;
        closeDrawer();
        if (what === "settings") openSettingsModal();
        if (what === "patterns") openPatternsModal();
        if (what === "reminders") openRemindersModal();
      });
    });

    on("#btnReset", "click", () => {
      closeDrawer();
      openConfirmModal(
        "Resetar dados",
        "Isso apaga os dados salvos localmente neste navegador.",
        () => resetState()
      );
    });
  }

  function wireGlobalKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      const modal = $("#modal");
      if (modal && modal.classList.contains("show")) {
        closeModal();
        return;
      }

      const sheet = $$(".sheet.show")[0];
      if (sheet) {
        closeSheet(sheet.id);
        return;
      }

      const drawer = $("#drawer");
      if (drawer && drawer.classList.contains("show")) {
        closeDrawer();
      }
    });
  }

  // -----------------------------
  // VIEWS
  // -----------------------------
  function goView(view) {
    ui.view = view;

    $$(".view").forEach((v) => v.classList.toggle("view-active", v.dataset.view === view));
    $$(".nav-item").forEach((n) => n.classList.toggle("nav-active", n.dataset.go === view));

    const t = $("#appTitle");
    if (t) t.textContent = view === "calendar" ? "Calendário" : view === "finance" ? "Financeiro" : "Investimentos";

    const sub = $("#appSubtitle");
    if (sub) {
      if (view === "calendar") {
        sub.textContent = ui.calMode === "year" ? "Visão anual" : `${monthsLong[ui.month]} • ${ui.year}`;
      } else if (view === "finance") {
        sub.textContent = `${monthsLong[ui.month]} • ${ui.year}`;
      } else {
        sub.textContent = "Resumo rápido";
      }
    }

    renderAll();
  }

  function setCalMode(mode) {
    ui.calMode = mode;

    const segYear = $("#segYear");
    const segMonth = $("#segMonth");
    if (segYear) {
      segYear.classList.toggle("seg-active", mode === "year");
      segYear.setAttribute("aria-pressed", mode === "year" ? "true" : "false");
    }
    if (segMonth) {
      segMonth.classList.toggle("seg-active", mode === "month");
      segMonth.setAttribute("aria-pressed", mode === "month" ? "true" : "false");
    }

    const yearGrid = $("#yearGrid");
    const monthArea = $("#monthArea");
    const monthNav = $("#monthNav");

    if (yearGrid) yearGrid.classList.toggle("hidden", mode !== "year");
    if (monthArea) monthArea.classList.toggle("hidden", mode !== "month");
    if (monthNav) monthNav.style.display = mode === "month" ? "flex" : "none";

    const sub = $("#appSubtitle");
    if (sub) sub.textContent = mode === "year" ? "Visão anual" : `${monthsLong[ui.month]} • ${ui.year}`;

    renderCalendar();
    ensureMonthlyHorizontalScroll();
  }

  function setFinanceMode(mode) {
    ui.financeMode = mode;

    const a = $("#segFinEntries");
    const b = $("#segFinBudget");
    if (a) {
      a.classList.toggle("seg-active", mode === "entries");
      a.setAttribute("aria-pressed", mode === "entries" ? "true" : "false");
    }
    if (b) {
      b.classList.toggle("seg-active", mode === "budget");
      b.setAttribute("aria-pressed", mode === "budget" ? "true" : "false");
    }

    const filters = $("#financeFiltersRow");
    const entriesWrap = $("#financeEntriesWrap");
    const budgetWrap = $("#financeBudgetWrap");
    const bar = $("#budgetSummaryBar");

    if (filters) filters.classList.toggle("hidden", mode !== "entries");
    if (entriesWrap) entriesWrap.classList.toggle("hidden", mode !== "entries");
    if (budgetWrap) budgetWrap.classList.toggle("hidden", mode !== "budget");
    if (bar) bar.classList.toggle("hidden", mode !== "budget");

    const primaryLbl = $("#financePrimaryLabel");
    if (primaryLbl) primaryLbl.textContent = mode === "entries" ? "Novo" : "Adicionar";

    const finBig = $("#finBigLabel");
    const finIn = $("#finInLabel");
    const finOut = $("#finOutLabel");

    if (finBig) finBig.textContent = mode === "entries" ? "Saldo do mês" : "Saldo real (mês)";
    if (finIn) finIn.textContent = mode === "entries" ? "Entradas" : "Pago";
    if (finOut) finOut.textContent = mode === "entries" ? "Saídas" : "Planejado";

    renderFinance();
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  function renderAll() {
    const fx1 = $("#fxNoteFin");
    const fx2 = $("#fxNoteInv");
    const label = fxLabel();
    if (fx1) fx1.textContent = label;
    if (fx2) fx2.textContent = label;

    renderCalendar();
    renderFinance();
    renderInvest();
  }

  function renderCalendar() {
    renderYearGrid();
    renderMonthGrid();
    renderMonthLabel();
    renderSummaryBar();
    ensureMonthlyHorizontalScroll();
  }

  function renderMonthLabel() {
    const el = $("#monthLabel");
    if (el) el.textContent = `${monthsShort[ui.month]} ${ui.year}`;
  }

  function renderYearGrid() {
    const grid = $("#yearGrid");
    if (!grid) return;
    grid.innerHTML = "";

    for (let m = 0; m < 12; m++) {
      const stats = monthStats(ui.year, m);
      const remCount = remindersCountForMonth(ui.year, m);

      const card = document.createElement("button");
      card.className = "month-card";
      card.type = "button";

      const dotClass = stats.daysWithRecords > 0 ? "dot" : "dot none";
      const dispCur = state.settings.displayCurrency;
      const incomeDisplay = convert(stats.estimatedIncomeJPY, "JPY", dispCur);

      const daysText = remCount > 0 ? `${stats.daysWithRecords} dias • ${remCount} lemb` : `${stats.daysWithRecords} dias`;
      const remIcon = remCount > 0 ? `<span class="rem-year-ico" aria-hidden="true"></span>` : "";

      card.innerHTML = `
        <div class="month-name">${monthsShort[m]}</div>
        <div class="month-meta">
          <span class="pill">
            <span class="${dotClass}"></span>
            <span>${daysText}</span>
            ${remIcon}
          </span>
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

  function renderMonthGrid() {
    const area = $("#monthGrid");
    if (!area) return;

    area.innerHTML = "";
    if (ui.calMode !== "month") return;

    const first = new Date(ui.year, ui.month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(ui.year, ui.month + 1, 0).getDate();
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startDow + 1;

      if (dayNum < 1 || dayNum > daysInMonth) {
        const cell = document.createElement("div");
        cell.className = "day empty";
        cell.innerHTML = `<div class="day-top"><span class="day-num"> </span><span class="badge"></span></div>`;
        area.appendChild(cell);
        continue;
      }

      const dateISO = `${ui.year}-${String(ui.month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const entry = state.workEntries[dateISO];
      const shift = entry?.shift || "";
      const normal = clampNumber(entry?.normal);
      const extra = clampNumber(entry?.extra);

      const badgeClass = shift ? `badge ${shift}` : "badge";
      const isToday = dateISO === toISO(new Date());

      const rems = getRemindersForISO(dateISO);
      const hasRem = rems.length > 0;
      const remLevel = hasRem ? topReminderLevel(rems) : "low";
      const remType = hasRem ? guessReminderType(rems[0].title) : "rem";
      const remPreview = hasRem ? reminderTitlePreview(rems) : "";

      const cell = document.createElement("button");
      cell.className = "day";
      cell.type = "button";
      cell.setAttribute("aria-label", hasRem ? `${dayNum}. Lembrete: ${remPreview}` : `${dayNum}`);
      if (hasRem) {
        cell.classList.add("has-rem", `rem-${remLevel}`);
        if (remType === "bday") cell.classList.add("rem-bday");
        cell.title = `${remType === "bday" ? "🎂 " : "🔔 "}${remPreview}`;
      }

      const remBadgeHTML = hasRem
        ? `<span class="badge ${remType === "bday" ? "BDAY" : "REM"} rem-pulse rem-${remLevel}" aria-hidden="true"></span>`
        : "";

      cell.innerHTML = `
        <div class="day-top">
          <span class="day-num">${dayNum}${isToday ? " •" : ""}</span>
          <span style="display:flex; gap:6px; align-items:center;">
            ${remBadgeHTML}
            <span class="${badgeClass}"></span>
          </span>
        </div>
        <div class="day-mini">
          ${normal ? `<span class="chip-mini">N ${normal}h</span>` : ""}
          ${extra ? `<span class="chip-mini">E ${extra}h</span>` : ""}
        </div>
      `;

      cell.addEventListener("click", () => openDaySheet(dateISO));
      area.appendChild(cell);
    }
  }

  function renderSummaryBar() {
    const stats = monthStats(ui.year, ui.month);

    const sumN = $("#sumNormal");
    const sumE = $("#sumExtra");
    const sumI = $("#sumIncome");
    const sumB = $("#sumBalance");

    if (sumN) sumN.textContent = `${stats.totalNormal}h`;
    if (sumE) sumE.textContent = `${stats.totalExtra}h`;

    const dispCur = state.settings.displayCurrency;
    const incomeDisplay = convert(stats.estimatedIncomeJPY, "JPY", dispCur);
    if (sumI) sumI.textContent = moneyIn(dispCur, incomeDisplay);

    const fin = financeMonthStats(ui.year, ui.month);
    const nextBalance = fin.balanceDisplay;
    if (sumB) sumB.textContent = moneyIn(dispCur, nextBalance);

    const memKey = `${ui.year}-${ui.month}-${dispCur}`;
    if (moneyPulseMem.key !== memKey) {
      moneyPulseMem.key = memKey;
      moneyPulseMem.last = nextBalance;
    } else {
      if (nextBalance > moneyPulseMem.last + 0.001) {
        try {
          window.NakataMoneyFX?.pop?.($("#sumBalanceCard"), !!state.settings.soundMoney);
        } catch {}
      }
      moneyPulseMem.last = nextBalance;
    }

    if (ui.view === "finance") {
      renderFinanceHeader(fin);
      renderFinanceProjections();
    }
  }

  function renderFinance() {
    if (ui.view !== "finance") {
      renderSummaryBar();
      return;
    }

    const fin = financeMonthStats(ui.year, ui.month);
    renderFinanceHeader(fin);
    renderFinanceProjections();

    if (ui.financeMode === "entries") {
      renderFinanceEntries();
    } else {
      renderFinanceBudget();
    }
  }

  function renderFinanceHeader(fin) {
    const dispCur = state.settings.displayCurrency;

    const monthBal = $("#finMonthBalance");
    const finIn = $("#finIn");
    const finOut = $("#finOut");

    if (ui.financeMode === "entries") {
      if (monthBal) monthBal.textContent = moneyIn(dispCur, fin.balanceDisplay);
      if (finIn) finIn.textContent = moneyIn(dispCur, fin.inDisplay);
      if (finOut) finOut.textContent = moneyIn(dispCur, fin.outDisplay);
      return;
    }

    const bud = budgetStats(ui.year, ui.month);
    if (monthBal) monthBal.textContent = moneyIn(dispCur, fin.balanceDisplay);
    if (finIn) finIn.textContent = moneyIn(dispCur, bud.paidTowardsPlannedDisplay);
    if (finOut) finOut.textContent = moneyIn(dispCur, bud.plannedTotalDisplay);
  }

  function renderFinanceProjections() {
    const dispCur = state.settings.displayCurrency;

    const work = monthStats(ui.year, ui.month);
    const workIncomeDisplay = convert(work.estimatedIncomeJPY, "JPY", dispCur);

    const fin = financeMonthStats(ui.year, ui.month);

    const grossReal = workIncomeDisplay + fin.recvOnlyDisplay;
    const netReal = grossReal - fin.payOnlyDisplay;

    const bud = budgetStats(ui.year, ui.month);
    const grossForecast = grossReal;
    const netForecast = netReal - bud.remainingDisplay;

    const a = $("#projGrossReal");
    const b = $("#projNetReal");
    const c = $("#projGrossForecast");
    const d = $("#projNetForecast");

    if (a) a.textContent = moneyIn(dispCur, grossReal);
    if (b) b.textContent = moneyIn(dispCur, netReal);
    if (c) c.textContent = moneyIn(dispCur, grossForecast);
    if (d) d.textContent = moneyIn(dispCur, netForecast);
  }

  function renderFinanceEntries() {
    const listWrap = $("#financeList");
    if (!listWrap) return;

    listWrap.innerHTML = `<div class="list" id="financeScroll"></div>`;
    const list = $("#financeScroll");
    if (!list) return;

    const dispCur = state.settings.displayCurrency;

    const entries = state.financeEntries
      .filter((e) => isSameMonth(e.dateISO, ui.year, ui.month))
      .filter((e) => {
        if (ui.financeFilter === "all") return true;
        if (ui.financeFilter === "pay") return e.type === "pay";
        if (ui.financeFilter === "recv") return e.type === "recv";
        if (ui.financeFilter === "loan") return e.type === "loan_in" || e.type === "loan_out";
        if (ui.financeFilter === "sales") return false;
        return true;
      })
      .sort((a, b) => (a.dateISO > b.dateISO ? -1 : 1));

    const salesForView = state.sales
      .filter(() => ui.financeFilter === "sales" || ui.financeFilter === "all")
      .slice()
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

    const hasAnything = entries.length > 0 || salesForView.length > 0;
    const empty = $("#financeEmpty");
    if (empty) empty.classList.toggle("hidden", hasAnything);

    if (ui.financeFilter === "sales") {
      for (const s of salesForView) list.appendChild(renderSaleCard(s, dispCur));
      return;
    }

    for (const e of entries) {
      const isIn = e.type === "recv" || e.type === "loan_in";
      const sign = isIn ? "+" : "-";
      const typeLabel =
        e.type === "pay" ? "Pagamento" :
        e.type === "recv" ? "Recebimento" :
        e.type === "loan_in" ? "Empréstimo (entrada)" :
        "Empréstimo (saída)";

      const statusLabel = e.status === "paid" ? "pago" : "pendente";
      const cur = e.currency || "JPY";

      const amountDisplay = convert(e.amount, cur, dispCur);
      const origText = cur !== dispCur ? `orig: ${moneyIn(cur, e.amount)}` : "";

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
          ${origText ? `<div class="tag orig">${origText}</div>` : ""}
        </div>
      `;

      el.addEventListener("click", () => {
        openConfirmModal(
          "Excluir lançamento?",
          `${typeLabel} • ${moneyIn(cur, e.amount)} • ${e.dateISO}`,
          () => {
            state.financeEntries = state.financeEntries.filter((x) => x.id !== e.id);
            saveState();
            toast("Lançamento removido.");
            renderFinance();
            renderSummaryBar();
          }
        );
      });

      list.appendChild(el);
    }

    if (salesForView.length) {
      const sep = document.createElement("div");
      sep.style.margin = "6px 2px 2px 2px";
      sep.style.color = "var(--muted)";
      sep.style.fontSize = "11px";
      sep.style.fontWeight = "850";
      sep.textContent = "Vendas / Recebimentos";
      list.appendChild(sep);

      for (const s of salesForView) list.appendChild(renderSaleCard(s, dispCur));
    }
  }

  function renderSaleCard(sale, dispCur) {
    const cur = sale.currency || "BRL";
    const totalDisp = convert(sale.total, cur, dispCur);

    const schedule = getSaleSchedule(sale);
    const paidCount = sale.paidInstallments || 0;

    const now = new Date();
    const overdue = schedule.some((x) => !x.paid && fromISO(x.dueISO) < startOfDay(now));
    const next = schedule.find((x) => !x.paid);
    const nextText = next ? `${next.dueISO} (${moneyIn(cur, next.amount)})` : "Quitado ✅";
    const endISO = schedule.length ? schedule[schedule.length - 1].dueISO : "—";

    const down = clampNumber(sale.downPayment || 0);
    const downText = down > 0 ? ` • Entrada ${moneyIn(cur, down)}` : "";

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item-left">
        <div class="item-title">${escapeHTML(sale.item)} • ${escapeHTML(sale.buyer)}</div>
        <div class="item-sub">Total ${moneyIn(cur, sale.total)}${downText} • ${sale.installments}x • termina em ${endISO}</div>
      </div>
      <div class="item-right">
        <div class="amount">${moneyIn(dispCur, totalDisp)}</div>
        <div class="tag sale">${paidCount}/${sale.installments} pago</div>
        ${overdue ? `<div class="tag overdue">Atrasado</div>` : `<div class="tag">${nextText}</div>`}
      </div>
    `;

    el.addEventListener("click", () => openSaleActionsModal(sale.id));
    return el;
  }

  function openSaleActionsModal(saleId) {
    const sale = state.sales.find((s) => s.id === saleId);
    if (!sale) {
      toast("Venda não encontrada.");
      return;
    }

    const schedule = getSaleSchedule(sale);

    const rows = schedule.map((x) => {
      const cls = x.paid ? "good" : (fromISO(x.dueISO) < startOfDay(new Date()) ? "bad" : "");
      const status = x.paid ? "Pago" : (fromISO(x.dueISO) < startOfDay(new Date()) ? "Vencida" : "Pendente");
      return `
        <div class="item" data-inst="${x.index}">
          <div class="item-left">
            <div class="item-title">Parcela ${x.index}/${sale.installments} • ${x.dueISO}</div>
            <div class="item-sub">${moneyIn(sale.currency, x.amount)} • ${status}${sale.lateFeePct ? ` • multa ${sale.lateFeePct}%` : ""}</div>
          </div>
          <div class="item-right">
            <div class="tag ${cls}">${status}</div>
            ${!x.paid ? `<div class="tag sale">Marcar paga</div>` : ""}
          </div>
        </div>
      `;
    }).join("");

    const down = clampNumber(sale.downPayment || 0);

    openModal(
      "Venda / Recebimento",
      `
        <div class="field">
          <span>Venda</span>
          <div style="color:var(--muted); font-weight:850; line-height:1.35">
            <b>${escapeHTML(sale.item)}</b> • ${escapeHTML(sale.buyer)}<br>
            Total: <b>${moneyIn(sale.currency, sale.total)}</b>${down > 0 ? ` • Entrada: <b>${moneyIn(sale.currency, down)}</b>` : ""} • ${sale.installments}x<br>
            Início: ${sale.startISO} • Vencimento: dia ${sale.dueDay}
            ${sale.note ? `<br>Obs: ${escapeHTML(sale.note)}` : ""}
          </div>
        </div>

        <div class="field">
          <span>Parcelas (toque para marcar paga)</span>
          <div class="list" style="max-height:280px; overflow:auto; padding-right:4px;">
            ${rows}
          </div>
        </div>
      `,
      `
        <button class="ghost-btn grow" id="btnSalePDF">
          <i class="fa-regular fa-file-pdf"></i><span>PDF do contrato</span>
        </button>
        <button class="ghost-btn grow" id="btnSaleDelete">
          <i class="fa-regular fa-trash-can"></i><span>Excluir</span>
        </button>
        <button class="primary-btn grow" data-close-modal="true">
          <i class="fa-solid fa-xmark"></i><span>Fechar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

    on("#btnSalePDF", "click", () => {
      closeModal();
      printSalePDF(saleId);
    });

    on("#btnSaleDelete", "click", () => {
      closeModal();
      openConfirmModal("Excluir venda?", "Este contrato será removido.", () => {
        state.sales = state.sales.filter((s) => s.id !== saleId);
        saveState();
        toast("Venda removida.");
        renderFinance();
      });
    });

    $$("[data-inst]").forEach((row) => {
      row.addEventListener("click", () => {
        const idx = Number(row.getAttribute("data-inst"));
        const inst = schedule.find((x) => x.index === idx);
        if (!inst || inst.paid) {
          toast("Essa parcela já está paga.");
          return;
        }
        closeModal();
        markInstallmentPaid(saleId, idx);
      });
    });
  }

  function markInstallmentPaid(saleId, installmentIndex) {
    const sale = state.sales.find((s) => s.id === saleId);
    if (!sale) {
      toast("Venda não encontrada.");
      return;
    }

    const schedule = getSaleSchedule(sale);
    const inst = schedule.find((x) => x.index === installmentIndex);
    if (!inst || inst.paid) {
      toast("Parcela inválida.");
      return;
    }

    const paidDate = new Date();
    const due = fromISO(inst.dueISO);
    const late = paidDate > endOfDay(due);

    let receivedAmount = inst.amount;
    if (late && clampNumber(sale.lateFeePct) > 0) {
      receivedAmount = Math.round(receivedAmount * (1 + clampNumber(sale.lateFeePct) / 100));
    }

    sale.paidMap = sale.paidMap || {};
    sale.paidMap[String(installmentIndex)] = true;
    sale.paidInstallments = Object.values(sale.paidMap).filter(Boolean).length;

    state.financeEntries.push({
      id: cryptoId(),
      type: "recv",
      status: "paid",
      currency: sale.currency,
      amount: receivedAmount,
      dateISO: toISO(paidDate),
      category: `Venda: ${sale.item}`,
      note: `Comprador: ${sale.buyer} • Parcela ${installmentIndex}/${sale.installments}${late ? ` • atraso (+${sale.lateFeePct}%)` : ""}`
    });

    saveState();
    toast("Parcela registrada como recebida.");
    renderFinance();
    renderSummaryBar();
  }

  function getSaleSchedule(sale) {
    const total = clampNumber(sale.total);
    const downPayment = Math.max(0, Math.round(clampNumber(sale.downPayment || 0)));
    const remainingTotal = Math.max(total - downPayment, 0);

    const installments = Math.max(1, Math.round(clampNumber(sale.installments)));
    const base = Math.floor(remainingTotal / installments);
    let remainder = remainingTotal - base * installments;

    const start = sale.startISO ? fromISO(sale.startISO) : new Date();
    const dueDay = Math.min(28, Math.max(1, Math.round(clampNumber(sale.dueDay || 10))));

    const paidMap = sale.paidMap || {};
    const schedule = [];

    for (let i = 0; i < installments; i++) {
      const amount = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;

      const monthDate = addMonths(start, i);
      const due = new Date(monthDate.getFullYear(), monthDate.getMonth(), dueDay);
      const dueISO = toISO(due);

      schedule.push({
        index: i + 1,
        dueISO,
        amount,
        paid: !!paidMap[String(i + 1)]
      });
    }

    return schedule;
  }

  function renderFinanceBudget() {
    const dispCur = state.settings.displayCurrency;
    const bud = budgetStats(ui.year, ui.month);

    const a = $("#budFixed");
    const b = $("#budVar");
    const c = $("#budRemaining");
    const d = $("#budForecast");

    if (a) a.textContent = moneyIn(dispCur, bud.fixedTotalDisplay);
    if (b) b.textContent = moneyIn(dispCur, bud.variableTotalDisplay);
    if (c) c.textContent = moneyIn(dispCur, bud.remainingDisplay);
    if (d) d.textContent = moneyIn(dispCur, bud.forecastBalanceDisplay);

    const hasAny = state.expenseTemplates.length > 0;
    const empty = $("#budgetEmpty");
    if (empty) empty.classList.toggle("hidden", hasAny);

    const wrap = $("#budgetLists");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (!hasAny) return;

    renderExpenseGroup("Fixas", "fixed", bud.fixedTotalDisplay);
    renderExpenseGroup("Variáveis", "variable", bud.variableTotalDisplay);

    function renderExpenseGroup(title, type, totalDisplay) {
      const group = state.expenseTemplates
        .filter((x) => x.type === type)
        .slice()
        .sort((a, b) => normalizeText(a.name) > normalizeText(b.name) ? 1 : -1);

      const header = document.createElement("div");
      header.className = "bud-header";
      header.innerHTML = `
        <div class="bud-title">${title}</div>
        <div class="bud-pill">${moneyIn(dispCur, totalDisplay)}</div>
      `;
      wrap.appendChild(header);

      if (group.length === 0) {
        const emptyRow = document.createElement("div");
        emptyRow.className = "item";
        emptyRow.innerHTML = `
          <div class="item-left">
            <div class="item-title" style="color:var(--muted); font-weight:850;">Sem ${title.toLowerCase()}</div>
            <div class="item-sub">Toque em “Adicionar” para criar</div>
          </div>
          <div class="item-right">
            <div class="tag">—</div>
          </div>
        `;
        wrap.appendChild(emptyRow);
        return;
      }

      for (const it of group) {
        const active = it.active !== false;
        const cur = it.currency || "JPY";
        const amountDisplay = convert(it.amount, cur, dispCur);

        const meta = [
          it.dayOfMonth ? `dia ${it.dayOfMonth}` : null,
          active ? "ativa (todo mês)" : "inativa",
          it.note || null
        ].filter(Boolean).join(" • ");

        const origText = cur !== dispCur ? `orig: ${moneyIn(cur, it.amount)}` : "";

        const el = document.createElement("div");
        el.className = "item";
        el.innerHTML = `
          <div class="item-left">
            <div class="item-title">${escapeHTML(it.name)}</div>
            <div class="item-sub">${escapeHTML(meta || "—")}</div>
          </div>
          <div class="item-right">
            <div class="amount">- ${moneyIn(dispCur, amountDisplay)}</div>
            ${origText ? `<div class="tag orig">${origText}</div>` : ""}
            <div class="tag">${active ? "conta no mês" : "fora do mês"}</div>
          </div>
        `;

        el.addEventListener("click", () => {
          openConfirmModal(
            "Remover despesa?",
            `${it.name} • ${moneyIn(cur, it.amount)}`,
            () => {
              state.expenseTemplates = state.expenseTemplates.filter((x) => x.id !== it.id);
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

  function renderInvest() {
    const dispCur = state.settings.displayCurrency;

    const totalDisplay = state.investments.reduce((acc, it) => acc + convert(it.value, it.currency || "JPY", dispCur), 0);
    const monthDepDisplay = state.investments.reduce((acc, it) => acc + convert(it.depositMonth, it.currency || "JPY", dispCur), 0);

    const roiAvg = (() => {
      const vals = state.investments.map((it) => clampNumber(it.roi)).filter((v) => Number.isFinite(v));
      if (!vals.length) return 0;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    })();

    const a = $("#invTotal");
    const b = $("#invMonth");
    const c = $("#invRoiText");

    if (a) a.textContent = moneyIn(dispCur, totalDisplay);
    if (b) b.textContent = moneyIn(dispCur, monthDepDisplay);
    if (c) c.textContent = `${Math.round(roiAvg * 10) / 10}%`;

    const listWrap = $("#investList");
    if (!listWrap) return;

    listWrap.innerHTML = `<div class="list" id="investScroll"></div>`;
    const list = $("#investScroll");
    if (!list) return;

    const invEmpty = $("#investEmpty");
    if (invEmpty) invEmpty.classList.toggle("hidden", state.investments.length !== 0);

    if (state.investments.length === 0) return;

    for (const it of state.investments) {
      const cur = it.currency || "JPY";
      const valueDisp = convert(it.value, cur, dispCur);
      const depDisp = convert(it.depositMonth, cur, dispCur);
      const origText = cur !== dispCur ? `orig: ${moneyIn(cur, it.value)}` : "";

      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML = `
        <div class="item-left">
          <div class="item-title">${escapeHTML(it.name)}</div>
          <div class="item-sub">Atual ${moneyIn(dispCur, valueDisp)} • Aporte ${moneyIn(dispCur, depDisp)}${it.note ? " • " + escapeHTML(it.note) : ""}</div>
        </div>
        <div class="item-right">
          <div class="amount">${moneyIn(dispCur, valueDisp)}</div>
          <div class="tag">${clampNumber(it.roi) || 0}%</div>
          ${origText ? `<div class="tag orig">${origText}</div>` : ""}
        </div>
      `;

      el.addEventListener("click", () => {
        openConfirmModal(
          "Excluir ativo?",
          `${it.name} • ${moneyIn(cur, it.value)}`,
          () => {
            state.investments = state.investments.filter((x) => x.id !== it.id);
            saveState();
            toast("Ativo removido.");
            renderInvest();
          }
        );
      });

      list.appendChild(el);
    }
  }

  // -----------------------------
  // STATS
  // -----------------------------
  function monthStats(y, m) {
    let totalNormal = 0;
    let totalExtra = 0;
    let daysWithRecords = 0;
    let estimatedIncomeJPY = 0;

    const prefix = `${y}-${String(m + 1).padStart(2, "0")}-`;

    for (const [iso, entry] of Object.entries(state.workEntries)) {
      if (!iso.startsWith(prefix)) continue;

      const n = clampNumber(entry.normal);
      const e = clampNumber(entry.extra);
      const a = clampNumber(entry.addon);

      const dt = entry.dayType && entry.dayType !== "auto" ? entry.dayType : autoDayTypeForISO(iso);
      const mult = multiplierForDayType(dt);

      if (n || e || a || entry.shift || entry.note || entry.dayType) daysWithRecords++;

      totalNormal += n;
      totalExtra += e;
      estimatedIncomeJPY += calcIncomeJPY(n, e, mult) + a;
    }

    return {
      totalNormal: Math.round(totalNormal * 10) / 10,
      totalExtra: Math.round(totalExtra * 10) / 10,
      estimatedIncomeJPY: Math.round(estimatedIncomeJPY),
      daysWithRecords
    };
  }

  function calcIncomeJPY(normalHours, extraHours, multiplier = 1) {
    const s = state.settings;
    const normal = clampNumber(normalHours) * clampNumber(s.rateNormal);
    const extra = clampNumber(extraHours) * clampNumber(s.rateExtra);
    return (normal + extra) * Math.max(0.01, clampNumber(multiplier) || 1);
  }

  function monthWorkBreakdown(y, m) {
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}-`;

    const out = {
      dayTypes: {
        sunday: { days: 0, incomeJPY: 0 },
        holiday: { days: 0, incomeJPY: 0 },
        off_worked: { days: 0, incomeJPY: 0 }
      },
      shifts: {
        A: { days: 0, incomeJPY: 0 },
        B: { days: 0, incomeJPY: 0 },
        C: { days: 0, incomeJPY: 0 }
      }
    };

    for (const [iso, entry] of Object.entries(state.workEntries)) {
      if (!iso.startsWith(prefix)) continue;

      const shift = entry?.shift || "";
      const status = entry?.status || "work";
      const isOff = shift === "F" || status === "off";
      if (isOff) continue;

      const n = clampNumber(entry.normal);
      const e = clampNumber(entry.extra);
      const a = clampNumber(entry.addon);

      const dt = entry.dayType && entry.dayType !== "auto" ? entry.dayType : autoDayTypeForISO(iso);
      const mult = multiplierForDayType(dt);
      const dayIncome = calcIncomeJPY(n, e, mult) + a;

      if (dt === "sunday" || dt === "holiday" || dt === "off_worked") {
        out.dayTypes[dt].days += 1;
        out.dayTypes[dt].incomeJPY += dayIncome;
      }

      if (shift === "A" || shift === "B" || shift === "C") {
        out.shifts[shift].days += 1;
        out.shifts[shift].incomeJPY += dayIncome;
      }
    }

    for (const k of Object.keys(out.dayTypes)) {
      out.dayTypes[k].incomeJPY = Math.round(out.dayTypes[k].incomeJPY);
    }
    for (const k of Object.keys(out.shifts)) {
      out.shifts[k].incomeJPY = Math.round(out.shifts[k].incomeJPY);
    }

    return out;
  }

  function financeMonthStats(y, m) {
    const dispCur = state.settings.displayCurrency;

    let inDisplay = 0;
    let outDisplay = 0;
    let recvOnlyDisplay = 0;
    let payOnlyDisplay = 0;

    for (const e of state.financeEntries) {
      if (!isSameMonth(e.dateISO, y, m)) continue;
      const amtDisp = convert(e.amount, e.currency || "JPY", dispCur);
      const isIn = e.type === "recv" || e.type === "loan_in";

      if (isIn) inDisplay += amtDisp;
      else outDisplay += amtDisp;

      if (e.type === "recv") recvOnlyDisplay += amtDisp;
      if (e.type === "pay") payOnlyDisplay += amtDisp;
    }

    return {
      inDisplay,
      outDisplay,
      balanceDisplay: inDisplay - outDisplay,
      recvOnlyDisplay,
      payOnlyDisplay
    };
  }

  function budgetStats(y, m) {
    const dispCur = state.settings.displayCurrency;

    const active = state.expenseTemplates.filter((x) => x.active !== false);

    let fixedTotalDisplay = 0;
    let variableTotalDisplay = 0;

    for (const t of active) {
      const amtDisp = convert(t.amount, t.currency || "JPY", dispCur);
      if (t.type === "fixed") fixedTotalDisplay += amtDisp;
      else variableTotalDisplay += amtDisp;
    }

    const plannedTotalDisplay = fixedTotalDisplay + variableTotalDisplay;

    const templateNames = new Set(active.map((t) => normalizeText(t.name)));
    let paidTowardsPlannedDisplay = 0;

    for (const e of state.financeEntries) {
      if (!isSameMonth(e.dateISO, y, m)) continue;
      if (e.type !== "pay") continue;
      if (e.status !== "paid") continue;

      const cat = normalizeText(e.category || "");
      if (!cat) continue;

      if (templateNames.has(cat)) {
        paidTowardsPlannedDisplay += convert(e.amount, e.currency || "JPY", dispCur);
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

  // -----------------------------
  // SHEETS / MODALS
  // -----------------------------
  let lastFocusEl = null;
  let trapCleanup = null;

  function openSheet(id) {
    const el = $("#" + id);
    if (!el) return;

    lastFocusEl = document.activeElement;
    el.classList.add("show");
    el.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      const focusable = getFocusable(el);
      (focusable[0] || el).focus?.();
      trapCleanup?.();
      trapCleanup = trapFocus(el);
    });
  }

  function closeSheet(id) {
    const el = $("#" + id);
    if (!el) return;

    el.classList.remove("show");
    el.setAttribute("aria-hidden", "true");

    trapCleanup?.();
    trapCleanup = null;

    if (lastFocusEl?.focus) lastFocusEl.focus();
    lastFocusEl = null;
  }

  function openDaySheet(dateISO) {
    ui.selectedDateISO = dateISO;

    const dateEl = $("#daySheetDate");
    if (dateEl) dateEl.textContent = dateISO;

    const entry = state.workEntries[dateISO] || {};

    const shiftEl = $("#dayShift");
    const statusEl = $("#dayStatus");
    const dayTypeEl = $("#dayType");
    const normalEl = $("#dayNormal");
    const extraEl = $("#dayExtra");
    const addonEl = $("#dayAddon");
    const noteEl = $("#dayNote");

    if (shiftEl) shiftEl.value = entry.shift || "A";
    if (statusEl) statusEl.value = entry.status || "work";
    if (dayTypeEl) dayTypeEl.value = entry.dayType || "auto";
    if (normalEl) normalEl.value = entry.normal ?? "";
    if (extraEl) extraEl.value = entry.extra ?? "";
    if (addonEl) addonEl.value = entry.addon ?? "";
    if (noteEl) noteEl.value = entry.note ?? "";

    applyExtraFixedOnOpen();

    const rems = getRemindersForISO(dateISO);
    if (rems.length && noteEl) {
      noteEl.placeholder = `ex: ${reminderTitlePreview(rems)}`;
    }

    openSheet("sheetDay");
  }

  function applyExtraFixedOnOpen() {
    const extraEl = $("#dayExtra");
    if (!extraEl) return;

    const shift = $("#dayShift")?.value || "A";
    const status = $("#dayStatus")?.value || "work";
    const willWork = status === "work" && shift !== "F";

    const enabled = !!state.settings.extraFixedEnabled;
    const fixed = clampNumber(state.settings.extraFixedHours);

    if (!enabled || !willWork || fixed <= 0) return;

    const raw = String(extraEl.value || "").trim();
    if (raw === "") {
      extraEl.value = String(fixed);
      extraEl.dataset.autofilled = "1";
      return;
    }

    if (extraEl.dataset.autofilled === "1") {
      extraEl.value = String(fixed);
    }
  }

  function applyExtraFixedLive() {
    const extraEl = $("#dayExtra");
    if (!extraEl) return;

    const shift = $("#dayShift")?.value || "A";
    const status = $("#dayStatus")?.value || "work";
    const willWork = status === "work" && shift !== "F";

    const enabled = !!state.settings.extraFixedEnabled;
    const fixed = clampNumber(state.settings.extraFixedHours);

    if (!willWork) {
      if (extraEl.dataset.autofilled === "1") {
        extraEl.value = "";
        extraEl.dataset.autofilled = "0";
      }
      return;
    }

    if (enabled && fixed > 0) {
      const raw = String(extraEl.value || "").trim();
      if (raw === "" || extraEl.dataset.autofilled === "1") {
        extraEl.value = String(fixed);
        extraEl.dataset.autofilled = "1";
      }
    }
  }

  function saveDayEntry() {
    const iso = ui.selectedDateISO;
    const shift = $("#dayShift")?.value || "A";
    const status = $("#dayStatus")?.value || "work";

    const normalRaw = String($("#dayNormal")?.value || "").trim();
    const extraRaw = String($("#dayExtra")?.value || "").trim();

    const normal = clampNumber(normalRaw);
    let extra = clampNumber(extraRaw);

    const willWork = status === "work" && shift !== "F";
    if (state.settings.extraFixedEnabled && willWork && extraRaw === "") {
      extra = clampNumber(state.settings.extraFixedHours);
    }

    const addon = Math.round(clampNumber($("#dayAddon")?.value));
    const note = String($("#dayNote")?.value || "").trim();
    const dayType = $("#dayType")?.value || "auto";

    const isOff = shift === "F" || status === "off";
    const entry = {
      shift,
      status: isOff ? "off" : "work",
      normal: isOff ? 0 : normal,
      extra: isOff ? 0 : extra,
      addon: isOff ? 0 : addon,
      note,
      dayType
    };

    const hasAny = entry.shift || entry.normal || entry.extra || entry.addon || entry.note || (entry.dayType && entry.dayType !== "auto");
    if (!hasAny) {
      delete state.workEntries[iso];
    } else {
      state.workEntries[iso] = entry;
    }

    saveState();
    closeSheet("sheetDay");
    toast("Dia salvo.");
    renderCalendar();
    renderSummaryBar();
  }

  function clearDayEntry() {
    const iso = ui.selectedDateISO;
    delete state.workEntries[iso];
    saveState();
    closeSheet("sheetDay");
    toast("Dia limpo.");
    renderCalendar();
    renderSummaryBar();
  }

  function duplicateDayEntry() {
    const iso = ui.selectedDateISO;
    const entry = state.workEntries[iso];
    if (!entry) {
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

  function openFinanceCreateChooser() {
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
          <div class="helper" style="margin-top:10px;">
            <i class="fa-regular fa-lightbulb"></i>
            <span>Venda parcelada: você controla parcelas e pode gerar PDF do contrato.</span>
          </div>
        </div>
      `,
      `
        <button class="primary-btn grow" data-close-modal="true">
          <i class="fa-solid fa-xmark"></i><span>Fechar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

    on("#btnCreateEntry", "click", () => {
      closeModal();
      openFinanceSheet();
    });

    on("#btnCreateSale", "click", () => {
      closeModal();
      openSaleSheet();
    });
  }

  function openFinanceSheet() {
    const safeDay = Math.min(today.getDate(), new Date(ui.year, ui.month + 1, 0).getDate());

    if ($("#finType")) $("#finType").value = "pay";
    if ($("#finStatus")) $("#finStatus").value = "paid";
    if ($("#finCurrency")) $("#finCurrency").value = state.settings.displayCurrency;
    if ($("#finAmount")) $("#finAmount").value = "";
    if ($("#finCategory")) $("#finCategory").value = "";
    if ($("#finNote")) $("#finNote").value = "";
    if ($("#finDate")) $("#finDate").value = toISO(new Date(ui.year, ui.month, safeDay));

    openSheet("sheetFinance");
  }

  function saveFinanceEntry() {
    const type = $("#finType")?.value;
    const status = $("#finStatus")?.value;
    const currency = $("#finCurrency")?.value;
    const amount = Math.round(clampNumber($("#finAmount")?.value));
    const dateISO = $("#finDate")?.value || toISO(new Date());
    const category = String($("#finCategory")?.value || "").trim();
    const note = String($("#finNote")?.value || "").trim();

    if (!amount || amount <= 0) {
      toast("Informe um valor válido.");
      return;
    }

    state.financeEntries.push({
      id: cryptoId(),
      type,
      status,
      currency,
      amount,
      dateISO,
      category,
      note
    });

    saveState();
    closeSheet("sheetFinance");
    toast("Lançamento salvo.");
    renderFinance();
    renderSummaryBar();
  }

  function openExpenseSheet(presetType = "fixed") {
    if ($("#expType")) $("#expType").value = presetType;
    if ($("#expCurrency")) $("#expCurrency").value = state.settings.displayCurrency;
    if ($("#expName")) $("#expName").value = "";
    if ($("#expAmount")) $("#expAmount").value = "";
    if ($("#expDay")) $("#expDay").value = "";
    if ($("#expActive")) $("#expActive").value = "true";
    if ($("#expNote")) $("#expNote").value = "";
    openSheet("sheetExpense");
  }

  function saveExpenseTemplate() {
    const type = $("#expType")?.value;
    const currency = $("#expCurrency")?.value;
    const name = String($("#expName")?.value || "").trim();
    const amount = Math.round(clampNumber($("#expAmount")?.value));
    const dayOfMonth = Math.round(clampNumber($("#expDay")?.value));
    const active = $("#expActive")?.value === "true";
    const note = String($("#expNote")?.value || "").trim();

    if (!name) {
      toast("Informe o nome da despesa.");
      return;
    }
    if (!amount || amount <= 0) {
      toast("Informe um valor válido.");
      return;
    }
    if (dayOfMonth && (dayOfMonth < 1 || dayOfMonth > 31)) {
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

  function openSaleSheet() {
    if ($("#saleCurrency")) $("#saleCurrency").value = "BRL";
    if ($("#saleTotal")) $("#saleTotal").value = "";
    if ($("#saleDownPayment")) $("#saleDownPayment").value = "";
    if ($("#saleItem")) $("#saleItem").value = "";
    if ($("#saleBuyer")) $("#saleBuyer").value = "";
    if ($("#saleStart")) $("#saleStart").value = toISO(new Date());
    if ($("#saleDueDay")) $("#saleDueDay").value = "10";
    if ($("#saleInstallments")) $("#saleInstallments").value = "5";
    if ($("#saleLateFeePct")) $("#saleLateFeePct").value = "0";
    if ($("#saleNote")) $("#saleNote").value = "";
    openSheet("sheetSale");
  }

  function saveSaleContract() {
    const currency = $("#saleCurrency")?.value;
    const total = Math.round(clampNumber($("#saleTotal")?.value));
    const downPayment = Math.round(clampNumber($("#saleDownPayment")?.value));
    const item = String($("#saleItem")?.value || "").trim();
    const buyer = String($("#saleBuyer")?.value || "").trim();
    const startISO = $("#saleStart")?.value || toISO(new Date());
    const dueDay = Math.round(clampNumber($("#saleDueDay")?.value));
    const installments = Math.round(clampNumber($("#saleInstallments")?.value));
    const lateFeePct = clampNumber($("#saleLateFeePct")?.value);
    const note = String($("#saleNote")?.value || "").trim();

    if (!item || !buyer) {
      toast("Informe item e comprador.");
      return;
    }
    if (!total || total <= 0) {
      toast("Informe um total válido.");
      return;
    }
    if (downPayment < 0 || downPayment >= total) {
      if (downPayment !== 0) {
        toast("Entrada inválida (deve ser menor que o total).");
        return;
      }
    }
    if (!installments || installments < 1 || installments > 120) {
      toast("Parcelas inválidas (1–120).");
      return;
    }
    if (!dueDay || dueDay < 1 || dueDay > 28) {
      toast("Dia de vencimento inválido (1–28).");
      return;
    }

    const sale = {
      id: cryptoId(),
      currency,
      total,
      downPayment: Math.max(0, downPayment),
      item,
      buyer,
      startISO,
      dueDay,
      installments,
      lateFeePct: Math.max(0, lateFeePct),
      paidMap: {},
      paidInstallments: 0,
      note,
      createdAt: new Date().toISOString()
    };

    if (sale.downPayment > 0) {
      state.financeEntries.push({
        id: cryptoId(),
        type: "recv",
        status: "paid",
        currency: sale.currency,
        amount: sale.downPayment,
        dateISO: startISO,
        category: `Venda: ${sale.item} (Entrada)`,
        note: `Comprador: ${sale.buyer}`
      });
    }

    state.sales.push(sale);
    saveState();
    closeSheet("sheetSale");
    toast("Venda cadastrada.");
    renderFinance();
  }

  function openInvestSheet() {
    if ($("#invCurrency")) $("#invCurrency").value = state.settings.displayCurrency;
    if ($("#invName")) $("#invName").value = "";
    if ($("#invValue")) $("#invValue").value = "";
    if ($("#invDeposit")) $("#invDeposit").value = "";
    if ($("#invRoi")) $("#invRoi").value = "";
    if ($("#invNote")) $("#invNote").value = "";
    openSheet("sheetInvest");
  }

  function saveInvest() {
    const currency = $("#invCurrency")?.value;
    const name = String($("#invName")?.value || "").trim();
    const value = Math.round(clampNumber($("#invValue")?.value));
    const depositMonth = Math.round(clampNumber($("#invDeposit")?.value));
    const roi = clampNumber($("#invRoi")?.value);
    const note = String($("#invNote")?.value || "").trim();

    if (!name) {
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

  // -----------------------------
  // DRAWER
  // -----------------------------
  function openDrawer() {
    const d = $("#drawer");
    if (!d) return;

    lastFocusEl = document.activeElement;
    d.classList.add("show");
    d.setAttribute("aria-hidden", "false");

    ensureTutorialDrawerItem();

    requestAnimationFrame(() => {
      const focusable = getFocusable(d);
      (focusable[0] || d).focus?.();
      trapCleanup?.();
      trapCleanup = trapFocus(d);
    });
  }

  function closeDrawer() {
    const d = $("#drawer");
    if (!d) return;

    d.classList.remove("show");
    d.setAttribute("aria-hidden", "true");

    trapCleanup?.();
    trapCleanup = null;

    if (lastFocusEl?.focus) lastFocusEl.focus();
    lastFocusEl = null;
  }

  function ensureTutorialDrawerItem() {
    const items = $(".drawer-items");
    if (!items) return;
    if ($("#btnOpenTutorial")) return;

    const sep = items.querySelector(".drawer-sep");
    const btn = document.createElement("button");
    btn.className = "drawer-item";
    btn.id = "btnOpenTutorial";
    btn.innerHTML = `
      <i class="fa-regular fa-circle-question"></i>
      <span>Tutorial rápido</span>
    `;

    btn.addEventListener("click", () => {
      closeDrawer();
      openTutorialModal();
    });

    if (sep) items.insertBefore(btn, sep);
    else items.appendChild(btn);
  }

  function maybeOpenTutorialFirstTime() {
    if (uiState.tutorialSeen) return;
    uiState.tutorialSeen = true;
    saveUIState();
    openTutorialModal();
  }

  // -----------------------------
  // MODAL
  // -----------------------------
  function openModal(title, bodyHTML, actionsHTML) {
    const t = $("#modalTitle");
    const b = $("#modalBody");
    const a = $("#modalActions");
    const m = $("#modal");
    if (!m) return;

    if (t) t.textContent = title;
    if (b) b.innerHTML = bodyHTML;
    if (a) a.innerHTML = actionsHTML || "";

    lastFocusEl = document.activeElement;
    m.classList.add("show");
    m.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      const focusable = getFocusable(m);
      (focusable[0] || m).focus?.();
      trapCleanup?.();
      trapCleanup = trapFocus(m);
    });
  }

  function closeModal() {
    const m = $("#modal");
    if (!m) return;

    m.classList.remove("show");
    m.setAttribute("aria-hidden", "true");

    trapCleanup?.();
    trapCleanup = null;

    if (lastFocusEl?.focus) lastFocusEl.focus();
    lastFocusEl = null;
  }

  function openConfirmModal(title, text, onConfirm) {
    openModal(
      title,
      `
        <div class="field">
          <span>Confirmação</span>
          <div style="color:var(--muted); font-weight:750; line-height:1.35">${escapeHTML(text)}</div>
        </div>
      `,
      `
        <button class="ghost-btn grow" data-close-modal="true">
          <i class="fa-regular fa-circle-xmark"></i><span>Cancelar</span>
        </button>
        <button class="primary-btn grow" id="btnConfirmOk">
          <i class="fa-solid fa-check"></i><span>Confirmar</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
    on("#btnConfirmOk", "click", () => {
      closeModal();
      onConfirm?.();
    });
  }

  // -----------------------------
  // TUTORIAL
  // -----------------------------
  function openTutorialModal() {
    openModal(
      "Tutorial rápido",
      `
        <div class="helper">
          <i class="fa-regular fa-compass"></i>
          <span>Este guia foi pensado para você aprender o app sem tropeçar no primeiro uso.</span>
        </div>

        <div class="field" style="margin-top:8px;">
          <span>1) Calendário</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Toque em um dia para registrar <b>turno</b>, <b>horas normais</b>, <b>extras</b>, <b>adicional</b> e <b>observação</b>.
          </div>
        </div>

        <div class="field">
          <span>2) Visão Ano e Mês</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Use <b>Ano</b> para enxergar o panorama geral. Use <b>Mês</b> para editar dias.
            Em telas menores, a grade mensal pode ser arrastada também na horizontal.
          </div>
        </div>

        <div class="field">
          <span>3) Configurações</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Defina <b>valor da hora</b>, <b>hora extra</b>, <b>câmbio</b> e <b>extras fixas</b>.
            Depois disso, o app faz boa parte do trabalho pesado por você.
          </div>
        </div>

        <div class="field">
          <span>4) Padrões de escala</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Agora você pode montar a sequência com botões, usar presets prontos e escolher a partir de qual dia o padrão começa.
            Isso ajuda muito quando o mês não inicia no seu primeiro dia de trabalho.
          </div>
        </div>

        <div class="field">
          <span>5) Financeiro</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Registre <b>pagamentos</b>, <b>recebimentos</b>, <b>empréstimos</b> e <b>vendas parceladas</b>.
            O topo mostra saldo, entradas, saídas e projeções do mês.
          </div>
        </div>

        <div class="field">
          <span>Fluxo recomendado</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            <b>1.</b> Abra Configurações<br>
            <b>2.</b> Ajuste valores da hora e câmbio<br>
            <b>3.</b> Configure seu padrão de escala<br>
            <b>4.</b> Revise os dias do mês<br>
            <b>5.</b> Lance gastos e recebimentos
          </div>
        </div>
      `,
      `
        <button class="ghost-btn grow" id="btnTutorialPatterns">
          <i class="fa-solid fa-repeat"></i><span>Ir para Padrões</span>
        </button>
        <button class="primary-btn grow" data-close-modal="true">
          <i class="fa-solid fa-check"></i><span>Entendi</span>
        </button>
      `
    );

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

    on("#btnTutorialPatterns", "click", () => {
      closeModal();
      openPatternsModal();
    });
  }

  // -----------------------------
  // SETTINGS
  // -----------------------------
  function openSettingsModal() {
    const s = state.settings;

    const jobs = (state.employmentHistory || [])
      .slice()
      .sort((a, b) => a.startISO > b.startISO ? -1 : 1)
      .map((j) => {
        const end = j.endISO || "—";
        const reason = j.reason ? ` • ${escapeHTML(j.reason)}` : "";
        return `
          <div class="item" data-job="${j.id}">
            <div class="item-left">
              <div class="item-title">${escapeHTML(j.company)}</div>
              <div class="item-sub">${j.startISO} → ${end}${reason}</div>
            </div>
            <div class="item-right">
              <div class="tag">${j.endISO ? "finalizado" : "atual"}</div>
            </div>
          </div>
        `;
      }).join("");

    openModal(
      "Configurações",
      `
        <div class="helper">
          <i class="fa-regular fa-map"></i>
          <span>Aqui você define as regras do app: salário/hora, câmbio, extras fixas e adicionais.</span>
        </div>

        <div class="grid2" style="margin-top:10px;">
          <label class="field">
            <span>Moeda de visualização</span>
            <select id="setDisplayCurrency">
              <option value="JPY" ${s.displayCurrency === "JPY" ? "selected" : ""}>¥ (JPY)</option>
              <option value="BRL" ${s.displayCurrency === "BRL" ? "selected" : ""}>R$ (BRL)</option>
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
            <option value="true" ${s.autoCalc ? "selected" : ""}>Ligado</option>
            <option value="false" ${!s.autoCalc ? "selected" : ""}>Desligado</option>
          </select>
        </label>

        <div style="height:1px; background: var(--line); margin: 6px 0;"></div>

        <div class="helper">
          <i class="fa-regular fa-clock"></i>
          <span>Extras fixas ajudam quando sua rotina repete a mesma carga extra quase todos os dias.</span>
        </div>

        <div class="grid2">
          <label class="field">
            <span>Extra fixa</span>
            <select id="setExtraFixedEnabled">
              <option value="false" ${!s.extraFixedEnabled ? "selected" : ""}>Desligada</option>
              <option value="true" ${s.extraFixedEnabled ? "selected" : ""}>Ligada</option>
            </select>
          </label>
          <label class="field">
            <span>Horas de extra fixa</span>
            <input id="setExtraFixedHours" inputmode="decimal" value="${String(s.extraFixedHours ?? 2)}">
          </label>
        </div>

        <div class="grid2">
          <label class="field">
            <span>Multiplicador Domingo</span>
            <input id="setMultSunday" inputmode="decimal" value="${String(s.multSunday ?? 1.35)}">
          </label>
          <label class="field">
            <span>Multiplicador Feriado</span>
            <input id="setMultHoliday" inputmode="decimal" value="${String(s.multHoliday ?? 1.35)}">
          </label>
        </div>

        <label class="field">
          <span>Multiplicador Folga trabalhada</span>
          <input id="setMultOffWorked" inputmode="decimal" value="${String(s.multOffWorked ?? 1.25)}">
        </label>

        <label class="field">
          <span>Som de entrada de dinheiro</span>
          <select id="setSoundMoney">
            <option value="false" ${!s.soundMoney ? "selected" : ""}>Desligado</option>
            <option value="true" ${s.soundMoney ? "selected" : ""}>Ligado</option>
          </select>
        </label>

        <div class="grid2">
          <label class="field">
            <span>Cor turno A</span>
            <input id="setShiftA" value="${s.shiftColors.A}">
          </label>
          <label class="field">
            <span>Cor turno B</span>
            <input id="setShiftB" value="${s.shiftColors.B}">
          </label>
        </div>

        <label class="field">
          <span>Cor turno C</span>
          <input id="setShiftC" value="${s.shiftColors.C}">
        </label>

        <div class="field">
          <span>Atualizar câmbio (online)</span>
          <div style="display:flex; gap:8px;">
            <button class="ghost-btn grow" id="btnUpdateFx">
              <i class="fa-solid fa-rotate"></i><span>Atualizar</span>
            </button>
            <div style="flex:1; color:var(--muted); font-weight:750; font-size:11px; line-height:1.35; display:flex; align-items:center;">
              Se falhar, o app continua usando o valor manual.
            </div>
          </div>
          <div style="margin-top:6px; color:var(--muted); font-weight:750; font-size:11px;">
            Última atualização: ${s.fxLastUpdated ? escapeHTML(s.fxLastUpdated) : "—"}
          </div>
        </div>

        <div style="height:1px; background: var(--line); margin: 6px 0;"></div>

        <div class="field">
          <span>Histórico de empresas</span>
          <div style="color:var(--muted); font-weight:750; font-size:12px; line-height:1.35">
            Isso ajuda a enriquecer seus PDFs mensais.
          </div>
        </div>

        <label class="field">
          <span>Empresa</span>
          <input id="jobCompany" placeholder="ex: Toyota / YKK / fábrica X" />
        </label>

        <div class="grid2">
          <label class="field">
            <span>Início</span>
            <input id="jobStart" type="date" />
          </label>
          <label class="field">
            <span>Término (opcional)</span>
            <input id="jobEnd" type="date" />
          </label>
        </div>

        <label class="field">
          <span>Motivo da saída (opcional)</span>
          <input id="jobReason" placeholder="ex: troca de fábrica / contrato encerrado" />
        </label>

        <button class="primary-btn" id="btnAddJob">
          <i class="fa-solid fa-plus"></i><span>Adicionar empresa</span>
        </button>

        <div class="field" style="margin-top:6px;">
          <span>Lista (toque para excluir)</span>
          <div class="list" style="max-height:220px; overflow:auto; padding-right:4px;">
            ${jobs || `<div style="color:var(--muted); font-weight:750; padding:10px;">Sem histórico ainda.</div>`}
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

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

    on("#btnUpdateFx", "click", async () => {
      toast("Buscando câmbio...");
      const fx = await fetchFxJPYBRL();
      if (fx && fx > 0) {
        if ($("#setFx")) $("#setFx").value = String(fx.toFixed(4));
        toast(`Câmbio atualizado: 1¥=R$${fx.toFixed(3)}`);
      } else {
        toast("Não consegui atualizar. Usando câmbio manual.");
      }
    });

    on("#btnAddJob", "click", () => {
      const company = String($("#jobCompany")?.value || "").trim();
      const startISO = $("#jobStart")?.value;
      const endISO = $("#jobEnd")?.value || null;
      const reason = String($("#jobReason")?.value || "").trim();

      if (!company || !startISO) {
        toast("Informe empresa e data de início.");
        return;
      }
      if (endISO && endISO < startISO) {
        toast("Término não pode ser antes do início.");
        return;
      }

      state.employmentHistory.push({
        id: cryptoId(),
        company,
        startISO,
        endISO,
        reason
      });

      saveState();
      toast("Empresa adicionada.");
      closeModal();
      openSettingsModal();
    });

    $$("[data-job]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-job");
        const job = state.employmentHistory.find((j) => j.id === id);
        if (!job) return;

        openConfirmModal(
          "Excluir empresa?",
          `${job.company} • ${job.startISO} → ${job.endISO || "—"}`,
          () => {
            state.employmentHistory = state.employmentHistory.filter((j) => j.id !== id);
            saveState();
            toast("Empresa removida.");
            closeModal();
            openSettingsModal();
          }
        );
      });
    });

    on("#btnSaveSettings", "click", () => {
      state.settings.displayCurrency = $("#setDisplayCurrency")?.value || state.settings.displayCurrency;

      const fx = clampNumber($("#setFx")?.value);
      if (fx > 0) state.settings.fxJPYBRL = fx;

      state.settings.rateNormal = Math.round(clampNumber($("#setRateNormal")?.value));
      state.settings.rateExtra = Math.round(clampNumber($("#setRateExtra")?.value));
      state.settings.autoCalc = $("#setAutoCalc")?.value === "true";

      state.settings.extraFixedEnabled = $("#setExtraFixedEnabled")?.value === "true";
      state.settings.extraFixedHours = clampNumber($("#setExtraFixedHours")?.value) || 0;

      state.settings.multSunday = clampNumber($("#setMultSunday")?.value) || 1;
      state.settings.multHoliday = clampNumber($("#setMultHoliday")?.value) || 1;
      state.settings.multOffWorked = clampNumber($("#setMultOffWorked")?.value) || 1;

      state.settings.soundMoney = $("#setSoundMoney")?.value === "true";

      state.settings.shiftColors.A = String($("#setShiftA")?.value || "#7c5cff").trim();
      state.settings.shiftColors.B = String($("#setShiftB")?.value || "#00c2ff").trim();
      state.settings.shiftColors.C = String($("#setShiftC")?.value || "#ffb020").trim();

      saveState();
      applyShiftColors();
      renderCurrencyToggle();
      closeModal();
      toast("Configurações salvas.");
      renderAll();

      const sheetDay = $("#sheetDay");
      if (sheetDay?.classList.contains("show")) {
        applyExtraFixedLive();
      }
    });
  }

  async function fetchFxJPYBRL() {
    try {
      const r = await fetch("https://api.frankfurter.app/latest?from=JPY&to=BRL", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        const fx = j?.rates?.BRL;
        if (Number.isFinite(fx)) {
          state.settings.fxLastUpdated = new Date().toISOString();
          saveState();
          return fx;
        }
      }
    } catch {}

    try {
      const r = await fetch("https://api.exchangerate.host/latest?base=JPY&symbols=BRL", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        const fx = j?.rates?.BRL;
        if (Number.isFinite(fx)) {
          state.settings.fxLastUpdated = new Date().toISOString();
          saveState();
          return fx;
        }
      }
    } catch {}

    return null;
  }

  // -----------------------------
  // PATTERNS
  // -----------------------------
  function openPatternsModal() {
    const currentRaw = state.patterns.active || "AABBEE";
    const normalized = normalizePattern(currentRaw);
    const currentPattern = normalized.ok ? normalized.pattern : "AABBEE";

    openModal(
      "Padrões de escala",
      `
        <div class="helper">
          <i class="fa-regular fa-lightbulb"></i>
          <span>
            Monte sua escala tocando nos botões. Você pode usar presets, escolher em qual dia do mês a escala começa
            e deixar os dias anteriores sem mexer.
          </span>
        </div>

        <div class="field" style="margin-top:10px;">
          <span>Sequência atual</span>
          <input id="patActive" value="${escapeHTML(currentPattern)}" />
        </div>

        <div class="field">
          <span>Montar sequência</span>
          <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:8px;">
            <button class="ghost-btn" id="patAddA"><span>A</span></button>
            <button class="ghost-btn" id="patAddB"><span>B</span></button>
            <button class="ghost-btn" id="patAddC"><span>C</span></button>
            <button class="ghost-btn" id="patAddE"><span>Folga</span></button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:8px; margin-top:8px;">
            <button class="ghost-btn" id="patBack"><span>Apagar</span></button>
            <button class="ghost-btn" id="patClear"><span>Limpar</span></button>
            <button class="ghost-btn" id="patNormalize"><span>Corrigir</span></button>
          </div>
        </div>

        <div class="field">
          <span>Presets rápidos</span>
          <div style="display:flex; gap:8px; overflow:auto; padding-bottom:2px;">
            <button class="chip" data-preset="AABBEE">AABBEE</button>
            <button class="chip" data-preset="ABCE">ABCE</button>
            <button class="chip" data-preset="AABBE">AABBE</button>
            <button class="chip" data-preset="BBCCEE">BBCCEE</button>
            <button class="chip" data-preset="AEEAEE">AEEAEE</button>
            <button class="chip" data-preset="ABEE">ABEE</button>
          </div>
        </div>

        <div class="grid2">
          <label class="field">
            <span>Começar a aplicar no dia</span>
            <input id="patStartDay" inputmode="numeric" value="1" placeholder="1">
          </label>
          <label class="field">
            <span>Dias anteriores</span>
            <select id="patKeepBefore">
              <option value="true" selected>Manter como estão</option>
              <option value="false">Também preencher</option>
            </select>
          </label>
        </div>

        <label class="field">
          <span>Horas normais automáticas nos dias de trabalho</span>
          <input id="patDefaultNormal" inputmode="decimal" value="8" placeholder="8">
        </label>

        <div class="field">
          <span>Prévia dos primeiros 21 dias</span>
          <div id="patPreview" style="border:1px solid var(--line); border-radius:14px; padding:10px; background:rgba(255,255,255,.02); color:var(--muted); font-weight:850; line-height:1.55;"></div>
        </div>

        <div class="field">
          <span>Legenda</span>
          <div style="color:var(--muted); font-weight:750; line-height:1.45;">
            <b>A</b> = Dia • <b>B</b> = Noite • <b>C</b> = Madrugada • <b>E</b> = Folga
          </div>
        </div>
      `,
      `
        <button class="ghost-btn grow" id="btnPatternTutorial">
          <i class="fa-regular fa-circle-question"></i><span>Tutorial</span>
        </button>
        <button class="primary-btn grow" id="btnApplyPattern">
          <i class="fa-solid fa-wand-magic-sparkles"></i><span>Aplicar</span>
        </button>
      `
    );

    const previewNow = () => {
      const raw = String($("#patActive")?.value || "").trim();
      const res = normalizePattern(raw);
      const startDay = Math.max(1, Math.min(31, Math.round(clampNumber($("#patStartDay")?.value) || 1)));
      const keepBefore = $("#patKeepBefore")?.value === "true";
      const prev = $("#patPreview");

      if (!prev) return;

      if (!res.ok) {
        prev.textContent = `⚠️ ${res.error}`;
        return;
      }

      prev.innerHTML = buildPatternPreviewHTML(res.pattern, 21, startDay, keepBefore);
    };

    const setPatternInput = (next) => {
      const input = $("#patActive");
      if (!input) return;
      input.value = next;
      previewNow();
    };

    on("#patActive", "input", previewNow);
    on("#patStartDay", "input", previewNow);
    on("#patKeepBefore", "change", previewNow);

    on("#patAddA", "click", () => setPatternInput(String($("#patActive")?.value || "") + "A"));
    on("#patAddB", "click", () => setPatternInput(String($("#patActive")?.value || "") + "B"));
    on("#patAddC", "click", () => setPatternInput(String($("#patActive")?.value || "") + "C"));
    on("#patAddE", "click", () => setPatternInput(String($("#patActive")?.value || "") + "E"));

    on("#patBack", "click", () => {
      const current = String($("#patActive")?.value || "");
      setPatternInput(current.slice(0, -1));
    });

    on("#patClear", "click", () => setPatternInput(""));
    on("#patNormalize", "click", () => {
      const res = normalizePattern($("#patActive")?.value || "");
      if (!res.ok) {
        toast(res.error);
        return;
      }
      setPatternInput(res.pattern);
      toast("Sequência ajustada.");
    });

    $$("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setPatternInput(btn.getAttribute("data-preset") || "AABBEE");
      });
    });

    on("#btnPatternTutorial", "click", () => {
      closeModal();
      openPatternMiniTutorial();
    });

    on("#btnApplyPattern", "click", () => {
      const raw = String($("#patActive")?.value || "").trim();
      const res = normalizePattern(raw);
      if (!res.ok) {
        toast(res.error);
        return;
      }

      const startDay = Math.max(1, Math.min(31, Math.round(clampNumber($("#patStartDay")?.value) || 1)));
      const keepBefore = $("#patKeepBefore")?.value === "true";
      const defaultNormal = Math.max(0, clampNumber($("#patDefaultNormal")?.value) || 8);

      state.patterns.active = res.pattern;
      applyPatternToMonth(ui.year, ui.month, res.pattern, {
        startDay,
        keepBefore,
        defaultNormal
      });

      saveState();
      closeModal();
      toast("Padrão aplicado ao mês.");
      renderCalendar();
      renderSummaryBar();
    });

    previewNow();
  }

  function openPatternMiniTutorial() {
    openModal(
      "Como usar Padrões",
      `
        <div class="field">
          <span>Jeito mais fácil</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Monte a sequência tocando em <b>A</b>, <b>B</b>, <b>C</b> e <b>Folga</b>. O campo vai sendo preenchido sozinho.
          </div>
        </div>

        <div class="field">
          <span>Exemplo 1</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            <b>AABBEE</b> significa: 2 dias de turno A, 2 dias de turno B, 2 folgas, e depois repete.
          </div>
        </div>

        <div class="field">
          <span>Exemplo 2</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Se o seu primeiro dia de trabalho no mês é o dia 5, coloque <b>Começar a aplicar no dia 5</b>.
            Assim o app não bagunça os dias 1 a 4.
          </div>
        </div>

        <div class="field">
          <span>Para folgas intercaladas</span>
          <div style="color:var(--muted); line-height:1.45; font-weight:750;">
            Exemplo: <b>AEEAEE</b> cria um padrão com trabalho e folgas misturados.
          </div>
        </div>
      `,
      `
        <button class="primary-btn grow" id="btnBackToPatterns">
          <i class="fa-solid fa-arrow-left"></i><span>Voltar</span>
        </button>
      `
    );

    on("#btnBackToPatterns", "click", () => {
      closeModal();
      openPatternsModal();
    });
  }

  function normalizePattern(raw) {
    let s = String(raw || "").trim();
    if (!s) return { ok: false, error: "Digite um padrão (ex.: AABBEE)." };

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
      .replaceAll("-", "E");

    if (!/^[ABCE]+$/.test(s)) {
      return { ok: false, error: "Use apenas A, B, C e E (folga)." };
    }
    if (s.length < 2) {
      return { ok: false, error: "Padrão muito curto." };
    }

    return { ok: true, pattern: s };
  }

  function buildPatternPreviewHTML(pattern, count, startDay = 1, keepBefore = true) {
    const labels = { A: "A", B: "B", C: "C", E: "Folga" };
    const parts = [];

    for (let day = 1; day <= count; day++) {
      let label = "—";
      if (!keepBefore || day >= startDay) {
        const index = keepBefore ? day - startDay : day - 1;
        if (index >= 0) {
          const ch = pattern[index % pattern.length];
          label = labels[ch] || ch;
        }
      }
      parts.push(`<span style="display:inline-block; min-width:70px; margin:2px 6px 2px 0;">Dia ${day}: <b>${label}</b></span>`);
    }

    return parts.join("");
  }

  function applyPatternToMonth(y, m, pat, opts = {}) {
    const startDay = Math.max(1, Math.round(clampNumber(opts.startDay) || 1));
    const keepBefore = opts.keepBefore !== false;
    const defaultNormal = Math.max(0, clampNumber(opts.defaultNormal) || 8);

    const daysInMonth = new Date(y, m + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      if (keepBefore && d < startDay) continue;

      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const patternIndex = keepBefore ? d - startDay : d - 1;
      if (patternIndex < 0) continue;

      const ch = pat[patternIndex % pat.length];
      const old = state.workEntries[iso] || {};

      if (ch === "E") {
        state.workEntries[iso] = {
          ...old,
          shift: "F",
          status: "off",
          normal: 0,
          extra: 0,
          addon: 0,
          note: old.note || "",
          dayType: old.dayType || "auto"
        };
      } else {
        state.workEntries[iso] = {
          ...old,
          shift: ch,
          status: "work",
          normal: clampNumber(old.normal) || defaultNormal,
          extra: clampNumber(old.extra) || 0,
          addon: clampNumber(old.addon) || 0,
          note: old.note || "",
          dayType: old.dayType || "auto"
        };
      }
    }
  }

  // -----------------------------
  // REMINDERS
  // -----------------------------
  function openRemindersModal() {
    const items = (state.reminders || [])
      .slice()
      .sort((a, b) => a.dateISO > b.dateISO ? 1 : -1)
      .map((r) => {
        const t = guessReminderType(r.title);
        const cls = r.importance === "high" ? "rem-card-high" : r.importance === "med" ? "rem-card-med" : "rem-card-low";
        const ico = t === "bday" ? "🎂" : "🔔";
        return `
          <div class="item ${cls}" data-rem="${r.id}">
            <div class="item-left">
              <div class="item-title">${ico} ${escapeHTML(r.title)}</div>
              <div class="item-sub">${r.dateISO} • ${r.importance} • som: ${r.sound ? "on" : "off"}</div>
            </div>
            <div class="item-right">
              <div class="tag">${r.importance}</div>
            </div>
          </div>
        `;
      }).join("");

    openModal(
      "Lembretes & aniversários",
      `
        <div class="helper">
          <i class="fa-regular fa-bell"></i>
          <span>Lembretes aparecem todo ano por mês e dia, com destaque visual no calendário.</span>
        </div>

        <div class="grid2" style="margin-top:10px;">
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
          <input id="remTitle" placeholder="ex: Aniversário do Pai" />
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
          <div class="list" style="max-height:220px; overflow:auto; padding-right:4px;">
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

    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

    on("#btnAddRem", "click", () => {
      const dateISO = $("#remDate")?.value;
      const title = String($("#remTitle")?.value || "").trim();
      const importance = $("#remImp")?.value;
      const sound = $("#remSound")?.value === "true";

      if (!dateISO || !title) {
        toast("Informe data e título.");
        return;
      }

      state.reminders = state.reminders || [];
      state.reminders.push({ id: cryptoId(), dateISO, title, importance, sound });
      saveState();
      toast("Lembrete adicionado.");

      closeModal();
      openRemindersModal();
      renderCalendar();
    });

    $$(".item[data-rem]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-rem");
        openConfirmModal("Excluir lembrete?", "Este lembrete será removido.", () => {
          state.reminders = (state.reminders || []).filter((r) => r.id !== id);
          saveState();
          toast("Lembrete removido.");
          closeModal();
          openRemindersModal();
          renderCalendar();
        });
      });
    });
  }

  // -----------------------------
  // PDF
  // -----------------------------
  function jobsForMonth(y, m) {
    const start = startOfMonth(y, m);
    const end = endOfMonth(y, m);

    return (state.employmentHistory || [])
      .filter((j) => {
        const js = fromISO(j.startISO);
        const je = j.endISO ? fromISO(j.endISO) : null;
        return js <= end && (!je || je >= start);
      })
      .sort((a, b) => a.startISO > b.startISO ? 1 : -1);
  }

  function printMonthPDF(y, m) {
    const dispCur = state.settings.displayCurrency;

    const work = monthStats(y, m);
    const fin = financeMonthStats(y, m);
    const bud = budgetStats(y, m);
    const breakdown = monthWorkBreakdown(y, m);

    const workIncome = convert(work.estimatedIncomeJPY, "JPY", dispCur);
    const grossReal = workIncome + fin.recvOnlyDisplay;
    const netReal = grossReal - fin.payOnlyDisplay;
    const netForecast = netReal - bud.remainingDisplay;

    const title = `Resumo do mês • ${monthsLong[m]} ${y}`;

    const jobs = jobsForMonth(y, m);
    const jobsText = jobs.length
      ? jobs.map((j) => `${j.company} (${j.startISO} → ${j.endISO || "—"}${j.reason ? ` • ${j.reason}` : ""})`).join("<br>")
      : "—";

    const dayTypeRows = [
      ["Domingos trabalhados", `${breakdown.dayTypes.sunday.days} dia(s)`],
      ["Ganho em Domingos", moneyIn(dispCur, convert(breakdown.dayTypes.sunday.incomeJPY, "JPY", dispCur))],
      ["Feriados trabalhados", `${breakdown.dayTypes.holiday.days} dia(s)`],
      ["Ganho em Feriados", moneyIn(dispCur, convert(breakdown.dayTypes.holiday.incomeJPY, "JPY", dispCur))],
      ["Folga trabalhada", `${breakdown.dayTypes.off_worked.days} dia(s)`],
      ["Ganho folga trabalhada", moneyIn(dispCur, convert(breakdown.dayTypes.off_worked.incomeJPY, "JPY", dispCur))]
    ];

    const shiftRows = [
      ["Turno A (Dia)", `${breakdown.shifts.A.days} dia(s)`],
      ["Ganho Turno A", moneyIn(dispCur, convert(breakdown.shifts.A.incomeJPY, "JPY", dispCur))],
      ["Turno B (Noite)", `${breakdown.shifts.B.days} dia(s)`],
      ["Ganho Turno B", moneyIn(dispCur, convert(breakdown.shifts.B.incomeJPY, "JPY", dispCur))],
      ["Turno C (Madrugada)", `${breakdown.shifts.C.days} dia(s)`],
      ["Ganho Turno C", moneyIn(dispCur, convert(breakdown.shifts.C.incomeJPY, "JPY", dispCur))]
    ];

    const htmlRows = (arr) => arr.map(([k, v]) => `<tr><td>${escapeHTML(k)}</td><td>${escapeHTML(v)}</td></tr>`).join("");

    const html = `
      <html><head><meta charset="utf-8">
      <title>${escapeHTML(title)}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:18px;color:#111;}
        h1{font-size:18px;margin:0 0 8px 0;}
        .muted{color:#555;font-size:12px;line-height:1.35;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;}
        .card{border:1px solid #ddd;border-radius:10px;padding:10px;}
        .k{font-size:11px;color:#666;}
        .v{font-size:16px;font-weight:800;margin-top:6px;}
        table{width:100%;border-collapse:collapse;margin-top:12px;}
        th,td{border:1px solid #ddd;padding:8px;font-size:12px;}
        th{background:#f4f4f4;text-align:left;}
        .section{margin-top:14px;}
        .section-title{font-weight:800;font-size:12px;color:#333;margin:12px 0 6px;}
        .footer{position:fixed;bottom:10px;left:18px;right:18px;font-size:11px;color:#666;display:flex;justify-content:space-between;}
      </style></head><body>
        <h1>${escapeHTML(title)}</h1>
        <div class="muted">Moeda: ${dispCur} • ${escapeHTML(fxLabel())}</div>

        <div class="card" style="margin-top:12px;">
          <div class="k">Empresa(s) no período</div>
          <div class="muted" style="margin-top:6px;">${jobsText}</div>
        </div>

        <div class="grid">
          <div class="card"><div class="k">Horas normais</div><div class="v">${work.totalNormal}h</div></div>
          <div class="card"><div class="k">Horas extras</div><div class="v">${work.totalExtra}h</div></div>
          <div class="card"><div class="k">Bruto (real)</div><div class="v">${moneyIn(dispCur, grossReal)}</div></div>
          <div class="card"><div class="k">Líquido (prev.)</div><div class="v">${moneyIn(dispCur, netForecast)}</div></div>
        </div>

        <div class="section">
          <div class="section-title">Detalhes de trabalho (compacto)</div>
          <table>
            <tr><th>Item</th><th>Valor</th></tr>
            ${htmlRows(dayTypeRows)}
            ${htmlRows(shiftRows)}
          </table>
        </div>

        <div class="section">
          <div class="section-title">Financeiro</div>
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
        </div>

        <div class="muted" style="margin-top:12px;">No celular: “Compartilhar / Salvar como PDF” após imprimir.</div>

        <div class="footer">
          <div>Copyright @ 2026 - Ailton A. Nakata</div>
          <div>${escapeHTML(monthsLong[m])} ${y}</div>
        </div>
      </body></html>
    `;

    const w = window.open("", "_blank");
    if (!w) {
      toast("Bloqueado pelo navegador. Permita pop-ups.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  function printSalePDF(saleId) {
    const sale = state.sales.find((s) => s.id === saleId);
    if (!sale) {
      toast("Venda não encontrada.");
      return;
    }

    const schedule = getSaleSchedule(sale);
    const endISO = schedule.length ? schedule[schedule.length - 1].dueISO : "—";

    const rows = schedule.map((x) => `
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
        body{font-family:Arial,sans-serif;padding:18px;color:#111;}
        h1{font-size:18px;margin:0 0 8px 0;}
        .muted{color:#555;font-size:12px;line-height:1.35;}
        .card{border:1px solid #ddd;border-radius:10px;padding:10px;margin-top:12px;}
        table{width:100%;border-collapse:collapse;margin-top:12px;}
        th,td{border:1px solid #ddd;padding:8px;font-size:12px;}
        th{background:#f4f4f4;text-align:left;}
        .footer{position:fixed;bottom:10px;left:18px;right:18px;font-size:11px;color:#666;display:flex;justify-content:space-between;}
      </style></head><body>
        <h1>${escapeHTML(title)}</h1>
        <div class="muted">
          Item: <b>${escapeHTML(sale.item)}</b><br>
          Comprador: <b>${escapeHTML(sale.buyer)}</b><br>
          Total: <b>${moneyIn(sale.currency, sale.total)}</b>
          ${sale.downPayment ? ` • Entrada: <b>${moneyIn(sale.currency, sale.downPayment)}</b>` : ""}
          • Parcelas: <b>${sale.installments}x</b><br>
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

        <div class="muted" style="margin-top:12px;">No celular: “Compartilhar / Salvar como PDF” após imprimir.</div>

        <div class="footer">
          <div>Copyright @ 2026 - Ailton A. Nakata</div>
          <div>Contrato</div>
        </div>
      </body></html>
    `;

    const w = window.open("", "_blank");
    if (!w) {
      toast("Bloqueado pelo navegador. Permita pop-ups.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  // -----------------------------
  // THEME / COLORS
  // -----------------------------
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = $("#btnTheme i");
    if (icon) {
      icon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
  }

  function applyShiftColors() {
    const c = state.settings.shiftColors;
    document.documentElement.style.setProperty("--shiftA", c.A);
    document.documentElement.style.setProperty("--shiftB", c.B);
    document.documentElement.style.setProperty("--shiftC", c.C);
  }

  // -----------------------------
  // TOAST
  // -----------------------------
  let toastTimer = null;

  function toast(msg) {
    const t = $("#toast");
    if (!t) return;

    t.textContent = msg;
    t.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // -----------------------------
  // FOCUS HELPERS
  // -----------------------------
  function getFocusable(root) {
    return $$(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      root
    ).filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }

  function trapFocus(container) {
    const handler = (e) => {
      if (e.key !== "Tab") return;

      const focusables = getFocusable(container);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }

  // -----------------------------
  // STYLE INJECTION
  // -----------------------------
  function injectReminderStyles() {
    if ($("#nakata-reminder-style")) return;

    const bellSVG = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="white" d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2Z"/>
      </svg>
    `.trim());

    const style = document.createElement("style");
    style.id = "nakata-reminder-style";
    style.textContent = `
      .badge.REM{
        background: rgba(0,194,255,.16);
        border-color: rgba(0,194,255,.28);
      }
      .badge.REM::after{
        background-image: url("data:image/svg+xml,${bellSVG}");
      }

      @keyframes remPulse{
        0%{ transform: translateZ(0) scale(1); filter: saturate(.9); opacity:.85; }
        55%{ transform: translateZ(0) scale(1.08); filter: saturate(1.15); opacity:1; }
        100%{ transform: translateZ(0) scale(1); filter: saturate(.9); opacity:.85; }
      }
      .rem-pulse{ animation: remPulse 1.35s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce){
        .rem-pulse{ animation:none !important; }
      }

      .day.has-rem.rem-high{ box-shadow: inset 0 0 0 1px rgba(255,92,122,.55); }
      .day.has-rem.rem-med{ box-shadow: inset 0 0 0 1px rgba(255,176,32,.55); }
      .day.has-rem.rem-low{ box-shadow: inset 0 0 0 1px rgba(0,194,255,.45); }

      .day.has-rem.rem-high{ background: linear-gradient(180deg, rgba(255,92,122,.10), rgba(255,255,255,0)); }
      .day.has-rem.rem-med{ background: linear-gradient(180deg, rgba(255,176,32,.10), rgba(255,255,255,0)); }
      .day.has-rem.rem-low{ background: linear-gradient(180deg, rgba(0,194,255,.08), rgba(255,255,255,0)); }

      .rem-card-high{ border-color: rgba(255,92,122,.35) !important; background: rgba(255,92,122,.06) !important; }
      .rem-card-med{ border-color: rgba(255,176,32,.35) !important; background: rgba(255,176,32,.06) !important; }
      .rem-card-low{ border-color: rgba(0,194,255,.30) !important; background: rgba(0,194,255,.05) !important; }

      .rem-year-ico{
        display:inline-block;
        width:12px;
        height:12px;
        margin-left:6px;
        vertical-align:-2px;
        background-image: url("data:image/svg+xml,${bellSVG}");
        background-repeat:no-repeat;
        background-position:center;
        background-size:contain;
        opacity:.65;
        filter:saturate(.9);
      }
    `;
    document.head.appendChild(style);
  }

  function injectRuntimeFixStyles() {
    if ($("#nakata-runtime-fixes")) return;

    const style = document.createElement("style");
    style.id = "nakata-runtime-fixes";
    style.textContent = `
      @media (max-width: 768px){
        #financeFiltersRow .chips{
          overflow-x: auto !important;
          overflow-y: hidden !important;
          flex-wrap: nowrap !important;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
        }

        #financeFiltersRow .chips::-webkit-scrollbar{
          height: 6px;
        }

        #monthArea{
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
          scrollbar-width: thin;
        }

        #monthArea::-webkit-scrollbar{
          height: 8px;
        }

        #monthArea::-webkit-scrollbar-thumb{
          background: rgba(255,255,255,.18);
          border-radius: 999px;
        }

        [data-theme="light"] #monthArea::-webkit-scrollbar-thumb{
          background: rgba(16,20,35,.18);
        }

        #monthArea .dow,
        #monthArea .month-grid{
          min-width: 560px;
        }

        .summary-bar{
          grid-template-columns: repeat(2, minmax(0,1fr));
        }

        #financeProjectionBar{
          grid-template-columns: repeat(2, minmax(0,1fr)) !important;
        }
      }

      @media (min-width: 769px){
        #monthArea{
          overflow-x: hidden;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureMonthlyHorizontalScroll() {
    const monthArea = $("#monthArea");
    if (!monthArea || ui.calMode !== "month") return;

    requestAnimationFrame(() => {
      if (monthArea.scrollLeft > 0 && monthArea.scrollWidth <= monthArea.clientWidth) {
        monthArea.scrollLeft = 0;
      }
    });
  }
})();