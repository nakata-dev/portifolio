// VARIÁVEL GLOBAL PARA ARMAZENAR OS HÁBITOS
let habits = [];

// === FUNÇÕES DE UTILIDADE ===

/**
 * Retorna a data de hoje no formato YYYY-MM-DD para uso consistente no localStorage.
 */
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Carrega os hábitos do localStorage ou define exemplos iniciais.
 */
const loadHabits = () => {
    const json = localStorage.getItem('habitTrackerHabits');
    if (json) {
        habits = JSON.parse(json);
    } else {
        // Hábitos iniciais para teste
        habits = [
            { name: "Beber 2L de Água", completedDates: [] },
            { name: "Ler por 30 minutos", completedDates: [] }
        ];
    }
};

/**
 * Salva o array de hábitos no localStorage.
 */
const saveHabits = () => {
    localStorage.setItem('habitTrackerHabits', JSON.stringify(habits));
};

// === FUNÇÕES DE AÇÃO ===

/**
 * Alterna o estado de conclusão do hábito para o dia atual.
 */
const toggleHabit = (event) => {
    const index = event.target.getAttribute('data-index');
    const habit = habits[index];
    const today = getTodayDate();

    const isCompleted = habit.completedDates.includes(today);

    if (isCompleted) {
        // Se já está marcado, desmarca: remove a data de hoje
        habit.completedDates = habit.completedDates.filter(date => date !== today);
    } else {
        // Se não está marcado, marca: adiciona a data de hoje
        habit.completedDates.push(today);
    }

    saveHabits();
    renderHabits(); // Atualiza a visualização
};

/**
 * Remove um hábito da lista após confirmação.
 */
const removeHabit = (event) => {
    const index = event.target.getAttribute('data-index');
    
    // Confirmação para evitar exclusões acidentais
    if (confirm("Tem certeza que deseja remover este hábito?")) {
        // Remove 1 elemento do array a partir do índice
        habits.splice(index, 1); 
        
        saveHabits();
        renderHabits(); // Atualiza a visualização
    }
};


/**
 * Adiciona um novo hábito (função chamada pelo formulário).
 */
const addHabit = (event) => {
    event.preventDefault(); // Impede o recarregamento da página
    const input = document.getElementById('new-habit-input');
    const name = input.value.trim();

    // Verifica se o nome não está vazio e se o hábito já não existe
    if (name && !habits.some(h => h.name === name)) {
        habits.push({ name: name, completedDates: [] });
        saveHabits();
        renderHabits();
        input.value = ''; // Limpa o campo de texto
    } else if (habits.some(h => h.name === name)) {
        alert('Este hábito já foi adicionado!');
    }
};

// === FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO ===

/**
 * Desenha a lista completa de hábitos na tela, incluindo botões de check e remover.
 */
const renderHabits = () => {
    const list = document.getElementById('habit-list');
    list.innerHTML = ''; // Limpa a lista antes de redesenhar
    const today = getTodayDate();

    habits.forEach((habit, index) => {
        const isCompleted = habit.completedDates.includes(today);

        // 1. Cria o Item da Lista (li)
        const item = document.createElement('li');
        item.className = `habit-item ${isCompleted ? 'completed' : ''}`;
        
        // 2. Nome do Hábito
        const nameSpan = document.createElement('span');
        nameSpan.className = 'habit-name';
        nameSpan.textContent = habit.name;

        // 3. Botão de Check
        const checkButton = document.createElement('div');
        checkButton.className = 'habit-check';
        // Guarda o índice para saber qual hábito marcar
        checkButton.setAttribute('data-index', index); 
        
        if (isCompleted) {
             checkButton.innerHTML = '&#10003;'; // Símbolo de checkmark
        }

        checkButton.onclick = toggleHabit; // Adiciona o evento de clique para marcar/desmarcar

        // 4. Botão de Remover (x)
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-habit';
        removeButton.textContent = 'x'; 
        removeButton.setAttribute('data-index', index);
        removeButton.onclick = removeHabit; // Adiciona o evento de clique para remover

        // 5. Monta o <li>: Nome + Check + Remover
        item.appendChild(nameSpan);
        item.appendChild(checkButton);
        item.appendChild(removeButton);
        list.appendChild(item);
    });
};


// === INICIALIZAÇÃO ===

// Roda quando todo o HTML estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    loadHabits(); // Carrega os dados salvos
    renderHabits(); // Desenha a lista inicial
    
    // Adiciona o evento de submissão ao formulário para adicionar novos hábitos
    document.getElementById('habit-form').addEventListener('submit', addHabit);
});