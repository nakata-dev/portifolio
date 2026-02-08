// money-effects.js (COMPLETO)
// Responsável pelo “pop” visual no Saldo e som opcional (discreto).
// Usado pelo app.js via: window.NakataMoneyFX?.pop?.(elemento, soundOn)

(() => {
  const FX = {};
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let audioCtx = null;

  function ensureMoneyIcon() {
    // Injeta um ícone discreto ao lado do texto "Saldo" (CSS já existe: .sum-k .money-ico)
    const card = document.querySelector("#sumBalanceCard");
    if (!card) return;

    const k = card.querySelector(".sum-k");
    if (!k) return;

    if (!k.querySelector(".money-ico")) {
      const ico = document.createElement("span");
      ico.className = "money-ico";
      ico.setAttribute("aria-hidden", "true");
      k.appendChild(ico);
    }
  }

  function playPing() {
    // Som curtinho, bem discreto. Sem depender de arquivo externo.
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;

      // Em alguns navegadores, precisa "acordar" o contexto após interação do usuário
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

      // Volume baixinho
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Silencioso: se falhar, só não toca.
    }
  }

  function pop(el, soundOn) {
    if (!el) return;

    ensureMoneyIcon();

    // Se o usuário prefere menos animações, não faz glow (mas pode tocar som se quiser)
    if (!prefersReduced) {
      // Força “restart” da animação
      el.classList.remove("money-pop");
      // eslint-disable-next-line no-unused-expressions
      el.offsetWidth;
      el.classList.add("money-pop");

      const cleanup = () => el.classList.remove("money-pop");
      // Remove no fim da animação ou após fallback
      el.addEventListener("animationend", cleanup, { once: true });
      setTimeout(cleanup, 1100);
    }

    if (soundOn) playPing();
  }

  FX.pop = pop;

  // expõe globalmente
  window.NakataMoneyFX = FX;

  // tenta injetar o ícone ao carregar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureMoneyIcon, { once: true });
  } else {
    ensureMoneyIcon();
  }
})();
