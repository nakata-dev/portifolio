/* ==========================
   Traço Único (One-Stroke)
   Regras corretas:
   - traço contínuo de nó em nó
   - cada aresta no máximo 1 vez
   - não "corta" no meio: só vale se conectar nós por uma aresta existente
   - início sugerido: nós de grau ímpar (quando existirem)
   LocalStorage:
   - nível atual
   - progresso do nível (arestas usadas + nó atual + histórico)
========================== */

const LS_KEY = "traco_unico_v2";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const msg = document.getElementById("msg");
const lvlTxt = document.getElementById("lvl");
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

// -------------------- Levels (nodes + edges) --------------------
// Cada nível: nodes = [{x,y}], edges = [[a,b],...]
const LEVELS = [
  // 1) Triângulo (2 ímpares)
  {
    nodes: pts([[90,250],[180,110],[270,250]]),
    edges: [[0,1],[1,2],[2,0]]
  },
  // 2) Quadrado (0 ímpares) - pode começar em qualquer nó
  {
    nodes: pts([[100,110],[260,110],[260,270],[100,270]]),
    edges: [[0,1],[1,2],[2,3],[3,0]]
  },
  // 3) "Casa" (telhado + quadrado)
  {
    nodes: pts([[110,260],[250,260],[250,150],[110,150],[180,90]]),
    edges: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,2]]
  },
  // 4) "Barquinho" simplificado
  {
    nodes: pts([[90,230],[180,120],[270,230],[120,270],[240,270]]),
    edges: [[0,1],[1,2],[2,0],[0,3],[2,4],[3,4]]
  },
  // 5) Grade 3x3 (2x2 células)
  {
    nodes: pts([[110,110],[200,110],[290,110],[110,200],[200,200],[290,200],[110,290],[200,290],[290,290]]),
    edges: [
      [0,1],[1,2],[3,4],[4,5],[6,7],[7,8],
      [0,3],[3,6],[1,4],[4,7],[2,5],[5,8]
    ]
  },
  // 6) Cruz com diagonais
  {
    nodes: pts([[180,70],[180,180],[180,290],[70,180],[290,180],[110,110],[250,110],[110,250],[250,250]]),
    edges: [
      [0,1],[1,2],[3,1],[1,4],
      [5,1],[6,1],[7,1],[8,1],
      [5,0],[6,0],[7,2],[8,2]
    ]
  },
  // 7) Hexágono com cordas
  {
    nodes: pts([[180,70],[260,120],[260,240],[180,290],[100,240],[100,120],[180,180]]),
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,0],[6,2],[6,4]]
  },
  // 8) “Duas caixas” conectadas
  {
    nodes: pts([[70,130],[160,130],[160,240],[70,240],[200,130],[290,130],[290,240],[200,240]]),
    edges: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[1,4],[2,7]]
  },
  // 9) Estrela simples
  {
    nodes: pts([[180,60],[230,270],[80,140],[280,140],[130,270]]),
    edges: [[0,1],[0,4],[2,3],[2,1],[3,4]]
  },
  // 10) Malha com centro (desafio)
  {
    nodes: pts([[100,100],[260,100],[100,260],[260,260],[180,180]]),
    edges: [
      [0,1],[1,3],[3,2],[2,0],
      [0,4],[1,4],[2,4],[3,4]
    ]
  }
];

// -------------------- State --------------------
let levelIndex = 0;
let usedEdges = new Set();     // edge indices
let history = [];              // stack of moves: {edgeId, fromNode, toNode}
let currentNode = null;        // node index where player is currently at
let isDrawing = false;         // pointer is pressed
let tries = 0;

let showStartHint = true;

// pointer tracking
let lastPointer = null;

// -------------------- Helpers --------------------
function pts(arr){ return arr.map(([x,y]) => ({x,y})); }

function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }

function getCanvasPos(e){
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}

function nearestNode(p, radius=18){
  const L = LEVELS[levelIndex];
  let bestId = null;
  let bestD = Infinity;

  for(let i=0;i<L.nodes.length;i++){
    const n = L.nodes[i];
    const d = Math.hypot(p.x - n.x, p.y - n.y);
    if(d < bestD){
      bestD = d;
      bestId = i;
    }
  }
  return bestD <= radius ? bestId : null;
}

function nodeDegree(nodeId){
  const L = LEVELS[levelIndex];
  let deg = 0;
  for(const [a,b] of L.edges){
    if(a === nodeId || b === nodeId) deg++;
  }
  return deg;
}

function startNodes(){
  const L = LEVELS[levelIndex];
  const odds = L.nodes
    .map((_,i) => ({i, deg: nodeDegree(i)}))
    .filter(o => o.deg % 2 === 1)
    .map(o => o.i);

  return odds.length ? odds : L.nodes.map((_,i)=>i);
}

function neighbors(nodeId){
  const L = LEVELS[levelIndex];
  const list = [];
  L.edges.forEach(([a,b],i)=>{
    if(a===nodeId) list.push({to:b, edgeId:i});
    if(b===nodeId) list.push({to:a, edgeId:i});
  });
  return list;
}

function pointToSegmentDistance(p, a, b){
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = p.x - a.x;
  const wy = p.y - a.y;

  const c1 = vx*wx + vy*wy;
  if(c1 <= 0) return Math.hypot(p.x-a.x, p.y-a.y);

  const c2 = vx*vx + vy*vy;
  if(c2 <= c1) return Math.hypot(p.x-b.x, p.y-b.y);

  const t = c1 / c2;
  const px = a.x + t*vx;
  const py = a.y + t*vy;
  return Math.hypot(p.x-px, p.y-py);
}

function chooseEdgeByPointer(fromNode, p){
  const L = LEVELS[levelIndex];
  const from = L.nodes[fromNode];

  const opts = neighbors(fromNode).filter(o => !usedEdges.has(o.edgeId));
  if(!opts.length) return null;

  let best = {edgeId:null, to:null, d:Infinity};

  for(const o of opts){
    const to = L.nodes[o.to];
    const d = pointToSegmentDistance(p, from, to);
    if(d < best.d){
      best = {edgeId:o.edgeId, to:o.to, d};
    }
  }

  // limite para não "pegar aresta errada"
  return best.d <= 18 ? best : null;
}

// -------------------- UI feedback --------------------
function setMessage(text, kind="muted"){
  msg.textContent = text;
  msg.style.color =
    kind === "ok" ? "#22c55e" :
    kind === "bad" ? "#fb7185" :
    "rgba(231,238,252,.72)";
}

// -------------------- Render --------------------
function draw(){
  const L = LEVELS[levelIndex];
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // glow suave
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(180,180,160,0,Math.PI*2);
  ctx.fill();
  ctx.restore();

  // edges
  ctx.lineCap = "round";
  ctx.lineWidth = 8;

  L.edges.forEach(([a,b],i)=>{
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
  if(showNodes){
    const starts = startNodes();
    L.nodes.forEach((n,i)=>{
      const isStart = showStartHint && starts.includes(i);
      const isCurrent = currentNode === i;

      ctx.beginPath();
      ctx.arc(n.x, n.y, isCurrent ? 9 : 7, 0, Math.PI*2);
      ctx.fillStyle = isCurrent ? "#60a5fa" : (isStart ? "#22c55e" : "rgba(255,255,255,.25)");
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,0,0,.35)";
      ctx.stroke();
    });
  }

  // HUD
  doneTxt.textContent = String(usedEdges.size);
  totalTxt.textContent = String(L.edges.length);
  lvlTxt.textContent = String(levelIndex + 1);
  triesTxt.textContent = String(tries);
  hintTxt.textContent = showStartHint ? "Start" : "Off";
}

// -------------------- Game flow --------------------
function resetLevel(keepTries=false){
  usedEdges.clear();
  history = [];
  currentNode = null;
  isDrawing = false;
  lastPointer = null;

  if(!keepTries) tries++;

  showStartHint = true;
  setMessage("Comece em um ponto válido e siga pelas linhas sem repetir.", "muted");

  saveProgress();
  draw();
}

function completeLevel(){
  navigator.vibrate?.(60);
  setMessage("🏆 Nível concluído! Indo para o próximo...", "ok");

  const data = readStore();
  data.doneLevels = data.doneLevels || {};
  data.doneLevels[levelIndex] = true;
  data.levelIndex = Math.min(levelIndex + 1, LEVELS.length - 1);
  writeStore(data);

  setTimeout(()=>{
    if(levelIndex < LEVELS.length - 1){
      levelIndex++;
      resetLevel(true);
    } else {
      setMessage("✨ Mestre do Traço! Você concluiu todos os níveis.", "ok");
    }
  }, 900);
}

function tryStartAt(nodeId){
  const allowed = startNodes();
  if(!allowed.includes(nodeId)){
    setMessage("❌ Comece por um ponto sugerido (verde).", "bad");
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

function stepTo(toNode, edgeId){
  if(usedEdges.has(edgeId)) return false;

  usedEdges.add(edgeId);
  history.push({ edgeId, fromNode: currentNode, toNode });
  currentNode = toNode;

  navigator.vibrate?.(18);
  saveProgress();
  draw();

  const total = LEVELS[levelIndex].edges.length;
  if(usedEdges.size === total){
    completeLevel();
  }
  return true;
}

function undo(){
  if(!history.length){
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
canvas.addEventListener("pointerdown", (e)=>{
  const p = getCanvasPos(e);
  lastPointer = p;

  // se não começou, precisa tocar num nó
  if(currentNode === null){
    const n = nearestNode(p, 22);
    if(n === null){
      setMessage("Toque em um ponto para começar.", "muted");
      return;
    }
    tryStartAt(n);
    return;
  }

  // se já tem nó atual, apenas ativa o desenho
  isDrawing = true;
});

canvas.addEventListener("pointermove", (e)=>{
  if(!isDrawing || currentNode === null) return;

  const p = getCanvasPos(e);
  lastPointer = p;

  const pick = chooseEdgeByPointer(currentNode, p);
  if(!pick) return;

  // só confirma se está perto do nó destino (evita marcar cedo)
  const toPt = LEVELS[levelIndex].nodes[pick.to];
  if(Math.hypot(p.x - toPt.x, p.y - toPt.y) > 26) return;

  stepTo(pick.to, pick.edgeId);
});

canvas.addEventListener("pointerup", ()=>{
  isDrawing = false;
});

// -------------------- Buttons --------------------
btnReset.addEventListener("click", ()=> resetLevel(false));
btnUndo.addEventListener("click", ()=> undo());

btnHint.addEventListener("click", ()=>{
  showStartHint = !showStartHint;
  draw();
});

btnNodes.addEventListener("click", ()=>{
  showNodes = !showNodes;
  btnNodes.textContent = showNodes ? "• Pontos" : "• Ocultos";
  saveProgress();
  draw();
});

btnPrev.addEventListener("click", ()=>{
  levelIndex = Math.max(0, levelIndex - 1);
  resetLevel(true);
});

btnNext.addEventListener("click", ()=>{
  levelIndex = Math.min(LEVELS.length - 1, levelIndex + 1);
  resetLevel(true);
});

// -------------------- MODAL (Correção robusta) --------------------
function openModal(){
  if(!modal) return;
  modal.hidden = false;
}

function closeModal(){
  if(!modal) return;
  modal.hidden = true;
}

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

// Fecha clicando no fundo (fora do card)
modal?.addEventListener("click", (e) => {
  if(e.target === modal) closeModal();
});

// Impede clique no card fechar o modal
modalCard?.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Fecha no ESC
window.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeModal();
});

// -------------------- LocalStorage --------------------
function readStore(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch{
    return {};
  }
}

function writeStore(data){
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function saveProgress(){
  const data = readStore();
  data.levelIndex = levelIndex;
  data.progress = data.progress || {};

  data.progress[levelIndex] = {
    used: Array.from(usedEdges),
    currentNode,
    history,
    tries,
    showNodes
  };

  writeStore(data);
}

function loadProgress(){
  const data = readStore();
  if(typeof data.levelIndex === "number"){
    levelIndex = clamp(data.levelIndex, 0, LEVELS.length - 1);
  }

  const p = data.progress?.[levelIndex];
  if(p){
    usedEdges = new Set(p.used || []);
    history = p.history || [];
    currentNode = (typeof p.currentNode === "number") ? p.currentNode : null;
    tries = p.tries || 0;
    showNodes = (typeof p.showNodes === "boolean") ? p.showNodes : true;

    showStartHint = currentNode === null;
    setMessage("Progresso carregado. Continue de onde parou.", "muted");
    btnNodes.textContent = showNodes ? "• Pontos" : "• Ocultos";
  }else{
    tries = 0;
    currentNode = null;
    usedEdges.clear();
    history = [];
    showStartHint = true;
    setMessage("Comece em um ponto válido e siga pelas linhas sem repetir.", "muted");
  }
}

// -------------------- Init --------------------
loadProgress();
draw();
