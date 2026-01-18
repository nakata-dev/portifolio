// === CONFIGURE AQUI SEU WHATSAPP (DDI+DDD+NUMERO) ===
// Exemplo real: "5511999999999"
const WHATSAPP_NUMBER = "5544998398116";

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================
   MODAL (Orçamento)
========================= */
function openModal() {
  const overlay = document.querySelector("[data-modal-overlay]");
  if (!overlay) return;
  overlay.classList.add("open");
}

function closeModal() {
  const overlay = document.querySelector("[data-modal-overlay]");
  if (!overlay) return;
  overlay.classList.remove("open");
}

function setupModal() {
  const openers = document.querySelectorAll("[data-open-modal]");
  const closers = document.querySelectorAll("[data-close-modal]");
  const overlay = document.querySelector("[data-modal-overlay]");

  openers.forEach(btn => btn.addEventListener("click", openModal));
  closers.forEach(btn => btn.addEventListener("click", closeModal));

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }
}

/* =========================
   YEAR
========================= */
function setupYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* =========================
   WhatsApp Float
   - Aparece após 5s
   - Ativa pulso + borda gradiente (Animated Border Gradient)
========================= */
function setupWhatsAppFloat() {
  const btn = document.querySelector("[data-wa-float]");
  if (!btn) return;

  // Estado inicial: garante oculto (CSS controla visual, aqui é reforço)
  btn.classList.remove("is-visible", "is-attention");

  // Click: abre WhatsApp e (opcional) para a animação depois do 1º clique
  btn.addEventListener("click", () => {
    const msg =
      "Olá Ailton! Quero um site profissional para meu negócio.\n" +
      "Segmento: ____\n" +
      "Objetivo: (vender / WhatsApp / orçamento) ____\n" +
      "Prazo: ____\n";
    openWhatsApp(msg);

    // opcional: depois do clique, para de pulsar pra não “gritar” demais
    btn.classList.remove("is-attention");
  });

  // Mostra e ativa após 5s do carregamento completo
  window.addEventListener("load", () => {
    setTimeout(() => {
      btn.classList.add("is-visible");   // surge
      btn.classList.add("is-attention"); // pulsa + borda gira
    }, 5000);
  });
}

/* =========================
   Form de Orçamento
========================= */
function setupBudgetForm() {
  const form = document.querySelector("[data-budget-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = form.querySelector("[name='nome']")?.value?.trim() || "";
    const negocio = form.querySelector("[name='negocio']")?.value?.trim() || "";
    const tipo = form.querySelector("[name='tipo']")?.value || "";
    const objetivo = form.querySelector("[name='objetivo']")?.value || "";
    const prazo = form.querySelector("[name='prazo']")?.value?.trim() || "";
    const referencia = form.querySelector("[name='referencia']")?.value?.trim() || "";
    const detalhes = form.querySelector("[name='detalhes']")?.value?.trim() || "";

    const msg =
      `Olá Ailton! Quero um orçamento.\n\n` +
      `Nome: ${nome}\n` +
      `Negócio/Segmento: ${negocio}\n` +
      `Tipo de site: ${tipo}\n` +
      `Objetivo: ${objetivo}\n` +
      `Prazo: ${prazo}\n` +
      `Referência/Exemplo: ${referencia}\n\n` +
      `Detalhes:\n${detalhes}\n`;

    openWhatsApp(msg);
    closeModal();
  });
}

/* =========================
   Certificados: Preview
========================= */
function setupCertificatePreview() {
  const buttons = document.querySelectorAll("[data-cert-btn]");
  const overlay = document.querySelector("[data-cert-overlay]");
  const imgEl = document.querySelector("[data-cert-img]");
  const titleEl = document.querySelector("[data-cert-title]");
  const downloadLink = document.querySelector("[data-cert-download]");

  if (!buttons.length || !overlay || !imgEl || !titleEl || !downloadLink) return;

  const open = (src, title) => {
    imgEl.src = src;
    imgEl.alt = title;
    titleEl.textContent = title;
    downloadLink.href = src;
    overlay.classList.add("open");
  };

  const close = () => overlay.classList.remove("open");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src");
      const title = btn.getAttribute("data-title") || "Certificado";
      if (src) open(src, title);
    });
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.querySelectorAll("[data-cert-close]").forEach(b => b.addEventListener("click", close));
}

/* =========================
   TOC (Sumário nas aulas)
========================= */
function setupTOC() {
  const toc = document.querySelector("[data-toc]");
  if (!toc) return;

  const headings = document.querySelectorAll(".lesson h2, .lesson .steps h3");
  if (!headings.length) {
    toc.innerHTML = "<p class='muted'>Sem seções disponíveis.</p>";
    return;
  }

  headings.forEach((h, i) => {
    const id = h.id || `sec-${i + 1}`;
    h.id = id;

    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = h.textContent.trim();
    toc.appendChild(a);
  });
}

/* =========================
   BURGER MENU (MOBILE)
========================= */
function setupMobileNav() {
  const btn = document.querySelector("[data-nav-toggle]") || document.querySelector(".nav-toggle");
  const nav = document.querySelector("[data-nav]") || document.querySelector(".nav");
  if (!btn || !nav) return;

  const icon = btn.querySelector(".material-symbols-outlined");

  function openNav() {
    nav.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Fechar menu");
    if (icon) icon.textContent = "close";
  }

  function closeNav() {
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Abrir menu");
    if (icon) icon.textContent = "menu";
  }

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNav();
  });

  document.addEventListener("click", (e) => {
    const clickedInside = nav.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeNav();
  });
}

/* =========================
   Handlers globais de ESC
========================= */
function setupGlobalEsc() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal();
    const cert = document.querySelector("[data-cert-overlay]");
    if (cert) cert.classList.remove("open");
  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  setupYear();
  setupModal();
  setupWhatsAppFloat();
  setupBudgetForm();
  setupCertificatePreview();
  setupTOC();
  setupMobileNav();
  setupGlobalEsc();
});
