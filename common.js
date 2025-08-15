
// ======== AUTH & ROLES =========
const getRole = () => localStorage.getItem('role') || 'buyer';
const setRole = (r) => localStorage.setItem('role', r);
const isSeller = () => getRole() === 'seller';
const isAdmin  = () => getRole() === 'admin';
const isLoggedIn = () => localStorage.getItem('loggedIn') === 'true';
const setLoggedIn = (v) => localStorage.setItem('loggedIn', v ? 'true' : 'false');

// Single login: admin/admin -> admin; vendedor/vendedor -> seller; anything else -> buyer
function tryLogin(user, pass){
  const u = (user||'').trim().toLowerCase();
  const p = (pass||'').trim().toLowerCase();
  if (u==='admin' && p==='admin'){ setLoggedIn(true); setRole('admin'); return 'admin'; }
  if (u==='vendedor' && p==='vendedor'){ setLoggedIn(true); setRole('seller'); return 'seller'; }
  setLoggedIn(true); setRole('buyer'); return 'buyer';
}

function refreshLoginNav(){
  const el = document.getElementById('loginNav');
  if (!el) return;
  if (isAdmin() && isLoggedIn()) el.textContent = 'Panel admin (Salir)';
  else if (isSeller() && isLoggedIn()) el.textContent = 'Panel vendedor (Salir)';
  else el.textContent = isLoggedIn() ? 'Mi cuenta (Salir)' : 'Iniciar sesión';
}

function toggleLoginFromNav(e){
  e.preventDefault();
  if(isLoggedIn()){
    setLoggedIn(false);
    setRole('buyer');
    refreshLoginNav();
    alert('Sesión cerrada.');
  }else{
    new bootstrap.Modal(document.getElementById('loginModal')).show();
  }
}

function doUnifiedLogin(){
  const u = document.getElementById('loginUser').value;
  const p = document.getElementById('loginPass').value;
  const role = tryLogin(u,p);
  refreshLoginNav();
  bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
  if (role==='seller' || role==='admin'){ window.location.href = 'admin.html'; }
  else { alert('Inicio de sesión (comprador).'); }
}

// ======== ITEMS (base + custom) =========
function getCustomItems(){ try { return JSON.parse(localStorage.getItem('customItems')||'[]'); } catch(e){ return []; } }
function saveCustomItems(list){ localStorage.setItem('customItems', JSON.stringify(list)); }
function allItems(BASE){ 
  // merge base with custom (custom at start)
  return [...getCustomItems(), ...BASE];
}

// ======== STOCK =========
function getStock(){ try { return JSON.parse(localStorage.getItem('stock')||'{}'); } catch(e){ return {}; } }
function saveStock(s){ localStorage.setItem('stock', JSON.stringify(s)); }
function ensureStockInitialized(items){
  const s = getStock();
  let changed = false;
  items.forEach(it => {
    const key = it.name;
    if (s[key] == null){
      // aleatorio 5-30
      s[key] = Math.floor(Math.random()*26)+5;
      changed = true;
    }
  });
  if (changed) saveStock(s);
  return s;
}
function adjustStock(items){
  const s = getStock();
  let changed = false;
  items.forEach(it => {
    const key = it.name;
    if (s[key] == null) s[key] = 0;
    s[key] = Math.max(0, s[key] - (it.qty||0));
    changed = true;
  });
  if (changed) saveStock(s);
}

// ======== CARRITO =========
function getCart(){
  try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch(e){ return []; }
}
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(item){
  const cart = getCart();
  const idx = cart.findIndex(i => i.sku === item.sku && (i.talla||'—') === (item.talla||'—'));
  if (idx >= 0) { cart[idx].qty += item.qty; }
  else { cart.push(item); }
  saveCart(cart);
  updateCartBadge();
  if (typeof renderCartPreview === 'function') renderCartPreview();
}
function removeFromCart(sku){
  const cart = getCart().filter(i => i.sku !== sku);
  saveCart(cart);
  updateCartBadge();
  if (typeof renderCartPreview === 'function') renderCartPreview();
  if (typeof renderCart === 'function') renderCart();
}
function clearCart(){
  saveCart([]);
  updateCartBadge();
  if (typeof renderCartPreview === 'function') renderCartPreview();
  if (typeof renderCart === 'function') renderCart();
}
function cartCount(){ return getCart().reduce((n,i)=>n+i.qty,0); }
function cartTotal(){ return getCart().reduce((s,i)=>s+i.price*i.qty,0); }
function updateCartBadge(){
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const n = cartCount();
  badge.textContent = n;
  badge.style.display = n > 0 ? 'inline-block' : 'none';
}
function formatPrice(n){ return '$' + n.toLocaleString('es-CO'); }

// ======== PEDIDOS & RESERVAS =========
function getOrders(){ try { return JSON.parse(localStorage.getItem('orders')||'[]'); } catch(e){ return []; } }
function saveOrders(list){ localStorage.setItem('orders', JSON.stringify(list)); }
function placeOrder(customer={}){
  const cart = getCart();
  if (!cart.length) return null;
  const id = 'ORD-' + Date.now();
  const order = { id, date: new Date().toISOString(), items: cart, total: cartTotal(), status: 'pendiente', customer };
  const list = getOrders();
  list.unshift(order);
  saveOrders(list);
  // ajustar stock
  adjustStock(cart);
  clearCart();
  return order;
}

function getReservations(){ try { return JSON.parse(localStorage.getItem('reservations')||'[]'); } catch(e){ return []; } }
function saveReservations(list){ localStorage.setItem('reservations', JSON.stringify(list)); }
function addReservation(data){
  const id = 'RES-' + Date.now();
  const res = { id, date: new Date().toISOString(), ...data, status: 'pendiente' };
  const list = getReservations();
  list.unshift(res);
  saveReservations(list);
  return res;
}

// ======== INVENTARIO (overrides, visibility) =========
function getOverrides(){ try { return JSON.parse(localStorage.getItem('overrides')||'{}'); } catch(e){ return {}; } }
function saveOverrides(o){ localStorage.setItem('overrides', JSON.stringify(o)); }
function getVisibility(){ try { return JSON.parse(localStorage.getItem('visibility')||'{}'); } catch(e){ return {}; } }
function saveVisibility(v){ localStorage.setItem('visibility', JSON.stringify(v)); }

function applyItemTransforms(items){
  const ov = getOverrides();
  const vis = getVisibility();
  const withVis = items.filter(it => vis[it.name] !== false).map(it => {
    const merged = {...it};
    if (ov[it.name] && typeof ov[it.name].price === 'number'){
      merged.price = ov[it.name].price;
    }
    return merged;
  });
  // Ensure stock initialized
  ensureStockInitialized(withVis);
  return withVis;
}
