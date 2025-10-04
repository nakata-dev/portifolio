// --- Perguntas de HTML ---
let htmlQuestions = [
  { question: "Qual é a tag usada para criar parágrafos em HTML?", answer: "<p>", hint: "É a letra inicial de 'parágrafo'." },
  { question: "Qual tag usamos para criar uma lista ordenada?", answer: "<ol>", hint: "O 'O' significa 'ordered'." },
  { question: "Qual tag usamos para criar uma lista não ordenada?", answer: "<ul>", hint: "O 'U' significa 'unordered'." },
  { question: "Qual tag é usada para adicionar uma imagem?", answer: "<img>", hint: "É uma abreviação de 'image'." },
  { question: "Qual atributo da tag <img> define o caminho da imagem?", answer: "src", hint: "Significa 'source'." },
  { question: "Qual atributo usamos em <img> para descrever a imagem?", answer: "alt", hint: "Serve como texto alternativo." },
  { question: "Qual tag usamos para criar links?", answer: "<a>", hint: "Significa 'anchor'." },
  { question: "Qual atributo usamos em <a> para abrir em nova aba?", answer: "target=\"_blank\"", hint: "O valor precisa ser _blank." },
  { question: "Qual tag usamos para criar uma tabela?", answer: "<table>", hint: "É a própria palavra 'tabela' em inglês." },
  { question: "Qual tag usamos para criar uma linha em uma tabela?", answer: "<tr>", hint: "Significa 'table row'." },
];

// --- Perguntas de CSS ---
let cssQuestions = [
  { question: "Qual propriedade CSS muda o tamanho da fonte?", answer: "font-size", hint: "É a combinação de 'fonte' + 'tamanho'." },
  { question: "Qual propriedade CSS muda o fundo de um elemento?", answer: "background-color", hint: "Relaciona-se com a cor do fundo." },
  { question: "Qual propriedade CSS coloca o texto em negrito?", answer: "font-weight", hint: "Está ligada ao peso da fonte." },
  { question: "Qual valor de font-weight deixa o texto em negrito?", answer: "bold", hint: "É uma palavra em inglês que significa 'forte'." },
  { question: "Qual propriedade CSS centraliza o texto?", answer: "text-align", hint: "É o alinhamento do texto." },
  { question: "Qual propriedade CSS muda a cor da borda?", answer: "border-color", hint: "É a cor da linha de contorno." },
  { question: "Qual propriedade CSS define espaçamento interno?", answer: "padding", hint: "É o 'acolchoamento' dentro da caixa." },
  { question: "Qual propriedade CSS define espaçamento externo?", answer: "margin", hint: "É a margem entre elementos." },
  { question: "Qual unidade relativa usa-se para tamanho proporcional ao elemento pai?", answer: "em", hint: "É uma unidade relativa ao tamanho da fonte atual." },
  { question: "Qual unidade é proporcional à largura da tela?", answer: "vw", hint: "Significa 'viewport width'." },
];

// --- Perguntas de JavaScript ---
let jsQuestions = [
  { question: "Qual comando JS exibe uma janela de alerta?", answer: "alert()", hint: "É usado para mostrar mensagens simples ao usuário." },
  { question: "Qual comando JS pede uma entrada de texto ao usuário?", answer: "prompt()", hint: "É usado para perguntar algo." },
  { question: "Qual comando JS pede confirmação (OK ou Cancelar)?", answer: "confirm()", hint: "É usado para respostas de 'sim ou não'." },
  { question: "Qual operador usamos para somar valores em JS?", answer: "+", hint: "É o mesmo usado em matemática." },
  { question: "Qual operador usamos para verificar igualdade em valor e tipo?", answer: "===", hint: "São três sinais iguais." },
  { question: "Qual palavra-chave declaramos uma variável que pode mudar?", answer: "let", hint: "É mais moderna que 'var'." },
  { question: "Qual palavra-chave declaramos uma variável que não muda?", answer: "const", hint: "Vem de 'constant'." },
  { question: "Qual função transforma texto em número inteiro?", answer: "parseInt()", hint: "Começa com 'parse'." },
  { question: "Qual função transforma texto em número decimal?", answer: "parseFloat()", hint: "É parecida com parseInt, mas aceita casas decimais." },
  { question: "Qual comando interrompe um loop for?", answer: "break", hint: "É a palavra em inglês para 'quebrar'." },
];

// --- Variáveis globais ---
let questions = [];
let currentQuestion = 0;
let score = 0;

// Referências DOM
let questionContainer = document.getElementById("question-container");
let hint = document.getElementById("hint");
let answerInput = document.getElementById("answer");
let feedback = document.getElementById("feedback");
let progressBar = document.getElementById("progress-bar");
let progressText = document.getElementById("progress-text");
let finalScore = document.getElementById("final-score");

// Início do quiz
function startQuiz(subject) {
  if (subject === 'html') questions = htmlQuestions;
  if (subject === 'css') questions = cssQuestions;
  if (subject === 'js') questions = jsQuestions;

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  currentQuestion = 0;
  score = 0;
  updateProgress();
  loadQuestion();
}

// Carrega pergunta
function loadQuestion() {
  if (currentQuestion < questions.length) {
    let q = questions[currentQuestion];
    questionContainer.innerHTML = `<h3>${q.question}</h3>`;
    hint.innerText = `💡 Dica: ${q.hint}`;
    answerInput.value = "";
    feedback.innerText = "";
  } else {
    showFinalScore();
  }
}

// Verifica resposta
function checkAnswer() {
  let userAnswer = answerInput.value.trim().toLowerCase();
  let correctAnswer = questions[currentQuestion].answer.toLowerCase();

  if (userAnswer === correctAnswer) {
    feedback.innerText = "✅ Correto!";
    feedback.style.color = "green";
    score++;
  } else {
    feedback.innerText = `❌ Errado! Resposta correta: ${questions[currentQuestion].answer}`;
    feedback.style.color = "red";
  }

  currentQuestion++;
  updateProgress();
  setTimeout(loadQuestion, 1500);
}

// Atualiza progresso
function updateProgress() {
  let percentage = Math.round((currentQuestion / questions.length) * 100);
  progressBar.style.width = percentage + "%";
  progressText.innerText = `Progresso: ${percentage}%`;
}

// Mostra nota final
function showFinalScore() {
  questionContainer.innerHTML = `<h2>Parabéns, você terminou o teste!</h2>`;
  hint.innerText = "";
  answerInput.style.display = "none";
  document.querySelector("#quiz button").style.display = "none";

  let percentScore = Math.round((score / questions.length) * 100);
  finalScore.innerText = `🎉 Sua nota: ${score}/${questions.length} (${percentScore}%)`;
}


