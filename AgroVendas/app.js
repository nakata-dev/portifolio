(() => {
  "use strict";

  const STORAGE_KEY = "agrovendas_db_v2";
  const DEFAULT_PRODUCTS = [
    { name: "Benitaka", category: "Uva", default: true },
    { name: "Itália", category: "Uva", default: true },
    { name: "Vitória", category: "Uva", default: true },
    { name: "Núbia", category: "Uva", default: true },
    { name: "Pitaya", category: "Fruta", default: true }
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = loadDB();

  function loadDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return ensureStructure(parsed);
      }
    } catch (err) {
      console.error(err);
    }
    const fresh = createInitialDB();
    saveDB(fresh);
    return fresh;
  }

  function createInitialDB() {
    const now = new Date().toISOString();
    return {
      meta: {
        version: 2,
        createdAt: now,
        updatedAt: now
      },
      settings: {
        lastTab: "dashboard",
        theme: "light",
        profile: "",
        onboardingDone: false
      },
      agricultores: [],
      compradores: [],
      produtos: DEFAULT_PRODUCTS.map(p => ({
        id: uid("PROD"),
        name: p.name,
        category: p.category,
        notes: "",
        isDefault: !!p.default,
        createdAt: now,
        updatedAt: now
      })),
      entregas: [],
      pagamentos: []
    };
  }

  function ensureStructure(db) {
    const base = createInitialDB();
    const merged = {
      ...base,
      ...db,
      meta: { ...base.meta, ...(db.meta || {}) },
      settings: { ...base.settings, ...(db.settings || {}) },
      agricultores: Array.isArray(db.agricultores) ? db.agricultores : [],
      compradores: Array.isArray(db.compradores) ? db.compradores : [],
      produtos: Array.isArray(db.produtos) && db.produtos.length ? db.produtos : base.produtos,
      entregas: Array.isArray(db.entregas) ? db.entregas : [],
      pagamentos: Array.isArray(db.pagamentos)
        ? db.pagamentos.map(item => ({
            paymentMethod: "",
            allocations: [],
            ...item
          }))
        : []
    };
    merged.meta.updatedAt = new Date().toISOString();
    return merged;
  }

  function saveDB(db = state) {
    db.meta.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function nowDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function nowTime() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  function formatDateTime(dateStr, timeStr) {
    return `${formatDate(dateStr)} ${timeStr || ""}`.trim();
  }

  function money(value) {
    const num = Number(value || 0);
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function numberBR(value, digits = 2) {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function round2(n) {
    return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
  }

  function compareDateTimeDesc(a, b) {
    return `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
  }

  function compareDateTimeAsc(a, b) {
    return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
  }

  function showToast(message, type = "success") {
    const stack = $("#toastStack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function getAgricultorById(id) {
    return state.agricultores.find(x => x.id === id);
  }

  function getCompradorById(id) {
    return state.compradores.find(x => x.id === id);
  }

  function getProdutoById(id) {
    return state.produtos.find(x => x.id === id);
  }

  function getEntregaById(id) {
    return state.entregas.find(x => x.id === id);
  }

  function getPagamentoById(id) {
    return state.pagamentos.find(x => x.id === id);
  }

  function calcEntregaPaid(entregaId) {
    return round2(
      state.pagamentos.reduce((sum, pagamento) => {
        const alloc = (pagamento.allocations || []).find(a => a.deliveryId === entregaId);
        return sum + (alloc ? Number(alloc.amount || 0) : 0);
      }, 0)
    );
  }

  function calcEntregaPending(entrega) {
    return round2(Number(entrega.grossValue || 0) - calcEntregaPaid(entrega.id));
  }

  function calcEntregaStatus(entrega) {
    const bruto = round2(entrega.grossValue);
    const pago = calcEntregaPaid(entrega.id);
    if (pago <= 0) return "pendente";
    if (pago >= bruto) return "paga";
    return "parcialmente paga";
  }

  function statusBadge(status) {
    if (status === "paga") return `<span class="badge paid">Paga</span>`;
    if (status === "parcialmente paga") return `<span class="badge partial">Parcial</span>`;
    return `<span class="badge pending">Pendente</span>`;
  }

  function populateSelect(select, items, placeholder, mapper) {
    if (!select) return;
    select.innerHTML = "";
    if (placeholder !== null) {
      const first = document.createElement("option");
      first.value = "";
      first.textContent = placeholder;
      select.appendChild(first);
    }
    items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = mapper ? mapper(item) : item.name;
      select.appendChild(opt);
    });
  }

  function refreshAllSelects() {
    populateSelect($("#entregaAgricultor"), state.agricultores, "Selecione", x => x.name);
    populateSelect($("#entregaComprador"), state.compradores, "Selecione", x => x.name);
    populateSelect($("#entregaProduto"), state.produtos, "Selecione", x => `${x.name} (${x.category})`);

    populateSelect($("#pagamentoComprador"), state.compradores, "Selecione", x => x.name);
    populateSelect($("#pagamentoAgricultor"), state.agricultores, "Selecione", x => x.name);
    populateSelect($("#pagamentoProdutoFiltro"), state.produtos, "Todos os produtos", x => `${x.name} (${x.category})`);

    const pagamentoProduto = $("#pagamentoProduto");
    if (pagamentoProduto) {
      pagamentoProduto.innerHTML = '<option value="">Selecione uma entrega</option>';
      pagamentoProduto.disabled = true;
    }

    populateSelect($("#histAgricultor"), state.agricultores, "Todos", x => x.name);
    populateSelect($("#histComprador"), state.compradores, "Todos", x => x.name);
    populateSelect($("#histProduto"), state.produtos, "Todos", x => `${x.name} (${x.category})`);

    populateSelect($("#reportAgricultor"), state.agricultores, "Todos", x => x.name);
    populateSelect($("#reportComprador"), state.compradores, "Todos", x => x.name);
    populateSelect($("#reportProduto"), state.produtos, "Todos", x => `${x.name} (${x.category})`);
  }

  function sum(arr, field) {
    return round2(arr.reduce((acc, item) => acc + Number(item[field] || 0), 0));
  }

  function topBy(arr, keyFn, numericField = "totalWeight") {
    const map = new Map();
    arr.forEach(item => {
      const key = keyFn(item);
      const value = Number(item[numericField] || 0);
      map.set(key, (map.get(key) || 0) + value);
    });
    let best = null;
    map.forEach((total, key) => {
      if (!best || total > best.total) best = { key, total };
    });
    return best;
  }

  function filterByNamedPeriod(items, period) {
    const today = new Date();
    const ymd = nowDate();
    if (period === "geral") return items;

    return items.filter(item => {
      const d = new Date(`${item.date}T00:00:00`);
      if (period === "hoje") return item.date === ymd;
      if (period === "semana") {
        const first = new Date(today);
        const day = first.getDay() || 7;
        first.setDate(first.getDate() - day + 1);
        first.setHours(0, 0, 0, 0);
        const last = new Date(first);
        last.setDate(last.getDate() + 6);
        last.setHours(23, 59, 59, 999);
        return d >= first && d <= last;
      }
      if (period === "mes") {
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }
      return true;
    });
  }

  function getProfileMeta() {
    const profile = state.settings.profile || "ambos";
    if (profile === "vendedor") {
      return {
        label: "Vendedor / produtor",
        subtitle: "Acompanhe entregas, valores a receber e compradores responsáveis.",
        helper: "Foco em recebimentos e saldo a receber."
      };
    }
    if (profile === "comprador") {
      return {
        label: "Comprador / atravessador",
        subtitle: "Acompanhe recebimentos, pagamentos realizados e pendências de quitação.",
        helper: "Foco em pagamentos e saldo a pagar."
      };
    }
    return {
      label: "Visão completa",
      subtitle: "Painel geral com entregas, pagamentos e saldos do negócio.",
      helper: "Visão panorâmica com vendedor e comprador."
    };
  }

  function updateProfileUI() {
    const meta = getProfileMeta();
    const title = $("#dashboardTitle");
    const subtitle = $("#dashboardSubtitle");
    const badge = $("#profileBadgeText");
    const helper = $("#profileHelperText");
    const current = $("#currentProfileLabel");

    if (title) title.textContent = meta.label === "Visão completa" ? "Painel panorâmico" : `Painel ${meta.label.toLowerCase()}`;
    if (subtitle) subtitle.textContent = meta.subtitle;
    if (badge) badge.textContent = meta.label;
    if (helper) helper.textContent = meta.helper;
    if (current) current.textContent = meta.label;
  }

  function renderDashboard() {
    const periodo = $("#dashboardPeriodo");
    const cardsWrap = $("#dashboardCards");
    const highlights = $("#dashboardHighlights");
    const recentTable = $("#dashboardRecentDeliveries");
    const recentCards = $("#dashboardRecentDeliveriesCards");
    if (!periodo || !cardsWrap || !highlights || !recentTable || !recentCards) return;

    const period = periodo.value || "hoje";
    const deliveries = filterByNamedPeriod(state.entregas, period);
    const payments = filterByNamedPeriod(state.pagamentos, period);

    const totalDeliveriesDay = deliveries.length;
    const totalKg = sum(deliveries, "totalWeight");
    const totalGross = sum(deliveries, "grossValue");
    const totalPaidOnDeliveries = deliveries.reduce((sumValue, entrega) => sumValue + calcEntregaPaid(entrega.id), 0);
    const totalPending = deliveries.reduce((sumValue, entrega) => sumValue + calcEntregaPending(entrega), 0);

    const grossAll = sum(state.entregas, "grossValue");
    const paidAll = sum(state.pagamentos, "amount");
    const pendingAll = state.entregas.reduce((sumValue, entrega) => sumValue + calcEntregaPending(entrega), 0);

    const cards = [
      ["Entregas no período", totalDeliveriesDay, false],
      ["Kg no período", `${numberBR(totalKg)} kg`, false],
      ["Bruto no período", money(totalGross), true],
      ["Pago no período", money(totalPaidOnDeliveries), true],
      ["Pendente no período", money(totalPending), true],
      ["Bruto acumulado", money(grossAll), true],
      ["Pago acumulado", money(paidAll), true],
      ["Pendente acumulado", money(pendingAll), true]
    ];

    cardsWrap.innerHTML = cards.map(([label, value, isMoney]) => `
      <article class="metric-card">
        <span class="metric-label">${label}</span>
        <div class="metric-value ${isMoney ? "is-money" : ""}">${value}</div>
      </article>
    `).join("");

    const bestProduct = topBy(deliveries, x => x.productId);
    const bestFarmer = topBy(deliveries, x => x.farmerId, "totalWeight");
    const bestBuyer = topBy(deliveries, x => x.buyerId, "totalWeight");

    highlights.innerHTML = `
      <div class="highlight-item">
        <strong>Produto mais vendido</strong>
        <span>${bestProduct ? `${getProdutoById(bestProduct.key)?.name || "-"} • ${numberBR(bestProduct.total)} kg` : "Sem dados no período"}</span>
      </div>
      <div class="highlight-item">
        <strong>Agricultor com maior volume</strong>
        <span>${bestFarmer ? `${getAgricultorById(bestFarmer.key)?.name || "-"} • ${numberBR(bestFarmer.total)} kg` : "Sem dados no período"}</span>
      </div>
      <div class="highlight-item">
        <strong>Comprador com maior volume recebido</strong>
        <span>${bestBuyer ? `${getCompradorById(bestBuyer.key)?.name || "-"} • ${numberBR(bestBuyer.total)} kg` : "Sem dados no período"}</span>
      </div>
      <div class="highlight-item">
        <strong>Pagamentos lançados no período</strong>
        <span>${payments.length} registro(s) • ${money(sum(payments, "amount"))}</span>
      </div>
    `;

    const recent = [...state.entregas].sort(compareDateTimeDesc).slice(0, 8);

    recentTable.innerHTML = recent.length ? recent.map(entrega => `
      <tr>
        <td>${formatDate(entrega.date)}</td>
        <td>${escapeHTML(getAgricultorById(entrega.farmerId)?.name || "-")}</td>
        <td>${escapeHTML(getCompradorById(entrega.buyerId)?.name || "-")}</td>
        <td>${escapeHTML(getProdutoById(entrega.productId)?.name || "-")}</td>
        <td>${numberBR(entrega.totalWeight)}</td>
        <td>${money(entrega.grossValue)}</td>
        <td>${statusBadge(calcEntregaStatus(entrega))}</td>
      </tr>
    `).join("") : `<tr><td colspan="7">Nenhuma entrega registrada.</td></tr>`;

    recentCards.innerHTML = recent.length ? recent.map(entrega => {
      const status = calcEntregaStatus(entrega);
      return `
        <article class="mobile-data-card">
          <div class="mobile-data-card-head">
            <div class="mobile-data-card-title">
              <strong>${escapeHTML(getProdutoById(entrega.productId)?.name || "-")}</strong>
              <small>${formatDateTime(entrega.date, entrega.time)}</small>
            </div>
            ${statusBadge(status)}
          </div>

          <div class="mobile-data-grid">
            <div>
              <span>Agricultor</span>
              <strong>${escapeHTML(getAgricultorById(entrega.farmerId)?.name || "-")}</strong>
            </div>
            <div>
              <span>Comprador</span>
              <strong>${escapeHTML(getCompradorById(entrega.buyerId)?.name || "-")}</strong>
            </div>
            <div>
              <span>Peso</span>
              <strong>${numberBR(entrega.totalWeight)} kg</strong>
            </div>
            <div>
              <span>Valor bruto</span>
              <strong>${money(entrega.grossValue)}</strong>
            </div>
          </div>
        </article>
      `;
    }).join("") : `<article class="mobile-data-card"><div class="mobile-data-card-title"><strong>Nenhuma entrega registrada</strong><small>Cadastre uma entrega para visualizar aqui.</small></div></article>`;
  }

  function renderAgricultores() {
    const tbody = $("#agricultoresTable");
    if (!tbody) return;
    tbody.innerHTML = state.agricultores.length ? state.agricultores.map(item => {
      const totals = getAgricultorTotals(item.id);
      return `
        <tr>
          <td>${escapeHTML(item.name)}</td>
          <td>${escapeHTML(item.shortName || "-")}</td>
          <td>${escapeHTML(item.phone || "-")}</td>
          <td>${money(totals.gross)}</td>
          <td>${money(totals.paid)}</td>
          <td>${money(totals.pending)}</td>
          <td>
            <div class="table-actions">
              <button class="mini-btn" data-edit-agricultor="${item.id}">Editar</button>
              <button class="mini-btn delete" data-delete-agricultor="${item.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    }).join("") : `<tr><td colspan="7">Nenhum agricultor cadastrado.</td></tr>`;
  }

  function getAgricultorTotals(farmerId) {
    const deliveries = state.entregas.filter(x => x.farmerId === farmerId);
    const gross = sum(deliveries, "grossValue");
    const paid = round2(deliveries.reduce((acc, entrega) => acc + calcEntregaPaid(entrega.id), 0));
    return { gross, paid, pending: round2(gross - paid) };
  }

  function renderCompradores() {
    const tbody = $("#compradoresTable");
    if (!tbody) return;
    tbody.innerHTML = state.compradores.length ? state.compradores.map(item => {
      const totals = getCompradorTotals(item.id);
      return `
        <tr>
          <td>${escapeHTML(item.name)}</td>
          <td>${escapeHTML(item.phone || "-")}</td>
          <td>${money(totals.gross)}</td>
          <td>${money(totals.paid)}</td>
          <td>${money(totals.pending)}</td>
          <td>
            <div class="table-actions">
              <button class="mini-btn" data-edit-comprador="${item.id}">Editar</button>
              <button class="mini-btn delete" data-delete-comprador="${item.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    }).join("") : `<tr><td colspan="6">Nenhum comprador cadastrado.</td></tr>`;
  }

  function getCompradorTotals(buyerId) {
    const deliveries = state.entregas.filter(x => x.buyerId === buyerId);
    const gross = sum(deliveries, "grossValue");
    const paid = round2(deliveries.reduce((acc, entrega) => acc + calcEntregaPaid(entrega.id), 0));
    return { gross, paid, pending: round2(gross - paid) };
  }

  function renderProdutos() {
    const tbody = $("#produtosTable");
    if (!tbody) return;
    tbody.innerHTML = state.produtos.length ? state.produtos.map(item => `
      <tr>
        <td>${escapeHTML(item.name)}</td>
        <td>${escapeHTML(item.category)}</td>
        <td>${escapeHTML(item.notes || "-")}</td>
        <td>
          <div class="table-actions">
            <button class="mini-btn" data-edit-produto="${item.id}">Editar</button>
            <button class="mini-btn delete" data-delete-produto="${item.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="4">Nenhum produto cadastrado.</td></tr>`;
  }

  function renderEntregas() {
    const tbody = $("#entregasTable");
    const cards = $("#entregasCards");
    if (!tbody || !cards) return;

    const items = [...state.entregas].sort(compareDateTimeDesc);

    tbody.innerHTML = items.length ? items.map(entrega => {
      const paid = calcEntregaPaid(entrega.id);
      const pending = calcEntregaPending(entrega);
      const status = calcEntregaStatus(entrega);
      return `
        <tr>
          <td>${escapeHTML(entrega.id)}</td>
          <td>${formatDateTime(entrega.date, entrega.time)}</td>
          <td>${escapeHTML(getAgricultorById(entrega.farmerId)?.name || "-")}</td>
          <td>${escapeHTML(getCompradorById(entrega.buyerId)?.name || "-")}</td>
          <td>${escapeHTML(getProdutoById(entrega.productId)?.name || "-")}</td>
          <td>${numberBR(entrega.boxes, 0)}</td>
          <td>${numberBR(entrega.totalWeight)}</td>
          <td>${money(entrega.grossValue)}</td>
          <td>${money(paid)}</td>
          <td>${money(pending)}</td>
          <td>${statusBadge(status)}</td>
          <td>
            <div class="table-actions">
              <button class="mini-btn" data-edit-entrega="${entrega.id}">Editar</button>
              <button class="mini-btn delete" data-delete-entrega="${entrega.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    }).join("") : `<tr><td colspan="12">Nenhuma entrega registrada.</td></tr>`;

    cards.innerHTML = items.length ? items.map(entrega => {
      const paid = calcEntregaPaid(entrega.id);
      const pending = calcEntregaPending(entrega);
      const status = calcEntregaStatus(entrega);

      return `
        <article class="mobile-data-card">
          <div class="mobile-data-card-head">
            <div class="mobile-data-card-title">
              <strong>${escapeHTML(getProdutoById(entrega.productId)?.name || "-")}</strong>
              <small>${escapeHTML(entrega.id)} • ${formatDateTime(entrega.date, entrega.time)}</small>
            </div>
            ${statusBadge(status)}
          </div>

          <div class="mobile-data-grid">
            <div>
              <span>Agricultor</span>
              <strong>${escapeHTML(getAgricultorById(entrega.farmerId)?.name || "-")}</strong>
            </div>
            <div>
              <span>Comprador</span>
              <strong>${escapeHTML(getCompradorById(entrega.buyerId)?.name || "-")}</strong>
            </div>
            <div>
              <span>Caixas</span>
              <strong>${numberBR(entrega.boxes, 0)}</strong>
            </div>
            <div>
              <span>Peso total</span>
              <strong>${numberBR(entrega.totalWeight)} kg</strong>
            </div>
            <div>
              <span>Valor bruto</span>
              <strong>${money(entrega.grossValue)}</strong>
            </div>
            <div>
              <span>Pago / Pendente</span>
              <strong>${money(paid)} / ${money(pending)}</strong>
            </div>
          </div>

          <div class="mobile-card-actions">
            <button class="mini-btn" data-edit-entrega="${entrega.id}">Editar</button>
            <button class="mini-btn delete" data-delete-entrega="${entrega.id}">Excluir</button>
          </div>
        </article>
      `;
    }).join("") : `<article class="mobile-data-card"><div class="mobile-data-card-title"><strong>Nenhuma entrega registrada</strong><small>As entregas lançadas aparecerão aqui.</small></div></article>`;
  }

  function renderPagamentos() {
    const tbody = $("#pagamentosTable");
    const cards = $("#pagamentosCards");
    if (!tbody || !cards) return;

    const items = [...state.pagamentos].sort(compareDateTimeDesc);

    tbody.innerHTML = items.length ? items.map(pagamento => {
      const productName = pagamento.productId ? getProdutoById(pagamento.productId)?.name : "Diversos";
      const ref = (pagamento.allocations || []).map(a => a.deliveryId).join(", ");
      return `
        <tr>
          <td>${escapeHTML(pagamento.id)}</td>
          <td>${formatDateTime(pagamento.date, pagamento.time)}</td>
          <td>${escapeHTML(getCompradorById(pagamento.buyerId)?.name || "-")}</td>
          <td>${escapeHTML(getAgricultorById(pagamento.farmerId)?.name || "-")}</td>
          <td>${escapeHTML(productName || "-")}</td>
          <td>${escapeHTML(pagamento.paymentMethod || "-")}</td>
          <td>${money(pagamento.amount)}</td>
          <td>${escapeHTML(ref || "-")}</td>
          <td>
            <div class="table-actions">
              <button class="mini-btn" data-share-pagamento="${pagamento.id}">Compartilhar</button>
              <button class="mini-btn delete" data-delete-pagamento="${pagamento.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    }).join("") : `<tr><td colspan="9">Nenhum pagamento registrado.</td></tr>`;

    cards.innerHTML = items.length ? items.map(pagamento => {
      const productName = pagamento.productId ? getProdutoById(pagamento.productId)?.name : "Diversos";
      const ref = (pagamento.allocations || []).map(a => a.deliveryId).join(", ");

      return `
        <article class="mobile-data-card">
          <div class="mobile-data-card-head">
            <div class="mobile-data-card-title">
              <strong>${money(pagamento.amount)}</strong>
              <small>${escapeHTML(pagamento.id)} • ${formatDateTime(pagamento.date, pagamento.time)}</small>
            </div>
            <span class="badge paid">${escapeHTML(pagamento.paymentMethod || "Pago")}</span>
          </div>

          <div class="mobile-data-grid">
            <div>
              <span>Comprador</span>
              <strong>${escapeHTML(getCompradorById(pagamento.buyerId)?.name || "-")}</strong>
            </div>
            <div>
              <span>Agricultor</span>
              <strong>${escapeHTML(getAgricultorById(pagamento.farmerId)?.name || "-")}</strong>
            </div>
            <div>
              <span>Produto</span>
              <strong>${escapeHTML(productName || "-")}</strong>
            </div>
            <div>
              <span>Forma</span>
              <strong>${escapeHTML(pagamento.paymentMethod || "-")}</strong>
            </div>
            <div>
              <span>Referência</span>
              <strong>${escapeHTML(ref || "-")}</strong>
            </div>
          </div>

          <div class="mobile-card-actions">
            <button class="mini-btn" data-share-pagamento="${pagamento.id}">Compartilhar</button>
            <button class="mini-btn delete" data-delete-pagamento="${pagamento.id}">Excluir</button>
          </div>
        </article>
      `;
    }).join("") : `<article class="mobile-data-card"><div class="mobile-data-card-title"><strong>Nenhum pagamento registrado</strong><small>Os pagamentos lançados aparecerão aqui.</small></div></article>`;
  }

  function applyEntregaCalculations() {
    const caixas = Number($("#entregaCaixas")?.value || 0);
    const pesoCx = Number($("#entregaPesoCaixa")?.value || 0);
    const totalWeightField = $("#entregaPesoTotal");
    const valorKg = Number($("#entregaValorKg")?.value || 0);
    const brutoField = $("#entregaValorBruto");
    if (!totalWeightField || !brutoField) return;

    if (caixas > 0 && pesoCx > 0) {
      totalWeightField.value = round2(caixas * pesoCx);
    }

    const totalWeight = Number(totalWeightField.value || 0);
    if (totalWeight > 0 && valorKg > 0) {
      brutoField.value = round2(totalWeight * valorKg);
    }
  }

  function setupFormsDefaults() {
    if ($("#entregaData")) $("#entregaData").value = nowDate();
    if ($("#entregaHora")) $("#entregaHora").value = nowTime();
    if ($("#pagamentoData")) $("#pagamentoData").value = nowDate();
    if ($("#pagamentoHora")) $("#pagamentoHora").value = nowTime();
    if ($("#reportDate")) $("#reportDate").value = nowDate();
    if ($("#reportStartDate")) $("#reportStartDate").value = nowDate();
    if ($("#reportEndDate")) $("#reportEndDate").value = nowDate();
  }

  function openDrawer() {
    if ($("#drawer")) $("#drawer").hidden = false;
    if ($("#appBackdrop")) $("#appBackdrop").hidden = false;
    document.body.classList.add("drawer-open");
  }

  function closeDrawer() {
    if ($("#drawer")) $("#drawer").hidden = true;
    if ($("#appBackdrop")) $("#appBackdrop").hidden = true;
    document.body.classList.remove("drawer-open");
  }

  function openOnboarding() {
    if ($("#onboardingOverlay")) $("#onboardingOverlay").hidden = false;
    if ($("#appBackdrop")) $("#appBackdrop").hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeOnboarding() {
    if ($("#onboardingOverlay")) $("#onboardingOverlay").hidden = true;
    if ($("#appBackdrop")) $("#appBackdrop").hidden = true;
    document.body.classList.remove("modal-open");
  }

  function applyTheme() {
    const theme = state.settings.theme || "light";
    document.body.classList.toggle("dark", theme === "dark");
    if ($("#themeToggleDrawer")) $("#themeToggleDrawer").checked = theme === "dark";
  }

  function toggleTheme() {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    saveDB();
    applyTheme();
    showToast(state.settings.theme === "dark" ? "Modo escuro ativado." : "Modo claro ativado.", "info");
  }

  function setProfile(profile) {
    state.settings.profile = profile;
    state.settings.onboardingDone = true;
    saveDB();
    updateProfileUI();
    renderDashboard();
    closeOnboarding();
    showToast("Perfil inicial definido com sucesso.");
  }

  function bindEvents() {
    $("#menuToggle")?.addEventListener("click", openDrawer);
    $("#openDrawerBtn")?.addEventListener("click", openDrawer);
    $("#bottomMoreBtn")?.addEventListener("click", openDrawer);
    $("#closeDrawerBtn")?.addEventListener("click", closeDrawer);
    $("#appBackdrop")?.addEventListener("click", closeDrawer);

    $("#themeToggleBtn")?.addEventListener("click", toggleTheme);
    $("#themeToggleDrawer")?.addEventListener("change", toggleTheme);

    $("#changeProfileBtn")?.addEventListener("click", () => {
      closeDrawer();
      openOnboarding();
    });

    $$(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab) openTab(tab);
      });
    });

    $$("[data-go-tab]").forEach(btn => {
      btn.addEventListener("click", () => openTab(btn.dataset.goTab));
    });

    $$("[data-role-choice]").forEach(btn => {
      btn.addEventListener("click", () => setProfile(btn.dataset.roleChoice));
    });

    $("#dashboardPeriodo")?.addEventListener("change", renderDashboard);

    $("#agricultorForm")?.addEventListener("submit", onSubmitAgricultor);
    $("#compradorForm")?.addEventListener("submit", onSubmitComprador);
    $("#produtoForm")?.addEventListener("submit", onSubmitProduto);
    $("#entregaForm")?.addEventListener("submit", onSubmitEntrega);
    $("#pagamentoForm")?.addEventListener("submit", onSubmitPagamento);

    $("#cancelAgricultorEdit")?.addEventListener("click", resetAgricultorForm);
    $("#cancelCompradorEdit")?.addEventListener("click", resetCompradorForm);
    $("#cancelProdutoEdit")?.addEventListener("click", resetProdutoForm);
    $("#cancelEntregaEdit")?.addEventListener("click", resetEntregaForm);
    $("#cancelPagamentoEdit")?.addEventListener("click", resetPagamentoForm);

    ["#entregaCaixas", "#entregaPesoCaixa", "#entregaPesoTotal", "#entregaValorKg"].forEach(sel => {
      $(sel)?.addEventListener("input", applyEntregaCalculations);
    });

    $("#atualizarEntregasPagBtn")?.addEventListener("click", renderPaymentDeliveryPicker);
    $("#pagamentoComprador")?.addEventListener("change", renderPaymentDeliveryPicker);
    $("#pagamentoAgricultor")?.addEventListener("change", renderPaymentDeliveryPicker);
    $("#pagamentoProdutoFiltro")?.addEventListener("change", renderPaymentDeliveryPicker);
    $("#pagamentoValor")?.addEventListener("input", updatePaymentPreview);

    $("#aplicarFiltrosBtn")?.addEventListener("click", renderHistorico);
    $("#generateReportBtn")?.addEventListener("click", generateReport);
    $("#printReportBtn")?.addEventListener("click", printCurrentReport);
    $("#shareReportBtn")?.addEventListener("click", shareCurrentReport);
    $("#shareSummaryBtn")?.addEventListener("click", shareCurrentSummary);
    $("#clearDataBtn")?.addEventListener("click", clearAllData);
    $("#resetDemoBtn")?.addEventListener("click", loadDemoData);

    document.addEventListener("click", onGlobalClick);
  }

  function onGlobalClick(e) {
    const t = e.target;

    if (t.matches("[data-edit-agricultor]")) editAgricultor(t.dataset.editAgricultor);
    if (t.matches("[data-delete-agricultor]")) deleteAgricultor(t.dataset.deleteAgricultor);

    if (t.matches("[data-edit-comprador]")) editComprador(t.dataset.editComprador);
    if (t.matches("[data-delete-comprador]")) deleteComprador(t.dataset.deleteComprador);

    if (t.matches("[data-edit-produto]")) editProduto(t.dataset.editProduto);
    if (t.matches("[data-delete-produto]")) deleteProduto(t.dataset.deleteProduto);

    if (t.matches("[data-edit-entrega]")) editEntrega(t.dataset.editEntrega);
    if (t.matches("[data-delete-entrega]")) deleteEntrega(t.dataset.deleteEntrega);

    if (t.matches("[data-delete-pagamento]")) deletePagamento(t.dataset.deletePagamento);
    if (t.matches("[data-share-pagamento]")) sharePagamento(t.dataset.sharePagamento);
  }

  function syncActiveNav(tab) {
    $$(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
  }

  function openTab(tab) {
    state.settings.lastTab = tab;
    saveDB();
    $$(".tab-panel").forEach(p => p.classList.remove("active"));
    $(`#tab-${tab}`)?.classList.add("active");
    syncActiveNav(tab);
    closeDrawer();

    if (tab === "historico") renderHistorico();
    if (tab === "relatorios") generateReport();
  }

  function onSubmitAgricultor(e) {
    e.preventDefault();
    const id = $("#agricultorId")?.value || "";
    const payload = {
      name: $("#agricultorNome")?.value.trim() || "",
      shortName: $("#agricultorApelido")?.value.trim() || "",
      phone: $("#agricultorTelefone")?.value.trim() || "",
      notes: $("#agricultorObs")?.value.trim() || ""
    };
    if (!payload.name) return showToast("Informe o nome do agricultor.", "error");

    if (id) {
      const item = getAgricultorById(id);
      if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString() });
      showToast("Agricultor atualizado com sucesso.");
    } else {
      state.agricultores.push({
        id: uid("AGRI"),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showToast("Agricultor cadastrado com sucesso.");
    }

    saveDB();
    resetAgricultorForm();
    rerender();
  }

  function onSubmitComprador(e) {
    e.preventDefault();
    const id = $("#compradorId")?.value || "";
    const payload = {
      name: $("#compradorNome")?.value.trim() || "",
      phone: $("#compradorTelefone")?.value.trim() || "",
      notes: $("#compradorObs")?.value.trim() || ""
    };
    if (!payload.name) return showToast("Informe o nome do comprador.", "error");

    if (id) {
      const item = getCompradorById(id);
      if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString() });
      showToast("Comprador atualizado com sucesso.");
    } else {
      state.compradores.push({
        id: uid("COMP"),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showToast("Comprador cadastrado com sucesso.");
    }

    saveDB();
    resetCompradorForm();
    rerender();
  }

  function onSubmitProduto(e) {
    e.preventDefault();
    const id = $("#produtoId")?.value || "";
    const payload = {
      name: $("#produtoNome")?.value.trim() || "",
      category: $("#produtoCategoria")?.value || "Uva",
      notes: $("#produtoObs")?.value.trim() || ""
    };
    if (!payload.name) return showToast("Informe o nome do produto.", "error");

    const exists = state.produtos.some(p => p.name.toLowerCase() === payload.name.toLowerCase() && p.id !== id);
    if (exists) return showToast("Já existe um produto com esse nome.", "error");

    if (id) {
      const item = getProdutoById(id);
      if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString() });
      showToast("Produto atualizado com sucesso.");
    } else {
      state.produtos.push({
        id: uid("PROD"),
        ...payload,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showToast("Produto cadastrado com sucesso.");
    }

    saveDB();
    resetProdutoForm();
    rerender();
  }

  function onSubmitEntrega(e) {
    e.preventDefault();

    if (!state.agricultores.length || !state.compradores.length || !state.produtos.length) {
      return showToast("Cadastre agricultor, comprador e produto antes de lançar uma entrega.", "error");
    }

    const id = $("#entregaId")?.value || "";
    const payload = {
      farmerId: $("#entregaAgricultor")?.value || "",
      buyerId: $("#entregaComprador")?.value || "",
      productId: $("#entregaProduto")?.value || "",
      date: $("#entregaData")?.value || "",
      time: $("#entregaHora")?.value || "",
      boxes: Number($("#entregaCaixas")?.value || 0),
      weightPerBox: Number($("#entregaPesoCaixa")?.value || 0),
      totalWeight: Number($("#entregaPesoTotal")?.value || 0),
      pricePerKg: Number($("#entregaValorKg")?.value || 0),
      grossValue: Number($("#entregaValorBruto")?.value || 0),
      notes: $("#entregaObs")?.value.trim() || ""
    };

    if (!payload.farmerId || !payload.buyerId || !payload.productId || !payload.date || !payload.time) {
      return showToast("Preencha agricultor, comprador, produto, data e hora.", "error");
    }

    if (payload.boxes <= 0 || payload.totalWeight <= 0 || payload.pricePerKg <= 0 || payload.grossValue <= 0) {
      return showToast("Revise caixas, peso total, valor por kg e valor bruto.", "error");
    }

    if (id) {
      const item = getEntregaById(id);
      if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString() });
      showToast("Entrega atualizada com sucesso.");
    } else {
      const newId = uid("ENT");
      state.entregas.push({
        id: newId,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showToast(`Entrega ${newId} registrada com sucesso.`);
    }

    saveDB();
    resetEntregaForm();
    rerender();
    openTab("entregas");
  }

  function onSubmitPagamento(e) {
    e.preventDefault();

    const id = $("#pagamentoId")?.value || "";
    const buyerId = $("#pagamentoComprador")?.value || "";
    const farmerId = $("#pagamentoAgricultor")?.value || "";
    const productId = $("#pagamentoProduto")?.value || "";
    const paymentMethod = $("#pagamentoMetodo")?.value || "";
    const date = $("#pagamentoData")?.value || "";
    const time = $("#pagamentoHora")?.value || "";
    const amount = Number($("#pagamentoValor")?.value || 0);
    const notes = $("#pagamentoObs")?.value.trim() || "";

    if (!buyerId || !farmerId || !paymentMethod || !date || !time || amount <= 0) {
      return showToast("Preencha comprador, agricultor, forma de pagamento, data, hora e valor pago.", "error");
    }

    if (id) {
      return showToast("Por segurança, pagamentos não podem ser editados. Exclua e lance novamente.", "error");
    }

    const checked = $$('input[name="paymentDelivery"]:checked');
    if (!checked.length) return showToast("Selecione ao menos uma entrega vinculada.", "error");

    const candidateDeliveries = checked
      .map(el => getEntregaById(el.value))
      .filter(Boolean)
      .sort(compareDateTimeAsc);

    let remaining = round2(amount);
    const allocations = [];

    for (const entrega of candidateDeliveries) {
      const pending = calcEntregaPending(entrega);
      if (pending <= 0) continue;
      if (remaining <= 0) break;
      const alloc = Math.min(pending, remaining);
      allocations.push({ deliveryId: entrega.id, amount: round2(alloc) });
      remaining = round2(remaining - alloc);
    }

    if (!allocations.length) {
      return showToast("As entregas escolhidas já estão totalmente pagas.", "error");
    }

    if (remaining > 0) {
      return showToast("O valor informado excede o saldo das entregas selecionadas.", "error");
    }

    const selectedProductId = getSelectedPaymentProductId(candidateDeliveries);
    const description = buildPaymentDescription({
      buyerId,
      farmerId,
      productId: selectedProductId,
      paymentMethod,
      allocations,
      date,
      time
    });

    const newId = uid("PAG");
    state.pagamentos.push({
      id: newId,
      buyerId,
      farmerId,
      productId: selectedProductId,
      paymentMethod,
      date,
      time,
      amount: round2(amount),
      notes,
      description,
      allocations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    saveDB();
    resetPagamentoForm();
    rerender();
    openTab("pagamentos");
    showToast(`Pagamento ${newId} registrado com sucesso.`);
  }

  function getSelectedPaymentProductId(deliveries) {
    const ids = [...new Set(deliveries.map(item => item?.productId).filter(Boolean))];
    return ids.length === 1 ? ids[0] : "";
  }

  function buildPaymentDescription({ buyerId, farmerId, productId, paymentMethod, allocations, date, time }) {
    const buyer = getCompradorById(buyerId)?.name || "Comprador";
    const farmer = getAgricultorById(farmerId)?.name || "Agricultor";
    const product = productId ? getProdutoById(productId)?.name : null;
    const firstDelivery = allocations[0] ? getEntregaById(allocations[0].deliveryId) : null;

    if (allocations.length === 1 && firstDelivery) {
      return `Pagamento em ${paymentMethod} referente à ${product || getProdutoById(firstDelivery.productId)?.name || "mercadoria"} entregue por ${farmer} em ${formatDate(firstDelivery.date)} às ${firstDelivery.time}, pago por ${buyer} em ${formatDate(date)} às ${time}.`;
    }

    return `Pagamento em ${paymentMethod} referente a ${allocations.length} entrega(s) ${product ? `de ${product} ` : ""}do agricultor ${farmer}, pago por ${buyer} em ${formatDate(date)} às ${time}.`;
  }

  function renderPaymentDeliveryPicker() {
    const buyerId = $("#pagamentoComprador")?.value || "";
    const farmerId = $("#pagamentoAgricultor")?.value || "";
    const productId = $("#pagamentoProdutoFiltro")?.value || "";
    const box = $("#paymentDeliveryPicker");
    if (!box) return;

    if (!buyerId || !farmerId) {
      box.className = "delivery-picker empty";
      box.innerHTML = "Selecione comprador e agricultor para ver entregas pendentes.";
      updatePaymentPreview();
      return;
    }

    const items = state.entregas
      .filter(entrega => {
        const sameFarmer = entrega.farmerId === farmerId;
        const sameBuyer = entrega.buyerId === buyerId;
        const sameProduct = !productId || entrega.productId === productId;
        return sameFarmer && sameBuyer && sameProduct && calcEntregaPending(entrega) > 0;
      })
      .sort(compareDateTimeAsc);

    if (!items.length) {
      box.className = "delivery-picker empty";
      box.innerHTML = "Nenhuma entrega pendente encontrada para os filtros selecionados.";
      updatePaymentPreview();
      return;
    }

    box.className = "delivery-picker";
    box.innerHTML = items.map(entrega => {
      const produto = getProdutoById(entrega.productId)?.name || "-";
      const pending = calcEntregaPending(entrega);
      return `
        <label class="delivery-option">
          <input type="checkbox" name="paymentDelivery" value="${entrega.id}">
          <div>
            <strong>${entrega.id} • ${produto}</strong>
            <small>${formatDateTime(entrega.date, entrega.time)} • ${numberBR(entrega.totalWeight)} kg • Bruto ${money(entrega.grossValue)} • Saldo ${money(pending)}</small>
          </div>
        </label>
      `;
    }).join("");

    $$('input[name="paymentDelivery"]', box).forEach(input => {
      input.addEventListener("change", updatePaymentPreview);
    });

    updatePaymentPreview();
  }

  function updatePaymentPreview() {
    const amount = Number($("#pagamentoValor")?.value || 0);
    const checked = $$('input[name="paymentDelivery"]:checked');
    const preview = $("#paymentPreviewBox");
    const selectedBox = $("#selectedDeliveryBox");
    const saldoAtual = $("#pagamentoSaldoAtual");
    const entregaSelecionadaInput = $("#pagamentoEntregaSelecionada");
    const pagamentoProduto = $("#pagamentoProduto");

    if (!preview || !selectedBox || !saldoAtual || !entregaSelecionadaInput || !pagamentoProduto) return;

    if (!checked.length) {
      preview.textContent = "Escolha uma entrega pendente. O valor sugerido será o saldo atual da entrega.";
      selectedBox.className = "selected-delivery-box empty";
      selectedBox.innerHTML = 'Escolha uma entrega pendente clicando em <strong>Pagar</strong>.';
      saldoAtual.value = "";
      entregaSelecionadaInput.value = "";
      pagamentoProduto.innerHTML = '<option value="">Selecione uma entrega</option>';
      pagamentoProduto.disabled = true;
      return;
    }

    const deliveries = checked.map(el => getEntregaById(el.value)).filter(Boolean).sort(compareDateTimeAsc);
    const totalPending = round2(deliveries.reduce((acc, entrega) => acc + calcEntregaPending(entrega), 0));
    let remaining = round2(amount);
    const parts = [];

    deliveries.forEach(entrega => {
      const pending = calcEntregaPending(entrega);
      if (pending <= 0 || remaining <= 0) return;
      const alloc = Math.min(pending, remaining);
      remaining = round2(remaining - alloc);
      parts.push(`${entrega.id}: ${money(alloc)}`);
    });

    const selectedProductId = getSelectedPaymentProductId(deliveries);
    entregaSelecionadaInput.value = deliveries.map(item => item.id).join(", ");
    saldoAtual.value = money(totalPending);
    pagamentoProduto.disabled = false;
    pagamentoProduto.innerHTML = selectedProductId
      ? `<option value="${selectedProductId}">${escapeHTML(getProdutoById(selectedProductId)?.name || "Produto selecionado")}</option>`
      : '<option value="">Diversos produtos vinculados</option>';
    pagamentoProduto.value = selectedProductId || "";

    selectedBox.className = "selected-delivery-box";
    selectedBox.innerHTML = deliveries.map(entrega => {
      const produto = getProdutoById(entrega.productId)?.name || "-";
      const agricultor = getAgricultorById(entrega.farmerId)?.name || "-";
      const comprador = getCompradorById(entrega.buyerId)?.name || "-";
      return `
        <article class="selected-delivery-item">
          <strong>${escapeHTML(entrega.id)} • ${escapeHTML(produto)}</strong>
          <small>${formatDateTime(entrega.date, entrega.time)} • ${escapeHTML(agricultor)} → ${escapeHTML(comprador)}</small>
          <small>Caixas: ${numberBR(entrega.boxes, 0)} • Peso: ${numberBR(entrega.totalWeight)} kg • Bruto: ${money(entrega.grossValue)} • Saldo: ${money(calcEntregaPending(entrega))}</small>
        </article>
      `;
    }).join("");

    preview.textContent = amount <= 0
      ? `Saldo disponível nas entregas marcadas: ${money(totalPending)}. Informe o valor pago para ver a distribuição.`
      : remaining > 0
        ? `Saldo excedente detectado. Distribuição parcial: ${parts.join(" | ")}. Ainda sobra ${money(remaining)} acima do saldo disponível.`
        : `Distribuição prevista: ${parts.join(" | ")}. Total selecionado: ${money(totalPending)}.`;
  }

  function renderHistorico() {
    const entregaTable = $("#historicoEntregasTable");
    const pagamentoTable = $("#historicoPagamentosTable");
    if (!entregaTable || !pagamentoTable) return;

    const deliveries = getFilteredDeliveries();
    const payments = getFilteredPayments(deliveries.map(x => x.id));

    entregaTable.innerHTML = deliveries.length ? deliveries.map(entrega => `
      <tr>
        <td>${formatDateTime(entrega.date, entrega.time)}</td>
        <td>${escapeHTML(getAgricultorById(entrega.farmerId)?.name || "-")}</td>
        <td>${escapeHTML(getCompradorById(entrega.buyerId)?.name || "-")}</td>
        <td>${escapeHTML(getProdutoById(entrega.productId)?.name || "-")}</td>
        <td>${numberBR(entrega.boxes, 0)}</td>
        <td>${numberBR(entrega.totalWeight)}</td>
        <td>${money(entrega.grossValue)}</td>
        <td>${money(calcEntregaPaid(entrega.id))}</td>
        <td>${money(calcEntregaPending(entrega))}</td>
        <td>${statusBadge(calcEntregaStatus(entrega))}</td>
      </tr>
    `).join("") : `<tr><td colspan="10">Nenhuma entrega encontrada para os filtros.</td></tr>`;

    pagamentoTable.innerHTML = payments.length ? payments.map(p => `
      <tr>
        <td>${formatDateTime(p.date, p.time)}</td>
        <td>${escapeHTML(getCompradorById(p.buyerId)?.name || "-")}</td>
        <td>${escapeHTML(getAgricultorById(p.farmerId)?.name || "-")}</td>
        <td>${escapeHTML((p.productId ? getProdutoById(p.productId)?.name : "Diversos") || "-")}</td>
        <td>${escapeHTML(p.paymentMethod || "-")}</td>
        <td>${money(p.amount)}</td>
        <td>${escapeHTML(p.description || "-")}</td>
      </tr>
    `).join("") : `<tr><td colspan="7">Nenhum pagamento encontrado para os filtros.</td></tr>`;
  }

  function getFilteredDeliveries() {
    const tipoPeriodo = $("#histTipoPeriodo")?.value || "todos";
    const dataInicio = $("#histDataInicio")?.value || "";
    const dataFim = $("#histDataFim")?.value || "";
    const agricultor = $("#histAgricultor")?.value || "";
    const comprador = $("#histComprador")?.value || "";
    const produto = $("#histProduto")?.value || "";
    const status = $("#histStatus")?.value || "";
    const ordenacao = $("#histOrdenacao")?.value || "recentes";

    let items = [...state.entregas];

    items = items.filter(entrega => {
      if (agricultor && entrega.farmerId !== agricultor) return false;
      if (comprador && entrega.buyerId !== comprador) return false;
      if (produto && entrega.productId !== produto) return false;
      if (status && calcEntregaStatus(entrega) !== status) return false;
      if (!matchesPeriodo(entrega.date, tipoPeriodo, dataInicio, dataFim)) return false;
      return true;
    });

    items.sort(ordenacao === "antigos" ? compareDateTimeAsc : compareDateTimeDesc);
    return items;
  }

  function getFilteredPayments(filteredDeliveryIds = []) {
    const tipoPeriodo = $("#histTipoPeriodo")?.value || "todos";
    const dataInicio = $("#histDataInicio")?.value || "";
    const dataFim = $("#histDataFim")?.value || "";
    const agricultor = $("#histAgricultor")?.value || "";
    const comprador = $("#histComprador")?.value || "";
    const produto = $("#histProduto")?.value || "";
    const ordenacao = $("#histOrdenacao")?.value || "recentes";
    const filteredSet = new Set(filteredDeliveryIds);

    let items = [...state.pagamentos].filter(p => {
      if (agricultor && p.farmerId !== agricultor) return false;
      if (comprador && p.buyerId !== comprador) return false;
      if (produto && p.productId && p.productId !== produto) return false;
      if (!matchesPeriodo(p.date, tipoPeriodo, dataInicio, dataFim)) return false;
      if (filteredDeliveryIds.length) {
        const hasAny = (p.allocations || []).some(a => filteredSet.has(a.deliveryId));
        if (!hasAny) return false;
      }
      return true;
    });

    items.sort(ordenacao === "antigos" ? compareDateTimeAsc : compareDateTimeDesc);
    return items;
  }

  function matchesPeriodo(dateStr, tipoPeriodo, dataInicio, dataFim) {
    const today = new Date();
    const date = new Date(`${dateStr}T00:00:00`);

    if (tipoPeriodo === "todos") return true;
    if (tipoPeriodo === "dia") return dateStr === nowDate();
    if (tipoPeriodo === "semana") {
      const first = new Date(today);
      const day = first.getDay() || 7;
      first.setDate(first.getDate() - day + 1);
      first.setHours(0, 0, 0, 0);
      const last = new Date(first);
      last.setDate(last.getDate() + 6);
      last.setHours(23, 59, 59, 999);
      return date >= first && date <= last;
    }
    if (tipoPeriodo === "mes") {
      return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
    }
    if (tipoPeriodo === "personalizado") {
      if (dataInicio && dateStr < dataInicio) return false;
      if (dataFim && dateStr > dataFim) return false;
      return true;
    }
    return true;
  }

  function getReportData() {
    const type = $("#reportType")?.value || "diario";
    const date = $("#reportDate")?.value || "";
    const startDate = $("#reportStartDate")?.value || "";
    const endDate = $("#reportEndDate")?.value || "";
    const farmerId = $("#reportAgricultor")?.value || "";
    const buyerId = $("#reportComprador")?.value || "";
    const productId = $("#reportProduto")?.value || "";

    let deliveries = [...state.entregas];

    if (type === "diario" && date) deliveries = deliveries.filter(x => x.date === date);
    if (type === "agricultor" && farmerId) deliveries = deliveries.filter(x => x.farmerId === farmerId);
    if (type === "comprador" && buyerId) deliveries = deliveries.filter(x => x.buyerId === buyerId);
    if (type === "produto" && productId) deliveries = deliveries.filter(x => x.productId === productId);
    if (type === "periodo") {
      if (startDate) deliveries = deliveries.filter(x => x.date >= startDate);
      if (endDate) deliveries = deliveries.filter(x => x.date <= endDate);
    }

    deliveries.sort(compareDateTimeDesc);

    const deliveryIds = new Set(deliveries.map(x => x.id));
    const payments = state.pagamentos
      .filter(p => (p.allocations || []).some(a => deliveryIds.has(a.deliveryId)))
      .sort(compareDateTimeDesc);

    const totalGross = sum(deliveries, "grossValue");
    const totalPaid = round2(deliveries.reduce((acc, entrega) => acc + calcEntregaPaid(entrega.id), 0));
    const totalPending = round2(totalGross - totalPaid);
    const totalKg = sum(deliveries, "totalWeight");
    const totalBoxes = round2(deliveries.reduce((acc, entrega) => acc + Number(entrega.boxes || 0), 0));

    let subtitle = "Relatório acumulado geral";
    if (type === "diario") subtitle = `Relatório diário / romaneio de ${formatDate(date)}`;
    if (type === "agricultor") subtitle = `Relatório do agricultor ${getAgricultorById(farmerId)?.name || "-"}`;
    if (type === "comprador") subtitle = `Relatório do comprador ${getCompradorById(buyerId)?.name || "-"}`;
    if (type === "produto") subtitle = `Relatório do produto ${getProdutoById(productId)?.name || "-"}`;
    if (type === "periodo") subtitle = `Relatório do período ${formatDate(startDate)} até ${formatDate(endDate)}`;

    return {
      type,
      subtitle,
      deliveries,
      payments,
      totalGross,
      totalPaid,
      totalPending,
      totalKg,
      totalBoxes
    };
  }

  function generateReport() {
    const preview = $("#reportPreview");
    if (!preview) return;
    const report = getReportData();

    const html = `
      <div class="report-sheet" data-report-built="true">
        <h3>AgroVendas</h3>
        <p>${report.subtitle}</p>

        <div class="report-meta">
          <div class="report-box">
            <strong>Entregas</strong>
            <span>${report.deliveries.length}</span>
          </div>
          <div class="report-box">
            <strong>Pagamentos relacionados</strong>
            <span>${report.payments.length}</span>
          </div>
          <div class="report-box">
            <strong>Emissão</strong>
            <span>${formatDate(nowDate())} às ${nowTime()}</span>
          </div>
        </div>

        <div class="report-totals">
          <div class="report-box">
            <strong>Total em caixas</strong>
            <span>${numberBR(report.totalBoxes, 0)}</span>
          </div>
          <div class="report-box">
            <strong>Total em kg</strong>
            <span>${numberBR(report.totalKg)} kg</span>
          </div>
          <div class="report-box">
            <strong>Total bruto</strong>
            <span>${money(report.totalGross)}</span>
          </div>
          <div class="report-box">
            <strong>Total pago</strong>
            <span>${money(report.totalPaid)}</span>
          </div>
          <div class="report-box">
            <strong>Total pendente</strong>
            <span>${money(report.totalPending)}</span>
          </div>
          <div class="report-box">
            <strong>Status geral</strong>
            <span>${report.totalPending <= 0 && report.deliveries.length ? "Liquidado" : "Com saldo pendente"}</span>
          </div>
        </div>

        <div class="table-wrap" style="padding:0; overflow:auto;">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Agricultor</th>
                <th>Comprador</th>
                <th>Produto</th>
                <th>Caixas</th>
                <th>Kg</th>
                <th>R$/kg</th>
                <th>Bruto</th>
                <th>Pago</th>
                <th>Pendente</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${report.deliveries.length ? report.deliveries.map(entrega => `
                <tr>
                  <td>${formatDateTime(entrega.date, entrega.time)}</td>
                  <td>${escapeHTML(getAgricultorById(entrega.farmerId)?.name || "-")}</td>
                  <td>${escapeHTML(getCompradorById(entrega.buyerId)?.name || "-")}</td>
                  <td>${escapeHTML(getProdutoById(entrega.productId)?.name || "-")}</td>
                  <td>${numberBR(entrega.boxes, 0)}</td>
                  <td>${numberBR(entrega.totalWeight)}</td>
                  <td>${money(entrega.pricePerKg)}</td>
                  <td>${money(entrega.grossValue)}</td>
                  <td>${money(calcEntregaPaid(entrega.id))}</td>
                  <td>${money(calcEntregaPending(entrega))}</td>
                  <td>${calcEntregaStatus(entrega)}</td>
                </tr>
              `).join("") : `<tr><td colspan="11">Nenhum registro encontrado.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    preview.innerHTML = html;
  }

  function printCurrentReport() {
    const preview = $("#reportPreview");
    if (!preview) return;
    const content = preview.innerHTML.trim();
    if (!content || !content.includes("report-sheet")) {
      return showToast("Gere um relatório antes de imprimir.", "error");
    }

    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return showToast("O navegador bloqueou a janela de impressão.", "error");

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório AgroVendas</title>
        <style>
          body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#222;padding:24px}
          h3{margin:0 0 8px;color:#5a275a}
          p{margin:0 0 14px;color:#555}
          .report-meta,.report-totals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
          .report-box{background:#f8faf5;border:1px solid #dde6d3;border-radius:12px;padding:12px}
          .report-box strong{display:block;margin-bottom:4px;color:#466b3f}
          table{width:100%;border-collapse:collapse;margin-top:14px}
          th,td{padding:10px;border:1px solid #dfe5d8;text-align:left;font-size:13px}
          th{background:#5a275a;color:#fff}
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = () => window.print();
        <\/script>
      </body>
      </html>
    `);
    win.document.close();
  }

  function buildReportText(report) {
    const lines = [
      "AgroVendas",
      report.subtitle,
      `Entregas: ${report.deliveries.length}`,
      `Pagamentos relacionados: ${report.payments.length}`,
      `Total em caixas: ${numberBR(report.totalBoxes, 0)}`,
      `Total em kg: ${numberBR(report.totalKg)} kg`,
      `Total bruto: ${money(report.totalGross)}`,
      `Total pago: ${money(report.totalPaid)}`,
      `Total pendente: ${money(report.totalPending)}`
    ];
    return lines.join("\n");
  }

  async function shareCurrentReport() {
    const report = getReportData();
    if (!report.deliveries.length && !report.payments.length) {
      return showToast("Gere um relatório antes de compartilhar.", "error");
    }
    await shareText(buildReportText(report), "Relatório AgroVendas");
  }

  async function shareCurrentSummary() {
    const deliveries = getFilteredDeliveries();
    if (!deliveries.length) {
      return showToast("Aplique filtros ou gere dados para compartilhar um resumo.", "error");
    }

    const lines = deliveries.slice(0, 15).map(entrega => {
      const farmer = getAgricultorById(entrega.farmerId)?.name || "-";
      const buyer = getCompradorById(entrega.buyerId)?.name || "-";
      const product = getProdutoById(entrega.productId)?.name || "-";
      const paymentDetails = state.pagamentos
        .filter(payment => (payment.allocations || []).some(a => a.deliveryId === entrega.id))
        .map(payment => {
          const allocation = (payment.allocations || []).find(a => a.deliveryId === entrega.id);
          return `${payment.id} (${payment.paymentMethod || "-"}) ${money(allocation?.amount || 0)} em ${formatDateTime(payment.date, payment.time)}`;
        });

      return [
        `Entrega ${entrega.id}`,
        `Agricultor: ${farmer}`,
        `Comprador: ${buyer}`,
        `Produto: ${product}`,
        `Caixas: ${numberBR(entrega.boxes, 0)}`,
        `Peso total: ${numberBR(entrega.totalWeight)} kg`,
        `Valor por kg: ${money(entrega.pricePerKg)}`,
        `Valor bruto: ${money(entrega.grossValue)}`,
        `Valor pago: ${money(calcEntregaPaid(entrega.id))}`,
        `Saldo pendente: ${money(calcEntregaPending(entrega))}`,
        `Data/Hora: ${formatDateTime(entrega.date, entrega.time)}`,
        `Pagamentos: ${paymentDetails.length ? paymentDetails.join(" | ") : "Sem pagamento registrado"}`
      ].join(" | ");
    });

    const message =
      "Olá, segue o comprovante resumido de venda e recebimento.\n\n" +
      lines.join("\n\n");

    await shareText(message, "Resumo AgroVendas");
  }

  async function sharePagamento(id) {
    const p = getPagamentoById(id);
    if (!p) return;

    const buyer = getCompradorById(p.buyerId)?.name || "-";
    const farmer = getAgricultorById(p.farmerId)?.name || "-";
    const product = p.productId ? getProdutoById(p.productId)?.name : "Diversos";
    const allocationsText = (p.allocations || []).map((allocation, index) => {
      const entrega = getEntregaById(allocation.deliveryId);
      if (!entrega) return `Venda ${index + 1}: entrega não encontrada.`;
      const entregaProduto = getProdutoById(entrega.productId)?.name || "-";
      return [
        `Venda ${index + 1}`,
        `Entrega: ${entrega.id}`,
        `Produto: ${entregaProduto}`,
        `Data/Hora da venda: ${formatDateTime(entrega.date, entrega.time)}`,
        `Caixas: ${numberBR(entrega.boxes, 0)}`,
        `Peso total: ${numberBR(entrega.totalWeight)} kg`,
        `Valor por kg: ${money(entrega.pricePerKg)}`,
        `Valor bruto: ${money(entrega.grossValue)}`,
        `Pago neste registro: ${money(allocation.amount)}`,
        `Saldo atual da entrega: ${money(calcEntregaPending(entrega))}`
      ].join("\n");
    }).join("\n\n------------------------------\n\n");

    const message = [
      "Olá, segue o registro detalhado deste pagamento no AgroVendas.",
      "",
      "DADOS DO PAGAMENTO",
      `Pagamento: ${p.id}`,
      `Comprador: ${buyer}`,
      `Agricultor: ${farmer}`,
      `Produto: ${product}`,
      `Forma de pagamento: ${p.paymentMethod || "-"}`,
      `Data/Hora do pagamento: ${formatDateTime(p.date, p.time)}`,
      `Valor pago: ${money(p.amount)}`,
      `Descrição: ${p.description || "-"}`,
      "",
      "VENDAS VINCULADAS",
      allocationsText || "Nenhuma venda vinculada."
    ].join("\n");

    await shareText(message, `Pagamento ${p.id}`);
  }

  async function shareText(text, title) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        showToast("Compartilhamento nativo aberto.", "success");
        return;
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
      showToast("Mensagem preparada para compartilhamento.", "info");
    } catch (err) {
      console.error(err);
      showToast("Não foi possível compartilhar agora.", "error");
    }
  }

  function editAgricultor(id) {
    const item = getAgricultorById(id);
    if (!item) return;
    if ($("#agricultorId")) $("#agricultorId").value = item.id;
    if ($("#agricultorNome")) $("#agricultorNome").value = item.name || "";
    if ($("#agricultorApelido")) $("#agricultorApelido").value = item.shortName || "";
    if ($("#agricultorTelefone")) $("#agricultorTelefone").value = item.phone || "";
    if ($("#agricultorObs")) $("#agricultorObs").value = item.notes || "";
    if ($("#agricultorFormTitle")) $("#agricultorFormTitle").textContent = "Editar agricultor";
    openTab("agricultores");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editComprador(id) {
    const item = getCompradorById(id);
    if (!item) return;
    if ($("#compradorId")) $("#compradorId").value = item.id;
    if ($("#compradorNome")) $("#compradorNome").value = item.name || "";
    if ($("#compradorTelefone")) $("#compradorTelefone").value = item.phone || "";
    if ($("#compradorObs")) $("#compradorObs").value = item.notes || "";
    if ($("#compradorFormTitle")) $("#compradorFormTitle").textContent = "Editar comprador";
    openTab("compradores");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editProduto(id) {
    const item = getProdutoById(id);
    if (!item) return;
    if ($("#produtoId")) $("#produtoId").value = item.id;
    if ($("#produtoNome")) $("#produtoNome").value = item.name || "";
    if ($("#produtoCategoria")) $("#produtoCategoria").value = item.category || "Uva";
    if ($("#produtoObs")) $("#produtoObs").value = item.notes || "";
    if ($("#produtoFormTitle")) $("#produtoFormTitle").textContent = "Editar produto";
    openTab("produtos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editEntrega(id) {
    const item = getEntregaById(id);
    if (!item) return;
    if ($("#entregaId")) $("#entregaId").value = item.id;
    if ($("#entregaAgricultor")) $("#entregaAgricultor").value = item.farmerId || "";
    if ($("#entregaComprador")) $("#entregaComprador").value = item.buyerId || "";
    if ($("#entregaProduto")) $("#entregaProduto").value = item.productId || "";
    if ($("#entregaData")) $("#entregaData").value = item.date || nowDate();
    if ($("#entregaHora")) $("#entregaHora").value = item.time || nowTime();
    if ($("#entregaCaixas")) $("#entregaCaixas").value = item.boxes || "";
    if ($("#entregaPesoCaixa")) $("#entregaPesoCaixa").value = item.weightPerBox || "";
    if ($("#entregaPesoTotal")) $("#entregaPesoTotal").value = item.totalWeight || "";
    if ($("#entregaValorKg")) $("#entregaValorKg").value = item.pricePerKg || "";
    if ($("#entregaValorBruto")) $("#entregaValorBruto").value = item.grossValue || "";
    if ($("#entregaObs")) $("#entregaObs").value = item.notes || "";
    if ($("#entregaFormTitle")) $("#entregaFormTitle").textContent = "Editar entrega";
    openTab("entregas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteAgricultor(id) {
    const used = state.entregas.some(x => x.farmerId === id) || state.pagamentos.some(x => x.farmerId === id);
    if (used) return showToast("Não é possível excluir agricultor vinculado a entregas ou pagamentos.", "error");
    if (!confirm("Excluir este agricultor?")) return;
    state.agricultores = state.agricultores.filter(x => x.id !== id);
    saveDB();
    rerender();
    showToast("Agricultor excluído.");
  }

  function deleteComprador(id) {
    const used = state.entregas.some(x => x.buyerId === id) || state.pagamentos.some(x => x.buyerId === id);
    if (used) return showToast("Não é possível excluir comprador vinculado a entregas ou pagamentos.", "error");
    if (!confirm("Excluir este comprador?")) return;
    state.compradores = state.compradores.filter(x => x.id !== id);
    saveDB();
    rerender();
    showToast("Comprador excluído.");
  }

  function deleteProduto(id) {
    const used = state.entregas.some(x => x.productId === id) || state.pagamentos.some(x => x.productId === id);
    if (used) return showToast("Não é possível excluir produto vinculado a entregas ou pagamentos.", "error");
    if (!confirm("Excluir este produto?")) return;
    state.produtos = state.produtos.filter(x => x.id !== id);
    saveDB();
    rerender();
    showToast("Produto excluído.");
  }

  function deleteEntrega(id) {
    const used = state.pagamentos.some(p => (p.allocations || []).some(a => a.deliveryId === id));
    if (used) return showToast("Não é possível excluir uma entrega que já possui pagamento vinculado.", "error");
    if (!confirm("Excluir esta entrega?")) return;
    state.entregas = state.entregas.filter(x => x.id !== id);
    saveDB();
    rerender();
    showToast("Entrega excluída.");
  }

  function deletePagamento(id) {
    if (!confirm("Excluir este pagamento? Os saldos serão recalculados.")) return;
    state.pagamentos = state.pagamentos.filter(x => x.id !== id);
    saveDB();
    rerender();
    showToast("Pagamento excluído.");
  }

  function resetAgricultorForm() {
    $("#agricultorForm")?.reset();
    if ($("#agricultorId")) $("#agricultorId").value = "";
    if ($("#agricultorFormTitle")) $("#agricultorFormTitle").textContent = "Novo agricultor";
  }

  function resetCompradorForm() {
    $("#compradorForm")?.reset();
    if ($("#compradorId")) $("#compradorId").value = "";
    if ($("#compradorFormTitle")) $("#compradorFormTitle").textContent = "Novo comprador";
  }

  function resetProdutoForm() {
    $("#produtoForm")?.reset();
    if ($("#produtoId")) $("#produtoId").value = "";
    if ($("#produtoCategoria")) $("#produtoCategoria").value = "Uva";
    if ($("#produtoFormTitle")) $("#produtoFormTitle").textContent = "Novo produto";
  }

  function resetEntregaForm() {
    $("#entregaForm")?.reset();
    if ($("#entregaId")) $("#entregaId").value = "";
    if ($("#entregaFormTitle")) $("#entregaFormTitle").textContent = "Nova entrega";
    if ($("#entregaData")) $("#entregaData").value = nowDate();
    if ($("#entregaHora")) $("#entregaHora").value = nowTime();
  }

  function resetPagamentoForm() {
    $("#pagamentoForm")?.reset();
    if ($("#pagamentoId")) $("#pagamentoId").value = "";
    if ($("#pagamentoFormTitle")) $("#pagamentoFormTitle").textContent = "Novo pagamento";
    if ($("#pagamentoData")) $("#pagamentoData").value = nowDate();
    if ($("#pagamentoHora")) $("#pagamentoHora").value = nowTime();
    if ($("#paymentDeliveryPicker")) {
      $("#paymentDeliveryPicker").className = "delivery-picker empty";
      $("#paymentDeliveryPicker").textContent = "Selecione comprador e agricultor para ver entregas pendentes.";
    }
    if ($("#selectedDeliveryBox")) {
      $("#selectedDeliveryBox").className = "selected-delivery-box empty";
      $("#selectedDeliveryBox").innerHTML = 'Escolha uma entrega pendente clicando em <strong>Pagar</strong>.';
    }
    if ($("#pagamentoSaldoAtual")) $("#pagamentoSaldoAtual").value = "";
    if ($("#pagamentoEntregaSelecionada")) $("#pagamentoEntregaSelecionada").value = "";
    if ($("#pagamentoProdutoFiltro")) $("#pagamentoProdutoFiltro").value = "";
    if ($("#pagamentoProduto")) {
      $("#pagamentoProduto").innerHTML = '<option value="">Selecione uma entrega</option>';
      $("#pagamentoProduto").disabled = true;
    }
    updatePaymentPreview();
  }

  function rerender() {
    refreshAllSelects();
    updateProfileUI();
    renderDashboard();
    renderAgricultores();
    renderCompradores();
    renderProdutos();
    renderEntregas();
    renderPagamentos();
    renderHistorico();
    generateReport();
    renderPaymentDeliveryPicker();
  }

  function clearAllData() {
    if (!confirm("Tem certeza que deseja apagar todos os dados do sistema?")) return;
    const fresh = createInitialDB();
    fresh.settings.theme = state.settings.theme || "light";
    Object.keys(state).forEach(key => delete state[key]);
    Object.assign(state, fresh);
    saveDB();
    setupFormsDefaults();
    resetAgricultorForm();
    resetCompradorForm();
    resetProdutoForm();
    resetEntregaForm();
    resetPagamentoForm();
    rerender();
    openOnboarding();
    showToast("Todos os dados foram apagados.", "info");
  }

  function loadDemoData() {
    if (!confirm("Deseja inserir dados de exemplo? Isso mantém seus dados atuais e adiciona novos registros.")) return;

    const now = new Date().toISOString();

    const farmer1 = { id: uid("AGRI"), name: "Frank C. N", shortName: "Frank", phone: "(44) 99999-1111", notes: "Produtor de uvas finas", createdAt: now, updatedAt: now };
    const farmer2 = { id: uid("AGRI"), name: "João X", shortName: "João", phone: "(44) 99999-2222", notes: "Pitaya e uvas", createdAt: now, updatedAt: now };
    const buyer1 = { id: uid("COMP"), name: "Comprador Y", phone: "(44) 99999-3333", notes: "Atacadista regional", createdAt: now, updatedAt: now };
    const buyer2 = { id: uid("COMP"), name: "Central Hortifrúti", phone: "(44) 99999-4444", notes: "Rede de distribuição", createdAt: now, updatedAt: now };

    state.agricultores.push(farmer1, farmer2);
    state.compradores.push(buyer1, buyer2);

    const benitaka = state.produtos.find(p => p.name === "Benitaka");
    const pitaya = state.produtos.find(p => p.name === "Pitaya");
    const nubia = state.produtos.find(p => p.name === "Núbia");

    if (!benitaka || !pitaya || !nubia) return showToast("Produtos padrão não encontrados.", "error");

    const ent1 = {
      id: uid("ENT"),
      farmerId: farmer1.id,
      buyerId: buyer1.id,
      productId: benitaka.id,
      date: nowDate(),
      time: "08:30",
      boxes: 80,
      weightPerBox: 8,
      totalWeight: 640,
      pricePerKg: 4.8,
      grossValue: 3072,
      notes: "Entrega da manhã",
      createdAt: now,
      updatedAt: now
    };

    const ent2 = {
      id: uid("ENT"),
      farmerId: farmer2.id,
      buyerId: buyer1.id,
      productId: pitaya.id,
      date: nowDate(),
      time: "10:15",
      boxes: 24,
      weightPerBox: 10,
      totalWeight: 240,
      pricePerKg: 9.5,
      grossValue: 2280,
      notes: "Pitaya selecionada",
      createdAt: now,
      updatedAt: now
    };

    const ent3 = {
      id: uid("ENT"),
      farmerId: farmer1.id,
      buyerId: buyer2.id,
      productId: nubia.id,
      date: nowDate(),
      time: "14:20",
      boxes: 36,
      weightPerBox: 7.5,
      totalWeight: 270,
      pricePerKg: 5.4,
      grossValue: 1458,
      notes: "Segunda carga do dia",
      createdAt: now,
      updatedAt: now
    };

    state.entregas.push(ent1, ent2, ent3);

    state.pagamentos.push({
      id: uid("PAG"),
      buyerId: buyer1.id,
      farmerId: farmer1.id,
      productId: benitaka.id,
      paymentMethod: "Pix",
      date: nowDate(),
      time: "16:00",
      amount: 1500,
      notes: "Pagamento parcial",
      description: `Pagamento em Pix referente à uva Benitaka entregue por ${farmer1.name} em ${formatDate(ent1.date)} às ${ent1.time}.`,
      allocations: [{ deliveryId: ent1.id, amount: 1500 }],
      createdAt: now,
      updatedAt: now
    });

    saveDB();
    rerender();
    showToast("Dados de exemplo adicionados.");
  }

  function escapeHTML(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function init() {
    setupFormsDefaults();
    bindEvents();
    applyTheme();
    refreshAllSelects();
    rerender();
    openTab(state.settings.lastTab || "dashboard");

    if (!state.settings.onboardingDone || !state.settings.profile) {
      openOnboarding();
    } else {
      closeOnboarding();
    }
  }

  init();
})();