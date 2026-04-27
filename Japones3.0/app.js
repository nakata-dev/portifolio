/* =========================================================
   NIHONGO321 v7.9
   Bloco 2C + Bloco 3A + Bloco 3B + Bloco 3C + Bloco 3D + Bloco 3E + Bloco 3F + Bloco 3G
   - confiança final de produto
   - retenção leve sem culpa
   - sistema diário de continuidade
   - revisão inteligente de sobrevivência
   - fluidez no treino 105x
   - treino por situação real
   - limpeza da tela 105x
   - treino rápido de 2 minutos
   - premium mais convincente e vendável
   ========================================================= */

const LS_KEY = "jp_105x_v7";

/* ========= IDENTIDADE DO PRODUTO ========= */
const BRAND = {
  name: "NIHONGO321",
  tagline: "Japonês prático no Japão",
  promise: "Treine frases úteis para viver melhor no Japão."
};

/* ========= CONFIG COMERCIAL ========= */
const SALES = {
  monthlyPrice: "¥980",
  semiannualPrice: "¥4,980 / 6 meses",
  checkoutUrl: "https://SEU-CHECKOUT-AQUI",
  appStoreUrl: "https://apps.apple.com/",
  playStoreUrl: "https://play.google.com/store",
  supportEmail: "seuemail@exemplo.com"
};

/* ========= ADMIN TESTE =========
   manter interno e retirar do fluxo comercial
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

const DAILY_GOAL_DEFAULTS = {
  minutes: 5,
  cycles: 1
};

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

function dateKeyFromOffset(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
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

function isRealCheckoutConfigured() {
  return !!SALES.checkoutUrl &&
    SALES.checkoutUrl.startsWith("http") &&
    !/SEU-CHECKOUT-AQUI/i.test(SALES.checkoutUrl);
}

function hashString(s) {
  let h = 0;
  const text = String(s || "");
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h) + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickFromList(list, seedText) {
  if (!Array.isArray(list) || !list.length) return "";
  const i = hashString(seedText) % list.length;
  return list[i];
}

function truncateText(text, max = 80) {
  const clean = String(text || "").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
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
    id: "topic_essential_japan",
    name: "Pack Essencial Japão",
    color: "tBlue",
    phrases: [
      {
        id: "seed_essential_001",
        jp: "すみません。もう 一度{いちど} お願{ねが}いします。",
        pt: "Com licença. Mais uma vez, por favor.",
        newWords: [
          { jp: "すみません", pt: "com licença / desculpe" },
          { jp: "一度{いちど}", pt: "uma vez" },
          { jp: "お願{ねが}いします", pt: "por favor" }
        ]
      },
      {
        id: "seed_essential_002",
        jp: "日本語{にほんご} が まだ よく わかりません。",
        pt: "Eu ainda não entendo bem japonês.",
        newWords: [
          { jp: "日本語{にほんご}", pt: "língua japonesa" },
          { jp: "まだ", pt: "ainda" },
          { jp: "わかりません", pt: "não entendo" }
        ]
      },
      {
        id: "seed_essential_003",
        jp: "ゆっくり 話{はな}して ください。",
        pt: "Por favor, fale devagar.",
        newWords: [
          { jp: "ゆっくり", pt: "devagar" },
          { jp: "話{はな}して", pt: "falar" }
        ]
      },
      {
        id: "seed_essential_004",
        jp: "これ は いくら ですか。",
        pt: "Quanto custa isto?",
        newWords: [
          { jp: "これ", pt: "isto" },
          { jp: "いくら", pt: "quanto" }
        ]
      },
      {
        id: "seed_essential_005",
        jp: "トイレ は どこ ですか。",
        pt: "Onde fica o banheiro?",
        newWords: [
          { jp: "トイレ", pt: "banheiro" },
          { jp: "どこ", pt: "onde" }
        ]
      },
      {
        id: "seed_essential_006",
        jp: "大丈夫{だいじょうぶ} です。",
        pt: "Está tudo bem.",
        newWords: [
          { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / sem problema" }
        ]
      },
      {
        id: "seed_essential_007",
        jp: "手伝{てつだ}って もらえますか。",
        pt: "Pode me ajudar?",
        newWords: [
          { jp: "手伝{てつだ}って", pt: "ajudar" },
          { jp: "もらえますか", pt: "pode fazer para mim?" }
        ]
      },
      {
        id: "seed_essential_008",
        jp: "ありがとう ございます。",
        pt: "Muito obrigado.",
        newWords: [
          { jp: "ありがとう ございます", pt: "muito obrigado" }
        ]
      },
      {
        id: "seed_essential_009",
        jp: "今{いま} は ちょっと わかりません。",
        pt: "Agora eu não entendo muito bem.",
        newWords: [
          { jp: "今{いま}", pt: "agora" },
          { jp: "ちょっと", pt: "um pouco" },
          { jp: "わかりません", pt: "não entendo" }
        ]
      },
      {
        id: "seed_essential_010",
        jp: "ここ に 座{すわ}って いいですか。",
        pt: "Posso sentar aqui?",
        newWords: [
          { jp: "ここ", pt: "aqui" },
          { jp: "座{すわ}って", pt: "sentar" },
          { jp: "いいですか", pt: "posso?" }
        ]
      },
      {
        id: "seed_essential_011",
        jp: "これ を お願{ねが}いします。",
        pt: "Quero este, por favor.",
        newWords: [
          { jp: "これ", pt: "este" },
          { jp: "お願{ねが}いします", pt: "por favor / eu gostaria" }
        ]
      },
      {
        id: "seed_essential_012",
        jp: "あと で 来{き}ます。",
        pt: "Eu volto depois.",
        newWords: [
          { jp: "あと で", pt: "depois" },
          { jp: "来{き}ます", pt: "venho / volto" }
        ]
      },
      {
        id: "seed_essential_013",
        jp: "少{すこ}し 待{ま}って ください。",
        pt: "Espere um pouco, por favor.",
        newWords: [
          { jp: "少{すこ}し", pt: "um pouco" },
          { jp: "待{ま}って", pt: "esperar" }
        ]
      },
      {
        id: "seed_essential_014",
        jp: "日本語{にほんご} の 練習{れんしゅう} を して います。",
        pt: "Estou praticando japonês.",
        newWords: [
          { jp: "日本語{にほんご}", pt: "japonês" },
          { jp: "練習{れんしゅう}", pt: "prática / treino" }
        ]
      }
    ]
  },
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
    app: { schemaVersion: 7.9, createdAt: t, updatedAt: t },

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

    goals: {
      dailyMinutes: DAILY_GOAL_DEFAULTS.minutes,
      dailyCycles: DAILY_GOAL_DEFAULTS.cycles
    },

    favorites: {
      phraseIds: []
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
      study: {
        day: todayKey(),
        totalMs: 0,
        running: false,
        runStartAt: null
      }
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

  st.app.schemaVersion = 7.9;

  st.bank ||= {};
  st.bank.topics ||= [];
  st.bank.phrases ||= [];
  st.progress ||= {};

  st.ui ||= {};
  st.ui.collapsedTopics ||= {};

  st.session ||= {};
  st.session.topicFilter ||= "ALL";
  st.session.study ||= {
    day: todayKey(),
    totalMs: 0,
    running: false,
    runStartAt: null
  };

  st.stats ||= {};
  st.stats.coins ||= 0;
  st.stats.bestCoins ||= 0;
  st.stats.cyclesDone ||= 0;
  st.stats.phrasesMastered ||= 0;
  st.stats.listens ||= 0;
  st.stats.calls ||= 0;

  st.habit ||= { firstDay: null, days: {} };
  st.habit.days ||= {};

  st.monetization ||= { premiumUnlocked: false, seenPaywall: false };
  st.aiStudio ||= { history: [] };
  st.admin ||= { unlocked: false, lastLoginAt: null };
  st.tutorial ||= { done: false, currentStep: 0, completedAt: null };

  st.goals ||= {
    dailyMinutes: DAILY_GOAL_DEFAULTS.minutes,
    dailyCycles: DAILY_GOAL_DEFAULTS.cycles
  };
  st.goals.dailyMinutes ||= DAILY_GOAL_DEFAULTS.minutes;
  st.goals.dailyCycles ||= DAILY_GOAL_DEFAULTS.cycles;

  st.favorites ||= { phraseIds: [] };
  st.favorites.phraseIds ||= [];

  if (st.ui?.favorites && typeof st.ui.favorites === "object") {
    const migratedFavs = Object.keys(st.ui.favorites).filter(id => st.ui.favorites[id]);
    const merged = new Set([...(st.favorites.phraseIds || []), ...migratedFavs]);
    st.favorites.phraseIds = Array.from(merged);
    delete st.ui.favorites;
  }

  if (st.prefs?.dailyGoal) {
    st.goals.dailyMinutes = st.prefs.dailyGoal.minutes || st.goals.dailyMinutes || DAILY_GOAL_DEFAULTS.minutes;
    st.goals.dailyCycles = st.prefs.dailyGoal.cycles || st.goals.dailyCycles || DAILY_GOAL_DEFAULTS.cycles;
    delete st.prefs.dailyGoal;
  }

  let def = st.bank.topics.find(t => t.id === "topic_default");
  if (!def) {
    def = defaultTopic();
    st.bank.topics.unshift(def);
  }

  for (const p of st.bank.phrases) {
    if (!p.topicId) p.topicId = def.id;
  }

  st.favorites.phraseIds = (st.favorites.phraseIds || [])
    .filter(id => st.bank.phrases.some(p => p.id === id));

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

/* ---------- favoritos / frase do dia / meta ---------- */
function favoriteSet() {
  return new Set(STATE.favorites?.phraseIds || []);
}

function isFavorite(id) {
  return favoriteSet().has(id);
}

function toggleFavorite(id) {
  if (!id) return false;

  STATE.favorites ||= { phraseIds: [] };
  STATE.favorites.phraseIds ||= [];

  const ids = new Set(STATE.favorites.phraseIds);
  let active = false;

  if (ids.has(id)) {
    ids.delete(id);
    active = false;
  } else {
    ids.add(id);
    active = true;
  }

  STATE.favorites.phraseIds = Array.from(ids);
  saveState();
  return active;
}

function favoritePhrasesAccessible() {
  const ids = favoriteSet();
  return (STATE.bank.phrases || []).filter(p => ids.has(p.id) && canAccessTopic(p.topicId));
}

function getPhraseOfDay() {
  const accessible = (STATE.bank.phrases || []).filter(p => canAccessTopic(p.topicId));
  if (!accessible.length) return null;

  const seed = hashString(`${todayKey()}|nihongo321|frase-do-dia`);
  return accessible[seed % accessible.length] || accessible[0] || null;
}

function todayGoalProgress() {
  const k = ensureHabitToday();
  const day = STATE.habit.days[k] || { ms: 0, cycles: 0, listens: 0, calls: 0 };

  const minutesDoneRaw = (day.ms || 0) / 60000;
  const minutesDone = Math.floor(minutesDoneRaw);
  const cyclesDone = day.cycles || 0;

  const minGoal = Math.max(1, Number(STATE.goals?.dailyMinutes || DAILY_GOAL_DEFAULTS.minutes));
  const cycleGoal = Math.max(1, Number(STATE.goals?.dailyCycles || DAILY_GOAL_DEFAULTS.cycles));

  const minPct = clamp(minutesDoneRaw / minGoal, 0, 1);
  const cyclePct = clamp(cyclesDone / cycleGoal, 0, 1);
  const overall = clamp((minPct + cyclePct) / 2, 0, 1);

  return {
    minutesDone,
    minutesDoneRaw,
    cyclesDone,
    minGoal,
    cycleGoal,
    minPct,
    cyclePct,
    overall,
    done: minPct >= 1 && cyclePct >= 1
  };
}
/* ---------- retenção leve ---------- */
function hasStudyActivity(dayObj) {
  if (!dayObj) return false;

  const mins = (dayObj.ms || 0) / 60000;
  const cycles = dayObj.cycles || 0;
  const listens = dayObj.listens || 0;
  const calls = dayObj.calls || 0;

  return mins >= 2 || cycles > 0 || listens >= 3 || calls > 0;
}

function getHabitDay(key) {
  return STATE.habit?.days?.[key] || null;
}

function getStreakInfo() {
  ensureHabitToday();

  const today = todayKey();
  const todayActive = hasStudyActivity(getHabitDay(today));
  const yesterdayActive = hasStudyActivity(getHabitDay(dateKeyFromOffset(-1)));

  let streak = 0;
  let startOffset = todayActive ? 0 : -1;

  for (let offset = startOffset; offset > -370; offset--) {
    const key = dateKeyFromOffset(offset);
    const active = hasStudyActivity(getHabitDay(key));

    if (!active) break;
    streak++;
  }

  let label = "comece hoje";
  let message = "Faça 1 ciclo hoje. Pouco já mantém o japonês vivo.";

  if (todayActive && streak <= 1) {
    label = "hoje já contou";
    message = "Você já manteve o hábito vivo hoje. Amanhã é só continuar.";
  }

  if (todayActive && streak > 1) {
    label = `${streak} dias em ritmo`;
    message = "Hoje já contou. Volte amanhã para manter essa sequência leve.";
  }

  if (!todayActive && yesterdayActive && streak > 0) {
    label = `${streak} dia${streak === 1 ? "" : "s"} em ritmo`;
    message = "Faça um ciclo hoje para continuar sem peso.";
  }

  if (!todayActive && !yesterdayActive && streak === 0) {
    label = "retome com calma";
    message = "Sem culpa. Um ciclo hoje já recoloca o japonês em movimento.";
  }

  return {
    streak,
    todayActive,
    yesterdayActive,
    label,
    message
  };
}

function hasResumeTraining() {
  if (!STATE.session?.inProgress) return false;
  if (!STATE.session?.phraseId) return false;

  const p = getPhrase(STATE.session.phraseId);
  if (!p) return false;
  if (!canAccessTopic(p.topicId)) return false;

  return true;
}

function getResumePhrase() {
  if (!hasResumeTraining()) return null;
  return getPhrase(STATE.session.phraseId);
}

function getRetentionNudge() {
  const streak = getStreakInfo();
  const goal = todayGoalProgress();
  const resume = getResumePhrase();
  const phraseOfDay = getPhraseOfDay();

  if (resume && !goal.done) {
    return {
      badge: "continue",
      title: "Você já tem um treino aberto",
      text: "Volte exatamente para a frase onde parou. Menos procura, mais prática.",
      action: "continuar último treino"
    };
  }

  if (!streak.todayActive && phraseOfDay) {
    return {
      badge: "hoje",
      title: "A frase do dia está pronta",
      text: "Quando estiver cansado, comece por ela. Um treino curto já conta.",
      action: "treinar frase do dia"
    };
  }

  if (goal.done) {
    return {
      badge: "feito hoje",
      title: "Hoje você já manteve o ritmo",
      text: "Amanhã, volte sem recomeçar do zero. Constância leve também dá resultado.",
      action: "continuar treinando"
    };
  }

  return {
    badge: "ritmo leve",
    title: "Faça 1 ciclo hoje",
    text: "Poucos minutos bastam para não deixar o japonês esfriar.",
    action: "começar treino"
  };
}

/* ---------- Bloco 3C: revisão inteligente ---------- */
function isPhraseAccessible(p) {
  if (!p) return false;
  return canAccessTopic(p.topicId);
}

function isEssentialPhrase(p) {
  return !!p && p.topicId === "topic_essential_japan";
}

function isLastTrainingPhrase(p) {
  return !!p && !!STATE.session?.phraseId && p.id === STATE.session.phraseId;
}

function getReviewCandidates() {
  ensurePhrasesHaveValidTopic();

  const all = (STATE.bank.phrases || []).filter(isPhraseAccessible);
  const dayPhrase = getPhraseOfDay();
  const favorites = favoriteSet();

  return all.map(p => {
    const pr = getProg(p.id);
    const pct = phraseProgressPct(pr);
    const favorite = favorites.has(p.id);
    const essential = isEssentialPhrase(p);
    const phraseOfDay = dayPhrase && p.id === dayPhrase.id;
    const lastTraining = isLastTrainingPhrase(p);
    const mastered = pr.status === "mastered";
    const inTraining = pr.status !== "mastered";
    const almostDone = inTraining && pct >= 0.62;
    const started = inTraining && pct > 0.04;
    const untouched = inTraining && pct <= 0.04;

    return {
      phrase: p,
      progress: pr,
      pct,
      favorite,
      essential,
      phraseOfDay,
      lastTraining,
      mastered,
      inTraining,
      almostDone,
      started,
      untouched,
      score: 0
    };
  });
}

function scoreReviewPhrase(candidate) {
  if (!candidate?.phrase) return 0;

  let score = 0;

  if (candidate.phraseOfDay) score += 36;
  if (candidate.favorite) score += 32;
  if (candidate.lastTraining) score += 30;
  if (candidate.almostDone) score += 28;
  if (candidate.started) score += 22;
  if (candidate.essential) score += 18;
  if (candidate.inTraining) score += 12;
  if (candidate.mastered) score += 6;
  if (candidate.untouched) score += 4;

  const pctBoost = Math.round(candidate.pct * 18);
  score += pctBoost;

  const topic = getTopic(candidate.phrase.topicId);
  if (topic && isTopicPremium(topic.id) && isPremiumUnlocked()) score += 3;

  const seed = hashString(`${todayKey()}|${candidate.phrase.id}|review`);
  score += seed % 7;

  return score;
}

function getReviewReason(candidate) {
  if (!candidate?.phrase) {
    return {
      badge: "revisão",
      title: "Comece pelo essencial",
      text: "Treine uma frase hoje para o app sugerir revisões melhores depois.",
      cta: "abrir Pack Essencial",
      secondary: "salvar favoritas"
    };
  }

  if (candidate.almostDone) {
    return {
      badge: "quase dominada",
      title: "Vale fechar mais um ciclo",
      text: "Esta frase já avançou bastante. Repetir hoje pode transformar esforço antigo em memória mais firme.",
      cta: "fechar mais 1 ciclo",
      secondary: "ver favoritas"
    };
  }

  if (candidate.favorite) {
    return {
      badge: "favorita",
      title: "Uma frase importante para não esquecer",
      text: "Você salvou esta frase porque ela pode ser útil na vida real. Hoje é um bom dia para revisar.",
      cta: "revisar favorita",
      secondary: "abrir favoritas"
    };
  }

  if (candidate.lastTraining) {
    return {
      badge: "último treino",
      title: "Continue de onde parou",
      text: "Esta foi sua frase mais recente. Retomar daqui evita perder tempo escolhendo.",
      cta: "continuar esta frase",
      secondary: "abrir Pack Essencial"
    };
  }

  if (candidate.phraseOfDay) {
    return {
      badge: "frase do dia",
      title: "Boa para revisar hoje",
      text: "Ela foi escolhida como ponto de partida para manter contato com o japonês sem esforço mental.",
      cta: "revisar agora",
      secondary: "abrir Pack Essencial"
    };
  }

  if (candidate.essential) {
    return {
      badge: "essencial",
      title: "Útil para situações reais no Japão",
      text: "Esta frase pertence ao Pack Essencial Japão. É uma boa revisão curta para manter o básico vivo.",
      cta: "treinar revisão",
      secondary: "abrir Pack Essencial"
    };
  }

  if (candidate.started) {
    return {
      badge: "em construção",
      title: "Esta frase já começou a entrar",
      text: "Ela tem progresso parcial. Revisar hoje ajuda a não deixar esse avanço esfriar.",
      cta: "continuar revisão",
      secondary: "ver favoritas"
    };
  }

  return {
    badge: "revisão rápida",
    title: "Uma frase útil para hoje",
    text: "Revisão curta, direta e sem escolher muito. Boa para manter o japonês em movimento.",
    cta: "revisar agora",
    secondary: "abrir Pack Essencial"
  };
}

function getSmartReviewPhrase() {
  const candidates = getReviewCandidates();

  if (!candidates.length) {
    return {
      candidate: null,
      reason: getReviewReason(null)
    };
  }

  const scored = candidates
    .map(c => ({ ...c, score: scoreReviewPhrase(c) }))
    .sort((a, b) => b.score - a.score);

  const chosen = scored[0] || null;

  return {
    candidate: chosen,
    reason: getReviewReason(chosen)
  };
}

function shouldShowPremiumReviewNudge() {
  if (isPremiumUnlocked()) return false;

  const goal = todayGoalProgress();
  const favCount = favoritePhrasesAccessible().length;
  const today = getHabitDay(todayKey()) || {};
  const cycles = today.cycles || 0;
  const listens = today.listens || 0;

  return goal.done || favCount >= 2 || cycles >= 1 || listens >= 5;
}

/* ---------- Bloco 3E: treino por situação real ---------- */
const SITUATION_TRAINING = [
  {
    id: "work",
    label: "Trabalho",
    icon: "🏭",
    target: "topic_factory",
    fallback: "topic_essential_japan",
    premiumHint: "Esse tema é premium. Enquanto isso, treine o Pack Essencial Japão."
  },
  {
    id: "market",
    label: "Mercado",
    icon: "🛒",
    target: "topic_market",
    fallback: "topic_essential_japan",
    premiumHint: "Mercado é premium. O Pack Essencial ainda ajuda no básico de compras."
  },
  {
    id: "cityhall",
    label: "Prefeitura",
    icon: "🏢",
    target: "topic_cityhall",
    fallback: "topic_essential_japan",
    premiumHint: "Prefeitura é premium. Comece pelo Pack Essencial para ganhar base."
  },
  {
    id: "konbini",
    label: "Konbini",
    icon: "🏪",
    target: "topic_konbini",
    fallback: "topic_essential_japan",
    premiumHint: "Konbini é premium. O Pack Essencial ainda ajuda nas interações rápidas."
  },
  {
    id: "transport",
    label: "Transporte",
    icon: "🚃",
    target: "topic_trip",
    fallback: "topic_essential_japan",
    premiumHint: "Transporte é premium. Enquanto isso, revise frases essenciais."
  },
  {
    id: "favorites",
    label: "Favoritos",
    icon: "⭐",
    target: "FAV",
    fallback: "topic_essential_japan",
    emptyHint: "Salve frases favoritas para criar um treino pessoal rápido."
  },
  {
    id: "essential",
    label: "Pack Essencial",
    icon: "🧭",
    target: "topic_essential_japan",
    fallback: "topic_default"
  },
  {
    id: "hospital",
    label: "Hospital",
    icon: "🏥",
    target: "sensei_hospital",
    fallback: "topic_essential_japan",
    premiumHint: "Hospital fica melhor com frases do seu caso real. Use o Pack Essencial ou crie com o Sensei IA no premium."
  }
];

function getSituationTrainingOptions() {
  return SITUATION_TRAINING.map(opt => {
    const target = getSituationTarget(opt.id);
    return {
      ...opt,
      ...target
    };
  });
}

function getSituationTarget(situationId) {
  const opt = SITUATION_TRAINING.find(x => x.id === situationId);
  if (!opt) {
    return {
      filter: "topic_essential_japan",
      available: true,
      locked: false,
      empty: false,
      count: topicPhraseIds("topic_essential_japan").length,
      label: "Pack Essencial"
    };
  }

  if (opt.target === "FAV") {
    const count = favoritePhrasesAccessible().length;

    return {
      filter: "FAV",
      available: count > 0,
      locked: false,
      empty: count <= 0,
      count,
      label: opt.label,
      message: count > 0 ? "" : (opt.emptyHint || "Salve frases favoritas para criar um treino pessoal rápido.")
    };
  }

  if (opt.target === "sensei_hospital") {
    return {
      filter: opt.fallback || "topic_essential_japan",
      available: true,
      locked: false,
      empty: false,
      count: topicPhraseIds(opt.fallback || "topic_essential_japan").length,
      label: opt.label,
      message: opt.premiumHint || "Use o Pack Essencial ou crie frases personalizadas com o Sensei IA."
    };
  }

  const topic = getTopic(opt.target);
  const locked = !!topic && isTopicPremium(topic.id) && !isPremiumUnlocked();
  const count = topic ? topicPhraseIds(topic.id).filter(id => {
    const p = getPhrase(id);
    return p && canAccessTopic(p.topicId);
  }).length : 0;

  return {
    filter: locked ? (opt.fallback || "topic_essential_japan") : opt.target,
    originalFilter: opt.target,
    available: locked ? true : count > 0,
    locked,
    empty: !locked && count <= 0,
    count: locked ? topicPhraseIds(opt.fallback || "topic_essential_japan").length : count,
    label: opt.label,
    message: locked ? opt.premiumHint : ""
  };
}

function startSituationTraining(situationId) {
  ensurePhrasesHaveValidTopic();

  const opt = SITUATION_TRAINING.find(x => x.id === situationId);
  const target = getSituationTarget(situationId);

  if (!opt || !target) {
    return {
      ok: false,
      reason: "missing",
      label: "situação"
    };
  }

  if (target.empty) {
    return {
      ok: false,
      reason: target.filter === "FAV" ? "empty_favorites" : "empty",
      label: target.label,
      message: target.message || "Ainda não há frases neste contexto."
    };
  }

  STATE.session.topicFilter = target.filter;
  STATE.session.inProgress = true;
  STATE.session.queue = buildQueue();
  STATE.session.index = 0;
  STATE.session.phraseId = STATE.session.queue[0] || null;

  if (!STATE.session.phraseId) {
    STATE.session.topicFilter = opt.fallback || "topic_essential_japan";
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;
  }

  if (!STATE.session.phraseId) {
    saveState();
    return {
      ok: false,
      reason: "no_phrase",
      label: target.label,
      message: "Comece pelo Pack Essencial Japão."
    };
  }

  saveState();

  return {
    ok: true,
    locked: !!target.locked,
    label: target.locked ? "Pack Essencial" : target.label,
    filter: target.filter,
    message: target.message || ""
  };
}

/* ---------- Bloco 3F: treino rápido de 2 minutos ---------- */
function getQuickTrainingPhrase() {
  ensurePhrasesHaveValidTopic();

  const smart = getSmartReviewPhrase();
  if (smart?.candidate?.phrase && isPhraseAccessible(smart.candidate.phrase)) {
    return {
      phrase: smart.candidate.phrase,
      source: "review",
      priority: 1
    };
  }

  const day = getPhraseOfDay();
  if (day && isPhraseAccessible(day)) {
    return {
      phrase: day,
      source: "day",
      priority: 2
    };
  }

  const resume = getResumePhrase();
  if (resume && isPhraseAccessible(resume)) {
    return {
      phrase: resume,
      source: "resume",
      priority: 3
    };
  }

  const favs = favoritePhrasesAccessible();
  if (favs.length) {
    const seed = hashString(`${todayKey()}|quick|favorite`);
    return {
      phrase: favs[seed % favs.length],
      source: "favorite",
      priority: 4
    };
  }

  const inProgress = (STATE.bank.phrases || [])
    .filter(isPhraseAccessible)
    .map(p => ({ phrase: p, prog: getProg(p.id), pct: phraseProgressPct(getProg(p.id)) }))
    .filter(x => x.prog.status !== "mastered" && x.pct > 0)
    .sort((a, b) => b.pct - a.pct);

  if (inProgress.length) {
    return {
      phrase: inProgress[0].phrase,
      source: "progress",
      priority: 5
    };
  }

  const essential = (STATE.bank.phrases || [])
    .filter(p => p.topicId === "topic_essential_japan" && isPhraseAccessible(p));

  if (essential.length) {
    const seed = hashString(`${todayKey()}|quick|essential`);
    return {
      phrase: essential[seed % essential.length],
      source: "essential",
      priority: 6
    };
  }

  const accessible = (STATE.bank.phrases || []).filter(isPhraseAccessible);
  if (accessible.length) {
    return {
      phrase: accessible[0],
      source: "any",
      priority: 7
    };
  }

  return {
    phrase: null,
    source: "empty",
    priority: 99
  };
}

function getQuickTrainingReason(payload = getQuickTrainingPhrase()) {
  const source = payload?.source || "empty";

  const map = {
    review: {
      badge: "2 minutos",
      title: "Treino rápido recomendado",
      text: "Pouco tempo? Treine uma frase útil agora.",
      cta: "iniciar treino rápido"
    },
    day: {
      badge: "frase do dia",
      title: "Comece pela frase de hoje",
      text: "Uma frase, um ciclo e menos atrito.",
      cta: "treinar em 2 minutos"
    },
    resume: {
      badge: "retomar",
      title: "Continue sem escolher",
      text: "Volte para a última frase e mantenha o japonês vivo.",
      cta: "continuar rápido"
    },
    favorite: {
      badge: "favorita",
      title: "Revise algo importante",
      text: "Use seus favoritos como kit rápido de sobrevivência.",
      cta: "revisar favorita"
    },
    progress: {
      badge: "em progresso",
      title: "Aproveite o embalo",
      text: "Essa frase já começou a entrar. Reforce hoje.",
      cta: "reforçar agora"
    },
    essential: {
      badge: "essencial",
      title: "Treino rápido do básico",
      text: "Ideal para dias cansativos: uma frase útil, sem procurar.",
      cta: "começar rápido"
    },
    any: {
      badge: "rápido",
      title: "Uma frase útil agora",
      text: "2 minutos para manter contato com o japonês.",
      cta: "iniciar"
    },
    empty: {
      badge: "comece simples",
      title: "Ainda falta uma frase para treinar",
      text: "Comece pelo Pack Essencial Japão para liberar revisões melhores.",
      cta: "abrir Pack Essencial"
    }
  };

  return map[source] || map.any;
}

function startQuickTraining() {
  const payload = getQuickTrainingPhrase();
  const p = payload.phrase;

  if (!p) {
    const fallback = startSituationTraining("essential");
    if (fallback.ok) {
      toast("abrindo Pack Essencial");
      nav("#/105x");
      return true;
    }

    toast("adicione uma frase para começar");
    return false;
  }

  STATE.session.inProgress = true;
  STATE.session.topicFilter = "ALL";
  STATE.session.queue = buildQueue();

  if (!STATE.session.queue.includes(p.id)) {
    STATE.session.queue.unshift(p.id);
  }

  STATE.session.index = STATE.session.queue.indexOf(p.id);
  STATE.session.phraseId = p.id;

  resetCountForPhrase(p.id);
  saveState();

  toast("Treino rápido iniciado");
  nav("#/105x");

  return true;
}

/* ---------- mensagens de recompensa ---------- */
const CYCLE_REWARD_MESSAGES = [
  "Ciclo fechado. Essa frase ficou um pouco mais familiar.",
  "Bom ritmo. Pouco por dia também dá resultado.",
  "Você manteve o japonês vivo hoje.",
  "Mais uma repetição útil para a vida no Japão.",
  "Essa frase já está menos distante.",
  "Pequeno treino, memória trabalhando."
];

const MASTERED_REWARD_MESSAGES = [
  "Frase dominada. Essa já está mais perto da memória automática.",
  "Muito bom. Uma frase útil ficou mais sua.",
  "Você fortaleceu uma frase que pode ajudar no Japão.",
  "Frase concluída. Mais confiança para situações reais.",
  "Essa frase entrou no seu kit pessoal."
];

function rewardCycleMessage(masteredNow) {
  const pid = STATE.session?.phraseId || "";
  const seed = `${todayKey()}|${pid}|${STATE.stats.cyclesDone || 0}|reward`;

  if (masteredNow) {
    return pickFromList(MASTERED_REWARD_MESSAGES, seed) || MASTERED_REWARD_MESSAGES[0];
  }

  return pickFromList(CYCLE_REWARD_MESSAGES, seed) || CYCLE_REWARD_MESSAGES[0];
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

  if (type === "ding") {
    freq = 660;
    dur = 0.09;
  }

  if (type === "pop") {
    freq = 520;
    dur = 0.05;
  }

  if (type === "tuk") {
    freq = 140;
    dur = 0.06;
  }

  if (type === "level") {
    freq = 840;
    dur = 0.12;
  }

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
  if (isRealCheckoutConfigured()) {
    window.open(SALES.checkoutUrl, "_blank", "noopener,noreferrer");
    return;
  }

  toast("configure o checkout antes de vender");
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
    title: "Comece pelo essencial",
    text: "O grátis já libera treino 105x, Pack Essencial Japão, frase do dia, favoritos e meta leve."
  },
  {
    title: "Treine sem complicar",
    text: "Entre no treino, ouça a frase, leia a tradução e repita em voz alta."
  },
  {
    title: "Faça um treino rápido",
    text: "Quando estiver cansado, toque em 2 minutos e deixe o app escolher uma frase útil."
  },
  {
    title: "Feche ciclos",
    text: "Cada toque em “repeti em voz alta” aproxima a frase da memória automática."
  },
  {
    title: "Salve frases importantes",
    text: "Use favoritos para guardar frases que podem salvar sua rotina no Japão."
  },
  {
    title: "Escolha uma situação",
    text: "Use Treinar por situação para entrar direto no contexto que você precisa hoje."
  },
  {
    title: "Avance com o premium",
    text: "No premium ficam temas mais específicos e o Sensei IA para criar material sob medida."
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
  if (id === "FAV") return "Favoritas";
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

  const validPhraseIds = new Set((STATE.bank.phrases || []).map(p => p.id));
  const favs = STATE.favorites?.phraseIds || [];
  const cleanFavs = favs.filter(id => validPhraseIds.has(id));

  if (cleanFavs.length !== favs.length) {
    STATE.favorites.phraseIds = cleanFavs;
    changed = true;
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

  const existing = STATE.bank.topics.find(t => t.name.toLowerCase() === n.toLowerCase());
  if (existing) return existing;

  return createTopic(n) || ensureDefaultTopic();
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

  for (const id of ids) {
    delete STATE.progress[id];
  }

  STATE.favorites ||= { phraseIds: [] };
  STATE.favorites.phraseIds = (STATE.favorites.phraseIds || []).filter(id => !ids.has(id));

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

  if (tf === "FAV") {
    return favoritePhrasesAccessible();
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

function loadPhraseForReview(id) {
  if (!id) return false;

  const p = getPhrase(id);
  if (!p) return false;
  if (!canAccessTopic(p.topicId)) return false;

  STATE.session.inProgress = true;
  STATE.session.topicFilter = "ALL";
  STATE.session.queue = buildQueue();

  if (!STATE.session.queue.includes(id)) {
    STATE.session.queue.unshift(id);
  }

  STATE.session.index = STATE.session.queue.indexOf(id);
  STATE.session.phraseId = id;

  resetCountForPhrase(id);
  saveState();

  return true;
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
    toast("não há frases neste filtro");
    return false;
  }

  const next = STATE.session.index + 1;

  if (next >= q.length) {
    toast("você já está na última frase");
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
    toast("você já está na primeira frase");
    beep("tuk");
    return false;
  }

  STATE.session.index = prev;
  STATE.session.phraseId = q[STATE.session.index];

  resetCountForPhrase(STATE.session.phraseId);
  saveState();

  return true;
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

  if (!ok) toast("áudio indisponível. treine lendo em voz alta.");
}

function callAndResponse(jpRaw, rate, kanaEl, onDone) {
  if (callBusy) {
    toast("aguarde o ciclo terminar");
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
    toast("áudio indisponível. treine lendo em voz alta.");
  }
}

function showNowYouSheet(onDone) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;

  sheet.style.display = "block";
  sheet.innerHTML = `
    <div class="stamp">agora você ✅</div>
    <div class="small">repita em voz alta, sem pressa.</div>
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

  const msg = rewardCycleMessage(masteredNow);

  sheet.innerHTML = `
    <div class="stamp">${masteredNow ? "frase dominada 🌸" : "ciclo fechado 👏"}</div>
    <div class="small">${escapeHTML(msg)}</div>
    <div class="small">
      ${masteredNow
        ? "Use esta frase como revisão rápida quando precisar."
        : "Você pode seguir para a próxima frase ou repetir a mesma para reforçar."}
    </div>
    <div class="grid2">
      <button class="btn btn--ok btn--full" data-action="next">próxima frase</button>
      <button class="btn btn--full" data-action="reviewSame">revisar mesma frase</button>
    </div>
  `;
}

/* ---------- timer ---------- */
let timerTickId = null;

function ensureStudyDay() {
  const k = todayKey();

  if (!STATE.session.study) {
    STATE.session.study = {
      day: k,
      totalMs: 0,
      running: false,
      runStartAt: null
    };
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

  const goal = Math.max(
    5 * 60 * 1000,
    (STATE.goals?.dailyMinutes || DAILY_GOAL_DEFAULTS.minutes) * 60 * 1000
  );

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
      <div class="small" style="font-weight:800;margin-bottom:6px">explicação</div>
      ${rows}
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
        <div class="badge">honesto e direto</div>
      </div>

      <div class="planGrid">
        <div class="planCard">
          <div class="planTop">
            <h3 class="planName">Grátis</h3>
            <span class="planTag">começar</span>
          </div>

          <div class="planPrice">¥0 <small>/ início</small></div>
          <p class="planSub">Para manter contato com o japonês mesmo nos dias cansativos.</p>

          <ul class="planList">
            <li>treino 105x</li>
            <li>Pack Essencial Japão</li>
            <li>treino rápido de 2 minutos</li>
            <li>favoritos como revisão pessoal</li>
            <li>frase do dia</li>
            <li>revisão recomendada</li>
            <li>treino por situação</li>
            <li>backup local</li>
          </ul>
        </div>

        <div class="planCard premium">
          <div class="planTop">
            <h3 class="planName">Premium</h3>
            <span class="planTag">contexto real</span>
          </div>

          <div class="planPrice">${SALES.monthlyPrice} <small>/ mês</small></div>
          <p class="planSub">Para preparar seu japonês antes de situações específicas.</p>

          <ul class="planList">
            <li>tópicos específicos do Japão</li>
            <li>trabalho, prefeitura, mercado e transporte</li>
            <li>Sensei IA para criar frases do seu caso</li>
            <li>mais contexto antes de situações difíceis</li>
            <li>revisões mais próximas da vida real</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/* ---------- componentes de valor ---------- */
function renderFavoriteButton(id, compact = false) {
  const active = isFavorite(id);
  const label = active ? "remover favorito" : "salvar favorito";
  const icon = active ? "★" : "☆";
  const cls = compact ? "btn btn--ghost" : "btn";

  return `
    <button
      class="${cls}"
      data-action="toggleFavorite"
      data-id="${escapeHTML(id)}"
      aria-label="${label}"
      aria-pressed="${active ? "true" : "false"}"
    >${icon}</button>
  `;
}

function renderPhraseMiniCard(p, opts = {}) {
  if (!p) return "";

  const pr = getProg(p.id);
  const pct = phraseProgressPct(pr);
  const pctTxt = Math.round(pct * 100);
  const showGo = opts.showGo !== false;
  const title = opts.title || topicName(p.topicId);
  const actionLabel = opts.actionLabel || "treinar esta frase";
  const action = opts.action || "trainPhrase";

  return `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between" style="gap:10px">
        <div class="badge">${escapeHTML(title)}</div>
        ${renderFavoriteButton(p.id)}
      </div>

      <div class="small"><b>JP:</b> ${escapeHTML(jpStripFurigana(p.jp))}</div>
      <div class="small"><b>PT:</b> ${escapeHTML(p.pt)}</div>

      <div class="pWrap" aria-label="progresso da frase">
        <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
        <div class="pTxt">${pctTxt}%</div>
      </div>

      ${showGo ? `
        <button class="btn btn--ok btn--full" data-action="${escapeHTML(action)}" data-id="${escapeHTML(p.id)}">
          ${escapeHTML(actionLabel)}
        </button>
      ` : ""}
    </div>
  `;
}

function renderRetentionCard() {
  const streak = getStreakInfo();
  const nudge = getRetentionNudge();
  const resume = getResumePhrase();

  const resumeText = resume
    ? `${jpStripFurigana(resume.jp)} • ${resume.pt}`
    : "A próxima frase já está pronta para começar.";

  const action = resume ? "resumeTraining" : "startTraining";
  const btnLabel = resume ? "continuar último treino" : nudge.action;

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">${escapeHTML(nudge.badge)}</div>
        <div class="badge">${escapeHTML(streak.label)}</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">${escapeHTML(nudge.title)}</h3>
        <p class="lockText">${escapeHTML(nudge.text)}</p>
      </div>

      <div class="sheet stack" style="text-align:left">
        <div class="small"><b>continuidade:</b> ${escapeHTML(streak.message)}</div>
        <div class="small"><b>último foco:</b> ${escapeHTML(resumeText)}</div>
      </div>

      <button class="btn btn--ok btn--full" data-action="${action}">
        ${escapeHTML(btnLabel)}
      </button>
    </section>
  `;
}

function renderSmartReviewCard() {
  const smart = getSmartReviewPhrase();
  const candidate = smart.candidate;
  const reason = smart.reason;
  const p = candidate?.phrase || null;

  if (!p) {
    return `
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">revisão recomendada</div>
          <div class="badge">comece simples</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">${escapeHTML(reason.title)}</h3>
          <p class="lockText">${escapeHTML(reason.text)}</p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-action="topicFilter" data-id="topic_essential_japan">
            abrir Pack Essencial
          </button>
          <button class="btn btn--full" data-nav="#/tutorial">
            como revisar
          </button>
        </div>
      </section>
    `;
  }

  const premiumNudge = shouldShowPremiumReviewNudge()
    ? `
      <div class="sheet stack premiumBridge" style="text-align:left">
        <div class="small">
          Quer treinar situações mais específicas? O premium amplia para fábrica, prefeitura, moradia, mercado e transporte.
        </div>
        <button class="btn btn--ghost btn--full" data-nav="#/premium">ver como o premium ajuda</button>
      </div>
    `
    : "";

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">revisão recomendada</div>
        <div class="badge">${escapeHTML(reason.badge)}</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">${escapeHTML(reason.title)}</h3>
        <p class="lockText">${escapeHTML(reason.text)}</p>
      </div>

      ${renderPhraseMiniCard(p, {
        title: topicName(p.topicId),
        actionLabel: reason.cta,
        action: "reviewPhrase"
      })}

      <div class="grid2">
        <button class="btn btn--ghost btn--full" data-action="reviewPhrase" data-id="${escapeHTML(p.id)}">
          ${escapeHTML(reason.cta)}
        </button>
        <button class="btn btn--full" data-action="topicFilter" data-id="${candidate.favorite ? "FAV" : "topic_essential_japan"}">
          ${escapeHTML(reason.secondary)}
        </button>
      </div>

      ${premiumNudge}
    </section>
  `;
}
function renderQuickTrainingCard() {
  const quick = getQuickTrainingPhrase();
  const reason = getQuickTrainingReason(quick);
  const p = quick?.phrase || null;

  if (!p) {
    return `
      <section class="card stack quickTrainingCard">
        <div class="row row--between">
          <div class="badge">treino rápido</div>
          <div class="badge">2 minutos</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Pouco tempo? Comece pelo essencial.</h3>
          <p class="lockText">
            Treine uma frase hoje para o app sugerir melhor amanhã.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-action="startQuickTraining">
            iniciar treino rápido
          </button>
          <button class="btn btn--full" data-action="topicFilter" data-id="topic_essential_japan">
            Pack Essencial
          </button>
        </div>
      </section>
    `;
  }

  return `
    <section class="card stack quickTrainingCard">
      <div class="row row--between">
        <div class="badge">treino rápido</div>
        <div class="badge">2 minutos</div>
      </div>

      <div class="quickTrainingHero">
        <div class="quickTrainingIcon">⚡</div>
        <div class="quickTrainingText">
          <h3 class="lockTitle">${escapeHTML(reason.title)}</h3>
          <p class="lockText">${escapeHTML(reason.text)}</p>
        </div>
      </div>

      <div class="quickPhrasePreview">
        <div class="small"><b>JP:</b> ${escapeHTML(jpStripFurigana(p.jp))}</div>
        <div class="small"><b>PT:</b> ${escapeHTML(p.pt)}</div>
      </div>

      <div class="grid2">
        <button class="btn btn--ok btn--full" data-action="startQuickTraining">
          ${escapeHTML(reason.cta)}
        </button>
        <button class="btn btn--full" data-action="reviewPhrase" data-id="${escapeHTML(p.id)}">
          abrir frase
        </button>
      </div>
    </section>
  `;
}

function renderSituationTrainingCard() {
  const options = getSituationTrainingOptions();

  const buttons = options.map(opt => {
    const locked = opt.locked;
    const empty = opt.empty;
    const extraClass = `${locked ? " isLocked" : ""}${empty ? " isEmpty" : ""}`;
    const status = locked
      ? "premium"
      : empty
        ? "vazio"
        : opt.count > 0
          ? `${opt.count} frases`
          : "rápido";

    return `
      <button
        class="situationBtn${extraClass}"
        data-action="startSituation"
        data-id="${escapeHTML(opt.id)}"
        aria-label="treinar situação ${escapeHTML(opt.label)}"
      >
        <span class="situationIcon">${escapeHTML(opt.icon)}</span>
        <span class="situationText">
          <span class="situationName">${escapeHTML(opt.label)}</span>
          <span class="situationMeta">${escapeHTML(status)}</span>
        </span>
      </button>
    `;
  }).join("");

  return `
    <section class="card stack situationCard">
      <div class="row row--between">
        <div class="badge">treinar por situação</div>
        <div class="badge">vida real</div>
      </div>

      <div class="situationIntro">
        <h3 class="lockTitle">Escolha o contexto de hoje</h3>
        <p class="lockText">
          Vai enfrentar uma situação hoje? Treine frases úteis antes de sair.
        </p>
      </div>

      <div class="situationGrid">
        ${buttons}
      </div>

      <div class="situationFooter">
        <div class="small">
          Atalhos rápidos para estudar sem procurar demais. O grátis abre o essencial, o premium aprofunda situações específicas.
        </div>
      </div>
    </section>
  `;
}

function renderPhraseOfDayCard() {
  const p = getPhraseOfDay();
  if (!p) return "";

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">frase do dia</div>
        <div class="badge">treino rápido</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">Um ponto de partida para hoje</h3>
        <p class="lockText">
          Use esta frase quando estiver cansado ou sem saber por onde começar. Ela transforma o “só vou abrir o app” em um treino real.
        </p>
      </div>

      ${renderPhraseMiniCard(p, {
        title: topicName(p.topicId),
        actionLabel: "treinar frase do dia"
      })}
    </section>
  `;
}

function renderDailyGoalCard() {
  const g = todayGoalProgress();
  const streak = getStreakInfo();
  const pct = Math.round(g.overall * 100);

  const title = g.done
    ? "Meta concluída hoje"
    : "Meta leve para manter constância";

  const text = g.done
    ? "Você já fez o mínimo que mantém o hábito vivo. Amanhã fica mais fácil voltar."
    : "A meta é pequena de propósito: poucos minutos e pelo menos um ciclo para não deixar o japonês esfriar.";

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">meta diária</div>
        <div class="badge">${pct}%</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">${escapeHTML(title)}</h3>
        <p class="lockText">${escapeHTML(text)}</p>
      </div>

      <div class="sheet stack">
        <div class="row row--between">
          <div class="small">tempo de estudo</div>
          <div class="small">${g.minutesDone} / ${g.minGoal} min</div>
        </div>
        <div class="pWrap" aria-label="meta de tempo">
          <div class="pBar"><div class="pFill" style="transform:scaleX(${g.minPct})"></div></div>
          <div class="pTxt">${Math.round(g.minPct * 100)}%</div>
        </div>

        <div class="row row--between">
          <div class="small">ciclos concluídos</div>
          <div class="small">${g.cyclesDone} / ${g.cycleGoal}</div>
        </div>
        <div class="pWrap" aria-label="meta de ciclos">
          <div class="pBar"><div class="pFill" style="transform:scaleX(${g.cyclePct})"></div></div>
          <div class="pTxt">${Math.round(g.cyclePct * 100)}%</div>
        </div>

        <div class="small">${escapeHTML(streak.message)}</div>
      </div>
    </section>
  `;
}

function renderFavoritesCard() {
  const list = favoritePhrasesAccessible();

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">favoritos</div>
        <div class="badge">${list.length} salvas</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">Seu kit pessoal de revisão</h3>
        <p class="lockText">
          Favoritos são frases que você não quer esquecer. Salve o que pode te ajudar no trabalho, mercado, prefeitura ou conversas reais.
        </p>
      </div>

      ${
        list.length
          ? list.slice(0, 3).map(p => renderPhraseMiniCard(p, {
              title: "favorita",
              actionLabel: "revisar favorita",
              action: "reviewPhrase"
            })).join("")
          : `
            <div class="sheet stack" style="text-align:left">
              <div class="small">
                Salve frases importantes para montar sua revisão pessoal. Toque em ☆ durante o treino quando encontrar uma frase útil.
              </div>
              <button class="btn btn--ok btn--full" data-action="topicFilter" data-id="topic_essential_japan">
                começar pelo Pack Essencial
              </button>
            </div>
          `
      }

      <button class="btn btn--full" data-action="topicFilter" data-id="FAV">
        abrir favoritas
      </button>
    </section>
  `;
}

function renderFreeValueCard() {
  const essentialCount = (STATE.bank.phrases || []).filter(p => p.topicId === "topic_essential_japan").length;
  const favCount = favoritePhrasesAccessible().length;

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">plano grátis</div>
        <div class="badge">valor real</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">O básico já precisa ajudar de verdade</h3>
        <p class="lockText">
          Comece com ${essentialCount} frases essenciais, treino rápido de 2 minutos, frase do dia, favoritos, revisão recomendada e meta leve.
        </p>
      </div>

      <div class="valueGrid">
        <div class="valueCard">
          <div class="valueIcon">⚡</div>
          <h3 class="valueTitle">Treino rápido</h3>
          <p class="valueText">Uma frase útil para dias cansativos.</p>
        </div>

        <div class="valueCard">
          <div class="valueIcon">🧭</div>
          <h3 class="valueTitle">Pack Essencial</h3>
          <p class="valueText">Frases para se virar melhor em situações comuns.</p>
        </div>

        <div class="valueCard">
          <div class="valueIcon">⭐</div>
          <h3 class="valueTitle">Favoritos</h3>
          <p class="valueText">Monte sua revisão pessoal com o que mais importa.</p>
        </div>

        <div class="valueCard">
          <div class="valueIcon">🎯</div>
          <h3 class="valueTitle">Situação real</h3>
          <p class="valueText">Escolha mercado, trabalho, prefeitura, konbini ou transporte.</p>
        </div>
      </div>

      <div class="grid2">
        <button class="btn btn--ok btn--full" data-action="startQuickTraining">
          treino rápido
        </button>
        <button class="btn btn--full" data-action="topicFilter" data-id="FAV">
          favoritas (${favCount})
        </button>
      </div>
    </section>
  `;
}

function renderEssentialPackHighlight() {
  const count = (STATE.bank.phrases || []).filter(p => p.topicId === "topic_essential_japan").length;

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">Pack Essencial Japão</div>
        <div class="badge">${count} frases</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">Primeiras frases para destravar a rotina</h3>
        <p class="lockText">
          Um conjunto inicial para pedir ajuda, entender instruções, falar com calma e ganhar confiança no cotidiano.
        </p>
      </div>

      <div class="grid2">
        <button class="btn btn--ok btn--full" data-action="topicFilter" data-id="topic_essential_japan">
          estudar o essencial
        </button>
        <button class="btn btn--full" data-nav="#/tutorial">
          como usar melhor
        </button>
      </div>
    </section>
  `;
}

function renderPremiumValueGrid() {
  return `
    <div class="valueGrid premiumValueGrid">
      <div class="valueCard">
        <div class="valueIcon">🏭</div>
        <h3 class="valueTitle">Trabalho e chefe</h3>
        <p class="valueText">Frases para pedir explicação, confirmar tarefas e responder com respeito.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">🏢</div>
        <h3 class="valueTitle">Prefeitura e documentos</h3>
        <p class="valueText">Contexto para situações que exigem calma, clareza e vocabulário prático.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">🏪</div>
        <h3 class="valueTitle">Mercado e konbini</h3>
        <p class="valueText">Treinos para compras, pagamento, atendimento e pedidos rápidos.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">🏠</div>
        <h3 class="valueTitle">Moradia</h3>
        <p class="valueText">Frases para reparo, vazamento, contato com imobiliária e problemas do dia a dia.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">🚃</div>
        <h3 class="valueTitle">Transporte</h3>
        <p class="valueText">Prepare-se antes de pegar trem, ônibus, perguntar horário ou direção.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">🤖</div>
        <h3 class="valueTitle">Sensei IA</h3>
        <p class="valueText">Crie frases para o seu caso real e salve tudo no app para treinar depois.</p>
      </div>
    </div>
  `;
}

function renderPremiumUseCases() {
  return `
    <div class="sheet stack premiumUseCases" style="text-align:left">
      <div class="row row--between">
        <div class="badge">quando o premium ajuda</div>
        <div class="badge">contexto</div>
      </div>

      <div class="useCaseList">
        <div class="useCaseItem">
          <span class="useCaseIcon">🧑‍🏭</span>
          <span>antes de falar com chefe ou líder na fábrica</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">🏢</span>
          <span>antes de ir à prefeitura ou resolver documentos</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">🏥</span>
          <span>quando precisa explicar uma situação específica</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">🏠</span>
          <span>quando o conteúdo pronto não cobre seu problema real</span>
        </div>
      </div>
    </div>
  `;
}

function renderPremiumSoftBridge() {
  if (isPremiumUnlocked()) return "";

  return `
    <section class="card stack premiumBridgeCard">
      <div class="row row--between">
        <div class="badge">premium</div>
        <div class="badge">sem pressão</div>
      </div>

      <div class="lockCard">
        <h3 class="lockTitle">O grátis mantém o japonês vivo. O premium prepara para situações específicas.</h3>
        <p class="lockText">
          Quando você precisar de frases para chefe, prefeitura, moradia, transporte ou um caso muito específico, o premium começa a fazer mais sentido.
        </p>
      </div>

      <div class="grid2">
        <button class="btn btn--ok btn--full" data-nav="#/premium">
          ver como o premium ajuda
        </button>
        <button class="btn btn--full" data-action="startQuickTraining">
          continuar no grátis
        </button>
      </div>
    </section>
  `;
}

/* ---------- landing ---------- */
function renderLanding() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card heroCard stack">
        <div class="badge">${escapeHTML(BRAND.tagline)}</div>

        <h1 class="heroTitle">
          Japonês útil para quem vive a rotina real do Japão.
        </h1>

        <p class="heroLead">
          Treine frases curtas, ouça em japonês, repita em voz alta e revise o que importa sem precisar pensar demais.
        </p>

        <div class="heroActions">
          <button class="bigBtn" data-nav="#/home">começar grátis</button>
          <button class="btn btn--ghost btn--full" data-nav="#/premium">comparar planos</button>
        </div>

        <div class="heroMiniStats">
          <div class="statCard">
            <div class="statVal">2 min</div>
            <div class="statLbl">treino rápido</div>
          </div>
          <div class="statCard">
            <div class="statVal">105x</div>
            <div class="statLbl">fixação guiada</div>
          </div>
          <div class="statCard">
            <div class="statVal">situação</div>
            <div class="statLbl">treino direto</div>
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">feito para dekasseguis</div>
          <div class="badge">pouco tempo</div>
        </div>

        <h2 class="h2">Para estudar mesmo depois de um dia pesado.</h2>

        <p class="p">
          O app foi pensado para brasileiros no Japão que trabalham muito, chegam cansados e precisam de japonês prático para viver melhor.
        </p>

        <div class="valueGrid">
          <div class="valueCard">
            <div class="valueIcon">⚡</div>
            <h3 class="valueTitle">2 minutos possíveis</h3>
            <p class="valueText">Uma entrada rápida para manter contato com o japonês.</p>
          </div>

          <div class="valueCard">
            <div class="valueIcon">🧠</div>
            <h3 class="valueTitle">Cria memória</h3>
            <p class="valueText">Repetição guiada para a frase ficar mais familiar.</p>
          </div>

          <div class="valueCard">
            <div class="valueIcon">🔁</div>
            <h3 class="valueTitle">Revisa por você</h3>
            <p class="valueText">O app sugere uma frase útil para revisar hoje.</p>
          </div>

          <div class="valueCard">
            <div class="valueIcon">📍</div>
            <h3 class="valueTitle">Situação real</h3>
            <p class="valueText">Escolha o contexto e entre no treino certo.</p>
          </div>
        </div>
      </section>

      ${renderPlanCompareBox()}

      <section class="ctaBand stack">
        <div class="badge">primeiro treino</div>
        <h2 class="h2">Abra o app, toque no treino rápido e mantenha o japonês vivo.</h2>
        <p class="p">A versão grátis já ajuda hoje. O premium aprofunda com mais situações reais e Sensei IA.</p>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/home">entrar no app</button>
          <button class="btn btn--full" data-nav="#/premium">comparar planos</button>
        </div>

        <div class="storeGrid">
          <a class="storeBtn" href="${escapeHTML(SALES.playStoreUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Google Play">
            <span class="ic">▶</span>
            <span>Google Play</span>
          </a>

          <a class="storeBtn" href="${escapeHTML(SALES.appStoreUrl)}" target="_blank" rel="noopener noreferrer" aria-label="App Store">
            <span class="ic" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;">
              <svg width="20" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.37 12.47c.03 3.22 2.82 4.29 2.85 4.3-.02.08-.45 1.54-1.49 3.05-.9 1.3-1.84 2.59-3.31 2.62-1.45.03-1.92-.86-3.58-.86-1.67 0-2.19.84-3.55.89-1.42.05-2.5-1.42-3.41-2.71C1.99 17.89.5 14.45.53 11.19c.02-2.1 1.09-4.06 2.84-5.12 1.45-.9 3.38-.97 4.92-.09 1.35.76 2.25.86 3.78.09 1.5-.74 3.36-.63 4.72.08-1.2.72-2.01 2.05-2.02 3.53-.01 1.24.57 2.17 1.6 2.79zM13.92 2.48c.76-.92 1.28-2.19 1.14-3.48-1.1.04-2.43.73-3.22 1.65-.71.82-1.33 2.12-1.16 3.36 1.22.09 2.48-.62 3.24-1.53z"/>
              </svg>
            </span>
            <span>App Store</span>
          </a>
        </div>
      </section>
    </div>
  `;
}

/* ---------- premium ---------- */
function renderPremium() {
  const unlocked = isPremiumUnlocked();
  const checkoutReady = isRealCheckoutConfigured();

  APP.innerHTML = `
    <div class="stack">
      <section class="premiumHero stack">
        <div class="badge">premium</div>
        <h1 class="h1">Mais contexto para situações reais no Japão.</h1>
        <p class="p">
          O grátis mantém o japonês vivo. O premium prepara você para momentos específicos: chefe, prefeitura, moradia, transporte, mercado e situações que pedem mais segurança.
        </p>

        ${renderPlanCompareBox()}

        <div class="lockCard">
          <h3 class="lockTitle">Premium não é só mais conteúdo</h3>
          <p class="lockText">
            É treino por contexto: frases mais próximas da situação que você vai enfrentar, com Sensei IA para criar material quando o conteúdo pronto não basta.
          </p>
        </div>

        ${renderPremiumValueGrid()}
        ${renderPremiumUseCases()}

        <div class="planGrid">
          <div class="planCard premium">
            <div class="planTop">
              <h3 class="planName">Mensal</h3>
              <span class="planTag">flexível</span>
            </div>

            <div class="planPrice">${SALES.monthlyPrice}<small>/ mês</small></div>
            <p class="planSub">Ideal para destravar temas específicos e sentir o app completo na rotina.</p>

            <ul class="planList">
              <li>todos os tópicos premium</li>
              <li>treino por situação mais completo</li>
              <li>Sensei IA para casos reais</li>
              <li>mais frases por contexto</li>
              <li>revisões mais direcionadas</li>
            </ul>

            <div class="planFooter">
              <button class="btn btn--ok btn--full" data-action="checkout">
                ${checkoutReady ? "desbloquear situações reais" : "configurar checkout"}
              </button>
            </div>
          </div>

          <div class="planCard">
            <div class="planTop">
              <h3 class="planName">Semestral</h3>
              <span class="planTag">constância</span>
            </div>

            <div class="planPrice">${SALES.semiannualPrice}<small>/ plano</small></div>
            <p class="planSub">Melhor para quem quer manter ritmo por mais tempo e construir segurança com calma.</p>

            <ul class="planList">
              <li>mais tempo de prática</li>
              <li>melhor custo por período</li>
              <li>mais chance de criar hábito</li>
              <li>mais preparação antes de situações difíceis</li>
            </ul>

            <div class="planFooter">
              <button class="btn btn--full" data-action="checkout">
                ${checkoutReady ? "preparar meu japonês" : "configurar checkout"}
              </button>
            </div>
          </div>
        </div>

        ${unlocked ? `
          <div class="sheet stack">
            <div class="badge">premium liberado ✅</div>
            <div class="grid2">
              <button class="btn btn--ok btn--full" data-nav="#/sensei">abrir Sensei IA</button>
              <button class="btn btn--full" data-nav="#/home">voltar ao app</button>
            </div>
          </div>
        ` : `
          <div class="sheet stack">
            <div class="small">Continue no grátis ou desbloqueie mais temas quando quiser treinar com mais contexto.</div>
            <div class="grid2">
              <button class="btn btn--ok btn--full" data-action="checkout">
                ${checkoutReady ? "treinar com mais contexto" : "preparar venda"}
              </button>
              <button class="btn btn--full" data-nav="#/home">continuar no grátis</button>
            </div>
          </div>
        `}
      </section>
    </div>
  `;
}
