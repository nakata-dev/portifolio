/* =========================================================
   NIHONGO321 — SENSEI BANK v1.0.0
   Banco externo oficial do Sensei IA

   Objetivo:
   - Separar conteúdo da lógica principal do app
   - Organizar o método NIHONGO321 por níveis
   - Alimentar o Sensei IA Local Master
   - Preparar o app para parecer completo, profundo e profissional

   Estrutura pedagógica:
   1. Básico        → Sobrevivência
   2. Intermediário → Autonomia
   3. Avançado      → Confiança

   Regras:
   - Este arquivo guarda conteúdo, não lógica de tela
   - Deve ser carregado antes do app.js
   - Não usa API paga
   - Funciona offline
   ========================================================= */

(function initNihongo321SenseiBank() {
  "use strict";

  const BANK_VERSION = "1.0.0";

  function phrase(jp, pt, newWords = [], extra = {}) {
    return {
      jp,
      pt,
      newWords: Array.isArray(newWords) ? newWords : [],
      ...extra
    };
  }

  function words(list) {
    return Array.isArray(list) ? list : [];
  }

  window.NIHONGO321_SENSEI_BANK = {
    version: BANK_VERSION,
    updatedAt: "2026-05-04",

    meta: {
      name: "NIHONGO321 Sensei Bank",
      appName: "NIHONGO321",
      tagline: "Japonês prático no Japão",
      promise: "Treine frases úteis para viver melhor no Japão.",
      audience: "Brasileiros no Japão, especialmente dekasseguis com rotina pesada.",
      method: "Ouvir, ler, repetir em voz alta e revisar frases úteis no método 105x.",
      offline: true,
      paidApi: false,
      minPhrasesPerPack: 7,
      defaultTone: "educado",
      defaultLevel: "iniciante"
    },

    /* =====================================================
       1. NÍVEIS OFICIAIS DO MÉTODO
       ===================================================== */

    levels: {
      iniciante: {
        id: "iniciante",
        alias: ["basico", "básico", "sobrevivencia", "sobrevivência", "n5"],
        label: "Básico",
        name: "Sobrevivência",
        fullName: "Básico — Sobrevivência",
        order: 1,
        icon: "🧱",
        color: "tBlue",
        shortDescription: "Frases curtas para se virar no Japão.",
        description:
          "O aluno aprende frases simples, diretas e fáceis de repetir para resolver situações básicas do dia a dia.",
        goal:
          "Conseguir pedir ajuda, dizer que não entendeu, comprar algo, usar transporte e responder frases simples.",
        phraseStyle:
          "Frases curtas, vocabulário direto, poucos conectores e estruturas de alta repetição.",
        studyAdvice:
          "Repita devagar, sem pressa. O objetivo é destravar a fala, não decorar regras gramaticais."
      },

      intermediario: {
        id: "intermediario",
        alias: ["intermediário", "autonomia", "medio", "médio", "n4", "n3"],
        label: "Intermediário",
        name: "Autonomia",
        fullName: "Intermediário — Autonomia",
        order: 2,
        icon: "🛠️",
        color: "tGreen",
        shortDescription: "Frases para explicar, confirmar e resolver problemas.",
        description:
          "O aluno começa a explicar motivos, confirmar informações, pedir detalhes e lidar com situações reais com mais independência.",
        goal:
          "Conseguir conversar melhor no trabalho, hospital, prefeitura, correio, moradia e situações de responsabilidade.",
        phraseStyle:
          "Frases com conectores, pedidos educados, explicações simples e confirmações úteis.",
        studyAdvice:
          "Depois de repetir, troque uma palavra da frase para treinar flexibilidade."
      },

      avancado: {
        id: "avancado",
        alias: ["avançado", "confianca", "confiança", "naturalidade", "n2", "n1"],
        label: "Avançado",
        name: "Confiança",
        fullName: "Avançado — Confiança",
        order: 3,
        icon: "🏯",
        color: "tAmber",
        shortDescription: "Frases naturais, polidas e mais completas.",
        description:
          "O aluno treina frases mais naturais, educadas e detalhadas para situações importantes no Japão.",
        goal:
          "Falar com mais segurança, nuance e profissionalismo em trabalho, documentos, saúde, contrato e problemas sérios.",
        phraseStyle:
          "Frases mais longas, polidas, com nuances, confirmação profissional e linguagem mais natural.",
        studyAdvice:
          "Treine imaginando a situação real. A fala precisa soar segura, não robótica."
      }
    },

    /* =====================================================
       2. TONS OFICIAIS DO SENSEI
       ===================================================== */

    tones: {
      educado: {
        id: "educado",
        label: "Educado",
        icon: "🤝",
        description:
          "Tom seguro para trabalho, prefeitura, hospital, lojas e conversas com desconhecidos.",
        style:
          "Usa です, ます, ください, もらえますか e いただけますか quando fizer sentido."
      },

      natural: {
        id: "natural",
        label: "Natural",
        icon: "🌿",
        description:
          "Tom mais leve para conversas do dia a dia, sem ficar formal demais.",
        style:
          "Usa frases mais conversacionais, mas ainda respeitosas."
      },

      trabalho: {
        id: "trabalho",
        label: "Trabalho",
        icon: "🏭",
        description:
          "Tom voltado para fábrica, chefe, líder, tarefa, segurança e confirmação.",
        style:
          "Prioriza clareza, confirmação e frases que evitam erro de trabalho."
      },

      emergencia: {
        id: "emergencia",
        label: "Emergência",
        icon: "🚨",
        description:
          "Tom direto para pedir ajuda rápido em situações urgentes.",
        style:
          "Frases curtas, sem rodeio, com foco em ser entendido imediatamente."
      }
    },

    /* =====================================================
       3. TRILHAS DE ESTUDO
       ===================================================== */

    studyPaths: {
      iniciante: [
        {
          id: "basic_first_phrases",
          title: "Primeiras frases",
          subtitle: "Comece falando o mínimo necessário sem travar.",
          type: "scenario",
          target: "primeiras_frases",
          level: "iniciante",
          estimatedMinutes: 5,
          unlock: "free",
          order: 1
        },
        {
          id: "basic_help",
          title: "Pedir ajuda",
          subtitle: "Frases para pedir ajuda com educação.",
          type: "scenario",
          target: "pedir_ajuda",
          level: "iniciante",
          estimatedMinutes: 5,
          unlock: "free",
          order: 2
        },
        {
          id: "basic_dont_understand",
          title: "Não entendi",
          subtitle: "Aprenda a pedir repetição, explicação e fala mais lenta.",
          type: "scenario",
          target: "nao_entendi",
          level: "iniciante",
          estimatedMinutes: 5,
          unlock: "free",
          order: 3
        },
        {
          id: "basic_konbini",
          title: "Konbini básico",
          subtitle: "Sacola, recibo, pagamento, bentô e hashi.",
          type: "scenario",
          target: "konbini",
          level: "iniciante",
          estimatedMinutes: 5,
          unlock: "free",
          order: 4
        },
        {
          id: "basic_market",
          title: "Mercado básico",
          subtitle: "Preço, validade, produto, sacola e pagamento.",
          type: "scenario",
          target: "mercado",
          level: "iniciante",
          estimatedMinutes: 5,
          unlock: "free",
          order: 5
        },
        {
          id: "basic_transport",
          title: "Trem e ônibus",
          subtitle: "Perguntar destino, horário, plataforma e baldeação.",
          type: "scenario",
          target: "transporte",
          level: "iniciante",
          estimatedMinutes: 6,
          unlock: "free",
          order: 6
        },
        {
          id: "basic_emergency",
          title: "Emergência simples",
          subtitle: "Frases curtas para pedir ajuda rápido.",
          type: "tone",
          target: "emergencia",
          level: "iniciante",
          estimatedMinutes: 5,
          unlock: "free",
          order: 7
        }
      ],

      intermediario: [
        {
          id: "inter_factory",
          title: "Fábrica",
          subtitle: "Confirmar tarefas, máquina, peça e segurança.",
          type: "scenario",
          target: "fabrica",
          level: "intermediario",
          estimatedMinutes: 7,
          unlock: "premium",
          order: 1
        },
        {
          id: "inter_boss",
          title: "Chefe e líder",
          subtitle: "Pedir explicação, confirmar ordem e reportar problema.",
          type: "scenario",
          target: "chefe",
          level: "intermediario",
          estimatedMinutes: 7,
          unlock: "premium",
          order: 2
        },
        {
          id: "inter_hospital",
          title: "Hospital",
          subtitle: "Explicar sintomas, remédio, atestado e orientação médica.",
          type: "scenario",
          target: "hospital",
          level: "intermediario",
          estimatedMinutes: 7,
          unlock: "premium",
          order: 3
        },
        {
          id: "inter_cityhall",
          title: "Prefeitura",
          subtitle: "Documentos, senha, balcão, cópias e procedimentos.",
          type: "scenario",
          target: "prefeitura",
          level: "intermediario",
          estimatedMinutes: 7,
          unlock: "premium",
          order: 4
        },
        {
          id: "inter_post",
          title: "Correio",
          subtitle: "Enviar encomenda, endereço, frete e rastreamento.",
          type: "scenario",
          target: "correio",
          level: "intermediario",
          estimatedMinutes: 7,
          unlock: "premium",
          order: 5
        },
        {
          id: "inter_grammar_node",
          title: "Explicar motivo com ので",
          subtitle: "Diga o motivo de forma educada.",
          type: "grammar",
          target: "ので",
          level: "intermediario",
          estimatedMinutes: 7,
          unlock: "premium",
          order: 6
        },
        {
          id: "inter_grammar_kadouka",
          title: "Confirmar com かどうか",
          subtitle: "Pergunte se algo é ou não é de forma natural.",
          type: "grammar",
          target: "かどうか",
          level: "intermediario",
          estimatedMinutes: 7,
          unlock: "premium",
          order: 7
        }
      ],

      avancado: [
        {
          id: "adv_work_polite",
          title: "Confirmação profissional",
          subtitle: "Fale com chefe, líder ou responsável sem parecer rude.",
          type: "scenario",
          target: "chefe",
          level: "avancado",
          estimatedMinutes: 10,
          unlock: "premium",
          order: 1
        },
        {
          id: "adv_safety",
          title: "Segurança no trabalho",
          subtitle: "Confirme riscos, procedimentos e dúvidas antes de agir.",
          type: "scenario",
          target: "seguranca_trabalho",
          level: "avancado",
          estimatedMinutes: 10,
          unlock: "premium",
          order: 2
        },
        {
          id: "adv_cityhall",
          title: "Prefeitura avançada",
          subtitle: "Explique situações e confirme documentos com mais precisão.",
          type: "scenario",
          target: "prefeitura",
          level: "avancado",
          estimatedMinutes: 10,
          unlock: "premium",
          order: 3
        },
        {
          id: "adv_hospital",
          title: "Hospital avançado",
          subtitle: "Explique sintomas, histórico e preocupações com clareza.",
          type: "scenario",
          target: "hospital",
          level: "avancado",
          estimatedMinutes: 10,
          unlock: "premium",
          order: 4
        },
        {
          id: "adv_opinion",
          title: "Opinião com と思います",
          subtitle: "Fale o que você acha com naturalidade.",
          type: "grammar",
          target: "と思います",
          level: "avancado",
          estimatedMinutes: 10,
          unlock: "premium",
          order: 5
        },
        {
          id: "adv_possibility",
          title: "Possibilidade com かもしれません",
          subtitle: "Explique possibilidades sem afirmar com dureza.",
          type: "grammar",
          target: "かもしれません",
          level: "avancado",
          estimatedMinutes: 10,
          unlock: "premium",
          order: 6
        }
      ]
    },

    /* =====================================================
       4. MAPA DO JAPONÊS PRÁTICO
       ===================================================== */

    practicalMap: {
      survival: {
        label: "Sobrevivência",
        icon: "🧱",
        description: "Frases para não travar em situações simples.",
        modules: ["primeiras_frases", "pedir_ajuda", "nao_entendi", "emergencia"]
      },

      work: {
        label: "Trabalho",
        icon: "🏭",
        description: "Fábrica, chefe, tarefa, segurança e hora extra.",
        modules: ["fabrica", "chefe", "seguranca_trabalho"]
      },

      publicLife: {
        label: "Vida pública",
        icon: "🏛️",
        description: "Prefeitura, documentos, correio, banco e procedimentos.",
        modules: ["prefeitura", "correio", "banco"]
      },

      health: {
        label: "Saúde",
        icon: "🏥",
        description: "Hospital, farmácia, sintomas, remédios e atestado.",
        modules: ["hospital", "farmacia", "emergencia"]
      },

      dailyLife: {
        label: "Dia a dia",
        icon: "🛒",
        description: "Konbini, mercado, transporte, moradia e bicicleta.",
        modules: ["konbini", "mercado", "transporte", "moradia", "bicicleta"]
      },

      grammar: {
        label: "Gramática prática",
        icon: "🧠",
        description: "Estruturas úteis explicadas por frases reais.",
        modules: ["ので", "かどうか", "てもいい", "てもらえますか", "ないといけない", "たほうがいい"]
      }
    },

    /* =====================================================
       5. SELOS CONCEITUAIS
       ===================================================== */

    badges: {
      firstStep: {
        id: "firstStep",
        label: "Primeiro passo",
        icon: "👣",
        description: "Gerou ou treinou o primeiro material."
      },
      survivalReady: {
        id: "survivalReady",
        label: "Sobrevivência ativada",
        icon: "🧱",
        description: "Treinou frases básicas para se virar no Japão."
      },
      factoryReady: {
        id: "factoryReady",
        label: "Fábrica desbloqueada",
        icon: "🏭",
        description: "Treinou frases úteis para rotina de fábrica."
      },
      hospitalReady: {
        id: "hospitalReady",
        label: "Hospital sem pânico",
        icon: "🏥",
        description: "Treinou frases para explicar sintomas e pedir ajuda."
      },
      cityhallReady: {
        id: "cityhallReady",
        label: "Prefeitura dominada",
        icon: "🏛️",
        description: "Treinou frases para documentos e procedimentos."
      },
      nightShiftWarrior: {
        id: "nightShiftWarrior",
        label: "Guerreiro do turno",
        icon: "🌙",
        description: "Treinou mesmo com rotina pesada."
      },
      confidenceMode: {
        id: "confidenceMode",
        label: "Modo confiança",
        icon: "🏯",
        description: "Treinou frases avançadas com tom mais natural e educado."
      }
    },
        /* =====================================================
       6. BANCO DE GRAMÁTICA PRÁTICA
       ===================================================== */

    grammar: {
      "ので": {
        id: "grammar_node",
        label: "Uso de ので",
        kind: "gramática",
        levelGroup: "intermediario",
        tags: ["ので", "motivo", "causa", "porque", "por causa de", "gramática", "explicação"],
        explanation:
          "ので liga uma causa a uma consequência. Soa mais suave, natural e educado do que simplesmente jogar uma desculpa.",
        usage:
          "Use para explicar motivos no trabalho, prefeitura, hospital, atrasos, cansaço, documentos e situações delicadas.",
        commonMistake:
          "Evite usar ので sozinho como desculpa seca. Quando pedir algo, combine com formas educadas como てもいいですか, ください ou いただけますか.",
        goal:
          "Aprender a explicar motivos sem parecer rude.",
        levels: {
          iniciante: [
            phrase(
              "雨{あめ} なので、行{い}きません。",
              "Como está chovendo, não vou.",
              words([
                { jp: "雨{あめ}", pt: "chuva" },
                { jp: "行{い}きません", pt: "não vou" }
              ])
            ),
            phrase(
              "仕事{しごと} なので、早{はや}く 寝{ね}ます。",
              "Como tenho trabalho, vou dormir cedo.",
              words([
                { jp: "仕事{しごと}", pt: "trabalho" },
                { jp: "早{はや}く", pt: "cedo" },
                { jp: "寝{ね}ます", pt: "vou dormir" }
              ])
            ),
            phrase(
              "時間{じかん} が ない ので、あと で します。",
              "Como não tenho tempo, faço depois.",
              words([
                { jp: "時間{じかん}", pt: "tempo" },
                { jp: "あと で", pt: "depois" }
              ])
            ),
            phrase(
              "日本語{にほんご} が 苦手{にがて} なので、ゆっくり お願{ねが}いします。",
              "Como tenho dificuldade com japonês, devagar, por favor.",
              words([
                { jp: "日本語{にほんご}", pt: "japonês" },
                { jp: "苦手{にがて}", pt: "dificuldade / ponto fraco" },
                { jp: "ゆっくり", pt: "devagar" }
              ])
            ),
            phrase(
              "疲{つか}れた ので、少{すこ}し 休{やす}みます。",
              "Como fiquei cansado, vou descansar um pouco.",
              words([
                { jp: "疲{つか}れた", pt: "fiquei cansado" },
                { jp: "少{すこ}し", pt: "um pouco" },
                { jp: "休{やす}みます", pt: "vou descansar" }
              ])
            ),
            phrase(
              "寒{さむ}い ので、上着{うわぎ} を 着{き}ます。",
              "Como está frio, vou vestir uma blusa/casaco.",
              words([
                { jp: "寒{さむ}い", pt: "frio" },
                { jp: "上着{うわぎ}", pt: "blusa / casaco" },
                { jp: "着{き}ます", pt: "vou vestir" }
              ])
            ),
            phrase(
              "わからない ので、教{おし}えて ください。",
              "Como não entendo, por favor me ensine.",
              words([
                { jp: "わからない", pt: "não entendo" },
                { jp: "教{おし}えて", pt: "ensinar / explicar" },
                { jp: "ください", pt: "por favor" }
              ])
            )
          ],

          intermediario: [
            phrase(
              "電車{でんしゃ} が 遅{おく}れて いる ので、少{すこ}し 遅{おく}れます。",
              "Como o trem está atrasado, vou me atrasar um pouco.",
              words([
                { jp: "電車{でんしゃ}", pt: "trem" },
                { jp: "遅{おく}れて いる", pt: "está atrasado" },
                { jp: "少{すこ}し", pt: "um pouco" }
              ])
            ),
            phrase(
              "今日{きょう} は 体調{たいちょう} が 悪{わる}い ので、早{はや}く 帰{かえ}っても いいですか。",
              "Como hoje estou me sentindo mal, posso ir embora mais cedo?",
              words([
                { jp: "今日{きょう}", pt: "hoje" },
                { jp: "体調{たいちょう}", pt: "condição física" },
                { jp: "帰{かえ}っても いいですか", pt: "posso ir embora?" }
              ])
            ),
            phrase(
              "日本語{にほんご} が まだ 苦手{にがて} なので、ゆっくり 話{はな}して ください。",
              "Como ainda tenho dificuldade com japonês, por favor fale devagar.",
              words([
                { jp: "まだ", pt: "ainda" },
                { jp: "苦手{にがて}", pt: "dificuldade" },
                { jp: "話{はな}して", pt: "falar" }
              ])
            ),
            phrase(
              "明日{あした} は 仕事{しごと} なので、今日{きょう} は 早{はや}く 寝{ね}ます。",
              "Como amanhã tenho trabalho, hoje vou dormir cedo.",
              words([
                { jp: "明日{あした}", pt: "amanhã" },
                { jp: "仕事{しごと}", pt: "trabalho" },
                { jp: "寝{ね}ます", pt: "vou dormir" }
              ])
            ),
            phrase(
              "雨{あめ} が 降{ふ}って いる ので、自転車{じてんしゃ} では 行{い}きません。",
              "Como está chovendo, não vou de bicicleta.",
              words([
                { jp: "雨{あめ} が 降{ふ}って いる", pt: "está chovendo" },
                { jp: "自転車{じてんしゃ}", pt: "bicicleta" },
                { jp: "行{い}きません", pt: "não vou" }
              ])
            ),
            phrase(
              "この 書類{しょるい} が わからない ので、教{おし}えて いただけますか。",
              "Como eu não entendo este documento, o senhor poderia me explicar?",
              words([
                { jp: "書類{しょるい}", pt: "documento" },
                { jp: "教{おし}えて", pt: "explicar / ensinar" },
                { jp: "いただけますか", pt: "poderia fazer para mim? / forma educada" }
              ])
            ),
            phrase(
              "時間{じかん} が ない ので、あと で 連絡{れんらく} します。",
              "Como não tenho tempo, entro em contato depois.",
              words([
                { jp: "時間{じかん}", pt: "tempo" },
                { jp: "あと で", pt: "depois" },
                { jp: "連絡{れんらく}", pt: "contato" }
              ])
            )
          ],

          avancado: [
            phrase(
              "体調{たいちょう} が あまり 良{よ}くない ので、今日{きょう} は 無理{むり} を しない ようにします。",
              "Como minha condição física não está muito boa, hoje vou procurar não forçar.",
              words([
                { jp: "体調{たいちょう}", pt: "condição física" },
                { jp: "無理{むり} を しない", pt: "não forçar" },
                { jp: "ようにします", pt: "vou procurar fazer" }
              ])
            ),
            phrase(
              "説明{せつめい} の 内容{ないよう} が まだ 完全{かんぜん} に 理解{りかい} できて いない ので、もう 一度{いちど} 確認{かくにん} させて ください。",
              "Como ainda não consegui entender completamente o conteúdo da explicação, por favor deixe-me confirmar mais uma vez.",
              words([
                { jp: "説明{せつめい}", pt: "explicação" },
                { jp: "完全{かんぜん}", pt: "completamente" },
                { jp: "理解{りかい}", pt: "entendimento" },
                { jp: "確認{かくにん} させて ください", pt: "por favor, deixe-me confirmar" }
              ])
            ),
            phrase(
              "書類{しょるい} に 不備{ふび} が ある かもしれない ので、提出{ていしゅつ} する 前{まえ} に 確認{かくにん} したいです。",
              "Como pode haver alguma falha no documento, quero confirmar antes de entregar.",
              words([
                { jp: "不備{ふび}", pt: "falha / pendência" },
                { jp: "提出{ていしゅつ}", pt: "entrega" },
                { jp: "前{まえ} に", pt: "antes de" }
              ])
            ),
            phrase(
              "安全{あんぜん} に 関{かか}わる こと なので、少{すこ}しでも 不安{ふあん} が あれば 先{さき}に 確認{かくにん} します。",
              "Como é algo relacionado à segurança, se eu tiver qualquer insegurança, confirmo antes.",
              words([
                { jp: "安全{あんぜん}", pt: "segurança" },
                { jp: "関{かか}わる", pt: "estar relacionado" },
                { jp: "不安{ふあん}", pt: "insegurança / preocupação" }
              ])
            ),
            phrase(
              "日本語{にほんご} だけ では 細{こま}かい ニュアンス が わかりにくい ので、簡単{かんたん} な 言葉{ことば} で 説明{せつめい} して いただけますか。",
              "Como é difícil entender nuances detalhadas só em japonês, o senhor poderia explicar com palavras simples?",
              words([
                { jp: "細{こま}かい", pt: "detalhado" },
                { jp: "ニュアンス", pt: "nuance" },
                { jp: "言葉{ことば}", pt: "palavras" }
              ])
            ),
            phrase(
              "予定{よてい} が 変{か}わる 可能性{かのうせい} が ある ので、決{き}まり 次第{しだい} すぐ に 連絡{れんらく} します。",
              "Como existe a possibilidade de a programação mudar, assim que for definido eu entro em contato.",
              words([
                { jp: "予定{よてい}", pt: "programação" },
                { jp: "可能性{かのうせい}", pt: "possibilidade" },
                { jp: "決{き}まり 次第{しだい}", pt: "assim que for decidido" }
              ])
            ),
            phrase(
              "作業{さぎょう} の 内容{ないよう} が 変更{へんこう} に なった ので、念{ねん}のため もう 一度{いちど} 手順{てじゅん} を 確認{かくにん} します。",
              "Como o conteúdo da tarefa foi alterado, por precaução vou confirmar o procedimento mais uma vez.",
              words([
                { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
                { jp: "変更{へんこう}", pt: "alteração" },
                { jp: "念{ねん}のため", pt: "por precaução" },
                { jp: "手順{てじゅん}", pt: "procedimento / passo a passo" }
              ])
            )
          ]
        }
      },

      "かどうか": {
        id: "grammar_kadouka",
        label: "Uso de かどうか",
        kind: "gramática",
        levelGroup: "intermediario",
        tags: ["かどうか", "se", "ou não", "confirmar", "dúvida", "pergunta indireta"],
        explanation:
          "かどうか significa “se... ou não”. É usado quando você quer confirmar uma informação sem fazer uma pergunta simples demais.",
        usage:
          "Use para confirmar se algo pode ser feito, se precisa de documento, se tem hora extra, se o cartão funciona ou se uma informação está correta.",
        commonMistake:
          "Não confunda com か sozinho. かどうか deixa claro que você está perguntando se algo é ou não é.",
        goal:
          "Aprender a confirmar informações com mais clareza.",
        levels: {
          iniciante: [
            phrase(
              "これ が 使{つか}える かどうか 知{し}りたいです。",
              "Quero saber se isto pode ser usado.",
              words([
                { jp: "使{つか}える", pt: "pode usar" },
                { jp: "知{し}りたい", pt: "quero saber" }
              ])
            ),
            phrase(
              "今日{きょう}、残業{ざんぎょう} が ある かどうか わかりますか。",
              "Você sabe se hoje tem hora extra?",
              words([
                { jp: "今日{きょう}", pt: "hoje" },
                { jp: "残業{ざんぎょう}", pt: "hora extra" }
              ])
            ),
            phrase(
              "この 電車{でんしゃ} が 行{い}く かどうか 知{し}りたいです。",
              "Quero saber se este trem vai.",
              words([
                { jp: "電車{でんしゃ}", pt: "trem" },
                { jp: "行{い}く", pt: "ir" }
              ])
            ),
            phrase(
              "これ で 大丈夫{だいじょうぶ} かどうか 見{み}て ください。",
              "Por favor, veja se assim está certo.",
              words([
                { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / correto" },
                { jp: "見{み}て", pt: "ver / olhar" }
              ])
            ),
            phrase(
              "予約{よやく} が 必要{ひつよう} かどうか 聞{き}きたいです。",
              "Quero perguntar se precisa de reserva.",
              words([
                { jp: "予約{よやく}", pt: "reserva" },
                { jp: "必要{ひつよう}", pt: "necessário" }
              ])
            ),
            phrase(
              "明日{あした} 休{やす}める かどうか まだ わかりません。",
              "Ainda não sei se posso folgar amanhã.",
              words([
                { jp: "明日{あした}", pt: "amanhã" },
                { jp: "休{やす}める", pt: "poder folgar" }
              ])
            ),
            phrase(
              "この 商品{しょうひん} が ある かどうか 聞{き}きます。",
              "Vou perguntar se tem este produto.",
              words([
                { jp: "商品{しょうひん}", pt: "produto" },
                { jp: "聞{き}きます", pt: "vou perguntar" }
              ])
            )
          ],

          intermediario: [
            phrase(
              "この カード が 使{つか}える かどうか 確認{かくにん} して ください。",
              "Por favor, confirme se este cartão pode ser usado.",
              words([
                { jp: "カード", pt: "cartão" },
                { jp: "確認{かくにん}", pt: "confirmação" }
              ])
            ),
            phrase(
              "この 書類{しょるい} で 大丈夫{だいじょうぶ} かどうか 見{み}て もらえますか。",
              "Você poderia ver se este documento está certo?",
              words([
                { jp: "書類{しょるい}", pt: "documento" },
                { jp: "見{み}て もらえますか", pt: "poderia ver para mim?" }
              ])
            ),
            phrase(
              "今日{きょう} 残業{ざんぎょう} が ある かどうか 知{し}りたいです。",
              "Quero saber se hoje vai ter hora extra.",
              words([
                { jp: "残業{ざんぎょう}", pt: "hora extra" },
                { jp: "知{し}りたい", pt: "quero saber" }
              ])
            ),
            phrase(
              "予約{よやく} が 必要{ひつよう} かどうか 教{おし}えて ください。",
              "Por favor, me diga se é necessário reservar.",
              words([
                { jp: "予約{よやく}", pt: "reserva" },
                { jp: "必要{ひつよう}", pt: "necessário" }
              ])
            ),
            phrase(
              "この 電車{でんしゃ} が 福井{ふくい} に 行{い}く かどうか 知{し}りたいです。",
              "Quero saber se este trem vai para Fukui.",
              words([
                { jp: "福井{ふくい}", pt: "Fukui" },
                { jp: "電車{でんしゃ}", pt: "trem" }
              ])
            ),
            phrase(
              "この 商品{しょうひん} が まだ ある かどうか 聞{き}いて みます。",
              "Vou tentar perguntar se este produto ainda tem.",
              words([
                { jp: "商品{しょうひん}", pt: "produto" },
                { jp: "聞{き}いて みます", pt: "vou tentar perguntar" }
              ])
            ),
            phrase(
              "この 方法{ほうほう} で 問題{もんだい} が ない かどうか 確認{かくにん} したいです。",
              "Quero confirmar se não há problema com este método.",
              words([
                { jp: "方法{ほうほう}", pt: "método" },
                { jp: "問題{もんだい}", pt: "problema" }
              ])
            )
          ],

          avancado: [
            phrase(
              "この 書類{しょるい} で 手続{てつづ}き が できる かどうか、先{さき}に 確認{かくにん} して いただけますか。",
              "O senhor poderia confirmar antes se é possível fazer o procedimento com este documento?",
              words([
                { jp: "書類{しょるい}", pt: "documento" },
                { jp: "手続{てつづ}き", pt: "procedimento" },
                { jp: "先{さき}に", pt: "antes / antecipadamente" }
              ])
            ),
            phrase(
              "今日中{きょうじゅう} に 対応{たいおう} できる かどうか、わかり 次第{しだい} 教{おし}えて ください。",
              "Assim que souber se dá para atender ainda hoje, por favor me avise.",
              words([
                { jp: "今日中{きょうじゅう}", pt: "ainda hoje" },
                { jp: "対応{たいおう}", pt: "atendimento / resposta" },
                { jp: "次第{しだい}", pt: "assim que" }
              ])
            ),
            phrase(
              "この 方法{ほうほう} で 問題{もんだい} が ない かどうか、念{ねん}のため 確認{かくにん} したいです。",
              "Por precaução, quero confirmar se não há problema com este método.",
              words([
                { jp: "方法{ほうほう}", pt: "método" },
                { jp: "念{ねん}のため", pt: "por precaução" },
                { jp: "確認{かくにん}", pt: "confirmação" }
              ])
            ),
            phrase(
              "この 部品{ぶひん} が 正{ただ}しい かどうか 自信{じしん} が ない ので、確認{かくにん} を お願{ねが}いします。",
              "Como não tenho certeza se esta peça está correta, peço a verificação.",
              words([
                { jp: "部品{ぶひん}", pt: "peça" },
                { jp: "正{ただ}しい", pt: "correto" },
                { jp: "自信{じしん}", pt: "confiança / certeza" }
              ])
            ),
            phrase(
              "予定{よてい} が 変更{へんこう} に なる かどうか、まだ 連絡{れんらく} が 来{き}て いません。",
              "Ainda não recebi contato sobre se a programação será alterada.",
              words([
                { jp: "予定{よてい}", pt: "programação" },
                { jp: "変更{へんこう}", pt: "alteração" },
                { jp: "連絡{れんらく}", pt: "contato" }
              ])
            ),
            phrase(
              "この 表現{ひょうげん} が 自然{しぜん} かどうか、日本人{にほんじん} の 友達{ともだち} に 聞{き}いて みます。",
              "Vou tentar perguntar a um amigo japonês se esta expressão é natural.",
              words([
                { jp: "表現{ひょうげん}", pt: "expressão" },
                { jp: "自然{しぜん}", pt: "natural" },
                { jp: "聞{き}いて みます", pt: "vou tentar perguntar" }
              ])
            ),
            phrase(
              "この 契約{けいやく} に 追加料金{ついかりょうきん} が かかる かどうか、必{かなら}ず 確認{かくにん} した ほう が いいです。",
              "É melhor confirmar sem falta se haverá taxa extra neste contrato.",
              words([
                { jp: "契約{けいやく}", pt: "contrato" },
                { jp: "追加料金{ついかりょうきん}", pt: "taxa extra" },
                { jp: "必{かなら}ず", pt: "sem falta" }
              ])
            )
          ]
        }
      },

      "てもいい": {
        id: "grammar_temoii",
        label: "Uso de てもいい",
        kind: "gramática",
        levelGroup: "iniciante",
        tags: ["てもいい", "てもいいですか", "permissão", "posso", "pode"],
        explanation:
          "てもいい é usado para pedir ou dar permissão. Em português, geralmente vira “posso...?” ou “tudo bem se...?”.",
        usage:
          "Use em lojas, trabalho, hospital, escola, prefeitura e qualquer situação em que você quer agir sem parecer invasivo.",
        commonMistake:
          "Não use só o verbo seco quando estiver pedindo permissão. てもいいですか deixa o pedido mais claro e educado.",
        goal:
          "Aprender a pedir permissão com segurança.",
        levels: {
          iniciante: [
            phrase("ここ に 座{すわ}っても いいですか。", "Posso sentar aqui?", words([
              { jp: "座{すわ}って", pt: "sentar" }
            ])),
            phrase("写真{しゃしん} を 撮{と}っても いいですか。", "Posso tirar foto?", words([
              { jp: "写真{しゃしん}", pt: "foto" },
              { jp: "撮{と}って", pt: "tirar foto" }
            ])),
            phrase("少{すこ}し 休{やす}んでも いいですか。", "Posso descansar um pouco?", words([
              { jp: "休{やす}んで", pt: "descansar" }
            ])),
            phrase("今日{きょう} は 早{はや}く 帰{かえ}っても いいですか。", "Posso ir embora cedo hoje?", words([
              { jp: "早{はや}く", pt: "cedo" },
              { jp: "帰{かえ}って", pt: "ir embora / voltar" }
            ])),
            phrase("この ペン を 使{つか}っても いいですか。", "Posso usar esta caneta?", words([
              { jp: "使{つか}って", pt: "usar" }
            ])),
            phrase("あと で 電話{でんわ} しても いいですか。", "Posso ligar depois?", words([
              { jp: "電話{でんわ}", pt: "telefone / ligação" }
            ])),
            phrase("ここ に 置{お}いても いいですか。", "Posso deixar aqui?", words([
              { jp: "置{お}いて", pt: "colocar / deixar" }
            ]))
          ],

          intermediario: [
            phrase("この 書類{しょるい} を ここ に 出{だ}しても いいですか。", "Posso entregar este documento aqui?", words([
              { jp: "書類{しょるい}", pt: "documento" },
              { jp: "出{だ}して", pt: "entregar" }
            ])),
            phrase("少{すこ}し だけ 時間{じかん} を もらっても いいですか。", "Posso receber só um pouco de tempo?", words([
              { jp: "時間{じかん}", pt: "tempo" },
              { jp: "もらっても いいですか", pt: "posso receber?" }
            ])),
            phrase("この 写真{しゃしん} を 見{み}せても いいですか。", "Posso mostrar esta foto?", words([
              { jp: "見{み}せても", pt: "mostrar" }
            ])),
            phrase("仕事{しごと} が 終{お}わったら、先{さき}に 帰{かえ}っても いいですか。", "Quando o trabalho terminar, posso ir embora antes?", words([
              { jp: "終{お}わったら", pt: "quando terminar" },
              { jp: "先{さき}に", pt: "antes / primeiro" }
            ])),
            phrase("わからない ところ を 聞{き}いても いいですか。", "Posso perguntar a parte que não entendi?", words([
              { jp: "ところ", pt: "parte / ponto" },
              { jp: "聞{き}いて", pt: "perguntar" }
            ])),
            phrase("この 道具{どうぐ} を 使{つか}っても いいですか。", "Posso usar esta ferramenta?", words([
              { jp: "道具{どうぐ}", pt: "ferramenta" }
            ])),
            phrase("あと で 確認{かくにん} しても いいですか。", "Posso confirmar depois?", words([
              { jp: "確認{かくにん}", pt: "confirmação" }
            ]))
          ],

          avancado: [
            phrase("念{ねん}のため、作業{さぎょう} を 始{はじ}める 前{まえ} に 確認{かくにん} しても いいですか。", "Por precaução, posso confirmar antes de começar a tarefa?", words([
              { jp: "念{ねん}のため", pt: "por precaução" },
              { jp: "作業{さぎょう}", pt: "tarefa / trabalho" }
            ])),
            phrase("内容{ないよう} に 間違{まちが}い が ない か、もう 一度{いちど} 見{み}ても いいですか。", "Posso verificar mais uma vez se não há erro no conteúdo?", words([
              { jp: "内容{ないよう}", pt: "conteúdo" },
              { jp: "間違{まちが}い", pt: "erro" }
            ])),
            phrase("この 件{けん} について、あと で 改{あらた}めて 連絡{れんらく} しても いいですか。", "Sobre este assunto, posso entrar em contato novamente depois?", words([
              { jp: "件{けん}", pt: "assunto / caso" },
              { jp: "改{あらた}めて", pt: "novamente / de forma apropriada" }
            ])),
            phrase("提出{ていしゅつ} する 前{まえ} に、内容{ないよう} を 確認{かくにん} しても いいでしょうか。", "Antes de entregar, eu poderia confirmar o conteúdo?", words([
              { jp: "提出{ていしゅつ}", pt: "entrega" },
              { jp: "いいでしょうか", pt: "poderia? / forma mais polida" }
            ])),
            phrase("安全{あんぜん} のため、一度{いちど} 作業{さぎょう} を 止{と}めても いいですか。", "Por segurança, posso parar a tarefa uma vez?", words([
              { jp: "安全{あんぜん}", pt: "segurança" },
              { jp: "止{と}めても", pt: "parar" }
            ])),
            phrase("不明点{ふめいてん} が ある ので、先{さき}に 質問{しつもん} しても いいでしょうか。", "Como tenho um ponto não claro, poderia perguntar antes?", words([
              { jp: "不明点{ふめいてん}", pt: "ponto não claro / dúvida" },
              { jp: "質問{しつもん}", pt: "pergunta" }
            ])),
            phrase("確認{かくにん} が 取{と}れる まで、少{すこ}し 待{ま}っても いいですか。", "Posso esperar um pouco até conseguir confirmar?", words([
              { jp: "確認{かくにん} が 取{と}れる", pt: "conseguir confirmação" },
              { jp: "待{ま}っても", pt: "esperar" }
            ]))
          ]
        }
      },

      "てもらえますか": {
        id: "grammar_temoraemasu",
        label: "Uso de てもらえますか",
        kind: "gramática",
        levelGroup: "intermediario",
        tags: ["てもらえますか", "pedido", "ajuda", "poderia", "fazer para mim"],
        explanation:
          "てもらえますか é usado para pedir que alguém faça algo por você. É educado, prático e extremamente útil no Japão.",
        usage:
          "Use para pedir ajuda, explicação, confirmação, escrita no papel, verificação de documento ou suporte no trabalho.",
        commonMistake:
          "Evite pedir só com o verbo no imperativo. てもらえますか deixa o pedido mais respeitoso.",
        goal:
          "Aprender a pedir ajuda de forma educada.",
        levels: {
          iniciante: [
            phrase("手伝{てつだ}って もらえますか。", "Você poderia me ajudar?", words([
              { jp: "手伝{てつだ}って", pt: "ajudar" }
            ])),
            phrase("見{み}て もらえますか。", "Você poderia olhar para mim?", words([
              { jp: "見{み}て", pt: "ver / olhar" }
            ])),
            phrase("書{か}いて もらえますか。", "Você poderia escrever para mim?", words([
              { jp: "書{か}いて", pt: "escrever" }
            ])),
            phrase("教{おし}えて もらえますか。", "Você poderia me ensinar/explicar?", words([
              { jp: "教{おし}えて", pt: "ensinar / explicar" }
            ])),
            phrase("読{よ}んで もらえますか。", "Você poderia ler para mim?", words([
              { jp: "読{よ}んで", pt: "ler" }
            ])),
            phrase("確認{かくにん} して もらえますか。", "Você poderia verificar para mim?", words([
              { jp: "確認{かくにん}", pt: "verificação / confirmação" }
            ])),
            phrase("もう 一度{いちど} 言{い}って もらえますか。", "Você poderia dizer mais uma vez?", words([
              { jp: "一度{いちど}", pt: "uma vez" },
              { jp: "言{い}って", pt: "dizer" }
            ]))
          ],

          intermediario: [
            phrase("この 書類{しょるい} を 確認{かくにん} して もらえますか。", "Você poderia verificar este documento para mim?", words([
              { jp: "書類{しょるい}", pt: "documento" },
              { jp: "確認{かくにん}", pt: "confirmação / verificação" }
            ])),
            phrase("やり方{かた} を もう 一度{いちど} 教{おし}えて もらえますか。", "Você poderia me ensinar o modo de fazer mais uma vez?", words([
              { jp: "やり方{かた}", pt: "modo de fazer" },
              { jp: "一度{いちど}", pt: "uma vez" }
            ])),
            phrase("紙{かみ} に 書{か}いて もらえますか。", "Você poderia escrever no papel para mim?", words([
              { jp: "紙{かみ}", pt: "papel" },
              { jp: "書{か}いて", pt: "escrever" }
            ])),
            phrase("この 部品{ぶひん} が 正{ただ}しい か 見{み}て もらえますか。", "Você poderia ver se esta peça está correta?", words([
              { jp: "部品{ぶひん}", pt: "peça" },
              { jp: "正{ただ}しい", pt: "correto" }
            ])),
            phrase("もう 少{すこ}し ゆっくり 話{はな}して もらえますか。", "Você poderia falar um pouco mais devagar para mim?", words([
              { jp: "少{すこ}し", pt: "um pouco" },
              { jp: "話{はな}して", pt: "falar" }
            ])),
            phrase("この 住所{じゅうしょ} を 読{よ}んで もらえますか。", "Você poderia ler este endereço para mim?", words([
              { jp: "住所{じゅうしょ}", pt: "endereço" },
              { jp: "読{よ}んで", pt: "ler" }
            ])),
            phrase("この 内容{ないよう} で 合{あ}って いる か 確認{かくにん} して もらえますか。", "Você poderia confirmar se este conteúdo está correto?", words([
              { jp: "内容{ないよう}", pt: "conteúdo" },
              { jp: "合{あ}って いる", pt: "está correto" }
            ]))
          ],

          avancado: [
            phrase("念{ねん}のため、この 内容{ないよう} を もう 一度{いちど} 確認{かくにん} して もらえますか。", "Por precaução, você poderia confirmar este conteúdo mais uma vez para mim?", words([
              { jp: "念{ねん}のため", pt: "por precaução" },
              { jp: "内容{ないよう}", pt: "conteúdo" }
            ])),
            phrase("提出{ていしゅつ} する 前{まえ} に、書類{しょるい} に 不備{ふび} が ない か 見{み}て もらえますか。", "Antes de entregar, você poderia ver se não há pendência no documento?", words([
              { jp: "提出{ていしゅつ}", pt: "entrega" },
              { jp: "不備{ふび}", pt: "falha / pendência" }
            ])),
            phrase("安全{あんぜん} に 関{かか}わる こと なので、手順{てじゅん} を 確認{かくにん} して もらえますか。", "Como é algo relacionado à segurança, você poderia confirmar o procedimento para mim?", words([
              { jp: "安全{あんぜん}", pt: "segurança" },
              { jp: "手順{てじゅん}", pt: "procedimento" }
            ])),
            phrase("日本語{にほんご} の 表現{ひょうげん} が 自然{しぜん} かどうか 見{み}て もらえますか。", "Você poderia ver se esta expressão em japonês está natural?", words([
              { jp: "表現{ひょうげん}", pt: "expressão" },
              { jp: "自然{しぜん}", pt: "natural" }
            ])),
            phrase("この 説明{せつめい} で 相手{あいて} に 伝{つた}わる か 確認{かくにん} して もらえますか。", "Você poderia confirmar se esta explicação será entendida pela outra pessoa?", words([
              { jp: "相手{あいて}", pt: "outra pessoa / interlocutor" },
              { jp: "伝{つた}わる", pt: "ser transmitido / ser entendido" }
            ])),
            phrase("可能{かのう} で あれば、もう 少{すこ}し 簡単{かんたん} な 言{い}い方{かた} に して もらえますか。", "Se possível, você poderia transformar em uma forma um pouco mais simples de dizer?", words([
              { jp: "可能{かのう} で あれば", pt: "se possível" },
              { jp: "言{い}い方{かた}", pt: "modo de dizer" }
            ])),
            phrase("確認後{かくにんご}、問題{もんだい} が あれば 教{おし}えて もらえますか。", "Depois da verificação, se houver problema, você poderia me avisar?", words([
              { jp: "確認後{かくにんご}", pt: "depois da confirmação" },
              { jp: "問題{もんだい}", pt: "problema" }
            ]))
          ]
        }
      },

      "ないといけない": {
        id: "grammar_naitoikenai",
        label: "Uso de ないといけない",
        kind: "gramática",
        levelGroup: "intermediario",
        tags: ["ないといけない", "tenho que", "preciso", "obrigação"],
        explanation:
          "ないといけない indica obrigação: “tenho que...”, “preciso...”. É muito usado na fala cotidiana.",
        usage:
          "Use para falar de tarefas, horários, documentos, trabalho, remédio e responsabilidades.",
        commonMistake:
          "Na conversa casual pode virar ないと. Em situações formais, use ないといけません ou ないといけないです.",
        goal:
          "Aprender a falar de obrigações sem traduzir palavra por palavra.",
        levels: {
          iniciante: [
            phrase("今日{きょう} は 早{はや}く 寝{ね}ないといけないです。", "Hoje eu tenho que dormir cedo.", words([
              { jp: "寝{ね}ないといけない", pt: "tenho que dormir" }
            ])),
            phrase("明日{あした}、市役所{しやくしょ} に 行{い}かないといけないです。", "Amanhã tenho que ir à prefeitura.", words([
              { jp: "市役所{しやくしょ}", pt: "prefeitura" }
            ])),
            phrase("この 書類{しょるい} を 出{だ}さないといけないです。", "Tenho que entregar este documento.", words([
              { jp: "書類{しょるい}", pt: "documento" }
            ])),
            phrase("薬{くすり} を 飲{の}まないといけないです。", "Tenho que tomar o remédio.", words([
              { jp: "薬{くすり}", pt: "remédio" }
            ])),
            phrase("明日{あした} まで に 連絡{れんらく} しないといけないです。", "Tenho que entrar em contato até amanhã.", words([
              { jp: "連絡{れんらく}", pt: "contato" }
            ])),
            phrase("ヘルメット を かぶらないといけないです。", "Tenho que usar capacete.", words([
              { jp: "ヘルメット", pt: "capacete" }
            ])),
            phrase("日本語{にほんご} を 練習{れんしゅう} しないといけないです。", "Tenho que praticar japonês.", words([
              { jp: "練習{れんしゅう}", pt: "prática" }
            ]))
          ],

          intermediario: [
            phrase("今日中{きょうじゅう} に この 作業{さぎょう} を 終{お}わらせないといけないです。", "Tenho que terminar esta tarefa ainda hoje.", words([
              { jp: "今日中{きょうじゅう}", pt: "ainda hoje" },
              { jp: "作業{さぎょう}", pt: "tarefa / trabalho" }
            ])),
            phrase("会社{かいしゃ} に 診断書{しんだんしょ} を 出{だ}さないといけないです。", "Tenho que entregar o atestado médico na empresa.", words([
              { jp: "会社{かいしゃ}", pt: "empresa" },
              { jp: "診断書{しんだんしょ}", pt: "atestado médico" }
            ])),
            phrase("住所{じゅうしょ} が 変{か}わった ので、市役所{しやくしょ} に 行{い}かないといけないです。", "Como o endereço mudou, tenho que ir à prefeitura.", words([
              { jp: "住所{じゅうしょ}", pt: "endereço" },
              { jp: "変{か}わった", pt: "mudou" }
            ])),
            phrase("この 内容{ないよう} を 先{さき}に 確認{かくにん} しないといけないです。", "Tenho que confirmar este conteúdo antes.", words([
              { jp: "内容{ないよう}", pt: "conteúdo" },
              { jp: "先{さき}に", pt: "antes" }
            ])),
            phrase("明日{あした} まで に 支払{しはら}い を しないといけないです。", "Tenho que fazer o pagamento até amanhã.", words([
              { jp: "支払{しはら}い", pt: "pagamento" }
            ])),
            phrase("安全{あんぜん} ルール を 守{まも}らないといけないです。", "Tenho que respeitar as regras de segurança.", words([
              { jp: "安全{あんぜん}", pt: "segurança" },
              { jp: "守{まも}る", pt: "respeitar / proteger" }
            ])),
            phrase("次{つぎ} の 更新{こうしん} まで に 準備{じゅんび} しないといけないです。", "Tenho que preparar até a próxima renovação.", words([
              { jp: "更新{こうしん}", pt: "renovação" },
              { jp: "準備{じゅんび}", pt: "preparação" }
            ]))
          ],

          avancado: [
            phrase("手続{てつづ}き の 期限{きげん} が 近{ちか}い ので、早{はや}め に 準備{じゅんび} しないといけません。", "Como o prazo do procedimento está próximo, preciso me preparar com antecedência.", words([
              { jp: "手続{てつづ}き", pt: "procedimento" },
              { jp: "期限{きげん}", pt: "prazo" },
              { jp: "早{はや}め に", pt: "com antecedência" }
            ])),
            phrase("安全{あんぜん} に 関{かか}わる こと なので、少{すこ}しでも 不安{ふあん} が あれば 確認{かくにん} しないといけません。", "Como é algo relacionado à segurança, se houver qualquer preocupação preciso confirmar.", words([
              { jp: "関{かか}わる", pt: "estar relacionado" },
              { jp: "不安{ふあん}", pt: "preocupação / insegurança" }
            ])),
            phrase("書類{しょるい} に 不備{ふび} が ない ように、提出前{ていしゅつまえ} に 確認{かくにん} しないといけません。", "Para não haver pendência no documento, preciso confirmar antes de entregar.", words([
              { jp: "不備{ふび}", pt: "falha / pendência" },
              { jp: "提出前{ていしゅつまえ}", pt: "antes da entrega" }
            ])),
            phrase("予定{よてい} が 変更{へんこう} に なった 場合{ばあい} は、すぐ に 連絡{れんらく} しないといけません。", "Caso a programação mude, preciso entrar em contato imediatamente.", words([
              { jp: "場合{ばあい}", pt: "caso / situação" },
              { jp: "変更{へんこう}", pt: "alteração" }
            ])),
            phrase("誤解{ごかい} が ない ように、もう 少{すこ}し 丁寧{ていねい} に 説明{せつめい} しないといけません。", "Para não haver mal-entendido, preciso explicar de forma um pouco mais cuidadosa.", words([
              { jp: "誤解{ごかい}", pt: "mal-entendido" },
              { jp: "丁寧{ていねい}", pt: "educado / cuidadoso" }
            ])),
            phrase("契約内容{けいやくないよう} を よく 読{よ}んで から 判断{はんだん} しないといけません。", "Preciso decidir depois de ler bem o conteúdo do contrato.", words([
              { jp: "契約内容{けいやくないよう}", pt: "conteúdo do contrato" },
              { jp: "判断{はんだん}", pt: "decisão / julgamento" }
            ])),
            phrase("自分{じぶん} だけ で 判断{はんだん} せず、担当者{たんとうしゃ} に 確認{かくにん} しないといけません。", "Não devo decidir sozinho; preciso confirmar com o responsável.", words([
              { jp: "自分{じぶん} だけ", pt: "sozinho / apenas eu" },
              { jp: "担当者{たんとうしゃ}", pt: "responsável" }
            ]))
          ]
        }
      },

      "たほうがいい": {
        id: "grammar_tahougaii",
        label: "Uso de たほうがいい",
        kind: "gramática",
        levelGroup: "intermediario",
        tags: ["たほうがいい", "melhor fazer", "recomendação", "conselho"],
        explanation:
          "たほうがいい significa “é melhor fazer...”. É usado para dar conselho ou falar o que parece mais adequado.",
        usage:
          "Use para recomendações sobre saúde, trabalho, documentos, segurança, pagamento e decisões práticas.",
        commonMistake:
          "Não use para mandar de forma autoritária. O tom precisa soar como conselho.",
        goal:
          "Aprender a dar e entender recomendações.",
        levels: {
          iniciante: [
            phrase("早{はや}く 寝{ね}た ほう が いいです。", "É melhor dormir cedo.", words([
              { jp: "早{はや}く", pt: "cedo" },
              { jp: "寝{ね}た", pt: "dormiu / dormir" }
            ])),
            phrase("病院{びょういん} に 行{い}った ほう が いいです。", "É melhor ir ao hospital.", words([
              { jp: "病院{びょういん}", pt: "hospital" }
            ])),
            phrase("水{みず} を 飲{の}んだ ほう が いいです。", "É melhor beber água.", words([
              { jp: "水{みず}", pt: "água" },
              { jp: "飲{の}んだ", pt: "bebeu / beber" }
            ])),
            phrase("確認{かくにん} した ほう が いいです。", "É melhor confirmar.", words([
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("休{やす}んだ ほう が いいです。", "É melhor descansar.", words([
              { jp: "休{やす}んだ", pt: "descansou / descansar" }
            ])),
            phrase("聞{き}いた ほう が いいです。", "É melhor perguntar.", words([
              { jp: "聞{き}いた", pt: "perguntou / perguntar" }
            ])),
            phrase("メモ した ほう が いいです。", "É melhor anotar.", words([
              { jp: "メモ", pt: "anotação" }
            ]))
          ],

          intermediario: [
            phrase("わからない 時{とき} は、先{さき}に 確認{かくにん} した ほう が いいです。", "Quando não entender, é melhor confirmar antes.", words([
              { jp: "時{とき}", pt: "quando / momento" },
              { jp: "先{さき}に", pt: "antes" }
            ])),
            phrase("体調{たいちょう} が 悪{わる}い なら、無理{むり} しない ほう が いいです。", "Se está se sentindo mal, é melhor não forçar.", words([
              { jp: "体調{たいちょう}", pt: "condição física" },
              { jp: "無理{むり} しない", pt: "não forçar" }
            ])),
            phrase("この 書類{しょるい} は コピー を 取{と}った ほう が いいです。", "É melhor tirar cópia deste documento.", words([
              { jp: "書類{しょるい}", pt: "documento" },
              { jp: "コピー を 取{と}る", pt: "tirar cópia" }
            ])),
            phrase("雨{あめ} が 強{つよ}い ので、今日は 自転車{じてんしゃ} で 行{い}かない ほう が いいです。", "Como a chuva está forte, hoje é melhor não ir de bicicleta.", words([
              { jp: "強{つよ}い", pt: "forte" },
              { jp: "自転車{じてんしゃ}", pt: "bicicleta" }
            ])),
            phrase("高{たか}い 買{か}い物{もの} なので、よく 考{かんが}えた ほう が いいです。", "Como é uma compra cara, é melhor pensar bem.", words([
              { jp: "高{たか}い", pt: "caro" },
              { jp: "考{かんが}えた", pt: "pensou / pensar" }
            ])),
            phrase("会社{かいしゃ} に 連絡{れんらく} した ほう が いいです。", "É melhor entrar em contato com a empresa.", words([
              { jp: "会社{かいしゃ}", pt: "empresa" },
              { jp: "連絡{れんらく}", pt: "contato" }
            ])),
            phrase("わからない まま 進{すす}めない ほう が いいです。", "É melhor não continuar sem entender.", words([
              { jp: "進{すす}めない", pt: "não avançar / não continuar" }
            ]))
          ],

          avancado: [
            phrase("安全{あんぜん} に 関{かか}わる 作業{さぎょう} なので、少{すこ}しでも 不安{ふあん} が あれば 確認{かくにん} した ほう が いいです。", "Como é uma tarefa relacionada à segurança, se houver qualquer insegurança é melhor confirmar.", words([
              { jp: "安全{あんぜん}", pt: "segurança" },
              { jp: "関{かか}わる", pt: "estar relacionado" }
            ])),
            phrase("契約{けいやく} の 内容{ないよう} は、サイン する 前{まえ} に 必{かなら}ず 確認{かくにん} した ほう が いいです。", "É melhor confirmar sem falta o conteúdo do contrato antes de assinar.", words([
              { jp: "契約{けいやく}", pt: "contrato" },
              { jp: "サイン", pt: "assinatura" }
            ])),
            phrase("説明{せつめい} が わかりにくい 場合{ばあい} は、簡単{かんたん} な 言葉{ことば} で 言{い}い直{なお}して もらった ほう が いいです。", "Se a explicação estiver difícil de entender, é melhor pedir para reformular com palavras simples.", words([
              { jp: "場合{ばあい}", pt: "caso / situação" },
              { jp: "言{い}い直{なお}す", pt: "reformular / dizer de novo" }
            ])),
            phrase("大事{だいじ} な 内容{ないよう} なので、口頭{こうとう} だけ でなく 紙{かみ} に 書{か}いて もらった ほう が いいです。", "Como é um conteúdo importante, é melhor pedir para escrever no papel, não apenas falar.", words([
              { jp: "口頭{こうとう}", pt: "oralmente" },
              { jp: "紙{かみ}", pt: "papel" }
            ])),
            phrase("判断{はんだん} に 迷{まよ}う 時{とき} は、一人{ひとり} で 決{き}めない ほう が いいです。", "Quando ficar em dúvida sobre a decisão, é melhor não decidir sozinho.", words([
              { jp: "判断{はんだん}", pt: "decisão / julgamento" },
              { jp: "迷{まよ}う", pt: "ficar em dúvida" }
            ])),
            phrase("症状{しょうじょう} が 続{つづ}く 場合{ばあい} は、早{はや}め に 病院{びょういん} へ 行{い}った ほう が いいです。", "Caso os sintomas continuem, é melhor ir ao hospital cedo.", words([
              { jp: "症状{しょうじょう}", pt: "sintoma" },
              { jp: "続{つづ}く", pt: "continuar" }
            ])),
            phrase("相手{あいて} に 誤解{ごかい} されない ように、もう 少{すこ}し 丁寧{ていねい} に 説明{せつめい} した ほう が いいです。", "Para não ser mal interpretado pela outra pessoa, é melhor explicar de forma um pouco mais educada.", words([
              { jp: "相手{あいて}", pt: "outra pessoa" },
              { jp: "誤解{ごかい}", pt: "mal-entendido" },
              { jp: "丁寧{ていねい}", pt: "educado / cuidadoso" }
            ]))
          ]
        }
      },

      "やってみる": {
        id: "grammar_yattemiru",
        label: "Uso de やってみる",
        kind: "expressão",
        levelGroup: "intermediario",
        tags: ["やってみる", "tentar", "experimentar", "fazer para ver"],
        explanation:
          "やってみる significa “tentar fazer”, “experimentar fazer” ou “fazer para ver como é”.",
        usage:
          "Use quando você quer tentar uma tarefa, aprender algo novo, testar um método ou mostrar disposição.",
        commonMistake:
          "Não é apenas “ver”. O みる aqui dá ideia de tentar/experimentar uma ação.",
        goal:
          "Aprender a dizer que vai tentar fazer algo.",
        levels: {
          iniciante: [
            phrase("やってみます。", "Vou tentar fazer.", words([
              { jp: "やってみます", pt: "vou tentar fazer" }
            ])),
            phrase("もう 一度{いちど} やってみます。", "Vou tentar fazer mais uma vez.", words([
              { jp: "一度{いちど}", pt: "uma vez" }
            ])),
            phrase("自分{じぶん} で やってみます。", "Vou tentar fazer sozinho.", words([
              { jp: "自分{じぶん}", pt: "eu mesmo / sozinho" }
            ])),
            phrase("少{すこ}し やってみます。", "Vou tentar um pouco.", words([
              { jp: "少{すこ}し", pt: "um pouco" }
            ])),
            phrase("これ を やってみます。", "Vou tentar fazer isto.", words([
              { jp: "これ", pt: "isto" }
            ])),
            phrase("日本語{にほんご} で 言{い}って みます。", "Vou tentar dizer em japonês.", words([
              { jp: "日本語{にほんご}", pt: "japonês" },
              { jp: "言{い}って", pt: "dizer" }
            ])),
            phrase("聞{き}いて みます。", "Vou tentar perguntar.", words([
              { jp: "聞{き}いて", pt: "perguntar / ouvir" }
            ]))
          ],

          intermediario: [
            phrase("まず 自分{じぶん} で やってみます。", "Primeiro vou tentar fazer sozinho.", words([
              { jp: "まず", pt: "primeiro" },
              { jp: "自分{じぶん} で", pt: "por conta própria" }
            ])),
            phrase("この 方法{ほうほう} で 一度{いちど} やってみます。", "Vou tentar fazer uma vez com este método.", words([
              { jp: "方法{ほうほう}", pt: "método" }
            ])),
            phrase("わからなかったら、もう 一度{いちど} 聞{き}いて みます。", "Se eu não entender, vou tentar perguntar mais uma vez.", words([
              { jp: "わからなかったら", pt: "se eu não entender" }
            ])),
            phrase("新{あたら}しい 作業{さぎょう} なので、ゆっくり やってみます。", "Como é uma tarefa nova, vou tentar fazer devagar.", words([
              { jp: "新{あたら}しい", pt: "novo" },
              { jp: "作業{さぎょう}", pt: "tarefa / trabalho" }
            ])),
            phrase("日本語{にほんご} で 説明{せつめい} して みます。", "Vou tentar explicar em japonês.", words([
              { jp: "説明{せつめい}", pt: "explicação" }
            ])),
            phrase("この アプリ で 毎日{まいにち} 練習{れんしゅう} して みます。", "Vou tentar praticar todos os dias com este app.", words([
              { jp: "毎日{まいにち}", pt: "todos os dias" },
              { jp: "練習{れんしゅう}", pt: "prática" }
            ])),
            phrase("少{すこ}し 難{むずか}しい ですが、やってみます。", "É um pouco difícil, mas vou tentar.", words([
              { jp: "難{むずか}しい", pt: "difícil" }
            ]))
          ],

          avancado: [
            phrase("最初{さいしょ} は 難{むずか}しい かもしれません が、まず 一度{いちど} 自分{じぶん} で やってみます。", "No começo pode ser difícil, mas primeiro vou tentar fazer sozinho uma vez.", words([
              { jp: "最初{さいしょ}", pt: "começo" },
              { jp: "かもしれません", pt: "talvez" }
            ])),
            phrase("この 方法{ほうほう} が 合{あ}って いる かどうか、実際{じっさい} に やってみて 確認{かくにん} します。", "Vou tentar fazer na prática para confirmar se este método está correto.", words([
              { jp: "実際{じっさい} に", pt: "na prática / de fato" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("説明{せつめい} を 聞{き}いた だけ では わかりにくい ので、一度{いちど} やってみたいです。", "Como é difícil entender só ouvindo a explicação, quero tentar fazer uma vez.", words([
              { jp: "聞{き}いた だけ", pt: "apenas ouvindo" },
              { jp: "わかりにくい", pt: "difícil de entender" }
            ])),
            phrase("間違{まちが}い が あれば 直{なお}します ので、まず やってみても いいですか。", "Se houver erro eu corrijo, então posso tentar fazer primeiro?", words([
              { jp: "間違{まちが}い", pt: "erro" },
              { jp: "直{なお}します", pt: "vou corrigir" }
            ])),
            phrase("新{あたら}しい 表現{ひょうげん} を 覚{おぼ}える ために、会話{かいわ} の 中{なか} で 使{つか}って みます。", "Para memorizar uma nova expressão, vou tentar usá-la dentro da conversa.", words([
              { jp: "表現{ひょうげん}", pt: "expressão" },
              { jp: "会話{かいわ}", pt: "conversa" }
            ])),
            phrase("自信{じしん} は まだ ありません が、練習{れんしゅう} の ために 日本語{にほんご} で 話{はな}して みます。", "Ainda não tenho confiança, mas para praticar vou tentar falar em japonês.", words([
              { jp: "自信{じしん}", pt: "confiança" },
              { jp: "練習{れんしゅう}", pt: "prática" }
            ])),
            phrase("結果{けっか} を 見{み}ながら、少{すこ}しずつ やり方{かた} を 変{か}えて みます。", "Vou tentar mudar o modo de fazer aos poucos enquanto observo o resultado.", words([
              { jp: "結果{けっか}", pt: "resultado" },
              { jp: "少{すこ}しずつ", pt: "aos poucos" }
            ]))
          ]
        }
      },

      "と思います": {
        id: "grammar_toomoimasu",
        label: "Uso de と思います",
        kind: "gramática",
        levelGroup: "avancado",
        tags: ["と思います", "acho que", "penso que", "opinião"],
        explanation:
          "と思います é usado para dizer “acho que”, “penso que” ou expressar opinião de forma educada.",
        usage:
          "Use para dar opinião sem soar duro, principalmente no trabalho, em conversas formais e decisões.",
        commonMistake:
          "Não use para fatos óbvios demais. É melhor para opinião, impressão ou julgamento pessoal.",
        goal:
          "Aprender a expressar opinião com educação.",
        levels: {
          iniciante: [
            phrase("いい と 思{おも}います。", "Acho que está bom.", words([
              { jp: "思{おも}います", pt: "acho / penso" }
            ])),
            phrase("大丈夫{だいじょうぶ} だ と 思{おも}います。", "Acho que está tudo bem.", words([
              { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / sem problema" }
            ])),
            phrase("難{むずか}しい と 思{おも}います。", "Acho que é difícil.", words([
              { jp: "難{むずか}しい", pt: "difícil" }
            ])),
            phrase("安{やす}い と 思{おも}います。", "Acho que é barato.", words([
              { jp: "安{やす}い", pt: "barato" }
            ])),
            phrase("高{たか}い と 思{おも}います。", "Acho que é caro.", words([
              { jp: "高{たか}い", pt: "caro" }
            ])),
            phrase("必要{ひつよう} だ と 思{おも}います。", "Acho que é necessário.", words([
              { jp: "必要{ひつよう}", pt: "necessário" }
            ])),
            phrase("違{ちが}う と 思{おも}います。", "Acho que está diferente/errado.", words([
              { jp: "違{ちが}う", pt: "diferente / errado" }
            ]))
          ],

          intermediario: [
            phrase("この 方法{ほうほう} が いい と 思{おも}います。", "Acho que este método é bom.", words([
              { jp: "方法{ほうほう}", pt: "método" }
            ])),
            phrase("先{さき}に 確認{かくにん} した ほう が いい と 思{おも}います。", "Acho que é melhor confirmar antes.", words([
              { jp: "先{さき}に", pt: "antes" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("この 作業{さぎょう} は 少{すこ}し 時間{じかん} が かかる と 思{おも}います。", "Acho que esta tarefa vai levar um pouco de tempo.", words([
              { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
              { jp: "時間{じかん} が かかる", pt: "levar tempo" }
            ])),
            phrase("今日{きょう} は 残業{ざんぎょう} に なる と 思{おも}います。", "Acho que hoje vai virar hora extra.", words([
              { jp: "残業{ざんぎょう}", pt: "hora extra" }
            ])),
            phrase("この 説明{せつめい} は わかりやすい と 思{おも}います。", "Acho que esta explicação é fácil de entender.", words([
              { jp: "説明{せつめい}", pt: "explicação" },
              { jp: "わかりやすい", pt: "fácil de entender" }
            ])),
            phrase("もう 一度{いちど} 見{み}た ほう が いい と 思{おも}います。", "Acho que é melhor olhar mais uma vez.", words([
              { jp: "一度{いちど}", pt: "uma vez" }
            ])),
            phrase("この 内容{ないよう} で 問題{もんだい} ない と 思{おも}います。", "Acho que não há problema com este conteúdo.", words([
              { jp: "内容{ないよう}", pt: "conteúdo" },
              { jp: "問題{もんだい}", pt: "problema" }
            ]))
          ],

          avancado: [
            phrase("安全面{あんぜんめん} を 考{かんが}える と、先{さき}に 確認{かくにん} した ほう が いい と 思{おも}います。", "Pensando na segurança, acho melhor confirmar antes.", words([
              { jp: "安全面{あんぜんめん}", pt: "aspecto de segurança" },
              { jp: "考{かんが}える と", pt: "pensando em / considerando" }
            ])),
            phrase("この 説明{せつめい} だけ では 誤解{ごかい} される 可能性{かのうせい} が ある と 思{おも}います。", "Acho que só com esta explicação existe possibilidade de mal-entendido.", words([
              { jp: "誤解{ごかい}", pt: "mal-entendido" },
              { jp: "可能性{かのうせい}", pt: "possibilidade" }
            ])),
            phrase("今{いま} の 状況{じょうきょう} では、無理{むり} に 進{すす}めない ほう が いい と 思{おも}います。", "Na situação atual, acho melhor não prosseguir à força.", words([
              { jp: "状況{じょうきょう}", pt: "situação" },
              { jp: "無理{むり} に", pt: "à força / forçadamente" }
            ])),
            phrase("相手{あいて} に 伝{つた}わりやすい ように、もう 少{すこ}し 簡単{かんたん} に 説明{せつめい} した ほう が いい と 思{おも}います。", "Acho melhor explicar de forma um pouco mais simples para ser fácil de entender para a outra pessoa.", words([
              { jp: "相手{あいて}", pt: "outra pessoa" },
              { jp: "伝{つた}わりやすい", pt: "fácil de transmitir / entender" }
            ])),
            phrase("この 条件{じょうけん} なら、もう 少{すこ}し 比較{ひかく} して から 決{き}めた ほう が いい と 思{おも}います。", "Com estas condições, acho melhor decidir depois de comparar um pouco mais.", words([
              { jp: "条件{じょうけん}", pt: "condição" },
              { jp: "比較{ひかく}", pt: "comparação" }
            ])),
            phrase("担当者{たんとうしゃ} に 確認{かくにん} して から 判断{はんだん} する の が 一番{いちばん} 安全{あんぜん} だ と 思{おも}います。", "Acho que o mais seguro é decidir depois de confirmar com o responsável.", words([
              { jp: "担当者{たんとうしゃ}", pt: "responsável" },
              { jp: "判断{はんだん}", pt: "decisão / julgamento" }
            ])),
            phrase("日本語{にほんご} の ニュアンス を 考{かんが}える と、この 言{い}い方{かた} の ほう が 自然{しぜん} だ と 思{おも}います。", "Pensando na nuance do japonês, acho que esta forma de dizer é mais natural.", words([
              { jp: "ニュアンス", pt: "nuance" },
              { jp: "言{い}い方{かた}", pt: "modo de dizer" },
              { jp: "自然{しぜん}", pt: "natural" }
            ]))
          ]
        }
      },

      "かもしれません": {
        id: "grammar_kamoshiremasen",
        label: "Uso de かもしれません",
        kind: "gramática",
        levelGroup: "avancado",
        tags: ["かもしれません", "talvez", "pode ser", "possibilidade"],
        explanation:
          "かもしれません indica possibilidade: “talvez”, “pode ser que”. É útil para não afirmar com dureza.",
        usage:
          "Use para atrasos, problemas, sintomas, erros possíveis, previsão e situações em que você não tem certeza.",
        commonMistake:
          "Não use quando você tem certeza total. É para possibilidade ou incerteza.",
        goal:
          "Aprender a falar possibilidades de forma educada.",
        levels: {
          iniciante: [
            phrase("遅{おく}れる かもしれません。", "Talvez eu me atrase.", words([
              { jp: "遅{おく}れる", pt: "atrasar" }
            ])),
            phrase("雨{あめ} が 降{ふ}る かもしれません。", "Talvez chova.", words([
              { jp: "雨{あめ}", pt: "chuva" },
              { jp: "降{ふ}る", pt: "cair / chover" }
            ])),
            phrase("高{たか}い かもしれません。", "Talvez seja caro.", words([
              { jp: "高{たか}い", pt: "caro" }
            ])),
            phrase("必要{ひつよう} かもしれません。", "Talvez seja necessário.", words([
              { jp: "必要{ひつよう}", pt: "necessário" }
            ])),
            phrase("難{むずか}しい かもしれません。", "Talvez seja difícil.", words([
              { jp: "難{むずか}しい", pt: "difícil" }
            ])),
            phrase("違{ちが}う かもしれません。", "Talvez esteja diferente/errado.", words([
              { jp: "違{ちが}う", pt: "diferente / errado" }
            ])),
            phrase("できる かもしれません。", "Talvez eu consiga.", words([
              { jp: "できる", pt: "conseguir / poder fazer" }
            ]))
          ],

          intermediario: [
            phrase("電車{でんしゃ} が 遅{おく}れて いる ので、少{すこ}し 遅{おく}れる かもしれません。", "Como o trem está atrasado, talvez eu me atrase um pouco.", words([
              { jp: "電車{でんしゃ}", pt: "trem" },
              { jp: "遅{おく}れて いる", pt: "está atrasado" }
            ])),
            phrase("この 部品{ぶひん} は 不良品{ふりょうひん} かもしれません。", "Talvez esta peça seja defeituosa.", words([
              { jp: "部品{ぶひん}", pt: "peça" },
              { jp: "不良品{ふりょうひん}", pt: "produto defeituoso" }
            ])),
            phrase("この 書類{しょるい} は コピー が 必要{ひつよう} かもしれません。", "Talvez este documento precise de cópia.", words([
              { jp: "書類{しょるい}", pt: "documento" },
              { jp: "コピー", pt: "cópia" }
            ])),
            phrase("今日{きょう} は 残業{ざんぎょう} に なる かもしれません。", "Talvez hoje vire hora extra.", words([
              { jp: "残業{ざんぎょう}", pt: "hora extra" }
            ])),
            phrase("この 方法{ほうほう} は 少{すこ}し 難{むずか}しい かもしれません。", "Talvez este método seja um pouco difícil.", words([
              { jp: "方法{ほうほう}", pt: "método" }
            ])),
            phrase("薬{くすり} が 合{あ}わない かもしれません。", "Talvez o remédio não esteja combinando comigo.", words([
              { jp: "薬{くすり}", pt: "remédio" },
              { jp: "合{あ}わない", pt: "não combinar / não servir" }
            ])),
            phrase("明日{あした} は 休{やす}めない かもしれません。", "Talvez eu não consiga folgar amanhã.", words([
              { jp: "休{やす}めない", pt: "não conseguir folgar" }
            ]))
          ],

          avancado: [
            phrase("この 内容{ないよう} だと、相手{あいて} に 誤解{ごかい} される かもしれません。", "Com este conteúdo, talvez a outra pessoa entenda errado.", words([
              { jp: "内容{ないよう}", pt: "conteúdo" },
              { jp: "誤解{ごかい}", pt: "mal-entendido" }
            ])),
            phrase("手続{てつづ}き に 必要{ひつよう} な 書類{しょるい} が 足{た}りない かもしれません。", "Talvez falte algum documento necessário para o procedimento.", words([
              { jp: "手続{てつづ}き", pt: "procedimento" },
              { jp: "足{た}りない", pt: "faltar / não ser suficiente" }
            ])),
            phrase("予定{よてい} より 時間{じかん} が かかる かもしれません。", "Talvez leve mais tempo do que o previsto.", words([
              { jp: "予定{よてい}", pt: "previsão / programação" },
              { jp: "時間{じかん} が かかる", pt: "levar tempo" }
            ])),
            phrase("この 表現{ひょうげん} は 少{すこ}し 硬{かた}く 聞{き}こえる かもしれません。", "Esta expressão talvez soe um pouco rígida/formal demais.", words([
              { jp: "表現{ひょうげん}", pt: "expressão" },
              { jp: "硬{かた}く 聞{き}こえる", pt: "soar rígido / duro" }
            ])),
            phrase("今{いま} の 状況{じょうきょう} では、すぐ に 判断{はんだん} する の は 難{むずか}しい かもしれません。", "Na situação atual, talvez seja difícil decidir imediatamente.", words([
              { jp: "状況{じょうきょう}", pt: "situação" },
              { jp: "判断{はんだん}", pt: "decisão / julgamento" }
            ])),
            phrase("体調{たいちょう} が 戻{もど}る まで、少{すこ}し 時間{じかん} が かかる かもしれません。", "Talvez leve um pouco de tempo até minha condição física voltar ao normal.", words([
              { jp: "体調{たいちょう}", pt: "condição física" },
              { jp: "戻{もど}る", pt: "voltar" }
            ])),
            phrase("担当者{たんとうしゃ} に 確認{かくにん} しない と、正確{せいかく} な こと は わからない かもしれません。", "Sem confirmar com o responsável, talvez não dê para saber com precisão.", words([
              { jp: "担当者{たんとうしゃ}", pt: "responsável" },
              { jp: "正確{せいかく}", pt: "preciso / exato" }
            ]))
          ]
        }
      },

      "ようにしています": {
        id: "grammar_younishiteimasu",
        label: "Uso de ようにしています",
        kind: "gramática",
        levelGroup: "avancado",
        tags: ["ようにしています", "procuro fazer", "hábito", "esforço"],
        explanation:
          "ようにしています indica esforço contínuo ou hábito consciente: “procuro fazer”, “tenho tentado fazer”.",
        usage:
          "Use para falar de hábitos, estudo, saúde, segurança, trabalho e disciplina pessoal.",
        commonMistake:
          "Não é uma ação única. É algo que você tenta manter como hábito.",
        goal:
          "Aprender a falar de esforço e hábitos positivos.",
        levels: {
          iniciante: [
            phrase("毎日{まいにち} 日本語{にほんご} を 聞{き}く ようにしています。", "Procuro ouvir japonês todos os dias.", words([
              { jp: "毎日{まいにち}", pt: "todos os dias" },
              { jp: "聞{き}く", pt: "ouvir" }
            ])),
            phrase("早{はや}く 寝{ね}る ようにしています。", "Procuro dormir cedo.", words([
              { jp: "早{はや}く", pt: "cedo" },
              { jp: "寝{ね}る", pt: "dormir" }
            ])),
            phrase("水{みず} を 飲{の}む ようにしています。", "Procuro beber água.", words([
              { jp: "水{みず}", pt: "água" },
              { jp: "飲{の}む", pt: "beber" }
            ])),
            phrase("メモ する ようにしています。", "Procuro anotar.", words([
              { jp: "メモ", pt: "anotação" }
            ])),
            phrase("確認{かくにん} する ようにしています。", "Procuro confirmar.", words([
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("ゆっくり 話{はな}す ようにしています。", "Procuro falar devagar.", words([
              { jp: "話{はな}す", pt: "falar" }
            ])),
            phrase("毎日{まいにち} 少{すこ}し 練習{れんしゅう} する ようにしています。", "Procuro praticar um pouco todos os dias.", words([
              { jp: "練習{れんしゅう}", pt: "prática" }
            ]))
          ],

          intermediario: [
            phrase("仕事{しごと} の 前{まえ} に、必要{ひつよう} な こと を 確認{かくにん} する ようにしています。", "Antes do trabalho, procuro confirmar o que é necessário.", words([
              { jp: "仕事{しごと}", pt: "trabalho" },
              { jp: "必要{ひつよう}", pt: "necessário" }
            ])),
            phrase("わからない こと は、そのまま に しない で 聞{き}く ようにしています。", "Quando há algo que não entendo, procuro perguntar em vez de deixar assim.", words([
              { jp: "そのまま", pt: "do jeito que está" },
              { jp: "聞{き}く", pt: "perguntar" }
            ])),
            phrase("新{あたら}しい 言葉{ことば} は、例文{れいぶん} と 一緒{いっしょ} に 覚{おぼ}える ようにしています。", "Procuro memorizar palavras novas junto com frases de exemplo.", words([
              { jp: "言葉{ことば}", pt: "palavra" },
              { jp: "例文{れいぶん}", pt: "frase de exemplo" }
            ])),
            phrase("体調{たいちょう} が 悪{わる}い 時{とき} は、無理{むり} しない ようにしています。", "Quando estou me sentindo mal, procuro não forçar.", words([
              { jp: "体調{たいちょう}", pt: "condição física" },
              { jp: "無理{むり} しない", pt: "não forçar" }
            ])),
            phrase("大事{だいじ} な 内容{ないよう} は、紙{かみ} に 書{か}いて もらう ようにしています。", "Quando é algo importante, procuro pedir para escrever no papel.", words([
              { jp: "大事{だいじ}", pt: "importante" },
              { jp: "紙{かみ}", pt: "papel" }
            ])),
            phrase("間違{まちが}い を 減{へ}らす ために、先{さき}に 確認{かくにん} する ようにしています。", "Para diminuir erros, procuro confirmar antes.", words([
              { jp: "間違{まちが}い", pt: "erro" },
              { jp: "減{へ}らす", pt: "diminuir" }
            ])),
            phrase("毎日{まいにち} 一{ひと}つ だけ 新{あたら}しい 表現{ひょうげん} を 使{つか}う ようにしています。", "Procuro usar apenas uma expressão nova por dia.", words([
              { jp: "表現{ひょうげん}", pt: "expressão" },
              { jp: "使{つか}う", pt: "usar" }
            ]))
          ],

          avancado: [
            phrase("誤解{ごかい} を 避{さ}ける ために、大事{だいじ} な 内容{ないよう} は 必{かなら}ず 確認{かくにん} する ようにしています。", "Para evitar mal-entendido, procuro sempre confirmar conteúdos importantes.", words([
              { jp: "誤解{ごかい}", pt: "mal-entendido" },
              { jp: "避{さ}ける", pt: "evitar" }
            ])),
            phrase("日本語{にほんご} で 話{はな}す 時{とき} は、できるだけ 簡単{かんたん} で 自然{しぜん} な 表現{ひょうげん} を 使{つか}う ようにしています。", "Quando falo em japonês, procuro usar expressões simples e naturais sempre que possível.", words([
              { jp: "できるだけ", pt: "sempre que possível" },
              { jp: "自然{しぜん}", pt: "natural" }
            ])),
            phrase("仕事{しごと} では、安全{あんぜん} に 関{かか}わる こと を 自分{じぶん} だけ で 判断{はんだん} しない ようにしています。", "No trabalho, procuro não decidir sozinho coisas relacionadas à segurança.", words([
              { jp: "関{かか}わる", pt: "estar relacionado" },
              { jp: "判断{はんだん}", pt: "decisão / julgamento" }
            ])),
            phrase("説明{せつめい} が 長{なが}い 時{とき} は、要点{ようてん} を メモ する ようにしています。", "Quando a explicação é longa, procuro anotar os pontos principais.", words([
              { jp: "要点{ようてん}", pt: "ponto principal" },
              { jp: "長{なが}い", pt: "longo" }
            ])),
            phrase("新{あたら}しい 文法{ぶんぽう} は、意味{いみ} だけ でなく 使{つか}う 場面{ばめん} も 覚{おぼ}える ようにしています。", "Quando aprendo uma gramática nova, procuro memorizar não só o significado, mas também a situação de uso.", words([
              { jp: "文法{ぶんぽう}", pt: "gramática" },
              { jp: "場面{ばめん}", pt: "situação / cena" }
            ])),
            phrase("相手{あいて} に 失礼{しつれい} に 聞{き}こえない ように、言{い}い方{かた} に 気{き}をつける ようにしています。", "Procuro tomar cuidado com o modo de falar para não soar indelicado para a outra pessoa.", words([
              { jp: "失礼{しつれい}", pt: "indelicado / falta de educação" },
              { jp: "気{き}をつける", pt: "tomar cuidado" }
            ])),
            phrase("忙{いそが}しい 日{ひ} でも、短{みじか}い フレーズ を 一{ひと}つ だけ 復習{ふくしゅう} する ようにしています。", "Mesmo em dias corridos, procuro revisar pelo menos uma frase curta.", words([
              { jp: "忙{いそが}しい", pt: "ocupado / corrido" },
              { jp: "復習{ふくしゅう}", pt: "revisão" }
            ]))
          ]
        }
      },
            "気づかせる": {
        id: "grammar_kizukaseru",
        label: "Uso de 気づかせる",
        kind: "expressão avançada",
        levelGroup: "avancado",
        tags: ["気づかせる", "perceber", "fazer perceber", "tomar consciência"],
        explanation:
          "気づかせる significa fazer alguém perceber algo, levar alguém a notar ou tomar consciência de uma situação.",
        usage:
          "Use em contextos mais avançados, como aprendizado, reflexão, erro, conselho, mudança de comportamento e percepção.",
        commonMistake:
          "Não é simplesmente perceber. Perceber é 気づく. Fazer alguém perceber é 気づかせる.",
        goal:
          "Aprender uma expressão avançada para falar de percepção e aprendizado.",
        levels: {
          iniciante: [
            phrase(
              "先生{せんせい} は 私{わたし} に 間違{まちが}い を 気{き}づかせました。",
              "O professor me fez perceber o erro.",
              words([
                { jp: "先生{せんせい}", pt: "professor" },
                { jp: "間違{まちが}い", pt: "erro" },
                { jp: "気{き}づかせました", pt: "fez perceber" }
              ])
            ),
            phrase(
              "この 経験{けいけん} は 私{わたし} に 大切{たいせつ} な こと を 気{き}づかせました。",
              "Esta experiência me fez perceber algo importante.",
              words([
                { jp: "経験{けいけん}", pt: "experiência" },
                { jp: "大切{たいせつ}", pt: "importante" }
              ])
            ),
            phrase(
              "失敗{しっぱい} が 私{わたし} に 問題{もんだい} を 気{き}づかせました。",
              "A falha me fez perceber o problema.",
              words([
                { jp: "失敗{しっぱい}", pt: "falha / fracasso" },
                { jp: "問題{もんだい}", pt: "problema" }
              ])
            ),
            phrase(
              "友達{ともだち} の 言葉{ことば} が 私{わたし} に 気{き}づかせました。",
              "As palavras do meu amigo me fizeram perceber.",
              words([
                { jp: "友達{ともだち}", pt: "amigo" },
                { jp: "言葉{ことば}", pt: "palavras" }
              ])
            ),
            phrase(
              "仕事{しごと} は 私{わたし} に 責任{せきにん} を 気{き}づかせました。",
              "O trabalho me fez perceber a responsabilidade.",
              words([
                { jp: "仕事{しごと}", pt: "trabalho" },
                { jp: "責任{せきにん}", pt: "responsabilidade" }
              ])
            ),
            phrase(
              "日本{にほん} の 生活{せいかつ} は 私{わたし} に 多{おお}く の こと を 気{き}づかせました。",
              "A vida no Japão me fez perceber muitas coisas.",
              words([
                { jp: "生活{せいかつ}", pt: "vida / cotidiano" },
                { jp: "多{おお}く", pt: "muito / muitos" }
              ])
            ),
            phrase(
              "この アプリ は 私{わたし} に 毎日{まいにち} の 練習{れんしゅう} の 大切{たいせつ}さ を 気{き}づかせました。",
              "Este app me fez perceber a importância da prática diária.",
              words([
                { jp: "毎日{まいにち}", pt: "todos os dias" },
                { jp: "練習{れんしゅう}", pt: "prática" }
              ])
            )
          ],

          intermediario: [
            phrase(
              "上司{じょうし} の アドバイス が、自分{じぶん} の 確認不足{かくにんぶそく} に 気{き}づかせて くれました。",
              "O conselho do chefe me fez perceber minha falta de confirmação.",
              words([
                { jp: "上司{じょうし}", pt: "chefe / superior" },
                { jp: "確認不足{かくにんぶそく}", pt: "falta de confirmação" }
              ])
            ),
            phrase(
              "ミス を した こと で、作業前{さぎょうまえ} の 確認{かくにん} が 大切{たいせつ} だ と 気{き}づかされました。",
              "Ao cometer erro, fui levado a perceber que confirmar antes da tarefa é importante.",
              words([
                { jp: "ミス", pt: "erro" },
                { jp: "作業前{さぎょうまえ}", pt: "antes da tarefa" },
                { jp: "気{き}づかされました", pt: "fui levado a perceber" }
              ])
            ),
            phrase(
              "日本語{にほんご} が 通{つう}じなかった 経験{けいけん} が、勉強{べんきょう} の 必要性{ひつようせい} に 気{き}づかせました。",
              "A experiência de não conseguir se comunicar em japonês me fez perceber a necessidade de estudar.",
              words([
                { jp: "通{つう}じなかった", pt: "não comunicou / não foi entendido" },
                { jp: "必要性{ひつようせい}", pt: "necessidade" }
              ])
            ),
            phrase(
              "体調{たいちょう} を 崩{くず}した こと が、休{やす}む こと の 大切{たいせつ}さ を 気{き}づかせました。",
              "Ficar mal de saúde me fez perceber a importância de descansar.",
              words([
                { jp: "体調{たいちょう} を 崩{くず}した", pt: "ficar mal de saúde" },
                { jp: "休{やす}む", pt: "descansar" }
              ])
            ),
            phrase(
              "子供{こども} の 一言{ひとこと} が、家族{かぞく} と 過{す}ごす 時間{じかん} の 大切{たいせつ}さ に 気{き}づかせました。",
              "Uma palavra do meu filho me fez perceber a importância do tempo com a família.",
              words([
                { jp: "一言{ひとこと}", pt: "uma palavra / comentário" },
                { jp: "過{す}ごす", pt: "passar tempo" }
              ])
            ),
            phrase(
              "先輩{せんぱい} の 行動{こうどう} が、仕事{しごと} で の 責任感{せきにんかん} を 気{き}づかせて くれました。",
              "A atitude do veterano me fez perceber o senso de responsabilidade no trabalho.",
              words([
                { jp: "先輩{せんぱい}", pt: "veterano / colega mais experiente" },
                { jp: "責任感{せきにんかん}", pt: "senso de responsabilidade" }
              ])
            ),
            phrase(
              "失敗{しっぱい} は 悪{わる}い こと だけ では なく、大切{たいせつ} な こと に 気{き}づかせて くれます。",
              "O fracasso não é apenas algo ruim; ele nos faz perceber coisas importantes.",
              words([
                { jp: "失敗{しっぱい}", pt: "fracasso / falha" },
                { jp: "悪{わる}い", pt: "ruim" }
              ])
            )
          ],

          avancado: [
            phrase(
              "日本{にほん} で の 生活{せいかつ} は、自分{じぶん} が どれ だけ 言葉{ことば} に 頼{たよ}って いた か を 気{き}づかせて くれました。",
              "A vida no Japão me fez perceber o quanto eu dependia das palavras.",
              words([
                { jp: "生活{せいかつ}", pt: "vida / cotidiano" },
                { jp: "頼{たよ}って いた", pt: "dependia" }
              ])
            ),
            phrase(
              "長時間{ちょうじかん} の 仕事{しごと} は、体力{たいりょく} だけ でなく 心{こころ} の 管理{かんり} も 必要{ひつよう} だ と 気{き}づかせました。",
              "O trabalho de longas horas me fez perceber que não é preciso apenas força física, mas também cuidar da mente.",
              words([
                { jp: "長時間{ちょうじかん}", pt: "longas horas" },
                { jp: "体力{たいりょく}", pt: "força física" },
                { jp: "心{こころ} の 管理{かんり}", pt: "cuidado/gestão da mente" }
              ])
            ),
            phrase(
              "相手{あいて} に 伝{つた}わらない 経験{けいけん} が、簡単{かんたん} な 表現{ひょうげん} で 話{はな}す 大切{たいせつ}さ を 気{き}づかせて くれました。",
              "A experiência de não ser entendido me fez perceber a importância de falar com expressões simples.",
              words([
                { jp: "伝{つた}わらない", pt: "não ser transmitido / não ser entendido" },
                { jp: "表現{ひょうげん}", pt: "expressão" }
              ])
            ),
            phrase(
              "言葉{ことば} の 壁{かべ} は、不便{ふべん} さ だけ でなく、自分{じぶん} を 成長{せいちょう} させる きっかけ にも 気{き}づかせて くれます。",
              "A barreira do idioma nos faz perceber não só a dificuldade, mas também a chance de crescimento.",
              words([
                { jp: "壁{かべ}", pt: "barreira" },
                { jp: "不便{ふべん}", pt: "inconveniência" },
                { jp: "成長{せいちょう}", pt: "crescimento" },
                { jp: "きっかけ", pt: "gatilho / oportunidade" }
              ])
            ),
            phrase(
              "日本{にほん} の 職場{しょくば} で の 経験{けいけん} は、確認{かくにん} と 報告{ほうこく} の 重要性{じゅうようせい} に 気{き}づかせました。",
              "A experiência no ambiente de trabalho japonês me fez perceber a importância da confirmação e do reporte.",
              words([
                { jp: "職場{しょくば}", pt: "ambiente de trabalho" },
                { jp: "報告{ほうこく}", pt: "relatório / aviso" },
                { jp: "重要性{じゅうようせい}", pt: "importância" }
              ])
            ),
            phrase(
              "うまく 話{はな}せなかった 日{ひ} ほど、毎日{まいにち} の 小{ちい}さな 練習{れんしゅう} の 価値{かち} に 気{き}づかされます。",
              "Justamente nos dias em que não consegui falar bem, percebo o valor da pequena prática diária.",
              words([
                { jp: "価値{かち}", pt: "valor" },
                { jp: "小{ちい}さな", pt: "pequeno" }
              ])
            ),
            phrase(
              "自分{じぶん} の 弱{よわ}さ に 気{き}づかされる こと は、次{つぎ} の 成長{せいちょう} に つながる と 思{おも}います。",
              "Acredito que ser levado a perceber as próprias fraquezas se conecta ao próximo crescimento.",
              words([
                { jp: "弱{よわ}さ", pt: "fraqueza" },
                { jp: "つながる", pt: "conectar / levar a" }
              ])
            )
          ]
        }
      }
    },

    /* =====================================================
       7. BANCO DE SITUAÇÕES REAIS
       ===================================================== */

    scenarios: {
      primeiras_frases: {
        id: "scenario_primeiras_frases",
        label: "Primeiras frases",
        kind: "situação real",
        levelGroup: "iniciante",
        tags: ["primeiras frases", "básico", "basico", "começar", "inicio", "início", "sobrevivência"],
        explanation:
          "Frases mínimas para o aluno começar a falar sem travar.",
        usage:
          "Use quando o aluno ainda está inseguro e precisa de frases simples para qualquer situação.",
        goal:
          "Destravar a primeira fala em japonês.",
        levels: {
          iniciante: [
            phrase(
              "すみません。",
              "Com licença. / Desculpe.",
              words([
                { jp: "すみません", pt: "com licença / desculpe" }
              ])
            ),
            phrase(
              "ありがとう ございます。",
              "Muito obrigado.",
              words([
                { jp: "ありがとう ございます", pt: "muito obrigado" }
              ])
            ),
            phrase(
              "はい、わかりました。",
              "Sim, entendi.",
              words([
                { jp: "はい", pt: "sim" },
                { jp: "わかりました", pt: "entendi" }
              ])
            ),
            phrase(
              "いいえ、まだ わかりません。",
              "Não, ainda não entendi.",
              words([
                { jp: "いいえ", pt: "não" },
                { jp: "まだ", pt: "ainda" }
              ])
            ),
            phrase(
              "もう 一度{いちど} お願{ねが}いします。",
              "Mais uma vez, por favor.",
              words([
                { jp: "一度{いちど}", pt: "uma vez" },
                { jp: "お願{ねが}いします", pt: "por favor" }
              ])
            ),
            phrase(
              "ゆっくり お願{ねが}いします。",
              "Devagar, por favor.",
              words([
                { jp: "ゆっくり", pt: "devagar" }
              ])
            ),
            phrase(
              "大丈夫{だいじょうぶ} です。",
              "Está tudo bem.",
              words([
                { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / sem problema" }
              ])
            )
          ],

          intermediario: [
            phrase(
              "日本語{にほんご} が まだ 苦手{にがて} なので、簡単{かんたん} に お願{ねが}いします。",
              "Como ainda tenho dificuldade com japonês, por favor fale de forma simples.",
              words([
                { jp: "苦手{にがて}", pt: "dificuldade" },
                { jp: "簡単{かんたん}", pt: "simples" }
              ])
            ),
            phrase(
              "今{いま} の 説明{せつめい} を もう 一度{いちど} お願{ねが}いします。",
              "Por favor, explique novamente o que acabou de dizer.",
              words([
                { jp: "説明{せつめい}", pt: "explicação" },
                { jp: "一度{いちど}", pt: "uma vez" }
              ])
            ),
            phrase(
              "紙{かみ} に 書{か}いて もらえますか。",
              "Você poderia escrever no papel para mim?",
              words([
                { jp: "紙{かみ}", pt: "papel" },
                { jp: "書{か}いて", pt: "escrever" }
              ])
            ),
            phrase(
              "この 内容{ないよう} で 合{あ}って いますか。",
              "Está correto assim?",
              words([
                { jp: "内容{ないよう}", pt: "conteúdo" },
                { jp: "合{あ}って いますか", pt: "está correto?" }
              ])
            ),
            phrase(
              "あと で 確認{かくにん} して、連絡{れんらく} します。",
              "Vou confirmar depois e entro em contato.",
              words([
                { jp: "確認{かくにん}", pt: "confirmação" },
                { jp: "連絡{れんらく}", pt: "contato" }
              ])
            ),
            phrase(
              "今{いま} は まだ よく わかりません が、勉強{べんきょう} しています。",
              "Agora eu ainda não entendo bem, mas estou estudando.",
              words([
                { jp: "勉強{べんきょう}", pt: "estudo" }
              ])
            ),
            phrase(
              "少{すこ}し だけ 日本語{にほんご} が 話{はな}せます。",
              "Eu consigo falar só um pouco de japonês.",
              words([
                { jp: "少{すこ}し だけ", pt: "só um pouco" },
                { jp: "話{はな}せます", pt: "consigo falar" }
              ])
            )
          ],

          avancado: [
            phrase(
              "日本語{にほんご} で うまく 説明{せつめい} できない かもしれません が、少{すこ}し 聞{き}いて いただけますか。",
              "Talvez eu não consiga explicar bem em japonês, mas o senhor poderia me ouvir um pouco?",
              words([
                { jp: "うまく", pt: "bem / habilmente" },
                { jp: "説明{せつめい}", pt: "explicação" },
                { jp: "いただけますか", pt: "poderia fazer para mim? / forma educada" }
              ])
            ),
            phrase(
              "間違{まちが}って いたら、直{なお}して いただける と 助{たす}かります。",
              "Se estiver errado, ficarei grato se puder corrigir.",
              words([
                { jp: "間違{まちが}って", pt: "estar errado" },
                { jp: "直{なお}して", pt: "corrigir" },
                { jp: "助{たす}かります", pt: "ajuda / ficarei grato" }
              ])
            ),
            phrase(
              "正確{せいかく} に 理解{りかい} したい ので、もう 一度{いちど} 確認{かくにん} させて ください。",
              "Como quero entender corretamente, deixe-me confirmar mais uma vez.",
              words([
                { jp: "正確{せいかく}", pt: "correto / preciso" },
                { jp: "理解{りかい}", pt: "entendimento" }
              ])
            ),
            phrase(
              "失礼{しつれい} な 言{い}い方{かた} に なって いたら、すみません。",
              "Desculpe se meu jeito de falar estiver soando indelicado.",
              words([
                { jp: "失礼{しつれい}", pt: "indelicado / falta de educação" },
                { jp: "言{い}い方{かた}", pt: "modo de dizer" }
              ])
            ),
            phrase(
              "まだ 勉強中{べんきょうちゅう} なので、簡単{かんたん} な 日本語{にほんご} で 説明{せつめい} して いただける と 助{たす}かります。",
              "Como ainda estou estudando, ficarei grato se puder explicar em japonês simples.",
              words([
                { jp: "勉強中{べんきょうちゅう}", pt: "em estudo / estudando" },
                { jp: "簡単{かんたん}", pt: "simples" }
              ])
            ),
            phrase(
              "内容{ないよう} を 間違{まちが}えない ように、メモ を 取{と}っても いいですか。",
              "Para não errar o conteúdo, posso fazer anotações?",
              words([
                { jp: "内容{ないよう}", pt: "conteúdo" },
                { jp: "メモ を 取{と}る", pt: "fazer anotação" }
              ])
            ),
            phrase(
              "確認{かくにん} しながら 進{すす}めたい ので、わからない 時{とき} は 質問{しつもん} します。",
              "Como quero prosseguir confirmando, quando eu não entender vou perguntar.",
              words([
                { jp: "進{すす}めたい", pt: "quero prosseguir" },
                { jp: "質問{しつもん}", pt: "pergunta" }
              ])
            )
          ]
        }
      },

      pedir_ajuda: {
        id: "scenario_pedir_ajuda",
        label: "Pedir ajuda",
        kind: "situação real",
        levelGroup: "iniciante",
        tags: ["ajuda", "pedir ajuda", "socorro", "preciso de ajuda", "手伝って"],
        explanation:
          "Frases para pedir ajuda sem parecer rude.",
        usage:
          "Use em loja, trabalho, rua, prefeitura, hospital ou qualquer situação em que você travar.",
        goal:
          "Aprender a pedir ajuda de forma simples e educada.",
        levels: {
          iniciante: [
            phrase(
              "すみません。手伝{てつだ}って もらえますか。",
              "Com licença. Você poderia me ajudar?",
              words([
                { jp: "手伝{てつだ}って", pt: "ajudar" },
                { jp: "もらえますか", pt: "poderia fazer para mim?" }
              ])
            ),
            phrase(
              "ちょっと 助{たす}けて ください。",
              "Por favor, me ajude um pouco.",
              words([
                { jp: "ちょっと", pt: "um pouco / só um instante" },
                { jp: "助{たす}けて", pt: "ajude" }
              ])
            ),
            phrase(
              "これ、わかりません。",
              "Eu não entendo isto.",
              words([
                { jp: "これ", pt: "isto" },
                { jp: "わかりません", pt: "não entendo" }
              ])
            ),
            phrase(
              "見{み}て もらえますか。",
              "Você poderia olhar para mim?",
              words([
                { jp: "見{み}て", pt: "ver / olhar" }
              ])
            ),
            phrase(
              "教{おし}えて ください。",
              "Por favor, me ensine / explique.",
              words([
                { jp: "教{おし}えて", pt: "ensinar / explicar" }
              ])
            ),
            phrase(
              "ここ は どこ ですか。",
              "Onde é aqui?",
              words([
                { jp: "ここ", pt: "aqui" },
                { jp: "どこ", pt: "onde" }
              ])
            ),
            phrase(
              "日本語{にほんご} が よく わかりません。",
              "Eu não entendo bem japonês.",
              words([
                { jp: "日本語{にほんご}", pt: "japonês" }
              ])
            )
          ],

          intermediario: [
            phrase(
              "すみません。この やり方{かた} を 教{おし}えて もらえますか。",
              "Com licença. Você poderia me ensinar o modo de fazer isto?",
              words([
                { jp: "やり方{かた}", pt: "modo de fazer" }
              ])
            ),
            phrase(
              "この 内容{ないよう} が わからない ので、少{すこ}し 手伝{てつだ}って ください。",
              "Como não entendo este conteúdo, por favor me ajude um pouco.",
              words([
                { jp: "内容{ないよう}", pt: "conteúdo" },
                { jp: "手伝{てつだ}って", pt: "ajudar" }
              ])
            ),
            phrase(
              "どこ に 行{い}けば いい か 教{おし}えて ください。",
              "Por favor, me diga para onde devo ir.",
              words([
                { jp: "行{い}けば いい", pt: "devo ir" }
              ])
            ),
            phrase(
              "この 書類{しょるい} の 書{か}き方{かた} を 教{おし}えて もらえますか。",
              "Você poderia me ensinar como preencher este documento?",
              words([
                { jp: "書類{しょるい}", pt: "documento" },
                { jp: "書{か}き方{かた}", pt: "forma de escrever / preencher" }
              ])
            ),
            phrase(
              "今{いま}、少{すこ}し 困{こま}って います。",
              "Agora estou com um pouco de dificuldade / problema.",
              words([
                { jp: "困{こま}って います", pt: "estar em dificuldade / com problema" }
              ])
            ),
            phrase(
              "日本語{にほんご} で うまく 説明{せつめい} できません。",
              "Não consigo explicar bem em japonês.",
              words([
                { jp: "うまく", pt: "bem / habilmente" },
                { jp: "説明{せつめい}", pt: "explicação" }
              ])
            ),
            phrase(
              "可能{かのう} で あれば、簡単{かんたん} に 説明{せつめい} して ください。",
              "Se possível, por favor explique de forma simples.",
              words([
                { jp: "可能{かのう} で あれば", pt: "se possível" },
                { jp: "簡単{かんたん}", pt: "simples" }
              ])
            )
          ],

          avancado: [
            phrase(
              "申し訳{もう}し訳{わけ} ありません。少{すこ}し 確認{かくにん} したい こと が ある の ですが、教{おし}えて いただけますか。",
              "Desculpe. Há algo que eu gostaria de confirmar; o senhor poderia me explicar?",
              words([
                { jp: "申{もう}し訳{わけ} ありません", pt: "sinto muito / desculpe formalmente" },
                { jp: "確認{かくにん}", pt: "confirmação" }
              ])
            ),
            phrase(
              "日本語{にほんご} で うまく 伝{つた}えられない ので、簡単{かんたん} な 言葉{ことば} で 説明{せつめい} して いただける と 助{たす}かります。",
              "Como não consigo transmitir bem em japonês, ficarei grato se puder explicar com palavras simples.",
              words([
                { jp: "伝{つた}えられない", pt: "não conseguir transmitir" },
                { jp: "助{たす}かります", pt: "ajuda / ficarei grato" }
              ])
            ),
            phrase(
              "自分{じぶん} の 理解{りかい} が 合{あ}って いる か 確認{かくにん} したい です。",
              "Gostaria de confirmar se meu entendimento está correto.",
              words([
                { jp: "理解{りかい}", pt: "entendimento" },
                { jp: "合{あ}って いる", pt: "está correto" }
              ])
            ),
            phrase(
              "お忙{いそが}しい ところ すみません が、この 部分{ぶぶん} だけ 教{おし}えて いただけますか。",
              "Desculpe incomodar enquanto está ocupado, mas poderia me explicar apenas esta parte?",
              words([
                { jp: "お忙{いそが}しい ところ", pt: "em meio à sua ocupação" },
                { jp: "部分{ぶぶん}", pt: "parte" }
              ])
            ),
            phrase(
              "判断{はんだん} に 迷{まよ}って いる ので、アドバイス を いただける と 助{たす}かります。",
              "Como estou em dúvida sobre a decisão, ficarei grato se puder me dar um conselho.",
              words([
                { jp: "判断{はんだん}", pt: "decisão / julgamento" },
                { jp: "迷{まよ}って いる", pt: "estar em dúvida" }
              ])
            ),
            phrase(
              "この 状況{じょうきょう} で どう 対応{たいおう} すれば いい か、教{おし}えて いただけますか。",
              "Nesta situação, o senhor poderia me orientar como devo agir?",
              words([
                { jp: "状況{じょうきょう}", pt: "situação" },
                { jp: "対応{たいおう}", pt: "lidar / responder" }
              ])
            ),
            phrase(
              "間違{まちが}い を 防{ふせ}ぎたい ので、先{さき}に 確認{かくにん} させて ください。",
              "Como quero evitar erro, por favor deixe-me confirmar antes.",
              words([
                { jp: "防{ふせ}ぎたい", pt: "quero evitar" },
                { jp: "先{さき}に", pt: "antes" }
              ])
            )
          ]
        }
      },

      nao_entendi: {
        id: "scenario_nao_entendi",
        label: "Não entendi",
        kind: "situação real",
        levelGroup: "iniciante",
        tags: ["não entendi", "nao entendi", "repetir", "devagar", "わかりません", "ゆっくり"],
        explanation:
          "Frases para quando o aluno não entende e precisa pedir repetição ou explicação.",
        usage:
          "Use quando ouvir algo rápido, receber instrução no trabalho ou não entender um documento.",
        goal:
          "Evitar ficar calado quando não entender.",
        levels: {
          iniciante: [
            phrase("すみません。わかりません。", "Desculpe. Não entendi.", words([
              { jp: "わかりません", pt: "não entendi / não entendo" }
            ])),
            phrase("もう 一度{いちど} お願{ねが}いします。", "Mais uma vez, por favor.", words([
              { jp: "一度{いちど}", pt: "uma vez" }
            ])),
            phrase("ゆっくり 話{はな}して ください。", "Por favor, fale devagar.", words([
              { jp: "ゆっくり", pt: "devagar" },
              { jp: "話{はな}して", pt: "falar" }
            ])),
            phrase("簡単{かんたん} に お願{ねが}いします。", "De forma simples, por favor.", words([
              { jp: "簡単{かんたん}", pt: "simples" }
            ])),
            phrase("日本語{にほんご} が 苦手{にがて} です。", "Tenho dificuldade com japonês.", words([
              { jp: "苦手{にがて}", pt: "dificuldade / ponto fraco" }
            ])),
            phrase("紙{かみ} に 書{か}いて ください。", "Por favor, escreva no papel.", words([
              { jp: "紙{かみ}", pt: "papel" },
              { jp: "書{か}いて", pt: "escrever" }
            ])),
            phrase("それ は どういう 意味{いみ} ですか。", "O que isso significa?", words([
              { jp: "意味{いみ}", pt: "significado" }
            ]))
          ],

          intermediario: [
            phrase(
              "今{いま} の 説明{せつめい} が 少{すこ}し 難{むずか}しかった です。",
              "A explicação de agora foi um pouco difícil.",
              words([
                { jp: "説明{せつめい}", pt: "explicação" },
                { jp: "難{むずか}しかった", pt: "foi difícil" }
              ])
            ),
            phrase(
              "もう 少{すこ}し 簡単{かんたん} に 説明{せつめい} して もらえますか。",
              "Você poderia explicar de forma um pouco mais simples?",
              words([
                { jp: "簡単{かんたん}", pt: "simples" },
                { jp: "説明{せつめい}", pt: "explicação" }
              ])
            ),
            phrase(
              "どこ まで やれば いい か、もう 一度{いちど} 教{おし}えて ください。",
              "Por favor, me ensine mais uma vez até onde devo fazer.",
              words([
                { jp: "どこ まで", pt: "até onde" },
                { jp: "やれば いい", pt: "devo fazer" }
              ])
            ),
            phrase(
              "この 部分{ぶぶん} だけ まだ わかりません。",
              "Só esta parte eu ainda não entendi.",
              words([
                { jp: "部分{ぶぶん}", pt: "parte" },
                { jp: "まだ", pt: "ainda" }
              ])
            ),
            phrase(
              "自分{じぶん} の 理解{りかい} が 合{あ}って いる か 確認{かくにん} したいです。",
              "Quero confirmar se meu entendimento está correto.",
              words([
                { jp: "理解{りかい}", pt: "entendimento" },
                { jp: "確認{かくにん}", pt: "confirmação" }
              ])
            ),
            phrase(
              "メモ しても いいですか。",
              "Posso anotar?",
              words([
                { jp: "メモ", pt: "anotação" }
              ])
            ),
            phrase(
              "一度{いちど} やって みて も いいですか。",
              "Posso tentar fazer uma vez?",
              words([
                { jp: "やって みて", pt: "tentar fazer" }
              ])
            )
          ],

          avancado: [
            phrase(
              "説明{せつめい} の 内容{ないよう} を 正確{せいかく} に 理解{りかい} したい ので、もう 一度{いちど} 確認{かくにん} させて ください。",
              "Como quero entender corretamente o conteúdo da explicação, deixe-me confirmar mais uma vez.",
              words([
                { jp: "正確{せいかく}", pt: "correto / preciso" },
                { jp: "理解{りかい}", pt: "entendimento" }
              ])
            ),
            phrase(
              "自分{じぶん} の 認識{にんしき} が 間違{まちが}って いない か、念{ねん}のため 確認{かくにん} したいです。",
              "Por precaução, gostaria de confirmar se meu entendimento não está errado.",
              words([
                { jp: "認識{にんしき}", pt: "entendimento / percepção" },
                { jp: "念{ねん}のため", pt: "por precaução" }
              ])
            ),
            phrase(
              "この 表現{ひょうげん} は 少{すこ}し 難{むずか}しい ので、別{べつ} の 言{い}い方{かた} で 説明{せつめい} して いただけますか。",
              "Como esta expressão é um pouco difícil, o senhor poderia explicar com outra forma de dizer?",
              words([
                { jp: "表現{ひょうげん}", pt: "expressão" },
                { jp: "別{べつ} の 言{い}い方{かた}", pt: "outra forma de dizer" }
              ])
            ),
            phrase(
              "聞{き}き間違{まちが}い が ある と いけない ので、もう 一度{いちど} お願{ねが}いします。",
              "Como não posso correr o risco de ouvir errado, mais uma vez, por favor.",
              words([
                { jp: "聞{き}き間違{まちが}い", pt: "erro ao ouvir" },
                { jp: "ある と いけない", pt: "não pode haver / seria problema" }
              ])
            ),
            phrase(
              "作業{さぎょう} に 影響{えいきょう} が 出{で}る と 困{こま}る ので、先{さき}に 確認{かくにん} します。",
              "Como seria problemático afetar a tarefa, vou confirmar antes.",
              words([
                { jp: "影響{えいきょう}", pt: "influência / impacto" },
                { jp: "困{こま}る", pt: "ser problemático / ficar em dificuldade" }
              ])
            ),
            phrase(
              "言葉{ことば} の 意味{いみ} だけ でなく、使{つか}う 場面{ばめん} も 知{し}りたいです。",
              "Quero saber não só o significado da palavra, mas também a situação de uso.",
              words([
                { jp: "場面{ばめん}", pt: "situação / cena" },
                { jp: "知{し}りたい", pt: "quero saber" }
              ])
            ),
            phrase(
              "理解{りかい} が 曖昧{あいまい} な まま 進{すす}める の は 不安{ふあん} です。",
              "Fico inseguro em continuar com o entendimento ainda vago.",
              words([
                { jp: "曖昧{あいまい}", pt: "vago / ambíguo" },
                { jp: "不安{ふあん}", pt: "insegurança / preocupação" }
              ])
            )
          ]
        }
      },

      fabrica: {
        id: "scenario_fabrica",
        label: "Fábrica",
        kind: "situação real",
        levelGroup: "intermediario",
        tags: ["fabrica", "fábrica", "trabalho", "maquina", "máquina", "peca", "peça", "linha", "produção", "producao", "murata", "作業", "機械", "部品"],
        explanation:
          "Frases para rotina de fábrica: instruções, máquina, peça, tarefa, confirmação e hora extra.",
        usage:
          "Use frases claras para evitar erro, confirmar antes de agir e mostrar responsabilidade.",
        goal:
          "Ajudar o aluno a se comunicar melhor no ambiente de fábrica.",
        levels: {
          iniciante: [
            phrase("すみません。よく わかりません。", "Com licença. Eu não entendi bem.", words([
              { jp: "すみません", pt: "com licença / desculpe" },
              { jp: "わかりません", pt: "não entendo" }
            ])),
            phrase("もう 一度{いちど} お願{ねが}いします。", "Mais uma vez, por favor.", words([
              { jp: "一度{いちど}", pt: "uma vez" }
            ])),
            phrase("ゆっくり お願{ねが}いします。", "Devagar, por favor.", words([
              { jp: "ゆっくり", pt: "devagar" }
            ])),
            phrase("これ で いいですか。", "Assim está bom?", words([
              { jp: "これ", pt: "isto" }
            ])),
            phrase("次{つぎ} は 何{なに} ですか。", "O que vem depois?", words([
              { jp: "次{つぎ}", pt: "próximo" },
              { jp: "何{なに}", pt: "o que" }
            ])),
            phrase("確認{かくにん} お願{ねが}いします。", "Confirmação, por favor.", words([
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("少{すこ}し 待{ま}って ください。", "Por favor, espere um pouco.", words([
              { jp: "少{すこ}し", pt: "um pouco" },
              { jp: "待{ま}って", pt: "esperar" }
            ]))
          ],

          intermediario: [
            phrase("この 作業{さぎょう} を もう 一度{いちど} 教{おし}えて ください。", "Por favor, me ensine este trabalho mais uma vez.", words([
              { jp: "作業{さぎょう}", pt: "tarefa / trabalho" }
            ])),
            phrase("次{つぎ} に 何{なに} を すれば いいですか。", "O que eu devo fazer em seguida?", words([
              { jp: "すれば いい", pt: "devo fazer" }
            ])),
            phrase("この 機械{きかい} が 止{と}まりました。", "Esta máquina parou.", words([
              { jp: "機械{きかい}", pt: "máquina" },
              { jp: "止{と}まりました", pt: "parou" }
            ])),
            phrase("確認{かくにん} して もらえますか。", "Você poderia verificar para mim?", words([
              { jp: "確認{かくにん}", pt: "verificação" }
            ])),
            phrase("やり方{かた} が まだ よく わかりません。", "Ainda não entendi bem o modo de fazer.", words([
              { jp: "やり方{かた}", pt: "modo de fazer" }
            ])),
            phrase("この 部品{ぶひん} は どこ に 置{お}きますか。", "Onde eu coloco esta peça?", words([
              { jp: "部品{ぶひん}", pt: "peça" },
              { jp: "置{お}きます", pt: "coloco" }
            ])),
            phrase("今日{きょう} は 残業{ざんぎょう} が ありますか。", "Hoje vai ter hora extra?", words([
              { jp: "残業{ざんぎょう}", pt: "hora extra" }
            ]))
          ],

          avancado: [
            phrase(
              "認識{にんしき} に 間違{まちが}い が ない か、念{ねん}のため 確認{かくにん} させて ください。",
              "Por precaução, deixe-me confirmar se não há erro no meu entendimento.",
              words([
                { jp: "認識{にんしき}", pt: "entendimento / percepção" },
                { jp: "念{ねん}のため", pt: "por precaução" }
              ])
            ),
            phrase(
              "この 方法{ほうほう} で 進{すす}めても 問題{もんだい} ない か、ご確認{かくにん} を お願{ねが}いします。",
              "Peço sua confirmação se não há problema em prosseguir com este método.",
              words([
                { jp: "方法{ほうほう}", pt: "método" },
                { jp: "進{すす}めても", pt: "mesmo prosseguindo" }
              ])
            ),
            phrase(
              "安全{あんぜん} に 関{かか}わる 内容{ないよう} なので、先{さき}に 確認{かくにん} して から 作業{さぎょう} します。",
              "Como é um conteúdo relacionado à segurança, vou trabalhar depois de confirmar antes.",
              words([
                { jp: "安全{あんぜん}", pt: "segurança" },
                { jp: "関{かか}わる", pt: "estar relacionado" }
              ])
            ),
            phrase(
              "予定{よてい} より 時間{じかん} が かかる 可能性{かのうせい} が あります。",
              "Existe a possibilidade de levar mais tempo do que o previsto.",
              words([
                { jp: "予定{よてい}", pt: "previsão / programação" },
                { jp: "可能性{かのうせい}", pt: "possibilidade" }
              ])
            ),
            phrase(
              "完了{かんりょう} したら、すぐ に 報告{ほうこく} いたします。",
              "Quando concluir, informarei imediatamente.",
              words([
                { jp: "完了{かんりょう}", pt: "conclusão" },
                { jp: "報告{ほうこく} いたします", pt: "informarei / forma humilde" }
              ])
            ),
            phrase(
              "不明点{ふめいてん} が あれば、そのまま 進{すす}めず に 確認{かくにん} します。",
              "Se houver pontos duvidosos, não vou prosseguir sem confirmar.",
              words([
                { jp: "不明点{ふめいてん}", pt: "ponto não claro / dúvida" },
                { jp: "進{すす}めず に", pt: "sem prosseguir" }
              ])
            ),
            phrase(
              "作業{さぎょう} の 優先順位{ゆうせんじゅんい} を 確認{かくにん} して から 進{すす}めます。",
              "Vou prosseguir depois de confirmar a prioridade das tarefas.",
              words([
                { jp: "優先順位{ゆうせんじゅんい}", pt: "prioridade" },
                { jp: "進{すす}めます", pt: "vou prosseguir" }
              ])
            )
          ]
        }
      },

      chefe: {
        id: "scenario_chefe",
        label: "Chefe / líder",
        kind: "situação real",
        levelGroup: "intermediario",
        tags: ["chefe", "lider", "líder", "supervisor", "encarregado", "上司", "リーダー", "責任者"],
        explanation:
          "Frases para falar com chefe, líder ou encarregado sem parecer rude.",
        usage:
          "Use para confirmar tarefa, avisar problema, pedir explicação, reportar conclusão ou dizer que não entendeu.",
        goal:
          "Ajudar o aluno a se comunicar com autoridade no trabalho.",
        levels: {
          iniciante: [
            phrase("すみません。よく わかりません。", "Com licença. Eu não entendi bem.", words([
              { jp: "わかりません", pt: "não entendi / não entendo" }
            ])),
            phrase("もう 一度{いちど} お願{ねが}いします。", "Mais uma vez, por favor.", words([
              { jp: "一度{いちど}", pt: "uma vez" }
            ])),
            phrase("これ で いいですか。", "Assim está bom?", words([
              { jp: "これ", pt: "isto" }
            ])),
            phrase("次{つぎ} は 何{なに} ですか。", "O que vem depois?", words([
              { jp: "次{つぎ}", pt: "próximo" }
            ])),
            phrase("確認{かくにん} お願{ねが}いします。", "Confirmação, por favor.", words([
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("終{お}わりました。", "Terminei.", words([
              { jp: "終{お}わりました", pt: "terminei" }
            ])),
            phrase("少{すこ}し 待{ま}って ください。", "Por favor, espere um pouco.", words([
              { jp: "待{ま}って", pt: "esperar" }
            ]))
          ],

          intermediario: [
            phrase(
              "この 作業{さぎょう} の やり方{かた} が まだ よく わかりません。",
              "Ainda não entendi bem o modo de fazer esta tarefa.",
              words([
                { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
                { jp: "やり方{かた}", pt: "modo de fazer" }
              ])
            ),
            phrase(
              "もう 一度{いちど} 説明{せつめい} して もらえますか。",
              "Você poderia explicar mais uma vez para mim?",
              words([
                { jp: "説明{せつめい}", pt: "explicação" }
              ])
            ),
            phrase(
              "この 内容{ないよう} で 合{あ}って いる かどうか 確認{かくにん} して ください。",
              "Por favor, confirme se este conteúdo está correto.",
              words([
                { jp: "内容{ないよう}", pt: "conteúdo" },
                { jp: "合{あ}って いる", pt: "está correto" }
              ])
            ),
            phrase(
              "次{つぎ} に 何{なに} を すれば いいですか。",
              "O que eu devo fazer em seguida?",
              words([
                { jp: "すれば いい", pt: "devo fazer" }
              ])
            ),
            phrase(
              "間違{まちが}い が ない ように、先{さき}に 確認{かくにん} したいです。",
              "Para não haver erro, quero confirmar antes.",
              words([
                { jp: "間違{まちが}い", pt: "erro" },
                { jp: "先{さき}に", pt: "antes" }
              ])
            ),
            phrase(
              "終{お}わったら、すぐ 報告{ほうこく} します。",
              "Quando terminar, aviso imediatamente.",
              words([
                { jp: "報告{ほうこく}", pt: "relatório / aviso" }
              ])
            ),
            phrase(
              "少{すこ}し 体調{たいちょう} が 悪{わる}い ので、無理{むり} しない ようにします。",
              "Como estou me sentindo um pouco mal, vou procurar não forçar.",
              words([
                { jp: "体調{たいちょう}", pt: "condição física" },
                { jp: "無理{むり} しない", pt: "não forçar" }
              ])
            )
          ],

          avancado: [
            phrase(
              "申し訳{もう}し訳{わけ} ありません。この 作業{さぎょう} の 手順{てじゅん} を もう 一度{いちど} 確認{かくにん} させて いただけますか。",
              "Desculpe. O senhor poderia me permitir confirmar mais uma vez o procedimento desta tarefa?",
              words([
                { jp: "手順{てじゅん}", pt: "procedimento / passo a passo" },
                { jp: "確認{かくにん} させて いただけますか", pt: "poderia me permitir confirmar?" }
              ])
            ),
            phrase(
              "認識{にんしき} に 間違{まちが}い が ない か、念{ねん}のため 確認{かくにん} させて ください。",
              "Por precaução, deixe-me confirmar se não há erro no meu entendimento.",
              words([
                { jp: "認識{にんしき}", pt: "entendimento / percepção" },
                { jp: "念{ねん}のため", pt: "por precaução" }
              ])
            ),
            phrase(
              "この 方法{ほうほう} で 進{すす}めても 問題{もんだい} ない か、ご確認{かくにん} を お願{ねが}いします。",
              "Peço sua confirmação se não há problema em prosseguir com este método.",
              words([
                { jp: "方法{ほうほう}", pt: "método" },
                { jp: "問題{もんだい}", pt: "problema" }
              ])
            ),
            phrase(
              "予定{よてい} より 時間{じかん} が かかる 可能性{かのうせい} が あります。",
              "Existe a possibilidade de levar mais tempo do que o previsto.",
              words([
                { jp: "可能性{かのうせい}", pt: "possibilidade" }
              ])
            ),
            phrase(
              "完了{かんりょう} したら、すぐ に 報告{ほうこく} いたします。",
              "Quando concluir, informarei imediatamente.",
              words([
                { jp: "完了{かんりょう}", pt: "conclusão" },
                { jp: "報告{ほうこく} いたします", pt: "informarei / forma humilde" }
              ])
            ),
            phrase(
              "不明点{ふめいてん} が あれば、そのまま 進{すす}めず に 確認{かくにん} します。",
              "Se houver pontos duvidosos, não vou prosseguir sem confirmar.",
              words([
                { jp: "不明点{ふめいてん}", pt: "ponto não claro / dúvida" }
              ])
            ),
            phrase(
              "作業{さぎょう} に 影響{えいきょう} が 出{で}る 前{まえ} に、先{さき}に 相談{そうだん} します。",
              "Antes de afetar a tarefa, vou consultar antes.",
              words([
                { jp: "影響{えいきょう}", pt: "impacto / influência" },
                { jp: "相談{そうだん}", pt: "consulta / conversa para decidir" }
              ])
            )
          ]
        }
      },
            hospital: {
        id: "scenario_hospital",
        label: "Hospital",
        kind: "situação real",
        levelGroup: "intermediario",
        tags: ["hospital", "medico", "médico", "consulta", "dor", "febre", "remedio", "remédio", "garganta", "cabeça", "atestado", "病院", "薬", "熱"],
        explanation:
          "Frases para explicar sintomas, pedir ajuda, entender remédio, pedir atestado e confirmar orientação médica.",
        usage:
          "Use frases claras. Em caso grave, priorize pedir ajuda, intérprete ou emergência.",
        goal:
          "Ajudar o aluno a explicar problemas de saúde no Japão.",
        levels: {
          iniciante: [
            phrase("熱{ねつ} が あります。", "Estou com febre.", words([
              { jp: "熱{ねつ}", pt: "febre" }
            ])),
            phrase("頭{あたま} が 痛{いた}いです。", "Estou com dor de cabeça.", words([
              { jp: "頭{あたま}", pt: "cabeça" },
              { jp: "痛{いた}い", pt: "dói / dolorido" }
            ])),
            phrase("のど が 痛{いた}いです。", "Estou com dor de garganta.", words([
              { jp: "のど", pt: "garganta" },
              { jp: "痛{いた}い", pt: "dói / dolorido" }
            ])),
            phrase("お腹{なか} が 痛{いた}いです。", "Estou com dor de barriga.", words([
              { jp: "お腹{なか}", pt: "barriga" }
            ])),
            phrase("気分{きぶん} が 悪{わる}いです。", "Estou passando mal.", words([
              { jp: "気分{きぶん}", pt: "estado / sensação" },
              { jp: "悪{わる}い", pt: "ruim" }
            ])),
            phrase("薬{くすり} は いつ 飲{の}みますか。", "Quando tomo o remédio?", words([
              { jp: "薬{くすり}", pt: "remédio" },
              { jp: "飲{の}みます", pt: "tomar / beber" }
            ])),
            phrase("通訳{つうやく} は ありますか。", "Tem intérprete?", words([
              { jp: "通訳{つうやく}", pt: "intérprete" }
            ]))
          ],

          intermediario: [
            phrase("昨日{きのう} から 熱{ねつ} が あります。", "Estou com febre desde ontem.", words([
              { jp: "昨日{きのう}", pt: "ontem" },
              { jp: "熱{ねつ}", pt: "febre" }
            ])),
            phrase("頭{あたま} が 痛{いた}くて、少{すこ}し 気持{きも}ち 悪{わる}いです。", "Estou com dor de cabeça e um pouco enjoado.", words([
              { jp: "気持{きも}ち 悪{わる}い", pt: "enjoado / passando mal" }
            ])),
            phrase("薬{くすり} は いつ 飲{の}めば いいですか。", "Quando devo tomar o remédio?", words([
              { jp: "飲{の}めば いい", pt: "devo tomar" }
            ])),
            phrase("仕事{しごと} に 行{い}っても 大丈夫{だいじょうぶ} ですか。", "Tudo bem eu ir trabalhar?", words([
              { jp: "仕事{しごと}", pt: "trabalho" },
              { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / sem problema" }
            ])),
            phrase("この 症状{しょうじょう} は いつ まで 続{つづ}きますか。", "Até quando estes sintomas continuam?", words([
              { jp: "症状{しょうじょう}", pt: "sintoma" },
              { jp: "続{つづ}きます", pt: "continua" }
            ])),
            phrase("薬{くすり} の 飲{の}み方{かた} を 教{おし}えて ください。", "Por favor, me ensine como tomar o remédio.", words([
              { jp: "飲{の}み方{かた}", pt: "modo de tomar" }
            ])),
            phrase("会社{かいしゃ} に 出{だ}す 診断書{しんだんしょ} は もらえますか。", "Posso receber um atestado para entregar na empresa?", words([
              { jp: "会社{かいしゃ}", pt: "empresa" },
              { jp: "診断書{しんだんしょ}", pt: "atestado médico" }
            ]))
          ],

          avancado: [
            phrase("症状{しょうじょう} が 三日{みっか} ほど 続{つづ}いて います。", "Os sintomas continuam há cerca de três dias.", words([
              { jp: "症状{しょうじょう}", pt: "sintoma" },
              { jp: "三日{みっか}", pt: "três dias" }
            ])),
            phrase("薬{くすり} を 飲{の}んでも、あまり 良{よ}く なって いません。", "Mesmo tomando remédio, não melhorei muito.", words([
              { jp: "良{よ}く なって いません", pt: "não melhorou" }
            ])),
            phrase("仕事{しごと} に 影響{えいきょう} が 出{で}て いる ので、診断書{しんだんしょ} が 必要{ひつよう} です。", "Como está afetando meu trabalho, preciso de atestado médico.", words([
              { jp: "影響{えいきょう}", pt: "impacto / influência" },
              { jp: "診断書{しんだんしょ}", pt: "atestado médico" }
            ])),
            phrase("この 痛{いた}み が どこ から 来{き}て いる の か 知{し}りたいです。", "Quero saber de onde vem esta dor.", words([
              { jp: "痛{いた}み", pt: "dor" },
              { jp: "知{し}りたい", pt: "quero saber" }
            ])),
            phrase("薬{くすり} の 副作用{ふくさよう} が ある かどうか 確認{かくにん} したいです。", "Quero confirmar se há efeitos colaterais do remédio.", words([
              { jp: "副作用{ふくさよう}", pt: "efeito colateral" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("日本語{にほんご} で 症状{しょうじょう} を 正確{せいかく} に 説明{せつめい} する の が 難{むずか}しいです。", "É difícil explicar meus sintomas corretamente em japonês.", words([
              { jp: "正確{せいかく}", pt: "corretamente / precisamente" },
              { jp: "説明{せつめい}", pt: "explicação" }
            ])),
            phrase("大事{だいじ} な 内容{ないよう} なので、紙{かみ} に 書{か}いて いただけますか。", "Como é um conteúdo importante, o senhor poderia escrever no papel?", words([
              { jp: "大事{だいじ}", pt: "importante" },
              { jp: "紙{かみ}", pt: "papel" }
            ]))
          ]
        }
      },

      prefeitura: {
        id: "scenario_prefeitura",
        label: "Prefeitura",
        kind: "situação real",
        levelGroup: "intermediario",
        tags: ["prefeitura", "documento", "residencia", "residência", "zairyu", "my number", "mynumber", "endereco", "endereço", "市役所", "書類", "在留"],
        explanation:
          "Frases para prefeitura, documentos, formulários, senha de atendimento, balcão e procedimentos.",
        usage:
          "Use quando precisar perguntar com calma, confirmar documentos e pedir explicação.",
        goal:
          "Ajudar o aluno a lidar com documentos e procedimentos públicos.",
        levels: {
          iniciante: [
            phrase("この 書類{しょるい} は どこ ですか。", "Onde fica este documento?", words([
              { jp: "書類{しょるい}", pt: "documento" }
            ])),
            phrase("何{なに} が 必要{ひつよう} ですか。", "O que é necessário?", words([
              { jp: "必要{ひつよう}", pt: "necessário" }
            ])),
            phrase("ここ で 大丈夫{だいじょうぶ} ですか。", "Aqui está certo?", words([
              { jp: "大丈夫{だいじょうぶ}", pt: "tudo bem / correto" }
            ])),
            phrase("番号札{ばんごうふだ} は どこ ですか。", "Onde fica a senha de atendimento?", words([
              { jp: "番号札{ばんごうふだ}", pt: "senha / ficha numerada" }
            ])),
            phrase("通訳{つうやく} は ありますか。", "Tem intérprete?", words([
              { jp: "通訳{つうやく}", pt: "intérprete" }
            ])),
            phrase("もう 一度{いちど} お願{ねが}いします。", "Mais uma vez, por favor.", words([
              { jp: "一度{いちど}", pt: "uma vez" }
            ])),
            phrase("紙{かみ} に 書{か}いて ください。", "Por favor, escreva no papel.", words([
              { jp: "紙{かみ}", pt: "papel" },
              { jp: "書{か}いて", pt: "escrever" }
            ]))
          ],

          intermediario: [
            phrase("この 書類{しょるい} の 書{か}き方{かた} を 教{おし}えて ください。", "Por favor, me ensine como preencher este documento.", words([
              { jp: "書{か}き方{かた}", pt: "forma de escrever / preencher" }
            ])),
            phrase("必要{ひつよう} な もの は 何{なに} ですか。", "O que é necessário trazer?", words([
              { jp: "必要{ひつよう}", pt: "necessário" }
            ])),
            phrase("この 手続{てつづ}き は 今日中{きょうじゅう} に 終{お}わりますか。", "Este procedimento termina ainda hoje?", words([
              { jp: "手続{てつづ}き", pt: "procedimento" },
              { jp: "今日中{きょうじゅう}", pt: "ainda hoje" }
            ])),
            phrase("番号札{ばんごうふだ} は どこ で 取{と}りますか。", "Onde pego a senha de atendimento?", words([
              { jp: "取{と}りますか", pt: "pego?" }
            ])),
            phrase("在留{ざいりゅう} カード の コピー は 必要{ひつよう} ですか。", "É necessária uma cópia do cartão de residência?", words([
              { jp: "在留{ざいりゅう} カード", pt: "cartão de residência" },
              { jp: "コピー", pt: "cópia" }
            ])),
            phrase("通訳{つうやく} を お願{ねが}いできますか。", "É possível pedir um intérprete?", words([
              { jp: "お願{ねが}いできますか", pt: "é possível pedir?" }
            ])),
            phrase("この 窓口{まどぐち} で 合{あ}って いますか。", "Este balcão está correto?", words([
              { jp: "窓口{まどぐち}", pt: "balcão / guichê" }
            ]))
          ],

          avancado: [
            phrase("この 書類{しょるい} で 手続{てつづ}き が できる かどうか、確認{かくにん} して いただけますか。", "O senhor poderia confirmar se é possível fazer o procedimento com este documento?", words([
              { jp: "手続{てつづ}き", pt: "procedimento" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("提出{ていしゅつ} する 前{まえ} に、不備{ふび} が ない か 見{み}て いただけますか。", "Antes de entregar, o senhor poderia verificar se não há pendência?", words([
              { jp: "提出{ていしゅつ}", pt: "entrega" },
              { jp: "不備{ふび}", pt: "falha / pendência" }
            ])),
            phrase("この 手続{てつづ}き に 追加{ついか} で 必要{ひつよう} な 書類{しょるい} は ありますか。", "Há algum documento adicional necessário para este procedimento?", words([
              { jp: "追加{ついか}", pt: "adicional" },
              { jp: "必要{ひつよう}", pt: "necessário" }
            ])),
            phrase("内容{ないよう} を 間違{まちが}えない ように、確認{かくにん} しながら 書{か}いても いいですか。", "Para não errar o conteúdo, posso preencher enquanto confirmo?", words([
              { jp: "内容{ないよう}", pt: "conteúdo" },
              { jp: "書{か}いても いいですか", pt: "posso escrever / preencher?" }
            ])),
            phrase("日本語{にほんご} の 説明{せつめい} が 難{むずか}しい ので、簡単{かんたん} に 言{い}って いただけますか。", "Como a explicação em japonês está difícil, o senhor poderia dizer de forma simples?", words([
              { jp: "説明{せつめい}", pt: "explicação" },
              { jp: "簡単{かんたん}", pt: "simples" }
            ])),
            phrase("この 手続{てつづ}き が 終{お}わった 後{あと}、次{つぎ} に 何{なに} を すれば いいですか。", "Depois que este procedimento terminar, o que devo fazer em seguida?", words([
              { jp: "後{あと}", pt: "depois" },
              { jp: "次{つぎ}", pt: "próximo" }
            ])),
            phrase("念{ねん}のため、必要{ひつよう} な もの を メモ しても いいですか。", "Por precaução, posso anotar os itens necessários?", words([
              { jp: "念{ねん}のため", pt: "por precaução" },
              { jp: "メモ", pt: "anotação" }
            ]))
          ]
        }
      },

      correio: {
        id: "scenario_correio",
        label: "Correio",
        kind: "situação real",
        levelGroup: "intermediario",
        tags: ["correio", "yu-pack", "yupack", "encomenda", "pacote", "carta", "endereco", "endereço", "郵便局", "荷物", "住所"],
        explanation:
          "Frases para enviar encomenda, preencher endereço, confirmar valor, prazo e tipo de entrega.",
        usage:
          "Use para pedir ajuda com formulário, endereço e envio sem depender de improviso.",
        goal:
          "Ajudar o aluno a resolver envios no correio japonês.",
        levels: {
          iniciante: [
            phrase("この 荷物{にもつ} を 送{おく}りたいです。", "Quero enviar esta encomenda.", words([
              { jp: "荷物{にもつ}", pt: "encomenda / bagagem" },
              { jp: "送{おく}りたい", pt: "quero enviar" }
            ])),
            phrase("送料{そうりょう} は いくら ですか。", "Quanto custa o frete?", words([
              { jp: "送料{そうりょう}", pt: "frete" },
              { jp: "いくら", pt: "quanto" }
            ])),
            phrase("いつ 届{とど}きますか。", "Quando chega?", words([
              { jp: "届{とど}きますか", pt: "chega? / será entregue?" }
            ])),
            phrase("住所{じゅうしょ} は ここ で いいですか。", "O endereço está certo aqui?", words([
              { jp: "住所{じゅうしょ}", pt: "endereço" }
            ])),
            phrase("この 箱{はこ} で いいですか。", "Esta caixa serve?", words([
              { jp: "箱{はこ}", pt: "caixa" }
            ])),
            phrase("追跡番号{ついせきばんごう} は ありますか。", "Tem código de rastreamento?", words([
              { jp: "追跡番号{ついせきばんごう}", pt: "código de rastreamento" }
            ])),
            phrase("お願いします。", "Por favor.", words([
              { jp: "お願{ねが}いします", pt: "por favor" }
            ]))
          ],

          intermediario: [
            phrase("住所{じゅうしょ} の 書{か}き方{かた} を 教{おし}えて ください。", "Por favor, me ensine como escrever o endereço.", words([
              { jp: "書{か}き方{かた}", pt: "forma de escrever" }
            ])),
            phrase("この 箱{はこ} で 送{おく}れますか。", "Dá para enviar com esta caixa?", words([
              { jp: "送{おく}れますか", pt: "pode enviar?" }
            ])),
            phrase("着払{ちゃくばら}い で 送{おく}れますか。", "É possível enviar com pagamento na entrega?", words([
              { jp: "着払{ちゃくばら}い", pt: "pagamento pelo destinatário / na entrega" }
            ])),
            phrase("追跡番号{ついせきばんごう} を 教{おし}えて ください。", "Por favor, me informe o código de rastreamento.", words([
              { jp: "追跡番号{ついせきばんごう}", pt: "código de rastreamento" }
            ])),
            phrase("何日{なんにち} ぐらい で 届{とど}きますか。", "Em cerca de quantos dias chega?", words([
              { jp: "何日{なんにち}", pt: "quantos dias" },
              { jp: "届{とど}きますか", pt: "chega?" }
            ])),
            phrase("割{わ}れ物{もの} なので、注意{ちゅうい} して ください。", "Como é frágil, por favor tome cuidado.", words([
              { jp: "割{わ}れ物{もの}", pt: "objeto frágil" },
              { jp: "注意{ちゅうい}", pt: "cuidado / atenção" }
            ])),
            phrase("伝票{でんぴょう} の 書{か}き方{かた} が わかりません。", "Não sei como preencher a etiqueta/formulário.", words([
              { jp: "伝票{でんぴょう}", pt: "formulário / etiqueta de envio" }
            ]))
          ],

          avancado: [
            phrase("この 住所{じゅうしょ} の 書{か}き方{かた} で 合{あ}って いる か、確認{かくにん} して いただけますか。", "O senhor poderia confirmar se a forma de escrever este endereço está correta?", words([
              { jp: "住所{じゅうしょ}", pt: "endereço" },
              { jp: "合{あ}って いる", pt: "está correto" }
            ])),
            phrase("到着予定日{とうちゃくよていび} を 確認{かくにん} したいです。", "Quero confirmar a data prevista de chegada.", words([
              { jp: "到着予定日{とうちゃくよていび}", pt: "data prevista de chegada" }
            ])),
            phrase("中身{なかみ} が 割{わ}れ物{もの} なので、注意{ちゅうい} して 扱{あつか}って いただけますか。", "Como o conteúdo é frágil, o senhor poderia manusear com cuidado?", words([
              { jp: "中身{なかみ}", pt: "conteúdo de dentro" },
              { jp: "扱{あつか}って", pt: "manusear / lidar" }
            ])),
            phrase("追跡{ついせき} できる 方法{ほうほう} で 送{おく}りたいです。", "Quero enviar por um método que permita rastreamento.", words([
              { jp: "追跡{ついせき}", pt: "rastreamento" },
              { jp: "方法{ほうほう}", pt: "método" }
            ])),
            phrase("一番{いちばん} 安全{あんぜん} な 送{おく}り方{かた} は どれ ですか。", "Qual é a forma de envio mais segura?", words([
              { jp: "一番{いちばん}", pt: "mais / número um" },
              { jp: "安全{あんぜん}", pt: "seguro" }
            ])),
            phrase("料金{りょうきん} と 到着日{とうちゃくび} を 比較{ひかく} して 決{き}めたいです。", "Quero decidir comparando o valor e a data de chegada.", words([
              { jp: "料金{りょうきん}", pt: "valor / tarifa" },
              { jp: "比較{ひかく}", pt: "comparação" }
            ])),
            phrase("伝票{でんぴょう} に 不備{ふび} が ない か、提出前{ていしゅつまえ} に 見{み}て いただけますか。", "Antes de entregar, o senhor poderia ver se não há pendência no formulário?", words([
              { jp: "不備{ふび}", pt: "falha / pendência" },
              { jp: "提出前{ていしゅつまえ}", pt: "antes da entrega" }
            ]))
          ]
        }
      },

      konbini: {
        id: "scenario_konbini",
        label: "Konbini",
        kind: "situação real",
        levelGroup: "iniciante",
        tags: ["konbini", "conveniência", "conveniencia", "loja de conveniência", "sacola", "bento", "弁当", "コンビニ"],
        explanation:
          "Frases para comprar no konbini, pedir aquecimento, sacola, recibo, hashi e pagamento.",
        usage:
          "Use no dia a dia para compras rápidas sem travar no caixa.",
        goal:
          "Ajudar o aluno a resolver compras simples no konbini.",
        levels: {
          iniciante: [
            phrase("レジ袋{ぶくろ} は 要{い}りません。", "Não preciso de sacola.", words([
              { jp: "レジ袋{ぶくろ}", pt: "sacola do caixa" },
              { jp: "要{い}りません", pt: "não preciso" }
            ])),
            phrase("この お弁当{べんとう} を 温{あたた}めて ください。", "Por favor, aqueça este bentô.", words([
              { jp: "お弁当{べんとう}", pt: "bentô / marmita" },
              { jp: "温{あたた}めて", pt: "aquecer" }
            ])),
            phrase("お箸{はし} を 一膳{いちぜん} お願{ねが}いします。", "Um par de hashi, por favor.", words([
              { jp: "お箸{はし}", pt: "hashi / palitinhos" },
              { jp: "一膳{いちぜん}", pt: "um par de hashi" }
            ])),
            phrase("スプーン は ありますか。", "Tem colher?", words([
              { jp: "スプーン", pt: "colher" }
            ])),
            phrase("レシート を ください。", "Por favor, me dê o recibo.", words([
              { jp: "レシート", pt: "recibo / comprovante" }
            ])),
            phrase("現金{げんきん} で 払{はら}います。", "Vou pagar em dinheiro.", words([
              { jp: "現金{げんきん}", pt: "dinheiro em espécie" },
              { jp: "払{はら}います", pt: "vou pagar" }
            ])),
            phrase("ポイントカード は ありません。", "Não tenho cartão de pontos.", words([
              { jp: "ポイントカード", pt: "cartão de pontos" }
            ]))
          ],

          intermediario: [
            phrase("この 支払{しはら}い は ここ で できますか。", "Posso fazer este pagamento aqui?", words([
              { jp: "支払{しはら}い", pt: "pagamento" }
            ])),
            phrase("公共料金{こうきょうりょうきん} を 払{はら}いたいです。", "Quero pagar uma conta pública.", words([
              { jp: "公共料金{こうきょうりょうきん}", pt: "conta pública / utilidade" }
            ])),
            phrase("宅急便{たっきゅうびん} を 出{だ}したいです。", "Quero enviar uma encomenda pelo takkyubin.", words([
              { jp: "宅急便{たっきゅうびん}", pt: "serviço de entrega" }
            ])),
            phrase("袋{ふくろ} は 小{ちい}さい もの で 大丈夫{だいじょうぶ} です。", "A sacola pequena está boa.", words([
              { jp: "小{ちい}さい", pt: "pequeno" }
            ])),
            phrase("温{あたた}めなくて 大丈夫{だいじょうぶ} です。", "Não precisa aquecer, está tudo bem.", words([
              { jp: "温{あたた}めなくて", pt: "sem aquecer" }
            ])),
            phrase("バーコード が 読{よ}めない ようです。", "Parece que o código de barras não está lendo.", words([
              { jp: "読{よ}めない", pt: "não consegue ler" }
            ])),
            phrase("この クーポン は 使{つか}えますか。", "Posso usar este cupom?", words([
              { jp: "クーポン", pt: "cupom" },
              { jp: "使{つか}えますか", pt: "posso usar?" }
            ]))
          ],

          avancado: [
            phrase("この 支払{しはら}い が ここ で 可能{かのう} かどうか 確認{かくにん} して いただけますか。", "O senhor poderia confirmar se este pagamento é possível aqui?", words([
              { jp: "可能{かのう}", pt: "possível" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("領収書{りょうしゅうしょ} が 必要{ひつよう} なので、発行{はっこう} して いただけますか。", "Como preciso de recibo fiscal, o senhor poderia emitir?", words([
              { jp: "領収書{りょうしゅうしょ}", pt: "recibo fiscal" },
              { jp: "発行{はっこう}", pt: "emissão" }
            ])),
            phrase("宅急便{たっきゅうびん} の 伝票{でんぴょう} の 書{か}き方{かた} を 教{おし}えて いただけますか。", "O senhor poderia me ensinar como preencher a etiqueta do takkyubin?", words([
              { jp: "伝票{でんぴょう}", pt: "formulário / etiqueta" },
              { jp: "書{か}き方{かた}", pt: "forma de escrever" }
            ])),
            phrase("この クーポン の 条件{じょうけん} を 確認{かくにん} しても いいですか。", "Posso confirmar as condições deste cupom?", words([
              { jp: "条件{じょうけん}", pt: "condição" }
            ])),
            phrase("ポイント を 使{つか}う 場合{ばあい}、支払{しはら}い 金額{きんがく} は いくら に なりますか。", "Caso eu use pontos, qual será o valor do pagamento?", words([
              { jp: "場合{ばあい}", pt: "caso" },
              { jp: "金額{きんがく}", pt: "valor" }
            ])),
            phrase("温{あたた}め 時間{じかん} は 店員{てんいん} さん に お任{まか}せします。", "Deixo o tempo de aquecimento a critério do atendente.", words([
              { jp: "店員{てんいん}", pt: "atendente" },
              { jp: "お任{まか}せします", pt: "deixo por sua conta" }
            ])),
            phrase("支払{しはら}い 方法{ほうほう} を 変更{へんこう} しても いいですか。", "Posso alterar o método de pagamento?", words([
              { jp: "方法{ほうほう}", pt: "método" },
              { jp: "変更{へんこう}", pt: "alteração" }
            ]))
          ]
        }
      },

      mercado: {
        id: "scenario_mercado",
        label: "Mercado",
        kind: "situação real",
        levelGroup: "iniciante",
        tags: ["mercado", "supermercado", "preço", "preco", "validade", "produto", "desconto", "スーパー", "商品"],
        explanation:
          "Frases para mercado: preço, validade, produto, sacola, pagamento e desconto.",
        usage:
          "Use para fazer compras com mais autonomia e entender perguntas do caixa.",
        goal:
          "Ajudar o aluno a comprar no mercado sem travar.",
        levels: {
          iniciante: [
            phrase("これは いくら ですか。", "Quanto custa isto?", words([
              { jp: "これ", pt: "isto" },
              { jp: "いくら", pt: "quanto" }
            ])),
            phrase("この 商品{しょうひん} は 売{う}り切{き}れ ですか。", "Este produto está esgotado?", words([
              { jp: "商品{しょうひん}", pt: "produto" },
              { jp: "売{う}り切{き}れ", pt: "esgotado" }
            ])),
            phrase("賞味期限{しょうみきげん} は いつ ですか。", "Qual é a data de validade?", words([
              { jp: "賞味期限{しょうみきげん}", pt: "data de validade" }
            ])),
            phrase("袋{ふくろ} は 要{い}りません。", "Não preciso de sacola.", words([
              { jp: "袋{ふくろ}", pt: "sacola" },
              { jp: "要{い}りません", pt: "não preciso" }
            ])),
            phrase("カード で 払{はら}えますか。", "Posso pagar com cartão?", words([
              { jp: "カード", pt: "cartão" },
              { jp: "払{はら}えますか", pt: "posso pagar?" }
            ])),
            phrase("この 商品{しょうひん} は どこ に ありますか。", "Onde fica este produto?", words([
              { jp: "どこ", pt: "onde" }
            ])),
            phrase("レシート を ください。", "Por favor, me dê o recibo.", words([
              { jp: "レシート", pt: "recibo" }
            ]))
          ],

          intermediario: [
            phrase("割引{わりびき} シール は ありますか。", "Tem etiqueta de desconto?", words([
              { jp: "割引{わりびき}", pt: "desconto" },
              { jp: "シール", pt: "etiqueta / selo" }
            ])),
            phrase("この 肉{にく} は 今日{きょう} まで ですか。", "Esta carne vence hoje?", words([
              { jp: "肉{にく}", pt: "carne" },
              { jp: "今日{きょう} まで", pt: "até hoje" }
            ])),
            phrase("この 野菜{やさい} は 新鮮{しんせん} ですか。", "Este legume está fresco?", words([
              { jp: "野菜{やさい}", pt: "legume / verdura" },
              { jp: "新鮮{しんせん}", pt: "fresco" }
            ])),
            phrase("安{やす}い 方{ほう} は どちら ですか。", "Qual é a opção mais barata?", words([
              { jp: "安{やす}い", pt: "barato" },
              { jp: "方{ほう}", pt: "opção / lado" }
            ])),
            phrase("セルフレジ は 使{つか}えますか。", "Posso usar o caixa automático?", words([
              { jp: "セルフレジ", pt: "caixa automático / self-checkout" }
            ])),
            phrase("この 商品{しょうひん} と 同{おな}じ もの は ありますか。", "Tem algo igual a este produto?", words([
              { jp: "同{おな}じ", pt: "igual / mesmo" }
            ])),
            phrase("ポイントカード を 忘{わす}れました。", "Esqueci o cartão de pontos.", words([
              { jp: "忘{わす}れました", pt: "esqueci" }
            ]))
          ],

          avancado: [
            phrase("この 商品{しょうひん} の 賞味期限{しょうみきげん} が 近{ちか}い ので、割引{わりびき} に なりますか。", "Como a validade deste produto está próxima, ele terá desconto?", words([
              { jp: "近{ちか}い", pt: "próximo" },
              { jp: "割引{わりびき}", pt: "desconto" }
            ])),
            phrase("同{おな}じ 商品{しょうひん} で、もう 少{すこ}し 安{やす}い もの は ありますか。", "Do mesmo produto, existe uma opção um pouco mais barata?", words([
              { jp: "同{おな}じ", pt: "igual / mesmo" },
              { jp: "安{やす}い", pt: "barato" }
            ])),
            phrase("この 表示価格{ひょうじかかく} は 税込{ぜいこ}み ですか、税抜{ぜいぬ}き ですか。", "Este preço exibido é com imposto ou sem imposto?", words([
              { jp: "表示価格{ひょうじかかく}", pt: "preço exibido" },
              { jp: "税込{ぜいこ}み", pt: "com imposto" },
              { jp: "税抜{ぜいぬ}き", pt: "sem imposto" }
            ])),
            phrase("返品{へんぴん} や 交換{こうかん} は できますか。", "É possível devolver ou trocar?", words([
              { jp: "返品{へんぴん}", pt: "devolução" },
              { jp: "交換{こうかん}", pt: "troca" }
            ])),
            phrase("この 商品{しょうひん} の 在庫{ざいこ} が ある かどうか 確認{かくにん} して いただけますか。", "O senhor poderia confirmar se há estoque deste produto?", words([
              { jp: "在庫{ざいこ}", pt: "estoque" }
            ])),
            phrase("支払{しはら}い 方法{ほうほう} を 途中{とちゅう} で 変{か}えても いいですか。", "Posso mudar o método de pagamento no meio?", words([
              { jp: "途中{とちゅう}", pt: "no meio" },
              { jp: "変{か}えても", pt: "mudar" }
            ])),
            phrase("レシート が 必要{ひつよう} なので、捨{す}てない で ください。", "Como preciso do recibo, por favor não jogue fora.", words([
              { jp: "捨{す}てない で", pt: "não jogue fora" }
            ]))
          ]
        }
      },

      transporte: {
        id: "scenario_transporte",
        label: "Transporte",
        kind: "situação real",
        levelGroup: "iniciante",
        tags: ["transporte", "trem", "ônibus", "onibus", "estação", "estacao", "plataforma", "電車", "バス", "駅"],
        explanation:
          "Frases para trem, ônibus, estação, plataforma, destino e baldeação.",
        usage:
          "Use quando precisar confirmar se está no trem certo ou entender horários e plataformas.",
        goal:
          "Ajudar o aluno a se locomover no Japão com mais confiança.",
        levels: {
          iniciante: [
            phrase("この 電車{でんしゃ} は 福井{ふくい} へ 行{い}きますか。", "Este trem vai para Fukui?", words([
              { jp: "電車{でんしゃ}", pt: "trem" },
              { jp: "行{い}きますか", pt: "vai?" }
            ])),
            phrase("次{つぎ} の 電車{でんしゃ} は 何時{なんじ} ですか。", "A que horas é o próximo trem?", words([
              { jp: "次{つぎ}", pt: "próximo" },
              { jp: "何時{なんじ}", pt: "que horas" }
            ])),
            phrase("切符{きっぷ} は どこ で 買{か}えますか。", "Onde posso comprar a passagem?", words([
              { jp: "切符{きっぷ}", pt: "passagem / bilhete" },
              { jp: "買{か}えますか", pt: "posso comprar?" }
            ])),
            phrase("駅{えき} は どこ ですか。", "Onde fica a estação?", words([
              { jp: "駅{えき}", pt: "estação" }
            ])),
            phrase("ここ で 降{お}りますか。", "Desço aqui?", words([
              { jp: "降{お}ります", pt: "descer" }
            ])),
            phrase("バス停{てい} は どこ ですか。", "Onde fica o ponto de ônibus?", words([
              { jp: "バス停{てい}", pt: "ponto de ônibus" }
            ])),
            phrase("この ICカード は 使{つか}えますか。", "Posso usar este cartão IC?", words([
              { jp: "ICカード", pt: "cartão IC / cartão de transporte" }
            ]))
          ],

          intermediario: [
            phrase("何番線{なんばんせん} から 出{で}ますか。", "Sai de qual plataforma?", words([
              { jp: "何番線{なんばんせん}", pt: "qual plataforma" },
              { jp: "出{で}ますか", pt: "sai?" }
            ])),
            phrase("ここ で 乗{の}り換{か}え ですか。", "É aqui que faço a baldeação?", words([
              { jp: "乗{の}り換{か}え", pt: "baldeação / troca" }
            ])),
            phrase("この 電車{でんしゃ} は 普通{ふつう} ですか、快速{かいそく} ですか。", "Este trem é local ou rápido?", words([
              { jp: "普通{ふつう}", pt: "local / comum" },
              { jp: "快速{かいそく}", pt: "rápido" }
            ])),
            phrase("降{お}りる 駅{えき} は ここ ですか。", "É aqui a estação onde devo descer?", words([
              { jp: "降{お}りる", pt: "descer" }
            ])),
            phrase("この バス は 市役所{しやくしょ} の 近{ちか}く まで 行{い}きますか。", "Este ônibus vai até perto da prefeitura?", words([
              { jp: "市役所{しやくしょ}", pt: "prefeitura" },
              { jp: "近{ちか}く", pt: "perto" }
            ])),
            phrase("終電{しゅうでん} は 何時{なんじ} ですか。", "A que horas é o último trem?", words([
              { jp: "終電{しゅうでん}", pt: "último trem" }
            ])),
            phrase("遅延{ちえん} して いますか。", "Está atrasado?", words([
              { jp: "遅延{ちえん}", pt: "atraso" }
            ]))
          ],

          avancado: [
            phrase("この 乗{の}り換{か}え で 合{あ}って いる かどうか 確認{かくにん} したいです。", "Quero confirmar se esta baldeação está correta.", words([
              { jp: "乗{の}り換{か}え", pt: "baldeação" },
              { jp: "合{あ}って いる", pt: "está correto" }
            ])),
            phrase("遅延{ちえん} の 影響{えいきょう} で、到着{とうちゃく} が 遅{おそ}く なる かもしれません。", "Por causa do atraso, talvez a chegada fique mais tarde.", words([
              { jp: "影響{えいきょう}", pt: "impacto / influência" },
              { jp: "到着{とうちゃく}", pt: "chegada" }
            ])),
            phrase("この ルート で 行{い}く と、何分{なんぷん} ぐらい かかりますか。", "Indo por esta rota, leva cerca de quantos minutos?", words([
              { jp: "ルート", pt: "rota" },
              { jp: "何分{なんぷん}", pt: "quantos minutos" }
            ])),
            phrase("運休{うんきゅう} の 場合{ばあい}、別{べつ} の 行{い}き方{かた} は ありますか。", "Caso esteja suspenso, existe outra forma de ir?", words([
              { jp: "運休{うんきゅう}", pt: "serviço suspenso" },
              { jp: "別{べつ} の 行{い}き方{かた}", pt: "outra forma de ir" }
            ])),
            phrase("会社{かいしゃ} に 遅{おく}れる 可能性{かのうせい} が ある ので、連絡{れんらく} します。", "Como existe a possibilidade de eu me atrasar para a empresa, vou avisar.", words([
              { jp: "可能性{かのうせい}", pt: "possibilidade" },
              { jp: "連絡{れんらく}", pt: "contato" }
            ])),
            phrase("この 切符{きっぷ} で どこ まで 行{い}ける か 確認{かくにん} できますか。", "É possível confirmar até onde posso ir com esta passagem?", words([
              { jp: "どこ まで", pt: "até onde" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("駅員{えきいん} さん に 聞{き}いた ほう が 確実{かくじつ} だ と 思{おも}います。", "Acho que é mais seguro perguntar ao funcionário da estação.", words([
              { jp: "駅員{えきいん}", pt: "funcionário da estação" },
              { jp: "確実{かくじつ}", pt: "seguro / certo" }
            ]))
          ]
        }
      },

      moradia: {
        id: "scenario_moradia",
        label: "Moradia",
        kind: "situação real",
        levelGroup: "intermediario",
        tags: ["moradia", "aluguel", "apartamento", "leopalace", "contrato", "vazamento", "vizinho", "家", "契約", "水漏れ"],
        explanation:
          "Frases para aluguel, apartamento, problema em casa, contrato, vizinho e manutenção.",
        usage:
          "Use para falar com imobiliária, responsável, suporte do prédio ou empresa de moradia.",
        goal:
          "Ajudar o aluno a resolver problemas de moradia com clareza.",
        levels: {
          iniciante: [
            phrase("水{みず} が 出{で}ません。", "A água não sai.", words([
              { jp: "水{みず}", pt: "água" },
              { jp: "出{で}ません", pt: "não sai" }
            ])),
            phrase("電気{でんき} が つきません。", "A luz não acende.", words([
              { jp: "電気{でんき}", pt: "luz / eletricidade" }
            ])),
            phrase("鍵{かぎ} を なくしました。", "Perdi a chave.", words([
              { jp: "鍵{かぎ}", pt: "chave" }
            ])),
            phrase("エアコン が 動{うご}きません。", "O ar-condicionado não funciona.", words([
              { jp: "エアコン", pt: "ar-condicionado" },
              { jp: "動{うご}きません", pt: "não funciona" }
            ])),
            phrase("家賃{やちん} は いくら ですか。", "Quanto é o aluguel?", words([
              { jp: "家賃{やちん}", pt: "aluguel" }
            ])),
            phrase("ここ に サイン しますか。", "Assino aqui?", words([
              { jp: "サイン", pt: "assinatura" }
            ])),
            phrase("問題{もんだい} が あります。", "Há um problema.", words([
              { jp: "問題{もんだい}", pt: "problema" }
            ]))
          ],

          intermediario: [
            phrase("部屋{へや} の エアコン の 調子{ちょうし} が 悪{わる}いです。", "O ar-condicionado do quarto não está bom.", words([
              { jp: "部屋{へや}", pt: "quarto / cômodo" },
              { jp: "調子{ちょうし}", pt: "condição" }
            ])),
            phrase("水漏{みずも}れ して いる ようです。", "Parece que há vazamento de água.", words([
              { jp: "水漏{みずも}れ", pt: "vazamento de água" }
            ])),
            phrase("修理{しゅうり} を お願{ねが}いしたいです。", "Gostaria de pedir conserto.", words([
              { jp: "修理{しゅうり}", pt: "conserto" }
            ])),
            phrase("いつ 見{み}に 来{き}て もらえますか。", "Quando podem vir olhar?", words([
              { jp: "見{み}に 来{き}て", pt: "vir olhar / verificar" }
            ])),
            phrase("契約{けいやく} の 内容{ないよう} を 確認{かくにん} したいです。", "Quero confirmar o conteúdo do contrato.", words([
              { jp: "契約{けいやく}", pt: "contrato" },
              { jp: "内容{ないよう}", pt: "conteúdo" }
            ])),
            phrase("隣{となり} の 音{おと} が 少{すこ}し 気{き}に なります。", "O som do vizinho está me incomodando um pouco.", words([
              { jp: "隣{となり}", pt: "vizinho / ao lado" },
              { jp: "気{き}に なります", pt: "incomoda / chama atenção" }
            ])),
            phrase("退去{たいきょ} の 手続{てつづ}き を 教{おし}えて ください。", "Por favor, me explique o procedimento de saída do imóvel.", words([
              { jp: "退去{たいきょ}", pt: "saída do imóvel" },
              { jp: "手続{てつづ}き", pt: "procedimento" }
            ]))
          ],

          avancado: [
            phrase("契約内容{けいやくないよう} に ついて、確認{かくにん} したい 点{てん} が あります。", "Sobre o conteúdo do contrato, há pontos que eu gostaria de confirmar.", words([
              { jp: "契約内容{けいやくないよう}", pt: "conteúdo do contrato" },
              { jp: "点{てん}", pt: "ponto" }
            ])),
            phrase("修理{しゅうり} が 必要{ひつよう} かどうか、一度{いちど} 見{み}て いただけますか。", "O senhor poderia verificar uma vez se é necessário conserto?", words([
              { jp: "必要{ひつよう}", pt: "necessário" },
              { jp: "見{み}て いただけますか", pt: "poderia verificar?" }
            ])),
            phrase("水漏{みずも}れ が 広{ひろ}がる 前{まえ} に、早{はや}め に 対応{たいおう} して いただきたいです。", "Gostaria que resolvessem cedo antes que o vazamento se espalhe.", words([
              { jp: "広{ひろ}がる", pt: "se espalhar" },
              { jp: "対応{たいおう}", pt: "atendimento / solução" }
            ])),
            phrase("退去時{たいきょじ} に かかる 費用{ひよう} を 事前{じぜん} に 確認{かくにん} したいです。", "Quero confirmar antecipadamente os custos na saída do imóvel.", words([
              { jp: "退去時{たいきょじ}", pt: "no momento da saída do imóvel" },
              { jp: "費用{ひよう}", pt: "custo" },
              { jp: "事前{じぜん}", pt: "antecipadamente" }
            ])),
            phrase("この 問題{もんだい} が 生活{せいかつ} に 影響{えいきょう} して いる ので、早{はや}め に 相談{そうだん} したいです。", "Como este problema está afetando minha vida, quero consultar cedo.", words([
              { jp: "生活{せいかつ}", pt: "vida / cotidiano" },
              { jp: "影響{えいきょう}", pt: "impacto" }
            ])),
            phrase("説明{せつめい} を 聞{き}くだけ では 不安{ふあん} なので、内容{ないよう} を 書面{しょめん} で いただけますか。", "Como fico inseguro apenas ouvindo a explicação, o senhor poderia me dar o conteúdo por escrito?", words([
              { jp: "書面{しょめん}", pt: "documento / por escrito" },
              { jp: "不安{ふあん}", pt: "insegurança" }
            ])),
            phrase("契約{けいやく} の 条件{じょうけん} を 理解{りかい} して から 判断{はんだん} したいです。", "Quero decidir depois de entender as condições do contrato.", words([
              { jp: "条件{じょうけん}", pt: "condição" },
              { jp: "判断{はんだん}", pt: "decisão / julgamento" }
            ]))
          ]
        }
      },

      bicicleta: {
        id: "scenario_bicicleta",
        label: "Bicicleta",
        kind: "situação real",
        levelGroup: "intermediario",
        tags: ["bicicleta", "bike", "pneu", "corrente", "freio", "selim", "acento", "自転車", "パンク", "チェーン"],
        explanation:
          "Frases para loja de bicicleta, pneu furado, corrente, freio, luz, selim e conserto.",
        usage:
          "Use quando for ao trabalho de bike ou precisar pedir manutenção.",
        goal:
          "Ajudar o aluno a resolver problemas com bicicleta no Japão.",
        levels: {
          iniciante: [
            phrase("自転車{じてんしゃ} が 壊{こわ}れました。", "A bicicleta quebrou.", words([
              { jp: "自転車{じてんしゃ}", pt: "bicicleta" },
              { jp: "壊{こわ}れました", pt: "quebrou" }
            ])),
            phrase("パンク しました。", "O pneu furou.", words([
              { jp: "パンク", pt: "pneu furado" }
            ])),
            phrase("チェーン が 外{はず}れました。", "A corrente soltou.", words([
              { jp: "チェーン", pt: "corrente" },
              { jp: "外{はず}れました", pt: "soltou" }
            ])),
            phrase("見{み}て もらえますか。", "Você poderia olhar para mim?", words([
              { jp: "見{み}て", pt: "ver / olhar" }
            ])),
            phrase("修理{しゅうり} は いくら ですか。", "Quanto custa o conserto?", words([
              { jp: "修理{しゅうり}", pt: "conserto" }
            ])),
            phrase("ブレーキ が 悪{わる}いです。", "O freio está ruim.", words([
              { jp: "ブレーキ", pt: "freio" }
            ])),
            phrase("ライト が つきません。", "A luz não acende.", words([
              { jp: "ライト", pt: "luz / farol" }
            ]))
          ],

          intermediario: [
            phrase("チェーン が 外{はず}れました。見{み}て もらえますか。", "A corrente soltou. Pode dar uma olhada?", words([
              { jp: "チェーン", pt: "corrente" },
              { jp: "外{はず}れました", pt: "soltou" }
            ])),
            phrase("パンク 修理{しゅうり} は いくら ですか。", "Quanto custa o conserto do pneu furado?", words([
              { jp: "修理{しゅうり}", pt: "conserto" }
            ])),
            phrase("タイヤ の 空気{くうき} を 入{い}れて もらえますか。", "Você pode colocar ar no pneu para mim?", words([
              { jp: "空気{くうき}", pt: "ar" },
              { jp: "入{い}れて", pt: "colocar" }
            ])),
            phrase("ブレーキ の 調子{ちょうし} が 悪{わる}いです。", "O freio não está bom.", words([
              { jp: "調子{ちょうし}", pt: "condição" }
            ])),
            phrase("サドル を もっと 高{たか}く できますか。", "Pode deixar o selim mais alto?", words([
              { jp: "サドル", pt: "selim / banco da bicicleta" },
              { jp: "高{たか}く", pt: "alto" }
            ])),
            phrase("鍵{かぎ} を なくしました。", "Perdi a chave.", words([
              { jp: "鍵{かぎ}", pt: "chave" }
            ])),
            phrase("修理{しゅうり} に どのくらい 時間{じかん} が かかりますか。", "Quanto tempo leva para consertar?", words([
              { jp: "どのくらい", pt: "quanto tempo / quanto" },
              { jp: "時間{じかん}", pt: "tempo" }
            ]))
          ],

          avancado: [
            phrase("通勤{つうきん} で 使{つか}って いる 自転車{じてんしゃ} なので、早{はや}め に 修理{しゅうり} したいです。", "Como é a bicicleta que uso para ir ao trabalho, quero consertar logo.", words([
              { jp: "通勤{つうきん}", pt: "ida ao trabalho" },
              { jp: "早{はや}め に", pt: "cedo / logo" }
            ])),
            phrase("安全{あんぜん} のため、ブレーキ の 状態{じょうたい} を 確認{かくにん} して いただけますか。", "Por segurança, o senhor poderia verificar o estado do freio?", words([
              { jp: "状態{じょうたい}", pt: "estado / condição" },
              { jp: "確認{かくにん}", pt: "confirmação" }
            ])),
            phrase("修理{しゅうり} する べき か、交換{こうかん} した ほう が いい か 知{し}りたいです。", "Quero saber se devo consertar ou se é melhor trocar.", words([
              { jp: "交換{こうかん}", pt: "troca" },
              { jp: "知{し}りたい", pt: "quero saber" }
            ])),
            phrase("雨{あめ} の 日{ひ} も 使{つか}う ので、滑{すべ}りにくい タイヤ が いいです。", "Como uso também em dias de chuva, quero um pneu que escorregue menos.", words([
              { jp: "滑{すべ}りにくい", pt: "difícil de escorregar" }
            ])),
            phrase("長時間{ちょうじかん} 乗{の}る と お尻{しり} が 痛{いた}い ので、もっと 楽{らく} な サドル に 交換{こうかん} したいです。", "Como sinto dor no bumbum ao pedalar por muito tempo, quero trocar por um selim mais confortável.", words([
              { jp: "長時間{ちょうじかん}", pt: "longas horas" },
              { jp: "楽{らく}", pt: "confortável / fácil" }
            ])),
            phrase("修理{しゅうり} の 見積{みつ}もり を 先{さき}に 出{だ}して いただけますか。", "O senhor poderia primeiro me passar um orçamento do conserto?", words([
              { jp: "見積{みつ}もり", pt: "orçamento" }
            ])),
            phrase("今日中{きょうじゅう} に 受{う}け取{と}れる かどうか 確認{かくにん} したいです。", "Quero confirmar se consigo retirar ainda hoje.", words([
              { jp: "今日中{きょうじゅう}", pt: "ainda hoje" },
              { jp: "受{う}け取{と}れる", pt: "poder receber / retirar" }
            ]))
          ]
        }
      },
            emergencia: {
        id: "scenario_emergencia",
        label: "Emergência",
        kind: "situação real",
        levelGroup: "iniciante",
        tags: ["emergencia", "emergência", "socorro", "ajuda urgente", "ambulância", "polícia", "acidente", "助けて", "救急車"],
        explanation:
          "Frases diretas para pedir ajuda rápido em situações urgentes.",
        usage:
          "Use quando precisar ser entendido imediatamente em hospital, rua, trabalho, acidente ou mal-estar.",
        goal:
          "Ajudar o aluno a pedir ajuda sem travar em situação séria.",
        levels: {
          iniciante: [
            phrase("助{たす}けて ください。", "Por favor, me ajude.", words([
              { jp: "助{たす}けて", pt: "ajude" }
            ])),
            phrase("気分{きぶん} が 悪{わる}いです。", "Estou passando mal.", words([
              { jp: "気分{きぶん}", pt: "estado / sensação" },
              { jp: "悪{わる}い", pt: "ruim" }
            ])),
            phrase("救急車{きゅうきゅうしゃ} を 呼{よ}んで ください。", "Por favor, chame uma ambulância.", words([
              { jp: "救急車{きゅうきゅうしゃ}", pt: "ambulância" },
              { jp: "呼{よ}んで", pt: "chamar" }
            ])),
            phrase("警察{けいさつ} を 呼{よ}んで ください。", "Por favor, chame a polícia.", words([
              { jp: "警察{けいさつ}", pt: "polícia" }
            ])),
            phrase("日本語{にほんご} が あまり わかりません。", "Não entendo muito japonês.", words([
              { jp: "日本語{にほんご}", pt: "japonês" }
            ])),
            phrase("ここ が 痛{いた}いです。", "Dói aqui.", words([
              { jp: "痛{いた}い", pt: "dói / dolorido" }
            ])),
            phrase("通訳{つうやく} を お願{ねが}いします。", "Por favor, preciso de intérprete.", words([
              { jp: "通訳{つうやく}", pt: "intérprete" }
            ]))
          ],

          intermediario: [
            phrase("急{きゅう}に 気分{きぶん} が 悪{わる}く なりました。", "Passei mal de repente.", words([
              { jp: "急{きゅう}に", pt: "de repente" },
              { jp: "悪{わる}く なりました", pt: "ficou ruim / passei mal" }
            ])),
            phrase("胸{むね} が 苦{くる}しいです。", "Estou com aperto/desconforto no peito.", words([
              { jp: "胸{むね}", pt: "peito" },
              { jp: "苦{くる}しい", pt: "aflitivo / difícil de respirar" }
            ])),
            phrase("息{いき} が しにくいです。", "Está difícil respirar.", words([
              { jp: "息{いき}", pt: "respiração" }
            ])),
            phrase("会社{かいしゃ} に 連絡{れんらく} して ください。", "Por favor, entre em contato com a empresa.", words([
              { jp: "会社{かいしゃ}", pt: "empresa" },
              { jp: "連絡{れんらく}", pt: "contato" }
            ])),
            phrase("家族{かぞく} に 連絡{れんらく} して ください。", "Por favor, entre em contato com minha família.", words([
              { jp: "家族{かぞく}", pt: "família" }
            ])),
            phrase("保険証{ほけんしょう} は ここ に あります。", "O cartão do seguro de saúde está aqui.", words([
              { jp: "保険証{ほけんしょう}", pt: "cartão do seguro de saúde" }
            ])),
            phrase("一人{ひとり} で 歩{ある}けません。", "Não consigo andar sozinho.", words([
              { jp: "一人{ひとり}", pt: "sozinho" },
              { jp: "歩{ある}けません", pt: "não consigo andar" }
            ]))
          ],

          avancado: [
            phrase("症状{しょうじょう} が 急{きゅう}に 悪{わる}く なった ので、救急{きゅうきゅう} で 見{み}て いただきたいです。", "Como os sintomas pioraram de repente, gostaria de ser atendido em emergência.", words([
              { jp: "症状{しょうじょう}", pt: "sintoma" },
              { jp: "救急{きゅうきゅう}", pt: "emergência" }
            ])),
            phrase("日本語{にほんご} で 正確{せいかく} に 説明{せつめい} できない ので、通訳{つうやく} を お願{ねが}いできますか。", "Como não consigo explicar corretamente em japonês, é possível pedir intérprete?", words([
              { jp: "正確{せいかく}", pt: "corretamente / precisamente" },
              { jp: "通訳{つうやく}", pt: "intérprete" }
            ])),
            phrase("意識{いしき} が もうろう と して います。", "Minha consciência está confusa / estou meio grogue.", words([
              { jp: "意識{いしき}", pt: "consciência" },
              { jp: "もうろう", pt: "turvo / confuso" }
            ])),
            phrase("仕事中{しごとちゅう} に けが を しました。", "Eu me machuquei durante o trabalho.", words([
              { jp: "仕事中{しごとちゅう}", pt: "durante o trabalho" },
              { jp: "けが", pt: "ferimento / machucado" }
            ])),
            phrase("痛{いた}み が 強{つよ}く なって いる ので、早{はや}め に 見{み}て いただきたいです。", "Como a dor está ficando mais forte, gostaria de ser examinado logo.", words([
              { jp: "痛{いた}み", pt: "dor" },
              { jp: "強{つよ}く なって いる", pt: "está ficando forte" }
            ])),
            phrase("今{いま} の 状況{じょうきょう} を 家族{かぞく} に 伝{つた}えて いただけますか。", "O senhor poderia informar minha família sobre a situação atual?", words([
              { jp: "状況{じょうきょう}", pt: "situação" },
              { jp: "伝{つた}えて", pt: "transmitir / informar" }
            ])),
            phrase("大事{だいじ} な 説明{せつめい} は、紙{かみ} に 書{か}いて いただける と 助{たす}かります。", "Se a explicação importante puder ser escrita no papel, isso me ajudaria.", words([
              { jp: "大事{だいじ}", pt: "importante" },
              { jp: "助{たす}かります", pt: "ajuda / ficarei grato" }
            ]))
          ]
        }
      }
    },

    /* =====================================================
       8. PACOTES POR TOM
       ===================================================== */

    tonePacks: {
      educado: {
        id: "tone_educado",
        label: "Tom educado",
        description:
          "Frases polidas para usar com atendentes, chefe, prefeitura, hospital e pessoas desconhecidas.",
        phrases: [
          phrase("すみません。少{すこ}し 確認{かくにん} しても いいですか。", "Com licença. Posso confirmar um pouco?", words([
            { jp: "確認{かくにん}", pt: "confirmação" }
          ])),
          phrase("もう 一度{いちど} 説明{せつめい} して いただけますか。", "O senhor poderia explicar mais uma vez?", words([
            { jp: "説明{せつめい}", pt: "explicação" },
            { jp: "いただけますか", pt: "poderia fazer para mim? / forma educada" }
          ])),
          phrase("紙{かみ} に 書{か}いて いただけますか。", "O senhor poderia escrever no papel?", words([
            { jp: "紙{かみ}", pt: "papel" },
            { jp: "書{か}いて", pt: "escrever" }
          ])),
          phrase("この 内容{ないよう} で 合{あ}って いますか。", "Este conteúdo está correto?", words([
            { jp: "内容{ないよう}", pt: "conteúdo" },
            { jp: "合{あ}って いますか", pt: "está correto?" }
          ])),
          phrase("可能{かのう} で あれば、簡単{かんたん} に 説明{せつめい} して いただけますか。", "Se possível, o senhor poderia explicar de forma simples?", words([
            { jp: "可能{かのう} で あれば", pt: "se possível" },
            { jp: "簡単{かんたん}", pt: "simples" }
          ])),
          phrase("確認{かくにん} して から、連絡{れんらく} いたします。", "Depois de confirmar, entrarei em contato.", words([
            { jp: "連絡{れんらく} いたします", pt: "entrarei em contato / forma polida" }
          ])),
          phrase("お忙{いそが}しい ところ すみません。", "Desculpe incomodar enquanto está ocupado.", words([
            { jp: "お忙{いそが}しい ところ", pt: "em meio à sua ocupação" }
          ]))
        ]
      },

      natural: {
        id: "tone_natural",
        label: "Tom natural",
        description:
          "Frases mais leves para conversas do dia a dia, sem ficar formal demais.",
        phrases: [
          phrase("ちょっと 聞{き}いても いいですか。", "Posso perguntar uma coisa?", words([
            { jp: "ちょっと", pt: "um pouco / só um instante" },
            { jp: "聞{き}いても いい", pt: "posso perguntar?" }
          ])),
          phrase("これ、どうすれば いいですか。", "O que eu faço com isto?", words([
            { jp: "どうすれば いい", pt: "o que devo fazer?" }
          ])),
          phrase("すみません、もう 一回{いっかい} お願{ねが}いします。", "Desculpa, mais uma vez, por favor.", words([
            { jp: "一回{いっかい}", pt: "uma vez" }
          ])),
          phrase("ちょっと わからない です。", "Eu não entendi muito bem.", words([
            { jp: "わからない", pt: "não entendo" }
          ])),
          phrase("あと で 確認{かくにん} します。", "Vou confirmar depois.", words([
            { jp: "確認{かくにん}", pt: "confirmação" }
          ])),
          phrase("これ で 合{あ}って ますか。", "Está certo assim?", words([
            { jp: "合{あ}って ますか", pt: "está certo?" }
          ])),
          phrase("もう 少{すこ}し ゆっくり 話{はな}して ください。", "Por favor, fale um pouco mais devagar.", words([
            { jp: "話{はな}して", pt: "falar" }
          ]))
        ]
      },

      trabalho: {
        id: "tone_trabalho",
        label: "Tom trabalho",
        description:
          "Frases úteis para fábrica, chefe, líder, tarefa, segurança e confirmação.",
        phrases: [
          phrase("この 作業{さぎょう} の やり方{かた} を もう 一度{いちど} 教{おし}えて ください。", "Por favor, me ensine mais uma vez o modo de fazer esta tarefa.", words([
            { jp: "作業{さぎょう}", pt: "tarefa / trabalho" },
            { jp: "やり方{かた}", pt: "modo de fazer" }
          ])),
          phrase("間違{まちが}い が ない ように、先{さき}に 確認{かくにん} したいです。", "Para não haver erro, quero confirmar antes.", words([
            { jp: "間違{まちが}い", pt: "erro" },
            { jp: "先{さき}に", pt: "antes" }
          ])),
          phrase("この 部品{ぶひん} で 合{あ}って いますか。", "Esta peça está correta?", words([
            { jp: "部品{ぶひん}", pt: "peça" },
            { jp: "合{あ}って いますか", pt: "está correto?" }
          ])),
          phrase("作業{さぎょう} が 終{お}わったら、すぐ 報告{ほうこく} します。", "Quando a tarefa terminar, aviso imediatamente.", words([
            { jp: "報告{ほうこく}", pt: "relatório / aviso" }
          ])),
          phrase("この 機械{きかい} が 止{と}まりました。", "Esta máquina parou.", words([
            { jp: "機械{きかい}", pt: "máquina" }
          ])),
          phrase("安全{あんぜん} のため、先{さき}に 確認{かくにん} します。", "Por segurança, vou confirmar antes.", words([
            { jp: "安全{あんぜん}", pt: "segurança" }
          ])),
          phrase("今日{きょう} は 残業{ざんぎょう} が ありますか。", "Hoje vai ter hora extra?", words([
            { jp: "残業{ざんぎょう}", pt: "hora extra" }
          ]))
        ]
      },

      emergencia: {
        id: "tone_emergencia",
        label: "Tom emergência",
        description:
          "Frases curtas e diretas para ser entendido rapidamente em situação urgente.",
        phrases: [
          phrase("助{たす}けて ください。", "Por favor, me ajude.", words([
            { jp: "助{たす}けて", pt: "ajude" }
          ])),
          phrase("救急車{きゅうきゅうしゃ} を 呼{よ}んで ください。", "Por favor, chame uma ambulância.", words([
            { jp: "救急車{きゅうきゅうしゃ}", pt: "ambulância" }
          ])),
          phrase("警察{けいさつ} を 呼{よ}んで ください。", "Por favor, chame a polícia.", words([
            { jp: "警察{けいさつ}", pt: "polícia" }
          ])),
          phrase("気分{きぶん} が 悪{わる}いです。", "Estou passando mal.", words([
            { jp: "気分{きぶん}", pt: "estado / sensação" }
          ])),
          phrase("ここ が 痛{いた}いです。", "Dói aqui.", words([
            { jp: "痛{いた}い", pt: "dói / dolorido" }
          ])),
          phrase("日本語{にほんご} が わかりません。", "Não entendo japonês.", words([
            { jp: "日本語{にほんご}", pt: "japonês" }
          ])),
          phrase("通訳{つうやく} を お願{ねが}いします。", "Por favor, preciso de intérprete.", words([
            { jp: "通訳{つうやく}", pt: "intérprete" }
          ]))
        ]
      }
    },

    /* =====================================================
       9. FALLBACK UNIVERSAL
       ===================================================== */

    fallback: [
      phrase(
        "すみません。少{すこ}し 手伝{てつだ}って もらえますか。",
        "Com licença. Você poderia me ajudar um pouco?",
        words([
          { jp: "少{すこ}し", pt: "um pouco" },
          { jp: "手伝{てつだ}って", pt: "ajudar" }
        ])
      ),
      phrase(
        "日本語{にほんご} が まだ 苦手{にがて} なので、ゆっくり 話{はな}して ください。",
        "Como ainda tenho dificuldade com japonês, por favor fale devagar.",
        words([
          { jp: "日本語{にほんご}", pt: "japonês" },
          { jp: "苦手{にがて}", pt: "dificuldade" },
          { jp: "話{はな}して", pt: "falar" }
        ])
      ),
      phrase(
        "もう 一度{いちど} 説明{せつめい} して もらえますか。",
        "Você poderia explicar mais uma vez para mim?",
        words([
          { jp: "一度{いちど}", pt: "uma vez" },
          { jp: "説明{せつめい}", pt: "explicação" }
        ])
      ),
      phrase(
        "紙{かみ} に 書{か}いて もらえますか。",
        "Você poderia escrever no papel para mim?",
        words([
          { jp: "紙{かみ}", pt: "papel" },
          { jp: "書{か}いて", pt: "escrever" }
        ])
      ),
      phrase(
        "この 内容{ないよう} で 合{あ}って いますか。",
        "Está correto assim?",
        words([
          { jp: "内容{ないよう}", pt: "conteúdo" },
          { jp: "合{あ}って いますか", pt: "está correto?" }
        ])
      ),
      phrase(
        "あと で 確認{かくにん} して、連絡{れんらく} します。",
        "Vou confirmar depois e entro em contato.",
        words([
          { jp: "確認{かくにん}", pt: "confirmação" },
          { jp: "連絡{れんらく}", pt: "contato" }
        ])
      ),
      phrase(
        "今{いま} は まだ よく わかりません。",
        "Agora eu ainda não entendi bem.",
        words([
          { jp: "今{いま}", pt: "agora" },
          { jp: "まだ", pt: "ainda" },
          { jp: "わかりません", pt: "não entendo" }
        ])
      )
    ],

    /* =====================================================
       10. ÍNDICES DE BUSCA
       ===================================================== */

    searchIndex: {
      grammarKeywords: {
        "ので": ["ので", "porque", "motivo", "causa", "explicar motivo", "por causa de"],
        "かどうか": ["かどうか", "se", "ou não", "confirmar", "dúvida", "pergunta indireta"],
        "てもいい": ["てもいい", "てもいいですか", "posso", "permissão", "pode"],
        "てもらえますか": ["てもらえますか", "poderia", "pedido", "ajuda", "fazer para mim"],
        "ないといけない": ["ないといけない", "tenho que", "preciso", "obrigação"],
        "たほうがいい": ["たほうがいい", "melhor", "recomendação", "conselho"],
        "やってみる": ["やってみる", "tentar", "experimentar", "fazer para ver"],
        "と思います": ["と思います", "acho que", "penso que", "opinião"],
        "かもしれません": ["かもしれません", "talvez", "possibilidade", "pode ser"],
        "ようにしています": ["ようにしています", "procuro fazer", "hábito", "esforço"],
        "気づかせる": ["気づかせる", "fazer perceber", "perceber", "tomar consciência"]
      },

      scenarioKeywords: {
        primeiras_frases: ["primeiras frases", "começar", "inicio", "início", "sobrevivência"],
        pedir_ajuda: ["ajuda", "pedir ajuda", "socorro", "手伝って"],
        nao_entendi: ["não entendi", "nao entendi", "repetir", "devagar", "わかりません"],
        fabrica: ["fabrica", "fábrica", "trabalho", "maquina", "máquina", "peça", "produção"],
        chefe: ["chefe", "lider", "líder", "supervisor", "encarregado", "上司"],
        hospital: ["hospital", "médico", "medico", "dor", "febre", "remédio", "atestado"],
        prefeitura: ["prefeitura", "documento", "residência", "zairyu", "my number", "市役所"],
        correio: ["correio", "yu-pack", "yupack", "encomenda", "endereço", "郵便局"],
        konbini: ["konbini", "conveniência", "bento", "sacola", "コンビニ"],
        mercado: ["mercado", "supermercado", "preço", "validade", "produto", "desconto"],
        transporte: ["transporte", "trem", "ônibus", "estação", "plataforma"],
        moradia: ["moradia", "aluguel", "apartamento", "contrato", "vazamento"],
        bicicleta: ["bicicleta", "bike", "pneu", "corrente", "freio", "selim"],
        emergencia: ["emergência", "emergencia", "socorro", "ambulância", "polícia", "acidente"]
      },

      levelKeywords: {
        iniciante: ["iniciante", "basico", "básico", "facil", "fácil", "sobrevivência", "n5"],
        intermediario: ["intermediario", "intermediário", "medio", "médio", "autonomia", "n4", "n3"],
        avancado: ["avancado", "avançado", "confianca", "confiança", "naturalidade", "n2", "n1"]
      },

      toneKeywords: {
        educado: ["educado", "formal", "polido", "respeitoso"],
        natural: ["natural", "casual", "dia a dia", "conversa"],
        trabalho: ["trabalho", "fabrica", "fábrica", "chefe", "líder", "empresa"],
        emergencia: ["emergencia", "emergência", "urgente", "socorro", "hospital"]
      }
    },

    /* =====================================================
       11. ORDEM RECOMENDADA DE ESTUDO
       ===================================================== */

    recommendedOrder: [
      "primeiras_frases",
      "pedir_ajuda",
      "nao_entendi",
      "konbini",
      "mercado",
      "transporte",
      "emergencia",
      "fabrica",
      "chefe",
      "hospital",
      "prefeitura",
      "correio",
      "bicicleta",
      "moradia",
      "ので",
      "かどうか",
      "てもいい",
      "てもらえますか",
      "ないといけない",
      "たほうがいい",
      "やってみる",
      "と思います",
      "かもしれません",
      "ようにしています",
      "気づかせる"
    ],

    /* =====================================================
       12. STATUS DO BANCO
       ===================================================== */

    status: {
      readyForExternalUse: true,
      canPowerSensei: true,
      canPowerStudyPaths: true,
      canPowerPracticalMap: true,
      canPower105xPacks: true,
      shouldLoadBeforeAppJs: true,
      suggestedScriptOrder: [
        "./sensei-bank.js?v=1.0.0",
        "./app.js?v=8.3.2"
      ],
      nextRecommendedPatch: "Bloco 6C — conectar app.js ao sensei-bank.js"
    }
  };

  console.log(
    "[NIHONGO321] Sensei Bank carregado:",
    window.NIHONGO321_SENSEI_BANK.version,
    {
      grammar: Object.keys(window.NIHONGO321_SENSEI_BANK.grammar || {}).length,
      scenarios: Object.keys(window.NIHONGO321_SENSEI_BANK.scenarios || {}).length,
      tones: Object.keys(window.NIHONGO321_SENSEI_BANK.tonePacks || {}).length
    }
  );
})();