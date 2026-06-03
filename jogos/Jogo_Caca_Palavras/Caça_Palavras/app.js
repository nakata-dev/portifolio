/* ==========================
   Caça-Palavras PRO - v2.1.3 Anti-confusão Total
   ✅ Android sem travar (geração assíncrona)
   ✅ 100 níveis 5..8, 9 palavras, 8 direções
   ✅ Garantia de 9 palavras com fallback seguro
   ✅ Cores por palavra (melhor leitura)
   ✅ Som leve + moedas (sem arquivos, sem travar)

   UPGRADE v2.1.0:
   ✅ banco novo com 900 termos distribuídos nos 100 níveis
   ✅ sem repetição de palavras no pacote padrão
   ✅ seleção fixa por nível para reduzir tédio e preservar progressão

   UPGRADE v2.1.2:
   ✅ editor técnico removido da interface pública
   ✅ botão discreto para resetar progresso e restaurar níveis padrão

   UPGRADE v2.1.3:
   ✅ bloqueio de termos iguais e termos com as mesmas letras em ordem diferente
   ✅ corrige casos como UBS/USB, AI/IA, EVA/AVE
   ✅ validação estrutural impede pacote antigo salvo no navegador
========================== */

const LS_KEY = "wordsearch_pro_v1";
const SCHEMA_VERSION = 7; // v2.1.3: força atualização e remove termos visualmente confundíveis como UBS/USB

const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, -1], [1, -1], [-1, 1]
];

// Mantém leve no Android
const MAX_BOARD_RETRIES = 110;
const MAX_WORD_ATTEMPTS = 260;
const YIELD_EVERY = 6;
const FALLBACK_SETS_TRIES = 40;

// v2.1.1: mantido por compatibilidade, mas não é usado para trocar palavras entre níveis
const RANDOM_SETS_TRIES = 0;
const MAX_LOCKED_BACKTRACK_STEPS = 30000; // evita travamento em celulares quando um pacote customizado for impossível

const $ = (id) => document.getElementById(id);

/* =========================
   Helpers
========================= */
function sanitizeWord(w) {
  return String(w || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z]/g, "")
    .trim();
}

function wordVisualSignature(w) {
  return sanitizeWord(w).split("").sort().join("");
}

function hasSameLettersAsUsed(word, usedSignatures) {
  return usedSignatures.has(wordVisualSignature(word));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function safeClone(obj) {
  if (typeof structuredClone === "function") {
    try { return structuredClone(obj); } catch {}
  }
  return JSON.parse(JSON.stringify(obj));
}

function makeLCG(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pickDeterministicUnique(arr, n, seed) {
  const rng = makeLCG(seed);
  const copy = arr.slice();

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  const picked = [];
  for (let i = 0; i < copy.length && picked.length < n; i++) {
    if (!picked.includes(copy[i])) picked.push(copy[i]);
  }
  return picked;
}

function pickRandomUnique(arr, n) {
  const copy = arr.slice();
  shuffleInPlace(copy);
  const out = [];
  for (let i = 0; i < copy.length && out.length < n; i++) {
    if (!out.includes(copy[i])) out.push(copy[i]);
  }
  return out;
}

/* =========================
   Limites de tamanho por grid
   (9 palavras em grids pequenos exige palavras menores)
========================= */
const MAX_LEN_BY_SIZE = {
  5: 3, // 5x5: 9 palavras só fica estável com 2-3 letras
  6: 4, // 6x6: 2-4 letras
  7: 6, // 7x7: até 6 letras
  8: 7, // 8x8: até 7 letras
};

function maxLenFor(size) {
  return MAX_LEN_BY_SIZE[size] ?? size;
}

/* =========================
   Cores por palavra (alto contraste)
========================= */
const WORD_COLORS = [
  "#FF595E",
  "#FFCA3A",
  "#8AC926",
  "#4D96FF",
  "#FF922B",
  "#63E6BE",
  "#F783AC",
  "#B197FC",
  "#22D3EE",
  "#A9E34B",
  "#FFD8A8",
  "#E599F7",
];

function hashWordToColor(word) {
  let h = 2166136261;
  for (let i = 0; i < word.length; i++) {
    h ^= word.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % WORD_COLORS.length;
  return WORD_COLORS[idx];
}

/* =========================
   Bancos por tamanho - v2.1.1
   - 100 níveis preservados
   - 9 palavras por nível preservadas
   - 25 níveis por grade: 5x5, 6x6, 7x7 e 8x8
   - sem repetição de palavras no pacote padrão
   - seleção fixa por nível para evitar tédio e repetição
   - fallback não troca mais as palavras do nível
========================= */
function sanitizeBank(list, size) {
  const maxLen = maxLenFor(size);
  const seen = new Set();
  const out = [];

  list
    .map(sanitizeWord)
    .filter(Boolean)
    .filter(w => w.length >= 2 && w.length <= maxLen)
    .forEach(w => {
      if (seen.has(w)) return;
      seen.add(w);
      out.push(w);
    });

  return out;
}

// 5x5: microtermos de 2-3 letras para manter 9 itens em grade pequena.
const WORD_BANK_5 = sanitizeBank([
  "AI", "OI", "UI", "EU", "TU", "TV", "PC", "CD", "RG",
  "CPF", "CEP", "PIX", "SUS", "UBS", "ONU", "OAB", "USB", "SMS",
  "LED", "GPS", "APP", "WEB", "DVD", "HD", "SD", "IA", "QR",
  "PJ", "MEI", "SOL", "LUA", "MAR", "RIO", "DIA", "PAZ", "CHA",
  "MEL", "SAL", "CEU", "VOZ", "SOM", "MAE", "PAI", "AVO", "TIA",
  "TIO", "BOM", "MAU", "SIM", "NAO", "RUA", "PIA", "ASA", "ABA",
  "ECO", "EGO", "ELA", "ELE", "ELO", "ERA", "EVA", "AVE", "OVO",
  "OCA", "UVA", "BOI", "CAO", "GOL", "GEL", "FIM", "FIO", "FOI",
  "FIZ", "LAR", "LEI", "LER", "LUZ", "MAL", "MAO", "MAS", "MES",
  "MEU", "MIL", "MIM", "REI", "SER", "SEU", "SOB", "SUL", "TUA",
  "VIA", "VIM", "VIR", "VAI", "VER", "VOO", "DOR", "DOM", "DEU",
  "DEI", "DEZ", "DOS", "DAS", "POR", "PRA", "PRO", "POS", "PRE",
  "ATE", "ATO", "ATA", "ALA", "AMA", "AME", "AMO", "ANO", "ANA",
  "APE", "BIS", "BOA", "BEM", "BAR", "CEM", "COM", "COR", "CRU",
  "DAR", "DIZ", "DOU", "EIS", "FEZ", "FUI", "GAS", "GIZ", "IRA",
  "IRM", "JAR", "JET", "JUS", "LEO", "LHE", "LIA", "LIL", "LIX",
  "MAC", "MAN", "MEX", "MIR", "MIX", "MOR", "NEM", "NET", "NOZ",
  "NUA", "OPA", "ORA", "PAO", "PAR", "PAU", "PES", "PER", "PIO",
  "PIS", "POM", "PON", "RIR", "ROL", "ROS", "RUI", "RUM", "SAC",
  "SAO", "SAP", "SED", "SEN", "SEO", "SIR", "SOR", "SUA", "TAL",
  "TAM", "TAO", "TAR", "TEM", "TER", "TES", "TIL", "TIM", "TIR",
  "TOM", "TOR", "TRI", "UNA", "UNO", "UPA", "URI", "URU", "USO",
  "VEM", "VEL", "VES", "VIL", "VIP", "VIS", "VOS", "ZEN", "ZOO",
  "ZUM", "BA", "BE", "BI", "BO", "BU", "CA", "CE", "CI",
  "CO", "CU", "DA", "DE", "DI", "DO", "DU", "FA", "FE",
  "FI", "FO", "FU", "GA", "GE", "GI", "GO", "GU", "HA",
  "HE", "HI", "HO", "HU", "JA", "JE", "JI", "JO", "JU",
  "KA", "KE", "KI", "KO", "KU", "MA", "ME", "CPU", "RAM",
  "PDF", "ZIP", "JPG", "PNG", "MP3", "MP4"
], 5);

// 6x6: palavras de 4 letras, todas diferentes das demais etapas.
const WORD_BANK_6 = sanitizeBank([
  "CASA", "MESA", "BOLA", "PATO", "GATO", "SAPO", "URSO", "LOBO", "RATO",
  "LEAO", "FOCA", "AGUA", "SUCO", "CAFE", "PANO", "CHAO", "LADO", "FOTO",
  "LUVA", "BICO", "DADO", "JOGO", "CIMA", "ALTO", "ALTA", "BALA", "BOLO",
  "BOCA", "VIDA", "AMOR", "FLOR", "FOGO", "VELA", "ARTE", "AULA", "ANEL",
  "AZUL", "ROSA", "LIMA", "PESO", "LEVE", "DURO", "MOLE", "DOCE", "AMAR",
  "OLER", "FALA", "FALO", "COME", "COMO", "BEBE", "BEBO", "VIVE", "VIVO",
  "OLHA", "OLHO", "OUVE", "OUCO", "LIGA", "LIGO", "PULA", "PULO", "ANDA",
  "ANDO", "ABRE", "ABRO", "POVO", "CAMA", "SOFA", "TETO", "PISO", "MURO",
  "ROTA", "MAPA", "RODA", "RODO", "RISO", "RIMA", "REDE", "REZA", "RUMO",
  "RALO", "REMO", "RAMO", "POTE", "COPA", "COPO", "CUIA", "FACA", "COLA",
  "FITA", "LATA", "TELA", "TUBO", "TACO", "TALO", "TAPA", "TIPO", "TOPO",
  "NAVE", "NOME", "NORA", "NOJO", "NADO", "NADA", "NINA", "NILO", "NEVE",
  "NOVO", "NOVA", "NOVE", "PENA", "PELE", "PELO", "PERA", "PIAO", "PICO",
  "PIPA", "CURA", "CARA", "CORO", "CORA", "CERA", "CEDO", "CENA", "CANO",
  "CAVA", "COVA", "CUBO", "COCO", "COLO", "CALO", "CABO", "CACO", "CAIS",
  "DAMA", "DEDO", "DUNA", "DICA", "DITO", "DOTE", "DATA", "DURA", "FAMA",
  "FATO", "FERA", "FEIO", "FEIA", "FINA", "FINO", "FOFO", "FUGA", "FUMA",
  "FUSO", "GEMA", "GERA", "GIRA", "GIRO", "GOTA", "GULA", "GURI", "GATA",
  "GALO", "GELA", "GOGO", "HORA", "HINO", "HIFI", "HOJE", "HERA", "HIJO",
  "ILHA", "INCA", "IRMA", "IRMO", "ISIS", "IARA", "JACA", "JATO", "JADE",
  "JUDO", "JURA", "JURO", "JUBA", "JANE", "JOIA", "JULI", "LAGO", "LAMA",
  "LISO", "LISA", "LONA", "LOJA", "LOTE", "LUTA", "LUME", "LUXO", "MALA",
  "MATO", "MATA", "MICO", "MILO", "MIRA", "MOLA", "MOTO", "MUDO", "MIMO",
  "MINA", "MITO", "MODA", "MOCO", "NATA", "NIDO", "NOEL", "NOTA", "NODO",
  "NUCA", "NULO", "OURO", "OITO", "OLEO", "ONDA", "ONZE", "ORLA", "OSLO",
  "BASE", "BELA", "BELO", "BIFE", "BOTA", "BRIO", "CAJU", "CINE", "CRIA",
  "CRUZ", "DOIS", "DUAS", "ENJO", "ERRO", "FARO", "FIEL", "FILA", "FOME",
  "FREI", "FRIO", "GADO", "GOLA", "GUIA", "JOAO", "KILO", "LAJE", "LIRA",
  "MACA", "MAGO", "MANO", "MATE", "MEDO", "META", "OVAL", "PAVO", "PINO"
], 6);

// 7x7: palavras de 5-6 letras para dificuldade intermediária.
const WORD_BANK_7 = sanitizeBank([
  "AMIGO", "AMIGA", "CUIDAR", "SAUDE", "FORCA", "CALMA", "FELIZ", "ALEGRE", "BEIJO",
  "ABRACO", "SORRI", "LIVRO", "LAPIS", "CANETA", "ESCOLA", "JARDIM", "FOLHA", "FRUTA",
  "FLORA", "TRONCO", "MUSICA", "CANTO", "RITMO", "CADEIA", "JANELA", "BANHO", "OCULOS",
  "SABAO", "ROUPA", "MEIAS", "SAPATO", "CHAVE", "PRAIA", "CAMPO", "MUNDO", "TERRA",
  "CHUVA", "NUVEM", "VENTO", "PEDRA", "AREIA", "GRAMA", "LAGOA", "MORRO", "VERDE",
  "AZUIS", "CLARO", "ESCURO", "LEITE", "ARROZ", "FEIJAO", "FRANGO", "CARNE", "PEIXE",
  "SALADA", "TOMATE", "BATATA", "CEBOLA", "ALFACE", "BANANA", "MANGA", "LIMAO", "MAMAO",
  "MELAO", "GOIABA", "PANELA", "PRATO", "GARFO", "TALHER", "COLHER", "XICARA", "TIGELA",
  "FOGAO", "FORNO", "GELAR", "TAPETE", "CAMISA", "CALCA", "CASACO", "BOLSA", "CINTOS",
  "TENIS", "BOTINA", "ROUPAS", "TREINO", "ESTUDO", "LICAO", "AGENDA", "ROTINA", "TEMPO",
  "MINUTO", "NOITE", "MANHA", "TARDE", "SEMANA", "CONTA", "NUMERO", "LETRA", "FRASE",
  "TEXTO", "LINHA", "PAGINA", "TURNO", "CHEFE", "EQUIPE", "SETOR", "PECAS", "CARTAO",
  "JAPAO", "BRASIL", "NAGOYA", "FUKUI", "TOKYO", "OSAKA", "KYOTO", "SENDAI", "TOYOTA",
  "KOMAKI", "AICHI", "CHIBA", "MELHOR", "BONITO", "BONITA", "FORTE", "FRACO", "DOENTE",
  "SADIO", "LIMPO", "VELHO", "RAPIDO", "LENTO", "FACIL", "ANDAR", "CORRER", "PULAR",
  "SUBIR", "DESCER", "ABRIR", "FECHAR", "PEGAR", "LEVAR", "TRAZER", "COMER", "BEBER",
  "FALAR", "OUVIR", "OLHAR", "SENTAR", "DEITAR", "DORMIR", "LAVAR", "SECAR", "VARRER",
  "LIMPAR", "CORTAR", "RALAR", "MEXER", "ASSAR", "FRITAR", "PENSAR", "AJUDAR", "CHAMAR",
  "MORAR", "VIVER", "SORRIR", "CHORAR", "CANTAR", "DANCAR", "MARIA", "JOANA", "PAULO",
  "PEDRO", "LUCAS", "BRUNO", "CARLOS", "MARCOS", "TIAGO", "DIEGO", "FELIPE", "RAFAEL",
  "ANDRE", "JULIA", "CLARA", "LAURA", "SOFIA", "ALICE", "HELENA", "AMANDA", "RENATA",
  "MONICA", "MATEUS", "MURILO", "SAMUEL", "RENATO", "VICTOR", "VITOR", "EMILIA", "BIANCA",
  "CAMILA", "MARINA", "TAINA", "KEIKO", "AKIRA", "CORAL", "VIOLA", "PIANO", "VIOLAO",
  "FLAUTA", "TAMBOR", "RADIO", "CAMERA", "VIDEO", "FILME", "TEATRO", "DANCA", "NAVIO",
  "AVIAO", "CARRO", "METRO", "ONIBUS", "BARCO", "PONTE", "PORTA", "TELHA", "QUARTO",
  "ABERTO", "ACENTO", "ACERTO", "ALTURA", "AMOLAR", "ARRUMA", "ATENTO",
  "BARATO", "BILHAR", "BRILHO", "CABANA", "CAMADA", "CANELA", "CINEMA",
  "CIDADE", "COLETA", "CORUJA", "DENTRO", "ENXUTO", "FERIAS"
], 7);

// 8x8: palavras de 7 letras para dificuldade maior.
const WORD_BANK_8 = sanitizeBank([
  "FAMILIA", "AMIZADE", "SORRISO", "CUIDADO", "BONDADE", "MEMORIA", "LEITURA", "CORAGEM", "SAUDADE",
  "CADEIRA", "CAMINHO", "CARINHO", "VERDURA", "FABRICA", "MAQUINA", "ESTEIRA", "CADERNO", "PALAVRA",
  "FRASEAR", "ESTUDAR", "ENSINAR", "ANIMAIS", "PASSARO", "MACACOS", "CAVALOS", "GATINHO", "COELHOS",
  "GALINHA", "FORMIGA", "MERCADO", "PADARIA", "COZINHA", "QUINTAL", "VARANDA", "GARAGEM", "QUARTOS",
  "TELHADO", "PAREDES", "JARDINS", "TOMATES", "BATATAS", "CEBOLAS", "BANANAS", "LARANJA", "MORANGO",
  "ABACATE", "GOIABAS", "CASACOS", "SAPATOS", "CHINELO", "BERMUDA", "JAQUETA", "MOCHILA", "RELOGIO",
  "ALEGRIA", "VONTADE", "ESPERAR", "ACORDAR", "ANDANDO", "CORRIDA", "PASSEIO", "BRINCAR", "LEMBRAR",
  "ABRACAR", "PALHACO", "CRIANCA", "VIZINHO", "COLEGAS", "BAIRROS", "AVENIDA", "ESQUINA", "CALCADA",
  "ESTACAO", "RODOVIA", "PISCINA", "CAMPEAO", "JOGADOR", "GOLEIRO", "BOLICHE", "FUTEBOL", "VIOLINO",
  "SANFONA", "FLAUTAS", "MUSICAL", "DESENHO", "PINTURA", "CARTOES", "SALARIO", "COMPRAS", "REMEDIO",
  "CLINICA", "JAPONES", "FUKUOKA", "HIROSHI", "SAPPORO", "OKINAWA", "RICARDO", "GABRIEL", "DANIELA",
  "VANESSA", "LUCIANA", "ADRIANA", "EDUARDO", "LETICIA", "MATHEUS", "RODRIGO", "ROBERTO", "ALBERTO",
  "MARCELO", "LEANDRO", "GUSTAVO", "CAMILLY", "ISABELA", "BEATRIZ", "GEOVANA", "JULIANA", "MARIANA",
  "TAKASHI", "SATOSHI", "CAMINHA", "CANTIGA", "CARICIA", "CEREAIS", "CERVEJA", "COLECAO", "CREDITO",
  "CORTINA", "DELICIA", "DETALHE", "DOENCAS", "ENERGIA", "ENFEITE", "ESCOLHA", "ESFORCO", "ESPERTO",
  "ESTRELA", "EXEMPLO", "FARINHA", "FIGURAS", "FORMATO", "FRALDAS", "FRESCOR", "GALERIA", "GAROTAS",
  "GAVETAS", "HORARIO", "INVERNO", "JANELAS", "JOELHOS", "LAVANDA", "LIMPEZA", "LIXEIRA", "MARMELO",
  "MELHORA", "MERENDA", "MISTURA", "MONTADO", "MORADIA", "NERVOSO", "NOTICIA", "OFICINA", "ORGULHO",
  "PASSADO", "PEDIDOS", "PENEIRA", "PESSOAL", "PINTADO", "PLANTAS", "PORTAIS", "QUADROS", "QUERIDO",
  "RECEITA", "REMENDO", "RETORNO", "SEGREDO", "SENHORA", "SISTEMA", "SORVETE", "TALENTO", "TAPETES",
  "TAREFAS", "TEMPERO", "TESOURA", "VALENTE", "VELHICE", "VERDADE", "VITRINE", "ALGODAO", "ALUGUEL",
  "AMARELO", "AMASSAR", "ARRUMAR", "ASSENTO", "ASSINAR", "BALANCO", "BARALHO", "BARRIGA", "BATIDAS",
  "BATISMO", "BEBIDAS", "BILHETE", "BONECAS", "BUZINAR", "CABELOS", "CABIDES", "CAIXOTE", "CAMADAS",
  "CAMARAO", "CANDEIA", "CARTELO", "CARTELA", "CASINHA", "CAVEIRA", "CENOURA", "CHAMADO", "CHAMADA",
  "CHAVECO", "CHEGADA", "CIGARRO", "CIMENTO", "CIRANDA", "COBERTO", "COLINAS", "COLMEIA", "COMANDO",
  "ABERTOU", "ACEROLA", "AMIGOSO", "ARMAZEM", "BARBEAR", "CALCULO",
  "CAMPANA", "CANTEIRO", "CEREBRO", "CORDEIRO", "DENTISTA", "ENXOVAL"
], 8);

const WORD_BANKS = {
  5: WORD_BANK_5,
  6: WORD_BANK_6,
  7: WORD_BANK_7,
  8: WORD_BANK_8,
};

function buildLevelsBySize(size, count, bank, wordsPerLevel, globalUsedTerms, globalUsedVisualSignatures) {
  const out = [];
  const maxLen = maxLenFor(size);
  const cleanBank = bank.filter(w => w.length <= maxLen);
  const needed = count * wordsPerLevel;
  const levelWords = [];

  for (const candidate of cleanBank) {
    if (levelWords.length >= needed) break;

    const word = sanitizeWord(candidate);
    const signature = wordVisualSignature(word);

    // v2.1.3: bloqueia repetição exata e também termos com as mesmas letras em outra ordem.
    // Exemplo: UBS e USB não podem coexistir no pacote, pois confundem o jogador.
    if (globalUsedTerms.has(word)) continue;
    if (globalUsedVisualSignatures.has(signature)) continue;

    globalUsedTerms.add(word);
    globalUsedVisualSignatures.add(signature);
    levelWords.push(word);
  }

  if (levelWords.length < needed) {
    throw new Error(`Banco insuficiente para ${size}x${size}: ${levelWords.length}/${needed} termos seguros.`);
  }

  for (let i = 0; i < count; i++) {
    const start = i * wordsPerLevel;
    const picks = levelWords.slice(start, start + wordsPerLevel);
    out.push({ size, words: picks, directions: 8 });
  }

  return out;
}

function buildDefaultLevels100() {
  const out = [];
  const globalUsedTerms = new Set();
  const globalUsedVisualSignatures = new Set();

  out.push(...buildLevelsBySize(5, 25, WORD_BANKS[5], 9, globalUsedTerms, globalUsedVisualSignatures));
  out.push(...buildLevelsBySize(6, 25, WORD_BANKS[6], 9, globalUsedTerms, globalUsedVisualSignatures));
  out.push(...buildLevelsBySize(7, 25, WORD_BANKS[7], 9, globalUsedTerms, globalUsedVisualSignatures));
  out.push(...buildLevelsBySize(8, 25, WORD_BANKS[8], 9, globalUsedTerms, globalUsedVisualSignatures));
  return out;
}

function hasValidDefaultLevelShape(levelsArr) {
  if (!Array.isArray(levelsArr) || levelsArr.length !== 100) return false;

  const seen = new Set();
  const visualSignatures = new Set();

  for (const lvl of levelsArr) {
    if (!lvl || typeof lvl !== "object") return false;
    if (!Number.isInteger(lvl.size) || lvl.size < 5 || lvl.size > 8) return false;
    if (!Array.isArray(lvl.words) || lvl.words.length !== 9) return false;

    for (const raw of lvl.words) {
      const w = sanitizeWord(raw);
      if (!w || w.length < 2 || w.length > maxLenFor(lvl.size)) return false;

      const visualSignature = wordVisualSignature(w);
      if (seen.has(w)) return false;
      if (visualSignatures.has(visualSignature)) return false;

      seen.add(w);
      visualSignatures.add(visualSignature);
    }
  }

  return true;
}

const DEFAULT_LEVELS = buildDefaultLevels100();

/* =========================
   DOM
========================= */
const boardEl = $("board");
const wordListEl = $("wordList");
const levelLabel = $("levelLabel");
const progressBar = $("progressBar");
const messageEl = $("message");

const timeLabel = $("timeLabel");
const movesLabel = $("movesLabel");

const btnHint = $("btnHint");
const btnRestart = $("btnRestart");
const btnNext = $("btnNext");
const btnDev = $("btnDev");
const btnSound = $("btnSound");
const btnResetAllLevels = $("btnResetAllLevels");

const devPanel = $("devPanel");
const levelsInput = $("levelsInput");
const applyLevels = $("applyLevels");
const resetLevels = $("resetLevels");
const closeDev = $("closeDev");

/* =========================
   Storage
========================= */
function readAllStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllStorage(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj?.progress || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  const data = readAllStorage();
  data.progress = { ...(data.progress || {}), ...progress };
  writeAllStorage(data);
}

function saveBestTime(levelIdx, seconds) {
  const data = readAllStorage();
  data.bestTimes = data.bestTimes || {};
  const key = String(levelIdx);
  const prev = data.bestTimes[key];

  if (prev == null || seconds < prev) {
    data.bestTimes[key] = seconds;
    writeAllStorage(data);
  }
}

// Mantém API de override, mas a seleção aleatória não depende disso.
// (não removi nada fora do pedido)
function getOverrideWords(levelIdx) {
  const data = readAllStorage();
  return data?.overrides?.[String(levelIdx)] || null;
}

function setOverrideWords(levelIdx, words) {
  const data = readAllStorage();
  data.overrides = data.overrides || {};
  data.overrides[String(levelIdx)] = words.slice(0, 9);
  writeAllStorage(data);
}

function clearOverrides() {
  const data = readAllStorage();
  data.overrides = {};
  writeAllStorage(data);
}

function getSoundPref() {
  const data = readAllStorage();
  const v = data?.settings?.soundOn;
  return v == null ? true : !!v;
}

function setSoundPref(on) {
  const data = readAllStorage();
  data.settings = data.settings || {};
  data.settings.soundOn = !!on;
  writeAllStorage(data);
}

function loadLevels() {
  const data = readAllStorage();

  if (Number(data.schemaVersion || 0) === SCHEMA_VERSION && hasValidDefaultLevelShape(data.levels)) {
    return data.levels;
  }

  const fresh = safeClone(DEFAULT_LEVELS);
  const previousProgress = data?.progress || {};
  const previousBestTimes = data?.bestTimes || {};
  const previousSettings = data?.settings || { soundOn: true };

  writeAllStorage({
    schemaVersion: SCHEMA_VERSION,
    levels: fresh,
    progress: {
      ...previousProgress,
      levelIndex: clamp(Number(previousProgress.levelIndex || 0), 0, fresh.length - 1)
    },
    bestTimes: previousBestTimes,
    overrides: {},
    settings: {
      soundOn: previousSettings.soundOn == null ? true : !!previousSettings.soundOn
    }
  });

  return fresh;
}

function saveLevels(levelsArr) {
  const data = readAllStorage();
  data.schemaVersion = SCHEMA_VERSION;
  data.levels = levelsArr;
  if (!data.overrides) data.overrides = {};
  if (!data.settings) data.settings = { soundOn: true };
  writeAllStorage(data);
}

function resetAllLevelsProgress() {
  const ok = confirm("Resetar todo o progresso e voltar ao nível 1?");
  if (!ok) return;

  const previous = readAllStorage();
  const previousSound = previous?.settings?.soundOn;
  const keepSoundOn = previousSound == null ? soundOn : !!previousSound;
  const fresh = safeClone(DEFAULT_LEVELS);

  writeAllStorage({
    schemaVersion: SCHEMA_VERSION,
    levels: fresh,
    progress: { levelIndex: 0 },
    bestTimes: {},
    overrides: {},
    settings: { soundOn: keepSoundOn }
  });

  levels = fresh;
  levelIndex = 0;
  moves = 0;
  soundOn = keepSoundOn;
  syncSoundButton();

  if (movesLabel) movesLabel.textContent = "0";
  if (devPanel) devPanel.hidden = true;

  startLevel(0, { resetStats: true });
  toast("✔ Progresso resetado. Você voltou ao nível 1.");
}

/* =========================
   Validação editor
========================= */
function validateLevels(arr) {
  const seen = new Set();
  const visualSignatures = new Set();

  arr.forEach((lvl, idx) => {
    if (typeof lvl !== "object") throw new Error("Nível inválido");
    if (!Number.isInteger(lvl.size) || lvl.size < 5 || lvl.size > 8) throw new Error("size inválido (use 5 a 8)");
    if (!Array.isArray(lvl.words) || lvl.words.length !== 9) throw new Error(`Nível ${idx + 1}: precisa ter 9 palavras`);
    lvl.words.forEach(w => {
      const s = sanitizeWord(w);
      if (!s) throw new Error("word vazia");
      if (s.length > maxLenFor(lvl.size)) throw new Error(`word grande demais no nível ${idx + 1}: ${s}`);

      const visualSignature = wordVisualSignature(s);
      if (seen.has(s)) throw new Error(`palavra repetida no pacote: ${s}`);
      if (visualSignatures.has(visualSignature)) {
        throw new Error(`termo com mesmas letras já usado no pacote: ${s}`);
      }

      seen.add(s);
      visualSignatures.add(visualSignature);
    });
    if (lvl.directions != null && lvl.directions !== 8) throw new Error("directions deve ser 8");
  });
}

/* =========================
   Som (Web Audio) - leve
========================= */
let soundOn = getSoundPref();
let audioCtx = null;
let audioUnlocked = false;

function syncSoundButton() {
  if (!btnSound) return;
  btnSound.setAttribute("aria-pressed", String(!!soundOn));
  btnSound.textContent = soundOn ? "🔊" : "🔇";
  btnSound.title = soundOn ? "Som ligado" : "Som desligado";
}

function ensureAudio() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

async function unlockAudioIfNeeded() {
  if (audioUnlocked) return;
  const ctx = ensureAudio();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.00001;
    osc.type = "sine";
    osc.frequency.value = 440;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.01);
    audioUnlocked = true;
  } catch {}
}

function playBeep(freq, durMs, type = "sine", vol = 0.035) {
  if (!soundOn) return;
  const ctx = ensureAudio();
  if (!ctx || !audioUnlocked) return;

  const t0 = ctx.currentTime;
  const dur = Math.max(0.02, durMs / 1000);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function sfxFound() {
  playBeep(880, 70, "triangle", 0.03);
  setTimeout(() => playBeep(1175, 70, "triangle", 0.028), 55);
  setTimeout(() => playBeep(1568, 90, "triangle", 0.026), 110);
}

function sfxComplete() {
  playBeep(784, 90, "sine", 0.03);
  setTimeout(() => playBeep(988, 90, "sine", 0.03), 90);
  setTimeout(() => playBeep(1175, 110, "sine", 0.03), 180);
  setTimeout(() => playBeep(1568, 140, "sine", 0.032), 300);
}

/* =========================
   FX Moedas (DOM + CSS)
========================= */
let coinsActive = 0;
const MAX_COINS_ACTIVE = 6;

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function spawnCoinAt(x, y, kind = "coin") {
  if (coinsActive >= MAX_COINS_ACTIVE) return;

  const el = document.createElement("span");
  el.className = "fx-coin";

  if (prefersReducedMotion()) {
    el.classList.add("fx-text");
    el.textContent = "+1";
  } else {
    el.textContent = "🪙";
    if (kind === "small") el.classList.add("fx-small");
  }

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  coinsActive++;
  document.body.appendChild(el);

  const cleanup = () => {
    if (!el.isConnected) return;
    el.remove();
    coinsActive = Math.max(0, coinsActive - 1);
  };

  el.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, prefersReducedMotion() ? 350 : 1200);
}

function spawnCoinNearElement(domEl, kind = "coin") {
  if (!domEl) return;
  const r = domEl.getBoundingClientRect();
  const x = r.left + r.width * 0.5;
  const y = r.top + r.height * 0.25;
  spawnCoinAt(x, y, kind);
}

function spawnCoinsCelebration() {
  const base = boardEl?.getBoundingClientRect?.();
  const x0 = base ? base.left + base.width * 0.5 : window.innerWidth * 0.5;
  const y0 = base ? base.top + base.height * 0.45 : window.innerHeight * 0.35;

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const x = x0 + randInt(-40, 40);
      const y = y0 + randInt(-20, 20);
      spawnCoinAt(x, y, "small");
    }, i * 120);
  }
}

/* =========================
   Estado
========================= */
let levels = loadLevels();
let levelIndex = loadProgress().levelIndex ?? 0;
levelIndex = clamp(levelIndex, 0, Math.max(0, levels.length - 1));

let grid = [];
let placements = [];
let foundWords = new Set();

let selecting = false;
let selectedCells = [];
let selectionVector = null;
let locked = false;

let moves = 0;

let startTime = 0;
let timerId = null;

let genToken = 0;
let wordColorMap = new Map();

/* =========================
   Boot
========================= */
wireUI();
syncSoundButton();
startLevel(levelIndex);

/* =========================
   UI
========================= */
function wireUI() {
  const unlock = () => unlockAudioIfNeeded();
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });

  btnHint.addEventListener("click", hint);
  btnRestart.addEventListener("click", () => startLevel(levelIndex, { resetStats: true }));
  btnNext.addEventListener("click", nextLevel);

  btnSound?.addEventListener("click", async () => {
    soundOn = !soundOn;
    setSoundPref(soundOn);
    syncSoundButton();
    await unlockAudioIfNeeded();
    toast(soundOn ? "🔊 Som ligado" : "🔇 Som desligado");
    if (soundOn) playBeep(880, 70, "triangle", 0.02);
  });

  btnResetAllLevels?.addEventListener("click", resetAllLevelsProgress);

  // Editor técnico preservado no código, mas sem botão público na interface.
  btnDev?.addEventListener("click", toggleDevPanel);

  closeDev?.addEventListener("click", () => { devPanel.hidden = true; });

  applyLevels?.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(levelsInput.value);
      if (!Array.isArray(parsed)) throw new Error("JSON deve ser um array");
      validateLevels(parsed);

      levels = parsed.map(l => ({
        size: l.size,
        words: (l.words || []).map(sanitizeWord).filter(Boolean).slice(0, 9),
        directions: 8
      }));

      saveLevels(levels);
      clearOverrides();

      levelIndex = 0;
      saveProgress({ levelIndex });

      devPanel.hidden = true;
      startLevel(0, { resetStats: true });
      toast("✔ Níveis aplicados!");
    } catch (e) {
      toast("❌ JSON inválido. Confira o formato.");
      console.error(e);
    }
  });

  resetLevels?.addEventListener("click", () => {
    const ok = confirm("Restaurar níveis padrão?");
    if (!ok) return;

    levels = safeClone(DEFAULT_LEVELS);
    saveLevels(levels);
    clearOverrides();

    levelIndex = 0;
    saveProgress({ levelIndex });

    devPanel.hidden = true;
    startLevel(0, { resetStats: true });
    toast("✔ Níveis padrão restaurados.");
  });

  boardEl.addEventListener("pointerdown", onPointerDown);
  boardEl.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  window.addEventListener("pointercancel", () => {
    if (!selecting) return;
    selecting = false;
    clearSelection();
  });

  if (levelsInput) levelsInput.value = JSON.stringify(levels, null, 2);
}

function toggleDevPanel() {
  if (!devPanel || !levelsInput) return;
  devPanel.hidden = !devPanel.hidden;
  if (!devPanel.hidden) levelsInput.value = JSON.stringify(levels, null, 2);
}

/* =========================
   Level
========================= */
async function startLevel(index, opts = {}) {
  const myToken = ++genToken;
  locked = true;

  const level = levels[index];
  if (!level) {
    toast("🏆 Jogo finalizado!");
    stopTimer();
    return;
  }

  if (opts.resetStats) {
    moves = 0;
    movesLabel.textContent = "0";
  }

  stopTimer();
  startTime = Date.now();
  timerId = setInterval(updateTimer, 250);
  updateTimer();

  foundWords.clear();
  clearSelection();
  wordColorMap.clear();

  const size = level.size;
  levelLabel.textContent = `Nível ${index + 1} • ${size}×${size}`;
  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  toast("Gerando tabuleiro…");

  grid = Array.from({ length: size }, () => Array(size).fill(""));
  placements = [];
  renderBoard(size);
  renderWords([], { silent: true });
  updateProgress();

  // ✅ v2.1.3: usa somente as palavras fixas e anti-confusão do nível
  const result = await generateBoardGuaranteedWithFallback({
    size,
    words: level.words,
    levelIndex: index,
    token: myToken
  });

  if (myToken !== genToken) return;

  if (!result.ok) {
    grid = Array.from({ length: size }, () => Array(size).fill(""));
    placements = [];
    renderBoard(size);
    renderWords([], { silent: false });
    updateProgress();
    toast("❌ Não consegui montar este nível. Toque em Reiniciar.");
    locked = false;
    return;
  }

  // (mantém override compatível se fallback determinístico foi usado)
  if (result.usedFallback) setOverrideWords(index, result.words);

  fillGridRandom();
  renderBoard(size);

  for (const w of placements.map(p => p.word)) {
    wordColorMap.set(w, hashWordToColor(w));
  }

  renderWords(placements.map(p => p.word), { silent: true });
  updateProgress();

  toast("Boa sorte! 😄");
  setTimeout(() => {
    if (myToken === genToken) locked = false;
  }, 120);

  saveProgress({ levelIndex });
}

function nextLevel() {
  levelIndex = Math.min(levelIndex + 1, levels.length - 1);
  saveProgress({ levelIndex });
  startLevel(levelIndex, { resetStats: true });
}

/* =========================
   Geração + fallback
========================= */
async function generateBoardGuaranteedWithFallback({ size, words, levelIndex, token }) {
  const maxLen = maxLenFor(size);
  const seenPrimaryTerms = new Set();
  const seenPrimaryVisualSignatures = new Set();
  const primarySet = [];

  for (const raw of (Array.isArray(words) ? words : [])) {
    const w = sanitizeWord(raw);
    if (!w || w.length < 2 || w.length > maxLen) continue;

    const signature = wordVisualSignature(w);
    if (seenPrimaryTerms.has(w)) continue;
    if (seenPrimaryVisualSignatures.has(signature)) continue;

    seenPrimaryTerms.add(w);
    seenPrimaryVisualSignatures.add(signature);
    primarySet.push(w);

    if (primarySet.length >= 9) break;
  }

  if (primarySet.length !== 9) {
    console.warn("Nível com palavras inválidas", { size, levelIndex, primarySet });
    return { ok: false, usedFallback: false, words: primarySet };
  }

  // 1) Tentativa rápida original: mantém tabuleiros variados sem mudar palavras.
  const okFast = await generateBoardGuaranteedAsync({ size, words: primarySet, token });
  if (token !== genToken) return { ok: false, usedFallback: false, words: primarySet };
  if (okFast) return { ok: true, usedFallback: false, words: primarySet };

  // 2) Fallback estrutural v2.1.1: reorganiza o tabuleiro, mas NÃO troca termos.
  // Isso fecha a brecha que permitia uma palavra de outro nível reaparecer.
  const okLocked = await generateBoardLockedWordsAsync({ size, words: primarySet, token });
  if (token !== genToken) return { ok: false, usedFallback: false, words: primarySet };
  if (okLocked) return { ok: true, usedFallback: true, words: primarySet };

  return { ok: false, usedFallback: false, words: primarySet };
}


async function generateBoardLockedWordsAsync({ size, words, token }) {
  const ordered = [...words].sort((a, b) => b.length - a.length || a.localeCompare(b));
  const workGrid = Array.from({ length: size }, () => Array(size).fill(""));
  const workPlacements = [];
  let steps = 0;

  async function backtrack(idx) {
    if (token !== genToken) return false;
    if (steps > MAX_LOCKED_BACKTRACK_STEPS) return false;

    if (idx >= ordered.length) {
      grid = workGrid.map(row => row.slice());
      placements = workPlacements.map(p => ({
        word: p.word,
        cells: p.cells.map(c => ({ x: c.x, y: c.y })),
        hint: { x: p.hint.x, y: p.hint.y }
      }));
      return true;
    }

    const word = ordered[idx];
    const options = buildLockedPlacementOptions(workGrid, word, size);

    for (const option of options) {
      if (token !== genToken) return false;

      const written = applyLockedPlacement(workGrid, option);
      workPlacements.push({ word, cells: option.cells, hint: option.hint });

      steps++;
      if (steps % 260 === 0) await nextTick();

      if (await backtrack(idx + 1)) return true;

      workPlacements.pop();
      undoLockedPlacement(workGrid, written);
    }

    return false;
  }

  return backtrack(0);
}

function buildLockedPlacementOptions(workGrid, word, size) {
  const out = [];
  const forms = [
    { letters: word.split(""), isReversed: false },
    { letters: word.split("").reverse(), isReversed: true }
  ];

  for (const form of forms) {
    for (const dir of DIRS) {
      const len = form.letters.length;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const endX = x + dir[0] * (len - 1);
          const endY = y + dir[1] * (len - 1);
          if (endX < 0 || endY < 0 || endX >= size || endY >= size) continue;

          const candidate = canPlaceLocked(workGrid, x, y, dir, form.letters, size);
          if (!candidate.ok) continue;

          const cells = [];
          for (let i = 0; i < len; i++) {
            cells.push({ x: x + dir[0] * i, y: y + dir[1] * i });
          }

          const hintIndex = form.isReversed ? (len - 1) : 0;
          out.push({
            word,
            letters: form.letters,
            dir,
            x,
            y,
            cells,
            hint: { x: x + dir[0] * hintIndex, y: y + dir[1] * hintIndex },
            score: candidate.overlaps
          });
        }
      }
    }
  }

  return out.sort((a, b) => b.score - a.score || a.cells.length - b.cells.length);
}

function canPlaceLocked(workGrid, x, y, dir, letters, size) {
  let overlaps = 0;

  for (let i = 0; i < letters.length; i++) {
    const nx = x + dir[0] * i;
    const ny = y + dir[1] * i;
    if (nx < 0 || ny < 0 || nx >= size || ny >= size) return { ok: false, overlaps: 0 };

    const existing = workGrid[ny][nx];
    if (existing && existing !== letters[i]) return { ok: false, overlaps: 0 };
    if (existing === letters[i]) overlaps++;
  }

  return { ok: true, overlaps };
}

function applyLockedPlacement(workGrid, option) {
  const written = [];

  for (let i = 0; i < option.letters.length; i++) {
    const cell = option.cells[i];
    if (!workGrid[cell.y][cell.x]) {
      workGrid[cell.y][cell.x] = option.letters[i];
      written.push({ x: cell.x, y: cell.y });
    }
  }

  return written;
}

function undoLockedPlacement(workGrid, written) {
  for (const cell of written) {
    workGrid[cell.y][cell.x] = "";
  }
}

async function generateBoardGuaranteedAsync({ size, words, token }) {
  for (const w of words) if (!w || w.length > maxLenFor(size)) return false;

  const allowedDirs = buildAllowedDirs(8);
  const wordsSorted = [...words].sort((a, b) => b.length - a.length);

  for (let attempt = 0; attempt < MAX_BOARD_RETRIES; attempt++) {
    if (token !== genToken) return false;

    grid = Array.from({ length: size }, () => Array(size).fill(""));
    placements = [];

    const placedAll = await tryPlaceAllWordsAsync(wordsSorted, allowedDirs, size, token, attempt);
    if (token !== genToken) return false;

    if (placedAll && placements.length === 9) return true;
    if (attempt % YIELD_EVERY === 0) await nextTick();
  }

  return false;
}

async function tryPlaceAllWordsAsync(wordsSorted, allowedDirs, size, token, attemptBase) {
  for (let wi = 0; wi < wordsSorted.length; wi++) {
    if (token !== genToken) return false;

    const word = wordsSorted[wi];
    const placed = await tryPlaceWordAsync(word, allowedDirs, size, token, wi, attemptBase);
    if (!placed) return false;

    if ((wi + attemptBase) % YIELD_EVERY === 0) await nextTick();
  }
  return true;
}

async function tryPlaceWordAsync(word, allowedDirs, size, token, wi, attemptBase) {
  const isReversed = Math.random() < 0.35;
  const letters = (isReversed ? word.split("").reverse() : word.split(""));

  for (let k = 0; k < MAX_WORD_ATTEMPTS; k++) {
    if (token !== genToken) return false;

    const dir = allowedDirs[randInt(0, allowedDirs.length - 1)];

    const candidates = buildAnchoredCandidates(letters, dir, size);
    if (!candidates.length) {
      candidates.push(...buildAllStartCandidates(letters.length, dir, size));
      shuffleInPlace(candidates);
    }

    const limit = Math.min(candidates.length, 30);
    for (let i = 0; i < limit; i++) {
      const { x, y } = candidates[i];
      if (canPlace(x, y, dir, letters, size)) {
        writeWord(word, letters, x, y, dir, isReversed);
        return true;
      }
    }

    if ((k + wi + attemptBase) % 80 === 0) await nextTick();
  }

  return false;
}

function buildAnchoredCandidates(letters, dir, size) {
  const filled = getFilledCells();
  if (!filled.length) return [];

  const out = [];
  for (let f = 0; f < filled.length; f++) {
    const anchor = filled[f];

    for (let i = 0; i < letters.length; i++) {
      if (letters[i] !== anchor.ch) continue;

      const x = anchor.x - dir[0] * i;
      const y = anchor.y - dir[1] * i;

      const endX = x + dir[0] * (letters.length - 1);
      const endY = y + dir[1] * (letters.length - 1);

      if (x < 0 || y < 0 || endX < 0 || endY < 0) continue;
      if (x >= size || y >= size || endX >= size || endY >= size) continue;

      out.push({ x, y });
    }
  }

  shuffleInPlace(out);
  return out;
}

function buildAllStartCandidates(len, dir, size) {
  const out = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const endX = x + dir[0] * (len - 1);
      const endY = y + dir[1] * (len - 1);
      if (endX < 0 || endY < 0 || endX >= size || endY >= size) continue;
      out.push({ x, y });
    }
  }
  return out;
}

function writeWord(word, letters, x, y, dir, isReversed) {
  const cells = [];
  for (let i = 0; i < letters.length; i++) {
    const nx = x + dir[0] * i;
    const ny = y + dir[1] * i;
    grid[ny][nx] = letters[i];
    cells.push({ x: nx, y: ny });
  }

  const hintIndex = isReversed ? (letters.length - 1) : 0;
  const hint = { x: x + dir[0] * hintIndex, y: y + dir[1] * hintIndex };

  placements.push({ word, cells, hint });
}

function canPlace(x, y, dir, letters, size) {
  for (let i = 0; i < letters.length; i++) {
    const nx = x + dir[0] * i;
    const ny = y + dir[1] * i;

    if (nx < 0 || ny < 0 || nx >= size || ny >= size) return false;

    const existing = grid[ny][nx];
    if (existing && existing !== letters[i]) return false;
  }
  return true;
}

function buildAllowedDirs(directions) {
  const n = clamp(directions ?? 8, 1, 8);
  const all = DIRS.map(d => d.slice());
  shuffleInPlace(all);
  const subset = all.slice(0, n);

  const hasDiagonal = subset.some(d => Math.abs(d[0]) === 1 && Math.abs(d[1]) === 1);
  if (!hasDiagonal && n >= 2) subset[subset.length - 1] = [1, 1];

  return subset;
}

function fillGridRandom() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const size = grid.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!grid[y][x]) grid[y][x] = alphabet[randInt(0, alphabet.length - 1)];
    }
  }
}

/* =========================
   Render
========================= */
function renderBoard(size) {
  boardEl.innerHTML = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[y]?.[x] || "";
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      boardEl.appendChild(cell);
    }
  }
}

function renderWords(words, opts = {}) {
  const silent = !!opts.silent;
  wordListEl.innerHTML = "";

  const cleanWords = (words || []).map(sanitizeWord).filter(Boolean);

  cleanWords.forEach(w => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.dataset.word = w;

    const color = hashWordToColor(w);
    span.style.setProperty("--wcolor", color);

    wordListEl.appendChild(span);
  });

  if (!silent && cleanWords.length === 0) {
    toast("⚠ Nenhuma palavra disponível neste nível.");
  }
}

/* =========================
   Seleção
========================= */
function onPointerDown(e) {
  if (locked) return;
  const cell = e.target.closest(".cell");
  if (!cell) return;

  selecting = true;
  clearSelection();

  selectedCells.push(cell);
  cell.classList.add("active");
}

function onPointerMove(e) {
  if (!selecting || locked) return;

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const cell = el?.closest?.(".cell");
  if (!cell) return;
  if (selectedCells.includes(cell)) return;

  const last = selectedCells[selectedCells.length - 1];
  const dx = Number(cell.dataset.x) - Number(last.dataset.x);
  const dy = Number(cell.dataset.y) - Number(last.dataset.y);

  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return;

  if (!selectionVector) selectionVector = [dx, dy];
  else if (dx !== selectionVector[0] || dy !== selectionVector[1]) return;

  selectedCells.push(cell);
  cell.classList.add("active");
}

function onPointerUp() {
  if (!selecting) return;
  selecting = false;
  validateSelection();
}

function clearSelection() {
  selectedCells.forEach(c => c.classList.remove("active"));
  selectedCells = [];
  selectionVector = null;
}

function selectedPathMatchesPlacement(selectedPath, placementCells) {
  if (!Array.isArray(selectedPath) || !Array.isArray(placementCells)) return false;
  if (selectedPath.length !== placementCells.length) return false;

  const sameForward = selectedPath.every((cell, idx) =>
    cell.x === placementCells[idx].x && cell.y === placementCells[idx].y
  );
  if (sameForward) return true;

  const sameBackward = selectedPath.every((cell, idx) => {
    const opposite = placementCells[placementCells.length - 1 - idx];
    return cell.x === opposite.x && cell.y === opposite.y;
  });

  return sameBackward;
}

function validateSelection() {
  if (selectedCells.length < 2) {
    clearSelection();
    return;
  }

  moves++;
  movesLabel.textContent = String(moves);

  const selectedWord = selectedCells.map(c => c.textContent).join("");
  const reversed = selectedWord.split("").reverse().join("");

  const selectedPath = selectedCells.map(c => ({
    x: Number(c.dataset.x),
    y: Number(c.dataset.y)
  }));

  const match = placements.find(p =>
    !foundWords.has(p.word) &&
    (p.word === selectedWord || p.word === reversed) &&
    selectedPathMatchesPlacement(selectedPath, p.cells)
  );

  if (match) {
    foundWords.add(match.word);

    const color = wordColorMap.get(match.word) || hashWordToColor(match.word);

    selectedCells.forEach(c => {
      c.classList.remove("active");
      c.classList.add("found");
      c.style.setProperty("--wcolor", color);
    });

    const tag = document.querySelector(`[data-word="${match.word}"]`);
    if (tag) tag.style.setProperty("--wcolor", color);
    tag?.classList.add("found");

    sfxFound();
    spawnCoinNearElement(selectedCells[selectedCells.length - 1], "coin");

    navigator.vibrate?.(50);
    toast(`✔ Encontrou: ${match.word}`);
  }

  clearSelection();
  updateProgress();
}

/* =========================
   Progresso / fim
========================= */
function updateProgress() {
  const total = placements.length || 1;
  const pct = (foundWords.size / total) * 100;
  progressBar.style.width = pct + "%";

  if (pct === 100 && !locked) {
    locked = true;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    saveBestTime(levelIndex, elapsed);

    sfxComplete();
    spawnCoinsCelebration();

    toast("✔ Nível concluído!");
    setTimeout(() => {
      levelIndex++;
      if (levelIndex < levels.length) {
        saveProgress({ levelIndex });
        startLevel(levelIndex, { resetStats: true });
      } else {
        stopTimer();
        toast("🏆 Jogo finalizado!");
      }
    }, 650);
  }
}

/* =========================
   Dica
========================= */
function hint() {
  if (locked) return;

  const remaining = placements.filter(p => !foundWords.has(p.word));
  if (remaining.length === 0) return;

  const pick = remaining[randInt(0, remaining.length - 1)];
  const target = pick.hint || pick.cells[0];

  const cellEl = boardEl.querySelector(`.cell[data-x="${target.x}"][data-y="${target.y}"]`);
  if (!cellEl) return;

  cellEl.classList.add("hint");
  setTimeout(() => cellEl.classList.remove("hint"), 900);

  toast("💡 Dica: primeira letra destacada.");
}

/* =========================
   Timer
========================= */
function updateTimer() {
  const s = Math.floor((Date.now() - startTime) / 1000);
  timeLabel.textContent = formatTime(s);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* =========================
   Util
========================= */
function toast(text) {
  messageEl.textContent = text;
}

function getFilledCells() {
  const out = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid.length; x++) {
      const ch = grid[y][x];
      if (ch) out.push({ x, y, ch });
    }
  }
  return out;
}