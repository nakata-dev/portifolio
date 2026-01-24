/* =========================================================
   Controle de Vendas PRO - app.js
   ✔ Vendas: adicionar / editar / apagar
   ✔ KPIs: Hoje / Semana / Mês / Insights
   ✔ Filtros + Busca
   ✔ Exportação: PDF e CSV
========================================================= */

const STORAGE_KEY = "vendas_pro";
const THEME_KEY = "tema_vendas_pro";

let vendas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let editandoId = null;

// filtros
let filtroAtivo = "all";  // all | today | week | month
let termoBusca = "";

// Atalho rápido
const $ = (sel) => document.querySelector(sel);

/* -------------------------
   Helpers
------------------------- */
function formatBRL(valor) {
  return (valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Últimos X dias (semana dinâmica)
function isWithinLastDays(dateISO, days) {
  const d = parseISODate(dateISO).getTime();
  const now = new Date().getTime();
  const diff = now - d;
  const limit = days * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= limit;
}

function isSameMonth(dateISO, baseISO) {
  return dateISO.substring(0, 7) === baseISO.substring(0, 7);
}

// Toast minimalista para feedback
function toast(msg, sub = "") {
  const t = $("#toast");
  t.innerHTML = `${msg}${sub ? `<small>${sub}</small>` : ""}`;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2400);
}

// Salva no navegador
function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendas));
}

/* -------------------------
   Filtros + Busca
------------------------- */
function aplicarFiltros(lista) {
  const dataBase = $("#data").value || getTodayISO();
  let filtrada = [...lista];

  if (filtroAtivo === "today") {
    filtrada = filtrada.filter(v => v.data === dataBase);
  }

  if (filtroAtivo === "week") {
    filtrada = filtrada.filter(v => isWithinLastDays(v.data, 7));
  }

  if (filtroAtivo === "month") {
    filtrada = filtrada.filter(v => isSameMonth(v.data, dataBase));
  }

  if (termoBusca.trim()) {
    const q = termoBusca.trim().toLowerCase();
    filtrada = filtrada.filter(v =>
      (v.produto || "").toLowerCase().includes(q) ||
      (v.codigo || "").toLowerCase().includes(q) ||
      (v.obs || "").toLowerCase().includes(q) ||
      (v.pagamento || "").toLowerCase().includes(q)
    );
  }

  return filtrada;
}

/* -------------------------
   KPIs + Insights
------------------------- */
function calcularKPIs() {
  const hojeISO = $("#data").value || getTodayISO();
  const baseMes = hojeISO.substring(0, 7);

  const doDia = vendas.filter(v => v.data === hojeISO);
  const totalHoje = doDia.reduce((acc, v) => acc + v.valor, 0);

  const daSemana = vendas.filter(v => isWithinLastDays(v.data, 7));
  const totalSemana = daSemana.reduce((acc, v) => acc + v.valor, 0);

  const doMes = vendas.filter(v => v.data.substring(0, 7) === baseMes);
  const totalMes = doMes.reduce((acc, v) => acc + v.valor, 0);

  $("#kpiHoje").textContent = formatBRL(totalHoje);
  $("#kpiSemana").textContent = formatBRL(totalSemana);
  $("#kpiMes").textContent = formatBRL(totalMes);

  $("#chipHoje").textContent = `${doDia.length} venda${doDia.length === 1 ? "" : "s"}`;
  $("#chipSemana").textContent = `${daSemana.length} venda${daSemana.length === 1 ? "" : "s"}`;
  $("#chipMes").textContent = `${doMes.length} venda${doMes.length === 1 ? "" : "s"}`;

  // INSIGHTS
  const totalGeral = vendas.reduce((acc, v) => acc + v.valor, 0);
  const qtdGeral = vendas.length;
  const media = qtdGeral ? totalGeral / qtdGeral : 0;

  const pagamentos = {};
  const produtos = {};

  vendas.forEach(v => {
    const pag = v.pagamento || "Não informado";
    pagamentos[pag] = (pagamentos[pag] || 0) + v.valor;

    const prod = (v.produto || "Sem nome").trim();
    produtos[prod] = (produtos[prod] || 0) + v.valor;
  });

  const melhorPagamento = Object.entries(pagamentos).sort((a, b) => b[1] - a[1])[0];
  const topProduto = Object.entries(produtos).sort((a, b) => b[1] - a[1])[0];

  $("#kpiInsight").textContent = qtdGeral ? `Média ${formatBRL(media)}` : "Sem vendas ainda";
  $("#subInsight").textContent = qtdGeral
    ? `Top: ${topProduto?.[0] || "-"} • Pagamento: ${melhorPagamento?.[0] || "-"}`
    : "Cadastre sua primeira venda acima 😉";
}

/* -------------------------
   Tabela
------------------------- */
function atualizarTabela() {
  const tabela = $("#tabela");
  const empty = $("#emptyState");

  tabela.innerHTML = "";
  const lista = aplicarFiltros(vendas);

  empty.style.display = lista.length ? "none" : "block";

  lista
    .sort((a, b) => parseISODate(b.data) - parseISODate(a.data))
    .forEach((v, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td data-label="#">${index + 1}</td>
        <td data-label="Data">${v.data}</td>
        <td data-label="Produto">${v.produto}</td>
        <td data-label="Código">${v.codigo || "-"}</td>
        <td data-label="Pagamento">${v.pagamento || "-"}</td>
        <td data-label="Obs">${v.obs || "-"}</td>
        <td data-label="Valor">${formatBRL(v.valor)}</td>
        <td data-label="Ação">
          <div class="actions">
            <button class="chip-btn del" onclick="deletarVenda('${v.uid}')">Apagar</button>
            <button class="chip-btn edit" onclick="editarVenda('${v.uid}')">Editar</button>
          </div>
        </td>
      `;

      tabela.appendChild(tr);
    });

  calcularKPIs();
}

/* -------------------------
   CRUD
------------------------- */
function limparCampos() {
  $("#produto").value = "";
  $("#codigo").value = "";
  $("#pagamento").value = "";
  $("#obs").value = "";
  $("#valor").value = "";
}

function adicionarOuEditarVenda() {
  const data = $("#data").value;
  const produto = $("#produto").value.trim();
  const codigo = $("#codigo").value.trim().toUpperCase();
  const pagamento = $("#pagamento").value;
  const obs = $("#obs").value.trim();
  const valor = parseFloat($("#valor").value || 0);

  if (!data || !produto || valor <= 0) {
    toast("⚠️ Preencha Data, Produto e Valor", "Ex: Data + Produto + 10,50");
    return;
  }

  if (editandoId) {
    const i = vendas.findIndex(v => v.uid === editandoId);
    if (i >= 0) {
      vendas[i] = { ...vendas[i], data, produto, codigo, pagamento, obs, valor };
    }
    editandoId = null;
    $("#btnAdd").textContent = "Adicionar";
    toast("✅ Venda atualizada", "Alterações salvas.");
  } else {
    vendas.push({
      uid: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      data, produto, codigo, pagamento, obs, valor,
      createdAt: Date.now()
    });
    toast("✅ Venda adicionada", "Registro salvo.");
  }

  salvar();
  atualizarTabela();
  limparCampos();
}

window.editarVenda = function (uid) {
  const v = vendas.find(x => x.uid === uid);
  if (!v) return;

  $("#data").value = v.data;
  $("#produto").value = v.produto;
  $("#codigo").value = v.codigo || "";
  $("#pagamento").value = v.pagamento || "";
  $("#obs").value = v.obs || "";
  $("#valor").value = v.valor;

  editandoId = uid;
  $("#btnAdd").textContent = "Salvar Alterações";

  toast("✏️ Modo edição", "Edite e clique em salvar.");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deletarVenda = function (uid) {
  if (!confirm("Deseja realmente apagar esta venda?")) return;

  vendas = vendas.filter(v => v.uid !== uid);
  salvar();
  atualizarTabela();
  toast("🗑️ Venda apagada", "Registro removido.");
};

/* -------------------------
   PDF / CSV
------------------------- */
async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const dataBase = $("#data").value || getTodayISO();
  const lista = aplicarFiltros(vendas);

  pdf.setFontSize(14);
  pdf.text("Controle de Vendas Versão - PRO", 10, 14);

  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 10, 22);
  pdf.text(`Filtro: ${filtroAtivo.toUpperCase()} | Base: ${dataBase}`, 10, 28);

  const totalLista = lista.reduce((acc, v) => acc + v.valor, 0);
  pdf.text(`Total do relatório: ${formatBRL(totalLista)}`, 10, 36);

  let y = 46;
  pdf.setFontSize(11);

  lista.forEach((v, idx) => {
    pdf.text(`${idx + 1}. ${v.data} • ${v.produto}`, 10, y);
    pdf.text(`Código: ${v.codigo || "-"} | Pagamento: ${v.pagamento || "-"} | Valor: ${formatBRL(v.valor)}`, 10, y + 7);
    pdf.text(`Obs: ${v.obs || "-"}`, 10, y + 14);

    y += 24;
    if (y > 270) {
      pdf.addPage();
      y = 16;
    }
  });

  pdf.save("vendas-pro.pdf");
  toast("📄 PDF gerado", "Arquivo baixado.");
}

function exportCSV() {
  const lista = aplicarFiltros(vendas);

  if (!lista.length) {
    toast("⚠️ Nada para exportar", "Cadastre vendas ou mude o filtro.");
    return;
  }

  const header = ["Data", "Produto", "Código", "Pagamento", "Obs", "Valor"];
  const rows = lista.map(v => [
    v.data,
    (v.produto || "").replaceAll(";", ","),
    (v.codigo || "").replaceAll(";", ","),
    (v.pagamento || "").replaceAll(";", ","),
    (v.obs || "").replaceAll(";", ","),
    String(v.valor).replace(".", ",")
  ]);

  const csv = [header, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vendas-pro.csv";
  a.click();
  URL.revokeObjectURL(url);

  toast("⬇️ CSV exportado", "Abra no Excel/Sheets.");
}

/* -------------------------
   Limpar mês
------------------------- */
function limparMes() {
  const base = $("#data").value || getTodayISO();
  const mesBase = base.substring(0, 7);

  const qtdMes = vendas.filter(v => v.data.substring(0, 7) === mesBase).length;

  if (!qtdMes) {
    toast("⚠️ Sem vendas no mês", "Nada para apagar.");
    return;
  }

  if (!confirm(`Apagar TODAS as vendas do mês ${mesBase}?`)) return;

  vendas = vendas.filter(v => v.data.substring(0, 7) !== mesBase);
  salvar();
  atualizarTabela();
  toast("✅ Mês limpo", `Apagadas vendas de ${mesBase}.`);
}

/* -------------------------
   Tema
------------------------- */
function carregarTema() {
  const tema = localStorage.getItem(THEME_KEY);
  if (tema === "dark") document.body.classList.add("dark");
  atualizarTextoTema();
}

function atualizarTextoTema() {
  const dark = document.body.classList.contains("dark");
  $("#toggleTheme").textContent = dark ? "☀️ Claro" : "🌙 Escuro";
}

function alternarTema() {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
  atualizarTextoTema();
}

/* -------------------------
   UX
------------------------- */
function setHoje() {
  $("#data").value = getTodayISO();
  toast("📅 Data ajustada", "Base: Hoje");
  atualizarTabela();
}

function limparFiltros() {
  filtroAtivo = "all";
  termoBusca = "";
  $("#busca").value = "";

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector(".tab[data-filter='all']").classList.add("active");

  toast("🧹 Filtros limpos", "Exibindo tudo.");
  atualizarTabela();
}

/* -------------------------
   Events
------------------------- */
function bindEvents() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      filtroAtivo = tab.dataset.filter;
      atualizarTabela();
    });
  });

  $("#busca").addEventListener("input", (e) => {
    termoBusca = e.target.value;
    atualizarTabela();
  });

  $("#data").addEventListener("change", atualizarTabela);

  $("#btnAdd").addEventListener("click", (e) => {
    e.preventDefault();
    adicionarOuEditarVenda();
  });

  $("#btnPDF").addEventListener("click", (e) => {
    e.preventDefault();
    gerarPDF();
  });

  $("#btnLimparMes").addEventListener("click", (e) => {
    e.preventDefault();
    limparMes();
  });

  $("#btnLimparFiltros").addEventListener("click", (e) => {
    e.preventDefault();
    limparFiltros();
  });

  $("#toggleTheme").addEventListener("click", alternarTema);
  $("#btnHoje").addEventListener("click", setHoje);
  $("#btnCSV").addEventListener("click", exportCSV);

  // Enter adiciona venda (menos quando estiver na busca)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const el = document.activeElement;
      if (el && el.id === "busca") return;
      if (el && el.tagName === "SELECT") return;

      e.preventDefault();
      adicionarOuEditarVenda();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarTema();
  $("#data").value = getTodayISO();
  bindEvents();
  atualizarTabela();
  toast("✅ PRO pronto", "Cadastre sua primeira venda.");
});
