// === CONFIGURE AQUI SEU WHATSAPP (DDI+DDD+NUMERO) ===
// Exemplo real: "5511999999999"
const WHATSAPP_NUMBER = "5500000000000";

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Modal helpers
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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function setupYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

function setupWhatsAppFloat() {
  const btn = document.querySelector("[data-wa-float]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const msg =
      "Olá Ailton! Quero um site profissional para meu negócio.\n" +
      "Segmento: ____\n" +
      "Objetivo: (vender / WhatsApp / orçamento) ____\n" +
      "Prazo: ____\n";
    openWhatsApp(msg);
  });
}

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

document.addEventListener("DOMContentLoaded", () => {
  setupYear();
  setupModal();
  setupWhatsAppFloat();
  setupBudgetForm();
});

function setupCertificatePreview(){
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
      open(src, title);
    });
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.querySelectorAll("[data-cert-close]").forEach(b => b.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// No seu DOMContentLoaded, adicione:
document.addEventListener("DOMContentLoaded", () => {
  setupYear();
  setupModal();
  setupWhatsAppFloat();
  setupBudgetForm();
  setupCertificatePreview(); // <-- adiciona aqui
});
