/* ==========================
   Linha Continua (One-Stroke)
   Regras corretas:
   - traço contínuo de nó em nó
   - cada aresta no máximo 1 vez
   - só vale se conectar nós por uma aresta existente
   - Para existir solução: grafo conectado e 0 ou 2 vértices ímpares (Euler)
   - Se houver 2 ímpares: 1 é "Ponto de Partida" (verde) e o outro é "Final" (rosa)
   LocalStorage:
   - nível atual
   - progresso por nível (arestas usadas + nó atual + histórico)
   - níveis concluídos + desbloqueio
========================== */

const LS_KEY = "traco_unico_v3";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const msg = document.getElementById("msg");
const lvlTxt = document.getElementById("lvl");
const lvlTotalTxt = document.getElementById("lvlTotal");
const doneTxt = document.getElementById("done");
const totalTxt = document.getElementById("total");
const triesTxt = document.getElementById("tries");
const hintTxt = document.getElementById("hint");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnReset = document.getElementById("btnReset");
const btnUndo = document.getElementById("btnUndo");
const btnHint = document.getElementById("btnHint");
const btnNodes = document.getElementById("btnNodes");

// Modal (Regras)
const btnHelp = document.getElementById("btnHelp");
const modal = document.getElementById("modal");
const btnClose = document.getElementById("btnClose");
const modalCard = document.querySelector(".modal-card");

let showNodes = true;

// -------------------- RNG (determinístico por nível) --------------------
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function shuffleInPlace(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------- Geometry helpers --------------------
function pts(arr) { return arr.map(([x, y]) => ({ x, y })); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getCanvasPos(e) {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}

// -------------------- Difficulty config --------------------
const LEVELS_TOTAL = 60;
function diffName(i1) {
  if (i1 <= 20) return "Fácil";
  if (i1 <= 40) return "Intermediário";
  return "Difícil";
}
function diffConfig(i1) {
  if (i1 <= 20) return { edgesMin: 6, edgesMax: 10, nodesMin: 7, nodesMax: 11, circuitChance: 0.20 };
  if (i1 <= 40) return { edgesMin: 11, edgesMax: 16, nodesMin: 10, nodesMax: 14, circuitChance: 0.30 };
  return { edgesMin: 17, edgesMax: 26, nodesMin: 12, nodesMax: 18, circuitChance: 0.40 };
}

// -------------------- Patterns (pontos + candidatos) --------------------
function patternSquareGrid(rng, nodesCount) {
  const base = [];
  const pad = 56;
  const step = (360 - pad * 2) / 2;
  for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 3; gx++) base.push([pad + gx * step, pad + gy * step]);

  const extra = [
    [pad + step * 0.5, pad], [pad + step * 1.5, pad],
    [pad, pad + step * 0.5], [pad, pad + step * 1.5],
    [pad + step * 2, pad + step * 0.5], [pad + step * 2, pad + step * 1.5],
    [pad + step * 0.5, pad + step * 2], [pad + step * 1.5, pad + step * 2],
  ];
  shuffleInPlace(rng, extra);

  const want = Math.max(7, Math.min(nodesCount, base.length + extra.length));
  const p = base.slice();
  while (p.length < want && extra.length) p.push(extra.pop());

  const nodes = pts(p);

  const candidates = [];
  const maxDist = 140;
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      if (d <= maxDist) candidates.push([a, b]);
    }
  }
  return { nodes, candidates, label: "Grade" };
}

function patternTriangle(rng, nodesCount) {
  const A = [180, 56], B = [66, 292], C = [294, 292];
  const p = [A, B, C];

  const tVals = [0.33, 0.66];
  function lerp(P, Q, t) { return [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]; }
  for (const t of tVals) p.push(lerp(A, B, t), lerp(A, C, t), lerp(B, C, t));

  const inner = [[180, 176], [140, 216], [220, 216], [180, 232], [180, 204]];
  shuffleInPlace(rng, inner);
  while (p.length < Math.max(7, nodesCount) && inner.length) p.push(inner.pop());

  const nodes = pts(p);

  const candidates = [];
  const maxDist = 150;
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      if (d <= maxDist) candidates.push([a, b]);
    }
  }
  return { nodes, candidates, label: "Triângulo" };
}

function patternCircle(rng, nodesCount) {
  const cx = 180, cy = 180;
  const ring = [];
  const n = 10;
  const R = 122;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    ring.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
  }

  const p = ring.slice();
  p.push([cx, cy]);

  const innerN = 6;
  const r2 = 70;
  for (let i = 0; i < innerN; i++) {
    const a = (Math.PI * 2 * i) / innerN + (rng() * 0.22);
    p.push([cx + Math.cos(a) * r2, cy + Math.sin(a) * r2]);
  }

  shuffleInPlace(rng, p);
  const want = Math.max(8, Math.min(nodesCount, p.length));
  const nodes = pts(p.slice(0, want));

  const candidates = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      if (d <= 120) candidates.push([a, b]);
      else if (d <= 160 && rng() < 0.22) candidates.push([a, b]);
    }
  }
  return { nodes, candidates, label: "Anel" };
}

function patternHex(rng, nodesCount) {
  const cx = 180, cy = 180;
  const p = [];
  const R = 128;

  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 + Math.PI / 6;
    p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
  }
  for (let i = 0; i < 6; i++) {
    const P = p[i];
    const Q = p[(i + 1) % 6];
    p.push([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]);
  }
  p.push([cx, cy]);

  const extras = [[cx - 52, cy], [cx + 52, cy], [cx, cy - 52], [cx, cy + 52]];
  shuffleInPlace(rng, extras);
  while (p.length < Math.max(10, nodesCount) && extras.length) p.push(extras.pop());

  shuffleInPlace(rng, p);
  const want = Math.max(9, Math.min(nodesCount, p.length));
  const nodes = pts(p.slice(0, want));

  const candidates = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      if (d <= 125) candidates.push([a, b]);
      else if (d <= 175 && rng() < 0.18) candidates.push([a, b]);
    }
  }
  return { nodes, candidates, label: "Hexágono" };
}

function patternRectGrid(rng, nodesCount) {
  const p = [];
  const padX = 56, padY = 72;
  const w = 360 - padX * 2;
  const h = 360 - padY * 2;
  const cols = 4, rows = 3;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      p.push([padX + (w * x) / (cols - 1), padY + (h * y) / (rows - 1)]);
    }
  }

  const extras = [[180, 180], [180, 130], [180, 230], [130, 180], [230, 180]];
  shuffleInPlace(rng, extras);
  while (p.length < Math.max(12, nodesCount) && extras.length) p.push(extras.pop());

  shuffleInPlace(rng, p);
  const want = Math.max(9, Math.min(nodesCount, p.length));
  const nodes = pts(p.slice(0, want));

  const candidates = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      if (d <= 125) candidates.push([a, b]);
      else if (d <= 170 && rng() < 0.20) candidates.push([a, b]);
    }
  }
  return { nodes, candidates, label: "Retângulo" };
}

const PATTERNS = [patternSquareGrid, patternTriangle, patternCircle, patternHex, patternRectGrid];

// -------------------- Euler helpers --------------------
function edgeKey(a, b) { return a < b ? `${a}-${b}` : `${b}-${a}`; }

function degrees(nodesCount, edges) {
  const deg = new Array(nodesCount).fill(0);
  for (const [a, b] of edges) { deg[a]++; deg[b]++; }
  return deg;
}

function oddNodesFrom(deg) {
  const odd = [];
  for (let i = 0; i < deg.length; i++) if (deg[i] % 2 === 1) odd.push(i);
  return odd;
}

function isConnected(nodesCount, edges) {
  if (edges.length === 0) return nodesCount <= 1;

  const adj = Array.from({ length: nodesCount }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }

  let start = -1;
  for (let i = 0; i < nodesCount; i++) if (adj[i].length > 0) { start = i; break; }
  if (start === -1) return false;

  const seen = new Array(nodesCount).fill(false);
  const stack = [start];
  seen[start] = true;

  while (stack.length) {
    const v = stack.pop();
    for (const u of adj[v]) if (!seen[u]) { seen[u] = true; stack.push(u); }
  }

  for (let i = 0; i < nodesCount; i++) {
    if (adj[i].length > 0 && !seen[i]) return false;
  }
  return true;
}

function validateEuler(nodesCount, edges) {
  const deg = degrees(nodesCount, edges);
  const odd = oddNodesFrom(deg);
  const connected = isConnected(nodesCount, edges);
  return { ok: connected && (odd.length === 0 || odd.length === 2), odd, connected };
}

// -------------------- Trail generator (garante Euler) --------------------
function buildAdjacency(nodesCount, candidates) {
  const adj = Array.from({ length: nodesCount }, () => []);
  for (const [a, b] of candidates) { adj[a].push(b); adj[b].push(a); }
  return adj;
}

function findTrail(rng, nodesCount, candidates, targetEdges, wantCircuit) {
  const adj = buildAdjacency(nodesCount, candidates);

  for (let attempt = 0; attempt < 240; attempt++) {
    const start = Math.floor(rng() * nodesCount);

    const used = new Set();
    const edges = [];
    const path = [start];

    const frames = [{ node: start, options: shuffleInPlace(rng, adj[start].slice()), idx: 0 }];
    const targetMain = wantCircuit ? (targetEdges - 1) : targetEdges;

    while (edges.length < targetMain) {
      const f = frames[frames.length - 1];
      if (!f) break;

      if (f.idx >= f.options.length) {
        if (frames.length === 1) break;
        frames.pop();
        path.pop();
        const removed = edges.pop();
        if (removed) used.delete(edgeKey(removed[0], removed[1]));
        continue;
      }

      const n = f.options[f.idx++];
      const k = edgeKey(f.node, n);
      if (used.has(k)) continue;

      used.add(k);
      edges.push([f.node, n]);
      path.push(n);

      frames.push({ node: n, options: shuffleInPlace(rng, adj[n].slice()), idx: 0 });
    }

    if (edges.length !== targetMain) continue;

    if (wantCircuit) {
      const end = path[path.length - 1];
      const exists = adj[end].includes(start);
      const kClose = edgeKey(end, start);
      if (!exists || used.has(kClose)) continue;
      edges.push([end, start]);
      path.push(start);
    }

    return { edges };
  }

  return null;
}

function removeIsolatedNodes(nodes, edges) {
  const deg = degrees(nodes.length, edges);
  const keep = [];
  for (let i = 0; i < deg.length; i++) if (deg[i] > 0) keep.push(i);
  if (keep.length === nodes.length) return { nodes, edges };

  const map = new Map();
  keep.forEach((oldId, newId) => map.set(oldId, newId));

  const newNodes = keep.map((oldId) => nodes[oldId]);
  const newEdges = edges
    .filter(([a, b]) => map.has(a) && map.has(b))
    .map(([a, b]) => [map.get(a), map.get(b)]);

  return { nodes: newNodes, edges: newEdges };
}

function generateLevels() {
  const levels = [];

  for (let i1 = 1; i1 <= LEVELS_TOTAL; i1++) {
    const rng = mulberry32(0xC0FFEE ^ (i1 * 9973));
    const cfg = diffConfig(i1);

    const nodesCount = Math.floor(cfg.nodesMin + rng() * (cfg.nodesMax - cfg.nodesMin + 1));
    const edgesCount = Math.floor(cfg.edgesMin + rng() * (cfg.edgesMax - cfg.edgesMin + 1));
    const wantCircuit = rng() < cfg.circuitChance;

    let built = null;
    let label = "Forma";
    let attempts = 0;

    while (!built && attempts < 16) {
      attempts++;
      const pattern = pick(rng, PATTERNS);
      const pat = pattern(rng, nodesCount + (rng() < 0.35 ? 1 : 0));
      label = pat.label;

      const targetEdges = Math.min(edgesCount + (rng() < 0.35 ? 1 : 0), cfg.edgesMax);
      const trail = findTrail(rng, pat.nodes.length, pat.candidates, targetEdges, wantCircuit);
      if (!trail) continue;

      const cleaned = removeIsolatedNodes(pat.nodes, trail.edges);
      const check = validateEuler(cleaned.nodes.length, cleaned.edges);
      if (!check.ok) continue;

      let startNode = null;
      if (check.odd.length === 2) {
        startNode = check.odd[0];
        if (rng() < 0.5) startNode = check.odd[1];
      }

      built = { nodes: cleaned.nodes, edges: cleaned.edges, startNode, difficulty: diffName(i1), label };
    }

    if (!built) {
      const pat = patternSquareGrid(rng, Math.max(7, nodesCount));
      const trail = findTrail(rng, pat.nodes.length, pat.candidates, Math.min(edgesCount, 10), false);
      if (!trail) throw new Error("Falha ao gerar nível " + i1);

      const cleaned = removeIsolatedNodes(pat.nodes, trail.edges);
      const check = validateEuler(cleaned.nodes.length, cleaned.edges);
      if (!check.ok) throw new Error("Nível inválido no fallback " + i1);

      let startNode = null;
      if (check.odd.length === 2) startNode = check.odd[0];

      built = { nodes: cleaned.nodes, edges: cleaned.edges, startNode, difficulty: diffName(i1), label: "Grade" };
    }

    levels.push({
      id: i1,
      difficulty: built.difficulty,
      label: built.label,
      nodes: built.nodes,
      edges: built.edges,
      startNode: built.startNode
    });
  }

  for (const lv of levels) {
    const v = validateEuler(lv.nodes.length, lv.edges);
    if (!v.ok) {
      console.error("Nível inválido:", lv.id, v);
      throw new Error("Nível inválido (Euler/conectividade) em " + lv.id);
    }
  }

  return levels;
}

// -------------------- Levels (60) --------------------
const LEVELS = generateLevels();

// -------------------- State --------------------
let levelIndex = 0;            // 0-based
let usedEdges = new Set();     // edge indices
let history = [];              // stack of moves: {edgeId, fromNode, toNode}
let currentNode = null;        // node index where player is currently at
let isDrawing = false;         // pointer is pressed
let tries = 0;

let showStartHint = true;      // mostra início/final
let unlocked = 1;              // 1..60
let doneLevels = {};           // { "1": true, ... } (1-based)

let lastPointer = null;

// -------------------- Victory FX (pulse + confetti) --------------------
let fx = {
  active: false,
  t0: 0,
  dur: 950,
  particles: [],
  endNode: null
};

function spawnConfetti(centerX, centerY, seed) {
  const rng = mulberry32(seed >>> 0);
  const parts = [];
  const count = 80;

  // cores alinhadas ao seu tema
  const palette = [
    "rgba(34,197,94,0.95)",   // verde
    "rgba(96,165,250,0.95)",  // azul
    "rgba(251,113,133,0.95)", // rosa
    "rgba(231,238,252,0.90)"  // branco
  ];

  for (let i = 0; i < count; i++) {
    const a = (-Math.PI / 2) + (rng() - 0.5) * 1.35; // “spray” para cima
    const sp = 2.1 + rng() * 3.2;
    const vx = Math.cos(a) * sp;
    const vy = Math.sin(a) * sp;

    parts.push({
      x: centerX + (rng() - 0.5) * 10,
      y: centerY + (rng() - 0.5) * 10,
      vx,
      vy,
      g: 0.075 + rng() * 0.06,
      drag: 0.992 - rng() * 0.004,
      r: 2 + rng() * 3,
      w: 3 + rng() * 5,
      h: 2 + rng() * 5,
      rot: rng() * Math.PI * 2,
      vr: (rng() - 0.5) * 0.25,
      life: 520 + rng() * 520,
      c: pick(rng, palette)
    });
  }

  return parts;
}

function startVictoryFX() {
  const L = currentLevel();
  const end = endNodeForLevel();
  fx.active = true;
  fx.t0 = performance.now();
  fx.dur = 980;
  fx.endNode = end;

  // centro do canvas, com leve viés pro topo, fica bonito
  const cx = 180;
  const cy = 160;

  fx.particles = spawnConfetti(cx, cy, (0xBADC0DE ^ (L.id * 1337)));

  // “travinha” breve para não desenhar durante o efeito
  isDrawing = false;

  requestAnimationFrame(renderVictoryFX);
}

function renderVictoryFX(now) {
  if (!fx.active) return;

  const t = now - fx.t0;
  draw(); // desenha o estado final do nível por baixo

  // camada de pulso no canvas inteiro
  const p = Math.min(1, t / 300);
  const pulse = Math.sin(p * Math.PI);
  ctx.save();
  ctx.globalAlpha = 0.22 * pulse;
  ctx.fillStyle = "rgba(34,197,94,1)";
  ctx.beginPath();
  ctx.arc(180, 180, 170 + pulse * 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // brilho no nó final (se existir)
  if (fx.endNode != null) {
    const n = currentLevel().nodes[fx.endNode];
    if (n) {
      const ring = 10 + Math.sin(t / 80) * 3;
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(251,113,133,0.75)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 14 + ring, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // confetti
  const dt = 16; // valor “ok” pra suavidade, não precisa integrar perfeito
  for (const c of fx.particles) {
    c.vx *= c.drag;
    c.vy = (c.vy * c.drag) + c.g * dt;

    c.x += c.vx * (dt / 16);
    c.y += c.vy * (dt / 16);

    c.rot += c.vr;

    // fade-out com a vida
    c.life -= dt;
    const lifeAlpha = Math.max(0, Math.min(1, c.life / 650));

    ctx.save();
    ctx.globalAlpha = 0.9 * lifeAlpha;
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);

    ctx.fillStyle = c.c;
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);

    ctx.restore();
  }

  // termina o FX
  const alive = fx.particles.some(p2 => p2.life > 0);
  if (t < fx.dur && alive) {
    requestAnimationFrame(renderVictoryFX);
  } else {
    fx.active = false;
    fx.particles = [];
    fx.endNode = null;
    draw();
  }
}

// -------------------- Helpers on current level --------------------
function currentLevel() { return LEVELS[levelIndex]; }

function nearestNode(p, radius = 18) {
  const L = currentLevel();
  let bestId = null;
  let bestD = Infinity;
  for (let i = 0; i < L.nodes.length; i++) {
    const n = L.nodes[i];
    const d = Math.hypot(p.x - n.x, p.y - n.y);
    if (d < bestD) { bestD = d; bestId = i; }
  }
  return bestD <= radius ? bestId : null;
}

function neighbors(nodeId) {
  const L = currentLevel();
  const list = [];
  L.edges.forEach(([a, b], i) => {
    if (a === nodeId) list.push({ to: b, edgeId: i });
    if (b === nodeId) list.push({ to: a, edgeId: i });
  });
  return list;
}

function pointToSegmentDistance(p, a, b) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = p.x - a.x;
  const wy = p.y - a.y;

  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);

  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);

  const t = c1 / c2;
  const px = a.x + t * vx;
  const py = a.y + t * vy;
  return Math.hypot(p.x - px, p.y - py);
}

function chooseEdgeByPointer(fromNode, p) {
  const L = currentLevel();
  const from = L.nodes[fromNode];

  const opts = neighbors(fromNode).filter(o => !usedEdges.has(o.edgeId));
  if (!opts.length) return null;

  let best = { edgeId: null, to: null, d: Infinity };
  for (const o of opts) {
    const to = L.nodes[o.to];
    const d = pointToSegmentDistance(p, from, to);
    if (d < best.d) best = { edgeId: o.edgeId, to: o.to, d };
  }
  return best.d <= 18 ? best : null;
}

// -------------------- Start/End nodes (Euler) --------------------
function nodeDegree(nodeId) {
  const L = currentLevel();
  let deg = 0;
  for (const [a, b] of L.edges) if (a === nodeId || b === nodeId) deg++;
  return deg;
}

function oddNodes() {
  const L = currentLevel();
  const odds = L.nodes
    .map((_, i) => ({ i, deg: nodeDegree(i) }))
    .filter(o => o.deg % 2 === 1)
    .map(o => o.i);
  return odds;
}

function startNodeForLevel() {
  const L = currentLevel();
  const odds = oddNodes();
  if (odds.length === 2 && typeof L.startNode === "number") return L.startNode;
  return null;
}

function endNodeForLevel() {
  const odds = oddNodes();
  const s = startNodeForLevel();
  if (odds.length === 2 && s != null) return odds.find(x => x !== s) ?? null;
  return null;
}

function allowedStartNodes() {
  const s = startNodeForLevel();
  if (s != null) return [s];
  return currentLevel().nodes.map((_, i) => i);
}

// -------------------- UI feedback --------------------
function setMessage(text, kind = "muted") {
  msg.textContent = text || "";
  msg.dataset.tone = kind === "ok" ? "ok" : kind === "bad" ? "bad" : kind === "warn" ? "warn" : "";
}

// -------------------- HUD --------------------
function updateHud() {
  const L = currentLevel();
  lvlTxt.textContent = String(levelIndex + 1);
  if (lvlTotalTxt) lvlTotalTxt.textContent = String(LEVELS_TOTAL);

  doneTxt.textContent = String(usedEdges.size);
  totalTxt.textContent = String(L.edges.length);
  triesTxt.textContent = String(tries);

  const diff = L.difficulty;
  hintTxt.textContent = showStartHint ? `Start • ${diff}` : `Off • ${diff}`;

  btnPrev.disabled = levelIndex <= 0;
  btnNext.disabled = (levelIndex + 1) >= unlocked;
}

// -------------------- Render --------------------
function draw() {
  const L = currentLevel();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // glow suave
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(180, 180, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // edges
  ctx.lineCap = "round";
  ctx.lineWidth = 8;

  L.edges.forEach(([a, b], i) => {
    const A = L.nodes[a], B = L.nodes[b];
    const used = usedEdges.has(i);

    ctx.strokeStyle = used ? "#22c55e" : "rgba(255,255,255,.18)";
    ctx.shadowBlur = used ? 14 : 0;
    ctx.shadowColor = used ? "rgba(34,197,94,.45)" : "transparent";

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  });

  ctx.shadowBlur = 0;

  // nodes
  if (showNodes) {
    const s = startNodeForLevel();
    const e = endNodeForLevel();
    const allowed = allowedStartNodes();

    L.nodes.forEach((n, i) => {
      const isCurrent = currentNode === i;

      const isStart = showStartHint && (s != null ? i === s : allowed.includes(i));
      const isEnd = showStartHint && (e != null && i === e);

      ctx.beginPath();
      ctx.arc(n.x, n.y, isCurrent ? 9 : 7, 0, Math.PI * 2);

      let fill = "rgba(255,255,255,.25)";
      if (isStart) fill = "#22c55e";
      if (isEnd) fill = "#fb7185";
      if (isCurrent) fill = "#60a5fa";

      ctx.fillStyle = fill;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,0,0,.35)";
      ctx.stroke();
    });
  }

  updateHud();
}

// -------------------- Game flow --------------------
function resetLevel(keepTries = false) {
  usedEdges.clear();
  history = [];
  currentNode = null;
  isDrawing = false;
  lastPointer = null;

  if (!keepTries) tries++;

  showStartHint = true;

  const L = currentLevel();
  const s = startNodeForLevel();
  if (s != null) setMessage(`Nível ${L.id} (${L.difficulty}). Comece no ponto verde.`, "muted");
  else setMessage(`Nível ${L.id} (${L.difficulty}). Pode começar em qualquer ponto.`, "muted");

  saveProgress();
  draw();
}

function completeLevel() {
  navigator.vibrate?.(70);

  const L = currentLevel();
  setMessage(`🏆 Nível ${L.id} concluído!`, "ok");

  const data = readStore();
  data.doneLevels = data.doneLevels || {};
  data.doneLevels[String(levelIndex + 1)] = true;

  const nextUnlock = Math.min(LEVELS_TOTAL, Math.max(unlocked, levelIndex + 2));
  data.unlocked = nextUnlock;

  if (levelIndex < LEVELS_TOTAL - 1) data.levelIndex = levelIndex + 1;
  else data.levelIndex = levelIndex;

  writeStore(data);

  doneLevels = data.doneLevels;
  unlocked = nextUnlock;

  // Efeito visual premium
  startVictoryFX();

  setTimeout(() => {
    if (levelIndex < LEVELS_TOTAL - 1) {
      gotoLevel(levelIndex + 1, true);
      resetLevel(true);
    } else {
      setMessage("✨ Mestre do Traço! Você concluiu todos os 60 níveis.", "ok");
      draw();
    }
  }, 920);
}

function tryStartAt(nodeId) {
  const allowed = allowedStartNodes();
  if (!allowed.includes(nodeId)) {
    setMessage("❌ Comece no ponto de início (verde).", "bad");
    return false;
  }

  currentNode = nodeId;
  isDrawing = true;
  showStartHint = false;

  setMessage("Boa! Agora siga de ponto em ponto, sem repetir linhas.", "muted");

  saveProgress();
  draw();
  return true;
}

function stepTo(toNode, edgeId) {
  if (usedEdges.has(edgeId)) return false;

  usedEdges.add(edgeId);
  history.push({ edgeId, fromNode: currentNode, toNode });
  currentNode = toNode;

  navigator.vibrate?.(18);
  saveProgress();
  draw();

  const total = currentLevel().edges.length;
  if (usedEdges.size === total) completeLevel();

  return true;
}

function undo() {
  if (!history.length) {
    setMessage("Nada para desfazer.", "muted");
    return;
  }

  const last = history.pop();
  usedEdges.delete(last.edgeId);
  currentNode = last.fromNode;

  setMessage("↩ Movimento desfeito.", "muted");
  saveProgress();
  draw();
}

// -------------------- Pointer controls --------------------
canvas.addEventListener("pointerdown", (e) => {
  if (fx.active) return; // evita mexer durante vitória

  const p = getCanvasPos(e);
  lastPointer = p;

  if (currentNode === null) {
    const n = nearestNode(p, 22);
    if (n === null) {
      setMessage("Toque em um ponto para começar.", "muted");
      return;
    }
    tryStartAt(n);
    return;
  }

  isDrawing = true;
});

canvas.addEventListener("pointermove", (e) => {
  if (fx.active) return;
  if (!isDrawing || currentNode === null) return;

  const p = getCanvasPos(e);
  lastPointer = p;

  const pickEdge = chooseEdgeByPointer(currentNode, p);
  if (!pickEdge) return;

  const toPt = currentLevel().nodes[pickEdge.to];
  if (Math.hypot(p.x - toPt.x, p.y - toPt.y) > 26) return;

  stepTo(pickEdge.to, pickEdge.edgeId);
});

canvas.addEventListener("pointerup", () => {
  isDrawing = false;
});

// -------------------- Navigation (lock) --------------------
function gotoLevel(idx, loadSaved = true) {
  levelIndex = clamp(idx, 0, LEVELS_TOTAL - 1);
  if ((levelIndex + 1) > unlocked) levelIndex = unlocked - 1;

  if (loadSaved) loadLevelProgress();
  else resetLevel(true);

  draw();
}

function updateUnlockFromDone(data) {
  const done = data.doneLevels || {};
  let maxDone = 0;
  for (const k of Object.keys(done)) {
    if (done[k]) maxDone = Math.max(maxDone, Number(k));
  }
  const computed = clamp(maxDone + 1, 1, LEVELS_TOTAL);
  const stored = typeof data.unlocked === "number" ? clamp(data.unlocked, 1, LEVELS_TOTAL) : 1;
  return Math.max(stored, computed);
}

// -------------------- Buttons --------------------
btnReset.addEventListener("click", () => resetLevel(false));
btnUndo.addEventListener("click", () => undo());

btnHint.addEventListener("click", () => {
  showStartHint = !showStartHint;
  draw();
});

btnNodes.addEventListener("click", () => {
  showNodes = !showNodes;
  btnNodes.classList.toggle("active", showNodes);
  btnNodes.textContent = showNodes ? "• Pontos" : "• Ocultos";
  saveProgress();
  draw();
});

btnPrev.addEventListener("click", () => {
  gotoLevel(levelIndex - 1, true);
});

btnNext.addEventListener("click", () => {
  if ((levelIndex + 2) > unlocked) {
    setMessage("🔒 Conclua este nível para desbloquear o próximo.", "warn");
    draw();
    return;
  }
  gotoLevel(levelIndex + 1, true);
});

// -------------------- MODAL (robusto) --------------------
function openModal() { if (modal) modal.hidden = false; }
function closeModal() { if (modal) modal.hidden = true; }

btnHelp?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  openModal();
});

btnClose?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeModal();
});

modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

modalCard?.addEventListener("click", (e) => {
  e.stopPropagation();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// -------------------- LocalStorage --------------------
function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function saveProgress() {
  const data = readStore();

  data.levelIndex = levelIndex;
  data.unlocked = unlocked;
  data.doneLevels = doneLevels;

  data.progress = data.progress || {};
  data.progress[levelIndex] = {
    used: Array.from(usedEdges),
    currentNode,
    history,
    tries,
    showNodes,
    showStartHint
  };

  writeStore(data);
}

function loadLevelProgress() {
  const data = readStore();

  data.doneLevels = data.doneLevels || {};
  data.unlocked = updateUnlockFromDone(data);

  doneLevels = data.doneLevels;
  unlocked = data.unlocked;

  if (typeof data.levelIndex === "number") {
    levelIndex = clamp(data.levelIndex, 0, LEVELS_TOTAL - 1);
    if ((levelIndex + 1) > unlocked) levelIndex = unlocked - 1;
  }

  const p = data.progress?.[levelIndex];
  if (p) {
    usedEdges = new Set(p.used || []);
    history = Array.isArray(p.history) ? p.history : [];
    currentNode = (typeof p.currentNode === "number") ? p.currentNode : null;
    tries = Number.isFinite(p.tries) ? p.tries : 0;
    showNodes = (typeof p.showNodes === "boolean") ? p.showNodes : true;
    showStartHint = (typeof p.showStartHint === "boolean") ? p.showStartHint : (currentNode === null);

    btnNodes.textContent = showNodes ? "• Pontos" : "• Ocultos";
    btnNodes.classList.toggle("active", showNodes);

    setMessage("Progresso carregado. Continue de onde parou.", "muted");
  } else {
    tries = 0;
    currentNode = null;
    usedEdges.clear();
    history = [];
    showStartHint = true;

    const L = currentLevel();
    const s = startNodeForLevel();
    if (s != null) setMessage(`Nível ${L.id} (${L.difficulty}). Comece no ponto verde.`, "muted");
    else setMessage(`Nível ${L.id} (${L.difficulty}). Pode começar em qualquer ponto.`, "muted");
  }

  writeStore(data);
}

// -------------------- Init --------------------
function init() {
  if (lvlTotalTxt) lvlTotalTxt.textContent = String(LEVELS_TOTAL);
  loadLevelProgress();
  draw();
}
init();
