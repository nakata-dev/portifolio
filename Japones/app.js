/* =========================================================
   NIHONGO321 (SPA leve, só 105X)
   + Backup por arquivo (mobile friendly)
   + Tópicos (conteúdo organizado)
   ========================================================= */

const LS_KEY = "jp_105x_v3";

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
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
  return String(s || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

/* ---------- JP validation ----------
   Permite:
   - hiragana \u3040-\u309F
   - katakana \u30A0-\u30FF
   - kanji (CJK) \u4E00-\u9FFF
   - letras latinas comuns usadas em jap (GB, Wi-Fi etc)
   - números half/full width
   - espaço normal e japonês
   - pontuação básica
   - furigana manual com chaves: { }
   - parênteses japoneses: （ ）
*/
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

/* ---------- Furigana parsing ----------
   base{reading} -> ruby
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

/* ---------- topics ---------- */

function topicPalette() {
  return [
    "tRose", "tViolet", "tBlue", "tCyan", "tGreen", "tAmber", "tPink", "tMint"
  ];
}

function pickTopicColor(i) {
  const p = topicPalette();
  return p[i % p.length];
}

function defaultTopic() {
  const t = now();
  return { id: "topic_default", name: "Frases aleatórias", color: "tViolet", createdAt: t, updatedAt: t };
}

function defaultTopicNames() {
  return [
    /* =========================================================
       FAÇA UPGRADE DE SEUS TEMAS AQUI
       - adicione novos nomes de tópicos
       - remova apenas se souber o impacto
       - mantenha cada tema entre aspas e separado por vírgula
       ========================================================= */
    "Frases aleatórias",
    "No aeroporto",
    "Na prefeitura",
    "No correio",
    "Na fábrica",
    "No restaurante",
    "No mercado",
    "Na loja de carros",
    "No konbini",
    "Na farmácia",
    "No hospital",
    "No trem / estação",
    "No banco",
    "No celular / internet",
    "Emergência",
    "No trabalho",
    "No RH",
    "Em casa / apartamento",
    "Lixo e reciclagem"
    /* =========================================================
       FINAL DO TRECHO DE UPGRADE DOS TEMAS
       ========================================================= */
  ];
}

function slugifyTopicName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function makeCoreTopic(name, index) {
  const t = now();
  const isDefault = name === "Frases aleatórias";
  return {
    id: isDefault ? "topic_default" : `topic_${slugifyTopicName(name)}`,
    name,
    color: isDefault ? "tViolet" : pickTopicColor(index),
    createdAt: t,
    updatedAt: t
  };
}

function seedTopics() {
  return defaultTopicNames().map((name, i) => makeCoreTopic(name, i));
}

function topicIdMapFromTopics(topics) {
  const map = {};
  for (const t of topics) map[t.name] = t.id;
  return map;
}

function getTopicIdSafe(topicIds, topicName, fallbackId = "topic_default") {
  const target = String(topicName || "").trim().toLowerCase();

  for (const key in topicIds) {
    if (String(key || "").trim().toLowerCase() === target) {
      return topicIds[key];
    }
  }

  return fallbackId;
}

/* ---------- seed ---------- */

function seedPhrases(topicIds) {
  const t = now();
  const def = topicIds["Frases aleatórias"] || "topic_default";
  const prefeitura = getTopicIdSafe(topicIds, "Na prefeitura", def);

  return [
    /* =========================================================
       FAÇA UPGRADE DE SUAS FRASES AQUI
       - este é o bloco principal de frases da biblioteca
       - cada frase segue a estrutura:
         { id:"...", jp:"...", pt:"...", newWords:[{jp:"...", pt:"..."}], topicId:..., createdAt:t, updatedAt:t }
       - em "newWords", você pode adicionar vocabulário útil daquela frase
       - para frases do tema padrão, use topicId:def
       - para frases de tema específico, use:
         topicId:topicIds["Nome do tema"]
       ========================================================= */

    { id:"ph_001", jp:"おはよう", pt:"bom dia", newWords:[{jp:"おはよう", pt:"bom dia"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_002", jp:"おつかれさま", pt:"bom trabalho / valeu pelo esforço", newWords:[{jp:"おつかれさま", pt:"bom trabalho"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_003", jp:"きょうは つかれた", pt:"hoje eu estou cansado", newWords:[{jp:"きょう",pt:"hoje"},{jp:"つかれた",pt:"cansado"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_004", jp:"ねむい", pt:"estou com sono", newWords:[{jp:"ねむい",pt:"com sono"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_005", jp:"いま いそがしい", pt:"agora estou ocupado", newWords:[{jp:"いま",pt:"agora"},{jp:"いそがしい",pt:"ocupado"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_006", jp:"ちょっと まって", pt:"espera um pouco", newWords:[{jp:"ちょっと",pt:"um pouco"},{jp:"まって",pt:"espera"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_007", jp:"だいじょうぶ", pt:"tudo bem / está ok", newWords:[{jp:"だいじょうぶ",pt:"tudo bem"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_008", jp:"もういちど おねがい", pt:"de novo, por favor", newWords:[{jp:"もういちど",pt:"mais uma vez"},{jp:"おねがい",pt:"por favor"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_009", jp:"ゆっくり おねがい", pt:"devagar, por favor", newWords:[{jp:"ゆっくり",pt:"devagar"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_010", jp:"わからない", pt:"não entendi / não sei", newWords:[{jp:"わからない",pt:"não entendi"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_011", jp:"これ どこ", pt:"onde fica isto?", newWords:[{jp:"これ",pt:"isto"},{jp:"どこ",pt:"onde"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_012", jp:"これ なに", pt:"o que é isto?", newWords:[{jp:"なに",pt:"o que"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_013", jp:"たすけて", pt:"me ajuda", newWords:[{jp:"たすけて",pt:"me ajuda"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_014", jp:"あぶない", pt:"perigoso", newWords:[{jp:"あぶない",pt:"perigoso"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_015", jp:"きをつけて", pt:"cuidado", newWords:[{jp:"きをつけて",pt:"cuidado"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_016", jp:"ここで まって", pt:"espera aqui", newWords:[{jp:"ここ",pt:"aqui"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_017", jp:"これを つかう", pt:"usar isto", newWords:[{jp:"つかう",pt:"usar"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_018", jp:"それは だめ", pt:"isso não pode", newWords:[{jp:"それ",pt:"isso"},{jp:"だめ",pt:"não pode"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_019", jp:"もう いい", pt:"já está bom / pode parar", newWords:[{jp:"もう",pt:"já"},{jp:"いい",pt:"bom"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_020", jp:"あとで はなそう", pt:"vamos falar depois", newWords:[{jp:"あとで",pt:"depois"},{jp:"はなそう",pt:"vamos falar"}], topicId:def, createdAt:t, updatedAt:t },

    /* =========================================================
       FAÇA UPGRADE DAS FRASES NOVAS POR TEMA AQUI
       - abaixo ficam exemplos de frases vinculadas a temas específicos
       - para criar novas frases temáticas, siga este padrão:
         topicId:topicIds["No aeroporto"]
         topicId:topicIds["No correio"]
         topicId:topicIds["Na fábrica"]
         etc.
       ========================================================= */

    { id:"ph_021", jp:"パスポートを 見{み}せても いいですか。", pt:"posso mostrar o passaporte?", newWords:[{jp:"パスポート",pt:"passaporte"},{jp:"見せる",pt:"mostrar"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },
    { id:"ph_022", jp:"この荷物{にもつ}を 送りたいです。", pt:"quero enviar esta bagagem / encomenda.", newWords:[{jp:"荷物",pt:"bagagem / encomenda"},{jp:"送る",pt:"enviar"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },
    { id:"ph_023", jp:"今日{きょう}の ラインは どこですか。", pt:"onde é a linha de hoje?", newWords:[{jp:"今日",pt:"hoje"},{jp:"ライン",pt:"linha de produção"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },
    { id:"ph_024", jp:"おすすめは 何{なん}ですか。", pt:"qual é a recomendação da casa?", newWords:[{jp:"おすすめ",pt:"recomendação"},{jp:"何",pt:"o que / qual"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },
    { id:"ph_025", jp:"この野菜{やさい}は いくらですか。", pt:"quanto custa este legume?", newWords:[{jp:"野菜",pt:"legume / verdura"},{jp:"いくら",pt:"quanto"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },
    { id:"ph_026", jp:"中古車{ちゅうこしゃ}を 見{み}たいです。", pt:"quero ver carros usados.", newWords:[{jp:"中古車",pt:"carro usado"},{jp:"見たい",pt:"quero ver"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },
    { id:"ph_027", jp:"レジ袋{ぶくろ}は いりません。", pt:"não preciso de sacola.", newWords:[{jp:"レジ袋",pt:"sacola do caixa"},{jp:"いりません",pt:"não preciso"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },
    { id:"ph_028", jp:"のどが 痛{いた}いです。", pt:"minha garganta está doendo.", newWords:[{jp:"のど",pt:"garganta"},{jp:"痛い",pt:"doendo"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },
    { id:"ph_029", jp:"日本語{にほんご}が あまり わかりません。", pt:"eu não entendo muito japonês.", newWords:[{jp:"日本語",pt:"língua japonesa"},{jp:"あまり",pt:"não muito"}], topicId:def, createdAt:t, updatedAt:t },
    { id:"ph_030", jp:"もう少{すこ}し ゆっくり 話{はな}して ください。", pt:"por favor, fale um pouco mais devagar.", newWords:[{jp:"もう少し",pt:"um pouco mais"},{jp:"話して",pt:"falar"}], topicId:def, createdAt:t, updatedAt:t },

    { id:"ph_031", jp:"搭乗口{とうじょうぐち}は どこですか。", pt:"onde fica o portão de embarque?", newWords:[{jp:"搭乗口",pt:"portão de embarque"},{jp:"どこ",pt:"onde"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO AEROPORTO*/

{ id:"ph_032", jp:"この便{びん}は 何時{なんじ}に 出発{しゅっぱつ}しますか。", pt:"a que horas este voo parte?", newWords:[{jp:"便",pt:"voo"},{jp:"出発",pt:"partida / sair"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_033", jp:"チェックインカウンターは どこですか。", pt:"onde fica o balcão de check-in?", newWords:[{jp:"チェックインカウンター",pt:"balcão de check-in"},{jp:"どこ",pt:"onde"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_034", jp:"荷物{にもつ}を 預{あず}けたいです。", pt:"quero despachar a bagagem.", newWords:[{jp:"荷物",pt:"bagagem"},{jp:"預ける",pt:"despachar / deixar guardado"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_035", jp:"機内持{きないも}ち込{こ}みは できますか。", pt:"posso levar isso na bagagem de mão?", newWords:[{jp:"機内持ち込み",pt:"bagagem de mão"},{jp:"できますか",pt:"pode / é possível?"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_036", jp:"この飛行機{ひこうき}は 遅{おく}れていますか。", pt:"este avião está atrasado?", newWords:[{jp:"飛行機",pt:"avião"},{jp:"遅れる",pt:"atrasar"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_037", jp:"入国審査{にゅうこくしんさ}は どこですか。", pt:"onde fica a imigração?", newWords:[{jp:"入国審査",pt:"imigração / controle de entrada"},{jp:"どこ",pt:"onde"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_038", jp:"乗{の}り継{つ}ぎの 時間{じかん}は ありますか。", pt:"há tempo para a conexão?", newWords:[{jp:"乗り継ぎ",pt:"conexão"},{jp:"時間",pt:"tempo"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_039", jp:"このゲートで 合{あ}っていますか。", pt:"é neste portão mesmo?", newWords:[{jp:"ゲート",pt:"portão"},{jp:"合っている",pt:"estar correto"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

{ id:"ph_040", jp:"到着口{とうちゃくぐち}は どこですか。", pt:"onde fica a área de chegada?", newWords:[{jp:"到着口",pt:"área / portão de chegada"},{jp:"どこ",pt:"onde"}], topicId:topicIds["No aeroporto"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO CORREIO*/

{ id:"ph_041", jp:"この荷物{にもつ}を 送りたいです。", pt:"quero enviar esta encomenda.", newWords:[{jp:"荷物",pt:"encomenda / pacote"},{jp:"送る",pt:"enviar"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_042", jp:"ブラジルまで 送{おく}れますか。", pt:"pode enviar para o Brasil?", newWords:[{jp:"ブラジル",pt:"Brasil"},{jp:"送れますか",pt:"pode enviar?"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_043", jp:"送料{そうりょう}は いくらですか。", pt:"quanto custa o frete?", newWords:[{jp:"送料",pt:"frete"},{jp:"いくら",pt:"quanto"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_044", jp:"いちばん 安{やす}い 方法{ほうほう}で お願{ねが}いします。", pt:"quero a forma mais barata, por favor.", newWords:[{jp:"安い",pt:"barato"},{jp:"方法",pt:"forma / método"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_045", jp:"何日{なんにち}ぐらいで 届{とど}きますか。", pt:"em quantos dias mais ou menos chega?", newWords:[{jp:"何日ぐらい",pt:"em quantos dias mais ou menos"},{jp:"届く",pt:"chegar / ser entregue"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_046", jp:"追跡番号{ついせきばんごう}は ありますか。", pt:"tem número de rastreamento?", newWords:[{jp:"追跡番号",pt:"número de rastreamento"},{jp:"ありますか",pt:"tem?"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_047", jp:"この箱{はこ}を 使{つか}っても いいですか。", pt:"posso usar esta caixa?", newWords:[{jp:"箱",pt:"caixa"},{jp:"使う",pt:"usar"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_048", jp:"伝票{でんぴょう}の 書{か}き方{かた}を 教{おし}えて ください。", pt:"por favor, me ensine como preencher o formulário de envio.", newWords:[{jp:"伝票",pt:"formulário / etiqueta de envio"},{jp:"書き方",pt:"modo de escrever / preencher"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_049", jp:"こわれものです。", pt:"é frágil.", newWords:[{jp:"こわれもの",pt:"frágil"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

{ id:"ph_050", jp:"今日中{きょうじゅう}に 発送{はっそう}できますか。", pt:"consegue enviar ainda hoje?", newWords:[{jp:"今日中",pt:"ainda hoje / dentro de hoje"},{jp:"発送",pt:"envio / despacho"}], topicId:topicIds["No correio"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO FÁBRICA*/

{ id:"ph_051", jp:"今日{きょう}の 持{も}ち場{ば}は どこですか。", pt:"qual é o meu posto de hoje?", newWords:[{jp:"持ち場",pt:"posto de trabalho"},{jp:"今日",pt:"hoje"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_052", jp:"この作業{さぎょう}を もう一度{いちど} 教{おし}えて ください。", pt:"por favor, me ensine este trabalho mais uma vez.", newWords:[{jp:"作業",pt:"trabalho / tarefa"},{jp:"もう一度",pt:"mais uma vez"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_053", jp:"次{つぎ}は 何{なに}を すれば いいですか。", pt:"o que eu devo fazer em seguida?", newWords:[{jp:"次",pt:"seguinte / próximo"},{jp:"何",pt:"o que"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_054", jp:"これは どこに 置{お}けば いいですか。", pt:"onde devo colocar isto?", newWords:[{jp:"置く",pt:"colocar"},{jp:"どこ",pt:"onde"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_055", jp:"この部品{ぶひん}が 足{た}りません。", pt:"está faltando esta peça.", newWords:[{jp:"部品",pt:"peça / componente"},{jp:"足りません",pt:"está faltando"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_056", jp:"機械{きかい}が 止{と}まりました。", pt:"a máquina parou.", newWords:[{jp:"機械",pt:"máquina"},{jp:"止まりました",pt:"parou"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_057", jp:"不良品{ふりょうひん}が 出{で}ました。", pt:"saiu uma peça com defeito.", newWords:[{jp:"不良品",pt:"produto com defeito"},{jp:"出ました",pt:"apareceu / saiu"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_058", jp:"トイレに 行{い}っても いいですか。", pt:"posso ir ao banheiro?", newWords:[{jp:"トイレ",pt:"banheiro"},{jp:"行ってもいいですか",pt:"posso ir?"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_059", jp:"休憩{きゅうけい}は 何時{なんじ}から ですか。", pt:"a que horas começa o intervalo?", newWords:[{jp:"休憩",pt:"intervalo / descanso"},{jp:"何時",pt:"que horas"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

{ id:"ph_060", jp:"手伝{てつだ}って もらえますか。", pt:"você pode me ajudar?", newWords:[{jp:"手伝って",pt:"ajudar"},{jp:"もらえますか",pt:"pode fazer para mim?"}], topicId:topicIds["Na fábrica"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO RESTAURANTE*/

{ id:"ph_061", jp:"2人{ふたり}です。", pt:"somos duas pessoas.", newWords:[{jp:"2人",pt:"duas pessoas"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_062", jp:"空{あ}いている 席{せき}は ありますか。", pt:"tem mesa disponível?", newWords:[{jp:"空いている",pt:"livre / disponível"},{jp:"席",pt:"assento / mesa"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_063", jp:"メニューを お願{ねが}いします。", pt:"o cardápio, por favor.", newWords:[{jp:"メニュー",pt:"cardápio"},{jp:"お願いします",pt:"por favor"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_064", jp:"おすすめは 何{なん}ですか。", pt:"qual é a recomendação da casa?", newWords:[{jp:"おすすめ",pt:"recomendação"},{jp:"何",pt:"o que / qual"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_065", jp:"これを 1つ お願{ねが}いします。", pt:"quero um deste, por favor.", newWords:[{jp:"これ",pt:"isto"},{jp:"1つ",pt:"um"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_066", jp:"水{みず}を ください。", pt:"água, por favor.", newWords:[{jp:"水",pt:"água"},{jp:"ください",pt:"por favor / me dê"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_067", jp:"辛{から}く しないで ください。", pt:"por favor, não faça picante.", newWords:[{jp:"辛く",pt:"picante"},{jp:"しないでください",pt:"não faça / não coloque"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_068", jp:"持{も}ち帰{かえ}り できますか。", pt:"posso levar para viagem?", newWords:[{jp:"持ち帰り",pt:"para viagem / levar embora"},{jp:"できますか",pt:"é possível?"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_069", jp:"お会計{かいけい}を お願{ねが}いします。", pt:"a conta, por favor.", newWords:[{jp:"お会計",pt:"conta / pagamento"},{jp:"お願いします",pt:"por favor"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

{ id:"ph_070", jp:"カードは 使{つか}えますか。", pt:"posso pagar com cartão?", newWords:[{jp:"カード",pt:"cartão"},{jp:"使えますか",pt:"pode usar?"}], topicId:topicIds["No restaurante"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO MERCADO*/

{ id:"ph_071", jp:"これは いくらですか。", pt:"quanto custa isto?", newWords:[{jp:"これ",pt:"isto"},{jp:"いくら",pt:"quanto"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_072", jp:"もう少{すこ}し 安{やす}いのは ありますか。", pt:"tem algum um pouco mais barato?", newWords:[{jp:"もう少し",pt:"um pouco mais"},{jp:"安い",pt:"barato"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_073", jp:"いちばん 人気{にんき}の 商品{しょうひん}は どれですか。", pt:"qual é o produto mais popular?", newWords:[{jp:"人気",pt:"popular"},{jp:"商品",pt:"produto"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_074", jp:"卵{たまご}は どこですか。", pt:"onde ficam os ovos?", newWords:[{jp:"卵",pt:"ovos"},{jp:"どこ",pt:"onde"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_075", jp:"この肉{にく}は ブラジル産{さん}ですか。", pt:"esta carne é do Brasil?", newWords:[{jp:"肉",pt:"carne"},{jp:"ブラジル産",pt:"produto do Brasil"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_076", jp:"賞味期限{しょうみきげん}は いつですか。", pt:"qual é a data de validade?", newWords:[{jp:"賞味期限",pt:"data de validade"},{jp:"いつ",pt:"quando"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_077", jp:"袋{ふくろ}は いりません。", pt:"não preciso de sacola.", newWords:[{jp:"袋",pt:"sacola"},{jp:"いりません",pt:"não preciso"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_078", jp:"これを 別々{べつべつ}に 包装{ほうそう}して ください。", pt:"por favor, embale isto separadamente.", newWords:[{jp:"別々",pt:"separadamente"},{jp:"包装",pt:"embalagem"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_079", jp:"このポイントカードは 使{つか}えますか。", pt:"posso usar este cartão de pontos?", newWords:[{jp:"ポイントカード",pt:"cartão de pontos"},{jp:"使えますか",pt:"pode usar?"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

{ id:"ph_080", jp:"支払{しはら}いは 現金{げんきん}だけですか。", pt:"o pagamento é só em dinheiro?", newWords:[{jp:"支払い",pt:"pagamento"},{jp:"現金",pt:"dinheiro em espécie"}], topicId:topicIds["No mercado"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NA LOJA DE CARROS*/

{ id:"ph_081", jp:"この車{くるま}の 走行距離{そうこうきょり}は どのくらいですか。", pt:"qual é a quilometragem deste carro?", newWords:[{jp:"車",pt:"carro"},{jp:"走行距離",pt:"quilometragem"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_082", jp:"修復歴{しゅうふくれき}は ありますか。", pt:"ele tem histórico de reparo / batida?", newWords:[{jp:"修復歴",pt:"histórico de reparo / batida"},{jp:"ありますか",pt:"tem?"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_083", jp:"車検{しゃけん}は いつまでですか。", pt:"até quando vai o shaken deste carro?", newWords:[{jp:"車検",pt:"inspeção veicular / shaken"},{jp:"いつまで",pt:"até quando"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_084", jp:"試乗{しじょう}できますか。", pt:"posso fazer um test drive?", newWords:[{jp:"試乗",pt:"test drive"},{jp:"できますか",pt:"é possível?"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_085", jp:"燃費{ねんぴ}は どのくらいですか。", pt:"como é o consumo de combustível?", newWords:[{jp:"燃費",pt:"consumo de combustível"},{jp:"どのくらい",pt:"quanto / aproximadamente"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_086", jp:"総額{そうがく}は いくらに なりますか。", pt:"qual fica o valor total no fim?", newWords:[{jp:"総額",pt:"valor total"},{jp:"いくら",pt:"quanto"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_087", jp:"分割払{ぶんかつばら}いは できますか。", pt:"posso pagar parcelado?", newWords:[{jp:"分割払い",pt:"pagamento parcelado"},{jp:"できますか",pt:"é possível?"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_088", jp:"保証{ほしょう}は ついていますか。", pt:"ele vem com garantia?", newWords:[{jp:"保証",pt:"garantia"},{jp:"ついていますか",pt:"vem com / está incluído?"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_089", jp:"名義変更{めいぎへんこう}の 手続{てつづ}きも お願{ねが}いできますか。", pt:"vocês também podem cuidar da transferência de nome?", newWords:[{jp:"名義変更",pt:"transferência de propriedade / nome"},{jp:"手続き",pt:"procedimento / trâmite"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

{ id:"ph_090", jp:"この車{くるま}は すぐに 納車{のうしゃ}できますか。", pt:"este carro pode ser entregue logo?", newWords:[{jp:"納車",pt:"entrega do carro"},{jp:"すぐに",pt:"logo / rapidamente"}], topicId:topicIds["Na loja de carros"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NA LOJA DE KONBINI*/

{ id:"ph_091", jp:"温{あたた}めて ください。", pt:"por favor, aqueça isto.", newWords:[{jp:"温めて",pt:"aquecer"},{jp:"ください",pt:"por favor"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_092", jp:"お箸{はし}を 1膳{いちぜん} お願{ねが}いします。", pt:"um par de hashis, por favor.", newWords:[{jp:"お箸",pt:"hashis"},{jp:"1膳",pt:"um par de hashis"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_093", jp:"スプーンを つけて ください。", pt:"por favor, coloque uma colher.", newWords:[{jp:"スプーン",pt:"colher"},{jp:"つけてください",pt:"coloque / inclua"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_094", jp:"この支払{しはら}いは どこで しますか。", pt:"onde eu faço este pagamento?", newWords:[{jp:"支払い",pt:"pagamento"},{jp:"どこ",pt:"onde"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_095", jp:"公共料金{こうきょうりょうきん}も 払{はら}えますか。", pt:"também posso pagar contas públicas aqui?", newWords:[{jp:"公共料金",pt:"contas públicas / utilidades"},{jp:"払えますか",pt:"posso pagar?"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_096", jp:"ATMは どこに ありますか。", pt:"onde fica o caixa eletrônico?", newWords:[{jp:"ATM",pt:"caixa eletrônico"},{jp:"ありますか",pt:"tem / existe?"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_097", jp:"この商品{しょうひん}は 売{う}り切{き}れですか。", pt:"este produto está esgotado?", newWords:[{jp:"商品",pt:"produto"},{jp:"売り切れ",pt:"esgotado"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_098", jp:"いちばん 人気{にんき}の おにぎりは どれですか。", pt:"qual onigiri é o mais popular?", newWords:[{jp:"人気",pt:"popular"},{jp:"おにぎり",pt:"bolinho de arroz"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_099", jp:"袋{ふくろ}は 別{べつ}で お願{ねが}いします。", pt:"quero a sacola separada, por favor.", newWords:[{jp:"袋",pt:"sacola"},{jp:"別",pt:"separado"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

{ id:"ph_100", jp:"レシートを ください。", pt:"por favor, me dê o recibo.", newWords:[{jp:"レシート",pt:"recibo"},{jp:"ください",pt:"por favor / me dê"}], topicId:topicIds["No konbini"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NA LOJA DE FARMÁCIA*/

{ id:"ph_101", jp:"風邪薬{かぜぐすり}は ありますか。", pt:"vocês têm remédio para resfriado?", newWords:[{jp:"風邪薬",pt:"remédio para resfriado"},{jp:"ありますか",pt:"tem?"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_102", jp:"頭{あたま}が 痛{いた}いです。", pt:"estou com dor de cabeça.", newWords:[{jp:"頭",pt:"cabeça"},{jp:"痛い",pt:"doendo"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_103", jp:"熱{ねつ}が あります。", pt:"estou com febre.", newWords:[{jp:"熱",pt:"febre"},{jp:"あります",pt:"tenho / estou com"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_104", jp:"咳{せき}が 止{と}まりません。", pt:"a tosse não para.", newWords:[{jp:"咳",pt:"tosse"},{jp:"止まりません",pt:"não para"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_105", jp:"のどが 痛{いた}いです。", pt:"estou com dor de garganta.", newWords:[{jp:"のど",pt:"garganta"},{jp:"痛い",pt:"doendo"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_106", jp:"お腹{なか}の 薬{くすり}は ありますか。", pt:"vocês têm remédio para o estômago?", newWords:[{jp:"お腹",pt:"barriga / estômago"},{jp:"薬",pt:"remédio"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_107", jp:"眠気{ねむけ}の 少{すく}ない 薬{くすり}が いいです。", pt:"prefiro um remédio que dê pouco sono.", newWords:[{jp:"眠気",pt:"sono / sonolência"},{jp:"少ない",pt:"pouco"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_108", jp:"1日{いちにち}に 何回{なんかい} 飲{の}めば いいですか。", pt:"quantas vezes por dia devo tomar?", newWords:[{jp:"1日",pt:"por dia"},{jp:"何回",pt:"quantas vezes"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_109", jp:"食後{しょくご}に 飲{の}みますか。", pt:"é para tomar depois da refeição?", newWords:[{jp:"食後",pt:"depois da refeição"},{jp:"飲みますか",pt:"toma?"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

{ id:"ph_110", jp:"この薬{くすり}は いくらですか。", pt:"quanto custa este remédio?", newWords:[{jp:"薬",pt:"remédio"},{jp:"いくら",pt:"quanto"}], topicId:topicIds["Na farmácia"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NA PREFEITURA*/

{ id:"ph_111", jp:"住所変更{じゅうしょへんこう}の 手続{てつづ}きは どこですか。", pt:"onde faço o procedimento de mudança de endereço?", newWords:[{jp:"住所変更",pt:"mudança de endereço"},{jp:"手続き",pt:"procedimento / trâmite"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_112", jp:"この書類{しょるい}の 書{か}き方{かた}を 教{おし}えて ください。", pt:"por favor, me ensine como preencher este documento.", newWords:[{jp:"書類",pt:"documento"},{jp:"書き方",pt:"modo de preencher / escrever"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_113", jp:"住民票{じゅうみんひょう}を 取{と}りたいです。", pt:"quero tirar um comprovante de residência.", newWords:[{jp:"住民票",pt:"comprovante / registro de residência"},{jp:"取る",pt:"tirar / obter"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_114", jp:"必要{ひつよう}な ものは 何{なに}ですか。", pt:"o que é necessário trazer?", newWords:[{jp:"必要",pt:"necessário"},{jp:"何",pt:"o que"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_115", jp:"保険証{ほけんしょう}の 手続{てつづ}きも ここで できますか。", pt:"também posso fazer aqui o procedimento do cartão do seguro?", newWords:[{jp:"保険証",pt:"cartão do seguro de saúde"},{jp:"できますか",pt:"é possível fazer?"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_116", jp:"マイナンバーカードの 申請{しんせい}を したいです。", pt:"quero solicitar o cartão My Number.", newWords:[{jp:"マイナンバーカード",pt:"cartão My Number"},{jp:"申請",pt:"solicitação / pedido"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_117", jp:"通訳{つうやく}が いなくても 大丈夫{だいじょうぶ}ですか。", pt:"dá para fazer isso mesmo sem intérprete?", newWords:[{jp:"通訳",pt:"intérprete"},{jp:"大丈夫",pt:"sem problema / tudo bem"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_118", jp:"番号札{ばんごうふだ}は どこで 取{と}りますか。", pt:"onde eu pego a senha de atendimento?", newWords:[{jp:"番号札",pt:"senha / ticket de atendimento"},{jp:"取ります",pt:"pegar / retirar"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_119", jp:"この手続{てつづ}きは 今日中{きょうじゅう}に 終{お}わりますか。", pt:"esse procedimento termina ainda hoje?", newWords:[{jp:"今日中",pt:"ainda hoje"},{jp:"終わりますか",pt:"termina?"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

{ id:"ph_120", jp:"次{つぎ}に 何{なに}を すれば いいですか。", pt:"o que eu devo fazer em seguida?", newWords:[{jp:"次",pt:"seguinte / próximo"},{jp:"何",pt:"o que"}], topicId:topicIds["Na prefeitura"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO HOSPITAL*/

{ id:"ph_121", jp:"予約{よやく}を したいです。", pt:"quero marcar uma consulta.", newWords:[{jp:"予約",pt:"reserva / agendamento"},{jp:"したいです",pt:"quero fazer"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_122", jp:"保険証{ほけんしょう}を 持{も}って います。", pt:"eu trouxe o cartão do seguro.", newWords:[{jp:"保険証",pt:"cartão do seguro de saúde"},{jp:"持っている",pt:"estar com / trazer"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_123", jp:"どこが 痛{いた}いですかと 聞{き}かれたら、 お腹{なか}が 痛{いた}いですと 言{い}います。", pt:"se perguntarem onde dói, eu digo que estou com dor de barriga.", newWords:[{jp:"どこが痛いですか",pt:"onde dói?"},{jp:"お腹が痛いです",pt:"estou com dor de barriga"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_124", jp:"昨日{きのう}から 熱{ねつ}が あります。", pt:"estou com febre desde ontem.", newWords:[{jp:"昨日から",pt:"desde ontem"},{jp:"熱",pt:"febre"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_125", jp:"咳{せき}と のどの 痛{いた}みが あります。", pt:"estou com tosse e dor de garganta.", newWords:[{jp:"咳",pt:"tosse"},{jp:"のどの痛み",pt:"dor de garganta"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_126", jp:"薬{くすり}は いつ 飲{の}めば いいですか。", pt:"quando devo tomar o remédio?", newWords:[{jp:"薬",pt:"remédio"},{jp:"いつ",pt:"quando"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_127", jp:"食後{しょくご}に 飲{の}みますか。", pt:"é para tomar depois da refeição?", newWords:[{jp:"食後",pt:"depois da refeição"},{jp:"飲みますか",pt:"toma?"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_128", jp:"仕事{しごと}を 休{やす}むための 診断書{しんだんしょ}が 必要{ひつよう}です。", pt:"preciso de um atestado para faltar ao trabalho.", newWords:[{jp:"診断書",pt:"atestado / laudo médico"},{jp:"必要",pt:"necessário"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_129", jp:"次{つぎ}の 診察{しんさつ}は いつですか。", pt:"quando é a próxima consulta?", newWords:[{jp:"次",pt:"próximo"},{jp:"診察",pt:"consulta / atendimento médico"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

{ id:"ph_130", jp:"会計{かいけい}は どこで しますか。", pt:"onde faço o pagamento?", newWords:[{jp:"会計",pt:"pagamento / caixa"},{jp:"どこ",pt:"onde"}], topicId:topicIds["No hospital"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO NO TREM / ESTAÇÃO*/

{ id:"ph_131", jp:"この電車{でんしゃ}は 福井{ふくい}に 行{い}きますか。", pt:"este trem vai para Fukui?", newWords:[{jp:"電車",pt:"trem"},{jp:"行きますか",pt:"vai?"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_132", jp:"この電車{でんしゃ}は 急行{きゅうこう}ですか。", pt:"este trem é expresso?", newWords:[{jp:"急行",pt:"trem expresso"},{jp:"電車",pt:"trem"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_133", jp:"何番線{なんばんせん}ですか。", pt:"é na plataforma número qual?", newWords:[{jp:"何番線",pt:"qual plataforma / linha"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_134", jp:"次{つぎ}の 電車{でんしゃ}は 何時{なんじ}ですか。", pt:"a que horas é o próximo trem?", newWords:[{jp:"次",pt:"próximo"},{jp:"何時",pt:"que horas"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_135", jp:"ここで 乗{の}り換{か}えですか。", pt:"é aqui que faz baldeação?", newWords:[{jp:"乗り換え",pt:"baldeação / transferência"},{jp:"ここ",pt:"aqui"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_136", jp:"切符{きっぷ}は どこで 買{か}いますか。", pt:"onde compro a passagem?", newWords:[{jp:"切符",pt:"passagem / bilhete"},{jp:"買います",pt:"comprar"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_137", jp:"ICカードは 使{つか}えますか。", pt:"posso usar cartão IC?", newWords:[{jp:"ICカード",pt:"cartão IC"},{jp:"使えますか",pt:"pode usar?"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_138", jp:"この電車{でんしゃ}は 各駅停車{かくえきていしゃ}ですか。", pt:"este trem para em todas as estações?", newWords:[{jp:"各駅停車",pt:"trem local / para em todas"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_139", jp:"出口{でぐち}は どちらですか。", pt:"qual é a saída?", newWords:[{jp:"出口",pt:"saída"},{jp:"どちら",pt:"qual direção / qual lado"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

{ id:"ph_140", jp:"この 電車{でんしゃ}は 遅{おく}れていますか。", pt:"este trem está atrasado?", newWords:[{jp:"遅れる",pt:"atrasar"},{jp:"電車",pt:"trem"}], topicId:topicIds["No trem / estação"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO NO BANCO*/

{ id:"ph_141", jp:"口座{こうざ}を 作{つく}りたいです。", pt:"quero abrir uma conta bancária.", newWords:[{jp:"口座",pt:"conta bancária"},{jp:"作りたい",pt:"quero abrir / criar"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_142", jp:"必要{ひつよう}な 書類{しょるい}は 何{なに}ですか。", pt:"quais documentos são necessários?", newWords:[{jp:"必要",pt:"necessário"},{jp:"書類",pt:"documentos"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_143", jp:"お金{かね}を 引{ひ}き出{だ}したいです。", pt:"quero sacar dinheiro.", newWords:[{jp:"お金",pt:"dinheiro"},{jp:"引き出す",pt:"sacar"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_144", jp:"お金{かね}を 入金{にゅうきん}したいです。", pt:"quero depositar dinheiro.", newWords:[{jp:"入金",pt:"depósito"},{jp:"お金",pt:"dinheiro"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_145", jp:"振込{ふりこみ}は できますか。", pt:"posso fazer uma transferência?", newWords:[{jp:"振込",pt:"transferência bancária"},{jp:"できますか",pt:"é possível?"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_146", jp:"残高{ざんだか}を 確認{かくにん}したいです。", pt:"quero verificar o saldo.", newWords:[{jp:"残高",pt:"saldo"},{jp:"確認",pt:"confirmar / verificar"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_147", jp:"暗証番号{あんしょうばんごう}を 忘{わす}れました。", pt:"esqueci minha senha.", newWords:[{jp:"暗証番号",pt:"senha / PIN"},{jp:"忘れました",pt:"esqueci"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_148", jp:"キャッシュカードが 使{つか}えません。", pt:"meu cartão bancário não está funcionando.", newWords:[{jp:"キャッシュカード",pt:"cartão bancário / ATM"},{jp:"使えません",pt:"não funciona / não pode usar"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_149", jp:"通帳{つうちょう}を 再発行{さいはっこう}できますか。", pt:"posso pedir a reemissão da caderneta bancária?", newWords:[{jp:"通帳",pt:"caderneta / passbook bancário"},{jp:"再発行",pt:"reemissão"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

{ id:"ph_150", jp:"手数料{てすうりょう}は いくらですか。", pt:"qual é a taxa?", newWords:[{jp:"手数料",pt:"taxa / tarifa"},{jp:"いくら",pt:"quanto"}], topicId:topicIds["No banco"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO CELULAR / INTERNET*/

{ id:"ph_151", jp:"SIMカードを 買{か}いたいです。", pt:"quero comprar um chip SIM.", newWords:[{jp:"SIMカード",pt:"chip SIM"},{jp:"買いたい",pt:"quero comprar"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_152", jp:"おすすめの プランは どれですか。", pt:"qual plano você recomenda?", newWords:[{jp:"おすすめ",pt:"recomendação"},{jp:"プラン",pt:"plano"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_153", jp:"30GBの 固定{こてい}プランは ありますか。", pt:"tem um plano fixo de 30 GB?", newWords:[{jp:"固定",pt:"fixo"},{jp:"プラン",pt:"plano"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_154", jp:"通話{つうわ}も できますか。", pt:"também dá para fazer ligações?", newWords:[{jp:"通話",pt:"ligação / chamada"},{jp:"できますか",pt:"é possível?"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_155", jp:"月額料金{げつがくりょうきん}は いくらですか。", pt:"qual é o valor mensal?", newWords:[{jp:"月額料金",pt:"mensalidade"},{jp:"いくら",pt:"quanto"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_156", jp:"契約期間{けいやくきかん}は どのくらいですか。", pt:"qual é o período do contrato?", newWords:[{jp:"契約期間",pt:"período de contrato"},{jp:"どのくらい",pt:"quanto / aproximadamente"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_157", jp:"解約{かいやく}するとき、 手数料{てすうりょう}は かかりますか。", pt:"se eu cancelar, há taxa?", newWords:[{jp:"解約",pt:"cancelamento"},{jp:"手数料",pt:"taxa"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_158", jp:"インターネットが 遅{おそ}いです。", pt:"a internet está lenta.", newWords:[{jp:"インターネット",pt:"internet"},{jp:"遅い",pt:"lenta"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_159", jp:"Wi-Fiに 接続{せつぞく}できません。", pt:"não consigo conectar no Wi-Fi.", newWords:[{jp:"接続",pt:"conexão"},{jp:"できません",pt:"não consigo"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

{ id:"ph_160", jp:"このスマホは SIMフリーですか。", pt:"este celular é desbloqueado?", newWords:[{jp:"スマホ",pt:"celular / smartphone"},{jp:"SIMフリー",pt:"desbloqueado para qualquer operadora"}], topicId:topicIds["No celular / internet"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NA EMERGÊNCIA*/

{ id:"ph_161", jp:"助{たす}けて ください。", pt:"por favor, me ajude.", newWords:[{jp:"助けて",pt:"me ajude"},{jp:"ください",pt:"por favor"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_162", jp:"救急車{きゅうきゅうしゃ}を 呼{よ}んで ください。", pt:"por favor, chame uma ambulância.", newWords:[{jp:"救急車",pt:"ambulância"},{jp:"呼んで",pt:"chamar"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_163", jp:"警察{けいさつ}を 呼{よ}んで ください。", pt:"por favor, chame a polícia.", newWords:[{jp:"警察",pt:"polícia"},{jp:"呼んで",pt:"chamar"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_164", jp:"気分{きぶん}が 悪{わる}いです。", pt:"estou passando mal.", newWords:[{jp:"気分",pt:"condição / sensação física"},{jp:"悪い",pt:"ruim"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_165", jp:"倒{たお}れた 人{ひと}が います。", pt:"tem uma pessoa caída.", newWords:[{jp:"倒れた",pt:"caída / desmaiada"},{jp:"人",pt:"pessoa"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_166", jp:"事故{じこ}が ありました。", pt:"houve um acidente.", newWords:[{jp:"事故",pt:"acidente"},{jp:"ありました",pt:"houve / aconteceu"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_167", jp:"火事{かじ}です。", pt:"é um incêndio.", newWords:[{jp:"火事",pt:"incêndio"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_168", jp:"財布{さいふ}を なくしました。", pt:"perdi minha carteira.", newWords:[{jp:"財布",pt:"carteira"},{jp:"なくしました",pt:"perdi"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_169", jp:"道{みち}に 迷{まよ}いました。", pt:"estou perdido.", newWords:[{jp:"道",pt:"caminho / rua"},{jp:"迷いました",pt:"me perdi"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

{ id:"ph_170", jp:"日本語{にほんご}が あまり 話{はな}せません。 ゆっくり お願{ねが}いします。", pt:"eu não falo muito japonês. por favor, fale devagar.", newWords:[{jp:"日本語",pt:"língua japonesa"},{jp:"ゆっくり",pt:"devagar"}], topicId:topicIds["Emergência"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO TRABALHO*/

{ id:"ph_171", jp:"今日{きょう}も よろしく お 願{ねが}いします。", pt:"conto com você hoje também / vamos trabalhar bem hoje.", newWords:[{jp:"今日",pt:"hoje"},{jp:"よろしくお願いします",pt:"conto com você / por favor"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_172", jp:"少{すこ}し 遅{おく}れます。", pt:"vou me atrasar um pouco.", newWords:[{jp:"少し",pt:"um pouco"},{jp:"遅れます",pt:"vou me atrasar"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_173", jp:"体調{たいちょう}が 悪{わる}いです。", pt:"não estou me sentindo bem.", newWords:[{jp:"体調",pt:"condição física / saúde"},{jp:"悪い",pt:"ruim"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_174", jp:"今日は 休{やす}ませて ください。", pt:"por favor, deixe-me faltar hoje.", newWords:[{jp:"今日",pt:"hoje"},{jp:"休ませてください",pt:"deixe-me faltar / descansar"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_175", jp:"この仕事{しごと}を 確認{かくにん}して ください。", pt:"por favor, confira este trabalho.", newWords:[{jp:"仕事",pt:"trabalho"},{jp:"確認",pt:"confirmar / conferir"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_176", jp:"すみません、もう一度{いちど} 説明{せつめい}して ください。", pt:"desculpe, por favor explique mais uma vez.", newWords:[{jp:"もう一度",pt:"mais uma vez"},{jp:"説明",pt:"explicação"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_177", jp:"これは まだ 終{お}わって いません。", pt:"isto ainda não terminou.", newWords:[{jp:"まだ",pt:"ainda"},{jp:"終わっていません",pt:"não terminou"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_178", jp:"手伝{てつだ}って もらえますか。", pt:"você pode me ajudar?", newWords:[{jp:"手伝って",pt:"ajudar"},{jp:"もらえますか",pt:"pode fazer para mim?"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_179", jp:"次{つぎ}は 何{なに}を すれば いいですか。", pt:"o que devo fazer em seguida?", newWords:[{jp:"次",pt:"próximo / seguinte"},{jp:"何",pt:"o que"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

{ id:"ph_180", jp:"お先{さき}に 失礼{しつれい}します。", pt:"com licença, estou saindo antes.", newWords:[{jp:"お先に失礼します",pt:"estou saindo antes / com licença"}], topicId:topicIds["No trabalho"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO RH*/

{ id:"ph_181", jp:"給料明細{きゅうりょうめいさい}を 確認{かくにん}したいです。", pt:"quero conferir meu holerite.", newWords:[{jp:"給料明細",pt:"holerite / demonstrativo de pagamento"},{jp:"確認",pt:"confirmar / conferir"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_182", jp:"この控除{こうじょ}は 何{なん}ですか。", pt:"o que é este desconto?", newWords:[{jp:"控除",pt:"desconto / dedução"},{jp:"何",pt:"o que"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_183", jp:"有給休暇{ゆうきゅうきゅうか}を 申請{しんせい}したいです。", pt:"quero solicitar férias pagas.", newWords:[{jp:"有給休暇",pt:"férias pagas / folga remunerada"},{jp:"申請",pt:"solicitação / pedido"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_184", jp:"欠勤{けっきん}の 連絡{れんらく}を したいです。", pt:"quero avisar uma falta.", newWords:[{jp:"欠勤",pt:"falta ao trabalho"},{jp:"連絡",pt:"aviso / contato"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_185", jp:"社会保険{しゃかいほけん}について 教{おし}えて ください。", pt:"por favor, me explique sobre o seguro social.", newWords:[{jp:"社会保険",pt:"seguro social"},{jp:"教えてください",pt:"por favor, explique / ensine"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_186", jp:"年末調整{ねんまつちょうせい}の 書類{しょるい}は いつまでですか。", pt:"até quando devo entregar os documentos do ajuste de fim de ano?", newWords:[{jp:"年末調整",pt:"ajuste de imposto de fim de ano"},{jp:"書類",pt:"documentos"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_187", jp:"住所変更{じゅうしょへんこう}の 手続{てつづ}きを したいです。", pt:"quero fazer o procedimento de mudança de endereço.", newWords:[{jp:"住所変更",pt:"mudança de endereço"},{jp:"手続き",pt:"procedimento / trâmite"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_188", jp:"銀行口座{ぎんこうこうざ}を 変更{へんこう}したいです。", pt:"quero alterar minha conta bancária.", newWords:[{jp:"銀行口座",pt:"conta bancária"},{jp:"変更",pt:"alteração / mudar"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_189", jp:"残業時間{ざんぎょうじかん}を 確認{かくにん}したいです。", pt:"quero conferir minhas horas extras.", newWords:[{jp:"残業時間",pt:"horas extras"},{jp:"確認",pt:"conferir / verificar"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

{ id:"ph_190", jp:"退職{たいしょく}するときの 手続{てつづ}きは どうなりますか。", pt:"como funciona o procedimento em caso de desligamento?", newWords:[{jp:"退職",pt:"desligamento / sair da empresa"},{jp:"手続き",pt:"procedimento"}], topicId:topicIds["No RH"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS NO RH*/

{ id:"ph_191", jp:"電気{でんき}が つきません。", pt:"a luz não acende.", newWords:[{jp:"電気",pt:"luz / eletricidade"},{jp:"つきません",pt:"não acende"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_192", jp:"水{みず}が 出{で}ません。", pt:"não está saindo água.", newWords:[{jp:"水",pt:"água"},{jp:"出ません",pt:"não sai"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_193", jp:"お湯{ゆ}が 出{で}ません。", pt:"não está saindo água quente.", newWords:[{jp:"お湯",pt:"água quente"},{jp:"出ません",pt:"não sai"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_194", jp:"エアコンが 動{うご}きません。", pt:"o ar-condicionado não está funcionando.", newWords:[{jp:"エアコン",pt:"ar-condicionado"},{jp:"動きません",pt:"não funciona"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_195", jp:"鍵{かぎ}を なくしました。", pt:"perdi a chave.", newWords:[{jp:"鍵",pt:"chave"},{jp:"なくしました",pt:"perdi"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_196", jp:"ドアが 閉{し}まりません。", pt:"a porta não fecha.", newWords:[{jp:"ドア",pt:"porta"},{jp:"閉まりません",pt:"não fecha"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_197", jp:"トイレが 詰{つ}まりました。", pt:"o vaso sanitário entupiu.", newWords:[{jp:"トイレ",pt:"banheiro / vaso"},{jp:"詰まりました",pt:"entupiu"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_198", jp:"水漏{みずも}れしています。", pt:"há vazamento de água.", newWords:[{jp:"水漏れ",pt:"vazamento de água"},{jp:"しています",pt:"está acontecendo"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_199", jp:"修理{しゅうり}を お願{ねが}いしたいです。", pt:"quero solicitar um reparo.", newWords:[{jp:"修理",pt:"reparo / conserto"},{jp:"お願いしたい",pt:"quero solicitar"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

{ id:"ph_200", jp:"いつ 来{き}てもらえますか。", pt:"quando alguém pode vir aqui?", newWords:[{jp:"いつ",pt:"quando"},{jp:"来てもらえますか",pt:"pode vir?"}], topicId:topicIds["Em casa / apartamento"], createdAt:t, updatedAt:t },

/*10 FRASES UTEIS SOBRE LIXO E RECICLAGEM */
{ id:"ph_201", jp:"燃{も}える ごみの 日{ひ}は いつですか。", pt:"quando é o dia do lixo queimável?", newWords:[{jp:"燃えるごみ",pt:"lixo queimável"},{jp:"日",pt:"dia"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_202", jp:"燃{も}えない ごみは どこに 出{だ}せば いいですか。", pt:"onde devo descartar o lixo não queimável?", newWords:[{jp:"燃えないごみ",pt:"lixo não queimável"},{jp:"出せばいいですか",pt:"onde devo colocar / descartar?"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_203", jp:"ペットボトルは ここで いいですか。", pt:"as garrafas PET podem ser colocadas aqui?", newWords:[{jp:"ペットボトル",pt:"garrafa PET"},{jp:"ここでいいですか",pt:"pode ser aqui?"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_204", jp:"空{あ}き缶{かん}と 空{あ}き瓶{びん}は 別々{べつべつ}ですか。", pt:"latas vazias e garrafas vazias são separadas?", newWords:[{jp:"空き缶",pt:"lata vazia"},{jp:"空き瓶",pt:"garrafa vazia"},{jp:"別々",pt:"separadamente"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_205", jp:"このごみ袋{ぶくろ}で 大丈夫{だいじょうぶ}ですか。", pt:"esta sacola de lixo está correta?", newWords:[{jp:"ごみ袋",pt:"saco de lixo"},{jp:"大丈夫",pt:"está ok / correto"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_206", jp:"粗大{そだい}ごみは どうやって 捨{す}てますか。", pt:"como descarto lixo de grande porte?", newWords:[{jp:"粗大ごみ",pt:"lixo de grande porte"},{jp:"捨てますか",pt:"como joga fora?"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_207", jp:"このごみは 分別{ぶんべつ}が 必要{ひつよう}ですか。", pt:"este lixo precisa ser separado?", newWords:[{jp:"分別",pt:"separação de lixo"},{jp:"必要",pt:"necessário"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_208", jp:"ごみ収集日{しゅうしゅうび}の カレンダーは ありますか。", pt:"tem um calendário dos dias de coleta de lixo?", newWords:[{jp:"ごみ収集日",pt:"dia de coleta do lixo"},{jp:"カレンダー",pt:"calendário"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_209", jp:"段ボールは いつ 出{だ}せますか。", pt:"quando posso colocar o papelão para fora?", newWords:[{jp:"段ボール",pt:"papelão"},{jp:"いつ",pt:"quando"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },

{ id:"ph_210", jp:"電池{でんち}は どこに 捨{す}てれば いいですか。", pt:"onde devo descartar pilhas?", newWords:[{jp:"電池",pt:"pilha / bateria"},{jp:"捨てればいいですか",pt:"onde devo descartar?"}], topicId:topicIds["Lixo e reciclagem"], createdAt:t, updatedAt:t },
/* =========================================================
       FINAL DO TRECHO DE UPGRADE DAS FRASES
       ========================================================= */
  ];
}

function ensureCoreContentV3(st) {
  st.bank ||= {};
  st.bank.topics ||= [];
  st.bank.phrases ||= [];
  st.progress ||= {};
  st.ui ||= {};
  st.ui.collapsedTopics ||= {};
  st.stats ||= {};
  st.stats.listens ||= 0;
  st.stats.calls ||= 0;
  st.habit ||= { firstDay: null, days: {} };
  st.habit.days ||= {};
  st.session ||= {};
  st.session.topicFilter ||= "ALL";
  st.session.callBusy ||= false;
  st.session.study ||= { day: todayKey(), totalMs: 0, running: false, runStartAt: null };

  const existingByName = new Map();
  for (const t of st.bank.topics) {
    existingByName.set(String(t.name || "").toLowerCase(), t);
  }

  const coreTopics = seedTopics();
  for (let i = 0; i < coreTopics.length; i++) {
    const ct = coreTopics[i];
    const key = ct.name.toLowerCase();
    if (!existingByName.has(key)) {
      st.bank.topics.push({
        id: ct.id,
        name: ct.name,
        color: ct.color,
        createdAt: now(),
        updatedAt: now()
      });
      existingByName.set(key, ct);
    }
  }

  let def = st.bank.topics.find(t => t.id === "topic_default");
  if (!def) {
    const fallback = st.bank.topics.find(t => String(t.name || "").toLowerCase() === "frases aleatórias");
    if (fallback) {
      fallback.id = "topic_default";
      def = fallback;
    } else {
      def = defaultTopic();
      st.bank.topics.unshift(def);
    }
  }

  const topicIds = topicIdMapFromTopics(st.bank.topics);
  const corePhrases = seedPhrases(topicIds);
  const existingPhraseIds = new Set(st.bank.phrases.map(p => p.id));

  for (const phrase of corePhrases) {
    if (!existingPhraseIds.has(phrase.id)) {
      st.bank.phrases.push(phrase);
      st.progress[phrase.id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };
    }
  }

  for (const p of st.bank.phrases) {
    if (!p.topicId) p.topicId = def.id;
    if (!st.progress[p.id]) {
      st.progress[p.id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };
    }
  }

  return st;
}

function defaultState() {
  const t = now();
  const topics = seedTopics();
  const topicIds = topicIdMapFromTopics(topics);
  const phrases = seedPhrases(topicIds);


  const progress = {};
  for (const p of phrases) {
    progress[p.id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };
  }

  return {
    app: { schemaVersion: 3, createdAt: t, updatedAt: t },

    prefs: {
      audio: { enabled: true, volume: 0.35, unlocked: false },
      haptics: { enabled: true }
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
      queue: [],
      index: 0,
      phraseId: null,
      callMode: false,
      callBusy: false,

      topicFilter: "ALL",

      study: { day: todayKey(), totalMs: 0, running: false, runStartAt: null }
    },

    ui: {
      lastToast: "",
      collapsedTopics: {}
    }
  };
}

let STATE = loadState();

/* ---------- storage + migration ---------- */
function migrateToV3(st) {
  if (!st || !st.app) return defaultState();

  st.app.schemaVersion = 3;

  st.bank ||= {};
  st.bank.phrases ||= [];
  st.bank.topics ||= [];

  st.ui ||= {};
  st.ui.collapsedTopics ||= {};

  st.session ||= {};
  st.session.topicFilter ||= "ALL";
  st.session.callBusy ||= false;

  let def = st.bank.topics.find(t => t.id === "topic_default");
  if (!def) {
    def = defaultTopic();
    st.bank.topics.unshift(def);
  }

  for (const p of st.bank.phrases) {
    if (!p.topicId) p.topicId = def.id;
  }

  st.stats ||= {};
  st.stats.listens ||= 0;
  st.stats.calls ||= 0;

  st.habit ||= { firstDay: null, days: {} };
  st.habit.days ||= {};

  st.session.study ||= { day: todayKey(), totalMs: 0, running: false, runStartAt: null };

  return ensureCoreContentV3(st);
}

function loadState() {
  let raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const parsed = safeJSONParse(raw);
    if (parsed && parsed.app?.schemaVersion === 3) {
      const ensured = ensureCoreContentV3(parsed);
      localStorage.setItem(LS_KEY, JSON.stringify(ensured));
      return ensured;
    }
  }

  const legacyRaw = localStorage.getItem("jp_105x_v2");
  if (legacyRaw) {
    const parsed = safeJSONParse(legacyRaw);
    if (parsed && parsed.app) {
      const migrated = migrateToV3(parsed);
      localStorage.setItem(LS_KEY, JSON.stringify(migrated));
      return migrated;
    }
  }

  return defaultState();
}

function saveState() {
  STATE.app.updatedAt = now();
  localStorage.setItem(LS_KEY, JSON.stringify(STATE));
}

/* ---------- audio / haptics ---------- */
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

function clearCallFlow() {
  callFlowState.token += 1;
  callFlowState.busy = false;
  callFlowState.timers.forEach(id => clearTimeout(id));
  callFlowState.timers = [];
  STATE.session.callBusy = false;
  try { speechSynthesis.cancel(); } catch {}
  const sheet = $("#cycleSheet");
  if (sheet && sheet.dataset.mode === "call") {
    sheet.style.display = "none";
    sheet.innerHTML = "";
    delete sheet.dataset.mode;
  }
  saveState();
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

/* =========================================================
   HABIT LOG (para Skills)
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

function syncHabitMs() {
  const k = ensureHabitToday();
  const ms = getStudyMs();
  STATE.habit.days[k].ms = ms;
  saveState();
}

function habitBump(key, field, amount = 1) {
  const k = ensureHabitToday();
  STATE.habit.days[k][field] = (STATE.habit.days[k][field] || 0) + amount;
  saveState();
}

/* ---------- topics helpers ---------- */
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
  let def = STATE.bank.topics.find(t => t.id === "topic_default");
  if (!def) {
    def = defaultTopic();
    STATE.bank.topics.unshift(def);
    saveState();
  }
  return def;
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

/* ---------- session / queue ---------- */
function getProg(id) {
  if (!STATE.progress[id]) {
    STATE.progress[id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };
  }
  return STATE.progress[id];
}

function phrasesByFilter() {
  const tf = STATE.session.topicFilter || "ALL";
  if (tf === "ALL") return STATE.bank.phrases;
  return STATE.bank.phrases.filter(p => p.topicId === tf);
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
  if (!q.length) return;

  clearCallFlow();

  STATE.session.index = clamp(STATE.session.index + 1, 0, q.length - 1);
  STATE.session.phraseId = q[STATE.session.index];
  resetCountForPhrase(STATE.session.phraseId);
  saveState();
}

function skipPhrase() {
  const q = STATE.session.queue;
  const current = STATE.session.phraseId;
  if (!current || !q.length) return;

  clearCallFlow();

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
  if (callFlowState.busy) return;

  const plain = jpStripFurigana(jpRaw);

  STATE.stats.listens = (STATE.stats.listens || 0) + 1;
  habitBump(todayKey(), "listens", 1);

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
  if (callFlowState.busy) {
    toast("espera o ciclo de chamada terminar ✅");
    beep("tuk");
    return;
  }

  const plain = jpStripFurigana(jpRaw);
  const token = ++callFlowState.token;
  callFlowState.busy = true;
  STATE.session.callBusy = true;
  saveState();

  STATE.stats.calls = (STATE.stats.calls || 0) + 1;
  habitBump(todayKey(), "calls", 1);

  const ok = ttsSpeak(
    plain,
    rate,
    () => {
      if (token !== callFlowState.token) return;
      karaokePlay(kanaEl, plain, rate);
    },
    () => {}
  );

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
  }, t + 90);

  callFlowState.timers.push(id);

  if (!ok) {
    callFlowState.busy = false;
    STATE.session.callBusy = false;
    saveState();
    toast("sem audio. mas da pra treinar lendo.");
  }
}

function showNowYouSheet(token, onDone) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;

  sheet.style.display = "block";
  sheet.dataset.mode = "call";
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
    if (token !== callFlowState.token) return;
    c--;
    const el = $("#nyCount");
    if (el) el.textContent = String(Math.max(0, c));
    if (c <= 0) {
      sheet.style.display = "none";
      sheet.innerHTML = "";
      delete sheet.dataset.mode;
      onDone && onDone();
      return;
    }
    const id = setTimeout(tick, 1000);
    callFlowState.timers.push(id);
  };
  const id = setTimeout(tick, 1000);
  callFlowState.timers.push(id);
}

/* ---------- 105X engine ---------- */
function onRepeat() {
  unlockAudio();

  const pid = STATE.session.phraseId;
  if (!pid) return;

  clearCallFlow();

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
  delete sheet.dataset.mode;

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
  el.textContent = fmtMMSS(ms);

  const goal = 10 * 60 * 1000;
  const pct = clamp(ms / goal, 0, 1);
  fill.style.transform = `scaleX(${pct})`;
}

/* =========================================================
   SKILLS / PROJEÇÃO (mantido)
   ========================================================= */
const SKILL_PLAN_DAYS = 270;
const BASE_MIN_PER_DAY = 30;

const RANKS = [
  { days: 7,   name: "Bronze",   vibe: "o nihongo nao e tao estranho assim", icon: "🥉" },
  { days: 30,  name: "Aco",      vibe: "to comecando a achar que eu consigo", icon: "🛡️" },
  { days: 90,  name: "Ouro",     vibe: "eu vou aprender nihongo sim", icon: "🥇" },
  { days: 150, name: "Platina",  vibe: "minha boca ta ficando automatica", icon: "💠" },
  { days: 210, name: "Diamante", vibe: "eu ja sobrevivo no cotidiano", icon: "💎" },
  { days: 270, name: "Fluencia", vibe: "fluencia total. o jogo virou", icon: "🌸" }
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
  const speaking = clamp((sum.calls / 80), 0, 1);
  const repetition = clamp((sum.cycles / 120), 0, 1);
  const vocab = clamp(((STATE.stats.phrasesMastered || 0) / 30) * 0.55 + (sum.totalMin / (30 * 10)) * 0.45, 0, 1);
  const confidence = clamp((repetition * 0.35 + listening * 0.25 + vocab * 0.20 + speaking * 0.20), 0, 1);

  return [
    { name: "audiçao", val: listening, icon: "🎧", tip: "quanto mais voce ouve, menos pensa" },
    { name: "fala", val: speaking, icon: "🗣️", tip: "call and response deixa a boca solta" },
    { name: "repetiçao", val: repetition, icon: "🔁", tip: "o ouro vem do ciclo fechado" },
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
    ? `proxima: ${next.icon} ${next.name} (${next.days} dias)`
    : `voce chegou: ${current.icon} ${current.name} ✅`;

  const projTxt = finish
    ? `se continuar no ritmo (${avgShow}), fluencia em: ${fmtDateShort(finish)}`
    : `faz 2 minutinhos hoje e eu te dou a projeçao 😉`;

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
              <div class="small">progresso ate fluencia</div>
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
          <div class="small">dica: “dia vivo” = 2 min ou 1 ciclo. sem culpa.</div>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">projeçao de ranks</div>
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

        <div class="small">
          voce nao precisa vencer o dia. so precisa encostar nele por 2 minutos.
        </div>
      </section>
    </div>
  `;

  ensureBackTopButton();
  updateBackTopVisibility();
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
  if (r === "#/skills") return renderSkills();

  nav("#/home");
}

function renderHome() {
  const topicFilter = STATE.session.topicFilter || "ALL";
  const topics = STATE.bank.topics || [];
  const filterLabel = topicFilter === "ALL" ? "tudo" : topicName(topicFilter);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <h1 class="h1">✨Super Memória✨</h1>
        <p class="p">hoje pode ser 2 minutos. ja conta. sem culpa.</p>

        <button class="bigBtn" id="btnStart">COMEÇAR AGORA</button>

        <div class="sep"></div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">separar por conteudo</div>
            <div class="badge">agora: ${escapeHTML(filterLabel)}</div>
          </div>

          <div class="row">
            <select class="btn selectBtn" id="topicFilterSel" aria-label="filtro de topicos">
              <option value="ALL">tudo</option>
              ${topics.map(t => `<option value="${t.id}" ${t.id===topicFilter?"selected":""}>${escapeHTML(t.name)}</option>`).join("")}
            </select>
            <button class="btn btn--ghost" data-nav="#/manage">gerenciar</button>
          </div>

          <div class="small">dica: filtro deixa seu treino mais “limpo”.</div>
        </div>

        <div class="row">
          <button class="btn" data-nav="#/105x">ir pro treino</button>
          <button class="btn" data-nav="#/edit">cadastro</button>
          <button class="btn" data-nav="#/backup">backup</button>
          <button class="btn btn--ghost" data-nav="#/skills">skills</button>
        </div>

        <div class="small">no fim de cada ciclo: +100 moedas 🪙</div>
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

  const sel = $("#topicFilterSel");
  if (sel) {
    sel.addEventListener("change", () => {
      STATE.session.topicFilter = sel.value;
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

function renderTopicMiniPills(selectedId) {
  const topics = STATE.bank.topics || [];
  return `
    <div class="topicPills">
      <button class="pill ${selectedId==="ALL"?"on":""}" data-action="topicFilter" data-id="ALL">tudo</button>
      ${topics.map(t => `
        <button class="pill ${t.id===selectedId?"on":""} ${t.color}" data-action="topicFilter" data-id="${t.id}">
          ${escapeHTML(t.name)}
        </button>
      `).join("")}
    </div>
  `;
}

function render105xEmptyState() {
  const currentFilter = STATE.session.topicFilter || "ALL";
  const label = currentFilter === "ALL" ? "tudo" : topicName(currentFilter);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
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
            <button class="miniBtn" title="skills" aria-label="skills" data-nav="#/skills">🏅</button>
            <button class="miniBtn" title="editar frases" aria-label="editar frases" data-nav="#/manage">✏️</button>
          </div>
        </div>

        ${renderTopicMiniPills(currentFilter)}

        <div class="sheet stack">
          <div class="badge">sem frases neste filtro</div>
          <div class="small">agora: ${escapeHTML(label)}</div>
          <div class="small">adicione frases nesse topico ou volte o treino para “tudo”.</div>

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="topicFilter" data-id="ALL">treinar tudo</button>
            <button class="btn btn--ghost btn--full" data-nav="#/edit">cadastrar frase</button>
          </div>

          <div class="row">
            <button class="btn" data-nav="#/manage">gerenciar topicos</button>
            <button class="btn" data-nav="#/home">sair</button>
          </div>
        </div>
      </section>
    </div>
  `;

  startStudyTimerIfOn105x();
  ensureBackTopButton();
  updateBackTopVisibility();
}

function render105x() {
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
    render105xEmptyState();
    return;
  }

  const curPhrase = getPhrase(STATE.session.phraseId);
  const curTopic = curPhrase ? getTopic(curPhrase.topicId) : null;

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack viewRel" id="view105x">

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
            <button class="miniBtn" title="skills" aria-label="skills" data-nav="#/skills">🏅</button>
            <button class="miniBtn" title="editar frases" aria-label="editar frases" data-nav="#/manage">✏️</button>
            <div class="badge">${STATE.session.callMode ? "chamada on" : "chamada off"}</div>
          </div>
        </div>

        <div class="row row--between" style="gap:10px">
          <div class="badge ${curTopic ? curTopic.color : "tViolet"}">
            ${curTopic ? escapeHTML(curTopic.name) : "Sem tópico"}
          </div>
          <button class="btn btn--ghost" data-action="toggleCall">${STATE.session.callMode ? "call: on" : "call: off"}</button>
        </div>

        ${renderTopicMiniPills(STATE.session.topicFilter || "ALL")}

        <div class="counterWrap">
          <div class="counter" id="counterBox" aria-label="contador">
            <div style="text-align:center">
              <div class="counterVal" id="countVal">-</div>
              <div class="counterSub" id="cycleSub">ciclo</div>
            </div>
          </div>

          <div class="stack" style="flex:1; min-width: 0">
            <div class="kana" id="kanaLine"></div>
            <div class="pt" id="ptLine"></div>

            <div id="newWordsBox"></div>

            <div class="row">
              <button class="btn btn--muted" data-action="speak" data-rate="1">ouvir normal</button>
              <button class="btn btn--muted" data-action="speak" data-rate="0.8">ouvir lento</button>
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
          <div class="small">organizado por topicos</div>
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

function renderTopicHeader(topic, count, collapsed) {
  return `
    <button class="topicHdr ${topic.color}" data-action="toggleTopic" data-id="${topic.id}">
      <span class="topicHdrL">
        <span class="topicDot"></span>
        <span class="topicName">${escapeHTML(topic.name)}</span>
        <span class="topicCount">${count}</span>
      </span>
      <span class="topicChevron">${collapsed ? "▾" : "▴"}</span>
    </button>
  `;
}

function renderPhraseListOnly() {
  const box = $("#phraseList");
  if (!box) return;

  const byTopic = new Map();
  const phrases = phrasesByFilter();

  const topics = STATE.bank.topics || [];
  for (const t of topics) byTopic.set(t.id, []);
  byTopic.set("_missing", []);

  for (const p of phrases) {
    if (byTopic.has(p.topicId)) byTopic.get(p.topicId).push(p);
    else byTopic.get("_missing").push(p);
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
        }).join("")}
      </div>
    `;
    frag.appendChild(wrap);
  }

  const missing = byTopic.get("_missing") || [];
  if (missing.length) {
    const t = ensureDefaultTopic();
    const collapsed = !!collapsedTopics["_missing"];
    const wrap = document.createElement("div");
    wrap.className = "topicGroup";
    wrap.innerHTML = `
      ${renderTopicHeader({ ...t, id: "_missing", name: "sem topico" }, missing.length, collapsed)}
      <div class="topicBody ${collapsed ? "isCollapsed" : ""}">
        ${missing.map(x => {
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

  $("#countVal").textContent = String(count);
  $("#cycleSub").textContent = `ciclo ${cs} → 1`;

  const kanaEl = $("#kanaLine");
  setKanaLine(kanaEl, p.jp);

  $("#ptLine").textContent = p.pt;

  const nw = $("#newWordsBox");
  nw.innerHTML = renderNewWords(p.newWords || []);

  const sheet = $("#cycleSheet");
  if (sheet && sheet.style.display === "block" && count > 1 && sheet.dataset.mode !== "call") {
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

function renderTopicSelect(selectedId) {
  const topics = STATE.bank.topics || [];
  const sel = selectedId || (ensureDefaultTopic().id);
  return `
    <select class="btn selectBtn" id="topicSel" aria-label="selecionar topico">
      ${topics.map(t => `<option value="${t.id}" ${t.id===sel?"selected":""}>${escapeHTML(t.name)}</option>`).join("")}
    </select>
  `;
}

function renderEdit(editingId = null) {
  const editing = editingId ? getPhrase(editingId) : null;

  const jpVal = editing ? editing.jp : "";
  const ptVal = editing ? editing.pt : "";
  const nwVal = editing && Array.isArray(editing.newWords)
    ? editing.newWords.map(x => `${x.jp}=${x.pt}`).join(", ")
    : "";

  const topicId = editing ? (editing.topicId || ensureDefaultTopic().id) : (ensureDefaultTopic().id);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">${editing ? "editar frase" : "cadastro"}</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="row row--between" style="gap:10px">
            <div class="badge">separar por conteudo</div>
            <button class="btn btn--ghost" data-nav="#/manage">gerenciar</button>
          </div>

          ${renderTopicSelect(topicId)}

          <div class="topicAddRow">
            <input id="topicNewName" class="btn" placeholder="novo topico (ex: fabrica, segurança...)" />
            <button class="btn btn--ok" data-action="addTopicInline">adicionar</button>
          </div>

          <div class="sep"></div>

          <div class="small">jp (aceita kanji, numeros, GB, Wi-Fi, 8時30分. furigana manual: 仕事{しごと})</div>
          <input id="inJp" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: 30GBの固定プランはありますか。" value="${escapeHTML(jpVal)}" />
          <div class="small">pt</div>
          <input id="inPt" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: existe um plano fixo de 30 GB?" value="${escapeHTML(ptVal)}" />
          <div class="small">palavras novas (opcional) formato: jp=pt, jp=pt</div>
          <input id="inNW" class="btn" style="height:56px; width:100%; text-align:left" placeholder="ex: 30GB=30 gigas, 固定=fixo" value="${escapeHTML(nwVal)}" />

          <button class="btn btn--ok btn--full" data-action="${editing ? "saveEdit" : "addPhrase"}" data-id="${editing ? editing.id : ""}">
            ${editing ? "salvar alteracoes" : "salvar frase"}
          </button>

          ${editing ? `<button class="btn btn--muted btn--full" data-nav="#/manage">voltar pro gerenciar</button>` : ""}

          <div class="small" id="editMsg"></div>
        </div>
      </section>
    </div>
  `;
}

/* ---------- gerenciar ---------- */
function renderManage() {
  const def = ensureDefaultTopic();
  const topics = STATE.bank.topics || [];

  const topicRows = topics.map(t => {
    const canDel = t.id !== def.id;
    return `
      <div class="item">
        <div class="itemTop">
          <div style="min-width:0">
            <p class="itemTitle">${escapeHTML(t.name)}</p>
            <div class="itemMeta">topico • ${t.id===def.id ? "padrao" : "custom"}</div>
          </div>
          <div class="manageBtns">
            ${canDel ? `<button class="btn btn--bad" data-action="deleteTopic" data-id="${t.id}">excluir</button>` : `<span class="badge">fixo</span>`}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const rows = STATE.bank.phrases.map(p => {
    const pr = getProg(p.id);
    const st = pr.status === "mastered" ? "dominada ✓" : "treino";
    return `
      <div class="item">
        <div class="itemTop">
          <div style="min-width:0">
            <p class="itemTitle">${escapeHTML(jpStripFurigana(p.jp))}</p>
            <div class="itemMeta">${escapeHTML(p.pt)} • ${st} • <span class="badge ${topicColorClass(p.topicId)}">${escapeHTML(topicName(p.topicId))}</span></div>
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
          <div class="badge">topicos</div>
          <button class="btn" data-nav="#/105x">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="small">criar topico novo</div>
          <div class="topicAddRow">
            <input id="topicNewName2" class="btn" placeholder="ex: fabrica, segurança, amigos..." />
            <button class="btn btn--ok" data-action="addTopic">adicionar</button>
          </div>
          <div class="small" id="topicMsg"></div>
        </div>

        <div class="list">${topicRows}</div>

        <div class="sep"></div>

        <div class="row row--between">
          <div class="badge">frases</div>
          <button class="btn" data-nav="#/edit">novo cadastro</button>
        </div>

        <div class="small">furigana em cima usando { }. exemplo: 名前{なまえ}</div>
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

        <div class="sheet stack">
          <div class="badge">exportar</div>
          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="exportCopy">copiar json</button>
            <button class="btn btn--ok btn--full" data-action="exportFile">baixar arquivo</button>
          </div>
          <div class="small">no celular, “baixar arquivo” costuma ser o mais confiável ✅</div>
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

        <div class="sheet stack">
          <div class="small">como usar no celular:</div>
          <div class="small">1) exportar: baixar arquivo (ou copiar) e mandar no whatsapp pra voce mesmo</div>
          <div class="small">2) importar: abrir o arquivo e importar aqui</div>
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

/* =========================================================
   Voltar ao topo (FAB)
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

/* ---------- import helper ---------- */
function validateAndLoadBackup(parsed, msgEl) {
  if (!parsed || parsed.schema !== "jp_105x_backup_v1" || !parsed.state) {
    msgEl.textContent = "json invalido.";
    toast("json invalido");
    beep("tuk");
    return false;
  }

  const st = parsed.state;
  if (!st.bank?.phrases || !Array.isArray(st.bank.phrases)) {
    msgEl.textContent = "backup incompleto.";
    toast("backup incompleto");
    beep("tuk");
    return false;
  }

  for (const p of st.bank.phrases) {
    if (!isValidJP(p.jp || "")) {
      msgEl.textContent = "backup tem jp invalido.";
      toast("jp invalido no backup");
      beep("tuk");
      return false;
    }
  }

  const migrated = migrateToV3(st);

  STATE = migrated;
  saveState();
  refreshHUD();

  msgEl.textContent = "importado ✅";
  toast("importado ✅");
  beep("ding");
  nav("#/home");
  return true;
}

/* ---------- global click delegation ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.nav) {
    if (btn.dataset.nav !== "#/105x") clearCallFlow();
    nav(btn.dataset.nav);
    return;
  }

  const act = btn.dataset.action;

  if (act === "repeat") { onRepeat(); return; }

  if (act === "skip") {
    unlockAudio();
    skipPhrase();
    render105xBodyOnly();
    renderPhraseListOnly();
    return;
  }

  if (act === "next") {
    unlockAudio();
    nextPhrase();
    toast("proxima ✅");
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
    clearCallFlow();
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
    renderPhraseListOnly();
    return;
  }

  if (act === "topicFilter") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    clearCallFlow();

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
    clearCallFlow();
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

  if (act === "addTopicInline") {
    unlockAudio();
    const input = $("#topicNewName");
    const msg = $("#editMsg");
    if (!input) return;

    const topic = createTopic(input.value);
    if (!topic) {
      msg.textContent = "nao deu. nome vazio ou ja existe.";
      toast("topico invalido");
      beep("tuk");
      return;
    }

    input.value = "";
    toast("topico criado ✅");
    beep("ding");

    const sel = $("#topicSel");
    if (sel) {
      sel.innerHTML = (STATE.bank.topics || []).map(t => `<option value="${t.id}" ${t.id===topic.id?"selected":""}>${escapeHTML(t.name)}</option>`).join("");
      sel.value = topic.id;
    }

    msg.textContent = "topico criado ✅";
    saveState();
    return;
  }

  if (act === "addTopic") {
    unlockAudio();
    const input = $("#topicNewName2");
    const msg = $("#topicMsg");
    if (!input || !msg) return;

    const topic = createTopic(input.value);
    if (!topic) {
      msg.textContent = "nome vazio ou ja existe.";
      toast("topico invalido");
      beep("tuk");
      return;
    }

    input.value = "";
    msg.textContent = "criado ✅";
    toast("topico criado ✅");
    beep("ding");
    renderManage();
    return;
  }

  if (act === "deleteTopic") {
    unlockAudio();
    const id = btn.dataset.id;
    if (!id) return;

    const ok = confirm("excluir topico? as frases vao pro padrao.");
    if (!ok) return;

    const done = deleteTopic(id);
    if (!done) return;

    toast("topico excluido ✅");
    beep("tuk");
    renderManage();
    return;
  }

  if (act === "addPhrase") {
    unlockAudio();
    const jp = ($("#inJp")?.value || "").trim();
    const pt = ($("#inPt")?.value || "").trim();
    const nw = parseNewWords($("#inNW")?.value || "");
    const msg = $("#editMsg");
    const topicId = ($("#topicSel")?.value || ensureDefaultTopic().id);

    if (!jp || !pt) { msg.textContent = "preencha jp e pt."; toast("faltou jp/pt"); beep("tuk"); return; }
    if (!isValidJP(jp)) { msg.textContent = "jp invalido. agora aceita numeros, GB, Wi-Fi e furigana."; toast("jp invalido"); beep("tuk"); return; }
    for (const w of nw) {
      if (!isValidJP(w.jp)) { msg.textContent = "palavra nova jp invalida."; toast("palavra invalida"); beep("tuk"); return; }
    }

    const t = now();
    const id = uid("ph");

    STATE.bank.phrases.unshift({ id, jp, pt, newWords: nw, topicId, createdAt:t, updatedAt:t });
    STATE.progress[id] = { status:"training", cycleStart:14, count:14, masteredAt:null, history:[] };

    if (STATE.session.inProgress) {
      STATE.session.queue = buildQueue();
      STATE.session.index = 0;
      STATE.session.phraseId = STATE.session.queue[0] || null;
    }

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
    const topicId = ($("#topicSel")?.value || ensureDefaultTopic().id);

    if (!jp || !pt) { msg.textContent = "preencha jp e pt."; toast("faltou jp/pt"); beep("tuk"); return; }
    if (!isValidJP(jp)) { msg.textContent = "jp invalido. agora aceita numeros, GB, Wi-Fi e furigana."; toast("jp invalido"); beep("tuk"); return; }
    for (const w of nw) {
      if (!isValidJP(w.jp)) { msg.textContent = "palavra nova jp invalida."; toast("palavra invalida"); beep("tuk"); return; }
    }

    p.jp = jp;
    p.pt = pt;
    p.newWords = nw;
    p.topicId = topicId;
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
      if (!STATE.session.queue.length || !STATE.session.phraseId) render105x();
      else {
        render105xBodyOnly();
        renderPhraseListOnly();
      }
    }
    return;
  }

  if (act === "exportCopy" || act === "exportFile") {
    const msg = $("#backupMsg");
    const payload = { schema: "jp_105x_backup_v1", exportedAt: new Date().toISOString(), state: STATE };
    const txt = JSON.stringify(payload, null, 2);

    if (act === "exportCopy") {
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

    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const filename = `nihongo321-backup-${y}-${m}-${dd}.json`;

    downloadTextFile(filename, txt);
    msg.textContent = "baixado ✅ (procure em downloads)";
    toast("backup baixado ✅");
    beep("ding");
    return;
  }

  if (act === "importText") {
    const box = $("#importBox");
    const msg = $("#backupMsg");
    const raw = (box?.value || "").trim();
    if (!raw) { msg.textContent = "cole o json primeiro."; toast("sem json"); beep("tuk"); return; }

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
    toast(STATE.prefs.haptics.enabled ? "vibracao ligada" : "vibracao desligada");
    refreshHUD();
    render();
    return;
  }

  if (act === "reset") {
    clearCallFlow();
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem("jp_105x_v2");
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

document.addEventListener("change", (e) => {
  const el = e.target;
  if (el && el.id === "fileImport") {
    const msg = $("#backupMsg");
    if (!msg) return;

    const file = el.files && el.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "").trim();
      const parsed = safeJSONParse(text);
      validateAndLoadBackup(parsed, msg);
    };
    reader.onerror = () => {
      msg.textContent = "nao deu pra ler o arquivo.";
      toast("erro ao ler arquivo");
      beep("tuk");
    };
    reader.readAsText(file);
  }
});

window.addEventListener("hashchange", () => {
  clearCallFlow();
  render();
  startStudyTimerIfOn105x();
  updateBackTopVisibility();
});

(function init() {
  ensureDefaultTopic();
  refreshHUD();
  if (!location.hash) nav("#/home");

  ensureBackTopButton();
  hookBackTopScroll();
  updateBackTopVisibility();

  ensureHabitToday();
  syncHabitMs();

  render();
  startStudyTimerIfOn105x();
})();