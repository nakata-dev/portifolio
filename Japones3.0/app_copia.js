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
          <h3 class="lockTitle">Área interna de testes</h3>
          <p class="lockText">
            Use esta tela apenas para validar o acesso premium antes da publicação.
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
            <div class="small">Digite a senha interna para liberar testes.</div>
            <input id="adminPass" class="btn" style="height:56px; text-align:left" type="password" placeholder="senha admin" />
            <button class="btn btn--ok btn--full" data-action="loginAdmin">entrar</button>
          </div>
        `}
      </section>
    </div>
  `;
}

/* ---------- home ---------- */
function renderHome() {
  ensurePhrasesHaveValidTopic();

  const topicFilter = STATE.session.topicFilter || "ALL";
  const filterLabel = topicFilter === "ALL" ? "tudo" : topicName(topicFilter);
  const favCount = favoritePhrasesAccessible().length;
  const resume = hasResumeTraining();

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">início</div>
          <button class="btn btn--ghost" data-nav="#/landing">apresentação</button>
        </div>

        <h1 class="h1">Treine japonês útil hoje.</h1>
        <p class="p">
          Comece rápido, revise uma frase recomendada ou escolha uma situação real.
        </p>

        <button class="bigBtn" id="btnStart">
          ${resume ? "continuar último treino" : "começar treino"}
        </button>

        <div class="sep"></div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">tema de estudo</div>
            <div class="badge">agora: ${escapeHTML(filterLabel)}</div>
          </div>

          <div class="row">
            <select class="btn selectBtn" id="topicFilterSel" aria-label="filtro de tópicos">
              <option value="ALL">tudo</option>
              <option value="FAV" ${topicFilter === "FAV" ? "selected" : ""}>favoritas ${favCount ? `(${favCount})` : ""}</option>
              ${(STATE.bank.topics || []).map(t => {
                const locked = isTopicPremium(t.id) && !isPremiumUnlocked();
                return `<option value="${t.id}" ${t.id === topicFilter ? "selected" : ""}>${escapeHTML(t.name)}${locked ? " 🔒" : ""}</option>`;
              }).join("")}
            </select>
            <button class="btn btn--ghost" data-nav="#/manage">gerenciar</button>
          </div>

          <div class="small">Use “tudo” para seguir o fluxo, ou escolha um tema para treinar com foco.</div>
        </div>

        <div class="row">
          <button class="btn" data-nav="#/105x">abrir treino</button>
          <button class="btn" data-nav="#/edit">nova frase</button>
          <button class="btn" data-nav="#/backup">backup</button>
          <button class="btn btn--ghost" data-nav="#/skills">skills</button>
        </div>
      </section>

      ${renderRetentionCard()}
      ${renderSmartReviewCard()}
      ${renderQuickTrainingCard()}
      ${renderSituationTrainingCard()}
      ${renderDailyGoalCard()}
      ${renderPhraseOfDayCard()}
      ${renderEssentialPackHighlight()}
      ${renderFavoritesCard()}

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">progresso</div>
          <div class="badge">🪙 ${STATE.stats.coins || 0}</div>
        </div>
        <div class="small">ciclos: ${STATE.stats.cyclesDone || 0} • dominadas: ${STATE.stats.phrasesMastered || 0}</div>
      </section>

      ${renderFreeValueCard()}
      ${renderPremiumSoftBridge()}

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">Sensei IA</div>
          <div class="badge">${isPremiumUnlocked() ? "liberado" : "premium"}</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Material para a sua necessidade</h3>
          <p class="lockText">
            Crie frases para chefe, fábrica, hospital, aluguel, viagem, mercado ou qualquer situação da sua vida no Japão.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/sensei">
            ${isPremiumUnlocked() ? "abrir Sensei IA" : "ver Sensei IA"}
          </button>
          <button class="btn btn--full" data-nav="#/premium">
            ${isPremiumUnlocked() ? "ver premium" : "comparar planos"}
          </button>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">suporte</div>
          <div class="badge">${STATE.tutorial.done ? "tutorial visto" : "recomendado"}</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Use melhor, sem se perder</h3>
          <p class="lockText">
            Veja o tutorial, organize suas frases ou faça backup quando quiser proteger seu progresso.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/tutorial">
            ${STATE.tutorial.done ? "rever tutorial" : "ver tutorial"}
          </button>
          <button class="btn btn--ghost btn--full" data-nav="#/backup">abrir backup</button>
        </div>
      </section>
    </div>
  `;

  const startBtn = $("#btnStart");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (hasResumeTraining()) {
        nav("#/105x");
        toast("continuando treino");
      } else {
        startAuto();
        toast("treino iniciado");
      }
    });
  }

  const sel = $("#topicFilterSel");
  if (sel) {
    sel.addEventListener("change", () => {
      const chosen = sel.value;

      if (chosen !== "ALL" && chosen !== "FAV" && isTopicPremium(chosen) && !isPremiumUnlocked()) {
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
      toast("tema aplicado");
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
            <button class="btn btn--ok btn--full" data-action="tutorialNext">
              ${step >= TUTORIAL_STEPS.length - 1 ? "concluir" : "próximo"}
            </button>
          </div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Atalho prático</h3>
          <p class="lockText">
            Quando estiver cansado, use o treino rápido. Quando tiver uma situação real, escolha o contexto e treine direto.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ghost btn--full" data-nav="#/premium">comparar planos</button>
          <button class="btn btn--full" data-nav="#/home">ir para o início</button>
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
      jp: "賞味期限{しょうみげん} は いつ ですか。",
      pt: "Qual é a data de validade?",
      newWords: [
        { jp: "賞味期限{しょうみげん}", pt: "data de validade" }
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
  if (level) parts.push(`Nível: ${level}.`);
  if (tone) parts.push(`Tom: ${tone}.`);

  parts.push("Material pensado para repetição, fala, revisão e uso imediato no Japão.");

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
      <div class="small"><b>${item.phrases.length}</b> frases prontas para salvar e revisar no app</div>
    </div>
  `).join("");
}

function renderSensei() {
  if (!isPremiumUnlocked()) {
    APP.innerHTML = `
      <div class="stack">
        <section class="card stack">
          <div class="row row--between">
            <div class="badge">Sensei IA</div>
            <button class="btn" data-nav="#/home">voltar</button>
          </div>

          <div class="lockCard">
            <h3 class="lockTitle">Quando o conteúdo pronto não basta</h3>
            <p class="lockText">
              O Sensei IA cria frases para a sua situação real, como chefe, hospital, prefeitura, moradia, mercado ou transporte. Depois você salva no app e treina no 105x.
            </p>
          </div>

          <div class="valueGrid">
            <div class="valueCard">
              <div class="valueIcon">🧩</div>
              <h3 class="valueTitle">Seu caso real</h3>
              <p class="valueText">Explique a situação e receba frases úteis para treinar.</p>
            </div>

            <div class="valueCard">
              <div class="valueIcon">💾</div>
              <h3 class="valueTitle">Salva no app</h3>
              <p class="valueText">O material vira tópico para revisar depois.</p>
            </div>
          </div>

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-nav="#/premium">ver premium</button>
            <button class="btn btn--full" data-nav="#/home">continuar grátis</button>
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
          <h3 class="lockTitle">Peça frases para uma situação real</h3>
          <p class="lockText">
            Explique o que você precisa falar no Japão. O app cria um pequeno pack para você treinar e revisar.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="small">qual é a sua necessidade agora?</div>
          <textarea
            id="senseiRequest"
            class="btn"
            style="height:140px;width:100%;text-align:left;padding:12px;border-radius:18px;"
            placeholder="ex: preciso de frases para falar com meu chefe quando eu não entender a tarefa"
          ></textarea>

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
            <div class="small">nome do tópico</div>
            <input
              id="senseiTheme"
              class="btn"
              style="height:56px;width:100%;text-align:left"
              placeholder="ex: chefe da fábrica, consulta médica, mercado"
            />
          </div>

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="generateSensei">gerar frases</button>
            <button class="btn btn--full" data-nav="#/manage">gerenciar frases</button>
          </div>
        </div>

        <div id="senseiOutput" class="stack"></div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">histórico</div>
          <div class="small">últimos materiais</div>
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
        <div class="small" style="font-weight:800;margin-top:4px">explicação</div>
        ${(p.newWords || []).map(w => `<div class="small">${escapeHTML(formatWordExplanation(w))}</div>`).join("")}
      </div>
    `).join("")}

    <div class="grid2">
      <button class="btn btn--ok btn--full" data-action="saveSenseiPack">salvar no app</button>
      <button class="btn btn--full" data-nav="#/105x">ir ao treino</button>
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
          <div class="badge">sem frases neste filtro</div>
          <div class="small">Escolha outro tema, abra o Pack Essencial ou salve frases como favoritas.</div>

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="topicFilter" data-id="ALL">treinar tudo</button>
            <button class="btn btn--full" data-action="topicFilter" data-id="topic_essential_japan">Pack Essencial</button>
          </div>
        </section>
      </div>
    `;
    return;
  }

  const currentFilter = STATE.session.topicFilter || "ALL";
  const currentPhrase = getPhrase(STATE.session.phraseId);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack" id="view105x">
        <div class="row row--between" style="align-items:center">
          <div class="studyActions">
            <button class="miniBtn" title="skills" aria-label="skills" data-nav="#/skills">🏅</button>
            <button class="miniBtn" title="gerenciar frases" aria-label="gerenciar frases" data-nav="#/manage">✏️</button>
          </div>

          <button class="btn btn--muted" data-nav="#/home" style="min-height:40px;padding:0 16px;">sair</button>
        </div>

        <div class="sheet stack" style="text-align:center">
          <div class="small">tema do treino</div>
          <select class="btn selectBtn" id="topicFilterSel105x" aria-label="selecionar tema do treino" style="max-width:360px;margin:0 auto;">
            <option value="ALL">tudo</option>
            <option value="FAV" ${currentFilter === "FAV" ? "selected" : ""}>favoritas</option>
            ${(STATE.bank.topics || []).map(t => {
              const locked = isTopicPremium(t.id) && !isPremiumUnlocked();
              return `<option value="${t.id}" ${t.id === currentFilter ? "selected" : ""}>${escapeHTML(t.name)}${locked ? " 🔒" : ""}</option>`;
            }).join("")}
          </select>
        </div>

        <div class="studyDock">
          <div class="studyRight">
            <div class="studyTimer" aria-label="tempo de estudo">
              <div class="studyTimerRow">
                <div class="studyTime"><span class="ic">⏱</span> <span id="studyTime">00:00:00 (0d)</span></div>
                <div class="studyHint">tempo dedicado</div>
              </div>
              <div class="studyBar"><div class="studyFill" id="studyFill"></div></div>
            </div>

            <button class="btn btn--ghost callBtn" data-action="toggleCall">
              ${STATE.session.callMode ? "call: on" : "call: off"}
            </button>
          </div>
        </div>

        <div class="phraseArea" aria-label="frase em treino">
          <div class="row row--between" id="phraseTopRow" style="gap:10px;align-items:center;">
            <div class="badge" id="phraseTopicBadge">${escapeHTML(topicName(currentPhrase?.topicId || ""))}</div>
            <span id="favoriteSlot">${renderFavoriteButton(STATE.session.phraseId)}</span>
          </div>

          <div class="counterMini" id="counterBox" aria-label="contador">
            <div class="counterVal" id="countVal">-</div>
            <div class="counterSub" id="cycleSub">ciclo</div>
          </div>

          <div class="kana" id="kanaLine"></div>
          <div class="pt" id="ptLine"></div>
        </div>

        <div class="row" style="display:grid;grid-template-columns:56px minmax(0,1fr) 56px;gap:10px;align-items:center;">
          <button class="btn btn--muted" data-action="prev" aria-label="frase anterior" style="min-height:54px;padding:0;">‹</button>
          <button class="btn btn--ghost btn--full" data-action="speak" data-rate="1" style="min-height:54px;">ouvir</button>
          <button class="btn btn--muted" data-action="next" aria-label="próxima frase" style="min-height:54px;padding:0;">›</button>
        </div>

        <div class="primaryRow">
          <button class="primaryAction" data-action="repeat">repeti em voz alta</button>
        </div>

        <div id="newWordsBox"></div>

        <div id="cycleSheet" class="sheet stack" style="display:none"></div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">frases do treino</div>
          <div class="small">organizadas por tema</div>
        </div>
        <div class="list" id="phraseList"></div>
      </section>
    </div>
  `;

  const sel105x = $("#topicFilterSel105x");
  if (sel105x) {
    sel105x.addEventListener("change", () => {
      const chosen = sel105x.value;

      if (chosen !== "ALL" && chosen !== "FAV" && isTopicPremium(chosen) && !isPremiumUnlocked()) {
        showPremiumLockedMessage(chosen);
        sel105x.value = STATE.session.topicFilter || "ALL";
        return;
      }

      STATE.session.topicFilter = chosen;
      STATE.session.queue = buildQueue();
      STATE.session.index = 0;
      STATE.session.phraseId = STATE.session.queue[0] || null;

      saveState();
      toast("tema atualizado");
      beep("ding");
      render();
    });
  }

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

  const phrases = phrasesByFilter();
  const currentFilter = STATE.session.topicFilter || "ALL";

  if (currentFilter === "FAV") {
    box.innerHTML = phrases.length ? phrases.map(x => {
      const pr = getProg(x.id);
      const st = pr.status === "mastered" ? "dominada" : "em treino";
      const pct = phraseProgressPct(pr);
      const pctTxt = Math.round(pct * 100);

      return `
        <div class="item">
          <div class="itemTop">
            <div style="min-width:0;text-align:left">
              <p class="itemTitle">★ ${escapeHTML(jpStripFurigana(x.jp))}</p>
              <div class="itemMeta">${escapeHTML(x.pt)} • ${escapeHTML(topicName(x.topicId))} • ${st}</div>

              <div class="pWrap" aria-label="progresso">
                <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
                <div class="pTxt">${pctTxt}%</div>
              </div>
            </div>

            <div class="row" style="gap:8px">
              ${renderFavoriteButton(x.id, true)}
              <button class="btn" data-action="goto" data-id="${escapeHTML(x.id)}">abrir</button>
            </div>
          </div>
        </div>
      `;
    }).join("") : `
      <div class="sheet stack">
        <div class="small">Você ainda não salvou favoritas. Toque em ☆ durante o treino para montar sua revisão pessoal.</div>
      </div>
    `;
    return;
  }

  const byTopic = new Map();
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
          const st = pr.status === "mastered" ? "dominada" : "em treino";
          const pct = phraseProgressPct(pr);
          const pctTxt = Math.round(pct * 100);

          return `
            <div class="item">
              <div class="itemTop">
                <div style="min-width:0;text-align:left">
                  <p class="itemTitle">${isFavorite(x.id) ? "★ " : ""}${escapeHTML(jpStripFurigana(x.jp))}</p>
                  <div class="itemMeta">${escapeHTML(x.pt)} • ${st}</div>

                  <div class="pWrap" aria-label="progresso">
                    <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
                    <div class="pTxt">${pctTxt}%</div>
                  </div>
                </div>

                <div class="row" style="gap:8px">
                  ${renderFavoriteButton(x.id, true)}
                  <button class="btn" data-action="goto" data-id="${escapeHTML(x.id)}">abrir</button>
                </div>
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
  if (!p) return;

  const pr = getProg(pid);
  const cs = clamp(pr.cycleStart || 14, 1, 14);
  const count = clamp(pr.count || cs, 1, cs);

  const countVal = $("#countVal");
  const cycleSub = $("#cycleSub");
  const kanaEl = $("#kanaLine");
  const ptLine = $("#ptLine");
  const nw = $("#newWordsBox");
  const sheet = $("#cycleSheet");
  const topicBadge = $("#phraseTopicBadge");
  const favoriteSlot = $("#favoriteSlot");

  if (countVal) countVal.textContent = String(count);
  if (cycleSub) cycleSub.textContent = `ciclo ${cs} → 1`;

  if (topicBadge) topicBadge.textContent = topicName(p.topicId);
  if (favoriteSlot) favoriteSlot.innerHTML = renderFavoriteButton(pid);

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
          <div class="badge">${editing ? "editar frase" : "nova frase"}</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="row row--between" style="gap:10px">
            <div class="badge">tema</div>
            <button class="btn btn--ghost" data-nav="#/manage">gerenciar</button>
          </div>

          ${renderTopicSelect(topicId)}

          <div class="sep"></div>

          <div class="small">japonês com furigana opcional. exemplo: 仕事{しごと}</div>
          <input
            id="inJp"
            class="btn"
            style="height:56px;width:100%;text-align:left"
            placeholder="ex: 私{わたし} は 今日{きょう} 忙{いそが}しいです。"
            value="${escapeHTML(jpVal)}"
          />

          <div class="small">tradução em português</div>
          <input
            id="inPt"
            class="btn"
            style="height:56px;width:100%;text-align:left"
            placeholder="ex: hoje estou ocupado."
            value="${escapeHTML(ptVal)}"
          />

          <div class="small">palavras novas. formato: jp=pt, jp=pt</div>
          <input
            id="inNW"
            class="btn"
            style="height:56px;width:100%;text-align:left"
            placeholder="ex: 名前{なまえ}=nome"
            value="${escapeHTML(nwVal)}"
          />

          <button class="btn btn--ok btn--full" data-action="${editing ? "saveEdit" : "addPhrase"}" data-id="${editing ? escapeHTML(editing.id) : ""}">
            ${editing ? "salvar alterações" : "salvar frase"}
          </button>

          ${editing ? `<button class="btn btn--muted btn--full" data-nav="#/manage">voltar ao gerenciador</button>` : ""}

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
          <div class="small">criar novo tema</div>
          <div class="row" style="gap:10px;flex-wrap:nowrap">
            <input id="topicNewName2" class="btn" style="flex:1;min-width:0" placeholder="ex: fábrica, segurança, aeroporto..." />
            <button class="btn btn--ok" data-action="addTopic">adicionar</button>
          </div>
          <div class="small" id="topicMsg"></div>
        </div>

        <div class="sep"></div>

        <div class="row row--between">
          <div class="badge">temas e frases</div>
          <button class="btn btn--ghost" data-nav="#/edit">nova frase</button>
        </div>

        <div class="small">Use furigana com chaves. exemplo: 名前{なまえ}</div>

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
        <button class="btn btn--ok" data-action="addPhraseToTopic" data-id="${escapeHTML(t.id)}">adicionar frase</button>
        ${hasPhrases ? `<button class="btn btn--muted" data-action="clearTopic" data-id="${escapeHTML(t.id)}">limpar tema</button>` : ``}
        ${canDeleteTopic ? `<button class="btn btn--bad" data-action="deleteTopic" data-id="${escapeHTML(t.id)}">excluir tema</button>` : `<span class="badge">fixo</span>`}
      </div>
    `;

    const bodyHtml = `
      <div class="topicBody ${isCollapsed ? "isCollapsed" : ""}">
        ${toolsHtml}
        ${hasPhrases ? `
          <div class="reorderList" data-reorder-list="1" data-topic="${escapeHTML(t.id)}">
            ${list.map(p => {
              const pr = getProg(p.id);
              const st = pr.status === "mastered" ? "dominada" : "em treino";

              return `
                <div class="reorderItem" data-reorder-item="1" data-topic="${escapeHTML(t.id)}" data-id="${escapeHTML(p.id)}">
                  <div class="reorderTop">
                    <div class="reorderLeft">
                      <p class="itemTitle">${isFavorite(p.id) ? "★ " : ""}${escapeHTML(jpStripFurigana(p.jp))}</p>
                      <div class="itemMeta">${escapeHTML(p.pt)} • ${st}</div>
                    </div>

                    <div class="row" style="gap:8px">
                      ${renderFavoriteButton(p.id, true)}
                      <div class="dragHandle" title="segure e arraste" aria-label="segure e arraste">≡</div>
                      <button class="btn btn--ghost" data-action="editPhrase" data-id="${escapeHTML(p.id)}">editar</button>
                      <button class="btn btn--bad" data-action="deletePhrase" data-id="${escapeHTML(p.id)}">excluir</button>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
          <div class="small">Segure no ≡ e arraste para ordenar.</div>
        ` : `
          <div class="sheet stack">
            <div class="small">Este tema ainda não tem frases.</div>
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

  STATE.favorites ||= { phraseIds: [] };
  STATE.favorites.phraseIds = (STATE.favorites.phraseIds || []).filter(x => x !== id);

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
      if (msgEl) msgEl.textContent = "backup tem japonês inválido.";
      toast("japonês inválido no backup");
      beep("tuk");
      return false;
    }
  }

  STATE = migrateToV7(st);
  saveState();
  refreshHUD();

  if (msgEl) msgEl.textContent = "importado com sucesso";
  toast("backup importado");
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
          <div class="small">Use o backup para guardar suas frases, progresso, favoritos e revisões.</div>
        </div>

        <div class="sheet stack">
          <div class="badge">importar</div>

          <div class="grid2">
            <button class="btn btn--muted btn--full" data-action="importText">importar texto</button>
            <button class="btn btn--muted btn--full" data-action="importFile">importar arquivo</button>
          </div>

          <input id="fileImport" type="file" accept=".json,application/json" style="display:none" />

          <div class="small">cole o json aqui</div>
          <textarea id="importBox" class="btn" style="height:160px;width:100%;text-align:left;padding:12px;border-radius:18px;"></textarea>
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
          <button class="btn btn--full" data-action="toggleSound">${STATE.prefs.audio.enabled ? "som ligado" : "som desligado"}</button>
          <button class="btn btn--full" data-action="toggleVibe">${STATE.prefs.haptics.enabled ? "vibração ligada" : "vibração desligada"}</button>
        </div>

        <div class="sheet stack">
          <div class="small">volume do som</div>
          <input id="vol" type="range" min="0" max="1" step="0.05" value="${STATE.prefs.audio.volume ?? 0.35}" />
          <div class="small">O som é leve e só toca depois do primeiro toque.</div>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">meta diária</div>
            <div class="badge">${STATE.goals.dailyMinutes} min • ${STATE.goals.dailyCycles} ciclo</div>
          </div>

          <div class="small">minutos por dia</div>
          <input id="goalMin" type="range" min="3" max="15" step="1" value="${STATE.goals.dailyMinutes}" />
          <div class="small" id="goalMinLbl">${STATE.goals.dailyMinutes} min</div>

          <div class="small">ciclos por dia</div>
          <input id="goalCycles" type="range" min="1" max="5" step="1" value="${STATE.goals.dailyCycles}" />
          <div class="small" id="goalCyclesLbl">${STATE.goals.dailyCycles} ciclo(s)</div>
        </div>

        <div class="sep"></div>

        <div class="grid2">
          <button class="btn btn--ghost btn--full" data-nav="#/tutorial">tutorial</button>
          <button class="btn btn--ghost btn--full" data-nav="#/premium">premium</button>
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
  { days: 7, name: "Bronze", vibe: "o japonês começa a ficar menos distante", icon: "🥉" },
  { days: 30, name: "Aço", vibe: "a rotina de treino começa a criar forma", icon: "🛡️" },
  { days: 90, name: "Ouro", vibe: "você já começa a responder com mais confiança", icon: "🥇" },
  { days: 150, name: "Platina", vibe: "a repetição começa a virar reflexo", icon: "💠" },
  { days: 210, name: "Diamante", vibe: "o cotidiano fica mais leve", icon: "💎" },
  { days: 270, name: "Fluência", vibe: "o hábito virou resultado", icon: "🌸" }
];

function isStudyDay(dayObj) {
  return hasStudyActivity(dayObj);
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
    { name: "audição", val: listening, icon: "🎧", tip: "ouvir mais deixa o som familiar" },
    { name: "fala", val: speaking, icon: "🗣️", tip: "repetir em voz alta reduz a trava" },
    { name: "repetição", val: repetition, icon: "🔁", tip: "ciclos fechados criam memória" },
    { name: "vocabulário", val: vocab, icon: "📦", tip: "frases treinadas viram ferramenta" },
    { name: "confiança", val: confidence, icon: "✨", tip: "resultado acumulado do treino" }
  ];
}

function renderSkills() {
  const sum = habitSummary();
  const streak = getStreakInfo();
  const avg = Math.max(sum.last7MinPerDay, 0);
  const avgShow = avg > 0.1 ? `${avg.toFixed(1)} min/dia` : "sem ritmo ainda";
  const { current } = rankFromActiveDays(sum.activeDays);

  const prog = overallProgressByMinutes(sum.totalMin);
  const finish = projectedFinishDate(avg);
  const dates = projectedRankDates(avg);
  const bars = skillBars();

  const progPct = Math.round(prog * 100);

  const projTxt = finish
    ? `mantendo ${avgShow}, previsão: ${fmtDateShort(finish)}`
    : `treine alguns minutos hoje para gerar projeção`;

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
      ? `<span class="badge">feito</span>`
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
            <div class="badge">${sum.activeDays} dias ativos</div>
            <div class="badge">${escapeHTML(streak.label)}</div>
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
          <div class="small">Dia ativo = 2 minutos, 1 ciclo ou algumas escutas. Sem culpa.</div>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">projeção</div>
            <div class="badge">${avgShow}</div>
          </div>
          <div class="stack" style="gap:8px">${datesList || `<div class="small">Treine hoje para começar a projeção.</div>`}</div>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">habilidades</div>
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

  if (act === "toggleFavorite") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    const on = toggleFavorite(id);
    toast(on ? "salvo nos favoritos" : "removido dos favoritos");
    beep(on ? "ding" : "tuk");
    render();

    return;
  }

  if (act === "startTraining") {
    startAuto();
    toast("treino iniciado");
    return;
  }

  if (act === "startQuickTraining") {
    unlockAudio();

    const result = startQuickTraining();

    if (result && result.ok) {
      toast(result.message || "treino rápido iniciado");
      beep("ding");
      return;
    }

    toast("abrindo Pack Essencial");
    beep("tuk");
    startSituationTraining("essential");

    return;
  }

  if (act === "resumeTraining") {
    if (hasResumeTraining()) {
      toast("continuando treino");
      nav("#/105x");
    } else {
      startAuto();
      toast("treino iniciado");
    }
    return;
  }

  if (act === "startSituation") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    const result = startSituationTraining(id);

    if (result === true) return;

    if (result && result.ok) {
      toast(`Treino iniciado: ${result.label}`);
      beep("ding");
      return;
    }

    if (result && result.reason === "premium") {
      toast("tema premium. abrindo Pack Essencial");
      startSituationTraining("essential");
      return;
    }

    if (result && result.reason === "empty_favorites") {
      toast("salve favoritas para criar esse treino");
      nav("#/105x");
      return;
    }

    if (result && result.reason === "empty") {
      toast("sem frases neste contexto. abrindo essencial");
      startSituationTraining("essential");
      return;
    }

    toast("não consegui iniciar este treino");
    beep("tuk");

    return;
  }

  if (act === "reviewPhrase") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    const p = getPhrase(id);
    if (!p || !canAccessTopic(p.topicId)) {
      toast("frase indisponível");
      beep("tuk");
      return;
    }

    STATE.session.inProgress = true;

    const previousFilter = STATE.session.topicFilter || "ALL";
    STATE.session.topicFilter = canAccessTopic(p.topicId) ? previousFilter : "ALL";
    STATE.session.queue = buildQueue();

    if (!STATE.session.queue.includes(id)) {
      STATE.session.queue.unshift(id);
    }

    STATE.session.index = STATE.session.queue.indexOf(id);
    STATE.session.phraseId = id;

    resetCountForPhrase(id);
    saveState();

    toast("revisão carregada");
    beep("ding");
    nav("#/105x");

    return;
  }

  if (act === "trainPhrase") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    if (!STATE.session.inProgress) {
      STATE.session.inProgress = true;
    }

    STATE.session.topicFilter = "ALL";
    STATE.session.queue = buildQueue();

    if (!STATE.session.queue.includes(id)) {
      STATE.session.queue.unshift(id);
    }

    STATE.session.index = STATE.session.queue.indexOf(id);
    STATE.session.phraseId = id;

    resetCountForPhrase(id);
    saveState();

    toast("frase carregada");
    beep("ding");
    nav("#/105x");

    return;
  }

  if (act === "checkout") {
    openCheckout();
    return;
  }

  if (act === "loginAdmin") {
    const val = ($("#adminPass")?.value || "").trim();

    if (!val) {
      toast("digite a senha");
      beep("tuk");
      return;
    }

    if (val !== ADMIN.passcode) {
      toast("senha incorreta");
      beep("tuk");
      return;
    }

    unlockAdminSuccess();
    toast("admin liberado");
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
    toast("premium liberado");
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
      toast("tutorial concluído");
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
      toast("descreva sua necessidade");
      beep("tuk");
      return;
    }

    const pack = generateSenseiMaterial({ request, level, tone, theme });
    renderSenseiOutput(pack);
    toast("frases geradas");
    beep("ding");

    return;
  }

  if (act === "saveSenseiPack") {
    const box = $("#senseiOutput");

    if (!box?.dataset.pack) {
      toast("gere as frases primeiro");
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
    toast(`${result.added} frase(s) salvas`);
    beep("ding");
    render();

    return;
  }

  if (act === "repeat") {
    onRepeat();
    return;
  }

  if (act === "repeatSame") {
    unlockAudio();

    const id = STATE.session.phraseId;
    if (!id) return;

    resetCountForPhrase(id);
    saveState();

    const sheet = $("#cycleSheet");
    if (sheet) sheet.style.display = "none";

    toast("mesma frase recarregada");
    beep("pop");
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

    toast("próxima frase");
    beep("pop");
    render105xBodyOnly();
    renderPhraseListOnly();

    const sheet = $("#cycleSheet");
    if (sheet) sheet.style.display = "none";

    return;
  }

  if (act === "goto") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    if (!STATE.session.inProgress) {
      STATE.session.inProgress = true;
      STATE.session.queue = buildQueue();
    }

    if (!STATE.session.queue.includes(id)) {
      STATE.session.queue.unshift(id);
    }

    setPhraseById(id);
    toast("frase carregada");
    beep("pop");
    nav("#/105x");

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

    if (id !== "ALL" && id !== "FAV" && isTopicPremium(id) && !isPremiumUnlocked()) {
      showPremiumLockedMessage(id);
      return;
    }

    STATE.session.topicFilter = id;
    STATE.session.inProgress = true;
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;

    saveState();

    if (route() !== "#/105x") {
      nav("#/105x");
    } else {
      render();
    }

    toast(id === "ALL" ? "treino: tudo" : `treino: ${topicName(id)}`);
    beep("ding");

    return;
  }

  if (act === "toggleCall") {
    unlockAudio();

    STATE.session.callMode = !STATE.session.callMode;
    saveState();

    toast(STATE.session.callMode ? "call and response ligado" : "call and response desligado");
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
      msg.textContent = "nome vazio ou já existente.";
      toast("tema inválido");
      beep("tuk");
      return;
    }

    input.value = "";
    msg.textContent = "tema criado";
    toast("tema criado");
    beep("ding");
    renderManage();

    return;
  }

  if (act === "deleteTopic") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    const ok = confirm("Excluir este tema? As frases serão movidas para Frases aleatórias.");
    if (!ok) return;

    const done = deleteTopic(id);
    if (!done) return;

    toast("tema excluído");
    beep("tuk");
    renderManage();

    return;
  }

  if (act === "clearTopic") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    const name = topicName(id);
    const ok = confirm(`Apagar todas as frases de "${name}"?`);
    if (!ok) return;

    const n = clearTopic(id);
    toast(n ? `${n} frase(s) apagadas` : "nada para apagar");
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
      if (msg) msg.textContent = "preencha japonês e português.";
      toast("faltou preencher");
      beep("tuk");
      return;
    }

    if (!isValidJP(jp)) {
      if (msg) msg.textContent = "japonês inválido.";
      toast("japonês inválido");
      beep("tuk");
      return;
    }

    for (const w of nw) {
      if (!isValidJP(w.jp)) {
        if (msg) msg.textContent = "palavra nova inválida.";
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
    toast("frase salva");
    beep("ding");

    if (msg) msg.textContent = "frase salva";

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
      if (msg) msg.textContent = "preencha japonês e português.";
      toast("faltou preencher");
      beep("tuk");
      return;
    }

    if (!isValidJP(jp)) {
      if (msg) msg.textContent = "japonês inválido.";
      toast("japonês inválido");
      beep("tuk");
      return;
    }

    for (const w of nw) {
      if (!isValidJP(w.jp)) {
        if (msg) msg.textContent = "palavra nova inválida.";
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
    toast("alterações salvas");
    beep("ding");

    if (msg) msg.textContent = "alterações salvas";

    nav("#/manage");

    return;
  }

  if (act === "deletePhrase") {
    unlockAudio();

    const id = btn.dataset.id;
    if (!id) return;

    const ok = confirm("Excluir esta frase?");
    if (!ok) return;

    const removed = deletePhraseById(id);
    if (!removed) return;

    toast("frase excluída");
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
        if (msg) msg.textContent = "backup copiado";
        toast("backup copiado");
        beep("ding");
      }).catch(() => {
        if (msg) msg.textContent = "não deu para copiar. copie manualmente.";
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

    if (msg) msg.textContent = "backup baixado";
    toast("backup baixado");
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
    const ok = confirm("Resetar todo o app? Isso apaga frases, progresso, favoritos e ajustes.");
    if (!ok) return;

    localStorage.removeItem(LS_KEY);
    localStorage.removeItem("jp_105x_v6");
    localStorage.removeItem("jp_105x_v5");
    localStorage.removeItem("jp_105x_v4");
    localStorage.removeItem("jp_105x_v3");
    localStorage.removeItem("jp_105x_v2");

    STATE = defaultState();
    saveState();

    toast("app resetado");
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
  toast("ordem salva");
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

  if (el && el.id === "goalMin") {
    const v = clamp(Number(el.value), 3, 15);
    STATE.goals.dailyMinutes = v;
    saveState();

    const lbl = $("#goalMinLbl");
    if (lbl) lbl.textContent = `${v} min`;
  }

  if (el && el.id === "goalCycles") {
    const v = clamp(Number(el.value), 1, 5);
    STATE.goals.dailyCycles = v;
    saveState();

    const lbl = $("#goalCyclesLbl");
    if (lbl) lbl.textContent = `${v} ciclo(s)`;
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
      if (msg) msg.textContent = "não deu para ler o arquivo.";
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