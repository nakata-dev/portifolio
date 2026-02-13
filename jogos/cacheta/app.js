(() => {
  "use strict";

  /* =========================
     PERSISTÊNCIA
  ========================= */
  const STORAGE_KEY = "cachetaRoyale_v3";
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || typeof s !== "object") return null;
      return s;
    } catch {
      return null;
    }
  }
  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pontos,
          penalizadoToto,
          penalizadoMaia,
          proximoComeca,
        })
      );
    } catch {}
  }

  /* =========================
     OFFLINE (PWA)
  ========================= */
  function setupOffline() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  /* =========================
     ÁUDIO
  ========================= */
  const audio = new (window.AudioContext || window.webkitAudioContext)();
  function som(f, d, v = 0.1, type = "triangle") {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(v, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + d);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + d);
  }
  function fanfarraVitoria() {
    const notes = [[740,0.06],[880,0.06],[988,0.08],[1175,0.1]];
    let t = 0;
    for (const [freq, dur] of notes) {
      setTimeout(() => som(freq, dur, 0.06, "square"), t * 1000);
      t += dur * 0.9;
    }
    setTimeout(() => som(220, 0.12, 0.05, "sine"), (t + 0.02) * 1000);
  }
  function somErro() {
    som(180, 0.08, 0.06, "sawtooth");
    setTimeout(() => som(140, 0.12, 0.06, "sawtooth"), 60);
  }

  /* =========================
     DOM
  ========================= */
  const $ = (sel) => document.querySelector(sel);

  const ui = {
    mesa: $("#mesa"),
    fala: $("#fala"),
    plToto: $("#pl-toto"),
    plMaia: $("#pl-maia"),
    scToto: $("#sc-toto"),
    scMaia: $("#sc-maia"),
    viraArea: $("#vira-area"),
    lixoArea: $("#lixo-area"),
    maoArea: $("#container-mao"),
    btnCmd: $("#btn-cmd"),
    btnBati: $("#btn-bati"),
    slotLixo: $("#slot-lixo"),
    slotMonte: $("#slot-monte"),

    overlay: $("#overlay-vitoria"),
    badge: $("#badge-icone"),
    tit: $("#tit-vitoria"),
    sub: $("#sub-vitoria"),
    confetti: $("#confetti-layer"),
    btnAgain: $("#btn-jogar-novamente"),
    btnClose: $("#btn-fechar-overlay"),

    maiaCards: $("#maia-cards"),
    vereditoActions: $("#veredito-actions"),
    defaultActions: $("#default-actions"),
    btnParabens: $("#btn-parabens"),
    btnPiou: $("#btn-piou"),
  };

  /* =========================
     BARALHO / REGRAS
  ========================= */
  const naipes = { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" };
  const valores = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  let nextId = 1;
  function newCard(suit, sym, val) {
    return { id: nextId++, suit, sym, val };
  }

  let deck = [];
  let vira = null;
  let coringaRank = null;

  function rankIndex(val) { return valores.indexOf(val); }
  function cardIsCoringa(c) { return c && c.val === coringaRank && c.suit === vira.suit; }

  function prepararDeck() {
    deck = [];
    for (let i = 0; i < 2; i++) {
      for (let s in naipes) valores.forEach((v) => deck.push(newCard(s, naipes[s], v)));
    }
    deck.sort(() => Math.random() - 0.5);
  }

  // solver: TODAS as cartas precisam virar melds 3+
  function isWinningExact(cards) {
    const jokers = cards.filter(cardIsCoringa);
    const normals = cards.filter((c) => !cardIsCoringa(c));
    const jokerCountInit = jokers.length;

    const byRank = new Map();
    const bySuit = new Map();

    for (const c of normals) {
      const r = rankIndex(c.val);
      if (!byRank.has(r)) byRank.set(r, []);
      byRank.get(r).push(c);

      if (!bySuit.has(c.suit)) bySuit.set(c.suit, new Map());
      const m = bySuit.get(c.suit);
      if (!m.has(r)) m.set(r, []);
      m.get(r).push(c);
    }

    const remainingIds = normals.map((c) => c.id);
    const idToCard = new Map(normals.map((c) => [c.id, c]));

    function removeIds(arr, idsToRemove) {
      const set = new Set(idsToRemove);
      return arr.filter((x) => !set.has(x));
    }
    function getFirstRemaining(remIds) {
      const id = remIds[0];
      return idToCard.get(id);
    }

    function genMeldsForBase(baseCard, remIds, jokersLeft) {
      const melds = [];
      const baseRank = rankIndex(baseCard.val);
      const baseSuit = baseCard.suit;

      // set
      const sameRankAll = (byRank.get(baseRank) || []).map((c) => c.id);
      const sameRank = sameRankAll.filter((id) => remIds.includes(id));
      if (sameRank.includes(baseCard.id)) {
        const pool = sameRank.filter((id) => id !== baseCard.id);
        const maxMask = 1 << pool.length;

        for (let size = 3; size <= Math.min(6, sameRank.length + jokersLeft); size++) {
          for (let mask = 0; mask < maxMask; mask++) {
            const pick = [baseCard.id];
            for (let j = 0; j < pool.length; j++) if (mask & (1 << j)) pick.push(pool[j]);
            if (pick.length > size) continue;
            const needJ = size - pick.length;
            if (needJ < 0 || needJ > jokersLeft) continue;
            melds.push({ type: "set", useIds: pick, useJ: needJ });
          }
        }
      }

      // run
      const suitMap = bySuit.get(baseSuit);
      if (suitMap) {
        const maxLen = 8;
        for (let start = Math.max(0, baseRank - 7); start <= baseRank; start++) {
          for (let len = 3; len <= maxLen; len++) {
            const end = start + len - 1;
            if (end > 12) continue;
            if (baseRank < start || baseRank > end) continue;

            const idsPicked = [];
            let jokersNeed = 0;

            for (let r = start; r <= end; r++) {
              const list = suitMap.get(r) || [];
              const id = list.map((c) => c.id).find((id2) => remIds.includes(id2));
              if (id) idsPicked.push(id);
              else jokersNeed++;
            }

            if (jokersNeed > jokersLeft) continue;
            if (!idsPicked.includes(baseCard.id)) continue;

            melds.push({ type: "run", useIds: idsPicked, useJ: jokersNeed });
          }
        }
      }

      const seen = new Set();
      const uniq = [];
      for (const m of melds) {
        const key = `${m.type}|${m.useJ}|${m.useIds.slice().sort((a,b)=>a-b).join(",")}`;
        if (!seen.has(key)) { seen.add(key); uniq.push(m); }
      }
      return uniq;
    }

    function solve(remIds, jokersLeft) {
      if (remIds.length === 0) return jokersLeft === 0;

      const base = getFirstRemaining(remIds);
      if (!base) return false;

      const melds = genMeldsForBase(base, remIds, jokersLeft);
      for (const meld of melds) {
        const nextRem = removeIds(remIds, meld.useIds);
        const nextJ = jokersLeft - meld.useJ;
        if (nextJ < 0) continue;
        if (solve(nextRem, nextJ)) return true;
      }
      return false;
    }

    return solve(remainingIds, jokerCountInit);
  }

  // com 10: permite 1 descarte; valida as 9 restantes
  function canCloseWithOneDiscard(cards10) {
    if (!Array.isArray(cards10) || cards10.length !== 10) return { ok: false, discard: null };
    for (let i = 0; i < cards10.length; i++) {
      const nine = cards10.filter((_, idx) => idx !== i);
      if (isWinningExact(nine)) return { ok: true, discard: cards10[i] };
    }
    return { ok: false, discard: null };
  }

  /* =========================
     ESTADO
  ========================= */
  let pontos = { toto: 0, maia: 0 };
  let proximoComeca = "toto";

  let maoToto = [];
  let maoMaia = [];
  let lixo = [];

  let turno = "toto";
  let fase = "COMPRA";     // "COMPRA" | "DESCARTE" | "WAIT" | "CONFERINDO"
  let selIdx = null;

  let penalizadoToto = false;
  let penalizadoMaia = false;

  let ultimaCompraOrigemToto = null;
  let ultimaCompraIdToto = null;

  let ultimaCompraOrigemMaia = null;
  let ultimaCompraIdMaia = null;

  let animBuyCardId = null;

  let pendenteMaia = null;

  const falas = {
    confere: [
      "MAIA: Espera… deixa eu ver suas cartas!",
      "MAIA: Segura aí. Vou conferir essa mão!",
      "MAIA: Hm… deixa eu olhar direitinho…",
      "MAIA: Mostra. Agora. 😼",
    ],
    puni: [
      "MAIA: Peguei no pulo! Agora é só MONTE pra você 😼",
      "MAIA: Aí não… bateu errado. Só compra do MONTE agora.",
      "MAIA: Tá achando que é bagunça? Só MONTE a partir daqui.",
    ],
    suaVez: [
      "Sua vez. Bora jogar bonito 😎",
      "Vai lá. Mostra serviço 💥",
      "Sua vez. Sem ansiedade 😏",
    ],
    vezMaia: [
      "MAIA: Minha vez… segura 😼",
      "MAIA: Agora sou eu. Observa 😏",
      "MAIA: Minha vez. Vou fechar já já 😼",
    ],
    juiz: [
      "Agora é contigo: confere a mão da Maia 👀",
      "Juiz na mesa! Você dá o veredito 😄",
    ],
  };

  function falaRandom(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function falar(msg) {
    ui.fala.innerText = msg;
    som(820, 0.07, 0.04);
  }

  /* =========================
     UI helpers
  ========================= */
  function setTurnUI() {
    ui.plToto.classList.toggle("vez", turno === "toto");
    ui.plMaia.classList.toggle("vez", turno === "maia");

    const bloqueiaMesa = turno === "maia" || fase === "CONFERINDO";
    ui.mesa.classList.toggle("mesa-bloqueada", bloqueiaMesa);

    ui.overlay.style.pointerEvents = ui.overlay.classList.contains("hidden") ? "none" : "auto";
  }

  function atualizarPlacar() {
    ui.scToto.innerText = String(pontos.toto).padStart(2, "0");
    ui.scMaia.innerText = String(pontos.maia).padStart(2, "0");
    saveState();
  }

  function jogadorTemCartaDoMonte(quem) {
    if (quem === "toto") {
      if (!ultimaCompraIdToto || ultimaCompraOrigemToto !== "monte") return false;
      return maoToto.some((c) => c.id === ultimaCompraIdToto);
    } else {
      if (!ultimaCompraIdMaia || ultimaCompraOrigemMaia !== "monte") return false;
      return maoMaia.some((c) => c.id === ultimaCompraIdMaia);
    }
  }

  // BATI ligado se:
  // - 10 cartas em DESCARTE
  // - 9 cartas em COMPRA (já batido e distraído)
  function podeBaterTotoAgora() {
    if (turno !== "toto" || fase === "CONFERINDO") return false;
    if (fase === "DESCARTE" && maoToto.length === 10) return true;
    if (fase === "COMPRA" && maoToto.length === 9) return true;
    return false;
  }

  function atualizarBloqueios() {
    ui.slotLixo.classList.toggle("slot-bloqueado", turno === "toto" && penalizadoToto);

    ui.btnCmd.disabled = (turno !== "toto" || fase === "CONFERINDO");
    ui.btnBati.disabled = !podeBaterTotoAgora();

    // ⭐ ACENDE O BATI quando for possível bater
    ui.btnBati.classList.toggle("bati-pronto", podeBaterTotoAgora() && !ui.btnBati.disabled);

    ui.btnCmd.innerText = (fase === "COMPRA") ? "COMPRAR" : "DESCARTAR";
    setTurnUI();
  }

  /* =========================
     Overlay
  ========================= */
  function limparConfetes() { ui.confetti.innerHTML = ""; }

  function soltarConfetes(qtd = 44) {
    ui.confetti.innerHTML = "";
    const w = window.innerWidth;
    for (let i = 0; i < qtd; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * w + "px";
      c.style.animationDuration = (1.1 + Math.random() * 1.3).toFixed(2) + "s";
      c.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
      const hue = Math.floor(Math.random() * 360);
      c.style.background = `hsl(${hue} 90% 60%)`;
      ui.confetti.appendChild(c);
    }
  }

  function abrirOverlay({ icone, titulo, subtitulo, confete = false, modo = "default" }) {
    ui.badge.innerText = icone;
    ui.tit.innerText = titulo;
    ui.sub.innerText = subtitulo;

    const isVeredito = modo === "veredito";
    ui.vereditoActions.classList.toggle("hidden", !isVeredito);
    ui.defaultActions.classList.toggle("hidden", isVeredito);
    ui.maiaCards.classList.toggle("hidden", !isVeredito);

    ui.overlay.classList.remove("hidden");
    ui.overlay.setAttribute("aria-hidden", "false");
    ui.overlay.style.pointerEvents = "auto";

    if (confete) soltarConfetes();
    else limparConfetes();

    setTurnUI();
  }

  function fecharOverlay() {
    ui.overlay.classList.add("hidden");
    ui.overlay.setAttribute("aria-hidden", "true");
    ui.overlay.style.pointerEvents = "none";
    limparConfetes();
    setTurnUI();
  }

  function renderMiniCard(c) {
    const red = (c.suit === "hearts" || c.suit === "diamonds") ? "red" : "";
    const isCor = cardIsCoringa(c);
    const sym = isCor ? "👑" : c.sym;
    return `<div class="mini-card ${red}">
      <div class="rank">${c.val}</div>
      <div class="suit">${sym}</div>
    </div>`;
  }

  function mostrarCartasMaia(cards) {
    ui.maiaCards.innerHTML = cards.map(renderMiniCard).join("");
  }

  /* =========================
     Render
  ========================= */
  function criarCartaHTML(c) {
    if (!c) return "";
    const red = (c.suit === "hearts" || c.suit === "diamonds") ? "vermelho" : "";
    const isCor = cardIsCoringa(c);
    return `<div class="carta ${red} ${isCor ? "coringa-fx" : ""}">
      <div class="val">${c.val}</div>
      <div class="centro-s">${isCor ? "👑" : c.sym}</div>
    </div>`;
  }

  function addCartaAoLixo(c) {
    const div = document.createElement("div");
    div.className = "carta-lixo anim-drop";
    div.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px) rotate(${Math.random()*40-20}deg)`;
    div.innerHTML = criarCartaHTML(c);
    ui.lixoArea.appendChild(div);
    div.addEventListener("animationend", () => div.classList.remove("anim-drop"), { once: true });
    if (ui.lixoArea.children.length > 5) ui.lixoArea.removeChild(ui.lixoArea.firstChild);
  }

  function renderizar() {
    ui.viraArea.innerHTML = criarCartaHTML(vira);

    ui.maoArea.innerHTML = "";
    const mao = maoToto;
    const esp = Math.min(32, (window.innerWidth - 80) / (mao.length - 1));

    mao.forEach((c, i) => {
      const w = document.createElement("div");
      w.className = `wrapper-carta ${selIdx === i ? "selecionada" : ""}`;
      w.style.left = "50%";
      w.style.marginLeft = `calc(${(i - (mao.length - 1) / 2) * esp}px - (var(--card-w)/2))`;
      w.style.transform = `rotate(${(i - (mao.length - 1) / 2) * 3}deg)`;
      w.innerHTML = criarCartaHTML(c);

      if (animBuyCardId !== null && c.id === animBuyCardId) {
        w.classList.add("anim-buy");
        w.addEventListener("animationend", () => {
          w.classList.remove("anim-buy");
          if (animBuyCardId === c.id) animBuyCardId = null;
        }, { once: true });
      }

      w.onclick = () => {
        if (turno !== "toto" || fase === "CONFERINDO") return;
        som(600, 0.05, 0.05);
        if (selIdx === null) selIdx = i;
        else if (selIdx === i) selIdx = null;
        else {
          [maoToto[selIdx], maoToto[i]] = [maoToto[i], maoToto[selIdx]];
          selIdx = (fase === "DESCARTE") ? i : null;
        }
        renderizar();
      };

      ui.maoArea.appendChild(w);
    });

    atualizarBloqueios();
  }

  /* =========================
     Mecânica
  ========================= */
  function comprarCarta(origem, quem) {
    if (deck.length === 0) prepararDeck();

    let carta = null;

    if (origem === "lixo") {
      carta = lixo.pop();
      if (!carta) {
        carta = deck.pop();
        origem = "monte";
      } else {
        const area = ui.lixoArea;
        if (area.lastChild) area.removeChild(area.lastChild);
      }
    } else {
      carta = deck.pop();
    }

    if (quem === "toto") {
      maoToto.push(carta);
      ultimaCompraOrigemToto = origem;
      ultimaCompraIdToto = carta.id;
      animBuyCardId = carta.id;
    } else {
      maoMaia.push(carta);
      ultimaCompraOrigemMaia = origem;
      ultimaCompraIdMaia = carta.id;
    }

    som(420, 0.09, 0.05);
    return { carta, origem };
  }

  function descartarCarta(quem, idx) {
    const mao = (quem === "toto") ? maoToto : maoMaia;
    const desc = mao.splice(idx, 1)[0];
    lixo.push(desc);
    addCartaAoLixo(desc);
    return desc;
  }

  function iniciarPartida() {
    nextId = 1;
    prepararDeck();

    maoToto = deck.splice(0, 9);
    maoMaia = deck.splice(0, 9);

    vira = deck.pop();
    coringaRank = valores[(valores.indexOf(vira.val) + 1) % 13];

    lixo = [deck.pop()];

    ui.lixoArea.innerHTML = "";
    addCartaAoLixo(lixo[0]);

    turno = proximoComeca;
    fase = "COMPRA";
    selIdx = null;
    animBuyCardId = null;

    ultimaCompraOrigemToto = null;
    ultimaCompraIdToto = null;
    ultimaCompraOrigemMaia = null;
    ultimaCompraIdMaia = null;

    renderizar();

    if (turno === "toto") {
      falar(falaRandom(falas.suaVez));
    } else {
      falar(falaRandom(falas.vezMaia));
      setTimeout(turnoDaMaia, 650);
    }
  }

  /* =========================
     Maia joga (IA simples + pode bater com 9)
  ========================= */
  function maiaPodeComprarLixo() {
    return !penalizadoMaia;
  }

  function maiaPodeBaterCom9Agora() {
    if (turno !== "maia" || fase !== "COMPRA" || maoMaia.length !== 9) return false;
    const ok9 = isWinningExact(maoMaia);
    const okPenalty = (!penalizadoMaia) || jogadorTemCartaDoMonte("maia");
    return ok9 && okPenalty;
  }

  function turnoDaMaia() {
    if (turno !== "maia" || fase === "CONFERINDO") return;

    fase = "COMPRA";
    renderizar();

    setTimeout(() => {
      if (maiaPodeBaterCom9Agora() && Math.random() < 0.45) {
        fase = "CONFERINDO";

        pendenteMaia = {
          mao: maoMaia.slice(),
          tamanho: 9,
          validoReal: true,
          temCartaMonte: jogadorTemCartaDoMonte("maia"),
        };

        falar(falaRandom(falas.juiz));
        mostrarCartasMaia(pendenteMaia.mao);

        abrirOverlay({
          icone: "🧾",
          titulo: "MAIA BATEU (9 CARTAS)!",
          subtitulo: "Confere a mão dela e dá o veredito:",
          confete: false,
          modo: "veredito",
        });

        atualizarBloqueios();
        return;
      }

      const querLixo = (Math.random() > 0.55);
      const origem = (querLixo && maiaPodeComprarLixo() && lixo.length > 0) ? "lixo" : "monte";
      comprarCarta(origem, "maia");

      fase = "DESCARTE";
      renderizar();

      setTimeout(() => {
        const res = canCloseWithOneDiscard(maoMaia);
        const okPenalty = (!penalizadoMaia) || jogadorTemCartaDoMonte("maia");

        const chanceBatida10 = 0.38;
        if (okPenalty && res.ok && Math.random() < chanceBatida10) {
          fase = "CONFERINDO";
          pendenteMaia = {
            mao: maoMaia.slice(),
            tamanho: 10,
            res10: res,
            validoReal: true,
            temCartaMonte: jogadorTemCartaDoMonte("maia"),
          };

          falar(falaRandom(falas.juiz));
          mostrarCartasMaia(pendenteMaia.mao);

          abrirOverlay({
            icone: "🧾",
            titulo: "MAIA BATEU!",
            subtitulo: "Confere a mão dela e dá o veredito:",
            confete: false,
            modo: "veredito",
          });

          atualizarBloqueios();
          return;
        }

        let idxDesc = Math.floor(Math.random() * maoMaia.length);
        if (res.ok && res.discard) {
          const idx = maoMaia.findIndex((c) => c.id === res.discard.id);
          if (idx >= 0) idxDesc = idx;
        }

        descartarCarta("maia", idxDesc);

        turno = "toto";
        fase = "COMPRA";
        ultimaCompraOrigemMaia = null;
        ultimaCompraIdMaia = null;

        renderizar();
        falar(falaRandom(falas.suaVez));
      }, 520);
    }, 520);
  }

  /* =========================
     Veredito do jogador sobre a Maia
  ========================= */
  function resolverVeredito(aceitou) {
    if (!pendenteMaia) return;

    const real = pendenteMaia.validoReal === true;
    const foiJusto = (aceitou === real);

    if (aceitou) {
      pontos.maia++;
      penalizadoMaia = false;
    } else {
      pontos.toto++;
      penalizadoMaia = true;
    }

    atualizarPlacar();

    if (foiJusto) {
      abrirOverlay({
        icone: "✅",
        titulo: "VEREDITO CERTEIRO!",
        subtitulo: aceitou ? "Boa! A Maia fechou mesmo. Parabéns pra ela 😼" : "Boa! Você pegou o blefe na hora 😎",
        confete: true,
        modo: "default",
      });
      fanfarraVitoria();
    } else {
      abrirOverlay({
        icone: "🫣",
        titulo: "OPA…",
        subtitulo: aceitou
          ? "Você deixou passar… isso não fechava não 😅"
          : "A Maia tinha fechado… você foi rígido demais 😄",
        confete: false,
        modo: "default",
      });
      somErro();
    }

    pendenteMaia = null;
    fase = "WAIT";

    setTimeout(() => {
      fecharOverlay();
      proximoComeca = (proximoComeca === "toto") ? "maia" : "toto";
      saveState();
      iniciarPartida();
    }, 900);
  }

  /* =========================
     Ações do Totó
  ========================= */
  function podeComprarDoLixoToto() {
    return !penalizadoToto;
  }

  function jogadorComprar(origem) {
    if (turno !== "toto" || fase !== "COMPRA" || fase === "CONFERINDO") return;

    if (origem === "lixo" && !podeComprarDoLixoToto()) {
      falar(falaRandom(falas.puni));
      somErro();
      return;
    }

    comprarCarta(origem, "toto");
    fase = "DESCARTE";
    renderizar();
  }

  function jogadorDescartar() {
    if (turno !== "toto" || fase !== "DESCARTE" || selIdx === null || fase === "CONFERINDO") return;

    descartarCarta("toto", selIdx);
    selIdx = null;

    turno = "maia";
    fase = "COMPRA";
    renderizar();
    falar(falaRandom(falas.vezMaia));
    setTimeout(turnoDaMaia, 650);
  }

  function jogadorBater() {
    if (!podeBaterTotoAgora()) return;

    falar(falaRandom(falas.confere));
    abrirOverlay({
      icone: "🕵️",
      titulo: "CONFERINDO...",
      subtitulo: "“Espera… deixa eu ver suas cartas!”",
      confete: false,
      modo: "default",
    });

    fase = "CONFERINDO";
    setTurnUI();

    setTimeout(() => {
      const temCartaMonte = jogadorTemCartaDoMonte("toto");
      const okPenalty = (!penalizadoToto) || temCartaMonte;

      let valido = false;
      let msg = "";

      // 9 cartas
      if (maoToto.length === 9) {
        const ok9 = isWinningExact(maoToto);
        valido = ok9 && okPenalty;
        msg = ok9 ? "Fechou com 9 cartas. Batida limpa ✅" : "Isso aí não fecha com 9 não…";
      }

      // 10 cartas
      if (maoToto.length === 10) {
        const res10 = canCloseWithOneDiscard(maoToto);
        valido = res10.ok && okPenalty;
        if (res10.ok) {
          const suitSym = naipes[res10.discard.suit] || "";
          msg = `Fechou sim. Só faltava descartar: ${res10.discard.val}${suitSym} ✅`;
        } else {
          msg = "Isso aí não fecha não…";
        }
      }

      if (valido) {
        penalizadoToto = false;
        pontos.toto++;

        abrirOverlay({
          icone: "🏆",
          titulo: "TOTÓ BATEU! 🐶🏆",
          subtitulo: msg,
          confete: true,
          modo: "default",
        });
        fanfarraVitoria();
      } else {
        penalizadoToto = true;
        pontos.maia++;

        abrirOverlay({
          icone: "🚫",
          titulo: "NÃO VALEU!",
          subtitulo: okPenalty ? falaRandom(falas.puni) : "MAIA: Castigo ainda vale. Tem que vencer com carta do MONTE 😼",
          confete: false,
          modo: "default",
        });
        somErro();
      }

      atualizarPlacar();
      fase = "WAIT";

      setTimeout(() => {
        fecharOverlay();
        proximoComeca = (proximoComeca === "toto") ? "maia" : "toto";
        saveState();
        iniciarPartida();
      }, 850);
    }, 850);
  }

  /* =========================
     Eventos
  ========================= */
  function bindUI() {
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-acao]");
      if (!el) return;

      const acao = el.getAttribute("data-acao");
      if (acao === "novo") {
        fecharOverlay();
        iniciarPartida();
        return;
      }

      if (acao === "monte") jogadorComprar("monte");
      if (acao === "lixo") jogadorComprar("lixo");
      if (acao === "confirmar") jogadorDescartar();
      if (acao === "bati") jogadorBater();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = document.activeElement?.closest?.("[data-acao]");
      if (!el) return;
      e.preventDefault();
      el.click();
    });

    ui.btnClose.addEventListener("click", () => fecharOverlay());
    ui.btnAgain.addEventListener("click", () => { fecharOverlay(); iniciarPartida(); });

    ui.overlay.addEventListener("click", (e) => {
      if (e.target.id === "overlay-vitoria" || e.target.id === "confetti-layer") fecharOverlay();
    });

    ui.btnParabens.addEventListener("click", () => resolverVeredito(true));
    ui.btnPiou.addEventListener("click", () => resolverVeredito(false));

    window.addEventListener("resize", () => renderizar());
  }

  /* =========================
     Start
  ========================= */
  window.addEventListener("load", () => {
    const s = loadState();
    if (s?.pontos) pontos = { toto: Number(s.pontos.toto || 0), maia: Number(s.pontos.maia || 0) };
    if (typeof s?.penalizadoToto === "boolean") penalizadoToto = s.penalizadoToto;
    if (typeof s?.penalizadoMaia === "boolean") penalizadoMaia = s.penalizadoMaia;
    if (s?.proximoComeca === "toto" || s?.proximoComeca === "maia") proximoComeca = s.proximoComeca;

    bindUI();
    setupOffline();
    atualizarPlacar();
    iniciarPartida();
  });
})();
