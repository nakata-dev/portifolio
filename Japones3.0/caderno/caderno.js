/* =========================================================
   DIÁRIO321 — Protótipo 4.17.10-R — IA expansiva 10 variações
   Visual de diário de treino com mapa de cenários e frequência.
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "caderno321_v42";
  const NIHONGO321_BRIDGE_KEY = "nihongo321_caderno_saved_phrases_v1";


  const $app = document.getElementById("app");

  function clamp(n, min, max) {
    const value = Number(n);
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  let WORDS = [
  {
    "id": "h_a_asa",
    "category": "hiragana",
    "focus": "あ",
    "jp": "あさ",
    "romaji": "asa",
    "pt": "manhã",
    "type": "hiragana",
    "hint": "Treina あ em uma palavra curta.",
    "chars": [
      "あ",
      "さ"
    ]
  },
  {
    "id": "h_a_ame",
    "category": "hiragana",
    "focus": "あ",
    "jp": "あめ",
    "romaji": "ame",
    "pt": "chuva",
    "type": "hiragana",
    "hint": "Útil para o Japão real.",
    "chars": [
      "あ",
      "め"
    ]
  },
  {
    "id": "h_a_ashi",
    "category": "hiragana",
    "focus": "あ",
    "jp": "あし",
    "romaji": "ashi",
    "pt": "pé / perna",
    "type": "hiragana",
    "hint": "Corpo e saúde.",
    "chars": [
      "あ",
      "し"
    ]
  },
  {
    "id": "h_a_aka",
    "category": "hiragana",
    "focus": "あ",
    "jp": "あか",
    "romaji": "aka",
    "pt": "vermelho",
    "type": "hiragana",
    "hint": "Cor básica.",
    "chars": [
      "あ",
      "か"
    ]
  },
  {
    "id": "h_a_ao",
    "category": "hiragana",
    "focus": "あ",
    "jp": "あお",
    "romaji": "ao",
    "pt": "azul",
    "type": "hiragana",
    "hint": "Cor básica.",
    "chars": [
      "あ",
      "お"
    ]
  },
  {
    "id": "h_a_ani",
    "category": "hiragana",
    "focus": "あ",
    "jp": "あに",
    "romaji": "ani",
    "pt": "irmão mais velho",
    "type": "hiragana",
    "hint": "Família.",
    "chars": [
      "あ",
      "に"
    ]
  },
  {
    "id": "h_a_arigatou",
    "category": "hiragana",
    "focus": "あ",
    "jp": "ありがとう",
    "romaji": "arigatou",
    "pt": "obrigado",
    "type": "hiragana",
    "hint": "Palavra essencial.",
    "chars": [
      "あ",
      "り",
      "が",
      "と",
      "う"
    ]
  },
  {
    "id": "h_i_ie",
    "category": "hiragana",
    "focus": "い",
    "jp": "いえ",
    "romaji": "ie",
    "pt": "casa",
    "type": "hiragana",
    "hint": "Treina い e え.",
    "chars": [
      "い",
      "え"
    ]
  },
  {
    "id": "h_i_inu",
    "category": "hiragana",
    "focus": "い",
    "jp": "いぬ",
    "romaji": "inu",
    "pt": "cachorro",
    "type": "hiragana",
    "hint": "Vocabulário simples.",
    "chars": [
      "い",
      "ぬ"
    ]
  },
  {
    "id": "h_i_ishi",
    "category": "hiragana",
    "focus": "い",
    "jp": "いし",
    "romaji": "ishi",
    "pt": "pedra",
    "type": "hiragana",
    "hint": "Boa para distinguir sons.",
    "chars": [
      "い",
      "し"
    ]
  },
  {
    "id": "h_i_ima",
    "category": "hiragana",
    "focus": "い",
    "jp": "いま",
    "romaji": "ima",
    "pt": "agora",
    "type": "hiragana",
    "hint": "Muito útil em frases.",
    "chars": [
      "い",
      "ま"
    ]
  },
  {
    "id": "h_i_iku",
    "category": "hiragana",
    "focus": "い",
    "jp": "いく",
    "romaji": "iku",
    "pt": "ir",
    "type": "hiragana",
    "hint": "Verbo básico.",
    "chars": [
      "い",
      "く"
    ]
  },
  {
    "id": "h_i_iru",
    "category": "hiragana",
    "focus": "い",
    "jp": "いる",
    "romaji": "iru",
    "pt": "estar / existir",
    "type": "hiragana",
    "hint": "Base para frases.",
    "chars": [
      "い",
      "る"
    ]
  },
  {
    "id": "h_i_isogashii",
    "category": "hiragana",
    "focus": "い",
    "jp": "いそがしい",
    "romaji": "isogashii",
    "pt": "ocupado",
    "type": "hiragana",
    "hint": "Realidade de quem trabalha muito.",
    "chars": [
      "い",
      "そ",
      "が",
      "し",
      "い"
    ]
  },
  {
    "id": "h_u_umi",
    "category": "hiragana",
    "focus": "う",
    "jp": "うみ",
    "romaji": "umi",
    "pt": "mar",
    "type": "hiragana",
    "hint": "Palavra visual e simples.",
    "chars": [
      "う",
      "み"
    ]
  },
  {
    "id": "h_u_uma",
    "category": "hiragana",
    "focus": "う",
    "jp": "うま",
    "romaji": "uma",
    "pt": "cavalo",
    "type": "hiragana",
    "hint": "Vocabulário básico.",
    "chars": [
      "う",
      "ま"
    ]
  },
  {
    "id": "h_u_ushi",
    "category": "hiragana",
    "focus": "う",
    "jp": "うし",
    "romaji": "ushi",
    "pt": "vaca",
    "type": "hiragana",
    "hint": "Treina う e し.",
    "chars": [
      "う",
      "し"
    ]
  },
  {
    "id": "h_u_ue",
    "category": "hiragana",
    "focus": "う",
    "jp": "うえ",
    "romaji": "ue",
    "pt": "em cima",
    "type": "hiragana",
    "hint": "Localização.",
    "chars": [
      "う",
      "え"
    ]
  },
  {
    "id": "h_u_uso",
    "category": "hiragana",
    "focus": "う",
    "jp": "うそ",
    "romaji": "uso",
    "pt": "mentira",
    "type": "hiragana",
    "hint": "Conversa comum.",
    "chars": [
      "う",
      "そ"
    ]
  },
  {
    "id": "h_u_uta",
    "category": "hiragana",
    "focus": "う",
    "jp": "うた",
    "romaji": "uta",
    "pt": "música",
    "type": "hiragana",
    "hint": "Palavra curta.",
    "chars": [
      "う",
      "た"
    ]
  },
  {
    "id": "h_u_ureshii",
    "category": "hiragana",
    "focus": "う",
    "jp": "うれしい",
    "romaji": "ureshii",
    "pt": "feliz / contente",
    "type": "hiragana",
    "hint": "Vocabulário emocional.",
    "chars": [
      "う",
      "れ",
      "し",
      "い"
    ]
  },
  {
    "id": "h_e_eki",
    "category": "hiragana",
    "focus": "え",
    "jp": "えき",
    "romaji": "eki",
    "pt": "estação",
    "type": "hiragana",
    "hint": "Essencial no Japão.",
    "chars": [
      "え",
      "き"
    ]
  },
  {
    "id": "h_e_en",
    "category": "hiragana",
    "focus": "え",
    "jp": "えん",
    "romaji": "en",
    "pt": "iene / círculo",
    "type": "hiragana",
    "hint": "Dinheiro e preços.",
    "chars": [
      "え",
      "ん"
    ]
  },
  {
    "id": "h_e_ehon",
    "category": "hiragana",
    "focus": "え",
    "jp": "えほん",
    "romaji": "ehon",
    "pt": "livro ilustrado",
    "type": "hiragana",
    "hint": "Palavra simples.",
    "chars": [
      "え",
      "ほ",
      "ん"
    ]
  },
  {
    "id": "h_e_eda",
    "category": "hiragana",
    "focus": "え",
    "jp": "えだ",
    "romaji": "eda",
    "pt": "galho",
    "type": "hiragana",
    "hint": "Vocabulário básico.",
    "chars": [
      "え",
      "だ"
    ]
  },
  {
    "id": "h_e_egao",
    "category": "hiragana",
    "focus": "え",
    "jp": "えがお",
    "romaji": "egao",
    "pt": "sorriso",
    "type": "hiragana",
    "hint": "Palavra positiva.",
    "chars": [
      "え",
      "が",
      "お"
    ]
  },
  {
    "id": "h_e_erabu",
    "category": "hiragana",
    "focus": "え",
    "jp": "えらぶ",
    "romaji": "erabu",
    "pt": "escolher",
    "type": "hiragana",
    "hint": "Verbo útil.",
    "chars": [
      "え",
      "ら",
      "ぶ"
    ]
  },
  {
    "id": "h_e_enpitsu",
    "category": "hiragana",
    "focus": "え",
    "jp": "えんぴつ",
    "romaji": "enpitsu",
    "pt": "lápis",
    "type": "hiragana",
    "hint": "Combina com escrita.",
    "chars": [
      "え",
      "ん",
      "ぴ",
      "つ"
    ]
  },
  {
    "id": "h_o_okane",
    "category": "hiragana",
    "focus": "お",
    "jp": "おかね",
    "romaji": "okane",
    "pt": "dinheiro",
    "type": "hiragana",
    "hint": "Essencial para a vida no Japão.",
    "chars": [
      "お",
      "か",
      "ね"
    ]
  },
  {
    "id": "h_o_otona",
    "category": "hiragana",
    "focus": "お",
    "jp": "おとな",
    "romaji": "otona",
    "pt": "adulto",
    "type": "hiragana",
    "hint": "Vocabulário comum.",
    "chars": [
      "お",
      "と",
      "な"
    ]
  },
  {
    "id": "h_o_ongaku",
    "category": "hiragana",
    "focus": "お",
    "jp": "おんがく",
    "romaji": "ongaku",
    "pt": "música",
    "type": "hiragana",
    "hint": "Treina お e ん.",
    "chars": [
      "お",
      "ん",
      "が",
      "く"
    ]
  },
  {
    "id": "h_o_onaka",
    "category": "hiragana",
    "focus": "お",
    "jp": "おなか",
    "romaji": "onaka",
    "pt": "barriga",
    "type": "hiragana",
    "hint": "Saúde e cotidiano.",
    "chars": [
      "お",
      "な",
      "か"
    ]
  },
  {
    "id": "h_o_omoi",
    "category": "hiragana",
    "focus": "お",
    "jp": "おもい",
    "romaji": "omoi",
    "pt": "pesado / sentimento",
    "type": "hiragana",
    "hint": "Uso amplo.",
    "chars": [
      "お",
      "も",
      "い"
    ]
  },
  {
    "id": "h_o_osoi",
    "category": "hiragana",
    "focus": "お",
    "jp": "おそい",
    "romaji": "osoi",
    "pt": "tarde / lento",
    "type": "hiragana",
    "hint": "Trabalho e transporte.",
    "chars": [
      "お",
      "そ",
      "い"
    ]
  },
  {
    "id": "h_o_ohayou",
    "category": "hiragana",
    "focus": "お",
    "jp": "おはよう",
    "romaji": "ohayou",
    "pt": "bom dia",
    "type": "hiragana",
    "hint": "Cumprimento essencial.",
    "chars": [
      "お",
      "は",
      "よ",
      "う"
    ]
  },
  {
    "id": "k_a_apaato",
    "category": "katakana",
    "focus": "ア",
    "jp": "アパート",
    "romaji": "apaato",
    "pt": "apartamento",
    "type": "katakana",
    "hint": "Moradia no Japão.",
    "chars": [
      "ア",
      "パ",
      "ー",
      "ト"
    ]
  },
  {
    "id": "k_a_aisu",
    "category": "katakana",
    "focus": "ア",
    "jp": "アイス",
    "romaji": "aisu",
    "pt": "sorvete / gelo",
    "type": "katakana",
    "hint": "Lojas e mercado.",
    "chars": [
      "ア",
      "イ",
      "ス"
    ]
  },
  {
    "id": "k_a_amerika",
    "category": "katakana",
    "focus": "ア",
    "jp": "アメリカ",
    "romaji": "amerika",
    "pt": "Estados Unidos",
    "type": "katakana",
    "hint": "País em katakana.",
    "chars": [
      "ア",
      "メ",
      "リ",
      "カ"
    ]
  },
  {
    "id": "k_a_arubaito",
    "category": "katakana",
    "focus": "ア",
    "jp": "アルバイト",
    "romaji": "arubaito",
    "pt": "trabalho temporário",
    "type": "katakana",
    "hint": "Muito útil para brasileiros no Japão.",
    "chars": [
      "ア",
      "ル",
      "バ",
      "イ",
      "ト"
    ]
  },
  {
    "id": "k_a_anime",
    "category": "katakana",
    "focus": "ア",
    "jp": "アニメ",
    "romaji": "anime",
    "pt": "anime",
    "type": "katakana",
    "hint": "Palavra familiar.",
    "chars": [
      "ア",
      "ニ",
      "メ"
    ]
  },
  {
    "id": "k_a_akaunto",
    "category": "katakana",
    "focus": "ア",
    "jp": "アカウント",
    "romaji": "akaunto",
    "pt": "conta / account",
    "type": "katakana",
    "hint": "Celular e serviços.",
    "chars": [
      "ア",
      "カ",
      "ウ",
      "ン",
      "ト"
    ]
  },
  {
    "id": "k_a_apuri",
    "category": "katakana",
    "focus": "ア",
    "jp": "アプリ",
    "romaji": "apuri",
    "pt": "aplicativo",
    "type": "katakana",
    "hint": "Vocabulário digital.",
    "chars": [
      "ア",
      "プ",
      "リ"
    ]
  },
  {
    "id": "k_ka_kaado",
    "category": "katakana",
    "focus": "カ",
    "jp": "カード",
    "romaji": "kaado",
    "pt": "cartão",
    "type": "katakana",
    "hint": "Pagamentos.",
    "chars": [
      "カ",
      "ー",
      "ド"
    ]
  },
  {
    "id": "k_ka_kamera",
    "category": "katakana",
    "focus": "カ",
    "jp": "カメラ",
    "romaji": "kamera",
    "pt": "câmera",
    "type": "katakana",
    "hint": "Celular e loja.",
    "chars": [
      "カ",
      "メ",
      "ラ"
    ]
  },
  {
    "id": "k_ka_karee",
    "category": "katakana",
    "focus": "カ",
    "jp": "カレー",
    "romaji": "karee",
    "pt": "curry",
    "type": "katakana",
    "hint": "Comida comum.",
    "chars": [
      "カ",
      "レ",
      "ー"
    ]
  },
  {
    "id": "k_ka_kappu",
    "category": "katakana",
    "focus": "カ",
    "jp": "カップ",
    "romaji": "kappu",
    "pt": "copo / cup",
    "type": "katakana",
    "hint": "Produtos.",
    "chars": [
      "カ",
      "ッ",
      "プ"
    ]
  },
  {
    "id": "k_ka_kaban",
    "category": "katakana",
    "focus": "カ",
    "jp": "カバン",
    "romaji": "kaban",
    "pt": "bolsa / mochila",
    "type": "katakana",
    "hint": "Rotina.",
    "chars": [
      "カ",
      "バ",
      "ン"
    ]
  },
  {
    "id": "k_ka_karaoke",
    "category": "katakana",
    "focus": "カ",
    "jp": "カラオケ",
    "romaji": "karaoke",
    "pt": "karaokê",
    "type": "katakana",
    "hint": "Palavra conhecida.",
    "chars": [
      "カ",
      "ラ",
      "オ",
      "ケ"
    ]
  },
  {
    "id": "k_ka_kauntaa",
    "category": "katakana",
    "focus": "カ",
    "jp": "カウンター",
    "romaji": "kauntaa",
    "pt": "balcão",
    "type": "katakana",
    "hint": "Atendimento e lojas.",
    "chars": [
      "カ",
      "ウ",
      "ン",
      "タ",
      "ー"
    ]
  },
  {
    "id": "k_ko_konbini",
    "category": "katakana",
    "focus": "コ",
    "jp": "コンビニ",
    "romaji": "konbini",
    "pt": "loja de conveniência",
    "type": "katakana",
    "hint": "Essencial no Japão.",
    "chars": [
      "コ",
      "ン",
      "ビ",
      "ニ"
    ]
  },
  {
    "id": "k_ko_kopii",
    "category": "katakana",
    "focus": "コ",
    "jp": "コピー",
    "romaji": "kopii",
    "pt": "cópia",
    "type": "katakana",
    "hint": "Konbini e documentos.",
    "chars": [
      "コ",
      "ピ",
      "ー"
    ]
  },
  {
    "id": "k_ko_koohii",
    "category": "katakana",
    "focus": "コ",
    "jp": "コーヒー",
    "romaji": "koohii",
    "pt": "café",
    "type": "katakana",
    "hint": "Máquinas e lojas.",
    "chars": [
      "コ",
      "ー",
      "ヒ",
      "ー"
    ]
  },
  {
    "id": "k_ko_komento",
    "category": "katakana",
    "focus": "コ",
    "jp": "コメント",
    "romaji": "komento",
    "pt": "comentário",
    "type": "katakana",
    "hint": "Apps e internet.",
    "chars": [
      "コ",
      "メ",
      "ン",
      "ト"
    ]
  },
  {
    "id": "k_ko_koin",
    "category": "katakana",
    "focus": "コ",
    "jp": "コイン",
    "romaji": "koin",
    "pt": "moeda",
    "type": "katakana",
    "hint": "Máquinas e lavanderia.",
    "chars": [
      "コ",
      "イ",
      "ン"
    ]
  },
  {
    "id": "k_ko_konsento",
    "category": "katakana",
    "focus": "コ",
    "jp": "コンセント",
    "romaji": "konsento",
    "pt": "tomada",
    "type": "katakana",
    "hint": "Casa e trabalho.",
    "chars": [
      "コ",
      "ン",
      "セ",
      "ン",
      "ト"
    ]
  },
  {
    "id": "k_ko_kooto",
    "category": "katakana",
    "focus": "コ",
    "jp": "コート",
    "romaji": "kooto",
    "pt": "casaco",
    "type": "katakana",
    "hint": "Compras.",
    "chars": [
      "コ",
      "ー",
      "ト"
    ]
  },
  {
    "id": "k_su_suupaa",
    "category": "katakana",
    "focus": "ス",
    "jp": "スーパー",
    "romaji": "suupaa",
    "pt": "supermercado",
    "type": "katakana",
    "hint": "Essencial.",
    "chars": [
      "ス",
      "ー",
      "パ",
      "ー"
    ]
  },
  {
    "id": "k_su_sumaho",
    "category": "katakana",
    "focus": "ス",
    "jp": "スマホ",
    "romaji": "sumaho",
    "pt": "smartphone",
    "type": "katakana",
    "hint": "Palavra muito comum.",
    "chars": [
      "ス",
      "マ",
      "ホ"
    ]
  },
  {
    "id": "k_su_suutsu",
    "category": "katakana",
    "focus": "ス",
    "jp": "スーツ",
    "romaji": "suutsu",
    "pt": "terno",
    "type": "katakana",
    "hint": "Roupa e trabalho.",
    "chars": [
      "ス",
      "ー",
      "ツ"
    ]
  },
  {
    "id": "k_su_suupu",
    "category": "katakana",
    "focus": "ス",
    "jp": "スープ",
    "romaji": "suupu",
    "pt": "sopa",
    "type": "katakana",
    "hint": "Comida.",
    "chars": [
      "ス",
      "ー",
      "プ"
    ]
  },
  {
    "id": "k_su_supootsu",
    "category": "katakana",
    "focus": "ス",
    "jp": "スポーツ",
    "romaji": "supootsu",
    "pt": "esporte",
    "type": "katakana",
    "hint": "Uso comum.",
    "chars": [
      "ス",
      "ポ",
      "ー",
      "ツ"
    ]
  },
  {
    "id": "k_su_sukaato",
    "category": "katakana",
    "focus": "ス",
    "jp": "スカート",
    "romaji": "sukaato",
    "pt": "saia",
    "type": "katakana",
    "hint": "Roupa.",
    "chars": [
      "ス",
      "カ",
      "ー",
      "ト"
    ]
  },
  {
    "id": "k_su_sukejuuru",
    "category": "katakana",
    "focus": "ス",
    "jp": "スケジュール",
    "romaji": "sukejuuru",
    "pt": "agenda / cronograma",
    "type": "katakana",
    "hint": "Útil no trabalho.",
    "chars": [
      "ス",
      "ケ",
      "ジ",
      "ュ",
      "ー",
      "ル"
    ]
  },
  {
    "id": "j_hi",
    "category": "kanji",
    "focus": "日",
    "jp": "日",
    "romaji": "hi / nichi",
    "pt": "dia / sol",
    "type": "kanji",
    "hint": "Kanji essencial. Ordem detalhada virá em fase futura.",
    "chars": [
      "日"
    ]
  },
  {
    "id": "j_hito",
    "category": "kanji",
    "focus": "人",
    "jp": "人",
    "romaji": "hito",
    "pt": "pessoa",
    "type": "kanji",
    "hint": "Kanji muito básico.",
    "chars": [
      "人"
    ]
  },
  {
    "id": "j_mizu",
    "category": "kanji",
    "focus": "水",
    "jp": "水",
    "romaji": "mizu",
    "pt": "água",
    "type": "kanji",
    "hint": "Essencial no cotidiano.",
    "chars": [
      "水"
    ]
  },
  {
    "id": "j_en",
    "category": "kanji",
    "focus": "円",
    "jp": "円",
    "romaji": "en",
    "pt": "iene",
    "type": "kanji",
    "hint": "Muito importante para dinheiro.",
    "chars": [
      "円"
    ]
  },
  {
    "id": "j_eki",
    "category": "kanji",
    "focus": "駅",
    "jp": "駅",
    "romaji": "eki",
    "pt": "estação",
    "type": "kanji",
    "hint": "Vida no Japão.",
    "chars": [
      "駅"
    ]
  },
  {
    "id": "j_kuruma",
    "category": "kanji",
    "focus": "車",
    "jp": "車",
    "romaji": "kuruma",
    "pt": "carro",
    "type": "kanji",
    "hint": "Transporte.",
    "chars": [
      "車"
    ]
  },
  {
    "id": "j_shigoto",
    "category": "kanji",
    "focus": "仕",
    "jp": "仕事",
    "romaji": "shigoto",
    "pt": "trabalho",
    "type": "kanji",
    "hint": "Central para dekasseguis.",
    "chars": [
      "仕",
      "事"
    ]
  },
  {
    "id": "j_byouin",
    "category": "kanji",
    "focus": "病",
    "jp": "病院",
    "romaji": "byouin",
    "pt": "hospital",
    "type": "kanji",
    "hint": "Saúde e emergência.",
    "chars": [
      "病",
      "院"
    ]
  },
  {
    "id": "j_kaisha",
    "category": "kanji",
    "focus": "会",
    "jp": "会社",
    "romaji": "kaisha",
    "pt": "empresa",
    "type": "kanji",
    "hint": "Trabalho.",
    "chars": [
      "会",
      "社"
    ]
  },
  {
    "id": "j_ginkou",
    "category": "kanji",
    "focus": "銀",
    "jp": "銀行",
    "romaji": "ginkou",
    "pt": "banco",
    "type": "kanji",
    "hint": "Vida adulta.",
    "chars": [
      "銀",
      "行"
    ]
  }
,
{
  "id": "h_ka_kasa",
  "category": "hiragana",
  "focus": "か",
  "jp": "かさ",
  "romaji": "kasa",
  "pt": "guarda-chuva",
  "type": "hiragana",
  "hint": "Muito útil no Japão em dias de chuva.",
  "chars": [
    "か",
    "さ"
  ]
},
{
  "id": "h_ka_kao",
  "category": "hiragana",
  "focus": "か",
  "jp": "かお",
  "romaji": "kao",
  "pt": "rosto",
  "type": "hiragana",
  "hint": "Vocabulário básico do corpo.",
  "chars": [
    "か",
    "お"
  ]
},
{
  "id": "h_ka_kami",
  "category": "hiragana",
  "focus": "か",
  "jp": "かみ",
  "romaji": "kami",
  "pt": "papel / cabelo",
  "type": "hiragana",
  "hint": "Palavra comum, o sentido depende do contexto.",
  "chars": [
    "か",
    "み"
  ]
},
{
  "id": "h_ka_kagi",
  "category": "hiragana",
  "focus": "か",
  "jp": "かぎ",
  "romaji": "kagi",
  "pt": "chave",
  "type": "hiragana",
  "hint": "Essencial para casa, carro e trabalho.",
  "chars": [
    "か",
    "ぎ"
  ]
},
{
  "id": "h_ka_kaze",
  "category": "hiragana",
  "focus": "か",
  "jp": "かぜ",
  "romaji": "kaze",
  "pt": "vento / resfriado",
  "type": "hiragana",
  "hint": "Muito útil para clima e saúde.",
  "chars": [
    "か",
    "ぜ"
  ]
},
{
  "id": "h_ka_karai",
  "category": "hiragana",
  "focus": "か",
  "jp": "からい",
  "romaji": "karai",
  "pt": "apimentado",
  "type": "hiragana",
  "hint": "Útil em restaurantes e mercado.",
  "chars": [
    "か",
    "ら",
    "い"
  ]
},
{
  "id": "h_ka_kaisha",
  "category": "hiragana",
  "focus": "か",
  "jp": "かいしゃ",
  "romaji": "kaisha",
  "pt": "empresa",
  "type": "hiragana",
  "hint": "Palavra central para quem trabalha no Japão.",
  "chars": [
    "か",
    "い",
    "し",
    "ゃ"
  ]
},
{
  "id": "h_ki_ki",
  "category": "hiragana",
  "focus": "き",
  "jp": "き",
  "romaji": "ki",
  "pt": "árvore",
  "type": "hiragana",
  "hint": "Palavra curta para fixar き.",
  "chars": [
    "き"
  ]
},
{
  "id": "h_ki_kitte",
  "category": "hiragana",
  "focus": "き",
  "jp": "きって",
  "romaji": "kitte",
  "pt": "selo",
  "type": "hiragana",
  "hint": "Útil em correio e documentos.",
  "chars": [
    "き",
    "っ",
    "て"
  ]
},
{
  "id": "h_ki_kinou",
  "category": "hiragana",
  "focus": "き",
  "jp": "きのう",
  "romaji": "kinou",
  "pt": "ontem",
  "type": "hiragana",
  "hint": "Muito usada em conversas simples.",
  "chars": [
    "き",
    "の",
    "う"
  ]
},
{
  "id": "h_ki_kita",
  "category": "hiragana",
  "focus": "き",
  "jp": "きた",
  "romaji": "kita",
  "pt": "norte",
  "type": "hiragana",
  "hint": "Direção básica.",
  "chars": [
    "き",
    "た"
  ]
},
{
  "id": "h_ki_kiiro",
  "category": "hiragana",
  "focus": "き",
  "jp": "きいろ",
  "romaji": "kiiro",
  "pt": "amarelo",
  "type": "hiragana",
  "hint": "Cor básica.",
  "chars": [
    "き",
    "い",
    "ろ"
  ]
},
{
  "id": "h_ki_kimochi",
  "category": "hiragana",
  "focus": "き",
  "jp": "きもち",
  "romaji": "kimochi",
  "pt": "sentimento / sensação",
  "type": "hiragana",
  "hint": "Palavra útil para expressar estado e emoção.",
  "chars": [
    "き",
    "も",
    "ち"
  ]
},
{
  "id": "h_ki_kiken",
  "category": "hiragana",
  "focus": "き",
  "jp": "きけん",
  "romaji": "kiken",
  "pt": "perigo",
  "type": "hiragana",
  "hint": "Importante em placas e avisos.",
  "chars": [
    "き",
    "け",
    "ん"
  ]
},
{
  "id": "h_ku_kuchi",
  "category": "hiragana",
  "focus": "く",
  "jp": "くち",
  "romaji": "kuchi",
  "pt": "boca",
  "type": "hiragana",
  "hint": "Vocabulário do corpo.",
  "chars": [
    "く",
    "ち"
  ]
},
{
  "id": "h_ku_kutsu",
  "category": "hiragana",
  "focus": "く",
  "jp": "くつ",
  "romaji": "kutsu",
  "pt": "sapato",
  "type": "hiragana",
  "hint": "Útil para compras e rotina.",
  "chars": [
    "く",
    "つ"
  ]
},
{
  "id": "h_ku_kumo",
  "category": "hiragana",
  "focus": "く",
  "jp": "くも",
  "romaji": "kumo",
  "pt": "nuvem / aranha",
  "type": "hiragana",
  "hint": "Palavra visual e comum.",
  "chars": [
    "く",
    "も"
  ]
},
{
  "id": "h_ku_kusuri",
  "category": "hiragana",
  "focus": "く",
  "jp": "くすり",
  "romaji": "kusuri",
  "pt": "remédio",
  "type": "hiragana",
  "hint": "Essencial para farmácia e saúde.",
  "chars": [
    "く",
    "す",
    "り"
  ]
},
{
  "id": "h_ku_kurai",
  "category": "hiragana",
  "focus": "く",
  "jp": "くらい",
  "romaji": "kurai",
  "pt": "escuro",
  "type": "hiragana",
  "hint": "Útil no cotidiano.",
  "chars": [
    "く",
    "ら",
    "い"
  ]
},
{
  "id": "h_ku_kuruma",
  "category": "hiragana",
  "focus": "く",
  "jp": "くるま",
  "romaji": "kuruma",
  "pt": "carro",
  "type": "hiragana",
  "hint": "Palavra muito útil no Japão.",
  "chars": [
    "く",
    "る",
    "ま"
  ]
},
{
  "id": "h_ku_kudasai",
  "category": "hiragana",
  "focus": "く",
  "jp": "ください",
  "romaji": "kudasai",
  "pt": "por favor / me dê",
  "type": "hiragana",
  "hint": "Base de muitos pedidos.",
  "chars": [
    "く",
    "だ",
    "さ",
    "い"
  ]
},
{
  "id": "h_ke_ke",
  "category": "hiragana",
  "focus": "け",
  "jp": "け",
  "romaji": "ke",
  "pt": "cabelo / pelo",
  "type": "hiragana",
  "hint": "Palavra curta para fixar け.",
  "chars": [
    "け"
  ]
},
{
  "id": "h_ke_kemuri",
  "category": "hiragana",
  "focus": "け",
  "jp": "けむり",
  "romaji": "kemuri",
  "pt": "fumaça",
  "type": "hiragana",
  "hint": "Útil em avisos e situações reais.",
  "chars": [
    "け",
    "む",
    "り"
  ]
},
{
  "id": "h_ke_keshiki",
  "category": "hiragana",
  "focus": "け",
  "jp": "けしき",
  "romaji": "keshiki",
  "pt": "paisagem",
  "type": "hiragana",
  "hint": "Palavra bonita e útil.",
  "chars": [
    "け",
    "し",
    "き"
  ]
},
{
  "id": "h_ke_kega",
  "category": "hiragana",
  "focus": "け",
  "jp": "けが",
  "romaji": "kega",
  "pt": "machucado",
  "type": "hiragana",
  "hint": "Importante para saúde e trabalho.",
  "chars": [
    "け",
    "が"
  ]
},
{
  "id": "h_ke_keki",
  "category": "hiragana",
  "focus": "け",
  "jp": "けーき",
  "romaji": "keeki",
  "pt": "bolo",
  "type": "hiragana",
  "hint": "Palavra em hiragana para treino fonético.",
  "chars": [
    "け",
    "ー",
    "き"
  ]
},
{
  "id": "h_ke_kesa",
  "category": "hiragana",
  "focus": "け",
  "jp": "けさ",
  "romaji": "kesa",
  "pt": "esta manhã",
  "type": "hiragana",
  "hint": "Muito usada em conversas.",
  "chars": [
    "け",
    "さ"
  ]
},
{
  "id": "h_ke_kekkon",
  "category": "hiragana",
  "focus": "け",
  "jp": "けっこん",
  "romaji": "kekkon",
  "pt": "casamento",
  "type": "hiragana",
  "hint": "Vocabulário de vida.",
  "chars": [
    "け",
    "っ",
    "こ",
    "ん"
  ]
},
{
  "id": "h_ko_koe",
  "category": "hiragana",
  "focus": "こ",
  "jp": "こえ",
  "romaji": "koe",
  "pt": "voz",
  "type": "hiragana",
  "hint": "Útil para comunicação.",
  "chars": [
    "こ",
    "え"
  ]
},
{
  "id": "h_ko_koko",
  "category": "hiragana",
  "focus": "こ",
  "jp": "ここ",
  "romaji": "koko",
  "pt": "aqui",
  "type": "hiragana",
  "hint": "Essencial para localização.",
  "chars": [
    "こ",
    "こ"
  ]
},
{
  "id": "h_ko_kome",
  "category": "hiragana",
  "focus": "こ",
  "jp": "こめ",
  "romaji": "kome",
  "pt": "arroz cru",
  "type": "hiragana",
  "hint": "Muito comum no Japão.",
  "chars": [
    "こ",
    "め"
  ]
},
{
  "id": "h_ko_koshi",
  "category": "hiragana",
  "focus": "こ",
  "jp": "こし",
  "romaji": "koshi",
  "pt": "cintura / lombar",
  "type": "hiragana",
  "hint": "Útil para saúde e trabalho físico.",
  "chars": [
    "こ",
    "し"
  ]
},
{
  "id": "h_ko_kotoba",
  "category": "hiragana",
  "focus": "こ",
  "jp": "ことば",
  "romaji": "kotoba",
  "pt": "palavra / idioma",
  "type": "hiragana",
  "hint": "Central para aprendizado.",
  "chars": [
    "こ",
    "と",
    "ば"
  ]
},
{
  "id": "h_ko_kodomo",
  "category": "hiragana",
  "focus": "こ",
  "jp": "こども",
  "romaji": "kodomo",
  "pt": "criança",
  "type": "hiragana",
  "hint": "Vocabulário de família e vida.",
  "chars": [
    "こ",
    "ど",
    "も"
  ]
},
{
  "id": "h_ko_komaru",
  "category": "hiragana",
  "focus": "こ",
  "jp": "こまる",
  "romaji": "komaru",
  "pt": "ficar em apuros",
  "type": "hiragana",
  "hint": "Muito útil para expressar dificuldade.",
  "chars": [
    "こ",
    "ま",
    "る"
  ]
},
{
  "id": "k_ki_kiiro",
  "category": "katakana",
  "focus": "キ",
  "jp": "キーホルダー",
  "romaji": "kiihorudaa",
  "pt": "chaveiro",
  "type": "katakana",
  "hint": "Produto comum em lojas.",
  "chars": [
    "キ",
    "ー",
    "ホ",
    "ル",
    "ダ",
    "ー"
  ]
},
{
  "id": "k_ki_kisu",
  "category": "katakana",
  "focus": "キ",
  "jp": "キス",
  "romaji": "kisu",
  "pt": "beijo",
  "type": "katakana",
  "hint": "Palavra simples em katakana.",
  "chars": [
    "キ",
    "ス"
  ]
},
{
  "id": "k_ki_kicchin",
  "category": "katakana",
  "focus": "キ",
  "jp": "キッチン",
  "romaji": "kicchin",
  "pt": "cozinha",
  "type": "katakana",
  "hint": "Casa e moradia.",
  "chars": [
    "キ",
    "ッ",
    "チ",
    "ン"
  ]
},
{
  "id": "k_ki_kiwi",
  "category": "katakana",
  "focus": "キ",
  "jp": "キウイ",
  "romaji": "kiui",
  "pt": "kiwi",
  "type": "katakana",
  "hint": "Produto de mercado.",
  "chars": [
    "キ",
    "ウ",
    "イ"
  ]
},
{
  "id": "k_ki_kyabetsu",
  "category": "katakana",
  "focus": "キ",
  "jp": "キャベツ",
  "romaji": "kyabetsu",
  "pt": "repolho",
  "type": "katakana",
  "hint": "Comida comum no Japão.",
  "chars": [
    "キ",
    "ャ",
    "ベ",
    "ツ"
  ]
},
{
  "id": "k_ki_kyanseru",
  "category": "katakana",
  "focus": "キ",
  "jp": "キャンセル",
  "romaji": "kyanseru",
  "pt": "cancelamento",
  "type": "katakana",
  "hint": "Serviços, reservas e apps.",
  "chars": [
    "キ",
    "ャ",
    "ン",
    "セ",
    "ル"
  ]
},
{
  "id": "k_ki_kyarameru",
  "category": "katakana",
  "focus": "キ",
  "jp": "キャラメル",
  "romaji": "kyarameru",
  "pt": "caramelo",
  "type": "katakana",
  "hint": "Produto e sabor.",
  "chars": [
    "キ",
    "ャ",
    "ラ",
    "メ",
    "ル"
  ]
},
{
  "id": "k_ku_kuruma",
  "category": "katakana",
  "focus": "ク",
  "jp": "クラス",
  "romaji": "kurasu",
  "pt": "classe / aula",
  "type": "katakana",
  "hint": "Útil para estudo.",
  "chars": [
    "ク",
    "ラ",
    "ス"
  ]
},
{
  "id": "k_ku_kurabu",
  "category": "katakana",
  "focus": "ク",
  "jp": "クラブ",
  "romaji": "kurabu",
  "pt": "clube",
  "type": "katakana",
  "hint": "Uso comum.",
  "chars": [
    "ク",
    "ラ",
    "ブ"
  ]
},
{
  "id": "k_ku_kupon",
  "category": "katakana",
  "focus": "ク",
  "jp": "クーポン",
  "romaji": "kuupon",
  "pt": "cupom",
  "type": "katakana",
  "hint": "Muito útil em lojas e apps.",
  "chars": [
    "ク",
    "ー",
    "ポ",
    "ン"
  ]
},
{
  "id": "k_ku_kurisumasu",
  "category": "katakana",
  "focus": "ク",
  "jp": "クリスマス",
  "romaji": "kurisumasu",
  "pt": "Natal",
  "type": "katakana",
  "hint": "Evento comum.",
  "chars": [
    "ク",
    "リ",
    "ス",
    "マ",
    "ス"
  ]
},
{
  "id": "k_ku_kuriimu",
  "category": "katakana",
  "focus": "ク",
  "jp": "クリーム",
  "romaji": "kuriimu",
  "pt": "creme",
  "type": "katakana",
  "hint": "Produtos, comida e cosméticos.",
  "chars": [
    "ク",
    "リ",
    "ー",
    "ム"
  ]
},
{
  "id": "k_ku_kuriningu",
  "category": "katakana",
  "focus": "ク",
  "jp": "クリーニング",
  "romaji": "kuriiningu",
  "pt": "lavanderia / limpeza a seco",
  "type": "katakana",
  "hint": "Muito útil no Japão.",
  "chars": [
    "ク",
    "リ",
    "ー",
    "ニ",
    "ン",
    "グ"
  ]
},
{
  "id": "k_ku_kreditto",
  "category": "katakana",
  "focus": "ク",
  "jp": "クレジット",
  "romaji": "kurejitto",
  "pt": "crédito",
  "type": "katakana",
  "hint": "Pagamentos e cartões.",
  "chars": [
    "ク",
    "レ",
    "ジ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_ke_keeki",
  "category": "katakana",
  "focus": "ケ",
  "jp": "ケーキ",
  "romaji": "keeki",
  "pt": "bolo",
  "type": "katakana",
  "hint": "Comida e lojas.",
  "chars": [
    "ケ",
    "ー",
    "キ"
  ]
},
{
  "id": "k_ke_keesu",
  "category": "katakana",
  "focus": "ケ",
  "jp": "ケース",
  "romaji": "keesu",
  "pt": "caixa / case",
  "type": "katakana",
  "hint": "Produtos e celular.",
  "chars": [
    "ケ",
    "ー",
    "ス"
  ]
},
{
  "id": "k_ke_ketchup",
  "category": "katakana",
  "focus": "ケ",
  "jp": "ケチャップ",
  "romaji": "kechappu",
  "pt": "ketchup",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "ケ",
    "チ",
    "ャ",
    "ッ",
    "プ"
  ]
},
{
  "id": "k_ke_keara",
  "category": "katakana",
  "focus": "ケ",
  "jp": "ケア",
  "romaji": "kea",
  "pt": "cuidado / care",
  "type": "katakana",
  "hint": "Produtos e saúde.",
  "chars": [
    "ケ",
    "ア"
  ]
},
{
  "id": "k_ke_keeburu",
  "category": "katakana",
  "focus": "ケ",
  "jp": "ケーブル",
  "romaji": "keeburu",
  "pt": "cabo",
  "type": "katakana",
  "hint": "Eletrônicos e casa.",
  "chars": [
    "ケ",
    "ー",
    "ブ",
    "ル"
  ]
},
{
  "id": "k_ke_keitai",
  "category": "katakana",
  "focus": "ケ",
  "jp": "ケータイ",
  "romaji": "keetai",
  "pt": "celular",
  "type": "katakana",
  "hint": "Palavra comum para telefone celular.",
  "chars": [
    "ケ",
    "ー",
    "タ",
    "イ"
  ]
},
{
  "id": "k_ke_kenia",
  "category": "katakana",
  "focus": "ケ",
  "jp": "ケニア",
  "romaji": "kenia",
  "pt": "Quênia",
  "type": "katakana",
  "hint": "País em katakana.",
  "chars": [
    "ケ",
    "ニ",
    "ア"
  ]
},
{
  "id": "h_sa_sakana",
  "category": "hiragana",
  "focus": "さ",
  "jp": "さかな",
  "romaji": "sakana",
  "pt": "peixe",
  "type": "hiragana",
  "hint": "Palavra comum em mercado e comida.",
  "chars": [
    "さ",
    "か",
    "な"
  ]
},
{
  "id": "h_sa_sake",
  "category": "hiragana",
  "focus": "さ",
  "jp": "さけ",
  "romaji": "sake",
  "pt": "salmão / saquê",
  "type": "hiragana",
  "hint": "Palavra útil em mercado e restaurante.",
  "chars": [
    "さ",
    "け"
  ]
},
{
  "id": "h_sa_sakura",
  "category": "hiragana",
  "focus": "さ",
  "jp": "さくら",
  "romaji": "sakura",
  "pt": "flor de cerejeira",
  "type": "hiragana",
  "hint": "Palavra muito ligada ao Japão.",
  "chars": [
    "さ",
    "く",
    "ら"
  ]
},
{
  "id": "h_sa_samui",
  "category": "hiragana",
  "focus": "さ",
  "jp": "さむい",
  "romaji": "samui",
  "pt": "frio",
  "type": "hiragana",
  "hint": "Muito útil para clima e trabalho.",
  "chars": [
    "さ",
    "む",
    "い"
  ]
},
{
  "id": "h_sa_sato",
  "category": "hiragana",
  "focus": "さ",
  "jp": "さとう",
  "romaji": "satou",
  "pt": "açúcar",
  "type": "hiragana",
  "hint": "Mercado e cozinha.",
  "chars": [
    "さ",
    "と",
    "う"
  ]
},
{
  "id": "h_sa_sagaru",
  "category": "hiragana",
  "focus": "さ",
  "jp": "さがる",
  "romaji": "sagaru",
  "pt": "descer / baixar",
  "type": "hiragana",
  "hint": "Útil para preços, posição e movimento.",
  "chars": [
    "さ",
    "が",
    "る"
  ]
},
{
  "id": "h_sa_sagasu",
  "category": "hiragana",
  "focus": "さ",
  "jp": "さがす",
  "romaji": "sagasu",
  "pt": "procurar",
  "type": "hiragana",
  "hint": "Verbo muito útil no dia a dia.",
  "chars": [
    "さ",
    "が",
    "す"
  ]
},
{
  "id": "h_shi_shio",
  "category": "hiragana",
  "focus": "し",
  "jp": "しお",
  "romaji": "shio",
  "pt": "sal",
  "type": "hiragana",
  "hint": "Cozinha e mercado.",
  "chars": [
    "し",
    "お"
  ]
},
{
  "id": "h_shi_shita",
  "category": "hiragana",
  "focus": "し",
  "jp": "した",
  "romaji": "shita",
  "pt": "embaixo / língua",
  "type": "hiragana",
  "hint": "Palavra útil para localização.",
  "chars": [
    "し",
    "た"
  ]
},
{
  "id": "h_shi_shima",
  "category": "hiragana",
  "focus": "し",
  "jp": "しま",
  "romaji": "shima",
  "pt": "ilha",
  "type": "hiragana",
  "hint": "Vocabulário básico.",
  "chars": [
    "し",
    "ま"
  ]
},
{
  "id": "h_shi_shiro",
  "category": "hiragana",
  "focus": "し",
  "jp": "しろ",
  "romaji": "shiro",
  "pt": "branco",
  "type": "hiragana",
  "hint": "Cor básica.",
  "chars": [
    "し",
    "ろ"
  ]
},
{
  "id": "h_shi_shigoto",
  "category": "hiragana",
  "focus": "し",
  "jp": "しごと",
  "romaji": "shigoto",
  "pt": "trabalho",
  "type": "hiragana",
  "hint": "Palavra essencial para dekassegui.",
  "chars": [
    "し",
    "ご",
    "と"
  ]
},
{
  "id": "h_shi_shiraberu",
  "category": "hiragana",
  "focus": "し",
  "jp": "しらべる",
  "romaji": "shiraberu",
  "pt": "pesquisar / verificar",
  "type": "hiragana",
  "hint": "Muito útil no Japão real.",
  "chars": [
    "し",
    "ら",
    "べ",
    "る"
  ]
},
{
  "id": "h_shi_shinpai",
  "category": "hiragana",
  "focus": "し",
  "jp": "しんぱい",
  "romaji": "shinpai",
  "pt": "preocupação",
  "type": "hiragana",
  "hint": "Vocabulário emocional e útil.",
  "chars": [
    "し",
    "ん",
    "ぱ",
    "い"
  ]
},
{
  "id": "h_su_sushi",
  "category": "hiragana",
  "focus": "す",
  "jp": "すし",
  "romaji": "sushi",
  "pt": "sushi",
  "type": "hiragana",
  "hint": "Palavra familiar e fácil.",
  "chars": [
    "す",
    "し"
  ]
},
{
  "id": "h_su_suna",
  "category": "hiragana",
  "focus": "す",
  "jp": "すな",
  "romaji": "suna",
  "pt": "areia",
  "type": "hiragana",
  "hint": "Vocabulário simples.",
  "chars": [
    "す",
    "な"
  ]
},
{
  "id": "h_su_suki",
  "category": "hiragana",
  "focus": "す",
  "jp": "すき",
  "romaji": "suki",
  "pt": "gostar / favorito",
  "type": "hiragana",
  "hint": "Base para conversas.",
  "chars": [
    "す",
    "き"
  ]
},
{
  "id": "h_su_sukoshi",
  "category": "hiragana",
  "focus": "す",
  "jp": "すこし",
  "romaji": "sukoshi",
  "pt": "um pouco",
  "type": "hiragana",
  "hint": "Muito útil para comunicação prática.",
  "chars": [
    "す",
    "こ",
    "し"
  ]
},
{
  "id": "h_su_sumimasen",
  "category": "hiragana",
  "focus": "す",
  "jp": "すみません",
  "romaji": "sumimasen",
  "pt": "desculpe / com licença",
  "type": "hiragana",
  "hint": "Frase essencial no Japão.",
  "chars": [
    "す",
    "み",
    "ま",
    "せ",
    "ん"
  ]
},
{
  "id": "h_su_suwaru",
  "category": "hiragana",
  "focus": "す",
  "jp": "すわる",
  "romaji": "suwaru",
  "pt": "sentar",
  "type": "hiragana",
  "hint": "Verbo útil.",
  "chars": [
    "す",
    "わ",
    "る"
  ]
},
{
  "id": "h_su_sugoi",
  "category": "hiragana",
  "focus": "す",
  "jp": "すごい",
  "romaji": "sugoi",
  "pt": "incrível / muito",
  "type": "hiragana",
  "hint": "Palavra muito usada em conversa.",
  "chars": [
    "す",
    "ご",
    "い"
  ]
},
{
  "id": "h_se_seki",
  "category": "hiragana",
  "focus": "せ",
  "jp": "せき",
  "romaji": "seki",
  "pt": "assento / tosse",
  "type": "hiragana",
  "hint": "Muito útil em transporte e saúde.",
  "chars": [
    "せ",
    "き"
  ]
},
{
  "id": "h_se_sekai",
  "category": "hiragana",
  "focus": "せ",
  "jp": "せかい",
  "romaji": "sekai",
  "pt": "mundo",
  "type": "hiragana",
  "hint": "Vocabulário básico.",
  "chars": [
    "せ",
    "か",
    "い"
  ]
},
{
  "id": "h_se_semai",
  "category": "hiragana",
  "focus": "せ",
  "jp": "せまい",
  "romaji": "semai",
  "pt": "estreito / apertado",
  "type": "hiragana",
  "hint": "Útil para casa, rua e espaço.",
  "chars": [
    "せ",
    "ま",
    "い"
  ]
},
{
  "id": "h_se_sen",
  "category": "hiragana",
  "focus": "せ",
  "jp": "せん",
  "romaji": "sen",
  "pt": "mil / linha",
  "type": "hiragana",
  "hint": "Base para números e leitura.",
  "chars": [
    "せ",
    "ん"
  ]
},
{
  "id": "h_se_sensei",
  "category": "hiragana",
  "focus": "せ",
  "jp": "せんせい",
  "romaji": "sensei",
  "pt": "professor",
  "type": "hiragana",
  "hint": "Palavra essencial para estudo.",
  "chars": [
    "せ",
    "ん",
    "せ",
    "い"
  ]
},
{
  "id": "h_se_sentaku",
  "category": "hiragana",
  "focus": "せ",
  "jp": "せんたく",
  "romaji": "sentaku",
  "pt": "lavagem / escolha",
  "type": "hiragana",
  "hint": "Útil para lavanderia e rotina.",
  "chars": [
    "せ",
    "ん",
    "た",
    "く"
  ]
},
{
  "id": "h_se_setsumei",
  "category": "hiragana",
  "focus": "せ",
  "jp": "せつめい",
  "romaji": "setsumei",
  "pt": "explicação",
  "type": "hiragana",
  "hint": "Muito útil no app e na vida real.",
  "chars": [
    "せ",
    "つ",
    "め",
    "い"
  ]
},
{
  "id": "h_so_sora",
  "category": "hiragana",
  "focus": "そ",
  "jp": "そら",
  "romaji": "sora",
  "pt": "céu",
  "type": "hiragana",
  "hint": "Palavra visual e simples.",
  "chars": [
    "そ",
    "ら"
  ]
},
{
  "id": "h_so_soto",
  "category": "hiragana",
  "focus": "そ",
  "jp": "そと",
  "romaji": "soto",
  "pt": "fora",
  "type": "hiragana",
  "hint": "Localização essencial.",
  "chars": [
    "そ",
    "と"
  ]
},
{
  "id": "h_so_soba",
  "category": "hiragana",
  "focus": "そ",
  "jp": "そば",
  "romaji": "soba",
  "pt": "perto / macarrão soba",
  "type": "hiragana",
  "hint": "Comum em comida e localização.",
  "chars": [
    "そ",
    "ば"
  ]
},
{
  "id": "h_so_soko",
  "category": "hiragana",
  "focus": "そ",
  "jp": "そこ",
  "romaji": "soko",
  "pt": "aí / esse lugar",
  "type": "hiragana",
  "hint": "Muito útil em conversa.",
  "chars": [
    "そ",
    "こ"
  ]
},
{
  "id": "h_so_sore",
  "category": "hiragana",
  "focus": "そ",
  "jp": "それ",
  "romaji": "sore",
  "pt": "isso",
  "type": "hiragana",
  "hint": "Base de conversas simples.",
  "chars": [
    "そ",
    "れ"
  ]
},
{
  "id": "h_so_souji",
  "category": "hiragana",
  "focus": "そ",
  "jp": "そうじ",
  "romaji": "souji",
  "pt": "limpeza",
  "type": "hiragana",
  "hint": "Rotina de casa e trabalho.",
  "chars": [
    "そ",
    "う",
    "じ"
  ]
},
{
  "id": "h_so_soudan",
  "category": "hiragana",
  "focus": "そ",
  "jp": "そうだん",
  "romaji": "soudan",
  "pt": "consulta / conversa para pedir conselho",
  "type": "hiragana",
  "hint": "Muito útil para problemas reais.",
  "chars": [
    "そ",
    "う",
    "だ",
    "ん"
  ]
},
{
  "id": "k_sa_saabisu",
  "category": "katakana",
  "focus": "サ",
  "jp": "サービス",
  "romaji": "saabisu",
  "pt": "serviço / brinde",
  "type": "katakana",
  "hint": "Muito comum em lojas e atendimento.",
  "chars": [
    "サ",
    "ー",
    "ビ",
    "ス"
  ]
},
{
  "id": "k_sa_saizu",
  "category": "katakana",
  "focus": "サ",
  "jp": "サイズ",
  "romaji": "saizu",
  "pt": "tamanho",
  "type": "katakana",
  "hint": "Essencial para compras.",
  "chars": [
    "サ",
    "イ",
    "ズ"
  ]
},
{
  "id": "k_sa_sarada",
  "category": "katakana",
  "focus": "サ",
  "jp": "サラダ",
  "romaji": "sarada",
  "pt": "salada",
  "type": "katakana",
  "hint": "Comida e konbini.",
  "chars": [
    "サ",
    "ラ",
    "ダ"
  ]
},
{
  "id": "k_sa_sando",
  "category": "katakana",
  "focus": "サ",
  "jp": "サンド",
  "romaji": "sando",
  "pt": "sanduíche",
  "type": "katakana",
  "hint": "Comida comum.",
  "chars": [
    "サ",
    "ン",
    "ド"
  ]
},
{
  "id": "k_sa_sanpuru",
  "category": "katakana",
  "focus": "サ",
  "jp": "サンプル",
  "romaji": "sanpuru",
  "pt": "amostra / sample",
  "type": "katakana",
  "hint": "Produtos e lojas.",
  "chars": [
    "サ",
    "ン",
    "プ",
    "ル"
  ]
},
{
  "id": "k_sa_sain",
  "category": "katakana",
  "focus": "サ",
  "jp": "サイン",
  "romaji": "sain",
  "pt": "assinatura / sinal",
  "type": "katakana",
  "hint": "Documentos e atendimento.",
  "chars": [
    "サ",
    "イ",
    "ン"
  ]
},
{
  "id": "k_sa_sapooruto",
  "category": "katakana",
  "focus": "サ",
  "jp": "サポート",
  "romaji": "sapootto",
  "pt": "suporte / apoio",
  "type": "katakana",
  "hint": "Serviços e apps.",
  "chars": [
    "サ",
    "ポ",
    "ー",
    "ト"
  ]
},
{
  "id": "k_shi_shatsu",
  "category": "katakana",
  "focus": "シ",
  "jp": "シャツ",
  "romaji": "shatsu",
  "pt": "camisa",
  "type": "katakana",
  "hint": "Roupa e compras.",
  "chars": [
    "シ",
    "ャ",
    "ツ"
  ]
},
{
  "id": "k_shi_shanpuu",
  "category": "katakana",
  "focus": "シ",
  "jp": "シャンプー",
  "romaji": "shanpuu",
  "pt": "shampoo",
  "type": "katakana",
  "hint": "Mercado e farmácia.",
  "chars": [
    "シ",
    "ャ",
    "ン",
    "プ",
    "ー"
  ]
},
{
  "id": "k_shi_shiiru",
  "category": "katakana",
  "focus": "シ",
  "jp": "シール",
  "romaji": "shiiru",
  "pt": "adesivo / selo",
  "type": "katakana",
  "hint": "Produtos e documentos.",
  "chars": [
    "シ",
    "ー",
    "ル"
  ]
},
{
  "id": "k_shi_shisutemu",
  "category": "katakana",
  "focus": "シ",
  "jp": "システム",
  "romaji": "shisutemu",
  "pt": "sistema",
  "type": "katakana",
  "hint": "Trabalho e tecnologia.",
  "chars": [
    "シ",
    "ス",
    "テ",
    "ム"
  ]
},
{
  "id": "k_shi_shifuto",
  "category": "katakana",
  "focus": "シ",
  "jp": "シフト",
  "romaji": "shifuto",
  "pt": "turno / escala",
  "type": "katakana",
  "hint": "Palavra muito útil em fábrica.",
  "chars": [
    "シ",
    "フ",
    "ト"
  ]
},
{
  "id": "k_shi_shoppu",
  "category": "katakana",
  "focus": "シ",
  "jp": "ショップ",
  "romaji": "shoppu",
  "pt": "loja / shop",
  "type": "katakana",
  "hint": "Compras e internet.",
  "chars": [
    "シ",
    "ョ",
    "ッ",
    "プ"
  ]
},
{
  "id": "k_shi_shinguru",
  "category": "katakana",
  "focus": "シ",
  "jp": "シングル",
  "romaji": "shinguru",
  "pt": "solteiro / individual",
  "type": "katakana",
  "hint": "Planos, quartos e produtos.",
  "chars": [
    "シ",
    "ン",
    "グ",
    "ル"
  ]
},
{
  "id": "k_se_seeru",
  "category": "katakana",
  "focus": "セ",
  "jp": "セール",
  "romaji": "seeru",
  "pt": "promoção / liquidação",
  "type": "katakana",
  "hint": "Muito útil em lojas.",
  "chars": [
    "セ",
    "ー",
    "ル"
  ]
},
{
  "id": "k_se_setto",
  "category": "katakana",
  "focus": "セ",
  "jp": "セット",
  "romaji": "setto",
  "pt": "conjunto / set",
  "type": "katakana",
  "hint": "Comida, produtos e serviços.",
  "chars": [
    "セ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_se_sentaa",
  "category": "katakana",
  "focus": "セ",
  "jp": "センター",
  "romaji": "sentaa",
  "pt": "centro / center",
  "type": "katakana",
  "hint": "Locais e atendimento.",
  "chars": [
    "セ",
    "ン",
    "タ",
    "ー"
  ]
},
{
  "id": "k_se_sebun",
  "category": "katakana",
  "focus": "セ",
  "jp": "セブン",
  "romaji": "sebun",
  "pt": "Seven / loja Seven Eleven",
  "type": "katakana",
  "hint": "Muito comum no Japão.",
  "chars": [
    "セ",
    "ブ",
    "ン"
  ]
},
{
  "id": "k_se_serofuan",
  "category": "katakana",
  "focus": "セ",
  "jp": "セロファン",
  "romaji": "serofan",
  "pt": "celofane",
  "type": "katakana",
  "hint": "Produto simples de loja.",
  "chars": [
    "セ",
    "ロ",
    "フ",
    "ァ",
    "ン"
  ]
},
{
  "id": "k_se_sekyuriti",
  "category": "katakana",
  "focus": "セ",
  "jp": "セキュリティ",
  "romaji": "sekyuriti",
  "pt": "segurança",
  "type": "katakana",
  "hint": "Tecnologia e serviços.",
  "chars": [
    "セ",
    "キ",
    "ュ",
    "リ",
    "テ",
    "ィ"
  ]
},
{
  "id": "k_se_sensaa",
  "category": "katakana",
  "focus": "セ",
  "jp": "センサー",
  "romaji": "sensaa",
  "pt": "sensor",
  "type": "katakana",
  "hint": "Casa, carro e fábrica.",
  "chars": [
    "セ",
    "ン",
    "サ",
    "ー"
  ]
},
{
  "id": "k_so_soosu",
  "category": "katakana",
  "focus": "ソ",
  "jp": "ソース",
  "romaji": "soosu",
  "pt": "molho",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "ソ",
    "ー",
    "ス"
  ]
},
{
  "id": "k_so_sofa",
  "category": "katakana",
  "focus": "ソ",
  "jp": "ソファ",
  "romaji": "sofa",
  "pt": "sofá",
  "type": "katakana",
  "hint": "Casa e compras.",
  "chars": [
    "ソ",
    "フ",
    "ァ"
  ]
},
{
  "id": "k_so_sokkusu",
  "category": "katakana",
  "focus": "ソ",
  "jp": "ソックス",
  "romaji": "sokkusu",
  "pt": "meias",
  "type": "katakana",
  "hint": "Roupa e trabalho.",
  "chars": [
    "ソ",
    "ッ",
    "ク",
    "ス"
  ]
},
{
  "id": "k_so_sonii",
  "category": "katakana",
  "focus": "ソ",
  "jp": "ソニー",
  "romaji": "sonii",
  "pt": "Sony",
  "type": "katakana",
  "hint": "Marca comum em eletrônicos.",
  "chars": [
    "ソ",
    "ニ",
    "ー"
  ]
},
{
  "id": "k_so_soruto",
  "category": "katakana",
  "focus": "ソ",
  "jp": "ソルト",
  "romaji": "soruto",
  "pt": "sal / salt",
  "type": "katakana",
  "hint": "Produto e comida.",
  "chars": [
    "ソ",
    "ル",
    "ト"
  ]
},
{
  "id": "k_so_sosharu",
  "category": "katakana",
  "focus": "ソ",
  "jp": "ソーシャル",
  "romaji": "soosharu",
  "pt": "social",
  "type": "katakana",
  "hint": "Apps e internet.",
  "chars": [
    "ソ",
    "ー",
    "シ",
    "ャ",
    "ル"
  ]
},
{
  "id": "k_so_softo",
  "category": "katakana",
  "focus": "ソ",
  "jp": "ソフト",
  "romaji": "sofuto",
  "pt": "macio / software",
  "type": "katakana",
  "hint": "Produtos e tecnologia.",
  "chars": [
    "ソ",
    "フ",
    "ト"
  ]
},
{
  "id": "h_ta_tako",
  "category": "hiragana",
  "focus": "た",
  "jp": "たこ",
  "romaji": "tako",
  "pt": "polvo / pipa",
  "type": "hiragana",
  "hint": "Palavra simples e visual para fixar た.",
  "chars": [
    "た",
    "こ"
  ]
},
{
  "id": "h_ta_takai",
  "category": "hiragana",
  "focus": "た",
  "jp": "たかい",
  "romaji": "takai",
  "pt": "alto / caro",
  "type": "hiragana",
  "hint": "Muito útil em compras e comparação.",
  "chars": [
    "た",
    "か",
    "い"
  ]
},
{
  "id": "h_ta_tamago",
  "category": "hiragana",
  "focus": "た",
  "jp": "たまご",
  "romaji": "tamago",
  "pt": "ovo",
  "type": "hiragana",
  "hint": "Comida muito comum.",
  "chars": [
    "た",
    "ま",
    "ご"
  ]
},
{
  "id": "h_ta_tanoshii",
  "category": "hiragana",
  "focus": "た",
  "jp": "たのしい",
  "romaji": "tanoshii",
  "pt": "divertido / agradável",
  "type": "hiragana",
  "hint": "Vocabulário emocional útil.",
  "chars": [
    "た",
    "の",
    "し",
    "い"
  ]
},
{
  "id": "h_ta_tasukeru",
  "category": "hiragana",
  "focus": "た",
  "jp": "たすける",
  "romaji": "tasukeru",
  "pt": "ajudar / salvar",
  "type": "hiragana",
  "hint": "Palavra importante em situações difíceis.",
  "chars": [
    "た",
    "す",
    "け",
    "る"
  ]
},
{
  "id": "h_ta_taberu",
  "category": "hiragana",
  "focus": "た",
  "jp": "たべる",
  "romaji": "taberu",
  "pt": "comer",
  "type": "hiragana",
  "hint": "Verbo essencial.",
  "chars": [
    "た",
    "べ",
    "る"
  ]
},
{
  "id": "h_ta_taoru",
  "category": "hiragana",
  "focus": "た",
  "jp": "たおる",
  "romaji": "taoru",
  "pt": "cair / derrubar",
  "type": "hiragana",
  "hint": "Útil para situações do cotidiano.",
  "chars": [
    "た",
    "お",
    "る"
  ]
},
{
  "id": "h_chi_chika",
  "category": "hiragana",
  "focus": "ち",
  "jp": "ちかい",
  "romaji": "chikai",
  "pt": "perto",
  "type": "hiragana",
  "hint": "Localização essencial.",
  "chars": [
    "ち",
    "か",
    "い"
  ]
},
{
  "id": "h_chi_chikara",
  "category": "hiragana",
  "focus": "ち",
  "jp": "ちから",
  "romaji": "chikara",
  "pt": "força",
  "type": "hiragana",
  "hint": "Palavra útil para trabalho e corpo.",
  "chars": [
    "ち",
    "か",
    "ら"
  ]
},
{
  "id": "h_chi_chizu",
  "category": "hiragana",
  "focus": "ち",
  "jp": "ちず",
  "romaji": "chizu",
  "pt": "mapa",
  "type": "hiragana",
  "hint": "Útil para localização.",
  "chars": [
    "ち",
    "ず"
  ]
},
{
  "id": "h_chi_chichi",
  "category": "hiragana",
  "focus": "ち",
  "jp": "ちち",
  "romaji": "chichi",
  "pt": "pai",
  "type": "hiragana",
  "hint": "Família.",
  "chars": [
    "ち",
    "ち"
  ]
},
{
  "id": "h_chi_chigau",
  "category": "hiragana",
  "focus": "ち",
  "jp": "ちがう",
  "romaji": "chigau",
  "pt": "estar diferente / estar errado",
  "type": "hiragana",
  "hint": "Muito útil em conversa.",
  "chars": [
    "ち",
    "が",
    "う"
  ]
},
{
  "id": "h_chi_chiisana",
  "category": "hiragana",
  "focus": "ち",
  "jp": "ちいさい",
  "romaji": "chiisai",
  "pt": "pequeno",
  "type": "hiragana",
  "hint": "Adjetivo básico.",
  "chars": [
    "ち",
    "い",
    "さ",
    "い"
  ]
},
{
  "id": "h_chi_chuumon",
  "category": "hiragana",
  "focus": "ち",
  "jp": "ちゅうもん",
  "romaji": "chuumon",
  "pt": "pedido / encomenda",
  "type": "hiragana",
  "hint": "Útil em restaurante, compras e entrega.",
  "chars": [
    "ち",
    "ゅ",
    "う",
    "も",
    "ん"
  ]
},
{
  "id": "h_tsu_tsuki",
  "category": "hiragana",
  "focus": "つ",
  "jp": "つき",
  "romaji": "tsuki",
  "pt": "lua / mês",
  "type": "hiragana",
  "hint": "Palavra básica e comum.",
  "chars": [
    "つ",
    "き"
  ]
},
{
  "id": "h_tsu_tsukue",
  "category": "hiragana",
  "focus": "つ",
  "jp": "つくえ",
  "romaji": "tsukue",
  "pt": "mesa / escrivaninha",
  "type": "hiragana",
  "hint": "Casa e estudo.",
  "chars": [
    "つ",
    "く",
    "え"
  ]
},
{
  "id": "h_tsu_tsukau",
  "category": "hiragana",
  "focus": "つ",
  "jp": "つかう",
  "romaji": "tsukau",
  "pt": "usar",
  "type": "hiragana",
  "hint": "Verbo essencial.",
  "chars": [
    "つ",
    "か",
    "う"
  ]
},
{
  "id": "h_tsu_tsukareta",
  "category": "hiragana",
  "focus": "つ",
  "jp": "つかれた",
  "romaji": "tsukareta",
  "pt": "cansado",
  "type": "hiragana",
  "hint": "Realidade forte do público do app.",
  "chars": [
    "つ",
    "か",
    "れ",
    "た"
  ]
},
{
  "id": "h_tsu_tsuyoi",
  "category": "hiragana",
  "focus": "つ",
  "jp": "つよい",
  "romaji": "tsuyoi",
  "pt": "forte",
  "type": "hiragana",
  "hint": "Adjetivo útil.",
  "chars": [
    "つ",
    "よ",
    "い"
  ]
},
{
  "id": "h_tsu_tsumetai",
  "category": "hiragana",
  "focus": "つ",
  "jp": "つめたい",
  "romaji": "tsumetai",
  "pt": "frio ao toque",
  "type": "hiragana",
  "hint": "Útil para bebida, comida e clima.",
  "chars": [
    "つ",
    "め",
    "た",
    "い"
  ]
},
{
  "id": "h_tsu_tsutsumu",
  "category": "hiragana",
  "focus": "つ",
  "jp": "つつむ",
  "romaji": "tsutsumu",
  "pt": "embrulhar",
  "type": "hiragana",
  "hint": "Útil em compras e presentes.",
  "chars": [
    "つ",
    "つ",
    "む"
  ]
},
{
  "id": "h_te_te",
  "category": "hiragana",
  "focus": "て",
  "jp": "て",
  "romaji": "te",
  "pt": "mão",
  "type": "hiragana",
  "hint": "Palavra curta e essencial.",
  "chars": [
    "て"
  ]
},
{
  "id": "h_te_tenki",
  "category": "hiragana",
  "focus": "て",
  "jp": "てんき",
  "romaji": "tenki",
  "pt": "tempo / clima",
  "type": "hiragana",
  "hint": "Muito útil no Japão.",
  "chars": [
    "て",
    "ん",
    "き"
  ]
},
{
  "id": "h_te_tegaru",
  "category": "hiragana",
  "focus": "て",
  "jp": "てがる",
  "romaji": "tegaru",
  "pt": "simples / prático",
  "type": "hiragana",
  "hint": "Boa palavra para o conceito do app.",
  "chars": [
    "て",
    "が",
    "る"
  ]
},
{
  "id": "h_te_tetsudau",
  "category": "hiragana",
  "focus": "て",
  "jp": "てつだう",
  "romaji": "tetsudau",
  "pt": "ajudar",
  "type": "hiragana",
  "hint": "Verbo útil no trabalho e em casa.",
  "chars": [
    "て",
    "つ",
    "だ",
    "う"
  ]
},
{
  "id": "h_te_ten",
  "category": "hiragana",
  "focus": "て",
  "jp": "てん",
  "romaji": "ten",
  "pt": "ponto / loja",
  "type": "hiragana",
  "hint": "Palavra curta para fixar て.",
  "chars": [
    "て",
    "ん"
  ]
},
{
  "id": "h_te_tencho",
  "category": "hiragana",
  "focus": "て",
  "jp": "てんちょう",
  "romaji": "tenchou",
  "pt": "gerente de loja",
  "type": "hiragana",
  "hint": "Útil em comércio e trabalho.",
  "chars": [
    "て",
    "ん",
    "ち",
    "ょ",
    "う"
  ]
},
{
  "id": "h_te_teinei",
  "category": "hiragana",
  "focus": "て",
  "jp": "ていねい",
  "romaji": "teinei",
  "pt": "educado / cuidadoso",
  "type": "hiragana",
  "hint": "Importante para convivência no Japão.",
  "chars": [
    "て",
    "い",
    "ね",
    "い"
  ]
},
{
  "id": "h_to_tokei",
  "category": "hiragana",
  "focus": "と",
  "jp": "とけい",
  "romaji": "tokei",
  "pt": "relógio",
  "type": "hiragana",
  "hint": "Rotina e horários.",
  "chars": [
    "と",
    "け",
    "い"
  ]
},
{
  "id": "h_to_tomato",
  "category": "hiragana",
  "focus": "と",
  "jp": "とまと",
  "romaji": "tomato",
  "pt": "tomate",
  "type": "hiragana",
  "hint": "Comida e mercado.",
  "chars": [
    "と",
    "ま",
    "と"
  ]
},
{
  "id": "h_to_tomodachi",
  "category": "hiragana",
  "focus": "と",
  "jp": "ともだち",
  "romaji": "tomodachi",
  "pt": "amigo",
  "type": "hiragana",
  "hint": "Vocabulário social.",
  "chars": [
    "と",
    "も",
    "だ",
    "ち"
  ]
},
{
  "id": "h_to_tonari",
  "category": "hiragana",
  "focus": "と",
  "jp": "となり",
  "romaji": "tonari",
  "pt": "ao lado",
  "type": "hiragana",
  "hint": "Localização essencial.",
  "chars": [
    "と",
    "な",
    "り"
  ]
},
{
  "id": "h_to_tobu",
  "category": "hiragana",
  "focus": "と",
  "jp": "とぶ",
  "romaji": "tobu",
  "pt": "voar",
  "type": "hiragana",
  "hint": "Verbo simples.",
  "chars": [
    "と",
    "ぶ"
  ]
},
{
  "id": "h_to_tomaru",
  "category": "hiragana",
  "focus": "と",
  "jp": "とまる",
  "romaji": "tomaru",
  "pt": "parar / hospedar-se",
  "type": "hiragana",
  "hint": "Muito útil em transporte e placas.",
  "chars": [
    "と",
    "ま",
    "る"
  ]
},
{
  "id": "h_to_torikaeru",
  "category": "hiragana",
  "focus": "と",
  "jp": "とりかえる",
  "romaji": "torikaeru",
  "pt": "trocar / substituir",
  "type": "hiragana",
  "hint": "Útil em compras, peças e trabalho.",
  "chars": [
    "と",
    "り",
    "か",
    "え",
    "る"
  ]
},
{
  "id": "k_ta_takushii",
  "category": "katakana",
  "focus": "タ",
  "jp": "タクシー",
  "romaji": "takushii",
  "pt": "táxi",
  "type": "katakana",
  "hint": "Transporte no Japão.",
  "chars": [
    "タ",
    "ク",
    "シ",
    "ー"
  ]
},
{
  "id": "k_ta_taoru",
  "category": "katakana",
  "focus": "タ",
  "jp": "タオル",
  "romaji": "taoru",
  "pt": "toalha",
  "type": "katakana",
  "hint": "Casa, banho e trabalho.",
  "chars": [
    "タ",
    "オ",
    "ル"
  ]
},
{
  "id": "k_ta_tamago",
  "category": "katakana",
  "focus": "タ",
  "jp": "タマゴ",
  "romaji": "tamago",
  "pt": "ovo",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "タ",
    "マ",
    "ゴ"
  ]
},
{
  "id": "k_ta_tanku",
  "category": "katakana",
  "focus": "タ",
  "jp": "タンク",
  "romaji": "tanku",
  "pt": "tanque",
  "type": "katakana",
  "hint": "Produtos, carro e fábrica.",
  "chars": [
    "タ",
    "ン",
    "ク"
  ]
},
{
  "id": "k_ta_taipu",
  "category": "katakana",
  "focus": "タ",
  "jp": "タイプ",
  "romaji": "taipu",
  "pt": "tipo",
  "type": "katakana",
  "hint": "Produtos e escolhas.",
  "chars": [
    "タ",
    "イ",
    "プ"
  ]
},
{
  "id": "k_ta_taimaa",
  "category": "katakana",
  "focus": "タ",
  "jp": "タイマー",
  "romaji": "taimaa",
  "pt": "timer / temporizador",
  "type": "katakana",
  "hint": "Cozinha, celular e trabalho.",
  "chars": [
    "タ",
    "イ",
    "マ",
    "ー"
  ]
},
{
  "id": "k_ta_taminaru",
  "category": "katakana",
  "focus": "タ",
  "jp": "ターミナル",
  "romaji": "taaminaru",
  "pt": "terminal",
  "type": "katakana",
  "hint": "Transporte e tecnologia.",
  "chars": [
    "タ",
    "ー",
    "ミ",
    "ナ",
    "ル"
  ]
},
{
  "id": "k_chi_chiizu",
  "category": "katakana",
  "focus": "チ",
  "jp": "チーズ",
  "romaji": "chiizu",
  "pt": "queijo",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "チ",
    "ー",
    "ズ"
  ]
},
{
  "id": "k_chi_chiketto",
  "category": "katakana",
  "focus": "チ",
  "jp": "チケット",
  "romaji": "chiketto",
  "pt": "bilhete / ticket",
  "type": "katakana",
  "hint": "Transporte e eventos.",
  "chars": [
    "チ",
    "ケ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_chi_chikin",
  "category": "katakana",
  "focus": "チ",
  "jp": "チキン",
  "romaji": "chikin",
  "pt": "frango",
  "type": "katakana",
  "hint": "Comida comum.",
  "chars": [
    "チ",
    "キ",
    "ン"
  ]
},
{
  "id": "k_chi_chansu",
  "category": "katakana",
  "focus": "チ",
  "jp": "チャンス",
  "romaji": "chansu",
  "pt": "chance / oportunidade",
  "type": "katakana",
  "hint": "Palavra comum.",
  "chars": [
    "チ",
    "ャ",
    "ン",
    "ス"
  ]
},
{
  "id": "k_chi_channeru",
  "category": "katakana",
  "focus": "チ",
  "jp": "チャンネル",
  "romaji": "channeru",
  "pt": "canal",
  "type": "katakana",
  "hint": "TV, internet e apps.",
  "chars": [
    "チ",
    "ャ",
    "ン",
    "ネ",
    "ル"
  ]
},
{
  "id": "k_chi_chokoreeto",
  "category": "katakana",
  "focus": "チ",
  "jp": "チョコレート",
  "romaji": "chokoreeto",
  "pt": "chocolate",
  "type": "katakana",
  "hint": "Produto comum.",
  "chars": [
    "チ",
    "ョ",
    "コ",
    "レ",
    "ー",
    "ト"
  ]
},
{
  "id": "k_chi_chiimu",
  "category": "katakana",
  "focus": "チ",
  "jp": "チーム",
  "romaji": "chiimu",
  "pt": "time / equipe",
  "type": "katakana",
  "hint": "Trabalho e esporte.",
  "chars": [
    "チ",
    "ー",
    "ム"
  ]
},
{
  "id": "k_tsu_tsuuaa",
  "category": "katakana",
  "focus": "ツ",
  "jp": "ツアー",
  "romaji": "tsuaa",
  "pt": "tour / excursão",
  "type": "katakana",
  "hint": "Viagem e lazer.",
  "chars": [
    "ツ",
    "ア",
    "ー"
  ]
},
{
  "id": "k_tsu_tsuuna",
  "category": "katakana",
  "focus": "ツ",
  "jp": "ツナ",
  "romaji": "tsuna",
  "pt": "atum",
  "type": "katakana",
  "hint": "Mercado e konbini.",
  "chars": [
    "ツ",
    "ナ"
  ]
},
{
  "id": "k_tsu_tsuuru",
  "category": "katakana",
  "focus": "ツ",
  "jp": "ツール",
  "romaji": "tsuuru",
  "pt": "ferramenta / tool",
  "type": "katakana",
  "hint": "Trabalho e tecnologia.",
  "chars": [
    "ツ",
    "ー",
    "ル"
  ]
},
{
  "id": "k_tsu_tsuin",
  "category": "katakana",
  "focus": "ツ",
  "jp": "ツイン",
  "romaji": "tsuin",
  "pt": "twin / duplo",
  "type": "katakana",
  "hint": "Hotel e produtos.",
  "chars": [
    "ツ",
    "イ",
    "ン"
  ]
},
{
  "id": "k_tsu_tsuba",
  "category": "katakana",
  "focus": "ツ",
  "jp": "ツバ",
  "romaji": "tsuba",
  "pt": "aba / brim",
  "type": "katakana",
  "hint": "Roupa e acessórios.",
  "chars": [
    "ツ",
    "バ"
  ]
},
{
  "id": "k_tsu_tsuittaa",
  "category": "katakana",
  "focus": "ツ",
  "jp": "ツイッター",
  "romaji": "tsuittaa",
  "pt": "Twitter / X",
  "type": "katakana",
  "hint": "Internet e apps.",
  "chars": [
    "ツ",
    "イ",
    "ッ",
    "タ",
    "ー"
  ]
},
{
  "id": "k_tsu_tsuushin",
  "category": "katakana",
  "focus": "ツ",
  "jp": "ツーリング",
  "romaji": "tsuuringu",
  "pt": "touring / passeio de moto",
  "type": "katakana",
  "hint": "Lazer e transporte.",
  "chars": [
    "ツ",
    "ー",
    "リ",
    "ン",
    "グ"
  ]
},
{
  "id": "k_te_teeburu",
  "category": "katakana",
  "focus": "テ",
  "jp": "テーブル",
  "romaji": "teeburu",
  "pt": "mesa",
  "type": "katakana",
  "hint": "Casa e restaurante.",
  "chars": [
    "テ",
    "ー",
    "ブ",
    "ル"
  ]
},
{
  "id": "k_te_terebi",
  "category": "katakana",
  "focus": "テ",
  "jp": "テレビ",
  "romaji": "terebi",
  "pt": "televisão",
  "type": "katakana",
  "hint": "Casa e eletrônicos.",
  "chars": [
    "テ",
    "レ",
    "ビ"
  ]
},
{
  "id": "k_te_tenisu",
  "category": "katakana",
  "focus": "テ",
  "jp": "テニス",
  "romaji": "tenisu",
  "pt": "tênis",
  "type": "katakana",
  "hint": "Esporte.",
  "chars": [
    "テ",
    "ニ",
    "ス"
  ]
},
{
  "id": "k_te_teepu",
  "category": "katakana",
  "focus": "テ",
  "jp": "テープ",
  "romaji": "teepu",
  "pt": "fita",
  "type": "katakana",
  "hint": "Produto comum.",
  "chars": [
    "テ",
    "ー",
    "プ"
  ]
},
{
  "id": "k_te_tesuto",
  "category": "katakana",
  "focus": "テ",
  "jp": "テスト",
  "romaji": "tesuto",
  "pt": "teste",
  "type": "katakana",
  "hint": "Estudo e trabalho.",
  "chars": [
    "テ",
    "ス",
    "ト"
  ]
},
{
  "id": "k_te_tekisuto",
  "category": "katakana",
  "focus": "テ",
  "jp": "テキスト",
  "romaji": "tekisuto",
  "pt": "texto / material didático",
  "type": "katakana",
  "hint": "Estudo e documentos.",
  "chars": [
    "テ",
    "キ",
    "ス",
    "ト"
  ]
},
{
  "id": "k_te_tenpura",
  "category": "katakana",
  "focus": "テ",
  "jp": "テンプラ",
  "romaji": "tenpura",
  "pt": "tempurá",
  "type": "katakana",
  "hint": "Comida japonesa.",
  "chars": [
    "テ",
    "ン",
    "プ",
    "ラ"
  ]
},
{
  "id": "k_to_toire_v2",
  "category": "katakana",
  "focus": "ト",
  "jp": "トイレ",
  "romaji": "toire",
  "pt": "banheiro",
  "type": "katakana",
  "hint": "Palavra essencial para placas e locais públicos.",
  "chars": [
    "ト",
    "イ",
    "レ"
  ]
},
{
  "id": "k_to_tomato_v2",
  "category": "katakana",
  "focus": "ト",
  "jp": "トマト",
  "romaji": "tomato",
  "pt": "tomate",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "ト",
    "マ",
    "ト"
  ]
},
{
  "id": "k_to_toreenaa",
  "category": "katakana",
  "focus": "ト",
  "jp": "トレーナー",
  "romaji": "toreenaa",
  "pt": "moletom / treinador",
  "type": "katakana",
  "hint": "Roupa e academia.",
  "chars": [
    "ト",
    "レ",
    "ー",
    "ナ",
    "ー"
  ]
},
{
  "id": "k_to_torakku",
  "category": "katakana",
  "focus": "ト",
  "jp": "トラック",
  "romaji": "torakku",
  "pt": "caminhão",
  "type": "katakana",
  "hint": "Trabalho e transporte.",
  "chars": [
    "ト",
    "ラ",
    "ッ",
    "ク"
  ]
},
{
  "id": "k_to_tonaru",
  "category": "katakana",
  "focus": "ト",
  "jp": "トンネル",
  "romaji": "tonneru",
  "pt": "túnel",
  "type": "katakana",
  "hint": "Estradas e transporte.",
  "chars": [
    "ト",
    "ン",
    "ネ",
    "ル"
  ]
},
{
  "id": "k_to_toreningu",
  "category": "katakana",
  "focus": "ト",
  "jp": "トレーニング",
  "romaji": "toreeningu",
  "pt": "treinamento",
  "type": "katakana",
  "hint": "Estudo, academia e trabalho.",
  "chars": [
    "ト",
    "レ",
    "ー",
    "ニ",
    "ン",
    "グ"
  ]
},
{
  "id": "k_to_toppu",
  "category": "katakana",
  "focus": "ト",
  "jp": "トップ",
  "romaji": "toppu",
  "pt": "topo / top",
  "type": "katakana",
  "hint": "Produtos e internet.",
  "chars": [
    "ト",
    "ッ",
    "プ"
  ]
},
{
  "id": "h_na_namae",
  "category": "hiragana",
  "focus": "な",
  "jp": "なまえ",
  "romaji": "namae",
  "pt": "nome",
  "type": "hiragana",
  "hint": "Palavra essencial para apresentações e formulários.",
  "chars": [
    "な",
    "ま",
    "え"
  ]
},
{
  "id": "h_na_natsu",
  "category": "hiragana",
  "focus": "な",
  "jp": "なつ",
  "romaji": "natsu",
  "pt": "verão",
  "type": "hiragana",
  "hint": "Estação do ano.",
  "chars": [
    "な",
    "つ"
  ]
},
{
  "id": "h_na_nana",
  "category": "hiragana",
  "focus": "な",
  "jp": "なな",
  "romaji": "nana",
  "pt": "sete",
  "type": "hiragana",
  "hint": "Número básico.",
  "chars": [
    "な",
    "な"
  ]
},
{
  "id": "h_na_naru",
  "category": "hiragana",
  "focus": "な",
  "jp": "なる",
  "romaji": "naru",
  "pt": "tornar-se / ficar",
  "type": "hiragana",
  "hint": "Verbo muito usado.",
  "chars": [
    "な",
    "る"
  ]
},
{
  "id": "h_na_nakami",
  "category": "hiragana",
  "focus": "な",
  "jp": "なかみ",
  "romaji": "nakami",
  "pt": "conteúdo / parte de dentro",
  "type": "hiragana",
  "hint": "Útil em produtos e explicações.",
  "chars": [
    "な",
    "か",
    "み"
  ]
},
{
  "id": "h_na_nagare",
  "category": "hiragana",
  "focus": "な",
  "jp": "ながれ",
  "romaji": "nagare",
  "pt": "fluxo / corrente",
  "type": "hiragana",
  "hint": "Útil para processo e rotina.",
  "chars": [
    "な",
    "が",
    "れ"
  ]
},
{
  "id": "h_na_naraberu",
  "category": "hiragana",
  "focus": "な",
  "jp": "ならべる",
  "romaji": "naraberu",
  "pt": "colocar em ordem / alinhar",
  "type": "hiragana",
  "hint": "Útil em casa e trabalho.",
  "chars": [
    "な",
    "ら",
    "べ",
    "る"
  ]
},
{
  "id": "h_ni_niku",
  "category": "hiragana",
  "focus": "に",
  "jp": "にく",
  "romaji": "niku",
  "pt": "carne",
  "type": "hiragana",
  "hint": "Mercado e comida.",
  "chars": [
    "に",
    "く"
  ]
},
{
  "id": "h_ni_niji",
  "category": "hiragana",
  "focus": "に",
  "jp": "にじ",
  "romaji": "niji",
  "pt": "arco-íris",
  "type": "hiragana",
  "hint": "Palavra visual.",
  "chars": [
    "に",
    "じ"
  ]
},
{
  "id": "h_ni_nimo",
  "category": "hiragana",
  "focus": "に",
  "jp": "にもつ",
  "romaji": "nimotsu",
  "pt": "bagagem / pacote",
  "type": "hiragana",
  "hint": "Entrega, viagem e rotina.",
  "chars": [
    "に",
    "も",
    "つ"
  ]
},
{
  "id": "h_ni_nigai",
  "category": "hiragana",
  "focus": "に",
  "jp": "にがい",
  "romaji": "nigai",
  "pt": "amargo",
  "type": "hiragana",
  "hint": "Comida e remédio.",
  "chars": [
    "に",
    "が",
    "い"
  ]
},
{
  "id": "h_ni_nigeru",
  "category": "hiragana",
  "focus": "に",
  "jp": "にげる",
  "romaji": "nigeru",
  "pt": "fugir / escapar",
  "type": "hiragana",
  "hint": "Verbo útil.",
  "chars": [
    "に",
    "げ",
    "る"
  ]
},
{
  "id": "h_ni_nihon",
  "category": "hiragana",
  "focus": "に",
  "jp": "にほん",
  "romaji": "nihon",
  "pt": "Japão",
  "type": "hiragana",
  "hint": "Palavra central para o aluno.",
  "chars": [
    "に",
    "ほ",
    "ん"
  ]
},
{
  "id": "h_ni_ninjin",
  "category": "hiragana",
  "focus": "に",
  "jp": "にんじん",
  "romaji": "ninjin",
  "pt": "cenoura",
  "type": "hiragana",
  "hint": "Mercado e comida.",
  "chars": [
    "に",
    "ん",
    "じ",
    "ん"
  ]
},
{
  "id": "h_nu_nuno",
  "category": "hiragana",
  "focus": "ぬ",
  "jp": "ぬの",
  "romaji": "nuno",
  "pt": "tecido / pano",
  "type": "hiragana",
  "hint": "Casa, costura e produtos.",
  "chars": [
    "ぬ",
    "の"
  ]
},
{
  "id": "h_nu_nureru",
  "category": "hiragana",
  "focus": "ぬ",
  "jp": "ぬれる",
  "romaji": "nureru",
  "pt": "molhar-se",
  "type": "hiragana",
  "hint": "Chuva, roupa e cotidiano.",
  "chars": [
    "ぬ",
    "れ",
    "る"
  ]
},
{
  "id": "h_nu_nugu",
  "category": "hiragana",
  "focus": "ぬ",
  "jp": "ぬぐ",
  "romaji": "nugu",
  "pt": "tirar roupa / sapato",
  "type": "hiragana",
  "hint": "Casa, banho e costumes.",
  "chars": [
    "ぬ",
    "ぐ"
  ]
},
{
  "id": "h_nu_nukeru",
  "category": "hiragana",
  "focus": "ぬ",
  "jp": "ぬける",
  "romaji": "nukeru",
  "pt": "sair / escapar / cair fora",
  "type": "hiragana",
  "hint": "Uso comum em várias situações.",
  "chars": [
    "ぬ",
    "け",
    "る"
  ]
},
{
  "id": "h_nu_nuku",
  "category": "hiragana",
  "focus": "ぬ",
  "jp": "ぬく",
  "romaji": "nuku",
  "pt": "tirar / extrair",
  "type": "hiragana",
  "hint": "Verbo útil.",
  "chars": [
    "ぬ",
    "く"
  ]
},
{
  "id": "h_nu_nui",
  "category": "hiragana",
  "focus": "ぬ",
  "jp": "ぬいもの",
  "romaji": "nuimono",
  "pt": "costura",
  "type": "hiragana",
  "hint": "Vocabulário de roupa e reparo.",
  "chars": [
    "ぬ",
    "い",
    "も",
    "の"
  ]
},
{
  "id": "h_nu_nurikabe",
  "category": "hiragana",
  "focus": "ぬ",
  "jp": "ぬる",
  "romaji": "nuru",
  "pt": "pintar / passar algo",
  "type": "hiragana",
  "hint": "Uso comum com creme, tinta e remédio.",
  "chars": [
    "ぬ",
    "る"
  ]
},
{
  "id": "h_ne_neko",
  "category": "hiragana",
  "focus": "ね",
  "jp": "ねこ",
  "romaji": "neko",
  "pt": "gato",
  "type": "hiragana",
  "hint": "Palavra fácil e comum.",
  "chars": [
    "ね",
    "こ"
  ]
},
{
  "id": "h_ne_netsu",
  "category": "hiragana",
  "focus": "ね",
  "jp": "ねつ",
  "romaji": "netsu",
  "pt": "febre",
  "type": "hiragana",
  "hint": "Importante para saúde.",
  "chars": [
    "ね",
    "つ"
  ]
},
{
  "id": "h_ne_nemui",
  "category": "hiragana",
  "focus": "ね",
  "jp": "ねむい",
  "romaji": "nemui",
  "pt": "com sono",
  "type": "hiragana",
  "hint": "Realidade de quem trabalha muito.",
  "chars": [
    "ね",
    "む",
    "い"
  ]
},
{
  "id": "h_ne_neru",
  "category": "hiragana",
  "focus": "ね",
  "jp": "ねる",
  "romaji": "neru",
  "pt": "dormir",
  "type": "hiragana",
  "hint": "Verbo essencial.",
  "chars": [
    "ね",
    "る"
  ]
},
{
  "id": "h_ne_negai",
  "category": "hiragana",
  "focus": "ね",
  "jp": "ねがい",
  "romaji": "negai",
  "pt": "desejo / pedido",
  "type": "hiragana",
  "hint": "Palavra útil.",
  "chars": [
    "ね",
    "が",
    "い"
  ]
},
{
  "id": "h_ne_nedan",
  "category": "hiragana",
  "focus": "ね",
  "jp": "ねだん",
  "romaji": "nedan",
  "pt": "preço",
  "type": "hiragana",
  "hint": "Compras e orçamento.",
  "chars": [
    "ね",
    "だ",
    "ん"
  ]
},
{
  "id": "h_ne_negi",
  "category": "hiragana",
  "focus": "ね",
  "jp": "ねぎ",
  "romaji": "negi",
  "pt": "cebolinha",
  "type": "hiragana",
  "hint": "Mercado e comida.",
  "chars": [
    "ね",
    "ぎ"
  ]
},
{
  "id": "h_no_nomi",
  "category": "hiragana",
  "focus": "の",
  "jp": "のみもの",
  "romaji": "nomimono",
  "pt": "bebida",
  "type": "hiragana",
  "hint": "Restaurante e konbini.",
  "chars": [
    "の",
    "み",
    "も",
    "の"
  ]
},
{
  "id": "h_no_noru",
  "category": "hiragana",
  "focus": "の",
  "jp": "のる",
  "romaji": "noru",
  "pt": "entrar em veículo / pegar transporte",
  "type": "hiragana",
  "hint": "Transporte no Japão.",
  "chars": [
    "の",
    "る"
  ]
},
{
  "id": "h_no_noboru",
  "category": "hiragana",
  "focus": "の",
  "jp": "のぼる",
  "romaji": "noboru",
  "pt": "subir",
  "type": "hiragana",
  "hint": "Movimento e localização.",
  "chars": [
    "の",
    "ぼ",
    "る"
  ]
},
{
  "id": "h_no_nokoru",
  "category": "hiragana",
  "focus": "の",
  "jp": "のこる",
  "romaji": "nokoru",
  "pt": "sobrar / permanecer",
  "type": "hiragana",
  "hint": "Trabalho e rotina.",
  "chars": [
    "の",
    "こ",
    "る"
  ]
},
{
  "id": "h_no_nodo",
  "category": "hiragana",
  "focus": "の",
  "jp": "のど",
  "romaji": "nodo",
  "pt": "garganta",
  "type": "hiragana",
  "hint": "Saúde.",
  "chars": [
    "の",
    "ど"
  ]
},
{
  "id": "h_no_nou",
  "category": "hiragana",
  "focus": "の",
  "jp": "のう",
  "romaji": "nou",
  "pt": "cérebro / habilidade",
  "type": "hiragana",
  "hint": "Vocabulário básico avançando.",
  "chars": [
    "の",
    "う"
  ]
},
{
  "id": "h_no_nomikai",
  "category": "hiragana",
  "focus": "の",
  "jp": "のみかい",
  "romaji": "nomikai",
  "pt": "encontro para beber",
  "type": "hiragana",
  "hint": "Vida social no Japão.",
  "chars": [
    "の",
    "み",
    "か",
    "い"
  ]
},
{
  "id": "k_na_naifu",
  "category": "katakana",
  "focus": "ナ",
  "jp": "ナイフ",
  "romaji": "naifu",
  "pt": "faca",
  "type": "katakana",
  "hint": "Cozinha e produtos.",
  "chars": [
    "ナ",
    "イ",
    "フ"
  ]
},
{
  "id": "k_na_napukin",
  "category": "katakana",
  "focus": "ナ",
  "jp": "ナプキン",
  "romaji": "napukin",
  "pt": "guardanapo / absorvente",
  "type": "katakana",
  "hint": "Produto comum.",
  "chars": [
    "ナ",
    "プ",
    "キ",
    "ン"
  ]
},
{
  "id": "k_na_nattsu",
  "category": "katakana",
  "focus": "ナ",
  "jp": "ナッツ",
  "romaji": "nattsu",
  "pt": "castanhas / nuts",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "ナ",
    "ッ",
    "ツ"
  ]
},
{
  "id": "k_na_nanbaa",
  "category": "katakana",
  "focus": "ナ",
  "jp": "ナンバー",
  "romaji": "nanbaa",
  "pt": "número / placa",
  "type": "katakana",
  "hint": "Carro, senha e identificação.",
  "chars": [
    "ナ",
    "ン",
    "バ",
    "ー"
  ]
},
{
  "id": "k_na_nabigeeshon",
  "category": "katakana",
  "focus": "ナ",
  "jp": "ナビ",
  "romaji": "nabi",
  "pt": "navegador / GPS",
  "type": "katakana",
  "hint": "Carro e celular.",
  "chars": [
    "ナ",
    "ビ"
  ]
},
{
  "id": "k_na_nareeshon",
  "category": "katakana",
  "focus": "ナ",
  "jp": "ナレーション",
  "romaji": "nareeshon",
  "pt": "narração",
  "type": "katakana",
  "hint": "Mídia e áudio.",
  "chars": [
    "ナ",
    "レ",
    "ー",
    "シ",
    "ョ",
    "ン"
  ]
},
{
  "id": "k_na_naitaa",
  "category": "katakana",
  "focus": "ナ",
  "jp": "ナイター",
  "romaji": "naitaa",
  "pt": "jogo/evento noturno",
  "type": "katakana",
  "hint": "Esporte e lazer.",
  "chars": [
    "ナ",
    "イ",
    "タ",
    "ー"
  ]
},
{
  "id": "k_ni_niizu",
  "category": "katakana",
  "focus": "ニ",
  "jp": "ニーズ",
  "romaji": "niizu",
  "pt": "necessidades",
  "type": "katakana",
  "hint": "Trabalho e serviços.",
  "chars": [
    "ニ",
    "ー",
    "ズ"
  ]
},
{
  "id": "k_ni_nyuusu",
  "category": "katakana",
  "focus": "ニ",
  "jp": "ニュース",
  "romaji": "nyuusu",
  "pt": "notícias",
  "type": "katakana",
  "hint": "TV, internet e celular.",
  "chars": [
    "ニ",
    "ュ",
    "ー",
    "ス"
  ]
},
{
  "id": "k_ni_nyuuyoku",
  "category": "katakana",
  "focus": "ニ",
  "jp": "ニューヨーク",
  "romaji": "nyuuyooku",
  "pt": "Nova York",
  "type": "katakana",
  "hint": "Nome de cidade em katakana.",
  "chars": [
    "ニ",
    "ュ",
    "ー",
    "ヨ",
    "ー",
    "ク"
  ]
},
{
  "id": "k_ni_nikku",
  "category": "katakana",
  "focus": "ニ",
  "jp": "ニックネーム",
  "romaji": "nikkuneemu",
  "pt": "apelido / nickname",
  "type": "katakana",
  "hint": "Apps e cadastro.",
  "chars": [
    "ニ",
    "ッ",
    "ク",
    "ネ",
    "ー",
    "ム"
  ]
},
{
  "id": "k_ni_nitoro",
  "category": "katakana",
  "focus": "ニ",
  "jp": "ニトリ",
  "romaji": "nitori",
  "pt": "Nitori / loja de móveis",
  "type": "katakana",
  "hint": "Marca comum no Japão.",
  "chars": [
    "ニ",
    "ト",
    "リ"
  ]
},
{
  "id": "k_ni_nikon",
  "category": "katakana",
  "focus": "ニ",
  "jp": "ニコン",
  "romaji": "nikon",
  "pt": "Nikon",
  "type": "katakana",
  "hint": "Marca comum.",
  "chars": [
    "ニ",
    "コ",
    "ン"
  ]
},
{
  "id": "k_ni_nyuusatsu",
  "category": "katakana",
  "focus": "ニ",
  "jp": "ニュー",
  "romaji": "nyuu",
  "pt": "novo / new",
  "type": "katakana",
  "hint": "Aparece em muitos nomes e produtos.",
  "chars": [
    "ニ",
    "ュ",
    "ー"
  ]
},
{
  "id": "k_nu_nuudoru",
  "category": "katakana",
  "focus": "ヌ",
  "jp": "ヌードル",
  "romaji": "nuudoru",
  "pt": "macarrão / noodle",
  "type": "katakana",
  "hint": "Muito comum em comidas instantâneas.",
  "chars": [
    "ヌ",
    "ー",
    "ド",
    "ル"
  ]
},
{
  "id": "k_nu_nuudo",
  "category": "katakana",
  "focus": "ヌ",
  "jp": "ヌード",
  "romaji": "nuudo",
  "pt": "nude / tom de pele",
  "type": "katakana",
  "hint": "Produtos e cosméticos.",
  "chars": [
    "ヌ",
    "ー",
    "ド"
  ]
},
{
  "id": "k_nu_nunchaku",
  "category": "katakana",
  "focus": "ヌ",
  "jp": "ヌンチャク",
  "romaji": "nunchaku",
  "pt": "nunchaku",
  "type": "katakana",
  "hint": "Palavra de referência cultural.",
  "chars": [
    "ヌ",
    "ン",
    "チ",
    "ャ",
    "ク"
  ]
},
{
  "id": "k_nu_numeru",
  "category": "katakana",
  "focus": "ヌ",
  "jp": "ヌメロ",
  "romaji": "numero",
  "pt": "número / numéro",
  "type": "katakana",
  "hint": "Uso em nomes e marcas.",
  "chars": [
    "ヌ",
    "メ",
    "ロ"
  ]
},
{
  "id": "k_nu_nuansu",
  "category": "katakana",
  "focus": "ヌ",
  "jp": "ニュアンス",
  "romaji": "nyuansu",
  "pt": "nuance",
  "type": "katakana",
  "hint": "Comunicação e expressão.",
  "chars": [
    "ニ",
    "ュ",
    "ア",
    "ン",
    "ス"
  ]
},
{
  "id": "k_nu_nuukuria",
  "category": "katakana",
  "focus": "ヌ",
  "jp": "ニュークリア",
  "romaji": "nyuukuria",
  "pt": "nuclear",
  "type": "katakana",
  "hint": "Palavra técnica.",
  "chars": [
    "ニ",
    "ュ",
    "ー",
    "ク",
    "リ",
    "ア"
  ]
},
{
  "id": "k_nu_nuuberu",
  "category": "katakana",
  "focus": "ヌ",
  "jp": "ヌーベル",
  "romaji": "nuuberu",
  "pt": "nouvelle / novo estilo",
  "type": "katakana",
  "hint": "Uso em nomes e marcas.",
  "chars": [
    "ヌ",
    "ー",
    "ベ",
    "ル"
  ]
},
{
  "id": "k_ne_netto",
  "category": "katakana",
  "focus": "ネ",
  "jp": "ネット",
  "romaji": "netto",
  "pt": "internet / rede",
  "type": "katakana",
  "hint": "Celular e vida digital.",
  "chars": [
    "ネ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_ne_nekkuresu",
  "category": "katakana",
  "focus": "ネ",
  "jp": "ネックレス",
  "romaji": "nekkuresu",
  "pt": "colar",
  "type": "katakana",
  "hint": "Compras e acessórios.",
  "chars": [
    "ネ",
    "ッ",
    "ク",
    "レ",
    "ス"
  ]
},
{
  "id": "k_ne_neemu",
  "category": "katakana",
  "focus": "ネ",
  "jp": "ネーム",
  "romaji": "neemu",
  "pt": "nome / name",
  "type": "katakana",
  "hint": "Cadastro e produtos.",
  "chars": [
    "ネ",
    "ー",
    "ム"
  ]
},
{
  "id": "k_ne_neiru",
  "category": "katakana",
  "focus": "ネ",
  "jp": "ネイル",
  "romaji": "neiru",
  "pt": "unha / nail",
  "type": "katakana",
  "hint": "Salão e cosméticos.",
  "chars": [
    "ネ",
    "イ",
    "ル"
  ]
},
{
  "id": "k_ne_negi",
  "category": "katakana",
  "focus": "ネ",
  "jp": "ネガティブ",
  "romaji": "negatibu",
  "pt": "negativo",
  "type": "katakana",
  "hint": "Comunicação e personalidade.",
  "chars": [
    "ネ",
    "ガ",
    "テ",
    "ィ",
    "ブ"
  ]
},
{
  "id": "k_ne_nepuchuun",
  "category": "katakana",
  "focus": "ネ",
  "jp": "ネプチューン",
  "romaji": "nepuchuun",
  "pt": "Netuno / Neptune",
  "type": "katakana",
  "hint": "Nome próprio em katakana.",
  "chars": [
    "ネ",
    "プ",
    "チ",
    "ュ",
    "ー",
    "ン"
  ]
},
{
  "id": "k_ne_nekutai",
  "category": "katakana",
  "focus": "ネ",
  "jp": "ネクタイ",
  "romaji": "nekutai",
  "pt": "gravata",
  "type": "katakana",
  "hint": "Roupa e trabalho.",
  "chars": [
    "ネ",
    "ク",
    "タ",
    "イ"
  ]
},
{
  "id": "k_no_nooto",
  "category": "katakana",
  "focus": "ノ",
  "jp": "ノート",
  "romaji": "nooto",
  "pt": "caderno / notebook",
  "type": "katakana",
  "hint": "Estudo e trabalho.",
  "chars": [
    "ノ",
    "ー",
    "ト"
  ]
},
{
  "id": "k_no_noruma",
  "category": "katakana",
  "focus": "ノ",
  "jp": "ノルマ",
  "romaji": "noruma",
  "pt": "meta / quota",
  "type": "katakana",
  "hint": "Palavra muito ouvida em fábrica.",
  "chars": [
    "ノ",
    "ル",
    "マ"
  ]
},
{
  "id": "k_no_noruuei",
  "category": "katakana",
  "focus": "ノ",
  "jp": "ノルウェー",
  "romaji": "noruwee",
  "pt": "Noruega",
  "type": "katakana",
  "hint": "País em katakana.",
  "chars": [
    "ノ",
    "ル",
    "ウ",
    "ェ",
    "ー"
  ]
},
{
  "id": "k_no_nobiru",
  "category": "katakana",
  "focus": "ノ",
  "jp": "ノベル",
  "romaji": "noberu",
  "pt": "novel / romance",
  "type": "katakana",
  "hint": "Livros e mídia.",
  "chars": [
    "ノ",
    "ベ",
    "ル"
  ]
},
{
  "id": "k_no_nozuru",
  "category": "katakana",
  "focus": "ノ",
  "jp": "ノズル",
  "romaji": "nozuru",
  "pt": "bico / nozzle",
  "type": "katakana",
  "hint": "Produtos, fábrica e ferramentas.",
  "chars": [
    "ノ",
    "ズ",
    "ル"
  ]
},
{
  "id": "k_no_noizukyanseru",
  "category": "katakana",
  "focus": "ノ",
  "jp": "ノイズ",
  "romaji": "noizu",
  "pt": "ruído / noise",
  "type": "katakana",
  "hint": "Áudio, trabalho e tecnologia.",
  "chars": [
    "ノ",
    "イ",
    "ズ"
  ]
},
{
  "id": "k_no_nonsutoppu",
  "category": "katakana",
  "focus": "ノ",
  "jp": "ノンストップ",
  "romaji": "nonsutoppu",
  "pt": "sem parar / nonstop",
  "type": "katakana",
  "hint": "Transporte, mídia e serviços.",
  "chars": [
    "ノ",
    "ン",
    "ス",
    "ト",
    "ッ",
    "プ"
  ]
},
{
  "id": "h_ha_hana",
  "category": "hiragana",
  "focus": "は",
  "jp": "はな",
  "romaji": "hana",
  "pt": "flor / nariz",
  "type": "hiragana",
  "hint": "Palavra simples com dois sentidos comuns.",
  "chars": [
    "は",
    "な"
  ]
},
{
  "id": "h_ha_hashi",
  "category": "hiragana",
  "focus": "は",
  "jp": "はし",
  "romaji": "hashi",
  "pt": "ponte / hashi",
  "type": "hiragana",
  "hint": "Útil no cotidiano e comida.",
  "chars": [
    "は",
    "し"
  ]
},
{
  "id": "h_ha_hako",
  "category": "hiragana",
  "focus": "は",
  "jp": "はこ",
  "romaji": "hako",
  "pt": "caixa",
  "type": "hiragana",
  "hint": "Entrega, mudança e trabalho.",
  "chars": [
    "は",
    "こ"
  ]
},
{
  "id": "h_ha_haru",
  "category": "hiragana",
  "focus": "は",
  "jp": "はる",
  "romaji": "haru",
  "pt": "primavera",
  "type": "hiragana",
  "hint": "Estação do ano.",
  "chars": [
    "は",
    "る"
  ]
},
{
  "id": "h_ha_hayai",
  "category": "hiragana",
  "focus": "は",
  "jp": "はやい",
  "romaji": "hayai",
  "pt": "rápido / cedo",
  "type": "hiragana",
  "hint": "Muito usado em trabalho e rotina.",
  "chars": [
    "は",
    "や",
    "い"
  ]
},
{
  "id": "h_ha_hataraku",
  "category": "hiragana",
  "focus": "は",
  "jp": "はたらく",
  "romaji": "hataraku",
  "pt": "trabalhar",
  "type": "hiragana",
  "hint": "Palavra central para dekasseguis.",
  "chars": [
    "は",
    "た",
    "ら",
    "く"
  ]
},
{
  "id": "h_ha_hajimeru",
  "category": "hiragana",
  "focus": "は",
  "jp": "はじめる",
  "romaji": "hajimeru",
  "pt": "começar",
  "type": "hiragana",
  "hint": "Verbo muito útil para estudo e rotina.",
  "chars": [
    "は",
    "じ",
    "め",
    "る"
  ]
},
{
  "id": "h_hi_hi",
  "category": "hiragana",
  "focus": "ひ",
  "jp": "ひ",
  "romaji": "hi",
  "pt": "fogo / dia",
  "type": "hiragana",
  "hint": "Palavra curta para fixar ひ.",
  "chars": [
    "ひ"
  ]
},
{
  "id": "h_hi_hito",
  "category": "hiragana",
  "focus": "ひ",
  "jp": "ひと",
  "romaji": "hito",
  "pt": "pessoa",
  "type": "hiragana",
  "hint": "Palavra básica e essencial.",
  "chars": [
    "ひ",
    "と"
  ]
},
{
  "id": "h_hi_hiru",
  "category": "hiragana",
  "focus": "ひ",
  "jp": "ひる",
  "romaji": "hiru",
  "pt": "meio-dia / tarde",
  "type": "hiragana",
  "hint": "Tempo do dia.",
  "chars": [
    "ひ",
    "る"
  ]
},
{
  "id": "h_hi_hidari",
  "category": "hiragana",
  "focus": "ひ",
  "jp": "ひだり",
  "romaji": "hidari",
  "pt": "esquerda",
  "type": "hiragana",
  "hint": "Direção essencial.",
  "chars": [
    "ひ",
    "だ",
    "り"
  ]
},
{
  "id": "h_hi_hikui",
  "category": "hiragana",
  "focus": "ひ",
  "jp": "ひくい",
  "romaji": "hikui",
  "pt": "baixo",
  "type": "hiragana",
  "hint": "Adjetivo básico.",
  "chars": [
    "ひ",
    "く",
    "い"
  ]
},
{
  "id": "h_hi_hiroi",
  "category": "hiragana",
  "focus": "ひ",
  "jp": "ひろい",
  "romaji": "hiroi",
  "pt": "amplo / espaçoso",
  "type": "hiragana",
  "hint": "Casa, rua e ambiente.",
  "chars": [
    "ひ",
    "ろ",
    "い"
  ]
},
{
  "id": "h_hi_hikidashi",
  "category": "hiragana",
  "focus": "ひ",
  "jp": "ひきだし",
  "romaji": "hikidashi",
  "pt": "gaveta",
  "type": "hiragana",
  "hint": "Casa e trabalho.",
  "chars": [
    "ひ",
    "き",
    "だ",
    "し"
  ]
},
{
  "id": "h_fu_fune",
  "category": "hiragana",
  "focus": "ふ",
  "jp": "ふね",
  "romaji": "fune",
  "pt": "barco",
  "type": "hiragana",
  "hint": "Transporte e vocabulário visual.",
  "chars": [
    "ふ",
    "ね"
  ]
},
{
  "id": "h_fu_fuyu",
  "category": "hiragana",
  "focus": "ふ",
  "jp": "ふゆ",
  "romaji": "fuyu",
  "pt": "inverno",
  "type": "hiragana",
  "hint": "Estação do ano.",
  "chars": [
    "ふ",
    "ゆ"
  ]
},
{
  "id": "h_fu_fuku",
  "category": "hiragana",
  "focus": "ふ",
  "jp": "ふく",
  "romaji": "fuku",
  "pt": "roupa",
  "type": "hiragana",
  "hint": "Compras e rotina.",
  "chars": [
    "ふ",
    "く"
  ]
},
{
  "id": "h_fu_futoi",
  "category": "hiragana",
  "focus": "ふ",
  "jp": "ふとい",
  "romaji": "futoi",
  "pt": "grosso",
  "type": "hiragana",
  "hint": "Adjetivo útil.",
  "chars": [
    "ふ",
    "と",
    "い"
  ]
},
{
  "id": "h_fu_futsuu",
  "category": "hiragana",
  "focus": "ふ",
  "jp": "ふつう",
  "romaji": "futsuu",
  "pt": "normal / comum",
  "type": "hiragana",
  "hint": "Muito usado em conversa.",
  "chars": [
    "ふ",
    "つ",
    "う"
  ]
},
{
  "id": "h_fu_fukurou",
  "category": "hiragana",
  "focus": "ふ",
  "jp": "ふくろ",
  "romaji": "fukuro",
  "pt": "sacola / saco",
  "type": "hiragana",
  "hint": "Konbini e compras.",
  "chars": [
    "ふ",
    "く",
    "ろ"
  ]
},
{
  "id": "h_fu_fuben",
  "category": "hiragana",
  "focus": "ふ",
  "jp": "ふべん",
  "romaji": "fuben",
  "pt": "inconveniente",
  "type": "hiragana",
  "hint": "Útil para explicar dificuldades.",
  "chars": [
    "ふ",
    "べ",
    "ん"
  ]
},
{
  "id": "h_he_heya",
  "category": "hiragana",
  "focus": "へ",
  "jp": "へや",
  "romaji": "heya",
  "pt": "quarto / cômodo",
  "type": "hiragana",
  "hint": "Moradia no Japão.",
  "chars": [
    "へ",
    "や"
  ]
},
{
  "id": "h_he_hebi",
  "category": "hiragana",
  "focus": "へ",
  "jp": "へび",
  "romaji": "hebi",
  "pt": "cobra",
  "type": "hiragana",
  "hint": "Vocabulário visual.",
  "chars": [
    "へ",
    "び"
  ]
},
{
  "id": "h_he_heru",
  "category": "hiragana",
  "focus": "へ",
  "jp": "へる",
  "romaji": "heru",
  "pt": "diminuir",
  "type": "hiragana",
  "hint": "Uso comum com quantidade e dinheiro.",
  "chars": [
    "へ",
    "る"
  ]
},
{
  "id": "h_he_hen",
  "category": "hiragana",
  "focus": "へ",
  "jp": "へん",
  "romaji": "hen",
  "pt": "estranho / região",
  "type": "hiragana",
  "hint": "Palavra útil em conversa.",
  "chars": [
    "へ",
    "ん"
  ]
},
{
  "id": "h_he_heiwa",
  "category": "hiragana",
  "focus": "へ",
  "jp": "へいわ",
  "romaji": "heiwa",
  "pt": "paz",
  "type": "hiragana",
  "hint": "Vocabulário importante.",
  "chars": [
    "へ",
    "い",
    "わ"
  ]
},
{
  "id": "h_he_heta",
  "category": "hiragana",
  "focus": "へ",
  "jp": "へた",
  "romaji": "heta",
  "pt": "ruim em algo / sem habilidade",
  "type": "hiragana",
  "hint": "Útil para falar de estudo.",
  "chars": [
    "へ",
    "た"
  ]
},
{
  "id": "h_he_henshin",
  "category": "hiragana",
  "focus": "へ",
  "jp": "へんしん",
  "romaji": "henshin",
  "pt": "resposta / transformação",
  "type": "hiragana",
  "hint": "Mensagem e comunicação.",
  "chars": [
    "へ",
    "ん",
    "し",
    "ん"
  ]
},
{
  "id": "h_ho_hoshi",
  "category": "hiragana",
  "focus": "ほ",
  "jp": "ほし",
  "romaji": "hoshi",
  "pt": "estrela",
  "type": "hiragana",
  "hint": "Palavra visual.",
  "chars": [
    "ほ",
    "し"
  ]
},
{
  "id": "h_ho_hone",
  "category": "hiragana",
  "focus": "ほ",
  "jp": "ほね",
  "romaji": "hone",
  "pt": "osso",
  "type": "hiragana",
  "hint": "Saúde e corpo.",
  "chars": [
    "ほ",
    "ね"
  ]
},
{
  "id": "h_ho_hon",
  "category": "hiragana",
  "focus": "ほ",
  "jp": "ほん",
  "romaji": "hon",
  "pt": "livro",
  "type": "hiragana",
  "hint": "Estudo e cotidiano.",
  "chars": [
    "ほ",
    "ん"
  ]
},
{
  "id": "h_ho_hoso",
  "category": "hiragana",
  "focus": "ほ",
  "jp": "ほそい",
  "romaji": "hosoi",
  "pt": "fino / estreito",
  "type": "hiragana",
  "hint": "Adjetivo básico.",
  "chars": [
    "ほ",
    "そ",
    "い"
  ]
},
{
  "id": "h_ho_hokan",
  "category": "hiragana",
  "focus": "ほ",
  "jp": "ほかん",
  "romaji": "hokan",
  "pt": "guardar / armazenamento",
  "type": "hiragana",
  "hint": "Casa e trabalho.",
  "chars": [
    "ほ",
    "か",
    "ん"
  ]
},
{
  "id": "h_ho_hontou",
  "category": "hiragana",
  "focus": "ほ",
  "jp": "ほんとう",
  "romaji": "hontou",
  "pt": "verdade / realmente",
  "type": "hiragana",
  "hint": "Muito usado em conversa.",
  "chars": [
    "ほ",
    "ん",
    "と",
    "う"
  ]
},
{
  "id": "h_ho_hoshii",
  "category": "hiragana",
  "focus": "ほ",
  "jp": "ほしい",
  "romaji": "hoshii",
  "pt": "querer / desejado",
  "type": "hiragana",
  "hint": "Muito útil para pedidos.",
  "chars": [
    "ほ",
    "し",
    "い"
  ]
},
{
  "id": "k_ha_hambagaa",
  "category": "katakana",
  "focus": "ハ",
  "jp": "ハンバーガー",
  "romaji": "hanbaagaa",
  "pt": "hambúrguer",
  "type": "katakana",
  "hint": "Comida comum.",
  "chars": [
    "ハ",
    "ン",
    "バ",
    "ー",
    "ガ",
    "ー"
  ]
},
{
  "id": "k_ha_hando",
  "category": "katakana",
  "focus": "ハ",
  "jp": "ハンド",
  "romaji": "hando",
  "pt": "mão / hand",
  "type": "katakana",
  "hint": "Aparece em produtos.",
  "chars": [
    "ハ",
    "ン",
    "ド"
  ]
},
{
  "id": "k_ha_hanger",
  "category": "katakana",
  "focus": "ハ",
  "jp": "ハンガー",
  "romaji": "hangaa",
  "pt": "cabide",
  "type": "katakana",
  "hint": "Casa e roupa.",
  "chars": [
    "ハ",
    "ン",
    "ガ",
    "ー"
  ]
},
{
  "id": "k_ha_haafu",
  "category": "katakana",
  "focus": "ハ",
  "jp": "ハーフ",
  "romaji": "haafu",
  "pt": "metade / half",
  "type": "katakana",
  "hint": "Produtos e conversa.",
  "chars": [
    "ハ",
    "ー",
    "フ"
  ]
},
{
  "id": "k_ha_haado",
  "category": "katakana",
  "focus": "ハ",
  "jp": "ハード",
  "romaji": "haado",
  "pt": "duro / hard",
  "type": "katakana",
  "hint": "Tecnologia e produtos.",
  "chars": [
    "ハ",
    "ー",
    "ド"
  ]
},
{
  "id": "k_ha_hairu",
  "category": "katakana",
  "focus": "ハ",
  "jp": "ハイライト",
  "romaji": "hairaito",
  "pt": "destaque / highlight",
  "type": "katakana",
  "hint": "Mídia, beleza e texto.",
  "chars": [
    "ハ",
    "イ",
    "ラ",
    "イ",
    "ト"
  ]
},
{
  "id": "k_ha_harowiin",
  "category": "katakana",
  "focus": "ハ",
  "jp": "ハロウィン",
  "romaji": "harowin",
  "pt": "Halloween",
  "type": "katakana",
  "hint": "Evento comum em lojas.",
  "chars": [
    "ハ",
    "ロ",
    "ウ",
    "ィ",
    "ン"
  ]
},
{
  "id": "k_hi_hiitaa",
  "category": "katakana",
  "focus": "ヒ",
  "jp": "ヒーター",
  "romaji": "hiitaa",
  "pt": "aquecedor",
  "type": "katakana",
  "hint": "Muito útil no inverno japonês.",
  "chars": [
    "ヒ",
    "ー",
    "タ",
    "ー"
  ]
},
{
  "id": "k_hi_hiro",
  "category": "katakana",
  "focus": "ヒ",
  "jp": "ヒロイン",
  "romaji": "hiroin",
  "pt": "heroína",
  "type": "katakana",
  "hint": "Mídia e entretenimento.",
  "chars": [
    "ヒ",
    "ロ",
    "イ",
    "ン"
  ]
},
{
  "id": "k_hi_hinto",
  "category": "katakana",
  "focus": "ヒ",
  "jp": "ヒント",
  "romaji": "hinto",
  "pt": "dica",
  "type": "katakana",
  "hint": "Estudo e apps.",
  "chars": [
    "ヒ",
    "ン",
    "ト"
  ]
},
{
  "id": "k_hi_hiyaringu",
  "category": "katakana",
  "focus": "ヒ",
  "jp": "ヒアリング",
  "romaji": "hiaringu",
  "pt": "audição / listening",
  "type": "katakana",
  "hint": "Estudo de idioma.",
  "chars": [
    "ヒ",
    "ア",
    "リ",
    "ン",
    "グ"
  ]
},
{
  "id": "k_hi_hisutori",
  "category": "katakana",
  "focus": "ヒ",
  "jp": "ヒストリー",
  "romaji": "hisutorii",
  "pt": "histórico / história",
  "type": "katakana",
  "hint": "Apps e estudos.",
  "chars": [
    "ヒ",
    "ス",
    "ト",
    "リ",
    "ー"
  ]
},
{
  "id": "k_hi_hiru",
  "category": "katakana",
  "focus": "ヒ",
  "jp": "ヒール",
  "romaji": "hiiru",
  "pt": "salto / heel",
  "type": "katakana",
  "hint": "Sapatos e compras.",
  "chars": [
    "ヒ",
    "ー",
    "ル"
  ]
},
{
  "id": "k_hi_higashi",
  "category": "katakana",
  "focus": "ヒ",
  "jp": "ヒップ",
  "romaji": "hippu",
  "pt": "quadril / hip",
  "type": "katakana",
  "hint": "Corpo, roupa e saúde.",
  "chars": [
    "ヒ",
    "ッ",
    "プ"
  ]
},
{
  "id": "k_fu_famirii",
  "category": "katakana",
  "focus": "フ",
  "jp": "ファミリー",
  "romaji": "famirii",
  "pt": "família",
  "type": "katakana",
  "hint": "Serviços e produtos.",
  "chars": [
    "フ",
    "ァ",
    "ミ",
    "リ",
    "ー"
  ]
},
{
  "id": "k_fu_fairu",
  "category": "katakana",
  "focus": "フ",
  "jp": "ファイル",
  "romaji": "fairu",
  "pt": "arquivo / pasta",
  "type": "katakana",
  "hint": "Trabalho, documentos e celular.",
  "chars": [
    "フ",
    "ァ",
    "イ",
    "ル"
  ]
},
{
  "id": "k_fu_fooku",
  "category": "katakana",
  "focus": "フ",
  "jp": "フォーク",
  "romaji": "fooku",
  "pt": "garfo",
  "type": "katakana",
  "hint": "Comida e restaurante.",
  "chars": [
    "フ",
    "ォ",
    "ー",
    "ク"
  ]
},
{
  "id": "k_fu_furonto",
  "category": "katakana",
  "focus": "フ",
  "jp": "フロント",
  "romaji": "furonto",
  "pt": "recepção / frente",
  "type": "katakana",
  "hint": "Hotel, loja e atendimento.",
  "chars": [
    "フ",
    "ロ",
    "ン",
    "ト"
  ]
},
{
  "id": "k_fu_furii",
  "category": "katakana",
  "focus": "フ",
  "jp": "フリー",
  "romaji": "furii",
  "pt": "livre / grátis",
  "type": "katakana",
  "hint": "Apps, lojas e serviços.",
  "chars": [
    "フ",
    "リ",
    "ー"
  ]
},
{
  "id": "k_fu_furaipan",
  "category": "katakana",
  "focus": "フ",
  "jp": "フライパン",
  "romaji": "furaipan",
  "pt": "frigideira",
  "type": "katakana",
  "hint": "Cozinha e casa.",
  "chars": [
    "フ",
    "ラ",
    "イ",
    "パ",
    "ン"
  ]
},
{
  "id": "k_fu_futon",
  "category": "katakana",
  "focus": "フ",
  "jp": "フトン",
  "romaji": "futon",
  "pt": "futon",
  "type": "katakana",
  "hint": "Casa e sono.",
  "chars": [
    "フ",
    "ト",
    "ン"
  ]
},
{
  "id": "k_he_hea",
  "category": "katakana",
  "focus": "ヘ",
  "jp": "ヘア",
  "romaji": "hea",
  "pt": "cabelo / hair",
  "type": "katakana",
  "hint": "Salão e produtos.",
  "chars": [
    "ヘ",
    "ア"
  ]
},
{
  "id": "k_he_herumetto",
  "category": "katakana",
  "focus": "ヘ",
  "jp": "ヘルメット",
  "romaji": "herumetto",
  "pt": "capacete",
  "type": "katakana",
  "hint": "Bicicleta, moto e segurança.",
  "chars": [
    "ヘ",
    "ル",
    "メ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_he_herupu",
  "category": "katakana",
  "focus": "ヘ",
  "jp": "ヘルプ",
  "romaji": "herupu",
  "pt": "ajuda / help",
  "type": "katakana",
  "hint": "Apps e serviços.",
  "chars": [
    "ヘ",
    "ル",
    "プ"
  ]
},
{
  "id": "k_he_herushii",
  "category": "katakana",
  "focus": "ヘ",
  "jp": "ヘルシー",
  "romaji": "herushii",
  "pt": "saudável",
  "type": "katakana",
  "hint": "Comida e produtos.",
  "chars": [
    "ヘ",
    "ル",
    "シ",
    "ー"
  ]
},
{
  "id": "k_he_heddo",
  "category": "katakana",
  "focus": "ヘ",
  "jp": "ヘッド",
  "romaji": "heddo",
  "pt": "cabeça / head",
  "type": "katakana",
  "hint": "Produtos e tecnologia.",
  "chars": [
    "ヘ",
    "ッ",
    "ド"
  ]
},
{
  "id": "k_he_heddohon",
  "category": "katakana",
  "focus": "ヘ",
  "jp": "ヘッドホン",
  "romaji": "heddohon",
  "pt": "fone de ouvido",
  "type": "katakana",
  "hint": "Eletrônicos.",
  "chars": [
    "ヘ",
    "ッ",
    "ド",
    "ホ",
    "ン"
  ]
},
{
  "id": "k_he_heeburu",
  "category": "katakana",
  "focus": "ヘ",
  "jp": "ヘビー",
  "romaji": "hebii",
  "pt": "pesado / heavy",
  "type": "katakana",
  "hint": "Produtos e descrição.",
  "chars": [
    "ヘ",
    "ビ",
    "ー"
  ]
},
{
  "id": "k_ho_hoteru",
  "category": "katakana",
  "focus": "ホ",
  "jp": "ホテル",
  "romaji": "hoteru",
  "pt": "hotel",
  "type": "katakana",
  "hint": "Viagem e moradia temporária.",
  "chars": [
    "ホ",
    "テ",
    "ル"
  ]
},
{
  "id": "k_ho_hoomu",
  "category": "katakana",
  "focus": "ホ",
  "jp": "ホーム",
  "romaji": "hoomu",
  "pt": "home / plataforma",
  "type": "katakana",
  "hint": "Casa, apps e estação.",
  "chars": [
    "ホ",
    "ー",
    "ム"
  ]
},
{
  "id": "k_ho_hoomupeeji",
  "category": "katakana",
  "focus": "ホ",
  "jp": "ホームページ",
  "romaji": "hoomupeeji",
  "pt": "site / homepage",
  "type": "katakana",
  "hint": "Internet e serviços.",
  "chars": [
    "ホ",
    "ー",
    "ム",
    "ペ",
    "ー",
    "ジ"
  ]
},
{
  "id": "k_ho_horudaa",
  "category": "katakana",
  "focus": "ホ",
  "jp": "ホルダー",
  "romaji": "horudaa",
  "pt": "suporte / holder",
  "type": "katakana",
  "hint": "Produtos e acessórios.",
  "chars": [
    "ホ",
    "ル",
    "ダ",
    "ー"
  ]
},
{
  "id": "k_ho_hotondo",
  "category": "katakana",
  "focus": "ホ",
  "jp": "ホット",
  "romaji": "hotto",
  "pt": "quente / hot",
  "type": "katakana",
  "hint": "Bebidas e comida.",
  "chars": [
    "ホ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_ho_hosupitaru",
  "category": "katakana",
  "focus": "ホ",
  "jp": "ホスピタル",
  "romaji": "hosupitaru",
  "pt": "hospital",
  "type": "katakana",
  "hint": "Saúde.",
  "chars": [
    "ホ",
    "ス",
    "ピ",
    "タ",
    "ル"
  ]
},
{
  "id": "k_ho_hobbii",
  "category": "katakana",
  "focus": "ホ",
  "jp": "ホビー",
  "romaji": "hobii",
  "pt": "hobby",
  "type": "katakana",
  "hint": "Lazer e compras.",
  "chars": [
    "ホ",
    "ビ",
    "ー"
  ]
},
{
  "id": "h_ma_mado",
  "category": "hiragana",
  "focus": "ま",
  "jp": "まど",
  "romaji": "mado",
  "pt": "janela",
  "type": "hiragana",
  "hint": "Casa e ambiente.",
  "chars": [
    "ま",
    "ど"
  ]
},
{
  "id": "h_ma_machi",
  "category": "hiragana",
  "focus": "ま",
  "jp": "まち",
  "romaji": "machi",
  "pt": "cidade / bairro",
  "type": "hiragana",
  "hint": "Vida no Japão.",
  "chars": [
    "ま",
    "ち"
  ]
},
{
  "id": "h_ma_mae",
  "category": "hiragana",
  "focus": "ま",
  "jp": "まえ",
  "romaji": "mae",
  "pt": "frente / antes",
  "type": "hiragana",
  "hint": "Localização e tempo.",
  "chars": [
    "ま",
    "え"
  ]
},
{
  "id": "h_ma_matsu",
  "category": "hiragana",
  "focus": "ま",
  "jp": "まつ",
  "romaji": "matsu",
  "pt": "esperar",
  "type": "hiragana",
  "hint": "Verbo útil em atendimento e rotina.",
  "chars": [
    "ま",
    "つ"
  ]
},
{
  "id": "h_ma_maru",
  "category": "hiragana",
  "focus": "ま",
  "jp": "まる",
  "romaji": "maru",
  "pt": "círculo / correto",
  "type": "hiragana",
  "hint": "Usado em símbolos e avaliação.",
  "chars": [
    "ま",
    "る"
  ]
},
{
  "id": "h_ma_makeru",
  "category": "hiragana",
  "focus": "ま",
  "jp": "まける",
  "romaji": "makeru",
  "pt": "perder / ser derrotado",
  "type": "hiragana",
  "hint": "Vocabulário comum.",
  "chars": [
    "ま",
    "け",
    "る"
  ]
},
{
  "id": "h_ma_mamoru",
  "category": "hiragana",
  "focus": "ま",
  "jp": "まもる",
  "romaji": "mamoru",
  "pt": "proteger / cumprir",
  "type": "hiragana",
  "hint": "Regras, segurança e vida.",
  "chars": [
    "ま",
    "も",
    "る"
  ]
},
{
  "id": "h_mi_mizu",
  "category": "hiragana",
  "focus": "み",
  "jp": "みず",
  "romaji": "mizu",
  "pt": "água",
  "type": "hiragana",
  "hint": "Essencial no cotidiano.",
  "chars": [
    "み",
    "ず"
  ]
},
{
  "id": "h_mi_mimi",
  "category": "hiragana",
  "focus": "み",
  "jp": "みみ",
  "romaji": "mimi",
  "pt": "orelha",
  "type": "hiragana",
  "hint": "Corpo e saúde.",
  "chars": [
    "み",
    "み"
  ]
},
{
  "id": "h_mi_michi",
  "category": "hiragana",
  "focus": "み",
  "jp": "みち",
  "romaji": "michi",
  "pt": "caminho / rua",
  "type": "hiragana",
  "hint": "Localização.",
  "chars": [
    "み",
    "ち"
  ]
},
{
  "id": "h_mi_mise",
  "category": "hiragana",
  "focus": "み",
  "jp": "みせ",
  "romaji": "mise",
  "pt": "loja",
  "type": "hiragana",
  "hint": "Compras e atendimento.",
  "chars": [
    "み",
    "せ"
  ]
},
{
  "id": "h_mi_migi",
  "category": "hiragana",
  "focus": "み",
  "jp": "みぎ",
  "romaji": "migi",
  "pt": "direita",
  "type": "hiragana",
  "hint": "Direção essencial.",
  "chars": [
    "み",
    "ぎ"
  ]
},
{
  "id": "h_mi_miru",
  "category": "hiragana",
  "focus": "み",
  "jp": "みる",
  "romaji": "miru",
  "pt": "ver / assistir",
  "type": "hiragana",
  "hint": "Verbo essencial.",
  "chars": [
    "み",
    "る"
  ]
},
{
  "id": "h_mi_mijikai",
  "category": "hiragana",
  "focus": "み",
  "jp": "みじかい",
  "romaji": "mijikai",
  "pt": "curto",
  "type": "hiragana",
  "hint": "Adjetivo útil.",
  "chars": [
    "み",
    "じ",
    "か",
    "い"
  ]
},
{
  "id": "h_mu_mushi",
  "category": "hiragana",
  "focus": "む",
  "jp": "むし",
  "romaji": "mushi",
  "pt": "inseto",
  "type": "hiragana",
  "hint": "Casa e cotidiano.",
  "chars": [
    "む",
    "し"
  ]
},
{
  "id": "h_mu_mune",
  "category": "hiragana",
  "focus": "む",
  "jp": "むね",
  "romaji": "mune",
  "pt": "peito",
  "type": "hiragana",
  "hint": "Corpo e saúde.",
  "chars": [
    "む",
    "ね"
  ]
},
{
  "id": "h_mu_mura",
  "category": "hiragana",
  "focus": "む",
  "jp": "むら",
  "romaji": "mura",
  "pt": "vila / aldeia",
  "type": "hiragana",
  "hint": "Vocabulário básico.",
  "chars": [
    "む",
    "ら"
  ]
},
{
  "id": "h_mu_muri",
  "category": "hiragana",
  "focus": "む",
  "jp": "むり",
  "romaji": "muri",
  "pt": "impossível / forçado",
  "type": "hiragana",
  "hint": "Muito útil para limites no trabalho.",
  "chars": [
    "む",
    "り"
  ]
},
{
  "id": "h_mu_muzukashii",
  "category": "hiragana",
  "focus": "む",
  "jp": "むずかしい",
  "romaji": "muzukashii",
  "pt": "difícil",
  "type": "hiragana",
  "hint": "Essencial para estudo.",
  "chars": [
    "む",
    "ず",
    "か",
    "し",
    "い"
  ]
},
{
  "id": "h_mu_mukaeru",
  "category": "hiragana",
  "focus": "む",
  "jp": "むかえる",
  "romaji": "mukaeru",
  "pt": "buscar / receber alguém",
  "type": "hiragana",
  "hint": "Vida real no Japão.",
  "chars": [
    "む",
    "か",
    "え",
    "る"
  ]
},
{
  "id": "h_mu_mukashi",
  "category": "hiragana",
  "focus": "む",
  "jp": "むかし",
  "romaji": "mukashi",
  "pt": "antigamente",
  "type": "hiragana",
  "hint": "Conversas e histórias.",
  "chars": [
    "む",
    "か",
    "し"
  ]
},
{
  "id": "h_me_me",
  "category": "hiragana",
  "focus": "め",
  "jp": "め",
  "romaji": "me",
  "pt": "olho",
  "type": "hiragana",
  "hint": "Palavra curta e essencial.",
  "chars": [
    "め"
  ]
},
{
  "id": "h_me_mesu",
  "category": "hiragana",
  "focus": "め",
  "jp": "めす",
  "romaji": "mesu",
  "pt": "fêmea",
  "type": "hiragana",
  "hint": "Vocabulário básico.",
  "chars": [
    "め",
    "す"
  ]
},
{
  "id": "h_me_meshi",
  "category": "hiragana",
  "focus": "め",
  "jp": "めし",
  "romaji": "meshi",
  "pt": "refeição / comida",
  "type": "hiragana",
  "hint": "Palavra casual.",
  "chars": [
    "め",
    "し"
  ]
},
{
  "id": "h_me_megane",
  "category": "hiragana",
  "focus": "め",
  "jp": "めがね",
  "romaji": "megane",
  "pt": "óculos",
  "type": "hiragana",
  "hint": "Vida diária.",
  "chars": [
    "め",
    "が",
    "ね"
  ]
},
{
  "id": "h_me_memo",
  "category": "hiragana",
  "focus": "め",
  "jp": "めも",
  "romaji": "memo",
  "pt": "anotação",
  "type": "hiragana",
  "hint": "Estudo e trabalho.",
  "chars": [
    "め",
    "も"
  ]
},
{
  "id": "h_me_meiwaku",
  "category": "hiragana",
  "focus": "め",
  "jp": "めいわく",
  "romaji": "meiwaku",
  "pt": "incômodo / transtorno",
  "type": "hiragana",
  "hint": "Muito importante para convivência no Japão.",
  "chars": [
    "め",
    "い",
    "わ",
    "く"
  ]
},
{
  "id": "h_me_mendou",
  "category": "hiragana",
  "focus": "め",
  "jp": "めんどう",
  "romaji": "mendou",
  "pt": "trabalhoso / chato",
  "type": "hiragana",
  "hint": "Útil em conversa.",
  "chars": [
    "め",
    "ん",
    "ど",
    "う"
  ]
},
{
  "id": "h_mo_mono",
  "category": "hiragana",
  "focus": "も",
  "jp": "もの",
  "romaji": "mono",
  "pt": "coisa / objeto",
  "type": "hiragana",
  "hint": "Palavra essencial.",
  "chars": [
    "も",
    "の"
  ]
},
{
  "id": "h_mo_mori",
  "category": "hiragana",
  "focus": "も",
  "jp": "もり",
  "romaji": "mori",
  "pt": "floresta",
  "type": "hiragana",
  "hint": "Vocabulário visual.",
  "chars": [
    "も",
    "り"
  ]
},
{
  "id": "h_mo_momo",
  "category": "hiragana",
  "focus": "も",
  "jp": "もも",
  "romaji": "momo",
  "pt": "pêssego / coxa",
  "type": "hiragana",
  "hint": "Comida e corpo.",
  "chars": [
    "も",
    "も"
  ]
},
{
  "id": "h_mo_mokuteki",
  "category": "hiragana",
  "focus": "も",
  "jp": "もくてき",
  "romaji": "mokuteki",
  "pt": "objetivo",
  "type": "hiragana",
  "hint": "Estudo e trabalho.",
  "chars": [
    "も",
    "く",
    "て",
    "き"
  ]
},
{
  "id": "h_mo_mondai",
  "category": "hiragana",
  "focus": "も",
  "jp": "もんだい",
  "romaji": "mondai",
  "pt": "problema",
  "type": "hiragana",
  "hint": "Essencial para pedir ajuda.",
  "chars": [
    "も",
    "ん",
    "だ",
    "い"
  ]
},
{
  "id": "h_mo_motsu",
  "category": "hiragana",
  "focus": "も",
  "jp": "もつ",
  "romaji": "motsu",
  "pt": "segurar / ter consigo",
  "type": "hiragana",
  "hint": "Verbo útil.",
  "chars": [
    "も",
    "つ"
  ]
},
{
  "id": "h_mo_mou",
  "category": "hiragana",
  "focus": "も",
  "jp": "もう",
  "romaji": "mou",
  "pt": "já / mais",
  "type": "hiragana",
  "hint": "Muito usado em frases.",
  "chars": [
    "も",
    "う"
  ]
},
{
  "id": "k_ma_maku",
  "category": "katakana",
  "focus": "マ",
  "jp": "マスク",
  "romaji": "masuku",
  "pt": "máscara",
  "type": "katakana",
  "hint": "Farmácia, saúde e trabalho.",
  "chars": [
    "マ",
    "ス",
    "ク"
  ]
},
{
  "id": "k_ma_mado",
  "category": "katakana",
  "focus": "マ",
  "jp": "マドラー",
  "romaji": "madoraa",
  "pt": "mexedor",
  "type": "katakana",
  "hint": "Konbini e bebidas.",
  "chars": [
    "マ",
    "ド",
    "ラ",
    "ー"
  ]
},
{
  "id": "k_ma_manga",
  "category": "katakana",
  "focus": "マ",
  "jp": "マンガ",
  "romaji": "manga",
  "pt": "mangá",
  "type": "katakana",
  "hint": "Cultura japonesa.",
  "chars": [
    "マ",
    "ン",
    "ガ"
  ]
},
{
  "id": "k_ma_makuro",
  "category": "katakana",
  "focus": "マ",
  "jp": "マクロ",
  "romaji": "makuro",
  "pt": "macro",
  "type": "katakana",
  "hint": "Tecnologia e trabalho.",
  "chars": [
    "マ",
    "ク",
    "ロ"
  ]
},
{
  "id": "k_ma_manaa",
  "category": "katakana",
  "focus": "マ",
  "jp": "マナー",
  "romaji": "manaa",
  "pt": "boas maneiras",
  "type": "katakana",
  "hint": "Muito importante no Japão.",
  "chars": [
    "マ",
    "ナ",
    "ー"
  ]
},
{
  "id": "k_ma_maaku",
  "category": "katakana",
  "focus": "マ",
  "jp": "マーク",
  "romaji": "maaku",
  "pt": "marca / símbolo",
  "type": "katakana",
  "hint": "Placas e produtos.",
  "chars": [
    "マ",
    "ー",
    "ク"
  ]
},
{
  "id": "k_ma_maikuro",
  "category": "katakana",
  "focus": "マ",
  "jp": "マイクロ",
  "romaji": "maikuro",
  "pt": "micro",
  "type": "katakana",
  "hint": "Tecnologia e produtos.",
  "chars": [
    "マ",
    "イ",
    "ク",
    "ロ"
  ]
},
{
  "id": "k_mi_miruku",
  "category": "katakana",
  "focus": "ミ",
  "jp": "ミルク",
  "romaji": "miruku",
  "pt": "leite",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "ミ",
    "ル",
    "ク"
  ]
},
{
  "id": "k_mi_mini",
  "category": "katakana",
  "focus": "ミ",
  "jp": "ミニ",
  "romaji": "mini",
  "pt": "mini / pequeno",
  "type": "katakana",
  "hint": "Produtos e lojas.",
  "chars": [
    "ミ",
    "ニ"
  ]
},
{
  "id": "k_mi_misu",
  "category": "katakana",
  "focus": "ミ",
  "jp": "ミス",
  "romaji": "misu",
  "pt": "erro / miss",
  "type": "katakana",
  "hint": "Trabalho e estudo.",
  "chars": [
    "ミ",
    "ス"
  ]
},
{
  "id": "k_mi_mittaa",
  "category": "katakana",
  "focus": "ミ",
  "jp": "ミキサー",
  "romaji": "mikusaa",
  "pt": "liquidificador / mixer",
  "type": "katakana",
  "hint": "Cozinha e produtos.",
  "chars": [
    "ミ",
    "キ",
    "サ",
    "ー"
  ]
},
{
  "id": "k_mi_miitingu",
  "category": "katakana",
  "focus": "ミ",
  "jp": "ミーティング",
  "romaji": "miitingu",
  "pt": "reunião",
  "type": "katakana",
  "hint": "Trabalho.",
  "chars": [
    "ミ",
    "ー",
    "テ",
    "ィ",
    "ン",
    "グ"
  ]
},
{
  "id": "k_mi_misoshiru",
  "category": "katakana",
  "focus": "ミ",
  "jp": "ミソ",
  "romaji": "miso",
  "pt": "missô",
  "type": "katakana",
  "hint": "Comida japonesa.",
  "chars": [
    "ミ",
    "ソ"
  ]
},
{
  "id": "k_mi_mirion",
  "category": "katakana",
  "focus": "ミ",
  "jp": "ミリオン",
  "romaji": "mirion",
  "pt": "milhão",
  "type": "katakana",
  "hint": "Números e mídia.",
  "chars": [
    "ミ",
    "リ",
    "オ",
    "ン"
  ]
},
{
  "id": "k_mu_muubii",
  "category": "katakana",
  "focus": "ム",
  "jp": "ムービー",
  "romaji": "muubii",
  "pt": "filme / movie",
  "type": "katakana",
  "hint": "Celular e mídia.",
  "chars": [
    "ム",
    "ー",
    "ビ",
    "ー"
  ]
},
{
  "id": "k_mu_muudoo",
  "category": "katakana",
  "focus": "ム",
  "jp": "ムード",
  "romaji": "muudo",
  "pt": "clima / atmosfera",
  "type": "katakana",
  "hint": "Conversa e ambiente.",
  "chars": [
    "ム",
    "ー",
    "ド"
  ]
},
{
  "id": "k_mu_muun",
  "category": "katakana",
  "focus": "ム",
  "jp": "ムーン",
  "romaji": "muun",
  "pt": "lua / moon",
  "type": "katakana",
  "hint": "Nomes e produtos.",
  "chars": [
    "ム",
    "ー",
    "ン"
  ]
},
{
  "id": "k_mu_muriyou",
  "category": "katakana",
  "focus": "ム",
  "jp": "ムリ",
  "romaji": "muri",
  "pt": "impossível / forçado",
  "type": "katakana",
  "hint": "Uso casual em katakana.",
  "chars": [
    "ム",
    "リ"
  ]
},
{
  "id": "k_mu_muchu",
  "category": "katakana",
  "focus": "ム",
  "jp": "ムチ",
  "romaji": "muchi",
  "pt": "chicote",
  "type": "katakana",
  "hint": "Vocabulário visual.",
  "chars": [
    "ム",
    "チ"
  ]
},
{
  "id": "k_mu_musuku",
  "category": "katakana",
  "focus": "ム",
  "jp": "ムスク",
  "romaji": "musuku",
  "pt": "musk / fragrância",
  "type": "katakana",
  "hint": "Produtos e perfumes.",
  "chars": [
    "ム",
    "ス",
    "ク"
  ]
},
{
  "id": "k_mu_muka",
  "category": "katakana",
  "focus": "ム",
  "jp": "ムカデ",
  "romaji": "mukade",
  "pt": "centopeia",
  "type": "katakana",
  "hint": "Insetos e casa.",
  "chars": [
    "ム",
    "カ",
    "デ"
  ]
},
{
  "id": "k_me_meeru",
  "category": "katakana",
  "focus": "メ",
  "jp": "メール",
  "romaji": "meeru",
  "pt": "e-mail / mensagem",
  "type": "katakana",
  "hint": "Celular e trabalho.",
  "chars": [
    "メ",
    "ー",
    "ル"
  ]
},
{
  "id": "k_me_memo",
  "category": "katakana",
  "focus": "メ",
  "jp": "メモ",
  "romaji": "memo",
  "pt": "anotação",
  "type": "katakana",
  "hint": "Estudo e trabalho.",
  "chars": [
    "メ",
    "モ"
  ]
},
{
  "id": "k_me_menyuu",
  "category": "katakana",
  "focus": "メ",
  "jp": "メニュー",
  "romaji": "menyuu",
  "pt": "menu",
  "type": "katakana",
  "hint": "Restaurante e apps.",
  "chars": [
    "メ",
    "ニ",
    "ュ",
    "ー"
  ]
},
{
  "id": "k_me_meekaa",
  "category": "katakana",
  "focus": "メ",
  "jp": "メーカー",
  "romaji": "meekaa",
  "pt": "fabricante / maker",
  "type": "katakana",
  "hint": "Produtos e trabalho.",
  "chars": [
    "メ",
    "ー",
    "カ",
    "ー"
  ]
},
{
  "id": "k_me_meetoru",
  "category": "katakana",
  "focus": "メ",
  "jp": "メートル",
  "romaji": "meetoru",
  "pt": "metro",
  "type": "katakana",
  "hint": "Medidas.",
  "chars": [
    "メ",
    "ー",
    "ト",
    "ル"
  ]
},
{
  "id": "k_me_mekanikku",
  "category": "katakana",
  "focus": "メ",
  "jp": "メカニック",
  "romaji": "mekanikku",
  "pt": "mecânico",
  "type": "katakana",
  "hint": "Carro e trabalho.",
  "chars": [
    "メ",
    "カ",
    "ニ",
    "ッ",
    "ク"
  ]
},
{
  "id": "k_me_meritto",
  "category": "katakana",
  "focus": "メ",
  "jp": "メリット",
  "romaji": "meritto",
  "pt": "vantagem / mérito",
  "type": "katakana",
  "hint": "Comparações e explicações.",
  "chars": [
    "メ",
    "リ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_mo_moru",
  "category": "katakana",
  "focus": "モ",
  "jp": "モデル",
  "romaji": "moderu",
  "pt": "modelo",
  "type": "katakana",
  "hint": "Produtos, pessoas e exemplos.",
  "chars": [
    "モ",
    "デ",
    "ル"
  ]
},
{
  "id": "k_mo_moniitaa",
  "category": "katakana",
  "focus": "モ",
  "jp": "モニター",
  "romaji": "monitaa",
  "pt": "monitor / tela",
  "type": "katakana",
  "hint": "Trabalho e tecnologia.",
  "chars": [
    "モ",
    "ニ",
    "タ",
    "ー"
  ]
},
{
  "id": "k_mo_mobairu",
  "category": "katakana",
  "focus": "モ",
  "jp": "モバイル",
  "romaji": "mobairu",
  "pt": "móvel / mobile",
  "type": "katakana",
  "hint": "Celular e apps.",
  "chars": [
    "モ",
    "バ",
    "イ",
    "ル"
  ]
},
{
  "id": "k_mo_moodo",
  "category": "katakana",
  "focus": "モ",
  "jp": "モード",
  "romaji": "moodo",
  "pt": "modo",
  "type": "katakana",
  "hint": "Apps e configurações.",
  "chars": [
    "モ",
    "ー",
    "ド"
  ]
},
{
  "id": "k_mo_mosuku",
  "category": "katakana",
  "focus": "モ",
  "jp": "モスク",
  "romaji": "mosuku",
  "pt": "mesquita",
  "type": "katakana",
  "hint": "Lugar e cultura.",
  "chars": [
    "モ",
    "ス",
    "ク"
  ]
},
{
  "id": "k_mo_moraru",
  "category": "katakana",
  "focus": "モ",
  "jp": "モラル",
  "romaji": "moraru",
  "pt": "moral",
  "type": "katakana",
  "hint": "Convivência e sociedade.",
  "chars": [
    "モ",
    "ラ",
    "ル"
  ]
},
{
  "id": "k_mo_monokuro",
  "category": "katakana",
  "focus": "モ",
  "jp": "モノクロ",
  "romaji": "monokuro",
  "pt": "preto e branco",
  "type": "katakana",
  "hint": "Imagem e impressão.",
  "chars": [
    "モ",
    "ノ",
    "ク",
    "ロ"
  ]
},
{
  "id": "h_ya_yama",
  "category": "hiragana",
  "focus": "や",
  "jp": "やま",
  "romaji": "yama",
  "pt": "montanha",
  "type": "hiragana",
  "hint": "Palavra visual e muito ligada ao Japão.",
  "chars": [
    "や",
    "ま"
  ]
},
{
  "id": "h_ya_yasai",
  "category": "hiragana",
  "focus": "や",
  "jp": "やさい",
  "romaji": "yasai",
  "pt": "verdura / legumes",
  "type": "hiragana",
  "hint": "Mercado e comida.",
  "chars": [
    "や",
    "さ",
    "い"
  ]
},
{
  "id": "h_ya_yasui",
  "category": "hiragana",
  "focus": "や",
  "jp": "やすい",
  "romaji": "yasui",
  "pt": "barato / fácil",
  "type": "hiragana",
  "hint": "Muito útil em compras.",
  "chars": [
    "や",
    "す",
    "い"
  ]
},
{
  "id": "h_ya_yasumu",
  "category": "hiragana",
  "focus": "や",
  "jp": "やすむ",
  "romaji": "yasumu",
  "pt": "descansar / faltar",
  "type": "hiragana",
  "hint": "Trabalho e rotina.",
  "chars": [
    "や",
    "す",
    "む"
  ]
},
{
  "id": "h_ya_yaku",
  "category": "hiragana",
  "focus": "や",
  "jp": "やく",
  "romaji": "yaku",
  "pt": "assar / função",
  "type": "hiragana",
  "hint": "Verbo e ideia útil.",
  "chars": [
    "や",
    "く"
  ]
},
{
  "id": "h_ya_yakusoku",
  "category": "hiragana",
  "focus": "や",
  "jp": "やくそく",
  "romaji": "yakusoku",
  "pt": "promessa / compromisso",
  "type": "hiragana",
  "hint": "Vida social e trabalho.",
  "chars": [
    "や",
    "く",
    "そ",
    "く"
  ]
},
{
  "id": "h_ya_yatto",
  "category": "hiragana",
  "focus": "や",
  "jp": "やっと",
  "romaji": "yatto",
  "pt": "finalmente",
  "type": "hiragana",
  "hint": "Muito usado em conversa.",
  "chars": [
    "や",
    "っ",
    "と"
  ]
},
{
  "id": "h_yu_yuki",
  "category": "hiragana",
  "focus": "ゆ",
  "jp": "ゆき",
  "romaji": "yuki",
  "pt": "neve",
  "type": "hiragana",
  "hint": "Clima no Japão.",
  "chars": [
    "ゆ",
    "き"
  ]
},
{
  "id": "h_yu_yume",
  "category": "hiragana",
  "focus": "ゆ",
  "jp": "ゆめ",
  "romaji": "yume",
  "pt": "sonho",
  "type": "hiragana",
  "hint": "Palavra emocional e memorável.",
  "chars": [
    "ゆ",
    "め"
  ]
},
{
  "id": "h_yu_yubi",
  "category": "hiragana",
  "focus": "ゆ",
  "jp": "ゆび",
  "romaji": "yubi",
  "pt": "dedo",
  "type": "hiragana",
  "hint": "Corpo e saúde.",
  "chars": [
    "ゆ",
    "び"
  ]
},
{
  "id": "h_yu_yuubin",
  "category": "hiragana",
  "focus": "ゆ",
  "jp": "ゆうびん",
  "romaji": "yuubin",
  "pt": "correio",
  "type": "hiragana",
  "hint": "Documentos e entregas.",
  "chars": [
    "ゆ",
    "う",
    "び",
    "ん"
  ]
},
{
  "id": "h_yu_yuugata",
  "category": "hiragana",
  "focus": "ゆ",
  "jp": "ゆうがた",
  "romaji": "yuugata",
  "pt": "fim da tarde",
  "type": "hiragana",
  "hint": "Tempo do dia.",
  "chars": [
    "ゆ",
    "う",
    "が",
    "た"
  ]
},
{
  "id": "h_yu_yukkuri",
  "category": "hiragana",
  "focus": "ゆ",
  "jp": "ゆっくり",
  "romaji": "yukkuri",
  "pt": "devagar / com calma",
  "type": "hiragana",
  "hint": "Útil para pedir calma.",
  "chars": [
    "ゆ",
    "っ",
    "く",
    "り"
  ]
},
{
  "id": "h_yu_yurusu",
  "category": "hiragana",
  "focus": "ゆ",
  "jp": "ゆるす",
  "romaji": "yurusu",
  "pt": "perdoar / permitir",
  "type": "hiragana",
  "hint": "Verbo útil.",
  "chars": [
    "ゆ",
    "る",
    "す"
  ]
},
{
  "id": "h_yo_yoru",
  "category": "hiragana",
  "focus": "よ",
  "jp": "よる",
  "romaji": "yoru",
  "pt": "noite",
  "type": "hiragana",
  "hint": "Rotina e horário.",
  "chars": [
    "よ",
    "る"
  ]
},
{
  "id": "h_yo_yoko",
  "category": "hiragana",
  "focus": "よ",
  "jp": "よこ",
  "romaji": "yoko",
  "pt": "lado",
  "type": "hiragana",
  "hint": "Localização.",
  "chars": [
    "よ",
    "こ"
  ]
},
{
  "id": "h_yo_yomu",
  "category": "hiragana",
  "focus": "よ",
  "jp": "よむ",
  "romaji": "yomu",
  "pt": "ler",
  "type": "hiragana",
  "hint": "Verbo central para estudo.",
  "chars": [
    "よ",
    "む"
  ]
},
{
  "id": "h_yo_yobu",
  "category": "hiragana",
  "focus": "よ",
  "jp": "よぶ",
  "romaji": "yobu",
  "pt": "chamar",
  "type": "hiragana",
  "hint": "Comunicação.",
  "chars": [
    "よ",
    "ぶ"
  ]
},
{
  "id": "h_yo_yowai",
  "category": "hiragana",
  "focus": "よ",
  "jp": "よわい",
  "romaji": "yowai",
  "pt": "fraco",
  "type": "hiragana",
  "hint": "Adjetivo útil.",
  "chars": [
    "よ",
    "わ",
    "い"
  ]
},
{
  "id": "h_yo_yoyaku",
  "category": "hiragana",
  "focus": "よ",
  "jp": "よやく",
  "romaji": "yoyaku",
  "pt": "reserva",
  "type": "hiragana",
  "hint": "Restaurante, hospital e serviços.",
  "chars": [
    "よ",
    "や",
    "く"
  ]
},
{
  "id": "h_yo_yorokobu",
  "category": "hiragana",
  "focus": "よ",
  "jp": "よろこぶ",
  "romaji": "yorokobu",
  "pt": "alegrar-se",
  "type": "hiragana",
  "hint": "Vocabulário emocional.",
  "chars": [
    "よ",
    "ろ",
    "こ",
    "ぶ"
  ]
},
{
  "id": "k_ya_yakult",
  "category": "katakana",
  "focus": "ヤ",
  "jp": "ヤクルト",
  "romaji": "yakuruto",
  "pt": "Yakult",
  "type": "katakana",
  "hint": "Produto muito comum no Japão.",
  "chars": [
    "ヤ",
    "ク",
    "ル",
    "ト"
  ]
},
{
  "id": "k_ya_yahoo",
  "category": "katakana",
  "focus": "ヤ",
  "jp": "ヤフー",
  "romaji": "yafuu",
  "pt": "Yahoo",
  "type": "katakana",
  "hint": "Serviços e internet.",
  "chars": [
    "ヤ",
    "フ",
    "ー"
  ]
},
{
  "id": "k_ya_yangu",
  "category": "katakana",
  "focus": "ヤ",
  "jp": "ヤング",
  "romaji": "yangu",
  "pt": "jovem / young",
  "type": "katakana",
  "hint": "Mídia e produtos.",
  "chars": [
    "ヤ",
    "ン",
    "グ"
  ]
},
{
  "id": "k_ya_yaado",
  "category": "katakana",
  "focus": "ヤ",
  "jp": "ヤード",
  "romaji": "yaado",
  "pt": "jarda / yard",
  "type": "katakana",
  "hint": "Medidas e termos estrangeiros.",
  "chars": [
    "ヤ",
    "ー",
    "ド"
  ]
},
{
  "id": "k_ya_yankii",
  "category": "katakana",
  "focus": "ヤ",
  "jp": "ヤンキー",
  "romaji": "yankii",
  "pt": "Yankee / delinquente",
  "type": "katakana",
  "hint": "Mídia e conversa.",
  "chars": [
    "ヤ",
    "ン",
    "キ",
    "ー"
  ]
},
{
  "id": "k_ya_yamaha",
  "category": "katakana",
  "focus": "ヤ",
  "jp": "ヤマハ",
  "romaji": "yamaha",
  "pt": "Yamaha",
  "type": "katakana",
  "hint": "Marca comum no Japão.",
  "chars": [
    "ヤ",
    "マ",
    "ハ"
  ]
},
{
  "id": "k_ya_yakitori",
  "category": "katakana",
  "focus": "ヤ",
  "jp": "ヤキトリ",
  "romaji": "yakitori",
  "pt": "espetinho de frango",
  "type": "katakana",
  "hint": "Comida comum.",
  "chars": [
    "ヤ",
    "キ",
    "ト",
    "リ"
  ]
},
{
  "id": "k_yu_yuuzaa",
  "category": "katakana",
  "focus": "ユ",
  "jp": "ユーザー",
  "romaji": "yuuzaa",
  "pt": "usuário",
  "type": "katakana",
  "hint": "Apps e serviços.",
  "chars": [
    "ユ",
    "ー",
    "ザ",
    "ー"
  ]
},
{
  "id": "k_yu_yunifoomu",
  "category": "katakana",
  "focus": "ユ",
  "jp": "ユニフォーム",
  "romaji": "yunifoomu",
  "pt": "uniforme",
  "type": "katakana",
  "hint": "Trabalho e escola.",
  "chars": [
    "ユ",
    "ニ",
    "フ",
    "ォ",
    "ー",
    "ム"
  ]
},
{
  "id": "k_yu_yuumoa",
  "category": "katakana",
  "focus": "ユ",
  "jp": "ユーモア",
  "romaji": "yuumoa",
  "pt": "humor",
  "type": "katakana",
  "hint": "Comunicação.",
  "chars": [
    "ユ",
    "ー",
    "モ",
    "ア"
  ]
},
{
  "id": "k_yu_yunaiteddo",
  "category": "katakana",
  "focus": "ユ",
  "jp": "ユナイテッド",
  "romaji": "yunaiteddo",
  "pt": "united / unido",
  "type": "katakana",
  "hint": "Nomes e marcas.",
  "chars": [
    "ユ",
    "ナ",
    "イ",
    "テ",
    "ッ",
    "ド"
  ]
},
{
  "id": "k_yu_yuuro",
  "category": "katakana",
  "focus": "ユ",
  "jp": "ユーロ",
  "romaji": "yuuro",
  "pt": "euro",
  "type": "katakana",
  "hint": "Dinheiro e países.",
  "chars": [
    "ユ",
    "ー",
    "ロ"
  ]
},
{
  "id": "k_yu_yunikuro",
  "category": "katakana",
  "focus": "ユ",
  "jp": "ユニクロ",
  "romaji": "yunikuro",
  "pt": "Uniqlo",
  "type": "katakana",
  "hint": "Loja muito comum no Japão.",
  "chars": [
    "ユ",
    "ニ",
    "ク",
    "ロ"
  ]
},
{
  "id": "k_yu_yuuchuubu",
  "category": "katakana",
  "focus": "ユ",
  "jp": "ユーチューブ",
  "romaji": "yuuchuubu",
  "pt": "YouTube",
  "type": "katakana",
  "hint": "Internet e estudo.",
  "chars": [
    "ユ",
    "ー",
    "チ",
    "ュ",
    "ー",
    "ブ"
  ]
},
{
  "id": "k_yo_yooguruto",
  "category": "katakana",
  "focus": "ヨ",
  "jp": "ヨーグルト",
  "romaji": "yooguruto",
  "pt": "iogurte",
  "type": "katakana",
  "hint": "Mercado e comida.",
  "chars": [
    "ヨ",
    "ー",
    "グ",
    "ル",
    "ト"
  ]
},
{
  "id": "k_yo_yooroppa",
  "category": "katakana",
  "focus": "ヨ",
  "jp": "ヨーロッパ",
  "romaji": "yooroppa",
  "pt": "Europa",
  "type": "katakana",
  "hint": "Geografia e notícias.",
  "chars": [
    "ヨ",
    "ー",
    "ロ",
    "ッ",
    "パ"
  ]
},
{
  "id": "k_yo_yoga",
  "category": "katakana",
  "focus": "ヨ",
  "jp": "ヨガ",
  "romaji": "yoga",
  "pt": "yoga",
  "type": "katakana",
  "hint": "Saúde e exercício.",
  "chars": [
    "ヨ",
    "ガ"
  ]
},
{
  "id": "k_yo_yotto",
  "category": "katakana",
  "focus": "ヨ",
  "jp": "ヨット",
  "romaji": "yotto",
  "pt": "iate",
  "type": "katakana",
  "hint": "Lazer e transporte.",
  "chars": [
    "ヨ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_yo_yooku",
  "category": "katakana",
  "focus": "ヨ",
  "jp": "ヨーク",
  "romaji": "yooku",
  "pt": "York / nome estrangeiro",
  "type": "katakana",
  "hint": "Nomes e marcas.",
  "chars": [
    "ヨ",
    "ー",
    "ク"
  ]
},
{
  "id": "k_yo_yodobashi",
  "category": "katakana",
  "focus": "ヨ",
  "jp": "ヨドバシ",
  "romaji": "yodobashi",
  "pt": "Yodobashi / loja",
  "type": "katakana",
  "hint": "Eletrônicos no Japão.",
  "chars": [
    "ヨ",
    "ド",
    "バ",
    "シ"
  ]
},
{
  "id": "k_yo_yoyogi",
  "category": "katakana",
  "focus": "ヨ",
  "jp": "ヨヨギ",
  "romaji": "yoyogi",
  "pt": "Yoyogi",
  "type": "katakana",
  "hint": "Nome de local em Tóquio.",
  "chars": [
    "ヨ",
    "ヨ",
    "ギ"
  ]
},
{
  "id": "h_ra_raigetsu",
  "category": "hiragana",
  "focus": "ら",
  "jp": "らいげつ",
  "romaji": "raigetsu",
  "pt": "mês que vem",
  "type": "hiragana",
  "hint": "Tempo e planejamento.",
  "chars": [
    "ら",
    "い",
    "げ",
    "つ"
  ]
},
{
  "id": "h_ra_rainen",
  "category": "hiragana",
  "focus": "ら",
  "jp": "らいねん",
  "romaji": "rainen",
  "pt": "ano que vem",
  "type": "hiragana",
  "hint": "Tempo e planejamento.",
  "chars": [
    "ら",
    "い",
    "ね",
    "ん"
  ]
},
{
  "id": "h_ra_raishuu",
  "category": "hiragana",
  "focus": "ら",
  "jp": "らいしゅう",
  "romaji": "raishuu",
  "pt": "semana que vem",
  "type": "hiragana",
  "hint": "Muito útil na rotina.",
  "chars": [
    "ら",
    "い",
    "し",
    "ゅ",
    "う"
  ]
},
{
  "id": "h_ra_raku",
  "category": "hiragana",
  "focus": "ら",
  "jp": "らく",
  "romaji": "raku",
  "pt": "fácil / confortável",
  "type": "hiragana",
  "hint": "Trabalho e vida.",
  "chars": [
    "ら",
    "く"
  ]
},
{
  "id": "h_ra_raamen",
  "category": "hiragana",
  "focus": "ら",
  "jp": "らーめん",
  "romaji": "raamen",
  "pt": "lámen",
  "type": "hiragana",
  "hint": "Comida muito comum.",
  "chars": [
    "ら",
    "ー",
    "め",
    "ん"
  ]
},
{
  "id": "h_ra_rappa",
  "category": "hiragana",
  "focus": "ら",
  "jp": "らっぱ",
  "romaji": "rappa",
  "pt": "trombeta",
  "type": "hiragana",
  "hint": "Palavra simples para treino.",
  "chars": [
    "ら",
    "っ",
    "ぱ"
  ]
},
{
  "id": "h_ra_rando",
  "category": "hiragana",
  "focus": "ら",
  "jp": "らんど",
  "romaji": "rando",
  "pt": "land / terra",
  "type": "hiragana",
  "hint": "Treino fonético simples.",
  "chars": [
    "ら",
    "ん",
    "ど"
  ]
},
{
  "id": "h_ri_risu",
  "category": "hiragana",
  "focus": "り",
  "jp": "りす",
  "romaji": "risu",
  "pt": "esquilo",
  "type": "hiragana",
  "hint": "Palavra curta para fixar り.",
  "chars": [
    "り",
    "す"
  ]
},
{
  "id": "h_ri_ringo",
  "category": "hiragana",
  "focus": "り",
  "jp": "りんご",
  "romaji": "ringo",
  "pt": "maçã",
  "type": "hiragana",
  "hint": "Mercado e comida.",
  "chars": [
    "り",
    "ん",
    "ご"
  ]
},
{
  "id": "h_ri_riyuu",
  "category": "hiragana",
  "focus": "り",
  "jp": "りゆう",
  "romaji": "riyuu",
  "pt": "motivo / razão",
  "type": "hiragana",
  "hint": "Muito útil para explicar.",
  "chars": [
    "り",
    "ゆ",
    "う"
  ]
},
{
  "id": "h_ri_ryouri",
  "category": "hiragana",
  "focus": "り",
  "jp": "りょうり",
  "romaji": "ryouri",
  "pt": "comida / culinária",
  "type": "hiragana",
  "hint": "Restaurante e casa.",
  "chars": [
    "り",
    "ょ",
    "う",
    "り"
  ]
},
{
  "id": "h_ri_ryoukin",
  "category": "hiragana",
  "focus": "り",
  "jp": "りょうきん",
  "romaji": "ryoukin",
  "pt": "taxa / cobrança",
  "type": "hiragana",
  "hint": "Contas, planos e serviços.",
  "chars": [
    "り",
    "ょ",
    "う",
    "き",
    "ん"
  ]
},
{
  "id": "h_ri_ritsu",
  "category": "hiragana",
  "focus": "り",
  "jp": "りつ",
  "romaji": "ritsu",
  "pt": "taxa / proporção",
  "type": "hiragana",
  "hint": "Vocabulário básico avançando.",
  "chars": [
    "り",
    "つ"
  ]
},
{
  "id": "h_ri_rippa",
  "category": "hiragana",
  "focus": "り",
  "jp": "りっぱ",
  "romaji": "rippa",
  "pt": "excelente / digno",
  "type": "hiragana",
  "hint": "Palavra comum em avaliação.",
  "chars": [
    "り",
    "っ",
    "ぱ"
  ]
},
{
  "id": "h_ru_rusu",
  "category": "hiragana",
  "focus": "る",
  "jp": "るす",
  "romaji": "rusu",
  "pt": "ausência / estar fora",
  "type": "hiragana",
  "hint": "Entrega e casa.",
  "chars": [
    "る",
    "す"
  ]
},
{
  "id": "h_ru_ruuru",
  "category": "hiragana",
  "focus": "る",
  "jp": "るーる",
  "romaji": "ruuru",
  "pt": "regra",
  "type": "hiragana",
  "hint": "Estudo e convivência.",
  "chars": [
    "る",
    "ー",
    "る"
  ]
},
{
  "id": "h_ru_rubi",
  "category": "hiragana",
  "focus": "る",
  "jp": "るび",
  "romaji": "rubi",
  "pt": "furigana / rubi",
  "type": "hiragana",
  "hint": "Útil para leitura japonesa.",
  "chars": [
    "る",
    "び"
  ]
},
{
  "id": "h_ru_rui",
  "category": "hiragana",
  "focus": "る",
  "jp": "るい",
  "romaji": "rui",
  "pt": "tipo / categoria",
  "type": "hiragana",
  "hint": "Classificação.",
  "chars": [
    "る",
    "い"
  ]
},
{
  "id": "h_ru_rusuban",
  "category": "hiragana",
  "focus": "る",
  "jp": "るすばん",
  "romaji": "rusuban",
  "pt": "ficar tomando conta da casa",
  "type": "hiragana",
  "hint": "Casa e rotina.",
  "chars": [
    "る",
    "す",
    "ば",
    "ん"
  ]
},
{
  "id": "h_ru_ruupu",
  "category": "hiragana",
  "focus": "る",
  "jp": "るーぷ",
  "romaji": "ruupu",
  "pt": "loop / repetição",
  "type": "hiragana",
  "hint": "Estudo e tecnologia.",
  "chars": [
    "る",
    "ー",
    "ぷ"
  ]
},
{
  "id": "h_ru_rusu2",
  "category": "hiragana",
  "focus": "る",
  "jp": "るすでん",
  "romaji": "rusuden",
  "pt": "secretária eletrônica",
  "type": "hiragana",
  "hint": "Telefone e comunicação.",
  "chars": [
    "る",
    "す",
    "で",
    "ん"
  ]
},
{
  "id": "h_re_rei",
  "category": "hiragana",
  "focus": "れ",
  "jp": "れい",
  "romaji": "rei",
  "pt": "exemplo / zero",
  "type": "hiragana",
  "hint": "Estudo e números.",
  "chars": [
    "れ",
    "い"
  ]
},
{
  "id": "h_re_rekishi",
  "category": "hiragana",
  "focus": "れ",
  "jp": "れきし",
  "romaji": "rekishi",
  "pt": "história",
  "type": "hiragana",
  "hint": "Estudo e cultura.",
  "chars": [
    "れ",
    "き",
    "し"
  ]
},
{
  "id": "h_re_renraku",
  "category": "hiragana",
  "focus": "れ",
  "jp": "れんらく",
  "romaji": "renraku",
  "pt": "contato / aviso",
  "type": "hiragana",
  "hint": "Trabalho e vida real.",
  "chars": [
    "れ",
    "ん",
    "ら",
    "く"
  ]
},
{
  "id": "h_re_renkyuu",
  "category": "hiragana",
  "focus": "れ",
  "jp": "れんきゅう",
  "romaji": "renkyuu",
  "pt": "feriado prolongado",
  "type": "hiragana",
  "hint": "Rotina no Japão.",
  "chars": [
    "れ",
    "ん",
    "き",
    "ゅ",
    "う"
  ]
},
{
  "id": "h_re_renshuu",
  "category": "hiragana",
  "focus": "れ",
  "jp": "れんしゅう",
  "romaji": "renshuu",
  "pt": "prática / treino",
  "type": "hiragana",
  "hint": "Central para o app.",
  "chars": [
    "れ",
    "ん",
    "し",
    "ゅ",
    "う"
  ]
},
{
  "id": "h_re_reizouko",
  "category": "hiragana",
  "focus": "れ",
  "jp": "れいぞうこ",
  "romaji": "reizouko",
  "pt": "geladeira",
  "type": "hiragana",
  "hint": "Casa e comida.",
  "chars": [
    "れ",
    "い",
    "ぞ",
    "う",
    "こ"
  ]
},
{
  "id": "h_re_retsu",
  "category": "hiragana",
  "focus": "れ",
  "jp": "れつ",
  "romaji": "retsu",
  "pt": "fila / fileira",
  "type": "hiragana",
  "hint": "Trabalho, loja e eventos.",
  "chars": [
    "れ",
    "つ"
  ]
},
{
  "id": "h_ro_roku",
  "category": "hiragana",
  "focus": "ろ",
  "jp": "ろく",
  "romaji": "roku",
  "pt": "seis",
  "type": "hiragana",
  "hint": "Número básico.",
  "chars": [
    "ろ",
    "く"
  ]
},
{
  "id": "h_ro_rouka",
  "category": "hiragana",
  "focus": "ろ",
  "jp": "ろうか",
  "romaji": "rouka",
  "pt": "corredor",
  "type": "hiragana",
  "hint": "Casa, escola e trabalho.",
  "chars": [
    "ろ",
    "う",
    "か"
  ]
},
{
  "id": "h_ro_roujin",
  "category": "hiragana",
  "focus": "ろ",
  "jp": "ろうじん",
  "romaji": "roujin",
  "pt": "idoso",
  "type": "hiragana",
  "hint": "Sociedade e família.",
  "chars": [
    "ろ",
    "う",
    "じ",
    "ん"
  ]
},
{
  "id": "h_ro_ronbun",
  "category": "hiragana",
  "focus": "ろ",
  "jp": "ろんぶん",
  "romaji": "ronbun",
  "pt": "artigo / tese",
  "type": "hiragana",
  "hint": "Estudo.",
  "chars": [
    "ろ",
    "ん",
    "ぶ",
    "ん"
  ]
},
{
  "id": "h_ro_romen",
  "category": "hiragana",
  "focus": "ろ",
  "jp": "ろめん",
  "romaji": "romen",
  "pt": "superfície da rua",
  "type": "hiragana",
  "hint": "Trânsito e cotidiano.",
  "chars": [
    "ろ",
    "め",
    "ん"
  ]
},
{
  "id": "h_ro_roten",
  "category": "hiragana",
  "focus": "ろ",
  "jp": "ろてん",
  "romaji": "roten",
  "pt": "ao ar livre / barraca",
  "type": "hiragana",
  "hint": "Eventos e lojas.",
  "chars": [
    "ろ",
    "て",
    "ん"
  ]
},
{
  "id": "h_ro_roudou",
  "category": "hiragana",
  "focus": "ろ",
  "jp": "ろうどう",
  "romaji": "roudou",
  "pt": "trabalho / labor",
  "type": "hiragana",
  "hint": "Vocabulário importante no Japão.",
  "chars": [
    "ろ",
    "う",
    "ど",
    "う"
  ]
},
{
  "id": "k_ra_raamen",
  "category": "katakana",
  "focus": "ラ",
  "jp": "ラーメン",
  "romaji": "raamen",
  "pt": "lámen",
  "type": "katakana",
  "hint": "Comida japonesa popular.",
  "chars": [
    "ラ",
    "ー",
    "メ",
    "ン"
  ]
},
{
  "id": "k_ra_rajiio",
  "category": "katakana",
  "focus": "ラ",
  "jp": "ラジオ",
  "romaji": "rajiio",
  "pt": "rádio",
  "type": "katakana",
  "hint": "Mídia e áudio.",
  "chars": [
    "ラ",
    "ジ",
    "オ"
  ]
},
{
  "id": "k_ra_rain",
  "category": "katakana",
  "focus": "ラ",
  "jp": "ライン",
  "romaji": "rain",
  "pt": "linha / LINE",
  "type": "katakana",
  "hint": "App e comunicação.",
  "chars": [
    "ラ",
    "イ",
    "ン"
  ]
},
{
  "id": "k_ra_raito",
  "category": "katakana",
  "focus": "ラ",
  "jp": "ライト",
  "romaji": "raito",
  "pt": "luz / leve",
  "type": "katakana",
  "hint": "Produtos e direção.",
  "chars": [
    "ラ",
    "イ",
    "ト"
  ]
},
{
  "id": "k_ra_rakku",
  "category": "katakana",
  "focus": "ラ",
  "jp": "ラック",
  "romaji": "rakku",
  "pt": "estante / sorte",
  "type": "katakana",
  "hint": "Casa e produtos.",
  "chars": [
    "ラ",
    "ッ",
    "ク"
  ]
},
{
  "id": "k_ra_raberu",
  "category": "katakana",
  "focus": "ラ",
  "jp": "ラベル",
  "romaji": "raberu",
  "pt": "rótulo / etiqueta",
  "type": "katakana",
  "hint": "Produtos e trabalho.",
  "chars": [
    "ラ",
    "ベ",
    "ル"
  ]
},
{
  "id": "k_ra_ranchi",
  "category": "katakana",
  "focus": "ラ",
  "jp": "ランチ",
  "romaji": "ranchi",
  "pt": "almoço",
  "type": "katakana",
  "hint": "Restaurante e rotina.",
  "chars": [
    "ラ",
    "ン",
    "チ"
  ]
},
{
  "id": "k_ri_rimooto",
  "category": "katakana",
  "focus": "リ",
  "jp": "リモート",
  "romaji": "rimooto",
  "pt": "remoto",
  "type": "katakana",
  "hint": "Trabalho e tecnologia.",
  "chars": [
    "リ",
    "モ",
    "ー",
    "ト"
  ]
},
{
  "id": "k_ri_risaikuru",
  "category": "katakana",
  "focus": "リ",
  "jp": "リサイクル",
  "romaji": "risaikuru",
  "pt": "reciclagem",
  "type": "katakana",
  "hint": "Vida no Japão.",
  "chars": [
    "リ",
    "サ",
    "イ",
    "ク",
    "ル"
  ]
},
{
  "id": "k_ri_risuto",
  "category": "katakana",
  "focus": "リ",
  "jp": "リスト",
  "romaji": "risuto",
  "pt": "← lista",
  "type": "katakana",
  "hint": "Apps, compras e estudo.",
  "chars": [
    "リ",
    "ス",
    "ト"
  ]
},
{
  "id": "k_ri_ringu",
  "category": "katakana",
  "focus": "リ",
  "jp": "リング",
  "romaji": "ringu",
  "pt": "anel / ring",
  "type": "katakana",
  "hint": "Compras e objetos.",
  "chars": [
    "リ",
    "ン",
    "グ"
  ]
},
{
  "id": "k_ri_rippu",
  "category": "katakana",
  "focus": "リ",
  "jp": "リップ",
  "romaji": "rippu",
  "pt": "batom / lip",
  "type": "katakana",
  "hint": "Cosméticos.",
  "chars": [
    "リ",
    "ッ",
    "プ"
  ]
},
{
  "id": "k_ri_riidaa",
  "category": "katakana",
  "focus": "リ",
  "jp": "リーダー",
  "romaji": "riidaa",
  "pt": "líder",
  "type": "katakana",
  "hint": "Trabalho.",
  "chars": [
    "リ",
    "ー",
    "ダ",
    "ー"
  ]
},
{
  "id": "k_ri_riaru",
  "category": "katakana",
  "focus": "リ",
  "jp": "リアル",
  "romaji": "riaru",
  "pt": "real",
  "type": "katakana",
  "hint": "Conversa e mídia.",
  "chars": [
    "リ",
    "ア",
    "ル"
  ]
},
{
  "id": "k_ru_ruuru",
  "category": "katakana",
  "focus": "ル",
  "jp": "ルール",
  "romaji": "ruuru",
  "pt": "regra",
  "type": "katakana",
  "hint": "Trabalho e convivência.",
  "chars": [
    "ル",
    "ー",
    "ル"
  ]
},
{
  "id": "k_ru_ruuto",
  "category": "katakana",
  "focus": "ル",
  "jp": "ルート",
  "romaji": "ruuto",
  "pt": "rota",
  "type": "katakana",
  "hint": "Transporte e mapas.",
  "chars": [
    "ル",
    "ー",
    "ト"
  ]
},
{
  "id": "k_ru_ruumu",
  "category": "katakana",
  "focus": "ル",
  "jp": "ルーム",
  "romaji": "ruumu",
  "pt": "quarto / sala",
  "type": "katakana",
  "hint": "Moradia e hotel.",
  "chars": [
    "ル",
    "ー",
    "ム"
  ]
},
{
  "id": "k_ru_rubii",
  "category": "katakana",
  "focus": "ル",
  "jp": "ルビー",
  "romaji": "rubii",
  "pt": "rubi",
  "type": "katakana",
  "hint": "Pedra e nomes.",
  "chars": [
    "ル",
    "ビ",
    "ー"
  ]
},
{
  "id": "k_ru_rukku",
  "category": "katakana",
  "focus": "ル",
  "jp": "ルック",
  "romaji": "rukku",
  "pt": "visual / look",
  "type": "katakana",
  "hint": "Moda e produtos.",
  "chars": [
    "ル",
    "ッ",
    "ク"
  ]
},
{
  "id": "k_ru_ruutaa",
  "category": "katakana",
  "focus": "ル",
  "jp": "ルーター",
  "romaji": "ruutaa",
  "pt": "roteador",
  "type": "katakana",
  "hint": "Internet e casa.",
  "chars": [
    "ル",
    "ー",
    "タ",
    "ー"
  ]
},
{
  "id": "k_ru_ruumania",
  "category": "katakana",
  "focus": "ル",
  "jp": "ルーマニア",
  "romaji": "ruumania",
  "pt": "Romênia",
  "type": "katakana",
  "hint": "País em katakana.",
  "chars": [
    "ル",
    "ー",
    "マ",
    "ニ",
    "ア"
  ]
},
{
  "id": "k_re_reshiito",
  "category": "katakana",
  "focus": "レ",
  "jp": "レシート",
  "romaji": "reshiito",
  "pt": "recibo",
  "type": "katakana",
  "hint": "Compras e comprovantes.",
  "chars": [
    "レ",
    "シ",
    "ー",
    "ト"
  ]
},
{
  "id": "k_re_reberu",
  "category": "katakana",
  "focus": "レ",
  "jp": "レベル",
  "romaji": "reberu",
  "pt": "nível",
  "type": "katakana",
  "hint": "Estudo e progresso.",
  "chars": [
    "レ",
    "ベ",
    "ル"
  ]
},
{
  "id": "k_re_renji",
  "category": "katakana",
  "focus": "レ",
  "jp": "レンジ",
  "romaji": "renji",
  "pt": "micro-ondas / fogão",
  "type": "katakana",
  "hint": "Casa e comida.",
  "chars": [
    "レ",
    "ン",
    "ジ"
  ]
},
{
  "id": "k_re_rebyuu",
  "category": "katakana",
  "focus": "レ",
  "jp": "レビュー",
  "romaji": "rebyuu",
  "pt": "avaliação / review",
  "type": "katakana",
  "hint": "Apps e compras.",
  "chars": [
    "レ",
    "ビ",
    "ュ",
    "ー"
  ]
},
{
  "id": "k_re_resutoran",
  "category": "katakana",
  "focus": "レ",
  "jp": "レストラン",
  "romaji": "resutoran",
  "pt": "restaurante",
  "type": "katakana",
  "hint": "Comida e lazer.",
  "chars": [
    "レ",
    "ス",
    "ト",
    "ラ",
    "ン"
  ]
},
{
  "id": "k_re_ressun",
  "category": "katakana",
  "focus": "レ",
  "jp": "レッスン",
  "romaji": "ressun",
  "pt": "aula / lição",
  "type": "katakana",
  "hint": "Estudo.",
  "chars": [
    "レ",
    "ッ",
    "ス",
    "ン"
  ]
},
{
  "id": "k_re_rejaa",
  "category": "katakana",
  "focus": "レ",
  "jp": "レジャー",
  "romaji": "rejaa",
  "pt": "lazer",
  "type": "katakana",
  "hint": "Vida e descanso.",
  "chars": [
    "レ",
    "ジ",
    "ャ",
    "ー"
  ]
},
{
  "id": "k_ro_rokkaa",
  "category": "katakana",
  "focus": "ロ",
  "jp": "ロッカー",
  "romaji": "rokkaa",
  "pt": "armário / locker",
  "type": "katakana",
  "hint": "Trabalho, escola e academia.",
  "chars": [
    "ロ",
    "ッ",
    "カ",
    "ー"
  ]
},
{
  "id": "k_ro_rogo",
  "category": "katakana",
  "focus": "ロ",
  "jp": "ロゴ",
  "romaji": "rogo",
  "pt": "logo",
  "type": "katakana",
  "hint": "Marcas e design.",
  "chars": [
    "ロ",
    "ゴ"
  ]
},
{
  "id": "k_ro_rookaru",
  "category": "katakana",
  "focus": "ロ",
  "jp": "ローカル",
  "romaji": "rookaru",
  "pt": "local",
  "type": "katakana",
  "hint": "Serviços e transporte.",
  "chars": [
    "ロ",
    "ー",
    "カ",
    "ル"
  ]
},
{
  "id": "k_ro_roodo",
  "category": "katakana",
  "focus": "ロ",
  "jp": "ロード",
  "romaji": "roodo",
  "pt": "estrada / road",
  "type": "katakana",
  "hint": "Mapas e jogos.",
  "chars": [
    "ロ",
    "ー",
    "ド"
  ]
},
{
  "id": "k_ro_roomaji",
  "category": "katakana",
  "focus": "ロ",
  "jp": "ローマ字",
  "romaji": "roomaji",
  "pt": "letras romanas / romaji",
  "type": "katakana",
  "hint": "Estudo de japonês.",
  "chars": [
    "ロ",
    "ー",
    "マ",
    "字"
  ]
},
{
  "id": "k_ro_rosuto",
  "category": "katakana",
  "focus": "ロ",
  "jp": "ロスト",
  "romaji": "rosuto",
  "pt": "perdido / lost",
  "type": "katakana",
  "hint": "Serviços e jogos.",
  "chars": [
    "ロ",
    "ス",
    "ト"
  ]
},
{
  "id": "k_ro_rongu",
  "category": "katakana",
  "focus": "ロ",
  "jp": "ロング",
  "romaji": "rongu",
  "pt": "longo / long",
  "type": "katakana",
  "hint": "Produtos e roupas.",
  "chars": [
    "ロ",
    "ン",
    "グ"
  ]
},
{
  "id": "h_wa_watashi",
  "category": "hiragana",
  "focus": "わ",
  "jp": "わたし",
  "romaji": "watashi",
  "pt": "eu",
  "type": "hiragana",
  "hint": "Palavra essencial para se apresentar.",
  "chars": [
    "わ",
    "た",
    "し"
  ]
},
{
  "id": "h_wa_warui",
  "category": "hiragana",
  "focus": "わ",
  "jp": "わるい",
  "romaji": "warui",
  "pt": "ruim / errado",
  "type": "hiragana",
  "hint": "Útil para desculpas e explicações.",
  "chars": [
    "わ",
    "る",
    "い"
  ]
},
{
  "id": "h_wa_wakaru",
  "category": "hiragana",
  "focus": "わ",
  "jp": "わかる",
  "romaji": "wakaru",
  "pt": "entender",
  "type": "hiragana",
  "hint": "Essencial para estudo e comunicação.",
  "chars": [
    "わ",
    "か",
    "る"
  ]
},
{
  "id": "h_wa_wasureru",
  "category": "hiragana",
  "focus": "わ",
  "jp": "わすれる",
  "romaji": "wasureru",
  "pt": "esquecer",
  "type": "hiragana",
  "hint": "Muito usado no cotidiano.",
  "chars": [
    "わ",
    "す",
    "れ",
    "る"
  ]
},
{
  "id": "h_wa_warau",
  "category": "hiragana",
  "focus": "わ",
  "jp": "わらう",
  "romaji": "warau",
  "pt": "rir",
  "type": "hiragana",
  "hint": "Vocabulário emocional.",
  "chars": [
    "わ",
    "ら",
    "う"
  ]
},
{
  "id": "h_wa_wakai",
  "category": "hiragana",
  "focus": "わ",
  "jp": "わかい",
  "romaji": "wakai",
  "pt": "jovem",
  "type": "hiragana",
  "hint": "Adjetivo básico.",
  "chars": [
    "わ",
    "か",
    "い"
  ]
},
{
  "id": "h_wa_wakare",
  "category": "hiragana",
  "focus": "わ",
  "jp": "わかれ",
  "romaji": "wakare",
  "pt": "despedida / separação",
  "type": "hiragana",
  "hint": "Vida social e conversa.",
  "chars": [
    "わ",
    "か",
    "れ"
  ]
},
{
  "id": "h_wo_mizuwo",
  "category": "hiragana",
  "focus": "を",
  "jp": "みずを",
  "romaji": "mizu o",
  "pt": "água + partícula を",
  "type": "hiragana",
  "hint": "Treina を como partícula que marca o objeto da ação.",
  "chars": [
    "み",
    "ず",
    "を"
  ]
},
{
  "id": "h_wo_panwo",
  "category": "hiragana",
  "focus": "を",
  "jp": "ぱんを",
  "romaji": "pan o",
  "pt": "pão + partícula を",
  "type": "hiragana",
  "hint": "Estrutura curta para fixar o を.",
  "chars": [
    "ぱ",
    "ん",
    "を"
  ]
},
{
  "id": "h_wo_tewo",
  "category": "hiragana",
  "focus": "を",
  "jp": "てを",
  "romaji": "te o",
  "pt": "mão + partícula を",
  "type": "hiragana",
  "hint": "Muito usado em frases como lavar as mãos.",
  "chars": [
    "て",
    "を"
  ]
},
{
  "id": "h_wo_naniwo",
  "category": "hiragana",
  "focus": "を",
  "jp": "なにを",
  "romaji": "nani o",
  "pt": "o quê + partícula を",
  "type": "hiragana",
  "hint": "Base para perguntas simples.",
  "chars": [
    "な",
    "に",
    "を"
  ]
},
{
  "id": "h_wo_korewo",
  "category": "hiragana",
  "focus": "を",
  "jp": "これを",
  "romaji": "kore o",
  "pt": "isto + partícula を",
  "type": "hiragana",
  "hint": "Útil em pedidos e compras.",
  "chars": [
    "こ",
    "れ",
    "を"
  ]
},
{
  "id": "h_wo_sorewo",
  "category": "hiragana",
  "focus": "を",
  "jp": "それを",
  "romaji": "sore o",
  "pt": "isso + partícula を",
  "type": "hiragana",
  "hint": "Útil em conversa e atendimento.",
  "chars": [
    "そ",
    "れ",
    "を"
  ]
},
{
  "id": "h_wo_benkyouwo",
  "category": "hiragana",
  "focus": "を",
  "jp": "べんきょうを",
  "romaji": "benkyou o",
  "pt": "estudo + partícula を",
  "type": "hiragana",
  "hint": "Ajuda a entender objeto da ação.",
  "chars": [
    "べ",
    "ん",
    "き",
    "ょ",
    "う",
    "を"
  ]
},
{
  "id": "h_n_pan",
  "category": "hiragana",
  "focus": "ん",
  "jp": "ぱん",
  "romaji": "pan",
  "pt": "pão",
  "type": "hiragana",
  "hint": "Palavra simples para fixar ん.",
  "chars": [
    "ぱ",
    "ん"
  ]
},
{
  "id": "h_n_en",
  "category": "hiragana",
  "focus": "ん",
  "jp": "えん",
  "romaji": "en",
  "pt": "iene / círculo",
  "type": "hiragana",
  "hint": "Muito útil para dinheiro.",
  "chars": [
    "え",
    "ん"
  ]
},
{
  "id": "h_n_hon",
  "category": "hiragana",
  "focus": "ん",
  "jp": "ほん",
  "romaji": "hon",
  "pt": "livro",
  "type": "hiragana",
  "hint": "Estudo e rotina.",
  "chars": [
    "ほ",
    "ん"
  ]
},
{
  "id": "h_n_denwa",
  "category": "hiragana",
  "focus": "ん",
  "jp": "でんわ",
  "romaji": "denwa",
  "pt": "telefone",
  "type": "hiragana",
  "hint": "Comunicação.",
  "chars": [
    "で",
    "ん",
    "わ"
  ]
},
{
  "id": "h_n_benri",
  "category": "hiragana",
  "focus": "ん",
  "jp": "べんり",
  "romaji": "benri",
  "pt": "prático / conveniente",
  "type": "hiragana",
  "hint": "Muito usado no Japão.",
  "chars": [
    "べ",
    "ん",
    "り"
  ]
},
{
  "id": "h_n_kanji",
  "category": "hiragana",
  "focus": "ん",
  "jp": "かんじ",
  "romaji": "kanji",
  "pt": "kanji",
  "type": "hiragana",
  "hint": "Base para a próxima fase do app.",
  "chars": [
    "か",
    "ん",
    "じ"
  ]
},
{
  "id": "h_n_nihongo",
  "category": "hiragana",
  "focus": "ん",
  "jp": "にほんご",
  "romaji": "nihongo",
  "pt": "língua japonesa",
  "type": "hiragana",
  "hint": "Palavra central do projeto.",
  "chars": [
    "に",
    "ほ",
    "ん",
    "ご"
  ]
},
{
  "id": "k_wa_wain",
  "category": "katakana",
  "focus": "ワ",
  "jp": "ワイン",
  "romaji": "wain",
  "pt": "vinho",
  "type": "katakana",
  "hint": "Produto comum em mercado.",
  "chars": [
    "ワ",
    "イ",
    "ン"
  ]
},
{
  "id": "k_wa_waihai",
  "category": "katakana",
  "focus": "ワ",
  "jp": "ワイファイ",
  "romaji": "waifai",
  "pt": "Wi-Fi",
  "type": "katakana",
  "hint": "Casa, trabalho e internet.",
  "chars": [
    "ワ",
    "イ",
    "フ",
    "ァ",
    "イ"
  ]
},
{
  "id": "k_wa_wakuchin",
  "category": "katakana",
  "focus": "ワ",
  "jp": "ワクチン",
  "romaji": "wakuchin",
  "pt": "vacina",
  "type": "katakana",
  "hint": "Saúde e prefeitura.",
  "chars": [
    "ワ",
    "ク",
    "チ",
    "ン"
  ]
},
{
  "id": "k_wa_wanpiisu",
  "category": "katakana",
  "focus": "ワ",
  "jp": "ワンピース",
  "romaji": "wanpiisu",
  "pt": "vestido / One Piece",
  "type": "katakana",
  "hint": "Roupa e cultura.",
  "chars": [
    "ワ",
    "ン",
    "ピ",
    "ー",
    "ス"
  ]
},
{
  "id": "k_wa_wan",
  "category": "katakana",
  "focus": "ワ",
  "jp": "ワン",
  "romaji": "wan",
  "pt": "um / one",
  "type": "katakana",
  "hint": "Números em nomes e produtos.",
  "chars": [
    "ワ",
    "ン"
  ]
},
{
  "id": "k_wa_waaku",
  "category": "katakana",
  "focus": "ワ",
  "jp": "ワーク",
  "romaji": "waaku",
  "pt": "trabalho / work",
  "type": "katakana",
  "hint": "Trabalho e tecnologia.",
  "chars": [
    "ワ",
    "ー",
    "ク"
  ]
},
{
  "id": "k_wa_wappuru",
  "category": "katakana",
  "focus": "ワ",
  "jp": "ワッフル",
  "romaji": "waffuru",
  "pt": "waffle",
  "type": "katakana",
  "hint": "Comida e konbini.",
  "chars": [
    "ワ",
    "ッ",
    "フ",
    "ル"
  ]
},
{
  "id": "k_wo_wotaku",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲタク",
  "romaji": "wotaku",
  "pt": "otaku / fã intenso",
  "type": "katakana",
  "hint": "Uso cultural de ヲ, pouco comum no cotidiano.",
  "chars": [
    "ヲ",
    "タ",
    "ク"
  ]
},
{
  "id": "k_wo_wo",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲ",
  "romaji": "wo",
  "pt": "kana ヲ isolado",
  "type": "katakana",
  "hint": "Treino direto do kana raro ヲ.",
  "chars": [
    "ヲ"
  ]
},
{
  "id": "k_wo_wo_shiru",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲシル",
  "romaji": "wo shiru",
  "pt": "treino visual de ヲ",
  "type": "katakana",
  "hint": "Forma didática para reconhecer ヲ.",
  "chars": [
    "ヲ",
    "シ",
    "ル"
  ]
},
{
  "id": "k_wo_wo_miru",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲミル",
  "romaji": "wo miru",
  "pt": "treino visual de ヲ",
  "type": "katakana",
  "hint": "Forma didática para praticar escrita.",
  "chars": [
    "ヲ",
    "ミ",
    "ル"
  ]
},
{
  "id": "k_wo_wo_kaku",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲカク",
  "romaji": "wo kaku",
  "pt": "escrever ヲ",
  "type": "katakana",
  "hint": "Treino didático do kana raro.",
  "chars": [
    "ヲ",
    "カ",
    "ク"
  ]
},
{
  "id": "k_wo_wo_yomu",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲヨム",
  "romaji": "wo yomu",
  "pt": "ler ヲ",
  "type": "katakana",
  "hint": "Treino didático do kana raro.",
  "chars": [
    "ヲ",
    "ヨ",
    "ム"
  ]
},
{
  "id": "k_wo_wo_oboeru",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲオボエル",
  "romaji": "wo oboeru",
  "pt": "memorizar ヲ",
  "type": "katakana",
  "hint": "Treino didático do kana raro.",
  "chars": [
    "ヲ",
    "オ",
    "ボ",
    "エ",
    "ル"
  ]
},
{
  "id": "k_n_pan",
  "category": "katakana",
  "focus": "ン",
  "jp": "パン",
  "romaji": "pan",
  "pt": "pão",
  "type": "katakana",
  "hint": "Palavra curta para fixar ン.",
  "chars": [
    "パ",
    "ン"
  ]
},
{
  "id": "k_n_konbini",
  "category": "katakana",
  "focus": "ン",
  "jp": "コンビニ",
  "romaji": "konbini",
  "pt": "loja de conveniência",
  "type": "katakana",
  "hint": "Palavra essencial no Japão.",
  "chars": [
    "コ",
    "ン",
    "ビ",
    "ニ"
  ]
},
{
  "id": "k_n_konsento",
  "category": "katakana",
  "focus": "ン",
  "jp": "コンセント",
  "romaji": "konsento",
  "pt": "tomada",
  "type": "katakana",
  "hint": "Casa e trabalho.",
  "chars": [
    "コ",
    "ン",
    "セ",
    "ン",
    "ト"
  ]
},
{
  "id": "k_n_ranchi",
  "category": "katakana",
  "focus": "ン",
  "jp": "ランチ",
  "romaji": "ranchi",
  "pt": "almoço",
  "type": "katakana",
  "hint": "Restaurante e rotina.",
  "chars": [
    "ラ",
    "ン",
    "チ"
  ]
},
{
  "id": "k_n_enjin",
  "category": "katakana",
  "focus": "ン",
  "jp": "エンジン",
  "romaji": "enjin",
  "pt": "motor",
  "type": "katakana",
  "hint": "Carro e fábrica.",
  "chars": [
    "エ",
    "ン",
    "ジ",
    "ン"
  ]
},
{
  "id": "k_n_pinku",
  "category": "katakana",
  "focus": "ン",
  "jp": "ピンク",
  "romaji": "pinku",
  "pt": "rosa",
  "type": "katakana",
  "hint": "Cor em katakana.",
  "chars": [
    "ピ",
    "ン",
    "ク"
  ]
},
{
  "id": "k_n_sankan",
  "category": "katakana",
  "focus": "ン",
  "jp": "サイン",
  "romaji": "sain",
  "pt": "assinatura / sinal",
  "type": "katakana",
  "hint": "Documentos e atendimento.",
  "chars": [
    "サ",
    "イ",
    "ン"
  ]
},
{
  "id": "k_i_internetto",
  "category": "katakana",
  "focus": "イ",
  "jp": "インターネット",
  "romaji": "intaanetto",
  "pt": "internet",
  "type": "katakana",
  "hint": "Palavra essencial para celular, casa e serviços.",
  "chars": [
    "イ",
    "ン",
    "タ",
    "ー",
    "ネ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_i_irasuto",
  "category": "katakana",
  "focus": "イ",
  "jp": "イラスト",
  "romaji": "irasuto",
  "pt": "ilustração",
  "type": "katakana",
  "hint": "Muito comum em apps, materiais e design.",
  "chars": [
    "イ",
    "ラ",
    "ス",
    "ト"
  ]
},
{
  "id": "k_i_imeeji",
  "category": "katakana",
  "focus": "イ",
  "jp": "イメージ",
  "romaji": "imeeji",
  "pt": "imagem / ideia",
  "type": "katakana",
  "hint": "Útil em explicações e conversas.",
  "chars": [
    "イ",
    "メ",
    "ー",
    "ジ"
  ]
},
{
  "id": "k_i_iyahon",
  "category": "katakana",
  "focus": "イ",
  "jp": "イヤホン",
  "romaji": "iyahon",
  "pt": "fone de ouvido",
  "type": "katakana",
  "hint": "Produto comum no Japão.",
  "chars": [
    "イ",
    "ヤ",
    "ホ",
    "ン"
  ]
},
{
  "id": "k_i_ibento",
  "category": "katakana",
  "focus": "イ",
  "jp": "イベント",
  "romaji": "ibento",
  "pt": "evento",
  "type": "katakana",
  "hint": "Lazer, trabalho e avisos.",
  "chars": [
    "イ",
    "ベ",
    "ン",
    "ト"
  ]
},
{
  "id": "k_i_igirisu",
  "category": "katakana",
  "focus": "イ",
  "jp": "イギリス",
  "romaji": "igirisu",
  "pt": "Reino Unido / Inglaterra",
  "type": "katakana",
  "hint": "País em katakana.",
  "chars": [
    "イ",
    "ギ",
    "リ",
    "ス"
  ]
},
{
  "id": "k_i_insutooru",
  "category": "katakana",
  "focus": "イ",
  "jp": "インストール",
  "romaji": "insutooru",
  "pt": "instalar",
  "type": "katakana",
  "hint": "Celular, computador e apps.",
  "chars": [
    "イ",
    "ン",
    "ス",
    "ト",
    "ー",
    "ル"
  ]
},
{
  "id": "k_u_uindou",
  "category": "katakana",
  "focus": "ウ",
  "jp": "ウィンドウ",
  "romaji": "uindou",
  "pt": "janela / window",
  "type": "katakana",
  "hint": "Computador, app e casa.",
  "chars": [
    "ウ",
    "ィ",
    "ン",
    "ド",
    "ウ"
  ]
},
{
  "id": "k_u_uinku",
  "category": "katakana",
  "focus": "ウ",
  "jp": "ウインク",
  "romaji": "uinku",
  "pt": "piscada / wink",
  "type": "katakana",
  "hint": "Mídia e conversa.",
  "chars": [
    "ウ",
    "イ",
    "ン",
    "ク"
  ]
},
{
  "id": "k_u_ueton",
  "category": "katakana",
  "focus": "ウ",
  "jp": "ウエット",
  "romaji": "uetto",
  "pt": "úmido / wet",
  "type": "katakana",
  "hint": "Produtos, limpeza e clima.",
  "chars": [
    "ウ",
    "エ",
    "ッ",
    "ト"
  ]
},
{
  "id": "k_u_uoorukuman",
  "category": "katakana",
  "focus": "ウ",
  "jp": "ウォークマン",
  "romaji": "uookuman",
  "pt": "Walkman",
  "type": "katakana",
  "hint": "Produto e referência cultural.",
  "chars": [
    "ウ",
    "ォ",
    "ー",
    "ク",
    "マ",
    "ン"
  ]
},
{
  "id": "k_u_uubaa",
  "category": "katakana",
  "focus": "ウ",
  "jp": "ウーバー",
  "romaji": "uubaa",
  "pt": "Uber",
  "type": "katakana",
  "hint": "Serviços e entrega.",
  "chars": [
    "ウ",
    "ー",
    "バ",
    "ー"
  ]
},
{
  "id": "k_u_uroncha",
  "category": "katakana",
  "focus": "ウ",
  "jp": "ウーロン茶",
  "romaji": "uuroncha",
  "pt": "chá oolong",
  "type": "katakana",
  "hint": "Bebida comum em lojas e restaurantes.",
  "chars": [
    "ウ",
    "ー",
    "ロ",
    "ン",
    "茶"
  ]
},
{
  "id": "k_u_uirusu",
  "category": "katakana",
  "focus": "ウ",
  "jp": "ウイルス",
  "romaji": "uirusu",
  "pt": "vírus",
  "type": "katakana",
  "hint": "Saúde, computador e notícias.",
  "chars": [
    "ウ",
    "イ",
    "ル",
    "ス"
  ]
},
{
  "id": "k_e_eakon",
  "category": "katakana",
  "focus": "エ",
  "jp": "エアコン",
  "romaji": "eakon",
  "pt": "ar-condicionado",
  "type": "katakana",
  "hint": "Essencial em casa e trabalho no Japão.",
  "chars": [
    "エ",
    "ア",
    "コ",
    "ン"
  ]
},
{
  "id": "k_e_erebeetaa",
  "category": "katakana",
  "focus": "エ",
  "jp": "エレベーター",
  "romaji": "erebeetaa",
  "pt": "elevador",
  "type": "katakana",
  "hint": "Prédio, loja e estação.",
  "chars": [
    "エ",
    "レ",
    "ベ",
    "ー",
    "タ",
    "ー"
  ]
},
{
  "id": "k_e_enjin",
  "category": "katakana",
  "focus": "エ",
  "jp": "エンジン",
  "romaji": "enjin",
  "pt": "motor",
  "type": "katakana",
  "hint": "Carro, fábrica e máquina.",
  "chars": [
    "エ",
    "ン",
    "ジ",
    "ン"
  ]
},
{
  "id": "k_e_erekitto",
  "category": "katakana",
  "focus": "エ",
  "jp": "エラー",
  "romaji": "eraa",
  "pt": "erro",
  "type": "katakana",
  "hint": "Celular, app e trabalho.",
  "chars": [
    "エ",
    "ラ",
    "ー"
  ]
},
{
  "id": "k_e_enerugii",
  "category": "katakana",
  "focus": "エ",
  "jp": "エネルギー",
  "romaji": "enerugii",
  "pt": "energia",
  "type": "katakana",
  "hint": "Saúde, comida e trabalho.",
  "chars": [
    "エ",
    "ネ",
    "ル",
    "ギ",
    "ー"
  ]
},
{
  "id": "k_e_ekusupuresu",
  "category": "katakana",
  "focus": "エ",
  "jp": "エクスプレス",
  "romaji": "ekusupuresu",
  "pt": "expresso / express",
  "type": "katakana",
  "hint": "Transporte e serviços.",
  "chars": [
    "エ",
    "ク",
    "ス",
    "プ",
    "レ",
    "ス"
  ]
},
{
  "id": "k_e_esuenuesu",
  "category": "katakana",
  "focus": "エ",
  "jp": "エスカレーター",
  "romaji": "esukareetaa",
  "pt": "escada rolante",
  "type": "katakana",
  "hint": "Lojas e estações.",
  "chars": [
    "エ",
    "ス",
    "カ",
    "レ",
    "ー",
    "タ",
    "ー"
  ]
},
{
  "id": "k_o_orenji",
  "category": "katakana",
  "focus": "オ",
  "jp": "オレンジ",
  "romaji": "orenji",
  "pt": "laranja",
  "type": "katakana",
  "hint": "Cor e fruta.",
  "chars": [
    "オ",
    "レ",
    "ン",
    "ジ"
  ]
},
{
  "id": "k_o_oobun",
  "category": "katakana",
  "focus": "オ",
  "jp": "オーブン",
  "romaji": "oobun",
  "pt": "forno",
  "type": "katakana",
  "hint": "Casa e comida.",
  "chars": [
    "オ",
    "ー",
    "ブ",
    "ン"
  ]
},
{
  "id": "k_o_ooto",
  "category": "katakana",
  "focus": "オ",
  "jp": "オート",
  "romaji": "ooto",
  "pt": "automático / auto",
  "type": "katakana",
  "hint": "Carro, máquina e configuração.",
  "chars": [
    "オ",
    "ー",
    "ト"
  ]
},
{
  "id": "k_o_ofisu",
  "category": "katakana",
  "focus": "オ",
  "jp": "オフィス",
  "romaji": "ofisu",
  "pt": "escritório",
  "type": "katakana",
  "hint": "Trabalho e empresa.",
  "chars": [
    "オ",
    "フ",
    "ィ",
    "ス"
  ]
},
{
  "id": "k_o_onrain",
  "category": "katakana",
  "focus": "オ",
  "jp": "オンライン",
  "romaji": "onrain",
  "pt": "online",
  "type": "katakana",
  "hint": "Celular, estudo e serviços.",
  "chars": [
    "オ",
    "ン",
    "ラ",
    "イ",
    "ン"
  ]
},
{
  "id": "k_o_ootobai",
  "category": "katakana",
  "focus": "オ",
  "jp": "オートバイ",
  "romaji": "ootobai",
  "pt": "moto",
  "type": "katakana",
  "hint": "Transporte.",
  "chars": [
    "オ",
    "ー",
    "ト",
    "バ",
    "イ"
  ]
},
{
  "id": "k_o_oopun",
  "category": "katakana",
  "focus": "オ",
  "jp": "オープン",
  "romaji": "oopun",
  "pt": "aberto / inauguração",
  "type": "katakana",
  "hint": "Lojas, horários e apps.",
  "chars": [
    "オ",
    "ー",
    "プ",
    "ン"
  ]
},
{
  "id": "k_ko_kosu",
  "category": "katakana",
  "focus": "コ",
  "jp": "コスト",
  "romaji": "kosuto",
  "pt": "custo",
  "type": "katakana",
  "hint": "Muito útil para comparar preços e planos.",
  "chars": [
    "コ",
    "ス",
    "ト"
  ]
},
{
  "id": "k_ko_koro",
  "category": "katakana",
  "focus": "コ",
  "jp": "コロッケ",
  "romaji": "korokke",
  "pt": "croquete",
  "type": "katakana",
  "hint": "Comida comum em mercado e konbini.",
  "chars": [
    "コ",
    "ロ",
    "ッ",
    "ケ"
  ]
},
{
  "id": "k_ko_koppu",
  "category": "katakana",
  "focus": "コ",
  "jp": "コップ",
  "romaji": "koppu",
  "pt": "copo",
  "type": "katakana",
  "hint": "Casa, restaurante e trabalho.",
  "chars": [
    "コ",
    "ッ",
    "プ"
  ]
},
{
  "id": "k_su_sutaffu",
  "category": "katakana",
  "focus": "ス",
  "jp": "スタッフ",
  "romaji": "sutaffu",
  "pt": "funcionário / staff",
  "type": "katakana",
  "hint": "Muito comum em lojas e trabalho.",
  "chars": [
    "ス",
    "タ",
    "ッ",
    "フ"
  ]
},
{
  "id": "k_su_sutando",
  "category": "katakana",
  "focus": "ス",
  "jp": "スタンド",
  "romaji": "sutando",
  "pt": "suporte / posto",
  "type": "katakana",
  "hint": "Produtos, carro e lojas.",
  "chars": [
    "ス",
    "タ",
    "ン",
    "ド"
  ]
},
{
  "id": "k_su_sutoroo",
  "category": "katakana",
  "focus": "ス",
  "jp": "ストロー",
  "romaji": "sutoroo",
  "pt": "canudo",
  "type": "katakana",
  "hint": "Konbini e restaurantes.",
  "chars": [
    "ス",
    "ト",
    "ロ",
    "ー"
  ]
},
{
  "id": "k_to_toosuto",
  "category": "katakana",
  "focus": "ト",
  "jp": "トースト",
  "romaji": "toosuto",
  "pt": "torrada",
  "type": "katakana",
  "hint": "Comida e café da manhã.",
  "chars": [
    "ト",
    "ー",
    "ス",
    "ト"
  ]
},
{
  "id": "k_to_tore",
  "category": "katakana",
  "focus": "ト",
  "jp": "トレー",
  "romaji": "toree",
  "pt": "bandeja",
  "type": "katakana",
  "hint": "Restaurante, trabalho e produtos.",
  "chars": [
    "ト",
    "レ",
    "ー"
  ]
},
{
  "id": "k_to_torendo",
  "category": "katakana",
  "focus": "ト",
  "jp": "トレンド",
  "romaji": "torendo",
  "pt": "tendência",
  "type": "katakana",
  "hint": "Mídia, moda e internet.",
  "chars": [
    "ト",
    "レ",
    "ン",
    "ド"
  ]
},
{
  "id": "h_wo_kagiwo",
  "category": "hiragana",
  "focus": "を",
  "jp": "かぎを",
  "romaji": "kagi o",
  "pt": "chave + partícula を",
  "type": "hiragana",
  "hint": "Mini estrutura útil: pegar/usar a chave.",
  "chars": [
    "か",
    "ぎ",
    "を"
  ]
},
{
  "id": "h_wo_kusuriwo",
  "category": "hiragana",
  "focus": "を",
  "jp": "くすりを",
  "romaji": "kusuri o",
  "pt": "remédio + partícula を",
  "type": "hiragana",
  "hint": "Mini estrutura útil para farmácia e saúde.",
  "chars": [
    "く",
    "す",
    "り",
    "を"
  ]
},
{
  "id": "h_wo_denwawo",
  "category": "hiragana",
  "focus": "を",
  "jp": "でんわを",
  "romaji": "denwa o",
  "pt": "telefone + partícula を",
  "type": "hiragana",
  "hint": "Mini estrutura útil para ações com telefone.",
  "chars": [
    "で",
    "ん",
    "わ",
    "を"
  ]
},
{
  "id": "k_wo_wokaku",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲカク",
  "romaji": "wo kaku",
  "pt": "escrever ヲ",
  "type": "katakana",
  "hint": "Treino didático do kana raro ヲ.",
  "chars": [
    "ヲ",
    "カ",
    "ク"
  ]
},
{
  "id": "k_wo_woyomu",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲヨム",
  "romaji": "wo yomu",
  "pt": "ler ヲ",
  "type": "katakana",
  "hint": "Treino didático do kana raro ヲ.",
  "chars": [
    "ヲ",
    "ヨ",
    "ム"
  ]
},
{
  "id": "k_wo_womiru",
  "category": "katakana",
  "focus": "ヲ",
  "jp": "ヲミル",
  "romaji": "wo miru",
  "pt": "ver ヲ",
  "type": "katakana",
  "hint": "Treino didático do kana raro ヲ.",
  "chars": [
    "ヲ",
    "ミ",
    "ル"
  ]
},
{
  "id": "j_n5_hi",
  "category": "kanji",
  "focus": "日",
  "jp": "日",
  "romaji": "hi / nichi",
  "pt": "dia / sol",
  "type": "kanji",
  "hint": "N5 · tempo e natureza. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "日"
  ],
  "jlpt": "N5",
  "group": "tempo e natureza",
  "onyomi": "ニチ, ジツ",
  "kunyomi": "ひ, か",
  "strokes": "4",
  "examples": [
    {
      "jp": "日本",
      "romaji": "nihon",
      "pt": "Japão"
    },
    {
      "jp": "日曜日",
      "romaji": "nichiyoubi",
      "pt": "domingo"
    },
    {
      "jp": "毎日",
      "romaji": "mainichi",
      "pt": "todos os dias"
    }
  ]
},
{
  "id": "j_n5_tsuki",
  "category": "kanji",
  "focus": "月",
  "jp": "月",
  "romaji": "tsuki / getsu",
  "pt": "lua / mês",
  "type": "kanji",
  "hint": "N5 · tempo e natureza. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "月"
  ],
  "jlpt": "N5",
  "group": "tempo e natureza",
  "onyomi": "ゲツ, ガツ",
  "kunyomi": "つき",
  "strokes": "4",
  "examples": [
    {
      "jp": "月曜日",
      "romaji": "getsuyoubi",
      "pt": "segunda-feira"
    },
    {
      "jp": "今月",
      "romaji": "kongetsu",
      "pt": "este mês"
    },
    {
      "jp": "一月",
      "romaji": "ichigatsu",
      "pt": "janeiro"
    }
  ]
},
{
  "id": "j_n5_hi_fire",
  "category": "kanji",
  "focus": "火",
  "jp": "火",
  "romaji": "hi / ka",
  "pt": "fogo",
  "type": "kanji",
  "hint": "N5 · tempo e natureza. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "火"
  ],
  "jlpt": "N5",
  "group": "tempo e natureza",
  "onyomi": "カ",
  "kunyomi": "ひ",
  "strokes": "4",
  "examples": [
    {
      "jp": "火曜日",
      "romaji": "kayoubi",
      "pt": "terça-feira"
    },
    {
      "jp": "火事",
      "romaji": "kaji",
      "pt": "incêndio"
    },
    {
      "jp": "火",
      "romaji": "hi",
      "pt": "fogo"
    }
  ]
},
{
  "id": "j_n5_mizu",
  "category": "kanji",
  "focus": "水",
  "jp": "水",
  "romaji": "mizu / sui",
  "pt": "água",
  "type": "kanji",
  "hint": "N5 · tempo e natureza. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "水"
  ],
  "jlpt": "N5",
  "group": "tempo e natureza",
  "onyomi": "スイ",
  "kunyomi": "みず",
  "strokes": "4",
  "examples": [
    {
      "jp": "水曜日",
      "romaji": "suiyoubi",
      "pt": "quarta-feira"
    },
    {
      "jp": "水",
      "romaji": "mizu",
      "pt": "água"
    },
    {
      "jp": "水道",
      "romaji": "suidou",
      "pt": "água encanada"
    }
  ]
},
{
  "id": "j_n5_ki_tree",
  "category": "kanji",
  "focus": "木",
  "jp": "木",
  "romaji": "ki / moku",
  "pt": "árvore / madeira",
  "type": "kanji",
  "hint": "N5 · tempo e natureza. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "木"
  ],
  "jlpt": "N5",
  "group": "tempo e natureza",
  "onyomi": "モク, ボク",
  "kunyomi": "き",
  "strokes": "4",
  "examples": [
    {
      "jp": "木曜日",
      "romaji": "mokuyoubi",
      "pt": "quinta-feira"
    },
    {
      "jp": "木",
      "romaji": "ki",
      "pt": "árvore"
    },
    {
      "jp": "木材",
      "romaji": "mokuzai",
      "pt": "madeira"
    }
  ]
},
{
  "id": "j_n5_kane",
  "category": "kanji",
  "focus": "金",
  "jp": "金",
  "romaji": "kane / kin",
  "pt": "ouro / dinheiro",
  "type": "kanji",
  "hint": "N5 · tempo e natureza. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "金"
  ],
  "jlpt": "N5",
  "group": "tempo e natureza",
  "onyomi": "キン, コン",
  "kunyomi": "かね",
  "strokes": "8",
  "examples": [
    {
      "jp": "金曜日",
      "romaji": "kinyoubi",
      "pt": "sexta-feira"
    },
    {
      "jp": "お金",
      "romaji": "okane",
      "pt": "dinheiro"
    },
    {
      "jp": "料金",
      "romaji": "ryoukin",
      "pt": "tarifa"
    }
  ]
},
{
  "id": "j_n5_tsuchi",
  "category": "kanji",
  "focus": "土",
  "jp": "土",
  "romaji": "tsuchi / do",
  "pt": "terra / solo",
  "type": "kanji",
  "hint": "N5 · tempo e natureza. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "土"
  ],
  "jlpt": "N5",
  "group": "tempo e natureza",
  "onyomi": "ド, ト",
  "kunyomi": "つち",
  "strokes": "3",
  "examples": [
    {
      "jp": "土曜日",
      "romaji": "doyoubi",
      "pt": "sábado"
    },
    {
      "jp": "土地",
      "romaji": "tochi",
      "pt": "terreno"
    },
    {
      "jp": "土",
      "romaji": "tsuchi",
      "pt": "terra"
    }
  ]
},
{
  "id": "j_n5_ichi",
  "category": "kanji",
  "focus": "一",
  "jp": "一",
  "romaji": "ichi",
  "pt": "um",
  "type": "kanji",
  "hint": "N5 · números e dinheiro. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "一"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "onyomi": "イチ, イツ",
  "kunyomi": "ひと",
  "strokes": "1",
  "examples": [
    {
      "jp": "一人",
      "romaji": "hitori",
      "pt": "uma pessoa"
    },
    {
      "jp": "一月",
      "romaji": "ichigatsu",
      "pt": "janeiro"
    },
    {
      "jp": "一日",
      "romaji": "tsuitachi / ichinichi",
      "pt": "dia 1 / um dia"
    }
  ]
},
{
  "id": "j_n5_ni",
  "category": "kanji",
  "focus": "二",
  "jp": "二",
  "romaji": "ni",
  "pt": "dois",
  "type": "kanji",
  "hint": "N5 · números e dinheiro. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "二"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "onyomi": "ニ",
  "kunyomi": "ふた",
  "strokes": "2",
  "examples": [
    {
      "jp": "二人",
      "romaji": "futari",
      "pt": "duas pessoas"
    },
    {
      "jp": "二月",
      "romaji": "nigatsu",
      "pt": "fevereiro"
    },
    {
      "jp": "二日",
      "romaji": "futsuka",
      "pt": "dia 2"
    }
  ]
},
{
  "id": "j_n5_san",
  "category": "kanji",
  "focus": "三",
  "jp": "三",
  "romaji": "san",
  "pt": "três",
  "type": "kanji",
  "hint": "N5 · números e dinheiro. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "三"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "onyomi": "サン",
  "kunyomi": "み",
  "strokes": "3",
  "examples": [
    {
      "jp": "三月",
      "romaji": "sangatsu",
      "pt": "março"
    },
    {
      "jp": "三日",
      "romaji": "mikka",
      "pt": "dia 3"
    },
    {
      "jp": "三人",
      "romaji": "sannin",
      "pt": "três pessoas"
    }
  ]
},
{
  "id": "j_n5_yon",
  "category": "kanji",
  "focus": "四",
  "jp": "四",
  "romaji": "yon / shi",
  "pt": "quatro",
  "type": "kanji",
  "hint": "N5 · números e dinheiro. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "四"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "onyomi": "シ",
  "kunyomi": "よん, よ",
  "strokes": "5",
  "examples": [
    {
      "jp": "四月",
      "romaji": "shigatsu",
      "pt": "abril"
    },
    {
      "jp": "四日",
      "romaji": "yokka",
      "pt": "dia 4"
    },
    {
      "jp": "四人",
      "romaji": "yonin",
      "pt": "quatro pessoas"
    }
  ]
},
{
  "id": "j_n5_go",
  "category": "kanji",
  "focus": "五",
  "jp": "五",
  "romaji": "go",
  "pt": "cinco",
  "type": "kanji",
  "hint": "N5 · números e dinheiro. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "五"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "onyomi": "ゴ",
  "kunyomi": "いつ",
  "strokes": "4",
  "examples": [
    {
      "jp": "五月",
      "romaji": "gogatsu",
      "pt": "maio"
    },
    {
      "jp": "五日",
      "romaji": "itsuka",
      "pt": "dia 5"
    },
    {
      "jp": "五人",
      "romaji": "gonin",
      "pt": "cinco pessoas"
    }
  ]
},
{
  "id": "j_n5_en",
  "category": "kanji",
  "focus": "円",
  "jp": "円",
  "romaji": "en",
  "pt": "iene / círculo",
  "type": "kanji",
  "hint": "N5 · números e dinheiro. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "円"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "onyomi": "エン",
  "kunyomi": "まる",
  "strokes": "4",
  "examples": [
    {
      "jp": "百円",
      "romaji": "hyakuen",
      "pt": "100 ienes"
    },
    {
      "jp": "円高",
      "romaji": "endaka",
      "pt": "iene forte"
    },
    {
      "jp": "円",
      "romaji": "en",
      "pt": "iene"
    }
  ]
},
{
  "id": "j_n5_hito",
  "category": "kanji",
  "focus": "人",
  "jp": "人",
  "romaji": "hito / jin",
  "pt": "pessoa",
  "type": "kanji",
  "hint": "N5 · pessoas e corpo. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "人"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "onyomi": "ジン, ニン",
  "kunyomi": "ひと",
  "strokes": "2",
  "examples": [
    {
      "jp": "日本人",
      "romaji": "nihonjin",
      "pt": "japonês / pessoa japonesa"
    },
    {
      "jp": "一人",
      "romaji": "hitori",
      "pt": "uma pessoa"
    },
    {
      "jp": "人",
      "romaji": "hito",
      "pt": "pessoa"
    }
  ]
},
{
  "id": "j_n5_kuchi",
  "category": "kanji",
  "focus": "口",
  "jp": "口",
  "romaji": "kuchi / kou",
  "pt": "boca / entrada",
  "type": "kanji",
  "hint": "N5 · pessoas e corpo. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "口"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "onyomi": "コウ, ク",
  "kunyomi": "くち",
  "strokes": "3",
  "examples": [
    {
      "jp": "入口",
      "romaji": "iriguchi",
      "pt": "entrada"
    },
    {
      "jp": "出口",
      "romaji": "deguchi",
      "pt": "saída"
    },
    {
      "jp": "口",
      "romaji": "kuchi",
      "pt": "boca"
    }
  ]
},
{
  "id": "j_n5_me",
  "category": "kanji",
  "focus": "目",
  "jp": "目",
  "romaji": "me / moku",
  "pt": "olho",
  "type": "kanji",
  "hint": "N5 · pessoas e corpo. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "目"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "onyomi": "モク",
  "kunyomi": "め",
  "strokes": "5",
  "examples": [
    {
      "jp": "目",
      "romaji": "me",
      "pt": "olho"
    },
    {
      "jp": "目的",
      "romaji": "mokuteki",
      "pt": "objetivo"
    },
    {
      "jp": "目薬",
      "romaji": "megusuri",
      "pt": "colírio"
    }
  ]
},
{
  "id": "j_n5_mimi",
  "category": "kanji",
  "focus": "耳",
  "jp": "耳",
  "romaji": "mimi / ji",
  "pt": "orelha",
  "type": "kanji",
  "hint": "N5 · pessoas e corpo. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "耳"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "onyomi": "ジ",
  "kunyomi": "みみ",
  "strokes": "6",
  "examples": [
    {
      "jp": "耳",
      "romaji": "mimi",
      "pt": "orelha"
    },
    {
      "jp": "耳鼻科",
      "romaji": "jibika",
      "pt": "otorrino"
    },
    {
      "jp": "耳が痛い",
      "romaji": "mimi ga itai",
      "pt": "a orelha dói"
    }
  ]
},
{
  "id": "j_n5_te",
  "category": "kanji",
  "focus": "手",
  "jp": "手",
  "romaji": "te / shu",
  "pt": "mão",
  "type": "kanji",
  "hint": "N5 · pessoas e corpo. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "手"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "onyomi": "シュ",
  "kunyomi": "て",
  "strokes": "4",
  "examples": [
    {
      "jp": "手",
      "romaji": "te",
      "pt": "mão"
    },
    {
      "jp": "上手",
      "romaji": "jouzu",
      "pt": "habilidoso"
    },
    {
      "jp": "手紙",
      "romaji": "tegami",
      "pt": "carta"
    }
  ]
},
{
  "id": "j_n5_ashi",
  "category": "kanji",
  "focus": "足",
  "jp": "足",
  "romaji": "ashi / soku",
  "pt": "pé / perna",
  "type": "kanji",
  "hint": "N5 · pessoas e corpo. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "足"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "onyomi": "ソク",
  "kunyomi": "あし, た",
  "strokes": "7",
  "examples": [
    {
      "jp": "足",
      "romaji": "ashi",
      "pt": "pé / perna"
    },
    {
      "jp": "不足",
      "romaji": "fusoku",
      "pt": "falta"
    },
    {
      "jp": "足りない",
      "romaji": "tarinai",
      "pt": "não é suficiente"
    }
  ]
},
{
  "id": "j_n5_eki",
  "category": "kanji",
  "focus": "駅",
  "jp": "駅",
  "romaji": "eki",
  "pt": "estação",
  "type": "kanji",
  "hint": "N5 · lugares e rotina. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "駅"
  ],
  "jlpt": "N5",
  "group": "lugares e rotina",
  "onyomi": "エキ",
  "kunyomi": "",
  "strokes": "14",
  "examples": [
    {
      "jp": "駅",
      "romaji": "eki",
      "pt": "estação"
    },
    {
      "jp": "駅前",
      "romaji": "ekimae",
      "pt": "em frente à estação"
    },
    {
      "jp": "駅員",
      "romaji": "ekiin",
      "pt": "funcionário da estação"
    }
  ]
},
{
  "id": "j_n5_kuruma",
  "category": "kanji",
  "focus": "車",
  "jp": "車",
  "romaji": "kuruma / sha",
  "pt": "carro",
  "type": "kanji",
  "hint": "N5 · lugares e rotina. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "車"
  ],
  "jlpt": "N5",
  "group": "lugares e rotina",
  "onyomi": "シャ",
  "kunyomi": "くるま",
  "strokes": "7",
  "examples": [
    {
      "jp": "車",
      "romaji": "kuruma",
      "pt": "carro"
    },
    {
      "jp": "電車",
      "romaji": "densha",
      "pt": "trem"
    },
    {
      "jp": "自転車",
      "romaji": "jitensha",
      "pt": "bicicleta"
    }
  ]
},
{
  "id": "j_n5_den",
  "category": "kanji",
  "focus": "電",
  "jp": "電",
  "romaji": "den",
  "pt": "eletricidade",
  "type": "kanji",
  "hint": "N5 · lugares e rotina. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "電"
  ],
  "jlpt": "N5",
  "group": "lugares e rotina",
  "onyomi": "デン",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "電車",
      "romaji": "densha",
      "pt": "trem"
    },
    {
      "jp": "電話",
      "romaji": "denwa",
      "pt": "telefone"
    },
    {
      "jp": "電気",
      "romaji": "denki",
      "pt": "eletricidade / luz"
    }
  ]
},
{
  "id": "j_n5_ten",
  "category": "kanji",
  "focus": "店",
  "jp": "店",
  "romaji": "mise / ten",
  "pt": "loja",
  "type": "kanji",
  "hint": "N5 · lugares e rotina. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "店"
  ],
  "jlpt": "N5",
  "group": "lugares e rotina",
  "onyomi": "テン",
  "kunyomi": "みせ",
  "strokes": "8",
  "examples": [
    {
      "jp": "店",
      "romaji": "mise",
      "pt": "loja"
    },
    {
      "jp": "店員",
      "romaji": "tenin",
      "pt": "atendente"
    },
    {
      "jp": "売店",
      "romaji": "baiten",
      "pt": "quiosque / lojinha"
    }
  ]
},
{
  "id": "j_n5_ie",
  "category": "kanji",
  "focus": "家",
  "jp": "家",
  "romaji": "ie / ka",
  "pt": "casa / família",
  "type": "kanji",
  "hint": "N5 · lugares e rotina. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "家"
  ],
  "jlpt": "N5",
  "group": "lugares e rotina",
  "onyomi": "カ, ケ",
  "kunyomi": "いえ, や",
  "strokes": "10",
  "examples": [
    {
      "jp": "家",
      "romaji": "ie",
      "pt": "casa"
    },
    {
      "jp": "家族",
      "romaji": "kazoku",
      "pt": "família"
    },
    {
      "jp": "家賃",
      "romaji": "yachin",
      "pt": "aluguel"
    }
  ]
},
{
  "id": "j_n5_mae",
  "category": "kanji",
  "focus": "前",
  "jp": "前",
  "romaji": "mae / zen",
  "pt": "frente / antes",
  "type": "kanji",
  "hint": "N5 · lugares e rotina. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "前"
  ],
  "jlpt": "N5",
  "group": "lugares e rotina",
  "onyomi": "ゼン",
  "kunyomi": "まえ",
  "strokes": "9",
  "examples": [
    {
      "jp": "駅前",
      "romaji": "ekimae",
      "pt": "em frente à estação"
    },
    {
      "jp": "名前",
      "romaji": "namae",
      "pt": "nome"
    },
    {
      "jp": "午前",
      "romaji": "gozen",
      "pt": "manhã / antes do meio-dia"
    }
  ]
},
{
  "id": "j_n5_ushiro",
  "category": "kanji",
  "focus": "後",
  "jp": "後",
  "romaji": "ato / go",
  "pt": "atrás / depois",
  "type": "kanji",
  "hint": "N5 · lugares e rotina. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "後"
  ],
  "jlpt": "N5",
  "group": "lugares e rotina",
  "onyomi": "ゴ, コウ",
  "kunyomi": "あと, うし",
  "strokes": "9",
  "examples": [
    {
      "jp": "午後",
      "romaji": "gogo",
      "pt": "tarde / depois do meio-dia"
    },
    {
      "jp": "後ろ",
      "romaji": "ushiro",
      "pt": "atrás"
    },
    {
      "jp": "最後",
      "romaji": "saigo",
      "pt": "final"
    }
  ]
},
{
  "id": "j_n5_taberu",
  "category": "kanji",
  "focus": "食",
  "jp": "食",
  "romaji": "taberu / shoku",
  "pt": "comer",
  "type": "kanji",
  "hint": "N5 · vida diária. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "食"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "onyomi": "ショク",
  "kunyomi": "た",
  "strokes": "9",
  "examples": [
    {
      "jp": "食べる",
      "romaji": "taberu",
      "pt": "comer"
    },
    {
      "jp": "食堂",
      "romaji": "shokudou",
      "pt": "refeitório"
    },
    {
      "jp": "食事",
      "romaji": "shokuji",
      "pt": "refeição"
    }
  ]
},
{
  "id": "j_n5_nomU",
  "category": "kanji",
  "focus": "飲",
  "jp": "飲",
  "romaji": "nomu / in",
  "pt": "beber",
  "type": "kanji",
  "hint": "N5 · vida diária. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "飲"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "onyomi": "イン",
  "kunyomi": "の",
  "strokes": "12",
  "examples": [
    {
      "jp": "飲む",
      "romaji": "nomu",
      "pt": "beber"
    },
    {
      "jp": "飲み物",
      "romaji": "nomimono",
      "pt": "bebida"
    },
    {
      "jp": "飲食店",
      "romaji": "inshokuten",
      "pt": "restaurante / comércio de comida"
    }
  ]
},
{
  "id": "j_n5_kau",
  "category": "kanji",
  "focus": "買",
  "jp": "買",
  "romaji": "kau / bai",
  "pt": "comprar",
  "type": "kanji",
  "hint": "N5 · vida diária. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "買"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "onyomi": "バイ",
  "kunyomi": "か",
  "strokes": "12",
  "examples": [
    {
      "jp": "買う",
      "romaji": "kau",
      "pt": "comprar"
    },
    {
      "jp": "買い物",
      "romaji": "kaimono",
      "pt": "compras"
    },
    {
      "jp": "売買",
      "romaji": "baibai",
      "pt": "compra e venda"
    }
  ]
},
{
  "id": "j_n5_iku",
  "category": "kanji",
  "focus": "行",
  "jp": "行",
  "romaji": "iku / kou",
  "pt": "ir",
  "type": "kanji",
  "hint": "N5 · vida diária. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "行"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "onyomi": "コウ, ギョウ",
  "kunyomi": "い, おこな",
  "strokes": "6",
  "examples": [
    {
      "jp": "行く",
      "romaji": "iku",
      "pt": "ir"
    },
    {
      "jp": "銀行",
      "romaji": "ginkou",
      "pt": "banco"
    },
    {
      "jp": "旅行",
      "romaji": "ryokou",
      "pt": "viagem"
    }
  ]
},
{
  "id": "j_n5_miru",
  "category": "kanji",
  "focus": "見",
  "jp": "見",
  "romaji": "miru / ken",
  "pt": "ver",
  "type": "kanji",
  "hint": "N5 · vida diária. Toque em detalhes para ver exemplos úteis.",
  "chars": [
    "見"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "onyomi": "ケン",
  "kunyomi": "み",
  "strokes": "7",
  "examples": [
    {
      "jp": "見る",
      "romaji": "miru",
      "pt": "ver"
    },
    {
      "jp": "見せる",
      "romaji": "miseru",
      "pt": "mostrar"
    },
    {
      "jp": "意見",
      "romaji": "iken",
      "pt": "opinião"
    }
  ]
},
{
  "id": "j_n5_roku",
  "category": "kanji",
  "focus": "六",
  "jp": "六",
  "romaji": "roku",
  "pt": "seis",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. Pense em seis linhas de contagem mental.",
  "chars": [
    "六"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "Pense em seis linhas de contagem mental.",
  "onyomi": "ロク",
  "kunyomi": "む, むい",
  "strokes": "4",
  "examples": [
    {
      "jp": "六月",
      "romaji": "rokugatsu",
      "pt": "junho"
    },
    {
      "jp": "六日",
      "romaji": "muika",
      "pt": "dia 6"
    },
    {
      "jp": "六人",
      "romaji": "rokunin",
      "pt": "seis pessoas"
    }
  ]
},
{
  "id": "j_n5_nana",
  "category": "kanji",
  "focus": "七",
  "jp": "七",
  "romaji": "nana / shichi",
  "pt": "sete",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. Sete parece um corte rápido: curto e fácil de reconhecer.",
  "chars": [
    "七"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "Sete parece um corte rápido: curto e fácil de reconhecer.",
  "onyomi": "シチ",
  "kunyomi": "なな, なの",
  "strokes": "2",
  "examples": [
    {
      "jp": "七月",
      "romaji": "shichigatsu",
      "pt": "julho"
    },
    {
      "jp": "七日",
      "romaji": "nanoka",
      "pt": "dia 7"
    },
    {
      "jp": "七人",
      "romaji": "nananin",
      "pt": "sete pessoas"
    }
  ]
},
{
  "id": "j_n5_hachi",
  "category": "kanji",
  "focus": "八",
  "jp": "八",
  "romaji": "hachi",
  "pt": "oito",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. Oito abre como duas pernas, simples e visual.",
  "chars": [
    "八"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "Oito abre como duas pernas, simples e visual.",
  "onyomi": "ハチ",
  "kunyomi": "や, よう",
  "strokes": "2",
  "examples": [
    {
      "jp": "八月",
      "romaji": "hachigatsu",
      "pt": "agosto"
    },
    {
      "jp": "八日",
      "romaji": "youka",
      "pt": "dia 8"
    },
    {
      "jp": "八人",
      "romaji": "hachinin",
      "pt": "oito pessoas"
    }
  ]
},
{
  "id": "j_n5_kyuu",
  "category": "kanji",
  "focus": "九",
  "jp": "九",
  "romaji": "kyuu / ku",
  "pt": "nove",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. Nove tem uma curva que parece guardar algo dentro.",
  "chars": [
    "九"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "Nove tem uma curva que parece guardar algo dentro.",
  "onyomi": "キュウ, ク",
  "kunyomi": "ここの",
  "strokes": "2",
  "examples": [
    {
      "jp": "九月",
      "romaji": "kugatsu",
      "pt": "setembro"
    },
    {
      "jp": "九日",
      "romaji": "kokonoka",
      "pt": "dia 9"
    },
    {
      "jp": "九人",
      "romaji": "kyuunin",
      "pt": "nove pessoas"
    }
  ]
},
{
  "id": "j_n5_juu",
  "category": "kanji",
  "focus": "十",
  "jp": "十",
  "romaji": "juu",
  "pt": "dez",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. Dez é uma cruz de contagem: vertical e horizontal.",
  "chars": [
    "十"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "Dez é uma cruz de contagem: vertical e horizontal.",
  "onyomi": "ジュウ",
  "kunyomi": "とお",
  "strokes": "2",
  "examples": [
    {
      "jp": "十月",
      "romaji": "juugatsu",
      "pt": "outubro"
    },
    {
      "jp": "十日",
      "romaji": "tooka",
      "pt": "dia 10"
    },
    {
      "jp": "十分",
      "romaji": "juppun",
      "pt": "10 minutos"
    }
  ]
},
{
  "id": "j_n5_hyaku",
  "category": "kanji",
  "focus": "百",
  "jp": "百",
  "romaji": "hyaku",
  "pt": "cem",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. Cem parece uma unidade grande empilhada.",
  "chars": [
    "百"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "Cem parece uma unidade grande empilhada.",
  "onyomi": "ヒャク",
  "kunyomi": "",
  "strokes": "6",
  "examples": [
    {
      "jp": "百円",
      "romaji": "hyakuen",
      "pt": "100 ienes"
    },
    {
      "jp": "三百",
      "romaji": "sanbyaku",
      "pt": "300"
    },
    {
      "jp": "百貨店",
      "romaji": "hyakkaten",
      "pt": "loja de departamento"
    }
  ]
},
{
  "id": "j_n5_sen",
  "category": "kanji",
  "focus": "千",
  "jp": "千",
  "romaji": "sen",
  "pt": "mil",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. Mil tem um traço no topo como marcador de quantidade grande.",
  "chars": [
    "千"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "Mil tem um traço no topo como marcador de quantidade grande.",
  "onyomi": "セン",
  "kunyomi": "ち",
  "strokes": "3",
  "examples": [
    {
      "jp": "千円",
      "romaji": "senen",
      "pt": "1.000 ienes"
    },
    {
      "jp": "三千",
      "romaji": "sanzen",
      "pt": "3.000"
    },
    {
      "jp": "千葉",
      "romaji": "chiba",
      "pt": "Chiba"
    }
  ]
},
{
  "id": "j_n5_man",
  "category": "kanji",
  "focus": "万",
  "jp": "万",
  "romaji": "man",
  "pt": "dez mil",
  "type": "kanji",
  "hint": "N5 lógico · números e dinheiro. No Japão, dinheiro aparece muito em blocos de 万.",
  "chars": [
    "万"
  ],
  "jlpt": "N5",
  "group": "números e dinheiro",
  "memo": "No Japão, dinheiro aparece muito em blocos de 万.",
  "onyomi": "マン, バン",
  "kunyomi": "",
  "strokes": "3",
  "examples": [
    {
      "jp": "一万円",
      "romaji": "ichimanen",
      "pt": "10.000 ienes"
    },
    {
      "jp": "万一",
      "romaji": "manichi",
      "pt": "por acaso / se algo acontecer"
    },
    {
      "jp": "万円",
      "romaji": "manen",
      "pt": "dez mil ienes"
    }
  ]
},
{
  "id": "j_n5_toshi",
  "category": "kanji",
  "focus": "年",
  "jp": "年",
  "romaji": "toshi / nen",
  "pt": "ano",
  "type": "kanji",
  "hint": "N5 lógico · tempo e rotina. Ano é o calendário andando, usado em idade, datas e planos.",
  "chars": [
    "年"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Ano é o calendário andando, usado em idade, datas e planos.",
  "onyomi": "ネン",
  "kunyomi": "とし",
  "strokes": "6",
  "examples": [
    {
      "jp": "今年",
      "romaji": "kotoshi",
      "pt": "este ano"
    },
    {
      "jp": "来年",
      "romaji": "rainen",
      "pt": "ano que vem"
    },
    {
      "jp": "一年",
      "romaji": "ichinen",
      "pt": "um ano"
    }
  ]
},
{
  "id": "j_n5_toki",
  "category": "kanji",
  "focus": "時",
  "jp": "時",
  "romaji": "toki / ji",
  "pt": "hora / tempo",
  "type": "kanji",
  "hint": "N5 lógico · tempo e rotina. Tempo com sol 日 dentro: a rotina passa pelo relógio.",
  "chars": [
    "時"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Tempo com sol 日 dentro: a rotina passa pelo relógio.",
  "onyomi": "ジ",
  "kunyomi": "とき",
  "strokes": "10",
  "examples": [
    {
      "jp": "時間",
      "romaji": "jikan",
      "pt": "tempo / hora"
    },
    {
      "jp": "何時",
      "romaji": "nanji",
      "pt": "que horas"
    },
    {
      "jp": "一時",
      "romaji": "ichiji",
      "pt": "uma hora"
    }
  ]
},
{
  "id": "j_n5_fun",
  "category": "kanji",
  "focus": "分",
  "jp": "分",
  "romaji": "fun / bun",
  "pt": "minuto / parte",
  "type": "kanji",
  "hint": "N5 lógico · tempo e rotina. Dividir algo em partes: minutos também são partes do tempo.",
  "chars": [
    "分"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Dividir algo em partes: minutos também são partes do tempo.",
  "onyomi": "ブン, フン",
  "kunyomi": "わ",
  "strokes": "4",
  "examples": [
    {
      "jp": "五分",
      "romaji": "gofun",
      "pt": "5 minutos"
    },
    {
      "jp": "自分",
      "romaji": "jibun",
      "pt": "eu mesmo"
    },
    {
      "jp": "十分",
      "romaji": "juppun",
      "pt": "10 minutos"
    }
  ]
},
{
  "id": "j_n5_gozen",
  "category": "kanji",
  "focus": "午",
  "jp": "午",
  "romaji": "go",
  "pt": "meio-dia",
  "type": "kanji",
  "hint": "N5 lógico · tempo e rotina. Use em 午前 e 午後 para entender horários.",
  "chars": [
    "午"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Use em 午前 e 午後 para entender horários.",
  "onyomi": "ゴ",
  "kunyomi": "",
  "strokes": "4",
  "examples": [
    {
      "jp": "午前",
      "romaji": "gozen",
      "pt": "manhã"
    },
    {
      "jp": "午後",
      "romaji": "gogo",
      "pt": "tarde"
    },
    {
      "jp": "正午",
      "romaji": "shougo",
      "pt": "meio-dia"
    }
  ]
},
{
  "id": "j_n5_ima",
  "category": "kanji",
  "focus": "今",
  "jp": "今",
  "romaji": "ima / kon",
  "pt": "agora",
  "type": "kanji",
  "hint": "N5 lógico · tempo e rotina. Agora é o momento que cai na sua mão.",
  "chars": [
    "今"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Agora é o momento que cai na sua mão.",
  "onyomi": "コン, キン",
  "kunyomi": "いま",
  "strokes": "4",
  "examples": [
    {
      "jp": "今",
      "romaji": "ima",
      "pt": "agora"
    },
    {
      "jp": "今日",
      "romaji": "kyou",
      "pt": "hoje"
    },
    {
      "jp": "今月",
      "romaji": "kongetsu",
      "pt": "este mês"
    }
  ]
},
{
  "id": "j_n5_han",
  "category": "kanji",
  "focus": "半",
  "jp": "半",
  "romaji": "han",
  "pt": "metade",
  "type": "kanji",
  "hint": "N5 lógico · tempo e rotina. Metade aparece muito em horário: 7:30 = 7時半.",
  "chars": [
    "半"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Metade aparece muito em horário: 7:30 = 7時半.",
  "onyomi": "ハン",
  "kunyomi": "なか",
  "strokes": "5",
  "examples": [
    {
      "jp": "半分",
      "romaji": "hanbun",
      "pt": "metade"
    },
    {
      "jp": "七時半",
      "romaji": "shichiji han",
      "pt": "sete e meia"
    },
    {
      "jp": "半年",
      "romaji": "hantoshi",
      "pt": "meio ano"
    }
  ]
},
{
  "id": "j_n5_ue",
  "category": "kanji",
  "focus": "上",
  "jp": "上",
  "romaji": "ue / jou",
  "pt": "em cima",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. Algo subindo: use para posição e melhora.",
  "chars": [
    "上"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "Algo subindo: use para posição e melhora.",
  "onyomi": "ジョウ",
  "kunyomi": "うえ, あ",
  "strokes": "3",
  "examples": [
    {
      "jp": "上",
      "romaji": "ue",
      "pt": "em cima"
    },
    {
      "jp": "上手",
      "romaji": "jouzu",
      "pt": "habilidoso"
    },
    {
      "jp": "上げる",
      "romaji": "ageru",
      "pt": "levantar"
    }
  ]
},
{
  "id": "j_n5_shita",
  "category": "kanji",
  "focus": "下",
  "jp": "下",
  "romaji": "shita / ka",
  "pt": "embaixo",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. Algo descendo: posição, queda ou baixar.",
  "chars": [
    "下"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "Algo descendo: posição, queda ou baixar.",
  "onyomi": "カ, ゲ",
  "kunyomi": "した, さ, くだ",
  "strokes": "3",
  "examples": [
    {
      "jp": "下",
      "romaji": "shita",
      "pt": "embaixo"
    },
    {
      "jp": "地下",
      "romaji": "chika",
      "pt": "subsolo"
    },
    {
      "jp": "下さい",
      "romaji": "kudasai",
      "pt": "por favor"
    }
  ]
},
{
  "id": "j_n5_naka",
  "category": "kanji",
  "focus": "中",
  "jp": "中",
  "romaji": "naka / chuu",
  "pt": "dentro / meio",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. Uma linha atravessando o centro: dentro, meio, durante.",
  "chars": [
    "中"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "Uma linha atravessando o centro: dentro, meio, durante.",
  "onyomi": "チュウ",
  "kunyomi": "なか",
  "strokes": "4",
  "examples": [
    {
      "jp": "中",
      "romaji": "naka",
      "pt": "dentro"
    },
    {
      "jp": "中国",
      "romaji": "chuugoku",
      "pt": "China"
    },
    {
      "jp": "一日中",
      "romaji": "ichinichijuu",
      "pt": "o dia inteiro"
    }
  ]
},
{
  "id": "j_n5_soto",
  "category": "kanji",
  "focus": "外",
  "jp": "外",
  "romaji": "soto / gai",
  "pt": "fora",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. O lado de fora da casa, da regra ou do grupo.",
  "chars": [
    "外"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "O lado de fora da casa, da regra ou do grupo.",
  "onyomi": "ガイ, ゲ",
  "kunyomi": "そと, はず",
  "strokes": "5",
  "examples": [
    {
      "jp": "外",
      "romaji": "soto",
      "pt": "fora"
    },
    {
      "jp": "外国",
      "romaji": "gaikoku",
      "pt": "país estrangeiro"
    },
    {
      "jp": "外出",
      "romaji": "gaishutsu",
      "pt": "sair"
    }
  ]
},
{
  "id": "j_n5_hidari",
  "category": "kanji",
  "focus": "左",
  "jp": "左",
  "romaji": "hidari / sa",
  "pt": "esquerda",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. Direção essencial para mapa, trânsito e fábrica.",
  "chars": [
    "左"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "Direção essencial para mapa, trânsito e fábrica.",
  "onyomi": "サ",
  "kunyomi": "ひだり",
  "strokes": "5",
  "examples": [
    {
      "jp": "左",
      "romaji": "hidari",
      "pt": "esquerda"
    },
    {
      "jp": "左手",
      "romaji": "hidarite",
      "pt": "mão esquerda"
    },
    {
      "jp": "左側",
      "romaji": "hidarigawa",
      "pt": "lado esquerdo"
    }
  ]
},
{
  "id": "j_n5_migi",
  "category": "kanji",
  "focus": "右",
  "jp": "右",
  "romaji": "migi / u",
  "pt": "direita",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. Direção essencial para rua, máquinas e instruções.",
  "chars": [
    "右"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "Direção essencial para rua, máquinas e instruções.",
  "onyomi": "ウ, ユウ",
  "kunyomi": "みぎ",
  "strokes": "5",
  "examples": [
    {
      "jp": "右",
      "romaji": "migi",
      "pt": "direita"
    },
    {
      "jp": "右手",
      "romaji": "migite",
      "pt": "mão direita"
    },
    {
      "jp": "右側",
      "romaji": "migigawa",
      "pt": "lado direito"
    }
  ]
},
{
  "id": "j_n5_higashi",
  "category": "kanji",
  "focus": "東",
  "jp": "東",
  "romaji": "higashi / tou",
  "pt": "leste",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. O sol nasce no leste. Pense em direção do amanhecer.",
  "chars": [
    "東"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "O sol nasce no leste. Pense em direção do amanhecer.",
  "onyomi": "トウ",
  "kunyomi": "ひがし",
  "strokes": "8",
  "examples": [
    {
      "jp": "東京",
      "romaji": "toukyou",
      "pt": "Tóquio"
    },
    {
      "jp": "東口",
      "romaji": "higashiguchi",
      "pt": "saída leste"
    },
    {
      "jp": "東",
      "romaji": "higashi",
      "pt": "leste"
    }
  ]
},
{
  "id": "j_n5_nishi",
  "category": "kanji",
  "focus": "西",
  "jp": "西",
  "romaji": "nishi / sei",
  "pt": "oeste",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. O sol vai embora pelo oeste.",
  "chars": [
    "西"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "O sol vai embora pelo oeste.",
  "onyomi": "セイ, サイ",
  "kunyomi": "にし",
  "strokes": "6",
  "examples": [
    {
      "jp": "西口",
      "romaji": "nishiguchi",
      "pt": "saída oeste"
    },
    {
      "jp": "関西",
      "romaji": "kansai",
      "pt": "Kansai"
    },
    {
      "jp": "西",
      "romaji": "nishi",
      "pt": "oeste"
    }
  ]
},
{
  "id": "j_n5_minami",
  "category": "kanji",
  "focus": "南",
  "jp": "南",
  "romaji": "minami / nan",
  "pt": "sul",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. Direção de mapas, estações e placas.",
  "chars": [
    "南"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "Direção de mapas, estações e placas.",
  "onyomi": "ナン",
  "kunyomi": "みなみ",
  "strokes": "9",
  "examples": [
    {
      "jp": "南口",
      "romaji": "minamiguchi",
      "pt": "saída sul"
    },
    {
      "jp": "南",
      "romaji": "minami",
      "pt": "sul"
    },
    {
      "jp": "東南",
      "romaji": "tounan",
      "pt": "sudeste"
    }
  ]
},
{
  "id": "j_n5_kita",
  "category": "kanji",
  "focus": "北",
  "jp": "北",
  "romaji": "kita / hoku",
  "pt": "norte",
  "type": "kanji",
  "hint": "N5 lógico · lugares e direção. Direção de placas e saída de estação.",
  "chars": [
    "北"
  ],
  "jlpt": "N5",
  "group": "lugares e direção",
  "memo": "Direção de placas e saída de estação.",
  "onyomi": "ホク",
  "kunyomi": "きた",
  "strokes": "5",
  "examples": [
    {
      "jp": "北口",
      "romaji": "kitaguchi",
      "pt": "saída norte"
    },
    {
      "jp": "北海道",
      "romaji": "hokkaidou",
      "pt": "Hokkaido"
    },
    {
      "jp": "北",
      "romaji": "kita",
      "pt": "norte"
    }
  ]
},
{
  "id": "j_n5_ookii",
  "category": "kanji",
  "focus": "大",
  "jp": "大",
  "romaji": "ookii / dai",
  "pt": "grande",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Grande abre os braços: fácil de memorizar.",
  "chars": [
    "大"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Grande abre os braços: fácil de memorizar.",
  "onyomi": "ダイ, タイ",
  "kunyomi": "おお",
  "strokes": "3",
  "examples": [
    {
      "jp": "大学",
      "romaji": "daigaku",
      "pt": "universidade"
    },
    {
      "jp": "大きい",
      "romaji": "ookii",
      "pt": "grande"
    },
    {
      "jp": "大丈夫",
      "romaji": "daijoubu",
      "pt": "tudo bem"
    }
  ]
},
{
  "id": "j_n5_chiisai",
  "category": "kanji",
  "focus": "小",
  "jp": "小",
  "romaji": "chiisai / shou",
  "pt": "pequeno",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Pequeno parece algo dividido em pedacinhos.",
  "chars": [
    "小"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Pequeno parece algo dividido em pedacinhos.",
  "onyomi": "ショウ",
  "kunyomi": "ちい, こ",
  "strokes": "3",
  "examples": [
    {
      "jp": "小さい",
      "romaji": "chiisai",
      "pt": "pequeno"
    },
    {
      "jp": "小学校",
      "romaji": "shougakkou",
      "pt": "escola primária"
    },
    {
      "jp": "大小",
      "romaji": "daishou",
      "pt": "tamanho"
    }
  ]
},
{
  "id": "j_n5_gaku",
  "category": "kanji",
  "focus": "学",
  "jp": "学",
  "romaji": "gaku",
  "pt": "estudo / aprender",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Kanji da escola, estudo e evolução.",
  "chars": [
    "学"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Kanji da escola, estudo e evolução.",
  "onyomi": "ガク",
  "kunyomi": "まな",
  "strokes": "8",
  "examples": [
    {
      "jp": "学生",
      "romaji": "gakusei",
      "pt": "estudante"
    },
    {
      "jp": "学校",
      "romaji": "gakkou",
      "pt": "escola"
    },
    {
      "jp": "大学",
      "romaji": "daigaku",
      "pt": "universidade"
    }
  ]
},
{
  "id": "j_n5_kou",
  "category": "kanji",
  "focus": "校",
  "jp": "校",
  "romaji": "kou",
  "pt": "escola",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Aparece em 学校: lugar onde se aprende.",
  "chars": [
    "校"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Aparece em 学校: lugar onde se aprende.",
  "onyomi": "コウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "学校",
      "romaji": "gakkou",
      "pt": "escola"
    },
    {
      "jp": "高校",
      "romaji": "koukou",
      "pt": "ensino médio"
    },
    {
      "jp": "校長",
      "romaji": "kouchou",
      "pt": "diretor da escola"
    }
  ]
},
{
  "id": "j_n5_sei",
  "category": "kanji",
  "focus": "生",
  "jp": "生",
  "romaji": "sei / ikiru",
  "pt": "vida / estudante / nascer",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Vida que nasce do chão: aluno também está em formação.",
  "chars": [
    "生"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Vida que nasce do chão: aluno também está em formação.",
  "onyomi": "セイ, ショウ",
  "kunyomi": "い, う, なま",
  "strokes": "5",
  "examples": [
    {
      "jp": "学生",
      "romaji": "gakusei",
      "pt": "estudante"
    },
    {
      "jp": "先生",
      "romaji": "sensei",
      "pt": "professor"
    },
    {
      "jp": "生まれる",
      "romaji": "umareru",
      "pt": "nascer"
    }
  ]
},
{
  "id": "j_n5_saki",
  "category": "kanji",
  "focus": "先",
  "jp": "先",
  "romaji": "saki / sen",
  "pt": "antes / anterior",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Quem veio antes ensina: 先生.",
  "chars": [
    "先"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Quem veio antes ensina: 先生.",
  "onyomi": "セン",
  "kunyomi": "さき",
  "strokes": "6",
  "examples": [
    {
      "jp": "先生",
      "romaji": "sensei",
      "pt": "professor"
    },
    {
      "jp": "先月",
      "romaji": "sengetsu",
      "pt": "mês passado"
    },
    {
      "jp": "先に",
      "romaji": "saki ni",
      "pt": "antes / primeiro"
    }
  ]
},
{
  "id": "j_n5_nani",
  "category": "kanji",
  "focus": "何",
  "jp": "何",
  "romaji": "nani / nan",
  "pt": "o quê",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Kanji das perguntas: abre portas para entender.",
  "chars": [
    "何"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Kanji das perguntas: abre portas para entender.",
  "onyomi": "カ",
  "kunyomi": "なに, なん",
  "strokes": "7",
  "examples": [
    {
      "jp": "何",
      "romaji": "nani",
      "pt": "o quê"
    },
    {
      "jp": "何時",
      "romaji": "nanji",
      "pt": "que horas"
    },
    {
      "jp": "何人",
      "romaji": "nannin",
      "pt": "quantas pessoas"
    }
  ]
},
{
  "id": "j_n5_go_language",
  "category": "kanji",
  "focus": "語",
  "jp": "語",
  "romaji": "go",
  "pt": "idioma / palavra",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. O kanji de língua: 日本語, 英語, português.",
  "chars": [
    "語"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "O kanji de língua: 日本語, 英語, português.",
  "onyomi": "ゴ",
  "kunyomi": "かた",
  "strokes": "14",
  "examples": [
    {
      "jp": "日本語",
      "romaji": "nihongo",
      "pt": "japonês"
    },
    {
      "jp": "英語",
      "romaji": "eigo",
      "pt": "inglês"
    },
    {
      "jp": "言語",
      "romaji": "gengo",
      "pt": "língua / linguagem"
    }
  ]
},
{
  "id": "j_n5_tomo",
  "category": "kanji",
  "focus": "友",
  "jp": "友",
  "romaji": "tomo / yuu",
  "pt": "amigo",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. Duas mãos se aproximando: amizade.",
  "chars": [
    "友"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "Duas mãos se aproximando: amizade.",
  "onyomi": "ユウ",
  "kunyomi": "とも",
  "strokes": "4",
  "examples": [
    {
      "jp": "友だち",
      "romaji": "tomodachi",
      "pt": "amigo"
    },
    {
      "jp": "親友",
      "romaji": "shinyuu",
      "pt": "melhor amigo"
    },
    {
      "jp": "友人",
      "romaji": "yuujin",
      "pt": "amigo"
    }
  ]
},
{
  "id": "j_n5_atarashii",
  "category": "kanji",
  "focus": "新",
  "jp": "新",
  "romaji": "atarashii / shin",
  "pt": "novo",
  "type": "kanji",
  "hint": "N5 lógico · adjetivos básicos. Novo aparece em produto, estação, endereço e vida nova.",
  "chars": [
    "新"
  ],
  "jlpt": "N5",
  "group": "adjetivos básicos",
  "memo": "Novo aparece em produto, estação, endereço e vida nova.",
  "onyomi": "シン",
  "kunyomi": "あたら, あら, にい",
  "strokes": "13",
  "examples": [
    {
      "jp": "新しい",
      "romaji": "atarashii",
      "pt": "novo"
    },
    {
      "jp": "新聞",
      "romaji": "shinbun",
      "pt": "jornal"
    },
    {
      "jp": "新幹線",
      "romaji": "shinkansen",
      "pt": "trem-bala"
    }
  ]
},
{
  "id": "j_n5_furui",
  "category": "kanji",
  "focus": "古",
  "jp": "古",
  "romaji": "furui / ko",
  "pt": "velho / antigo",
  "type": "kanji",
  "hint": "N5 lógico · adjetivos básicos. Antigo ajuda a comparar preço, objeto e documento.",
  "chars": [
    "古"
  ],
  "jlpt": "N5",
  "group": "adjetivos básicos",
  "memo": "Antigo ajuda a comparar preço, objeto e documento.",
  "onyomi": "コ",
  "kunyomi": "ふる",
  "strokes": "5",
  "examples": [
    {
      "jp": "古い",
      "romaji": "furui",
      "pt": "velho / antigo"
    },
    {
      "jp": "中古",
      "romaji": "chuuko",
      "pt": "usado"
    },
    {
      "jp": "古本",
      "romaji": "furuhon",
      "pt": "livro usado"
    }
  ]
},
{
  "id": "j_n5_takai",
  "category": "kanji",
  "focus": "高",
  "jp": "高",
  "romaji": "takai / kou",
  "pt": "alto / caro",
  "type": "kanji",
  "hint": "N5 lógico · adjetivos básicos. No Japão, 高い pode doer no bolso: caro.",
  "chars": [
    "高"
  ],
  "jlpt": "N5",
  "group": "adjetivos básicos",
  "memo": "No Japão, 高い pode doer no bolso: caro.",
  "onyomi": "コウ",
  "kunyomi": "たか",
  "strokes": "10",
  "examples": [
    {
      "jp": "高い",
      "romaji": "takai",
      "pt": "alto / caro"
    },
    {
      "jp": "高校",
      "romaji": "koukou",
      "pt": "ensino médio"
    },
    {
      "jp": "円高",
      "romaji": "endaka",
      "pt": "iene forte"
    }
  ]
},
{
  "id": "j_n5_yasui",
  "category": "kanji",
  "focus": "安",
  "jp": "安",
  "romaji": "yasui / an",
  "pt": "barato / seguro",
  "type": "kanji",
  "hint": "N5 lógico · adjetivos básicos. Kanji de barato e tranquilidade: 安い e 安心.",
  "chars": [
    "安"
  ],
  "jlpt": "N5",
  "group": "adjetivos básicos",
  "memo": "Kanji de barato e tranquilidade: 安い e 安心.",
  "onyomi": "アン",
  "kunyomi": "やす",
  "strokes": "6",
  "examples": [
    {
      "jp": "安い",
      "romaji": "yasui",
      "pt": "barato"
    },
    {
      "jp": "安全",
      "romaji": "anzen",
      "pt": "segurança"
    },
    {
      "jp": "安心",
      "romaji": "anshin",
      "pt": "tranquilidade"
    }
  ]
},
{
  "id": "j_n5_ooi",
  "category": "kanji",
  "focus": "多",
  "jp": "多",
  "romaji": "ooi / ta",
  "pt": "muito",
  "type": "kanji",
  "hint": "N5 lógico · adjetivos básicos. Muitas coisas repetidas: 多い.",
  "chars": [
    "多"
  ],
  "jlpt": "N5",
  "group": "adjetivos básicos",
  "memo": "Muitas coisas repetidas: 多い.",
  "onyomi": "タ",
  "kunyomi": "おお",
  "strokes": "6",
  "examples": [
    {
      "jp": "多い",
      "romaji": "ooi",
      "pt": "muito / muitos"
    },
    {
      "jp": "多少",
      "romaji": "tashou",
      "pt": "um pouco / certa quantidade"
    },
    {
      "jp": "多分",
      "romaji": "tabun",
      "pt": "talvez"
    }
  ]
},
{
  "id": "j_n5_sukunai",
  "category": "kanji",
  "focus": "少",
  "jp": "少",
  "romaji": "sukunai / shou",
  "pt": "pouco",
  "type": "kanji",
  "hint": "N5 lógico · adjetivos básicos. Pouco é o oposto de 多い.",
  "chars": [
    "少"
  ],
  "jlpt": "N5",
  "group": "adjetivos básicos",
  "memo": "Pouco é o oposto de 多い.",
  "onyomi": "ショウ",
  "kunyomi": "すく, すこ",
  "strokes": "4",
  "examples": [
    {
      "jp": "少ない",
      "romaji": "sukunai",
      "pt": "pouco"
    },
    {
      "jp": "少し",
      "romaji": "sukoshi",
      "pt": "um pouco"
    },
    {
      "jp": "少年",
      "romaji": "shounen",
      "pt": "menino / jovem"
    }
  ]
},
{
  "id": "j_n5_nagai",
  "category": "kanji",
  "focus": "長",
  "jp": "長",
  "romaji": "nagai / chou",
  "pt": "longo / chefe",
  "type": "kanji",
  "hint": "N5 lógico · adjetivos básicos. Longo também aparece em chefe, como 店長.",
  "chars": [
    "長"
  ],
  "jlpt": "N5",
  "group": "adjetivos básicos",
  "memo": "Longo também aparece em chefe, como 店長.",
  "onyomi": "チョウ",
  "kunyomi": "なが",
  "strokes": "8",
  "examples": [
    {
      "jp": "長い",
      "romaji": "nagai",
      "pt": "longo"
    },
    {
      "jp": "店長",
      "romaji": "tenchou",
      "pt": "gerente de loja"
    },
    {
      "jp": "社長",
      "romaji": "shachou",
      "pt": "presidente da empresa"
    }
  ]
},
{
  "id": "j_n5_kuru",
  "category": "kanji",
  "focus": "来",
  "jp": "来",
  "romaji": "kuru / rai",
  "pt": "vir",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. O kanji de chegada: vem alguém, vem o mês, vem o ano.",
  "chars": [
    "来"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "O kanji de chegada: vem alguém, vem o mês, vem o ano.",
  "onyomi": "ライ",
  "kunyomi": "く",
  "strokes": "7",
  "examples": [
    {
      "jp": "来る",
      "romaji": "kuru",
      "pt": "vir"
    },
    {
      "jp": "来月",
      "romaji": "raigetsu",
      "pt": "mês que vem"
    },
    {
      "jp": "来年",
      "romaji": "rainen",
      "pt": "ano que vem"
    }
  ]
},
{
  "id": "j_n5_yasumu",
  "category": "kanji",
  "focus": "休",
  "jp": "休",
  "romaji": "yasumu / kyuu",
  "pt": "descansar",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. Pessoa encostada na árvore: descanso perfeito.",
  "chars": [
    "休"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "Pessoa encostada na árvore: descanso perfeito.",
  "onyomi": "キュウ",
  "kunyomi": "やす",
  "strokes": "6",
  "examples": [
    {
      "jp": "休む",
      "romaji": "yasumu",
      "pt": "descansar / faltar"
    },
    {
      "jp": "休日",
      "romaji": "kyuujitsu",
      "pt": "dia de folga"
    },
    {
      "jp": "休み",
      "romaji": "yasumi",
      "pt": "descanso / folga"
    }
  ]
},
{
  "id": "j_n5_au",
  "category": "kanji",
  "focus": "会",
  "jp": "会",
  "romaji": "au / kai",
  "pt": "encontrar / reunião",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. Pessoas se encontrando: 会う.",
  "chars": [
    "会"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "Pessoas se encontrando: 会う.",
  "onyomi": "カイ, エ",
  "kunyomi": "あ",
  "strokes": "6",
  "examples": [
    {
      "jp": "会う",
      "romaji": "au",
      "pt": "encontrar"
    },
    {
      "jp": "会社",
      "romaji": "kaisha",
      "pt": "empresa"
    },
    {
      "jp": "会議",
      "romaji": "kaigi",
      "pt": "reunião"
    }
  ]
},
{
  "id": "j_n5_sha",
  "category": "kanji",
  "focus": "社",
  "jp": "社",
  "romaji": "sha",
  "pt": "empresa / santuário",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. Aparece em 会社, essencial para vida de trabalho.",
  "chars": [
    "社"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "Aparece em 会社, essencial para vida de trabalho.",
  "onyomi": "シャ",
  "kunyomi": "やしろ",
  "strokes": "7",
  "examples": [
    {
      "jp": "会社",
      "romaji": "kaisha",
      "pt": "empresa"
    },
    {
      "jp": "社員",
      "romaji": "shain",
      "pt": "funcionário da empresa"
    },
    {
      "jp": "社長",
      "romaji": "shachou",
      "pt": "presidente da empresa"
    }
  ]
},
{
  "id": "j_n5_otoko",
  "category": "kanji",
  "focus": "男",
  "jp": "男",
  "romaji": "otoko / dan",
  "pt": "homem",
  "type": "kanji",
  "hint": "N5 lógico · pessoas e corpo. Campo + força: ideia antiga de homem trabalhando no campo.",
  "chars": [
    "男"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "memo": "Campo + força: ideia antiga de homem trabalhando no campo.",
  "onyomi": "ダン, ナン",
  "kunyomi": "おとこ",
  "strokes": "7",
  "examples": [
    {
      "jp": "男",
      "romaji": "otoko",
      "pt": "homem"
    },
    {
      "jp": "男の人",
      "romaji": "otoko no hito",
      "pt": "homem"
    },
    {
      "jp": "男性",
      "romaji": "dansei",
      "pt": "sexo masculino / homem"
    }
  ]
},
{
  "id": "j_n5_onna",
  "category": "kanji",
  "focus": "女",
  "jp": "女",
  "romaji": "onna / jo",
  "pt": "mulher",
  "type": "kanji",
  "hint": "N5 lógico · pessoas e corpo. Kanji básico para pessoas, família e documentos.",
  "chars": [
    "女"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "memo": "Kanji básico para pessoas, família e documentos.",
  "onyomi": "ジョ, ニョ",
  "kunyomi": "おんな",
  "strokes": "3",
  "examples": [
    {
      "jp": "女",
      "romaji": "onna",
      "pt": "mulher"
    },
    {
      "jp": "女の人",
      "romaji": "onna no hito",
      "pt": "mulher"
    },
    {
      "jp": "女性",
      "romaji": "josei",
      "pt": "sexo feminino / mulher"
    }
  ]
},
{
  "id": "j_n5_ko",
  "category": "kanji",
  "focus": "子",
  "jp": "子",
  "romaji": "ko / shi",
  "pt": "criança",
  "type": "kanji",
  "hint": "N5 lógico · pessoas e corpo. Criança aparece em 子ども e muitos nomes.",
  "chars": [
    "子"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "memo": "Criança aparece em 子ども e muitos nomes.",
  "onyomi": "シ, ス",
  "kunyomi": "こ",
  "strokes": "3",
  "examples": [
    {
      "jp": "子ども",
      "romaji": "kodomo",
      "pt": "criança"
    },
    {
      "jp": "女子",
      "romaji": "joshi",
      "pt": "menina / feminino"
    },
    {
      "jp": "息子",
      "romaji": "musuko",
      "pt": "filho"
    }
  ]
},
{
  "id": "j_n5_chichi",
  "category": "kanji",
  "focus": "父",
  "jp": "父",
  "romaji": "chichi / fu",
  "pt": "pai",
  "type": "kanji",
  "hint": "N5 lógico · pessoas e corpo. Kanji de família básico para documentos e conversa.",
  "chars": [
    "父"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "memo": "Kanji de família básico para documentos e conversa.",
  "onyomi": "フ",
  "kunyomi": "ちち",
  "strokes": "4",
  "examples": [
    {
      "jp": "父",
      "romaji": "chichi",
      "pt": "meu pai"
    },
    {
      "jp": "お父さん",
      "romaji": "otousan",
      "pt": "pai"
    },
    {
      "jp": "父母",
      "romaji": "fubo",
      "pt": "pai e mãe"
    }
  ]
},
{
  "id": "j_n5_haha",
  "category": "kanji",
  "focus": "母",
  "jp": "母",
  "romaji": "haha / bo",
  "pt": "mãe",
  "type": "kanji",
  "hint": "N5 lógico · pessoas e corpo. Kanji de família básico para conversa e vida adulta.",
  "chars": [
    "母"
  ],
  "jlpt": "N5",
  "group": "pessoas e corpo",
  "memo": "Kanji de família básico para conversa e vida adulta.",
  "onyomi": "ボ",
  "kunyomi": "はは",
  "strokes": "5",
  "examples": [
    {
      "jp": "母",
      "romaji": "haha",
      "pt": "minha mãe"
    },
    {
      "jp": "お母さん",
      "romaji": "okaasan",
      "pt": "mãe"
    },
    {
      "jp": "母国",
      "romaji": "bokoku",
      "pt": "país natal"
    }
  ]
},
{
  "id": "j_n5_hon_book",
  "category": "kanji",
  "focus": "本",
  "jp": "本",
  "romaji": "hon",
  "pt": "livro / origem",
  "type": "kanji",
  "hint": "N5 lógico · escola, pessoas e língua. A árvore 木 com uma marca na raiz: origem, base, livro.",
  "chars": [
    "本"
  ],
  "jlpt": "N5",
  "group": "escola, pessoas e língua",
  "memo": "A árvore 木 com uma marca na raiz: origem, base, livro.",
  "onyomi": "ホン",
  "kunyomi": "もと",
  "strokes": "5",
  "examples": [
    {
      "jp": "本",
      "romaji": "hon",
      "pt": "livro"
    },
    {
      "jp": "日本",
      "romaji": "nihon",
      "pt": "Japão"
    },
    {
      "jp": "本日",
      "romaji": "honjitsu",
      "pt": "hoje / este dia"
    }
  ]
},
{
  "id": "j_n5_kaku",
  "category": "kanji",
  "focus": "書",
  "jp": "書",
  "romaji": "kaku / sho",
  "pt": "escrever",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. Mão escrevendo no papel: perfeito para o DIÁRIO321.",
  "chars": [
    "書"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "Mão escrevendo no papel: perfeito para o DIÁRIO321.",
  "onyomi": "ショ",
  "kunyomi": "か",
  "strokes": "10",
  "examples": [
    {
      "jp": "書く",
      "romaji": "kaku",
      "pt": "escrever"
    },
    {
      "jp": "辞書",
      "romaji": "jisho",
      "pt": "dicionário"
    },
    {
      "jp": "書類",
      "romaji": "shorui",
      "pt": "documentos"
    }
  ]
},
{
  "id": "j_n5_yomu_kanji",
  "category": "kanji",
  "focus": "読",
  "jp": "読",
  "romaji": "yomu / doku",
  "pt": "ler",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. Kanji do objetivo final: ler japonês real.",
  "chars": [
    "読"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "Kanji do objetivo final: ler japonês real.",
  "onyomi": "ドク, トク",
  "kunyomi": "よ",
  "strokes": "14",
  "examples": [
    {
      "jp": "読む",
      "romaji": "yomu",
      "pt": "ler"
    },
    {
      "jp": "読書",
      "romaji": "dokusho",
      "pt": "leitura"
    },
    {
      "jp": "音読",
      "romaji": "ondoku",
      "pt": "leitura em voz alta"
    }
  ]
},
{
  "id": "j_n5_kiku",
  "category": "kanji",
  "focus": "聞",
  "jp": "聞",
  "romaji": "kiku / bun",
  "pt": "ouvir / perguntar",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. A orelha dentro do portão: ouvir com atenção.",
  "chars": [
    "聞"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "A orelha dentro do portão: ouvir com atenção.",
  "onyomi": "ブン, モン",
  "kunyomi": "き",
  "strokes": "14",
  "examples": [
    {
      "jp": "聞く",
      "romaji": "kiku",
      "pt": "ouvir / perguntar"
    },
    {
      "jp": "新聞",
      "romaji": "shinbun",
      "pt": "jornal"
    },
    {
      "jp": "聞こえる",
      "romaji": "kikoeru",
      "pt": "ser audível"
    }
  ]
},
{
  "id": "j_n5_hanasu",
  "category": "kanji",
  "focus": "話",
  "jp": "話",
  "romaji": "hanasu / wa",
  "pt": "falar",
  "type": "kanji",
  "hint": "N5 lógico · verbos essenciais. Palavra saindo da língua: falar.",
  "chars": [
    "話"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "Palavra saindo da língua: falar.",
  "onyomi": "ワ",
  "kunyomi": "はな",
  "strokes": "13",
  "examples": [
    {
      "jp": "話す",
      "romaji": "hanasu",
      "pt": "falar"
    },
    {
      "jp": "電話",
      "romaji": "denwa",
      "pt": "telefone"
    },
    {
      "jp": "会話",
      "romaji": "kaiwa",
      "pt": "conversa"
    }
  ]
},
{
  "id": "j_n4_eki2",
  "category": "kanji",
  "focus": "駅",
  "jp": "駅",
  "romaji": "eki",
  "pt": "estação",
  "type": "kanji",
  "hint": "N4 prova + interpretação · transporte e cidade. Kanji que aparece em quase toda vida urbana no Japão.",
  "chars": [
    "駅"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "Kanji que aparece em quase toda vida urbana no Japão.",
  "onyomi": "エキ",
  "kunyomi": "",
  "strokes": "14",
  "examples": [
    {
      "jp": "駅",
      "romaji": "eki",
      "pt": "estação"
    },
    {
      "jp": "駅前",
      "romaji": "ekimae",
      "pt": "em frente à estação"
    },
    {
      "jp": "駅員",
      "romaji": "ekiin",
      "pt": "funcionário da estação"
    }
  ]
},
{
  "id": "j_n4_densha",
  "category": "kanji",
  "focus": "電",
  "jp": "電",
  "romaji": "den",
  "pt": "eletricidade",
  "type": "kanji",
  "hint": "N4 prova + interpretação · transporte e cidade. A eletricidade está no trem, telefone e luz.",
  "chars": [
    "電"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "A eletricidade está no trem, telefone e luz.",
  "onyomi": "デン",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "電車",
      "romaji": "densha",
      "pt": "trem"
    },
    {
      "jp": "電話",
      "romaji": "denwa",
      "pt": "telefone"
    },
    {
      "jp": "電気",
      "romaji": "denki",
      "pt": "eletricidade / luz"
    }
  ]
},
{
  "id": "j_n4_michi",
  "category": "kanji",
  "focus": "道",
  "jp": "道",
  "romaji": "michi / dou",
  "pt": "caminho / rua",
  "type": "kanji",
  "hint": "N4 prova + interpretação · transporte e cidade. Caminho físico e também caminho de vida.",
  "chars": [
    "道"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "Caminho físico e também caminho de vida.",
  "onyomi": "ドウ, トウ",
  "kunyomi": "みち",
  "strokes": "12",
  "examples": [
    {
      "jp": "道路",
      "romaji": "douro",
      "pt": "rua / estrada"
    },
    {
      "jp": "北海道",
      "romaji": "hokkaidou",
      "pt": "Hokkaido"
    },
    {
      "jp": "道",
      "romaji": "michi",
      "pt": "caminho"
    }
  ]
},
{
  "id": "j_n4_chizu",
  "category": "kanji",
  "focus": "地",
  "jp": "地",
  "romaji": "chi / ji",
  "pt": "terra / lugar",
  "type": "kanji",
  "hint": "N4 prova + interpretação · transporte e cidade. A base de lugares, mapas e regiões.",
  "chars": [
    "地"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "A base de lugares, mapas e regiões.",
  "onyomi": "チ, ジ",
  "kunyomi": "",
  "strokes": "6",
  "examples": [
    {
      "jp": "地下",
      "romaji": "chika",
      "pt": "subsolo"
    },
    {
      "jp": "地図",
      "romaji": "chizu",
      "pt": "mapa"
    },
    {
      "jp": "地域",
      "romaji": "chiiki",
      "pt": "região"
    }
  ]
},
{
  "id": "j_n4_ba",
  "category": "kanji",
  "focus": "場",
  "jp": "場",
  "romaji": "ba / jou",
  "pt": "lugar / local",
  "type": "kanji",
  "hint": "N4 prova + interpretação · transporte e cidade. O kanji do lugar onde algo acontece.",
  "chars": [
    "場"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "O kanji do lugar onde algo acontece.",
  "onyomi": "ジョウ",
  "kunyomi": "ば",
  "strokes": "12",
  "examples": [
    {
      "jp": "場所",
      "romaji": "basho",
      "pt": "lugar"
    },
    {
      "jp": "工場",
      "romaji": "koujou",
      "pt": "fábrica"
    },
    {
      "jp": "売り場",
      "romaji": "uriba",
      "pt": "setor de venda"
    }
  ]
},
{
  "id": "j_n4_shigoto",
  "category": "kanji",
  "focus": "仕",
  "jp": "仕",
  "romaji": "shi",
  "pt": "servir / trabalho",
  "type": "kanji",
  "hint": "N4 prova + interpretação · trabalho e fábrica. Aparece em 仕事, palavra central para o dekassegui.",
  "chars": [
    "仕"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Aparece em 仕事, palavra central para o dekassegui.",
  "onyomi": "シ, ジ",
  "kunyomi": "つか",
  "strokes": "5",
  "examples": [
    {
      "jp": "仕事",
      "romaji": "shigoto",
      "pt": "trabalho"
    },
    {
      "jp": "仕方",
      "romaji": "shikata",
      "pt": "modo de fazer"
    },
    {
      "jp": "仕組み",
      "romaji": "shikumi",
      "pt": "estrutura / mecanismo"
    }
  ]
},
{
  "id": "j_n4_koto",
  "category": "kanji",
  "focus": "事",
  "jp": "事",
  "romaji": "koto / ji",
  "pt": "coisa / assunto",
  "type": "kanji",
  "hint": "N4 prova + interpretação · trabalho e fábrica. O assunto, ocorrência ou coisa que precisa ser resolvida.",
  "chars": [
    "事"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "O assunto, ocorrência ou coisa que precisa ser resolvida.",
  "onyomi": "ジ, ズ",
  "kunyomi": "こと",
  "strokes": "8",
  "examples": [
    {
      "jp": "仕事",
      "romaji": "shigoto",
      "pt": "trabalho"
    },
    {
      "jp": "大事",
      "romaji": "daiji",
      "pt": "importante"
    },
    {
      "jp": "食事",
      "romaji": "shokuji",
      "pt": "refeição"
    }
  ]
},
{
  "id": "j_n4_kou",
  "category": "kanji",
  "focus": "工",
  "jp": "工",
  "romaji": "kou / ku",
  "pt": "produção / engenharia",
  "type": "kanji",
  "hint": "N4 prova + interpretação · trabalho e fábrica. Kanji de fábrica, construção e produção.",
  "chars": [
    "工"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Kanji de fábrica, construção e produção.",
  "onyomi": "コウ, ク",
  "kunyomi": "",
  "strokes": "3",
  "examples": [
    {
      "jp": "工場",
      "romaji": "koujou",
      "pt": "fábrica"
    },
    {
      "jp": "工事",
      "romaji": "kouji",
      "pt": "obra"
    },
    {
      "jp": "工業",
      "romaji": "kougyou",
      "pt": "indústria"
    }
  ]
},
{
  "id": "j_n4_gyou",
  "category": "kanji",
  "focus": "業",
  "jp": "業",
  "romaji": "gyou",
  "pt": "trabalho / atividade",
  "type": "kanji",
  "hint": "N4 prova + interpretação · trabalho e fábrica. Aparece em trabalho, indústria e tarefa.",
  "chars": [
    "業"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Aparece em trabalho, indústria e tarefa.",
  "onyomi": "ギョウ, ゴウ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "残業",
      "romaji": "zangyou",
      "pt": "hora extra"
    },
    {
      "jp": "作業",
      "romaji": "sagyou",
      "pt": "operação / tarefa"
    },
    {
      "jp": "工業",
      "romaji": "kougyou",
      "pt": "indústria"
    }
  ]
},
{
  "id": "j_n4_saku",
  "category": "kanji",
  "focus": "作",
  "jp": "作",
  "romaji": "saku / tsukuru",
  "pt": "fazer / produzir",
  "type": "kanji",
  "hint": "N4 prova + interpretação · trabalho e fábrica. Fazer com as mãos e produzir algo.",
  "chars": [
    "作"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Fazer com as mãos e produzir algo.",
  "onyomi": "サク, サ",
  "kunyomi": "つく",
  "strokes": "7",
  "examples": [
    {
      "jp": "作る",
      "romaji": "tsukuru",
      "pt": "fazer / criar"
    },
    {
      "jp": "作業",
      "romaji": "sagyou",
      "pt": "tarefa / operação"
    },
    {
      "jp": "作文",
      "romaji": "sakubun",
      "pt": "redação"
    }
  ]
},
{
  "id": "j_n4_byou",
  "category": "kanji",
  "focus": "病",
  "jp": "病",
  "romaji": "byou",
  "pt": "doença",
  "type": "kanji",
  "hint": "N4 prova + interpretação · saúde e vida adulta. Kanji essencial para hospital, sintomas e saúde.",
  "chars": [
    "病"
  ],
  "jlpt": "N4",
  "group": "saúde e vida adulta",
  "memo": "Kanji essencial para hospital, sintomas e saúde.",
  "onyomi": "ビョウ, ヘイ",
  "kunyomi": "や",
  "strokes": "10",
  "examples": [
    {
      "jp": "病院",
      "romaji": "byouin",
      "pt": "hospital"
    },
    {
      "jp": "病気",
      "romaji": "byouki",
      "pt": "doença"
    },
    {
      "jp": "急病",
      "romaji": "kyuubyou",
      "pt": "doença repentina"
    }
  ]
},
{
  "id": "j_n4_in",
  "category": "kanji",
  "focus": "院",
  "jp": "院",
  "romaji": "in",
  "pt": "instituição",
  "type": "kanji",
  "hint": "N4 prova + interpretação · saúde e vida adulta. Aparece em hospital e instituições.",
  "chars": [
    "院"
  ],
  "jlpt": "N4",
  "group": "saúde e vida adulta",
  "memo": "Aparece em hospital e instituições.",
  "onyomi": "イン",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "病院",
      "romaji": "byouin",
      "pt": "hospital"
    },
    {
      "jp": "入院",
      "romaji": "nyuuin",
      "pt": "internação"
    },
    {
      "jp": "医院",
      "romaji": "iin",
      "pt": "clínica"
    }
  ]
},
{
  "id": "j_n4_kusuri",
  "category": "kanji",
  "focus": "薬",
  "jp": "薬",
  "romaji": "kusuri / yaku",
  "pt": "remédio",
  "type": "kanji",
  "hint": "N4 prova + interpretação · saúde e vida adulta. Kanji vital para farmácia e vida no Japão.",
  "chars": [
    "薬"
  ],
  "jlpt": "N4",
  "group": "saúde e vida adulta",
  "memo": "Kanji vital para farmácia e vida no Japão.",
  "onyomi": "ヤク",
  "kunyomi": "くすり",
  "strokes": "16",
  "examples": [
    {
      "jp": "薬",
      "romaji": "kusuri",
      "pt": "remédio"
    },
    {
      "jp": "薬局",
      "romaji": "yakkyoku",
      "pt": "farmácia"
    },
    {
      "jp": "目薬",
      "romaji": "megusuri",
      "pt": "colírio"
    }
  ]
},
{
  "id": "j_n4_karada",
  "category": "kanji",
  "focus": "体",
  "jp": "体",
  "romaji": "karada / tai",
  "pt": "corpo",
  "type": "kanji",
  "hint": "N4 prova + interpretação · saúde e vida adulta. Corpo é base para saúde, trabalho e cansaço.",
  "chars": [
    "体"
  ],
  "jlpt": "N4",
  "group": "saúde e vida adulta",
  "memo": "Corpo é base para saúde, trabalho e cansaço.",
  "onyomi": "タイ, テイ",
  "kunyomi": "からだ",
  "strokes": "7",
  "examples": [
    {
      "jp": "体",
      "romaji": "karada",
      "pt": "corpo"
    },
    {
      "jp": "体調",
      "romaji": "taichou",
      "pt": "condição física"
    },
    {
      "jp": "体育",
      "romaji": "taiiku",
      "pt": "educação física"
    }
  ]
},
{
  "id": "j_n4_kyuu",
  "category": "kanji",
  "focus": "急",
  "jp": "急",
  "romaji": "kyuu",
  "pt": "urgente / repentino",
  "type": "kanji",
  "hint": "N4 prova + interpretação · saúde e vida adulta. Útil para emergência e mudança súbita.",
  "chars": [
    "急"
  ],
  "jlpt": "N4",
  "group": "saúde e vida adulta",
  "memo": "Útil para emergência e mudança súbita.",
  "onyomi": "キュウ",
  "kunyomi": "いそ",
  "strokes": "9",
  "examples": [
    {
      "jp": "急に",
      "romaji": "kyuu ni",
      "pt": "de repente"
    },
    {
      "jp": "急病",
      "romaji": "kyuubyou",
      "pt": "doença repentina"
    },
    {
      "jp": "急行",
      "romaji": "kyuukou",
      "pt": "trem expresso"
    }
  ]
},
{
  "id": "j_n4_shou",
  "category": "kanji",
  "focus": "正",
  "jp": "正",
  "romaji": "sei / shou",
  "pt": "correto / justo",
  "type": "kanji",
  "hint": "N4 prova + interpretação · documentos e cotidiano. Kanji de correto, oficial e ajuste.",
  "chars": [
    "正"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Kanji de correto, oficial e ajuste.",
  "onyomi": "セイ, ショウ",
  "kunyomi": "ただ",
  "strokes": "5",
  "examples": [
    {
      "jp": "正しい",
      "romaji": "tadashii",
      "pt": "○ correto"
    },
    {
      "jp": "正月",
      "romaji": "shougatsu",
      "pt": "Ano Novo"
    },
    {
      "jp": "修正",
      "romaji": "shuusei",
      "pt": "correção"
    }
  ]
},
{
  "id": "j_n4_shouken",
  "category": "kanji",
  "focus": "証",
  "jp": "証",
  "romaji": "shou",
  "pt": "prova / certificado",
  "type": "kanji",
  "hint": "N4 prova + interpretação · documentos e cotidiano. Aparece em documentos, comprovantes e identificação.",
  "chars": [
    "証"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Aparece em documentos, comprovantes e identificação.",
  "onyomi": "ショウ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "証明書",
      "romaji": "shoumeisho",
      "pt": "certificado"
    },
    {
      "jp": "保険証",
      "romaji": "hokenshou",
      "pt": "cartão do seguro"
    },
    {
      "jp": "証拠",
      "romaji": "shouko",
      "pt": "prova"
    }
  ]
},
{
  "id": "j_n4_mei",
  "category": "kanji",
  "focus": "明",
  "jp": "明",
  "romaji": "mei / akarui",
  "pt": "claro / explicar",
  "type": "kanji",
  "hint": "N4 prova + interpretação · documentos e cotidiano. Clarear algo também é explicar.",
  "chars": [
    "明"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Clarear algo também é explicar.",
  "onyomi": "メイ, ミョウ",
  "kunyomi": "あか",
  "strokes": "8",
  "examples": [
    {
      "jp": "説明",
      "romaji": "setsumei",
      "pt": "explicação"
    },
    {
      "jp": "明るい",
      "romaji": "akarui",
      "pt": "claro / alegre"
    },
    {
      "jp": "明日",
      "romaji": "ashita",
      "pt": "amanhã"
    }
  ]
},
{
  "id": "j_n4_setsumei",
  "category": "kanji",
  "focus": "説",
  "jp": "説",
  "romaji": "setsu",
  "pt": "explicar / teoria",
  "type": "kanji",
  "hint": "N4 prova + interpretação · documentos e cotidiano. Kanji de explicação, perfeito para entender documentos.",
  "chars": [
    "説"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Kanji de explicação, perfeito para entender documentos.",
  "onyomi": "セツ",
  "kunyomi": "と",
  "strokes": "14",
  "examples": [
    {
      "jp": "説明",
      "romaji": "setsumei",
      "pt": "explicação"
    },
    {
      "jp": "小説",
      "romaji": "shousetsu",
      "pt": "romance / novela"
    },
    {
      "jp": "説得",
      "romaji": "settoku",
      "pt": "persuasão"
    }
  ]
},
{
  "id": "j_n4_shitsu",
  "category": "kanji",
  "focus": "質",
  "jp": "質",
  "romaji": "shitsu",
  "pt": "qualidade / pergunta",
  "type": "kanji",
  "hint": "N4 prova + interpretação · documentos e cotidiano. Serve para qualidade e perguntas formais.",
  "chars": [
    "質"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Serve para qualidade e perguntas formais.",
  "onyomi": "シツ, シチ",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "質問",
      "romaji": "shitsumon",
      "pt": "pergunta"
    },
    {
      "jp": "品質",
      "romaji": "hinshitsu",
      "pt": "qualidade"
    },
    {
      "jp": "性質",
      "romaji": "seishitsu",
      "pt": "característica"
    }
  ]
},
{
  "id": "j_n4_zan",
  "category": "kanji",
  "focus": "残",
  "jp": "残",
  "romaji": "zan / nokoru",
  "pt": "restar / sobrar",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Kanji de 残業: quando o trabalho sobra depois do horário.",
  "chars": [
    "残"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Kanji de 残業: quando o trabalho sobra depois do horário.",
  "onyomi": "ザン",
  "kunyomi": "のこ",
  "strokes": "10",
  "examples": [
    {
      "jp": "残業",
      "romaji": "zangyou",
      "pt": "hora extra"
    },
    {
      "jp": "残る",
      "romaji": "nokoru",
      "pt": "sobrar / permanecer"
    },
    {
      "jp": "残高",
      "romaji": "zandaka",
      "pt": "saldo"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "残業",
    "jp": "今日は二時間残業があります。",
    "pt": "Hoje tenho duas horas extras.",
    "note": "残業 = hora extra"
  },
  {
    "type": "kunyomi",
    "word": "残る",
    "jp": "まだ仕事が少し残っています。",
    "pt": "Ainda sobrou um pouco de trabalho.",
    "note": "残る = sobrar"
  },
  {
    "type": "onyomi",
    "word": "残高",
    "jp": "銀行の残高を確認しました。",
    "pt": "Conferi o saldo do banco.",
    "note": "残高 = saldo"
  }
]
},
{
  "id": "j_n4_ryou",
  "category": "kanji",
  "focus": "料",
  "jp": "料",
  "romaji": "ryou",
  "pt": "taxa / material",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Aparece em salário, tarifa e cobrança: dinheiro que precisa ser entendido.",
  "chars": [
    "料"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Aparece em salário, tarifa e cobrança: dinheiro que precisa ser entendido.",
  "onyomi": "リョウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "給料",
      "romaji": "kyuuryou",
      "pt": "salário"
    },
    {
      "jp": "料金",
      "romaji": "ryoukin",
      "pt": "tarifa"
    },
    {
      "jp": "材料",
      "romaji": "zairyou",
      "pt": "material"
    }
  ]
},
{
  "id": "j_n4_kyuu_salary",
  "category": "kanji",
  "focus": "給",
  "jp": "給",
  "romaji": "kyuu",
  "pt": "fornecer / salário",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. 給 aparece em pagamento recebido pelo esforço.",
  "chars": [
    "給"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "給 aparece em pagamento recebido pelo esforço.",
  "onyomi": "キュウ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "給料",
      "romaji": "kyuuryou",
      "pt": "salário"
    },
    {
      "jp": "時給",
      "romaji": "jikyuu",
      "pt": "salário por hora"
    },
    {
      "jp": "支給",
      "romaji": "shikyuu",
      "pt": "fornecimento / pagamento"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "給料",
    "jp": "給料日は毎月二十五日です。",
    "pt": "O dia do pagamento é todo mês no dia 25.",
    "note": "給料 = salário"
  },
  {
    "type": "onyomi",
    "word": "時給",
    "jp": "この仕事の時給はいくらですか。",
    "pt": "Quanto é o salário por hora deste trabalho?",
    "note": "時給 = salário por hora"
  },
  {
    "type": "onyomi",
    "word": "支給",
    "jp": "制服は会社から支給されます。",
    "pt": "O uniforme é fornecido pela empresa.",
    "note": "支給 = fornecimento/pagamento"
  }
]
},
{
  "id": "j_n4_kin",
  "category": "kanji",
  "focus": "勤",
  "jp": "勤",
  "romaji": "kin / tsutomeru",
  "pt": "trabalhar / serviço",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Kanji de勤務: estar escalado para trabalhar.",
  "chars": [
    "勤"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Kanji de勤務: estar escalado para trabalhar.",
  "onyomi": "キン, ゴン",
  "kunyomi": "つと",
  "strokes": "12",
  "examples": [
    {
      "jp": "勤務",
      "romaji": "kinmu",
      "pt": "serviço / turno"
    },
    {
      "jp": "通勤",
      "romaji": "tsuukin",
      "pt": "ida ao trabalho"
    },
    {
      "jp": "勤める",
      "romaji": "tsutomeru",
      "pt": "trabalhar em uma empresa"
    }
  ]
},
{
  "id": "j_n4_mu",
  "category": "kanji",
  "focus": "務",
  "jp": "務",
  "romaji": "mu",
  "pt": "dever / serviço",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. O lado formal do trabalho: obrigação, função e tarefa.",
  "chars": [
    "務"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "O lado formal do trabalho: obrigação, função e tarefa.",
  "onyomi": "ム",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "勤務",
      "romaji": "kinmu",
      "pt": "serviço / turno"
    },
    {
      "jp": "事務",
      "romaji": "jimu",
      "pt": "escritório / administrativo"
    },
    {
      "jp": "義務",
      "romaji": "gimu",
      "pt": "obrigação"
    }
  ]
},
{
  "id": "j_n4_sagyou_saku",
  "category": "kanji",
  "focus": "作",
  "jp": "作",
  "romaji": "saku / tsukuru",
  "pt": "fazer / produzir",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. O kanji de produzir com as mãos, muito fábrica-raiz.",
  "chars": [
    "作"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "O kanji de produzir com as mãos, muito fábrica-raiz.",
  "onyomi": "サク, サ",
  "kunyomi": "つく",
  "strokes": "7",
  "examples": [
    {
      "jp": "作業",
      "romaji": "sagyou",
      "pt": "operação / tarefa"
    },
    {
      "jp": "作る",
      "romaji": "tsukuru",
      "pt": "fazer / criar"
    },
    {
      "jp": "操作",
      "romaji": "sousa",
      "pt": "operação de máquina"
    }
  ]
},
{
  "id": "j_n4_sou",
  "category": "kanji",
  "focus": "操",
  "jp": "操",
  "romaji": "sou / ayatsuru",
  "pt": "operar / manipular",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Kanji de operar máquina, botão, painel e procedimento.",
  "chars": [
    "操"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Kanji de operar máquina, botão, painel e procedimento.",
  "onyomi": "ソウ",
  "kunyomi": "あやつ",
  "strokes": "16",
  "examples": [
    {
      "jp": "操作",
      "romaji": "sousa",
      "pt": "operação / manuseio"
    },
    {
      "jp": "体操",
      "romaji": "taisou",
      "pt": "ginástica"
    },
    {
      "jp": "操る",
      "romaji": "ayatsuru",
      "pt": "controlar"
    }
  ]
},
{
  "id": "j_n4_sa",
  "category": "kanji",
  "focus": "査",
  "jp": "査",
  "romaji": "sa",
  "pt": "inspeção / verificar",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Kanji de checar com cuidado, essencial para qualidade.",
  "chars": [
    "査"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Kanji de checar com cuidado, essencial para qualidade.",
  "onyomi": "サ",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "検査",
      "romaji": "kensa",
      "pt": "inspeção"
    },
    {
      "jp": "調査",
      "romaji": "chousa",
      "pt": "investigação"
    },
    {
      "jp": "監査",
      "romaji": "kansa",
      "pt": "auditoria"
    }
  ]
},
{
  "id": "j_n4_ken",
  "category": "kanji",
  "focus": "検",
  "jp": "検",
  "romaji": "ken",
  "pt": "examinar / inspecionar",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Antes de liberar algo, precisa verificar: 検.",
  "chars": [
    "検"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Antes de liberar algo, precisa verificar: 検.",
  "onyomi": "ケン",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "検査",
      "romaji": "kensa",
      "pt": "inspeção"
    },
    {
      "jp": "点検",
      "romaji": "tenken",
      "pt": "checagem"
    },
    {
      "jp": "検索",
      "romaji": "kensaku",
      "pt": "pesquisa"
    }
  ]
},
{
  "id": "j_n4_ten_check",
  "category": "kanji",
  "focus": "点",
  "jp": "点",
  "romaji": "ten",
  "pt": "ponto / checagem",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Ponto de atenção, ponto no monitor, ponto de checagem.",
  "chars": [
    "点"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Ponto de atenção, ponto no monitor, ponto de checagem.",
  "onyomi": "テン",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "点検",
      "romaji": "tenken",
      "pt": "checagem"
    },
    {
      "jp": "点",
      "romaji": "ten",
      "pt": "ponto"
    },
    {
      "jp": "問題点",
      "romaji": "mondaiten",
      "pt": "ponto problemático"
    }
  ]
},
{
  "id": "j_n4_ki_machine",
  "category": "kanji",
  "focus": "機",
  "jp": "機",
  "romaji": "ki",
  "pt": "máquina / oportunidade",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Máquina, equipamento e chance: uma engrenagem de significado.",
  "chars": [
    "機"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Máquina, equipamento e chance: uma engrenagem de significado.",
  "onyomi": "キ",
  "kunyomi": "はた",
  "strokes": "16",
  "examples": [
    {
      "jp": "機械",
      "romaji": "kikai",
      "pt": "máquina"
    },
    {
      "jp": "飛行機",
      "romaji": "hikouki",
      "pt": "avião"
    },
    {
      "jp": "機会",
      "romaji": "kikai",
      "pt": "oportunidade"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "機械",
    "jp": "この機械は朝から調子が悪いです。",
    "pt": "Esta máquina está ruim desde manhã.",
    "note": "機械 = máquina"
  },
  {
    "type": "onyomi",
    "word": "機会",
    "jp": "日本語を話す機会を増やしたいです。",
    "pt": "Quero aumentar as oportunidades de falar japonês.",
    "note": "機会 = oportunidade"
  },
  {
    "type": "onyomi",
    "word": "飛行機",
    "jp": "飛行機の時間を確認しました。",
    "pt": "Conferi o horário do avião.",
    "note": "飛行機 = avião"
  }
]
},
{
  "id": "j_n4_kai_machine",
  "category": "kanji",
  "focus": "械",
  "jp": "械",
  "romaji": "kai",
  "pt": "mecanismo / máquina",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Usado com 機 em 機械: a máquina física.",
  "chars": [
    "械"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Usado com 機 em 機械: a máquina física.",
  "onyomi": "カイ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "機械",
      "romaji": "kikai",
      "pt": "máquina"
    },
    {
      "jp": "器械",
      "romaji": "kikai",
      "pt": "aparelho"
    },
    {
      "jp": "機械音",
      "romaji": "kikaion",
      "pt": "som de máquina"
    }
  ]
},
{
  "id": "j_n4_chou",
  "category": "kanji",
  "focus": "調",
  "jp": "調",
  "romaji": "chou / shiraberu",
  "pt": "ajustar / investigar",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Kanji de regulagem e investigação: perfeito para fábrica.",
  "chars": [
    "調"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Kanji de regulagem e investigação: perfeito para fábrica.",
  "onyomi": "チョウ",
  "kunyomi": "しら, ととの",
  "strokes": "15",
  "examples": [
    {
      "jp": "調整",
      "romaji": "chousei",
      "pt": "ajuste / regulagem"
    },
    {
      "jp": "調べる",
      "romaji": "shiraberu",
      "pt": "investigar / verificar"
    },
    {
      "jp": "体調",
      "romaji": "taichou",
      "pt": "condição física"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "調整",
    "jp": "この機械は調整が必要です。",
    "pt": "Esta máquina precisa de regulagem.",
    "note": "調整 = ajuste/regulagem"
  },
  {
    "type": "kunyomi",
    "word": "調べる",
    "jp": "原因をもう一度調べます。",
    "pt": "Vou verificar a causa mais uma vez.",
    "note": "調べる = verificar/investigar"
  },
  {
    "type": "onyomi",
    "word": "体調",
    "jp": "今日は少し体調が悪いです。",
    "pt": "Hoje minha condição física está um pouco ruim.",
    "note": "体調 = condição física"
  }
]
},
{
  "id": "j_n4_sei_adjust",
  "category": "kanji",
  "focus": "整",
  "jp": "整",
  "romaji": "sei / totonou",
  "pt": "organizar / ajustar",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. Quando tudo precisa ficar alinhado: 整.",
  "chars": [
    "整"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "Quando tudo precisa ficar alinhado: 整.",
  "onyomi": "セイ",
  "kunyomi": "ととの",
  "strokes": "16",
  "examples": [
    {
      "jp": "調整",
      "romaji": "chousei",
      "pt": "ajuste / regulagem"
    },
    {
      "jp": "整理",
      "romaji": "seiri",
      "pt": "organização"
    },
    {
      "jp": "整備",
      "romaji": "seibi",
      "pt": "manutenção"
    }
  ]
},
{
  "id": "j_n4_koujou_jou",
  "category": "kanji",
  "focus": "場",
  "jp": "場",
  "romaji": "ba / jou",
  "pt": "local / lugar",
  "type": "kanji",
  "hint": "N4 vida real · trabalho e fábrica. O lugar onde a vida acontece: fábrica, venda, estacionamento.",
  "chars": [
    "場"
  ],
  "jlpt": "N4",
  "group": "trabalho e fábrica",
  "memo": "O lugar onde a vida acontece: fábrica, venda, estacionamento.",
  "onyomi": "ジョウ",
  "kunyomi": "ば",
  "strokes": "12",
  "examples": [
    {
      "jp": "工場",
      "romaji": "koujou",
      "pt": "fábrica"
    },
    {
      "jp": "場所",
      "romaji": "basho",
      "pt": "lugar"
    },
    {
      "jp": "駐車場",
      "romaji": "chuushajou",
      "pt": "estacionamento"
    }
  ]
},
{
  "id": "j_n4_shi_city",
  "category": "kanji",
  "focus": "市",
  "jp": "市",
  "romaji": "shi / ichi",
  "pt": "cidade / mercado",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. 市 aparece em endereço, prefeitura e nome de cidade.",
  "chars": [
    "市"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "市 aparece em endereço, prefeitura e nome de cidade.",
  "onyomi": "シ",
  "kunyomi": "いち",
  "strokes": "5",
  "examples": [
    {
      "jp": "市役所",
      "romaji": "shiyakusho",
      "pt": "prefeitura"
    },
    {
      "jp": "市民",
      "romaji": "shimin",
      "pt": "cidadão"
    },
    {
      "jp": "市場",
      "romaji": "ichiba",
      "pt": "mercado"
    }
  ]
},
{
  "id": "j_n4_yaku",
  "category": "kanji",
  "focus": "役",
  "jp": "役",
  "romaji": "yaku",
  "pt": "função / serviço público",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. 役 é função, papel, serviço. Em 市役所 vira prefeitura.",
  "chars": [
    "役"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "役 é função, papel, serviço. Em 市役所 vira prefeitura.",
  "onyomi": "ヤク, エキ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "市役所",
      "romaji": "shiyakusho",
      "pt": "prefeitura"
    },
    {
      "jp": "役に立つ",
      "romaji": "yaku ni tatsu",
      "pt": "ser útil"
    },
    {
      "jp": "役所",
      "romaji": "yakusho",
      "pt": "repartição pública"
    }
  ]
},
{
  "id": "j_n4_sho_place",
  "category": "kanji",
  "focus": "所",
  "jp": "所",
  "romaji": "sho / tokoro",
  "pt": "lugar",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. Kanji de lugar oficial, endereço e repartição.",
  "chars": [
    "所"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "Kanji de lugar oficial, endereço e repartição.",
  "onyomi": "ショ",
  "kunyomi": "ところ",
  "strokes": "8",
  "examples": [
    {
      "jp": "住所",
      "romaji": "juusho",
      "pt": "endereço"
    },
    {
      "jp": "場所",
      "romaji": "basho",
      "pt": "lugar"
    },
    {
      "jp": "市役所",
      "romaji": "shiyakusho",
      "pt": "prefeitura"
    }
  ]
},
{
  "id": "j_n4_juu",
  "category": "kanji",
  "focus": "住",
  "jp": "住",
  "romaji": "juu / sumu",
  "pt": "morar",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. Morar é uma das bases da vida adulta no Japão.",
  "chars": [
    "住"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "Morar é uma das bases da vida adulta no Japão.",
  "onyomi": "ジュウ",
  "kunyomi": "す",
  "strokes": "7",
  "examples": [
    {
      "jp": "住所",
      "romaji": "juusho",
      "pt": "endereço"
    },
    {
      "jp": "住む",
      "romaji": "sumu",
      "pt": "morar"
    },
    {
      "jp": "住民票",
      "romaji": "juuminhyou",
      "pt": "atestado de residência"
    }
  ]
},
{
  "id": "j_n4_min",
  "category": "kanji",
  "focus": "民",
  "jp": "民",
  "romaji": "min / tami",
  "pt": "povo / cidadão",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. Kanji de cidadão, usado em documentos da prefeitura.",
  "chars": [
    "民"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "Kanji de cidadão, usado em documentos da prefeitura.",
  "onyomi": "ミン",
  "kunyomi": "たみ",
  "strokes": "5",
  "examples": [
    {
      "jp": "住民票",
      "romaji": "juuminhyou",
      "pt": "atestado de residência"
    },
    {
      "jp": "市民",
      "romaji": "shimin",
      "pt": "cidadão"
    },
    {
      "jp": "国民",
      "romaji": "kokumin",
      "pt": "cidadão nacional"
    }
  ]
},
{
  "id": "j_n4_hyou",
  "category": "kanji",
  "focus": "票",
  "jp": "票",
  "romaji": "hyou",
  "pt": "registro / cédula",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. 票 é papel oficial, voto ou registro.",
  "chars": [
    "票"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "票 é papel oficial, voto ou registro.",
  "onyomi": "ヒョウ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "住民票",
      "romaji": "juuminhyou",
      "pt": "atestado de residência"
    },
    {
      "jp": "投票",
      "romaji": "touhyou",
      "pt": "votação"
    },
    {
      "jp": "伝票",
      "romaji": "denpyou",
      "pt": "comprovante / nota interna"
    }
  ]
},
{
  "id": "j_n4_todoke",
  "category": "kanji",
  "focus": "届",
  "jp": "届",
  "romaji": "todoku / todokeru",
  "pt": "entregar / notificar",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. Kanji dos formulários que precisam ser entregues.",
  "chars": [
    "届"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "Kanji dos formulários que precisam ser entregues.",
  "onyomi": "カイ",
  "kunyomi": "とど",
  "strokes": "8",
  "examples": [
    {
      "jp": "届く",
      "romaji": "todoku",
      "pt": "chegar"
    },
    {
      "jp": "届ける",
      "romaji": "todokeru",
      "pt": "entregar / notificar"
    },
    {
      "jp": "転入届",
      "romaji": "tennyuu todoke",
      "pt": "notificação de mudança de entrada"
    }
  ]
},
{
  "id": "j_n4_inkan",
  "category": "kanji",
  "focus": "印",
  "jp": "印",
  "romaji": "in / shirushi",
  "pt": "selo / marca",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. 印 é marca, carimbo, sinal de documento.",
  "chars": [
    "印"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "印 é marca, carimbo, sinal de documento.",
  "onyomi": "イン",
  "kunyomi": "しるし",
  "strokes": "6",
  "examples": [
    {
      "jp": "印鑑",
      "romaji": "inkan",
      "pt": "carimbo pessoal"
    },
    {
      "jp": "印刷",
      "romaji": "insatsu",
      "pt": "impressão"
    },
    {
      "jp": "目印",
      "romaji": "mejirushi",
      "pt": "marca / referência"
    }
  ]
},
{
  "id": "j_n4_kei",
  "category": "kanji",
  "focus": "契",
  "jp": "契",
  "romaji": "kei",
  "pt": "contrato / promessa formal",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. Contrato é promessa com peso de papel.",
  "chars": [
    "契"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "Contrato é promessa com peso de papel.",
  "onyomi": "ケイ",
  "kunyomi": "ちぎ",
  "strokes": "9",
  "examples": [
    {
      "jp": "契約",
      "romaji": "keiyaku",
      "pt": "contrato"
    },
    {
      "jp": "契約書",
      "romaji": "keiyakusho",
      "pt": "contrato escrito"
    },
    {
      "jp": "契機",
      "romaji": "keiki",
      "pt": "oportunidade / gatilho"
    }
  ]
},
{
  "id": "j_n4_yaku_contract",
  "category": "kanji",
  "focus": "約",
  "jp": "約",
  "romaji": "yaku",
  "pt": "promessa / aproximadamente",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. 約 aparece em contrato, reserva e promessa.",
  "chars": [
    "約"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "約 aparece em contrato, reserva e promessa.",
  "onyomi": "ヤク",
  "kunyomi": "つづ",
  "strokes": "9",
  "examples": [
    {
      "jp": "契約",
      "romaji": "keiyaku",
      "pt": "contrato"
    },
    {
      "jp": "予約",
      "romaji": "yoyaku",
      "pt": "reserva"
    },
    {
      "jp": "約束",
      "romaji": "yakusoku",
      "pt": "promessa / compromisso"
    }
  ]
},
{
  "id": "j_n4_kaku",
  "category": "kanji",
  "focus": "確",
  "jp": "確",
  "romaji": "kaku / tashika",
  "pt": "confirmar / certo",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. Confirmar é fechar a dúvida: 確.",
  "chars": [
    "確"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "Confirmar é fechar a dúvida: 確.",
  "onyomi": "カク",
  "kunyomi": "たし",
  "strokes": "15",
  "examples": [
    {
      "jp": "確認",
      "romaji": "kakunin",
      "pt": "confirmação"
    },
    {
      "jp": "確か",
      "romaji": "tashika",
      "pt": "certamente / se não me engano"
    },
    {
      "jp": "正確",
      "romaji": "seikaku",
      "pt": "exato"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "確認",
    "jp": "この内容を確認してもらえますか。",
    "pt": "Você pode verificar este conteúdo para mim?",
    "note": "確認 = confirmação/verificação"
  },
  {
    "type": "kunyomi",
    "word": "確か",
    "jp": "確か、書類は事務所にあります。",
    "pt": "Se não me engano, os documentos estão no escritório.",
    "note": "確か = se não me engano"
  },
  {
    "type": "onyomi",
    "word": "正確",
    "jp": "正確な時間を教えてください。",
    "pt": "Por favor, me informe o horário exato.",
    "note": "正確 = exato"
  }
]
},
{
  "id": "j_n4_nin",
  "category": "kanji",
  "focus": "認",
  "jp": "認",
  "romaji": "nin / mitomeru",
  "pt": "reconhecer / confirmar",
  "type": "kanji",
  "hint": "N4 vida real · prefeitura e documentos. 認 é reconhecer oficialmente algo.",
  "chars": [
    "認"
  ],
  "jlpt": "N4",
  "group": "prefeitura e documentos",
  "memo": "認 é reconhecer oficialmente algo.",
  "onyomi": "ニン",
  "kunyomi": "みと",
  "strokes": "14",
  "examples": [
    {
      "jp": "確認",
      "romaji": "kakunin",
      "pt": "confirmação"
    },
    {
      "jp": "認める",
      "romaji": "mitomeru",
      "pt": "reconhecer / admitir"
    },
    {
      "jp": "承認",
      "romaji": "shounin",
      "pt": "aprovação"
    }
  ]
},
{
  "id": "j_n4_gin",
  "category": "kanji",
  "focus": "銀",
  "jp": "銀",
  "romaji": "gin",
  "pt": "prata / banco",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. 銀 aparece em 銀行: lugar do dinheiro.",
  "chars": [
    "銀"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "銀 aparece em 銀行: lugar do dinheiro.",
  "onyomi": "ギン",
  "kunyomi": "",
  "strokes": "14",
  "examples": [
    {
      "jp": "銀行",
      "romaji": "ginkou",
      "pt": "banco"
    },
    {
      "jp": "銀",
      "romaji": "gin",
      "pt": "prata"
    },
    {
      "jp": "銀色",
      "romaji": "giniro",
      "pt": "cor prata"
    }
  ]
},
{
  "id": "j_n4_harai",
  "category": "kanji",
  "focus": "払",
  "jp": "払",
  "romaji": "harau",
  "pt": "pagar",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. Kanji de pagar no konbini, app, boleto e conta.",
  "chars": [
    "払"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "Kanji de pagar no konbini, app, boleto e conta.",
  "onyomi": "フツ",
  "kunyomi": "はら",
  "strokes": "5",
  "examples": [
    {
      "jp": "払う",
      "romaji": "harau",
      "pt": "pagar"
    },
    {
      "jp": "支払い",
      "romaji": "shiharai",
      "pt": "pagamento"
    },
    {
      "jp": "前払い",
      "romaji": "maebarai",
      "pt": "pagamento antecipado"
    }
  ]
},
{
  "id": "j_n4_shi_pay",
  "category": "kanji",
  "focus": "支",
  "jp": "支",
  "romaji": "shi / sasaeru",
  "pt": "apoiar / pagar",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. 支 aparece em 支払い: sustentar o pagamento.",
  "chars": [
    "支"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "支 aparece em 支払い: sustentar o pagamento.",
  "onyomi": "シ",
  "kunyomi": "ささ",
  "strokes": "4",
  "examples": [
    {
      "jp": "支払い",
      "romaji": "shiharai",
      "pt": "pagamento"
    },
    {
      "jp": "支店",
      "romaji": "shiten",
      "pt": "filial"
    },
    {
      "jp": "支える",
      "romaji": "sasaeru",
      "pt": "apoiar"
    }
  ]
},
{
  "id": "j_n4_yen_ryou",
  "category": "kanji",
  "focus": "費",
  "jp": "費",
  "romaji": "hi",
  "pt": "custo / despesa",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. Kanji de despesa: aquilo que sai do bolso.",
  "chars": [
    "費"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "Kanji de despesa: aquilo que sai do bolso.",
  "onyomi": "ヒ",
  "kunyomi": "つい",
  "strokes": "12",
  "examples": [
    {
      "jp": "生活費",
      "romaji": "seikatsuhi",
      "pt": "custo de vida"
    },
    {
      "jp": "交通費",
      "romaji": "koutsuuhi",
      "pt": "gasto de transporte"
    },
    {
      "jp": "費用",
      "romaji": "hiyou",
      "pt": "despesa / custo"
    }
  ]
},
{
  "id": "j_n4_you",
  "category": "kanji",
  "focus": "用",
  "jp": "用",
  "romaji": "you",
  "pt": "uso / assunto",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. 用 é uso, utilidade e necessidade.",
  "chars": [
    "用"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "用 é uso, utilidade e necessidade.",
  "onyomi": "ヨウ",
  "kunyomi": "もち",
  "strokes": "5",
  "examples": [
    {
      "jp": "用事",
      "romaji": "youji",
      "pt": "compromisso / assunto"
    },
    {
      "jp": "使用",
      "romaji": "shiyou",
      "pt": "uso"
    },
    {
      "jp": "必要",
      "romaji": "hitsuyou",
      "pt": "necessário"
    }
  ]
},
{
  "id": "j_n4_hitsu",
  "category": "kanji",
  "focus": "必",
  "jp": "必",
  "romaji": "hitsu",
  "pt": "necessário / certamente",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. Kanji de algo que não dá para ignorar.",
  "chars": [
    "必"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "Kanji de algo que não dá para ignorar.",
  "onyomi": "ヒツ",
  "kunyomi": "かなら",
  "strokes": "5",
  "examples": [
    {
      "jp": "必要",
      "romaji": "hitsuyou",
      "pt": "necessário"
    },
    {
      "jp": "必ず",
      "romaji": "kanarazu",
      "pt": "certamente / sem falta"
    },
    {
      "jp": "必死",
      "romaji": "hisshi",
      "pt": "desesperado / com tudo"
    }
  ]
},
{
  "id": "j_n4_setsuyaku",
  "category": "kanji",
  "focus": "節",
  "jp": "節",
  "romaji": "setsu / fushi",
  "pt": "economia / seção",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. 節約 é economizar: palavra de sobrevivência no Japão.",
  "chars": [
    "節"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "節約 é economizar: palavra de sobrevivência no Japão.",
  "onyomi": "セツ, セチ",
  "kunyomi": "ふし",
  "strokes": "13",
  "examples": [
    {
      "jp": "節約",
      "romaji": "setsuyaku",
      "pt": "economia / poupar"
    },
    {
      "jp": "季節",
      "romaji": "kisetsu",
      "pt": "estação do ano"
    },
    {
      "jp": "関節",
      "romaji": "kansetsu",
      "pt": "articulação"
    }
  ]
},
{
  "id": "j_n4_zei",
  "category": "kanji",
  "focus": "税",
  "jp": "税",
  "romaji": "zei",
  "pt": "imposto",
  "type": "kanji",
  "hint": "N4 vida real · dinheiro e serviços. Kanji de imposto, inevitável na vida adulta.",
  "chars": [
    "税"
  ],
  "jlpt": "N4",
  "group": "dinheiro e serviços",
  "memo": "Kanji de imposto, inevitável na vida adulta.",
  "onyomi": "ゼイ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "税金",
      "romaji": "zeikin",
      "pt": "imposto"
    },
    {
      "jp": "消費税",
      "romaji": "shouhizei",
      "pt": "imposto de consumo"
    },
    {
      "jp": "免税",
      "romaji": "menzei",
      "pt": "isento de imposto"
    }
  ]
},
{
  "id": "j_n4_itai",
  "category": "kanji",
  "focus": "痛",
  "jp": "痛",
  "romaji": "itai / tsuu",
  "pt": "dor",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Dor precisa ser explicada com clareza no Japão.",
  "chars": [
    "痛"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Dor precisa ser explicada com clareza no Japão.",
  "onyomi": "ツウ",
  "kunyomi": "いた",
  "strokes": "12",
  "examples": [
    {
      "jp": "痛い",
      "romaji": "itai",
      "pt": "dói"
    },
    {
      "jp": "頭痛",
      "romaji": "zutsuu",
      "pt": "dor de cabeça"
    },
    {
      "jp": "腹痛",
      "romaji": "fukutsuu",
      "pt": "dor de barriga"
    }
  ]
},
{
  "id": "j_n4_netsu",
  "category": "kanji",
  "focus": "熱",
  "jp": "熱",
  "romaji": "netsu / atsui",
  "pt": "febre / calor",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Kanji de febre e calor forte.",
  "chars": [
    "熱"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Kanji de febre e calor forte.",
  "onyomi": "ネツ",
  "kunyomi": "あつ",
  "strokes": "15",
  "examples": [
    {
      "jp": "熱",
      "romaji": "netsu",
      "pt": "febre"
    },
    {
      "jp": "発熱",
      "romaji": "hatsunetsu",
      "pt": "febre"
    },
    {
      "jp": "熱い",
      "romaji": "atsui",
      "pt": "quente ao toque"
    }
  ]
},
{
  "id": "j_n4_atama",
  "category": "kanji",
  "focus": "頭",
  "jp": "頭",
  "romaji": "atama / tou",
  "pt": "cabeça",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Cabeça aparece em dor, pensamento e início.",
  "chars": [
    "頭"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Cabeça aparece em dor, pensamento e início.",
  "onyomi": "トウ, ズ",
  "kunyomi": "あたま",
  "strokes": "16",
  "examples": [
    {
      "jp": "頭",
      "romaji": "atama",
      "pt": "cabeça"
    },
    {
      "jp": "頭痛",
      "romaji": "zutsuu",
      "pt": "dor de cabeça"
    },
    {
      "jp": "先頭",
      "romaji": "sentou",
      "pt": "início / frente"
    }
  ]
},
{
  "id": "j_n4_kubi",
  "category": "kanji",
  "focus": "首",
  "jp": "首",
  "romaji": "kubi / shu",
  "pt": "pescoço",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Muito útil para explicar dor no corpo.",
  "chars": [
    "首"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Muito útil para explicar dor no corpo.",
  "onyomi": "シュ",
  "kunyomi": "くび",
  "strokes": "9",
  "examples": [
    {
      "jp": "首",
      "romaji": "kubi",
      "pt": "pescoço"
    },
    {
      "jp": "首都",
      "romaji": "shuto",
      "pt": "capital"
    },
    {
      "jp": "手首",
      "romaji": "tekubi",
      "pt": "pulso"
    }
  ]
},
{
  "id": "j_n4_ha_tooth",
  "category": "kanji",
  "focus": "歯",
  "jp": "歯",
  "romaji": "ha / shi",
  "pt": "dente",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Dentista no Japão começa por este kanji.",
  "chars": [
    "歯"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Dentista no Japão começa por este kanji.",
  "onyomi": "シ",
  "kunyomi": "は",
  "strokes": "12",
  "examples": [
    {
      "jp": "歯",
      "romaji": "ha",
      "pt": "dente"
    },
    {
      "jp": "歯医者",
      "romaji": "haisha",
      "pt": "dentista"
    },
    {
      "jp": "虫歯",
      "romaji": "mushiba",
      "pt": "cárie"
    }
  ]
},
{
  "id": "j_n4_isha",
  "category": "kanji",
  "focus": "医",
  "jp": "医",
  "romaji": "i",
  "pt": "medicina / médico",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Kanji de médico, hospital e área médica.",
  "chars": [
    "医"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Kanji de médico, hospital e área médica.",
  "onyomi": "イ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "医者",
      "romaji": "isha",
      "pt": "médico"
    },
    {
      "jp": "医学",
      "romaji": "igaku",
      "pt": "medicina"
    },
    {
      "jp": "歯医者",
      "romaji": "haisha",
      "pt": "dentista"
    }
  ]
},
{
  "id": "j_n4_sha_person",
  "category": "kanji",
  "focus": "者",
  "jp": "者",
  "romaji": "sha / mono",
  "pt": "pessoa ligada a algo",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Pessoa de uma função: médico, trabalhador, responsável.",
  "chars": [
    "者"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Pessoa de uma função: médico, trabalhador, responsável.",
  "onyomi": "シャ",
  "kunyomi": "もの",
  "strokes": "8",
  "examples": [
    {
      "jp": "医者",
      "romaji": "isha",
      "pt": "médico"
    },
    {
      "jp": "若者",
      "romaji": "wakamono",
      "pt": "jovem"
    },
    {
      "jp": "担当者",
      "romaji": "tantousha",
      "pt": "responsável / encarregado"
    }
  ]
},
{
  "id": "j_n4_kenko",
  "category": "kanji",
  "focus": "健",
  "jp": "健",
  "romaji": "ken / sukoyaka",
  "pt": "saudável",
  "type": "kanji",
  "hint": "N4 vida real · saúde e emergência. Saúde não é luxo, é ferramenta de sobrevivência.",
  "chars": [
    "健"
  ],
  "jlpt": "N4",
  "group": "saúde e emergência",
  "memo": "Saúde não é luxo, é ferramenta de sobrevivência.",
  "onyomi": "ケン",
  "kunyomi": "すこ",
  "strokes": "11",
  "examples": [
    {
      "jp": "健康",
      "romaji": "kenkou",
      "pt": "saúde"
    },
    {
      "jp": "健診",
      "romaji": "kenshin",
      "pt": "exame de saúde"
    },
    {
      "jp": "健全",
      "romaji": "kenzen",
      "pt": "saudável / íntegro"
    }
  ]
},
{
  "id": "j_n4_ren",
  "category": "kanji",
  "focus": "連",
  "jp": "連",
  "romaji": "ren / tsureru",
  "pt": "conectar / levar junto",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. 連 é conexão: aviso, contato, ligação.",
  "chars": [
    "連"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "連 é conexão: aviso, contato, ligação.",
  "onyomi": "レン",
  "kunyomi": "つ",
  "strokes": "10",
  "examples": [
    {
      "jp": "連絡",
      "romaji": "renraku",
      "pt": "contato / aviso"
    },
    {
      "jp": "連れて行く",
      "romaji": "tsurete iku",
      "pt": "levar alguém"
    },
    {
      "jp": "連休",
      "romaji": "renkyuu",
      "pt": "feriado prolongado"
    }
  ]
},
{
  "id": "j_n4_raku_contact",
  "category": "kanji",
  "focus": "絡",
  "jp": "絡",
  "romaji": "raku / karamu",
  "pt": "envolver / conectar",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. Junto de 連 vira contato: 連絡.",
  "chars": [
    "絡"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "Junto de 連 vira contato: 連絡.",
  "onyomi": "ラク",
  "kunyomi": "から",
  "strokes": "12",
  "examples": [
    {
      "jp": "連絡",
      "romaji": "renraku",
      "pt": "contato / aviso"
    },
    {
      "jp": "絡む",
      "romaji": "karamu",
      "pt": "enroscar / envolver-se"
    },
    {
      "jp": "連絡先",
      "romaji": "renrakusaki",
      "pt": "contato"
    }
  ]
},
{
  "id": "j_n4_soudan_sou",
  "category": "kanji",
  "focus": "相",
  "jp": "相",
  "romaji": "sou / ai",
  "pt": "mútuo / aparência",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. Em 相談, duas partes se encaram para resolver.",
  "chars": [
    "相"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "Em 相談, duas partes se encaram para resolver.",
  "onyomi": "ソウ, ショウ",
  "kunyomi": "あい",
  "strokes": "9",
  "examples": [
    {
      "jp": "相談",
      "romaji": "soudan",
      "pt": "consulta / pedir conselho"
    },
    {
      "jp": "相手",
      "romaji": "aite",
      "pt": "a outra pessoa"
    },
    {
      "jp": "相当",
      "romaji": "soutou",
      "pt": "consideravelmente"
    }
  ]
},
{
  "id": "j_n4_dan",
  "category": "kanji",
  "focus": "談",
  "jp": "談",
  "romaji": "dan",
  "pt": "conversa / discussão",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. Falar para resolver: 相談.",
  "chars": [
    "談"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "Falar para resolver: 相談.",
  "onyomi": "ダン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "相談",
      "romaji": "soudan",
      "pt": "consulta / conversa"
    },
    {
      "jp": "雑談",
      "romaji": "zatsudan",
      "pt": "bate-papo"
    },
    {
      "jp": "面談",
      "romaji": "mendan",
      "pt": "entrevista / conversa formal"
    }
  ]
},
{
  "id": "j_n4_setsumei_mei",
  "category": "kanji",
  "focus": "明",
  "jp": "明",
  "romaji": "mei / akarui",
  "pt": "claro / explicar",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. Explicar é acender luz na confusão.",
  "chars": [
    "明"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "Explicar é acender luz na confusão.",
  "onyomi": "メイ, ミョウ",
  "kunyomi": "あか",
  "strokes": "8",
  "examples": [
    {
      "jp": "説明",
      "romaji": "setsumei",
      "pt": "explicação"
    },
    {
      "jp": "明るい",
      "romaji": "akarui",
      "pt": "claro / alegre"
    },
    {
      "jp": "明日",
      "romaji": "ashita",
      "pt": "amanhã"
    }
  ]
},
{
  "id": "j_n4_wakaru_ri",
  "category": "kanji",
  "focus": "理",
  "jp": "理",
  "romaji": "ri",
  "pt": "razão / lógica",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. 理 é a lógica por trás das coisas.",
  "chars": [
    "理"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "理 é a lógica por trás das coisas.",
  "onyomi": "リ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "理由",
      "romaji": "riyuu",
      "pt": "motivo / razão"
    },
    {
      "jp": "料理",
      "romaji": "ryouri",
      "pt": "culinária"
    },
    {
      "jp": "無理",
      "romaji": "muri",
      "pt": "impossível / forçado"
    }
  ]
},
{
  "id": "j_n4_yuu_reason",
  "category": "kanji",
  "focus": "由",
  "jp": "由",
  "romaji": "yuu / yoshi",
  "pt": "razão / origem",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. Motivo tem raiz: 理由.",
  "chars": [
    "由"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "Motivo tem raiz: 理由.",
  "onyomi": "ユ, ユウ",
  "kunyomi": "よし",
  "strokes": "5",
  "examples": [
    {
      "jp": "理由",
      "romaji": "riyuu",
      "pt": "motivo / razão"
    },
    {
      "jp": "自由",
      "romaji": "jiyuu",
      "pt": "liberdade"
    },
    {
      "jp": "由来",
      "romaji": "yurai",
      "pt": "origem"
    }
  ]
},
{
  "id": "j_n4_komaru",
  "category": "kanji",
  "focus": "困",
  "jp": "困",
  "romaji": "komaru / kon",
  "pt": "problema / dificuldade",
  "type": "kanji",
  "hint": "N4 vida real · comunicação e convivência. Kanji de estar cercado pelo problema.",
  "chars": [
    "困"
  ],
  "jlpt": "N4",
  "group": "comunicação e convivência",
  "memo": "Kanji de estar cercado pelo problema.",
  "onyomi": "コン",
  "kunyomi": "こま",
  "strokes": "7",
  "examples": [
    {
      "jp": "困る",
      "romaji": "komaru",
      "pt": "ficar em apuros"
    },
    {
      "jp": "困っています",
      "romaji": "komatte imasu",
      "pt": "estou com problema"
    },
    {
      "jp": "困難",
      "romaji": "konnan",
      "pt": "dificuldade"
    }
  ]
},
{
  "id": "j_n4_ya_house",
  "category": "kanji",
  "focus": "屋",
  "jp": "屋",
  "romaji": "ya",
  "pt": "loja / telhado",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. 屋 aparece em loja e lugar coberto.",
  "chars": [
    "屋"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "屋 aparece em loja e lugar coberto.",
  "onyomi": "オク",
  "kunyomi": "や",
  "strokes": "9",
  "examples": [
    {
      "jp": "部屋",
      "romaji": "heya",
      "pt": "quarto"
    },
    {
      "jp": "本屋",
      "romaji": "honya",
      "pt": "livraria"
    },
    {
      "jp": "八百屋",
      "romaji": "yaoya",
      "pt": "quitanda"
    }
  ]
},
{
  "id": "j_n4_heya_bu",
  "category": "kanji",
  "focus": "部",
  "jp": "部",
  "romaji": "bu",
  "pt": "parte / seção",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. Parte de algo: quarto, setor, departamento.",
  "chars": [
    "部"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "Parte de algo: quarto, setor, departamento.",
  "onyomi": "ブ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "部屋",
      "romaji": "heya",
      "pt": "quarto"
    },
    {
      "jp": "全部",
      "romaji": "zenbu",
      "pt": "tudo"
    },
    {
      "jp": "部品",
      "romaji": "buhin",
      "pt": "peça"
    }
  ]
},
{
  "id": "j_n4_hin",
  "category": "kanji",
  "focus": "品",
  "jp": "品",
  "romaji": "hin / shina",
  "pt": "produto / qualidade",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. Produtos, peças e qualidade estão neste kanji.",
  "chars": [
    "品"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "Produtos, peças e qualidade estão neste kanji.",
  "onyomi": "ヒン",
  "kunyomi": "しな",
  "strokes": "9",
  "examples": [
    {
      "jp": "商品",
      "romaji": "shouhin",
      "pt": "produto"
    },
    {
      "jp": "部品",
      "romaji": "buhin",
      "pt": "peça"
    },
    {
      "jp": "品質",
      "romaji": "hinshitsu",
      "pt": "qualidade"
    }
  ]
},
{
  "id": "j_n4_shou_product",
  "category": "kanji",
  "focus": "商",
  "jp": "商",
  "romaji": "shou",
  "pt": "comércio",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. Kanji de produto e comércio.",
  "chars": [
    "商"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "Kanji de produto e comércio.",
  "onyomi": "ショウ",
  "kunyomi": "あきな",
  "strokes": "11",
  "examples": [
    {
      "jp": "商品",
      "romaji": "shouhin",
      "pt": "produto"
    },
    {
      "jp": "商店",
      "romaji": "shouten",
      "pt": "loja"
    },
    {
      "jp": "商売",
      "romaji": "shoubai",
      "pt": "negócio / comércio"
    }
  ]
},
{
  "id": "j_n4_bai_sell",
  "category": "kanji",
  "focus": "売",
  "jp": "売",
  "romaji": "bai / uru",
  "pt": "vender",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. Vender, compra e promoção: aparece toda hora.",
  "chars": [
    "売"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "Vender, compra e promoção: aparece toda hora.",
  "onyomi": "バイ",
  "kunyomi": "う",
  "strokes": "7",
  "examples": [
    {
      "jp": "売る",
      "romaji": "uru",
      "pt": "vender"
    },
    {
      "jp": "売店",
      "romaji": "baiten",
      "pt": "quiosque / lojinha"
    },
    {
      "jp": "発売",
      "romaji": "hatsubai",
      "pt": "lançamento à venda"
    }
  ]
},
{
  "id": "j_n4_hatsu",
  "category": "kanji",
  "focus": "発",
  "jp": "発",
  "romaji": "hatsu",
  "pt": "partida / iniciar",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. Começo, partida, emissão, lançamento.",
  "chars": [
    "発"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "Começo, partida, emissão, lançamento.",
  "onyomi": "ハツ, ホツ",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "発売",
      "romaji": "hatsubai",
      "pt": "lançamento à venda"
    },
    {
      "jp": "出発",
      "romaji": "shuppatsu",
      "pt": "partida"
    },
    {
      "jp": "発熱",
      "romaji": "hatsunetsu",
      "pt": "febre"
    }
  ]
},
{
  "id": "j_n4_iro",
  "category": "kanji",
  "focus": "色",
  "jp": "色",
  "romaji": "iro / shoku",
  "pt": "cor",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. Cor aparece em produto, roupa e aviso visual.",
  "chars": [
    "色"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "Cor aparece em produto, roupa e aviso visual.",
  "onyomi": "ショク, シキ",
  "kunyomi": "いろ",
  "strokes": "6",
  "examples": [
    {
      "jp": "色",
      "romaji": "iro",
      "pt": "cor"
    },
    {
      "jp": "黄色",
      "romaji": "kiiro",
      "pt": "amarelo"
    },
    {
      "jp": "特色",
      "romaji": "tokushoku",
      "pt": "característica"
    }
  ]
},
{
  "id": "j_n4_fuku",
  "category": "kanji",
  "focus": "服",
  "jp": "服",
  "romaji": "fuku",
  "pt": "roupa",
  "type": "kanji",
  "hint": "N4 vida real · casa e consumo. Roupa de trabalho, uniforme, compra e clima.",
  "chars": [
    "服"
  ],
  "jlpt": "N4",
  "group": "casa e consumo",
  "memo": "Roupa de trabalho, uniforme, compra e clima.",
  "onyomi": "フク",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "服",
      "romaji": "fuku",
      "pt": "roupa"
    },
    {
      "jp": "制服",
      "romaji": "seifuku",
      "pt": "uniforme"
    },
    {
      "jp": "洋服",
      "romaji": "youfuku",
      "pt": "roupa ocidental"
    }
  ]
},
{
  "id": "j_n4_bun",
  "category": "kanji",
  "focus": "文",
  "jp": "文",
  "romaji": "bun / mon",
  "pt": "texto / frase",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. Texto começa em 文: frase, redação, aviso e conteúdo escrito.",
  "chars": [
    "文"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "Texto começa em 文: frase, redação, aviso e conteúdo escrito.",
  "onyomi": "ブン, モン",
  "kunyomi": "ふみ",
  "strokes": "4",
  "examples": [
    {
      "jp": "文章",
      "romaji": "bunshou",
      "pt": "texto / frase"
    },
    {
      "jp": "作文",
      "romaji": "sakubun",
      "pt": "redação"
    },
    {
      "jp": "文字",
      "romaji": "moji",
      "pt": "letra / caractere"
    }
  ]
},
{
  "id": "j_n4_ji_letter",
  "category": "kanji",
  "focus": "字",
  "jp": "字",
  "romaji": "ji",
  "pt": "letra / caractere",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. 字 é letra escrita, base de leitura e prova.",
  "chars": [
    "字"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "字 é letra escrita, base de leitura e prova.",
  "onyomi": "ジ",
  "kunyomi": "あざ",
  "strokes": "6",
  "examples": [
    {
      "jp": "漢字",
      "romaji": "kanji",
      "pt": "kanji"
    },
    {
      "jp": "文字",
      "romaji": "moji",
      "pt": "letra / caractere"
    },
    {
      "jp": "数字",
      "romaji": "suuji",
      "pt": "número / algarismo"
    }
  ]
},
{
  "id": "j_n4_i_meaning",
  "category": "kanji",
  "focus": "意",
  "jp": "意",
  "romaji": "i",
  "pt": "sentido / intenção",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. Interpretação exige 意: intenção, significado e atenção.",
  "chars": [
    "意"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "Interpretação exige 意: intenção, significado e atenção.",
  "onyomi": "イ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "意味",
      "romaji": "imi",
      "pt": "significado"
    },
    {
      "jp": "注意",
      "romaji": "chuui",
      "pt": "atenção / cuidado"
    },
    {
      "jp": "意見",
      "romaji": "iken",
      "pt": "opinião"
    }
  ]
},
{
  "id": "j_n4_mi_meaning",
  "category": "kanji",
  "focus": "味",
  "jp": "味",
  "romaji": "mi / aji",
  "pt": "sabor / sentido",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. Em 意味, 味 vira sabor do sentido: o gosto da palavra.",
  "chars": [
    "味"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "Em 意味, 味 vira sabor do sentido: o gosto da palavra.",
  "onyomi": "ミ",
  "kunyomi": "あじ",
  "strokes": "8",
  "examples": [
    {
      "jp": "意味",
      "romaji": "imi",
      "pt": "significado"
    },
    {
      "jp": "味",
      "romaji": "aji",
      "pt": "sabor"
    },
    {
      "jp": "味方",
      "romaji": "mikata",
      "pt": "aliado"
    }
  ]
},
{
  "id": "j_n4_chuu_attention",
  "category": "kanji",
  "focus": "注",
  "jp": "注",
  "romaji": "chuu / sosogu",
  "pt": "atenção / derramar",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. 注 aparece em 注意: o aviso pedindo seus olhos.",
  "chars": [
    "注"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "注 aparece em 注意: o aviso pedindo seus olhos.",
  "onyomi": "チュウ",
  "kunyomi": "そそ",
  "strokes": "8",
  "examples": [
    {
      "jp": "注意",
      "romaji": "chuui",
      "pt": "atenção / cuidado"
    },
    {
      "jp": "注文",
      "romaji": "chuumon",
      "pt": "pedido"
    },
    {
      "jp": "注射",
      "romaji": "chuusha",
      "pt": "injeção"
    }
  ]
},
{
  "id": "j_n4_mondai_mon",
  "category": "kanji",
  "focus": "問",
  "jp": "問",
  "romaji": "mon / tou",
  "pt": "pergunta / problema",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. Prova é feita de perguntas: 問.",
  "chars": [
    "問"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "Prova é feita de perguntas: 問.",
  "onyomi": "モン",
  "kunyomi": "と",
  "strokes": "11",
  "examples": [
    {
      "jp": "問題",
      "romaji": "mondai",
      "pt": "problema / questão"
    },
    {
      "jp": "質問",
      "romaji": "shitsumon",
      "pt": "pergunta"
    },
    {
      "jp": "問う",
      "romaji": "tou",
      "pt": "perguntar"
    }
  ]
},
{
  "id": "j_n4_dai_problem",
  "category": "kanji",
  "focus": "題",
  "jp": "題",
  "romaji": "dai",
  "pt": "tema / título / questão",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. 題 dá nome ao tema e aparece em 問題.",
  "chars": [
    "題"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "題 dá nome ao tema e aparece em 問題.",
  "onyomi": "ダイ",
  "kunyomi": "",
  "strokes": "18",
  "examples": [
    {
      "jp": "問題",
      "romaji": "mondai",
      "pt": "problema / questão"
    },
    {
      "jp": "宿題",
      "romaji": "shukudai",
      "pt": "lição de casa"
    },
    {
      "jp": "題名",
      "romaji": "daimei",
      "pt": "título"
    }
  ]
},
{
  "id": "j_n4_kotae",
  "category": "kanji",
  "focus": "答",
  "jp": "答",
  "romaji": "tou / kotaeru",
  "pt": "resposta",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. Pergunta sem resposta não fecha o ciclo da prova.",
  "chars": [
    "答"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "Pergunta sem resposta não fecha o ciclo da prova.",
  "onyomi": "トウ",
  "kunyomi": "こた",
  "strokes": "12",
  "examples": [
    {
      "jp": "答える",
      "romaji": "kotaeru",
      "pt": "responder"
    },
    {
      "jp": "答え",
      "romaji": "kotae",
      "pt": "resposta"
    },
    {
      "jp": "回答",
      "romaji": "kaitou",
      "pt": "resposta formal"
    }
  ]
},
{
  "id": "j_n4_kan",
  "category": "kanji",
  "focus": "漢",
  "jp": "漢",
  "romaji": "kan",
  "pt": "China / kanji",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. 漢 é o coração de 漢字: ideograma japonês de origem chinesa.",
  "chars": [
    "漢"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "漢 é o coração de 漢字: ideograma japonês de origem chinesa.",
  "onyomi": "カン",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "漢字",
      "romaji": "kanji",
      "pt": "kanji"
    },
    {
      "jp": "漢語",
      "romaji": "kango",
      "pt": "palavra sino-japonesa"
    },
    {
      "jp": "漢方",
      "romaji": "kanpou",
      "pt": "medicina chinesa"
    }
  ]
},
{
  "id": "j_n4_shiraberu",
  "category": "kanji",
  "focus": "調",
  "jp": "調",
  "romaji": "chou / shiraberu",
  "pt": "investigar / ajustar",
  "type": "kanji",
  "hint": "N4 prova + interpretação · interpretação de texto. Na prova e na vida, 調べる é investigar até entender.",
  "chars": [
    "調"
  ],
  "jlpt": "N4",
  "group": "interpretação de texto",
  "memo": "Na prova e na vida, 調べる é investigar até entender.",
  "onyomi": "チョウ",
  "kunyomi": "しら, ととの",
  "strokes": "15",
  "examples": [
    {
      "jp": "調べる",
      "romaji": "shiraberu",
      "pt": "investigar / verificar"
    },
    {
      "jp": "調整",
      "romaji": "chousei",
      "pt": "ajuste"
    },
    {
      "jp": "体調",
      "romaji": "taichou",
      "pt": "condição física"
    }
  ]
},
{
  "id": "j_n4_betsu",
  "category": "kanji",
  "focus": "別",
  "jp": "別",
  "romaji": "betsu / wakareru",
  "pt": "separar / diferente",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. 別 ajuda a distinguir opções, contraste e exceção.",
  "chars": [
    "別"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "別 ajuda a distinguir opções, contraste e exceção.",
  "onyomi": "ベツ",
  "kunyomi": "わか",
  "strokes": "7",
  "examples": [
    {
      "jp": "別々",
      "romaji": "betsubetsu",
      "pt": "separadamente"
    },
    {
      "jp": "特別",
      "romaji": "tokubetsu",
      "pt": "especial"
    },
    {
      "jp": "別れる",
      "romaji": "wakareru",
      "pt": "se separar"
    }
  ]
},
{
  "id": "j_n4_onaji",
  "category": "kanji",
  "focus": "同",
  "jp": "同",
  "romaji": "dou / onaji",
  "pt": "mesmo / igual",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. Em texto, 同 indica igualdade e referência ao mesmo assunto.",
  "chars": [
    "同"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "Em texto, 同 indica igualdade e referência ao mesmo assunto.",
  "onyomi": "ドウ",
  "kunyomi": "おな",
  "strokes": "6",
  "examples": [
    {
      "jp": "同じ",
      "romaji": "onaji",
      "pt": "mesmo / igual"
    },
    {
      "jp": "同時",
      "romaji": "douji",
      "pt": "ao mesmo tempo"
    },
    {
      "jp": "同僚",
      "romaji": "douryou",
      "pt": "colega de trabalho"
    }
  ]
},
{
  "id": "j_n4_tokubetsu",
  "category": "kanji",
  "focus": "特",
  "jp": "特",
  "romaji": "toku",
  "pt": "especial / característica",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. 特 marca algo especial, específico ou característico.",
  "chars": [
    "特"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "特 marca algo especial, específico ou característico.",
  "onyomi": "トク",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "特別",
      "romaji": "tokubetsu",
      "pt": "especial"
    },
    {
      "jp": "特徴",
      "romaji": "tokuchou",
      "pt": "característica"
    },
    {
      "jp": "特急",
      "romaji": "tokkyuu",
      "pt": "expresso especial"
    }
  ]
},
{
  "id": "j_n4_hoka",
  "category": "kanji",
  "focus": "他",
  "jp": "他",
  "romaji": "ta / hoka",
  "pt": "outro",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. 他 é o outro, muito usado para comparação e alternativas.",
  "chars": [
    "他"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "他 é o outro, muito usado para comparação e alternativas.",
  "onyomi": "タ",
  "kunyomi": "ほか",
  "strokes": "5",
  "examples": [
    {
      "jp": "他",
      "romaji": "hoka",
      "pt": "outro"
    },
    {
      "jp": "その他",
      "romaji": "sono hoka",
      "pt": "além disso / outros"
    },
    {
      "jp": "他人",
      "romaji": "tanin",
      "pt": "outra pessoa"
    }
  ]
},
{
  "id": "j_n4_zen",
  "category": "kanji",
  "focus": "全",
  "jp": "全",
  "romaji": "zen / subete",
  "pt": "todo / completo",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. 全 dá ideia de totalidade: tudo, completo, inteiro.",
  "chars": [
    "全"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "全 dá ideia de totalidade: tudo, completo, inteiro.",
  "onyomi": "ゼン",
  "kunyomi": "すべ",
  "strokes": "6",
  "examples": [
    {
      "jp": "全部",
      "romaji": "zenbu",
      "pt": "tudo"
    },
    {
      "jp": "全然",
      "romaji": "zenzen",
      "pt": "de forma alguma / totalmente"
    },
    {
      "jp": "安全",
      "romaji": "anzen",
      "pt": "segurança"
    }
  ]
},
{
  "id": "j_n4_bu_part",
  "category": "kanji",
  "focus": "部",
  "jp": "部",
  "romaji": "bu",
  "pt": "parte / seção",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. 部 divide o todo em partes, setores e quartos.",
  "chars": [
    "部"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "部 divide o todo em partes, setores e quartos.",
  "onyomi": "ブ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "全部",
      "romaji": "zenbu",
      "pt": "tudo"
    },
    {
      "jp": "部分",
      "romaji": "bubun",
      "pt": "parte"
    },
    {
      "jp": "部屋",
      "romaji": "heya",
      "pt": "quarto"
    }
  ]
},
{
  "id": "j_n4_kaku_write",
  "category": "kanji",
  "focus": "各",
  "jp": "各",
  "romaji": "kaku",
  "pt": "cada",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. 各 é cada item, cada pessoa, cada setor.",
  "chars": [
    "各"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "各 é cada item, cada pessoa, cada setor.",
  "onyomi": "カク",
  "kunyomi": "おのおの",
  "strokes": "6",
  "examples": [
    {
      "jp": "各駅",
      "romaji": "kakueki",
      "pt": "cada estação"
    },
    {
      "jp": "各自",
      "romaji": "kakuji",
      "pt": "cada um"
    },
    {
      "jp": "各地",
      "romaji": "kakuchi",
      "pt": "cada região"
    }
  ]
},
{
  "id": "j_n4_hou_direction",
  "category": "kanji",
  "focus": "方",
  "jp": "方",
  "romaji": "hou / kata",
  "pt": "direção / modo / pessoa",
  "type": "kanji",
  "hint": "N4 prova + interpretação · gramática e nuance. 方 muda muito o sentido: direção, maneira e pessoa educada.",
  "chars": [
    "方"
  ],
  "jlpt": "N4",
  "group": "gramática e nuance",
  "memo": "方 muda muito o sentido: direção, maneira e pessoa educada.",
  "onyomi": "ホウ",
  "kunyomi": "かた",
  "strokes": "4",
  "examples": [
    {
      "jp": "方法",
      "romaji": "houhou",
      "pt": "método"
    },
    {
      "jp": "読み方",
      "romaji": "yomikata",
      "pt": "modo de ler"
    },
    {
      "jp": "あの方",
      "romaji": "ano kata",
      "pt": "aquela pessoa"
    }
  ]
},
{
  "id": "j_n4_asa",
  "category": "kanji",
  "focus": "朝",
  "jp": "朝",
  "romaji": "asa / chou",
  "pt": "manhã",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. Rotina de prova e trabalho começa de manhã.",
  "chars": [
    "朝"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "Rotina de prova e trabalho começa de manhã.",
  "onyomi": "チョウ",
  "kunyomi": "あさ",
  "strokes": "12",
  "examples": [
    {
      "jp": "朝",
      "romaji": "asa",
      "pt": "manhã"
    },
    {
      "jp": "朝食",
      "romaji": "choushoku",
      "pt": "café da manhã"
    },
    {
      "jp": "毎朝",
      "romaji": "maiasa",
      "pt": "todas as manhãs"
    }
  ]
},
{
  "id": "j_n4_hiru",
  "category": "kanji",
  "focus": "昼",
  "jp": "昼",
  "romaji": "hiru / chuu",
  "pt": "meio-dia / tarde",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. 昼 marca a metade clara do dia.",
  "chars": [
    "昼"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "昼 marca a metade clara do dia.",
  "onyomi": "チュウ",
  "kunyomi": "ひる",
  "strokes": "9",
  "examples": [
    {
      "jp": "昼",
      "romaji": "hiru",
      "pt": "meio-dia / tarde"
    },
    {
      "jp": "昼休み",
      "romaji": "hiruyasumi",
      "pt": "intervalo do almoço"
    },
    {
      "jp": "昼食",
      "romaji": "chuushoku",
      "pt": "almoço"
    }
  ]
},
{
  "id": "j_n4_yoru",
  "category": "kanji",
  "focus": "夜",
  "jp": "夜",
  "romaji": "yoru / ya",
  "pt": "noite",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. Noite de estudo, descanso ou turno.",
  "chars": [
    "夜"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "Noite de estudo, descanso ou turno.",
  "onyomi": "ヤ",
  "kunyomi": "よる, よ",
  "strokes": "8",
  "examples": [
    {
      "jp": "夜",
      "romaji": "yoru",
      "pt": "noite"
    },
    {
      "jp": "今夜",
      "romaji": "konya",
      "pt": "esta noite"
    },
    {
      "jp": "夜勤",
      "romaji": "yakin",
      "pt": "turno noturno"
    }
  ]
},
{
  "id": "j_n4_yuu",
  "category": "kanji",
  "focus": "夕",
  "jp": "夕",
  "romaji": "yuu",
  "pt": "fim da tarde",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. 夕 é o sol indo embora, perfeito para horários.",
  "chars": [
    "夕"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "夕 é o sol indo embora, perfeito para horários.",
  "onyomi": "セキ",
  "kunyomi": "ゆう",
  "strokes": "3",
  "examples": [
    {
      "jp": "夕方",
      "romaji": "yuugata",
      "pt": "fim da tarde"
    },
    {
      "jp": "夕食",
      "romaji": "yuushoku",
      "pt": "jantar"
    },
    {
      "jp": "夕日",
      "romaji": "yuuhi",
      "pt": "sol poente"
    }
  ]
},
{
  "id": "j_n4_shuu",
  "category": "kanji",
  "focus": "週",
  "jp": "週",
  "romaji": "shuu",
  "pt": "semana",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. Prova, trabalho e metas vivem em ciclos semanais.",
  "chars": [
    "週"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "Prova, trabalho e metas vivem em ciclos semanais.",
  "onyomi": "シュウ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "今週",
      "romaji": "konshuu",
      "pt": "esta semana"
    },
    {
      "jp": "来週",
      "romaji": "raishuu",
      "pt": "semana que vem"
    },
    {
      "jp": "毎週",
      "romaji": "maishuu",
      "pt": "toda semana"
    }
  ]
},
{
  "id": "j_n4_haru",
  "category": "kanji",
  "focus": "春",
  "jp": "春",
  "romaji": "haru / shun",
  "pt": "primavera",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. Estação das flores e início de muitos ciclos no Japão.",
  "chars": [
    "春"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "Estação das flores e início de muitos ciclos no Japão.",
  "onyomi": "シュン",
  "kunyomi": "はる",
  "strokes": "9",
  "examples": [
    {
      "jp": "春",
      "romaji": "haru",
      "pt": "primavera"
    },
    {
      "jp": "春休み",
      "romaji": "haruyasumi",
      "pt": "férias de primavera"
    },
    {
      "jp": "青春",
      "romaji": "seishun",
      "pt": "juventude"
    }
  ]
},
{
  "id": "j_n4_natsu",
  "category": "kanji",
  "focus": "夏",
  "jp": "夏",
  "romaji": "natsu / ka",
  "pt": "verão",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. Verão japonês pede leitura de avisos de calor e saúde.",
  "chars": [
    "夏"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "Verão japonês pede leitura de avisos de calor e saúde.",
  "onyomi": "カ, ゲ",
  "kunyomi": "なつ",
  "strokes": "10",
  "examples": [
    {
      "jp": "夏",
      "romaji": "natsu",
      "pt": "verão"
    },
    {
      "jp": "夏休み",
      "romaji": "natsuyasumi",
      "pt": "férias de verão"
    },
    {
      "jp": "真夏",
      "romaji": "manatsu",
      "pt": "alto verão"
    }
  ]
},
{
  "id": "j_n4_aki",
  "category": "kanji",
  "focus": "秋",
  "jp": "秋",
  "romaji": "aki / shuu",
  "pt": "outono",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. Outono aparece em calendário e conversa diária.",
  "chars": [
    "秋"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "Outono aparece em calendário e conversa diária.",
  "onyomi": "シュウ",
  "kunyomi": "あき",
  "strokes": "9",
  "examples": [
    {
      "jp": "秋",
      "romaji": "aki",
      "pt": "outono"
    },
    {
      "jp": "秋分",
      "romaji": "shuubun",
      "pt": "equinócio de outono"
    },
    {
      "jp": "秋祭り",
      "romaji": "akimatsuri",
      "pt": "festival de outono"
    }
  ]
},
{
  "id": "j_n4_fuyu",
  "category": "kanji",
  "focus": "冬",
  "jp": "冬",
  "romaji": "fuyu / tou",
  "pt": "inverno",
  "type": "kanji",
  "hint": "N4 prova + interpretação · tempo e rotina. Inverno japonês traz neve, aquecedor e avisos.",
  "chars": [
    "冬"
  ],
  "jlpt": "N4",
  "group": "tempo e rotina",
  "memo": "Inverno japonês traz neve, aquecedor e avisos.",
  "onyomi": "トウ",
  "kunyomi": "ふゆ",
  "strokes": "5",
  "examples": [
    {
      "jp": "冬",
      "romaji": "fuyu",
      "pt": "inverno"
    },
    {
      "jp": "冬休み",
      "romaji": "fuyuyasumi",
      "pt": "férias de inverno"
    },
    {
      "jp": "真冬",
      "romaji": "mafuyu",
      "pt": "meio do inverno"
    }
  ]
},
{
  "id": "j_n4_aruku",
  "category": "kanji",
  "focus": "歩",
  "jp": "歩",
  "romaji": "ho / aruku",
  "pt": "andar",
  "type": "kanji",
  "hint": "N4 prova + interpretação · movimento e transporte. 歩 é movimento humano, caminho, caminhada.",
  "chars": [
    "歩"
  ],
  "jlpt": "N4",
  "group": "movimento e transporte",
  "memo": "歩 é movimento humano, caminho, caminhada.",
  "onyomi": "ホ, ブ",
  "kunyomi": "ある, あゆ",
  "strokes": "8",
  "examples": [
    {
      "jp": "歩く",
      "romaji": "aruku",
      "pt": "andar"
    },
    {
      "jp": "徒歩",
      "romaji": "toho",
      "pt": "a pé"
    },
    {
      "jp": "散歩",
      "romaji": "sanpo",
      "pt": "passeio"
    }
  ]
},
{
  "id": "j_n4_hashiru",
  "category": "kanji",
  "focus": "走",
  "jp": "走",
  "romaji": "sou / hashiru",
  "pt": "correr",
  "type": "kanji",
  "hint": "N4 prova + interpretação · movimento e transporte. Correr em texto aparece em esporte, pressa e funcionamento.",
  "chars": [
    "走"
  ],
  "jlpt": "N4",
  "group": "movimento e transporte",
  "memo": "Correr em texto aparece em esporte, pressa e funcionamento.",
  "onyomi": "ソウ",
  "kunyomi": "はし",
  "strokes": "7",
  "examples": [
    {
      "jp": "走る",
      "romaji": "hashiru",
      "pt": "correr"
    },
    {
      "jp": "走行",
      "romaji": "soukou",
      "pt": "rodagem / tráfego"
    },
    {
      "jp": "競走",
      "romaji": "kyousou",
      "pt": "corrida"
    }
  ]
},
{
  "id": "j_n4_tomeru",
  "category": "kanji",
  "focus": "止",
  "jp": "止",
  "romaji": "shi / tomaru",
  "pt": "parar",
  "type": "kanji",
  "hint": "N4 prova + interpretação · movimento e transporte. Avisos de parada, proibição e interrupção.",
  "chars": [
    "止"
  ],
  "jlpt": "N4",
  "group": "movimento e transporte",
  "memo": "Avisos de parada, proibição e interrupção.",
  "onyomi": "シ",
  "kunyomi": "と",
  "strokes": "4",
  "examples": [
    {
      "jp": "止まる",
      "romaji": "tomaru",
      "pt": "parar"
    },
    {
      "jp": "中止",
      "romaji": "chuushi",
      "pt": "cancelamento"
    },
    {
      "jp": "禁止",
      "romaji": "kinshi",
      "pt": "proibido"
    }
  ]
},
{
  "id": "j_n4_noru",
  "category": "kanji",
  "focus": "乗",
  "jp": "乗",
  "romaji": "jou / noru",
  "pt": "embarcar / subir em veículo",
  "type": "kanji",
  "hint": "N4 prova + interpretação · movimento e transporte. Transporte no Japão depende deste kanji.",
  "chars": [
    "乗"
  ],
  "jlpt": "N4",
  "group": "movimento e transporte",
  "memo": "Transporte no Japão depende deste kanji.",
  "onyomi": "ジョウ",
  "kunyomi": "の",
  "strokes": "9",
  "examples": [
    {
      "jp": "乗る",
      "romaji": "noru",
      "pt": "embarcar"
    },
    {
      "jp": "乗り換え",
      "romaji": "norikae",
      "pt": "baldeação"
    },
    {
      "jp": "乗客",
      "romaji": "joukyaku",
      "pt": "passageiro"
    }
  ]
},
{
  "id": "j_n4_oriru",
  "category": "kanji",
  "focus": "降",
  "jp": "降",
  "romaji": "kou / oriru",
  "pt": "descer / cair",
  "type": "kanji",
  "hint": "N4 prova + interpretação · movimento e transporte. Descer do trem, chuva cair, turno baixar.",
  "chars": [
    "降"
  ],
  "jlpt": "N4",
  "group": "movimento e transporte",
  "memo": "Descer do trem, chuva cair, turno baixar.",
  "onyomi": "コウ",
  "kunyomi": "お, ふ",
  "strokes": "10",
  "examples": [
    {
      "jp": "降りる",
      "romaji": "oriru",
      "pt": "descer"
    },
    {
      "jp": "降る",
      "romaji": "furu",
      "pt": "cair chuva/neve"
    },
    {
      "jp": "以降",
      "romaji": "ikou",
      "pt": "a partir de"
    }
  ]
},
{
  "id": "j_n4_tsuku",
  "category": "kanji",
  "focus": "着",
  "jp": "着",
  "romaji": "chaku / tsuku",
  "pt": "chegar / vestir",
  "type": "kanji",
  "hint": "N4 prova + interpretação · movimento e transporte. Chegar no destino ou vestir roupa: contexto manda.",
  "chars": [
    "着"
  ],
  "jlpt": "N4",
  "group": "movimento e transporte",
  "memo": "Chegar no destino ou vestir roupa: contexto manda.",
  "onyomi": "チャク, ジャク",
  "kunyomi": "つ, き",
  "strokes": "12",
  "examples": [
    {
      "jp": "着く",
      "romaji": "tsuku",
      "pt": "chegar"
    },
    {
      "jp": "着る",
      "romaji": "kiru",
      "pt": "vestir"
    },
    {
      "jp": "到着",
      "romaji": "touchaku",
      "pt": "chegada"
    }
  ]
},
{
  "id": "j_n4_tsuuro",
  "category": "kanji",
  "focus": "通",
  "jp": "通",
  "romaji": "tsuu / tooru",
  "pt": "passar / comunicar",
  "type": "kanji",
  "hint": "N4 prova + interpretação · movimento e transporte. Rua, passagem, comunicação e rotina de trabalho.",
  "chars": [
    "通"
  ],
  "jlpt": "N4",
  "group": "movimento e transporte",
  "memo": "Rua, passagem, comunicação e rotina de trabalho.",
  "onyomi": "ツウ, ツ",
  "kunyomi": "とお, かよ",
  "strokes": "10",
  "examples": [
    {
      "jp": "通る",
      "romaji": "tooru",
      "pt": "passar"
    },
    {
      "jp": "通勤",
      "romaji": "tsuukin",
      "pt": "ida ao trabalho"
    },
    {
      "jp": "普通",
      "romaji": "futsuu",
      "pt": "normal / comum"
    }
  ]
},
{
  "id": "j_n4_warui",
  "category": "kanji",
  "focus": "悪",
  "jp": "悪",
  "romaji": "aku / warui",
  "pt": "ruim / mau",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Kanji de condição ruim, erro e sensação negativa.",
  "chars": [
    "悪"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Kanji de condição ruim, erro e sensação negativa.",
  "onyomi": "アク, オ",
  "kunyomi": "わる",
  "strokes": "11",
  "examples": [
    {
      "jp": "悪い",
      "romaji": "warui",
      "pt": "ruim"
    },
    {
      "jp": "最悪",
      "romaji": "saiaku",
      "pt": "péssimo"
    },
    {
      "jp": "悪口",
      "romaji": "waruguchi",
      "pt": "maledicência"
    }
  ]
},
{
  "id": "j_n4_tsuyoi",
  "category": "kanji",
  "focus": "強",
  "jp": "強",
  "romaji": "kyou / tsuyoi",
  "pt": "forte",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Força em corpo, vento, regra, estudo e pressão.",
  "chars": [
    "強"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Força em corpo, vento, regra, estudo e pressão.",
  "onyomi": "キョウ, ゴウ",
  "kunyomi": "つよ",
  "strokes": "11",
  "examples": [
    {
      "jp": "強い",
      "romaji": "tsuyoi",
      "pt": "forte"
    },
    {
      "jp": "勉強",
      "romaji": "benkyou",
      "pt": "estudo"
    },
    {
      "jp": "強化",
      "romaji": "kyouka",
      "pt": "fortalecimento"
    }
  ]
},
{
  "id": "j_n4_yowai",
  "category": "kanji",
  "focus": "弱",
  "jp": "弱",
  "romaji": "jaku / yowai",
  "pt": "fraco",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Fraco em saúde, sinal, habilidade ou resistência.",
  "chars": [
    "弱"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Fraco em saúde, sinal, habilidade ou resistência.",
  "onyomi": "ジャク",
  "kunyomi": "よわ",
  "strokes": "10",
  "examples": [
    {
      "jp": "弱い",
      "romaji": "yowai",
      "pt": "fraco"
    },
    {
      "jp": "弱点",
      "romaji": "jakuten",
      "pt": "ponto fraco"
    },
    {
      "jp": "弱る",
      "romaji": "yowaru",
      "pt": "enfraquecer"
    }
  ]
},
{
  "id": "j_n4_hayai",
  "category": "kanji",
  "focus": "早",
  "jp": "早",
  "romaji": "sou / hayai",
  "pt": "cedo / rápido",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Cedo no horário, rápido na ação.",
  "chars": [
    "早"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Cedo no horário, rápido na ação.",
  "onyomi": "ソウ",
  "kunyomi": "はや",
  "strokes": "6",
  "examples": [
    {
      "jp": "早い",
      "romaji": "hayai",
      "pt": "cedo / rápido"
    },
    {
      "jp": "早朝",
      "romaji": "souchou",
      "pt": "bem cedo de manhã"
    },
    {
      "jp": "早口",
      "romaji": "hayakuchi",
      "pt": "fala rápida"
    }
  ]
},
{
  "id": "j_n4_osoi",
  "category": "kanji",
  "focus": "遅",
  "jp": "遅",
  "romaji": "chi / osoi",
  "pt": "lento / atrasado",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Atraso em trem, trabalho e entrega.",
  "chars": [
    "遅"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Atraso em trem, trabalho e entrega.",
  "onyomi": "チ",
  "kunyomi": "おそ, おく",
  "strokes": "12",
  "examples": [
    {
      "jp": "遅い",
      "romaji": "osoi",
      "pt": "lento / tarde"
    },
    {
      "jp": "遅刻",
      "romaji": "chikoku",
      "pt": "atraso"
    },
    {
      "jp": "遅れる",
      "romaji": "okureru",
      "pt": "atrasar"
    }
  ]
},
{
  "id": "j_n4_omoi",
  "category": "kanji",
  "focus": "重",
  "jp": "重",
  "romaji": "juu / omoi",
  "pt": "pesado / importante",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Peso físico e peso de importância.",
  "chars": [
    "重"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Peso físico e peso de importância.",
  "onyomi": "ジュウ, チョウ",
  "kunyomi": "おも, かさ",
  "strokes": "9",
  "examples": [
    {
      "jp": "重い",
      "romaji": "omoi",
      "pt": "pesado"
    },
    {
      "jp": "重要",
      "romaji": "juuyou",
      "pt": "importante"
    },
    {
      "jp": "体重",
      "romaji": "taijuu",
      "pt": "peso corporal"
    }
  ]
},
{
  "id": "j_n4_karui",
  "category": "kanji",
  "focus": "軽",
  "jp": "軽",
  "romaji": "kei / karui",
  "pt": "leve",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Leve em peso, sensação, ferimento ou carga.",
  "chars": [
    "軽"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Leve em peso, sensação, ferimento ou carga.",
  "onyomi": "ケイ",
  "kunyomi": "かる",
  "strokes": "12",
  "examples": [
    {
      "jp": "軽い",
      "romaji": "karui",
      "pt": "leve"
    },
    {
      "jp": "軽自動車",
      "romaji": "keijidousha",
      "pt": "carro kei"
    },
    {
      "jp": "軽食",
      "romaji": "keishoku",
      "pt": "lanche leve"
    }
  ]
},
{
  "id": "j_n4_chikai",
  "category": "kanji",
  "focus": "近",
  "jp": "近",
  "romaji": "kin / chikai",
  "pt": "perto",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Proximidade em distância, tempo e relação.",
  "chars": [
    "近"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Proximidade em distância, tempo e relação.",
  "onyomi": "キン",
  "kunyomi": "ちか",
  "strokes": "7",
  "examples": [
    {
      "jp": "近い",
      "romaji": "chikai",
      "pt": "perto"
    },
    {
      "jp": "最近",
      "romaji": "saikin",
      "pt": "recentemente"
    },
    {
      "jp": "近所",
      "romaji": "kinjo",
      "pt": "vizinhança"
    }
  ]
},
{
  "id": "j_n4_tooi",
  "category": "kanji",
  "focus": "遠",
  "jp": "遠",
  "romaji": "en / tooi",
  "pt": "longe",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Distância física ou emocional.",
  "chars": [
    "遠"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Distância física ou emocional.",
  "onyomi": "エン",
  "kunyomi": "とお",
  "strokes": "13",
  "examples": [
    {
      "jp": "遠い",
      "romaji": "tooi",
      "pt": "longe"
    },
    {
      "jp": "遠慮",
      "romaji": "enryo",
      "pt": "cerimônia / hesitação"
    },
    {
      "jp": "遠足",
      "romaji": "ensoku",
      "pt": "excursão"
    }
  ]
},
{
  "id": "j_n4_hiroi",
  "category": "kanji",
  "focus": "広",
  "jp": "広",
  "romaji": "kou / hiroi",
  "pt": "amplo / espaçoso",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Espaço aberto, divulgação e amplitude.",
  "chars": [
    "広"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Espaço aberto, divulgação e amplitude.",
  "onyomi": "コウ",
  "kunyomi": "ひろ",
  "strokes": "5",
  "examples": [
    {
      "jp": "広い",
      "romaji": "hiroi",
      "pt": "amplo"
    },
    {
      "jp": "広告",
      "romaji": "koukoku",
      "pt": "anúncio"
    },
    {
      "jp": "広場",
      "romaji": "hiroba",
      "pt": "praça"
    }
  ]
},
{
  "id": "j_n4_semai",
  "category": "kanji",
  "focus": "狭",
  "jp": "狭",
  "romaji": "kyou / semai",
  "pt": "estreito / apertado",
  "type": "kanji",
  "hint": "N4 prova + interpretação · descrição e avaliação. Muito útil para casa pequena, rua estreita e espaço apertado.",
  "chars": [
    "狭"
  ],
  "jlpt": "N4",
  "group": "descrição e avaliação",
  "memo": "Muito útil para casa pequena, rua estreita e espaço apertado.",
  "onyomi": "キョウ",
  "kunyomi": "せま",
  "strokes": "9",
  "examples": [
    {
      "jp": "狭い",
      "romaji": "semai",
      "pt": "estreito / apertado"
    },
    {
      "jp": "狭まる",
      "romaji": "sebamaru",
      "pt": "ficar mais estreito"
    },
    {
      "jp": "狭苦しい",
      "romaji": "semakurushii",
      "pt": "apertado / sufocante"
    }
  ]
},
{
  "id": "j_n5_iku_kun",
  "category": "kanji",
  "focus": "行",
  "jp": "行",
  "romaji": "iku / okonau",
  "pt": "ir / realizar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em movimento. 行く é uma das leituras Kunyomi mais úteis do japonês vivo.",
  "chars": [
    "行"
  ],
  "jlpt": "N5",
  "group": "kunyomi em movimento",
  "memo": "行く é uma das leituras Kunyomi mais úteis do japonês vivo.",
  "onyomi": "コウ, ギョウ",
  "kunyomi": "い, ゆ, おこな",
  "strokes": "6",
  "examples": [
    {
      "jp": "行く",
      "romaji": "iku",
      "pt": "ir"
    },
    {
      "jp": "行きます",
      "romaji": "ikimasu",
      "pt": "vou / vai"
    },
    {
      "jp": "行う",
      "romaji": "okonau",
      "pt": "realizar / executar"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "行く",
    "jp": "明日、会社へ行きます。",
    "pt": "Amanhã eu vou para a empresa.",
    "note": "行く = ir"
  },
  {
    "type": "kunyomi",
    "word": "行き方",
    "jp": "駅までの行き方を教えてください。",
    "pt": "Por favor, me ensine como chegar até a estação.",
    "note": "行き方 = modo de ir"
  },
  {
    "type": "onyomi",
    "word": "銀行",
    "jp": "給料は銀行に入ります。",
    "pt": "O salário entra no banco.",
    "note": "行 em 銀行 usa leitura こう"
  },
  {
    "type": "onyomi",
    "word": "旅行",
    "jp": "来月、家族と旅行します。",
    "pt": "No mês que vem, vou viajar com minha família.",
    "note": "旅行 = viagem"
  }
]
},
{
  "id": "j_n5_kuru_kun",
  "category": "kanji",
  "focus": "来",
  "jp": "来",
  "romaji": "kuru / kitaru",
  "pt": "vir",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em movimento. 来る muda de leitura em formas reais: くる, きます, こない.",
  "chars": [
    "来"
  ],
  "jlpt": "N5",
  "group": "kunyomi em movimento",
  "memo": "来る muda de leitura em formas reais: くる, きます, こない.",
  "onyomi": "ライ",
  "kunyomi": "く, き, こ",
  "strokes": "7",
  "examples": [
    {
      "jp": "来る",
      "romaji": "kuru",
      "pt": "vir"
    },
    {
      "jp": "来ます",
      "romaji": "kimasu",
      "pt": "vem / virá"
    },
    {
      "jp": "来ない",
      "romaji": "konai",
      "pt": "não vem"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "来る",
    "jp": "先生がこちらへ来ます。",
    "pt": "O professor vem para cá.",
    "note": "来ます = vem"
  },
  {
    "type": "kunyomi",
    "word": "来ない",
    "jp": "バスがなかなか来ないです。",
    "pt": "O ônibus não vem de jeito nenhum.",
    "note": "来ない = não vem"
  },
  {
    "type": "onyomi",
    "word": "来月",
    "jp": "来月から新しいシフトになります。",
    "pt": "A partir do mês que vem, será um novo turno.",
    "note": "来月 = mês que vem"
  },
  {
    "type": "onyomi",
    "word": "来年",
    "jp": "来年、N4に挑戦したいです。",
    "pt": "No ano que vem, quero tentar o N4.",
    "note": "来年 = ano que vem"
  }
]
},
{
  "id": "j_n5_kaeru_kun",
  "category": "kanji",
  "focus": "帰",
  "jp": "帰",
  "romaji": "kaeru",
  "pt": "voltar para casa",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em movimento. 帰る é essencial para rotina: voltar para casa depois do trabalho.",
  "chars": [
    "帰"
  ],
  "jlpt": "N5",
  "group": "kunyomi em movimento",
  "memo": "帰る é essencial para rotina: voltar para casa depois do trabalho.",
  "onyomi": "キ",
  "kunyomi": "かえ",
  "strokes": "10",
  "examples": [
    {
      "jp": "帰る",
      "romaji": "kaeru",
      "pt": "voltar para casa"
    },
    {
      "jp": "帰ります",
      "romaji": "kaerimasu",
      "pt": "vou voltar"
    },
    {
      "jp": "帰国",
      "romaji": "kikoku",
      "pt": "voltar ao país"
    }
  ]
},
{
  "id": "j_n5_hairu_kun",
  "category": "kanji",
  "focus": "入",
  "jp": "入",
  "romaji": "hairu / ireru",
  "pt": "entrar / colocar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em movimento. 入 tem duas forças: entrar sozinho ou colocar algo para dentro.",
  "chars": [
    "入"
  ],
  "jlpt": "N5",
  "group": "kunyomi em movimento",
  "memo": "入 tem duas forças: entrar sozinho ou colocar algo para dentro.",
  "onyomi": "ニュウ",
  "kunyomi": "はい, い",
  "strokes": "2",
  "examples": [
    {
      "jp": "入る",
      "romaji": "hairu",
      "pt": "entrar"
    },
    {
      "jp": "入れる",
      "romaji": "ireru",
      "pt": "colocar dentro"
    },
    {
      "jp": "入口",
      "romaji": "iriguchi",
      "pt": "entrada"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "入る",
    "jp": "この部屋に入ってもいいですか。",
    "pt": "Posso entrar neste quarto?",
    "note": "入る = entrar"
  },
  {
    "type": "kunyomi",
    "word": "入れる",
    "jp": "この書類を封筒に入れてください。",
    "pt": "Coloque este documento no envelope, por favor.",
    "note": "入れる = colocar dentro"
  },
  {
    "type": "onyomi",
    "word": "入口",
    "jp": "入口はあちらです。",
    "pt": "A entrada é ali.",
    "note": "入口 = entrada"
  },
  {
    "type": "onyomi",
    "word": "入院",
    "jp": "父は昨日から入院しています。",
    "pt": "Meu pai está internado desde ontem.",
    "note": "入院 = internação"
  }
]
},
{
  "id": "j_n5_deru_kun",
  "category": "kanji",
  "focus": "出",
  "jp": "出",
  "romaji": "deru / dasu",
  "pt": "sair / tirar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em movimento. 出 é o oposto vivo de 入: sair ou tirar.",
  "chars": [
    "出"
  ],
  "jlpt": "N5",
  "group": "kunyomi em movimento",
  "memo": "出 é o oposto vivo de 入: sair ou tirar.",
  "onyomi": "シュツ, スイ",
  "kunyomi": "で, だ",
  "strokes": "5",
  "examples": [
    {
      "jp": "出る",
      "romaji": "deru",
      "pt": "sair"
    },
    {
      "jp": "出す",
      "romaji": "dasu",
      "pt": "tirar / entregar"
    },
    {
      "jp": "出口",
      "romaji": "deguchi",
      "pt": "saída"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "出る",
    "jp": "仕事は何時に出ますか。",
    "pt": "Que horas você sai do trabalho?",
    "note": "出る = sair"
  },
  {
    "type": "kunyomi",
    "word": "出す",
    "jp": "この紙を事務所に出してください。",
    "pt": "Entregue este papel no escritório, por favor.",
    "note": "出す = entregar/tirar"
  },
  {
    "type": "onyomi",
    "word": "出口",
    "jp": "出口は右側にあります。",
    "pt": "A saída fica do lado direito.",
    "note": "出口 = saída"
  },
  {
    "type": "onyomi",
    "word": "出発",
    "jp": "電車は八時に出発します。",
    "pt": "O trem parte às oito horas.",
    "note": "出発 = partida"
  }
]
},
{
  "id": "j_n5_au_kun",
  "category": "kanji",
  "focus": "会",
  "jp": "会",
  "romaji": "au",
  "pt": "encontrar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em relação. 会う é encontro real: pessoa com pessoa.",
  "chars": [
    "会"
  ],
  "jlpt": "N5",
  "group": "kunyomi em relação",
  "memo": "会う é encontro real: pessoa com pessoa.",
  "onyomi": "カイ, エ",
  "kunyomi": "あ",
  "strokes": "6",
  "examples": [
    {
      "jp": "会う",
      "romaji": "au",
      "pt": "encontrar"
    },
    {
      "jp": "会います",
      "romaji": "aimasu",
      "pt": "encontro / vou encontrar"
    },
    {
      "jp": "会社",
      "romaji": "kaisha",
      "pt": "empresa"
    }
  ]
},
{
  "id": "j_n5_matsu_kun",
  "category": "kanji",
  "focus": "待",
  "jp": "待",
  "romaji": "matsu",
  "pt": "esperar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em rotina. 待つ aparece em estação, hospital, trabalho e atendimento.",
  "chars": [
    "待"
  ],
  "jlpt": "N5",
  "group": "kunyomi em rotina",
  "memo": "待つ aparece em estação, hospital, trabalho e atendimento.",
  "onyomi": "タイ",
  "kunyomi": "ま",
  "strokes": "9",
  "examples": [
    {
      "jp": "待つ",
      "romaji": "matsu",
      "pt": "esperar"
    },
    {
      "jp": "待ちます",
      "romaji": "machimasu",
      "pt": "espero"
    },
    {
      "jp": "待合室",
      "romaji": "machiaishitsu",
      "pt": "sala de espera"
    }
  ]
},
{
  "id": "j_n5_motsu_kun",
  "category": "kanji",
  "focus": "持",
  "jp": "持",
  "romaji": "motsu",
  "pt": "segurar / ter consigo",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em rotina. 持つ é ter na mão, carregar ou possuir.",
  "chars": [
    "持"
  ],
  "jlpt": "N5",
  "group": "kunyomi em rotina",
  "memo": "持つ é ter na mão, carregar ou possuir.",
  "onyomi": "ジ",
  "kunyomi": "も",
  "strokes": "9",
  "examples": [
    {
      "jp": "持つ",
      "romaji": "motsu",
      "pt": "segurar / ter"
    },
    {
      "jp": "持っている",
      "romaji": "motte iru",
      "pt": "tenho / estou segurando"
    },
    {
      "jp": "気持ち",
      "romaji": "kimochi",
      "pt": "sentimento"
    }
  ]
},
{
  "id": "j_n5_kaku_kun",
  "category": "kanji",
  "focus": "書",
  "jp": "書",
  "romaji": "kaku",
  "pt": "escrever",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em estudo. 書く é o coração do DIÁRIO321: escrever para fixar.",
  "chars": [
    "書"
  ],
  "jlpt": "N5",
  "group": "kunyomi em estudo",
  "memo": "書く é o coração do DIÁRIO321: escrever para fixar.",
  "onyomi": "ショ",
  "kunyomi": "か",
  "strokes": "10",
  "examples": [
    {
      "jp": "書く",
      "romaji": "kaku",
      "pt": "escrever"
    },
    {
      "jp": "書きます",
      "romaji": "kakimasu",
      "pt": "escrevo"
    },
    {
      "jp": "書類",
      "romaji": "shorui",
      "pt": "documentos"
    }
  ]
},
{
  "id": "j_n5_yomu_kun",
  "category": "kanji",
  "focus": "読",
  "jp": "読",
  "romaji": "yomu",
  "pt": "ler",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em estudo. 読む é o objetivo: transformar símbolo em sentido.",
  "chars": [
    "読"
  ],
  "jlpt": "N5",
  "group": "kunyomi em estudo",
  "memo": "読む é o objetivo: transformar símbolo em sentido.",
  "onyomi": "ドク, トク",
  "kunyomi": "よ",
  "strokes": "14",
  "examples": [
    {
      "jp": "読む",
      "romaji": "yomu",
      "pt": "ler"
    },
    {
      "jp": "読み方",
      "romaji": "yomikata",
      "pt": "modo de ler"
    },
    {
      "jp": "読書",
      "romaji": "dokusho",
      "pt": "leitura"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "読む",
    "jp": "この説明をゆっくり読んでください。",
    "pt": "Leia esta explicação com calma, por favor.",
    "note": "読む = ler"
  },
  {
    "type": "kunyomi",
    "word": "読み方",
    "jp": "この漢字の読み方が分かりません。",
    "pt": "Não sei a leitura deste kanji.",
    "note": "読み方 = modo de ler"
  },
  {
    "type": "onyomi",
    "word": "読書",
    "jp": "毎日少しだけ読書します。",
    "pt": "Eu leio um pouco todos os dias.",
    "note": "読書 = leitura"
  },
  {
    "type": "onyomi",
    "word": "音読",
    "jp": "日本語の文章を音読します。",
    "pt": "Vou ler o texto japonês em voz alta.",
    "note": "音読 = leitura em voz alta"
  }
]
},
{
  "id": "j_n5_kiku_kun",
  "category": "kanji",
  "focus": "聞",
  "jp": "聞",
  "romaji": "kiku",
  "pt": "ouvir / perguntar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em comunicação. 聞く é duplo: ouvir com o ouvido e perguntar com intenção.",
  "chars": [
    "聞"
  ],
  "jlpt": "N5",
  "group": "kunyomi em comunicação",
  "memo": "聞く é duplo: ouvir com o ouvido e perguntar com intenção.",
  "onyomi": "ブン, モン",
  "kunyomi": "き",
  "strokes": "14",
  "examples": [
    {
      "jp": "聞く",
      "romaji": "kiku",
      "pt": "ouvir / perguntar"
    },
    {
      "jp": "聞きます",
      "romaji": "kikimasu",
      "pt": "ouço / pergunto"
    },
    {
      "jp": "新聞",
      "romaji": "shinbun",
      "pt": "jornal"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "聞く",
    "jp": "分からない時は、すぐ聞いてください。",
    "pt": "Quando não entender, pergunte imediatamente.",
    "note": "聞く = ouvir/perguntar"
  },
  {
    "type": "kunyomi",
    "word": "聞こえる",
    "jp": "機械の音が聞こえます。",
    "pt": "Consigo ouvir o som da máquina.",
    "note": "聞こえる = ser audível"
  },
  {
    "type": "onyomi",
    "word": "新聞",
    "jp": "新聞でそのニュースを読みました。",
    "pt": "Li essa notícia no jornal.",
    "note": "新聞 = jornal"
  }
]
},
{
  "id": "j_n5_hanasu_kun",
  "category": "kanji",
  "focus": "話",
  "jp": "話",
  "romaji": "hanasu",
  "pt": "falar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em comunicação. 話す liga fala, conversa e telefone.",
  "chars": [
    "話"
  ],
  "jlpt": "N5",
  "group": "kunyomi em comunicação",
  "memo": "話す liga fala, conversa e telefone.",
  "onyomi": "ワ",
  "kunyomi": "はな",
  "strokes": "13",
  "examples": [
    {
      "jp": "話す",
      "romaji": "hanasu",
      "pt": "falar"
    },
    {
      "jp": "話します",
      "romaji": "hanashimasu",
      "pt": "falo"
    },
    {
      "jp": "電話",
      "romaji": "denwa",
      "pt": "telefone"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "話す",
    "jp": "日本語で少し話せます。",
    "pt": "Consigo falar um pouco em japonês.",
    "note": "話す = falar"
  },
  {
    "type": "kunyomi",
    "word": "話し方",
    "jp": "丁寧な話し方を覚えたいです。",
    "pt": "Quero aprender um modo educado de falar.",
    "note": "話し方 = modo de falar"
  },
  {
    "type": "onyomi",
    "word": "電話",
    "jp": "あとで電話してもいいですか。",
    "pt": "Posso ligar depois?",
    "note": "電話 = telefone"
  },
  {
    "type": "onyomi",
    "word": "会話",
    "jp": "自然な会話を練習したいです。",
    "pt": "Quero praticar conversa natural.",
    "note": "会話 = conversa"
  }
]
},
{
  "id": "j_n5_miru_kun",
  "category": "kanji",
  "focus": "見",
  "jp": "見",
  "romaji": "miru",
  "pt": "ver / assistir",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em percepção. 見る é olhar e perceber. Muito além de apenas ver.",
  "chars": [
    "見"
  ],
  "jlpt": "N5",
  "group": "kunyomi em percepção",
  "memo": "見る é olhar e perceber. Muito além de apenas ver.",
  "onyomi": "ケン",
  "kunyomi": "み",
  "strokes": "7",
  "examples": [
    {
      "jp": "見る",
      "romaji": "miru",
      "pt": "ver / assistir"
    },
    {
      "jp": "見ます",
      "romaji": "mimasu",
      "pt": "vejo"
    },
    {
      "jp": "見せる",
      "romaji": "miseru",
      "pt": "mostrar"
    }
  ]
},
{
  "id": "j_n5_taberu_kun",
  "category": "kanji",
  "focus": "食",
  "jp": "食",
  "romaji": "taberu / kuu",
  "pt": "comer",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em vida diária. 食べる é polido e comum. 食う existe, mas é mais bruto/casual.",
  "chars": [
    "食"
  ],
  "jlpt": "N5",
  "group": "kunyomi em vida diária",
  "memo": "食べる é polido e comum. 食う existe, mas é mais bruto/casual.",
  "onyomi": "ショク, ジキ",
  "kunyomi": "た, く",
  "strokes": "9",
  "examples": [
    {
      "jp": "食べる",
      "romaji": "taberu",
      "pt": "comer"
    },
    {
      "jp": "食べます",
      "romaji": "tabemasu",
      "pt": "como"
    },
    {
      "jp": "食堂",
      "romaji": "shokudou",
      "pt": "refeitório"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "食べる",
    "jp": "昼ご飯を食べる時間がありませんでした。",
    "pt": "Não tive tempo de comer o almoço.",
    "note": "食べる = comer"
  },
  {
    "type": "kunyomi",
    "word": "食べ物",
    "jp": "辛い食べ物は大丈夫ですか。",
    "pt": "Comida apimentada está tudo bem para você?",
    "note": "食べ物 = comida"
  },
  {
    "type": "onyomi",
    "word": "食堂",
    "jp": "会社の食堂で昼ご飯を食べます。",
    "pt": "Como o almoço no refeitório da empresa.",
    "note": "食堂 = refeitório"
  },
  {
    "type": "onyomi",
    "word": "食事",
    "jp": "薬は食事の後で飲んでください。",
    "pt": "Tome o remédio depois da refeição.",
    "note": "食事 = refeição"
  }
]
},
{
  "id": "j_n5_nomu_kun",
  "category": "kanji",
  "focus": "飲",
  "jp": "飲",
  "romaji": "nomu",
  "pt": "beber",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em vida diária. 飲む aparece em remédio, água, café e convívio.",
  "chars": [
    "飲"
  ],
  "jlpt": "N5",
  "group": "kunyomi em vida diária",
  "memo": "飲む aparece em remédio, água, café e convívio.",
  "onyomi": "イン",
  "kunyomi": "の",
  "strokes": "12",
  "examples": [
    {
      "jp": "飲む",
      "romaji": "nomu",
      "pt": "beber"
    },
    {
      "jp": "飲みます",
      "romaji": "nomimasu",
      "pt": "bebo"
    },
    {
      "jp": "飲み物",
      "romaji": "nomimono",
      "pt": "bebida"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "飲む",
    "jp": "水をたくさん飲んでください。",
    "pt": "Beba bastante água, por favor.",
    "note": "飲む = beber"
  },
  {
    "type": "kunyomi",
    "word": "飲み物",
    "jp": "冷たい飲み物がほしいです。",
    "pt": "Quero uma bebida gelada.",
    "note": "飲み物 = bebida"
  },
  {
    "type": "onyomi",
    "word": "飲食店",
    "jp": "駅の近くに飲食店があります。",
    "pt": "Há restaurantes perto da estação.",
    "note": "飲食店 = estabelecimento de comida/bebida"
  }
]
},
{
  "id": "j_n5_kau_kun",
  "category": "kanji",
  "focus": "買",
  "jp": "買",
  "romaji": "kau",
  "pt": "comprar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em vida diária. 買う é sobrevivência: mercado, konbini, farmácia.",
  "chars": [
    "買"
  ],
  "jlpt": "N5",
  "group": "kunyomi em vida diária",
  "memo": "買う é sobrevivência: mercado, konbini, farmácia.",
  "onyomi": "バイ",
  "kunyomi": "か",
  "strokes": "12",
  "examples": [
    {
      "jp": "買う",
      "romaji": "kau",
      "pt": "comprar"
    },
    {
      "jp": "買います",
      "romaji": "kaimasu",
      "pt": "compro"
    },
    {
      "jp": "買い物",
      "romaji": "kaimono",
      "pt": "compras"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "買う",
    "jp": "仕事の帰りに薬を買います。",
    "pt": "Na volta do trabalho, vou comprar remédio.",
    "note": "買う = comprar"
  },
  {
    "type": "kunyomi",
    "word": "買い物",
    "jp": "今日はスーパーで買い物をします。",
    "pt": "Hoje vou fazer compras no supermercado.",
    "note": "買い物 = compras"
  },
  {
    "type": "onyomi",
    "word": "売買",
    "jp": "この店では中古品の売買ができます。",
    "pt": "Nesta loja é possível comprar e vender produtos usados.",
    "note": "売買 = compra e venda"
  }
]
},
{
  "id": "j_n5_yasumu_kun",
  "category": "kanji",
  "focus": "休",
  "jp": "休",
  "romaji": "yasumu",
  "pt": "descansar / faltar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em vida diária. 休む é descanso, folga e falta no trabalho.",
  "chars": [
    "休"
  ],
  "jlpt": "N5",
  "group": "kunyomi em vida diária",
  "memo": "休む é descanso, folga e falta no trabalho.",
  "onyomi": "キュウ",
  "kunyomi": "やす",
  "strokes": "6",
  "examples": [
    {
      "jp": "休む",
      "romaji": "yasumu",
      "pt": "descansar / faltar"
    },
    {
      "jp": "休み",
      "romaji": "yasumi",
      "pt": "folga"
    },
    {
      "jp": "休日",
      "romaji": "kyuujitsu",
      "pt": "dia de folga"
    }
  ]
},
{
  "id": "j_n5_tatsu_kun",
  "category": "kanji",
  "focus": "立",
  "jp": "立",
  "romaji": "tatsu",
  "pt": "ficar de pé / levantar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em corpo e ação. 立つ é corpo erguido: ficar de pé, levantar, surgir.",
  "chars": [
    "立"
  ],
  "jlpt": "N5",
  "group": "kunyomi em corpo e ação",
  "memo": "立つ é corpo erguido: ficar de pé, levantar, surgir.",
  "onyomi": "リツ, リュウ",
  "kunyomi": "た",
  "strokes": "5",
  "examples": [
    {
      "jp": "立つ",
      "romaji": "tatsu",
      "pt": "ficar de pé"
    },
    {
      "jp": "立ちます",
      "romaji": "tachimasu",
      "pt": "fico de pé"
    },
    {
      "jp": "役に立つ",
      "romaji": "yaku ni tatsu",
      "pt": "ser útil"
    }
  ]
},
{
  "id": "j_n5_suwaru_kun",
  "category": "kanji",
  "focus": "座",
  "jp": "座",
  "romaji": "suwaru",
  "pt": "sentar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em corpo e ação. 座る é o oposto prático de ficar em pé.",
  "chars": [
    "座"
  ],
  "jlpt": "N5",
  "group": "kunyomi em corpo e ação",
  "memo": "座る é o oposto prático de ficar em pé.",
  "onyomi": "ザ",
  "kunyomi": "すわ",
  "strokes": "10",
  "examples": [
    {
      "jp": "座る",
      "romaji": "suwaru",
      "pt": "sentar"
    },
    {
      "jp": "座ります",
      "romaji": "suwarimasu",
      "pt": "sento"
    },
    {
      "jp": "座席",
      "romaji": "zaseki",
      "pt": "assento"
    }
  ]
},
{
  "id": "j_n5_akeru_kun",
  "category": "kanji",
  "focus": "開",
  "jp": "開",
  "romaji": "aku / akeru / hiraku",
  "pt": "abrir",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em ação. 開 tem leituras vivas: abrir sozinho, abrir algo, realizar.",
  "chars": [
    "開"
  ],
  "jlpt": "N5",
  "group": "kunyomi em ação",
  "memo": "開 tem leituras vivas: abrir sozinho, abrir algo, realizar.",
  "onyomi": "カイ",
  "kunyomi": "あ, ひら",
  "strokes": "12",
  "examples": [
    {
      "jp": "開く",
      "romaji": "aku / hiraku",
      "pt": "abrir"
    },
    {
      "jp": "開ける",
      "romaji": "akeru",
      "pt": "abrir algo"
    },
    {
      "jp": "開始",
      "romaji": "kaishi",
      "pt": "início"
    }
  ]
},
{
  "id": "j_n5_shimeru_kun",
  "category": "kanji",
  "focus": "閉",
  "jp": "閉",
  "romaji": "shimaru / shimeru",
  "pt": "fechar",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em ação. 閉 é fechar porta, loja, olhos ou assunto.",
  "chars": [
    "閉"
  ],
  "jlpt": "N5",
  "group": "kunyomi em ação",
  "memo": "閉 é fechar porta, loja, olhos ou assunto.",
  "onyomi": "ヘイ",
  "kunyomi": "し, と",
  "strokes": "11",
  "examples": [
    {
      "jp": "閉まる",
      "romaji": "shimaru",
      "pt": "fechar-se"
    },
    {
      "jp": "閉める",
      "romaji": "shimeru",
      "pt": "fechar algo"
    },
    {
      "jp": "閉店",
      "romaji": "heiten",
      "pt": "fechamento da loja"
    }
  ]
},
{
  "id": "j_n5_atarashii_kun",
  "category": "kanji",
  "focus": "新",
  "jp": "新",
  "romaji": "atarashii / ara",
  "pt": "novo",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em descrição. 新しい é novo no ouvido, no produto, no começo.",
  "chars": [
    "新"
  ],
  "jlpt": "N5",
  "group": "kunyomi em descrição",
  "memo": "新しい é novo no ouvido, no produto, no começo.",
  "onyomi": "シン",
  "kunyomi": "あたら, あら, にい",
  "strokes": "13",
  "examples": [
    {
      "jp": "新しい",
      "romaji": "atarashii",
      "pt": "novo"
    },
    {
      "jp": "新た",
      "romaji": "arata",
      "pt": "novo / renovado"
    },
    {
      "jp": "新聞",
      "romaji": "shinbun",
      "pt": "jornal"
    }
  ]
},
{
  "id": "j_n5_furui_kun",
  "category": "kanji",
  "focus": "古",
  "jp": "古",
  "romaji": "furui",
  "pt": "velho / antigo",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em descrição. 古い ajuda a entender usado, antigo, velho e histórico.",
  "chars": [
    "古"
  ],
  "jlpt": "N5",
  "group": "kunyomi em descrição",
  "memo": "古い ajuda a entender usado, antigo, velho e histórico.",
  "onyomi": "コ",
  "kunyomi": "ふる",
  "strokes": "5",
  "examples": [
    {
      "jp": "古い",
      "romaji": "furui",
      "pt": "velho / antigo"
    },
    {
      "jp": "古本",
      "romaji": "furuhon",
      "pt": "livro usado"
    },
    {
      "jp": "中古",
      "romaji": "chuuko",
      "pt": "usado"
    }
  ]
},
{
  "id": "j_n5_takai_kun",
  "category": "kanji",
  "focus": "高",
  "jp": "高",
  "romaji": "takai",
  "pt": "alto / caro",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em descrição. 高い dói no bolso ou sobe no espaço.",
  "chars": [
    "高"
  ],
  "jlpt": "N5",
  "group": "kunyomi em descrição",
  "memo": "高い dói no bolso ou sobe no espaço.",
  "onyomi": "コウ",
  "kunyomi": "たか",
  "strokes": "10",
  "examples": [
    {
      "jp": "高い",
      "romaji": "takai",
      "pt": "alto / caro"
    },
    {
      "jp": "高さ",
      "romaji": "takasa",
      "pt": "altura"
    },
    {
      "jp": "高校",
      "romaji": "koukou",
      "pt": "ensino médio"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "高い",
    "jp": "このプランは少し高いです。",
    "pt": "Este plano é um pouco caro.",
    "note": "高い = caro/alto"
  },
  {
    "type": "kunyomi",
    "word": "高さ",
    "jp": "この棚の高さを確認してください。",
    "pt": "Verifique a altura desta prateleira, por favor.",
    "note": "高さ = altura"
  },
  {
    "type": "onyomi",
    "word": "高校",
    "jp": "日本の高校について知りたいです。",
    "pt": "Quero saber sobre o ensino médio no Japão.",
    "note": "高校 = ensino médio"
  }
]
},
{
  "id": "j_n5_yasui_kun",
  "category": "kanji",
  "focus": "安",
  "jp": "安",
  "romaji": "yasui",
  "pt": "barato / tranquilo",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em descrição. 安い é barato. 安心 é tranquilidade. Dois lados úteis.",
  "chars": [
    "安"
  ],
  "jlpt": "N5",
  "group": "kunyomi em descrição",
  "memo": "安い é barato. 安心 é tranquilidade. Dois lados úteis.",
  "onyomi": "アン",
  "kunyomi": "やす",
  "strokes": "6",
  "examples": [
    {
      "jp": "安い",
      "romaji": "yasui",
      "pt": "barato"
    },
    {
      "jp": "安さ",
      "romaji": "yasusa",
      "pt": "barateza"
    },
    {
      "jp": "安心",
      "romaji": "anshin",
      "pt": "tranquilidade"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "安い",
    "jp": "もっと安い商品はありますか。",
    "pt": "Tem um produto mais barato?",
    "note": "安い = barato"
  },
  {
    "type": "kunyomi",
    "word": "安さ",
    "jp": "安さだけで選ばない方がいいです。",
    "pt": "É melhor não escolher só pelo preço baixo.",
    "note": "安さ = barateza"
  },
  {
    "type": "onyomi",
    "word": "安心",
    "jp": "説明を聞いて安心しました。",
    "pt": "Fiquei tranquilo depois de ouvir a explicação.",
    "note": "安心 = tranquilidade"
  },
  {
    "type": "onyomi",
    "word": "安全",
    "jp": "安全のためにヘルメットを使ってください。",
    "pt": "Use capacete por segurança.",
    "note": "安全 = segurança"
  }
]
},
{
  "id": "j_n5_ooi_kun",
  "category": "kanji",
  "focus": "多",
  "jp": "多",
  "romaji": "ooi",
  "pt": "muito / muitos",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em descrição. 多い é quantidade alta. Ótimo para leitura de gráficos e avisos.",
  "chars": [
    "多"
  ],
  "jlpt": "N5",
  "group": "kunyomi em descrição",
  "memo": "多い é quantidade alta. Ótimo para leitura de gráficos e avisos.",
  "onyomi": "タ",
  "kunyomi": "おお",
  "strokes": "6",
  "examples": [
    {
      "jp": "多い",
      "romaji": "ooi",
      "pt": "muitos"
    },
    {
      "jp": "多すぎる",
      "romaji": "oosugiru",
      "pt": "demais"
    },
    {
      "jp": "多分",
      "romaji": "tabun",
      "pt": "talvez"
    }
  ]
},
{
  "id": "j_n5_sukunai_kun",
  "category": "kanji",
  "focus": "少",
  "jp": "少",
  "romaji": "sukunai / sukoshi",
  "pt": "pouco / um pouco",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em descrição. 少し é uma das palavras mais úteis do japonês prático.",
  "chars": [
    "少"
  ],
  "jlpt": "N5",
  "group": "kunyomi em descrição",
  "memo": "少し é uma das palavras mais úteis do japonês prático.",
  "onyomi": "ショウ",
  "kunyomi": "すく, すこ",
  "strokes": "4",
  "examples": [
    {
      "jp": "少ない",
      "romaji": "sukunai",
      "pt": "pouco"
    },
    {
      "jp": "少し",
      "romaji": "sukoshi",
      "pt": "um pouco"
    },
    {
      "jp": "少々",
      "romaji": "shoushou",
      "pt": "um pouquinho / um momento"
    }
  ]
},
{
  "id": "j_n5_nagai_kun",
  "category": "kanji",
  "focus": "長",
  "jp": "長",
  "romaji": "nagai",
  "pt": "longo / comprido",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em descrição. 長い mede tempo, fila, objeto e jornada.",
  "chars": [
    "長"
  ],
  "jlpt": "N5",
  "group": "kunyomi em descrição",
  "memo": "長い mede tempo, fila, objeto e jornada.",
  "onyomi": "チョウ",
  "kunyomi": "なが",
  "strokes": "8",
  "examples": [
    {
      "jp": "長い",
      "romaji": "nagai",
      "pt": "longo"
    },
    {
      "jp": "長さ",
      "romaji": "nagasa",
      "pt": "comprimento"
    },
    {
      "jp": "店長",
      "romaji": "tenchou",
      "pt": "gerente de loja"
    }
  ]
},
{
  "id": "j_n5_shiroi_kun",
  "category": "kanji",
  "focus": "白",
  "jp": "白",
  "romaji": "shiroi",
  "pt": "branco",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em cores. 白 é cor, clareza e símbolo visual.",
  "chars": [
    "白"
  ],
  "jlpt": "N5",
  "group": "kunyomi em cores",
  "memo": "白 é cor, clareza e símbolo visual.",
  "onyomi": "ハク, ビャク",
  "kunyomi": "しろ, しら",
  "strokes": "5",
  "examples": [
    {
      "jp": "白い",
      "romaji": "shiroi",
      "pt": "branco"
    },
    {
      "jp": "白",
      "romaji": "shiro",
      "pt": "branco"
    },
    {
      "jp": "面白い",
      "romaji": "omoshiroi",
      "pt": "interessante"
    }
  ]
},
{
  "id": "j_n5_kuroi_kun",
  "category": "kanji",
  "focus": "黒",
  "jp": "黒",
  "romaji": "kuroi",
  "pt": "preto",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em cores. 黒 é preto, contraste e leitura visual.",
  "chars": [
    "黒"
  ],
  "jlpt": "N5",
  "group": "kunyomi em cores",
  "memo": "黒 é preto, contraste e leitura visual.",
  "onyomi": "コク",
  "kunyomi": "くろ",
  "strokes": "11",
  "examples": [
    {
      "jp": "黒い",
      "romaji": "kuroi",
      "pt": "preto"
    },
    {
      "jp": "黒",
      "romaji": "kuro",
      "pt": "preto"
    },
    {
      "jp": "黒板",
      "romaji": "kokuban",
      "pt": "quadro negro"
    }
  ]
},
{
  "id": "j_n5_akai_kun",
  "category": "kanji",
  "focus": "赤",
  "jp": "赤",
  "romaji": "akai",
  "pt": "vermelho",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em cores. 赤 aparece em cor, alerta e sinais.",
  "chars": [
    "赤"
  ],
  "jlpt": "N5",
  "group": "kunyomi em cores",
  "memo": "赤 aparece em cor, alerta e sinais.",
  "onyomi": "セキ, シャク",
  "kunyomi": "あか",
  "strokes": "7",
  "examples": [
    {
      "jp": "赤い",
      "romaji": "akai",
      "pt": "vermelho"
    },
    {
      "jp": "赤",
      "romaji": "aka",
      "pt": "vermelho"
    },
    {
      "jp": "赤ちゃん",
      "romaji": "akachan",
      "pt": "bebê"
    }
  ]
},
{
  "id": "j_n5_aoi_kun",
  "category": "kanji",
  "focus": "青",
  "jp": "青",
  "romaji": "aoi",
  "pt": "azul / verde do sinal",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em cores. 青 pode ser azul ou verde em contextos como semáforo.",
  "chars": [
    "青"
  ],
  "jlpt": "N5",
  "group": "kunyomi em cores",
  "memo": "青 pode ser azul ou verde em contextos como semáforo.",
  "onyomi": "セイ, ショウ",
  "kunyomi": "あお",
  "strokes": "8",
  "examples": [
    {
      "jp": "青い",
      "romaji": "aoi",
      "pt": "azul"
    },
    {
      "jp": "青",
      "romaji": "ao",
      "pt": "azul"
    },
    {
      "jp": "青信号",
      "romaji": "aoshingou",
      "pt": "sinal verde"
    }
  ]
},
{
  "id": "j_n5_ame_kun",
  "category": "kanji",
  "focus": "雨",
  "jp": "雨",
  "romaji": "ame",
  "pt": "chuva",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 雨 define clima, rotina de bike e roupa.",
  "chars": [
    "雨"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "雨 define clima, rotina de bike e roupa.",
  "onyomi": "ウ",
  "kunyomi": "あめ, あま",
  "strokes": "8",
  "examples": [
    {
      "jp": "雨",
      "romaji": "ame",
      "pt": "chuva"
    },
    {
      "jp": "雨の日",
      "romaji": "ame no hi",
      "pt": "dia de chuva"
    },
    {
      "jp": "大雨",
      "romaji": "ooame",
      "pt": "chuva forte"
    }
  ]
},
{
  "id": "j_n5_yuki_kun",
  "category": "kanji",
  "focus": "雪",
  "jp": "雪",
  "romaji": "yuki",
  "pt": "neve",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 雪 muda transporte, trabalho e segurança.",
  "chars": [
    "雪"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "雪 muda transporte, trabalho e segurança.",
  "onyomi": "セツ",
  "kunyomi": "ゆき",
  "strokes": "11",
  "examples": [
    {
      "jp": "雪",
      "romaji": "yuki",
      "pt": "neve"
    },
    {
      "jp": "雪の日",
      "romaji": "yuki no hi",
      "pt": "dia de neve"
    },
    {
      "jp": "大雪",
      "romaji": "ooyuki",
      "pt": "neve forte"
    }
  ]
},
{
  "id": "j_n5_kaze_kun",
  "category": "kanji",
  "focus": "風",
  "jp": "風",
  "romaji": "kaze",
  "pt": "vento",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 風 é vento, estilo e sensação do ambiente.",
  "chars": [
    "風"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "風 é vento, estilo e sensação do ambiente.",
  "onyomi": "フウ, フ",
  "kunyomi": "かぜ",
  "strokes": "9",
  "examples": [
    {
      "jp": "風",
      "romaji": "kaze",
      "pt": "vento"
    },
    {
      "jp": "台風",
      "romaji": "taifuu",
      "pt": "tufão"
    },
    {
      "jp": "風邪",
      "romaji": "kaze",
      "pt": "resfriado"
    }
  ]
},
{
  "id": "j_n5_sora_kun",
  "category": "kanji",
  "focus": "空",
  "jp": "空",
  "romaji": "sora / aku",
  "pt": "céu / vazio",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 空 é céu, vazio, disponibilidade.",
  "chars": [
    "空"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "空 é céu, vazio, disponibilidade.",
  "onyomi": "クウ",
  "kunyomi": "そら, あ, から",
  "strokes": "8",
  "examples": [
    {
      "jp": "空",
      "romaji": "sora",
      "pt": "céu"
    },
    {
      "jp": "空く",
      "romaji": "aku",
      "pt": "ficar vazio"
    },
    {
      "jp": "空港",
      "romaji": "kuukou",
      "pt": "aeroporto"
    }
  ]
},
{
  "id": "j_n5_kawa_kun",
  "category": "kanji",
  "focus": "川",
  "jp": "川",
  "romaji": "kawa",
  "pt": "rio",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 川 aparece em nomes de lugares e paisagens.",
  "chars": [
    "川"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "川 aparece em nomes de lugares e paisagens.",
  "onyomi": "セン",
  "kunyomi": "かわ",
  "strokes": "3",
  "examples": [
    {
      "jp": "川",
      "romaji": "kawa",
      "pt": "rio"
    },
    {
      "jp": "小川",
      "romaji": "ogawa",
      "pt": "riacho"
    },
    {
      "jp": "川口",
      "romaji": "kawaguchi",
      "pt": "Kawaguchi / foz do rio"
    }
  ]
},
{
  "id": "j_n5_yama_kun",
  "category": "kanji",
  "focus": "山",
  "jp": "山",
  "romaji": "yama",
  "pt": "montanha",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 山 é paisagem, endereço e nome de lugares.",
  "chars": [
    "山"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "山 é paisagem, endereço e nome de lugares.",
  "onyomi": "サン",
  "kunyomi": "やま",
  "strokes": "3",
  "examples": [
    {
      "jp": "山",
      "romaji": "yama",
      "pt": "montanha"
    },
    {
      "jp": "富士山",
      "romaji": "fujisan",
      "pt": "Monte Fuji"
    },
    {
      "jp": "山道",
      "romaji": "yamamichi",
      "pt": "caminho de montanha"
    }
  ]
},
{
  "id": "j_n5_hana_kun",
  "category": "kanji",
  "focus": "花",
  "jp": "花",
  "romaji": "hana",
  "pt": "flor",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 花 é memória visual: primavera, beleza, cotidiano.",
  "chars": [
    "花"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "花 é memória visual: primavera, beleza, cotidiano.",
  "onyomi": "カ",
  "kunyomi": "はな",
  "strokes": "7",
  "examples": [
    {
      "jp": "花",
      "romaji": "hana",
      "pt": "flor"
    },
    {
      "jp": "花見",
      "romaji": "hanami",
      "pt": "ver flores de cerejeira"
    },
    {
      "jp": "花屋",
      "romaji": "hanaya",
      "pt": "floricultura"
    }
  ]
},
{
  "id": "j_n5_kusa_kun",
  "category": "kanji",
  "focus": "草",
  "jp": "草",
  "romaji": "kusa",
  "pt": "grama / erva",
  "type": "kanji",
  "hint": "N5 leitura profunda · kunyomi em natureza. 草 aparece em campo, planta e leitura básica.",
  "chars": [
    "草"
  ],
  "jlpt": "N5",
  "group": "kunyomi em natureza",
  "memo": "草 aparece em campo, planta e leitura básica.",
  "onyomi": "ソウ",
  "kunyomi": "くさ",
  "strokes": "9",
  "examples": [
    {
      "jp": "草",
      "romaji": "kusa",
      "pt": "grama / erva"
    },
    {
      "jp": "草花",
      "romaji": "kusabana",
      "pt": "plantas e flores"
    },
    {
      "jp": "雑草",
      "romaji": "zassou",
      "pt": "mato"
    }
  ]
},
{
  "id": "j_n3_kan",
  "category": "kanji",
  "focus": "感",
  "jp": "感",
  "romaji": "kan",
  "pt": "sentimento / sensação",
  "type": "kanji",
  "hint": "N3 · interpretação e emoção. Essencial para entender opinião, reação e clima do texto.",
  "chars": [
    "感"
  ],
  "jlpt": "N3",
  "group": "interpretação e emoção",
  "memo": "Essencial para entender opinião, reação e clima do texto.",
  "onyomi": "カン",
  "kunyomi": "かん",
  "strokes": "13",
  "examples": [
    {
      "jp": "感じる",
      "romaji": "kanjiru",
      "pt": "sentir"
    },
    {
      "jp": "感謝",
      "romaji": "kansha",
      "pt": "gratidão"
    },
    {
      "jp": "感動",
      "romaji": "kandou",
      "pt": "emoção"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "感謝",
    "jp": "いつも助けてくれて感謝しています。",
    "pt": "Sou grato por você sempre me ajudar.",
    "note": "感謝 = gratidão"
  },
  {
    "type": "onyomi",
    "word": "感動",
    "jp": "その話を聞いて感動しました。",
    "pt": "Fiquei emocionado ao ouvir essa história.",
    "note": "感動 = emoção"
  },
  {
    "type": "onyomi",
    "word": "感じる",
    "jp": "最近、日本語の成長を感じます。",
    "pt": "Ultimamente sinto meu progresso no japonês.",
    "note": "感じる usa 感 com leitura かん"
  }
]
},
{
  "id": "j_n3_jou",
  "category": "kanji",
  "focus": "情",
  "jp": "情",
  "romaji": "jou",
  "pt": "emoção / informação",
  "type": "kanji",
  "hint": "N3 · interpretação e emoção. Em texto, 情 revela sentimento, situação e dado humano.",
  "chars": [
    "情"
  ],
  "jlpt": "N3",
  "group": "interpretação e emoção",
  "memo": "Em texto, 情 revela sentimento, situação e dado humano.",
  "onyomi": "ジョウ, セイ",
  "kunyomi": "なさ",
  "strokes": "11",
  "examples": [
    {
      "jp": "情報",
      "romaji": "jouhou",
      "pt": "informação"
    },
    {
      "jp": "感情",
      "romaji": "kanjou",
      "pt": "emoção"
    },
    {
      "jp": "事情",
      "romaji": "jijou",
      "pt": "circunstância"
    }
  ]
},
{
  "id": "j_n3_omou",
  "category": "kanji",
  "focus": "想",
  "jp": "想",
  "romaji": "sou",
  "pt": "pensamento / ideia",
  "type": "kanji",
  "hint": "N3 · interpretação e emoção. Ajuda a ler intenção, imaginação e sentimento interno.",
  "chars": [
    "想"
  ],
  "jlpt": "N3",
  "group": "interpretação e emoção",
  "memo": "Ajuda a ler intenção, imaginação e sentimento interno.",
  "onyomi": "ソウ, ソ",
  "kunyomi": "おも",
  "strokes": "13",
  "examples": [
    {
      "jp": "想像",
      "romaji": "souzou",
      "pt": "imaginação"
    },
    {
      "jp": "感想",
      "romaji": "kansou",
      "pt": "impressão / opinião"
    },
    {
      "jp": "理想",
      "romaji": "risou",
      "pt": "ideal"
    }
  ]
},
{
  "id": "j_n3_iken",
  "category": "kanji",
  "focus": "見",
  "jp": "見",
  "romaji": "ken / miru",
  "pt": "ver / opinião",
  "type": "kanji",
  "hint": "N3 · interpretação e emoção. No N3, 見 aparece muito em opinião e ponto de vista.",
  "chars": [
    "見"
  ],
  "jlpt": "N3",
  "group": "interpretação e emoção",
  "memo": "No N3, 見 aparece muito em opinião e ponto de vista.",
  "onyomi": "ケン",
  "kunyomi": "み",
  "strokes": "7",
  "examples": [
    {
      "jp": "意見",
      "romaji": "iken",
      "pt": "opinião"
    },
    {
      "jp": "見方",
      "romaji": "mikata",
      "pt": "modo de ver"
    },
    {
      "jp": "発見",
      "romaji": "hakken",
      "pt": "descoberta"
    }
  ]
},
{
  "id": "j_n3_ketsu",
  "category": "kanji",
  "focus": "決",
  "jp": "決",
  "romaji": "ketsu / kimeru",
  "pt": "decidir",
  "type": "kanji",
  "hint": "N3 · interpretação e decisão. Texto de prova adora decisões, resultados e conclusões.",
  "chars": [
    "決"
  ],
  "jlpt": "N3",
  "group": "interpretação e decisão",
  "memo": "Texto de prova adora decisões, resultados e conclusões.",
  "onyomi": "ケツ",
  "kunyomi": "き",
  "strokes": "7",
  "examples": [
    {
      "jp": "決める",
      "romaji": "kimeru",
      "pt": "decidir"
    },
    {
      "jp": "決定",
      "romaji": "kettei",
      "pt": "decisão"
    },
    {
      "jp": "解決",
      "romaji": "kaiketsu",
      "pt": "solução"
    }
  ]
,
  "sentences": [
  {
    "type": "kunyomi",
    "word": "決める",
    "jp": "来月の目標を決めました。",
    "pt": "Decidi a meta do mês que vem.",
    "note": "決める = decidir"
  },
  {
    "type": "onyomi",
    "word": "決定",
    "jp": "シフトの変更が決定しました。",
    "pt": "A alteração do turno foi decidida.",
    "note": "決定 = decisão"
  },
  {
    "type": "onyomi",
    "word": "解決",
    "jp": "この問題を早く解決したいです。",
    "pt": "Quero resolver este problema rapidamente.",
    "note": "解決 = solução"
  }
]
},
{
  "id": "j_n3_teki",
  "category": "kanji",
  "focus": "的",
  "jp": "的",
  "romaji": "teki",
  "pt": "alvo / -ico",
  "type": "kanji",
  "hint": "N3 · interpretação e gramática. Transforma ideias em adjetivos: 具体的, 目的, 基本的.",
  "chars": [
    "的"
  ],
  "jlpt": "N3",
  "group": "interpretação e gramática",
  "memo": "Transforma ideias em adjetivos: 具体的, 目的, 基本的.",
  "onyomi": "テキ",
  "kunyomi": "まと",
  "strokes": "8",
  "examples": [
    {
      "jp": "目的",
      "romaji": "mokuteki",
      "pt": "objetivo"
    },
    {
      "jp": "具体的",
      "romaji": "gutaiteki",
      "pt": "concreto / específico"
    },
    {
      "jp": "基本的",
      "romaji": "kihonteki",
      "pt": "básico"
    }
  ]
},
{
  "id": "j_n3_tai",
  "category": "kanji",
  "focus": "対",
  "jp": "対",
  "romaji": "tai",
  "pt": "oposição / contra / para",
  "type": "kanji",
  "hint": "N3 · interpretação e gramática. Mostra relação entre lados, resposta e oposição.",
  "chars": [
    "対"
  ],
  "jlpt": "N3",
  "group": "interpretação e gramática",
  "memo": "Mostra relação entre lados, resposta e oposição.",
  "onyomi": "タイ, ツイ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "反対",
      "romaji": "hantai",
      "pt": "oposição"
    },
    {
      "jp": "対象",
      "romaji": "taishou",
      "pt": "alvo / objeto"
    },
    {
      "jp": "対応",
      "romaji": "taiou",
      "pt": "resposta / atendimento"
    }
  ]
},
{
  "id": "j_n3_han",
  "category": "kanji",
  "focus": "反",
  "jp": "反",
  "romaji": "han",
  "pt": "contra / anti",
  "type": "kanji",
  "hint": "N3 · interpretação e gramática. Ajuda a entender contraste, oposição e reação.",
  "chars": [
    "反"
  ],
  "jlpt": "N3",
  "group": "interpretação e gramática",
  "memo": "Ajuda a entender contraste, oposição e reação.",
  "onyomi": "ハン",
  "kunyomi": "そ, かえ",
  "strokes": "4",
  "examples": [
    {
      "jp": "反対",
      "romaji": "hantai",
      "pt": "oposição"
    },
    {
      "jp": "反応",
      "romaji": "hannou",
      "pt": "reação"
    },
    {
      "jp": "違反",
      "romaji": "ihan",
      "pt": "violação"
    }
  ]
},
{
  "id": "j_n3_kansei",
  "category": "kanji",
  "focus": "関",
  "jp": "関",
  "romaji": "kan",
  "pt": "relacionar / barreira",
  "type": "kanji",
  "hint": "N3 · interpretação e gramática. 関係 é leitura-chave para interpretar relações.",
  "chars": [
    "関"
  ],
  "jlpt": "N3",
  "group": "interpretação e gramática",
  "memo": "関係 é leitura-chave para interpretar relações.",
  "onyomi": "カン",
  "kunyomi": "せき",
  "strokes": "14",
  "examples": [
    {
      "jp": "関係",
      "romaji": "kankei",
      "pt": "relação"
    },
    {
      "jp": "関心",
      "romaji": "kanshin",
      "pt": "interesse"
    },
    {
      "jp": "関西",
      "romaji": "kansai",
      "pt": "Kansai"
    }
  ]
},
{
  "id": "j_n3_kei",
  "category": "kanji",
  "focus": "係",
  "jp": "係",
  "romaji": "kei",
  "pt": "responsável / relação",
  "type": "kanji",
  "hint": "N3 · interpretação e gramática. Aparece em relação e também responsável de setor.",
  "chars": [
    "係"
  ],
  "jlpt": "N3",
  "group": "interpretação e gramática",
  "memo": "Aparece em relação e também responsável de setor.",
  "onyomi": "ケイ",
  "kunyomi": "かか",
  "strokes": "9",
  "examples": [
    {
      "jp": "関係",
      "romaji": "kankei",
      "pt": "relação"
    },
    {
      "jp": "係員",
      "romaji": "kakariin",
      "pt": "funcionário responsável"
    },
    {
      "jp": "係",
      "romaji": "kakari",
      "pt": "responsável"
    }
  ]
},
{
  "id": "j_n3_kaisha_soshiki",
  "category": "kanji",
  "focus": "組",
  "jp": "組",
  "romaji": "kumi / so",
  "pt": "grupo / montar",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. Organização, equipe e mecanismo, vital no trabalho.",
  "chars": [
    "組"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "Organização, equipe e mecanismo, vital no trabalho.",
  "onyomi": "ソ",
  "kunyomi": "くみ, く",
  "strokes": "11",
  "examples": [
    {
      "jp": "組み立て",
      "romaji": "kumitate",
      "pt": "montagem"
    },
    {
      "jp": "組織",
      "romaji": "soshiki",
      "pt": "organização"
    },
    {
      "jp": "仕組み",
      "romaji": "shikumi",
      "pt": "estrutura / mecanismo"
    }
  ]
},
{
  "id": "j_n3_shiki",
  "category": "kanji",
  "focus": "織",
  "jp": "織",
  "romaji": "shiki / oru",
  "pt": "tecer / organização",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. Em 組織, ideias e pessoas são tecidas em sistema.",
  "chars": [
    "織"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "Em 組織, ideias e pessoas são tecidas em sistema.",
  "onyomi": "ショク, シキ",
  "kunyomi": "お",
  "strokes": "18",
  "examples": [
    {
      "jp": "組織",
      "romaji": "soshiki",
      "pt": "organização"
    },
    {
      "jp": "織物",
      "romaji": "orimono",
      "pt": "tecido"
    },
    {
      "jp": "知識",
      "romaji": "chishiki",
      "pt": "conhecimento"
    }
  ]
},
{
  "id": "j_n3_sekinin",
  "category": "kanji",
  "focus": "責",
  "jp": "責",
  "romaji": "seki",
  "pt": "responsabilidade / culpa",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. Sem entender 責任, não se entende mundo profissional japonês.",
  "chars": [
    "責"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "Sem entender 責任, não se entende mundo profissional japonês.",
  "onyomi": "セキ",
  "kunyomi": "せ",
  "strokes": "11",
  "examples": [
    {
      "jp": "責任",
      "romaji": "sekinin",
      "pt": "responsabilidade"
    },
    {
      "jp": "責める",
      "romaji": "semeru",
      "pt": "culpar"
    },
    {
      "jp": "無責任",
      "romaji": "musekinin",
      "pt": "irresponsável"
    }
  ]
},
{
  "id": "j_n3_nin",
  "category": "kanji",
  "focus": "任",
  "jp": "任",
  "romaji": "nin / makaseru",
  "pt": "responsabilidade / confiar",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. 任 é confiar uma função a alguém.",
  "chars": [
    "任"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "任 é confiar uma função a alguém.",
  "onyomi": "ニン",
  "kunyomi": "まか",
  "strokes": "6",
  "examples": [
    {
      "jp": "責任",
      "romaji": "sekinin",
      "pt": "responsabilidade"
    },
    {
      "jp": "任せる",
      "romaji": "makaseru",
      "pt": "confiar / deixar a cargo"
    },
    {
      "jp": "担当任務",
      "romaji": "tantou ninmu",
      "pt": "tarefa designada"
    }
  ]
},
{
  "id": "j_n3_tan",
  "category": "kanji",
  "focus": "担",
  "jp": "担",
  "romaji": "tan / katsugu",
  "pt": "assumir / carregar",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. 担当 é a pessoa encarregada, palavra vital no Japão.",
  "chars": [
    "担"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "担当 é a pessoa encarregada, palavra vital no Japão.",
  "onyomi": "タン",
  "kunyomi": "かつ",
  "strokes": "8",
  "examples": [
    {
      "jp": "担当",
      "romaji": "tantou",
      "pt": "responsável / encarregado"
    },
    {
      "jp": "負担",
      "romaji": "futan",
      "pt": "carga / peso"
    },
    {
      "jp": "担ぐ",
      "romaji": "katsugu",
      "pt": "carregar nos ombros"
    }
  ]
},
{
  "id": "j_n3_tou",
  "category": "kanji",
  "focus": "当",
  "jp": "当",
  "romaji": "tou / ataru",
  "pt": "acertar / corresponder",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. 当 mostra aquilo que bate certo: responsável, apropriado, acerto.",
  "chars": [
    "当"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "当 mostra aquilo que bate certo: responsável, apropriado, acerto.",
  "onyomi": "トウ",
  "kunyomi": "あ",
  "strokes": "6",
  "examples": [
    {
      "jp": "担当",
      "romaji": "tantou",
      "pt": "responsável"
    },
    {
      "jp": "本当",
      "romaji": "hontou",
      "pt": "verdade"
    },
    {
      "jp": "当たる",
      "romaji": "ataru",
      "pt": "acertar / bater"
    }
  ]
},
{
  "id": "j_n3_shoku",
  "category": "kanji",
  "focus": "職",
  "jp": "職",
  "romaji": "shoku",
  "pt": "emprego / profissão",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. Kanji de profissão, carreira e local de trabalho.",
  "chars": [
    "職"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "Kanji de profissão, carreira e local de trabalho.",
  "onyomi": "ショク",
  "kunyomi": "",
  "strokes": "18",
  "examples": [
    {
      "jp": "職場",
      "romaji": "shokuba",
      "pt": "local de trabalho"
    },
    {
      "jp": "職員",
      "romaji": "shokuin",
      "pt": "funcionário"
    },
    {
      "jp": "就職",
      "romaji": "shuushoku",
      "pt": "conseguir emprego"
    }
  ]
},
{
  "id": "j_n3_rou",
  "category": "kanji",
  "focus": "労",
  "jp": "労",
  "romaji": "rou",
  "pt": "trabalho / esforço",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. Trabalho como esforço físico e social.",
  "chars": [
    "労"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "Trabalho como esforço físico e social.",
  "onyomi": "ロウ",
  "kunyomi": "ねぎら",
  "strokes": "7",
  "examples": [
    {
      "jp": "労働",
      "romaji": "roudou",
      "pt": "trabalho / labor"
    },
    {
      "jp": "疲労",
      "romaji": "hirou",
      "pt": "fadiga"
    },
    {
      "jp": "苦労",
      "romaji": "kurou",
      "pt": "dificuldade / esforço"
    }
  ]
},
{
  "id": "j_n3_dou_work",
  "category": "kanji",
  "focus": "働",
  "jp": "働",
  "romaji": "dou / hataraku",
  "pt": "trabalhar",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. O kanji mais direto para a vida do trabalhador.",
  "chars": [
    "働"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "O kanji mais direto para a vida do trabalhador.",
  "onyomi": "ドウ",
  "kunyomi": "はたら",
  "strokes": "13",
  "examples": [
    {
      "jp": "働く",
      "romaji": "hataraku",
      "pt": "trabalhar"
    },
    {
      "jp": "労働",
      "romaji": "roudou",
      "pt": "trabalho"
    },
    {
      "jp": "働き方",
      "romaji": "hatarakikata",
      "pt": "modo de trabalhar"
    }
  ]
},
{
  "id": "j_n3_kei_contract",
  "category": "kanji",
  "focus": "経",
  "jp": "経",
  "romaji": "kei / heru",
  "pt": "passar / administrar",
  "type": "kanji",
  "hint": "N3 · trabalho e sociedade. Usado em experiência, economia e gestão.",
  "chars": [
    "経"
  ],
  "jlpt": "N3",
  "group": "trabalho e sociedade",
  "memo": "Usado em experiência, economia e gestão.",
  "onyomi": "ケイ, キョウ",
  "kunyomi": "へ",
  "strokes": "11",
  "examples": [
    {
      "jp": "経験",
      "romaji": "keiken",
      "pt": "experiência"
    },
    {
      "jp": "経済",
      "romaji": "keizai",
      "pt": "economia"
    },
    {
      "jp": "経つ",
      "romaji": "tatsu",
      "pt": "passar tempo"
    }
  ]
},
{
  "id": "j_n3_keiken",
  "category": "kanji",
  "focus": "験",
  "jp": "験",
  "romaji": "ken",
  "pt": "teste / experiência",
  "type": "kanji",
  "hint": "N3 · prova e conhecimento. Experiência também é algo comprovado.",
  "chars": [
    "験"
  ],
  "jlpt": "N3",
  "group": "prova e conhecimento",
  "memo": "Experiência também é algo comprovado.",
  "onyomi": "ケン, ゲン",
  "kunyomi": "",
  "strokes": "18",
  "examples": [
    {
      "jp": "経験",
      "romaji": "keiken",
      "pt": "experiência"
    },
    {
      "jp": "試験",
      "romaji": "shiken",
      "pt": "prova / exame"
    },
    {
      "jp": "実験",
      "romaji": "jikken",
      "pt": "experimento"
    }
  ]
},
{
  "id": "j_n3_shi_exam",
  "category": "kanji",
  "focus": "試",
  "jp": "試",
  "romaji": "shi / tamesu",
  "pt": "testar / provar",
  "type": "kanji",
  "hint": "N3 · prova e conhecimento. Prova é tentativa formal: 試験.",
  "chars": [
    "試"
  ],
  "jlpt": "N3",
  "group": "prova e conhecimento",
  "memo": "Prova é tentativa formal: 試験.",
  "onyomi": "シ",
  "kunyomi": "ため",
  "strokes": "13",
  "examples": [
    {
      "jp": "試験",
      "romaji": "shiken",
      "pt": "prova / exame"
    },
    {
      "jp": "試す",
      "romaji": "tamesu",
      "pt": "testar"
    },
    {
      "jp": "試合",
      "romaji": "shiai",
      "pt": "partida / jogo"
    }
  ]
},
{
  "id": "j_n3_jutsu",
  "category": "kanji",
  "focus": "術",
  "jp": "術",
  "romaji": "jutsu",
  "pt": "técnica / arte",
  "type": "kanji",
  "hint": "N3 · prova e conhecimento. Fluência exige técnica, não só força bruta.",
  "chars": [
    "術"
  ],
  "jlpt": "N3",
  "group": "prova e conhecimento",
  "memo": "Fluência exige técnica, não só força bruta.",
  "onyomi": "ジュツ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "技術",
      "romaji": "gijutsu",
      "pt": "técnica / tecnologia"
    },
    {
      "jp": "手術",
      "romaji": "shujutsu",
      "pt": "cirurgia"
    },
    {
      "jp": "美術",
      "romaji": "bijutsu",
      "pt": "arte"
    }
  ]
},
{
  "id": "j_n3_gi",
  "category": "kanji",
  "focus": "技",
  "jp": "技",
  "romaji": "gi / waza",
  "pt": "técnica / habilidade",
  "type": "kanji",
  "hint": "N3 · prova e conhecimento. Kanji da habilidade prática: técnica que vira domínio.",
  "chars": [
    "技"
  ],
  "jlpt": "N3",
  "group": "prova e conhecimento",
  "memo": "Kanji da habilidade prática: técnica que vira domínio.",
  "onyomi": "ギ",
  "kunyomi": "わざ",
  "strokes": "7",
  "examples": [
    {
      "jp": "技術",
      "romaji": "gijutsu",
      "pt": "técnica"
    },
    {
      "jp": "技能",
      "romaji": "ginou",
      "pt": "habilidade técnica"
    },
    {
      "jp": "技",
      "romaji": "waza",
      "pt": "técnica"
    }
  ]
},
{
  "id": "j_n3_nou",
  "category": "kanji",
  "focus": "能",
  "jp": "能",
  "romaji": "nou",
  "pt": "habilidade / capacidade",
  "type": "kanji",
  "hint": "N3 · prova e conhecimento. Capacidade de entender, agir e interpretar.",
  "chars": [
    "能"
  ],
  "jlpt": "N3",
  "group": "prova e conhecimento",
  "memo": "Capacidade de entender, agir e interpretar.",
  "onyomi": "ノウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "能力",
      "romaji": "nouryoku",
      "pt": "capacidade"
    },
    {
      "jp": "可能",
      "romaji": "kanou",
      "pt": "possível"
    },
    {
      "jp": "技能",
      "romaji": "ginou",
      "pt": "habilidade técnica"
    }
  ]
},
{
  "id": "j_n3_ryoku",
  "category": "kanji",
  "focus": "力",
  "jp": "力",
  "romaji": "ryoku / chikara",
  "pt": "força / capacidade",
  "type": "kanji",
  "hint": "N3 · prova e conhecimento. 力 é força, mas em 能力 vira capacidade.",
  "chars": [
    "力"
  ],
  "jlpt": "N3",
  "group": "prova e conhecimento",
  "memo": "力 é força, mas em 能力 vira capacidade.",
  "onyomi": "リョク, リキ",
  "kunyomi": "ちから",
  "strokes": "2",
  "examples": [
    {
      "jp": "能力",
      "romaji": "nouryoku",
      "pt": "capacidade"
    },
    {
      "jp": "力",
      "romaji": "chikara",
      "pt": "força"
    },
    {
      "jp": "努力",
      "romaji": "doryoku",
      "pt": "esforço"
    }
  ]
},
{
  "id": "j_n3_doryoku",
  "category": "kanji",
  "focus": "努",
  "jp": "努",
  "romaji": "do / tsutomeru",
  "pt": "esforçar-se",
  "type": "kanji",
  "hint": "N3 · prova e conhecimento. 努力 é o motor silencioso da fluência.",
  "chars": [
    "努"
  ],
  "jlpt": "N3",
  "group": "prova e conhecimento",
  "memo": "努力 é o motor silencioso da fluência.",
  "onyomi": "ド",
  "kunyomi": "つと",
  "strokes": "7",
  "examples": [
    {
      "jp": "努力",
      "romaji": "doryoku",
      "pt": "esforço"
    },
    {
      "jp": "努める",
      "romaji": "tsutomeru",
      "pt": "esforçar-se"
    },
    {
      "jp": "努力家",
      "romaji": "doryokuka",
      "pt": "pessoa esforçada"
    }
  ]
},
{
  "id": "j_n2_seido",
  "category": "kanji",
  "focus": "制",
  "jp": "制",
  "romaji": "sei",
  "pt": "sistema / controle",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. N2 exige entender制度, regras e estruturas formais.",
  "chars": [
    "制"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "N2 exige entender制度, regras e estruturas formais.",
  "onyomi": "セイ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "制度",
      "romaji": "seido",
      "pt": "sistema /制度"
    },
    {
      "jp": "制服",
      "romaji": "seifuku",
      "pt": "uniforme"
    },
    {
      "jp": "制限",
      "romaji": "seigen",
      "pt": "limitação"
    }
  ]
},
{
  "id": "j_n2_do_system",
  "category": "kanji",
  "focus": "度",
  "jp": "度",
  "romaji": "do / tabi",
  "pt": "grau / vez / sistema",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 度 aparece em制度, temperatura, frequência e grau.",
  "chars": [
    "度"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "度 aparece em制度, temperatura, frequência e grau.",
  "onyomi": "ド, ト",
  "kunyomi": "たび",
  "strokes": "9",
  "examples": [
    {
      "jp": "制度",
      "romaji": "seido",
      "pt": "sistema"
    },
    {
      "jp": "温度",
      "romaji": "ondo",
      "pt": "temperatura"
    },
    {
      "jp": "一度",
      "romaji": "ichido",
      "pt": "uma vez"
    }
  ]
},
{
  "id": "j_n2_shinsei",
  "category": "kanji",
  "focus": "申",
  "jp": "申",
  "romaji": "shin / mousu",
  "pt": "declarar / solicitar",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 申請 é pedir oficialmente ao sistema.",
  "chars": [
    "申"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "申請 é pedir oficialmente ao sistema.",
  "onyomi": "シン",
  "kunyomi": "もう",
  "strokes": "5",
  "examples": [
    {
      "jp": "申請",
      "romaji": "shinsei",
      "pt": "solicitação formal"
    },
    {
      "jp": "申し込む",
      "romaji": "moushikomu",
      "pt": "inscrever-se"
    },
    {
      "jp": "申す",
      "romaji": "mousu",
      "pt": "dizer humildemente"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "申請",
    "jp": "ビザの更新を申請しました。",
    "pt": "Solicitei a renovação do visto.",
    "note": "申請 = solicitação formal"
  },
  {
    "type": "kunyomi",
    "word": "申し込む",
    "jp": "日本語の試験に申し込みました。",
    "pt": "Fiz inscrição para a prova de japonês.",
    "note": "申し込む = inscrever-se"
  },
  {
    "type": "kunyomi",
    "word": "申す",
    "jp": "田中と申します。",
    "pt": "Chamo-me Tanaka.",
    "note": "申す = dizer humildemente"
  }
]
},
{
  "id": "j_n2_sei_request",
  "category": "kanji",
  "focus": "請",
  "jp": "請",
  "romaji": "sei / kou",
  "pt": "solicitar / pedir",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 請 dá peso formal ao pedido.",
  "chars": [
    "請"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "請 dá peso formal ao pedido.",
  "onyomi": "セイ, シン",
  "kunyomi": "こ, う",
  "strokes": "15",
  "examples": [
    {
      "jp": "申請",
      "romaji": "shinsei",
      "pt": "solicitação formal"
    },
    {
      "jp": "請求",
      "romaji": "seikyuu",
      "pt": "cobrança / solicitação"
    },
    {
      "jp": "要請",
      "romaji": "yousei",
      "pt": "pedido / requisição"
    }
  ]
},
{
  "id": "j_n2_kou_update",
  "category": "kanji",
  "focus": "更",
  "jp": "更",
  "romaji": "kou / sara",
  "pt": "renovar / novamente",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 更新 é atualizar ou renovar documento, contrato, sistema.",
  "chars": [
    "更"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "更新 é atualizar ou renovar documento, contrato, sistema.",
  "onyomi": "コウ",
  "kunyomi": "さら, ふ",
  "strokes": "7",
  "examples": [
    {
      "jp": "更新",
      "romaji": "koushin",
      "pt": "renovação / atualização"
    },
    {
      "jp": "変更",
      "romaji": "henkou",
      "pt": "alteração"
    },
    {
      "jp": "更に",
      "romaji": "sara ni",
      "pt": "além disso"
    }
  ]
},
{
  "id": "j_n2_jou_condition",
  "category": "kanji",
  "focus": "条",
  "jp": "条",
  "romaji": "jou",
  "pt": "artigo / condição",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. Condições e cláusulas aparecem com 条.",
  "chars": [
    "条"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "Condições e cláusulas aparecem com 条.",
  "onyomi": "ジョウ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "条件",
      "romaji": "jouken",
      "pt": "condição"
    },
    {
      "jp": "条約",
      "romaji": "jouyaku",
      "pt": "tratado"
    },
    {
      "jp": "条例",
      "romaji": "jourei",
      "pt": "regulamento municipal"
    }
  ]
},
{
  "id": "j_n2_ken_condition",
  "category": "kanji",
  "focus": "件",
  "jp": "件",
  "romaji": "ken",
  "pt": "caso / assunto",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 件 é caso, assunto, requisito.",
  "chars": [
    "件"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "件 é caso, assunto, requisito.",
  "onyomi": "ケン",
  "kunyomi": "くだん",
  "strokes": "6",
  "examples": [
    {
      "jp": "条件",
      "romaji": "jouken",
      "pt": "condição"
    },
    {
      "jp": "事件",
      "romaji": "jiken",
      "pt": "incidente / caso"
    },
    {
      "jp": "件名",
      "romaji": "kenmei",
      "pt": "assunto do e-mail"
    }
  ]
},
{
  "id": "j_n2_gimu",
  "category": "kanji",
  "focus": "義",
  "jp": "義",
  "romaji": "gi",
  "pt": "justiça / obrigação",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 義務 é obrigação: conceito vital em lei e trabalho.",
  "chars": [
    "義"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "義務 é obrigação: conceito vital em lei e trabalho.",
  "onyomi": "ギ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "義務",
      "romaji": "gimu",
      "pt": "obrigação"
    },
    {
      "jp": "正義",
      "romaji": "seigi",
      "pt": "justiça"
    },
    {
      "jp": "主義",
      "romaji": "shugi",
      "pt": "princípio / ideologia"
    }
  ]
},
{
  "id": "j_n2_kenri",
  "category": "kanji",
  "focus": "権",
  "jp": "権",
  "romaji": "ken",
  "pt": "direito / autoridade",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 権利 é direito, essencial para entender vida civil.",
  "chars": [
    "権"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "権利 é direito, essencial para entender vida civil.",
  "onyomi": "ケン, ゴン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "権利",
      "romaji": "kenri",
      "pt": "direito"
    },
    {
      "jp": "権限",
      "romaji": "kengen",
      "pt": "autoridade / permissão"
    },
    {
      "jp": "人権",
      "romaji": "jinken",
      "pt": "direitos humanos"
    }
  ]
},
{
  "id": "j_n2_ri_right",
  "category": "kanji",
  "focus": "利",
  "jp": "利",
  "romaji": "ri / kiku",
  "pt": "benefício / vantagem",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. 利 é vantagem, direito e utilidade.",
  "chars": [
    "利"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "利 é vantagem, direito e utilidade.",
  "onyomi": "リ",
  "kunyomi": "き",
  "strokes": "7",
  "examples": [
    {
      "jp": "権利",
      "romaji": "kenri",
      "pt": "direito"
    },
    {
      "jp": "便利",
      "romaji": "benri",
      "pt": "conveniente"
    },
    {
      "jp": "利益",
      "romaji": "rieki",
      "pt": "lucro / benefício"
    }
  ]
},
{
  "id": "j_n2_sekinin",
  "category": "kanji",
  "focus": "責",
  "jp": "責",
  "romaji": "seki",
  "pt": "responsabilidade",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. Responsabilidade formal em contrato, trabalho e sociedade.",
  "chars": [
    "責"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "Responsabilidade formal em contrato, trabalho e sociedade.",
  "onyomi": "セキ",
  "kunyomi": "せ",
  "strokes": "11",
  "examples": [
    {
      "jp": "責任",
      "romaji": "sekinin",
      "pt": "responsabilidade"
    },
    {
      "jp": "無責任",
      "romaji": "musekinin",
      "pt": "irresponsável"
    },
    {
      "jp": "責任者",
      "romaji": "sekininsha",
      "pt": "responsável"
    }
  ]
},
{
  "id": "j_n2_hoken",
  "category": "kanji",
  "focus": "保",
  "jp": "保",
  "romaji": "ho / tamotsu",
  "pt": "proteger / manter",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. Seguro, proteção e manutenção passam por 保.",
  "chars": [
    "保"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "Seguro, proteção e manutenção passam por 保.",
  "onyomi": "ホ, ホウ",
  "kunyomi": "たも",
  "strokes": "9",
  "examples": [
    {
      "jp": "保険",
      "romaji": "hoken",
      "pt": "seguro"
    },
    {
      "jp": "保存",
      "romaji": "hozon",
      "pt": "preservação"
    },
    {
      "jp": "保つ",
      "romaji": "tamotsu",
      "pt": "manter"
    }
  ]
},
{
  "id": "j_n2_ken_insurance",
  "category": "kanji",
  "focus": "険",
  "jp": "険",
  "romaji": "ken",
  "pt": "risco / seguro",
  "type": "kanji",
  "hint": "N2 · documentos e sistemas. Em 保険, risco administrado vira seguro.",
  "chars": [
    "険"
  ],
  "jlpt": "N2",
  "group": "documentos e sistemas",
  "memo": "Em 保険, risco administrado vira seguro.",
  "onyomi": "ケン",
  "kunyomi": "けわ",
  "strokes": "11",
  "examples": [
    {
      "jp": "保険",
      "romaji": "hoken",
      "pt": "seguro"
    },
    {
      "jp": "危険",
      "romaji": "kiken",
      "pt": "perigo"
    },
    {
      "jp": "冒険",
      "romaji": "bouken",
      "pt": "aventura"
    }
  ]
},
{
  "id": "j_n2_keizai",
  "category": "kanji",
  "focus": "済",
  "jp": "済",
  "romaji": "sai / sumu",
  "pt": "concluir / economia",
  "type": "kanji",
  "hint": "N2 · notícias e sociedade. 経済 é palavra-chave em notícias e vida adulta.",
  "chars": [
    "済"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "経済 é palavra-chave em notícias e vida adulta.",
  "onyomi": "サイ",
  "kunyomi": "す",
  "strokes": "11",
  "examples": [
    {
      "jp": "経済",
      "romaji": "keizai",
      "pt": "economia"
    },
    {
      "jp": "済む",
      "romaji": "sumu",
      "pt": "terminar / resolver-se"
    },
    {
      "jp": "返済",
      "romaji": "hensai",
      "pt": "reembolso / pagamento de dívida"
    }
  ]
},
{
  "id": "j_n2_sangyou",
  "category": "kanji",
  "focus": "産",
  "jp": "産",
  "romaji": "san",
  "pt": "produção / nascimento",
  "type": "kanji",
  "hint": "N2 · notícias e sociedade. Indústria, produção e nascimento social.",
  "chars": [
    "産"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Indústria, produção e nascimento social.",
  "onyomi": "サン",
  "kunyomi": "う, うぶ",
  "strokes": "11",
  "examples": [
    {
      "jp": "産業",
      "romaji": "sangyou",
      "pt": "indústria"
    },
    {
      "jp": "生産",
      "romaji": "seisan",
      "pt": "produção"
    },
    {
      "jp": "出産",
      "romaji": "shussan",
      "pt": "parto"
    }
  ]
},
{
  "id": "j_n2_seiji",
  "category": "kanji",
  "focus": "政",
  "jp": "政",
  "romaji": "sei",
  "pt": "política / governo",
  "type": "kanji",
  "hint": "N2 · notícias e sociedade. Notícias e documentos sérios usam política como pano de fundo.",
  "chars": [
    "政"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Notícias e documentos sérios usam política como pano de fundo.",
  "onyomi": "セイ, ショウ",
  "kunyomi": "まつりごと",
  "strokes": "9",
  "examples": [
    {
      "jp": "政治",
      "romaji": "seiji",
      "pt": "política"
    },
    {
      "jp": "政府",
      "romaji": "seifu",
      "pt": "governo"
    },
    {
      "jp": "行政",
      "romaji": "gyousei",
      "pt": "administração pública"
    }
  ]
},
{
  "id": "j_n2_chi_govern",
  "category": "kanji",
  "focus": "治",
  "jp": "治",
  "romaji": "chi / osameru",
  "pt": "governar / curar",
  "type": "kanji",
  "hint": "N2 · notícias e sociedade. Curar, governar e controlar aparecem em 治.",
  "chars": [
    "治"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Curar, governar e controlar aparecem em 治.",
  "onyomi": "チ, ジ",
  "kunyomi": "おさ, なお",
  "strokes": "8",
  "examples": [
    {
      "jp": "政治",
      "romaji": "seiji",
      "pt": "política"
    },
    {
      "jp": "治る",
      "romaji": "naoru",
      "pt": "curar-se"
    },
    {
      "jp": "治療",
      "romaji": "chiryou",
      "pt": "tratamento"
    }
  ]
},
{
  "id": "j_n2_hou_law",
  "category": "kanji",
  "focus": "法",
  "jp": "法",
  "romaji": "hou",
  "pt": "lei / método",
  "type": "kanji",
  "hint": "N2 · notícias e sociedade. Lei e método: uma palavra pequena com peso enorme.",
  "chars": [
    "法"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Lei e método: uma palavra pequena com peso enorme.",
  "onyomi": "ホウ, ハッ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "法律",
      "romaji": "houritsu",
      "pt": "lei"
    },
    {
      "jp": "方法",
      "romaji": "houhou",
      "pt": "método"
    },
    {
      "jp": "文法",
      "romaji": "bunpou",
      "pt": "gramática"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "方法",
    "jp": "もっと良い勉強方法を探しています。",
    "pt": "Estou procurando um método melhor de estudo.",
    "note": "方法 = método"
  },
  {
    "type": "onyomi",
    "word": "法律",
    "jp": "日本の法律を守らなければなりません。",
    "pt": "É preciso respeitar as leis do Japão.",
    "note": "法律 = lei"
  },
  {
    "type": "onyomi",
    "word": "文法",
    "jp": "文法だけでなく会話も練習します。",
    "pt": "Vou praticar não só gramática, mas também conversação.",
    "note": "文法 = gramática"
  }
]
},
{
  "id": "j_n2_ritsu",
  "category": "kanji",
  "focus": "律",
  "jp": "律",
  "romaji": "ritsu",
  "pt": "lei / ritmo",
  "type": "kanji",
  "hint": "N2 · notícias e sociedade. Em 法律, dá a força da regra formal.",
  "chars": [
    "律"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Em 法律, dá a força da regra formal.",
  "onyomi": "リツ, リチ",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "法律",
      "romaji": "houritsu",
      "pt": "lei"
    },
    {
      "jp": "規律",
      "romaji": "kiritsu",
      "pt": "disciplina"
    },
    {
      "jp": "自律",
      "romaji": "jiritsu",
      "pt": "autonomia"
    }
  ]
},
{
  "id": "j_n2_kokusai",
  "category": "kanji",
  "focus": "際",
  "jp": "際",
  "romaji": "sai",
  "pt": "ocasião / fronteira",
  "type": "kanji",
  "hint": "N2 · notícias e sociedade. Internacional e situação real aparecem com 際.",
  "chars": [
    "際"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Internacional e situação real aparecem com 際.",
  "onyomi": "サイ",
  "kunyomi": "きわ",
  "strokes": "14",
  "examples": [
    {
      "jp": "国際",
      "romaji": "kokusai",
      "pt": "internacional"
    },
    {
      "jp": "実際",
      "romaji": "jissai",
      "pt": "realmente / na prática"
    },
    {
      "jp": "この際",
      "romaji": "kono sai",
      "pt": "nesta ocasião"
    }
  ]
},
{
  "id": "j_n1_gainen",
  "category": "kanji",
  "focus": "概",
  "jp": "概",
  "romaji": "gai",
  "pt": "visão geral / conceito",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. N1 exige ver o todo antes dos detalhes.",
  "chars": [
    "概"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "N1 exige ver o todo antes dos detalhes.",
  "onyomi": "ガイ",
  "kunyomi": "おおむ",
  "strokes": "14",
  "examples": [
    {
      "jp": "概念",
      "romaji": "gainen",
      "pt": "conceito"
    },
    {
      "jp": "概要",
      "romaji": "gaiyou",
      "pt": "resumo / visão geral"
    },
    {
      "jp": "大概",
      "romaji": "taigai",
      "pt": "em geral"
    }
  ]
},
{
  "id": "j_n1_nen_concept",
  "category": "kanji",
  "focus": "念",
  "jp": "念",
  "romaji": "nen",
  "pt": "pensamento / cuidado",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. 念 é pensamento fixado, preocupação ou conceito interno.",
  "chars": [
    "念"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "念 é pensamento fixado, preocupação ou conceito interno.",
  "onyomi": "ネン",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "概念",
      "romaji": "gainen",
      "pt": "conceito"
    },
    {
      "jp": "残念",
      "romaji": "zannen",
      "pt": "lamentável"
    },
    {
      "jp": "記念",
      "romaji": "kinen",
      "pt": "comemoração"
    }
  ]
},
{
  "id": "j_n1_chuushou",
  "category": "kanji",
  "focus": "抽",
  "jp": "抽",
  "romaji": "chuu",
  "pt": "extrair / puxar",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. 抽象 é extrair a essência de algo.",
  "chars": [
    "抽"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "抽象 é extrair a essência de algo.",
  "onyomi": "チュウ",
  "kunyomi": "ひき",
  "strokes": "8",
  "examples": [
    {
      "jp": "抽象的",
      "romaji": "chuushouteki",
      "pt": "abstrato"
    },
    {
      "jp": "抽選",
      "romaji": "chuusen",
      "pt": "sorteio"
    },
    {
      "jp": "抽出",
      "romaji": "chuushutsu",
      "pt": "extração"
    }
  ]
},
{
  "id": "j_n1_shou_abstract",
  "category": "kanji",
  "focus": "象",
  "jp": "象",
  "romaji": "shou / zou",
  "pt": "fenômeno / elefante",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. 象 aparece em fenômenos, símbolos e abstração.",
  "chars": [
    "象"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "象 aparece em fenômenos, símbolos e abstração.",
  "onyomi": "ショウ, ゾウ",
  "kunyomi": "かたど",
  "strokes": "12",
  "examples": [
    {
      "jp": "抽象",
      "romaji": "chuushou",
      "pt": "abstração"
    },
    {
      "jp": "対象",
      "romaji": "taishou",
      "pt": "objeto / alvo"
    },
    {
      "jp": "印象",
      "romaji": "inshou",
      "pt": "impressão"
    }
  ]
},
{
  "id": "j_n1_ron",
  "category": "kanji",
  "focus": "論",
  "jp": "論",
  "romaji": "ron",
  "pt": "teoria / argumento",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. 論 é a espinha da argumentação avançada.",
  "chars": [
    "論"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "論 é a espinha da argumentação avançada.",
  "onyomi": "ロン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "論文",
      "romaji": "ronbun",
      "pt": "artigo acadêmico"
    },
    {
      "jp": "理論",
      "romaji": "riron",
      "pt": "teoria"
    },
    {
      "jp": "議論",
      "romaji": "giron",
      "pt": "discussão"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "議論",
    "jp": "この問題について議論する必要があります。",
    "pt": "É necessário discutir sobre este problema.",
    "note": "議論 = discussão"
  },
  {
    "type": "onyomi",
    "word": "理論",
    "jp": "理論だけでなく実際の使い方も大切です。",
    "pt": "Não só a teoria, mas o uso real também é importante.",
    "note": "理論 = teoria"
  },
  {
    "type": "onyomi",
    "word": "論文",
    "jp": "この論文は専門的で難しいです。",
    "pt": "Este artigo é técnico e difícil.",
    "note": "論文 = artigo acadêmico"
  }
]
},
{
  "id": "j_n1_gi_discuss",
  "category": "kanji",
  "focus": "議",
  "jp": "議",
  "romaji": "gi",
  "pt": "deliberação / discussão",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. 議 aparece quando ideias entram em debate formal.",
  "chars": [
    "議"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "議 aparece quando ideias entram em debate formal.",
  "onyomi": "ギ",
  "kunyomi": "",
  "strokes": "20",
  "examples": [
    {
      "jp": "会議",
      "romaji": "kaigi",
      "pt": "reunião"
    },
    {
      "jp": "議論",
      "romaji": "giron",
      "pt": "discussão"
    },
    {
      "jp": "不思議",
      "romaji": "fushigi",
      "pt": "misterioso"
    }
  ]
},
{
  "id": "j_n1_kijun",
  "category": "kanji",
  "focus": "基",
  "jp": "基",
  "romaji": "ki",
  "pt": "base / fundamento",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. Todo texto avançado depende de base e critério.",
  "chars": [
    "基"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "Todo texto avançado depende de base e critério.",
  "onyomi": "キ",
  "kunyomi": "もと",
  "strokes": "11",
  "examples": [
    {
      "jp": "基本",
      "romaji": "kihon",
      "pt": "base / básico"
    },
    {
      "jp": "基準",
      "romaji": "kijun",
      "pt": "critério"
    },
    {
      "jp": "基地",
      "romaji": "kichi",
      "pt": "base"
    }
  ]
},
{
  "id": "j_n1_jun",
  "category": "kanji",
  "focus": "準",
  "jp": "準",
  "romaji": "jun",
  "pt": "padrão / quase",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. 準 é critério, nível e preparação.",
  "chars": [
    "準"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "準 é critério, nível e preparação.",
  "onyomi": "ジュン",
  "kunyomi": "なぞら",
  "strokes": "13",
  "examples": [
    {
      "jp": "基準",
      "romaji": "kijun",
      "pt": "critério"
    },
    {
      "jp": "準備",
      "romaji": "junbi",
      "pt": "preparação"
    },
    {
      "jp": "標準",
      "romaji": "hyoujun",
      "pt": "padrão"
    }
  ]
},
{
  "id": "j_n1_hyou",
  "category": "kanji",
  "focus": "標",
  "jp": "標",
  "romaji": "hyou",
  "pt": "marco / sinal / padrão",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. Objetivo, padrão e sinal aparecem com 標.",
  "chars": [
    "標"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "Objetivo, padrão e sinal aparecem com 標.",
  "onyomi": "ヒョウ",
  "kunyomi": "しるべ",
  "strokes": "15",
  "examples": [
    {
      "jp": "目標",
      "romaji": "mokuhyou",
      "pt": "meta"
    },
    {
      "jp": "標準",
      "romaji": "hyoujun",
      "pt": "padrão"
    },
    {
      "jp": "標識",
      "romaji": "hyoushiki",
      "pt": "sinalização"
    }
  ]
},
{
  "id": "j_n1_shiki",
  "category": "kanji",
  "focus": "識",
  "jp": "識",
  "romaji": "shiki",
  "pt": "discernimento / conhecimento",
  "type": "kanji",
  "hint": "N1 · abstração e interpretação. 識 é reconhecer com consciência.",
  "chars": [
    "識"
  ],
  "jlpt": "N1",
  "group": "abstração e interpretação",
  "memo": "識 é reconhecer com consciência.",
  "onyomi": "シキ",
  "kunyomi": "",
  "strokes": "19",
  "examples": [
    {
      "jp": "知識",
      "romaji": "chishiki",
      "pt": "conhecimento"
    },
    {
      "jp": "意識",
      "romaji": "ishiki",
      "pt": "consciência"
    },
    {
      "jp": "常識",
      "romaji": "joushiki",
      "pt": "senso comum"
    }
  ]
,
  "sentences": [
  {
    "type": "onyomi",
    "word": "知識",
    "jp": "漢字の知識を少しずつ増やします。",
    "pt": "Vou aumentar meu conhecimento de kanji aos poucos.",
    "note": "知識 = conhecimento"
  },
  {
    "type": "onyomi",
    "word": "意識",
    "jp": "発音を意識して練習してください。",
    "pt": "Treine prestando atenção na pronúncia.",
    "note": "意識 = consciência/atenção"
  },
  {
    "type": "onyomi",
    "word": "常識",
    "jp": "日本の常識を理解することも大切です。",
    "pt": "Também é importante entender o senso comum do Japão.",
    "note": "常識 = senso comum"
  }
]
},
{
  "id": "j_n1_sai",
  "category": "kanji",
  "focus": "際",
  "jp": "際",
  "romaji": "sai",
  "pt": "ocasião / limite",
  "type": "kanji",
  "hint": "N1 · linguagem formal. Em linguagem formal, 際 costura contexto e ocasião.",
  "chars": [
    "際"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "Em linguagem formal, 際 costura contexto e ocasião.",
  "onyomi": "サイ",
  "kunyomi": "きわ",
  "strokes": "14",
  "examples": [
    {
      "jp": "実際",
      "romaji": "jissai",
      "pt": "na prática"
    },
    {
      "jp": "この際",
      "romaji": "kono sai",
      "pt": "nesta ocasião"
    },
    {
      "jp": "国際",
      "romaji": "kokusai",
      "pt": "internacional"
    }
  ]
},
{
  "id": "j_n1_zenzen",
  "category": "kanji",
  "focus": "然",
  "jp": "然",
  "romaji": "zen / nen",
  "pt": "estado natural",
  "type": "kanji",
  "hint": "N1 · linguagem formal. 然 aparece em palavras abstratas como 自然, 当然, 全然.",
  "chars": [
    "然"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "然 aparece em palavras abstratas como 自然, 当然, 全然.",
  "onyomi": "ゼン, ネン",
  "kunyomi": "しか",
  "strokes": "12",
  "examples": [
    {
      "jp": "自然",
      "romaji": "shizen",
      "pt": "natureza / natural"
    },
    {
      "jp": "当然",
      "romaji": "touzen",
      "pt": "naturalmente / óbvio"
    },
    {
      "jp": "全然",
      "romaji": "zenzen",
      "pt": "de forma alguma"
    }
  ]
},
{
  "id": "j_n1_touzen",
  "category": "kanji",
  "focus": "当",
  "jp": "当",
  "romaji": "tou / ataru",
  "pt": "corresponder / acertar",
  "type": "kanji",
  "hint": "N1 · linguagem formal. Em N1, 当 ajuda a ler validade, pertinência e naturalidade.",
  "chars": [
    "当"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "Em N1, 当 ajuda a ler validade, pertinência e naturalidade.",
  "onyomi": "トウ",
  "kunyomi": "あ",
  "strokes": "6",
  "examples": [
    {
      "jp": "当然",
      "romaji": "touzen",
      "pt": "óbvio / natural"
    },
    {
      "jp": "該当",
      "romaji": "gaitou",
      "pt": "corresponder / aplicar-se"
    },
    {
      "jp": "妥当",
      "romaji": "datou",
      "pt": "adequado"
    }
  ]
},
{
  "id": "j_n1_gai_applicable",
  "category": "kanji",
  "focus": "該",
  "jp": "該",
  "romaji": "gai",
  "pt": "o referido / aplicável",
  "type": "kanji",
  "hint": "N1 · linguagem formal. Muito usado em documentos: o item em questão.",
  "chars": [
    "該"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "Muito usado em documentos: o item em questão.",
  "onyomi": "ガイ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "該当",
      "romaji": "gaitou",
      "pt": "aplicável / correspondente"
    },
    {
      "jp": "当該",
      "romaji": "tougai",
      "pt": "referido / em questão"
    },
    {
      "jp": "該当者",
      "romaji": "gaitousha",
      "pt": "pessoa correspondente"
    }
  ]
},
{
  "id": "j_n1_datou",
  "category": "kanji",
  "focus": "妥",
  "jp": "妥",
  "romaji": "da",
  "pt": "adequado / conciliado",
  "type": "kanji",
  "hint": "N1 · linguagem formal. 妥当 é avaliação de adequação em textos densos.",
  "chars": [
    "妥"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "妥当 é avaliação de adequação em textos densos.",
  "onyomi": "ダ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "妥当",
      "romaji": "datou",
      "pt": "adequado"
    },
    {
      "jp": "妥協",
      "romaji": "dakyou",
      "pt": "compromisso / concessão"
    },
    {
      "jp": "妥結",
      "romaji": "daketsu",
      "pt": "acordo"
    }
  ]
},
{
  "id": "j_n1_kyou_compromise",
  "category": "kanji",
  "focus": "協",
  "jp": "協",
  "romaji": "kyou",
  "pt": "cooperação",
  "type": "kanji",
  "hint": "N1 · linguagem formal. 協 aparece em colaboração, negociação e sociedade.",
  "chars": [
    "協"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "協 aparece em colaboração, negociação e sociedade.",
  "onyomi": "キョウ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "協力",
      "romaji": "kyouryoku",
      "pt": "cooperação"
    },
    {
      "jp": "協会",
      "romaji": "kyoukai",
      "pt": "associação"
    },
    {
      "jp": "妥協",
      "romaji": "dakyou",
      "pt": "concessão / acordo"
    }
  ]
},
{
  "id": "j_n1_sen",
  "category": "kanji",
  "focus": "繊",
  "jp": "繊",
  "romaji": "sen",
  "pt": "fibra / delicado",
  "type": "kanji",
  "hint": "N1 · vocabulário denso. N1 cobra leitura fina: 繊細 é delicadeza.",
  "chars": [
    "繊"
  ],
  "jlpt": "N1",
  "group": "vocabulário denso",
  "memo": "N1 cobra leitura fina: 繊細 é delicadeza.",
  "onyomi": "セン",
  "kunyomi": "",
  "strokes": "17",
  "examples": [
    {
      "jp": "繊細",
      "romaji": "sensai",
      "pt": "delicado / sensível"
    },
    {
      "jp": "繊維",
      "romaji": "sen'i",
      "pt": "fibra"
    },
    {
      "jp": "化学繊維",
      "romaji": "kagaku sen'i",
      "pt": "fibra sintética"
    }
  ]
},
{
  "id": "j_n1_sai_delicate",
  "category": "kanji",
  "focus": "細",
  "jp": "細",
  "romaji": "sai / hosoi",
  "pt": "fino / detalhado",
  "type": "kanji",
  "hint": "N1 · vocabulário denso. 細 é detalhe, fino, minucioso.",
  "chars": [
    "細"
  ],
  "jlpt": "N1",
  "group": "vocabulário denso",
  "memo": "細 é detalhe, fino, minucioso.",
  "onyomi": "サイ",
  "kunyomi": "ほそ, こま",
  "strokes": "11",
  "examples": [
    {
      "jp": "細かい",
      "romaji": "komakai",
      "pt": "detalhado / pequeno"
    },
    {
      "jp": "詳細",
      "romaji": "shousai",
      "pt": "detalhes"
    },
    {
      "jp": "繊細",
      "romaji": "sensai",
      "pt": "delicado"
    }
  ]
},
{
  "id": "j_n1_shousai",
  "category": "kanji",
  "focus": "詳",
  "jp": "詳",
  "romaji": "shou / kuwashii",
  "pt": "detalhado",
  "type": "kanji",
  "hint": "N1 · vocabulário denso. Intérprete precisa buscar 詳細: detalhes.",
  "chars": [
    "詳"
  ],
  "jlpt": "N1",
  "group": "vocabulário denso",
  "memo": "Intérprete precisa buscar 詳細: detalhes.",
  "onyomi": "ショウ",
  "kunyomi": "くわ",
  "strokes": "13",
  "examples": [
    {
      "jp": "詳しい",
      "romaji": "kuwashii",
      "pt": "detalhado / conhecedor"
    },
    {
      "jp": "詳細",
      "romaji": "shousai",
      "pt": "detalhes"
    },
    {
      "jp": "詳しく",
      "romaji": "kuwashiku",
      "pt": "em detalhes"
    }
  ]
},
{
  "id": "j_n1_iji",
  "category": "kanji",
  "focus": "維",
  "jp": "維",
  "romaji": "i",
  "pt": "manter / fibra",
  "type": "kanji",
  "hint": "N1 · vocabulário denso. 維持 é manter estrutura, condição ou sistema.",
  "chars": [
    "維"
  ],
  "jlpt": "N1",
  "group": "vocabulário denso",
  "memo": "維持 é manter estrutura, condição ou sistema.",
  "onyomi": "イ",
  "kunyomi": "",
  "strokes": "14",
  "examples": [
    {
      "jp": "維持",
      "romaji": "iji",
      "pt": "manutenção"
    },
    {
      "jp": "繊維",
      "romaji": "sen'i",
      "pt": "fibra"
    },
    {
      "jp": "維新",
      "romaji": "ishin",
      "pt": "restauração"
    }
  ]
},
{
  "id": "j_n1_iji_ji",
  "category": "kanji",
  "focus": "持",
  "jp": "持",
  "romaji": "ji / motsu",
  "pt": "manter / segurar",
  "type": "kanji",
  "hint": "N1 · vocabulário denso. Em N1, 持 vai além da mão: sustentar estado.",
  "chars": [
    "持"
  ],
  "jlpt": "N1",
  "group": "vocabulário denso",
  "memo": "Em N1, 持 vai além da mão: sustentar estado.",
  "onyomi": "ジ",
  "kunyomi": "も",
  "strokes": "9",
  "examples": [
    {
      "jp": "維持",
      "romaji": "iji",
      "pt": "manutenção"
    },
    {
      "jp": "支持",
      "romaji": "shiji",
      "pt": "apoio"
    },
    {
      "jp": "持続",
      "romaji": "jizoku",
      "pt": "continuação"
    }
  ]
},
{
  "id": "j_n5_mimi_useful",
  "category": "kanji",
  "focus": "耳",
  "jp": "耳",
  "romaji": "mimi",
  "pt": "orelha",
  "type": "kanji",
  "hint": "N5 útil · corpo e percepção. Serve para saúde, audição e consultas.",
  "chars": [
    "耳"
  ],
  "jlpt": "N5",
  "group": "corpo e percepção",
  "memo": "Serve para saúde, audição e consultas.",
  "onyomi": "ジ",
  "kunyomi": "みみ",
  "strokes": "6",
  "examples": [
    {
      "jp": "耳",
      "romaji": "mimi",
      "pt": "orelha"
    },
    {
      "jp": "耳が痛い",
      "romaji": "mimi ga itai",
      "pt": "a orelha dói"
    },
    {
      "jp": "耳鼻科",
      "romaji": "jibika",
      "pt": "otorrino"
    }
  ]
},
{
  "id": "j_n5_ashi_useful",
  "category": "kanji",
  "focus": "足",
  "jp": "足",
  "romaji": "ashi",
  "pt": "pé / perna",
  "type": "kanji",
  "hint": "N5 útil · corpo e percepção. Essencial para dor, trabalho em pé e deslocamento.",
  "chars": [
    "足"
  ],
  "jlpt": "N5",
  "group": "corpo e percepção",
  "memo": "Essencial para dor, trabalho em pé e deslocamento.",
  "onyomi": "ソク",
  "kunyomi": "あし, た",
  "strokes": "7",
  "examples": [
    {
      "jp": "足",
      "romaji": "ashi",
      "pt": "pé / perna"
    },
    {
      "jp": "足が痛い",
      "romaji": "ashi ga itai",
      "pt": "a perna/pé dói"
    },
    {
      "jp": "不足",
      "romaji": "fusoku",
      "pt": "falta"
    }
  ]
},
{
  "id": "j_n5_ki_spirit",
  "category": "kanji",
  "focus": "気",
  "jp": "気",
  "romaji": "ki",
  "pt": "energia / espírito / sensação",
  "type": "kanji",
  "hint": "N5 útil · vida diária. Um dos kanjis mais vivos do japonês cotidiano.",
  "chars": [
    "気"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Um dos kanjis mais vivos do japonês cotidiano.",
  "onyomi": "キ, ケ",
  "kunyomi": "いき",
  "strokes": "6",
  "examples": [
    {
      "jp": "元気",
      "romaji": "genki",
      "pt": "bem / saudável"
    },
    {
      "jp": "気持ち",
      "romaji": "kimochi",
      "pt": "sentimento"
    },
    {
      "jp": "気をつける",
      "romaji": "ki o tsukeru",
      "pt": "tomar cuidado"
    }
  ]
},
{
  "id": "j_n5_gen",
  "category": "kanji",
  "focus": "元",
  "jp": "元",
  "romaji": "gen / moto",
  "pt": "origem / energia",
  "type": "kanji",
  "hint": "N5 útil · vida diária. Aparece em 元気 e em ideia de origem.",
  "chars": [
    "元"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Aparece em 元気 e em ideia de origem.",
  "onyomi": "ゲン, ガン",
  "kunyomi": "もと",
  "strokes": "4",
  "examples": [
    {
      "jp": "元気",
      "romaji": "genki",
      "pt": "bem / saudável"
    },
    {
      "jp": "地元",
      "romaji": "jimoto",
      "pt": "cidade natal / local"
    },
    {
      "jp": "元",
      "romaji": "moto",
      "pt": "origem"
    }
  ]
},
{
  "id": "j_n5_name",
  "category": "kanji",
  "focus": "名",
  "jp": "名",
  "romaji": "na / mei",
  "pt": "nome",
  "type": "kanji",
  "hint": "N5 útil · vida diária. Kanji vital para cadastro, identidade e documentos.",
  "chars": [
    "名"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Kanji vital para cadastro, identidade e documentos.",
  "onyomi": "メイ, ミョウ",
  "kunyomi": "な",
  "strokes": "6",
  "examples": [
    {
      "jp": "名前",
      "romaji": "namae",
      "pt": "nome"
    },
    {
      "jp": "有名",
      "romaji": "yuumei",
      "pt": "famoso"
    },
    {
      "jp": "氏名",
      "romaji": "shimei",
      "pt": "nome completo"
    }
  ]
},
{
  "id": "j_n5_country",
  "category": "kanji",
  "focus": "国",
  "jp": "国",
  "romaji": "kuni / koku",
  "pt": "país",
  "type": "kanji",
  "hint": "N5 útil · vida diária. Base para nacionalidade, documentos e notícias.",
  "chars": [
    "国"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Base para nacionalidade, documentos e notícias.",
  "onyomi": "コク",
  "kunyomi": "くに",
  "strokes": "8",
  "examples": [
    {
      "jp": "国",
      "romaji": "kuni",
      "pt": "país"
    },
    {
      "jp": "外国",
      "romaji": "gaikoku",
      "pt": "país estrangeiro"
    },
    {
      "jp": "中国",
      "romaji": "chuugoku",
      "pt": "China"
    }
  ]
},
{
  "id": "j_n5_language_extra",
  "category": "kanji",
  "focus": "英",
  "jp": "英",
  "romaji": "ei",
  "pt": "Inglaterra / inglês",
  "type": "kanji",
  "hint": "N5 útil · língua e estudo. Aparece em 英語 e em leitura internacional.",
  "chars": [
    "英"
  ],
  "jlpt": "N5",
  "group": "língua e estudo",
  "memo": "Aparece em 英語 e em leitura internacional.",
  "onyomi": "エイ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "英語",
      "romaji": "eigo",
      "pt": "inglês"
    },
    {
      "jp": "英国",
      "romaji": "eikoku",
      "pt": "Reino Unido"
    },
    {
      "jp": "英会話",
      "romaji": "eikaiwa",
      "pt": "conversação em inglês"
    }
  ]
},
{
  "id": "j_n5_friend_extra",
  "category": "kanji",
  "focus": "友",
  "jp": "友",
  "romaji": "tomo",
  "pt": "amigo",
  "type": "kanji",
  "hint": "N5 útil · pessoas e relação. Ajuda o aluno a falar de relações simples.",
  "chars": [
    "友"
  ],
  "jlpt": "N5",
  "group": "pessoas e relação",
  "memo": "Ajuda o aluno a falar de relações simples.",
  "onyomi": "ユウ",
  "kunyomi": "とも",
  "strokes": "4",
  "examples": [
    {
      "jp": "友だち",
      "romaji": "tomodachi",
      "pt": "amigo"
    },
    {
      "jp": "友人",
      "romaji": "yuujin",
      "pt": "amigo"
    },
    {
      "jp": "親友",
      "romaji": "shinyuu",
      "pt": "melhor amigo"
    }
  ]
},
{
  "id": "j_n5_father_extra",
  "category": "kanji",
  "focus": "父",
  "jp": "父",
  "romaji": "chichi",
  "pt": "pai",
  "type": "kanji",
  "hint": "N5 útil · família. Família aparece em conversas e documentos.",
  "chars": [
    "父"
  ],
  "jlpt": "N5",
  "group": "família",
  "memo": "Família aparece em conversas e documentos.",
  "onyomi": "フ",
  "kunyomi": "ちち",
  "strokes": "4",
  "examples": [
    {
      "jp": "父",
      "romaji": "chichi",
      "pt": "meu pai"
    },
    {
      "jp": "お父さん",
      "romaji": "otousan",
      "pt": "pai"
    },
    {
      "jp": "父母",
      "romaji": "fubo",
      "pt": "pai e mãe"
    }
  ]
},
{
  "id": "j_n5_mother_extra",
  "category": "kanji",
  "focus": "母",
  "jp": "母",
  "romaji": "haha",
  "pt": "mãe",
  "type": "kanji",
  "hint": "N5 útil · família. Família aparece em conversas e documentos.",
  "chars": [
    "母"
  ],
  "jlpt": "N5",
  "group": "família",
  "memo": "Família aparece em conversas e documentos.",
  "onyomi": "ボ",
  "kunyomi": "はは",
  "strokes": "5",
  "examples": [
    {
      "jp": "母",
      "romaji": "haha",
      "pt": "minha mãe"
    },
    {
      "jp": "お母さん",
      "romaji": "okaasan",
      "pt": "mãe"
    },
    {
      "jp": "母国",
      "romaji": "bokoku",
      "pt": "país natal"
    }
  ]
},
{
  "id": "j_n5_child_extra",
  "category": "kanji",
  "focus": "子",
  "jp": "子",
  "romaji": "ko",
  "pt": "criança / filho",
  "type": "kanji",
  "hint": "N5 útil · família. Base para família, escola e sociedade.",
  "chars": [
    "子"
  ],
  "jlpt": "N5",
  "group": "família",
  "memo": "Base para família, escola e sociedade.",
  "onyomi": "シ, ス",
  "kunyomi": "こ",
  "strokes": "3",
  "examples": [
    {
      "jp": "子ども",
      "romaji": "kodomo",
      "pt": "criança"
    },
    {
      "jp": "息子",
      "romaji": "musuko",
      "pt": "filho"
    },
    {
      "jp": "女子",
      "romaji": "joshi",
      "pt": "menina / feminino"
    }
  ]
},
{
  "id": "j_n5_every",
  "category": "kanji",
  "focus": "毎",
  "jp": "毎",
  "romaji": "mai",
  "pt": "todo / cada",
  "type": "kanji",
  "hint": "N5 útil · tempo e rotina. Sem 毎, o aluno não entende rotina.",
  "chars": [
    "毎"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Sem 毎, o aluno não entende rotina.",
  "onyomi": "マイ",
  "kunyomi": "",
  "strokes": "6",
  "examples": [
    {
      "jp": "毎日",
      "romaji": "mainichi",
      "pt": "todos os dias"
    },
    {
      "jp": "毎週",
      "romaji": "maishuu",
      "pt": "toda semana"
    },
    {
      "jp": "毎月",
      "romaji": "maitsuki",
      "pt": "todo mês"
    }
  ]
},
{
  "id": "j_n5_now_extra",
  "category": "kanji",
  "focus": "今",
  "jp": "今",
  "romaji": "ima",
  "pt": "agora",
  "type": "kanji",
  "hint": "N5 útil · tempo e rotina. Kanji para presente, hoje e este período.",
  "chars": [
    "今"
  ],
  "jlpt": "N5",
  "group": "tempo e rotina",
  "memo": "Kanji para presente, hoje e este período.",
  "onyomi": "コン, キン",
  "kunyomi": "いま",
  "strokes": "4",
  "examples": [
    {
      "jp": "今",
      "romaji": "ima",
      "pt": "agora"
    },
    {
      "jp": "今日",
      "romaji": "kyou",
      "pt": "hoje"
    },
    {
      "jp": "今月",
      "romaji": "kongetsu",
      "pt": "este mês"
    }
  ]
},
{
  "id": "j_n5_what_extra",
  "category": "kanji",
  "focus": "何",
  "jp": "何",
  "romaji": "nani",
  "pt": "o quê",
  "type": "kanji",
  "hint": "N5 útil · perguntas. Leitura de perguntas depende deste kanji.",
  "chars": [
    "何"
  ],
  "jlpt": "N5",
  "group": "perguntas",
  "memo": "Leitura de perguntas depende deste kanji.",
  "onyomi": "カ",
  "kunyomi": "なに, なん",
  "strokes": "7",
  "examples": [
    {
      "jp": "何",
      "romaji": "nani",
      "pt": "o quê"
    },
    {
      "jp": "何時",
      "romaji": "nanji",
      "pt": "que horas"
    },
    {
      "jp": "何人",
      "romaji": "nannin",
      "pt": "quantas pessoas"
    }
  ]
},
{
  "id": "j_n4_tenki",
  "category": "kanji",
  "focus": "天",
  "jp": "天",
  "romaji": "ten",
  "pt": "céu / paraíso",
  "type": "kanji",
  "hint": "N4 útil · clima e rotina. Aparece em 天気, essencial para cotidiano.",
  "chars": [
    "天"
  ],
  "jlpt": "N4",
  "group": "clima e rotina",
  "memo": "Aparece em 天気, essencial para cotidiano.",
  "onyomi": "テン",
  "kunyomi": "あま, あめ",
  "strokes": "4",
  "examples": [
    {
      "jp": "天気",
      "romaji": "tenki",
      "pt": "clima"
    },
    {
      "jp": "雨天",
      "romaji": "uten",
      "pt": "tempo chuvoso"
    },
    {
      "jp": "天国",
      "romaji": "tengoku",
      "pt": "paraíso"
    }
  ]
},
{
  "id": "j_n4_ki_weather",
  "category": "kanji",
  "focus": "気",
  "jp": "気",
  "romaji": "ki",
  "pt": "energia / ar / sensação",
  "type": "kanji",
  "hint": "N4 útil · clima e rotina. Em N4 vira chave para clima, humor e cuidado.",
  "chars": [
    "気"
  ],
  "jlpt": "N4",
  "group": "clima e rotina",
  "memo": "Em N4 vira chave para clima, humor e cuidado.",
  "onyomi": "キ, ケ",
  "kunyomi": "いき",
  "strokes": "6",
  "examples": [
    {
      "jp": "天気",
      "romaji": "tenki",
      "pt": "clima"
    },
    {
      "jp": "気分",
      "romaji": "kibun",
      "pt": "humor / sensação"
    },
    {
      "jp": "気をつける",
      "romaji": "ki o tsukeru",
      "pt": "tomar cuidado"
    }
  ]
},
{
  "id": "j_n4_dou_road",
  "category": "kanji",
  "focus": "道",
  "jp": "道",
  "romaji": "michi",
  "pt": "caminho / rua",
  "type": "kanji",
  "hint": "N4 útil · transporte e cidade. Rua, caminho e método aparecem o tempo inteiro.",
  "chars": [
    "道"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "Rua, caminho e método aparecem o tempo inteiro.",
  "onyomi": "ドウ",
  "kunyomi": "みち",
  "strokes": "12",
  "examples": [
    {
      "jp": "道",
      "romaji": "michi",
      "pt": "caminho"
    },
    {
      "jp": "道路",
      "romaji": "douro",
      "pt": "rua / estrada"
    },
    {
      "jp": "北海道",
      "romaji": "hokkaidou",
      "pt": "Hokkaido"
    }
  ]
},
{
  "id": "j_n4_toshi_city",
  "category": "kanji",
  "focus": "都",
  "jp": "都",
  "romaji": "to / miyako",
  "pt": "capital / metrópole",
  "type": "kanji",
  "hint": "N4 útil · transporte e cidade. Útil para Tóquio, endereço e notícias.",
  "chars": [
    "都"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "Útil para Tóquio, endereço e notícias.",
  "onyomi": "ト, ツ",
  "kunyomi": "みやこ",
  "strokes": "11",
  "examples": [
    {
      "jp": "東京都",
      "romaji": "toukyouto",
      "pt": "Tóquio Metrópole"
    },
    {
      "jp": "都市",
      "romaji": "toshi",
      "pt": "cidade"
    },
    {
      "jp": "都合",
      "romaji": "tsugou",
      "pt": "conveniência"
    }
  ]
},
{
  "id": "j_n4_fuken",
  "category": "kanji",
  "focus": "府",
  "jp": "府",
  "romaji": "fu",
  "pt": "prefeitura urbana",
  "type": "kanji",
  "hint": "N4 útil · transporte e cidade. Aparece em Osaka-fu, Kyoto-fu e governo local.",
  "chars": [
    "府"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "Aparece em Osaka-fu, Kyoto-fu e governo local.",
  "onyomi": "フ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "大阪府",
      "romaji": "oosakafu",
      "pt": "Província de Osaka"
    },
    {
      "jp": "京都府",
      "romaji": "kyoutofu",
      "pt": "Província de Kyoto"
    },
    {
      "jp": "政府",
      "romaji": "seifu",
      "pt": "governo"
    }
  ]
},
{
  "id": "j_n4_ken_pref",
  "category": "kanji",
  "focus": "県",
  "jp": "県",
  "romaji": "ken",
  "pt": "província",
  "type": "kanji",
  "hint": "N4 útil · transporte e cidade. Endereço no Japão usa 県 o tempo todo.",
  "chars": [
    "県"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "Endereço no Japão usa 県 o tempo todo.",
  "onyomi": "ケン",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "福井県",
      "romaji": "fukuiken",
      "pt": "Província de Fukui"
    },
    {
      "jp": "県庁",
      "romaji": "kenchou",
      "pt": "governo provincial"
    },
    {
      "jp": "県外",
      "romaji": "kengai",
      "pt": "fora da província"
    }
  ]
},
{
  "id": "j_n4_ku_district",
  "category": "kanji",
  "focus": "区",
  "jp": "区",
  "romaji": "ku",
  "pt": "distrito / área",
  "type": "kanji",
  "hint": "N4 útil · transporte e cidade. Muito usado em endereços urbanos.",
  "chars": [
    "区"
  ],
  "jlpt": "N4",
  "group": "transporte e cidade",
  "memo": "Muito usado em endereços urbanos.",
  "onyomi": "ク",
  "kunyomi": "",
  "strokes": "4",
  "examples": [
    {
      "jp": "区役所",
      "romaji": "kuyakusho",
      "pt": "subprefeitura"
    },
    {
      "jp": "地区",
      "romaji": "chiku",
      "pt": "área / distrito"
    },
    {
      "jp": "区分",
      "romaji": "kubun",
      "pt": "classificação"
    }
  ]
},
{
  "id": "j_n4_sho_write",
  "category": "kanji",
  "focus": "書",
  "jp": "書",
  "romaji": "sho / kaku",
  "pt": "escrever / documento",
  "type": "kanji",
  "hint": "N4 útil · documentos e cotidiano. Documento escrito e escrita formal.",
  "chars": [
    "書"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Documento escrito e escrita formal.",
  "onyomi": "ショ",
  "kunyomi": "か",
  "strokes": "10",
  "examples": [
    {
      "jp": "書類",
      "romaji": "shorui",
      "pt": "documentos"
    },
    {
      "jp": "申請書",
      "romaji": "shinseisho",
      "pt": "formulário de solicitação"
    },
    {
      "jp": "書く",
      "romaji": "kaku",
      "pt": "escrever"
    }
  ]
},
{
  "id": "j_n4_rui",
  "category": "kanji",
  "focus": "類",
  "jp": "類",
  "romaji": "rui",
  "pt": "tipo / categoria",
  "type": "kanji",
  "hint": "N4 útil · documentos e cotidiano. Classificação, documentos e tipos.",
  "chars": [
    "類"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Classificação, documentos e tipos.",
  "onyomi": "ルイ",
  "kunyomi": "たぐ",
  "strokes": "18",
  "examples": [
    {
      "jp": "書類",
      "romaji": "shorui",
      "pt": "documentos"
    },
    {
      "jp": "種類",
      "romaji": "shurui",
      "pt": "tipo / espécie"
    },
    {
      "jp": "人類",
      "romaji": "jinrui",
      "pt": "humanidade"
    }
  ]
},
{
  "id": "j_n4_kanren",
  "category": "kanji",
  "focus": "関",
  "jp": "関",
  "romaji": "kan",
  "pt": "relação / barreira",
  "type": "kanji",
  "hint": "N4 útil · documentos e cotidiano. Relação entre assuntos, pessoas e documentos.",
  "chars": [
    "関"
  ],
  "jlpt": "N4",
  "group": "documentos e cotidiano",
  "memo": "Relação entre assuntos, pessoas e documentos.",
  "onyomi": "カン",
  "kunyomi": "せき",
  "strokes": "14",
  "examples": [
    {
      "jp": "関係",
      "romaji": "kankei",
      "pt": "relação"
    },
    {
      "jp": "関連",
      "romaji": "kanren",
      "pt": "relacionado"
    },
    {
      "jp": "関心",
      "romaji": "kanshin",
      "pt": "interesse"
    }
  ]
},
{
  "id": "j_n4_raku_contact2",
  "category": "kanji",
  "focus": "連",
  "jp": "連",
  "romaji": "ren",
  "pt": "conectar / levar junto",
  "type": "kanji",
  "hint": "N4 útil · comunicação. Contato e conexão diária.",
  "chars": [
    "連"
  ],
  "jlpt": "N4",
  "group": "comunicação",
  "memo": "Contato e conexão diária.",
  "onyomi": "レン",
  "kunyomi": "つ",
  "strokes": "10",
  "examples": [
    {
      "jp": "連絡",
      "romaji": "renraku",
      "pt": "contato / aviso"
    },
    {
      "jp": "連休",
      "romaji": "renkyuu",
      "pt": "feriado prolongado"
    },
    {
      "jp": "連れて行く",
      "romaji": "tsurete iku",
      "pt": "levar alguém"
    }
  ]
},
{
  "id": "j_n4_sou_consult",
  "category": "kanji",
  "focus": "相",
  "jp": "相",
  "romaji": "sou / ai",
  "pt": "mútuo / aparência",
  "type": "kanji",
  "hint": "N4 útil · comunicação. Consulta e relação com outra pessoa.",
  "chars": [
    "相"
  ],
  "jlpt": "N4",
  "group": "comunicação",
  "memo": "Consulta e relação com outra pessoa.",
  "onyomi": "ソウ",
  "kunyomi": "あい",
  "strokes": "9",
  "examples": [
    {
      "jp": "相談",
      "romaji": "soudan",
      "pt": "consulta / pedir conselho"
    },
    {
      "jp": "相手",
      "romaji": "aite",
      "pt": "outra pessoa"
    },
    {
      "jp": "相当",
      "romaji": "soutou",
      "pt": "consideravelmente"
    }
  ]
},
{
  "id": "j_n4_dan_consult",
  "category": "kanji",
  "focus": "談",
  "jp": "談",
  "romaji": "dan",
  "pt": "conversa / discussão",
  "type": "kanji",
  "hint": "N4 útil · comunicação. Falar para resolver problemas.",
  "chars": [
    "談"
  ],
  "jlpt": "N4",
  "group": "comunicação",
  "memo": "Falar para resolver problemas.",
  "onyomi": "ダン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "相談",
      "romaji": "soudan",
      "pt": "consulta"
    },
    {
      "jp": "雑談",
      "romaji": "zatsudan",
      "pt": "bate-papo"
    },
    {
      "jp": "面談",
      "romaji": "mendan",
      "pt": "entrevista / conversa formal"
    }
  ]
},
{
  "id": "j_n4_hou_report",
  "category": "kanji",
  "focus": "報",
  "jp": "報",
  "romaji": "hou",
  "pt": "informar / notícia",
  "type": "kanji",
  "hint": "N4 útil · comunicação. Informação formal, notícia e aviso.",
  "chars": [
    "報"
  ],
  "jlpt": "N4",
  "group": "comunicação",
  "memo": "Informação formal, notícia e aviso.",
  "onyomi": "ホウ",
  "kunyomi": "むく",
  "strokes": "12",
  "examples": [
    {
      "jp": "情報",
      "romaji": "jouhou",
      "pt": "informação"
    },
    {
      "jp": "報告",
      "romaji": "houkoku",
      "pt": "relatório"
    },
    {
      "jp": "天気予報",
      "romaji": "tenki yohou",
      "pt": "previsão do tempo"
    }
  ]
},
{
  "id": "j_n4_koku_report",
  "category": "kanji",
  "focus": "告",
  "jp": "告",
  "romaji": "koku / tsugeru",
  "pt": "avisar / anunciar",
  "type": "kanji",
  "hint": "N4 útil · comunicação. Relatar e comunicar oficialmente.",
  "chars": [
    "告"
  ],
  "jlpt": "N4",
  "group": "comunicação",
  "memo": "Relatar e comunicar oficialmente.",
  "onyomi": "コク",
  "kunyomi": "つ",
  "strokes": "7",
  "examples": [
    {
      "jp": "報告",
      "romaji": "houkoku",
      "pt": "relatório"
    },
    {
      "jp": "広告",
      "romaji": "koukoku",
      "pt": "anúncio"
    },
    {
      "jp": "告白",
      "romaji": "kokuhaku",
      "pt": "confissão"
    }
  ]
},
{
  "id": "j_n3_kanri",
  "category": "kanji",
  "focus": "管",
  "jp": "管",
  "romaji": "kan",
  "pt": "controle / tubo",
  "type": "kanji",
  "hint": "N3 útil · trabalho e gestão. Gestão, controle e manutenção.",
  "chars": [
    "管"
  ],
  "jlpt": "N3",
  "group": "trabalho e gestão",
  "memo": "Gestão, controle e manutenção.",
  "onyomi": "カン",
  "kunyomi": "くだ",
  "strokes": "14",
  "examples": [
    {
      "jp": "管理",
      "romaji": "kanri",
      "pt": "gestão / controle"
    },
    {
      "jp": "配管",
      "romaji": "haikan",
      "pt": "tubulação"
    },
    {
      "jp": "管",
      "romaji": "kuda",
      "pt": "cano"
    }
  ]
},
{
  "id": "j_n3_ri_manage",
  "category": "kanji",
  "focus": "理",
  "jp": "理",
  "romaji": "ri",
  "pt": "lógica / razão",
  "type": "kanji",
  "hint": "N3 útil · trabalho e gestão. Lógica, motivo e administração.",
  "chars": [
    "理"
  ],
  "jlpt": "N3",
  "group": "trabalho e gestão",
  "memo": "Lógica, motivo e administração.",
  "onyomi": "リ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "管理",
      "romaji": "kanri",
      "pt": "gestão"
    },
    {
      "jp": "理由",
      "romaji": "riyuu",
      "pt": "motivo"
    },
    {
      "jp": "無理",
      "romaji": "muri",
      "pt": "impossível"
    }
  ]
},
{
  "id": "j_n3_haifu",
  "category": "kanji",
  "focus": "配",
  "jp": "配",
  "romaji": "hai / kubaru",
  "pt": "distribuir",
  "type": "kanji",
  "hint": "N3 útil · trabalho e gestão. Distribuir, organizar e se preocupar.",
  "chars": [
    "配"
  ],
  "jlpt": "N3",
  "group": "trabalho e gestão",
  "memo": "Distribuir, organizar e se preocupar.",
  "onyomi": "ハイ",
  "kunyomi": "くば",
  "strokes": "10",
  "examples": [
    {
      "jp": "配る",
      "romaji": "kubaru",
      "pt": "distribuir"
    },
    {
      "jp": "心配",
      "romaji": "shinpai",
      "pt": "preocupação"
    },
    {
      "jp": "配達",
      "romaji": "haitatsu",
      "pt": "entrega"
    }
  ]
},
{
  "id": "j_n3_tatsu_delivery",
  "category": "kanji",
  "focus": "達",
  "jp": "達",
  "romaji": "tatsu",
  "pt": "atingir / plural humano",
  "type": "kanji",
  "hint": "N3 útil · trabalho e gestão. Entrega, conquista e pessoas.",
  "chars": [
    "達"
  ],
  "jlpt": "N3",
  "group": "trabalho e gestão",
  "memo": "Entrega, conquista e pessoas.",
  "onyomi": "タツ",
  "kunyomi": "たち",
  "strokes": "12",
  "examples": [
    {
      "jp": "配達",
      "romaji": "haitatsu",
      "pt": "entrega"
    },
    {
      "jp": "友達",
      "romaji": "tomodachi",
      "pt": "amigo"
    },
    {
      "jp": "上達",
      "romaji": "joutatsu",
      "pt": "melhora"
    }
  ]
},
{
  "id": "j_n3_hen",
  "category": "kanji",
  "focus": "変",
  "jp": "変",
  "romaji": "hen / kawaru",
  "pt": "mudar / estranho",
  "type": "kanji",
  "hint": "N3 útil · interpretação. Mudança e diferença em textos.",
  "chars": [
    "変"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Mudança e diferença em textos.",
  "onyomi": "ヘン",
  "kunyomi": "か",
  "strokes": "9",
  "examples": [
    {
      "jp": "変わる",
      "romaji": "kawaru",
      "pt": "mudar"
    },
    {
      "jp": "変更",
      "romaji": "henkou",
      "pt": "alteração"
    },
    {
      "jp": "大変",
      "romaji": "taihen",
      "pt": "difícil / grave"
    }
  ]
},
{
  "id": "j_n3_kou_change",
  "category": "kanji",
  "focus": "更",
  "jp": "更",
  "romaji": "kou / sara",
  "pt": "renovar / novamente",
  "type": "kanji",
  "hint": "N3 útil · interpretação. Alteração e atualização formal.",
  "chars": [
    "更"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Alteração e atualização formal.",
  "onyomi": "コウ",
  "kunyomi": "さら, ふ",
  "strokes": "7",
  "examples": [
    {
      "jp": "変更",
      "romaji": "henkou",
      "pt": "alteração"
    },
    {
      "jp": "更新",
      "romaji": "koushin",
      "pt": "renovação"
    },
    {
      "jp": "更に",
      "romaji": "sara ni",
      "pt": "além disso"
    }
  ]
},
{
  "id": "j_n3_zouka",
  "category": "kanji",
  "focus": "増",
  "jp": "増",
  "romaji": "zou / fueru",
  "pt": "aumentar",
  "type": "kanji",
  "hint": "N3 útil · interpretação. Aumento de preço, quantidade ou problema.",
  "chars": [
    "増"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Aumento de preço, quantidade ou problema.",
  "onyomi": "ゾウ",
  "kunyomi": "ふ, ま",
  "strokes": "14",
  "examples": [
    {
      "jp": "増える",
      "romaji": "fueru",
      "pt": "aumentar"
    },
    {
      "jp": "増加",
      "romaji": "zouka",
      "pt": "aumento"
    },
    {
      "jp": "増やす",
      "romaji": "fuyasu",
      "pt": "aumentar algo"
    }
  ]
},
{
  "id": "j_n3_heru",
  "category": "kanji",
  "focus": "減",
  "jp": "減",
  "romaji": "gen / heru",
  "pt": "diminuir",
  "type": "kanji",
  "hint": "N3 útil · interpretação. Diminuição, desconto e redução.",
  "chars": [
    "減"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Diminuição, desconto e redução.",
  "onyomi": "ゲン",
  "kunyomi": "へ",
  "strokes": "12",
  "examples": [
    {
      "jp": "減る",
      "romaji": "heru",
      "pt": "diminuir"
    },
    {
      "jp": "減少",
      "romaji": "genshou",
      "pt": "redução"
    },
    {
      "jp": "減らす",
      "romaji": "herasu",
      "pt": "reduzir"
    }
  ]
},
{
  "id": "j_n3_kakunin_extra",
  "category": "kanji",
  "focus": "確",
  "jp": "確",
  "romaji": "kaku / tashika",
  "pt": "certo / confirmar",
  "type": "kanji",
  "hint": "N3 útil · interpretação. Confirmar é base de trabalho e documentos.",
  "chars": [
    "確"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Confirmar é base de trabalho e documentos.",
  "onyomi": "カク",
  "kunyomi": "たし",
  "strokes": "15",
  "examples": [
    {
      "jp": "確認",
      "romaji": "kakunin",
      "pt": "confirmação"
    },
    {
      "jp": "確か",
      "romaji": "tashika",
      "pt": "se não me engano"
    },
    {
      "jp": "正確",
      "romaji": "seikaku",
      "pt": "exato"
    }
  ]
},
{
  "id": "j_n3_nin_extra",
  "category": "kanji",
  "focus": "認",
  "jp": "認",
  "romaji": "nin / mitomeru",
  "pt": "reconhecer",
  "type": "kanji",
  "hint": "N3 útil · interpretação. Reconhecimento, confirmação e aprovação.",
  "chars": [
    "認"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Reconhecimento, confirmação e aprovação.",
  "onyomi": "ニン",
  "kunyomi": "みと",
  "strokes": "14",
  "examples": [
    {
      "jp": "確認",
      "romaji": "kakunin",
      "pt": "confirmação"
    },
    {
      "jp": "承認",
      "romaji": "shounin",
      "pt": "aprovação"
    },
    {
      "jp": "認める",
      "romaji": "mitomeru",
      "pt": "reconhecer"
    }
  ]
},
{
  "id": "j_n3_junbi",
  "category": "kanji",
  "focus": "備",
  "jp": "備",
  "romaji": "bi / sonaeru",
  "pt": "preparar",
  "type": "kanji",
  "hint": "N3 útil · autonomia. Preparação para prova, trabalho e emergência.",
  "chars": [
    "備"
  ],
  "jlpt": "N3",
  "group": "autonomia",
  "memo": "Preparação para prova, trabalho e emergência.",
  "onyomi": "ビ",
  "kunyomi": "そな",
  "strokes": "12",
  "examples": [
    {
      "jp": "準備",
      "romaji": "junbi",
      "pt": "preparação"
    },
    {
      "jp": "設備",
      "romaji": "setsubi",
      "pt": "equipamento"
    },
    {
      "jp": "予備",
      "romaji": "yobi",
      "pt": "reserva"
    }
  ]
},
{
  "id": "j_n3_yotei",
  "category": "kanji",
  "focus": "予",
  "jp": "予",
  "romaji": "yo",
  "pt": "previamente",
  "type": "kanji",
  "hint": "N3 útil · autonomia. Previsto, reserva, prevenção.",
  "chars": [
    "予"
  ],
  "jlpt": "N3",
  "group": "autonomia",
  "memo": "Previsto, reserva, prevenção.",
  "onyomi": "ヨ",
  "kunyomi": "",
  "strokes": "4",
  "examples": [
    {
      "jp": "予定",
      "romaji": "yotei",
      "pt": "programação"
    },
    {
      "jp": "予約",
      "romaji": "yoyaku",
      "pt": "reserva"
    },
    {
      "jp": "予習",
      "romaji": "yoshuu",
      "pt": "preparação de aula"
    }
  ]
},
{
  "id": "j_n3_yaku_reserve",
  "category": "kanji",
  "focus": "約",
  "jp": "約",
  "romaji": "yaku",
  "pt": "promessa / aproximadamente",
  "type": "kanji",
  "hint": "N3 útil · autonomia. Reserva, contrato e cerca de.",
  "chars": [
    "約"
  ],
  "jlpt": "N3",
  "group": "autonomia",
  "memo": "Reserva, contrato e cerca de.",
  "onyomi": "ヤク",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "予約",
      "romaji": "yoyaku",
      "pt": "reserva"
    },
    {
      "jp": "約束",
      "romaji": "yakusoku",
      "pt": "promessa"
    },
    {
      "jp": "契約",
      "romaji": "keiyaku",
      "pt": "contrato"
    }
  ]
},
{
  "id": "j_n3_seki_seat",
  "category": "kanji",
  "focus": "席",
  "jp": "席",
  "romaji": "seki",
  "pt": "assento / lugar",
  "type": "kanji",
  "hint": "N3 útil · autonomia. Usado em transporte, restaurante e reunião.",
  "chars": [
    "席"
  ],
  "jlpt": "N3",
  "group": "autonomia",
  "memo": "Usado em transporte, restaurante e reunião.",
  "onyomi": "セキ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "席",
      "romaji": "seki",
      "pt": "assento"
    },
    {
      "jp": "座席",
      "romaji": "zaseki",
      "pt": "assento"
    },
    {
      "jp": "出席",
      "romaji": "shusseki",
      "pt": "presença"
    }
  ]
},
{
  "id": "j_n3_jiyuu",
  "category": "kanji",
  "focus": "由",
  "jp": "由",
  "romaji": "yuu",
  "pt": "razão / origem",
  "type": "kanji",
  "hint": "N3 útil · interpretação. Razão, liberdade e origem.",
  "chars": [
    "由"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Razão, liberdade e origem.",
  "onyomi": "ユウ, ユ",
  "kunyomi": "よし",
  "strokes": "5",
  "examples": [
    {
      "jp": "理由",
      "romaji": "riyuu",
      "pt": "motivo"
    },
    {
      "jp": "自由",
      "romaji": "jiyuu",
      "pt": "liberdade"
    },
    {
      "jp": "由来",
      "romaji": "yurai",
      "pt": "origem"
    }
  ]
},
{
  "id": "j_n2_gen_limit",
  "category": "kanji",
  "focus": "限",
  "jp": "限",
  "romaji": "gen / kagiru",
  "pt": "limite",
  "type": "kanji",
  "hint": "N2 útil · documentos e regras. Prazos, limites e permissões.",
  "chars": [
    "限"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Prazos, limites e permissões.",
  "onyomi": "ゲン",
  "kunyomi": "かぎ",
  "strokes": "9",
  "examples": [
    {
      "jp": "制限",
      "romaji": "seigen",
      "pt": "limite"
    },
    {
      "jp": "期限",
      "romaji": "kigen",
      "pt": "prazo"
    },
    {
      "jp": "限る",
      "romaji": "kagiru",
      "pt": "limitar-se"
    }
  ]
},
{
  "id": "j_n2_ki_deadline",
  "category": "kanji",
  "focus": "期",
  "jp": "期",
  "romaji": "ki",
  "pt": "período / prazo",
  "type": "kanji",
  "hint": "N2 útil · documentos e regras. Contrato, prazo e expectativa.",
  "chars": [
    "期"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Contrato, prazo e expectativa.",
  "onyomi": "キ, ゴ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "期限",
      "romaji": "kigen",
      "pt": "prazo"
    },
    {
      "jp": "期間",
      "romaji": "kikan",
      "pt": "período"
    },
    {
      "jp": "期待",
      "romaji": "kitai",
      "pt": "expectativa"
    }
  ]
},
{
  "id": "j_n2_kan_period",
  "category": "kanji",
  "focus": "間",
  "jp": "間",
  "romaji": "kan / aida",
  "pt": "intervalo / entre",
  "type": "kanji",
  "hint": "N2 útil · documentos e regras. Período, espaço e relação entre coisas.",
  "chars": [
    "間"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Período, espaço e relação entre coisas.",
  "onyomi": "カン, ケン",
  "kunyomi": "あいだ, ま",
  "strokes": "12",
  "examples": [
    {
      "jp": "期間",
      "romaji": "kikan",
      "pt": "período"
    },
    {
      "jp": "時間",
      "romaji": "jikan",
      "pt": "tempo"
    },
    {
      "jp": "人間",
      "romaji": "ningen",
      "pt": "ser humano"
    }
  ]
},
{
  "id": "j_n2_henkou",
  "category": "kanji",
  "focus": "変",
  "jp": "変",
  "romaji": "hen / kawaru",
  "pt": "mudar",
  "type": "kanji",
  "hint": "N2 útil · documentos e regras. Mudança formal em documentos e sistemas.",
  "chars": [
    "変"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Mudança formal em documentos e sistemas.",
  "onyomi": "ヘン",
  "kunyomi": "か",
  "strokes": "9",
  "examples": [
    {
      "jp": "変更",
      "romaji": "henkou",
      "pt": "alteração"
    },
    {
      "jp": "変化",
      "romaji": "henka",
      "pt": "mudança"
    },
    {
      "jp": "大変",
      "romaji": "taihen",
      "pt": "grave / difícil"
    }
  ]
},
{
  "id": "j_n2_kou_change",
  "category": "kanji",
  "focus": "更",
  "jp": "更",
  "romaji": "kou / sara",
  "pt": "renovar",
  "type": "kanji",
  "hint": "N2 útil · documentos e regras. Atualização e renovação são vida adulta no Japão.",
  "chars": [
    "更"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Atualização e renovação são vida adulta no Japão.",
  "onyomi": "コウ",
  "kunyomi": "さら, ふ",
  "strokes": "7",
  "examples": [
    {
      "jp": "更新",
      "romaji": "koushin",
      "pt": "renovação"
    },
    {
      "jp": "変更",
      "romaji": "henkou",
      "pt": "alteração"
    },
    {
      "jp": "更に",
      "romaji": "sara ni",
      "pt": "além disso"
    }
  ]
},
{
  "id": "j_n2_teki_tekisei",
  "category": "kanji",
  "focus": "適",
  "jp": "適",
  "romaji": "teki / kanau",
  "pt": "adequado",
  "type": "kanji",
  "hint": "N2 útil · documentos e regras. Adequação, aplicação e interpretação formal.",
  "chars": [
    "適"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Adequação, aplicação e interpretação formal.",
  "onyomi": "テキ",
  "kunyomi": "かな",
  "strokes": "14",
  "examples": [
    {
      "jp": "適切",
      "romaji": "tekisetsu",
      "pt": "apropriado"
    },
    {
      "jp": "適用",
      "romaji": "tekiyou",
      "pt": "aplicação"
    },
    {
      "jp": "快適",
      "romaji": "kaiteki",
      "pt": "confortável"
    }
  ]
},
{
  "id": "j_n2_setsuu",
  "category": "kanji",
  "focus": "切",
  "jp": "切",
  "romaji": "setsu / kiru",
  "pt": "cortar / adequado",
  "type": "kanji",
  "hint": "N2 útil · documentos e regras. Em 適切, significa adequado com precisão.",
  "chars": [
    "切"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Em 適切, significa adequado com precisão.",
  "onyomi": "セツ, サイ",
  "kunyomi": "き",
  "strokes": "4",
  "examples": [
    {
      "jp": "適切",
      "romaji": "tekisetsu",
      "pt": "apropriado"
    },
    {
      "jp": "大切",
      "romaji": "taisetsu",
      "pt": "importante"
    },
    {
      "jp": "切る",
      "romaji": "kiru",
      "pt": "cortar"
    }
  ]
},
{
  "id": "j_n2_ou",
  "category": "kanji",
  "focus": "応",
  "jp": "応",
  "romaji": "ou",
  "pt": "responder / corresponder",
  "type": "kanji",
  "hint": "N2 útil · comunicação formal. Resposta adequada a situação ou solicitação.",
  "chars": [
    "応"
  ],
  "jlpt": "N2",
  "group": "comunicação formal",
  "memo": "Resposta adequada a situação ou solicitação.",
  "onyomi": "オウ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "対応",
      "romaji": "taiou",
      "pt": "resposta / atendimento"
    },
    {
      "jp": "応募",
      "romaji": "oubo",
      "pt": "candidatura"
    },
    {
      "jp": "応援",
      "romaji": "ouen",
      "pt": "torcida / apoio"
    }
  ]
},
{
  "id": "j_n2_boshuu",
  "category": "kanji",
  "focus": "募",
  "jp": "募",
  "romaji": "bo / tsunoru",
  "pt": "recrutar",
  "type": "kanji",
  "hint": "N2 útil · comunicação formal. Vagas, recrutamento e inscrição.",
  "chars": [
    "募"
  ],
  "jlpt": "N2",
  "group": "comunicação formal",
  "memo": "Vagas, recrutamento e inscrição.",
  "onyomi": "ボ",
  "kunyomi": "つの",
  "strokes": "12",
  "examples": [
    {
      "jp": "募集",
      "romaji": "boshuu",
      "pt": "recrutamento"
    },
    {
      "jp": "応募",
      "romaji": "oubo",
      "pt": "candidatura"
    },
    {
      "jp": "募る",
      "romaji": "tsunoru",
      "pt": "recrutar / crescer sentimento"
    }
  ]
},
{
  "id": "j_n2_shuu_collect",
  "category": "kanji",
  "focus": "集",
  "jp": "集",
  "romaji": "shuu / atsumeru",
  "pt": "reunir",
  "type": "kanji",
  "hint": "N2 útil · comunicação formal. Coletar, reunir, concentrar.",
  "chars": [
    "集"
  ],
  "jlpt": "N2",
  "group": "comunicação formal",
  "memo": "Coletar, reunir, concentrar.",
  "onyomi": "シュウ",
  "kunyomi": "あつ",
  "strokes": "12",
  "examples": [
    {
      "jp": "募集",
      "romaji": "boshuu",
      "pt": "recrutamento"
    },
    {
      "jp": "集める",
      "romaji": "atsumeru",
      "pt": "juntar"
    },
    {
      "jp": "集中",
      "romaji": "shuuchuu",
      "pt": "concentração"
    }
  ]
},
{
  "id": "j_n2_kyoka",
  "category": "kanji",
  "focus": "許",
  "jp": "許",
  "romaji": "kyo / yurusu",
  "pt": "permitir",
  "type": "kanji",
  "hint": "N2 útil · lei e sociedade. Permissão, autorização, tolerância.",
  "chars": [
    "許"
  ],
  "jlpt": "N2",
  "group": "lei e sociedade",
  "memo": "Permissão, autorização, tolerância.",
  "onyomi": "キョ",
  "kunyomi": "ゆる",
  "strokes": "11",
  "examples": [
    {
      "jp": "許可",
      "romaji": "kyoka",
      "pt": "permissão"
    },
    {
      "jp": "許す",
      "romaji": "yurusu",
      "pt": "perdoar / permitir"
    },
    {
      "jp": "免許",
      "romaji": "menkyo",
      "pt": "licença"
    }
  ]
},
{
  "id": "j_n2_ka_possible",
  "category": "kanji",
  "focus": "可",
  "jp": "可",
  "romaji": "ka",
  "pt": "possível / permitido",
  "type": "kanji",
  "hint": "N2 útil · lei e sociedade. Possibilidade e permissão em documentos.",
  "chars": [
    "可"
  ],
  "jlpt": "N2",
  "group": "lei e sociedade",
  "memo": "Possibilidade e permissão em documentos.",
  "onyomi": "カ",
  "kunyomi": "",
  "strokes": "5",
  "examples": [
    {
      "jp": "可能",
      "romaji": "kanou",
      "pt": "possível"
    },
    {
      "jp": "許可",
      "romaji": "kyoka",
      "pt": "permissão"
    },
    {
      "jp": "可愛い",
      "romaji": "kawaii",
      "pt": "fofo"
    }
  ]
},
{
  "id": "j_n2_nou_possible",
  "category": "kanji",
  "focus": "能",
  "jp": "能",
  "romaji": "nou",
  "pt": "capacidade",
  "type": "kanji",
  "hint": "N2 útil · lei e sociedade. Capacidade, função e possibilidade.",
  "chars": [
    "能"
  ],
  "jlpt": "N2",
  "group": "lei e sociedade",
  "memo": "Capacidade, função e possibilidade.",
  "onyomi": "ノウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "可能",
      "romaji": "kanou",
      "pt": "possível"
    },
    {
      "jp": "能力",
      "romaji": "nouryoku",
      "pt": "capacidade"
    },
    {
      "jp": "機能",
      "romaji": "kinou",
      "pt": "função"
    }
  ]
},
{
  "id": "j_n2_kinou_func",
  "category": "kanji",
  "focus": "機",
  "jp": "機",
  "romaji": "ki",
  "pt": "máquina / função",
  "type": "kanji",
  "hint": "N2 útil · tecnologia e sociedade. Em 機能, significa função de sistema.",
  "chars": [
    "機"
  ],
  "jlpt": "N2",
  "group": "tecnologia e sociedade",
  "memo": "Em 機能, significa função de sistema.",
  "onyomi": "キ",
  "kunyomi": "はた",
  "strokes": "16",
  "examples": [
    {
      "jp": "機能",
      "romaji": "kinou",
      "pt": "função"
    },
    {
      "jp": "機械",
      "romaji": "kikai",
      "pt": "máquina"
    },
    {
      "jp": "機会",
      "romaji": "kikai",
      "pt": "oportunidade"
    }
  ]
},
{
  "id": "j_n2_kaizen",
  "category": "kanji",
  "focus": "善",
  "jp": "善",
  "romaji": "zen / yoi",
  "pt": "bom / melhorar",
  "type": "kanji",
  "hint": "N2 útil · tecnologia e sociedade. Kaizen, melhoria e virtude.",
  "chars": [
    "善"
  ],
  "jlpt": "N2",
  "group": "tecnologia e sociedade",
  "memo": "Kaizen, melhoria e virtude.",
  "onyomi": "ゼン",
  "kunyomi": "よ",
  "strokes": "12",
  "examples": [
    {
      "jp": "改善",
      "romaji": "kaizen",
      "pt": "melhoria"
    },
    {
      "jp": "善い",
      "romaji": "yoi",
      "pt": "bom"
    },
    {
      "jp": "最善",
      "romaji": "saizen",
      "pt": "o melhor possível"
    }
  ]
},
{
  "id": "j_n1_shinri",
  "category": "kanji",
  "focus": "審",
  "jp": "審",
  "romaji": "shin",
  "pt": "examinar / julgar",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. Aparece em avaliação, julgamento e revisão formal.",
  "chars": [
    "審"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "Aparece em avaliação, julgamento e revisão formal.",
  "onyomi": "シン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "審査",
      "romaji": "shinsa",
      "pt": "avaliação / julgamento"
    },
    {
      "jp": "審判",
      "romaji": "shinpan",
      "pt": "árbitro / julgamento"
    },
    {
      "jp": "再審",
      "romaji": "saishin",
      "pt": "novo julgamento"
    }
  ]
},
{
  "id": "j_n1_sa_inspect",
  "category": "kanji",
  "focus": "査",
  "jp": "査",
  "romaji": "sa",
  "pt": "investigar",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. Exame de detalhes e investigação.",
  "chars": [
    "査"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "Exame de detalhes e investigação.",
  "onyomi": "サ",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "審査",
      "romaji": "shinsa",
      "pt": "avaliação"
    },
    {
      "jp": "調査",
      "romaji": "chousa",
      "pt": "investigação"
    },
    {
      "jp": "検査",
      "romaji": "kensa",
      "pt": "inspeção"
    }
  ]
},
{
  "id": "j_n1_kenkai",
  "category": "kanji",
  "focus": "見",
  "jp": "見",
  "romaji": "ken / miru",
  "pt": "opinião / ver",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. No avançado, 見 vira ponto de vista.",
  "chars": [
    "見"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "No avançado, 見 vira ponto de vista.",
  "onyomi": "ケン",
  "kunyomi": "み",
  "strokes": "7",
  "examples": [
    {
      "jp": "見解",
      "romaji": "kenkai",
      "pt": "opinião / visão"
    },
    {
      "jp": "意見",
      "romaji": "iken",
      "pt": "opinião"
    },
    {
      "jp": "見直す",
      "romaji": "minaosu",
      "pt": "revisar"
    }
  ]
},
{
  "id": "j_n1_kai_understand",
  "category": "kanji",
  "focus": "解",
  "jp": "解",
  "romaji": "kai / toku",
  "pt": "desatar / entender",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. Entender é desatar o nó do texto.",
  "chars": [
    "解"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "Entender é desatar o nó do texto.",
  "onyomi": "カイ, ゲ",
  "kunyomi": "と",
  "strokes": "13",
  "examples": [
    {
      "jp": "理解",
      "romaji": "rikai",
      "pt": "compreensão"
    },
    {
      "jp": "解決",
      "romaji": "kaiketsu",
      "pt": "solução"
    },
    {
      "jp": "解釈",
      "romaji": "kaishaku",
      "pt": "interpretação"
    }
  ]
},
{
  "id": "j_n1_shaku",
  "category": "kanji",
  "focus": "釈",
  "jp": "釈",
  "romaji": "shaku",
  "pt": "interpretação / explicação",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. Kanji de interpretação profunda.",
  "chars": [
    "釈"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "Kanji de interpretação profunda.",
  "onyomi": "シャク",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "解釈",
      "romaji": "kaishaku",
      "pt": "interpretação"
    },
    {
      "jp": "釈明",
      "romaji": "shakumei",
      "pt": "explicação / justificativa"
    },
    {
      "jp": "通訳",
      "romaji": "tsuuyaku",
      "pt": "interpretação oral"
    }
  ]
},
{
  "id": "j_n1_yaku_translate",
  "category": "kanji",
  "focus": "訳",
  "jp": "訳",
  "romaji": "yaku / wake",
  "pt": "tradução / razão",
  "type": "kanji",
  "hint": "N1 útil · intérprete. Kanji do intérprete: traduzir e explicar razão.",
  "chars": [
    "訳"
  ],
  "jlpt": "N1",
  "group": "intérprete",
  "memo": "Kanji do intérprete: traduzir e explicar razão.",
  "onyomi": "ヤク",
  "kunyomi": "わけ",
  "strokes": "11",
  "examples": [
    {
      "jp": "翻訳",
      "romaji": "honyaku",
      "pt": "tradução escrita"
    },
    {
      "jp": "通訳",
      "romaji": "tsuuyaku",
      "pt": "intérprete / interpretação"
    },
    {
      "jp": "訳",
      "romaji": "wake",
      "pt": "razão / motivo"
    }
  ]
},
{
  "id": "j_n1_hon_translate",
  "category": "kanji",
  "focus": "翻",
  "jp": "翻",
  "romaji": "hon / hirugaeru",
  "pt": "virar / traduzir",
  "type": "kanji",
  "hint": "N1 útil · intérprete. 翻訳 é tradução escrita com transformação de língua.",
  "chars": [
    "翻"
  ],
  "jlpt": "N1",
  "group": "intérprete",
  "memo": "翻訳 é tradução escrita com transformação de língua.",
  "onyomi": "ホン",
  "kunyomi": "ひるがえ",
  "strokes": "18",
  "examples": [
    {
      "jp": "翻訳",
      "romaji": "honyaku",
      "pt": "tradução escrita"
    },
    {
      "jp": "翻す",
      "romaji": "hirugaesu",
      "pt": "virar / mudar atitude"
    },
    {
      "jp": "翻訳者",
      "romaji": "honyakusha",
      "pt": "tradutor"
    }
  ]
},
{
  "id": "j_n1_senmon",
  "category": "kanji",
  "focus": "専",
  "jp": "専",
  "romaji": "sen",
  "pt": "especializado",
  "type": "kanji",
  "hint": "N1 útil · intérprete. Especialização separa estudante de profissional.",
  "chars": [
    "専"
  ],
  "jlpt": "N1",
  "group": "intérprete",
  "memo": "Especialização separa estudante de profissional.",
  "onyomi": "セン",
  "kunyomi": "もっぱ",
  "strokes": "9",
  "examples": [
    {
      "jp": "専門",
      "romaji": "senmon",
      "pt": "especialidade"
    },
    {
      "jp": "専門家",
      "romaji": "senmonka",
      "pt": "especialista"
    },
    {
      "jp": "専用",
      "romaji": "senyou",
      "pt": "uso exclusivo"
    }
  ]
},
{
  "id": "j_n1_mon_gate",
  "category": "kanji",
  "focus": "門",
  "jp": "門",
  "romaji": "mon",
  "pt": "portão / área",
  "type": "kanji",
  "hint": "N1 útil · intérprete. Em 専門, representa uma área de entrada ao conhecimento.",
  "chars": [
    "門"
  ],
  "jlpt": "N1",
  "group": "intérprete",
  "memo": "Em 専門, representa uma área de entrada ao conhecimento.",
  "onyomi": "モン",
  "kunyomi": "かど",
  "strokes": "8",
  "examples": [
    {
      "jp": "専門",
      "romaji": "senmon",
      "pt": "especialidade"
    },
    {
      "jp": "門",
      "romaji": "mon",
      "pt": "portão"
    },
    {
      "jp": "入門",
      "romaji": "nyuumon",
      "pt": "introdução / iniciação"
    }
  ]
},
{
  "id": "j_n1_bunseki",
  "category": "kanji",
  "focus": "析",
  "jp": "析",
  "romaji": "seki",
  "pt": "analisar / dividir",
  "type": "kanji",
  "hint": "N1 útil · intérprete. Analisar é dividir para entender.",
  "chars": [
    "析"
  ],
  "jlpt": "N1",
  "group": "intérprete",
  "memo": "Analisar é dividir para entender.",
  "onyomi": "セキ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "分析",
      "romaji": "bunseki",
      "pt": "análise"
    },
    {
      "jp": "解析",
      "romaji": "kaiseki",
      "pt": "análise detalhada"
    },
    {
      "jp": "析出",
      "romaji": "sekishutsu",
      "pt": "separação / precipitação"
    }
  ]
},
{
  "id": "j_n1_hihan",
  "category": "kanji",
  "focus": "批",
  "jp": "批",
  "romaji": "hi",
  "pt": "criticar / comparar",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. Leitura crítica exige avaliar, não só aceitar.",
  "chars": [
    "批"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "Leitura crítica exige avaliar, não só aceitar.",
  "onyomi": "ヒ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "批判",
      "romaji": "hihan",
      "pt": "crítica"
    },
    {
      "jp": "批評",
      "romaji": "hihyou",
      "pt": "crítica / resenha"
    },
    {
      "jp": "批准",
      "romaji": "hijun",
      "pt": "ratificação"
    }
  ]
},
{
  "id": "j_n1_han_judge",
  "category": "kanji",
  "focus": "判",
  "jp": "判",
  "romaji": "han / wakaru",
  "pt": "julgar / selo",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. Julgar valor, decisão e interpretação.",
  "chars": [
    "判"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "Julgar valor, decisão e interpretação.",
  "onyomi": "ハン, バン",
  "kunyomi": "わか",
  "strokes": "7",
  "examples": [
    {
      "jp": "判断",
      "romaji": "handan",
      "pt": "julgamento / decisão"
    },
    {
      "jp": "批判",
      "romaji": "hihan",
      "pt": "crítica"
    },
    {
      "jp": "判子",
      "romaji": "hanko",
      "pt": "carimbo"
    }
  ]
},
{
  "id": "j_n1_dan_judgement",
  "category": "kanji",
  "focus": "断",
  "jp": "断",
  "romaji": "dan / tatsu",
  "pt": "cortar / decidir",
  "type": "kanji",
  "hint": "N1 útil · leitura crítica. Decidir é cortar opções.",
  "chars": [
    "断"
  ],
  "jlpt": "N1",
  "group": "leitura crítica",
  "memo": "Decidir é cortar opções.",
  "onyomi": "ダン",
  "kunyomi": "た, ことわ",
  "strokes": "11",
  "examples": [
    {
      "jp": "判断",
      "romaji": "handan",
      "pt": "julgamento"
    },
    {
      "jp": "断る",
      "romaji": "kotowaru",
      "pt": "recusar"
    },
    {
      "jp": "中断",
      "romaji": "chuudan",
      "pt": "interrupção"
    }
  ]
},
{
  "id": "j_n1_sougo",
  "category": "kanji",
  "focus": "総",
  "jp": "総",
  "romaji": "sou",
  "pt": "total / geral",
  "type": "kanji",
  "hint": "N1 útil · linguagem formal. Visão geral de um todo complexo.",
  "chars": [
    "総"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "Visão geral de um todo complexo.",
  "onyomi": "ソウ",
  "kunyomi": "す",
  "strokes": "14",
  "examples": [
    {
      "jp": "総合",
      "romaji": "sougou",
      "pt": "síntese / abrangente"
    },
    {
      "jp": "総理",
      "romaji": "souri",
      "pt": "primeiro-ministro"
    },
    {
      "jp": "総額",
      "romaji": "sougaku",
      "pt": "valor total"
    }
  ]
},
{
  "id": "j_n1_gou_synthesis",
  "category": "kanji",
  "focus": "合",
  "jp": "合",
  "romaji": "gou / au",
  "pt": "juntar / combinar",
  "type": "kanji",
  "hint": "N1 útil · linguagem formal. Combinar dados, ideias e pessoas.",
  "chars": [
    "合"
  ],
  "jlpt": "N1",
  "group": "linguagem formal",
  "memo": "Combinar dados, ideias e pessoas.",
  "onyomi": "ゴウ, ガッ",
  "kunyomi": "あ",
  "strokes": "6",
  "examples": [
    {
      "jp": "総合",
      "romaji": "sougou",
      "pt": "síntese"
    },
    {
      "jp": "場合",
      "romaji": "baai",
      "pt": "caso / situação"
    },
    {
      "jp": "合う",
      "romaji": "au",
      "pt": "combinar / servir"
    }
  ]
},
{
  "id": "j_n3_35_katsu",
  "category": "kanji",
  "focus": "活",
  "jp": "活",
  "romaji": "katsu / ikiru",
  "pt": "vida / atividade",
  "type": "kanji",
  "hint": "N3 intermediário · vida prática e rotina. 生活, 活動 e 活用 aparecem em textos de rotina e estudo.",
  "chars": [
    "活"
  ],
  "jlpt": "N3",
  "group": "vida prática e rotina",
  "memo": "生活, 活動 e 活用 aparecem em textos de rotina e estudo.",
  "onyomi": "カツ",
  "kunyomi": "い",
  "strokes": "9",
  "examples": [
    {
      "jp": "生活",
      "romaji": "seikatsu",
      "pt": "vida / cotidiano"
    },
    {
      "jp": "活動",
      "romaji": "katsudou",
      "pt": "atividade"
    },
    {
      "jp": "活用",
      "romaji": "katsuyou",
      "pt": "uso prático"
    }
  ],
  "sentences": [
    {
      "type": "onyomi",
      "word": "生活",
      "jp": "日本での生活に少し慣れてきました。",
      "pt": "Estou começando a me acostumar um pouco com a vida no Japão.",
      "note": "生活 = vida/cotidiano"
    }
  ]
},
{
  "id": "j_n3_35_dou",
  "category": "kanji",
  "focus": "動",
  "jp": "動",
  "romaji": "dou / ugoku",
  "pt": "mover / movimento",
  "type": "kanji",
  "hint": "N3 intermediário · vida prática e rotina. 動 aparece em movimento, atividade, emoção e funcionamento.",
  "chars": [
    "動"
  ],
  "jlpt": "N3",
  "group": "vida prática e rotina",
  "memo": "動 aparece em movimento, atividade, emoção e funcionamento.",
  "onyomi": "ドウ",
  "kunyomi": "うご",
  "strokes": "11",
  "examples": [
    {
      "jp": "動く",
      "romaji": "ugoku",
      "pt": "mover-se"
    },
    {
      "jp": "活動",
      "romaji": "katsudou",
      "pt": "atividade"
    },
    {
      "jp": "自動",
      "romaji": "jidou",
      "pt": "automático"
    }
  ],
  "sentences": [
    {
      "type": "kunyomi",
      "word": "動く",
      "jp": "この機械は急に動かなくなりました。",
      "pt": "Esta máquina parou de funcionar de repente.",
      "note": "動く = mover/funcionar"
    }
  ]
},
{
  "id": "j_n3_35_setsumei",
  "category": "kanji",
  "focus": "説",
  "jp": "説",
  "romaji": "setsu / toku",
  "pt": "explicar / teoria",
  "type": "kanji",
  "hint": "N3 intermediário · opinião e explicação. Explicar bem é ponte para interpretação e fluência.",
  "chars": [
    "説"
  ],
  "jlpt": "N3",
  "group": "opinião e explicação",
  "memo": "Explicar bem é ponte para interpretação e fluência.",
  "onyomi": "セツ",
  "kunyomi": "と",
  "strokes": "14",
  "examples": [
    {
      "jp": "説明",
      "romaji": "setsumei",
      "pt": "explicação"
    },
    {
      "jp": "小説",
      "romaji": "shousetsu",
      "pt": "romance"
    },
    {
      "jp": "説得",
      "romaji": "settoku",
      "pt": "persuasão"
    }
  ],
  "sentences": [
    {
      "type": "onyomi",
      "word": "説明",
      "jp": "もう少し分かりやすく説明してもらえますか。",
      "pt": "Você poderia explicar de uma forma um pouco mais fácil de entender?",
      "note": "説明 = explicação"
    }
  ]
},
{
  "id": "j_n3_35_nai",
  "category": "kanji",
  "focus": "内",
  "jp": "内",
  "romaji": "nai / uchi",
  "pt": "dentro / conteúdo",
  "type": "kanji",
  "hint": "N3 intermediário · interpretação e texto. 内 ajuda a entender conteúdo, interior e limite.",
  "chars": [
    "内"
  ],
  "jlpt": "N3",
  "group": "interpretação e texto",
  "memo": "内 ajuda a entender conteúdo, interior e limite.",
  "onyomi": "ナイ, ダイ",
  "kunyomi": "うち",
  "strokes": "4",
  "examples": [
    {
      "jp": "内容",
      "romaji": "naiyou",
      "pt": "conteúdo"
    },
    {
      "jp": "以内",
      "romaji": "inai",
      "pt": "dentro de"
    },
    {
      "jp": "案内",
      "romaji": "annai",
      "pt": "orientação / guia"
    }
  ],
  "sentences": [
    {
      "type": "onyomi",
      "word": "内容",
      "jp": "この書類の内容を確認してください。",
      "pt": "Por favor, confira o conteúdo deste documento.",
      "note": "内容 = conteúdo"
    }
  ]
},
{
  "id": "j_n3_35_you",
  "category": "kanji",
  "focus": "容",
  "jp": "容",
  "romaji": "you",
  "pt": "conteúdo / aparência",
  "type": "kanji",
  "hint": "N3 intermediário · interpretação e texto. 容 aparece em conteúdo, facilidade e aparência.",
  "chars": [
    "容"
  ],
  "jlpt": "N3",
  "group": "interpretação e texto",
  "memo": "容 aparece em conteúdo, facilidade e aparência.",
  "onyomi": "ヨウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "内容",
      "romaji": "naiyou",
      "pt": "conteúdo"
    },
    {
      "jp": "容易",
      "romaji": "youi",
      "pt": "fácil"
    },
    {
      "jp": "美容",
      "romaji": "biyou",
      "pt": "beleza"
    }
  ]
},
{
  "id": "j_n3_35_kekka",
  "category": "kanji",
  "focus": "果",
  "jp": "果",
  "romaji": "ka / hatasu",
  "pt": "resultado / fruta",
  "type": "kanji",
  "hint": "N3 intermediário · interpretação e texto. Resultado e consequência aparecem muito em textos.",
  "chars": [
    "果"
  ],
  "jlpt": "N3",
  "group": "interpretação e texto",
  "memo": "Resultado e consequência aparecem muito em textos.",
  "onyomi": "カ",
  "kunyomi": "は",
  "strokes": "8",
  "examples": [
    {
      "jp": "結果",
      "romaji": "kekka",
      "pt": "resultado"
    },
    {
      "jp": "効果",
      "romaji": "kouka",
      "pt": "efeito"
    },
    {
      "jp": "果物",
      "romaji": "kudamono",
      "pt": "fruta"
    }
  ],
  "sentences": [
    {
      "type": "onyomi",
      "word": "結果",
      "jp": "検査の結果はまだ出ていません。",
      "pt": "O resultado da inspeção ainda não saiu.",
      "note": "結果 = resultado"
    }
  ]
},
{
  "id": "j_n3_35_ketsu",
  "category": "kanji",
  "focus": "結",
  "jp": "結",
  "romaji": "ketsu / musubu",
  "pt": "ligar / concluir",
  "type": "kanji",
  "hint": "N3 intermediário · interpretação e texto. Conclusão é amarrar ideias: 結.",
  "chars": [
    "結"
  ],
  "jlpt": "N3",
  "group": "interpretação e texto",
  "memo": "Conclusão é amarrar ideias: 結.",
  "onyomi": "ケツ",
  "kunyomi": "むす",
  "strokes": "12",
  "examples": [
    {
      "jp": "結果",
      "romaji": "kekka",
      "pt": "resultado"
    },
    {
      "jp": "結婚",
      "romaji": "kekkon",
      "pt": "casamento"
    },
    {
      "jp": "結ぶ",
      "romaji": "musubu",
      "pt": "amarrar / ligar"
    }
  ]
},
{
  "id": "j_n3_35_hi",
  "category": "kanji",
  "focus": "比",
  "jp": "比",
  "romaji": "hi / kuraberu",
  "pt": "comparar",
  "type": "kanji",
  "hint": "N3 intermediário · interpretação e texto. Comparação é chave para interpretar alternativas.",
  "chars": [
    "比"
  ],
  "jlpt": "N3",
  "group": "interpretação e texto",
  "memo": "Comparação é chave para interpretar alternativas.",
  "onyomi": "ヒ",
  "kunyomi": "くら",
  "strokes": "4",
  "examples": [
    {
      "jp": "比べる",
      "romaji": "kuraberu",
      "pt": "comparar"
    },
    {
      "jp": "比較",
      "romaji": "hikaku",
      "pt": "comparação"
    },
    {
      "jp": "比例",
      "romaji": "hirei",
      "pt": "proporção"
    }
  ],
  "sentences": [
    {
      "type": "kunyomi",
      "word": "比べる",
      "jp": "二つのプランを比べてから決めます。",
      "pt": "Vou decidir depois de comparar os dois planos.",
      "note": "比べる = comparar"
    }
  ]
},
{
  "id": "j_n3_35_kaku",
  "category": "kanji",
  "focus": "較",
  "jp": "較",
  "romaji": "kaku",
  "pt": "comparar",
  "type": "kanji",
  "hint": "N3 intermediário · interpretação e texto. Em 比較, indica comparação formal.",
  "chars": [
    "較"
  ],
  "jlpt": "N3",
  "group": "interpretação e texto",
  "memo": "Em 比較, indica comparação formal.",
  "onyomi": "カク",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "比較",
      "romaji": "hikaku",
      "pt": "comparação"
    },
    {
      "jp": "比較的",
      "romaji": "hikakuteki",
      "pt": "relativamente"
    },
    {
      "jp": "比較する",
      "romaji": "hikaku suru",
      "pt": "comparar"
    }
  ]
},
{
  "id": "j_n3_35_sen",
  "category": "kanji",
  "focus": "選",
  "jp": "選",
  "romaji": "sen / erabu",
  "pt": "escolher",
  "type": "kanji",
  "hint": "N3 intermediário · decisão e autonomia. Escolher bem é autonomia real no Japão.",
  "chars": [
    "選"
  ],
  "jlpt": "N3",
  "group": "decisão e autonomia",
  "memo": "Escolher bem é autonomia real no Japão.",
  "onyomi": "セン",
  "kunyomi": "えら",
  "strokes": "15",
  "examples": [
    {
      "jp": "選ぶ",
      "romaji": "erabu",
      "pt": "escolher"
    },
    {
      "jp": "選択",
      "romaji": "sentaku",
      "pt": "seleção / escolha"
    },
    {
      "jp": "抽選",
      "romaji": "chuusen",
      "pt": "sorteio"
    }
  ],
  "sentences": [
    {
      "type": "kunyomi",
      "word": "選ぶ",
      "jp": "自分に合う勉強方法を選びたいです。",
      "pt": "Quero escolher um método de estudo que combine comigo.",
      "note": "選ぶ = escolher"
    }
  ]
},
{
  "id": "j_n3_35_taku",
  "category": "kanji",
  "focus": "択",
  "jp": "択",
  "romaji": "taku",
  "pt": "selecionar",
  "type": "kanji",
  "hint": "N3 intermediário · decisão e autonomia. Aparece em escolhas e alternativas de prova.",
  "chars": [
    "択"
  ],
  "jlpt": "N3",
  "group": "decisão e autonomia",
  "memo": "Aparece em escolhas e alternativas de prova.",
  "onyomi": "タク",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "選択",
      "romaji": "sentaku",
      "pt": "seleção / escolha"
    },
    {
      "jp": "二択",
      "romaji": "nitaku",
      "pt": "duas opções"
    },
    {
      "jp": "選択肢",
      "romaji": "sentakushi",
      "pt": "alternativa"
    }
  ]
},
{
  "id": "j_n3_35_shi",
  "category": "kanji",
  "focus": "肢",
  "jp": "肢",
  "romaji": "shi",
  "pt": "membro / alternativa",
  "type": "kanji",
  "hint": "N3 intermediário · decisão e autonomia. Em prova, 選択肢 são as alternativas.",
  "chars": [
    "肢"
  ],
  "jlpt": "N3",
  "group": "decisão e autonomia",
  "memo": "Em prova, 選択肢 são as alternativas.",
  "onyomi": "シ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "選択肢",
      "romaji": "sentakushi",
      "pt": "alternativa"
    },
    {
      "jp": "四肢",
      "romaji": "shishi",
      "pt": "membros"
    },
    {
      "jp": "下肢",
      "romaji": "membro inferior",
      "pt": "membro inferior"
    }
  ]
},
{
  "id": "j_n3_35_den",
  "category": "kanji",
  "focus": "伝",
  "jp": "伝",
  "romaji": "den / tsutaeru",
  "pt": "transmitir / comunicar",
  "type": "kanji",
  "hint": "N3 intermediário · comunicação e trabalho. Comunicar, passar recado e transmitir contexto.",
  "chars": [
    "伝"
  ],
  "jlpt": "N3",
  "group": "comunicação e trabalho",
  "memo": "Comunicar, passar recado e transmitir contexto.",
  "onyomi": "デン",
  "kunyomi": "つた",
  "strokes": "6",
  "examples": [
    {
      "jp": "伝える",
      "romaji": "tsutaeru",
      "pt": "transmitir / comunicar"
    },
    {
      "jp": "手伝う",
      "romaji": "tetsudau",
      "pt": "ajudar"
    },
    {
      "jp": "伝言",
      "romaji": "dengon",
      "pt": "recado"
    }
  ],
  "sentences": [
    {
      "type": "kunyomi",
      "word": "伝える",
      "jp": "この内容をリーダーに伝えてください。",
      "pt": "Por favor, transmita este conteúdo ao líder.",
      "note": "伝える = transmitir"
    }
  ]
},
{
  "id": "j_n3_35_zoku",
  "category": "kanji",
  "focus": "続",
  "jp": "続",
  "romaji": "zoku / tsuzuku",
  "pt": "continuar",
  "type": "kanji",
  "hint": "N3 intermediário · continuidade e progresso. Continuidade separa estudo real de empolgação passageira.",
  "chars": [
    "続"
  ],
  "jlpt": "N3",
  "group": "continuidade e progresso",
  "memo": "Continuidade separa estudo real de empolgação passageira.",
  "onyomi": "ゾク",
  "kunyomi": "つづ",
  "strokes": "13",
  "examples": [
    {
      "jp": "続ける",
      "romaji": "tsuzukeru",
      "pt": "continuar algo"
    },
    {
      "jp": "続く",
      "romaji": "tsuzuku",
      "pt": "continuar"
    },
    {
      "jp": "継続",
      "romaji": "keizoku",
      "pt": "continuação"
    }
  ],
  "sentences": [
    {
      "type": "kunyomi",
      "word": "続ける",
      "jp": "毎日少しずつ勉強を続けます。",
      "pt": "Vou continuar estudando um pouco todos os dias.",
      "note": "続ける = continuar"
    }
  ]
},
{
  "id": "j_n3_35_yu",
  "category": "kanji",
  "focus": "由",
  "jp": "由",
  "romaji": "yuu",
  "pt": "razão / origem",
  "type": "kanji",
  "hint": "N3 intermediário · opinião e explicação. 理由 é uma das palavras centrais para explicar opinião.",
  "chars": [
    "由"
  ],
  "jlpt": "N3",
  "group": "opinião e explicação",
  "memo": "理由 é uma das palavras centrais para explicar opinião.",
  "onyomi": "ユウ, ユ",
  "kunyomi": "よし",
  "strokes": "5",
  "examples": [
    {
      "jp": "理由",
      "romaji": "riyuu",
      "pt": "motivo"
    },
    {
      "jp": "自由",
      "romaji": "jiyuu",
      "pt": "liberdade"
    },
    {
      "jp": "由来",
      "romaji": "yurai",
      "pt": "origem"
    }
  ]
},
{
  "id": "j_n2_35_tai",
  "category": "kanji",
  "focus": "対",
  "jp": "対",
  "romaji": "tai",
  "pt": "contra / em relação a",
  "type": "kanji",
  "hint": "N2 intermediário · leitura formal e sistemas. Indica relação, oposição ou resposta.",
  "chars": [
    "対"
  ],
  "jlpt": "N2",
  "group": "leitura formal e sistemas",
  "memo": "Indica relação, oposição ou resposta.",
  "onyomi": "タイ, ツイ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "対象",
      "romaji": "taishou",
      "pt": "alvo / objeto"
    },
    {
      "jp": "対応",
      "romaji": "taiou",
      "pt": "resposta / atendimento"
    },
    {
      "jp": "反対",
      "romaji": "hantai",
      "pt": "oposição"
    }
  ]
},
{
  "id": "j_n2_35_shou",
  "category": "kanji",
  "focus": "象",
  "jp": "象",
  "romaji": "shou / zou",
  "pt": "objeto / fenômeno",
  "type": "kanji",
  "hint": "N2 intermediário · leitura formal e sistemas. 対象 é alvo, objeto, público ou tema em textos formais.",
  "chars": [
    "象"
  ],
  "jlpt": "N2",
  "group": "leitura formal e sistemas",
  "memo": "対象 é alvo, objeto, público ou tema em textos formais.",
  "onyomi": "ショウ, ゾウ",
  "kunyomi": "かたど",
  "strokes": "12",
  "examples": [
    {
      "jp": "対象",
      "romaji": "taishou",
      "pt": "alvo / objeto"
    },
    {
      "jp": "現象",
      "romaji": "genshou",
      "pt": "fenômeno"
    },
    {
      "jp": "印象",
      "romaji": "inshou",
      "pt": "impressão"
    }
  ]
},
{
  "id": "j_n2_35_gen",
  "category": "kanji",
  "focus": "現",
  "jp": "現",
  "romaji": "gen / arawareru",
  "pt": "aparecer / atual",
  "type": "kanji",
  "hint": "N2 intermediário · notícias e sociedade. 現 mostra realidade presente: situação atual.",
  "chars": [
    "現"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "現 mostra realidade presente: situação atual.",
  "onyomi": "ゲン",
  "kunyomi": "あらわ",
  "strokes": "11",
  "examples": [
    {
      "jp": "現在",
      "romaji": "genzai",
      "pt": "atualmente"
    },
    {
      "jp": "現場",
      "romaji": "genba",
      "pt": "local real / chão de fábrica"
    },
    {
      "jp": "現金",
      "romaji": "genkin",
      "pt": "dinheiro em espécie"
    }
  ],
  "sentences": [
    {
      "type": "onyomi",
      "word": "現場",
      "jp": "現場の状況を確認してください。",
      "pt": "Por favor, verifique a situação no local de trabalho.",
      "note": "現場 = local real/chão de fábrica"
    }
  ]
},
{
  "id": "j_n2_35_zai",
  "category": "kanji",
  "focus": "在",
  "jp": "在",
  "romaji": "zai / aru",
  "pt": "existir / estar",
  "type": "kanji",
  "hint": "N2 intermediário · notícias e sociedade. Presença, residência e existência formal.",
  "chars": [
    "在"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Presença, residência e existência formal.",
  "onyomi": "ザイ",
  "kunyomi": "あ",
  "strokes": "6",
  "examples": [
    {
      "jp": "現在",
      "romaji": "genzai",
      "pt": "atualmente"
    },
    {
      "jp": "在留カード",
      "romaji": "zairyuu kaado",
      "pt": "cartão de residência"
    },
    {
      "jp": "存在",
      "romaji": "sonzai",
      "pt": "existência"
    }
  ]
},
{
  "id": "j_n2_35_jou",
  "category": "kanji",
  "focus": "状",
  "jp": "状",
  "romaji": "jou",
  "pt": "estado / condição",
  "type": "kanji",
  "hint": "N2 intermediário · notícias e sociedade. 状況 aparece em avisos, relatórios e explicações.",
  "chars": [
    "状"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "状況 aparece em avisos, relatórios e explicações.",
  "onyomi": "ジョウ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "状況",
      "romaji": "joukyou",
      "pt": "situação"
    },
    {
      "jp": "状態",
      "romaji": "joutai",
      "pt": "estado / condição"
    },
    {
      "jp": "症状",
      "romaji": "shoujou",
      "pt": "sintoma"
    }
  ],
  "sentences": [
    {
      "type": "onyomi",
      "word": "状況",
      "jp": "今の状況を説明してください。",
      "pt": "Por favor, explique a situação atual.",
      "note": "状況 = situação"
    }
  ]
},
{
  "id": "j_n2_35_kyou",
  "category": "kanji",
  "focus": "況",
  "jp": "況",
  "romaji": "kyou",
  "pt": "situação",
  "type": "kanji",
  "hint": "N2 intermediário · notícias e sociedade. Completa 状況, importante para relatórios.",
  "chars": [
    "況"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Completa 状況, importante para relatórios.",
  "onyomi": "キョウ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "状況",
      "romaji": "joukyou",
      "pt": "situação"
    },
    {
      "jp": "不況",
      "romaji": "fukyou",
      "pt": "recessão"
    },
    {
      "jp": "実況",
      "romaji": "jikkyou",
      "pt": "situação real / transmissão"
    }
  ]
},
{
  "id": "j_n2_35_tai_state",
  "category": "kanji",
  "focus": "態",
  "jp": "態",
  "romaji": "tai",
  "pt": "estado / forma",
  "type": "kanji",
  "hint": "N2 intermediário · notícias e sociedade. Estado de algo, postura, atitude.",
  "chars": [
    "態"
  ],
  "jlpt": "N2",
  "group": "notícias e sociedade",
  "memo": "Estado de algo, postura, atitude.",
  "onyomi": "タイ",
  "kunyomi": "",
  "strokes": "14",
  "examples": [
    {
      "jp": "状態",
      "romaji": "joutai",
      "pt": "estado"
    },
    {
      "jp": "態度",
      "romaji": "taido",
      "pt": "atitude"
    },
    {
      "jp": "実態",
      "romaji": "jittai",
      "pt": "realidade / condição real"
    }
  ]
},
{
  "id": "j_n2_35_teian",
  "category": "kanji",
  "focus": "提",
  "jp": "提",
  "romaji": "tei / sageru",
  "pt": "apresentar / propor",
  "type": "kanji",
  "hint": "N2 intermediário · documentos e proposta. Proposta e entrega formal de ideia/documento.",
  "chars": [
    "提"
  ],
  "jlpt": "N2",
  "group": "documentos e proposta",
  "memo": "Proposta e entrega formal de ideia/documento.",
  "onyomi": "テイ",
  "kunyomi": "さ",
  "strokes": "12",
  "examples": [
    {
      "jp": "提案",
      "romaji": "teian",
      "pt": "proposta"
    },
    {
      "jp": "提出",
      "romaji": "teishutsu",
      "pt": "entrega de documento"
    },
    {
      "jp": "提示",
      "romaji": "teiji",
      "pt": "apresentação"
    }
  ],
  "sentences": [
    {
      "type": "onyomi",
      "word": "提出",
      "jp": "この書類を明日までに提出してください。",
      "pt": "Por favor, entregue este documento até amanhã.",
      "note": "提出 = entrega/submissão"
    }
  ]
},
{
  "id": "j_n2_35_an",
  "category": "kanji",
  "focus": "案",
  "jp": "案",
  "romaji": "an",
  "pt": "plano / proposta",
  "type": "kanji",
  "hint": "N2 intermediário · documentos e proposta. Ideia organizada para resolver algo.",
  "chars": [
    "案"
  ],
  "jlpt": "N2",
  "group": "documentos e proposta",
  "memo": "Ideia organizada para resolver algo.",
  "onyomi": "アン",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "提案",
      "romaji": "teian",
      "pt": "proposta"
    },
    {
      "jp": "案内",
      "romaji": "annai",
      "pt": "orientação / guia"
    },
    {
      "jp": "方案",
      "romaji": "houan",
      "pt": "plano / projeto"
    }
  ]
},
{
  "id": "j_n2_35_shoumei",
  "category": "kanji",
  "focus": "証",
  "jp": "証",
  "romaji": "shou",
  "pt": "prova / certificado",
  "type": "kanji",
  "hint": "N2 intermediário · documentos e prova. Certificados e comprovações usam 証.",
  "chars": [
    "証"
  ],
  "jlpt": "N2",
  "group": "documentos e prova",
  "memo": "Certificados e comprovações usam 証.",
  "onyomi": "ショウ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "証明書",
      "romaji": "shoumeisho",
      "pt": "certificado"
    },
    {
      "jp": "保険証",
      "romaji": "hokenshou",
      "pt": "cartão do seguro"
    },
    {
      "jp": "証拠",
      "romaji": "shouko",
      "pt": "prova"
    }
  ]
},
{
  "id": "j_n2_35_tei",
  "category": "kanji",
  "focus": "定",
  "jp": "定",
  "romaji": "tei / sadameru",
  "pt": "fixar / determinar",
  "type": "kanji",
  "hint": "N2 intermediário · documentos e prova. Define regra, plano e decisão.",
  "chars": [
    "定"
  ],
  "jlpt": "N2",
  "group": "documentos e prova",
  "memo": "Define regra, plano e decisão.",
  "onyomi": "テイ, ジョウ",
  "kunyomi": "さだ",
  "strokes": "8",
  "examples": [
    {
      "jp": "予定",
      "romaji": "yotei",
      "pt": "programação"
    },
    {
      "jp": "決定",
      "romaji": "kettei",
      "pt": "decisão"
    },
    {
      "jp": "安定",
      "romaji": "antei",
      "pt": "estabilidade"
    }
  ]
},
{
  "id": "j_n2_35_ryou",
  "category": "kanji",
  "focus": "了",
  "jp": "了",
  "romaji": "ryou",
  "pt": "concluir",
  "type": "kanji",
  "hint": "N2 intermediário · documentos e prova. Conclusão formal de processo ou entendimento.",
  "chars": [
    "了"
  ],
  "jlpt": "N2",
  "group": "documentos e prova",
  "memo": "Conclusão formal de processo ou entendimento.",
  "onyomi": "リョウ",
  "kunyomi": "",
  "strokes": "2",
  "examples": [
    {
      "jp": "終了",
      "romaji": "shuuryou",
      "pt": "encerramento"
    },
    {
      "jp": "完了",
      "romaji": "kanryou",
      "pt": "conclusão"
    },
    {
      "jp": "了解",
      "romaji": "ryoukai",
      "pt": "entendido"
    }
  ]
},
{
  "id": "j_n2_35_kan",
  "category": "kanji",
  "focus": "完",
  "jp": "完",
  "romaji": "kan",
  "pt": "completo",
  "type": "kanji",
  "hint": "N2 intermediário · documentos e prova. Completo, finalizado, perfeito para processos.",
  "chars": [
    "完"
  ],
  "jlpt": "N2",
  "group": "documentos e prova",
  "memo": "Completo, finalizado, perfeito para processos.",
  "onyomi": "カン",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "完了",
      "romaji": "kanryou",
      "pt": "conclusão"
    },
    {
      "jp": "完全",
      "romaji": "kanzen",
      "pt": "completo / perfeito"
    },
    {
      "jp": "完成",
      "romaji": "kansei",
      "pt": "finalização"
    }
  ]
},
{
  "id": "j_n2_35_ka_value",
  "category": "kanji",
  "focus": "価",
  "jp": "価",
  "romaji": "ka / atai",
  "pt": "valor",
  "type": "kanji",
  "hint": "N2 intermediário · economia e avaliação. Valor, preço e avaliação.",
  "chars": [
    "価"
  ],
  "jlpt": "N2",
  "group": "economia e avaliação",
  "memo": "Valor, preço e avaliação.",
  "onyomi": "カ",
  "kunyomi": "あたい",
  "strokes": "8",
  "examples": [
    {
      "jp": "価格",
      "romaji": "kakaku",
      "pt": "preço"
    },
    {
      "jp": "価値",
      "romaji": "kachi",
      "pt": "valor"
    },
    {
      "jp": "評価",
      "romaji": "hyouka",
      "pt": "avaliação"
    }
  ]
},
{
  "id": "j_n2_35_hyou",
  "category": "kanji",
  "focus": "評",
  "jp": "評",
  "romaji": "hyou",
  "pt": "avaliar",
  "type": "kanji",
  "hint": "N2 intermediário · economia e avaliação. Avaliação de produto, pessoa e argumento.",
  "chars": [
    "評"
  ],
  "jlpt": "N2",
  "group": "economia e avaliação",
  "memo": "Avaliação de produto, pessoa e argumento.",
  "onyomi": "ヒョウ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "評価",
      "romaji": "hyouka",
      "pt": "avaliação"
    },
    {
      "jp": "評判",
      "romaji": "hyouban",
      "pt": "reputação"
    },
    {
      "jp": "批評",
      "romaji": "hihyou",
      "pt": "crítica / resenha"
    }
  ]
},
{
  "id": "j_n2_35_son",
  "category": "kanji",
  "focus": "尊",
  "jp": "尊",
  "romaji": "son / toutoi",
  "pt": "respeito / nobre",
  "type": "kanji",
  "hint": "N2 intermediário · relações e formalidade. Respeito formal e humano.",
  "chars": [
    "尊"
  ],
  "jlpt": "N2",
  "group": "relações e formalidade",
  "memo": "Respeito formal e humano.",
  "onyomi": "ソン",
  "kunyomi": "たっと, とうと",
  "strokes": "12",
  "examples": [
    {
      "jp": "尊敬",
      "romaji": "sonkei",
      "pt": "respeito"
    },
    {
      "jp": "尊重",
      "romaji": "sonchou",
      "pt": "respeitar / valorizar"
    },
    {
      "jp": "尊い",
      "romaji": "toutoi",
      "pt": "precioso / nobre"
    }
  ]
},
{
  "id": "j_n2_35_kei",
  "category": "kanji",
  "focus": "敬",
  "jp": "敬",
  "romaji": "kei / uyamau",
  "pt": "respeitar",
  "type": "kanji",
  "hint": "N2 intermediário · relações e formalidade. Base de linguagem respeitosa e convivência.",
  "chars": [
    "敬"
  ],
  "jlpt": "N2",
  "group": "relações e formalidade",
  "memo": "Base de linguagem respeitosa e convivência.",
  "onyomi": "ケイ",
  "kunyomi": "うやま",
  "strokes": "12",
  "examples": [
    {
      "jp": "尊敬",
      "romaji": "sonkei",
      "pt": "respeito"
    },
    {
      "jp": "敬語",
      "romaji": "keigo",
      "pt": "linguagem honorífica"
    },
    {
      "jp": "敬う",
      "romaji": "uyamau",
      "pt": "respeitar"
    }
  ]
},
{
  "id": "j_n5_36_672c_1",
  "category": "kanji",
  "focus": "本",
  "jp": "本",
  "romaji": "ホン",
  "pt": "livro / origem",
  "type": "kanji",
  "hint": "N5 essencial · base absoluta. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "本"
  ],
  "jlpt": "N5",
  "group": "base absoluta",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ホン",
  "kunyomi": "もと",
  "strokes": "5",
  "examples": [
    {
      "jp": "本",
      "romaji": "hon",
      "pt": "livro"
    },
    {
      "jp": "日本",
      "romaji": "nihon",
      "pt": "Japão"
    },
    {
      "jp": "本日",
      "romaji": "honjitsu",
      "pt": "hoje"
    }
  ]
},
{
  "id": "j_n5_36_6821_1",
  "category": "kanji",
  "focus": "校",
  "jp": "校",
  "romaji": "コウ",
  "pt": "escola",
  "type": "kanji",
  "hint": "N5 essencial · base absoluta. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "校"
  ],
  "jlpt": "N5",
  "group": "base absoluta",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "コウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "学校",
      "romaji": "gakkou",
      "pt": "escola"
    },
    {
      "jp": "高校",
      "romaji": "koukou",
      "pt": "ensino médio"
    },
    {
      "jp": "校長",
      "romaji": "kouchou",
      "pt": "diretor"
    }
  ]
},
{
  "id": "j_n5_36_5148_1",
  "category": "kanji",
  "focus": "先",
  "jp": "先",
  "romaji": "セン",
  "pt": "antes / professor",
  "type": "kanji",
  "hint": "N5 essencial · base absoluta. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "先"
  ],
  "jlpt": "N5",
  "group": "base absoluta",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セン",
  "kunyomi": "さき",
  "strokes": "6",
  "examples": [
    {
      "jp": "先生",
      "romaji": "sensei",
      "pt": "professor"
    },
    {
      "jp": "先月",
      "romaji": "sengetsu",
      "pt": "mês passado"
    },
    {
      "jp": "先に",
      "romaji": "saki ni",
      "pt": "antes"
    }
  ]
},
{
  "id": "j_n5_36_751f_1",
  "category": "kanji",
  "focus": "生",
  "jp": "生",
  "romaji": "セイ, ショウ",
  "pt": "vida / nascer",
  "type": "kanji",
  "hint": "N5 essencial · base absoluta. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "生"
  ],
  "jlpt": "N5",
  "group": "base absoluta",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セイ, ショウ",
  "kunyomi": "い, う, なま",
  "strokes": "5",
  "examples": [
    {
      "jp": "学生",
      "romaji": "gakusei",
      "pt": "estudante"
    },
    {
      "jp": "先生",
      "romaji": "sensei",
      "pt": "professor"
    },
    {
      "jp": "生まれる",
      "romaji": "umareru",
      "pt": "nascer"
    }
  ]
},
{
  "id": "j_n5_36_5927_1",
  "category": "kanji",
  "focus": "大",
  "jp": "大",
  "romaji": "ダイ, タイ",
  "pt": "grande",
  "type": "kanji",
  "hint": "N5 essencial · descrições básicas. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "大"
  ],
  "jlpt": "N5",
  "group": "descrições básicas",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ダイ, タイ",
  "kunyomi": "おお",
  "strokes": "3",
  "examples": [
    {
      "jp": "大きい",
      "romaji": "ookii",
      "pt": "grande"
    },
    {
      "jp": "大学",
      "romaji": "daigaku",
      "pt": "universidade"
    },
    {
      "jp": "大丈夫",
      "romaji": "daijoubu",
      "pt": "tudo bem"
    }
  ]
},
{
  "id": "j_n5_36_5c0f_1",
  "category": "kanji",
  "focus": "小",
  "jp": "小",
  "romaji": "ショウ",
  "pt": "pequeno",
  "type": "kanji",
  "hint": "N5 essencial · descrições básicas. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "小"
  ],
  "jlpt": "N5",
  "group": "descrições básicas",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ショウ",
  "kunyomi": "ちい, こ",
  "strokes": "3",
  "examples": [
    {
      "jp": "小さい",
      "romaji": "chiisai",
      "pt": "pequeno"
    },
    {
      "jp": "小学校",
      "romaji": "shougakkou",
      "pt": "escola primária"
    },
    {
      "jp": "大小",
      "romaji": "daishou",
      "pt": "tamanho"
    }
  ]
},
{
  "id": "j_n5_36_65e9_1",
  "category": "kanji",
  "focus": "早",
  "jp": "早",
  "romaji": "ソウ",
  "pt": "cedo / rápido",
  "type": "kanji",
  "hint": "N5 essencial · descrições básicas. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "早"
  ],
  "jlpt": "N5",
  "group": "descrições básicas",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ソウ",
  "kunyomi": "はや",
  "strokes": "6",
  "examples": [
    {
      "jp": "早い",
      "romaji": "hayai",
      "pt": "cedo"
    },
    {
      "jp": "早朝",
      "romaji": "souchou",
      "pt": "bem cedo"
    },
    {
      "jp": "早口",
      "romaji": "hayakuchi",
      "pt": "fala rápida"
    }
  ]
},
{
  "id": "j_n5_36_5348_1",
  "category": "kanji",
  "focus": "午",
  "jp": "午",
  "romaji": "ゴ",
  "pt": "meio-dia",
  "type": "kanji",
  "hint": "N5 essencial · tempo. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "午"
  ],
  "jlpt": "N5",
  "group": "tempo",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ゴ",
  "kunyomi": "",
  "strokes": "4",
  "examples": [
    {
      "jp": "午前",
      "romaji": "gozen",
      "pt": "manhã"
    },
    {
      "jp": "午後",
      "romaji": "gogo",
      "pt": "tarde"
    },
    {
      "jp": "正午",
      "romaji": "shougo",
      "pt": "meio-dia"
    }
  ]
},
{
  "id": "j_n5_36_524d_1",
  "category": "kanji",
  "focus": "前",
  "jp": "前",
  "romaji": "ゼン",
  "pt": "frente / antes",
  "type": "kanji",
  "hint": "N5 essencial · posição. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "前"
  ],
  "jlpt": "N5",
  "group": "posição",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ゼン",
  "kunyomi": "まえ",
  "strokes": "9",
  "examples": [
    {
      "jp": "前",
      "romaji": "mae",
      "pt": "frente"
    },
    {
      "jp": "名前",
      "romaji": "namae",
      "pt": "nome"
    },
    {
      "jp": "午前",
      "romaji": "gozen",
      "pt": "manhã"
    }
  ]
},
{
  "id": "j_n5_36_5f8c_1",
  "category": "kanji",
  "focus": "後",
  "jp": "後",
  "romaji": "ゴ, コウ",
  "pt": "depois / atrás",
  "type": "kanji",
  "hint": "N5 essencial · posição. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "後"
  ],
  "jlpt": "N5",
  "group": "posição",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ゴ, コウ",
  "kunyomi": "あと, うし",
  "strokes": "9",
  "examples": [
    {
      "jp": "後ろ",
      "romaji": "ushiro",
      "pt": "atrás"
    },
    {
      "jp": "午後",
      "romaji": "gogo",
      "pt": "tarde"
    },
    {
      "jp": "最後",
      "romaji": "saigo",
      "pt": "final"
    }
  ]
},
{
  "id": "j_n5_36_6771_1",
  "category": "kanji",
  "focus": "東",
  "jp": "東",
  "romaji": "トウ",
  "pt": "leste",
  "type": "kanji",
  "hint": "N5 essencial · direção. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "東"
  ],
  "jlpt": "N5",
  "group": "direção",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "トウ",
  "kunyomi": "ひがし",
  "strokes": "8",
  "examples": [
    {
      "jp": "東",
      "romaji": "higashi",
      "pt": "leste"
    },
    {
      "jp": "東京",
      "romaji": "toukyou",
      "pt": "Tóquio"
    },
    {
      "jp": "東口",
      "romaji": "higashiguchi",
      "pt": "saída leste"
    }
  ]
},
{
  "id": "j_n5_36_897f_1",
  "category": "kanji",
  "focus": "西",
  "jp": "西",
  "romaji": "セイ, サイ",
  "pt": "oeste",
  "type": "kanji",
  "hint": "N5 essencial · direção. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "西"
  ],
  "jlpt": "N5",
  "group": "direção",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セイ, サイ",
  "kunyomi": "にし",
  "strokes": "6",
  "examples": [
    {
      "jp": "西",
      "romaji": "nishi",
      "pt": "oeste"
    },
    {
      "jp": "西口",
      "romaji": "nishiguchi",
      "pt": "saída oeste"
    },
    {
      "jp": "関西",
      "romaji": "kansai",
      "pt": "Kansai"
    }
  ]
},
{
  "id": "j_n5_36_5357_1",
  "category": "kanji",
  "focus": "南",
  "jp": "南",
  "romaji": "ナン",
  "pt": "sul",
  "type": "kanji",
  "hint": "N5 essencial · direção. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "南"
  ],
  "jlpt": "N5",
  "group": "direção",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ナン",
  "kunyomi": "みなみ",
  "strokes": "9",
  "examples": [
    {
      "jp": "南",
      "romaji": "minami",
      "pt": "sul"
    },
    {
      "jp": "南口",
      "romaji": "minamiguchi",
      "pt": "saída sul"
    },
    {
      "jp": "東南",
      "romaji": "tounan",
      "pt": "sudeste"
    }
  ]
},
{
  "id": "j_n5_36_5317_1",
  "category": "kanji",
  "focus": "北",
  "jp": "北",
  "romaji": "ホク",
  "pt": "norte",
  "type": "kanji",
  "hint": "N5 essencial · direção. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "北"
  ],
  "jlpt": "N5",
  "group": "direção",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ホク",
  "kunyomi": "きた",
  "strokes": "5",
  "examples": [
    {
      "jp": "北",
      "romaji": "kita",
      "pt": "norte"
    },
    {
      "jp": "北口",
      "romaji": "kitaguchi",
      "pt": "saída norte"
    },
    {
      "jp": "北海道",
      "romaji": "hokkaidou",
      "pt": "Hokkaido"
    }
  ]
},
{
  "id": "j_n5_36_767d_1",
  "category": "kanji",
  "focus": "白",
  "jp": "白",
  "romaji": "ハク",
  "pt": "branco",
  "type": "kanji",
  "hint": "N5 essencial · cores. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "白"
  ],
  "jlpt": "N5",
  "group": "cores",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ハク",
  "kunyomi": "しろ",
  "strokes": "5",
  "examples": [
    {
      "jp": "白い",
      "romaji": "shiroi",
      "pt": "branco"
    },
    {
      "jp": "白",
      "romaji": "shiro",
      "pt": "branco"
    },
    {
      "jp": "面白い",
      "romaji": "omoshiroi",
      "pt": "interessante"
    }
  ]
},
{
  "id": "j_n5_36_9ed2_1",
  "category": "kanji",
  "focus": "黒",
  "jp": "黒",
  "romaji": "コク",
  "pt": "preto",
  "type": "kanji",
  "hint": "N5 essencial · cores. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "黒"
  ],
  "jlpt": "N5",
  "group": "cores",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "コク",
  "kunyomi": "くろ",
  "strokes": "11",
  "examples": [
    {
      "jp": "黒い",
      "romaji": "kuroi",
      "pt": "preto"
    },
    {
      "jp": "黒板",
      "romaji": "kokuban",
      "pt": "quadro negro"
    },
    {
      "jp": "黒",
      "romaji": "kuro",
      "pt": "preto"
    }
  ]
},
{
  "id": "j_n5_36_8d64_1",
  "category": "kanji",
  "focus": "赤",
  "jp": "赤",
  "romaji": "セキ",
  "pt": "vermelho",
  "type": "kanji",
  "hint": "N5 essencial · cores. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "赤"
  ],
  "jlpt": "N5",
  "group": "cores",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セキ",
  "kunyomi": "あか",
  "strokes": "7",
  "examples": [
    {
      "jp": "赤い",
      "romaji": "akai",
      "pt": "vermelho"
    },
    {
      "jp": "赤ちゃん",
      "romaji": "akachan",
      "pt": "bebê"
    },
    {
      "jp": "赤",
      "romaji": "aka",
      "pt": "vermelho"
    }
  ]
},
{
  "id": "j_n5_36_9752_1",
  "category": "kanji",
  "focus": "青",
  "jp": "青",
  "romaji": "セイ",
  "pt": "azul / verde",
  "type": "kanji",
  "hint": "N5 essencial · cores. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "青"
  ],
  "jlpt": "N5",
  "group": "cores",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セイ",
  "kunyomi": "あお",
  "strokes": "8",
  "examples": [
    {
      "jp": "青い",
      "romaji": "aoi",
      "pt": "azul"
    },
    {
      "jp": "青信号",
      "romaji": "aoshingou",
      "pt": "sinal verde"
    },
    {
      "jp": "青",
      "romaji": "ao",
      "pt": "azul"
    }
  ]
},
{
  "id": "j_n5_36_96e8_1",
  "category": "kanji",
  "focus": "雨",
  "jp": "雨",
  "romaji": "ウ",
  "pt": "chuva",
  "type": "kanji",
  "hint": "N5 essencial · natureza. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "雨"
  ],
  "jlpt": "N5",
  "group": "natureza",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ウ",
  "kunyomi": "あめ",
  "strokes": "8",
  "examples": [
    {
      "jp": "雨",
      "romaji": "ame",
      "pt": "chuva"
    },
    {
      "jp": "大雨",
      "romaji": "ooame",
      "pt": "chuva forte"
    },
    {
      "jp": "雨の日",
      "romaji": "ame no hi",
      "pt": "dia de chuva"
    }
  ]
},
{
  "id": "j_n5_36_7a7a_1",
  "category": "kanji",
  "focus": "空",
  "jp": "空",
  "romaji": "クウ",
  "pt": "céu / vazio",
  "type": "kanji",
  "hint": "N5 essencial · natureza. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "空"
  ],
  "jlpt": "N5",
  "group": "natureza",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "クウ",
  "kunyomi": "そら, あ",
  "strokes": "8",
  "examples": [
    {
      "jp": "空",
      "romaji": "sora",
      "pt": "céu"
    },
    {
      "jp": "空港",
      "romaji": "kuukou",
      "pt": "aeroporto"
    },
    {
      "jp": "空く",
      "romaji": "aku",
      "pt": "ficar vazio"
    }
  ]
},
{
  "id": "j_n5_36_5c71_1",
  "category": "kanji",
  "focus": "山",
  "jp": "山",
  "romaji": "サン",
  "pt": "montanha",
  "type": "kanji",
  "hint": "N5 essencial · natureza. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "山"
  ],
  "jlpt": "N5",
  "group": "natureza",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "サン",
  "kunyomi": "やま",
  "strokes": "3",
  "examples": [
    {
      "jp": "山",
      "romaji": "yama",
      "pt": "montanha"
    },
    {
      "jp": "富士山",
      "romaji": "fujisan",
      "pt": "Monte Fuji"
    },
    {
      "jp": "山道",
      "romaji": "yamamichi",
      "pt": "caminho de montanha"
    }
  ]
},
{
  "id": "j_n5_36_5ddd_1",
  "category": "kanji",
  "focus": "川",
  "jp": "川",
  "romaji": "セン",
  "pt": "rio",
  "type": "kanji",
  "hint": "N5 essencial · natureza. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "川"
  ],
  "jlpt": "N5",
  "group": "natureza",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セン",
  "kunyomi": "かわ",
  "strokes": "3",
  "examples": [
    {
      "jp": "川",
      "romaji": "kawa",
      "pt": "rio"
    },
    {
      "jp": "小川",
      "romaji": "ogawa",
      "pt": "riacho"
    },
    {
      "jp": "川口",
      "romaji": "kawaguchi",
      "pt": "foz do rio"
    }
  ]
},
{
  "id": "j_n5_36_82b1_1",
  "category": "kanji",
  "focus": "花",
  "jp": "花",
  "romaji": "カ",
  "pt": "flor",
  "type": "kanji",
  "hint": "N5 essencial · natureza. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "花"
  ],
  "jlpt": "N5",
  "group": "natureza",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "カ",
  "kunyomi": "はな",
  "strokes": "7",
  "examples": [
    {
      "jp": "花",
      "romaji": "hana",
      "pt": "flor"
    },
    {
      "jp": "花見",
      "romaji": "hanami",
      "pt": "ver flores"
    },
    {
      "jp": "花屋",
      "romaji": "hanaya",
      "pt": "floricultura"
    }
  ]
},
{
  "id": "j_n5_36_8a00_1",
  "category": "kanji",
  "focus": "言",
  "jp": "言",
  "romaji": "ゲン, ゴン",
  "pt": "dizer / palavra",
  "type": "kanji",
  "hint": "N5 essencial · comunicação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "言"
  ],
  "jlpt": "N5",
  "group": "comunicação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ゲン, ゴン",
  "kunyomi": "い, こと",
  "strokes": "7",
  "examples": [
    {
      "jp": "言う",
      "romaji": "iu",
      "pt": "dizer"
    },
    {
      "jp": "言葉",
      "romaji": "kotoba",
      "pt": "palavra"
    },
    {
      "jp": "言語",
      "romaji": "gengo",
      "pt": "língua"
    }
  ]
},
{
  "id": "j_n5_36_8a9e_1",
  "category": "kanji",
  "focus": "語",
  "jp": "語",
  "romaji": "ゴ",
  "pt": "idioma / palavra",
  "type": "kanji",
  "hint": "N5 essencial · comunicação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "語"
  ],
  "jlpt": "N5",
  "group": "comunicação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ゴ",
  "kunyomi": "かた",
  "strokes": "14",
  "examples": [
    {
      "jp": "日本語",
      "romaji": "nihongo",
      "pt": "japonês"
    },
    {
      "jp": "英語",
      "romaji": "eigo",
      "pt": "inglês"
    },
    {
      "jp": "言語",
      "romaji": "gengo",
      "pt": "linguagem"
    }
  ]
},
{
  "id": "j_n4_36_5fc3_1",
  "category": "kanji",
  "focus": "心",
  "jp": "心",
  "romaji": "シン",
  "pt": "coração / mente",
  "type": "kanji",
  "hint": "N4 essencial · vida emocional. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "心"
  ],
  "jlpt": "N4",
  "group": "vida emocional",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シン",
  "kunyomi": "こころ",
  "strokes": "4",
  "examples": [
    {
      "jp": "心",
      "romaji": "kokoro",
      "pt": "coração"
    },
    {
      "jp": "安心",
      "romaji": "anshin",
      "pt": "tranquilidade"
    },
    {
      "jp": "心配",
      "romaji": "shinpai",
      "pt": "preocupação"
    }
  ]
},
{
  "id": "j_n4_36_601d_1",
  "category": "kanji",
  "focus": "思",
  "jp": "思",
  "romaji": "シ",
  "pt": "pensar",
  "type": "kanji",
  "hint": "N4 essencial · vida emocional. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "思"
  ],
  "jlpt": "N4",
  "group": "vida emocional",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シ",
  "kunyomi": "おも",
  "strokes": "9",
  "examples": [
    {
      "jp": "思う",
      "romaji": "omou",
      "pt": "pensar"
    },
    {
      "jp": "思い出す",
      "romaji": "omoidasu",
      "pt": "lembrar"
    },
    {
      "jp": "不思議",
      "romaji": "fushigi",
      "pt": "misterioso"
    }
  ]
},
{
  "id": "j_n4_36_8003_1",
  "category": "kanji",
  "focus": "考",
  "jp": "考",
  "romaji": "コウ",
  "pt": "pensar / considerar",
  "type": "kanji",
  "hint": "N4 essencial · vida emocional. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "考"
  ],
  "jlpt": "N4",
  "group": "vida emocional",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "コウ",
  "kunyomi": "かんが",
  "strokes": "6",
  "examples": [
    {
      "jp": "考える",
      "romaji": "kangaeru",
      "pt": "pensar"
    },
    {
      "jp": "考え",
      "romaji": "kangae",
      "pt": "ideia"
    },
    {
      "jp": "参考",
      "romaji": "sankou",
      "pt": "referência"
    }
  ]
},
{
  "id": "j_n4_36_610f_1",
  "category": "kanji",
  "focus": "意",
  "jp": "意",
  "romaji": "イ",
  "pt": "intenção / sentido",
  "type": "kanji",
  "hint": "N4 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "意"
  ],
  "jlpt": "N4",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "イ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "意味",
      "romaji": "imi",
      "pt": "significado"
    },
    {
      "jp": "注意",
      "romaji": "chuui",
      "pt": "cuidado"
    },
    {
      "jp": "意見",
      "romaji": "iken",
      "pt": "opinião"
    }
  ]
},
{
  "id": "j_n4_36_5473_1",
  "category": "kanji",
  "focus": "味",
  "jp": "味",
  "romaji": "ミ",
  "pt": "sabor / sentido",
  "type": "kanji",
  "hint": "N4 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "味"
  ],
  "jlpt": "N4",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ミ",
  "kunyomi": "あじ",
  "strokes": "8",
  "examples": [
    {
      "jp": "意味",
      "romaji": "imi",
      "pt": "significado"
    },
    {
      "jp": "味",
      "romaji": "aji",
      "pt": "sabor"
    },
    {
      "jp": "味方",
      "romaji": "mikata",
      "pt": "aliado"
    }
  ]
},
{
  "id": "j_n4_36_6ce8_1",
  "category": "kanji",
  "focus": "注",
  "jp": "注",
  "romaji": "チュウ",
  "pt": "atenção / pedido",
  "type": "kanji",
  "hint": "N4 essencial · avisos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "注"
  ],
  "jlpt": "N4",
  "group": "avisos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "チュウ",
  "kunyomi": "そそ",
  "strokes": "8",
  "examples": [
    {
      "jp": "注意",
      "romaji": "chuui",
      "pt": "cuidado"
    },
    {
      "jp": "注文",
      "romaji": "chuumon",
      "pt": "pedido"
    },
    {
      "jp": "注射",
      "romaji": "chuusha",
      "pt": "injeção"
    }
  ]
},
{
  "id": "j_n4_36_984c_1",
  "category": "kanji",
  "focus": "題",
  "jp": "題",
  "romaji": "ダイ",
  "pt": "tema / questão",
  "type": "kanji",
  "hint": "N4 essencial · prova. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "題"
  ],
  "jlpt": "N4",
  "group": "prova",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ダイ",
  "kunyomi": "",
  "strokes": "18",
  "examples": [
    {
      "jp": "問題",
      "romaji": "mondai",
      "pt": "problema"
    },
    {
      "jp": "宿題",
      "romaji": "shukudai",
      "pt": "lição de casa"
    },
    {
      "jp": "題名",
      "romaji": "daimei",
      "pt": "título"
    }
  ]
},
{
  "id": "j_n4_36_7b54_1",
  "category": "kanji",
  "focus": "答",
  "jp": "答",
  "romaji": "トウ",
  "pt": "responder",
  "type": "kanji",
  "hint": "N4 essencial · prova. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "答"
  ],
  "jlpt": "N4",
  "group": "prova",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "トウ",
  "kunyomi": "こた",
  "strokes": "12",
  "examples": [
    {
      "jp": "答える",
      "romaji": "kotaeru",
      "pt": "responder"
    },
    {
      "jp": "答え",
      "romaji": "kotae",
      "pt": "resposta"
    },
    {
      "jp": "回答",
      "romaji": "kaitou",
      "pt": "resposta formal"
    }
  ]
},
{
  "id": "j_n4_36_59cb_1",
  "category": "kanji",
  "focus": "始",
  "jp": "始",
  "romaji": "シ",
  "pt": "começar",
  "type": "kanji",
  "hint": "N4 essencial · rotina. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "始"
  ],
  "jlpt": "N4",
  "group": "rotina",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シ",
  "kunyomi": "はじ",
  "strokes": "8",
  "examples": [
    {
      "jp": "始まる",
      "romaji": "hajimaru",
      "pt": "começar"
    },
    {
      "jp": "開始",
      "romaji": "kaishi",
      "pt": "início"
    },
    {
      "jp": "始める",
      "romaji": "hajimeru",
      "pt": "começar algo"
    }
  ]
},
{
  "id": "j_n4_36_7d42_1",
  "category": "kanji",
  "focus": "終",
  "jp": "終",
  "romaji": "シュウ",
  "pt": "terminar",
  "type": "kanji",
  "hint": "N4 essencial · rotina. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "終"
  ],
  "jlpt": "N4",
  "group": "rotina",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シュウ",
  "kunyomi": "お",
  "strokes": "11",
  "examples": [
    {
      "jp": "終わる",
      "romaji": "owaru",
      "pt": "terminar"
    },
    {
      "jp": "終了",
      "romaji": "shuuryou",
      "pt": "encerramento"
    },
    {
      "jp": "終電",
      "romaji": "shuuden",
      "pt": "último trem"
    }
  ]
},
{
  "id": "j_n4_36_904b_1",
  "category": "kanji",
  "focus": "運",
  "jp": "運",
  "romaji": "ウン",
  "pt": "transportar / sorte",
  "type": "kanji",
  "hint": "N4 essencial · transporte. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "運"
  ],
  "jlpt": "N4",
  "group": "transporte",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ウン",
  "kunyomi": "はこ",
  "strokes": "12",
  "examples": [
    {
      "jp": "運転",
      "romaji": "unten",
      "pt": "dirigir"
    },
    {
      "jp": "運ぶ",
      "romaji": "hakobu",
      "pt": "transportar"
    },
    {
      "jp": "運動",
      "romaji": "undou",
      "pt": "exercício"
    }
  ]
},
{
  "id": "j_n4_36_8ee2_1",
  "category": "kanji",
  "focus": "転",
  "jp": "転",
  "romaji": "テン",
  "pt": "virar / mudar",
  "type": "kanji",
  "hint": "N4 essencial · transporte. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "転"
  ],
  "jlpt": "N4",
  "group": "transporte",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "テン",
  "kunyomi": "ころ",
  "strokes": "11",
  "examples": [
    {
      "jp": "自転車",
      "romaji": "jitensha",
      "pt": "bicicleta"
    },
    {
      "jp": "転職",
      "romaji": "tenshoku",
      "pt": "mudar emprego"
    },
    {
      "jp": "転入",
      "romaji": "tennyuu",
      "pt": "mudança de entrada"
    }
  ]
},
{
  "id": "j_n4_36_9001_1",
  "category": "kanji",
  "focus": "送",
  "jp": "送",
  "romaji": "ソウ",
  "pt": "enviar",
  "type": "kanji",
  "hint": "N4 essencial · comunicação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "送"
  ],
  "jlpt": "N4",
  "group": "comunicação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ソウ",
  "kunyomi": "おく",
  "strokes": "9",
  "examples": [
    {
      "jp": "送る",
      "romaji": "okuru",
      "pt": "enviar"
    },
    {
      "jp": "放送",
      "romaji": "housou",
      "pt": "transmissão"
    },
    {
      "jp": "郵送",
      "romaji": "yuusou",
      "pt": "envio por correio"
    }
  ]
},
{
  "id": "j_n4_36_501f_1",
  "category": "kanji",
  "focus": "借",
  "jp": "借",
  "romaji": "シャク",
  "pt": "pegar emprestado",
  "type": "kanji",
  "hint": "N4 essencial · moradia e serviços. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "借"
  ],
  "jlpt": "N4",
  "group": "moradia e serviços",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シャク",
  "kunyomi": "か",
  "strokes": "10",
  "examples": [
    {
      "jp": "借りる",
      "romaji": "kariru",
      "pt": "pegar emprestado"
    },
    {
      "jp": "借金",
      "romaji": "shakkin",
      "pt": "dívida"
    },
    {
      "jp": "賃貸",
      "romaji": "chintai",
      "pt": "aluguel"
    }
  ]
},
{
  "id": "j_n4_36_8cb8_1",
  "category": "kanji",
  "focus": "貸",
  "jp": "貸",
  "romaji": "タイ",
  "pt": "emprestar / alugar",
  "type": "kanji",
  "hint": "N4 essencial · moradia e serviços. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "貸"
  ],
  "jlpt": "N4",
  "group": "moradia e serviços",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "タイ",
  "kunyomi": "か",
  "strokes": "12",
  "examples": [
    {
      "jp": "貸す",
      "romaji": "kasu",
      "pt": "emprestar"
    },
    {
      "jp": "貸家",
      "romaji": "kashiya",
      "pt": "casa para aluguel"
    },
    {
      "jp": "賃貸",
      "romaji": "chintai",
      "pt": "aluguel"
    }
  ]
},
{
  "id": "j_n4_36_5efa_1",
  "category": "kanji",
  "focus": "建",
  "jp": "建",
  "romaji": "ケン",
  "pt": "construir",
  "type": "kanji",
  "hint": "N4 essencial · moradia e cidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "建"
  ],
  "jlpt": "N4",
  "group": "moradia e cidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ケン",
  "kunyomi": "た",
  "strokes": "9",
  "examples": [
    {
      "jp": "建物",
      "romaji": "tatemono",
      "pt": "prédio"
    },
    {
      "jp": "建てる",
      "romaji": "tateru",
      "pt": "construir"
    },
    {
      "jp": "建設",
      "romaji": "kensetsu",
      "pt": "construção"
    }
  ]
},
{
  "id": "j_n4_36_7269_1",
  "category": "kanji",
  "focus": "物",
  "jp": "物",
  "romaji": "ブツ, モツ",
  "pt": "coisa / objeto",
  "type": "kanji",
  "hint": "N4 essencial · vida diária. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "物"
  ],
  "jlpt": "N4",
  "group": "vida diária",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ブツ, モツ",
  "kunyomi": "もの",
  "strokes": "8",
  "examples": [
    {
      "jp": "物",
      "romaji": "mono",
      "pt": "coisa"
    },
    {
      "jp": "買い物",
      "romaji": "kaimono",
      "pt": "compras"
    },
    {
      "jp": "荷物",
      "romaji": "nimotsu",
      "pt": "bagagem"
    }
  ]
},
{
  "id": "j_n4_36_54c1_1",
  "category": "kanji",
  "focus": "品",
  "jp": "品",
  "romaji": "ヒン",
  "pt": "produto",
  "type": "kanji",
  "hint": "N4 essencial · vida diária. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "品"
  ],
  "jlpt": "N4",
  "group": "vida diária",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ヒン",
  "kunyomi": "しな",
  "strokes": "9",
  "examples": [
    {
      "jp": "商品",
      "romaji": "shouhin",
      "pt": "produto"
    },
    {
      "jp": "部品",
      "romaji": "buhin",
      "pt": "peça"
    },
    {
      "jp": "品質",
      "romaji": "hinshitsu",
      "pt": "qualidade"
    }
  ]
},
{
  "id": "j_n4_36_8cea_1",
  "category": "kanji",
  "focus": "質",
  "jp": "質",
  "romaji": "シツ",
  "pt": "qualidade / pergunta",
  "type": "kanji",
  "hint": "N4 essencial · vida diária. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "質"
  ],
  "jlpt": "N4",
  "group": "vida diária",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シツ",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "質問",
      "romaji": "shitsumon",
      "pt": "pergunta"
    },
    {
      "jp": "品質",
      "romaji": "hinshitsu",
      "pt": "qualidade"
    },
    {
      "jp": "性質",
      "romaji": "seishitsu",
      "pt": "característica"
    }
  ]
},
{
  "id": "j_n4_36_4f4e_1",
  "category": "kanji",
  "focus": "低",
  "jp": "低",
  "romaji": "テイ",
  "pt": "baixo",
  "type": "kanji",
  "hint": "N4 essencial · descrições. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "低"
  ],
  "jlpt": "N4",
  "group": "descrições",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "テイ",
  "kunyomi": "ひく",
  "strokes": "7",
  "examples": [
    {
      "jp": "低い",
      "romaji": "hikui",
      "pt": "baixo"
    },
    {
      "jp": "低下",
      "romaji": "teika",
      "pt": "queda"
    },
    {
      "jp": "最低",
      "romaji": "saitei",
      "pt": "mínimo / pior"
    }
  ]
},
{
  "id": "j_n3_36_6e08_1",
  "category": "kanji",
  "focus": "済",
  "jp": "済",
  "romaji": "サイ",
  "pt": "resolver / economia",
  "type": "kanji",
  "hint": "N3 essencial · sociedade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "済"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "サイ",
  "kunyomi": "す",
  "strokes": "11",
  "examples": [
    {
      "jp": "経済",
      "romaji": "keizai",
      "pt": "economia"
    },
    {
      "jp": "済む",
      "romaji": "sumu",
      "pt": "terminar"
    },
    {
      "jp": "返済",
      "romaji": "hensai",
      "pt": "pagamento de dívida"
    }
  ]
},
{
  "id": "j_n3_36_653f_1",
  "category": "kanji",
  "focus": "政",
  "jp": "政",
  "romaji": "セイ",
  "pt": "política",
  "type": "kanji",
  "hint": "N3 essencial · sociedade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "政"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セイ",
  "kunyomi": "まつりごと",
  "strokes": "9",
  "examples": [
    {
      "jp": "政治",
      "romaji": "seiji",
      "pt": "política"
    },
    {
      "jp": "政府",
      "romaji": "seifu",
      "pt": "governo"
    },
    {
      "jp": "行政",
      "romaji": "gyousei",
      "pt": "administração pública"
    }
  ]
},
{
  "id": "j_n3_36_6cbb_1",
  "category": "kanji",
  "focus": "治",
  "jp": "治",
  "romaji": "チ, ジ",
  "pt": "governar / curar",
  "type": "kanji",
  "hint": "N3 essencial · sociedade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "治"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "チ, ジ",
  "kunyomi": "なお, おさ",
  "strokes": "8",
  "examples": [
    {
      "jp": "政治",
      "romaji": "seiji",
      "pt": "política"
    },
    {
      "jp": "治る",
      "romaji": "naoru",
      "pt": "curar"
    },
    {
      "jp": "治療",
      "romaji": "chiryou",
      "pt": "tratamento"
    }
  ]
},
{
  "id": "j_n3_36_6cd5_1",
  "category": "kanji",
  "focus": "法",
  "jp": "法",
  "romaji": "ホウ",
  "pt": "lei / método",
  "type": "kanji",
  "hint": "N3 essencial · sociedade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "法"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ホウ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "法律",
      "romaji": "houritsu",
      "pt": "lei"
    },
    {
      "jp": "方法",
      "romaji": "houhou",
      "pt": "método"
    },
    {
      "jp": "文法",
      "romaji": "bunpou",
      "pt": "gramática"
    }
  ]
},
{
  "id": "j_n3_36_5f8b_1",
  "category": "kanji",
  "focus": "律",
  "jp": "律",
  "romaji": "リツ",
  "pt": "lei / disciplina",
  "type": "kanji",
  "hint": "N3 essencial · sociedade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "律"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "リツ",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "法律",
      "romaji": "houritsu",
      "pt": "lei"
    },
    {
      "jp": "規律",
      "romaji": "kiritsu",
      "pt": "disciplina"
    },
    {
      "jp": "自律",
      "romaji": "jiritsu",
      "pt": "autonomia"
    }
  ]
},
{
  "id": "j_n3_36_6c42_1",
  "category": "kanji",
  "focus": "求",
  "jp": "求",
  "romaji": "キュウ",
  "pt": "pedir / buscar",
  "type": "kanji",
  "hint": "N3 essencial · trabalho e serviços. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "求"
  ],
  "jlpt": "N3",
  "group": "trabalho e serviços",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キュウ",
  "kunyomi": "もと",
  "strokes": "7",
  "examples": [
    {
      "jp": "請求",
      "romaji": "seikyuu",
      "pt": "cobrança"
    },
    {
      "jp": "求人",
      "romaji": "kyuujin",
      "pt": "vaga de emprego"
    },
    {
      "jp": "求める",
      "romaji": "motomeru",
      "pt": "buscar"
    }
  ]
},
{
  "id": "j_n3_36_8981_1",
  "category": "kanji",
  "focus": "要",
  "jp": "要",
  "romaji": "ヨウ",
  "pt": "necessário / ponto principal",
  "type": "kanji",
  "hint": "N3 essencial · trabalho e serviços. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "要"
  ],
  "jlpt": "N3",
  "group": "trabalho e serviços",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ヨウ",
  "kunyomi": "い",
  "strokes": "9",
  "examples": [
    {
      "jp": "必要",
      "romaji": "hitsuyou",
      "pt": "necessário"
    },
    {
      "jp": "重要",
      "romaji": "juuyou",
      "pt": "importante"
    },
    {
      "jp": "要る",
      "romaji": "iru",
      "pt": "precisar"
    }
  ]
},
{
  "id": "j_n3_36_5fc5_1",
  "category": "kanji",
  "focus": "必",
  "jp": "必",
  "romaji": "ヒツ",
  "pt": "necessário / sem falta",
  "type": "kanji",
  "hint": "N3 essencial · trabalho e serviços. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "必"
  ],
  "jlpt": "N3",
  "group": "trabalho e serviços",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ヒツ",
  "kunyomi": "かなら",
  "strokes": "5",
  "examples": [
    {
      "jp": "必要",
      "romaji": "hitsuyou",
      "pt": "necessário"
    },
    {
      "jp": "必ず",
      "romaji": "kanarazu",
      "pt": "sem falta"
    },
    {
      "jp": "必死",
      "romaji": "hisshi",
      "pt": "desesperado"
    }
  ]
},
{
  "id": "j_n3_36_6025_1",
  "category": "kanji",
  "focus": "急",
  "jp": "急",
  "romaji": "キュウ",
  "pt": "urgente",
  "type": "kanji",
  "hint": "N3 essencial · emergência. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "急"
  ],
  "jlpt": "N3",
  "group": "emergência",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キュウ",
  "kunyomi": "いそ",
  "strokes": "9",
  "examples": [
    {
      "jp": "急に",
      "romaji": "kyuu ni",
      "pt": "de repente"
    },
    {
      "jp": "急病",
      "romaji": "kyuubyou",
      "pt": "doença repentina"
    },
    {
      "jp": "急行",
      "romaji": "kyuukou",
      "pt": "expresso"
    }
  ]
},
{
  "id": "j_n3_36_5371_1",
  "category": "kanji",
  "focus": "危",
  "jp": "危",
  "romaji": "キ",
  "pt": "perigo",
  "type": "kanji",
  "hint": "N3 essencial · emergência. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "危"
  ],
  "jlpt": "N3",
  "group": "emergência",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キ",
  "kunyomi": "あぶ",
  "strokes": "6",
  "examples": [
    {
      "jp": "危ない",
      "romaji": "abunai",
      "pt": "perigoso"
    },
    {
      "jp": "危険",
      "romaji": "kiken",
      "pt": "perigo"
    },
    {
      "jp": "危機",
      "romaji": "kiki",
      "pt": "crise"
    }
  ]
},
{
  "id": "j_n3_36_967a_1",
  "category": "kanji",
  "focus": "険",
  "jp": "険",
  "romaji": "ケン",
  "pt": "risco / seguro",
  "type": "kanji",
  "hint": "N3 essencial · emergência. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "険"
  ],
  "jlpt": "N3",
  "group": "emergência",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ケン",
  "kunyomi": "けわ",
  "strokes": "11",
  "examples": [
    {
      "jp": "危険",
      "romaji": "kiken",
      "pt": "perigo"
    },
    {
      "jp": "保険",
      "romaji": "hoken",
      "pt": "seguro"
    },
    {
      "jp": "冒険",
      "romaji": "bouken",
      "pt": "aventura"
    }
  ]
},
{
  "id": "j_n3_36_6545_1",
  "category": "kanji",
  "focus": "故",
  "jp": "故",
  "romaji": "コ",
  "pt": "causa / falha",
  "type": "kanji",
  "hint": "N3 essencial · emergência. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "故"
  ],
  "jlpt": "N3",
  "group": "emergência",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "コ",
  "kunyomi": "ゆえ",
  "strokes": "9",
  "examples": [
    {
      "jp": "事故",
      "romaji": "jiko",
      "pt": "acidente"
    },
    {
      "jp": "故障",
      "romaji": "koshou",
      "pt": "defeito"
    },
    {
      "jp": "故郷",
      "romaji": "furusato",
      "pt": "terra natal"
    }
  ]
},
{
  "id": "j_n3_36_969c_1",
  "category": "kanji",
  "focus": "障",
  "jp": "障",
  "romaji": "ショウ",
  "pt": "obstrução / problema",
  "type": "kanji",
  "hint": "N3 essencial · emergência. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "障"
  ],
  "jlpt": "N3",
  "group": "emergência",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ショウ",
  "kunyomi": "さわ",
  "strokes": "14",
  "examples": [
    {
      "jp": "故障",
      "romaji": "koshou",
      "pt": "defeito"
    },
    {
      "jp": "障害",
      "romaji": "shougai",
      "pt": "obstáculo/deficiência"
    },
    {
      "jp": "支障",
      "romaji": "shishou",
      "pt": "impedimento"
    }
  ]
},
{
  "id": "j_n3_36_5bb3_1",
  "category": "kanji",
  "focus": "害",
  "jp": "害",
  "romaji": "ガイ",
  "pt": "dano",
  "type": "kanji",
  "hint": "N3 essencial · emergência. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "害"
  ],
  "jlpt": "N3",
  "group": "emergência",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ガイ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "障害",
      "romaji": "shougai",
      "pt": "obstáculo"
    },
    {
      "jp": "被害",
      "romaji": "higai",
      "pt": "dano sofrido"
    },
    {
      "jp": "害",
      "romaji": "gai",
      "pt": "dano"
    }
  ]
},
{
  "id": "j_n3_36_88ab_1",
  "category": "kanji",
  "focus": "被",
  "jp": "被",
  "romaji": "ヒ",
  "pt": "sofrer / cobrir",
  "type": "kanji",
  "hint": "N3 essencial · emergência. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "被"
  ],
  "jlpt": "N3",
  "group": "emergência",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ヒ",
  "kunyomi": "こうむ",
  "strokes": "10",
  "examples": [
    {
      "jp": "被害",
      "romaji": "higai",
      "pt": "dano sofrido"
    },
    {
      "jp": "被る",
      "romaji": "koumuru",
      "pt": "sofrer"
    },
    {
      "jp": "被保険者",
      "romaji": "hihokensha",
      "pt": "segurado"
    }
  ]
},
{
  "id": "j_n3_36_7d66_1",
  "category": "kanji",
  "focus": "給",
  "jp": "給",
  "romaji": "キュウ",
  "pt": "salário / fornecer",
  "type": "kanji",
  "hint": "N3 essencial · trabalho. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "給"
  ],
  "jlpt": "N3",
  "group": "trabalho",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キュウ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "給料",
      "romaji": "kyuuryou",
      "pt": "salário"
    },
    {
      "jp": "時給",
      "romaji": "jikyuu",
      "pt": "salário por hora"
    },
    {
      "jp": "支給",
      "romaji": "shikyuu",
      "pt": "fornecimento"
    }
  ]
},
{
  "id": "j_n3_36_52e4_1",
  "category": "kanji",
  "focus": "勤",
  "jp": "勤",
  "romaji": "キン",
  "pt": "trabalho / serviço",
  "type": "kanji",
  "hint": "N3 essencial · trabalho. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "勤"
  ],
  "jlpt": "N3",
  "group": "trabalho",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キン",
  "kunyomi": "つと",
  "strokes": "12",
  "examples": [
    {
      "jp": "勤務",
      "romaji": "kinmu",
      "pt": "serviço/turno"
    },
    {
      "jp": "通勤",
      "romaji": "tsuukin",
      "pt": "ir ao trabalho"
    },
    {
      "jp": "勤める",
      "romaji": "tsutomeru",
      "pt": "trabalhar em"
    }
  ]
},
{
  "id": "j_n3_36_52d9_1",
  "category": "kanji",
  "focus": "務",
  "jp": "務",
  "romaji": "ム",
  "pt": "dever / serviço",
  "type": "kanji",
  "hint": "N3 essencial · trabalho. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "務"
  ],
  "jlpt": "N3",
  "group": "trabalho",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ム",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "勤務",
      "romaji": "kinmu",
      "pt": "serviço"
    },
    {
      "jp": "事務",
      "romaji": "jimu",
      "pt": "escritório"
    },
    {
      "jp": "義務",
      "romaji": "gimu",
      "pt": "obrigação"
    }
  ]
},
{
  "id": "j_n3_36_80fd_1",
  "category": "kanji",
  "focus": "能",
  "jp": "能",
  "romaji": "ノウ",
  "pt": "capacidade",
  "type": "kanji",
  "hint": "N3 essencial · habilidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "能"
  ],
  "jlpt": "N3",
  "group": "habilidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ノウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "能力",
      "romaji": "nouryoku",
      "pt": "capacidade"
    },
    {
      "jp": "可能",
      "romaji": "kanou",
      "pt": "possível"
    },
    {
      "jp": "機能",
      "romaji": "kinou",
      "pt": "função"
    }
  ]
},
{
  "id": "j_n3_36_6280_1",
  "category": "kanji",
  "focus": "技",
  "jp": "技",
  "romaji": "ギ",
  "pt": "técnica",
  "type": "kanji",
  "hint": "N3 essencial · habilidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "技"
  ],
  "jlpt": "N3",
  "group": "habilidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ギ",
  "kunyomi": "わざ",
  "strokes": "7",
  "examples": [
    {
      "jp": "技術",
      "romaji": "gijutsu",
      "pt": "técnica"
    },
    {
      "jp": "技能",
      "romaji": "ginou",
      "pt": "habilidade técnica"
    },
    {
      "jp": "技",
      "romaji": "waza",
      "pt": "técnica"
    }
  ]
},
{
  "id": "j_n3_36_8853_1",
  "category": "kanji",
  "focus": "術",
  "jp": "術",
  "romaji": "ジュツ",
  "pt": "arte / técnica",
  "type": "kanji",
  "hint": "N3 essencial · habilidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "術"
  ],
  "jlpt": "N3",
  "group": "habilidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ジュツ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "技術",
      "romaji": "gijutsu",
      "pt": "técnica"
    },
    {
      "jp": "手術",
      "romaji": "shujutsu",
      "pt": "cirurgia"
    },
    {
      "jp": "美術",
      "romaji": "bijutsu",
      "pt": "arte"
    }
  ]
},
{
  "id": "j_n3_36_8b58_1",
  "category": "kanji",
  "focus": "識",
  "jp": "識",
  "romaji": "シキ",
  "pt": "conhecimento",
  "type": "kanji",
  "hint": "N3 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "識"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シキ",
  "kunyomi": "",
  "strokes": "19",
  "examples": [
    {
      "jp": "知識",
      "romaji": "chishiki",
      "pt": "conhecimento"
    },
    {
      "jp": "意識",
      "romaji": "ishiki",
      "pt": "consciência"
    },
    {
      "jp": "常識",
      "romaji": "joushiki",
      "pt": "senso comum"
    }
  ]
},
{
  "id": "j_n3_36_899a_1",
  "category": "kanji",
  "focus": "覚",
  "jp": "覚",
  "romaji": "カク",
  "pt": "memorizar / acordar",
  "type": "kanji",
  "hint": "N3 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "覚"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "カク",
  "kunyomi": "おぼ, さ",
  "strokes": "12",
  "examples": [
    {
      "jp": "覚える",
      "romaji": "oboeru",
      "pt": "memorizar"
    },
    {
      "jp": "目覚める",
      "romaji": "mezameru",
      "pt": "acordar"
    },
    {
      "jp": "感覚",
      "romaji": "kankaku",
      "pt": "sensação"
    }
  ]
},
{
  "id": "j_n3_36_5fd8_1",
  "category": "kanji",
  "focus": "忘",
  "jp": "忘",
  "romaji": "ボウ",
  "pt": "esquecer",
  "type": "kanji",
  "hint": "N3 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "忘"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ボウ",
  "kunyomi": "わす",
  "strokes": "7",
  "examples": [
    {
      "jp": "忘れる",
      "romaji": "wasureru",
      "pt": "esquecer"
    },
    {
      "jp": "忘れ物",
      "romaji": "wasuremono",
      "pt": "objeto esquecido"
    },
    {
      "jp": "忘年会",
      "romaji": "bounenkai",
      "pt": "festa de fim de ano"
    }
  ]
},
{
  "id": "j_n2_36_898f_1",
  "category": "kanji",
  "focus": "規",
  "jp": "規",
  "romaji": "キ",
  "pt": "norma",
  "type": "kanji",
  "hint": "N2 essencial · documentos e regras. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "規"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "規則",
      "romaji": "kisoku",
      "pt": "regra"
    },
    {
      "jp": "規定",
      "romaji": "kitei",
      "pt": "regulamento"
    },
    {
      "jp": "規模",
      "romaji": "kibo",
      "pt": "escala"
    }
  ]
},
{
  "id": "j_n2_36_5247_1",
  "category": "kanji",
  "focus": "則",
  "jp": "則",
  "romaji": "ソク",
  "pt": "regra",
  "type": "kanji",
  "hint": "N2 essencial · documentos e regras. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "則"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ソク",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "規則",
      "romaji": "kisoku",
      "pt": "regra"
    },
    {
      "jp": "原則",
      "romaji": "gensoku",
      "pt": "princípio"
    },
    {
      "jp": "法則",
      "romaji": "housoku",
      "pt": "lei/regra"
    }
  ]
},
{
  "id": "j_n2_36_57fa_1",
  "category": "kanji",
  "focus": "基",
  "jp": "基",
  "romaji": "キ",
  "pt": "base",
  "type": "kanji",
  "hint": "N2 essencial · documentos e regras. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "基"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キ",
  "kunyomi": "もと",
  "strokes": "11",
  "examples": [
    {
      "jp": "基本",
      "romaji": "kihon",
      "pt": "base"
    },
    {
      "jp": "基準",
      "romaji": "kijun",
      "pt": "critério"
    },
    {
      "jp": "基地",
      "romaji": "kichi",
      "pt": "base"
    }
  ]
},
{
  "id": "j_n2_36_6e96_1",
  "category": "kanji",
  "focus": "準",
  "jp": "準",
  "romaji": "ジュン",
  "pt": "padrão",
  "type": "kanji",
  "hint": "N2 essencial · documentos e regras. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "準"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ジュン",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "基準",
      "romaji": "kijun",
      "pt": "critério"
    },
    {
      "jp": "準備",
      "romaji": "junbi",
      "pt": "preparação"
    },
    {
      "jp": "標準",
      "romaji": "hyoujun",
      "pt": "padrão"
    }
  ]
},
{
  "id": "j_n2_36_6a19_1",
  "category": "kanji",
  "focus": "標",
  "jp": "標",
  "romaji": "ヒョウ",
  "pt": "marco / objetivo",
  "type": "kanji",
  "hint": "N2 essencial · documentos e regras. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "標"
  ],
  "jlpt": "N2",
  "group": "documentos e regras",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ヒョウ",
  "kunyomi": "しるべ",
  "strokes": "15",
  "examples": [
    {
      "jp": "目標",
      "romaji": "mokuhyou",
      "pt": "meta"
    },
    {
      "jp": "標準",
      "romaji": "hyoujun",
      "pt": "padrão"
    },
    {
      "jp": "標識",
      "romaji": "hyoushiki",
      "pt": "sinalização"
    }
  ]
},
{
  "id": "j_n2_36_8a31_1",
  "category": "kanji",
  "focus": "許",
  "jp": "許",
  "romaji": "キョ",
  "pt": "permitir",
  "type": "kanji",
  "hint": "N2 essencial · lei e permissão. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "許"
  ],
  "jlpt": "N2",
  "group": "lei e permissão",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キョ",
  "kunyomi": "ゆる",
  "strokes": "11",
  "examples": [
    {
      "jp": "許可",
      "romaji": "kyoka",
      "pt": "permissão"
    },
    {
      "jp": "許す",
      "romaji": "yurusu",
      "pt": "permitir/perdoar"
    },
    {
      "jp": "免許",
      "romaji": "menkyo",
      "pt": "licença"
    }
  ]
},
{
  "id": "j_n2_36_53ef_1",
  "category": "kanji",
  "focus": "可",
  "jp": "可",
  "romaji": "カ",
  "pt": "possível / permitido",
  "type": "kanji",
  "hint": "N2 essencial · lei e permissão. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "可"
  ],
  "jlpt": "N2",
  "group": "lei e permissão",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "カ",
  "kunyomi": "",
  "strokes": "5",
  "examples": [
    {
      "jp": "可能",
      "romaji": "kanou",
      "pt": "possível"
    },
    {
      "jp": "許可",
      "romaji": "kyoka",
      "pt": "permissão"
    },
    {
      "jp": "可愛い",
      "romaji": "kawaii",
      "pt": "fofo"
    }
  ]
},
{
  "id": "j_n2_36_7981_1",
  "category": "kanji",
  "focus": "禁",
  "jp": "禁",
  "romaji": "キン",
  "pt": "proibir",
  "type": "kanji",
  "hint": "N2 essencial · lei e permissão. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "禁"
  ],
  "jlpt": "N2",
  "group": "lei e permissão",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キン",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "禁止",
      "romaji": "kinshi",
      "pt": "proibido"
    },
    {
      "jp": "禁煙",
      "romaji": "kinen",
      "pt": "proibido fumar"
    },
    {
      "jp": "禁じる",
      "romaji": "kinjiru",
      "pt": "proibir"
    }
  ]
},
{
  "id": "j_n2_36_7f6a_1",
  "category": "kanji",
  "focus": "罪",
  "jp": "罪",
  "romaji": "ザイ",
  "pt": "crime / culpa",
  "type": "kanji",
  "hint": "N2 essencial · lei e permissão. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "罪"
  ],
  "jlpt": "N2",
  "group": "lei e permissão",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ザイ",
  "kunyomi": "つみ",
  "strokes": "13",
  "examples": [
    {
      "jp": "犯罪",
      "romaji": "hanzai",
      "pt": "crime"
    },
    {
      "jp": "罪",
      "romaji": "tsumi",
      "pt": "culpa/crime"
    },
    {
      "jp": "謝罪",
      "romaji": "shazai",
      "pt": "pedido de desculpas"
    }
  ]
},
{
  "id": "j_n2_36_72af_1",
  "category": "kanji",
  "focus": "犯",
  "jp": "犯",
  "romaji": "ハン",
  "pt": "crime / violar",
  "type": "kanji",
  "hint": "N2 essencial · lei e permissão. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "犯"
  ],
  "jlpt": "N2",
  "group": "lei e permissão",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ハン",
  "kunyomi": "おか",
  "strokes": "5",
  "examples": [
    {
      "jp": "犯罪",
      "romaji": "hanzai",
      "pt": "crime"
    },
    {
      "jp": "犯す",
      "romaji": "okasu",
      "pt": "cometer crime"
    },
    {
      "jp": "犯人",
      "romaji": "hannin",
      "pt": "criminoso"
    }
  ]
},
{
  "id": "j_n2_36_5224_1",
  "category": "kanji",
  "focus": "判",
  "jp": "判",
  "romaji": "ハン",
  "pt": "julgar / carimbo",
  "type": "kanji",
  "hint": "N2 essencial · lei e avaliação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "判"
  ],
  "jlpt": "N2",
  "group": "lei e avaliação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ハン",
  "kunyomi": "わか",
  "strokes": "7",
  "examples": [
    {
      "jp": "判断",
      "romaji": "handan",
      "pt": "julgamento"
    },
    {
      "jp": "評判",
      "romaji": "hyouban",
      "pt": "reputação"
    },
    {
      "jp": "判子",
      "romaji": "hanko",
      "pt": "carimbo"
    }
  ]
},
{
  "id": "j_n2_36_65ad_1",
  "category": "kanji",
  "focus": "断",
  "jp": "断",
  "romaji": "ダン",
  "pt": "decidir / cortar",
  "type": "kanji",
  "hint": "N2 essencial · lei e avaliação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "断"
  ],
  "jlpt": "N2",
  "group": "lei e avaliação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ダン",
  "kunyomi": "た, ことわ",
  "strokes": "11",
  "examples": [
    {
      "jp": "判断",
      "romaji": "handan",
      "pt": "julgamento"
    },
    {
      "jp": "断る",
      "romaji": "kotowaru",
      "pt": "recusar"
    },
    {
      "jp": "中断",
      "romaji": "chuudan",
      "pt": "interrupção"
    }
  ]
},
{
  "id": "j_n2_36_8cac_1",
  "category": "kanji",
  "focus": "責",
  "jp": "責",
  "romaji": "セキ",
  "pt": "responsabilidade",
  "type": "kanji",
  "hint": "N2 essencial · lei e trabalho. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "責"
  ],
  "jlpt": "N2",
  "group": "lei e trabalho",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "セキ",
  "kunyomi": "せ",
  "strokes": "11",
  "examples": [
    {
      "jp": "責任",
      "romaji": "sekinin",
      "pt": "responsabilidade"
    },
    {
      "jp": "責める",
      "romaji": "semeru",
      "pt": "culpar"
    },
    {
      "jp": "無責任",
      "romaji": "musekinin",
      "pt": "irresponsável"
    }
  ]
},
{
  "id": "j_n2_36_4efb_1",
  "category": "kanji",
  "focus": "任",
  "jp": "任",
  "romaji": "ニン",
  "pt": "confiar função",
  "type": "kanji",
  "hint": "N2 essencial · lei e trabalho. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "任"
  ],
  "jlpt": "N2",
  "group": "lei e trabalho",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ニン",
  "kunyomi": "まか",
  "strokes": "6",
  "examples": [
    {
      "jp": "責任",
      "romaji": "sekinin",
      "pt": "responsabilidade"
    },
    {
      "jp": "任せる",
      "romaji": "makaseru",
      "pt": "confiar"
    },
    {
      "jp": "任務",
      "romaji": "ninmu",
      "pt": "tarefa"
    }
  ]
},
{
  "id": "j_n2_36_6a29_1",
  "category": "kanji",
  "focus": "権",
  "jp": "権",
  "romaji": "ケン",
  "pt": "direito / autoridade",
  "type": "kanji",
  "hint": "N2 essencial · lei e trabalho. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "権"
  ],
  "jlpt": "N2",
  "group": "lei e trabalho",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ケン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "権利",
      "romaji": "kenri",
      "pt": "direito"
    },
    {
      "jp": "権限",
      "romaji": "kengen",
      "pt": "autoridade"
    },
    {
      "jp": "人権",
      "romaji": "jinken",
      "pt": "direitos humanos"
    }
  ]
},
{
  "id": "j_n2_36_5229_1",
  "category": "kanji",
  "focus": "利",
  "jp": "利",
  "romaji": "リ",
  "pt": "benefício",
  "type": "kanji",
  "hint": "N2 essencial · lei e trabalho. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "利"
  ],
  "jlpt": "N2",
  "group": "lei e trabalho",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "リ",
  "kunyomi": "き",
  "strokes": "7",
  "examples": [
    {
      "jp": "権利",
      "romaji": "kenri",
      "pt": "direito"
    },
    {
      "jp": "便利",
      "romaji": "benri",
      "pt": "conveniente"
    },
    {
      "jp": "利益",
      "romaji": "rieki",
      "pt": "lucro/benefício"
    }
  ]
},
{
  "id": "j_n2_36_76ca_1",
  "category": "kanji",
  "focus": "益",
  "jp": "益",
  "romaji": "エキ, ヤク",
  "pt": "benefício / lucro",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "益"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "エキ, ヤク",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "利益",
      "romaji": "rieki",
      "pt": "lucro"
    },
    {
      "jp": "有益",
      "romaji": "yuueki",
      "pt": "útil/benéfico"
    },
    {
      "jp": "収益",
      "romaji": "shuueki",
      "pt": "receita"
    }
  ]
},
{
  "id": "j_n2_36_640d_1",
  "category": "kanji",
  "focus": "損",
  "jp": "損",
  "romaji": "ソン",
  "pt": "perda / dano",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "損"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ソン",
  "kunyomi": "そこ",
  "strokes": "13",
  "examples": [
    {
      "jp": "損",
      "romaji": "son",
      "pt": "perda"
    },
    {
      "jp": "損害",
      "romaji": "songai",
      "pt": "dano"
    },
    {
      "jp": "損する",
      "romaji": "son suru",
      "pt": "ter prejuízo"
    }
  ]
},
{
  "id": "j_n2_36_53ce_1",
  "category": "kanji",
  "focus": "収",
  "jp": "収",
  "romaji": "シュウ",
  "pt": "receber / recolher",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "収"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シュウ",
  "kunyomi": "おさ",
  "strokes": "4",
  "examples": [
    {
      "jp": "収入",
      "romaji": "shuunyuu",
      "pt": "renda"
    },
    {
      "jp": "収集",
      "romaji": "shuushuu",
      "pt": "coleta"
    },
    {
      "jp": "回収",
      "romaji": "kaishuu",
      "pt": "recolhimento"
    }
  ]
},
{
  "id": "j_n2_36_652f_1",
  "category": "kanji",
  "focus": "支",
  "jp": "支",
  "romaji": "シ",
  "pt": "apoio / pagamento",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "支"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シ",
  "kunyomi": "ささ",
  "strokes": "4",
  "examples": [
    {
      "jp": "支払い",
      "romaji": "shiharai",
      "pt": "pagamento"
    },
    {
      "jp": "支店",
      "romaji": "shiten",
      "pt": "filial"
    },
    {
      "jp": "支える",
      "romaji": "sasaeru",
      "pt": "apoiar"
    }
  ]
},
{
  "id": "j_n2_36_6255_1",
  "category": "kanji",
  "focus": "払",
  "jp": "払",
  "romaji": "フツ",
  "pt": "pagar",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "払"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "フツ",
  "kunyomi": "はら",
  "strokes": "5",
  "examples": [
    {
      "jp": "払う",
      "romaji": "harau",
      "pt": "pagar"
    },
    {
      "jp": "支払い",
      "romaji": "shiharai",
      "pt": "pagamento"
    },
    {
      "jp": "前払い",
      "romaji": "maebarai",
      "pt": "pagamento adiantado"
    }
  ]
},
{
  "id": "j_n2_36_7a0e_1",
  "category": "kanji",
  "focus": "税",
  "jp": "税",
  "romaji": "ゼイ",
  "pt": "imposto",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "税"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ゼイ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "税金",
      "romaji": "zeikin",
      "pt": "imposto"
    },
    {
      "jp": "消費税",
      "romaji": "shouhizei",
      "pt": "imposto de consumo"
    },
    {
      "jp": "免税",
      "romaji": "menzei",
      "pt": "isento de imposto"
    }
  ]
},
{
  "id": "j_n2_36_8cbb_1",
  "category": "kanji",
  "focus": "費",
  "jp": "費",
  "romaji": "ヒ",
  "pt": "despesa",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "費"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ヒ",
  "kunyomi": "つい",
  "strokes": "12",
  "examples": [
    {
      "jp": "生活費",
      "romaji": "seikatsuhi",
      "pt": "custo de vida"
    },
    {
      "jp": "交通費",
      "romaji": "koutsuuhi",
      "pt": "gasto transporte"
    },
    {
      "jp": "費用",
      "romaji": "hiyou",
      "pt": "custo"
    }
  ]
},
{
  "id": "j_n2_36_8cc7_1",
  "category": "kanji",
  "focus": "資",
  "jp": "資",
  "romaji": "シ",
  "pt": "recurso / capital",
  "type": "kanji",
  "hint": "N2 essencial · economia. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "資"
  ],
  "jlpt": "N2",
  "group": "economia",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "資料",
      "romaji": "shiryou",
      "pt": "material/dados"
    },
    {
      "jp": "資金",
      "romaji": "shikin",
      "pt": "fundos"
    },
    {
      "jp": "資格",
      "romaji": "shikaku",
      "pt": "qualificação"
    }
  ]
},
{
  "id": "j_n2_36_683c_1",
  "category": "kanji",
  "focus": "格",
  "jp": "格",
  "romaji": "カク",
  "pt": "padrão / status",
  "type": "kanji",
  "hint": "N2 essencial · avaliação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "格"
  ],
  "jlpt": "N2",
  "group": "avaliação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "カク",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "価格",
      "romaji": "kakaku",
      "pt": "preço"
    },
    {
      "jp": "資格",
      "romaji": "shikaku",
      "pt": "qualificação"
    },
    {
      "jp": "性格",
      "romaji": "seikaku",
      "pt": "personalidade"
    }
  ]
},
{
  "id": "j_n1_36_616e_1",
  "category": "kanji",
  "focus": "慮",
  "jp": "慮",
  "romaji": "リョ",
  "pt": "consideração",
  "type": "kanji",
  "hint": "N1 essencial · leitura densa. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "慮"
  ],
  "jlpt": "N1",
  "group": "leitura densa",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "リョ",
  "kunyomi": "おもんぱか",
  "strokes": "15",
  "examples": [
    {
      "jp": "遠慮",
      "romaji": "enryo",
      "pt": "cerimônia/hesitação"
    },
    {
      "jp": "考慮",
      "romaji": "kouryo",
      "pt": "consideração"
    },
    {
      "jp": "配慮",
      "romaji": "hairyo",
      "pt": "consideração"
    }
  ]
},
{
  "id": "j_n1_36_61f8_1",
  "category": "kanji",
  "focus": "懸",
  "jp": "懸",
  "romaji": "ケン, ケ",
  "pt": "suspenso / preocupação",
  "type": "kanji",
  "hint": "N1 essencial · leitura densa. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "懸"
  ],
  "jlpt": "N1",
  "group": "leitura densa",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ケン, ケ",
  "kunyomi": "か",
  "strokes": "20",
  "examples": [
    {
      "jp": "懸念",
      "romaji": "kenen",
      "pt": "preocupação"
    },
    {
      "jp": "一生懸命",
      "romaji": "isshoukenmei",
      "pt": "com empenho"
    },
    {
      "jp": "懸命",
      "romaji": "kenmei",
      "pt": "esforçado"
    }
  ]
},
{
  "id": "j_n1_36_5ff5_1",
  "category": "kanji",
  "focus": "念",
  "jp": "念",
  "romaji": "ネン",
  "pt": "pensamento",
  "type": "kanji",
  "hint": "N1 essencial · leitura densa. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "念"
  ],
  "jlpt": "N1",
  "group": "leitura densa",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ネン",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "概念",
      "romaji": "gainen",
      "pt": "conceito"
    },
    {
      "jp": "残念",
      "romaji": "zannen",
      "pt": "lamentável"
    },
    {
      "jp": "記念",
      "romaji": "kinen",
      "pt": "comemoração"
    }
  ]
},
{
  "id": "j_n1_36_6982_1",
  "category": "kanji",
  "focus": "概",
  "jp": "概",
  "romaji": "ガイ",
  "pt": "conceito geral",
  "type": "kanji",
  "hint": "N1 essencial · leitura densa. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "概"
  ],
  "jlpt": "N1",
  "group": "leitura densa",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ガイ",
  "kunyomi": "おおむ",
  "strokes": "14",
  "examples": [
    {
      "jp": "概念",
      "romaji": "gainen",
      "pt": "conceito"
    },
    {
      "jp": "概要",
      "romaji": "gaiyou",
      "pt": "resumo"
    },
    {
      "jp": "大概",
      "romaji": "taigai",
      "pt": "em geral"
    }
  ]
},
{
  "id": "j_n1_36_8a73_1",
  "category": "kanji",
  "focus": "詳",
  "jp": "詳",
  "romaji": "ショウ",
  "pt": "detalhado",
  "type": "kanji",
  "hint": "N1 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "詳"
  ],
  "jlpt": "N1",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ショウ",
  "kunyomi": "くわ",
  "strokes": "13",
  "examples": [
    {
      "jp": "詳しい",
      "romaji": "kuwashii",
      "pt": "detalhado"
    },
    {
      "jp": "詳細",
      "romaji": "shousai",
      "pt": "detalhes"
    },
    {
      "jp": "詳しく",
      "romaji": "kuwashiku",
      "pt": "em detalhes"
    }
  ]
},
{
  "id": "j_n1_36_7d30_1",
  "category": "kanji",
  "focus": "細",
  "jp": "細",
  "romaji": "サイ",
  "pt": "fino / detalhado",
  "type": "kanji",
  "hint": "N1 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "細"
  ],
  "jlpt": "N1",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "サイ",
  "kunyomi": "ほそ, こま",
  "strokes": "11",
  "examples": [
    {
      "jp": "細かい",
      "romaji": "komakai",
      "pt": "detalhado"
    },
    {
      "jp": "詳細",
      "romaji": "shousai",
      "pt": "detalhes"
    },
    {
      "jp": "繊細",
      "romaji": "sensai",
      "pt": "delicado"
    }
  ]
},
{
  "id": "j_n1_36_7dfb_1",
  "category": "kanji",
  "focus": "緻",
  "jp": "緻",
  "romaji": "チ",
  "pt": "denso / fino",
  "type": "kanji",
  "hint": "N1 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "緻"
  ],
  "jlpt": "N1",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "チ",
  "kunyomi": "",
  "strokes": "16",
  "examples": [
    {
      "jp": "精緻",
      "romaji": "seichi",
      "pt": "preciso/elaborado"
    },
    {
      "jp": "緻密",
      "romaji": "chimitsu",
      "pt": "minucioso"
    },
    {
      "jp": "巧緻",
      "romaji": "kouchi",
      "pt": "habilidoso"
    }
  ]
},
{
  "id": "j_n1_36_5bc6_1",
  "category": "kanji",
  "focus": "密",
  "jp": "密",
  "romaji": "ミツ",
  "pt": "denso / secreto",
  "type": "kanji",
  "hint": "N1 essencial · interpretação. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "密"
  ],
  "jlpt": "N1",
  "group": "interpretação",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ミツ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "秘密",
      "romaji": "himitsu",
      "pt": "segredo"
    },
    {
      "jp": "密接",
      "romaji": "missetsu",
      "pt": "próximo/íntimo"
    },
    {
      "jp": "緻密",
      "romaji": "chimitsu",
      "pt": "minucioso"
    }
  ]
},
{
  "id": "j_n1_36_62bd_1",
  "category": "kanji",
  "focus": "抽",
  "jp": "抽",
  "romaji": "チュウ",
  "pt": "extrair",
  "type": "kanji",
  "hint": "N1 essencial · abstração. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "抽"
  ],
  "jlpt": "N1",
  "group": "abstração",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "チュウ",
  "kunyomi": "",
  "strokes": "8",
  "examples": [
    {
      "jp": "抽象",
      "romaji": "chuushou",
      "pt": "abstração"
    },
    {
      "jp": "抽選",
      "romaji": "chuusen",
      "pt": "sorteio"
    },
    {
      "jp": "抽出",
      "romaji": "chuushutsu",
      "pt": "extração"
    }
  ]
},
{
  "id": "j_n1_36_8c61_1",
  "category": "kanji",
  "focus": "象",
  "jp": "象",
  "romaji": "ショウ, ゾウ",
  "pt": "fenômeno / símbolo",
  "type": "kanji",
  "hint": "N1 essencial · abstração. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "象"
  ],
  "jlpt": "N1",
  "group": "abstração",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ショウ, ゾウ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "抽象",
      "romaji": "chuushou",
      "pt": "abstração"
    },
    {
      "jp": "現象",
      "romaji": "genshou",
      "pt": "fenômeno"
    },
    {
      "jp": "印象",
      "romaji": "inshou",
      "pt": "impressão"
    }
  ]
},
{
  "id": "j_n1_36_8b72_1",
  "category": "kanji",
  "focus": "譲",
  "jp": "譲",
  "romaji": "ジョウ",
  "pt": "ceder / transferir",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "譲"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ジョウ",
  "kunyomi": "ゆず",
  "strokes": "20",
  "examples": [
    {
      "jp": "譲る",
      "romaji": "yuzuru",
      "pt": "ceder"
    },
    {
      "jp": "譲渡",
      "romaji": "jouto",
      "pt": "transferência"
    },
    {
      "jp": "謙譲語",
      "romaji": "kenjougo",
      "pt": "linguagem humilde"
    }
  ]
},
{
  "id": "j_n1_36_8b19_1",
  "category": "kanji",
  "focus": "謙",
  "jp": "謙",
  "romaji": "ケン",
  "pt": "humilde",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "謙"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ケン",
  "kunyomi": "",
  "strokes": "17",
  "examples": [
    {
      "jp": "謙虚",
      "romaji": "kenkyo",
      "pt": "humilde"
    },
    {
      "jp": "謙譲語",
      "romaji": "kenjougo",
      "pt": "linguagem humilde"
    },
    {
      "jp": "謙遜",
      "romaji": "kenson",
      "pt": "modéstia"
    }
  ]
},
{
  "id": "j_n1_36_865a_1",
  "category": "kanji",
  "focus": "虚",
  "jp": "虚",
  "romaji": "キョ, コ",
  "pt": "vazio / falso",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "虚"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キョ, コ",
  "kunyomi": "むな",
  "strokes": "11",
  "examples": [
    {
      "jp": "謙虚",
      "romaji": "kenkyo",
      "pt": "humilde"
    },
    {
      "jp": "虚偽",
      "romaji": "kyogi",
      "pt": "falsidade"
    },
    {
      "jp": "空虚",
      "romaji": "kuukyo",
      "pt": "vazio"
    }
  ]
},
{
  "id": "j_n1_36_507d_1",
  "category": "kanji",
  "focus": "偽",
  "jp": "偽",
  "romaji": "ギ",
  "pt": "falso",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "偽"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ギ",
  "kunyomi": "いつわ, にせ",
  "strokes": "11",
  "examples": [
    {
      "jp": "虚偽",
      "romaji": "kyogi",
      "pt": "falsidade"
    },
    {
      "jp": "偽物",
      "romaji": "nisemono",
      "pt": "falsificação"
    },
    {
      "jp": "偽る",
      "romaji": "itsuwaru",
      "pt": "fingir"
    }
  ]
},
{
  "id": "j_n1_36_614e_1",
  "category": "kanji",
  "focus": "慎",
  "jp": "慎",
  "romaji": "シン",
  "pt": "cautela",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "慎"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "シン",
  "kunyomi": "つつし",
  "strokes": "13",
  "examples": [
    {
      "jp": "慎重",
      "romaji": "shinchou",
      "pt": "cauteloso"
    },
    {
      "jp": "慎む",
      "romaji": "tsutsushimu",
      "pt": "moderar-se"
    },
    {
      "jp": "不謹慎",
      "romaji": "fukinshin",
      "pt": "imprudente"
    }
  ]
},
{
  "id": "j_n1_36_8b39_1",
  "category": "kanji",
  "focus": "謹",
  "jp": "謹",
  "romaji": "キン",
  "pt": "respeitoso / cauteloso",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "謹"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キン",
  "kunyomi": "つつし",
  "strokes": "17",
  "examples": [
    {
      "jp": "謹慎",
      "romaji": "kinshin",
      "pt": "suspensão/reflexão"
    },
    {
      "jp": "謹賀新年",
      "romaji": "kinga shinnen",
      "pt": "feliz ano novo formal"
    },
    {
      "jp": "謹む",
      "romaji": "tsutsushimu",
      "pt": "respeitar/moderar"
    }
  ]
},
{
  "id": "j_n1_36_95b2_1",
  "category": "kanji",
  "focus": "閲",
  "jp": "閲",
  "romaji": "エツ",
  "pt": "inspecionar / revisar",
  "type": "kanji",
  "hint": "N1 essencial · texto e documentos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "閲"
  ],
  "jlpt": "N1",
  "group": "texto e documentos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "エツ",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "閲覧",
      "romaji": "etsuran",
      "pt": "visualização"
    },
    {
      "jp": "検閲",
      "romaji": "ken'etsu",
      "pt": "censura"
    },
    {
      "jp": "閲読",
      "romaji": "etsudoku",
      "pt": "leitura/revisão"
    }
  ]
},
{
  "id": "j_n1_36_89a7_1",
  "category": "kanji",
  "focus": "覧",
  "jp": "覧",
  "romaji": "ラン",
  "pt": "ver / observar",
  "type": "kanji",
  "hint": "N1 essencial · texto e documentos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "覧"
  ],
  "jlpt": "N1",
  "group": "texto e documentos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ラン",
  "kunyomi": "",
  "strokes": "17",
  "examples": [
    {
      "jp": "一覧",
      "romaji": "ichiran",
      "pt": "← lista"
    },
    {
      "jp": "閲覧",
      "romaji": "etsuran",
      "pt": "visualização"
    },
    {
      "jp": "観覧",
      "romaji": "kanran",
      "pt": "assistir/ver"
    }
  ]
},
{
  "id": "j_n1_36_9042_1",
  "category": "kanji",
  "focus": "遂",
  "jp": "遂",
  "romaji": "スイ",
  "pt": "realizar / concluir",
  "type": "kanji",
  "hint": "N1 essencial · texto e documentos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "遂"
  ],
  "jlpt": "N1",
  "group": "texto e documentos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "スイ",
  "kunyomi": "と",
  "strokes": "12",
  "examples": [
    {
      "jp": "遂げる",
      "romaji": "togeru",
      "pt": "realizar"
    },
    {
      "jp": "完遂",
      "romaji": "kansui",
      "pt": "cumprimento completo"
    },
    {
      "jp": "未遂",
      "romaji": "misui",
      "pt": "tentativa falha"
    }
  ]
},
{
  "id": "j_n1_36_4f34_1",
  "category": "kanji",
  "focus": "伴",
  "jp": "伴",
  "romaji": "ハン, バン",
  "pt": "acompanhar",
  "type": "kanji",
  "hint": "N1 essencial · texto e documentos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "伴"
  ],
  "jlpt": "N1",
  "group": "texto e documentos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ハン, バン",
  "kunyomi": "ともな",
  "strokes": "7",
  "examples": [
    {
      "jp": "伴う",
      "romaji": "tomonau",
      "pt": "acompanhar"
    },
    {
      "jp": "同伴",
      "romaji": "douhan",
      "pt": "acompanhamento"
    },
    {
      "jp": "伴奏",
      "romaji": "bansou",
      "pt": "acompanhamento musical"
    }
  ]
},
{
  "id": "j_n1_36_53ca_1",
  "category": "kanji",
  "focus": "及",
  "jp": "及",
  "romaji": "キュウ",
  "pt": "alcançar / mencionar",
  "type": "kanji",
  "hint": "N1 essencial · texto e documentos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "及"
  ],
  "jlpt": "N1",
  "group": "texto e documentos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "キュウ",
  "kunyomi": "およ",
  "strokes": "3",
  "examples": [
    {
      "jp": "及ぶ",
      "romaji": "oyobu",
      "pt": "alcançar"
    },
    {
      "jp": "及び",
      "romaji": "oyobi",
      "pt": "e / bem como"
    },
    {
      "jp": "普及",
      "romaji": "fukyuu",
      "pt": "difusão"
    }
  ]
},
{
  "id": "j_n1_36_666e_1",
  "category": "kanji",
  "focus": "普",
  "jp": "普",
  "romaji": "フ",
  "pt": "universal / comum",
  "type": "kanji",
  "hint": "N1 essencial · texto e documentos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "普"
  ],
  "jlpt": "N1",
  "group": "texto e documentos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "フ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "普通",
      "romaji": "futsuu",
      "pt": "normal"
    },
    {
      "jp": "普及",
      "romaji": "fukyuu",
      "pt": "difusão"
    },
    {
      "jp": "普段",
      "romaji": "fudan",
      "pt": "cotidiano"
    }
  ]
},
{
  "id": "j_n1_36_904d_1",
  "category": "kanji",
  "focus": "遍",
  "jp": "遍",
  "romaji": "ヘン",
  "pt": "todo lado",
  "type": "kanji",
  "hint": "N1 essencial · texto e documentos. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "遍"
  ],
  "jlpt": "N1",
  "group": "texto e documentos",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ヘン",
  "kunyomi": "あまね",
  "strokes": "12",
  "examples": [
    {
      "jp": "普遍",
      "romaji": "fuhen",
      "pt": "universal"
    },
    {
      "jp": "遍歴",
      "romaji": "henreki",
      "pt": "peregrinação/histórico"
    },
    {
      "jp": "一遍",
      "romaji": "ippen",
      "pt": "uma vez"
    }
  ]
},
{
  "id": "j_n1_36_66ab_1",
  "category": "kanji",
  "focus": "暫",
  "jp": "暫",
  "romaji": "ザン",
  "pt": "temporário",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "暫"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ザン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "暫定",
      "romaji": "zantei",
      "pt": "provisório"
    },
    {
      "jp": "暫く",
      "romaji": "shibaraku",
      "pt": "por um tempo"
    },
    {
      "jp": "暫時",
      "romaji": "zanji",
      "pt": "temporariamente"
    }
  ]
},
{
  "id": "j_n1_36_63aa_1",
  "category": "kanji",
  "focus": "措",
  "jp": "措",
  "romaji": "ソ",
  "pt": "medida / providência",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "措"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ソ",
  "kunyomi": "",
  "strokes": "11",
  "examples": [
    {
      "jp": "措置",
      "romaji": "sochi",
      "pt": "medida/providência"
    },
    {
      "jp": "措く",
      "romaji": "oku",
      "pt": "deixar de lado"
    },
    {
      "jp": "処置",
      "romaji": "shochi",
      "pt": "tratamento/medida"
    }
  ]
},
{
  "id": "j_n1_36_7f6e_1",
  "category": "kanji",
  "focus": "置",
  "jp": "置",
  "romaji": "チ",
  "pt": "colocar",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "置"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "チ",
  "kunyomi": "お",
  "strokes": "13",
  "examples": [
    {
      "jp": "措置",
      "romaji": "sochi",
      "pt": "medida"
    },
    {
      "jp": "置く",
      "romaji": "oku",
      "pt": "colocar"
    },
    {
      "jp": "位置",
      "romaji": "ichi",
      "pt": "posição"
    }
  ]
},
{
  "id": "j_n1_36_643a_1",
  "category": "kanji",
  "focus": "携",
  "jp": "携",
  "romaji": "ケイ",
  "pt": "portar / cooperar",
  "type": "kanji",
  "hint": "N1 essencial · formalidade. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "携"
  ],
  "jlpt": "N1",
  "group": "formalidade",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "ケイ",
  "kunyomi": "たずさ",
  "strokes": "13",
  "examples": [
    {
      "jp": "携帯",
      "romaji": "keitai",
      "pt": "celular/portátil"
    },
    {
      "jp": "連携",
      "romaji": "renkei",
      "pt": "cooperação"
    },
    {
      "jp": "携わる",
      "romaji": "tazusawaru",
      "pt": "envolver-se"
    }
  ]
},
{
  "id": "j_n1_36_5146_1",
  "category": "kanji",
  "focus": "兆",
  "jp": "兆",
  "romaji": "チョウ",
  "pt": "sinal / trilhão",
  "type": "kanji",
  "hint": "N1 essencial · notícias. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "兆"
  ],
  "jlpt": "N1",
  "group": "notícias",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "チョウ",
  "kunyomi": "きざ",
  "strokes": "6",
  "examples": [
    {
      "jp": "兆候",
      "romaji": "choukou",
      "pt": "sinal/indício"
    },
    {
      "jp": "一兆",
      "romaji": "icchou",
      "pt": "um trilhão"
    },
    {
      "jp": "前兆",
      "romaji": "zenchou",
      "pt": "presságio"
    }
  ]
},
{
  "id": "j_n1_36_5019_1",
  "category": "kanji",
  "focus": "候",
  "jp": "候",
  "romaji": "コウ",
  "pt": "clima / indício",
  "type": "kanji",
  "hint": "N1 essencial · notícias. Kanji útil para prova, leitura e vida real.",
  "chars": [
    "候"
  ],
  "jlpt": "N1",
  "group": "notícias",
  "memo": "Aprenda pelo significado, reconheça em palavras reais e escreva até criar familiaridade.",
  "onyomi": "コウ",
  "kunyomi": "そうろう",
  "strokes": "10",
  "examples": [
    {
      "jp": "候補",
      "romaji": "kouho",
      "pt": "candidato"
    },
    {
      "jp": "気候",
      "romaji": "kikou",
      "pt": "clima"
    },
    {
      "jp": "兆候",
      "romaji": "choukou",
      "pt": "sinal"
    }
  ]
},
{
  "id": "j_n5_37_7530",
  "category": "kanji",
  "focus": "田",
  "jp": "田",
  "romaji": "デン",
  "pt": "campo de arroz",
  "type": "kanji",
  "hint": "N5 Jōyō · natureza e base. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "田"
  ],
  "jlpt": "N5",
  "group": "natureza e base",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "デン",
  "kunyomi": "た",
  "strokes": "5",
  "examples": [
    {
      "jp": "田んぼ",
      "romaji": "tanbo",
      "pt": "arrozal"
    },
    {
      "jp": "田舎",
      "romaji": "inaka",
      "pt": "interior"
    },
    {
      "jp": "水田",
      "romaji": "suiden",
      "pt": "campo de arroz"
    }
  ]
},
{
  "id": "j_n5_37_753a",
  "category": "kanji",
  "focus": "町",
  "jp": "町",
  "romaji": "チョウ",
  "pt": "cidade / bairro",
  "type": "kanji",
  "hint": "N5 Jōyō · lugares básicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "町"
  ],
  "jlpt": "N5",
  "group": "lugares básicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "チョウ",
  "kunyomi": "まち",
  "strokes": "7",
  "examples": [
    {
      "jp": "町",
      "romaji": "machi",
      "pt": "cidade/bairro"
    },
    {
      "jp": "町内",
      "romaji": "chounai",
      "pt": "bairro/local"
    },
    {
      "jp": "下町",
      "romaji": "shitamachi",
      "pt": "bairro antigo"
    }
  ]
},
{
  "id": "j_n5_37_6751",
  "category": "kanji",
  "focus": "村",
  "jp": "村",
  "romaji": "ソン",
  "pt": "vila",
  "type": "kanji",
  "hint": "N5 Jōyō · lugares básicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "村"
  ],
  "jlpt": "N5",
  "group": "lugares básicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ソン",
  "kunyomi": "むら",
  "strokes": "7",
  "examples": [
    {
      "jp": "村",
      "romaji": "mura",
      "pt": "vila"
    },
    {
      "jp": "村人",
      "romaji": "murabito",
      "pt": "morador da vila"
    },
    {
      "jp": "村長",
      "romaji": "sonchou",
      "pt": "chefe da vila"
    }
  ]
},
{
  "id": "j_n5_37_72ac",
  "category": "kanji",
  "focus": "犬",
  "jp": "犬",
  "romaji": "ケン",
  "pt": "cachorro",
  "type": "kanji",
  "hint": "N5 Jōyō · vida diária. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "犬"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ケン",
  "kunyomi": "いぬ",
  "strokes": "4",
  "examples": [
    {
      "jp": "犬",
      "romaji": "inu",
      "pt": "cachorro"
    },
    {
      "jp": "子犬",
      "romaji": "koinu",
      "pt": "filhote"
    },
    {
      "jp": "犬がいます",
      "romaji": "inu ga imasu",
      "pt": "há um cachorro"
    }
  ]
},
{
  "id": "j_n5_37_9b5a",
  "category": "kanji",
  "focus": "魚",
  "jp": "魚",
  "romaji": "ギョ",
  "pt": "peixe",
  "type": "kanji",
  "hint": "N5 Jōyō · vida diária. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "魚"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ギョ",
  "kunyomi": "さかな",
  "strokes": "11",
  "examples": [
    {
      "jp": "魚",
      "romaji": "sakana",
      "pt": "peixe"
    },
    {
      "jp": "魚屋",
      "romaji": "sakanaya",
      "pt": "peixaria"
    },
    {
      "jp": "金魚",
      "romaji": "kingyo",
      "pt": "peixe dourado"
    }
  ]
},
{
  "id": "j_n5_37_8089",
  "category": "kanji",
  "focus": "肉",
  "jp": "肉",
  "romaji": "ニク",
  "pt": "carne",
  "type": "kanji",
  "hint": "N5 Jōyō · vida diária. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "肉"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ニク",
  "kunyomi": "",
  "strokes": "6",
  "examples": [
    {
      "jp": "肉",
      "romaji": "niku",
      "pt": "carne"
    },
    {
      "jp": "牛肉",
      "romaji": "gyuuniku",
      "pt": "carne bovina"
    },
    {
      "jp": "豚肉",
      "romaji": "butaniku",
      "pt": "carne suína"
    }
  ]
},
{
  "id": "j_n5_37_8336",
  "category": "kanji",
  "focus": "茶",
  "jp": "茶",
  "romaji": "チャ, サ",
  "pt": "chá",
  "type": "kanji",
  "hint": "N5 Jōyō · vida diária. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "茶"
  ],
  "jlpt": "N5",
  "group": "vida diária",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "チャ, サ",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "お茶",
      "romaji": "ocha",
      "pt": "chá"
    },
    {
      "jp": "茶色",
      "romaji": "chairo",
      "pt": "marrom"
    },
    {
      "jp": "日本茶",
      "romaji": "nihoncha",
      "pt": "chá japonês"
    }
  ]
},
{
  "id": "j_n5_37_8c9d",
  "category": "kanji",
  "focus": "貝",
  "jp": "貝",
  "romaji": "バイ",
  "pt": "concha / marisco",
  "type": "kanji",
  "hint": "N5 Jōyō · natureza e comida. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "貝"
  ],
  "jlpt": "N5",
  "group": "natureza e comida",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "バイ",
  "kunyomi": "かい",
  "strokes": "7",
  "examples": [
    {
      "jp": "貝",
      "romaji": "kai",
      "pt": "concha/marisco"
    },
    {
      "jp": "貝類",
      "romaji": "kairui",
      "pt": "moluscos"
    },
    {
      "jp": "貝殻",
      "romaji": "kaigara",
      "pt": "concha"
    }
  ]
},
{
  "id": "j_n5_37_7af9",
  "category": "kanji",
  "focus": "竹",
  "jp": "竹",
  "romaji": "チク",
  "pt": "bambu",
  "type": "kanji",
  "hint": "N5 Jōyō · natureza. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "竹"
  ],
  "jlpt": "N5",
  "group": "natureza",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "チク",
  "kunyomi": "たけ",
  "strokes": "6",
  "examples": [
    {
      "jp": "竹",
      "romaji": "take",
      "pt": "bambu"
    },
    {
      "jp": "竹林",
      "romaji": "chikurin",
      "pt": "bosque de bambu"
    },
    {
      "jp": "竹の子",
      "romaji": "takenoko",
      "pt": "broto de bambu"
    }
  ]
},
{
  "id": "j_n5_37_7cf8",
  "category": "kanji",
  "focus": "糸",
  "jp": "糸",
  "romaji": "シ",
  "pt": "fio",
  "type": "kanji",
  "hint": "N5 Jōyō · objetos básicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "糸"
  ],
  "jlpt": "N5",
  "group": "objetos básicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シ",
  "kunyomi": "いと",
  "strokes": "6",
  "examples": [
    {
      "jp": "糸",
      "romaji": "ito",
      "pt": "fio"
    },
    {
      "jp": "毛糸",
      "romaji": "keito",
      "pt": "lã"
    },
    {
      "jp": "糸口",
      "romaji": "itoguchi",
      "pt": "pista/início"
    }
  ]
},
{
  "id": "j_n5_37_9580",
  "category": "kanji",
  "focus": "門",
  "jp": "門",
  "romaji": "モン",
  "pt": "portão",
  "type": "kanji",
  "hint": "N5 Jōyō · lugares básicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "門"
  ],
  "jlpt": "N5",
  "group": "lugares básicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "モン",
  "kunyomi": "かど",
  "strokes": "8",
  "examples": [
    {
      "jp": "門",
      "romaji": "mon",
      "pt": "portão"
    },
    {
      "jp": "専門",
      "romaji": "senmon",
      "pt": "especialidade"
    },
    {
      "jp": "入門",
      "romaji": "nyuumon",
      "pt": "introdução"
    }
  ]
},
{
  "id": "j_n5_37_9593",
  "category": "kanji",
  "focus": "間",
  "jp": "間",
  "romaji": "カン, ケン",
  "pt": "intervalo / entre",
  "type": "kanji",
  "hint": "N5 Jōyō · tempo e espaço. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "間"
  ],
  "jlpt": "N5",
  "group": "tempo e espaço",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カン, ケン",
  "kunyomi": "あいだ, ま",
  "strokes": "12",
  "examples": [
    {
      "jp": "時間",
      "romaji": "jikan",
      "pt": "tempo"
    },
    {
      "jp": "間",
      "romaji": "aida",
      "pt": "entre"
    },
    {
      "jp": "人間",
      "romaji": "ningen",
      "pt": "ser humano"
    }
  ]
},
{
  "id": "j_n5_37_5144",
  "category": "kanji",
  "focus": "兄",
  "jp": "兄",
  "romaji": "ケイ, キョウ",
  "pt": "irmão mais velho",
  "type": "kanji",
  "hint": "N5 Jōyō · família. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "兄"
  ],
  "jlpt": "N5",
  "group": "família",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ケイ, キョウ",
  "kunyomi": "あに",
  "strokes": "5",
  "examples": [
    {
      "jp": "兄",
      "romaji": "ani",
      "pt": "meu irmão mais velho"
    },
    {
      "jp": "お兄さん",
      "romaji": "oniisan",
      "pt": "irmão mais velho"
    },
    {
      "jp": "兄弟",
      "romaji": "kyoudai",
      "pt": "irmãos"
    }
  ]
},
{
  "id": "j_n5_37_5f1f",
  "category": "kanji",
  "focus": "弟",
  "jp": "弟",
  "romaji": "ダイ, テイ",
  "pt": "irmão mais novo",
  "type": "kanji",
  "hint": "N5 Jōyō · família. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "弟"
  ],
  "jlpt": "N5",
  "group": "família",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ダイ, テイ",
  "kunyomi": "おとうと",
  "strokes": "7",
  "examples": [
    {
      "jp": "弟",
      "romaji": "otouto",
      "pt": "irmão mais novo"
    },
    {
      "jp": "兄弟",
      "romaji": "kyoudai",
      "pt": "irmãos"
    },
    {
      "jp": "弟さん",
      "romaji": "otoutosan",
      "pt": "irmão mais novo de alguém"
    }
  ]
},
{
  "id": "j_n5_37_59c9",
  "category": "kanji",
  "focus": "姉",
  "jp": "姉",
  "romaji": "シ",
  "pt": "irmã mais velha",
  "type": "kanji",
  "hint": "N5 Jōyō · família. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "姉"
  ],
  "jlpt": "N5",
  "group": "família",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シ",
  "kunyomi": "あね",
  "strokes": "8",
  "examples": [
    {
      "jp": "姉",
      "romaji": "ane",
      "pt": "minha irmã mais velha"
    },
    {
      "jp": "お姉さん",
      "romaji": "oneesan",
      "pt": "irmã mais velha"
    },
    {
      "jp": "姉妹",
      "romaji": "shimai",
      "pt": "irmãs"
    }
  ]
},
{
  "id": "j_n5_37_59b9",
  "category": "kanji",
  "focus": "妹",
  "jp": "妹",
  "romaji": "マイ",
  "pt": "irmã mais nova",
  "type": "kanji",
  "hint": "N5 Jōyō · família. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "妹"
  ],
  "jlpt": "N5",
  "group": "família",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "マイ",
  "kunyomi": "いもうと",
  "strokes": "8",
  "examples": [
    {
      "jp": "妹",
      "romaji": "imouto",
      "pt": "irmã mais nova"
    },
    {
      "jp": "姉妹",
      "romaji": "shimai",
      "pt": "irmãs"
    },
    {
      "jp": "妹さん",
      "romaji": "imoutosan",
      "pt": "irmã mais nova de alguém"
    }
  ]
},
{
  "id": "j_n4_37_6d77",
  "category": "kanji",
  "focus": "海",
  "jp": "海",
  "romaji": "カイ",
  "pt": "mar",
  "type": "kanji",
  "hint": "N4 Jōyō · natureza e viagem. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "海"
  ],
  "jlpt": "N4",
  "group": "natureza e viagem",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カイ",
  "kunyomi": "うみ",
  "strokes": "9",
  "examples": [
    {
      "jp": "海",
      "romaji": "umi",
      "pt": "mar"
    },
    {
      "jp": "海外",
      "romaji": "kaigai",
      "pt": "exterior"
    },
    {
      "jp": "海岸",
      "romaji": "kaigan",
      "pt": "costa"
    }
  ]
},
{
  "id": "j_n4_37_65c5",
  "category": "kanji",
  "focus": "旅",
  "jp": "旅",
  "romaji": "リョ",
  "pt": "viagem",
  "type": "kanji",
  "hint": "N4 Jōyō · viagens e locais públicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "旅"
  ],
  "jlpt": "N4",
  "group": "viagens e locais públicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "リョ",
  "kunyomi": "たび",
  "strokes": "10",
  "examples": [
    {
      "jp": "旅行",
      "romaji": "ryokou",
      "pt": "viagem"
    },
    {
      "jp": "旅",
      "romaji": "tabi",
      "pt": "viagem"
    },
    {
      "jp": "旅館",
      "romaji": "ryokan",
      "pt": "pousada japonesa"
    }
  ]
},
{
  "id": "j_n4_37_9928",
  "category": "kanji",
  "focus": "館",
  "jp": "館",
  "romaji": "カン",
  "pt": "edifício público",
  "type": "kanji",
  "hint": "N4 Jōyō · viagens e locais públicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "館"
  ],
  "jlpt": "N4",
  "group": "viagens e locais públicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カン",
  "kunyomi": "やかた",
  "strokes": "16",
  "examples": [
    {
      "jp": "図書館",
      "romaji": "toshokan",
      "pt": "biblioteca"
    },
    {
      "jp": "旅館",
      "romaji": "ryokan",
      "pt": "ryokan"
    },
    {
      "jp": "会館",
      "romaji": "kaikan",
      "pt": "salão público"
    }
  ]
},
{
  "id": "j_n4_37_56f3",
  "category": "kanji",
  "focus": "図",
  "jp": "図",
  "romaji": "ズ, ト",
  "pt": "mapa / desenho",
  "type": "kanji",
  "hint": "N4 Jōyō · viagens e locais públicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "図"
  ],
  "jlpt": "N4",
  "group": "viagens e locais públicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ズ, ト",
  "kunyomi": "はか",
  "strokes": "7",
  "examples": [
    {
      "jp": "地図",
      "romaji": "chizu",
      "pt": "mapa"
    },
    {
      "jp": "図書館",
      "romaji": "toshokan",
      "pt": "biblioteca"
    },
    {
      "jp": "図る",
      "romaji": "hakaru",
      "pt": "planejar"
    }
  ]
},
{
  "id": "j_n4_37_53f0",
  "category": "kanji",
  "focus": "台",
  "jp": "台",
  "romaji": "ダイ, タイ",
  "pt": "base /台",
  "type": "kanji",
  "hint": "N4 Jōyō · viagens e locais públicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "台"
  ],
  "jlpt": "N4",
  "group": "viagens e locais públicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ダイ, タイ",
  "kunyomi": "",
  "strokes": "5",
  "examples": [
    {
      "jp": "台風",
      "romaji": "taifuu",
      "pt": "tufão"
    },
    {
      "jp": "一台",
      "romaji": "ichidai",
      "pt": "uma máquina/veículo"
    },
    {
      "jp": "台所",
      "romaji": "daidokoro",
      "pt": "cozinha"
    }
  ]
},
{
  "id": "j_n4_37_697d",
  "category": "kanji",
  "focus": "楽",
  "jp": "楽",
  "romaji": "ガク, ラク",
  "pt": "divertido / confortável",
  "type": "kanji",
  "hint": "N4 Jōyō · vida e emoção. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "楽"
  ],
  "jlpt": "N4",
  "group": "vida e emoção",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ガク, ラク",
  "kunyomi": "たの",
  "strokes": "13",
  "examples": [
    {
      "jp": "楽しい",
      "romaji": "tanoshii",
      "pt": "divertido"
    },
    {
      "jp": "楽",
      "romaji": "raku",
      "pt": "confortável"
    },
    {
      "jp": "音楽",
      "romaji": "ongaku",
      "pt": "música"
    }
  ]
},
{
  "id": "j_n4_37_6697",
  "category": "kanji",
  "focus": "暗",
  "jp": "暗",
  "romaji": "アン",
  "pt": "escuro",
  "type": "kanji",
  "hint": "N4 Jōyō · descrições. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "暗"
  ],
  "jlpt": "N4",
  "group": "descrições",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "アン",
  "kunyomi": "くら",
  "strokes": "13",
  "examples": [
    {
      "jp": "暗い",
      "romaji": "kurai",
      "pt": "escuro"
    },
    {
      "jp": "暗記",
      "romaji": "anki",
      "pt": "memorização"
    },
    {
      "jp": "明暗",
      "romaji": "meian",
      "pt": "claro e escuro"
    }
  ]
},
{
  "id": "j_n4_37_77ed",
  "category": "kanji",
  "focus": "短",
  "jp": "短",
  "romaji": "タン",
  "pt": "curto",
  "type": "kanji",
  "hint": "N4 Jōyō · descrições. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "短"
  ],
  "jlpt": "N4",
  "group": "descrições",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "タン",
  "kunyomi": "みじか",
  "strokes": "12",
  "examples": [
    {
      "jp": "短い",
      "romaji": "mijikai",
      "pt": "curto"
    },
    {
      "jp": "短時間",
      "romaji": "tanjikan",
      "pt": "pouco tempo"
    },
    {
      "jp": "短所",
      "romaji": "tansho",
      "pt": "ponto fraco"
    }
  ]
},
{
  "id": "j_n4_37_7fd2",
  "category": "kanji",
  "focus": "習",
  "jp": "習",
  "romaji": "シュウ",
  "pt": "aprender",
  "type": "kanji",
  "hint": "N4 Jōyō · estudo. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "習"
  ],
  "jlpt": "N4",
  "group": "estudo",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シュウ",
  "kunyomi": "なら",
  "strokes": "11",
  "examples": [
    {
      "jp": "習う",
      "romaji": "narau",
      "pt": "aprender"
    },
    {
      "jp": "練習",
      "romaji": "renshuu",
      "pt": "prática"
    },
    {
      "jp": "予習",
      "romaji": "yoshuu",
      "pt": "preparação de aula"
    }
  ]
},
{
  "id": "j_n4_37_52c9",
  "category": "kanji",
  "focus": "勉",
  "jp": "勉",
  "romaji": "ベン",
  "pt": "esforço",
  "type": "kanji",
  "hint": "N4 Jōyō · estudo. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "勉"
  ],
  "jlpt": "N4",
  "group": "estudo",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ベン",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "勉強",
      "romaji": "benkyou",
      "pt": "estudo"
    },
    {
      "jp": "勤勉",
      "romaji": "kinben",
      "pt": "diligente"
    },
    {
      "jp": "勉める",
      "romaji": "tsutomeru",
      "pt": "esforçar-se"
    }
  ]
},
{
  "id": "j_n4_37_6559",
  "category": "kanji",
  "focus": "教",
  "jp": "教",
  "romaji": "キョウ",
  "pt": "ensinar",
  "type": "kanji",
  "hint": "N4 Jōyō · estudo. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "教"
  ],
  "jlpt": "N4",
  "group": "estudo",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "キョウ",
  "kunyomi": "おし",
  "strokes": "11",
  "examples": [
    {
      "jp": "教える",
      "romaji": "oshieru",
      "pt": "ensinar"
    },
    {
      "jp": "教室",
      "romaji": "kyoushitsu",
      "pt": "sala de aula"
    },
    {
      "jp": "教育",
      "romaji": "kyouiku",
      "pt": "educação"
    }
  ]
},
{
  "id": "j_n4_37_5ba4",
  "category": "kanji",
  "focus": "室",
  "jp": "室",
  "romaji": "シツ",
  "pt": "sala",
  "type": "kanji",
  "hint": "N4 Jōyō · locais públicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "室"
  ],
  "jlpt": "N4",
  "group": "locais públicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シツ",
  "kunyomi": "むろ",
  "strokes": "9",
  "examples": [
    {
      "jp": "教室",
      "romaji": "kyoushitsu",
      "pt": "sala de aula"
    },
    {
      "jp": "事務室",
      "romaji": "jimushitsu",
      "pt": "escritório"
    },
    {
      "jp": "待合室",
      "romaji": "machiaishitsu",
      "pt": "sala de espera"
    }
  ]
},
{
  "id": "j_n4_37_5c40",
  "category": "kanji",
  "focus": "局",
  "jp": "局",
  "romaji": "キョク",
  "pt": "departamento / agência",
  "type": "kanji",
  "hint": "N4 Jōyō · locais públicos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "局"
  ],
  "jlpt": "N4",
  "group": "locais públicos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "キョク",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "薬局",
      "romaji": "yakkyoku",
      "pt": "farmácia"
    },
    {
      "jp": "郵便局",
      "romaji": "yuubinkyoku",
      "pt": "correio"
    },
    {
      "jp": "局",
      "romaji": "kyoku",
      "pt": "departamento"
    }
  ]
},
{
  "id": "j_n3_37_9762",
  "category": "kanji",
  "focus": "面",
  "jp": "面",
  "romaji": "メン",
  "pt": "face / superfície",
  "type": "kanji",
  "hint": "N3 Jōyō · interpretação urbana. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "面"
  ],
  "jlpt": "N3",
  "group": "interpretação urbana",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "メン",
  "kunyomi": "おも, つら",
  "strokes": "9",
  "examples": [
    {
      "jp": "画面",
      "romaji": "gamen",
      "pt": "tela"
    },
    {
      "jp": "表面",
      "romaji": "hyoumen",
      "pt": "superfície"
    },
    {
      "jp": "面接",
      "romaji": "mensetsu",
      "pt": "entrevista"
    }
  ]
},
{
  "id": "j_n3_37_63a5",
  "category": "kanji",
  "focus": "接",
  "jp": "接",
  "romaji": "セツ",
  "pt": "conectar / tocar",
  "type": "kanji",
  "hint": "N3 Jōyō · interpretação urbana. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "接"
  ],
  "jlpt": "N3",
  "group": "interpretação urbana",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "セツ",
  "kunyomi": "つ",
  "strokes": "11",
  "examples": [
    {
      "jp": "面接",
      "romaji": "mensetsu",
      "pt": "entrevista"
    },
    {
      "jp": "直接",
      "romaji": "chokusetsu",
      "pt": "direto"
    },
    {
      "jp": "接続",
      "romaji": "setsuzoku",
      "pt": "conexão"
    }
  ]
},
{
  "id": "j_n3_37_52b9",
  "category": "kanji",
  "focus": "効",
  "jp": "効",
  "romaji": "コウ",
  "pt": "efeito",
  "type": "kanji",
  "hint": "N3 Jōyō · interpretação urbana. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "効"
  ],
  "jlpt": "N3",
  "group": "interpretação urbana",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "コウ",
  "kunyomi": "き",
  "strokes": "8",
  "examples": [
    {
      "jp": "効果",
      "romaji": "kouka",
      "pt": "efeito"
    },
    {
      "jp": "有効",
      "romaji": "yuukou",
      "pt": "válido/eficaz"
    },
    {
      "jp": "効く",
      "romaji": "kiku",
      "pt": "fazer efeito"
    }
  ]
},
{
  "id": "j_n3_37_5742",
  "category": "kanji",
  "focus": "坂",
  "jp": "坂",
  "romaji": "ハン",
  "pt": "rampa",
  "type": "kanji",
  "hint": "N3 Jōyō · placas e trânsito. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "坂"
  ],
  "jlpt": "N3",
  "group": "placas e trânsito",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ハン",
  "kunyomi": "さか",
  "strokes": "7",
  "examples": [
    {
      "jp": "坂",
      "romaji": "saka",
      "pt": "rampa"
    },
    {
      "jp": "坂道",
      "romaji": "sakamichi",
      "pt": "ladeira"
    },
    {
      "jp": "上り坂",
      "romaji": "noborizaka",
      "pt": "subida"
    }
  ]
},
{
  "id": "j_n3_37_7a93",
  "category": "kanji",
  "focus": "窓",
  "jp": "窓",
  "romaji": "ソウ",
  "pt": "janela",
  "type": "kanji",
  "hint": "N3 Jōyō · vida e placas. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "窓"
  ],
  "jlpt": "N3",
  "group": "vida e placas",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ソウ",
  "kunyomi": "まど",
  "strokes": "11",
  "examples": [
    {
      "jp": "窓",
      "romaji": "mado",
      "pt": "janela"
    },
    {
      "jp": "窓口",
      "romaji": "madoguchi",
      "pt": "guichê"
    },
    {
      "jp": "車窓",
      "romaji": "shasou",
      "pt": "janela do veículo"
    }
  ]
},
{
  "id": "j_n3_37_9589",
  "category": "kanji",
  "focus": "閉",
  "jp": "閉",
  "romaji": "ヘイ",
  "pt": "fechar",
  "type": "kanji",
  "hint": "N3 Jōyō · ações e avisos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "閉"
  ],
  "jlpt": "N3",
  "group": "ações e avisos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ヘイ",
  "kunyomi": "し, と",
  "strokes": "11",
  "examples": [
    {
      "jp": "閉める",
      "romaji": "shimeru",
      "pt": "fechar algo"
    },
    {
      "jp": "閉まる",
      "romaji": "shimaru",
      "pt": "fechar-se"
    },
    {
      "jp": "閉店",
      "romaji": "heiten",
      "pt": "fechamento"
    }
  ]
},
{
  "id": "j_n3_37_958b",
  "category": "kanji",
  "focus": "開",
  "jp": "開",
  "romaji": "カイ",
  "pt": "abrir",
  "type": "kanji",
  "hint": "N3 Jōyō · ações e avisos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "開"
  ],
  "jlpt": "N3",
  "group": "ações e avisos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カイ",
  "kunyomi": "あ, ひら",
  "strokes": "12",
  "examples": [
    {
      "jp": "開ける",
      "romaji": "akeru",
      "pt": "abrir algo"
    },
    {
      "jp": "開く",
      "romaji": "hiraku",
      "pt": "abrir"
    },
    {
      "jp": "開始",
      "romaji": "kaishi",
      "pt": "início"
    }
  ]
},
{
  "id": "j_n3_37_7dda",
  "category": "kanji",
  "focus": "線",
  "jp": "線",
  "romaji": "セン",
  "pt": "linha",
  "type": "kanji",
  "hint": "N3 Jōyō · placas e transporte. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "線"
  ],
  "jlpt": "N3",
  "group": "placas e transporte",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "セン",
  "kunyomi": "",
  "strokes": "15",
  "examples": [
    {
      "jp": "電線",
      "romaji": "densen",
      "pt": "fio elétrico"
    },
    {
      "jp": "路線",
      "romaji": "rosen",
      "pt": "linha/rota"
    },
    {
      "jp": "新幹線",
      "romaji": "shinkansen",
      "pt": "trem-bala"
    }
  ]
},
{
  "id": "j_n3_37_8def",
  "category": "kanji",
  "focus": "路",
  "jp": "路",
  "romaji": "ロ",
  "pt": "rota / caminho",
  "type": "kanji",
  "hint": "N3 Jōyō · placas e transporte. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "路"
  ],
  "jlpt": "N3",
  "group": "placas e transporte",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ロ",
  "kunyomi": "じ",
  "strokes": "13",
  "examples": [
    {
      "jp": "道路",
      "romaji": "douro",
      "pt": "rua/estrada"
    },
    {
      "jp": "路線",
      "romaji": "rosen",
      "pt": "linha/rota"
    },
    {
      "jp": "通路",
      "romaji": "tsuuro",
      "pt": "passagem"
    }
  ]
},
{
  "id": "j_n3_37_5dee",
  "category": "kanji",
  "focus": "差",
  "jp": "差",
  "romaji": "サ",
  "pt": "diferença",
  "type": "kanji",
  "hint": "N3 Jōyō · interpretação. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "差"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "サ",
  "kunyomi": "さ",
  "strokes": "10",
  "examples": [
    {
      "jp": "差",
      "romaji": "sa",
      "pt": "diferença"
    },
    {
      "jp": "時差",
      "romaji": "jisa",
      "pt": "diferença de fuso"
    },
    {
      "jp": "差し引き",
      "romaji": "sashihiki",
      "pt": "dedução"
    }
  ]
},
{
  "id": "j_n3_37_9055",
  "category": "kanji",
  "focus": "違",
  "jp": "違",
  "romaji": "イ",
  "pt": "diferir / errado",
  "type": "kanji",
  "hint": "N3 Jōyō · interpretação. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "違"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "イ",
  "kunyomi": "ちが",
  "strokes": "13",
  "examples": [
    {
      "jp": "違う",
      "romaji": "chigau",
      "pt": "diferente/errado"
    },
    {
      "jp": "間違い",
      "romaji": "machigai",
      "pt": "erro"
    },
    {
      "jp": "違反",
      "romaji": "ihan",
      "pt": "violação"
    }
  ]
},
{
  "id": "j_n3_37_5fdc",
  "category": "kanji",
  "focus": "応",
  "jp": "応",
  "romaji": "オウ",
  "pt": "responder",
  "type": "kanji",
  "hint": "N3 Jōyō · interpretação. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "応"
  ],
  "jlpt": "N3",
  "group": "interpretação",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "オウ",
  "kunyomi": "",
  "strokes": "7",
  "examples": [
    {
      "jp": "対応",
      "romaji": "taiou",
      "pt": "resposta/atendimento"
    },
    {
      "jp": "反応",
      "romaji": "hannou",
      "pt": "reação"
    },
    {
      "jp": "応援",
      "romaji": "ouen",
      "pt": "apoio"
    }
  ]
},
{
  "id": "j_n3_37_5831",
  "category": "kanji",
  "focus": "報",
  "jp": "報",
  "romaji": "ホウ",
  "pt": "informação / notícia",
  "type": "kanji",
  "hint": "N3 Jōyō · e-mails e avisos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "報"
  ],
  "jlpt": "N3",
  "group": "e-mails e avisos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ホウ",
  "kunyomi": "むく",
  "strokes": "12",
  "examples": [
    {
      "jp": "情報",
      "romaji": "jouhou",
      "pt": "informação"
    },
    {
      "jp": "報告",
      "romaji": "houkoku",
      "pt": "relatório"
    },
    {
      "jp": "予報",
      "romaji": "yohou",
      "pt": "previsão"
    }
  ]
},
{
  "id": "j_n3_37_544a",
  "category": "kanji",
  "focus": "告",
  "jp": "告",
  "romaji": "コク",
  "pt": "avisar",
  "type": "kanji",
  "hint": "N3 Jōyō · e-mails e avisos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "告"
  ],
  "jlpt": "N3",
  "group": "e-mails e avisos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "コク",
  "kunyomi": "つ",
  "strokes": "7",
  "examples": [
    {
      "jp": "報告",
      "romaji": "houkoku",
      "pt": "relatório"
    },
    {
      "jp": "広告",
      "romaji": "koukoku",
      "pt": "anúncio"
    },
    {
      "jp": "告白",
      "romaji": "kokuhaku",
      "pt": "confissão"
    }
  ]
},
{
  "id": "j_n3_37_8ca1",
  "category": "kanji",
  "focus": "財",
  "jp": "財",
  "romaji": "ザイ, サイ",
  "pt": "fortuna / recurso",
  "type": "kanji",
  "hint": "N3 Jōyō · sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "財"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ザイ, サイ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "財産",
      "romaji": "zaisan",
      "pt": "patrimônio"
    },
    {
      "jp": "財政",
      "romaji": "zaisei",
      "pt": "finanças públicas"
    },
    {
      "jp": "財布",
      "romaji": "saifu",
      "pt": "carteira"
    }
  ]
},
{
  "id": "j_n3_37_7523",
  "category": "kanji",
  "focus": "産",
  "jp": "産",
  "romaji": "サン",
  "pt": "produção / nascimento",
  "type": "kanji",
  "hint": "N3 Jōyō · sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "産"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "サン",
  "kunyomi": "う",
  "strokes": "11",
  "examples": [
    {
      "jp": "生産",
      "romaji": "seisan",
      "pt": "produção"
    },
    {
      "jp": "出産",
      "romaji": "shussan",
      "pt": "parto"
    },
    {
      "jp": "産業",
      "romaji": "sangyou",
      "pt": "indústria"
    }
  ]
},
{
  "id": "j_n3_37_5546",
  "category": "kanji",
  "focus": "商",
  "jp": "商",
  "romaji": "ショウ",
  "pt": "comércio",
  "type": "kanji",
  "hint": "N3 Jōyō · sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "商"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ショウ",
  "kunyomi": "あきな",
  "strokes": "11",
  "examples": [
    {
      "jp": "商品",
      "romaji": "shouhin",
      "pt": "produto"
    },
    {
      "jp": "商店",
      "romaji": "shouten",
      "pt": "loja"
    },
    {
      "jp": "商売",
      "romaji": "shoubai",
      "pt": "negócio"
    }
  ]
},
{
  "id": "j_n3_37_8fb2",
  "category": "kanji",
  "focus": "農",
  "jp": "農",
  "romaji": "ノウ",
  "pt": "agricultura",
  "type": "kanji",
  "hint": "N3 Jōyō · sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "農"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ノウ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "農業",
      "romaji": "nougyou",
      "pt": "agricultura"
    },
    {
      "jp": "農家",
      "romaji": "nouka",
      "pt": "agricultor"
    },
    {
      "jp": "農産物",
      "romaji": "nousanbutsu",
      "pt": "produto agrícola"
    }
  ]
},
{
  "id": "j_n3_37_80b2",
  "category": "kanji",
  "focus": "育",
  "jp": "育",
  "romaji": "イク",
  "pt": "educar / criar",
  "type": "kanji",
  "hint": "N3 Jōyō · sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "育"
  ],
  "jlpt": "N3",
  "group": "sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "イク",
  "kunyomi": "そだ",
  "strokes": "8",
  "examples": [
    {
      "jp": "教育",
      "romaji": "kyouiku",
      "pt": "educação"
    },
    {
      "jp": "育てる",
      "romaji": "sodateru",
      "pt": "criar"
    },
    {
      "jp": "体育",
      "romaji": "taiiku",
      "pt": "educação física"
    }
  ]
},
{
  "id": "j_n3_37_8ca0",
  "category": "kanji",
  "focus": "負",
  "jp": "負",
  "romaji": "フ",
  "pt": "perder / carregar",
  "type": "kanji",
  "hint": "N3 Jōyō · trabalho. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "負"
  ],
  "jlpt": "N3",
  "group": "trabalho",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "フ",
  "kunyomi": "ま, お",
  "strokes": "9",
  "examples": [
    {
      "jp": "負担",
      "romaji": "futan",
      "pt": "carga"
    },
    {
      "jp": "負ける",
      "romaji": "makeru",
      "pt": "perder"
    },
    {
      "jp": "背負う",
      "romaji": "seou",
      "pt": "carregar nas costas"
    }
  ]
},
{
  "id": "j_n2_37_8cbf",
  "category": "kanji",
  "focus": "貿",
  "jp": "貿",
  "romaji": "ボウ",
  "pt": "comércio exterior",
  "type": "kanji",
  "hint": "N2 Jōyō · economia e jornal. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "貿"
  ],
  "jlpt": "N2",
  "group": "economia e jornal",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ボウ",
  "kunyomi": "",
  "strokes": "12",
  "examples": [
    {
      "jp": "貿易",
      "romaji": "boueki",
      "pt": "comércio exterior"
    },
    {
      "jp": "貿易会社",
      "romaji": "boueki gaisha",
      "pt": "empresa de comércio"
    },
    {
      "jp": "貿易港",
      "romaji": "bouekikou",
      "pt": "porto comercial"
    }
  ]
},
{
  "id": "j_n2_37_6613",
  "category": "kanji",
  "focus": "易",
  "jp": "易",
  "romaji": "エキ, イ",
  "pt": "fácil / comércio",
  "type": "kanji",
  "hint": "N2 Jōyō · economia e jornal. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "易"
  ],
  "jlpt": "N2",
  "group": "economia e jornal",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "エキ, イ",
  "kunyomi": "やさ",
  "strokes": "8",
  "examples": [
    {
      "jp": "貿易",
      "romaji": "boueki",
      "pt": "comércio exterior"
    },
    {
      "jp": "易しい",
      "romaji": "yasashii",
      "pt": "fácil"
    },
    {
      "jp": "安易",
      "romaji": "an'i",
      "pt": "fácil demais/superficial"
    }
  ]
},
{
  "id": "j_n2_37_7559",
  "category": "kanji",
  "focus": "留",
  "jp": "留",
  "romaji": "リュウ, ル",
  "pt": "reter / permanecer",
  "type": "kanji",
  "hint": "N2 Jōyō · documentos e imigração. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "留"
  ],
  "jlpt": "N2",
  "group": "documentos e imigração",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "リュウ, ル",
  "kunyomi": "と",
  "strokes": "10",
  "examples": [
    {
      "jp": "在留",
      "romaji": "zairyuu",
      "pt": "residência"
    },
    {
      "jp": "留学",
      "romaji": "ryuugaku",
      "pt": "intercâmbio"
    },
    {
      "jp": "留守",
      "romaji": "rusu",
      "pt": "ausência"
    }
  ]
},
{
  "id": "j_n2_37_5b88",
  "category": "kanji",
  "focus": "守",
  "jp": "守",
  "romaji": "シュ, ス",
  "pt": "proteger",
  "type": "kanji",
  "hint": "N2 Jōyō · documentos e imigração. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "守"
  ],
  "jlpt": "N2",
  "group": "documentos e imigração",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シュ, ス",
  "kunyomi": "まも",
  "strokes": "6",
  "examples": [
    {
      "jp": "守る",
      "romaji": "mamoru",
      "pt": "proteger"
    },
    {
      "jp": "留守",
      "romaji": "rusu",
      "pt": "ausência"
    },
    {
      "jp": "保守",
      "romaji": "hoshu",
      "pt": "conservação"
    }
  ]
},
{
  "id": "j_n2_37_4f01",
  "category": "kanji",
  "focus": "企",
  "jp": "企",
  "romaji": "キ",
  "pt": "planejar",
  "type": "kanji",
  "hint": "N2 Jōyō · empresa e documentos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "企"
  ],
  "jlpt": "N2",
  "group": "empresa e documentos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "キ",
  "kunyomi": "くわだ",
  "strokes": "6",
  "examples": [
    {
      "jp": "企業",
      "romaji": "kigyou",
      "pt": "empresa"
    },
    {
      "jp": "企画",
      "romaji": "kikaku",
      "pt": "planejamento"
    },
    {
      "jp": "企てる",
      "romaji": "kuwadateru",
      "pt": "planejar"
    }
  ]
},
{
  "id": "j_n2_37_9707",
  "category": "kanji",
  "focus": "震",
  "jp": "震",
  "romaji": "シン",
  "pt": "tremer / terremoto",
  "type": "kanji",
  "hint": "N2 Jōyō · desastres e avisos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "震"
  ],
  "jlpt": "N2",
  "group": "desastres e avisos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シン",
  "kunyomi": "ふる",
  "strokes": "15",
  "examples": [
    {
      "jp": "地震",
      "romaji": "jishin",
      "pt": "terremoto"
    },
    {
      "jp": "震える",
      "romaji": "furueru",
      "pt": "tremer"
    },
    {
      "jp": "震度",
      "romaji": "shindo",
      "pt": "intensidade sísmica"
    }
  ]
},
{
  "id": "j_n2_37_707d",
  "category": "kanji",
  "focus": "災",
  "jp": "災",
  "romaji": "サイ",
  "pt": "desastre",
  "type": "kanji",
  "hint": "N2 Jōyō · desastres e avisos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "災"
  ],
  "jlpt": "N2",
  "group": "desastres e avisos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "サイ",
  "kunyomi": "わざわ",
  "strokes": "7",
  "examples": [
    {
      "jp": "災害",
      "romaji": "saigai",
      "pt": "desastre"
    },
    {
      "jp": "火災",
      "romaji": "kasai",
      "pt": "incêndio"
    },
    {
      "jp": "防災",
      "romaji": "bousai",
      "pt": "prevenção de desastre"
    }
  ]
},
{
  "id": "j_n2_37_9632",
  "category": "kanji",
  "focus": "防",
  "jp": "防",
  "romaji": "ボウ",
  "pt": "prevenir / defender",
  "type": "kanji",
  "hint": "N2 Jōyō · desastres e avisos. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "防"
  ],
  "jlpt": "N2",
  "group": "desastres e avisos",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ボウ",
  "kunyomi": "ふせ",
  "strokes": "7",
  "examples": [
    {
      "jp": "防災",
      "romaji": "bousai",
      "pt": "prevenção de desastre"
    },
    {
      "jp": "予防",
      "romaji": "yobou",
      "pt": "prevenção"
    },
    {
      "jp": "防ぐ",
      "romaji": "fusegu",
      "pt": "prevenir"
    }
  ]
},
{
  "id": "j_n2_37_5c0e",
  "category": "kanji",
  "focus": "導",
  "jp": "導",
  "romaji": "ドウ",
  "pt": "guiar",
  "type": "kanji",
  "hint": "N2 Jōyō · sistemas e sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "導"
  ],
  "jlpt": "N2",
  "group": "sistemas e sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ドウ",
  "kunyomi": "みちび",
  "strokes": "15",
  "examples": [
    {
      "jp": "指導",
      "romaji": "shidou",
      "pt": "orientação"
    },
    {
      "jp": "導入",
      "romaji": "dounyuu",
      "pt": "introdução/implementação"
    },
    {
      "jp": "導く",
      "romaji": "michibiku",
      "pt": "guiar"
    }
  ]
},
{
  "id": "j_n2_37_6307",
  "category": "kanji",
  "focus": "指",
  "jp": "指",
  "romaji": "シ",
  "pt": "dedo / indicar",
  "type": "kanji",
  "hint": "N2 Jōyō · sistemas e sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "指"
  ],
  "jlpt": "N2",
  "group": "sistemas e sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シ",
  "kunyomi": "ゆび, さ",
  "strokes": "9",
  "examples": [
    {
      "jp": "指導",
      "romaji": "shidou",
      "pt": "orientação"
    },
    {
      "jp": "指",
      "romaji": "yubi",
      "pt": "dedo"
    },
    {
      "jp": "指示",
      "romaji": "shiji",
      "pt": "instrução"
    }
  ]
},
{
  "id": "j_n2_37_6b32",
  "category": "kanji",
  "focus": "欲",
  "jp": "欲",
  "romaji": "ヨク",
  "pt": "desejo",
  "type": "kanji",
  "hint": "N2 Jōyō · opinião e sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "欲"
  ],
  "jlpt": "N2",
  "group": "opinião e sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ヨク",
  "kunyomi": "ほ",
  "strokes": "11",
  "examples": [
    {
      "jp": "欲しい",
      "romaji": "hoshii",
      "pt": "querer"
    },
    {
      "jp": "欲望",
      "romaji": "yokubou",
      "pt": "desejo"
    },
    {
      "jp": "意欲",
      "romaji": "iyoku",
      "pt": "motivação"
    }
  ]
},
{
  "id": "j_n2_37_671b",
  "category": "kanji",
  "focus": "望",
  "jp": "望",
  "romaji": "ボウ, モウ",
  "pt": "esperança / desejo",
  "type": "kanji",
  "hint": "N2 Jōyō · opinião e sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "望"
  ],
  "jlpt": "N2",
  "group": "opinião e sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ボウ, モウ",
  "kunyomi": "のぞ",
  "strokes": "11",
  "examples": [
    {
      "jp": "希望",
      "romaji": "kibou",
      "pt": "esperança"
    },
    {
      "jp": "望む",
      "romaji": "nozomu",
      "pt": "desejar"
    },
    {
      "jp": "欲望",
      "romaji": "yokubou",
      "pt": "desejo"
    }
  ]
},
{
  "id": "j_n2_37_8a2a",
  "category": "kanji",
  "focus": "訪",
  "jp": "訪",
  "romaji": "ホウ",
  "pt": "visitar",
  "type": "kanji",
  "hint": "N2 Jōyō · sociedade e serviços. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "訪"
  ],
  "jlpt": "N2",
  "group": "sociedade e serviços",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ホウ",
  "kunyomi": "おとず, たず",
  "strokes": "11",
  "examples": [
    {
      "jp": "訪問",
      "romaji": "houmon",
      "pt": "visita"
    },
    {
      "jp": "訪れる",
      "romaji": "otozureru",
      "pt": "visitar/chegar"
    },
    {
      "jp": "来訪",
      "romaji": "raihou",
      "pt": "visita"
    }
  ]
},
{
  "id": "j_n2_37_554f",
  "category": "kanji",
  "focus": "問",
  "jp": "問",
  "romaji": "モン",
  "pt": "pergunta",
  "type": "kanji",
  "hint": "N2 Jōyō · sociedade e serviços. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "問"
  ],
  "jlpt": "N2",
  "group": "sociedade e serviços",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "モン",
  "kunyomi": "と",
  "strokes": "11",
  "examples": [
    {
      "jp": "質問",
      "romaji": "shitsumon",
      "pt": "pergunta"
    },
    {
      "jp": "訪問",
      "romaji": "houmon",
      "pt": "visita"
    },
    {
      "jp": "問題",
      "romaji": "mondai",
      "pt": "problema"
    }
  ]
},
{
  "id": "j_n2_37_8b58",
  "category": "kanji",
  "focus": "識",
  "jp": "識",
  "romaji": "シキ",
  "pt": "conhecimento",
  "type": "kanji",
  "hint": "N2 Jōyō · interpretação formal. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "識"
  ],
  "jlpt": "N2",
  "group": "interpretação formal",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シキ",
  "kunyomi": "",
  "strokes": "19",
  "examples": [
    {
      "jp": "知識",
      "romaji": "chishiki",
      "pt": "conhecimento"
    },
    {
      "jp": "意識",
      "romaji": "ishiki",
      "pt": "consciência"
    },
    {
      "jp": "常識",
      "romaji": "joushiki",
      "pt": "senso comum"
    }
  ]
},
{
  "id": "j_n2_37_8077",
  "category": "kanji",
  "focus": "職",
  "jp": "職",
  "romaji": "ショク",
  "pt": "profissão",
  "type": "kanji",
  "hint": "N2 Jōyō · trabalho avançado. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "職"
  ],
  "jlpt": "N2",
  "group": "trabalho avançado",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ショク",
  "kunyomi": "",
  "strokes": "18",
  "examples": [
    {
      "jp": "職場",
      "romaji": "shokuba",
      "pt": "local de trabalho"
    },
    {
      "jp": "就職",
      "romaji": "shuushoku",
      "pt": "emprego"
    },
    {
      "jp": "職員",
      "romaji": "shokuin",
      "pt": "funcionário"
    }
  ]
},
{
  "id": "j_n2_37_5c31",
  "category": "kanji",
  "focus": "就",
  "jp": "就",
  "romaji": "シュウ, ジュ",
  "pt": "assumir / conseguir emprego",
  "type": "kanji",
  "hint": "N2 Jōyō · trabalho avançado. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "就"
  ],
  "jlpt": "N2",
  "group": "trabalho avançado",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シュウ, ジュ",
  "kunyomi": "つ",
  "strokes": "12",
  "examples": [
    {
      "jp": "就職",
      "romaji": "shuushoku",
      "pt": "conseguir emprego"
    },
    {
      "jp": "就く",
      "romaji": "tsuku",
      "pt": "assumir cargo"
    },
    {
      "jp": "就業",
      "romaji": "shuugyou",
      "pt": "trabalho"
    }
  ]
},
{
  "id": "j_n2_37_96c7",
  "category": "kanji",
  "focus": "雇",
  "jp": "雇",
  "romaji": "コ",
  "pt": "empregar",
  "type": "kanji",
  "hint": "N2 Jōyō · trabalho avançado. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "雇"
  ],
  "jlpt": "N2",
  "group": "trabalho avançado",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "コ",
  "kunyomi": "やと",
  "strokes": "12",
  "examples": [
    {
      "jp": "雇用",
      "romaji": "koyou",
      "pt": "emprego/contratação"
    },
    {
      "jp": "雇う",
      "romaji": "yatou",
      "pt": "contratar"
    },
    {
      "jp": "解雇",
      "romaji": "kaiko",
      "pt": "demissão"
    }
  ]
},
{
  "id": "j_n2_37_5951",
  "category": "kanji",
  "focus": "契",
  "jp": "契",
  "romaji": "ケイ",
  "pt": "contrato",
  "type": "kanji",
  "hint": "N2 Jōyō · trabalho avançado. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "契"
  ],
  "jlpt": "N2",
  "group": "trabalho avançado",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ケイ",
  "kunyomi": "ちぎ",
  "strokes": "9",
  "examples": [
    {
      "jp": "契約",
      "romaji": "keiyaku",
      "pt": "contrato"
    },
    {
      "jp": "契約書",
      "romaji": "keiyakusho",
      "pt": "contrato escrito"
    },
    {
      "jp": "契機",
      "romaji": "keiki",
      "pt": "gatilho/oportunidade"
    }
  ]
},
{
  "id": "j_n2_37_7d04",
  "category": "kanji",
  "focus": "約",
  "jp": "約",
  "romaji": "ヤク",
  "pt": "contrato / promessa",
  "type": "kanji",
  "hint": "N2 Jōyō · trabalho avançado. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "約"
  ],
  "jlpt": "N2",
  "group": "trabalho avançado",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ヤク",
  "kunyomi": "",
  "strokes": "9",
  "examples": [
    {
      "jp": "契約",
      "romaji": "keiyaku",
      "pt": "contrato"
    },
    {
      "jp": "予約",
      "romaji": "yoyaku",
      "pt": "reserva"
    },
    {
      "jp": "約束",
      "romaji": "yakusoku",
      "pt": "promessa"
    }
  ]
},
{
  "id": "j_n1_37_5f59",
  "category": "kanji",
  "focus": "彙",
  "jp": "彙",
  "romaji": "イ",
  "pt": "vocabulário / coletânea",
  "type": "kanji",
  "hint": "N1 Jōyō · fluência e erudição. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "彙"
  ],
  "jlpt": "N1",
  "group": "fluência e erudição",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "イ",
  "kunyomi": "",
  "strokes": "13",
  "examples": [
    {
      "jp": "語彙",
      "romaji": "goi",
      "pt": "vocabulário"
    },
    {
      "jp": "語彙力",
      "romaji": "goiryoku",
      "pt": "capacidade vocabular"
    },
    {
      "jp": "彙報",
      "romaji": "ihou",
      "pt": "boletim"
    }
  ]
},
{
  "id": "j_n1_37_50b2",
  "category": "kanji",
  "focus": "傲",
  "jp": "傲",
  "romaji": "ゴウ",
  "pt": "orgulho / arrogância",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e nuance. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "傲"
  ],
  "jlpt": "N1",
  "group": "literatura e nuance",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ゴウ",
  "kunyomi": "おご",
  "strokes": "13",
  "examples": [
    {
      "jp": "傲慢",
      "romaji": "gouman",
      "pt": "arrogante"
    },
    {
      "jp": "傲る",
      "romaji": "ogoru",
      "pt": "ser arrogante"
    },
    {
      "jp": "傲岸",
      "romaji": "gougan",
      "pt": "altivo/arrogante"
    }
  ]
},
{
  "id": "j_n1_37_6162",
  "category": "kanji",
  "focus": "慢",
  "jp": "慢",
  "romaji": "マン",
  "pt": "orgulho / negligência",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e nuance. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "慢"
  ],
  "jlpt": "N1",
  "group": "literatura e nuance",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "マン",
  "kunyomi": "",
  "strokes": "14",
  "examples": [
    {
      "jp": "傲慢",
      "romaji": "gouman",
      "pt": "arrogante"
    },
    {
      "jp": "我慢",
      "romaji": "gaman",
      "pt": "paciência"
    },
    {
      "jp": "慢性",
      "romaji": "mansei",
      "pt": "crônico"
    }
  ]
},
{
  "id": "j_n1_37_75d5",
  "category": "kanji",
  "focus": "痕",
  "jp": "痕",
  "romaji": "コン",
  "pt": "marca / cicatriz",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e medicina. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "痕"
  ],
  "jlpt": "N1",
  "group": "literatura e medicina",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "コン",
  "kunyomi": "あと",
  "strokes": "11",
  "examples": [
    {
      "jp": "痕跡",
      "romaji": "konseki",
      "pt": "rastro/vestígio"
    },
    {
      "jp": "傷痕",
      "romaji": "kizuato",
      "pt": "cicatriz"
    },
    {
      "jp": "痕",
      "romaji": "ato",
      "pt": "marca"
    }
  ]
},
{
  "id": "j_n1_37_8de1",
  "category": "kanji",
  "focus": "跡",
  "jp": "跡",
  "romaji": "セキ",
  "pt": "marca / vestígio",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e medicina. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "跡"
  ],
  "jlpt": "N1",
  "group": "literatura e medicina",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "セキ",
  "kunyomi": "あと",
  "strokes": "13",
  "examples": [
    {
      "jp": "足跡",
      "romaji": "ashiato",
      "pt": "pegada"
    },
    {
      "jp": "跡",
      "romaji": "ato",
      "pt": "vestígio"
    },
    {
      "jp": "奇跡",
      "romaji": "kiseki",
      "pt": "milagre"
    }
  ]
},
{
  "id": "j_n1_37_8ab0",
  "category": "kanji",
  "focus": "誰",
  "jp": "誰",
  "romaji": "スイ",
  "pt": "quem",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e uso real. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "誰"
  ],
  "jlpt": "N1",
  "group": "literatura e uso real",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "スイ",
  "kunyomi": "だれ",
  "strokes": "15",
  "examples": [
    {
      "jp": "誰",
      "romaji": "dare",
      "pt": "quem"
    },
    {
      "jp": "誰か",
      "romaji": "dareka",
      "pt": "alguém"
    },
    {
      "jp": "誰でも",
      "romaji": "dare demo",
      "pt": "qualquer pessoa"
    }
  ]
},
{
  "id": "j_n1_37_65ac",
  "category": "kanji",
  "focus": "斬",
  "jp": "斬",
  "romaji": "ザン",
  "pt": "cortar / inovar",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e força. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "斬"
  ],
  "jlpt": "N1",
  "group": "literatura e força",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ザン",
  "kunyomi": "き",
  "strokes": "11",
  "examples": [
    {
      "jp": "斬新",
      "romaji": "zanshin",
      "pt": "inovador"
    },
    {
      "jp": "斬る",
      "romaji": "kiru",
      "pt": "cortar com lâmina"
    },
    {
      "jp": "一刀両断",
      "romaji": "ittou ryoudan",
      "pt": "cortar de uma vez"
    }
  ]
},
{
  "id": "j_n1_37_8c8c",
  "category": "kanji",
  "focus": "貌",
  "jp": "貌",
  "romaji": "ボウ",
  "pt": "aparência",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e nuance. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "貌"
  ],
  "jlpt": "N1",
  "group": "literatura e nuance",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ボウ",
  "kunyomi": "",
  "strokes": "14",
  "examples": [
    {
      "jp": "容貌",
      "romaji": "youbou",
      "pt": "aparência"
    },
    {
      "jp": "全貌",
      "romaji": "zenbou",
      "pt": "visão completa"
    },
    {
      "jp": "美貌",
      "romaji": "bibou",
      "pt": "beleza facial"
    }
  ]
},
{
  "id": "j_n1_37_74a7",
  "category": "kanji",
  "focus": "璧",
  "jp": "璧",
  "romaji": "ヘキ",
  "pt": "joia / perfeição",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e erudição. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "璧"
  ],
  "jlpt": "N1",
  "group": "literatura e erudição",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ヘキ",
  "kunyomi": "",
  "strokes": "18",
  "examples": [
    {
      "jp": "完璧",
      "romaji": "kanpeki",
      "pt": "perfeito"
    },
    {
      "jp": "璧",
      "romaji": "heki",
      "pt": "joia esférica"
    },
    {
      "jp": "双璧",
      "romaji": "souheki",
      "pt": "duas maiores excelências"
    }
  ]
},
{
  "id": "j_n1_37_9b31",
  "category": "kanji",
  "focus": "鬱",
  "jp": "鬱",
  "romaji": "ウツ",
  "pt": "melancolia / depressão",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e medicina. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "鬱"
  ],
  "jlpt": "N1",
  "group": "literatura e medicina",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ウツ",
  "kunyomi": "",
  "strokes": "29",
  "examples": [
    {
      "jp": "憂鬱",
      "romaji": "yuuutsu",
      "pt": "melancolia"
    },
    {
      "jp": "鬱病",
      "romaji": "utsubyou",
      "pt": "depressão"
    },
    {
      "jp": "鬱陶しい",
      "romaji": "uttoushii",
      "pt": "irritante/sufocante"
    }
  ]
},
{
  "id": "j_n1_37_983b",
  "category": "kanji",
  "focus": "頻",
  "jp": "頻",
  "romaji": "ヒン",
  "pt": "frequente",
  "type": "kanji",
  "hint": "N1 Jōyō · notícias e leitura densa. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "頻"
  ],
  "jlpt": "N1",
  "group": "notícias e leitura densa",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ヒン",
  "kunyomi": "",
  "strokes": "17",
  "examples": [
    {
      "jp": "頻繁",
      "romaji": "hinpan",
      "pt": "frequente"
    },
    {
      "jp": "頻度",
      "romaji": "hindo",
      "pt": "frequência"
    },
    {
      "jp": "頻発",
      "romaji": "hinpatsu",
      "pt": "ocorrência frequente"
    }
  ]
},
{
  "id": "j_n1_37_51dd",
  "category": "kanji",
  "focus": "凝",
  "jp": "凝",
  "romaji": "ギョウ",
  "pt": "concentrar / endurecer",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e nuance. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "凝"
  ],
  "jlpt": "N1",
  "group": "literatura e nuance",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ギョウ",
  "kunyomi": "こ",
  "strokes": "16",
  "examples": [
    {
      "jp": "凝る",
      "romaji": "koru",
      "pt": "dedicar-se/endurecer"
    },
    {
      "jp": "凝縮",
      "romaji": "gyoushuku",
      "pt": "condensação"
    },
    {
      "jp": "肩が凝る",
      "romaji": "kata ga koru",
      "pt": "ombro rígido"
    }
  ]
},
{
  "id": "j_n1_37_7e2e",
  "category": "kanji",
  "focus": "縮",
  "jp": "縮",
  "romaji": "シュク",
  "pt": "encolher / condensar",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e nuance. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "縮"
  ],
  "jlpt": "N1",
  "group": "literatura e nuance",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シュク",
  "kunyomi": "ちぢ",
  "strokes": "17",
  "examples": [
    {
      "jp": "縮む",
      "romaji": "chijimu",
      "pt": "encolher"
    },
    {
      "jp": "凝縮",
      "romaji": "gyoushuku",
      "pt": "condensação"
    },
    {
      "jp": "短縮",
      "romaji": "tanshuku",
      "pt": "encurtamento"
    }
  ]
},
{
  "id": "j_n1_37_62ec",
  "category": "kanji",
  "focus": "括",
  "jp": "括",
  "romaji": "カツ",
  "pt": "agrupar / amarrar",
  "type": "kanji",
  "hint": "N1 Jōyō · acadêmico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "括"
  ],
  "jlpt": "N1",
  "group": "acadêmico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カツ",
  "kunyomi": "くく",
  "strokes": "9",
  "examples": [
    {
      "jp": "一括",
      "romaji": "ikkatsu",
      "pt": "em lote"
    },
    {
      "jp": "包括",
      "romaji": "houkatsu",
      "pt": "abrangente"
    },
    {
      "jp": "括弧",
      "romaji": "kakko",
      "pt": "parênteses"
    }
  ]
},
{
  "id": "j_n1_37_7db2",
  "category": "kanji",
  "focus": "網",
  "jp": "網",
  "romaji": "モウ",
  "pt": "rede",
  "type": "kanji",
  "hint": "N1 Jōyō · acadêmico e sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "網"
  ],
  "jlpt": "N1",
  "group": "acadêmico e sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "モウ",
  "kunyomi": "あみ",
  "strokes": "14",
  "examples": [
    {
      "jp": "通信網",
      "romaji": "tsuushinmou",
      "pt": "rede de comunicação"
    },
    {
      "jp": "網",
      "romaji": "ami",
      "pt": "rede"
    },
    {
      "jp": "交通網",
      "romaji": "koutsuumou",
      "pt": "rede de transporte"
    }
  ]
},
{
  "id": "j_n1_37_7f85",
  "category": "kanji",
  "focus": "羅",
  "jp": "羅",
  "romaji": "ラ",
  "pt": "rede / alinhamento",
  "type": "kanji",
  "hint": "N1 Jōyō · acadêmico e sociedade. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "羅"
  ],
  "jlpt": "N1",
  "group": "acadêmico e sociedade",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ラ",
  "kunyomi": "",
  "strokes": "19",
  "examples": [
    {
      "jp": "網羅",
      "romaji": "moura",
      "pt": "cobertura completa"
    },
    {
      "jp": "羅列",
      "romaji": "raretsu",
      "pt": "enumeração"
    },
    {
      "jp": "羅針盤",
      "romaji": "rashinban",
      "pt": "bússola"
    }
  ]
},
{
  "id": "j_n1_37_8010",
  "category": "kanji",
  "focus": "耐",
  "jp": "耐",
  "romaji": "タイ",
  "pt": "resistir",
  "type": "kanji",
  "hint": "N1 Jōyō · técnico e médico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "耐"
  ],
  "jlpt": "N1",
  "group": "técnico e médico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "タイ",
  "kunyomi": "た",
  "strokes": "9",
  "examples": [
    {
      "jp": "耐える",
      "romaji": "taeru",
      "pt": "resistir"
    },
    {
      "jp": "耐久",
      "romaji": "taikyuu",
      "pt": "durabilidade"
    },
    {
      "jp": "忍耐",
      "romaji": "nintai",
      "pt": "paciência"
    }
  ]
},
{
  "id": "j_n1_37_5fcd",
  "category": "kanji",
  "focus": "忍",
  "jp": "忍",
  "romaji": "ニン",
  "pt": "suportar",
  "type": "kanji",
  "hint": "N1 Jōyō · técnico e médico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "忍"
  ],
  "jlpt": "N1",
  "group": "técnico e médico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ニン",
  "kunyomi": "しの",
  "strokes": "7",
  "examples": [
    {
      "jp": "忍耐",
      "romaji": "nintai",
      "pt": "paciência"
    },
    {
      "jp": "忍ぶ",
      "romaji": "shinobu",
      "pt": "suportar/ocultar-se"
    },
    {
      "jp": "忍者",
      "romaji": "ninja",
      "pt": "ninja"
    }
  ]
},
{
  "id": "j_n1_37_75c7",
  "category": "kanji",
  "focus": "症",
  "jp": "症",
  "romaji": "ショウ",
  "pt": "sintoma",
  "type": "kanji",
  "hint": "N1 Jōyō · médico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "症"
  ],
  "jlpt": "N1",
  "group": "médico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ショウ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "症状",
      "romaji": "shoujou",
      "pt": "sintoma"
    },
    {
      "jp": "花粉症",
      "romaji": "kafunshou",
      "pt": "alergia ao pólen"
    },
    {
      "jp": "重症",
      "romaji": "juushou",
      "pt": "caso grave"
    }
  ]
},
{
  "id": "j_n1_37_60a3",
  "category": "kanji",
  "focus": "患",
  "jp": "患",
  "romaji": "カン",
  "pt": "doente / sofrer",
  "type": "kanji",
  "hint": "N1 Jōyō · médico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "患"
  ],
  "jlpt": "N1",
  "group": "médico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カン",
  "kunyomi": "わずら",
  "strokes": "11",
  "examples": [
    {
      "jp": "患者",
      "romaji": "kanja",
      "pt": "paciente"
    },
    {
      "jp": "患う",
      "romaji": "wazurau",
      "pt": "adoecer"
    },
    {
      "jp": "疾患",
      "romaji": "shikkan",
      "pt": "doença"
    }
  ]
},
{
  "id": "j_n1_37_75be",
  "category": "kanji",
  "focus": "疾",
  "jp": "疾",
  "romaji": "シツ",
  "pt": "doença rápida",
  "type": "kanji",
  "hint": "N1 Jōyō · médico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "疾"
  ],
  "jlpt": "N1",
  "group": "médico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "シツ",
  "kunyomi": "",
  "strokes": "10",
  "examples": [
    {
      "jp": "疾患",
      "romaji": "shikkan",
      "pt": "doença"
    },
    {
      "jp": "疾走",
      "romaji": "shissou",
      "pt": "corrida veloz"
    },
    {
      "jp": "疾風",
      "romaji": "shippuu",
      "pt": "vento forte"
    }
  ]
},
{
  "id": "j_n1_37_7de9",
  "category": "kanji",
  "focus": "緩",
  "jp": "緩",
  "romaji": "カン",
  "pt": "afrouxar",
  "type": "kanji",
  "hint": "N1 Jōyō · formal e técnico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "緩"
  ],
  "jlpt": "N1",
  "group": "formal e técnico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カン",
  "kunyomi": "ゆる",
  "strokes": "15",
  "examples": [
    {
      "jp": "緩い",
      "romaji": "yurui",
      "pt": "frouxo"
    },
    {
      "jp": "緩和",
      "romaji": "kanwa",
      "pt": "alívio/relaxamento"
    },
    {
      "jp": "規制緩和",
      "romaji": "kisei kanwa",
      "pt": "desregulação"
    }
  ]
},
{
  "id": "j_n1_37_548c",
  "category": "kanji",
  "focus": "和",
  "jp": "和",
  "romaji": "ワ",
  "pt": "harmonia / suavizar",
  "type": "kanji",
  "hint": "N1 Jōyō · formal e técnico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "和"
  ],
  "jlpt": "N1",
  "group": "formal e técnico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ワ",
  "kunyomi": "やわ",
  "strokes": "8",
  "examples": [
    {
      "jp": "緩和",
      "romaji": "kanwa",
      "pt": "alívio"
    },
    {
      "jp": "平和",
      "romaji": "heiwa",
      "pt": "paz"
    },
    {
      "jp": "和食",
      "romaji": "washoku",
      "pt": "comida japonesa"
    }
  ]
},
{
  "id": "j_n1_37_790e",
  "category": "kanji",
  "focus": "礎",
  "jp": "礎",
  "romaji": "ソ",
  "pt": "fundação",
  "type": "kanji",
  "hint": "N1 Jōyō · formal e técnico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "礎"
  ],
  "jlpt": "N1",
  "group": "formal e técnico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ソ",
  "kunyomi": "いしずえ",
  "strokes": "18",
  "examples": [
    {
      "jp": "基礎",
      "romaji": "kiso",
      "pt": "fundação/base"
    },
    {
      "jp": "礎",
      "romaji": "ishizue",
      "pt": "alicerce"
    },
    {
      "jp": "礎石",
      "romaji": "soseki",
      "pt": "pedra fundamental"
    }
  ]
},
{
  "id": "j_n1_37_66a6",
  "category": "kanji",
  "focus": "暦",
  "jp": "暦",
  "romaji": "レキ",
  "pt": "calendário",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e cotidiano. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "暦"
  ],
  "jlpt": "N1",
  "group": "literatura e cotidiano",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "レキ",
  "kunyomi": "こよみ",
  "strokes": "14",
  "examples": [
    {
      "jp": "暦",
      "romaji": "koyomi",
      "pt": "calendário"
    },
    {
      "jp": "西暦",
      "romaji": "seireki",
      "pt": "calendário ocidental"
    },
    {
      "jp": "旧暦",
      "romaji": "kyuureki",
      "pt": "calendário antigo"
    }
  ]
},
{
  "id": "j_n1_37_68da",
  "category": "kanji",
  "focus": "棚",
  "jp": "棚",
  "romaji": "ホウ",
  "pt": "prateleira",
  "type": "kanji",
  "hint": "N1 Jōyō · vida adulta avançada. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "棚"
  ],
  "jlpt": "N1",
  "group": "vida adulta avançada",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ホウ",
  "kunyomi": "たな",
  "strokes": "12",
  "examples": [
    {
      "jp": "棚",
      "romaji": "tana",
      "pt": "prateleira"
    },
    {
      "jp": "本棚",
      "romaji": "hondana",
      "pt": "estante de livros"
    },
    {
      "jp": "棚卸し",
      "romaji": "tanaoroshi",
      "pt": "inventário"
    }
  ]
},
{
  "id": "j_n1_37_6f64",
  "category": "kanji",
  "focus": "潤",
  "jp": "潤",
  "romaji": "ジュン",
  "pt": "umidade / enriquecer",
  "type": "kanji",
  "hint": "N1 Jōyō · literatura e negócios. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "潤"
  ],
  "jlpt": "N1",
  "group": "literatura e negócios",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "ジュン",
  "kunyomi": "うるお",
  "strokes": "15",
  "examples": [
    {
      "jp": "潤う",
      "romaji": "uruou",
      "pt": "ficar próspero/úmido"
    },
    {
      "jp": "潤滑油",
      "romaji": "junkatsuyu",
      "pt": "lubrificante"
    },
    {
      "jp": "利潤",
      "romaji": "rijun",
      "pt": "lucro"
    }
  ]
},
{
  "id": "j_n1_37_6ed1",
  "category": "kanji",
  "focus": "滑",
  "jp": "滑",
  "romaji": "カツ",
  "pt": "escorregar / suave",
  "type": "kanji",
  "hint": "N1 Jōyō · técnico. Kanji essencial para leitura, prova, escrita e interpretação.",
  "chars": [
    "滑"
  ],
  "jlpt": "N1",
  "group": "técnico",
  "memo": "Estude pelo sentido principal, reconheça em palavras reais e use a escrita para fixar.",
  "onyomi": "カツ",
  "kunyomi": "すべ, なめ",
  "strokes": "13",
  "examples": [
    {
      "jp": "滑る",
      "romaji": "suberu",
      "pt": "escorregar"
    },
    {
      "jp": "円滑",
      "romaji": "enkatsu",
      "pt": "suave/sem problemas"
    },
    {
      "jp": "潤滑油",
      "romaji": "junkatsuyu",
      "pt": "lubrificante"
    }
  ]
}];

  const KANA_STROKES = {
    "あ": { count: 3, note: "1 linha · 2 centro · 3 curva" },
    "い": { count: 2, note: "curva esquerda, curva direita" },
    "う": { count: 2, note: "traço curto superior, curva principal" },
    "え": { count: 2, note: "traço curto superior, linha quebrada" },
    "お": { count: 4, note: "linha, central, curva, traço pequeno" },
    "か": { count: 3, note: "traço lateral, curva, ponto final" },
    "き": { count: 4, note: "duas linhas, centro, curva final" },
    "さ": { count: 3, note: "linha, diagonal, curva final" },
    "ね": { count: 2, note: "vertical com curva, curva final" },
    "み": { count: 2, note: "curva principal, traço final" },
    "ア": { count: 2, note: "linha com queda, traço descendo" },
    "イ": { count: 2, note: "diagonal, vertical" },
    "ウ": { count: 3, note: "curto superior, linha, curva final" },
    "エ": { count: 3, note: "linha, central, inferior" },
    "オ": { count: 3, note: "horizontal, vertical, diagonal" },
    "カ": { count: 2, note: "diagonal/vertical, traço lateral" },
    "ー": { count: 1, note: "traço horizontal longo" },
    "ド": { count: 4, note: "ト + dois pequenos traços de som" },
    "コ": { count: 2, note: "linha/lateral, linha inferior" },
    "ン": { count: 2, note: "ponto curto, traço diagonal ascendente" },
    "ビ": { count: 4, note: "ヒ + dois pequenos traços de som" },
    "ニ": { count: 2, note: "linha e inferior" },
    "ス": { count: 2, note: "linha diagonal, corte final" },
    "パ": { count: 3, note: "ハ + círculo pequeno" },
    "ト": { count: 2, note: "vertical e traço diagonal" },
    "レ": { count: 1, note: "traço descendo e virando para a direita" },
    "バ": { count: 4, note: "ハ + dois pequenos traços de som" },
    "タ": { count: 3, note: "traço superior, corpo, diagonal final" },
    "ク": { count: 2, note: "traço curto superior e curva diagonal" },
    "シ": { count: 3, note: "dois pontos inclinados e traço ascendente" },
    "ピ": { count: 3, note: "ヒ + círculo pequeno" },
    "は": { count: 3, note: "vertical, curva lateral, traço horizontal" },
    "ひ": { count: 1, note: "traço único curvado" },
    "ふ": { count: 4, note: "ponto superior, curva central, dois pontos inferiores" },
    "へ": { count: 1, note: "traço único em forma de montanha" },
    "ほ": { count: 4, note: "vertical, duas linhas horizontais, curva final" },
    "ハ": { count: 2, note: "traço esquerdo, traço direito" },
    "ヒ": { count: 2, note: "vertical com curva, centro" },
    "フ": { count: 1, note: "traço angular descendo" },
    "ヘ": { count: 1, note: "traço em forma de montanha" },
    "ホ": { count: 4, note: "horizontal, vertical, diagonal esquerda, diagonal direita" },
    "ま": { count: 3, note: "duas linhas horizontais e curva final" },
    "む": { count: 3, note: "linha, curva central e laço final" },
    "め": { count: 2, note: "curva esquerda e curva longa" },
    "も": { count: 3, note: "duas linhas horizontais e curva vertical" },
    "マ": { count: 2, note: "linha angular superior e diagonal" },
    "ミ": { count: 3, note: "três traços curtos inclinados" },
    "ム": { count: 2, note: "diagonal principal e traço inferior" },
    "メ": { count: 2, note: "diagonal curta e diagonal longa" },
    "モ": { count: 3, note: "duas linhas horizontais e vertical curva" },
    "や": { count: 3, note: "traço superior, curva vertical, traço pequeno" },
    "ゆ": { count: 2, note: "curva ampla e centro" },
    "よ": { count: 2, note: "traço curto e curva inferior" },
    "ら": { count: 2, note: "traço superior e curva principal" },
    "り": { count: 2, note: "traço esquerdo e traço direito" },
    "る": { count: 1, note: "traço único curvado com laço" },
    "れ": { count: 2, note: "vertical com curva e traço final" },
    "ろ": { count: 1, note: "traço único curvado" },
    "ヤ": { count: 2, note: "traço superior angular e diagonal" },
    "ユ": { count: 2, note: "linha/lateral e linha inferior" },
    "ヨ": { count: 3, note: "três linhas com lateral direita" },
    "ラ": { count: 2, note: "linha e curva inferior" },
    "リ": { count: 2, note: "traço esquerdo e traço direito" },
    "ル": { count: 2, note: "vertical esquerda e curva direita" },
    "ロ": { count: 3, note: "lateral esquerda/topo, direita, base" },
    "わ": { count: 2, note: "vertical com curva e traço final amplo" },
    "を": { count: 3, note: "linha, curva central e curva final" },
    "ん": { count: 1, note: "traço único com curva final" },
    "ワ": { count: 2, note: "linha/lateral e diagonal final" },
    "ヲ": { count: 3, note: "duas linhas horizontais e diagonal final" }
  };

  const KANA_DRAWINGS = {
    "コ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M34 35 H84 V76", label: "linha e lateral direita", start: [34, 35] },
        { d: "M35 82 H85", label: "linha inferior", start: [35, 82] }
      ]
    },
    "ン": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M42 45 L55 53", label: "ponto/traço curto", start: [42, 45] },
        { d: "M39 84 C61 78, 78 65, 89 40", label: "traço diagonal ascendente", start: [39, 84] }
      ]
    },
    "ビ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M43 32 V87 C58 87, 73 82, 85 72", label: "forma base do ヒ", start: [43, 32] },
        { d: "M43 61 C58 60, 70 58, 82 54", label: "centro", start: [43, 61] },
        { d: "M74 28 L82 36", label: "dakuten 1", start: [74, 28] },
        { d: "M88 27 L96 35", label: "dakuten 2", start: [88, 27] }
      ]
    },
    "ニ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M38 42 H83", label: "linha", start: [38, 42] },
        { d: "M32 82 H90", label: "linha inferior", start: [32, 82] }
      ]
    },
    "ス": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M36 35 C52 33, 68 33, 84 36 C77 55, 62 78, 39 92", label: "linha principal curva", start: [36, 35] },
        { d: "M62 61 C72 70, 80 78, 88 90", label: "traço final", start: [62, 61] }
      ]
    },
    "ー": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M28 61 H92", label: "traço horizontal longo", start: [28, 61] }
      ]
    },
    "パ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M46 38 C43 58, 38 76, 30 91", label: "lado esquerdo do ハ", start: [46, 38] },
        { d: "M70 38 C78 56, 85 73, 91 91", label: "lado direito do ハ", start: [70, 38] },
        { d: "M82 24 C88 18, 99 22, 99 31 C99 40, 86 42, 82 34 C80 30, 80 27, 82 24", label: "círculo handakuten", start: [82, 24] }
      ]
    },
    "カ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M35 43 H83 C82 63, 78 80, 71 93", label: "linha com descida", start: [35, 43] },
        { d: "M61 27 C55 55, 45 77, 32 93", label: "diagonal esquerda", start: [61, 27] }
      ]
    },
    "ド": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M48 28 V94", label: "vertical", start: [48, 28] },
        { d: "M49 48 C63 53, 75 59, 87 68", label: "diagonal curta", start: [49, 48] },
        { d: "M72 27 L80 35", label: "dakuten 1", start: [72, 27] },
        { d: "M86 26 L94 34", label: "dakuten 2", start: [86, 26] }
      ]
    },
    "ト": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M48 28 V94", label: "vertical", start: [48, 28] },
        { d: "M49 48 C63 53, 75 59, 87 68", label: "diagonal curta", start: [49, 48] }
      ]
    },
    "イ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M84 28 C70 43, 55 56, 35 67", label: "diagonal principal", start: [84, 28] },
        { d: "M60 50 V96", label: "vertical", start: [60, 50] }
      ]
    },
    "レ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M46 30 V88 C61 84, 75 75, 88 60", label: "traço único", start: [46, 30] }
      ]
    },
    "バ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M46 38 C43 58, 38 76, 30 91", label: "lado esquerdo do ハ", start: [46, 38] },
        { d: "M70 38 C78 56, 85 73, 91 91", label: "lado direito do ハ", start: [70, 38] },
        { d: "M78 24 L86 32", label: "dakuten 1", start: [78, 24] },
        { d: "M91 23 L99 31", label: "dakuten 2", start: [91, 23] }
      ]
    },
    "タ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M54 27 C49 42, 41 55, 31 68", label: "traço superior esquerdo", start: [54, 27] },
        { d: "M50 39 H86 C80 65, 66 84, 42 96", label: "corpo principal", start: [50, 39] },
        { d: "M47 61 C57 65, 66 71, 74 79", label: "diagonal interna", start: [47, 61] }
      ]
    },
    "ク": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M55 28 C50 42, 42 55, 31 67", label: "traço curto superior", start: [55, 28] },
        { d: "M50 40 H86 C79 67, 63 86, 39 96", label: "curva diagonal", start: [50, 40] }
      ]
    },
    "シ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M43 38 L57 45", label: "ponto superior", start: [43, 38] },
        { d: "M37 59 L52 66", label: "ponto inferior", start: [37, 59] },
        { d: "M42 91 C63 84, 80 67, 91 42", label: "traço ascendente", start: [42, 91] }
      ]
    },
    "ピ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M43 32 V87 C58 87, 73 82, 85 72", label: "forma base do ヒ", start: [43, 32] },
        { d: "M43 61 C58 60, 70 58, 82 54", label: "centro", start: [43, 61] },
        { d: "M84 23 C90 17, 101 21, 101 30 C101 39, 88 41, 84 33 C82 29, 82 26, 84 23", label: "círculo handakuten", start: [84, 23] }
      ]
    },
    "あ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M34 42 C49 38, 66 38, 82 41", label: "linha", start: [34, 42] },
        { d: "M60 24 C61 36, 60 50, 58 64 C57 72, 57 79, 58 87", label: "centro", start: [60, 24] },
        { d: "M47 55 C37 61, 30 72, 31 84 C33 97, 46 106, 60 103 C75 99, 84 88, 86 73 C88 60, 82 49, 71 46 C61 44, 51 47, 44 55 C36 64, 34 77, 39 87 C45 99, 61 99, 71 91 C79 84, 80 73, 76 64 C72 55, 64 52, 58 56", label: "curva", start: [47, 55] }
      ]
    },
    "い": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M48 31 C43 45, 42 61, 46 74 C49 83, 54 89, 60 93", label: "curva esquerda", start: [48, 31] },
        { d: "M76 34 C82 48, 84 63, 83 77 C82 86, 79 92, 74 97", label: "curva direita", start: [76, 34] }
      ]
    },
    "う": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M49 31 C58 27, 68 28, 76 34", label: "traço curto superior", start: [49, 31] },
        { d: "M40 54 C52 49, 69 49, 79 55 C86 60, 86 69, 80 76 C73 85, 61 92, 47 92", label: "curva principal", start: [40, 54] }
      ]
    },
    "え": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M49 31 C59 27, 70 29, 78 35", label: "traço curto superior", start: [49, 31] },
        { d: "M37 53 C48 50, 61 50, 74 53 C67 60, 60 66, 53 72 C47 78, 42 85, 39 91 C49 85, 61 82, 74 84 C81 85, 87 88, 92 92", label: "linha quebrada e final", start: [37, 53] }
      ]
    },
    "お": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M34 41 C49 38, 68 38, 84 41", label: "linha", start: [34, 41] },
        { d: "M61 24 C61 37, 60 52, 59 67 C58 76, 58 84, 59 92", label: "centro", start: [61, 24] },
        { d: "M53 62 C44 65, 38 73, 39 82 C40 92, 51 98, 61 95 C71 92, 76 82, 74 72 C72 62, 63 58, 53 62", label: "curva inferior", start: [53, 62] },
        { d: "M74 52 C82 55, 89 59, 96 66", label: "traço pequeno direito", start: [74, 52] }
      ]
    }
  };
  const KANA_FAMILIES = {
    hiragana: [
      { key: "あ", letters: ["あ", "い", "う", "え", "お"] },
      { key: "か", letters: ["か", "き", "く", "け", "こ"] },
      { key: "さ", letters: ["さ", "し", "す", "せ", "そ"] },
      { key: "た", letters: ["た", "ち", "つ", "て", "と"] },
      { key: "な", letters: ["な", "に", "ぬ", "ね", "の"] },
      { key: "は", letters: ["は", "ひ", "ふ", "へ", "ほ"] },
      { key: "ま", letters: ["ま", "み", "む", "め", "も"] },
      { key: "や", letters: ["や", "ゆ", "よ"] },
      { key: "ら", letters: ["ら", "り", "る", "れ", "ろ"] },
      { key: "わ", letters: ["わ", "を"] },
      { key: "ん", letters: ["ん"] }
    ],
    katakana: [
      { key: "ア", letters: ["ア", "イ", "ウ", "エ", "オ"] },
      { key: "カ", letters: ["カ", "キ", "ク", "ケ", "コ"] },
      { key: "サ", letters: ["サ", "シ", "ス", "セ", "ソ"] },
      { key: "タ", letters: ["タ", "チ", "ツ", "テ", "ト"] },
      { key: "ナ", letters: ["ナ", "ニ", "ヌ", "ネ", "ノ"] },
      { key: "ハ", letters: ["ハ", "ヒ", "フ", "ヘ", "ホ"] },
      { key: "マ", letters: ["マ", "ミ", "ム", "メ", "モ"] },
      { key: "ヤ", letters: ["ヤ", "ユ", "ヨ"] },
      { key: "ラ", letters: ["ラ", "リ", "ル", "レ", "ロ"] },
      { key: "ワ", letters: ["ワ", "ヲ"] },
      { key: "ン", letters: ["ン"] }
    ]
  };



  let state = loadState();
  let category = state.category || "hiragana";
  let currentIndex = state.currentIndexByCategory?.[category] || 0;
  let screen = state.screen || "dashboard";
  try {
    const params = new URLSearchParams(window.location.search || "");
    const requestedScreen = params.get("screen");
    if (requestedScreen === "genial" || params.get("from") === "nihongo321") {
      screen = "genial";
      state.screen = "genial";
    } else if (requestedScreen === "dashboard") {
      screen = "dashboard";
      state.screen = "dashboard";
    }
  } catch { }
  // DIÁRIO321 4.10.21: ao abrir/recarregar, os menus começam fechados para uma tela mais organizada.
  let openMenu = "";
  try {
    const params = new URLSearchParams(window.location.search || "");
    const requestedArea = params.get("area");
    if (["hiragana", "katakana", "kanji"].includes(requestedArea)) {
      category = requestedArea;
      openMenu = requestedArea;
      state.category = requestedArea;
      currentIndex = state.currentIndexByCategory?.[category] || 0;
    }
  } catch { }
  let selectedFocus = state.selectedFocus || {};
  let selectedFamily = state.selectedFamily || { hiragana: "あ", katakana: "ア" };
  let selectedKanjiLevel = state.selectedKanjiLevel || "N5";
  let selectedKanjiGroup = state.selectedKanjiGroup || "tempo e natureza";
  let drawingStrokes = [];
  let currentStroke = [];
  let drawingSnapshot = null;
  let activeHintChar = null;
  let paperTone = state.paperTone || "paper";
  let writingAssist = state.writingAssist || { smoothLevel: 1, ending: "normal" };
  let appTheme = state.appTheme || localStorage.getItem("nihongo321_theme") || "dark";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        category: "hiragana",
        currentIndexByCategory: {},
        screen: "dashboard",
        progress: {},
        paperTone: "paper",
        writingAssist: { smoothLevel: 1, ending: "normal" },
        openMenu: "",
        selectedFocus: {},
        selectedFamily: { hiragana: "あ", katakana: "ア" },
        appTheme: "dark",
        appTheme: "dark",
        selectedFamily: { hiragana: "あ", katakana: "ア" }
      };
    } catch {
      return {
        category: "hiragana",
        currentIndexByCategory: {},
        screen: "dashboard",
        progress: {},
        paperTone: "paper",
        writingAssist: { smoothLevel: 1, ending: "normal" },
        openMenu: "",
        selectedFocus: {}
      };
    }
  }

  function saveState() {
    state.category = category;
    state.currentIndexByCategory ||= {};
    state.currentIndexByCategory[category] = currentIndex;
    state.screen = screen;
    state.paperTone = paperTone;
    state.writingAssist = writingAssist;
    state.openMenu = openMenu;
    state.selectedFocus = selectedFocus;
    state.selectedFamily = selectedFamily;
    state.selectedKanjiLevel = selectedKanjiLevel;
    state.selectedKanjiGroup = selectedKanjiGroup;
    state.appTheme = appTheme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  const categoryWords = (cat = category) => WORDS.filter(w => w.category === cat);
  const currentWord = () => categoryWords()[currentIndex] || categoryWords()[0] || WORDS[0];
  const categoryLabel = (cat = category) => cat === "hiragana" ? "Hiragana" : cat === "katakana" ? "Katakana" : "Kanji";

  const FREE_KANA_FAMILIES = {
    hiragana: ["あ", "か", "さ"],
    katakana: ["ア", "カ", "サ"]
  };

  const GENIAL_FREE_PHRASE_LIMIT = 7;

  function cadernoHasPremiumAccess() {
    try {
      if (localStorage.getItem("caderno321_premium") === "true") return true;
      if (localStorage.getItem("CADERNO321_PREMIUM") === "true") return true;
      if (localStorage.getItem("nihongo321_premium") === "true") return true;
      const nihongoState = JSON.parse(localStorage.getItem("jp_105x_v7") || "{}");
      return !!nihongoState?.monetization?.premiumUnlocked;
    } catch { return false; }
  }
  function isKanaCategory(cat) { return cat === "hiragana" || cat === "katakana"; }
  function isFreeKanaFamily(cat, family) { return !isKanaCategory(cat) || (FREE_KANA_FAMILIES[cat] || []).includes(family); }
  function isFamilyPremiumLocked(cat, family) { return isKanaCategory(cat) && !cadernoHasPremiumAccess() && !isFreeKanaFamily(cat, family); }
  function isKanjiPremiumLocked() { return !cadernoHasPremiumAccess(); }
  function familyForFocus(cat, focus) { return ((KANA_FAMILIES[cat] || []).find(item => (item.letters || []).includes(focus)) || {}).key || ""; }
  function showCadernoPremiumMessage(kind = "family") {
    if (kind === "genial") {
      toast("Você atingiu o seu limite grátis de frases. Adquira o Premium para continuar criando frases no Diário Genial.");
      return;
    }
    if (kind === "kanji") {
      toast("Kanji é área Premium. Assine para desbloquear os níveis N5, N4, N3, N2 e N1.");
      return;
    }
    toast("Esta família faz parte do Premium. No grátis, treine as famílias A, KA e SA para sentir o gosto da escrita japonesa pelo celular.");
  }

  function uid(prefix = "id") {
    try {
      if (window.crypto?.randomUUID) {
        return `${prefix}_${window.crypto.randomUUID()}`;
      }
    } catch {}
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function isGenialBridgePhrase(item) {
    return ["CADERNO321 Diário Genial", "DIÁRIO321 Diário Genial", "CADERNO321 Caderno Genial"].includes(String(item?.source || "")) || !!item?.caderno321?.romaji;
  }

  function genialSavedFreeCount() {
    return savedBridgePhrases().filter(isGenialBridgePhrase).length;
  }

  function genialFreeLimitReached() {
    return !cadernoHasPremiumAccess() && genialSavedFreeCount() >= GENIAL_FREE_PHRASE_LIMIT;
  }
  function normalizeGenialDetails() {
    const details = genialState.details || {};
    return { words: String(details.words || "").trim(), particles: String(details.particles || "").trim(), explanation: String(details.explanation || "").trim(), situation: String(details.situation || "").trim() };
  }
  function parseGenialWords(details = normalizeGenialDetails()) {
    if (!details.words) return [];
    return details.words.split(/[;,\n]/).map(part => part.trim()).filter(Boolean).map(part => {
      const [jp, pt = ""] = part.split("=").map(x => String(x || "").trim());
      return { jp, pt };
    }).filter(item => item.jp);
  }
  function formatGenialDetailsText(details = normalizeGenialDetails()) {
    const lines = [];
    if (details.words) lines.push(`Palavras importantes: ${details.words}`);
    if (details.particles) lines.push(`Partículas usadas: ${details.particles}`);
    if (details.explanation) lines.push(`Explicação curta: ${details.explanation}`);
    if (details.situation) lines.push(`Situação de uso: ${details.situation}`);
    return lines.join("\n");
  }


  function progressFor(word) {
    state.progress ||= {};
    state.progress[word.id] ||= { correct:0, incorrect:0, attempts:0, lastResult:null };
    return state.progress[word.id];
  }

  function wordStatus(progress) {
    const c = progress.correct || 0;
    if (c >= 7) return "familiarizada";
    if (c >= 4) return "quase familiar";
    if (c >= 1) return "em treino";
    return "nova";
  }

  function totalStats(cat = category) {
    const list = categoryWords(cat).map(w => progressFor(w));
    return {
      total: list.length,
      familiar: list.filter(p => (p.correct || 0) >= 7).length,
      correct: list.reduce((s,p) => s + (p.correct || 0), 0),
      review: list.filter(p => (p.incorrect || 0) > 0 && (p.correct || 0) < 7).length
    };
  }

  function focusStats(cat = category) {
    const map = {};
    categoryWords(cat).forEach(w => {
      if (!w.focus) return;
      map[w.focus] ||= { total:0, correctWords:0, words:[] };
      map[w.focus].total += 1;
      map[w.focus].words.push(w);
      if ((progressFor(w).correct || 0) >= 1) map[w.focus].correctWords += 1;
    });
    return map;
  }

  function countLabel(done, total) {
    if (total > 7) return `${done}/${total}`;
    return `${done}/${total}`;
  }

  function setScreen(next) {
    if (next === "dashboard") {
      screen = "dashboard";
      saveState();
      render();
      scrollTopSoon();
      return;
    }

    if (next === "write") {
      drawingStrokes = [];
      currentStroke = [];
      drawingSnapshot = null;
      activeHintChar = null;
    }

    if (next === "check") {
      captureCanvasSnapshot();
      activeHintChar = null;
    }

    screen = next;
    saveState();
    render();
  }

  function toggleMenu(cat) {
    openMenu = openMenu === cat ? "" : cat;
    category = cat;
    currentIndex = state.currentIndexByCategory?.[category] || 0;
    screen = "dashboard";
    saveState();
    render();
    scrollTopSoon();
  }

  function selectFamily(cat, family) {
    if (isFamilyPremiumLocked(cat, family)) { showCadernoPremiumMessage("family"); return; }
    selectedFamily[cat] = family;
    const familyData = (KANA_FAMILIES[cat] || []).find(item => item.key === family);
    const firstAvailableLetter = (familyData?.letters || []).find(letter =>
      categoryWords(cat).some(word => word.focus === letter)
    ) || familyData?.letters?.[0] || "";

    if (firstAvailableLetter) selectedFocus[cat] = firstAvailableLetter;

    category = cat;
    openMenu = cat;
    saveState();
    render();
  }

  function selectFocus(cat, focus) {
    const focusFamily = familyForFocus(cat, focus);
    if (isFamilyPremiumLocked(cat, focusFamily)) { showCadernoPremiumMessage("family"); return; }
    selectedFocus[cat] = focus;
    category = cat;
    openMenu = cat;
    saveState();
    render();
  }

  function startWordById(id) {
    const word = WORDS.find(w => w.id === id);
    if (!word) return;
    if (word.category === "kanji" && isKanjiPremiumLocked()) { showCadernoPremiumMessage("kanji"); return; }
    const focusFamily = familyForFocus(word.category, word.focus);
    if (isFamilyPremiumLocked(word.category, focusFamily)) { showCadernoPremiumMessage("family"); return; }
    category = word.category;
    const list = categoryWords(category);
    currentIndex = Math.max(0, list.findIndex(w => w.id === id));
    openMenu = category;
    screen = "see";
    drawingStrokes = [];
    currentStroke = [];
    drawingSnapshot = null;
    activeHintChar = null;
    saveState();
    render();
    scrollTopSoon();
  }

  function nextWord() {
    if (category === "kanji" && isKanjiPremiumLocked()) { showCadernoPremiumMessage("kanji"); setScreen("dashboard"); return; }
    const list = categoryWords().filter(word => !(word.category === "kanji" && isKanjiPremiumLocked()));
    if (!list.length) { setScreen("dashboard"); return; }
    currentIndex = (currentIndex + 1) % list.length;
    screen = "see";
    drawingStrokes = [];
    currentStroke = [];
    drawingSnapshot = null;
    activeHintChar = null;
    saveState();
    render();
    scrollTopSoon();
  }

  function speakWord() {
    const word = currentWord();
    try {
      if (!("speechSynthesis" in window)) return toast("áudio indisponível neste navegador");
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word.jp);
      utter.lang = "ja-JP";
      utter.rate = 0.72;
      utter.pitch = 1;
      speechSynthesis.speak(utter);
      toast(`${word.jp} = ${word.romaji}`);
    } catch {
      toast("não consegui tocar o áudio");
    }
  }

  function markResult(kind) {
    const word = currentWord();
    const p = progressFor(word);
    p.attempts = (p.attempts || 0) + 1;
    p.lastAt = Date.now();

    if (kind === "correct") {
      p.correct = Math.min(7, (p.correct || 0) + 1);
      p.lastResult = "correct";
      toast(p.correct >= 7 ? "palavra familiarizada" : `correto: ${p.correct}/7`);
    }

    if (kind === "incorrect") {
      p.incorrect = (p.incorrect || 0) + 1;
      p.lastResult = "incorrect";
      toast("marcado para revisar");
    }

    saveState();
    setTimeout(nextWord, 450);
  }

  function clearCanvas() {
    drawingStrokes = [];
    currentStroke = [];
    drawCanvas();
    toast("limpo");
  }

  function undoStroke() {
    drawingStrokes.pop();
    drawCanvas();
    toast("último traço removido");
  }

  function paperToneLabel() {
    if (paperTone === "paper") return "folha clara";
    if (paperTone === "greenboard") return "quadro verde";
    return "quadro negro";
  }

  function paperToneIcon() {
    if (paperTone === "paper") return "📄";
    if (paperTone === "greenboard") return "🟩";
    return "⬛";
  }

  function cyclePaperTone() {
    if (paperTone === "paper") paperTone = "greenboard";
    else if (paperTone === "greenboard") paperTone = "blackboard";
    else paperTone = "paper";

    saveState();
    render();
    toast(paperToneLabel());
  }

  function togglePaperTone() {
    cyclePaperTone();
  }

  function toast(message) {
    const box = document.querySelector("#toast");
    if (!box) return;
    box.textContent = message;
    box.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => box.classList.remove("on"), 1500);
  }

  function scrollTopSoon() {
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }

  function applyAppTheme() {
    document.documentElement.dataset.cadernoTheme = appTheme;
  }

  function toggleTheme() {
    appTheme = appTheme === "dark" ? "light" : "dark";
    try { localStorage.setItem("nihongo321_theme", appTheme); } catch {}
    applyAppTheme();
    saveState();
    render();
    toast(appTheme === "dark" ? "modo escuro" : "modo claro");
  }


  function normalizeWritingAssist() {
    const legacySmooth = writingAssist?.smooth !== false;
    const rawLevel = Number.isFinite(Number(writingAssist?.smoothLevel))
      ? Number(writingAssist.smoothLevel)
      : legacySmooth ? 1 : 0;
    const smoothLevel = Math.max(0, Math.min(5, Math.round(rawLevel)));
    const ending = ["normal", "haneru", "tomeru"].includes(writingAssist?.ending)
      ? writingAssist.ending
      : writingAssist?.haneru ? "haneru" : writingAssist?.tomeru ? "tomeru" : "normal";
    writingAssist = { smoothLevel, ending };
  }

  function toggleWritingAssist(tool) {
    normalizeWritingAssist();

    if (tool === "smooth") {
      writingAssist.smoothLevel = (Number(writingAssist.smoothLevel || 0) + 1) % 6;
      saveState();
      drawCanvas();
      const labels = ["sem suavizar", "suave 1", "suave 2", "suave 3", "suave 4", "autoforma ligada"];
      updateWritingAssistToolbar();
      toast(labels[writingAssist.smoothLevel] || "suavização ajustada");
      return;
    }

    if (tool === "haneru" || tool === "tomeru") {
      writingAssist.ending = writingAssist.ending === tool ? "normal" : tool;
      saveState();
      updateWritingAssistToolbar();
      drawCanvas();
      const labels = { normal: "final normal", haneru: "haneru ligado para o próximo traço", tomeru: "tomeru ligado para o próximo traço" };
      toast(labels[writingAssist.ending] || "final normal");
      return;
    }
  }

  function renderWritingAssistTools() {
    normalizeWritingAssist();
    const smoothLabels = ["Suave 0", "Suave 1", "Suave 2", "Suave 3", "Suave 4", "Auto"];
    const tools = [
      ["smooth", smoothLabels[writingAssist.smoothLevel] || "Suave 1"],
      ["haneru", writingAssist.ending === "haneru" ? "Haneru ON" : "Haneru"],
      ["tomeru", writingAssist.ending === "tomeru" ? "Tomeru ON" : "Tomeru"]
    ];
    return `
      <div class="writingAssistBar writingAssistBar--brush" aria-label="ajustes rápidos da escrita">
        ${tools.map(([key, label]) => {
          const active = key === "smooth" ? writingAssist.smoothLevel > 0 : writingAssist.ending === key;
          return `
            <button class="${active ? "is-active" : ""}" type="button" data-writing-assist="${key}" aria-pressed="${active ? "true" : "false"}">${label}</button>
          `;
        }).join("")}
      </div>
    `;
  }

  function updateWritingAssistToolbar() {
    normalizeWritingAssist();
    const smoothLabels = ["Suave 0", "Suave 1", "Suave 2", "Suave 3", "Suave 4", "Auto"];
    document.querySelectorAll("[data-writing-assist]").forEach(btn => {
      const key = btn.dataset.writingAssist || "";
      const active = key === "smooth" ? writingAssist.smoothLevel > 0 : writingAssist.ending === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (key === "smooth") btn.textContent = smoothLabels[writingAssist.smoothLevel] || "Suave 1";
      if (key === "haneru") btn.textContent = writingAssist.ending === "haneru" ? "Haneru ON" : "Haneru";
      if (key === "tomeru") btn.textContent = writingAssist.ending === "tomeru" ? "Tomeru ON" : "Tomeru";
    });
  }

  function setupCanvas() {
    const canvas = document.getElementById("writeCanvas");
    if (!canvas) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawCanvas();

    let drawing = false;
    let holdTimer = null;
    const cancelHoldTimer = () => {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
    };
    const scheduleAutoShape = () => {
      cancelHoldTimer();
      normalizeWritingAssist();
      if (writingAssist.smoothLevel < 5) return;
      if (!currentStroke || currentStroke.length < 8 || currentStroke._autoRefined) return;
      holdTimer = setTimeout(() => {
        if (!drawing || !currentStroke || currentStroke.length < 8 || currentStroke._autoRefined) return;
        currentStroke = smartHoldRefineStroke(currentStroke);
        try { currentStroke._autoRefined = true; } catch {}
        drawCanvas();
        toast("curva corrigida");
      }, 2000);
    };
    const getPoint = (event) => {
      const e = event.touches ? event.touches[0] : event;
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    function start(event) {
      event.preventDefault();
      drawing = true;
      currentStroke = [getPoint(event)];
      scheduleAutoShape();
      drawCanvas();
    }

    function move(event) {
      if (!drawing) return;
      event.preventDefault();
      const next = getPoint(event);
      const last = currentStroke[currentStroke.length - 1];
      if (!last || Math.hypot(next.x - last.x, next.y - last.y) >= 1.2) {
        currentStroke.push(next);
      }
      scheduleAutoShape();
      drawCanvas();
    }

    function end(event) {
      if (!drawing) return;
      event.preventDefault();
      cancelHoldTimer();
      drawing = false;
      normalizeWritingAssist();
      if (currentStroke.length > 1) {
        drawingStrokes.push({
          points: currentStroke.slice(),
          smoothLevel: writingAssist.smoothLevel,
          ending: writingAssist.ending || "normal"
        });
      }
      if (writingAssist.ending !== "normal") {
        writingAssist.ending = "normal";
        saveState();
        updateWritingAssistToolbar();
      }
      currentStroke = [];
      drawCanvas();
    }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive:false });
    canvas.addEventListener("touchmove", move, { passive:false });
    canvas.addEventListener("touchend", end, { passive:false });
  }

  function drawingStrokePoints(stroke) {
    if (Array.isArray(stroke)) return stroke;
    if (Array.isArray(stroke?.points)) return stroke.points;
    return [];
  }

  function pathLength(points = []) {
    let total = 0;
    for (let i = 1; i < points.length; i++) total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    return total;
  }

  function boundsForPoints(points = []) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      minX: Math.min(...xs), maxX: Math.max(...xs),
      minY: Math.min(...ys), maxY: Math.max(...ys),
      width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
      height: Math.max(1, Math.max(...ys) - Math.min(...ys))
    };
  }

  function smoothStrokePoints(points, level = 1, options = {}) {
    const mode = Math.max(0, Math.min(5, Math.round(Number(level) || 0)));
    if (!Array.isArray(points) || points.length < 3 || mode <= 0) return points;
    const clean = points.map(p => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));

    if (mode >= 5 || options.forceSmart) {
      const smart = smartShapeAssist(clean);
      if (smart && smart.length >= 2) return smart;
      return smoothOpenStroke(clean, 4);
    }

    return smoothOpenStroke(clean, mode);
  }

  function smoothOpenStroke(points = [], level = 1) {
    if (!Array.isArray(points) || points.length < 3) return points;
    const mode = Math.max(1, Math.min(4, Math.round(Number(level) || 1)));
    let out = points.map(p => ({ x: p.x, y: p.y }));

    // Níveis realmente progressivos:
    // 1 = quase cru, 4 = o melhor traço manual para dedo.
    const jitterByMode = { 1: 1.35, 2: 1.95, 3: 2.65, 4: 3.35 };
    const spacingByMode = { 1: 0, 2: 2.8, 3: 4.2, 4: 6.0 };
    out = removeJitterPoints(out, jitterByMode[mode] || 1.5);
    if (mode >= 2) out = resampleStrokePoints(out, spacingByMode[mode] || 3.0);

    const config = {
      1: { passes: 1, keep: 0.88 },
      2: { passes: 2, keep: 0.66 },
      3: { passes: 4, keep: 0.40 },
      4: { passes: 7, keep: 0.16 }
    }[mode];

    for (let pass = 0; pass < config.passes; pass++) {
      const next = [out[0]];
      for (let i = 1; i < out.length - 1; i++) {
        const prev = out[i - 1];
        const p = out[i];
        const nxt = out[i + 1];
        next.push({
          x: p.x * config.keep + (prev.x + nxt.x) * ((1 - config.keep) / 2),
          y: p.y * config.keep + (prev.y + nxt.y) * ((1 - config.keep) / 2)
        });
      }
      next.push(out[out.length - 1]);
      out = next;
    }

    if (mode >= 3 && out.length < 260) {
      out = chaikinStroke(out, mode === 3 ? 2 : 3);
    }

    if (mode === 3 && out.length >= 5) {
      out = roundSoftCorners(out, 0.16);
    }

    // Suave 4 recebe a melhor limpeza contínua do traço.
    if (mode === 4 && out.length >= 5) {
      out = roundSoftCorners(out, 0.30);
      out = resampleStrokePoints(out, 4.2);
      out = chaikinStroke(out, 1);
      out = roundSoftCorners(out, 0.22);
    }
    return out;
  }

  function removeJitterPoints(points = [], minDistance = 1.5) {
    if (!Array.isArray(points) || points.length < 3) return points;
    const out = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const prev = out[out.length - 1];
      const p = points[i];
      if (Math.hypot(p.x - prev.x, p.y - prev.y) >= minDistance) out.push(p);
    }
    out.push(points[points.length - 1]);
    return out;
  }

  function roundSoftCorners(points = [], amount = 0.18) {
    if (!Array.isArray(points) || points.length < 5) return points;
    const out = [points[0]];
    const a = Math.max(0.08, Math.min(0.28, amount));
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const p = points[i];
      const next = points[i + 1];
      out.push({
        x: p.x * (1 - a) + (prev.x + next.x) * (a / 2),
        y: p.y * (1 - a) + (prev.y + next.y) * (a / 2)
      });
    }
    out.push(points[points.length - 1]);
    return out;
  }

  function resampleStrokePoints(points = [], spacing = 3) {
    if (!Array.isArray(points) || points.length < 2) return points;
    const out = [points[0]];
    let carry = 0;
    for (let i = 1; i < points.length; i++) {
      let a = out[out.length - 1];
      const b = points[i];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);
      while (dist + carry >= spacing && dist > 0.001) {
        const t = (spacing - carry) / dist;
        const np = { x: a.x + dx * t, y: a.y + dy * t };
        out.push(np);
        a = np;
        dx = b.x - a.x;
        dy = b.y - a.y;
        dist = Math.hypot(dx, dy);
        carry = 0;
      }
      carry += dist;
    }
    const last = points[points.length - 1];
    const tail = out[out.length - 1];
    if (!tail || Math.hypot(last.x - tail.x, last.y - tail.y) > 0.5) out.push(last);
    return out;
  }

  function chaikinStroke(points = [], iterations = 1) {
    let out = points.map(p => ({ x: p.x, y: p.y }));
    for (let k = 0; k < iterations; k++) {
      if (out.length < 3) break;
      const next = [out[0]];
      for (let i = 0; i < out.length - 1; i++) {
        const p = out[i];
        const q = out[i + 1];
        next.push({ x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25 });
        next.push({ x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75 });
      }
      next.push(out[out.length - 1]);
      out = next;
    }
    return out;
  }

  function smartHoldRefineStroke(points = []) {
    if (!Array.isArray(points) || points.length < 8) return points;
    const clean = points.map(p => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
    const first = clean[0];
    const last = clean[clean.length - 1];
    const bounds = boundsForPoints(clean);
    const diag = Math.hypot(bounds.width, bounds.height);
    const len = pathLength(clean);
    const endDistance = Math.hypot(last.x - first.x, last.y - first.y);
    if (diag < 12 || len < 18) return smoothOpenStroke(clean, 4);

    const straightness = endDistance / Math.max(1, len);
    if (straightness > 0.91) {
      return [
        first,
        { x: first.x * 0.66 + last.x * 0.34, y: first.y * 0.66 + last.y * 0.34 },
        { x: first.x * 0.34 + last.x * 0.66, y: first.y * 0.34 + last.y * 0.66 },
        last
      ];
    }

    const isClosed = endDistance < Math.max(14, diag * 0.24) && len > diag * 2.0;
    if (isClosed) return ellipseFromPoints(clean, bounds);

    return curveAssistOpenStroke(clean, bounds, true);
  }

  function curveAssistOpenStroke(points = [], bounds = boundsForPoints(points), aggressive = false) {
    if (!Array.isArray(points) || points.length < 4) return points;
    let softened = smoothOpenStroke(points, aggressive ? 4 : 3);
    const diag = Math.hypot(bounds.width, bounds.height);
    if (aggressive) {
      softened = resampleStrokePoints(softened, 3.0);
      softened = roundSoftCorners(softened, 0.24);
    }
    const tolerance = aggressive
      ? Math.max(4.8, Math.min(10.5, diag * 0.058))
      : Math.max(3.6, Math.min(8.5, diag * 0.045));
    let simplified = simplifyStrokeRDP(softened, tolerance);
    if (!simplified || simplified.length < 3) return smoothOpenStroke(points, 4);

    // Evita transformar traços simples em curvas artificiais demais.
    if (simplified.length <= 3) {
      let simpleCurve = catmullRomStroke(simplified, aggressive ? 22 : 16);
      if (aggressive) simpleCurve = roundSoftCorners(simpleCurve, 0.28);
      return aggressive ? smoothOpenStroke(simpleCurve, 4) : simpleCurve;
    }

    // Reduz micro-quebras do dedo e arredonda apenas a geometria principal.
    simplified = removeTinySegments(simplified, aggressive ? Math.max(4, diag * 0.022) : Math.max(3, diag * 0.018));
    if (simplified.length < 3) return smoothOpenStroke(points, 4);
    let curved = catmullRomStroke(simplified, aggressive ? 18 : 12);
    if (aggressive) {
      curved = roundSoftCorners(curved, 0.26);
      curved = smoothOpenStroke(curved, 4);
    }
    return curved;
  }

  function removeTinySegments(points = [], minDistance = 3) {
    if (!Array.isArray(points) || points.length < 3) return points;
    const out = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const prev = out[out.length - 1];
      const p = points[i];
      if (Math.hypot(p.x - prev.x, p.y - prev.y) >= minDistance) out.push(p);
    }
    out.push(points[points.length - 1]);
    return out;
  }

  function simplifyStrokeRDP(points = [], epsilon = 4) {
    if (!Array.isArray(points) || points.length < 3) return points;
    let maxDistance = 0;
    let index = 0;
    const start = points[0];
    const end = points[points.length - 1];
    for (let i = 1; i < points.length - 1; i++) {
      const d = perpendicularDistance(points[i], start, end);
      if (d > maxDistance) {
        index = i;
        maxDistance = d;
      }
    }
    if (maxDistance > epsilon) {
      const left = simplifyStrokeRDP(points.slice(0, index + 1), epsilon);
      const right = simplifyStrokeRDP(points.slice(index), epsilon);
      return left.slice(0, -1).concat(right);
    }
    return [start, end];
  }

  function perpendicularDistance(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return Math.hypot(p.x - a.x, p.y - a.y);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
  }

  function catmullRomStroke(points = [], samplesPerSegment = 10) {
    if (!Array.isArray(points) || points.length < 3) return points;
    const out = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const samples = Math.max(4, Math.round(samplesPerSegment));
      for (let j = 1; j <= samples; j++) {
        const t = j / samples;
        const t2 = t * t;
        const t3 = t2 * t;
        out.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 + (-p0.x + 3*p1.x - 3*p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 + (-p0.y + 3*p1.y - 3*p2.y + p3.y) * t3)
        });
      }
    }
    return smoothOpenStroke(out, 2);
  }

  function smartShapeAssist(points = []) {
    if (!Array.isArray(points) || points.length < 8) return null;
    const first = points[0];
    const last = points[points.length - 1];
    const bounds = boundsForPoints(points);
    const diag = Math.hypot(bounds.width, bounds.height);
    const len = pathLength(points);
    const endDistance = Math.hypot(last.x - first.x, last.y - first.y);
    if (diag < 12 || len < 18) return null;

    const straightness = endDistance / Math.max(1, len);
    if (straightness > 0.90 && points.length >= 4) {
      return [
        first,
        { x: first.x * 0.67 + last.x * 0.33, y: first.y * 0.67 + last.y * 0.33 },
        { x: first.x * 0.33 + last.x * 0.67, y: first.y * 0.33 + last.y * 0.67 },
        last
      ];
    }

    const isClosed = endDistance < Math.max(14, diag * 0.24) && len > diag * 2.0;
    if (isClosed) return ellipseFromPoints(points, bounds);

    const curved = curveAssistOpenStroke(points, bounds, true);
    return curved && curved.length >= 2 ? curved : null;
  }

  function ellipseFromPoints(points = [], bounds = boundsForPoints(points)) {
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    let xx = 0, yy = 0, xy = 0;
    points.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      xx += dx * dx; yy += dy * dy; xy += dx * dy;
    });
    const theta = 0.5 * Math.atan2(2 * xy, xx - yy || 0.0001);
    const cos = Math.cos(theta), sin = Math.sin(theta);
    let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
    points.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const a = dx * cos + dy * sin;
      const b = -dx * sin + dy * cos;
      minA = Math.min(minA, a); maxA = Math.max(maxA, a);
      minB = Math.min(minB, b); maxB = Math.max(maxB, b);
    });
    const rx = Math.max(8, (maxA - minA) / 2);
    const ry = Math.max(8, (maxB - minB) / 2);
    const area = points.reduce((sum, p, i) => {
      const q = points[(i + 1) % points.length];
      return sum + (p.x * q.y - q.x * p.y);
    }, 0);
    const dir = area >= 0 ? 1 : -1;
    const startAngle = Math.atan2((points[0].y - cy) / ry, (points[0].x - cx) / rx);
    const count = 46;
    return Array.from({ length: count + 1 }, (_, i) => {
      const t = startAngle + dir * Math.PI * 2 * (i / count);
      const a = Math.cos(t) * rx;
      const b = Math.sin(t) * ry;
      return {
        x: cx + a * cos - b * sin,
        y: cy + a * sin + b * cos
      };
    });
  }

  function drawTaperedQuadratic(ctx, start, control, end, startWidth, endWidth) {
    const steps = 20;
    const center = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const ease = t * t * (3 - 2 * t);
      center.push({
        x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
        y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y,
        w: startWidth + (endWidth - startWidth) * ease
      });
    }
    const left = [];
    const right = [];
    for (let i = 0; i < center.length; i++) {
      const prev = center[Math.max(0, i - 1)];
      const next = center[Math.min(center.length - 1, i + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.max(0.001, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      const half = Math.max(0.08, center[i].w * 0.5);
      left.push({ x: center[i].x + nx * half, y: center[i].y + ny * half });
      right.push({ x: center[i].x - nx * half, y: center[i].y - ny * half });
    }
    ctx.save();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPath(ctx, stroke, options = {}) {
    const rawPoints = drawingStrokePoints(stroke);
    if (!rawPoints || rawPoints.length < 2) return;
    normalizeWritingAssist();

    const smoothLevel = Number.isFinite(Number(options.smoothLevel))
      ? Number(options.smoothLevel)
      : Number.isFinite(Number(stroke?.smoothLevel))
        ? Number(stroke.smoothLevel)
        : Number(writingAssist.smoothLevel || 0);
    const ending = options.ending || stroke?.ending || "normal";
    const points = smoothStrokePoints(rawPoints, smoothLevel);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (smoothLevel >= 2 && points.length > 2) {
      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    } else {
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    const last = points[points.length - 1];
    const prev = points[Math.max(0, points.length - 4)] || points[0];
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;

    if (ending === "haneru") {
      const baseWidth = Math.max(2.0, Math.min(3.4, ctx.lineWidth * 0.42));
      const flick = Math.max(6.0, Math.min(9.2, ctx.lineWidth * 1.08));
      const nx = uy;
      const ny = -ux;
      const start = { x: last.x - ux * 0.25, y: last.y - uy * 0.25 };
      const control = {
        x: last.x + ux * flick * 0.42 + nx * flick * 0.08,
        y: last.y + uy * flick * 0.42 + ny * flick * 0.08
      };
      const end = {
        x: last.x + ux * flick * 0.98 + nx * flick * 0.16,
        y: last.y + uy * flick * 0.98 + ny * flick * 0.16
      };
      drawTaperedQuadratic(ctx, start, control, end, baseWidth, 0.12);
    }

    if (ending === "tomeru") {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(last.x, last.y, Math.max(3.6, ctx.lineWidth * 0.52), Math.max(2.8, ctx.lineWidth * 0.42), Math.atan2(uy, ux), 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      ctx.restore();
    }
  }

  function drawCanvas() {
    const canvas = document.getElementById("writeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const lineY = rect.height * 0.68;
    const isDarkBoard = paperTone === "blackboard";
    const isGreenBoard = paperTone === "greenboard";
    const isBoard = isDarkBoard || isGreenBoard;

    ctx.clearRect(0,0,rect.width,rect.height);
    ctx.save();
    ctx.fillStyle = isGreenBoard ? "#2f5b46" : isDarkBoard ? "#26332f" : "#fffefb";
    ctx.fillRect(0,0,rect.width,rect.height);

    ctx.strokeStyle = isBoard ? "rgba(238,246,232,.28)" : "rgba(16,33,54,.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18,lineY);
    ctx.lineTo(rect.width - 18,lineY);
    ctx.stroke();

    ctx.fillStyle = isBoard ? "rgba(238,246,232,.66)" : "rgba(16,33,54,.46)";
    ctx.font = "800 12px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("escreva aqui", rect.width - 18, lineY - 6);

    ctx.strokeStyle = isGreenBoard ? "#f6f1d1" : isDarkBoard ? "#edf4df" : "#2b313a";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawingStrokes.forEach(stroke => drawPath(ctx, stroke));
    drawPath(ctx, currentStroke, { smoothLevel: writingAssist.smoothLevel, ending: writingAssist.ending });
    ctx.restore();
  }

  function captureCanvasSnapshot() {
    const canvas = document.getElementById("writeCanvas");
    if (!canvas) return;
    try { drawingSnapshot = canvas.toDataURL("image/png"); }
    catch { drawingSnapshot = null; }
  }

  function replayStrokeOrder() {
    const svg = document.querySelector("#strokeOrderSvg");
    if (!svg) return;
    svg.classList.remove("is-playing");
    void svg.offsetWidth;
    svg.classList.add("is-playing");
  }



  const FRIENDLY_KANA_DICTATION = {
    "あ": [
        "Trace da esquerda para a direita a linha superior horizontal, como quem abre o portão da fábrica cedo.",
        "Depois faça a linha central vertical, começando de cima e descendo com uma leve curva.",
        "Por fim, desenhe a curva grande ao redor, como um 'e' invertido fazendo hora extra."
    ],
    "い": [
        "Faça o traço da esquerda, descendo curto e levemente curvado.",
        "Depois faça o traço da direita, descendo separado, como dois colegas indo para o mesmo turno."
    ],
    "う": [
        "Comece com o pequeno traço de cima.",
        "Depois faça a curva principal: desça, abra para a esquerda e termine suave, sem derrapar a bike."
    ],
    "え": [
        "Comece com o pequeno traço de cima.",
        "Depois faça o traço principal: siga pela horizontal, quebre o movimento e finalize puxando para a direita."
    ],
    "お": [
        "Trace a linha superior horizontal da esquerda para a direita.",
        "Depois desça com o traço vertical central.",
        "Em seguida faça a curva inferior, arredondando a base.",
        "Por fim, acrescente o pequeno traço da direita, o detalhe final do serviço."
    ],
    "か": [
        "Faça primeiro o traço principal: comece em cima, cruze e desça para a esquerda.",
        "Depois faça o traço curto da direita, descendo levemente.",
        "Por fim, coloque o pequeno traço no alto direito."
    ],
    "き": [
        "Trace a primeira linha horizontal de cima, da esquerda para a direita.",
        "Trace a segunda linha horizontal logo abaixo.",
        "Depois desça com o traço central, cortando as linhas e curvando no final.",
        "Finalize com a pequena curva solta embaixo."
    ],
    "く": [
        "Faça um único traço em formato de cotovelo: desça em diagonal para a esquerda e volte em diagonal para a direita."
    ],
    "け": [
        "Faça o traço da esquerda, descendo de cima para baixo.",
        "Trace a linha superior da direita, da esquerda para a direita.",
        "Depois desça o traço da direita e curve no final."
    ],
    "こ": [
        "Trace a linha superior da esquerda para a direita.",
        "Depois trace a linha inferior, também da esquerda para a direita, como trilhos curtinhos."
    ],
    "さ": [
        "Trace a linha superior da esquerda para a direita.",
        "Desça o traço central atravessando a linha e virando para a esquerda no final.",
        "Finalize com a pequena curva inferior separada."
    ],
    "し": [
        "Faça um traço único: desça pela esquerda e curve para a direita no final, como uma saída suave."
    ],
    "す": [
        "Trace a linha superior da esquerda para a direita.",
        "Depois desça pelo centro, faça o laço e continue para baixo com calma."
    ],
    "せ": [
        "Trace primeiro a linha horizontal de cima.",
        "Depois faça o traço vertical da esquerda, descendo.",
        "Por fim, faça o traço da direita, descendo e puxando levemente para a esquerda."
    ],
    "そ": [
        "Comece com uma linha curta no topo.",
        "Depois faça o traço principal em zigue-zague suave e desça até o final."
    ],
    "た": [
        "Trace a linha superior da esquerda para a direita.",
        "Depois faça o traço vertical que corta a linha e desce pela esquerda.",
        "Em seguida faça a pequena linha superior da direita.",
        "Por fim, trace a linha inferior da direita."
    ],
    "ち": [
        "Trace a linha superior da esquerda para a direita.",
        "Depois desça com o traço principal, curve para a direita e volte suavemente."
    ],
    "つ": [
        "Faça um traço único em curva: comece à esquerda, siga para a direita e desça arredondando."
    ],
    "て": [
        "Trace um único movimento: linha superior da esquerda para a direita e depois desça curvando para baixo."
    ],
    "と": [
        "Faça primeiro o traço curto diagonal no alto.",
        "Depois trace a curva principal, descendo e fechando para a direita."
    ],
    "な": [
        "Trace a linha superior da esquerda para a direita.",
        "Depois desça com o traço vertical à esquerda.",
        "Faça o pequeno traço no alto direito.",
        "Finalize com a curva da direita, como um nó pequeno e firme."
    ],
    "に": [
        "Faça primeiro o traço da esquerda, descendo de cima para baixo com leve curva.",
        "Depois trace a linha superior da direita, da esquerda para a direita.",
        "Por fim, trace a linha inferior da direita, também da esquerda para a direita."
    ],
    "ぬ": [
        "Comece com a curva da esquerda, descendo e entrando na forma.",
        "Depois faça o traço grande que cruza, dá volta e termina com laço. Parece complicado, mas é só não entrar em pânico no turno."
    ],
    "ね": [
        "Faça o traço vertical da esquerda, descendo.",
        "Depois faça o traço da direita: cruze, curve e termine com uma voltinha."
    ],
    "の": [
        "Faça um único traço circular: comece em cima, rode para a esquerda, desça e feche para a direita."
    ],
    "は": [
        "Faça o traço da esquerda, descendo de cima para baixo.",
        "Trace a linha superior da direita.",
        "Depois faça o traço final da direita, descendo e curvando como um pequeno gancho."
    ],
    "ひ": [
        "Faça um único traço largo: comece à esquerda, desça, curve por baixo e suba para a direita."
    ],
    "ふ": [
        "Faça o pequeno traço de cima.",
        "Depois faça o traço central curvo, descendo.",
        "Faça o ponto/traço pequeno da esquerda.",
        "Finalize com o ponto/traço pequeno da direita."
    ],
    "へ": [
        "Faça um único traço em montanha: suba até o topo e desça para a direita."
    ],
    "ほ": [
        "Faça o traço da esquerda, descendo.",
        "Trace a primeira linha horizontal da direita.",
        "Trace a segunda linha horizontal da direita.",
        "Finalize com o traço vertical da direita, descendo e curvando no final."
    ],
    "ま": [
        "Trace a primeira linha horizontal.",
        "Trace a segunda linha horizontal abaixo.",
        "Depois desça com o traço vertical pelo centro.",
        "Finalize com a curva inferior, como um laço simples."
    ],
    "み": [
        "Faça o primeiro traço curvo, descendo e virando.",
        "Depois faça o segundo traço, cruzando e puxando para a direita."
    ],
    "む": [
        "Trace a linha superior.",
        "Depois desça com o traço principal, curve e faça a voltinha.",
        "Finalize com o pequeno traço da direita."
    ],
    "め": [
        "Faça o traço da esquerda, descendo em curva.",
        "Depois faça o traço grande da direita, cruzando e fechando a forma."
    ],
    "も": [
        "Trace a primeira linha horizontal.",
        "Trace a segunda linha horizontal.",
        "Depois faça o traço vertical curvo, descendo e virando no final."
    ],
    "や": [
        "Faça o traço principal, curvando e descendo.",
        "Depois faça o pequeno traço superior.",
        "Por fim, faça o traço diagonal da direita."
    ],
    "ゆ": [
        "Faça o traço da esquerda, descendo e curvando.",
        "Depois faça o traço grande da direita, dando a volta e descendo pelo centro."
    ],
    "よ": [
        "Faça o traço horizontal superior.",
        "Depois faça o traço vertical, descendo e fechando com a curva inferior."
    ],
    "ら": [
        "Faça o pequeno traço de cima.",
        "Depois faça a curva principal, descendo e abrindo para a direita."
    ],
    "り": [
        "Faça o traço da esquerda, descendo levemente.",
        "Depois faça o traço da direita, mais longo, descendo com firmeza."
    ],
    "る": [
        "Faça a linha superior em curva curta.",
        "Depois desça com a curva principal e feche com uma voltinha embaixo."
    ],
    "れ": [
        "Faça o traço vertical da esquerda.",
        "Depois faça o traço da direita, cruzando, descendo e terminando com movimento aberto."
    ],
    "ろ": [
        "Faça a linha superior inclinada.",
        "Depois desça e curve para fechar a forma embaixo."
    ],
    "わ": [
        "Faça o traço vertical da esquerda.",
        "Depois faça o traço da direita, cruzando e abrindo em curva."
    ],
    "を": [
        "Trace a linha superior.",
        "Depois desça com o traço principal, cruzando e fazendo a curva.",
        "Finalize com o traço inferior curvo."
    ],
    "ん": [
        "Faça um único traço: desça em curva e termine subindo suavemente para a direita."
    ],
    "ア": [
        "Trace primeiro a linha superior, da esquerda para a direita.",
        "Depois desça em diagonal pelo centro, como uma escada rápida."
    ],
    "イ": [
        "Faça o traço diagonal principal de cima para baixo.",
        "Depois faça o traço vertical curto, descendo."
    ],
    "ウ": [
        "Faça o traço curto vertical de cima.",
        "Depois trace a linha superior com leve canto.",
        "Por fim, desça a curva principal para a esquerda."
    ],
    "エ": [
        "Trace a linha superior.",
        "Depois trace a linha central vertical.",
        "Finalize com a linha inferior, mais longa."
    ],
    "オ": [
        "Trace a linha superior.",
        "Depois desça o traço vertical central.",
        "Finalize com a diagonal curta para a esquerda."
    ],
    "カ": [
        "Faça o traço principal: linha superior e descida pela direita.",
        "Depois faça a diagonal da esquerda para baixo."
    ],
    "キ": [
        "Trace a linha superior.",
        "Trace a segunda linha abaixo.",
        "Depois faça a diagonal principal atravessando as duas."
    ],
    "ク": [
        "Faça o traço curto superior.",
        "Depois faça o traço longo em curva diagonal para baixo."
    ],
    "ケ": [
        "Faça o traço curto da esquerda.",
        "Depois trace a linha superior.",
        "Por fim, faça a diagonal longa descendo para a esquerda."
    ],
    "コ": [
        "Trace a linha superior com a lateral direita.",
        "Depois trace a linha inferior."
    ],
    "サ": [
        "Trace a linha superior.",
        "Faça o traço vertical da esquerda.",
        "Depois faça o traço vertical da direita, descendo mais longo."
    ],
    "シ": [
        "Faça o primeiro ponto/traço curto.",
        "Faça o segundo ponto/traço curto abaixo.",
        "Depois faça o traço longo ascendente para a direita."
    ],
    "ス": [
        "Trace a linha superior em curva.",
        "Depois faça a diagonal final cruzando para baixo."
    ],
    "セ": [
        "Trace a linha horizontal.",
        "Depois faça o traço vertical com curva no final."
    ],
    "ソ": [
        "Faça o traço curto da esquerda.",
        "Depois faça a diagonal longa da direita para baixo."
    ],
    "タ": [
        "Faça o traço superior esquerdo.",
        "Depois faça o corpo principal em curva.",
        "Finalize com a diagonal interna."
    ],
    "チ": [
        "Trace a linha superior.",
        "Depois faça a linha do meio.",
        "Por fim, desça com a vertical central."
    ],
    "ツ": [
        "Faça o primeiro ponto curto.",
        "Faça o segundo ponto curto.",
        "Depois faça a diagonal longa descendo para a esquerda."
    ],
    "テ": [
        "Trace a linha superior.",
        "Trace a linha do meio.",
        "Depois desça com a vertical central."
    ],
    "ト": [
        "Faça o traço vertical.",
        "Depois faça a diagonal curta saindo para a direita."
    ],
    "ナ": [
        "Trace a linha horizontal.",
        "Depois desça com a diagonal central."
    ],
    "ニ": [
        "Trace a linha superior.",
        "Depois trace a linha inferior."
    ],
    "ヌ": [
        "Faça a linha superior curva.",
        "Depois faça a diagonal que cruza e desce."
    ],
    "ネ": [
        "Faça o pequeno traço de cima.",
        "Depois faça o traço principal quebrado.",
        "Finalize com os traços laterais."
    ],
    "ノ": [
        "Faça uma diagonal única, de cima para baixo à esquerda."
    ],
    "ハ": [
        "Faça o lado esquerdo descendo em diagonal.",
        "Depois faça o lado direito descendo em diagonal."
    ],
    "ヒ": [
        "Faça o traço vertical com curva embaixo.",
        "Depois trace a linha do meio para a direita."
    ],
    "フ": [
        "Trace a linha superior e desça em diagonal para a esquerda."
    ],
    "ヘ": [
        "Faça um único traço em montanha, subindo e descendo."
    ],
    "ホ": [
        "Trace a linha superior.",
        "Desça com o traço vertical central.",
        "Faça a diagonal esquerda.",
        "Faça a diagonal direita."
    ],
    "マ": [
        "Trace a linha superior com descida à direita.",
        "Depois faça o traço diagonal interno."
    ],
    "ミ": [
        "Trace a primeira linha diagonal curta.",
        "Trace a segunda linha diagonal curta.",
        "Trace a terceira linha diagonal curta."
    ],
    "ム": [
        "Faça a diagonal principal.",
        "Depois faça a linha inferior curta.",
        "Finalize com o pequeno traço da direita."
    ],
    "メ": [
        "Faça a diagonal da esquerda para a direita.",
        "Depois faça a diagonal cruzada de cima para baixo."
    ],
    "モ": [
        "Trace a linha superior.",
        "Trace a linha do meio.",
        "Depois faça a vertical curvada para baixo."
    ],
    "ヤ": [
        "Faça o traço principal em curva.",
        "Depois faça o pequeno traço superior.",
        "Finalize com a diagonal direita."
    ],
    "ユ": [
        "Trace a linha superior com a lateral direita.",
        "Depois trace a linha inferior."
    ],
    "ヨ": [
        "Trace a linha superior com a lateral direita.",
        "Trace a linha do meio.",
        "Finalize com a linha inferior."
    ],
    "ラ": [
        "Trace a linha superior.",
        "Depois faça a curva diagonal principal para baixo."
    ],
    "リ": [
        "Faça o traço da esquerda.",
        "Depois faça o traço da direita, mais longo."
    ],
    "ル": [
        "Faça o traço da esquerda, descendo.",
        "Depois faça o traço da direita, descendo e abrindo para fora."
    ],
    "レ": [
        "Desça com o traço vertical e finalize abrindo para a direita."
    ],
    "ロ": [
        "Faça a parte superior e lateral direita.",
        "Depois feche com a linha inferior."
    ],
    "ワ": [
        "Trace a linha superior com a lateral direita.",
        "Depois faça a curva interna para baixo."
    ],
    "ヲ": [
        "Trace a linha superior.",
        "Trace a linha do meio com lateral direita.",
        "Finalize com a diagonal inferior."
    ],
    "ン": [
        "Faça o pequeno traço curto.",
        "Depois faça o traço longo ascendente para a direita."
    ]
};

  function baseKanaForDictation(ch) {
    const dakutenMap = {
      "が":"か","ぎ":"き","ぐ":"く","げ":"け","ご":"こ","ざ":"さ","じ":"し","ず":"す","ぜ":"せ","ぞ":"そ","だ":"た","ぢ":"ち","づ":"つ","で":"て","ど":"と","ば":"は","び":"ひ","ぶ":"ふ","べ":"へ","ぼ":"ほ","ぱ":"は","ぴ":"ひ","ぷ":"ふ","ぺ":"へ","ぽ":"ほ",
      "ガ":"カ","ギ":"キ","グ":"ク","ゲ":"ケ","ゴ":"コ","ザ":"サ","ジ":"シ","ズ":"ス","ゼ":"セ","ゾ":"ソ","ダ":"タ","ヂ":"チ","ヅ":"ツ","デ":"テ","ド":"ト","バ":"ハ","ビ":"ヒ","ブ":"フ","ベ":"ヘ","ボ":"ホ","パ":"ハ","ピ":"ヒ","プ":"フ","ペ":"ヘ","ポ":"ホ"
    };
    return dakutenMap[ch] || ch;
  }

  function extraMarkStepsForKana(ch) {
    if ("がぎぐげござじずぜぞだぢづでどばびぶべぼガギグゲゴザジズゼゾダヂヅデドバビブベボ".includes(ch)) {
      return [
        "Depois acrescente o primeiro risquinho do dakuten no canto superior direito.",
        "Finalize com o segundo risquinho do dakuten, logo ao lado. É o temperinho sonoro da letra."
      ];
    }
    if ("ぱぴぷぺぽパピプペポ".includes(ch)) {
      return ["Depois acrescente o pequeno círculo do handakuten no canto superior direito. É a bolinha que muda o som."];
    }
    return [];
  }

  function describeStrokeStep(ch, n, rawLabel) {
    const label = String(rawLabel || '').trim().toLowerCase();
    const base = rawLabel ? String(rawLabel).trim() : `traço ${n}`;

    const exact = {
      'linha': 'Trace uma linha horizontal da esquerda para a direita.',
      'linha superior': 'Trace a linha superior na horizontal, da esquerda para a direita.',
      'linha inferior': 'Trace a linha inferior da esquerda para a direita, fechando a base.',
      'traço horizontal longo': 'Trace uma linha horizontal longa, da esquerda para a direita.',
      'vertical': 'Desça com um traço vertical, de cima para baixo.',
      'centro': 'Faça o traço central, descendo de cima para baixo com firmeza.',
      'curva': 'Feche com uma curva ampla, contornando a forma até embaixo.',
      'curva inferior': 'Faça a curva de baixo, arredondando com calma até fechar a forma.',
      'curva principal': 'Faça a curva principal, contornando a forma com movimento contínuo.',
      'curva direita': 'Faça a curva da direita, descendo de cima para baixo até o final.',
      'curva esquerda': 'Faça a curva da esquerda, descendo com leve inclinação.',
      'traço pequeno direito': 'Finalize com o pequeno traço da direita.',
      'traço curto superior': 'Comece com o pequeno traço de cima.',
      'ponto superior': 'Faça o ponto superior com um traço curto e leve.',
      'ponto inferior': 'Faça o ponto inferior logo abaixo, também curto e leve.',
      'ponto/traço curto': 'Faça primeiro o pequeno traço curto.',
      'diagonal curta': 'Faça uma diagonal curta, saindo do centro em direção à direita.',
      'diagonal principal': 'Faça a diagonal principal, descendo em direção à esquerda.',
      'diagonal esquerda': 'Desça com uma diagonal para a esquerda.',
      'diagonal interna': 'Faça uma diagonal interna curta, acompanhando o corpo da letra.',
      'traço diagonal ascendente': 'Trace uma diagonal subindo, da esquerda para a direita.',
      'traço ascendente': 'Faça um traço subindo em curva, em direção ao topo.',
      'traço final': 'Finalize com o último traço, saindo do centro em direção ao final da letra.',
      'corpo principal': 'Faça o corpo principal da letra, mantendo a forma base.',
      'curva diagonal': 'Faça uma curva em diagonal, conduzindo o traço até o final.',
      'linha e lateral direita': 'Desenhe primeiro a parte de cima e continue descendo pela lateral direita.',
      'linha com descida': 'Trace a linha principal e, no final, desça levemente.',
      'linha principal curva': 'Trace a linha principal já com uma leve curvatura.',
      'forma base do ヒ': 'Faça primeiro a forma principal da letra, descendo e abrindo o corpo.',
      'lado esquerdo do ハ': 'Faça primeiro o lado esquerdo, descendo em diagonal.',
      'lado direito do ハ': 'Depois faça o lado direito, também descendo em diagonal.',
      'círculo handakuten': 'Desenhe o pequeno círculo do handakuten no canto superior direito.',
      'dakuten 1': 'Faça o primeiro traço do dakuten no alto da letra.',
      'dakuten 2': 'Faça o segundo traço do dakuten ao lado do primeiro.',
      'traço único': 'Faça o traço único de uma só vez, de cima para baixo com leve curva.',
      'linha quebrada e final': 'Trace a linha principal, faça a quebra e termine com a saída final.'
    };
    if (exact[label]) return exact[label];

    if (label.includes('dakuten')) return `Faça o ${n}º pequeno traço do dakuten no alto da letra.`;
    if (label.includes('handakuten')) return 'Desenhe o pequeno círculo do handakuten no canto superior direito.';
    if (label.includes('linha') && label.includes('horizontal')) return 'Trace uma linha horizontal da esquerda para a direita.';
    if (label.includes('linha') && label.includes('descida')) return 'Trace a linha principal e termine com uma descida suave.';
    if (label.includes('linha')) return `Faça ${base}, começando da esquerda e seguindo com calma.`;
    if (label.includes('vertical')) return 'Desça com um traço vertical de cima para baixo.';
    if (label.includes('centro')) return 'Faça o traço central descendo de cima para baixo.';
    if (label.includes('curva')) return `Faça ${base}, mantendo o movimento arredondado até o final.`;
    if (label.includes('diagonal')) return `Faça ${base}, em movimento inclinado e contínuo.`;
    if (label.includes('ponto')) return `Faça ${base} com um toque curto e leve.`;
    if (label.includes('corpo principal')) return 'Faça o corpo principal da letra, sustentando sua forma base.';
    if (label.includes('forma base')) return 'Faça primeiro a forma base da letra.';
    if (label.includes('final')) return `Finalize com ${base}.`;

    return `Faça ${base}.`;
  }

  function beginnerStrokeSteps(ch, drawing, data) {
    const base = baseKanaForDictation(ch);
    const manual = FRIENDLY_KANA_DICTATION[ch] || FRIENDLY_KANA_DICTATION[base];

    if (manual) {
      const full = [...manual, ...extraMarkStepsForKana(ch)];
      return full.map((label, index) => ({ n: index + 1, label }));
    }

    if (drawing?.strokes?.length) {
      return drawing.strokes.map((stroke, index) => ({
        n: index + 1,
        label: describeStrokeStep(ch, index + 1, stroke.label)
      }));
    }

    if (data?.note && data.count) {
      return data.note.split(",").map((label, index) => ({
        n: index + 1,
        label: describeStrokeStep(ch, index + 1, label.trim())
      }));
    }

    return [];
  }

  function renderStrokeOrderSvg(ch) {
    const drawing = KANA_DRAWINGS[ch];
    const data = KANA_STROKES[ch];
    const steps = beginnerStrokeSteps(ch, drawing, data);

    if (!steps.length) {
      const word = currentWord();
      const kanjiStrokeCount = category === "kanji" && word?.strokes ? String(word.strokes) : "";
      return `
        <div class="strokeRecipeBox strokeRecipeBox--honest">
          <div class="strokeRecipeMain">
            <strong>${escapeHTML(ch)}</strong>
            <div>
              <b>${kanjiStrokeCount ? `${escapeHTML(kanjiStrokeCount)} traços` : "sem ordem segura ainda"}</b>
              <span>observe a forma, esconda a palavra, escreva no quadro e confira com honestidade.</span>
            </div>
          </div>

          <div class="strokeBeginnerNote">
            <b>${category === "kanji" ? "kanji sem chute" : "para iniciante"}</b>
            <span>${category === "kanji" ? "Kanji precisa de ordem fiel. Por enquanto, mostramos a quantidade quando disponível e treinamos a forma sem inventar caminho falso." : "Use esta letra como modelo visual. Não vamos inventar uma ordem que possa ensinar errado."}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="strokeRecipeBox">
        <div class="strokeRecipeMain">
          <strong>${escapeHTML(ch)}</strong>
          <div>
            <b></b>
            <span>ditado simpático para escrever sem brigar com a letra</span>
          </div>
        </div>

        <div class="strokeRecipeSteps strokeRecipeSteps--clear">
          ${steps.map(step => `
            <span>
              <b>${step.n}</b>
              <em>${escapeHTML(step.label)}</em>
            </span>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderVisualHint() {
    return "";
  }

  function backToContentList() {
    const current = currentWord();
    const targetCategory = category || current?.category || openMenu || "hiragana";

    category = targetCategory;
    openMenu = targetCategory;
    screen = "dashboard";
    activeHintChar = "";
    drawingSnapshot = null;
    drawingStrokes = [];
    currentStroke = [];

    saveState();
    render();
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function renderAppHeader() {
    const showContentBack = screen !== "dashboard";

    return `
      <header class="appHeader">
        <div class="brandMini">
          <img src="../img/logo_nihongo321.png" alt="NIHONGO321" onerror="this.style.display='none'">
          <div>
            <strong>DIÁRIO321</strong>
          </div>
        </div>
        <div class="headerActions">
          <a class="headerBridgeBtn headerBridgeTextBtn" href="../index.html#/home" target="_parent" aria-label="Voltar para o NIHONGO321" title="Voltar ao NIHONGO321">voltar</a>
          <button class="themeToggleBtn" type="button" data-action="toggleTheme" aria-label="alternar tema">${appTheme === "dark" ? "☀️" : "🌙"}</button>
          ${showContentBack ? `<button class="headerBackBtn" type="button" id="headerBackBtn" aria-label="voltar para lista de conteúdos">↩</button>` : ""}
        </div>
      </header>
    `;
  }

  function renderStudyMenus() {
    return `
      <section class="studyMenus">
        ${renderStudyMenu("hiragana", "Hiragana", "palavras nativas", "7 palavras por letra foco")}
        ${renderStudyMenu("katakana", "Katakana", "vida real no Japão", "placas, lojas e objetos")}
        ${renderStudyMenu("kanji", "Kanji", "prévia essencial", "palavras importantes")}
      </section>
    `;
  }

  function renderStudyMenu(cat, title, desc, subtitle) {
    const stats = totalStats(cat);
    const isOpen = openMenu === cat;
    const words = categoryWords(cat);
    const kanjiLocked = cat === "kanji" && isKanjiPremiumLocked();

    return `
      <article class="studyMenu ${isOpen ? "is-open" : ""} ${kanjiLocked ? "is-premium-area" : ""}">
        <button class="studyMenuHead" type="button" data-menu="${cat}">
          <span>
            <b>${title}</b>
            <small>${kanjiLocked ? "área Premium" : desc}</small>
          </span>
          <em>${kanjiLocked ? "Premium" : `${stats.familiar}/${stats.total}`}</em>
        </button>

        <div class="studyMenuBody">
          <div class="menuIntro">
            <b>${kanjiLocked ? "Kanji completo para assinantes" : subtitle}</b>
            <span>${cat === "kanji" ? "Níveis N5, N4, N3, N2 e N1 ficam bloqueados na versão grátis." : "Escolha a família, depois a letra e por fim uma palavra para escrever."}</span>
          </div>

          ${cat === "kanji" ? renderKanjiPicker(words) : renderFocusPicker(cat)}
        </div>
      </article>
    `;
  }

  function renderFocusPicker(cat) {
    const families = KANA_FAMILIES[cat] || [];
    let currentFamily = selectedFamily[cat] || families[0]?.key || "";
    if (isFamilyPremiumLocked(cat, currentFamily)) {
      currentFamily = (families.find(item => !isFamilyPremiumLocked(cat, item.key)) || families[0] || {}).key || "";
    }
    const familyData = families.find(item => item.key === currentFamily) || families[0] || { letters: [] };
    const selected = selectedFocus[cat] || familyData.letters[0] || "";

    const letters = familyData.letters;
    const words = categoryWords(cat).filter(word => word.focus === selected);

    return `
      <div class="familyBlock">
        <div class="choiceLabel">
          <b>1. escolha a família</b>
          <span>${cat === "hiragana" ? "あ か さ た..." : "ア カ サ タ..."}</span>
        </div>
        ${!cadernoHasPremiumAccess() && isKanaCategory(cat) ? `<div class="freeKanaNotice">Grátis: famílias ${cat === "hiragana" ? "あ・か・さ" : "ア・カ・サ"}. Premium libera o restante.</div>` : ""}

        <div class="compactFamilyGrid">
          ${families.map(fam => {
            const totalWords = categoryWords(cat).filter(word => fam.letters.includes(word.focus)).length;
            const familyWords = categoryWords(cat).filter(word => fam.letters.includes(word.focus));
            const doneWords = familyWords.filter(word => (progressFor(word).correct || 0) >= 1).length;
            const locked = isFamilyPremiumLocked(cat, fam.key);
            return `
              <button class="${currentFamily === fam.key ? "is-active" : ""} ${locked ? "is-premium-locked" : ""}" type="button" data-family-cat="${cat}" data-family="${escapeHTML(fam.key)}" ${locked ? "aria-disabled='true'" : ""}>
                <strong>${escapeHTML(fam.key)}</strong>
                <span>${locked ? "Premium" : countLabel(doneWords, totalWords)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <div class="letterBlock">
        <div class="choiceLabel">
          <b>2. escolha a letra</b>
          <span>treino da família ${escapeHTML(currentFamily)}</span>
        </div>

        <div class="compactFocusGrid">
          ${letters.map(letter => {
            const letterWords = categoryWords(cat).filter(word => word.focus === letter);
            const done = letterWords.filter(word => (progressFor(word).correct || 0) >= 1).length;
            const disabled = letterWords.length === 0;
            return `
              <button class="${selected === letter ? "is-active" : ""} ${disabled ? "is-disabled" : ""}" type="button" data-focus-cat="${cat}" data-focus="${escapeHTML(letter)}" ${disabled ? "aria-disabled='true'" : ""}>
                <strong>${escapeHTML(letter)}</strong>
                <span>${countLabel(done, letterWords.length)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <div class="wordChoiceBlock">
        <div class="choiceLabel">
          <b>3. escolha a palavra</b>
          <span>${words.length ? "escreva com significado" : "conteúdo desta letra entra em expansão"}</span>
        </div>

        <div class="compactWordList">
          ${words.length ? words.map(word => {
            const p = progressFor(word);
            return `
              <button type="button" data-word-id="${escapeHTML(word.id)}">
                <strong>${escapeHTML(word.jp)}</strong>
                <span>${escapeHTML(word.romaji)} · ${escapeHTML(word.pt)}</span>
                <small>${p.correct || 0}/7</small>
              </button>
            `;
          }).join("") : `
            <div class="emptyLesson">
              <b>em expansão</b>
              <span>Esta família já está preparada. Vamos alimentar novas palavras por letra sem bagunçar o app.</span>
            </div>
          `}
        </div>
      </div>
    `;
  }

  function selectKanjiLevel(level) {
    if (isKanjiPremiumLocked()) { showCadernoPremiumMessage("kanji"); return; }
    selectedKanjiLevel = level;
    const groups = kanjiGroups(level);
    selectedKanjiGroup = groups[0] || "";
    category = "kanji";
    openMenu = "kanji";
    saveState();
    render();
  }

  function selectKanjiGroup(group) {
    if (isKanjiPremiumLocked()) { showCadernoPremiumMessage("kanji"); return; }
    selectedKanjiGroup = group;
    category = "kanji";
    openMenu = "kanji";
    saveState();
    render();
  }

  function kanjiGroups(level = "N5") {
    const groups = [];
    categoryWords("kanji").forEach(word => {
      if (word.jlpt === level && word.group && !groups.includes(word.group)) groups.push(word.group);
    });
    return groups;
  }

  function savedBridgePhrases() {
    try {
      const raw = localStorage.getItem(NIHONGO321_BRIDGE_KEY);
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function bridgePhraseSignature(item) {
    return `${String(item?.jp || "").trim()}||${String(item?.pt || "").trim()}`;
  }

  function persistBridgePhrases(list) {
    const safeList = Array.isArray(list) ? list.filter(item => item && String(item.jp || "").trim()) : [];
    localStorage.setItem(NIHONGO321_BRIDGE_KEY, JSON.stringify(safeList.slice(0, 120)));
    const verify = JSON.parse(localStorage.getItem(NIHONGO321_BRIDGE_KEY) || "[]");
    return Array.isArray(verify) ? verify.length : 0;
  }

  function savePhraseToNihongo321Bridge(phrase) {
    const jp = String(phrase?.jp || "").trim();
    if (!jp) return { ok: false, reason: "empty" };

    const saved = savedBridgePhrases();
    const nextSignature = bridgePhraseSignature(phrase);
    const alreadyIndex = saved.findIndex(item => bridgePhraseSignature(item) === nextSignature);

    const finalPhrase = {
      ...phrase,
      id: phrase.id || uid("genial_phrase"),
      source: phrase.source || "CADERNO321 Diário Genial",
      savedForNihongo321: true,
      updatedAt: new Date().toISOString()
    };

    if (alreadyIndex >= 0) {
      saved[alreadyIndex] = { ...saved[alreadyIndex], ...finalPhrase };
    } else {
      saved.unshift(finalPhrase);
    }

    const total = persistBridgePhrases(saved);
    return { ok: true, duplicate: alreadyIndex >= 0, total, phrase: finalPhrase };
  }

  function createNihongo321WritableState() {
    const t = Date.now();
    const theme = localStorage.getItem("nihongo321_theme") || "dark";
    return {
      app: {
        name: "NIHONGO321",
        schemaVersion: 8.2,
        version: "8.5.71.1",
        createdAt: t,
        updatedAt: t,
        source: "CADERNO321_DIRECT_SAVE"
      },
      prefs: {
        theme: theme === "light" ? "light" : "dark",
        audio: { enabled: true, volume: 0.35, unlocked: false },
        haptics: { enabled: true }
      },
      monetization: { premiumUnlocked: false, seenPaywall: false },
      admin: { unlocked: false, lastLoginAt: null },
      stats: { coins: 0, bestCoins: 0, cyclesDone: 0, phrasesMastered: 0, listens: 0, calls: 0 },
      habit: { firstDay: null, days: {} },
      aiStudio: { history: [] },
      tutorial: { done: false, currentStep: 0, completedAt: null },
      goals: { dailyMinutes: 5, dailyCycles: 1 },
      favorites: { phraseIds: [] },
      bank: { topics: [], phrases: [] },
      progress: {},
      session: {
        inProgress: false,
        queue: [],
        index: 0,
        phraseId: null,
        callMode: false,
        topicFilter: "ALL",
        study: { day: new Date().toISOString().slice(0, 10), totalMs: 0, running: false, runStartAt: null }
      },
      ui: { lastToast: "", collapsedTopics: {}, onboardingSeen: false, onboardingStep: 0 }
    };
  }

  function readWritableNihongo321State() {
    const LS_NIHONGO = "jp_105x_v7";
    const raw = localStorage.getItem(LS_NIHONGO);
    let state = null;

    if (raw) {
      try { state = JSON.parse(raw); } catch { state = null; }
    }

    if (!state || typeof state !== "object" || !state.app) {
      state = createNihongo321WritableState();
    }

    state.app ||= {};
    state.app.name ||= "NIHONGO321";
    state.app.schemaVersion ||= 8.2;
    state.app.updatedAt = Date.now();
    state.bank ||= {};
    state.bank.topics ||= [];
    state.bank.phrases ||= [];
    state.progress ||= {};
    state.favorites ||= { phraseIds: [] };
    state.favorites.phraseIds ||= [];
    state.prefs ||= {};
    state.prefs.theme = state.prefs.theme === "light" ? "light" : (localStorage.getItem("nihongo321_theme") || "dark");
    return state;
  }

  function savePhraseDirectlyInsideNihongo321(phrase) {
    try {
      const jp = String(phrase?.jp || "").trim();
      if (!jp) return { ok: false, reason: "empty" };

      const pt = String(phrase?.pt || "").trim() || "frase criada no DIÁRIO321";
      const LS_NIHONGO = "jp_105x_v7";
      const state = readWritableNihongo321State();

      let topic = state.bank.topics.find(t => t && t.id === "topic_caderno321");
      if (!topic) {
        topic = {
          id: "topic_caderno321",
          name: "Diário321",
          icon: "筆",
          color: "tAmber",
          description: "Frases criadas pelo aluno no DIÁRIO321.",
          isPremium: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        state.bank.topics.unshift(topic);
      }

      const signature = `${jp}||${pt}`;
      const existing = state.bank.phrases.find(item => `${String(item?.jp || "").trim()}||${String(item?.pt || "").trim()}` === signature);
      const t = Date.now();
      const newWords = Array.isArray(phrase.newWords)
        ? phrase.newWords.filter(w => w && String(w.jp || "").trim()).map(w => ({ jp: String(w.jp || "").trim(), pt: String(w.pt || "").trim() }))
        : [];

      const details = phrase.caderno321?.details || {};
      const noteParts = [];
      if (phrase.note) noteParts.push(String(phrase.note));
      if (details.particles && !noteParts.join("\n").includes(details.particles)) noteParts.push(`Partículas: ${details.particles}`);
      if (details.explanation && !noteParts.join("\n").includes(details.explanation)) noteParts.push(`Explicação: ${details.explanation}`);
      if (details.situation && !noteParts.join("\n").includes(details.situation)) noteParts.push(`Situação: ${details.situation}`);

      let id;
      let duplicate = false;
      if (existing) {
        duplicate = true;
        id = existing.id || uid("cad321");
        Object.assign(existing, {
          id,
          jp,
          pt,
          newWords,
          topicId: topic.id,
          source: "CADERNO321",
          caderno321: phrase.caderno321 || null,
          note: noteParts.join("\n"),
          updatedAt: t
        });
      } else {
        id = uid("cad321");
        state.bank.phrases.unshift({
          id,
          jp,
          pt,
          newWords,
          topicId: topic.id,
          source: "CADERNO321",
          caderno321: phrase.caderno321 || null,
          note: noteParts.join("\n"),
          createdAt: t,
          updatedAt: t
        });
      }

      state.progress[id] ||= {
        status: "training",
        cycleStart: 14,
        count: 14,
        masteredAt: null,
        history: []
      };

      localStorage.setItem(LS_NIHONGO, JSON.stringify(state));
      const verify = JSON.parse(localStorage.getItem(LS_NIHONGO) || "{}");
      const ok = !!verify?.app && Array.isArray(verify?.bank?.phrases) && verify.bank.phrases.some(item => `${String(item?.jp || "").trim()}||${String(item?.pt || "").trim()}` === signature);
      const total = Array.isArray(verify?.bank?.phrases) ? verify.bank.phrases.filter(item => item?.topicId === "topic_caderno321").length : 0;
      return { ok, duplicate, total, id, storageKey: LS_NIHONGO };
    } catch (err) {
      console.error("DIÁRIO321 direct save error:", err);
      return { ok: false, reason: err?.message || "direct_save_error" };
    }
  }

  function saveKanjiSentenceToBridge(wordId, index) {
    const word = WORDS.find(item => item.id === wordId);
    if (!word || !Array.isArray(word.sentences)) return;

    const sentence = word.sentences[Number(index)];
    if (!sentence) return;

    const saved = savedBridgePhrases();
    const phrase = {
      id: `caderno_${word.id}_${index}_${Date.now()}`,
      source: "CADERNO321",
      topic: `Kanji ${word.jlpt || ""} · ${word.jp}`,
      jp: sentence.jp,
      pt: sentence.pt,
      readingType: sentence.type || "",
      targetKanji: word.jp,
      word: sentence.word || "",
      note: sentence.note || "",
      createdAt: new Date().toISOString()
    };

    const already = saved.some(item => item.jp === phrase.jp && item.pt === phrase.pt);
    if (!already) saved.unshift(phrase);

    localStorage.setItem(NIHONGO321_BRIDGE_KEY, JSON.stringify(saved.slice(0, 300)));
    toast(already ? "frase já estava salva" : "frase salva para o NIHONGO321");
  }

  function renderKanjiSentenceBank(word) {
    if (word.category !== "kanji") return "";
    const list = Array.isArray(word.sentences) ? word.sentences : [];
    if (!list.length) {
      return `
        <div class="kanjiSentenceBank">
          <div class="kanjiSentenceHead">
            <b>frases úteis</b>
            <span>em expansão</span>
          </div>
          <p>Este kanji ainda vai receber frases separadas por Onyomi e Kunyomi.</p>
        </div>
      `;
    }

    const onyomi = list.filter(item => item.type === "onyomi");
    const kunyomi = list.filter(item => item.type === "kunyomi");
    const other = list.filter(item => item.type !== "onyomi" && item.type !== "kunyomi");

    const renderGroup = (title, items) => items.length ? `
      <div class="sentenceGroup">
        <strong>${title}</strong>
        ${items.map(item => {
          const originalIndex = list.indexOf(item);
          return `
            <div class="sentenceCard">
              <div>
                <b>${escapeHTML(item.jp)}</b>
                <span>${escapeHTML(item.pt)}</span>
                <em>${escapeHTML(item.word || "")}${item.note ? " · " + escapeHTML(item.note) : ""}</em>
              </div>
              <button type="button" data-save-kanji-sentence="${escapeHTML(word.id)}" data-sentence-index="${originalIndex}">
                salvar
              </button>
            </div>
          `;
        }).join("")}
      </div>
    ` : "";

    return `
      <div class="kanjiSentenceBank">
        <div class="kanjiSentenceHead">
          <b>frases úteis</b>
          <span>salvar para o NIHONGO321</span>
        </div>
        ${renderGroup("Onyomi · leitura sino-japonesa", onyomi)}
        ${renderGroup("Kunyomi · leitura natural japonesa", kunyomi)}
        ${renderGroup("uso misto / expressão comum", other)}
      </div>
    `;
  }


  function readingTypeHint(word) {
    if (word.category !== "kanji") return "";
    const hasOn = Boolean(word.onyomi && word.onyomi !== "em expansão");
    const hasKun = Boolean(word.kunyomi && word.kunyomi !== "em expansão");

    if (hasOn && hasKun) {
      return "Este kanji tem leitura Onyomi e Kunyomi. O segredo é reconhecer quando ele aparece sozinho, em verbo/adjetivo ou combinado com outros kanjis.";
    }

    if (hasOn) {
      return "Este kanji aparece principalmente em combinações. Treine olhando palavras compostas e frases reais.";
    }

    if (hasKun) {
      return "Este kanji aparece muito em palavras naturais japonesas. Treine junto com okurigana, verbos, adjetivos e frases simples.";
    }

    return "As leituras deste kanji ainda serão refinadas. Por enquanto, fixe o significado e reconheça a forma visual.";
  }

  function renderKanjiStudyMethod(word) {
    if (word.category !== "kanji") return "";

    return `
      <div class="kanjiLivingMethod">
        <div class="kanjiLivingHead">
          <b>como estudar este kanji</b>
          <span>kanji vivo</span>
        </div>

        <div class="kanjiLivingSteps">
          <span><strong>1</strong><em>entenda o sentido</em></span>
          <span><strong>2</strong><em>compare Onyomi/Kunyomi</em></span>
          <span><strong>3</strong><em>veja palavras reais</em></span>
          <span><strong>4</strong><em>salve frases úteis</em></span>
          <span><strong>5</strong><em>escreva 7 vezes certo</em></span>
        </div>

        <p>${escapeHTML(readingTypeHint(word))}</p>
      </div>
    `;
  }

  function renderBridgeSummary() {
    return "";
  }

  function renderKanjiDetails(word) {
    if (word.category !== "kanji") return "";
    return `
      <div class="kanjiDetailBox">
        <div class="kanjiReadings">
          <span><b>nível</b>${escapeHTML(word.jlpt || "prévia")}</span>
          <span><b>traços</b>${escapeHTML(word.strokes || "em expansão")}</span>
          <span><b>onyomi</b>${escapeHTML(word.onyomi || "em expansão")}</span>
          <span><b>kunyomi</b>${escapeHTML(word.kunyomi || "em expansão")}</span>
        </div>
        ${word.jlpt === "N5" ? `
          <div class="kunyomiNote">
            <b>leitura natural</b>
            <span>Kunyomi costuma aparecer em palavras japonesas nativas, verbos e adjetivos do cotidiano.</span>
          </div>
        ` : ""}
        ${word.memo ? `
          <div class="kanjiMemo">
            <b>memória rápida</b>
            <span>${escapeHTML(word.memo)}</span>
          </div>
        ` : ""}
        <div class="kanjiExamples">
          <b>palavras úteis</b>
          ${(word.examples || []).map(ex => `
            <span>
              <strong>${escapeHTML(ex.jp)}</strong>
              <em>${escapeHTML(ex.romaji)} = ${escapeHTML(ex.pt)}</em>
            </span>
          `).join("")}
        </div>
        ${renderKanjiSentenceBank(word)}
      </div>
    `;
  }

  const JOYO_LEVEL_TARGETS = {
    N5: 100,
    N4: 180,
    N3: 370,
    N2: 367,
    N1: 1119
  };

  function kanjiLevelCount(level) {
    const unique = new Set();
    categoryWords("kanji").forEach(word => {
      if (word.jlpt === level && word.jp) unique.add(word.jp);
    });
    return unique.size;
  }

  function kanjiLevelDisplayCount(level) {
    const total = kanjiLevelCount(level);
    const target = JOYO_LEVEL_TARGETS[level] || total || 1;
    return Math.min(total, target);
  }

  function kanjiLevelOverflowCount(level) {
    const total = kanjiLevelCount(level);
    const target = JOYO_LEVEL_TARGETS[level] || total || 1;
    return Math.max(0, total - target);
  }

  function kanjiTotalCount() {
    const unique = new Set();
    categoryWords("kanji").forEach(word => {
      if (word.jp) unique.add(`${word.jlpt || "?"}:${word.jp}`);
    });
    return unique.size;
  }

  function kanjiTotalDisplayCount() {
    return Object.keys(JOYO_LEVEL_TARGETS).reduce((sum, level) => sum + kanjiLevelDisplayCount(level), 0);
  }

  function kanjiTargetTotal() {
    return Object.values(JOYO_LEVEL_TARGETS).reduce((sum, n) => sum + n, 0);
  }


  const KANJI_LEVEL_GUIDES = {
    N5: {
      icon: "土",
      title: "Base de sobrevivência",
      desc: "números, família, corpo, dias, natureza e ações simples",
      action: "comece aqui se ainda se sente perdido nos kanjis"
    },
    N4: {
      icon: "駅",
      title: "Cotidiano no Japão",
      desc: "viagem, hospital, lojas, documentos simples e comunicação básica",
      action: "use para viver melhor e entender avisos comuns"
    },
    N3: {
      icon: "情",
      title: "Interpretação real",
      desc: "e-mails, placas, trabalho, opinião, causa, resultado e mudança",
      action: "use para sair das palavras soltas e entender contexto"
    },
    N2: {
      icon: "証",
      title: "Documentos e sociedade",
      desc: "contratos, notícias, regras, direitos, deveres e linguagem formal",
      action: "use para ler documentos e textos mais sérios"
    },
    N1: {
      icon: "論",
      title: "Leitura avançada",
      desc: "abstração, literatura, medicina, jurídico, análise e argumentação",
      action: "use para leitura densa e perfil de intérprete"
    }
  };

  function kanjiLevelProgress(level) {
    const rawTotal = kanjiLevelCount(level);
    const total = kanjiLevelDisplayCount(level);
    const target = JOYO_LEVEL_TARGETS[level] || 1;
    const overflow = kanjiLevelOverflowCount(level);
    const percent = Math.min(100, Math.round((total / target) * 100));
    return { total, rawTotal, target, overflow, percent };
  }

  function kanjiGroupPurpose(group) {
    const text = String(group || "").toLowerCase();

    if (text.includes("família") || text.includes("corpo") || text.includes("vida diária") || text.includes("base")) {
      return { icon: "🌱", title: "fundamento", desc: "bom para criar segurança nos primeiros kanjis" };
    }

    if (text.includes("trabalho") || text.includes("fábrica") || text.includes("gestão") || text.includes("serviço")) {
      return { icon: "⚙️", title: "trabalho", desc: "útil para fábrica, turno, líder e rotina profissional" };
    }

    if (text.includes("document") || text.includes("prefeitura") || text.includes("contrato") || text.includes("regra") || text.includes("lei")) {
      return { icon: "📄", title: "documentos", desc: "bom para prefeitura, contrato, comprovante e formulário" };
    }

    if (text.includes("saúde") || text.includes("emergência") || text.includes("hospital") || text.includes("médico")) {
      return { icon: "🩺", title: "saúde", desc: "útil para dor, remédio, hospital e emergência" };
    }

    if (text.includes("interpretação") || text.includes("texto") || text.includes("prova") || text.includes("nuance")) {
      return { icon: "🧠", title: "interpretação", desc: "bom para entender frases, perguntas e textos" };
    }

    if (text.includes("transporte") || text.includes("cidade") || text.includes("viagem") || text.includes("direção")) {
      return { icon: "🚉", title: "cidade", desc: "útil para trem, rua, mapa, saída e deslocamento" };
    }

    if (text.includes("dinheiro") || text.includes("economia") || text.includes("serviços")) {
      return { icon: "💴", title: "dinheiro", desc: "bom para pagamento, imposto, salário e conta" };
    }

    if (text.includes("formal") || text.includes("acadêmico") || text.includes("erudição") || text.includes("densa")) {
      return { icon: "📚", title: "avançado", desc: "para leitura séria, artigos e vocabulário técnico" };
    }

    return { icon: "🔹", title: "lista guiada", desc: "grupo organizado para estudo progressivo" };
  }

  function orderedKanjiGroups(level) {
    const priority = [
      "base", "família", "corpo", "vida", "natureza", "tempo",
      "comunicação", "cidade", "transporte", "trabalho", "fábrica",
      "document", "prefeitura", "saúde", "emergência", "interpretação",
      "texto", "prova", "sociedade", "economia", "formal", "acadêmico"
    ];

    return kanjiGroups(level).sort((a, b) => {
      const ax = priority.findIndex(p => a.toLowerCase().includes(p));
      const bx = priority.findIndex(p => b.toLowerCase().includes(p));
      const av = ax === -1 ? 999 : ax;
      const bv = bx === -1 ? 999 : bx;
      if (av !== bv) return av - bv;
      return a.localeCompare(b);
    });
  }

  function renderKanjiWordCountBadge(word) {
    const sentenceCount = Array.isArray(word.sentences) ? word.sentences.length : 0;
    const examplesCount = Array.isArray(word.examples) ? word.examples.length : 0;
    return sentenceCount
      ? `<small>${sentenceCount} frases</small>`
      : `<small>${examplesCount} palavras</small>`;
  }


  let kanjiVisibleLimit = 12;

  function resetKanjiVisibleLimit() {
    kanjiVisibleLimit = 12;
  }

  function showMoreKanji() {
    if (isKanjiPremiumLocked()) { showCadernoPremiumMessage("kanji"); return; }
    kanjiVisibleLimit += 12;
    render();
  }

  function selectKanjiLevelCompact(level) {
    if (isKanjiPremiumLocked()) { showCadernoPremiumMessage("kanji"); return; }
    selectedKanjiLevel = level;
    const groups = orderedKanjiGroups(level);
    selectedKanjiGroup = groups[0] || "";
    category = "kanji";
    openMenu = "kanji";
    resetKanjiVisibleLimit();
    saveState();
    render();
  }

  function selectKanjiGroupCompact(group) {
    if (isKanjiPremiumLocked()) { showCadernoPremiumMessage("kanji"); return; }
    selectedKanjiGroup = group;
    resetKanjiVisibleLimit();
    saveState();
    render();
  }

  function renderKanjiPremiumLockedPanel() {
    return `
      <div class="kanjiPremiumLockPanel">
        <div class="kanjiLockIcon" aria-hidden="true">鍵</div>
        <div>
          <span class="smartEyebrow">área premium</span>
          <h2>Kanji completo é para assinantes.</h2>
          <p>Na versão grátis, o aluno sente o gosto da escrita japonesa com Hiragana e Katakana nas famílias A, KA e SA. O Kanji fica bloqueado para valorizar o Premium.</p>
        </div>
        <div class="kanjiPremiumBenefits">
          <span>N5, N4, N3, N2 e N1 desbloqueados</span>
          <span>listas por tema e nível</span>
          <span>treino com meta de 7 acertos</span>
        </div>
        <button type="button" class="kanjiPremiumBtn" data-action="goPremium">desbloquear Premium</button>
      </div>
    `;
  }

  function renderKanjiPicker(words) {
    if (isKanjiPremiumLocked()) return renderKanjiPremiumLockedPanel();
    const levels = ["N5", "N4", "N3", "N2", "N1"];
    const currentLevelWords = categoryWords("kanji").filter(word => word.jlpt === selectedKanjiLevel);
    const groups = orderedKanjiGroups(selectedKanjiLevel);
    const hasLevelContent = currentLevelWords.length > 0;
    const selectedGuide = KANJI_LEVEL_GUIDES[selectedKanjiLevel] || KANJI_LEVEL_GUIDES.N5;

    if (hasLevelContent && (!selectedKanjiGroup || !groups.includes(selectedKanjiGroup))) {
      selectedKanjiGroup = groups[0] || "";
    }

    const visibleWords = hasLevelContent
      ? currentLevelWords.filter(word => word.group === selectedKanjiGroup)
      : [];

    const limitedWords = visibleWords.slice(0, kanjiVisibleLimit);
    const remaining = Math.max(0, visibleWords.length - limitedWords.length);
    const currentPurpose = kanjiGroupPurpose(selectedKanjiGroup);

    return `
      <div class="kanjiCompactShell">
        <section class="kanjiCompactHero">
          <div>
            <span class="smartEyebrow">kanji sem enrolação</span>
            <h2>Escolha pouco. Treine melhor.</h2>
            <p>Um nível, uma lista, um kanji por vez.</p>
          </div>
          <div class="kanjiCompactCounter">
            <b>${kanjiTotalDisplayCount()}</b>
            <span>de ${kanjiTargetTotal()}</span>
          </div>
        </section>

        <section class="kanjiCompactChooser">
          <div class="compactField">
            <label for="kanjiLevelSelect">1. Nível</label>
            <select id="kanjiLevelSelect" data-kanji-level-select>
              ${levels.map(level => {
                const guide = KANJI_LEVEL_GUIDES[level];
                const prog = kanjiLevelProgress(level);
                return `
                  <option value="${level}" ${selectedKanjiLevel === level ? "selected" : ""}>
                    ${level} · ${guide.title} · ${prog.total}/${prog.target}
                  </option>
                `;
              }).join("")}
            </select>
            <small>${escapeHTML(selectedGuide.desc)}</small>
          </div>

          ${hasLevelContent ? `
            <div class="compactField">
              <label for="kanjiGroupSelect">2. Lista</label>
              <select id="kanjiGroupSelect" data-kanji-group-select>
                ${groups.map(group => {
                  const total = categoryWords("kanji").filter(word => word.jlpt === selectedKanjiLevel && word.group === group).length;
                  return `
                    <option value="${escapeHTML(group)}" ${selectedKanjiGroup === group ? "selected" : ""}>
                      ${group} · ${total}
                    </option>
                  `;
                }).join("")}
              </select>
              <small>${currentPurpose.icon} ${escapeHTML(currentPurpose.desc)}</small>
            </div>
          ` : ""}
        </section>

        <div class="kanjiCompactLogic">
          <span><b>Onyomi</b> combinações</span>
          <span><b>Kunyomi</b> palavras naturais</span>
          <span><b>Meta</b> 7 acertos</span>
        </div>

        ${!hasLevelContent ? `
          <div class="kanjiComingSoon">
            <b>${escapeHTML(selectedKanjiLevel)} em construção</b>
            <span>Este nível será liberado em listas curtas para evitar excesso visual.</span>
          </div>
        ` : `
          <section class="kanjiCompactListBlock">
            <div class="compactListHead">
              <div>
                <b>3. Kanji da lista</b>
                <span>${limitedWords.length}/${visibleWords.length} visíveis · ${escapeHTML(selectedKanjiGroup)}</span>
              </div>
              ${remaining ? `<button type="button" data-show-more-kanji>ver mais ${Math.min(12, remaining)}</button>` : ""}
            </div>

            <div class="kanjiCompactGrid">
              ${limitedWords.map(word => {
                const p = progressFor(word);
                return `
                  <button type="button" data-word-id="${escapeHTML(word.id)}">
                    <strong>${escapeHTML(word.jp)}</strong>
                    <span>
                      <b>${escapeHTML(word.pt)}</b>
                      <em>${escapeHTML(word.romaji || "leitura em estudo")}</em>
                    </span>
                    <small>${p.correct || 0}/7</small>
                  </button>
                `;
              }).join("")}
            </div>

            ${remaining ? `
              <div class="compactMoreHint">
                <span>Mostrando poucos kanjis para manter o foco. Use “ver mais” só quando estiver pronto.</span>
              </div>
            ` : ""}
          </section>
        `}
      </div>
    `;
  }


  function wrongReviewItems() {
    return WORDS.filter(word => {
      const p = progressFor(word);
      return (p.wrong || 0) > 0 && (p.correct || 0) < 7;
    });
  }

  function reviewErrorCount() {
    return wrongReviewItems().length;
  }

  function startErrorReview() {
    const list = wrongReviewItems();
    if (!list.length) {
      toast("nenhum erro para revisar agora");
      return;
    }

    const next = list.sort((a, b) => {
      const pa = progressFor(a);
      const pb = progressFor(b);
      return (pb.wrong || 0) - (pa.wrong || 0);
    })[0];

    currentWordId = next.id;
    category = next.category || category;
    step = "see";
    openMenu = next.category === "kanji" ? "kanji" : openMenu;
    saveState();
    render();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderErrorReviewPanel() {
    const list = wrongReviewItems();
    if (!list.length) return "";

    const top = list.slice(0, 3);

    return `
      <section class="errorReviewPanel">
        <div>
          <span class="errorReviewIcon">↻</span>
        </div>

        <div class="errorReviewText">
          <b>Revisar erros</b>
          <span>${list.length} item${list.length === 1 ? "" : "s"} esperando uma segunda chance</span>
          <small>${top.map(item => escapeHTML(item.jp)).join(" · ")}</small>
        </div>

        <button type="button" data-start-error-review>começar</button>
      </section>
    `;
  }


  const PHRASE_FORGE_KEY = "caderno321_phrase_forge_v48";

  let phraseForgeState = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PHRASE_FORGE_KEY) || "{}");
      return {
        target: saved.target || "袋",
        targetPt: saved.targetPt || "sacola",
        context: saved.context || "cotidiano",
        tone: saved.tone || "educado",
        phrases: Array.isArray(saved.phrases) ? saved.phrases.slice(0, 3) : ["", "", ""],
        results: Array.isArray(saved.results) ? saved.results.slice(0, 3) : []
      };
    } catch {
      return {
        target: "袋",
        targetPt: "sacola",
        context: "cotidiano",
        tone: "educado",
        phrases: ["", "", ""],
        results: []
      };
    }
  })();

  const PHRASE_FORGE_TARGETS = [
    { jp: "袋", pt: "sacola", context: "loja / konbini" },
    { jp: "日曜日", pt: "domingo", context: "rotina / folga" },
    { jp: "仕事", pt: "trabalho", context: "fábrica / conversa" },
    { jp: "確認", pt: "confirmação", context: "trabalho / documento" },
    { jp: "時間", pt: "tempo / horário", context: "vida diária" },
    { jp: "体調", pt: "condição física", context: "hospital / trabalho" },
    { jp: "機械", pt: "máquina", context: "fábrica" },
    { jp: "予定", pt: "programação", context: "agenda / vida real" }
  ];

  function savePhraseForge() {
    try { localStorage.setItem(PHRASE_FORGE_KEY, JSON.stringify(phraseForgeState)); } catch {}
  }

  function setPhraseForgeTarget(jp) {
    const item = PHRASE_FORGE_TARGETS.find(x => x.jp === jp) || PHRASE_FORGE_TARGETS[0];
    phraseForgeState.target = item.jp;
    phraseForgeState.targetPt = item.pt;
    phraseForgeState.context = item.context;
    phraseForgeState.phrases = ["", "", ""];
    phraseForgeState.results = [];
    savePhraseForge();
    render();
  }

  function updatePhraseForgeInput(index, value) {
    phraseForgeState.phrases[index] = value;
    savePhraseForge();
  }

  function phraseForgeRating(score) {
    if (score <= 3) return { label: "frase fraca", icon: "△", note: "a ideia ainda está solta" };
    if (score <= 6) return { label: "frase comum", icon: "○", note: "dá para usar, mas pode ganhar vida" };
    if (score <= 8) return { label: "frase boa", icon: "◎", note: "já tem intenção real" };
    return { label: "frase genial", icon: "花", note: "isso parece pensamento vivo" };
  }

  function evaluatePhraseForgeText(text) {
    const s = String(text || "").trim();
    const target = phraseForgeState.target;
    let score = 1;
    const tips = [];

    if (!s) {
      return { score: 0, rating: { label: "vazia", icon: "×", note: "ainda não nasceu" }, tips: ["Escreva uma frase usando a palavra-alvo."] };
    }

    if (s.includes(target)) score += 3;
    else tips.push(`Use a palavra-alvo: ${target}.`);

    if (s.length >= 8) score += 1;
    else tips.push("A frase está curta demais. Dê um pouco mais de corpo.");

    if (/[。！？?]/.test(s)) score += 1;
    else tips.push("Finalize com 。, ？ ou ！ para parecer frase completa.");

    if (/[はがをにでへとからまでより]/.test(s)) score += 1;
    else tips.push("Tente usar uma partícula como は, が, を, に ou で.");

    if (/(です|ます|でした|ません|ください|もらえますか|たい|と思います|大丈夫|お願いします)/.test(s)) score += 1;
    else tips.push("Adicione intenção ou tom: です, ます, たい, ください, と思います...");

    if (/(今日|明日|昨日|日曜日|仕事|会社|店|コンビニ|病院|家|駅|工場|機械|袋|時間)/.test(s)) score += 1;
    else tips.push("Coloque a frase em um cenário real: hoje, trabalho, loja, casa, hospital...");

    if (/(けど|ので|から|もし|時|あとで|前に)/.test(s)) score += 1;

    if (/[ぁ-んァ-ン一-龯]/.test(s)) score += 1;
    else tips.push("Use japonês real, mesmo que simples.");

    score = Math.max(1, Math.min(10, score));

    const rating = phraseForgeRating(score);
    if (!tips.length) tips.push("Boa. Agora tente criar uma segunda versão mais natural ou mais educada.");

    return { score, rating, tips: tips.slice(0, 3) };
  }

  function evaluatePhraseForgeAll() {
    phraseForgeState.results = phraseForgeState.phrases.map(evaluatePhraseForgeText);
    savePhraseForge();
    render();
  }

  function phraseForgeSaveGoodOnes() {
    const saved = savedBridgePhrases();
    let count = 0;

    phraseForgeState.phrases.forEach((text, i) => {
      const result = phraseForgeState.results[i] || evaluatePhraseForgeText(text);
      if (text.trim() && result.score >= 6) {
        saved.unshift({
          id: uid("forge_phrase"),
          source: "CADERNO321 Oficina de Frases Próprias",
          jp: text.trim(),
          pt: `frase própria com ${phraseForgeState.target} (${phraseForgeState.targetPt})`,
          score: result.score,
          createdAt: new Date().toISOString()
        });
        count++;
      }
    });

    localStorage.setItem(NIHONGO321_BRIDGE_KEY, JSON.stringify(saved.slice(0, 120)));
    toast(count ? `${count} frase(s) salva(s)` : "nenhuma frase com nota suficiente");
    render();
  }

  function renderPhraseForgePanel() {
    return `
      <section class="phraseForgePanel" aria-label="Oficina de Frases Próprias">
        <div class="phraseForgeHero">
          <span>創</span>
          <div>
            <b>Oficina de Frases Próprias</b>
            <small>aprenda a criar japonês usável, não só engolir frase pronta</small>
          </div>
        </div>

        <div class="phraseForgeTarget">
          <div>
            <small>palavra-alvo</small>
            <strong>${escapeHTML(phraseForgeState.target)}</strong>
            <span>${escapeHTML(phraseForgeState.targetPt)} · ${escapeHTML(phraseForgeState.context)}</span>
          </div>

          <select data-forge-target aria-label="escolher palavra-alvo">
            ${PHRASE_FORGE_TARGETS.map(item => `
              <option value="${escapeHTML(item.jp)}" ${item.jp === phraseForgeState.target ? "selected" : ""}>
                ${item.jp} · ${item.pt}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="phraseForgeMission">
          <b>missão</b>
          <span>Crie 3 frases reais usando <strong>${escapeHTML(phraseForgeState.target)}</strong>. Pense em algo que você usaria no Japão hoje, não frase de livro mofado.</span>
        </div>

        <div class="phraseForgeInputs">
          ${[0,1,2].map(i => {
            const result = phraseForgeState.results[i];
            return `
              <div class="phraseForgeItem">
                <label>frase ${i + 1}</label>
                <textarea data-forge-input="${i}" placeholder="Escreva sua frase em japonês...">${escapeHTML(phraseForgeState.phrases[i] || "")}</textarea>
                ${result ? `
                  <div class="phraseForgeScore">
                    <b>${result.rating.icon} ${result.score}/10</b>
                    <span>${escapeHTML(result.rating.label)} · ${escapeHTML(result.rating.note)}</span>
                    <ul>
                      ${result.tips.map(tip => `<li>${escapeHTML(tip)}</li>`).join("")}
                    </ul>
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>

        <div class="phraseForgeActions">
          <button type="button" data-forge-evaluate>avaliar minhas frases</button>
          <button type="button" data-forge-save>salvar boas no NIHONGO321</button>
        </div>

        <div class="phraseForgeCompass">
          <b>bússola de pensamento</b>
          <span>coisa + situação + ação + intenção</span>
          <em>Ex.: 袋は要りますか。 / 日曜日は仕事です。 / 機械が止まりました。</em>
        </div>
      </section>
    `;
  }



  const GENIAL_PERSONAL_DICT_KEY = "caderno321_personal_dict_v497";

  let genialPersonalDict = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(GENIAL_PERSONAL_DICT_KEY) || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  })();

  function saveGenialPersonalDict() {
    try { localStorage.setItem(GENIAL_PERSONAL_DICT_KEY, JSON.stringify(genialPersonalDict)); } catch {}
  }

  function genialPersonalEntry(token) {
    return genialPersonalDict[String(token || "").toLowerCase()];
  }

  const GENIAL_KEY = "diario321_genial_v49";
  const DIARIO321_PAGES_KEY = "diario321_pages_360_v1";
  const DIARIO321_REVEAL_KEY = "diario321_revealed_meanings_v1";
  const DIARIO321_WORD_PAGES = [
    { id: "page_totsuzen", number: 1, target: "突然", romaji: "totsuzen", meaning: "de repente / inesperadamente", mission: "Crie 3 frases com essa palavra.", total: 3, challenges: ["frase simples", "trabalho", "pergunta"] },
    { id: "page_kakunin", number: 2, target: "確認", romaji: "kakunin", meaning: "confirmação / confirmar", mission: "Crie frases para confirmar algo com clareza.", total: 3, challenges: ["frase simples", "trabalho", "pedido educado"] },
    { id: "page_yotei", number: 3, target: "予定", romaji: "yotei", meaning: "plano / programação", mission: "Crie frases sobre mudança de plano e rotina.", total: 3, challenges: ["hoje", "trabalho", "mudança"] }
  ];


  let genialOnlineTranslation = {
    loading: false,
    text: "",
    error: ""
  };

  let nihongo321SaveTopics = [];
  let nihongo321DefaultTopicId = "topic_caderno321";
  let nihongo321TopicsRequested = false;

  let genialState = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(GENIAL_KEY) || "{}");
      return {
        romaji: saved.romaji || "",
        userPt: saved.userPt || "",
        details: saved.details && typeof saved.details === "object" ? saved.details : { words: "", particles: "", explanation: "", situation: "" },
        mode: "mixed",
        history: Array.isArray(saved.history) ? saved.history.slice(0, 20) : [],
        evaluation: saved.evaluation || null,
        targetTopicId: saved.targetTopicId || "topic_caderno321",
        lastSavedAt: saved.lastSavedAt || ""
      };
    } catch {
      return { romaji: "", userPt: "", details: { words: "", particles: "", explanation: "", situation: "" }, mode: "mixed", history: [], evaluation: null, targetTopicId: "topic_caderno321", lastSavedAt: "" };
    }
  })();

  function saveGenialState() {
    try { localStorage.setItem(GENIAL_KEY, JSON.stringify(genialState)); } catch {}
  }

  function safeSaveTopicName(topicId) {
    const topic = nihongo321SaveTopics.find(item => item && item.id === topicId);
    return topic?.name || "Diário321";
  }

  function normalizedSaveTopics() {
    const fallback = { id: "topic_caderno321", name: "Diário321", description: "Frases criadas no DIÁRIO321.", isDefault: true };
    const list = Array.isArray(nihongo321SaveTopics) ? nihongo321SaveTopics.filter(item => item && item.id && item.name) : [];
    if (!list.some(item => item.id === fallback.id)) list.unshift(fallback);
    return list;
  }

  function selectedSaveTopicId() {
    const topics = normalizedSaveTopics();
    const selected = String(genialState.targetTopicId || nihongo321DefaultTopicId || "topic_caderno321").trim();
    return topics.some(item => item.id === selected) ? selected : (topics[0]?.id || "topic_caderno321");
  }

  function setGenialTargetTopic(topicId) {
    genialState.targetTopicId = String(topicId || "topic_caderno321").trim() || "topic_caderno321";
    saveGenialState();
  }

  function requestNihongo321SaveTopics(force = false) {
    if (!isEmbeddedInNihongo321()) return;
    if (nihongo321TopicsRequested && !force) return;
    nihongo321TopicsRequested = true;
    try {
      window.parent.postMessage({ type: "CADERNO321_REQUEST_TOPICS" }, "*");
    } catch { }
  }

  function renderGenialTopicSelector() {
    const topics = normalizedSaveTopics();
    const selected = selectedSaveTopicId();
    const embedded = isEmbeddedInNihongo321();

    return `
      <label class="genialSaveTarget">
        <span class="notebookTab">SALVAR EM</span>
        <select data-genial-topic ${embedded ? "" : "disabled"}>
          ${topics.map(topic => `
            <option value="${escapeHTML(topic.id)}" ${topic.id === selected ? "selected" : ""}>${escapeHTML(topic.name)}</option>
          `).join("")}
        </select>
        <small>${embedded ? "Escolha o tópico e treine essa frase logo em seguida no 105x." : "No modo isolado, a frase fica guardada para o tópico Diário321."}</small>
      </label>
    `;
  }

  const ROMAJI_COMBOS = [
    ["kya","きゃ"],["kyu","きゅ"],["kyo","きょ"],["gya","ぎゃ"],["gyu","ぎゅ"],["gyo","ぎょ"],
    ["sha","しゃ"],["shu","しゅ"],["sho","しょ"],["sya","しゃ"],["syu","しゅ"],["syo","しょ"],
    ["ja","じゃ"],["ju","じゅ"],["jo","じょ"],["jya","じゃ"],["jyu","じゅ"],["jyo","じょ"],
    ["cha","ちゃ"],["chu","ちゅ"],["cho","ちょ"],["cya","ちゃ"],["cyu","ちゅ"],["cyo","ちょ"],
    ["nya","にゃ"],["nyu","にゅ"],["nyo","にょ"],["hya","ひゃ"],["hyu","ひゅ"],["hyo","ひょ"],
    ["bya","びゃ"],["byu","びゅ"],["byo","びょ"],["pya","ぴゃ"],["pyu","ぴゅ"],["pyo","ぴょ"],
    ["mya","みゃ"],["myu","みゅ"],["myo","みょ"],["rya","りゃ"],["ryu","りゅ"],["ryo","りょ"],
    ["fa","ふぁ"],["fi","ふぃ"],["fe","ふぇ"],["fo","ふぉ"],["fyu","ふゅ"],
    ["va","ゔぁ"],["vi","ゔぃ"],["vu","ゔ"],["ve","ゔぇ"],["vo","ゔぉ"],
    ["tsa","つぁ"],["tsi","つぃ"],["tse","つぇ"],["tso","つぉ"],
    ["she","しぇ"],["je","じぇ"],["che","ちぇ"],["ti","てぃ"],["tu","とぅ"],["di","でぃ"],["du","どぅ"]
  ];

  const ROMAJI_BASIC = {
    a:"あ", i:"い", u:"う", e:"え", o:"お",
    ka:"か", ki:"き", ku:"く", ke:"け", ko:"こ",
    ga:"が", gi:"ぎ", gu:"ぐ", ge:"げ", go:"ご",
    sa:"さ", shi:"し", si:"し", su:"す", se:"せ", so:"そ",
    za:"ざ", ji:"じ", zi:"じ", zu:"ず", ze:"ぜ", zo:"ぞ",
    ta:"た", chi:"ち", ti:"ち", tsu:"つ", tu:"つ", te:"て", to:"と",
    da:"だ", dji:"ぢ", di:"ぢ", dzu:"づ", du:"づ", de:"で", do:"ど",
    na:"な", ni:"に", nu:"ぬ", ne:"ね", no:"の",
    ha:"は", hi:"ひ", fu:"ふ", hu:"ふ", he:"へ", ho:"ほ",
    ba:"ば", bi:"び", bu:"ぶ", be:"べ", bo:"ぼ",
    pa:"ぱ", pi:"ぴ", pu:"ぷ", pe:"ぺ", po:"ぽ",
    ma:"ま", mi:"み", mu:"む", me:"め", mo:"も",
    ya:"や", yu:"ゆ", yo:"よ",
    ra:"ら", ri:"り", ru:"る", re:"れ", ro:"ろ",
    wa:"わ", wo:"を", n:"ん",
    la:"ぁ", li:"ぃ", lu:"ぅ", le:"ぇ", lo:"ぉ",
    xa:"ぁ", xi:"ぃ", xu:"ぅ", xe:"ぇ", xo:"ぉ",
    lya:"ゃ", lyu:"ゅ", lyo:"ょ", xya:"ゃ", xyu:"ゅ", xyo:"ょ",
    ltu:"っ", xtu:"っ", ltsu:"っ", xtsu:"っ"
  };


  const GENIAL_KANJI_WORDS = {

    "boku":"僕",
    "ore":"俺",
    "watashi":"私",
    "watakushi":"私",
    "jibun":"自分",
    "anata":"あなた",
    "kimi":"君",
    "kare":"彼",
    "kanojo":"彼女",
    "nakata":"中田",
    "airuton":"アイルトン",
    "nihon":"日本",
    "nippon":"日本",
    "nihongo":"日本語",
    "burajiru":"ブラジル",
    "burajirujin":"ブラジル人",
    "gaikokujin":"外国人",
    "hito":"人",
    "hitobito":"人々",
    "tomodachi":"友達",
    "kazoku":"家族",
    "chichi":"父",
    "haha":"母",
    "ani":"兄",
    "ane":"姉",
    "otouto":"弟",
    "imouto":"妹",
    "sensei":"先生",
    "senpai":"先輩",
    "kouhai":"後輩",
    "kaishain":"会社員",
    "shain":"社員",
    "buchou":"部長",
    "kachou":"課長",
    "leader":"リーダー",
    "riidaa":"リーダー",
    "han":"班",
    "hancho":"班長",
    "hanchou":"班長",
    "genba":"現場",
    "sagyou":"作業",
    "sagyousha":"作業者",
    "hinshitsu":"品質",
    "seisan":"生産",
    "kensa":"検査",
    "buhin":"部品",
    "seihin":"製品",
    "furyou":"不良",
    "mondai":"問題",
    "riyuu":"理由",
    "houhou":"方法",
    "joukyou":"状況",
    "setsumei":"説明",
    "renraku":"連絡",
    "soudan":"相談",
    "henji":"返事",
    "taio":"対応",
    "taiou":"対応",
    "meiwaku":"迷惑",
    "daiji":"大事",
    "taisetsu":"大切",
    "muri":"無理",
    "kantan":"簡単",
    "muzukashii":"難しい",
    "hayai":"早い",
    "osoi":"遅い",
    "ookii":"大きい",
    "chiisai":"小さい",
    "atarashii":"新しい",
    "furui":"古い",
    "ii":"良い",
    "yoi":"良い",
    "warui":"悪い",
    "samui":"寒い",
    "atsui":"暑い",
    "itai":"痛い",
    "tsukareru":"疲れる",
    "tsukaremashita":"疲れました",
    "ganbaru":"頑張る",
    "ganbarimasu":"頑張ります",
    "benkyou":"勉強",
    "renshuu":"練習",
    "seikatsu":"生活",
    "jinsei":"人生",
    "yume":"夢",
    "mokuhyou":"目標",
    "kibou":"希望",
    "keiken":"経験",
    "doryoku":"努力",
    "seichou":"成長",
    "kansha":"感謝",
    "shourai":"将来",
    "jiyuu":"自由",
    "yuuki":"勇気",
    "kotoba":"言葉",
    "bun":"文",
    "bunshou":"文章",
    "imi":"意味",
    "yomikata":"読み方",
    "kakikata":"書き方",
    "tsukaikata":"使い方",

    "ichi":"一",
    "ni":"二",
    "san":"三",
    "yon":"四",
    "shi":"四",
    "go":"五",
    "roku":"六",
    "nana":"七",
    "shichi":"七",
    "hachi":"八",
    "kyuu":"九",
    "juu":"十",
    "hyaku":"百",
    "sen":"千",
    "man":"万",
    "en":"円",
    "mai":"枚",
    "hitotsu":"一つ",
    "futatsu":"二つ",
    "mittsu":"三つ",
    "yottsu":"四つ",
    "itsutsu":"五つ",
    "asa":"朝",
    "hiru":"昼",
    "yoru":"夜",
    "ban":"晩",
    "hi":"日",
    "nichi":"日",
    "tsuki":"月",
    "kaze":"風",
    "ame":"雨",
    "yuki":"雪",
    "tenki":"天気",
    "hito":"人",
    "watashi":"私",
    "anata":"あなた",
    "kare":"彼",
    "kanojo":"彼女",
    "kodomo":"子供",
    "otoko":"男",
    "onna":"女",
    "te":"手",
    "me":"目",
    "kuchi":"口",
    "mimi":"耳",
    "ashi":"足",
    "karada":"体",
    "onaka":"お腹",
    "atama":"頭",
    "namae":"名前",
    "juusho":"住所",
    "denwa":"電話",
    "bangou":"番号",
    "kaigi":"会議",
    "mondai":"問題",
    "shitsumon":"質問",
    "setsumei":"説明",
    "henji":"返事",
    "renraku":"連絡",
    "teishutsu":"提出",
    "henkou":"変更",
    "hitsuyou":"必要",
    "muryou":"無料",
    "yuuryou":"有料",
    "uketsuke":"受付",
    "chuui":"注意",
    "kinshi":"禁止",
    "anzen":"安全",
    "kiken":"危険",
    "eror":"エラー",
    "eraa":"エラー",
    "mizu":"水",
    "denki":"電気",
    "oto":"音",
    "doa":"ドア",
    "kuruma":"車",
    "jitensha":"自転車",
    "ie":"家",
    "heya":"部屋",
    "kaimono":"買い物",
    "nedan":"値段",
    "ryoukin":"料金",
    "shiharai":"支払い",
    "kudasai":"下さい",
    "onegai":"お願い",
    "tasukete":"助けて",
    "mite":"見て",
    "mimasu":"見ます",
    "iku":"行く",
    "ikimasu":"行きます",
    "kuru":"来る",
    "kimasu":"来ます",
    "kau":"買う",
    "kaimasu":"買います",
    "nomu":"飲む",
    "nomimasu":"飲みます",
    "taberu":"食べる",
    "tabemasu":"食べます",
    "kaku":"書く",
    "kakimasu":"書きます",
    "yomu":"読む",
    "yomimasu":"読みます",
    "hanasu":"話す",
    "hanashimasu":"話します",
    "tomaru":"止まる",
    "tomarimasu":"止まります",
    "kowareru":"壊れる",
    "kowaremashita":"壊れました",
    "machigai":"間違い",
    "machigaemashita":"間違えました",
    "wakaru":"分かる",
    "wakarimasu":"分かります",
    "wakarimasen":"分かりません",
    "nichiyoubi":"日曜日",
    "getsuyoubi":"月曜日",
    "kayoubi":"火曜日",
    "suiyoubi":"水曜日",
    "mokuyoubi":"木曜日",
    "kinyoubi":"金曜日",
    "doyoubi":"土曜日",
    "fukuro":"袋",
    "shigoto":"仕事",
    "jikan":"時間",
    "kakunin":"確認",
    "taichou":"体調",
    "kikai":"機械",
    "yotei":"予定",
    "yasumi":"休み",
    "byouin":"病院",
    "yakusyo":"市役所",
    "kaisha":"会社",
    "koujou":"工場",
    "densha":"電車",
    "eki":"駅",
    "mizu":"水",
    "okane":"お金",
    "namae":"名前",
    "kyou":"今日",
    "totsuzen":"突然",
    "ashita":"明日",
    "kinou":"昨日",
    "daijoubu":"大丈夫",
    "onegaishimasu":"お願いします",
    "sumimasen":"すみません"
  };

  const GENIAL_KATAKANA_WORDS = {
    "konbini":"コンビニ",
    "supaa":"スーパー",
    "suupaa":"スーパー",
    "toire":"トイレ",
    "kamera":"カメラ",
    "pasupooto":"パスポート",
    "basu":"バス",
    "apaato":"アパート",
    "erebeetaa":"エレベーター",
    "botan":"ボタン",
    "memo":"メモ",
    "maiku":"マイク",
    "koppu":"コップ",
    "biru":"ビル",
    "takushii":"タクシー",
    "gasorin":"ガソリン",
    "paato":"パート",
    "arubaito":"アルバイト",
    "sararii":"サラリー",

    // DIÁRIO321 4.11.1 — nomes e palavras estrangeiras comuns no Japão real.
    // Regra para o aluno: k: usa katakana. O dicionário abaixo evita conversões estranhas
    // em nomes brasileiros e palavras de fábrica/rotina.
    "eraa":"エラー",
    "era-":"エラー",
    "error":"エラー",
    "miraa":"ミラー",
    "hoteru":"ホテル",
    "resutoran":"レストラン",
    "koohii":"コーヒー",
    "kafe":"カフェ",
    "sumaho":"スマホ",
    "pasokon":"パソコン",
    "apuri":"アプリ",
    "rain":"ライン",
    "line":"ライン",
    "wiifi":"ワイファイ",
    "wifi":"ワイファイ",
    "sain":"サイン",
    "saizu":"サイズ",
    "taimu":"タイム",
    "riidaa":"リーダー",
    "leader":"リーダー",
    "marcos":"マルコス",
    "makosu":"マルコス",
    "ailton":"アイルトン",
    "airuton":"アイルトン",
    "ana":"アナ",
    "paulo":"パウロ",
    "pauro":"パウロ",
    "maria":"マリア",
    "jose":"ジョゼ",
    "joze":"ジョゼ",
    "carlos":"カルロス",
    "karurosu":"カルロス",
    "bruno":"ブルーノ",
    "buruno":"ブルーノ",
    "lucas":"ルーカス",
    "rukasu":"ルーカス",
    "rafael":"ラファエル",
    "rafaeru":"ラファエル",
    "daniel":"ダニエル",
    "danieru":"ダニエル",
    "fernando":"フェルナンド",
    "ferunando":"フェルナンド",
    "burajiru":"ブラジル",
    "amerika":"アメリカ"
  };

  const GENIAL_PARTICLES = new Set(["wa","ga","wo","o","ni","de","to","mo","kara","made","no","he","e","ya","ka"]);

  function convertParticleToken(token) {
    const map = { wa:"は", ga:"が", wo:"を", o:"を", ni:"に", de:"で", to:"と", mo:"も", kara:"から", made:"まで", no:"の", he:"へ", e:"へ", ya:"や", ka:"か" };
    return map[token] || "";
  }

  function genialTokenToJapanese(token, mode) {
    const raw = String(token || "");
    const lower = raw.toLowerCase();

    if (!raw.trim()) return raw;
    if (/^[。、！？!?.,]+$/.test(raw)) return romajiToKana(raw, "hiragana");

    // Marcadores manuais:
    // k:konbini => コンビニ
    // h:nichiyoubi => にちようび
    // j:nichiyoubi => 日曜日 se existir no dicionário
    if (lower.startsWith("k:")) {
      const body = lower.slice(2);
      return GENIAL_KATAKANA_WORDS[body] || romajiToKana(body, "katakana");
    }
    if (lower.startsWith("h:")) return romajiToKana(lower.slice(2), "hiragana");
    if (lower.startsWith("j:")) {
      const body = lower.slice(2);
      const personal = genialPersonalEntry(body);
      return personal?.jp || GENIAL_KANJI_WORDS[body] || romajiToKana(body, "hiragana");
    }

    if (mode === "katakana") return romajiToKana(lower, "katakana");
    if (mode === "hiragana") return romajiToKana(lower, "hiragana");

    // Modo genial misto:
    if (GENIAL_PARTICLES.has(lower)) return convertParticleToken(lower);
    if (GENIAL_KANJI_WORDS[lower]) return GENIAL_KANJI_WORDS[lower];
    if (GENIAL_KATAKANA_WORDS[lower]) return GENIAL_KATAKANA_WORDS[lower];

    return romajiToKana(lower, "hiragana");
  }

  function romajiToSmartJapanese(input, mode = "mixed") {
    const text = String(input || "").replace(/\r\n?/g, "\n");
    if (mode === "hiragana" || mode === "katakana") return romajiToKana(text, mode);

    // DIÁRIO321 4.10.15:
    // preserva cada ENTER do aluno para ROMAJI e JAPONÊS respirarem em linhas simétricas.
    // Antes, o replace(/\s+/g, " ") achatava \n e quebrava a ideia de folha.
    return text.split("\n").map(line => {
      const parts = line.split(/(\s+|[.,!?。、！？])/g);
      return parts.map(part => {
        if (/^\s+$/.test(part)) return " ";
        return genialTokenToJapanese(part, mode);
      }).join("").replace(/[ \t]+/g, " ").trimEnd();
    }).join("\n");
  }


  const GENIAL_PT_WORDS = {
    "車":"carro",
    "赤い":"vermelho",
    "青い":"azul",
    "白い":"branco",
    "黒い":"preto",
    "安い":"barato",
    "高い":"caro/alto",
    "長い":"longo",
    "短い":"curto",
    "12時間":"12 horas",

    "僕":"eu",
    "俺":"eu informal/masculino",
    "私":"eu",
    "自分":"eu mesmo / si próprio",
    "中田":"Nakata",
    "日本":"Japão",
    "日本語":"idioma japonês",
    "ブラジル":"Brasil",
    "ブラジル人":"brasileiro",
    "外国人":"estrangeiro",
    "友達":"amigo",
    "家族":"família",
    "先生":"professor",
    "先輩":"senpai",
    "後輩":"kohai",
    "現場":"local de trabalho",
    "作業":"operação / tarefa",
    "品質":"qualidade",
    "検査":"inspeção",
    "部品":"peça",
    "製品":"produto",
    "不良":"defeito",
    "状況":"situação",
    "相談":"consulta / conversa",
    "対応":"atendimento / reação",
    "迷惑":"incômodo",
    "無理":"impossível / pesado demais",
    "簡単":"fácil",
    "難しい":"difícil",
    "疲れました":"estou cansado",
    "勉強":"estudo",
    "練習":"treino",
    "生活":"vida cotidiana",
    "人生":"vida",
    "夢":"sonho",
    "目標":"objetivo",
    "希望":"esperança",
    "経験":"experiência",
    "努力":"esforço",
    "成長":"crescimento",
    "感謝":"gratidão",
    "自由":"liberdade",
    "勇気":"coragem",
    "言葉":"palavra / linguagem",
    "意味":"significado",
    "読み方":"forma de leitura",
    "書き方":"forma de escrita",
    "使い方":"forma de uso",
    "袋":"sacola",
    "日曜日":"domingo",
    "一":"um",
    "二":"dois",
    "三":"três",
    "四":"quatro",
    "五":"cinco",
    "枚":"unidade para coisas finas/sacola/folha",
    "下さい":"por favor / me dê",
    "ください":"por favor / me dê",
    "買います":"vou comprar / compro",
    "買う":"comprar",
    "仕事":"trabalho",
    "時間":"tempo / horário",
    "確認":"confirmação",
    "体調":"condição física",
    "機械":"máquina",
    "予定":"programação / plano",
    "今日":"hoje",
    "明日":"amanhã",
    "昨日":"ontem",
    "コンビニ":"loja de conveniência",
    "スーパー":"supermercado",
    "病院":"hospital",
    "会社":"empresa",
    "工場":"fábrica",
    "水":"água",
    "お金":"dinheiro",
    "名前":"nome",
    "住所":"endereço",
    "お願いします":"por favor / peço sua ajuda",
    "すみません":"com licença / desculpe",
    "大丈夫":"tudo bem / sem problema"
  };


  function normalizeGenialRomajiForMeaning(romaji = "") {
    return String(romaji || "")
      .toLowerCase()
      .replace(/j:/g, "")
      .replace(/k:/g, "")
      .replace(/[。！？!?.,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactJapaneseForMeaning(jp = "") {
    return String(jp || "").replace(/[\s　]+/g, "");
  }

  function genialTranslateLineByIntent(jp = "", romaji = "") {
    const raw = normalizeGenialRomajiForMeaning(romaji);
    const text = String(jp || "");
    const compact = compactJapaneseForMeaning(text);

    if ((raw.includes("boku no kuruma") || compact.includes("僕の車")) &&
        (
          raw.includes("akai jyanai") ||
          raw.includes("akai janai") ||
          raw.includes("akai ja nai") ||
          raw.includes("akai ja arimasen") ||
          compact.includes("赤いじゃない") ||
          compact.includes("赤いじゃありません") ||
          compact.includes("赤くない")
        )) {
      return "Meu carro não é vermelho.";
    }

    if ((raw.includes("kuruma") || compact.includes("車")) &&
        (raw.includes("akai") || compact.includes("赤い")) &&
        (
          raw.includes("janai") ||
          raw.includes("jyanai") ||
          raw.includes("ja nai") ||
          raw.includes("ja arimasen") ||
          compact.includes("じゃない") ||
          compact.includes("じゃありません") ||
          compact.includes("くない")
        )) {
      return "O carro não é vermelho.";
    }

    if ((raw.includes("shigoto") || compact.includes("仕事")) &&
        (raw.includes("12") || raw.includes("juuni") || raw.includes("juunijikan") || compact.includes("12時間")) &&
        (raw.includes("tatte") || compact.includes("たって"))) {
      return "Já se passaram 12 horas de trabalho.";
    }

    if ((raw.includes("shigoto") || compact.includes("仕事")) &&
        (raw.includes("12") || raw.includes("juuni") || compact.includes("12時間"))) {
      return "O trabalho é de 12 horas.";
    }

    if ((raw.includes("shitsumon") || compact.includes("質問")) &&
        (raw.includes("arimasuka") || compact.includes("ありますか"))) {
      return "Você tem alguma pergunta?";
    }

    if ((raw.includes("fukuro") || compact.includes("袋")) &&
        (raw.includes("kudasai") || compact.includes("ください") || compact.includes("下さい"))) {
      if (raw.includes("sanmai") || compact.includes("三枚")) return "Três sacolas, por favor.";
      if (raw.includes("nimai") || compact.includes("二枚")) return "Duas sacolas, por favor.";
      if (raw.includes("ichimai") || compact.includes("一枚")) return "Uma sacola, por favor.";
      return "Uma sacola, por favor.";
    }

    if ((raw.includes("nichiyoubi") || compact.includes("日曜日")) &&
        (raw.includes("yasumi") || compact.includes("休み"))) {
      return "Domingo é folga.";
    }

    if ((raw.includes("nichiyoubi") || compact.includes("日曜日")) &&
        (raw.includes("shigoto") || compact.includes("仕事"))) {
      return "Domingo tem trabalho.";
    }

    if ((raw.includes("totsuzen") || compact.includes("突然")) &&
        (raw.includes("eraa") || raw.includes("era-") || raw.includes("error") || compact.includes("エラー")) &&
        (raw.includes("demashita") || raw.includes("dete") || compact.includes("出ました") || compact.includes("出て"))) {
      return "Apareceu um erro de repente.";
    }

    if ((raw.includes("totsuzen") || compact.includes("突然")) &&
        (raw.includes("kikai") || compact.includes("機械")) &&
        (raw.includes("tomarimashita") || raw.includes("tomatta") || compact.includes("止まりました") || compact.includes("止まった"))) {
      return "A máquina parou de repente.";
    }

    if ((raw.includes("kikai") || compact.includes("機械")) &&
        (raw.includes("tomarimashita") || raw.includes("tomatta") || compact.includes("止まりました") || compact.includes("止まった"))) {
      return "A máquina parou.";
    }

    if ((raw.includes("kakunin") || compact.includes("確認")) &&
        (raw.includes("shitai") || compact.includes("したい"))) {
      return "Quero confirmar.";
    }

    if (raw.includes("arigatou") || compact.includes("ありがとう")) {
      return "Obrigado.";
    }

    return "";
  }

  function genialTranslateByIntent(jp = "", romaji = "") {
    const jpLines = String(jp || "").replace(/\r\n?/g, "\n").split("\n");
    const romajiLines = String(romaji || "").replace(/\r\n?/g, "\n").split("\n");
    const ideas = jpLines.map((line, index) => {
      const direct = genialTranslateLineByIntent(line, romajiLines[index] || "");
      if (direct) return direct;
      return genialTranslateFallback(line);
    }).filter(Boolean);

    return ideas.length ? ideas.join("\n") : "";
  }

  function genialTranslateFallback(jp = "") {
    const text = String(jp || "").trim();
    const compact = compactJapaneseForMeaning(text);
    const pieces = [];

    Object.keys(GENIAL_PT_WORDS)
      .sort((a, b) => b.length - a.length)
      .forEach(key => {
        if (compact.includes(key) && !pieces.includes(GENIAL_PT_WORDS[key])) {
          pieces.push(GENIAL_PT_WORDS[key]);
        }
      });

    Object.values(genialPersonalDict).forEach(item => {
      if (item?.jp && compact.includes(item.jp) && item.pt && !pieces.includes(item.pt)) {
        pieces.push(item.pt);
      }
    });

    let guess = "";

    if (/袋.*(一|二|三|四|五).*枚.*(ください|下さい)/.test(compact)) {
      const amount = compact.includes("三") ? "três" : compact.includes("二") ? "duas" : compact.includes("五") ? "cinco" : compact.includes("四") ? "quatro" : "uma";
      guess = `${amount.charAt(0).toUpperCase() + amount.slice(1)} sacola(s), por favor.`;
    } else if (/日曜日.*(休み|やすみ)/.test(compact)) {
      guess = "Domingo é folga.";
    } else if (/日曜日.*仕事/.test(compact)) {
      guess = "Domingo tem trabalho.";
    } else if (/僕.*は/.test(compact)) {
      guess = "Frase sobre mim / sobre eu.";
    } else if (/コンビニ.*袋.*買/.test(compact)) {
      guess = "Vou comprar uma sacola no konbini.";
    } else if (/機械.*止/.test(compact)) {
      guess = "A máquina parou.";
    } else if (/確認/.test(compact)) {
      guess = "Quero confirmar / verificar.";
    }

    if (guess) return guess;

    if (pieces.length >= 2) {
      return pieces.join(" · ") + ".";
    }

    if (pieces.length === 1) {
      const only = pieces[0];
      return only.charAt(0).toUpperCase() + only.slice(1) + ".";
    }

    return "";
  }

  function genialTranslatePt(jp, romaji = "") {
    const text = String(jp || "").trim();
    if (!text) return "A tradução aparecerá aqui.";

    const intent = genialTranslateByIntent(text, romaji);
    if (intent) return intent;

    return "Complete mais a frase para eu mostrar um sentido melhor em português.";
  }


  function genialSmartSuggestions(jp, romaji = "") {
    const raw = String(romaji || "").toLowerCase();
    const text = String(jp || "");
    const suggestions = [];

    if (/\bniha\b/.test(raw) || text.includes("には")) {
      suggestions.push("“niha” quase nunca deve ser digitado como uma peça só aqui. に indica direção/lugar/tempo, は marca o tema. Em “袋には…”, soa como “dentro/quanto à sacola”, mas para pedir sacola o mais natural é 袋は ou 袋を, dependendo da frase.");
    }

    if (/袋には.*枚/.test(text)) {
      suggestions.push("Nesta frase, 袋には não soa natural. Para dizer “três sacolas, por favor”, use 袋を三枚ください ou 袋は三枚ください.");
    }

    if (/袋 は .*枚.*下さい/.test(text) || /袋は.*枚.*下さい/.test(text)) {
      suggestions.push("Boa direção. 袋は三枚下さい é compreensível, mas 袋を三枚ください fica mais natural quando você está pedindo sacolas.");
    }

    if (/下さい/.test(text)) {
      suggestions.push("下さる/下さい existe, mas em frases modernas de app para o dia a dia, ください em hiragana costuma parecer mais natural e menos duro.");
    }

    if (/\bj:kudasai\b/.test(raw)) {
      suggestions.push("Para pedidos do cotidiano, talvez seja melhor escrever apenas kudasai sem j:, para sair ください em hiragana.");
    }

    if (!/[はがをにで]/.test(text)) {
      suggestions.push("A frase precisa de uma partícula para respirar melhor: は tema, が foco, を alvo da ação, に direção/tempo, で local/meio.");
    }

    if (!/[。！？?]/.test(text)) {
      suggestions.push("Finalize com 。, ？ ou ！ para a frase ficar completa.");
    }

    if (/\bk:/.test(raw) && !/[ァ-ン]/.test(text)) {
      suggestions.push("Você usou k:, mas não apareceu katakana. Verifique se a palavra estrangeira está escrita em romaji conhecido.");
    }

    if (/\bj:/.test(raw) && !/[一-龯]/.test(text)) {
      suggestions.push("Você usou j:, mas não apareceu kanji. Essa palavra ainda precisa entrar no dicionário local.");
    }

    return suggestions.slice(0, 5);
  }


  function genialUnknownKanjiMarkers(romaji = "") {
    const raw = String(romaji || "").toLowerCase();
    const matches = Array.from(raw.matchAll(/\bj:([a-z0-9'_:-]+)/g)).map(m => m[1].replace(/[^a-z0-9'_:-]/g, ""));
    return matches.filter(token => token && !GENIAL_KANJI_WORDS[token] && !genialPersonalEntry(token));
  }

  function evaluateGenialSentence(jp, romaji) {
    const text = String(jp || "").trim();
    const raw = String(romaji || "").trim();
    let score = 1;
    const tips = [];

    if (!raw) {
      return { score: 0, label: "vazia", icon: "×", tips: ["Digite uma ideia em romaji primeiro."], pt: "A tradução aparecerá aqui." };
    }

    if (/[ぁ-ん]/.test(text)) score += 1;
    else tips.push("Inclua hiragana para partes gramaticais e verbos.");

    if (/[ァ-ン]/.test(text)) score += 1;
    else if (/\bk:/i.test(raw)) tips.push("Você marcou k:, mas o katakana não apareceu. Revise a palavra estrangeira.");

    if (/[一-龯]/.test(text)) score += 2;
    else if (/\bj:/i.test(raw)) tips.push("Você usou j:, mas essa palavra ainda não existe no dicionário de kanji."); 
    else tips.push("Tente usar pelo menos uma palavra em kanji. Ex.: j:nichiyoubi ou j:fukuro.");

    if (/[はがをにでとのもへからまで]/.test(text)) score += 2;
    else tips.push("A frase precisa de partícula: は, が, を, に, で...");

    if (/(です|ます|した|ません|ください|たい|と思います|大丈夫|お願いします|できません|あります|います)/.test(text)) score += 2;
    else tips.push("Coloque um final usável: です, ます, たい, ください, と思います...");

    if (/(今日|明日|昨日|日曜日|仕事|時間|会社|工場|病院|市役所|コンビニ|スーパー|袋|確認|予定|体調|機械)/.test(text)) score += 1;
    else tips.push("Amarre a frase em uma situação real: trabalho, domingo, horário, loja, hospital...");

    if (/[。！？?]/.test(text)) score += 1;
    else tips.push("Finalize com 。, ？ ou ！ para dar cara de frase completa.");

    score = Math.max(1, Math.min(10, score));

    let label = "frase fraca";
    let icon = "△";
    if (score >= 9) { label = "frase genial"; icon = "花"; }
    else if (score >= 7) { label = "frase boa"; icon = "◎"; }
    else if (score >= 4) { label = "frase comum"; icon = "○"; }

    const smart = genialSmartSuggestions(text, raw);
    smart.forEach(tip => {
      if (!tips.includes(tip)) tips.unshift(tip);
    });

    if (!tips.length) tips.push("Boa. Agora tente fazer uma versão mais educada, mais curta ou mais natural.");

    return { score, label, icon, tips: tips.slice(0, 5), pt: genialTranslatePt(text, raw) };
  }

  function hiraToKata(text) {
    return String(text).replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
  }

  function romajiToKana(input, mode = "hiragana") {
    let s = String(input || "").toLowerCase();
    let out = "";
    let i = 0;

    while (i < s.length) {
      const rest = s.slice(i);

      if (rest.startsWith(" ")) { out += " "; i++; continue; }
      if (rest.startsWith("\n")) { out += "\n"; i++; continue; }
      if (rest.startsWith(".")) { out += "。"; i++; continue; }
      if (rest.startsWith(",")) { out += "、"; i++; continue; }
      if (rest.startsWith("?")) { out += "？"; i++; continue; }
      if (rest.startsWith("!")) { out += "！"; i++; continue; }
      if (rest.startsWith("-")) { out += "ー"; i++; continue; }

      const c = s[i];
      const next = s[i + 1];

      if (c === next && "bcdfghjklmpqrstvwxyz".includes(c) && c !== "n") {
        out += "っ";
        i++;
        continue;
      }

      if (c === "n") {
        const after = s[i + 1] || "";
        if (!after || " bcdfghjklmpqrstvwxyz.,?!-\n".includes(after)) {
          out += "ん";
          i++;
          continue;
        }
        if (after === "'") {
          out += "ん";
          i += 2;
          continue;
        }
      }

      let matched = false;

      for (const [roma, kana] of ROMAJI_COMBOS) {
        if (rest.startsWith(roma)) {
          out += kana;
          i += roma.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      for (const len of [3, 2, 1]) {
        const part = rest.slice(0, len);
        if (ROMAJI_BASIC[part]) {
          out += ROMAJI_BASIC[part];
          i += len;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      out += s[i];
      i++;
    }

    return mode === "katakana" ? hiraToKata(out) : out;
  }

  function genialConverted() {
    return romajiToSmartJapanese(genialState.romaji, "mixed");
  }

  function updateGenialRomaji(value) {
    genialState.romaji = String(value || "").replace(/\r\n?/g, "\n");
    saveGenialState();
    const out = document.querySelector("[data-genial-output]");
    const jp = genialConverted();
    if (out) out.textContent = jp || "ここに日本語が出ます";
    genialState.evaluation = null;
    genialState.lastSavedAt = "";
    genialOnlineTranslation = { loading: false, text: "", error: "" };
  }
  function updateGenialPt(value) {
    genialState.userPt = String(value || "").replace(/\r\n?/g, "\n");
    saveGenialState();
  }
  function updateGenialDetail(field, value) {
    const allowed = ["words", "particles", "explanation", "situation"];
    if (!allowed.includes(field)) return;
    genialState.details ||= { words: "", particles: "", explanation: "", situation: "" };
    genialState.details[field] = String(value || "").replace(/\r\n?/g, "\n");
    saveGenialState();
  }

  function setGenialMode(mode) {
    genialState.mode = mode;
    saveGenialState();
    render();
  }


  function encodeDiário321TransferPayload(payload) {
    try {
      const json = JSON.stringify(payload);
      return btoa(unescape(encodeURIComponent(json)));
    } catch (err) {
      console.error("DIÁRIO321 payload encode error:", err);
      return "";
    }
  }

  function isEmbeddedInNihongo321() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      return params.get("embedded") === "1" || window.parent !== window;
    } catch {
      return window.parent !== window;
    }
  }

  function setGenialSaveError(message) {
    genialState.lastSavePending = false;
    genialState.lastSaveError = String(message || "não foi possível salvar.");
    genialState.lastSavedAt = "";
    saveGenialState();
    render();
    scrollGenialSaveStatusIntoView();
  }

  function caderno321SaveErrorMessage(error = "") {
    const key = String(error || "");
    const map = {
      empty_jp: "O japonês não foi gerado. Digite algo em ROMAJI antes de salvar.",
      bridge_write_failed: "Não consegui gravar a ponte de segurança no navegador.",
      save_failed: "O NIHONGO321 recebeu a frase, mas houve erro ao gravar no banco real.",
      phrase_not_found: "A frase foi salva, mas não encontrei ela para abrir o treino agora.",
      direct_save_failed: "Não consegui gravar no armazenamento do navegador. Recarregue o app e tente novamente."
    };
    return map[key] || "O NIHONGO321 recebeu a frase, mas não confirmou o salvamento.";
  }


  function applyNihongo321DirectSaveSuccess(data = {}) {
    genialState.lastSavedAt = new Date().toISOString();
    genialState.lastSavePending = false;
    genialState.lastSaveDirect = true;
    genialState.lastSaveCount = Number(data.total || 0);
    genialState.lastSaveError = "";
    genialState.lastSavedTopicId = data.topicId || genialState.lastSavedTopicId || selectedSaveTopicId();
    genialState.lastSavedTopicName = data.topicName || safeSaveTopicName(genialState.lastSavedTopicId);
    genialState.lastSavedPhraseId = data.phraseId || genialState.lastSavedPhraseId || "";
    saveGenialState();
    toast(data.imported ? "frase salva no NIHONGO321" : "frase atualizada no NIHONGO321");
    render();
    scrollGenialSaveStatusIntoView();
  }



  const NIHONGO321_STATE_KEY = "jp_105x_v7";

  function caderno321ReadNihongoStateLocal() {
    try {
      const raw = localStorage.getItem(NIHONGO321_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") return parsed;
    } catch (err) {
      console.error("DIÁRIO321 direct NIHONGO state read error:", err);
    }

    const t = Date.now();
    return {
      app: { schemaVersion: 8.2, createdAt: t, updatedAt: t },
      prefs: { theme: "dark", audio: { enabled: true, volume: 0.35, unlocked: false }, haptics: { enabled: true } },
      monetization: { premiumUnlocked: false, seenPaywall: false },
      admin: { unlocked: false, lastLoginAt: null },
      stats: { coins: 0, bestCoins: 0, cyclesDone: 0, phrasesMastered: 0, listens: 0, calls: 0 },
      habit: { firstDay: null, days: {} },
      aiStudio: { history: [] },
      tutorial: { done: false, currentStep: 0, completedAt: null },
      goals: { dailyMinutes: 5, dailyCycles: 1 },
      favorites: { phraseIds: [] },
      bank: { topics: [], phrases: [] },
      progress: {},
      session: { inProgress: false, queue: [], index: 0, phraseId: null, callMode: false, topicFilter: "ALL", study: { day: new Date().toISOString().slice(0, 10), totalMs: 0, running: false, runStartAt: null } },
      ui: { lastToast: "", collapsedTopics: {}, onboardingSeen: false, onboardingStep: 0 }
    };
  }

  function caderno321WriteNihongoStateLocal(state) {
    try {
      state.app ||= {};
      state.app.updatedAt = Date.now();
      localStorage.setItem(NIHONGO321_STATE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error("DIÁRIO321 direct NIHONGO state write error:", err);
      return false;
    }
  }

  function caderno321PhraseSignatureLocal(item = {}) {
    return `${String(item.jp || "").trim()}||${String(item.pt || "").trim()}`;
  }

  function caderno321EnsureTopicLocal(state, requestedId = "topic_caderno321", requestedName = "Diário321") {
    state.bank ||= {};
    state.bank.topics ||= [];
    state.bank.phrases ||= [];

    const wanted = String(requestedId || "topic_caderno321").trim() || "topic_caderno321";
    const found = state.bank.topics.find(topic => topic && topic.id === wanted);
    if (found) return found;

    let fallback = state.bank.topics.find(topic => topic && topic.id === "topic_caderno321");
    if (!fallback) {
      const t = Date.now();
      fallback = {
        id: "topic_caderno321",
        name: "Diário321",
        icon: "筆",
        description: "Frases criadas pelo aluno no DIÁRIO321.",
        isPremium: false,
        createdAt: t,
        updatedAt: t
      };
      state.bank.topics.unshift(fallback);
    }

    return wanted === "topic_caderno321" ? fallback : fallback;
  }

  function caderno321SavePhraseDirectlyToNihongoLocal(phrase = {}) {
    const jp = String(phrase.jp || "").trim();
    const pt = String(phrase.pt || "").trim();
    if (!jp) return { ok: false, error: "empty_jp" };
    if (!pt) return { ok: false, error: "empty_pt" };

    const state = caderno321ReadNihongoStateLocal();
    state.bank ||= {};
    state.bank.topics ||= [];
    state.bank.phrases ||= [];
    state.progress ||= {};
    state.session ||= {};

    const requestedTopicId = String(phrase.topicId || phrase.targetTopicId || phrase.caderno321?.targetTopicId || "topic_caderno321").trim() || "topic_caderno321";
    const topic = caderno321EnsureTopicLocal(state, requestedTopicId, phrase.targetTopicName || phrase.caderno321?.targetTopicName || "Diário321");
    const nowMs = Date.now();
    const sig = caderno321PhraseSignatureLocal(phrase);
    const existingIndex = state.bank.phrases.findIndex(item => caderno321PhraseSignatureLocal(item) === sig);

    const newWords = Array.isArray(phrase.newWords)
      ? phrase.newWords.filter(item => item && String(item.jp || "").trim()).map(item => ({ jp: String(item.jp || "").trim(), pt: String(item.pt || "").trim() }))
      : [];

    const savedPhrase = {
      id: existingIndex >= 0 ? state.bank.phrases[existingIndex].id : (phrase.id || uid("cad321")),
      jp,
      pt,
      newWords,
      topicId: topic.id,
      source: "CADERNO321",
      caderno321: phrase.caderno321 || null,
      note: phrase.note || "",
      createdAt: existingIndex >= 0 ? (state.bank.phrases[existingIndex].createdAt || nowMs) : nowMs,
      updatedAt: nowMs
    };

    if (existingIndex >= 0) {
      state.bank.phrases[existingIndex] = { ...state.bank.phrases[existingIndex], ...savedPhrase };
    } else {
      state.bank.phrases.unshift(savedPhrase);
    }

    state.progress[savedPhrase.id] ||= {
      status: "training",
      cycleStart: 14,
      count: 14,
      masteredAt: null,
      history: []
    };

    const ok = caderno321WriteNihongoStateLocal(state);
    if (!ok) return { ok: false, error: "local_storage_write_failed" };

    return {
      ok: true,
      imported: existingIndex >= 0 ? 0 : 1,
      updated: existingIndex >= 0 ? 1 : 0,
      total: state.bank.phrases.length,
      topicId: topic.id,
      topicName: topic.name || "Diário321",
      phraseId: savedPhrase.id
    };
  }

  function caderno321PrepareTrainingDirectlyInNihongoLocal(phraseId = "", topicId = "topic_caderno321") {
    const state = caderno321ReadNihongoStateLocal();
    const phrases = Array.isArray(state.bank?.phrases) ? state.bank.phrases : [];
    const wantedPhraseId = String(phraseId || "").trim();
    const wantedTopicId = String(topicId || "topic_caderno321").trim() || "topic_caderno321";

    let target = wantedPhraseId ? phrases.find(item => item && item.id === wantedPhraseId) : null;
    if (!target) target = phrases.find(item => item && item.topicId === wantedTopicId && item.source === "DIÁRIO321");
    if (!target) target = phrases.find(item => item && item.topicId === "topic_caderno321");
    if (!target) return { ok: false, error: "phrase_not_found" };

    const queue = [
      target.id,
      ...phrases
        .filter(item => item && item.id !== target.id && item.topicId === target.topicId)
        .map(item => item.id)
    ].filter(Boolean);

    state.progress ||= {};
    state.progress[target.id] ||= { status: "training", cycleStart: 14, count: 14, masteredAt: null, history: [] };
    state.session ||= {};
    state.session.inProgress = true;
    state.session.topicFilter = target.topicId || wantedTopicId;
    state.session.queue = queue;
    state.session.index = 0;
    state.session.phraseId = target.id;
    state.session.callMode = false;
    state.session.study ||= { day: new Date().toISOString().slice(0, 10), totalMs: 0, running: false, runStartAt: null };

    const ok = caderno321WriteNihongoStateLocal(state);
    if (!ok) return { ok: false, error: "local_storage_write_failed" };
    return { ok: true, phraseId: target.id, topicId: target.topicId || wantedTopicId };
  }

  function caderno321OpenNihongoTrainingDirectly() {
    const result = caderno321PrepareTrainingDirectlyInNihongoLocal(
      genialState.lastSavedPhraseId || "",
      genialState.lastSavedTopicId || selectedSaveTopicId()
    );

    if (!result.ok) return false;

    const targetUrl = new URL("../index.html#/105x", window.location.href).href;
    try {
      if (isEmbeddedInNihongo321() && window.parent && window.parent !== window) {
        window.parent.location.href = targetUrl;
      } else {
        window.location.href = targetUrl;
      }
    } catch {
      window.location.href = targetUrl;
    }
    return true;
  }


  function openNihongo321WithCadernoPhrase(phrase) {
    const payload = {
      schema: "caderno321_to_nihongo321_v1",
      source: "CADERNO321",
      exportedAt: new Date().toISOString(),
      phrases: [phrase]
    };

    if (isEmbeddedInNihongo321()) {
      const requestId = uid("save_req");
      payload.requestId = requestId;

      try {
        genialState.lastSaveRequestId = requestId;
        genialState.lastSavePending = true;
        genialState.lastSaveError = "";
        genialState.lastSavedAt = "";
        saveGenialState();
        render();
        scrollGenialSaveStatusIntoView();

        try {
          const directSave = window.parent?.NIHONGO321_CADERNO321_DIRECT_SAVE;
          if (typeof directSave === "function") {
            const directResult = directSave(payload);
            if (directResult && directResult.ok) {
              applyNihongo321DirectSaveSuccess({ ...directResult, requestId });
              return true;
            }
          }
        } catch (directErr) {
          console.error("DIÁRIO321 direct parent save error:", directErr);
        }

        window.parent.postMessage({ type: "CADERNO321_SAVE_PHRASE", payload }, "*");
        toast("enviado ao NIHONGO321 para salvar");

        setTimeout(() => {
          if (genialState.lastSavePending && genialState.lastSaveRequestId === requestId) {
            setGenialSaveError("Enviei a frase ao NIHONGO321, mas não recebi confirmação real. A frase ficou guardada na ponte de segurança.");
          }
        }, 3500);

        return true;
      } catch (err) {
        console.error("DIÁRIO321 postMessage save error:", err);
        setGenialSaveError("Não consegui enviar a frase para o NIHONGO321 integrado. A frase ficou guardada na ponte de segurança.");
      }
    }

    const encoded = encodeDiário321TransferPayload(payload);
    if (!encoded) {
      toast("não consegui preparar a frase para enviar");
      return false;
    }
    const target = `../index.html?caderno321_import=${encodeURIComponent(encoded)}#/home`;
    window.location.href = target;
    return true;
  }

  function saveGenialPhrase() {
    const jp = genialConverted().trim();
    const pt = String(genialState.userPt || "").trim();

    if (!String(genialState.romaji || "").trim()) {
      setGenialSaveError("Digite algo em ROMAJI primeiro.");
      toast("digite algo em romaji primeiro");
      return;
    }

    if (!jp) {
      setGenialSaveError("O japonês ainda não foi gerado. Revise o ROMAJI e tente novamente.");
      toast("japonês não gerado");
      return;
    }

    if (!pt) {
      setGenialSaveError("Preencha a tradução da frase em português antes de salvar. Os detalhes continuam opcionais.");
      toast("preencha a tradução");
      return;
    }

    const details = normalizeGenialDetails();
    const detailsText = formatGenialDetailsText(details);
    const topicId = selectedSaveTopicId();

    const phrase = {
      id: uid("genial_phrase"),
      source: "CADERNO321 Diário Genial",
      jp,
      pt,
      topicId,
      targetTopicId: topicId,
      targetTopicName: safeSaveTopicName(topicId),
      newWords: parseGenialWords(details),
      caderno321: {
        romaji: genialState.romaji,
        targetTopicId: topicId,
        targetTopicName: safeSaveTopicName(topicId),
        details,
        detailsText,
        sourceVersion: "4.17.10-R"
      },
      note: detailsText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingBridge = savedBridgePhrases();
    const signature = bridgePhraseSignature(phrase);
    const isUpdatingExisting = existingBridge.some(item => bridgePhraseSignature(item) === signature);

    if (!isUpdatingExisting && genialFreeLimitReached()) {
      genialState.lastSaveError = `Limite grátis atingido: ${GENIAL_FREE_PHRASE_LIMIT} frases no Diário Genial. A frase não foi enviada. Para testar novamente, use Premium/admin ou apague frases antigas de teste.`;
      genialState.lastSavePending = false;
      saveGenialState();
      showCadernoPremiumMessage("genial");
      render();
      return;
    }

    const bridgeResult = savePhraseToNihongo321Bridge(phrase);
    if (!bridgeResult.ok) {
      genialState.lastSaveError = "Não consegui guardar a frase na ponte de segurança do navegador.";
      genialState.lastSavePending = false;
      saveGenialState();
      render();
      scrollGenialSaveStatusIntoView();
      return;
    }

    const finalPhrase = bridgeResult.phrase || phrase;

    // DIÁRIO321 4.10.39:
    // Caminho principal: salvar imediatamente no localStorage real jp_105x_v7.
    // Sem mensagem de espera, sem depender de postMessage para o aluno confiar no botão.
    const directLocalResult = caderno321SavePhraseDirectlyToNihongoLocal(finalPhrase);
    if (directLocalResult.ok) {
      genialState.history.unshift({ jp, romaji: genialState.romaji, pt: finalPhrase.pt, details, mode: "mixed", at: new Date().toISOString() });
      genialState.history = genialState.history.slice(0, 20);
      genialState.lastSavedAt = new Date().toISOString();
      genialState.lastSaveError = "";
      genialState.lastSavePending = false;
      genialState.lastSaveDirect = true;
      genialState.lastSaveCount = directLocalResult.total || bridgeResult.total || 0;
      genialState.lastSavedTopicId = directLocalResult.topicId || topicId;
      genialState.lastSavedTopicName = directLocalResult.topicName || safeSaveTopicName(topicId);
      genialState.lastSavedPhraseId = directLocalResult.phraseId || "";
      saveGenialState();
      toast(directLocalResult.imported ? "frase salva no NIHONGO321" : "frase atualizada no NIHONGO321");
      render();
      scrollGenialSaveStatusIntoView();

      try {
        if (isEmbeddedInNihongo321() && window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "CADERNO321_LOCAL_SAVE_DONE", payload: directLocalResult }, "*");
        }
      } catch {}
      return;
    }

    console.error("DIÁRIO321 local direct save failed:", directLocalResult);
    genialState.lastSavePending = false;
    genialState.lastSaveError = caderno321SaveErrorMessage(directLocalResult.error || directLocalResult.reason || "direct_save_failed");
    genialState.lastSavedAt = "";
    saveGenialState();
    render();
    scrollGenialSaveStatusIntoView();
  }

  function clearGenialEditor() {
    genialState.romaji = "";
    genialState.userPt = "";
    genialState.details = { words: "", particles: "", explanation: "", situation: "" };
    genialState.evaluation = null;
    genialState.lastSavedAt = "";
    saveGenialState();
    render();
  }

  function openGenialNotebook(ev) {
    try {
      if (ev?.preventDefault) ev.preventDefault();
      if (ev?.stopPropagation) ev.stopPropagation();
    } catch {}

    try {
      screen = "genial";
      requestNihongo321SaveTopics(true);
      saveState();
      render();
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {
      console.error("DIÁRIO321 open error:", err);
      try {
        const root = document.getElementById("app") || document.body;
        root.innerHTML = `
          ${renderAppHeader()}
          <main class="appMain appMain--diario321 appMain--altruista">
            <section class="genialNotebook diario321AltruistaNotebook">
              <div class="diario321OpenError" role="alert">
                <b>Não consegui abrir o Diário321.</b>
                <span>${escapeHTML(err?.message || "erro interno ao abrir")}</span>
                <button type="button" data-screen="dashboard">voltar</button>
              </div>
            </section>
          </main>
        `;
        bindEvents();
      } catch {}
    }
  }

  function closeGenialNotebook() {
    screen = "dashboard";
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  try {
    window.DIARIO321_OPEN = openGenialNotebook;
    window.DIARIO321_CLOSE = closeGenialNotebook;
  } catch {}


  function evaluateGenialNow() {
    const jp = genialConverted();
    genialState.evaluation = evaluateGenialSentence(jp, genialState.romaji);
    saveGenialState();
    render();
  }


  async function translateGenialOnline() {
    const jp = genialConverted().trim();

    if (!jp) {
      toast("digite uma frase primeiro");
      return;
    }

    genialOnlineTranslation = { loading: true, text: "", error: "" };
    render();

    const endpoints = [
      "https://translate.mstdn.social/translate",
      "https://libretranslate.de/translate"
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: jp,
            source: "ja",
            target: "pt",
            format: "text"
          })
        });

        if (!res.ok) throw new Error("HTTP " + res.status);

        const data = await res.json();
        const translated = data.translatedText || data.translation || "";

        if (translated) {
          genialOnlineTranslation = {
            loading: false,
            text: "",
            error: "Tradução online literal: " + translated + " — confira, pois tradutor gratuito pode errar frases criadas em romaji."
          };
          render();
          toast("tradução online consultada");
          return;
        }
      } catch (err) {
        // tenta o próximo endpoint gratuito
      }
    }

    genialOnlineTranslation = {
      loading: false,
      text: "",
      error: "Não consegui acessar o tradutor online agora. Mantive a tradução local aproximada."
    };
    render();
    toast("tradutor online indisponível");
  }

  function renderGenialEntryCard() {
    const embedded = isEmbeddedInNihongo321();
    return `
      ${embedded ? `<div class="genialEntryTopbar"><a class="genialEntryTopbarBack" href="../index.html#/home" target="_parent" aria-label="voltar ao NIHONGO321">↩ voltar ao NIHONGO321</a></div>` : ""}
      <section class="genialEntryCard genialEntryCard--premiumLean" aria-label="Diário321 páginas 360 graus de revisão">
        <div class="genialEntryPremiumIcon" aria-hidden="true">日記</div>
        <div class="genialEntryPremiumBody">
          <div class="genialEntryPremiumCopy">
            <b>Diário321</b>
            <small>páginas 360° de revisão</small>
          </div>
          <button class="genialEntryPremiumAction genialEntryPremiumAction--compact" type="button" data-open-genial onclick="window.DIARIO321_OPEN && window.DIARIO321_OPEN(event)">abrir diário</button>
        </div>
      </section>
    `;
  }


  function firstUnknownGenialToken() {
    const unknown = genialUnknownKanjiMarkers(genialState.romaji);
    return unknown[0] || "";
  }

  function saveNewGenialWord() {
    const tokenInput = document.querySelector("[data-new-word-romaji]");
    const jpInput = document.querySelector("[data-new-word-jp]");
    const ptInput = document.querySelector("[data-new-word-pt]");

    const token = String(tokenInput?.value || firstUnknownGenialToken() || "").trim().toLowerCase();
    const jp = String(jpInput?.value || "").trim();
    const pt = String(ptInput?.value || "").trim();

    if (!token || !jp) {
      toast("preencha romaji e japonês");
      return;
    }

    genialPersonalDict[token] = {
      jp,
      pt,
      createdAt: new Date().toISOString()
    };

    saveGenialPersonalDict();
    genialState.evaluation = null;
    saveGenialState();
    toast(`j:${token} salvo`);
    render();
  }

  function removeGenialWord(token) {
    const key = String(token || "").toLowerCase();
    if (genialPersonalDict[key]) {
      delete genialPersonalDict[key];
      saveGenialPersonalDict();
      toast(`j:${key} removido`);
      render();
    }
  }

  function renderGenialMiniDictionary() {
    const unknown = firstUnknownGenialToken();
    const entries = Object.entries(genialPersonalDict).slice(-6).reverse();

    if (!unknown && !entries.length) return "";

    return `
      <details class="genialMiniDict genialMiniDict--collapsed">
        <summary class="genialMiniDictHead">
          <span>
            <b>Meu Dicionário Genial</b>
            <em>${unknown ? `palavra nova: j:${escapeHTML(unknown)}` : `${entries.length} palavra${entries.length === 1 ? "" : "s"} salva${entries.length === 1 ? "" : "s"}`}</em>
          </span>
          <small>abrir</small>
        </summary>

        <div class="genialMiniDictBody">
          ${unknown ? `
            <div class="genialNewWord">
              <input data-new-word-romaji value="${escapeHTML(unknown)}" aria-label="romaji da palavra nova">
              <input data-new-word-jp placeholder="japonês / kanji" aria-label="japonês da palavra nova">
              <input data-new-word-pt placeholder="português" aria-label="português da palavra nova">
              <button type="button" data-save-new-genial-word>salvar</button>
            </div>
          ` : ""}

          ${entries.length ? `
            <div class="genialMiniEntries">
              ${entries.map(([key, item]) => `
                <div>
                  <strong>j:${escapeHTML(key)} → ${escapeHTML(item.jp)}</strong>
                  <span>${escapeHTML(item.pt || "sem tradução")}</span>
                  <button type="button" data-remove-genial-word="${escapeHTML(key)}">×</button>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      </details>
    `;
  }

  function renderGenialDetailsBox() {
    const details = normalizeGenialDetails();
    return `
      <details class="genialDetailsBox">
        <summary><span>＋ Detalhes para o NIHONGO321</span><small>opcional</small></summary>
        <div class="genialDetailsGrid">
          <label><b>Palavras importantes</b><textarea data-genial-detail="words" placeholder="ex: 仕事=trabalho, 12時間=12 horas">${escapeHTML(details.words)}</textarea></label>
          <label><b>Partículas usadas</b><textarea data-genial-detail="particles" placeholder="ex: は marca o tema; を marca o objeto; から indica motivo">${escapeHTML(details.particles)}</textarea></label>
          <label><b>Explicação curta</b><textarea data-genial-detail="explanation" placeholder="Explique a frase de forma simples para revisar depois.">${escapeHTML(details.explanation)}</textarea></label>
          <label><b>Situação de uso</b><textarea data-genial-detail="situation" placeholder="ex: usar no trabalho, ao explicar um problema na máquina.">${escapeHTML(details.situation)}</textarea></label>
        </div>
      </details>
    `;
  }
  function loadDiario321Pages() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DIARIO321_PAGES_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveDiario321Pages(pages) {
    try { localStorage.setItem(DIARIO321_PAGES_KEY, JSON.stringify(pages || {})); } catch {}
  }

  function loadDiario321Revealed() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DIARIO321_REVEAL_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveDiario321Revealed(revealed) {
    try { localStorage.setItem(DIARIO321_REVEAL_KEY, JSON.stringify(revealed || {})); } catch {}
  }

  function currentDiario321PageInfo() {
    const romaji = String(genialState.romaji || "").toLowerCase();
    const found = DIARIO321_WORD_PAGES.find(page => romaji.includes(`j:${page.romaji}`) || romaji.includes(page.romaji));
    return found || DIARIO321_WORD_PAGES[0];
  }

  function diario321PageItems(pageId) {
    const pages = loadDiario321Pages();
    return Array.isArray(pages[pageId]) ? pages[pageId] : [];
  }

  function diario321ReadLiveEditorValues() {
    const romajiInput = document.querySelector("[data-genial-input]");
    const ptInput = document.querySelector("[data-genial-pt-input]");
    const jpOutput = document.querySelector("[data-genial-output]");

    const liveRomaji = romajiInput ? String(romajiInput.value || "") : String(genialState.romaji || "");
    const livePt = ptInput ? String(ptInput.value || "") : String(genialState.userPt || "");
    const liveJp = jpOutput ? String(jpOutput.textContent || "") : "";

    genialState.romaji = liveRomaji;
    genialState.userPt = livePt;
    saveGenialState();

    return {
      romaji: liveRomaji.trim(),
      pt: livePt.trim(),
      jpFromScreen: liveJp.trim()
    };
  }

  function diario321ShowLocalSaveMessage(message, kind = "ok") {
    try {
      const existing = document.querySelector(".diario321ImmediateStatus");
      if (existing) existing.remove();

      const holder = document.createElement("div");
      holder.className = `diario321ImmediateStatus diario321ImmediateStatus--${kind}`;
      holder.setAttribute("role", "status");
      holder.textContent = message;

      const actions = document.querySelector(".diario321PrimaryActions") || document.querySelector("[data-save-diario321]")?.parentElement;
      if (actions) actions.insertAdjacentElement("beforebegin", holder);
    } catch {}
  }

  function diario321SafePageFallback() {
    try {
      return currentDiario321PageInfo();
    } catch {
      return DIARIO321_WORD_PAGES[0] || { id: "page_1", number: 1, target: "突然", romaji: "totsuzen" };
    }
  }

  function saveGenialToDiario321Page() {
    try {
      const live = diario321ReadLiveEditorValues();
      const page = diario321SafePageFallback();
      const romaji = live.romaji;
      let jp = "";

      try {
        jp = String(genialConverted() || "").trim();
      } catch {
        jp = "";
      }

      if ((!jp || jp === "ここに日本語が出ます") && live.jpFromScreen && live.jpFromScreen !== "ここに日本語が出ます") {
        jp = live.jpFromScreen;
      }

      const pt = live.pt;

      if (!romaji) {
        diario321ShowLocalSaveMessage("Digite uma frase em romaji antes de salvar.", "warn");
        toast("digite uma frase em romaji");
        return false;
      }

      if (!jp || jp === "ここに日本語が出ます") {
        diario321ShowLocalSaveMessage("Ainda não consegui gerar o japonês desta frase. Revise o romaji e tente novamente.", "warn");
        toast("japonês não gerado");
        return false;
      }

      const finalPt = pt || "Significado ainda não preenchido.";
      const pages = loadDiario321Pages();
      const list = Array.isArray(pages[page.id]) ? pages[page.id] : [];
      const signature = `${jp}__${finalPt}`.toLowerCase();
      const existingIndex = list.findIndex(item => String(item.signature || "") === signature);
      const nowISO = new Date().toISOString();
      const item = {
        id: existingIndex >= 0 ? list[existingIndex].id : uid("diario_phrase"),
        pageId: page.id,
        pageNumber: page.number || 1,
        target: page.target || "",
        romaji,
        jp,
        pt: finalPt,
        needsMeaning: !pt,
        details: normalizeGenialDetails(),
        signature,
        memory: existingIndex >= 0 ? (list[existingIndex].memory || "new") : "new",
        createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : nowISO,
        updatedAt: nowISO
      };

      if (existingIndex >= 0) list[existingIndex] = item;
      else list.unshift(item);
      pages[page.id] = list.slice(0, 60);
      saveDiario321Pages(pages);

      const verify = loadDiario321Pages();
      const verifyList = Array.isArray(verify[page.id]) ? verify[page.id] : [];
      const savedOk = verifyList.some(saved => String(saved.id || "") === String(item.id));
      if (!savedOk) {
        diario321ShowLocalSaveMessage("Não consegui gravar no caderno deste navegador. Verifique se o armazenamento local está liberado.", "error");
        toast("não consegui salvar");
        return false;
      }

      genialState.history.unshift({ jp, romaji, pt: finalPt, details: normalizeGenialDetails(), mode: "diario", at: nowISO });
      genialState.history = genialState.history.slice(0, 20);
      genialState.lastSavedAt = "";
      genialState.lastSaveError = "";
      genialState.lastSavePending = false;
      genialState.diarioSavedAt = nowISO;
      genialState.diarioSavedPageId = page.id;
      genialState.diarioLastSavedPhraseId = item.id;
      saveGenialState();
      diario321ShowLocalSaveMessage(`Salvo na Página ${page.number || 1}. O significado ficará oculto para revisão.`, "ok");
      toast(`salvo na Página ${page.number || 1}`);
      render();
      setTimeout(() => {
        try { document.querySelector(".diario321SavedList")?.scrollIntoView({ behavior: "smooth", block: "center" }); } catch {}
      }, 80);
      return true;
    } catch (err) {
      console.error("DIÁRIO321 save page fatal error:", err);
      diario321ShowLocalSaveMessage(`Erro interno ao salvar: ${err?.message || "erro desconhecido"}.`, "error");
      toast("erro ao salvar nesta página");
      return false;
    }
  }

  function toggleDiario321Meaning(id) {
    const revealed = loadDiario321Revealed();
    revealed[id] = !revealed[id];
    saveDiario321Revealed(revealed);
    render();
  }

  function markDiario321Memory(id, value) {
    const pages = loadDiario321Pages();
    Object.keys(pages).forEach(pageId => {
      pages[pageId] = (Array.isArray(pages[pageId]) ? pages[pageId] : []).map(item => item.id === id ? { ...item, memory: value, reviewedAt: new Date().toISOString() } : item);
    });
    saveDiario321Pages(pages);
    toast(value === "remembered" ? "boa, essa volta depois" : value === "almost" ? "quase lá, revise amanhã" : "sem problema, vamos revisar de novo");
    render();
  }

  function renderDiario321PageHero() {
    const page = currentDiario321PageInfo();
    const items = diario321PageItems(page.id);
    const done = Math.min(items.length, page.total || 3);
    const dots = Array.from({ length: page.total || 3 }, (_, index) => `<span class="${index < done ? "is-done" : ""}"></span>`).join("");
    return `
      <section class="diario321HeroPage">
        <div class="diario321PageMeta">Página ${page.number} de ${DIARIO321_WORD_PAGES.length}</div>
        <small>Palavra de hoje</small>
        <strong>${escapeHTML(page.target)}</strong>
        <em>${escapeHTML(page.meaning)}</em>
        <div class="diario321Mission">
          <b>Missão de hoje</b>
          <span>${escapeHTML(page.mission)}</span>
          <div class="diario321Dots" aria-label="progresso da página">${dots}</div>
        </div>
      </section>
    `;
  }

  function renderDiario321SaveStatus() {
    if (!genialState.diarioSavedAt) return "";
    const page = DIARIO321_WORD_PAGES.find(item => item.id === genialState.diarioSavedPageId) || currentDiario321PageInfo();
    return `
      <div class="genialSaveStatus diario321LocalStatus" role="status">
        <b>✓ salvo na Página ${page.number}</b>
        <span>O significado fica oculto na lista para você testar a memória antes de revelar.</span>
      </div>
    `;
  }

  function renderDiario321SavedList() {
    const page = currentDiario321PageInfo();
    const items = diario321PageItems(page.id).slice(0, 8);
    const revealed = loadDiario321Revealed();
    if (!items.length) {
      return `
        <section class="diario321SavedList">
          <div class="diario321SavedHead"><b>Minhas frases nesta página</b><span>vazio por enquanto</span></div>
          <p class="diario321Empty">Salve sua primeira frase. Depois, tente lembrar o significado antes de revelar.</p>
        </section>
      `;
    }
    return `
      <section class="diario321SavedList">
        <div class="diario321SavedHead"><b>Minhas frases nesta página</b><span>${items.length} frase${items.length === 1 ? "" : "s"}</span></div>
        ${items.map((item, index) => {
          const isOpen = !!revealed[item.id];
          return `
            <article class="diario321PhraseCard">
              <div class="diario321PhraseTop">
                <span>${index + 1}.</span>
                <strong>${escapeHTML(item.jp)}</strong>
              </div>
              <button class="diario321RevealBtn" type="button" data-diario-toggle="${escapeHTML(item.id)}">${isOpen ? "ocultar significado" : "mostrar significado"}</button>
              ${isOpen ? `
                <div class="diario321Meaning">
                  <p>${escapeHTML(item.pt || "Significado ainda não preenchido.")}</p>
                  <div class="diario321MemoryBtns">
                    <button type="button" data-diario-memory="remembered" data-diario-memory-id="${escapeHTML(item.id)}">lembrei</button>
                    <button type="button" data-diario-memory="almost" data-diario-memory-id="${escapeHTML(item.id)}">quase</button>
                    <button type="button" data-diario-memory="again" data-diario-memory-id="${escapeHTML(item.id)}">não lembrei</button>
                  </div>
                </div>
              ` : `<div class="diario321HiddenMeaning">significado oculto para revisar</div>`}
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  function renderDiario321Path() {
    const page = currentDiario321PageInfo();
    const items = diario321PageItems(page.id);
    const completed = new Set(items.slice(0, 3).map((_, index) => index));
    const chips = (page.challenges || []).map((label, index) => `<span class="${completed.has(index) ? "is-done" : ""}">${completed.has(index) ? "✓" : "○"} ${escapeHTML(label)}</span>`).join("");
    return `
      <section class="diario321Path">
        <b>Seu caminho com ${escapeHTML(page.target)}</b>
        <div>${chips}</div>
        <small>Um passo de cada vez. Escreva, esconda o significado e revise amanhã.</small>
      </section>
    `;
  }

  function renderGenialFreeLimitBox() {
    if (cadernoHasPremiumAccess()) return "";
    const used = Math.min(genialSavedFreeCount(), GENIAL_FREE_PHRASE_LIMIT);
    const reached = used >= GENIAL_FREE_PHRASE_LIMIT;
    return `<div class="genialLimitBox ${reached ? "is-reached" : ""}"><b>${used}/${GENIAL_FREE_PHRASE_LIMIT} frases grátis no Diário Genial</b><span>${reached ? "Você atingiu o seu limite grátis de frases. Adquira o Premium para continuar criando." : "Crie até 7 frases completas grátis. Depois, o Premium libera o Diário Genial sem esse limite."}</span></div>`;
  }

  function scrollGenialSaveStatusIntoView() {
    setTimeout(() => {
      try {
        const el = document.querySelector(".genialSaveStatus");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {}
    }, 90);
  }

  function renderGenialSaveStatus() {
    if (genialState.lastSavePending) {
      return `
        <div class="genialSaveStatus genialSaveStatus--pending" role="status">
          <b>processando salvamento...</b>
          <span>Preparando a frase para entrar no treino 105x.</span>
        </div>
      `;
    }

    if (genialState.lastSavedAt) {
      const topicName = genialState.lastSavedTopicName || safeSaveTopicName(genialState.lastSavedTopicId || selectedSaveTopicId());
      return `
        <div class="genialSaveStatus" role="status">
          <b>✓ frase salva no NIHONGO321</b>
          <span>Salvo no tópico: <strong>${escapeHTML(topicName)}</strong>. Agora você pode memorizar essa frase no treino 105x.</span>
          <button class="genialTrainNow" type="button" data-train-genial>treinar agora no 105x</button>
        </div>
      `;
    }

    if (genialState.lastSaveError) {
      return `
        <div class="genialSaveStatus genialSaveStatus--error" role="alert">
          <b>não foi possível salvar</b>
          <span>${escapeHTML(genialState.lastSaveError)}</span>
        </div>
      `;
    }

    return "";
  }

  function renderDiario321KatakanaGuide() {
    return `
      <details class="diario321KatakanaGuide">
        <summary>
          <span>Como escrever nomes e palavras estrangeiras?</span>
          <small>usar k:</small>
        </summary>
        <div class="diario321KatakanaGrid">
          <div><b>Nome</b><em>k:ailton → アイルトン</em></div>
          <div><b>Erro</b><em>k:eraa → エラー</em></div>
          <div><b>Konbini</b><em>k:konbini → コンビニ</em></div>
          <div><b>Brasil</b><em>k:burajiru → ブラジル</em></div>
        </div>
        <p>Nomes de pessoas, lugares, marcas e palavras estrangeiras normalmente ficam em katakana. Use <strong>k:</strong> antes da palavra quando quiser essa escrita.</p>
      </details>
    `;
  }


  const DIARIO321_ALTRUISTA_KEY = "diario321_visao_pratica_altruista_v1";

  const DIARIO321_ENVIRONMENT_PRESETS = {
    trabalho: {
      label: "No trabalho",
      icon: "🏭",
      placeholderRole: "Sou operador de máquina",
      exampleWord: "kikai",
      exampleMeaning: "máquina",
      questions: [
        "O que pode acontecer?",
        "Que problema explicar?",
        "Que pedido fazer?"
      ],
      starterIdeas: [
        "A máquina parou de repente.",
        "Tem vazamento na máquina.",
        "A máquina faz um som estranho.",
        "O monitor travou."
      ]
    },
    mercado: {
      label: "No mercado",
      icon: "🛒",
      placeholderRole: "Faço compras sozinho no Japão",
      exampleWord: "yasui",
      exampleMeaning: "barato",
      questions: [
        "Que preço confirmar?",
        "Que ajuda pedir?",
        "Que frase usar no caixa?"
      ],
      starterIdeas: [
        "Esse produto está em promoção?",
        "Onde fica o mais barato?",
        "Essa carne vence hoje?",
        "Posso pagar com cartão?"
      ]
    },
    prefeitura: {
      label: "Na prefeitura",
      icon: "🏢",
      placeholderRole: "Preciso resolver documentos",
      exampleWord: "shorui",
      exampleMeaning: "documento",
      questions: [
        "Que documento pedir?",
        "Onde fica o balcão?",
        "O que preciso confirmar?"
      ],
      starterIdeas: [
        "Preciso entregar este documento hoje?",
        "Onde faço este procedimento?",
        "Não entendi esta parte.",
        "Preciso tirar cópia?"
      ]
    }
  };

  function diario321DefaultAltruistaState() {
    return {
      environment: "trabalho",
      customEnvironments: [],
      newEnvironmentName: "",
      role: "",
      wordRomaji: "",
      wordPt: "",
      chance: 65,
      note: "",
      ptIdea: "",
      jpIdea: "",
      romajiIdea: "",
      speechStyle: "polite",
      customTones: [],
      checklist: { paper: false, voice: false, useful: false },
      entries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  let diario321AltruistaState = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DIARIO321_ALTRUISTA_KEY) || "{}");
      return { ...diario321DefaultAltruistaState(), ...(saved && typeof saved === "object" ? saved : {}) };
    } catch {
      return diario321DefaultAltruistaState();
    }
  })();

  let diario321SetupFoldOpen = !diario321HasPolivalencia();
  let diario321NoteFoldOpen = false;
  let diario321AIPasteOpen = false;
  let diario321AIPasteDraft = "";
  let diario321AIPasteMode = "paste";
  let diario321AIPromptWasCopied = false;
  let diario321EntriesFilter = "all";
  let diario321EditingEntryId = "";
  let diario321DeleteConfirmId = "";
  let diario321ToneModalOpen = false;
  let diario321ToneDraft = { label: "", hint: "" };
  let diario321ToneDeleteConfirmId = "";
  let diario321LastAutoJapaneseIdea = "";
  let diario321ActiveTrainingEntryId = "";
  let diario321OpenEntryId = "";

  function keepDiario321EntryOpen(entryId) {
    const id = String(entryId || "");
    if (id) diario321OpenEntryId = id;
  }

  function diario321NormalizeRomajiMarkers(value = "") {
    return String(value || "")
      .replace(/(^|\s)([jkh]):\s+/gi, "$1$2:")
      .replace(/([.,!?、。！？])([jkh]):/gi, "$1 $2:");
  }

  function diario321Sum1To(n) {
    const value = Math.max(0, Number(n) || 0);
    return (value * (value + 1)) / 2;
  }

  function diario321StripFurigana(text = "") {
    return String(text || "")
      .replace(/\{[^}]*\}/g, "")
      .replace(/[|｜]/g, "")
      .trim();
  }

  function saveDiario321AltruistaState() {
    diario321AltruistaState.updatedAt = new Date().toISOString();
    try { localStorage.setItem(DIARIO321_ALTRUISTA_KEY, JSON.stringify(diario321AltruistaState)); } catch {}
  }

  function diario321SafeCustomToneId(name = "") {
    const base = String(name || "tom")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "tom";
    return `custom_tone_${base}_${Date.now().toString(36).slice(-4)}`;
  }

  function diario321CustomTones() {
    const list = Array.isArray(diario321AltruistaState.customTones) ? diario321AltruistaState.customTones : [];
    return list
      .map(item => ({
        id: String(item?.id || "").trim(),
        label: String(item?.label || "").trim(),
        hint: String(item?.hint || "").trim()
      }))
      .filter(item => item.id && item.label)
      .slice(0, 12);
  }

  function diario321ToneOptions() {
    return [
      { id: "polite", label: "Educado", hint: "líder, loja, hospital", builtIn: true },
      { id: "natural", label: "Natural", hint: "colega, conversa simples", builtIn: true },
      ...diario321CustomTones().map(item => ({ ...item, builtIn: false }))
    ];
  }

  function diario321NormalizeTone(style = "polite") {
    const id = String(style || "polite").trim();
    if (id === "natural" || id === "polite") return id;
    return diario321ToneOptions().some(item => item.id === id) ? id : "polite";
  }

  function diario321ToneIsNatural(style = "polite") {
    return diario321NormalizeTone(style) === "natural";
  }

  function openDiario321CustomToneModal() {
    const current = diario321CustomTones();
    if (current.length >= 12) {
      toast("limite de tons personalizados atingido");
      return;
    }
    diario321ToneDraft = { label: "", hint: "" };
    diario321ToneModalOpen = true;
    diario321NoteFoldOpen = true;
    render();
    setTimeout(() => {
      try { document.querySelector("[data-tone-draft-label]")?.focus?.(); } catch {}
    }, 50);
  }

  function closeDiario321CustomToneModal() {
    diario321ToneModalOpen = false;
    diario321ToneDraft = { label: "", hint: "" };
    render();
  }

  function requestDeleteDiario321CustomTone(toneId) {
    const id = String(toneId || "").trim();
    if (!id || id === "polite" || id === "natural") return;
    const exists = diario321CustomTones().some(item => item.id === id);
    if (!exists) return;
    diario321ToneDeleteConfirmId = id;
    render();
  }

  function cancelDeleteDiario321CustomTone() {
    diario321ToneDeleteConfirmId = "";
    render();
  }

  function deleteDiario321CustomTone(toneId) {
    const id = String(toneId || "").trim();
    if (!id || id === "polite" || id === "natural") return;
    const before = diario321CustomTones();
    const tone = before.find(item => item.id === id);
    if (!tone) {
      diario321ToneDeleteConfirmId = "";
      render();
      return;
    }

    diario321AltruistaState.customTones = before.filter(item => item.id !== id);
    if (String(diario321AltruistaState.speechStyle || "") === id) {
      diario321AltruistaState.speechStyle = "polite";
    }
    diario321AltruistaState.entries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).map(entry => {
      if (String(entry?.speechStyle || "") !== id) return entry;
      return { ...entry, speechStyle: "polite", updatedAt: new Date().toISOString() };
    });
    diario321ToneDeleteConfirmId = "";
    saveDiario321AltruistaState();
    toast(`tom ${tone.label} apagado`);
    render();
  }

  function updateDiario321ToneDraft(field, value) {
    if (!diario321ToneDraft || typeof diario321ToneDraft !== "object") diario321ToneDraft = { label: "", hint: "" };
    diario321ToneDraft[field === "hint" ? "hint" : "label"] = String(value || "");
  }

  function saveDiario321CustomToneFromModal() {
    const current = diario321CustomTones();
    if (current.length >= 12) {
      toast("limite de tons personalizados atingido");
      closeDiario321CustomToneModal();
      return;
    }
    const label = String(diario321ToneDraft?.label || "").trim();
    if (!label) {
      toast("digite o nome do tom");
      try { document.querySelector("[data-tone-draft-label]")?.focus?.(); } catch {}
      return;
    }
    const taken = diario321ToneOptions().some(item => item.label.toLowerCase() === label.toLowerCase());
    if (taken) {
      toast("esse tom já existe");
      return;
    }
    const hint = String(diario321ToneDraft?.hint || "").trim();
    const tone = {
      id: diario321SafeCustomToneId(label),
      label: label.slice(0, 18),
      hint: hint.slice(0, 60),
      createdAt: new Date().toISOString()
    };
    diario321AltruistaState.customTones = [...current, tone];
    diario321AltruistaState.speechStyle = tone.id;
    diario321ToneModalOpen = false;
    diario321ToneDraft = { label: "", hint: "" };
    saveDiario321AltruistaState();
    diario321NoteFoldOpen = true;
    toast("tom adicionado");
    render();
  }

  function renderDiario321ToneSelector({ selected = "polite", entryId = "", edit = false } = {}) {
    const safeSelected = diario321NormalizeTone(selected);
    const tones = diario321ToneOptions();
    const attr = edit ? `name="entry-tone-${escapeHTML(entryId)}"` : "";
    return `
      ${tones.map(tone => edit ? `
        <label class="diario321ToneRadio ${safeSelected === tone.id ? "is-active" : ""}">
          <input type="radio" ${attr} value="${escapeHTML(tone.id)}" ${safeSelected === tone.id ? "checked" : ""}>
          ${escapeHTML(tone.label)}
        </label>
      ` : `
        <div class="diario321ToneOption ${tone.builtIn ? "" : "is-custom"}">
          <div class="diario321ToneCustomRow">
            <button type="button" class="diario321ToneBtn ${safeSelected === tone.id ? "is-active" : ""}" data-diary-style="${escapeHTML(tone.id)}">${escapeHTML(tone.label)}</button>
            ${tone.builtIn ? "" : `<button type="button" class="diario321ToneDeleteBtn" data-delete-custom-tone="${escapeHTML(tone.id)}" aria-label="apagar tom ${escapeHTML(tone.label)}">×</button>`}
          </div>
          ${tone.hint ? `<small>${escapeHTML(tone.hint)}</small>` : ""}
          ${(!tone.builtIn && diario321ToneDeleteConfirmId === tone.id) ? `
            <div class="diario321ToneDeleteInline" role="alert">
              <b>Apagar tom?</b>
              <button type="button" data-cancel-delete-custom-tone>cancelar</button>
              <button type="button" data-confirm-delete-custom-tone="${escapeHTML(tone.id)}">apagar</button>
            </div>
          ` : ""}
        </div>
      `).join("")}
      ${edit ? "" : `<button type="button" class="diario321ToneAddBtn" data-open-custom-tone-modal aria-label="adicionar tom">＋</button>`}
    `;
  }

  function diario321CustomEnvironmentPresets() {
    const list = Array.isArray(diario321AltruistaState.customEnvironments) ? diario321AltruistaState.customEnvironments : [];
    return list.reduce((acc, item) => {
      const id = String(item?.id || "").trim();
      const label = String(item?.label || "").trim();
      if (!id || !label) return acc;
      acc[id] = {
        label,
        icon: "📍",
        placeholderRole: "Minha rotina nesse lugar",
        exampleWord: "palavra",
        exampleMeaning: "significado",
        questions: [
          "O que sempre acontece aqui?",
          "O que preciso explicar?",
          "Que pedido eu posso fazer?"
        ],
        starterIdeas: [
          "Preciso explicar uma situação.",
          "Quero fazer um pedido simples.",
          "Não entendi esta parte.",
          "Preciso confirmar uma informação."
        ]
      };
      return acc;
    }, {});
  }

  function diario321AllEnvironmentPresets() {
    return { ...DIARIO321_ENVIRONMENT_PRESETS, ...diario321CustomEnvironmentPresets() };
  }

  function slugDiario321EnvironmentName(name) {
    const base = String(name || "ambiente")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "ambiente";
    return `custom_${base}_${Date.now().toString(36).slice(-4)}`;
  }

  function addDiario321CustomEnvironment() {
    const input = document.querySelector("[data-altruista-field='newEnvironmentName']");
    const label = String(input?.value || diario321AltruistaState.newEnvironmentName || "").trim();
    if (!label) {
      toast("escreva o nome do ambiente");
      return;
    }
    const custom = Array.isArray(diario321AltruistaState.customEnvironments) ? [...diario321AltruistaState.customEnvironments] : [];
    const exists = custom.some(item => String(item?.label || "").trim().toLowerCase() === label.toLowerCase()) ||
      Object.values(DIARIO321_ENVIRONMENT_PRESETS).some(item => String(item?.label || "").trim().toLowerCase() === label.toLowerCase());
    if (exists) {
      toast("esse ambiente já existe");
      return;
    }
    const id = slugDiario321EnvironmentName(label);
    custom.push({ id, label, createdAt: new Date().toISOString() });
    diario321AltruistaState.customEnvironments = custom.slice(0, 20);
    diario321AltruistaState.environment = id;
    diario321AltruistaState.newEnvironmentName = "";
    saveDiario321AltruistaState();
    diario321SetupFoldOpen = true;
    toast("ambiente adicionado");
    render();
  }

  function diario321SelectedEnvironment() {
    const all = diario321AllEnvironmentPresets();
    return all[diario321AltruistaState.environment] || DIARIO321_ENVIRONMENT_PRESETS.trabalho;
  }

  function diario321HasPolivalencia() {
    return !!String(diario321AltruistaState.wordRomaji || "").trim() && !!String(diario321AltruistaState.wordPt || "").trim();
  }

  function diario321ApplySpeechStyleToRomaji(value = "", style = "polite") {
    const text = diario321NormalizeRomajiMarkers(value);
    const politeMap = {
      tomatta: "tomarimashita",
      deta: "demashita",
      dete: "dete",
      kowareta: "kowaremashita",
      iku: "ikimasu",
      kuru: "kimasu",
      miru: "mimasu",
      yomu: "yomimasu",
      kaku: "kakimasu",
      hanasu: "hanashimasu",
      taberu: "tabemasu",
      nomu: "nomimasu",
      wakaranai: "wakarimasen",
      shiranai: "shirimasen"
    };
    const naturalMap = {
      tomarimashita: "tomatta",
      demashita: "deta",
      kowaremashita: "kowareta",
      ikimasu: "iku",
      kimasu: "kuru",
      mimasu: "miru",
      yomimasu: "yomu",
      kakimasu: "kaku",
      hanashimasu: "hanasu",
      tabemasu: "taberu",
      nomimasu: "nomu",
      wakarimasen: "wakaranai",
      shirimasen: "shiranai"
    };
    const map = style === "natural" ? naturalMap : politeMap;
    return text.split(/(\s+|[.,!?。、！？])/g).map(part => {
      const lower = part.toLowerCase();
      if (lower.startsWith("j:") || lower.startsWith("k:") || lower.startsWith("h:")) {
        const prefix = part.slice(0, 2);
        const body = lower.slice(2);
        return map[body] ? `${prefix}${map[body]}` : part;
      }
      return map[lower] || part;
    }).join("");
  }

  function diario321JapaneseFromRomajiInput(value = "", style = diario321AltruistaState.speechStyle || "polite") {
    const raw = diario321NormalizeRomajiMarkers(value).trim();
    if (!raw) return "";
    const prepared = diario321ApplySpeechStyleToRomaji(raw, style);
    return romajiToSmartJapanese(prepared, "mixed").trim();
  }

  function updateDiario321RomajiIdea(value, options = {}) {
    const romajiValue = String(value || "");
    const jpInput = document.querySelector("[data-altruista-field='jpIdea']");
    const generatedJp = diario321JapaneseFromRomajiInput(romajiValue, diario321AltruistaState.speechStyle || "polite");

    diario321AltruistaState.romajiIdea = romajiValue;

    /*
      DIÁRIO321 4.17.13-R:
      O campo Romaji é a fonte viva da escrita japonesa.
      Sempre que o aluno digitar Romaji, o campo Japonês acompanha em tempo real.
      Isso evita conflito com frases antigas e torna a criação previsível no celular.
    */
    diario321AltruistaState.jpIdea = generatedJp;
    diario321LastAutoJapaneseIdea = generatedJp;
    if (jpInput) jpInput.value = generatedJp;

    diario321NoteFoldOpen = true;
    saveDiario321AltruistaState();
  }

  function clearDiario321PracticeDraft({ keepOpen = false } = {}) {
    diario321AltruistaState.ptIdea = "";
    diario321AltruistaState.romajiIdea = "";
    diario321AltruistaState.jpIdea = "";
    diario321AltruistaState.checklist = { paper: false, voice: false, useful: false };
    diario321LastAutoJapaneseIdea = "";
    diario321NoteFoldOpen = !!keepOpen;

    ["ptIdea", "romajiIdea", "jpIdea"].forEach(name => {
      const el = document.querySelector(`[data-altruista-field='${name}']`);
      if (el) el.value = "";
    });
  }

  function setDiario321SpeechStyle(style) {
    diario321AltruistaState.speechStyle = diario321NormalizeTone(style || "polite");
    updateDiario321RomajiIdea(diario321AltruistaState.romajiIdea || "", { force: true });
    diario321NoteFoldOpen = true;
    saveDiario321AltruistaState();
    render();
  }

  function updateDiario321AltruistaField(field, value) {
    if (field === "chance") {
      diario321AltruistaState.chance = clamp(Number(value || 0), 0, 100);
      diario321SetupFoldOpen = true;
    } else if (field === "environment") {
      diario321AltruistaState.environment = String(value || "trabalho");
      diario321SetupFoldOpen = true;
    } else if (["role", "wordRomaji", "wordPt", "note", "newEnvironmentName"].includes(field)) {
      diario321AltruistaState[field] = String(value || "");
      diario321SetupFoldOpen = true;
    } else if (field === "romajiIdea") {
      updateDiario321RomajiIdea(value);
      return;
    } else if (field === "jpIdea") {
      diario321AltruistaState.jpIdea = String(value || "");
      diario321LastAutoJapaneseIdea = "";
      diario321NoteFoldOpen = true;
    } else if (field === "ptIdea") {
      diario321AltruistaState.ptIdea = String(value || "");
      diario321NoteFoldOpen = true;
    }
    saveDiario321AltruistaState();
    if (field === "environment" || field === "chance") render();
  }

  function toggleDiario321PracticeCheck(key) {
    diario321AltruistaState.checklist = diario321AltruistaState.checklist && typeof diario321AltruistaState.checklist === "object" ? diario321AltruistaState.checklist : {};
    diario321AltruistaState.checklist[key] = !diario321AltruistaState.checklist[key];
    saveDiario321AltruistaState();
    render();
  }

  function saveDiario321Polivalencia() {
    const env = document.querySelector("[data-altruista-field='environment']")?.value || diario321AltruistaState.environment;
    const role = document.querySelector("[data-altruista-field='role']")?.value || diario321AltruistaState.role;
    const wordRomaji = document.querySelector("[data-altruista-field='wordRomaji']")?.value || diario321AltruistaState.wordRomaji;
    const wordPt = document.querySelector("[data-altruista-field='wordPt']")?.value || diario321AltruistaState.wordPt;
    const chance = document.querySelector("[data-altruista-field='chance']")?.value || diario321AltruistaState.chance;
    const note = document.querySelector("[data-altruista-field='note']")?.value || diario321AltruistaState.note;

    diario321AltruistaState.environment = String(env || "trabalho");
    diario321AltruistaState.role = String(role || "").trim();
    const selectedEnvPreset = diario321AllEnvironmentPresets()[diario321AltruistaState.environment] || DIARIO321_ENVIRONMENT_PRESETS.trabalho;
    diario321AltruistaState.wordRomaji = String(wordRomaji || selectedEnvPreset.exampleWord || "kikai").trim();
    diario321AltruistaState.wordPt = String(wordPt || selectedEnvPreset.exampleMeaning || "máquina").trim();
    diario321AltruistaState.chance = clamp(Number(chance || diario321AltruistaState.chance || 65), 0, 100);
    diario321AltruistaState.note = String(note || "").trim();

    if (!diario321AltruistaState.wordRomaji || !diario321AltruistaState.wordPt) {
      toast("cadastre a palavra de start");
      return;
    }

    saveDiario321AltruistaState();
    diario321SetupFoldOpen = false;
    diario321NoteFoldOpen = true;
    toast("página aberta");
    render();
    setTimeout(() => {
      try { document.querySelector(".diario321PracticeMap")?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {}
    }, 80);
  }

  function saveDiario321PracticeEntry() {
    const ptIdea = String(document.querySelector("[data-altruista-field='ptIdea']")?.value || diario321AltruistaState.ptIdea || "").trim();
    const jpIdea = String(document.querySelector("[data-altruista-field='jpIdea']")?.value || diario321AltruistaState.jpIdea || "").trim();
    const romajiIdea = String(document.querySelector("[data-altruista-field='romajiIdea']")?.value || diario321AltruistaState.romajiIdea || "").trim();

    if (!ptIdea && !jpIdea && !romajiIdea) {
      toast("escreva uma frase antes de salvar");
      return;
    }

    const entry = {
      id: uid("diario_pratica"),
      environment: diario321AltruistaState.environment,
      wordRomaji: diario321AltruistaState.wordRomaji,
      wordPt: diario321AltruistaState.wordPt,
      jp: jpIdea,
      pt: ptIdea,
      romaji: romajiIdea,
      speechStyle: diario321AltruistaState.speechStyle || "polite",
      checklist: { ...(diario321AltruistaState.checklist || {}) },
      mastered: false,
      favorite: false,
      masteredAt: null,
      createdAt: new Date().toISOString()
    };

    diario321AltruistaState.entries = Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : [];
    diario321AltruistaState.entries.unshift(entry);
    diario321AltruistaState.entries = diario321AltruistaState.entries.slice(0, 80);
    clearDiario321PracticeDraft({ keepOpen: false });
    saveDiario321AltruistaState();
    toast("frase salva e campos limpos");
    render();
    setTimeout(() => {
      try { document.querySelector(".diario321PracticeEntries")?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {}
    }, 80);
  }

  function toggleDiario321EntryCheck(entryId, key) {
    diario321AltruistaState.entries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).map(entry => {
      if (entry.id !== entryId) return entry;
      const checklist = { ...(entry.checklist || {}) };
      checklist[key] = !checklist[key];
      return { ...entry, checklist };
    });
    saveDiario321AltruistaState();
    render();
  }

  function toggleDiario321EntryMastered(entryId) {
    const id = String(entryId || "");
    diario321AltruistaState.entries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).map(entry => {
      if (entry.id !== id) return entry;
      const mastered = !entry.mastered;
      return { ...entry, mastered, masteredAt: mastered ? new Date().toISOString() : null };
    });
    keepDiario321EntryOpen(id);
    saveDiario321AltruistaState();
    render();
  }


  function toggleDiario321EntryFavorite(entryId) {
    const id = String(entryId || "");
    diario321AltruistaState.entries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).map(entry => {
      if (entry.id !== id) return entry;
      return { ...entry, favorite: !entry.favorite };
    });
    keepDiario321EntryOpen(id);
    saveDiario321AltruistaState();
    render();
  }

  function setDiario321EntriesFilter(filter) {
    diario321EntriesFilter = String(filter || "all");
    render();
  }

  function startDiario321EntryEdit(entryId) {
    diario321EditingEntryId = String(entryId || "");
    keepDiario321EntryOpen(diario321EditingEntryId);
    render();
    setTimeout(() => {
      try { document.querySelector(`[data-entry-edit-main="${CSS.escape(diario321EditingEntryId)}"]`)?.focus(); } catch {}
    }, 60);
  }

  function cancelDiario321EntryEdit(entryId = "") {
    const keepId = String(entryId || diario321EditingEntryId || "");
    diario321EditingEntryId = "";
    keepDiario321EntryOpen(keepId);
    render();
  }

  function updateDiario321EntryEditJapanese(entryId) {
    const id = String(entryId || "");
    if (!id) return;
    const romajiInput = document.querySelector(`[data-entry-edit-romaji="${CSS.escape(id)}"]`);
    const jpInput = document.querySelector(`[data-entry-edit-jp="${CSS.escape(id)}"]`);
    const toneInput = document.querySelector(`[name="entry-tone-${CSS.escape(id)}"]:checked`);
    if (!romajiInput || !jpInput) return;

    const toneValue = diario321NormalizeTone(toneInput?.value || "polite");
    const romajiValue = String(romajiInput.value || "");
    jpInput.value = diario321JapaneseFromRomajiInput(romajiValue, toneValue);
  }

  function saveDiario321EntryEdit(entryId) {
    const id = String(entryId || "");
    const jpInput = document.querySelector(`[data-entry-edit-jp="${CSS.escape(id)}"]`);
    const romajiInput = document.querySelector(`[data-entry-edit-romaji="${CSS.escape(id)}"]`);
    const ptInput = document.querySelector(`[data-entry-edit-pt="${CSS.escape(id)}"]`);
    const wordInput = document.querySelector(`[data-entry-edit-word="${CSS.escape(id)}"]`);
    const wordPtInput = document.querySelector(`[data-entry-edit-word-pt="${CSS.escape(id)}"]`);
    const toneInput = document.querySelector(`[name="entry-tone-${CSS.escape(id)}"]:checked`);
    const jpValue = String(jpInput?.value || "").trim();
    const romajiValue = String(romajiInput?.value || "").trim();
    const ptValue = String(ptInput?.value || "").trim();
    const wordValue = String(wordInput?.value || "").trim();
    const wordPtValue = String(wordPtInput?.value || "").trim();
    const toneValue = diario321NormalizeTone(toneInput?.value || "polite");

    if (!jpValue && !romajiValue && !ptValue) {
      toast("escreva a frase antes de salvar");
      return;
    }

    diario321AltruistaState.entries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).map(entry => {
      if (entry.id !== id) return entry;
      return {
        ...entry,
        wordRomaji: wordValue || entry.wordRomaji || "palavra",
        wordPt: wordPtValue || entry.wordPt || "",
        speechStyle: toneValue,
        jp: jpValue,
        romaji: romajiValue,
        pt: ptValue || entry.pt || "",
        updatedAt: new Date().toISOString()
      };
    });
    diario321EditingEntryId = "";
    keepDiario321EntryOpen(id);
    saveDiario321AltruistaState();
    toast("frase editada");
    render();
  }

  function diario321EnvironmentLabel(key) {
    const all = diario321AllEnvironmentPresets();
    return all[key]?.label || "Ambiente";
  }

  function diario321EnvironmentIcon(key) {
    const all = diario321AllEnvironmentPresets();
    return all[key]?.icon || "✦";
  }

  function diario321ToneLabel(style) {
    const id = diario321NormalizeTone(style || "polite");
    const found = diario321ToneOptions().find(item => item.id === id);
    return found?.label || "Educado";
  }

  function diario321ToneHint(style) {
    const id = diario321NormalizeTone(style || "polite");
    const found = diario321ToneOptions().find(item => item.id === id);
    return found?.hint || (id === "natural" ? "colega / conversa simples" : "líder / loja / hospital");
  }

  function diario321IsToday(value) {
    if (!value) return false;
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
    } catch {
      return false;
    }
  }

  function diario321FilterEntries(entries) {
    const filter = diario321EntriesFilter || "all";
    if (filter === "today") return entries.filter(entry => diario321IsToday(entry.createdAt || entry.updatedAt || entry.masteredAt));
    if (filter === "review") return entries.filter(entry => !entry.mastered);
    if (filter === "mastered") return entries.filter(entry => !!entry.mastered);
    if (filter === "favorite") return entries.filter(entry => !!entry.favorite);
    if (filter !== "all") return entries.filter(entry => String(entry.environment || "") === filter);
    return entries;
  }

  function renderDiario321EntryTabs(entries) {
    const environments = [];
    const seen = new Set();
    for (const entry of entries) {
      const env = String(entry.environment || "trabalho");
      if (!seen.has(env)) {
        seen.add(env);
        environments.push(env);
      }
    }
    const hasFavorites = entries.some(entry => !!entry.favorite);
    const hasToday = entries.some(entry => diario321IsToday(entry.createdAt || entry.updatedAt || entry.masteredAt));
    const tabs = [
      { id: "all", label: "Todas" },
      ...(hasToday ? [{ id: "today", label: "Hoje" }] : []),
      { id: "review", label: "Revisar" },
      { id: "mastered", label: "Praticadas" },
      ...environments.slice(0, 3).map(env => ({ id: env, label: diario321EnvironmentLabel(env) })),
      ...(hasFavorites ? [{ id: "favorite", label: "★" }] : [])
    ];
    if (!tabs.some(tab => tab.id === diario321EntriesFilter)) diario321EntriesFilter = "all";
    return `
      <div class="diario321EntryTabs" aria-label="filtrar frases">
        ${tabs.map(tab => `
          <button type="button" class="diario321EntryTab ${tab.id === diario321EntriesFilter ? "is-active" : ""}" data-entry-filter="${escapeHTML(tab.id)}">
            ${escapeHTML(tab.label)}
          </button>
        `).join("")}
      </div>
    `;
  }

  function requestDeleteDiario321Entry(entryId) {
    diario321DeleteConfirmId = String(entryId || "");
    keepDiario321EntryOpen(diario321DeleteConfirmId);
    render();
  }

  function cancelDeleteDiario321Entry() {
    const keepId = diario321DeleteConfirmId;
    diario321DeleteConfirmId = "";
    keepDiario321EntryOpen(keepId);
    render();
  }

  function deleteDiario321Entry(entryId) {
    const id = String(entryId || "");
    if (!id) return;
    diario321AltruistaState.entries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).filter(entry => entry.id !== id);
    diario321DeleteConfirmId = "";
    if (diario321OpenEntryId === id) diario321OpenEntryId = "";
    if (diario321ActiveTrainingEntryId === id) diario321ActiveTrainingEntryId = "";
    saveDiario321AltruistaState();
    toast("frase removida");
    render();
  }

  function moveDiario321Entry(entryId, direction) {
    const id = String(entryId || "");
    const entries = Array.isArray(diario321AltruistaState.entries) ? [...diario321AltruistaState.entries] : [];
    const index = entries.findIndex(entry => entry.id === id);
    if (index < 0) return;
    const step = direction === "up" ? -1 : 1;
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= entries.length) {
      keepDiario321EntryOpen(id);
      return;
    }
    const [entry] = entries.splice(index, 1);
    entries.splice(nextIndex, 0, entry);
    diario321AltruistaState.entries = entries;
    keepDiario321EntryOpen(id);
    saveDiario321AltruistaState();
    render();
  }

  function reorderDiario321Entry(dragId, dropId) {
    if (!dragId || !dropId || dragId === dropId) return;
    const entries = Array.isArray(diario321AltruistaState.entries) ? [...diario321AltruistaState.entries] : [];
    const from = entries.findIndex(entry => entry.id === dragId);
    const to = entries.findIndex(entry => entry.id === dropId);
    if (from < 0 || to < 0) return;
    const [entry] = entries.splice(from, 1);
    entries.splice(to, 0, entry);
    diario321AltruistaState.entries = entries;
    saveDiario321AltruistaState();
    render();
  }

  function adjustDiario321EntryWriteCount(entryId, delta) {
    // Mantido apenas como compatibilidade com versões antigas.
    toggleDiario321EntryMastered(entryId);
  }

  function diario321InitialTraining105x() {
    return {
      cycleStart: 14,
      count: 14,
      repsDone: 0,
      cyclesDone: 0,
      completed: false,
      updatedAt: new Date().toISOString()
    };
  }

  function diario321EntryTrainingInfo(entry = {}) {
    const raw = entry && typeof entry.training105x === "object" ? entry.training105x : {};
    const cycleStart = clamp(Number(raw.cycleStart || 14), 1, 14);
    const count = clamp(Number(raw.count || cycleStart), 1, cycleStart);
    const remaining = count + diario321Sum1To(cycleStart - 1);
    const repsDone = clamp(105 - remaining, 0, 105);
    const cycleNumber = clamp(15 - cycleStart, 1, 14);
    const percent = Math.round((repsDone / 105) * 100);
    const completed = !!raw.completed || repsDone >= 105;
    return {
      cycleStart,
      count,
      cycleNumber,
      repsDone,
      remaining,
      percent,
      completed,
      nextCycleStart: cycleStart > 1 ? cycleStart - 1 : 1
    };
  }

  function updateDiario321EntryTraining(entryId, updater) {
    const id = String(entryId || "");
    if (!id) return;
    diario321AltruistaState.entries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).map(entry => {
      if (entry.id !== id) return entry;
      return updater(entry) || entry;
    });
    saveDiario321AltruistaState();
    render();
  }

  function startDiario321EntryTraining(entryId) {
    const id = String(entryId || "");
    const exists = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).some(entry => entry.id === id);
    if (!exists) return;
    diario321ActiveTrainingEntryId = id;
    keepDiario321EntryOpen(id);
    updateDiario321EntryTraining(id, entry => ({
      ...entry,
      training105x: entry.training105x && typeof entry.training105x === "object" ? entry.training105x : diario321InitialTraining105x(),
      updatedAt: new Date().toISOString()
    }));
    toast("treino 105x do Diário aberto");
    setTimeout(() => {
      try { document.querySelector(`[data-diario-training-panel="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }); } catch {}
    }, 90);
  }

  function closeDiario321EntryTraining(entryId) {
    const id = String(entryId || "");
    if (!entryId || diario321ActiveTrainingEntryId === id) diario321ActiveTrainingEntryId = "";
    keepDiario321EntryOpen(id);
    render();
  }

  function resetDiario321EntryTraining(entryId) {
    const id = String(entryId || "");
    diario321ActiveTrainingEntryId = id;
    keepDiario321EntryOpen(id);
    updateDiario321EntryTraining(id, entry => ({
      ...entry,
      training105x: diario321InitialTraining105x(),
      mastered: false,
      masteredAt: null,
      updatedAt: new Date().toISOString()
    }));
    toast("treino reiniciado");
  }

  function repeatDiario321EntryTraining(entryId) {
    const id = String(entryId || "");
    try { stopDiario321Karaoke(document.querySelector(`[data-diario-training-panel="${CSS.escape(id)}"]`)); } catch {}
    diario321ActiveTrainingEntryId = id;
    keepDiario321EntryOpen(id);
    let finished = false;
    updateDiario321EntryTraining(id, entry => {
      const info = diario321EntryTrainingInfo(entry);
      if (info.completed) return entry;

      let cycleStart = info.cycleStart;
      let count = info.count;
      let completed = false;

      if (count > 1) {
        count -= 1;
      } else if (cycleStart > 1) {
        cycleStart -= 1;
        count = cycleStart;
      } else {
        completed = true;
        count = 1;
        finished = true;
      }

      const updatedInfo = diario321EntryTrainingInfo({ training105x: { cycleStart, count, completed } });
      return {
        ...entry,
        training105x: {
          cycleStart,
          count,
          repsDone: updatedInfo.repsDone,
          cyclesDone: completed ? 14 : Math.max(0, 14 - cycleStart),
          completed,
          updatedAt: new Date().toISOString()
        },
        mastered: completed ? true : entry.mastered,
        masteredAt: completed ? new Date().toISOString() : entry.masteredAt,
        updatedAt: new Date().toISOString()
      };
    });
    toast(finished ? "frase dominada no Diário" : "repetição registrada");
  }



  function diario321SegmentTextForKaraoke(text) {
    return [...String(text || "")];
  }

  function diario321EstimateSpeechDurationMs(text, rate = 0.92) {
    const clean = String(text || "").replace(/\s+/g, "");
    const n = clean.length || 1;
    return (110 * n) / Math.max(0.6, Math.min(1.2, Number(rate) || 0.92));
  }

  function renderDiario321KaraokePhrase(text) {
    return diario321SegmentTextForKaraoke(text)
      .map((seg, index) => `<span class="diario321Kseg" data-diario-kseg="${index}">${escapeHTML(seg)}</span>`)
      .join("");
  }

  function stopDiario321Karaoke(panel) {
    try {
      if (window.__diario321KaraokeRaf) cancelAnimationFrame(window.__diario321KaraokeRaf);
      window.__diario321KaraokeRaf = null;
      panel?.classList?.remove?.("is-speaking", "is-heard");
      panel?.querySelectorAll?.(".diario321Kseg.is-on")?.forEach(el => el.classList.remove("is-on"));
    } catch {}
  }

  function finishDiario321Karaoke(panel) {
    try {
      if (window.__diario321KaraokeRaf) cancelAnimationFrame(window.__diario321KaraokeRaf);
      window.__diario321KaraokeRaf = null;
      panel?.classList?.remove?.("is-speaking");
      panel?.classList?.add?.("is-heard");
      panel?.querySelectorAll?.(".diario321Kseg")?.forEach(el => el.classList.add("is-on"));
    } catch {}
  }

  function playDiario321Karaoke(panel, rawText, rate = 0.92) {
    if (!panel) return;
    const segEls = panel.querySelectorAll(".diario321Kseg");
    if (!segEls || !segEls.length) return;

    segEls.forEach(el => el.classList.remove("is-on"));
    if (window.__diario321KaraokeRaf) cancelAnimationFrame(window.__diario321KaraokeRaf);

    const plain = String(rawText || "");
    const total = segEls.length || 1;
    const duration = diario321EstimateSpeechDurationMs(plain, rate);
    const step = Math.max(22, duration / total);
    const start = (performance && performance.now) ? performance.now() : Date.now();
    let current = 0;

    const tick = () => {
      const nowTime = (performance && performance.now) ? performance.now() : Date.now();
      const target = Math.min(total, Math.floor((nowTime - start) / step) + 1);
      while (current < target) {
        const el = panel.querySelector(`.diario321Kseg[data-diario-kseg="${current}"]`);
        if (el) el.classList.add("is-on");
        current += 1;
      }
      if (current < total) {
        window.__diario321KaraokeRaf = requestAnimationFrame(tick);
      }
    };

    window.__diario321KaraokeRaf = requestAnimationFrame(tick);
  }

  function speakDiario321EntryTraining(entryId) {
    const entry = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).find(item => item.id === entryId);
    if (!entry) return;
    const text = diario321StripFurigana(entry.jp || diario321JapaneseFromRomajiInput(entry.romaji || "", entry.speechStyle || "polite") || entry.romaji || entry.pt || "");
    if (!text) {
      toast("sem frase para ouvir");
      return;
    }
    try {
      const panel = document.querySelector(`[data-diario-training-panel="${CSS.escape(String(entryId || ""))}"]`);
      stopDiario321Karaoke(panel);
      panel?.classList?.add?.("is-speaking");
      window.clearTimeout(window.__diario321SpeakingTimer);
      window.__diario321SpeakingTimer = window.setTimeout(() => {
        finishDiario321Karaoke(panel);
      }, diario321EstimateSpeechDurationMs(text, 0.92) + 620);

      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.92;
      u.onstart = () => playDiario321Karaoke(panel, text, 0.92);
      u.onend = () => {
        window.setTimeout(() => {
          finishDiario321Karaoke(panel);
        }, 180);
      };
      u.onerror = () => {
        try {
          panel?.classList?.remove?.("is-speaking");
          stopDiario321Karaoke(panel);
        } catch {}
      };
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      toast("ouvindo frase");
    } catch {
      toast("voz indisponível");
    }
  }

  function renderDiario321EntryTrainingPanel(entry = {}) {
    if (diario321ActiveTrainingEntryId !== entry.id) return "";
    const info = diario321EntryTrainingInfo(entry);
    const jpPhrase = String(entry.jp || "").trim();
    const romajiPhrase = String(entry.romaji || "").trim();
    const ptPhrase = String(entry.pt || "").trim();
    const mainPhrase = jpPhrase || diario321JapaneseFromRomajiInput(romajiPhrase, entry.speechStyle || "polite") || romajiPhrase || ptPhrase || "frase";
    return `
      <section class="diario321EntryTrainingPanel" data-diario-training-panel="${escapeHTML(entry.id)}" data-stop-entry-toggle aria-label="treino 105x do Diário">
        <div class="diario321EntryTrainingHead">
          <div>
            <small>Treino 105x do Diário</small>
            <b>${info.completed ? "Frase dominada" : `Ciclo ${info.cycleNumber}`}</b>
          </div>
          <span>${info.repsDone}/105</span>
        </div>

        <div class="diario321TrainingCore">
          <div class="diario321TrainingCounter ${info.completed ? "is-complete" : ""}">
            <strong>${info.completed ? "✓" : info.count}</strong>
            <span>${info.completed ? "dominada" : `ciclo ${info.cycleNumber}`}</span>
          </div>
          <div class="diario321TrainingPhrase">
            <b>${renderDiario321KaraokePhrase(mainPhrase)}</b>
            ${ptPhrase ? `<em>${escapeHTML(ptPhrase)}</em>` : ""}
            ${romajiPhrase ? `<small>${escapeHTML(romajiPhrase)}</small>` : ""}
          </div>
        </div>

        <div class="diario321TrainingCycleHint">
          <span>${info.completed ? "105 repetições concluídas" : `${info.count}, ${Math.max(1, info.count - 1)}, ${Math.max(1, info.count - 2)}...1`}</span>
          <small>${info.completed ? "você pode reiniciar quando quiser" : `depois começa ${info.nextCycleStart}...1`}</small>
        </div>

        <div class="diario321TrainingBar" aria-label="progresso do treino"><span style="width:${info.percent}%"></span></div>

        <div class="diario321TrainingActions">
          <button type="button" data-entry-train-speak="${escapeHTML(entry.id)}">🔊 ouvir</button>
          <button class="is-main" type="button" data-entry-train-repeat="${escapeHTML(entry.id)}">${info.completed ? "concluído" : "repeti"}</button>
          <button type="button" data-entry-train-reset="${escapeHTML(entry.id)}">reiniciar</button>
          <button type="button" data-entry-train-close="${escapeHTML(entry.id)}">fechar</button>
        </div>
      </section>
    `;
  }

  function resetDiario321Altruista() {
    const keepEntries = Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : [];
    diario321AltruistaState = { ...diario321DefaultAltruistaState(), entries: keepEntries };
    saveDiario321AltruistaState();
    toast("novo mapa iniciado");
    render();
  }


  function diario321EnvironmentUsageCount(key) {
    const entries = Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : [];
    return entries.filter(entry => entry && entry.environment === key).length;
  }

  function renderDiario321ScenarioMap() {
    const selected = diario321AltruistaState.environment || "trabalho";
    const chance = clamp(Number(diario321AltruistaState.chance || 0), 0, 100);
    const rows = Object.entries(diario321AllEnvironmentPresets()).map(([key, item], index) => {
      const isActive = key === selected;
      const percent = isActive ? chance : Math.max(10, Math.min(55, diario321EnvironmentUsageCount(key) * 12));
      const blocks = Array.from({ length: 14 }, (_, i) => `<i class="${i < Math.round(percent / 8) ? "is-hot" : ""}"></i>`).join("");
      return `
        <button class="diario321ScenarioRow ${isActive ? "is-active" : ""}" type="button" data-scenario-pick="${escapeHTML(key)}">
          <span class="diario321ScenarioNum">${index + 1}</span>
          <strong><em>${item.icon}</em>${escapeHTML(item.label.replace("No ", "").replace("Na ", ""))}</strong>
          <span class="diario321FrequencyBars" aria-hidden="true">${blocks}</span>
          <b>${isActive ? `${percent}%` : "abrir"}</b>
        </button>
      `;
    }).join("");

    return `
      <section class="diario321ScenarioMap" aria-label="mapa de cenários">
        <div class="diario321ScenarioHead">
          <span>mapa do dia</span>
          <button type="button" data-reset-altruista>nova página</button>
        </div>
        <div class="diario321ScenarioRows">${rows}</div>
        <p>Escolha onde a palavra aparece mais.</p>
      </section>
    `;
  }

  function renderDiario321PolivalenciaCard() {
    const env = diario321SelectedEnvironment();
    const chance = clamp(Number(diario321AltruistaState.chance || 0), 0, 100);
    const hasWord = diario321HasPolivalencia();
    const summaryWord = hasWord
      ? `${diario321AltruistaState.wordRomaji} = ${diario321AltruistaState.wordPt}`
      : "escolher palavra";
    return `
      <details class="diario321DiarySetup diario321CollapsibleCard diario321SetupFold" aria-label="criar página de treino" ${(!hasWord || diario321SetupFoldOpen) ? "open" : ""}>
        <summary class="diario321FoldSummary">
          <span>Escolhendo a Semente</span>
          <b>${escapeHTML(summaryWord)}</b>
        </summary>
        <div class="diario321FoldBody">
          <p>Escolha uma palavra para começar seu treino.</p>

          <div class="diario321Field diario321Field--quiet diario321EnvironmentChooser">
            <span>Ambiente</span>
            <div class="diario321EnvironmentPills" role="group" aria-label="ambientes do diário">
              ${Object.entries(diario321AllEnvironmentPresets()).map(([key, item]) => `
                <button class="diario321EnvironmentPill ${key === diario321AltruistaState.environment ? "is-active" : ""}" type="button" data-scenario-pick="${escapeHTML(key)}">
                  <em aria-hidden="true">${escapeHTML(item.icon || "📍")}</em>
                  <b>${escapeHTML(item.label)}</b>
                </button>
              `).join("")}
            </div>
          </div>

          <details class="diario321AddEnvironment">
            <summary>+ cadastrar ambiente</summary>
            <div class="diario321AddEnvironmentRow">
              <input data-altruista-field="newEnvironmentName" value="${escapeHTML(diario321AltruistaState.newEnvironmentName || "")}" placeholder="ex.: Academia, banco, escola">
              <button type="button" data-add-environment>adicionar</button>
            </div>
          </details>

          <div class="diario321WordLine">
            <label class="diario321Field diario321Field--quiet">
              <span>Palavra</span>
              <input data-altruista-field="wordRomaji" value="${escapeHTML(diario321AltruistaState.wordRomaji || "")}" placeholder="ex.: ${escapeHTML(env.exampleWord)}">
            </label>
            <label class="diario321Field diario321Field--quiet">
              <span>Significado</span>
              <input data-altruista-field="wordPt" value="${escapeHTML(diario321AltruistaState.wordPt || "")}" placeholder="ex.: ${escapeHTML(env.exampleMeaning)}">
            </label>
          </div>

          <label class="diario321Field diario321RangeField diario321Field--quiet">
            <span>Frequência <b>${chance}%</b></span>
            <input type="range" min="0" max="100" step="5" value="${chance}" data-altruista-field="chance">
          </label>

          <details class="diario321OptionalDetails">
            <summary>detalhe opcional</summary>
            <label class="diario321Field diario321Field--quiet">
              <span>Minha realidade</span>
              <input data-altruista-field="role" value="${escapeHTML(diario321AltruistaState.role || "")}" placeholder="${escapeHTML(env.placeholderRole)}">
            </label>
            <label class="diario321Field diario321Field--quiet">
              <span>Por que importa?</span>
              <textarea data-altruista-field="note" placeholder="ex.: aparece todo dia no trabalho.">${escapeHTML(diario321AltruistaState.note || "")}</textarea>
            </label>
          </details>

          <button class="diario321PrimaryBtn diario321PrimaryBtn--diary" type="button" data-save-polivalencia>abrir página</button>
        </div>
      </details>
    `;
  }

  function renderDiario321QuickGuide() {
    return `
      <details class="diario321QuickGuide diario321StudyMethod">
        <summary>
          <span>Guia rápido</span>
          <small>Use pouco. Fale melhor.</small>
        </summary>
        <div class="diario321QuickGrid" aria-label="guia rápido de sobrevivência">
          <article class="diario321QuickItem">
            <div class="diario321ParticleBadge">が</div>
            <div class="diario321QuickText">
              <b>O que aconteceu?</b>
              <span>機械が止まりました。</span>
              <em>A máquina parou.</em>
            </div>
            <button type="button" data-survival-model="ga">Usar este modelo</button>
          </article>
          <article class="diario321QuickItem">
            <div class="diario321ParticleBadge">を</div>
            <div class="diario321QuickText">
              <b>Pedir ajuda</b>
              <span>機械を見てもらえますか。</span>
              <em>Pode verificar a máquina?</em>
            </div>
            <button type="button" data-survival-model="wo">Usar este modelo</button>
          </article>
          <article class="diario321QuickItem">
            <div class="diario321ParticleBadge">に</div>
            <div class="diario321QuickText">
              <b>Lugar ou pessoa</b>
              <span>リーダーに伝えます。</span>
              <em>Vou avisar o líder.</em>
            </div>
            <button type="button" data-survival-model="ni">Usar este modelo</button>
          </article>
        </div>
      </details>
    `;
  }

  function useDiario321SurvivalModel(kind) {
    const models = {
      ga: {
        jp: "機械が止まりました。",
        pt: "A máquina parou.",
        romaji: "kikai ga tomarimashita."
      },
      wo: {
        jp: "機械を見てもらえますか。",
        pt: "Pode verificar a máquina?",
        romaji: "kikai o mite moraemasu ka."
      },
      ni: {
        jp: "リーダーに伝えます。",
        pt: "Vou avisar o líder.",
        romaji: "riidaa ni tsutaemasu."
      }
    };
    const model = models[kind] || models.ga;
    diario321AltruistaState.ptIdea = model.pt;
    diario321AltruistaState.jpIdea = model.jp;
    diario321AltruistaState.romajiIdea = model.romaji;
    diario321NoteFoldOpen = true;
    saveDiario321AltruistaState();
    toast("modelo enviado para sua anotação");
    render();
  }

  function renderDiario321MethodCard() {
    return `
      <details class="diario321DiaryWhy diario321StudyMethod">
        <summary>método 7–14</summary>
        <div class="diario321MethodSteps">
          <p>Pegue um caderno. Escreva de 7 a 14 frases com a palavra.</p>
          <ul>
            <li>presente, passado e futuro;</li>
            <li>uma afirmativa;</li>
            <li>uma negativa;</li>
            <li>uma pergunta.</li>
          </ul>
          <div class="diario321MethodExample">
            <b>Exemplo: taberu = comer</b>
            <span>Eu como arroz.</span>
            <span>Ontem comi pão.</span>
            <span>Amanhã vou comer no trabalho.</span>
            <span>Não vou comer agora.</span>
            <span>Você já comeu?</span>
          </div>
        </div>
      </details>
    `;
  }

  function renderDiario321ScienceCard() {
    return `
      <details class="diario321DiaryWhy diario321StudyMethod diario321ScienceMethod">
        <summary>por que funciona?</summary>
        <div class="diario321MethodSteps diario321ScienceSteps">
          <p>O Diário321 faz você criar, testar e revisar a palavra no seu mundo real.</p>
          <ul>
            <li><b>memória de longo prazo:</b> repetir em dias diferentes ajuda a palavra a ficar.</li>
            <li><b>memória analítica:</b> você entende onde a palavra aparece e como usar.</li>
            <li><b>memória criativa:</b> você cria frases suas, não só copia frases prontas.</li>
          </ul>
          <div class="diario321MethodExample diario321ScienceExample">
            <b>Treino 360°</b>
            <span>Substantivo: use em objetos, lugares, pessoas e problemas.</span>
            <span>Verbo: use no presente, passado, futuro, negativo e pergunta.</span>
            <span>Partícula: teste quem faz, onde acontece, para quem vai e por quê.</span>
          </div>
          <p>Quando você vê a mesma palavra por vários lados, ela deixa de ser decoreba e vira ferramenta.</p>
        </div>
      </details>
    `;
  }

  function renderDiario321PracticeMap() {
    const env = diario321SelectedEnvironment();
    const chance = clamp(Number(diario321AltruistaState.chance || 0), 0, 100);
    const wordLabel = diario321AltruistaState.wordRomaji ? `${diario321AltruistaState.wordRomaji}` : "palavra";
    const meaning = diario321AltruistaState.wordPt || "significado";
    return `
      <section class="diario321DiaryPage diario321PracticeMap">
        <div class="diario321PageTopline">
          <span>página aberta</span>
          <button type="button" data-reset-altruista>trocar</button>
        </div>
        <div class="diario321WordFocus">
          <small>${escapeHTML(env.label)}</small>
          <b>${escapeHTML(wordLabel)}</b>
          <em>${escapeHTML(meaning)}</em>
        </div>
        <div class="diario321ChanceLine" aria-label="frequência na rotina">
          <span style="width:${chance}%"></span>
        </div>
        <p class="diario321PageNote"><strong>${chance}%</strong> no seu dia. Vire frase.</p>
      </section>
    `;
  }

  function renderDiario321QuestionBank() {
    const env = diario321SelectedEnvironment();
    const questions = env.questions.slice(0, 3);
    return `
      <section class="diario321MiniPrompts">
        <b>pense em português</b>
        <div class="diario321QuestionGrid diario321QuestionGrid--minimal">
          ${questions.map(q => `<button type="button" data-use-question="${escapeHTML(q)}">${escapeHTML(q)}</button>`).join("")}
        </div>
      </section>
    `;
  }

  function renderDiario321StarterIdeas() {
    const env = diario321SelectedEnvironment();
    return `
      <section class="diario321StarterIdeas diario321StarterIdeas--minimal">
        <b>ideias curtas</b>
        <div class="diario321IdeaList diario321IdeaList--minimal">
          ${env.starterIdeas.slice(0, 4).map(idea => `<button type="button" data-use-idea="${escapeHTML(idea)}">${escapeHTML(idea)}</button>`).join("")}
        </div>
      </section>
    `;
  }

  function renderDiario321PremiumWritingFlow() {
    const seed = diario321SeedInfo();
    const hasSeed = diario321HasPolivalencia();
    const hasDraft = !!String(diario321AltruistaState.ptIdea || diario321AltruistaState.romajiIdea || diario321AltruistaState.jpIdea || "").trim();
    const entries = Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : [];
    const tone = diario321ToneLabel(diario321AltruistaState.speechStyle || "polite");
    const flowSteps = [
      { done: hasSeed, title: "Semente", meta: hasSeed ? `${seed.romaji} = ${seed.meaning}` : "escolha a palavra" },
      { done: hasDraft, title: "Escrever", meta: hasDraft ? "rascunho em andamento" : "crie uma frase base" },
      { done: entries.length >= 2, title: "Expandir", meta: entries.length >= 2 ? `${entries.length} frases no diário` : "gere 10 variações" },
      { done: entries.some(entry => !!entry?.training?.repsDone), title: "Treinar 105x", meta: entries.some(entry => !!entry?.training?.repsDone) ? "repetição em andamento" : "abra no card da frase" }
    ];
    return `
      <section class="diario321ModernCard diario321PremiumFlow" aria-label="rota do treino de escrita">
        <div class="diario321ModernCardHead"><span>◆ Rota do treino</span><small>simples, clara e vendável</small></div>
        <div class="diario321PremiumFlowChips">
          <span><b>ambiente</b><em>${escapeHTML(seed.env?.label || "Trabalho")}</em></span>
          <span><b>palavra</b><em>${escapeHTML(seed.jp)} · ${escapeHTML(seed.romaji)}</em></span>
          <span><b>tom</b><em>${escapeHTML(tone)}</em></span>
        </div>
        <div class="diario321PremiumFlowSteps">
          ${flowSteps.map((step, index) => `
            <article class="${step.done ? "is-done" : ""}">
              <i>${step.done ? "✓" : index + 1}</i>
              <div>
                <b>${escapeHTML(step.title)}</b>
                <small>${escapeHTML(step.meta)}</small>
              </div>
            </article>
          `).join("")}
        </div>
        <p class="diario321PremiumFlowNote">Fluxo recomendado: escolha a palavra, escreva uma frase simples, gere 10 variações e faça o 105x dentro do card salvo.</p>
      </section>
    `;
  }

  function renderDiario321PracticeEditor() {
    const hasEntries = Array.isArray(diario321AltruistaState.entries) && diario321AltruistaState.entries.length > 0;
    const hasDraft = !!String(diario321AltruistaState.ptIdea || diario321AltruistaState.romajiIdea || diario321AltruistaState.jpIdea || "").trim();
    const isOpen = !!diario321NoteFoldOpen;
    const summaryStatus = hasDraft ? "rascunho em andamento" : hasEntries ? "toque para criar nova frase" : "toque para criar a primeira frase";
    return `
      <details id="diario321WritingCard" class="diario321ModernCard diario321WritingCard diario321PracticeEditor diario321NoteFold ${isOpen ? "is-open" : ""}" aria-label="sua escrita de hoje" ${isOpen ? "open" : ""}>
        <summary class="diario321WritingSummary" aria-label="abrir criação de frase">
          <span>
            <b>✎ Sua escrita de hoje</b>
            <small>${escapeHTML(summaryStatus)}</small>
          </span>
          <em>${isOpen ? "recolher" : "nova frase"}</em>
        </summary>

        <div class="diario321WritingFoldBody">
          <div class="diario321WritingGrid diario321WritingGrid--professional">
            <label class="diario321ModernField diario321ModernField--pt">
              <span>Português</span>
              <textarea data-altruista-field="ptIdea" placeholder="Ex.: A máquina parou de repente e apareceu um erro que eu não sei.">${escapeHTML(diario321AltruistaState.ptIdea || "")}</textarea>
            </label>

            <label class="diario321ModernField diario321ModernField--romaji">
              <span>Romaji</span>
              <textarea data-altruista-field="romajiIdea" placeholder="j: kikai ga totsuzen tomatte, shiranai k:era- ga hyouji saremashita.">${escapeHTML(diario321AltruistaState.romajiIdea || "")}</textarea>
              <small class="diario321FieldHint">Atalhos: <b>j:</b> kanji · <b>k:</b> katakana · sem prefixo = hiragana</small>
            </label>

            <label class="diario321ModernField diario321ModernField--jp">
              <span>Japonês</span>
              <textarea data-altruista-field="jpIdea" placeholder="機械が突然止まって、しらないエラーが表示されました。">${escapeHTML(diario321AltruistaState.jpIdea || "")}</textarea>
            </label>
          </div>

          ${renderDiario321AIBox()}

          <div class="diario321ToneBox diario321ToneBox--modern" aria-label="tom da frase">
            <span>Como quer falar?</span>
            <div class="diario321ToneChoices diario321ToneChoices--custom diario321ToneChoices--modern">
              ${renderDiario321ToneSelector({ selected: diario321AltruistaState.speechStyle || "polite" })}
            </div>
          </div>

          <button class="diario321PrimaryBtn diario321PrimaryBtn--diary diario321PrimaryBtn--wide" type="button" data-save-practice-entry>
            <span>▣</span> Salvar no Diário
          </button>
        </div>
      </details>
    `;
  }

  function openDiario321AddPhrase() {
    clearDiario321PracticeDraft({ keepOpen: true });
    diario321SetupFoldOpen = false;
    saveDiario321AltruistaState();
    render();
    setTimeout(() => {
      try {
        const box = document.getElementById("diario321WritingCard") || document.querySelector(".diario321WritingCard");
        box?.classList?.add("is-focus-target");
        box?.scrollIntoView({ behavior: "smooth", block: "center" });
        const first = box?.querySelector("textarea[data-altruista-field='ptIdea'], textarea[data-altruista-field='romajiIdea'], textarea[data-altruista-field='jpIdea']");
        first?.focus?.({ preventScroll: true });
        setTimeout(() => { try { box?.classList?.remove("is-focus-target"); } catch {} }, 1400);
      } catch {}
    }, 100);
    toast("campo de nova frase aberto");
  }

  function renderDiario321AddPhraseButton() {
    return `
      <button class="diario321AddPhraseBar" type="button" data-open-practice-editor aria-label="adicionar nova frase">
        <span aria-hidden="true">＋</span>
        <b>Adicionar frase</b>
      </button>
    `;
  }

  function renderDiario321PracticeEntries() {
    const allEntries = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).slice(0, 80);
    const entries = diario321FilterEntries(allEntries).slice(0, 20);

    if (!allEntries.length) {
      return `
        <section class="diario321PracticeEntries diario321DiaryEntries diario321PhraseBinder">
          <div class="diario321SavedHead"><b>Minhas frases</b><span>vazio</span></div>
          <p class="diario321Empty">Salve sua primeira anotação.</p><p class="diario321LibraryEmptyHint">Depois abra o card da frase e toque em Treinar 105x.</p>
          ${renderDiario321AddPhraseButton()}
        </section>
      `;
    }

    const practicedCount = allEntries.filter(entry => !!entry.mastered).length;
    const favoriteCount = allEntries.filter(entry => !!entry.favorite).length;
    const readyCount = allEntries.filter(entry => String(entry?.jp || "").trim() && String(entry?.pt || "").trim()).length;

    return `
      <section class="diario321PracticeEntries diario321DiaryEntries diario321PhraseBinder diario321PhraseLibrary diario321PhraseLibrary--premium" id="diario321PhraseLibrary">
        <div class="diario321SavedHead diario321LibraryHead diario321LibraryHead--premium"><b>Minhas frases</b><span>${allEntries.length}</span></div>
        <div class="diario321LibraryStats diario321LibraryStats--compact" aria-label="resumo das frases criadas">
          <span><b>${allEntries.length}</b><small>criadas</small></span>
          <span><b>${allEntries.length - practicedCount}</b><small>revisar</small></span>
          <span><b>${practicedCount}</b><small>ok</small></span>
        </div>
        ${renderDiario321EntryTabs(allEntries)}
        <div class="diario321LibraryList">
        ${entries.length ? entries.map((entry, index) => {
          const mastered = !!entry.mastered;
          const favorite = !!entry.favorite;
          const jpPhrase = String(entry.jp || "").trim();
          const romajiPhrase = String(entry.romaji || "").trim();
          const ptPhrase = String(entry.pt || "").trim();
          const mainPhrase = jpPhrase || romajiPhrase || ptPhrase;
          const supportPhrase = ptPhrase && ptPhrase !== mainPhrase ? ptPhrase : "";
          const romajiSupport = romajiPhrase && romajiPhrase !== mainPhrase ? romajiPhrase : "";
          const envLabel = diario321EnvironmentLabel(entry.environment || "trabalho");
          const envIcon = diario321EnvironmentIcon(entry.environment || "trabalho");
          const toneLabel = diario321ToneLabel(entry.speechStyle || "polite");
          const toneId = diario321NormalizeTone(entry.speechStyle || "polite");
          const toneClass = toneId === "natural" ? "is-natural" : toneId === "polite" ? "is-polite" : "is-custom";
          const trainingInfo = diario321EntryTrainingInfo(entry);
          const isEditing = diario321EditingEntryId === entry.id;
          const isTrainingOpen = diario321ActiveTrainingEntryId === entry.id;
          const isEntryOpen = isTrainingOpen || diario321OpenEntryId === entry.id || diario321DeleteConfirmId === entry.id;

          if (isEditing) {
            return `
              <article class="diario321PracticeEntry diario321DiaryEntry diario321DiaryEntry--edit diario321LibraryItem--edit" data-entry-drag-id="${escapeHTML(entry.id)}">
                <div class="diario321EntryTop diario321EntryTop--line">
                  <small><span>${escapeHTML(envIcon)}</span> ${escapeHTML(envLabel)} · editar frase</small>
                  <button class="diario321EntryMiniBtn" type="button" data-entry-cancel-edit>cancelar</button>
                </div>
                <div class="diario321EditGrid">
                  <label class="diario321EditField">
                    <span>Palavra estudada</span>
                    <input data-entry-edit-word="${escapeHTML(entry.id)}" value="${escapeHTML(entry.wordRomaji || "")}" placeholder="ex.: kikai">
                  </label>
                  <label class="diario321EditField">
                    <span>Significado</span>
                    <input data-entry-edit-word-pt="${escapeHTML(entry.id)}" value="${escapeHTML(entry.wordPt || "")}" placeholder="ex.: máquina">
                  </label>
                </div>
                <div class="diario321EditTone" aria-label="tom da frase">
                  <span>Tom</span>
                  ${renderDiario321ToneSelector({ selected: entry.speechStyle || "polite", entryId: entry.id, edit: true })}
                </div>
                <label class="diario321EditField">
                  <span>Japonês</span>
                  <textarea data-entry-edit-jp="${escapeHTML(entry.id)}">${escapeHTML(jpPhrase)}</textarea>
                </label>
                <label class="diario321EditField">
                  <span>Português</span>
                  <textarea data-entry-edit-pt="${escapeHTML(entry.id)}">${escapeHTML(ptPhrase)}</textarea>
                </label>
                <label class="diario321EditField">
                  <span>Romaji</span>
                  <textarea data-entry-edit-romaji="${escapeHTML(entry.id)}">${escapeHTML(romajiPhrase)}</textarea>
                </label>
                <div class="diario321EntryActions diario321EntryActions--clean" data-stop-entry-toggle>
                  <button class="diario321EntrySaveEdit" type="button" data-entry-save-edit="${escapeHTML(entry.id)}">salvar edição</button>
                </div>
              </article>
            `;
          }

          const compactTitle = jpPhrase || ptPhrase || romajiPhrase || "frase sem texto";
          const compactPreview = ptPhrase || romajiPhrase || jpPhrase;
          const pageNumber = Math.max(1, Math.ceil((index + 1) / 7));

          return `
            <article class="diario321PracticeEntry diario321DiaryEntry diario321PhraseLine diario321PhraseLineV2 diario321LibraryItem ${mastered ? "is-mastered" : ""}" draggable="true" data-entry-drag-id="${escapeHTML(entry.id)}">
              <details class="diario321LibraryDetails" ${isEntryOpen ? "open" : ""}>
                <summary class="diario321LibrarySummary">
                  <span class="diario321LibrarySummaryMeta">
                    <small>${escapeHTML(envIcon)} ${escapeHTML(envLabel)}</small>
                    <b>${escapeHTML(entry.wordRomaji || "palavra")} ${entry.wordPt ? `= ${escapeHTML(entry.wordPt)}` : ""}</b>
                  </span>
                  <span class="diario321LibrarySummaryText">
                    <strong class="${jpPhrase ? "is-japanese" : ""}">${escapeHTML(compactTitle)}</strong>
                    ${compactPreview && compactPreview !== compactTitle ? `<em>${escapeHTML(compactPreview)}</em>` : ""}
                  </span>
                  <span class="diario321LibrarySummaryBadges">
                    <i class="diario321ToneChip diario321ToneChip--tools ${toneClass}" aria-label="tom da frase">${escapeHTML(toneLabel)}</i>
                    ${mastered ? `<i class="diario321LibraryState is-done">praticada</i>` : `<i class="diario321LibraryState">revisar</i>`}
                    <i class="diario321LibraryState diario321LibraryTrainState ${trainingInfo.completed ? "is-done" : ""}">${trainingInfo.completed ? "105x" : `${trainingInfo.repsDone}/105`}</i>
                    ${favorite ? `<i class="diario321LibraryStar">★</i>` : ""}
                  </span>
                </summary>

                <div class="diario321PhraseTextBlock diario321LibraryExpanded" data-stop-entry-toggle>
                  <div class="diario321EntryTop diario321EntryTop--line">
                    <small><span>${escapeHTML(envIcon)}</span> Frase ${index + 1} · ${escapeHTML(envLabel)} · ${escapeHTML(entry.wordRomaji || "palavra")} ${entry.wordPt ? `= ${escapeHTML(entry.wordPt)}` : ""}</small>
                    <button class="diario321FavoriteBtn ${favorite ? "is-active" : ""}" type="button" data-entry-favorite="${escapeHTML(entry.id)}" aria-label="favoritar frase">${favorite ? "★" : "☆"}</button>
                  </div>
                  <div class="diario321EntryMain ${jpPhrase ? "is-japanese" : ""}" title="frase principal">${escapeHTML(mainPhrase)}</div>
                  ${supportPhrase ? `<div class="diario321EntryPt">${escapeHTML(supportPhrase)}</div>` : ""}
                  ${romajiSupport ? `<div class="diario321EntryRomaji">${escapeHTML(romajiSupport)}</div>` : ""}
                </div>
                ${renderDiario321EntryTrainingPanel(entry)}
                <div class="diario321PhraseTools diario321LibraryTools" aria-label="ações da frase" data-stop-entry-toggle>
                  <button class="diario321EntryTrainBtn" type="button" data-entry-start-train="${escapeHTML(entry.id)}">Treinar 105x</button>
                  <button class="diario321EntryShareBtn" type="button" data-entry-share="${escapeHTML(entry.id)}">Compartilhar</button>
                  <label class="diario321MasteredCheck diario321MasteredCheck--clean" title="marcar como praticada">
                    <input type="checkbox" ${mastered ? "checked" : ""} data-entry-mastered="${escapeHTML(entry.id)}">
                    <span>praticada</span>
                  </label>
                  <button class="diario321EntryMiniBtn diario321IconBtn" type="button" data-entry-edit="${escapeHTML(entry.id)}" aria-label="editar frase">✎</button>
                  <button class="diario321DeleteEntry diario321DeleteEntry--clean diario321IconBtn" type="button" data-entry-delete="${escapeHTML(entry.id)}" aria-label="excluir frase">
                    <svg class="diario321TrashIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M4 7h16"/>
                      <path d="M10 11v6"/>
                      <path d="M14 11v6"/>
                      <path d="M6 7l1 14h10l1-14"/>
                      <path d="M9 7V4h6v3"/>
                    </svg>
                  </button>
                  <div class="diario321MovePair" aria-label="reordenar frase">
                    <button class="diario321EntryMiniBtn diario321IconBtn" type="button" data-entry-move="up" data-entry-id="${escapeHTML(entry.id)}" aria-label="subir frase">↑</button>
                    <button class="diario321EntryMiniBtn diario321IconBtn" type="button" data-entry-move="down" data-entry-id="${escapeHTML(entry.id)}" aria-label="descer frase">↓</button>
                  </div>
                  <span class="diario321DragHint" title="arraste para ordenar">☷</span>
                </div>
                ${diario321DeleteConfirmId === entry.id ? `
                  <div class="diario321DeleteConfirm" role="alert" data-stop-entry-toggle>
                    <b>Apagar frase?</b>
                    <span>não dá para desfazer</span>
                    <div>
                      <button type="button" class="diario321DeleteCancel" data-entry-delete-cancel>cancelar</button>
                      <button type="button" class="diario321DeleteConfirmBtn" data-entry-delete-confirm="${escapeHTML(entry.id)}">apagar</button>
                    </div>
                  </div>
                ` : ""}
              </details>
            </article>
          `;
        }).join("") : `
          <p class="diario321Empty">Nenhuma frase neste filtro.</p>
        `}
        </div>
        ${renderDiario321AddPhraseButton()}
      </section>
    `;
  }

  function renderDiario321CustomToneModal() {
    if (!diario321ToneModalOpen) return "";
    const label = String(diario321ToneDraft?.label || "");
    const hint = String(diario321ToneDraft?.hint || "");
    return `
      <div class="diario321ModalBackdrop" role="presentation" data-close-custom-tone-modal>
        <section class="diario321ToneModal" role="dialog" aria-modal="true" aria-labelledby="diario321ToneModalTitle" onclick="event.stopPropagation()">
          <div class="diario321ToneModalHead">
            <div>
              <small>Novo tom</small>
              <h2 id="diario321ToneModalTitle">Criar tom de conversa</h2>
            </div>
            <button type="button" class="diario321ToneModalClose" data-close-custom-tone-modal aria-label="fechar">×</button>
          </div>
          <label class="diario321ToneModalField">
            <span>Nome do tom</span>
            <input data-tone-draft-label value="${escapeHTML(label)}" maxlength="18" placeholder="ex.: Chefe">
          </label>
          <label class="diario321ToneModalField">
            <span>Quando usar</span>
            <textarea data-tone-draft-hint maxlength="60" placeholder="ex.: para falar com líder ou superior">${escapeHTML(hint)}</textarea>
          </label>
          <div class="diario321ToneModalActions">
            <button type="button" class="diario321ToneModalCancel" data-close-custom-tone-modal>cancelar</button>
            <button type="button" class="diario321ToneModalSave" data-save-custom-tone-modal>salvar tom</button>
          </div>
        </section>
      </div>
    `;
  }


  function diario321SeedInfo() {
    const env = diario321SelectedEnvironment();
    const romaji = String(diario321AltruistaState.wordRomaji || env.exampleWord || "kikai").trim().toLowerCase();
    const meaning = String(diario321AltruistaState.wordPt || env.exampleMeaning || "máquina").trim();
    let jp = "";
    try {
      jp = GENIAL_KANJI_WORDS[romaji] || GENIAL_KATAKANA_WORDS[romaji] || diario321JapaneseFromRomajiInput(`j:${romaji}`, diario321AltruistaState.speechStyle || "polite") || romajiToSmartJapanese(romaji, "mixed");
    } catch {
      jp = romaji === "kikai" ? "機械" : romaji;
    }
    return {
      env,
      envKey: diario321AltruistaState.environment || "trabalho",
      romaji: romaji || "kikai",
      meaning: meaning || "máquina",
      jp: jp || "機械",
      chance: clamp(Number(diario321AltruistaState.chance || 65), 0, 100)
    };
  }

  function diario321ProgressInfo() {
    const seed = diario321SeedInfo();
    const entries = Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : [];
    const seedEntries = entries.filter(entry => String(entry?.wordRomaji || "").toLowerCase() === seed.romaji || !String(entry?.wordRomaji || "").trim());
    const written = entries.length ? seedEntries.length || entries.length : 0;
    const variations = Math.min(7, written);
    const percent = Math.max(0, Math.min(100, Math.round((variations / 7) * 100)));
    return { written, variations, percent };
  }

  function diario321ChallengeTemplates(kind = "simple") {
    const seed = diario321SeedInfo();
    const word = seed.meaning || "palavra";
    const romaji = seed.romaji || "kikai";
    const templates = {
      simple: {
        pt: `A ${word} é importante.`,
        romaji: `j:${romaji} wa taisetsu desu.`
      },
      work: {
        pt: `A ${word} parou no trabalho.`,
        romaji: `j:${romaji} ga tomarimashita.`
      },
      question: {
        pt: `Você pode verificar a ${word}?`,
        romaji: `j:${romaji} o mite moraemasu ka.`
      },
      negative: {
        pt: `A ${word} não está funcionando.`,
        romaji: `j:${romaji} wa ugoiteimasen.`
      },
      polite: {
        pt: `Poderia confirmar a ${word}, por favor?`,
        romaji: `j:${romaji} o kakunin shite itadakemasu ka.`
      },
      past: {
        pt: `A ${word} parou ontem também.`,
        romaji: `kinou mo j:${romaji} ga tomarimashita.`
      },
      real: {
        pt: `A ${word} parou e apareceu um erro desconhecido.`,
        romaji: `j:${romaji} ga tomatte, shiranai k:era- ga hyouji saremashita.`
      }
    };
    return templates[kind] || templates.simple;
  }

  function useDiario321Challenge(kind = "simple") {
    const model = diario321ChallengeTemplates(kind);
    diario321AltruistaState.ptIdea = model.pt;
    diario321AltruistaState.romajiIdea = model.romaji;
    diario321AltruistaState.jpIdea = diario321JapaneseFromRomajiInput(model.romaji, diario321AltruistaState.speechStyle || "polite");
    diario321LastAutoJapaneseIdea = diario321AltruistaState.jpIdea;
    diario321NoteFoldOpen = true;
    saveDiario321AltruistaState();
    toast("desafio enviado para sua escrita");
    render();
    setTimeout(() => {
      try { document.querySelector(".diario321WritingCard")?.scrollIntoView({ behavior: "smooth", block: "center" }); } catch {}
    }, 80);
  }

  function diario321CurrentEditorField(name = "") {
    const el = document.querySelector(`[data-altruista-field='${name}']`);
    return String(el?.value || diario321AltruistaState?.[name] || "").trim();
  }

  function diario321BuildAIPrompt() {
    const seed = diario321SeedInfo();
    const env = seed.env?.label || "vida real no Japão";
    const tone = diario321ToneLabel(diario321AltruistaState.speechStyle || "polite");
    const currentPt = diario321CurrentEditorField("ptIdea");
    const currentRomaji = diario321CurrentEditorField("romajiIdea");
    const currentJp = diario321CurrentEditorField("jpIdea");
    const hasDraft = !!(currentPt || currentRomaji || currentJp);

    const lines = [
      "Você é um professor de japonês prático para brasileiros que vivem e trabalham no Japão.",
      "Crie um material expansivo para o DIÁRIO321 com exatamente 10 frases curtas, naturais e úteis.",
      `Palavra em estudo: ${seed.jp} (${seed.romaji} = ${seed.meaning}).`,
      `Contexto da frase: ${env}. Tom desejado: ${tone}.`,
      "",
      hasDraft ? "Use a frase abaixo como base principal e crie variações úteis a partir dela:" : "Crie as frases com base na palavra e no contexto acima:",
      currentPt ? `Português base: ${currentPt}` : "Português base: ainda não preenchido",
      currentRomaji ? `Romaji base: ${currentRomaji}` : "Romaji base: ainda não preenchido",
      currentJp ? `Japonês base: ${currentJp}` : "Japonês base: ainda não preenchido",
      "",
      "As 10 frases precisam cobrir obrigatoriamente:",
      "1. presente afirmativo",
      "2. presente negativo",
      "3. passado afirmativo",
      "4. passado negativo",
      "5. futuro ou intenção",
      "6. pergunta simples",
      "7. pergunta educada",
      "8. frase de trabalho",
      "9. frase natural do cotidiano",
      "10. frase para problema ou emergência leve",
      "",
      "Entregue exatamente neste formato para o Diário conseguir importar:",
      "Frase 1 - presente afirmativo",
      "Japonês: kanji{leitura} com espaços corretos antes de kanji com furigana",
      "Romaji:",
      "Português:",
      "Tipo: presente afirmativo",
      "Tom: Educado ou Natural",
      "Uso: Trabalho / Cotidiano / Pergunta / Negativa / Passado / Futuro / Problema",
      "Explicação curta:",
      "",
      "Repita o mesmo formato até a Frase 10.",
      "",
      "Regras:",
      "- Use japonês natural, curto e seguro para vida real no Japão.",
      "- Priorize frases que um brasileiro no Japão realmente usaria.",
      "- Se aparecer palavra estrangeira, deixe em katakana.",
      "- Evite frases longas demais.",
      "- Cada frase precisa ser boa para repetir no treino 105x do Diário321.",
      "- Não escreva explicações longas; seja direto."
    ];

    return lines.join("\n");
  }

  async function diario321CopyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "readonly");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return !!ok;
    } catch {
      return false;
    }
  }


  function diario321BuildEntryShareText(entry = {}) {
    const jp = diario321StripFurigana(entry.jp || diario321JapaneseFromRomajiInput(entry.romaji || "", entry.speechStyle || "polite") || "").trim();
    const pt = String(entry.pt || "").trim();
    const romaji = String(entry.romaji || "").trim();
    const word = [String(entry.wordRomaji || "").trim(), String(entry.wordPt || "").trim()].filter(Boolean).join(" = ");
    const env = diario321EnvironmentLabel(entry.environment || "trabalho");
    return [
      "🇯🇵 Frase prática NIHONGO321",
      word ? `Palavra: ${word}` : "",
      env ? `Contexto: ${env}` : "",
      "",
      pt ? `Português: ${pt}` : "",
      jp ? `Japonês: ${jp}` : "",
      romaji ? `Romaji: ${romaji}` : "",
      "",
      "Treine japonês prático no Japão.",
      "NIHONGO321 — frases reais + método 105x."
    ].filter(line => line !== "").join("\n");
  }

  async function shareDiario321Entry(entryId) {
    const id = String(entryId || "");
    const entry = (Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : []).find(item => item.id === id);
    if (!entry) return toast("frase não encontrada");
    keepDiario321EntryOpen(id);
    const text = diario321BuildEntryShareText(entry);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Frase prática NIHONGO321", text });
        toast("compartilhamento aberto");
        return;
      }
    } catch {}
    const ok = await diario321CopyText(text);
    toast(ok ? "frase copiada para compartilhar" : "não consegui copiar automaticamente");
  }

  async function copyDiario321AIPrompt(ev) {
    try { ev?.preventDefault?.(); ev?.stopPropagation?.(); } catch {}
    const text = diario321BuildAIPrompt();
    const ok = await diario321CopyText(text);
    diario321AIPromptWasCopied = !!ok;
    openDiario321AIPastePanel(text, "prompt");
    toast(ok ? "pedido de variações copiado" : "pedido pronto para copiar");
  }


  function diario321FindAIBlockValue(block = "", labels = []) {
    const lines = String(block || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const safeLabels = labels.map(label => String(label || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`^(?:${safeLabels.join("|")})\\s*[:：-]\\s*(.+)$`, "i");
    const found = lines.find(line => pattern.test(line));
    return found ? found.replace(pattern, "$1").trim() : "";
  }

  function diario321ExtractAIVariationEntries(text = "") {
    const raw = String(text || "").trim();
    if (!raw) return [];

    const blocks = [];
    const regex = /(?:^|\n)\s*(?:#{1,4}\s*)?(?:Frase\s*)?(\d{1,2})\s*(?:[.\)\-–—:：]|\s+-\s+)?[^\n]*\n([\s\S]*?)(?=\n\s*(?:#{1,4}\s*)?(?:Frase\s*)?\d{1,2}\s*(?:[.\)\-–—:：]|\s+-\s+)|$)/gi;
    let match;
    while ((match = regex.exec(raw))) {
      const n = Number(match[1] || 0);
      const body = String(match[2] || "").trim();
      if (n >= 1 && n <= 20 && body) blocks.push({ n, body });
    }

    if (blocks.length < 2) return [];

    const seed = diario321SeedInfo();
    const env = diario321AltruistaState.environment || "trabalho";
    const normalizedTone = diario321NormalizeTone(diario321AltruistaState.speechStyle || "polite");
    const nowIso = new Date().toISOString();

    const entries = blocks.map(item => {
      const jp = diario321FindAIBlockValue(item.body, ["Japonês", "Japones", "JP", "日本語"]);
      const romaji = diario321FindAIBlockValue(item.body, ["Romaji", "Rōmaji", "Roomaji"]);
      const pt = diario321FindAIBlockValue(item.body, ["Português", "Portugues", "Tradução", "Traducao", "PT"]);
      const tipo = diario321FindAIBlockValue(item.body, ["Tipo", "Variação", "Variacao"]);
      const tom = diario321FindAIBlockValue(item.body, ["Tom"]);
      const uso = diario321FindAIBlockValue(item.body, ["Uso", "Contexto"]);
      const explanation = diario321FindAIBlockValue(item.body, ["Explicação curta", "Explicacao curta", "Explicação", "Explicacao"]);

      if (!jp && !romaji && !pt) return null;

      const toneValue = /natural/i.test(tom) ? "natural" : (/educad|polid/i.test(tom) ? "polite" : normalizedTone);
      return {
        id: uid("diario_ai_variacao"),
        environment: env,
        wordRomaji: diario321AltruistaState.wordRomaji || seed.romaji,
        wordPt: diario321AltruistaState.wordPt || seed.meaning,
        jp,
        pt,
        romaji,
        speechStyle: toneValue,
        variationType: tipo || uso || `variação ${item.n}`,
        source: "ia_expansiva_10",
        note: explanation || "Variação criada pela IA para revisão 360°.",
        checklist: { paper: false, voice: false, useful: true },
        mastered: false,
        favorite: false,
        masteredAt: null,
        createdAt: nowIso
      };
    }).filter(Boolean);

    const unique = [];
    const seen = new Set();
    for (const entry of entries) {
      const key = `${String(entry.jp || "").trim()}||${String(entry.pt || "").trim()}||${String(entry.romaji || "").trim()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
    }
    return unique.slice(0, 10);
  }

  function diario321ApplyAIText(text = "") {
    const raw = String(text || "").trim();
    if (!raw) return false;

    const variationEntries = diario321ExtractAIVariationEntries(raw);
    if (variationEntries.length >= 2) {
      diario321AltruistaState.entries = Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries : [];
      diario321AltruistaState.entries = [...variationEntries, ...diario321AltruistaState.entries].slice(0, 80);
      diario321OpenEntryId = variationEntries[0]?.id || "";
      clearDiario321PracticeDraft({ keepOpen: false });
      saveDiario321AltruistaState();
      render();
      toast(`${variationEntries.length} variações adicionadas ao Diário`);
      setTimeout(() => {
        try { document.querySelector(".diario321PracticeEntries")?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {}
      }, 80);
      return true;
    }

    const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const findValue = (labels) => {
      const pattern = new RegExp(`^(?:${labels.join("|")})\\s*[:：-]\\s*(.+)$`, "i");
      const found = lines.find(line => pattern.test(line));
      return found ? found.replace(pattern, "$1").trim() : "";
    };
    const jp = findValue(["japon[eê]s", "jp", "日本語"]);
    const romaji = findValue(["romaji", "r[oô]maji"]);
    const pt = findValue(["portugu[eê]s", "tradu[cç][aã]o", "pt"]);
    if (jp) diario321AltruistaState.jpIdea = jp;
    if (romaji) diario321AltruistaState.romajiIdea = romaji;
    if (pt) diario321AltruistaState.ptIdea = pt;
    if (!jp && !romaji && !pt) {
      diario321AltruistaState.ptIdea = raw.slice(0, 800);
    }
    diario321NoteFoldOpen = true;
    saveDiario321AltruistaState();
    render();
    return true;
  }

  function openDiario321AIPastePanel(initialText = "", mode = "paste") {
    diario321AIPasteDraft = String(initialText || diario321AIPasteDraft || "");
    diario321AIPasteMode = mode === "prompt" ? "prompt" : "paste";
    diario321AIPasteOpen = true;
    render();
    setTimeout(() => {
      try {
        const area = document.querySelector("[data-ai-paste-text]");
        area?.focus?.({ preventScroll: true });
      } catch {}
    }, 60);
  }

  function closeDiario321AIPastePanel() {
    diario321AIPasteOpen = false;
    diario321AIPasteDraft = "";
    diario321AIPasteMode = "paste";
    diario321AIPromptWasCopied = false;
    render();
  }

  async function copyDiario321AIPastePanelText() {
    const area = document.querySelector("[data-ai-paste-text]");
    const text = String(area?.value || diario321AIPasteDraft || "").trim();
    if (!text) return toast("nada para copiar");
    const ok = await diario321CopyText(text);
    toast(ok ? "texto copiado" : "não consegui copiar automaticamente");
  }

  async function applyDiario321AIPastePanel() {
    if (diario321AIPasteMode === "prompt") {
      if (diario321AIPromptWasCopied) {
        closeDiario321AIPastePanel();
        return;
      }
      await copyDiario321AIPastePanelText();
      diario321AIPromptWasCopied = true;
      toast("pedido de variações copiado");
      render();
      return;
    }
    const area = document.querySelector("[data-ai-paste-text]");
    const text = String(area?.value || diario321AIPasteDraft || "").trim();
    if (!text) {
      toast("cole a resposta da IA primeiro");
      return;
    }
    if (diario321ApplyAIText(text)) {
      diario321AIPasteOpen = false;
      diario321AIPasteDraft = "";
      toast("resposta aplicada");
      render();
      return;
    }
    toast("não consegui entender o texto");
  }

  async function pasteDiario321AIResponse() {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (diario321ApplyAIText(text)) {
          toast("resposta da IA colada");
          return;
        }
        if (String(text || "").trim()) {
          openDiario321AIPastePanel(text);
          return;
        }
      }
    } catch {}
    openDiario321AIPastePanel("");
  }

  function saveDiario321CurrentToNihongoAndTrain() {
    const seed = diario321SeedInfo();
    const ptIdea = String(document.querySelector("[data-altruista-field='ptIdea']")?.value || diario321AltruistaState.ptIdea || "").trim();
    const romajiIdea = String(document.querySelector("[data-altruista-field='romajiIdea']")?.value || diario321AltruistaState.romajiIdea || "").trim();
    let jpIdea = String(document.querySelector("[data-altruista-field='jpIdea']")?.value || diario321AltruistaState.jpIdea || "").trim();

    if (!jpIdea && romajiIdea) jpIdea = diario321JapaneseFromRomajiInput(romajiIdea, diario321AltruistaState.speechStyle || "polite");
    if (!jpIdea || !ptIdea) {
      toast(!jpIdea ? "preencha japonês ou romaji" : "preencha português");
      return;
    }

    const topicId = selectedSaveTopicId ? selectedSaveTopicId() : "topic_caderno321";
    const phrase = {
      id: uid("diario321_train"),
      source: "DIÁRIO321",
      jp: jpIdea,
      pt: ptIdea,
      topicId,
      targetTopicId: topicId,
      targetTopicName: safeSaveTopicName ? safeSaveTopicName(topicId) : "Diário321",
      newWords: [{ jp: seed.jp, pt: seed.meaning }],
      caderno321: {
        romaji: romajiIdea,
        targetTopicId: topicId,
        targetTopicName: safeSaveTopicName ? safeSaveTopicName(topicId) : "Diário321",
        details: { words: `${seed.jp}=${seed.meaning}`, particles: "", explanation: "Frase criada na Oficina Viva do DIÁRIO321.", situation: seed.env?.label || "vida real" },
        sourceVersion: "4.17.10-R"
      },
      note: `Palavra de estudo: ${seed.jp} = ${seed.meaning}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = caderno321SavePhraseDirectlyToNihongoLocal(phrase);
    if (!result.ok) {
      toast(caderno321SaveErrorMessage ? caderno321SaveErrorMessage(result.error || result.reason) : "não consegui enviar");
      return;
    }

    genialState.lastSavedAt = new Date().toISOString();
    genialState.lastSaveError = "";
    genialState.lastSavedTopicId = result.topicId || topicId;
    genialState.lastSavedTopicName = result.topicName || "Diário321";
    genialState.lastSavedPhraseId = result.phraseId || "";
    saveGenialState();

    try { saveDiario321PracticeEntry(); } catch {}

    const prepared = caderno321PrepareTrainingDirectlyInNihongoLocal(result.phraseId || "", result.topicId || topicId);
    const targetUrl = new URL("../index.html#/105x", window.location.href).href;
    toast(prepared.ok ? "enviando para o treino 105x" : "frase salva no NIHONGO321");
    setTimeout(() => {
      try {
        if (isEmbeddedInNihongo321() && window.parent && window.parent !== window) window.parent.location.href = targetUrl;
        else window.location.href = targetUrl;
      } catch {
        window.location.href = targetUrl;
      }
    }, 180);
  }

  function renderDiario321ModernHero() {
    const embedded = isEmbeddedInNihongo321();
    return `
      <section class="diario321ModernHero" aria-label="entrada do Diário321">
        <div class="diario321ModernHeroShade"></div>
        <div class="diario321ModernHeroTop">
          <div class="diario321ModernBrand">
            <img src="../img/logo_nihongo321.png" alt="" onerror="this.style.display='none'">
            <span><b>NIHONGO321</b><small>日本語で、未来をつくる。</small></span>
          </div>
          <div class="diario321ModernHeroActions">
            ${embedded ? `<a class="diario321ModernBack" href="../index.html#/home" target="_parent" aria-label="voltar ao NIHONGO321">↩ voltar</a>` : ""}
            <button class="diario321ModernTheme" type="button" data-action="toggleTheme" aria-label="alternar tema">${appTheme === "dark" ? "☀️" : "🌙"}</button>
            <div class="diario321ModernStreak"><span>🔥</span><b>105</b></div>
          </div>
        </div>
        <div class="diario321ModernHeroText">
          <span class="diario321NotebookIcon">📒</span>
          <h1>DIÁRIO<span>321</span></h1>
          <p>Escreva o japonês que vai <strong>salvar</strong> seu dia amanhã.</p>
        </div>
      </section>
    `;
  }

  function renderDiario321WordPlayCard() {
    const seed = diario321SeedInfo();
    const hasWord = diario321HasPolivalencia();
    return `
      <section class="diario321PlayPanel" aria-label="palavra de treino">
        <div class="diario321PlayQuestion">
          <span class="diario321SunIcon">☀</span>
          <b>Qual palavra vai dar <em>play</em><br>no seu treino hoje?</b>
          <button type="button" data-save-polivalencia aria-label="abrir página">▶</button>
        </div>

        <div class="diario321SeedCard">
          <div class="diario321SeedKanji">${escapeHTML(seed.jp)}</div>
          <div class="diario321SeedMeta">
            <strong>${escapeHTML(seed.romaji)}</strong>
            <span>${escapeHTML(seed.meaning)}</span>
          </div>
          <button class="diario321SeedAudio" type="button" data-speak-seed aria-label="ouvir palavra">🔊</button>
        </div>

        <details class="diario321SeedSetup" ${hasWord ? "" : "open"}>
          <summary>${hasWord ? "trocar semente" : "escolher minha primeira semente"}</summary>
          <div class="diario321SeedSetupGrid">
            <label><span>Palavra em romaji</span><input data-altruista-field="wordRomaji" value="${escapeHTML(diario321AltruistaState.wordRomaji || "")}" placeholder="ex.: ${escapeHTML(seed.env.exampleWord || "kikai")}"></label>
            <label><span>Significado</span><input data-altruista-field="wordPt" value="${escapeHTML(diario321AltruistaState.wordPt || "")}" placeholder="ex.: ${escapeHTML(seed.env.exampleMeaning || "máquina")}"></label>
            <label><span>Frequência: ${seed.chance}%</span><input type="range" min="0" max="100" step="5" value="${seed.chance}" data-altruista-field="chance"></label>
            <button class="diario321SeedOpenBtn" type="button" data-save-polivalencia>abrir página</button>
          </div>
        </details>
      </section>
    `;
  }

  function renderDiario321SeedDictionary() {
    const selected = diario321AltruistaState.environment || "trabalho";
    return `
      <section class="diario321ModernCard diario321SeedDictionary" aria-label="dicionário de sementes">
        <div class="diario321ModernCardHead"><span>📍 Contexto da frase</span><small>escolha o ambiente</small></div>
        <div class="diario321SeedChips">
          ${Object.entries(diario321AllEnvironmentPresets()).map(([key, item]) => `
            <button class="${selected === key ? "is-active" : ""}" type="button" data-scenario-pick="${escapeHTML(key)}">
              <em>${escapeHTML(item.icon || "📍")}</em>${escapeHTML(item.label.replace(/^No\s+|^Na\s+/, ""))}
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderDiario321AIBox() {
    return `
      <section class="diario321ModernCard diario321AIBox diario321AIBox--contextual" aria-label="assistente de criação com inteligência artificial">
        <div class="diario321ModernCardHead"><span>✦ Assistente da frase</span><small>baseado nos campos acima</small></div>
        <p class="diario321AIHelp diario321AIContextHint">Crie um pedido pronto para ChatGPT/Gemini e receba 10 variações úteis, curtas e fáceis de importar para o Diário321.</p>
        <div class="diario321AIButtons diario321AIButtons--refined">
          <button class="diario321AIButton diario321AIButton--copy" type="button" data-copy-ai-prompt>
            <span aria-hidden="true">⧉</span>
            <b>Criar pedido</b>
            <small>10 variações 360°</small>
          </button>
          <button class="diario321AIButton diario321AIButton--paste" type="button" data-paste-ai-response>
            <span aria-hidden="true">▣</span>
            <b>Importar resposta</b>
            <small>jogar no Diário</small>
          </button>
        </div>
      </section>
    `;
  }


  function renderDiario321Challenge360() {
    const items = [
      ["simple", "🌿", "Simples"],
      ["work", "💼", "Trabalho"],
      ["question", "?", "Pergunta"],
      ["negative", "⊘", "Negativa"],
      ["polite", "🙏", "Educada"],
      ["past", "◷", "Passado"],
      ["real", "👥", "Situação real"]
    ];
    return `
      <section class="diario321ModernCard diario321Challenge360" aria-label="desafio 360 graus">
        <div class="diario321ModernCardHead"><span>◎ Desafio 360°</span><small>crie variações</small></div>
        <div class="diario321ChallengeGrid">
          ${items.map(([key, icon, label]) => `<button type="button" data-use-challenge="${key}"><em>${icon}</em><span>${label}</span></button>`).join("")}
        </div>
      </section>
    `;
  }

  function renderDiario321ProgressCard() {
    const seed = diario321SeedInfo();
    const progress = diario321ProgressInfo();
    const pageNumber = Math.max(1, Math.min(99, Math.ceil((Array.isArray(diario321AltruistaState.entries) ? diario321AltruistaState.entries.length : 0) / 7) || 1));
    return `
      <section class="diario321ModernCard diario321ProgressCard" aria-label="progresso da página">
        <div class="diario321ModernCardHead"><span>📖 Página ${pageNumber} — ${escapeHTML(seed.jp)}</span><small>${progress.percent}%</small></div>
        <div class="diario321ProgressBody">
          <div class="diario321ProgressBadges">
            <span>🌱 semente criada</span>
            <span>✍️ ${progress.written} frase${progress.written === 1 ? "" : "s"} escrita${progress.written === 1 ? "" : "s"}</span>
            <span>🔥 ${progress.variations}/7 variações</span>
          </div>
          <div class="diario321ProgressRing" style="--p:${progress.percent}"><b>${progress.percent}%</b></div>
        </div>
      </section>
    `;
  }

  function renderDiario321ModernActions() {
    return `
      <section class="diario321ActionDock diario321ActionDock--preview" aria-label="ações principais">
        <button class="diario321ActionSave" type="button" data-save-practice-entry><span>▣</span>Salvar no Diário</button>
        <button class="diario321ActionTrain" type="button" data-scroll-diario321-library><span>➤</span>Ver frases salvas</button>
      </section>
    `;
  }

  function renderDiario321AIPastePanel() {
    if (!diario321AIPasteOpen) return "";
    const isPrompt = diario321AIPasteMode === "prompt";
    const title = isPrompt ? (diario321AIPromptWasCopied ? "Pedido de variações copiado" : "Pedido de variações pronto") : "Colar resposta da IA";
    const helper = isPrompt
      ? (diario321AIPromptWasCopied
        ? "O pedido de 10 variações já foi copiado. Cole no ChatGPT/Gemini, copie a resposta e volte no botão Colar resposta."
        : "O Diário criou um pedido expansivo com 10 frases. Toque em Copiar pedido e cole no ChatGPT/Gemini.")
      : "Cole aqui a resposta do ChatGPT/Gemini. O Diário tenta separar japonês, romaji e português.";
    const actionLabel = isPrompt ? (diario321AIPromptWasCopied ? "Entendi" : "Copiar pedido") : "Aplicar no Diário";
    const cancelLabel = isPrompt ? "Fechar" : "Cancelar";
    const placeholder = isPrompt
      ? "pedido para IA"
      : "Ex.:\nJaponês: 機械が突然止まって、しらないエラーが表示されました。\nRomaji: kikai ga totsuzen tomatte, shiranai era- ga hyouji saremashita.\nPortuguês: A máquina parou de repente e apareceu um erro que eu não sei.";
    return `
      <div class="diario321AIPasteOverlay" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
        <div class="diario321AIPasteSheet ${isPrompt && diario321AIPromptWasCopied ? "is-copied" : ""}">
          <div class="diario321AIPasteHead">
            <span>${escapeHTML(title)}</span>
            <button type="button" data-close-ai-paste aria-label="fechar">×</button>
          </div>
          <p>${escapeHTML(helper)}</p>
          <textarea data-ai-paste-text ${isPrompt ? "readonly" : ""} placeholder="${escapeHTML(placeholder)}">${escapeHTML(diario321AIPasteDraft || "")}</textarea>
          <div class="diario321AIPasteActions">
            <button type="button" data-close-ai-paste>${escapeHTML(cancelLabel)}</button>
            <button type="button" data-apply-ai-paste>${escapeHTML(actionLabel)}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderDiario321WritingPracticeCard() {
    const items = [
      ["hiragana", "あ", "Hiragana", "base da leitura"],
      ["katakana", "ア", "Katakana", "lojas, placas e objetos"],
      ["kanji", "漢", "Kanji", "ideogramas por nível"]
    ];
    return `
      <section class="diario321ModernCard diario321ScriptShortcut" aria-label="treinos de escrita japonesa">
        <div class="diario321ModernCardHead"><span>✍ Treinos de escrita</span><small>kana e kanji</small></div>
        <p class="diario321ScriptShortcutLead">Escolha uma área para praticar leitura, escrita e memorização sem sair do DIÁRIO321.</p>
        <div class="diario321ScriptShortcutGrid">
          ${items.map(([area, icon, title, desc]) => `
            <a href="./index.html?embedded=1&screen=dashboard&area=${area}" class="diario321ScriptShortcutBtn">
              <em>${icon}</em>
              <b>${title}</b>
              <small>${desc}</small>
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderDiario321BottomNav() {
    return "";
  }


  function scrollDiario321Library() {
    try {
      const target = document.getElementById("diario321PhraseLibrary") || document.querySelector(".diario321PhraseLibrary");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast("abra uma frase e toque em Treinar 105x");
    } catch {
      toast("abra uma frase e toque em Treinar 105x");
    }
  }

  function renderDiario321AltruistaNotebook() {
    return `
      <main class="appMain appMain--diario321 appMain--altruista appMain--diarioModern">
        <section class="genialNotebook diario321AltruistaNotebook diario321ModernNotebook">
          ${renderDiario321ModernHero()}
          ${renderDiario321WordPlayCard()}
          ${renderDiario321SeedDictionary()}
          ${renderDiario321PracticeEditor()}
          ${renderDiario321Challenge360()}
          ${renderDiario321ProgressCard()}
          ${renderDiario321ModernActions()}
          ${renderDiario321PracticeEntries()}
          <section class="diario321ModernLearningShelf">
            ${renderDiario321WritingPracticeCard()}
            ${renderDiario321QuickGuide()}
            ${renderDiario321MethodCard()}
            ${renderDiario321ScienceCard()}
          </section>
        </section>
        ${renderDiario321BottomNav()}
        ${renderDiario321CustomToneModal()}
        ${renderDiario321AIPastePanel()}
      </main>
    `;
  }

  function renderGenialNotebook() {
    return renderDiario321AltruistaNotebook();
  }

  function renderDashboard() {
    return `
      <section class="card dashboardCard dashboardCard--compact">
        <div class="badge">diário inteligente</div>
        <h1 class="sectionTitle">Escolha seu caminho.</h1>
        <p class="dashboardLead">
          Abra o Diário321 para escrever, esconder o significado e revisar como um caderno real.
        </p>
        ${renderGenialEntryCard()}
        ${renderBridgeSummary()}
      </section>
      ${renderStudyMenus()}
    `;
  }

  function renderSee(word) {
    return `
      <section class="card realModeCard">
        <div class="stageLabel"><span>1. ver e entender</span><b>${categoryLabel()}</b></div>
        <div class="wordDisplay"><strong>${escapeHTML(word.jp)}</strong><span>${escapeHTML(word.romaji)}</span><em>${escapeHTML(word.pt)}</em></div>
        <div class="wordHint">${escapeHTML(word.hint)}</div>
        ${renderKanjiDetails(word)}
        <div class="actionGrid">
          <button class="actionBtn" data-action="speak">🔊 ouvir</button>
          <button class="actionBtn primary" data-screen="write">entendi, esconder</button>
          <button class="actionBtn" data-screen="dashboard">← lista</button>
          <button class="actionBtn" data-action="next">→ próxima</button>
        </div>
      </section>
    `;
  }

  function renderWrite(word) {
    return `
      <section class="card realModeCard">
        <div class="stageLabel stageLabel--write"><span>2. escrever no celular</span><button class="toneToggleBtn" type="button" data-action="toggleTone">${paperToneLabel()}</button></div>
        <div class="hiddenPrompt"><b>${escapeHTML(word.romaji)}</b><span>${escapeHTML(word.pt)}</span><small>${categoryLabel()} · escreva a palavra inteira na linha abaixo.</small></div>
        ${renderWritingAssistTools()}
        <div class="paperWrap"><canvas id="writeCanvas" class="writeCanvas sheetCanvas ${paperTone === "blackboard" ? "is-blackboard" : paperTone === "greenboard" ? "is-greenboard" : "is-paper"}" aria-label="área para escrever no celular"></canvas></div>
        <div class="actionGrid">
          <button class="actionBtn" data-action="clear">limpar</button>
          <button class="actionBtn" data-action="undo">desfazer</button>
          <button class="actionBtn" data-screen="see">ver palavra</button>
          <button class="actionBtn primary" data-screen="check">conferir</button>
        </div>
      </section>
    `;
  }

  function renderCheck(word, progress) {
    return `
      <section class="card realModeCard">
        <div class="stageLabel"><span>3. conferir com honestidade</span><b>${progress.correct || 0}/7 corretas</b></div>
        <div class="compareGrid">
          <div class="answerBox"><span>resposta correta</span><strong>${escapeHTML(word.jp)}</strong><em>${escapeHTML(word.romaji)} = ${escapeHTML(word.pt)}</em></div>
          <div class="studentSnapshotBox"><span>sua escrita</span>${drawingSnapshot ? `<img src="${drawingSnapshot}" alt="escrita feita pelo aluno no celular" />` : `<div class="emptySnapshot">sem imagem da escrita</div>`}</div>
        </div>
        ${renderVisualHint()}
        <div class="honestyBox"><b>Sua escrita ficou correta?</b><span></span></div>
        <div class="actionGrid">
          <button class="actionBtn good" data-result="correct">○ correto</button>
          <button class="actionBtn bad" data-result="incorrect">× incorreto</button>
          <button class="actionBtn" data-screen="write">↺ mais uma vez</button>
          <button class="actionBtn" data-action="next">→ próxima</button>
        </div>
      </section>
    `;
  }

  function renderSidebar(word, progress, stats) {
    const safeLabel = word?.jp || "";
    const safeCorrect = progress?.correct || 0;
    const safeTotal = stats?.total || 0;
    return `
      <aside class="infoStack kanaSideInfo" aria-label="resumo do treino">
        <div class="sideMiniCard">
          <b>${escapeHTML(safeLabel)}</b>
          <span>${safeCorrect}/7 nesta palavra</span>
          <small>${safeTotal} itens no caminho atual</small>
        </div>
      </aside>
    `;
  }

  function render() {
    if (screen === "genial") {
      const root = document.getElementById("app") || document.querySelector("[data-app]") || document.body;
      root.innerHTML = `${isEmbeddedInNihongo321() ? "" : renderAppHeader()}${renderGenialNotebook()}`;
      bindEvents();
      return;
    }

applyAppTheme();
    const word = currentWord();
    if (screen !== "dashboard" && word?.category === "kanji" && isKanjiPremiumLocked()) {
      category = "kanji";
      openMenu = "kanji";
      screen = "dashboard";
      saveState();
    }
    const safeWord = currentWord();
    const progress = progressFor(safeWord);
    const stats = totalStats();
    let main = screen === "dashboard" ? renderDashboard() : screen === "write" ? renderWrite(safeWord) : screen === "check" ? renderCheck(safeWord, progress) : renderSee(safeWord);
    const body = screen === "dashboard" ? main : `<section class="notebookGrid">${main}${renderSidebar(safeWord, progress, stats)}</section>`;

    $app.innerHTML = `
      <div class="stack">
        ${isEmbeddedInNihongo321() ? "" : renderAppHeader()}
        ${body}
        <div id="toast" class="toast" role="status" aria-live="polite"></div>
      </div>
    `;
    bindEvents();
    if (screen === "write") requestAnimationFrame(setupCanvas);
  }

  function downloadBridgePhrases() {
    const saved = savedBridgePhrases();
    const payload = {
      app: "DIÁRIO321",
      target: "NIHONGO321",
      version: "4.10.23",
      exportedAt: new Date().toISOString(),
      total: saved.length,
      phrases: saved
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caderno321-frases-para-nihongo321.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast(saved.length ? "arquivo de frases gerado" : "nenhuma frase salva ainda");
  }

  function bindEvents() {

    document.querySelectorAll("[data-writing-assist]").forEach(btn => btn.addEventListener("click", () => toggleWritingAssist(btn.dataset.writingAssist)));
    document.querySelectorAll("[data-save-new-genial-word]").forEach(btn => btn.addEventListener("click", saveNewGenialWord));
    document.querySelectorAll("[data-remove-genial-word]").forEach(btn => btn.addEventListener("click", () => removeGenialWord(btn.dataset.removeGenialWord)));


    document.querySelectorAll("[data-translate-genial-online]").forEach(btn => btn.addEventListener("click", translateGenialOnline));


    document.querySelectorAll("[data-evaluate-genial]").forEach(btn => btn.addEventListener("click", evaluateGenialNow));


    document.querySelectorAll("[data-open-genial]").forEach(btn => btn.addEventListener("click", openGenialNotebook));
    document.querySelectorAll("[data-close-genial]").forEach(btn => btn.addEventListener("click", closeGenialNotebook));
    document.querySelectorAll("[data-genial-mode]").forEach(btn => btn.addEventListener("click", () => setGenialMode(btn.dataset.genialMode)));
    document.querySelectorAll("[data-genial-input]").forEach(input => input.addEventListener("input", () => updateGenialRomaji(input.value)));
    document.querySelectorAll("[data-genial-pt-input]").forEach(input => input.addEventListener("input", () => updateGenialPt(input.value)));
    document.querySelectorAll("[data-genial-detail]").forEach(input => input.addEventListener("input", () => updateGenialDetail(input.dataset.genialDetail, input.value)));
    document.querySelectorAll("[data-altruista-field]").forEach(input => input.addEventListener("input", () => updateDiario321AltruistaField(input.dataset.altruistaField, input.value)));
    document.querySelectorAll("select[data-altruista-field]").forEach(select => select.addEventListener("change", () => updateDiario321AltruistaField(select.dataset.altruistaField, select.value)));
    document.querySelectorAll("[data-save-polivalencia]").forEach(btn => btn.addEventListener("click", saveDiario321Polivalencia));
    document.querySelectorAll("[data-add-environment]").forEach(btn => btn.addEventListener("click", addDiario321CustomEnvironment));
    document.querySelectorAll("[data-scenario-pick]").forEach(btn => btn.addEventListener("click", () => updateDiario321AltruistaField("environment", btn.dataset.scenarioPick || "trabalho")));
    document.querySelectorAll("[data-practice-check]").forEach(btn => btn.addEventListener("click", () => toggleDiario321PracticeCheck(btn.dataset.practiceCheck)));
    document.querySelectorAll("[data-save-practice-entry]").forEach(btn => btn.addEventListener("click", saveDiario321PracticeEntry));
    document.querySelectorAll("[data-scroll-diario321-library]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); scrollDiario321Library(); }));
    document.querySelectorAll("[data-diary-style]").forEach(btn => btn.addEventListener("click", () => setDiario321SpeechStyle(btn.dataset.diaryStyle || "polite")));
    document.querySelectorAll("[data-open-custom-tone-modal]").forEach(btn => btn.addEventListener("click", openDiario321CustomToneModal));
    document.querySelectorAll("[data-close-custom-tone-modal]").forEach(btn => btn.addEventListener("click", closeDiario321CustomToneModal));
    document.querySelectorAll("[data-save-custom-tone-modal]").forEach(btn => btn.addEventListener("click", saveDiario321CustomToneFromModal));
    document.querySelectorAll("[data-delete-custom-tone]").forEach(btn => btn.addEventListener("click", (ev) => { ev.stopPropagation(); requestDeleteDiario321CustomTone(btn.dataset.deleteCustomTone); }));
    document.querySelectorAll("[data-cancel-delete-custom-tone]").forEach(btn => btn.addEventListener("click", (ev) => { ev.stopPropagation(); cancelDeleteDiario321CustomTone(); }));
    document.querySelectorAll("[data-confirm-delete-custom-tone]").forEach(btn => btn.addEventListener("click", (ev) => { ev.stopPropagation(); deleteDiario321CustomTone(btn.dataset.confirmDeleteCustomTone); }));
    document.querySelectorAll("[data-tone-draft-label]").forEach(input => input.addEventListener("input", () => updateDiario321ToneDraft("label", input.value)));
    document.querySelectorAll("[data-tone-draft-hint]").forEach(input => input.addEventListener("input", () => updateDiario321ToneDraft("hint", input.value)));
    document.querySelectorAll("[data-open-practice-editor]").forEach(btn => btn.addEventListener("click", openDiario321AddPhrase));
    document.querySelectorAll(".diario321WritingSummary").forEach(summary => summary.addEventListener("click", (ev) => {
      const box = summary.closest(".diario321NoteFold");
      if (box && !box.open) {
        ev.preventDefault();
        ev.stopPropagation();
        openDiario321AddPhrase();
      }
    }));
    document.querySelectorAll(".diario321SetupFold").forEach(box => box.addEventListener("toggle", () => { diario321SetupFoldOpen = !!box.open; }));
    document.querySelectorAll(".diario321NoteFold").forEach(box => box.addEventListener("toggle", () => { diario321NoteFoldOpen = !!box.open; }));
    document.querySelectorAll(".diario321LibraryDetails").forEach(box => box.addEventListener("toggle", () => {
      const id = box.closest("[data-entry-drag-id]")?.dataset.entryDragId || "";
      if (box.open) {
        keepDiario321EntryOpen(id);
      } else if (diario321OpenEntryId === id && diario321ActiveTrainingEntryId !== id && diario321DeleteConfirmId !== id) {
        diario321OpenEntryId = "";
      }
    }));
    document.querySelectorAll("[data-stop-entry-toggle]").forEach(area => area.addEventListener("click", ev => ev.stopPropagation()));
    document.querySelectorAll("[data-entry-check]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); toggleDiario321EntryCheck(btn.dataset.entryId, btn.dataset.entryCheck); }));
    document.querySelectorAll("[data-entry-write]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); adjustDiario321EntryWriteCount(btn.dataset.entryId, btn.dataset.entryWrite); }));
    document.querySelectorAll("[data-entry-mastered]").forEach(input => {
      input.addEventListener("click", (ev) => ev.stopPropagation());
      input.addEventListener("change", (ev) => { ev.stopPropagation(); toggleDiario321EntryMastered(input.dataset.entryMastered); });
    });
    document.querySelectorAll("[data-entry-start-train]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); startDiario321EntryTraining(btn.dataset.entryStartTrain); }));
    document.querySelectorAll("[data-entry-share]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); shareDiario321Entry(btn.dataset.entryShare); }));
    document.querySelectorAll("[data-entry-train-repeat]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); repeatDiario321EntryTraining(btn.dataset.entryTrainRepeat); }));
    document.querySelectorAll("[data-entry-train-speak]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); speakDiario321EntryTraining(btn.dataset.entryTrainSpeak); }));
    document.querySelectorAll("[data-entry-train-reset]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); resetDiario321EntryTraining(btn.dataset.entryTrainReset); }));
    document.querySelectorAll("[data-entry-train-close]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); closeDiario321EntryTraining(btn.dataset.entryTrainClose); }));
    document.querySelectorAll("[data-entry-favorite]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); toggleDiario321EntryFavorite(btn.dataset.entryFavorite); }));
    document.querySelectorAll("[data-entry-filter]").forEach(btn => btn.addEventListener("click", () => setDiario321EntriesFilter(btn.dataset.entryFilter)));
    document.querySelectorAll("[data-entry-edit]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); keepDiario321EntryOpen(btn.dataset.entryEdit); startDiario321EntryEdit(btn.dataset.entryEdit); }));
    document.querySelectorAll("[data-entry-edit-romaji]").forEach(input => input.addEventListener("input", () => updateDiario321EntryEditJapanese(input.dataset.entryEditRomaji)));
    document.querySelectorAll('input[type="radio"][name^="entry-tone-"]').forEach(input => {
      input.addEventListener("click", ev => ev.stopPropagation());
      input.addEventListener("change", (ev) => { ev.stopPropagation(); updateDiario321EntryEditJapanese(input.name.replace(/^entry-tone-/, "")); });
    });
    document.querySelectorAll("[data-entry-save-edit]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); saveDiario321EntryEdit(btn.dataset.entrySaveEdit); }));
    document.querySelectorAll("[data-entry-cancel-edit]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); cancelDiario321EntryEdit(btn.closest("[data-entry-drag-id]")?.dataset.entryDragId || ""); }));
    document.querySelectorAll("[data-entry-delete]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); requestDeleteDiario321Entry(btn.dataset.entryDelete); }));
    document.querySelectorAll("[data-entry-delete-confirm]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); deleteDiario321Entry(btn.dataset.entryDeleteConfirm); }));
    document.querySelectorAll("[data-entry-delete-cancel]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); cancelDeleteDiario321Entry(); }));
    document.querySelectorAll("[data-entry-move]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); moveDiario321Entry(btn.dataset.entryId, btn.dataset.entryMove); }));
    document.querySelectorAll("[data-entry-drag-id]").forEach(card => {
      card.addEventListener("dragstart", (ev) => {
        try { ev.dataTransfer.setData("text/plain", card.dataset.entryDragId || ""); } catch {}
        card.classList.add("is-dragging");
      });
      card.addEventListener("dragend", () => card.classList.remove("is-dragging"));
      card.addEventListener("dragover", (ev) => ev.preventDefault());
      card.addEventListener("drop", (ev) => {
        ev.preventDefault();
        let dragId = "";
        try { dragId = ev.dataTransfer.getData("text/plain"); } catch {}
        reorderDiario321Entry(dragId, card.dataset.entryDragId || "");
      });
    });
    document.querySelectorAll("[data-reset-altruista]").forEach(btn => btn.addEventListener("click", resetDiario321Altruista));
    document.querySelectorAll("[data-use-idea]").forEach(btn => btn.addEventListener("click", () => { diario321AltruistaState.ptIdea = btn.dataset.useIdea || ""; saveDiario321AltruistaState(); render(); }));
    document.querySelectorAll("[data-use-question]").forEach(btn => btn.addEventListener("click", () => { diario321AltruistaState.ptIdea = btn.dataset.useQuestion || ""; saveDiario321AltruistaState(); render(); }));
    document.querySelectorAll("[data-use-challenge]").forEach(btn => btn.addEventListener("click", () => useDiario321Challenge(btn.dataset.useChallenge || "simple")));
    document.querySelectorAll("[data-copy-ai-prompt]").forEach(btn => btn.addEventListener("click", (ev) => copyDiario321AIPrompt(ev), { capture: true }));
    document.querySelectorAll("[data-paste-ai-response]").forEach(btn => btn.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); pasteDiario321AIResponse(); }, { capture: true }));
    document.querySelectorAll("[data-close-ai-paste]").forEach(btn => btn.addEventListener("click", closeDiario321AIPastePanel));
    document.querySelectorAll("[data-apply-ai-paste]").forEach(btn => btn.addEventListener("click", applyDiario321AIPastePanel));
    document.querySelectorAll("[data-ai-paste-text]").forEach(area => area.addEventListener("input", () => { diario321AIPasteDraft = area.value || ""; }));
    document.querySelectorAll("[data-save-train-current]").forEach(btn => btn.addEventListener("click", saveDiario321CurrentToNihongoAndTrain));
    document.querySelectorAll("[data-speak-seed]").forEach(btn => btn.addEventListener("click", () => { try { const seed = diario321SeedInfo(); const u = new SpeechSynthesisUtterance(seed.jp); u.lang = "ja-JP"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { toast("voz indisponível"); } }));
    document.querySelectorAll("[data-survival-model]").forEach(btn => btn.addEventListener("click", () => useDiario321SurvivalModel(btn.dataset.survivalModel || "ga")));
    document.querySelectorAll("[data-genial-topic]").forEach(select => select.addEventListener("change", () => setGenialTargetTopic(select.value)));
    document.querySelectorAll("[data-save-genial]").forEach(btn => btn.addEventListener("click", saveGenialPhrase));
    document.querySelectorAll("[data-save-diario321]").forEach(btn => btn.addEventListener("click", saveGenialToDiario321Page));
    document.querySelectorAll("[data-diario-toggle]").forEach(btn => btn.addEventListener("click", () => toggleDiario321Meaning(btn.dataset.diarioToggle)));
    document.querySelectorAll("[data-diario-memory]").forEach(btn => btn.addEventListener("click", () => markDiario321Memory(btn.dataset.diarioMemoryId, btn.dataset.diarioMemory)));
    document.querySelectorAll("[data-clear-genial]").forEach(btn => btn.addEventListener("click", clearGenialEditor));


    document.querySelectorAll("[data-forge-target]").forEach(select => select.addEventListener("change", () => setPhraseForgeTarget(select.value)));
    document.querySelectorAll("[data-forge-input]").forEach(input => input.addEventListener("input", () => updatePhraseForgeInput(Number(input.dataset.forgeInput), input.value)));
    document.querySelectorAll("[data-forge-evaluate]").forEach(btn => btn.addEventListener("click", evaluatePhraseForgeAll));
    document.querySelectorAll("[data-forge-save]").forEach(btn => btn.addEventListener("click", phraseForgeSaveGoodOnes));


    const headerBackBtn = document.getElementById("headerBackBtn");
    if (headerBackBtn) {
      headerBackBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        backToContentList();
      }, { capture: true });
    }


    document.querySelectorAll('[data-action="backToHome"]').forEach(btn => btn.addEventListener("click", backToHome));
    document.querySelectorAll('[data-action="backToList"]').forEach(btn => btn.addEventListener("click", backToList));
    document.querySelectorAll("[data-menu]").forEach(btn => btn.addEventListener("click", () => toggleMenu(btn.dataset.menu)));
    document.querySelectorAll("[data-family-cat]").forEach(btn => btn.addEventListener("click", () => selectFamily(btn.dataset.familyCat, btn.dataset.family)));
    document.querySelectorAll("[data-focus-cat]").forEach(btn => btn.addEventListener("click", () => {
      if (btn.classList.contains("is-disabled")) return;
      selectFocus(btn.dataset.focusCat, btn.dataset.focus);
    }));
    document.querySelectorAll("[data-word-id]").forEach(btn => btn.addEventListener("click", () => startWordById(btn.dataset.wordId)));
    document.querySelectorAll("[data-kanji-level]").forEach(btn => btn.addEventListener("click", () => selectKanjiLevel(btn.dataset.kanjiLevel)));
    document.querySelectorAll("[data-kanji-group]").forEach(btn => btn.addEventListener("click", () => selectKanjiGroup(btn.dataset.kanjiGroup)));
    document.querySelectorAll("[data-kanji-level-select]").forEach(select => select.addEventListener("change", () => selectKanjiLevelCompact(select.value)));
    document.querySelectorAll("[data-kanji-group-select]").forEach(select => select.addEventListener("change", () => selectKanjiGroupCompact(select.value)));
    document.querySelectorAll("[data-show-more-kanji]").forEach(btn => btn.addEventListener("click", showMoreKanji));
    document.querySelectorAll("[data-save-kanji-sentence]").forEach(btn => btn.addEventListener("click", () => {
      saveKanjiSentenceToBridge(btn.dataset.saveKanjiSentence, btn.dataset.sentenceIndex);
    }));
    document.querySelectorAll("[data-export-bridge]").forEach(btn => btn.addEventListener("click", downloadBridgePhrases));
    document.querySelectorAll("[data-start-error-review]").forEach(btn => btn.addEventListener("click", startErrorReview));
    document.querySelectorAll("[data-screen]").forEach(btn => btn.addEventListener("click", () => setScreen(btn.dataset.screen)));
    document.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action === "speak") return speakWord();
      if (action === "clear") return clearCanvas();
      if (action === "undo") return undoStroke();
      if (action === "next") return nextWord();
      if (action === "toggleTone") return togglePaperTone();
      if (action === "replayStrokeOrder") return replayStrokeOrder();
      if (action === "toggleTheme") return toggleTheme();
      if (action === "goPremium") return showCadernoPremiumMessage("kanji");
    }));
    document.querySelectorAll("[data-result]").forEach(btn => btn.addEventListener("click", () => markResult(btn.dataset.result)));
    document.querySelectorAll("[data-hint-char]").forEach(btn => btn.addEventListener("click", () => { activeHintChar = btn.dataset.hintChar; render(); }));
  }



  try {
    if (!window.__DIARIO321_OPEN_DELEGATE__) {
      window.__DIARIO321_OPEN_DELEGATE__ = true;
      document.addEventListener("click", (event) => {
        const openBtn = event.target?.closest?.("[data-open-genial]");
        if (openBtn) {
          openGenialNotebook(event);
          return;
        }
        const closeBtn = event.target?.closest?.("[data-close-genial]");
        if (closeBtn) {
          closeGenialNotebook();
        }
      }, true);
    }
  } catch {}

  window.addEventListener("message", (event) => {
    const data = event.data || {};
    if (!data) return;

    if (data.type === "NIHONGO321_TOPIC_LIST") {
      const topics = Array.isArray(data.topics) ? data.topics.filter(item => item && item.id && item.name) : [];
      nihongo321SaveTopics = topics;
      nihongo321DefaultTopicId = data.defaultTopicId || "topic_caderno321";

      if (!normalizedSaveTopics().some(item => item.id === genialState.targetTopicId)) {
        genialState.targetTopicId = nihongo321DefaultTopicId;
        saveGenialState();
      }

      render();
      return;
    }

    if (data.type !== "NIHONGO321_SAVE_RESULT") return;

    if (data.ok) {
      if (data.requestId && genialState.lastSaveRequestId && data.requestId !== genialState.lastSaveRequestId) return;
      genialState.lastSavedAt = new Date().toISOString();
      genialState.lastSavePending = false;
      genialState.lastSaveDirect = true;
      genialState.lastSaveCount = Number(data.total || 0);
      genialState.lastSaveError = "";
      genialState.lastSavedTopicId = data.topicId || genialState.lastSavedTopicId || selectedSaveTopicId();
      genialState.lastSavedTopicName = data.topicName || safeSaveTopicName(genialState.lastSavedTopicId);
      genialState.lastSavedPhraseId = data.phraseId || genialState.lastSavedPhraseId || "";
      saveGenialState();
      toast(data.imported ? "frase salva no NIHONGO321" : "frase atualizada no NIHONGO321");
      render();
      scrollGenialSaveStatusIntoView();
      return;
    }

    genialState.lastSavePending = false;
    genialState.lastSaveError = caderno321SaveErrorMessage(data.error);
    saveGenialState();
    render();
    scrollGenialSaveStatusIntoView();
  });

  try {
    window.DIARIO321_SAVE_PAGE = function(event) {
      try {
        if (event) {
          event.preventDefault?.();
          event.stopPropagation?.();
        }
        return saveGenialToDiario321Page();
      } catch (err) {
        console.error("DIÁRIO321 global save error:", err);
        diario321ShowLocalSaveMessage(`Erro interno ao salvar: ${err?.message || "erro desconhecido"}.`, "error");
        toast("erro ao salvar");
        return false;
      }
    };
  } catch {}

  // Fallback forte: garante que os botões principais funcionem mesmo se a tela for re-renderizada.
  document.addEventListener("click", (event) => {
    const trainBtn = event.target?.closest?.("[data-train-genial]");
    if (trainBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (caderno321OpenNihongoTrainingDirectly()) {
        toast("abrindo treino 105x");
        return;
      }

      if (isEmbeddedInNihongo321()) {
        try {
          window.parent.postMessage({
            type: "CADERNO321_START_TRAINING",
            payload: {
              phraseId: genialState.lastSavedPhraseId || "",
              topicId: genialState.lastSavedTopicId || selectedSaveTopicId()
            }
          }, "*");
          toast("abrindo treino 105x");
          return;
        } catch {}
      }
      window.location.href = "../index.html#/105x";
      return;
    }

    const diarioSaveBtn = event.target?.closest?.("[data-save-diario321]");
    if (diarioSaveBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        saveGenialToDiario321Page();
      } catch (err) {
        console.error("DIÁRIO321 save page fatal error:", err);
        toast("erro ao salvar nesta página");
      }
      return;
    }

    const btn = event.target?.closest?.("[data-save-genial]");
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    saveGenialPhrase();
  }, true);

  try {
    window.CADERNO321_SAVE_TO_NIHONGO321 = function() {
      try {
        saveGenialPhrase();
      } catch (err) {
        console.error("DIÁRIO321 save button fatal error:", err);
        setGenialSaveError("O botão foi acionado, mas ocorreu um erro interno antes de salvar. Abra o console para ver o erro técnico.");
      }
    };
    window.DIÁRIO321_BRIDGE_KEY = NIHONGO321_BRIDGE_KEY;
  } catch {}

  requestNihongo321SaveTopics(true);
  render();
})();
