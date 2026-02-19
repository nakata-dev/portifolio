(() => {
  "use strict";

  const MAX_PIP = 6;
  const HAND_SIZE = 7;
  const STORAGE_KEYS = {
    tutorialDone: "domino:tutorialDone:v1",
    soundOn: "domino:soundOn:v1",
  };

  const $ = (sel, root = document) => root.querySelector(sel);

  const turnLabel = $("#turnLabel");
  const messageEl = $("#message");
  const endsValue = $("#endsValue");
  const boneyardCountEl = $("#boneyardCount");
  const aiCountEl = $("#aiCount");
  const drawBtn = $("#drawBtn");
  const restartBtn = $("#restartBtn");
  const helpBtn = $("#helpBtn");

  const board = $("#board");
  const handScroller = $("#handScroller");

  const leftEndCap = $("#leftEndCap");
  const rightEndCap = $("#rightEndCap");
  const leftEndChip = $("#leftEndChip");
  const rightEndChip = $("#rightEndChip");

  const sidePicker = $("#sidePicker");
  const playLeftBtn = $("#playLeftBtn");
  const playRightBtn = $("#playRightBtn");
  const cancelPickBtn = $("#cancelPickBtn");
  const sidePickerSub = $("#sidePickerSub");

  const tutorialModal = $("#tutorialModal");
  const skipTutorialBtn = $("#skipTutorialBtn");
  const nextTutorialBtn = $("#nextTutorialBtn");

  const helpModal = $("#helpModal");

  const resultModal = $("#resultModal");
  const resultBig = $("#resultBig");
  const resultSmall = $("#resultSmall");
  const playAgainBtn = $("#playAgainBtn");

  const soundToggle = $("#soundToggle");
  const soundState = $("#soundState");

  let audioCtx = null;
  let soundEnabled = false;
  let audioUnlocked = false;

  let selectedTileId = null;
  let pendingMove = null; // {tile, sides}
  let uiLocked = false;

  const state = {
    human: [],
    ai: [],
    table: [],
    boneyard: [],
    leftEnd: null,
    rightEnd: null,
    turn: "H",
    seenCounts: Array.from({ length: MAX_PIP + 1 }, () => 0),
    history: [],
    roundOver: false,
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function tileId(a, b, idx) {
    return `${a}-${b}-${idx}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function tileSum(t) { return t.a + t.b; }
  function isDouble(t) { return t.a === t.b; }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setMessage(text) { messageEl.textContent = text; }

  function setTurnLabel() {
    turnLabel.textContent = state.turn === "H" ? "Sua vez" : "Vez da IA";
  }

  function lockUI(locked) {
    uiLocked = locked;
    drawBtn.disabled = locked || state.roundOver || state.turn !== "H" || !shouldAllowDraw();
    handScroller.setAttribute("aria-busy", locked ? "true" : "false");
  }

  function shouldAllowDraw() {
    if (state.boneyard.length === 0) return false;
    if (state.turn !== "H") return false;
    const playable = getPlayableMoves(state.human, state.leftEnd, state.rightEnd);
    return playable.length === 0;
  }

  function saveSoundPref(on) {
    try { localStorage.setItem(STORAGE_KEYS.soundOn, on ? "1" : "0"); } catch {}
  }
  function loadSoundPref() {
    try { return localStorage.getItem(STORAGE_KEYS.soundOn) === "1"; } catch { return false; }
  }

  function saveTutorialDone() {
    try { localStorage.setItem(STORAGE_KEYS.tutorialDone, "1"); } catch {}
  }
  function loadTutorialDone() {
    try { return localStorage.getItem(STORAGE_KEYS.tutorialDone) === "1"; } catch { return false; }
  }

  function openModal(modalEl) {
    modalEl.hidden = false;
    modalEl.setAttribute("aria-hidden", "false");
    const focusable = modalEl.querySelector("button, [href], input, [tabindex]:not([tabindex='-1'])");
    if (focusable) focusable.focus({ preventScroll: true });
  }

  function closeModal(modalEl) {
    modalEl.hidden = true;
    modalEl.setAttribute("aria-hidden", "true");
  }

  function attachModalClose(modalEl, key) {
    modalEl.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === key) closeModal(modalEl);
      if (t && t.classList && t.classList.contains("modal__backdrop") && t.getAttribute("data-close") === key) closeModal(modalEl);
    });
    modalEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal(modalEl);
    });
  }

  /* =========================
     Core required functions
  ========================= */
  function canPlay(tile, leftEnd, rightEnd) {
    if (leftEnd == null || rightEnd == null) return true;
    return tile.a === leftEnd || tile.b === leftEnd || tile.a === rightEnd || tile.b === rightEnd;
  }

  function getPlayableMoves(hand, leftEnd, rightEnd) {
    const moves = [];
    for (const tile of hand) {
      const sides = [];
      if (leftEnd == null || rightEnd == null) {
        sides.push("L");
      } else {
        if (tile.a === leftEnd || tile.b === leftEnd) sides.push("L");
        if (tile.a === rightEnd || tile.b === rightEnd) sides.push("R");
      }
      if (sides.length) moves.push({ tile, sides });
    }
    return moves;
  }

  function applyMove(st, move, who) {
    const { tile, side } = move;

    const hand = who === "H" ? st.human : st.ai;
    const idx = hand.findIndex((t) => t.id === tile.id);
    if (idx >= 0) hand.splice(idx, 1);

    let placed = { a: tile.a, b: tile.b };

    if (st.leftEnd == null || st.rightEnd == null || st.table.length === 0) {
      st.table.push(placed);
      st.leftEnd = placed.a;
      st.rightEnd = placed.b;
    } else if (side === "L") {
      if (tile.a === st.leftEnd) placed = { a: tile.b, b: tile.a };
      else if (tile.b === st.leftEnd) placed = { a: tile.a, b: tile.b };
      else throw new Error("Jogada inválida (esquerda).");
      st.table.unshift(placed);
      st.leftEnd = placed.a;
    } else {
      if (tile.a === st.rightEnd) placed = { a: tile.a, b: tile.b };
      else if (tile.b === st.rightEnd) placed = { a: tile.b, b: tile.a };
      else throw new Error("Jogada inválida (direita).");
      st.table.push(placed);
      st.rightEnd = placed.b;
    }

    st.seenCounts[placed.a] += 1;
    st.seenCounts[placed.b] += 1;

    st.history.push(`${who === "H" ? "Você" : "IA"} jogou ${placed.a}|${placed.b} (${side})`);
  }

  function drawFromBoneyard(st) {
    if (st.boneyard.length === 0) return null;
    return st.boneyard.pop() || null;
  }

  function checkEndConditions(st) {
    if (st.human.length === 0) return { over: true, reason: "Você zerou a mão.", winner: "H" };
    if (st.ai.length === 0) return { over: true, reason: "A IA zerou a mão.", winner: "A" };

    const noDraw = st.boneyard.length === 0;
    if (!noDraw) return { over: false };

    const hMoves = getPlayableMoves(st.human, st.leftEnd, st.rightEnd).length;
    const aMoves = getPlayableMoves(st.ai, st.leftEnd, st.rightEnd).length;
    if (hMoves === 0 && aMoves === 0) {
      const hSum = st.human.reduce((acc, t) => acc + tileSum(t), 0);
      const aSum = st.ai.reduce((acc, t) => acc + tileSum(t), 0);
      if (hSum < aSum) return { over: true, reason: "Trava! Menor soma vence.", winner: "H", details: `Sua soma: ${hSum}. Soma da IA: ${aSum}.` };
      if (aSum < hSum) return { over: true, reason: "Trava! Menor soma vence.", winner: "A", details: `Sua soma: ${hSum}. Soma da IA: ${aSum}.` };
      return { over: true, reason: "Trava! Empate de soma.", winner: "TIE", details: `Sua soma: ${hSum}. Soma da IA: ${aSum}.` };
    }

    return { over: false };
  }

  /* =========================
     Setup / dealing
  ========================= */
  function buildSet() {
    const tiles = [];
    let idx = 0;
    for (let a = 0; a <= MAX_PIP; a++) {
      for (let b = a; b <= MAX_PIP; b++) {
        tiles.push({ a, b, id: tileId(a, b, idx++) });
      }
    }
    return tiles;
  }

  function bestDouble(hand) {
    let best = null;
    for (const t of hand) {
      if (!isDouble(t)) continue;
      if (!best || t.a > best.a) best = t;
    }
    return best;
  }

  function maxSumTile(hand) {
    let best = hand[0];
    for (const t of hand) if (tileSum(t) > tileSum(best)) best = t;
    return best;
  }

  function decideStarter(humanHand, aiHand) {
    const hBestDouble = bestDouble(humanHand);
    const aBestDouble = bestDouble(aiHand);

    if (hBestDouble || aBestDouble) {
      const hVal = hBestDouble ? hBestDouble.a : -1;
      const aVal = aBestDouble ? aBestDouble.a : -1;
      if (hVal > aVal) return { who: "H", tile: hBestDouble };
      if (aVal > hVal) return { who: "A", tile: aBestDouble };
      return { who: "H", tile: hBestDouble || aBestDouble };
    }

    const hMax = maxSumTile(humanHand);
    const aMax = maxSumTile(aiHand);
    if (tileSum(hMax) > tileSum(aMax)) return { who: "H", tile: hMax };
    if (tileSum(aMax) > tileSum(hMax)) return { who: "A", tile: aMax };
    return { who: "H", tile: hMax };
  }

  function dealNewRound() {
    state.human = [];
    state.ai = [];
    state.table = [];
    state.boneyard = [];
    state.leftEnd = null;
    state.rightEnd = null;
    state.turn = "H";
    state.history = [];
    state.roundOver = false;
    state.seenCounts = Array.from({ length: MAX_PIP + 1 }, () => 0);

    selectedTileId = null;
    pendingMove = null;
    hideSidePicker();
    clearEndHighlights();

    const deck = shuffle(buildSet());
    state.human = deck.splice(0, HAND_SIZE);
    state.ai = deck.splice(0, HAND_SIZE);
    state.boneyard = deck;

    const starter = decideStarter(state.human, state.ai);
    state.turn = starter.who;

    const startMove = { side: "L", tile: starter.tile };
    applyMove(state, startMove, starter.who);

    state.turn = starter.who === "H" ? "A" : "H";
  }

  /* =========================
     Rendering
  ========================= */
  function renderAll() {
    setTurnLabel();
    renderMeta();
    renderEnds();
    renderBoard();
    renderHand();
    updateDrawButton();
  }

  function renderMeta() {
    boneyardCountEl.textContent = String(state.boneyard.length);
    aiCountEl.textContent = String(state.ai.length);
  }

  function renderEnds() {
    if (state.leftEnd == null || state.rightEnd == null) {
      endsValue.textContent = "—";
      leftEndChip.textContent = "—";
      rightEndChip.textContent = "—";
      return;
    }
    endsValue.textContent = `${state.leftEnd} e ${state.rightEnd}`;
    leftEndChip.textContent = String(state.leftEnd);
    rightEndChip.textContent = String(state.rightEnd);
  }

  function tileElement(t, isTable) {
    const wrap = document.createElement("div");
    wrap.className = `tile ${isTable ? "tile--table" : ""}`.trim();

    const top = document.createElement("div");
    top.className = "tile__half";
    top.textContent = String(t.a);

    const bottom = document.createElement("div");
    bottom.className = "tile__half";
    bottom.textContent = String(t.b);

    const mini = document.createElement("div");
    mini.className = "tile__mini";
    mini.textContent = `${t.a}|${t.b}`;
    mini.setAttribute("aria-hidden", "true");

    wrap.appendChild(top);
    wrap.appendChild(bottom);
    wrap.appendChild(mini);
    return wrap;
  }

  function renderBoard() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < state.table.length; i++) {
      const t = state.table[i];
      const el = tileElement(t, true);
      el.setAttribute("role", "listitem");
      frag.appendChild(el);
    }
    board.replaceChildren(frag);

    const atRightEdge = board.scrollLeft + board.clientWidth >= board.scrollWidth - 50;
    if (atRightEdge) board.scrollLeft = board.scrollWidth;
  }

  function renderHand() {
    const moves = getPlayableMoves(state.human, state.leftEnd, state.rightEnd);
    const playableIds = new Set(moves.map((m) => m.tile.id));

    const frag = document.createDocumentFragment();
    for (const t of state.human) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tilebtn";
      btn.dataset.tileId = t.id;

      const playable = playableIds.has(t.id);
      const disabled = (!playable || state.turn !== "H" || state.roundOver || uiLocked);

      if (disabled) btn.classList.add("is-disabled");
      if (selectedTileId === t.id) btn.classList.add("is-selected");

      btn.setAttribute("aria-label", `Peça ${t.a} e ${t.b}${playable ? ", jogável" : ", não jogável"}`);
      btn.disabled = disabled;

      btn.appendChild(tileElement(t, false));
      frag.appendChild(btn);
    }
    handScroller.replaceChildren(frag);
  }

  function updateDrawButton() {
    drawBtn.disabled = uiLocked || state.roundOver || state.turn !== "H" || !shouldAllowDraw();
  }

  /* =========================
     End highlights + picker
  ========================= */
  function clearEndHighlights() {
    leftEndCap.classList.remove("is-active", "is-pulsing");
    rightEndCap.classList.remove("is-active", "is-pulsing");
  }

  function highlightEndsForTile(tile) {
    clearEndHighlights();
    if (state.leftEnd == null || state.rightEnd == null) return;

    const canL = tile.a === state.leftEnd || tile.b === state.leftEnd;
    const canR = tile.a === state.rightEnd || tile.b === state.rightEnd;

    if (canL) leftEndCap.classList.add("is-active", "is-pulsing");
    if (canR) rightEndCap.classList.add("is-active", "is-pulsing");
  }

  function hideSidePicker() {
    sidePicker.hidden = true;
    pendingMove = null;
  }

  function showSidePicker(tile, sides) {
    pendingMove = { tile, sides };
    const txt = sides.length === 2
      ? "Esta peça serve nas duas pontas."
      : `Esta peça serve na ponta ${sides[0] === "L" ? "Esquerda" : "Direita"}.`;
    sidePickerSub.textContent = txt;

    playLeftBtn.disabled = !sides.includes("L");
    playRightBtn.disabled = !sides.includes("R");

    sidePicker.hidden = false;

    const focusTarget = sides.includes("L") ? playLeftBtn : playRightBtn;
    focusTarget.focus({ preventScroll: true });
  }

  /* =========================
     Turn flow
  ========================= */
  function wait(ms) { return new Promise((res) => setTimeout(res, ms)); }

  async function runAITurn() {
    if (state.roundOver) return;

    setTurnLabel();
    setMessage("Vez da IA…");
    lockUI(true);
    hideSidePicker();
    clearEndHighlights();

    await wait(220);

    let move = chooseAIMove();
    if (!move) {
      if (state.boneyard.length > 0) {
        setMessage("IA sem jogadas, comprando…");
        playSound("draw");
        await wait(200);

        const drawn = drawFromBoneyard(state);
        if (drawn) state.ai.push(drawn);

        renderMeta();
        await wait(160);
        move = chooseAIMove();
      }
    }

    if (move) {
      try {
        applyMove(state, move, "A");
        playSound("place");
        setMessage("IA jogou. Sua vez.");
      } catch (e) {
        console.error(e);
        setMessage("IA teve um erro ao jogar. Sua vez.");
      }
    } else {
      setMessage("IA passou.");
      playSound("pass");
    }

    const end = checkEndConditions(state);
    if (end.over) {
      endRound(end);
      lockUI(false);
      return;
    }

    state.turn = "H";
    lockUI(false);
    selectedTileId = null;
    hideSidePicker();
    clearEndHighlights();
    renderAll();
    autoPromptDrawIfNeeded();
  }

  function endRound(end) {
    state.roundOver = true;
    renderAll();
    updateDrawButton();
    clearEndHighlights();
    hideSidePicker();

    let big = "Rodada encerrada.";
    if (end.winner === "H") big = "Você venceu! 🎉";
    if (end.winner === "A") big = "A IA venceu.";
    if (end.winner === "TIE") big = "Empate.";

    resultBig.textContent = big;
    const reason = end.reason ? end.reason : "";
    const det = end.details ? ` ${end.details}` : "";
    resultSmall.textContent = `${reason}${det}`.trim();

    playSound(end.winner === "H" ? "win" : end.winner === "A" ? "lose" : "tie");
    openModal(resultModal);
  }

  function autoPromptDrawIfNeeded() {
    const playable = getPlayableMoves(state.human, state.leftEnd, state.rightEnd);
    if (state.turn === "H" && playable.length === 0) {
      setMessage(state.boneyard.length ? "Sem jogadas. Toque em Comprar." : "Sem jogadas e o monte acabou. Vai travar se a IA também não jogar.");
    }
    updateDrawButton();
  }

  function startGame() {
    dealNewRound();
    renderAll();

    setMessage("Começou! Encaixe números iguais nas pontas.");
    playSound("start");

    if (state.turn === "A") runAITurn();
    else autoPromptDrawIfNeeded();
  }

  /* =========================
     Human interactions
  ========================= */
  function onTileClick(id) {
    if (uiLocked || state.roundOver || state.turn !== "H") return;

    const tile = state.human.find((t) => t.id === id);
    if (!tile) return;

    selectedTileId = id;

    const moves = getPlayableMoves([tile], state.leftEnd, state.rightEnd);
    if (!moves.length) {
      clearEndHighlights();
      setMessage("Essa peça não encaixa agora.");
      renderHand();
      return;
    }

    const sides = moves[0].sides;
    highlightEndsForTile(tile);

    if (sides.length === 1) {
      humanPlay(tile, sides[0]);
    } else {
      showSidePicker(tile, sides);
      renderHand();
      setMessage("Escolha Esquerda ou Direita para encaixar.");
    }
  }

  function humanPlay(tile, side) {
    if (uiLocked || state.roundOver || state.turn !== "H") return;

    hideSidePicker();
    lockUI(true);

    const sides = getPlayableMoves([tile], state.leftEnd, state.rightEnd)[0]?.sides || [];
    if (!sides.includes(side)) {
      lockUI(false);
      setMessage("Jogada inválida. Tente outra peça.");
      playSound("error");
      clearEndHighlights();
      renderAll();
      return;
    }

    try {
      applyMove(state, { tile, side }, "H");
      playSound("place");
      setMessage("Boa! Agora é a vez da IA.");
    } catch (e) {
      console.error(e);
      lockUI(false);
      setMessage("Ops, algo deu errado nessa jogada. Tente novamente.");
      playSound("error");
      renderAll();
      return;
    }

    selectedTileId = null;
    clearEndHighlights();

    const end = checkEndConditions(state);
    if (end.over) {
      lockUI(false);
      endRound(end);
      return;
    }

    state.turn = "A";
    renderAll();
    runAITurn();
  }

  function onDrawClick() {
    if (uiLocked || state.roundOver || state.turn !== "H") return;
    if (!shouldAllowDraw()) return;

    lockUI(true);
    setMessage("Sem jogadas, comprando…");
    playSound("draw");

    const drawn = drawFromBoneyard(state);
    if (!drawn) {
      lockUI(false);
      setMessage("Monte vazio. Se ninguém jogar, trava.");
      renderAll();
      return;
    }

    state.human.push(drawn);
    renderMeta();
    renderHand();

    const justPlayable = getPlayableMoves([drawn], state.leftEnd, state.rightEnd);
    const playable = getPlayableMoves(state.human, state.leftEnd, state.rightEnd);

    if (justPlayable.length) {
      lockUI(false);
      setMessage("Você comprou e pode jogar na mesma vez. Toque na peça nova.");
      handScroller.scrollLeft = handScroller.scrollWidth;
      updateDrawButton();
      return;
    }

    if (playable.length === 0) {
      setMessage("Ainda sem jogadas. Você passou.");
      playSound("pass");

      const end = checkEndConditions(state);
      if (end.over) {
        lockUI(false);
        endRound(end);
        return;
      }

      state.turn = "A";
      renderAll();
      runAITurn();
      return;
    }

    lockUI(false);
    setMessage("Agora você tem jogadas. Toque numa peça.");
    updateDrawButton();
  }

  /* =========================
     AI logic
  ========================= */
  function chooseAIMove() {
    const moves = getPlayableMoves(state.ai, state.leftEnd, state.rightEnd);
    if (moves.length === 0) return null;

    const expanded = [];
    for (const m of moves) {
      if (state.leftEnd == null || state.rightEnd == null) {
        expanded.push({ tile: m.tile, side: "L", placed: { a: m.tile.a, b: m.tile.b } });
      } else {
        for (const side of m.sides) {
          const placed = previewPlaced(m.tile, side);
          if (placed) expanded.push({ tile: m.tile, side, placed });
        }
      }
    }
    if (!expanded.length) return null;

    let best = expanded[0];
    let bestScore = -Infinity;
    for (const mv of expanded) {
      const score = scoreAIMove(mv);
      if (score > bestScore) {
        bestScore = score;
        best = mv;
      }
    }
    return { tile: best.tile, side: best.side };
  }

  function previewPlaced(tile, side) {
    if (state.leftEnd == null || state.rightEnd == null) return { a: tile.a, b: tile.b };
    if (side === "L") {
      if (tile.a === state.leftEnd) return { a: tile.b, b: tile.a };
      if (tile.b === state.leftEnd) return { a: tile.a, b: tile.b };
      return null;
    }
    if (tile.a === state.rightEnd) return { a: tile.a, b: tile.b };
    if (tile.b === state.rightEnd) return { a: tile.b, b: tile.a };
    return null;
  }

  function scarcityScore(value) {
    const seen = state.seenCounts[value] || 0;
    return clamp(seen, 0, 10);
  }

  function scoreAIMove(mv) {
    const left0 = state.leftEnd;
    const right0 = state.rightEnd;
    if (left0 == null || right0 == null) return 0;

    let newLeft = left0;
    let newRight = right0;
    if (mv.side === "L") newLeft = mv.placed.a;
    else newRight = mv.placed.b;

    const future = getPlayableMoves(state.ai.filter(t => t.id !== mv.tile.id), newLeft, newRight).length;
    const reduce = tileSum(mv.tile);
    const endScarcity = scarcityScore(newLeft) + scarcityScore(newRight);
    const variety = newLeft !== newRight ? 1 : 0;

    return (future * 5) + (reduce * 1.15) + (endScarcity * 1.3) + (variety * 0.6);
  }

  /* =========================
     Sound
  ========================= */
  function initSound() {
    soundEnabled = loadSoundPref();
    soundToggle.checked = soundEnabled;
    soundState.textContent = soundEnabled ? "On" : "Off";
  }

  function ensureAudioContext() {
    if (audioCtx) return;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { audioCtx = null; }
  }

  function unlockAudioOnce() {
    if (audioUnlocked) return;
    ensureAudioContext();
    if (!audioCtx) return;
    audioCtx.resume().catch(() => {});
    audioUnlocked = true;
  }

  function playTone(freq, durMs, type = "sine", gain = 0.06) {
    if (!soundEnabled) return;
    ensureAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);

    osc.connect(g);
    g.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + durMs / 1000 + 0.02);
  }

  function playSound(kind) {
    if (!soundEnabled) return;
    switch (kind) {
      case "place":
        playTone(520, 120, "triangle", 0.06);
        setTimeout(() => playTone(740, 90, "triangle", 0.05), 70);
        break;
      case "draw": playTone(360, 140, "sine", 0.055); break;
      case "pass": playTone(220, 120, "sine", 0.05); break;
      case "start":
        playTone(440, 120, "triangle", 0.05);
        setTimeout(() => playTone(660, 120, "triangle", 0.05), 120);
        break;
      case "win":
        playTone(660, 120, "triangle", 0.06);
        setTimeout(() => playTone(880, 120, "triangle", 0.06), 120);
        setTimeout(() => playTone(990, 140, "triangle", 0.06), 240);
        break;
      case "lose":
        playTone(280, 180, "sine", 0.06);
        setTimeout(() => playTone(220, 220, "sine", 0.05), 160);
        break;
      case "tie":
        playTone(420, 130, "triangle", 0.05);
        setTimeout(() => playTone(420, 130, "triangle", 0.05), 160);
        break;
      case "error": playTone(160, 160, "sawtooth", 0.04); break;
      default: break;
    }
  }

  /* =========================
     Events
  ========================= */
  function bindEvents() {
    ["pointerdown", "touchstart", "mousedown", "keydown"].forEach((evt) => {
      window.addEventListener(evt, unlockAudioOnce, { once: true, passive: true });
    });

    handScroller.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button.tilebtn") : null;
      if (!btn) return;
      const id = btn.dataset.tileId;
      if (id) onTileClick(id);
    });

    drawBtn.addEventListener("click", onDrawClick);

    restartBtn.addEventListener("click", () => {
      closeModal(resultModal);
      closeModal(helpModal);
      closeModal(tutorialModal);
      startGame();
    });

    helpBtn.addEventListener("click", () => openModal(helpModal));

    // ✅ FIX: pointerdown + stopPropagation nos botões do picker (mais estável no iOS/Android)
    const safePointer = (fn) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      fn();
    };

    playLeftBtn.addEventListener("pointerdown", safePointer(() => {
      if (!pendingMove) return;
      humanPlay(pendingMove.tile, "L");
    }));

    playRightBtn.addEventListener("pointerdown", safePointer(() => {
      if (!pendingMove) return;
      humanPlay(pendingMove.tile, "R");
    }));

    cancelPickBtn.addEventListener("pointerdown", safePointer(() => {
      hideSidePicker();
      setMessage("Ok. Escolha outra peça.");
      clearEndHighlights();
      selectedTileId = null;
      renderHand();
    }));

    // ✅ FIX: fecha apenas se tocar no fundo do overlay (e.target === sidePicker)
    sidePicker.addEventListener("pointerdown", (e) => {
      if (e.target === sidePicker) {
        e.preventDefault();
        hideSidePicker();
        setMessage("Ok. Escolha outra peça.");
        clearEndHighlights();
        selectedTileId = null;
        renderHand();
      }
    });

    attachModalClose(helpModal, "help");
    attachModalClose(resultModal, "result");
    attachModalClose(tutorialModal, "tutorial");

    skipTutorialBtn.addEventListener("click", () => { saveTutorialDone(); closeModal(tutorialModal); });
    nextTutorialBtn.addEventListener("click", () => {
      saveTutorialDone();
      closeModal(tutorialModal);
      setMessage("Comece selecionando uma peça. As pontas possíveis vão brilhar.");
    });

    playAgainBtn.addEventListener("click", () => { closeModal(resultModal); startGame(); });

    soundToggle.addEventListener("change", () => {
      soundEnabled = !!soundToggle.checked;
      soundState.textContent = soundEnabled ? "On" : "Off";
      saveSoundPref(soundEnabled);
      if (soundEnabled) playSound("start");
    });

    board.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") board.scrollLeft -= 80;
      if (e.key === "ArrowRight") board.scrollLeft += 80;
    });
    board.tabIndex = 0;
  }

  /* =========================
     Boot
  ========================= */
  function boot() {
    initSound();
    bindEvents();
    startGame();

    if (!loadTutorialDone()) openModal(tutorialModal);
  }

  boot();
})();