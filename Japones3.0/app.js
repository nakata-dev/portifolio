/* =========================================================
   NIHONGO321 v8.5.42
   Bloco 2C + Bloco 3A + Bloco 3B + Bloco 3C + Bloco 3D
   + Bloco 3E + Bloco 3F + Bloco 3G + Bloco 3I
   + Bloco 3J + Bloco 3K + Bloco 4A + Bloco 4B
   + Bloco 5.7A
   - correções críticas preservadas
   - logo oficial em img/logo_nihongo321.png
   - modo claro ☀️ e modo escuro 🌙
   - cores inspiradas na logo
   - checklist final interno em #/launch-checklist
   - Sensei IA professor especialista
   - Sensei IA com modo gramática, palavra-alvo e situação real
   - Sensei IA gera 7 exemplos para gramática/palavra-alvo
   ========================================================= */

const LS_KEY = "jp_105x_v7";

/* ========= IDENTIDADE DO PRODUTO ========= */
const BRAND = {
  name: "NIHONGO321",
  tagline: "Japonês prático no Japão",
  promise: "Treine frases úteis para viver melhor no Japão.",
  version: "8.5.42",
  updatedAt: "2026-05-08",
  logoPath: "./img/logo_nihongo321.png"
};

/* ========= CONFIG COMERCIAL =========
   IMPORTANTE PARA PUBLICAÇÃO:
   1. Cadastre seus dados bancários SOMENTE na plataforma de checkout externa.
   2. Não coloque dados bancários, chave Pix, número de conta, documento ou endereço sensível neste arquivo.
   3. Depois que a plataforma gerar o link de pagamento, cole esse link em checkoutUrl.
   4. Atualize supportEmail para seu e-mail real de suporte.
   5. Atualize monthlyPrice e semiannualPrice se mudar os preços.
   6. Atualize playStoreUrl e appStoreUrl quando o app estiver publicado.
*/
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

const THEME_STORAGE_KEY = "nihongo321_theme";

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


function backupTopicNameById(topicId) {
  const topic = (STATE.bank?.topics || []).find(t => t.id === topicId);
  return topic?.name || "Frases compartilhadas";
}

function safeShareLineValue(value = "") {
  return String(value ?? "")
    .replace(/\r?\n/g, "\\n")
    .trim();
}

function buildSimpleShareTextPack() {
  ensurePhrasesHaveValidTopic();

  const phrases = (STATE.bank?.phrases || []).filter(p => String(p?.jp || "").trim() && String(p?.pt || "").trim());
  const lines = [
    "NIHONGO321_SHARE_V1",
    `APP: ${BRAND.name}`,
    `VERSAO: ${BRAND.version}`,
    `DATA: ${new Date().toISOString()}`,
    `TOTAL_FRASES: ${phrases.length}`,
    "",
    "COMO USAR:",
    "1. Copie todo este texto.",
    "2. Abra o NIHONGO321.",
    "3. Vá em Gerenciar / Backup.",
    "4. Cole na área de importar.",
    "5. Toque em importar texto.",
    "Nada será apagado.",
    "",
    "INICIO_FRASES"
  ];

  for (const phrase of phrases) {
    lines.push("");
    lines.push("[FRASE]");
    lines.push(`TEMA: ${safeShareLineValue(backupTopicNameById(phrase.topicId))}`);
    lines.push(`JP: ${safeShareLineValue(phrase.jp)}`);
    lines.push(`PT: ${safeShareLineValue(phrase.pt)}`);

    if (Array.isArray(phrase.newWords) && phrase.newWords.length) {
      const words = phrase.newWords
        .map(w => `${safeShareLineValue(w.jp)}=${safeShareLineValue(w.pt)}`)
        .filter(x => x !== "=")
        .join(" | ");
      if (words) lines.push(`PALAVRAS: ${words}`);
    }
  }

  lines.push("");
  lines.push("FIM_FRASES");
  lines.push("FIM_NIHONGO321_SHARE_V1");

  return {
    text: lines.join("\n"),
    count: phrases.length
  };
}

function buildSimpleJsonPack() {
  ensurePhrasesHaveValidTopic();

  const phrases = (STATE.bank?.phrases || [])
    .filter(p => String(p?.jp || "").trim() && String(p?.pt || "").trim())
    .map(p => ({
      id: p.id,
      jp: p.jp,
      pt: p.pt,
      newWords: Array.isArray(p.newWords) ? p.newWords : [],
      topicId: p.topicId || "topic_default",
      createdAt: p.createdAt || now(),
      updatedAt: p.updatedAt || now()
    }));

  const usedTopicIds = new Set(phrases.map(p => p.topicId));
  const topics = (STATE.bank?.topics || [])
    .filter(t => usedTopicIds.has(t.id))
    .map(t => ({
      id: t.id,
      name: t.name,
      color: t.color || "tBlue",
      createdAt: t.createdAt || now(),
      updatedAt: t.updatedAt || now()
    }));

  return {
    schema: "nihongo321_content_pack_v2",
    exportKind: "incremental_content_pack",
    appName: BRAND.name,
    appVersion: BRAND.version,
    exportedAt: new Date().toISOString(),
    mergeMode: "add_or_merge_without_erasing_local_content",
    bank: { topics, phrases },
    progress: {},
    favorites: { phraseIds: [] },
    stats: { topics: topics.length, phrases: phrases.length }
  };
}

async function copyTextUniversal(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.setAttribute("readonly", "readonly");
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand("copy");
    textarea.remove();
    return !!ok;
  } catch {
    return false;
  }
}

async function handleBackupButtonAction(act) {
  const msg = $("#backupMsg");
  const box = $("#importBox");
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  try {
    const pack = buildSimpleShareTextPack();
    const textPack = pack.text;

    if (!pack.count) {
      if (msg) msg.textContent = "não há frases para compartilhar ainda.";
      toast("sem frases para compartilhar");
      beep("tuk");
      return;
    }

    if (act === "shareTextPack") {
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Pacote de frases NIHONGO321",
            text: textPack
          });
          if (msg) msg.textContent = `compartilhamento aberto com ${pack.count} frase(s).`;
          toast("compartilhamento aberto");
          beep("ding");
          return;
        }
      } catch {
        /* segue para cópia */
      }

      const copied = await copyTextUniversal(textPack);
      if (copied) {
        if (msg) msg.textContent = "WhatsApp/LINE não abriu. Copiei o pacote; agora cole na conversa.";
        toast("pacote copiado");
        beep("ding");
        return;
      }

      if (box) {
        box.value = textPack;
        box.focus();
        box.select();
      }
      if (msg) msg.textContent = "não consegui abrir nem copiar. O pacote está na caixa abaixo: selecione tudo e envie.";
      toast("copie manualmente");
      beep("tuk");
      return;
    }

    if (act === "exportCopy") {
      const copied = await copyTextUniversal(textPack);
      if (copied) {
        if (msg) msg.textContent = `texto copiado com ${pack.count} frase(s).`;
        toast("texto copiado");
        beep("ding");
        return;
      }

      if (box) {
        box.value = textPack;
        box.focus();
        box.select();
      }
      if (msg) msg.textContent = "não consegui copiar automaticamente. O pacote está na caixa abaixo.";
      toast("copie manualmente");
      beep("tuk");
      return;
    }

    if (act === "exportTxtFile") {
      downloadTextFile(`nihongo321-pacote-whatsapp-line-${y}-${m}-${dd}.txt`, textPack, "text/plain;charset=utf-8");
      if (msg) msg.textContent = `arquivo .txt baixado com ${pack.count} frase(s).`;
      toast("arquivo .txt baixado");
      beep("ding");
      return;
    }

    if (act === "exportFile") {
      const json = buildSimpleJsonPack();
      downloadTextFile(`nihongo321-pacote-frases-${y}-${m}-${dd}.json`, JSON.stringify(json, null, 2), "application/json;charset=utf-8");
      if (msg) msg.textContent = `arquivo .json baixado com ${json.stats.phrases} frase(s).`;
      toast("arquivo .json baixado");
      beep("ding");
      return;
    }
  } catch (err) {
    console.error("NIHONGO321 backup action error:", err);
    if (msg) msg.textContent = "ocorreu um erro no compartilhamento. Tente copiar texto ou baixar .txt.";
    toast("erro no backup");
    beep("tuk");
  }
}


try {
  window.NIHONGO321_BACKUP_ACTION = function(actionName) {
    try {
      handleBackupButtonAction(actionName);
    } catch (err) {
      console.error("NIHONGO321 backup direct action error:", err);
      const msg = document.querySelector("#backupMsg");
      if (msg) msg.textContent = "erro ao executar o backup. Tente recarregar a página e tocar novamente.";
    }
  };
} catch { }


function normalizeName(s) {
  return String(s || "").trim().replace(/\s+/g, " ").slice(0, 50);
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

/* ---------- tema claro / escuro ---------- */
function getTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return "dark";
}

function themeLabel(theme = getTheme()) {
  return theme === "light" ? "modo claro" : "modo escuro";
}

function themeIcon(theme = getTheme()) {
  return theme === "light" ? "☀️" : "🌙";
}

function applyTheme(theme = getTheme()) {
  const safeTheme = theme === "light" ? "light" : "dark";

  document.documentElement.dataset.theme = safeTheme;
  document.documentElement.style.colorScheme = safeTheme === "light" ? "light" : "dark";

  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) {
    metaTheme.setAttribute("content", safeTheme === "light" ? "#fff4d7" : "#060912");
  }

  const themeBtn = $("#hudTheme");
  if (themeBtn) {
    themeBtn.textContent = themeIcon(safeTheme);
    themeBtn.setAttribute(
      "aria-label",
      safeTheme === "light" ? "ativar modo escuro" : "ativar modo claro"
    );
    themeBtn.setAttribute("title", safeTheme === "light" ? "modo claro" : "modo escuro");
  }
}

function setTheme(theme) {
  const safeTheme = theme === "light" ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, safeTheme);

  STATE.prefs ||= {};
  STATE.prefs.theme = safeTheme;

  saveState();
  applyTheme(safeTheme);

  return safeTheme;
}

function toggleTheme() {
  const current = getTheme();
  return setTheme(current === "light" ? "dark" : "light");
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

/* ---------- checkout ---------- */
function isRealCheckoutConfigured() {
  return !!SALES.checkoutUrl &&
    SALES.checkoutUrl.startsWith("http") &&
    !/SEU-CHECKOUT-AQUI/i.test(SALES.checkoutUrl);
}

function getCheckoutStatus() {
  const url = String(SALES.checkoutUrl || "").trim();
  const hasUrl = !!url;
  const isHttp = /^https?:\/\//i.test(url);
  const isPlaceholder = !url || /SEU-CHECKOUT-AQUI/i.test(url);

  if (!hasUrl || isPlaceholder) {
    return {
      ready: false,
      mode: "placeholder",
      badge: "checkout em preparação",
      button: "checkout em preparação",
      message: "O pagamento ainda não foi conectado. Cadastre seus dados bancários na plataforma de checkout externa e cole aqui o link gerado."
    };
  }

  if (!isHttp) {
    return {
      ready: false,
      mode: "invalid",
      badge: "link inválido",
      button: "corrigir link do checkout",
      message: "O link do checkout precisa começar com http:// ou https://."
    };
  }

  return {
    ready: true,
    mode: "ready",
    badge: "checkout seguro",
    button: "ir para pagamento seguro",
    message: "Você será direcionado para uma página externa segura para concluir o pagamento."
  };
}

function checkoutDeveloperHint() {
  return [
    "Dados bancários: cadastre somente na plataforma de pagamento externa.",
    "No app.js, altere apenas SALES.checkoutUrl para o link real do checkout.",
    "Atualize também SALES.supportEmail, SALES.monthlyPrice e SALES.semiannualPrice quando necessário.",
    "Não coloque conta bancária, documento, Pix, endereço ou dados sensíveis dentro do app."
  ].join(" ");
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

/* ---------- catálogo inicial de frases ---------- */
/* ---------- catálogo inicial de frases ----------
   Fallback mínimo do app.js.

   O conteúdo principal agora deve vir do sensei-bank.js
   via window.NIHONGO321_SENSEI_BANK.

   Este bloco existe apenas para o app continuar funcionando caso:
   - sensei-bank.js não carregue;
   - o banco externo esteja incompleto;
   - o usuário abra o app offline com cache quebrado.
*/
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
      }
    ]
  }
];
/* ---------- ponte segura com sensei-bank.js ---------- */
function getExternalSenseiBank() {
  try {
    const bank = window.NIHONGO321_SENSEI_BANK;

    if (!bank || typeof bank !== "object") {
      return null;
    }

    return bank;
  } catch {
    return null;
  }
}

function normalizeExternalNewWords(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map(item => {
      if (!item || typeof item !== "object") return null;

      const jp = String(item.jp || item.word || item.term || "").trim();
      const pt = String(item.pt || item.meaning || item.translation || "").trim();

      if (!jp || !pt) return null;

      return { jp, pt };
    })
    .filter(Boolean);
}

function normalizeExternalPhrase(raw, topicId, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const jp = String(raw.jp || raw.japanese || raw.text || "").trim();
  const pt = String(raw.pt || raw.portuguese || raw.translation || "").trim();

  if (!jp || !pt) return null;

  const baseId = String(raw.id || "").trim();
  const safeId = baseId || `sensei_external_${topicId}_${index + 1}`;

  return {
    id: safeId,
    jp,
    pt,
    romaji: String(raw.romaji || "").trim(),
    kana: String(raw.kana || "").trim(),
    note: String(raw.note || raw.explanation || "").trim(),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    situation: String(raw.situation || "").trim(),
    isPremium: !!raw.isPremium,
    level: String(raw.level || raw.levelGroup || "").trim(),
    audioKey: String(raw.audioKey || "").trim(),
    newWords: normalizeExternalNewWords(raw.newWords || raw.words || raw.vocabulary)
  };
}

function normalizeExternalTopic(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const id = String(raw.id || raw.key || `sensei_topic_${index + 1}`).trim();
  const name = String(raw.name || raw.title || raw.label || `Tópico ${index + 1}`).trim();

  if (!id || !name) return null;

  const phrasesRaw = Array.isArray(raw.phrases)
    ? raw.phrases
    : Array.isArray(raw.items)
      ? raw.items
      : [];

  const phrases = phrasesRaw
    .map((phrase, phraseIndex) => normalizeExternalPhrase(phrase, id, phraseIndex))
    .filter(Boolean);

  return {
    id,
    name,
    color: raw.color || pickTopicColor(index),
    level: String(raw.level || raw.levelGroup || "").trim(),
    description: String(raw.description || raw.desc || raw.shortDescription || "").trim(),
    isPremium: !!raw.isPremium || raw.unlock === "premium",
    phrases
  };
}

function readExternalBankTopics() {
  const bank = getExternalSenseiBank();
  if (!bank) return [];

  const source = bank.topics;

  if (Array.isArray(source)) {
    return source
      .map((topic, index) => normalizeExternalTopic(topic, index))
      .filter(Boolean);
  }

  if (source && typeof source === "object") {
    return Object.entries(source)
      .map(([key, topic], index) => normalizeExternalTopic({ id: key, ...topic }, index))
      .filter(Boolean);
  }

  return [];
}

function mergeTopicSeedsWithExternalBank() {
  const legacySeeds = Array.isArray(TOPIC_SEEDS) ? TOPIC_SEEDS : [];
  const externalSeeds = readExternalBankTopics();

  if (!externalSeeds.length) {
    return legacySeeds;
  }

  const byId = new Map();

  for (const topic of legacySeeds) {
    if (!topic?.id) continue;

    byId.set(topic.id, {
      ...topic,
      phrases: Array.isArray(topic.phrases) ? [...topic.phrases] : []
    });
  }

  for (const topic of externalSeeds) {
    if (!topic?.id) continue;

    const existing = byId.get(topic.id);

    if (!existing) {
      byId.set(topic.id, {
        ...topic,
        phrases: Array.isArray(topic.phrases) ? [...topic.phrases] : []
      });
      continue;
    }

    existing.name = existing.name || topic.name;
    existing.color = existing.color || topic.color;

    const phraseIds = new Set((existing.phrases || []).map(p => p.id));

    for (const phrase of topic.phrases || []) {
      if (!phrase?.id) continue;
      if (phraseIds.has(phrase.id)) continue;

      existing.phrases.push(phrase);
      phraseIds.add(phrase.id);
    }
  }

  return Array.from(byId.values());
}
/* ---------- seed / state ---------- */

function cleanupOldSenseiBridgeImports(st) {
  if (!st || !st.bank) return st;

  st.bank.topics ||= [];
  st.bank.phrases ||= [];
  st.progress ||= {};
  st.favorites ||= { phraseIds: [] };
  st.favorites.phraseIds ||= [];
  st.session ||= {};

  const oldTopicIds = new Set(
    st.bank.topics
      .filter((topic) => topic?.source === "sensei-bank" || String(topic?.id || "").startsWith("sb_topic_"))
      .map((topic) => topic.id)
  );

  const oldPhraseIds = new Set(
    st.bank.phrases
      .filter((phrase) =>
        phrase?.source === "sensei-bank" ||
        String(phrase?.id || "").startsWith("sb_phrase_") ||
        oldTopicIds.has(phrase?.topicId)
      )
      .map((phrase) => phrase.id)
  );

  if (!oldTopicIds.size && !oldPhraseIds.size) return st;

  st.bank.topics = st.bank.topics.filter((topic) => !oldTopicIds.has(topic.id));
  st.bank.phrases = st.bank.phrases.filter((phrase) => !oldPhraseIds.has(phrase.id));

  for (const id of oldPhraseIds) {
    delete st.progress[id];
  }

  st.favorites.phraseIds = st.favorites.phraseIds.filter((id) => !oldPhraseIds.has(id));

  if (Array.isArray(st.session.queue)) {
    st.session.queue = st.session.queue.filter((id) => !oldPhraseIds.has(id));
  }

  if (oldPhraseIds.has(st.session.phraseId)) {
    st.session.phraseId = st.session.queue?.[0] || null;
    st.session.index = 0;
  }

  return st;
}

function ensureSeedCatalog(st) {
  const t = now();

  st.bank ||= {};
  st.bank.topics ||= [];
  st.bank.phrases ||= [];
  st.progress ||= {};

  cleanupOldSenseiBridgeImports(st);

  const existingTopics = st.bank.topics;
  const topicNameMap = new Map(existingTopics.map(topic => [String(topic.name || "").toLowerCase(), topic]));

  const mergedTopicSeeds = mergeTopicSeedsWithExternalBank();

  for (let i = 0; i < mergedTopicSeeds.length; i++) {
    const seedTopic = mergedTopicSeeds[i];

    if (seedTopic?.isPremium && typeof PREMIUM_TOPIC_IDS?.add === "function") {
      PREMIUM_TOPIC_IDS.add(seedTopic.id);
    }

    let topic = existingTopics.find(x => x.id === seedTopic.id) || topicNameMap.get(seedTopic.name.toLowerCase());

    if (!topic) {
      topic = {
        id: seedTopic.id,
        name: seedTopic.name,
        color: seedTopic.color || pickTopicColor(i),
        createdAt: t,
        updatedAt: t,
        level: seedTopic.level || "",
        description: seedTopic.description || "",
        isPremium: !!seedTopic.isPremium
      };
      existingTopics.push(topic);
      topicNameMap.set(topic.name.toLowerCase(), topic);
    } else {
      topic.name = topic.name || seedTopic.name;
      topic.color = topic.color || seedTopic.color || pickTopicColor(i);
      topic.level = topic.level || seedTopic.level || "";
      topic.description = topic.description || seedTopic.description || "";
      topic.isPremium = !!topic.isPremium || !!seedTopic.isPremium;
      topic.updatedAt ||= t;
      topic.createdAt ||= t;
      if (!topic.id) topic.id = seedTopic.id;
    }

    for (const phrase of seedTopic.phrases) {
      const already = st.bank.phrases.find(p => p.id === phrase.id);

      if (already) {
        already.topicId = topic.id;
        already.jp = already.jp || phrase.jp;
        already.pt = already.pt || phrase.pt;
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

function defaultState() {
  const t = now();
  const top = defaultTopic();

  const st = {
    app: { schemaVersion: 8.2, createdAt: t, updatedAt: t },

    prefs: {
      theme: getTheme(),
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

  st.app.schemaVersion = 8.2;

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

  st.prefs ||= {};
  st.prefs.theme = st.prefs.theme === "light" ? "light" : getTheme();
  st.prefs.audio ||= { enabled: true, volume: 0.35, unlocked: false };
  st.prefs.haptics ||= { enabled: true };

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

function buildQuickTrainingQueue(startPhraseId) {
  const accessible = (STATE.bank.phrases || []).filter(isPhraseAccessible);
  const ids = [];

  if (startPhraseId && accessible.some(p => p.id === startPhraseId)) {
    ids.push(startPhraseId);
  }

  const day = getPhraseOfDay();
  if (day && !ids.includes(day.id) && isPhraseAccessible(day)) {
    ids.push(day.id);
  }

  const favs = favoritePhrasesAccessible();
  for (const fav of favs) {
    if (ids.length >= 3) break;
    if (!ids.includes(fav.id)) ids.push(fav.id);
  }

  const essential = accessible.filter(p => p.topicId === "topic_essential_japan");
  for (const p of essential) {
    if (ids.length >= 3) break;
    if (!ids.includes(p.id)) ids.push(p.id);
  }

  for (const p of accessible) {
    if (ids.length >= 3) break;
    if (!ids.includes(p.id)) ids.push(p.id);
  }

  return ids.slice(0, 3);
}

function startQuickTraining() {
  const payload = getQuickTrainingPhrase();
  const p = payload.phrase;

  if (!p) {
    const fallback = startSituationTraining("essential");

    if (fallback && fallback.ok) {
      nav("#/105x");
      return {
        ok: true,
        fallback: true,
        message: "abrindo Pack Essencial"
      };
    }

    return {
      ok: false,
      reason: "empty",
      message: "adicione uma frase para começar"
    };
  }

  const quickQueue = buildQuickTrainingQueue(p.id);

  if (!quickQueue.length) {
    return {
      ok: false,
      reason: "empty",
      message: "não há frases disponíveis"
    };
  }

  STATE.session.inProgress = true;
  STATE.session.topicFilter = "ALL";
  STATE.session.queue = quickQueue;
  STATE.session.index = quickQueue.indexOf(p.id);
  if (STATE.session.index < 0) STATE.session.index = 0;
  STATE.session.phraseId = STATE.session.queue[STATE.session.index] || STATE.session.queue[0] || null;

  if (!STATE.session.phraseId) {
    saveState();
    return {
      ok: false,
      reason: "empty",
      message: "não há frase para treinar"
    };
  }

  resetCountForPhrase(STATE.session.phraseId);
  saveState();

  nav("#/105x");

  return {
    ok: true,
    fallback: false,
    message: "treino rápido iniciado"
  };
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
  } catch { }

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

  applyTheme(getTheme());
}

/* ---------- premium / admin / checkout ---------- */
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

function isSpecialTopicFilter(topicId) {
  return topicId === "ALL" || topicId === "FAV";
}

function safeTopicFilter(topicId, fallback = "topic_essential_japan") {
  const id = String(topicId || "ALL").trim() || "ALL";

  if (isSpecialTopicFilter(id)) return id;
  if (canAccessTopic(id)) return id;

  return fallback;
}

function topicOptionLockAttrs(topicId) {
  return isTopicPremium(topicId) && !isPremiumUnlocked()
    ? 'disabled aria-disabled="true" data-premium-locked="true"'
    : "";
}

function topicOptionLabel(topic) {
  const locked = isTopicPremium(topic?.id) && !isPremiumUnlocked();
  return `${locked ? "🔒 Premium • " : ""}${escapeHTML(topic?.name || "Tópico")}`;
}

function checkoutStatus() {
  const url = String(SALES.checkoutUrl || "").trim();
  const supportEmail = String(SALES.supportEmail || "").trim();

  const configured = isRealCheckoutConfigured();

  return {
    configured,
    url,
    supportEmail,
    label: configured ? "checkout externo pronto" : "checkout em preparação",
    badge: configured ? "pagamento seguro externo" : "configure antes de vender",
    buttonLabel: configured ? "abrir pagamento seguro" : "checkout em preparação",
    primaryLabel: configured ? "assinar Premium agora" : "checkout em preparação",
    monthlyLabel: configured ? `assinar mensal ${SALES.monthlyPrice}` : "checkout em preparação",
    semiannualLabel: configured ? `assinar semestral ${SALES.semiannualPrice}` : "checkout em preparação",
    footerLabel: configured ? "ativar Premium" : "checkout em preparação",
    shortText: configured
      ? "Pagamento em ambiente externo seguro. O app não coleta dados bancários."
      : "Checkout ainda não conectado. Troque SALES.checkoutUrl pelo link real antes da venda.",
    helpText: configured
      ? "O pagamento será aberto em uma página externa segura. Depois da confirmação, libere o Premium pelo fluxo definido no seu checkout."
      : "Antes de vender, cadastre seu produto em uma plataforma de pagamento e troque SALES.checkoutUrl pelo link real.",
    toast: configured
      ? "abrindo pagamento seguro"
      : "checkout em preparação. configure SALES.checkoutUrl"
  };
}

function checkoutButtonLabel(kind = "primary") {
  const status = checkoutStatus();

  if (!status.configured) {
    return "checkout em preparação";
  }

  if (kind === "monthly") return status.monthlyLabel;
  if (kind === "semiannual") return status.semiannualLabel;
  if (kind === "footer") return status.footerLabel;

  return status.primaryLabel;
}

function openCheckout() {
  const status = checkoutStatus();

  STATE.monetization ||= { premiumUnlocked: false, seenPaywall: false };
  STATE.monetization.seenPaywall = true;
  saveState();

  if (!status.configured) {
    toast("checkout em preparação");
    return false;
  }

  window.open(status.url, "_blank", "noopener,noreferrer");
  toast("abrindo pagamento seguro");
  return true;
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
    text: "O NIHONGO321 usa repetição guiada para treinar memória, ouvido e fala com japonês funcional."
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
    text: "Use favoritos para guardar frases que podem ajudar na sua rotina real no Japão."
  },
  {
    title: "Escolha uma situação",
    text: "Use Treinar por situação para entrar direto no contexto que você precisa hoje."
  },
  {
    title: "Use o Sensei IA Premium",
    text: "O Sensei IA cria material sob medida: situações reais, partículas, estruturas, palavras e expressões japonesas com exemplos para treinar."
  },
  {
    title: "Estude uma frase por dia",
    text: "Você pode pedir 7 exemplos de uma estrutura, como ので ou かどうか, e estudar uma frase por dia durante a semana."
  },
  {
    title: "Aprendizado autodidata",
    text: "Com o Premium, suas dúvidas viram tópicos treináveis. Você pede, salva no app e revisa no método NIHONGO321."
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

  if (route() !== "#/105x") {
    nav("#/105x");
  }
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

  if (route() === "#/105x") {
    const sheet = $("#cycleSheet");
    if (sheet) sheet.style.display = "none";

    render105xBodyOnly();
    renderPhraseListOnly();
    startStudyTimerIfOn105x();
  }
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
  } catch { }

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
    () => { }
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
    () => { }
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

function reviewSamePhrase() {
  unlockAudio();

  const id = STATE.session.phraseId;
  if (!id) return false;

  const p = getPhrase(id);
  if (!p) return false;

  STATE.session.inProgress = true;
  STATE.session.phraseId = id;

  const idx = STATE.session.queue.indexOf(id);
  if (idx >= 0) STATE.session.index = idx;

  resetCountForPhrase(id);
  saveState();

  const sheet = $("#cycleSheet");
  if (sheet) sheet.style.display = "none";

  render105xBodyOnly();
  renderPhraseListOnly();

  toast("mesma frase recarregada");
  beep("pop");

  return true;
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

  if (!el) return;

  const ms = getStudyMs();
  el.textContent = fmtHMSDays(ms);

  if (!fill) return;

  const goal = Math.max(
    5 * 60 * 1000,
    (STATE.goals?.dailyMinutes || DAILY_GOAL_DEFAULTS.minutes) * 60 * 1000
  );

  const pct = clamp(ms / goal, 0, 1);
  fill.style.transform = `scaleX(${pct})`;
}
/* ---------- render helpers ---------- */
function getParticleNotesFromPhrase(phrase) {
  const raw = String(phrase?.jp || "");
  if (!raw.trim()) return [];

  const plain = jpStripFurigana(raw)
    .replace(/[。、！？!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const particleMap = [
    { key: "は", label: "は", meaning: "marca o assunto principal da frase", hint: "Mostra sobre o que a frase está falando. Como partícula, lê-se “wa”." },
    { key: "が", label: "が", meaning: "marca quem faz, sente ou está em foco", hint: "Costuma apontar a informação importante da frase." },
    { key: "を", label: "を", meaning: "marca o alvo da ação", hint: "Use antes do verbo quando algo recebe a ação." },
    { key: "に", label: "に", meaning: "indica direção, lugar, horário, alvo ou pessoa envolvida", hint: "Muito usado para destino, tempo e para quem recebe uma ação." },
    { key: "で", label: "で", meaning: "indica local da ação, meio, ferramenta ou motivo", hint: "Ajuda a dizer onde, como ou por qual meio algo acontece." },
    { key: "へ", label: "へ", meaning: "indica direção", hint: "Como partícula, lê-se “e”. Mostra para onde a ação vai." },
    { key: "と", label: "と", meaning: "liga ideias como “e”, “com” ou citação", hint: "Pode juntar palavras ou indicar com quem você faz algo." },
    { key: "も", label: "も", meaning: "significa “também” ou reforça inclusão", hint: "Mostra que algo entra junto na ideia." },
    { key: "の", label: "の", meaning: "liga posse, relação ou explicação entre palavras", hint: "Pode funcionar como “de” em português." },
    { key: "から", label: "から", meaning: "indica origem, início ou motivo", hint: "Pode significar “de”, “a partir de” ou “porque”, dependendo da frase." },
    { key: "まで", label: "まで", meaning: "indica limite ou ponto final", hint: "Costuma ter sentido de “até”." },
    { key: "ので", label: "ので", meaning: "explica o motivo de forma natural e educada", hint: "Útil para justificar algo sem soar seco." },
    { key: "か", label: "か", meaning: "marca pergunta ou dúvida", hint: "No final da frase, transforma em pergunta." }
  ];

  return particleMap
    .filter(item => {
      const escaped = item.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[\\s　])${escaped}($|[\\s　])`).test(plain) ||
        new RegExp(`${escaped}(です|ます|ありません|ない|ください|ません|した|する|ですか|ますか)?$`).test(plain);
    })
    .slice(0, 5);
}

function renderTrainingExplanation(phrase) {
  if (!phrase || typeof phrase !== "object") return "";

  const words = Array.isArray(phrase.newWords) ? phrase.newWords : [];
  const particles = getParticleNotesFromPhrase(phrase);
  const cleanPt = String(phrase.pt || "").trim();

  const wordRows = words.length
    ? words.map((w, index) => {
      const raw = String(w?.jp || "").trim();
      const base = jpHasFurigana(raw) ? jpToInlineFurigana(raw) : jpStripFurigana(raw);
      const pt = String(w?.pt || "").trim();
      const type = explainWordType(raw);

      return `
        <div class="explainItem">
          <div class="explainItemTop">
            <span class="explainIndex">${index + 1}</span>
            <span class="explainJp">${escapeHTML(base)}</span>
          </div>
          <div class="explainPt">${escapeHTML(pt || "significado não informado")}</div>
          <div class="explainHint">${escapeHTML(type)} dentro desta frase.</div>
        </div>
      `;
    }).join("")
    : `
      <div class="explainEmpty">
        Esta frase ainda não tem vocabulário detalhado cadastrado. Mesmo assim, treine pelo sentido geral abaixo.
      </div>
    `;

  const particleRows = particles.length
    ? particles.map(p => `
      <div class="particleChip">
        <b>${escapeHTML(p.label)}</b>
        <span>${escapeHTML(p.meaning)}</span>
        <em>${escapeHTML(p.hint)}</em>
      </div>
    `).join("")
    : `
      <div class="explainEmpty">
        Nenhuma partícula principal foi detectada com segurança nesta frase.
      </div>
    `;

  return `
    <details class="sheet explanationSheet richDetails">
      <summary class="explainSummary">
        <div class="explainSummaryMain">
          <span class="explainIcon" aria-hidden="true">解</span>
          <div>
            <div class="explainKicker">guia rápido</div>
            <div class="explainTitle">Entender frase</div>
            <div class="explainPreview">${escapeHTML(cleanPt || "Toque para ver palavras, partículas e uso.")}</div>
          </div>
        </div>
        <span class="explainToggleText" aria-hidden="true">
          <span class="summaryOpen">ocultar</span>
          <span class="summaryClosed">detalhes</span>
        </span>
      </summary>

      <div class="explainBody" aria-label="detalhes da frase atual">
        <section class="explainBlock explainBlock--meaning">
          <div class="explainBlockTitle">Sentido geral</div>
          <p class="explainMeaning">${escapeHTML(cleanPt || "Tradução não informada.")}</p>
        </section>

        <section class="explainBlock">
          <div class="explainBlockTitle">Palavras da frase</div>
          <div class="explainList">
            ${wordRows}
          </div>
        </section>

        <section class="explainBlock">
          <div class="explainBlockTitle">Partículas e função</div>
          <div class="particleList">
            ${particleRows}
          </div>
        </section>

        <section class="explainBlock explainMiniGuide">
          <div class="explainBlockTitle">Como estudar agora</div>
          <ol>
            <li>Leia a frase inteira e entenda a ideia geral.</li>
            <li>Veja as palavras e partículas que montam o sentido.</li>
            <li>Ouça e repita imaginando a situação real no Japão.</li>
          </ol>
        </section>
      </div>
    </details>
  `;
}

function renderNewWords(list) {
  if (list && typeof list === "object" && !Array.isArray(list) && ("jp" in list || "pt" in list || "newWords" in list)) {
    return renderTrainingExplanation(list);
  }

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
  const filterAttr = opts.filter ? `data-filter="${escapeHTML(opts.filter)}"` : "";

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
        <button class="btn btn--ok btn--full" data-action="${escapeHTML(action)}" data-id="${escapeHTML(p.id)}" ${filterAttr}>
  ${escapeHTML(actionLabel)}
</button>
      ` : ""}
    </div>
  `;
}

function renderAppLogoBlock(extraClass = "") {
  return `
    <div class="appLogoBlock ${escapeHTML(extraClass)}" aria-label="logo NIHONGO321">
      <img src="${escapeHTML(BRAND.logoPath)}" alt="NIHONGO321" loading="lazy" />
    </div>
  `;
}

/* ---------- Bloco 4B: checklist interno de publicação ---------- */
const LAUNCH_CHECKLIST = [
  {
    id: "checkout",
    label: "Configurar checkout real em SALES.checkoutUrl",
    status: () => isRealCheckoutConfigured()
  },
  {
    id: "email",
    label: "Atualizar SALES.supportEmail",
    status: () => !/exemplo\.com/i.test(String(SALES.supportEmail || ""))
  },
  {
    id: "stores",
    label: "Atualizar links reais da Google Play e App Store",
    status: () =>
      !/^https:\/\/play\.google\.com\/store\/?$/i.test(String(SALES.playStoreUrl || "")) &&
      !/^https:\/\/apps\.apple\.com\/?$/i.test(String(SALES.appStoreUrl || ""))
  },
  {
    id: "prices",
    label: "Revisar preços finais do Premium",
    status: () => !!SALES.monthlyPrice && !!SALES.semiannualPrice
  },
  {
    id: "premium-copy",
    label: "Revisar textos da página Premium",
    status: () => false
  },
  {
    id: "routes",
    label: "Testar todas as rotas principais",
    status: () => false
  },
  {
    id: "quick",
    label: "Testar fluxo do treino rápido",
    status: () => false
  },
  {
    id: "situation",
    label: "Testar fluxo do treino por situação",
    status: () => false
  },
  {
    id: "favorites",
    label: "Testar favoritos",
    status: () => false
  },
  {
    id: "daily",
    label: "Testar frase do dia",
    status: () => false
  },
  {
    id: "backup",
    label: "Testar backup/exportação/importação",
    status: () => false
  },
  {
    id: "audio",
    label: "Testar áudio e vibração em Android + Chrome",
    status: () => false
  },
  {
    id: "small-phone",
    label: "Testar layout em celular pequeno",
    status: () => false
  },
  {
    id: "icon",
    label: "Criar ícone final do app",
    status: () => true
  },
  {
    id: "screenshots",
    label: "Criar screenshots para loja",
    status: () => false
  },
  {
    id: "store-desc",
    label: "Criar descrição curta e completa para Google Play",
    status: () => false
  },
  {
    id: "public-privacy",
    label: "Criar política de privacidade pública hospedada em URL",
    status: () => false
  },
  {
    id: "publish-format",
    label: "Decidir formato de publicação: PWA, WebView Android, Google Play ou App Store futuramente",
    status: () => false
  },
  {
    id: "real-users",
    label: "Fazer teste com usuários reais",
    status: () => false
  },
  {
    id: "bugs",
    label: "Corrigir bugs encontrados nos testes",
    status: () => false
  }
];

function launchChecklistSummary() {
  const rows = LAUNCH_CHECKLIST.map(item => ({
    ...item,
    done: !!item.status()
  }));

  const done = rows.filter(x => x.done).length;
  const total = rows.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return {
    rows,
    done,
    total,
    pct
  };
}

function renderLaunchChecklistBox(compact = false) {
  const sum = launchChecklistSummary();

  return `
    <section class="${compact ? "sheet stack" : "card stack"}" style="text-align:left">
      <div class="row row--between">
        <div class="badge">rumo aos 100%</div>
        <div class="badge">${sum.pct}%</div>
      </div>

      <div class="pWrap" aria-label="progresso de publicação">
        <div class="pBar"><div class="pFill" style="transform:scaleX(${sum.total ? sum.done / sum.total : 0})"></div></div>
        <div class="pTxt">${sum.done}/${sum.total}</div>
      </div>

      ${compact ? `
        <div class="small">
          Checklist interno para publicação e testes finais. Não aparece como fluxo principal do estudante.
        </div>
        <button class="btn btn--ghost btn--full" data-nav="#/launch-checklist">abrir checklist final</button>
      ` : ""}
    </section>
  `;
}

function renderLegalLinksBox(compact = false) {
  return `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">informações do app</div>
        <div class="badge">publicação</div>
      </div>

      ${compact ? "" : `
        <div class="small">
          Páginas simples para transparência, publicação inicial e confiança do usuário.
        </div>
      `}

      <div class="grid2">
        <button class="btn btn--ghost btn--full" data-nav="#/about">sobre o app</button>
        <button class="btn btn--ghost btn--full" data-nav="#/privacy">privacidade</button>
      </div>

      <button class="btn btn--muted btn--full" data-nav="#/terms">termos de uso</button>
    </div>
  `;
}

/* ---------- componentes comerciais ---------- */
function renderPlanCompareBox() {
  return `
    <section class="card stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">grátis x premium</div>
        <div class="badge">sem enrolação</div>
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
            <li>treino 105x;</li>
            <li>Pack Essencial Japão;</li>
            <li>treino rápido de 2 minutos;</li>
            <li>favoritos como revisão pessoal;</li>
            <li>frase do dia;</li>
            <li>revisão recomendada;</li>
            <li>treino por situação essencial;</li>
            <li>backup local.</li>
          </ul>
        </div>

        <div class="planCard premium">
          <div class="planTop">
            <h3 class="planName">Premium</h3>
            <span class="planTag">contexto real</span>
          </div>

          <div class="planPrice">${escapeHTML(SALES.monthlyPrice)} <small>/ mês</small></div>
          <p class="planSub">Para preparar seu japonês antes de situações específicas.</p>

          <ul class="planList">
            <li>tópicos específicos do Japão;</li>
            <li>trabalho, prefeitura, mercado e transporte;</li>
            <li>Sensei IA para criar frases do seu caso;</li>
            <li>gramática prática com exemplos treináveis;</li>
            <li>7 exemplos por tema para estudar 1 frase por dia;</li>
            <li>mais contexto antes de situações difíceis;</li>
            <li>revisões mais próximas da vida real.</li>
          </ul>

          <div class="planFooter">
            <button class="btn btn--ok btn--full" data-action="checkout">
              ${escapeHTML(checkoutButtonLabel("primary"))}
            </button>

            <button class="btn btn--ghost btn--full" data-nav="#/premium">
              ver detalhes do Premium
            </button>
          </div>
        </div>
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
        <p class="valueText">Contexto para situações que exigem calma e clareza.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">🏪</div>
        <h3 class="valueTitle">Mercado e konbini</h3>
        <p class="valueText">Treinos para compras, pagamento, atendimento e pedidos rápidos.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">文</div>
        <h3 class="valueTitle">Gramática prática</h3>
        <p class="valueText">Peça exemplos com ので, かどうか, ないといけない, やってみる e outras estruturas.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">7</div>
        <h3 class="valueTitle">7 exemplos por tema</h3>
        <p class="valueText">Estude uma frase por dia e transforme dúvida em rotina de treino.</p>
      </div>

      <div class="valueCard">
        <div class="valueIcon">🤖</div>
        <h3 class="valueTitle">Sensei IA Premium</h3>
        <p class="valueText">Crie material sob medida, salve como tópico e revise no método 105x.</p>
      </div>
    </div>
  `;
}

function renderPremiumTopicsBox() {
  const premiumTopics = (STATE.bank.topics || [])
    .filter(t => isTopicPremium(t.id))
    .map(t => {
      const count = topicPhraseIds(t.id).length;
      return `
        <div class="useCaseItem">
          <span class="useCaseIcon">🔒</span>
          <span>${escapeHTML(t.name)} • ${count} frases</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="sheet stack premiumUseCases" style="text-align:left">
      <div class="row row--between">
        <div class="badge">tópicos premium</div>
        <div class="badge">situações reais</div>
      </div>

      <div class="useCaseList">
        ${premiumTopics || `
          <div class="useCaseItem">
            <span class="useCaseIcon">🔒</span>
            <span>Novos tópicos premium serão adicionados aqui.</span>
          </div>
        `}
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
          <span>antes de falar com chefe ou líder na fábrica;</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">🏢</span>
          <span>antes de ir à prefeitura ou resolver documentos;</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">🏥</span>
          <span>quando precisa explicar uma situação específica;</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">文</span>
          <span>quando quer entender uma estrutura como ので, かどうか ou ないといけない;</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">🏠</span>
          <span>quando o conteúdo pronto não cobre seu problema real.</span>
        </div>
      </div>
    </div>
  `;
}

function renderPremiumActivationBox() {
  const status = checkoutStatus();

  return `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">como ativar o Premium</div>
        <div class="badge">${escapeHTML(status.label)}</div>
      </div>

      <div class="useCaseList">
        <div class="useCaseItem">
          <span class="useCaseIcon">1</span>
          <span>Toque no botão de pagamento Premium;</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">2</span>
          <span>O app abre uma página externa segura de checkout;</span>
        </div>
        <div class="useCaseItem">
          <span class="useCaseIcon">3</span>
          <span>Depois da confirmação, o Premium deve ser liberado conforme o fluxo definido pelo desenvolvedor.</span>
        </div>
      </div>

      <div class="small">${escapeHTML(status.helpText)}</div>

      ${!status.configured ? `
        <div class="sheet stack" style="text-align:left">
          <div class="badge">nota para o desenvolvedor</div>
          <div class="small">
            Não coloque dados bancários neste app. Cadastre sua conta bancária diretamente na plataforma de pagamento escolhida.
            Depois, troque apenas o valor de SALES.checkoutUrl pelo link público do checkout.
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderPaymentSafetyBox() {
  const status = checkoutStatus();

  return `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">pagamento seguro fora do app</div>
        <div class="badge">${status.configured ? "externo" : "em preparação"}</div>
      </div>

      <p class="small">
        O NIHONGO321 não coleta dados bancários dentro do app. O pagamento deve acontecer em uma plataforma externa de checkout.
      </p>

      <p class="small">
        Dados de cartão, conta bancária, konbini payment ou outros métodos devem ser cadastrados apenas no serviço de pagamento escolhido.
      </p>
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
          Quando você precisar de frases para chefe, prefeitura, moradia, transporte,
          uma dúvida gramatical ou um caso muito específico, o premium começa a fazer mais sentido.
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

/* ---------- cards da home ---------- */
function renderRetentionCard() {
  const streak = getStreakInfo();
  const nudge = getRetentionNudge();
  const resume = getResumePhrase();

  const resumeText = resume
    ? `${jpStripFurigana(resume.jp)} • ${resume.pt}`
    : "A próxima frase já está pronta para começar.";

  const action = resume ? "resumeTraining" : "startQuickTraining";
  const btnLabel = resume ? "continuar último treino" : "treinar 2 minutos agora";

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
          <p class="lockText">Treine uma frase hoje para o app sugerir melhor amanhã.</p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-action="startQuickTraining">iniciar treino rápido</button>
          <button class="btn btn--full" data-action="topicFilter" data-id="topic_essential_japan">Pack Essencial</button>
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
        <button class="btn btn--ok btn--full" data-action="startQuickTraining">${escapeHTML(reason.cta)}</button>
        <button class="btn btn--full" data-action="reviewPhrase" data-id="${escapeHTML(p.id)}">abrir frase</button>
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
        <p class="lockText">Vai enfrentar uma situação hoje? Treine frases úteis antes de sair.</p>
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
          Use esta frase quando estiver cansado ou sem saber por onde começar.
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
          Favoritos são frases que você não quer esquecer.
        </p>
      </div>

      ${list.length
      ? list.slice(0, 3).map(p => renderPhraseMiniCard(p, {
        title: "favorita",
        actionLabel: "revisar favorita",
        action: "reviewPhrase"
      })).join("")
      : `
            <div class="sheet stack" style="text-align:left">
              <div class="small">
                Salve frases importantes para montar sua revisão pessoal. Toque em ☆ durante o treino.
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
          Comece com ${essentialCount} frases essenciais, treino rápido, frase do dia, favoritos, revisão recomendada e meta leve.
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
          Um conjunto inicial para pedir ajuda, entender instruções, falar com calma e ganhar confiança.
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

/* ---------- páginas legais ---------- */
function renderAbout() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack" style="text-align:left">
        <div class="row row--between">
          <div class="badge">sobre o app</div>
          <button class="btn" data-nav="#/settings">voltar</button>
        </div>

        ${renderAppLogoBlock("aboutLogo")}

        <h1 class="h1">NIHONGO321</h1>

        <div class="lockCard">
          <h3 class="lockTitle">Japonês prático para brasileiros no Japão</h3>
          <p class="lockText">
            O NIHONGO321 é um aplicativo simples de repetição guiada de frases em japonês.
            Ele foi pensado para brasileiros e dekasseguis que vivem no Japão, trabalham muitas horas por dia
            e precisam de frases úteis para situações reais.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">proposta</div>
          <p class="small">
            O app não tenta substituir um curso completo de japonês. A ideia é ajudar você a ouvir,
            ler, repetir em voz alta e revisar frases práticas para o cotidiano.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">dados e pagamentos</div>
          <p class="small">
            O NIHONGO321 usa armazenamento local do navegador para guardar frases, progresso, favoritos,
            preferências e histórico de treino neste dispositivo.
          </p>
          <p class="small">
            Dados bancários não ficam no app. Se houver assinatura Premium, o pagamento deve acontecer em uma
            página externa segura de checkout.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="row row--between">
            <div class="badge">versão</div>
            <div class="badge">${escapeHTML(BRAND.version)}</div>
          </div>
          <div class="small">Atualização: ${escapeHTML(BRAND.updatedAt)}</div>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/home">ir para o app</button>
          <button class="btn btn--full" data-nav="#/privacy">ver privacidade</button>
        </div>
      </section>
    </div>
  `;
}

function renderPrivacy() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack" style="text-align:left">
        <div class="row row--between">
          <div class="badge">política de privacidade</div>
          <button class="btn" data-nav="#/settings">voltar</button>
        </div>

        <h1 class="h1">Política de privacidade</h1>

        <div class="lockCard">
          <h3 class="lockTitle">Resumo simples</h3>
          <p class="lockText">
            O NIHONGO321 foi criado para funcionar de forma leve. As principais informações do seu treino
            ficam salvas no próprio dispositivo, usando armazenamento local do navegador.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">1. Quais dados o app guarda</div>
          <p class="small">
            O app pode guardar localmente: frases cadastradas por você, progresso do treino, favoritos,
            ciclos concluídos, moedas internas, preferências de tema, som e vibração, meta diária, histórico do Sensei IA local
            e backup importado.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">2. Onde esses dados ficam</div>
          <p class="small">
            Esses dados ficam no armazenamento local do seu navegador ou WebView, no próprio aparelho.
            Eles não são enviados automaticamente para um servidor pelo código atual do app.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">3. Backup</div>
          <p class="small">
            A função de backup gera um arquivo JSON com seus dados do app. Guarde esse arquivo em local seguro.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">4. Pagamentos</div>
          <p class="small">
            Dados bancários, cartão, conta, konbini payment ou qualquer informação de pagamento não devem ser colocados
            dentro do app. O pagamento Premium, quando configurado, deve acontecer em uma plataforma externa segura.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/terms">ver termos</button>
          <button class="btn btn--full" data-nav="#/about">sobre o app</button>
        </div>
      </section>
    </div>
  `;
}

function renderTerms() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack" style="text-align:left">
        <div class="row row--between">
          <div class="badge">termos de uso</div>
          <button class="btn" data-nav="#/settings">voltar</button>
        </div>

        <h1 class="h1">Termos de uso</h1>

        <div class="lockCard">
          <h3 class="lockTitle">Uso simples e consciente</h3>
          <p class="lockText">
            Ao usar o NIHONGO321, você entende que o app é uma ferramenta de apoio ao estudo de frases práticas em japonês.
            Ele ajuda no treino, mas não garante fluência automática.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">1. Objetivo do app</div>
          <p class="small">
            O objetivo do NIHONGO321 é ajudar brasileiros no Japão a treinar frases úteis por repetição guiada,
            leitura, escuta e prática em voz alta.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">2. Responsabilidade do usuário</div>
          <p class="small">
            Use as frases como apoio. Em situações importantes, como hospital, documentos, contrato, imposto,
            trabalho ou emergência, confirme as informações com uma pessoa qualificada, intérprete, órgão oficial
            ou profissional responsável.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">3. Conteúdo cadastrado</div>
          <p class="small">
            Você é responsável pelas frases que cadastrar, importar ou gerar no app. Evite inserir dados sensíveis,
            documentos, senhas, informações bancárias ou dados de outras pessoas.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">4. Premium e checkout</div>
          <p class="small">
            Quando houver Premium, o pagamento deve acontecer fora do app, em uma plataforma externa segura.
            O NIHONGO321 não deve armazenar dados bancários no código, no localStorage, no HTML, no CSS ou no app.js.
          </p>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/home">aceitar e usar o app</button>
          <button class="btn btn--full" data-nav="#/privacy">ver privacidade</button>
        </div>
      </section>
    </div>
  `;
}

/* ---------- checklist final ---------- */
function renderLaunchChecklist() {
  const sum = launchChecklistSummary();
  const checkoutOk = isRealCheckoutConfigured();
  const supportOk = !!String(SALES.supportEmail || "").trim() && !String(SALES.supportEmail || "").includes("exemplo");
  const playOk = !!String(SALES.playStoreUrl || "").trim() && !String(SALES.playStoreUrl || "").includes("play.google.com/store");
  const appStoreOk = !!String(SALES.appStoreUrl || "").trim() && !String(SALES.appStoreUrl || "").includes("apps.apple.com");

  const coreDone = [
    "Treino 105x modo foco premium preservado",
    "Backup/compartilhamento aprovado na 8.5.38",
    "Responsividade celular/tablet/desktop trabalhada até 8.5.35",
    "Tela Premium aprimorada na 8.5.39",
    "Caracteres especiais liberados no cadastro",
    "Hero mobile em duas linhas aprovado"
  ];

  const publishTasks = [
    { label: "Testar app em celular Android + Chrome", done: true },
    { label: "Testar app em notebook/desktop", done: true },
    { label: "Testar backup por WhatsApp/LINE em celular real", done: true },
    { label: "Configurar link real do checkout externo", done: checkoutOk },
    { label: "Confirmar e-mail real de suporte", done: supportOk },
    { label: "Preparar ícone final do app", done: false },
    { label: "Preparar screenshots para loja", done: false },
    { label: "Preparar descrição curta e longa", done: false },
    { label: "Preparar política de privacidade pública", done: true },
    { label: "Preparar termos de uso públicos", done: true },
    { label: "Fazer teste final com usuários reais", done: false },
    { label: "Congelar versão candidata de publicação", done: false }
  ];

  const salesTasks = [
    { label: "Página Premium clara e vendável", done: true },
    { label: "Preço mensal definido", done: !!SALES.monthlyPrice },
    { label: "Preço semestral definido", done: !!SALES.semiannualPrice },
    { label: "Checkout externo real configurado", done: checkoutOk },
    { label: "Mensagem de suporte definida", done: supportOk },
    { label: "Oferta grátis x Premium revisada", done: true }
  ];

  const storeTasks = [
    { label: "Nome do app: NIHONGO321", done: true },
    { label: "Slogan: Japonês prático no Japão", done: true },
    { label: "Promessa principal definida", done: true },
    { label: "Banner hero pronto no caminho ./img/banner-hero-nihongo321.png", done: true },
    { label: "Link Google Play real", done: playOk },
    { label: "Link App Store real", done: appStoreOk },
    { label: "Screenshots mobile", done: false },
    { label: "Screenshots tablet/desktop", done: false }
  ];

  const finalTotal = publishTasks.length + salesTasks.length + storeTasks.length;
  const finalDone = [...publishTasks, ...salesTasks, ...storeTasks].filter(item => item.done).length;
  const finalPct = Math.round((finalDone / finalTotal) * 100);

  const checklistRows = (rows) => rows.map((item, index) => `
    <div class="launchItem ${item.done ? "launchItem--done" : ""}">
      <span class="launchIcon">${item.done ? "✓" : index + 1}</span>
      <span>${escapeHTML(item.label)}</span>
    </div>
  `).join("");

  APP.innerHTML = `
    <div class="stack launchPage">
      <section class="card stack launchHero">
        <div class="row row--between">
          <div class="badge">checklist de publicação</div>
          <button class="btn" data-nav="#/settings">voltar</button>
        </div>

        <div class="launchHeroGrid">
          <div>
            <h1 class="launchTitle">Rumo à primeira versão vendável do NIHONGO321.</h1>
            <p class="launchLead">
              Este painel é interno. Ele serve para guiar os últimos passos antes de testar com usuários reais, vender e publicar.
            </p>
          </div>

          <div class="launchScore">
            <div class="launchScoreValue">${finalPct}%</div>
            <div class="launchScoreText">${finalDone}/${finalTotal} itens prontos</div>
          </div>
        </div>

        <div class="pWrap" aria-label="progresso de publicação">
          <div class="pBar"><div class="pFill" style="transform:scaleX(${finalTotal ? finalDone / finalTotal : 0})"></div></div>
          <div class="pTxt">${finalDone}/${finalTotal}</div>
        </div>
      </section>

      <section class="card stack launchApproved">
        <div class="row row--between">
          <div class="badge">fases aprovadas</div>
          <div class="badge">não voltar sem motivo forte</div>
        </div>

        <div class="launchApprovedGrid">
          ${coreDone.map(item => `
            <div class="launchApprovedItem">
              <span>✓</span>
              <b>${escapeHTML(item)}</b>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div>
            <div class="badge">publicação</div>
            <h2 class="h2 launchSectionTitle">O que falta para colocar o app no mundo?</h2>
          </div>
          <div class="badge">${publishTasks.filter(x => x.done).length}/${publishTasks.length}</div>
        </div>

        <div class="launchList">
          ${checklistRows(publishTasks)}
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div>
            <div class="badge">venda</div>
            <h2 class="h2 launchSectionTitle">O que falta para vender com segurança?</h2>
          </div>
          <div class="badge">${salesTasks.filter(x => x.done).length}/${salesTasks.length}</div>
        </div>

        <div class="launchList">
          ${checklistRows(salesTasks)}
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div>
            <div class="badge">loja / apresentação</div>
            <h2 class="h2 launchSectionTitle">Materiais para Google Play, PWA ou WebView.</h2>
          </div>
          <div class="badge">${storeTasks.filter(x => x.done).length}/${storeTasks.length}</div>
        </div>

        <div class="launchList">
          ${checklistRows(storeTasks)}
        </div>
      </section>

      <section class="card stack launchSafety">
        <div class="row row--between">
          <div class="badge">segurança comercial</div>
          <div class="badge">não colocar no código</div>
        </div>

        <div class="launchSafetyGrid">
          <div class="launchSafetyItem launchSafetyItem--bad">
            <span>✕</span>
            <b>Dados bancários, cartão, documento, senha ou conta pessoal.</b>
          </div>
          <div class="launchSafetyItem launchSafetyItem--bad">
            <span>✕</span>
            <b>Links privados de pagamento ou informações sensíveis do vendedor.</b>
          </div>
          <div class="launchSafetyItem launchSafetyItem--ok">
            <span>✓</span>
            <b>Usar somente o link público externo em SALES.checkoutUrl.</b>
          </div>
          <div class="launchSafetyItem launchSafetyItem--ok">
            <span>✓</span>
            <b>Manter política, termos e suporte visíveis para confiança do usuário.</b>
          </div>
        </div>
      </section>

      <section class="card launchNextCard">
        <div class="launchNextCopy">
          <div class="badge">próxima ação depois daqui</div>
          <h2 class="h2">Preparar o pacote comercial da loja.</h2>
          <p class="p">
            Depois deste checklist, o próximo bloco recomendado é escrever a descrição da loja, textos de venda,
            screenshots necessários e versão candidata de teste.
          </p>
        </div>

        <div class="launchNextActions">
          <button class="primaryAction" data-nav="#/store-kit">abrir pacote comercial</button>
          <button class="btn btn--muted btn--full" data-nav="#/premium">revisar Premium</button>
        </div>
      </section>
    </div>
  `;
}

function renderStoreKit() {
  const shortDescription = "Japonês prático para brasileiros no Japão: treine frases úteis para trabalho, prefeitura, mercado, konbini e vida real.";

  const longDescription = `NIHONGO321 é um app de japonês prático feito para brasileiros que vivem no Japão e precisam aprender frases úteis para situações reais do cotidiano.

O foco não é estudar por horas nem decorar teoria difícil. O objetivo é treinar frases que ajudam na vida real: fábrica, prefeitura, correio, mercado, konbini, moradia, transporte, contas, atendimento e convivência no Japão.

Com o treino 105x, você escuta, lê, repete e fixa frases importantes no seu ritmo. O app também permite cadastrar frases próprias, favoritar conteúdos, revisar frases úteis e compartilhar pacotes de frases com outras pessoas.

Feito para quem trabalha muito, chega cansado e ainda quer aprender um pouco por dia.

Principais recursos:
• Treino 105x para repetição guiada;
• frases úteis em japonês e português;
• explicações com sentido geral, palavras e partículas;
• frases próprias;
• favoritos;
• backup e compartilhamento por WhatsApp/LINE;
• temas práticos da vida no Japão;
• visual leve para celular, tablet e computador;
• foco em brasileiros no Japão.

NIHONGO321: Japonês prático no Japão.`;

  const screenshotPlan = [
    "Tela inicial com banner do trabalhador indo para a fábrica",
    "Treino 105x com frase curta",
    "Treino 105x com frase longa em modo leitura",
    "Explicação da frase aberta",
    "Tela Premium com benefícios",
    "Backup / Compartilhar frases por WhatsApp e LINE",
    "Sensei IA",
    "Gerenciar frases próprias"
  ];

  const storeKeywords = [
    "japonês prático",
    "japonês no Japão",
    "dekassegui",
    "brasileiros no Japão",
    "frases japonesas",
    "aprender japonês",
    "nihongo",
    "japonês para trabalho",
    "japonês para fábrica",
    "japonês cotidiano"
  ];

  const releaseNotes = [
    "Primeira versão de testes do NIHONGO321.",
    "Treino 105x para frases úteis.",
    "Cadastro de frases próprias.",
    "Backup e compartilhamento por WhatsApp/LINE.",
    "Tela Premium e checklist de publicação."
  ];

  APP.innerHTML = `
    <div class="stack storeKitPage">
      <section class="card storeHero">
        <div class="row row--between">
          <div class="badge">pacote comercial da loja</div>
          <button class="btn" data-nav="#/launch-checklist">voltar</button>
        </div>

        <div class="storeHeroGrid">
          <div>
            <h1 class="storeTitle">Textos e materiais para vender o NIHONGO321.</h1>
            <p class="storeLead">
              Use esta página interna para preparar Google Play, PWA, WebView, página de venda, screenshots e testes finais.
            </p>
          </div>

          <div class="storeHeroCard">
            <span>🚀</span>
            <b>Próximo destino</b>
            <p>Transformar o app em uma oferta clara, confiável e pronta para teste com usuários reais.</p>
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="badge">descrição curta</div>
        <h2 class="h2 storeSectionTitle">Texto curto para Google Play ou página inicial.</h2>
        <div class="storeCopyBox">${escapeHTML(shortDescription)}</div>
      </section>

      <section class="card stack">
        <div class="badge">descrição longa</div>
        <h2 class="h2 storeSectionTitle">Texto principal da loja.</h2>
        <div class="storeCopyBox storeCopyBox--long">${escapeHTML(longDescription)}</div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div>
            <div class="badge">screenshots</div>
            <h2 class="h2 storeSectionTitle">Imagens que precisamos preparar para vender melhor.</h2>
          </div>
          <div class="badge">${screenshotPlan.length} telas</div>
        </div>

        <div class="storeGrid">
          ${screenshotPlan.map((item, index) => `
            <div class="storeShotItem">
              <span>${index + 1}</span>
              <b>${escapeHTML(item)}</b>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div>
            <div class="badge">palavras-chave</div>
            <h2 class="h2 storeSectionTitle">Termos comerciais e busca.</h2>
          </div>
          <div class="badge">SEO simples</div>
        </div>

        <div class="storeKeywordCloud">
          ${storeKeywords.map(word => `<span>${escapeHTML(word)}</span>`).join("")}
        </div>
      </section>

      <section class="card stack">
        <div class="badge">notas da versão</div>
        <h2 class="h2 storeSectionTitle">Texto inicial para versão de teste.</h2>

        <div class="storeList">
          ${releaseNotes.map(item => `
            <div class="storeListItem">
              <span>✓</span>
              <b>${escapeHTML(item)}</b>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card stack">
        <div class="badge">textos de venda rápida</div>
        <h2 class="h2 storeSectionTitle">Frases para WhatsApp, página de venda ou anúncio simples.</h2>

        <div class="storeSalesGrid">
          <div class="storeCopyBox">NIHONGO321 é um app para brasileiros no Japão treinarem frases úteis sem estudar por horas.</div>
          <div class="storeCopyBox">Feito para quem trabalha muito, chega cansado e precisa aprender japonês prático aos poucos.</div>
          <div class="storeCopyBox">Treine frases para fábrica, prefeitura, konbini, mercado, contas e vida real no Japão.</div>
        </div>
      </section>

      <section class="card storeNextCard">
        <div class="storeNextCopy">
          <div class="badge">próxima ação</div>
          <h2 class="h2">Agora precisamos criar os screenshots e a descrição visual da loja.</h2>
          <p class="p">
            O próximo bloco recomendado é definir o roteiro dos prints: quais telas capturar, que texto colocar em cada imagem e em qual ordem apresentar o app.
          </p>
        </div>

        <div class="storeNextActions">
          <button class="primaryAction" data-nav="#/launch-checklist">voltar ao checklist</button>
          <button class="btn btn--muted btn--full" data-nav="#/premium">revisar Premium</button>
        </div>
      </section>
    </div>
  `;
}


function renderLanding() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card heroCard stack heroCard--landing">
        <div class="badge heroBadgeCenter">${escapeHTML(BRAND.tagline)}</div>

        <div class="heroBannerSlot heroBannerSlot--ready" role="img" aria-label="Trabalhador dekassegui indo de bicicleta para a fábrica no amanhecer do Japão.">
          <img
            class="heroBannerImg"
            src="./img/banner-hero-nihongo321.png"
            alt="Trabalhador dekassegui indo de bicicleta para a fábrica no amanhecer do Japão."
            width="1200"
            height="520"
            loading="eager"
            decoding="async"
          />
          <div class="heroBannerShade" aria-hidden="true"></div>
        </div>

        <h1 class="heroTitle">
          Japonês útil para quem vive a rotina real do Japão.
        </h1>

        <p class="heroLead">
          Estude no seu ritmo, treine frases práticas e volte amanhã com mais confiança para viver melhor no Japão.
        </p>

        <div class="heroActions">
          <button class="bigBtn" data-nav="#/home">começar treino</button>
          <button class="btn btn--ghost btn--full" data-nav="#/premium">comparar planos</button>
        </div>

        <div class="heroMiniStats">
          <button class="statCard" type="button" data-action="startQuickTraining">
            <div class="statVal">2 min</div>
            <div class="statLbl">treino rápido para dias cansativos</div>
          </button>

          <button class="statCard" type="button" data-nav="#/105x">
            <div class="statVal">105x</div>
            <div class="statLbl">fixação guiada para criar memória</div>
          </button>

          <button class="statCard" type="button" data-nav="#/premium">
            <div class="statVal">Sensei IA</div>
            <div class="statLbl">premium para dúvidas, gramática e vida real</div>
          </button>
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
          <button class="valueCard" type="button" data-action="startQuickTraining">
            <div class="valueIcon">⚡</div>
            <h3 class="valueTitle">2 minutos possíveis</h3>
            <p class="valueText">Toque aqui para começar sem escolher nada.</p>
          </button>

          <button class="valueCard" type="button" data-nav="#/105x">
            <div class="valueIcon">🧠</div>
            <h3 class="valueTitle">Cria memória</h3>
            <p class="valueText">Abra o 105x e repita até a frase ficar familiar.</p>
          </button>

          <button class="valueCard" type="button" data-nav="#/home">
            <div class="valueIcon">🔁</div>
            <h3 class="valueTitle">Revisa por você</h3>
            <p class="valueText">Entre no início e siga a revisão recomendada.</p>
          </button>

          <button class="valueCard" type="button" data-nav="#/premium">
            <div class="valueIcon">文</div>
            <h3 class="valueTitle">Professor de bolso</h3>
            <p class="valueText">Veja como o Sensei IA transforma dúvidas em treino.</p>
          </button>
        </div>
      </section>

      ${renderPlanCompareBox()}

      <section class="ctaBand stack">
        <div class="badge">primeiro treino</div>
        <h2 class="h2">Abra o app, toque no treino rápido e mantenha o japonês vivo.</h2>
        <p class="p">A versão grátis já ajuda hoje. O premium aprofunda com mais situações reais, gramática prática e Sensei IA.</p>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-nav="#/home">entrar no app</button>
          <button class="btn btn--full" data-nav="#/premium">comparar planos</button>
        </div>

        <div class="storeGrid storeGrid--safe">
          <a class="storeBtn" href="${escapeHTML(SALES.playStoreUrl)}" target="_blank" rel="noopener noreferrer">
            <span class="storeGlyph">GP</span>
            <span>Google Play</span>
          </a>

          <a class="storeBtn" href="${escapeHTML(SALES.appStoreUrl)}" target="_blank" rel="noopener noreferrer">
            <span class="storeGlyph">iOS</span>
            <span>App Store</span>
          </a>
        </div>
      </section>

      ${renderLegalLinksBox(true)}
    </div>
  `;
}

/* ---------- premium ---------- */
function renderPremium() {
  const checkoutReady = isCheckoutReady();
  const monthly = SALES.monthlyPrice || "¥980";
  const semi = SALES.semiannualPrice || "¥4,980 / 6 meses";

  APP.innerHTML = `
    <div class="stack premiumPage">
      <section class="card premiumHeroV2">
        <div class="premiumHeroGrid">
          <div class="premiumHeroCopy">
            <div class="badge">NIHONGO321 Premium</div>
            <h1 class="premiumTitle">Japonês prático para viver melhor no Japão.</h1>
            <p class="premiumLead">
              Menos teoria, mais frases úteis para fábrica, prefeitura, correio, mercado, konbini, moradia e situações reais.
            </p>

            <div class="premiumPriceBox">
              <div>
                <div class="premiumPriceLabel">plano mensal</div>
                <div class="premiumPrice">${escapeHTML(monthly)}</div>
              </div>
              <div>
                <div class="premiumPriceLabel">plano econômico</div>
                <div class="premiumPrice premiumPrice--small">${escapeHTML(semi)}</div>
              </div>
            </div>

            <div class="premiumActions">
              <button class="primaryAction" data-action="checkout">assinar Premium</button>
              <button class="btn btn--muted btn--full" data-nav="#/105x">voltar ao treino</button>
            </div>

            <p class="premiumMicrocopy">
              Feito para brasileiros no Japão que trabalham muito, têm pouco tempo e precisam de frases para usar de verdade.
            </p>

            ${checkoutReady ? "" : `
              <div class="premiumNotice">
                Checkout ainda não configurado. Coloque seu link real em <strong>SALES.checkoutUrl</strong> antes de vender oficialmente.
              </div>
            `}
          </div>

          <div class="premiumHeroPanel">
            <div class="premiumMiniCard premiumMiniCard--gold">
              <span>☀️</span>
              <b>Estudo leve</b>
              <p>Treinos rápidos para quem chega cansado do trabalho.</p>
            </div>
            <div class="premiumMiniCard">
              <span>🏭</span>
              <b>Situações reais</b>
              <p>Frases para rotina no Japão, não exemplos soltos.</p>
            </div>
            <div class="premiumMiniCard">
              <span>🧭</span>
              <b>Direção clara</b>
              <p>Entenda sentido, palavras e partículas sem se perder.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="card stack premiumCompareCard">
        <div class="row row--between">
          <div>
            <div class="badge">grátis x premium</div>
            <h2 class="h2 premiumSectionTitle">O que muda quando você desbloqueia o Premium?</h2>
          </div>
        </div>

        <div class="premiumCompareGrid">
          <div class="premiumPlanBox">
            <div class="premiumPlanHead">
              <span>Grátis</span>
              <b>comece hoje</b>
            </div>
            <ul class="premiumList">
              <li>Pack Essencial Japão</li>
              <li>Treino 105x básico</li>
              <li>Frases próprias</li>
              <li>Favoritos</li>
              <li>Backup e compartilhamento</li>
            </ul>
          </div>

          <div class="premiumPlanBox premiumPlanBox--premium">
            <div class="premiumPlanHead">
              <span>Premium</span>
              <b>vida real no Japão</b>
            </div>
            <ul class="premiumList">
              <li>Temas avançados do cotidiano</li>
              <li>Fábrica, prefeitura, correio, konbini, mercado e mais</li>
              <li>Treino por situação real</li>
              <li>Explicações mais úteis para iniciantes</li>
              <li>Conteúdo em crescimento contínuo</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="card stack premiumValueCard">
        <div class="badge">por que vale a pena?</div>
        <h2 class="h2 premiumSectionTitle">O Premium economiza energia mental.</h2>

        <div class="premiumValueGrid">
          <div class="premiumValueItem">
            <b>Você não precisa estudar por horas</b>
            <p>O foco é repetir frases que resolvem situações reais.</p>
          </div>
          <div class="premiumValueItem">
            <b>Você entende a frase antes de repetir</b>
            <p>Sentido geral, palavras e partículas ficam mais claros.</p>
          </div>
          <div class="premiumValueItem">
            <b>Você treina para a vida no Japão</b>
            <p>Não é japonês genérico. É japonês para a rotina do dekassegui.</p>
          </div>
        </div>
      </section>

      <section class="card premiumCtaCard">
        <div class="premiumCtaCopy">
          <div class="badge">próximo passo</div>
          <h2 class="h2">Desbloqueie mais situações e continue treinando um pouco por dia.</h2>
          <p class="p">
            O objetivo não é virar estudante perfeito. É conseguir falar melhor, entender mais e se sentir menos perdido no Japão.
          </p>
        </div>
        <div class="premiumCtaActions">
          <button class="primaryAction" data-action="checkout">assinar Premium</button>
          <button class="btn btn--muted btn--full" data-nav="#/home">voltar para início</button>
        </div>
      </section>
    </div>
  `;
}
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
          <p class="lockText">Use esta tela apenas para validar o acesso premium antes da publicação.</p>
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
              <button class="btn btn--full" data-nav="#/launch-checklist">checklist final</button>
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

  const topicFilter = safeTopicFilter(STATE.session.topicFilter || "ALL");

  if (STATE.session.topicFilter !== topicFilter) {
    STATE.session.topicFilter = topicFilter;
    saveState();
  }

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
          Está cansado? Toque no treino rápido. Quer foco? Escolha uma situação real.
        </p>

        <button class="bigBtn" data-action="${resume ? "resumeTraining" : "startQuickTraining"}">
          ${resume ? "continuar último treino" : "treinar 2 minutos agora"}
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
    const lockedAttrs = topicOptionLockAttrs(t.id);
    return `<option value="${t.id}" ${lockedAttrs} ${t.id === topicFilter ? "selected" : ""}>${topicOptionLabel(t)}</option>`;
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

      ${renderQuickTrainingCard()}
      ${renderRetentionCard()}
      ${renderSituationTrainingCard()}
      ${renderSmartReviewCard()}
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
            Crie frases para chefe, fábrica, hospital, aluguel, viagem, mercado, partículas, gramática ou qualquer situação da sua vida no Japão.
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

      ${renderLaunchChecklistBox(true)}
      ${renderLegalLinksBox(true)}
    </div>
  `;

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

          <div class="pWrap">
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
      </section>
    </div>
  `;
}



function normalizeSenseiText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[「」『』"“”'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSenseiTerm(text) {
  const raw = String(text || "");
  const normalized = normalizeSenseiText(raw);

  const knownTerms = Object.keys(getActiveSenseiGrammarBank());
  for (const term of knownTerms) {
    if (raw.includes(term) || normalized.includes(term.toLowerCase())) return term;
  }

  const jpMatch = raw.match(/[\u3040-\u30FF\u4E00-\u9FFF]{2,12}/);
  if (jpMatch && /(uso|usar|frases com|frases que use|explique|ensine|estrutura|partícula|particula|palavra|expressão|expressao|gramática|gramatica)/i.test(raw)) {
    return jpMatch[0];
  }

  return "";
}

function detectSenseiRequestType(text) {
  const raw = String(text || "");
  const t = normalizeSenseiText(raw);
  const hasJP = /[\u3040-\u30FF\u4E00-\u9FFF]/.test(raw);
  const grammarWords = /(uso|usar|frases com|frases que use|explique|ensine|estrutura|partícula|particula|palavra|expressão|expressao|gramática|gramatica|termo japon[eê]s|como usar)/i;

  if (hasJP && grammarWords.test(raw)) return "grammar";
  if (grammarWords.test(raw)) return "grammar";
  return "scenario";
}

function detectSenseiScenario(text) {
  const t = normalizeSenseiText(text);

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

function buildSenseiTopicName(scenario, customTheme, requestType = "scenario", term = "") {
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

  if (requestType === "grammar" && term) return `Sensei IA • ${term}`;
  if (clean) return `Sensei IA • ${clean}`;

  return map[scenario] || "Sensei IA • Personalizado";
}

function buildSenseiCoachLine(goal, level, tone, pack = null) {
  const parts = [];

  if (pack?.explanation) parts.push(pack.explanation);
  if (pack?.goal) parts.push(pack.goal);

  if (goal) parts.push(`Pedido: ${goal}.`);
  if (level) parts.push(`Nível: ${level}.`);
  if (tone) parts.push(`Tom: ${tone}.`);

  parts.push("Material pensado para repetição, fala, revisão e uso imediato no Japão.");

  return parts.join(" ");
}

function cloneSenseiPhrase(base, scenario, customTheme, requestType = "scenario", term = "") {
  const topicName = buildSenseiTopicName(scenario, customTheme, requestType, term);

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

function buildFallbackGrammarPack(term, request, level, tone) {
  const safeTerm = String(term || "").trim() || "expressão";
  const title = `Uso de ${safeTerm}`;

  return {
    term: safeTerm,
    title,
    type: "palavra-alvo",
    explanation: `${safeTerm} foi detectado como termo de estudo. Como ainda não há um banco específico para ele, o Sensei IA preparou frases-modelo úteis para treino prático.`,
    goal: "Treine 1 frase por dia e ajuste o material depois com suas próprias frases.",
    phrases: [
      {
        jp: "この 表現{ひょうげん} の 使{つか}い方{かた} を 教{おし}えて ください。",
        pt: "Por favor, me ensine como usar esta expressão.",
        newWords: [
          { jp: "表現{ひょうげん}", pt: "expressão" },
          { jp: "使{つか}い方{かた}", pt: "modo de usar" }
        ]
      },
      {
        jp: "この 言葉{ことば} は どういう 意味{いみ} ですか。",
        pt: "O que esta palavra significa?",
        newWords: [
          { jp: "言葉{ことば}", pt: "palavra" },
          { jp: "意味{いみ}", pt: "significado" }
        ]
      },
      {
        jp: "例文{れいぶん} を 作{つく}って もらえますか。",
        pt: "Você poderia criar uma frase de exemplo?",
        newWords: [
          { jp: "例文{れいぶん}", pt: "frase de exemplo" },
          { jp: "作{つく}って", pt: "criar / fazer" }
        ]
      },
      {
        jp: "日常会話{にちじょうかいわ} で よく 使{つか}いますか。",
        pt: "Isso é muito usado na conversa do dia a dia?",
        newWords: [
          { jp: "日常会話{にちじょうかいわ}", pt: "conversa do dia a dia" },
          { jp: "使{つか}いますか", pt: "usa?" }
        ]
      },
      {
        jp: "もっと 自然{しぜん} な 言{い}い方{かた} は ありますか。",
        pt: "Existe uma forma mais natural de dizer?",
        newWords: [
          { jp: "自然{しぜん}", pt: "natural" },
          { jp: "言{い}い方{かた}", pt: "forma de dizer" }
        ]
      },
      {
        jp: "仕事{しごと} で 使{つか}える 例{れい} を 教{おし}えて ください。",
        pt: "Por favor, me ensine um exemplo que eu possa usar no trabalho.",
        newWords: [
          { jp: "仕事{しごと}", pt: "trabalho" },
          { jp: "例{れい}", pt: "exemplo" }
        ]
      },
      {
        jp: "この 表現{ひょうげん} を 使{つか}って 練習{れんしゅう} します。",
        pt: "Vou praticar usando esta expressão.",
        newWords: [
          { jp: "表現{ひょうげん}", pt: "expressão" },
          { jp: "練習{れんしゅう}", pt: "prática" }
        ]
      }
    ]
  };
}
/* ---------- ponte segura: bancos externos do Sensei IA ---------- */
function getExternalSenseiData() {
  try {
    const bank = window.NIHONGO321_SENSEI_BANK;

    if (!bank || typeof bank !== "object") {
      return null;
    }

    return bank;
  } catch {
    return null;
  }
}

function getExternalSenseiGrammarBank() {
  const bank = getExternalSenseiData();
  if (!bank) return null;

  const candidates = [
    bank.grammar,
    bank.grammarBank,
    bank.grammarPacks,
    bank.quickLessons?.grammar,
    bank.quickLessons,
    bank.lessons
  ];

  for (const item of candidates) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item;
    }
  }

  return null;
}

function getExternalSenseiScenarioBank() {
  const bank = getExternalSenseiData();
  if (!bank) return null;

  const candidates = [
    bank.scenarios,
    bank.scenarioBank,
    bank.situationPacks,
    bank.situations,
    bank.premiumPacks?.scenarios,
    bank.premiumPacks,
    bank.phrasePacks
  ];

  for (const item of candidates) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item;
    }
  }

  return null;
}

function getActiveSenseiGrammarBank() {
  return getExternalSenseiGrammarBank() || SENSEI_GRAMMAR_BANK || {};
}

function getActiveSenseiScenarioBank() {
  return getExternalSenseiScenarioBank() || SENSEI_SCENARIO_BANK || {};
}

function normalizeSenseiPackPhrases(pack, preferredLevel = "") {
  if (!pack || typeof pack !== "object") return [];

  function normalizeList(list) {
    if (!Array.isArray(list)) return [];

    return list
      .map(item => {
        if (!item || typeof item !== "object") return null;

        const jp = String(item.jp || item.japanese || "").trim();
        const pt = String(item.pt || item.portuguese || item.translation || "").trim();

        if (!jp || !pt) return null;

        return {
          jp,
          pt,
          newWords: normalizeExternalNewWords(item.newWords || item.words || item.vocabulary)
        };
      })
      .filter(Boolean);
  }

  const directList = Array.isArray(pack.phrases)
    ? pack.phrases
    : Array.isArray(pack.items)
      ? pack.items
      : Array.isArray(pack.examples)
        ? pack.examples
        : [];

  if (directList.length) {
    return normalizeList(directList);
  }

  if (pack.levels && typeof pack.levels === "object") {
    const levelKey = normalizeSenseiLevelKey(preferredLevel);

    const preferred = normalizeList(pack.levels[levelKey]);
    if (preferred.length) return preferred;

    const fallbackOrder = ["iniciante", "intermediario", "avancado"];

    for (const key of fallbackOrder) {
      const list = normalizeList(pack.levels[key]);
      if (list.length) return list;
    }

    for (const value of Object.values(pack.levels)) {
      const list = normalizeList(value);
      if (list.length) return list;
    }
  }

  return [];
}

function normalizeSenseiLevelKey(level) {
  const raw = String(level || "").toLowerCase().trim();

  if (/avancado|avançado|n2|n1|confiança|confianca/.test(raw)) return "avancado";
  if (/intermediario|intermediário|medio|médio|n4|n3|autonomia/.test(raw)) return "intermediario";

  return "iniciante";
}

function normalizeSenseiGrammarPack(pack, term = "", preferredLevel = "") {
  if (!pack || typeof pack !== "object") return null;

  const safeTerm = String(pack.term || pack.label || term || "").trim();
  const phrases = normalizeSenseiPackPhrases(pack, preferredLevel);

  if (!phrases.length) return null;

  return {
    term: safeTerm,
    title: String(pack.title || pack.label || `Uso de ${safeTerm}`).trim(),
    type: String(pack.type || pack.kind || "gramática").trim(),
    explanation: String(pack.explanation || pack.note || pack.usage || "").trim(),
    goal: String(pack.goal || "").trim(),
    phrases
  };
}

function normalizeSenseiScenarioPack(pack, preferredLevel = "") {
  if (Array.isArray(pack)) {
    return pack
      .map(item => {
        if (!item || typeof item !== "object") return null;

        const jp = String(item.jp || item.japanese || "").trim();
        const pt = String(item.pt || item.portuguese || item.translation || "").trim();

        if (!jp || !pt) return null;

        return {
          jp,
          pt,
          newWords: normalizeExternalNewWords(item.newWords || item.words || item.vocabulary)
        };
      })
      .filter(Boolean);
  }

  return normalizeSenseiPackPhrases(pack, preferredLevel);
}
function generateSenseiMaterial(payload) {
  const request = String(payload?.request || "").trim();
  const level = String(payload?.level || "").trim();
  const tone = String(payload?.tone || "").trim();
  const customTheme = String(payload?.theme || "").trim();

  const requestType = detectSenseiRequestType(`${request} ${customTheme}`);
  const term = detectSenseiTerm(`${request} ${customTheme}`);

  if (requestType === "grammar") {
    const activeGrammarBank = getActiveSenseiGrammarBank();
    const externalPack = normalizeSenseiGrammarPack(activeGrammarBank[term], term, level);
    const grammarPack = externalPack || SENSEI_GRAMMAR_BANK[term] || buildFallbackGrammarPack(term, request, level, tone);

    const selected = grammarPack.phrases.slice(0, 7).map((base) =>
      cloneSenseiPhrase(base, "grammar", customTheme, "grammar", grammarPack.term)
    );

    const coachLine = buildSenseiCoachLine(request, level, tone, grammarPack);

    return {
      scenario: "grammar",
      requestType: "grammar",
      term: grammarPack.term,
      title: grammarPack.title,
      explanation: grammarPack.explanation,
      goal: grammarPack.goal,
      topicName: buildSenseiTopicName("grammar", customTheme, "grammar", grammarPack.term),
      coachLine,
      phrases: selected
    };
  }

  const scenario = detectSenseiScenario(`${request} ${customTheme}`);
  const activeScenarioBank = getActiveSenseiScenarioBank();
  const externalScenario = normalizeSenseiScenarioPack(activeScenarioBank[scenario], level);
  const legacyScenario = SENSEI_SCENARIO_BANK[scenario] || SENSEI_SCENARIO_BANK.fabrica || [];
  const bank = externalScenario.length ? externalScenario : legacyScenario;

  const selected = bank.slice(0, 7).map((base) => cloneSenseiPhrase(base, scenario, customTheme));
  const coachLine = buildSenseiCoachLine(request, level, tone);

  return {
    scenario,
    requestType: "scenario",
    term: "",
    title: buildSenseiTopicName(scenario, customTheme),
    explanation: "Material criado a partir de uma situação real. Treine as frases que mais combinam com seu dia.",
    goal: "Escolha 1 frase hoje. Se tiver tempo, salve o pack e revise no 105x.",
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
    explanation: pack.explanation || "",
    goal: pack.goal || "",
    requestType: pack.requestType || "scenario",
    term: pack.term || "",
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
      ${item.explanation ? `<div class="small">${escapeHTML(item.explanation)}</div>` : ""}
      ${item.goal ? `<div class="small"><b>meta:</b> ${escapeHTML(item.goal)}</div>` : ""}
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
              O Sensei IA cria frases para situações reais e também ajuda com gramática prática,
              partículas, palavras e expressões japonesas.
            </p>
          </div>

          <div class="valueGrid">
            <div class="valueCard">
              <div class="valueIcon">🧩</div>
              <h3 class="valueTitle">Seu caso real</h3>
              <p class="valueText">Explique a situação e receba frases úteis para treinar.</p>
            </div>

            <div class="valueCard">
              <div class="valueIcon">文</div>
              <h3 class="valueTitle">Gramática prática</h3>
              <p class="valueText">Peça exemplos com ので, かどうか, ないといけない e outras estruturas.</p>
            </div>

            <div class="valueCard">
              <div class="valueIcon">7</div>
              <h3 class="valueTitle">7 exemplos</h3>
              <p class="valueText">Estude uma frase por dia durante a semana.</p>
            </div>

            <div class="valueCard">
              <div class="valueIcon">💾</div>
              <h3 class="valueTitle">Salva no app</h3>
              <p class="valueText">O material vira tópico para revisar depois.</p>
            </div>
          </div>

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-nav="#/premium">ver Premium</button>
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
          <h3 class="lockTitle">Seu professor prático de japonês</h3>
          <p class="lockText">
            Peça frases para uma situação real ou peça explicação de uma estrutura, partícula,
            palavra ou expressão japonesa. O Sensei cria material treinável para o 105x.
          </p>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="badge">exemplos de pedido</div>
          <div class="small">“Preciso de frases que expliquem bem o uso de ので.”</div>
          <div class="small">“Me ensine かどうか com frases comuns.”</div>
          <div class="small">“Preciso falar com meu chefe que não entendi a tarefa.”</div>
          <div class="small">“Crie frases para hospital em tom educado.”</div>
        </div>

        <div class="sheet stack" style="text-align:left">
          <div class="small">qual é a sua necessidade agora?</div>
          <textarea
            id="senseiRequest"
            class="btn"
            style="height:150px;width:100%;text-align:left;padding:12px;border-radius:18px;"
            placeholder="ex: preciso de frases que expliquem bem o uso de ので. Quero frases comuns no dia a dia, tom educado e nível intermediário."
          ></textarea>

          <div class="grid2">
            <div>
            <div class="small">nível</div>
            <select id="senseiLevel" class="btn selectBtn" style="width:100%">
              <option value="básico">básico — sobrevivência</option>
              <option value="intermediário">intermediário — autonomia</option>
              <option value="avançado">avançado — confiança</option>
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
            <div class="small">nome do tópico, opcional</div>
            <input
              id="senseiTheme"
              class="btn"
              style="height:56px;width:100%;text-align:left"
              placeholder="ex: uso de ので, chefe da fábrica, consulta médica"
            />
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

  const count = Array.isArray(pack.phrases) ? pack.phrases.length : 0;

  box.innerHTML = `
    <div class="sheet stack" style="text-align:left">
      <div class="row row--between">
        <div class="badge">${escapeHTML(pack.topicName)}</div>
        <div class="badge">${count} frases</div>
      </div>

      ${pack.explanation ? `<div class="small"><b>explicação:</b> ${escapeHTML(pack.explanation)}</div>` : ""}
      ${pack.goal ? `<div class="small"><b>meta leve:</b> ${escapeHTML(pack.goal)}</div>` : ""}
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
function ensureSessionFor105x() {
  ensurePhrasesHaveValidTopic();

  if (!STATE.session) STATE.session = {};
  STATE.session.topicFilter ||= "ALL";
  STATE.session.queue ||= [];

  if (!STATE.session.inProgress) {
    STATE.session.inProgress = true;
  }

  const current = STATE.session.phraseId ? getPhrase(STATE.session.phraseId) : null;

  if (!current || !canAccessTopic(current.topicId)) {
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;
    saveState();
    return;
  }

  if (!Array.isArray(STATE.session.queue) || !STATE.session.queue.length || !STATE.session.queue.includes(current.id)) {
    STATE.session.queue = buildQueue();

    if (!STATE.session.queue.includes(current.id)) {
      STATE.session.queue.unshift(current.id);
    }

    STATE.session.index = STATE.session.queue.indexOf(current.id);
    STATE.session.phraseId = current.id;
    saveState();
    return;
  }

  const idx = STATE.session.queue.indexOf(current.id);
  STATE.session.index = idx >= 0 ? idx : 0;
  STATE.session.phraseId = current.id;
  saveState();
}


function phraseTextStats(phrase) {
  const jp = jpStripFurigana(phrase?.jp || "").replace(/\s+/g, "");
  const pt = String(phrase?.pt || "").trim();

  return {
    jpLen: jp.length,
    ptLen: pt.length,
    total: jp.length + Math.round(pt.length * 0.48)
  };
}

function phraseDisplayMode(phrase) {
  const s = phraseTextStats(phrase);

  if (s.jpLen >= 78 || s.ptLen >= 170 || s.total >= 138) return "phraseModeXL";
  if (s.jpLen >= 42 || s.ptLen >= 92 || s.total >= 86) return "phraseModeLong";
  if (s.jpLen >= 26 || s.ptLen >= 58 || s.total >= 54) return "phraseModeMedium";

  return "phraseModeShort";
}

function applyPhraseDisplayMode(phrase) {
  const mode = phraseDisplayMode(phrase);
  const area = $(".phraseArea");
  const panel = $("#phraseTextPanel");

  for (const el of [area, panel]) {
    if (!el) continue;
    el.classList.remove("phraseModeShort", "phraseModeMedium", "phraseModeLong", "phraseModeXL");
    el.classList.add(mode);
  }
}

function render105x() {
  ensureSessionFor105x();

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

  const currentFilter = safeTopicFilter(STATE.session.topicFilter || "ALL");

  if (STATE.session.topicFilter !== currentFilter) {
    STATE.session.topicFilter = currentFilter;
    STATE.session.queue = buildQueue();
    STATE.session.index = 0;
    STATE.session.phraseId = STATE.session.queue[0] || null;
    saveState();
  }

  const currentPhrase = getPhrase(STATE.session.phraseId);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack" id="view105x">
        <div class="studyTopCompact" aria-label="controles compactos do treino">
          <div class="studyActions">
            <button class="miniBtn" title="skills" aria-label="skills" data-nav="#/skills">🏅</button>
            <button class="miniBtn" title="gerenciar frases" aria-label="gerenciar frases" data-nav="#/manage">✏️</button>
          </div>

          <div class="studyMetaCompact">
            <select class="btn selectBtn studyTopicCompact" id="topicFilterSel105x" aria-label="selecionar tema do treino">
              <option value="ALL">tudo</option>
              <option value="FAV" ${currentFilter === "FAV" ? "selected" : ""}>favoritas</option>
              ${(STATE.bank.topics || []).map(t => {
    const lockedAttrs = topicOptionLockAttrs(t.id);
    return `<option value="${t.id}" ${lockedAttrs} ${t.id === currentFilter ? "selected" : ""}>${topicOptionLabel(t)}</option>`;
  }).join("")}
            </select>

            <div class="studyMiniLine">
              <span class="studyTimeMini" aria-label="tempo estudado"><span class="ic">⏱</span> <span id="studyTime">00:00:00 (0d)</span></span>
              <button class="callChip" data-action="toggleCall" aria-label="alternar call and response">
                ${STATE.session.callMode ? "call on" : "call off"}
              </button>
            </div>
          </div>

          <button class="studyExitBtn" data-nav="#/home">sair</button>
        </div>

        <div class="phraseArea ${phraseDisplayMode(currentPhrase)}" aria-label="frase em treino">
          <div class="row row--between" id="phraseTopRow" style="gap:10px;align-items:center;">
            <div class="badge" id="phraseTopicBadge">${escapeHTML(topicName(currentPhrase?.topicId || ""))}</div>
            <span id="favoriteSlot">${renderFavoriteButton(STATE.session.phraseId)}</span>
          </div>

          <div class="phraseCounterDock">
            <div class="counterMini" id="counterBox" aria-label="contador">
              <div class="counterVal" id="countVal">-</div>
              <div class="counterSub" id="cycleSub">ciclo</div>
            </div>
          </div>

          <div class="phraseTextPanel ${phraseDisplayMode(currentPhrase)}" id="phraseTextPanel">
            <div class="kana" id="kanaLine"></div>
            <div class="pt" id="ptLine"></div>
          </div>
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

  applyPhraseDisplayMode(p);

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
  if (nw) nw.innerHTML = renderNewWords(p);

  if (sheet && sheet.style.display === "block" && count > 1) {
    sheet.style.display = "none";
  }
}

/* ---------- edit / manage / backup / settings ---------- */
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
      ${topics.map(t => {
        const lockedAttrs = topicOptionLockAttrs(t.id);
        return `<option value="${t.id}" ${lockedAttrs} ${t.id === sel && !lockedAttrs ? "selected" : ""}>${topicOptionLabel(t)}</option>`;
      }).join("")}
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

function renderManage() {
  ensurePhrasesHaveValidTopic();

  const def = ensureDefaultTopic();
  const topics = STATE.bank.topics || [];
  STATE.ui ||= {};
  STATE.ui.collapsedTopics ||= {};
  const collapsed = STATE.ui.collapsedTopics;

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
          <div class="badge">temas organizados</div>
          <button class="btn btn--ghost" data-nav="#/edit">nova frase</button>
        </div>

        <div class="small">Os tópicos começam fechados para manter a organização. Toque em um tema para abrir as frases.</div>

        <div class="list" id="manageTopics"></div>
      </section>
    </div>
  `;

  const root = $("#manageTopics");
  const frag = document.createDocumentFragment();

  for (const t of topics) {
    const list = byTopic.get(t.id) || [];
    const isCollapsed = collapsed[t.id] !== false;
    const canDeleteTopic = t.id !== def.id;
    const hasPhrases = list.length > 0;

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

    const wrap = document.createElement("div");
    wrap.className = "topicGroup";
    wrap.innerHTML = `${renderTopicHeader(t, list.length, isCollapsed)}${bodyHtml}`;
    frag.appendChild(wrap);
  }

  root.innerHTML = "";
  root.appendChild(frag);

  initReorderable();
}

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

function defaultProgressForImportedPhrase(importedProgress = null) {
  if (importedProgress && typeof importedProgress === "object") {
    return {
      status: importedProgress.status || "training",
      cycleStart: Number(importedProgress.cycleStart || 14),
      count: clamp(Number(importedProgress.count || 14), 1, 14),
      masteredAt: importedProgress.masteredAt || null,
      history: Array.isArray(importedProgress.history) ? importedProgress.history.slice(-80) : []
    };
  }

  return {
    status: "training",
    cycleStart: 14,
    count: 14,
    masteredAt: null,
    history: []
  };
}

function phraseSignature(p) {
  return `${jpStripFurigana(p?.jp || "").trim()}::${String(p?.pt || "").trim()}`.toLowerCase();
}

function safeImportedId(prefix, text, usedIds) {
  let base = `${prefix}_${hashString(text || now())}`;
  let id = base;
  let i = 2;

  while (usedIds.has(id)) {
    id = `${base}_${i}`;
    i += 1;
  }

  usedIds.add(id);
  return id;
}


function cloneCleanTopicForExport(topic) {
  return {
    id: String(topic?.id || "").trim(),
    name: String(topic?.name || "Tema").trim(),
    color: topic?.color || "tBlue",
    createdAt: Number(topic?.createdAt || now()),
    updatedAt: Number(topic?.updatedAt || now()),
    level: String(topic?.level || "").trim(),
    description: String(topic?.description || "").trim(),
    isPremium: !!topic?.isPremium
  };
}

function cloneCleanPhraseForExport(phrase) {
  return {
    id: String(phrase?.id || "").trim(),
    jp: String(phrase?.jp || "").trim(),
    pt: String(phrase?.pt || "").trim(),
    newWords: normalizeExternalNewWords(phrase?.newWords || []),
    topicId: String(phrase?.topicId || "topic_default").trim(),
    createdAt: Number(phrase?.createdAt || now()),
    updatedAt: Number(phrase?.updatedAt || now()),
    romaji: String(phrase?.romaji || "").trim(),
    kana: String(phrase?.kana || "").trim(),
    note: String(phrase?.note || "").trim(),
    tags: Array.isArray(phrase?.tags) ? phrase.tags : [],
    situation: String(phrase?.situation || "").trim(),
    level: String(phrase?.level || "").trim(),
    audioKey: String(phrase?.audioKey || "").trim()
  };
}

function normalizeImportBank(rawBank) {
  return {
    topics: Array.isArray(rawBank?.topics) ? rawBank.topics : [],
    phrases: Array.isArray(rawBank?.phrases) ? rawBank.phrases : []
  };
}

function createContentPackPayload() {
  ensurePhrasesHaveValidTopic();

  const phrases = (STATE.bank?.phrases || [])
    .filter(p => p?.jp && p?.pt)
    .map(cloneCleanPhraseForExport);

  const usedTopicIds = new Set(phrases.map(p => p.topicId));
  const topics = (STATE.bank?.topics || [])
    .filter(t => usedTopicIds.has(t.id))
    .map(cloneCleanTopicForExport);

  const progress = {};
  for (const phrase of phrases) {
    if (STATE.progress?.[phrase.id]) {
      progress[phrase.id] = defaultProgressForImportedPhrase(STATE.progress[phrase.id]);
    }
  }

  const exportedIds = new Set(phrases.map(p => p.id));
  const favorites = {
    phraseIds: (STATE.favorites?.phraseIds || []).filter(id => exportedIds.has(id))
  };

  return {
    schema: "nihongo321_content_pack_v2",
    exportKind: "incremental_content_pack",
    appName: BRAND.name,
    appVersion: BRAND.version,
    exportedAt: new Date().toISOString(),
    mergeMode: "add_or_merge_without_erasing_local_content",
    bank: { topics, phrases },
    progress,
    favorites,
    stats: {
      topics: topics.length,
      phrases: phrases.length,
      favorites: favorites.phraseIds.length
    }
  };
}

function encodeShareValue(value = "") {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .trim();
}

function decodeShareValue(value = "") {
  return String(value ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\\\\/g, "\\")
    .trim();
}

function createTextSharePack() {
  const payload = createContentPackPayload();
  const topics = payload.bank?.topics || [];
  const phrases = payload.bank?.phrases || [];
  const topicMap = new Map(topics.map(t => [t.id, t]));

  const lines = [
    "NIHONGO321_SHARE_V1",
    `APP: ${BRAND.name}`,
    `VERSAO: ${BRAND.version}`,
    `DATA: ${payload.exportedAt}`,
    `TOTAL_FRASES: ${phrases.length}`,
    "",
    "COMO USAR:",
    "1. Copie todo este texto.",
    "2. Abra o NIHONGO321.",
    "3. Vá em Gerenciar / Backup.",
    "4. Cole na área de importar.",
    "5. Toque em importar texto.",
    "Nada será apagado do app.",
    "",
    "INICIO_FRASES"
  ];

  for (const phrase of phrases) {
    const topic = topicMap.get(phrase.topicId);
    lines.push("");
    lines.push("[FRASE]");
    lines.push(`TEMA: ${encodeShareValue(topic?.name || "Frases compartilhadas")}`);
    lines.push(`JP: ${encodeShareValue(phrase.jp)}`);
    lines.push(`PT: ${encodeShareValue(phrase.pt)}`);

    if (Array.isArray(phrase.newWords) && phrase.newWords.length) {
      const words = phrase.newWords
        .map(w => `${encodeShareValue(w.jp)}=${encodeShareValue(w.pt)}`)
        .join(" | ");
      lines.push(`PALAVRAS: ${words}`);
    }

    if (phrase.note) lines.push(`NOTA: ${encodeShareValue(phrase.note)}`);
    if (phrase.level) lines.push(`NIVEL: ${encodeShareValue(phrase.level)}`);
  }

  lines.push("");
  lines.push("FIM_FRASES");
  lines.push("FIM_NIHONGO321_SHARE_V1");

  return {
    text: lines.join("\n"),
    payload,
    stats: payload.stats || { phrases: phrases.length, topics: topics.length }
  };
}

function parseTextSharePack(text) {
  const raw = String(text || "").trim();
  if (!raw.includes("NIHONGO321_SHARE_V1")) return null;

  const lines = raw.split(/\r?\n/);
  const topicsByName = new Map();
  const topics = [];
  const phrases = [];
  let current = null;

  function ensureTopic(name) {
    const safeName = normalizeName(name || "Frases compartilhadas") || "Frases compartilhadas";
    const key = safeName.toLowerCase();

    if (topicsByName.has(key)) return topicsByName.get(key);

    const topic = {
      id: `shared_topic_${hashString(safeName)}`,
      name: safeName,
      color: pickTopicColor(topics.length),
      createdAt: now(),
      updatedAt: now()
    };

    topics.push(topic);
    topicsByName.set(key, topic);
    return topic;
  }

  function commitCurrent() {
    if (!current) return;

    const topic = ensureTopic(current.topic);
    const jp = String(current.jp || "").trim();
    const pt = String(current.pt || "").trim();

    if (!jp || !pt) {
      current = null;
      return;
    }

    phrases.push({
      id: `shared_phrase_${hashString(`${jp}|${pt}|${phrases.length}`)}`,
      jp,
      pt,
      topicId: topic.id,
      newWords: current.newWords || [],
      note: current.note || "",
      level: current.level || "",
      createdAt: now(),
      updatedAt: now()
    });

    current = null;
  }

  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line) continue;

    if (line === "[FRASE]") {
      commitCurrent();
      current = { topic: "Frases compartilhadas", jp: "", pt: "", newWords: [] };
      continue;
    }

    if (!current) continue;

    if (line.startsWith("TEMA:")) current.topic = decodeShareValue(line.slice(5));
    if (line.startsWith("JP:")) current.jp = decodeShareValue(line.slice(3));
    if (line.startsWith("PT:")) current.pt = decodeShareValue(line.slice(3));

    if (line.startsWith("PALAVRAS:")) {
      const rawWords = line.slice(9).trim();
      current.newWords = rawWords
        .split("|")
        .map(part => {
          const [jp, ...ptParts] = part.split("=");
          const pt = ptParts.join("=");
          const cleanJp = decodeShareValue(jp || "");
          const cleanPt = decodeShareValue(pt || "");
          if (!cleanJp || !cleanPt) return null;
          return { jp: cleanJp, pt: cleanPt };
        })
        .filter(Boolean);
    }

    if (line.startsWith("NOTA:")) current.note = decodeShareValue(line.slice(5));
    if (line.startsWith("NIVEL:")) current.level = decodeShareValue(line.slice(6));
  }

  commitCurrent();

  if (!phrases.length) return null;

  return {
    bank: { topics, phrases },
    progress: {},
    favorites: { phraseIds: [] }
  };
}

function getImportPreview(importState) {
  const sourceBank = normalizeImportBank(importState?.bank || {});
  const localSignatures = new Set((STATE.bank?.phrases || []).map(phraseSignature));
  const topicNames = new Set();
  let newCount = 0;
  let repeatedCount = 0;
  let invalidCount = 0;

  for (const topic of sourceBank.topics || []) {
    const name = String(topic?.name || topic?.title || topic?.label || "").trim();
    if (name) topicNames.add(name);
  }

  for (const raw of sourceBank.phrases || []) {
    const phrase = normalizeImportedPhrase(raw, raw?.topicId || "topic_default");
    if (!phrase) {
      invalidCount += 1;
      continue;
    }

    if (localSignatures.has(phraseSignature(phrase))) repeatedCount += 1;
    else newCount += 1;
  }

  return { topics: topicNames.size, total: sourceBank.phrases?.length || 0, newCount, repeatedCount, invalidCount };
}

async function copyTextSafely(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch { }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "readonly");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return !!ok;
  } catch {
    return false;
  }
}

async function shareTextPackNative(text) {
  try {
    if (navigator.share) {
      await navigator.share({ title: "Pacote de frases NIHONGO321", text });
      return "shared";
    }
  } catch { }

  const copied = await copyTextSafely(text);
  return copied ? "copied" : "manual";
}

function normalizeImportedTopic(topic, index = 0) {
  if (!topic || typeof topic !== "object") return null;

  const id = String(topic.id || topic.key || "").trim();
  const name = normalizeName(topic.name || topic.title || topic.label || `Tópico importado ${index + 1}`);

  if (!name) return null;

  return {
    id: id || `imported_topic_${hashString(name)}`,
    name,
    color: topic.color || pickTopicColor(index),
    createdAt: Number(topic.createdAt || now()),
    updatedAt: Number(topic.updatedAt || now()),
    level: String(topic.level || topic.levelGroup || "").trim(),
    description: String(topic.description || topic.desc || "").trim(),
    isPremium: !!topic.isPremium
  };
}

function normalizeImportedPhrase(phrase, fallbackTopicId) {
  if (!phrase || typeof phrase !== "object") return null;

  const jp = String(phrase.jp || phrase.japanese || phrase.text || "").trim();
  const pt = String(phrase.pt || phrase.portuguese || phrase.translation || "").trim();

  if (!jp || !pt || !isValidJP(jp)) return null;

  return {
    id: String(phrase.id || "").trim(),
    jp,
    pt,
    newWords: normalizeExternalNewWords(phrase.newWords || phrase.words || phrase.vocabulary),
    topicId: String(phrase.topicId || fallbackTopicId || "topic_default").trim(),
    createdAt: Number(phrase.createdAt || now()),
    updatedAt: Number(phrase.updatedAt || now()),
    romaji: String(phrase.romaji || "").trim(),
    kana: String(phrase.kana || "").trim(),
    note: String(phrase.note || phrase.explanation || "").trim(),
    tags: Array.isArray(phrase.tags) ? phrase.tags : [],
    situation: String(phrase.situation || "").trim(),
    level: String(phrase.level || phrase.levelGroup || "").trim(),
    audioKey: String(phrase.audioKey || "").trim()
  };
}

function extractImportState(parsed) {
  if (!parsed || typeof parsed !== "object") return null;

  if (parsed.schema === "jp_105x_backup_v1" && parsed.state) {
    return parsed.state;
  }

  if (parsed.schema === "nihongo321_content_pack_v1" && parsed.bank) {
    return { bank: parsed.bank, progress: parsed.progress || {}, favorites: parsed.favorites || { phraseIds: [] } };
  }

  if (parsed.bank?.phrases || parsed.phrases) {
    return {
      bank: parsed.bank || { topics: parsed.topics || [], phrases: parsed.phrases || [] },
      progress: parsed.progress || {},
      favorites: parsed.favorites || { phraseIds: [] }
    };
  }

  return null;
}

function mergeImportedContent(importState) {
  const source = migrateToV7({
    app: { schemaVersion: 8.2, createdAt: now(), updatedAt: now() },
    bank: importState.bank || {},
    progress: importState.progress || {},
    favorites: importState.favorites || { phraseIds: [] },
    session: { topicFilter: "ALL" },
    prefs: { theme: getTheme() }
  });

  STATE = migrateToV7(STATE);

  const result = {
    topicsAdded: 0,
    topicsMerged: 0,
    phrasesAdded: 0,
    phrasesMerged: 0,
    phrasesSkipped: 0,
    favoritesImported: 0
  };

  const usedTopicIds = new Set(STATE.bank.topics.map(t => t.id));
  const topicMap = new Map();

  for (let i = 0; i < source.bank.topics.length; i++) {
    const importedTopic = normalizeImportedTopic(source.bank.topics[i], i);
    if (!importedTopic) continue;

    const sameId = STATE.bank.topics.find(t => t.id === importedTopic.id);
    const sameName = STATE.bank.topics.find(t => String(t.name || "").toLowerCase() === importedTopic.name.toLowerCase());
    const localTopic = sameId || sameName;

    if (localTopic) {
      localTopic.description ||= importedTopic.description;
      localTopic.level ||= importedTopic.level;
      localTopic.color ||= importedTopic.color;
      localTopic.updatedAt = now();
      topicMap.set(importedTopic.id, localTopic.id);
      result.topicsMerged += 1;
      continue;
    }

    let newId = importedTopic.id;
    if (usedTopicIds.has(newId)) {
      newId = safeImportedId("shared_topic", importedTopic.name, usedTopicIds);
    } else {
      usedTopicIds.add(newId);
    }

    STATE.bank.topics.push({ ...importedTopic, id: newId, createdAt: now(), updatedAt: now() });
    topicMap.set(importedTopic.id, newId);
    result.topicsAdded += 1;
  }

  const defaultLocalTopic = STATE.bank.topics.find(t => t.id === "topic_essential_japan") || STATE.bank.topics[0] || defaultTopic();
  if (!STATE.bank.topics.length) STATE.bank.topics.push(defaultLocalTopic);

  const usedPhraseIds = new Set(STATE.bank.phrases.map(p => p.id));
  const bySignature = new Map(STATE.bank.phrases.map(p => [phraseSignature(p), p]));
  const importedPhraseIdToLocal = new Map();

  for (let i = 0; i < source.bank.phrases.length; i++) {
    const raw = source.bank.phrases[i];
    const localTopicId = topicMap.get(String(raw?.topicId || "")) || defaultLocalTopic.id;
    const imported = normalizeImportedPhrase(raw, localTopicId);

    if (!imported) {
      result.phrasesSkipped += 1;
      continue;
    }

    imported.topicId = topicMap.get(imported.topicId) || localTopicId;

    const sig = phraseSignature(imported);
    const sameContent = bySignature.get(sig);

    if (sameContent) {
      sameContent.newWords = Array.isArray(sameContent.newWords) && sameContent.newWords.length
        ? sameContent.newWords
        : imported.newWords;
      sameContent.note ||= imported.note;
      sameContent.romaji ||= imported.romaji;
      sameContent.kana ||= imported.kana;
      sameContent.situation ||= imported.situation;
      sameContent.level ||= imported.level;
      sameContent.tags = Array.from(new Set([...(sameContent.tags || []), ...(imported.tags || [])]));
      sameContent.updatedAt = now();
      importedPhraseIdToLocal.set(raw.id, sameContent.id);
      result.phrasesMerged += 1;
      continue;
    }

    let newId = imported.id || safeImportedId("shared_phrase", sig, usedPhraseIds);
    if (usedPhraseIds.has(newId)) {
      newId = safeImportedId("shared_phrase", sig, usedPhraseIds);
    } else {
      usedPhraseIds.add(newId);
    }

    const newPhrase = { ...imported, id: newId, createdAt: now(), updatedAt: now() };
    STATE.bank.phrases.push(newPhrase);
    bySignature.set(sig, newPhrase);
    importedPhraseIdToLocal.set(raw.id, newId);

    STATE.progress[newId] = defaultProgressForImportedPhrase(source.progress?.[raw.id] || source.progress?.[imported.id]);
    result.phrasesAdded += 1;
  }

  const favoriteIds = source.favorites?.phraseIds || [];
  const favSet = favoriteSet();

  for (const importedFavId of favoriteIds) {
    const localId = importedPhraseIdToLocal.get(importedFavId);
    if (!localId || favSet.has(localId)) continue;
    favSet.add(localId);
    result.favoritesImported += 1;
  }

  STATE.favorites.phraseIds = Array.from(favSet).filter(id => STATE.bank.phrases.some(p => p.id === id));
  STATE.session.topicFilter = "ALL";
  STATE.session.queue = [];
  STATE.session.index = 0;
  STATE.session.phraseId = null;

  saveState();
  applyTheme(getTheme());
  refreshHUD();

  return result;
}

function validateAndLoadBackup(input, msgEl) {
  let importState = null;

  if (typeof input === "string") {
    const raw = input.trim();

    if (!raw) {
      if (msgEl) msgEl.textContent = "cole ou selecione um pacote antes de importar.";
      toast("pacote vazio");
      beep("tuk");
      return false;
    }

    importState = parseTextSharePack(raw);

    if (!importState) {
      const parsed = safeJSONParse(raw);
      importState = extractImportState(parsed);
    }
  } else {
    importState = extractImportState(input);
  }

  if (!importState) {
    if (msgEl) msgEl.textContent = "pacote inválido. Cole o texto completo do NIHONGO321 ou importe o arquivo correto.";
    toast("pacote inválido");
    beep("tuk");
    return false;
  }

  importState.bank = normalizeImportBank(importState.bank || {});

  if (!importState.bank?.phrases || !Array.isArray(importState.bank.phrases) || !importState.bank.phrases.length) {
    if (msgEl) msgEl.textContent = "pacote sem frases para importar.";
    toast("sem frases no pacote");
    beep("tuk");
    return false;
  }

  const preview = getImportPreview(importState);
  const result = mergeImportedContent(importState);
  const summary = `prévia: ${preview.newCount} nova(s), ${preview.repeatedCount} repetida(s). importado: ${result.phrasesAdded} nova(s), ${result.phrasesMerged} mesclada(s). Nada foi apagado.`;

  if (msgEl) msgEl.textContent = summary;
  toast("conteúdo importado sem apagar o seu");
  beep("ding");
  nav("#/home");

  return true;
}
function renderBackup() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">backup seguro</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack backupShareCard">
          <div class="badge">compartilhar frases</div>
          <div class="grid2">
            <button class="btn btn--ok btn--full" type="button" data-backup-action="shareTextPack" data-action="shareTextPack" onclick="window.NIHONGO321_BACKUP_ACTION && window.NIHONGO321_BACKUP_ACTION('shareTextPack')">WhatsApp / LINE</button>
            <button class="btn btn--ok btn--full" type="button" data-backup-action="exportCopy" data-action="exportCopy" onclick="window.NIHONGO321_BACKUP_ACTION && window.NIHONGO321_BACKUP_ACTION('exportCopy')">copiar texto</button>
            <button class="btn btn--full" type="button" data-backup-action="exportTxtFile" data-action="exportTxtFile" onclick="window.NIHONGO321_BACKUP_ACTION && window.NIHONGO321_BACKUP_ACTION('exportTxtFile')">baixar .txt</button>
            <button class="btn btn--muted btn--full" type="button" data-backup-action="exportFile" data-action="exportFile" onclick="window.NIHONGO321_BACKUP_ACTION && window.NIHONGO321_BACKUP_ACTION('exportFile')">baixar .json</button>
          </div>
          <div class="small">Use WhatsApp/LINE ou copie o texto do pacote. Ao importar no celular de outra pessoa, as frases entram como acréscimo e nada é apagado.</div>
        </div>

        <details class="sheet backupTutorial">
          <summary>Como usar o Backup / Compartilhar frases</summary>
          <div class="backupTutorialBody">
            <div class="backupStep"><b>1.</b> Toque em <strong>WhatsApp / LINE</strong> para abrir o compartilhamento do celular.</div>
            <div class="backupStep"><b>2.</b> Envie o texto inteiro para seu amigo ou para você mesmo.</div>
            <div class="backupStep"><b>3.</b> No outro aparelho, copie o texto recebido.</div>
            <div class="backupStep"><b>4.</b> Cole na área <strong>importar</strong> e toque em <strong>importar</strong>.</div>
            <div class="backupStep"><b>5.</b> O app adiciona as frases novas sem apagar as antigas.</div>
            <div class="small">Dica: o arquivo .txt é melhor para WhatsApp/LINE. O .json fica como opção avançada.</div>
          </div>
        </details>

        <div class="sheet stack">
          <div class="badge">importar sem apagar</div>

          <div class="grid2">
            <button class="btn btn--muted btn--full" data-action="importText">importar texto</button>
            <button class="btn btn--muted btn--full" data-action="importFile">importar arquivo</button>
          </div>

          <input id="fileImport" type="file" accept=".txt,.json,text/plain,application/json" style="display:none" />

          <div class="small">cole aqui o pacote recebido por WhatsApp/LINE ou o conteúdo do arquivo. O conteúdo será mesclado com segurança.</div>
          <textarea id="importBox" class="btn" style="height:160px;width:100%;text-align:left;padding:12px;border-radius:18px;"></textarea>
          <div class="small" id="backupMsg"></div>
        </div>
      </section>
    </div>
  `;
}

function renderSettings() {
  const currentTheme = getTheme();
  const lightActive = currentTheme === "light";
  const soundOn = STATE.prefs.audio.enabled;
  const vibeOn = STATE.prefs.haptics.enabled;

  APP.innerHTML = `
    <div class="stack settingsPage">
      <section class="card stack settingsHero">
        <div class="row row--between">
          <div class="badge">ajustes</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="settingsIntro">
          <h1 class="settingsTitle">Ajustes simples para estudar sem distração.</h1>
          <p class="settingsLead">
            Aqui ficam só os controles essenciais. O restante fica recolhido para não poluir sua tela.
          </p>
        </div>

        <div class="settingsQuickGrid">
          <button class="settingsToggleCard" type="button" data-action="toggleTheme">
            <span>${lightActive ? "☀️" : "🌙"}</span>
            <b>${lightActive ? "Dia Vivo" : "Noite Foco"}</b>
            <small>trocar tema</small>
          </button>

          <button class="settingsToggleCard" type="button" data-action="toggleSound">
            <span>${soundOn ? "🔊" : "🔇"}</span>
            <b>${soundOn ? "Som ligado" : "Som desligado"}</b>
            <small>feedback leve</small>
          </button>

          <button class="settingsToggleCard" type="button" data-action="toggleVibe">
            <span>${vibeOn ? "📳" : "📴"}</span>
            <b>${vibeOn ? "Vibração ligada" : "Vibração desligada"}</b>
            <small>toque tátil</small>
          </button>
        </div>
      </section>

      <details class="card settingsDetails" open>
        <summary>
          <span>Estudo diário</span>
          <b>${STATE.goals.dailyMinutes} min • ${STATE.goals.dailyCycles} ciclo</b>
        </summary>

        <div class="settingsDetailsBody">
          <div class="settingsRangeBox">
            <div class="settingsRangeHead">
              <span>volume do som</span>
              <b>${Math.round((STATE.prefs.audio.volume ?? 0.35) * 100)}%</b>
            </div>
            <input id="vol" type="range" min="0" max="1" step="0.05" value="${STATE.prefs.audio.volume ?? 0.35}" />
            <p class="small">O som é discreto e só toca depois do primeiro toque.</p>
          </div>

          <div class="settingsRangeBox">
            <div class="settingsRangeHead">
              <span>minutos por dia</span>
              <b id="goalMinLbl">${STATE.goals.dailyMinutes} min</b>
            </div>
            <input id="goalMin" type="range" min="3" max="15" step="1" value="${STATE.goals.dailyMinutes}" />
          </div>

          <div class="settingsRangeBox">
            <div class="settingsRangeHead">
              <span>ciclos por dia</span>
              <b id="goalCyclesLbl">${STATE.goals.dailyCycles} ciclo(s)</b>
            </div>
            <input id="goalCycles" type="range" min="1" max="5" step="1" value="${STATE.goals.dailyCycles}" />
          </div>
        </div>
      </details>

      <details class="card settingsDetails">
        <summary>
          <span>Informações do app</span>
          <b>privacidade • termos • publicação</b>
        </summary>

        <div class="settingsDetailsBody">
          <div class="settingsMiniGrid">
            <button class="btn btn--ghost btn--full" data-nav="#/about">sobre</button>
            <button class="btn btn--ghost btn--full" data-nav="#/privacy">privacidade</button>
            <button class="btn btn--ghost btn--full" data-nav="#/terms">termos</button>
            <button class="btn btn--ghost btn--full" data-nav="#/launch-checklist">checklist</button>
          </div>
          <button class="btn btn--muted btn--full" data-nav="#/store-kit">pacote comercial</button>
        </div>
      </details>

      <details class="card settingsDetails">
        <summary>
          <span>Ajuda e plano</span>
          <b>tutorial • premium</b>
        </summary>

        <div class="settingsDetailsBody">
          <div class="settingsMiniGrid">
            <button class="btn btn--ghost btn--full" data-nav="#/tutorial">tutorial</button>
            <button class="btn btn--ghost btn--full" data-nav="#/premium">premium</button>
          </div>
        </div>
      </details>

      <details class="card settingsDetails settingsDetails--danger">
        <summary>
          <span>Avançado</span>
          <b>usar com cuidado</b>
        </summary>

        <div class="settingsDetailsBody">
          <button class="btn btn--muted btn--full" data-nav="#/admin">área admin</button>
          <button class="btn btn--bad btn--full" data-action="reset">resetar tudo</button>
          <p class="small">
            Resetar apaga frases, progresso, favoritos e ajustes deste aparelho.
          </p>
        </div>
      </details>
    </div>
  `;
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
    if (hasStudyActivity(d)) activeDays++;
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

  return {
    keys,
    totalMs,
    totalMin: totalMs / 60000,
    activeDays,
    cycles,
    listens,
    calls,
    last7MinPerDay: last7Ms / 60000 / 7,
    last30MinPerDay: last30Ms / 60000 / 30
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
  applyTheme(getTheme());

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
  if (r === "#/about") return renderAbout();
  if (r === "#/privacy") return renderPrivacy();
  if (r === "#/terms") return renderTerms();
  if (r === "#/launch-checklist") return renderLaunchChecklist();
  if (r === "#/store-kit") return renderStoreKit();

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

    try { beep("pop"); } catch { }
    try { vibrate([8]); } catch { }
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

/* ---------- NIHONGO321 backup capture listener 8.5.38 ---------- */
try {
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-backup-action]");
    if (!btn) return;

    const actionName = btn.dataset.backupAction;
    if (!actionName) return;

    event.preventDefault();
    event.stopPropagation();

    if (window.NIHONGO321_BACKUP_ACTION) {
      window.NIHONGO321_BACKUP_ACTION(actionName);
    }
  }, true);
} catch { }

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.nav) {
    nav(btn.dataset.nav);
    return;
  }

  const act = btn.dataset.action;

  if (act === "shareTextPack" || act === "exportCopy" || act === "exportTxtFile" || act === "exportFile") {
    unlockAudio();
    handleBackupButtonAction(act);
    return;
  }

  if (act === "toggleTheme" || btn.id === "hudTheme") {
    unlockAudio();

    const next = toggleTheme();
    toast(next === "light" ? "modo claro ativado ☀️" : "modo escuro ativado 🌙");
    beep("ding");
    render();

    return;
  }

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

      if (route() === "#/105x") {
        render();
        startStudyTimerIfOn105x();
      }

      return;
    }

    toast(result?.message || "não consegui iniciar o treino rápido");
    beep("tuk");
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

    if (result && result.ok) {
      toast(`Treino iniciado: ${result.label}`);
      beep("ding");

      if (route() === "#/105x") {
        render();
        startStudyTimerIfOn105x();
      } else {
        nav("#/105x");
      }

      return;
    }

    if (result && result.reason === "empty_favorites") {
      toast("salve favoritas para criar esse treino");
      beep("tuk");
      return;
    }

    toast(result?.message || "não consegui iniciar este treino");
    beep("tuk");

    return;
  }

  if (act === "reviewPhrase" || act === "trainPhrase") {
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
    STATE.session.topicFilter = "ALL";
    STATE.session.queue = buildQueue();

    if (!STATE.session.queue.includes(id)) {
      STATE.session.queue.unshift(id);
    }

    STATE.session.index = STATE.session.queue.indexOf(id);
    STATE.session.phraseId = id;

    resetCountForPhrase(id);
    saveState();

    toast(act === "reviewPhrase" ? "revisão carregada" : "frase carregada");
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

    const msg = pack.requestType === "grammar"
      ? `${pack.phrases.length} exemplos gerados`
      : "material gerado";

    toast(msg);
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

  if (act === "reviewSame" || act === "repeatSame") {
    const ok = reviewSamePhrase();
    if (!ok) {
      toast("não consegui revisar esta frase");
      beep("tuk");
    }
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

    STATE.ui ||= {};
    STATE.ui.collapsedTopics ||= {};

    const currentlyCollapsed = STATE.ui.collapsedTopics[id] !== false;
    STATE.ui.collapsedTopics[id] = currentlyCollapsed ? false : true;

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

    if (STATE.session.callMode) callAndResponse(p.jp, rate, kanaEl, () => { });
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

  if (act === "shareTextPack" || act === "exportCopy" || act === "exportTxtFile" || act === "exportFile") {
    const msg = $("#backupMsg");
    const box = $("#importBox");
    const pack = createTextSharePack();
    const textPack = pack.text;
    const jsonPayload = createContentPackPayload();
    const jsonText = JSON.stringify(jsonPayload, null, 2);

    if (act === "shareTextPack") {
      shareTextPackNative(textPack).then(status => {
        if (status === "shared") {
          if (msg) msg.textContent = `compartilhamento aberto: ${pack.stats.phrases} frase(s).`;
          toast("compartilhamento aberto");
          beep("ding");
          return;
        }

        if (status === "copied") {
          if (msg) msg.textContent = "o navegador não abriu WhatsApp/LINE, então copiei o pacote. Agora cole no WhatsApp ou LINE.";
          toast("pacote copiado");
          beep("ding");
          return;
        }

        if (box) {
          box.value = textPack;
          box.focus();
          box.select();
        }

        if (msg) msg.textContent = "não deu para abrir nem copiar. O pacote ficou na caixa: selecione tudo e envie pelo WhatsApp/LINE.";
        toast("copie manualmente");
        beep("tuk");
      });

      return;
    }

    if (act === "exportCopy") {
      copyTextSafely(textPack).then(ok => {
        if (ok) {
          if (msg) msg.textContent = `texto copiado: ${pack.stats.phrases} frase(s).`;
          toast("texto do pacote copiado");
          beep("ding");
          return;
        }

        if (box) {
          box.value = textPack;
          box.focus();
          box.select();
        }

        if (msg) msg.textContent = "não deu para copiar. O pacote foi colocado na caixa para copiar manualmente.";
        toast("copie manualmente");
        beep("tuk");
      });

      return;
    }

    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    if (act === "exportTxtFile") {
      downloadTextFile(`nihongo321-pacote-whatsapp-line-${y}-${m}-${dd}.txt`, textPack, "text/plain");
      if (msg) msg.textContent = `arquivo .txt baixado: ${pack.stats.phrases} frase(s).`;
      toast("pacote .txt baixado");
      beep("ding");
      return;
    }

    downloadTextFile(`nihongo321-pacote-frases-${y}-${m}-${dd}.json`, jsonText);

    if (msg) msg.textContent = `pacote .json baixado: ${jsonPayload.stats.phrases} frase(s).`;
    toast("pacote .json baixado");
    beep("ding");

    return;
  }

  if (act === "importText") {
    const box = $("#importBox");
    const msg = $("#backupMsg");
    const raw = (box?.value || "").trim();

    if (!raw) {
      if (msg) msg.textContent = "cole o pacote recebido primeiro.";
      toast("sem pacote");
      beep("tuk");
      return;
    }

    validateAndLoadBackup(raw, msg);

    return;
  }

  if (act === "importFile") {
    const input = $("#fileImport");
    if (!input) return;

    input.value = "";
    input.click();

    return;
  }

  if (act === "toggleSound" || btn.id === "hudSound") {
    unlockAudio();

    STATE.prefs.audio.enabled = !STATE.prefs.audio.enabled;
    saveState();

    refreshHUD();
    toast(STATE.prefs.audio.enabled ? "som ligado" : "som desligado");
    render();

    return;
  }

  if (act === "toggleVibe" || btn.id === "hudVibe") {
    unlockAudio();

    STATE.prefs.haptics.enabled = !STATE.prefs.haptics.enabled;
    saveState();

    refreshHUD();
    toast(STATE.prefs.haptics.enabled ? "vibração ligada" : "vibração desligada");
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
    applyTheme(getTheme());

    toast("app resetado");
    beep("ding");
    nav("#/landing");

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

  try { item.setPointerCapture(e.pointerId); } catch { }

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

  try { DRAG.item.classList.remove("dragging"); } catch { }

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
      validateAndLoadBackup(text, msg);
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

  applyTheme(getTheme());
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

/* =========================================================
   NIHONGO321 v8.4.8
   PATCH BLOCO 5.8 — SENSEI IA EXPERT ENGINE 2.0
   - melhora respostas independentes do Sensei IA local
   - amplia detecção de pedidos
   - cria fallback mais inteligente
   - sempre tenta gerar material completo com 7 frases
   - mantém HTML/CSS/JS puro
   - não altera TOPIC_SEEDS
   - não altera checkout
   - não altera estrutura do localStorage
   ========================================================= */

(function patchSenseiExpertEngine58() {
  "use strict";

  const PATCH_ID = "nihongo321_patch_sensei_expert_engine_58";

  if (window[PATCH_ID]) {
    return;
  }

  window[PATCH_ID] = true;

  /* ---------- helpers seguros ---------- */
  function sxNow() {
    try {
      if (typeof now === "function") return now();
    } catch { }

    return Date.now();
  }

  function sxUid(prefix = "sx") {
    try {
      if (typeof uid === "function") return uid(prefix);
    } catch { }

    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function sxEscape(value) {
    try {
      if (typeof escapeHTML === "function") return escapeHTML(value);
    } catch { }

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function sxNormalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[「」『』"“”'’`´]/g, " ")
      .replace(/[、。,.!?！？;；:：()\[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function sxRaw(text) {
    return String(text || "").trim();
  }

  function sxStripFurigana(value) {
    try {
      if (typeof jpStripFurigana === "function") return jpStripFurigana(value);
    } catch { }

    return String(value || "").replace(/([^{}\s]+)\{([^{}]+)\}/g, "$1");
  }

  function sxPick(list, index = 0) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.abs(index) % list.length];
  }

  function sxHasJapanese(text) {
    return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(String(text || ""));
  }

  function sxExtractJapaneseTerms(text) {
    const raw = String(text || "");
    const matches = raw.match(/[\u3040-\u30FF\u4E00-\u9FFFー々〆〤]{1,18}/g) || [];

    return Array.from(new Set(
      matches
        .map(x => x.trim())
        .filter(x => x.length >= 1)
        .filter(x => !/^[。、！？ー]+$/.test(x))
    ));
  }

  function sxLevelLabel(level) {
    const n = sxNormalize(level);

    if (/intermediario|medio|n4|n3/.test(n)) return "intermediário";
    if (/avancado|n2|n1/.test(n)) return "avançado";
    if (/basico|iniciante|n5/.test(n)) return "iniciante";

    return level || "iniciante";
  }

  function sxToneLabel(tone) {
    const n = sxNormalize(tone);

    if (/educado|formal|polido|respeitoso/.test(n)) return "educado";
    if (/simples|facil|facil/.test(n)) return "muito simples";
    if (/trabalho|chefe|empresa|fabrica/.test(n)) return "trabalho";
    if (/natural|casual/.test(n)) return "natural";

    return tone || "educado";
  }

  function sxWords(list) {
    return Array.isArray(list) ? list : [];
  }

  function sxPhrase(jp, pt, newWords = []) {
    return {
      id: sxUid("sensei"),
      jp,
      pt,
      newWords: sxWords(newWords),
      createdAt: sxNow(),
      updatedAt: sxNow()
    };
  }

  function sxEnsureSeven(phrases, fallbackFactory) {
    const clean = Array.isArray(phrases) ? phrases.filter(p => p && p.jp && p.pt) : [];
    let guard = 0;

    while (clean.length < 7 && guard < 20) {
      const generated = fallbackFactory(clean.length, guard);
      if (generated && generated.jp && generated.pt) clean.push(generated);
      guard++;
    }

    return clean.slice(0, 7);
  }

  function sxFormatTopicName(label) {
    const safe = String(label || "").trim();
    if (!safe) return "Sensei IA • Material prático";
    if (/^sensei ia/i.test(safe)) return safe;
    return `Sensei IA • ${safe}`;
  }

  function sxGetOriginalGenerator() {
    try {
      if (typeof generateSenseiMaterial === "function") return generateSenseiMaterial;
    } catch { }

    return null;
  }

  function sxGetOriginalRenderOutput() {
    try {
      if (typeof renderSenseiOutput === "function") return renderSenseiOutput;
    } catch { }

    return null;
  }

  const sxOriginalGenerateSenseiMaterial = sxGetOriginalGenerator();
  const sxOriginalRenderSenseiOutput = sxGetOriginalRenderOutput();

  /* ---------- dicionário de intenções ---------- */
  const SENSEI_58_INTENT_PATTERNS = {
    grammar: [
      "gramatica",
      "gramática",
      "particula",
      "partícula",
      "estrutura",
      "uso de",
      "como usar",
      "me ensine",
      "ensine",
      "explique",
      "explica",
      "frases com",
      "frase com",
      "exemplos com",
      "exemplo com",
      "termo",
      "expressao",
      "expressão",
      "palavra",
      "significa",
      "significado",
      "diferença",
      "diferenca",
      "quando usar"
    ],

    scenario: [
      "preciso falar",
      "quero falar",
      "como digo",
      "como eu digo",
      "situacao",
      "situação",
      "caso",
      "problema",
      "chefe",
      "lider",
      "líder",
      "fabrica",
      "fábrica",
      "hospital",
      "prefeitura",
      "mercado",
      "konbini",
      "correio",
      "bicicleta",
      "aluguel",
      "apartamento",
      "moradia",
      "trem",
      "onibus",
      "ônibus",
      "estacao",
      "estação",
      "trabalho",
      "documento",
      "loja",
      "banco",
      "dentista",
      "escola",
      "telefone",
      "internet"
    ],

    requestForMany: [
      "7 frases",
      "sete frases",
      "12 frases",
      "doze frases",
      "13 frases",
      "treze frases",
      "variações",
      "variacoes",
      "exemplos",
      "lista"
    ]
  };

  function sxIncludesAny(normalizedText, patterns) {
    return patterns.some(p => normalizedText.includes(sxNormalize(p)));
  }

  function sxDetectIntent(request, theme = "") {
    const raw = `${request || ""} ${theme || ""}`;
    const n = sxNormalize(raw);
    const hasJP = sxHasJapanese(raw);

    const grammarScore =
      (sxIncludesAny(n, SENSEI_58_INTENT_PATTERNS.grammar) ? 3 : 0) +
      (hasJP ? 2 : 0);

    const scenarioScore =
      (sxIncludesAny(n, SENSEI_58_INTENT_PATTERNS.scenario) ? 3 : 0) +
      (/preciso|quero|poderia|conseguir|perguntar|pedir|avisar/.test(n) ? 1 : 0);

    if (grammarScore >= scenarioScore && grammarScore >= 2) return "grammar";
    if (scenarioScore >= 2) return "scenario";

    if (hasJP) return "grammar";

    return "scenario";
  }
  /* ---------- banco ampliado de gramática / estruturas ---------- */
  const SENSEI_58_GRAMMAR_BANK = {
    "ので": {
      label: "Uso de ので",
      kind: "gramática",
      explanation:
        "ので liga uma causa a uma consequência. Soa natural, educado e é muito usado quando você quer explicar o motivo de algo sem parecer seco.",
      usage:
        "Use quando quiser dizer “porque”, “por causa de” ou “como”. É ótimo para trabalho, prefeitura, hospital e atrasos.",
      phrases: [
        sxPhrase(
          "今日{きょう} は 体調{たいちょう} が 悪{わる}い ので、早{はや}く 帰{かえ}っても いいですか。",
          "Como hoje estou me sentindo mal, posso ir embora mais cedo?",
          [
            { jp: "体調{たいちょう}", pt: "condição física" },
            { jp: "悪{わる}い", pt: "ruim" },
            { jp: "早{はや}く", pt: "cedo" }
          ]
        ),
        sxPhrase(
          "電車{でんしゃ} が 遅{おく}れて いる ので、少{すこ}し 遅{おく}れます。",
          "Como o trem está atrasado, vou me atrasar um pouco.",
          [
            { jp: "電車{でんしゃ}", pt: "trem" },
            { jp: "遅{おく}れて いる", pt: "está atrasado" },
            { jp: "少{すこ}し", pt: "um pouco" }
          ]
        ),
        sxPhrase(
          "日本語{にほんご} が まだ 苦手{にがて} なので、ゆっくり 話{はな}して ください。",
          "Como ainda tenho dificuldade com japonês, por favor fale devagar.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "苦手{にがて}", pt: "dificuldade / não ser bom em algo" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        ),
        sxPhrase(
          "明日{あした} は 仕事{しごと} なので、今日{きょう} は 早{はや}く 寝{ね}ます。",
          "Como amanhã tenho trabalho, hoje vou dormir cedo.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "寝{ね}ます", pt: "vou dormir" }
          ]
        ),
        sxPhrase(
          "雨{あめ} が 降{ふ}って いる ので、自転車{じてんしゃ} では 行{い}きません。",
          "Como está chovendo, não vou de bicicleta.",
          [
            { jp: "雨{あめ}", pt: "chuva" },
            { jp: "降{ふ}って いる", pt: "está chovendo" },
            { jp: "自転車{じてんしゃ}", pt: "bicicleta" }
          ]
        ),
        sxPhrase(
          "この 書類{しょるい} が わからない ので、教{おし}えて いただけますか。",
          "Como eu não entendo este documento, o senhor poderia me explicar?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" },
            { jp: "いただけますか", pt: "poderia fazer para mim? / forma educada" }
          ]
        ),
        sxPhrase(
          "時間{じかん} が ない ので、あと で 連絡{れんらく} します。",
          "Como não tenho tempo, entro em contato depois.",
          [
            { jp: "時間{じかん}", pt: "tempo" },
            { jp: "あと で", pt: "depois" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        )
      ]
    },

    "から": {
      label: "Uso de から",
      kind: "gramática",
      explanation:
        "から também indica motivo, mas costuma soar mais direto que ので. É muito comum em conversa do dia a dia.",
      usage:
        "Use para dizer “porque”. Em situações muito formais, ので pode soar mais suave.",
      phrases: [
        sxPhrase(
          "今日{きょう} は 忙{いそが}しい から、あと で 連絡{れんらく} します。",
          "Como hoje estou ocupado, entro em contato depois.",
          [
            { jp: "忙{いそが}しい", pt: "ocupado" },
            { jp: "あと で", pt: "depois" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        sxPhrase(
          "危{あぶ}ない から、気{き}をつけて ください。",
          "Como é perigoso, por favor tome cuidado.",
          [
            { jp: "危{あぶ}ない", pt: "perigoso" },
            { jp: "気{き}をつけて", pt: "tome cuidado" }
          ]
        ),
        sxPhrase(
          "わからない から、もう 一度{いちど} 教{おし}えて ください。",
          "Como eu não entendi, por favor me explique mais uma vez.",
          [
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" }
          ]
        ),
        sxPhrase(
          "雨{あめ} だから、歩{ある}いて 行{い}きます。",
          "Como está chovendo, vou a pé.",
          [
            { jp: "雨{あめ}", pt: "chuva" },
            { jp: "歩{ある}いて", pt: "andando / a pé" }
          ]
        ),
        sxPhrase(
          "明日{あした} は 早{はや}い から、今日{きょう} は 早{はや}く 寝{ね}ます。",
          "Como amanhã é cedo, hoje vou dormir cedo.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "早{はや}い", pt: "cedo" },
            { jp: "寝{ね}ます", pt: "vou dormir" }
          ]
        ),
        sxPhrase(
          "安{やす}い から、これ を 買{か}います。",
          "Como é barato, vou comprar isto.",
          [
            { jp: "安{やす}い", pt: "barato" },
            { jp: "買{か}います", pt: "vou comprar" }
          ]
        ),
        sxPhrase(
          "時間{じかん} が ある から、少{すこ}し 練習{れんしゅう} します。",
          "Como tenho tempo, vou praticar um pouco.",
          [
            { jp: "時間{じかん}", pt: "tempo" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    },

    "てもいい": {
      label: "Uso de てもいい",
      kind: "gramática",
      explanation:
        "てもいい é usado para pedir ou dar permissão. Em português, fica como “posso...?” ou “tudo bem se...?”.",
      usage:
        "Muito útil em trabalho, lojas, prefeitura e situações em que você quer agir com educação.",
      phrases: [
        sxPhrase(
          "ここ に 座{すわ}っても いいですか。",
          "Posso sentar aqui?",
          [
            { jp: "ここ", pt: "aqui" },
            { jp: "座{すわ}って", pt: "sentar" }
          ]
        ),
        sxPhrase(
          "写真{しゃしん} を 撮{と}っても いいですか。",
          "Posso tirar foto?",
          [
            { jp: "写真{しゃしん}", pt: "foto" },
            { jp: "撮{と}って", pt: "tirar foto" }
          ]
        ),
        sxPhrase(
          "この 書類{しょるい} を ここ に 置{お}いても いいですか。",
          "Posso deixar este documento aqui?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "置{お}いて", pt: "colocar / deixar" }
          ]
        ),
        sxPhrase(
          "少{すこ}し 休{やす}んでも いいですか。",
          "Posso descansar um pouco?",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "休{やす}んで", pt: "descansar" }
          ]
        ),
        sxPhrase(
          "あと で 電話{でんわ} しても いいですか。",
          "Posso ligar depois?",
          [
            { jp: "あと で", pt: "depois" },
            { jp: "電話{でんわ}", pt: "telefone / ligação" }
          ]
        ),
        sxPhrase(
          "この ペン を 使{つか}っても いいですか。",
          "Posso usar esta caneta?",
          [
            { jp: "ペン", pt: "caneta" },
            { jp: "使{つか}って", pt: "usar" }
          ]
        ),
        sxPhrase(
          "今日{きょう} は 早{はや}く 帰{かえ}っても いいですか。",
          "Posso ir embora cedo hoje?",
          [
            { jp: "今日{きょう}", pt: "hoje" },
            { jp: "早{はや}く", pt: "cedo" },
            { jp: "帰{かえ}って", pt: "ir embora / voltar" }
          ]
        )
      ]
    },

    "てもらえますか": {
      label: "Uso de てもらえますか",
      kind: "gramática",
      explanation:
        "てもらえますか é uma forma educada de pedir para alguém fazer algo por você. Em português: “você poderia... para mim?”.",
      usage:
        "Use quando precisar pedir ajuda sem parecer mandão. Funciona muito bem no Japão real.",
      phrases: [
        sxPhrase(
          "もう 一度{いちど} 説明{せつめい} して もらえますか。",
          "Você poderia explicar mais uma vez para mim?",
          [
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "説明{せつめい}", pt: "explicação" }
          ]
        ),
        sxPhrase(
          "この 書類{しょるい} を 見{み}て もらえますか。",
          "Você poderia olhar este documento para mim?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "見{み}て", pt: "ver / olhar" }
          ]
        ),
        sxPhrase(
          "ここ に 書{か}いて もらえますか。",
          "Você poderia escrever aqui para mim?",
          [
            { jp: "ここ", pt: "aqui" },
            { jp: "書{か}いて", pt: "escrever" }
          ]
        ),
        sxPhrase(
          "少{すこ}し 手伝{てつだ}って もらえますか。",
          "Você poderia me ajudar um pouco?",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "手伝{てつだ}って", pt: "ajudar" }
          ]
        ),
        sxPhrase(
          "写真{しゃしん} を 送{おく}って もらえますか。",
          "Você poderia me enviar a foto?",
          [
            { jp: "写真{しゃしん}", pt: "foto" },
            { jp: "送{おく}って", pt: "enviar" }
          ]
        ),
        sxPhrase(
          "確認{かくにん} して もらえますか。",
          "Você poderia verificar para mim?",
          [
            { jp: "確認{かくにん}", pt: "verificação" }
          ]
        ),
        sxPhrase(
          "ゆっくり 話{はな}して もらえますか。",
          "Você poderia falar devagar para mim?",
          [
            { jp: "ゆっくり", pt: "devagar" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        )
      ]
    },

    "たい": {
      label: "Uso de たい",
      kind: "gramática",
      explanation:
        "たい expressa desejo: “quero fazer...”. É básico e muito útil para pedidos em lojas, prefeitura, hospital e rotina.",
      usage:
        "Coloque たい depois da base do verbo para dizer que você quer fazer aquela ação.",
      phrases: [
        sxPhrase(
          "この 荷物{にもつ} を 送{おく}りたいです。",
          "Quero enviar esta encomenda.",
          [
            { jp: "荷物{にもつ}", pt: "encomenda / bagagem" },
            { jp: "送{おく}りたい", pt: "quero enviar" }
          ]
        ),
        sxPhrase(
          "住民票{じゅうみんひょう} を 取{と}りたいです。",
          "Quero tirar o comprovante de residência.",
          [
            { jp: "住民票{じゅうみんひょう}", pt: "comprovante de residência" },
            { jp: "取{と}りたい", pt: "quero tirar / obter" }
          ]
        ),
        sxPhrase(
          "予約{よやく} を したいです。",
          "Quero fazer uma reserva.",
          [
            { jp: "予約{よやく}", pt: "reserva" }
          ]
        ),
        sxPhrase(
          "この 商品{しょうひん} を 買{か}いたいです。",
          "Quero comprar este produto.",
          [
            { jp: "商品{しょうひん}", pt: "produto" },
            { jp: "買{か}いたい", pt: "quero comprar" }
          ]
        ),
        sxPhrase(
          "日本語{にほんご} を もっと 話{はな}したいです。",
          "Quero falar mais japonês.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "話{はな}したい", pt: "quero falar" }
          ]
        ),
        sxPhrase(
          "仕事{しごと} の こと を 確認{かくにん} したいです。",
          "Quero confirmar sobre o trabalho.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        ),
        sxPhrase(
          "この アプリ で 毎日{まいにち} 練習{れんしゅう} したいです。",
          "Quero praticar todos os dias com este app.",
          [
            { jp: "毎日{まいにち}", pt: "todos os dias" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    },

    "かどうか": {
      label: "Uso de かどうか",
      kind: "gramática",
      explanation:
        "かどうか significa “se... ou não”. Use quando você quer confirmar uma informação.",
      usage:
        "Excelente para perguntar se algo está correto, se pode usar, se precisa reservar, se tem hora extra ou se o documento serve.",
      phrases: [
        sxPhrase(
          "この カード が 使{つか}える かどうか 確認{かくにん} して ください。",
          "Por favor, confirme se este cartão pode ser usado.",
          [
            { jp: "使{つか}える", pt: "pode usar" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        ),
        sxPhrase(
          "今日{きょう} 残業{ざんぎょう} が ある かどうか 知{し}りたいです。",
          "Quero saber se hoje vai ter hora extra.",
          [
            { jp: "残業{ざんぎょう}", pt: "hora extra" },
            { jp: "知{し}りたい", pt: "quero saber" }
          ]
        ),
        sxPhrase(
          "この 書類{しょるい} で 大丈夫{だいじょうぶ} かどうか 見{み}て もらえますか。",
          "Você poderia ver se este documento está certo?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / correto" }
          ]
        ),
        sxPhrase(
          "予約{よやく} が 必要{ひつよう} かどうか 教{おし}えて ください。",
          "Por favor, me diga se é necessário reservar.",
          [
            { jp: "予約{よやく}", pt: "reserva" },
            { jp: "必要{ひつよう}", pt: "necessário" }
          ]
        ),
        sxPhrase(
          "この 電車{でんしゃ} が 福井{ふくい} に 行{い}く かどうか 知{し}りたいです。",
          "Quero saber se este trem vai para Fukui.",
          [
            { jp: "電車{でんしゃ}", pt: "trem" },
            { jp: "行{い}く", pt: "ir" }
          ]
        ),
        sxPhrase(
          "明日{あした} 休{やす}める かどうか まだ わかりません。",
          "Ainda não sei se posso folgar amanhã.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "休{やす}める", pt: "poder folgar" }
          ]
        ),
        sxPhrase(
          "この 商品{しょうひん} が まだ ある かどうか 聞{き}いて みます。",
          "Vou tentar perguntar se este produto ainda tem.",
          [
            { jp: "商品{しょうひん}", pt: "produto" },
            { jp: "聞{き}いて みます", pt: "vou tentar perguntar" }
          ]
        )
      ]
    }
  };
  /* ---------- banco ampliado de situações reais ---------- */
  const SENSEI_58_SCENARIO_BANK = {
    "hospital": {
      label: "Hospital",
      explanation:
        "Material para explicar sintomas, pedir ajuda e confirmar informações em consulta médica.",
      usage:
        "Use frases curtas, educadas e diretas. Em casos graves, procure intérprete ou ajuda de emergência.",
      phrases: [
        sxPhrase(
          "昨日{きのう} から 熱{ねつ} が あります。",
          "Estou com febre desde ontem.",
          [
            { jp: "昨日{きのう}", pt: "ontem" },
            { jp: "熱{ねつ}", pt: "febre" }
          ]
        ),
        sxPhrase(
          "のど が 痛{いた}いです。",
          "Estou com dor de garganta.",
          [
            { jp: "のど", pt: "garganta" },
            { jp: "痛{いた}い", pt: "dói / dolorido" }
          ]
        ),
        sxPhrase(
          "頭{あたま} が 痛{いた}くて、少{すこ}し 気持{きも}ち 悪{わる}いです。",
          "Estou com dor de cabeça e um pouco enjoado.",
          [
            { jp: "頭{あたま}", pt: "cabeça" },
            { jp: "気持{きも}ち 悪{わる}い", pt: "enjoado / passando mal" }
          ]
        ),
        sxPhrase(
          "薬{くすり} は いつ 飲{の}めば いいですか。",
          "Quando devo tomar o remédio?",
          [
            { jp: "薬{くすり}", pt: "remédio" },
            { jp: "飲{の}めば いい", pt: "devo tomar" }
          ]
        ),
        sxPhrase(
          "仕事{しごと} に 行{い}っても 大丈夫{だいじょうぶ} ですか。",
          "Tudo bem eu ir trabalhar?",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / sem problema" }
          ]
        ),
        sxPhrase(
          "通訳{つうやく} は ありますか。",
          "Tem intérprete?",
          [
            { jp: "通訳{つうやく}", pt: "intérprete" }
          ]
        ),
        sxPhrase(
          "保険証{ほけんしょう} を 持{も}って います。",
          "Estou com o cartão do seguro de saúde.",
          [
            { jp: "保険証{ほけんしょう}", pt: "cartão do seguro de saúde" },
            { jp: "持{も}って います", pt: "tenho comigo / estou com" }
          ]
        )
      ]
    },

    "prefeitura": {
      label: "Prefeitura",
      explanation:
        "Material para documentos, balcão de atendimento, formulários e dúvidas na prefeitura.",
      usage:
        "Use quando precisar perguntar com calma, confirmar documentos e pedir explicação.",
      phrases: [
        sxPhrase(
          "この 書類{しょるい} の 書{か}き方{かた} を 教{おし}えて ください。",
          "Por favor, me ensine como preencher este documento.",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "書{か}き方{かた}", pt: "forma de escrever / preencher" }
          ]
        ),
        sxPhrase(
          "必要{ひつよう} な もの は 何{なに} ですか。",
          "O que é necessário trazer?",
          [
            { jp: "必要{ひつよう}", pt: "necessário" },
            { jp: "何{なに}", pt: "o que" }
          ]
        ),
        sxPhrase(
          "この 手続{てつづ}き は 今日中{きょうじゅう} に 終{お}わりますか。",
          "Este procedimento termina ainda hoje?",
          [
            { jp: "手続{てつづ}き", pt: "procedimento" },
            { jp: "今日中{きょうじゅう}", pt: "ainda hoje" }
          ]
        ),
        sxPhrase(
          "番号札{ばんごうふだ} は どこ で 取{と}りますか。",
          "Onde pego a senha de atendimento?",
          [
            { jp: "番号札{ばんごうふだ}", pt: "senha de atendimento" },
            { jp: "取{と}りますか", pt: "pego?" }
          ]
        ),
        sxPhrase(
          "在留{ざいりゅう} カード の コピー は 必要{ひつよう} ですか。",
          "É necessária uma cópia do cartão de residência?",
          [
            { jp: "在留{ざいりゅう} カード", pt: "cartão de residência" },
            { jp: "必要{ひつよう}", pt: "necessário" }
          ]
        ),
        sxPhrase(
          "通訳{つうやく} を お願{ねが}いできますか。",
          "É possível pedir um intérprete?",
          [
            { jp: "通訳{つうやく}", pt: "intérprete" },
            { jp: "お願{ねが}いできますか", pt: "é possível pedir?" }
          ]
        ),
        sxPhrase(
          "この 窓口{まどぐち} で 合{あ}って いますか。",
          "Este balcão está correto?",
          [
            { jp: "窓口{まどぐち}", pt: "balcão / guichê" },
            { jp: "合{あ}って いますか", pt: "está correto?" }
          ]
        )
      ]
    },

    "fabrica": {
      label: "Fábrica",
      explanation:
        "Material para rotina de fábrica, instruções, máquinas, peças, líder e confirmação de tarefa.",
      usage:
        "Use frases diretas e educadas para evitar erro de trabalho e mostrar disposição.",
      phrases: [
        sxPhrase(
          "この 作業{さぎょう} を もう 一度{いちど} 教{おし}えて ください。",
          "Por favor, me ensine este trabalho mais uma vez.",
          [
            { jp: "作業{さぎょう}", pt: "trabalho / tarefa" },
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" }
          ]
        ),
        sxPhrase(
          "次{つぎ} は 何{なに} を すれば いいですか。",
          "O que eu devo fazer em seguida?",
          [
            { jp: "次{つぎ}", pt: "próximo / em seguida" },
            { jp: "何{なに}", pt: "o que" }
          ]
        ),
        sxPhrase(
          "この 機械{きかい} が 止{と}まりました。",
          "Esta máquina parou.",
          [
            { jp: "機械{きかい}", pt: "máquina" },
            { jp: "止{と}まりました", pt: "parou" }
          ]
        ),
        sxPhrase(
          "確認{かくにん} して もらえますか。",
          "Você poderia verificar para mim?",
          [
            { jp: "確認{かくにん}", pt: "verificação" },
            { jp: "もらえますか", pt: "poderia fazer para mim?" }
          ]
        ),
        sxPhrase(
          "やり方{かた} が まだ よく わかりません。",
          "Ainda não entendi bem o modo de fazer.",
          [
            { jp: "やり方{かた}", pt: "modo de fazer" },
            { jp: "まだ", pt: "ainda" }
          ]
        ),
        sxPhrase(
          "この 部品{ぶひん} は どこ に 置{お}きますか。",
          "Onde eu coloco esta peça?",
          [
            { jp: "部品{ぶひん}", pt: "peça" },
            { jp: "置{お}きます", pt: "coloco" }
          ]
        ),
        sxPhrase(
          "今日{きょう} は 残業{ざんぎょう} が ありますか。",
          "Hoje vai ter hora extra?",
          [
            { jp: "今日{きょう}", pt: "hoje" },
            { jp: "残業{ざんぎょう}", pt: "hora extra" }
          ]
        )
      ]
    },

    "chefe": {
      label: "Chefe / líder",
      explanation:
        "Material para falar com chefe, líder ou supervisor de forma educada e clara.",
      usage:
        "Use para pedir explicação, avisar problema, confirmar tarefa ou falar de condição física.",
      phrases: [
        sxPhrase(
          "この 内容{ないよう} で 合{あ}って いますか。",
          "Está correto assim?",
          [
            { jp: "内容{ないよう}", pt: "conteúdo / instrução" },
            { jp: "合{あ}って いますか", pt: "está correto?" }
          ]
        ),
        sxPhrase(
          "もう 少{すこ}し ゆっくり お願{ねが}いします。",
          "Mais devagar, por favor.",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "ゆっくり", pt: "devagar" }
          ]
        ),
        sxPhrase(
          "この 作業{さぎょう} は 初{はじ}めて です。",
          "É a primeira vez que faço este trabalho.",
          [
            { jp: "作業{さぎょう}", pt: "trabalho / tarefa" },
            { jp: "初{はじ}めて", pt: "primeira vez" }
          ]
        ),
        sxPhrase(
          "もう 一度{いちど} 説明{せつめい} して いただけますか。",
          "O senhor poderia explicar mais uma vez?",
          [
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "いただけますか", pt: "poderia fazer para mim? / forma educada" }
          ]
        ),
        sxPhrase(
          "終{お}わったら 報告{ほうこく} します。",
          "Quando terminar, eu aviso.",
          [
            { jp: "終{お}わったら", pt: "quando terminar" },
            { jp: "報告{ほうこく}", pt: "relato / aviso" }
          ]
        ),
        sxPhrase(
          "少{すこ}し 体調{たいちょう} が 悪{わる}いです。",
          "Estou me sentindo um pouco mal.",
          [
            { jp: "体調{たいちょう}", pt: "condição física" },
            { jp: "悪{わる}い", pt: "ruim" }
          ]
        ),
        sxPhrase(
          "間違{まちが}い が ない か 確認{かくにん} します。",
          "Vou confirmar se não há erro.",
          [
            { jp: "間違{まちが}い", pt: "erro" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        )
      ]
    },

    "mercado": {
      label: "Mercado",
      explanation:
        "Material para compras, validade, desconto, pagamento e busca de produtos.",
      usage:
        "Use frases curtas para perguntar sem travar na frente do atendente.",
      phrases: [
        sxPhrase(
          "この 商品{しょうひん} は どこ に ありますか。",
          "Onde fica este produto?",
          [
            { jp: "商品{しょうひん}", pt: "produto" },
            { jp: "どこ", pt: "onde" }
          ]
        ),
        sxPhrase(
          "賞味期限{しょうみきげん} は いつ ですか。",
          "Qual é a data de validade?",
          [
            { jp: "賞味期限{しょうみきげん}", pt: "data de validade" }
          ]
        ),
        sxPhrase(
          "袋{ふくろ} は 要{い}りません。",
          "Não preciso de sacola.",
          [
            { jp: "袋{ふくろ}", pt: "sacola" },
            { jp: "要{い}りません", pt: "não preciso" }
          ]
        ),
        sxPhrase(
          "カード で 払{はら}えますか。",
          "Posso pagar com cartão?",
          [
            { jp: "カード", pt: "cartão" },
            { jp: "払{はら}えますか", pt: "posso pagar?" }
          ]
        ),
        sxPhrase(
          "安{やす}い 方{ほう} は どちら ですか。",
          "Qual é a opção mais barata?",
          [
            { jp: "安{やす}い", pt: "barato" },
            { jp: "方{ほう}", pt: "opção / lado" }
          ]
        ),
        sxPhrase(
          "この 商品{しょうひん} は 売{う}り切{き}れ ですか。",
          "Este produto está esgotado?",
          [
            { jp: "売{う}り切{き}れ", pt: "esgotado" }
          ]
        ),
        sxPhrase(
          "セルフレジ は 使{つか}えますか。",
          "Posso usar o caixa automático?",
          [
            { jp: "セルフレジ", pt: "caixa automático" },
            { jp: "使{つか}えますか", pt: "posso usar?" }
          ]
        )
      ]
    },

    "moradia": {
      label: "Moradia / aluguel",
      explanation:
        "Material para apartamento, Leopalace, reparo, vazamento, chave, ar-condicionado e contato com administradora.",
      usage:
        "Use quando precisar explicar problema na casa de forma clara e educada.",
      phrases: [
        sxPhrase(
          "水漏{みずも}れ して います。",
          "Está vazando água.",
          [
            { jp: "水漏{みずも}れ", pt: "vazamento de água" }
          ]
        ),
        sxPhrase(
          "修理{しゅうり} を お願{ねが}いしたいです。",
          "Quero solicitar um reparo.",
          [
            { jp: "修理{しゅうり}", pt: "reparo / conserto" }
          ]
        ),
        sxPhrase(
          "いつ 来{き}て もらえますか。",
          "Quando alguém pode vir aqui?",
          [
            { jp: "来{き}て もらえますか", pt: "pode vir?" }
          ]
        ),
        sxPhrase(
          "エアコン が 動{うご}きません。",
          "O ar-condicionado não funciona.",
          [
            { jp: "エアコン", pt: "ar-condicionado" },
            { jp: "動{うご}きません", pt: "não funciona" }
          ]
        ),
        sxPhrase(
          "鍵{かぎ} を なくしました。",
          "Perdi a chave.",
          [
            { jp: "鍵{かぎ}", pt: "chave" },
            { jp: "なくしました", pt: "perdi" }
          ]
        ),
        sxPhrase(
          "管理会社{かんりがいしゃ} に 連絡{れんらく} したいです。",
          "Quero entrar em contato com a administradora.",
          [
            { jp: "管理会社{かんりがいしゃ}", pt: "administradora" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        sxPhrase(
          "写真{しゃしん} を 送{おく}れば いいですか。",
          "Está certo eu enviar uma foto?",
          [
            { jp: "写真{しゃしん}", pt: "foto" },
            { jp: "送{おく}れば", pt: "se enviar" }
          ]
        )
      ]
    }
  };

  function sxDetectScenario(request, theme = "") {
    const n = sxNormalize(`${request || ""} ${theme || ""}`);

    if (/chefe|lider|supervisor|encarregado|shunin|リーダー/.test(n)) return "chefe";
    if (/fabrica|linha|maquina|peca|producao|turno|murata|作業|機械|部品/.test(n)) return "fabrica";
    if (/hospital|medico|consulta|febre|dor|remedio|garganta|薬|熱|病院/.test(n)) return "hospital";
    if (/prefeitura|documento|my number|mynumber|residencia|endereco|zairyu|市役所|書類/.test(n)) return "prefeitura";
    if (/mercado|supermercado|validade|produto|preco|desconto|商品|賞味期限/.test(n)) return "mercado";
    if (/aluguel|apartamento|moradia|leopalace|vazamento|chave|reparo|エアコン|鍵/.test(n)) return "moradia";

    return "fabrica";
  }

  /* ---------- detecção de termo gramatical / palavra-alvo ---------- */
  function sxNormalizeTerm(term) {
    return String(term || "")
      .trim()
      .replace(/[「」『』"“”'’`´]/g, "")
      .replace(/\s+/g, "");
  }

  function sxKnownGrammarKeys() {
    const keys = new Set(Object.keys(SENSEI_58_GRAMMAR_BANK));

    try {
      if (typeof SENSEI_GRAMMAR_BANK === "object" && SENSEI_GRAMMAR_BANK) {
        Object.keys(SENSEI_GRAMMAR_BANK).forEach(k => keys.add(k));
      }
    } catch { }

    return Array.from(keys).sort((a, b) => b.length - a.length);
  }

  function sxDetectTargetTerm(request, theme = "") {
    const raw = `${request || ""} ${theme || ""}`;
    const compact = sxNormalizeTerm(raw);

    for (const key of sxKnownGrammarKeys()) {
      if (compact.includes(sxNormalizeTerm(key))) return key;
    }

    const jpTerms = sxExtractJapaneseTerms(raw)
      .map(sxNormalizeTerm)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    const badTerms = new Set([
      "日本語",
      "今日",
      "明日",
      "仕事",
      "文章",
      "文法",
      "単語",
      "例文",
      "使い方",
      "意味"
    ]);

    const useful = jpTerms.find(t => !badTerms.has(t));
    if (useful) return useful;

    const n = sxNormalize(raw);
    const quoted = raw.match(/[「『"“']([^」』"”']{1,30})[」』"”']/);
    if (quoted && quoted[1]) return sxNormalizeTerm(quoted[1]);

    const afterUso = n.match(/uso de ([a-z0-9ぁ-んァ-ン一-龯ー]+)/i);
    if (afterUso && afterUso[1]) return sxNormalizeTerm(afterUso[1]);

    const afterCom = n.match(/frases com ([a-z0-9ぁ-んァ-ン一-龯ー]+)/i);
    if (afterCom && afterCom[1]) return sxNormalizeTerm(afterCom[1]);

    return "";
  }

  function sxGetKnownGrammarPack(term) {
    const key = sxKnownGrammarKeys().find(k => sxNormalizeTerm(k) === sxNormalizeTerm(term));
    if (!key) return null;

    if (SENSEI_58_GRAMMAR_BANK[key]) return SENSEI_58_GRAMMAR_BANK[key];

    try {
      if (SENSEI_GRAMMAR_BANK[key]) {
        const old = SENSEI_GRAMMAR_BANK[key];

        return {
          label: old.title || `Uso de ${key}`,
          kind: old.type || "gramática",
          explanation: old.explanation || `Material para entender o uso de ${key}.`,
          usage: old.goal || "Treine uma frase por dia para fixar o uso na prática.",
          phrases: Array.isArray(old.phrases)
            ? old.phrases.map(p => sxPhrase(p.jp, p.pt, p.newWords || []))
            : []
        };
      }
    } catch { }

    return null;
  }

  function sxGenericGrammarFallback(term, request, level, tone) {
    const safeTerm = sxNormalizeTerm(term) || "esta expressão";

    return {
      label: `Uso de ${safeTerm}`,
      kind: "palavra-alvo",
      explanation:
        `O Sensei IA detectou “${safeTerm}” como termo principal do pedido. Ainda não há um banco específico para ele, então foi criado um material-base para você estudar, perguntar melhor e transformar em treino.`,
      usage:
        "Use estas frases para pedir explicação, confirmar significado, perguntar naturalidade e criar exemplos. Depois você pode salvar o material e adaptar no gerenciador.",
      phrases: [
        sxPhrase(
          `この 表現{ひょうげん}「${safeTerm}」の 使{つか}い方{かた} を 教{おし}えて ください。`,
          `Por favor, me ensine como usar a expressão “${safeTerm}”.`,
          [
            { jp: "表現{ひょうげん}", pt: "expressão" },
            { jp: "使{つか}い方{かた}", pt: "modo de usar" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" }
          ]
        ),
        sxPhrase(
          `「${safeTerm}」は どういう 意味{いみ} ですか。`,
          `O que significa “${safeTerm}”?`,
          [
            { jp: "意味{いみ}", pt: "significado" }
          ]
        ),
        sxPhrase(
          `「${safeTerm}」を 使{つか}った 例文{れいぶん} を 作{つく}って もらえますか。`,
          `Você poderia criar uma frase de exemplo usando “${safeTerm}”?`,
          [
            { jp: "使{つか}った", pt: "usando" },
            { jp: "例文{れいぶん}", pt: "frase de exemplo" },
            { jp: "作{つく}って", pt: "criar / fazer" }
          ]
        ),
        sxPhrase(
          `「${safeTerm}」は 日常会話{にちじょうかいわ} で よく 使{つか}いますか。`,
          `“${safeTerm}” é muito usado na conversa do dia a dia?`,
          [
            { jp: "日常会話{にちじょうかいわ}", pt: "conversa do dia a dia" },
            { jp: "使{つか}いますか", pt: "usa?" }
          ]
        ),
        sxPhrase(
          `「${safeTerm}」の もっと 自然{しぜん} な 使{つか}い方{かた} は ありますか。`,
          `Existe uma forma mais natural de usar “${safeTerm}”?`,
          [
            { jp: "自然{しぜん}", pt: "natural" },
            { jp: "使{つか}い方{かた}", pt: "modo de usar" }
          ]
        ),
        sxPhrase(
          `仕事{しごと} で「${safeTerm}」を 使{つか}う 例{れい} を 教{おし}えて ください。`,
          `Por favor, me ensine um exemplo usando “${safeTerm}” no trabalho.`,
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "例{れい}", pt: "exemplo" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" }
          ]
        ),
        sxPhrase(
          `「${safeTerm}」を 使{つか}って、日本語{にほんご} を 練習{れんしゅう} します。`,
          `Vou praticar japonês usando “${safeTerm}”.`,
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    };
  }

  function sxGenericScenarioFallback(request, theme, level, tone) {
    const cleanTheme = String(theme || "").trim();
    const cleanRequest = String(request || "").trim();

    const label = cleanTheme || "Situação personalizada";

    return {
      label,
      explanation:
        "O Sensei IA não encontrou um banco específico perfeito para este pedido. Então criou um material-base para você começar sem ficar parado.",
      usage:
        "Use estas frases como kit inicial: pedir ajuda, pedir explicação, confirmar informação, pedir para escrever e avisar que ainda não entendeu.",
      phrases: [
        sxPhrase(
          "すみません。少{すこ}し 手伝{てつだ}って もらえますか。",
          "Com licença. Você poderia me ajudar um pouco?",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "手伝{てつだ}って", pt: "ajudar" },
            { jp: "もらえますか", pt: "poderia fazer para mim?" }
          ]
        ),
        sxPhrase(
          "日本語{にほんご} が まだ 苦手{にがて} なので、ゆっくり 話{はな}して ください。",
          "Como ainda tenho dificuldade com japonês, por favor fale devagar.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "苦手{にがて}", pt: "dificuldade / não sou bom em algo" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        ),
        sxPhrase(
          "もう 一度{いちど} 説明{せつめい} して もらえますか。",
          "Você poderia explicar mais uma vez para mim?",
          [
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "説明{せつめい}", pt: "explicação" }
          ]
        ),
        sxPhrase(
          "紙{かみ} に 書{か}いて もらえますか。",
          "Você poderia escrever no papel para mim?",
          [
            { jp: "紙{かみ}", pt: "papel" },
            { jp: "書{か}いて", pt: "escrever" }
          ]
        ),
        sxPhrase(
          "この 内容{ないよう} で 合{あ}って いますか。",
          "Está correto assim?",
          [
            { jp: "内容{ないよう}", pt: "conteúdo" },
            { jp: "合{あ}って いますか", pt: "está correto?" }
          ]
        ),
        sxPhrase(
          "あと で 確認{かくにん} して、連絡{れんらく} します。",
          "Vou confirmar depois e entro em contato.",
          [
            { jp: "あと で", pt: "depois" },
            { jp: "確認{かくにん}", pt: "confirmação" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        sxPhrase(
          "今{いま} は まだ よく わかりません。",
          "Agora eu ainda não entendi bem.",
          [
            { jp: "今{いま}", pt: "agora" },
            { jp: "まだ", pt: "ainda" },
            { jp: "わかりません", pt: "não entendo" }
          ]
        )
      ],
      sourceNote: cleanRequest
        ? `Pedido original: ${cleanRequest}`
        : "Pedido original não informado."
    };
  }

  /* ---------- construção de pack expert ---------- */
  function sxBuildCoachLine(meta) {
    const parts = [];

    parts.push(`Tipo detectado: ${meta.intent === "grammar" ? "gramática / palavra-alvo" : "situação real"}.`);

    if (meta.term) parts.push(`Termo principal: ${meta.term}.`);
    if (meta.scenarioLabel) parts.push(`Contexto: ${meta.scenarioLabel}.`);

    if (meta.explanation) parts.push(meta.explanation);
    if (meta.usage) parts.push(`Uso prático: ${meta.usage}`);

    parts.push(`Nível: ${sxLevelLabel(meta.level)}.`);
    parts.push(`Tom: ${sxToneLabel(meta.tone)}.`);
    parts.push("Sugestão de treino: salve o material e treine 1 frase por dia durante 7 dias no método 105x.");

    return parts.join(" ");
  }

  function sxBuildGrammarPack(payload) {
    const request = sxRaw(payload?.request);
    const theme = sxRaw(payload?.theme);
    const level = sxLevelLabel(payload?.level);
    const tone = sxToneLabel(payload?.tone);

    const term = sxDetectTargetTerm(request, theme);
    const knownPack = sxGetKnownGrammarPack(term);
    const pack = knownPack || sxGenericGrammarFallback(term, request, level, tone);

    const phrases = sxEnsureSeven(pack.phrases, (i) => {
      const fallback = sxGenericGrammarFallback(term || "表現", request, level, tone);
      return fallback.phrases[i % fallback.phrases.length];
    }).map(p => ({
      ...p,
      id: sxUid("sensei")
    }));

    const topicName = sxFormatTopicName(pack.label || term || "Gramática");

    const meta = {
      intent: "grammar",
      term: term || pack.label || "",
      level,
      tone,
      explanation: pack.explanation,
      usage: pack.usage
    };

    return {
      scenario: "grammar",
      requestType: "grammar",
      term: term || "",
      title: pack.label || topicName,
      explanation: pack.explanation,
      usage: pack.usage,
      goal: "Treine 1 frase por dia. Em 7 dias, você terá contato suficiente para reconhecer esse uso com mais facilidade.",
      topicName,
      coachLine: sxBuildCoachLine(meta),
      phrases,
      expertEngine: "5.8",
      confidence: knownPack ? "alta" : "fallback"
    };
  }

  function sxBuildScenarioPack(payload) {
    const request = sxRaw(payload?.request);
    const theme = sxRaw(payload?.theme);
    const level = sxLevelLabel(payload?.level);
    const tone = sxToneLabel(payload?.tone);

    const scenarioKey = sxDetectScenario(request, theme);
    const knownPack = SENSEI_58_SCENARIO_BANK[scenarioKey];

    const pack = knownPack || sxGenericScenarioFallback(request, theme, level, tone);

    const phrases = sxEnsureSeven(pack.phrases, (i) => {
      const fallback = sxGenericScenarioFallback(request, theme, level, tone);
      return fallback.phrases[i % fallback.phrases.length];
    }).map(p => ({
      ...p,
      id: sxUid("sensei")
    }));

    const topicName = sxFormatTopicName(theme || pack.label || "Situação real");

    const meta = {
      intent: "scenario",
      scenarioLabel: pack.label || scenarioKey,
      level,
      tone,
      explanation: pack.explanation,
      usage: pack.usage
    };

    return {
      scenario: scenarioKey || "custom",
      requestType: "scenario",
      term: "",
      title: pack.label || topicName,
      explanation: pack.explanation,
      usage: pack.usage,
      goal: "Escolha 1 frase para hoje. Se fizer sentido, salve o material e revise no 105x.",
      topicName,
      coachLine: sxBuildCoachLine(meta),
      phrases,
      expertEngine: "5.8",
      confidence: knownPack ? "alta" : "fallback",
      sourceNote: pack.sourceNote || ""
    };
  }
  /* ---------- gerador principal Expert Engine 2.0 ---------- */
  function sxBuildExpertPack(payload = {}) {
    const request = sxRaw(payload.request || payload.prompt || payload.text || "");
    const theme = sxRaw(payload.theme || payload.topic || payload.topicName || "");
    const level = sxLevelLabel(payload.level || "iniciante");
    const tone = sxToneLabel(payload.tone || "educado");

    const intent = sxDetectIntent(request, theme);

    if (intent === "grammar") {
      return sxBuildGrammarPack({
        request,
        theme,
        level,
        tone
      });
    }

    return sxBuildScenarioPack({
      request,
      theme,
      level,
      tone
    });
  }

  window.generateSenseiMaterial = function patchedGenerateSenseiMaterial58(payload = {}) {
    try {
      const request = sxRaw(payload.request || payload.prompt || payload.text || "");
      const theme = sxRaw(payload.theme || payload.topic || payload.topicName || "");

      const intent = sxDetectIntent(request, theme);
      const term = sxDetectTargetTerm(request, theme);
      const scenario = sxDetectScenario(request, theme);

      const shouldUseExpert =
        intent === "grammar" ||
        !!term ||
        sxHasJapanese(`${request} ${theme}`) ||
        !sxOriginalGenerateSenseiMaterial ||
        /frases|exemplos|explique|ensine|como usar|uso de|particula|partícula|gramatica|gramática|situação|situacao|preciso|quero/i.test(`${request} ${theme}`);

      if (shouldUseExpert) {
        return sxBuildExpertPack(payload);
      }

      try {
        const oldResult = sxOriginalGenerateSenseiMaterial(payload);

        if (
          oldResult &&
          Array.isArray(oldResult.phrases) &&
          oldResult.phrases.length >= 7
        ) {
          return {
            ...oldResult,
            expertEngine: oldResult.expertEngine || "legacy",
            confidence: oldResult.confidence || "legacy"
          };
        }
      } catch { }

      return sxBuildScenarioPack({
        request,
        theme,
        level: payload.level || "iniciante",
        tone: payload.tone || "educado",
        scenario
      });
    } catch (err) {
      console.warn("[NIHONGO321] Sensei Expert Engine 5.8 fallback:", err);

      return sxGenericScenarioFallback(
        payload.request || payload.prompt || "",
        payload.theme || payload.topic || "",
        payload.level || "iniciante",
        payload.tone || "educado"
      );
    }
  };

  /* ---------- reforço do resultado visual ---------- */
  window.renderSenseiOutput = function patchedRenderSenseiOutput58(pack) {
    const safePack = pack && Array.isArray(pack.phrases)
      ? pack
      : sxBuildExpertPack({
        request: "criar frases úteis para estudar japonês no Japão",
        theme: "Material prático",
        level: "iniciante",
        tone: "educado"
      });

    const enhancedPack = {
      ...safePack,
      topicName: safePack.topicName || sxFormatTopicName(safePack.title || "Sensei IA"),
      explanation: safePack.explanation || "Material criado para treino prático de japonês.",
      goal: safePack.goal || "Treine 1 frase por dia durante 7 dias.",
      coachLine: safePack.coachLine || "Material criado pelo Sensei IA para revisão no método 105x.",
      phrases: sxEnsureSeven(safePack.phrases, (i) => {
        const fallback = sxGenericScenarioFallback("", "Material prático", "iniciante", "educado");
        return fallback.phrases[i % fallback.phrases.length];
      })
    };

    if (sxOriginalRenderSenseiOutput && sxOriginalRenderSenseiOutput !== window.renderSenseiOutput) {
      try {
        sxOriginalRenderSenseiOutput(enhancedPack);
      } catch {
        sxRenderOutputFallback58(enhancedPack);
      }
    } else {
      sxRenderOutputFallback58(enhancedPack);
    }

    sxAddExpertBadgeToOutput(enhancedPack);
  };

  function sxRenderOutputFallback58(pack) {
    const box = document.querySelector("#senseiOutput");
    if (!box) return;

    const phrases = Array.isArray(pack.phrases) ? pack.phrases : [];

    const topicOptions = [
      `<option value="AUTO_CREATE">criar novo tópico: ${sxEscape(pack.topicName || "Sensei IA")}</option>`,
      ...sxGetTopicsForSelect58()
    ].join("");

    box.innerHTML = `
      <div class="sheet stack" style="text-align:left">
        <div class="row row--between">
          <div class="badge">${sxEscape(pack.topicName || "Sensei IA")}</div>
          <div class="badge">${phrases.length} frases</div>
        </div>

        <div class="small"><b>explicação:</b> ${sxEscape(pack.explanation || "")}</div>
        <div class="small"><b>uso prático:</b> ${sxEscape(pack.usage || "")}</div>
        <div class="small"><b>meta leve:</b> ${sxEscape(pack.goal || "")}</div>
        <div class="small">${sxEscape(pack.coachLine || "")}</div>
      </div>

      ${phrases.map((p, i) => `
        <div class="sheet stack" style="text-align:left">
          <div class="badge">frase ${i + 1}</div>
          <div class="small"><b>JP:</b> ${sxEscape(sxStripFurigana(p.jp))}</div>
          <div class="small"><b>PT:</b> ${sxEscape(p.pt)}</div>

          ${(Array.isArray(p.newWords) && p.newWords.length) ? `
            <div class="small" style="font-weight:800;margin-top:4px">explicação</div>
            ${p.newWords.map(w => `
              <div class="small">${sxEscape(sxFormatWord58(w))}</div>
            `).join("")}
          ` : ""}
        </div>
      `).join("")}

      <div class="sheet stack" style="text-align:left">
        <div class="row row--between">
          <div class="badge">salvar material</div>
          <div class="badge">Sensei IA 5.8</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Escolha onde guardar este conteúdo</h3>
          <p class="lockText">
            Você pode criar um tópico novo automaticamente ou salvar estas frases dentro de um tópico existente.
          </p>
        </div>

        <div>
          <div class="small">salvar em</div>
          <select id="senseiSaveTopicSel" class="btn selectBtn" style="width:100%">
            ${topicOptions}
          </select>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-action="saveSenseiPack">salvar neste tópico</button>
          <button class="btn btn--full" data-nav="#/105x">ir ao treino</button>
        </div>
      </div>
    `;

    box.dataset.pack = JSON.stringify(pack);
  }

  function sxGetTopicsForSelect58() {
    let topics = [];

    try {
      topics = Array.isArray(STATE.bank?.topics) ? STATE.bank.topics : [];
    } catch {
      topics = [];
    }

    return topics.map(t => {
      let count = 0;

      try {
        if (typeof topicPhraseIds === "function") {
          count = topicPhraseIds(t.id).length;
        } else {
          count = (STATE.bank?.phrases || []).filter(p => p.topicId === t.id).length;
        }
      } catch { }

      let locked = "";

      try {
        locked = typeof isTopicPremium === "function" && isTopicPremium(t.id) ? " 🔒" : "";
      } catch { }

      return `
        <option value="${sxEscape(t.id)}">
          ${sxEscape(t.name)}${locked} • ${count} frases
        </option>
      `;
    });
  }

  function sxFormatWord58(word) {
    try {
      if (typeof formatWordExplanation === "function") {
        return formatWordExplanation(word);
      }
    } catch { }

    return `${word?.jp || ""} = ${word?.pt || ""}`;
  }

  function sxAddExpertBadgeToOutput(pack) {
    const box = document.querySelector("#senseiOutput");
    if (!box) return;

    if (box.querySelector("#senseiExpert58Badge")) return;

    const badge = document.createElement("div");
    badge.id = "senseiExpert58Badge";
    badge.className = "sheet stack";
    badge.style.textAlign = "left";
    badge.innerHTML = `
      <div class="row row--between">
        <div class="badge">Sensei IA 5.8</div>
        <div class="badge">${sxEscape(pack.confidence || "local")}</div>
      </div>

      <div class="small">
        Motor local melhorado: detecta gramática, palavra-alvo ou situação real e tenta entregar sempre um material treinável com 7 frases.
      </div>
    `;

    box.prepend(badge);
  }

  /* ---------- intercepta clique de gerar, quando o app antigo falhar ---------- */
  function sxReadSenseiFormPayload58() {
    const request =
      document.querySelector("#senseiRequest")?.value ||
      document.querySelector("#aiPrompt")?.value ||
      document.querySelector("#senseiPrompt")?.value ||
      document.querySelector("textarea")?.value ||
      "";

    const theme =
      document.querySelector("#senseiTheme")?.value ||
      document.querySelector("#aiTopic")?.value ||
      document.querySelector("#senseiTopic")?.value ||
      "";

    const level =
      document.querySelector("#senseiLevel")?.value ||
      document.querySelector("#aiLevel")?.value ||
      "iniciante";

    const tone =
      document.querySelector("#senseiTone")?.value ||
      document.querySelector("#aiTone")?.value ||
      "educado";

    return {
      request,
      theme,
      level,
      tone
    };
  }

  function sxRepairSenseiOutputAfterGenerate58() {
    const box = document.querySelector("#senseiOutput");
    if (!box) return;

    const hasUsefulOutput =
      box.dataset?.pack &&
      (() => {
        try {
          const parsed = JSON.parse(box.dataset.pack);
          return Array.isArray(parsed.phrases) && parsed.phrases.length >= 7;
        } catch {
          return false;
        }
      })();

    if (hasUsefulOutput) return;

    const payload = sxReadSenseiFormPayload58();
    const pack = window.generateSenseiMaterial(payload);
    window.renderSenseiOutput(pack);
  }

  let sxGenerateTimer58 = null;

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action='generateSensei'], #generateSensei, #btnGenerateSensei");
    if (!btn) return;

    clearTimeout(sxGenerateTimer58);
    sxGenerateTimer58 = setTimeout(() => {
      sxRepairSenseiOutputAfterGenerate58();
    }, 80);
  }, true);

  /* ---------- comando de teste no console ---------- */
  window.nihongo321Sensei58Test = function nihongo321Sensei58Test(prompt = "Preciso de frases com ので para usar no trabalho.") {
    const pack = window.generateSenseiMaterial({
      request: prompt,
      theme: "",
      level: "intermediário",
      tone: "educado"
    });

    console.log("[NIHONGO321] Sensei IA 5.8 teste:", pack);
    return pack;
  };

  window.nihongo321Sensei58Check = function nihongo321Sensei58Check() {
    const checks = {
      patch: true,
      generator: typeof window.generateSenseiMaterial === "function",
      renderer: typeof window.renderSenseiOutput === "function",
      grammarTerms: Object.keys(SENSEI_58_GRAMMAR_BANK).length,
      scenarios: Object.keys(SENSEI_58_SCENARIO_BANK).length
    };

    console.log("[NIHONGO321] Sensei IA Expert Engine 5.8 ativo:", checks);
    return checks;
  };

  console.log("[NIHONGO321] Sensei IA Expert Engine 5.8 carregado.");

})();

/* =========================================================
   NIHONGO321 v8.3.0
   PATCH BLOCO 6A ZERO COST — SENSEI IA LOCAL MASTER
   - Sensei IA local mais completo, sem API e sem backend
   - Custo zero
   - Amplia gramática, situações e respostas pedagógicas
   - Mantém Sensei IA 5.8 como base/fallback
   - Não altera checkout
   - Não altera estrutura do localStorage
   - Não quebra treino 105x
   ========================================================= */

(function patchSenseiLocalMaster6A() {
  "use strict";

  const PATCH_ID = "nihongo321_patch_sensei_local_master_6a";

  if (window[PATCH_ID]) {
    return;
  }

  window[PATCH_ID] = true;

  /* =========================================================
     1. HELPERS SEGUROS
     ========================================================= */

  function lmNow() {
    try {
      if (typeof now === "function") return now();
    } catch { }

    return Date.now();
  }

  function lmUid(prefix = "lm") {
    try {
      if (typeof uid === "function") return uid(prefix);
    } catch { }

    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function lmEscape(value) {
    try {
      if (typeof escapeHTML === "function") return escapeHTML(value);
    } catch { }

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function lmNormalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[「」『』"“”'’`´]/g, " ")
      .replace(/[、。,.!?！？;；:：()\[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function lmCompact(text) {
    return String(text || "")
      .replace(/[「」『』"“”'’`´\s、。,.!?！？;；:：()\[\]{}]/g, "")
      .trim();
  }

  function lmHasJP(text) {
    return /[\u3040-\u30FF\u4E00-\u9FFF]/.test(String(text || ""));
  }

  function lmStripFuri(value) {
    try {
      if (typeof jpStripFurigana === "function") return jpStripFurigana(value);
    } catch { }

    return String(value || "").replace(/([^{}\s]+)\{([^{}]+)\}/g, "$1");
  }

  function lmPhrase(jp, pt, newWords = []) {
    return {
      id: lmUid("sensei"),
      jp,
      pt,
      newWords: Array.isArray(newWords) ? newWords : [],
      createdAt: lmNow(),
      updatedAt: lmNow()
    };
  }

  function lmEnsureSeven(phrases, fallbackFactory) {
    const out = Array.isArray(phrases)
      ? phrases.filter(p => p && p.jp && p.pt)
      : [];

    let guard = 0;

    while (out.length < 7 && guard < 30) {
      const p = fallbackFactory(out.length, guard);

      if (p && p.jp && p.pt) {
        const duplicated = out.some(x =>
          lmStripFuri(x.jp) === lmStripFuri(p.jp) &&
          String(x.pt || "").trim().toLowerCase() === String(p.pt || "").trim().toLowerCase()
        );

        if (!duplicated) out.push(p);
      }

      guard++;
    }

    return out.slice(0, 12);
  }

  function lmLevelLabel(level) {
    const n = lmNormalize(level);

    if (/avancado|avançado|n2|n1/.test(n)) return "avançado";
    if (/intermediario|intermediário|medio|médio|n4|n3/.test(n)) return "intermediário";
    if (/basico|básico|iniciante|facil|fácil|n5/.test(n)) return "iniciante";

    return "iniciante";
  }

  function lmToneLabel(tone) {
    const n = lmNormalize(tone);

    if (/formal|respeitoso|educado|polido|keigo/.test(n)) return "educado";
    if (/trabalho|chefe|lider|líder|empresa|fabrica|fábrica/.test(n)) return "trabalho";
    if (/casual|natural|amigo/.test(n)) return "natural";
    if (/emergencia|emergência|urgente|hospital/.test(n)) return "emergência";

    return "educado";
  }

  function lmTopicName(label) {
    const clean = String(label || "").trim();
    if (!clean) return "Sensei IA • Material prático";
    if (/^sensei ia/i.test(clean)) return clean;
    return `Sensei IA • ${clean}`;
  }

  function lmToast(msg) {
    try {
      if (typeof toast === "function") {
        toast(msg);
        return;
      }
    } catch { }

    console.log("[NIHONGO321]", msg);
  }

  function lmBeep(type = "ding") {
    try {
      if (typeof beep === "function") beep(type);
    } catch { }
  }

  function lmSafeJSONParse(str) {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  function lmGetTopics() {
    try {
      return Array.isArray(STATE.bank?.topics) ? STATE.bank.topics : [];
    } catch {
      return [];
    }
  }

  function lmTopicPhraseCount(topicId) {
    try {
      if (typeof topicPhraseIds === "function") return topicPhraseIds(topicId).length;
      return (STATE.bank?.phrases || []).filter(p => p.topicId === topicId).length;
    } catch {
      return 0;
    }
  }

  function lmFormatWord(word) {
    try {
      if (typeof formatWordExplanation === "function") {
        return formatWordExplanation(word);
      }
    } catch { }

    const jp = word?.jp || "";
    const pt = word?.pt || "";
    return `${jp} = ${pt}`;
  }

  const lmOriginalGenerateSenseiMaterial =
    typeof window.generateSenseiMaterial === "function"
      ? window.generateSenseiMaterial
      : null;

  const lmOriginalRenderSenseiOutput =
    typeof window.renderSenseiOutput === "function"
      ? window.renderSenseiOutput
      : null;

  /* =========================================================
     2. EXTRAÇÃO DE TERMOS E INTENÇÃO
     ========================================================= */

  const LM_STOP_JP_TERMS = new Set([
    "日本語",
    "文法",
    "単語",
    "例文",
    "意味",
    "使い方",
    "文章",
    "今日",
    "明日",
    "仕事",
    "日本",
    "私",
    "僕",
    "俺"
  ]);

  function lmExtractJPTerms(text) {
    const raw = String(text || "");
    const matches = raw.match(/[\u3040-\u30FF\u4E00-\u9FFFー々〆〤]{1,24}/g) || [];

    return Array.from(new Set(
      matches
        .map(x => x.trim())
        .filter(Boolean)
        .filter(x => !LM_STOP_JP_TERMS.has(x))
        .filter(x => !/^[。、！？ー]+$/.test(x))
    )).sort((a, b) => b.length - a.length);
  }

  function lmExtractQuotedTerm(text) {
    const raw = String(text || "");

    const m =
      raw.match(/[「『"“']([^」』"”']{1,40})[」』"”']/) ||
      raw.match(/termo\s+(.{1,40})/i) ||
      raw.match(/palavra\s+(.{1,40})/i) ||
      raw.match(/express[aã]o\s+(.{1,40})/i);

    if (!m || !m[1]) return "";

    return String(m[1])
      .replace(/[?.!,;:。！？、]/g, "")
      .trim();
  }

  function lmDetectRequestCount(text) {
    const n = lmNormalize(text);

    if (/12 frases|doze frases/.test(n)) return 12;
    if (/13 frases|treze frases/.test(n)) return 13;
    if (/10 frases|dez frases/.test(n)) return 10;
    if (/8 frases|oito frases/.test(n)) return 8;
    if (/7 frases|sete frases/.test(n)) return 7;

    return 7;
  }

  function lmDetectIntent(payload) {
    const raw = `${payload?.request || ""} ${payload?.theme || ""} ${payload?.topic || ""}`;
    const n = lmNormalize(raw);

    const grammarWords = [
      "gramatica",
      "gramática",
      "particula",
      "partícula",
      "estrutura",
      "uso de",
      "como usar",
      "me ensine",
      "ensine",
      "explique",
      "explica",
      "diferenca",
      "diferença",
      "quando usar",
      "frases com",
      "exemplos com",
      "significa",
      "significado",
      "palavra",
      "expressao",
      "expressão",
      "termo"
    ];

    const scenarioWords = [
      "como digo",
      "como eu digo",
      "preciso falar",
      "quero falar",
      "preciso explicar",
      "preciso pedir",
      "situacao",
      "situação",
      "no trabalho",
      "na fabrica",
      "na fábrica",
      "no hospital",
      "na prefeitura",
      "no mercado",
      "no konbini",
      "no correio",
      "com chefe",
      "com meu chefe",
      "bicicleta",
      "aluguel",
      "apartamento",
      "documento",
      "consulta",
      "remedio",
      "remédio"
    ];

    const hasGrammar = grammarWords.some(w => n.includes(lmNormalize(w)));
    const hasScenario = scenarioWords.some(w => n.includes(lmNormalize(w)));
    const hasJP = lmHasJP(raw);

    if (hasGrammar || hasJP) return "grammar";
    if (hasScenario) return "scenario";

    return "scenario";
  }

  function lmDetectTargetTerm(payload) {
    const raw = `${payload?.request || ""} ${payload?.theme || ""} ${payload?.topic || ""}`;
    const compact = lmCompact(raw);

    const knownKeys = Object.keys(LM_GRAMMAR_BANK || {}).sort((a, b) => b.length - a.length);

    for (const key of knownKeys) {
      if (compact.includes(lmCompact(key))) return key;
    }

    const quoted = lmExtractQuotedTerm(raw);
    if (quoted && lmHasJP(quoted)) return quoted;

    const jpTerms = lmExtractJPTerms(raw);
    if (jpTerms.length) return jpTerms[0];

    const n = lmNormalize(raw);

    const patterns = [
      /uso de ([a-z0-9ぁ-んァ-ン一-龯ー]+)/i,
      /frases com ([a-z0-9ぁ-んァ-ン一-龯ー]+)/i,
      /exemplos com ([a-z0-9ぁ-んァ-ン一-龯ー]+)/i,
      /como usar ([a-z0-9ぁ-んァ-ン一-龯ー]+)/i,
      /me ensine ([a-z0-9ぁ-んァ-ン一-龯ー]+)/i
    ];

    for (const pattern of patterns) {
      const m = n.match(pattern);
      if (m && m[1]) return m[1].trim();
    }

    return "";
  }

  /* =========================================================
     3. BANCO-MESTRE DE GRAMÁTICA
     ========================================================= */

  const LM_GRAMMAR_BANK = {
    "ので": {
      label: "Uso de ので",
      kind: "gramática",
      explanation:
        "ので liga uma causa a uma consequência. Soa natural e educado, ótimo para explicar motivos sem parecer brusco.",
      usage:
        "Use quando quiser dizer “porque”, “por causa de” ou “como”. Muito bom no trabalho, hospital, prefeitura e atrasos.",
      commonMistake:
        "Evite usar ので de forma seca demais em pedidos muito diretos. Para pedir algo, combine com formas educadas como てもいいですか ou いただけますか.",
      phrases: [
        lmPhrase(
          "今日{きょう} は 体調{たいちょう} が 悪{わる}い ので、早{はや}く 帰{かえ}っても いいですか。",
          "Como hoje estou me sentindo mal, posso ir embora mais cedo?",
          [
            { jp: "体調{たいちょう}", pt: "condição física" },
            { jp: "悪{わる}い", pt: "ruim" },
            { jp: "早{はや}く", pt: "cedo" }
          ]
        ),
        lmPhrase(
          "電車{でんしゃ} が 遅{おく}れて いる ので、少{すこ}し 遅{おく}れます。",
          "Como o trem está atrasado, vou me atrasar um pouco.",
          [
            { jp: "電車{でんしゃ}", pt: "trem" },
            { jp: "遅{おく}れて いる", pt: "está atrasado" },
            { jp: "少{すこ}し", pt: "um pouco" }
          ]
        ),
        lmPhrase(
          "日本語{にほんご} が まだ 苦手{にがて} なので、ゆっくり 話{はな}して ください。",
          "Como ainda tenho dificuldade com japonês, por favor fale devagar.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "苦手{にがて}", pt: "dificuldade / não ser bom em algo" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        ),
        lmPhrase(
          "明日{あした} は 仕事{しごと} なので、今日{きょう} は 早{はや}く 寝{ね}ます。",
          "Como amanhã tenho trabalho, hoje vou dormir cedo.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "寝{ね}ます", pt: "vou dormir" }
          ]
        ),
        lmPhrase(
          "雨{あめ} が 降{ふ}って いる ので、自転車{じてんしゃ} では 行{い}きません。",
          "Como está chovendo, não vou de bicicleta.",
          [
            { jp: "雨{あめ}", pt: "chuva" },
            { jp: "降{ふ}って いる", pt: "está chovendo" },
            { jp: "自転車{じてんしゃ}", pt: "bicicleta" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} が わからない ので、教{おし}えて いただけますか。",
          "Como eu não entendo este documento, o senhor poderia me explicar?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" },
            { jp: "いただけますか", pt: "poderia fazer para mim? / forma educada" }
          ]
        ),
        lmPhrase(
          "時間{じかん} が ない ので、あと で 連絡{れんらく} します。",
          "Como não tenho tempo, entro em contato depois.",
          [
            { jp: "時間{じかん}", pt: "tempo" },
            { jp: "あと で", pt: "depois" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        )
      ]
    },

    "から": {
      label: "Uso de から",
      kind: "gramática",
      explanation:
        "から também indica motivo. É mais direto e comum na fala do dia a dia.",
      usage:
        "Use para dizer “porque”. Em situações formais, ので pode soar mais suave.",
      commonMistake:
        "から pode soar um pouco direto demais dependendo do tom. Para trabalho e atendimento, ので costuma ser mais polido.",
      phrases: [
        lmPhrase(
          "危{あぶ}ない から、気{き}をつけて ください。",
          "Como é perigoso, por favor tome cuidado.",
          [
            { jp: "危{あぶ}ない", pt: "perigoso" },
            { jp: "気{き}をつけて", pt: "tome cuidado" }
          ]
        ),
        lmPhrase(
          "忙{いそが}しい から、あと で 連絡{れんらく} します。",
          "Como estou ocupado, entro em contato depois.",
          [
            { jp: "忙{いそが}しい", pt: "ocupado" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        lmPhrase(
          "わからない から、もう 一度{いちど} 教{おし}えて ください。",
          "Como eu não entendi, por favor me ensine mais uma vez.",
          [
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" }
          ]
        ),
        lmPhrase(
          "安{やす}い から、これ を 買{か}います。",
          "Como é barato, vou comprar isto.",
          [
            { jp: "安{やす}い", pt: "barato" },
            { jp: "買{か}います", pt: "vou comprar" }
          ]
        ),
        lmPhrase(
          "明日{あした} は 早{はや}い から、今日{きょう} は 早{はや}く 寝{ね}ます。",
          "Como amanhã é cedo, hoje vou dormir cedo.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "寝{ね}ます", pt: "vou dormir" }
          ]
        ),
        lmPhrase(
          "雨{あめ} だから、歩{ある}いて 行{い}きます。",
          "Como está chovendo, vou a pé.",
          [
            { jp: "雨{あめ}", pt: "chuva" },
            { jp: "歩{ある}いて", pt: "andando / a pé" }
          ]
        ),
        lmPhrase(
          "時間{じかん} が ある から、少{すこ}し 練習{れんしゅう} します。",
          "Como tenho tempo, vou praticar um pouco.",
          [
            { jp: "時間{じかん}", pt: "tempo" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    },

    "てもいい": {
      label: "Uso de てもいい",
      kind: "gramática",
      explanation:
        "てもいい é usado para pedir ou dar permissão. Em português: “posso...?” ou “tudo bem se...?”.",
      usage:
        "Muito útil em trabalho, loja, hospital, prefeitura e situações em que você quer agir com educação.",
      commonMistake:
        "Não use só o verbo sozinho quando estiver pedindo permissão. てもいいですか deixa o pedido mais claro e educado.",
      phrases: [
        lmPhrase(
          "ここ に 座{すわ}っても いいですか。",
          "Posso sentar aqui?",
          [
            { jp: "座{すわ}って", pt: "sentar" }
          ]
        ),
        lmPhrase(
          "写真{しゃしん} を 撮{と}っても いいですか。",
          "Posso tirar foto?",
          [
            { jp: "写真{しゃしん}", pt: "foto" },
            { jp: "撮{と}って", pt: "tirar foto" }
          ]
        ),
        lmPhrase(
          "少{すこ}し 休{やす}んでも いいですか。",
          "Posso descansar um pouco?",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "休{やす}んで", pt: "descansar" }
          ]
        ),
        lmPhrase(
          "今日{きょう} は 早{はや}く 帰{かえ}っても いいですか。",
          "Posso ir embora cedo hoje?",
          [
            { jp: "今日{きょう}", pt: "hoje" },
            { jp: "帰{かえ}って", pt: "ir embora / voltar" }
          ]
        ),
        lmPhrase(
          "この ペン を 使{つか}っても いいですか。",
          "Posso usar esta caneta?",
          [
            { jp: "使{つか}って", pt: "usar" }
          ]
        ),
        lmPhrase(
          "あと で 電話{でんわ} しても いいですか。",
          "Posso ligar depois?",
          [
            { jp: "電話{でんわ}", pt: "telefone / ligação" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} を ここ に 置{お}いても いいですか。",
          "Posso deixar este documento aqui?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "置{お}いて", pt: "colocar / deixar" }
          ]
        )
      ]
    }
  };
  Object.assign(LM_GRAMMAR_BANK, {
    "てもらえますか": {
      label: "Uso de てもらえますか",
      kind: "gramática",
      explanation:
        "てもらえますか é uma forma educada de pedir para alguém fazer algo por você. Em português: “você poderia... para mim?”.",
      usage:
        "Use quando precisar pedir ajuda sem parecer mandão. É uma estrutura preciosa no trabalho, hospital, prefeitura e lojas.",
      commonMistake:
        "Evite pedir só com verbo no imperativo. Para soar educado, use てもらえますか ou ていただけますか.",
      phrases: [
        lmPhrase(
          "もう 一度{いちど} 説明{せつめい} して もらえますか。",
          "Você poderia explicar mais uma vez para mim?",
          [
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "説明{せつめい}", pt: "explicação" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} を 見{み}て もらえますか。",
          "Você poderia olhar este documento para mim?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "見{み}て", pt: "ver / olhar" }
          ]
        ),
        lmPhrase(
          "紙{かみ} に 書{か}いて もらえますか。",
          "Você poderia escrever no papel para mim?",
          [
            { jp: "紙{かみ}", pt: "papel" },
            { jp: "書{か}いて", pt: "escrever" }
          ]
        ),
        lmPhrase(
          "少{すこ}し 手伝{てつだ}って もらえますか。",
          "Você poderia me ajudar um pouco?",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "手伝{てつだ}って", pt: "ajudar" }
          ]
        ),
        lmPhrase(
          "確認{かくにん} して もらえますか。",
          "Você poderia verificar para mim?",
          [
            { jp: "確認{かくにん}", pt: "verificação / confirmação" }
          ]
        ),
        lmPhrase(
          "ゆっくり 話{はな}して もらえますか。",
          "Você poderia falar devagar para mim?",
          [
            { jp: "ゆっくり", pt: "devagar" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        ),
        lmPhrase(
          "写真{しゃしん} を 送{おく}って もらえますか。",
          "Você poderia me enviar a foto?",
          [
            { jp: "写真{しゃしん}", pt: "foto" },
            { jp: "送{おく}って", pt: "enviar" }
          ]
        )
      ]
    },

    "ていただけますか": {
      label: "Uso de ていただけますか",
      kind: "gramática",
      explanation:
        "ていただけますか é uma versão mais respeitosa de てもらえますか. Em português: “o senhor poderia...?”.",
      usage:
        "Use com chefe, atendente, médico, prefeitura ou qualquer situação em que você queira soar mais polido.",
      commonMistake:
        "Não precisa usar sempre. Se usar demais em conversa casual, pode soar formal demais. Para trabalho e atendimento, é ótimo.",
      phrases: [
        lmPhrase(
          "もう 一度{いちど} 説明{せつめい} して いただけますか。",
          "O senhor poderia explicar mais uma vez?",
          [
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "いただけますか", pt: "poderia fazer para mim? / forma respeitosa" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} を 確認{かくにん} して いただけますか。",
          "O senhor poderia verificar este documento?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "確認{かくにん}", pt: "verificação" }
          ]
        ),
        lmPhrase(
          "少{すこ}し 待{ま}って いただけますか。",
          "O senhor poderia esperar um pouco?",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "待{ま}って", pt: "esperar" }
          ]
        ),
        lmPhrase(
          "ゆっくり 話{はな}して いただけますか。",
          "O senhor poderia falar devagar?",
          [
            { jp: "ゆっくり", pt: "devagar" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        ),
        lmPhrase(
          "ここ に 書{か}いて いただけますか。",
          "O senhor poderia escrever aqui?",
          [
            { jp: "ここ", pt: "aqui" },
            { jp: "書{か}いて", pt: "escrever" }
          ]
        ),
        lmPhrase(
          "必要{ひつよう} な もの を 教{おし}えて いただけますか。",
          "O senhor poderia me dizer o que é necessário?",
          [
            { jp: "必要{ひつよう}", pt: "necessário" },
            { jp: "教{おし}えて", pt: "ensinar / informar" }
          ]
        ),
        lmPhrase(
          "明日{あした} の 予定{よてい} を 確認{かくにん} して いただけますか。",
          "O senhor poderia confirmar a programação de amanhã?",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "予定{よてい}", pt: "programação / plano" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        )
      ]
    },

    "ないといけない": {
      label: "Uso de ないといけない",
      kind: "gramática",
      explanation:
        "ないといけない indica obrigação: “tenho que...”, “preciso...”. É muito usado na fala cotidiana.",
      usage:
        "Use para falar de tarefas, horários, documentos, trabalho e responsabilidades.",
      commonMistake:
        "Na conversa casual pode virar ないと. Em situações formais, mantenha ないといけません ou ないといけないです.",
      phrases: [
        lmPhrase(
          "今日{きょう} は 早{はや}く 寝{ね}ないといけないです。",
          "Hoje eu tenho que dormir cedo.",
          [
            { jp: "今日{きょう}", pt: "hoje" },
            { jp: "寝{ね}ないといけない", pt: "tenho que dormir" }
          ]
        ),
        lmPhrase(
          "明日{あした}、市役所{しやくしょ} に 行{い}かないといけないです。",
          "Amanhã tenho que ir à prefeitura.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "市役所{しやくしょ}", pt: "prefeitura" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} を 出{だ}さないといけないです。",
          "Tenho que entregar este documento.",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "出{だ}さないといけない", pt: "tenho que entregar" }
          ]
        ),
        lmPhrase(
          "仕事{しごと} の 前{まえ} に 薬{くすり} を 飲{の}まないといけないです。",
          "Tenho que tomar o remédio antes do trabalho.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "薬{くすり}", pt: "remédio" },
            { jp: "飲{の}まないといけない", pt: "tenho que tomar" }
          ]
        ),
        lmPhrase(
          "明日{あした} まで に 連絡{れんらく} しないといけないです。",
          "Tenho que entrar em contato até amanhã.",
          [
            { jp: "明日{あした} まで", pt: "até amanhã" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        lmPhrase(
          "安全{あんぜん} の ため に ヘルメット を かぶらないといけないです。",
          "Por segurança, tenho que usar capacete.",
          [
            { jp: "安全{あんぜん}", pt: "segurança" },
            { jp: "ため に", pt: "para / por causa de" },
            { jp: "ヘルメット", pt: "capacete" }
          ]
        ),
        lmPhrase(
          "日本語{にほんご} を 少{すこ}しずつ 練習{れんしゅう} しないといけないです。",
          "Tenho que praticar japonês aos poucos.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "少{すこ}しずつ", pt: "aos poucos" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    },

    "なければならない": {
      label: "Uso de なければならない",
      kind: "gramática",
      explanation:
        "なければならない também significa obrigação: “deve”, “tem que”. É mais formal que ないといけない.",
      usage:
        "Use em documentos, regras, explicações formais e situações mais sérias.",
      commonMistake:
        "Na fala comum, pode soar formal. Para conversa diária, ないといけない é mais natural.",
      phrases: [
        lmPhrase(
          "この 書類{しょるい} を 提出{ていしゅつ} しなければなりません。",
          "Devo entregar este documento.",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "提出{ていしゅつ}", pt: "entrega / submissão" }
          ]
        ),
        lmPhrase(
          "住所{じゅうしょ} が 変{か}わったら、届{とど}け出{で} なければなりません。",
          "Se o endereço mudar, devo fazer a notificação.",
          [
            { jp: "住所{じゅうしょ}", pt: "endereço" },
            { jp: "変{か}わったら", pt: "se mudar" },
            { jp: "届{とど}け出{で}", pt: "notificação / declaração" }
          ]
        ),
        lmPhrase(
          "安全{あんぜん} ルール を 守{まも}らなければなりません。",
          "Devemos obedecer às regras de segurança.",
          [
            { jp: "安全{あんぜん}", pt: "segurança" },
            { jp: "守{まも}る", pt: "obedecer / proteger" }
          ]
        ),
        lmPhrase(
          "予約{よやく} を キャンセル しなければなりません。",
          "Tenho que cancelar a reserva.",
          [
            { jp: "予約{よやく}", pt: "reserva" },
            { jp: "キャンセル", pt: "cancelamento" }
          ]
        ),
        lmPhrase(
          "期限{きげん} まで に 支払{しはら}わなければなりません。",
          "Tenho que pagar até o prazo.",
          [
            { jp: "期限{きげん}", pt: "prazo" },
            { jp: "支払{しはら}う", pt: "pagar" }
          ]
        ),
        lmPhrase(
          "保険証{ほけんしょう} を 持{も}って 行{い}かなければなりません。",
          "Tenho que levar o cartão do seguro de saúde.",
          [
            { jp: "保険証{ほけんしょう}", pt: "cartão do seguro de saúde" },
            { jp: "持{も}って 行{い}く", pt: "levar" }
          ]
        ),
        lmPhrase(
          "会社{かいしゃ} に 報告{ほうこく} しなければなりません。",
          "Tenho que informar a empresa.",
          [
            { jp: "会社{かいしゃ}", pt: "empresa" },
            { jp: "報告{ほうこく}", pt: "relato / comunicação" }
          ]
        )
      ]
    },

    "たほうがいい": {
      label: "Uso de たほうがいい",
      kind: "gramática",
      explanation:
        "たほうがいい significa “é melhor fazer...”. Serve para conselho, sugestão e orientação.",
      usage:
        "Use quando quiser aconselhar ou receber conselho de forma natural.",
      commonMistake:
        "Cuidado para não soar mandão. Em japonês, o tom e o contexto importam muito.",
      phrases: [
        lmPhrase(
          "早{はや}く 寝{ね}た ほうが いいです。",
          "É melhor dormir cedo.",
          [
            { jp: "早{はや}く", pt: "cedo" },
            { jp: "寝{ね}た", pt: "dormiu / dormir" }
          ]
        ),
        lmPhrase(
          "病院{びょういん} に 行{い}った ほうが いいです。",
          "É melhor ir ao hospital.",
          [
            { jp: "病院{びょういん}", pt: "hospital" },
            { jp: "行{い}った", pt: "foi / ir" }
          ]
        ),
        lmPhrase(
          "もう 一度{いちど} 確認{かくにん} した ほうが いいです。",
          "É melhor verificar mais uma vez.",
          [
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "確認{かくにん}", pt: "verificação" }
          ]
        ),
        lmPhrase(
          "雨{あめ} なので、傘{かさ} を 持{も}って 行{い}った ほうが いいです。",
          "Como está chovendo, é melhor levar guarda-chuva.",
          [
            { jp: "雨{あめ}", pt: "chuva" },
            { jp: "傘{かさ}", pt: "guarda-chuva" }
          ]
        ),
        lmPhrase(
          "わからない 時{とき} は、すぐ 聞{き}いた ほうが いいです。",
          "Quando não entender, é melhor perguntar logo.",
          [
            { jp: "時{とき}", pt: "quando / momento" },
            { jp: "聞{き}いた", pt: "perguntou / perguntar" }
          ]
        ),
        lmPhrase(
          "この 薬{くすり} は 食後{しょくご} に 飲{の}んだ ほうが いいです。",
          "É melhor tomar este remédio depois da refeição.",
          [
            { jp: "薬{くすり}", pt: "remédio" },
            { jp: "食後{しょくご}", pt: "depois da refeição" }
          ]
        ),
        lmPhrase(
          "大事{だいじ} な こと は メモ した ほうが いいです。",
          "É melhor anotar coisas importantes.",
          [
            { jp: "大事{だいじ}", pt: "importante" },
            { jp: "メモ", pt: "anotação" }
          ]
        )
      ]
    },

    "ことができる": {
      label: "Uso de ことができる",
      kind: "gramática",
      explanation:
        "ことができる indica capacidade ou possibilidade: “conseguir fazer”, “poder fazer”.",
      usage:
        "Use para falar do que você consegue fazer ou do que é possível fazer em determinado lugar.",
      commonMistake:
        "Na fala diária, muitas vezes a forma potencial do verbo é mais natural, mas ことができる é claro e educado.",
      phrases: [
        lmPhrase(
          "日本語{にほんご} を 少{すこ}し 話{はな}す こと が できます。",
          "Consigo falar um pouco de japonês.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "話{はな}す", pt: "falar" }
          ]
        ),
        lmPhrase(
          "ここ で 支払{しはら}う こと が できますか。",
          "É possível pagar aqui?",
          [
            { jp: "支払{しはら}う", pt: "pagar" }
          ]
        ),
        lmPhrase(
          "この アプリ で 毎日{まいにち} 練習{れんしゅう} する こと が できます。",
          "Com este app, é possível praticar todos os dias.",
          [
            { jp: "毎日{まいにち}", pt: "todos os dias" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        ),
        lmPhrase(
          "今日{きょう}、予約{よやく} する こと が できますか。",
          "É possível fazer reserva hoje?",
          [
            { jp: "今日{きょう}", pt: "hoje" },
            { jp: "予約{よやく}", pt: "reserva" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} を コピー する こと が できますか。",
          "É possível tirar cópia deste documento?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "コピー", pt: "cópia" }
          ]
        ),
        lmPhrase(
          "明日{あした}、休{やす}む こと が できますか。",
          "É possível folgar amanhã?",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "休{やす}む", pt: "folgar / descansar" }
          ]
        ),
        lmPhrase(
          "カード で 払{はら}う こと が できます。",
          "É possível pagar com cartão.",
          [
            { jp: "カード", pt: "cartão" },
            { jp: "払{はら}う", pt: "pagar" }
          ]
        )
      ]
    }
  });

  Object.assign(LM_GRAMMAR_BANK, {
    "かどうか": {
      label: "Uso de かどうか",
      kind: "gramática",
      explanation:
        "かどうか significa “se... ou não”. Use quando quiser confirmar uma informação.",
      usage:
        "Excelente para confirmar se algo está correto, se pode usar, se precisa reservar, se tem hora extra ou se o documento serve.",
      commonMistake:
        "Não confunda com か sozinho. かどうか deixa claro que você está perguntando “se sim ou se não”.",
      phrases: [
        lmPhrase(
          "この カード が 使{つか}える かどうか 確認{かくにん} して ください。",
          "Por favor, confirme se este cartão pode ser usado.",
          [
            { jp: "使{つか}える", pt: "pode usar" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        ),
        lmPhrase(
          "今日{きょう} 残業{ざんぎょう} が ある かどうか 知{し}りたいです。",
          "Quero saber se hoje vai ter hora extra.",
          [
            { jp: "残業{ざんぎょう}", pt: "hora extra" },
            { jp: "知{し}りたい", pt: "quero saber" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} で 大丈夫{だいじょうぶ} かどうか 見{み}て もらえますか。",
          "Você poderia ver se este documento está certo?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / correto" }
          ]
        ),
        lmPhrase(
          "予約{よやく} が 必要{ひつよう} かどうか 教{おし}えて ください。",
          "Por favor, me diga se é necessário reservar.",
          [
            { jp: "予約{よやく}", pt: "reserva" },
            { jp: "必要{ひつよう}", pt: "necessário" }
          ]
        ),
        lmPhrase(
          "この 電車{でんしゃ} が 福井{ふくい} に 行{い}く かどうか 知{し}りたいです。",
          "Quero saber se este trem vai para Fukui.",
          [
            { jp: "電車{でんしゃ}", pt: "trem" },
            { jp: "福井{ふくい}", pt: "Fukui" },
            { jp: "行{い}く", pt: "ir" }
          ]
        ),
        lmPhrase(
          "明日{あした} 休{やす}める かどうか まだ わかりません。",
          "Ainda não sei se posso folgar amanhã.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "休{やす}める", pt: "poder folgar" }
          ]
        ),
        lmPhrase(
          "この 商品{しょうひん} が まだ ある かどうか 聞{き}いて みます。",
          "Vou tentar perguntar se este produto ainda tem.",
          [
            { jp: "商品{しょうひん}", pt: "produto" },
            { jp: "聞{き}いて みます", pt: "vou tentar perguntar" }
          ]
        )
      ]
    },

    "と思います": {
      label: "Uso de と思います",
      kind: "gramática",
      explanation:
        "と思います significa “acho que...” ou “penso que...”. Ajuda a dar opinião de forma educada e menos dura.",
      usage:
        "Use para expressar opinião, impressão, previsão ou resposta sem parecer definitivo demais.",
      commonMistake:
        "Não use para fatos totalmente óbvios quando você quer afirmar com certeza. É mais para opinião ou percepção.",
      phrases: [
        lmPhrase(
          "これ で 大丈夫{だいじょうぶ} だ と 思{おも}います。",
          "Acho que assim está tudo bem.",
          [
            { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / correto" },
            { jp: "思{おも}います", pt: "acho / penso" }
          ]
        ),
        lmPhrase(
          "明日{あした} は 雨{あめ} が 降{ふ}る と 思{おも}います。",
          "Acho que amanhã vai chover.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "雨{あめ}", pt: "chuva" },
            { jp: "降{ふ}る", pt: "chover" }
          ]
        ),
        lmPhrase(
          "この 作業{さぎょう} は 少{すこ}し 難{むずか}しい と 思{おも}います。",
          "Acho que este trabalho é um pouco difícil.",
          [
            { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
            { jp: "難{むずか}しい", pt: "difícil" }
          ]
        ),
        lmPhrase(
          "この 方法{ほうほう} の ほう が いい と 思{おも}います。",
          "Acho que este método é melhor.",
          [
            { jp: "方法{ほうほう}", pt: "método" },
            { jp: "ほう が いい", pt: "é melhor" }
          ]
        ),
        lmPhrase(
          "時間{じかん} が 足{た}りない と 思{おも}います。",
          "Acho que o tempo não é suficiente.",
          [
            { jp: "時間{じかん}", pt: "tempo" },
            { jp: "足{た}りない", pt: "não é suficiente" }
          ]
        ),
        lmPhrase(
          "この 説明{せつめい} は わかりやすい と 思{おも}います。",
          "Acho que esta explicação é fácil de entender.",
          [
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "わかりやすい", pt: "fácil de entender" }
          ]
        ),
        lmPhrase(
          "日本語{にほんご} は 少{すこ}しずつ 上手{じょうず} に なる と 思{おも}います。",
          "Acho que meu japonês vai melhorar aos poucos.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "少{すこ}しずつ", pt: "aos poucos" },
            { jp: "上手{じょうず}", pt: "habilidoso / bom" }
          ]
        )
      ]
    },

    "かもしれません": {
      label: "Uso de かもしれません",
      kind: "gramática",
      explanation:
        "かもしれません significa “talvez”, “pode ser que...”. É usado quando você não tem certeza total.",
      usage:
        "Use para falar de possibilidade, atraso, problema, sintomas ou previsão com cuidado.",
      commonMistake:
        "Não use quando você tem certeza. Para certeza, use formas mais diretas como です ou と思います dependendo do caso.",
      phrases: [
        lmPhrase(
          "少{すこ}し 遅{おく}れる かもしれません。",
          "Talvez eu me atrase um pouco.",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "遅{おく}れる", pt: "atrasar" }
          ]
        ),
        lmPhrase(
          "明日{あした} は 雨{あめ} かもしれません。",
          "Talvez amanhã chova.",
          [
            { jp: "明日{あした}", pt: "amanhã" },
            { jp: "雨{あめ}", pt: "chuva" }
          ]
        ),
        lmPhrase(
          "この 部品{ぶひん} は 違{ちが}う かもしれません。",
          "Talvez esta peça esteja errada.",
          [
            { jp: "部品{ぶひん}", pt: "peça" },
            { jp: "違{ちが}う", pt: "diferente / errado" }
          ]
        ),
        lmPhrase(
          "熱{ねつ} が ある かもしれません。",
          "Talvez eu esteja com febre.",
          [
            { jp: "熱{ねつ}", pt: "febre" }
          ]
        ),
        lmPhrase(
          "今日{きょう} は 残業{ざんぎょう} に なる かもしれません。",
          "Talvez hoje vire hora extra.",
          [
            { jp: "今日{きょう}", pt: "hoje" },
            { jp: "残業{ざんぎょう}", pt: "hora extra" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} が 必要{ひつよう} かもしれません。",
          "Talvez este documento seja necessário.",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "必要{ひつよう}", pt: "necessário" }
          ]
        ),
        lmPhrase(
          "電話{でんわ} した ほう が いい かもしれません。",
          "Talvez seja melhor ligar.",
          [
            { jp: "電話{でんわ}", pt: "telefone / ligação" },
            { jp: "ほう が いい", pt: "é melhor" }
          ]
        )
      ]
    },

    "ようにしています": {
      label: "Uso de ようにしています",
      kind: "gramática",
      explanation:
        "ようにしています indica um hábito ou esforço consciente: “procuro fazer...”, “tenho tentado fazer...”.",
      usage:
        "Use para falar de rotina, disciplina, cuidado com saúde, estudo e trabalho.",
      commonMistake:
        "Não é apenas “faço”. Mostra que você tenta manter aquilo como hábito.",
      phrases: [
        lmPhrase(
          "毎日{まいにち} 日本語{にほんご} を 聞{き}く ようにしています。",
          "Procuro ouvir japonês todos os dias.",
          [
            { jp: "毎日{まいにち}", pt: "todos os dias" },
            { jp: "聞{き}く", pt: "ouvir" }
          ]
        ),
        lmPhrase(
          "仕事{しごと} の 前{まえ} に 水{みず} を 飲{の}む ようにしています。",
          "Procuro beber água antes do trabalho.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "水{みず}", pt: "água" },
            { jp: "飲{の}む", pt: "beber" }
          ]
        ),
        lmPhrase(
          "わからない 時{とき} は、すぐ 聞{き}く ようにしています。",
          "Quando não entendo, procuro perguntar logo.",
          [
            { jp: "時{とき}", pt: "quando / momento" },
            { jp: "聞{き}く", pt: "perguntar / ouvir" }
          ]
        ),
        lmPhrase(
          "大事{だいじ} な こと は メモ する ようにしています。",
          "Procuro anotar coisas importantes.",
          [
            { jp: "大事{だいじ}", pt: "importante" },
            { jp: "メモ", pt: "anotação" }
          ]
        ),
        lmPhrase(
          "夜{よる} は 早{はや}く 寝{ね}る ようにしています。",
          "À noite, procuro dormir cedo.",
          [
            { jp: "夜{よる}", pt: "noite" },
            { jp: "寝{ね}る", pt: "dormir" }
          ]
        ),
        lmPhrase(
          "安全{あんぜん} の ため に、必{かなら}ず 確認{かくにん} する ようにしています。",
          "Por segurança, procuro sempre confirmar.",
          [
            { jp: "安全{あんぜん}", pt: "segurança" },
            { jp: "必{かなら}ず", pt: "sem falta / sempre" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        ),
        lmPhrase(
          "少{すこ}しずつ 話{はな}す 練習{れんしゅう} を する ようにしています。",
          "Procuro praticar fala aos poucos.",
          [
            { jp: "少{すこ}しずつ", pt: "aos poucos" },
            { jp: "話{はな}す", pt: "falar" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    },

    "ために": {
      label: "Uso de ために",
      kind: "gramática",
      explanation:
        "ために significa “para”, “com o objetivo de” ou “por causa de”, dependendo do contexto.",
      usage:
        "Use para falar de objetivo, motivo, segurança, saúde, trabalho e preparação.",
      commonMistake:
        "Quando for objetivo, a ideia é “para fazer algo”. Quando for causa, o contexto precisa deixar isso claro.",
      phrases: [
        lmPhrase(
          "日本語{にほんご} を 話{はな}せる ように なる ために、毎日{まいにち} 練習{れんしゅう} します。",
          "Para conseguir falar japonês, pratico todos os dias.",
          [
            { jp: "話{はな}せる", pt: "conseguir falar" },
            { jp: "毎日{まいにち}", pt: "todos os dias" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        ),
        lmPhrase(
          "安全{あんぜん} の ために、ヘルメット を かぶって ください。",
          "Por segurança, por favor use capacete.",
          [
            { jp: "安全{あんぜん}", pt: "segurança" },
            { jp: "ヘルメット", pt: "capacete" }
          ]
        ),
        lmPhrase(
          "仕事{しごと} の ために、早{はや}く 寝{ね}ます。",
          "Por causa do trabalho, vou dormir cedo.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "寝{ね}ます", pt: "vou dormir" }
          ]
        ),
        lmPhrase(
          "確認{かくにん} の ために、もう 一度{いちど} 聞{き}きます。",
          "Para confirmar, vou perguntar mais uma vez.",
          [
            { jp: "確認{かくにん}", pt: "confirmação" },
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "聞{き}きます", pt: "vou perguntar / ouvir" }
          ]
        ),
        lmPhrase(
          "健康{けんこう} の ために、少{すこ}し 歩{ある}いて います。",
          "Pela saúde, estou caminhando um pouco.",
          [
            { jp: "健康{けんこう}", pt: "saúde" },
            { jp: "歩{ある}いて", pt: "andando" }
          ]
        ),
        lmPhrase(
          "勉強{べんきょう} の ために、この アプリ を 使{つか}って います。",
          "Para estudar, estou usando este app.",
          [
            { jp: "勉強{べんきょう}", pt: "estudo" },
            { jp: "使{つか}って", pt: "usando" }
          ]
        ),
        lmPhrase(
          "遅刻{ちこく} しない ために、早{はや}く 出{で}ます。",
          "Para não me atrasar, vou sair cedo.",
          [
            { jp: "遅刻{ちこく}", pt: "atraso" },
            { jp: "出{で}ます", pt: "vou sair" }
          ]
        )
      ]
    }
  });
  Object.assign(LM_GRAMMAR_BANK, {
    "ながら": {
      label: "Uso de ながら",
      kind: "gramática",
      explanation:
        "ながら indica duas ações acontecendo ao mesmo tempo. Em português: “enquanto faço...”.",
      usage:
        "Use para falar de rotina, estudo, trabalho leve e ações simultâneas.",
      commonMistake:
        "O sujeito das duas ações geralmente é o mesmo. Evite usar quando duas pessoas diferentes fazem ações diferentes.",
      phrases: [
        lmPhrase(
          "音声{おんせい} を 聞{き}きながら、発音{はつおん} を 練習{れんしゅう} します。",
          "Enquanto escuto o áudio, pratico a pronúncia.",
          [
            { jp: "音声{おんせい}", pt: "áudio" },
            { jp: "聞{き}きながら", pt: "enquanto escuto" },
            { jp: "発音{はつおん}", pt: "pronúncia" }
          ]
        ),
        lmPhrase(
          "歩{ある}きながら、日本語{にほんご} を 聞{き}いて います。",
          "Estou ouvindo japonês enquanto caminho.",
          [
            { jp: "歩{ある}きながら", pt: "enquanto caminho" },
            { jp: "日本語{にほんご}", pt: "japonês" }
          ]
        ),
        lmPhrase(
          "メモ を 見{み}ながら、話{はな}しても いいですか。",
          "Posso falar olhando as anotações?",
          [
            { jp: "メモ", pt: "anotação" },
            { jp: "見{み}ながら", pt: "enquanto vejo" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        ),
        lmPhrase(
          "説明{せつめい} を 聞{き}きながら、確認{かくにん} します。",
          "Vou confirmar enquanto escuto a explicação.",
          [
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        ),
        lmPhrase(
          "仕事{しごと} を しながら、日本語{にほんご} を 少{すこ}しずつ 覚{おぼ}えています。",
          "Enquanto trabalho, estou aprendendo japonês aos poucos.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "少{すこ}しずつ", pt: "aos poucos" },
            { jp: "覚{おぼ}えています", pt: "estou memorizando / aprendendo" }
          ]
        ),
        lmPhrase(
          "地図{ちず} を 見{み}ながら、駅{えき} まで 行{い}きます。",
          "Vou até a estação olhando o mapa.",
          [
            { jp: "地図{ちず}", pt: "mapa" },
            { jp: "駅{えき}", pt: "estação" }
          ]
        ),
        lmPhrase(
          "動画{どうが} を 見{み}ながら、使{つか}い方{かた} を 覚{おぼ}えます。",
          "Vou aprender o modo de usar enquanto vejo o vídeo.",
          [
            { jp: "動画{どうが}", pt: "vídeo" },
            { jp: "使{つか}い方{かた}", pt: "modo de usar" },
            { jp: "覚{おぼ}えます", pt: "vou memorizar / aprender" }
          ]
        )
      ]
    },

    "前に": {
      label: "Uso de 前に",
      kind: "gramática",
      explanation:
        "前に significa “antes de”. Use para falar de ordem das ações.",
      usage:
        "Muito útil para rotina: antes do trabalho, antes de sair, antes de tomar remédio, antes de entregar documento.",
      commonMistake:
        "Antes de verbo, normalmente use a forma dicionário: 行く前に, 食べる前に, 出す前に.",
      phrases: [
        lmPhrase(
          "仕事{しごと} に 行{い}く 前{まえ} に、ご飯{はん} を 食{た}べます。",
          "Antes de ir ao trabalho, eu como.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "前{まえ} に", pt: "antes de" },
            { jp: "食{た}べます", pt: "como" }
          ]
        ),
        lmPhrase(
          "薬{くすり} を 飲{の}む 前{まえ} に、水{みず} を 用意{ようい} します。",
          "Antes de tomar o remédio, preparo água.",
          [
            { jp: "薬{くすり}", pt: "remédio" },
            { jp: "水{みず}", pt: "água" },
            { jp: "用意{ようい}", pt: "preparação" }
          ]
        ),
        lmPhrase(
          "出{で}かける 前{まえ} に、天気{てんき} を 確認{かくにん} します。",
          "Antes de sair, confirmo o tempo.",
          [
            { jp: "出{で}かける", pt: "sair" },
            { jp: "天気{てんき}", pt: "tempo / clima" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        ),
        lmPhrase(
          "書類{しょるい} を 出{だ}す 前{まえ} に、もう 一度{いちど} 見{み}ます。",
          "Antes de entregar o documento, vou olhar mais uma vez.",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "出{だ}す", pt: "entregar" },
            { jp: "一度{いちど}", pt: "uma vez" }
          ]
        ),
        lmPhrase(
          "寝{ね}る 前{まえ} に、少{すこ}し 日本語{にほんご} を 聞{き}きます。",
          "Antes de dormir, escuto um pouco de japonês.",
          [
            { jp: "寝{ね}る", pt: "dormir" },
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "聞{き}きます", pt: "escuto" }
          ]
        ),
        lmPhrase(
          "買{か}う 前{まえ} に、値段{ねだん} を 確認{かくにん} します。",
          "Antes de comprar, confirmo o preço.",
          [
            { jp: "買{か}う", pt: "comprar" },
            { jp: "値段{ねだん}", pt: "preço" }
          ]
        ),
        lmPhrase(
          "予約{よやく} する 前{まえ} に、時間{じかん} を 確認{かくにん} したいです。",
          "Antes de reservar, quero confirmar o horário.",
          [
            { jp: "予約{よやく}", pt: "reserva" },
            { jp: "時間{じかん}", pt: "horário / tempo" }
          ]
        )
      ]
    },

    "後で": {
      label: "Uso de 後で",
      kind: "gramática",
      explanation:
        "後で significa “depois”. Use para dizer que fará algo mais tarde.",
      usage:
        "Muito comum para avisar que vai confirmar, ligar, enviar, estudar ou resolver depois.",
      commonMistake:
        "後で é mais geral. Depois de uma ação específica, também aparece como 〜た後で.",
      phrases: [
        lmPhrase(
          "あと で 連絡{れんらく} します。",
          "Entro em contato depois.",
          [
            { jp: "あと で", pt: "depois" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        lmPhrase(
          "仕事{しごと} の 後{あと} で、買{か}い物{もの} に 行{い}きます。",
          "Depois do trabalho, vou fazer compras.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "買{か}い物{もの}", pt: "compras" }
          ]
        ),
        lmPhrase(
          "確認{かくにん} した 後{あと} で、返事{へんじ} します。",
          "Depois de confirmar, respondo.",
          [
            { jp: "確認{かくにん}", pt: "confirmação" },
            { jp: "返事{へんじ}", pt: "resposta" }
          ]
        ),
        lmPhrase(
          "ご飯{はん} を 食{た}べた 後{あと} で、薬{くすり} を 飲{の}みます。",
          "Depois de comer, tomo o remédio.",
          [
            { jp: "ご飯{はん}", pt: "refeição / arroz" },
            { jp: "薬{くすり}", pt: "remédio" }
          ]
        ),
        lmPhrase(
          "家{いえ} に 帰{かえ}った 後{あと} で、日本語{にほんご} を 練習{れんしゅう} します。",
          "Depois de voltar para casa, pratico japonês.",
          [
            { jp: "家{いえ}", pt: "casa" },
            { jp: "帰{かえ}った", pt: "voltou" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        ),
        lmPhrase(
          "説明{せつめい} を 聞{き}いた 後{あと} で、やって みます。",
          "Depois de ouvir a explicação, vou tentar fazer.",
          [
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "聞{き}いた", pt: "ouviu" },
            { jp: "やって みます", pt: "vou tentar fazer" }
          ]
        ),
        lmPhrase(
          "電話{でんわ} の 後{あと} で、メッセージ を 送{おく}ります。",
          "Depois da ligação, envio mensagem.",
          [
            { jp: "電話{でんわ}", pt: "telefone / ligação" },
            { jp: "送{おく}ります", pt: "envio" }
          ]
        )
      ]
    },

    "時": {
      label: "Uso de 時",
      kind: "gramática",
      explanation:
        "時 significa “quando” ou “no momento em que”. É uma das estruturas mais úteis do japonês.",
      usage:
        "Use para falar de situações: quando não entende, quando vai ao hospital, quando chega atrasado, quando trabalha.",
      commonMistake:
        "Preste atenção ao tempo verbal antes de 時: 行く時 e 行った時 podem mudar o sentido.",
      phrases: [
        lmPhrase(
          "わからない 時{とき} は、聞{き}いて ください。",
          "Quando não entender, por favor pergunte.",
          [
            { jp: "時{とき}", pt: "quando / momento" },
            { jp: "聞{き}いて", pt: "pergunte / escute" }
          ]
        ),
        lmPhrase(
          "困{こま}った 時{とき} は、連絡{れんらく} して ください。",
          "Quando tiver problema, por favor entre em contato.",
          [
            { jp: "困{こま}った", pt: "em dificuldade / com problema" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        lmPhrase(
          "病院{びょういん} に 行{い}く 時{とき} は、保険証{ほけんしょう} を 持{も}って 行{い}きます。",
          "Quando vou ao hospital, levo o cartão do seguro de saúde.",
          [
            { jp: "病院{びょういん}", pt: "hospital" },
            { jp: "保険証{ほけんしょう}", pt: "cartão do seguro de saúde" }
          ]
        ),
        lmPhrase(
          "仕事{しごと} の 時{とき} は、安全{あんぜん} に 気{き}をつけます。",
          "Durante o trabalho, tomo cuidado com a segurança.",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "安全{あんぜん}", pt: "segurança" },
            { jp: "気{き}をつけます", pt: "tomo cuidado" }
          ]
        ),
        lmPhrase(
          "遅{おく}れる 時{とき} は、先{さき}に 連絡{れんらく} します。",
          "Quando vou me atrasar, aviso antes.",
          [
            { jp: "遅{おく}れる", pt: "atrasar" },
            { jp: "先{さき}に", pt: "antes / antecipadamente" }
          ]
        ),
        lmPhrase(
          "買{か}い物{もの} の 時{とき} は、値段{ねだん} を よく 見{み}ます。",
          "Na hora das compras, olho bem o preço.",
          [
            { jp: "買{か}い物{もの}", pt: "compras" },
            { jp: "値段{ねだん}", pt: "preço" }
          ]
        ),
        lmPhrase(
          "疲{つか}れた 時{とき} は、無理{むり} しない ようにしています。",
          "Quando estou cansado, procuro não forçar.",
          [
            { jp: "疲{つか}れた", pt: "cansado" },
            { jp: "無理{むり} しない", pt: "não forçar" }
          ]
        )
      ]
    },

    "もし": {
      label: "Uso de もし",
      kind: "gramática",
      explanation:
        "もし indica hipótese: “se...”. É usado quando você imagina uma possibilidade.",
      usage:
        "Use para planos, problemas, emergência, atraso ou confirmação de possibilidades.",
      commonMistake:
        "もし costuma combinar com formas condicionais como たら, なら, ても.",
      phrases: [
        lmPhrase(
          "もし 遅{おく}れたら、連絡{れんらく} します。",
          "Se eu me atrasar, entro em contato.",
          [
            { jp: "もし", pt: "se" },
            { jp: "遅{おく}れたら", pt: "se atrasar" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        lmPhrase(
          "もし わからなかったら、もう 一度{いちど} 聞{き}きます。",
          "Se eu não entender, vou perguntar mais uma vez.",
          [
            { jp: "わからなかったら", pt: "se não entender" },
            { jp: "一度{いちど}", pt: "uma vez" }
          ]
        ),
        lmPhrase(
          "もし 熱{ねつ} が 出{で}たら、病院{びょういん} に 行{い}きます。",
          "Se der febre, vou ao hospital.",
          [
            { jp: "熱{ねつ}", pt: "febre" },
            { jp: "病院{びょういん}", pt: "hospital" }
          ]
        ),
        lmPhrase(
          "もし 必要{ひつよう} なら、写真{しゃしん} を 送{おく}ります。",
          "Se for necessário, envio uma foto.",
          [
            { jp: "必要{ひつよう}", pt: "necessário" },
            { jp: "写真{しゃしん}", pt: "foto" },
            { jp: "送{おく}ります", pt: "envio" }
          ]
        ),
        lmPhrase(
          "もし 時間{じかん} が あれば、練習{れんしゅう} します。",
          "Se eu tiver tempo, vou praticar.",
          [
            { jp: "時間{じかん}", pt: "tempo" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        ),
        lmPhrase(
          "もし 雨{あめ} なら、自転車{じてんしゃ} では 行{い}きません。",
          "Se chover, não vou de bicicleta.",
          [
            { jp: "雨{あめ}", pt: "chuva" },
            { jp: "自転車{じてんしゃ}", pt: "bicicleta" }
          ]
        ),
        lmPhrase(
          "もし 間違{まちが}い が あったら、教{おし}えて ください。",
          "Se houver erro, por favor me avise.",
          [
            { jp: "間違{まちが}い", pt: "erro" },
            { jp: "教{おし}えて", pt: "ensinar / avisar" }
          ]
        )
      ]
    },

    "けど": {
      label: "Uso de けど",
      kind: "gramática",
      explanation:
        "けど significa “mas”, “porém” ou serve para suavizar uma frase antes de pedir algo.",
      usage:
        "Muito usado em conversa natural. Ajuda a explicar contexto antes de fazer uma pergunta ou pedido.",
      commonMistake:
        "けど é natural, mas pode ser casual. Em contexto mais formal, が pode soar mais polido.",
      phrases: [
        lmPhrase(
          "すみません、ちょっと わからない んですけど。",
          "Com licença, eu não entendi muito bem.",
          [
            { jp: "ちょっと", pt: "um pouco" },
            { jp: "わからない", pt: "não entendo" },
            { jp: "んですけど", pt: "é que... / suaviza a frase" }
          ]
        ),
        lmPhrase(
          "聞{き}きたい こと が ある んですけど。",
          "Eu queria perguntar uma coisa.",
          [
            { jp: "聞{き}きたい", pt: "quero perguntar" },
            { jp: "こと", pt: "coisa / assunto" }
          ]
        ),
        lmPhrase(
          "この 書類{しょるい} なんですけど、ここ で 大丈夫{だいじょうぶ} ですか。",
          "Sobre este documento, aqui está certo?",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / correto" }
          ]
        ),
        lmPhrase(
          "予約{よやく} したい んですけど、今日{きょう} は 空{あ}いて いますか。",
          "Eu queria fazer uma reserva, hoje tem horário livre?",
          [
            { jp: "予約{よやく}", pt: "reserva" },
            { jp: "空{あ}いて いますか", pt: "está livre?" }
          ]
        ),
        lmPhrase(
          "少{すこ}し 体調{たいちょう} が 悪{わる}い んですけど、休{やす}んでも いいですか。",
          "Estou me sentindo um pouco mal, posso descansar?",
          [
            { jp: "体調{たいちょう}", pt: "condição física" },
            { jp: "休{やす}んでも いい", pt: "pode descansar" }
          ]
        ),
        lmPhrase(
          "駅{えき} に 行{い}きたい んですけど、道{みち} を 教{おし}えて ください。",
          "Quero ir à estação, por favor me ensine o caminho.",
          [
            { jp: "駅{えき}", pt: "estação" },
            { jp: "道{みち}", pt: "caminho" },
            { jp: "教{おし}えて", pt: "ensinar / informar" }
          ]
        ),
        lmPhrase(
          "日本語{にほんご} は 難{むずか}しい けど、少{すこ}しずつ 練習{れんしゅう} します。",
          "Japonês é difícil, mas vou praticar aos poucos.",
          [
            { jp: "難{むずか}しい", pt: "difícil" },
            { jp: "少{すこ}しずつ", pt: "aos poucos" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    },

    "やってみる": {
      label: "Uso de やってみる",
      kind: "gramática",
      explanation:
        "やってみる significa “tentar fazer”. Mostra que você vai experimentar ou tentar executar algo.",
      usage:
        "Perfeito para trabalho, estudo, instruções e situações em que você ainda não tem certeza.",
      commonMistake:
        "Não confunda com apenas やる. やってみる tem a nuance de tentar para ver se consegue.",
      phrases: [
        lmPhrase(
          "一度{いちど} やって みます。",
          "Vou tentar fazer uma vez.",
          [
            { jp: "一度{いちど}", pt: "uma vez" },
            { jp: "やって みます", pt: "vou tentar fazer" }
          ]
        ),
        lmPhrase(
          "説明{せつめい} を 聞{き}いて から、やって みます。",
          "Depois de ouvir a explicação, vou tentar fazer.",
          [
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "聞{き}いて", pt: "ouvir" }
          ]
        ),
        lmPhrase(
          "この 方法{ほうほう} で やって みても いいですか。",
          "Posso tentar fazer deste jeito?",
          [
            { jp: "方法{ほうほう}", pt: "método / jeito" },
            { jp: "ても いいですか", pt: "posso?" }
          ]
        ),
        lmPhrase(
          "わからない けど、少{すこ}し やって みます。",
          "Não entendi, mas vou tentar um pouco.",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "けど", pt: "mas / suaviza contexto" }
          ]
        ),
        lmPhrase(
          "もう 一回{いっかい} やって みます。",
          "Vou tentar mais uma vez.",
          [
            { jp: "一回{いっかい}", pt: "uma vez" }
          ]
        ),
        lmPhrase(
          "日本語{にほんご} で 言{い}って みます。",
          "Vou tentar falar em japonês.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "言{い}って みます", pt: "vou tentar dizer" }
          ]
        ),
        lmPhrase(
          "この アプリ で 毎日{まいにち} 練習{れんしゅう} して みます。",
          "Vou tentar praticar todos os dias com este app.",
          [
            { jp: "毎日{まいにち}", pt: "todos os dias" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    }
  });

  /* =========================================================
     4. BANCO-MESTRE DE SITUAÇÕES REAIS
     ========================================================= */

  const LM_SCENARIO_BANK = {
    "fabrica": {
      label: "Fábrica",
      tags: ["fabrica", "fábrica", "trabalho", "maquina", "máquina", "peca", "peça", "linha", "produção", "producao", "murata", "作業", "機械", "部品"],
      explanation:
        "Frases para rotina de fábrica: instruções, máquina, peça, tarefa, confirmação e hora extra.",
      usage:
        "Use frases curtas e educadas para evitar erro de trabalho e confirmar antes de fazer.",
      phrases: [
        lmPhrase(
          "この 作業{さぎょう} を もう 一度{いちど} 教{おし}えて ください。",
          "Por favor, me ensine este trabalho mais uma vez.",
          [
            { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
            { jp: "一度{いちど}", pt: "uma vez" }
          ]
        ),
        lmPhrase(
          "次{つぎ} は 何{なに} を すれば いいですか。",
          "O que eu devo fazer em seguida?",
          [
            { jp: "次{つぎ}", pt: "próximo / em seguida" },
            { jp: "何{なに}", pt: "o que" }
          ]
        ),
        lmPhrase(
          "この 機械{きかい} が 止{と}まりました。",
          "Esta máquina parou.",
          [
            { jp: "機械{きかい}", pt: "máquina" },
            { jp: "止{と}まりました", pt: "parou" }
          ]
        ),
        lmPhrase(
          "確認{かくにん} して もらえますか。",
          "Você poderia verificar para mim?",
          [
            { jp: "確認{かくにん}", pt: "verificação" }
          ]
        ),
        lmPhrase(
          "やり方{かた} が まだ よく わかりません。",
          "Ainda não entendi bem o modo de fazer.",
          [
            { jp: "やり方{かた}", pt: "modo de fazer" },
            { jp: "まだ", pt: "ainda" }
          ]
        ),
        lmPhrase(
          "この 部品{ぶひん} は どこ に 置{お}きますか。",
          "Onde eu coloco esta peça?",
          [
            { jp: "部品{ぶひん}", pt: "peça" },
            { jp: "置{お}きます", pt: "coloco" }
          ]
        ),
        lmPhrase(
          "今日{きょう} は 残業{ざんぎょう} が ありますか。",
          "Hoje vai ter hora extra?",
          [
            { jp: "今日{きょう}", pt: "hoje" },
            { jp: "残業{ざんぎょう}", pt: "hora extra" }
          ]
        )
      ]
    },

    "chefe": {
      label: "Chefe / líder",
      tags: ["chefe", "lider", "líder", "supervisor", "encarregado", "empresa", "上司", "リーダー"],
      explanation:
        "Frases para falar com chefe, líder ou supervisor com educação e segurança.",
      usage:
        "Use para confirmar tarefa, pedir explicação, avisar problema ou falar de condição física.",
      phrases: [
        lmPhrase(
          "この 内容{ないよう} で 合{あ}って いますか。",
          "Está correto assim?",
          [
            { jp: "内容{ないよう}", pt: "conteúdo / instrução" },
            { jp: "合{あ}って いますか", pt: "está correto?" }
          ]
        ),
        lmPhrase(
          "もう 少{すこ}し ゆっくり お願{ねが}いします。",
          "Mais devagar, por favor.",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "ゆっくり", pt: "devagar" }
          ]
        ),
        lmPhrase(
          "この 作業{さぎょう} は 初{はじ}めて です。",
          "É a primeira vez que faço este trabalho.",
          [
            { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
            { jp: "初{はじ}めて", pt: "primeira vez" }
          ]
        ),
        lmPhrase(
          "もう 一度{いちど} 説明{せつめい} して いただけますか。",
          "O senhor poderia explicar mais uma vez?",
          [
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "いただけますか", pt: "poderia fazer para mim? / respeitoso" }
          ]
        ),
        lmPhrase(
          "終{お}わったら 報告{ほうこく} します。",
          "Quando terminar, eu aviso.",
          [
            { jp: "終{お}わったら", pt: "quando terminar" },
            { jp: "報告{ほうこく}", pt: "relato / aviso" }
          ]
        ),
        lmPhrase(
          "少{すこ}し 体調{たいちょう} が 悪{わる}いです。",
          "Estou me sentindo um pouco mal.",
          [
            { jp: "体調{たいちょう}", pt: "condição física" },
            { jp: "悪{わる}い", pt: "ruim" }
          ]
        ),
        lmPhrase(
          "間違{まちが}い が ない か 確認{かくにん} します。",
          "Vou confirmar se não há erro.",
          [
            { jp: "間違{まちが}い", pt: "erro" },
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        )
      ]
    },

    "hospital": {
      label: "Hospital",
      tags: ["hospital", "medico", "médico", "consulta", "dor", "febre", "remedio", "remédio", "garganta", "cabeça", "病院", "薬", "熱"],
      explanation:
        "Frases para explicar sintomas, pedir ajuda e confirmar remédios ou orientação médica.",
      usage:
        "Use frases simples. Em caso grave, procure ajuda imediata, intérprete ou emergência.",
      phrases: [
        lmPhrase(
          "昨日{きのう} から 熱{ねつ} が あります。",
          "Estou com febre desde ontem.",
          [
            { jp: "昨日{きのう}", pt: "ontem" },
            { jp: "熱{ねつ}", pt: "febre" }
          ]
        ),
        lmPhrase(
          "のど が 痛{いた}いです。",
          "Estou com dor de garganta.",
          [
            { jp: "のど", pt: "garganta" },
            { jp: "痛{いた}い", pt: "dói / dolorido" }
          ]
        ),
        lmPhrase(
          "頭{あたま} が 痛{いた}くて、少{すこ}し 気持{きも}ち 悪{わる}いです。",
          "Estou com dor de cabeça e um pouco enjoado.",
          [
            { jp: "頭{あたま}", pt: "cabeça" },
            { jp: "気持{きも}ち 悪{わる}い", pt: "enjoado / passando mal" }
          ]
        ),
        lmPhrase(
          "薬{くすり} は いつ 飲{の}めば いいですか。",
          "Quando devo tomar o remédio?",
          [
            { jp: "薬{くすり}", pt: "remédio" },
            { jp: "飲{の}めば いい", pt: "devo tomar" }
          ]
        ),
        lmPhrase(
          "仕事{しごと} に 行{い}っても 大丈夫{だいじょうぶ} ですか。",
          "Tudo bem eu ir trabalhar?",
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / sem problema" }
          ]
        ),
        lmPhrase(
          "通訳{つうやく} は ありますか。",
          "Tem intérprete?",
          [
            { jp: "通訳{つうやく}", pt: "intérprete" }
          ]
        ),
        lmPhrase(
          "保険証{ほけんしょう} を 持{も}って います。",
          "Estou com o cartão do seguro de saúde.",
          [
            { jp: "保険証{ほけんしょう}", pt: "cartão do seguro de saúde" },
            { jp: "持{も}って います", pt: "tenho comigo / estou com" }
          ]
        )
      ]
    }
  };

  Object.assign(LM_SCENARIO_BANK, {
    "prefeitura": {
      label: "Prefeitura",
      tags: ["prefeitura", "documento", "residencia", "residência", "zairyu", "my number", "mynumber", "endereco", "endereço", "市役所", "書類", "在留"],
      explanation:
        "Frases para prefeitura, documentos, formulários, senha de atendimento e confirmação de balcão.",
      usage:
        "Use quando precisar perguntar com calma, confirmar documentos e pedir explicação.",
      phrases: [
        lmPhrase(
          "この 書類{しょるい} の 書{か}き方{かた} を 教{おし}えて ください。",
          "Por favor, me ensine como preencher este documento.",
          [
            { jp: "書類{しょるい}", pt: "documento" },
            { jp: "書{か}き方{かた}", pt: "forma de escrever / preencher" }
          ]
        ),
        lmPhrase(
          "必要{ひつよう} な もの は 何{なに} ですか。",
          "O que é necessário trazer?",
          [
            { jp: "必要{ひつよう}", pt: "necessário" },
            { jp: "何{なに}", pt: "o que" }
          ]
        ),
        lmPhrase(
          "この 手続{てつづ}き は 今日中{きょうじゅう} に 終{お}わりますか。",
          "Este procedimento termina ainda hoje?",
          [
            { jp: "手続{てつづ}き", pt: "procedimento" },
            { jp: "今日中{きょうじゅう}", pt: "ainda hoje" }
          ]
        ),
        lmPhrase(
          "番号札{ばんごうふだ} は どこ で 取{と}りますか。",
          "Onde pego a senha de atendimento?",
          [
            { jp: "番号札{ばんごうふだ}", pt: "senha de atendimento" },
            { jp: "取{と}りますか", pt: "pego?" }
          ]
        ),
        lmPhrase(
          "在留{ざいりゅう} カード の コピー は 必要{ひつよう} ですか。",
          "É necessária uma cópia do cartão de residência?",
          [
            { jp: "在留{ざいりゅう} カード", pt: "cartão de residência" },
            { jp: "必要{ひつよう}", pt: "necessário" }
          ]
        ),
        lmPhrase(
          "通訳{つうやく} を お願{ねが}いできますか。",
          "É possível pedir um intérprete?",
          [
            { jp: "通訳{つうやく}", pt: "intérprete" },
            { jp: "お願{ねが}いできますか", pt: "é possível pedir?" }
          ]
        ),
        lmPhrase(
          "この 窓口{まどぐち} で 合{あ}って いますか。",
          "Este balcão está correto?",
          [
            { jp: "窓口{まどぐち}", pt: "balcão / guichê" },
            { jp: "合{あ}って いますか", pt: "está correto?" }
          ]
        )
      ]
    },

    "mercado": {
      label: "Mercado",
      tags: ["mercado", "supermercado", "preco", "preço", "produto", "validade", "sacola", "cartao", "cartão", "商品", "賞味期限", "袋"],
      explanation:
        "Frases para compras, validade, desconto, pagamento, sacola e localização de produto.",
      usage:
        "Use frases curtas para perguntar sem travar na frente do atendente ou no caixa.",
      phrases: [
        lmPhrase(
          "この 商品{しょうひん} は どこ に ありますか。",
          "Onde fica este produto?",
          [
            { jp: "商品{しょうひん}", pt: "produto" },
            { jp: "どこ", pt: "onde" }
          ]
        ),
        lmPhrase(
          "賞味期限{しょうみきげん} は いつ ですか。",
          "Qual é a data de validade?",
          [
            { jp: "賞味期限{しょうみきげん}", pt: "data de validade" }
          ]
        ),
        lmPhrase(
          "袋{ふくろ} は 要{い}りません。",
          "Não preciso de sacola.",
          [
            { jp: "袋{ふくろ}", pt: "sacola" },
            { jp: "要{い}りません", pt: "não preciso" }
          ]
        ),
        lmPhrase(
          "カード で 払{はら}えますか。",
          "Posso pagar com cartão?",
          [
            { jp: "カード", pt: "cartão" },
            { jp: "払{はら}えますか", pt: "posso pagar?" }
          ]
        ),
        lmPhrase(
          "安{やす}い 方{ほう} は どちら ですか。",
          "Qual é a opção mais barata?",
          [
            { jp: "安{やす}い", pt: "barato" },
            { jp: "方{ほう}", pt: "opção / lado" }
          ]
        ),
        lmPhrase(
          "この 商品{しょうひん} は 売{う}り切{き}れ ですか。",
          "Este produto está esgotado?",
          [
            { jp: "売{う}り切{き}れ", pt: "esgotado" }
          ]
        ),
        lmPhrase(
          "セルフレジ は 使{つか}えますか。",
          "Posso usar o caixa automático?",
          [
            { jp: "セルフレジ", pt: "caixa automático" },
            { jp: "使{つか}えますか", pt: "posso usar?" }
          ]
        )
      ]
    },

    "konbini": {
      label: "Konbini",
      tags: ["konbini", "conveniencia", "conveniência", "loja de conveniencia", "loja de conveniência", "コンビニ", "レジ", "弁当"],
      explanation:
        "Frases úteis para loja de conveniência: caixa, pagamento, marmita, micro-ondas, sacola e serviços.",
      usage:
        "Use frases rápidas e educadas. No konbini, clareza vale ouro em horário de pressa.",
      phrases: [
        lmPhrase(
          "これ を 温{あたた}めて ください。",
          "Por favor, esquente isto.",
          [
            { jp: "温{あたた}めて", pt: "esquentar" }
          ]
        ),
        lmPhrase(
          "袋{ふくろ} は 要{い}りません。",
          "Não preciso de sacola.",
          [
            { jp: "袋{ふくろ}", pt: "sacola" },
            { jp: "要{い}りません", pt: "não preciso" }
          ]
        ),
        lmPhrase(
          "レシート を ください。",
          "Por favor, me dê o recibo.",
          [
            { jp: "レシート", pt: "recibo" }
          ]
        ),
        lmPhrase(
          "カード で 払{はら}います。",
          "Vou pagar com cartão.",
          [
            { jp: "カード", pt: "cartão" },
            { jp: "払{はら}います", pt: "vou pagar" }
          ]
        ),
        lmPhrase(
          "公共料金{こうきょうりょうきん} を 払{はら}いたいです。",
          "Quero pagar conta de serviço público.",
          [
            { jp: "公共料金{こうきょうりょうきん}", pt: "conta de serviço público" },
            { jp: "払{はら}いたい", pt: "quero pagar" }
          ]
        ),
        lmPhrase(
          "宅急便{たっきゅうびん} を 出{だ}したいです。",
          "Quero enviar uma encomenda.",
          [
            { jp: "宅急便{たっきゅうびん}", pt: "serviço de entrega / encomenda" },
            { jp: "出{だ}したい", pt: "quero enviar / despachar" }
          ]
        ),
        lmPhrase(
          "箸{はし} を つけて ください。",
          "Por favor, coloque hashis.",
          [
            { jp: "箸{はし}", pt: "hashi / palitinhos" }
          ]
        )
      ]
    },

    "correio": {
      label: "Correio",
      tags: ["correio", "yu-pack", "yupack", "encomenda", "pacote", "carta", "endereco", "endereço", "郵便局", "荷物", "住所"],
      explanation:
        "Frases para enviar encomenda, preencher endereço, confirmar valor, prazo e tipo de entrega.",
      usage:
        "Use para pedir ajuda com formulário, endereço e envio sem depender de improviso.",
      phrases: [
        lmPhrase(
          "この 荷物{にもつ} を 送{おく}りたいです。",
          "Quero enviar esta encomenda.",
          [
            { jp: "荷物{にもつ}", pt: "encomenda / bagagem" },
            { jp: "送{おく}りたい", pt: "quero enviar" }
          ]
        ),
        lmPhrase(
          "住所{じゅうしょ} の 書{か}き方{かた} を 教{おし}えて ください。",
          "Por favor, me ensine como escrever o endereço.",
          [
            { jp: "住所{じゅうしょ}", pt: "endereço" },
            { jp: "書{か}き方{かた}", pt: "forma de escrever" }
          ]
        ),
        lmPhrase(
          "送料{そうりょう} は いくら ですか。",
          "Quanto custa o frete?",
          [
            { jp: "送料{そうりょう}", pt: "frete" }
          ]
        ),
        lmPhrase(
          "いつ 届{とど}きますか。",
          "Quando chega?",
          [
            { jp: "届{とど}きますか", pt: "chega? / será entregue?" }
          ]
        ),
        lmPhrase(
          "追跡番号{ついせきばんごう} は ありますか。",
          "Tem código de rastreamento?",
          [
            { jp: "追跡番号{ついせきばんごう}", pt: "código de rastreamento" }
          ]
        ),
        lmPhrase(
          "この 箱{はこ} で 送{おく}れますか。",
          "Dá para enviar com esta caixa?",
          [
            { jp: "箱{はこ}", pt: "caixa" },
            { jp: "送{おく}れますか", pt: "pode enviar?" }
          ]
        ),
        lmPhrase(
          "着払{ちゃくばら}い で 送{おく}れますか。",
          "É possível enviar com pagamento na entrega?",
          [
            { jp: "着払{ちゃくばら}い", pt: "pagamento pelo destinatário / na entrega" },
            { jp: "送{おく}れますか", pt: "pode enviar?" }
          ]
        )
      ]
    },

    "bicicleta": {
      label: "Bicicleta",
      tags: ["bicicleta", "bike", "pneu", "corrente", "freio", "banco", "selim", "conserto", "自転車", "パンク", "チェーン"],
      explanation:
        "Frases para loja de bicicletas, pneu furado, corrente, freio, banco e conserto.",
      usage:
        "Use para explicar o problema rapidamente e pedir orçamento antes do conserto.",
      phrases: [
        lmPhrase(
          "自転車{じてんしゃ} の タイヤ が パンク しました。",
          "O pneu da bicicleta furou.",
          [
            { jp: "自転車{じてんしゃ}", pt: "bicicleta" },
            { jp: "タイヤ", pt: "pneu" },
            { jp: "パンク", pt: "pneu furado" }
          ]
        ),
        lmPhrase(
          "チェーン が 外{はず}れました。",
          "A corrente saiu.",
          [
            { jp: "チェーン", pt: "corrente" },
            { jp: "外{はず}れました", pt: "saiu / soltou" }
          ]
        ),
        lmPhrase(
          "修理{しゅうり} は いくら ですか。",
          "Quanto custa o conserto?",
          [
            { jp: "修理{しゅうり}", pt: "conserto / reparo" }
          ]
        ),
        lmPhrase(
          "ブレーキ の 調子{ちょうし} が 悪{わる}いです。",
          "O freio não está bom.",
          [
            { jp: "ブレーキ", pt: "freio" },
            { jp: "調子{ちょうし}", pt: "condição / funcionamento" },
            { jp: "悪{わる}い", pt: "ruim" }
          ]
        ),
        lmPhrase(
          "サドル を 交換{こうかん} したいです。",
          "Quero trocar o banco da bicicleta.",
          [
            { jp: "サドル", pt: "selim / banco da bicicleta" },
            { jp: "交換{こうかん}", pt: "troca" }
          ]
        ),
        lmPhrase(
          "今日中{きょうじゅう} に 直{なお}りますか。",
          "Fica pronto ainda hoje?",
          [
            { jp: "今日中{きょうじゅう}", pt: "ainda hoje" },
            { jp: "直{なお}りますか", pt: "fica consertado?" }
          ]
        ),
        lmPhrase(
          "見積{みつ}もり を お願{ねが}いします。",
          "Por favor, faça um orçamento.",
          [
            { jp: "見積{みつ}もり", pt: "orçamento" },
            { jp: "お願{ねが}いします", pt: "por favor" }
          ]
        )
      ]
    },

    "moradia": {
      label: "Moradia / aluguel",
      tags: ["moradia", "aluguel", "apartamento", "leopalace", "vazamento", "chave", "ar condicionado", "aircon", "エアコン", "鍵", "水漏れ"],
      explanation:
        "Frases para apartamento, reparo, vazamento, chave, ar-condicionado e administradora.",
      usage:
        "Use para explicar problema na casa de forma clara e educada.",
      phrases: [
        lmPhrase(
          "水漏{みずも}れ して います。",
          "Está vazando água.",
          [
            { jp: "水漏{みずも}れ", pt: "vazamento de água" }
          ]
        ),
        lmPhrase(
          "修理{しゅうり} を お願{ねが}いしたいです。",
          "Quero solicitar um reparo.",
          [
            { jp: "修理{しゅうり}", pt: "reparo / conserto" }
          ]
        ),
        lmPhrase(
          "いつ 来{き}て もらえますか。",
          "Quando alguém pode vir aqui?",
          [
            { jp: "来{き}て もらえますか", pt: "pode vir?" }
          ]
        ),
        lmPhrase(
          "エアコン が 動{うご}きません。",
          "O ar-condicionado não funciona.",
          [
            { jp: "エアコン", pt: "ar-condicionado" },
            { jp: "動{うご}きません", pt: "não funciona" }
          ]
        ),
        lmPhrase(
          "鍵{かぎ} を なくしました。",
          "Perdi a chave.",
          [
            { jp: "鍵{かぎ}", pt: "chave" },
            { jp: "なくしました", pt: "perdi" }
          ]
        ),
        lmPhrase(
          "管理会社{かんりがいしゃ} に 連絡{れんらく} したいです。",
          "Quero entrar em contato com a administradora.",
          [
            { jp: "管理会社{かんりがいしゃ}", pt: "administradora" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        lmPhrase(
          "写真{しゃしん} を 送{おく}れば いいですか。",
          "Está certo eu enviar uma foto?",
          [
            { jp: "写真{しゃしん}", pt: "foto" },
            { jp: "送{おく}れば", pt: "se enviar" }
          ]
        )
      ]
    },

    "transporte": {
      label: "Transporte",
      tags: ["trem", "onibus", "ônibus", "estacao", "estação", "atraso", "passagem", "電車", "駅", "バス", "遅れ"],
      explanation:
        "Frases para trem, ônibus, estação, atraso, destino, horário e passagem.",
      usage:
        "Use para confirmar rota, horário e destino sem depender de gestos ou adivinhação.",
      phrases: [
        lmPhrase(
          "次{つぎ} の 電車{でんしゃ} は 何時{なんじ} ですか。",
          "Que horas é o próximo trem?",
          [
            { jp: "次{つぎ}", pt: "próximo" },
            { jp: "電車{でんしゃ}", pt: "trem" },
            { jp: "何時{なんじ}", pt: "que horas" }
          ]
        ),
        lmPhrase(
          "この 電車{でんしゃ} は 福井{ふくい} に 行{い}きますか。",
          "Este trem vai para Fukui?",
          [
            { jp: "電車{でんしゃ}", pt: "trem" },
            { jp: "福井{ふくい}", pt: "Fukui" },
            { jp: "行{い}きますか", pt: "vai?" }
          ]
        ),
        lmPhrase(
          "駅{えき} は どこ ですか。",
          "Onde fica a estação?",
          [
            { jp: "駅{えき}", pt: "estação" }
          ]
        ),
        lmPhrase(
          "電車{でんしゃ} が 遅{おく}れて います。",
          "O trem está atrasado.",
          [
            { jp: "電車{でんしゃ}", pt: "trem" },
            { jp: "遅{おく}れて います", pt: "está atrasado" }
          ]
        ),
        lmPhrase(
          "どこ で 乗{の}り換{か}えますか。",
          "Onde faço baldeação?",
          [
            { jp: "乗{の}り換{か}え", pt: "troca de trem/ônibus / baldeação" }
          ]
        ),
        lmPhrase(
          "切符{きっぷ} は どこ で 買{か}えますか。",
          "Onde posso comprar a passagem?",
          [
            { jp: "切符{きっぷ}", pt: "passagem / bilhete" },
            { jp: "買{か}えますか", pt: "posso comprar?" }
          ]
        ),
        lmPhrase(
          "この バス は 駅{えき} まで 行{い}きますか。",
          "Este ônibus vai até a estação?",
          [
            { jp: "バス", pt: "ônibus" },
            { jp: "駅{えき}", pt: "estação" }
          ]
        )
      ]
    },

    "telefone": {
      label: "Telefone / internet",
      tags: ["telefone", "internet", "chip", "sim", "plano", "gb", "celular", "スマホ", "携帯", "インターネット"],
      explanation:
        "Frases para chip, plano de internet, dados, pagamento, contrato e suporte.",
      usage:
        "Use em loja de celular ou atendimento para confirmar plano, preço e detalhes antes de contratar.",
      phrases: [
        lmPhrase(
          "プリペイド SIM は ありますか。",
          "Tem chip pré-pago?",
          [
            { jp: "プリペイド", pt: "pré-pago" },
            { jp: "SIM", pt: "chip / SIM" }
          ]
        ),
        lmPhrase(
          "月{つき} に いくら ですか。",
          "Quanto custa por mês?",
          [
            { jp: "月{つき}", pt: "mês" }
          ]
        ),
        lmPhrase(
          "30GB の プラン は ありますか。",
          "Tem plano de 30GB?",
          [
            { jp: "プラン", pt: "plano" }
          ]
        ),
        lmPhrase(
          "契約{けいやく} に 必要{ひつよう} な もの は 何{なに} ですか。",
          "O que é necessário para o contrato?",
          [
            { jp: "契約{けいやく}", pt: "contrato" },
            { jp: "必要{ひつよう}", pt: "necessário" }
          ]
        ),
        lmPhrase(
          "解約{かいやく} する 時{とき}、料金{りょうきん} は かかりますか。",
          "Na hora de cancelar, tem taxa?",
          [
            { jp: "解約{かいやく}", pt: "cancelamento de contrato" },
            { jp: "料金{りょうきん}", pt: "taxa / valor" }
          ]
        ),
        lmPhrase(
          "インターネット が つながりません。",
          "A internet não conecta.",
          [
            { jp: "インターネット", pt: "internet" },
            { jp: "つながりません", pt: "não conecta" }
          ]
        ),
        lmPhrase(
          "この プラン は いつ から 使{つか}えますか。",
          "A partir de quando posso usar este plano?",
          [
            { jp: "プラン", pt: "plano" },
            { jp: "使{つか}えますか", pt: "posso usar?" }
          ]
        )
      ]
    }
  });

  /* =========================================================
     5. DETECÇÃO DE SITUAÇÃO
     ========================================================= */

  function lmDetectScenarioKey(payload) {
    const raw = `${payload?.request || ""} ${payload?.theme || ""} ${payload?.topic || ""}`;
    const n = lmNormalize(raw);

    let bestKey = "";
    let bestScore = 0;

    Object.entries(LM_SCENARIO_BANK).forEach(([key, item]) => {
      let score = 0;

      (item.tags || []).forEach(tag => {
        const tagN = lmNormalize(tag);
        if (tagN && n.includes(tagN)) score += tagN.length >= 5 ? 3 : 2;
      });

      if (n.includes(lmNormalize(item.label))) score += 3;

      if (score > bestScore) {
        bestScore = score;
        bestKey = key;
      }
    });

    if (bestKey) return bestKey;

    if (/chefe|lider|líder|supervisor|encarregado/.test(n)) return "chefe";
    if (/fabrica|fábrica|maquina|máquina|peca|peça|trabalho/.test(n)) return "fabrica";
    if (/hospital|dor|febre|remedio|remédio|consulta/.test(n)) return "hospital";
    if (/prefeitura|documento|zairyu|my number|mynumber/.test(n)) return "prefeitura";
    if (/mercado|produto|preco|preço|validade/.test(n)) return "mercado";
    if (/konbini|conveniencia|conveniência/.test(n)) return "konbini";
    if (/correio|encomenda|yu pack|yupack/.test(n)) return "correio";
    if (/bicicleta|bike|pneu|corrente|freio/.test(n)) return "bicicleta";
    if (/moradia|aluguel|apartamento|leopalace|vazamento/.test(n)) return "moradia";
    if (/trem|onibus|ônibus|estacao|estação|transporte/.test(n)) return "transporte";
    if (/telefone|internet|chip|plano|celular/.test(n)) return "telefone";

    return "fabrica";
  }

  function lmUniversalFallbackPhrases() {
    return [
      lmPhrase(
        "すみません。少{すこ}し 手伝{てつだ}って もらえますか。",
        "Com licença. Você poderia me ajudar um pouco?",
        [
          { jp: "少{すこ}し", pt: "um pouco" },
          { jp: "手伝{てつだ}って", pt: "ajudar" }
        ]
      ),
      lmPhrase(
        "日本語{にほんご} が まだ 苦手{にがて} なので、ゆっくり 話{はな}して ください。",
        "Como ainda tenho dificuldade com japonês, por favor fale devagar.",
        [
          { jp: "日本語{にほんご}", pt: "japonês" },
          { jp: "苦手{にがて}", pt: "dificuldade / não ser bom em algo" },
          { jp: "話{はな}して", pt: "falar" }
        ]
      ),
      lmPhrase(
        "もう 一度{いちど} 説明{せつめい} して もらえますか。",
        "Você poderia explicar mais uma vez para mim?",
        [
          { jp: "一度{いちど}", pt: "uma vez" },
          { jp: "説明{せつめい}", pt: "explicação" }
        ]
      ),
      lmPhrase(
        "紙{かみ} に 書{か}いて もらえますか。",
        "Você poderia escrever no papel para mim?",
        [
          { jp: "紙{かみ}", pt: "papel" },
          { jp: "書{か}いて", pt: "escrever" }
        ]
      ),
      lmPhrase(
        "この 内容{ないよう} で 合{あ}って いますか。",
        "Está correto assim?",
        [
          { jp: "内容{ないよう}", pt: "conteúdo" },
          { jp: "合{あ}って いますか", pt: "está correto?" }
        ]
      ),
      lmPhrase(
        "あと で 確認{かくにん} して、連絡{れんらく} します。",
        "Vou confirmar depois e entro em contato.",
        [
          { jp: "確認{かくにん}", pt: "confirmação" },
          { jp: "連絡{れんらく}", pt: "contato" }
        ]
      ),
      lmPhrase(
        "今{いま} は まだ よく わかりません。",
        "Agora eu ainda não entendi bem.",
        [
          { jp: "今{いま}", pt: "agora" },
          { jp: "まだ", pt: "ainda" },
          { jp: "わかりません", pt: "não entendo" }
        ]
      )
    ];
  }
  /* =========================================================
   6. CONSTRUÇÃO DE PACKS DO SENSEI LOCAL MASTER
   ========================================================= */

  function lmBuildCoachLine(pack, meta = {}) {
    const parts = [];

    parts.push(`Tipo detectado: ${meta.intent === "grammar" ? "gramática / estrutura" : "situação real"}.`);

    if (meta.term) parts.push(`Termo principal: ${meta.term}.`);
    if (meta.scenarioLabel) parts.push(`Contexto: ${meta.scenarioLabel}.`);

    if (pack.explanation) parts.push(pack.explanation);
    if (pack.usage) parts.push(`Uso prático: ${pack.usage}`);
    if (pack.commonMistake) parts.push(`Cuidado comum: ${pack.commonMistake}`);

    parts.push(`Nível: ${lmLevelLabel(meta.level)}.`);
    parts.push(`Tom: ${lmToneLabel(meta.tone)}.`);
    parts.push("Treino recomendado: escolha 1 frase por dia e repita no método 105x.");

    return parts.join(" ");
  }

  function lmBuildUnknownGrammarPack(term, payload = {}) {
    const safeTerm = String(term || "esta expressão").trim();

    return {
      label: `Uso de ${safeTerm}`,
      kind: "palavra-alvo",
      explanation:
        `O Sensei Local Master detectou “${safeTerm}” como foco do pedido. Ainda não existe um banco completo para esse termo, então ele criou um material seguro para estudo, pergunta e treino.`,
      usage:
        "Use estas frases para pedir explicação, confirmar significado, pedir exemplos naturais e transformar o termo em material treinável.",
      commonMistake:
        "Quando o termo ainda não está no banco, confirme com um nativo, professor ou fonte confiável antes de usar em situação séria.",
      phrases: [
        lmPhrase(
          `この 表現{ひょうげん}「${safeTerm}」の 使{つか}い方{かた} を 教{おし}えて ください。`,
          `Por favor, me ensine como usar a expressão “${safeTerm}”.`,
          [
            { jp: "表現{ひょうげん}", pt: "expressão" },
            { jp: "使{つか}い方{かた}", pt: "modo de usar" },
            { jp: "教{おし}えて", pt: "ensinar / explicar" }
          ]
        ),
        lmPhrase(
          `「${safeTerm}」は どういう 意味{いみ} ですか。`,
          `O que significa “${safeTerm}”?`,
          [
            { jp: "意味{いみ}", pt: "significado" }
          ]
        ),
        lmPhrase(
          `「${safeTerm}」を 使{つか}った 例文{れいぶん} を 作{つく}って もらえますか。`,
          `Você poderia criar uma frase de exemplo usando “${safeTerm}”?`,
          [
            { jp: "例文{れいぶん}", pt: "frase de exemplo" },
            { jp: "作{つく}って", pt: "criar / fazer" }
          ]
        ),
        lmPhrase(
          `「${safeTerm}」は 日常会話{にちじょうかいわ} で よく 使{つか}いますか。`,
          `“${safeTerm}” é muito usado na conversa do dia a dia?`,
          [
            { jp: "日常会話{にちじょうかいわ}", pt: "conversa do dia a dia" },
            { jp: "使{つか}いますか", pt: "usa?" }
          ]
        ),
        lmPhrase(
          `仕事{しごと} で「${safeTerm}」を 使{つか}う 例{れい} を 教{おし}えて ください。`,
          `Por favor, me ensine um exemplo usando “${safeTerm}” no trabalho.`,
          [
            { jp: "仕事{しごと}", pt: "trabalho" },
            { jp: "例{れい}", pt: "exemplo" }
          ]
        ),
        lmPhrase(
          `「${safeTerm}」の もっと 自然{しぜん} な 言{い}い方{かた} は ありますか。`,
          `Existe uma forma mais natural de dizer “${safeTerm}”?`,
          [
            { jp: "自然{しぜん}", pt: "natural" },
            { jp: "言{い}い方{かた}", pt: "modo de dizer" }
          ]
        ),
        lmPhrase(
          `「${safeTerm}」を 使{つか}って、日本語{にほんご} を 練習{れんしゅう} します。`,
          `Vou praticar japonês usando “${safeTerm}”.`,
          [
            { jp: "日本語{にほんご}", pt: "japonês" },
            { jp: "練習{れんしゅう}", pt: "prática" }
          ]
        )
      ]
    };
  }

  function lmBuildGrammarPack(payload = {}) {
    const term = lmDetectTargetTerm(payload);
    const wantedCount = lmDetectRequestCount(`${payload.request || ""} ${payload.theme || ""}`);
    const base = LM_GRAMMAR_BANK[term] || lmBuildUnknownGrammarPack(term || "日本語", payload);

    const phrases = lmEnsureSeven(base.phrases, (i) => {
      const fallback = lmBuildUnknownGrammarPack(term || "日本語", payload);
      return fallback.phrases[i % fallback.phrases.length];
    }).slice(0, Math.max(7, Math.min(wantedCount, 12)));

    const title = base.label || `Uso de ${term}`;
    const topicName = lmTopicName(title);

    const meta = {
      intent: "grammar",
      term,
      level: payload.level || "iniciante",
      tone: payload.tone || "educado"
    };

    return {
      scenario: "grammar",
      requestType: "grammar",
      engine: "local-master-6a",
      expertEngine: "6A Zero Cost",
      confidence: LM_GRAMMAR_BANK[term] ? "alta" : "fallback",
      term,
      title,
      topicName,
      explanation: base.explanation,
      usage: base.usage,
      commonMistake: base.commonMistake,
      goal: "Treine 1 frase por dia. Em 7 dias, você terá um primeiro domínio prático desta estrutura.",
      coachLine: lmBuildCoachLine(base, meta),
      phrases,
      createdAt: lmNow()
    };
  }

  function lmBuildScenarioPack(payload = {}) {
    const key = lmDetectScenarioKey(payload);
    const base = LM_SCENARIO_BANK[key] || LM_SCENARIO_BANK.fabrica;
    const wantedCount = lmDetectRequestCount(`${payload.request || ""} ${payload.theme || ""}`);

    const phrases = lmEnsureSeven(base.phrases, (i) => {
      const fallback = lmUniversalFallbackPhrases();
      return fallback[i % fallback.length];
    }).slice(0, Math.max(7, Math.min(wantedCount, 12)));

    const title = base.label || "Situação real";
    const topicName = lmTopicName(title);

    const meta = {
      intent: "scenario",
      scenarioLabel: title,
      level: payload.level || "iniciante",
      tone: payload.tone || "educado"
    };

    return {
      scenario: key,
      requestType: "scenario",
      engine: "local-master-6a",
      expertEngine: "6A Zero Cost",
      confidence: "alta",
      term: "",
      title,
      topicName,
      explanation: base.explanation,
      usage: base.usage,
      commonMistake: base.commonMistake || "",
      goal: "Escolha 1 frase útil para hoje, salve o material e revise no treino 105x.",
      coachLine: lmBuildCoachLine(base, meta),
      phrases,
      createdAt: lmNow()
    };
  }

  function lmNormalizePayload(args) {
    const first = args[0];

    if (first && typeof first === "object") {
      return {
        request: first.request || first.prompt || first.text || first.input || "",
        theme: first.theme || first.topic || first.topicName || "",
        level: first.level || "iniciante",
        tone: first.tone || "educado"
      };
    }

    return {
      request: String(args[0] || ""),
      theme: String(args[1] || ""),
      level: String(args[2] || "iniciante"),
      tone: String(args[3] || "educado")
    };
  }

  function lmBuildLocalMasterPack(payload = {}) {
    const intent = lmDetectIntent(payload);

    if (intent === "grammar") {
      return lmBuildGrammarPack(payload);
    }

    return lmBuildScenarioPack(payload);
  }

  /* =========================================================
     7. RENDERIZAÇÃO DO RESULTADO
     ========================================================= */

  function lmTopicOptions(pack) {
    const topics = lmGetTopics();

    return [
      `<option value="AUTO_CREATE">criar novo tópico: ${lmEscape(pack.topicName || "Sensei IA")}</option>`,
      ...topics.map(t => {
        let lock = "";

        try {
          lock = typeof isTopicPremium === "function" && isTopicPremium(t.id) ? " 🔒" : "";
        } catch { }

        return `
          <option value="${lmEscape(t.id)}">
            ${lmEscape(t.name)}${lock} • ${lmTopicPhraseCount(t.id)} frases
          </option>
        `;
      })
    ].join("");
  }

  function lmRenderOutputFallback(pack) {
    const box = document.querySelector("#senseiOutput");
    if (!box) return;

    const phrases = Array.isArray(pack.phrases) ? pack.phrases : [];

    box.innerHTML = `
      <div class="sheet stack" style="text-align:left">
        <div class="row row--between">
          <div class="badge">Sensei Local Master</div>
          <div class="badge">${lmEscape(pack.confidence || "local")}</div>
        </div>

        <h3 style="margin:0">${lmEscape(pack.title || pack.topicName || "Material do Sensei IA")}</h3>

        <div class="small"><b>Explicação:</b> ${lmEscape(pack.explanation || "")}</div>
        <div class="small"><b>Como usar no Japão:</b> ${lmEscape(pack.usage || "")}</div>
        ${pack.commonMistake ? `<div class="small"><b>Cuidado comum:</b> ${lmEscape(pack.commonMistake)}</div>` : ""}
        <div class="small"><b>Meta:</b> ${lmEscape(pack.goal || "")}</div>
        <div class="small">${lmEscape(pack.coachLine || "")}</div>
      </div>

      ${phrases.map((p, i) => `
        <div class="sheet stack" style="text-align:left">
          <div class="row row--between">
            <div class="badge">frase ${i + 1}</div>
            <button class="btn btn--ghost" type="button" data-say="${lmEscape(lmStripFuri(p.jp))}">ouvir</button>
          </div>

          <div class="small"><b>JP:</b> ${lmEscape(lmStripFuri(p.jp))}</div>
          <div class="small"><b>PT:</b> ${lmEscape(p.pt)}</div>

          ${(Array.isArray(p.newWords) && p.newWords.length) ? `
            <div class="small" style="font-weight:900;margin-top:6px">palavras importantes</div>
            ${p.newWords.map(w => `
              <div class="small">${lmEscape(lmFormatWord(w))}</div>
            `).join("")}
          ` : ""}
        </div>
      `).join("")}

      <div class="sheet stack" style="text-align:left">
        <div class="row row--between">
          <div class="badge">salvar material</div>
          <div class="badge">custo zero</div>
        </div>

        <div class="lockCard">
          <h3 class="lockTitle">Transformar em treino 105x</h3>
          <p class="lockText">
            Salve este material em um tópico novo ou dentro de um tópico existente.
          </p>
        </div>

        <div>
          <div class="small">salvar em</div>
          <select id="senseiSaveTopicSel" class="btn selectBtn" style="width:100%">
            ${lmTopicOptions(pack)}
          </select>
        </div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" data-action="saveSenseiPack">salvar neste tópico</button>
          <button class="btn btn--full" data-nav="#/105x">ir ao treino</button>
        </div>
      </div>
    `;

    box.dataset.pack = JSON.stringify(pack);
  }

  function lmRenderSenseiOutput(pack) {
    const safePack = pack && Array.isArray(pack.phrases)
      ? pack
      : lmBuildScenarioPack({
        request: "criar frases úteis",
        theme: "Material prático",
        level: "iniciante",
        tone: "educado"
      });

    const enhanced = {
      ...safePack,
      topicName: safePack.topicName || lmTopicName(safePack.title || "Sensei IA"),
      phrases: lmEnsureSeven(safePack.phrases, (i) => lmUniversalFallbackPhrases()[i % 7])
    };

    try {
      if (
        lmOriginalRenderSenseiOutput &&
        lmOriginalRenderSenseiOutput !== window.renderSenseiOutput
      ) {
        lmOriginalRenderSenseiOutput(enhanced);

        const box = document.querySelector("#senseiOutput");
        if (box) {
          box.dataset.pack = JSON.stringify(enhanced);

          if (!box.querySelector("#senseiLocalMasterBadge")) {
            const badge = document.createElement("div");
            badge.id = "senseiLocalMasterBadge";
            badge.className = "sheet stack";
            badge.style.textAlign = "left";
            badge.innerHTML = `
              <div class="row row--between">
                <div class="badge">Sensei Local Master 6A</div>
                <div class="badge">offline • custo zero</div>
              </div>
              <div class="small">
                Material criado por banco local, regras pedagógicas e fallback seguro. Não usa API paga.
              </div>
            `;
            box.prepend(badge);
          }
        }

        return;
      }
    } catch { }

    lmRenderOutputFallback(enhanced);
  }

  /* =========================================================
     8. OVERRIDES SEGUROS
     ========================================================= */

  window.generateSenseiMaterial = function generateSenseiMaterialLocalMaster6A() {
    const payload = lmNormalizePayload(arguments);

    try {
      return lmBuildLocalMasterPack(payload);
    } catch (err) {
      console.warn("[NIHONGO321] Sensei Local Master 6A fallback:", err);

      if (lmOriginalGenerateSenseiMaterial) {
        try {
          const oldResult = lmOriginalGenerateSenseiMaterial(payload);
          if (oldResult && Array.isArray(oldResult.phrases)) return oldResult;
        } catch { }
      }

      return lmBuildScenarioPack({
        request: payload.request || "criar frases úteis para o dia a dia",
        theme: payload.theme || "Material prático",
        level: payload.level || "iniciante",
        tone: payload.tone || "educado"
      });
    }
  };

  window.renderSenseiOutput = function renderSenseiOutputLocalMaster6A(pack) {
    lmRenderSenseiOutput(pack);
  };

  try {
    generateSenseiMaterial = window.generateSenseiMaterial;
  } catch { }

  try {
    renderSenseiOutput = window.renderSenseiOutput;
  } catch { }

  /* =========================================================
     9. REPARO APÓS CLIQUE DE GERAR
     ========================================================= */

  function lmReadSenseiFormPayload() {
    const request =
      document.querySelector("#senseiRequest")?.value ||
      document.querySelector("#aiPrompt")?.value ||
      document.querySelector("#senseiPrompt")?.value ||
      document.querySelector("textarea")?.value ||
      "";

    const theme =
      document.querySelector("#senseiTheme")?.value ||
      document.querySelector("#aiTopic")?.value ||
      document.querySelector("#senseiTopic")?.value ||
      "";

    const level =
      document.querySelector("#senseiLevel")?.value ||
      document.querySelector("#aiLevel")?.value ||
      "iniciante";

    const tone =
      document.querySelector("#senseiTone")?.value ||
      document.querySelector("#aiTone")?.value ||
      "educado";

    return {
      request,
      theme,
      level,
      tone
    };
  }

  function lmRepairAfterGenerate() {
    const box = document.querySelector("#senseiOutput");
    if (!box) return;

    const current = lmSafeJSONParse(box.dataset?.pack || "");

    if (
      current &&
      current.engine === "local-master-6a" &&
      Array.isArray(current.phrases) &&
      current.phrases.length >= 7
    ) {
      return;
    }

    const payload = lmReadSenseiFormPayload();
    const pack = window.generateSenseiMaterial(payload);
    window.renderSenseiOutput(pack);
  }

  let lmRepairTimer = null;

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action='generateSensei'], #generateSensei, #btnGenerateSensei");
    if (!btn) return;

    clearTimeout(lmRepairTimer);
    lmRepairTimer = setTimeout(lmRepairAfterGenerate, 90);
  }, true);

  /* =========================================================
     10. TESTES E DIAGNÓSTICO
     ========================================================= */

  window.nihongo321LocalMaster6ATest = function nihongo321LocalMaster6ATest(prompt = "Me ensine o uso de ので com frases úteis para o trabalho.") {
    const pack = window.generateSenseiMaterial({
      request: prompt,
      theme: "",
      level: "intermediário",
      tone: "educado"
    });

    console.log("[NIHONGO321] Sensei Local Master 6A teste:", pack);
    return pack;
  };

  window.nihongo321LocalMaster6ACheck = function nihongo321LocalMaster6ACheck() {
    const result = {
      patch: true,
      engine: "local-master-6a",
      cost: "zero",
      offline: true,
      grammarItems: Object.keys(LM_GRAMMAR_BANK).length,
      scenarioItems: Object.keys(LM_SCENARIO_BANK).length,
      generator: typeof window.generateSenseiMaterial === "function",
      renderer: typeof window.renderSenseiOutput === "function"
    };

    console.log("[NIHONGO321] Sensei Local Master 6A ativo:", result);
    return result;
  };

  console.log("[NIHONGO321] Sensei IA Local Master 6A carregado — custo zero, offline, sem API.");

})();

/* =========================================================
   NIHONGO321 v8.3.1
   PATCH BLOCO 6B — VARIAÇÃO REAL POR NÍVEL E TOM
   - Faz level e tone mudarem o material de verdade
   - Mantém Sensei Local Master 6A como base
   - Não altera localStorage
   - Não altera checkout
   - Não quebra treino 105x
   ========================================================= */

(function patchSenseiLevelTone6B() {
  "use strict";

  const PATCH_ID = "nihongo321_patch_sensei_level_tone_6b";

  if (window[PATCH_ID]) return;
  window[PATCH_ID] = true;

  const previousGenerator =
    typeof window.generateSenseiMaterial === "function"
      ? window.generateSenseiMaterial
      : null;

  const previousRenderer =
    typeof window.renderSenseiOutput === "function"
      ? window.renderSenseiOutput
      : null;

  function b6Now() {
    return Date.now();
  }

  function b6Uid(prefix = "b6") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function b6Normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[「」『』"“”'’`´]/g, " ")
      .replace(/[、。,.!?！？;；:：()\[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function b6StripFuri(value) {
    try {
      if (typeof jpStripFurigana === "function") return jpStripFurigana(value);
    } catch { }

    return String(value || "").replace(/([^{}\s]+)\{([^{}]+)\}/g, "$1");
  }

  function b6Phrase(jp, pt, newWords = []) {
    return {
      id: b6Uid("sensei"),
      jp,
      pt,
      newWords: Array.isArray(newWords) ? newWords : [],
      createdAt: b6Now(),
      updatedAt: b6Now()
    };
  }

  function b6Level(value) {
    const n = b6Normalize(value);

    if (/avancado|avançado|n2|n1/.test(n)) return "avancado";
    if (/intermediario|intermediário|medio|médio|n4|n3/.test(n)) return "intermediario";
    if (/basico|básico|iniciante|facil|fácil|n5/.test(n)) return "iniciante";

    return "iniciante";
  }

  function b6Tone(value) {
    const n = b6Normalize(value);

    if (/emergencia|emergência|urgente|hospital|socorro/.test(n)) return "emergencia";
    if (/trabalho|fabrica|fábrica|chefe|lider|líder|empresa/.test(n)) return "trabalho";
    if (/natural|casual|amigo|dia a dia/.test(n)) return "natural";
    if (/formal|educado|polido|respeitoso|keigo/.test(n)) return "educado";

    return "educado";
  }

  function b6ReadPayload(argsLike) {
    const args = Array.from(argsLike || []);
    const first = args[0];

    if (first && typeof first === "object") {
      return {
        request: first.request || first.prompt || first.text || first.input || "",
        theme: first.theme || first.topic || first.topicName || "",
        level: first.level || "iniciante",
        tone: first.tone || "educado"
      };
    }

    return {
      request: String(args[0] || ""),
      theme: String(args[1] || ""),
      level: String(args[2] || "iniciante"),
      tone: String(args[3] || "educado")
    };
  }

  function b6WantedCount(payload, fallbackCount = 7) {
    const n = b6Normalize(`${payload.request || ""} ${payload.theme || ""}`);

    if (/13 frases|treze frases/.test(n)) return 13;
    if (/12 frases|doze frases/.test(n)) return 12;
    if (/10 frases|dez frases/.test(n)) return 10;
    if (/8 frases|oito frases/.test(n)) return 8;
    if (/7 frases|sete frases/.test(n)) return 7;

    return Math.max(7, fallbackCount || 7);
  }

  function b6DetectTerm(payload, pack) {
    const raw = `${payload.request || ""} ${payload.theme || ""} ${pack?.term || ""} ${pack?.title || ""}`;
    const compact = raw.replace(/\s+/g, "");

    const known = [
      "ので",
      "から",
      "てもいい",
      "てもらえますか",
      "ていただけますか",
      "ないといけない",
      "なければならない",
      "たほうがいい",
      "ことができる",
      "かどうか",
      "と思います",
      "かもしれません",
      "ようにしています",
      "ために",
      "ながら",
      "前に",
      "後で",
      "時",
      "もし",
      "けど",
      "やってみる"
    ];

    return known.find(k => compact.includes(k)) || pack?.term || "";
  }

  function b6DetectScenario(payload, pack) {
    const n = b6Normalize(`${payload.request || ""} ${payload.theme || ""} ${pack?.scenario || ""} ${pack?.title || ""}`);

    if (/chefe|lider|supervisor|encarregado/.test(n)) return "chefe";
    if (/hospital|medico|consulta|febre|dor|remedio|garganta/.test(n)) return "hospital";
    if (/prefeitura|documento|zairyu|my number|mynumber/.test(n)) return "prefeitura";
    if (/mercado|supermercado|produto|preco|validade/.test(n)) return "mercado";
    if (/konbini|conveniencia/.test(n)) return "konbini";
    if (/correio|encomenda|yu pack|yupack/.test(n)) return "correio";
    if (/bicicleta|bike|pneu|corrente|freio/.test(n)) return "bicicleta";
    if (/moradia|aluguel|apartamento|leopalace|vazamento/.test(n)) return "moradia";
    if (/trem|onibus|estacao|transporte/.test(n)) return "transporte";
    if (/telefone|internet|chip|plano|celular/.test(n)) return "telefone";
    if (/fabrica|trabalho|maquina|peca|linha|producao/.test(n)) return "fabrica";

    return pack?.scenario || "fabrica";
  }

  function b6EnsureCount(phrases, count) {
    const out = Array.isArray(phrases) ? phrases.filter(p => p && p.jp && p.pt) : [];
    const fallback = [
      b6Phrase(
        "すみません。もう 一度{いちど} お願{ねが}いします。",
        "Com licença. Mais uma vez, por favor.",
        [
          { jp: "一度{いちど}", pt: "uma vez" },
          { jp: "お願{ねが}いします", pt: "por favor" }
        ]
      ),
      b6Phrase(
        "ゆっくり 話{はな}して ください。",
        "Por favor, fale devagar.",
        [
          { jp: "ゆっくり", pt: "devagar" },
          { jp: "話{はな}して", pt: "falar" }
        ]
      ),
      b6Phrase(
        "確認{かくにん} して もらえますか。",
        "Você poderia verificar para mim?",
        [
          { jp: "確認{かくにん}", pt: "verificação / confirmação" }
        ]
      ),
      b6Phrase(
        "紙{かみ} に 書{か}いて もらえますか。",
        "Você poderia escrever no papel para mim?",
        [
          { jp: "紙{かみ}", pt: "papel" },
          { jp: "書{か}いて", pt: "escrever" }
        ]
      ),
      b6Phrase(
        "あと で 連絡{れんらく} します。",
        "Entro em contato depois.",
        [
          { jp: "連絡{れんらく}", pt: "contato" }
        ]
      ),
      b6Phrase(
        "今{いま} は まだ よく わかりません。",
        "Agora eu ainda não entendi bem.",
        [
          { jp: "今{いま}", pt: "agora" },
          { jp: "まだ", pt: "ainda" }
        ]
      ),
      b6Phrase(
        "この 内容{ないよう} で 合{あ}って いますか。",
        "Está correto assim?",
        [
          { jp: "内容{ないよう}", pt: "conteúdo" },
          { jp: "合{あ}って いますか", pt: "está correto?" }
        ]
      )
    ];

    let i = 0;

    while (out.length < count) {
      out.push({
        ...fallback[i % fallback.length],
        id: b6Uid("sensei")
      });
      i++;
    }

    return out.slice(0, count);
  }
  /* =========================================================
   2. BANCOS DE VARIAÇÃO REAL POR NÍVEL E TOM
   ========================================================= */

  function b6TermSet(term, level, tone) {
    const t = String(term || "").trim();

    if (t === "ので") {
      if (level === "iniciante") {
        return [
          b6Phrase(
            "雨{あめ} なので、行{い}きません。",
            "Como está chovendo, não vou.",
            [
              { jp: "雨{あめ}", pt: "chuva" },
              { jp: "行{い}きません", pt: "não vou" }
            ]
          ),
          b6Phrase(
            "仕事{しごと} なので、早{はや}く 寝{ね}ます。",
            "Como tenho trabalho, vou dormir cedo.",
            [
              { jp: "仕事{しごと}", pt: "trabalho" },
              { jp: "寝{ね}ます", pt: "vou dormir" }
            ]
          ),
          b6Phrase(
            "時間{じかん} が ない ので、あと で します。",
            "Como não tenho tempo, faço depois.",
            [
              { jp: "時間{じかん}", pt: "tempo" },
              { jp: "あと で", pt: "depois" }
            ]
          ),
          b6Phrase(
            "日本語{にほんご} が 苦手{にがて} なので、ゆっくり お願{ねが}いします。",
            "Como tenho dificuldade com japonês, devagar, por favor.",
            [
              { jp: "日本語{にほんご}", pt: "japonês" },
              { jp: "苦手{にがて}", pt: "dificuldade" }
            ]
          ),
          b6Phrase(
            "疲{つか}れた ので、少{すこ}し 休{やす}みます。",
            "Como fiquei cansado, vou descansar um pouco.",
            [
              { jp: "疲{つか}れた", pt: "cansado" },
              { jp: "休{やす}みます", pt: "vou descansar" }
            ]
          ),
          b6Phrase(
            "寒{さむ}い ので、上着{うわぎ} を 着{き}ます。",
            "Como está frio, vou vestir uma blusa.",
            [
              { jp: "寒{さむ}い", pt: "frio" },
              { jp: "上着{うわぎ}", pt: "blusa / casaco" }
            ]
          ),
          b6Phrase(
            "わからない ので、教{おし}えて ください。",
            "Como não entendo, por favor me ensine.",
            [
              { jp: "教{おし}えて", pt: "ensinar / explicar" }
            ]
          )
        ];
      }

      if (level === "avancado") {
        return [
          b6Phrase(
            "体調{たいちょう} が あまり 良{よ}くない ので、今日{きょう} は 無理{むり} を しない ようにします。",
            "Como minha condição física não está muito boa, hoje vou procurar não forçar.",
            [
              { jp: "体調{たいちょう}", pt: "condição física" },
              { jp: "無理{むり} を しない", pt: "não forçar" },
              { jp: "ようにします", pt: "vou procurar fazer" }
            ]
          ),
          b6Phrase(
            "電車{でんしゃ} が 遅{おく}れて いる ので、到着{とうちゃく} が 少{すこ}し 遅{おそ}く なる かもしれません。",
            "Como o trem está atrasado, talvez minha chegada fique um pouco mais tarde.",
            [
              { jp: "到着{とうちゃく}", pt: "chegada" },
              { jp: "遅{おそ}く なる", pt: "ficar tarde" },
              { jp: "かもしれません", pt: "talvez" }
            ]
          ),
          b6Phrase(
            "説明{せつめい} の 内容{ないよう} が まだ 完全{かんぜん} に 理解{りかい} できて いない ので、もう 一度{いちど} 確認{かくにん} させて ください。",
            "Como ainda não consegui entender completamente o conteúdo da explicação, por favor deixe-me confirmar mais uma vez.",
            [
              { jp: "完全{かんぜん}", pt: "completamente" },
              { jp: "理解{りかい}", pt: "entendimento" },
              { jp: "確認{かくにん} させて ください", pt: "por favor, deixe-me confirmar" }
            ]
          ),
          b6Phrase(
            "書類{しょるい} に 不備{ふび} が ある かもしれない ので、提出{ていしゅつ} する 前{まえ} に 確認{かくにん} したいです。",
            "Como pode haver alguma falha no documento, quero confirmar antes de entregar.",
            [
              { jp: "不備{ふび}", pt: "falha / pendência" },
              { jp: "提出{ていしゅつ}", pt: "entrega" },
              { jp: "前{まえ} に", pt: "antes de" }
            ]
          ),
          b6Phrase(
            "安全{あんぜん} に 関{かか}わる こと なので、少{すこ}しでも 不安{ふあん} が あれば 先{さき}に 確認{かくにん} します。",
            "Como é algo relacionado à segurança, se eu tiver qualquer insegurança, confirmo antes.",
            [
              { jp: "関{かか}わる", pt: "estar relacionado" },
              { jp: "不安{ふあん}", pt: "insegurança / preocupação" },
              { jp: "先{さき}に", pt: "antes / antecipadamente" }
            ]
          ),
          b6Phrase(
            "日本語{にほんご} だけ では 細{こま}かい ニュアンス が わかりにくい ので、簡単{かんたん} な 言葉{ことば} で 説明{せつめい} して いただけますか。",
            "Como é difícil entender nuances detalhadas só em japonês, o senhor poderia explicar com palavras simples?",
            [
              { jp: "細{こま}かい", pt: "detalhado" },
              { jp: "ニュアンス", pt: "nuance" },
              { jp: "言葉{ことば}", pt: "palavras" }
            ]
          ),
          b6Phrase(
            "予定{よてい} が 変{か}わる 可能性{かのうせい} が ある ので、決{き}まり 次第{しだい} すぐ に 連絡{れんらく} します。",
            "Como existe a possibilidade de a programação mudar, assim que for definido eu entro em contato.",
            [
              { jp: "可能性{かのうせい}", pt: "possibilidade" },
              { jp: "決{き}まり 次第{しだい}", pt: "assim que for decidido" },
              { jp: "連絡{れんらく}", pt: "contato" }
            ]
          )
        ];
      }
    }

    if (t === "かどうか") {
      if (level === "iniciante") {
        return [
          b6Phrase(
            "これ が 使{つか}える かどうか 知{し}りたいです。",
            "Quero saber se isto pode ser usado.",
            [
              { jp: "使{つか}える", pt: "pode usar" },
              { jp: "知{し}りたい", pt: "quero saber" }
            ]
          ),
          b6Phrase(
            "今日{きょう}、残業{ざんぎょう} が ある かどうか わかりますか。",
            "Você sabe se hoje tem hora extra?",
            [
              { jp: "残業{ざんぎょう}", pt: "hora extra" }
            ]
          ),
          b6Phrase(
            "この 電車{でんしゃ} が 行{い}く かどうか 知{し}りたいです。",
            "Quero saber se este trem vai.",
            [
              { jp: "電車{でんしゃ}", pt: "trem" },
              { jp: "行{い}く", pt: "ir" }
            ]
          ),
          b6Phrase(
            "これ で 大丈夫{だいじょうぶ} かどうか 見{み}て ください。",
            "Por favor, veja se assim está certo.",
            [
              { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / correto" },
              { jp: "見{み}て", pt: "ver / olhar" }
            ]
          ),
          b6Phrase(
            "予約{よやく} が 必要{ひつよう} かどうか 聞{き}きたいです。",
            "Quero perguntar se precisa de reserva.",
            [
              { jp: "予約{よやく}", pt: "reserva" },
              { jp: "必要{ひつよう}", pt: "necessário" }
            ]
          ),
          b6Phrase(
            "明日{あした} 休{やす}める かどうか まだ わかりません。",
            "Ainda não sei se posso folgar amanhã.",
            [
              { jp: "休{やす}める", pt: "poder folgar" }
            ]
          ),
          b6Phrase(
            "この 商品{しょうひん} が ある かどうか 聞{き}きます。",
            "Vou perguntar se tem este produto.",
            [
              { jp: "商品{しょうひん}", pt: "produto" },
              { jp: "聞{き}きます", pt: "vou perguntar" }
            ]
          )
        ];
      }

      if (level === "avancado") {
        return [
          b6Phrase(
            "この 書類{しょるい} で 手続{てつづ}き が できる かどうか、先{さき}に 確認{かくにん} して いただけますか。",
            "O senhor poderia confirmar antes se é possível fazer o procedimento com este documento?",
            [
              { jp: "手続{てつづ}き", pt: "procedimento" },
              { jp: "先{さき}に", pt: "antes / antecipadamente" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ]
          ),
          b6Phrase(
            "今日中{きょうじゅう} に 対応{たいおう} できる かどうか、わかり 次第{しだい} 教{おし}えて ください。",
            "Assim que souber se dá para atender ainda hoje, por favor me avise.",
            [
              { jp: "今日中{きょうじゅう}", pt: "ainda hoje" },
              { jp: "対応{たいおう}", pt: "atendimento / resposta" },
              { jp: "次第{しだい}", pt: "assim que" }
            ]
          ),
          b6Phrase(
            "この 方法{ほうほう} で 問題{もんだい} が ない かどうか、念{ねん}のため 確認{かくにん} したいです。",
            "Por precaução, quero confirmar se não há problema com este método.",
            [
              { jp: "方法{ほうほう}", pt: "método" },
              { jp: "念{ねん}のため", pt: "por precaução" },
              { jp: "問題{もんだい}", pt: "problema" }
            ]
          ),
          b6Phrase(
            "この 部品{ぶひん} が 正{ただ}しい かどうか 自信{じしん} が ない ので、確認{かくにん} を お願{ねが}いします。",
            "Como não tenho certeza se esta peça está correta, peço a verificação.",
            [
              { jp: "部品{ぶひん}", pt: "peça" },
              { jp: "正{ただ}しい", pt: "correto" },
              { jp: "自信{じしん}", pt: "confiança / certeza" }
            ]
          ),
          b6Phrase(
            "予定{よてい} が 変更{へんこう} に なる かどうか、まだ 連絡{れんらく} が 来{き}て いません。",
            "Ainda não recebi contato sobre se a programação será alterada.",
            [
              { jp: "予定{よてい}", pt: "programação" },
              { jp: "変更{へんこう}", pt: "alteração" },
              { jp: "連絡{れんらく}", pt: "contato" }
            ]
          ),
          b6Phrase(
            "この 表現{ひょうげん} が 自然{しぜん} かどうか、日本人{にほんじん} の 友達{ともだち} に 聞{き}いて みます。",
            "Vou tentar perguntar a um amigo japonês se esta expressão é natural.",
            [
              { jp: "表現{ひょうげん}", pt: "expressão" },
              { jp: "自然{しぜん}", pt: "natural" },
              { jp: "聞{き}いて みます", pt: "vou tentar perguntar" }
            ]
          ),
          b6Phrase(
            "この 契約{けいやく} に 追加料金{ついかりょうきん} が かかる かどうか、必{かなら}ず 確認{かくにん} した ほう が いいです。",
            "É melhor confirmar sem falta se haverá taxa extra neste contrato.",
            [
              { jp: "契約{けいやく}", pt: "contrato" },
              { jp: "追加料金{ついかりょうきん}", pt: "taxa extra" },
              { jp: "必{かなら}ず", pt: "sem falta" }
            ]
          )
        ];
      }
    }

    return null;
  }

  function b6ScenarioSet(scenario, level, tone) {
    if (scenario === "chefe" || tone === "trabalho") {
      if (level === "iniciante") {
        return [
          b6Phrase(
            "すみません。よく わかりません。",
            "Com licença. Eu não entendi bem.",
            [
              { jp: "すみません", pt: "com licença / desculpe" },
              { jp: "わかりません", pt: "não entendo" }
            ]
          ),
          b6Phrase(
            "もう 一度{いちど} お願{ねが}いします。",
            "Mais uma vez, por favor.",
            [
              { jp: "一度{いちど}", pt: "uma vez" },
              { jp: "お願{ねが}いします", pt: "por favor" }
            ]
          ),
          b6Phrase(
            "ゆっくり お願{ねが}いします。",
            "Devagar, por favor.",
            [
              { jp: "ゆっくり", pt: "devagar" }
            ]
          ),
          b6Phrase(
            "これ で いいですか。",
            "Assim está bom?",
            [
              { jp: "これ", pt: "isto" }
            ]
          ),
          b6Phrase(
            "次{つぎ} は 何{なに} ですか。",
            "O que vem depois?",
            [
              { jp: "次{つぎ}", pt: "próximo" },
              { jp: "何{なに}", pt: "o que" }
            ]
          ),
          b6Phrase(
            "確認{かくにん} お願{ねが}いします。",
            "Confirmação, por favor.",
            [
              { jp: "確認{かくにん}", pt: "confirmação" }
            ]
          ),
          b6Phrase(
            "少{すこ}し 待{ま}って ください。",
            "Por favor, espere um pouco.",
            [
              { jp: "少{すこ}し", pt: "um pouco" },
              { jp: "待{ま}って", pt: "esperar" }
            ]
          )
        ];
      }

      if (level === "intermediario") {
        return [
          b6Phrase(
            "すみません。この 作業{さぎょう} の やり方{かた} が まだ よく わかりません。",
            "Com licença. Ainda não entendi bem o modo de fazer esta tarefa.",
            [
              { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
              { jp: "やり方{かた}", pt: "modo de fazer" }
            ]
          ),
          b6Phrase(
            "もう 一度{いちど} 説明{せつめい} して もらえますか。",
            "Você poderia explicar mais uma vez para mim?",
            [
              { jp: "説明{せつめい}", pt: "explicação" },
              { jp: "もらえますか", pt: "poderia fazer para mim?" }
            ]
          ),
          b6Phrase(
            "この 内容{ないよう} で 合{あ}って いる かどうか 確認{かくにん} して ください。",
            "Por favor, confirme se este conteúdo está correto.",
            [
              { jp: "内容{ないよう}", pt: "conteúdo" },
              { jp: "合{あ}って いる", pt: "está correto" }
            ]
          ),
          b6Phrase(
            "次{つぎ} に 何{なに} を すれば いいですか。",
            "O que eu devo fazer em seguida?",
            [
              { jp: "次{つぎ}", pt: "em seguida" },
              { jp: "すれば いい", pt: "devo fazer" }
            ]
          ),
          b6Phrase(
            "間違{まちが}い が ない ように、先{さき}に 確認{かくにん} したいです。",
            "Para não haver erro, quero confirmar antes.",
            [
              { jp: "間違{まちが}い", pt: "erro" },
              { jp: "先{さき}に", pt: "antes" }
            ]
          ),
          b6Phrase(
            "終{お}わったら、すぐ 報告{ほうこく} します。",
            "Quando terminar, aviso imediatamente.",
            [
              { jp: "終{お}わったら", pt: "quando terminar" },
              { jp: "報告{ほうこく}", pt: "relatório / aviso" }
            ]
          ),
          b6Phrase(
            "少{すこ}し 体調{たいちょう} が 悪{わる}い ので、無理{むり} しない ようにします。",
            "Como estou me sentindo um pouco mal, vou procurar não forçar.",
            [
              { jp: "体調{たいちょう}", pt: "condição física" },
              { jp: "無理{むり} しない", pt: "não forçar" }
            ]
          )
        ];
      }

      return [
        b6Phrase(
          "申し訳{もう}し訳{わけ} ありません。この 作業{さぎょう} の 手順{てじゅん} を もう 一度{いちど} 確認{かくにん} させて いただけますか。",
          "Desculpe. O senhor poderia me permitir confirmar mais uma vez o procedimento desta tarefa?",
          [
            { jp: "申{もう}し訳{わけ} ありません", pt: "sinto muito / desculpe formalmente" },
            { jp: "手順{てじゅん}", pt: "procedimento / passo a passo" },
            { jp: "確認{かくにん} させて いただけますか", pt: "poderia me permitir confirmar?" }
          ]
        ),
        b6Phrase(
          "認識{にんしき} に 間違{まちが}い が ない か、念{ねん}のため 確認{かくにん} させて ください。",
          "Por precaução, deixe-me confirmar se não há erro no meu entendimento.",
          [
            { jp: "認識{にんしき}", pt: "entendimento / percepção" },
            { jp: "念{ねん}のため", pt: "por precaução" },
            { jp: "間違{まちが}い", pt: "erro" }
          ]
        ),
        b6Phrase(
          "この 方法{ほうほう} で 進{すす}めても 問題{もんだい} ない か、ご確認{かくにん} を お願{ねが}いします。",
          "Peço sua confirmação se não há problema em prosseguir com este método.",
          [
            { jp: "方法{ほうほう}", pt: "método" },
            { jp: "進{すす}めても", pt: "mesmo prosseguindo" },
            { jp: "問題{もんだい}", pt: "problema" }
          ]
        ),
        b6Phrase(
          "安全{あんぜん} に 関{かか}わる 内容{ないよう} なので、先{さき}に 確認{かくにん} して から 作業{さぎょう} します。",
          "Como é um conteúdo relacionado à segurança, vou trabalhar depois de confirmar antes.",
          [
            { jp: "安全{あんぜん}", pt: "segurança" },
            { jp: "関{かか}わる", pt: "estar relacionado" },
            { jp: "作業{さぎょう}", pt: "tarefa / trabalho" }
          ]
        ),
        b6Phrase(
          "予定{よてい} より 時間{じかん} が かかる 可能性{かのうせい} が あります。",
          "Existe a possibilidade de levar mais tempo do que o previsto.",
          [
            { jp: "予定{よてい}", pt: "previsão / programação" },
            { jp: "可能性{かのうせい}", pt: "possibilidade" }
          ]
        ),
        b6Phrase(
          "完了{かんりょう} したら、すぐ に 報告{ほうこく} いたします。",
          "Quando concluir, informarei imediatamente.",
          [
            { jp: "完了{かんりょう}", pt: "conclusão" },
            { jp: "報告{ほうこく} いたします", pt: "informarei / forma humilde" }
          ]
        ),
        b6Phrase(
          "不明点{ふめいてん} が あれば、そのまま 進{すす}めず に 確認{かくにん} します。",
          "Se houver pontos duvidosos, não vou prosseguir sem confirmar.",
          [
            { jp: "不明点{ふめいてん}", pt: "ponto não claro / dúvida" },
            { jp: "進{すす}めず に", pt: "sem prosseguir" }
          ]
        )
      ];
    }

    if (tone === "emergencia") {
      return [
        b6Phrase(
          "助{たす}けて ください。",
          "Por favor, me ajude.",
          [
            { jp: "助{たす}けて", pt: "ajude" }
          ]
        ),
        b6Phrase(
          "気分{きぶん} が 悪{わる}いです。",
          "Estou passando mal.",
          [
            { jp: "気分{きぶん}", pt: "estado / sensação" },
            { jp: "悪{わる}い", pt: "ruim" }
          ]
        ),
        b6Phrase(
          "救急車{きゅうきゅうしゃ} を 呼{よ}んで ください。",
          "Por favor, chame uma ambulância.",
          [
            { jp: "救急車{きゅうきゅうしゃ}", pt: "ambulância" },
            { jp: "呼{よ}んで", pt: "chamar" }
          ]
        ),
        b6Phrase(
          "日本語{にほんご} が あまり わかりません。",
          "Não entendo muito japonês.",
          [
            { jp: "日本語{にほんご}", pt: "japonês" }
          ]
        ),
        b6Phrase(
          "ここ が 痛{いた}いです。",
          "Dói aqui.",
          [
            { jp: "痛{いた}い", pt: "dói / dolorido" }
          ]
        ),
        b6Phrase(
          "会社{かいしゃ} に 連絡{れんらく} して ください。",
          "Por favor, entre em contato com a empresa.",
          [
            { jp: "会社{かいしゃ}", pt: "empresa" },
            { jp: "連絡{れんらく}", pt: "contato" }
          ]
        ),
        b6Phrase(
          "通訳{つうやく} を お願{ねが}いします。",
          "Por favor, preciso de intérprete.",
          [
            { jp: "通訳{つうやく}", pt: "intérprete" }
          ]
        )
      ];
    }

    if (tone === "natural") {
      return [
        b6Phrase(
          "ちょっと 聞{き}いても いいですか。",
          "Posso perguntar uma coisa?",
          [
            { jp: "ちょっと", pt: "um pouco / só um instante" },
            { jp: "聞{き}いても いい", pt: "posso perguntar?" }
          ]
        ),
        b6Phrase(
          "これ、どうすれば いいですか。",
          "O que eu faço com isto?",
          [
            { jp: "どうすれば いい", pt: "o que devo fazer?" }
          ]
        ),
        b6Phrase(
          "すみません、もう 一回{いっかい} お願{ねが}いします。",
          "Desculpa, mais uma vez, por favor.",
          [
            { jp: "一回{いっかい}", pt: "uma vez" }
          ]
        ),
        b6Phrase(
          "ちょっと わからない です。",
          "Eu não entendi muito bem.",
          [
            { jp: "わからない", pt: "não entendo" }
          ]
        ),
        b6Phrase(
          "あと で 確認{かくにん} します。",
          "Vou confirmar depois.",
          [
            { jp: "確認{かくにん}", pt: "confirmação" }
          ]
        ),
        b6Phrase(
          "これ で 合{あ}って ますか。",
          "Está certo assim?",
          [
            { jp: "合{あ}って ますか", pt: "está certo?" }
          ]
        ),
        b6Phrase(
          "もう 少{すこ}し ゆっくり 話{はな}して ください。",
          "Por favor, fale um pouco mais devagar.",
          [
            { jp: "少{すこ}し", pt: "um pouco" },
            { jp: "話{はな}して", pt: "falar" }
          ]
        )
      ];
    }

    return null;
  }

  function b6ApplyTonePolish(phrases, tone) {
    if (!Array.isArray(phrases)) return [];

    if (tone === "educado") {
      return phrases.map(p => ({
        ...p,
        jp: p.jp
          .replace(/ください。$/g, "いただけますか。")
          .replace(/お願いします。$/g, "お願{ねが}いできますか。"),
        pt: p.pt
          .replace(/^Por favor, /, "O senhor poderia ")
          .replace(/^Com licença\. /, "Com licença. ")
      }));
    }

    if (tone === "natural") {
      return phrases.map(p => ({
        ...p,
        jp: p.jp
          .replace(/いただけますか。/g, "もらえますか。")
          .replace(/お願{ねが}いできますか。/g, "お願{ねが}いします。")
          .replace(/申{もう}し訳{わけ} ありません。/g, "すみません。"),
        pt: p.pt
          .replace(/O senhor poderia /g, "Você poderia ")
          .replace(/Peço sua confirmação/g, "Pode confirmar")
      }));
    }

    if (tone === "emergencia") {
      return phrases.map(p => ({
        ...p,
        jp: p.jp
          .replace(/いただけますか。/g, "ください。")
          .replace(/もらえますか。/g, "ください。"),
        pt: p.pt
          .replace(/O senhor poderia /g, "Por favor, ")
          .replace(/Você poderia /g, "Por favor, ")
      }));
    }

    return phrases;
  }
  /* =========================================================
   3. APLICAÇÃO REAL DAS VARIAÇÕES
   ========================================================= */

  function b6MakeMetaNote(level, tone) {
    const levelMap = {
      iniciante: "Frases mais curtas, diretas e fáceis de repetir.",
      intermediario: "Frases mais completas, com conectores e contexto real.",
      avancado: "Frases mais naturais, polidas e próximas de situações reais."
    };

    const toneMap = {
      educado: "Tom educado para atendimento, chefe, prefeitura, hospital e situações formais.",
      natural: "Tom natural para conversas do dia a dia, sem ficar duro demais.",
      trabalho: "Tom voltado para fábrica, chefe, líder, tarefa, segurança e confirmação.",
      emergencia: "Tom direto para pedir ajuda rápido e evitar confusão."
    };

    return `${levelMap[level] || levelMap.iniciante} ${toneMap[tone] || toneMap.educado}`;
  }

  function b6BuildVariantPack(basePack, payload) {
    const level = b6Level(payload.level);
    const tone = b6Tone(payload.tone);
    const term = b6DetectTerm(payload, basePack);
    const scenario = b6DetectScenario(payload, basePack);
    const wantedCount = b6WantedCount(payload, basePack?.phrases?.length || 7);

    let variantPhrases = null;

    if (term) {
      variantPhrases = b6TermSet(term, level, tone);
    }

    if (!variantPhrases) {
      variantPhrases = b6ScenarioSet(scenario, level, tone);
    }

    if (!variantPhrases) {
      variantPhrases = Array.isArray(basePack?.phrases) ? basePack.phrases : [];
    }

    variantPhrases = b6ApplyTonePolish(variantPhrases, tone);
    variantPhrases = b6EnsureCount(variantPhrases, wantedCount);

    const levelLabel = {
      iniciante: "iniciante",
      intermediario: "intermediário",
      avancado: "avançado"
    }[level];

    const toneLabel = {
      educado: "educado",
      natural: "natural",
      trabalho: "trabalho",
      emergencia: "emergência"
    }[tone];

    const baseTitle = basePack?.title || basePack?.topicName || "Material prático";
    const title = `${baseTitle} • ${levelLabel} • ${toneLabel}`;

    return {
      ...(basePack || {}),
      title,
      topicName: basePack?.topicName || `Sensei IA • ${baseTitle}`,
      engine: "local-master-6b",
      expertEngine: "6B Level/Tone",
      levelMode: level,
      toneMode: tone,
      term,
      scenario,
      confidence: basePack?.confidence || "alta",
      explanation: basePack?.explanation || "Material criado pelo Sensei IA Local Master.",
      usage: `${basePack?.usage || "Use este material para treino prático."} ${b6MakeMetaNote(level, tone)}`,
      goal:
        level === "iniciante"
          ? "Treine frases curtas primeiro. Repita cada frase até sair sem esforço."
          : level === "intermediario"
            ? "Treine contexto e conectores. Tente trocar uma palavra da frase depois de repetir."
            : "Treine naturalidade. Repita em voz alta imaginando a situação real no Japão.",
      coachLine: [
        basePack?.coachLine || "",
        `Variação aplicada: nível ${levelLabel}, tom ${toneLabel}.`,
        b6MakeMetaNote(level, tone)
      ].filter(Boolean).join(" "),
      phrases: variantPhrases.map((p, index) => ({
        ...p,
        id: p.id || b6Uid("sensei"),
        order: index + 1,
        levelMode: level,
        toneMode: tone,
        updatedAt: b6Now()
      })),
      updatedAt: b6Now()
    };
  }

  function b6ShouldEnhance(payload, pack) {
    if (!pack || !Array.isArray(pack.phrases)) return true;

    const level = b6Level(payload.level);
    const tone = b6Tone(payload.tone);

    if (pack.engine !== "local-master-6b") return true;
    if (pack.levelMode !== level) return true;
    if (pack.toneMode !== tone) return true;

    return false;
  }

  window.generateSenseiMaterial = function generateSenseiMaterialLevelTone6B() {
    const payload = b6ReadPayload(arguments);

    let basePack = null;

    try {
      if (previousGenerator) {
        basePack = previousGenerator(payload);
      }
    } catch (err) {
      console.warn("[NIHONGO321] 6B previousGenerator falhou:", err);
    }

    if (!basePack || !Array.isArray(basePack.phrases)) {
      basePack = {
        title: "Material prático",
        topicName: "Sensei IA • Material prático",
        scenario: "fabrica",
        requestType: "scenario",
        explanation: "Material prático para situações reais no Japão.",
        usage: "Use para treinar escuta, leitura e fala no 105x.",
        goal: "Treine uma frase por vez.",
        coachLine: "",
        phrases: []
      };
    }

    if (!b6ShouldEnhance(payload, basePack)) {
      return basePack;
    }

    return b6BuildVariantPack(basePack, payload);
  };

  try {
    generateSenseiMaterial = window.generateSenseiMaterial;
  } catch { }

  /* =========================================================
     4. REFORÇO VISUAL NO RESULTADO
     ========================================================= */

  window.renderSenseiOutput = function renderSenseiOutputLevelTone6B(pack) {
    const safePack = pack && Array.isArray(pack.phrases)
      ? pack
      : window.generateSenseiMaterial({
        request: "criar frases úteis",
        theme: "material prático",
        level: "iniciante",
        tone: "educado"
      });

    if (previousRenderer) {
      try {
        previousRenderer(safePack);
      } catch (err) {
        console.warn("[NIHONGO321] 6B previousRenderer falhou:", err);
      }
    }

    const box = document.querySelector("#senseiOutput");
    if (!box) return;

    try {
      box.dataset.pack = JSON.stringify(safePack);
    } catch { }

    const level = safePack.levelMode || "iniciante";
    const tone = safePack.toneMode || "educado";

    const levelLabel = {
      iniciante: "iniciante",
      intermediario: "intermediário",
      avancado: "avançado"
    }[level] || level;

    const toneLabel = {
      educado: "educado",
      natural: "natural",
      trabalho: "trabalho",
      emergencia: "emergência"
    }[tone] || tone;

    if (!box.querySelector("#senseiLevelToneBadge6B")) {
      const badge = document.createElement("div");
      badge.id = "senseiLevelToneBadge6B";
      badge.className = "sheet stack";
      badge.style.textAlign = "left";
      badge.innerHTML = `
        <div class="row row--between">
          <div class="badge">Variação real ativa</div>
          <div class="badge">${levelLabel} • ${toneLabel}</div>
        </div>
        <div class="small">
          Este material foi ajustado de verdade pelo nível e pelo tom escolhidos.
        </div>
      `;
      box.prepend(badge);
    } else {
      const badge = box.querySelector("#senseiLevelToneBadge6B");
      badge.innerHTML = `
        <div class="row row--between">
          <div class="badge">Variação real ativa</div>
          <div class="badge">${levelLabel} • ${toneLabel}</div>
        </div>
        <div class="small">
          Este material foi ajustado de verdade pelo nível e pelo tom escolhidos.
        </div>
      `;
    }
  };

  try {
    renderSenseiOutput = window.renderSenseiOutput;
  } catch { }

  /* =========================================================
     5. REPARO PÓS-GERAÇÃO
     ========================================================= */

  function b6ReadFormPayload() {
    const request =
      document.querySelector("#senseiRequest")?.value ||
      document.querySelector("#aiPrompt")?.value ||
      document.querySelector("#senseiPrompt")?.value ||
      document.querySelector("textarea")?.value ||
      "";

    const theme =
      document.querySelector("#senseiTheme")?.value ||
      document.querySelector("#aiTopic")?.value ||
      document.querySelector("#senseiTopic")?.value ||
      "";

    const level =
      document.querySelector("#senseiLevel")?.value ||
      document.querySelector("#aiLevel")?.value ||
      document.querySelector("select[name='level']")?.value ||
      "iniciante";

    const tone =
      document.querySelector("#senseiTone")?.value ||
      document.querySelector("#aiTone")?.value ||
      document.querySelector("select[name='tone']")?.value ||
      "educado";

    return { request, theme, level, tone };
  }

  function b6RepairAfterGenerate() {
    const box = document.querySelector("#senseiOutput");
    if (!box) return;

    const payload = b6ReadFormPayload();

    let current = null;

    try {
      current = JSON.parse(box.dataset?.pack || "null");
    } catch { }

    const expectedLevel = b6Level(payload.level);
    const expectedTone = b6Tone(payload.tone);

    if (
      current &&
      current.engine === "local-master-6b" &&
      current.levelMode === expectedLevel &&
      current.toneMode === expectedTone &&
      Array.isArray(current.phrases) &&
      current.phrases.length >= 7
    ) {
      return;
    }

    const pack = window.generateSenseiMaterial(payload);
    window.renderSenseiOutput(pack);
  }

  let b6Timer = null;

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action='generateSensei'], #generateSensei, #btnGenerateSensei");
    if (!btn) return;

    clearTimeout(b6Timer);
    b6Timer = setTimeout(b6RepairAfterGenerate, 120);
  }, true);

  /* =========================================================
     6. TESTES
     ========================================================= */

  window.nihongo321Sensei6BCheck = function nihongo321Sensei6BCheck() {
    const samples = {
      inicianteEducado: window.generateSenseiMaterial({
        request: "Me ensine o uso de ので",
        level: "iniciante",
        tone: "educado"
      }),
      intermediarioTrabalho: window.generateSenseiMaterial({
        request: "Preciso falar com meu chefe que não entendi a tarefa",
        level: "intermediário",
        tone: "trabalho"
      }),
      avancadoEducado: window.generateSenseiMaterial({
        request: "Me ensine o uso de かどうか",
        level: "avançado",
        tone: "educado"
      }),
      emergencia: window.generateSenseiMaterial({
        request: "Estou passando mal no trabalho",
        level: "iniciante",
        tone: "emergência"
      })
    };

    console.log("[NIHONGO321] Sensei 6B variação real ativa:", samples);
    return samples;
  };

  window.nihongo321Sensei6BTest = function nihongo321Sensei6BTest(request = "Me ensine o uso de ので") {
    const a = window.generateSenseiMaterial({
      request,
      level: "iniciante",
      tone: "educado"
    });

    const b = window.generateSenseiMaterial({
      request,
      level: "intermediário",
      tone: "trabalho"
    });

    const c = window.generateSenseiMaterial({
      request,
      level: "avançado",
      tone: "educado"
    });

    console.table([
      {
        modo: "iniciante / educado",
        primeira: b6StripFuri(a.phrases?.[0]?.jp || "")
      },
      {
        modo: "intermediário / trabalho",
        primeira: b6StripFuri(b.phrases?.[0]?.jp || "")
      },
      {
        modo: "avançado / educado",
        primeira: b6StripFuri(c.phrases?.[0]?.jp || "")
      }
    ]);

    return { iniciante: a, intermediario: b, avancado: c };
  };

  console.log("[NIHONGO321] Sensei IA 6B carregado — nível e tom agora alteram as frases de verdade.");

})();
