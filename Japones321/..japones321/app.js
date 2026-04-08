/* =========================================================
   NIHONGO321 · APP V4
   Mobile-first, treino no centro, admin escondido
   ========================================================= */

const LS_KEY = "nihongo321_v4";

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
  const total = Math.floor(ms / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function fmtDateShort(ts) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function normalizeName(s) {
  return String(s || "").trim().replace(/\s+/g, " ").slice(0, 60);
}

function sum1to(n) {
  return (n * (n + 1)) / 2;
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
  setTimeout(() => URL.revokeObjectURL(url), 1800);
}

function route() {
  const h = location.hash || "#/home";
  return h.startsWith("#/") ? h : "#/home";
}

function nav(hash) {
  location.hash = hash;
}

/* ---------- JP validation ---------- */
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

function setKanaLine(el, rawText) {
  if (!el) return;
  if (jpHasFurigana(rawText)) {
    el.innerHTML = jpToRubyHTML(rawText);
    return;
  }
  el.textContent = rawText || "";
}

/* =========================================================
   TOPICS / TRAILS
   ========================================================= */
function topicPalette() {
  return ["tViolet", "tBlue", "tCyan", "tGreen", "tAmber", "tPink", "tMint", "tRose"];
}

function pickTopicColor(i) {
  const p = topicPalette();
  return p[i % p.length];
}

function slugifyTopicName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function defaultTopicNames() {
  return [
    "Frases aleatórias",
    "Na fábrica",
    "No mercado",
    "No konbini",
    "Na prefeitura",
    "No correio",
    "No hospital",
    "Na farmácia",
    "No banco",
    "No trem / estação",
    "No aeroporto",
    "No RH",
    "No celular / internet",
    "Em casa / apartamento",
    "Lixo e reciclagem",
    "Emergência",
    "No trabalho"
  ];
}

function seedTopics() {
  const t = now();
  return defaultTopicNames().map((name, i) => ({
    id: name === "Frases aleatórias" ? "topic_default" : `topic_${slugifyTopicName(name)}`,
    name,
    color: name === "Frases aleatórias" ? "tViolet" : pickTopicColor(i),
    createdAt: t,
    updatedAt: t
  }));
}

function topicIdMapFromTopics(topics) {
  const map = {};
  for (const t of topics) map[t.name] = t.id;
  return map;
}

function getTopicIdSafe(topicIds, topicName, fallbackId = "topic_default") {
  const target = String(topicName || "").trim().toLowerCase();
  for (const key in topicIds) {
    if (String(key).trim().toLowerCase() === target) return topicIds[key];
  }
  return fallbackId;
}

function getTopic(id) {
  return (STATE.bank.topics || []).find(t => t.id === id) || null;
}

function topicName(id) {
  return getTopic(id)?.name || "Sem tópico";
}

function topicColorClass(id) {
  return getTopic(id)?.color || "tViolet";
}

function ensureDefaultTopic() {
  let def = (STATE.bank.topics || []).find(t => t.id === "topic_default");
  if (!def) {
    def = {
      id: "topic_default",
      name: "Frases aleatórias",
      color: "tViolet",
      createdAt: now(),
      updatedAt: now()
    };
    STATE.bank.topics.unshift(def);
  }
  return def;
}

/* =========================================================
   SEED CONTENT
   ========================================================= */
function seedPhrases(topicIds) {
  const t = now();
  const def = topicIds["Frases aleatórias"] || "topic_default";

  return [
    { id:"ph_001", jp:"おはようございます。", pt:"bom dia.", topicId:def, priority:5, tags:["cumprimento"], newWords:[{jp:"おはようございます", pt:"bom dia"}], createdAt:t, updatedAt:t },
    { id:"ph_002", jp:"お疲{つか}れ様{さま}です。", pt:"bom trabalho / obrigado pelo esforço.", topicId:def, priority:5, tags:["trabalho"], newWords:[{jp:"お疲れ様です", pt:"bom trabalho"}], createdAt:t, updatedAt:t },
    { id:"ph_003", jp:"もう一度{いちど} お願{ねが}いします。", pt:"mais uma vez, por favor.", topicId:def, priority:5, tags:["ajuda"], newWords:[{jp:"もう一度", pt:"mais uma vez"}], createdAt:t, updatedAt:t },
    { id:"ph_004", jp:"ゆっくり お願{ねが}いします。", pt:"devagar, por favor.", topicId:def, priority:5, tags:["ajuda"], newWords:[{jp:"ゆっくり", pt:"devagar"}], createdAt:t, updatedAt:t },
    { id:"ph_005", jp:"日本語{にほんご}が あまり わかりません。", pt:"eu não entendo muito japonês.", topicId:def, priority:5, tags:["ajuda"], newWords:[{jp:"日本語", pt:"língua japonesa"}], createdAt:t, updatedAt:t },
    { id:"ph_006", jp:"少{すこ}し 待{ま}って ください。", pt:"espere um pouco, por favor.", topicId:def, priority:4, tags:["geral"], newWords:[{jp:"少し", pt:"um pouco"}], createdAt:t, updatedAt:t },
    { id:"ph_007", jp:"大丈夫{だいじょうぶ}です。", pt:"está tudo bem / está certo.", topicId:def, priority:4, tags:["geral"], newWords:[{jp:"大丈夫", pt:"tudo bem"}], createdAt:t, updatedAt:t },
    { id:"ph_008", jp:"これは 何{なん}ですか。", pt:"o que é isto?", topicId:def, priority:4, tags:["geral"], newWords:[{jp:"何", pt:"o que"}], createdAt:t, updatedAt:t },

    { id:"ph_009", jp:"今日{きょう}の 持{も}ち場{ば}は どこですか。", pt:"qual é o meu posto de hoje?", topicId:topicIds["Na fábrica"], priority:5, tags:["fabrica","trabalho"], newWords:[{jp:"持ち場", pt:"posto de trabalho"}], createdAt:t, updatedAt:t },
    { id:"ph_010", jp:"この作業{さぎょう}を もう一度{いちど} 教{おし}えて ください。", pt:"por favor, me ensine esta tarefa mais uma vez.", topicId:topicIds["Na fábrica"], priority:5, tags:["fabrica","aprendizado"], newWords:[{jp:"作業", pt:"tarefa"}], createdAt:t, updatedAt:t },
    { id:"ph_011", jp:"次{つぎ}は 何{なに}を すれば いいですか。", pt:"o que eu devo fazer em seguida?", topicId:topicIds["Na fábrica"], priority:5, tags:["fabrica"], newWords:[{jp:"次", pt:"seguinte / próximo"}], createdAt:t, updatedAt:t },
    { id:"ph_012", jp:"機械{きかい}が 止{と}まりました。", pt:"a máquina parou.", topicId:topicIds["Na fábrica"], priority:5, tags:["fabrica","urgente"], newWords:[{jp:"機械", pt:"máquina"}], createdAt:t, updatedAt:t },
    { id:"ph_013", jp:"不良品{ふりょうひん}が 出{で}ました。", pt:"saiu uma peça com defeito.", topicId:topicIds["Na fábrica"], priority:5, tags:["fabrica","qualidade"], newWords:[{jp:"不良品", pt:"produto com defeito"}], createdAt:t, updatedAt:t },
    { id:"ph_014", jp:"手伝{てつだ}って もらえますか。", pt:"você pode me ajudar?", topicId:topicIds["Na fábrica"], priority:5, tags:["fabrica","ajuda"], newWords:[{jp:"手伝って", pt:"ajudar"}], createdAt:t, updatedAt:t },

    { id:"ph_015", jp:"これは いくらですか。", pt:"quanto custa isto?", topicId:topicIds["No mercado"], priority:5, tags:["mercado","compras"], newWords:[{jp:"いくら", pt:"quanto"}], createdAt:t, updatedAt:t },
    { id:"ph_016", jp:"卵{たまご}は どこですか。", pt:"onde ficam os ovos?", topicId:topicIds["No mercado"], priority:4, tags:["mercado"], newWords:[{jp:"卵", pt:"ovos"}], createdAt:t, updatedAt:t },
    { id:"ph_017", jp:"賞味期限{しょうみきげん}は いつですか。", pt:"qual é a data de validade?", topicId:topicIds["No mercado"], priority:5, tags:["mercado"], newWords:[{jp:"賞味期限", pt:"validade"}], createdAt:t, updatedAt:t },
    { id:"ph_018", jp:"袋{ふくろ}は いりません。", pt:"não preciso de sacola.", topicId:topicIds["No mercado"], priority:4, tags:["mercado"], newWords:[{jp:"袋", pt:"sacola"}], createdAt:t, updatedAt:t },

    { id:"ph_019", jp:"温{あたた}めて ください。", pt:"por favor, aqueça isto.", topicId:topicIds["No konbini"], priority:5, tags:["konbini"], newWords:[{jp:"温めて", pt:"aquecer"}], createdAt:t, updatedAt:t },
    { id:"ph_020", jp:"レジ袋{ぶくろ}は いりません。", pt:"não preciso de sacola.", topicId:topicIds["No konbini"], priority:4, tags:["konbini"], newWords:[{jp:"レジ袋", pt:"sacola do caixa"}], createdAt:t, updatedAt:t },
    { id:"ph_021", jp:"レシートを ください。", pt:"por favor, me dê o recibo.", topicId:topicIds["No konbini"], priority:4, tags:["konbini"], newWords:[{jp:"レシート", pt:"recibo"}], createdAt:t, updatedAt:t },
    { id:"ph_022", jp:"この商品{しょうひん}は 売{う}り切{き}れですか。", pt:"este produto está esgotado?", topicId:topicIds["No konbini"], priority:4, tags:["konbini"], newWords:[{jp:"売り切れ", pt:"esgotado"}], createdAt:t, updatedAt:t },

    { id:"ph_023", jp:"住所変更{じゅうしょへんこう}の 手続{てつづ}きは どこですか。", pt:"onde faço o procedimento de mudança de endereço?", topicId:topicIds["Na prefeitura"], priority:5, tags:["prefeitura","documentos"], newWords:[{jp:"住所変更", pt:"mudança de endereço"}], createdAt:t, updatedAt:t },
    { id:"ph_024", jp:"この書類{しょるい}の 書{か}き方{かた}を 教{おし}えて ください。", pt:"por favor, me ensine como preencher este documento.", topicId:topicIds["Na prefeitura"], priority:5, tags:["prefeitura","documentos"], newWords:[{jp:"書類", pt:"documento"}], createdAt:t, updatedAt:t },
    { id:"ph_025", jp:"必要{ひつよう}な ものは 何{なに}ですか。", pt:"o que é necessário trazer?", topicId:topicIds["Na prefeitura"], priority:5, tags:["prefeitura"], newWords:[{jp:"必要", pt:"necessário"}], createdAt:t, updatedAt:t },

    { id:"ph_026", jp:"この荷物{にもつ}を 送{おく}りたいです。", pt:"quero enviar esta encomenda.", topicId:topicIds["No correio"], priority:5, tags:["correio"], newWords:[{jp:"荷物", pt:"encomenda"}], createdAt:t, updatedAt:t },
    { id:"ph_027", jp:"送料{そうりょう}は いくらですか。", pt:"quanto custa o frete?", topicId:topicIds["No correio"], priority:5, tags:["correio"], newWords:[{jp:"送料", pt:"frete"}], createdAt:t, updatedAt:t },
    { id:"ph_028", jp:"追跡番号{ついせきばんごう}は ありますか。", pt:"tem número de rastreamento?", topicId:topicIds["No correio"], priority:4, tags:["correio"], newWords:[{jp:"追跡番号", pt:"rastreamento"}], createdAt:t, updatedAt:t },

    { id:"ph_029", jp:"予約{よやく}を したいです。", pt:"quero marcar uma consulta.", topicId:topicIds["No hospital"], priority:5, tags:["hospital"], newWords:[{jp:"予約", pt:"agendamento"}], createdAt:t, updatedAt:t },
    { id:"ph_030", jp:"昨日{きのう}から 熱{ねつ}が あります。", pt:"estou com febre desde ontem.", topicId:topicIds["No hospital"], priority:5, tags:["hospital","saude"], newWords:[{jp:"熱", pt:"febre"}], createdAt:t, updatedAt:t },
    { id:"ph_031", jp:"咳{せき}と のどの 痛{いた}みが あります。", pt:"estou com tosse e dor de garganta.", topicId:topicIds["No hospital"], priority:5, tags:["hospital","saude"], newWords:[{jp:"咳", pt:"tosse"}], createdAt:t, updatedAt:t },

    { id:"ph_032", jp:"風邪薬{かぜぐすり}は ありますか。", pt:"vocês têm remédio para resfriado?", topicId:topicIds["Na farmácia"], priority:5, tags:["farmacia"], newWords:[{jp:"風邪薬", pt:"remédio para resfriado"}], createdAt:t, updatedAt:t },
    { id:"ph_033", jp:"眠気{ねむけ}の 少{すく}ない 薬{くすり}が いいです。", pt:"prefiro um remédio que dê pouco sono.", topicId:topicIds["Na farmácia"], priority:4, tags:["farmacia"], newWords:[{jp:"眠気", pt:"sonolência"}], createdAt:t, updatedAt:t },
    { id:"ph_034", jp:"1日{いちにち}に 何回{なんかい} 飲{の}めば いいですか。", pt:"quantas vezes por dia devo tomar?", topicId:topicIds["Na farmácia"], priority:4, tags:["farmacia"], newWords:[{jp:"何回", pt:"quantas vezes"}], createdAt:t, updatedAt:t },

    { id:"ph_035", jp:"口座{こうざ}を 作{つく}りたいです。", pt:"quero abrir uma conta bancária.", topicId:topicIds["No banco"], priority:4, tags:["banco"], newWords:[{jp:"口座", pt:"conta bancária"}], createdAt:t, updatedAt:t },
    { id:"ph_036", jp:"残高{ざんだか}を 確認{かくにん}したいです。", pt:"quero verificar o saldo.", topicId:topicIds["No banco"], priority:4, tags:["banco"], newWords:[{jp:"残高", pt:"saldo"}], createdAt:t, updatedAt:t },
    { id:"ph_037", jp:"手数料{てすうりょう}は いくらですか。", pt:"qual é a taxa?", topicId:topicIds["No banco"], priority:4, tags:["banco"], newWords:[{jp:"手数料", pt:"taxa"}], createdAt:t, updatedAt:t },

    { id:"ph_038", jp:"この電車{でんしゃ}は 福井{ふくい}に 行{い}きますか。", pt:"este trem vai para Fukui?", topicId:topicIds["No trem / estação"], priority:5, tags:["trem"], newWords:[{jp:"電車", pt:"trem"}], createdAt:t, updatedAt:t },
    { id:"ph_039", jp:"何番線{なんばんせん}ですか。", pt:"é na plataforma número qual?", topicId:topicIds["No trem / estação"], priority:5, tags:["trem"], newWords:[{jp:"何番線", pt:"qual plataforma"}], createdAt:t, updatedAt:t },
    { id:"ph_040", jp:"出口{でぐち}は どちらですか。", pt:"qual é a saída?", topicId:topicIds["No trem / estação"], priority:4, tags:["trem"], newWords:[{jp:"出口", pt:"saída"}], createdAt:t, updatedAt:t },

    { id:"ph_041", jp:"搭乗口{とうじょうぐち}は どこですか。", pt:"onde fica o portão de embarque?", topicId:topicIds["No aeroporto"], priority:4, tags:["aeroporto"], newWords:[{jp:"搭乗口", pt:"portão de embarque"}], createdAt:t, updatedAt:t },
    { id:"ph_042", jp:"荷物{にもつ}を 預{あず}けたいです。", pt:"quero despachar a bagagem.", topicId:topicIds["No aeroporto"], priority:4, tags:["aeroporto"], newWords:[{jp:"預ける", pt:"despachar"}], createdAt:t, updatedAt:t },

    { id:"ph_043", jp:"給料明細{きゅうりょうめいさい}を 確認{かくにん}したいです。", pt:"quero conferir meu holerite.", topicId:topicIds["No RH"], priority:4, tags:["rh"], newWords:[{jp:"給料明細", pt:"holerite"}], createdAt:t, updatedAt:t },
    { id:"ph_044", jp:"有給休暇{ゆうきゅうきゅうか}を 申請{しんせい}したいです。", pt:"quero solicitar férias pagas.", topicId:topicIds["No RH"], priority:4, tags:["rh"], newWords:[{jp:"有給休暇", pt:"férias pagas"}], createdAt:t, updatedAt:t },

    { id:"ph_045", jp:"SIMカードを 買{か}いたいです。", pt:"quero comprar um chip SIM.", topicId:topicIds["No celular / internet"], priority:5, tags:["celular","internet"], newWords:[{jp:"SIMカード", pt:"chip SIM"}], createdAt:t, updatedAt:t },
    { id:"ph_046", jp:"30GBの 固定{こてい}プランは ありますか。", pt:"tem um plano fixo de 30 GB?", topicId:topicIds["No celular / internet"], priority:5, tags:["celular","internet"], newWords:[{jp:"固定", pt:"fixo"}], createdAt:t, updatedAt:t },
    { id:"ph_047", jp:"Wi-Fiに 接続{せつぞく}できません。", pt:"não consigo conectar no Wi-Fi.", topicId:topicIds["No celular / internet"], priority:4, tags:["celular","internet"], newWords:[{jp:"接続", pt:"conectar"}], createdAt:t, updatedAt:t },

    { id:"ph_048", jp:"電気{でんき}が つきません。", pt:"a luz não acende.", topicId:topicIds["Em casa / apartamento"], priority:4, tags:["casa"], newWords:[{jp:"電気", pt:"luz / eletricidade"}], createdAt:t, updatedAt:t },
    { id:"ph_049", jp:"水漏{みずも}れしています。", pt:"há vazamento de água.", topicId:topicIds["Em casa / apartamento"], priority:4, tags:["casa"], newWords:[{jp:"水漏れ", pt:"vazamento"}], createdAt:t, updatedAt:t },
    { id:"ph_050", jp:"修理{しゅうり}を お願{ねが}いしたいです。", pt:"quero solicitar um reparo.", topicId:topicIds["Em casa / apartamento"], priority:4, tags:["casa"], newWords:[{jp:"修理", pt:"reparo"}], createdAt:t, updatedAt:t },

    { id:"ph_051", jp:"燃{も}える ごみの 日{ひ}は いつですか。", pt:"quando é o dia do lixo queimável?", topicId:topicIds["Lixo e reciclagem"], priority:3, tags:["lixo"], newWords:[{jp:"燃えるごみ", pt:"lixo queimável"}], createdAt:t, updatedAt:t },
    { id:"ph_052", jp:"段ボールは いつ 出{だ}せますか。", pt:"quando posso colocar o papelão para fora?", topicId:topicIds["Lixo e reciclagem"], priority:3, tags:["lixo"], newWords:[{jp:"段ボール", pt:"papelão"}], createdAt:t, updatedAt:t },

    { id:"ph_053", jp:"助{たす}けて ください。", pt:"por favor, me ajude.", topicId:topicIds["Emergência"], priority:5, tags:["emergencia"], newWords:[{jp:"助けて", pt:"me ajude"}], createdAt:t, updatedAt:t },
    { id:"ph_054", jp:"救急車{きゅうきゅうしゃ}を 呼{よ}んで ください。", pt:"por favor, chame uma ambulância.", topicId:topicIds["Emergência"], priority:5, tags:["emergencia"], newWords:[{jp:"救急車", pt:"ambulância"}], createdAt:t, updatedAt:t },
    { id:"ph_055", jp:"警察{けいさつ}を 呼{よ}んで ください。", pt:"por favor, chame a polícia.", topicId:topicIds["Emergência"], priority:5, tags:["emergencia"], newWords:[{jp:"警察", pt:"polícia"}], createdAt:t, updatedAt:t },
    { id:"ph_056", jp:"日本語{にほんご}が あまり 話{はな}せません。 ゆっくり お願{ねが}いします。", pt:"eu não falo muito japonês. por favor, fale devagar.", topicId:topicIds["Emergência"], priority:5, tags:["emergencia","ajuda"], newWords:[{jp:"話せません", pt:"não consigo falar"}], createdAt:t, updatedAt:t },

    { id:"ph_057", jp:"今日{きょう}も よろしく お願{ねが}いします。", pt:"conto com você hoje também / vamos trabalhar bem hoje.", topicId:topicIds["No trabalho"], priority:4, tags:["trabalho"], newWords:[{jp:"よろしくお願いします", pt:"conto com você"}], createdAt:t, updatedAt:t },
    { id:"ph_058", jp:"少{すこ}し 遅{おく}れます。", pt:"vou me atrasar um pouco.", topicId:topicIds["No trabalho"], priority:5, tags:["trabalho"], newWords:[{jp:"遅れます", pt:"vou me atrasar"}], createdAt:t, updatedAt:t },
    { id:"ph_059", jp:"体調{たいちょう}が 悪{わる}いです。", pt:"não estou me sentindo bem.", topicId:topicIds["No trabalho"], priority:5, tags:["trabalho","saude"], newWords:[{jp:"体調", pt:"condição física"}], createdAt:t, updatedAt:t },
    { id:"ph_060", jp:"今日は 休{やす}ませて ください。", pt:"por favor, deixe-me faltar hoje.", topicId:topicIds["No trabalho"], priority:5, tags:["trabalho"], newWords:[{jp:"休ませてください", pt:"deixe-me faltar"}], createdAt:t, updatedAt:t }
  ];
}

/* =========================================================
   DEFAULT / MIGRATION
   ========================================================= */
function defaultState() {
  const t = now();
  const topics = seedTopics();
  const topicIds = topicIdMapFromTopics(topics);
  const phrases = seedPhrases(topicIds);

  const progress = {};
  for (const p of phrases) {
    progress[p.id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      masteredAt: null,
      seenAt: null,
      isFavorite: false,
      isDifficult: false,
      isUrgent: false,
      history: []
    };
  }

  return {
    app: {
      schemaVersion: 4,
      createdAt: t,
      updatedAt: t
    },

    prefs: {
      audio: { enabled: true, volume: 0.35, unlocked: false },
      haptics: { enabled: true },
      tiredMode: false,
      onboardingDone: false
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

    bank: {
      topics,
      phrases
    },

    progress,

    session: {
      inProgress: false,
      currentPhraseId: phrases[0]?.id || null,
      currentContextId: "ALL",
      callMode: false,
      callBusy: false,
      quickMode: false,
      study: {
        day: todayKey(),
        totalMs: 0,
        running: false,
        runStartAt: null
      }
    },

    ui: {
      collapsedTopics: {},
      lastToast: "",
      recentContextIds: [],
      homeSuggestion: null
    }
  };
}

function migrateToV4(st) {
  if (!st || !st.app) return defaultState();

  st.app.schemaVersion = 4;

  st.bank ||= {};
  st.bank.topics ||= [];
  st.bank.phrases ||= [];
  st.progress ||= {};
  st.stats ||= {};
  st.habit ||= { firstDay: null, days: {} };
  st.habit.days ||= {};
  st.ui ||= {};
  st.ui.collapsedTopics ||= {};
  st.ui.recentContextIds ||= [];
  st.session ||= {};
  st.session.study ||= { day: todayKey(), totalMs: 0, running: false, runStartAt: null };
  st.session.currentContextId ||= "ALL";
  st.session.currentPhraseId ||= st.bank.phrases[0]?.id || null;
  st.session.callMode ||= false;
  st.session.callBusy ||= false;
  st.session.quickMode ||= false;

  st.prefs ||= {};
  st.prefs.audio ||= { enabled: true, volume: 0.35, unlocked: false };
  st.prefs.haptics ||= { enabled: true };
  st.prefs.tiredMode ??= false;
  st.prefs.onboardingDone ??= false;

  st.stats.coins ||= 0;
  st.stats.bestCoins ||= 0;
  st.stats.cyclesDone ||= 0;
  st.stats.phrasesMastered ||= 0;
  st.stats.listens ||= 0;
  st.stats.calls ||= 0;

  let def = st.bank.topics.find(t => t.id === "topic_default");
  if (!def) {
    const coreTopics = seedTopics();
    st.bank.topics = st.bank.topics.length ? st.bank.topics : coreTopics;
    def = st.bank.topics.find(t => t.id === "topic_default") || coreTopics[0];
    if (!st.bank.topics.find(t => t.id === def.id)) st.bank.topics.unshift(def);
  }

  if (!st.bank.topics.length) st.bank.topics = seedTopics();

  const existingByName = new Map();
  for (const t of st.bank.topics) existingByName.set(String(t.name || "").toLowerCase(), t);

  for (const core of seedTopics()) {
    const key = core.name.toLowerCase();
    if (!existingByName.has(key)) {
      st.bank.topics.push({ ...core });
      existingByName.set(key, core);
    }
  }

  for (const p of st.bank.phrases) {
    if (!p.topicId) p.topicId = "topic_default";
    if (!Array.isArray(p.tags)) p.tags = [];
    if (typeof p.priority !== "number") p.priority = 3;
    if (!Array.isArray(p.newWords)) p.newWords = [];
    if (!st.progress[p.id]) {
      st.progress[p.id] = {
        status: "training",
        cycleStart: 14,
        count: 14,
        masteredAt: null,
        seenAt: null,
        isFavorite: false,
        isDifficult: false,
        isUrgent: false,
        history: []
      };
    } else {
      st.progress[p.id].seenAt ||= null;
      st.progress[p.id].isFavorite ||= false;
      st.progress[p.id].isDifficult ||= false;
      st.progress[p.id].isUrgent ||= false;
      st.progress[p.id].history ||= [];
    }
  }

  if (!st.bank.phrases.length) {
    const topicIds = topicIdMapFromTopics(st.bank.topics);
    st.bank.phrases = seedPhrases(topicIds);
  }

  return st;
}

function loadState() {
  let raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const parsed = safeJSONParse(raw);
    if (parsed?.app) return migrateToV4(parsed);
  }

  const legacyKeys = ["jp_105x_v3", "jp_105x_v2"];
  for (const key of legacyKeys) {
    const legacyRaw = localStorage.getItem(key);
    if (!legacyRaw) continue;
    const parsed = safeJSONParse(legacyRaw);
    if (parsed?.app) return migrateToV4(parsed);
  }

  return defaultState();
}

function saveState() {
  STATE.app.updatedAt = now();
  localStorage.setItem(LS_KEY, JSON.stringify(STATE));
}

let STATE = loadState();
saveState();

/* =========================================================
   AUDIO / HAPTICS
   ========================================================= */
let audioCtx = null;
let callFlowState = { busy: false, token: 0, timers: [] };

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
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return;
  }
  if (!audioCtx) return;

  const vol = clamp(STATE.prefs.audio.volume ?? 0.35, 0, 1);
  const t0 = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  let freq = 220, dur = 0.06;
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

function clearCallFlow() {
  callFlowState.token += 1;
  callFlowState.busy = false;
  callFlowState.timers.forEach(id => clearTimeout(id));
  callFlowState.timers = [];
  STATE.session.callBusy = false;
  try { speechSynthesis.cancel(); } catch {}
  const sheet = $("#cycleSheet");
  if (sheet) {
    sheet.style.display = "none";
    sheet.innerHTML = "";
  }
  saveState();
}

function estimateDurationMs(text, rate) {
  const clean = (text || "").replace(/\s+/g, "");
  const n = clean.length || 1;
  const base = 110 * n;
  const r = clamp(rate, 0.6, 1.2);
  return base / r;
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

function speakPhrase(phrase, rate = 1.0, onDone) {
  if (!phrase) return;
  const plain = jpStripFurigana(phrase.jp);

  STATE.stats.listens = (STATE.stats.listens || 0) + 1;
  habitBump("listens", 1);

  const ok = ttsSpeak(plain, rate, null, onDone);
  if (!ok) toast("sem audio. mas da pra treinar lendo.");
}

function callAndResponse(phrase, rate = 1.0, onDone) {
  if (!phrase) return;
  if (callFlowState.busy) {
    toast("espera o ciclo atual terminar ✅");
    beep("tuk");
    return;
  }

  const plain = jpStripFurigana(phrase.jp);
  const token = ++callFlowState.token;
  callFlowState.busy = true;
  STATE.session.callBusy = true;
  STATE.stats.calls = (STATE.stats.calls || 0) + 1;
  habitBump("calls", 1);
  saveState();

  const ok = ttsSpeak(plain, rate, null, () => {});
  if (!ok) {
    callFlowState.busy = false;
    STATE.session.callBusy = false;
    saveState();
    toast("sem audio. mas da pra treinar lendo.");
    return;
  }

  const t = estimateDurationMs(plain, rate);
  const id = setTimeout(() => {
    if (token !== callFlowState.token) return;
    showNowYouSheet(token, () => {
      if (token !== callFlowState.token) return;
      callFlowState.busy = false;
      STATE.session.callBusy = false;
      saveState();
      onDone && onDone();
    });
  }, t + 120);

  callFlowState.timers.push(id);
}

function showNowYouSheet(token, onDone) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;

  sheet.style.display = "block";
  sheet.innerHTML = `
    <div class="stamp">agora você ✅</div>
    <div class="small">repita em voz alta. sem pressa.</div>
    <div class="row row--between">
      <div class="badge">tempo</div>
      <div class="badge" id="nyCount">2</div>
    </div>
  `;

  let c = 2;
  const tick = () => {
    if (token !== callFlowState.token) return;
    c--;
    const el = $("#nyCount");
    if (el) el.textContent = String(Math.max(0, c));
    if (c <= 0) {
      sheet.style.display = "none";
      sheet.innerHTML = "";
      onDone && onDone();
      return;
    }
    const id = setTimeout(tick, 1000);
    callFlowState.timers.push(id);
  };
  const id = setTimeout(tick, 1000);
  callFlowState.timers.push(id);
}

/* =========================================================
   HABIT / TIMER
   ========================================================= */
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

function habitBump(field, amount = 1) {
  const k = ensureHabitToday();
  STATE.habit.days[k][field] = (STATE.habit.days[k][field] || 0) + amount;
  saveState();
}

function ensureStudyDay() {
  const k = todayKey();
  STATE.session.study ||= { day: k, totalMs: 0, running: false, runStartAt: null };
  if (STATE.session.study.day !== k) {
    STATE.session.study.day = k;
    STATE.session.study.totalMs = 0;
    STATE.session.study.running = false;
    STATE.session.study.runStartAt = null;
  }
  ensureHabitToday();
}

function getStudyMs() {
  ensureStudyDay();
  const st = STATE.session.study;
  const runningAdd = st.running && st.runStartAt ? (now() - st.runStartAt) : 0;
  return (st.totalMs || 0) + runningAdd;
}

function syncHabitMs() {
  const k = ensureHabitToday();
  STATE.habit.days[k].ms = getStudyMs();
  saveState();
}

let timerTickId = null;

function stopTimerTick() {
  if (timerTickId) {
    clearInterval(timerTickId);
    timerTickId = null;
  }
}

function updateStudyUI() {
  const el = $("#studyTime");
  const fill = $("#studyFill");
  if (!el || !fill) return;

  const ms = getStudyMs();
  el.textContent = fmtMMSS(ms);

  const goal = 10 * 60 * 1000;
  const pct = clamp(ms / goal, 0, 1);
  fill.style.transform = `scaleX(${pct})`;
}

function startTimerTick() {
  if (timerTickId) return;
  timerTickId = setInterval(() => {
    updateStudyUI();
    syncHabitMs();
  }, 1000);
}

function startStudyTimerIfNeeded() {
  ensureStudyDay();

  const onTrain = route() === "#/train";
  const st = STATE.session.study;

  if (!onTrain) {
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

/* =========================================================
   STATE HELPERS
   ========================================================= */
function getProg(id) {
  if (!STATE.progress[id]) {
    STATE.progress[id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      masteredAt: null,
      seenAt: null,
      isFavorite: false,
      isDifficult: false,
      isUrgent: false,
      history: []
    };
  }
  return STATE.progress[id];
}

function getPhrase(id) {
  return (STATE.bank.phrases || []).find(p => p.id === id) || null;
}

function listContexts() {
  return STATE.bank.topics || [];
}

function phrasesByContext(contextId = "ALL") {
  const list = STATE.bank.phrases || [];
  if (contextId === "ALL") return list;
  if (contextId === "FAVORITES") return list.filter(p => getProg(p.id).isFavorite);
  if (contextId === "DIFFICULT") return list.filter(p => getProg(p.id).isDifficult);
  if (contextId === "URGENT") return list.filter(p => getProg(p.id).isUrgent);
  if (contextId === "REVIEW") {
    return list.filter(p => {
      const pr = getProg(p.id);
      return pr.seenAt || pr.isFavorite || pr.isDifficult || pr.isUrgent;
    });
  }
  return list.filter(p => p.topicId === contextId);
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

function markSeen(id) {
  const pr = getProg(id);
  pr.seenAt = pr.seenAt || now();
  saveState();
}

function addCoins(amount) {
  STATE.stats.coins = (STATE.stats.coins || 0) + amount;
  STATE.stats.bestCoins = Math.max(STATE.stats.bestCoins || 0, STATE.stats.coins);
  saveState();
  refreshHUD();
}

function getContextProgress(contextId) {
  const list = phrasesByContext(contextId);
  if (!list.length) return { total: 0, mastered: 0, pct: 0 };

  let mastered = 0;
  for (const p of list) {
    if (getProg(p.id).status === "mastered") mastered++;
  }
  return {
    total: list.length,
    mastered,
    pct: mastered / list.length
  };
}

function getRecommendedContextId() {
  const all = listContexts();
  let best = null;

  for (const t of all) {
    const list = phrasesByContext(t.id);
    if (!list.length) continue;

    let score = 0;
    for (const p of list) {
      const pr = getProg(p.id);
      if (pr.status !== "mastered") score += (p.priority || 3);
      if (pr.isUrgent) score += 6;
      if (pr.isDifficult) score += 4;
      if (pr.isFavorite) score += 2;
    }

    if (!best || score > best.score) {
      best = { id: t.id, score };
    }
  }

  return best?.id || "ALL";
}

function chooseNextPhraseFromContext(contextId) {
  const list = phrasesByContext(contextId)
    .slice()
    .sort((a, b) => {
      const pa = getProg(a.id);
      const pb = getProg(b.id);

      const sa =
        (pa.isUrgent ? 1000 : 0) +
        (pa.isDifficult ? 400 : 0) +
        (pa.status !== "mastered" ? 200 : 0) +
        (a.priority || 3) * 10 -
        phraseProgressPct(pa) * 50;

      const sb =
        (pb.isUrgent ? 1000 : 0) +
        (pb.isDifficult ? 400 : 0) +
        (pb.status !== "mastered" ? 200 : 0) +
        (b.priority || 3) * 10 -
        phraseProgressPct(pb) * 50;

      return sb - sa;
    });

  return list[0] || null;
}

function ensureCurrentPhrase() {
  if (!STATE.session.currentPhraseId) {
    const suggestedContext = getRecommendedContextId();
    const next = chooseNextPhraseFromContext(suggestedContext) || STATE.bank.phrases[0] || null;
    STATE.session.currentPhraseId = next?.id || null;
    if (next) STATE.session.currentContextId = next.topicId || "ALL";
  }
}

/* =========================================================
   UX FEEDBACK
   ========================================================= */
const APP = $("#app");

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("on"), 1500);
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

/* =========================================================
   TRAIN ENGINE
   ========================================================= */
function setCurrentPhrase(id) {
  if (!id) return;
  STATE.session.currentPhraseId = id;
  const phrase = getPhrase(id);
  if (phrase?.topicId) STATE.session.currentContextId = phrase.topicId;
  markSeen(id);
  saveState();
}

function resetCountForPhrase(id) {
  const pr = getProg(id);
  const cs = clamp(pr.cycleStart || 14, 1, 14);
  pr.count = clamp(pr.count || cs, 1, cs);
}

function gotoNextPhrase() {
  const current = getPhrase(STATE.session.currentPhraseId);
  const ctx = current?.topicId || getRecommendedContextId();
  const list = phrasesByContext(ctx);
  if (!list.length) return;

  const idx = list.findIndex(x => x.id === current?.id);
  const next = list[(idx + 1 + list.length) % list.length];
  setCurrentPhrase(next.id);
  resetCountForPhrase(next.id);
  saveState();
}

function gotoPrevPhrase() {
  const current = getPhrase(STATE.session.currentPhraseId);
  const ctx = current?.topicId || getRecommendedContextId();
  const list = phrasesByContext(ctx);
  if (!list.length) return;

  const idx = list.findIndex(x => x.id === current?.id);
  const prev = list[(idx - 1 + list.length) % list.length];
  setCurrentPhrase(prev.id);
  resetCountForPhrase(prev.id);
  saveState();
}

function toggleFlag(id, field) {
  const pr = getProg(id);
  pr[field] = !pr[field];
  saveState();
}

function onRepeat() {
  unlockAudio();
  const pid = STATE.session.currentPhraseId;
  const p = getPhrase(pid);
  if (!p) return;

  clearCallFlow();
  markSeen(pid);

  const pr = getProg(pid);
  const cs = clamp(pr.cycleStart || 14, 1, 14);
  pr.count = clamp(pr.count || cs, 1, cs);

  if (pr.count > 1) {
    pr.count -= 1;
    pr.history.push({ at: now(), event: "rep", count: pr.count });
    saveState();
    beep("pop");
    vibrate([8]);
    renderTrainBodyOnly();
    return;
  }

  pr.history.push({ at: now(), event: "cycle_done", cycleStart: cs });
  STATE.stats.cyclesDone = (STATE.stats.cyclesDone || 0) + 1;
  habitBump("cycles", 1);

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
  renderTrainBodyOnly();
}

function showCycleSheet(masteredNow) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;
  sheet.style.display = "block";
  sheet.innerHTML = `
    <div class="stamp">parabéns 👏</div>
    <div class="small">${masteredNow ? "frase dominada. você ficou mais rico ✅" : "ciclo fechado. +100 moedas 🪙"}</div>
    <div class="row">
      <button class="btn btn--ok btn--full" data-action="nextPhrase">próxima frase ▶</button>
    </div>
  `;
}

/* =========================================================
   RENDER HELPERS
   ========================================================= */
function renderNewWords(list) {
  if (!Array.isArray(list) || !list.length) return "";
  return `
    <div class="sheet newWordsCard">
      <div class="small">palavras úteis</div>
      ${list.map(w => `<div class="small"><b>${escapeHTML(w.jp)}</b> = ${escapeHTML(w.pt)}</div>`).join("")}
    </div>
  `;
}

function contextQuickPills(selected = "ALL") {
  const primary = [
    { id: "URGENT", label: "urgentes" },
    { id: "DIFFICULT", label: "difíceis" },
    { id: "FAVORITES", label: "favoritas" },
    { id: "REVIEW", label: "revisão" }
  ];

  return `
    <div class="topicPills">
      <button class="pill ${selected === "ALL" ? "on" : ""}" data-action="setContext" data-id="ALL">tudo</button>
      ${primary.map(x => `<button class="pill ${selected === x.id ? "on" : ""}" data-action="setContext" data-id="${x.id}">${x.label}</button>`).join("")}
    </div>
  `;
}

function getQuickStats() {
  const today = ensureHabitToday();
  const day = STATE.habit.days[today] || { ms: 0, cycles: 0 };

  let favorites = 0;
  let difficult = 0;
  let urgent = 0;
  for (const id in STATE.progress) {
    const pr = STATE.progress[id];
    if (pr.isFavorite) favorites++;
    if (pr.isDifficult) difficult++;
    if (pr.isUrgent) urgent++;
  }

  return {
    todayMin: Math.floor((day.ms || 0) / 60000),
    todayCycles: day.cycles || 0,
    favorites,
    difficult,
    urgent
  };
}

function contextSummaryCards() {
  const recommended = getRecommendedContextId();
  const contexts = listContexts().slice(0, 8);

  return contexts.map(t => {
    const stats = getContextProgress(t.id);
    const isRecommended = t.id === recommended;
    return `
      <div class="item">
        <div class="itemTop">
          <div style="min-width:0">
            <p class="itemTitle">${escapeHTML(t.name)}</p>
            <div class="itemMeta">${stats.mastered}/${stats.total} dominadas ${isRecommended ? "• recomendado agora" : ""}</div>
            <div class="pWrap">
              <div class="pBar"><div class="pFill" style="transform:scaleX(${stats.pct})"></div></div>
              <div class="pTxt">${Math.round(stats.pct * 100)}%</div>
            </div>
          </div>
          <button class="btn btn--ghost" data-action="openContext" data-id="${t.id}">abrir</button>
        </div>
      </div>
    `;
  }).join("");
}

function phraseFlagsBar(phraseId) {
  const pr = getProg(phraseId);
  return `
    <div class="row">
      <button class="btn ${pr.isFavorite ? "btn--ghost" : "btn--muted"}" data-action="toggleFavorite" data-id="${phraseId}">
        ${pr.isFavorite ? "★ favorita" : "☆ favorita"}
      </button>
      <button class="btn ${pr.isDifficult ? "btn--ghost" : "btn--muted"}" data-action="toggleDifficult" data-id="${phraseId}">
        ${pr.isDifficult ? "● difícil" : "○ difícil"}
      </button>
      <button class="btn ${pr.isUrgent ? "btn--ghost" : "btn--muted"}" data-action="toggleUrgent" data-id="${phraseId}">
        ${pr.isUrgent ? "⚑ urgente" : "⚐ urgente"}
      </button>
    </div>
  `;
}

/* =========================================================
   RENDERS
   ========================================================= */
function render() {
  refreshHUD();
  ensureCurrentPhrase();

  const r = route();
  if (r === "#/home") return renderHome();
  if (r === "#/train") return renderTrain();
  if (r === "#/contexts") return renderContexts();
  if (r === "#/progress") return renderProgress();
  if (r === "#/settings") return renderSettings();
  if (r === "#/admin") return renderAdmin();
  if (r === "#/edit") return renderEdit();
  if (r === "#/backup") return renderBackup();
  return nav("#/home");
}

function renderHome() {
  const stats = getQuickStats();
  const recommendedContextId = getRecommendedContextId();
  const recommendedContext = getTopic(recommendedContextId);
  const recommendedPhrase = chooseNextPhraseFromContext(recommendedContextId);

  APP.innerHTML = `
    <div class="stack">
      ${!STATE.prefs.onboardingDone ? `
        <section class="card homeHero stack">
          <div class="badge">bem-vindo</div>
          <h2 class="h1">Aprenda japonês útil sem enrolação.</h2>
          <p class="p">Abra, ouça, leia, repita e siga. Feito para quem vive no Japão real e chega cansado.</p>
          <div class="grid2">
            <button class="bigBtn" data-action="finishOnboarding">entendi, vamos começar</button>
            <button class="btn btn--ghost btn--full" data-nav="#/contexts">ver contextos</button>
          </div>
        </section>
      ` : ""}

      <section class="card homeHero stack">
        <div class="badge">hoje</div>
        <h2 class="h1">${STATE.prefs.tiredMode ? "Modo cansado ativado. treino seco e direto." : "Seu próximo passo está pronto."}</h2>
        <p class="p">Poucos minutos já contam. O importante é encostar no treino e seguir o fio.</p>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">progresso rápido</div>
            <div class="badge">${stats.todayMin} min hoje</div>
          </div>
          <div class="grid2">
            <div class="item">
              <p class="itemTitle">${stats.todayCycles}</p>
              <div class="itemMeta">ciclos hoje</div>
            </div>
            <div class="item">
              <p class="itemTitle">${STATE.stats.phrasesMastered || 0}</p>
              <div class="itemMeta">frases dominadas</div>
            </div>
          </div>
        </div>

        <button class="bigBtn" data-action="startRecommendedTrain">COMEÇAR TREINO</button>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">recomendado agora</div>
            <div class="badge">${recommendedContext ? escapeHTML(recommendedContext.name) : "geral"}</div>
          </div>

          ${recommendedPhrase ? `
            <div class="item">
              <p class="itemTitle">${escapeHTML(jpStripFurigana(recommendedPhrase.jp))}</p>
              <div class="itemMeta">${escapeHTML(recommendedPhrase.pt)}</div>
            </div>
          ` : `
            <div class="small">seu próximo treino vai aparecer aqui.</div>
          `}

          <div class="row">
            <button class="btn btn--ghost" data-action="startRecommendedTrain">treinar agora</button>
            <button class="btn" data-nav="#/contexts">escolher contexto</button>
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">atalhos úteis</div>
          <button class="btn btn--ghost" data-nav="#/progress">ver progresso</button>
        </div>

        ${contextQuickPills("ALL")}

        <div class="grid2">
          <button class="btn btn--full" data-action="openContext" data-id="URGENT">frases que vou usar hoje</button>
          <button class="btn btn--full" data-action="openContext" data-id="REVIEW">revisar o que já vi</button>
          <button class="btn btn--full" data-action="openContext" data-id="DIFFICULT">focar no que trava</button>
          <button class="btn btn--full" data-action="openContext" data-id="FAVORITES">favoritas importantes</button>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">contextos práticos</div>
          <button class="btn" data-nav="#/contexts">ver todos</button>
        </div>
        <div class="list">
          ${contextSummaryCards()}
        </div>
      </section>
    </div>
  `;
}

function renderTrain() {
  ensureCurrentPhrase();
  const phrase = getPhrase(STATE.session.currentPhraseId);
  if (!phrase) {
    APP.innerHTML = `
      <div class="stack">
        <section class="card stack">
          <div class="badge">sem conteúdo</div>
          <p class="p">não encontrei frase para treinar agora.</p>
          <button class="btn btn--ok" data-nav="#/contexts">escolher contexto</button>
        </section>
      </div>
    `;
    return;
  }

  markSeen(phrase.id);
  const currentContext = getTopic(phrase.topicId);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack" id="viewTrainMain">
        <div class="studyTop">
          <div class="badge studyModeBadge">${STATE.prefs.tiredMode ? "rápido" : "treino"}</div>

          <div class="studyTimer" aria-label="tempo de estudo">
            <div class="studyTimerRow">
              <div class="studyTime"><span>⏱</span> <span id="studyTime">00:00</span></div>
              <div class="studyHint">meta 10:00</div>
            </div>
            <div class="studyBar"><div class="studyFill" id="studyFill"></div></div>
          </div>

          <div class="studyActions">
            <button class="miniBtn" title="contextos" aria-label="contextos" data-nav="#/contexts">🧭</button>
            <button class="miniBtn" title="progresso" aria-label="progresso" data-nav="#/progress">🏅</button>
          </div>
        </div>

        <div class="trainTopRow">
          <div class="badge ${currentContext ? currentContext.color : "tViolet"}">
            ${currentContext ? escapeHTML(currentContext.name) : "Sem contexto"}
          </div>

          <div class="trainStatusRow">
            <button class="btn btn--ghost" data-action="toggleCallMode">
              ${STATE.session.callMode ? "call: on" : "call: off"}
            </button>
            <button class="btn--exitSubtle" data-nav="#/home">sair</button>
          </div>
        </div>

        ${contextQuickPills(STATE.session.currentContextId || "ALL")}

        <div class="counterWrap">
          <div class="counter" id="counterBox">
            <div style="text-align:center">
              <div class="counterVal" id="countVal">-</div>
              <div class="counterSub" id="cycleSub">ciclo</div>
            </div>
          </div>

          <div class="stack" style="min-width:0">
            <div class="phraseArea">
              <div class="kana" id="kanaLine"></div>
              <div class="pt" id="ptLine"></div>
            </div>

            <div class="row">
              <button class="btn btn--muted" data-action="speak" data-rate="1">ouvir normal</button>
              <button class="btn btn--muted" data-action="speak" data-rate="0.8">ouvir devagar</button>
            </div>

            ${phraseFlagsBar(phrase.id)}
          </div>
        </div>

        <div class="trainActionsBar">
          <div class="trainActionMain">
            <button class="btn btn--ok btn--full" data-action="repeat">repeti e entendi</button>
          </div>

          <div class="trainNavArrows">
            <button class="navArrow" data-action="prevPhrase" aria-label="frase anterior">◀</button>
            <button class="navArrow" data-action="nextPhrase" aria-label="próxima frase">▶</button>
          </div>
        </div>

        <div id="newWordsBox"></div>
        <div id="cycleSheet" class="sheet stack" style="display:none"></div>
      </section>

      ${!STATE.prefs.tiredMode ? `
        <section class="card stack">
          <div class="row row--between">
            <div class="badge">próximas do contexto</div>
            <button class="btn" data-action="openContext" data-id="${phrase.topicId}">ver contexto</button>
          </div>
          <div class="list" id="miniPhraseList"></div>
        </section>
      ` : ""}
    </div>
  `;

  renderTrainBodyOnly();
  renderMiniPhraseList();
  startStudyTimerIfNeeded();
  ensureBackTopButton();
  updateBackTopVisibility();
}

function renderTrainBodyOnly() {
  const phrase = getPhrase(STATE.session.currentPhraseId);
  if (!phrase) return;
  const pr = getProg(phrase.id);
  const cs = clamp(pr.cycleStart || 14, 1, 14);
  const count = clamp(pr.count || cs, 1, cs);

  const countVal = $("#countVal");
  const cycleSub = $("#cycleSub");
  const kanaLine = $("#kanaLine");
  const ptLine = $("#ptLine");
  const newWordsBox = $("#newWordsBox");

  if (countVal) countVal.textContent = String(count);
  if (cycleSub) cycleSub.textContent = `ciclo ${cs} → 1`;
  if (kanaLine) setKanaLine(kanaLine, phrase.jp);
  if (ptLine) ptLine.textContent = phrase.pt;
  if (newWordsBox) newWordsBox.innerHTML = renderNewWords(phrase.newWords || []);

  const sheet = $("#cycleSheet");
  if (sheet && sheet.style.display === "block" && count > 1) {
    // mantém se for cycle sheet visível apenas após conclusão
  }
}

function renderMiniPhraseList() {
  const box = $("#miniPhraseList");
  if (!box) return;

  const current = getPhrase(STATE.session.currentPhraseId);
  if (!current) return;

  const list = phrasesByContext(current.topicId)
    .filter(x => x.id !== current.id)
    .slice(0, 4);

  if (!list.length) {
    box.innerHTML = `<div class="small">sem outras frases neste contexto ainda.</div>`;
    return;
  }

  box.innerHTML = list.map(p => {
    const pr = getProg(p.id);
    const pct = phraseProgressPct(pr);
    return `
      <div class="item">
        <div class="itemTop">
          <div style="min-width:0">
            <p class="itemTitle">${escapeHTML(jpStripFurigana(p.jp))}</p>
            <div class="itemMeta">${escapeHTML(p.pt)}</div>
            <div class="pWrap">
              <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
              <div class="pTxt">${Math.round(pct * 100)}%</div>
            </div>
          </div>
          <button class="btn btn--ghost" data-action="jumpToPhrase" data-id="${p.id}">ir</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderContexts(selectedId = null) {
  const contexts = listContexts();
  const headerLabel = selectedId && getTopic(selectedId) ? getTopic(selectedId).name : "contextos";

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">${escapeHTML(headerLabel)}</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <h2 class="h1">Escolha pelo que você precisa viver hoje.</h2>
        <p class="p">Estude por situações reais. Sem confusão, sem painel técnico, sem excesso.</p>

        ${contextQuickPills(selectedId || "ALL")}
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">trilhas práticas</div>
          <div class="badge">utilidade real</div>
        </div>

        <div class="list">
          ${contexts.map(t => {
            const stats = getContextProgress(t.id);
            const next = chooseNextPhraseFromContext(t.id);
            return `
              <div class="item">
                <div class="itemTop">
                  <div style="min-width:0">
                    <p class="itemTitle">${escapeHTML(t.name)}</p>
                    <div class="itemMeta">${stats.mastered}/${stats.total} dominadas</div>
                    <div class="pWrap">
                      <div class="pBar"><div class="pFill" style="transform:scaleX(${stats.pct})"></div></div>
                      <div class="pTxt">${Math.round(stats.pct * 100)}%</div>
                    </div>
                    ${next ? `<div class="small" style="margin-top:8px">próxima útil: ${escapeHTML(jpStripFurigana(next.jp))}</div>` : ``}
                  </div>
                  <div class="manageBtns">
                    <button class="btn btn--ok" data-action="startContextTrain" data-id="${t.id}">treinar</button>
                    <button class="btn btn--ghost" data-action="previewContext" data-id="${t.id}">ver</button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      ${selectedId && getTopic(selectedId) ? renderContextDetailBlock(selectedId) : ""}
    </div>
  `;
}

function renderContextDetailBlock(contextId) {
  const list = phrasesByContext(contextId).slice(0, 8);
  if (!list.length) return "";

  return `
    <section class="card stack">
      <div class="row row--between">
        <div class="badge">${escapeHTML(topicName(contextId))}</div>
        <button class="btn btn--ghost" data-action="startContextTrain" data-id="${contextId}">começar por aqui</button>
      </div>

      <div class="list">
        ${list.map(p => {
          const pr = getProg(p.id);
          const pct = phraseProgressPct(pr);
          return `
            <div class="item">
              <div class="itemTop">
                <div style="min-width:0">
                  <p class="itemTitle">${escapeHTML(jpStripFurigana(p.jp))}</p>
                  <div class="itemMeta">${escapeHTML(p.pt)}</div>
                  <div class="pWrap">
                    <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
                    <div class="pTxt">${Math.round(pct * 100)}%</div>
                  </div>
                </div>
                <button class="btn" data-action="jumpToPhraseAndTrain" data-id="${p.id}">ir</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderProgress() {
  const days = Object.keys(STATE.habit.days || {}).sort();
  const activeDays = days.filter(k => {
    const d = STATE.habit.days[k];
    return ((d.ms || 0) / 60000) >= 2 || (d.cycles || 0) > 0;
  }).length;

  const totalMin = Math.floor(
    days.reduce((acc, k) => acc + ((STATE.habit.days[k]?.ms || 0) / 60000), 0)
  );

  const contexts = listContexts();

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">progresso</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <h2 class="h1">Você está avançando do jeito certo.</h2>
        <p class="p">Sem transformar isso em painel técnico. Só o que ajuda você a seguir.</p>

        <div class="grid2">
          <div class="item">
            <p class="itemTitle">${activeDays}</p>
            <div class="itemMeta">dias ativos</div>
          </div>
          <div class="item">
            <p class="itemTitle">${totalMin}</p>
            <div class="itemMeta">minutos estudados</div>
          </div>
          <div class="item">
            <p class="itemTitle">${STATE.stats.cyclesDone || 0}</p>
            <div class="itemMeta">ciclos concluídos</div>
          </div>
          <div class="item">
            <p class="itemTitle">${STATE.stats.phrasesMastered || 0}</p>
            <div class="itemMeta">frases dominadas</div>
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">por contexto</div>
          <button class="btn btn--ghost" data-nav="#/contexts">ver trilhas</button>
        </div>

        <div class="list">
          ${contexts.map(t => {
            const s = getContextProgress(t.id);
            return `
              <div class="item">
                <div class="itemTop">
                  <div style="min-width:0">
                    <p class="itemTitle">${escapeHTML(t.name)}</p>
                    <div class="itemMeta">${s.mastered}/${s.total} dominadas</div>
                    <div class="pWrap">
                      <div class="pBar"><div class="pFill" style="transform:scaleX(${s.pct})"></div></div>
                      <div class="pTxt">${Math.round(s.pct * 100)}%</div>
                    </div>
                  </div>
                  <button class="btn btn--ghost" data-action="openContext" data-id="${t.id}">abrir</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

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
          <button class="btn btn--full" data-action="toggleTiredMode">${STATE.prefs.tiredMode ? "modo cansado: ligado" : "modo cansado: desligado"}</button>
          <button class="btn btn--full" data-action="toggleCallMode">${STATE.session.callMode ? "call and response: ligado" : "call and response: desligado"}</button>
        </div>

        <div class="sheet stack">
          <div class="small">volume do som</div>
          <input id="vol" type="range" min="0" max="1" step="0.05" value="${STATE.prefs.audio.volume ?? 0.35}" />
          <div class="small">o som só toca depois do primeiro toque no app.</div>
        </div>

        <div class="sep"></div>

        <div class="row">
          <button class="btn btn--ghost" data-nav="#/admin">área avançada</button>
          <button class="btn btn--bad" data-action="resetAll">resetar tudo</button>
        </div>
      </section>
    </div>
  `;
}

function renderAdmin() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">área avançada</div>
          <button class="btn" data-nav="#/settings">voltar</button>
        </div>

        <p class="p">Esta área é administrativa. Fica fora da navegação principal para o app continuar leve para o usuário comum.</p>

        <div class="grid2">
          <button class="btn btn--ghost btn--full" data-nav="#/edit">cadastro e edição</button>
          <button class="btn btn--ghost btn--full" data-nav="#/backup">backup e importação</button>
        </div>

        <div class="sheet stack">
          <div class="small">atalhos</div>
          <div class="row">
            <button class="btn" data-action="exportBackupFile">baixar backup</button>
            <button class="btn" data-action="copyBackupJson">copiar json</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderEdit(editingId = null) {
  const editing = editingId ? getPhrase(editingId) : null;
  const topicId = editing ? editing.topicId : ensureDefaultTopic().id;
  const nwVal = editing?.newWords?.map(x => `${x.jp}=${x.pt}`).join(", ") || "";

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">${editing ? "editar frase" : "cadastro"}</div>
          <button class="btn" data-nav="#/admin">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="small">contexto</div>
          <select class="btn selectBtn" id="topicSel">
            ${(STATE.bank.topics || []).map(t => `<option value="${t.id}" ${t.id === topicId ? "selected" : ""}>${escapeHTML(t.name)}</option>`).join("")}
          </select>

          <div class="small">jp</div>
          <input id="inJp" class="btn" style="height:56px; width:100%; text-align:left" value="${escapeHTML(editing?.jp || "")}" />

          <div class="small">pt</div>
          <input id="inPt" class="btn" style="height:56px; width:100%; text-align:left" value="${escapeHTML(editing?.pt || "")}" />

          <div class="small">palavras úteis (jp=pt, jp=pt)</div>
          <input id="inNW" class="btn" style="height:56px; width:100%; text-align:left" value="${escapeHTML(nwVal)}" />

          <div class="small">prioridade (1 a 5)</div>
          <select class="btn selectBtn" id="prioritySel">
            ${[1,2,3,4,5].map(n => `<option value="${n}" ${(editing?.priority || 3) === n ? "selected" : ""}>${n}</option>`).join("")}
          </select>

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="${editing ? "saveEditPhrase" : "saveNewPhrase"}" data-id="${editing?.id || ""}">
              ${editing ? "salvar alterações" : "salvar frase"}
            </button>
            ${editing ? `<button class="btn btn--bad btn--full" data-action="deletePhrase" data-id="${editing.id}">excluir frase</button>` : `<button class="btn btn--muted btn--full" data-nav="#/admin">cancelar</button>`}
          </div>

          <div class="small" id="editMsg"></div>
        </div>

        <div class="sheet stack">
          <div class="small">criar novo contexto</div>
          <div class="topicAddRow">
            <input id="topicNewName" class="btn" placeholder="ex: segurança, chefe, bicicleta..." />
            <button class="btn btn--ghost" data-action="createTopicInline">adicionar</button>
          </div>
          <div class="small" id="topicMsg"></div>
        </div>

        <div class="list" id="adminPhraseList"></div>
      </section>
    </div>
  `;

  renderAdminPhraseList();
}

function renderAdminPhraseList() {
  const box = $("#adminPhraseList");
  if (!box) return;

  box.innerHTML = (STATE.bank.phrases || []).slice().reverse().slice(0, 40).map(p => {
    const pr = getProg(p.id);
    return `
      <div class="item">
        <div class="itemTop">
          <div style="min-width:0">
            <p class="itemTitle">${escapeHTML(jpStripFurigana(p.jp))}</p>
            <div class="itemMeta">${escapeHTML(p.pt)} • ${escapeHTML(topicName(p.topicId))} • ${pr.status === "mastered" ? "dominada" : "treino"}</div>
          </div>
          <button class="btn btn--ghost" data-action="openEditPhrase" data-id="${p.id}">editar</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderBackup() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">backup</div>
          <button class="btn" data-nav="#/admin">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="badge">exportar</div>
          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="copyBackupJson">copiar json</button>
            <button class="btn btn--ok btn--full" data-action="exportBackupFile">baixar arquivo</button>
          </div>
          <div class="small">no celular, baixar arquivo costuma ser o modo mais confiável.</div>
        </div>

        <div class="sheet stack">
          <div class="badge">importar</div>
          <div class="grid2">
            <button class="btn btn--muted btn--full" data-action="importBackupText">importar do texto</button>
            <button class="btn btn--muted btn--full" data-action="triggerImportFile">importar arquivo</button>
          </div>

          <input id="fileImport" type="file" accept=".json,application/json" style="display:none" />
          <div class="small">cole o json aqui</div>
          <textarea id="importBox" class="btn" style="height:160px; width:100%; text-align:left; padding:12px; border-radius:18px;"></textarea>
          <div class="small" id="backupMsg"></div>
        </div>
      </section>
    </div>
  `;
}

/* =========================================================
   BACKUP
   ========================================================= */
function buildBackupPayload() {
  return {
    schema: "nihongo321_backup_v2",
    exportedAt: new Date().toISOString(),
    state: STATE
  };
}

function validateAndLoadBackup(parsed, msgEl) {
  if (!parsed || !parsed.state) {
    if (msgEl) msgEl.textContent = "json inválido.";
    toast("json inválido");
    beep("tuk");
    return false;
  }

  const migrated = migrateToV4(parsed.state);
  STATE = migrated;
  saveState();
  refreshHUD();

  if (msgEl) msgEl.textContent = "importado ✅";
  toast("importado ✅");
  beep("ding");
  nav("#/home");
  return true;
}

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

/* =========================================================
   BACK TO TOP
   ========================================================= */
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

/* =========================================================
   EVENTS
   ========================================================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.nav) {
    if (btn.dataset.nav !== "#/train") clearCallFlow();
    nav(btn.dataset.nav);
    return;
  }

  const act = btn.dataset.action;

  if (act === "finishOnboarding") {
    unlockAudio();
    STATE.prefs.onboardingDone = true;
    saveState();
    toast("pronto. agora é treino ✅");
    render();
    return;
  }

  if (act === "startRecommendedTrain") {
    unlockAudio();
    const ctx = getRecommendedContextId();
    const next = chooseNextPhraseFromContext(ctx);
    if (next) setCurrentPhrase(next.id);
    STATE.session.currentContextId = next?.topicId || ctx;
    saveState();
    nav("#/train");
    return;
  }

  if (act === "setContext") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    STATE.session.currentContextId = id;
    saveState();
    toast(id === "ALL" ? "filtro: tudo ✅" : "filtro aplicado ✅");

    if (route() === "#/train") {
      const next = chooseNextPhraseFromContext(id === "ALL" ? getRecommendedContextId() : id);
      if (next) setCurrentPhrase(next.id);
      render();
    } else if (route() === "#/contexts") {
      renderContexts(id !== "ALL" && !["FAVORITES","DIFFICULT","URGENT","REVIEW"].includes(id) ? id : null);
    } else {
      render();
    }
    return;
  }

  if (act === "openContext") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    if (["FAVORITES", "DIFFICULT", "URGENT", "REVIEW"].includes(id)) {
      STATE.session.currentContextId = id;
      const next = chooseNextPhraseFromContext(id);
      if (next) setCurrentPhrase(next.id);
      saveState();
      nav("#/train");
      return;
    }

    renderContexts(id);
    return;
  }

  if (act === "previewContext") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    renderContexts(id);
    return;
  }

  if (act === "startContextTrain") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    STATE.session.currentContextId = id;
    const next = chooseNextPhraseFromContext(id);
    if (next) setCurrentPhrase(next.id);
    saveState();
    nav("#/train");
    return;
  }

  if (act === "jumpToPhrase") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    setCurrentPhrase(id);
    resetCountForPhrase(id);
    saveState();
    renderTrainBodyOnly();
    renderMiniPhraseList();
    toast("frase carregada ✅");
    beep("pop");
    return;
  }

  if (act === "jumpToPhraseAndTrain") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    setCurrentPhrase(id);
    resetCountForPhrase(id);
    saveState();
    nav("#/train");
    return;
  }

  if (act === "repeat") {
    onRepeat();
    return;
  }

  if (act === "prevPhrase") {
    unlockAudio();
    gotoPrevPhrase();
    render();
    beep("pop");
    return;
  }

  if (act === "nextPhrase") {
    unlockAudio();
    gotoNextPhrase();
    render();
    beep("pop");
    return;
  }

  if (act === "speak") {
    unlockAudio();
    const rate = Number(btn.dataset.rate || "1");
    const phrase = getPhrase(STATE.session.currentPhraseId);
    if (!phrase) return;

    if (STATE.session.callMode) {
      callAndResponse(phrase, rate);
    } else {
      speakPhrase(phrase, rate);
    }
    return;
  }

  if (act === "toggleFavorite") {
    unlockAudio();
    toggleFlag(btn.dataset.id, "isFavorite");
    render();
    toast("favorita atualizada ✅");
    return;
  }

  if (act === "toggleDifficult") {
    unlockAudio();
    toggleFlag(btn.dataset.id, "isDifficult");
    render();
    toast("marcação difícil atualizada ✅");
    return;
  }

  if (act === "toggleUrgent") {
    unlockAudio();
    toggleFlag(btn.dataset.id, "isUrgent");
    render();
    toast("marcação urgente atualizada ✅");
    return;
  }

  if (act === "toggleSound") {
    unlockAudio();
    STATE.prefs.audio.enabled = !STATE.prefs.audio.enabled;
    saveState();
    refreshHUD();
    render();
    toast(STATE.prefs.audio.enabled ? "som ligado" : "som desligado");
    return;
  }

  if (act === "toggleVibe") {
    STATE.prefs.haptics.enabled = !STATE.prefs.haptics.enabled;
    saveState();
    refreshHUD();
    render();
    toast(STATE.prefs.haptics.enabled ? "vibração ligada" : "vibração desligada");
    return;
  }

  if (act === "toggleTiredMode") {
    STATE.prefs.tiredMode = !STATE.prefs.tiredMode;
    saveState();
    render();
    toast(STATE.prefs.tiredMode ? "modo cansado ligado" : "modo cansado desligado");
    return;
  }

  if (act === "toggleCallMode") {
    unlockAudio();
    clearCallFlow();
    STATE.session.callMode = !STATE.session.callMode;
    saveState();
    render();
    toast(STATE.session.callMode ? "call and response ligado" : "call and response desligado");
    return;
  }

  if (act === "createTopicInline") {
    unlockAudio();
    const input = $("#topicNewName");
    const msg = $("#topicMsg");
    const name = normalizeName(input?.value || "");

    if (!name) {
      if (msg) msg.textContent = "nome vazio.";
      toast("nome vazio");
      beep("tuk");
      return;
    }

    const exists = (STATE.bank.topics || []).some(t => t.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      if (msg) msg.textContent = "esse contexto já existe.";
      toast("contexto já existe");
      beep("tuk");
      return;
    }

    const topic = {
      id: uid("topic"),
      name,
      color: pickTopicColor((STATE.bank.topics || []).length),
      createdAt: now(),
      updatedAt: now()
    };

    STATE.bank.topics.unshift(topic);
    saveState();

    if (input) input.value = "";
    if (msg) msg.textContent = "contexto criado ✅";
    toast("contexto criado ✅");
    renderEdit();
    return;
  }

  if (act === "saveNewPhrase") {
    unlockAudio();
    const jp = ($("#inJp")?.value || "").trim();
    const pt = ($("#inPt")?.value || "").trim();
    const nw = parseNewWords($("#inNW")?.value || "");
    const topicId = $("#topicSel")?.value || ensureDefaultTopic().id;
    const priority = Number($("#prioritySel")?.value || 3);
    const msg = $("#editMsg");

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

    const id = uid("ph");
    STATE.bank.phrases.unshift({
      id,
      jp,
      pt,
      topicId,
      priority,
      tags: [],
      newWords: nw,
      createdAt: now(),
      updatedAt: now()
    });

    STATE.progress[id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      masteredAt: null,
      seenAt: null,
      isFavorite: false,
      isDifficult: false,
      isUrgent: false,
      history: []
    };

    saveState();
    toast("frase salva ✅");
    beep("ding");
    renderEdit();
    return;
  }

  if (act === "openEditPhrase") {
    const id = btn.dataset.id;
    if (!id) return;
    renderEdit(id);
    return;
  }

  if (act === "saveEditPhrase") {
    unlockAudio();
    const id = btn.dataset.id;
    const p = getPhrase(id);
    const msg = $("#editMsg");
    if (!p) return;

    const jp = ($("#inJp")?.value || "").trim();
    const pt = ($("#inPt")?.value || "").trim();
    const nw = parseNewWords($("#inNW")?.value || "");
    const topicId = $("#topicSel")?.value || ensureDefaultTopic().id;
    const priority = Number($("#prioritySel")?.value || 3);

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

    p.jp = jp;
    p.pt = pt;
    p.newWords = nw;
    p.topicId = topicId;
    p.priority = priority;
    p.updatedAt = now();
    saveState();

    toast("alterado ✅");
    beep("ding");
    nav("#/admin");
    return;
  }

  if (act === "deletePhrase") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;
    const ok = confirm("Excluir esta frase?");
    if (!ok) return;

    const idx = STATE.bank.phrases.findIndex(p => p.id === id);
    if (idx >= 0) STATE.bank.phrases.splice(idx, 1);
    delete STATE.progress[id];

    if (STATE.session.currentPhraseId === id) {
      STATE.session.currentPhraseId = STATE.bank.phrases[0]?.id || null;
    }

    saveState();
    toast("frase excluída ✅");
    beep("tuk");
    renderEdit();
    return;
  }

  if (act === "exportBackupFile") {
    const payload = buildBackupPayload();
    const txt = JSON.stringify(payload, null, 2);
    const d = new Date();
    const filename = `nihongo321-backup-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}.json`;
    downloadTextFile(filename, txt);
    toast("backup baixado ✅");
    beep("ding");
    return;
  }

  if (act === "copyBackupJson") {
    const payload = buildBackupPayload();
    const txt = JSON.stringify(payload, null, 2);

    navigator.clipboard?.writeText(txt).then(() => {
      toast("backup copiado ✅");
      beep("ding");
    }).catch(() => {
      const box = $("#importBox");
      if (box) box.value = txt;
      toast("copie manualmente");
      beep("tuk");
    });
    return;
  }

  if (act === "triggerImportFile") {
    const input = $("#fileImport");
    if (input) {
      input.value = "";
      input.click();
    }
    return;
  }

  if (act === "importBackupText") {
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

  if (act === "resetAll") {
    clearCallFlow();
    localStorage.removeItem(LS_KEY);
    STATE = defaultState();
    saveState();
    toast("resetado ✅");
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
    toast(STATE.prefs.haptics.enabled ? "vibração ligada" : "vibração desligada");
    return;
  }
});

document.addEventListener("input", (e) => {
  const el = e.target;
  if (el?.id === "vol") {
    STATE.prefs.audio.volume = clamp(Number(el.value || 0.35), 0, 1);
    saveState();
  }
});

document.addEventListener("change", (e) => {
  const el = e.target;
  if (el?.id === "fileImport") {
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

window.addEventListener("hashchange", () => {
  clearCallFlow();
  render();
  startStudyTimerIfNeeded();
  updateBackTopVisibility();
});

/* =========================================================
   INIT
   ========================================================= */
(function init() {
  ensureDefaultTopic();
  ensureHabitToday();
  syncHabitMs();
  refreshHUD();

  if (!location.hash) nav("#/home");

  ensureBackTopButton();
  hookBackTopScroll();
  updateBackTopVisibility();

  render();
  startStudyTimerIfNeeded();
})();