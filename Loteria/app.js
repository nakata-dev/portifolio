(() => {
  "use strict";

  const LS_KEYS = {
    theme: "takara:theme",
    saved: "takara:saved:v1",
    prefs: "takara:prefs:v2",
    probLast: "takara:prob:last:v1",
    prob7: "takara:prob:7:v1",
    online: "takara:prob:online:v1"
  };

  const SAVED_PAGE_SIZE = 10;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LOTTERIES = {
    loto6: { id: "loto6", label: "Loto 6", pick: 6, max: 43, hotColdTop: 6 },
    loto7: { id: "loto7", label: "Loto 7", pick: 7, max: 37, hotColdTop: 7 },
    miniloto: { id: "miniloto", label: "Mini Loto", pick: 5, max: 31, hotColdTop: 5 }
  };

  // Fontes públicas para histórico (pode falhar por CORS)
  const ONLINE_SOURCES = {
    loto6: { url: "https://en.lottolyzer.com/history/japan/lotto-6" },
    loto7: { url: "https://en.lottolyzer.com/history/japan/lotto-7" },
    miniloto: { url: "https://en.lottolyzer.com/history/japan/mini-lotto" }
  };

  const state = {
    viewId: "view-generate",
    qty: 1,
    generated: [],
    saved: [],
    savedPage: 1,
    theme: null,
    prefs: {
      lotteryId: "loto6",
      mode: "rng", // rng | prob_last | prob_7 | online_trends
      copyTwoDigits: false,
      fixedNumbers: [],
      onlineLimit: 50
    },
    prob: {
      last: null,
      seven: null,
      online: null
    }
  };

  // DOM
  const menuBtn = $("#menuBtn");
  const menuCloseBtn = $("#menuCloseBtn");
  const sideMenu = $("#sideMenu");
  const overlay = $("#overlay");

  const themeToggle = $("#themeToggle");

  const lotterySelect = $("#lotterySelect");
  const modeSelect = $("#modeSelect");
  const qtyButtons = $$(".seg-btn");
  const copyTwoDigits = $("#copyTwoDigits");

  const fixedNumbersInput = $("#fixedNumbers");
  const btnApplyFixed = $("#btnApplyFixed");
  const btnClearFixed = $("#btnClearFixed");
  const fixedChips = $("#fixedChips");

  const onlineLimit = $("#onlineLimit");
  const btnFetchOnline = $("#btnFetchOnline");
  const onlineStatus = $("#onlineStatus");

  const btnGenerate = $("#btnGenerate");
  const btnCopy = $("#btnCopy");
  const btnSave = $("#btnSave");
  const btnPrint = $("#btnPrint");

  const statusLine = $("#statusLine");

  const generatedArea = $("#generatedArea");

  const savedList = $("#savedList");
  const btnClearAll = $("#btnClearAll");
  const btnPrevPage = $("#btnPrevPage");
  const btnNextPage = $("#btnNextPage");
  const pageInfo = $("#pageInfo");

  const pasteLast = $("#pasteLast");
  const btnAnalyzeLast = $("#btnAnalyzeLast");
  const lastStatus = $("#lastStatus");
  const lastHot = $("#lastHot");
  const lastCold = $("#lastCold");

  const paste7 = $("#paste7");
  const btnAnalyze7 = $("#btnAnalyze7");
  const sevenStatus = $("#sevenStatus");
  const sevenHot = $("#sevenHot");
  const sevenCold = $("#sevenCold");

  const printRoot = $("#printRoot");

  /* ==========
     THEME
  ========== */
  function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeSet(key, value) {
    try {
      const v = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, v);
    } catch {}
  }
  function safeRemove(key) { try { localStorage.removeItem(key); } catch {} }

  function getPreferredTheme() {
    const saved = safeGet(LS_KEYS.theme);
    if (saved === "dark" || saved === "light") return saved;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    const pressed = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(pressed));
    const icon = themeToggle.querySelector(".icon");
    if (icon) icon.textContent = pressed ? "🌙" : "☀️";
  }

  function toggleTheme() {
    const next = state.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    safeSet(LS_KEYS.theme, next);
    toast(`Modo ${next === "dark" ? "Escuro" : "Claro"} ativado.`);
  }

  /* ==========
     SPA VIEWS
  ========== */
  function setView(viewId) {
    const current = $(".view.is-active");
    if (current) current.classList.remove("is-active");
    const next = $("#" + viewId);
    if (next) next.classList.add("is-active");
    state.viewId = viewId;

    const main = $("#appMain");
    if (main) main.focus({ preventScroll: true });
  }

  /* ==========
     MENU A11Y
  ========== */
  let lastFocusedBeforeMenu = null;

  function openMenu() {
    lastFocusedBeforeMenu = document.activeElement;
    sideMenu.classList.add("is-open");
    sideMenu.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");

    const first = sideMenu.querySelector(".nav-item");
    if (first) first.focus({ preventScroll: true });

    document.addEventListener("keydown", onMenuKeydown, true);
  }

  function closeMenu() {
    sideMenu.classList.remove("is-open");
    sideMenu.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");

    document.removeEventListener("keydown", onMenuKeydown, true);
    if (lastFocusedBeforeMenu && typeof lastFocusedBeforeMenu.focus === "function") {
      lastFocusedBeforeMenu.focus({ preventScroll: true });
    }
  }

  function isMenuOpen() { return sideMenu.classList.contains("is-open"); }

  function onMenuKeydown(e) {
    if (!isMenuOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === "Tab") {
      const focusables = $$(".nav-item, #menuCloseBtn", sideMenu).filter(el => !el.disabled);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    }
  }

  /* ==========
     RNG
  ========== */
  function randInt(min, maxInclusive) {
    const range = (maxInclusive - min + 1);
    if (range <= 0) return min;

    if (window.crypto && window.crypto.getRandomValues) {
      const maxUint32 = 0xFFFFFFFF;
      const limit = Math.floor(maxUint32 / range) * range;
      const buf = new Uint32Array(1);
      let x;
      do {
        window.crypto.getRandomValues(buf);
        x = buf[0];
      } while (x >= limit);
      return min + (x % range);
    }
    return min + Math.floor(Math.random() * range);
  }

  function sampleUniqueUniform(pick, max, excludedSet = new Set()) {
    const set = new Set(Array.from(excludedSet));
    while (set.size < pick + excludedSet.size) set.add(randInt(1, max));
    const arr = Array.from(set).filter(n => !excludedSet.has(n));
    return arr.slice(0, pick).sort((a, b) => a - b);
  }

  /* ==========
     PARSING (blindado)
  ========== */
  function extractNumbers(line) {
    const matches = String(line).match(/\d+/g);
    if (!matches) return [];
    return matches.map(s => Number(s)).filter(n => Number.isFinite(n));
  }

  function parseContestLine(line, lottery) {
    const nums = extractNumbers(line)
      .map(n => Math.trunc(n))
      .filter(n => n >= 1 && n <= lottery.max);

    const unique = Array.from(new Set(nums));
    if (unique.length !== lottery.pick) return null;
    return unique.sort((a, b) => a - b);
  }

  function parseMultipleLines(text, expectedLines, lottery) {
    const lines = String(text)
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (lines.length !== expectedLines) {
      return { ok: false, error: `Esperado exatamente ${expectedLines} linha(s). Encontrei ${lines.length}.`, lines: [] };
    }

    const parsed = [];
    for (let i = 0; i < lines.length; i++) {
      const p = parseContestLine(lines[i], lottery);
      if (!p) {
        return { ok: false, error: `Linha ${i + 1} inválida para ${lottery.label}. Verifique quantidade e intervalo.`, lines: [] };
      }
      parsed.push(p);
    }
    return { ok: true, lines: parsed };
  }

  /* ==========
     FIXED NUMBERS (cadastro)
  ========== */
  function parseFixedNumbers(input, lottery) {
    const nums = extractNumbers(input)
      .map(n => Math.trunc(n))
      .filter(n => n >= 1 && n <= lottery.max);

    const unique = Array.from(new Set(nums)).sort((a, b) => a - b);

    if (unique.length >= lottery.pick) {
      return { ok: false, error: `Você definiu ${unique.length} fixo(s), mas a ${lottery.label} precisa de ${lottery.pick}. Deixe no máximo ${lottery.pick - 1}.`, nums: [] };
    }
    return { ok: true, nums: unique };
  }

  function renderFixedChips() {
    fixedChips.innerHTML = "";
    const nums = state.prefs.fixedNumbers || [];
    if (!nums.length) {
      btnClearFixed.disabled = true;
      return;
    }
    btnClearFixed.disabled = false;

    for (const n of nums) {
      const c = document.createElement("div");
      c.className = "chip";
      c.textContent = String(n);
      fixedChips.appendChild(c);
    }
  }

  function applyFixedFromInput() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    const parsed = parseFixedNumbers(fixedNumbersInput.value, lot);
    if (!parsed.ok) {
      toast(parsed.error);
      return;
    }
    state.prefs.fixedNumbers = parsed.nums;
    persistPrefs();
    renderFixedChips();
    toast(parsed.nums.length ? `Fixos aplicados: ${parsed.nums.join(", ")}` : "Nenhum número fixo aplicado.");
  }

  function clearFixed() {
    state.prefs.fixedNumbers = [];
    fixedNumbersInput.value = "";
    persistPrefs();
    renderFixedChips();
    toast("Fixos limpos.");
  }

  /* ==========
     FREQUÊNCIA + QUENTES/FRIOS
  ========== */
  function buildFrequency(lines, lottery) {
    const freq = new Map();
    for (let n = 1; n <= lottery.max; n++) freq.set(n, 0);
    for (const line of lines) for (const n of line) freq.set(n, (freq.get(n) || 0) + 1);
    return freq;
  }

  function hotColdFromFreq(freq, lottery) {
    const all = [];
    for (let n = 1; n <= lottery.max; n++) all.push({ n, c: freq.get(n) || 0 });

    const hot = all.slice().sort((a, b) => (b.c - a.c) || (a.n - b.n))
      .slice(0, lottery.hotColdTop).map(x => x.n);

    const cold = all.slice().sort((a, b) => (a.c - b.c) || (a.n - b.n))
      .slice(0, lottery.hotColdTop).map(x => x.n);

    return { hot, cold };
  }

  function buildWeights(freq, lottery) {
    const alpha = 0.65;
    const weights = new Array(lottery.max + 1).fill(1);
    for (let n = 1; n <= lottery.max; n++) {
      const f = freq.get(n) || 0;
      weights[n] = 1 + alpha * f;
    }
    return weights;
  }

  function weightedPickUnique(weights, pick, max, excludedSet = new Set()) {
    const chosen = new Set(Array.from(excludedSet));

    const needTotal = excludedSet.size + pick;

    for (let k = excludedSet.size; k < needTotal; k++) {
      let total = 0;
      for (let n = 1; n <= max; n++) total += chosen.has(n) ? 0 : (weights[n] || 0);

      if (!Number.isFinite(total) || total <= 0) {
        while (chosen.size < needTotal) chosen.add(randInt(1, max));
        break;
      }

      let r = (randInt(1, 1_000_000) / 1_000_000) * total;
      let picked = 1;
      for (let n = 1; n <= max; n++) {
        if (chosen.has(n)) continue;
        r -= (weights[n] || 0);
        if (r <= 0) { picked = n; break; }
      }
      chosen.add(picked);
    }

    return Array.from(chosen).sort((a, b) => a - b);
  }

  /* ==========
     ONLINE FETCH (experimental)
  ========== */
  function escapeHtml(s) {
    return String(s).replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function toast(msg) {
    statusLine.innerHTML = msg ? `<strong>${escapeHtml(msg)}</strong>` : "";
    if (msg) {
      window.clearTimeout(toast._t);
      toast._t = window.setTimeout(() => { statusLine.textContent = ""; }, 2600);
    }
  }

  function modeLabel(mode) {
    if (mode === "rng") return "Modo A • Aleatório (RNG)";
    if (mode === "prob_last") return "Modo B • Prob. (último concurso)";
    if (mode === "prob_7") return "Modo C • Prob. (últimos 7)";
    if (mode === "online_trends") return "Online (exp.) • Tendências (histórico)";
    return mode;
  }

  function lotteryLabel(lotteryId) {
    return LOTTERIES[lotteryId]?.label || "Loteria";
  }

  function parseHistoryFromHtml(html, lottery, limit) {
    // Estratégia: busca padrões de data e sequência de números em CSV "14,31,32,37,41,42"
    // Nota: é um parser tolerante, não “depende” de layout perfeito.
    const lines = [];
    const re = /(\d{4}-\d{2}-\d{2}).{0,120}?(\d{1,2}\s*,\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*\d{1,2}\s*,\s*\d{1,2}(?:\s*,\s*\d{1,2})?(?:\s*,\s*\d{1,2})?)/g;
    let m;
    while ((m = re.exec(html)) && lines.length < limit) {
      const nums = m[2].split(",").map(s => Number(s.trim())).filter(n => Number.isFinite(n));
      const unique = Array.from(new Set(nums)).filter(n => n >= 1 && n <= lottery.max);
      if (unique.length >= lottery.pick) {
        lines.push(unique.slice(0, lottery.pick).sort((a, b) => a - b));
      }
    }
    return lines;
  }

  async function fetchOnlineHistory() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    const limit = Number(onlineLimit.value) || 50;
    state.prefs.onlineLimit = limit;
    persistPrefs();

    onlineStatus.innerHTML = `<strong>Buscando histórico...</strong> (pode levar alguns segundos)`;
    btnFetchOnline.disabled = true;

    try {
      const src = ONLINE_SOURCES[lot.id];
      if (!src) throw new Error("Fonte online não disponível para esta loteria.");

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(src.url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(t);

      if (!res.ok) throw new Error(`Falha ao buscar histórico (HTTP ${res.status}).`);

      const html = await res.text();
      const lines = parseHistoryFromHtml(html, lot, limit);

      if (!lines.length) {
        throw new Error("Não consegui extrair números do histórico. Pode ser bloqueio/CORS ou mudança no site.");
      }

      const freq = buildFrequency(lines, lot);
      const { hot, cold } = hotColdFromFreq(freq, lot);
      const weights = buildWeights(freq, lot);

      state.prob.online = { lotteryId: lot.id, lines, freq: mapToObj(freq), hot, cold, weights, ts: Date.now(), limit };
      safeSet(LS_KEYS.online, state.prob.online);

      onlineStatus.innerHTML =
        `<strong>OK:</strong> histórico carregado (${lines.length} concursos). ` +
        `Agora use o modo <strong>Online (experimental)</strong> para gerar.`;

      toast("Histórico online pronto (tendências).");

    } catch (err) {
      onlineStatus.innerHTML =
        `<strong style="color:var(--bad)">⚠ Online falhou:</strong> ${escapeHtml(err?.message || "erro")}<br>` +
        `<span class="micro">Dica: alguns sites bloqueiam leitura por CORS. Use “colar resultados” (último / 7) como alternativa.</span>`;
      toast("Online falhou. Use colagem de resultados.");
    } finally {
      btnFetchOnline.disabled = false;
    }
  }

  /* ==========
     UI RENDER
  ========== */
  function renderBalls(nums, animate = false) {
    const wrap = document.createElement("div");
    wrap.className = "combo-balls";
    for (const n of nums) {
      const b = document.createElement("div");
      b.className = "ball";
      b.textContent = String(n);
      if (animate) b.classList.add("is-anim");
      wrap.appendChild(b);
    }
    return wrap;
  }

  function setActionEnabled(hasGenerated) {
    btnCopy.disabled = !hasGenerated;
    btnSave.disabled = !hasGenerated;
    btnPrint.disabled = !hasGenerated;
  }

  function renderGenerated() {
    generatedArea.innerHTML = "";

    if (!state.generated.length) {
      const empty = document.createElement("div");
      empty.className = "empty-hint";
      empty.innerHTML = `Clique em <strong>Gerar</strong> para ver as combinações aqui.`;
      generatedArea.appendChild(empty);
      setActionEnabled(false);
      return;
    }

    const lot = LOTTERIES[state.prefs.lotteryId];
    state.generated.forEach((nums, idx) => {
      const card = document.createElement("div");
      card.className = "combo-card";

      const left = document.createElement("div");
      left.className = "combo-left";

      const meta = document.createElement("div");
      meta.className = "combo-meta";
      meta.innerHTML =
        `<span><strong>Jogo ${idx + 1}</strong></span>` +
        `<span>${escapeHtml(lot.label)}</span>` +
        `<span>${escapeHtml(modeLabel(state.prefs.mode))}</span>` +
        (state.prefs.fixedNumbers?.length ? `<span>Fixos: ${state.prefs.fixedNumbers.join(", ")}</span>` : "");

      left.appendChild(meta);
      left.appendChild(renderBalls(nums, true));
      card.appendChild(left);

      generatedArea.appendChild(card);
    });

    setActionEnabled(true);
  }

  function renderSaved() {
    savedList.innerHTML = "";

    const total = state.saved.length;
    const totalPages = Math.max(1, Math.ceil(total / SAVED_PAGE_SIZE));
    state.savedPage = Math.min(state.savedPage, totalPages);

    const start = (state.savedPage - 1) * SAVED_PAGE_SIZE;
    const items = state.saved.slice(start, start + SAVED_PAGE_SIZE);

    if (!total) {
      const empty = document.createElement("div");
      empty.className = "empty-hint";
      empty.textContent = "Você ainda não salvou nenhum jogo.";
      savedList.appendChild(empty);
    } else {
      for (const item of items) {
        const row = document.createElement("div");
        row.className = "saved-item";

        const left = document.createElement("div");
        left.className = "saved-item__left";

        const meta = document.createElement("div");
        meta.className = "saved-item__meta";
        meta.textContent = `${lotteryLabel(item.lotteryId)} • ${modeLabel(item.mode)} • ${new Date(item.ts).toLocaleString()}`;
        left.appendChild(meta);

        const ballsWrap = document.createElement("div");
        ballsWrap.className = "saved-item__balls";
        for (const n of item.nums) {
          const b = document.createElement("div");
          b.className = "ball";
          b.textContent = String(n);
          ballsWrap.appendChild(b);
        }
        left.appendChild(ballsWrap);

        const right = document.createElement("div");
        const del = document.createElement("button");
        del.type = "button";
        del.className = "icon-mini";
        del.setAttribute("aria-label", "Remover este jogo salvo");
        del.textContent = "🗑 Remover";
        del.addEventListener("click", () => removeSaved(item.id));
        right.appendChild(del);

        row.appendChild(left);
        row.appendChild(right);
        savedList.appendChild(row);
      }
    }

    btnClearAll.disabled = total === 0;
    btnPrevPage.disabled = state.savedPage <= 1;
    btnNextPage.disabled = state.savedPage >= totalPages;

    pageInfo.textContent = total
      ? `Página ${state.savedPage} de ${totalPages} • ${total} salvo(s)`
      : `Página 1 de 1 • 0 salvo(s)`;
  }

  function renderChips(el, nums) {
    el.innerHTML = "";
    if (!nums || !nums.length) {
      const sp = document.createElement("div");
      sp.className = "empty-hint";
      sp.textContent = "—";
      el.appendChild(sp);
      return;
    }
    for (const n of nums) {
      const c = document.createElement("div");
      c.className = "chip";
      c.textContent = String(n);
      el.appendChild(c);
    }
  }

  /* ==========
     GENERATION (inclui fixos)
  ========== */
  function getActiveWeightsForMode() {
    const lot = LOTTERIES[state.prefs.lotteryId];

    if (state.prefs.mode === "prob_last") {
      const pack = state.prob.last;
      if (pack && pack.lotteryId === lot.id && pack.weights) return pack.weights;
      return null;
    }
    if (state.prefs.mode === "prob_7") {
      const pack = state.prob.seven;
      if (pack && pack.lotteryId === lot.id && pack.weights) return pack.weights;
      return null;
    }
    if (state.prefs.mode === "online_trends") {
      const pack = state.prob.online;
      if (pack && pack.lotteryId === lot.id && pack.weights) return pack.weights;
      return null;
    }
    return null;
  }

  function generateOne() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    if (!lot) return [];

    const fixed = Array.isArray(state.prefs.fixedNumbers) ? state.prefs.fixedNumbers : [];
    const fixedSet = new Set(fixed);

    // garante que fixos ainda são válidos para a loteria atual
    for (const n of fixed) {
      if (!(n >= 1 && n <= lot.max)) {
        toast("Alguns fixos ficaram fora do intervalo desta loteria. Reaplique os fixos.");
        break;
      }
    }
    if (fixed.length >= lot.pick) {
      toast(`Fixos demais. Deixe no máximo ${lot.pick - 1}.`);
      return sampleUniqueUniform(lot.pick, lot.max);
    }

    const remaining = lot.pick - fixed.length;

    if (remaining <= 0) return fixed.slice(0, lot.pick).sort((a, b) => a - b);

    if (state.prefs.mode === "rng") {
      const rest = sampleUniqueUniform(remaining, lot.max, fixedSet);
      return fixed.concat(rest).sort((a, b) => a - b);
    }

    const weights = getActiveWeightsForMode();
    if (!weights) {
      toast("Sem dados analisados para este modo. Use RNG, cole resultados ou busque Online.");
      const rest = sampleUniqueUniform(remaining, lot.max, fixedSet);
      return fixed.concat(rest).sort((a, b) => a - b);
    }

    const pickedAll = weightedPickUnique(weights, lot.pick, lot.max, fixedSet);
    return pickedAll;
  }

  function generateMany(qty) {
    const out = [];
    for (let i = 0; i < qty; i++) out.push(generateOne());
    return out;
  }

  /* ==========
     COPY / SAVE / PRINT
  ========== */
  function formatNumber(n, twoDigits) {
    if (!twoDigits) return String(n);
    return String(n).padStart(2, "0");
  }

  async function copyGenerated() {
    if (!state.generated.length) return;

    const two = !!state.prefs.copyTwoDigits;
    const lines = state.generated.map(nums => nums.map(n => formatNumber(n, two)).join(" "));
    const text = lines.join("\n");

    try {
      await navigator.clipboard.writeText(text);
      toast("Copiado para a área de transferência.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast("Copiado para a área de transferência.");
      } catch {
        toast("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  function persistSaved() { safeSet(LS_KEYS.saved, state.saved); }

  function saveGenerated() {
    if (!state.generated.length) return;

    const now = Date.now();
    const batch = state.generated.map(nums => ({
      id: `${now}-${Math.random().toString(16).slice(2)}`,
      ts: now,
      lotteryId: state.prefs.lotteryId,
      mode: state.prefs.mode,
      nums: nums.slice()
    }));

    state.saved.unshift(...batch);
    persistSaved();
    state.savedPage = 1;
    renderSaved();
    toast(`Salvo: ${batch.length} jogo(s).`);
  }

  function removeSaved(id) {
    state.saved = state.saved.filter(x => x.id !== id);
    persistSaved();
    renderSaved();
    toast("Removido.");
  }

  function clearAllSaved() {
    state.saved = [];
    persistSaved();
    state.savedPage = 1;
    renderSaved();
    toast("Tudo limpo.");
  }

  function buildPrintDocument() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    const when = new Date();

    const title = "Takara";
    const meta =
      `Data/hora: ${when.toLocaleString()} • ` +
      `Loteria: ${lot.label} • ` +
      `Modo: ${modeLabel(state.prefs.mode)} • ` +
      (state.prefs.fixedNumbers?.length ? `Fixos: ${state.prefs.fixedNumbers.join(", ")}` : "Fixos: —");

    const gen = state.generated.slice();

    const div = document.createElement("div");

    const h1 = document.createElement("h1");
    h1.className = "print-title";
    h1.textContent = title;
    div.appendChild(h1);

    const p = document.createElement("p");
    p.className = "print-meta";
    p.textContent = meta;
    div.appendChild(p);

    const block = document.createElement("div");
    block.className = "print-block";
    const h3 = document.createElement("h3");
    h3.textContent = "Jogos gerados";
    block.appendChild(h3);

    for (const nums of gen) {
      const ln = document.createElement("div");
      ln.className = "print-line";
      ln.textContent = nums.join(" ");
      block.appendChild(ln);
    }
    div.appendChild(block);

    const disc = document.createElement("div");
    disc.className = "print-disclaimer";
    disc.textContent = "Ferramenta de entretenimento e apoio estatístico. Loteria é aleatória; não há garantia de ganhos.";
    div.appendChild(disc);

    return div;
  }

  function printGenerated() {
    if (!state.generated.length) return;
    printRoot.innerHTML = "";
    printRoot.appendChild(buildPrintDocument());
    window.print();
  }

  /* ==========
     ANALYZE LAST / 7
  ========== */
  function mapToObj(map) {
    const o = {};
    for (const [k, v] of map.entries()) o[String(k)] = v;
    return o;
  }

  function analyzeLast() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    const parsed = parseMultipleLines(pasteLast.value, 1, lot);

    if (!parsed.ok) {
      lastStatus.innerHTML = `<strong style="color:var(--bad)">⚠ ${escapeHtml(parsed.error)}</strong>`;
      state.prob.last = null;
      safeRemove(LS_KEYS.probLast);
      renderChips(lastHot, []);
      renderChips(lastCold, []);
      return;
    }

    const freq = buildFrequency(parsed.lines, lot);
    const { hot, cold } = hotColdFromFreq(freq, lot);
    const weights = buildWeights(freq, lot);

    state.prob.last = { lotteryId: lot.id, lines: parsed.lines, freq: mapToObj(freq), hot, cold, weights };
    safeSet(LS_KEYS.probLast, state.prob.last);

    lastStatus.innerHTML = `<strong>OK:</strong> 1 linha analisada para ${escapeHtml(lot.label)}.`;
    renderChips(lastHot, hot);
    renderChips(lastCold, cold);

    toast("Análise do último concurso pronta.");
  }

  function analyze7() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    const parsed = parseMultipleLines(paste7.value, 7, lot);

    if (!parsed.ok) {
      sevenStatus.innerHTML = `<strong style="color:var(--bad)">⚠ ${escapeHtml(parsed.error)}</strong>`;
      state.prob.seven = null;
      safeRemove(LS_KEYS.prob7);
      renderChips(sevenHot, []);
      renderChips(sevenCold, []);
      return;
    }

    const freq = buildFrequency(parsed.lines, lot);
    const { hot, cold } = hotColdFromFreq(freq, lot);
    const weights = buildWeights(freq, lot);

    state.prob.seven = { lotteryId: lot.id, lines: parsed.lines, freq: mapToObj(freq), hot, cold, weights };
    safeSet(LS_KEYS.prob7, state.prob.seven);

    sevenStatus.innerHTML = `<strong>OK:</strong> 7 linhas analisadas para ${escapeHtml(lot.label)}.`;
    renderChips(sevenHot, hot);
    renderChips(sevenCold, cold);

    toast("Análise dos últimos 7 concursos pronta.");
  }

  /* ==========
     LOAD / SAVE PREFS
  ========== */
  function loadSaved() {
    try {
      const raw = safeGet(LS_KEYS.saved);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr
        .filter(x => x && typeof x === "object" && Array.isArray(x.nums))
        .map(x => ({
          id: String(x.id || `${Date.now()}-${Math.random()}`),
          ts: Number(x.ts || Date.now()),
          lotteryId: String(x.lotteryId || "loto6"),
          mode: String(x.mode || "rng"),
          nums: x.nums.map(n => Number(n)).filter(n => Number.isFinite(n))
        }));
    } catch {
      return [];
    }
  }

  function loadPrefs() {
    try {
      const raw = safeGet(LS_KEYS.prefs);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return null;
      return p;
    } catch {
      return null;
    }
  }

  function persistPrefs() { safeSet(LS_KEYS.prefs, state.prefs); }

  function loadProbCaches() {
    try { const rawL = safeGet(LS_KEYS.probLast); if (rawL) state.prob.last = JSON.parse(rawL); } catch {}
    try { const raw7 = safeGet(LS_KEYS.prob7); if (raw7) state.prob.seven = JSON.parse(raw7); } catch {}
    try { const rawO = safeGet(LS_KEYS.online); if (rawO) state.prob.online = JSON.parse(rawO); } catch {}
  }

  /* ==========
     EVENTS
  ========== */
  function wireEvents() {
    themeToggle.addEventListener("click", toggleTheme);

    menuBtn.addEventListener("click", () => isMenuOpen() ? closeMenu() : openMenu());
    menuCloseBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    $$(".nav-item", sideMenu).forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        if (view) setView(view);
        closeMenu();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) closeMenu();
    });

    $$("[data-jump]").forEach(b => {
      b.addEventListener("click", () => {
        const v = b.getAttribute("data-jump");
        if (v) setView(v);
      });
    });

    lotterySelect.addEventListener("change", () => {
      state.prefs.lotteryId = lotterySelect.value;
      // Revalida fixos para nova loteria
      const lot = LOTTERIES[state.prefs.lotteryId];
      const fixed = (state.prefs.fixedNumbers || []).filter(n => n >= 1 && n <= lot.max).slice(0, lot.pick - 1);
      state.prefs.fixedNumbers = fixed;
      persistPrefs();
      renderFixedChips();
      toast(`Loteria: ${LOTTERIES[state.prefs.lotteryId].label}`);
    });

    modeSelect.addEventListener("change", () => {
      state.prefs.mode = modeSelect.value;
      persistPrefs();

      if (state.prefs.mode === "prob_last") setView("view-prob-last");
      if (state.prefs.mode === "prob_7") setView("view-prob-7");

      toast(`Modo: ${modeLabel(state.prefs.mode)}`);
    });

    qtyButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        qtyButtons.forEach(x => x.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        state.qty = Number(btn.getAttribute("data-qty")) || 1;
        toast(`Quantidade: ${state.qty}`);
      });
    });

    copyTwoDigits.addEventListener("change", () => {
      state.prefs.copyTwoDigits = !!copyTwoDigits.checked;
      persistPrefs();
    });

    btnApplyFixed.addEventListener("click", applyFixedFromInput);
    btnClearFixed.addEventListener("click", clearFixed);

    onlineLimit.addEventListener("change", () => {
      state.prefs.onlineLimit = Number(onlineLimit.value) || 50;
      persistPrefs();
    });
    btnFetchOnline.addEventListener("click", fetchOnlineHistory);

    btnGenerate.addEventListener("click", () => {
      state.generated = generateMany(state.qty);
      renderGenerated();
      toast(`Gerado: ${state.qty} jogo(s).`);
    });

    btnCopy.addEventListener("click", copyGenerated);
    btnSave.addEventListener("click", saveGenerated);
    btnPrint.addEventListener("click", printGenerated);

    btnClearAll.addEventListener("click", clearAllSaved);

    btnPrevPage.addEventListener("click", () => {
      state.savedPage = Math.max(1, state.savedPage - 1);
      renderSaved();
    });
    btnNextPage.addEventListener("click", () => {
      state.savedPage = state.savedPage + 1;
      renderSaved();
    });

    btnAnalyzeLast.addEventListener("click", analyzeLast);
    btnAnalyze7.addEventListener("click", analyze7);
  }

  function syncControlsFromState() {
    applyTheme(getPreferredTheme());

    lotterySelect.value = state.prefs.lotteryId;
    modeSelect.value = state.prefs.mode;
    copyTwoDigits.checked = !!state.prefs.copyTwoDigits;

    fixedNumbersInput.value = (state.prefs.fixedNumbers || []).join(", ");
    renderFixedChips();

    onlineLimit.value = String(state.prefs.onlineLimit || 50);

    qtyButtons.forEach(b => b.setAttribute("aria-pressed", "false"));
    const btn = qtyButtons.find(x => Number(x.getAttribute("data-qty")) === state.qty) || qtyButtons[0];
    btn.setAttribute("aria-pressed", "true");

    setView("view-generate");
  }

  function setActionEnabled(hasGenerated) {
    btnCopy.disabled = !hasGenerated;
    btnSave.disabled = !hasGenerated;
    btnPrint.disabled = !hasGenerated;
  }

  function init() {
    applyTheme(getPreferredTheme());

    const p = loadPrefs();
    if (p) {
      if (p.lotteryId && LOTTERIES[p.lotteryId]) state.prefs.lotteryId = p.lotteryId;
      if (p.mode && ["rng", "prob_last", "prob_7", "online_trends"].includes(p.mode)) state.prefs.mode = p.mode;
      if (typeof p.copyTwoDigits === "boolean") state.prefs.copyTwoDigits = p.copyTwoDigits;
      if (Array.isArray(p.fixedNumbers)) state.prefs.fixedNumbers = p.fixedNumbers.map(n => Number(n)).filter(Number.isFinite);
      if (Number.isFinite(Number(p.onlineLimit))) state.prefs.onlineLimit = Number(p.onlineLimit);
    }

    state.saved = loadSaved();
    loadProbCaches();

    state.qty = 1;

    wireEvents();
    syncControlsFromState();

    generatedArea.innerHTML = `<div class="empty-hint">Clique em <strong>Gerar</strong> para ver as combinações aqui.</div>`;
    setActionEnabled(false);

    renderSaved();

    toast("Pronto. Gere combinações, aplique fixos ou use probabilidade.");
  }

  init();

})();