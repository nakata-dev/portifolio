/* =========================
   Rastreador de Hábitos PRO
   - Semana (7 dias)
   - Check diário
   - Streak
   - Meta semanal
   - Timer por hábito
   - Stats
   - LocalStorage
========================= */

const LS_KEY = "habits_pro_v1";

const form = document.getElementById("habit-form");
const inputName = document.getElementById("new-habit-input");
const inputCategory = document.getElementById("category");
const inputMinutes = document.getElementById("minutes");
const inputWeeklyGoal = document.getElementById("weeklyGoal");

const habitList = document.getElementById("habit-list");
const weekBar = document.getElementById("weekBar");
const selectedDayLabel = document.getElementById("selectedDayLabel");

const filterCategory = document.getElementById("filterCategory");
const sortBy = document.getElementById("sortBy");

const statToday = document.getElementById("statToday");
const statWeekRate = document.getElementById("statWeekRate");
const statBestStreak = document.getElementById("statBestStreak");

const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");

// Modal timer
const timerModal = document.getElementById("timerModal");
const timerTitle = document.getElementById("timerTitle");
const timerSubtitle = document.getElementById("timerSubtitle");
const timerTime = document.getElementById("timerTime");
const timerHint = document.getElementById("timerHint");
const ring = document.getElementById("ring");

const timerStart = document.getElementById("timerStart");
const timerPause = document.getElementById("timerPause");
const timerReset = document.getElementById("timerReset");
const timerDone = document.getElementById("timerDone");
const closeModal = document.getElementById("closeModal");

const ding = document.getElementById("ding");

// Estado
let state = loadState();
let selectedDateKey = dateKey(new Date());
let weekDates = buildWeekDates(new Date()); // hoje + 6 dias

// Timer state
let activeTimerHabitId = null;
let timerTotal = 0;
let timerLeft = 0;
let timerInterval = null;
let timerRunning = false;

/* ---------- Utils ---------- */
function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function dateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

function dayName(d) {
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function prettyDate(d) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/* ---------- Storage ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { habits: [] };
    const parsed = JSON.parse(raw);
    if (!parsed.habits) parsed.habits = [];
    return parsed;
  } catch {
    return { habits: [] };
  }
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/* ---------- Week bar ---------- */
function buildWeekDates(fromDate) {
  // 7 dias começando hoje
  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    arr.push(d);
  }
  return arr;
}

function renderWeekBar() {
  weekBar.innerHTML = "";

  weekDates.forEach(d => {
    const key = dateKey(d);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "daybtn" + (key === selectedDateKey ? " active" : "");
    btn.innerHTML = `
      <div class="dow">${dayName(d)}</div>
      <div class="dnum">${String(d.getDate()).padStart(2,"0")}</div>
    `;

    btn.addEventListener("click", () => {
      selectedDateKey = key;
      selectedDayLabel.textContent = sameDay(d, new Date()) ? "Hoje" : prettyDate(d);
      renderWeekBar();
      renderHabits();
      renderStats();
    });

    weekBar.appendChild(btn);
  });

  const selectedDateObj = weekDates.find(x => dateKey(x) === selectedDateKey) || new Date();
  selectedDayLabel.textContent = sameDay(selectedDateObj, new Date()) ? "Hoje" : prettyDate(selectedDateObj);
}

/* ---------- Habit helpers ---------- */
function ensureHabitDefaults(h) {
  if (!h.completions) h.completions = {};      // { 'YYYY-MM-DD': true }
  if (!h.totalDone) h.totalDone = 0;
  if (!h.bestStreak) h.bestStreak = 0;
  if (!h.createdAt) h.createdAt = Date.now();
  return h;
}

function isDoneOn(habit, dateKeyStr) {
  return !!habit.completions?.[dateKeyStr];
}

function setDoneOn(habit, dateKeyStr, value) {
  habit.completions = habit.completions || {};
  const was = !!habit.completions[dateKeyStr];

  if (value) habit.completions[dateKeyStr] = true;
  else delete habit.completions[dateKeyStr];

  // Ajusta totalDone (contagem total)
  if (!was && value) habit.totalDone = (habit.totalDone || 0) + 1;
  if (was && !value) habit.totalDone = Math.max(0, (habit.totalDone || 0) - 1);

  // Recalcula streak/bestStreak com base no histórico
  recalcStreaks(habit);
}

function recalcStreaks(habit) {
  const keys = Object.keys(habit.completions || {}).sort(); // crescente
  if (keys.length === 0) {
    habit.streak = 0;
    habit.bestStreak = habit.bestStreak || 0;
    return;
  }

  // Streak atual: conta dias consecutivos até hoje (ou até o último dia marcado)
  let current = 0;
  let best = habit.bestStreak || 0;

  // Para best streak, vamos varrer dias consecutivos
  let run = 0;
  for (let i = 0; i < keys.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(keys[i - 1]);
      const cur = new Date(keys[i]);
      prev.setDate(prev.getDate() + 1);
      if (dateKey(prev) === dateKey(cur)) run++;
      else run = 1;
    }
    best = Math.max(best, run);
  }

  // Streak “atual”: só conta se inclui hoje ou ontem→hoje em sequência
  const today = new Date();
  const todayKey = dateKey(today);
  const y = new Date(today); y.setDate(y.getDate() - 1);
  const yesterdayKey = dateKey(y);

  if (habit.completions[todayKey]) {
    // conta para trás começando de hoje
    current = 1;
    let cursor = new Date(todayKey);
    while (true) {
      cursor.setDate(cursor.getDate() - 1);
      const k = dateKey(cursor);
      if (habit.completions[k]) current++;
      else break;
    }
  } else if (habit.completions[yesterdayKey]) {
    // streak “parado” em ontem
    current = 1;
    let cursor = new Date(yesterdayKey);
    while (true) {
      cursor.setDate(cursor.getDate() - 1);
      const k = dateKey(cursor);
      if (habit.completions[k]) current++;
      else break;
    }
  } else {
    current = 0;
  }

  habit.streak = current;
  habit.bestStreak = best;
}

function weeklyProgress(habit, weekStartDate) {
  // Conta quantos dias marcados nos últimos 7 dias (a partir do weekStartDate)
  const start = new Date(weekStartDate);
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    keys.push(dateKey(d));
  }
  const done = keys.filter(k => isDoneOn(habit, k)).length;
  const goal = Number(habit.weeklyGoal || 5);
  const ratio = goal === 0 ? 0 : clamp(done / goal, 0, 1);
  return { done, goal, ratio };
}

/* ---------- Render ---------- */
function renderCategoryOptions() {
  const categories = Array.from(new Set(state.habits.map(h => h.category))).filter(Boolean);
  filterCategory.innerHTML = `<option value="all">Todas categorias</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterCategory.appendChild(opt);
  });
}

function applyFiltersAndSort(habits) {
  let list = habits.slice();

  const cat = filterCategory.value;
  if (cat !== "all") list = list.filter(h => h.category === cat);

  const sort = sortBy.value;
  if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === "streak") list.sort((a,b) => (b.streak||0) - (a.streak||0));
  if (sort === "weekly") {
    const base = weekDates[0];
    list.sort((a,b) => weeklyProgress(b, base).ratio - weeklyProgress(a, base).ratio);
  }
  if (sort === "created") list.sort((a,b) => (a.createdAt||0) - (b.createdAt||0));

  return list;
}

function renderHabits() {
  habitList.innerHTML = "";
  renderCategoryOptions();

  state.habits = state.habits.map(ensureHabitDefaults);

  const visible = applyFiltersAndSort(state.habits);

  if (visible.length === 0) {
    const empty = document.createElement("div");
    empty.className = "tip";
    empty.textContent = "Sem hábitos ainda. Adicione um hábito para começar.";
    habitList.appendChild(empty);
    return;
  }

  const weekStart = weekDates[0];

  visible.forEach(habit => {
    const doneToday = isDoneOn(habit, selectedDateKey);
    const { done, goal, ratio } = weeklyProgress(habit, weekStart);

    const li = document.createElement("li");
    li.className = "habit";

    li.innerHTML = `
      <div>
        <div class="habit-top">
          <div class="habit-title">
            <strong>${escapeHtml(habit.name)}</strong>
            <div class="badges">
              <span class="badge">📌 ${escapeHtml(habit.category || "Outro")}</span>
              <span class="badge">⏱️ ${habit.minutes || 20} min</span>
              <span class="badge">🔥 streak: ${habit.streak || 0}</span>
              <span class="badge">✅ total: ${habit.totalDone || 0}</span>
            </div>
          </div>
        </div>

        <div class="progress">
          <div class="bar" aria-label="Progresso semanal">
            <div style="width:${Math.round(ratio*100)}%"></div>
          </div>
          <div class="muted small">${done}/${goal} semana</div>
        </div>
      </div>

      <div class="habit-actions">
        <button class="check-btn ${doneToday ? "done" : ""}" type="button">
          ${doneToday ? "Feito ✅" : "Marcar"}
        </button>
        <button class="icon-btn" type="button" title="Abrir timer">⏳</button>
        <button class="icon-btn" type="button" title="Editar">✏️</button>
        <button class="icon-btn" type="button" title="Excluir">🗑️</button>
      </div>
    `;

    const [checkBtn, timerBtn, editBtn, delBtn] = li.querySelectorAll("button");

    checkBtn.addEventListener("click", () => {
      setDoneOn(habit, selectedDateKey, !doneToday);
      saveState();
      renderHabits();
      renderStats();
    });

    timerBtn.addEventListener("click", () => openTimer(habit.id));

    editBtn.addEventListener("click", () => editHabit(habit.id));

    delBtn.addEventListener("click", () => deleteHabit(habit.id));

    habitList.appendChild(li);
  });
}

function renderStats() {
  const habits = state.habits.map(ensureHabitDefaults);

  // Concluídos no dia selecionado
  const todayDone = habits.filter(h => isDoneOn(h, selectedDateKey)).length;
  statToday.textContent = todayDone;

  // Taxa semanal: total de checks / total de metas (somatório)
  const weekStart = weekDates[0];
  let sumDone = 0;
  let sumGoal = 0;
  let bestStreak = 0;

  habits.forEach(h => {
    const wp = weeklyProgress(h, weekStart);
    sumDone += wp.done;
    sumGoal += wp.goal;
    bestStreak = Math.max(bestStreak, h.bestStreak || 0);
  });

  const rate = sumGoal === 0 ? 0 : Math.round((sumDone / sumGoal) * 100);
  statWeekRate.textContent = `${rate}%`;
  statBestStreak.textContent = bestStreak;
}

/* ---------- CRUD ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = inputName.value.trim();
  if (!name) return;

  const habit = ensureHabitDefaults({
    id: uid(),
    name,
    category: inputCategory.value,
    minutes: Number(inputMinutes.value || 20),
    weeklyGoal: Number(inputWeeklyGoal.value || 5),
    completions: {},
    totalDone: 0,
    streak: 0,
    bestStreak: 0,
    createdAt: Date.now(),
  });

  state.habits.push(habit);
  saveState();

  inputName.value = "";
  inputMinutes.value = 20;
  inputWeeklyGoal.value = 5;

  renderHabits();
  renderStats();
});

function deleteHabit(id) {
  const idx = state.habits.findIndex(h => h.id === id);
  if (idx === -1) return;
  const ok = confirm("Excluir este hábito? Essa ação não pode ser desfeita.");
  if (!ok) return;

  state.habits.splice(idx, 1);
  saveState();
  renderHabits();
  renderStats();
}

function editHabit(id) {
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;

  const newName = prompt("Editar nome do hábito:", habit.name);
  if (newName === null) return;

  const clean = newName.trim();
  if (!clean) return alert("Nome inválido.");

  habit.name = clean;

  const newMin = prompt("Minutos (timer):", String(habit.minutes || 20));
  if (newMin !== null) {
    const n = Number(newMin);
    if (!Number.isFinite(n) || n < 1) alert("Minutos inválidos. Mantive o valor anterior.");
    else habit.minutes = Math.round(n);
  }

  const newGoal = prompt("Meta semanal (3 a 7):", String(habit.weeklyGoal || 5));
  if (newGoal !== null) {
    const g = Number(newGoal);
    if (!Number.isFinite(g) || g < 1 || g > 7) alert("Meta inválida. Mantive o valor anterior.");
    else habit.weeklyGoal = Math.round(g);
  }

  saveState();
  renderHabits();
  renderStats();
}

/* ---------- Filters ---------- */
filterCategory.addEventListener("change", () => {
  renderHabits();
  renderStats();
});

sortBy.addEventListener("change", () => {
  renderHabits();
});

/* ---------- Export / Reset ---------- */
exportBtn.addEventListener("click", () => {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "habitos-export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", () => {
  const ok = confirm("Resetar tudo? Isso apaga seus hábitos e histórico.");
  if (!ok) return;
  state = { habits: [] };
  saveState();
  renderHabits();
  renderStats();
});

/* ---------- Timer Modal ---------- */
function openTimer(habitId) {
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  activeTimerHabitId = habitId;

  // define tempo
  timerTotal = (habit.minutes || 20) * 60;
  timerLeft = timerTotal;

  // UI
  timerTitle.textContent = `Timer: ${habit.name}`;
  timerSubtitle.textContent = `${habit.minutes || 20} minutos de prática`;
  timerHint.textContent = "Deixe o celular de lado e faça só isso.";
  timerTime.textContent = formatTime(timerLeft);
  updateRing();

  // reset estado
  stopTimerInterval();
  timerRunning = false;
  timerStart.style.display = "inline-flex";
  timerPause.style.display = "none";

  timerModal.showModal();
}

function updateRing() {
  const elapsed = timerTotal - timerLeft;
  const ratio = timerTotal === 0 ? 0 : (elapsed / timerTotal);
  const deg = clamp(ratio * 360, 0, 360);
  ring.style.background = `conic-gradient(var(--primary) ${deg}deg, rgba(255,255,255,.10) ${deg}deg)`;
}

function stopTimerInterval() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerStart.style.display = "none";
  timerPause.style.display = "inline-flex";

  timerInterval = setInterval(() => {
    if (timerLeft > 0) {
      timerLeft--;
      timerTime.textContent = formatTime(timerLeft);
      updateRing();
    } else {
      stopTimerInterval();
      timerRunning = false;
      timerStart.style.display = "inline-flex";
      timerPause.style.display = "none";
      ding.currentTime = 0;
      ding.play().catch(() => {});
      timerHint.textContent = "Tempo concluído. Quer marcar como feito?";
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  stopTimerInterval();
  timerStart.style.display = "inline-flex";
  timerPause.style.display = "none";
  timerHint.textContent = "Pausado. Volte quando estiver pronto.";
}

function resetTimer() {
  stopTimerInterval();
  timerRunning = false;
  timerLeft = timerTotal;
  timerTime.textContent = formatTime(timerLeft);
  updateRing();
  timerStart.style.display = "inline-flex";
  timerPause.style.display = "none";
  timerHint.textContent = "Recomeçar é uma habilidade.";
}

function completeHabitFromTimer() {
  const habit = state.habits.find(h => h.id === activeTimerHabitId);
  if (!habit) return;

  // Marca como feito no dia selecionado
  const already = isDoneOn(habit, selectedDateKey);
  if (!already) setDoneOn(habit, selectedDateKey, true);

  saveState();
  renderHabits();
  renderStats();

  ding.currentTime = 0;
  ding.play().catch(() => {});
  timerModal.close();
}

timerStart.addEventListener("click", startTimer);
timerPause.addEventListener("click", pauseTimer);
timerReset.addEventListener("click", resetTimer);
timerDone.addEventListener("click", completeHabitFromTimer);
closeModal.addEventListener("click", () => timerModal.close());

timerModal.addEventListener("close", () => {
  stopTimerInterval();
  timerRunning = false;
});

/* ---------- Security-ish (escape) ---------- */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Init ---------- */
(function init(){
  // Se não houver hábito, cria exemplos (bom para portfólio)
  if (state.habits.length === 0) {
    state.habits = [
      ensureHabitDefaults({ id: uid(), name:"Leitura", category:"Estudos", minutes:20, weeklyGoal:5, completions:{}, totalDone:0, streak:0, bestStreak:0, createdAt: Date.now() }),
      ensureHabitDefaults({ id: uid(), name:"Exercício físico", category:"Saúde", minutes:30, weeklyGoal:4, completions:{}, totalDone:0, streak:0, bestStreak:0, createdAt: Date.now()+1 }),
      ensureHabitDefaults({ id: uid(), name:"Meditação", category:"Mente", minutes:10, weeklyGoal:6, completions:{}, totalDone:0, streak:0, bestStreak:0, createdAt: Date.now()+2 }),
    ];
    saveState();
  }

  renderWeekBar();
  renderHabits();
  renderStats();
})();
