(() => {
  "use strict";

  const LS_KEYS = {
    theme: "takara:theme",
    saved: "takara:saved:v1",
    prefs: "takara:prefs:v3",
    probLast: "takara:prob:last:v2",
    prob7: "takara:prob:7:v2",
    online: "takara:prob:online:v1",
    epnHistory: "takara:epn:history:v1",
    epnModel: "takara:epn:model:v1"
  };

  const SAVED_PAGE_SIZE = 10;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LOTTERIES = {
    loto6: { id: "loto6", label: "Loto 6", pick: 6, max: 43, hotColdTop: 6 },
    loto7: { id: "loto7", label: "Loto 7", pick: 7, max: 37, hotColdTop: 7 },
    miniloto: { id: "miniloto", label: "Mini Loto", pick: 5, max: 31, hotColdTop: 5 }
  };

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
      mode: "rng",
      copyTwoDigits: false,
      fixedNumbers: [],
      onlineLimit: 50,
      waShort: false
    },
    prob: {
      last: null,   // { lotteryId, weights, hot, cold, ts }
      seven: null,  // { lotteryId, weights, hot, cold, ts }
      online: null
    },
    epn: { history: [], model: null, games: [] }
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

  const probSummary = $("#probSummary");
  const probSummaryStatus = $("#probSummaryStatus");
  const probHot = $("#probHot");
  const probCold = $("#probCold");
  const btnGoAnalyze = $("#btnGoAnalyze");

  const fixedNumbersInput = $("#fixedNumbers");
  const btnApplyFixed = $("#btnApplyFixed");
  const btnClearFixed = $("#btnClearFixed");
  const fixedChips = $("#fixedChips");

  const onlineLimit = $("#onlineLimit");
  const btnFetchOnline = $("#btnFetchOnline");
  const onlineStatus = $("#onlineStatus");

  const waShort = $("#waShort");
  const btnWhatsApp = $("#btnWhatsApp");

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

  // EPN Forecast
  const epnHistory = $("#epnHistory");
  const epnWindow = $("#epnWindow");
  const epnPool = $("#epnPool");
  const btnEpnAnalyze = $("#btnEpnAnalyze");
  const btnEpnGenerate = $("#btnEpnGenerate");
  const btnEpnBacktest = $("#btnEpnBacktest");
  const epnStatus = $("#epnStatus");
  const epnRanking = $("#epnRanking");
  const epnConfidence = $("#epnConfidence");
  const epnGames = $("#epnGames");
  const epnCost = $("#epnCost");
  const epnProof = $("#epnProof");

  /* ==========
     STORAGE
  ========== */
  function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeSet(key, value) {
    try {
      const v = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, v);
    } catch {}
  }
  function safeRemove(key) { try { localStorage.removeItem(key); } catch {} }

  /* ==========
     HELPERS
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
    if (mode === "epn_forecast") return "Modo EPN • Previsão + carteira";
    return mode;
  }

  function lotteryLabel(lotteryId) {
    return LOTTERIES[lotteryId]?.label || "Loteria";
  }

  /* ==========
     THEME
  ========== */
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
     PARSING
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
     FIXED NUMBERS
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
    if (!nums.length) { btnClearFixed.disabled = true; return; }
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
    if (!parsed.ok) { toast(parsed.error); return; }
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

    const top = lottery.hotColdTop;

    const hot = all.slice()
      .sort((a, b) => (b.c - a.c) || (a.n - b.n))
      .slice(0, top)
      .map(x => x.n);

    const cold = all.slice()
      .sort((a, b) => (a.c - b.c) || (a.n - b.n))
      .slice(0, top)
      .map(x => x.n);

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
     CHIPS RENDER
  ========== */
  function renderChips(el, nums) {
    if (!el) return;
    el.innerHTML = "";
    if (!nums || !nums.length) {
      const sp = document.createElement("div");
      sp.className = "micro";
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
     PROB SUMMARY (na tela GERAR)
  ========== */
  function getProbPackForMode(mode) {
    const lotId = state.prefs.lotteryId;
    if (mode === "prob_last") return state.prob.last && state.prob.last.lotteryId === lotId ? state.prob.last : null;
    if (mode === "prob_7") return state.prob.seven && state.prob.seven.lotteryId === lotId ? state.prob.seven : null;
    if (mode === "online_trends") return state.prob.online && state.prob.online.lotteryId === lotId ? state.prob.online : null;
    return null;
  }

  function updateProbSummaryUI() {
    const mode = state.prefs.mode;
    const lot = LOTTERIES[state.prefs.lotteryId];

    const shouldShow = (mode === "prob_last" || mode === "prob_7" || mode === "online_trends");
    if (!probSummary) return;

    if (!shouldShow) {
      probSummary.hidden = true;
      return;
    }

    probSummary.hidden = false;

    const pack = getProbPackForMode(mode);

    if (!pack) {
      probSummaryStatus.textContent =
        (mode === "online_trends")
          ? "Status: histórico ainda não carregado. Clique em “Buscar histórico agora”."
          : "Status: análise ainda não feita. Clique em “Abrir análise” e toque em “Analisar”.";
      renderChips(probHot, []);
      renderChips(probCold, []);
      return;
    }

    const ts = pack.ts ? new Date(pack.ts).toLocaleString() : "";
    probSummaryStatus.textContent =
      `Status: análise pronta para ${lot.label}${ts ? " • " + ts : ""}.`;

    renderChips(probHot, pack.hot || []);
    renderChips(probCold, pack.cold || []);
  }

  function openAnalyzeForCurrentMode() {
    if (state.prefs.mode === "prob_last") setView("view-prob-last");
    else if (state.prefs.mode === "prob_7") setView("view-prob-7");
    else if (state.prefs.mode === "epn_forecast") setView("view-forecast");
    else if (state.prefs.mode === "online_trends") {
      // Online é no gerar mesmo, mas deixamos o botão apontar para o topo e reforçar a ação
      toast("Para Online: clique em “Buscar histórico agora” e depois em “Gerar”.");
    } else {
      setView("view-generate");
    }
  }

  /* ==========
     ONLINE (experimental)
  ========== */
  function mapToObj(map) {
    const o = {};
    for (const [k, v] of map.entries()) o[String(k)] = v;
    return o;
  }

  function parseHistoryFromHtml(html, lottery, limit) {
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
    const limit = Number(onlineLimit?.value) || 50;
    state.prefs.onlineLimit = limit;
    persistPrefs();

    if (onlineStatus) onlineStatus.innerHTML = `<strong>Buscando histórico...</strong>`;
    if (btnFetchOnline) btnFetchOnline.disabled = true;

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

      if (!lines.length) throw new Error("Não consegui extrair números do histórico (CORS ou layout mudou).");

      const freq = buildFrequency(lines, lot);
      const { hot, cold } = hotColdFromFreq(freq, lot);
      const weights = buildWeights(freq, lot);

      state.prob.online = { lotteryId: lot.id, linesCount: lines.length, freq: mapToObj(freq), weights, hot, cold, ts: Date.now(), limit };
      safeSet(LS_KEYS.online, state.prob.online);

      if (onlineStatus) onlineStatus.innerHTML = `<strong>OK:</strong> histórico carregado (${lines.length} concursos).`;
      toast("Histórico online pronto (tendências).");

      updateProbSummaryUI();
    } catch (err) {
      if (onlineStatus) {
        onlineStatus.innerHTML =
          `<strong style="color:var(--bad)">⚠ Online falhou:</strong> ${escapeHtml(err?.message || "erro")}<br>` +
          `<span class="micro">Alguns sites bloqueiam leitura por CORS. Use colagem (último / 7).</span>`;
      }
      toast("Online falhou. Use colagem de resultados.");
      updateProbSummaryUI();
    } finally {
      if (btnFetchOnline) btnFetchOnline.disabled = false;
    }
  }


  /* ================================
     EPN • EQUAÇÃO DE PREVISÃO NUMÉRICA
     Score experimental. Não altera a probabilidade física de um sorteio justo.
  ================================= */
  function parseEpnHistory(text, lottery) {
    // Formato simples: exatamente os números sorteados, uma linha por concurso.
    // A ordem das linhas é a ordem do tempo: mais antigo em cima, mais recente embaixo.
    const lines = String(text || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const rows = [];
    for (const line of lines) {
      const raw = extractNumbers(line).map(n => Math.trunc(n));
      if (raw.length !== lottery.pick) continue;
      if (!raw.every(n => n >= 1 && n <= lottery.max)) continue;
      const unique = Array.from(new Set(raw));
      if (unique.length !== lottery.pick) continue;
      rows.push(unique.sort((a,b)=>a-b));
    }
    return rows;
  }

  function mean(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0; }
  function std(arr) {
    if (!arr.length) return 1;
    const m = mean(arr);
    return Math.sqrt(mean(arr.map(x => (x-m)*(x-m)))) || 1;
  }
  function normalizeVector(values, max) {
    const xs=[]; for(let n=1;n<=max;n++) xs.push(values[n] || 0);
    const m=mean(xs), s=std(xs);
    const out=new Array(max+1).fill(0);
    for(let n=1;n<=max;n++) out[n]=((values[n]||0)-m)/s;
    return out;
  }

  function buildEpnModel(lines, lottery, mainWindow=50) {
    const N=lines.length, max=lottery.max, pick=lottery.pick;
    if (!N) return null;
    const baseline=pick/max;
    const windows=[5,10,20,Math.max(20,Number(mainWindow)||50),100].map(w=>Math.min(w,N));
    const uniqueWindows=Array.from(new Set(windows.filter(w=>w>0)));
    const recencyRaw=new Array(max+1).fill(0);
    const longRaw=new Array(max+1).fill(0);
    const gapRaw=new Array(max+1).fill(0);
    const transitionRaw=new Array(max+1).fill(0);
    const stabilityRaw=new Array(max+1).fill(0);
    const counts=new Array(max+1).fill(0);

    for (const draw of lines) for (const n of draw) counts[n]++;

    // Multi-scale recency: shrink empirical rate toward fair baseline.
    const scaleWeights=[1.35,1.15,1.0,.85,.65];
    for(let n=1;n<=max;n++){
      let acc=0, den=0;
      uniqueWindows.forEach((w,idx)=>{
        let hit=0; for(let i=N-w;i<N;i++) if(lines[i].includes(n)) hit++;
        const priorStrength=24;
        const smoothed=(hit + baseline*priorStrength)/(w+priorStrength);
        const sw=scaleWeights[Math.min(idx,scaleWeights.length-1)];
        acc += sw*(smoothed-baseline); den += sw;
      });
      recencyRaw[n]=den?acc/den:0;
      const priorStrength=80;
      const lifetime=(counts[n]+baseline*priorStrength)/(N+priorStrength);
      longRaw[n]=lifetime-baseline;

      let gap=N;
      for(let i=N-1;i>=0;i--){ if(lines[i].includes(n)){gap=N-1-i;break;} }
      // Moderate gaps get a small signal, extreme gaps are penalized to avoid gambler's fallacy.
      const expectedGap=(1-baseline)/baseline;
      const ratio=(gap-expectedGap)/(expectedGap+1);
      gapRaw[n]=Math.exp(-Math.abs(ratio))*0.5 - Math.min(Math.abs(ratio),2)*0.08;

      // Empirical next-draw persistence for each number with shrinkage.
      let prevCount=0,nextHit=0;
      for(let i=0;i<N-1;i++) if(lines[i].includes(n)){prevCount++; if(lines[i+1].includes(n)) nextHit++;}
      const ps=35;
      const trans=(nextHit+baseline*ps)/(prevCount+ps);
      const lastPresent=lines[N-1].includes(n) ? 1 : 0;
      transitionRaw[n]=lastPresent ? (trans-baseline) : 0;

      // Stability rewards numbers whose rates do not wildly depend on one tiny window.
      const rates=[];
      for(const w of uniqueWindows){ let h=0;for(let i=N-w;i<N;i++)if(lines[i].includes(n))h++;rates.push(h/w); }
      stabilityRaw[n]= -std(rates);
    }

    const zr=normalizeVector(recencyRaw,max), zl=normalizeVector(longRaw,max), zg=normalizeVector(gapRaw,max),
          zt=normalizeVector(transitionRaw,max), zs=normalizeVector(stabilityRaw,max);

    const raw=new Array(max+1).fill(0);
    for(let n=1;n<=max;n++){
      // EPN v1 weights: intentionally conservative. Backtest decides whether they deserve trust.
      raw[n]=0.38*zr[n] + 0.22*zl[n] + 0.12*zg[n] + 0.16*zt[n] + 0.12*zs[n];
    }
    const vals=raw.slice(1), lo=Math.min(...vals), hi=Math.max(...vals);
    const score=new Array(max+1).fill(0);
    for(let n=1;n<=max;n++) score[n]=hi===lo?50:100*(raw[n]-lo)/(hi-lo);

    // Bayesian-smoothed empirical rate used as model estimate, not physical probability.
    const estimatedRate=new Array(max+1).fill(baseline);
    const w=Math.min(Number(mainWindow)||50,N), prior=50;
    for(let n=1;n<=max;n++){
      let h=0;for(let i=N-w;i<N;i++)if(lines[i].includes(n))h++;
      estimatedRate[n]=(h+baseline*prior)/(w+prior);
    }

    const ranking=Array.from({length:max},(_,i)=>i+1).sort((a,b)=>score[b]-score[a] || a-b);
    const spread=std(raw.slice(1));
    const confidence=Math.max(0,Math.min(100, Math.round(35 + Math.min(N,500)/500*30 + Math.min(spread,1.5)/1.5*20)));
    return { lotteryId:lottery.id, score, raw, estimatedRate, ranking, baseline, linesCount:N, confidence, mainWindow:Number(mainWindow)||50, ts:Date.now() };
  }

  function comboShapeScore(nums, model, lottery) {
    const sum=nums.reduce((a,b)=>a+b,0);
    const odd=nums.filter(n=>n%2).length;
    const idealOdd=lottery.pick/2;
    const expectedSum=lottery.pick*(lottery.max+1)/2;
    const spread=nums[nums.length-1]-nums[0];
    const buckets=new Set(nums.map(n=>Math.floor((n-1)/10))).size;
    const consecutive=nums.slice(1).filter((n,i)=>n===nums[i]+1).length;
    const epn=mean(nums.map(n=>model.score[n]));
    let shape=epn;
    shape -= Math.abs(sum-expectedSum)*0.18;
    shape -= Math.abs(odd-idealOdd)*2.6;
    shape += Math.min(spread,lottery.max*.72)*0.12;
    shape += buckets*1.6;
    if(consecutive<=1) shape += .8; else shape -= consecutive*1.3;
    return shape;
  }

  function epnWeightedSample(model, lottery, poolSize) {
    const pool=model.ranking.slice(0,Math.max(lottery.pick,Math.min(poolSize,lottery.max)));
    const chosen=[];
    while(chosen.length<lottery.pick){
      let total=0; for(const n of pool) if(!chosen.includes(n)) total += 1 + Math.pow(model.score[n]/100,1.7)*8;
      let r=Math.random()*total, picked=null;
      for(const n of pool){ if(chosen.includes(n)) continue; r -= 1 + Math.pow(model.score[n]/100,1.7)*8; if(r<=0){picked=n;break;} }
      if(picked==null) picked=pool.find(n=>!chosen.includes(n));
      chosen.push(picked);
    }
    return chosen.sort((a,b)=>a-b);
  }

  function buildEpnPortfolio(model, lottery, qty=3, poolSize=12) {
    const candidates=[], seen=new Set();
    for(let i=0;i<7000;i++){
      const nums=epnWeightedSample(model,lottery,poolSize), key=nums.join('-');
      if(seen.has(key)) continue; seen.add(key);
      candidates.push({nums, base:comboShapeScore(nums,model,lottery)});
    }
    candidates.sort((a,b)=>b.base-a.base);
    const selected=[];
    while(selected.length<qty && candidates.length){
      let best=null,bestV=-Infinity;
      for(const c of candidates){
        if(selected.includes(c)) continue;
        let penalty=0;
        for(const s of selected){
          const ov=c.nums.filter(n=>s.nums.includes(n)).length;
          penalty += ov*ov*3.4;
        }
        // Reward new high-ranked coverage across the portfolio.
        const used=new Set(selected.flatMap(s=>s.nums));
        const fresh=c.nums.filter(n=>!used.has(n));
        const coverageBonus=mean(fresh.map(n=>model.score[n]))*(fresh.length/lottery.pick)*0.16;
        const v=c.base-penalty+coverageBonus;
        if(v>bestV){bestV=v;best=c;}
      }
      if(!best)break; selected.push(best);
    }
    return selected.map(x=>x.nums);
  }

  function renderEpnModel(model) {
    if(!model || !epnRanking) return;
    const top=model.ranking.slice(0,12);
    epnRanking.innerHTML=top.map((n,i)=>{
      const rate=(model.estimatedRate[n]*100).toFixed(2);
      return `<div class="epn-rank-row">
        <div class="epn-rank-num">${String(n).padStart(2,'0')}</div>
        <div><strong>#${i+1} • sinal EPN</strong><div class="epn-bar"><span style="width:${model.score[n].toFixed(1)}%"></span></div></div>
        <div class="epn-score">${model.score[n].toFixed(1)}<small>taxa mod. ${rate}%</small></div>
      </div>`;
    }).join('');
    if(epnConfidence) epnConfidence.textContent=`Qualidade do sinal ${model.confidence}/100`;
  }

  function analyzeEpn() {
    const lot=LOTTERIES[state.prefs.lotteryId];
    const lines=parseEpnHistory(epnHistory?.value || '',lot);
    if(lines.length<10){
      epnStatus.innerHTML=`<strong style="color:var(--bad)">⚠ Cole pelo menos 10 linhas válidas, com exatamente ${lot.pick} números por linha.</strong>`;
      return;
    }
    const model=buildEpnModel(lines,lot,Number(epnWindow?.value)||50);
    state.epn.history=lines; state.epn.model=model; state.epn.games=[];
    safeSet(LS_KEYS.epnHistory, epnHistory.value);
    safeSet(LS_KEYS.epnModel, {lotteryId:lot.id, linesCount:lines.length, mainWindow:model.mainWindow, ts:model.ts});
    renderEpnModel(model);
    if(btnEpnGenerate) btnEpnGenerate.disabled=false;
    const games=buildEpnPortfolio(model,lot,3,Number(epnPool?.value)||12);
    state.epn.games=games; renderEpnGames(games);
    state.generated=games.map(g=>g.slice());
    renderGenerated();
    if(epnStatus) epnStatus.innerHTML=`<strong>Previsão pronta:</strong> ${lines.length} concursos analisados • baseline por número ${(model.baseline*100).toFixed(2)}% • 3 jogos gerados automaticamente.`;
    toast('Análise concluída. Ranking EPN e 3 jogos prontos.');
    updateProbSummaryUI();
  }

  function renderEpnGames(games) {
    if(!epnGames)return;
    if(!games.length){epnGames.innerHTML='<div class="micro">Nenhuma carteira gerada.</div>';return;}
    epnGames.innerHTML=games.map((g,i)=>`<div class="epn-game"><div class="epn-game__label">Jogo ${i+1}</div><div class="epn-game__balls">${g.map(n=>`<span class="epn-game__ball">${String(n).padStart(2,'0')}</span>`).join('')}</div></div>`).join('');
    if(epnCost) epnCost.textContent=`${games.length} jogos • custo: ¥${games.length*200} • objetivo: cobertura, não garantia.`;
  }

  function generateEpnGames() {
    const lot=LOTTERIES[state.prefs.lotteryId];
    if(!state.epn.model || state.epn.model.lotteryId!==lot.id){ toast('Faça a análise EPN para a loteria selecionada.'); return []; }
    const games=buildEpnPortfolio(state.epn.model,lot,3,Number(epnPool?.value)||12);
    state.epn.games=games; renderEpnGames(games);
    state.generated=games.map(g=>g.slice());
    renderGenerated();
    toast('Carteira EPN de 3 jogos pronta.');
    return games;
  }

  function hypergeomVariance(N,K,n){
    const p=K/N; return n*p*(1-p)*((N-n)/(N-1));
  }

  function runEpnBacktest() {
    const lot=LOTTERIES[state.prefs.lotteryId];
    const lines=parseEpnHistory(epnHistory?.value || '',lot);
    const minTrain=Math.max(25,Math.min(60,Math.floor(lines.length*.25)));
    if(lines.length<minTrain+10){
      epnProof.innerHTML='<div class="proof-state proof-state--neutral">Carregue pelo menos 35–70 concursos para um backtest útil. Ideal: centenas.</div>';
      return;
    }
    let trials=0,totalHits=0,hit4=0,hit5=0,hit6=0;
    for(let i=minTrain;i<lines.length;i++){
      const train=lines.slice(0,i), target=new Set(lines[i]);
      const model=buildEpnModel(train,lot,Math.min(Number(epnWindow?.value)||50,train.length));
      const pick=model.ranking.slice(0,lot.pick);
      const h=pick.filter(n=>target.has(n)).length;
      totalHits+=h; trials++; if(h>=4)hit4++; if(h>=5)hit5++; if(h>=6)hit6++;
    }
    const observed=totalHits/trials;
    const expected=lot.pick*lot.pick/lot.max;
    const variance=hypergeomVariance(lot.max,lot.pick,lot.pick);
    const se=Math.sqrt(variance/trials)||1;
    const z=(observed-expected)/se;
    const advantage=(observed/expected-1)*100;
    const strong=(z>=2 && advantage>0);
    const stateClass=strong?'proof-state--good':(advantage>0?'proof-state--neutral':'proof-state--bad');
    const verdict=strong?'Sinal estatístico acima do baseline detectado. Ainda exige validação fora da amostra.':(advantage>0?'Há vantagem observada, mas ainda sem força estatística suficiente.':'A EPN não superou o baseline neste histórico.');
    epnProof.innerHTML=`<div class="proof-state ${stateClass}">${verdict}</div>
      <div class="proof-metrics">
        <div class="proof-metric"><span>Backtests</span><strong>${trials}</strong></div>
        <div class="proof-metric"><span>Acertos médios</span><strong>${observed.toFixed(3)}</strong></div>
        <div class="proof-metric"><span>Baseline</span><strong>${expected.toFixed(3)}</strong></div>
        <div class="proof-metric"><span>Diferença</span><strong>${advantage>=0?'+':''}${advantage.toFixed(1)}%</strong></div>
        <div class="proof-metric"><span>z-score</span><strong>${z.toFixed(2)}</strong></div>
        <div class="proof-metric"><span>4+ / 5+ / 6</span><strong>${hit4} / ${hit5} / ${hit6}</strong></div>
      </div>`;
    if(epnStatus) epnStatus.innerHTML=`Backtest concluído: ${trials} previsões sem olhar o futuro.`;
  }

  /* ==========
     GENERATION
  ========== */
  function getActiveWeightsForMode() {
    const lotId = state.prefs.lotteryId;
    if (state.prefs.mode === "prob_last") return state.prob.last && state.prob.last.lotteryId === lotId ? state.prob.last.weights : null;
    if (state.prefs.mode === "prob_7") return state.prob.seven && state.prob.seven.lotteryId === lotId ? state.prob.seven.weights : null;
    if (state.prefs.mode === "online_trends") return state.prob.online && state.prob.online.lotteryId === lotId ? state.prob.online.weights : null;
    if (state.prefs.mode === "epn_forecast") {
      const m=state.epn.model;
      if(!m || m.lotteryId!==lotId) return null;
      const weights=new Array(LOTTERIES[lotId].max+1).fill(1);
      for(let n=1;n<weights.length;n++) weights[n]=1+Math.pow(m.score[n]/100,1.7)*7;
      return weights;
    }
    return null;
  }

  function generateOne() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    if (!lot) return [];

    const fixed = Array.isArray(state.prefs.fixedNumbers) ? state.prefs.fixedNumbers : [];
    const fixedSet = new Set(fixed);
    const remaining = lot.pick - fixed.length;

    if (remaining <= 0) return fixed.slice(0, lot.pick).sort((a, b) => a - b);

    if (state.prefs.mode === "rng") {
      const rest = sampleUniqueUniform(remaining, lot.max, fixedSet);
      return fixed.concat(rest).sort((a, b) => a - b);
    }

    const weights = getActiveWeightsForMode();
    if (!weights) {
      // ✅ aqui é o “fechamento do fluxo”: sem análise = orienta o usuário
      toast("Antes de gerar nesse modo, faça a análise. Toque em “Abrir análise”.");
      updateProbSummaryUI();
      return fixed.concat(sampleUniqueUniform(remaining, lot.max, fixedSet)).sort((a, b) => a - b);
    }

    return weightedPickUnique(weights, lot.pick, lot.max, fixedSet);
  }

  function generateMany(qty) {
    const out = [];
    for (let i = 0; i < qty; i++) out.push(generateOne());
    return out;
  }

  /* ==========
     RENDER
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
    if (btnCopy) btnCopy.disabled = !hasGenerated;
    if (btnSave) btnSave.disabled = !hasGenerated;
    if (btnPrint) btnPrint.disabled = !hasGenerated;
    if (btnWhatsApp) btnWhatsApp.disabled = !hasGenerated;
  }

  function renderGenerated() {
    generatedArea.innerHTML = "";

    if (!state.generated.length) {
      const empty = document.createElement("div");
      empty.className = "micro";
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
        toast("Não foi possível copiar automaticamente. Copie manualmente.");
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

    const div = document.createElement("div");

    const h1 = document.createElement("h1");
    h1.className = "print-title";
    h1.textContent = "Takara";
    div.appendChild(h1);

    const p = document.createElement("p");
    p.className = "print-meta";
    p.textContent =
      `Data/hora: ${when.toLocaleString()} • ` +
      `Loteria: ${lot.label} • ` +
      `Modo: ${modeLabel(state.prefs.mode)} • ` +
      (state.prefs.fixedNumbers?.length ? `Fixos: ${state.prefs.fixedNumbers.join(", ")}` : "Fixos: —");
    div.appendChild(p);

    const block = document.createElement("div");
    block.className = "print-block";
    const h3 = document.createElement("h3");
    h3.textContent = "Jogos gerados";
    block.appendChild(h3);

    for (const nums of state.generated) {
      const ln = document.createElement("div");
      ln.className = "print-line";
      ln.textContent = nums.join(" ");
      block.appendChild(ln);
    }
    div.appendChild(block);

    const disc = document.createElement("div");
    disc.className = "print-disclaimer";
    disc.textContent = "Ferramenta de entretenimento e apoio estatístico. Loteria é Sorte; não há garantia de ganhos.";
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
     WHATSAPP SHARE
  ========== */
  function buildWhatsAppMessage() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    const when = new Date();
    const short = !!state.prefs.waShort;

    const header = short
      ? `🍀 Takara • ${lot.label}\n`
      : `🍀 Oi! Passei aqui para te mandar umas combinações geradas no Takara.\n` +
        `Que seja um dia leve, com boas vibrações e sorte sorrindo para você. ✨\n\n` +
        `🎱 ${lot.label} • ${modeLabel(state.prefs.mode)}\n`;

    const meta = short
      ? `${modeLabel(state.prefs.mode)} • ${when.toLocaleString()}\n`
      : `🕒 ${when.toLocaleString()}\n` +
        (state.prefs.fixedNumbers?.length ? `📌 Fixos: ${state.prefs.fixedNumbers.join(", ")}\n` : "");

    const games = state.generated
      .map((nums, i) => `Jogo ${i + 1}: ${nums.join(" ")}`)
      .join("\n");

    const footer = short
      ? `\n\n⚠️ Loteria é aleatória. Sem garantia.`
      : `\n\n🌟 Se quiser, escolhe 1 jogo e eu te mando também em PDF depois.\n` +
        `⚠️ Lembrete responsável: loteria é Sorte; não há garantia de ganhos.`;

    return `${header}${meta}\n${games}${footer}`;
  }

  function openWhatsAppShare() {
    if (!state.generated.length) return;
    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    toast("WhatsApp aberto com a mensagem pronta.");
  }

  /* ==========
     ANALYZE LAST / 7 (✅ agora preenche Quentes/Frios e o resumo na tela Gerar)
  ========== */
  function analyzeLast() {
    const lot = LOTTERIES[state.prefs.lotteryId];
    const parsed = parseMultipleLines(pasteLast.value, 1, lot);

    if (!parsed.ok) {
      lastStatus.innerHTML = `<strong style="color:var(--bad)">⚠ ${escapeHtml(parsed.error)}</strong>`;
      state.prob.last = null;
      safeRemove(LS_KEYS.probLast);
      renderChips(lastHot, []);
      renderChips(lastCold, []);
      updateProbSummaryUI();
      return;
    }

    const freq = buildFrequency(parsed.lines, lot);
    const { hot, cold } = hotColdFromFreq(freq, lot);
    const weights = buildWeights(freq, lot);

    state.prob.last = { lotteryId: lot.id, weights, hot, cold, ts: Date.now() };
    safeSet(LS_KEYS.probLast, state.prob.last);

    lastStatus.innerHTML = `<strong>OK:</strong> 1 linha analisada para ${escapeHtml(lot.label)}.`;
    renderChips(lastHot, hot);
    renderChips(lastCold, cold);

    toast("Análise do último concurso pronta. Agora gere usando o Modo B.");
    updateProbSummaryUI();
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
      updateProbSummaryUI();
      return;
    }

    const freq = buildFrequency(parsed.lines, lot);
    const { hot, cold } = hotColdFromFreq(freq, lot);
    const weights = buildWeights(freq, lot);

    state.prob.seven = { lotteryId: lot.id, weights, hot, cold, ts: Date.now() };
    safeSet(LS_KEYS.prob7, state.prob.seven);

    sevenStatus.innerHTML = `<strong>OK:</strong> 7 linhas analisadas para ${escapeHtml(lot.label)}.`;
    renderChips(sevenHot, hot);
    renderChips(sevenCold, cold);

    toast("Análise dos últimos 7 pronta. Agora gere usando o Modo C.");
    updateProbSummaryUI();
  }

  /* ==========
     SAVED
  ========== */
  function renderSaved() {
    savedList.innerHTML = "";

    const total = state.saved.length;
    const totalPages = Math.max(1, Math.ceil(total / SAVED_PAGE_SIZE));
    state.savedPage = Math.min(state.savedPage, totalPages);

    const start = (state.savedPage - 1) * SAVED_PAGE_SIZE;
    const items = state.saved.slice(start, start + SAVED_PAGE_SIZE);

    if (!total) {
      const empty = document.createElement("div");
      empty.className = "micro";
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

      const lot = LOTTERIES[state.prefs.lotteryId];
      state.prefs.fixedNumbers = (state.prefs.fixedNumbers || [])
        .filter(n => n >= 1 && n <= lot.max)
        .slice(0, lot.pick - 1);

      // A model trained for outra loteria não pode ser reaproveitado silenciosamente.
      if (state.epn.model && state.epn.model.lotteryId !== lot.id) {
        state.epn.model = null; state.epn.games = [];
        if (btnEpnGenerate) btnEpnGenerate.disabled = true;
        if (epnRanking) epnRanking.innerHTML = '<div class="micro">Faça uma nova análise EPN para esta loteria.</div>';
        renderEpnGames([]);
      }
      persistPrefs();
      renderFixedChips();
      updateProbSummaryUI();
      toast(`Loteria: ${lot.label}`);
    });

    modeSelect.addEventListener("change", () => {
      state.prefs.mode = modeSelect.value;
      persistPrefs();

      updateProbSummaryUI();

      if (state.prefs.mode === "prob_last") setView("view-prob-last");
      if (state.prefs.mode === "prob_7") setView("view-prob-7");
      if (state.prefs.mode === "epn_forecast") setView("view-forecast");

      toast(`Modo: ${modeLabel(state.prefs.mode)}`);
    });

    btnGoAnalyze?.addEventListener("click", openAnalyzeForCurrentMode);

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

    waShort.addEventListener("change", () => {
      state.prefs.waShort = !!waShort.checked;
      persistPrefs();
    });

    btnApplyFixed.addEventListener("click", applyFixedFromInput);
    btnClearFixed.addEventListener("click", clearFixed);

    onlineLimit?.addEventListener("change", () => {
      state.prefs.onlineLimit = Number(onlineLimit.value) || 50;
      persistPrefs();
      updateProbSummaryUI();
    });
    btnFetchOnline?.addEventListener("click", fetchOnlineHistory);

    btnGenerate.addEventListener("click", () => {
      if(state.prefs.mode === "epn_forecast") {
        if(!state.epn.model){ setView("view-forecast"); toast("Faça a análise EPN antes de gerar."); return; }
        const lot=LOTTERIES[state.prefs.lotteryId];
        state.generated=buildEpnPortfolio(state.epn.model,lot,state.qty,Number(epnPool?.value)||12);
      } else {
        state.generated = generateMany(state.qty);
      }
      renderGenerated();
      toast(`Gerado: ${state.generated.length} jogo(s).`);
    });

    btnCopy.addEventListener("click", copyGenerated);
    btnSave.addEventListener("click", saveGenerated);
    btnPrint.addEventListener("click", printGenerated);
    btnWhatsApp.addEventListener("click", openWhatsAppShare);

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

    btnEpnAnalyze?.addEventListener("click", analyzeEpn);
    btnEpnGenerate?.addEventListener("click", generateEpnGames);
    btnEpnBacktest?.addEventListener("click", runEpnBacktest);
  }

  function syncControlsFromState() {
    applyTheme(getPreferredTheme());

    lotterySelect.value = state.prefs.lotteryId;
    modeSelect.value = state.prefs.mode;
    copyTwoDigits.checked = !!state.prefs.copyTwoDigits;

    fixedNumbersInput.value = (state.prefs.fixedNumbers || []).join(", ");
    renderFixedChips();

    if (onlineLimit) onlineLimit.value = String(state.prefs.onlineLimit || 50);
    waShort.checked = !!state.prefs.waShort;

    qtyButtons.forEach(b => b.setAttribute("aria-pressed", "false"));
    const btn = qtyButtons.find(x => Number(x.getAttribute("data-qty")) === state.qty) || qtyButtons[0];
    btn.setAttribute("aria-pressed", "true");

    setView("view-generate");
    updateProbSummaryUI();
  }

  function init() {
    applyTheme(getPreferredTheme());

    const p = loadPrefs();
    if (p) {
      if (p.lotteryId && LOTTERIES[p.lotteryId]) state.prefs.lotteryId = p.lotteryId;
      if (p.mode && ["rng", "prob_last", "prob_7", "online_trends", "epn_forecast"].includes(p.mode)) state.prefs.mode = p.mode;
      if (typeof p.copyTwoDigits === "boolean") state.prefs.copyTwoDigits = p.copyTwoDigits;
      if (Array.isArray(p.fixedNumbers)) state.prefs.fixedNumbers = p.fixedNumbers.map(n => Number(n)).filter(Number.isFinite);
      if (Number.isFinite(Number(p.onlineLimit))) state.prefs.onlineLimit = Number(p.onlineLimit);
      if (typeof p.waShort === "boolean") state.prefs.waShort = p.waShort;
    }

    state.saved = loadSaved();
    loadProbCaches();

    if (epnHistory) {
      const savedEpnHistory=safeGet(LS_KEYS.epnHistory);
      if(savedEpnHistory) epnHistory.value=savedEpnHistory;
    }

    state.qty = 1;

    wireEvents();
    syncControlsFromState();

    generatedArea.innerHTML = `<div class="micro">Clique em <strong>Gerar</strong> para ver as combinações aqui.</div>`;
    setActionEnabled(false);

    renderSaved();

    toast("Pronto. Use a Previsão EPN para análise, carteira e backtest temporal.");
  }

  init();
})();