const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [], playerHand = [], cpuHand = [], discardPile = [], vira = null, coringa = null;
let selectedCartaIndex = null;
let turn = 'player'; // 'player' ou 'cpu'
let gameState = 'drawing'; // 'drawing' ou 'discarding'

// --- LÓGICA DE CARTAS ---
function createDeck() {
    deck = [];
    SUITS.forEach(s => VALUES.forEach(v => deck.push({ suit: s, value: v })));
    deck = deck.sort(() => Math.random() - 0.5);
}

function getCoringa(vira) {
    const idx = VALUES.indexOf(vira.value);
    const nextVal = VALUES[(idx + 1) % VALUES.length];
    return { value: nextVal, suit: vira.suit };
}

function isCoringa(card) {
    return card.value === coringa.value && card.suit === coringa.suit;
}

// --- INTERFACE ---
function renderSVG(suit) {
    const color = (suit === 'hearts' || suit === 'diamonds') ? '#e74c3c' : '#2c3e50';
    const paths = {
        hearts: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
        diamonds: "M12 2l-9 10 9 10 9-10-9-10z",
        clubs: "M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
        spades: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"
    };
    return `<svg viewBox="0 0 24 24" width="24" fill="${color}"><path d="${paths[suit]}"/></svg>`;
}

function updateUI() {
    const handEl = document.getElementById('player-hand');
    handEl.innerHTML = '';
    
    playerHand.forEach((card, i) => {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${selectedCartaIndex === i ? 'selected' : ''}`;
        if(isCoringa(card)) cardEl.style.backgroundColor = '#fff9c4';
        
        cardEl.innerHTML = `<div>${card.value}</div>${renderSVG(card.suit)}<div style="transform:rotate(180deg)">${card.value}</div>`;
        
        // Efeito Leque
        const angle = (i - (playerHand.length - 1) / 2) * 8;
        const xPos = (i - (playerHand.length - 1) / 2) * 25;
        cardEl.style.transform = `translateX(${xPos}px) rotate(${angle}deg)`;
        
        cardEl.onclick = () => {
            if(gameState === 'discarding') {
                selectedCartaIndex = i;
                updateUI();
                document.getElementById('message-log').innerText = "Toque em 'Descartar' para confirmar.";
            }
        };
        handEl.appendChild(cardEl);
    });

    // Vira e Lixo
    document.getElementById('wild-card-slot').innerHTML = '';
    const viraEl = document.createElement('div');
    viraEl.className = 'card';
    viraEl.innerHTML = `<div>${vira.value}</div>${renderSVG(vira.suit)}`;
    document.getElementById('wild-card-slot').appendChild(viraEl);

    const trashEl = document.getElementById('discard-pile');
    if(discardPile.length > 0) {
        const topTrash = discardPile[discardPile.length - 1];
        trashEl.className = 'card';
        trashEl.innerHTML = `<div>${topTrash.value}</div>${renderSVG(topTrash.suit)}`;
    } else {
        trashEl.className = 'card-slot-empty';
        trashEl.innerHTML = '';
    }

    // Botões
    document.getElementById('btn-draw-deck').disabled = (turn !== 'player' || gameState !== 'drawing');
    document.getElementById('btn-draw-trash').disabled = (turn !== 'player' || gameState !== 'drawing' || discardPile.length === 0);
}

// --- REGRAS E JOGO ---
function init() {
    createDeck();
    playerHand = deck.splice(0, 9);
    cpuHand = deck.splice(0, 9);
    vira = deck.pop();
    coringa = getCoringa(vira);
    updateUI();
}

document.getElementById('btn-draw-deck').onclick = () => {
    playerHand.push(deck.pop());
    gameState = 'discarding';
    document.getElementById('btn-draw-deck').innerText = "Descartar Selecionada";
    document.getElementById('btn-draw-deck').onclick = discardPlayerCard;
    updateUI();
};

function discardPlayerCard() {
    if(selectedCartaIndex === null) return alert("Selecione uma carta para descartar!");
    
    const removed = playerHand.splice(selectedCartaIndex, 1)[0];
    discardPile.push(removed);
    selectedCartaIndex = null;
    gameState = 'drawing';
    
    // Volta botão ao estado original
    document.getElementById('btn-draw-deck').innerText = "Comprar Monte";
    document.getElementById('btn-draw-deck').onclick = () => { /* re-atribuído acima */ }; 
    
    turn = 'cpu';
    updateUI();
    setTimeout(cpuTurn, 1500);
}

function cpuTurn() {
    document.getElementById('cpu-status').innerText = "CPU comprando...";
    // IA Simples: Sempre compra do monte
    cpuHand.push(deck.pop());
    
    setTimeout(() => {
        document.getElementById('cpu-status').innerText = "CPU descartando...";
        const discardIdx = Math.floor(Math.random() * cpuHand.length);
        const removed = cpuHand.splice(discardIdx, 1)[0];
        discardPile.push(removed);
        
        turn = 'player';
        document.getElementById('cpu-status').innerText = "Sua vez!";
        updateUI();
        // Reset do botão de compra para o player
        document.getElementById('btn-draw-deck').onclick = () => {
             playerHand.push(deck.pop());
             gameState = 'discarding';
             document.getElementById('btn-draw-deck').innerText = "Descartar Selecionada";
             document.getElementById('btn-draw-deck').onclick = discardPlayerCard;
             updateUI();
        };
    }, 1500);
}

init();