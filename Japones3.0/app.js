/* =========================================================
   NIHONGO321 v6
   Produto real com camada Premium, missões e cronograma
   ========================================================= */

const LS_KEY = "nihongo321_v6";

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

function sum1to(n) {
  return (n * (n + 1)) / 2;
}

function normalizeName(s) {
  return String(s || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function route() {
  const h = location.hash || "#/home";
  return h.startsWith("#/") ? h : "#/home";
}

function nav(hash) {
  location.hash = hash;
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

/* frase principal sem furigana */
function setKanaLine(el, rawText) {
  if (!el) return;
  el.textContent = jpStripFurigana(rawText || "");
}

/* =========================================================
   TOPICS / MISSIONS
   ========================================================= */
function topicPalette() {
  return ["warm", "sage", "accent"];
}

function pickTopicTone(i) {
  const tones = topicPalette();
  return tones[i % tones.length];
}

function slugifyTopicName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function seedTopics() {
  const names = [
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

  const t = now();
  return names.map((name, i) => ({
    id: name === "Frases aleatórias" ? "topic_default" : `topic_${slugifyTopicName(name)}`,
    name,
    tone: name === "Frases aleatórias" ? "accent" : pickTopicTone(i),
    createdAt: t,
    updatedAt: t
  }));
}

function topicIdMapFromTopics(topics) {
  const map = {};
  for (const t of topics) map[t.name] = t.id;
  return map;
}

/* =========================================================
   PREMIUM STRUCTURE
   ========================================================= */
function seedPremiumProgram() {
  return {
    blocks: [
      {
        id: "block_1",
        title: "Destravamento funcional",
        subtitle: "Parar de congelar e continuar a interação mesmo sem entender tudo",
        weeks: [1,2,3,4,5,6,7,8]
      },
      {
        id: "block_2",
        title: "Japonês de ambiente profissional",
        subtitle: "Entender melhor orientações, correções e situações mais exigentes",
        weeks: [9,10,11,12,13,14,15,16]
      },
      {
        id: "block_3",
        title: "Saída da bolha da fábrica",
        subtitle: "Ganhar linguagem para crescer, se posicionar e abrir portas",
        weeks: [17,18,19,20,21,22,23,24]
      }
    ],

    tracks: [
      {
        id: "track_listening",
        title: "Destravar a escuta",
        objective: "Entender intenção, comando e direção mesmo sem captar cada palavra"
      },
      {
        id: "track_response",
        title: "Responder sem travar",
        objective: "Ganhar respostas curtas e funcionais para manter a conversa viva"
      },
      {
        id: "track_supervisor",
        title: "Japonês de supervisor e instrução",
        objective: "Lidar melhor com orientação, correção e mudança de tarefa"
      },
      {
        id: "track_hr",
        title: "Japonês de RH e crescimento",
        objective: "Resolver vida profissional com mais autonomia"
      },
      {
        id: "track_contact",
        title: "Japonês de atendimento e contato humano",
        objective: "Sustentar interações com pessoas fora do padrão mecânico"
      },
      {
        id: "track_transition",
        title: "Japonês para entrevista e transição",
        objective: "Ter linguagem suficiente para buscar algo melhor"
      }
    ],

    weeks: [
      {
        number: 1,
        blockId: "block_1",
        trackId: "track_listening",
        title: "Sobreviver à fala rápida",
        mission: "Começar a captar intenção quando o japonês vier corrido",
        goal: "Reconhecer palavras-chave em instruções curtas e não congelar",
        result: "Você percebe melhor a direção da fala, mesmo sem entender tudo",
        focus: ["fala rápida", "palavras-chave", "intenção"],
        phraseIds: ["ph_001","ph_002","ph_003","ph_006"]
      },
      {
        number: 2,
        blockId: "block_1",
        trackId: "track_response",
        title: "Pedir repetição e confirmação",
        mission: "Continuar a interação quando a compreensão falhar",
        goal: "Usar frases para pedir repetição, confirmar e ganhar tempo",
        result: "Você cria ponte em vez de silêncio",
        focus: ["pedir repetição", "confirmar", "ganhar tempo"],
        phraseIds: ["ph_003","ph_004","ph_006","ph_007"]
      },
      {
        number: 3,
        blockId: "block_1",
        trackId: "track_response",
        title: "Responder curto e natural",
        mission: "Parar de soar travado nas respostas básicas",
        goal: "Ter respostas curtas que seguram a conversa",
        result: "Interações simples ficam mais fluidas",
        focus: ["respostas curtas", "ritmo", "naturalidade"],
        phraseIds: ["ph_001","ph_002","ph_007","ph_008"]
      },
      {
        number: 4,
        blockId: "block_1",
        trackId: "track_supervisor",
        title: "Ordens e comandos comuns",
        mission: "Entender melhor quando alguém orienta ou manda fazer algo",
        goal: "Captar verbos operacionais e direção de tarefa",
        result: "Você se perde menos no ambiente de trabalho",
        focus: ["ordens", "verbos", "tarefa"],
        phraseIds: ["ph_005","ph_006","ph_007","ph_008"]
      },
      {
        number: 5,
        blockId: "block_1",
        trackId: "track_supervisor",
        title: "Correção, erro e aviso",
        mission: "Entender quando algo precisa mudar",
        goal: "Captar sinais de correção, ajuste e alerta",
        result: "Você sofre menos com feedback rápido",
        focus: ["erro", "alerta", "ajuste"],
        phraseIds: ["ph_006","ph_007","ph_008","ph_031"]
      },
      {
        number: 6,
        blockId: "block_1",
        trackId: "track_supervisor",
        title: "Confirmar tarefa com segurança",
        mission: "Parar de seguir no escuro",
        goal: "Aprender a confirmar o que precisa fazer",
        result: "Você trabalha com mais clareza",
        focus: ["confirmação", "clareza", "tarefa"],
        phraseIds: ["ph_005","ph_006","ph_007","ph_030"]
      },
      {
        number: 7,
        blockId: "block_1",
        trackId: "track_listening",
        title: "Escuta de japonês comprimido",
        mission: "Acostumar o ouvido com a fala real",
        goal: "Reduzir o choque quando o nativo não fala devagar",
        result: "A fala real assusta menos",
        focus: ["fala real", "som comprimido", "ouvido"],
        phraseIds: ["ph_003","ph_004","ph_005","ph_030"]
      },
      {
        number: 8,
        blockId: "block_1",
        trackId: "track_listening",
        title: "Revisão de destravamento",
        mission: "Consolidar o primeiro grande passo",
        goal: "Fixar o que te ajuda a continuar sem congelar",
        result: "Você sente a primeira virada prática",
        focus: ["revisão", "consolidação", "continuidade"],
        phraseIds: ["ph_001","ph_003","ph_005","ph_006","ph_007","ph_008"]
      },
      {
        number: 9,
        blockId: "block_2",
        trackId: "track_supervisor",
        title: "Japonês de supervisor",
        mission: "Entender melhor quem orienta seu trabalho",
        goal: "Capacitar sua escuta para instruções mais objetivas",
        result: "Você acompanha melhor orientações no ambiente profissional",
        focus: ["supervisor", "orientação", "escuta"],
        phraseIds: ["ph_005","ph_006","ph_007","ph_030"]
      },
      {
        number: 10,
        blockId: "block_2",
        trackId: "track_supervisor",
        title: "Mudança de tarefa e prioridade",
        mission: "Lidar com redirecionamento sem travar",
        goal: "Entender quando a tarefa muda ou ganha urgência",
        result: "Você reage melhor a mudanças de direção",
        focus: ["mudança", "prioridade", "reação"],
        phraseIds: ["ph_005","ph_006","ph_007","ph_030"]
      },
      {
        number: 11,
        blockId: "block_2",
        trackId: "track_supervisor",
        title: "Qualidade, erro e correção",
        mission: "Entender melhor feedback técnico",
        goal: "Captar quando algo está errado e precisa ser corrigido",
        result: "Você reduz ruído em situações de correção",
        focus: ["qualidade", "erro", "correção"],
        phraseIds: ["ph_006","ph_008","ph_031"]
      },
      {
        number: 12,
        blockId: "block_2",
        trackId: "track_hr",
        title: "RH e vida funcional na empresa",
        mission: "Resolver temas importantes da vida profissional",
        goal: "Ganhar autonomia para falar sobre salário, faltas e ajustes",
        result: "Você depende menos de terceiros",
        focus: ["RH", "documentos", "autonomia"],
        phraseIds: ["ph_024","ph_030","ph_031","ph_032"]
      },
      {
        number: 13,
        blockId: "block_2",
        trackId: "track_hr",
        title: "Postura verbal profissional",
        mission: "Soar mais funcional e mais seguro",
        goal: "Melhorar o tom para ambientes mais exigentes",
        result: "Sua presença verbal fica mais forte",
        focus: ["tom", "postura", "segurança"],
        phraseIds: ["ph_001","ph_002","ph_024","ph_030"]
      },
      {
        number: 14,
        blockId: "block_2",
        trackId: "track_supervisor",
        title: "Treinamento e explicação de processo",
        mission: "Acompanhar melhor explicações mais longas",
        goal: "Segurar atenção e extrair o principal",
        result: "Você acompanha melhor instruções de processo",
        focus: ["treinamento", "processo", "atenção"],
        phraseIds: ["ph_005","ph_006","ph_007","ph_024"]
      },
      {
        number: 15,
        blockId: "block_2",
        trackId: "track_response",
        title: "Perguntas e respostas de rotina profissional",
        mission: "Sustentar mini diálogos no trabalho",
        goal: "Ganhar fluidez em trocas curtas e úteis",
        result: "A interação profissional fica menos travada",
        focus: ["diálogo", "troca curta", "rotina"],
        phraseIds: ["ph_001","ph_002","ph_005","ph_030"]
      },
      {
        number: 16,
        blockId: "block_2",
        trackId: "track_hr",
        title: "Revisão profissional",
        mission: "Consolidar o japonês de ambiente funcional",
        goal: "Fortalecer linguagem de trabalho e crescimento",
        result: "Você sente mais valor profissional no seu japonês",
        focus: ["revisão", "trabalho", "crescimento"],
        phraseIds: ["ph_024","ph_030","ph_031","ph_032"]
      },
      {
        number: 17,
        blockId: "block_3",
        trackId: "track_transition",
        title: "Apresentação pessoal melhor",
        mission: "Ganhar linguagem para se posicionar melhor",
        goal: "Treinar frases para se apresentar com mais clareza",
        result: "Você começa a sair do japonês puramente operacional",
        focus: ["apresentação", "clareza", "posição"],
        phraseIds: ["ph_001","ph_002","ph_030"]
      },
      {
        number: 18,
        blockId: "block_3",
        trackId: "track_transition",
        title: "Explicar experiência de trabalho",
        mission: "Transformar vivência em linguagem útil",
        goal: "Falar melhor sobre rotina e experiência",
        result: "Sua história começa a ganhar forma verbal",
        focus: ["experiência", "rotina", "trabalho"],
        phraseIds: ["ph_005","ph_024","ph_030"]
      },
      {
        number: 19,
        blockId: "block_3",
        trackId: "track_transition",
        title: "Entrevista básica",
        mission: "Ter chão para começar a buscar algo melhor",
        goal: "Responder perguntas comuns com mais segurança",
        result: "Você se sente mais preparado para novas portas",
        focus: ["entrevista", "resposta", "segurança"],
        phraseIds: ["ph_001","ph_002","ph_030","ph_031"]
      },
      {
        number: 20,
        blockId: "block_3",
        trackId: "track_contact",
        title: "Atendimento e contato humano",
        mission: "Lidar melhor com interações abertas",
        goal: "Entender e responder em contato mais humano",
        result: "Você sai do padrão puramente mecânico",
        focus: ["atendimento", "contato", "interação"],
        phraseIds: ["ph_009","ph_012","ph_013","ph_025"]
      },
      {
        number: 21,
        blockId: "block_3",
        trackId: "track_contact",
        title: "Resolver problemas verbalmente",
        mission: "Explicar, pedir ajuda e corrigir mal-entendidos",
        goal: "Ganhar ferramentas para situações imprevistas",
        result: "Você se vira melhor fora do script",
        focus: ["problema", "explicação", "ajuda"],
        phraseIds: ["ph_016","ph_018","ph_026","ph_028"]
      },
      {
        number: 22,
        blockId: "block_3",
        trackId: "track_listening",
        title: "Escuta profissional mais natural",
        mission: "Acompanhar fala menos mastigada",
        goal: "Aumentar resistência ao japonês real",
        result: "O ouvido fica mais preparado para ambientes melhores",
        focus: ["escuta natural", "resistência", "ambiente profissional"],
        phraseIds: ["ph_003","ph_004","ph_024","ph_025"]
      },
      {
        number: 23,
        blockId: "block_3",
        trackId: "track_response",
        title: "Segurança verbal",
        mission: "Responder com menos medo",
        goal: "Sentir mais chão ao falar com nativos",
        result: "Você transmite mais presença e menos congelamento",
        focus: ["segurança", "resposta", "presença"],
        phraseIds: ["ph_001","ph_002","ph_003","ph_007"]
      },
      {
        number: 24,
        blockId: "block_3",
        trackId: "track_transition",
        title: "Revisão e plano de avanço",
        mission: "Fechar a primeira grande travessia",
        goal: "Consolidar o caminho do japonês de sobrevivência ao japonês que abre portas",
        result: "Você enxerga o Premium como jornada real de crescimento",
        focus: ["revisão", "avanço", "transição"],
        phraseIds: ["ph_024","ph_025","ph_030","ph_031","ph_032"]
      }
    ]
  };
}

/* =========================================================
   CONTENT
   ========================================================= */
function seedPhrases(topicIds) {
  const t = now();

  return [
    { id:"ph_001", jp:"おはようございます。", pt:"bom dia.", topicId:topicIds["Frases aleatórias"], priority:5, useHint:"cumprimento básico do dia", comfortHint:"Comece leve. Só ouvir já conta.", newWords:[{jp:"おはようございます", pt:"bom dia"}], createdAt:t, updatedAt:t },
    { id:"ph_002", jp:"お疲{つか}れ様{さま}です。", pt:"bom trabalho / obrigado pelo esforço.", topicId:topicIds["Frases aleatórias"], priority:5, useHint:"muito útil no trabalho", comfortHint:"Essa frase ajuda você a entrar melhor no ritmo social do Japão.", newWords:[{jp:"疲{つか}れ", pt:"cansaço / esforço"},{jp:"様{さま}", pt:"forma respeitosa"}], createdAt:t, updatedAt:t },
    { id:"ph_003", jp:"もう一度{いちど} お願{ねが}いします。", pt:"mais uma vez, por favor.", topicId:topicIds["Frases aleatórias"], priority:5, useHint:"quando você não entendeu", comfortHint:"Pedir repetição é inteligência, não fraqueza.", newWords:[{jp:"一度{いちど}", pt:"uma vez"},{jp:"お願{ねが}いします", pt:"por favor"}], createdAt:t, updatedAt:t },
    { id:"ph_004", jp:"ゆっくり お願{ねが}いします。", pt:"devagar, por favor.", topicId:topicIds["Frases aleatórias"], priority:5, useHint:"quando falam rápido demais", comfortHint:"Uma das frases mais valiosas para continuar a interação.", newWords:[{jp:"ゆっくり", pt:"devagar"},{jp:"お願{ねが}いします", pt:"por favor"}], createdAt:t, updatedAt:t },
    { id:"ph_005", jp:"今日{きょう}の 持{も}ち場{ば}は どこですか。", pt:"qual é o meu posto de hoje?", topicId:topicIds["Na fábrica"], priority:5, useHint:"para começar o turno", comfortHint:"Ótima frase para iniciar o dia com clareza.", newWords:[{jp:"今日{きょう}", pt:"hoje"},{jp:"持{も}ち場{ば}", pt:"posto de trabalho"}], createdAt:t, updatedAt:t },
    { id:"ph_006", jp:"この作業{さぎょう}を もう一度{いちど} 教{おし}えて ください。", pt:"por favor, me ensine esta tarefa mais uma vez.", topicId:topicIds["Na fábrica"], priority:5, useHint:"quando a tarefa não ficou clara", comfortHint:"Não precisa adivinhar. Peça de novo com clareza.", newWords:[{jp:"作業{さぎょう}", pt:"tarefa"},{jp:"教{おし}えて", pt:"ensinar / explicar"}], createdAt:t, updatedAt:t },
    { id:"ph_007", jp:"次{つぎ}は 何{なに}を すれば いいですか。", pt:"o que eu devo fazer em seguida?", topicId:topicIds["Na fábrica"], priority:5, useHint:"quando terminou a etapa atual", comfortHint:"Isso ajuda você a manter o fluxo sem ficar perdido.", newWords:[{jp:"次{つぎ}", pt:"seguinte / próximo"},{jp:"何{なに}", pt:"o que"}], createdAt:t, updatedAt:t },
    { id:"ph_008", jp:"機械{きかい}が 止{と}まりました。", pt:"a máquina parou.", topicId:topicIds["Na fábrica"], priority:5, useHint:"situação urgente na linha", comfortHint:"Frase curta e muito importante.", newWords:[{jp:"機械{きかい}", pt:"máquina"},{jp:"止{と}まりました", pt:"parou"}], createdAt:t, updatedAt:t },
    { id:"ph_009", jp:"これは いくらですか。", pt:"quanto custa isto?", topicId:topicIds["No mercado"], priority:5, useHint:"compras do dia a dia", comfortHint:"Frase simples, clara e muito útil.", newWords:[{jp:"いくら", pt:"quanto"}], createdAt:t, updatedAt:t },
    { id:"ph_010", jp:"賞味期限{しょうみきげん}は いつですか。", pt:"qual é a data de validade?", topicId:topicIds["No mercado"], priority:5, useHint:"na hora de escolher produto", comfortHint:"Boa para compras mais seguras.", newWords:[{jp:"賞味期限{しょうみきげん}", pt:"validade"}], createdAt:t, updatedAt:t },
    { id:"ph_011", jp:"袋{ふくろ}は いりません。", pt:"não preciso de sacola.", topicId:topicIds["No mercado"], priority:4, useHint:"caixa e autoatendimento", comfortHint:"Frase rápida para o caixa.", newWords:[{jp:"袋{ふくろ}", pt:"sacola"}], createdAt:t, updatedAt:t },
    { id:"ph_012", jp:"温{あたた}めて ください。", pt:"por favor, aqueça isto.", topicId:topicIds["No konbini"], priority:5, useHint:"marmita ou lanche", comfortHint:"Muito útil para o dia a dia corrido.", newWords:[{jp:"温{あたた}めて", pt:"aquecer"}], createdAt:t, updatedAt:t },
    { id:"ph_013", jp:"レシートを ください。", pt:"por favor, me dê o recibo.", topicId:topicIds["No konbini"], priority:4, useHint:"caixa", comfortHint:"Frase curta que resolve rápido.", newWords:[{jp:"レシート", pt:"recibo"}], createdAt:t, updatedAt:t },
    { id:"ph_014", jp:"住所変更{じゅうしょへんこう}の 手続{てつづ}きは どこですか。", pt:"onde faço o procedimento de mudança de endereço?", topicId:topicIds["Na prefeitura"], priority:5, useHint:"mudança de endereço", comfortHint:"Frase de sobrevivência burocrática.", newWords:[{jp:"住所変更{じゅうしょへんこう}", pt:"mudança de endereço"},{jp:"手続{てつづ}き", pt:"procedimento"}], createdAt:t, updatedAt:t },
    { id:"ph_015", jp:"必要{ひつよう}な ものは 何{なに}ですか。", pt:"o que é necessário trazer?", topicId:topicIds["Na prefeitura"], priority:5, useHint:"antes de iniciar procedimento", comfortHint:"Evita viagem perdida.", newWords:[{jp:"必要{ひつよう}", pt:"necessário"},{jp:"何{なに}", pt:"o que"}], createdAt:t, updatedAt:t },
    { id:"ph_016", jp:"この荷物{にもつ}を 送{おく}りたいです。", pt:"quero enviar esta encomenda.", topicId:topicIds["No correio"], priority:5, useHint:"envio no balcão", comfortHint:"Boa para começar o atendimento com clareza.", newWords:[{jp:"荷物{にもつ}", pt:"encomenda"},{jp:"送{おく}りたい", pt:"quero enviar"}], createdAt:t, updatedAt:t },
    { id:"ph_017", jp:"送料{そうりょう}は いくらですか。", pt:"quanto custa o frete?", topicId:topicIds["No correio"], priority:5, useHint:"antes de fechar envio", comfortHint:"Ajuda a decidir rápido.", newWords:[{jp:"送料{そうりょう}", pt:"frete"}], createdAt:t, updatedAt:t },
    { id:"ph_018", jp:"予約{よやく}を したいです。", pt:"quero marcar uma consulta.", topicId:topicIds["No hospital"], priority:5, useHint:"marcação inicial", comfortHint:"Essencial para saúde.", newWords:[{jp:"予約{よやく}", pt:"agendamento"}], createdAt:t, updatedAt:t },
    { id:"ph_019", jp:"昨日{きのう}から 熱{ねつ}が あります。", pt:"estou com febre desde ontem.", topicId:topicIds["No hospital"], priority:5, useHint:"explicar sintoma", comfortHint:"Fale isso com calma. É uma frase importante.", newWords:[{jp:"昨日{きのう}", pt:"ontem"},{jp:"熱{ねつ}", pt:"febre"}], createdAt:t, updatedAt:t },
    { id:"ph_020", jp:"風邪薬{かぜぐすり}は ありますか。", pt:"vocês têm remédio para resfriado?", topicId:topicIds["Na farmácia"], priority:5, useHint:"compra rápida na farmácia", comfortHint:"Muito útil em dias difíceis.", newWords:[{jp:"風邪薬{かぜぐすり}", pt:"remédio para resfriado"}], createdAt:t, updatedAt:t },
    { id:"ph_021", jp:"口座{こうざ}を 作{つく}りたいです。", pt:"quero abrir uma conta bancária.", topicId:topicIds["No banco"], priority:4, useHint:"atendimento bancário", comfortHint:"Boa frase base para o banco.", newWords:[{jp:"口座{こうざ}", pt:"conta bancária"}], createdAt:t, updatedAt:t },
    { id:"ph_022", jp:"この電車{でんしゃ}は 福井{ふくい}に 行{い}きますか。", pt:"este trem vai para Fukui?", topicId:topicIds["No trem / estação"], priority:5, useHint:"deslocamento diário", comfortHint:"Ótima frase para não se perder.", newWords:[{jp:"電車{でんしゃ}", pt:"trem"},{jp:"行{い}きますか", pt:"vai?"}], createdAt:t, updatedAt:t },
    { id:"ph_023", jp:"搭乗口{とうじょうぐち}は どこですか。", pt:"onde fica o portão de embarque?", topicId:topicIds["No aeroporto"], priority:4, useHint:"embarque", comfortHint:"Curta e objetiva.", newWords:[{jp:"搭乗口{とうじょうぐち}", pt:"portão de embarque"}], createdAt:t, updatedAt:t },
    { id:"ph_024", jp:"給料明細{きゅうりょうめいさい}を 確認{かくにん}したいです。", pt:"quero conferir meu holerite.", topicId:topicIds["No RH"], priority:4, useHint:"falar com RH", comfortHint:"Boa para resolver sua vida profissional.", newWords:[{jp:"給料明細{きゅうりょうめいさい}", pt:"holerite"},{jp:"確認{かくにん}", pt:"conferir"}], createdAt:t, updatedAt:t },
    { id:"ph_025", jp:"30GBの 固定{こてい}プランは ありますか。", pt:"tem um plano fixo de 30 GB?", topicId:topicIds["No celular / internet"], priority:5, useHint:"loja de celular", comfortHint:"Muito útil para contrato de plano.", newWords:[{jp:"固定{こてい}", pt:"fixo"},{jp:"プラン", pt:"plano"}], createdAt:t, updatedAt:t },
    { id:"ph_026", jp:"修理{しゅうり}を お願{ねが}いしたいです。", pt:"quero solicitar um reparo.", topicId:topicIds["Em casa / apartamento"], priority:4, useHint:"problema no apartamento", comfortHint:"Boa para falar com a administração.", newWords:[{jp:"修理{しゅうり}", pt:"reparo"},{jp:"お願{ねが}いしたい", pt:"quero solicitar"}], createdAt:t, updatedAt:t },
    { id:"ph_027", jp:"燃{も}える ごみの 日{ひ}は いつですか。", pt:"quando é o dia do lixo queimável?", topicId:topicIds["Lixo e reciclagem"], priority:3, useHint:"vida no apartamento", comfortHint:"Ajuda muito no começo da vida no Japão.", newWords:[{jp:"燃{も}える ごみ", pt:"lixo queimável"}], createdAt:t, updatedAt:t },
    { id:"ph_028", jp:"助{たす}けて ください。", pt:"por favor, me ajude.", topicId:topicIds["Emergência"], priority:5, useHint:"situação urgente", comfortHint:"Frase curta e muito importante.", newWords:[{jp:"助{たす}けて", pt:"me ajude"}], createdAt:t, updatedAt:t },
    { id:"ph_029", jp:"救急車{きゅうきゅうしゃ}を 呼{よ}んで ください。", pt:"por favor, chame uma ambulância.", topicId:topicIds["Emergência"], priority:5, useHint:"emergência real", comfortHint:"Vale muito a pena revisar esta frase.", newWords:[{jp:"救急車{きゅうきゅうしゃ}", pt:"ambulância"}], createdAt:t, updatedAt:t },
    { id:"ph_030", jp:"少{すこ}し 遅{おく}れます。", pt:"vou me atrasar um pouco.", topicId:topicIds["No trabalho"], priority:5, useHint:"avisar no trabalho", comfortHint:"Muito útil na vida real.", newWords:[{jp:"少{すこ}し", pt:"um pouco"},{jp:"遅{おく}れます", pt:"vou me atrasar"}], createdAt:t, updatedAt:t },
    { id:"ph_031", jp:"体調{たいちょう}が 悪{わる}いです。", pt:"não estou me sentindo bem.", topicId:topicIds["No trabalho"], priority:5, useHint:"quando o corpo não está bem", comfortHint:"Frase importante para dias difíceis.", newWords:[{jp:"体調{たいちょう}", pt:"condição física"},{jp:"悪{わる}い", pt:"ruim"}], createdAt:t, updatedAt:t },
    { id:"ph_032", jp:"今日は 休{やす}ませて ください。", pt:"por favor, deixe-me faltar hoje.", topicId:topicIds["No trabalho"], priority:5, useHint:"quando precisa descansar", comfortHint:"Frase sensível e importante.", newWords:[{jp:"休{やす}ませて", pt:"deixe faltar / descansar"}], createdAt:t, updatedAt:t }
  ];
}

/* =========================================================
   STATE
   ========================================================= */
function defaultState() {
  const t = now();
  const topics = seedTopics();
  const topicIds = topicIdMapFromTopics(topics);
  const phrases = seedPhrases(topicIds);
  const premium = seedPremiumProgram();

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

  const premiumWeekProgress = {};
  for (const w of premium.weeks) {
    premiumWeekProgress[w.number] = {
      status: "locked",
      startedAt: null,
      finishedAt: null
    };
  }
  premiumWeekProgress[1].status = "active";

  return {
    app: {
      schemaVersion: 6,
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
    premium,
    progress,
    premiumWeekProgress,
    session: {
      currentPhraseId: phrases[0]?.id || null,
      currentContextId: "ALL",
      currentPremiumWeek: 1,
      callMode: false,
      callBusy: false,
      study: {
        day: todayKey(),
        totalMs: 0,
        running: false,
        runStartAt: null
      }
    },
    ui: {
      lastToast: ""
    }
  };
}

function migrateState(st) {
  if (!st?.app) return defaultState();

  const fresh = defaultState();

  st.app.schemaVersion = 6;
  st.prefs ||= fresh.prefs;
  st.stats ||= fresh.stats;
  st.habit ||= fresh.habit;
  st.habit.days ||= {};
  st.bank ||= fresh.bank;
  st.bank.topics ||= fresh.bank.topics;
  st.bank.phrases ||= fresh.bank.phrases;
  st.progress ||= {};
  st.session ||= fresh.session;
  st.ui ||= { lastToast: "" };
  st.premium ||= fresh.premium;
  st.premiumWeekProgress ||= fresh.premiumWeekProgress;

  st.prefs.audio ||= fresh.prefs.audio;
  st.prefs.haptics ||= fresh.prefs.haptics;
  st.prefs.tiredMode ??= false;
  st.prefs.onboardingDone ??= false;

  st.stats.coins ||= 0;
  st.stats.bestCoins ||= 0;
  st.stats.cyclesDone ||= 0;
  st.stats.phrasesMastered ||= 0;
  st.stats.listens ||= 0;
  st.stats.calls ||= 0;

  st.session.currentContextId ||= "ALL";
  st.session.currentPremiumWeek ||= 1;
  st.session.callMode ||= false;
  st.session.callBusy ||= false;
  st.session.study ||= fresh.session.study;

  let def = st.bank.topics.find(t => t.id === "topic_default");
  if (!def) st.bank.topics.unshift(fresh.bank.topics[0]);

  if (!st.bank.phrases.length) st.bank.phrases = fresh.bank.phrases;

  for (const p of st.bank.phrases) {
    p.priority ||= 3;
    p.useHint ||= "";
    p.comfortHint ||= "";
    p.newWords ||= [];
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

  for (const w of st.premium.weeks) {
    if (!st.premiumWeekProgress[w.number]) {
      st.premiumWeekProgress[w.number] = {
        status: w.number === 1 ? "active" : "locked",
        startedAt: null,
        finishedAt: null
      };
    }
  }

  return st;
}

function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const parsed = safeJSONParse(raw);
    if (parsed?.app) return migrateState(parsed);
  }

  const legacyKeys = ["nihongo321_v6_beta", "nihongo321_v42", "nihongo321_v4", "jp_105x_v3"];
  for (const key of legacyKeys) {
    const legacyRaw = localStorage.getItem(key);
    if (!legacyRaw) continue;
    const parsed = safeJSONParse(legacyRaw);
    if (parsed?.app) return migrateState(parsed);
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
  if (!ok) toast("sem áudio. mas você ainda pode treinar lendo.");
}

function callAndResponse(phrase, rate = 1.0, onDone) {
  if (!phrase) return;
  if (callFlowState.busy) {
    toast("espera esse ciclo terminar ✅");
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
    toast("sem áudio. mas você ainda pode treinar lendo.");
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
    <div class="small">Repita em voz alta. Sem pressa.</div>
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
function getTopic(id) {
  return (STATE.bank.topics || []).find(t => t.id === id) || null;
}

function topicName(id) {
  return getTopic(id)?.name || "Sem contexto";
}

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

function getWeek(number) {
  return STATE.premium.weeks.find(w => w.number === number) || null;
}

function getBlock(id) {
  return STATE.premium.blocks.find(b => b.id === id) || null;
}

function getTrack(id) {
  return STATE.premium.tracks.find(t => t.id === id) || null;
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

function getCurrentPremiumWeek() {
  return getWeek(STATE.session.currentPremiumWeek) || getWeek(1);
}

function getPremiumCompletionPct() {
  const total = STATE.premium.weeks.length;
  const done = Object.values(STATE.premiumWeekProgress).filter(x => x.status === "done").length;
  return total ? done / total : 0;
}

function getCurrentPremiumObjective() {
  const week = getCurrentPremiumWeek();
  if (!week) return "Avançar com japonês útil";
  return week.goal;
}

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

function unlockNextPremiumWeek(currentNumber) {
  const current = STATE.premiumWeekProgress[currentNumber];
  if (current) {
    current.status = "done";
    current.finishedAt = current.finishedAt || now();
  }
  const next = STATE.premiumWeekProgress[currentNumber + 1];
  if (next && next.status === "locked") {
    next.status = "active";
    next.startedAt = next.startedAt || now();
  }
  saveState();
}

/* =========================================================
   FEEDBACK
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
   COPY / PRODUCT MESSAGES
   ========================================================= */
function getContextMissionLabel(name) {
  const map = {
    "Na fábrica": "Sobreviver melhor no turno",
    "No mercado": "Comprar com mais segurança",
    "No konbini": "Resolver rápido no caixa",
    "Na prefeitura": "Resolver documentos sem travar",
    "No correio": "Enviar sem confusão",
    "No hospital": "Falar sobre saúde com mais segurança",
    "Na farmácia": "Comprar remédio com mais clareza",
    "No banco": "Resolver sua vida financeira",
    "No trem / estação": "Se deslocar sem se perder",
    "No aeroporto": "Viajar com mais calma",
    "No RH": "Falar com o RH com mais segurança",
    "No celular / internet": "Resolver plano e conexão",
    "Em casa / apartamento": "Lidar melhor com moradia",
    "Lixo e reciclagem": "Entender a rotina do prédio",
    "Emergência": "Ter frases vitais à mão",
    "No trabalho": "Se comunicar melhor no dia a dia"
  };
  return map[name] || "Treino prático para o Japão real";
}

function getTrainEncouragement(phrase, pr) {
  if (pr.status === "mastered") return "Essa frase já ficou forte. Agora é só manter viva.";
  if (pr.isUrgent) return "Boa escolha. Essa pode realmente te ajudar hoje.";
  if (pr.isDifficult) return "Vai sem pressa. Frase difícil melhora com repetição calma.";
  if ((phrase.priority || 3) >= 5) return "Essa é daquelas frases que fazem diferença no Japão real.";
  return phrase.comfortHint || "Sem pressão. Só continuar já é progresso.";
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

function getHomeMessage(stats) {
  if (!STATE.prefs.onboardingDone) return "Aprenda japonês útil sem se perder.";
  if (stats.todayMin >= 10) return "Hoje você já fez sua parte. Se quiser, só mantenha o contato.";
  if (stats.todayMin >= 3) return "Você já começou hoje. Mais um pouco e pronto.";
  return "Hoje, poucos minutos já podem ajudar muito no Japão real.";
}

function getHomeSubMessage(stats) {
  if (stats.urgent > 0) return "Você tem frases marcadas para hoje. Vale revisar antes do trabalho ou da saída.";
  if (stats.difficult > 0) return "Pode ser um bom dia para treinar o que ainda trava.";
  return "Abra, ouça, leia, repita e siga. Sem teoria pesada e sem menu confuso.";
}

/* =========================================================
   TRAIN ENGINE
   ========================================================= */
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

  const week = getCurrentPremiumWeek();
  if (week && week.phraseIds.includes(p.id) && pr.status === "mastered") {
    const allDone = week.phraseIds.every(id => getProg(id)?.status === "mastered");
    if (allDone) unlockNextPremiumWeek(week.number);
  }

  showCycleSheet(masteredNow);
  renderTrainBodyOnly();
}

function showCycleSheet(masteredNow) {
  const sheet = $("#cycleSheet");
  if (!sheet) return;
  sheet.style.display = "block";
  sheet.innerHTML = `
    <div class="stamp">parabéns 👏</div>
    <div class="small">
      ${masteredNow ? "Você dominou uma frase que pode fazer diferença no seu dia." : "Mais um ciclo fechado. Você está fortalecendo algo útil de verdade."}
    </div>
    <div class="row">
      <button class="btn btn--ok btn--full" data-action="nextPhrase">continuar ▶</button>
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
      ${list.map(w => {
        const jpHtml = jpHasFurigana(w.jp)
          ? jpToRubyHTML(w.jp)
          : escapeHTML(w.jp);

        return `<div class="small"><b>${jpHtml}</b> = ${escapeHTML(w.pt)}</div>`;
      }).join("")}
    </div>
  `;
}

function pills(selected = "ALL") {
  const primary = [
    { id: "URGENT", label: "para hoje" },
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
        ${pr.isUrgent ? "⚑ para hoje" : "⚐ para hoje"}
      </button>
    </div>
  `;
}

/* =========================================================
   RENDERS
   ========================================================= */
function render() {
  refreshHUD();

  const r = route();
  if (r === "#/home") return renderHome();
  if (r === "#/train") return renderTrain();
  if (r === "#/contexts") return renderContexts();
  if (r === "#/premium") return renderPremiumHub();
  if (r.startsWith("#/premium-week/")) return renderPremiumWeek(Number(r.split("/").pop()));
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
  const currentWeek = getCurrentPremiumWeek();
  const currentWeekProgress = STATE.premiumWeekProgress[currentWeek.number];

  APP.innerHTML = `
    <div class="stack">
      ${!STATE.prefs.onboardingDone ? `
        <section class="card homeHero stack">
          <div class="badge">comece sem pressão</div>
          <h2 class="h1">Aprenda japonês útil de forma leve.</h2>
          <p class="p">O NIHONGO321 foi feito para brasileiros no Japão que precisam de frases reais, rápidas e claras para a vida do dia a dia.</p>
          <div class="grid2">
            <button class="bigBtn" data-action="finishOnboarding">entendi, vamos começar</button>
            <button class="btn btn--ghost btn--full" data-nav="#/premium">ver plano premium</button>
          </div>
        </section>
      ` : ""}

      <section class="card homeHero stack">
        <div class="badge">hoje</div>
        <h2 class="h1">${escapeHTML(getHomeMessage(stats))}</h2>
        <p class="p">${escapeHTML(getHomeSubMessage(stats))}</p>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">objetivo do dia</div>
            <div class="badge">${stats.todayMin} min hoje</div>
          </div>
          <div class="itemTitle">${escapeHTML(getCurrentPremiumObjective())}</div>
          <div class="small">Semana ${currentWeek.number} • ${escapeHTML(currentWeek.title)}</div>
          <div class="row">
            <button class="btn btn--ok" data-nav="#/premium-week/${currentWeek.number}">
              abrir semana atual
            </button>
            <button class="btn btn--ghost" data-nav="#/premium">ver programa</button>
          </div>
        </div>

        <button class="bigBtn" data-action="startRecommendedTrain">COMEÇAR TREINO</button>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">missão recomendada</div>
            <div class="badge">${recommendedContext ? escapeHTML(recommendedContext.name) : "geral"}</div>
          </div>

          ${recommendedContext ? `<div class="small">${escapeHTML(getContextMissionLabel(recommendedContext.name))}</div>` : ""}

          ${recommendedPhrase ? `
            <div class="item">
              <p class="itemTitle">${escapeHTML(jpStripFurigana(recommendedPhrase.jp))}</p>
              <div class="itemMeta">${escapeHTML(recommendedPhrase.pt)}</div>
              ${recommendedPhrase.useHint ? `<div class="small" style="margin-top:8px">útil para: ${escapeHTML(recommendedPhrase.useHint)}</div>` : ""}
            </div>
          ` : `
            <div class="small">Seu próximo treino vai aparecer aqui.</div>
          `}

          <div class="row">
            <button class="btn btn--ghost" data-action="startRecommendedTrain">treinar agora</button>
            <button class="btn" data-nav="#/contexts">escolher missão</button>
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">premium</div>
          <button class="btn btn--ghost" data-nav="#/premium">abrir programa</button>
        </div>

        <div class="item">
          <p class="itemTitle">Do japonês de sobrevivência ao japonês que abre portas</p>
          <div class="itemMeta">${escapeHTML(currentWeek.mission)}</div>

          <div class="pWrap">
            <div class="pBar"><div class="pFill" style="transform:scaleX(${getPremiumCompletionPct()})"></div></div>
            <div class="pTxt">${Math.round(getPremiumCompletionPct() * 100)}%</div>
          </div>

          <div class="small" style="margin-top:8px">
            status atual: ${currentWeekProgress.status === "done" ? "semana concluída" : currentWeekProgress.status === "active" ? "em andamento" : "bloqueada"}
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="row row--between">
          <div class="badge">atalhos úteis</div>
          <button class="btn btn--ghost" data-nav="#/progress">ver progresso</button>
        </div>

        ${pills("ALL")}

        <div class="grid2">
          <button class="btn btn--full" data-action="openContext" data-id="URGENT">frases para hoje</button>
          <button class="btn btn--full" data-action="openContext" data-id="REVIEW">revisar o que já vi</button>
          <button class="btn btn--full" data-action="openContext" data-id="DIFFICULT">focar no que trava</button>
          <button class="btn btn--full" data-action="openContext" data-id="FAVORITES">salvar o que importa</button>
        </div>
      </section>
    </div>
  `;
}

function renderTrain() {
  const current = getPhrase(STATE.session.currentPhraseId || chooseNextPhraseFromContext(getRecommendedContextId())?.id);
  if (!current) {
    APP.innerHTML = `
      <div class="stack">
        <section class="card stack">
          <div class="badge">sem conteúdo</div>
          <p class="p">Não encontrei frase para treinar agora.</p>
          <button class="btn btn--ok" data-nav="#/contexts">escolher missão</button>
        </section>
      </div>
    `;
    return;
  }

  markSeen(current.id);
  const currentContext = getTopic(current.topicId);
  const week = getCurrentPremiumWeek();

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="studyTop">
          <div class="badge studyModeBadge">${STATE.prefs.tiredMode ? "modo cansado" : "treino"}</div>

          <div class="studyTimer" aria-label="tempo de estudo">
            <div class="studyTimerRow">
              <div class="studyTime"><span>⏱</span> <span id="studyTime">00:00</span></div>
              <div class="studyHint">meta 10:00</div>
            </div>
            <div class="studyBar"><div class="studyFill" id="studyFill"></div></div>
          </div>

          <div class="studyActions">
            <button class="miniBtn" title="missões" aria-label="missões" data-nav="#/contexts">🧭</button>
            <button class="miniBtn" title="premium" aria-label="premium" data-nav="#/premium">★</button>
          </div>
        </div>

        <div class="trainTopRow">
          <div class="badge">${escapeHTML(currentContext?.name || "Sem contexto")}</div>
          <div class="trainStatusRow">
            <button class="btn btn--ghost" data-action="toggleCallMode">${STATE.session.callMode ? "call: on" : "call: off"}</button>
            <button class="btn--exitSubtle" data-nav="#/home">sair</button>
          </div>
        </div>

        <div class="sheet stack trainingMood">
          <div class="badge">semana ${week.number}</div>
          <div class="trainingMoodTitle">${escapeHTML(week.title)}</div>
          <div class="small">${escapeHTML(week.mission)}</div>
        </div>

        ${pills(STATE.session.currentContextId || "ALL")}

        <div class="counterWrap">
          <div class="counter" id="counterBox">
            <div style="text-align:center">
              <div class="counterVal" id="countVal">-</div>
              <div class="counterSub" id="cycleSub">ciclo</div>
            </div>
          </div>

          <div class="stack" style="min-width:0">
            <div class="phraseArea">
              <div class="phraseMeta">
                <div class="phraseUse">frase atual</div>
                <div class="badge">${current.priority >= 5 ? "muito útil" : "útil"}</div>
              </div>
              <div class="kana" id="kanaLine"></div>
              <div class="pt" id="ptLine"></div>
            </div>

            <div class="row">
              <button class="btn btn--muted" data-action="speak" data-rate="1">ouvir normal</button>
              <button class="btn btn--muted" data-action="speak" data-rate="0.8">ouvir devagar</button>
            </div>

            ${phraseFlagsBar(current.id)}
          </div>
        </div>

        <div class="encourage" id="encourageBox"></div>

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
            <div class="badge">continuação da missão</div>
            <button class="btn btn--ghost" data-nav="#/premium-week/${week.number}">ver semana</button>
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
  const encourageBox = $("#encourageBox");

  if (countVal) countVal.textContent = String(count);
  if (cycleSub) cycleSub.textContent = `ciclo ${cs} → 1`;
  if (kanaLine) setKanaLine(kanaLine, phrase.jp);
  if (ptLine) ptLine.textContent = phrase.pt;
  if (newWordsBox) newWordsBox.innerHTML = renderNewWords(phrase.newWords || []);
  if (encourageBox) encourageBox.textContent = getTrainEncouragement(phrase, pr);
}

function renderMiniPhraseList() {
  const box = $("#miniPhraseList");
  if (!box) return;

  const week = getCurrentPremiumWeek();
  const currentId = STATE.session.currentPhraseId;
  const list = week.phraseIds
    .map(id => getPhrase(id))
    .filter(Boolean)
    .filter(p => p.id !== currentId)
    .slice(0, 4);

  if (!list.length) {
    box.innerHTML = `<div class="small">sem outras frases desta semana ainda.</div>`;
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

function renderContexts() {
  const contexts = listContexts();

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">missões práticas</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <h2 class="h1">Escolha o que resolve sua vida hoje.</h2>
        <p class="p">Aqui os contextos aparecem como missões reais do Japão, não como categorias frias.</p>

        ${pills("ALL")}
      </section>

      <section class="card stack">
        <div class="list">
          ${contexts.map(t => {
            const stats = getContextProgress(t.id);
            const next = chooseNextPhraseFromContext(t.id);
            return `
              <div class="item">
                <div class="itemTop">
                  <div style="min-width:0">
                    <p class="itemTitle">${escapeHTML(t.name)}</p>
                    <div class="itemMeta">${escapeHTML(getContextMissionLabel(t.name))}</div>
                    <div class="pWrap">
                      <div class="pBar"><div class="pFill" style="transform:scaleX(${stats.pct})"></div></div>
                      <div class="pTxt">${Math.round(stats.pct * 100)}%</div>
                    </div>
                    ${next ? `<div class="small" style="margin-top:8px">próxima útil: ${escapeHTML(jpStripFurigana(next.jp))}</div>` : ``}
                  </div>
                  <div class="row">
                    <button class="btn btn--ok" data-action="startContextTrain" data-id="${t.id}">treinar</button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderPremiumHub() {
  const pct = getPremiumCompletionPct();

  APP.innerHTML = `
    <div class="stack">
      <section class="card homeHero stack">
        <div class="row row--between">
          <div class="badge">premium</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <h2 class="h1">Do japonês de sobrevivência ao japonês que abre portas.</h2>
        <p class="p">Este programa premium foi pensado como uma virada de chave real para brasileiros no Japão que querem entender melhor nativos e crescer profissionalmente.</p>

        <div class="sheet stack">
          <div class="row row--between">
            <div class="badge">progresso do programa</div>
            <div class="badge">${Math.round(pct * 100)}%</div>
          </div>
          <div class="pWrap">
            <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
            <div class="pTxt">${Math.round(pct * 100)}%</div>
          </div>
        </div>
      </section>

      <section class="card stack">
        <div class="badge">blocos</div>
        <div class="list">
          ${STATE.premium.blocks.map(block => `
            <div class="item">
              <p class="itemTitle">${escapeHTML(block.title)}</p>
              <div class="itemMeta">${escapeHTML(block.subtitle)}</div>
              <div class="small" style="margin-top:8px">Semanas: ${block.weeks.join(", ")}</div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card stack">
        <div class="badge">trilhas</div>
        <div class="list">
          ${STATE.premium.tracks.map(track => `
            <div class="item">
              <p class="itemTitle">${escapeHTML(track.title)}</p>
              <div class="itemMeta">${escapeHTML(track.objective)}</div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card stack">
        <div class="badge">cronograma de 24 semanas</div>
        <div class="list">
          ${STATE.premium.weeks.map(week => {
            const prog = STATE.premiumWeekProgress[week.number];
            const statusLabel =
              prog.status === "done" ? "concluída" :
              prog.status === "active" ? "em andamento" :
              "bloqueada";

            return `
              <div class="item">
                <div class="itemTop">
                  <div style="min-width:0">
                    <p class="itemTitle">Semana ${week.number} · ${escapeHTML(week.title)}</p>
                    <div class="itemMeta">${escapeHTML(week.mission)}</div>
                    <div class="small" style="margin-top:8px">resultado: ${escapeHTML(week.result)}</div>
                  </div>
                  <div class="row">
                    <span class="badge">${statusLabel}</span>
                    <button class="btn btn--ghost" data-nav="#/premium-week/${week.number}">abrir</button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderPremiumWeek(weekNumber) {
  const week = getWeek(weekNumber);
  if (!week) return nav("#/premium");

  const block = getBlock(week.blockId);
  const track = getTrack(week.trackId);
  const prog = STATE.premiumWeekProgress[week.number];
  const phrases = week.phraseIds.map(id => getPhrase(id)).filter(Boolean);

  APP.innerHTML = `
    <div class="stack">
      <section class="card homeHero stack">
        <div class="row row--between">
          <div class="badge">semana ${week.number}</div>
          <button class="btn" data-nav="#/premium">voltar</button>
        </div>

        <h2 class="h1">${escapeHTML(week.title)}</h2>
        <p class="p">${escapeHTML(week.mission)}</p>

        <div class="sheet stack">
          <div class="small">bloco: ${escapeHTML(block?.title || "")}</div>
          <div class="small">trilha: ${escapeHTML(track?.title || "")}</div>
          <div class="small">objetivo: ${escapeHTML(week.goal)}</div>
          <div class="small">resultado esperado: ${escapeHTML(week.result)}</div>
        </div>

        <div class="row">
          <span class="badge">${prog.status === "done" ? "concluída" : prog.status === "active" ? "em andamento" : "bloqueada"}</span>
          <button class="btn btn--ok" data-action="startPremiumWeek" data-week="${week.number}">treinar esta semana</button>
          ${prog.status !== "done" ? `<button class="btn btn--ghost" data-action="completePremiumWeek" data-week="${week.number}">marcar como concluída</button>` : ``}
        </div>
      </section>

      <section class="card stack">
        <div class="badge">foco da semana</div>
        <div class="row">
          ${week.focus.map(f => `<span class="badge">${escapeHTML(f)}</span>`).join("")}
        </div>
      </section>

      <section class="card stack">
        <div class="badge">frases centrais</div>
        <div class="list">
          ${phrases.map(p => {
            const pr = getProg(p.id);
            const pct = phraseProgressPct(pr);
            return `
              <div class="item">
                <div class="itemTop">
                  <div style="min-width:0">
                    <p class="itemTitle">${escapeHTML(jpStripFurigana(p.jp))}</p>
                    <div class="itemMeta">${escapeHTML(p.pt)}</div>
                    ${p.useHint ? `<div class="small" style="margin-top:8px">útil para: ${escapeHTML(p.useHint)}</div>` : ``}
                    <div class="pWrap">
                      <div class="pBar"><div class="pFill" style="transform:scaleX(${pct})"></div></div>
                      <div class="pTxt">${Math.round(pct * 100)}%</div>
                    </div>
                  </div>
                  <button class="btn btn--ghost" data-action="trainPhraseFromWeek" data-id="${p.id}" data-week="${week.number}">treinar</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
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

  APP.innerHTML = `
    <div class="stack">
      <section class="card stack">
        <div class="row row--between">
          <div class="badge">progresso</div>
          <button class="btn" data-nav="#/home">voltar</button>
        </div>

        <h2 class="h1">Seu japonês funcional está ficando mais forte.</h2>
        <p class="p">Sem parecer painel técnico. Só o que realmente ajuda você a continuar.</p>

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
          <div class="badge">progresso premium</div>
          <button class="btn btn--ghost" data-nav="#/premium">ver programa</button>
        </div>

        <div class="item">
          <p class="itemTitle">Conclusão do programa</p>
          <div class="pWrap">
            <div class="pBar"><div class="pFill" style="transform:scaleX(${getPremiumCompletionPct()})"></div></div>
            <div class="pTxt">${Math.round(getPremiumCompletionPct() * 100)}%</div>
          </div>
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

        <p class="p">Área administrativa. Fica fora da navegação principal para o app continuar simples para quem só quer aprender e usar.</p>

        <div class="grid2">
          <button class="btn btn--ghost btn--full" data-nav="#/edit">cadastro e edição</button>
          <button class="btn btn--ghost btn--full" data-nav="#/backup">backup e importação</button>
        </div>
      </section>
    </div>
  `;
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

function renderEdit(editingId = null) {
  const editing = editingId ? getPhrase(editingId) : null;
  const topicId = editing ? editing.topicId : "topic_default";
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

          <div class="small">útil para</div>
          <input id="inUseHint" class="btn" style="height:56px; width:100%; text-align:left" value="${escapeHTML(editing?.useHint || "")}" />

          <div class="small">mensagem de conforto</div>
          <input id="inComfortHint" class="btn" style="height:56px; width:100%; text-align:left" value="${escapeHTML(editing?.comfortHint || "")}" />

          <div class="grid2">
            <button class="btn btn--ok btn--full" data-action="${editing ? "saveEditPhrase" : "saveNewPhrase"}" data-id="${editing?.id || ""}">
              ${editing ? "salvar alterações" : "salvar frase"}
            </button>
            ${editing ? `<button class="btn btn--bad btn--full" data-action="deletePhrase" data-id="${editing.id}">excluir frase</button>` : `<button class="btn btn--muted btn--full" data-nav="#/admin">cancelar</button>`}
          </div>
        </div>
      </section>
    </div>
  `;
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
    schema: "nihongo321_backup_v6",
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

  STATE = migrateState(parsed.state);
  saveState();
  refreshHUD();

  if (msgEl) msgEl.textContent = "importado ✅";
  toast("importado ✅");
  beep("ding");
  nav("#/home");
  return true;
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
    const week = getCurrentPremiumWeek();
    const phraseId = week?.phraseIds?.[0] || chooseNextPhraseFromContext(getRecommendedContextId())?.id;
    if (phraseId) setCurrentPhrase(phraseId);
    saveState();
    nav("#/train");
    return;
  }

  if (act === "startContextTrain") {
    unlockAudio();
    const id = btn.dataset.id;
    STATE.session.currentContextId = id;
    const next = chooseNextPhraseFromContext(id);
    if (next) setCurrentPhrase(next.id);
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

    if (route() === "#/train") {
      const next = chooseNextPhraseFromContext(id === "ALL" ? getRecommendedContextId() : id);
      if (next) setCurrentPhrase(next.id);
      render();
    } else {
      render();
    }
    return;
  }

  if (act === "openContext") {
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

  if (act === "startPremiumWeek") {
    unlockAudio();
    const n = Number(btn.dataset.week);
    const week = getWeek(n);
    if (!week) return;
    STATE.session.currentPremiumWeek = n;
    STATE.premiumWeekProgress[n].status = STATE.premiumWeekProgress[n].status === "locked" ? "active" : STATE.premiumWeekProgress[n].status;
    STATE.premiumWeekProgress[n].startedAt ||= now();
    setCurrentPhrase(week.phraseIds[0]);
    saveState();
    nav("#/train");
    return;
  }

  if (act === "completePremiumWeek") {
    unlockAudio();
    const n = Number(btn.dataset.week);
    unlockNextPremiumWeek(n);
    toast("semana concluída ✅");
    renderPremiumWeek(n);
    return;
  }

  if (act === "trainPhraseFromWeek") {
    unlockAudio();
    const id = btn.dataset.id;
    const week = Number(btn.dataset.week);
    if (!id) return;
    STATE.session.currentPremiumWeek = week;
    setCurrentPhrase(id);
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

    if (STATE.session.callMode) callAndResponse(phrase, rate);
    else speakPhrase(phrase, rate);
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
    toast("marcação para hoje atualizada ✅");
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

  if (act === "saveNewPhrase" || act === "saveEditPhrase") {
    unlockAudio();
    const id = btn.dataset.id;
    const editing = act === "saveEditPhrase" ? getPhrase(id) : null;

    const jp = ($("#inJp")?.value || "").trim();
    const pt = ($("#inPt")?.value || "").trim();
    const nw = parseNewWords($("#inNW")?.value || "");
    const topicId = $("#topicSel")?.value || "topic_default";
    const priority = Number($("#prioritySel")?.value || 3);
    const useHint = ($("#inUseHint")?.value || "").trim();
    const comfortHint = ($("#inComfortHint")?.value || "").trim();

    if (!jp || !pt) {
      toast("faltou jp/pt");
      beep("tuk");
      return;
    }

    if (!isValidJP(jp)) {
      toast("jp inválido");
      beep("tuk");
      return;
    }

    if (editing) {
      editing.jp = jp;
      editing.pt = pt;
      editing.newWords = nw;
      editing.topicId = topicId;
      editing.priority = priority;
      editing.useHint = useHint;
      editing.comfortHint = comfortHint;
      editing.updatedAt = now();
      saveState();
      toast("alterado ✅");
      nav("#/admin");
    } else {
      const newId = uid("ph");
      STATE.bank.phrases.unshift({
        id: newId,
        jp,
        pt,
        topicId,
        priority,
        useHint,
        comfortHint,
        newWords: nw,
        createdAt: now(),
        updatedAt: now()
      });
      STATE.progress[newId] = {
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
      nav("#/admin");
    }
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
    nav("#/admin");
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