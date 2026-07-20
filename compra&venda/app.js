(() => {
  "use strict";

  const APP_VERSION = "1.4.1";
  const SCHEMA_VERSION = 8;
  const STORAGE_KEY = "cvpro:data:v8";
  const RATES_TTL_MS = 12 * 60 * 60 * 1000;

  const CURRENCIES = ["BRL", "USD", "JPY"];
  const SIGNS = { BRL: "R$", USD: "US$", JPY: "¥" };

  const DEFAULT_LOAN_RATE = 0.0067; // 0,67% ao mês (0,5% + TR estimada)
  const DEFAULT_INTEREST_TYPE = "poupanca_composta";
  const DEFAULT_INTEREST_BASIS = "saldo_geral_em_aberto";
  const INTEREST_TYPES = ["poupanca_composta"];
  const INTEREST_BEARING_TYPES = ["venda", "emprestimo"];
  const isInterestBearingType = (type) => INTEREST_BEARING_TYPES.includes(type);
  const normalizedPositiveRate = (value, fallback = DEFAULT_LOAN_RATE) => {
    const n = Number(value);
    const f = Number(fallback);
    if (value !== null && value !== "" && Number.isFinite(n) && n > 0) return n;
    return Number.isFinite(f) && f > 0 ? f : DEFAULT_LOAN_RATE;
  };
  const PAYMENT_METHODS = ["pix", "transferencia", "dinheiro", "boleto", "cartao", "outro"];
  const PAYMENT_METHOD_LABELS = {
    pix: "Pix",
    transferencia: "Transferência bancária",
    dinheiro: "Dinheiro",
    boleto: "Boleto",
    cartao: "Cartão",
    outro: "Outro",
  };

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

  const getInterestTypeLabel = () => "Juros Compostos por Atraso";

  const getInterestTypeHint = () => "Calculados sobre o saldo geral em aberto, desde o primeiro vencimento não pago, por meses completos.";

  const getInterestTypeLongLabel = (tx) => {
    const rate = normalizedPositiveRate(tx?.loanRate);
    return `Juros Compostos por Atraso (${(rate * 100).toFixed(2).replace(".", ",")}% ao mês)`;
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

    const normalizeTransaction = (tx, defaultInterestRate = DEFAULT_LOAN_RATE) => {
      const t = safeClone(tx || {});
      t.installments = Array.isArray(t.installments)
        ? t.installments.map(normalizeInstallmentForStorage)
        : [];

      const scheduleTotal = t.installments.reduce((sum, i) => sum + finiteMoney(i.originalValue, 0), 0);
      t.originalValue = finiteMoney(t.originalValue, finiteMoney(t.totalValue, scheduleTotal));
      t.totalValue = t.originalValue;

      if (isInterestBearingType(t.type)) {
        // Hotfix v1.4.1: versões antigas gravavam vendas com loanRate null.
        // Number(null) vira 0 em JavaScript, o que zerava os juros após a migração.
        // Com juros ativos, taxa ausente, vazia, inválida ou zero recebe a taxa-padrão.
        t.loanRate = normalizedPositiveRate(t.loanRate, defaultInterestRate);
        const previousType = t.interestType;
        if (previousType && previousType !== DEFAULT_INTEREST_TYPE && !t.legacyInterestType) {
          t.legacyInterestType = previousType;
        }
        t.interestEnabled = t.interestEnabled !== false;
        t.interestType = DEFAULT_INTEREST_TYPE;
        t.interestCalculationBasis = DEFAULT_INTEREST_BASIS;
      } else {
        t.loanRate = null;
        t.interestEnabled = false;
        t.interestType = null;
        t.interestCalculationBasis = null;
      }

      t.movements = Array.isArray(t.movements) ? t.movements : inferredMovements(t);
      const ia = t.interestAccount && typeof t.interestAccount === "object" ? t.interestAccount : null;
      t.interestAccount = ia && ia.anchorDate && Number.isFinite(Number(ia.baseDebt)) && Number(ia.baseDebt) >= 0
        ? {
            anchorDate: String(ia.anchorDate).slice(0, 10),
            baseDebt: finiteMoney(ia.baseDebt, 0),
            principalAtAnchor: finiteMoney(ia.principalAtAnchor, 0),
          }
        : null;
      t.createdAt = t.createdAt || nowISO();
      t.updatedAt = t.updatedAt || t.createdAt;
      return t;
    };

    const migrate = (data) => {
      if (!data || typeof data !== "object") return defaultData();
      const d = safeClone(data);
      d.settings = { ...defaultSettings(), ...(d.settings || {}) };
      const savingsRate = Number(d.settings.defaultSavingsRate);
      d.settings.defaultSavingsRate = Number.isFinite(savingsRate) && savingsRate > 0
        ? savingsRate
        : DEFAULT_LOAN_RATE;
      d.transactions = Array.isArray(d.transactions) ? d.transactions.map(tx => normalizeTransaction(tx, d.settings.defaultSavingsRate)) : [];
      d.schemaVersion = SCHEMA_VERSION;
      d.appVersion = APP_VERSION;
      return d;
    };

    const load = () => {
      try {
        const keys = [STORAGE_KEY, "cvpro:data:v7", "cvpro:data:v6", "cvpro:data:v5", "cvpro:data:v4", "cvpro:data:v3", "cvpro:data:v2", "cvpro:data:v1"];
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
    const clear = () => ["cvpro:data:v8", "cvpro:data:v7", "cvpro:data:v6", "cvpro:data:v5", "cvpro:data:v4", "cvpro:data:v3", "cvpro:data:v2", "cvpro:data:v1"].forEach(k => localStorage.removeItem(k));

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
    const overlayMap = () => ({ menu: $("#menuOverlay"), payment: $("#paymentOverlay"), receipt: $("#receiptOverlay") });
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
      else if (map.payment && !map.payment.hidden) closeOverlay("payment");
      else if (map.menu && !map.menu.hidden) closeOverlay("menu");
    });

    document.addEventListener("click", (e) => {
      const closeEl = e.target.closest("[data-close]");
      if (closeEl) {
        const kind = closeEl.getAttribute("data-close");
        if (kind === "menu" || kind === "payment" || kind === "receipt") closeOverlay(kind);
        return;
      }

      const scrim = e.target.classList?.contains("overlay-scrim") ? e.target : null;
      if (scrim) {
        const ov = scrim.closest(".overlay");
        if (ov?.id === "menuOverlay") closeOverlay("menu");
        if (ov?.id === "paymentOverlay") closeOverlay("payment");
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
      if (!Number.isFinite(n) || n <= 0 || n > 1) return false;
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

      if (isInterestBearingType(draft.type) && draft.interestEnabled !== false) {
        if (!Number.isFinite(draft.loanRate) || draft.loanRate <= 0) errors.loanRate = "Informe uma taxa mensal maior que zero.";
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
        allocations: Array.isArray(movement.allocations) ? safeClone(movement.allocations) : null,
        referenceId: movement.referenceId || null,
        paymentMethod: PAYMENT_METHODS.includes(movement.paymentMethod) ? movement.paymentMethod : null,
        paymentReference: movement.paymentReference || null,
        interestAmount: Number(movement.interestAmount || 0),
        principalAmount: Number(movement.principalAmount || 0),
        principalBefore: Number(movement.principalBefore || 0),
        interestBefore: Number(movement.interestBefore || 0),
        balanceBefore: Number(movement.balanceBefore || 0),
        balanceAfter: Number(movement.balanceAfter || 0),
        snapshotBefore: movement.snapshotBefore ? safeClone(movement.snapshotBefore) : null,
        reversedAt: movement.reversedAt || null,
        reversalMovementId: movement.reversalMovementId || null,
        note: movement.note || null,
      };
      tx.movements.push(item);
      return item;
    };

    const typeLabel = (t) => t === "compra" ? "Compra" : t === "venda" ? "Venda" : "Empréstimo";
    const paymentMethodLabel = (method) => PAYMENT_METHOD_LABELS[method] || "Não informado";

    const loanMonthlyYield = (tx) => {
      if (!isInterestBearingType(tx.type) || tx.interestEnabled === false) return 0;
      const pending = sumByStatus(tx, "pendente");
      const rate = normalizedPositiveRate(tx.loanRate);
      return roundByCurrency(pending * rate, tx.currency || "BRL");
    };

    const validInterestAccount = (tx, asOfISO) => {
      const account = tx?.interestAccount;
      if (!account || typeof account !== "object") return null;
      const anchorDate = String(account.anchorDate || "").slice(0, 10);
      const baseDebt = Number(account.baseDebt);
      const principalAtAnchor = Number(account.principalAtAnchor);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(anchorDate)) return null;
      if (anchorDate > asOfISO) return null;
      if (!Number.isFinite(baseDebt) || baseDebt < 0) return null;
      return {
        anchorDate,
        baseDebt,
        principalAtAnchor: Number.isFinite(principalAtAnchor) && principalAtAnchor >= 0 ? principalAtAnchor : 0,
      };
    };

    const overdueInterestAccrued = (tx, asOfISO = todayISODate()) => {
      const currency = tx.currency || "BRL";
      const enabled = isInterestBearingType(tx.type) && tx.interestEnabled !== false;
      const rate = enabled ? normalizedPositiveRate(tx.loanRate) : 0;
      const annualEquivalent = Math.pow(1 + rate, 12) - 1;
      const principal = roundByCurrency(sumByStatus(tx, "pendente"), currency);
      const overdue = overdueInstallments(tx, asOfISO)
        .slice()
        .sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")) || a.number - b.number);

      if (!enabled || !overdue.length || principal <= 0) {
        return {
          months: 0,
          rate: enabled ? rate : 0,
          annualEquivalent: enabled ? annualEquivalent : 0,
          interest: 0,
          base: principal,
          since: null,
          factor: 1,
          updatedValue: principal,
          details: [],
          interestType: DEFAULT_INTEREST_TYPE,
          calculationBasis: DEFAULT_INTEREST_BASIS,
          enabled,
          carriedInterest: 0,
        };
      }

      const account = validInterestAccount(tx, asOfISO);
      const since = account?.anchorDate || overdue[0].dueDate;
      const baseDebt = roundByCurrency(account?.baseDebt ?? principal, currency);
      const months = monthsBetween(since, asOfISO);
      const factor = months > 0 ? Math.pow(1 + rate, months) : 1;
      const calculatedDebt = roundByCurrency(baseDebt * factor, currency);
      const updatedValue = roundByCurrency(Math.max(principal, calculatedDebt), currency);
      const interest = roundByCurrency(Math.max(0, updatedValue - principal), currency);
      const carriedInterest = roundByCurrency(Math.max(0, baseDebt - Number(account?.principalAtAnchor ?? principal)), currency);
      const details = [{
        scope: DEFAULT_INTEREST_BASIS,
        since,
        principal,
        baseDebt,
        months,
        factor,
        interest,
        carriedInterest,
        updatedValue,
      }];

      return {
        months,
        rate,
        annualEquivalent,
        interest,
        base: baseDebt,
        since,
        factor,
        updatedValue,
        details,
        interestType: DEFAULT_INTEREST_TYPE,
        calculationBasis: DEFAULT_INTEREST_BASIS,
        enabled: true,
        carriedInterest,
      };
    };

    const financialStatement = (tx, asOfISO = todayISODate()) => {
      const currency = tx.currency || "BRL";
      const prog = progressSummary(tx);
      const overdue = overdueInstallments(tx, asOfISO);
      const interestInfo = overdueInterestAccrued(tx, asOfISO);
      const overduePrincipal = roundByCurrency(overdue.reduce((sum, i) => sum + installmentOpenValue(i), 0), currency);
      const originalValue = roundByCurrency(Number(tx.originalValue ?? tx.totalValue ?? (prog.paidSum + prog.pendingSum)), currency);
      const overdueUpdated = roundByCurrency(overduePrincipal + interestInfo.interest, currency);
      const futurePrincipal = roundByCurrency(Math.max(0, prog.pendingSum - overduePrincipal), currency);
      const openWithInterest = roundByCurrency(prog.pendingSum + interestInfo.interest, currency);
      const interestReceived = roundByCurrency((tx.movements || [])
        .filter(m => m?.type === "receipt" && !m.reversedAt)
        .reduce((sum, m) => sum + Math.max(0, Number(m.interestAmount || 0)), 0), currency);
      const cashReceived = roundByCurrency(prog.paidSum + interestReceived, currency);
      const paidPct = originalValue > 0 ? Math.min(100, Math.round((prog.paidSum / originalValue) * 100)) : 0;
      return {
        ...prog,
        originalValue,
        paidPrincipal: prog.paidSum,
        interestReceived,
        cashReceived,
        openPrincipal: prog.pendingSum,
        overduePrincipal,
        overdueUpdated,
        futurePrincipal,
        interest: interestInfo.interest,
        openWithInterest,
        interestInfo,
        overdue,
        next: nextPendingInstallment(tx),
        paidPct,
      };
    };

    const latestActiveReceipt = (tx) => (Array.isArray(tx.movements) ? tx.movements : [])
      .slice()
      .reverse()
      .find(m => m?.type === "receipt" && !m.reversedAt) || null;

    const minimumReceiptDate = (tx) => {
      const latest = latestActiveReceipt(tx);
      const latestDate = latest ? String(latest.date || "").slice(0, 10) : "";
      const agreementDate = String(tx.agreementDate || "").slice(0, 10);
      return latestDate > agreementDate ? latestDate : agreementDate;
    };

    const previewReceipt = (tx, amountRaw, paidAtISO = todayISODate()) => {
      const amount = Number(amountRaw);
      const currency = tx.currency || "BRL";
      const minDate = minimumReceiptDate(tx);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(paidAtISO)) return { ok: false, reason: "Informe uma data válida." };
      if (paidAtISO > todayISODate()) return { ok: false, reason: "A data do recebimento não pode estar no futuro." };
      if (minDate && paidAtISO < minDate) return { ok: false, reason: `A data não pode ser anterior a ${formatDateBR(minDate)}.` };
      if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: "Informe um valor maior que zero." };

      const statement = financialStatement(tx, paidAtISO);
      const maximum = roundByCurrency(statement.openWithInterest, currency);
      if (maximum <= 0) return { ok: false, reason: "Nada em aberto para receber." };
      if (amount > maximum) return { ok: false, reason: `O valor supera o saldo atualizado de ${formatCurrency(maximum, currency)}.` };

      const applied = roundByCurrency(amount, currency);
      const interestAmount = roundByCurrency(Math.min(applied, statement.interest), currency);
      let principalRemaining = roundByCurrency(applied - interestAmount, currency);
      const allocations = [];
      let overduePrincipalAmount = 0;
      let futurePrincipalAmount = 0;

      const pending = ensureInstallments(tx)
        .filter(i => installmentOpenValue(i) > 0)
        .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "") || a.number - b.number);

      for (const inst of pending) {
        if (principalRemaining <= 0) break;
        const open = installmentOpenValue(inst);
        const part = roundByCurrency(Math.min(open, principalRemaining), currency);
        const overdue = Boolean(inst.dueDate && inst.dueDate < paidAtISO);
        allocations.push({ installmentId: inst.id, installmentNumber: inst.number, amount: part, overdue });
        if (overdue) overduePrincipalAmount = roundByCurrency(overduePrincipalAmount + part, currency);
        else futurePrincipalAmount = roundByCurrency(futurePrincipalAmount + part, currency);
        principalRemaining = roundByCurrency(principalRemaining - part, currency);
      }

      const principalAmount = roundByCurrency(applied - interestAmount - principalRemaining, currency);
      const afterPrincipal = roundByCurrency(Math.max(0, statement.openPrincipal - principalAmount), currency);
      const afterInterest = roundByCurrency(Math.max(0, statement.interest - interestAmount), currency);
      const afterBalance = roundByCurrency(afterPrincipal + afterInterest, currency);
      const nextOpen = statement.next ? installmentOpenValue(statement.next) : 0;
      const suggestedNext = roundByCurrency(Math.min(maximum, statement.interest + nextOpen), currency);
      const suggestedOverdue = roundByCurrency(Math.min(maximum, statement.overdueUpdated), currency);

      return {
        ok: true,
        applied,
        statement,
        maximum,
        interestAmount,
        principalAmount,
        overduePrincipalAmount,
        futurePrincipalAmount,
        allocations,
        afterPrincipal,
        afterInterest,
        afterBalance,
        suggestedNext,
        suggestedOverdue,
        suggestedTotal: maximum,
        minimumDate: minDate,
      };
    };

    const applyReceipt = (tx, payload = {}) => {
      const currency = tx.currency || "BRL";
      const paidAtISO = String(payload.paidAtISO || todayISODate()).slice(0, 10);
      const method = PAYMENT_METHODS.includes(payload.paymentMethod) ? payload.paymentMethod : "outro";
      const preview = previewReceipt(tx, Number(payload.amount), paidAtISO);
      if (!preview.ok) return preview;

      const snapshotBefore = {
        installments: safeClone(ensureInstallments(tx)),
        interestAccount: tx.interestAccount ? safeClone(tx.interestAccount) : null,
      };

      for (const allocation of preview.allocations) {
        const inst = ensureInstallments(tx).find(i => i.id === allocation.installmentId || i.number === allocation.installmentNumber);
        if (!inst) continue;
        inst.paidAmount = roundByCurrency(installmentPaidValue(inst) + allocation.amount, currency);
        if (installmentOpenValue(inst) <= 0) {
          inst.status = "pago";
          inst.paidAt = paidAtISO;
        } else {
          inst.status = "pendente";
          inst.paidAt = null;
        }
      }

      const overdueAfter = overdueInstallments(tx, paidAtISO);
      if (isInterestBearingType(tx.type) && tx.interestEnabled !== false && overdueAfter.length && preview.afterBalance > 0) {
        tx.interestAccount = {
          anchorDate: paidAtISO,
          baseDebt: preview.afterBalance,
          principalAtAnchor: preview.afterPrincipal,
        };
      } else {
        tx.interestAccount = null;
      }

      const movement = addMovement(tx, {
        type: "receipt",
        amount: preview.applied,
        date: paidAtISO,
        allocations: preview.allocations,
        paymentMethod: method,
        paymentReference: String(payload.paymentReference || "").trim() || null,
        interestAmount: preview.interestAmount,
        principalAmount: preview.principalAmount,
        principalBefore: preview.statement.openPrincipal,
        interestBefore: preview.statement.interest,
        balanceBefore: preview.statement.openWithInterest,
        balanceAfter: preview.afterBalance,
        snapshotBefore,
        note: String(payload.note || "").trim() || "Recebimento registrado pela Central de Recebimentos.",
      });

      tx.updatedAt = nowISO();
      return { ...preview, movement };
    };

    const reverseReceipt = (tx, movementId) => {
      const movements = Array.isArray(tx.movements) ? tx.movements : [];
      const movement = movements.find(m => m.id === movementId);
      if (!movement || movement.type !== "receipt") return { ok: false, reason: "Recebimento não encontrado." };
      if (movement.reversedAt) return { ok: false, reason: "Este recebimento já foi estornado." };
      if (!movement.snapshotBefore?.installments) return { ok: false, reason: "Este registro antigo não possui restauração automática." };
      const latest = latestActiveReceipt(tx);
      if (!latest || latest.id !== movement.id) return { ok: false, reason: "Somente o recebimento mais recente pode ser estornado." };

      tx.installments = safeClone(movement.snapshotBefore.installments);
      tx.interestAccount = movement.snapshotBefore.interestAccount ? safeClone(movement.snapshotBefore.interestAccount) : null;
      movement.reversedAt = nowISO();
      const reversal = addMovement(tx, {
        type: "receipt_reversal",
        amount: -Math.abs(Number(movement.amount || 0)),
        date: todayISODate(),
        referenceId: movement.id,
        paymentMethod: movement.paymentMethod,
        interestAmount: -Math.abs(Number(movement.interestAmount || 0)),
        principalAmount: -Math.abs(Number(movement.principalAmount || 0)),
        balanceBefore: Number(movement.balanceAfter || 0),
        balanceAfter: Number(movement.balanceBefore || 0),
        note: `Estorno do recebimento de ${formatDateBR(String(movement.date || "").slice(0, 10))}.`,
      });
      movement.reversalMovementId = reversal.id;
      tx.updatedAt = nowISO();
      return { ok: true, amount: Math.abs(Number(movement.amount || 0)), reversal };
    };

    const applyAbatement = (tx, amountRaw, paidAtISO = todayISODate()) => applyReceipt(tx, {
      amount: Number(amountRaw),
      paidAtISO,
      paymentMethod: "outro",
      note: "Pagamento importado pelo método de abatimento anterior.",
    });

    const movementLabel = (movement) => {
      const labels = {
        payment: "Parcela quitada",
        payment_imported: "Pagamento anterior",
        partial_payment: "Pagamento parcial",
        payment_reversal: "Pagamento desfeito",
        receipt: "Recebimento confirmado",
        receipt_reversal: "Recebimento estornado",
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
      typeLabel,
      paymentMethodLabel,
      loanMonthlyYield,
      overdueInterestAccrued,
      financialStatement,
      minimumReceiptDate,
      previewReceipt,
      applyReceipt,
      reverseReceipt,
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
              <span class="manual-pill">Central de Recebimentos</span>
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
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-pay">✅ Receber</button>
              <button class="manual-chip" type="button" data-action="manualScroll" data-target="m-abate">🧾 Dar baixa</button>
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
                    <li><strong>Registra recebimentos</strong> com data, forma, comprovante e distribuição automática.</li>
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
                <summary id="m-pay"><span class="manual-ico">✅</span> Receber próxima: rápido, mas com conferência</summary>
                <div class="content">
                  <p>No card da transação, clique em <strong>Receber próxima</strong>. A Central de Recebimentos abre com uma sugestão pronta, sem dar baixa automaticamente.</p>
                  <ol class="manual-steps">
                    <li>Confira o <strong>valor</strong> e a <strong>data real</strong> do recebimento.</li>
                    <li>Escolha Pix, transferência, dinheiro, boleto, cartão ou outro.</li>
                    <li>Veja quanto será aplicado em <strong>juros</strong>, <strong>principal vencido</strong> e parcelas seguintes.</li>
                    <li>Confirme somente depois da prévia. O recibo pode abrir em seguida.</li>
                  </ol>
                  <div class="manual-tip"><strong>Segurança:</strong> clicar em “Receber próxima” não quita nada sozinho. A baixa só acontece após a confirmação final.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-abate"><span class="manual-ico">🧾</span> Central de Recebimentos: parcial, atraso ou quitação</summary>
                <div class="content">
                  <p>No detalhe da transação, clique em <strong>Registrar recebimento</strong>. Você verá uma tela completa, em vez da antiga caixinha do navegador.</p>
                  <ol class="manual-steps">
                    <li>Use os atalhos: <strong>parcela mais antiga + juros</strong>, <strong>regularizar atraso</strong> ou <strong>quitar saldo atualizado</strong>.</li>
                    <li>A ordem profissional é automática: juros acumulados → principal vencido → demais parcelas.</li>
                    <li>Informe forma de pagamento, referência do comprovante e uma observação quando necessário.</li>
                    <li>O histórico guarda valor recebido, juros, principal, saldo anterior e saldo posterior.</li>
                    <li>O recebimento mais recente pode ser <strong>estornado</strong>, restaurando parcelas e cálculo anterior.</li>
                  </ol>
                  <div class="manual-tip"><strong>Boa prática:</strong> registre a data em que o dinheiro realmente entrou. O extrato fica auditável e o próximo cálculo parte do saldo correto.</div>
                </div>
              </details>

              <details class="manual-card">
                <summary id="m-loan"><span class="manual-ico">📈</span> Vendas, empréstimos e juros compostos</summary>
                <div class="content">
                  <p>Vendas e empréstimos usam uma regra única quando os juros estão ativados: <strong>juros compostos mensais com a taxa da poupança registrada no acordo</strong>.</p>
                  <ol class="manual-steps">
                    <li><strong>Taxa registrada:</strong> cada acordo guarda a taxa mensal usada no cálculo.</li>
                    <li><strong>Base geral:</strong> quando existe atraso, o cálculo usa todo o saldo principal ainda em aberto, inclusive parcelas futuras.</li>
                    <li><strong>Início:</strong> a capitalização começa no vencimento da primeira parcela que permanece não paga.</li>
                    <li><strong>Meses completos:</strong> os juros são capitalizados mensalmente sobre saldo geral + juros anteriores.</li>
                  </ol>
                  <div class="manual-tip"><strong>Importante:</strong> pagamentos já registrados saem da base. A taxa padrão é ${ratePct}% ao mês e pode ser revisada em cada venda ou empréstimo.</div>
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
                    <li><strong>Use a Central de Recebimentos</strong> tanto para parcelas normais quanto para pagamentos parciais, adiantamentos e quitações.</li>
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
      metricCard("Juros compostos", jurosReceber, "Taxa da poupança • sobre o saldo geral em aberto");
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
        const statement = Domain.financialStatement(tx);
        const balance = isInterestBearingType(tx.type) ? statement.openWithInterest : statement.openPrincipal;
        const conv = Rates.convert(balance, tx.currency, display, rates);
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
        const pct = (normalizedPositiveRate(state.settings.defaultSavingsRate) * 100).toFixed(2).replace(".", ",");
        rateInput.value = pct;
      }
    };

    const renderTransactions = () => {
      const state = App.getState();
      const list = $("#txList");
      const empty = $("#txEmpty");
      const noRes = $("#txNoResults");
      const detailCard = $("#detailCard");

      const q = ($("#q")?.value || "").trim().toLowerCase();
      const fType = $("#fType")?.value || "all";
      const fStatus = $("#fStatus")?.value || "all";
      const fComp = $("#fCompetencia")?.value || "";

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
        const balance = isInterestBearingType(tx.type) ? statement.openWithInterest : statement.openPrincipal;
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
            <button class="btn" type="button" data-action="openPayment" data-id="${tx.id}" ${done ? "disabled" : ""}>Receber próxima</button>
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

      const interestRows = st.interestInfo.since
        ? `
          <div class="finance-row">
            <div><strong>Saldo geral em aberto</strong><div class="hint">capitalização iniciada em ${formatDateBR(st.interestInfo.since)}</div></div>
            <div class="right">${money(st.interestInfo.base)}<div class="hint">base geral</div></div>
            <div class="right">${st.interestInfo.months} mês(es)<div class="hint">completos</div></div>
            <div class="right">${money(st.interest)}<div class="hint">juros • atualizado ${money(st.openWithInterest)}</div></div>
          </div>`
        : `<div class="note">Não existe parcela vencida em aberto. Os juros estão zerados.</div>`;

      const movements = Domain.sortedMovements(tx);
      const reversibleReceiptId = (tx.movements || []).slice().reverse().find(m => m?.type === "receipt" && !m.reversedAt)?.id || null;
      const movementRows = movements.length
        ? movements.map(m => {
          const amount = Number(m.amount || 0);
          const date = String(m.date || "").slice(0, 10);
          const method = m.paymentMethod ? ` • ${escapeHTML(Domain.paymentMethodLabel(m.paymentMethod))}` : "";
          const reference = m.paymentReference ? ` • ref. ${escapeHTML(m.paymentReference)}` : "";
          const breakdown = m.type === "receipt"
            ? `<div class="movement-breakdown">Juros: ${money(Number(m.interestAmount || 0))} • Principal: ${money(Number(m.principalAmount || 0))} • Saldo após: ${money(Number(m.balanceAfter || 0))}</div>`
            : "";
          const reversed = m.reversedAt ? `<div class="movement-breakdown">Estornado em ${formatDateBR(String(m.reversedAt).slice(0, 10))}</div>` : "";
          const reverseButton = m.id === reversibleReceiptId && m.snapshotBefore && !m.reversedAt
            ? `<button class="btn mini danger-soft" type="button" data-action="reverseReceipt" data-id="${m.id}" data-tx-id="${tx.id}">Estornar</button>`
            : "";
          return `<div class="movement">
            <div><div class="movement-title">${escapeHTML(Domain.movementLabel(m))}</div><div class="movement-meta">${formatDateBR(date)}${m.installmentNumber ? ` • parcela ${m.installmentNumber}` : ""}${method}${reference}${m.note ? ` • ${escapeHTML(m.note)}` : ""}</div>${breakdown}${reversed}</div>
            <div class="movement-actions"><div class="movement-value ${amount < 0 ? "negative" : "positive"}">${amount < 0 ? "−" : "+"} ${money(Math.abs(amount))}</div>${reverseButton}</div>
          </div>`;
        }).join("")
        : `<div class="note">Ainda não há recebimentos registrados nesta transação.</div>`;

      const ratePct = (normalizedPositiveRate(tx.loanRate) * 100).toFixed(2).replace(".", ",");
      const interestSection = isInterestBearingType(tx.type) && tx.interestEnabled !== false ? `
        <section class="finance-section">
          <h3>Juros Compostos sobre o Saldo Geral</h3>
          <div class="finance-rule">
            <div class="finance-rule-title">Taxa registrada: ${ratePct}% ao mês • capitalização mensal</div>
            <p>Após o primeiro vencimento não pago, os juros compostos passam a incidir sobre todo o saldo principal ainda em aberto. Valores já recebidos não entram na base.</p>
          </div>
          <div class="finance-table">
            <div class="finance-row finance-head"><div>Base do cálculo</div><div class="right">Saldo geral</div><div class="right">Período</div><div class="right">Juros</div></div>
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
            <div class="finance-card good"><div class="label">Total recebido em caixa</div><div class="amount">${money(st.cashReceived)}</div><div class="caption">Principal ${money(st.paidPrincipal)} • juros ${money(st.interestReceived)}</div></div>
            <div class="finance-card"><div class="label">Principal em aberto</div><div class="amount">${money(st.openPrincipal)}</div><div class="caption">Antes dos juros de atraso</div></div>
            <div class="finance-card alert"><div class="label">Principal vencido</div><div class="amount">${money(st.overduePrincipal)}</div><div class="caption">${st.overdue.length} parcela(s) atrasada(s)</div></div>
            <div class="finance-card interest-highlight"><div class="label">JUROS SOBRE O SALDO GERAL</div><div class="amount">${money(st.interest)}</div><div class="caption">Base: ${money(st.interestInfo.base)} • taxa ${(st.interestInfo.rate * 100).toFixed(2).replace(".", ",")}% • ${st.interestInfo.months} mês(es)</div></div>
            <div class="finance-card alert-strong"><div class="label">PARCELAS VENCIDAS + JUROS</div><div class="amount">${money(st.overdueUpdated)}</div><div class="caption">Referência para regularizar o atraso</div></div>
            <div class="finance-card emphasis"><div class="label">SALDO GERAL ATUALIZADO</div><div class="amount">${money(st.openWithInterest)}</div><div class="caption">Todo o principal em aberto + juros compostos</div></div>
          </div>
          <div class="note"><strong>Próximo vencimento:</strong> ${next ? `${formatDateBR(next.dueDate)} • saldo da parcela ${money(Domain.installmentOpenValue(next))}` : "acordo concluído"}</div>
        </section>

        ${interestSection}

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
          <button class="btn" type="button" data-action="openPayment" data-id="${tx.id}">Registrar recebimento</button>
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
      $("#loanRateField").hidden = !isInterestBearingType(t);
      syncInterestControls();

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

  /* ---------------- Central de Recebimentos ---------------- */
  const PaymentCenter = (() => {
    let currentTxId = null;
    let lastPreview = null;

    const rawMoney = (value, currency) => {
      const decimals = currency === "JPY" ? 0 : 2;
      return Number(value || 0).toFixed(decimals).replace(".", ",");
    };

    const currentTx = () => App.getTransaction(currentTxId);

    const statementForDate = (tx) => {
      const date = $("#paymentDate").value || todayISODate();
      return Domain.financialStatement(tx, date);
    };

    const quickAmounts = (tx) => {
      const st = statementForDate(tx);
      const nextOpen = st.next ? Domain.installmentOpenValue(st.next) : 0;
      return {
        next: roundByCurrency(Math.min(st.openWithInterest, st.interest + nextOpen), tx.currency),
        overdue: roundByCurrency(Math.min(st.openWithInterest, st.overdueUpdated), tx.currency),
        total: roundByCurrency(st.openWithInterest, tx.currency),
      };
    };

    const renderContext = (tx) => {
      const st = statementForDate(tx);
      $("#paymentContext").innerHTML = `
        <div>
          <div class="name">${escapeHTML(tx.counterpartyName || "—")}</div>
          <div class="meta">${escapeHTML(Domain.typeLabel(tx.type))} • ${escapeHTML(tx.item || "—")}</div>
          <div class="meta">Moeda do acordo: ${escapeHTML(tx.currency || "BRL")} • ${tx.installments?.length || 0} parcela(s)</div>
        </div>
        <div class="context-values">
          <div class="context-value"><div class="k">Principal em aberto</div><div class="v">${formatCurrency(st.openPrincipal, tx.currency)}</div></div>
          <div class="context-value"><div class="k">Saldo atualizado</div><div class="v">${formatCurrency(st.openWithInterest, tx.currency)}</div></div>
        </div>`;
    };

    const renderEmptyPreview = (tx, message = "Informe o valor recebido para visualizar a distribuição.") => {
      const st = statementForDate(tx);
      $("#paymentSummary").innerHTML = `
        <div class="payment-summary-card"><div class="k">Principal atual</div><div class="v">${formatCurrency(st.openPrincipal, tx.currency)}</div></div>
        <div class="payment-summary-card interest"><div class="k">Juros acumulados</div><div class="v">${formatCurrency(st.interest, tx.currency)}</div></div>
        <div class="payment-summary-card"><div class="k">Total atualizado</div><div class="v">${formatCurrency(st.openWithInterest, tx.currency)}</div></div>
        <div class="payment-summary-card balance"><div class="k">Saldo após receber</div><div class="v">—</div></div>`;
      $("#paymentAllocationPreview").innerHTML = `<div class="payment-ledger-line muted"><span>Prévia</span><strong>${escapeHTML(message)}</strong></div>`;
      $("#paymentStatusBadge").className = "badge";
      $("#paymentStatusBadge").textContent = "Aguardando valor";
      $("#confirmPaymentBtn").disabled = true;
      lastPreview = null;
    };

    const updatePreview = () => {
      const tx = currentTx();
      if (!tx) return;
      renderContext(tx);
      $("#err-paymentAmount").textContent = "";
      $("#err-paymentDate").textContent = "";

      const amount = parseMoneyInput($("#paymentAmount").value);
      const date = $("#paymentDate").value || todayISODate();
      if (!$("#paymentAmount").value.trim()) {
        renderEmptyPreview(tx);
        return;
      }

      const preview = Domain.previewReceipt(tx, amount, date);
      if (!preview.ok) {
        const target = /data|anterior|futuro/i.test(preview.reason || "") ? "#err-paymentDate" : "#err-paymentAmount";
        $(target).textContent = preview.reason || "Não foi possível calcular.";
        renderEmptyPreview(tx, preview.reason || "Revise os dados informados.");
        return;
      }

      lastPreview = preview;
      $("#paymentStatusBadge").className = "badge good";
      $("#paymentStatusBadge").textContent = "Conferência pronta";
      $("#confirmPaymentBtn").disabled = false;
      $("#paymentSummary").innerHTML = `
        <div class="payment-summary-card"><div class="k">Valor recebido</div><div class="v">${formatCurrency(preview.applied, tx.currency)}</div></div>
        <div class="payment-summary-card interest"><div class="k">Abate juros</div><div class="v">${formatCurrency(preview.interestAmount, tx.currency)}</div></div>
        <div class="payment-summary-card principal"><div class="k">Abate principal</div><div class="v">${formatCurrency(preview.principalAmount, tx.currency)}</div></div>
        <div class="payment-summary-card balance"><div class="k">Saldo após receber</div><div class="v">${formatCurrency(preview.afterBalance, tx.currency)}</div></div>`;

      const rows = [];
      if (preview.interestAmount > 0) rows.push(`<div class="payment-ledger-line"><span>1. Juros compostos acumulados</span><strong>${formatCurrency(preview.interestAmount, tx.currency)}</strong></div>`);
      if (preview.overduePrincipalAmount > 0) rows.push(`<div class="payment-ledger-line"><span>2. Principal de parcelas vencidas</span><strong>${formatCurrency(preview.overduePrincipalAmount, tx.currency)}</strong></div>`);
      if (preview.futurePrincipalAmount > 0) rows.push(`<div class="payment-ledger-line"><span>3. Principal de parcelas ainda não vencidas</span><strong>${formatCurrency(preview.futurePrincipalAmount, tx.currency)}</strong></div>`);
      const allocationText = preview.allocations.length
        ? preview.allocations.map(a => `Parcela ${a.installmentNumber}: ${formatCurrency(a.amount, tx.currency)}`).join(" • ")
        : "Nenhuma parcela terá o principal alterado.";
      rows.push(`<div class="payment-ledger-line muted"><span>Distribuição nas parcelas</span><strong>${escapeHTML(allocationText)}</strong></div>`);
      $("#paymentAllocationPreview").innerHTML = rows.join("");
    };

    const open = (txId, preset = "next") => {
      const tx = App.getTransaction(txId);
      if (!tx) return;
      const st = Domain.financialStatement(tx);
      if (st.openWithInterest <= 0) {
        UI.toast("Nada em aberto para receber.", "warn");
        return;
      }

      currentTxId = txId;
      $("#paymentTxId").value = txId;
      $("#paymentDate").value = todayISODate();
      $("#paymentDate").max = todayISODate();
      $("#paymentDate").min = Domain.minimumReceiptDate(tx) || tx.agreementDate || "";
      $("#paymentMethod").value = "pix";
      $("#paymentReference").value = "";
      $("#paymentNote").value = "";
      $("#paymentOpenReceipt").checked = true;
      $("#err-paymentAmount").textContent = "";
      $("#err-paymentDate").textContent = "";

      renderContext(tx);
      const quick = quickAmounts(tx);
      const suggested = quick[preset] > 0 ? quick[preset] : quick.total;
      $("#paymentAmount").value = rawMoney(suggested, tx.currency);
      updatePreview();
      UI.openOverlay("payment");
      window.setTimeout(() => $("#paymentAmount")?.select(), 50);
    };

    const close = () => {
      UI.closeOverlay("payment");
      currentTxId = null;
      lastPreview = null;
      $("#paymentForm")?.reset();
    };

    $("#paymentAmount").addEventListener("input", updatePreview);
    $("#paymentDate").addEventListener("change", updatePreview);

    document.addEventListener("click", (e) => {
      const quickBtn = e.target.closest("[data-payment-quick]");
      if (!quickBtn || !currentTxId) return;
      const tx = currentTx();
      if (!tx) return;
      const amounts = quickAmounts(tx);
      const amount = amounts[quickBtn.dataset.paymentQuick] || 0;
      if (amount <= 0) {
        UI.toast("Não há valor disponível para esta opção.", "warn");
        return;
      }
      $("#paymentAmount").value = rawMoney(amount, tx.currency);
      updatePreview();
    });

    $("#paymentForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const tx = currentTx();
      if (!tx) return;
      updatePreview();
      if (!lastPreview?.ok) return;

      const result = Domain.applyReceipt(tx, {
        amount: parseMoneyInput($("#paymentAmount").value),
        paidAtISO: $("#paymentDate").value,
        paymentMethod: $("#paymentMethod").value,
        paymentReference: $("#paymentReference").value,
        note: $("#paymentNote").value,
      });
      if (!result.ok) {
        UI.toast(result.reason || "Não foi possível registrar o recebimento.", "bad");
        updatePreview();
        return;
      }

      const openReceipt = $("#paymentOpenReceipt").checked;
      const txId = currentTxId;
      App.upsertTransaction(tx);
      Views.renderDashboard();
      Views.renderTransactions();
      Views.renderDetail(txId);
      close();
      UI.toast(`Recebimento confirmado: ${formatCurrency(result.applied, tx.currency)}.`, "good", { ttl: 7000 });
      if (openReceipt) window.setTimeout(() => Receipt.open(txId, "payment"), 120);
    });

    return { open, close, updatePreview };
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
      const reportDateISO = todayISODate();
      const st = Domain.financialStatement(tx, reportDateISO);
      const generated = new Date().toLocaleString("pt-BR");
      const rateNumber = normalizedPositiveRate(tx.loanRate);
      const rate = (rateNumber * 100).toFixed(2).replace(".", ",");
      const annualRate = ((Math.pow(1 + rateNumber, 12) - 1) * 100).toFixed(2).replace(".", ",");
      const interestActive = isInterestBearingType(tx.type) && tx.interestEnabled !== false;
      const interestTriggered = interestActive && Boolean(st.interestInfo.since);
      const monthYM = ymOf(reportDateISO);

      const installments = (tx.installments || []).map(i => {
        const contract = Domain.installmentContractValue(i);
        const paid = Domain.installmentPaidValue(i);
        const open = Domain.installmentOpenValue(i);
        const overdue = open > 0 && i.dueDate && i.dueDate < reportDateISO;
        const status = open <= 0 ? "PAGA" : overdue ? "ATRASADA" : paid > 0 ? "PARCIAL" : "PENDENTE";
        return { i, contract, paid, open, overdue, status };
      });

      const paidCount = installments.filter(x => x.open <= 0).length;
      const paidCountPct = installments.length ? Math.round((paidCount / installments.length) * 100) : 0;
      const overdueCount = installments.filter(x => x.overdue).length;
      const currentMonth = installments.filter(x => x.open > 0 && ymOf(x.i.dueDate) === monthYM);
      const nextThree = installments
        .filter(x => x.open > 0)
        .sort((a, b) => String(a.i.dueDate || "").localeCompare(String(b.i.dueDate || "")) || a.i.number - b.i.number)
        .slice(0, 3);

      const htmlRows = installments.map(x => `<tr><td>${x.i.number}/${tx.installments.length}<br><span class="muted">${formatDateBR(x.i.dueDate)}</span></td><td class="num">${moneyFor(tx, x.contract)}</td><td class="num">${moneyFor(tx, x.paid)}</td><td class="num">${moneyFor(tx, x.open)}</td><td><strong>${x.status}</strong></td></tr>`).join("");
      const movementRows = Domain.sortedMovements(tx).map(m => {
        const method = m.paymentMethod ? ` • ${escapeHTML(Domain.paymentMethodLabel(m.paymentMethod))}` : "";
        const split = m.type === "receipt" ? `<br><span class="muted">Juros: ${moneyFor(tx, Number(m.interestAmount || 0))} • Principal: ${moneyFor(tx, Number(m.principalAmount || 0))} • Saldo após: ${moneyFor(tx, Number(m.balanceAfter || 0))}</span>` : "";
        const reversed = m.reversedAt ? `<br><span class="muted">ESTORNADO</span>` : "";
        return `<tr><td>${formatDateBR(dateOnly(m.date))}</td><td>${escapeHTML(Domain.movementLabel(m))}${m.installmentNumber ? ` • parcela ${m.installmentNumber}` : ""}${method}${split}${reversed}</td><td class="num">${Number(m.amount || 0) < 0 ? "−" : "+"} ${moneyFor(tx, Math.abs(Number(m.amount || 0)))}</td></tr>`;
      }).join("");
      const interestRows = st.interestInfo.since
        ? `<tr><td>Saldo geral em aberto</td><td>${formatDateBR(st.interestInfo.since)}</td><td class="num">${moneyFor(tx, st.interestInfo.base)}</td><td class="num">${st.interestInfo.months}</td><td class="num">${moneyFor(tx, st.interest)}</td><td class="num"><strong>${moneyFor(tx, st.openWithInterest)}</strong></td></tr>`
        : "";
      const monthRows = currentMonth.map(x => `<tr><td>${x.i.number}/${tx.installments.length}</td><td>${formatDateBR(x.i.dueDate)}</td><td class="num">${moneyFor(tx, x.open)}</td><td>${x.status}</td></tr>`).join("");
      const nextRows = nextThree.map(x => `<tr><td>${x.i.number}/${tx.installments.length}</td><td>${formatDateBR(x.i.dueDate)}</td><td class="num">${moneyFor(tx, x.open)}</td><td>${x.status}</td></tr>`).join("");

      const payer = tx.type === "compra" ? "Você" : tx.counterpartyName;
      const receiver = tx.type === "compra" ? tx.counterpartyName : "Você";
      const nextLabel = st.next ? `${formatDateBR(st.next.dueDate)} • ${moneyFor(tx, Domain.installmentOpenValue(st.next))}` : "acordo concluído";
      const cordialMessage = interestTriggered
        ? `Olá ${tx.counterpartyName}! Tudo bem? 🙂
Estou enviando o demonstrativo atualizado referente a \"${tx.item}\".
Existem ${overdueCount} parcela(s) atrasada(s), com ${moneyFor(tx, st.overduePrincipal)} de principal vencido. Conforme a regra registrada no acordo, os juros compostos são calculados sobre o saldo geral em aberto de ${moneyFor(tx, st.interestInfo.base)}, desde ${formatDateBR(st.interestInfo.since)}.
Juros acumulados até ${formatDateBR(reportDateISO)}: ${moneyFor(tx, st.interest)}.
Saldo geral atualizado do acordo: ${moneyFor(tx, st.openWithInterest)}.
Para evitar nova capitalização no próximo período, por favor me informe uma previsão de pagamento. Obrigado!`
        : `Olá ${tx.counterpartyName}! Tudo bem? 🙂\nEstou enviando o demonstrativo atualizado referente a \"${tx.item}\".\nSaldo principal em aberto: ${moneyFor(tx, st.openPrincipal)}.\nPróximo vencimento: ${nextLabel}.\nPor favor me informe uma previsão de pagamento. Obrigado!`;

      const html = `
        <h3>RELATÓRIO DA TRANSAÇÃO</h3>
        <div class="muted">Gerado em ${escapeHTML(generated)} • Comprar &amp; Venda PRO v${APP_VERSION}</div>
        <div class="grid">
          <div class="box"><div class="k">Parte</div><div class="v">${escapeHTML(tx.counterpartyName)}</div><div class="muted">Documento: ${escapeHTML(tx.counterpartyDoc || "não informado")}</div></div>
          <div class="box"><div class="k">Acordo</div><div class="v">${escapeHTML(Domain.typeLabel(tx.type))} • ${escapeHTML(tx.item)}</div><div class="muted">Data: ${formatDateBR(tx.agreementDate)} • ${tx.paymentMode === "parcelado" ? `Parcelado (${escapeHTML(tx.frequency || "mensal")})` : "À vista"}</div></div>
        </div>

        ${interestActive ? (interestTriggered
          ? `<div class="interest-banner"><div class="interest-banner-title">⚠ JUROS COMPOSTOS SOBRE O SALDO GERAL EM ABERTO</div><div>Taxa mensal da poupança registrada: <strong>${rate}% ao mês</strong> • equivalente a <strong>${annualRate}% ao ano</strong> pela capitalização mensal.</div><div>Base geral: <strong>${moneyFor(tx, st.interestInfo.base)}</strong> • início: <strong>${formatDateBR(st.interestInfo.since)}</strong> • ${st.interestInfo.months} mês(es) completo(s).</div><div class="interest-banner-total">Juros acumulados: ${moneyFor(tx, st.interest)} • Saldo geral atualizado: ${moneyFor(tx, st.openWithInterest)}</div></div>`
          : `<div class="interest-banner"><div class="interest-banner-title">JUROS COMPOSTOS CONFIGURADOS</div><div>Taxa mensal da poupança registrada: <strong>${rate}% ao mês</strong>. A capitalização sobre o saldo geral começará somente quando houver uma parcela vencida e não paga.</div></div>`)
          : ""}

        <h4>Resumo financeiro</h4>
        <div class="finance-summary">
          <div class="box"><div class="k">Valor original</div><div class="v">${moneyFor(tx, st.originalValue)}</div></div>
          <div class="box"><div class="k">Recebido em caixa</div><div class="v">${moneyFor(tx, st.cashReceived)}</div><div class="muted">Principal ${moneyFor(tx, st.paidPrincipal)} • juros ${moneyFor(tx, st.interestReceived)}</div></div>
          <div class="box"><div class="k">Principal em aberto</div><div class="v">${moneyFor(tx, st.openPrincipal)}</div></div>
          <div class="box"><div class="k">Principal vencido</div><div class="v">${moneyFor(tx, st.overduePrincipal)}</div></div>
          <div class="box interest-box"><div class="k">JUROS SOBRE O SALDO GERAL</div><div class="v">${moneyFor(tx, st.interest)}</div></div>
          <div class="box overdue-box"><div class="k">PARCELAS VENCIDAS + JUROS</div><div class="v">${moneyFor(tx, st.overdueUpdated)}</div></div>
          <div class="box strong"><div class="k">SALDO GERAL ATUALIZADO</div><div class="v">${moneyFor(tx, st.openWithInterest)}</div></div>
        </div>
        <div class="listline"><strong>Parcelas pagas:</strong> ${paidCount}/${installments.length} (${paidCountPct}%) • <strong>Atrasadas:</strong> ${overdueCount} • <strong>Próxima pendente:</strong> ${nextLabel}</div>

        ${interestActive ? `<h4>Memória de cálculo dos juros compostos da poupança</h4><div class="listline">A partir do primeiro vencimento não pago, o cálculo usa <strong>todo o saldo principal em aberto</strong>, pela fórmula <strong>saldo geral × (1 + taxa da poupança)<sup>meses completos</sup></strong>. Pagamentos já registrados são retirados da base; os juros anteriores entram na capitalização seguinte.</div>${interestRows ? `<table class="statement-table interest-table"><thead><tr><th>Base do cálculo</th><th>Início</th><th class="num">Saldo geral</th><th class="num">Meses</th><th class="num">Juros</th><th class="num">Atualizado</th></tr></thead><tbody>${interestRows}</tbody></table>` : `<div class="listline">Não existe parcela vencida em aberto até a data deste relatório.</div>`}` : ""}

        <h4>Mensagem cordial sugerida</h4>
        <div class="message-preview">${escapeHTML(cordialMessage).replace(/\n/g, "<br>")}</div>

        <h4>Parcelas deste mês</h4>
        ${monthRows ? `<table class="statement-table"><thead><tr><th>Parcela</th><th>Vencimento</th><th class="num">Saldo</th><th>Situação</th></tr></thead><tbody>${monthRows}</tbody></table>` : `<div class="listline">Nenhuma parcela pendente neste mês.</div>`}

        <h4>Próximas 3 pendentes</h4>
        ${nextRows ? `<table class="statement-table"><thead><tr><th>Parcela</th><th>Vencimento</th><th class="num">Saldo</th><th>Situação</th></tr></thead><tbody>${nextRows}</tbody></table>` : `<div class="listline">Não há parcelas pendentes.</div>`}

        <h4>Todas as parcelas</h4>
        <table class="statement-table"><thead><tr><th>Parcela</th><th class="num">Valor</th><th class="num">Recebido</th><th class="num">Saldo</th><th>Situação</th></tr></thead><tbody>${htmlRows}</tbody></table>
        <h4>Histórico financeiro</h4>
        ${movementRows ? `<table class="statement-table"><thead><tr><th>Data</th><th>Movimento</th><th class="num">Valor</th></tr></thead><tbody>${movementRows}</tbody></table>` : `<div class="listline">Nenhum recebimento registrado.</div>`}
        ${tx.notes ? `<h4>Observações</h4><div class="listline">${escapeHTML(tx.notes)}</div>` : ""}
        <div class="sign"><div><div class="k">Pagador</div><div class="v">${escapeHTML(payer)}</div><div class="k sign-space">Recebedor</div><div class="v">${escapeHTML(receiver)}</div>${sig ? `<div class="k sign-space">Assinatura</div><div class="v">${escapeHTML(sig)}</div>` : ""}</div><div class="muted">A cobrança de juros pressupõe que a taxa e a capitalização façam parte do acordo entre as partes. Confira os valores antes do envio.</div></div>`;

      const lines = [
        "RELATÓRIO DA TRANSAÇÃO",
        `Parte: ${tx.counterpartyName} (Documento: ${tx.counterpartyDoc || "—"})`,
        `Tipo: ${Domain.typeLabel(tx.type)}`,
        `Item/Bem: ${tx.item}`,
        `Data do acordo: ${formatDateBR(tx.agreementDate)}`,
        `Forma: ${tx.paymentMode === "parcelado" ? `Parcelado (${tx.frequency || "mensal"})` : "À vista"}`,
        "",
        "RESUMO",
        `Valor original: ${moneyFor(tx, st.originalValue)}`,
        `Recebido em caixa: ${moneyFor(tx, st.cashReceived)}`,
        `Principal recebido: ${moneyFor(tx, st.paidPrincipal)}`,
        `Juros recebidos: ${moneyFor(tx, st.interestReceived)}`,
        `Principal em aberto: ${moneyFor(tx, st.openPrincipal)}`,
        `Parcelas pagas: ${paidCount}/${installments.length} (${paidCountPct}%)`,
        `Atrasadas: ${overdueCount}`,
      ];

      if (interestTriggered) {
        lines.push(
          "",
          "⚠️ JUROS COMPOSTOS SOBRE O SALDO GERAL",
          `Taxa mensal da poupança: ${rate}% ao mês`,
          `Taxa efetiva anual equivalente: ${annualRate}% ao ano`,
          `Principal vencido pelas parcelas: ${moneyFor(tx, st.overduePrincipal)}`,
          `Base geral usada nos juros: ${moneyFor(tx, st.interestInfo.base)}`,
          `Início da capitalização: ${formatDateBR(st.interestInfo.since)}`,
          `Períodos completos: ${st.interestInfo.months} mês(es)`,
          `Juros compostos acumulados: ${moneyFor(tx, st.interest)}`,
          `PARCELAS VENCIDAS + JUROS: ${moneyFor(tx, st.overdueUpdated)}`,
          `SALDO GERAL ATUALIZADO: ${moneyFor(tx, st.openWithInterest)}`,
          "Regra: desde o primeiro vencimento não pago, os juros compostos mensais incidem sobre todo o saldo principal ainda em aberto. Pagamentos registrados saem da base.",
          "",
          "MEMÓRIA DE CÁLCULO DOS JUROS"
        );
        if (!st.interestInfo.since) lines.push("Não existe parcela vencida em aberto até esta data.");
        else lines.push(`Saldo geral ${moneyFor(tx, st.interestInfo.base)} - início ${formatDateBR(st.interestInfo.since)} - ${st.interestInfo.months} mês(es) - juros ${moneyFor(tx, st.interest)} - atualizado ${moneyFor(tx, st.openWithInterest)}`);
      } else if (interestActive) {
        lines.push(
          "",
          "JUROS COMPOSTOS CONFIGURADOS",
          `Taxa mensal da poupança: ${rate}% ao mês`,
          "A capitalização sobre o saldo geral ainda não começou porque não existe parcela vencida em aberto."
        );
      }

      lines.push("", "MENSAGEM CORDIAL SUGERIDA", cordialMessage, "", "PARCELAS DESTE MÊS");
      if (!currentMonth.length) lines.push("Nenhuma parcela pendente neste mês.");
      currentMonth.forEach(x => lines.push(`${x.i.number}/${installments.length} - ${formatDateBR(x.i.dueDate)} - ${moneyFor(tx, x.open)} - ${x.status}`));

      lines.push("", "PRÓXIMAS 3 PENDENTES");
      if (!nextThree.length) lines.push("Não há parcelas pendentes.");
      nextThree.forEach(x => lines.push(`${x.i.number}/${installments.length} - ${formatDateBR(x.i.dueDate)} - ${moneyFor(tx, x.open)} - ${x.status}`));

      const recentReceipts = (tx.movements || []).filter(m => m?.type === "receipt" && !m.reversedAt).slice().reverse().slice(0, 5);
      lines.push("", "ÚLTIMOS RECEBIMENTOS");
      if (!recentReceipts.length) lines.push("Nenhum recebimento confirmado.");
      recentReceipts.forEach(m => lines.push(`${formatDateBR(String(m.date || "").slice(0, 10))} - ${moneyFor(tx, Number(m.amount || 0))} - ${Domain.paymentMethodLabel(m.paymentMethod)} - juros ${moneyFor(tx, Number(m.interestAmount || 0))} - principal ${moneyFor(tx, Number(m.principalAmount || 0))} - saldo após ${moneyFor(tx, Number(m.balanceAfter || 0))}`));

      lines.push("", `Pagador: ${payer}`, `Recebedor: ${receiver}`, `Gerado em: ${generated}`);
      if (tx.notes) lines.push("", `Observações: ${tx.notes}`);
      if (sig) lines.push(`Assinatura: ${sig}`);
      lines.push("", "Observação: a cobrança de juros pressupõe que a taxa e a capitalização façam parte do acordo entre as partes.");
      return { html, text: lines.join("\n") };
    };

    const receiptDocument = (tx, mode, sig) => {
      let value = Domain.financialStatement(tx).originalValue;
      let title = "RECIBO DO ACORDO";
      let detail = `Referente a ${Domain.typeLabel(tx.type).toLowerCase()}: ${tx.item}.`;
      let extraHtml = "";
      let extraText = "";

      if (mode === "payment") {
        const movement = (tx.movements || []).slice().reverse().find(m => m?.type === "receipt" && !m.reversedAt);
        if (movement) {
          value = Number(movement.amount || 0);
          title = "RECIBO DE RECEBIMENTO";
          const receiptDate = String(movement.date || "").slice(0, 10);
          const method = Domain.paymentMethodLabel(movement.paymentMethod);
          detail = `Recebimento referente a ${Domain.typeLabel(tx.type).toLowerCase()}: ${tx.item}. Data: ${formatDateBR(receiptDate)}. Forma: ${method}.`;
          extraHtml = `<div class="finance-summary"><div class="box"><div class="k">Aplicado em juros</div><div class="v">${moneyFor(tx, Number(movement.interestAmount || 0))}</div></div><div class="box"><div class="k">Aplicado no principal</div><div class="v">${moneyFor(tx, Number(movement.principalAmount || 0))}</div></div><div class="box strong"><div class="k">Saldo após o recebimento</div><div class="v">${moneyFor(tx, Number(movement.balanceAfter || 0))}</div></div></div>${movement.paymentReference ? `<div class="listline"><strong>Referência:</strong> ${escapeHTML(movement.paymentReference)}</div>` : ""}${movement.note ? `<div class="listline"><strong>Observação:</strong> ${escapeHTML(movement.note)}</div>` : ""}`;
          extraText = `
Aplicado em juros: ${moneyFor(tx, Number(movement.interestAmount || 0))}
Aplicado no principal: ${moneyFor(tx, Number(movement.principalAmount || 0))}
Saldo após o recebimento: ${moneyFor(tx, Number(movement.balanceAfter || 0))}${movement.paymentReference ? `
Referência: ${movement.paymentReference}` : ""}${movement.note ? `
Observação: ${movement.note}` : ""}`;
        } else {
          title = "RECIBO DE RECEBIMENTO";
          value = 0;
          detail = "Nenhum recebimento confirmado foi encontrado.";
        }
      } else if (mode === "installment") {
        const n = parseInt($("#receiptInstallment").value || "1", 10);
        const inst = (tx.installments || []).find(i => i.number === n) || tx.installments?.[0];
        value = inst ? Domain.installmentPaidValue(inst) || Domain.installmentContractValue(inst) : value;
        title = "RECIBO DE PARCELA";
        detail = inst ? `Parcela ${inst.number}/${tx.installments.length}, vencimento em ${formatDateBR(inst.dueDate)}.` : detail;
      }

      const html = `<h3>${title}</h3><div class="listline">Recebi de <strong>${escapeHTML(tx.counterpartyName)}</strong> o valor de <strong>${moneyFor(tx, value)}</strong>.<br>${escapeHTML(detail)}</div>${extraHtml}<div class="grid"><div class="box"><div class="k">Data do acordo</div><div class="v">${formatDateBR(tx.agreementDate)}</div></div><div class="box"><div class="k">Documento</div><div class="v">${escapeHTML(tx.counterpartyDoc || "não informado")}</div></div></div><div class="sign"><div><div class="k">Assinatura</div><div class="v">${escapeHTML(sig || "—")}</div></div><div class="muted">Gerado em ${new Date().toLocaleString("pt-BR")}</div></div>`;
      const text = `${title}
Recebi de ${tx.counterpartyName} o valor de ${moneyFor(tx, value)}.
${detail}${extraText}
Data do acordo: ${formatDateBR(tx.agreementDate)}${sig ? `
Assinatura: ${sig}` : ""}`;
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
  function syncInterestControls() {
    const enabled = $("#interestEnabled")?.checked !== false;
    const box = $("#interestRateInputBox");
    const input = $("#loanRate");
    if (box) box.hidden = !enabled;
    if (input) input.disabled = !enabled;
  }

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
    const defaultRate = normalizedPositiveRate(App.getState().settings.defaultSavingsRate);
    $("#loanRate").value = String((defaultRate * 100).toFixed(2)).replace(".", ",");
    $("#interestEnabled").checked = true;
    syncInterestControls();
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
    $("#loanRate").value = isInterestBearingType(tx.type)
      ? String((normalizedPositiveRate(tx.loanRate) * 100).toFixed(2)).replace(".", ",")
      : "0,67";
    $("#interestEnabled").checked = isInterestBearingType(tx.type) ? tx.interestEnabled !== false : false;


    const pm = tx.paymentMode || "avista";
    $$("input[name='paymentMode']").forEach(r => r.checked = (r.value === pm));
    $("#installmentsBox").hidden = pm !== "parcelado";
    $("#loanRateField").hidden = !isInterestBearingType(tx.type);
    syncInterestControls();

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
    $("#interestEnabled").checked = true;
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

    const interestEnabled = isInterestBearingType(type) ? $("#interestEnabled").checked : false;
    const loanRatePct = parseMoneyInput($("#loanRate").value);
    const loanRate = (isInterestBearingType(type) && interestEnabled)
      ? (Number.isFinite(loanRatePct) && loanRatePct > 0 ? (loanRatePct / 100) : DEFAULT_LOAN_RATE)
      : null;

    const interestType = (isInterestBearingType(type) && interestEnabled) ? DEFAULT_INTEREST_TYPE : null;

    return {
      id: existing?.id || safeUUID(),
      type, item, counterpartyName, counterpartyDoc,
      currency, totalValue, agreementDate,
      paymentMode,
      frequency: paymentMode === "parcelado" ? frequency : null,
      notes,
      loanRate,
      interestEnabled,
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
      if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
        UI.toast("Informe uma taxa mensal válida.", "bad");
        Views.renderSettingsMeta();
        return;
      }
      App.setDefaultSavingsRate(pct / 100);
      UI.toast("Taxa da poupança para juros compostos atualizada.", "good");
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
      $("#loanRateField").hidden = !isInterestBearingType(t);
      if (isInterestBearingType(t) && !$("#loanRate").value.trim()) {
        const rate = normalizedPositiveRate(App.getState().settings.defaultSavingsRate);
        $("#loanRate").value = String((rate * 100).toFixed(2)).replace(".", ",");
      }
      if (isInterestBearingType(t)) $("#interestEnabled").checked = true;
      syncInterestControls();
    });

    $("#interestEnabled").addEventListener("change", syncInterestControls);

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
        interestEnabled: draft.interestEnabled,
        interestType: draft.interestType,
        interestCalculationBasis: isInterestBearingType(draft.type) && draft.interestEnabled !== false ? DEFAULT_INTEREST_BASIS : null,
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
        loanRate: isInterestBearingType(draft.type) && draft.interestEnabled !== false ? normalizedPositiveRate(draft.loanRate) : null,
        interestEnabled: isInterestBearingType(draft.type) ? draft.interestEnabled !== false : false,
        interestType: isInterestBearingType(draft.type) && draft.interestEnabled !== false ? DEFAULT_INTEREST_TYPE : null,
        interestCalculationBasis: isInterestBearingType(draft.type) && draft.interestEnabled !== false ? DEFAULT_INTEREST_BASIS : null,
        interestAccount: existing?.interestAccount ? safeClone(existing.interestAccount) : null,
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

      if (action === "openPayment" && id) {
        PaymentCenter.open(id, "next");
        return;
      }

      if (action === "reverseReceipt" && id) {
        const txId = el.dataset.txId;
        const tx = App.getTransaction(txId);
        const movement = tx?.movements?.find(m => m.id === id);
        if (!tx || !movement) return;
        UI.toast(`Confirmar estorno de ${formatCurrency(Math.abs(Number(movement.amount || 0)), tx.currency)}? O saldo e as parcelas voltarão ao estado anterior.`, "warn", {
          ttl: 12000,
          action: {
            label: "Confirmar estorno",
            onClick: () => {
              const current = App.getTransaction(txId);
              if (!current) return;
              const result = Domain.reverseReceipt(current, id);
              if (!result.ok) {
                UI.toast(result.reason || "Não foi possível estornar.", "bad");
                return;
              }
              App.upsertTransaction(current);
              Views.renderDashboard();
              Views.renderTransactions();
              Views.renderDetail(txId);
              UI.toast(`Recebimento estornado: ${formatCurrency(result.amount, current.currency)}.`, "warn");
            }
          }
        });
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
        interestEnabled: true,
        interestType: DEFAULT_INTEREST_TYPE,
        interestCalculationBasis: DEFAULT_INTEREST_BASIS,
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