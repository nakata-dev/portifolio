"use strict";

/* =========================================================
   NIHONGO321 MVP
   - Home, tópicos, estudo, conceitos, progresso e ajustes
   - Ciclos de 3 frases
   - Modo treino rápido
   - Áudio via SpeechSynthesis
   - Persistência com localStorage
   ========================================================= */

const LS_KEY = "nihongo321_mvp_v1";

const APP_DATA = [
  {
    id: "konbini",
    emoji: "🏪",
    title: "Konbini",
    description: "Compras rápidas e caixa",
    phrases: [
      {
        jp: "これをください。",
        pt: "Quero isto.",
        concepts: [
          "これ (kore): isto,",
          "を: partícula que marca o objeto da ação,",
          "ください (kudasai): por favor me dê,"
        ]
      },
      {
        jp: "袋は要りません。",
        pt: "Não preciso de sacola.",
        concepts: [
          "袋 (fukuro): sacola,",
          "は: partícula de tópico,",
          "要りません (irimasen): não preciso,"
        ]
      },
      {
        jp: "温めてください。",
        pt: "Pode esquentar, por favor?",
        concepts: [
          "温めて (atatamete): esquente,",
          "ください (kudasai): por favor,"
        ]
      },
      {
        jp: "支払いはカードで。",
        pt: "Vou pagar com cartão.",
        concepts: [
          "支払い (shiharai): pagamento,",
          "は: partícula de tópico,",
          "カード (kaado): cartão,",
          "で: indica meio ou instrumento,"
        ]
      },
      {
        jp: "レシートをください。",
        pt: "Pode me dar o recibo?",
        concepts: [
          "レシート (reshiito): recibo,",
          "を: partícula do objeto,",
          "ください (kudasai): por favor me dê,"
        ]
      }
    ]
  },
  {
    id: "mercado",
    emoji: "🛒",
    title: "Mercado",
    description: "Preço, quantidade e compras",
    phrases: [
      {
        jp: "これはいくらですか。",
        pt: "Quanto custa isto?",
        concepts: [
          "これ (kore): isto,",
          "は: partícula de tópico,",
          "いくら: quanto,",
          "ですか: forma de pergunta,"
        ]
      },
      {
        jp: "安いですね。",
        pt: "Está barato, né?",
        concepts: [
          "安い (yasui): barato,",
          "です/ですね: suaviza e confirma a fala,"
        ]
      },
      {
        jp: "新しいですか。",
        pt: "É novo ou fresco?",
        concepts: [
          "新しい (atarashii): novo,",
          "ですか: pergunta,"
        ]
      },
      {
        jp: "別々にしてください。",
        pt: "Separe, por favor.",
        concepts: [
          "別々に (betsubetsu ni): separadamente,",
          "してください (shite kudasai): faça, por favor,"
        ]
      },
      {
        jp: "もう一つください。",
        pt: "Quero mais um.",
        concepts: [
          "もう一つ (mou hitotsu): mais um,",
          "ください (kudasai): por favor me dê,"
        ]
      }
    ]
  },
  {
    id: "trabalho",
    emoji: "🏭",
    title: "Trabalho",
    description: "Fábrica e rotina no serviço",
    phrases: [
      {
        jp: "分かりました。",
        pt: "Entendi.",
        concepts: [
          "分かりました (wakarimashita): entendi,"
        ]
      },
      {
        jp: "もう一度お願いします。",
        pt: "Pode repetir mais uma vez?",
        concepts: [
          "もう一度 (mou ichido): mais uma vez,",
          "お願いします (onegaishimasu): por favor,"
        ]
      },
      {
        jp: "すみません、遅れます。",
        pt: "Desculpe, vou me atrasar.",
        concepts: [
          "すみません: desculpe,",
          "遅れます (okuremasu): vou me atrasar,"
        ]
      },
      {
        jp: "ここでいいですか。",
        pt: "Aqui está certo?",
        concepts: [
          "ここ: aqui,",
          "で: indica lugar da ação,",
          "いいですか: está bom?"
        ]
      },
      {
        jp: "手伝いましょうか。",
        pt: "Posso ajudar?",
        concepts: [
          "手伝い (tetsudai): ajuda,",
          "ましょうか: quer que eu faça?"
        ]
      }
    ]
  },
  {
    id: "hospital",
    emoji: "🏥",
    title: "Hospital",
    description: "Dor, consulta e remédio",
    phrases: [
      {
        jp: "頭が痛いです。",
        pt: "Estou com dor de cabeça.",
        concepts: [
          "頭 (atama): cabeça,",
          "が: partícula que marca o sujeito,",
          "痛い (itai): dói,"
        ]
      },
      {
        jp: "熱があります。",
        pt: "Estou com febre.",
        concepts: [
          "熱 (netsu): febre,",
          "が あります: existe / tenho,"
        ]
      },
      {
        jp: "薬をください。",
        pt: "Quero remédio.",
        concepts: [
          "薬 (kusuri): remédio,",
          "を: partícula do objeto,",
          "ください (kudasai): por favor me dê,"
        ]
      },
      {
        jp: "予約があります。",
        pt: "Tenho consulta agendada.",
        concepts: [
          "予約 (yoyaku): reserva / agendamento,",
          "が あります: tenho / existe,"
        ]
      },
      {
        jp: "どこですか。",
        pt: "Onde fica?",
        concepts: [
          "どこ: onde,",
          "ですか: pergunta,"
        ]
      }
    ]
  },
  {
    id: "prefeitura",
    emoji: "🏢",
    title: "Prefeitura",
    description: "Documentos e procedimentos",
    phrases: [
      {
        jp: "手続きはどこですか。",
        pt: "Onde faço o procedimento?",
        concepts: [
          "手続き (tetsuzuki): procedimento,",
          "は: tópico,",
          "どこですか: onde é?"
        ]
      },
      {
        jp: "これを書いてください。",
        pt: "Preencha isto, por favor.",
        concepts: [
          "これ: isto,",
          "を: objeto,",
          "書いて (kaite): escreva,",
          "ください: por favor,"
        ]
      },
      {
        jp: "分かりません。",
        pt: "Não entendo.",
        concepts: [
          "分かりません (wakarimasen): não entendo,"
        ]
      },
      {
        jp: "助けてください。",
        pt: "Por favor, me ajude.",
        concepts: [
          "助けて (tasukete): ajude,",
          "ください: por favor,"
        ]
      },
      {
        jp: "必要ですか。",
        pt: "É necessário?",
        concepts: [
          "必要 (hitsuyou): necessário,",
          "ですか: pergunta,"
        ]
      }
    ]
  },
  {
    id: "transporte",
    emoji: "🚃",
    title: "Transporte",
    description: "Ônibus, trem e deslocamento",
    phrases: [
      {
        jp: "何時ですか。",
        pt: "Que horas são?",
        concepts: [
          "何時 (nanji): que horas,",
          "ですか: pergunta,"
        ]
      },
      {
        jp: "どこで降りますか。",
        pt: "Onde desce?",
        concepts: [
          "どこで: onde,",
          "降ります (orimasu): descer,",
          "か: pergunta,"
        ]
      },
      {
        jp: "切符をください。",
        pt: "Quero uma passagem.",
        concepts: [
          "切符 (kippu): passagem / bilhete,",
          "を: objeto,",
          "ください: por favor me dê,"
        ]
      },
      {
        jp: "遅れています。",
        pt: "Está atrasado.",
        concepts: [
          "遅れて (okurete): atrasado,",
          "います: estado em andamento,"
        ]
      },
      {
        jp: "そこに行きたいです。",
        pt: "Quero ir até lá.",
        concepts: [
          "そこ: aí / lá,",
          "に: direção,",
          "行きたいです (ikitai desu): quero ir,"
        ]
      }
    ]
  },
  {
    id: "moradia",
    emoji: "🏠",
    title: "Moradia",
    description: "Casa, aluguel e problemas",
    phrases: [
      {
        jp: "家賃はいくらですか。",
        pt: "Quanto é o aluguel?",
        concepts: [
          "家賃 (yachin): aluguel,",
          "は: tópico,",
          "いくらですか: quanto é?"
        ]
      },
      {
        jp: "修理できますか。",
        pt: "Pode consertar?",
        concepts: [
          "修理 (shuuri): conserto,",
          "できますか: consegue / pode?"
        ]
      },
      {
        jp: "水が出ません。",
        pt: "A água não sai.",
        concepts: [
          "水 (mizu): água,",
          "が: sujeito,",
          "出ません (demasen): não sai,"
        ]
      },
      {
        jp: "鍵をなくしました。",
        pt: "Perdi a chave.",
        concepts: [
          "鍵 (kagi): chave,",
          "を: objeto,",
          "なくしました: perdi,"
        ]
      },
      {
        jp: "問題があります。",
        pt: "Tem um problema.",
        concepts: [
          "問題 (mondai): problema,",
          "が あります: existe / tem,"
        ]
      }
    ]
  },
  {
    id: "basicas",
    emoji: "💬",
    title: "Frases básicas",
    description: "O básico que salva o dia",
    phrases: [
      {
        jp: "ありがとうございます。",
        pt: "Muito obrigado.",
        concepts: [
          "ありがとうございます: muito obrigado,"
        ]
      },
      {
        jp: "すみません。",
        pt: "Com licença / desculpe.",
        concepts: [
          "すみません: com licença / desculpe,"
        ]
      },
      {
        jp: "はい、そうです。",
        pt: "Sim, isso mesmo.",
        concepts: [
          "はい: sim,",
          "そうです: isso mesmo,"
        ]
      },
      {
        jp: "いいえ、違います。",
        pt: "Não, está diferente / não é isso.",
        concepts: [
          "いいえ: não,",
          "違います (chigaimasu): está diferente / não é,"
        ]
      },
      {
        jp: "大丈夫です。",
        pt: "Está tudo bem.",
        concepts: [
          "大丈夫 (daijoubu): tudo bem / sem problema,",
          "です: forma educada,"
        ]
      }
    ]
  }
];

const DEFAULT_STATE = {
  theme: "light",
  jpScale: 1,
  selectedTopicId: "konbini",
  studyMode: "normal",
  currentIndex: 0,
  sessionIndexes: [0, 1, 2],
  sessionStep: 0,
  todayKey: "",
  cyclesToday: 0,
  masteredCount: 0,
  streak: 0,
  lastOpenDate: "",
  lastPhraseJp: "",
  completedMap: {}
};

let state = loadState();

/* -------------------- DOM -------------------- */
const screens = {
  home: document.getElementById("screenHome"),
  topics: document.getElementById("screenTopics"),
  study: document.getElementById("screenStudy"),
  concepts: document.getElementById("screenConcepts"),
  progress: document.getElementById("screenProgress"),
  settings: document.getElementById("screenSettings")
};

const navButtons = Array.from(document.querySelectorAll(".nav-btn"));

const topicGrid = document.getElementById("topicsGrid");
const homeTopicsPreview = document.getElementById("homeTopicsPreview");

const statStreak = document.getElementById("statStreak");
const statCycles = document.getElementById("statCycles");
const statMastered = document.getElementById("statMastered");

const progressStreak = document.getElementById("progressStreak");
const progressCycles = document.getElementById("progressCycles");
const progressMastered = document.getElementById("progressMastered");

const summaryCurrentTopic = document.getElementById("summaryCurrentTopic");
const summaryLastPhrase = document.getElementById("summaryLastPhrase");
const summaryMode = document.getElementById("summaryMode");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const motivationText = document.getElementById("motivationText");

const studyTopicLabel = document.getElementById("studyTopicLabel");
const studyCycleLabel = document.getElementById("studyCycleLabel");
const studyStepLabel = document.getElementById("studyStepLabel");
const studyProgressFill = document.getElementById("studyProgressFill");
const jpText = document.getElementById("jpText");
const ptText = document.getElementById("ptText");
const sessionFeedback = document.getElementById("sessionFeedback");

const conceptJp = document.getElementById("conceptJp");
const conceptPt = document.getElementById("conceptPt");
const conceptList = document.getElementById("conceptList");

const toast = document.getElementById("toast");

const continueBtn = document.getElementById("continueBtn");
const quickTrainBtn = document.getElementById("quickTrainBtn");
const goTopicsBtn = document.getElementById("goTopicsBtn");

const nextBtn = document.getElementById("nextBtn");
const conceptBtn = document.getElementById("conceptBtn");
const speakBtn = document.getElementById("speakBtn");
const slowSpeakBtn = document.getElementById("slowSpeakBtn");
const conceptSpeakBtn = document.getElementById("conceptSpeakBtn");

const themeToggle = document.getElementById("themeToggle");
const settingsThemeBtn = document.getElementById("settingsThemeBtn");
const fontMinusBtn = document.getElementById("fontMinusBtn");
const fontPlusBtn = document.getElementById("fontPlusBtn");
const resetBtn = document.getElementById("resetBtn");

/* -------------------- Init -------------------- */
boot();

/* -------------------- Functions -------------------- */
function boot() {
  syncDailyState();
  applyTheme();
  applyFontScale();
  renderTopics();
  renderHomePreview();
  ensureValidSession();
  updateAllUI();
  bindEvents();
}

function bindEvents() {
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      openScreen(target);
    });
  });

  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.back;
      openScreen(target);
    });
  });

  continueBtn.addEventListener("click", () => {
    state.studyMode = "normal";
    createSessionFromCurrentTopic(false);
    saveState();
    updateAllUI();
    openScreen("study");
  });

  quickTrainBtn.addEventListener("click", () => {
    state.studyMode = "quick";
    createSessionFromCurrentTopic(true);
    saveState();
    updateAllUI();
    openScreen("study");
    speakCurrentPhrase({ rate: 0.82 });
  });

  goTopicsBtn.addEventListener("click", () => openScreen("topics"));

  nextBtn.addEventListener("click", handleNextPhrase);
  conceptBtn.addEventListener("click", () => {
    renderConcepts();
    openScreen("concepts");
  });

  speakBtn.addEventListener("click", () => speakCurrentPhrase({ rate: 0.95 }));
  slowSpeakBtn.addEventListener("click", () => speakCurrentPhrase({ rate: 0.72 }));
  conceptSpeakBtn.addEventListener("click", () => speakCurrentPhrase({ rate: 0.9 }));

  themeToggle.addEventListener("click", toggleTheme);
  settingsThemeBtn.addEventListener("click", toggleTheme);

  fontMinusBtn.addEventListener("click", () => changeFontScale(-0.08));
  fontPlusBtn.addEventListener("click", () => changeFontScale(0.08));

  resetBtn.addEventListener("click", () => {
    const confirmed = window.confirm("Tem certeza que deseja apagar seu progresso?");
    if (!confirmed) return;

    state = loadState(true);
    syncDailyState();
    applyTheme();
    applyFontScale();
    renderTopics();
    renderHomePreview();
    ensureValidSession();
    updateAllUI();
    showToast("Progresso resetado.");
  });
}

function openScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle("active", key === name);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === name);
  });

  if (name === "study") {
    renderStudy();
  }

  if (name === "concepts") {
    renderConcepts();
  }

  if (name === "progress") {
    renderProgressScreen();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTopics() {
  topicGrid.innerHTML = "";

  APP_DATA.forEach((topic) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "topic-card";
    btn.innerHTML = `
      <div class="topic-left">
        <div class="topic-emoji" aria-hidden="true">${topic.emoji}</div>
        <div class="topic-info">
          <strong>${escapeHTML(topic.title)}</strong>
          <span>${escapeHTML(topic.description)}</span>
        </div>
      </div>
      <div class="topic-arrow" aria-hidden="true">→</div>
    `;

    btn.addEventListener("click", () => {
      state.selectedTopicId = topic.id;
      state.studyMode = "normal";
      createSessionFromCurrentTopic(false);
      saveState();
      updateAllUI();
      openScreen("study");
    });

    topicGrid.appendChild(btn);
  });
}

function renderHomePreview() {
  homeTopicsPreview.innerHTML = "";

  APP_DATA.forEach((topic) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = `${topic.emoji} ${topic.title}`;
    chip.addEventListener("click", () => {
      state.selectedTopicId = topic.id;
      state.studyMode = "normal";
      createSessionFromCurrentTopic(false);
      saveState();
      updateAllUI();
      openScreen("study");
    });
    homeTopicsPreview.appendChild(chip);
  });
}

function renderStudy() {
  const topic = getCurrentTopic();
  const phrase = getCurrentPhrase();

  if (!topic || !phrase) return;

  studyTopicLabel.textContent =
    `${topic.emoji} ${topic.title} • ${state.studyMode === "quick" ? "Treino rápido" : "Modo normal"}`;

  const cycleNumber = Math.floor(state.currentIndex / 3) + 1;
  studyCycleLabel.textContent = `Ciclo ${cycleNumber}`;
  studyStepLabel.textContent = `${state.sessionStep + 1} / ${state.sessionIndexes.length}`;
  studyProgressFill.style.width = `${((state.sessionStep + 1) / state.sessionIndexes.length) * 100}%`;

  jpText.textContent = phrase.jp;
  ptText.textContent = phrase.pt;
}

function renderConcepts() {
  const phrase = getCurrentPhrase();
  if (!phrase) return;

  conceptJp.textContent = phrase.jp;
  conceptPt.textContent = phrase.pt;
  conceptList.innerHTML = "";

  phrase.concepts.forEach((item) => {
    const div = document.createElement("div");
    div.className = "concept-item";
    div.textContent = item;
    conceptList.appendChild(div);
  });
}

function renderProgressScreen() {
  progressStreak.textContent = `${state.streak} ${state.streak === 1 ? "dia" : "dias"}`;
  progressCycles.textContent = String(state.cyclesToday);
  progressMastered.textContent = String(state.masteredCount);

  const topic = getCurrentTopic();
  summaryCurrentTopic.textContent = topic ? topic.title : "Nenhum";
  summaryLastPhrase.textContent = state.lastPhraseJp || "Nenhuma";
  summaryMode.textContent = state.studyMode === "quick" ? "Treino rápido" : "Normal";
}

function updateAllUI() {
  updateHomeStats();
  updateHomeProgress();
  renderStudy();
  renderConcepts();
  renderProgressScreen();
  updateThemeButtons();
}

function updateHomeStats() {
  statStreak.textContent = `${state.streak} ${state.streak === 1 ? "dia" : "dias"}`;
  statCycles.textContent = String(state.cyclesToday);
  statMastered.textContent = String(state.masteredCount);
}

function updateHomeProgress() {
  progressText.textContent = `${Math.min(state.sessionStep, 3)} / 3 frases`;
  progressFill.style.width = `${(Math.min(state.sessionStep, 3) / 3) * 100}%`;

  const bar = progressFill.parentElement;
  if (bar) {
    bar.setAttribute("aria-valuenow", String(Math.min(state.sessionStep, 3)));
  }

  motivationText.textContent = getMotivationText();
}

function getMotivationText() {
  if (state.cyclesToday === 0) {
    return "Bora fazer só 1 ciclo. O difícil é começar.";
  }
  if (state.cyclesToday === 1) {
    return "Boa! Você já venceu a inércia de hoje.";
  }
  if (state.cyclesToday < 4) {
    return "Você está embalando. Continue nesse ritmo.";
  }
  return "Hoje você está voando baixo. Mandou bem.";
}

function handleNextPhrase() {
  const topic = getCurrentTopic();
  if (!topic) return;

  const phrase = getCurrentPhrase();
  if (!phrase) return;

  state.lastPhraseJp = phrase.jp;
  state.masteredCount += 1;
  state.sessionStep += 1;

  const topicMap = state.completedMap[state.selectedTopicId] || {};
  topicMap[phrase.jp] = (topicMap[phrase.jp] || 0) + 1;
  state.completedMap[state.selectedTopicId] = topicMap;

  const finishedCycle = state.sessionStep >= state.sessionIndexes.length;

  if (finishedCycle) {
    state.cyclesToday += 1;
    state.currentIndex += state.sessionIndexes.length;
    state.sessionStep = 0;
    createSessionFromCurrentTopic(state.studyMode === "quick");
    sessionFeedback.textContent = "🎉 Ciclo concluído!";
    showToast("Boa! Ciclo concluído.");
    pulseFeedback();

    if (state.studyMode === "quick") {
      openScreen("home");
    }
  } else {
    sessionFeedback.textContent = "✅ Boa! Próxima frase.";
    pulseFeedback();
  }

  saveState();
  updateAllUI();
}

function pulseFeedback() {
  sessionFeedback.animate(
    [
      { transform: "scale(0.98)", opacity: 0.4 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 220, easing: "ease-out" }
  );
}

function createSessionFromCurrentTopic(isQuickMode) {
  const topic = getCurrentTopic();
  if (!topic) return;

  const phraseCount = topic.phrases.length;
  const start = normalizeIndex(state.currentIndex, phraseCount);

  if (isQuickMode) {
    state.sessionIndexes = [start, (start + 1) % phraseCount];
  } else {
    state.sessionIndexes = [
      start,
      (start + 1) % phraseCount,
      (start + 2) % phraseCount
    ];
  }

  state.sessionStep = 0;
}

function ensureValidSession() {
  const topic = getCurrentTopic();
  if (!topic) {
    state.selectedTopicId = APP_DATA[0].id;
  }

  if (!Array.isArray(state.sessionIndexes) || state.sessionIndexes.length === 0) {
    createSessionFromCurrentTopic(false);
  }
}

function getCurrentTopic() {
  return APP_DATA.find((topic) => topic.id === state.selectedTopicId) || APP_DATA[0];
}

function getCurrentPhrase() {
  const topic = getCurrentTopic();
  if (!topic) return null;

  const phraseIndex = state.sessionIndexes[state.sessionStep] ?? 0;
  return topic.phrases[phraseIndex] || topic.phrases[0];
}

function normalizeIndex(index, total) {
  if (!Number.isFinite(index) || total <= 0) return 0;
  return ((index % total) + total) % total;
}

function speakCurrentPhrase({ rate = 0.95 } = {}) {
  const phrase = getCurrentPhrase();
  if (!phrase || !("speechSynthesis" in window)) {
    showToast("Áudio não disponível neste aparelho.");
    return;
  }

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(phrase.jp);
  utter.lang = "ja-JP";
  utter.rate = rate;
  utter.pitch = 1;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}

function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
  updateThemeButtons();
}

function updateThemeButtons() {
  const isDark = state.theme === "dark";
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function changeFontScale(delta) {
  state.jpScale = clamp((state.jpScale || 1) + delta, 0.86, 1.32);
  applyFontScale();
  saveState();
  showToast("Tamanho ajustado.");
}

function applyFontScale() {
  document.documentElement.style.setProperty("--jp-size", `clamp(${2 * state.jpScale}rem, ${5.8 * state.jpScale}vw, ${3.1 * state.jpScale}rem)`);
}

function syncDailyState() {
  const today = getTodayKey();

  if (!state.todayKey) {
    state.todayKey = today;
  }

  if (!state.lastOpenDate) {
    state.lastOpenDate = today;
    state.streak = 1;
  }

  if (state.todayKey !== today) {
    state.todayKey = today;
    state.cyclesToday = 0;
    state.sessionStep = 0;

    const yesterday = getRelativeDateKey(-1);
    if (state.lastOpenDate === yesterday) {
      state.streak += 1;
    } else if (state.lastOpenDate !== today) {
      state.streak = 1;
    }

    state.lastOpenDate = today;
    saveState();
  } else {
    state.lastOpenDate = today;
    saveState();
  }
}

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getRelativeDateKey(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function loadState(forceDefault = false) {
  if (forceDefault) {
    localStorage.removeItem(LS_KEY);
    return structuredCloneSafe(DEFAULT_STATE);
  }

  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredCloneSafe(DEFAULT_STATE);

    const parsed = JSON.parse(raw);
    return {
      ...structuredCloneSafe(DEFAULT_STATE),
      ...parsed
    };
  } catch {
    return structuredCloneSafe(DEFAULT_STATE);
  }
}

function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* silêncio intencional */
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}