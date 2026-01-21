// =========================
// CARROSSEL: Recomendado por (AUTO)
// - troca automaticamente a cada 3s
// - setas e bolinhas funcionam normal
// - quando eu interajo, reinicia o tempo
// - pausa quando passo o mouse (desktop)
// =========================

(function () {
  const trilho = document.getElementById("trilho");
  const bolinhasArea = document.getElementById("bolinhas");
  const setaEsquerda = document.getElementById("setaEsquerda");
  const setaDireita = document.getElementById("setaDireita");

  if (!trilho || !bolinhasArea) return;

  const slides = Array.from(trilho.children);
  const bolinhas = Array.from(bolinhasArea.querySelectorAll(".bolinha"));

  let indiceAtual = 0;
  let intervalo = null;
  const TEMPO = 3000; // ✅ 3 segundos

  function irParaSlide(indice) {
    indiceAtual = (indice + slides.length) % slides.length;

    trilho.style.transform = `translateX(-${indiceAtual * 100}%)`;

    bolinhas.forEach((b, i) => {
      b.classList.toggle("ativa", i === indiceAtual);
    });
  }

  function proximoSlide() {
    irParaSlide(indiceAtual + 1);
  }

  function iniciarAuto() {
    pararAuto(); // Nota minha: evito duplicar intervalos
    intervalo = setInterval(proximoSlide, TEMPO);
  }

  function pararAuto() {
    if (intervalo) clearInterval(intervalo);
    intervalo = null;
  }

  function reiniciarAuto() {
    iniciarAuto();
  }

  // ✅ Setas
  if (setaEsquerda) {
    setaEsquerda.addEventListener("click", () => {
      irParaSlide(indiceAtual - 1);
      reiniciarAuto();
    });
  }

  if (setaDireita) {
    setaDireita.addEventListener("click", () => {
      irParaSlide(indiceAtual + 1);
      reiniciarAuto();
    });
  }

  // ✅ Bolinhas clicáveis
  bolinhas.forEach((b, i) => {
    b.addEventListener("click", () => {
      irParaSlide(i);
      reiniciarAuto();
    });
  });

  // ✅ Pausar ao passar o mouse (opcional e bem profissional)
  const areaCarrossel = trilho.parentElement; // janela
  if (areaCarrossel) {
    areaCarrossel.addEventListener("mouseenter", pararAuto);
    areaCarrossel.addEventListener("mouseleave", iniciarAuto);
  }

  // ✅ Inicia no primeiro slide e liga o automático
  irParaSlide(0);
  iniciarAuto();
})();
