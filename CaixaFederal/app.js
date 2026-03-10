(() => {
  "use strict";

  const LS_KEYS = {
    theme: "takaraBR:theme",
    saved: "takaraBR:saved:v1",
    prefs: "takaraBR:prefs:v1",
    probLast: "takaraBR:prob:last:v1",
    prob7: "takaraBR:prob:7:v1",
    online: "takaraBR:prob:online:v1"
  };

  const SAVED_PAGE_SIZE = 10;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ✅ Loterias CAIXA (numéricas/únicas)
  const LOTTERIES = {
    megasena:  { id:"megasena",  label:"Mega-Sena",  pick:6,  max:60,  hotColdTop:6,  endpoint:"megasena" },
    quina:     { id:"quina",     label:"Quina",     pick:5,  max:80,  hotColdTop:5,  endpoint:"quina" },
    lotofacil: { id:"lotofacil", label:"Lotofácil", pick:15, max:25,  hotColdTop:15, endpoint:"lotofacil" },
    lotomania: { id:"lotomania", label:"Lotomania", pick:50, max:100, hotColdTop:50, endpoint:"lotomania" },
    duplasena: { id:"duplasena", label:"Dupla Sena",pick:6,  max:50,  hotColdTop:6,  endpoint:"duplasena" },
    timemania: { id:"timemania", label:"Timemania", pick:7,  max:80,  hotColdTop:7,  endpoint:"timemania" },
    diadesorte:{ id:"diadesorte",label:"Dia de Sorte",pick:7,max:31,  hotColdTop:7,  endpoint:"diadesorte" },
  };

  // ✅ Endpoints CAIXA (JSON)
  const CAIXA_BASE = "https://servicebus2.caixa.gov.br/portaldeloterias/api/";

  const state = {
    viewId: "view-generate",
    qty: 1,
    generated: [],
    saved: [],
    savedPage: 1,
    theme: null,
    prefs: {
      lotteryId: "megasena",
      mode: "rng", // rng | prob_last | prob_7 | online_trends
      copyTwoDigits: false,
      fixedNumbers: [],
      onlineLimit: 30,
      waShort: false
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

  /* STORAGE */
  function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeSet(key, value) {
    try {
      const v = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, v);
    } catch {}
  }
  function safeRemove(key) { try { localStorage.removeItem(key); } catch {} }

  /* HELPERS */
  function escapeHtml(s) {
    return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  }
  function toast(msg) {
    statusLine.innerHTML = msg ? `<strong>${escapeHtml(msg)}</strong>` : "";
    if (msg) {
      clearTimeout(toast._t);
      toast._t = setTimeout(() => { statusLine.textContent = ""; }, 2600);
    }
  }
  function modeLabel(mode) {
    if (mode === "rng") return "Modo A • Aleatório (RNG)";
    if (mode === "prob_last") return "Modo B • Prob. (último concurso)";
    if (mode === "prob_7") return "Modo C • Prob. (últimos 7)";
    if (mode === "online_trends") return "Online (exp.) • Tendências (CAIXA)";
    return mode;
  }

  /* THEME */
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

  /* SPA VIEWS */
  function setView(viewId) {
    const current = $(".view.is-active");
    if (current) current.classList.remove("is-active");
    const next = $("#" + viewId);
    if (next) next.classList.add("is-active");
    state.viewId = viewId;
    $("#appMain")?.focus({ preventScroll:true });
  }

  /* MENU A11Y */
  let lastFocusedBeforeMenu = null;
  function isMenuOpen(){ return sideMenu.classList.contains("is-open"); }
  function onMenuKeydown(e){
    if (!isMenuOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); closeMenu(); return; }
    if (e.key === "Tab") {
      const focusables = $$(".nav-item, #menuCloseBtn", sideMenu).filter(el => !el.disabled);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus({preventScroll:true}); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus({preventScroll:true}); }
    }
  }
  function openMenu(){
    lastFocusedBeforeMenu = document.activeElement;
    sideMenu.classList.add("is-open");
    sideMenu.setAttribute("aria-hidden","false");
    overlay.hidden = false;
    menuBtn.setAttribute("aria-expanded","true");
    sideMenu.querySelector(".nav-item")?.focus({preventScroll:true});
    document.addEventListener("keydown", onMenuKeydown, true);
  }
  function closeMenu(){
    sideMenu.classList.remove("is-open");
    sideMenu.setAttribute("aria-hidden","true");
    overlay.hidden = true;
    menuBtn.setAttribute("aria-expanded","false");
    document.removeEventListener("keydown", onMenuKeydown, true);
    lastFocusedBeforeMenu?.focus?.({preventScroll:true});
  }

  /* RNG */
  function randInt(min, maxInclusive){
    const range = (maxInclusive - min + 1);
    if (range <= 0) return min;

    if (window.crypto && window.crypto.getRandomValues) {
      const maxUint32 = 0xFFFFFFFF;
      const limit = Math.floor(maxUint32 / range) * range;
      const buf = new Uint32Array(1);
      let x;
      do { window.crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
      return min + (x % range);
    }
    return min + Math.floor(Math.random() * range);
  }
  function sampleUniqueUniform(pick, max, excludedSet = new Set()){
    const set = new Set(Array.from(excludedSet));
    while (set.size < pick + excludedSet.size) set.add(randInt(1,max));
    const arr = Array.from(set).filter(n => !excludedSet.has(n));
    return arr.slice(0,pick).sort((a,b)=>a-b);
  }

  /* PARSING */
  function extractNumbers(line){
    const matches = String(line).match(/\d+/g);
    if (!matches) return [];
    return matches.map(s=>Number(s)).filter(Number.isFinite);
  }
  function parseContestLine(line, lot){
    const nums = extractNumbers(line).map(n=>Math.trunc(n)).filter(n => n>=1 && n<=lot.max);
    const unique = Array.from(new Set(nums));
    if (unique.length !== lot.pick) return null;
    return unique.sort((a,b)=>a-b);
  }
  function parseMultipleLines(text, expectedLines, lot){
    const lines = String(text).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    if (lines.length !== expectedLines) {
      return { ok:false, error:`Esperado exatamente ${expectedLines} linha(s). Encontrei ${lines.length}.`, lines:[] };
    }
    const parsed = [];
    for (let i=0;i<lines.length;i++){
      const p = parseContestLine(lines[i], lot);
      if (!p) return { ok:false, error:`Linha ${i+1} inválida para ${lot.label}. Verifique quantidade e intervalo.`, lines:[] };
      parsed.push(p);
    }
    return { ok:true, lines: parsed };
  }

  /* FIXOS */
  function parseFixedNumbers(input, lot){
    const nums = extractNumbers(input).map(n=>Math.trunc(n)).filter(n => n>=1 && n<=lot.max);
    const unique = Array.from(new Set(nums)).sort((a,b)=>a-b);
    if (unique.length >= lot.pick) {
      return { ok:false, error:`Você definiu ${unique.length} fixo(s), mas ${lot.label} precisa de ${lot.pick}. Máximo: ${lot.pick-1}.`, nums:[] };
    }
    return { ok:true, nums: unique };
  }
  function renderFixedChips(){
    fixedChips.innerHTML = "";
    const nums = state.prefs.fixedNumbers || [];
    if (!nums.length) { btnClearFixed.disabled = true; return; }
    btnClearFixed.disabled = false;
    nums.forEach(n => {
      const c = document.createElement("div");
      c.className = "chip";
      c.textContent = String(n);
      fixedChips.appendChild(c);
    });
  }
  function applyFixedFromInput(){
    const lot = LOTTERIES[state.prefs.lotteryId];
    const parsed = parseFixedNumbers(fixedNumbersInput.value, lot);
    if (!parsed.ok) { toast(parsed.error); return; }
    state.prefs.fixedNumbers = parsed.nums;
    persistPrefs();
    renderFixedChips();
    toast(parsed.nums.length ? `Fixos aplicados: ${parsed.nums.join(", ")}` : "Nenhum número fixo aplicado.");
  }
  function clearFixed(){
    state.prefs.fixedNumbers = [];
    fixedNumbersInput.value = "";
    persistPrefs();
    renderFixedChips();
    toast("Fixos limpos.");
  }

  /* FREQUÊNCIA + HOT/COLD */
  function buildFrequency(lines, lot){
    const freq = new Map();
    for (let n=1;n<=lot.max;n++) freq.set(n,0);
    for (const line of lines) for (const n of line) freq.set(n,(freq.get(n)||0)+1);
    return freq;
  }
  function hotColdFromFreq(freq, lot){
    const all = [];
    for (let n=1;n<=lot.max;n++) all.push({ n, c: freq.get(n) || 0 });
    const top = lot.hotColdTop;

    const hot = all.slice().sort((a,b)=>(b.c-a.c)||(a.n-b.n)).slice(0,top).map(x=>x.n);
    const cold = all.slice().sort((a,b)=>(a.c-b.c)||(a.n-b.n)).slice(0,top).map(x=>x.n);
    return { hot, cold };
  }
  function buildWeights(freq, lot){
    const alpha = 0.65;
    const weights = new Array(lot.max+1).fill(1);
    for (let n=1;n<=lot.max;n++){
      const f = freq.get(n) || 0;
      weights[n] = 1 + alpha*f;
    }
    return weights;
  }
  function weightedPickUnique(weights, pick, max, excludedSet = new Set()){
    const chosen = new Set(Array.from(excludedSet));
    const needTotal = excludedSet.size + pick;

    for (let k=excludedSet.size;k<needTotal;k++){
      let total = 0;
      for (let n=1;n<=max;n++) total += chosen.has(n) ? 0 : (weights[n]||0);
      if (!Number.isFinite(total) || total<=0){
        while (chosen.size<needTotal) chosen.add(randInt(1,max));
        break;
      }
      let r = (randInt(1,1_000_000)/1_000_000)*total;
      let picked = 1;
      for (let n=1;n<=max;n++){
        if (chosen.has(n)) continue;
        r -= (weights[n]||0);
        if (r<=0){ picked=n; break; }
      }
      chosen.add(picked);
    }
    return Array.from(chosen).sort((a,b)=>a-b);
  }

  function renderChips(el, nums){
    el.innerHTML = "";
    if (!nums || !nums.length){
      const sp = document.createElement("div");
      sp.className = "micro";
      sp.textContent = "—";
      el.appendChild(sp);
      return;
    }
    nums.forEach(n=>{
      const c = document.createElement("div");
      c.className = "chip";
      c.textContent = String(n);
      el.appendChild(c);
    });
  }

  /* PROB SUMMARY (Gerar) */
  function getProbPackForMode(mode){
    const lotId = state.prefs.lotteryId;
    if (mode === "prob_last") return state.prob.last && state.prob.last.lotteryId===lotId ? state.prob.last : null;
    if (mode === "prob_7") return state.prob.seven && state.prob.seven.lotteryId===lotId ? state.prob.seven : null;
    if (mode === "online_trends") return state.prob.online && state.prob.online.lotteryId===lotId ? state.prob.online : null;
    return null;
  }
  function updateProbSummaryUI(){
    const mode = state.prefs.mode;
    const lot = LOTTERIES[state.prefs.lotteryId];
    const show = (mode==="prob_last"||mode==="prob_7"||mode==="online_trends");
    if (!show){ probSummary.hidden = true; return; }
    probSummary.hidden = false;

    const pack = getProbPackForMode(mode);
    if (!pack){
      probSummaryStatus.textContent =
        (mode==="online_trends")
          ? "Status: histórico ainda não carregado. Clique em “Buscar histórico agora”."
          : "Status: análise ainda não feita. Clique em “Abrir análise” e toque em “Analisar”.";
      renderChips(probHot, []);
      renderChips(probCold, []);
      return;
    }
    const ts = pack.ts ? new Date(pack.ts).toLocaleString() : "";
    probSummaryStatus.textContent = `Status: análise pronta para ${lot.label}${ts ? " • "+ts : ""}.`;
    renderChips(probHot, pack.hot || []);
    renderChips(probCold, pack.cold || []);
  }
  function openAnalyzeForCurrentMode(){
    if (state.prefs.mode==="prob_last") setView("view-prob-last");
    else if (state.prefs.mode==="prob_7") setView("view-prob-7");
    else toast("Para Online: clique em “Buscar histórico agora” e depois em “Gerar”.");
  }

  /* ONLINE CAIXA */
  async function fetchJson(url){
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    try{
      const res = await fetch(url, { signal: controller.signal, cache:"no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  function extractDezenasFromCaixaJson(data){
    // CAIXA usa listaDezenas como strings (ex.: ["15","22",...])
    const raw = data?.listaDezenas || data?.dezenasSorteadasOrdemSorteio || [];
    const nums = Array.isArray(raw) ? raw.map(x=>Number(String(x).trim())).filter(Number.isFinite) : [];
    return nums;
  }

  async function fetchOnlineHistory(){
    const lot = LOTTERIES[state.prefs.lotteryId];
    const limit = Math.max(7, Math.min(30, Number(onlineLimit.value) || 30));
    state.prefs.onlineLimit = limit;
    persistPrefs();

    onlineStatus.innerHTML = `<strong>Buscando histórico...</strong>`;
    btnFetchOnline.disabled = true;

    try{
      const base = CAIXA_BASE + lot.endpoint;

      // 1) pega o último
      const latest = await fetchJson(base);
      const latestNums = extractDezenasFromCaixaJson(latest);
      if (latestNums.length !== lot.pick) throw new Error("Não consegui ler os números do último concurso.");

      const lines = [latestNums.slice().sort((a,b)=>a-b)];

      // 2) tenta buscar anteriores (via /{numero})
      let current = latest?.numeroConcursoAnterior ?? latest?.numeroConcursoProximo ? latest?.numero : null;
      // fallback: usa "numero" do próprio JSON
      let n = Number(latest?.numero);
      if (!Number.isFinite(n)) throw new Error("Não consegui identificar o número do concurso.");

      for (let i=1;i<limit;i++){
        const prev = n - i;
        if (prev <= 0) break;
        try{
          const d = await fetchJson(`${base}/${prev}`);
          const nums = extractDezenasFromCaixaJson(d);
          if (nums.length === lot.pick) lines.push(nums.slice().sort((a,b)=>a-b));
        } catch {
          // se falhar em algum concurso, só pula
        }
      }

      if (lines.length < 2) {
        onlineStatus.innerHTML = `<strong>OK:</strong> peguei o último concurso. (Histórico parcial)`;
      } else {
        onlineStatus.innerHTML = `<strong>OK:</strong> histórico carregado (${lines.length} concursos).`;
      }

      const freq = buildFrequency(lines, lot);
      const { hot, cold } = hotColdFromFreq(freq, lot);
      const weights = buildWeights(freq, lot);

      state.prob.online = { lotteryId: lot.id, weights, hot, cold, ts: Date.now(), linesCount: lines.length };
      safeSet(LS_KEYS.online, state.prob.online);

      toast("Online pronto. Agora gere no modo Online.");
      updateProbSummaryUI();
    } catch (err){
      onlineStatus.innerHTML = `<strong style="color:var(--bad)">⚠ Online falhou:</strong> ${escapeHtml(err?.message || "erro")}`;
      toast("Online falhou. Use colagem (último / 7).");
      updateProbSummaryUI();
    } finally {
      btnFetchOnline.disabled = false;
    }
  }

  /* GENERATION */
  function getActiveWeightsForMode(){
    const lotId = state.prefs.lotteryId;
    if (state.prefs.mode==="prob_last") return state.prob.last && state.prob.last.lotteryId===lotId ? state.prob.last.weights : null;
    if (state.prefs.mode==="prob_7") return state.prob.seven && state.prob.seven.lotteryId===lotId ? state.prob.seven.weights : null;
    if (state.prefs.mode==="online_trends") return state.prob.online && state.prob.online.lotteryId===lotId ? state.prob.online.weights : null;
    return null;
  }

  function generateOne(){
    const lot = LOTTERIES[state.prefs.lotteryId];
    const fixed = Array.isArray(state.prefs.fixedNumbers) ? state.prefs.fixedNumbers : [];
    const fixedSet = new Set(fixed);
    const remaining = lot.pick - fixed.length;

    if (remaining <= 0) return fixed.slice(0, lot.pick).sort((a,b)=>a-b);

    if (state.prefs.mode === "rng") {
      return fixed.concat(sampleUniqueUniform(remaining, lot.max, fixedSet)).sort((a,b)=>a-b);
    }

    const weights = getActiveWeightsForMode();
    if (!weights) {
      toast("Antes de gerar nesse modo, faça a análise. Toque em “Abrir análise” ou use Online.");
      updateProbSummaryUI();
      return fixed.concat(sampleUniqueUniform(remaining, lot.max, fixedSet)).sort((a,b)=>a-b);
    }

    return weightedPickUnique(weights, lot.pick, lot.max, fixedSet);
  }

  function generateMany(qty){
    const out = [];
    for (let i=0;i<qty;i++) out.push(generateOne());
    return out;
  }

  /* UI RENDER */
  function renderBalls(nums, animate=false){
    const wrap = document.createElement("div");
    wrap.className = "combo-balls";
    nums.forEach(n=>{
      const b = document.createElement("div");
      b.className = "ball";
      b.textContent = String(n);
      if (animate) b.classList.add("is-anim");
      wrap.appendChild(b);
    });
    return wrap;
  }

  function setActionEnabled(hasGenerated){
    btnCopy.disabled = !hasGenerated;
    btnSave.disabled = !hasGenerated;
    btnPrint.disabled = !hasGenerated;
    btnWhatsApp.disabled = !hasGenerated;
  }

  function renderGenerated(){
    generatedArea.innerHTML = "";
    if (!state.generated.length){
      const empty = document.createElement("div");
      empty.className = "micro";
      empty.innerHTML = `Clique em <strong>Gerar</strong> para ver as combinações aqui.`;
      generatedArea.appendChild(empty);
      setActionEnabled(false);
      return;
    }

    const lot = LOTTERIES[state.prefs.lotteryId];
    state.generated.forEach((nums, idx)=>{
      const card = document.createElement("div");
      card.className = "combo-card";

      const left = document.createElement("div");
      left.className = "combo-left";

      const meta = document.createElement("div");
      meta.className = "combo-meta";
      meta.innerHTML =
        `<span><strong>Jogo ${idx+1}</strong></span>`+
        `<span>${escapeHtml(lot.label)}</span>`+
        `<span>${escapeHtml(modeLabel(state.prefs.mode))}</span>`+
        (fixedNumbersInput.value?.trim() ? `<span>Fixos: ${escapeHtml((state.prefs.fixedNumbers||[]).join(", "))}</span>` : "");

      left.appendChild(meta);
      left.appendChild(renderBalls(nums, true));
      card.appendChild(left);
      generatedArea.appendChild(card);
    });

    setActionEnabled(true);
  }

  /* COPY / SAVE / PRINT */
  function formatNumber(n, twoDigits){
    return twoDigits ? String(n).padStart(2,"0") : String(n);
  }

  async function copyGenerated(){
    if (!state.generated.length) return;
    const two = !!state.prefs.copyTwoDigits;
    const text = state.generated.map(nums => nums.map(n=>formatNumber(n,two)).join(" ")).join("\n");

    try{
      await navigator.clipboard.writeText(text);
      toast("Copiado para a área de transferência.");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position="fixed";
      ta.style.left="-9999px";
      document.body.appendChild(ta);
      ta.select();
      try{ document.execCommand("copy"); toast("Copiado para a área de transferência."); }
      catch{ toast("Não foi possível copiar automaticamente. Copie manualmente."); }
      finally{ document.body.removeChild(ta); }
    }
  }

  function persistSaved(){ safeSet(LS_KEYS.saved, state.saved); }

  function saveGenerated(){
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

  function removeSaved(id){
    state.saved = state.saved.filter(x => x.id !== id);
    persistSaved();
    renderSaved();
    toast("Removido.");
  }

  function clearAllSaved(){
    state.saved = [];
    persistSaved();
    state.savedPage = 1;
    renderSaved();
    toast("Tudo limpo.");
  }

  function buildPrintDocument(){
    const lot = LOTTERIES[state.prefs.lotteryId];
    const when = new Date();
    const div = document.createElement("div");

    const h1 = document.createElement("h1");
    h1.className = "print-title";
    h1.textContent = "Takara Brasil";
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

    for (const nums of state.generated){
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

  function printGenerated(){
    if (!state.generated.length) return;
    printRoot.innerHTML = "";
    printRoot.appendChild(buildPrintDocument());
    window.print();
  }

  /* WHATSAPP */
  function buildWhatsAppMessage(){
    const lot = LOTTERIES[state.prefs.lotteryId];
    const when = new Date();
    const short = !!state.prefs.waShort;

    const header = short
      ? `🍀 Takara Brasil • ${lot.label}\n`
      : `🍀 Oi! Passei aqui para te mandar umas combinações das Loterias CAIXA.\n`+
        `Que o dia venha leve, com boas vibrações e sorte do bem. ✨\n\n`+
        `🎱 ${lot.label} • ${modeLabel(state.prefs.mode)}\n`;

    const meta = short
      ? `${modeLabel(state.prefs.mode)} • ${when.toLocaleString()}\n`
      : `🕒 ${when.toLocaleString()}\n`+
        (state.prefs.fixedNumbers?.length ? `📌 Fixos: ${state.prefs.fixedNumbers.join(", ")}\n` : "");

    const games = state.generated.map((nums,i)=>`Jogo ${i+1}: ${nums.join(" ")}`).join("\n");

    const footer = short
      ? `\n\n⚠️ Loteria é aleatória. Sem garantia.`
      : `\n\n🌟 Se quiser, escolhe 1 jogo e eu te mando também em PDF.\n`+
        `⚠️ Lembrete responsável: loteria é aleatória; não há garantia de ganhos.`;

    return `${header}${meta}\n${games}${footer}`;
  }

  function openWhatsAppShare(){
    if (!state.generated.length) return;
    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    toast("WhatsApp aberto com a mensagem pronta.");
  }

  /* ANALYZE: last / 7 (colagem) */
  function analyzeLast(){
    const lot = LOTTERIES[state.prefs.lotteryId];
    const parsed = parseMultipleLines(pasteLast.value, 1, lot);

    if (!parsed.ok){
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

    toast("Análise pronta. Gere usando o Modo B.");
    updateProbSummaryUI();
  }

  function analyze7(){
    const lot = LOTTERIES[state.prefs.lotteryId];
    const parsed = parseMultipleLines(paste7.value, 7, lot);

    if (!parsed.ok){
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

    toast("Análise pronta. Gere usando o Modo C.");
    updateProbSummaryUI();
  }

  /* SAVED LIST */
  function renderSaved(){
    savedList.innerHTML = "";
    const total = state.saved.length;
    const totalPages = Math.max(1, Math.ceil(total / SAVED_PAGE_SIZE));
    state.savedPage = Math.min(state.savedPage, totalPages);

    const start = (state.savedPage - 1) * SAVED_PAGE_SIZE;
    const items = state.saved.slice(start, start + SAVED_PAGE_SIZE);

    if (!total){
      const empty = document.createElement("div");
      empty.className = "micro";
      empty.textContent = "Você ainda não salvou nenhum jogo.";
      savedList.appendChild(empty);
    } else {
      for (const item of items){
        const row = document.createElement("div");
        row.className = "saved-item";

        const left = document.createElement("div");
        left.className = "saved-item__left";

        const meta = document.createElement("div");
        meta.className = "saved-item__meta";
        meta.textContent = `${LOTTERIES[item.lotteryId]?.label || "Loteria"} • ${modeLabel(item.mode)} • ${new Date(item.ts).toLocaleString()}`;
        left.appendChild(meta);

        const ballsWrap = document.createElement("div");
        ballsWrap.className = "saved-item__balls";
        for (const n of item.nums){
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
        del.addEventListener("click", ()=>removeSaved(item.id));
        right.appendChild(del);

        row.appendChild(left);
        row.appendChild(right);
        savedList.appendChild(row);
      }
    }

    btnClearAll.disabled = total === 0;
    btnPrevPage.disabled = state.savedPage <= 1;
    btnNextPage.disabled = state.savedPage >= totalPages;
    pageInfo.textContent = total ? `Página ${state.savedPage} de ${totalPages} • ${total} salvo(s)` : `Página 1 de 1 • 0 salvo(s)`;
  }

  /* LOAD/PREFS */
  function loadSaved(){
    try{
      const raw = safeGet(LS_KEYS.saved);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr
        .filter(x => x && typeof x === "object" && Array.isArray(x.nums))
        .map(x => ({
          id: String(x.id || `${Date.now()}-${Math.random()}`),
          ts: Number(x.ts || Date.now()),
          lotteryId: String(x.lotteryId || "megasena"),
          mode: String(x.mode || "rng"),
          nums: x.nums.map(n=>Number(n)).filter(Number.isFinite)
        }));
    } catch { return []; }
  }

  function loadPrefs(){
    try{
      const raw = safeGet(LS_KEYS.prefs);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return null;
      return p;
    } catch { return null; }
  }

  function persistPrefs(){ safeSet(LS_KEYS.prefs, state.prefs); }

  function loadProbCaches(){
    try{ const rawL = safeGet(LS_KEYS.probLast); if (rawL) state.prob.last = JSON.parse(rawL); } catch {}
    try{ const raw7 = safeGet(LS_KEYS.prob7); if (raw7) state.prob.seven = JSON.parse(raw7); } catch {}
    try{ const rawO = safeGet(LS_KEYS.online); if (rawO) state.prob.online = JSON.parse(rawO); } catch {}
  }

  /* EVENTS */
  function wireEvents(){
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

      toast(`Modo: ${modeLabel(state.prefs.mode)}`);
    });

    btnGoAnalyze.addEventListener("click", openAnalyzeForCurrentMode);

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

    onlineLimit.addEventListener("change", () => {
      state.prefs.onlineLimit = Number(onlineLimit.value) || 30;
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
  }

  function syncControlsFromState(){
    applyTheme(getPreferredTheme());
    lotterySelect.value = state.prefs.lotteryId;
    modeSelect.value = state.prefs.mode;
    copyTwoDigits.checked = !!state.prefs.copyTwoDigits;
    waShort.checked = !!state.prefs.waShort;

    fixedNumbersInput.value = (state.prefs.fixedNumbers || []).join(", ");
    renderFixedChips();

    onlineLimit.value = String(state.prefs.onlineLimit || 30);

    qtyButtons.forEach(b => b.setAttribute("aria-pressed","false"));
    (qtyButtons.find(x => Number(x.getAttribute("data-qty")) === state.qty) || qtyButtons[0]).setAttribute("aria-pressed","true");

    setView("view-generate");
    updateProbSummaryUI();
  }

  function init(){
    applyTheme(getPreferredTheme());

    const p = loadPrefs();
    if (p){
      if (p.lotteryId && LOTTERIES[p.lotteryId]) state.prefs.lotteryId = p.lotteryId;
      if (p.mode && ["rng","prob_last","prob_7","online_trends"].includes(p.mode)) state.prefs.mode = p.mode;
      if (typeof p.copyTwoDigits === "boolean") state.prefs.copyTwoDigits = p.copyTwoDigits;
      if (typeof p.waShort === "boolean") state.prefs.waShort = p.waShort;
      if (Array.isArray(p.fixedNumbers)) state.prefs.fixedNumbers = p.fixedNumbers.map(Number).filter(Number.isFinite);
      if (Number.isFinite(Number(p.onlineLimit))) state.prefs.onlineLimit = Number(p.onlineLimit);
    }

    state.saved = loadSaved();
    loadProbCaches();
    state.qty = 1;

    wireEvents();
    syncControlsFromState();

    generatedArea.innerHTML = `<div class="micro">Clique em <strong>Gerar</strong> para ver as combinações aqui.</div>`;
    setActionEnabled(false);

    renderSaved();
    toast("Pronto. Use RNG, análise por colagem ou Online.");
  }

  function persistPrefs(){ safeSet(LS_KEYS.prefs, state.prefs); }

  init();
})();