/* app.js — lógica completa (localStorage) */

/*
Estratégia:
- Persistência: localStorage com chaves 'pdv_products' e 'pdv_sales'
- Produtos: {id, code, name, price, stock}
- Vendas: {id, created_at, items: [{id, name, price, qty}], total}
- Carrinho é mantido em memória (JS), finaliza venda -> grava vendas e atualiza estoque
*/

// ---------- Helpers ----------
const $ = sel => document.querySelector(sel);
const formatMoney = v => 'R$ ' + Number(v || 0).toFixed(2);

// gera id incremental simples (local)
function nextId(key) {
  const n = Number(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, String(n));
  return n;
}

// CSV simples
function toCSV(rows, columns) {
  const esc = v => `"${String(v ?? '').replace(/"/g,'""')}"`;
  const header = columns.map(c => esc(c.label)).join(',');
  const lines = rows.map(r => columns.map(c => esc(c.key ? r[c.key] : c.fn?.(r))).join(','));
  return [header, ...lines].join('\n');
}

// ---------- Storage ----------
const Storage = {
  getProducts() { return JSON.parse(localStorage.getItem('pdv_products') || '[]'); },
  saveProducts(list) { localStorage.setItem('pdv_products', JSON.stringify(list)); },
  getSales() { return JSON.parse(localStorage.getItem('pdv_sales') || '[]'); },
  saveSales(list) { localStorage.setItem('pdv_sales', JSON.stringify(list)); },
  clearAll(){ localStorage.removeItem('pdv_products'); localStorage.removeItem('pdv_sales'); localStorage.removeItem('pdv_lastid'); localStorage.removeItem('pdv_saleid'); }
};

// ---------- State ----------
let PRODUCTS = Storage.getProducts();
let SALES = Storage.getSales();
let CART = [];

// ---------- DOM Nodes ----------
const productForm = $('#productForm');
const productsList = $('#productsList');
const salesList = $('#salesList');
const cartEl = $('#cart');
const cartTotalEl = $('#cartTotal');
const checkoutBtn = $('#checkout');
const clearCartBtn = $('#clearCart');
const exportProductsBtn = $('#exportProducts');
const exportSalesBtn = $('#exportSales');
const clearProductsBtn = $('#clearProducts');
const searchInput = $('#searchInput');
const productQuick = $('#productQuick');

// ---------- Product functions ----------
function saveProducts() {
  Storage.saveProducts(PRODUCTS);
  renderProducts();
  renderQuick();
}

function addProduct(data) {
  const id = nextId('pdv_lastid');
  PRODUCTS.unshift({ id, ...data });
  saveProducts();
}

function updateProduct(id, newData) {
  PRODUCTS = PRODUCTS.map(p => p.id === id ? { ...p, ...newData } : p);
  saveProducts();
}

function deleteProduct(id) {
  PRODUCTS = PRODUCTS.filter(p => p.id !== id);
  saveProducts();
}

function findProduct(id){ return PRODUCTS.find(p => p.id === id); }

// ---------- Render ----------
function renderProducts(filter = '') {
  productsList.innerHTML = '';
  const rows = PRODUCTS.filter(p => {
    const f = filter.trim().toLowerCase();
    if(!f) return true;
    return (p.name || '').toLowerCase().includes(f) || (p.code || '').toLowerCase().includes(f);
  });
  if(rows.length === 0) {
    productsList.innerHTML = '<li class="muted">Nenhum produto cadastrado</li>';
    return;
  }

  rows.forEach(p => {
    const li = document.createElement('li');

    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.innerHTML = `<strong>${escapeHtml(p.name)}</strong><small>Código: ${escapeHtml(p.code || '')}</small>`;

    const right = document.createElement('div');
    right.className = 'item-actions';
    right.innerHTML = `<div style="text-align:right"><small>R$ ${Number(p.price).toFixed(2)}</small><div>Estoque: ${p.stock}</div></div>`;

    const btns = document.createElement('div');
    btns.className = 'item-actions';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Adicionar';
    addBtn.className = 'btn';
    addBtn.onclick = ()=> addToCart(p.id);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'btn outline';
    editBtn.onclick = ()=> openEditPrompt(p);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Excluir';
    delBtn.className = 'btn danger';
    delBtn.onclick = ()=> {
      if(confirm(`Excluir produto "${p.name}"?`)){ deleteProduct(p.id); }
    };

    btns.appendChild(addBtn);
    btns.appendChild(editBtn);
    btns.appendChild(delBtn);

    li.appendChild(meta);
    li.appendChild(right);
    li.appendChild(btns);
    productsList.appendChild(li);
  });
}

function renderQuick(filter='') {
  productQuick.innerHTML = '';
  const rows = PRODUCTS.filter(p => (p.name || '').toLowerCase().includes(filter.toLowerCase()) || (p.code || '').toLowerCase().includes(filter.toLowerCase()));
  rows.slice(0,30).forEach(p => {
    const pc = document.createElement('div');
    pc.className = 'product-card';
    pc.innerHTML = `<div><strong>${escapeHtml(p.name)}</strong><div style="font-size:.85rem">R$ ${Number(p.price).toFixed(2)} — estoque ${p.stock}</div></div>`;
    const btn = document.createElement('button');
    btn.textContent = 'Add';
    btn.onclick = ()=> addToCart(p.id);
    pc.appendChild(btn);
    productQuick.appendChild(pc);
  });
}

// ---------- Cart ----------
function addToCart(productId) {
  const p = findProduct(productId);
  if(!p){ alert('Produto não encontrado'); return; }
  if(p.stock <= 0){ alert('Sem estoque'); return; }
  const found = CART.find(c => c.id === productId);
  if(found){ 
    if(found.qty + 1 > p.stock){ alert('Quantidade maior que estoque'); return; }
    found.qty += 1;
  } else {
    CART.push({ id: p.id, name: p.name, price: Number(p.price), qty: 1 });
  }
  renderCart();
}

function removeFromCart(productId){
  CART = CART.filter(c => c.id !== productId);
  renderCart();
}

function changeQty(productId, delta){
  const item = CART.find(c => c.id === productId);
  if(!item) return;
  const p = findProduct(productId);
  const newQty = item.qty + delta;
  if(newQty <= 0){ removeFromCart(productId); return; }
  if(newQty > p.stock){ alert('Ultrapassa estoque'); return; }
  item.qty = newQty;
  renderCart();
}

function renderCart(){
  cartEl.innerHTML = '';
  if(CART.length === 0){ cartEl.innerHTML = '<small class="muted">Carrinho vazio</small>'; cartTotalEl.textContent = formatMoney(0); return; }
  CART.forEach(i => {
    const div = document.createElement('div');
    div.innerHTML = `<div style="flex:1">${escapeHtml(i.name)} <small class="muted">(${i.qty} x R$ ${Number(i.price).toFixed(2)})</small></div>
      <div style="display:flex;gap:6px">
        <button class="btn outline" onclick="changeQty(${i.id}, -1)">-</button>
        <button class="btn outline" onclick="changeQty(${i.id}, 1)">+</button>
        <button class="btn danger" onclick="removeFromCart(${i.id})">Remover</button>
      </div>`;
    cartEl.appendChild(div);
  });
  const total = CART.reduce((s,i)=>s + i.price * i.qty, 0);
  cartTotalEl.textContent = formatMoney(total);
}

// expose changeQty/removeFromCart for inline onclick (simple approach)
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;

// ---------- Checkout / Sales ----------
function checkout(){
  if(CART.length === 0){ alert('Carrinho vazio'); return; }
  // confirma
  const total = CART.reduce((s,i)=>s + i.price * i.qty, 0);
  if(!confirm(`Finalizar venda — Total ${formatMoney(total)} ?`)) return;

  // Atualiza estoque
  CART.forEach(i => {
    PRODUCTS = PRODUCTS.map(p => p.id === i.id ? { ...p, stock: p.stock - i.qty } : p);
  });
  saveProducts();

  // Criar objeto de venda
  const saleId = nextId('pdv_saleid');
  const sale = {
    id: saleId,
    created_at: new Date().toISOString(),
    items: CART.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
    total: Number(total.toFixed(2))
  };
  SALES.unshift(sale);
  Storage.saveSales(SALES);

  CART = [];
  renderCart();
  renderSales();
  alert('Venda registrada!');
}

function renderSales(){
  salesList.innerHTML = '';
  if(SALES.length === 0){ salesList.innerHTML = '<li class="muted">Nenhuma venda registrada</li>'; return; }
  SALES.forEach(s => {
    const li = document.createElement('li');
    const date = new Date(s.created_at).toLocaleString();
    const itemsSummary = s.items.map(it => `${escapeHtml(it.name)} x${it.qty}`).join(', ');
    li.innerHTML = `<div style="flex:1"><strong>${date}</strong><div style="font-size:.9rem">${itemsSummary}</div></div><div style="text-align:right"><div><strong>R$ ${Number(s.total).toFixed(2)}</strong></div></div>`;
    salesList.appendChild(li);
  });
}

// ---------- Product edit prompt ----------
function openEditPrompt(p){
  const code = prompt('Código:', p.code || '') ?? p.code;
  const name = prompt('Nome:', p.name) ?? p.name;
  const price = Number(prompt('Preço (use ponto):', p.price) ?? p.price);
  const stock = Number(prompt('Estoque:', p.stock) ?? p.stock);
  if(name.trim()===''){ alert('Nome obrigatório'); return; }
  updateProduct(p.id, { code, name, price, stock });
}

// ---------- Utilities ----------
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ---------- Events ----------
productForm.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(productForm);
  const code = fd.get('code') || '';
  const name = fd.get('name') || '';
  const price = Number(fd.get('price') || 0);
  const stock = Number(fd.get('stock') || 0);
  if(!name) { alert('Nome obrigatório'); return; }
  addProduct({ code, name, price, stock });
  productForm.reset();
});

checkoutBtn.addEventListener('click', checkout);
clearCartBtn.addEventListener('click', ()=>{ if(confirm('Limpar carrinho?')){ CART = []; renderCart(); } });

exportProductsBtn.addEventListener('click', ()=> {
  const cols = [{label:'id', key:'id'}, {label:'code', key:'code'}, {label:'name', key:'name'}, {label:'price', key:'price'}, {label:'stock', key:'stock'}];
  const csv = toCSV(PRODUCTS, cols);
  downloadFile(csv, 'produtos.csv', 'text/csv');
});

exportSalesBtn.addEventListener('click', ()=> {
  const cols = [
    {label:'id', key:'id'},
    {label:'created_at', key:'created_at'},
    {label:'items', fn: r => r.items.map(i=> `${i.name} x${i.qty}`).join('; ')},
    {label:'total', key:'total'}
  ];
  const csv = toCSV(SALES, cols);
  downloadFile(csv, 'vendas.csv', 'text/csv');
});

clearProductsBtn.addEventListener('click', ()=> {
  if(confirm('Apagar TODOS os produtos e vendas (irrevogável)?')){
    Storage.clearAll();
    PRODUCTS = [];
    SALES = [];
    CART = [];
    renderProducts();
    renderSales();
    renderCart();
    renderQuick();
  }
});

searchInput.addEventListener('input', (e)=> {
  renderProducts(e.target.value);
  renderQuick(e.target.value);
});

// download helper
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(url), 5000);
}

// ---------- Init ----------
function init(){
  PRODUCTS = Storage.getProducts();
  SALES = Storage.getSales();
  renderProducts();
  renderSales();
  renderCart();
  renderQuick();
}
init();
