/* =========================================================
   105X Japonês (SPA leve, só 105X)
   - localStorage
   - aceita kanji opcionalmente
   - furigana manual via: 漢字{かな}
   - ✅ aceita parênteses japoneses: （ ）
   - ✅ novas frases entram no topo
   - ✅ gerenciar frases: editar / excluir
   - ✅ timer de estudo (sessão) no topo da tela 105x
   - ✅ barras de progresso em cada cartão (panorâmica)
   ========================================================= */

const LS_KEY = "jp_105x_v2";

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const now = () => Date.now();
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const uid = (p = "id") => `${p}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
const escapeHTML = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function safeJSONParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function fmtMMSS(ms) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/* ---------- JP validation ----------
   Permite:
   - hiragana \u3040-\u309F
   - katakana \u30A0-\u30FF
   - kanji (CJK) \u4E00-\u9FFF
   - espaço normal e japonês
   - números
   - pontuação básica
   - furigana manual com chaves: { }
   - ✅ parênteses fullwidth: （ ）
*/
const JP_ALLOWED_RE =
  /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF 　。、！？・ー\-~!?.,:;()（）「」『』【】［］…\n\r\t0-9{}]*$/;

function isValidJP(text) {
  if (typeof text !== "string") return false;
  const t = text.trim();
  if (!t) return false;

  if (!JP_ALLOWED_RE.test(t)) return false;

  const open = (t.match(/{/g) || []).length;
  const close = (t.match(/}/g) || []).length;
  if (open !== close) return false;

  if (/\{\s*\}/.test(t)) return false;

  return true;
}

/* ---------- Furigana parsing ----------
   base{reading} -> ruby
   Ex: 仕事{しごと} は いそがしい
*/
const FURI_RE = /([^{}\s]+)\{([^{}]+)\}/g;

function jpStripFurigana(raw) {
  return String(raw || "").replace(FURI_RE, (_, base) => base);
}

function jpHasFurigana(raw) {
  FURI_RE.lastIndex = 0;
  return FURI_RE.test(String(raw || ""));
}

function jpToRubyHTML(raw) {
  const s = String(raw || "");
  FURI_RE.lastIndex = 0;

  let out = "";
  let last = 0;
  let m;
  while ((m = FURI_RE.exec(s)) !== null) {
    const [full, base, reading] = m;
    const i = m.index;
    out += escapeHTML(s.slice(last, i));
    out += `<ruby>${escapeHTML(base)}<rt>${escapeHTML(reading.trim())}</rt></ruby>`;
    last = i + full.length;
  }
  out += escapeHTML(s.slice(last));
  return out;
}

/* ---------- seed (20 frases) ---------- */
function seedPhrases() {
  const t = now();
  return [
    { id:"ph_001", jp:"おはよう", pt:"bom dia", newWords:[{jp:"おはよう", pt:"bom dia"}], createdAt:t, updatedAt:t },
    { id:"ph_002", jp:"おつかれさま", pt:"bom trabalho / valeu pelo esforço", newWords:[{jp:"おつかれさま", pt:"bom trabalho"}], createdAt:t, updatedAt:t },
    { id:"ph_003", jp:"きょうは つかれた", pt:"hoje eu estou cansado", newWords:[{jp:"きょう",pt:"hoje"},{jp:"つかれた",pt:"cansado"}], createdAt:t, updatedAt:t },
    { id:"ph_004", jp:"ねむい", pt:"estou com sono", newWords:[{jp:"ねむい",pt:"com sono"}], createdAt:t, updatedAt:t },
    { id:"ph_005", jp:"いま いそがしい", pt:"agora estou ocupado", newWords:[{jp:"いま",pt:"agora"},{jp:"いそがしい",pt:"ocupado"}], createdAt:t, updatedAt:t },
    { id:"ph_006", jp:"ちょっと まって", pt:"espera um pouco", newWords:[{jp:"ちょっと",pt:"um pouco"},{jp:"まって",pt:"espera"}], createdAt:t, updatedAt:t },
    { id:"ph_007", jp:"だいじょうぶ", pt:"tudo bem / está ok", newWords:[{jp:"だいじょうぶ",pt:"tudo bem"}], createdAt:t, updatedAt:t },
    { id:"ph_008", jp:"もういちど おねがい", pt:"de novo, por favor", newWords:[{jp:"もういちど",pt:"mais uma vez"},{jp:"おねがい",pt:"por favor"}], createdAt:t, updatedAt:t },
    { id:"ph_009", jp:"ゆっくり おねがい", pt:"devagar, por favor", newWords:[{jp:"ゆっくり",pt:"devagar"}], createdAt:t, updatedAt:t },
    { id:"ph_010", jp:"わからない", pt:"nao entendi / nao sei", newWords:[{jp:"わからない",pt:"nao entendi"}], createdAt:t, updatedAt:t },
    { id:"ph_011", jp:"これ どこ", pt:"onde fica isto?", newWords:[{jp:"これ",pt:"isto"},{jp:"どこ",pt:"onde"}], createdAt:t, updatedAt:t },
    { id:"ph_012", jp:"これ なに", pt:"o que e isto?", newWords:[{jp:"なに",pt:"o que"}], createdAt:t, updatedAt:t },
    { id:"ph_013", jp:"たすけて", pt:"me ajuda", newWords:[{jp:"たすけて",pt:"me ajuda"}], createdAt:t, updatedAt:t },
    { id:"ph_014", jp:"あぶない", pt:"perigoso", newWords:[{jp:"あぶない",pt:"perigoso"}], createdAt:t, updatedAt:t },
    { id:"ph_015", jp:"きをつけて", pt:"cuidado", newWords:[{jp:"きをつけて",pt:"cuidado"}], createdAt:t, updatedAt:t },
    { id:"ph_016", jp:"ここで まって", pt:"espera aqui", newWords:[{jp:"ここ",pt:"aqui"}], createdAt:t, updatedAt:t },
    { id:"ph_017", jp:"これを つかう", pt:"usar isto", newWords:[{jp:"つかう",pt:"usar"}], createdAt:t, updatedAt:t },
    { id:"ph_018", jp:"それは だめ", pt:"isso nao pode", newWords:[{jp:"それ",pt:"isso"},{jp:"だめ",pt:"nao pode"}], createdAt:t, updatedAt:t },
    { id:"ph_019", jp:"もう いい", pt:"ja esta bom / pode parar", newWords:[{jp:"もう",pt:"ja"},{jp:"いい",pt:"bom"}], createdAt:t, updatedAt:t },
    { id:"ph_020", jp:"あとで はなそう", pt:"vamos falar depois", newWords:[{jp:"あとで",pt:"depois"},{jp:"はなそう",pt:"vamos falar"}], createdAt:t, updatedAt:t }
  ];
}

/* ---------- state ---------- */
function defaultState() {
  const t = now();
  const phrases = seedPhrases();

  const progress = {};
  for (const p of phrases) {
    progress[p.id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };
  }

  return {
    app: { schemaVersion: 2, createdAt: t, updatedAt: t },

    prefs: {
      audio: { enabled: true, volume: 0.35, unlocked: false },
      haptics: { enabled: true }
    },

    stats: {
      coins: 0,
      bestCoins: 0,
      cyclesDone: 0,
      phrasesMastered: 0
    },

    bank: { phrases },
    progress,

    session: {
      inProgress: false,
      queue: [],
      index: 0,
      phraseId: null,
      callMode: false,

      // ✅ timer (hoje)
      study: {
        day: todayKey(),
        totalMs: 0,
        running: false,
        runStartAt: null
      }
    },

    ui: { lastToast: "" }
  };
}

let STATE = loadState();

/* ---------- storage ---------- */
function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return defaultState();
  const parsed = safeJSONParse(raw);
  if (!parsed || !parsed.app) return defaultState();
  if (parsed.app.schemaVersion !== 2) return defaultState();

  // migração suave: garante campos novos
  parsed.session ||= {};
  parsed.session.study ||= { day: todayKey(), totalMs: 0, running: false, runStartAt: null };

  return parsed;
}

function saveState() {
  STATE.app.updatedAt = now();
  localStorage.setItem(LS_KEY, JSON.stringify(STATE));
}

/* ---------- audio / haptics ---------- */
let audioCtx = null;

function unlockAudio() {
  if (STATE.prefs.audio.unlocked) return;
  STATE.prefs.audio.unlocked = true;

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    g.gain.value = 0.0001;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.01);
  } catch {}
  saveState();
}

function beep(type = "tap") {
  if (!STATE.prefs.audio.enabled) return;
  if (!STATE.prefs.audio.unlocked) return;
  if (!audioCtx) return;

  const vol = clamp(STATE.prefs.audio.volume ?? 0.35, 0, 1);
  const t0 = audioCtx.currentTime;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  let freq = 220, dur = 0.06;
  if (type === "ding") { freq = 660; dur = 0.09; }
  if (type === "pop")  { freq = 520; dur = 0.05; }
  if (type === "tuk")  { freq = 140; dur = 0.06; }
  if (type === "level"){ freq = 840; dur = 0.12; }

  o.type = "sine";
  o.frequency.setValueAtTime(freq, t0);

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * 0.14), t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  o.connect(g).connect(audioCtx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function vibrate(pattern = [10]) {
  if (!STATE.prefs.haptics.enabled) return;
  if (!navigator.vibrate) return;
  navigator.vibrate(pattern);
}

/* ---------- UI helpers ---------- */
const APP = $("#app");

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("on"), 1400);
  STATE.ui.lastToast = msg;
  saveState();
}

function floatCoin(text = "+100 🪙") {
  const el = document.createElement("div");
  el.className = "floatCoin";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function sparkOn(node) {
  if (!node) return;
  let sp = node.querySelector(".spark");
  if (!sp) {
    sp = document.createElement("div");
    sp.className = "spark";
    node.appendChild(sp);
  }
  sp.classList.remove("on");
  void sp.offsetWidth;
  sp.classList.add("on");
}

function refreshHUD() {
  const coinsEl = $("#hudCoinsVal");
  if (coinsEl) coinsEl.textContent = String(STATE.stats.coins || 0);

  const soundEl = $("#hudSound");
  if (soundEl) soundEl.textContent = STATE.prefs.audio.enabled ? "🔊" : "🔇";

  const vibeEl = $("#hudVibe");
  if (vibeEl) vibeEl.textContent = STATE.prefs.haptics.enabled ? "📳" : "📴";

  const sub = $("#subStatus");
  if (sub) sub.textContent = `${STATE.stats.cyclesDone || 0} ciclos • ${STATE.stats.phrasesMastered || 0} dominadas`;
}

function route() {
  const h = location.hash || "#/home";
  return h.startsWith("#/") ? h : "#/home";
}
function nav(hash) { location.hash = hash; }

/* ---------- session / queue ---------- */
function getProg(id) {
  if (!STATE.progress[id]) {
    STATE.progress[id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };
  }
  return STATE.progress[id];
}

function buildQueue() {
  const training = [];
  const mastered = [];
  for (const p of STATE.bank.phrases) {
    const pr = getProg(p.id);
    (pr.status === "mastered" ? mastered : training).push(p.id);
  }
  return training.concat(mastered);
}

function startAuto() {
  unlockAudio();
  STATE.session.inProgress = true;
  STATE.session.queue = buildQueue();
  STATE.session.index = 0;
  STATE.session.phraseId = STATE.session.queue[0] || null;
  saveState();
  refreshHUD();
  nav("#/105x");
}

function getPhrase(id) {
  return STATE.bank.phrases.find(p => p.id === id) || null;
}

function resetCountForPhrase(id) {
  const pr = getProg(id);
  const cs = clamp(pr.cycleStart || 14, 1, 14);
  pr.count = cs;
  saveState();
}

function setPhraseById(id) {
  const idx = STATE.session.queue.indexOf(id);
  STATE.session.phraseId = id;
  if (idx >= 0) STATE.session.index = idx;
  resetCountForPhrase(id);
  saveState();
}

function addCoins(amount) {
  STATE.stats.coins = (STATE.stats.coins || 0) + amount;
  STATE.stats.bestCoins = Math.max(STATE.stats.bestCoins || 0, STATE.stats.coins);
  saveState();
  refreshHUD();
}

function nextPhrase() {
  const q = STATE.session.queue;
  if (!q.length) return;

  STATE.session.index = clamp(STATE.session.index + 1, 0, q.length - 1);
  STATE.session.phraseId = q[STATE.session.index];
  resetCountForPhrase(STATE.session.phraseId);
  saveState();
}

function skipPhrase() {
  const q = STATE.session.queue;
  const current = STATE.session.phraseId;
  if (!current || !q.length) return;

  const idx = STATE.session.index;
  q.splice(idx, 1);
  q.push(current);

  STATE.session.index = clamp(idx, 0, q.length - 1);
  STATE.session.phraseId = q[STATE.session.index];

  resetCountForPhrase(STATE.session.phraseId);
  saveState();

  toast("pulou. suave. proxima ✅");
  beep("tuk");
}

/* ---------- progresso panorâmico ----------
   Total de repetições para dominar (14→1 ... 1→1) = 105
   restante = count(atual) + soma(1..cycleStart-1)
*/
function sum1to(n) { return (n * (n + 1)) / 2; }

function phraseProgressPct(pr) {
  if (!pr) return 0;
  if (pr.status === "mastered") return 1;

  const cycleStart = clamp(pr.cycleStart || 14, 1, 14);
  const count = clamp(pr.count || cycleStart, 1, cycleStart);

  const total = 105;
  const remaining = count + sum1to(cycleStart - 1);
  const done = clamp(total - remaining, 0, total);

  return done / total;
}

/* ---------- karaoke ---------- */
function segmentText(text) {
  return [...String(text || "")];
}

function setKanaLine(el, rawText) {
  const hasFuri = jpHasFurigana(rawText);
  if (hasFuri) {
    el.innerHTML = jpToRubyHTML(rawText);
    el.dataset.mode = "ruby";
    return;
  }

  const segs = segmentText(rawText);
  el.innerHTML = segs.map((s, i) => `<span class="kseg" data-idx="${i}">${escapeHTML(s)}</span>`).join("");
  el.dataset.mode = "karaoke";
}

function estimateDurationMs(text, rate) {
  const clean = (text || "").replace(/\s+/g, "");
  const n = clean.length || 1;
  const base = 110 * n;
  const r = clamp(rate, 0.6, 1.2);
  return base / r;
}

function karaokePlay(el, rawText, rate) {
  const segEls = el.querySelectorAll(".kseg");
  if (!segEls || segEls.length === 0) return;

  segEls.forEach(sp => sp.classList.remove("on"));

  const plain = rawText;
  const segs = segmentText(plain);

  const dur = estimateDurationMs(plain, rate);
  const n = segs.length || 1;
  const step = dur / n;

  let idx = 0;
  const t0 = now();
  karaokePlay._kill?.();

  let raf = null;
  const tick = () => {
    const elapsed = now() - t0;
    const target = clamp(Math.floor(elapsed / step), 0, n);
    while (idx < target) {
      const sp = el.querySelector(`.kseg[data-idx="${idx}"]`);
      if (sp) sp.classList.add("on");
      idx++;
    }
    if (idx < n) raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  karaokePlay._kill = () => {
    if (raf) cancelAnimationFrame(raf);
    karaokePlay._kill = null;
  };
}

function ttsSpeak(text, rate = 1.0, onStart, onEnd) {
  if (!("speechSynthesis" in window)) return false;
  try { speechSynthesis.cancel(); } catch {}

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = clamp(rate, 0.6, 1.2);
  u.onstart = () => onStart && onStart();
  u.onend = () => onEnd && onEnd();
  u.onerror = () => onEnd && onEnd();

  speechSynthesis.speak(u);
  return true;
}

function speakWithKaraoke(jpRaw, rate, kanaEl) {
  const plain = jpStripFurigana(jpRaw);

  const ok = ttsSpeak(
    plain,
    rate,
    () => karaokePlay(kanaEl, plain, rate),
    () => {}
  );

  if (!ok) toast("sem audio. mas da pra treinar lendo.");
}

/* ---------- call and response ---------- */
function callAndResponse(jpRaw, rate, kanaEl, onDone) {
  const plain = jpStripFurigana(jpRaw);

  const ok = ttsSpeak(
    plain,
    rate,
    () => karaokePlay(kanaEl, plain, rate),
    () => {}
  );

  const t = estimateDurationMs(plain, rate);
  setTimeout(() => showNowYouSheet(onDone), t + 90);

  if (!ok) toast("sem audio. mas da pra treinar lendo.");
}

function showNowYouSheet(onDone) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;

  sheet.style.display = "block";
  sheet.innerHTML = `
    <div class="stamp">agora voce ✅</div>
    <div class="small">repete em voz alta. sem pressa.</div>
    <div class="row row--between">
      <div class="badge">tempo</div>
      <div class="badge" id="nyCount">2</div>
    </div>
  `;

  let c = 2;
  const tick = () => {
    c--;
    const el = $("#nyCount");
    if (el) el.textContent = String(Math.max(0, c));
    if (c <= 0) {
      sheet.style.display = "none";
      onDone && onDone();
      return;
    }
    setTimeout(tick, 1000);
  };
  setTimeout(tick, 1000);
}

/* ---------- 105X engine ---------- */
function onRepeat() {
  unlockAudio();

  const pid = STATE.session.phraseId;
  if (!pid) return;

  const p = getPhrase(pid);
  if (!p) return;

  const pr = getProg(pid);
  const cs = clamp(pr.cycleStart || 14, 1, 14);
  pr.count = clamp(pr.count || cs, 1, cs);

  if (pr.count > 1) {
    pr.count -= 1;
    pr.history.push({ at: now(), event: "rep", count: pr.count });
    saveState();
    beep("pop");
    vibrate([8]);
    render105xBodyOnly();
    return;
  }

  // ciclo concluído
  pr.history.push({ at: now(), event: "cycle_done", cycleStart: cs });

  STATE.stats.cyclesDone = (STATE.stats.cyclesDone || 0) + 1;
  addCoins(100);
  floatCoin("+100 🪙");
  beep("ding");
  vibrate([12]);
  sparkOn($("#counterBox"));

  if (pr.cycleStart > 1) pr.cycleStart -= 1;
  else pr.cycleStart = 1;

  let masteredNow = false;
  if (pr.cycleStart === 1 && pr.status !== "mastered") {
    pr.status = "mastered";
    pr.masteredAt = now();
    STATE.stats.phrasesMastered = (STATE.stats.phrasesMastered || 0) + 1;

    addCoins(500);
    floatCoin("+500 🪙");
    beep("level");
    vibrate([10, 40, 10]);

    masteredNow = true;
  }

  pr.count = clamp(pr.cycleStart, 1, 14);
  saveState();

  showCycleSheet(masteredNow);
  render105xBodyOnly();
  renderPhraseListOnly(); // ✅ atualiza barrinhas
}

function showCycleSheet(masteredNow) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;
  sheet.style.display = "block";

  const msg = masteredNow
    ? "frase dominada. voce ficou mais rico ✅"
    : "ciclo fechado. mais 100 moedas 🪙";

  sheet.innerHTML = `
    <div class="stamp">parabens 👏</div>
    <div class="small">${escapeHTML(msg)}</div>
    <div class="row">
      <button class="btn btn--ok btn--full" data-action="next">proxima frase 🔼</button>
    </div>
  `;
}

/* ---------- Timer (sessão hoje) ---------- */
let timerTickId = null;

function ensureStudyDay() {
  const k = todayKey();
  if (!STATE.session.study) STATE.session.study = { day: k, totalMs: 0, running: false, runStartAt: null };
  if (STATE.session.study.day !== k) {
    STATE.session.study.day = k;
    STATE.session.study.totalMs = 0;
    STATE.session.study.running = false;
    STATE.session.study.runStartAt = null;
    saveState();
  }
}

function startStudyTimerIfOn105x() {
  ensureStudyDay();

  const on105x = route() === "#/105x";
  const st = STATE.session.study;

  if (!on105x) {
    // pausa se estava rodando
    if (st.running && st.runStartAt) {
      st.totalMs += now() - st.runStartAt;
      st.running = false;
      st.runStartAt = null;
      saveState();
    }
    stopTimerTick();
    return;
  }

  // iniciar
  if (!st.running) {
    st.running = true;
    st.runStartAt = now();
    saveState();
  }

  startTimerTick();
  updateStudyUI();
}

function stopTimerTick() {
  if (timerTickId) {
    clearInterval(timerTickId);
    timerTickId = null;
  }
}

function startTimerTick() {
  if (timerTickId) return;
  timerTickId = setInterval(() => updateStudyUI(), 1000);
}

function getStudyMs() {
  ensureStudyDay();
  const st = STATE.session.study;
  const runningAdd = st.running && st.runStartAt ? (now() - st.runStartAt) : 0;
  return (st.totalMs || 0) + runningAdd;
}

function updateStudyUI() {
  const el = $("#studyTime");
  const fill = $("#studyFill");
  if (!el || !fill) return;

  const ms = getStudyMs();
  el.textContent = fmtMMSS(ms);

  // meta padrão: 10min (pode passar de 100%, mas a barra “trava” no cheio)
  const goal = 10 * 60 * 1000;
  const pct = clamp(ms / goal, 0, 1);
  fill.style.transform = `scaleX(${pct})`;
}

/* ---------- render ---------- */
function render() {
  refreshHUD();

  const r = route();
  if (r === "#/home") return renderHome();
  if (r === "#/105x") return render105x();
  if (r === "#/edit") return renderEdit();
  if (r === "#/manage") return renderManage();
  if (r === "#/backup") return renderBackup();
  if (r === "#/settings") return renderSettings();

  nav("#/home");
}

function renderHome() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <h1 class="h1">um toque. e pronto.</h1>
        <p class="p">hoje pode ser 2 minutos. ja conta. sem culpa.</p>

        <button class="bigBtn" id="btnStart">COMEÇAR AGORA</button>

        <div class="sep"></div>

        <div class="row">
          <button class="btn" data-nav="#/105x">ir pro treino</button>
          <button class="btn" data-nav="#/edit">cadastro</button>
          <button class="btn" data-nav="#/backup">backup</button>
        </div>

        <div class="small">dica: no fim de cada ciclo voce ganha 100 moedas. riqueza por repeticao 🪙</div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">seu tesouro</div>
          <div class="badge">🪙 ${STATE.stats.coins || 0}</div>
        </div>
        <div class="small">ciclos: ${STATE.stats.cyclesDone || 0} • dominadas: ${STATE.stats.phrasesMastered || 0}</div>
      </section>
    </div>
  `;

  $("#btnStart").addEventListener("click", () => {
    startAuto();
    toast("vamos. so 1 frase por vez ✅");
  });
}

function renderNewWords(list) {
  if (!Array.isArray(list) || list.length === 0) return "";
  const rows = list.map(w => `<div class="small"><b>${escapeHTML(w.jp)}</b> = ${escapeHTML(w.pt)}</div>`).join("");
  return `
    <div class="sheet">
      <div class="small" style="font-weight:1000;margin-bottom:6px">palavras novas</div>
      ${rows}
    </div>
  `;
}

function render105x() {
  if (!STATE.session.inProgress) {
    startAuto();
    return;
  }
  if (!STATE.session.phraseId) {
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;
    saveState();
  }

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack viewRel" id="view105x">

        <!-- topo: badge + timer + ações -->
        <div class="studyTop">
          <div class="badge">105x</div>

          <div class="studyTimer" aria-label="tempo de estudo">
            <div class="studyTimerRow">
              <div class="studyTime"><span class="ic">⏱</span> <span id="studyTime">00:00</span></div>
              <div class="studyHint">meta 10:00</div>
            </div>
            <div class="studyBar"><div class="studyFill" id="studyFill"></div></div>
          </div>

          <div class="studyActions">
            <button class="miniBtn" title="editar frases" aria-label="editar frases" data-nav="#/manage">✏️</button>
            <div class="badge">${STATE.session.callMode ? "chamada on" : "chamada off"}</div>
          </div>
        </div>

        <div class="counterWrap">
          <div class="counter" id="counterBox" aria-label="contador">
            <div style="text-align:center">
              <div class="counterVal" id="countVal">-</div>
              <div class="counterSub" id="cycleSub">ciclo</div>
            </div>
          </div>

          <div class="stack" style="flex:1; min-width: 200px">
            <div class="kana" id="kanaLine"></div>
            <div class="pt" id="ptLine"></div>

            <div id="newWordsBox"></div>

            <div class="row">
              <button class="btn btn--muted" data-action="speak" data-rate="1">ouvir normal</button>
              <button class="btn btn--muted" data-action="speak" data-rate="0.8">ouvir lento</button>
              <button class="btn btn--ghost" data-action="toggleCall">${STATE.session.callMode ? "call: on" : "call: off"}</button>
            </div>
          </div>
        </div>

        <div class="sep"></div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-action="repeat">repeti e entendi</button>
          <button class="btn btn--muted btn--full" data-action="skip">pular</button>
        </div>

        <div id="cycleSheet" class="sheet stack" style="display:none"></div>

        <div class="row">
          <button class="btn" data-action="next">proxima frase</button>
          <button class="btn" data-nav="#/home">sair</button>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">todas as frases</div>
          <div class="small">toque em IR</div>
        </div>
        <div class="list" id="phraseList"></div>
      </section>
    </div>
  `;

  render105xBodyOnly();
  renderPhraseListOnly();

  // ✅ liga timer quando estiver na tela
  startStudyTimerIfOn105x();
}

function renderPhraseListOnly() {
  const box = $("#phraseList");
  if (!box) return;

  const list = STATE.bank.phrases.map(x => {
    const pr = getProg(x.id);
    const st = pr.status === "mastered" ? "dominada ✓" : "treino";
    const pct = phraseProgressPct(pr);
    const pctTxt = Math.round(pct * 100);

    return `
      <div class="item">
        <div class="itemTop">
          <div style="min-width:0">
            <p class="itemTitle">${escapeHTML(jpStripFurigana(x.jp))}</p>
            <div class="itemMeta">${escapeHTML(x.pt)} • ${st}</div>

            <div class="pWrap" aria-label="progresso">
              <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
              <div class="pTxt">${pctTxt}%</div>
            </div>
          </div>
          <button class="btn" data-action="goto" data-id="${x.id}">IR</button>
        </div>
      </div>
    `;
  }).join("");

  box.innerHTML = list;
}

function render105xBodyOnly() {
  const pid = STATE.session.phraseId;
  const p = getPhrase(pid);
  const pr = getProg(pid);
  if (!p) return;

  const cs = clamp(pr.cycleStart || 14, 1, 14);
  const count = clamp(pr.count || cs, 1, cs);

  $("#countVal").textContent = String(count);
  $("#cycleSub").textContent = `ciclo ${cs} → 1`;

  const kanaEl = $("#kanaLine");
  setKanaLine(kanaEl, p.jp);

  $("#ptLine").textContent = p.pt;

  const nw = $("#newWordsBox");
  nw.innerHTML = renderNewWords(p.newWords || []);

  const sheet = $("#cycleSheet");
  if (sheet && sheet.style.display === "block" && count > 1) {
    sheet.style.display = "none";
  }
}

/* ---------- cadastro ---------- */
function parseNewWords(input) {
  const raw = String(input || "").trim();
  if (!raw) return [];
  const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const part of parts) {
    const [jp, pt] = part.split("=").map(s => (s || "").trim());
    if (!jp || !pt) continue;
    out.push({ jp, pt });
  }
  return out;
}

function renderEdit(editingId = null) {
  const editing = editingId ? getPhrase(editingId) : null;

  const jpVal = editing ? editing.jp : "";
  const ptVal = editing ? editing.pt : "";
  const nwVal = editing && Array.isArray(editing.newWords)
    ? editing.newWords.map(x => `${x.jp}=${x.pt}`).join(", ")
    : "";

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">${editing ? "editar frase" : "cadastro"}</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="small">jp (aceita kanji. furigana manual: 仕事{しごと}. parênteses （ ） ok)</div>
          <input id="inJp" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: 私{わたし} の名前{なまえ} は あきおです。" value="${escapeHTML(jpVal)}" />
          <div class="small">pt</div>
          <input id="inPt" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: meu nome é Akio." value="${escapeHTML(ptVal)}" />
          <div class="small">palavras novas (opcional) formato: jp=pt, jp=pt</div>
          <input id="inNW" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: 名前{なまえ}=nome" value="${escapeHTML(nwVal)}" />

          <button class="btn btn--ok btn--full" data-action="${editing ? "saveEdit" : "addPhrase"}" data-id="${editing ? editing.id : ""}">
            ${editing ? "salvar alteracoes" : "salvar frase"}
          </button>

          ${editing ? `<button class="btn btn--muted btn--full" data-nav="#/manage">voltar pro gerenciar</button>` : ""}

          <div class="small" id="editMsg"></div>
        </div>

        <div class="sep"></div>

        <div class="badge">frases: ${STATE.bank.phrases.length}</div>
      </section>
    </div>
  `;
}

/* ---------- gerenciar (editar/excluir) ---------- */
function renderManage() {
  const rows = STATE.bank.phrases.map(p => {
    const pr = getProg(p.id);
    const st = pr.status === "mastered" ? "dominada ✓" : "treino";
    return `
      <div class="item">
        <div class="itemTop">
          <div style="min-width:0">
            <p class="itemTitle">${escapeHTML(jpStripFurigana(p.jp))}</p>
            <div class="itemMeta">${escapeHTML(p.pt)} • ${st}</div>
          </div>
          <div class="manageBtns">
            <button class="btn btn--ghost" data-action="editPhrase" data-id="${p.id}">editar</button>
            <button class="btn btn--bad" data-action="deletePhrase" data-id="${p.id}">excluir</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">editar / excluir</div>
          <button class="btn" data-nav="#/105x">voltar</button>
        </div>

        <div class="small">dica: furigana em cima usando { }. exemplo: 名前{なまえ}</div>

        <div class="list">${rows}</div>
      </section>
    </div>
  `;
}

/* ---------- backup ---------- */
function renderBackup() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">backup</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-action="export">exportar json</button>
          <button class="btn btn--muted btn--full" data-action="import">importar json</button>
        </div>

        <div class="sheet stack">
          <div class="small">cole aqui para importar</div>
          <textarea id="importBox" class="btn" style="height:160px; width:100%; text-align:left; padding:12px; border-radius:18px;"></textarea>
          <div class="small" id="backupMsg"></div>
        </div>
      </section>
    </div>
  `;
}

/* ---------- settings ---------- */
function renderSettings() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">ajustes</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="grid2">
          <button class="btn btn--full" data-action="toggleSound">${STATE.prefs.audio.enabled ? "som: ligado" : "som: desligado"}</button>
          <button class="btn btn--full" data-action="toggleVibe">${STATE.prefs.haptics.enabled ? "vibracao: ligada" : "vibracao: desligada"}</button>
        </div>

        <div class="sheet stack">
          <div class="small">volume do som (leve)</div>
          <input id="vol" type="range" min="0" max="1" step="0.05" value="${STATE.prefs.audio.volume ?? 0.35}" />
          <div class="small">som so toca depois do primeiro toque.</div>
        </div>

        <div class="sep"></div>
        <button class="btn btn--bad btn--full" data-action="reset">resetar tudo</button>
        <div class="small">vai voltar ao seed inicial.</div>
      </section>
    </div>
  `;
}

/* ---------- phrase actions (edit/delete) ---------- */
function deletePhraseById(id) {
  const idx = STATE.bank.phrases.findIndex(p => p.id === id);
  if (idx < 0) return false;

  STATE.bank.phrases.splice(idx, 1);
  delete STATE.progress[id];

  if (Array.isArray(STATE.session.queue) && STATE.session.queue.length) {
    STATE.session.queue = STATE.session.queue.filter(x => x !== id);
  }

  if (STATE.session.phraseId === id) {
    if (!STATE.session.queue.length) {
      STATE.session.phraseId = null;
      STATE.session.index = 0;
    } else {
      STATE.session.index = clamp(STATE.session.index, 0, STATE.session.queue.length - 1);
      STATE.session.phraseId = STATE.session.queue[STATE.session.index] || STATE.session.queue[0];
      resetCountForPhrase(STATE.session.phraseId);
    }
  }

  saveState();
  return true;
}

/* ---------- global click delegation ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.nav) {
    nav(btn.dataset.nav);
    return;
  }

  const act = btn.dataset.action;

  if (act === "repeat") { onRepeat(); return; }

  if (act === "skip") {
    unlockAudio();
    skipPhrase();
    render105xBodyOnly();
    return;
  }

  if (act === "next") {
    unlockAudio();
    nextPhrase();
    toast("proxima ✅");
    beep("pop");
    render105xBodyOnly();
    return;
  }

  if (act === "goto") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    if (!STATE.session.inProgress) startAuto();
    setPhraseById(id);
    toast("frase carregada ✅");
    beep("pop");
    render105xBodyOnly();
    return;
  }

  if (act === "toggleCall") {
    unlockAudio();
    STATE.session.callMode = !STATE.session.callMode;
    saveState();
    toast(STATE.session.callMode ? "call and response: on" : "call and response: off");
    render();
    return;
  }

  if (act === "speak") {
    unlockAudio();
    const rate = Number(btn.dataset.rate || "1");
    const pid = STATE.session.phraseId;
    const p = getPhrase(pid);
    const kanaEl = $("#kanaLine");
    if (!p || !kanaEl) return;

    if (STATE.session.callMode) {
      callAndResponse(p.jp, rate, kanaEl, () => {});
    } else {
      speakWithKaraoke(p.jp, rate, kanaEl);
    }
    return;
  }

  if (act === "addPhrase") {
    unlockAudio();
    const jp = ($("#inJp")?.value || "").trim();
    const pt = ($("#inPt")?.value || "").trim();
    const nw = parseNewWords($("#inNW")?.value || "");
    const msg = $("#editMsg");

    if (!jp || !pt) { msg.textContent = "preencha jp e pt."; toast("faltou jp/pt"); beep("tuk"); return; }
    if (!isValidJP(jp)) { msg.textContent = "jp invalido. dica: 仕事{しごと} ou （ ）"; toast("jp invalido"); beep("tuk"); return; }
    for (const w of nw) {
      if (!isValidJP(w.jp)) { msg.textContent = "palavra nova jp invalida."; toast("palavra invalida"); beep("tuk"); return; }
    }

    const t = now();
    const id = uid("ph");

    STATE.bank.phrases.unshift({ id, jp, pt, newWords: nw, createdAt:t, updatedAt:t });
    STATE.progress[id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };

    if (STATE.session.inProgress) STATE.session.queue = buildQueue();

    saveState();
    toast("salvo ✅ (entrou no topo)");
    beep("ding");
    msg.textContent = "salvo ✅ entrou no topo";

    $("#inJp").value = "";
    $("#inPt").value = "";
    $("#inNW").value = "";

    render();
    return;
  }

  if (act === "editPhrase") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    renderEdit(id);
    return;
  }

  if (act === "saveEdit") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    const p = getPhrase(id);
    if (!p) return;

    const jp = ($("#inJp")?.value || "").trim();
    const pt = ($("#inPt")?.value || "").trim();
    const nw = parseNewWords($("#inNW")?.value || "");
    const msg = $("#editMsg");

    if (!jp || !pt) { msg.textContent = "preencha jp e pt."; toast("faltou jp/pt"); beep("tuk"); return; }
    if (!isValidJP(jp)) { msg.textContent = "jp invalido. dica: 仕事{しごと} ou （ ）"; toast("jp invalido"); beep("tuk"); return; }
    for (const w of nw) {
      if (!isValidJP(w.jp)) { msg.textContent = "palavra nova jp invalida."; toast("palavra invalida"); beep("tuk"); return; }
    }

    p.jp = jp;
    p.pt = pt;
    p.newWords = nw;
    p.updatedAt = now();

    saveState();
    toast("alterado ✅");
    beep("ding");
    msg.textContent = "alterado ✅";
    nav("#/manage");
    return;
  }

  if (act === "deletePhrase") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    const ok = confirm("excluir esta frase? (sem desfazer)");
    if (!ok) return;

    const removed = deletePhraseById(id);
    if (!removed) return;

    toast("excluida ✅");
    beep("tuk");
    vibrate([8]);

    if (route() === "#/manage") renderManage();
    if (route() === "#/105x") {
      render105xBodyOnly();
      renderPhraseListOnly();
    }
    return;
  }

  if (act === "export") {
    const msg = $("#backupMsg");
    const payload = { schema: "jp_105x_backup_v1", exportedAt: new Date().toISOString(), state: STATE };
    const txt = JSON.stringify(payload, null, 2);

    navigator.clipboard?.writeText(txt).then(() => {
      msg.textContent = "copiado pro clipboard ✅";
      toast("backup copiado ✅");
      beep("ding");
    }).catch(() => {
      msg.textContent = "nao deu pra copiar. selecione e copie manualmente.";
      toast("copie manualmente");
      beep("tuk");
      const box = $("#importBox");
      if (box) box.value = txt;
    });
    return;
  }

  if (act === "import") {
    const box = $("#importBox");
    const msg = $("#backupMsg");
    const raw = (box?.value || "").trim();
    if (!raw) { msg.textContent = "cole o json primeiro."; toast("sem json"); beep("tuk"); return; }

    const parsed = safeJSONParse(raw);
    if (!parsed || parsed.schema !== "jp_105x_backup_v1" || !parsed.state) {
      msg.textContent = "json invalido.";
      toast("json invalido");
      beep("tuk");
      return;
    }

    const st = parsed.state;
    if (!st.bank?.phrases || !Array.isArray(st.bank.phrases)) {
      msg.textContent = "backup incompleto.";
      toast("backup incompleto");
      beep("tuk");
      return;
    }

    for (const p of st.bank.phrases) {
      if (!isValidJP(p.jp || "")) {
        msg.textContent = "backup tem jp invalido.";
        toast("jp invalido no backup");
        beep("tuk");
        return;
      }
    }

    STATE = st;
    saveState();
    toast("importado ✅");
    beep("ding");
    refreshHUD();
    nav("#/home");
    return;
  }

  if (act === "toggleSound") {
    unlockAudio();
    STATE.prefs.audio.enabled = !STATE.prefs.audio.enabled;
    saveState();
    toast(STATE.prefs.audio.enabled ? "som ligado" : "som desligado");
    refreshHUD();
    render();
    return;
  }

  if (act === "toggleVibe") {
    STATE.prefs.haptics.enabled = !STATE.prefs.haptics.enabled;
    saveState();
    toast(STATE.prefs.haptics.enabled ? "vibracao ligada" : "vibracao desligada");
    refreshHUD();
    render();
    return;
  }

  if (act === "reset") {
    localStorage.removeItem(LS_KEY);
    STATE = defaultState();
    saveState();
    toast("resetado. seed voltou ✅");
    beep("ding");
    nav("#/home");
    return;
  }

  if (btn.id === "hudSound") {
    unlockAudio();
    STATE.prefs.audio.enabled = !STATE.prefs.audio.enabled;
    saveState();
    refreshHUD();
    toast(STATE.prefs.audio.enabled ? "som ligado" : "som desligado");
    return;
  }

  if (btn.id === "hudVibe") {
    STATE.prefs.haptics.enabled = !STATE.prefs.haptics.enabled;
    saveState();
    refreshHUD();
    toast(STATE.prefs.haptics.enabled ? "vibracao ligada" : "vibracao desligada");
    return;
  }
});

document.addEventListener("input", (e) => {
  const el = e.target;
  if (el && el.id === "vol") {
    const v = Number(el.value);
    STATE.prefs.audio.volume = clamp(v, 0, 1);
    saveState();
  }
});

/* ---------- hash change ---------- */
window.addEventListener("hashchange", () => {
  render();
  startStudyTimerIfOn105x();
});

/* ---------- boot ---------- */
(function init() {
  refreshHUD();
  if (!location.hash) nav("#/home");
  render();
  startStudyTimerIfOn105x();
})();
