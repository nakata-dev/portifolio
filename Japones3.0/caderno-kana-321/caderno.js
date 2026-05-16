/* =========================================================
   CADERNO321 — Protótipo 2.3
   Header NIHONGO321 + menus suspensos por categoria.
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "caderno321_v23";
  const $app = document.getElementById("app");

  const WORDS = [
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
  "pt": "lista",
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
  "hint": "N5 lógico · verbos essenciais. Mão escrevendo no papel: perfeito para o CADERNO321.",
  "chars": [
    "書"
  ],
  "jlpt": "N5",
  "group": "verbos essenciais",
  "memo": "Mão escrevendo no papel: perfeito para o CADERNO321.",
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
}];

  const KANA_STROKES = {
    "あ": { count: 3, note: "linha de cima, traço central, curva grande" },
    "い": { count: 2, note: "curva esquerda, curva direita" },
    "う": { count: 2, note: "traço curto superior, curva principal" },
    "え": { count: 2, note: "traço curto superior, linha quebrada" },
    "お": { count: 4, note: "linha superior, central, curva, traço pequeno" },
    "か": { count: 3, note: "traço lateral, curva, ponto final" },
    "き": { count: 4, note: "duas linhas, traço central, curva final" },
    "さ": { count: 3, note: "linha superior, diagonal, curva final" },
    "ね": { count: 2, note: "vertical com curva, curva final" },
    "み": { count: 2, note: "curva principal, traço final" },
    "ア": { count: 2, note: "linha superior com queda, traço descendo" },
    "イ": { count: 2, note: "diagonal, vertical" },
    "ウ": { count: 3, note: "curto superior, linha superior, curva final" },
    "エ": { count: 3, note: "linha superior, central, inferior" },
    "オ": { count: 3, note: "horizontal, vertical, diagonal" },
    "カ": { count: 2, note: "diagonal/vertical, traço lateral" },
    "ー": { count: 1, note: "traço horizontal longo" },
    "ド": { count: 4, note: "ト + dois pequenos traços de som" },
    "コ": { count: 2, note: "linha superior/lateral, linha inferior" },
    "ン": { count: 2, note: "ponto curto, traço diagonal ascendente" },
    "ビ": { count: 4, note: "ヒ + dois pequenos traços de som" },
    "ニ": { count: 2, note: "linha superior e inferior" },
    "ス": { count: 2, note: "linha superior diagonal, corte final" },
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
    "ヒ": { count: 2, note: "vertical com curva, traço central" },
    "フ": { count: 1, note: "traço angular descendo" },
    "ヘ": { count: 1, note: "traço em forma de montanha" },
    "ホ": { count: 4, note: "horizontal, vertical, diagonal esquerda, diagonal direita" },
    "ま": { count: 3, note: "duas linhas horizontais e curva final" },
    "む": { count: 3, note: "linha superior, curva central e laço final" },
    "め": { count: 2, note: "curva esquerda e curva longa" },
    "も": { count: 3, note: "duas linhas horizontais e curva vertical" },
    "マ": { count: 2, note: "linha angular superior e diagonal" },
    "ミ": { count: 3, note: "três traços curtos inclinados" },
    "ム": { count: 2, note: "diagonal principal e traço inferior" },
    "メ": { count: 2, note: "diagonal curta e diagonal longa" },
    "モ": { count: 3, note: "duas linhas horizontais e vertical curva" },
    "や": { count: 3, note: "traço superior, curva vertical, traço pequeno" },
    "ゆ": { count: 2, note: "curva ampla e traço central" },
    "よ": { count: 2, note: "traço curto e curva inferior" },
    "ら": { count: 2, note: "traço superior e curva principal" },
    "り": { count: 2, note: "traço esquerdo e traço direito" },
    "る": { count: 1, note: "traço único curvado com laço" },
    "れ": { count: 2, note: "vertical com curva e traço final" },
    "ろ": { count: 1, note: "traço único curvado" },
    "ヤ": { count: 2, note: "traço superior angular e diagonal" },
    "ユ": { count: 2, note: "linha superior/lateral e linha inferior" },
    "ヨ": { count: 3, note: "três linhas com lateral direita" },
    "ラ": { count: 2, note: "linha superior e curva inferior" },
    "リ": { count: 2, note: "traço esquerdo e traço direito" },
    "ル": { count: 2, note: "vertical esquerda e curva direita" },
    "ロ": { count: 3, note: "lateral esquerda/topo, direita, base" },
    "わ": { count: 2, note: "vertical com curva e traço final amplo" },
    "を": { count: 3, note: "linha superior, curva central e curva final" },
    "ん": { count: 1, note: "traço único com curva final" },
    "ワ": { count: 2, note: "linha superior/lateral e diagonal final" },
    "ヲ": { count: 3, note: "duas linhas horizontais e diagonal final" }
  };

  const KANA_DRAWINGS = {
    "コ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M34 35 H84 V76", label: "linha superior e lateral direita", start: [34, 35] },
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
        { d: "M43 61 C58 60, 70 58, 82 54", label: "traço central", start: [43, 61] },
        { d: "M74 28 L82 36", label: "dakuten 1", start: [74, 28] },
        { d: "M88 27 L96 35", label: "dakuten 2", start: [88, 27] }
      ]
    },
    "ニ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M38 42 H83", label: "linha superior", start: [38, 42] },
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
        { d: "M35 43 H83 C82 63, 78 80, 71 93", label: "linha superior com descida", start: [35, 43] },
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
        { d: "M43 61 C58 60, 70 58, 82 54", label: "traço central", start: [43, 61] },
        { d: "M84 23 C90 17, 101 21, 101 30 C101 39, 88 41, 84 33 C82 29, 82 26, 84 23", label: "círculo handakuten", start: [84, 23] }
      ]
    },
    "あ": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M34 39 C48 36, 68 36, 86 40", label: "linha superior", start: [34, 39] },
        { d: "M61 25 C60 42, 59 58, 56 78", label: "traço central", start: [61, 25] },
        { d: "M50 56 C38 62, 30 75, 33 88 C37 104, 58 105, 73 92 C88 79, 89 59, 75 53 C62 47, 45 55, 40 68 C35 81, 44 91, 56 89 C68 87, 78 77, 81 65", label: "curva grande", start: [50, 56] }
      ]
    },
    "い": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M45 28 C40 47, 41 70, 53 87", label: "curva esquerda", start: [45, 28] },
        { d: "M76 32 C84 51, 85 72, 79 90", label: "curva direita", start: [76, 32] }
      ]
    },
    "う": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M50 31 C60 28, 70 29, 78 35", label: "traço curto superior", start: [50, 31] },
        { d: "M39 55 C53 49, 76 50, 82 63 C89 79, 68 94, 48 92", label: "curva principal", start: [39, 55] }
      ]
    },
    "え": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M50 31 C61 28, 71 30, 78 37", label: "traço curto superior", start: [50, 31] },
        { d: "M38 55 C51 51, 66 51, 77 56 C67 65, 56 77, 47 91 C58 83, 69 80, 84 91", label: "linha quebrada e final", start: [38, 55] }
      ]
    },
    "お": {
      viewBox: "0 0 120 120",
      strokes: [
        { d: "M35 39 C49 36, 69 36, 86 40", label: "linha superior", start: [35, 39] },
        { d: "M62 25 C61 43, 60 64, 58 89", label: "traço central", start: [62, 25] },
        { d: "M55 62 C43 62, 34 71, 35 83 C37 98, 59 98, 70 86 C81 74, 74 58, 58 62", label: "curva inferior", start: [55, 62] },
        { d: "M80 50 C87 53, 92 58, 96 64", label: "traço pequeno direito", start: [80, 50] }
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
  let openMenu = typeof state.openMenu === "string" ? state.openMenu : "";
  let selectedFocus = state.selectedFocus || {};
  let selectedFamily = state.selectedFamily || { hiragana: "あ", katakana: "ア" };
  let selectedKanjiLevel = state.selectedKanjiLevel || "N5";
  let selectedKanjiGroup = state.selectedKanjiGroup || "tempo e natureza";
  let drawingStrokes = [];
  let currentStroke = [];
  let drawingSnapshot = null;
  let activeHintChar = null;
  let paperTone = state.paperTone || "paper";
  let appTheme = state.appTheme || "dark";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        category: "hiragana",
        currentIndexByCategory: {},
        screen: "dashboard",
        progress: {},
        paperTone: "paper",
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
    selectedFocus[cat] = focus;
    category = cat;
    openMenu = cat;
    saveState();
    render();
  }

  function startWordById(id) {
    const word = WORDS.find(w => w.id === id);
    if (!word) return;
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
    const list = categoryWords();
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
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }));
  }

  function applyAppTheme() {
    document.documentElement.dataset.cadernoTheme = appTheme;
  }

  function toggleTheme() {
    appTheme = appTheme === "dark" ? "light" : "dark";
    applyAppTheme();
    saveState();
    render();
    toast(appTheme === "dark" ? "modo escuro" : "modo claro");
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
    const getPoint = (event) => {
      const e = event.touches ? event.touches[0] : event;
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    function start(event) {
      event.preventDefault();
      drawing = true;
      currentStroke = [getPoint(event)];
      drawCanvas();
    }

    function move(event) {
      if (!drawing) return;
      event.preventDefault();
      currentStroke.push(getPoint(event));
      drawCanvas();
    }

    function end(event) {
      if (!drawing) return;
      event.preventDefault();
      drawing = false;
      if (currentStroke.length > 1) drawingStrokes.push(currentStroke);
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

  function drawPath(ctx, points) {
    if (!points || points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
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
    drawingStrokes.forEach(points => drawPath(ctx, points));
    drawPath(ctx, currentStroke);
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

  function renderStrokeOrderSvg(ch) {
    const drawing = KANA_DRAWINGS[ch];
    const data = KANA_STROKES[ch];

    if (!drawing) {
      return `
        <div class="strokeOrderFallback">
          <div class="visualKana">${escapeHTML(ch)}</div>
          <span>${data ? `${data.count} traço(s) · ${escapeHTML(data.note)}` : category === "kanji" ? "ordem de kanji virá em fase própria" : "ordem detalhada em breve"}</span>
        </div>
      `;
    }

    return `
      <div class="strokeOrderBox">
        <svg id="strokeOrderSvg" class="strokeOrderSvg is-playing" viewBox="${escapeHTML(drawing.viewBox)}" aria-label="ordem de escrita de ${escapeHTML(ch)}">
          <rect x="10" y="10" width="100" height="100" rx="14" class="strokeOrderFrame"></rect>
          <text x="60" y="62" class="strokeOrderGuide">${escapeHTML(ch)}</text>
          ${drawing.strokes.map((stroke, index) => `
            <g>
              <circle class="strokeOrderDot" cx="${stroke.start[0]}" cy="${stroke.start[1]}" r="7"></circle>
              <text class="strokeOrderNumber" x="${stroke.start[0]}" y="${stroke.start[1] + 0.8}">${index + 1}</text>
              <path class="strokeOrderPath" style="--i:${index};" d="${escapeHTML(stroke.d)}"></path>
            </g>
          `).join("")}
        </svg>

        <ol class="strokeOrderList">
          ${drawing.strokes.map((stroke, index) => `
            <li><b>${index + 1}</b><span>${escapeHTML(stroke.label)}</span></li>
          `).join("")}
        </ol>

        <button class="miniHintBtn strokeReplayBtn" type="button" data-action="replayStrokeOrder">↻ repetir ordem</button>
      </div>
    `;
  }

  function renderVisualHint() {
    if (!activeHintChar) {
      return `
        <div class="visualHintCard is-empty">
          <b>${category === "kanji" ? "dica de kanji" : "ordem de escrita"}</b>
          <span>${category === "kanji" ? "Toque em um kanji para ver a prévia. A ordem completa de kanji fica para a próxima fase." : "Toque em uma letra da palavra para ver a ordem dos traços do kana."}</span>
        </div>
      `;
    }

    const data = KANA_STROKES[activeHintChar];

    return `
      <div class="visualHintCard visualHintCard--stroke">
        <div class="visualHintTitle">
          <b>${escapeHTML(activeHintChar)} · ${data ? data.count : category === "kanji" ? "kanji" : "?"} traço(s)</b>
          <span>${data ? escapeHTML(data.note) : category === "kanji" ? "Prévia visual. A ordem de escrita do kanji será tratada em fase própria." : "Use a forma visual como referência."}</span>
        </div>
        ${renderStrokeOrderSvg(activeHintChar)}
      </div>
    `;
  }

  function renderAppHeader() {
    return `
      <header class="appHeader">
        <div class="brandMini">
          <img src="./img/logo_nihongo321.png" alt="NIHONGO321" onerror="this.style.display='none'">
          <div>
            <strong>CADERNO321</strong>
            
          </div>
        </div>
        <div class="headerActions">${""}<button class="themeToggleBtn" type="button" data-action="toggleTheme">${appTheme === "dark" ? "☀️" : "🌙"}</button><button class="boardToneBtn" type="button" data-action="cyclePaperTone">${paperToneIcon()}</button><div class="headerPill">2.3</div></div>
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

    return `
      <article class="studyMenu ${isOpen ? "is-open" : ""}">
        <button class="studyMenuHead" type="button" data-menu="${cat}">
          <span>
            <b>${title}</b>
            <small>${desc}</small>
          </span>
          <em>${stats.familiar}/${stats.total}</em>
        </button>

        <div class="studyMenuBody">
          <div class="menuIntro">
            <b>${subtitle}</b>
            <span>${cat === "kanji" ? "Escolha uma palavra/kanji para sentir o próximo nível." : "Escolha a família, depois a letra e por fim uma palavra para escrever."}</span>
          </div>

          ${cat === "kanji" ? renderKanjiPicker(words) : renderFocusPicker(cat)}
        </div>
      </article>
    `;
  }

  function renderFocusPicker(cat) {
    const families = KANA_FAMILIES[cat] || [];
    const currentFamily = selectedFamily[cat] || families[0]?.key || "";
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

        <div class="compactFamilyGrid">
          ${families.map(fam => {
            const totalWords = categoryWords(cat).filter(word => fam.letters.includes(word.focus)).length;
            const familyWords = categoryWords(cat).filter(word => fam.letters.includes(word.focus));
            const doneWords = familyWords.filter(word => (progressFor(word).correct || 0) >= 1).length;
            return `
              <button class="${currentFamily === fam.key ? "is-active" : ""}" type="button" data-family-cat="${cat}" data-family="${escapeHTML(fam.key)}">
                <strong>${escapeHTML(fam.key)}</strong>
                <span>${countLabel(doneWords, totalWords)}</span>
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
    selectedKanjiLevel = level;
    if (level !== "N5") {
      selectedKanjiGroup = "";
    } else if (!selectedKanjiGroup) {
      selectedKanjiGroup = "tempo e natureza";
    }
    category = "kanji";
    openMenu = "kanji";
    saveState();
    render();
  }

  function selectKanjiGroup(group) {
    selectedKanjiGroup = group;
    selectedKanjiLevel = "N5";
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
      </div>
    `;
  }

  function renderKanjiPicker(words) {
    const levels = ["N5", "N4", "N3", "N2", "N1"];
    const groups = kanjiGroups("N5");
    const levelWords = categoryWords("kanji").filter(word => word.jlpt === selectedKanjiLevel);
    const visibleWords = selectedKanjiLevel === "N5"
      ? levelWords.filter(word => word.group === selectedKanjiGroup)
      : [];

    return `
      <div class="kanjiLevelBlock">
        <div class="choiceLabel">
          <b>1. escolha o nível JLPT</b>
          <span>N5 liberado · N4-N1 em preparação</span>
        </div>

        <div class="kanjiLevelGrid">
          ${levels.map(level => {
            const total = categoryWords("kanji").filter(word => word.jlpt === level).length;
            const locked = level !== "N5";
            return `
              <button class="${selectedKanjiLevel === level ? "is-active" : ""} ${locked ? "is-locked" : ""}" type="button" data-kanji-level="${level}">
                <strong>${level}</strong>
                <span>${locked ? "em preparação" : `${total} kanjis`}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>

      ${selectedKanjiLevel !== "N5" ? `
        <div class="kanjiComingSoon">
          <b>${escapeHTML(selectedKanjiLevel)} em preparação</b>
          <span>Vamos liberar por etapas para manter o CADERNO321 leve, organizado e sem assustar o aluno.</span>
        </div>
      ` : `
        <div class="kanjiGroupBlock">
          <div class="choiceLabel">
            <b>2. escolha o grupo</b>
            <span>lista lógica N5 do CADERNO321</span>
          </div>

          <div class="kanjiGroupGrid">
            ${groups.map(group => {
              const total = categoryWords("kanji").filter(word => word.jlpt === "N5" && word.group === group).length;
              return `
                <button class="${selectedKanjiGroup === group ? "is-active" : ""}" type="button" data-kanji-group="${escapeHTML(group)}">
                  <strong>${escapeHTML(group)}</strong>
                  <span>${total} kanjis</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <div class="wordChoiceBlock">
          <div class="choiceLabel">
            <b>3. escolha o kanji</b>
            <span>ver → entender → escrever → conferir</span>
          </div>

          <div class="compactWordList compactWordList--kanji">
            ${visibleWords.map(word => {
              const p = progressFor(word);
              return `
                <button type="button" data-word-id="${escapeHTML(word.id)}">
                  <strong>${escapeHTML(word.jp)}</strong>
                  <span>${escapeHTML(word.romaji)} · ${escapeHTML(word.pt)}</span>
                  <small>${p.correct || 0}/7</small>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `}
    `;
  }

  function renderDashboard() {
    return `
      <section class="card dashboardCard dashboardCard--compact">
        <div class="badge">caderno inteligente</div>
        <h1 class="sectionTitle">Escolha seu treino.</h1>
        <p class="dashboardLead">
          Treine palavras no celular antes de entrar nas frases do NIHONGO321.
        </p>
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
          <button class="actionBtn" data-screen="dashboard">lista</button>
          <button class="actionBtn" data-action="next">próxima ›</button>
        </div>
      </section>
    `;
  }

  function renderWrite(word) {
    return `
      <section class="card realModeCard">
        <div class="stageLabel stageLabel--write"><span>2. escrever no celular</span><button class="toneToggleBtn" type="button" data-action="toggleTone">${paperToneLabel()}</button></div>
        <div class="hiddenPrompt"><b>${escapeHTML(word.romaji)}</b><span>${escapeHTML(word.pt)}</span><small>${categoryLabel()} · escreva a palavra inteira na linha abaixo.</small></div>
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
        <div class="kanaBreak">
          ${word.chars.map(ch => {
            const data = KANA_STROKES[ch];
            return `<div><b>${escapeHTML(ch)}</b><span>${data ? `${data.count} traço(s)` : category === "kanji" ? "kanji" : "—"}</span><button class="miniHintBtn" data-hint-char="${escapeHTML(ch)}">${category === "kanji" ? "ver dica" : "ver ordem"}</button></div>`;
          }).join("")}
        </div>
        ${renderVisualHint()}
        <div class="honestyBox"><b>Sua escrita ficou correta?</b><span>Compare a resposta com sua escrita. O app não julga por você.</span></div>
        <div class="actionGrid">
          <button class="actionBtn good" data-result="correct">✅ correto</button>
          <button class="actionBtn bad" data-result="incorrect">❌ incorreto</button>
          <button class="actionBtn" data-screen="write">tentar de novo</button>
          <button class="actionBtn" data-action="next">pular palavra</button>
        </div>
      </section>
    `;
  }

  function renderSidebar(word, progress, stats) {
    return `
      <div class="infoStack">
        <div class="card infoCard"><b>meta da palavra</b><div class="wordProgress"><span style="--p:${Math.min(1, (progress.correct || 0) / 7)}"></span></div><p>${progress.correct || 0}/7 corretas · ${progress.incorrect || 0} incorreta(s)</p><p>Status: <strong>${escapeHTML(wordStatus(progress))}</strong></p></div>
        <div class="card infoCard"><b>categoria atual</b><p>${categoryLabel()} · ${stats.familiar}/${stats.total} palavras familiarizadas</p><button class="actionBtn" data-screen="dashboard">voltar para lista</button></div>
      </div>
    `;
  }

  function render() {
    applyAppTheme();
    const word = currentWord();
    const progress = progressFor(word);
    const stats = totalStats();
    let main = screen === "dashboard" ? renderDashboard() : screen === "write" ? renderWrite(word) : screen === "check" ? renderCheck(word, progress) : renderSee(word);
    const body = screen === "dashboard" ? main : `<section class="notebookGrid">${main}${renderSidebar(word, progress, stats)}</section>`;

    $app.innerHTML = `
      <div class="stack">
        ${renderAppHeader()}
        ${body}
        <div id="toast" class="toast" role="status" aria-live="polite"></div>
      </div>
    `;
    bindEvents();
    if (screen === "write") requestAnimationFrame(setupCanvas);
  }

  function bindEvents() {
    document.querySelectorAll("[data-menu]").forEach(btn => btn.addEventListener("click", () => toggleMenu(btn.dataset.menu)));
    document.querySelectorAll("[data-family-cat]").forEach(btn => btn.addEventListener("click", () => selectFamily(btn.dataset.familyCat, btn.dataset.family)));
    document.querySelectorAll("[data-focus-cat]").forEach(btn => btn.addEventListener("click", () => {
      if (btn.classList.contains("is-disabled")) return;
      selectFocus(btn.dataset.focusCat, btn.dataset.focus);
    }));
    document.querySelectorAll("[data-word-id]").forEach(btn => btn.addEventListener("click", () => startWordById(btn.dataset.wordId)));
    document.querySelectorAll("[data-kanji-level]").forEach(btn => btn.addEventListener("click", () => selectKanjiLevel(btn.dataset.kanjiLevel)));
    document.querySelectorAll("[data-kanji-group]").forEach(btn => btn.addEventListener("click", () => selectKanjiGroup(btn.dataset.kanjiGroup)));
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
    }));
    document.querySelectorAll("[data-result]").forEach(btn => btn.addEventListener("click", () => markResult(btn.dataset.result)));
    document.querySelectorAll("[data-hint-char]").forEach(btn => btn.addEventListener("click", () => { activeHintChar = btn.dataset.hintChar; render(); }));
  }

  render();
})();
