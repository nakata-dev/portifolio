/* ==========================
   Linha Continua (One-Stroke) - v6
   Fix definitivo:
   - Proíbe cruzamento sem nó (X fantasma)
   - Proíbe arestas colineares SOBREPOSTAS (mesma linha "por cima")
   - Valida Euler: 0 ou 2 ímpares + conectado
   - Lazy levels + cache leve
========================== */

const LS_KEY = "traco_unico_v6_opt_nooverlap";
const LEVELS_TOTAL = 60;

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

const btnHelp = document.getElementById("btnHelp");
const modal = document.getElementById("modal");
const btnClose = document.getElementById("btnClose");
const modalCard = document.querySelector(".modal-card");

if (lvlTotalTxt) lvlTotalTxt.textContent = String(LEVELS_TOTAL);

let showNodes = true;

// ---------- Perf mode (auto) ----------
const prefersReduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
const cores = navigator.hardwareConcurrency || 4;
const lowEnd = prefersReduceMotion || cores <= 4;

// ---------- RNG ----------
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, arr) { return arr[(rng() * arr.length) | 0]; }
function shuffleInPlace(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function pts(arr) { return arr.map(([x, y]) => ({ x, y })); }

// ---------- Difficulty ----------
function diffName(i1) {
  if (i1 <= 20) return "Fácil";
  if (i1 <= 40) return "Intermediário";
  return "Difícil";
}
function diffConfig(i1) {
  if (i1 <= 20) return { edgesMin: 6, edgesMax: 10, nodesMin: 7, nodesMax: 11, circuitChance: 0.18 };
  if (i1 <= 40) return { edgesMin: 11, edgesMax: 16, nodesMin: 10, nodesMax: 14, circuitChance: 0.26 };
  return { edgesMin: 17, edgesMax: 26, nodesMin: 12, nodesMax: 18, circuitChance: 0.35 };
}

// ---------- Geometry: interseção + sobreposição ----------
const EPS = 1e-9;

function orient(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
function onSeg(ax, ay, bx, by, cx, cy) {
  return (
    cx >= Math.min(ax, bx) - EPS && cx <= Math.max(ax, bx) + EPS &&
    cy >= Math.min(ay, by) - EPS && cy <= Math.max(ay, by) + EPS
  );
}
function segmentsIntersect(a1, a2, b1, b2) {
  const o1 = orient(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y);
  const o2 = orient(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y);
  const o3 = orient(b1.x, b1.y, b2.x, b2.y, a1.x, a1.y);
  const o4 = orient(b1.x, b1.y, b2.x, b2.y, a2.x, a2.y);

  if (Math.abs(o1) < EPS && onSeg(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y)) return true;
  if (Math.abs(o2) < EPS && onSeg(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y)) return true;
  if (Math.abs(o3) < EPS && onSeg(b1.x, b1.y, b2.x, b2.y, a1.x, a1.y)) return true;
  if (Math.abs(o4) < EPS && onSeg(b1.x, b1.y, b2.x, b2.y, a2.x, a2.y)) return true;

  return ((o1 > 0) !== (o2 > 0)) && ((o3 > 0) !== (o4 > 0));
}

function dot(ax, ay, bx, by) { return ax * bx + ay * by; }

/**
 * Proíbe:
 * - cruzamento sem nó (segmentos que se cruzam sem compartilhar endpoint)
 * - sobreposição colinear mesmo quando compartilha endpoint (A-B e A-C na mesma direção)
 */
function wouldIntersectOrOverlap(nodes, edgesSoFar, u, v) {
  const A = nodes[u];
  const B = nodes[v];

  for (let i = 0; i < edgesSoFar.length; i++) {
    const [p, q] = edgesSoFar[i];
    const P = nodes[p];
    const Q = nodes[q];

    // duplicata exata
    if ((p === u && q === v) || (p === v && q === u)) return true;

    // compartilha endpoint?
    const shareU = (p === u || q === u);
    const shareV = (p === v || q === v);
    const shares = shareU || shareV;

    if (!shares) {
      // cruzamento normal
      if (segmentsIntersect(A, B, P, Q)) return true;
      continue;
    }

    // Se compartilha endpoint, NÃO pode ficar colinear "por cima"
    // caso 1: compartilha u
    if (p === u || q === u) {
      const other = (p === u) ? q : p;     // outro lado da aresta existente
      const O = nodes[other];

      // colinear? (u, v, other)
      if (Math.abs(orient(A.x, A.y, B.x, B.y, O.x, O.y)) < EPS) {
        // mesmo sentido a partir de u?
        const vx1 = B.x - A.x, vy1 = B.y - A.y;
        const vx2 = O.x - A.x, vy2 = O.y - A.y;
        if (dot(vx1, vy1, vx2, vy2) > EPS) return true; // sobreposição no mesmo raio
      }
    }

    // caso 2: compartilha v
    if (p === v || q === v) {
      const other = (p === v) ? q : p;
      const O = nodes[other];

      if (Math.abs(orient(B.x, B.y, A.x, A.y, O.x, O.y)) < EPS) {
        const vx1 = A.x - B.x, vy1 = A.y - B.y;
        const vx2 = O.x - B.x, vy2 = O.y - B.y;
        if (dot(vx1, vy1, vx2, vy2) > EPS) return true;
      }
    }
  }

  return false;
}

// ---------- Euler helpers ----------
function edgeKey(a, b) { return a < b ? `${a}-${b}` : `${b}-${a}`; }

function degrees(n, edges) {
  const deg = new Array(n).fill(0);
  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i];
    deg[a]++; deg[b]++;
  }
  return deg;
}
function oddNodesFrom(deg) {
  const odd = [];
  for (let i = 0; i < deg.length; i++) if (deg[i] & 1) odd.push(i);
  return odd;
}
function isConnected(nodesCount, edges) {
  if (!edges.length) return nodesCount <= 1;

  const adj = Array.from({ length: nodesCount }, () => []);
  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i];
    adj[a].push(b); adj[b].push(a);
  }

  let start = -1;
  for (let i = 0; i < nodesCount; i++) {
    if (adj[i].length) { start = i; break; }
  }
  if (start === -1) return false;

  const seen = new Array(nodesCount).fill(false);
  const stack = [start];
  seen[start] = true;

  while (stack.length) {
    const v = stack.pop();
    const ns = adj[v];
    for (let k = 0; k < ns.length; k++) {
      const u = ns[k];
      if (!seen[u]) { seen[u] = true; stack.push(u); }
    }
  }

  for (let i = 0; i < nodesCount; i++) {
    if (adj[i].length && !seen[i]) return false;
  }
  return true;
}
function validateEuler(nodesCount, edges) {
  const deg = degrees(nodesCount, edges);
  const odd = oddNodesFrom(deg);
  const connected = isConnected(nodesCount, edges);
  return { ok: connected && (odd.length === 0 || odd.length === 2), odd, connected };
}

// ---------- Patterns (estéticos) ----------
function patternSquareX(rng, nodesCount) {
  const base = [
    [100, 100], [260, 100], [260, 260], [100, 260],
    [180, 180]
  ];
  const extras = [[180,100],[260,180],[180,260],[100,180]];
  shuffleInPlace(rng, extras);

  const want = Math.max(5, Math.min(nodesCount, base.length + extras.length));
  const p = base.slice();
  while (p.length < want && extras.length) p.push(extras.pop());
  const nodes = pts(p);

  const candidates = [];
  candidates.push([0,1],[1,2],[2,3],[3,0]);
  candidates.push([0,4],[1,4],[2,4],[3,4]);

  for (let i = 5; i < nodes.length; i++) {
    candidates.push([i,4]);
    let best = 0, bestD = Infinity;
    for (let c = 0; c < 4; c++) {
      const d = Math.hypot(nodes[i].x - nodes[c].x, nodes[i].y - nodes[c].y);
      if (d < bestD) { bestD = d; best = c; }
    }
    candidates.push([i,best]);
  }

  return { nodes, candidates, label: "Quadrado-X" };
}

function patternHouse(rng, nodesCount) {
  const base = [
    [110, 260], [250, 260], [250, 160], [110, 160],
    [180, 90],
    [180, 210]
  ];
  const extras = [[180,160],[180,260],[110,210],[250,210]];
  shuffleInPlace(rng, extras);

  const want = Math.max(6, Math.min(nodesCount, base.length + extras.length));
  const p = base.slice();
  while (p.length < want && extras.length) p.push(extras.pop());
  const nodes = pts(p);

  const candidates = [];
  candidates.push([0,1],[1,2],[2,3],[3,0]);
  candidates.push([3,4],[4,2]);
  candidates.push([5,0],[5,1],[5,2],[5,3]);
  for (let i = 6; i < nodes.length; i++) candidates.push([i,5]);

  return { nodes, candidates, label: "Casa" };
}

function patternDoubleBox(rng, nodesCount) {
  const base = [
    [80, 140], [160, 140], [160, 240], [80, 240],
    [200, 140], [280, 140], [280, 240], [200, 240],
    [180, 190]
  ];
  const want = Math.max(9, Math.min(nodesCount, base.length));
  const nodes = pts(base.slice(0, want));

  const candidates = [];
  candidates.push([0,1],[1,2],[2,3],[3,0]);
  candidates.push([4,5],[5,6],[6,7],[7,4]);
  candidates.push([1,8],[2,8],[4,8],[7,8]);
  candidates.push([1,4],[2,7]);

  return { nodes, candidates, label: "Duas Caixas" };
}

function patternCircle(rng, nodesCount) {
  const cx = 180, cy = 180;
  const p = [];
  const ringN = 10;
  const R = 122;

  for (let i = 0; i < ringN; i++) {
    const a = (Math.PI * 2 * i) / ringN;
    p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
  }
  p.push([cx, cy]);

  const innerN = 6;
  const r2 = 70;
  for (let i = 0; i < innerN; i++) {
    const a = (Math.PI * 2 * i) / innerN + (rng() * 0.18);
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
      else if (d <= 160 && rng() < 0.12) candidates.push([a, b]);
    }
  }
  return { nodes, candidates, label: "Anel" };
}

function patternSquareGrid(rng, nodesCount) {
  const pad = 56;
  const step = (360 - pad * 2) / 2;
  const base = [];
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

const PATTERNS = [patternSquareX, patternHouse, patternDoubleBox, patternCircle, patternSquareGrid];

// ---------- Trail generator (SEM cruzar + SEM sobrepor) ----------
function buildAdjacency(nodesCount, candidates) {
  const adj = Array.from({ length: nodesCount }, () => []);
  for (let i = 0; i < candidates.length; i++) {
    const [a, b] = candidates[i];
    adj[a].push(b); adj[b].push(a);
  }
  return adj;
}

function findTrailClean(rng, nodes, candidates, targetEdges, wantCircuit) {
  const nodesCount = nodes.length;
  const adj = buildAdjacency(nodesCount, candidates);

  for (let attempt = 0; attempt < 170; attempt++) {
    const start = (rng() * nodesCount) | 0;
    const used = new Set();
    const edges = [];
    const path = [start];

    const frames = [{ node: start, opts: shuffleInPlace(rng, adj[start].slice()), idx: 0 }];
    const targetMain = wantCircuit ? (targetEdges - 1) : targetEdges;

    while (edges.length < targetMain) {
      const f = frames[frames.length - 1];
      if (!f) break;

      if (f.idx >= f.opts.length) {
        if (frames.length === 1) break;
        frames.pop();
        path.pop();
        const rem = edges.pop();
        if (rem) used.delete(edgeKey(rem[0], rem[1]));
        continue;
      }

      const n = f.opts[f.idx++];
      const k = edgeKey(f.node, n);
      if (used.has(k)) continue;

      // NOVO: bloqueia cruzamento e sobreposição colinear
      if (wouldIntersectOrOverlap(nodes, edges, f.node, n)) continue;

      used.add(k);
      edges.push([f.node, n]);
      path.push(n);
      frames.push({ node: n, opts: shuffleInPlace(rng, adj[n].slice()), idx: 0 });
    }

    if (edges.length !== targetMain) continue;

    if (wantCircuit) {
      const end = path[path.length - 1];
      const kClose = edgeKey(end, start);
      if (!adj[end].includes(start) || used.has(kClose)) continue;
      if (wouldIntersectOrOverlap(nodes, edges, end, start)) continue;
      edges.push([end, start]);
    }

    return edges;
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

  const newNodes = keep.map(oldId => nodes[oldId]);
  const newEdges = [];
  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i];
    if (map.has(a) && map.has(b)) newEdges.push([map.get(a), map.get(b)]);
  }
  return { nodes: newNodes, edges: newEdges };
}

function buildNeighbors(n, edges) {
  const nei = Array.from({ length: n }, () => []);
  for (let i = 0; i < edges.length; i++) {
    const [a, b] = edges[i];
    nei[a].push({ to: b, edgeId: i });
    nei[b].push({ to: a, edgeId: i });
  }
  return nei;
}

// ---------- Level generation (LAZY + cache) ----------
const levelCache = new Map();
const levelLsCacheKey = "lvl_cache_v3_clean";

function seedFor(i1) { return (0xC0FFEE ^ (i1 * 9973)) >>> 0; }

function buildLevel(i1) {
  const rng = mulberry32(seedFor(i1));
  const cfg = diffConfig(i1);

  const nodesCount = (cfg.nodesMin + (rng() * (cfg.nodesMax - cfg.nodesMin + 1)) | 0);
  const edgesCount = (cfg.edgesMin + (rng() * (cfg.edgesMax - cfg.edgesMin + 1)) | 0);
  const wantCircuit = rng() < cfg.circuitChance;

  let built = null;
  let label = "Forma";

  for (let tries = 0; tries < 14 && !built; tries++) {
    const patFn = pick(rng, PATTERNS);
    const pat = patFn(rng, nodesCount + (rng() < 0.25 ? 1 : 0));
    label = pat.label;

    const targetEdges = Math.min(edgesCount + (rng() < 0.25 ? 1 : 0), cfg.edgesMax);
    const trail = findTrailClean(rng, pat.nodes, pat.candidates, targetEdges, wantCircuit);
    if (!trail) continue;

    const cleaned = removeIsolatedNodes(pat.nodes, trail);
    const check = validateEuler(cleaned.nodes.length, cleaned.edges);
    if (!check.ok) continue;

    let startNode = null;
    if (check.odd.length === 2) startNode = check.odd[(rng() < 0.5) ? 0 : 1];

    built = {
      id: i1,
      difficulty: diffName(i1),
      label,
      nodes: cleaned.nodes,
      edges: cleaned.edges,
      startNode
    };
  }

  // fallback seguro
  if (!built) {
    const pat = patternSquareGrid(rng, Math.max(7, nodesCount));
    const trail = findTrailClean(rng, pat.nodes, pat.candidates, Math.min(edgesCount, 10), false);
    const cleaned = removeIsolatedNodes(pat.nodes, trail || []);
    const check = validateEuler(cleaned.nodes.length, cleaned.edges);
    const startNode = (check.odd.length === 2) ? check.odd[0] : null;

    built = {
      id: i1,
      difficulty: diffName(i1),
      label: "Grade",
      nodes: cleaned.nodes,
      edges: cleaned.edges,
      startNode
    };
  }

  built.nei = buildNeighbors(built.nodes.length, built.edges);
  return built;
}

function readLevelLsCache() {
  try {
    const raw = localStorage.getItem(levelLsCacheKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeLevelLsCache(obj) {
  try { localStorage.setItem(levelLsCacheKey, JSON.stringify(obj)); } catch {}
}

function getLevel(idx0) {
  if (levelCache.has(idx0)) return levelCache.get(idx0);

  const i1 = idx0 + 1;

  const stored = readLevelLsCache();
  const key = String(i1);
  if (stored[key]) {
    const lv = stored[key];
    lv.nei = buildNeighbors(lv.nodes.length, lv.edges);
    levelCache.set(idx0, lv);
    return lv;
  }

  const lv = buildLevel(i1);
  levelCache.set(idx0, lv);

  const toKeep = [i1, i1 + 1, i1 + 2, i1 - 1].filter(x => x >= 1 && x <= LEVELS_TOTAL);
  const newStore = {};
  for (const k of toKeep) {
    const id0 = k - 1;
    const L = levelCache.get(id0) || buildLevel(k);
    newStore[String(k)] = { id: L.id, difficulty: L.difficulty, label: L.label, nodes: L.nodes, edges: L.edges, startNode: L.startNode };
  }
  writeLevelLsCache(newStore);

  return lv;
}

// ---------- UI feedback ----------
function setMessage(text, kind = "muted") {
  msg.textContent = text || "";
  msg.dataset.tone = kind === "ok" ? "ok" : kind === "bad" ? "bad" : kind === "warn" ? "warn" : "";
}

// ---------- State ----------
let levelIndex = 0;
let unlocked = 1;
let doneLevels = {};

let usedEdges = new Set();
let history = [];
let currentNode = null;
let isDrawing = false;
let tries = 0;
let showStartHint = true;

let rafMovePending = false;
let lastMoveEvent = null;

// ---------- Background cache ----------
let bgCache = {
  id: null,
  canvas: document.createElement("canvas"),
  ctx: null
};
bgCache.canvas.width = canvas.width;
bgCache.canvas.height = canvas.height;
bgCache.ctx = bgCache.canvas.getContext("2d");

function buildBackgroundFor(levelId) {
  if (bgCache.id === levelId) return;

  bgCache.id = levelId;
  const bctx = bgCache.ctx;
  bctx.clearRect(0, 0, canvas.width, canvas.height);

  bctx.save();
  bctx.globalAlpha = 0.18;
  bctx.fillStyle = "#22c55e";
  bctx.beginPath();
  bctx.arc(180, 180, 160, 0, Math.PI * 2);
  bctx.fill();
  bctx.restore();

  bctx.save();
  bctx.globalAlpha = 0.12;
  bctx.fillStyle = "#000";
  bctx.beginPath();
  bctx.arc(180, 180, 220, 0, Math.PI * 2);
  bctx.fill();
  bctx.restore();
}

// ---------- Level helpers ----------
function currentLevel() { return getLevel(levelIndex); }

function nodeDegree(L, nodeId) {
  let deg = 0;
  for (let i = 0; i < L.edges.length; i++) {
    const [a, b] = L.edges[i];
    if (a === nodeId || b === nodeId) deg++;
  }
  return deg;
}
function oddNodes(L) {
  const odd = [];
  for (let i = 0; i < L.nodes.length; i++) if (nodeDegree(L, i) & 1) odd.push(i);
  return odd;
}
function startNodeForLevel(L) {
  const odds = oddNodes(L);
  if (odds.length === 2 && typeof L.startNode === "number") return L.startNode;
  return null;
}
function endNodeForLevel(L) {
  const odds = oddNodes(L);
  const s = startNodeForLevel(L);
  if (odds.length === 2 && s != null) return odds[0] === s ? odds[1] : odds[0];
  return null;
}
function allowedStartNodes(L) {
  const s = startNodeForLevel(L);
  return (s != null) ? [s] : L.nodes.map((_, i) => i);
}

// ---------- Pointer / geometry ----------
function getCanvasPos(e) {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}

function nearestNode(L, p, radius = 18) {
  let bestId = null;
  let bestD = Infinity;
  for (let i = 0; i < L.nodes.length; i++) {
    const n = L.nodes[i];
    const d = Math.hypot(p.x - n.x, p.y - n.y);
    if (d < bestD) { bestD = d; bestId = i; }
  }
  return bestD <= radius ? bestId : null;
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

function chooseEdgeByPointer(L, fromNode, p) {
  const from = L.nodes[fromNode];
  const opts = L.nei[fromNode];
  if (!opts || !opts.length) return null;

  let bestEdgeId = -1;
  let bestTo = -1;
  let bestD = Infinity;

  for (let i = 0; i < opts.length; i++) {
    const o = opts[i];
    if (usedEdges.has(o.edgeId)) continue;
    const to = L.nodes[o.to];
    const d = pointToSegmentDistance(p, from, to);
    if (d < bestD) { bestD = d; bestEdgeId = o.edgeId; bestTo = o.to; }
  }
  return (bestD <= 18) ? { edgeId: bestEdgeId, to: bestTo } : null;
}

// ---------- HUD ----------
function updateHud() {
  const L = currentLevel();
  lvlTxt.textContent = String(levelIndex + 1);
  doneTxt.textContent = String(usedEdges.size);
  totalTxt.textContent = String(L.edges.length);
  triesTxt.textContent = String(tries);

  hintTxt.textContent = showStartHint ? `Start • ${L.difficulty}` : `Off • ${L.difficulty}`;
  btnPrev.disabled = levelIndex <= 0;
  btnNext.disabled = (levelIndex + 1) >= unlocked;
}

// ---------- Draw ----------
function draw() {
  const L = currentLevel();
  buildBackgroundFor(L.id);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgCache.canvas, 0, 0);

  ctx.lineCap = "round";
  ctx.lineWidth = 8;

  const shadowUsed = lowEnd ? 0 : 8;
  for (let i = 0; i < L.edges.length; i++) {
    const [a, b] = L.edges[i];
    const A = L.nodes[a], B = L.nodes[b];
    const used = usedEdges.has(i);

    ctx.strokeStyle = used ? "#22c55e" : "rgba(255,255,255,.18)";
    ctx.shadowBlur = used ? shadowUsed : 0;
    ctx.shadowColor = used ? "rgba(34,197,94,.45)" : "transparent";

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  if (showNodes) {
    const s = startNodeForLevel(L);
    const e = endNodeForLevel(L);
    const allowed = allowedStartNodes(L);

    for (let i = 0; i < L.nodes.length; i++) {
      const n = L.nodes[i];
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
    }
  }

  updateHud();
}

// ---------- Flow ----------
function resetLevel(keepTries = false) {
  usedEdges.clear();
  history = [];
  currentNode = null;
  isDrawing = false;
  lastMoveEvent = null;

  if (!keepTries) tries++;
  showStartHint = true;

  const L = currentLevel();
  const s = startNodeForLevel(L);
  if (s != null) setMessage(`Nível ${L.id} (${L.difficulty}) • ${L.label}. Comece no ponto verde.`, "muted");
  else setMessage(`Nível ${L.id} (${L.difficulty}) • ${L.label}. Pode começar em qualquer ponto.`, "muted");

  saveProgress();
  draw();
}

function tryStartAt(nodeId) {
  const L = currentLevel();
  const allowed = allowedStartNodes(L);
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

  navigator.vibrate?.(12);
  saveProgress();
  draw();

  const L = currentLevel();
  if (usedEdges.size === L.edges.length) completeLevel();
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

// ---------- Victory ----------
function completeLevel() {
  navigator.vibrate?.(55);
  const L = currentLevel();
  setMessage(`🏆 Nível ${L.id} concluído!`, "ok");

  const data = readStore();
  data.doneLevels = data.doneLevels || {};
  data.doneLevels[String(levelIndex + 1)] = true;

  const nextUnlock = Math.min(LEVELS_TOTAL, Math.max(unlocked, levelIndex + 2));
  data.unlocked = nextUnlock;

  data.levelIndex = (levelIndex < LEVELS_TOTAL - 1) ? (levelIndex + 1) : levelIndex;

  writeStore(data);
  doneLevels = data.doneLevels;
  unlocked = nextUnlock;

  setTimeout(() => {
    if (levelIndex < LEVELS_TOTAL - 1) {
      gotoLevel(levelIndex + 1, true);
      resetLevel(true);
    } else {
      setMessage("✨ Mestre do Traço! Você concluiu todos os 60 níveis.", "ok");
      draw();
    }
  }, lowEnd ? 520 : 720);
}

// ---------- Navigation ----------
function gotoLevel(idx, loadSaved = true) {
  levelIndex = clamp(idx, 0, LEVELS_TOTAL - 1);
  if ((levelIndex + 1) > unlocked) levelIndex = unlocked - 1;

  if (levelIndex + 1 < LEVELS_TOTAL) setTimeout(() => { try { getLevel(levelIndex + 1); } catch {} }, 0);

  if (loadSaved) loadLevelProgress();
  else resetLevel(true);

  draw();
}

// ---------- Pointer events (RAF) ----------
canvas.addEventListener("pointerdown", (e) => {
  const L = currentLevel();
  const p = getCanvasPos(e);

  if (currentNode === null) {
    const n = nearestNode(L, p, 22);
    if (n == null) {
      setMessage("Toque em um ponto para começar.", "muted");
      return;
    }
    tryStartAt(n);
    return;
  }
  isDrawing = true;
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing || currentNode === null) return;

  lastMoveEvent = e;
  if (rafMovePending) return;
  rafMovePending = true;

  requestAnimationFrame(() => {
    rafMovePending = false;
    if (!lastMoveEvent) return;

    const L = currentLevel();
    const p = getCanvasPos(lastMoveEvent);

    const pickEdge = chooseEdgeByPointer(L, currentNode, p);
    if (!pickEdge) return;

    const toPt = L.nodes[pickEdge.to];
    if (Math.hypot(p.x - toPt.x, p.y - toPt.y) > 26) return;

    stepTo(pickEdge.to, pickEdge.edgeId);
  });
});

canvas.addEventListener("pointerup", () => {
  isDrawing = false;
});

// ---------- Buttons ----------
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

btnPrev.addEventListener("click", () => gotoLevel(levelIndex - 1, true));

btnNext.addEventListener("click", () => {
  if ((levelIndex + 2) > unlocked) {
    setMessage("🔒 Conclua este nível para desbloquear o próximo.", "warn");
    draw();
    return;
  }
  gotoLevel(levelIndex + 1, true);
});

// ---------- Modal ----------
function openModal() { if (modal) modal.hidden = false; }
function closeModal() { if (modal) modal.hidden = true; }

btnHelp?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openModal(); });
btnClose?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); closeModal(); });
modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
modalCard?.addEventListener("click", (e) => { e.stopPropagation(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ---------- LocalStorage ----------
function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeStore(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

function updateUnlockFromDone(data) {
  const done = data.doneLevels || {};
  let maxDone = 0;
  for (const k of Object.keys(done)) if (done[k]) maxDone = Math.max(maxDone, Number(k));
  const computed = clamp(maxDone + 1, 1, LEVELS_TOTAL);
  const stored = typeof data.unlocked === "number" ? clamp(data.unlocked, 1, LEVELS_TOTAL) : 1;
  return Math.max(stored, computed);
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
    const s = startNodeForLevel(L);
    if (s != null) setMessage(`Nível ${L.id} (${L.difficulty}) • ${L.label}. Comece no ponto verde.`, "muted");
    else setMessage(`Nível ${L.id} (${L.difficulty}) • ${L.label}. Pode começar em qualquer ponto.`, "muted");
  }

  writeStore(data);
}

// ---------- Init ----------
function init() {
  getLevel(levelIndex);
  setTimeout(() => { if (levelIndex + 1 < LEVELS_TOTAL) getLevel(levelIndex + 1); }, 0);
  loadLevelProgress();
  draw();
}
init();
