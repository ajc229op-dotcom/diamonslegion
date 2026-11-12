const IMG = { banner: 'banner.svg', juego: '', diamante: '' };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let isAdmin = false;

// ===== TEMA DORADO =====
const goldCss = document.createElement('style');
goldCss.textContent = `
:root{--primary-neon:#ffc531;--accent-neon:#b8860b;--border-color:#5c4514;--bg-main:#0a0803;--bg-card:#15100a;--text-muted:#d9c98f;--neon-glow:0 0 20px rgba(255,197,49,.4);--neon-glow-strong:0 0 35px rgba(255,197,49,.7)}
html,body{background-image:radial-gradient(circle at 50% 15%,rgba(255,197,49,.12),transparent 60%),radial-gradient(circle at 85% 85%,rgba(184,134,11,.15),transparent 50%)!important}
.btn-main,.pay-tab-btn.active{background:linear-gradient(135deg,#ffd76a,#b8860b)!important;color:#1a1204!important}
.auth-tab.active,.game-banner-btn{color:#1a1204!important}
.form-control,.wallet-address-box,.auth-tabs,.ticket-steps-bar,.admin-req-card,.user-data-card,.wallet-pill-top,.diamond-price-badge,.pay-tab-btn,.top-recharge-showcase{background:#0d0a04!important}
.diamond-card,.pk,.ticket-receipt-card{background:linear-gradient(145deg,#1b150a,#0d0a04)!important}
.pk.selected,.pk:hover,.diamond-card.selected,.diamond-card:hover{background:#2b2110!important}
svg path[fill="#00f7ff"]{fill:#ffc531}
.section-title,.brand-header h1,.nav-brand-title,.ticket-title-group h4,.diamond-card-content h4{text-shadow:0 0 12px rgba(255,197,49,.6)!important}
.section-title{text-shadow:0 0 14px rgba(255,197,49,.85),0 3px 6px #000!important;font-size:.95rem!important}
.form-group label,.ticket-row-line span:first-child{color:#f0e2b0!important;text-shadow:0 1px 4px #000}
.ticket-row-line span:last-child{text-shadow:0 2px 6px #000}
.wallet-box-detail,.ticket-receipt-card,.diamond-card,.pk,.wallet-card-option,.admin-req-card,.user-data-card,.auth-container{box-shadow:0 10px 26px rgba(0,0,0,.9),0 0 18px rgba(255,197,49,.28)!important}
#notification-toast{background:#1b140a!important;box-shadow:0 10px 30px rgba(0,0,0,.95),0 0 26px rgba(255,197,49,.65)!important}`;
document.head.appendChild(goldCss);

const MINI_LOGO = (s, x = '') => `<svg viewBox="0 0 100 100" width="${s}" height="${s}" style="flex:none;filter:drop-shadow(0 0 6px rgba(255,197,49,.7));${x}"><circle cx="50" cy="50" r="46" fill="#0b0703" stroke="#ffc531" stroke-width="5"/><circle cx="50" cy="50" r="38" fill="none" stroke="#8f5f06" stroke-width="2"/><path d="M33 34L30 19L40 27L45 15L50 10L55 15L60 27L70 19L67 34Z" fill="#ffd35a" stroke="#8f5f06" stroke-width="1.5" stroke-linejoin="round"/><g stroke="#fff3b0" stroke-width="1" stroke-linejoin="round" transform="translate(27 37) scale(.46)"><polygon points="20,0 80,0 70,30 30,30" fill="#fff8d6"/><polygon points="0,30 20,0 30,30" fill="#ffe08a"/><polygon points="100,30 80,0 70,30" fill="#ffd45c"/><polygon points="0,30 30,30 50,90" fill="#e0a21a"/><polygon points="30,30 70,30 50,90" fill="#ffc531"/><polygon points="70,30 100,30 50,90" fill="#a8740a"/></g></svg>`;
document.querySelectorAll('.nav-brand-title svg').forEach(e => e.outerHTML = MINI_LOGO(36));
document.querySelectorAll('.brand-header svg').forEach(e => e.outerHTML = MINI_LOGO(84, 'margin-bottom:8px'));

// ===== PERFIL (seccion + boton) =====
(function () {
  const sec = document.createElement('div');
  sec.id = 'sec-perfil'; sec.className = 'vista-sec hidden';
  sec.innerHTML = '<div class="section-title">MI PERFIL</div><div class="wallet-box-detail" id="perfil-box">Cargando...</div>';
  document.querySelector('#main-app .container').appendChild(sec);
  const nb = document.createElement('button');
  nb.className = 'nav-item-btn';
  nb.onclick = () => switchMainTab('perfil');
  nb.innerHTML = '<i class="fa-solid fa-user"></i> Perfil';
  document.querySelector('.app-bottom-nav').appendChild(nb);
})();

const _sm = switchMainTab;
switchMainTab = function (s) { _sm(s); if (s === 'perfil') loadProfile(); };

const AVATARS = ['👑', '💎', '🔥', '🐉', '🦅', '🐺', '⚡', '🎮'];
function setAvatar(a) {
  localStorage.setItem('dl_av_' + currentUser, a);
  document.getElementById('avatar-big').textContent = a || currentUser.charAt(0).toUpperCase();
}
function copyRef(l) { navigator.clipboard.writeText(l).then(() => showNotification('¡Link copiado!')); }

async function loadProfile() {
  const b = document.getElementById('perfil-box');
  try {
    const d = await api('/api/profile');
    if (!d.success) { b.textContent = d.message || 'Error'; return; }
    const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(d.username);
    const f = t => t ? new Date(t).toLocaleDateString('es') : '—';
    const av = localStorage.getItem('dl_av_' + d.username) || '';
    const btn = 'width:42px;height:42px;border-radius:50%;border:2px solid var(--primary-neon);background:#0d0a04;color:#ffd35a;font-size:20px;font-weight:900;box-shadow:0 4px 10px rgba(0,0,0,.8)';
    const avatarHtml = `<div style="text-align:center;margin-bottom:1rem">
      <div id="avatar-big" style="width:96px;height:96px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:46px;font-weight:900;color:#1a1204;background:linear-gradient(135deg,#ffd76a,#b8860b);border:3px solid #fff3b0;box-shadow:0 0 25px rgba(255,197,49,.7),0 6px 16px rgba(0,0,0,.8)">${av || esc(d.username.charAt(0).toUpperCase())}</div>
      <div style="font-weight:900;font-size:1.15rem;margin-top:10px;text-shadow:0 2px 6px #000">${esc(d.username)}</div>
      <div style="font-size:.72rem;color:var(--text-muted);margin:4px 0 8px">Elige tu avatar</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${AVATARS.map(e => `<button style="${btn}" onclick="setAvatar('${e}')">${e}</button>`).join('')}<button style="${btn}" onclick="setAvatar('')">Aa</button></div>
    </div>`;
    b.innerHTML = avatarHtml + `
      <div class="ticket-details-body">
        <div class="ticket-row-line"><span>Usuario</span><span>${esc(d.username)}</span></div>
        <div class="ticket-row-line"><span>Correo</span><span>${esc(d.email)}</span></div>
        <div class="ticket-row-line"><span>Miembro desde</span><span>${f(d.created)}</span></div>
        <div class="ticket-row-line"><span>Saldo móvil</span><span>${Math.round(d.balance)}</span></div>
        <div class="ticket-row-line"><span>USDT</span><span>$${d.usdt.toFixed(2)}</span></div>
        <div class="ticket-row-line"><span>Compras</span><span>${d.purchases}</span></div>
        ${d.referredBy ? `<div class="ticket-row-line"><span>Invitado por</span><span>${esc(d.referredBy)}</span></div>` : ''}
      </div>
      <div class="section-title" style="margin-top:1.2rem">INVITA Y GANA</div>
      <p style="font-size:.75rem;color:var(--text-muted);text-align:center">Ganas 4% de cada depósito que hagan tus invitados (en USDT o en saldo, según lo que depositen).</p>
      <div class="wallet-address-box" style="font-size:.7rem">${esc(link)}</div>
      <button class="btn-main" onclick="copyRef('${link}')"><i class="fa-regular fa-copy"></i> Copiar mi link</button>
      <div class="ticket-details-body" style="margin-top:1rem">
        <div class="ticket-row-line"><span>Invitados</span><span>${d.referrals}</span></div>
        <div class="ticket-row-line"><span>Ganado por referidos</span><span>$${d.refEarned.toFixed(2)} USDT · ${Math.round(d.refSaldo || 0)} saldo</span></div>
      </div>`;
  } catch { b.textContent = 'Error de red.'; }
}

function applyImages() {
  const bg = (sel, u) => u && document.querySelectorAll(sel).forEach(e =>
    e.style.backgroundImage = `linear-gradient(180deg,rgba(0,0,0,0) 78%,rgba(0,0,0,.6) 100%),url('${u}')`);
  bg('.store-banner-img', IMG.banner);
  bg('.game-banner-card', IMG.juego);
  if (IMG.diamante) document.querySelectorAll('.diamond-card-content').forEach(c => {
    const i = new Image(); i.src = IMG.diamante; i.alt = '';
    i.style.cssText = 'width:56px;height:56px;object-fit:contain'; c.prepend(i);
  });
}

async function api(path, body) {
  const t = localStorage.getItem('dl_token');
  const r = await fetch(API_BASE + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 401 && t) logoutUser();
  return r.json();
}

async function enter(d, saludo) {
  currentUser = d.username;
  localStorage.setItem('dl_logged_user', d.username);
  localStorage.setItem('dl_token', d.token);
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  await loadUserDataFromCloud(); checkAdminRights(); loadOrdersFromCloud();
  if (saludo) showNotification(saludo + d.username + '!');
}

window.onload = async function () {
  applyImages();
  const m = document.getElementById('usdt-monto-input');
  if (m) {
    m.placeholder = 'Monto que enviaste, ej. 10.00';
    const l = m.closest('.form-group').querySelector('label');
    if (l) l.textContent = 'MONTO ENVIADO (USDT)';
  }
  const ref = new URLSearchParams(location.search).get('ref');
  if (ref) { localStorage.setItem('dl_ref', ref); switchAuthTab('register'); }
  const u = localStorage.getItem('dl_logged_user'), t = localStorage.getItem('dl_token');
  if (u && t) await enter({ username: u, token: t });
};

function checkAdminRights() {
  document.getElementById('admin-panel-container').classList.toggle('hidden', !isAdmin);
}
function logoutUser() {
  localStorage.removeItem('dl_logged_user'); localStorage.removeItem('dl_token');
  currentUser = null; isAdmin = false;
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    const d = await api('/api/login', { username: document.getElementById('login-user').value.trim(), password: document.getElementById('login-pass').value });
    if (d.success) enter(d, '¡Bienvenido, '); else showNotification(d.message || 'Credenciales incorrectas.');
  } catch { showNotification('Error de conexión.'); }
}
async function handleRegister(e) {
  e.preventDefault();
  const pass = document.getElementById('reg-pass').value;
  if (pass.length < 7) { showNotification('La contraseña debe tener mínimo 7 caracteres.'); return; }
  try {
    const d = await api('/api/register', { username: document.getElementById('reg-user').value.trim(), email: document.getElementById('reg-email').value.trim(), password: pass, ref: localStorage.getItem('dl_ref') || '' });
    if (d.success) enter(d, '¡Registro exitoso, '); else showNotification(d.message || 'No se pudo registrar.');
  } catch { showNotification('Error de conexión.'); }
}

async function loadUserDataFromCloud() {
  if (!currentUser) return;
  try {
    const d = await api('/api/user');
    if (d.success) { cachedUserData = { balance: d.balance || 0, usdtBalance: d.usdtBalance || 0 }; isAdmin = !!d.isAdmin; updateUIBalances(); checkAdminRights(); }
  } catch { }
}
async function loadOrdersFromCloud() {
  if (!currentUser) return;
  try {
    const d = await api('/api/orders');
    if (!d.success) return;
    cachedOrders = (d.orders || []).map(o => ({ ...o, user: esc(o.user), type: esc(o.type), detail: esc(o.detail), playerId: esc(o.playerId) }));
    cachedAllUsers = (d.allUsers || []).map(x => ({ ...x, username: esc(x.username), email: esc(x.email), referredBy: esc(x.referredBy) }));
    renderOrders();
  } catch { }
}

// ===== PANEL ADMIN: pendientes + usuarios (con ultima actividad) =====
const _ro = renderOrders;
renderOrders = function () {
  _ro();
  if (!isAdmin) return;
  const now = Date.now();
  const ago = t => { if (!t) return 'nunca'; const m = Math.round((now - t) / 60000); return m < 1 ? 'ahora' : m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' d'; };
  const pend = cachedOrders.filter(o => o.status === 'Proceso');
  document.getElementById('admin-orders-list').innerHTML = pend.length ? pend.map(o => `
    <div class="admin-req-card" style="flex-direction:column;align-items:flex-start;gap:8px">
      <div><b>${o.user}</b> · ${o.type}</div>
      <div>${o.detail} · ID: ${o.playerId} · ${o.currency === 'usdt' ? '$' + o.amount.toFixed(2) : o.amount}</div>
      <div style="display:flex;gap:10px;width:100%">
        <button onclick="updateOrderStatus(${o.id},'Aprobado')" style="flex:1;background:#10b981;border:0;color:#fff;padding:8px;border-radius:8px;font-weight:900">Aceptar</button>
        <button onclick="updateOrderStatus(${o.id},'Rechazado')" style="flex:1;background:#ef4444;border:0;color:#fff;padding:8px;border-radius:8px;font-weight:900">Rechazar</button>
      </div></div>`).join('') : '<p style="font-size:.8rem;color:var(--text-muted)">No hay solicitudes pendientes.</p>';
  const act = cachedAllUsers.filter(x => x.lastSeen && now - x.lastSeen < 864e5).length;
  document.getElementById('admin-users-list').innerHTML =
    `<p style="font-size:.78rem;color:var(--primary-neon);font-weight:900">Total: ${cachedAllUsers.length} · Activos 24h: ${act}</p>` +
    cachedAllUsers.map(x => `
    <div class="user-data-card">
      <div><b>${x.username}</b> (${x.email})</div>
      <div>USDT: $${(x.usdtBalance || 0).toFixed(2)} · Saldo: ${Math.round(x.balance || 0)}</div>
      <div>Última vez: ${ago(x.lastSeen)} · Registro: ${x.created ? new Date(x.created).toLocaleDateString('es') : '—'}</div>
      <div>Invitados: ${x.referrals || 0}${x.referredBy ? ' · Invitado por: ' + x.referredBy : ''}</div>
    </div>`).join('');
};

async function submitSaldoDeposit() {
  const amount = parseFloat(document.getElementById('saldo-monto-input').value);
  const hash = document.getElementById('saldo-hash-input').value.trim();
  if (!amount || !hash) { showNotification('Completa todos los campos.'); return; }
  try {
    const d = await api('/api/deposit', { amount, detail: 'Conf: ' + hash });
    if (d.success) { showNotification('Depósito enviado. El admin lo aprobará pronto.'); switchMainTab('orders'); loadOrdersFromCloud(); }
    else showNotification(d.message || 'Error al registrar.');
  } catch { showNotification('Error de red.'); }
}

async function submitDeposit() {
  const hash = document.getElementById('usdt-hash-input').value.trim();
  const amount = parseFloat(document.getElementById('usdt-monto-input').value) || 0;
  if (!hash) { showNotification('Pega el hash de tu transacción.'); return; }
  showNotification('Verificando pago en la blockchain...');
  try {
    const d = await api('/api/deposit/usdt', { hash, amount });
    if (d.success) { showNotification(`¡Se acreditaron $${d.amount} USDT!`); loadUserDataFromCloud(); switchMainTab('orders'); loadOrdersFromCloud(); }
    else showNotification(d.message || 'No se pudo verificar.');
  } catch { showNotification('Error de red.'); }
}

async function updateOrderStatus(orderId, status) {
  try {
    const d = await api('/api/admin/order-status', { orderId, status });
    if (d.success) { showNotification('Actualizado a ' + status); loadOrdersFromCloud(); } else showNotification(d.message || 'Error.');
  } catch { showNotification('Error de red.'); }
}
