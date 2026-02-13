(() => {
  "use strict";

  /* =========================
     PERSISTÊNCIA
  ========================= */
  const STORAGE_KEY = "cachetaRoyale_v10";
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
     DOM (fallback seguro)
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
        click() {},
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

    slotMonte: safeEl("#slot-monte"), // opcional
    slotLixo: safeEl("#slot-lixo"),   // opcional

    // zoeira (opcional)
    btnZueira: safeEl("#btn-zueira"),

    // overlay (se existir no seu HTML)
    overlay: safeEl("#overlay-vitoria"),
    badge: safeEl("#badge-icone"),
    tit: safeEl("#tit-vitoria"),
    sub: safeEl("#sub-vitoria"),
    confetti: safeEl("#confetti-layer"),
    btnAgain: safeEl("#btn-jogar-novamente"),
    btnClose: safeEl("#btn-fechar-overlay"),

    // conferência Maia
    maiaCards: safeEl("#maia-cards"),
    vereditoActions: safeEl("#veredito-actions"),
    defaultActions: safeEl("#default-actions"),
    btnParabens: safeEl("#btn-parabens"),
    btnPiou: safeEl("#btn-piou"),
  };

  /* =========================
     BARALHO / REGRAS
  ========================= */
  const naipes = { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" };
  const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suitOrder = { clubs: 0, spades: 1, hearts: 2, diamonds: 3 };

  // Regra do usuário: sequência pode “voltar” SÓ em Q-K-A (mesmo naipe)
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

  /* =========================
     SET (TRINCA/QUADRA): naipes diferentes (máx 4)
  ========================= */
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
     CHECK: fecha com melds 3+ (set/run)
     + run especial Q-K-A
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

      // SET: mesmo valor, naipes diferentes, máximo 4
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
            if (needJ > suitsLeft) continue; // coringa não duplica naipe no set

            melds.push({ type: "set", useIds: pickIds, useJ: needJ });
          }
        }
      }

      // RUN: sequência mesmo naipe (linear)
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

        // ✅ RUN especial Q-K-A (mesmo naipe), apenas len=3
        if (ALLOW_QKA_ONLY) {
          const ranks = [11, 12, 0]; // Q, K, A
          if (ranks.includes(baseRank)) {
            const idsPicked = [];
            let jokersNeed = 0;

            for (const r of ranks) {
              const id = pickIdForRankSuit(suitMap, r, remIds);
              if (id) idsPicked.push(id);
              else jokersNeed++;
            }

            if (jokersNeed <= jokersLeft) {
              // precisa conter a carta base
              const baseOk = idsPicked.includes(baseCard.id) || jokersNeed > 0;
              // OBS: se baseCard for real, tem que estar nos idsPicked
              if (remIds.includes(baseCard.id) && baseOk && (idsPicked.includes(baseCard.id) || jokersNeed > 0)) {
                // se baseCard não está, não cria meld desse base
                if (idsPicked.includes(baseCard.id)) {
                  melds.push({ type: "run_qka", useIds: idsPicked, useJ: jokersNeed });
                }
              }
              // caso baseCard seja uma carta real e não entrou, ignora; (mais seguro)
            }
          }
        }
      }

      // dedupe
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
     PARTITION: organizar melds pra conferência
     + inclui run Q-K-A
  ========================= */
  function sortCardsNice(cards) {
    return cards.slice().sort((a, b) => {
      const aj = cardIsCoringa(a) ? 1 : 0;
      const bj = cardIsCoringa(b) ? 1 : 0;
      if (aj !== bj) return aj - bj; // coringa por último
      const sa = suitOrder[a.suit] ?? 9;
      const sb = suitOrder[b.suit] ?? 9;
      if (sa !== sb) return sa - sb;
      return rankIndex(a.val) - rankIndex(b.val);
    });
  }

  function findWinningPartition(cards) {
    const jokers = cards.filter(cardIsCoringa).slice();
    const normals = cards.filter((c) => !cardIsCoringa(c)).slice();

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

    function keyFor(norms, js) {
      const a = norms.map((c) => c.id).sort((x, y) => x - y).join(",");
      const b = js.map((c) => c.id).sort((x, y) => x - y).join(",");
      return `${a}|${b}`;
    }
    const memo = new Map();

    function removeCards(list, removeList) {
      const set = new Set(removeList.map((c) => c.id));
      return list.filter((c) => !set.has(c.id));
    }

    function pickCardForRankSuit(suitMap, r, remSet) {
      const list = suitMap.get(r) || [];
      return list.find((x) => remSet.has(x.id)) || null;
    }

    function genMeldsForBase(baseCard, remNormals, remJokers) {
      const melds = [];
      const baseRank = rankIndex(baseCard.val);
      const baseSuit = baseCard.suit;

      const remSet = new Set(remNormals.map((c) => c.id));

      // SET 3-4, naipes diferentes
      const sameRankAll = (byRank.get(baseRank) || []).filter((c) => remSet.has(c.id));
      if (sameRankAll.some((c) => c.id === baseCard.id)) {
        const pool = sameRankAll.filter((c) => c.id !== baseCard.id);
        const maxMask = 1 << pool.length;

        for (let size = 3; size <= 4; size++) {
          for (let mask = 0; mask < maxMask; mask++) {
            const pick = [baseCard];
            for (let j = 0; j < pool.length; j++) if (mask & (1 << j)) pick.push(pool[j]);
            if (pick.length > size) continue;

            if (hasDuplicateSuit(pick)) continue;

            const uniqSuit = new Set(pick.map((c) => c.suit));
            const suitsLeft = 4 - uniqSuit.size;
            const needJ = size - pick.length;
            if (needJ < 0 || needJ > remJokers.length) continue;
            if (needJ > suitsLeft) continue;

            const jokPick = remJokers.slice(0, needJ);
            melds.push({ type: "set", cards: pick.concat(jokPick) });
          }
        }
      }

      // RUN linear
      const suitMap = bySuit.get(baseSuit);
      if (suitMap) {
        const maxLen = 8;
        const baseR = baseRank;

        for (let start = Math.max(0, baseR - 7); start <= baseR; start++) {
          for (let len = 3; len <= maxLen; len++) {
            const end = start + len - 1;
            if (end > 12) continue;
            if (baseR < start || baseR > end) continue;

            const picked = [];
            let needJ = 0;

            for (let r = start; r <= end; r++) {
              const c = pickCardForRankSuit(suitMap, r, remSet);
              if (c) picked.push(c);
              else needJ++;
            }
            if (needJ > remJokers.length) continue;
            if (!picked.some((c) => c.id === baseCard.id)) continue;

            const jokPick = remJokers.slice(0, needJ);
            const group = [];
            let jp = 0;
            for (let r = start; r <= end; r++) {
              const c = pickCardForRankSuit(suitMap, r, remSet);
              if (c) group.push(c);
              else group.push(jokPick[jp++]);
            }
            melds.push({ type: "run", cards: group });
          }
        }

        // ✅ RUN especial Q-K-A (somente 3 cartas)
        if (ALLOW_QKA_ONLY) {
          const ranks = [11, 12, 0];
          if (ranks.includes(baseR)) {
            const picked = [];
            let needJ = 0;
            for (const r of ranks) {
              const c = pickCardForRankSuit(suitMap, r, remSet);
              if (c) picked.push(c);
              else needJ++;
            }
            if (needJ <= remJokers.length && picked.some((c) => c.id === baseCard.id)) {
              const jokPick = remJokers.slice(0, needJ);
              const group = [];
              let jp = 0;
              for (const r of ranks) {
                const c = pickCardForRankSuit(suitMap, r, remSet);
                if (c) group.push(c);
                else group.push(jokPick[jp++]);
              }
              melds.push({ type: "run_qka", cards: group });
            }
          }
        }
      }

      melds.sort((a, b) => b.cards.length - a.cards.length);

      const seen = new Set();
      const uniq = [];
      for (const m of melds) {
        const key = m.cards
          .map((c) => c.id)
          .slice()
          .sort((x, y) => x - y)
          .join(",");
        if (!seen.has(key)) {
          seen.add(key);
          uniq.push(m);
        }
      }
      return uniq;
    }

    function solve(remNormals, remJokers) {
      const k = keyFor(remNormals, remJokers);
      if (memo.has(k)) return memo.get(k);

      if (remNormals.length === 0) {
        const ok = remJokers.length === 0;
        const res = ok ? [] : null;
        memo.set(k, res);
        return res;
      }

      const base = remNormals
        .slice()
        .sort((a, b) => {
          const ra = rankIndex(a.val);
          const rb = rankIndex(b.val);
          if (ra !== rb) return ra - rb;
          return (suitOrder[a.suit] ?? 9) - (suitOrder[b.suit] ?? 9);
        })[0];

      const melds = genMeldsForBase(base, remNormals, remJokers);
      for (const meld of melds) {
        const usedJ = meld.cards.filter(cardIsCoringa);
        const usedN = meld.cards.filter((c) => !cardIsCoringa(c));

        const nextN = removeCards(remNormals, usedN);
        const nextJ = removeCards(remJokers, usedJ);

        const tail = solve(nextN, nextJ);
        if (tail) {
          const out = [meld.cards].concat(tail);
          memo.set(k, out);
          return out;
        }
      }

      memo.set(k, null);
      return null;
    }

    return solve(normals, jokers);
  }

  function buildDisplayOrderForMaia(cards, pendente) {
    let base = cards.slice();
    let discard = null;

    if (pendente?.tamanho === 10 && pendente?.res10?.ok && pendente?.res10?.discard) {
      discard = pendente.res10.discard;
      base = base.filter((c) => c.id !== discard.id);
    }

    if (pendente?.validoReal === true) {
      const groups = findWinningPartition(base);
      if (groups && groups.length) {
        const flat = [];
        for (const g of groups) {
          // deixa Q-K-A na ordem natural do grupo (já vem certo)
          const gg = g
            .slice()
            .sort((a, b) => (cardIsCoringa(a) ? 1 : 0) - (cardIsCoringa(b) ? 1 : 0));
          flat.push(...gg);
        }
        if (discard) flat.push(discard);
        return flat;
      }
    }

    const ordered = sortCardsNice(base);
    if (discard) ordered.push(discard);
    return ordered;
  }

  /* =========================
     IA DA MAIA (de verdade)
     - compra do lixo só se melhorar
     - descarta carta mais “inútil”
     - só bate se fechar (sem blefe aleatório)
  ========================= */
  const MAIA_BLUFF_ENABLED = false; // se quiser humor no futuro, ligue e use chance baixa
  const MAIA_BLUFF_CHANCE = 0.06;   // só terá efeito se enabled=true

  function countUsefulNeighborsRun(hand, card) {
    if (!card) return 0;
    if (cardIsCoringa(card)) return 5;

    const r = rankIndex(card.val);
    const s = card.suit;

    const hasRankSuit = (ri) => hand.some((c) => !cardIsCoringa(c) && c.suit === s && rankIndex(c.val) === ri);

    let score = 0;
    // linear neighbors
    if (r - 1 >= 0 && hasRankSuit(r - 1)) score++;
    if (r - 2 >= 0 && hasRankSuit(r - 2)) score++;
    if (r + 1 <= 12 && hasRankSuit(r + 1)) score++;
    if (r + 2 <= 12 && hasRankSuit(r + 2)) score++;

    // especial Q-K-A
    if (ALLOW_QKA_ONLY) {
      if (r === 11) { // Q
        if (hasRankSuit(12)) score += 2;
        if (hasRankSuit(0)) score += 2;
      }
      if (r === 12) { // K
        if (hasRankSuit(11)) score += 2;
        if (hasRankSuit(0)) score += 2;
      }
      if (r === 0) { // A
        if (hasRankSuit(11)) score += 2;
        if (hasRankSuit(12)) score += 2;
      }
    }

    return score;
  }

  function countUsefulSetPotential(hand, card) {
    if (!card) return 0;
    if (cardIsCoringa(card)) return 6;

    const r = card.val;
    const same = hand.filter((c) => !cardIsCoringa(c) && c.val === r);

    // quantos naipes diferentes desse valor eu já tenho?
    const suits = new Set(same.map((c) => c.suit));
    // o valor máximo de uma trinca/quarteto é baseado em naipes diferentes
    return suits.size;
  }

  function maiaHandQuality(hand) {
    // heurística simples: soma de potenciais de run/set
    let score = 0;
    for (const c of hand) {
      score += countUsefulNeighborsRun(hand, c);
      score += countUsefulSetPotential(hand, c);
    }
    // bônus: se já fecha, quality absurda
    if (hand.length === 9 && isWinningExact(hand)) score += 1000;
    if (hand.length === 10 && canCloseWithOneDiscard(hand).ok) score += 900;
    return score;
  }

  function shouldMaiaTakeDiscard(hand, discardCard) {
    if (!discardCard) return false;
    if (penalizadoMaia) return false;

    // nunca joga fora coringa, então pegar coringa do lixo é quase sempre bom
    if (cardIsCoringa(discardCard)) return true;

    const base = maiaHandQuality(hand);

    const testHand = hand.slice();
    testHand.push(discardCard);

    // se com 10 ela passa a conseguir fechar, pega!
    if (testHand.length === 10 && canCloseWithOneDiscard(testHand).ok) return true;

    // se melhora qualidade de forma clara, pega
    const after = maiaHandQuality(testHand);
    return after > base + 6;
  }

  function chooseMaiaDiscardIndex(hand) {
    // quanto maior o “ruim”, mais provável descartar
    let bestIdx = 0;
    let bestBad = -Infinity;

    const jokersCount = hand.filter(cardIsCoringa).length;

    for (let i = 0; i < hand.length; i++) {
      const c = hand[i];

      // coringa: quase nunca descarta
      if (cardIsCoringa(c)) {
        const bad = jokersCount > 1 ? -30 : -80;
        if (bad > bestBad) {
          bestBad = bad;
          bestIdx = i;
        }
        continue;
      }

      const setPot = countUsefulSetPotential(hand, c);
      const runPot = countUsefulNeighborsRun(hand, c);

      // se participa bastante de joguinhos, é bom, então “bad” baixo
      let bad = 10 - (setPot * 3 + runPot * 2);

      // cartas do meio (6,7,8) geralmente conectam mais
      const r = rankIndex(c.val);
      if (r >= 4 && r <= 8) bad -= 2;

      // A e K são perigosas (isolam fácil) mas A pode entrar em Q-K-A
      if (r === 12) bad += 2;
      if (r === 0) {
        // se tiver Q ou K do mesmo naipe, A é útil
        const hasQ = hand.some((x) => !cardIsCoringa(x) && x.suit === c.suit && rankIndex(x.val) === 11);
        const hasK = hand.some((x) => !cardIsCoringa(x) && x.suit === c.suit && rankIndex(x.val) === 12);
        if (!(hasQ && hasK)) bad += 1;
      }

      // preferir descartar carta que faz a mão ficar mais próxima de fechar
      const test = hand.slice();
      test.splice(i, 1);
      if (test.length === 9 && isWinningExact(test)) bad -= 20;

      if (bad > bestBad) {
        bestBad = bad;
        bestIdx = i;
      }
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
  let fase = "COMPRA"; // COMPRA | DESCARTE | WAIT | CONFERINDO
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
  };

  function falaRandom(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }
  function falar(msg) {
    ui.fala.innerText = msg;
    som(820, 0.07, 0.04);
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
    }
    if (!ultimaCompraIdMaia || ultimaCompraOrigemMaia !== "monte") return false;
    return maoMaia.some((c) => c.id === ultimaCompraIdMaia);
  }

  function podeBaterTotoAgora() {
    if (turno !== "toto" || fase === "CONFERINDO") return false;
    if (fase === "DESCARTE" && maoToto.length === 10) return true;
    if (fase === "COMPRA" && maoToto.length === 9) return true;
    return false;
  }

  function aplicarTremidaBatiErro() {
    ui.btnBati.classList.add("bati-erro");
    setTimeout(() => ui.btnBati.classList.remove("bati-erro"), 300);
  }

  function atualizarBloqueios() {
    ui.slotLixo.classList.toggle("slot-bloqueado", turno === "toto" && penalizadoToto);

    ui.btnCmd.disabled = turno !== "toto" || fase === "CONFERINDO";
    ui.btnBati.disabled = !podeBaterTotoAgora();
    ui.btnBati.classList.toggle("bati-pronto", podeBaterTotoAgora() && !ui.btnBati.disabled);

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
    const red = c.suit === "hearts" || c.suit === "diamonds" ? "red" : "";
    const isCor = cardIsCoringa(c);
    const sym = isCor ? "👑" : c.sym;
    return `<div class="mini-card ${red}">
      <div class="rank">${c.val}</div>
      <div class="suit">${sym}</div>
    </div>`;
  }

  function mostrarCartasMaia(cards) {
    const ordered = buildDisplayOrderForMaia(cards, pendenteMaia);
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
    div.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px) rotate(${Math.random() * 40 - 20}deg)`;
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
     Partida
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

    renderizar();

    if (turno === "toto") {
      falar(falaRandom(falas.suaVez));
    } else {
      falar(falaRandom(falas.vezMaia));
      setTimeout(turnoDaMaia, 650);
    }
  }

  /* =========================
     Maia joga (IA aprimorada)
  ========================= */
  function maiaPodeComprarLixo() {
    return !penalizadoMaia;
  }

  function maiaPodeBaterAgora() {
    if (fase === "CONFERINDO") return false;
    if (turno !== "maia") return false;

    // ela pode “bater” tanto com 9 (antes de comprar) quanto com 10 (após comprar)
    if (maoMaia.length === 9) return true;
    if (maoMaia.length === 10) return true;
    return false;
  }

  function abrirConferenciaMaia(tamanho, validoReal, res10 = null) {
    fase = "CONFERINDO";
    pendenteMaia = {
      mao: maoMaia.slice(),
      tamanho,
      validoReal,
      res10,
      temCartaMonte: jogadorTemCartaDoMonte("maia"),
    };

    falar(falaRandom(falas.juiz));
    mostrarCartasMaia(pendenteMaia.mao);

    abrirOverlay({
      icone: "🧾",
      titulo: tamanho === 9 ? "MAIA DISSE: BATI! (9)" : "MAIA DISSE: BATI!",
      subtitulo: "Confere as cartas e dá o veredito:",
      confete: false,
      modo: "veredito",
    });

    atualizarBloqueios();
  }

  function turnoDaMaia() {
    if (turno !== "maia" || fase === "CONFERINDO") return;

    fase = "COMPRA";
    renderizar();

    setTimeout(() => {
      // 1) Se fechar com 9 e (se penalizada) tiver carta do MONTE, ela bate de verdade
      if (maoMaia.length === 9 && maiaPodeBaterAgora()) {
        const ok9 = isWinningExact(maoMaia);
        const okPenalty = !penalizadoMaia || jogadorTemCartaDoMonte("maia");
        const validoReal = ok9 && okPenalty;

        if (validoReal) {
          abrirConferenciaMaia(9, true, null);
          return;
        }

        // blefe opcional (desligado por padrão)
        if (MAIA_BLUFF_ENABLED && Math.random() < MAIA_BLUFF_CHANCE) {
          abrirConferenciaMaia(9, false, null);
          return;
        }
      }

      // 2) Decide compra: lixo só se melhorar mão
      const topDiscard = lixo.length ? lixo[lixo.length - 1] : null;
      const querLixo = topDiscard && maiaPodeComprarLixo() && shouldMaiaTakeDiscard(maoMaia, topDiscard);
      const origem = querLixo ? "lixo" : "monte";
      comprarCarta(origem, "maia");

      fase = "DESCARTE";
      renderizar();

      setTimeout(() => {
        // 3) Se com 10 dá pra fechar, ela bate de verdade
        const res10 = canCloseWithOneDiscard(maoMaia);
        const okPenalty = !penalizadoMaia || jogadorTemCartaDoMonte("maia");
        const validoReal10 = res10.ok && okPenalty;

        if (validoReal10) {
          abrirConferenciaMaia(10, true, res10);
          return;
        }

        // blefe opcional (desligado por padrão)
        if (MAIA_BLUFF_ENABLED && Math.random() < MAIA_BLUFF_CHANCE) {
          abrirConferenciaMaia(10, false, res10);
          return;
        }

        // 4) Não fechou: descarta com lógica
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
     Veredito do jogador sobre a Maia
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

      abrirOverlay({
        icone: "🏆",
        titulo: "MAIA FECHOU! 🏆",
        subtitulo: aceitou ? "Boa conferência. Ela fechou mesmo 😼" : "Você duvidou… mas ela fechou 😼",
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

    // Maia errou/blefou: ninguém pontua, penaliza e segue a partida
    penalizadoMaia = true;
    saveState();

    if (pendenteMaia.tamanho === 10 && maoMaia.length === 10) {
      // se ela disse bati com 10 e não valeu, ela precisa descartar e seguir o jogo
      const idx = chooseMaiaDiscardIndex(maoMaia);
      descartarCarta("maia", idx);
      ultimaCompraOrigemMaia = null;
      ultimaCompraIdMaia = null;
    }

    abrirOverlay({
      icone: "🚫",
      titulo: "NÃO VALEU!",
      subtitulo:
        (aceitou ? "Você ia deixar passar… mas não valeu não 😅 " : "Boa! Pegou o blefe 😎 ") +
        falaRandom(falas.blefeMaia) +
        " Agora a Maia só compra do MONTE.",
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
    if (turno !== "toto" || fase !== "DESCARTE" || selIdx === null || fase === "CONFERINDO") return;

    descartarCarta("toto", selIdx);
    selIdx = null;

    turno = "maia";
    fase = "COMPRA";
    hideZueira();
    renderizar();
    falar(falaRandom(falas.vezMaia));
    setTimeout(turnoDaMaia, 650);
  }

  function jogadorBater() {
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
    setTurnUI();

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

      // bateu errado: ninguém pontua, penaliza e continua
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

        turno = "maia";
        fase = "COMPRA";
        selIdx = null;

        renderizar();
        setTimeout(() => {
          falar(falaRandom(falas.vezMaia));
          setTimeout(turnoDaMaia, 650);
        }, 420);
      }, 780);
    }, 850);
  }

  /* =========================
     Eventos (compatível com HTML antigo e novo)
  ========================= */
  function bindUI() {
    // 1) Novo padrão: data-acao
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

    // 2) Fallback: IDs clássicos
    ui.btnCmd.addEventListener("click", () => {
      if (fase === "COMPRA") jogadorComprar("monte");
      else jogadorDescartar();
    });
    ui.btnBati.addEventListener("click", () => jogadorBater());

    ui.slotMonte.addEventListener("click", () => jogadorComprar("monte"));
    ui.slotLixo.addEventListener("click", () => jogadorComprar("lixo"));

    // overlay
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
