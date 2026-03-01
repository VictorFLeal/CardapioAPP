// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════
const MENU = {
  entradas: [
    { id:1, name:'Bruschetta', desc:'Tomate, Manjericão, Alho, Pão', price:18.90, ing:['Tomate','Manjericão','Alho','Pão'] },
    { id:2, name:'Salada Caesar', desc:'Alface, Frango, Croutons, Parmesão, Molho Caesar', price:24.90, ing:['Alface','Frango','Croutons','Parmesão','Molho Caesar'] },
    { id:3, name:'Isca de Peixe', desc:'Peixe, Farinha, Limão, Molho Tártaro', price:32.90, ing:['Peixe','Farinha','Limão','Molho Tártaro'] },
    { id:4, name:'Caldo Verde', desc:'Linguiça, Couve, Batata, Caldo', price:19.90, ing:['Linguiça','Couve','Batata','Caldo'] },
  ],
  principal: [
    { id:5, name:'Frango Grelhado', desc:'Frango, Limão, Alecrim, Arroz e Feijão', price:38.90, ing:['Frango','Limão','Alecrim','Arroz','Feijão'] },
    { id:6, name:'Filé Mignon', desc:'Filé, Molho Madeira, Batata Rústica', price:58.90, ing:['Filé','Molho Madeira','Batata Rústica'] },
    { id:7, name:'Massa Carbonara', desc:'Espaguete, Bacon, Ovo, Parmesão', price:42.90, ing:['Espaguete','Bacon','Ovo','Parmesão'] },
    { id:8, name:'Salmão Grelhado', desc:'Salmão, Limão, Alcaparras, Purê', price:54.90, ing:['Salmão','Limão','Alcaparras','Purê'] },
  ],
  sobremesas: [
    { id:9, name:'Petit Gateau', desc:'Chocolate, Sorvete, Calda', price:22.90, ing:['Chocolate','Sorvete','Calda'] },
    { id:10, name:'Pudim', desc:'Leite Condensado, Ovos, Caramelo', price:16.90, ing:['Leite Condensado','Ovos','Caramelo'] },
    { id:11, name:'Açaí', desc:'Açaí, Granola, Banana, Mel', price:19.90, ing:['Açaí','Granola','Banana','Mel'] },
  ],
  bebidas: [
    { id:12, name:'Refrigerante', desc:'Lata 350ml', price:8.00, ing:[], bev:true },
    { id:13, name:'Suco Natural', desc:'Laranja, Limão ou Maracujá', price:12.00, ing:[], bev:true },
    { id:14, name:'Água Mineral', desc:'500ml', price:6.00, ing:[], bev:true },
    { id:15, name:'Cerveja', desc:'Long neck 355ml', price:10.00, ing:[], bev:true },
    { id:16, name:'Vinho (Taça)', desc:'Tinto ou Branco', price:18.00, ing:[], bev:true },
    { id:17, name:'Caipirinha', desc:'Limão, Açúcar, Cachaça', price:15.00, ing:[], bev:true },
    { id:18, name:'Café', desc:'Expresso ou Americano', price:7.00, ing:[], bev:true },
  ],
};

// STATE
let mesa = null;
let pendStaff = null;
let cart = {};
let orders = [];
let oc = 100;
let curTab = 'entradas';
let editId = null;
let editRm = [];
let selPayClient = null;
let cxOrdId = null;
let cxPaySel = null;
let trocoOpt = null;
let periodCur = 'hoje';
let cozDetOrd = null;
let tickInterval = null;
let mesaPagamentoAtual = null;

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');
const fi = id => { for (const c of Object.values(MENU)) { const f = c.find(i => i.id == id); if (f) return f; } return null; };
const el = id => document.getElementById(id);
const now_time = () => { const d = new Date(); return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0'); };
const today_str = () => new Date().toISOString().slice(0,10);

function go(s) {
  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  const scr = document.getElementById('s-' + s);
  if (scr) {
    scr.classList.add('active');
    scr.scrollTop = 0;
  }
  if (s === 'coz') rCoz();
  if (s === 'gar') rGar();
  if (s === 'cx') rCx();
  if (s === 'rel') rRel();
}

function voltarHome() {
  document.querySelectorAll('.modal-ov').forEach(m => m.classList.remove('open'));
  go('home');
}

function toast(m, d = 2800) {
  const t = el('toast');
  t.textContent = m;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), d);
}

function om(id) { el(id).classList.add('open'); }
function cm(id) { el(id).classList.remove('open'); }

// ═══════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════
let tipoAtual = 'mesa';
let retiradaCounter = 0;

function setTipo(t) {
  tipoAtual = t;
  const btnMesa = el('tipo-mesa'), btnRet = el('tipo-retirada');
  const wrapMesa = el('mesa-wrap'), wrapRet = el('retirada-wrap');
  if (t === 'mesa') {
    btnMesa.className = 'flex-1 py-2.5 rounded-xl border-2 border-[#E8430A] bg-[#E8430A] text-white font-bold text-sm transition';
    btnRet.className = 'flex-1 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-400 font-bold text-sm transition';
    wrapMesa.classList.remove('hidden'); wrapRet.classList.add('hidden');
    el('retirada-in').value = '';
  } else {
    btnRet.className = 'flex-1 py-2.5 rounded-xl border-2 border-[#E8430A] bg-[#E8430A] text-white font-bold text-sm transition';
    btnMesa.className = 'flex-1 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-400 font-bold text-sm transition';
    wrapRet.classList.remove('hidden'); wrapMesa.classList.add('hidden');
  }
  checkAccBtn();
}

function gerarRetirada() {
  retiradaCounter++;
  const num = 'R-' + String(retiradaCounter).padStart(3, '0');
  el('retirada-in').value = num;
  checkAccBtn();
  toast('🛍️ Pedido ' + num + ' gerado!');
}

function onMesaInput() {
  checkAccBtn();
}

function checkAccBtn() {
  const btn = el('btn-acc');
  let ok = false;
  if (tipoAtual === 'mesa') {
    const v = parseInt(el('mesa-in').value);
    ok = v >= 1;
  } else {
    ok = !!el('retirada-in').value;
  }
  btn.disabled = !ok;
  btn.classList.toggle('opacity-50', !ok);
  btn.classList.toggle('cursor-not-allowed', !ok);
}

el('mesa-in').addEventListener('input', checkAccBtn);
el('mesa-in').addEventListener('keydown', e => { if (e.key === 'Enter' && !el('btn-acc').disabled) acessar(); });

function acessar() {
  if (tipoAtual === 'mesa') {
    mesa = parseInt(el('mesa-in').value);
    el('mesa-title').textContent = 'Mesa ' + mesa;
    el('chk-sub').textContent = 'Mesa ' + mesa;
  } else {
    const cod = el('retirada-in').value;
    mesa = cod; 
    el('mesa-title').textContent = '🛍️ ' + cod;
    el('chk-sub').textContent = 'Retirada ' + cod;
  }
  cart = {};
  ctab('entradas', document.querySelector('#ctabs .tab'));
  rHist();
  go('cliente');
}

function openStaff(role) {
  pendStaff = role;
  el('senha-in').value = '';
  el('senha-err').classList.add('hidden');
  om('m-senha');
  setTimeout(() => el('senha-in').focus(), 300);
}

function confSenha() {
  if (el('senha-in').value === '1234') {
    cm('m-senha');
    const map = { cozinha: 'coz', garcom: 'gar', caixa: 'cx' };
    go(map[pendStaff] || 'home');
    startTick();
  } else {
    el('senha-err').classList.remove('hidden');
    el('senha-in').value = '';
  }
}
el('senha-in').addEventListener('keydown', e => { if (e.key === 'Enter') confSenha(); });

// ═══════════════════════════════════════════════
// CLIENTE — CARDÁPIO
// ═══════════════════════════════════════════════
function ctab(tab, elBtn) {
  curTab = tab;
  document.querySelectorAll('#ctabs .tab').forEach(b => b.classList.remove('active'));
  if (elBtn) elBtn.classList.add('active');
  rMenu();
}

function rMenu() {
  const items = MENU[curTab] || [];
  const w = el('c-menu');
  let h = '<div class="px-4 pt-3">';
  items.forEach(item => {
    const c = cart[item.id];
    h += `<div class="bg-white rounded-xl shadow-sm p-4 mb-3">
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <div class="text-base font-bold mb-0.5">${item.name}</div>
          <div class="text-xs text-gray-400 mb-2 leading-relaxed">${item.desc}</div>
          <div class="text-base font-black text-orange-600" style="color:#E8430A">${fmt(item.price)}</div>
        </div>
        ${!c
          ? `<button onclick="addC(${item.id})" class="btn-primary text-sm px-4 py-2 shrink-0" style="width:auto;font-size:13px">Adicionar</button>`
          : `<button onclick="rmC(${item.id})" class="btn-outline text-xs px-3 py-2 shrink-0" style="width:auto;color:#9CA3AF;border-color:#E5E7EB">Remover</button>`
        }
      </div>
      ${c ? rCtrl(item) : ''}
    </div>`;
  });
  h += '<div class="h-4"></div></div>';
  w.innerHTML = h;
}

function rCtrl(item) {
  const c = cart[item.id];
  let h = `<div class="border-t border-gray-100 mt-3 pt-3">
    <div class="qty-wrap">
      <button class="qty-btn qty-m" onclick="chgQ(${item.id},-1)">−</button>
      <span class="qty-n">${c.qty}</span>
      <button class="qty-btn qty-p" onclick="chgQ(${item.id},1)">+</button>
      <button onclick="openEdit(${item.id})" style="background:#EFF6FF;border:none;border-radius:8px;padding:6px 10px;font-size:12px;color:#2563EB;font-weight:600;cursor:pointer">✏️ Personalizar</button>
    </div>`;
  if (c.rm && c.rm.length) h += `<p class="text-xs text-red-500 mt-2">Sem: ${c.rm.join(', ')}</p>`;
  if (c.obs) h += `<p class="text-xs text-blue-500 mt-1">📝 ${c.obs}</p>`;
  if (item.bev) {
    h += `<div class="mt-2.5">
      <p class="text-xs font-semibold text-gray-500 mb-1.5">Quando servir?</p>
      <div class="ws-wrap">
        <button class="ws-btn ws-agora${c.when==='agora'?' sel':''}" onclick="setW(${item.id},'agora')">🥤 Agora</button>
        <button class="ws-btn ws-junto${c.when==='junto'?' sel':''}" onclick="setW(${item.id},'junto')">⏳ Com a comida</button>
      </div>
    </div>`;
  }
  h += '</div>';
  return h;
}

function addC(id) {
  const item = fi(id);
  cart[id] = { qty: 1, rm: [], obs: '', when: item.bev ? null : undefined };
  updCF(); rMenu();
}
function rmC(id) { delete cart[id]; updCF(); rMenu(); }
function chgQ(id, d) {
  if (!cart[id]) return;
  cart[id].qty += d;
  if (cart[id].qty <= 0) delete cart[id];
  updCF(); rMenu();
}
function setW(id, v) { if (cart[id]) cart[id].when = v; rMenu(); updCF(); }

function updCF() {
  const ks = Object.keys(cart);
  const tot = ks.reduce((s, id) => s + cart[id].qty * fi(id).price, 0);
  const qty = ks.reduce((s, id) => s + cart[id].qty, 0);
  const f = el('cart-footer');
  f.classList.toggle('hidden', ks.length === 0);
  el('cf-q').textContent = qty + ' item' + (qty !== 1 ? 's' : '');
  el('cf-t').textContent = fmt(tot);
}

function rHist() {
  const mine = orders.filter(o => o.mesa === mesa);
  const a = el('hist-area');
  a.classList.toggle('hidden', mine.length === 0);
  el('hist-list').innerHTML = mine.map(o => `
    <div class="bg-gray-50 rounded-xl px-3 py-2.5 mb-2 flex justify-between items-center">
      <div><p class="text-sm font-semibold">Pedido #${o.id} · ${o.items.length} iten(s)</p><p class="text-xs text-gray-400 mt-0.5">${stLbl(o.status)}</p></div>
      <span class="text-xs text-gray-400">${o.time}</span>
    </div>`).join('');
}

function stLbl(s) {
  return { preparo: '🔥 Em preparo', preparando: '🔥 Em preparo', pronto: '✅ Pronto! Aguarde o garçom', entregue: '🍽️ Entregue', pago: '💳 Pago' }[s] || s;
}

// ═══════════════════════════════════════════════
// EDIT MODAL (PERSONALIZAÇÃO)
// ═══════════════════════════════════════════════
function openEdit(id) {
  editId = id;
  const item = fi(id);
  editRm = [...(cart[id]?.rm || [])];
  el('edit-name').textContent = item.name;
  el('edit-obs').value = cart[id]?.obs || '';
  if (item.ing && item.ing.length) {
    el('edit-ings').innerHTML = item.ing.map(g =>
      `<div class="chip${editRm.includes(g) ? ' rm' : ''}" onclick="togIng('${g}')">${g}</div>`
    ).join('');
  } else {
    el('edit-ings').innerHTML = '<p class="text-xs text-gray-400">Sem ingredientes configuráveis</p>';
  }
  om('m-edit');
}

function togIng(g) {
  const i = editRm.indexOf(g);
  if (i > -1) editRm.splice(i, 1); else editRm.push(g);
  document.querySelectorAll('#edit-ings .chip').forEach(ch => ch.classList.toggle('rm', editRm.includes(ch.textContent)));
}

function saveEdit() {
  if (cart[editId]) {
    cart[editId].rm = [...editRm];
    cart[editId].obs = el('edit-obs').value.trim();
  }
  cm('m-edit');
  rMenu();
}

// ═══════════════════════════════════════════════
// CHECKOUT
// ═══════════════════════════════════════════════
function openChk() {
  selPayClient = null;
  el('pix-box').classList.add('hidden');
  document.querySelectorAll('.pay-opt').forEach(b => b.classList.remove('selected'));
  el('btn-conf').disabled = true;
  el('btn-conf').classList.add('opacity-50');
  rChk();
  go('chk');
}

function rChk() {
  const ks = Object.keys(cart);
  let tot = 0, h = '';
  ks.forEach(id => {
    const c = cart[id], item = fi(id), sub = item.price * c.qty;
    tot += sub;
    h += `<div class="flex justify-between items-start py-2.5 border-t border-gray-100">
      <div class="flex-1 pr-3">
        <p class="text-sm font-semibold">${item.name} ×${c.qty}</p>
        ${c.rm?.length ? `<p class="text-xs text-red-400 mt-0.5">Sem: ${c.rm.join(', ')}</p>` : ''}
        ${c.obs ? `<p class="text-xs text-blue-400 mt-0.5">📝 ${c.obs}</p>` : ''}
        ${item.bev && c.when ? `<p class="text-xs text-blue-400 mt-0.5">${c.when === 'agora' ? '🥤 Servir agora' : '⏳ Com a comida'}</p>` : ''}
      </div>
      <span class="text-sm font-bold text-orange-600 shrink-0" style="color:#E8430A">${fmt(sub)}</span>
    </div>`;
  });
  el('chk-items').innerHTML = h;
  el('chk-total').textContent = fmt(tot);
  genPixQR(tot);
}

function selPay(t) {
  selPayClient = t;
  document.querySelectorAll('.pay-opt').forEach(b => b.classList.remove('selected'));
  el('pay-' + t).classList.add('selected');
  el('pix-box').classList.toggle('hidden', t !== 'pix');
  checkBevWarn();
}

function checkBevWarn() {
  const noW = Object.keys(cart).filter(id => fi(id)?.bev && !cart[id].when);
  el('bev-warn').classList.toggle('hidden', noW.length === 0);
  const ok = selPayClient && noW.length === 0;
  el('btn-conf').disabled = !ok;
  el('btn-conf').classList.toggle('opacity-50', !ok);
}

function genPixQR(valor) {
  const size = 160;
  const svg = `<svg viewBox="0 0 ${size} ${size}" class="pix-qr-svg" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="white" rx="8"/>
    <rect x="10" y="10" width="40" height="40" fill="none" stroke="#111" stroke-width="4" rx="4"/>
    <rect x="18" y="18" width="24" height="24" fill="#111" rx="2"/>
    <rect x="110" y="10" width="40" height="40" fill="none" stroke="#111" stroke-width="4" rx="4"/>
    <rect x="118" y="18" width="24" height="24" fill="#111" rx="2"/>
    <rect x="10" y="110" width="40" height="40" fill="none" stroke="#111" stroke-width="4" rx="4"/>
    <rect x="18" y="118" width="24" height="24" fill="#111" rx="2"/>
    ${genQRPattern(size)}
    <rect x="65" y="65" width="30" height="30" fill="white" rx="4"/>
    <text x="80" y="83" text-anchor="middle" font-size="18" font-weight="bold" fill="#00B5CD">P</text>
  </svg>`;
  el('pix-val').textContent = fmt(valor);
  el('pix-qr-svg').innerHTML = svg;
}

function genQRPattern(size) {
  const cells = [];
  const seed = [
    [1,0,1,1,0,1,0,1,1,0],[0,1,1,0,1,0,1,1,0,1],[1,1,0,1,0,1,1,0,1,0],
    [0,1,1,0,1,1,0,1,0,1],[1,0,0,1,1,0,1,0,1,1],[0,1,0,1,0,1,0,1,1,0],
    [1,0,1,0,1,1,0,1,0,1],[0,1,1,0,0,1,1,0,1,0],[1,1,0,1,1,0,0,1,0,1],[0,0,1,1,0,1,1,0,1,1]
  ];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (seed[r][c] && !((r < 4 && c < 4) || (r < 4 && c > 5) || (r > 5 && c < 4))) {
        cells.push(`<rect x="${58 + c * 5}" y="${58 + r * 5}" width="4" height="4" fill="#111"/>`);
      }
    }
  }
  return cells.join('');
}

function confirmar() {
  const ks = Object.keys(cart);
  if (!ks.length) return;
  oc++;
  const t = now_time();
  const items = ks.map(id => ({ ...fi(id), qty: cart[id].qty, rm: [...(cart[id].rm || [])], obs: cart[id].obs || '', when: cart[id].when }));
  const tot = items.reduce((s, i) => s + i.price * i.qty, 0);
  const o = {
    id: oc, mesa, items, total: tot,
    status: 'preparo', pay: selPayClient,
    time: t, ts: Date.now(),
    paid: selPayClient === 'pix',
    date: today_str()
  };
  orders.push(o);
  cart = {};
  updCF();
  rHist();
  toast('✅ Pedido #' + oc + ' enviado!');
  go('cliente');
  rMenu();
}

// ═══════════════════════════════════════════════
// COZINHA
// ═══════════════════════════════════════════════
function rCoz() {
  const active = orders.filter(o => o.status === 'preparo' || o.status === 'preparando');
  const food = active.map(o => ({ ...o, items: o.items.filter(i => !i.bev) })).filter(o => o.items.length > 0);
  el('coz-count').textContent = food.length + ' ativo(s)';
  el('coz-empty').classList.toggle('hidden', food.length > 0);
  const g = el('coz-grid');
  g.style.display = food.length === 0 ? 'none' : 'grid';

  g.innerHTML = food.map(o => {
    const secs = Math.floor((Date.now() - o.ts) / 1000);
    const mins = Math.floor(secs / 60), ss = secs % 60;
    const tc = mins < 5 ? 'timer-ok' : mins < 15 ? 'timer-warn' : 'timer-crit';
    const isPrep = o.status === 'preparando';
    const prog = isPrep && o.prepTs ? Math.min(100, Math.floor((Date.now() - o.prepTs) / 600)) : 0;

    return `<div class="k-card" onclick="openCozDetail(${o.id})">
      <div class="p-3 pb-2">
        <div class="flex justify-between items-start mb-1">
          <div><p class="text-base font-black">${o.mesa}</p><p class="text-xs text-gray-400">${o.time}</p></div>
          <div class="timer-badge ${tc}">⏱ ${mins}:${ss.toString().padStart(2,'0')}</div>
        </div>
        <div class="mt-2">
          ${o.items.slice(0, 3).map((item, idx) => `
            <div class="k-item" id="ki-${o.id}-${idx}">
              <input type="checkbox" onchange="chkItem(${o.id},${idx},this)" onclick="event.stopPropagation()">
              <div><div>${item.qty}x ${item.name}</div></div>
            </div>`).join('')}
        </div>
        ${isPrep ? `<div class="prog-bar-wrap mt-2"><div class="prog-bar" style="width:${prog}%"></div></div>` : ''}
      </div>
      <div class="px-3 pb-3">
        ${!isPrep
          ? `<button class="btn-primary w-full text-xs py-2.5" onclick="event.stopPropagation();iniciarPreparo(${o.id})">▷ Iniciar</button>`
          : `<button class="btn-green w-full text-xs py-2.5" onclick="event.stopPropagation();mkProntoId(${o.id})">✅ Pronto</button>`
        }
      </div>
    </div>`;
  }).join('');
}

function chkItem(oid, idx, ev) {
  document.getElementById(`ki-${oid}-${idx}`)?.classList.toggle('done', ev.checked);
}

function iniciarPreparo(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  o.status = 'preparando';
  o.prepTs = Date.now();
  rCoz();
}

function mkProntoId(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  o.status = 'pronto';
  rCoz(); rGar();
  toast('✅ Pedido pronto!');
}

function openCozDetail(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  cozDetOrd = id;
  om('m-coz-detail');
}

function mkPronto() {
  if (!cozDetOrd) return;
  mkProntoId(cozDetOrd);
  cm('m-coz-detail');
}

// ═══════════════════════════════════════════════
// GARÇOM
// ═══════════════════════════════════════════════
function mkBevEntregue(oid, itemIdx) {
  const o = orders.find(x => x.id === oid);
  if (!o) return;
  const itm = o.items[itemIdx];
  if (itm) itm.bevEntregue = true;
  rGar();
}

function rGar() {
  const bevs = orders.filter(o => o.status === 'preparo' || o.status === 'preparando')
    .flatMap(o => o.items
      .filter((i, idx) => i.bev && i.when === 'agora' && !i.bevEntregue)
      .map((i) => {
        const realIdx = o.items.indexOf(i);
        return { mesa: o.mesa, item: i, oid: o.id, idx: realIdx };
      }));

  const prontos = orders.filter(o => o.status === 'pronto');

  el('bev-cnt').textContent = bevs.length;
  el('prn-cnt').textContent = prontos.length;

  el('bev-list').innerHTML = bevs.map(b => `
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2 flex justify-between items-center">
      <div>
        <p class="text-sm font-bold">Mesa ${b.mesa}</p>
        <p class="text-xs font-semibold text-blue-600">${b.item.qty}x ${b.item.name}</p>
        ${b.item.obs ? `<p class="text-[10px] text-gray-500 italic">Obs: ${b.item.obs}</p>` : ''}
      </div>
      <button onclick="mkBevEntregue(${b.oid},${b.idx})" class="btn-green text-xs py-1 px-3">✓ Entregue</button>
    </div>`).join('');

  el('prn-list').innerHTML = prontos.map(o => `
    <div class="bg-white rounded-xl shadow-sm p-4 mb-3">
      <div class="flex justify-between items-start mb-2">
        <div>
          <p class="text-base font-black">Mesa ${o.mesa}</p>
          <p class="text-xs text-gray-400">Pedido #${o.id}</p>
        </div>
        <span class="font-bold text-orange">${fmt(o.total)}</span>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 mb-3">
        ${o.items.filter(i => !i.bev || (i.bev && i.when === 'junto')).map(i => `
          <div class="flex justify-between text-xs py-0.5">
            <span class="font-medium">${i.qty}x ${i.name}</span>
            ${i.rm?.length ? `<span class="text-red-400 text-[10px]">Sem: ${i.rm.join(',')}</span>` : ''}
          </div>
          ${i.obs ? `<p class="text-[10px] text-blue-500 mb-1">📝 ${i.obs}</p>` : ''}
        `).join('')}
      </div>
      <button onclick="mkEnt(${o.id})" class="btn-green w-full text-sm py-2.5">✅ Entregar Pedido</button>
    </div>`).join('');
}

function mkEnt(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  o.status = 'entregue';
  rGar(); rCx();
  toast('🍽️ Entregue!');
}

// ═══════════════════════════════════════════════
// CAIXA (SISTEMA CONSOLIDADO POR MESA)
// ═══════════════════════════════════════════════
function rCx() {
  const todasMesasPendentes = [...new Set(orders.filter(o => !o.paid).map(o => o.mesa))];
  
  el('pend-cnt').textContent = todasMesasPendentes.length;
  el('pend-list').innerHTML = todasMesasPendentes.length === 0
    ? '<div class="empty-state text-sm"><p>Tudo pago!</p></div>'
    : todasMesasPendentes.map(m => {
        const pedsDessaMesa = orders.filter(o => o.mesa == m && !o.paid);
        const totalMesa = pedsDessaMesa.reduce((s, o) => s + o.total, 0);
        return `<div class="bg-white rounded-xl shadow-sm p-3 mb-2 cursor-pointer" onclick="openCxConsolidado('${m}')">
          <p class="font-bold text-sm">Mesa ${m}</p>
          <p class="text-xs text-gray-400">${pedsDessaMesa.length} pedido(s) em aberto</p>
          <p class="font-black mt-1 text-orange">${fmt(totalMesa)}</p>
        </div>`;
      }).join('');
}

function buscarCx() {
  const n = el('cx-in').value;
  if (!n) { toast('Digite a mesa'); return; }
  
  const pedsMesa = orders.filter(o => o.mesa == n && !o.paid);
  const area = el('cx-area');

  if (!pedsMesa.length) {
    area.innerHTML = '<div class="empty-state text-sm"><p>Nenhum débito</p></div>';
    return;
  }

  const todosItens = pedsMesa.flatMap(o => o.items);
  const totalGeral = pedsMesa.reduce((s, o) => s + o.total, 0);

  area.innerHTML = `<div class="bg-white rounded-xl shadow-sm p-3">
    <p class="font-bold mb-2">Mesa ${n} (Total Consolidado)</p>
    ${todosItens.map(i => `<div class="flex justify-between text-xs py-1 border-t border-gray-100"><span>${i.qty}x ${i.name}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
    <div class="flex justify-between font-black text-sm py-2 border-t-2 border-gray-800 mt-1"><span>Total</span><span class="text-orange">${fmt(totalGeral)}</span></div>
    <button onclick="openCxConsolidado('${n}')" class="btn-primary w-full text-sm mt-3 py-2.5">💳 Pagar Conta</button>
  </div>`;
}

function openCxConsolidado(nMesa) {
  const pedsMesa = orders.filter(o => o.mesa == nMesa && !o.paid);
  if (!pedsMesa.length) return;

  mesaPagamentoAtual = nMesa;
  cxPaySel = null;
  const totalGeral = pedsMesa.reduce((s, o) => s + o.total, 0);
  const todosItens = pedsMesa.flatMap(o => o.items);

  el('m-cx-title').textContent = 'Mesa ' + nMesa;
  el('m-cx-sub').textContent = 'Fechamento de todos os pedidos';
  el('m-cx-items').innerHTML = todosItens.map(i => `<div class="flex justify-between text-sm py-1"><span>${i.qty}x ${i.name}</span><span>${fmt(i.price*i.qty)}</span></div>`).join('');
  el('m-cx-total').textContent = fmt(totalGeral);
  
  document.querySelectorAll('#m-cx .pay-opt').forEach(b => b.classList.remove('selected'));
  el('troco-area').classList.add('hidden');
  el('btn-baixa').disabled = true;
  el('btn-baixa').setAttribute('onclick', 'darBaixaGeral()');
  
  om('m-cx');
}

function selCxPay(t) {
  cxPaySel = t;
  document.querySelectorAll('#m-cx .pay-opt').forEach(b => b.classList.remove('selected'));
  el('cpay-' + t).classList.add('selected');
  el('troco-area').classList.toggle('hidden', t !== 'dinheiro');
  el('btn-baixa').disabled = false;
  el('btn-baixa').classList.remove('opacity-50');
}

function darBaixaGeral() {
  if (!mesaPagamentoAtual || !cxPaySel) return;
  orders.forEach(o => {
    if (o.mesa == mesaPagamentoAtual && !o.paid) {
      o.paid = true;
      o.status = 'pago';
      o.payFinal = cxPaySel;
    }
  });
  cm('m-cx');
  rCx(); rGar();
  el('cx-area').innerHTML = '';
  toast('💳 Mesa ' + mesaPagamentoAtual + ' paga!');
  mesaPagamentoAtual = null;
}

// ═══════════════════════════════════════════════
// RELATÓRIOS E DOWNLOAD PDF
// ═══════════════════════════════════════════════
function setPeriod(p, elBtn) {
  periodCur = p;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  elBtn.classList.add('active');
  rRel();
}

function rRel() {
  const filtered = orders.filter(o => o.paid || o.status === 'pago');
  const fat = filtered.reduce((s, o) => s + o.total, 0);
  const pedCount = filtered.length;
  
  el('r-fat').textContent = 'R$' + fat.toFixed(0);
  el('r-ped').textContent = pedCount;
  el('r-tkt').textContent = pedCount > 0 ? 'R$' + (fat / pedCount).toFixed(0) : 'R$0';

  // Gerar Gráfico de Horas Simples
  const hrs = {};
  filtered.forEach(o => { const h = o.time?.split(':')[0] + 'h'; hrs[h] = (hrs[h] || 0) + o.total; });
  const mx = Math.max(...Object.values(hrs), 1);
  el('chart-h').innerHTML = Object.entries(hrs).sort().map(([h, v]) => `
    <div class="bar-col">
      <div class="bar-fill" style="height:${Math.round(v/mx*56)+4}px"></div>
      <div class="bar-lbl">${h}</div>
    </div>`).join('');
}

function downloadRelatorio() {
  const filtered = orders.filter(o => o.paid || o.status === 'pago');
  const fat = filtered.reduce((s,o) => s+o.total, 0);
  
  const html = `<html><head><title>Relatorio</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style></head>
  <body><h1>Relatório de Vendas</h1><p>Faturamento Total: ${fmt(fat)}</p>
  <table><tr><th>Mesa</th><th>Hora</th><th>Total</th></tr>
  ${filtered.map(o => `<tr><td>${o.mesa}</td><td>${o.time}</td><td>${fmt(o.total)}</td></tr>`).join('')}
  </table></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `relatorio-${today_str()}.html`;
  a.click();
}

// ═══════════════════════════════════════════════
// REFRESH E DEMO
// ═══════════════════════════════════════════════
function startTick() {
  if (tickInterval) return;
  tickInterval = setInterval(() => {
    if (el('s-coz').classList.contains('active')) rCoz();
    if (el('s-gar').classList.contains('active')) rGar();
  }, 5000);
}