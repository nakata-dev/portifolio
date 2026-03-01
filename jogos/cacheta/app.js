(() => {
  "use strict";

  /* =========================
     PERSISTÊNCIA
  ========================= */
  const STORAGE_KEY = "cachetaRoyale_v10";
  const TUT_KEY = "cachetaRoyale_tutorial_done_v2"; // tutorial guiado

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
    const notes = [
      [740, 0.06],
      [880, 0.06],
      [988, 0.08],
      [1175, 0.1],
    ];
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
  function risadinha() {
    som(520, 0.05, 0.04, "square");
    setTimeout(() => som(620, 0.05, 0.04, "square"), 60);
    setTimeout(() => som(720, 0.06, 0.04, "square"), 120);
  }

  /* =========================
     DOM helpers
  ========================= */
  const $ = (sel) => document.querySelector(sel);
  function safeEl(sel) {
    const el = $(sel);
    if (!el) {
      return {
        classList: { add() {}, remove() {}, toggle() {} },
        setAttribute() {},
        addEventListener() {},
        appendChild() {},
        removeChild() {},
        get lastChild() {
          return null;
        },
        get children() {
          return [];
        },
        innerHTML: "",
        style: {},
        disabled: false,
        innerText: "",
        contains() {
          return false;
        },
      };
    }
    return el;
  }

  const ui = {
    mesa: safeEl("#mesa"),
    fala: safeEl("#fala"),
    plToto: safeEl("#pl-toto"),
    plMaia: safeEl("#pl-maia"),
    scToto: safeEl("#sc-toto"),
    scMaia: safeEl("#sc-maia"),
    viraArea: safeEl("#vira-area"),
    lixoArea: safeEl("#lixo-area"),
    maoArea: safeEl("#container-mao"),
    btnCmd: safeEl("#btn-cmd"),
    btnBati: safeEl("#btn-bati"),

    btnZueira: safeEl("#btn-zueira"),

    overlay: safeEl("#overlay-vitoria"),
    badge: safeEl("#badge-icone"),
    tit: safeEl("#tit-vitoria"),
    sub: safeEl("#sub-vitoria"),
    confetti: safeEl("#confetti-layer"),
    btnAgain: safeEl("#btn-jogar-novamente"),
    btnClose: safeEl("#btn-fechar-overlay"),
    maiaCards: safeEl("#maia-cards"),
    vereditoActions: safeEl("#veredito-actions"),
    defaultActions: safeEl("#default-actions"),
    btnParabens: safeEl("#btn-parabens"),
    btnPiou: safeEl("#btn-piou"),

    btnAjuda: safeEl("#btn-ajuda"),
    tut: safeEl("#tutorial-overlay"),
    tutHole: safeEl("#tutorial-hole"),
    tutPop: safeEl("#tutorial-pop"),
    tutStep: safeEl("#tut-step"),
    tutTitle: safeEl("#tut-title"),
    tutText: safeEl("#tut-text"),
    tutPrev: safeEl("#tut-prev"),
    tutNext: safeEl("#tut-next"),
    tutSkip: safeEl("#tut-skip"),
  };

  function setAriaDisabled(el, v) {
    try {
      el.setAttribute("aria-disabled", v ? "true" : "false");
    } catch {}
  }

  /* =========================
     BARALHO / REGRAS
  ========================= */
  const naipes = { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" };
  const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suitOrder = { clubs: 0, spades: 1, hearts: 2, diamonds: 3 };

  // Sequência só vai até Q-K-A (sem wrap tipo K-A-2)
  const ALLOW_QKA_ONLY = true;

  let nextId = 1;
  function newCard(suit, sym, val) {
    return { id: nextId++, suit, sym, val };
  }

  let deck = [];
  let vira = null;
  let coringaRank = null;

  function rankIndex(val) {
    return valores.indexOf(val);
  }
  function cardIsCoringa(c) {
    return c && vira && c.val === coringaRank && c.suit === vira.suit;
  }

  function prepararDeck() {
    deck = [];
    for (let i = 0; i < 2; i++) {
      for (let s in naipes) valores.forEach((v) => deck.push(newCard(s, naipes[s], v)));
    }
    deck.sort(() => Math.random() - 0.5);
  }

  // Regra: trinca não pode ter naipe repetido (exceto coringa, que ignora naipe)
  function hasDuplicateSuit(cards) {
    const s = new Set();
    for (const c of cards) {
      if (!c || cardIsCoringa(c)) continue;
      if (s.has(c.suit)) return true;
      s.add(c.suit);
    }
    return false;
  }

  /* =========================
     CHECK: vitória
  ========================= */
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
    function pickIdForRankSuit(suitMap, r, remIds) {
      const list = suitMap.get(r) || [];
      return list.map((c) => c.id).find((id2) => remIds.includes(id2)) || null;
    }

    function genMeldsForBase(baseCard, remIds, jokersLeft) {
      const melds = [];
      const baseRank = rankIndex(baseCard.val);
      const baseSuit = baseCard.suit;

      // SET 3-4
      const sameRankAll = (byRank.get(baseRank) || []).map((c) => c.id);
      const sameRank = sameRankAll.filter((id) => remIds.includes(id));
      if (sameRank.includes(baseCard.id)) {
        const pool = sameRank.filter((id) => id !== baseCard.id);
        const maxMask = 1 << pool.length;

        for (let size = 3; size <= 4; size++) {
          for (let mask = 0; mask < maxMask; mask++) {
            const pickIds = [baseCard.id];
            for (let j = 0; j < pool.length; j++) if (mask & (1 << j)) pickIds.push(pool[j]);
            if (pickIds.length > size) continue;

            const pickedCards = pickIds.map((id) => idToCard.get(id)).filter(Boolean);
            if (hasDuplicateSuit(pickedCards)) continue;

            const uniqSuit = new Set(pickedCards.map((c) => c.suit));
            const suitsLeft = 4 - uniqSuit.size;

            const needJ = size - pickIds.length;
            if (needJ < 0 || needJ > jokersLeft) continue;
            if (needJ > suitsLeft) continue;

            melds.push({ type: "set", useIds: pickIds, useJ: needJ });
          }
        }
      }

      // RUN linear
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
              const id = pickIdForRankSuit(suitMap, r, remIds);
              if (id) idsPicked.push(id);
              else jokersNeed++;
            }

            if (jokersNeed > jokersLeft) continue;
            if (!idsPicked.includes(baseCard.id)) continue;

            melds.push({ type: "run", useIds: idsPicked, useJ: jokersNeed });
          }
        }

        // RUN especial Q-K-A
        if (ALLOW_QKA_ONLY) {
          const ranks = [11, 12, 0];
          if (ranks.includes(baseRank)) {
            const idsPicked = [];
            let jokersNeed = 0;

            for (const r of ranks) {
              const id = pickIdForRankSuit(suitMap, r, remIds);
              if (id) idsPicked.push(id);
              else jokersNeed++;
            }

            if (jokersNeed <= jokersLeft && idsPicked.includes(baseCard.id)) {
              melds.push({ type: "run_qka", useIds: idsPicked, useJ: jokersNeed });
            }
          }
        }
      }

      const seen = new Set();
      const uniq = [];
      for (const m of melds) {
        const key = `${m.type}|${m.useJ}|${m.useIds.slice().sort((a, b) => a - b).join(",")}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniq.push(m);
        }
      }
      return uniq;
    }

    function solve(remIds, jokersLeft) {
      if (remIds.length === 0) return jokersLeft === 0;

      const base = idToCard.get(remIds[0]);
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

  function canCloseWithOneDiscard(cards10) {
    if (!Array.isArray(cards10) || cards10.length !== 10) return { ok: false, discard: null };
    for (let i = 0; i < cards10.length; i++) {
      const nine = cards10.filter((_, idx) => idx !== i);
      if (isWinningExact(nine)) return { ok: true, discard: cards10[i] };
    }
    return { ok: false, discard: null };
  }

  /* =========================
     Ordenação conferência Maia
  ========================= */
  function sortCardsNice(cards) {
    return cards.slice().sort((a, b) => {
      const aj = cardIsCoringa(a) ? 1 : 0;
      const bj = cardIsCoringa(b) ? 1 : 0;
      if (aj !== bj) return aj - bj;
      const sa = suitOrder[a.suit] ?? 9;
      const sb = suitOrder[b.suit] ?? 9;
      if (sa !== sb) return sa - sb;
      return rankIndex(a.val) - rankIndex(b.val);
    });
  }

  /* =========================
     IA DA MAIA (AGORA COMPETITIVA ~80%)
  ========================= */
  const MAIA_SKILL = 0.8; // 0..1  (0.5 = ok, 0.8 = forte, 0.95 = cruel)
  const MAIA_BLUFF_ENABLED = false;
  const MAIA_BLUFF_CHANCE = 0.06;

  function rand() {
    return Math.random();
  }
  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function countUsefulNeighborsRun(hand, card) {
    if (!card) return 0;
    if (cardIsCoringa(card)) return 6;

    const r = rankIndex(card.val);
    const s = card.suit;

    const hasRankSuit = (ri) =>
      hand.some((c) => !cardIsCoringa(c) && c.suit === s && rankIndex(c.val) === ri);

    let score = 0;

    if (r - 1 >= 0 && hasRankSuit(r - 1)) score += 2;
    if (r - 2 >= 0 && hasRankSuit(r - 2)) score += 1;
    if (r + 1 <= 12 && hasRankSuit(r + 1)) score += 2;
    if (r + 2 <= 12 && hasRankSuit(r + 2)) score += 1;

    // Q-K-A
    if (ALLOW_QKA_ONLY) {
      if (r === 11) {
        if (hasRankSuit(12)) score += 2;
        if (hasRankSuit(0)) score += 2;
      }
      if (r === 12) {
        if (hasRankSuit(11)) score += 2;
        if (hasRankSuit(0)) score += 2;
      }
      if (r === 0) {
        if (hasRankSuit(11)) score += 2;
        if (hasRankSuit(12)) score += 2;
      }
    }

    return score;
  }

  function countUsefulSetPotential(hand, card) {
    if (!card) return 0;
    if (cardIsCoringa(card)) return 7;

    const r = card.val;
    const same = hand.filter((c) => !cardIsCoringa(c) && c.val === r);
    // set forte = mesmo rank com muitos naipes distintos (regra: não repetir naipe)
    const suits = new Set(same.map((c) => c.suit));
    return suits.size;
  }

  function estimateOpponentHelp(card, oppHand) {
    // Quanto essa carta ajudaria o Totó (para Maia evitar jogar no lixo).
    if (!card) return 0;
    if (cardIsCoringa(card)) return 30;

    let help = 0;

    // Ajuda a set (mesmo valor e naipe diferente)
    const sameRank = oppHand.filter((c) => !cardIsCoringa(c) && c.val === card.val);
    if (sameRank.length >= 1) {
      const suits = new Set(sameRank.map((c) => c.suit));
      if (!suits.has(card.suit)) help += 8;
      else help += 3; // naipe repetido não serve pra set, mas ainda pode servir pra run
    }

    // Ajuda a run (mesmo naipe vizinho)
    const r = rankIndex(card.val);
    const s = card.suit;
    const has = (ri) => oppHand.some((c) => !cardIsCoringa(c) && c.suit === s && rankIndex(c.val) === ri);
    if (has(r - 1)) help += 6;
    if (has(r + 1)) help += 6;
    if (has(r - 2)) help += 2;
    if (has(r + 2)) help += 2;

    // Meio de sequência tende a ser pior pra dar
    if (r >= 4 && r <= 8) help += 2;

    // Q-K-A sinergia
    if (ALLOW_QKA_ONLY) {
      if (r === 11 && (has(12) || has(0))) help += 4;
      if (r === 12 && (has(11) || has(0))) help += 4;
      if (r === 0 && (has(11) || has(12))) help += 4;
    }

    return help;
  }

  function maiaHandQuality(hand) {
    // qualidade geral + bônus por proximidade de fechar
    if (!Array.isArray(hand)) return -999;

    // fechar direto
    if (hand.length === 9 && isWinningExact(hand)) return 5000;

    // se tem 10 e fechar com um descarte, super alto
    if (hand.length === 10) {
      const c10 = canCloseWithOneDiscard(hand);
      if (c10.ok) return 4200;
    }

    let score = 0;
    let jokers = 0;

    for (const c of hand) {
      if (cardIsCoringa(c)) {
        jokers++;
        continue;
      }
      score += countUsefulNeighborsRun(hand, c);
      score += countUsefulSetPotential(hand, c) * 2.2;
    }

    // valoriza coringa na mão (não jogar fora!)
    score += jokers * 22;

    // bônus por diversidade de naipes em ranks repetidos (ajuda set válido)
    const byVal = new Map();
    for (const c of hand) {
      if (!c || cardIsCoringa(c)) continue;
      if (!byVal.has(c.val)) byVal.set(c.val, new Set());
      byVal.get(c.val).add(c.suit);
    }
    for (const [, suits] of byVal.entries()) {
      const n = suits.size;
      if (n >= 2) score += 6 + n * 2;
      if (n >= 3) score += 12;
    }

    // leve preferência por cartas do meio (melhor conectividade)
    for (const c of hand) {
      if (!c || cardIsCoringa(c)) continue;
      const r = rankIndex(c.val);
      if (r >= 4 && r <= 8) score += 1.2;
    }

    return score;
  }

  function bestAfterDiscardQuality(hand10) {
    let bestQ = -Infinity;
    let bestIdx = 0;

    for (let i = 0; i < hand10.length; i++) {
      const test = hand10.slice();
      test.splice(i, 1); // volta para 9
      const q = maiaHandQuality(test);
      if (q > bestQ) {
        bestQ = q;
        bestIdx = i;
      }
    }

    return { bestQ, bestIdx };
  }

  function shouldMaiaTakeDiscard(hand9, discardCard) {
    if (!discardCard) return false;
    if (penalizadoMaia) return false;

    // coringa: quase sempre pega
    if (cardIsCoringa(discardCard)) return true;

    // defesa: se Totó está na zona de fechar, Maia fica mais cuidadosa com lixo
    const totoThreat =
      (maoToto.length === 10 && turno === "maia") || (maoToto.length === 9 && turno === "maia" && fase === "COMPRA");

    const baseQ = maiaHandQuality(hand9);

    // Simula pegar lixo (fica com 10) e escolher melhor descarte
    const withDiscard = hand9.slice();
    withDiscard.push(discardCard);
    const simTake = bestAfterDiscardQuality(withDiscard);

    // ganho real
    let gain = simTake.bestQ - baseQ;

    // penaliza pegar lixo que ajuda o Totó (não entregar jogo)
    const helpToToto = estimateOpponentHelp(discardCard, maoToto);
    gain -= helpToToto * (totoThreat ? 0.9 : 0.55);

    // threshold dinâmico por skill e ameaça
    const baseTh = 8; // mínimo pra valer a pena
    const skillAdj = (1 - MAIA_SKILL) * 10; // quanto menor a skill, mais "impulsiva"
    const threatAdj = totoThreat ? 6 : 0;

    const threshold = baseTh + threatAdj - skillAdj;

    // Um toque humano: às vezes erra (20% de imperfeição aproximada)
    const noise = (rand() - 0.5) * (1 - MAIA_SKILL) * 18;
    gain += noise;

    return gain >= threshold;
  }

  function chooseMaiaDiscardIndex(hand10) {
    // Maia descarta pensando:
    // 1) maximizar qualidade da mão final (9 cartas)
    // 2) minimizar ajuda ao Totó via lixo
    // 3) nunca queimar coringa à toa

    let bestIdx = 0;
    let bestScore = -Infinity;

    const totoThreat =
      (maoToto.length === 10 && turno === "maia") || (maoToto.length === 9 && turno === "maia" && fase === "COMPRA");

    for (let i = 0; i < hand10.length; i++) {
      const c = hand10[i];

      // base: qualidade após descartar i
      const test9 = hand10.slice();
      test9.splice(i, 1);
      let score = maiaHandQuality(test9);

      // evita jogar coringa fora
      if (cardIsCoringa(c)) score -= 160 + (totoThreat ? 60 : 0);

      // evita dar carta que ajuda Totó no lixo
      const help = estimateOpponentHelp(c, maoToto);
      score -= help * (totoThreat ? 1.15 : 0.75);

      // evita descartar carta "central" (mais conectável), principalmente em ameaça
      if (c && !cardIsCoringa(c)) {
        const r = rankIndex(c.val);
        if (r >= 4 && r <= 8) score -= totoThreat ? 5 : 2;
      }

      // leve aleatoriedade controlada (para não virar robô previsível)
      const noise = (rand() - 0.5) * (1 - MAIA_SKILL) * 12;
      score += noise;

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    // pequena chance de “erro humano” (bem pequena na skill 0.8)
    if (rand() < (1 - MAIA_SKILL) * 0.25) {
      return Math.floor(rand() * hand10.length);
    }

    return bestIdx;
  }

  /* =========================
     ESTADO DO JOGO
  ========================= */
  let pontos = { toto: 0, maia: 0 };
  let proximoComeca = "toto";

  let maoToto = [];
  let maoMaia = [];
  let lixo = [];

  let turno = "toto";
  let fase = "COMPRA";
  let selIdx = null;

  let penalizadoToto = false;
  let penalizadoMaia = false;

  let ultimaCompraOrigemToto = null;
  let ultimaCompraIdToto = null;
  let ultimaCompraOrigemMaia = null;
  let ultimaCompraIdMaia = null;

  let animBuyCardId = null;
  let pendenteMaia = null;

  // zoeira
  let zueiraTimeout = null;
  let zueiraArmed = false;

  // tutorial autoplayer flag
  let TUT_AUTOPLAY = false;

  // ✅ FIX: se o Totó "blefar" (bater errado) com 10 cartas, ele precisa descartar 1 antes de passar a vez
  let forcarDescarteToto = false;

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
    sarroToto: [
      "MAIA: HA! Bateu no impulso 😂 Aprende a contar carta, Totó!",
      "MAIA: Ai ai… isso aí nem de longe fecha kkk 😹",
      "MAIA: Você bateu foi a cabeça na mesa, né? 😂",
      "MAIA: Calma, campeão… isso não é batida não 😼",
    ],
    sarroJuiz: [
      "MAIA: Ô juiz… tá com o óculos embaçado? 😹",
      "MAIA: Você julgou errado aí, hein 😂",
      "MAIA: Ihhh… esse veredito foi no sentimento kkk 😼",
    ],
    suaVez: ["Sua vez. Bora jogar bonito 😎", "Vai lá. Mostra serviço 💥", "Sua vez. Sem ansiedade 😏"],
    vezMaia: ["MAIA: Minha vez… segura 😼", "MAIA: Agora sou eu. Observa 😏", "MAIA: Minha vez. Vou fechar já já 😼"],
    juiz: ["Agora é contigo: confere a mão da Maia 👀", "Juiz na mesa! Você dá o veredito 😄"],
    zueiraHumano: [
      "NÃO ACREDITO que você jogou o coringa fora! kkkkkk",
      "MAIAAAA… tu jogou o coringa fora 😂😂",
      "Isso foi crime de cacheta… jogou o coringa fora! kkkkk",
    ],
    zueiraMaia: [
      "MAIA: Ow meu Deus do céu… kkk! Foi sem querer 😹",
      "MAIA: Aí não… eu pisei na bola kkk 😼",
      "MAIA: Eu vi tarde demais… kkkkk 😭",
    ],
    blefeMaia: [
      "MAIA: Tá… fui pega no pulo 😅",
      "MAIA: Aff… eu viajei. Tá bom, tá bom 😼",
      "MAIA: Ok… essa foi feia kkk 😭",
    ],
    // ✅ novo: instrução clara quando precisa descartar após blefe com 10
    forcaDescarte: [
      "MAIA: Não fechou. Agora descarta 1 carta pra voltar a 9 e eu jogo 😼",
      "MAIA: Blefou. Descarta 1 carta e passa a vez 😏",
      "MAIA: Aí não… descarta 1 carta primeiro. Depois é minha vez 😼",
    ],
  };

  function falaRandom(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }
  function falar(msg) {
    ui.fala.innerText = msg;
    som(820, 0.07, 0.04);
  }

  function withTutAutoplay(fn) {
    TUT_AUTOPLAY = true;
    try {
      fn();
    } finally {
      TUT_AUTOPLAY = false;
    }
  }

  /* =========================
     ZOEIRA
  ========================= */
  function hideZueira() {
    zueiraArmed = false;
    if (zueiraTimeout) clearTimeout(zueiraTimeout);
    zueiraTimeout = null;
    ui.btnZueira.classList.add("hidden");
    ui.btnZueira.classList.remove("pisca");
  }

  function showZueiraForFewSeconds() {
    if (fase === "CONFERINDO") return;
    zueiraArmed = true;
    ui.btnZueira.classList.remove("hidden");
    ui.btnZueira.classList.add("pisca");
    if (zueiraTimeout) clearTimeout(zueiraTimeout);
    zueiraTimeout = setTimeout(() => hideZueira(), 6000);
  }

  function executarZoeira() {
    if (!zueiraArmed) return;
    hideZueira();
    ui.fala.innerText = falaRandom(falas.zueiraHumano);
    risadinha();
    setTimeout(() => {
      ui.fala.innerText = falaRandom(falas.zueiraMaia);
      som(680, 0.06, 0.04);
    }, 850);
  }

  /* =========================
     UI helpers
  ========================= */
  function setTurnUI() {
    ui.plToto.classList.toggle("vez", turno === "toto");
    ui.plMaia.classList.toggle("vez", turno === "maia");
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
    }
    if (!ultimaCompraIdMaia || ultimaCompraOrigemMaia !== "monte") return false;
    return maoMaia.some((c) => c.id === ultimaCompraIdMaia);
  }

  function podeBaterTotoAgora() {
    if (turno !== "toto" || fase === "CONFERINDO") return false;
    if (forcarDescarteToto) return false; // ✅ fix: não pode bater enquanto precisa descartar
    if (fase === "DESCARTE" && maoToto.length === 10) return true;
    if (fase === "COMPRA" && maoToto.length === 9) return true;
    return false;
  }

  function aplicarTremidaBatiErro() {
    ui.btnBati.classList.add("bati-erro");
    setTimeout(() => ui.btnBati.classList.remove("bati-erro"), 300);
  }

  function atualizarBloqueios() {
    const lockCmd = turno !== "toto" || fase === "CONFERINDO";
    const lockBati = !podeBaterTotoAgora();

    // não "disabled" (evita botão “vazio”)
    ui.btnCmd.disabled = false;
    ui.btnBati.disabled = false;

    setAriaDisabled(ui.btnCmd, lockCmd || tutorial.open);
    setAriaDisabled(ui.btnBati, lockBati || tutorial.open);

    ui.btnBati.classList.toggle("bati-pronto", podeBaterTotoAgora() && !tutorial.open);
    ui.btnCmd.innerText = fase === "COMPRA" ? "COMPRAR" : "DESCARTAR";

    setTurnUI();
  }

  /* =========================
     Overlay
  ========================= */
  function limparConfetes() {
    ui.confetti.innerHTML = "";
  }
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
    hideZueira();

    ui.badge.innerText = icone;
    ui.tit.innerText = titulo;
    ui.sub.innerText = subtitulo;

    const isVeredito = modo === "veredito";
    ui.vereditoActions.classList.toggle("hidden", !isVeredito);
    ui.defaultActions.classList.toggle("hidden", isVeredito);
    ui.maiaCards.classList.toggle("hidden", !isVeredito);

    ui.overlay.classList.remove("hidden");
    ui.overlay.setAttribute("aria-hidden", "false");

    if (confete) soltarConfetes();
    else limparConfetes();

    atualizarBloqueios();
  }

  function fecharOverlay() {
    ui.overlay.classList.add("hidden");
    ui.overlay.setAttribute("aria-hidden", "true");
    limparConfetes();
    atualizarBloqueios();
  }

  function renderMiniCard(c) {
    const red = c.suit === "hearts" || c.suit === "diamonds" ? "red" : "";
    const isCor = cardIsCoringa(c);
    const sym = isCor ? "👑" : c.sym;
    return `<div class="mini-card ${red}">
      <div class="rank">${c.val}</div>
      <div class="suit">${sym}</div>
    </div>`;
  }

  function mostrarCartasMaia(cards) {
    const ordered = sortCardsNice(cards);
    ui.maiaCards.innerHTML = ordered.map(renderMiniCard).join("");
  }

  /* =========================
     Render
  ========================= */
  function criarCartaHTML(c) {
    if (!c) return "";
    const red = c.suit === "hearts" || c.suit === "diamonds" ? "vermelho" : "";
    const isCor = cardIsCoringa(c);
    return `<div class="carta ${red} ${isCor ? "coringa-fx" : ""}">
      <div class="val">${c.val}</div>
      <div class="centro-s">${isCor ? "👑" : c.sym}</div>
    </div>`;
  }

  function addCartaAoLixo(c) {
    const div = document.createElement("div");
    div.className = "carta-lixo anim-drop";
    div.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) rotate(${
      Math.random() * 40 - 20
    }deg)`;
    div.innerHTML = criarCartaHTML(c);
    ui.lixoArea.appendChild(div);
    div.addEventListener("animationend", () => div.classList.remove("anim-drop"), { once: true });
    if (ui.lixoArea.children.length > 5) ui.lixoArea.removeChild(ui.lixoArea.firstChild);
  }

  function renderizar() {
    ui.viraArea.innerHTML = criarCartaHTML(vira);

    ui.maoArea.innerHTML = "";
    const mao = maoToto;
    const espBase = mao.length > 1 ? (window.innerWidth - 80) / (mao.length - 1) : 0;
    const esp = mao.length > 1 ? Math.min(32, espBase) : 0;

    mao.forEach((c, i) => {
      const w = document.createElement("div");
      w.className = `wrapper-carta ${selIdx === i ? "selecionada" : ""}`;
      w.style.left = "50%";
      w.style.marginLeft = `calc(${(i - (mao.length - 1) / 2) * esp}px - (var(--card-w)/2))`;
      w.style.transform = `rotate(${(i - (mao.length - 1) / 2) * 3}deg)`;
      w.innerHTML = criarCartaHTML(c);

      if (animBuyCardId !== null && c.id === animBuyCardId) {
        w.classList.add("anim-buy");
        w.addEventListener(
          "animationend",
          () => {
            w.classList.remove("anim-buy");
            if (animBuyCardId === c.id) animBuyCardId = null;
          },
          { once: true }
        );
      }

      w.onclick = () => {
        if (turno !== "toto" || fase === "CONFERINDO") return;
        if (tutorial.open && !TUT_AUTOPLAY) return;

        som(600, 0.05, 0.05);

        if (selIdx === null) selIdx = i;
        else if (selIdx === i) selIdx = null;
        else {
          [maoToto[selIdx], maoToto[i]] = [maoToto[i], maoToto[selIdx]];
          selIdx = fase === "DESCARTE" ? i : null;
        }
        renderizar();
      };

      ui.maoArea.appendChild(w);
    });

    atualizarBloqueios();
  }

  /* =========================
     Mecânica base
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
        if (ui.lixoArea.lastChild) ui.lixoArea.removeChild(ui.lixoArea.lastChild);
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
    const mao = quem === "toto" ? maoToto : maoMaia;
    const desc = mao.splice(idx, 1)[0];
    lixo.push(desc);
    addCartaAoLixo(desc);

    if (quem === "maia" && cardIsCoringa(desc)) showZueiraForFewSeconds();
    return desc;
  }

  /* =========================
     PARTIDA
  ========================= */
  function iniciarPartida() {
    hideZueira();

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

    pendenteMaia = null;

    // ✅ reset do fluxo de descarte forçado
    forcarDescarteToto = false;

    renderizar();

    if (turno === "toto") falar(falaRandom(falas.suaVez));
    else {
      falar(falaRandom(falas.vezMaia));
      if (!tutorial.open) setTimeout(turnoDaMaia, 650);
    }
  }

  /* =========================
     Maia joga (bloqueada durante tutorial)
  ========================= */
  function maiaPodeComprarLixo() {
    return !penalizadoMaia;
  }

  function turnoDaMaia() {
    if (tutorial.open) return;
    if (turno !== "maia" || fase === "CONFERINDO") return;

    fase = "COMPRA";
    renderizar();

    setTimeout(() => {
      if (turno !== "maia") return;

      // 1) Se ela já está com 9 e fecha, ela pede conferência
      if (maoMaia.length === 9) {
        const ok9 = isWinningExact(maoMaia);
        const okPenalty = !penalizadoMaia || jogadorTemCartaDoMonte("maia");
        const validoReal = ok9 && okPenalty;

        if (validoReal) {
          pendenteMaia = { mao: maoMaia.slice(), validoReal: true, tipo: "9", falta: null };
          falar(falaRandom(falas.juiz));
          mostrarCartasMaia(pendenteMaia.mao);
          abrirOverlay({
            icone: "🧾",
            titulo: "MAIA DISSE: BATI! (9)",
            subtitulo: "Confere as cartas e dá o veredito:",
            confete: false,
            modo: "veredito",
          });
          fase = "CONFERINDO";
          atualizarBloqueios();
          return;
        }
      }

      // 2) Decide compra: lixo vs monte com simulação
      const topDiscard = lixo.length ? lixo[lixo.length - 1] : null;
      const querLixo = topDiscard && maiaPodeComprarLixo() && shouldMaiaTakeDiscard(maoMaia, topDiscard);
      const origem = querLixo ? "lixo" : "monte";
      comprarCarta(origem, "maia");

      // 3) Se com 10 dá pra fechar com 1 descarte, ela pode "bater (10)" e pedir conferência
      if (maoMaia.length === 10) {
        const res10 = canCloseWithOneDiscard(maoMaia);
        const okPenalty = !penalizadoMaia || jogadorTemCartaDoMonte("maia");
        const valido10 = res10.ok && okPenalty;

        // com skill alta, ela não deixa passar batida de 10
        if (valido10 && MAIA_SKILL >= 0.65) {
          pendenteMaia = { mao: maoMaia.slice(), validoReal: true, tipo: "10", falta: res10.discard };
          falar(falaRandom(falas.juiz));
          mostrarCartasMaia(pendenteMaia.mao);

          const suitSym = naipes[res10.discard.suit] || "";
          abrirOverlay({
            icone: "🧾",
            titulo: "MAIA DISSE: BATI! (10)",
            subtitulo: `Confere. Ela fecha se descartar ${res10.discard.val}${suitSym}.`,
            confete: false,
            modo: "veredito",
          });
          fase = "CONFERINDO";
          atualizarBloqueios();
          return;
        }
      }

      // 4) Se não bateu, descarta profissionalmente
      fase = "DESCARTE";
      renderizar();

      setTimeout(() => {
        if (turno !== "maia") return;

        const idx = chooseMaiaDiscardIndex(maoMaia);
        descartarCarta("maia", idx);

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
     Veredito Maia (simples)
  ========================= */
  function resolverVeredito(aceitou) {
    if (!pendenteMaia) return;

    const real = pendenteMaia.validoReal === true;
    const juizErrou = aceitou !== real;

    if (juizErrou) setTimeout(() => falar(falaRandom(falas.sarroJuiz)), 220);

    if (real) {
      pontos.maia++;
      penalizadoMaia = false;
      atualizarPlacar();

      let extra = "Boa conferência. Ela fechou mesmo 😼";
      if (pendenteMaia.tipo === "10" && pendenteMaia.falta) {
        const suitSym = naipes[pendenteMaia.falta.suit] || "";
        extra = `Ela fechou. Com 10, só faltava descartar ${pendenteMaia.falta.val}${suitSym} 😼`;
      } else if (!aceitou) {
        extra = "Você duvidou… mas ela fechou 😼";
      }

      abrirOverlay({
        icone: "🏆",
        titulo: "MAIA FECHOU! 🏆",
        subtitulo: extra,
        confete: true,
        modo: "default",
      });
      fanfarraVitoria();

      pendenteMaia = null;
      fase = "WAIT";

      setTimeout(() => {
        fecharOverlay();
        proximoComeca = proximoComeca === "toto" ? "maia" : "toto";
        saveState();
        iniciarPartida();
      }, 900);
      return;
    }

    penalizadoMaia = true;
    saveState();

    abrirOverlay({
      icone: "🚫",
      titulo: "NÃO VALEU!",
      subtitulo: "Boa! Pegou o erro 😎 Agora a Maia só compra do MONTE.",
      confete: false,
      modo: "default",
    });
    somErro();

    pendenteMaia = null;
    fase = "WAIT";

    setTimeout(() => {
      fecharOverlay();
      turno = "toto";
      fase = "COMPRA";
      selIdx = null;
      renderizar();
      falar(falaRandom(falas.suaVez));
    }, 850);
  }

  /* =========================
     Ações do Totó
  ========================= */
  function podeComprarDoLixoToto() {
    return !penalizadoToto;
  }

  function jogadorComprar(origem) {
    if (turno !== "toto" || fase !== "COMPRA" || fase === "CONFERINDO") return;
    if (tutorial.open && !TUT_AUTOPLAY) return;

    // ✅ FIX: se precisa descartar para voltar a 9, não deixa comprar
    if (forcarDescarteToto) {
      falar(falaRandom(falas.forcaDescarte));
      somErro();
      return;
    }

    if (origem === "lixo" && !podeComprarDoLixoToto()) {
      falar(falaRandom(falas.puni));
      somErro();
      return;
    }

    comprarCarta(origem, "toto");
    fase = "DESCARTE";
    hideZueira();
    renderizar();
  }

  function jogadorDescartar() {
    if (turno !== "toto" || fase !== "DESCARTE" || fase === "CONFERINDO") return;
    if (tutorial.open && !TUT_AUTOPLAY) return;

    if (selIdx === null) return;

    descartarCarta("toto", selIdx);
    selIdx = null;

    // ✅ FIX: descarte obrigatório após blefe com 10 cartas
    if (forcarDescarteToto) {
      forcarDescarteToto = false;

      turno = "maia";
      fase = "COMPRA";
      hideZueira();
      renderizar();

      falar(falaRandom(falas.vezMaia));
      if (!tutorial.open) setTimeout(turnoDaMaia, 650);

      return;
    }

    // tutorial: mantém a vez do Totó
    if (tutorial.open) {
      turno = "toto";
      fase = "COMPRA";
      ultimaCompraOrigemToto = null;
      ultimaCompraIdToto = null;
      hideZueira();
      renderizar();
      return;
    }

    turno = "maia";
    fase = "COMPRA";
    hideZueira();
    renderizar();
    falar(falaRandom(falas.vezMaia));
    setTimeout(turnoDaMaia, 650);
  }

  function jogadorBater() {
    if (tutorial.open && !TUT_AUTOPLAY) return;

    if (!podeBaterTotoAgora()) {
      aplicarTremidaBatiErro();
      somErro();
      return;
    }

    hideZueira();

    falar(falaRandom(falas.confere));
    abrirOverlay({
      icone: "🕵️",
      titulo: "CONFERINDO...",
      subtitulo: "“Espera… deixa eu ver suas cartas!”",
      confete: false,
      modo: "default",
    });

    fase = "CONFERINDO";
    atualizarBloqueios();

    setTimeout(() => {
      const temCartaMonte = jogadorTemCartaDoMonte("toto");
      const okPenalty = !penalizadoToto || temCartaMonte;

      let valido = false;
      let msg = "";

      if (maoToto.length === 9) {
        const ok9 = isWinningExact(maoToto);
        valido = ok9 && okPenalty;
        msg = ok9 ? "Fechou com 9 cartas. Batida limpa ✅" : "Isso aí não fecha com 9 não…";
      }

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
        atualizarPlacar();

        abrirOverlay({
          icone: "🏆",
          titulo: "TOTÓ BATEU! 🐶🏆",
          subtitulo: msg,
          confete: true,
          modo: "default",
        });
        fanfarraVitoria();

        fase = "WAIT";
        setTimeout(() => {
          fecharOverlay();
          proximoComeca = proximoComeca === "toto" ? "maia" : "toto";
          saveState();
          iniciarPartida();
        }, 850);
        return;
      }

      penalizadoToto = true;
      saveState();

      abrirOverlay({
        icone: "🚫",
        titulo: "NÃO VALEU!",
        subtitulo: "MAIA: Ih… não fechou. Continua o jogo, mas agora é só MONTE pra você 😼",
        confete: false,
        modo: "default",
      });
      somErro();

      fase = "WAIT";
      setTimeout(() => {
        fecharOverlay();
        falar(falaRandom(falas.sarroToto));

        // ✅ FIX: se o Totó tentou bater com 10 cartas e errou,
        // ele precisa descartar 1 carta para voltar a 9 antes de passar a vez.
        if (!tutorial.open && maoToto.length === 10) {
          forcarDescarteToto = true;

          turno = "toto";
          fase = "DESCARTE";

          // deixa uma carta selecionada para facilitar o descarte (UX)
          if (selIdx === null && maoToto.length) selIdx = maoToto.length - 1;

          renderizar();
          falar(falaRandom(falas.forcaDescarte));
          return;
        }

        // fluxo antigo (quando não é o caso de 10 cartas, ou quando está no tutorial)
        turno = "maia";
        fase = "COMPRA";
        selIdx = null;

        renderizar();
        if (!tutorial.open) {
          setTimeout(() => {
            falar(falaRandom(falas.vezMaia));
            setTimeout(turnoDaMaia, 650);
          }, 420);
        } else {
          turno = "toto";
          fase = "COMPRA";
          renderizar();
        }
      }, 780);
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

      if (tutorial.open) return;

      if (acao === "monte") jogadorComprar("monte");
      if (acao === "lixo") jogadorComprar("lixo");
      if (acao === "confirmar") {
        if (fase === "COMPRA") jogadorComprar("monte");
        else jogadorDescartar();
      }
      if (acao === "bati") jogadorBater();
    });

    ui.btnClose.addEventListener("click", () => fecharOverlay());
    ui.btnAgain.addEventListener("click", () => {
      fecharOverlay();
      iniciarPartida();
    });

    ui.overlay.addEventListener("click", (e) => {
      if (e.target.id === "overlay-vitoria" || e.target.id === "confetti-layer") fecharOverlay();
    });

    ui.btnParabens.addEventListener("click", () => resolverVeredito(true));
    ui.btnPiou.addEventListener("click", () => resolverVeredito(false));

    ui.btnZueira.addEventListener("click", () => executarZoeira());

    ui.btnAjuda.addEventListener("click", () => tutorialOpen(true));

    window.addEventListener("resize", () => {
      renderizar();
      tutorialRefresh();
    });
  }

  /* =========================
     TUTORIAL GUIADO (AÇÃO REAL)
  ========================= */
  const tutorial = {
    idx: 0,
    open: false,
    steps: [
      {
        target: "#slot-monte",
        title: "1) Comprar no Monte",
        text: "Toque no MONTE para comprar 1 carta.",
        pad: 14,
        action: () => {
          if (turno !== "toto") {
            turno = "toto";
            fase = "COMPRA";
          }
          if (fase !== "COMPRA") return;
          withTutAutoplay(() => jogadorComprar("monte"));
        },
      },
      {
        target: "#slot-lixo",
        title: "2) Comprar no Lixo",
        text: "Agora pega do LIXO. (Se estiver penalizado, só MONTE.)",
        pad: 14,
        pre: () => {
          if (turno !== "toto") turno = "toto";
          if (fase === "DESCARTE") {
            selIdx = 0;
            withTutAutoplay(() => jogadorDescartar());
          } else {
            fase = "COMPRA";
            renderizar();
          }
        },
        action: () => {
          if (turno !== "toto") {
            turno = "toto";
            fase = "COMPRA";
          }
          if (fase !== "COMPRA") return;
          withTutAutoplay(() => jogadorComprar("lixo"));
        },
      },
      {
        target: "#btn-cmd",
        title: "3) Descartar",
        text: "Depois de comprar, toque em DESCARTAR e escolha a carta.",
        pad: 18,
        pre: () => {
          if (turno !== "toto") turno = "toto";
          if (fase !== "DESCARTE") {
            withTutAutoplay(() => jogadorComprar("monte"));
          }
          if (selIdx === null && maoToto.length) selIdx = maoToto.length - 1;
          renderizar();
        },
        action: () => {
          if (turno !== "toto") return;
          if (fase !== "DESCARTE") return;
          if (selIdx === null && maoToto.length) selIdx = maoToto.length - 1;
          withTutAutoplay(() => jogadorDescartar());
        },
      },
      {
        target: "#btn-bati",
        title: "4) Bater",
        text: "Quando sua mão fechar, aperte BATI! (Trinca ou sequência do mesmo naipe).",
        pad: 18,
        pre: () => {
          if (turno !== "toto") turno = "toto";
          if (fase === "DESCARTE" && selIdx === null && maoToto.length) selIdx = maoToto.length - 1;
          renderizar();
          ui.btnBati.classList.add("bati-pronto");
        },
        action: () => {
          som(980, 0.05, 0.03);
        },
      },
      {
        target: "#vira-area",
        title: "5) Vira e Coringa 👑",
        text: "A VIRA define o coringa: mesmo naipe e valor seguinte. Sequência especial: Q-K-A.",
        pad: 18,
        action: () => som(1040, 0.05, 0.03),
      },
      {
        target: "#fala",
        title: "6) Penalidade",
        text: "Bateu errado? Ninguém pontua. O jogo continua, mas você fica só MONTE até vencer com carta do MONTE.",
        pad: 14,
        action: () => som(920, 0.05, 0.03),
      },
    ],
  };

  let tutPointer = null;

  function ensureTutPointer() {
    if (tutPointer) return;
    tutPointer = document.createElement("div");
    tutPointer.className = "tut-pointer";
    tutPointer.style.display = "none";
    document.body.appendChild(tutPointer);
  }

  function tutorialHasDone() {
    try {
      return localStorage.getItem(TUT_KEY) === "1";
    } catch {
      return false;
    }
  }
  function tutorialSetDone() {
    try {
      localStorage.setItem(TUT_KEY, "1");
    } catch {}
  }

  function tutorialOpen(force = false) {
    if (tutorial.open) return;
    if (!force && tutorialHasDone()) return;

    ensureTutPointer();

    // deixa fundo um pouco menos escuro
    try {
      ui.tut.style.background = "rgba(0,0,0,0.55)";
    } catch {}
    try {
      ui.tutHole.style.boxShadow =
        "0 0 0 9999px rgba(0,0,0,0.55), 0 0 30px rgba(241,196,15,0.55)";
    } catch {}

    tutorial.open = true;
    tutorial.idx = 0;

    turno = "toto";
    fase = "COMPRA";
    selIdx = null;
    renderizar();

    ui.tut.classList.remove("hidden");
    ui.tut.setAttribute("aria-hidden", "false");

    tutorialRender(true);
    som(980, 0.06, 0.03);
    atualizarBloqueios();
  }

  function tutorialClose(markDone = true, startNewGame = false) {
    if (!tutorial.open) return;
    tutorial.open = false;

    if (markDone) tutorialSetDone();

    ui.tut.classList.add("hidden");
    ui.tut.setAttribute("aria-hidden", "true");

    if (tutPointer) tutPointer.style.display = "none";

    tutorialRefresh();
    atualizarBloqueios();

    if (startNewGame) iniciarPartida();
  }

  function getRectSafe(sel) {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r || !Number.isFinite(r.width) || r.width <= 0 || r.height <= 0) return null;
    return r;
  }

  /* ==========================================================
     ✅ CORRIGIDO: retângulo e bolinha sem “puxar” um ao outro
  ========================================================== */
  function applyHoleToRect(r, pad = 12) {
    const w = Math.max(64, r.width + pad * 2);
    const h = Math.max(64, r.height + pad * 2);

    let left = r.left + r.width / 2 - w / 2;
    let top = r.top + r.height / 2 - h / 2;

    const margin = 10;
    const safeGap = 14;

    left = Math.max(margin, Math.min(window.innerWidth - w - margin, left));
    top = Math.max(margin, Math.min(window.innerHeight - h - margin, top));

    const popRect = ui.tutPop?.getBoundingClientRect?.();
    if (popRect && popRect.width > 0 && popRect.height > 0) {
      const popOnTop = popRect.top < window.innerHeight * 0.35;
      const popOnBottom = popRect.bottom > window.innerHeight * 0.65;

      if (popOnBottom) {
        const maxTop = popRect.top - safeGap - h;
        top = Math.min(top, maxTop);
      } else if (popOnTop) {
        const minTop = popRect.bottom + safeGap;
        top = Math.max(top, minTop);
      }

      top = Math.max(margin, Math.min(window.innerHeight - h - margin, top));
    }

    const cx = left + w / 2;
    const cy = top + h / 2;

    ui.tutHole.style.width = `${w}px`;
    ui.tutHole.style.height = `${h}px`;
    ui.tutHole.style.left = `${cx}px`;
    ui.tutHole.style.top = `${cy}px`;

    if (tutPointer) {
      tutPointer.style.display = "block";
      tutPointer.style.left = `${cx}px`;

      const POINTER_GAP = 18;
      const pointerTop = top - POINTER_GAP;
      tutPointer.style.top = `${Math.max(24, pointerTop)}px`;
    }
  }

  function placeTutorialPop(rect) {
    const y = rect ? rect.bottom : 0;
    const isBottomTarget = y > window.innerHeight * 0.68;

    if (isBottomTarget) {
      ui.tutPop.style.top = "18px";
      ui.tutPop.style.bottom = "auto";
    } else {
      ui.tutPop.style.bottom = "18px";
      ui.tutPop.style.top = "auto";
    }
  }

  function runStepPre() {
    const step = tutorial.steps[tutorial.idx];
    if (typeof step.pre === "function") {
      try {
        step.pre();
      } catch {}
    }
  }

  function tutorialRender(withPre = false) {
    if (withPre) runStepPre();

    const step = tutorial.steps[tutorial.idx];
    const rect = getRectSafe(step.target);

    ui.tutStep.innerText = `${tutorial.idx + 1}/${tutorial.steps.length}`;
    ui.tutTitle.innerText = step.title;
    ui.tutText.innerText = step.text;

    ui.tutPrev.disabled = tutorial.idx === 0;
    ui.tutNext.innerText = tutorial.idx === tutorial.steps.length - 1 ? "Novo Jogo" : "Próximo";

    if (rect) {
      placeTutorialPop(rect);
      applyHoleToRect(rect, step.pad);
    } else {
      if (tutPointer) tutPointer.style.display = "none";
    }
  }

  function stepAction() {
    const step = tutorial.steps[tutorial.idx];
    if (typeof step.action === "function") {
      try {
        step.action();
      } catch {}
    }
    renderizar();
    tutorialRender(false);
  }

  function tutorialNext() {
    if (!tutorial.open) return;

    stepAction();

    if (tutorial.idx >= tutorial.steps.length - 1) {
      tutorialClose(true, true);
      return;
    }

    tutorial.idx++;
    tutorialRender(true);
    som(1040, 0.05, 0.03);
  }

  function tutorialPrev() {
    if (!tutorial.open) return;
    tutorial.idx = Math.max(0, tutorial.idx - 1);
    tutorialRender(true);
    som(920, 0.05, 0.03);
  }

  function tutorialRefresh() {
    if (!tutorial.open) return;
    tutorialRender(false);
  }

  function bindTutorialUI() {
    ui.tutNext.addEventListener("click", (e) => {
      e.stopPropagation();
      tutorialNext();
    });
    ui.tutPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      tutorialPrev();
    });
    ui.tutSkip.addEventListener("click", (e) => {
      e.stopPropagation();
      tutorialClose(true, false);
    });

    ui.tutHole.addEventListener("click", (e) => {
      e.stopPropagation();
      tutorialNext();
    });

    ui.tut.addEventListener("click", (e) => {
      const pop = ui.tutPop;
      if (!pop.contains(e.target) && e.target.id !== "tut-skip") tutorialNext();
    });

    document.addEventListener("keydown", (e) => {
      if (!tutorial.open) return;
      if (e.key === "Escape") tutorialClose(true, false);
      if (e.key === "ArrowRight" || e.key === "Enter") tutorialNext();
      if (e.key === "ArrowLeft") tutorialPrev();
    });
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
    bindTutorialUI();
    setupOffline();
    atualizarPlacar();
    iniciarPartida();

    setTimeout(() => tutorialOpen(false), 450);
  });
})();