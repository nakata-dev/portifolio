// 1. Definição das Cores
const COLORS = [
    { id: "blue",   hex: "#2E7DFF" },
    { id: "red",    hex: "#FF3D5C" },
    { id: "green",  hex: "#00E59B" },
    { id: "yellow", hex: "#FFD84A" },
    { id: "black",  hex: "#1B1F27" }
];

// 2. Estado do Jogo
let state = {
    p1Score: 0, p2Score: 0,
    turn: 1, round: 1,
    target: [], build: [],
    isMemorizing: false
};

// 3. Elementos do DOM
const el = {
    grid: document.getElementById('challenge-grid'),
    build: document.getElementById('player-build'),
    palette: document.getElementById('palette'),
    timer: document.getElementById('time-val'),
    msg: document.getElementById('msg-text'),
    p1Card: document.getElementById('p1-card'),
    p2Card: document.getElementById('p2-card'),
    p1Pts: document.getElementById('p1-points'),
    p2Pts: document.getElementById('p2-points'),
    overlay: document.getElementById('overlay')
};

// --- FUNÇÃO DE ÁUDIO (Gera sons via código) ---
function playSound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
        // Som agudo e ascendente
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    } else {
        // Som grave e seco
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    }

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

// 4. Inicialização
function init() {
    renderPalette();
    setupListeners();
    showTurnOverlay();
}

function renderPalette() {
    el.palette.innerHTML = '';
    COLORS.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color.hex;
        btn.onclick = () => addToBuild(color);
        el.palette.appendChild(btn);
    });
}

function showTurnOverlay() {
    document.getElementById('overlay-title').textContent = `VEZ DO JOGADOR ${state.turn}`;
    el.overlay.classList.add('show');
}

function startRound() {
    el.overlay.classList.remove('show');
    state.build = [];
    state.target = [...COLORS].sort(() => Math.random() - 0.5); // Embaralha
    state.isMemorizing = true;
    
    updateUI();
    renderBuild();
    renderChallenge(false); // Mostra as cores
    
    // Timer de Memorização
    let timeLeft = 5;
    el.timer.textContent = timeLeft;
    el.msg.textContent = "👀 MEMORIZE!";

    const countdown = setInterval(() => {
        timeLeft--;
        el.timer.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            state.isMemorizing = false;
            renderChallenge(true); // Esconde as cores
            el.msg.textContent = "🚀 MONTE A SEQUÊNCIA!";
        }
    }, 1000);
}

// Renderiza os quadros do desafio (horizontal)
function renderChallenge(isHidden) {
    el.grid.innerHTML = '';
    state.target.forEach(color => {
        const div = document.createElement('div');
        div.className = 'color-square';
        if (isHidden) {
            div.classList.add('hidden-square');
            div.textContent = '?';
        } else {
            div.style.backgroundColor = color.hex;
        }
        el.grid.appendChild(div);
    });
}

function addToBuild(color) {
    if (state.isMemorizing || state.build.length >= 5) return;
    state.build.push(color);
    renderBuild();
}

function renderBuild() {
    el.build.innerHTML = '';
    state.build.forEach(color => {
        const div = document.createElement('div');
        div.className = 'color-square';
        div.style.backgroundColor = color.hex;
        el.build.appendChild(div);
    });
}

function checkResult() {
    if (state.build.length < 5) return;

    const win = state.build.every((c, i) => c.id === state.target[i].id);

    if (win) {
        if (state.turn === 1) state.p1Score++; else state.score2++; // Ajuste p2Score
        state.p2Score = (state.turn === 2) ? state.p2Score + 1 : state.p2Score;
        playSound('success');
        el.msg.textContent = "✅ ACERTOU!";
    } else {
        playSound('error');
        el.msg.textContent = "❌ ERROU!";
    }

    // Atualiza Placar
    el.p1Pts.textContent = state.p1Score;
    el.p2Pts.textContent = state.p2Score;

    // Checa Vitória Final (10 pontos)
    if (state.p1Score >= 10 || state.p2Score >= 10) {
        alert(`FIM DE JOGO! Jogador ${state.p1Score >= 10 ? '1' : '2'} venceu!`);
        location.reload();
        return;
    }

    // Próximo Turno
    setTimeout(() => {
        state.turn = (state.turn === 1) ? 2 : 1;
        showTurnOverlay();
    }, 1500);
}

function updateUI() {
    el.p1Card.classList.toggle('active', state.turn === 1);
    el.p2Card.classList.toggle('active', state.turn === 2);
    document.getElementById('round-val').textContent = state.round;
}

function setupListeners() {
    document.getElementById('btn-start').onclick = startRound;
    document.getElementById('btn-bell').onclick = checkResult;
    document.getElementById('btn-undo').onclick = () => { state.build.pop(); renderBuild(); };
    document.getElementById('btn-clear').onclick = () => { state.build = []; renderBuild(); };
}

init();