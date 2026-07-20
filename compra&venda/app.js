(() => {
  "use strict";

  const APP_VERSION = "1.1.0";
  const SCHEMA_VERSION = 4;
  const STORAGE_KEY = "cvpro:data:v4";
  const RATES_TTL_MS = 12 * 60 * 60 * 1000;

  const CURRENCIES = ["BRL", "USD", "JPY"];
  const SIGNS = { BRL: "R$", USD: "US$", JPY: "¥" };

  const DEFAULT_LOAN_RATE = 0.0067; // 0,67% ao mês (0,5% + TR estimada)
  const DEFAULT_INTEREST_TYPE = "poupanca";
  const INTEREST_TYPES = ["poupanca"];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const nowISO = () => new Date().toISOString();

  const todayISODate = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const safeUUID = () => {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  const safeClone = (value) => {
    try {
      if (typeof structuredClone === "function") return structuredClone(value);
    } catch {}
    return JSON.parse(JSON.stringify(value));
  };

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const escapeHTML = (s) => String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const parseMoneyInput = (raw) => {
    const s = String(raw ?? "").trim().replace(/\s+/g, "");
    if (!s) return NaN;
    const normalized = s.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  };

  const roundByCurrency = (value, currency) => {
    const d = currency === "JPY" ? 0 : 2;
    const p = Math.pow(10, d);
    return Math.round((value + Number.EPSILON) * p) / p;
  };

  const formatCurrency = (value, currency) => {
    const sign = SIGNS[currency] ?? "";
    const decimals = currency === "JPY" ? 0 : 2;
    const n = Number(value);
    if (!Number.isFinite(n)) return `${sign} —`;
    const parts = n.toFixed(decimals).split(".");
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return currency === "JPY" ? `${sign} ${int}` : `${sign} ${int},${parts[1]}`;
  };

  const formatDateBR = (isoDate) => {
    if (!isoDate) return "—";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return "—";
    return `${d}/${m}/${y}`;
  };

  const ymOf = (isoDate) => {
    if (!isoDate) return "";
    const [y, m] = isoDate.split("-");
    return y && m ? `${y}-${m}` : "";
  };

  const addMonths = (y, m, add) => {
    const total = (y * 12 + (m - 1)) + add;
    const ny = Math.floor(total / 12);
    const nm = (total % 12) + 1;
    return [ny, nm];
  };

  const lastDayOfMonth = (y, m) => new Date(y, m, 0).getDate();

  const buildISODate = (y, m, d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${y}-${pad(m)}-${pad(d)}`;
  };

  const computeFirstDue = (agreementISO, dueDay) => {
    const [yS, mS, dS] = agreementISO.split("-");
    const y = Number(yS), m = Number(mS), d = Number(dS);
    const day = clamp(Number(dueDay || d), 1, 31);

    const maxD = lastDayOfMonth(y, m);
    const adjusted = clamp(day, 1, maxD);

    if (adjusted >= d) return buildISODate(y, m, adjusted);

    const [ny, nm] = addMonths(y, m, 1);
    const max2 = lastDayOfMonth(ny, nm);
    return buildISODate(ny, nm, clamp(day, 1, max2));
  };

  const nextDueDates = (firstDueISO, frequency, count, dayPref) => {
    const [yS, mS, dS] = firstDueISO.split("-");
    const y = Number(yS), m = Number(mS), d = Number(dS);
    const dueDay = clamp(Number(dayPref || d), 1, 31);

    const step = frequency === "anual" ? 12 : 1;
    const out = [];
    for (let i = 0; i < count; i++) {
      const [yy, mm] = addMonths(y, m, i * step);
      const maxD = lastDayOfMonth(yy, mm);
      out.push(buildISODate(yy, mm, clamp(dueDay, 1, maxD)));
    }
    return out;
  };

  const parseISOToDate = (isoDate) => {
    if (!isoDate) return null;
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const monthsBetween = (fromISO, toISO) => {
    const a = parseISOToDate(fromISO);
    const b = parseISOToDate(toISO);
    if (!a || !b) return 0;
    let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (b.getDate() < a.getDate()) months -= 1;
    return Math.max(0, months);
  };

  const normalizeInterestType = () => DEFAULT_INTEREST_TYPE;

  const getInterestTypeLabel = () => "Correção pela Poupança";

  const getInterestTypeHint = () => "Calculada parcela por parcela, por meses completos após cada vencimento.";

  const getInterestTypeLongLabel = (tx) => {
    const rate = Number.isFinite(tx?.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE;
    return `Correção pela Poupança (${(rate * 100).toFixed(2).replace(".", ",")}% ao mês)`;
  };

  /* ---------------- Storage ---------------- */
  const Storage = (() => {
    const defaultSettings = () => ({
      displayCurrency: "BRL",
      lastRates: null,
      defaultSavingsRate: DEFAULT_LOAN_RATE,
    });

    const defaultData = () => ({
      schemaVersion: SCHEMA_VERSION,
      appVersion: APP_VERSION,
      settings: defaultSettings(),
      transactions: [],
    });

    const finiteMoney = (value, fallback = 0) => {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? n : fallback;
    };

    const normalizeInstallmentForStorage = (inst, idx) => {
      const value = finiteMoney(inst?.originalValue, finiteMoney(inst?.value, 0));
      const rawPaid = inst?.status === "pago" ? value : finiteMoney(inst?.paidAmount, 0);
      const paidAmount = Math.min(value, rawPaid);
      const status = paidAmount >= value && value > 0 ? "pago" : "pendente";
      return {
        id: inst?.id || safeUUID(),
        number: Number.isInteger(inst?.number) ? inst.number : idx + 1,
        dueDate: inst?.dueDate || null,
        value,
        originalValue: value,
        paidAmount,
        status,
        paidAt: status === "pago" ? (inst?.paidAt || todayISODate()) : null,
      };
    };

    const inferredMovements = (tx) => {
      const paid = (tx.installments || []).filter(i => i.status === "pago" || Number(i.paidAmount || 0) > 0);
      if (!paid.length) return [];
      return paid.map(i => ({
        id: safeUUID(),
        type: "payment_imported",
        amount: finiteMoney(i.paidAmount, finiteMoney(i.value, 0)),
        date: i.paidAt || tx.updatedAt || tx.createdAt || nowISO(),
        installmentNumber: i.number,
        note: "Pagamento recuperado da versão anterior.",
      }));
    };

    const normalizeTransaction = (tx) => {
      const t = safeClone(tx || {});
      t.installments = Array.isArray(t.installments)
        ? t.installments.map(normalizeInstallmentForStorage)
        : [];

      const scheduleTotal = t.installments.reduce((sum, i) => sum + finiteMoney(i.originalValue, 0), 0);
      t.originalValue = finiteMoney(t.originalValue, finiteMoney(t.totalValue, scheduleTotal));
      t.totalValue = t.originalValue;

      if (t.type === "emprestimo") {
        if (!Number.isFinite(Number(t.loanRate)) || Number(t.loanRate) < 0) t.loanRate = DEFAULT_LOAN_RATE;
        else t.loanRate = Number(t.loanRate);
        const previousType = t.interestType;
        if (previousType && previousType !== DEFAULT_INTEREST_TYPE && !t.legacyInterestType) {
          t.legacyInterestType = previousType;
        }
        t.interestType = DEFAULT_INTEREST_TYPE;
      } else {
        t.loanRate = null;
        t.interestType = null;
      }

      t.movements = Array.isArray(t.movements) ? t.movements : inferredMovements(t);
      t.createdAt = t.createdAt || nowISO();
      t.updatedAt = t.updatedAt || t.createdAt;
      return t;
    };

    const migrate = (data) => {
      if (!data || typeof data !== "object") return defaultData();
      const d = safeClone(data);
      d.settings = { ...defaultSettings(), ...(d.settings || {}) };
      const savingsRate = Number(d.settings.defaultSavingsRate);
      d.settings.defaultSavingsRate = Number.isFinite(savingsRate) && savingsRate >= 0
        ? savingsRate
        : DEFAULT_LOAN_RATE;
      d.transactions = Array.isArray(d.transactions) ? d.transactions.map(normalizeTransaction) : [];
      d.schemaVersion = SCHEMA_VERSION;
      d.appVersion = APP_VERSION;
      return d;
    };

    const load = () => {
      try {
        const keys = [STORAGE_KEY, "cvpro:data:v3", "cvpro:data:v2", "cvpro:data:v1"];
        for (const key of keys) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const migrated = migrate(JSON.parse(raw));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
        return defaultData();
      } catch {
        return defaultData();
      }
    };

    const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(migrate(data)));
    const clear = () => ["cvpro:data:v4", "cvpro:data:v3", "cvpro:data:v2", "cvpro:data:v1"].forEach(k => localStorage.removeItem(k));

    return { load, save, clear, migrate, defaultData };
  })();

  /* ---------------- Rates ---------------- */
  const Rates = (() => {
    const isOnline = () => navigator.onLine;

    const normalizeRates = (payload, base = "BRL") => {
      const usd = Number(payload?.rates?.USD ?? payload?.USD);
      const jpy = Number(payload?.rates?.JPY ?? payload?.JPY);
      const hasUSD = Number.isFinite(usd) && usd > 0;
      const hasJPY = Number.isFinite(jpy) && jpy > 0;
      return { base, USD: hasUSD ? usd : null, JPY: hasJPY ? jpy : null, updatedAt: nowISO() };
    };

    const isFresh = (rates) => {
      if (!rates?.updatedAt) return false;
      const t = new Date(rates.updatedAt).getTime();
      return Number.isFinite(t) && (Date.now() - t) <= RATES_TTL_MS;
    };

    const fetchFrankfurter = async () => {
      const res = await fetch("https://api.frankfurter.app/latest?from=BRL&to=USD,JPY", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha frankfurter");
      const json = await res.json();
      return normalizeRates(json, "BRL");
    };

    const fetchErApi = async () => {
      const res = await fetch("https://open.er-api.com/v6/latest/BRL", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha er-api");
      const json = await res.json();
      return normalizeRates({ rates: json?.rates ?? {} }, "BRL");
    };

    const updateRates = async (state, { forceToast = true } = {}) => {
      if (!isOnline()) {
        if (forceToast) UI.toast("Sem internet. Usando última cotação salva.", "warn");
        return { ok: false, rates: state.settings.lastRates ?? null, offline: true };
      }

      try {
        let rates;
        try { rates = await fetchFrankfurter(); }
        catch { rates = await fetchErApi(); }

        const merged = { base: "BRL", USD: rates.USD ?? null, JPY: rates.JPY ?? null, updatedAt: rates.updatedAt };
        state.settings.lastRates = merged;
        Storage.save(state);
        if (forceToast) UI.toast("Câmbio atualizado.", "good");
        return { ok: true, rates: merged, offline: false };
      } catch {
        if (forceToast) UI.toast("Não foi possível atualizar câmbio. Usando cotação salva.", "warn");
        return { ok: false, rates: state.settings.lastRates ?? null, offline: false };
      }
    };

    const convert = (amount, from, to, rates) => {
      if (from === to) return { ok: true, value: roundByCurrency(amount, to), note: null };

      const r = rates ?? null;
      const usd = r?.USD ?? null;
      const jpy = r?.JPY ?? null;

      const have = (cur) => (cur === "USD" ? usd : cur === "JPY" ? jpy : 1);
      const rateTo = have(to);
      const rateFrom = have(from);

      const missing = (cur) => cur !== "BRL" && !Number.isFinite(have(cur));
      if (missing(from) || missing(to)) return { ok: false, value: amount, note: "Taxa indisponível" };

      let brl;
      if (from === "BRL") brl = amount;
      else brl = amount / rateFrom;

      let out;
      if (to === "BRL") out = brl;
      else out = brl * rateTo;

      return { ok: true, value: roundByCurrency(out, to), note: null };
    };

    const rateLine = (from, to, rates) => {
      if (!rates || from === to) return null;
      if (rates.base !== "BRL") return null;
      const fmt = (n) => (Number.isFinite(n) ? String(n) : "—");
      if (from === "BRL" && to === "USD") return `1 BRL = ${fmt(rates.USD)} USD`;
      if (from === "BRL" && to === "JPY") return `1 BRL = ${fmt(rates.JPY)} JPY`;
      if (from === "USD" && to === "JPY") return `BRL→USD: ${fmt(rates.USD)} | BRL→JPY: ${fmt(rates.JPY)}`;
      if (from === "JPY" && to === "USD") return `BRL→JPY: ${fmt(rates.JPY)} | BRL→USD: ${fmt(rates.USD)}`;
      return `BRL→USD: ${fmt(rates.USD)} | BRL→JPY: ${fmt(rates.JPY)}`;
    };

    return { updateRates, isFresh, convert, isOnline, rateLine };
  })();

  /* ---------------- UI ---------------- */
  const UI = (() => {
    const wrap = $("#toastWrap");
    const overlayMap = () => ({ menu: $("#menuOverlay"), receipt: $("#receiptOverlay") });
    let lastFocus = null;

    const lockScroll = () => {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    };

    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };

    const toast = (msg, type = "good", opts = {}) => {
      const id = safeUUID();
      const el = document.createElement("div");
      el.className = `toast ${type}`;
      el.dataset.toastId = id;

      const p = document.createElement("p");
      p.textContent = msg;

      const actions = document.createElement("div");
      actions.className = "actions";

      if (opts.action?.label && typeof opts.action.onClick === "function") {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn mini";
        b.textContent = opts.action.label;
        b.addEventListener("click", () => { try { opts.action.onClick(); } finally { dismiss(id); } });
        actions.appendChild(b);
      }

      const close = document.createElement("button");
      close.type = "button";
      close.className = "btn mini";
      close.textContent = "Fechar";
      close.addEventListener("click", () => dismiss(id));
      actions.appendChild(close);

      el.appendChild(p);
      el.appendChild(actions);
      wrap.appendChild(el);

      const ttl = clamp(Number(opts.ttl ?? 4500), 1500, 12000);
      window.setTimeout(() => dismiss(id), ttl);
      return id;
    };

    const dismiss = (id) => {
      const el = wrap.querySelector(`[data-toast-id="${CSS.escape(id)}"]`);
      if (el) el.remove();
    };

    const setFieldError = (id, message) => {
      const box = $(`#err-${id}`);
      if (box) box.textContent = message || "";
    };

    const setTabCurrent = (route) => {
      $$(".tab").forEach(a => {
        const r = a.getAttribute("data-route");
        if (r === route) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    };

    const anyOverlayOpen = () => {
      const map = overlayMap();
      return Object.values(map).some(el => el && !el.hidden);
    };

    const openOverlay = (kind) => {
      const map = overlayMap();
      const ov = map[kind];
      if (!ov) return;

      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

      ov.hidden = false;
      lockScroll();

      if (kind === "menu") $("#menuBtn")?.setAttribute("aria-expanded", "true");

      const body = ov.querySelector(".panel-body");
      if (body) body.scrollTop = 0;

      const focusable = ov.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (focusable) focusable.focus();
    };

    const closeOverlay = (kind) => {
      const map = overlayMap();
      const ov = map[kind];
      if (!ov) return;

      ov.hidden = true;

      if (!anyOverlayOpen()) unlockScroll();

      if (kind === "menu") $("#menuBtn")?.setAttribute("aria-expanded", "false");
      if (kind === "receipt") document.body.classList.remove("print-receipt");

      const back = lastFocus || $("#menuBtn");
      if (back && back.focus) back.focus();
      lastFocus = null;
    };

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const map = overlayMap();
      if (map.receipt && !map.receipt.hidden) closeOverlay("receipt");
      else if (map.menu && !map.menu.hidden) closeOverlay("menu");
    });

    document.addEventListener("click", (e) => {
      const closeEl = e.target.closest("[data-close]");
      if (closeEl) {
        const kind = closeEl.getAttribute("data-close");
        if (kind === "menu" || kind === "receipt") closeOverlay(kind);
        return;
      }

      const scrim = e.target.classList?.contains("overlay-scrim") ? e.target : null;
      if (scrim) {
        const ov = scrim.closest(".overlay");
        if (ov?.id === "menuOverlay") closeOverlay("menu");
        if (ov?.id === "receiptOverlay") closeOverlay("receipt");
      }
    });

    return { toast, setFieldError, setTabCurrent, openOverlay, closeOverlay };
  })();

  /* ---------------- App ---------------- */
  const App = (() => {
    let state = Storage.load();
    const getState = () => state;

    const setDisplayCurrency = (cur) => {
      if (!CURRENCIES.includes(cur)) return;
      state.settings.displayCurrency = cur;
      Storage.save(state);
    };

    const setDefaultSavingsRate = (rate) => {
      const n = Number(rate);
      if (!Number.isFinite(n) || n < 0 || n > 1) return false;
      state.settings.defaultSavingsRate = n;
      Storage.save(state);
      return true;
    };

    const upsertTransaction = (tx) => {
      const idx = state.transactions.findIndex(t => t.id === tx.id);
      if (idx >= 0) state.transactions[idx] = tx;
      else state.transactions.unshift(tx);
      Storage.save(state);
    };

    const deleteTransaction = (id) => {
      state.transactions = state.transactions.filter(t => t.id !== id);
      Storage.save(state);
    };

    const getTransaction = (id) => state.transactions.find(t => t.id === id) || null;

    const replaceAll = (newData) => {
      state = Storage.migrate(newData);
      Storage.save(state);
    };

    const clearAll = () => {
      Storage.clear();
      state = Storage.load();
    };

    return { getState, setDisplayCurrency, setDefaultSavingsRate, upsertTransaction, deleteTransaction, getTransaction, replaceAll, clearAll };
  })();

  /* ---------------- Domain ---------------- */
  const Domain = (() => {
    const numberOrZero = (value) => {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? n : 0;
    };

    const installmentContractValue = (inst) => numberOrZero(inst?.originalValue ?? inst?.value);

    const installmentPaidValue = (inst) => {
      const contract = installmentContractValue(inst);
      if (!contract) return 0;
      if (inst?.status === "pago") return contract;
      return Math.min(contract, numberOrZero(inst?.paidAmount));
    };

    const installmentOpenValue = (inst) => Math.max(0, installmentContractValue(inst) - installmentPaidValue(inst));

    const normalizeInstallment = (inst, idx = 0) => {
      const value = installmentContractValue(inst);
      const paidAmount = installmentPaidValue(inst);
      const paid = value > 0 && paidAmount >= value;
      return {
        ...inst,
        id: inst?.id || safeUUID(),
        number: Number.isInteger(inst?.number) ? inst.number : idx + 1,
        value,
        originalValue: value,
        paidAmount,
        status: paid ? "pago" : "pendente",
        paidAt: paid ? (inst?.paidAt || todayISODate()) : null,
      };
    };

    const ensureInstallments = (tx) => {
      tx.installments = Array.isArray(tx.installments)
        ? tx.installments.map(normalizeInstallment)
        : [];
      return tx.installments;
    };

    const isPaid = (inst) => installmentOpenValue(inst) <= 0 && installmentContractValue(inst) > 0;
    const isComplete = (tx) => {
      const items = ensureInstallments(tx);
      return items.length > 0 && items.every(isPaid);
    };

    const nextPendingInstallment = (tx) => ensureInstallments(tx)
      .filter(i => installmentOpenValue(i) > 0)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "") || a.number - b.number)[0] || null;

    const lastPaidInstallment = (tx) => {
      const paid = ensureInstallments(tx).filter(isPaid);
      if (!paid.length) return null;
      paid.sort((a, b) => (a.paidAt || "").localeCompare(b.paidAt || ""));
      return paid[paid.length - 1] || null;
    };

    const installmentsPendingInMonth = (tx, ym) => ensureInstallments(tx)
      .filter(i => installmentOpenValue(i) > 0 && ymOf(i.dueDate) === ym);

    const sumByStatus = (tx, status) => ensureInstallments(tx).reduce((acc, i) => {
      if (status === "pago") return acc + installmentPaidValue(i);
      if (status === "pendente") return acc + installmentOpenValue(i);
      return acc;
    }, 0);

    const overdueInstallments = (tx, todayIso = todayISODate()) => ensureInstallments(tx)
      .filter(i => installmentOpenValue(i) > 0 && i.dueDate && i.dueDate < todayIso);

    const progressSummary = (tx) => {
      const installments = ensureInstallments(tx);
      const totalCount = installments.length;
      const paidCount = installments.filter(isPaid).length;
      const pendingCount = totalCount - paidCount;
      const paidSum = roundByCurrency(sumByStatus(tx, "pago"), tx.currency || "BRL");
      const pendingSum = roundByCurrency(sumByStatus(tx, "pendente"), tx.currency || "BRL");
      return { totalCount, paidCount, pendingCount, paidSum, pendingSum };
    };

    const validateTx = (draft) => {
      const errors = {};
      if (!draft.type || !["compra", "venda", "emprestimo"].includes(draft.type)) errors.type = "Selecione compra, venda ou empréstimo.";
      if (!draft.item || draft.item.trim().length < 2) errors.item = "Informe o item/bem (mín. 2 caracteres).";
      if (!draft.counterpartyName || draft.counterpartyName.trim().length < 2) errors.counterpartyName = "Informe o nome (mín. 2 caracteres).";
      if (!CURRENCIES.includes(draft.currency)) errors.currency = "Moeda inválida.";
      if (!Number.isFinite(draft.totalValue) || draft.totalValue <= 0) errors.totalValue = "Informe um valor maior que zero.";
      if (!draft.agreementDate || !/^\d{4}-\d{2}-\d{2}$/.test(draft.agreementDate)) errors.agreementDate = "Informe a data do acordo.";

      if (draft.paymentMode === "parcelado") {
        if (!["mensal", "anual"].includes(draft.frequency)) errors.frequency = "Frequência inválida.";
        if (!Number.isInteger(draft.dueDay) || draft.dueDay < 1 || draft.dueDay > 31) errors.dueDay = "Dia do vencimento deve ser 1 a 31.";
        const hasCount = Number.isInteger(draft.numInstallments) && draft.numInstallments >= 2;
        const hasValue = Number.isFinite(draft.installmentValue) && draft.installmentValue > 0;
        if (!hasCount && !hasValue) {
          errors.numInstallments = "Informe Nº parcelas ou Valor por parcela.";
          errors.installmentValue = "Informe Valor por parcela ou Nº parcelas.";
        }
      }

      if (draft.type === "emprestimo") {
        if (!Number.isFinite(draft.loanRate) || draft.loanRate < 0) errors.loanRate = "Informe uma taxa mensal válida.";
        if (draft.loanRate > 1) errors.loanRate = "A taxa mensal parece alta demais. Revise o valor.";
      }
      return errors;
    };

    const makeInstallment = (number, dueDate, value, currency) => {
      const rounded = roundByCurrency(value, currency);
      return {
        id: safeUUID(),
        number,
        dueDate,
        value: rounded,
        originalValue: rounded,
        paidAmount: 0,
        status: "pendente",
        paidAt: null,
      };
    };

    const generateInstallments = ({ paymentMode, totalValue, agreementDate, frequency, numInstallments, dueDay, currency, installmentValue }) => {
      const total = Number(totalValue);
      if (paymentMode === "avista") return [makeInstallment(1, agreementDate, total, currency)];

      const firstDue = computeFirstDue(agreementDate, dueDay);
      if (Number.isFinite(installmentValue) && installmentValue > 0) {
        const per = roundByCurrency(installmentValue, currency);
        const count = clamp(Math.ceil(total / per), 2, 9999);
        const dates = nextDueDates(firstDue, frequency, count, dueDay);
        const out = [];
        let remaining = roundByCurrency(total, currency);
        for (let i = 0; i < count; i++) {
          const v = i === count - 1 ? remaining : Math.min(per, remaining);
          const item = makeInstallment(i + 1, dates[i], v, currency);
          out.push(item);
          remaining = roundByCurrency(remaining - item.value, currency);
        }
        if (remaining !== 0 && out.length) {
          const last = out[out.length - 1];
          last.value = last.originalValue = roundByCurrency(last.value + remaining, currency);
        }
        return out;
      }

      const count = clamp(Number(numInstallments), 2, 9999);
      const dates = nextDueDates(firstDue, frequency, count, dueDay);
      const base = total / count;
      const raw = Array.from({ length: count }, (_, idx) => makeInstallment(idx + 1, dates[idx], base, currency));
      const sum = raw.reduce((a, i) => a + i.originalValue, 0);
      const diff = roundByCurrency(total - sum, currency);
      if (diff !== 0) {
        const last = raw[raw.length - 1];
        last.value = last.originalValue = roundByCurrency(last.originalValue + diff, currency);
      }
      return raw;
    };

    const addMovement = (tx, movement) => {
      tx.movements = Array.isArray(tx.movements) ? tx.movements : [];
      const item = {
        id: movement.id || safeUUID(),
        type: movement.type || "note",
        amount: Number(movement.amount || 0),
        date: movement.date || nowISO(),
        installmentNumber: movement.installmentNumber ?? null,
        allocations: Array.isArray(movement.allocations) ? movement.allocations : null,
        referenceId: movement.referenceId || null,
        note: movement.note || null,
      };
      tx.movements.push(item);
      return item;
    };

    const payNext = (tx) => {
      const next = nextPendingInstallment(tx);
      if (!next) return { ok: false, tx, paidNumber: null };
      const previousPaidAmount = installmentPaidValue(next);
      const amount = installmentOpenValue(next);
      next.paidAmount = installmentContractValue(next);
      next.status = "pago";
      next.paidAt = todayISODate();
      const movement = addMovement(tx, {
        type: "payment",
        amount,
        date: next.paidAt,
        installmentNumber: next.number,
        note: `Quitação da parcela ${next.number}.`,
      });
      tx.updatedAt = nowISO();
      return { ok: true, tx, paidNumber: next.number, previousPaidAmount, movementId: movement.id, amount };
    };

    const undoPay = (tx, installmentNumber, previousPaidAmount = 0, referenceId = null) => {
      const inst = ensureInstallments(tx).find(i => i.number === installmentNumber);
      if (!inst) return tx;
      const currentPaid = installmentPaidValue(inst);
      const restored = Math.max(0, Math.min(installmentContractValue(inst), Number(previousPaidAmount || 0)));
      inst.paidAmount = restored;
      inst.status = restored >= installmentContractValue(inst) && installmentContractValue(inst) > 0 ? "pago" : "pendente";
      inst.paidAt = inst.status === "pago" ? inst.paidAt : null;
      addMovement(tx, {
        type: "payment_reversal",
        amount: -(currentPaid - restored),
        date: todayISODate(),
        installmentNumber,
        referenceId,
        note: `Pagamento da parcela ${installmentNumber} desfeito.`,
      });
      tx.updatedAt = nowISO();
      return tx;
    };

    const typeLabel = (t) => t === "compra" ? "Compra" : t === "venda" ? "Venda" : "Empréstimo";

    const loanMonthlyYield = (tx) => {
      if (tx.type !== "emprestimo") return 0;
      const pending = sumByStatus(tx, "pendente");
      const rate = Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE;
      return roundByCurrency(pending * rate, tx.currency || "BRL");
    };

    const loanInterestAccrued = (tx, asOfISO = todayISODate()) => {
      const currency = tx.currency || "BRL";
      const rate = Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE;
      if (tx.type !== "emprestimo") {
        return { months: 0, rate: 0, interest: 0, base: 0, since: null, details: [], interestType: DEFAULT_INTEREST_TYPE };
      }

      const details = overdueInstallments(tx, asOfISO).map(inst => {
        const principal = installmentOpenValue(inst);
        const months = monthsBetween(inst.dueDate, asOfISO);
        const interest = months > 0
          ? roundByCurrency(principal * (Math.pow(1 + rate, months) - 1), currency)
          : 0;
        return {
          installmentId: inst.id,
          number: inst.number,
          dueDate: inst.dueDate,
          principal,
          months,
          interest,
          updatedValue: roundByCurrency(principal + interest, currency),
        };
      });

      const interest = roundByCurrency(details.reduce((sum, d) => sum + d.interest, 0), currency);
      const base = roundByCurrency(details.reduce((sum, d) => sum + d.principal, 0), currency);
      const months = details.reduce((max, d) => Math.max(max, d.months), 0);
      const since = details.length ? details.map(d => d.dueDate).sort()[0] : null;
      return { months, rate, interest, base, since, details, interestType: DEFAULT_INTEREST_TYPE };
    };

    const financialStatement = (tx, asOfISO = todayISODate()) => {
      const currency = tx.currency || "BRL";
      const prog = progressSummary(tx);
      const overdue = overdueInstallments(tx, asOfISO);
      const interestInfo = loanInterestAccrued(tx, asOfISO);
      const overduePrincipal = roundByCurrency(overdue.reduce((sum, i) => sum + installmentOpenValue(i), 0), currency);
      const originalValue = roundByCurrency(Number(tx.originalValue ?? tx.totalValue ?? (prog.paidSum + prog.pendingSum)), currency);
      const openWithInterest = roundByCurrency(prog.pendingSum + interestInfo.interest, currency);
      const paidPct = originalValue > 0 ? Math.min(100, Math.round((prog.paidSum / originalValue) * 100)) : 0;
      return {
        ...prog,
        originalValue,
        paidPrincipal: prog.paidSum,
        openPrincipal: prog.pendingSum,
        overduePrincipal,
        interest: interestInfo.interest,
        openWithInterest,
        interestInfo,
        overdue,
        next: nextPendingInstallment(tx),
        paidPct,
      };
    };

    const applyAbatement = (tx, amountRaw, paidAtISO = todayISODate()) => {
      const amount = Number(amountRaw);
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: "Valor inválido." };
      const currency = tx.currency || "BRL";
      const pendingTotal = sumByStatus(tx, "pendente");
      if (pendingTotal <= 0) return { ok: false, reason: "Nada em aberto." };

      let remaining = roundByCurrency(Math.min(amount, pendingTotal), currency);
      const applied = remaining;
      const allocations = [];
      const pending = ensureInstallments(tx)
        .filter(i => installmentOpenValue(i) > 0)
        .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "") || a.number - b.number);

      for (const inst of pending) {
        if (remaining <= 0) break;
        const open = installmentOpenValue(inst);
        const part = roundByCurrency(Math.min(open, remaining), currency);
        inst.paidAmount = roundByCurrency(installmentPaidValue(inst) + part, currency);
        if (installmentOpenValue(inst) <= 0) {
          inst.status = "pago";
          inst.paidAt = paidAtISO;
        } else {
          inst.status = "pendente";
          inst.paidAt = null;
        }
        allocations.push({ installmentNumber: inst.number, amount: part });
        remaining = roundByCurrency(remaining - part, currency);
      }

      addMovement(tx, {
        type: "partial_payment",
        amount: applied,
        date: paidAtISO,
        allocations,
        note: allocations.length > 1
          ? `Pagamento distribuído em ${allocations.length} parcelas, começando pela mais antiga.`
          : `Pagamento aplicado à parcela ${allocations[0]?.installmentNumber || "—"}.`,
      });
      tx.updatedAt = nowISO();
      return { ok: true, applied, allocations };
    };

    const movementLabel = (movement) => {
      const labels = {
        payment: "Parcela quitada",
        payment_imported: "Pagamento anterior",
        partial_payment: "Pagamento parcial",
        payment_reversal: "Pagamento desfeito",
        agreement_created: "Acordo criado",
        agreement_updated: "Acordo atualizado",
        migration: "Dados organizados",
      };
      return labels[movement?.type] || "Movimentação";
    };

    const sortedMovements = (tx) => (Array.isArray(tx.movements) ? tx.movements.slice() : [])
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    return {
      isPaid,
      isComplete,
      installmentContractValue,
      installmentPaidValue,
      installmentOpenValue,
      nextPendingInstallment,
      lastPaidInstallment,
      installmentsPendingInMonth,
      sumByStatus,
      overdueInstallments,
      progressSummary,
      validateTx,
      generateInstallments,
      addMovement,
      payNext,
      undoPay,
      typeLabel,
      loanMonthlyYield,
      loanInterestAccrued,
      financialStatement,
      applyAbatement,
      movementLabel,
      sortedMovements,
    };
  })();

  /* ---------------- Manual in Burger Menu ---------------- */
  const Manual = (() => {
    const STYLE_ID = "cvpro-manual-style";

    const injectStyle = () => {
      if (document.getElementById(STYLE_ID)) return;

      const css = `
        .manual-wrap{margin-top:14px;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);}
        .manual-hero{padding:14px 14px 12px;background:radial-gradient(80% 120% at 10% 0%,rgba(59,130,246,.12) 0%,rgba(14,165,233,.08) 40%,rgba(255,255,255,0) 100%),linear-gradient(135deg,rgba(15,23,42,.95) 0%,rgba(30,41,59,.92) 60%,rgba(15,23,42,.94) 100%);color:#fff;}
        .manual-hero h3{margin:0 0 6px;font-size:16px;letter-spacing:.02em}
        .manual-hero p{margin:0;color:rgba(255,255,255,.86);font-size:12px;line-height:1.35}
        .manual-pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
        .manual-pill{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:6px 10px;font-size:12px}
        .manual-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
        .manual-actions .btn{border-radius:999px}
        .manual-body{padding:12px 12px 14px}
        .manual-nav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
        .manual-chip{border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:6px 10px;font-size:12px;cursor:pointer}
        .manual-chip:active{transform:translateY(1px)}
        .manual-grid{display:grid;grid-template-columns:1fr;gap:10px}
        .manual-card{border:1px solid #e2e8f0;border-radius:14px;background:#fff;box-shadow:0 1px 0 rgba(15,23,42,.04);overflow:hidden}
        .manual-card summary{cursor:pointer;list-style:none;padding:12px 12px 10px;font-weight:650;color:#0f172a;display:flex;align-items:center;gap:10px}
        .manual-card summary::-webkit-details-marker{display:none}
        .manual-ico{width:28px;height:28px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(59,130,246,.16),rgba(14,165,233,.10));border:1px solid rgba(59,130,246,.18)}
        .manual-card .content{padding:0 12px 12px;color:#0f172a}
        .manual-card .content p{margin:8px 0;font-size:13px;line-height:1.5}
        .manual-steps{margin:8px 0 0;padding-left:18px}
        .manual-steps li{margin:6px 0;font-size:13px;line-height:1.45}
        .manual-tip{margin-top:10px;border:1px dashed #cbd5e1;background:#f8fafc;border-radius:12px;padding:10px;font-size:12px;color:#334155}
        .manual-tip strong{color:#0f172a}
        .manual-mini{font-size:12px;color:#475569;margin-top:10px}
        .manual-kbd{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size:11px;background:#0f172a;color:#fff;border-radius:8px;padding:2px 6px}
      `;

      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    };

    const buildHTML = () => {
      const ratePct = String((DEFAULT_LOAN_RATE * 100).toFixed(2)).replace(".", ",");
      return `
        <section class="manual-wrap" id="cvproManual" aria-label="Manual do programa">
          <div class="manual-hero">
            <h3>Manual do Controle Perfeito 🧾🧭</h3>
            <p>Guia direto ao ponto para você dominar compras, vendas e empréstimos, com recibos, relatórios e juros transparentes.</p>
            <div class="manual-pills" aria-hidden="true">
              <span class="manual-pill">Compras</span>
              <span class="manual-pill">Vendas</span>
              <span class="manual-pill">Empréstimos</span>
              <span class="manual-pill">Recibos + PDF</span>
              <span class="manual-pill">Abatimento</span>
            </div>
            <div class="manual-actions">
              <button class="btn" type="button" data-action="manualScroll" data-target="m-start">Começar</button>
              <button class="btn" type="button" data-action="manualScroll" data-target="m-pdf">Salvar PDF</button>
              <button class="btn" type="button" data-action="manualScroll" data-target="m-loan">Juros</button>
            </div>
          </div>

          <div class="manual-body">
            <div class="manual-nav" aria-label="Atalhos do manual">
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-start">🚀 Básico</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-create">🧱 Criar</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-pay">✅ Pagar</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-abate">🪙 Abater</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-loan">🏦 Juros</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-pdf">📄 PDF</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-backup">🧯 Backup</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-tips">🧠 Dicas</button>
            </div>

            <div class="manual-grid">
              <details class="manual-card" open>
                <summary id="m-start"><span class="manual-ico">🚀</span> Como pensar o app em 10 segundos</summary>
                <div class="content">
                  <p><strong>Regra de ouro:</strong> cada transação vira um conjunto de parcelas. Você só faz 3 coisas:</p>
                  <ol class="manual-steps">
                    <li><strong>Cria</strong> a transação (compra, venda ou empréstimo).</li>
                    <li><strong>Marca pagamentos</strong> (pagar próxima parcela ou abater).</li>
                    <li><strong>Gera relatório</strong> para cobrar ou comprovar (copiar, compartilhar ou salvar PDF).</li>
                  </ol>
                  <div class="manual-tip"><strong>Mapa mental:</strong> <span class="manual-kbd">Pendente</span> é o que está em aberto. <span class="manual-kbd">Pago</span> é histórico (prova). <span class="manual-kbd">Relatório</span> é o “espelho” para o cliente/devedor.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-create"><span class="manual-ico">🧱</span> Criando uma transação do jeito certo</summary>
                <div class="content">
                  <p>Vá em <strong>+ Nova transação</strong> e preencha o essencial. O resto o sistema organiza.</p>
                  <ol class="manual-steps">
                    <li><strong>Tipo:</strong> Compra (você deve), Venda (te devem), Empréstimo (te devem com juros).</li>
                    <li><strong>Item/Bem:</strong> nome claro, ex.: “Celular”, “Notebook”, “Empréstimo pessoal”.</li>
                    <li><strong>Nome + Documento:</strong> deixa o relatório “à prova de conversa torta”.</li>
                    <li><strong>Valor total:</strong> o combinado.</li>
                    <li><strong>À vista</strong> ou <strong>Parcelado:</strong> se parcelado, defina vencimento e parcelas.</li>
                  </ol>
                  <div class="manual-tip"><strong>Dica ninja:</strong> se “Nº parcelas” não fecha redondo, use <strong>Valor por parcela</strong>. O sistema ajusta o resto na última parcela.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-pay"><span class="manual-ico">✅</span> Pagamentos: pagar próxima parcela (rápido)</summary>
                <div class="content">
                  <p>No card da transação, clique em <strong>Pagar próxima parcela</strong>.</p>
                  <ol class="manual-steps">
                    <li>Ele marca a <strong>primeira parcela pendente</strong> como paga.</li>
                    <li>Você pode <strong>desfazer</strong> pelo toast (caso tenha clicado errado).</li>
                    <li>O detalhe da transação mostra o progresso: pago, pendente, atrasos.</li>
                  </ol>
                  <div class="manual-tip"><strong>Quando usar:</strong> pagamentos “certinhos” (parcela por parcela). Para pagamentos parciais ou adiantamentos, use <strong>Abater/Receber</strong>.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-abate"><span class="manual-ico">🪙</span> Abater/Receber: quitação parcial inteligente</summary>
                <div class="content">
                  <p>No detalhe da transação, clique em <strong>Abater/Receber valor</strong> e informe quanto entrou.</p>
                  <ol class="manual-steps">
                    <li>O sistema consome parcelas pendentes em ordem de vencimento.</li>
                    <li>O valor recebido é distribuído começando pela parcela mais antiga.</li>
                    <li>O valor original do acordo não é apagado: o sistema registra quanto foi pago e qual saldo restou.</li>
                  </ol>
                  <div class="manual-tip"><strong>Para virar especialista:</strong> sempre abata no dia que recebeu. Isso deixa o relatório e o histórico redondinhos.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-loan"><span class="manual-ico">🏦</span> Empréstimos e juros transparentes</summary>
                <div class="content">
                  <p>Todos os novos empréstimos usam uma regra única: <strong>Correção pela Poupança</strong>.</p>
                  <ol class="manual-steps">
                    <li><strong>Poupança:</strong> é a regra única dos empréstimos.</li>
                    <li><strong>Por parcela:</strong> somente parcelas vencidas entram no cálculo.</li>
                    <li><strong>Meses completos:</strong> a correção ocorre nos aniversários mensais do vencimento.</li>
                  </ol>
                  <div class="manual-tip"><strong>Taxa padrão sugerida:</strong> ${ratePct}% ao mês. Você pode revisar a taxa mensal de referência em cada empréstimo.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-pdf"><span class="manual-ico">📄</span> Relatório, Recibo e PDF sem cortar</summary>
                <div class="content">
                  <p>Abra uma transação e clique em <strong>Gerar Recibo/Relatório</strong>.</p>
                  <ol class="manual-steps">
                    <li>Escolha o modo (Relatório é o mais completo).</li>
                    <li>Clique em <strong>Imprimir / Salvar PDF</strong>.</li>
                    <li>O PDF sai <strong>inteiro</strong> (sem salvar só metade), no celular e no PC.</li>
                  </ol>
                  <div class="manual-tip"><strong>Frase perfeita para cobrar:</strong> gere o relatório, copie e mande junto com o PDF. É a dupla que resolve 90% das conversas.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-backup"><span class="manual-ico">🧯</span> Backup e restauração (pra nunca perder dados)</summary>
                <div class="content">
                  <p>Abra o menu e use:</p>
                  <ol class="manual-steps">
                    <li><strong>Exportar</strong>: salva um arquivo JSON com tudo.</li>
                    <li><strong>Importar</strong>: restaura em qualquer celular/PC.</li>
                    <li><strong>Limpar</strong>: só se tiver certeza (pede confirmação).</li>
                  </ol>
                  <div class="manual-tip"><strong>Rotina de campeão:</strong> exporte 1 vez por mês. Se trocar de celular, é só importar.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-tips"><span class="manual-ico">🧠</span> Dicas rápidas para virar especialista</summary>
                <div class="content">
                  <ol class="manual-steps">
                    <li><strong>Nomes claros</strong> no item: “Geladeira Consul”, “Moto CG”, “Empréstimo João”.</li>
                    <li><strong>Documento sempre</strong> quando possível. Relatório vira prova.</li>
                    <li><strong>Use Abater</strong> para adiantamentos. Use “Pagar próxima” para rotina mensal.</li>
                    <li><strong>Atraso</strong>: gere relatório com juros bem explicado e envie o PDF.</li>
                    <li><strong>Moeda</strong>: defina sua moeda de exibição e atualize câmbio quando estiver online.</li>
                  </ol>
                  <p class="manual-mini">Quer um jeito “profissional”? Mande sempre: texto cordial + PDF do relatório. Fecha a conversa sem ruído.</p>
                </div>
              </details>
            </div>

            <p class="manual-mini">Atalho: dentro do menu, use os chips pra navegar. Seções abrem e fecham como um guia interativo.</p>
          </div>
        </section>
      `;
    };

    const ensureInMenu = () => {
      injectStyle();

      const menuOverlay = $("#menuOverlay");
      if (!menuOverlay) return;

      const body = menuOverlay.querySelector(".panel-body") || menuOverlay;
      if (!body) return;

      if ($("#cvproManual", body)) return;

      const host = document.createElement("div");
      host.innerHTML = buildHTML();
      body.appendChild(host.firstElementChild);
    };

    const scrollTo = (targetId) => {
      const menuOverlay = $("#menuOverlay");
      if (!menuOverlay) return;
      const body = menuOverlay.querySelector(".panel-body") || menuOverlay;
      const el = menuOverlay.querySelector(`#${CSS.escape(targetId)}`);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();
      const delta = rect.top - bodyRect.top;
      body.scrollBy({ top: delta - 12, behavior: "smooth" });
    };

    return { ensureInMenu, scrollTo };
  })();

  /* ---------------- Views / Routing ---------------- */
  const Views = (() => {
    const main = $("#main");
    let pendingOpenDetailId = null;

    const updateInterestTypeHelp = () => {};
    const ensureInterestTypeField = () => {};

    const show = (route) => {
      const map = {
        dashboard: $("#view-dashboard"),
        transactions: $("#view-transactions"),
        form: $("#view-form"),
      };
      Object.entries(map).forEach(([k, el]) => { el.hidden = k !== route; });

      UI.setTabCurrent(route);
      main.focus({ preventScroll: true });

      if (route === "dashboard") renderDashboard();
      if (route === "transactions") {
        renderTransactions();
        if (pendingOpenDetailId) {
          const id = pendingOpenDetailId;
          pendingOpenDetailId = null;
          renderDetail(id);
        }
      }
      if (route === "form") renderForm();
    };

    const routeFromHash = () => {
      const h = (location.hash || "#dashboard").replace("#", "");
      if (h.startsWith("form")) return "form";
      if (h.startsWith("transactions")) return "transactions";
      return "dashboard";
    };

    const goToDetail = (id) => {
      pendingOpenDetailId = id;
      location.hash = "#transactions";
    };

    const renderDashboard = () => {
      const state = App.getState();
      const display = state.settings.displayCurrency;
      const monthYM = ymOf(todayISODate());
      const rates = state.settings.lastRates;

      const converted = (value, currency) => {
        const conv = Rates.convert(value, currency, display, rates);
        return Number(conv.value || 0);
      };

      let principalReceber = 0;
      let jurosReceber = 0;
      let vencidoReceber = 0;
      let totalPagar = 0;
      let monthCount = 0;
      let monthTotal = 0;

      for (const tx of state.transactions) {
        const st = Domain.financialStatement(tx);
        if (tx.type === "venda" || tx.type === "emprestimo") {
          principalReceber += converted(st.openPrincipal, tx.currency);
          jurosReceber += converted(st.interest, tx.currency);
          vencidoReceber += converted(st.overduePrincipal, tx.currency);
        } else if (tx.type === "compra") {
          totalPagar += converted(st.openPrincipal, tx.currency);
        }

        const monthItems = Domain.installmentsPendingInMonth(tx, monthYM);
        monthCount += monthItems.length;
        monthTotal += converted(monthItems.reduce((sum, i) => sum + Domain.installmentOpenValue(i), 0), tx.currency);
      }

      const dash = $("#dashCards");
      dash.innerHTML = "";
      const metricCard = (title, value, sub) => {
        const c = document.createElement("div");
        c.className = "card metric";
        c.innerHTML = `<div class="k">${escapeHTML(title)}</div><div class="v">${formatCurrency(value, display)}</div><div class="s">${escapeHTML(sub)}</div>`;
        dash.appendChild(c);
      };

      metricCard("Principal a receber", principalReceber, "Saldo das vendas e empréstimos");
      metricCard("Correção da poupança", jurosReceber, "Somente sobre parcelas vencidas");
      metricCard("Principal vencido", vencidoReceber, "Valores que já passaram do vencimento");
      metricCard("Total a pagar", totalPagar, `Compras em aberto • ${monthCount} parcela(s) no mês (${formatCurrency(monthTotal, display)})`);

      renderRecent();
      renderSettingsMeta();
    };

    const renderRecent = () => {
      const state = App.getState();
      const display = state.settings.displayCurrency;
      const rates = state.settings.lastRates;

      const list = $("#recentList");
      list.innerHTML = "";

      const recent = state.transactions.slice(0, 6);

      if (!recent.length) {
        list.innerHTML = `
          <div class="empty">
            <div class="empty-emoji" aria-hidden="true">🧾</div>
            <h3>Zero transações</h3>
            <p>Comece com uma nova transação. A sua lista aparece aqui.</p>
            <a class="btn primary" href="#form">+ Nova transação</a>
          </div>
        `;
        return;
      }

      for (const tx of recent) {
        const next = Domain.nextPendingInstallment(tx);
        const done = Domain.isComplete(tx);
        const pending = Domain.sumByStatus(tx, "pendente");
        const conv = Rates.convert(pending, tx.currency, display, rates);
        const badge = done ? "good" : "warn";

        const el = document.createElement("div");
        el.className = "item";
        el.innerHTML = `
          <div class="item-row">
            <div class="item-main">
              <p class="item-title">${escapeHTML(tx.item)}</p>
              <p class="item-sub">${escapeHTML(Domain.typeLabel(tx.type))} • ${escapeHTML(tx.counterpartyName)} • Acordo: ${formatDateBR(tx.agreementDate)}</p>
            </div>
            <div class="item-meta">
              <span class="badge ${badge}">${done ? "Concluído" : "Pendente"}</span>
              <div class="meta-amount">
                ${formatCurrency(conv.value, display)}
                ${conv.ok ? "" : `<span title="${escapeHTML(conv.note || "Taxa indisponível")}" aria-label="Taxa indisponível"> ⚠</span>`}
              </div>
              <div class="meta-next">${next ? `Próx.: ${formatDateBR(next.dueDate)}` : "—"}</div>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn" type="button" data-action="openDetail" data-id="${tx.id}" data-origin="dashboard">Abrir</button>
            <a class="btn" href="#form" data-action="edit" data-id="${tx.id}">Editar</a>
          </div>
        `;
        list.appendChild(el);
      }
    };

    const renderSettingsMeta = () => {
      const state = App.getState();
      const meta = $("#ratesMeta");
      const badge = $("#offlineBadge");
      const rates = state.settings.lastRates;

      const fresh = Rates.isFresh(rates);
      const online = Rates.isOnline();

      const text = rates?.updatedAt
        ? `Última atualização: ${new Date(rates.updatedAt).toLocaleString("pt-BR")} ${fresh ? "• válido" : "• antigo"}`
        : "Sem cotação salva ainda.";

      meta.textContent = text;
      badge.hidden = online;
      const rateInput = $("#defaultSavingsRate");
      if (rateInput && document.activeElement !== rateInput) {
        const pct = (Number(state.settings.defaultSavingsRate ?? DEFAULT_LOAN_RATE) * 100).toFixed(2).replace(".", ",");
        rateInput.value = pct;
      }
    };

    const renderTransactions = () => {
      const state = App.getState();
      const list = $("#txList");
      const empty = $("#txEmpty");
      const noRes = $("#txNoResults");
      const detailCard = $("#detailCard");

      const form = $("#filterForm");
      const q = (form.q.value || "").trim().toLowerCase();
      const fType = form.fType.value || "all";
      const fStatus = form.fStatus.value || "all";
      const fComp = form.fCompetencia.value || "";

      const all = state.transactions.slice();

      if (!all.length) {
        list.innerHTML = "";
        empty.hidden = false;
        noRes.hidden = true;
        detailCard.hidden = true;
        return;
      }

      empty.hidden = true;

      const filtered = all.filter(tx => {
        const hay = `${tx.item} ${tx.counterpartyName}`.toLowerCase();
        if (q && !hay.includes(q)) return false;
        if (fType !== "all" && tx.type !== fType) return false;

        const done = Domain.isComplete(tx);
        if (fStatus === "concluido" && !done) return false;
        if (fStatus === "pendente" && done) return false;

        if (fComp) {
          const matches = (tx.installments || []).some(i => ymOf(i.dueDate) === fComp);
          if (!matches) return false;
        }
        return true;
      });

      list.innerHTML = "";
      $("#txDetail").innerHTML = "";
      $("#detailCard").hidden = true;

      if (!filtered.length) {
        noRes.hidden = false;
        return;
      }
      noRes.hidden = true;

      const display = state.settings.displayCurrency;
      const rates = state.settings.lastRates;

      for (const tx of filtered) {
        const done = Domain.isComplete(tx);
        const next = Domain.nextPendingInstallment(tx);
        const statement = Domain.financialStatement(tx);
        const balance = tx.type === "emprestimo" ? statement.openWithInterest : statement.openPrincipal;
        const conv = Rates.convert(balance, tx.currency, display, rates);

        const el = document.createElement("div");
        el.className = "item";
        el.innerHTML = `
          <div class="item-row">
            <div class="item-main">
              <p class="item-title">${escapeHTML(tx.item)}</p>
              <p class="item-sub">${escapeHTML(Domain.typeLabel(tx.type))} • ${escapeHTML(tx.counterpartyName)} • ${tx.paymentMode === "parcelado" ? "Parcelado" : "À vista"}</p>
            </div>
            <div class="item-meta">
              <span class="badge ${done ? "good" : "warn"}">${done ? "Concluído" : "Pendente"}</span>
              <div class="meta-amount">
                ${formatCurrency(conv.value, display)}
                ${conv.ok ? "" : `<span title="${escapeHTML(conv.note || "Taxa indisponível")}" aria-label="Taxa indisponível"> ⚠</span>`}
              </div>
              <div class="meta-next">${next ? `Próx.: ${formatDateBR(next.dueDate)}` : "—"}</div>
            </div>
          </div>

          <div class="item-actions">
            <button class="btn" type="button" data-action="openDetail" data-id="${tx.id}">Abrir</button>
            <button class="btn" type="button" data-action="payNext" data-id="${tx.id}" ${done ? "disabled" : ""}>Pagar próxima parcela</button>
            <a class="btn" href="#form" data-action="edit" data-id="${tx.id}">Editar</a>
            <button class="btn danger" type="button" data-action="delete" data-id="${tx.id}">Excluir</button>
          </div>
        `;
        list.appendChild(el);
      }
    };

    const renderDetail = (txId) => {
      const state = App.getState();
      const tx = App.getTransaction(txId);
      const detailCard = $("#detailCard");
      const box = $("#txDetail");
      if (!tx) {
        detailCard.hidden = true;
        box.innerHTML = "";
        return;
      }

      const display = state.settings.displayCurrency;
      const rates = state.settings.lastRates;
      const st = Domain.financialStatement(tx);
      const next = st.next;

      const money = (value) => {
        const conv = Rates.convert(value, tx.currency, display, rates);
        return `${formatCurrency(conv.ok ? conv.value : value, conv.ok ? display : tx.currency)}${conv.ok ? "" : " ⚠"}`;
      };

      const installmentRows = (tx.installments || []).map(inst => {
        const contract = Domain.installmentContractValue(inst);
        const paid = Domain.installmentPaidValue(inst);
        const open = Domain.installmentOpenValue(inst);
        const overdue = open > 0 && inst.dueDate && inst.dueDate < todayISODate();
        const status = open <= 0 ? "pago" : overdue ? "atrasada" : paid > 0 ? "parcial" : "pendente";
        const cls = status === "pago" ? "good" : status === "atrasada" ? "bad" : status === "parcial" ? "next" : "warn";
        return `
          <div class="finance-row">
            <div><strong>${inst.number}/${tx.installments.length}</strong><div class="hint">${formatDateBR(inst.dueDate)}${inst.paidAt ? ` • pago em ${formatDateBR(inst.paidAt)}` : ""}</div></div>
            <div class="right">${money(contract)}<div class="hint">valor da parcela</div></div>
            <div class="right">${money(open)}<div class="hint">saldo</div></div>
            <div class="right"><span class="pill ${cls}">${status}</span>${paid > 0 && open > 0 ? `<div class="hint">recebido ${money(paid)}</div>` : ""}</div>
          </div>`;
      }).join("");

      const interestRows = st.interestInfo.details.length
        ? st.interestInfo.details.map(d => `
          <div class="finance-row">
            <div><strong>Parcela ${d.number}</strong><div class="hint">venceu ${formatDateBR(d.dueDate)}</div></div>
            <div class="right">${money(d.principal)}<div class="hint">principal</div></div>
            <div class="right">${d.months} mês(es)<div class="hint">completos</div></div>
            <div class="right">${money(d.interest)}<div class="hint">correção</div></div>
          </div>`).join("")
        : `<div class="note">Nenhuma parcela completou um mês de atraso. A correção está zerada.</div>`;

      const movements = Domain.sortedMovements(tx);
      const movementRows = movements.length
        ? movements.map(m => {
          const amount = Number(m.amount || 0);
          const date = String(m.date || "").slice(0, 10);
          return `<div class="movement">
            <div><div class="movement-title">${escapeHTML(Domain.movementLabel(m))}</div><div class="movement-meta">${formatDateBR(date)}${m.installmentNumber ? ` • parcela ${m.installmentNumber}` : ""}${m.note ? ` • ${escapeHTML(m.note)}` : ""}</div></div>
            <div class="movement-value ${amount < 0 ? "negative" : "positive"}">${amount < 0 ? "−" : "+"} ${money(Math.abs(amount))}</div>
          </div>`;
        }).join("")
        : `<div class="note">Ainda não há pagamentos registrados nesta transação.</div>`;

      const ratePct = ((Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE) * 100).toFixed(2).replace(".", ",");
      const loanSection = tx.type === "emprestimo" ? `
        <section class="finance-section">
          <h3>Correção pela Poupança</h3>
          <div class="finance-rule">
            <div class="finance-rule-title">Taxa registrada: ${ratePct}% ao mês</div>
            <p>Cada parcela vencida é atualizada separadamente. Só contam meses completos após o vencimento, evitando cobrar juros sobre parcelas futuras.</p>
          </div>
          <div class="finance-table">
            <div class="finance-row finance-head"><div>Parcela</div><div class="right">Principal</div><div class="right">Período</div><div class="right">Correção</div></div>
            ${interestRows}
          </div>
        </section>` : "";

      box.innerHTML = `
        <section class="finance-section">
          <h3>Identificação do acordo</h3>
          <div class="progress-top">
            <div><div class="progress-title">${escapeHTML(tx.counterpartyName || "—")}</div><div class="progress-sub">${escapeHTML(Domain.typeLabel(tx.type))} • ${escapeHTML(tx.item)} • Acordo em ${formatDateBR(tx.agreementDate)}</div></div>
            <div><div class="progress-title">${st.paidPct}% recebido</div><div class="progress-sub">Documento: ${escapeHTML(tx.counterpartyDoc || "não informado")}</div></div>
          </div>
          <div class="bar" role="progressbar" aria-valuenow="${st.paidPct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${st.paidPct}%"></span></div>
        </section>

        <section class="finance-section">
          <h3>Demonstrativo financeiro</h3>
          <div class="finance-grid">
            <div class="finance-card"><div class="label">Valor original</div><div class="amount">${money(st.originalValue)}</div><div class="caption">Principal registrado no acordo</div></div>
            <div class="finance-card good"><div class="label">Total recebido</div><div class="amount">${money(st.paidPrincipal)}</div><div class="caption">Inclui pagamentos parciais</div></div>
            <div class="finance-card"><div class="label">Principal em aberto</div><div class="amount">${money(st.openPrincipal)}</div><div class="caption">Sem adicionar correção</div></div>
            <div class="finance-card alert"><div class="label">Principal vencido</div><div class="amount">${money(st.overduePrincipal)}</div><div class="caption">${st.overdue.length} parcela(s) atrasada(s)</div></div>
            <div class="finance-card"><div class="label">Correção acumulada</div><div class="amount">${money(st.interest)}</div><div class="caption">Regra da poupança</div></div>
            <div class="finance-card emphasis"><div class="label">Saldo atualizado</div><div class="amount">${money(st.openWithInterest)}</div><div class="caption">Principal aberto + correção</div></div>
          </div>
          <div class="note"><strong>Próximo vencimento:</strong> ${next ? `${formatDateBR(next.dueDate)} • saldo da parcela ${money(Domain.installmentOpenValue(next))}` : "acordo concluído"}</div>
        </section>

        ${loanSection}

        <section class="finance-section">
          <h3>Parcelas e saldos</h3>
          <div class="finance-table">
            <div class="finance-row finance-head"><div>Parcela</div><div class="right">Valor</div><div class="right">Saldo</div><div class="right">Situação</div></div>
            ${installmentRows}
          </div>
        </section>

        <section class="finance-section"><h3>Histórico financeiro</h3><div class="movement-list">${movementRows}</div></section>
        ${tx.notes ? `<div class="note"><strong>Observações:</strong><br>${escapeHTML(tx.notes)}</div>` : ""}

        <div class="item-actions" style="margin-top:14px">
          <button class="btn primary" type="button" data-action="receipt" data-id="${tx.id}">Gerar demonstrativo</button>
          <button class="btn" type="button" data-action="copyReportQuick" data-id="${tx.id}">Copiar demonstrativo</button>
          <button class="btn" type="button" data-action="shareReportQuick" data-id="${tx.id}">Compartilhar</button>
          <button class="btn" type="button" data-action="abat" data-id="${tx.id}">Registrar pagamento</button>
          <a class="btn" href="#form" data-action="edit" data-id="${tx.id}">Editar</a>
          <button class="btn danger" type="button" data-action="delete" data-id="${tx.id}">Excluir</button>
        </div>`;

      detailCard.hidden = false;
      detailCard.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const renderForm = () => {
      ensureInterestTypeField();

      const state = App.getState();
      $("#displayCurrency").value = state.settings.displayCurrency;

      const id = ($("#txId").value || "").trim();
      const isEdit = Boolean(id);

      $("#formTitle").textContent = isEdit ? "Editar transação" : "Nova transação";
      $("#formSubtitle").textContent = isEdit ? "Atualize os campos e salve." : "Preencha os campos obrigatórios. Parcelas são geradas automaticamente.";

      const pm = ($("input[name='paymentMode']:checked")?.value || "avista");
      $("#installmentsBox").hidden = pm !== "parcelado";

      const t = $("#type").value || "";
      $("#loanRateField").hidden = t !== "emprestimo";

      updateInterestTypeHelp();
      updateInstallmentPreview();
    };

    const updateInstallmentPreview = () => {
      const pm = ($("input[name='paymentMode']:checked")?.value || "avista");
      const box = $("#installmentsPreview");
      if (!box) return;

      if (pm !== "parcelado") {
        box.textContent = "À vista: será criada 1 parcela (pendente) com a data do acordo.";
        return;
      }

      const agreementDate = $("#agreementDate").value || todayISODate();
      const currency = $("#currency").value || "BRL";
      const freq = $("#frequency").value || "mensal";
      const total = parseMoneyInput($("#totalValue").value);

      const rawN = String($("#numInstallments").value || "").trim();
      const n = parseInt(rawN || "0", 10);
      const day = parseInt($("#dueDay").value || "0", 10);
      const per = parseMoneyInput($("#installmentValue").value);

      if (!agreementDate || !day || !Number.isFinite(total) || total <= 0) {
        box.textContent = "Preencha valor, data e dia de vencimento para ver a prévia.";
        return;
      }

      if (rawN && /[,.]/.test(rawN)) {
        box.textContent = "Nº parcelas deve ser inteiro. Se não fecha redondo, use “Valor por parcela”.";
        return;
      }

      if (!((Number.isInteger(n) && n >= 2) || (Number.isFinite(per) && per > 0))) {
        box.textContent = "Informe Nº parcelas ou Valor por parcela para ver a prévia.";
        return;
      }

      const inst = Domain.generateInstallments({
        paymentMode: "parcelado",
        totalValue: total,
        agreementDate,
        frequency: freq,
        numInstallments: n,
        dueDay: day,
        currency,
        installmentValue: Number.isFinite(per) ? per : null,
      });

      const first = inst[0];
      const last = inst[inst.length - 1];
      const lastValue = formatCurrency(last.value, currency);

      box.textContent =
        `Prévia: ${inst.length} parcela(s). 1ª: ${formatDateBR(first.dueDate)} • Última: ${formatDateBR(last.dueDate)} • Última parcela: ${lastValue}.`;
    };

    return {
      show,
      routeFromHash,
      goToDetail,
      renderDashboard,
      renderTransactions,
      renderDetail,
      renderForm,
      renderSettingsMeta,
      updateInstallmentPreview,
      ensureInterestTypeField,
      updateInterestTypeHelp
    };
  })();

  /* ---------------- Receipt / Report ---------------- */
  const Receipt = (() => {
    let currentTxId = null;
    let currentText = "";

    const moneyFor = (tx, value) => {
      const state = App.getState();
      const display = state.settings.displayCurrency;
      const conv = Rates.convert(value, tx.currency, display, state.settings.lastRates);
      return formatCurrency(conv.ok ? conv.value : value, conv.ok ? display : tx.currency);
    };

    const dateOnly = (value) => String(value || "").slice(0, 10);

    const open = (txId, mode = "report") => {
      const tx = App.getTransaction(txId);
      if (!tx) return;
      currentTxId = txId;
      $("#receiptMode").value = mode;
      const sel = $("#receiptInstallment");
      sel.innerHTML = "";
      (tx.installments || []).forEach(inst => {
        const opt = document.createElement("option");
        opt.value = String(inst.number);
        opt.textContent = `${inst.number}/${tx.installments.length} • ${formatDateBR(inst.dueDate)} • saldo ${moneyFor(tx, Domain.installmentOpenValue(inst))}`;
        sel.appendChild(opt);
      });
      $("#receiptInstallmentField").hidden = !(mode === "installment" && tx.paymentMode === "parcelado");
      $("#signature").value = "";
      render();
      UI.openOverlay("receipt");
    };

    const close = () => {
      UI.closeOverlay("receipt");
      currentTxId = null;
      currentText = "";
    };

    const reportDocument = (tx, sig) => {
      const st = Domain.financialStatement(tx);
      const generated = new Date().toLocaleString("pt-BR");
      const rate = ((Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE) * 100).toFixed(2).replace(".", ",");
      const installments = (tx.installments || []).map(i => {
        const contract = Domain.installmentContractValue(i);
        const paid = Domain.installmentPaidValue(i);
        const open = Domain.installmentOpenValue(i);
        const status = open <= 0 ? "Pago" : (i.dueDate < todayISODate() ? "Atrasado" : paid > 0 ? "Parcial" : "Pendente");
        return { i, contract, paid, open, status };
      });

      const htmlRows = installments.map(x => `<tr><td>${x.i.number}/${tx.installments.length}<br><span class="muted">${formatDateBR(x.i.dueDate)}</span></td><td class="num">${moneyFor(tx, x.contract)}</td><td class="num">${moneyFor(tx, x.paid)}</td><td class="num">${moneyFor(tx, x.open)}</td><td>${x.status}</td></tr>`).join("");
      const movementRows = Domain.sortedMovements(tx).map(m => `<tr><td>${formatDateBR(dateOnly(m.date))}</td><td>${escapeHTML(Domain.movementLabel(m))}${m.installmentNumber ? ` • parcela ${m.installmentNumber}` : ""}</td><td class="num">${Number(m.amount || 0) < 0 ? "−" : "+"} ${moneyFor(tx, Math.abs(Number(m.amount || 0)))}</td></tr>`).join("");
      const correctionRows = st.interestInfo.details.map(d => `<tr><td>${d.number}</td><td>${formatDateBR(d.dueDate)}</td><td class="num">${moneyFor(tx, d.principal)}</td><td class="num">${d.months}</td><td class="num">${moneyFor(tx, d.interest)}</td></tr>`).join("");

      const html = `
        <h3>DEMONSTRATIVO FINANCEIRO</h3>
        <div class="muted">Documento gerado em ${escapeHTML(generated)} • Comprar &amp; Venda PRO v${APP_VERSION}</div>
        <div class="grid">
          <div class="box"><div class="k">Cliente / outra parte</div><div class="v">${escapeHTML(tx.counterpartyName)}</div><div class="muted">${escapeHTML(tx.counterpartyDoc || "Documento não informado")}</div></div>
          <div class="box"><div class="k">Acordo</div><div class="v">${escapeHTML(Domain.typeLabel(tx.type))} • ${escapeHTML(tx.item)}</div><div class="muted">Data: ${formatDateBR(tx.agreementDate)}</div></div>
        </div>
        <h4>Resumo financeiro</h4>
        <div class="finance-summary">
          <div class="box"><div class="k">Valor original</div><div class="v">${moneyFor(tx, st.originalValue)}</div></div>
          <div class="box"><div class="k">Total recebido</div><div class="v">${moneyFor(tx, st.paidPrincipal)}</div></div>
          <div class="box"><div class="k">Principal em aberto</div><div class="v">${moneyFor(tx, st.openPrincipal)}</div></div>
          <div class="box"><div class="k">Principal vencido</div><div class="v">${moneyFor(tx, st.overduePrincipal)}</div></div>
          <div class="box"><div class="k">Correção pela poupança</div><div class="v">${moneyFor(tx, st.interest)}</div></div>
          <div class="box strong"><div class="k">Saldo atualizado</div><div class="v">${moneyFor(tx, st.openWithInterest)}</div></div>
        </div>
        ${tx.type === "emprestimo" ? `<h4>Metodologia da correção</h4><div class="listline">Taxa registrada: <strong>${rate}% ao mês</strong>. A correção é calculada separadamente sobre o saldo de cada parcela vencida, somente por meses completos depois do vencimento. Parcelas futuras não recebem juros.</div>${correctionRows ? `<table class="statement-table"><thead><tr><th>Parcela</th><th>Vencimento</th><th class="num">Principal</th><th class="num">Meses</th><th class="num">Correção</th></tr></thead><tbody>${correctionRows}</tbody></table>` : `<div class="listline">Nenhuma correção acumulada até esta data.</div>`}` : ""}
        <h4>Parcelas</h4>
        <table class="statement-table"><thead><tr><th>Parcela</th><th class="num">Valor</th><th class="num">Recebido</th><th class="num">Saldo</th><th>Situação</th></tr></thead><tbody>${htmlRows}</tbody></table>
        <h4>Histórico financeiro</h4>
        ${movementRows ? `<table class="statement-table"><thead><tr><th>Data</th><th>Movimento</th><th class="num">Valor</th></tr></thead><tbody>${movementRows}</tbody></table>` : `<div class="listline">Nenhum pagamento registrado.</div>`}
        ${tx.notes ? `<h4>Observações</h4><div class="listline">${escapeHTML(tx.notes)}</div>` : ""}
        <div class="sign"><div><div class="k">Assinatura</div><div class="v">${escapeHTML(sig || "—")}</div></div><div class="muted">Demonstrativo de controle particular. Confira os valores antes do envio.</div></div>`;

      const lines = [
        "DEMONSTRATIVO FINANCEIRO",
        `Cliente / outra parte: ${tx.counterpartyName}`,
        `Documento: ${tx.counterpartyDoc || "não informado"}`,
        `Acordo: ${Domain.typeLabel(tx.type)} • ${tx.item}`,
        `Data do acordo: ${formatDateBR(tx.agreementDate)}`,
        "",
        "RESUMO FINANCEIRO",
        `Valor original: ${moneyFor(tx, st.originalValue)}`,
        `Total recebido: ${moneyFor(tx, st.paidPrincipal)}`,
        `Principal em aberto: ${moneyFor(tx, st.openPrincipal)}`,
        `Principal vencido: ${moneyFor(tx, st.overduePrincipal)}`,
        `Correção pela poupança: ${moneyFor(tx, st.interest)}`,
        `SALDO ATUALIZADO: ${moneyFor(tx, st.openWithInterest)}`,
      ];
      if (tx.type === "emprestimo") {
        lines.push("", "METODOLOGIA", `Taxa registrada: ${rate}% ao mês. Cálculo por parcela vencida e por meses completos.`);
        st.interestInfo.details.forEach(d => lines.push(`Parcela ${d.number}: principal ${moneyFor(tx, d.principal)} • ${d.months} mês(es) • correção ${moneyFor(tx, d.interest)}`));
      }
      lines.push("", "PARCELAS");
      installments.forEach(x => lines.push(`${x.i.number}/${tx.installments.length} • ${formatDateBR(x.i.dueDate)} • valor ${moneyFor(tx, x.contract)} • recebido ${moneyFor(tx, x.paid)} • saldo ${moneyFor(tx, x.open)} • ${x.status}`));
      lines.push("", "HISTÓRICO FINANCEIRO");
      const movements = Domain.sortedMovements(tx);
      if (!movements.length) lines.push("Nenhum pagamento registrado.");
      movements.forEach(m => lines.push(`${formatDateBR(dateOnly(m.date))} • ${Domain.movementLabel(m)}${m.installmentNumber ? ` • parcela ${m.installmentNumber}` : ""} • ${Number(m.amount || 0) < 0 ? "−" : "+"} ${moneyFor(tx, Math.abs(Number(m.amount || 0)))}`));
      if (tx.notes) lines.push("", `Observações: ${tx.notes}`);
      if (sig) lines.push("", `Assinatura: ${sig}`);
      return { html, text: lines.join("\n") };
    };

    const receiptDocument = (tx, mode, sig) => {
      let value = Domain.financialStatement(tx).originalValue;
      let title = "RECIBO DO ACORDO";
      let detail = `Referente a ${Domain.typeLabel(tx.type).toLowerCase()}: ${tx.item}.`;
      if (mode === "installment") {
        const n = parseInt($("#receiptInstallment").value || "1", 10);
        const inst = (tx.installments || []).find(i => i.number === n) || tx.installments?.[0];
        value = inst ? Domain.installmentPaidValue(inst) || Domain.installmentContractValue(inst) : value;
        title = "RECIBO DE PARCELA";
        detail = inst ? `Parcela ${inst.number}/${tx.installments.length}, vencimento em ${formatDateBR(inst.dueDate)}.` : detail;
      }
      const html = `<h3>${title}</h3><div class="listline">Recebi de <strong>${escapeHTML(tx.counterpartyName)}</strong> o valor de <strong>${moneyFor(tx, value)}</strong>.<br>${escapeHTML(detail)}</div><div class="grid"><div class="box"><div class="k">Data do acordo</div><div class="v">${formatDateBR(tx.agreementDate)}</div></div><div class="box"><div class="k">Documento</div><div class="v">${escapeHTML(tx.counterpartyDoc || "não informado")}</div></div></div><div class="sign"><div><div class="k">Assinatura</div><div class="v">${escapeHTML(sig || "—")}</div></div><div class="muted">Gerado em ${new Date().toLocaleString("pt-BR")}</div></div>`;
      const text = `${title}\nRecebi de ${tx.counterpartyName} o valor de ${moneyFor(tx, value)}.\n${detail}\nData do acordo: ${formatDateBR(tx.agreementDate)}${sig ? `\nAssinatura: ${sig}` : ""}`;
      return { html, text };
    };

    const render = () => {
      const tx = App.getTransaction(currentTxId);
      if (!tx) return;
      const mode = $("#receiptMode").value || "report";
      const sig = ($("#signature").value || "").trim();
      $("#receiptTitle").textContent = mode === "report" ? "Demonstrativo financeiro" : "Recibo";
      $("#receiptInstallmentField").hidden = !(mode === "installment" && tx.paymentMode === "parcelado");
      const doc = mode === "report" ? reportDocument(tx, sig) : receiptDocument(tx, mode, sig);
      $("#receiptDoc").innerHTML = doc.html;
      currentText = doc.text;
    };

    const copy = async () => {
      if (!currentText) render();
      try {
        await navigator.clipboard.writeText(currentText);
        UI.toast("Documento copiado.", "good");
      } catch {
        const ta = document.createElement("textarea");
        ta.value = currentText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        UI.toast("Documento copiado.", "good");
      }
    };

    const share = async () => {
      if (!currentText) render();
      if (navigator.share) {
        try { await navigator.share({ title: "Demonstrativo financeiro", text: currentText }); return; }
        catch (err) { if (err?.name === "AbortError") return; }
      }
      await copy();
      UI.toast("Compartilhamento indisponível. O texto foi copiado.", "warn");
    };

    const print = () => {
      document.body.classList.add("print-receipt");
      window.setTimeout(() => {
        window.print();
        window.setTimeout(() => document.body.classList.remove("print-receipt"), 400);
      }, 50);
    };

    return { open, close, render, copy, share, print };
  })();

  /* ---------------- Import / Export ---------------- */
  const IO = (() => {
    const exportJSON = () => {
      const data = App.getState();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.href = url;
      a.download = `comprar-venda-pro_${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      UI.toast("Exportação iniciada.", "good");
    };

    const openImport = () => {
      $("#importFile").value = "";
      $("#importFile").click();
    };

    const importJSON = async (file) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        if (typeof parsed !== "object" || !parsed) throw new Error("JSON inválido");
        if (parsed.schemaVersion == null) throw new Error("Sem schemaVersion.");

        const ok = window.confirm("Importar irá sobrescrever seus dados atuais. Confirmar?");
        if (!ok) return;

        const migrated = Storage.migrate(parsed);
        App.replaceAll(migrated);

        UI.toast("Importação concluída.", "good");
        location.hash = "#dashboard";
      } catch {
        UI.toast("Erro de importação: arquivo inválido ou corrompido.", "bad", { ttl: 6500 });
      }
    };

    const clearAllWithPhrase = async () => {
      const phrase = window.prompt('Ação destrutiva. Digite "LIMPAR" para confirmar:');
      if (phrase !== "LIMPAR") {
        UI.toast("Cancelado. Nenhum dado foi removido.", "warn");
        return;
      }
      App.clearAll();
      UI.toast("Dados removidos.", "good");
      location.hash = "#dashboard";
    };

    return { exportJSON, openImport, importJSON, clearAllWithPhrase };
  })();

  /* ---------------- Form helpers ---------------- */
  function clearErrors() {
    $$("[id^='err-']").forEach(el => el.textContent = "");
  }

  function setFormDefaults() {
    Views.ensureInterestTypeField();

    $("#agreementDate").value = todayISODate();
    $("#numInstallments").value = "";
    $("#dueDay").value = "";
    $("#frequency").value = "mensal";
    $("#currency").value = "BRL";
    $("#counterpartyDoc").value = "";
    $("#installmentValue").value = "";
    const defaultRate = Number(App.getState().settings.defaultSavingsRate ?? DEFAULT_LOAN_RATE);
    $("#loanRate").value = String((defaultRate * 100).toFixed(2)).replace(".", ",");
    clearErrors();
    const fm = $("#formMeta");
    if (fm) fm.textContent = "";
  }

  function populateForm(tx) {
    Views.ensureInterestTypeField();

    $("#txId").value = tx.id;
    $("#type").value = tx.type;
    $("#item").value = tx.item;
    $("#counterpartyName").value = tx.counterpartyName;
    $("#counterpartyDoc").value = tx.counterpartyDoc || "";
    $("#currency").value = tx.currency;
    $("#totalValue").value = String(tx.originalValue ?? tx.totalValue).replace(".", ",");
    $("#agreementDate").value = tx.agreementDate;
    $("#notes").value = tx.notes || "";
    $("#loanRate").value = tx.type === "emprestimo"
      ? String(((Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE) * 100).toFixed(2)).replace(".", ",")
      : "0,67";


    const pm = tx.paymentMode || "avista";
    $$("input[name='paymentMode']").forEach(r => r.checked = (r.value === pm));
    $("#installmentsBox").hidden = pm !== "parcelado";
    $("#loanRateField").hidden = tx.type !== "emprestimo";

    if (pm === "parcelado") {
      $("#frequency").value = tx.frequency || "mensal";
      $("#numInstallments").value = String(tx.installments?.length || "");
      const due = tx.installments?.[0]?.dueDate || tx.agreementDate;
      const dd = Number(due?.split("-")?.[2] || 1);
      $("#dueDay").value = String(dd);
      $("#installmentValue").value = "";
    } else {
      $("#numInstallments").value = "";
      $("#dueDay").value = "";
      $("#frequency").value = "mensal";
      $("#installmentValue").value = "";
    }

    const fm = $("#formMeta");
    if (fm) fm.textContent = `Criado em ${new Date(tx.createdAt).toLocaleString("pt-BR")} • Atualizado em ${new Date(tx.updatedAt).toLocaleString("pt-BR")}`;
  }

  function resetForm() {
    $("#txForm").reset();
    $("#txId").value = "";
    setFormDefaults();
    $("#installmentsBox").hidden = true;
    $("#loanRateField").hidden = true;
    Views.updateInstallmentPreview();
  }

  function buildTxFromForm(existing) {
    const type = $("#type").value;
    const item = $("#item").value.trim();
    const counterpartyName = $("#counterpartyName").value.trim();
    const counterpartyDoc = ($("#counterpartyDoc").value || "").trim() || null;
    const currency = $("#currency").value;
    const totalValue = parseMoneyInput($("#totalValue").value);
    const agreementDate = $("#agreementDate").value;
    const notes = ($("#notes").value || "").trim() || null;
    const paymentMode = ($("input[name='paymentMode']:checked")?.value || "avista");

    const frequency = $("#frequency").value || "mensal";

    const rawN = String($("#numInstallments").value || "").trim();
    const numInstallments = /[,.]/.test(rawN) ? NaN : parseInt(rawN || "0", 10);

    const dueDay = parseInt($("#dueDay").value || "0", 10);

    const installmentValue = parseMoneyInput($("#installmentValue").value);
    const hasInstallmentValue = Number.isFinite(installmentValue) && installmentValue > 0;

    const loanRatePct = parseMoneyInput($("#loanRate").value);
    const loanRate = (type === "emprestimo")
      ? (Number.isFinite(loanRatePct) && loanRatePct > 0 ? (loanRatePct / 100) : DEFAULT_LOAN_RATE)
      : null;

    const interestType = type === "emprestimo" ? DEFAULT_INTEREST_TYPE : null;

    return {
      id: existing?.id || safeUUID(),
      type, item, counterpartyName, counterpartyDoc,
      currency, totalValue, agreementDate,
      paymentMode,
      frequency: paymentMode === "parcelado" ? frequency : null,
      notes,
      loanRate,
      interestType,
      createdAt: existing?.createdAt || nowISO(),
      updatedAt: nowISO(),
      _numInstallments: paymentMode === "parcelado" ? numInstallments : null,
      _dueDay: paymentMode === "parcelado" ? dueDay : null,
      _installmentValue: paymentMode === "parcelado" && hasInstallmentValue ? installmentValue : null,
    };
  }

  function applyValidation(errors) {
    UI.setFieldError("type", errors.type || "");
    UI.setFieldError("item", errors.item || "");
    UI.setFieldError("counterpartyName", errors.counterpartyName || "");
    UI.setFieldError("totalValue", errors.totalValue || "");
    UI.setFieldError("agreementDate", errors.agreementDate || "");
    UI.setFieldError("loanRate", errors.loanRate || "");
    UI.setFieldError("numInstallments", errors.numInstallments || "");
    UI.setFieldError("dueDay", errors.dueDay || "");
    UI.setFieldError("installmentValue", errors.installmentValue || "");
  }

  /* ---------------- Wiring ---------------- */
  function wire() {
    Views.ensureInterestTypeField();

    window.addEventListener("hashchange", () => Views.show(Views.routeFromHash()));
    Views.show(Views.routeFromHash());

    $("#menuBtn").addEventListener("click", () => {
      UI.openOverlay("menu");
      Manual.ensureInMenu();
    });

    $("#menuOverlay").addEventListener("click", (e) => {
      const closeBtn = e.target.closest("[data-close='menu']");
      if (closeBtn) UI.closeOverlay("menu");

      const scrollBtn = e.target.closest("[data-action='manualScroll']");
      if (scrollBtn) {
        const target = scrollBtn.getAttribute("data-target");
        if (target) Manual.scrollTo(target);
      }
    });

    $("#receiptOverlay").addEventListener("click", (e) => {
      const closeBtn = e.target.closest("[data-close='receipt']");
      if (closeBtn) Receipt.close();
    });

    $("#displayCurrency").addEventListener("change", (e) => {
      App.setDisplayCurrency(e.target.value);
      UI.toast("Moeda de exibição atualizada.", "good");
      Views.renderDashboard();
      Views.renderTransactions();
    });

    $("#defaultSavingsRate")?.addEventListener("change", (e) => {
      const pct = parseMoneyInput(e.target.value);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        UI.toast("Informe uma taxa mensal válida.", "bad");
        Views.renderSettingsMeta();
        return;
      }
      App.setDefaultSavingsRate(pct / 100);
      UI.toast("Taxa padrão da poupança atualizada.", "good");
      Views.renderSettingsMeta();
    });

    const doRates = async () => {
      const state = App.getState();
      const res = await Rates.updateRates(state, { forceToast: true });
      Views.renderSettingsMeta();
      Views.renderDashboard();
      Views.renderTransactions();
      if (res.offline) $("#offlineBadge").hidden = false;
    };

    $("#ratesBtnMenu").addEventListener("click", async () => { UI.closeOverlay("menu"); await doRates(); });
    $("#ratesBtnSettings").addEventListener("click", doRates);

    window.addEventListener("online", () => Views.renderSettingsMeta());
    window.addEventListener("offline", () => Views.renderSettingsMeta());

    $("#exportBtn").addEventListener("click", () => { UI.closeOverlay("menu"); IO.exportJSON(); });
    $("#importBtn").addEventListener("click", () => { UI.closeOverlay("menu"); IO.openImport(); });
    $("#clearBtn").addEventListener("click", async () => {
      UI.closeOverlay("menu");
      await IO.clearAllWithPhrase();
      Views.renderDashboard();
      Views.renderTransactions();
      resetForm();
    });

    $("#importFile").addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await IO.importJSON(file);
      Views.renderDashboard();
      Views.renderTransactions();
      resetForm();
      Views.renderSettingsMeta();
    });

    $("#filterForm").addEventListener("input", () => Views.renderTransactions());
    $("#clearFiltersBtn").addEventListener("click", () => {
      $("#filterForm").reset();
      Views.renderTransactions();
    });

    $$("input[name='paymentMode']").forEach(r => {
      r.addEventListener("change", () => {
        const pm = ($("input[name='paymentMode']:checked")?.value || "avista");
        $("#installmentsBox").hidden = pm !== "parcelado";
        Views.updateInstallmentPreview();
      });
    });

    ["agreementDate", "currency", "totalValue", "frequency", "numInstallments", "dueDay", "installmentValue"].forEach(id => {
      const el = $(`#${id}`);
      if (!el) return;
      el.addEventListener("input", () => Views.updateInstallmentPreview());
      el.addEventListener("change", () => Views.updateInstallmentPreview());
    });

    $("#type").addEventListener("change", () => {
      const t = $("#type").value;
      $("#loanRateField").hidden = t !== "emprestimo";
      if (t === "emprestimo" && !$("#loanRate").value.trim()) {
        const rate = Number(App.getState().settings.defaultSavingsRate ?? DEFAULT_LOAN_RATE);
        $("#loanRate").value = String((rate * 100).toFixed(2)).replace(".", ",");
      }
    });

    $("#txForm").addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const txId = ($("#txId").value || "").trim();
      const existing = txId ? App.getTransaction(txId) : null;

      const draft = buildTxFromForm(existing);

      const domainDraft = {
        type: draft.type,
        item: draft.item,
        counterpartyName: draft.counterpartyName,
        currency: draft.currency,
        totalValue: draft.totalValue,
        agreementDate: draft.agreementDate,
        paymentMode: ($("input[name='paymentMode']:checked")?.value || "avista"),
        frequency: draft.frequency || "mensal",
        numInstallments: draft._numInstallments || 0,
        dueDay: draft._dueDay || 0,
        installmentValue: draft._installmentValue,
        loanRate: draft.loanRate,
        interestType: draft.interestType,
      };

      if (draft.paymentMode === "parcelado" && draft._numInstallments != null && Number.isNaN(draft._numInstallments)) {
        applyValidation({ numInstallments: "Nº parcelas deve ser inteiro. Se não fecha redondo, use “Valor por parcela”." });
        UI.toast("Revise os campos em vermelho.", "bad");
        return;
      }

      const errs = Domain.validateTx(domainDraft);
      applyValidation(errs);

      if (Object.keys(errs).length) {
        UI.toast("Revise os campos em vermelho.", "bad");
        return;
      }

      const installments = Domain.generateInstallments({
        paymentMode: domainDraft.paymentMode,
        totalValue: domainDraft.totalValue,
        agreementDate: domainDraft.agreementDate,
        frequency: domainDraft.frequency,
        numInstallments: domainDraft.numInstallments,
        dueDay: domainDraft.dueDay,
        currency: domainDraft.currency,
        installmentValue: domainDraft.installmentValue,
      });

      let finalInstallments = installments;
      const existingStatement = existing ? Domain.financialStatement(existing) : null;
      if (existing && existingStatement && existingStatement.paidPrincipal > 0) {
        const financialChanged =
          existing.currency !== draft.currency ||
          Number(existing.originalValue ?? existing.totalValue) !== roundByCurrency(draft.totalValue, draft.currency) ||
          (existing.paymentMode || "avista") !== domainDraft.paymentMode ||
          (existing.frequency || null) !== (domainDraft.paymentMode === "parcelado" ? domainDraft.frequency : null) ||
          (existing.installments || []).length !== installments.length;
        if (financialChanged) {
          UI.toast("Este acordo já possui pagamentos. Para preservar o histórico, os valores e o plano de parcelas não podem ser alterados nesta tela.", "warn", { ttl: 8500 });
          return;
        }
        finalInstallments = safeClone(existing.installments);
      }

      const tx = {
        id: draft.id,
        type: draft.type,
        item: draft.item,
        counterpartyName: draft.counterpartyName,
        counterpartyDoc: draft.counterpartyDoc,
        currency: draft.currency,
        originalValue: existing?.originalValue ?? roundByCurrency(draft.totalValue, draft.currency),
        totalValue: existing?.originalValue ?? roundByCurrency(draft.totalValue, draft.currency),
        agreementDate: draft.agreementDate,
        paymentMode: domainDraft.paymentMode,
        frequency: domainDraft.paymentMode === "parcelado" ? domainDraft.frequency : null,
        installments: finalInstallments.map((i, idx) => ({
          id: i.id || safeUUID(),
          number: i.number || idx + 1,
          dueDate: i.dueDate,
          value: Domain.installmentContractValue(i),
          originalValue: Domain.installmentContractValue(i),
          paidAmount: Domain.installmentPaidValue(i),
          status: Domain.installmentOpenValue(i) <= 0 ? "pago" : "pendente",
          paidAt: Domain.installmentOpenValue(i) <= 0 ? (i.paidAt || todayISODate()) : null,
        })),
        notes: draft.notes,
        loanRate: draft.type === "emprestimo" ? (Number.isFinite(draft.loanRate) ? draft.loanRate : DEFAULT_LOAN_RATE) : null,
        interestType: draft.type === "emprestimo" ? DEFAULT_INTEREST_TYPE : null,
        movements: Array.isArray(existing?.movements) ? safeClone(existing.movements) : [],
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      };
      Domain.addMovement(tx, {
        type: existing ? "agreement_updated" : "agreement_created",
        amount: 0,
        date: nowISO(),
        note: existing ? "Dados do acordo atualizados." : "Acordo registrado no sistema.",
      });

      App.upsertTransaction(tx);
      UI.toast(existing ? "Transação atualizada." : "Transação criada.", "good");
      resetForm();

      Views.renderDashboard();
      Views.renderTransactions();
      location.hash = "#transactions";
    });

    $("#cancelEditBtn").addEventListener("click", () => {
      resetForm();
      location.hash = "#dashboard";
    });

    $("#closeDetailBtn").addEventListener("click", () => {
      $("#detailCard").hidden = true;
      $("#txDetail").innerHTML = "";
    });

    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;

      const action = el.dataset.action;
      const id = el.dataset.id;

      if (action === "edit" && id) {
        const tx = App.getTransaction(id);
        if (!tx) return;
        resetForm();
        populateForm(tx);
        location.hash = "#form";
        Views.renderForm();
        Views.updateInstallmentPreview();
        return;
      }

      if (action === "openDetail" && id) {
        if (Views.routeFromHash() !== "transactions") Views.goToDetail(id);
        else Views.renderDetail(id);
        return;
      }

      if (action === "delete" && id) {
        const ok = window.confirm("Excluir esta transação? Esta ação não pode ser desfeita.");
        if (!ok) return;
        App.deleteTransaction(id);
        UI.toast("Transação excluída.", "good");
        Views.renderDashboard();
        Views.renderTransactions();
        $("#detailCard").hidden = true;
        return;
      }

      if (action === "payNext" && id) {
        const tx = App.getTransaction(id);
        if (!tx) return;

        const res = Domain.payNext(tx);
        if (!res.ok) { UI.toast("Nada a pagar. Já está concluído.", "warn"); return; }

        App.upsertTransaction(tx);
        Views.renderDashboard();
        Views.renderTransactions();
        Views.renderDetail(id);

        UI.toast("Parcela marcada como paga.", "good", {
          ttl: 7000,
          action: {
            label: "Desfazer",
            onClick: () => {
              const current = App.getTransaction(id);
              if (!current) return;
              Domain.undoPay(current, res.paidNumber, res.previousPaidAmount, res.movementId);
              App.upsertTransaction(current);
              Views.renderDashboard();
              Views.renderTransactions();
              Views.renderDetail(id);
              UI.toast("Pagamento desfeito.", "warn");
            }
          }
        });
        return;
      }

      if (action === "abat" && id) {
        const tx = App.getTransaction(id);
        if (!tx) return;

        const pending = Domain.sumByStatus(tx, "pendente");
        if (pending <= 0) {
          UI.toast("Nada em aberto para receber.", "warn");
          return;
        }

        const raw = window.prompt(
          `Digite o valor recebido agora.\n` +
          `Saldo em aberto (sem juros): ${formatCurrency(pending, tx.currency)}\n` +
          `Use vírgula se quiser (ex.: 250,50).`
        );

        if (raw == null) return;
        const val = parseMoneyInput(raw);
        if (!Number.isFinite(val) || val <= 0) {
          UI.toast("Valor inválido.", "bad");
          return;
        }

        const ok = window.confirm(`Confirmar recebimento de ${formatCurrency(val, tx.currency)}?`);
        if (!ok) return;

        const res = Domain.applyAbatement(tx, val, todayISODate());
        if (!res.ok) {
          UI.toast(res.reason || "Não foi possível aplicar.", "bad");
          return;
        }

        App.upsertTransaction(tx);
        Views.renderDashboard();
        Views.renderTransactions();
        Views.renderDetail(id);
        UI.toast(`Pagamento registrado: ${formatCurrency(res.applied, tx.currency)}.`, "good");
        return;
      }

      if (action === "receipt" && id) {
        Receipt.open(id, "report");
        return;
      }

      if (action === "copyReportQuick" && id) {
        Receipt.open(id, "report");
        window.setTimeout(() => Receipt.copy(), 120);
        return;
      }

      if (action === "shareReportQuick" && id) {
        Receipt.open(id, "report");
        window.setTimeout(() => Receipt.share(), 140);
        return;
      }
    });

    $("#receiptMode").addEventListener("change", () => Receipt.render());
    $("#receiptInstallment").addEventListener("change", () => Receipt.render());
    $("#signature").addEventListener("input", () => Receipt.render());
    $("#copyReceiptBtn").addEventListener("click", () => Receipt.copy());
    $("#shareReceiptBtn").addEventListener("click", () => Receipt.share());
    $("#printReceiptBtn").addEventListener("click", () => Receipt.print());

    const st = App.getState();
    if (!st.transactions.length) {
      const example = {
        id: safeUUID(),
        type: "emprestimo",
        item: "Exemplo: Empréstimo pessoal",
        counterpartyName: "Devedor Exemplo",
        counterpartyDoc: null,
        currency: "BRL",
        originalValue: 1200,
        totalValue: 1200,
        agreementDate: todayISODate(),
        paymentMode: "parcelado",
        frequency: "mensal",
        installments: Domain.generateInstallments({
          paymentMode: "parcelado",
          totalValue: 1200,
          agreementDate: todayISODate(),
          frequency: "mensal",
          numInstallments: 4,
          dueDay: 10,
          currency: "BRL",
          installmentValue: null,
        }),
        notes: "Você pode editar ou excluir este exemplo.",
        loanRate: DEFAULT_LOAN_RATE,
        interestType: DEFAULT_INTEREST_TYPE,
        movements: [{ id: safeUUID(), type: "agreement_created", amount: 0, date: nowISO(), installmentNumber: null, note: "Acordo de exemplo criado." }],
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      App.upsertTransaction(example);
      UI.toast("Incluímos 1 exemplo (você pode excluir).", "warn", { ttl: 6000 });
      Views.renderDashboard();
      Views.renderTransactions();
    }

    Views.renderSettingsMeta();
    setFormDefaults();

    Manual.ensureInMenu();
  }

  wire();
})();