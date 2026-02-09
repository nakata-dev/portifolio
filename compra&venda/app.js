(() => {
  "use strict";

  const SCHEMA_VERSION = 2;
  const STORAGE_KEY = "cvpro:data:v2";
  const RATES_TTL_MS = 12 * 60 * 60 * 1000;

  const CURRENCIES = ["BRL", "USD", "JPY"];
  const SIGNS = { BRL: "R$", USD: "US$", JPY: "¥" };

  const DEFAULT_LOAN_RATE = 0.0067; // 0,67% ao mês (0,5% + TR estimada)

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
    // suporta "1.234,56" e "1234.56"
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

  /* ---------------- Storage ---------------- */
  const Storage = (() => {
    const defaultData = () => ({
      schemaVersion: SCHEMA_VERSION,
      settings: { displayCurrency: "BRL", lastRates: null },
      transactions: [],
    });

    // Migra dados v1 -> v2 (adiciona tipo "emprestimo" e loanRate quando necessário)
    const migrate = (data) => {
      const v = Number(data?.schemaVersion ?? 0);
      if (!v) return defaultData();

      // se já é v2
      if (v === SCHEMA_VERSION) return data;

      let d = structuredClone(data);

      // v1 -> v2
      if (v === 1) {
        d.schemaVersion = 2;
        d.settings = d.settings ?? defaultData().settings;
        d.transactions = Array.isArray(d.transactions) ? d.transactions : [];

        d.transactions = d.transactions.map(tx => {
          const t = structuredClone(tx);
          // mantém compra/venda, e se não existir, força "venda"
          if (!t.type) t.type = "venda";
          // adiciona loanRate opcional
          if (t.type === "emprestimo" && (t.loanRate == null)) t.loanRate = DEFAULT_LOAN_RATE;
          return t;
        });

        return d;
      }

      // fallback seguro
      return defaultData();
    };

    const load = () => {
      try {
        // tenta v2
        const raw2 = localStorage.getItem(STORAGE_KEY);
        if (raw2) return migrate(JSON.parse(raw2));

        // tenta antigo v1 para não perder dados
        const raw1 = localStorage.getItem("cvpro:data:v1");
        if (raw1) {
          const migrated = migrate(JSON.parse(raw1));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }

        return defaultData();
      } catch {
        return defaultData();
      }
    };

    const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const clear = () => localStorage.removeItem(STORAGE_KEY);

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

  /* ---------------- UI (CORRIGIDO: overlays não travam e X sempre fecha) ---------------- */
  const UI = (() => {
    const wrap = $("#toastWrap");

    const overlayMap = () => ({
      menu: $("#menuOverlay"),
      receipt: $("#receiptOverlay"),
    });

    let lastFocus = null;

    const lockScroll = () => {
      // evita “travada” por scroll do body no mobile
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

      // garante topo no body do painel (evita sensação de travamento)
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

      // só libera scroll quando nenhum overlay estiver aberto
      if (!anyOverlayOpen()) unlockScroll();

      if (kind === "menu") {
        $("#menuBtn")?.setAttribute("aria-expanded", "false");
      }
      if (kind === "receipt") document.body.classList.remove("print-receipt");

      const back = lastFocus || $("#menuBtn");
      if (back && back.focus) back.focus();
      lastFocus = null;
    };

    // ESC sempre fecha o que estiver aberto
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const map = overlayMap();
      if (map.receipt && !map.receipt.hidden) closeOverlay("receipt");
      else if (map.menu && !map.menu.hidden) closeOverlay("menu");
    });

    // Clique no scrim (fundo) ou em qualquer elemento com [data-close]
    document.addEventListener("click", (e) => {
      const closeEl = e.target.closest("[data-close]");
      if (closeEl) {
        const kind = closeEl.getAttribute("data-close");
        if (kind === "menu" || kind === "receipt") closeOverlay(kind);
        return;
      }

      // fallback: se clicou diretamente no scrim do overlay (sem data-close no HTML)
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

    return { getState, setDisplayCurrency, upsertTransaction, deleteTransaction, getTransaction, replaceAll, clearAll };
  })();

  /* ---------------- Domain ---------------- */
  const Domain = (() => {
    const isPaid = (inst) => inst?.status === "pago";
    const isComplete = (tx) => Array.isArray(tx.installments) && tx.installments.length > 0 && tx.installments.every(isPaid);

    const nextPendingInstallment = (tx) => (tx.installments || []).find(i => i.status === "pendente") || null;

    const lastPaidInstallment = (tx) => {
      const paid = (tx.installments || []).filter(i => i.status === "pago");
      if (!paid.length) return null;
      paid.sort((a, b) => (a.paidAt || "").localeCompare(b.paidAt || ""));
      return paid[paid.length - 1] || null;
    };

    const installmentsPendingInMonth = (tx, ym) => (tx.installments || []).filter(i => i.status === "pendente" && ymOf(i.dueDate) === ym);

    const sumByStatus = (tx, status) => (tx.installments || [])
      .filter(i => i.status === status)
      .reduce((acc, i) => acc + Number(i.value || 0), 0);

    const overdueInstallments = (tx, todayIso = todayISODate()) => (tx.installments || [])
      .filter(i => i.status === "pendente" && i.dueDate && i.dueDate < todayIso);

    const progressSummary = (tx) => {
      const totalCount = (tx.installments || []).length || 0;
      const paidCount = (tx.installments || []).filter(i => i.status === "pago").length;
      const pendingCount = totalCount - paidCount;
      const paidSum = sumByStatus(tx, "pago");
      const pendingSum = sumByStatus(tx, "pendente");
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
        if (draft.loanRate != null && !Number.isFinite(draft.loanRate)) errors.loanRate = "Taxa inválida.";
        if (draft.loanRate != null && draft.loanRate < 0) errors.loanRate = "Taxa não pode ser negativa.";
      }

      return errors;
    };

    const generateInstallments = ({ paymentMode, totalValue, agreementDate, frequency, numInstallments, dueDay, currency, installmentValue }) => {
      const total = Number(totalValue);

      if (paymentMode === "avista") {
        return [{
          number: 1,
          dueDate: agreementDate,
          value: roundByCurrency(total, currency),
          status: "pendente",
          paidAt: null,
        }];
      }

      const firstDue = computeFirstDue(agreementDate, dueDay);

      // Modo: valor por parcela (cliente define quanto quer pagar)
      if (Number.isFinite(installmentValue) && installmentValue > 0) {
        const per = roundByCurrency(installmentValue, currency);
        const count = clamp(Math.ceil(total / per), 2, 9999);
        const dates = nextDueDates(firstDue, frequency, count, dueDay);

        const out = [];
        let remaining = roundByCurrency(total, currency);

        for (let i = 0; i < count; i++) {
          const v = (i === count - 1) ? remaining : Math.min(per, remaining);
          const vv = roundByCurrency(v, currency);
          out.push({ number: i + 1, dueDate: dates[i], value: vv, status: "pendente", paidAt: null });
          remaining = roundByCurrency(remaining - vv, currency);
        }

        // se por algum arredondamento sobrou centavos, ajusta a última
        if (remaining !== 0 && out.length) out[out.length - 1].value = roundByCurrency(out[out.length - 1].value + remaining, currency);

        return out;
      }

      // Modo: número de parcelas
      const count = clamp(Number(numInstallments), 2, 9999);
      const dates = nextDueDates(firstDue, frequency, count, dueDay);

      const base = total / count;
      const raw = Array.from({ length: count }, (_, idx) => ({
        number: idx + 1,
        dueDate: dates[idx],
        value: roundByCurrency(base, currency),
        status: "pendente",
        paidAt: null,
      }));

      const sum = raw.reduce((a, i) => a + i.value, 0);
      const diff = roundByCurrency(total - sum, currency);
      if (diff !== 0) raw[raw.length - 1].value = roundByCurrency(raw[raw.length - 1].value + diff, currency);

      return raw;
    };

    const payNext = (tx) => {
      const next = nextPendingInstallment(tx);
      if (!next) return { ok: false, tx, paidNumber: null };
      const idx = tx.installments.findIndex(i => i.number === next.number);
      if (idx < 0) return { ok: false, tx, paidNumber: null };
      tx.installments[idx].status = "pago";
      tx.installments[idx].paidAt = todayISODate();
      tx.updatedAt = nowISO();
      return { ok: true, tx, paidNumber: next.number };
    };

    const undoPay = (tx, installmentNumber) => {
      const idx = tx.installments.findIndex(i => i.number === installmentNumber);
      if (idx < 0) return tx;
      tx.installments[idx].status = "pendente";
      tx.installments[idx].paidAt = null;
      tx.updatedAt = nowISO();
      return tx;
    };

    const typeLabel = (t) => t === "compra" ? "Compra" : t === "venda" ? "Venda" : "Empréstimo";

    const loanMonthlyYield = (tx) => {
      if (tx.type !== "emprestimo") return 0;
      const pending = sumByStatus(tx, "pendente");
      const rate = Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE;
      return pending * rate;
    };

    return {
      isComplete,
      nextPendingInstallment,
      lastPaidInstallment,
      installmentsPendingInMonth,
      sumByStatus,
      overdueInstallments,
      progressSummary,
      validateTx,
      generateInstallments,
      payNext,
      undoPay,
      typeLabel,
      loanMonthlyYield,
    };
  })();

  /* ---------------- Views / Routing ---------------- */
  const Views = (() => {
    const main = $("#main");

    let pendingOpenDetailId = null; // ✅ conserto do “Abrir” do dashboard

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

      // Receber: venda e empréstimo
      const sumReceber = () => {
        const txs = state.transactions.filter(t => t.type === "venda" || t.type === "emprestimo");
        return txs.reduce((acc, tx) => {
          const pending = Domain.sumByStatus(tx, "pendente");
          const conv = Rates.convert(pending, tx.currency, display, rates);
          return acc + Number(conv.value || 0);
        }, 0);
      };

      // Pagar: compra
      const sumPagar = () => {
        const txs = state.transactions.filter(t => t.type === "compra");
        return txs.reduce((acc, tx) => {
          const pending = Domain.sumByStatus(tx, "pendente");
          const conv = Rates.convert(pending, tx.currency, display, rates);
          return acc + Number(conv.value || 0);
        }, 0);
      };

      const countPendingMonth = () => {
        let qtd = 0;
        let total = 0;
        for (const tx of state.transactions) {
          const pending = Domain.installmentsPendingInMonth(tx, monthYM);
          if (pending.length) {
            qtd += pending.length;
            const sumTx = pending.reduce((a, i) => a + Number(i.value || 0), 0);
            const conv = Rates.convert(sumTx, tx.currency, display, rates);
            total += Number(conv.value || 0);
          }
        }
        return { qtd, total };
      };

      const totalReceber = sumReceber();
      const totalPagar = sumPagar();
      const pendMonth = countPendingMonth();
      const concluidos = state.transactions.filter(Domain.isComplete).length;

      const dash = $("#dashCards");
      dash.innerHTML = "";

      const metricCard = (title, value, sub) => {
        const c = document.createElement("div");
        c.className = "card metric";
        c.innerHTML = `
          <div class="k">${escapeHTML(title)}</div>
          <div class="v">${formatCurrency(value, display)}</div>
          <div class="s">${escapeHTML(sub)}</div>
        `;
        dash.appendChild(c);
      };

      metricCard("Total a Receber", totalReceber, "Pendentes de vendas e empréstimos");
      metricCard("Total a Pagar", totalPagar, "Pendentes de compras");
      metricCard("Pendentes do mês", pendMonth.total, `${pendMonth.qtd} parcela(s) em ${monthYM || "—"}`);
      metricCard("Concluídos", concluidos, "Transações totalmente pagas");

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
        const pending = Domain.sumByStatus(tx, "pendente");
        const conv = Rates.convert(pending, tx.currency, display, rates);

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

      const done = Domain.isComplete(tx);
      const next = Domain.nextPendingInstallment(tx);
      const overdue = Domain.overdueInstallments(tx, todayISODate());
      const prog = Domain.progressSummary(tx);

      const convTotal = Rates.convert(tx.totalValue, tx.currency, display, rates);
      const convPaid = Rates.convert(prog.paidSum, tx.currency, display, rates);
      const convOpen = Rates.convert(prog.pendingSum, tx.currency, display, rates);
      const convNext = next ? Rates.convert(next.value, tx.currency, display, rates) : null;
      const convOverdue = overdue.length
        ? Rates.convert(overdue.reduce((a, i) => a + Number(i.value || 0), 0), tx.currency, display, rates)
        : null;

      const conversionNote = (() => {
        if (tx.currency === display) return "";
        const line = Rates.rateLine(tx.currency, display, rates);
        const when = rates?.updatedAt ? new Date(rates.updatedAt).toLocaleString("pt-BR") : null;
        if (convTotal.ok && line && when) return `<div class="hint">Conversão: ${escapeHTML(line)} • Cotação: ${escapeHTML(when)}</div>`;
        return `<div class="hint">Conversão: <span title="${escapeHTML(convTotal.note || "Taxa indisponível")}">Taxa indisponível ⚠</span> (mostrando valores na moeda original quando necessário)</div>`;
      })();

      const pct = prog.totalCount ? Math.round((prog.paidCount / prog.totalCount) * 100) : 0;

      const buyerLabel = (tx.type === "compra") ? "Vendedor" : "Cliente/Devedor";
      const buyerName = tx.counterpartyName || "—";
      const buyerDoc = tx.counterpartyDoc ? tx.counterpartyDoc : "—";

      const loanYield = (tx.type === "emprestimo") ? Domain.loanMonthlyYield(tx) : 0;
      const convYield = (tx.type === "emprestimo")
        ? Rates.convert(loanYield, tx.currency, display, rates)
        : null;

      const loanBlock = (tx.type !== "emprestimo") ? "" : `
        <div class="box">
          <div class="k">Rendimento mensal estimado</div>
          <div class="v">${formatCurrency(convYield && convYield.ok ? convYield.value : loanYield, (convYield && convYield.ok) ? display : tx.currency)} ${(convYield && convYield.ok) ? "" : "⚠"}</div>
          <div class="hint">Taxa: ${((Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE) * 100).toFixed(2).replace(".", ",")}% ao mês (estimativa)</div>
        </div>
      `;

      const instRows = (tx.installments || []).map(inst => {
        const isNext = next && inst.number === next.number && inst.status === "pendente";
        const isOver = inst.status === "pendente" && inst.dueDate && inst.dueDate < todayISODate();
        const pillClass = inst.status === "pago" ? "good" : isOver ? "bad" : isNext ? "next" : "warn";
        const conv = Rates.convert(inst.value, tx.currency, display, rates);

        const payInfo = inst.status === "pago"
          ? `Pago em ${formatDateBR(inst.paidAt)}`
          : isOver ? `Atrasada (vencia ${formatDateBR(inst.dueDate)})` : `Vence em ${formatDateBR(inst.dueDate)}`;

        return `
          <div class="tr">
            <div>
              <div><strong>${inst.number}/${tx.installments.length}</strong> • ${formatDateBR(inst.dueDate)}</div>
              <div class="hint">${payInfo}</div>
            </div>
            <div class="right">
              ${formatCurrency(conv.ok ? conv.value : inst.value, conv.ok ? display : tx.currency)}
              ${conv.ok ? "" : `<span title="${escapeHTML(conv.note || "Taxa indisponível")}" aria-label="Taxa indisponível"> ⚠</span>`}
            </div>
            <div class="right">
              <span class="pill ${pillClass}">${inst.status === "pago" ? "pago" : isOver ? "atrasada" : "pendente"}</span>
            </div>
          </div>
        `;
      }).join("");

      box.innerHTML = `
        <h3>Resumo transparente (${escapeHTML(buyerLabel)})</h3>
        <div class="progress" aria-label="Resumo da outra parte">
          <div class="progress-top">
            <div>
              <div class="progress-title">${escapeHTML(buyerName)}</div>
              <div class="progress-sub">Documento: ${escapeHTML(buyerDoc)}</div>
            </div>
            <div>
              <div class="progress-title">${prog.paidCount}/${prog.totalCount} parcela(s) pagas</div>
              <div class="progress-sub">${pct}% concluído</div>
            </div>
          </div>
          <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <span style="width:${pct}%"></span>
          </div>

          <div class="kv" style="margin-top:12px">
            <div class="box">
              <div class="k">Valor total</div>
              <div class="v">${formatCurrency(convTotal.ok ? convTotal.value : tx.totalValue, convTotal.ok ? display : tx.currency)} ${convTotal.ok ? "" : "⚠"}</div>
            </div>
            <div class="box">
              <div class="k">Pago até agora</div>
              <div class="v">${formatCurrency(convPaid.ok ? convPaid.value : prog.paidSum, convPaid.ok ? display : tx.currency)} ${convPaid.ok ? "" : "⚠"}</div>
            </div>
            <div class="box">
              <div class="k">Em aberto</div>
              <div class="v">${formatCurrency(convOpen.ok ? convOpen.value : prog.pendingSum, convOpen.ok ? display : tx.currency)} ${convOpen.ok ? "" : "⚠"}</div>
            </div>
            <div class="box">
              <div class="k">Próxima parcela</div>
              <div class="v">${next ? `${formatDateBR(next.dueDate)} • ${formatCurrency(convNext && convNext.ok ? convNext.value : next.value, convNext && convNext.ok ? display : tx.currency)}` : "—"}</div>
            </div>
            <div class="box">
              <div class="k">Atrasadas</div>
              <div class="v">${overdue.length ? `${overdue.length} • ${formatCurrency(convOverdue && convOverdue.ok ? convOverdue.value : overdue.reduce((a, i) => a + Number(i.value || 0), 0), convOverdue && convOverdue.ok ? display : tx.currency)}` : "0"}</div>
            </div>
            ${loanBlock}
          </div>

          ${conversionNote}
        </div>

        <h3>Resumo da transação</h3>
        <div class="kv">
          <div class="box"><div class="k">Tipo</div><div class="v">${escapeHTML(Domain.typeLabel(tx.type))}</div></div>
          <div class="box"><div class="k">Status</div><div class="v">${done ? "Concluído" : "Pendente"}</div></div>
          <div class="box"><div class="k">Item/Bem</div><div class="v">${escapeHTML(tx.item)}</div></div>
          <div class="box"><div class="k">Forma</div><div class="v">${tx.paymentMode === "parcelado" ? `Parcelado (${tx.frequency})` : "À vista"}</div></div>
        </div>

        <h3>Parcelas</h3>
        <div class="table" role="table" aria-label="Parcelas">
          <div class="tr head" role="row">
            <div role="columnheader">Parcela</div>
            <div class="right" role="columnheader">Valor</div>
            <div class="right" role="columnheader">Status</div>
          </div>
          ${instRows}
        </div>

        ${tx.notes ? `<div class="note"><strong>Observações:</strong><br>${escapeHTML(tx.notes)}</div>` : ""}

        <div class="item-actions" style="margin-top:14px">
          <button class="btn" type="button" data-action="receipt" data-id="${tx.id}">Gerar Recibo/Relatório</button>
          <button class="btn" type="button" data-action="copyReportQuick" data-id="${tx.id}">Copiar Relatório</button>
          <button class="btn" type="button" data-action="shareReportQuick" data-id="${tx.id}">Compartilhar</button>
          <a class="btn" href="#form" data-action="edit" data-id="${tx.id}">Editar</a>
          <button class="btn danger" type="button" data-action="delete" data-id="${tx.id}">Excluir</button>
        </div>
      `;

      detailCard.hidden = false;
      detailCard.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const renderForm = () => {
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

      updateInstallmentPreview();
    };

    const updateInstallmentPreview = () => {
      const pm = ($("input[name='paymentMode']:checked")?.value || "avista");
      const box = $("#installmentsPreview");
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

      // se o usuário digitou vírgula/ponto em Nº parcelas, mostramos instrução
      if (rawN && /[,.]/.test(rawN)) {
        box.textContent = "Nº parcelas deve ser inteiro. Se o cliente não fecha redondo, use “Valor por parcela”.";
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

    return { show, routeFromHash, goToDetail, renderDashboard, renderTransactions, renderDetail, renderForm, renderSettingsMeta, updateInstallmentPreview };
  })();

  /* ---------------- Receipt / Report ---------------- */
  const Receipt = (() => {
    let currentTxId = null;

    const open = (txId, mode = "total") => {
      const tx = App.getTransaction(txId);
      if (!tx) return;
      currentTxId = txId;

      $("#receiptMode").value = mode;

      const instField = $("#receiptInstallmentField");
      const instSel = $("#receiptInstallment");
      instSel.innerHTML = "";

      const paidLast = Domain.lastPaidInstallment(tx);

      (tx.installments || []).forEach(inst => {
        const label = `${inst.number}/${tx.installments.length} • ${formatDateBR(inst.dueDate)} • ${inst.status}`;
        const opt = document.createElement("option");
        opt.value = String(inst.number);
        opt.textContent = label;
        instSel.appendChild(opt);
      });

      if (paidLast) instSel.value = String(paidLast.number);
      else if (instSel.options[0]) instSel.value = instSel.options[0].value;

      instField.hidden = !($("#receiptMode").value === "installment" && tx.paymentMode === "parcelado");

      $("#signature").value = "";
      render();
      UI.openOverlay("receipt");
    };

    const close = () => {
      currentTxId = null;
      UI.closeOverlay("receipt");
    };

    const buildCordialMessage = (tx, displayCurrency, rates) => {
      const pending = Domain.sumByStatus(tx, "pendente");
      const conv = Rates.convert(pending, tx.currency, displayCurrency, rates);
      const amount = formatCurrency(conv.ok ? conv.value : pending, conv.ok ? displayCurrency : tx.currency);
      const next = Domain.nextPendingInstallment(tx);

      const who = tx.counterpartyName || "tudo bem?";
      const item = tx.item || "a transação";
      const due = next ? formatDateBR(next.dueDate) : "—";

      return [
        `Olá ${who}! Tudo bem? 🙂`,
        `Estou te enviando um resumo atualizado referente a "${item}".`,
        `Saldo em aberto: ${amount}.`,
        `Próximo vencimento: ${due}.`,
        ``,
        `Se precisar de qualquer ajuste ou confirmação, é só me avisar. Obrigado!`,
      ].join("\n");
    };

    const buildDoc = () => {
      const state = App.getState();
      const tx = currentTxId ? App.getTransaction(currentTxId) : null;
      if (!tx) return { html: "", text: "" };

      const display = state.settings.displayCurrency;
      const rates = state.settings.lastRates;

      const mode = $("#receiptMode").value || "total";
      const sig = ($("#signature").value || "").trim();
      const nowStr = new Date().toLocaleString("pt-BR");

      const payer = (tx.type === "compra") ? "Você" : tx.counterpartyName;
      const receiver = (tx.type === "compra") ? tx.counterpartyName : "Você";

      const docLine = tx.counterpartyDoc ? tx.counterpartyDoc : "—";
      const modeTxt = tx.paymentMode === "parcelado" ? `Parcelado (${tx.frequency})` : "À vista";

      const conversionMeta = (() => {
        if (tx.currency === display) return null;
        const line = Rates.rateLine(tx.currency, display, rates);
        const when = rates?.updatedAt ? new Date(rates.updatedAt).toLocaleString("pt-BR") : null;
        if (line && when) return { line, when };
        return null;
      })();

      if (mode === "report") {
        const prog = Domain.progressSummary(tx);
        const next = Domain.nextPendingInstallment(tx);
        const overdue = Domain.overdueInstallments(tx);

        const convTotal = Rates.convert(tx.totalValue, tx.currency, display, rates);
        const convPaid = Rates.convert(prog.paidSum, tx.currency, display, rates);
        const convOpen = Rates.convert(prog.pendingSum, tx.currency, display, rates);

        const pct = prog.totalCount ? Math.round((prog.paidCount / prog.totalCount) * 100) : 0;

        const currentYM = ymOf(todayISODate());
        const monthList = (tx.installments || []).filter(i => ymOf(i.dueDate) === currentYM);
        const nextThree = (tx.installments || []).filter(i => i.status === "pendente").slice(0, 3);

        const loanYield = (tx.type === "emprestimo") ? Domain.loanMonthlyYield(tx) : 0;
        const convYield = (tx.type === "emprestimo")
          ? Rates.convert(loanYield, tx.currency, display, rates)
          : null;

        const yieldBlock = (tx.type !== "emprestimo") ? "" : `
          <div class="box">
            <div class="k">Rendimento mensal estimado</div>
            <div class="v">${formatCurrency(convYield && convYield.ok ? convYield.value : loanYield, (convYield && convYield.ok) ? display : tx.currency)} ${(convYield && convYield.ok) ? "" : "⚠"}</div>
            <div class="muted">Taxa: ${((Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE) * 100).toFixed(2).replace(".", ",")}% ao mês (estimativa)</div>
          </div>
        `;

        const listBlock = (title, items) => {
          if (!items.length) return `<div class="muted">${escapeHTML(title)}: —</div>`;
          const lines = items.map(i => {
            const conv = Rates.convert(i.value, tx.currency, display, rates);
            const shownVal = formatCurrency(conv.ok ? conv.value : i.value, conv.ok ? display : tx.currency);
            const extra = i.status === "pago" ? `PAGO (${formatDateBR(i.paidAt)})` : (i.dueDate < todayISODate() ? "ATRASADA" : "PENDENTE");
            return `<div class="listline"><strong>${i.number}/${tx.installments.length}</strong> • ${formatDateBR(i.dueDate)} • ${shownVal} • ${extra}</div>`;
          }).join("");
          return `<h4>${escapeHTML(title)}</h4>${lines}`;
        };

        const warnRate = (convTotal.ok && convPaid.ok && convOpen.ok) ? "" : `<div class="muted">⚠ Taxa indisponível em algum cálculo. Alguns valores podem aparecer na moeda original.</div>`;
        const convNote = conversionMeta ? `<div class="muted">Conversão: ${escapeHTML(conversionMeta.line)} • Cotação: ${escapeHTML(conversionMeta.when)}</div>` : "";

        const cordial = buildCordialMessage(tx, display, rates);

        const html = `
          <h3>RELATÓRIO DA TRANSAÇÃO</h3>
          <div class="muted">Transparente e organizado para envio mensal (WhatsApp / PDF).</div>
          ${warnRate}
          ${convNote}

          <div class="grid">
            <div class="box"><div class="k">Parte</div><div class="v">${escapeHTML(tx.counterpartyName)}</div><div class="muted">Documento: ${escapeHTML(docLine)}</div></div>
            <div class="box"><div class="k">Item/Bem</div><div class="v">${escapeHTML(tx.item)}</div></div>
            <div class="box"><div class="k">Tipo</div><div class="v">${escapeHTML(Domain.typeLabel(tx.type))}</div></div>
            <div class="box"><div class="k">Data do acordo</div><div class="v">${formatDateBR(tx.agreementDate)}</div></div>

            <div class="box"><div class="k">Forma</div><div class="v">${escapeHTML(modeTxt)}</div></div>
            <div class="box"><div class="k">Gerado em</div><div class="v">${escapeHTML(nowStr)}</div></div>

            <div class="box"><div class="k">Valor total</div><div class="v">${formatCurrency(convTotal.ok ? convTotal.value : tx.totalValue, convTotal.ok ? display : tx.currency)} ${convTotal.ok ? "" : "⚠"}</div></div>
            <div class="box"><div class="k">Pago até agora</div><div class="v">${formatCurrency(convPaid.ok ? convPaid.value : prog.paidSum, convPaid.ok ? display : tx.currency)} ${convPaid.ok ? "" : "⚠"}</div></div>
            <div class="box"><div class="k">Em aberto</div><div class="v">${formatCurrency(convOpen.ok ? convOpen.value : prog.pendingSum, convOpen.ok ? display : tx.currency)} ${convOpen.ok ? "" : "⚠"}</div></div>
            <div class="box"><div class="k">Progresso</div><div class="v">${prog.paidCount}/${prog.totalCount} parcelas (${pct}%)</div><div class="muted">Atrasadas: ${overdue.length}</div></div>

            <div class="box"><div class="k">Próxima parcela</div><div class="v">${next ? `${formatDateBR(next.dueDate)}` : "—"}</div></div>
            <div class="box"><div class="k">Pagador</div><div class="v">${escapeHTML(payer)}</div></div>
            <div class="box"><div class="k">Recebedor</div><div class="v">${escapeHTML(receiver)}</div></div>
            ${yieldBlock}
          </div>

          <h4>Mensagem cordial sugerida</h4>
          <div class="listline"><pre style="margin:0; white-space:pre-wrap; font-family:inherit">${escapeHTML(cordial)}</pre></div>

          ${listBlock("Parcelas deste mês", monthList)}
          ${listBlock("Próximas 3 parcelas pendentes", nextThree)}

          ${tx.notes ? `<h4>Observações</h4><div class="listline">${escapeHTML(tx.notes)}</div>` : ""}

          <div class="sign">
            <div><div class="k">Assinatura</div><div class="v">${escapeHTML(sig || "—")}</div></div>
            <div class="muted">Use “Imprimir / Salvar PDF” para enviar como arquivo no WhatsApp.</div>
          </div>
        `;

        // texto para copiar/whatsapp
        const textLines = [];
        textLines.push("RELATÓRIO DA TRANSAÇÃO");
        textLines.push(`Parte: ${tx.counterpartyName} (Documento: ${docLine})`);
        textLines.push(`Tipo: ${Domain.typeLabel(tx.type)}`);
        textLines.push(`Item/Bem: ${tx.item}`);
        textLines.push(`Data do acordo: ${formatDateBR(tx.agreementDate)}`);
        textLines.push(`Forma: ${modeTxt}`);
        textLines.push("");

        textLines.push("RESUMO");
        textLines.push(`Valor total: ${formatCurrency(convTotal.ok ? convTotal.value : tx.totalValue, convTotal.ok ? display : tx.currency)}${convTotal.ok ? "" : " (taxa indisponível)"}`);
        textLines.push(`Pago até agora: ${formatCurrency(convPaid.ok ? convPaid.value : prog.paidSum, convPaid.ok ? display : tx.currency)}${convPaid.ok ? "" : " (taxa indisponível)"}`);
        textLines.push(`Em aberto: ${formatCurrency(convOpen.ok ? convOpen.value : prog.pendingSum, convOpen.ok ? display : tx.currency)}${convOpen.ok ? "" : " (taxa indisponível)"}`);
        textLines.push(`Parcelas pagas: ${prog.paidCount}/${prog.totalCount} (${pct}%)`);
        if (overdue.length) textLines.push(`Atrasadas: ${overdue.length}`);

        if (tx.type === "emprestimo") {
          const rate = Number.isFinite(tx.loanRate) ? tx.loanRate : DEFAULT_LOAN_RATE;
          const y = Domain.loanMonthlyYield(tx);
          const cy = Rates.convert(y, tx.currency, display, rates);
          textLines.push(`Rendimento mensal estimado: ${formatCurrency(cy.ok ? cy.value : y, cy.ok ? display : tx.currency)} (taxa ${String((rate * 100).toFixed(2)).replace(".", ",")}%)`);
        }

        if (conversionMeta) {
          textLines.push("");
          textLines.push(`Conversão: ${conversionMeta.line}`);
          textLines.push(`Cotação: ${conversionMeta.when}`);
        }

        textLines.push("");
        textLines.push("MENSAGEM CORDIAL SUGERIDA");
        textLines.push(cordial);

        textLines.push("");
        textLines.push("PARCELAS DESTE MÊS");
        if (!monthList.length) textLines.push("—");
        else monthList.forEach(i => {
          const conv = Rates.convert(i.value, tx.currency, display, rates);
          const shownVal = formatCurrency(conv.ok ? conv.value : i.value, conv.ok ? display : tx.currency);
          const st = i.status === "pago" ? `PAGO (${formatDateBR(i.paidAt)})` : (i.dueDate < todayISODate() ? "ATRASADA" : "PENDENTE");
          textLines.push(`${i.number}/${tx.installments.length} - ${formatDateBR(i.dueDate)} - ${shownVal} - ${st}`);
        });

        textLines.push("");
        textLines.push("PRÓXIMAS 3 PENDENTES");
        if (!nextThree.length) textLines.push("—");
        else nextThree.forEach(i => {
          const conv = Rates.convert(i.value, tx.currency, display, rates);
          const shownVal = formatCurrency(conv.ok ? conv.value : i.value, conv.ok ? display : tx.currency);
          const st = i.dueDate < todayISODate() ? "ATRASADA" : "PENDENTE";
          textLines.push(`${i.number}/${tx.installments.length} - ${formatDateBR(i.dueDate)} - ${shownVal} - ${st}`);
        });

        if (tx.notes) {
          textLines.push("");
          textLines.push(`Observações: ${tx.notes}`);
        }

        textLines.push("");
        textLines.push(`Pagador: ${payer}`);
        textLines.push(`Recebedor: ${receiver}`);
        if (sig) textLines.push(`Assinatura: ${sig}`);
        textLines.push(`Gerado em: ${nowStr}`);

        return { html, text: textLines.join("\n") };
      }

      // Recibo clássico
      let targetLabel = "Total";
      let value = tx.totalValue;
      let paidAt = null;
      let instCount = tx.installments?.length || 1;
      let instStatus = null;

      if (mode === "installment") {
        const chosen = parseInt($("#receiptInstallment").value || "1", 10);
        const inst = (tx.installments || []).find(i => i.number === chosen) || null;
        if (inst) {
          value = inst.value;
          paidAt = inst.paidAt || null;
          instStatus = inst.status;
          targetLabel = `Parcela ${inst.number}/${instCount}`;
        }
      } else {
        const only = (tx.installments || [])[0] || null;
        if (tx.paymentMode === "avista" && only) {
          paidAt = only.paidAt || null;
          instStatus = only.status || null;
        }
      }

      const conv = Rates.convert(value, tx.currency, display, rates);
      const paidLine = paidAt ? `Pago em ${formatDateBR(paidAt)}.` : "Não pago. Sugestão: marque como pago para gerar recibo com data.";
      const warnRate = conv.ok ? "" : `<div class="muted">⚠ ${escapeHTML(conv.note || "Taxa indisponível")} (mostrando valor original)</div>`;
      const convNote = conversionMeta ? `<div class="muted">Conversão: ${escapeHTML(conversionMeta.line)} • Cotação: ${escapeHTML(conversionMeta.when)}</div>` : "";

      const valDisplay = conv.ok ? formatCurrency(conv.value, display) : formatCurrency(value, tx.currency);
      const statusBit = instStatus ? `Status: ${instStatus}.` : "";

      const html = `
        <h3>RECIBO</h3>
        <div class="muted">Visualização e impressão.</div>
        ${warnRate}
        ${convNote}

        <div class="grid">
          <div class="box"><div class="k">Tipo</div><div class="v">${escapeHTML(Domain.typeLabel(tx.type))}</div></div>
          <div class="box"><div class="k">Item/Bem</div><div class="v">${escapeHTML(tx.item)}</div></div>
          <div class="box"><div class="k">Referência</div><div class="v">${escapeHTML(targetLabel)}</div></div>
          <div class="box"><div class="k">Valor</div><div class="v">${escapeHTML(valDisplay)}</div></div>
          <div class="box"><div class="k">Data do acordo</div><div class="v">${formatDateBR(tx.agreementDate)}</div></div>
          <div class="box"><div class="k">Pagamento</div><div class="v">${paidAt ? formatDateBR(paidAt) : "—"}</div><div class="muted">${escapeHTML(paidLine)}</div></div>
          <div class="box"><div class="k">Pagador</div><div class="v">${escapeHTML(payer)}</div></div>
          <div class="box"><div class="k">Recebedor</div><div class="v">${escapeHTML(receiver)}</div></div>
          <div class="box"><div class="k">Documento (CPF/CNPJ)</div><div class="v">${escapeHTML(docLine)}</div></div>
          <div class="box"><div class="k">Forma</div><div class="v">${escapeHTML(modeTxt)}</div><div class="muted">${escapeHTML(statusBit)}</div></div>
        </div>

        <div class="sign">
          <div><div class="k">Assinatura</div><div class="v">${escapeHTML(sig || "—")}</div></div>
          <div class="muted">Gerado em ${escapeHTML(nowStr)}</div>
        </div>
      `;

      const text = [
        "RECIBO",
        `Tipo: ${Domain.typeLabel(tx.type)}`,
        `Item/Bem: ${tx.item}`,
        `Referência: ${targetLabel}`,
        `Valor: ${valDisplay}${conv.ok ? "" : " (taxa indisponível, valor original)"}`,
        `Data do acordo: ${formatDateBR(tx.agreementDate)}`,
        `Pagamento: ${paidAt ? formatDateBR(paidAt) : "não pago"}`,
        `Pagador: ${payer}`,
        `Recebedor: ${receiver}`,
        `Documento (CPF/CNPJ): ${docLine}`,
        `Forma: ${modeTxt}`,
        sig ? `Assinatura: ${sig}` : "",
        conversionMeta ? `Conversão: ${conversionMeta.line} | Cotação: ${conversionMeta.when}` : "",
        `Gerado em: ${nowStr}`,
      ].filter(Boolean).join("\n");

      return { html, text };
    };

    const render = () => {
      const tx = currentTxId ? App.getTransaction(currentTxId) : null;
      if (!tx) return;

      const mode = $("#receiptMode").value || "total";
      $("#receiptTitle").textContent = mode === "report" ? "Relatório" : "Recibo";

      $("#receiptInstallmentField").hidden = !(mode === "installment" && tx.paymentMode === "parcelado");

      const { html } = buildDoc();
      $("#receiptDoc").innerHTML = html;
    };

    const copy = async () => {
      const { text } = buildDoc();
      try {
        await navigator.clipboard.writeText(text);
        UI.toast("Conteúdo copiado.", "good");
      } catch {
        UI.toast("Não foi possível copiar. Tente novamente.", "bad");
      }
    };

    const share = async () => {
      const { text } = buildDoc();
      try {
        if (navigator.share) {
          await navigator.share({ text, title: "Relatório / Recibo" });
          UI.toast("Compartilhado.", "good");
          return;
        }
        await navigator.clipboard.writeText(text);
        UI.toast("Compartilhar não disponível. Copiamos o texto.", "warn", { ttl: 6500 });
      } catch {
        UI.toast("Não foi possível compartilhar.", "bad");
      }
    };

    const print = () => {
      document.body.classList.add("print-receipt");
      window.print();
      window.setTimeout(() => document.body.classList.remove("print-receipt"), 250);
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
    $("#agreementDate").value = todayISODate();
    $("#numInstallments").value = "";
    $("#dueDay").value = "";
    $("#frequency").value = "mensal";
    $("#currency").value = "BRL";
    $("#counterpartyDoc").value = "";
    $("#installmentValue").value = "";
    $("#loanRate").value = "0,67";
    clearErrors();
    $("#formMeta").textContent = "";
  }

  function populateForm(tx) {
    $("#txId").value = tx.id;
    $("#type").value = tx.type;
    $("#item").value = tx.item;
    $("#counterpartyName").value = tx.counterpartyName;
    $("#counterpartyDoc").value = tx.counterpartyDoc || "";
    $("#currency").value = tx.currency;
    $("#totalValue").value = String(tx.totalValue).replace(".", ",");
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
      $("#installmentValue").value = ""; // não conseguimos inferir com precisão após salvo, então fica opcional
    } else {
      $("#numInstallments").value = "";
      $("#dueDay").value = "";
      $("#frequency").value = "mensal";
      $("#installmentValue").value = "";
    }

    $("#formMeta").textContent = `Criado em ${new Date(tx.createdAt).toLocaleString("pt-BR")} • Atualizado em ${new Date(tx.updatedAt).toLocaleString("pt-BR")}`;
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

    // Nº parcelas deve ser inteiro; se tiver vírgula/ponto, vira inválido e será tratado na validação
    const rawN = String($("#numInstallments").value || "").trim();
    const numInstallments = /[,.]/.test(rawN) ? NaN : parseInt(rawN || "0", 10);

    const dueDay = parseInt($("#dueDay").value || "0", 10);

    const installmentValue = parseMoneyInput($("#installmentValue").value);
    const hasInstallmentValue = Number.isFinite(installmentValue) && installmentValue > 0;

    const loanRatePct = parseMoneyInput($("#loanRate").value); // usando parseMoneyInput pra aceitar vírgula
    const loanRate = (type === "emprestimo")
      ? (Number.isFinite(loanRatePct) && loanRatePct > 0 ? (loanRatePct / 100) : DEFAULT_LOAN_RATE)
      : null;

    return {
      id: existing?.id || safeUUID(),
      type, item, counterpartyName, counterpartyDoc,
      currency, totalValue, agreementDate,
      paymentMode,
      frequency: paymentMode === "parcelado" ? frequency : null,
      notes,
      loanRate,
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
    UI.setFieldError("numInstallments", errors.numInstallments || "");
    UI.setFieldError("dueDay", errors.dueDay || "");
    UI.setFieldError("installmentValue", errors.installmentValue || "");
  }

  /* ---------------- Wiring ---------------- */
  function wire() {
    window.addEventListener("hashchange", () => Views.show(Views.routeFromHash()));
    Views.show(Views.routeFromHash());

    // abre menu
    $("#menuBtn").addEventListener("click", () => UI.openOverlay("menu"));

    // ✅ (robusto) fecha menu/recibo pelo X OU clicando no fundo (scrim)
    // Nota: UI já tem listener global para [data-close] e overlay-scrim.
    // Estes handlers abaixo continuam ok (não atrapalham).
    $("#menuOverlay").addEventListener("click", (e) => {
      const closeBtn = e.target.closest("[data-close='menu']");
      if (closeBtn) UI.closeOverlay("menu");
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
      if (t === "emprestimo" && !$("#loanRate").value.trim()) $("#loanRate").value = "0,67";
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
      };

      // validação extra: se numInstallments veio NaN por causa de vírgula/ponto
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

      if (existing && Array.isArray(existing.installments) && existing.installments.length) {
        // preserva pagos quando possível (mesmo que tenha mudado cálculo)
        const paidMap = new Map(existing.installments.filter(i => i.status === "pago").map(i => [i.number, i]));
        finalInstallments = installments.map(inst => {
          const old = paidMap.get(inst.number);
          if (old) return { ...inst, status: "pago", paidAt: old.paidAt || todayISODate() };
          return inst;
        });
      }

      const tx = {
        id: draft.id,
        type: draft.type,
        item: draft.item,
        counterpartyName: draft.counterpartyName,
        counterpartyDoc: draft.counterpartyDoc,
        currency: draft.currency,
        totalValue: roundByCurrency(draft.totalValue, draft.currency),
        agreementDate: draft.agreementDate,
        paymentMode: domainDraft.paymentMode,
        frequency: domainDraft.paymentMode === "parcelado" ? domainDraft.frequency : null,
        installments: finalInstallments.map(i => ({
          number: i.number,
          dueDate: i.dueDate,
          value: i.value,
          status: i.status,
          paidAt: i.status === "pago" ? (i.paidAt || todayISODate()) : null,
        })),
        notes: draft.notes,
        loanRate: draft.type === "emprestimo" ? (Number.isFinite(draft.loanRate) ? draft.loanRate : DEFAULT_LOAN_RATE) : null,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      };

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
        // ✅ conserto: se estiver no dashboard, vai pra transações e abre
        if (Views.routeFromHash() !== "transactions") {
          Views.goToDetail(id);
        } else {
          Views.renderDetail(id);
        }
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
              Domain.undoPay(current, res.paidNumber);
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

    // Seed (exemplo leve)
    const st = App.getState();
    if (!st.transactions.length) {
      const example = {
        id: safeUUID(),
        type: "emprestimo",
        item: "Exemplo: Empréstimo pessoal",
        counterpartyName: "Devedor Exemplo",
        counterpartyDoc: null,
        currency: "BRL",
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
  }

  wire();
})();
