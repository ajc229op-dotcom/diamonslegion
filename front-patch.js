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
document.querySelectorAll('.nav-brand-title svg').forEach(e => e.outerHTML = MINI_LOGO(32));
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
      </div>
      <button class="btn-main" style="margin-top:1.2rem" onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</button>`;
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

// ===== v3: juegos, tema claro/oscuro, barras flotantes, banner USDT =====
const lightRule = (sel, decl) => sel.split(',').map(s => 'html[data-theme="light"] ' + s.trim()).join(',') + '{' + decl + '}';
goldCss.textContent += `
.nav-item-btn.active,.nav-item-btn:hover{text-shadow:0 0 12px rgba(255,197,49,.8)!important}
.wallet-pill-top,.diamond-price-badge,.game-banner-btn,.saldo-icon-box{box-shadow:0 0 12px rgba(255,197,49,.45)!important}
.store-banner-text{background:rgba(10,8,3,.88)!important}
.nav-brand-title{font-size:.72rem!important}
.navbar{top:10px!important;margin:10px 12px 0!important;border-radius:22px!important;border:2px solid var(--border-color)!important;background:rgba(21,16,10,.93)!important;backdrop-filter:blur(10px);box-shadow:0 10px 28px rgba(0,0,0,.85),0 0 20px rgba(255,197,49,.25)!important;padding:.6rem .8rem!important}
.app-bottom-nav{left:12px!important;right:12px!important;bottom:12px!important;width:auto!important;border-radius:24px!important;border:2px solid var(--border-color)!important;background:rgba(21,16,10,.93)!important;backdrop-filter:blur(10px);box-shadow:0 10px 28px rgba(0,0,0,.85),0 0 20px rgba(255,197,49,.25)!important;padding:10px 0!important}
.container{padding-bottom:120px!important}
.games-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:1.2rem}
.game-poster{aspect-ratio:1/1.15;border-radius:18px;background-size:cover;background-position:center top;border:2px solid var(--primary-neon);box-shadow:0 10px 26px rgba(0,0,0,.9),0 0 18px rgba(255,197,49,.3);position:relative;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;padding:10px;transition:.3s}
.game-poster:hover{transform:translateY(-3px)}
.game-poster-name{font-family:Orbitron,sans-serif;font-weight:900;font-size:.8rem;color:#fff;text-shadow:0 2px 8px #000}
.game-poster-btn{background:var(--primary-neon);color:#1a1204;font-weight:900;font-size:.72rem;text-align:center;padding:6px;border-radius:10px}
html[data-theme="light"]{--bg-main:#fbf6ea;--bg-card:#ffffff;--text-main:#1b1405;--text-muted:#6b5a2e;--primary-neon:#b8860b;--border-color:#e3cf8a;--neon-glow:0 4px 14px rgba(184,134,11,.25);--neon-glow-strong:0 8px 24px rgba(184,134,11,.3)}
html[data-theme="light"],html[data-theme="light"] body{background-image:radial-gradient(circle at 50% 10%,rgba(255,197,49,.25),transparent 60%)!important}
` + lightRule('body *', 'text-shadow:none!important')
  + lightRule('.form-control,.wallet-address-box,.auth-tabs,.ticket-steps-bar,.admin-req-card,.user-data-card,.wallet-pill-top,.diamond-price-badge,.pay-tab-btn,.top-recharge-showcase', 'background:#fffaf0!important')
  + lightRule('.diamond-card,.pk,.ticket-receipt-card', 'background:#fff!important')
  + lightRule('.pk.selected,.pk:hover,.diamond-card.selected,.diamond-card:hover', 'background:#fff3cf!important')
  + lightRule('.navbar,.app-bottom-nav', 'background:rgba(255,255,255,.95)!important;box-shadow:0 8px 24px rgba(120,90,10,.22)!important')
  + lightRule('.wallet-box-detail,.ticket-receipt-card,.diamond-card,.pk,.wallet-card-option,.admin-req-card,.user-data-card,.auth-container,.game-poster', 'box-shadow:0 8px 22px rgba(120,90,10,.22)!important')
  + lightRule('.ticket-row-line span:last-child,.user-data-card,.admin-panel-box,.ticket-title-group h4,.wallet-info h4,.pk b', 'color:var(--text-main)!important')
  + lightRule('.form-group label,.ticket-row-line span:first-child', 'color:#5b4a1e!important');

// --- tema claro / oscuro (cada usuario lo elige en su telefono) ---
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem('dl_theme', t);
  document.querySelectorAll('.theme-btn').forEach(b => b.innerHTML = t === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>');
}
function toggleTheme() { applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); }
(function () {
  const lo = document.querySelector('.nav-wallet-pills .wallet-pill-top[title="Salir"]');
  if (lo) { lo.classList.add('theme-btn'); lo.title = 'Tema'; lo.onclick = toggleTheme; }
  const ab = document.createElement('div');
  ab.className = 'wallet-pill-top theme-btn';
  ab.style.cssText = 'position:fixed;top:14px;right:14px;z-index:50;padding:9px 11px';
  ab.onclick = toggleTheme;
  document.getElementById('auth-screen').appendChild(ab);
  applyTheme(localStorage.getItem('dl_theme') || 'dark');
})();

// --- banner USDT ---
const usdtBanner = id => `<svg viewBox="0 0 600 170" style="width:100%;display:block;border-radius:16px;margin-bottom:12px;box-shadow:0 8px 22px rgba(0,0,0,.6)"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2bb48a"/><stop offset="1" stop-color="#0d5a45"/></linearGradient></defs><rect width="600" height="170" rx="16" fill="url(#${id})"/><circle cx="95" cy="85" r="66" fill="#fff" opacity=".12"/><circle cx="95" cy="85" r="52" fill="#26A17B" stroke="#fff" stroke-width="4"/><rect x="65" y="58" width="60" height="13" rx="2" fill="#fff"/><rect x="89" y="66" width="12" height="52" fill="#fff"/><ellipse cx="95" cy="83" rx="29" ry="9" fill="none" stroke="#fff" stroke-width="5"/><text x="185" y="88" font-family="Arial Black,Arial,sans-serif" font-size="60" font-weight="900" fill="#fff">USDT</text><text x="187" y="118" font-family="Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="3" fill="#d6fff1">TETHER · BEP20</text><text x="187" y="144" font-family="Arial,sans-serif" font-size="16" fill="#d6fff1" opacity=".9">Red Binance Smart Chain (BSC)</text><rect x="388" y="20" width="192" height="30" rx="15" fill="#fff" opacity=".18"/><text x="484" y="41" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="800" fill="#fff">✔ DEPÓSITO AUTOMÁTICO</text></svg>`;
(function () {
  const d = document.querySelector('#sec-usdt-detail .wallet-box-detail');
  if (d) d.insertAdjacentHTML('afterbegin', usdtBanner('ub1'));
  const p = document.getElementById('packages-usdt-container');
  if (p) p.insertAdjacentHTML('afterbegin', usdtBanner('ub2'));
})();

// --- juegos en el inicio ---
(function () {
  const old = document.querySelector('.game-banner-card');
  if (old) { old.style.display = 'none'; const h = old.querySelector('h4'); if (h) h.textContent = 'FREE FIRE LATAM'; }
  const grid = document.createElement('div');
  grid.className = 'games-grid';
  grid.innerHTML = [['freefire.jpg', 'FREE FIRE LATAM', 'recargas'], ['bloodstrike.jpg', 'BLOOD STRIKE', 'bloodstrike']].map(([img, name, go]) =>
    `<div class="game-poster" onclick="switchMainTab('${go}')" style="background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.85) 100%),url('${img}')"><div class="game-poster-name">${name}</div><div class="game-poster-btn">Seleccionar</div></div>`).join('');
  document.getElementById('sec-home').appendChild(grid);
})();

// --- Blood Strike: paquetes [cantidad, precio, 'id'] (se llenan cuando lleguen los precios) ---
const BS_PAQ = {
  saldo: [[51,153,'bs1'],[105,270,'bs2'],[320,848,'bs3'],[540,1391,'bs4'],[1100,2824,'bs5'],[2260,5616,'bs6'],[5800,13985,'bs7']],
  usdt: [[51,0.47,'bu1'],[105,0.83,'bu2'],[320,2.61,'bu3'],[540,4.28,'bu4'],[1100,8.69,'bu5'],[2260,17.28,'bu6'],[5800,43.03,'bu7']],
};
(function () {
  const sec = document.createElement('div');
  sec.id = 'sec-bloodstrike'; sec.className = 'vista-sec hidden';
  sec.innerHTML = `<button onclick="switchMainTab('home')" style="background:none;border:none;color:var(--primary-neon);font-weight:800;font-size:.82rem;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-arrow-left"></i> Volver a Inicio</button>
  <div class="game-poster" style="aspect-ratio:2/1;cursor:default;background-image:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.85) 100%),url('bloodstrike.jpg')"><div class="game-poster-name" style="font-size:1.05rem">BLOOD STRIKE</div></div>
  <div class="top-recharge-showcase" style="border-radius:18px;padding:1rem;margin:1rem 0;border:2px solid var(--border-color)"><div class="form-group" style="margin-bottom:0"><label>PLAYER ID (solo números)</label><input type="number" id="bs-player-id" class="form-control" placeholder="Ej. 123456789" style="text-align:center;font-weight:bold"></div></div>
  <div id="bs-packages"></div>`;
  document.querySelector('#main-app .container').appendChild(sec);
  const box = sec.querySelector('#bs-packages');
  const all = [['saldo', BS_PAQ.saldo], ['usdt', BS_PAQ.usdt]].filter(x => x[1].length);
  box.innerHTML = !all.length ? '<p style="text-align:center;color:var(--text-muted);font-weight:700;padding:1rem">Los paquetes y precios de Blood Strike se publicarán muy pronto.</p>'
    : all.map(([c, list]) => `<div class="section-title">PAQUETES CON ${c === 'usdt' ? 'USDT' : 'SALDO MÓVIL'}</div><div class="diamonds-grid">` +
      list.map(([q, p, id]) => `<div class="pk" onclick="pickPkg(this,'${id}',${p},'${c}')"><div><b>${q}</b><small>Oro</small><em>${c === 'usdt' ? '$' + p.toFixed(2) + ' USDT' : p + ' saldo'}</em></div></div>`).join('') + '</div>').join('')
      + '<button onclick="submitBsOrder()" class="btn-main">COMPLETAR RECARGA</button>';
})();
async function submitBsOrder() {
  const playerId = document.getElementById('bs-player-id').value.trim();
  if (!/^\d{5,15}$/.test(playerId) || !selectedId) { showNotification('Ingresa un ID válido (solo números) y elige un paquete.'); return; }
  try {
    const d = await api('/api/order', { pkg: selectedId, playerId });
    if (d.success) { showNotification('Compra enviada. Estamos procesando tu recarga.'); switchMainTab('orders'); loadOrdersFromCloud(); loadUserDataFromCloud(); }
    else showNotification(d.message || 'Error al procesar.');
  } catch { showNotification('Error de red.'); }
}
