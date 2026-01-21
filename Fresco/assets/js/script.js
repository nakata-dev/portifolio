// Eu deixei esse JS simples e direto pra ficar fácil de manter:
// 1) abrir/fechar menu mobile
// 2) rolar pro topo (botão laranja)

(function(){
  const botaoMenu = document.getElementById("botaoMenu");
  const menuMobile = document.getElementById("menuMobile");
  const fecharMenu = document.getElementById("fecharMenu");
  const botaoTopo = document.getElementById("botaoTopo");

  function abrirMenu(){
    if(!menuMobile) return;
    menuMobile.classList.add("ativo");
    menuMobile.setAttribute("aria-hidden", "false");
    if(botaoMenu) botaoMenu.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function fecharMenuMobile(){
    if(!menuMobile) return;
    menuMobile.classList.remove("ativo");
    menuMobile.setAttribute("aria-hidden", "true");
    if(botaoMenu) botaoMenu.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if(botaoMenu) botaoMenu.addEventListener("click", abrirMenu);
  if(fecharMenu) fecharMenu.addEventListener("click", fecharMenuMobile);

  // Eu fecho clicando fora do conteúdo
  if(menuMobile){
    menuMobile.addEventListener("click", (e) => {
      if(e.target === menuMobile) fecharMenuMobile();
    });

    // Eu fecho clicando em qualquer link
    menuMobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", fecharMenuMobile);
    });
  }

  // Subir topo
  if(botaoTopo){
    botaoTopo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Eu deixei ESC fechando o menu (detalhe fino)
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") fecharMenuMobile();
  });
})();

// =========================
// BOTÃO VOLTAR AO TOPO
// Nota minha: ele só aparece quando eu desço a página
// =========================

(function () {
  const botaoTopo = document.getElementById("botaoTopo");
  if (!botaoTopo) return;

  // ✅ começa escondido
  botaoTopo.classList.add("sumir");

  function controlarVisibilidade() {
    // Nota minha: a partir de 300px descendo eu mostro o botão
    if (window.scrollY > 300) {
      botaoTopo.classList.remove("sumir");
      botaoTopo.classList.add("aparecer");
    } else {
      botaoTopo.classList.remove("aparecer");
      botaoTopo.classList.add("sumir");
    }
  }

  // ✅ sobe suave ao clicar
  botaoTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ✅ verifica sempre que eu rolar
  window.addEventListener("scroll", controlarVisibilidade);

  // ✅ roda uma vez ao abrir a página
  controlarVisibilidade();
})();
