/* =========================================================
   Japonês no Automático (SPA leve)
   - HTML/CSS/JS puro
   - localStorage
   - 105X + Quiz 8s + Editor + Backup + Settings
   - anti-kanji (JP só hiragana/katakana + pontuação básica)
   ========================================================= */

const LS_KEY = "jp_auto_v1";

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const now = () => Date.now();
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dayKey = (d = new Date()) => {
  // YYYY-MM-DD local
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};
const weekKeyISO = (date = new Date()) => {
  // ISO week key: YYYY-W##
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};
const uid = (p = "id") => `${p}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

function safeJSONParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

/* ---------- anti-kanji validation ----------
   Permitir:
   - hiragana: \u3040-\u309F
   - katakana: \u30A0-\u30FF
   - espaços normais
   - pontuação básica japonesa e ocidental
*/
const JP_ALLOWED_RE = /^[\u3040-\u309F\u30A0-\u30FF 　。、！？・ー\-~!?.,:;()「」『』…\n\r\t0-9]*$/;

function isValidJP(text) {
  if (typeof text !== "string") return false;
  const t = text.trim();
  if (!t) return false;
  return JP_ALLOWED_RE.test(t);
}

/* ---------- defaults / seed ---------- */
function seedPhrases() {
  return [
    { id:"ph_001", jp:"おはよう", pt:"bom dia", newWords:[{jp:"おはよう", pt:"bom dia"}], tags:["rotina"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:["お","は","よ","う"]}, createdAt:now(), updatedAt:now() },
    { id:"ph_002", jp:"おつかれさま", pt:"bom trabalho / valeu pelo esforço", newWords:[{jp:"おつかれさま", pt:"bom trabalho"}], tags:["trabalho"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:["お","つ","か","れ","さ","ま"]}, createdAt:now(), updatedAt:now() },
    { id:"ph_003", jp:"きょうは つかれた", pt:"hoje eu estou cansado", newWords:[{jp:"きょう",pt:"hoje"},{jp:"つかれた",pt:"cansado"}], tags:["cansaco"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_004", jp:"ねむい", pt:"estou com sono", newWords:[{jp:"ねむい",pt:"com sono"}], tags:["cansaco"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:["ね","む","い"]}, createdAt:now(), updatedAt:now() },
    { id:"ph_005", jp:"いま いそがしい", pt:"agora estou ocupado", newWords:[{jp:"いま",pt:"agora"},{jp:"いそがしい",pt:"ocupado"}], tags:["trabalho"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_006", jp:"ちょっと まって", pt:"espera um pouco", newWords:[{jp:"ちょっと",pt:"um pouco"},{jp:"まって",pt:"espera"}], tags:["pedido"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_007", jp:"だいじょうぶ", pt:"tudo bem / está ok", newWords:[{jp:"だいじょうぶ",pt:"tudo bem"}], tags:["confirmacao"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_008", jp:"もういちど おねがい", pt:"de novo, por favor", newWords:[{jp:"もういちど",pt:"mais uma vez"},{jp:"おねがい",pt:"por favor"}], tags:["pedido"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_009", jp:"ゆっくり おねがい", pt:"devagar, por favor", newWords:[{jp:"ゆっくり",pt:"devagar"}], tags:["pedido"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_010", jp:"わからない", pt:"nao entendi / nao sei", newWords:[{jp:"わからない",pt:"nao entendi"}], tags:["erro"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:["わ","か","ら","な","い"]}, createdAt:now(), updatedAt:now() },

    { id:"ph_011", jp:"これ どこ", pt:"onde fica isto?", newWords:[{jp:"これ",pt:"isto"},{jp:"どこ",pt:"onde"}], tags:["pergunta"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_012", jp:"これ なに", pt:"o que e isto?", newWords:[{jp:"なに",pt:"o que"}], tags:["pergunta"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_013", jp:"たすけて", pt:"me ajuda", newWords:[{jp:"たすけて",pt:"me ajuda"}], tags:["seguranca"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:["た","す","け","て"]}, createdAt:now(), updatedAt:now() },
    { id:"ph_014", jp:"あぶない", pt:"perigoso", newWords:[{jp:"あぶない",pt:"perigoso"}], tags:["seguranca"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:["あ","ぶ","な","い"]}, createdAt:now(), updatedAt:now() },
    { id:"ph_015", jp:"きをつけて", pt:"cuidado", newWords:[{jp:"きをつけて",pt:"cuidado"}], tags:["seguranca"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_016", jp:"ここで まって", pt:"espera aqui", newWords:[{jp:"ここ",pt:"aqui"}], tags:["pedido"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_017", jp:"これを つかう", pt:"usar isto", newWords:[{jp:"つかう",pt:"usar"}], tags:["instrucao"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_018", jp:"それは だめ", pt:"isso nao pode", newWords:[{jp:"それ",pt:"isso"},{jp:"だめ",pt:"nao pode"}], tags:["instrucao"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_019", jp:"もう いい", pt:"ja esta bom / pode parar", newWords:[{jp:"もう",pt:"ja"},{jp:"いい",pt:"bom"}], tags:["instrucao"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() },
    { id:"ph_020", jp:"あとで はなそう", pt:"vamos falar depois", newWords:[{jp:"あとで",pt:"depois"},{jp:"はなそう",pt:"vamos falar"}], tags:["social"], audio:{mode:"tts",voiceHint:"ja-JP",rateNormal:1,rateSlow:0.8,fileRef:null}, karaoke:{mode:"approx",segments:[]}, createdAt:now(), updatedAt:now() }
  ];
}

function seedQuiz() {
  // 20 perguntas, cada uma com 4 opções e feedback curto
  return [
    {
      id:"q_001", type:"particle",
      promptJp:"わたしは つかれた",
      promptPt:"particula: marque o tema (assunto da frase)",
      options:[
        {jp:"は",pt:"tema",isCorrect:true,feedbackPt:"isso. は marca o tema: sobre o que voce vai falar"},
        {jp:"が",pt:"sujeito",isCorrect:false,feedbackPt:"が destaca o sujeito (quem/que faz). aqui a ideia e tema"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を marca objeto direto. nao e o caso aqui"},
        {jp:"に",pt:"destino/tempo",isCorrect:false,feedbackPt:"に e destino, tempo ou alvo. nao e tema"}
      ],
      rulePt:"dica: は = tema. が = sujeito destacado.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_002", type:"particle",
      promptJp:"わたしが やる",
      promptPt:"particula: quem esta com foco (eu vou fazer)",
      options:[
        {jp:"が",pt:"sujeito com foco",isCorrect:true,feedbackPt:"isso. が destaca o sujeito com foco"},
        {jp:"は",pt:"tema",isCorrect:false,feedbackPt:"は e tema geral. aqui a ideia e foco no sujeito"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を e objeto direto, nao sujeito"},
        {jp:"で",pt:"lugar da acao",isCorrect:false,feedbackPt:"で e lugar onde acontece"}
      ],
      rulePt:"dica: が = sujeito com foco.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_003", type:"particle",
      promptJp:"これを つかう",
      promptPt:"particula: marque o objeto (isto)",
      options:[
        {jp:"を",pt:"objeto",isCorrect:true,feedbackPt:"isso. を marca o objeto direto"},
        {jp:"は",pt:"tema",isCorrect:false,feedbackPt:"は e tema, nao objeto"},
        {jp:"が",pt:"sujeito",isCorrect:false,feedbackPt:"が e sujeito com foco"},
        {jp:"に",pt:"destino/tempo",isCorrect:false,feedbackPt:"に e destino/tempo"}
      ],
      rulePt:"dica: を = objeto direto.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_004", type:"particle",
      promptJp:"ここに おく",
      promptPt:"particula: lugar de destino (colocar aqui)",
      options:[
        {jp:"に",pt:"destino",isCorrect:true,feedbackPt:"isso. に marca destino/alvo"},
        {jp:"で",pt:"lugar da acao",isCorrect:false,feedbackPt:"で e lugar onde acontece a acao, mas aqui e destino"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を e objeto direto"},
        {jp:"が",pt:"sujeito",isCorrect:false,feedbackPt:"が e sujeito com foco"}
      ],
      rulePt:"dica: に = destino/alvo.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_005", type:"particle",
      promptJp:"こうじょうで はたらく",
      promptPt:"particula: lugar onde acontece a acao (trabalhar na fabrica)",
      options:[
        {jp:"で",pt:"lugar da acao",isCorrect:true,feedbackPt:"isso. で marca onde acontece a acao"},
        {jp:"に",pt:"destino",isCorrect:false,feedbackPt:"に e destino. aqui e local da acao"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を e objeto direto"},
        {jp:"は",pt:"tema",isCorrect:false,feedbackPt:"は e tema"}
      ],
      rulePt:"dica: で = onde acontece. に = para onde vai.",
      tags:["particulas","trabalho"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_006", type:"particle",
      promptJp:"あなたは だいじょうぶ",
      promptPt:"particula: marque o tema (voce)",
      options:[
        {jp:"は",pt:"tema",isCorrect:true,feedbackPt:"isso. は marca o tema"},
        {jp:"が",pt:"sujeito com foco",isCorrect:false,feedbackPt:"が e foco no sujeito. aqui e tema simples"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を e objeto direto"},
        {jp:"で",pt:"lugar da acao",isCorrect:false,feedbackPt:"で e lugar"}
      ],
      rulePt:"dica: frase simples de tema usa は.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_007", type:"particle",
      promptJp:"これが いい",
      promptPt:"particula: destaque o escolhido (isto e bom)",
      options:[
        {jp:"が",pt:"foco",isCorrect:true,feedbackPt:"isso. が destaca o escolhido"},
        {jp:"は",pt:"tema",isCorrect:false,feedbackPt:"は e tema. aqui e escolha/foco"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を e objeto direto"},
        {jp:"に",pt:"destino/tempo",isCorrect:false,feedbackPt:"に e destino/tempo"}
      ],
      rulePt:"dica: が pode ser foco/selecionado.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_008", type:"particle",
      promptJp:"あしたに くる",
      promptPt:"particula: tempo marcado (amanha)",
      options:[
        {jp:"に",pt:"tempo",isCorrect:true,feedbackPt:"isso. に pode marcar tempo marcado"},
        {jp:"で",pt:"lugar",isCorrect:false,feedbackPt:"で e lugar da acao"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を e objeto"},
        {jp:"が",pt:"sujeito",isCorrect:false,feedbackPt:"が e sujeito com foco"}
      ],
      rulePt:"dica: に pode marcar tempo marcado.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_009", type:"particle",
      promptJp:"こうじょうで これを つかう",
      promptPt:"particula: marque o objeto (isto)",
      options:[
        {jp:"を",pt:"objeto",isCorrect:true,feedbackPt:"isso. を marca objeto direto"},
        {jp:"で",pt:"lugar",isCorrect:false,feedbackPt:"で e lugar da acao, nao objeto"},
        {jp:"に",pt:"destino",isCorrect:false,feedbackPt:"に e destino/tempo"},
        {jp:"は",pt:"tema",isCorrect:false,feedbackPt:"は e tema"}
      ],
      rulePt:"dica: objeto direto = を.",
      tags:["particulas","trabalho"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_010", type:"particle",
      promptJp:"ここで まって",
      promptPt:"particula: local da acao (esperar aqui)",
      options:[
        {jp:"で",pt:"local da acao",isCorrect:true,feedbackPt:"isso. で marca onde acontece"},
        {jp:"に",pt:"destino",isCorrect:false,feedbackPt:"に e destino. aqui e onde acontece"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を e objeto"},
        {jp:"が",pt:"sujeito",isCorrect:false,feedbackPt:"が e sujeito com foco"}
      ],
      rulePt:"dica: で = onde acontece.",
      tags:["particulas"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },

    // vocab (katakana)
    {
      id:"q_011", type:"vocab",
      promptJp:"ヘルメット",
      promptPt:"vocab: o que significa?",
      options:[
        {jp:"かぶと",pt:"capacete",isCorrect:true,feedbackPt:"isso. seguranca primeiro."},
        {jp:"グローブ",pt:"luvas",isCorrect:false,feedbackPt:"グローブ e luvas. aqui e ヘルメット."},
        {jp:"テープ",pt:"fita",isCorrect:false,feedbackPt:"テープ e fita."},
        {jp:"ストップ",pt:"parar",isCorrect:false,feedbackPt:"ストップ e parar."}
      ],
      rulePt:"dica: katakana costuma ser palavra emprestada.",
      tags:["vocab","seguranca"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:["ヘ","ル","メ","ッ","ト"]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_012", type:"vocab",
      promptJp:"グローブ",
      promptPt:"vocab: o que significa?",
      options:[
        {jp:"グローブ",pt:"luvas",isCorrect:true,feedbackPt:"isso. protecao nas maos."},
        {jp:"ヘルメット",pt:"capacete",isCorrect:false,feedbackPt:"ヘルメット e capacete."},
        {jp:"チェック",pt:"conferir",isCorrect:false,feedbackPt:"チェック e conferir."},
        {jp:"ミス",pt:"erro",isCorrect:false,feedbackPt:"ミス e erro."}
      ],
      rulePt:"dica: グローブ = luvas.",
      tags:["vocab","seguranca"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:["グ","ロ","ー","ブ"]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_013", type:"vocab",
      promptJp:"テープ",
      promptPt:"vocab: o que significa?",
      options:[
        {jp:"テープ",pt:"fita",isCorrect:true,feedbackPt:"isso. fita."},
        {jp:"ストップ",pt:"parar",isCorrect:false,feedbackPt:"ストップ e parar."},
        {jp:"ミス",pt:"erro",isCorrect:false,feedbackPt:"ミス e erro."},
        {jp:"チェック",pt:"conferir",isCorrect:false,feedbackPt:"チェック e conferir."}
      ],
      rulePt:"dica: テープ = fita.",
      tags:["vocab","trabalho"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:["テ","ー","プ"]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_014", type:"vocab",
      promptJp:"チェック",
      promptPt:"vocab: o que significa?",
      options:[
        {jp:"チェック",pt:"conferir",isCorrect:true,feedbackPt:"isso. conferir/verificar."},
        {jp:"ストップ",pt:"parar",isCorrect:false,feedbackPt:"ストップ e parar."},
        {jp:"テープ",pt:"fita",isCorrect:false,feedbackPt:"テープ e fita."},
        {jp:"グローブ",pt:"luvas",isCorrect:false,feedbackPt:"グローブ e luvas."}
      ],
      rulePt:"dica: チェック = conferir.",
      tags:["vocab","trabalho"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:["チ","ェ","ッ","ク"]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_015", type:"vocab",
      promptJp:"ミス",
      promptPt:"vocab: o que significa?",
      options:[
        {jp:"ミス",pt:"erro",isCorrect:true,feedbackPt:"isso. erro."},
        {jp:"チェック",pt:"conferir",isCorrect:false,feedbackPt:"チェック e conferir."},
        {jp:"ヘルメット",pt:"capacete",isCorrect:false,feedbackPt:"ヘルメット e capacete."},
        {jp:"テープ",pt:"fita",isCorrect:false,feedbackPt:"テープ e fita."}
      ],
      rulePt:"dica: ミス = erro.",
      tags:["vocab","trabalho"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:["ミ","ス"]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_016", type:"vocab",
      promptJp:"ストップ",
      promptPt:"vocab: o que significa?",
      options:[
        {jp:"ストップ",pt:"parar",isCorrect:true,feedbackPt:"isso. parar."},
        {jp:"ミス",pt:"erro",isCorrect:false,feedbackPt:"ミス e erro."},
        {jp:"チェック",pt:"conferir",isCorrect:false,feedbackPt:"チェック e conferir."},
        {jp:"グローブ",pt:"luvas",isCorrect:false,feedbackPt:"グローブ e luvas."}
      ],
      rulePt:"dica: ストップ = parar.",
      tags:["vocab","seguranca"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:["ス","ト","ッ","プ"]},
      createdAt:now(), updatedAt:now()
    },

    // translate
    {
      id:"q_017", type:"translate",
      promptJp:"もういちど おねがい",
      promptPt:"traducao: escolha a melhor",
      options:[
        {jp:"",pt:"de novo, por favor",isCorrect:true,feedbackPt:"perfeito. pedir repeticao."},
        {jp:"",pt:"estou cansado",isCorrect:false,feedbackPt:"isso seria つかれた."},
        {jp:"",pt:"devagar, por favor",isCorrect:false,feedbackPt:"isso seria ゆっくり おねがい."},
        {jp:"",pt:"tudo bem",isCorrect:false,feedbackPt:"isso seria だいじょうぶ."}
      ],
      rulePt:"dica: もういちど = mais uma vez.",
      tags:["frases"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_018", type:"translate",
      promptJp:"ゆっくり おねがい",
      promptPt:"traducao: escolha a melhor",
      options:[
        {jp:"",pt:"devagar, por favor",isCorrect:true,feedbackPt:"isso. voce pediu devagar."},
        {jp:"",pt:"mais rapido, por favor",isCorrect:false,feedbackPt:"isso seria もっと はやく おねがい (nao vamos usar agora)."},
        {jp:"",pt:"espera aqui",isCorrect:false,feedbackPt:"isso seria ここで まって."},
        {jp:"",pt:"nao entendi",isCorrect:false,feedbackPt:"isso seria わからない."}
      ],
      rulePt:"dica: ゆっくり = devagar.",
      tags:["frases"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_019", type:"translate",
      promptJp:"ここで まって",
      promptPt:"traducao: escolha a melhor",
      options:[
        {jp:"",pt:"espera aqui",isCorrect:true,feedbackPt:"isso. aqui e ここ."},
        {jp:"",pt:"venha amanha",isCorrect:false,feedbackPt:"isso seria あした きて."},
        {jp:"",pt:"pare agora",isCorrect:false,feedbackPt:"isso seria いま ストップ."},
        {jp:"",pt:"bom trabalho",isCorrect:false,feedbackPt:"isso seria おつかれさま."}
      ],
      rulePt:"dica: まって = esperar.",
      tags:["frases"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    },
    {
      id:"q_020", type:"translate",
      promptJp:"それは だめ",
      promptPt:"traducao: escolha a melhor",
      options:[
        {jp:"",pt:"isso nao pode",isCorrect:true,feedbackPt:"isso. proibido / nao pode."},
        {jp:"",pt:"isso e bom",isCorrect:false,feedbackPt:"isso seria それは いい."},
        {jp:"",pt:"isto e meu",isCorrect:false,feedbackPt:"isso seria これは わたしの."},
        {jp:"",pt:"estou ocupado",isCorrect:false,feedbackPt:"isso seria いま いそがしい."}
      ],
      rulePt:"dica: だめ = nao pode.",
      tags:["frases"], audio:{mode:"tts",rateNormal:1,rateSlow:0.8}, karaoke:{mode:"approx",segments:[]},
      createdAt:now(), updatedAt:now()
    }
  ];
}

function defaultState() {
  const t = now();
  const phrases = seedPhrases();
  const quiz = seedQuiz();

  const progressPhrase = {};
  for (const p of phrases) {
    progressPhrase[p.id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      cyclesCompleted: 0,
      masteredAt: null,
      dueAt: 0,
      ease: 1,
      today: { reps: 0, skips: 0, lastAt: 0 },
      history: []
    };
  }

  const progressQuiz = {};
  for (const q of quiz) {
    progressQuiz[q.id] = {
      box: 1,
      dueAt: 0,
      lastAnswerAt: 0,
      streakCorrect: 0,
      stats: { seen: 0, correct: 0, wrong: 0, fast: 0 }
    };
  }

  return {
    app: { schemaVersion: 1, createdAt: t, updatedAt: t },

    settings: {
      dailyMinutesDefault: 10,
      exhaustMinutes: 2,
      quizSeconds: 8,
      quizRoundSize: 10,
      modeShort: { enabled: true, maxPhrases: 2, maxQuiz: 10 },
      startBehavior: { resumeIfSameDay: true, autoContinue: true },
      language: "pt-BR",
      leitnerIntervalsMs: {
        1: 10 * 60 * 1000,
        2: 24 * 60 * 60 * 1000,
        3: 3 * 24 * 60 * 60 * 1000,
        4: 7 * 24 * 60 * 60 * 1000,
        5: 14 * 24 * 60 * 60 * 1000
      }
    },

    stats: {
      coins: 0,
      combo: 0,
      bestCombo: 0,
      todayCoins: 0,
      lastActiveAt: 0,
      daysActive: 0
    },

    bank: { phrases, quiz },

    progress: { phrase: progressPhrase, quiz: progressQuiz },

    habit: {
      streak: {
        current: 0,
        best: 0,
        lastDayKey: "",
        weeklyRestUsedForWeekKey: "",
        restAvailable: true,
        savers: { count: 0, priceCoins: 30 }
      },
      mission: {
        dayKey: "",
        textPt: "missao: -",
        kind: "none",
        target: 0,
        progress: 0,
        done: false,
        rewardCoins: 5
      },
      fatigue: {
        dayKeyLastAsk: "",
        answers: [],
        trend: { deadRatio7d: 0, autoMode: "normal" },
        manualOverride: null
      },
      session: {
        inProgress: false,
        mode: "normal",
        plan: { minutes: 10, steps: [] },
        cursor: { currentRoute: "home", phraseId: null, quizQueue: [], quizIndex: 0, phraseQueue: [], phraseIndex: 0 },
        startedAt: 0,
        endedAt: null,
        lastCheckpointAt: 0,
        // 105X session overrides (exausto)
        temp: { phraseCycleStartOverride: null }
      }
    },

    prefs: {
      audio: { enabled: true, volume: 0.4, unlocked: false },
      haptics: { enabled: true },
      motion: { reduced: "auto" }
    }
  };
}

/* ---------- storage ---------- */
function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return defaultState();
  const parsed = safeJSONParse(raw);
  if (!parsed || !parsed.app || parsed.app.schemaVersion !== 1) {
    // fallback: se algo estiver quebrado, recomeça (simples)
    return defaultState();
  }
  return parsed;
}

function saveState() {
  STATE.app.updatedAt = now();
  localStorage.setItem(LS_KEY, JSON.stringify(STATE));
}

/* ---------- audio / haptics ---------- */
let audioCtx = null;

function unlockAudio() {
  // deve ser chamado APENAS após ação do usuário
  if (STATE.prefs.audio.unlocked) return;
  STATE.prefs.audio.unlocked = true;

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    // "warm up"
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    g.gain.value = 0.0001;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.01);
  } catch {
    // ok: sem webaudio
  }
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

  // presets simples
  let freq = 220, dur = 0.06;
  if (type === "ding") { freq = 660; dur = 0.08; }
  if (type === "pop") { freq = 520; dur = 0.05; }
  if (type === "tuk") { freq = 140; dur = 0.06; }
  if (type === "level") { freq = 780; dur = 0.11; }

  o.type = "sine";
  o.frequency.setValueAtTime(freq, t0);

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * 0.12), t0 + 0.01);
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

/* ---------- TTS + karaoke ---------- */
function ttsSpeak(text, rate = 1.0, onStart, onEnd) {
  if (!("speechSynthesis" in window)) {
    // sem TTS: retorna false e deixa UI seguir
    return false;
  }
  // cancelar fila
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

function estimateDurationMs(text, rate) {
  // heurística: ~110ms por caractere "falável"
  // espaços contam pouco
  const clean = (text || "").replace(/\s+/g, "");
  const n = clean.length || 1;
  const base = 110 * n;
  const r = clamp(rate, 0.6, 1.2);
  return base / r;
}

/* ---------- HUD ---------- */
function refreshHUD() {
  $("#hudCoinsVal").textContent = String(STATE.stats.coins || 0);
  $("#hudComboVal").textContent = String(STATE.stats.combo || 0);
  $("#hudMissionText").textContent = STATE.habit.mission?.textPt || "missao: -";

  const mode = getEffectiveMode();
  $("#hudFatigueText").textContent = mode === "exhaust" ? "exausto" : "ok";

  $("#hudSound").textContent = STATE.prefs.audio.enabled ? "🔊" : "🔇";
  $("#hudVibe").textContent = STATE.prefs.haptics.enabled ? "📳" : "📴";

  // substatus (topbar)
  const st = STATE.habit.streak;
  const sTxt = st.current > 0 ? `streak ${st.current}` : "streak de leve";
  $("#subStatus").textContent = `${sTxt} • ${STATE.settings.quizSeconds}s quiz`;
}

function toast(msg) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("on"), 1600);
}

/* ---------- habit: fatigue ---------- */
function shouldAskFatigueToday() {
  const dk = dayKey();
  return STATE.habit.fatigue.dayKeyLastAsk !== dk;
}

function recordFatigue(value /* "dead"|"ok" */) {
  const dk = dayKey();
  STATE.habit.fatigue.dayKeyLastAsk = dk;
  STATE.habit.fatigue.answers.push({ dayKey: dk, value });
  // keep last 14
  if (STATE.habit.fatigue.answers.length > 14) {
    STATE.habit.fatigue.answers = STATE.habit.fatigue.answers.slice(-14);
  }
  recomputeFatigueTrend();
  saveState();
  refreshHUD();
}

function recomputeFatigueTrend() {
  const dk = dayKey();
  const last7 = STATE.habit.fatigue.answers
    .filter(a => a.dayKey <= dk)
    .slice(-7);

  const n = last7.length;
  if (n < 3) {
    STATE.habit.fatigue.trend.deadRatio7d = 0;
    STATE.habit.fatigue.trend.autoMode = "normal";
    return;
  }
  const dead = last7.filter(a => a.value === "dead").length;
  const ratio = dead / n;
  STATE.habit.fatigue.trend.deadRatio7d = ratio;
  STATE.habit.fatigue.trend.autoMode = ratio >= 0.6 ? "exhaust" : "normal";
}

function getEffectiveMode() {
  const manual = STATE.habit.fatigue.manualOverride;
  if (manual === "exhaust" || manual === "normal") return manual;
  return STATE.habit.fatigue.trend.autoMode || "normal";
}

function toggleManualMode() {
  const cur = getEffectiveMode();
  STATE.habit.fatigue.manualOverride = (cur === "exhaust") ? "normal" : "exhaust";
  saveState();
  refreshHUD();
  toast(cur === "exhaust" ? "modo ok" : "modo exausto");
}

/* ---------- mission ---------- */
function ensureMission() {
  const dk = dayKey();
  const m = STATE.habit.mission;
  if (m.dayKey === dk) return;

  // gerar missao simples
  const trainingCount = countTrainingPhrases();
  const kind = trainingCount > 0 ? "105x_cycle" : "quiz_correct";
  let textPt = "missao: fechar 1 ciclo no 105x";
  let target = 1;
  if (kind === "quiz_correct") {
    textPt = "missao: acertar 5 no quiz";
    target = 5;
  }

  STATE.habit.mission = {
    dayKey: dk,
    textPt,
    kind,
    target,
    progress: 0,
    done: false,
    rewardCoins: 5
  };
  saveState();
}

function bumpMission(kind, amount = 1) {
  const m = STATE.habit.mission;
  if (!m || m.done) return;
  if (m.kind !== kind) return;
  m.progress = clamp((m.progress || 0) + amount, 0, m.target);
  if (m.progress >= m.target) {
    m.done = true;
    addCoins(m.rewardCoins, "missao feita");
    toast("missao feita ✅");
    beep("ding");
    vibrate([12, 40, 12]);
  }
  saveState();
  refreshHUD();
}

/* ---------- streak (sem culpa) ---------- */
function markTodayActive() {
  const dk = dayKey();
  const st = STATE.habit.streak;

  // reset today coins
  if (st.lastDayKey !== dk) {
    STATE.stats.todayCoins = 0;
    resetTodayPhraseCounters();
  }

  // streak logic
  if (!st.lastDayKey) {
    st.current = 1;
    st.best = Math.max(st.best, st.current);
    st.lastDayKey = dk;
    saveState();
    return;
  }

  if (st.lastDayKey === dk) {
    // já contou hoje
    saveState();
    return;
  }

  // compare with yesterday
  const last = new Date(st.lastDayKey + "T00:00:00");
  const y = new Date();
  y.setHours(0,0,0,0);
  const diffDays = Math.round((y - last) / 86400000);

  const wk = weekKeyISO(new Date());
  if (st.weeklyRestUsedForWeekKey !== wk) {
    // nova semana: folga volta
    st.restAvailable = true;
    st.weeklyRestUsedForWeekKey = wk;
  }

  if (diffDays === 1) {
    st.current += 1;
    st.best = Math.max(st.best, st.current);
    st.lastDayKey = dk;
    saveState();
    return;
  }

  // pulou dias
  if (st.restAvailable) {
    st.restAvailable = false;
    st.lastDayKey = dk;
    toast("hoje foi folga. ta valendo ✅");
    saveState();
    return;
  }

  // sem folga: reinicia sem bronca
  st.current = 1;
  st.best = Math.max(st.best, st.current);
  st.lastDayKey = dk;
  toast("recomecou. sem drama. vamo devagar.");
  saveState();
}

/* ---------- coins / combo ---------- */
function addCoins(amount, reason) {
  STATE.stats.coins = (STATE.stats.coins || 0) + amount;
  STATE.stats.todayCoins = (STATE.stats.todayCoins || 0) + amount;
  saveState();
  refreshHUD();
  if (reason) {
    // sem spam de toast
  }
}

function comboSet(n) {
  STATE.stats.combo = clamp(n, 0, 999);
  STATE.stats.bestCombo = Math.max(STATE.stats.bestCombo || 0, STATE.stats.combo);
  saveState();
  refreshHUD();
}

/* ---------- router ---------- */
function nav(hash) {
  location.hash = hash;
}

function getRoute() {
  const h = location.hash || "#/home";
  return h.startsWith("#/") ? h : "#/home";
}

/* ---------- session planner ---------- */
function startSession() {
  unlockAudio();
  ensureMission();
  markTodayActive();

  const mode = getEffectiveMode();
  const plan = buildSessionPlan(mode);

  STATE.habit.session.inProgress = true;
  STATE.habit.session.mode = mode;
  STATE.habit.session.startedAt = now();
  STATE.habit.session.endedAt = null;
  STATE.habit.session.plan = plan;
  STATE.habit.session.lastCheckpointAt = now();

  // build queues
  STATE.habit.session.cursor.phraseQueue = pickPhraseQueue(mode);
  STATE.habit.session.cursor.phraseIndex = 0;

  STATE.habit.session.cursor.quizQueue = pickQuizQueue(mode);
  STATE.habit.session.cursor.quizIndex = 0;

  // exausto: override temporário cycleStart para 7
  STATE.habit.session.temp.phraseCycleStartOverride = (mode === "exhaust") ? 7 : null;

  // começar sempre no 105X (pilot auto)
  const firstPhraseId = STATE.habit.session.cursor.phraseQueue[0] || pickAnyPhraseId();
  STATE.habit.session.cursor.phraseId = firstPhraseId;

  saveState();
  refreshHUD();
  nav("#/105x");
}

function buildSessionPlan(mode) {
  // simples: exausto = 1 frase (ciclo curto) + 3 quiz
  // normal = frases (modo curto) + rodada quiz
  if (mode === "exhaust") {
    return {
      minutes: STATE.settings.exhaustMinutes,
      steps: [
        { kind: "105x", phrases: 1 },
        { kind: "quiz", count: 3 }
      ]
    };
  }
  const maxP = STATE.settings.modeShort.enabled ? STATE.settings.modeShort.maxPhrases : 3;
  const round = STATE.settings.modeShort.enabled ? STATE.settings.modeShort.maxQuiz : STATE.settings.quizRoundSize;
  return {
    minutes: STATE.settings.dailyMinutesDefault,
    steps: [
      { kind: "105x", phrases: maxP },
      { kind: "quiz", count: round }
    ]
  };
}

function pickAnyPhraseId() {
  return STATE.bank.phrases[0]?.id || null;
}

function countTrainingPhrases() {
  let c = 0;
  for (const p of STATE.bank.phrases) {
    const pr = STATE.progress.phrase[p.id];
    if (pr?.status !== "mastered") c++;
  }
  return c;
}

function pickPhraseQueue(mode) {
  // prioridade: training, depois mastered (1 só)
  const training = [];
  const mastered = [];

  for (const p of STATE.bank.phrases) {
    const pr = STATE.progress.phrase[p.id];
    if (!pr) continue;
    (pr.status === "mastered" ? mastered : training).push(p.id);
  }

  // simples: training na ordem; se quiser, embaralha leve por dia
  const max = (mode === "exhaust") ? 1 : (STATE.settings.modeShort.enabled ? STATE.settings.modeShort.maxPhrases : 3);
  const queue = training.slice(0, max);

  if (queue.length < max && mastered.length) {
    queue.push(mastered[0]); // revisão leve
  }
  return queue;
}

function pickQuizQueue(mode) {
  const n = (mode === "exhaust") ? 3 : (STATE.settings.modeShort.enabled ? STATE.settings.modeShort.maxQuiz : STATE.settings.quizRoundSize);
  const due = [];
  const rest = [];

  const filterType = STATE._quizFilterType || "all";

  for (const q of STATE.bank.quiz) {
    if (filterType !== "all" && q.type !== filterType) continue;
    const pq = STATE.progress.quiz[q.id];
    const d = pq?.dueAt || 0;
    if (d <= now()) due.push(q.id);
    else rest.push(q.id);
  }

  // se due não dá: completa com box 1/2 primeiro
  rest.sort((a,b) => (STATE.progress.quiz[a]?.box||1) - (STATE.progress.quiz[b]?.box||1));

  const out = due.slice(0, n);
  let i = 0;
  while (out.length < n && i < rest.length) {
    out.push(rest[i++]);
  }
  // evitar repetição direta (já é fila, ok)
  return out;
}

function endSessionIfDone() {
  // critério: no exausto, terminou quizIndex >= 3 e ciclo curto feito ao menos 1 vez
  // no normal, terminou quizQueue e passou pelas frases do queue (não precisa dominar tudo)
  const s = STATE.habit.session;
  if (!s.inProgress) return false;

  const mode = s.mode;
  const qDone = s.cursor.quizIndex >= s.cursor.quizQueue.length;
  const pDone = s.cursor.phraseIndex >= s.cursor.phraseQueue.length;

  if (mode === "exhaust") {
    if (qDone && pDone) {
      s.inProgress = false;
      s.endedAt = now();
      saveState();
      toast("feito. hoje ja valeu ✅");
      beep("ding");
      vibrate([10, 40, 10]);
      nav("#/home");
      return true;
    }
    return false;
  }

  if (qDone && pDone) {
    s.inProgress = false;
    s.endedAt = now();
    saveState();
    toast("feito. bom trabalho ✅");
    beep("ding");
    nav("#/home");
    return true;
  }
  return false;
}

/* ---------- 105X mechanics ---------- */
function getActivePhraseId() {
  return STATE.habit.session.cursor.phraseId || pickAnyPhraseId();
}

function getPhraseById(id) {
  return STATE.bank.phrases.find(p => p.id === id) || null;
}

function getPhraseProg(id) {
  if (!STATE.progress.phrase[id]) {
    STATE.progress.phrase[id] = {
      status: "training",
      cycleStart: 14,
      count: 14,
      cyclesCompleted: 0,
      masteredAt: null,
      dueAt: 0,
      ease: 1,
      today: { reps: 0, skips: 0, lastAt: 0 },
      history: []
    };
  }
  return STATE.progress.phrase[id];
}

function sessionCycleStartOverride() {
  return STATE.habit.session?.temp?.phraseCycleStartOverride || null;
}

function effectiveCycleStart(phraseId) {
  const pr = getPhraseProg(phraseId);
  const ov = sessionCycleStartOverride();
  if (!ov) return pr.cycleStart;
  return Math.min(ov, pr.cycleStart);
}

function resetPhraseCountForSession(phraseId) {
  const pr = getPhraseProg(phraseId);
  const cs = effectiveCycleStart(phraseId);
  // se count estiver maior que cs, ajusta pra cs
  pr.count = Math.min(pr.count || cs, cs);
  if (pr.count < 1) pr.count = cs;
  saveState();
}

function phraseRepeat(phraseId) {
  const pr = getPhraseProg(phraseId);
  const cs = effectiveCycleStart(phraseId);

  // ajuste inicial
  if (pr.count > cs) pr.count = cs;
  if (pr.count < 1) pr.count = cs;

  // se ainda não chegou em 1: decrementa
  if (pr.count > 1) {
    pr.count -= 1;
    pr.today.reps += 1;
    pr.today.lastAt = now();
    pr.history.push({ at: now(), event: "rep" });

    beep("tap");
    vibrate([8]);
    saveState();
    refreshHUD();
    return { cycleDone: false, phraseMastered: false };
  }

  // pr.count == 1: toque finaliza ciclo
  pr.today.reps += 1;
  pr.today.lastAt = now();
  pr.history.push({ at: now(), event: "cycle_done", cycleStart: cs });

  addCoins(1, "ciclo 105x");
  beep("ding");

  // missão
  bumpMission("105x_cycle", 1);

  // reduzir ciclo real somente se cs == pr.cycleStart (se override exausto, não reduz o progresso permanente)
  const ov = sessionCycleStartOverride();
  if (!ov || ov >= pr.cycleStart) {
    if (pr.cycleStart > 1) pr.cycleStart -= 1;
    else pr.cycleStart = 1;
  }

  // se ciclo real chegou a 1 e completou (sem override ou override não impede), marca dominada
  let phraseMastered = false;
  if (pr.cycleStart === 1 && (!ov || ov >= 1)) {
    // ciclo final efetivamente concluído
    pr.status = "mastered";
    pr.masteredAt = now();
    addCoins(10, "frase dominada");
    beep("level");
    vibrate([10, 40, 10, 40, 10]);
    phraseMastered = true;
  }

  // reiniciar contagem pro próximo ciclo (effective)
  const nextCs = effectiveCycleStart(phraseId);
  pr.count = nextCs;

  saveState();
  refreshHUD();
  return { cycleDone: true, phraseMastered };
}

function phraseSkip(phraseId) {
  const pr = getPhraseProg(phraseId);
  pr.today.skips += 1;
  pr.today.lastAt = now();
  pr.history.push({ at: now(), event: "skip" });
  saveState();
  refreshHUD();
  toast("tudo bem. depois a gente volta 👍");
  beep("tuk");
  // reordenar fila: põe essa frase como próxima depois de 1 item (se estiver em sessão)
  const s = STATE.habit.session;
  if (s?.inProgress) {
    const q = s.cursor.phraseQueue;
    const idx = q.indexOf(phraseId);
    if (idx >= 0) {
      q.splice(idx, 1);
      const insertAt = Math.min(s.cursor.phraseIndex + 1, q.length);
      q.splice(insertAt, 0, phraseId);
    }
  }
}

function nextPhraseInSession() {
  const s = STATE.habit.session;
  if (!s.inProgress) return;
  s.cursor.phraseIndex += 1;
  const nextId = s.cursor.phraseQueue[s.cursor.phraseIndex] || null;
  s.cursor.phraseId = nextId;
  s.lastCheckpointAt = now();
  saveState();
}

/* ---------- quiz mechanics ---------- */
let quizTimerHandle = null;

function getQuestionById(id) {
  return STATE.bank.quiz.find(q => q.id === id) || null;
}

function getQuizProg(id) {
  if (!STATE.progress.quiz[id]) {
    STATE.progress.quiz[id] = {
      box: 1,
      dueAt: 0,
      lastAnswerAt: 0,
      streakCorrect: 0,
      stats: { seen: 0, correct: 0, wrong: 0, fast: 0 }
    };
  }
  return STATE.progress.quiz[id];
}

function scheduleDueForBox(box) {
  const map = STATE.settings.leitnerIntervalsMs || {};
  const ms = map[String(box)] || map[box] || (10 * 60 * 1000);
  return now() + ms;
}

function quizAnswer(questionId, chosenIndex, msElapsed, timedOut = false) {
  const q = getQuestionById(questionId);
  const pq = getQuizProg(questionId);

  pq.stats.seen += 1;
  pq.lastAnswerAt = now();

  const correctIndex = q.options.findIndex(o => o.isCorrect);
  const isCorrect = (!timedOut) && (chosenIndex === correctIndex);

  // scoring
  if (isCorrect) {
    pq.stats.correct += 1;
    pq.streakCorrect += 1;
    pq.box = clamp((pq.box || 1) + 1, 1, 5);
    pq.dueAt = scheduleDueForBox(pq.box);

    // moedas
    let coins = 2;
    const fast = msElapsed <= 3000;
    if (fast) { coins += 1; pq.stats.fast += 1; }

    // combo
    let combo = (STATE.stats.combo || 0) + 1;
    comboSet(combo);

    if (combo >= 3) coins += 1;

    addCoins(coins, "acerto quiz");
    bumpMission("quiz_correct", 1);

    beep("pop");
    vibrate([10]);

    return { isCorrect, correctIndex, coinsGained: coins, timedOut: false };
  }

  // errado/timeout
  pq.stats.wrong += 1;
  pq.streakCorrect = 0;
  pq.box = 1;
  pq.dueAt = now() + (getEffectiveMode() === "exhaust" ? 5 * 60 * 1000 : 10 * 60 * 1000);

  comboSet(0);

  beep("tuk");
  vibrate([20]);

  return { isCorrect: false, correctIndex, coinsGained: 0, timedOut };
}

function nextQuizInSession() {
  const s = STATE.habit.session;
  if (!s.inProgress) return;
  s.cursor.quizIndex += 1;
  s.lastCheckpointAt = now();
  saveState();
}

/* ---------- today counters reset ---------- */
function resetTodayPhraseCounters() {
  const dk = dayKey();
  for (const p of STATE.bank.phrases) {
    const pr = STATE.progress.phrase[p.id];
    if (!pr) continue;
    pr.today = pr.today || { reps: 0, skips: 0, lastAt: 0 };
    // não precisamos armazenar dayKey aqui: reset na troca do dia
    pr.today.reps = 0;
    pr.today.skips = 0;
    pr.today.lastAt = 0;
  }
  saveState();
}

/* ---------- UI rendering ---------- */
const APP = $("#app");
let STATE = loadState();

function render() {
  ensureMission();
  refreshHUD();

  const route = getRoute();
  const main = route.replace("#/", "");

  // limpar timers
  if (quizTimerHandle) { clearInterval(quizTimerHandle); quizTimerHandle = null; }

  if (main === "home") return renderHome();
  if (main === "105x") return render105x();
  if (main === "quiz") return renderQuiz();
  if (main === "edit") return renderEdit();
  if (main === "backup") return renderBackup();
  if (main === "settings") return renderSettings();

  nav("#/home");
}

function renderHome() {
  const ask = shouldAskFatigueToday();

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <h1 class="h1">um toque. e pronto.</h1>
        <p class="p">se hoje estiver pesado, 2 minutos ja contam. sem culpa.</p>

        ${ask ? `
          <div class="sheet stack" id="fatigueAsk">
            <div class="row row--between">
              <div class="badge">como voce ta hoje?</div>
              <div class="small">1 toque</div>
            </div>
            <div class="grid2">
              <button class="btn btn--bad btn--full" data-action="fatigue" data-value="dead">to morto</button>
              <button class="btn btn--ok btn--full" data-action="fatigue" data-value="ok">to ok</button>
            </div>
          </div>
        ` : ""}

        <button class="bigBtn" id="btnStart">COMEÇAR AGORA</button>

        <div class="sep"></div>

        <div class="row">
          <button class="btn" data-nav="#/105x">105x</button>
          <button class="btn" data-nav="#/quiz">quiz</button>
          <button class="btn" data-nav="#/edit">cadastro</button>
          <button class="btn" data-nav="#/backup">backup</button>
        </div>

        <p class="small">dica: som so toca depois de voce apertar algo.</p>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">streak</div>
          <div class="badge">melhor: ${STATE.habit.streak.best || 0}</div>
        </div>
        <div class="row row--between">
          <div class="h1" style="font-size:32px">${STATE.habit.streak.current || 0}</div>
          <div class="small">folga semanal: ${STATE.habit.streak.restAvailable ? "disponivel" : "usada"}</div>
        </div>
        <div class="small">feito hoje: ${STATE.habit.streak.lastDayKey === dayKey() ? "sim ✅" : "ainda nao"}</div>
      </section>
    </div>
  `;

  // handlers
  $("#btnStart").addEventListener("click", () => startSession());
}

function render105x() {
  if (!STATE.habit.session.inProgress) {
    // se entrou direto, cria sessão leve
    ensureMission();
    STATE.habit.session.inProgress = true;
    STATE.habit.session.mode = getEffectiveMode();
    STATE.habit.session.plan = buildSessionPlan(STATE.habit.session.mode);
    STATE.habit.session.cursor.phraseQueue = pickPhraseQueue(STATE.habit.session.mode);
    STATE.habit.session.cursor.phraseIndex = 0;
    STATE.habit.session.cursor.quizQueue = pickQuizQueue(STATE.habit.session.mode);
    STATE.habit.session.cursor.quizIndex = 0;
    STATE.habit.session.cursor.phraseId = STATE.habit.session.cursor.phraseQueue[0] || pickAnyPhraseId();
    STATE.habit.session.temp.phraseCycleStartOverride = (STATE.habit.session.mode === "exhaust") ? 7 : null;
    saveState();
  }

  const phraseId = getActivePhraseId();
  if (!phraseId) return nav("#/home");

  resetPhraseCountForSession(phraseId);

  const p = getPhraseById(phraseId);
  const pr = getPhraseProg(phraseId);
  const cs = effectiveCycleStart(phraseId);
  const count = clamp(pr.count || cs, 1, cs);

  // phrase list panel (compact)
  const list = STATE.bank.phrases.slice(0, 10).map(x => {
    const px = STATE.progress.phrase[x.id];
    const st = px?.status === "mastered" ? "dominada" : "treino";
    return `
      <div class="item">
        <div class="itemTop">
          <div>
            <p class="itemTitle">${escapeHTML(x.jp)}</p>
            <div class="itemMeta">${escapeHTML(x.pt)} • ${st}</div>
          </div>
          <button class="btn" data-action="gotoPhrase" data-id="${x.id}">ir</button>
        </div>
      </div>
    `;
  }).join("");

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">105x</div>
          <div class="badge">${pr.status === "mastered" ? "dominada ✓" : "treino"}</div>
        </div>

        <div class="counterWrap">
          <div class="counter" aria-label="contador">
            <div style="text-align:center">
              <div class="counterVal" id="countVal">${count}</div>
              <div class="counterSub">ciclo ${cs} → 1</div>
            </div>
          </div>

          <div class="stack" style="flex:1; min-width: 180px">
            <div class="kana" id="kanaLine"></div>
            <div class="pt">${escapeHTML(p.pt)}</div>

            ${renderNewWords(p.newWords)}

            <div class="row">
              <button class="btn btn--muted" data-action="speak" data-rate="1">ouvir normal</button>
              <button class="btn btn--muted" data-action="speak" data-rate="0.8">ouvir lento</button>
              <button class="btn btn--ghost" data-action="toggleCall">${STATE._callMode ? "chamada: on" : "chamada: off"}</button>
            </div>
          </div>
        </div>

        <div class="sep"></div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" id="btnRepeat">repeti e entendi</button>
          <button class="btn btn--muted btn--full" data-action="skip">pular</button>
        </div>

        <div id="cycleSheet" class="sheet stack" style="display:none"></div>

        <div class="row">
          <button class="btn" data-action="toQuiz">ir pro quiz</button>
          <button class="btn" data-nav="#/home">sair</button>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">frases</div>
          <div class="small">top 10</div>
        </div>
        <div class="list">${list}</div>
      </section>
    </div>
  `;

  // render karaoke line
  setKanaLine("#kanaLine", p.jp, p.karaoke?.segments);

  // handlers
  $("#btnRepeat").addEventListener("click", () => {
    unlockAudio();
    const res = phraseRepeat(phraseId);
    // update counter immediately
    const pr2 = getPhraseProg(phraseId);
    const cs2 = effectiveCycleStart(phraseId);
    $("#countVal").textContent = String(clamp(pr2.count || cs2, 1, cs2));

    if (res.cycleDone) {
      show105xCycleSheet(phraseId, res.phraseMastered);
    }
  });

  // update session phraseIndex when phrase mastered or user decides to move
  // Cycle sheet provides next actions.
}

function show105xCycleSheet(phraseId, phraseMastered) {
  const pr = getPhraseProg(phraseId);
  const sheet = $("#cycleSheet");
  const s = STATE.habit.session;
  const mode = s.mode;

  // se dominou: avança automaticamente para próxima frase de treino
  let autoAdvance = false;
  if (phraseMastered) autoAdvance = true;

  // no modo exausto: consideramos "frase step" concluído após 1 ciclo finalizado (independente de dominar)
  // simplificação: no exausto, depois de qualquer ciclo concluído, passamos para quiz.
  const shouldGoQuiz = (mode === "exhaust");

  sheet.style.display = "block";

  if (phraseMastered) {
    sheet.innerHTML = `
      <div class="row row--between">
        <div class="badge">parabens 👏</div>
        <div class="badge">+10 🪙</div>
      </div>
      <div class="small">frase dominada ✓</div>
      <button class="btn btn--ok btn--full" data-action="nextPhrase">proxima frase 🔼</button>
    `;
  } else {
    sheet.innerHTML = `
      <div class="row row--between">
        <div class="badge">parabens 👏</div>
        <div class="badge">+1 🪙</div>
      </div>
      <div class="small">ciclo feito. bora mais um ou segue.</div>
      <div class="grid2">
        <button class="btn btn--ok btn--full" data-action="nextCycle">proximo ciclo 🔼</button>
        <button class="btn btn--muted btn--full" data-action="nextPhrase">proxima frase</button>
      </div>
    `;
  }

  // delegate within sheet
  sheet.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.action;

    if (act === "nextCycle") {
      sheet.style.display = "none";
      // nada a fazer: já está na mesma frase e count resetou
      return;
    }

    if (act === "nextPhrase") {
      sheet.style.display = "none";

      if (STATE.habit.session.inProgress) {
        // avança phrase step
        nextPhraseInSession();
        const nextId = STATE.habit.session.cursor.phraseId;
        if (!nextId) {
          // terminou frases do plano: vai para quiz
          nav("#/quiz");
          return;
        }
        nav("#/105x");
        return;
      }
      nav("#/quiz");
      return;
    }
  };

  // auto-advance cases
  if (shouldGoQuiz) {
    // exausto: após 1 ciclo feito, consideramos a etapa 105x "ok" e vamos pro quiz
    nextPhraseInSession(); // marca que a frase do plano foi feita
    setTimeout(() => nav("#/quiz"), 260);
    return;
  }

  if (autoAdvance) {
    nextPhraseInSession();
    setTimeout(() => nav("#/105x"), 260);
  }
}

function renderQuiz() {
  if (!STATE.habit.session.inProgress) {
    // se entrou direto, cria sessão leve
    ensureMission();
    STATE.habit.session.inProgress = true;
    STATE.habit.session.mode = getEffectiveMode();
    STATE.habit.session.plan = buildSessionPlan(STATE.habit.session.mode);
    STATE.habit.session.cursor.phraseQueue = pickPhraseQueue(STATE.habit.session.mode);
    STATE.habit.session.cursor.phraseIndex = 0;
    STATE.habit.session.cursor.quizQueue = pickQuizQueue(STATE.habit.session.mode);
    STATE.habit.session.cursor.quizIndex = 0;
    saveState();
  }

  const s = STATE.habit.session;
  const qid = s.cursor.quizQueue[s.cursor.quizIndex] || null;

  if (!qid) {
    // terminou quiz: avançar sessão e tentar encerrar
    s.cursor.quizIndex = s.cursor.quizQueue.length;
    saveState();
    endSessionIfDone();
    return nav("#/home");
  }

  const q = getQuestionById(qid);
  const total = s.cursor.quizQueue.length;
  const idx = s.cursor.quizIndex + 1;

  // prepare options shuffle? (simples: mantém ordem)
  const opts = q.options.map((o, i) => {
    const label = q.type === "translate" ? o.pt : (o.jp ? `${o.jp} • ${o.pt}` : o.pt);
    return `<button class="btn btn--full" data-action="answer" data-index="${i}">${escapeHTML(label)}</button>`;
  }).join("");

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">quiz</div>
          <div class="badge">${idx}/${total}</div>
        </div>

        <div class="row row--between">
          <div class="pill">tipo: ${escapeHTML(q.type)}</div>
          <div class="quizTimer" id="quizTimer">${STATE.settings.quizSeconds}s</div>
        </div>

        <div class="kana" id="quizKana"></div>
        <div class="pt">${escapeHTML(q.promptPt)}</div>

        <div class="row">
          <button class="btn btn--muted" data-action="speakQ" data-rate="1">ouvir normal</button>
          <button class="btn btn--muted" data-action="speakQ" data-rate="0.8">ouvir lento</button>
        </div>

        <div class="sep"></div>

        <div class="grid2" id="optGrid">${opts}</div>

        <div id="resultSheet" class="sheet stack" style="display:none"></div>

        <div class="row">
          <button class="btn" data-action="filters">filtros</button>
          <button class="btn" data-nav="#/home">sair</button>
        </div>
      </section>

      <section class="card stack" id="filterPanel" style="display:none">
        <div class="row row--between">
          <div class="badge">filtro</div>
          <button class="btn btn--muted" data-action="closeFilters">fechar</button>
        </div>
        <div class="grid2">
          <button class="btn btn--full" data-action="setFilter" data-type="all">todos</button>
          <button class="btn btn--full" data-action="setFilter" data-type="particle">particulas</button>
          <button class="btn btn--full" data-action="setFilter" data-type="vocab">vocab</button>
          <button class="btn btn--full" data-action="setFilter" data-type="translate">frases</button>
        </div>
        <div class="small">dica: filtro muda a fila da proxima rodada.</div>
      </section>
    </div>
  `;

  setKanaLine("#quizKana", q.promptJp, q.karaoke?.segments);

  // start timer
  startQuizTimer(qid);

  // delegate in quiz card
  const card = APP;
  card.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.nav) {
      nav(btn.dataset.nav);
      return;
    }

    const act = btn.dataset.action;
    if (act === "answer") {
      const idxChoice = Number(btn.dataset.index);
      stopQuizTimer();
      onQuizAnswer(qid, idxChoice, false);
      return;
    }

    if (act === "speakQ") {
      unlockAudio();
      const rate = Number(btn.dataset.rate || "1");
      speakWithKaraoke(q.promptJp, rate, "#quizKana", q.karaoke?.segments);
      return;
    }

    if (act === "filters") {
      $("#filterPanel").style.display = "block";
      return;
    }
    if (act === "closeFilters") {
      $("#filterPanel").style.display = "none";
      return;
    }
    if (act === "setFilter") {
      STATE._quizFilterType = btn.dataset.type;
      // reconstruir fila para o resto da sessão
      const mode = STATE.habit.session.mode;
      STATE.habit.session.cursor.quizQueue = pickQuizQueue(mode);
      STATE.habit.session.cursor.quizIndex = 0;
      saveState();
      toast("filtro aplicado");
      nav("#/quiz");
      return;
    }
  };

  // audio buttons
}

function startQuizTimer(questionId) {
  const totalMs = (STATE.settings.quizSeconds || 8) * 1000;
  const started = now();
  const timerEl = $("#quizTimer");

  quizTimerHandle = setInterval(() => {
    const elapsed = now() - started;
    const left = clamp(totalMs - elapsed, 0, totalMs);
    const s = Math.ceil(left / 1000);
    timerEl.textContent = `${s}s`;
    if (left <= 0) {
      stopQuizTimer();
      // timeout
      onQuizAnswer(questionId, -1, true, elapsed);
    }
  }, 100);
  startQuizTimer._startedAt = started;
  startQuizTimer._totalMs = totalMs;
}

function stopQuizTimer() {
  if (quizTimerHandle) {
    clearInterval(quizTimerHandle);
    quizTimerHandle = null;
  }
}

function onQuizAnswer(questionId, choiceIndex, timedOut, elapsedOverrideMs) {
  const startedAt = startQuizTimer._startedAt || now();
  const elapsed = elapsedOverrideMs ?? (now() - startedAt);

  const q = getQuestionById(questionId);
  const res = quizAnswer(questionId, choiceIndex, elapsed, timedOut);

  const sheet = $("#resultSheet");
  sheet.style.display = "block";

  const chosen = (choiceIndex >= 0) ? q.options[choiceIndex] : null;
  const correct = q.options[res.correctIndex];

  if (res.isCorrect) {
    sheet.innerHTML = `
      <div class="row row--between">
        <div class="badge">parabens 👏</div>
        <div class="badge">+${res.coinsGained} 🪙</div>
      </div>
      <div class="small">${escapeHTML(correct.feedbackPt || "isso.")}</div>
      <div class="small">${escapeHTML(q.rulePt || "")}</div>
      <button class="btn btn--ok btn--full" data-action="nextQ">proxima</button>
    `;
  } else {
    const tmsg = timedOut ? "foi no tempo. tudo bem." : "foi quase. bora de novo.";
    const chosenTxt = chosen ? (chosen.feedbackPt || "ok") : tmsg;
    sheet.innerHTML = `
      <div class="row row--between">
        <div class="badge">errou</div>
        <div class="badge">0 🪙</div>
      </div>
      <div class="small">${escapeHTML(tmsg)}</div>
      <div class="small">voce: ${escapeHTML(chosenTxt)}</div>
      <div class="small">certo: ${escapeHTML(correct.feedbackPt || "")}</div>
      <div class="small">${escapeHTML(q.rulePt || "")}</div>
      <button class="btn btn--muted btn--full" data-action="nextQ">proxima</button>
    `;
  }

  // next action
  sheet.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.action === "nextQ") {
      sheet.style.display = "none";
      nextQuizInSession();

      // se terminou quiz do plano, marca o step "quiz" como concluído e tenta encerrar
      if (STATE.habit.session.cursor.quizIndex >= STATE.habit.session.cursor.quizQueue.length) {
        // marca quiz step como feito: vamos avançar phraseIndex para "pular" step? (aqui tratamos por indexes)
        // a sessão usa phraseIndex e quizIndex independentes, então só tentamos encerrar
        saveState();
        if (endSessionIfDone()) return;

        // se quiz acabou mas ainda faltam frases: volta pro 105x
        if (STATE.habit.session.cursor.phraseIndex < STATE.habit.session.cursor.phraseQueue.length) {
          nav("#/105x");
          return;
        }
      }
      nav("#/quiz");
    }
  };
}

/* ---------- karaoke rendering ---------- */
function escapeHTML(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function segmentText(text, segments) {
  const t = String(text || "");
  const segs = Array.isArray(segments) && segments.length ? segments : null;

  if (!segs) {
    // fallback por caractere (inclui espaços como segmentos "fracos")
    return [...t].map(ch => ch);
  }
  return segs;
}

function setKanaLine(sel, text, segments) {
  const el = $(sel);
  if (!el) return;

  const segs = segmentText(text, segments);
  const html = segs.map((s, i) => {
    const safe = escapeHTML(s);
    return `<span class="kseg" data-idx="${i}">${safe}</span>`;
  }).join("");

  el.innerHTML = html;
  // set full text if segs not equal? (se segs são "por caractere", já bate)
}

function karaokePlay(sel, text, rate, segments) {
  const el = $(sel);
  if (!el) return;

  const segs = segmentText(text, segments);

  // reseta
  el.querySelectorAll(".kseg").forEach(sp => sp.classList.remove("on"));

  const dur = estimateDurationMs(text, rate);
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
    if (idx < n) {
      raf = requestAnimationFrame(tick);
    }
  };

  raf = requestAnimationFrame(tick);
  karaokePlay._kill = () => {
    if (raf) cancelAnimationFrame(raf);
    karaokePlay._kill = null;
  };
}

function speakWithKaraoke(text, rate, sel, segments) {
  const ok = ttsSpeak(
    text,
    rate,
    () => karaokePlay(sel, text, rate, segments),
    () => {} // end
  );
  if (!ok) {
    // sem TTS: ainda faz karaoke como leitura guiada
    karaokePlay(sel, text, rate, segments);
    toast("sem audio. mas da pra treinar lendo.");
  }
}

/* ---------- call and response (105x) ---------- */
function callAndResponseFlow(phraseText, rate, kanaSel, segments, onDone) {
  // toca audio -> mostra "agora voce" 2s -> done
  speakWithKaraoke(phraseText, rate, kanaSel, segments);

  // como speechSynthesis não dá end confiável em todos os casos,
  // usamos um tempo estimado antes do "agora voce"
  const t = estimateDurationMs(phraseText, rate);
  setTimeout(() => {
    showNowYouSheet(onDone);
  }, t + 80);
}

function showNowYouSheet(onDone) {
  const sheet = $("#cycleSheet") || $("#resultSheet");
  if (!sheet) return;

  sheet.style.display = "block";
  sheet.innerHTML = `
    <div class="row row--between">
      <div class="badge">agora voce</div>
      <div class="badge" id="nyCount">2</div>
    </div>
    <div class="small">repete em voz alta. do seu jeito.</div>
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

/* ---------- edit screen ---------- */
function renderEdit() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">cadastro</div>
          <button class="btn btn--muted" data-nav="#/home">voltar</button>
        </div>

        <div class="row">
          <button class="btn" data-action="tab" data-tab="phrases">frases</button>
          <button class="btn" data-action="tab" data-tab="quiz">quiz</button>
        </div>

        <div id="editBody"></div>
      </section>
    </div>
  `;

  const body = $("#editBody");
  const tab = STATE._editTab || "phrases";
  renderEditTab(tab);

  APP.onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;

    if (b.dataset.nav) return nav(b.dataset.nav);

    const act = b.dataset.action;
    if (act === "tab") {
      STATE._editTab = b.dataset.tab;
      saveState();
      renderEditTab(STATE._editTab);
      return;
    }

    if (act === "addPhrase") return openPhraseEditor(null);
    if (act === "editPhrase") return openPhraseEditor(b.dataset.id);

    if (act === "addQuiz") return openQuizEditor(null);
    if (act === "editQuiz") return openQuizEditor(b.dataset.id);
  };

  function renderEditTab(tabName) {
    if (tabName === "quiz") {
      body.innerHTML = `
        <div class="row row--between">
          <div class="small">perguntas: ${STATE.bank.quiz.length}</div>
          <button class="btn btn--ok" data-action="addQuiz">+ nova</button>
        </div>
        <div class="list">
          ${STATE.bank.quiz.slice(0, 30).map(q => `
            <div class="item">
              <div class="itemTop">
                <div>
                  <p class="itemTitle">${escapeHTML(q.promptJp)}</p>
                  <div class="itemMeta">${escapeHTML(q.promptPt)} • ${escapeHTML(q.type)}</div>
                </div>
                <button class="btn" data-action="editQuiz" data-id="${q.id}">editar</button>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="small">dica: valida kanji automaticamente.</div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="row row--between">
        <div class="small">frases: ${STATE.bank.phrases.length}</div>
        <button class="btn btn--ok" data-action="addPhrase">+ nova</button>
      </div>
      <div class="list">
        ${STATE.bank.phrases.slice(0, 30).map(p => {
          const pr = STATE.progress.phrase[p.id];
          const st = pr?.status === "mastered" ? "dominada" : "treino";
          return `
            <div class="item">
              <div class="itemTop">
                <div>
                  <p class="itemTitle">${escapeHTML(p.jp)}</p>
                  <div class="itemMeta">${escapeHTML(p.pt)} • ${st}</div>
                </div>
                <button class="btn" data-action="editPhrase" data-id="${p.id}">editar</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="small">dica: japones so em ひらがな / カタカナ.</div>
    `;
  }

  function openPhraseEditor(id) {
    const editing = id ? getPhraseById(id) : null;
    const local = {
      id: editing?.id || uid("ph"),
      jp: editing?.jp || "",
      pt: editing?.pt || "",
      newWordsText: (editing?.newWords || []).map(w => `${w.jp} = ${w.pt}`).join("\n")
    };

    body.innerHTML = `
      <div class="stack">
        <div class="row row--between">
          <div class="badge">${id ? "editar frase" : "nova frase"}</div>
          <button class="btn btn--muted" data-action="tab" data-tab="phrases">voltar</button>
        </div>

        <div>
          <div class="label">jp (kana)</div>
          <input class="input" id="phJp" value="${escapeHTML(local.jp)}" placeholder="ex: ここで まって" />
          <div class="small">sem kanji. so hiragana/katakana.</div>
        </div>

        <div>
          <div class="label">pt</div>
          <input class="input" id="phPt" value="${escapeHTML(local.pt)}" placeholder="ex: espera aqui" />
        </div>

        <div>
          <div class="label">palavras novas (opcional)</div>
          <textarea class="ta" id="phNW" placeholder="1 por linha: かな = portugues">${escapeHTML(local.newWordsText)}</textarea>
          <div class="small">ex: ここ = aqui</div>
        </div>

        <div id="phErr" class="error" style="display:none"></div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" id="phSave">salvar</button>
          <button class="btn btn--bad btn--full" id="phCancel">cancelar</button>
        </div>
      </div>
    `;

    $("#phCancel").onclick = () => renderEditTab("phrases");

    $("#phSave").onclick = () => {
      unlockAudio();

      const jp = $("#phJp").value.trim();
      const pt = $("#phPt").value.trim();
      const nwRaw = $("#phNW").value.trim();

      const err = validatePhraseForm(jp, pt, nwRaw);
      if (err) {
        const el = $("#phErr");
        el.style.display = "block";
        el.textContent = err;
        beep("tuk");
        return;
      }

      const newWords = parseNewWords(nwRaw);

      const obj = {
        id: local.id,
        jp,
        pt,
        newWords,
        tags: [],
        audio: { mode:"tts", voiceHint:"ja-JP", rateNormal:1, rateSlow:0.8, fileRef:null },
        karaoke: { mode:"approx", segments: [] },
        createdAt: editing?.createdAt || now(),
        updatedAt: now()
      };

      if (editing) {
        const idx = STATE.bank.phrases.findIndex(x => x.id === local.id);
        STATE.bank.phrases[idx] = obj;
      } else {
        STATE.bank.phrases.unshift(obj);
        // progress init
        STATE.progress.phrase[obj.id] = {
          status: "training",
          cycleStart: 14,
          count: 14,
          cyclesCompleted: 0,
          masteredAt: null,
          dueAt: 0,
          ease: 1,
          today: { reps: 0, skips: 0, lastAt: 0 },
          history: []
        };
      }

      saveState();
      toast("salvo ✅");
      beep("ding");
      renderEditTab("phrases");
    };
  }

  function openQuizEditor(id) {
    const editing = id ? getQuestionById(id) : null;

    const local = {
      id: editing?.id || uid("q"),
      type: editing?.type || "particle",
      promptJp: editing?.promptJp || "",
      promptPt: editing?.promptPt || "",
      rulePt: editing?.rulePt || "",
      // opções em linhas: jp|pt|certo(1/0)|feedback
      optionsText: (editing?.options || [
        {jp:"は",pt:"tema",isCorrect:true,feedbackPt:"isso. は marca o tema"},
        {jp:"が",pt:"sujeito",isCorrect:false,feedbackPt:"が destaca o sujeito"},
        {jp:"を",pt:"objeto",isCorrect:false,feedbackPt:"を marca objeto"},
        {jp:"に",pt:"destino/tempo",isCorrect:false,feedbackPt:"に e destino/tempo"}
      ]).map(o => `${o.jp}|${o.pt}|${o.isCorrect?1:0}|${o.feedbackPt}`).join("\n")
    };

    body.innerHTML = `
      <div class="stack">
        <div class="row row--between">
          <div class="badge">${id ? "editar quiz" : "novo quiz"}</div>
          <button class="btn btn--muted" data-action="tab" data-tab="quiz">voltar</button>
        </div>

        <div class="row">
          <div class="pill">tipo</div>
          <select class="input" id="qType" style="max-width:220px">
            <option value="particle" ${local.type==="particle"?"selected":""}>particle</option>
            <option value="vocab" ${local.type==="vocab"?"selected":""}>vocab</option>
            <option value="translate" ${local.type==="translate"?"selected":""}>translate</option>
          </select>
        </div>

        <div>
          <div class="label">enunciado jp (kana)</div>
          <input class="input" id="qJp" value="${escapeHTML(local.promptJp)}" placeholder="ex: こうじょうで はたらく" />
        </div>

        <div>
          <div class="label">contexto pt</div>
          <input class="input" id="qPt" value="${escapeHTML(local.promptPt)}" placeholder="ex: particula: marque lugar da acao" />
        </div>

        <div>
          <div class="label">regra (1 linha)</div>
          <input class="input" id="qRule" value="${escapeHTML(local.rulePt)}" placeholder="ex: で = onde acontece. に = destino." />
        </div>

        <div>
          <div class="label">opcoes (4 linhas)</div>
          <textarea class="ta" id="qOpts" placeholder="jp|pt|1/0|feedback">${escapeHTML(local.optionsText)}</textarea>
          <div class="small">se for translate: jp pode ficar vazio.</div>
        </div>

        <div id="qErr" class="error" style="display:none"></div>

        <div class="grid2">
          <button class="btn btn--ok btn--full" id="qSave">salvar</button>
          <button class="btn btn--bad btn--full" id="qCancel">cancelar</button>
        </div>
      </div>
    `;

    $("#qCancel").onclick = () => renderEditTab("quiz");

    $("#qSave").onclick = () => {
      unlockAudio();

      const type = $("#qType").value;
      const promptJp = $("#qJp").value.trim();
      const promptPt = $("#qPt").value.trim();
      const rulePt = $("#qRule").value.trim();
      const optsRaw = $("#qOpts").value.trim();

      const err = validateQuizForm(type, promptJp, promptPt, rulePt, optsRaw);
      if (err) {
        const el = $("#qErr");
        el.style.display = "block";
        el.textContent = err;
        beep("tuk");
        return;
      }

      const options = parseQuizOptions(optsRaw);

      const obj = {
        id: local.id,
        type,
        promptJp,
        promptPt,
        options,
        rulePt,
        tags: [],
        audio: { mode:"tts", rateNormal:1, rateSlow:0.8 },
        karaoke: { mode:"approx", segments: [] },
        createdAt: editing?.createdAt || now(),
        updatedAt: now()
      };

      if (editing) {
        const idx = STATE.bank.quiz.findIndex(x => x.id === local.id);
        STATE.bank.quiz[idx] = obj;
      } else {
        STATE.bank.quiz.unshift(obj);
        STATE.progress.quiz[obj.id] = {
          box: 1,
          dueAt: 0,
          lastAnswerAt: 0,
          streakCorrect: 0,
          stats: { seen: 0, correct: 0, wrong: 0, fast: 0 }
        };
      }

      saveState();
      toast("salvo ✅");
      beep("ding");
      renderEditTab("quiz");
    };
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

function validatePhraseForm(jp, pt, nwRaw) {
  if (!jp) return "jp vazio.";
  if (!pt) return "pt vazio.";
  if (!isValidJP(jp)) return "jp tem caractere proibido. use so hiragana/katakana.";
  if (nwRaw) {
    const lines = nwRaw.split("\n").map(s => s.trim()).filter(Boolean);
    for (const line of lines) {
      const parts = line.split("=").map(s => s.trim());
      if (parts.length < 2) return "palavras novas: use 'かな = portugues'.";
      const j = parts[0];
      if (!isValidJP(j)) return "palavras novas: jp tem caractere proibido.";
    }
  }
  return "";
}

function parseNewWords(nwRaw) {
  const out = [];
  if (!nwRaw) return out;
  const lines = nwRaw.split("\n").map(s => s.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split("=").map(s => s.trim());
    const jp = parts[0] || "";
    const pt = parts.slice(1).join("=").trim();
    if (!jp || !pt) continue;
    out.push({ jp, pt });
  }
  return out;
}

function validateQuizForm(type, promptJp, promptPt, rulePt, optsRaw) {
  if (!promptPt) return "contexto pt vazio.";
  if (type !== "translate") {
    if (!promptJp) return "enunciado jp vazio.";
    if (!isValidJP(promptJp)) return "enunciado jp tem caractere proibido.";
  } else {
    if (!promptJp) return "enunciado jp vazio.";
    if (!isValidJP(promptJp)) return "enunciado jp tem caractere proibido.";
  }

  const opts = parseQuizOptions(optsRaw);
  if (opts.length !== 4) return "precisa ter 4 opcoes.";
  const correctCount = opts.filter(o => o.isCorrect).length;
  if (correctCount !== 1) return "marque exatamente 1 opcao correta (|1|).";

  // validar jp das opções (se tiver)
  for (const o of opts) {
    if (o.jp && !isValidJP(o.jp)) return "opcao jp tem caractere proibido.";
    if (!o.pt) return "opcao pt vazio.";
    if (!o.feedbackPt) return "feedback vazio em alguma opcao.";
  }

  if (!rulePt) return "regra (1 linha) vazia.";
  return "";
}

function parseQuizOptions(optsRaw) {
  const lines = (optsRaw || "").split("\n").map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    const parts = line.split("|").map(s => s.trim());
    const jp = parts[0] ?? "";
    const pt = parts[1] ?? "";
    const isCorrect = String(parts[2] ?? "0") === "1";
    const feedbackPt = parts.slice(3).join("|").trim();
    out.push({ jp, pt, isCorrect, feedbackPt });
  }
  return out.slice(0, 4);
}

/* ---------- backup ---------- */
function renderBackup() {
  const exportObj = {
    exportedAt: now(),
    schemaVersion: STATE.app.schemaVersion,
    data: STATE
  };
  const exportText = JSON.stringify(exportObj, null, 2);

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">backup</div>
          <button class="btn btn--muted" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="label">exportar</div>
          <textarea class="ta" id="expTa">${escapeHTML(exportText)}</textarea>
          <div class="row">
            <button class="btn btn--ok" id="btnCopy">copiar</button>
            <button class="btn" id="btnDownload">baixar</button>
          </div>
          <div class="small">isso e seu backup completo.</div>
        </div>

        <div class="sheet stack">
          <div class="label">importar</div>
          <textarea class="ta" id="impTa" placeholder="cole aqui o json do backup"></textarea>
          <div class="grid2">
            <button class="btn btn--ok btn--full" id="btnImport">importar</button>
            <button class="btn btn--bad btn--full" id="btnReset">resetar tudo</button>
          </div>
          <div id="impErr" class="error" style="display:none"></div>
          <div class="small">importar valida japones sem kanji.</div>
        </div>
      </section>
    </div>
  `;

  APP.onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.nav) return nav(b.dataset.nav);
  };

  $("#btnCopy").onclick = async () => {
    unlockAudio();
    try {
      await navigator.clipboard.writeText($("#expTa").value);
      toast("copiado ✅");
      beep("ding");
    } catch {
      toast("nao deu pra copiar. selecione e copie manual.");
    }
  };

  $("#btnDownload").onclick = () => {
    unlockAudio();
    const blob = new Blob([$("#expTa").value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jp-auto-backup-v1.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("baixado ✅");
  };

  $("#btnImport").onclick = () => {
    unlockAudio();
    const raw = $("#impTa").value.trim();
    const el = $("#impErr");
    el.style.display = "none";
    el.textContent = "";

    const parsed = safeJSONParse(raw);
    if (!parsed || !parsed.data || parsed.schemaVersion !== 1) {
      el.style.display = "block";
      el.textContent = "json invalido ou versao diferente.";
      beep("tuk");
      return;
    }

    const data = parsed.data;
    const err = validateImportedData(data);
    if (err) {
      el.style.display = "block";
      el.textContent = err;
      beep("tuk");
      return;
    }

    STATE = data;
    saveState();
    refreshHUD();
    toast("importado ✅");
    beep("ding");
    nav("#/home");
  };

  $("#btnReset").onclick = () => {
    unlockAudio();
    if (!confirm("resetar tudo?")) return;
    STATE = defaultState();
    saveState();
    refreshHUD();
    toast("reset ok");
    nav("#/home");
  };
}

function validateImportedData(data) {
  // valida estrutura básica
  if (!data.app || data.app.schemaVersion !== 1) return "dados sem schemaVersion 1.";
  if (!data.bank || !Array.isArray(data.bank.phrases) || !Array.isArray(data.bank.quiz)) return "dados incompletos.";

  // valida JP: frases e quiz
  for (const p of data.bank.phrases) {
    if (!isValidJP(p.jp)) return "frase com jp invalido (tem caractere proibido).";
    if (Array.isArray(p.newWords)) {
      for (const w of p.newWords) {
        if (!isValidJP(w.jp)) return "palavra nova com jp invalido.";
      }
    }
  }
  for (const q of data.bank.quiz) {
    if (!isValidJP(q.promptJp)) return "quiz com jp invalido.";
    if (Array.isArray(q.options)) {
      for (const o of q.options) {
        if (o.jp && !isValidJP(o.jp)) return "opcao com jp invalido.";
      }
    }
  }
  return "";
}

/* ---------- settings ---------- */
function renderSettings() {
  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">configuracoes</div>
          <button class="btn btn--muted" data-nav="#/home">voltar</button>
        </div>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="label">som</div>
            <button class="btn" data-action="toggleSound">${STATE.prefs.audio.enabled ? "ligado" : "desligado"}</button>
          </div>
          <div class="row row--between">
            <div class="label">vibracao</div>
            <button class="btn" data-action="toggleVibe">${STATE.prefs.haptics.enabled ? "ligado" : "desligado"}</button>
          </div>
          <div class="row row--between">
            <div class="label">quiz (segundos)</div>
            <input class="input" id="setQuizSec" type="number" min="4" max="20" value="${STATE.settings.quizSeconds}" style="max-width:120px" />
          </div>
          <div class="row row--between">
            <div class="label">rodada do quiz</div>
            <input class="input" id="setQuizRound" type="number" min="5" max="40" value="${STATE.settings.quizRoundSize}" style="max-width:120px" />
          </div>

          <div class="row row--between">
            <div class="label">modo curto</div>
            <button class="btn" data-action="toggleShort">${STATE.settings.modeShort.enabled ? "ligado" : "desligado"}</button>
          </div>

          <div class="grid2">
            <button class="btn btn--ok btn--full" id="btnSaveSet">salvar</button>
            <button class="btn btn--muted btn--full" data-nav="#/home">ok</button>
          </div>

          <div class="small">dica: reduced motion segue o sistema (prefers-reduced-motion).</div>
        </div>

        <div class="sheet stack">
          <div class="label">streak</div>
          <div class="small">folga semanal: ${STATE.habit.streak.restAvailable ? "disponivel" : "usada"}</div>
          <div class="small">salvar streak (opcional): ${STATE.habit.streak.savers.priceCoins} 🪙</div>
          <button class="btn" data-action="saveStreak">salvar streak agora</button>
          <div class="small">so use se quiser. se nao, ta tudo certo.</div>
        </div>
      </section>
    </div>
  `;

  APP.onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.nav) return nav(b.dataset.nav);

    const act = b.dataset.action;
    if (act === "toggleSound") {
      unlockAudio();
      STATE.prefs.audio.enabled = !STATE.prefs.audio.enabled;
      saveState();
      refreshHUD();
      renderSettings();
      return;
    }
    if (act === "toggleVibe") {
      STATE.prefs.haptics.enabled = !STATE.prefs.haptics.enabled;
      saveState();
      refreshHUD();
      renderSettings();
      return;
    }
    if (act === "toggleShort") {
      STATE.settings.modeShort.enabled = !STATE.settings.modeShort.enabled;
      saveState();
      renderSettings();
      return;
    }
    if (act === "saveStreak") {
      // se hoje já é lastDayKey, nada
      const st = STATE.habit.streak;
      const dk = dayKey();
      if (st.lastDayKey === dk) {
        toast("streak ja ta ok hoje ✅");
        return;
      }
      const price = st.savers.priceCoins || 30;
      if ((STATE.stats.coins || 0) < price) {
        toast("sem moedas. ta tudo certo.");
        return;
      }
      STATE.stats.coins -= price;
      st.lastDayKey = dk;
      st.current = Math.max(1, st.current || 0);
      st.best = Math.max(st.best || 0, st.current);
      saveState();
      refreshHUD();
      toast("streak salvo ✅");
      beep("ding");
      return;
    }
  };

  $("#btnSaveSet").onclick = () => {
    unlockAudio();
    const sec = Number($("#setQuizSec").value || 8);
    const round = Number($("#setQuizRound").value || 10);
    STATE.settings.quizSeconds = clamp(sec, 4, 20);
    STATE.settings.quizRoundSize = clamp(round, 5, 40);
    saveState();
    refreshHUD();
    toast("salvo ✅");
    beep("ding");
  };
}

/* ---------- global click delegation ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  // nav quick
  if (btn.dataset.nav) {
    nav(btn.dataset.nav);
    return;
  }

  // settings icon
  if (btn.id === "btnSettings") {
    nav("#/settings");
    return;
  }

  // home fatigue ask
  if (btn.dataset.action === "fatigue") {
    unlockAudio();
    const v = btn.dataset.value;
    recordFatigue(v === "dead" ? "dead" : "ok");
    toast("ok ✅");
    beep("ding");
    // re-render home
    render();
    return;
  }

  // HUD toggles
  if (btn.id === "hudFatigue") {
    unlockAudio();
    toggleManualMode();
    return;
  }
  if (btn.id === "hudSound") {
    unlockAudio();
    STATE.prefs.audio.enabled = !STATE.prefs.audio.enabled;
    saveState();
    refreshHUD();
    beep("tap");
    return;
  }
  if (btn.id === "hudVibe") {
    STATE.prefs.haptics.enabled = !STATE.prefs.haptics.enabled;
    saveState();
    refreshHUD();
    toast(STATE.prefs.haptics.enabled ? "vibracao ligada" : "vibracao desligada");
    return;
  }

  // 105x actions (present in 105x view)
  if (btn.dataset.action === "speak") {
    unlockAudio();
    const pid = getActivePhraseId();
    const p = getPhraseById(pid);
    const rate = Number(btn.dataset.rate || "1");
    const callMode = !!STATE._callMode;

    if (callMode) {
      callAndResponseFlow(p.jp, rate, "#kanaLine", p.karaoke?.segments, () => {});
    } else {
      speakWithKaraoke(p.jp, rate, "#kanaLine", p.karaoke?.segments);
    }
    return;
  }
  if (btn.dataset.action === "toggleCall") {
    STATE._callMode = !STATE._callMode;
    saveState();
    toast(STATE._callMode ? "chamada on" : "chamada off");
    render();
    return;
  }
  if (btn.dataset.action === "skip") {
    unlockAudio();
    phraseSkip(getActivePhraseId());
    return;
  }
  if (btn.dataset.action === "gotoPhrase") {
    const id = btn.dataset.id;
    STATE.habit.session.cursor.phraseId = id;
    saveState();
    nav("#/105x");
    return;
  }
  if (btn.dataset.action === "toQuiz") {
    nav("#/quiz");
    return;
  }
});

/* ---------- hash change ---------- */
window.addEventListener("hashchange", render);

/* ---------- boot ---------- */
(function init() {
  // ensure fatigue trend computed
  recomputeFatigueTrend();
  ensureMission();
  refreshHUD();

  if (!location.hash) nav("#/home");
  render();
})();
