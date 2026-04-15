/* =========================================================
   NIHONGO321 v7
   núcleo consolidado
   - admin claro
   - premium mais inequívoco
   - tutorial passo a passo
   - Sensei IA
   - treino 105x
   - gerenciamento, backup e skills
   ========================================================= */

const LS_KEY = "jp_105x_v7";

/* ========= CONFIG COMERCIAL ========= */
const SALES = {
  monthlyPrice: "¥980",
  semiannualPrice: "¥4.980 / 6 meses",
  checkoutUrl: "https://SEU-CHECKOUT-AQUI",
  appStoreUrl: "https://apps.apple.com/",
  playStoreUrl: "https://play.google.com/store",
  supportEmail: "seuemail@exemplo.com"
};

/* ========= ADMIN TESTE =========
   ALTERAR ANTES DE PUBLICAR
*/
const ADMIN = {
  passcode: "NAKATA321",
  hint: "senha de admin para testes internos",
  label: "modo admin"
};

const PREMIUM_TOPIC_IDS = new Set([
  "topic_factory",
  "topic_airport",
  "topic_post",
  "topic_cityhall",
  "topic_konbini",
  "topic_market",
  "topic_bike",
  "topic_cinema",
  "topic_department",
  "topic_trip",
  "topic_qa"
]);

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const now = () => Date.now();
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const uid = (p = "id") => `${p}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

const escapeHTML = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function fmtHMSDays(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const rem = totalSec % 86400;
  const hh = String(Math.floor(rem / 3600)).padStart(2, "0");
  const mm = String(Math.floor((rem % 3600) / 60)).padStart(2, "0");
  const ss = String(rem % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss} (${days}d)`;
}

function fmtDateShort(ts) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function addDaysTS(ts, days) {
  return ts + days * 24 * 60 * 60 * 1000;
}

function downloadTextFile(filename, text, mime = "application/json") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function normalizeName(s) {
  return String(s || "").trim().replace(/\s+/g, " ").slice(0, 50);
}

/* ---------- rota ---------- */
function routeInfo() {
  const h = location.hash || "#/landing";
  const raw = h.startsWith("#/") ? h.slice(2) : "landing";
  const [pathRaw, q] = raw.split("?");
  const path = `#/${pathRaw || "landing"}`;
  const params = {};

  if (q) {
    for (const part of q.split("&")) {
      const [k, v] = part.split("=");
      if (!k) continue;
      params[decodeURIComponent(k)] = decodeURIComponent(v || "");
    }
  }

  return { path, params };
}

function route() {
  return routeInfo().path;
}

function nav(hash) {
  location.hash = hash;
}

/* ---------- validação JP ---------- */
const JP_ALLOWED_RE =
  /^[A-Za-z\uFF21-\uFF3A\uFF41-\uFF5A\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF 　。、！？・ー\-~!?.,:;()（）「」『』【】［］…\n\r\t0-9\uFF10-\uFF19{}%％＋+／/＝=＆&・'’"”“#＃]*$/;

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

/* ---------- furigana ---------- */
const FURI_RE = /([^{}\s]+)\{([^{}]+)\}/g;
const HIRAGANA_RE = /^[\u3040-\u309Fー\s]+$/;
const KATAKANA_RE = /^[\u30A0-\u30FFー\s]+$/;
const KANJI_RE = /[\u4E00-\u9FFF]/;

function jpStripFurigana(raw) {
  return String(raw || "").replace(FURI_RE, (_, base) => base);
}

function jpHasFurigana(raw) {
  FURI_RE.lastIndex = 0;
  return FURI_RE.test(String(raw || ""));
}

function jpToInlineFurigana(raw) {
  return String(raw || "").replace(FURI_RE, (_, base, reading) => `${base} (${reading.trim()})`);
}

function explainWordType(raw) {
  const clean = String(raw || "").trim();
  if (!clean) return "Vocabulário";
  if (jpHasFurigana(clean)) return "Kanji";
  const plain = jpStripFurigana(clean);
  if (KANJI_RE.test(plain)) return "Kanji";
  if (HIRAGANA_RE.test(plain)) return "Hiragana";
  if (KATAKANA_RE.test(plain)) return "Katakana";
  return "Vocabulário";
}

function formatWordExplanation(word) {
  const raw = String(word?.jp || "").trim();
  const pt = String(word?.pt || "").trim();
  const label = explainWordType(raw);
  const value = jpHasFurigana(raw) ? jpToInlineFurigana(raw) : jpStripFurigana(raw);
  return `${label}: ${value} = ${pt}`;
}

/* ---------- tópicos / seed ---------- */
function topicPalette() {
  return ["tRose", "tViolet", "tBlue", "tCyan", "tGreen", "tAmber", "tPink", "tMint"];
}

function pickTopicColor(i) {
  const p = topicPalette();
  return p[i % p.length];
}

function defaultTopic() {
  const t = now();
  return {
    id: "topic_default",
    name: "Frases aleatórias",
    color: "tViolet",
    createdAt: t,
    updatedAt: t
  };
}

const TOPIC_SEEDS = [
  {
    id: "topic_default",
    name: "Frases aleatórias",
    color: "tViolet",
    phrases: [
      {
        id: "seed_random_001",
        jp: "大丈夫{だいじょうぶ} です。ゆっくり お願{ねが}いします。",
        pt: "Está tudo bem. Devagar, por favor.",
        newWords: [
          { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / sem problema" },
          { jp: "ゆっくり", pt: "devagar" },
          { jp: "お願{ねが}いします", pt: "por favor" }
        ]
      },
      {
        id: "seed_random_002",
        jp: "もう 一度{いちど} 言{い}って ください。",
        pt: "Por favor, diga mais uma vez.",
        newWords: [
          { jp: "もう", pt: "novamente" },
          { jp: "一度{いちど}", pt: "uma vez" },
          { jp: "言{い}って", pt: "dizer" }
        ]
      },
      {
        id: "seed_random_003",
        jp: "今日{きょう} は ここで 待{ま}って います。",
        pt: "Hoje vou esperar aqui.",
        newWords: [
          { jp: "今日{きょう}", pt: "hoje" },
          { jp: "ここ", pt: "aqui" },
          { jp: "待{ま}って", pt: "esperar" }
        ]
      }
    ]
  },
  {
    id: "topic_factory",
    name: "Na Fábrica",
    color: "tRose",
    phrases: [
      {
        id: "seed_factory_001",
        jp: "この 機械{きかい} は もう 動{うご}いて いますか。",
        pt: "Esta máquina já está funcionando?",
        newWords: [
          { jp: "機械{きかい}", pt: "máquina" },
          { jp: "動{うご}いて", pt: "funcionando" }
        ]
      },
      {
        id: "seed_factory_002",
        jp: "次{つぎ} は 何{なに} を すれば いいですか。",
        pt: "O que devo fazer em seguida?",
        newWords: [
          { jp: "次{つぎ}", pt: "seguinte / próximo" },
          { jp: "何{なに}", pt: "o que" }
        ]
      }
    ]
  },
  {
    id: "topic_airport",
    name: "No Aeroporto",
    color: "tBlue",
    phrases: [
      {
        id: "seed_airport_001",
        jp: "搭乗口{とうじょうぐち} は どこ ですか。",
        pt: "Onde é o portão de embarque?",
        newWords: [
          { jp: "搭乗口{とうじょうぐち}", pt: "portão de embarque" }
        ]
      },
      {
        id: "seed_airport_002",
        jp: "荷物{にもつ} を 預{あず}けたいです。",
        pt: "Quero despachar a bagagem.",
        newWords: [
          { jp: "荷物{にもつ}", pt: "bagagem" },
          { jp: "預{あず}けたい", pt: "querer despachar" }
        ]
      }
    ]
  },
  {
    id: "topic_post",
    name: "No correio",
    color: "tAmber",
    phrases: [
      {
        id: "seed_post_001",
        jp: "この 荷物{にもつ} を ブラジル へ 送{おく}りたいです。",
        pt: "Quero enviar esta encomenda para o Brasil.",
        newWords: [
          { jp: "荷物{にもつ}", pt: "encomenda" },
          { jp: "送{おく}りたい", pt: "querer enviar" }
        ]
      },
      {
        id: "seed_post_002",
        jp: "追跡番号{ついせきばんごう} は ありますか。",
        pt: "Tem número de rastreio?",
        newWords: [
          { jp: "追跡番号{ついせきばんごう}", pt: "número de rastreio" }
        ]
      }
    ]
  },
  {
    id: "topic_cityhall",
    name: "Na Prefeitura",
    color: "tCyan",
    phrases: [
      {
        id: "seed_cityhall_001",
        jp: "住民票{じゅうみんひょう} を 取{と}りたいです。",
        pt: "Quero tirar o comprovante de residência.",
        newWords: [
          { jp: "住民票{じゅうみんひょう}", pt: "comprovante de residência" }
        ]
      },
      {
        id: "seed_cityhall_002",
        jp: "この 書類{しょるい} は どこへ 出{だ}しますか。",
        pt: "Onde entrego este documento?",
        newWords: [
          { jp: "書類{しょるい}", pt: "documento" },
          { jp: "出{だ}しますか", pt: "entrego?" }
        ]
      }
    ]
  },
  {
    id: "topic_konbini",
    name: "No Konbini",
    color: "tMint",
    phrases: [
      {
        id: "seed_konbini_001",
        jp: "レジ袋{ぶくろ} は 要{い}りません。",
        pt: "Não preciso de sacola.",
        newWords: [
          { jp: "レジ袋{ぶくろ}", pt: "sacola" },
          { jp: "要{い}りません", pt: "não preciso" }
        ]
      },
      {
        id: "seed_konbini_002",
        jp: "この お弁当{べんとう} を 温{あたた}めて ください。",
        pt: "Por favor, aqueça este bentô.",
        newWords: [
          { jp: "お弁当{べんとう}", pt: "bentô" },
          { jp: "温{あたた}めて", pt: "aquecer" }
        ]
      }
    ]
  },
  {
    id: "topic_market",
    name: "No Mercado",
    color: "tGreen",
    phrases: [
      {
        id: "seed_market_001",
        jp: "この 商品{しょうひん} は 売{う}り切{き}れ ですか。",
        pt: "Este produto está esgotado?",
        newWords: [
          { jp: "商品{しょうひん}", pt: "produto" },
          { jp: "売{う}り切{き}れ", pt: "esgotado" }
        ]
      },
      {
        id: "seed_market_002",
        jp: "賞味期限{しょうみきげん} は いつ ですか。",
        pt: "Qual é a data de validade?",
        newWords: [
          { jp: "賞味期限{しょうみきげん}", pt: "data de validade" }
        ]
      }
    ]
  },
  {
    id: "topic_bike",
    name: "Na Loja de Bicicletas",
    color: "tPink",
    phrases: [
      {
        id: "seed_bike_001",
        jp: "チェーン が 外{はず}れました。見{み}て もらえますか。",
        pt: "A corrente soltou. Pode dar uma olhada?",
        newWords: [
          { jp: "チェーン", pt: "corrente" },
          { jp: "外{はず}れました", pt: "soltou" }
        ]
      },
      {
        id: "seed_bike_002",
        jp: "パンク 修理{しゅうり} は いくら ですか。",
        pt: "Quanto custa o conserto do pneu furado?",
        newWords: [
          { jp: "パンク", pt: "pneu furado" },
          { jp: "修理{しゅうり}", pt: "conserto" }
        ]
      }
    ]
  },
  {
    id: "topic_cinema",
    name: "No Cinema",
    color: "tBlue",
    phrases: [
      {
        id: "seed_cinema_001",
        jp: "次{つぎ} の 上映{じょうえい} は 何時{なんじ} ですか。",
        pt: "A que horas é a próxima sessão?",
        newWords: [
          { jp: "上映{じょうえい}", pt: "sessão / exibição" }
        ]
      },
      {
        id: "seed_cinema_002",
        jp: "チケット を 二枚{にまい} お願{ねが}いします。",
        pt: "Dois ingressos, por favor.",
        newWords: [
          { jp: "チケット", pt: "ingresso" },
          { jp: "二枚{にまい}", pt: "duas unidades" }
        ]
      }
    ]
  },
  {
    id: "topic_department",
    name: "Na Loja de Departamentos",
    color: "tAmber",
    phrases: [
      {
        id: "seed_department_001",
        jp: "この サイズ は ありますか。",
        pt: "Tem este tamanho?",
        newWords: [
          { jp: "サイズ", pt: "tamanho" }
        ]
      },
      {
        id: "seed_department_002",
        jp: "試着室{しちゃくしつ} は どこ ですか。",
        pt: "Onde fica o provador?",
        newWords: [
          { jp: "試着室{しちゃくしつ}", pt: "provador" }
        ]
      }
    ]
  },
  {
    id: "topic_trip",
    name: "Na Viagem",
    color: "tGreen",
    phrases: [
      {
        id: "seed_trip_001",
        jp: "この 電車{でんしゃ} は 名古屋{なごや} へ 行{い}きますか。",
        pt: "Este trem vai para Nagoya?",
        newWords: [
          { jp: "電車{でんしゃ}", pt: "trem" },
          { jp: "行{い}きますか", pt: "vai?" }
        ]
      },
      {
        id: "seed_trip_002",
        jp: "次{つぎ} の バス は いつ 来{き}ますか。",
        pt: "Quando vem o próximo ônibus?",
        newWords: [
          { jp: "バス", pt: "ônibus" },
          { jp: "来{き}ますか", pt: "vem?" }
        ]
      }
    ]
  },
  {
    id: "topic_qa",
    name: "Perguntas e Respostas",
    color: "tRose",
    phrases: [
      {
        id: "seed_qa_001",
        jp: "お名前{なまえ} は 何{なん} ですか。",
        pt: "Qual é o seu nome?",
        newWords: [
          { jp: "名前{なまえ}", pt: "nome" }
        ]
      },
      {
        id: "seed_qa_002",
        jp: "はい、わかりました。",
        pt: "Sim, entendi.",
        newWords: [
          { jp: "わかりました", pt: "entendi" }
        ]
      }
    ]
  }
];

function ensureSeedCatalog(st) {
  const t = now();

  st.bank ||= {};
  st.bank.topics ||= [];
  st.bank.phrases ||= [];
  st.progress ||= {};

  const existingTopics = st.bank.topics;
  const topicNameMap = new Map(existingTopics.map(topic => [String(topic.name || "").toLowerCase(), topic]));

  for (let i = 0; i < TOPIC_SEEDS.length; i++) {
    const seedTopic = TOPIC_SEEDS[i];
    let topic = existingTopics.find(x => x.id === seedTopic.id) || topicNameMap.get(seedTopic.name.toLowerCase());

    if (!topic) {
      topic = {
        id: seedTopic.id,
        name: seedTopic.name,
        color: seedTopic.color || pickTopicColor(i),
        createdAt: t,
        updatedAt: t
      };
      existingTopics.push(topic);
      topicNameMap.set(topic.name.toLowerCase(), topic);
    } else {
      topic.name = topic.name || seedTopic.name;
      topic.color = topic.color || seedTopic.color || pickTopicColor(i);
      topic.updatedAt ||= t;
      topic.createdAt ||= t;
      if (!topic.id) topic.id = seedTopic.id;
    }

    for (const phrase of seedTopic.phrases) {
      const already = st.bank.phrases.find(p => p.id === phrase.id);

      if (already) {
        already.topicId = topic.id;
        already.newWords = Array.isArray(already.newWords) && already.newWords.length
          ? already.newWords
          : phrase.newWords;
        continue;
      }

      st.bank.phrases.push({
        id: phrase.id,
        jp: phrase.jp,
        pt: phrase.pt,
        newWords: phrase.newWords || [],
        topicId: topic.id,
        createdAt: t,
        updatedAt: t
      });

      if (!st.progress[phrase.id]) {
        st.progress[phrase.id] = {
          status: "training",
          cycleStart: 14,
          count: 14,
          masteredAt: null,
          history: []
        };
      }
    }
  }

  return st;
}

/* ---------- state ---------- */
function defaultState() {
  const t = now();
  const top = defaultTopic();

  const st = {
    app: { schemaVersion: 7, createdAt: t, updatedAt: t },

    prefs: {
      audio: { enabled: true, volume: 0.35, unlocked: false },
      haptics: { enabled: true }
    },

    monetization: {
      premiumUnlocked: false,
      seenPaywall: false
    },

    admin: {
      unlocked: false,
      lastLoginAt: null
    },

    stats: {
      coins: 0,
      bestCoins: 0,
      cyclesDone: 0,
      phrasesMastered: 0,
      listens: 0,
      calls: 0
    },

    habit: {
      firstDay: null,
      days: {}
    },

    aiStudio: {
      history: []
    },

    tutorial: {
      done: false,
      currentStep: 0,
      completedAt: null
    },

    bank: {
      topics: [top],
      phrases: []
    },

    progress: {},

    session: {
      inProgress: false,
      queue: [],
      index: 0,
      phraseId: null,
      callMode: false,
      topicFilter: "ALL",
      study: { day: todayKey(), totalMs: 0, running: false, runStartAt: null }
    },

    ui: {
      lastToast: "",
      collapsedTopics: {}
    }
  };

  return ensureSeedCatalog(st);
}

function migrateToV7(st) {
  if (!st || !st.app) return defaultState();

  st.app.schemaVersion = 7;
  st.bank ||= {};
  st.bank.topics ||= [];
  st.bank.phrases ||= [];
  st.progress ||= {};
  st.ui ||= {};
  st.ui.collapsedTopics ||= {};
  st.session ||= {};
  st.session.topicFilter ||= "ALL";
  st.session.study ||= { day: todayKey(), totalMs: 0, running: false, runStartAt: null };

  st.stats ||= {};
  st.stats.listens ||= 0;
  st.stats.calls ||= 0;

  st.habit ||= { firstDay: null, days: {} };
  st.habit.days ||= {};

  st.monetization ||= { premiumUnlocked: false, seenPaywall: false };
  st.aiStudio ||= { history: [] };
  st.admin ||= { unlocked: false, lastLoginAt: null };
  st.tutorial ||= { done: false, currentStep: 0, completedAt: null };

  let def = st.bank.topics.find(t => t.id === "topic_default");
  if (!def) {
    def = defaultTopic();
    st.bank.topics.unshift(def);
  }

  for (const p of st.bank.phrases) {
    if (!p.topicId) p.topicId = def.id;
  }

  return ensureSeedCatalog(st);
}

function loadState() {
  const keys = ["jp_105x_v7", "jp_105x_v6", "jp_105x_v5", "jp_105x_v4", "jp_105x_v3", "jp_105x_v2"];

  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    const parsed = safeJSONParse(raw);
    if (parsed && parsed.app) {
      const migrated = migrateToV7(parsed);
      localStorage.setItem(LS_KEY, JSON.stringify(migrated));
      return migrated;
    }
  }

  return defaultState();
}

let STATE = loadState();

function saveState() {
  STATE.app.updatedAt = now();
  localStorage.setItem(LS_KEY, JSON.stringify(STATE));
}

/* ---------- áudio ---------- */
let audioCtx = null;
let callBusy = false;

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

  let freq = 220;
  let dur = 0.06;
  if (type === "ding") { freq = 660; dur = 0.09; }
  if (type === "pop") { freq = 520; dur = 0.05; }
  if (type === "tuk") { freq = 140; dur = 0.06; }
  if (type === "level") { freq = 840; dur = 0.12; }

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

/* ---------- ui base ---------- */
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

/* ---------- premium / admin ---------- */
function isPremiumUnlocked() {
  return !!STATE.monetization?.premiumUnlocked;
}

function isAdminUnlocked() {
  return !!STATE.admin?.unlocked;
}

function unlockAdminSuccess() {
  STATE.admin.unlocked = true;
  STATE.admin.lastLoginAt = now();
  saveState();
}

function logoutAdmin() {
  STATE.admin.unlocked = false;
  saveState();
}

function isTopicPremium(topicId) {
  return PREMIUM_TOPIC_IDS.has(topicId);
}

function canAccessTopic(topicId) {
  if (!isTopicPremium(topicId)) return true;
  return isPremiumUnlocked();
}

function openCheckout() {
  if (SALES.checkoutUrl && SALES.checkoutUrl.startsWith("http")) {
    window.open(SALES.checkoutUrl, "_blank", "noopener,noreferrer");
    return;
  }
  toast("edite o checkoutUrl no app.js");
}

function markPremiumDemoUnlock() {
  STATE.monetization.premiumUnlocked = true;
  saveState();
  refreshHUD();
}

function markPremiumLocked() {
  STATE.monetization.premiumUnlocked = false;
  STATE.session.topicFilter = "ALL";
  saveState();
}

function showPremiumLockedMessage(topicId) {
  const name = topicName(topicId);
  toast(`${name} é premium 🔒`);
  STATE.monetization.seenPaywall = true;
  saveState();
  nav("#/premium");
}

/* ---------- habit ---------- */
function ensureHabitToday() {
  const k = todayKey();
  STATE.habit ||= { firstDay: null, days: {} };
  STATE.habit.days ||= {};

  if (!STATE.habit.firstDay) STATE.habit.firstDay = k;

  if (!STATE.habit.days[k]) {
    STATE.habit.days[k] = { ms: 0, cycles: 0, listens: 0, calls: 0 };
  }

  return k;
}

function syncHabitMs() {
  const k = ensureHabitToday();
  const ms = getStudyMs();
  STATE.habit.days[k].ms = ms;
  saveState();
}

function habitBump(_key, field, amount = 1) {
  const k = ensureHabitToday();
  STATE.habit.days[k][field] = (STATE.habit.days[k][field] || 0) + amount;
  saveState();
}

/* ---------- tutorial ---------- */
const TUTORIAL_STEPS = [
  {
    title: "Entenda o método",
    text: "O Nihongo321 usa repetição guiada para treinar memória, ouvido e fala com japonês funcional."
  },
  {
    title: "Comece pelo grátis",
    text: "A versão grátis serve para provar valor logo no primeiro clique com treino 105x e frases iniciais."
  },
  {
    title: "Use o botão COMEÇAR AGORA",
    text: "Entre no treino, ouça a frase, leia a tradução e repita em voz alta."
  },
  {
    title: "Toque em ‘repeti e entendi’",
    text: "Cada toque avança no ciclo. Ao fechar um ciclo, você ganha moedas e treina sua memória."
  },
  {
    title: "Escolha um tópico",
    text: "Você pode estudar tudo junto ou filtrar por conteúdo específico."
  },
  {
    title: "Use o premium para ir mais longe",
    text: "No premium ficam os tópicos de vida real e o Sensei IA para criar material focado na sua rotina."
  }
];

function tutorialCurrentStep() {
  return clamp(STATE.tutorial?.currentStep || 0, 0, TUTORIAL_STEPS.length - 1);
}

function completeTutorial() {
  STATE.tutorial.done = true;
  STATE.tutorial.currentStep = TUTORIAL_STEPS.length - 1;
  STATE.tutorial.completedAt = now();
  saveState();
}

/* ---------- tópicos ---------- */
function getTopic(id) {
  return (STATE.bank.topics || []).find(t => t.id === id) || null;
}

function topicName(id) {
  return getTopic(id)?.name || "Sem tópico";
}

function ensureDefaultTopic() {
  let def = STATE.bank.topics.find(t => t.id === "topic_default");
  if (!def) {
    def = defaultTopic();
    STATE.bank.topics.unshift(def);
    saveState();
  }
  return def;
}

function ensurePhrasesHaveValidTopic() {
  ensureSeedCatalog(STATE);
  const def = ensureDefaultTopic();
  const topics = new Set((STATE.bank.topics || []).map(t => t.id));
  let changed = false;

  for (const p of (STATE.bank.phrases || [])) {
    if (!p.topicId || !topics.has(p.topicId)) {
      p.topicId = def.id;
      changed = true;
    }
  }

  if (changed) saveState();
}

function createTopic(name) {
  const n = normalizeName(name);
  if (!n) return null;

  const exists = STATE.bank.topics.some(t => t.name.toLowerCase() === n.toLowerCase());
  if (exists) return null;

  const t = now();
  const id = uid("topic");
  const color = pickTopicColor(STATE.bank.topics.length);

  const topic = { id, name: n, color, createdAt: t, updatedAt: t };
  STATE.bank.topics.unshift(topic);
  saveState();
  return topic;
}

function createTopicIfMissing(name) {
  const n = normalizeName(name);
  if (!n) return ensureDefaultTopic();

  let existing = STATE.bank.topics.find(t => t.name.toLowerCase() === n.toLowerCase());
  if (existing) return existing;

  const created = createTopic(n);
  return created || ensureDefaultTopic();
}

function deleteTopic(topicId) {
  const def = ensureDefaultTopic();
  if (topicId === def.id) return false;

  for (const p of STATE.bank.phrases) {
    if (p.topicId === topicId) p.topicId = def.id;
  }

  const idx = STATE.bank.topics.findIndex(t => t.id === topicId);
  if (idx >= 0) STATE.bank.topics.splice(idx, 1);

  if (STATE.ui?.collapsedTopics) delete STATE.ui.collapsedTopics[topicId];
  if (STATE.session.topicFilter === topicId) STATE.session.topicFilter = "ALL";

  saveState();
  return true;
}

function topicPhraseIds(topicId) {
  return (STATE.bank.phrases || []).filter(p => p.topicId === topicId).map(p => p.id);
}

function clearTopic(topicId) {
  const ids = new Set(topicPhraseIds(topicId));
  if (!ids.size) return 0;

  STATE.bank.phrases = STATE.bank.phrases.filter(p => !ids.has(p.id));
  for (const id of ids) delete STATE.progress[id];

  if (Array.isArray(STATE.session.queue) && STATE.session.queue.length) {
    STATE.session.queue = STATE.session.queue.filter(x => !ids.has(x));
  }

  if (ids.has(STATE.session.phraseId)) {
    STATE.session.phraseId = STATE.session.queue[0] || null;
    STATE.session.index = 0;
  }

  saveState();
  return ids.size;
}

/* ---------- fila ---------- */
function getProg(id) {
  if (!STATE.progress[id]) {
    STATE.progress[id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      masteredAt: null,
      history: []
    };
  }
  return STATE.progress[id];
}

function phrasesByFilter() {
  const tf = STATE.session.topicFilter || "ALL";

  if (tf === "ALL") {
    return STATE.bank.phrases.filter(p => canAccessTopic(p.topicId));
  }

  return STATE.bank.phrases.filter(p => p.topicId === tf && canAccessTopic(p.topicId));
}

function buildQueue() {
  const list = phrasesByFilter();
  const training = [];
  const mastered = [];

  for (const p of list) {
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
  if (!q.length) {
    toast("sem frases neste filtro");
    return false;
  }

  const next = STATE.session.index + 1;
  if (next >= q.length) {
    toast("você já está na última frase ✅");
    beep("tuk");
    return false;
  }

  STATE.session.index = next;
  STATE.session.phraseId = q[STATE.session.index];
  resetCountForPhrase(STATE.session.phraseId);
  saveState();
  return true;
}

function prevPhrase() {
  const q = STATE.session.queue;
  if (!q.length) return false;

  const prev = STATE.session.index - 1;
  if (prev < 0) {
    toast("você já está na primeira frase ✅");
    beep("tuk");
    return false;
  }

  STATE.session.index = prev;
  STATE.session.phraseId = q[STATE.session.index];
  resetCountForPhrase(STATE.session.phraseId);
  saveState();
  return true;
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

  toast("pulou. próxima ✅");
  beep("tuk");
}

/* ---------- progresso ---------- */
function sum1to(n) {
  return (n * (n + 1)) / 2;
}

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

/* ---------- áudio de fala ---------- */
function segmentText(text) {
  return [...String(text || "")];
}

function setKanaLine(el, rawText) {
  const plain = jpStripFurigana(rawText);
  const segs = segmentText(plain);
  el.innerHTML = segs.map((s, i) => `<span class="kseg" data-idx="${i}">${escapeHTML(s)}</span>`).join("");
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

  const plain = jpStripFurigana(rawText);
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

  try {
    speechSynthesis.cancel();
  } catch {}

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
  STATE.stats.listens = (STATE.stats.listens || 0) + 1;
  habitBump(todayKey(), "listens", 1);

  const ok = ttsSpeak(
    plain,
    rate,
    () => karaokePlay(kanaEl, plain, rate),
    () => {}
  );

  if (!ok) toast("sem áudio. mas dá pra treinar lendo.");
}

function callAndResponse(jpRaw, rate, kanaEl, onDone) {
  if (callBusy) {
    toast("espera o ciclo terminar ✅");
    return;
  }

  callBusy = true;

  const plain = jpStripFurigana(jpRaw);
  STATE.stats.calls = (STATE.stats.calls || 0) + 1;
  habitBump(todayKey(), "calls", 1);

  const ok = ttsSpeak(
    plain,
    rate,
    () => karaokePlay(kanaEl, plain, rate),
    () => {}
  );

  const t = estimateDurationMs(plain, rate);

  setTimeout(() => {
    showNowYouSheet(() => {
      callBusy = false;
      onDone && onDone();
    });
  }, t + 90);

  if (!ok) {
    callBusy = false;
    toast("sem áudio. mas dá pra treinar lendo.");
  }
}

function showNowYouSheet(onDone) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;

  sheet.style.display = "block";
  sheet.innerHTML = `
    <div class="stamp">agora você ✅</div>
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

/* ---------- engine ---------- */
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
    renderPhraseListOnly();
    return;
  }

  pr.history.push({ at: now(), event: "cycle_done", cycleStart: cs });
  STATE.stats.cyclesDone = (STATE.stats.cyclesDone || 0) + 1;
  habitBump(todayKey(), "cycles", 1);

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
  renderPhraseListOnly();
}

function showCycleSheet(masteredNow) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;

  sheet.style.display = "block";

  const msg = masteredNow
    ? "frase dominada. sua memória foi treinada mais uma vez ✅"
    : "ciclo fechado. mais 100 moedas 🪙";

  sheet.innerHTML = `
    <div class="stamp">parabéns 👏</div>
    <div class="small">${escapeHTML(msg)}</div>
    <div class="row">
      <button class="btn btn--ok btn--full" data-action="next">próxima frase ▶</button>
    </div>
  `;
}

/* ---------- timer ---------- */
let timerTickId = null;

function ensureStudyDay() {
  const k = todayKey();

  if (!STATE.session.study) {
    STATE.session.study = { day: k, totalMs: 0, running: false, runStartAt: null };
  }

  if (STATE.session.study.day !== k) {
    STATE.session.study.day = k;
    STATE.session.study.totalMs = 0;
    STATE.session.study.running = false;
    STATE.session.study.runStartAt = null;
    saveState();
  }

  ensureHabitToday();
}

function startStudyTimerIfOn105x() {
  ensureStudyDay();

  const on105x = route() === "#/105x";
  const st = STATE.session.study;

  if (!on105x) {
    if (st.running && st.runStartAt) {
      st.totalMs += now() - st.runStartAt;
      st.running = false;
      st.runStartAt = null;
      saveState();
    }
    stopTimerTick();
    syncHabitMs();
    return;
  }

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

  timerTickId = setInterval(() => {
    updateStudyUI();
    syncHabitMs();
  }, 1000);
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
  el.textContent = fmtHMSDays(ms);

  const goal = 10 * 60 * 1000;
  const pct = clamp(ms / goal, 0, 1);
  fill.style.transform = `scaleX(${pct})`;
}

/* ---------- render helpers ---------- */
function renderNewWords(list) {
  if (!Array.isArray(list) || list.length === 0) return "";

  const rows = list
    .map(w => `<div class="small">${escapeHTML(formatWordExplanation(w))}</div>`)
    .join("");

  return `
    <div class="sheet">
      <div class="small" style="font-weight:1000;margin-bottom:6px">explicação</div>
      ${rows}
    </div>
  `;
}

function renderTopicMiniPills(selectedId) {
  const topics = STATE.bank.topics || [];

  return `
    <div class="topicPills">
      <button class="pill ${selectedId === "ALL" ? "on" : ""}" data-action="topicFilter" data-id="ALL">tudo</button>
      ${topics.map(t => `
        <button class="pill ${t.id === selectedId ? "on" : ""} ${t.color} ${isTopicPremium(t.id) ? "isPremium" : ""}" data-action="topicFilter" data-id="${t.id}">
          ${escapeHTML(t.name)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderTopicHeader(topic, count, collapsed) {
  const premiumMark = isTopicPremium(topic.id) ? " 🔒" : "";
  return `
    <button class="topicHdr ${topic.color}" data-action="toggleTopic" data-id="${topic.id}">
      <span class="topicHdrL">
        <span class="topicDot"></span>
        <span class="topicName">${escapeHTML(topic.name)}${premiumMark}</span>
        <span class="topicCount">${count}</span>
      </span>
      <span class="topicChevron">${collapsed ? "▾" : "▴"}</span>
    </button>
  `;
}

function renderPlanCompareBox() {
  return `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">grátis x premium</div>
        <div class="badge">claro</div>
      </div>

      <div class="planGrid">
        <div class="planCard">
          <div class="planTop">
            <h3 class="planName">Grátis</h3>
            <span class="planTag">entrada</span>
          </div>
          <div class="planPrice">¥0 <small>/ começar</small></div>
          <p class="planSub">Para sentir o método no primeiro uso.</p>
          <ul class="planList">
            <li>treino 105x</li>
            <li>frases aleatórias</li>
            <li>ouvir e repetir</li>
            <li>backup local</li>
          </ul>
        </div>

        <div class="planCard premium">
          <div class="planTop">
            <h3 class="planName">Premium</h3>
            <span class="planTag">mais valor</span>
          </div>
          <div class="planPrice">${SALES.monthlyPrice} <small>/ mês</small></div>
          <p class="planSub">Para estudar com foco na vida real.</p>
          <ul class="planList">
            <li>packs por situação real</li>
            <li>Sensei IA</li>
            <li>mais material útil</li>
            <li>mais retenção e evolução</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/* ---------- landing ---------- */
function renderLanding() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card heroCard stack">
        <div class="badge">japonês funcional para quem não tem tempo</div>
        <h1 class="heroTitle">Aprenda o japonês que faz diferença na vida real, mesmo cansado depois do turno.</h1>
        <p class="heroLead">
          O Nihongo321 treina memória, repetição e uso prático com frases para fábrica, mercado, hospital, prefeitura, konbini e cotidiano no Japão.
        </p>

        <div class="heroActions">
          <button class="bigBtn" data-nav="#/home">testar grátis agora</button>
          <button class="btn btn--ghost btn--full" data-nav="#/premium">ver premium</button>
        </div>

        <div class="heroMiniStats">
          <div class="statCard">
            <div class="statVal">105x</div>
            <div class="statLbl">método de repetição</div>
          </div>
          <div class="statCard">
            <div class="statVal">5 min</div>
            <div class="statLbl">treino possível</div>
          </div>
          <div class="statCard">
            <div class="statVal">Sensei IA</div>
            <div class="statLbl">material sob medida</div>
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">dor real do cliente</div>
          <div class="badge">solução prática</div>
        </div>

        <div class="valueGrid">
          <div class="valueCard">
            <div class="valueIcon">⏳</div>
            <h3 class="valueTitle">sem tempo para estudar</h3>
            <p class="valueText">Treino curto e direto para quem chega cansado do trabalho e ainda quer evoluir.</p>
          </div>

          <div class="valueCard">
            <div class="valueIcon">🧠</div>
            <h3 class="valueTitle">memória sem treino</h3>
            <p class="valueText">O 105x ajuda a reforçar memorização, repetição e segurança para usar o idioma.</p>
          </div>

          <div class="valueCard">
            <div class="valueIcon">🗣️</div>
            <h3 class="valueTitle">nihongo funcional</h3>
            <p class="valueText">Nada de teoria solta. O foco é falar melhor na vida real do Japão.</p>
          </div>

          <div class="valueCard">
            <div class="valueIcon">🤖</div>
            <h3 class="valueTitle">Sensei IA</h3>
            <p class="valueText">No premium, o usuário pede um tema real e recebe material no formato ideal do app.</p>
          </div>
        </div>
      </section>

      ${renderPlanCompareBox()}

      <section class="ctaBand stack">
        <div class="badge">comece pelo certo</div>
        <h2 class="h2">Você não precisa de mais teoria. Precisa de treino certo, repetição certa e frases certas.</h2>
        <p class="p">Esse app existe para devolver ao brasileiro no Japão clareza, utilidade e crescimento real no dia a dia.</p>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/tutorial">ver tutorial</button>
          <button class="btn btn--full" data-nav="#/admin">admin / teste premium</button>
        </div>

        <div class="storeGrid">
          <a class="storeBtn" href="${escapeHTML(SALES.playStoreUrl)}" target="_blank" rel="noopener noreferrer">
            <span class="ic">▶</span><span>Google Play</span>
          </a>
          <a class="storeBtn" href="${escapeHTML(SALES.appStoreUrl)}" target="_blank" rel="noopener noreferrer">
            <span class="ic"></span><span>App Store</span>
          </a>
        </div>
      </section>
    </div>
  `;
}

/* ---------- premium ---------- */
function renderPremium() {
  const unlocked = isPremiumUnlocked();

  APP.innerHTML = `
    <div class="stack">
      <section class="premiumHero stack">
        <div class="badge">premium</div>
        <h1 class="h1">Desbloqueie o app que estuda com a sua realidade.</h1>
        <p class="p">
          O premium libera os tópicos práticos e o Sensei IA, para transformar necessidades reais da sua rotina em material pronto para treino.
        </p>

        ${renderPlanCompareBox()}

        <div class="lockCard">
          <h3 class="lockTitle">O que entra no premium</h3>
          <p class="lockText">
            Fábrica, aeroporto, correio, prefeitura, konbini, mercado, loja de bicicletas, cinema, loja de departamentos, viagem, perguntas práticas e Sensei IA.
          </p>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">O que o Sensei IA faz</h3>
          <p class="lockText">
            Você descreve sua necessidade. O app monta frases úteis, tradução e palavras novas no formato certo para o seu treino.
          </p>
        </div>

        <div class="planGrid">
          <div class="planCard premium">
            <div class="planTop">
              <h3 class="planName">Mensal</h3>
              <span class="planTag">assinatura</span>
            </div>
            <div class="planPrice">${SALES.monthlyPrice}<small>/ mês</small></div>
            <p class="planSub">Entrada leve para testar o app completo.</p>
            <ul class="planList">
              <li>todos os tópicos premium</li>
              <li>Sensei IA</li>
              <li>mais evolução e retenção</li>
            </ul>
            <div class="planFooter">
              <button class="btn btn--ok btn--full" data-action="checkout">assinar agora</button>
            </div>
          </div>

          <div class="planCard">
            <div class="planTop">
              <h3 class="planName">Semestral</h3>
              <span class="planTag">economia</span>
            </div>
            <div class="planPrice">${SALES.semiannualPrice}<small>/ foco</small></div>
            <p class="planSub">Melhor para compromisso e previsibilidade.</p>
            <ul class="planList">
              <li>mais estabilidade no estudo</li>
              <li>mais tempo para sentir resultado</li>
              <li>mais valor por cliente</li>
            </ul>
            <div class="planFooter">
              <button class="btn btn--full" data-action="checkout">quero esse plano</button>
            </div>
          </div>
        </div>

        ${unlocked ? `
          <div class="sheet stack">
            <div class="badge">premium liberado ✅</div>
            <div class="grid2">
              <button class="btn btn--ok btn--full" data-nav="#/sensei">abrir Sensei IA</button>
              <button class="btn btn--full" data-nav="#/home">ir para o app</button>
            </div>
          </div>
        ` : `
          <div class="sheet stack">
            <div class="small">Nesta demo, você pode testar o fluxo premium agora.</div>
            <div class="grid2">
              <button class="btn btn--ok btn--full" data-action="checkout">abrir checkout</button>
              <button class="btn btn--ghost btn--full" data-nav="#/admin">usar senha admin</button>
            </div>
          </div>
        `}

        <div class="small">Suporte: ${escapeHTML(SALES.supportEmail)}</div>
      </section>
    </div>
  `;
}

/* ---------- admin ---------- */
function renderAdmin() {
  const unlocked = isAdminUnlocked();
  const premium = isPremiumUnlocked();

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">admin</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Onde a senha é usada</h3>
          <p class="lockText">
            É aqui. Nesta área você entra como administrador para testar premium e validar a demo.
          </p>
        </div>

        ${unlocked ? `
          <div class="sheet stack">
            <div class="badge">admin liberado ✅</div>
            <div class="small">último login: ${STATE.admin.lastLoginAt ? fmtDateShort(STATE.admin.lastLoginAt) : "agora"}</div>

            <div class="grid2">
              <button class="btn btn--ok btn--full" data-action="unlockDemoPremium">liberar premium</button>
              <button class="btn btn--bad btn--full" data-action="lockDemoPremium">bloquear premium</button>
            </div>

            <div class="grid2">
              <button class="btn btn--ghost btn--full" data-nav="#/premium">ver premium</button>
              <button class="btn btn--full" data-nav="#/sensei">abrir Sensei IA</button>
            </div>

            <div class="small">status premium: ${premium ? "liberado" : "bloqueado"}</div>

            <button class="btn btn--muted btn--full" data-action="logoutAdmin">sair do admin</button>
          </div>
        ` : `
          <div class="sheet stack">
            <div class="small">Digite a senha de admin para testes internos.</div>
            <input id="adminPass" class="btn" style="height:56px; text-align:left" type="password" placeholder="senha admin" />
            <button class="btn btn--ok btn--full" data-action="loginAdmin">entrar como admin</button>
            <div class="small">senha atual para teste: <b>${escapeHTML(ADMIN.passcode)}</b></div>
          </div>
        `}

        <div class="small">Antes de publicar, troque a senha do código e remova a exibição dela nesta tela.</div>
      </section>
    </div>
  `;
}

/* ---------- home ---------- */
function renderHome() {
  ensurePhrasesHaveValidTopic();

  const topicFilter = STATE.session.topicFilter || "ALL";
  const filterLabel = topicFilter === "ALL" ? "tudo" : topicName(topicFilter);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">modo estudo</div>
          <button class="btn btn--ghost" data-nav="#/landing">página de venda</button>
        </div>

        <h1 class="h1">✨Super Memória✨</h1>
        <p class="p">Treino curto, japonês útil e repetição guiada para fortalecer memória e confiança.</p>

        <button class="bigBtn" id="btnStart">COMEÇAR AGORA</button>

        <div class="sep"></div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">separar por conteúdo</div>
            <div class="badge">agora: ${escapeHTML(filterLabel)}</div>
          </div>

          <div class="row">
            <select class="btn selectBtn" id="topicFilterSel" aria-label="filtro de tópicos">
              <option value="ALL">tudo</option>
              ${(STATE.bank.topics || []).map(t => {
                const locked = isTopicPremium(t.id) && !isPremiumUnlocked();
                return `<option value="${t.id}" ${t.id === topicFilter ? "selected" : ""}>${escapeHTML(t.name)}${locked ? " 🔒" : ""}</option>`;
              }).join("")}
            </select>
            <button class="btn btn--ghost" data-nav="#/manage">gerenciar</button>
          </div>

          <div class="small">Escolha um foco ou deixe em “tudo” para continuar evoluindo.</div>
        </div>

        <div class="row">
          <button class="btn" data-nav="#/105x">ir pro treino</button>
          <button class="btn" data-nav="#/edit">cadastro</button>
          <button class="btn" data-nav="#/backup">backup</button>
          <button class="btn btn--ghost" data-nav="#/skills">skills</button>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">seu tesouro</div>
          <div class="badge">🪙 ${STATE.stats.coins || 0}</div>
        </div>
        <div class="small">ciclos: ${STATE.stats.cyclesDone || 0} • dominadas: ${STATE.stats.phrasesMastered || 0}</div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">Sensei IA</div>
          <div class="badge">${isPremiumUnlocked() ? "liberado" : "premium"}</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Material feito para a sua necessidade</h3>
          <p class="lockText">
            Peça frases para fábrica, chefe, hospital, aluguel, viagem, mercado ou qualquer situação da sua vida no Japão.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/sensei">${isPremiumUnlocked() ? "abrir Sensei IA" : "ver Sensei IA"}</button>
          <button class="btn btn--full" data-nav="#/premium">${isPremiumUnlocked() ? "ver premium" : "desbloquear premium"}</button>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">tutorial</div>
          <div class="badge">${STATE.tutorial.done ? "concluído" : "recomendado"}</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Aprenda a usar o app do jeito certo</h3>
          <p class="lockText">
            O tutorial mostra como tirar valor do treino, do premium e do Sensei IA sem se perder.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/tutorial">${STATE.tutorial.done ? "rever tutorial" : "ver tutorial"}</button>
          <button class="btn btn--ghost btn--full" data-nav="#/admin">admin</button>
        </div>
      </section>

      ${!isPremiumUnlocked() ? `
        <section class="card stack">
          <div class="row row--between">
            <div class="badge">premium</div>
            <div class="badge">packs práticos</div>
          </div>
          <div class="lockCard">
            <h3 class="lockTitle">Desbloqueie os tópicos que mais pesam na vida real</h3>
            <p class="lockText">Fábrica, aeroporto, prefeitura, mercado, konbini, viagem e mais, além do Sensei IA.</p>
          </div>
          <div class="grid2">
            <button class="btn btn--ok btn--full" data-nav="#/premium">ver premium</button>
            <button class="btn btn--full" data-nav="#/admin">usar senha admin</button>
          </div>
        </section>
      ` : ""}
    </div>
  `;

  const startBtn = $("#btnStart");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startAuto();
      toast("vamos. só 1 frase por vez ✅");
    });
  }

  const sel = $("#topicFilterSel");
  if (sel) {
    sel.addEventListener("change", () => {
      const chosen = sel.value;

      if (chosen !== "ALL" && isTopicPremium(chosen) && !isPremiumUnlocked()) {
        showPremiumLockedMessage(chosen);
        sel.value = STATE.session.topicFilter || "ALL";
        return;
      }

      STATE.session.topicFilter = chosen;
      if (STATE.session.inProgress) {
        STATE.session.queue = buildQueue();
        STATE.session.index = 0;
        STATE.session.phraseId = STATE.session.queue[0] || null;
      }

      saveState();
      toast("filtro aplicado ✅");
      beep("ding");
      render();
    });
  }
}

/* ---------- tutorial ---------- */
function renderTutorial() {
  const step = tutorialCurrentStep();
  const item = TUTORIAL_STEPS[step];
  const pct = (step + 1) / TUTORIAL_STEPS.length;

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">tutorial</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">passo ${step + 1} de ${TUTORIAL_STEPS.length}</div>
            <div class="badge">${Math.round(pct * 100)}%</div>
          </div>

          <h2 class="h2">${escapeHTML(item.title)}</h2>
          <p class="p">${escapeHTML(item.text)}</p>

          <div class="pWrap" aria-label="progresso tutorial">
            <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
            <div class="pTxt">${Math.round(pct * 100)}%</div>
          </div>

          <div class="grid2">
            <button class="btn btn--muted btn--full" data-action="tutorialPrev">anterior</button>
            <button class="btn btn--ok btn--full" data-action="tutorialNext">${step >= TUTORIAL_STEPS.length - 1 ? "concluir" : "próximo"}</button>
          </div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">atalhos úteis</h3>
          <p class="lockText">
            Grátis para provar valor. Premium para aprofundar. Admin para testes. Sensei IA para montar material sob medida.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ghost btn--full" data-nav="#/premium">ver premium</button>
          <button class="btn btn--full" data-nav="#/sensei">abrir Sensei IA</button>
        </div>
      </section>
    </div>
  `;
}

/* ---------- Sensei IA ---------- */
const SENSEI_SCENARIO_BANK = {
  fabrica: [
    {
      jp: "この 作業{さぎょう} を もう 一度{いちど} 教{おし}えて ください。",
      pt: "Por favor, me ensine este trabalho mais uma vez.",
      newWords: [
        { jp: "作業{さぎょう}", pt: "trabalho / tarefa" },
        { jp: "一度{いちど}", pt: "uma vez" },
        { jp: "教{おし}えて", pt: "ensinar / explicar" }
      ]
    },
    {
      jp: "次{つぎ} は 何{なに} を すれば いいですか。",
      pt: "O que eu devo fazer em seguida?",
      newWords: [
        { jp: "次{つぎ}", pt: "próximo / em seguida" },
        { jp: "何{なに}", pt: "o que" },
        { jp: "すれば いい", pt: "devo fazer" }
      ]
    },
    {
      jp: "この 機械{きかい} が 止{と}まりました。",
      pt: "Esta máquina parou.",
      newWords: [
        { jp: "機械{きかい}", pt: "máquina" },
        { jp: "止{と}まりました", pt: "parou" }
      ]
    }
  ],
  chefe: [
    {
      jp: "少{すこ}し 体調{たいちょう} が 悪{わる}いです。",
      pt: "Estou me sentindo um pouco mal.",
      newWords: [
        { jp: "体調{たいちょう}", pt: "condição física" },
        { jp: "悪{わる}い", pt: "ruim" }
      ]
    },
    {
      jp: "この 内容{ないよう} で 合{あ}って いますか。",
      pt: "Está correto assim?",
      newWords: [
        { jp: "内容{ないよう}", pt: "conteúdo / instrução" },
        { jp: "合{あ}って いますか", pt: "está correto?" }
      ]
    },
    {
      jp: "もう 少{すこ}し ゆっくり お願{ねが}いします。",
      pt: "Mais devagar, por favor.",
      newWords: [
        { jp: "少{すこ}し", pt: "um pouco" },
        { jp: "ゆっくり", pt: "devagar" }
      ]
    }
  ],
  hospital: [
    {
      jp: "昨日{きのう} から 熱{ねつ} が あります。",
      pt: "Estou com febre desde ontem.",
      newWords: [
        { jp: "昨日{きのう}", pt: "ontem" },
        { jp: "熱{ねつ}", pt: "febre" }
      ]
    },
    {
      jp: "のど が 痛{いた}いです。",
      pt: "Estou com dor de garganta.",
      newWords: [
        { jp: "のど", pt: "garganta" },
        { jp: "痛{いた}い", pt: "doer" }
      ]
    },
    {
      jp: "薬{くすり} は いつ 飲{の}めば いいですか。",
      pt: "Quando devo tomar o remédio?",
      newWords: [
        { jp: "薬{くすり}", pt: "remédio" },
        { jp: "飲{の}めば いい", pt: "devo tomar" }
      ]
    }
  ],
  prefeitura: [
    {
      jp: "この 書類{しょるい} の 書{か}き方{かた} を 教{おし}えて ください。",
      pt: "Por favor, me ensine como preencher este documento.",
      newWords: [
        { jp: "書類{しょるい}", pt: "documento" },
        { jp: "書{か}き方{かた}", pt: "forma de preencher" }
      ]
    },
    {
      jp: "必要{ひつよう} な もの は 何{なに} ですか。",
      pt: "O que é necessário trazer?",
      newWords: [
        { jp: "必要{ひつよう}", pt: "necessário" },
        { jp: "何{なに}", pt: "o que" }
      ]
    },
    {
      jp: "この 手続{てつづ}き は 今日中{きょうじゅう} に 終{お}わりますか。",
      pt: "Este procedimento termina ainda hoje?",
      newWords: [
        { jp: "手続{てつづ}き", pt: "procedimento" },
        { jp: "今日中{きょうじゅう}", pt: "ainda hoje" }
      ]
    }
  ],
  mercado: [
    {
      jp: "この 商品{しょうひん} は いくら ですか。",
      pt: "Quanto custa este produto?",
      newWords: [
        { jp: "商品{しょうひん}", pt: "produto" },
        { jp: "いくら", pt: "quanto" }
      ]
    },
    {
      jp: "賞味期限{しょうみきげん} は いつ ですか。",
      pt: "Qual é a data de validade?",
      newWords: [
        { jp: "賞味期限{しょうみきげん}", pt: "data de validade" }
      ]
    },
    {
      jp: "袋{ふくろ} は 要{い}りません。",
      pt: "Não preciso de sacola.",
      newWords: [
        { jp: "袋{ふくろ}", pt: "sacola" },
        { jp: "要{い}りません", pt: "não preciso" }
      ]
    }
  ],
  konbini: [
    {
      jp: "この お弁当{べんとう} を 温{あたた}めて ください。",
      pt: "Por favor, aqueça este bentô.",
      newWords: [
        { jp: "お弁当{べんとう}", pt: "bentô" },
        { jp: "温{あたた}めて", pt: "aquecer" }
      ]
    },
    {
      jp: "レジ袋{ぶくろ} は 要{い}りません。",
      pt: "Não preciso de sacola.",
      newWords: [
        { jp: "レジ袋{ぶくろ}", pt: "sacola" }
      ]
    },
    {
      jp: "この 支払{しはら}い は ここで できますか。",
      pt: "Posso fazer este pagamento aqui?",
      newWords: [
        { jp: "支払{しはら}い", pt: "pagamento" },
        { jp: "できますか", pt: "é possível?" }
      ]
    }
  ],
  aluguel: [
    {
      jp: "水漏{みずも}れ して います。",
      pt: "Está vazando água.",
      newWords: [
        { jp: "水漏{みずも}れ", pt: "vazamento de água" }
      ]
    },
    {
      jp: "修理{しゅうり} を お願{ねが}いしたいです。",
      pt: "Quero solicitar um reparo.",
      newWords: [
        { jp: "修理{しゅうり}", pt: "reparo / conserto" }
      ]
    },
    {
      jp: "いつ 来{き}て もらえますか。",
      pt: "Quando alguém pode vir aqui?",
      newWords: [
        { jp: "来{き}て もらえますか", pt: "pode vir?" }
      ]
    }
  ],
  transporte: [
    {
      jp: "この 電車{でんしゃ} は 福井{ふくい} に 行{い}きますか。",
      pt: "Este trem vai para Fukui?",
      newWords: [
        { jp: "電車{でんしゃ}", pt: "trem" },
        { jp: "行{い}きますか", pt: "vai?" }
      ]
    },
    {
      jp: "何番線{なんばんせん} ですか。",
      pt: "É na plataforma número qual?",
      newWords: [
        { jp: "何番線{なんばんせん}", pt: "qual plataforma" }
      ]
    },
    {
      jp: "次{つぎ} の 電車{でんしゃ} は 何時{なんじ} ですか。",
      pt: "A que horas é o próximo trem?",
      newWords: [
        { jp: "次{つぎ}", pt: "próximo" },
        { jp: "何時{なんじ}", pt: "que horas" }
      ]
    }
  ]
};

function detectSenseiScenario(text) {
  const t = String(text || "").toLowerCase();

  if (/(fábrica|fabrica|linha|máquina|maquina|chefe|supervisor|rh|turno|produção|producao)/.test(t)) {
    if (/(chefe|supervisor)/.test(t)) return "chefe";
    return "fabrica";
  }
  if (/(hospital|dor|febre|remédio|remedio|consulta|garganta|médico|medico)/.test(t)) return "hospital";
  if (/(prefeitura|documento|my number|mynumber|residência|residencia|endereço|endereco)/.test(t)) return "prefeitura";
  if (/(mercado|supermercado|preço|preco|compras|validade|legume)/.test(t)) return "mercado";
  if (/(konbini|convenience|bent[oô]|sacola|caixa|pagamento)/.test(t)) return "konbini";
  if (/(aluguel|apartamento|vazamento|chave|reparo|manutenção|manutencao|leopalace)/.test(t)) return "aluguel";
  if (/(trem|ônibus|onibus|estação|estacao|transporte|plataforma|passagem)/.test(t)) return "transporte";
  return "fabrica";
}

function buildSenseiTopicName(scenario, customTheme) {
  const map = {
    fabrica: "Sensei IA • Fábrica",
    chefe: "Sensei IA • Chefe",
    hospital: "Sensei IA • Hospital",
    prefeitura: "Sensei IA • Prefeitura",
    mercado: "Sensei IA • Mercado",
    konbini: "Sensei IA • Konbini",
    aluguel: "Sensei IA • Moradia",
    transporte: "Sensei IA • Transporte"
  };

  const clean = normalizeName(customTheme);
  if (clean) return `Sensei IA • ${clean}`;
  return map[scenario] || "Sensei IA • Personalizado";
}

function buildSenseiCoachLine(goal, level, tone) {
  const parts = [];

  if (goal) parts.push(`Foco: ${goal}.`);
  if (level) parts.push(`Nível percebido: ${level}.`);
  if (tone) parts.push(`Tom desejado: ${tone}.`);

  parts.push("Material pensado para estudo prático, repetição e uso imediato no Japão.");
  return parts.join(" ");
}

function cloneSenseiPhrase(base, scenario, customTheme) {
  const topicName = buildSenseiTopicName(scenario, customTheme);
  return {
    id: uid("sensei"),
    jp: base.jp,
    pt: base.pt,
    newWords: Array.isArray(base.newWords) ? base.newWords.map(x => ({ ...x })) : [],
    topicName,
    createdAt: now(),
    updatedAt: now()
  };
}

function generateSenseiMaterial(payload) {
  const request = String(payload?.request || "").trim();
  const level = String(payload?.level || "").trim();
  const tone = String(payload?.tone || "").trim();
  const customTheme = String(payload?.theme || "").trim();

  const scenario = detectSenseiScenario(`${request} ${customTheme}`);
  const bank = SENSEI_SCENARIO_BANK[scenario] || SENSEI_SCENARIO_BANK.fabrica;
  const selected = bank.slice(0, 3).map((base) => cloneSenseiPhrase(base, scenario, customTheme));
  const coachLine = buildSenseiCoachLine(request, level, tone);

  return {
    scenario,
    topicName: buildSenseiTopicName(scenario, customTheme),
    coachLine,
    phrases: selected
  };
}

function saveSenseiPackToApp(pack) {
  const topic = createTopicIfMissing(pack.topicName);
  let added = 0;

  for (const phrase of pack.phrases) {
    const exists = STATE.bank.phrases.some(p =>
      jpStripFurigana(p.jp) === jpStripFurigana(phrase.jp) &&
      p.pt.trim().toLowerCase() === phrase.pt.trim().toLowerCase() &&
      p.topicId === topic.id
    );

    if (exists) continue;

    const id = uid("ph");
    const t = now();

    STATE.bank.phrases.unshift({
      id,
      jp: phrase.jp,
      pt: phrase.pt,
      newWords: phrase.newWords || [],
      topicId: topic.id,
      createdAt: t,
      updatedAt: t
    });

    STATE.progress[id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      masteredAt: null,
      history: []
    };

    added++;
  }

  STATE.aiStudio ||= { history: [] };
  STATE.aiStudio.history.unshift({
    id: uid("aihist"),
    at: now(),
    topicName: pack.topicName,
    coachLine: pack.coachLine,
    phrases: pack.phrases
  });

  STATE.aiStudio.history = STATE.aiStudio.history.slice(0, 20);

  if (STATE.session.inProgress) {
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;
  }

  saveState();
  return { added, topic };
}

function renderSenseiHistory() {
  const hist = STATE.aiStudio?.history || [];
  if (!hist.length) {
    return `
      <div class="sheet stack">
        <div class="small">Ainda não há materiais criados pelo Sensei IA.</div>
      </div>
    `;
  }

  return hist.slice(0, 5).map(item => `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">${escapeHTML(item.topicName)}</div>
        <div class="small">${fmtDateShort(item.at)}</div>
      </div>
      <div class="small">${escapeHTML(item.coachLine)}</div>
      <div class="small"><b>${item.phrases.length}</b> frases prontas para o app</div>
    </div>
  `).join("");
}

function renderSensei() {
  if (!isPremiumUnlocked()) {
    APP.innerHTML = `
      <div class="stack">
        <section class="card stack">
          <div class="badge">Sensei IA</div>
          <div class="lockCard">
            <h3 class="lockTitle">O Sensei IA é premium</h3>
            <p class="lockText">
              Ele cria material de estudo com base na sua necessidade real, já no formato ideal para o app.
            </p>
          </div>
          <div class="grid2">
            <button class="btn btn--ok btn--full" data-nav="#/premium">ver premium</button>
            <button class="btn btn--full" data-nav="#/admin">usar senha admin</button>
          </div>
        </section>
      </div>
    `;
    return;
  }

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">Sensei IA</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Peça material para a sua vida no Japão</h3>
          <p class="lockText">
            Exemplo: “quero frases para falar com meu chefe quando eu não entender a tarefa”, “preciso ir ao hospital”, “quero falar no mercado sem travar”.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="small">qual a sua necessidade agora?</div>
          <textarea id="senseiRequest" class="btn" style="height:140px; width:100%; text-align:left; padding:12px; border-radius:18px;" placeholder="ex: preciso de frases para falar com meu chefe na fábrica quando eu não entender a tarefa"></textarea>

          <div class="grid2">
            <div>
              <div class="small">nível</div>
              <select id="senseiLevel" class="btn selectBtn" style="width:100%">
                <option value="iniciante">iniciante</option>
                <option value="básico">básico</option>
                <option value="intermediário">intermediário</option>
              </select>
            </div>

            <div>
              <div class="small">tom</div>
              <select id="senseiTone" class="btn selectBtn" style="width:100%">
                <option value="educado">educado</option>
                <option value="direto e respeitoso">direto e respeitoso</option>
                <option value="muito simples">muito simples</option>
              </select>
            </div>
          </div>

          <div>
            <div class="small">nome do tópico que será criado</div>
            <input id="senseiTheme" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: chefe da fábrica, consulta médica, mercado do dia a dia" />
          </div>

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="generateSensei">gerar material</button>
            <button class="btn btn--full" data-nav="#/manage">gerenciar frases</button>
          </div>
        </div>

        <div id="senseiOutput" class="stack"></div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">últimos materiais</div>
          <div class="small">histórico</div>
        </div>
        ${renderSenseiHistory()}
      </section>
    </div>
  `;
}

function renderSenseiOutput(pack) {
  const box = $("#senseiOutput");
  if (!box) return;

  box.innerHTML = `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">${escapeHTML(pack.topicName)}</div>
        <div class="badge">3 frases</div>
      </div>
      <div class="small">${escapeHTML(pack.coachLine)}</div>
    </div>

    ${pack.phrases.map((p, i) => `
      <div class="sheet stack" style="text-align:left">
        <div class="badge">frase ${i + 1}</div>
        <div class="small"><b>JP:</b> ${escapeHTML(jpStripFurigana(p.jp))}</div>
        <div class="small"><b>PT:</b> ${escapeHTML(p.pt)}</div>
        <div class="small" style="font-weight:1000;margin-top:4px">explicação</div>
        ${(p.newWords || []).map(w => `<div class="small">${escapeHTML(formatWordExplanation(w))}</div>`).join("")}
      </div>
    `).join("")}

    <div class="grid2">
      <button class="btn btn--ok btn--full" data-action="saveSenseiPack">salvar no app</button>
      <button class="btn btn--full" data-nav="#/105x">ir pro treino</button>
    </div>
  `;

  box.dataset.pack = JSON.stringify(pack);
}

/* ---------- treino 105x ---------- */
function render105x() {
  ensurePhrasesHaveValidTopic();

  if (!STATE.session.inProgress) {
    startAuto();
    return;
  }

  if (!STATE.session.queue || !STATE.session.queue.length) {
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;
    saveState();
  }

  if (!STATE.session.phraseId && STATE.session.queue.length) {
    STATE.session.phraseId = STATE.session.queue[0];
    STATE.session.index = 0;
    saveState();
  }

  if (!STATE.session.queue.length || !STATE.session.phraseId) {
    APP.innerHTML = `
      <div class="stack">
        <section class="card stack">
          <div class="badge">sem frases liberadas neste filtro</div>
          <div class="small">troque para “tudo”, gere material no Sensei IA ou desbloqueie o premium.</div>
          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="topicFilter" data-id="ALL">treinar tudo</button>
            <button class="btn btn--ghost btn--full" data-nav="#/sensei">abrir Sensei IA</button>
          </div>
        </section>
      </div>
    `;
    return;
  }

  const curPhrase = getPhrase(STATE.session.phraseId);
  const curTopic = curPhrase ? getTopic(curPhrase.topicId) : null;

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack" id="view105x">
        <div class="studyTop">
          <div class="badge">105x</div>
          <div class="studyActions">
            <button class="miniBtn" title="skills" aria-label="skills" data-nav="#/skills">🏅</button>
            <button class="miniBtn" title="editar frases" aria-label="editar frases" data-nav="#/manage">✏️</button>
            <div class="badge">${STATE.session.callMode ? "chamada on" : "chamada off"}</div>
          </div>
        </div>

        <div class="row row--between">
          <div class="badge ${curTopic ? curTopic.color : "tViolet"}">
            ${curTopic ? escapeHTML(curTopic.name) : "Sem tópico"}${curTopic && isTopicPremium(curTopic.id) ? " 🔒" : ""}
          </div>
          <button class="btn btn--muted" data-nav="#/home">sair</button>
        </div>

        ${renderTopicMiniPills(STATE.session.topicFilter || "ALL")}

        <div class="studyDock">
          <div class="studyRight">
            <div class="studyTimer" aria-label="tempo de estudo">
              <div class="studyTimerRow">
                <div class="studyTime"><span class="ic">⏱</span> <span id="studyTime">00:00:00 (0d)</span></div>
                <div class="studyHint">Tempo Dedicado</div>
              </div>
              <div class="studyBar"><div class="studyFill" id="studyFill"></div></div>
            </div>

            <button class="btn btn--ghost callBtn" data-action="toggleCall">
              ${STATE.session.callMode ? "call: on" : "call: off"}
            </button>
          </div>
        </div>

        <div class="phraseArea" aria-label="frase em treino">
          <div class="counterMini" id="counterBox" aria-label="contador">
            <div class="counterVal" id="countVal">-</div>
            <div class="counterSub" id="cycleSub">ciclo</div>
          </div>

          <div class="kana" id="kanaLine"></div>
          <div class="pt" id="ptLine"></div>
        </div>

        <div id="newWordsBox"></div>

        <div class="primaryRow">
          <button class="primaryAction" data-action="repeat">repeti e entendi ✅</button>
        </div>

        <div class="row">
          <button class="btn btn--muted" data-action="speak" data-rate="1">ouvir normal</button>
          <button class="btn btn--muted" data-action="speak" data-rate="0.8">ouvir lento</button>
          <button class="btn btn--muted" data-action="skip">pular</button>
        </div>

        <div id="cycleSheet" class="sheet stack" style="display:none"></div>

        <div class="row">
          <button class="btn" data-action="prev">frase anterior</button>
          <button class="btn" data-action="next">próxima frase</button>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">todas as frases</div>
          <div class="small">organizado por tópicos</div>
        </div>
        <div class="list" id="phraseList"></div>
      </section>
    </div>
  `;

  render105xBodyOnly();
  renderPhraseListOnly();
  startStudyTimerIfOn105x();
  ensureBackTopButton();
  updateBackTopVisibility();
}

function renderPhraseListOnly() {
  const box = $("#phraseList");
  if (!box) return;

  ensurePhrasesHaveValidTopic();

  const byTopic = new Map();
  const phrases = phrasesByFilter();
  const topics = (STATE.bank.topics || []).filter(t => canAccessTopic(t.id));

  for (const t of topics) byTopic.set(t.id, []);

  for (const p of phrases) {
    if (byTopic.has(p.topicId)) byTopic.get(p.topicId).push(p);
  }

  const collapsedTopics = STATE.ui.collapsedTopics || {};
  const frag = document.createDocumentFragment();

  for (const t of topics) {
    const list = byTopic.get(t.id) || [];
    if (!list.length) continue;

    const collapsed = !!collapsedTopics[t.id];
    const wrap = document.createElement("div");
    wrap.className = "topicGroup";

    wrap.innerHTML = `
      ${renderTopicHeader(t, list.length, collapsed)}
      <div class="topicBody ${collapsed ? "isCollapsed" : ""}">
        ${list.map(x => {
          const pr = getProg(x.id);
          const st = pr.status === "mastered" ? "dominada ✓" : "treino";
          const pct = phraseProgressPct(pr);
          const pctTxt = Math.round(pct * 100);

          return `
            <div class="item">
              <div class="itemTop">
                <div style="min-width:0;text-align:left">
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
        }).join("")}
      </div>
    `;

    frag.appendChild(wrap);
  }

  box.innerHTML = "";
  box.appendChild(frag);
}

function render105xBodyOnly() {
  const pid = STATE.session.phraseId;
  const p = getPhrase(pid);
  const pr = getProg(pid);
  if (!p) return;

  const cs = clamp(pr.cycleStart || 14, 1, 14);
  const count = clamp(pr.count || cs, 1, cs);

  const countVal = $("#countVal");
  const cycleSub = $("#cycleSub");
  const kanaEl = $("#kanaLine");
  const ptLine = $("#ptLine");
  const nw = $("#newWordsBox");
  const sheet = $("#cycleSheet");

  if (countVal) countVal.textContent = String(count);
  if (cycleSub) cycleSub.textContent = `ciclo ${cs} → 1`;

  if (kanaEl) setKanaLine(kanaEl, p.jp);
  if (ptLine) ptLine.textContent = p.pt;
  if (nw) nw.innerHTML = renderNewWords(p.newWords || []);

  if (sheet && sheet.style.display === "block" && count > 1) {
    sheet.style.display = "none";
  }
}

/* ---------- edit ---------- */
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

function renderTopicSelect(selectedId) {
  const topics = STATE.bank.topics || [];
  const sel = selectedId || ensureDefaultTopic().id;

  return `
    <select class="btn selectBtn" id="topicSel" aria-label="selecionar tópico">
      ${topics.map(t => `<option value="${t.id}" ${t.id === sel ? "selected" : ""}>${escapeHTML(t.name)}</option>`).join("")}
    </select>
  `;
}

function renderEdit(editingId = null) {
  ensurePhrasesHaveValidTopic();

  const { params } = routeInfo();
  const preTopic = params.topic ? String(params.topic) : null;
  const editing = editingId ? getPhrase(editingId) : null;

  const jpVal = editing ? editing.jp : "";
  const ptVal = editing ? editing.pt : "";
  const nwVal = editing && Array.isArray(editing.newWords)
    ? editing.newWords.map(x => `${x.jp}=${x.pt}`).join(", ")
    : "";

  const topicId = editing
    ? (editing.topicId || ensureDefaultTopic().id)
    : (preTopic && getTopic(preTopic) ? preTopic : ensureDefaultTopic().id);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">${editing ? "editar frase" : "cadastro"}</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="row row--between" style="gap:10px">
            <div class="badge">separar por conteúdo</div>
            <button class="btn btn--ghost" data-nav="#/manage">gerenciar</button>
          </div>

          ${renderTopicSelect(topicId)}

          <div class="sep"></div>

          <div class="small">jp (aceita furigana manual: 仕事{しごと})</div>
          <input id="inJp" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: 私{わたし} は 今日{きょう} 忙{いそが}しいです。" value="${escapeHTML(jpVal)}" />
          <div class="small">pt</div>
          <input id="inPt" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: hoje estou ocupado." value="${escapeHTML(ptVal)}" />
          <div class="small">palavras novas (opcional) formato: jp=pt, jp=pt</div>
          <input id="inNW" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: 名前{なまえ}=nome" value="${escapeHTML(nwVal)}" />

          <button class="btn btn--ok btn--full" data-action="${editing ? "saveEdit" : "addPhrase"}" data-id="${editing ? editing.id : ""}">
            ${editing ? "salvar alterações" : "salvar frase"}
          </button>

          ${editing ? `<button class="btn btn--muted btn--full" data-nav="#/manage">voltar pro gerenciar</button>` : ""}

          <div class="small" id="editMsg"></div>
        </div>
      </section>
    </div>
  `;
}

/* ---------- manage ---------- */
function renderManage() {
  ensurePhrasesHaveValidTopic();

  const def = ensureDefaultTopic();
  const topics = STATE.bank.topics || [];
  const collapsed = STATE.ui.collapsedTopics || {};

  const byTopic = new Map();
  for (const t of topics) byTopic.set(t.id, []);

  for (const p of STATE.bank.phrases) {
    if (!byTopic.has(p.topicId)) byTopic.set(def.id, byTopic.get(def.id) || []);
    (byTopic.get(p.topicId) || byTopic.get(def.id)).push(p);
  }

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">gerenciar</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="small">criar tópico novo</div>
          <div class="row" style="gap:10px; flex-wrap:nowrap">
            <input id="topicNewName2" class="btn" style="flex:1; min-width:0" placeholder="ex: fábrica, segurança, aeroporto..." />
            <button class="btn btn--ok" data-action="addTopic">adicionar</button>
          </div>
          <div class="small" id="topicMsg"></div>
        </div>

        <div class="sep"></div>

        <div class="row row--between">
          <div class="badge">tópicos + frases</div>
          <button class="btn btn--ghost" data-nav="#/edit">novo cadastro</button>
        </div>

        <div class="small">furigana usando { }. exemplo: 名前{なまえ}</div>

        <div class="list" id="manageTopics"></div>
      </section>
    </div>
  `;

  const root = $("#manageTopics");
  const frag = document.createDocumentFragment();

  for (const t of topics) {
    const list = byTopic.get(t.id) || [];
    const isCollapsed = !!collapsed[t.id];
    const canDeleteTopic = t.id !== def.id;
    const hasPhrases = list.length > 0;

    const wrap = document.createElement("div");
    wrap.className = "topicGroup";

    const toolsHtml = `
      <div class="topicTools">
        <button class="btn btn--ok" data-action="addPhraseToTopic" data-id="${t.id}">adicionar</button>
        ${hasPhrases ? `<button class="btn btn--muted" data-action="clearTopic" data-id="${t.id}">limpar</button>` : ``}
        ${canDeleteTopic ? `<button class="btn btn--bad" data-action="deleteTopic" data-id="${t.id}">excluir</button>` : `<span class="badge">fixo</span>`}
      </div>
    `;

    const bodyHtml = `
      <div class="topicBody ${isCollapsed ? "isCollapsed" : ""}">
        ${toolsHtml}
        ${hasPhrases ? `
          <div class="reorderList" data-reorder-list="1" data-topic="${t.id}">
            ${list.map(p => {
              const pr = getProg(p.id);
              const st = pr.status === "mastered" ? "dominada ✓" : "treino";

              return `
                <div class="reorderItem" data-reorder-item="1" data-topic="${t.id}" data-id="${p.id}">
                  <div class="reorderTop">
                    <div class="reorderLeft">
                      <p class="itemTitle">${escapeHTML(jpStripFurigana(p.jp))}</p>
                      <div class="itemMeta">${escapeHTML(p.pt)} • ${st}</div>
                    </div>

                    <div class="row" style="gap:8px">
                      <div class="dragHandle" title="segure e arraste" aria-label="segure e arraste">≡</div>
                      <button class="btn btn--ghost" data-action="editPhrase" data-id="${p.id}">editar</button>
                      <button class="btn btn--bad" data-action="deletePhrase" data-id="${p.id}">excluir</button>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
          <div class="small">segure no ≡ e arraste para ordenar.</div>
        ` : `
          <div class="sheet stack">
            <div class="small">sem frases aqui ainda.</div>
          </div>
        `}
      </div>
    `;

    wrap.innerHTML = `${renderTopicHeader(t, list.length, isCollapsed)}${bodyHtml}`;
    frag.appendChild(wrap);
  }

  root.innerHTML = "";
  root.appendChild(frag);

  initReorderable();
}

/* ---------- drag ---------- */
let DRAG = null;

function initReorderable() {
  DRAG = null;
}

function applyTopicOrder(topicId, orderedIds) {
  if (!topicId || !Array.isArray(orderedIds) || !orderedIds.length) return;

  const set = new Set(orderedIds);
  const arr = STATE.bank.phrases;

  let firstIndex = -1;
  for (let i = 0; i < arr.length; i++) {
    if (set.has(arr[i].id)) {
      firstIndex = i;
      break;
    }
  }

  if (firstIndex < 0) firstIndex = arr.length;

  const removed = [];
  const kept = [];

  for (const p of arr) {
    if (set.has(p.id)) removed.push(p);
    else kept.push(p);
  }

  const map = new Map(removed.map(p => [p.id, p]));
  const ordered = orderedIds.map(id => map.get(id)).filter(Boolean);

  kept.splice(firstIndex, 0, ...ordered);
  STATE.bank.phrases = kept;
  saveState();
}

/* ---------- delete phrase ---------- */
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

/* ---------- backup ---------- */
function validateAndLoadBackup(parsed, msgEl) {
  if (!parsed || parsed.schema !== "jp_105x_backup_v1" || !parsed.state) {
    if (msgEl) msgEl.textContent = "json inválido.";
    toast("json inválido");
    beep("tuk");
    return false;
  }

  const st = parsed.state;
  if (!st.bank?.phrases || !Array.isArray(st.bank.phrases)) {
    if (msgEl) msgEl.textContent = "backup incompleto.";
    toast("backup incompleto");
    beep("tuk");
    return false;
  }

  for (const p of st.bank.phrases) {
    if (!isValidJP(p.jp || "")) {
      if (msgEl) msgEl.textContent = "backup tem jp inválido.";
      toast("jp inválido no backup");
      beep("tuk");
      return false;
    }
  }

  STATE = migrateToV7(st);
  saveState();
  refreshHUD();

  if (msgEl) msgEl.textContent = "importado ✅";
  toast("importado ✅");
  beep("ding");
  nav("#/home");
  return true;
}

function renderBackup() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">backup</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="badge">exportar</div>
          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="exportCopy">copiar json</button>
            <button class="btn btn--ok btn--full" data-action="exportFile">baixar arquivo</button>
          </div>
          <div class="small">No celular, “baixar arquivo” costuma ser o mais confiável.</div>
        </div>

        <div class="sheet stack">
          <div class="badge">importar</div>
          <div class="grid2">
            <button class="btn btn--muted btn--full" data-action="importText">importar do texto</button>
            <button class="btn btn--muted btn--full" data-action="importFile">importar arquivo</button>
          </div>

          <input id="fileImport" type="file" accept=".json,application/json" style="display:none" />

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
          <button class="btn btn--full" data-action="toggleVibe">${STATE.prefs.haptics.enabled ? "vibração: ligada" : "vibração: desligada"}</button>
        </div>

        <div class="sheet stack">
          <div class="small">volume do som (leve)</div>
          <input id="vol" type="range" min="0" max="1" step="0.05" value="${STATE.prefs.audio.volume ?? 0.35}" />
          <div class="small">som só toca depois do primeiro toque.</div>
        </div>

        <div class="sep"></div>

        <div class="grid2">
          <button class="btn btn--ghost btn--full" data-nav="#/tutorial">tutorial</button>
          <button class="btn btn--ghost btn--full" data-nav="#/admin">admin</button>
        </div>

        <div class="sep"></div>
        <button class="btn btn--bad btn--full" data-action="reset">resetar tudo</button>
      </section>
    </div>
  `;
}

/* ---------- skills ---------- */
const SKILL_PLAN_DAYS = 270;
const BASE_MIN_PER_DAY = 30;

const RANKS = [
  { days: 7, name: "Bronze", vibe: "o nihongo não é tão estranho assim", icon: "🥉" },
  { days: 30, name: "Aço", vibe: "tô começando a achar que eu consigo", icon: "🛡️" },
  { days: 90, name: "Ouro", vibe: "eu vou aprender nihongo sim", icon: "🥇" },
  { days: 150, name: "Platina", vibe: "minha boca tá ficando automática", icon: "💠" },
  { days: 210, name: "Diamante", vibe: "eu já sobrevivo no cotidiano", icon: "💎" },
  { days: 270, name: "Fluência", vibe: "fluência total. o jogo virou", icon: "🌸" }
];

function isStudyDay(dayObj) {
  if (!dayObj) return false;
  const mins = (dayObj.ms || 0) / 60000;
  return mins >= 2 || (dayObj.cycles || 0) > 0;
}

function habitSummary() {
  const days = STATE.habit?.days || {};
  const keys = Object.keys(days).sort();

  let totalMs = 0;
  let activeDays = 0;
  let cycles = 0;
  let listens = 0;
  let calls = 0;

  for (const k of keys) {
    const d = days[k];
    totalMs += d.ms || 0;
    cycles += d.cycles || 0;
    listens += d.listens || 0;
    calls += d.calls || 0;
    if (isStudyDay(d)) activeDays++;
  }

  const nowTS = now();
  const last7 = [];
  const last30 = [];

  for (let i = 0; i < 30; i++) {
    const ts = addDaysTS(nowTS, -i);
    const dk = new Date(ts);
    const y = dk.getFullYear();
    const m = String(dk.getMonth() + 1).padStart(2, "0");
    const dd = String(dk.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${dd}`;
    const obj = days[key] || { ms: 0, cycles: 0, listens: 0, calls: 0 };

    if (i < 7) last7.push(obj);
    last30.push(obj);
  }

  const last7Ms = last7.reduce((a, x) => a + (x.ms || 0), 0);
  const last30Ms = last30.reduce((a, x) => a + (x.ms || 0), 0);

  const last7MinPerDay = last7Ms / 60000 / 7;
  const last30MinPerDay = last30Ms / 60000 / 30;

  return {
    keys,
    totalMs,
    totalMin: totalMs / 60000,
    activeDays,
    cycles,
    listens,
    calls,
    last7MinPerDay,
    last30MinPerDay
  };
}

function rankFromActiveDays(activeDays) {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (activeDays >= r.days) current = r;
  }
  const next = RANKS.find(r => r.days > activeDays) || null;
  return { current, next };
}

function overallProgressByMinutes(totalMin) {
  const totalNeededMin = SKILL_PLAN_DAYS * BASE_MIN_PER_DAY;
  return clamp(totalMin / totalNeededMin, 0, 1);
}

function projectedFinishDate(avgMinPerDay) {
  const sum = habitSummary();
  const totalNeededMin = SKILL_PLAN_DAYS * BASE_MIN_PER_DAY;
  const remainingMin = Math.max(0, totalNeededMin - sum.totalMin);
  if (avgMinPerDay <= 0.1) return null;
  const daysNeeded = remainingMin / avgMinPerDay;
  return addDaysTS(now(), Math.ceil(daysNeeded));
}

function projectedRankDates(avgMinPerDay) {
  const sum = habitSummary();
  const dates = [];
  if (avgMinPerDay <= 0.1) return dates;

  const totalMin = sum.totalMin;

  for (const r of RANKS) {
    const needMin = r.days * BASE_MIN_PER_DAY;
    if (totalMin >= needMin) {
      dates.push({ ...r, done: true, dateTS: null });
    } else {
      const rem = needMin - totalMin;
      const daysNeeded = rem / avgMinPerDay;
      dates.push({ ...r, done: false, dateTS: addDaysTS(now(), Math.ceil(daysNeeded)) });
    }
  }

  return dates;
}

function skillBars() {
  const sum = habitSummary();

  const listening = clamp((sum.totalMin / (30 * 6)) * 0.65 + (sum.listens / 80) * 0.35, 0, 1);
  const speaking = clamp(sum.calls / 80, 0, 1);
  const repetition = clamp(sum.cycles / 120, 0, 1);
  const vocab = clamp(((STATE.stats.phrasesMastered || 0) / 20) * 0.55 + (sum.totalMin / (30 * 10)) * 0.45, 0, 1);
  const confidence = clamp((repetition * 0.35 + listening * 0.25 + vocab * 0.20 + speaking * 0.20), 0, 1);

  return [
    { name: "audição", val: listening, icon: "🎧", tip: "quanto mais você ouve, menos pensa" },
    { name: "fala", val: speaking, icon: "🗣️", tip: "call and response deixa a boca solta" },
    { name: "repetição", val: repetition, icon: "🔁", tip: "o ouro vem do ciclo fechado" },
    { name: "vocab", val: vocab, icon: "📦", tip: "palavras viram ferramentas" },
    { name: "confiança", val: confidence, icon: "✨", tip: "a soma silenciosa do dia a dia" }
  ];
}

function renderSkills() {
  const sum = habitSummary();
  const avg = Math.max(sum.last7MinPerDay, 0);
  const avgShow = avg > 0.1 ? `${avg.toFixed(1)} min/dia` : "ainda sem ritmo";
  const { current, next } = rankFromActiveDays(sum.activeDays);

  const prog = overallProgressByMinutes(sum.totalMin);
  const finish = projectedFinishDate(avg);
  const dates = projectedRankDates(avg);
  const bars = skillBars();

  const progPct = Math.round(prog * 100);

  const nextTxt = next
    ? `próxima: ${next.icon} ${next.name} (${next.days} dias)`
    : `você chegou: ${current.icon} ${current.name} ✅`;

  const projTxt = finish
    ? `se continuar no ritmo (${avgShow}), fluência em: ${fmtDateShort(finish)}`
    : `faz 2 minutinhos hoje e eu te dou a projeção 😉`;

  const timeline = RANKS.map(r => {
    const done = sum.activeDays >= r.days;
    return `
      <div class="tlNode ${done ? "done" : ""}">
        <div class="tlDot"></div>
        <div class="tlLbl">${r.icon} ${r.name}</div>
        <div class="tlMini">${r.days}d</div>
      </div>
    `;
  }).join("");

  const datesList = dates.map(d => {
    const right = d.done
      ? `<span class="badge">feito ✅</span>`
      : `<span class="badge">${d.dateTS ? fmtDateShort(d.dateTS) : "..."}</span>`;

    return `
      <div class="row row--between" style="gap:10px">
        <div class="small"><b>${d.icon} ${d.name}</b> <span style="opacity:.8">(${d.days} dias)</span></div>
        ${right}
      </div>
    `;
  }).join("");

  const barHtml = bars.map(b => {
    const pct = Math.round(b.val * 100);

    return `
      <div class="skillRow">
        <div class="skillLeft">
          <div class="skillName">${b.icon} ${b.name}</div>
          <div class="skillTip">${escapeHTML(b.tip)}</div>
        </div>
        <div class="skillRight">
          <div class="pBar skillBar"><div class="pFill" style="transform:scaleX(${b.val})"></div></div>
          <div class="pTxt">${pct}%</div>
        </div>
      </div>
    `;
  }).join("");

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">skills</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="rankCard">
          <div class="rankBig">
            <div class="rankIcon">${current.icon}</div>
            <div>
              <div class="rankTitle">${current.name}</div>
              <div class="rankSub">${escapeHTML(current.vibe)}</div>
            </div>
          </div>

          <div class="row row--between">
            <div class="badge">${sum.activeDays} dias vivos</div>
            <div class="badge">${nextTxt}</div>
          </div>

          <div class="projWrap">
            <div class="projTop">
              <div class="small">progresso até fluência</div>
              <div class="badge">${progPct}%</div>
            </div>
            <div class="pBar projBar"><div class="pFill" style="transform:scaleX(${prog})"></div></div>
            <div class="small projTxt">${projTxt}</div>
          </div>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">linha do tempo</div>
            <div class="badge">meta: 9 meses</div>
          </div>
          <div class="tlLine">
            <div class="tlTrack"></div>
            <div class="tlFill" style="transform:scaleX(${clamp(sum.activeDays / SKILL_PLAN_DAYS, 0, 1)})"></div>
            <div class="tlNodes">${timeline}</div>
          </div>
          <div class="small">“dia vivo” = 2 min ou 1 ciclo. sem culpa.</div>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">projeção de ranks</div>
            <div class="badge">${avgShow}</div>
          </div>
          <div class="stack" style="gap:8px">${datesList}</div>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">mini skills</div>
            <div class="badge">panorama</div>
          </div>
          <div class="skillGrid">
            ${barHtml}
          </div>
        </div>
      </section>
    </div>
  `;
}

/* ---------- render principal ---------- */
function render() {
  refreshHUD();

  const r = route();

  if (r === "#/landing") return renderLanding();
  if (r === "#/premium") return renderPremium();
  if (r === "#/admin") return renderAdmin();
  if (r === "#/tutorial") return renderTutorial();
  if (r === "#/sensei") return renderSensei();
  if (r === "#/home") return renderHome();
  if (r === "#/105x") return render105x();
  if (r === "#/edit") return renderEdit();
  if (r === "#/manage") return renderManage();
  if (r === "#/backup") return renderBackup();
  if (r === "#/settings") return renderSettings();
  if (r === "#/skills") return renderSkills();

  nav("#/landing");
}

/* ---------- back to top ---------- */
function ensureBackTopButton() {
  if (document.getElementById("backTop")) return;

  const btn = document.createElement("button");
  btn.id = "backTop";
  btn.type = "button";
  btn.setAttribute("aria-label", "voltar ao topo");
  btn.innerHTML = `<span class="ic">↑</span>`;
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    unlockAudio();
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) window.scrollTo(0, 0);
    else window.scrollTo({ top: 0, behavior: "smooth" });

    try { beep("pop"); } catch {}
    try { vibrate([8]); } catch {}
  }, { passive: true });
}

let backTopTicking = false;

function updateBackTopVisibility() {
  const btn = document.getElementById("backTop");
  if (!btn) return;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  btn.classList.toggle("on", y > 220);
}

function hookBackTopScroll() {
  window.addEventListener("scroll", () => {
    if (backTopTicking) return;
    backTopTicking = true;
    requestAnimationFrame(() => {
      backTopTicking = false;
      updateBackTopVisibility();
    });
  }, { passive: true });
}

/* ---------- click delegation ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.nav) {
    nav(btn.dataset.nav);
    return;
  }

  const act = btn.dataset.action;

  if (act === "checkout") {
    openCheckout();
    return;
  }

  if (act === "loginAdmin") {
    const val = ($("#adminPass")?.value || "").trim();
    if (!val) {
      toast("digite a senha admin");
      beep("tuk");
      return;
    }

    if (val !== ADMIN.passcode) {
      toast("senha incorreta");
      beep("tuk");
      return;
    }

    unlockAdminSuccess();
    toast("admin liberado ✅");
    beep("ding");
    render();
    return;
  }

  if (act === "logoutAdmin") {
    logoutAdmin();
    toast("admin encerrado");
    render();
    return;
  }

  if (act === "unlockDemoPremium") {
    if (!isAdminUnlocked()) {
      toast("entre como admin primeiro");
      beep("tuk");
      nav("#/admin");
      return;
    }

    markPremiumDemoUnlock();
    toast("premium liberado ✅");
    beep("ding");
    render();
    return;
  }

  if (act === "lockDemoPremium") {
    if (!isAdminUnlocked()) {
      toast("entre como admin primeiro");
      beep("tuk");
      nav("#/admin");
      return;
    }

    markPremiumLocked();
    toast("premium bloqueado");
    render();
    return;
  }

  if (act === "tutorialPrev") {
    STATE.tutorial.currentStep = clamp((STATE.tutorial.currentStep || 0) - 1, 0, TUTORIAL_STEPS.length - 1);
    saveState();
    render();
    return;
  }

  if (act === "tutorialNext") {
    const current = tutorialCurrentStep();
    if (current >= TUTORIAL_STEPS.length - 1) {
      completeTutorial();
      toast("tutorial concluído ✅");
      beep("ding");
      nav("#/home");
      return;
    }

    STATE.tutorial.currentStep = current + 1;
    saveState();
    render();
    return;
  }

  if (act === "generateSensei") {
    const request = ($("#senseiRequest")?.value || "").trim();
    const level = ($("#senseiLevel")?.value || "iniciante").trim();
    const tone = ($("#senseiTone")?.value || "educado").trim();
    const theme = ($("#senseiTheme")?.value || "").trim();

    if (!request) {
      toast("escreva sua necessidade primeiro");
      beep("tuk");
      return;
    }

    const pack = generateSenseiMaterial({ request, level, tone, theme });
    renderSenseiOutput(pack);
    toast("material gerado ✅");
    beep("ding");
    return;
  }

  if (act === "saveSenseiPack") {
    const box = $("#senseiOutput");
    if (!box?.dataset.pack) {
      toast("gere o material primeiro");
      beep("tuk");
      return;
    }

    const parsed = safeJSONParse(box.dataset.pack);
    if (!parsed || !Array.isArray(parsed.phrases)) {
      toast("não consegui ler o material");
      beep("tuk");
      return;
    }

    const result = saveSenseiPackToApp(parsed);
    toast(`${result.added} frase(s) salvas em ${result.topic.name} ✅`);
    beep("ding");
    render();
    return;
  }

  if (act === "repeat") {
    onRepeat();
    return;
  }

  if (act === "skip") {
    unlockAudio();
    skipPhrase();
    render105xBodyOnly();
    renderPhraseListOnly();
    return;
  }

  if (act === "prev") {
    unlockAudio();
    const moved = prevPhrase();
    if (!moved) return;
    beep("pop");
    render105xBodyOnly();
    renderPhraseListOnly();
    return;
  }

  if (act === "next") {
    unlockAudio();
    const moved = nextPhrase();
    if (!moved) return;
    toast("próxima ✅");
    beep("pop");
    render105xBodyOnly();
    renderPhraseListOnly();
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

  if (act === "toggleTopic") {
    const id = btn.dataset.id;
    if (!id) return;
    STATE.ui.collapsedTopics ||= {};
    STATE.ui.collapsedTopics[id] = !STATE.ui.collapsedTopics[id];
    saveState();
    render();
    return;
  }

  if (act === "topicFilter") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    if (id !== "ALL" && isTopicPremium(id) && !isPremiumUnlocked()) {
      showPremiumLockedMessage(id);
      return;
    }

    STATE.session.topicFilter = id;
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;

    saveState();
    toast(id === "ALL" ? "treino: tudo ✅" : `treino: ${topicName(id)} ✅`);
    beep("ding");
    render();
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

    if (STATE.session.callMode) callAndResponse(p.jp, rate, kanaEl, () => {});
    else speakWithKaraoke(p.jp, rate, kanaEl);
    return;
  }

  if (act === "addTopic") {
    unlockAudio();
    const input = $("#topicNewName2");
    const msg = $("#topicMsg");
    if (!input || !msg) return;

    const topic = createTopic(input.value);
    if (!topic) {
      msg.textContent = "nome vazio ou já existe.";
      toast("tópico inválido");
      beep("tuk");
      return;
    }

    input.value = "";
    msg.textContent = "criado ✅";
    toast("tópico criado ✅");
    beep("ding");
    renderManage();
    return;
  }

  if (act === "deleteTopic") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    const ok = confirm("excluir tópico? as frases vão para Frases aleatórias.");
    if (!ok) return;

    const done = deleteTopic(id);
    if (!done) return;

    toast("tópico excluído ✅");
    beep("tuk");
    renderManage();
    return;
  }

  if (act === "clearTopic") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    const name = topicName(id);
    const ok = confirm(`apagar todas as frases de "${name}"?`);
    if (!ok) return;

    const n = clearTopic(id);
    toast(n ? `apagou ${n} frases ✅` : "nada pra apagar");
    beep(n ? "ding" : "tuk");
    renderManage();
    return;
  }

  if (act === "addPhraseToTopic") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    nav(`#/edit?topic=${encodeURIComponent(id)}`);
    return;
  }

  if (act === "editPhrase") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    renderEdit(id);
    return;
  }

  if (act === "addPhrase") {
    unlockAudio();

    const jp = ($("#inJp")?.value || "").trim();
    const pt = ($("#inPt")?.value || "").trim();
    const nw = parseNewWords($("#inNW")?.value || "");
    const msg = $("#editMsg");
    const topicId = ($("#topicSel")?.value || ensureDefaultTopic().id);

    if (!jp || !pt) {
      if (msg) msg.textContent = "preencha jp e pt.";
      toast("faltou jp/pt");
      beep("tuk");
      return;
    }

    if (!isValidJP(jp)) {
      if (msg) msg.textContent = "jp inválido.";
      toast("jp inválido");
      beep("tuk");
      return;
    }

    for (const w of nw) {
      if (!isValidJP(w.jp)) {
        if (msg) msg.textContent = "palavra nova jp inválida.";
        toast("palavra inválida");
        beep("tuk");
        return;
      }
    }

    const t = now();
    const id = uid("ph");

    STATE.bank.phrases.unshift({
      id,
      jp,
      pt,
      newWords: nw,
      topicId,
      createdAt: t,
      updatedAt: t
    });

    STATE.progress[id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      masteredAt: null,
      history: []
    };

    if (STATE.session.inProgress) {
      STATE.session.queue = buildQueue();
      STATE.session.index = 0;
      STATE.session.phraseId = STATE.session.queue[0] || null;
    }

    saveState();
    toast("salvo ✅");
    beep("ding");
    if (msg) msg.textContent = "salvo ✅";

    const inJp = $("#inJp");
    const inPt = $("#inPt");
    const inNW = $("#inNW");
    if (inJp) inJp.value = "";
    if (inPt) inPt.value = "";
    if (inNW) inNW.value = "";

    const { params } = routeInfo();
    if (params.topic) {
      nav("#/manage");
      return;
    }

    render();
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
    const topicId = ($("#topicSel")?.value || ensureDefaultTopic().id);

    if (!jp || !pt) {
      if (msg) msg.textContent = "preencha jp e pt.";
      toast("faltou jp/pt");
      beep("tuk");
      return;
    }

    if (!isValidJP(jp)) {
      if (msg) msg.textContent = "jp inválido.";
      toast("jp inválido");
      beep("tuk");
      return;
    }

    for (const w of nw) {
      if (!isValidJP(w.jp)) {
        if (msg) msg.textContent = "palavra nova jp inválida.";
        toast("palavra inválida");
        beep("tuk");
        return;
      }
    }

    p.jp = jp;
    p.pt = pt;
    p.newWords = nw;
    p.topicId = topicId;
    p.updatedAt = now();

    saveState();
    toast("alterado ✅");
    beep("ding");
    if (msg) msg.textContent = "alterado ✅";
    nav("#/manage");
    return;
  }

  if (act === "deletePhrase") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    const ok = confirm("excluir esta frase?");
    if (!ok) return;

    const removed = deletePhraseById(id);
    if (!removed) return;

    toast("excluída ✅");
    beep("tuk");
    vibrate([8]);
    render();
    return;
  }

  if (act === "exportCopy" || act === "exportFile") {
    const msg = $("#backupMsg");
    const payload = {
      schema: "jp_105x_backup_v1",
      exportedAt: new Date().toISOString(),
      state: STATE
    };
    const txt = JSON.stringify(payload, null, 2);

    if (act === "exportCopy") {
      navigator.clipboard?.writeText(txt).then(() => {
        if (msg) msg.textContent = "copiado pro clipboard ✅";
        toast("backup copiado ✅");
        beep("ding");
      }).catch(() => {
        if (msg) msg.textContent = "não deu pra copiar. copie manualmente.";
        toast("copie manualmente");
        beep("tuk");
        const box = $("#importBox");
        if (box) box.value = txt;
      });
      return;
    }

    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const filename = `nihongo321-backup-${y}-${m}-${dd}.json`;

    downloadTextFile(filename, txt);
    if (msg) msg.textContent = "baixado ✅";
    toast("backup baixado ✅");
    beep("ding");
    return;
  }

  if (act === "importText") {
    const box = $("#importBox");
    const msg = $("#backupMsg");
    const raw = (box?.value || "").trim();

    if (!raw) {
      if (msg) msg.textContent = "cole o json primeiro.";
      toast("sem json");
      beep("tuk");
      return;
    }

    const parsed = safeJSONParse(raw);
    validateAndLoadBackup(parsed, msg);
    return;
  }

  if (act === "importFile") {
    const input = $("#fileImport");
    if (!input) return;
    input.value = "";
    input.click();
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
    toast(STATE.prefs.haptics.enabled ? "vibração ligada" : "vibração desligada");
    refreshHUD();
    render();
    return;
  }

  if (act === "reset") {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem("jp_105x_v6");
    localStorage.removeItem("jp_105x_v5");
    localStorage.removeItem("jp_105x_v4");
    localStorage.removeItem("jp_105x_v3");
    localStorage.removeItem("jp_105x_v2");
    STATE = defaultState();
    saveState();
    toast("resetado ✅");
    beep("ding");
    nav("#/landing");
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
    unlockAudio();
    STATE.prefs.haptics.enabled = !STATE.prefs.haptics.enabled;
    saveState();
    refreshHUD();
    toast(STATE.prefs.haptics.enabled ? "vibração ligada" : "vibração desligada");
    return;
  }
});

/* ---------- drag pointer ---------- */
document.addEventListener("pointerdown", (e) => {
  const handle = e.target.closest(".dragHandle");
  if (!handle) return;

  const item = handle.closest("[data-reorder-item='1']");
  const list = handle.closest("[data-reorder-list='1']");
  if (!item || !list) return;

  const topic = item.dataset.topic;
  if (!topic) return;
  if (route() !== "#/manage") return;

  e.preventDefault();
  unlockAudio();

  DRAG = {
    topic,
    list,
    item,
    pointerId: e.pointerId
  };

  try { item.setPointerCapture(e.pointerId); } catch {}

  item.classList.add("dragging");
  vibrate([8]);
}, { passive: false });

document.addEventListener("pointermove", (e) => {
  if (!DRAG) return;
  if (e.pointerId !== DRAG.pointerId) return;

  const { list, item } = DRAG;
  const y = e.clientY;
  const items = $$("[data-reorder-item='1']", list).filter(el => el !== item);
  let target = null;

  for (const it of items) {
    const r = it.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (y < mid) {
      target = it;
      break;
    }
  }

  if (target) list.insertBefore(item, target);
  else list.appendChild(item);
}, { passive: true });

document.addEventListener("pointerup", (e) => {
  if (!DRAG) return;
  if (e.pointerId !== DRAG.pointerId) return;

  const { list, item, topic } = DRAG;
  item.classList.remove("dragging");

  const orderedIds = $$("[data-reorder-item='1']", list)
    .map(el => el.dataset.id)
    .filter(Boolean);

  applyTopicOrder(topic, orderedIds);
  toast("ordem salva ✅");
  beep("ding");
  DRAG = null;
}, { passive: true });

document.addEventListener("pointercancel", (e) => {
  if (!DRAG) return;
  if (e.pointerId !== DRAG.pointerId) return;
  try { DRAG.item.classList.remove("dragging"); } catch {}
  DRAG = null;
}, { passive: true });

/* ---------- inputs ---------- */
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el && el.id === "vol") {
    const v = Number(el.value);
    STATE.prefs.audio.volume = clamp(v, 0, 1);
    saveState();
  }
});

document.addEventListener("change", (e) => {
  const el = e.target;
  if (el && el.id === "fileImport") {
    const msg = $("#backupMsg");
    const file = el.files && el.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result || "").trim();
      const parsed = safeJSONParse(text);
      validateAndLoadBackup(parsed, msg);
    };

    reader.onerror = () => {
      if (msg) msg.textContent = "não deu pra ler o arquivo.";
      toast("erro ao ler arquivo");
      beep("tuk");
    };

    reader.readAsText(file);
  }
});

/* ---------- rota ---------- */
window.addEventListener("hashchange", () => {
  render();
  startStudyTimerIfOn105x();
  updateBackTopVisibility();
});

/* ---------- init ---------- */
(function init() {
  ensureDefaultTopic();
  ensurePhrasesHaveValidTopic();
  refreshHUD();

  if (!location.hash) nav("#/landing");

  ensureBackTopButton();
  hookBackTopScroll();
  updateBackTopVisibility();

  ensureHabitToday();
  syncHabitMs();

  render();
  startStudyTimerIfOn105x();
})();