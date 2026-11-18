const IMG = { banner: 'banner.svg', juego: '', diamante: '' };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let isAdmin = false;

// ===== TEMA DORADO =====
const goldCss = document.createElement('style');
goldCss.textContent = `
:root{--primary-neon:#ffe14d;--accent-neon:#ffb300;--border-color:#6b4f1a;--bg-main:#241d10;--bg-card:#2e2513;--text-muted:#e8dcae;--neon-glow:0 0 16px rgba(255,225,77,.45);--neon-glow-strong:0 0 28px rgba(255,225,77,.55)}
html,body{background-image:none!important}
.btn-main,.pay-tab-btn.active{background:linear-gradient(135deg,#ffd76a,#b8860b)!important;color:#1a1204!important}
.auth-tab.active,.game-banner-btn{color:#1a1204!important}
.form-control,.wallet-address-box,.auth-tabs,.ticket-steps-bar,.admin-req-card,.user-data-card,.wallet-pill-top,.diamond-price-badge,.pay-tab-btn,.top-recharge-showcase{background:#0d0a04!important}
.diamond-card,.pk,.ticket-receipt-card{background:linear-gradient(145deg,#1b150a,#0d0a04)!important}
.pk.selected,.pk:hover,.diamond-card.selected,.diamond-card:hover{background:#2b2110!important}
svg path[fill="#00f7ff"]{fill:#ffc531}
.section-title,.brand-header h1,.nav-brand-title,.ticket-title-group h4,.diamond-card-content h4{text-shadow:0 0 12px rgba(0,0,0,0.35)!important}
.section-title{text-shadow:0 0 14px rgba(0,0,0,0.35),0 3px 6px #000!important;font-size:.95rem!important}
.form-group label,.ticket-row-line span:first-child{color:#f0e2b0!important;text-shadow:0 1px 4px #000}
.ticket-row-line span:last-child{text-shadow:0 2px 6px #000}
.wallet-box-detail,.ticket-receipt-card,.diamond-card,.pk,.wallet-card-option,.admin-req-card,.user-data-card,.auth-container{box-shadow:0 6px 14px rgba(0,0,0,.4),0 0 0 1px rgba(255,225,77,.55),0 0 12px rgba(255,225,77,.3)!important}
#notification-toast{background:#1b140a!important;box-shadow:0 6px 18px rgba(0,0,0,.5)!important}`;

document.head.appendChild(goldCss);

// Fuente Inter (se carga con <link>: un @import dentro del CSS no funciona si no va al principio)
if (!document.getElementById('dl-font')) {
  const lf = document.createElement('link');
  lf.id = 'dl-font'; lf.rel = 'stylesheet';
  lf.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
  document.head.appendChild(lf);
}

const MINI_LOGO = (s, x = '') => `<svg viewBox="0 0 100 100" width="${s}" height="${s}" style="flex:none;filter:drop-shadow(0 0 6px rgba(255,197,49,.7));${x}"><circle cx="50" cy="50" r="46" fill="#0b0703" stroke="#ffc531" stroke-width="5"/><circle cx="50" cy="50" r="38" fill="none" stroke="#8f5f06" stroke-width="2"/><path d="M33 34L30 19L40 27L45 15L50 10L55 15L60 27L70 19L67 34Z" fill="#ffd35a" stroke="#8f5f06" stroke-width="1.5" stroke-linejoin="round"/><g stroke="#fff3b0" stroke-width="1" stroke-linejoin="round" transform="translate(27 37) scale(.46)"><polygon points="20,0 80,0 70,30 30,30" fill="#fff8d6"/><polygon points="0,30 20,0 30,30" fill="#ffe08a"/><polygon points="100,30 80,0 70,30" fill="#ffd45c"/><polygon points="0,30 30,30 50,90" fill="#e0a21a"/><polygon points="30,30 70,30 50,90" fill="#ffc531"/><polygon points="70,30 100,30 50,90" fill="#a8740a"/></g></svg>`;

document.querySelectorAll('.nav-brand-title svg').forEach(e => e.outerHTML = MINI_LOGO(32));
document.querySelectorAll('.brand-header svg').forEach(e => e.outerHTML = MINI_LOGO(84, 'margin-bottom:8px'));

// ===== PERFIL (seccion + boton) =====
(function () {
  const sec = document.createElement('div');
  sec.id = 'sec-perfil';
  sec.className = 'vista-sec hidden';
  sec.innerHTML = '<div class="section-title">MI PERFIL</div><div class="wallet-box-detail" id="perfil-box">Cargando...</div>';
  document.querySelector('#main-app .container').appendChild(sec);

  const nb = document.createElement('button');
  nb.className = 'nav-item-btn';
  nb.dataset.sec = 'perfil';
  nb.onclick = () => switchMainTab('perfil');
  nb.innerHTML = '<i class="fa-solid fa-user"></i> Perfil';
  document.querySelector('.app-bottom-nav').appendChild(nb);
})();

const _sm = switchMainTab;
switchMainTab = function (s) {
  _sm(s);
  if (s === 'perfil') loadProfile();
};

const AVATARS = ['👑', '💎', '🔥', '🐉', '🦅', '🐺', '⚡', '🎮'];

function setAvatar(a) {
  localStorage.setItem('dl_av_' + currentUser, a);
  document.getElementById('avatar-big').textContent = a || currentUser.charAt(0).toUpperCase();
}

function copyRef(l) {
  navigator.clipboard.writeText(l).then(() => showNotification('¡Link copiado!'));
}

// codigo corto de jugador y codigo de barras decorativo (salen del nombre de usuario)
const dlHash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function dlBarcode(seed) {
  let h = dlHash(seed) || 7, x = 0, bars = '';
  while (x < 196) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const w = 1 + (h % 3), gap = 1 + ((h >> 8) % 3);
    bars += `<rect x="${x}" y="0" width="${w}" height="34" fill="currentColor"/>`;
    x += w + gap;
  }
  return `<svg viewBox="0 0 200 34" preserveAspectRatio="none">${bars}</svg>`;
}

async function loadProfile() {
  const b = document.getElementById('perfil-box');

  try {
    const d = await api('/api/profile');

    if (!d.success) {
      b.textContent = (d.message || 'Error') + (d.message === 'Ruta no encontrada.' ? ' — falta subir la versión nueva de worker2.js' : '');
      return;
    }

    const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(d.username);
    const f = t => t ? new Date(t).toLocaleDateString('es') : '—';
    const av = localStorage.getItem('dl_av_' + d.username) || '';
    const code = dlHash(d.username).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);

    const btn = 'width:42px;height:42px;border-radius:50%;border:2px solid var(--primary-neon);background:#0d0a04;color:#ffd35a;font-size:20px;font-weight:900;box-shadow:0 4px 10px rgba(0,0,0,.8)';

    const carnet = `
      <div class="dl-id-card">
        <div class="dl-id-top"><span class="dl-id-brand">${MINI_LOGO(22)} DIAMONS LEGIÓN</span><span class="dl-sim"></span></div>
        <div class="dl-id-body">
          <div id="avatar-big" class="dl-ava">${av || esc(d.username.charAt(0).toUpperCase())}</div>
          <div class="dl-id-who">
            <div class="dl-id-name">${esc(d.username)}</div>
            <div class="dl-id-mail">${esc(d.email)}</div>
            <span class="dl-badge"><i class="fa-solid fa-circle-check"></i> Miembro desde ${f(d.created)}</span>
          </div>
        </div>
        <div class="dl-id-stats">
          <div><i class="fa-solid fa-bolt"></i><b>${d.purchases || 0}</b><span>Compras</span></div>
          <div><i class="fa-solid fa-gem"></i><b>${(d.dlc || 0).toFixed(2)}</b><span>DLC</span></div>
          <div><i class="fa-solid fa-user-group"></i><b>${d.referrals || 0}</b><span>Referidos</span></div>
        </div>
        <div class="dl-barcode">${dlBarcode(d.username)}</div>
        <div class="dl-id-code">ID DE JUGADOR · #${code}</div>
      </div>
      <details class="dl-avatars">
        <summary><i class="fa-solid fa-user-pen"></i> Cambiar avatar</summary>
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding-top:10px">${AVATARS.map(e => `<button style="${btn}" onclick="setAvatar('${e}')">${e}</button>`).join('')}<button style="${btn}" onclick="setAvatar('')">Aa</button></div>
      </details>`;

    b.innerHTML = carnet + `
      ${d.referredBy ? `<div class="ticket-details-body"><div class="ticket-row-line"><span>Invitado por</span><span>${esc(d.referredBy)}</span></div></div>` : ''}
      <div class="section-title" style="margin-top:1.2rem">INVITA Y GANA</div>
      <p style="font-size:.75rem;color:var(--text-muted);text-align:center">Ganas 4% en DLC de cada depósito que hagan tus invitados (por USDT o por saldo móvil).</p>
      <div class="wallet-address-box" style="font-size:.7rem">${esc(link)}</div>
      <button class="btn-main" onclick="copyRef('${link}')"><i class="fa-regular fa-copy"></i> Copiar mi link</button>
      <div class="ticket-details-body" style="margin-top:1rem">
        <div class="ticket-row-line"><span>Invitados</span><span>${d.referrals}</span></div>
        <div class="ticket-row-line"><span>Ganado por referidos</span><span>${d.refEarned.toFixed(2)} DLC</span></div>
      </div>
      <button class="btn-main" style="margin-top:1.2rem" onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</button>`;

  } catch {
    b.textContent = 'Error de red.';
  }
}

function applyImages() {
  const bg = (sel, u) => u && document.querySelectorAll(sel).forEach(e =>
    e.style.backgroundImage = `linear-gradient(180deg,rgba(0,0,0,0) 78%,rgba(0,0,0,.6) 100%),url('${u}')`);

  bg('.store-banner-img', IMG.banner);
  bg('.game-banner-card', IMG.juego);

  if (IMG.diamante) document.querySelectorAll('.diamond-card-content').forEach(c => {
    const i = new Image();
    i.src = IMG.diamante;
    i.alt = '';
    i.style.cssText = 'width:56px;height:56px;object-fit:contain';
    c.prepend(i);
  });
}

async function api(path, body) {
  const t = localStorage.getItem('dl_token');

  const r = await fetch(API_BASE + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: 'Bearer ' + t } : {})
    },
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

  await loadUserDataFromCloud();
  checkAdminRights();
  loadOrdersFromCloud();

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

  if (ref) {
    localStorage.setItem('dl_ref', ref);
    switchAuthTab('register');
  }

  const u = localStorage.getItem('dl_logged_user');
  const t = localStorage.getItem('dl_token');

  if (u && t) await enter({ username: u, token: t });
};

function checkAdminRights() {
  document.getElementById('admin-panel-container').classList.toggle('hidden', !isAdmin);
}

function logoutUser() {
  localStorage.removeItem('dl_logged_user');
  localStorage.removeItem('dl_token');

  currentUser = null;
  isAdmin = false;

  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

async function handleLogin(e) {
  e.preventDefault();

  try {
    const d = await api('/api/login', {
      username: document.getElementById('login-user').value.trim(),
      password: document.getElementById('login-pass').value
    });

    if (d.success) enter(d, '¡Bienvenido, ');
    else showNotification(d.message || 'Credenciales incorrectas.');

  } catch {
    showNotification('Error de conexión.');
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const pass = document.getElementById('reg-pass').value;

  if (pass.length < 7) {
    showNotification('La contraseña debe tener mínimo 7 caracteres.');
    return;
  }

  try {
    const d = await api('/api/register', {
      username: document.getElementById('reg-user').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      password: pass,
      ref: localStorage.getItem('dl_ref') || ''
    });

    if (d.success) enter(d, '¡Registro exitoso, ');
    else showNotification(d.message || 'No se pudo registrar.');

  } catch {
    showNotification('Error de conexión.');
  }
}

async function loadUserDataFromCloud() {
  if (!currentUser) return;

  try {
    const d = await api('/api/user');

    if (d.success) {
      cachedUserData = { dlc: d.dlc || 0 };
      isAdmin = !!d.isAdmin;
      updateUIBalances();
      checkAdminRights();
    }

  } catch { }
}

async function loadOrdersFromCloud() {
  if (!currentUser) return;

  try {
    const d = await api('/api/orders');

    if (!d.success) return;

    cachedOrders = (d.orders || []).map(o => ({
      ...o,
      user: esc(o.user),
      type: esc(o.type),
      detail: esc(o.detail),
      playerId: esc(o.playerId)
    }));

    cachedAllUsers = (d.allUsers || []).map(x => ({
      ...x,
      username: esc(x.username),
      email: esc(x.email),
      referredBy: esc(x.referredBy)
    }));

    renderOrders();

  } catch { }
}

// ===== PEDIDOS (con resumen y pestañas) + PANEL ADMIN, todo en DLC =====
const dlOrd = { tab: 'buy', f: 'all' };
function dlSetTab(t) { dlOrd.tab = t; dlOrd.f = 'all'; renderOrders(); }
function dlSetF(f) { dlOrd.f = f; renderOrders(); }
const dlMoney = o => o.currency === 'usdt' ? '$' + Number(o.amount).toFixed(2) + ' USDT'
  : o.currency === 'dlc' ? Number(o.amount).toFixed(2) + ' DLC'
  : o.amount + ' saldo';
const dlIsDep = o => /^Dep[oó]sito/i.test(String(o.type || ''));

renderOrders = function () {
  const box = document.getElementById('orders-list-container');
  const mine = cachedOrders.filter(o => o.user === currentUser);
  const buys = mine.filter(o => !dlIsDep(o)), deps = mine.filter(dlIsDep);
  const done = buys.filter(o => o.status === 'Aprobado').length;
  const going = buys.filter(o => o.status === 'Proceso').length;
  const spent = buys.filter(o => o.currency === 'dlc' && o.status !== 'Rechazado').reduce((a, o) => a + Number(o.amount), 0);

  const list = dlOrd.tab === 'buy' ? buys : deps;
  const fmap = { done: 'Aprobado', going: 'Proceso', fail: 'Rechazado' };
  const shown = dlOrd.f === 'all' ? list : list.filter(o => o.status === fmap[dlOrd.f]);
  const cnt = s => list.filter(o => o.status === s).length;

  const pill = (k, label) => `<button class="dl-pill${dlOrd.f === k ? ' on' : ''}" onclick="dlSetF('${k}')">${label}</button>`;

  const cards = shown.length ? shown.map(o => {
    const cls = o.status === 'Aprobado' ? 'status-aprobado' : o.status === 'Rechazado' ? 'status-rechazado' : 'status-proceso';
    const dep = dlIsDep(o);
    return `
    <div class="ticket-receipt-card">
      <div class="ticket-header-flex">
        <div class="dl-ord-ico"><i class="fa-solid ${dep ? 'fa-wallet' : 'fa-bolt'}"></i></div>
        <div class="ticket-title-group" style="flex:1;min-width:0"><h4>${o.type}</h4><p>${o.detail}</p></div>
        <div class="ticket-status-badge ${cls}">${o.status}</div>
      </div>
      <div class="ticket-details-body">
        ${dep || !o.playerId || o.playerId === '-' ? '' : `<div class="ticket-row-line"><span>ID de jugador</span><strong>${o.playerId}</strong></div>`}
        <div class="ticket-row-line"><span>${dep ? 'Monto' : 'Total'}</span><strong style="color:var(--primary-neon);">${dlMoney(o)}</strong></div>
      </div>
    </div>`;
  }).join('') : `<div class="dl-empty"><i class="fa-regular fa-folder-open"></i><p>${dlOrd.tab === 'buy' ? 'Todavía no tienes compras' : 'Todavía no tienes depósitos'}${dlOrd.f !== 'all' ? ' con ese estado' : ''}.</p></div>`;

  box.innerHTML = `
    <div class="dl-stats">
      <div class="dl-stat"><i class="fa-solid fa-circle-check"></i><b>${done}</b><span>Entregadas</span></div>
      <div class="dl-stat"><i class="fa-solid fa-bolt"></i><b>${going}</b><span>En curso</span></div>
      <div class="dl-stat"><i class="fa-solid fa-gem"></i><b>${spent.toFixed(2)}</b><span>DLC gastados</span></div>
    </div>
    <div class="dl-tabs2">
      <button class="${dlOrd.tab === 'buy' ? 'on' : ''}" onclick="dlSetTab('buy')">Compras (${buys.length})</button>
      <button class="${dlOrd.tab === 'dep' ? 'on' : ''}" onclick="dlSetTab('dep')">Depósitos (${deps.length})</button>
    </div>
    <div class="dl-fpills">
      ${pill('all', 'Todas (' + list.length + ')')}${pill('done', 'Aprobadas (' + cnt('Aprobado') + ')')}${pill('going', 'En proceso (' + cnt('Proceso') + ')')}${pill('fail', 'Rechazadas (' + cnt('Rechazado') + ')')}
    </div>
    ${cards}`;

  if (!isAdmin) return;

  // --- panel admin: pendientes + usuarios (con ultima actividad) ---
  const now = Date.now();

  const ago = t => {
    if (!t) return 'nunca';

    const m = Math.round((now - t) / 60000);

    return m < 1 ? 'ahora' :
      m < 60 ? m + ' min' :
      m < 1440 ? Math.round(m / 60) + ' h' :
      Math.round(m / 1440) + ' d';
  };

  const pend = cachedOrders.filter(o => o.status === 'Proceso');

  document.getElementById('admin-orders-list').innerHTML = pend.length ? pend.map(o => `
    <div class="admin-req-card" style="flex-direction:column;align-items:flex-start;gap:8px">
      <div><b>${o.user}</b> · ${o.type}</div>
      <div>${o.detail} · ID: ${o.playerId} · ${dlMoney(o)}</div>
      <div style="display:flex;gap:10px;width:100%">
        <button onclick="updateOrderStatus(${o.id},'Aprobado')" style="flex:1;background:#10b981;border:0;color:#fff;padding:8px;border-radius:8px;font-weight:900">Aceptar</button>
        <button onclick="updateOrderStatus(${o.id},'Rechazado')" style="flex:1;background:#ef4444;border:0;color:#fff;padding:8px;border-radius:8px;font-weight:900">Rechazar</button>
      </div>
    </div>`).join('') : '<p style="font-size:.8rem;color:var(--text-muted)">No hay solicitudes pendientes.</p>';

  const act = cachedAllUsers.filter(x => x.lastSeen && now - x.lastSeen < 864e5).length;

  document.getElementById('admin-users-list').innerHTML =
    `<p style="font-size:.78rem;color:var(--primary-neon);font-weight:900">Total: ${cachedAllUsers.length} · Activos 24h: ${act}</p>` +
    cachedAllUsers.map(x => `
    <div class="user-data-card">
      <div><b>${x.username}</b> (${x.email})</div>
      <div>Balance: ${Number(x.dlc || 0).toFixed(2)} DLC</div>
      <div>Última vez: ${ago(x.lastSeen)} · Registro: ${x.created ? new Date(x.created).toLocaleDateString('es') : '—'}</div>
      <div>Invitados: ${x.referrals || 0}${x.referredBy ? ' · Invitado por: ' + x.referredBy : ''}</div>
    </div>`).join('');
};

async function submitSaldoDeposit() {
  const amount = parseFloat(document.getElementById('saldo-monto-input').value);
  const hash = document.getElementById('saldo-hash-input').value.trim();

  if (!amount || !hash) {
    showNotification('Completa todos los campos.');
    return;
  }

  try {
    const d = await api('/api/deposit', { amount, detail: 'Conf: ' + hash });

    if (d.success) {
      showNotification('Depósito enviado. Se acreditará en DLC cuando se apruebe.');
      switchMainTab('orders');
      loadOrdersFromCloud();
    } else {
      showNotification(d.message || 'Error al registrar.');
    }

  } catch {
    showNotification('Error de red.');
  }
}

async function submitDeposit() {
  const hash = document.getElementById('usdt-hash-input').value.trim();
  const amount = parseFloat(document.getElementById('usdt-monto-input').value) || 0;

  if (!hash) {
    showNotification('Pega el hash de tu transacción.');
    return;
  }

  showNotification('Verificando pago en la blockchain...');

  try {
    const d = await api('/api/deposit/usdt', { hash, amount });

    if (d.success) {
      showNotification(`¡Se acreditaron ${d.amount} DLC!`);
      loadUserDataFromCloud();
      switchMainTab('orders');
      loadOrdersFromCloud();
    } else {
      showNotification(d.message || 'No se pudo verificar.');
    }

  } catch {
    showNotification('Error de red.');
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const d = await api('/api/admin/order-status', { orderId, status });

    if (d.success) {
      showNotification('Actualizado a ' + status);
      loadOrdersFromCloud();
      loadUserDataFromCloud();
    } else {
      showNotification(d.message || 'Error.');
    }

  } catch {
    showNotification('Error de red.');
  }
}

// ===== v3: juegos, tema claro/oscuro, barras flotantes, banner USDT =====
const lightRule = (sel, decl) => sel.split(',').map(s => 'html[data-theme="light"] ' + s.trim()).join(',') + '{' + decl + '}';

goldCss.textContent += `
.nav-item-btn.active,.nav-item-btn:hover{text-shadow:0 0 12px rgba(0,0,0,0.35)!important}
.wallet-pill-top,.diamond-price-badge,.game-banner-btn,.saldo-icon-box{box-shadow:0 2px 6px rgba(0,0,0,.35)!important}
.store-banner-text{background:rgba(10,8,3,.88)!important}
.nav-brand-title{font-size:.72rem!important}
.navbar{top:10px!important;margin:10px 12px 0!important;border-radius:22px!important;border:2px solid var(--border-color)!important;background:rgba(21,16,10,.93)!important;backdrop-filter:blur(10px);box-shadow:0 6px 16px rgba(0,0,0,.4)!important;padding:.6rem .8rem!important}
.app-bottom-nav{left:12px!important;right:12px!important;bottom:12px!important;width:auto!important;border-radius:24px!important;border:2px solid var(--border-color)!important;background:rgba(21,16,10,.93)!important;backdrop-filter:blur(10px);box-shadow:0 6px 16px rgba(0,0,0,.4)!important;padding:10px 0!important}
.container{padding-bottom:120px!important}
.games-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:1.2rem}
.game-poster{aspect-ratio:1/1.15;border-radius:18px;background-size:cover;background-position:center top;border:2px solid var(--primary-neon);box-shadow:0 6px 16px rgba(0,0,0,.45),0 0 0 1px rgba(255,225,77,.6),0 0 16px rgba(255,225,77,.35);position:relative;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;padding:10px;transition:.3s}
.game-poster:hover{transform:translateY(-3px)}
.game-poster-name{font-family:Orbitron,sans-serif;font-weight:900;font-size:.8rem;color:#fff;text-shadow:0 2px 8px #000}
.game-poster-btn{background:var(--primary-neon);color:#1a1204;font-weight:900;font-size:.72rem;text-align:center;padding:6px;border-radius:10px}
html[data-theme="light"]{--bg-main:#ffffff;--bg-card:#ffffff;--text-main:#1b1405;--text-muted:#6b5a2e;--primary-neon:#e0a400;--border-color:#f0e3bd;--neon-glow:0 4px 14px rgba(0,0,0,0.25);--neon-glow-strong:0 8px 24px rgba(0,0,0,0.30)}
html[data-theme="light"],html[data-theme="light"] body{background-image:none!important}
` + lightRule('body *', 'text-shadow:none!important')
  + lightRule('.form-control,.wallet-address-box,.auth-tabs,.ticket-steps-bar,.admin-req-card,.user-data-card,.wallet-pill-top,.diamond-price-badge,.pay-tab-btn,.top-recharge-showcase', 'background:#fffaf0!important')
  + lightRule('.diamond-card,.pk,.ticket-receipt-card', 'background:#fff!important')
  + lightRule('.pk.selected,.pk:hover,.diamond-card.selected,.diamond-card:hover', 'background:#fff3cf!important')
  + lightRule('.navbar,.app-bottom-nav', 'background:rgba(255,255,255,.95)!important;box-shadow:0 8px 24px rgba(0,0,0,0.22)!important')
  + lightRule('.wallet-box-detail,.ticket-receipt-card,.diamond-card,.pk,.wallet-card-option,.admin-req-card,.user-data-card,.auth-container,.game-poster', 'box-shadow:0 8px 22px rgba(0,0,0,0.22)!important')
  + lightRule('.ticket-row-line span:last-child,.user-data-card,.admin-panel-box,.ticket-title-group h4,.wallet-info h4,.pk b', 'color:var(--text-main)!important')
  + lightRule('.form-group label,.ticket-row-line span:first-child', 'color:#5b4a1e!important');

// --- tema claro / oscuro ---
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem('dl_theme', t);

  document.querySelectorAll('.theme-btn').forEach(b => {
    b.innerHTML = t === 'light'
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
  });
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
}

(function () {
  const lo = document.querySelector('.nav-wallet-pills .wallet-pill-top[title="Salir"]');

  if (lo) {
    lo.classList.add('theme-btn');
    lo.title = 'Tema';
    lo.onclick = toggleTheme;
  }

  const ab = document.createElement('div');
  ab.className = 'wallet-pill-top theme-btn';
  ab.style.cssText = 'position:fixed;top:14px;right:14px;z-index:50;padding:9px 11px';
  ab.onclick = toggleTheme;

  document.getElementById('auth-screen').appendChild(ab);

  const tg = localStorage.getItem('dl_theme');
  applyTheme(tg === 'light' ? 'light' : 'dark');
})();

// =====================================================
// ===== DIAMONS LEGIÓN: NUEVO DISEÑO PREMIUM LED =====
// ===== DORADO + BLANCO / SIN NEBLINA NI DESENFOQUE ====
// =====================================================

goldCss.textContent += `

/* PALETA GENERAL */
:root{
  --primary-neon:#ffd45a;
  --accent-neon:#ffffff;
  --border-color:#9b741e;
  --neon-glow:0 0 12px rgba(255,205,65,.45);
  --neon-glow-strong:0 0 24px rgba(255,205,65,.65);
}

/* FONDO OSCURO */
html[data-theme="dark"],
html[data-theme="dark"] body{
  background-color:#090805!important;
  background-image:none!important;
}

/* FONDO CLARO */
html[data-theme="light"],
html[data-theme="light"] body{
  background-color:#fff!important;
  background-image:none!important;
}

/* QUITAR NEBLINA Y DESENFOQUE */
.navbar,
.app-bottom-nav,
#notification-toast,
.wallet-box-detail,
.auth-container{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

/* BARRAS SÓLIDAS EN OSCURO */
html[data-theme="dark"] .navbar,
html[data-theme="dark"] .app-bottom-nav{
  background:#100d07!important;
  border:1px solid rgba(255,210,75,.75)!important;
  box-shadow:0 4px 18px rgba(0,0,0,.8),0 0 12px rgba(255,205,65,.18)!important;
}

/* BARRAS SÓLIDAS EN CLARO */
html[data-theme="light"] .navbar,
html[data-theme="light"] .app-bottom-nav{
  background:#fff!important;
  border:1px solid #d6ad46!important;
  box-shadow:0 4px 18px rgba(0,0,0,.12),0 0 10px rgba(220,170,40,.2)!important;
}

/* TARJETAS OSCURAS */
html[data-theme="dark"] .diamond-card,
html[data-theme="dark"] .pk,
html[data-theme="dark"] .ticket-receipt-card,
html[data-theme="dark"] .wallet-box-detail,
html[data-theme="dark"] .wallet-card-option,
html[data-theme="dark"] .admin-req-card,
html[data-theme="dark"] .user-data-card,
html[data-theme="dark"] .auth-container,
html[data-theme="dark"] .game-poster{
  background-color:#100d07!important;
  border:1px solid rgba(255,211,85,.65)!important;
  box-shadow:0 5px 18px rgba(0,0,0,.65),0 0 10px rgba(255,205,65,.16)!important;
}

/* TARJETAS BLANCAS */
html[data-theme="light"] .diamond-card,
html[data-theme="light"] .pk,
html[data-theme="light"] .ticket-receipt-card,
html[data-theme="light"] .wallet-box-detail,
html[data-theme="light"] .wallet-card-option,
html[data-theme="light"] .admin-req-card,
html[data-theme="light"] .user-data-card,
html[data-theme="light"] .auth-container{
  background:#fff!important;
  border:1px solid #dfbd67!important;
  box-shadow:0 5px 18px rgba(0,0,0,.10),0 0 10px rgba(218,170,50,.14)!important;
}

/* CONSERVAR FOTOS DE LOS JUEGOS EN TEMA BLANCO */
html[data-theme="light"] .game-poster{
  background-color:transparent!important;
  background-size:cover!important;
  background-position:center top!important;
  background-repeat:no-repeat!important;
  border:1px solid #dfbd67!important;
  box-shadow:0 5px 18px rgba(0,0,0,.10),0 0 10px rgba(218,170,50,.14)!important;
}

/* RESPLANDOR ANIMADO DE ESQUINA A ESQUINA */
.diamond-card,
.pk,
.ticket-receipt-card,
.wallet-box-detail,
.wallet-card-option,
.admin-req-card,
.user-data-card,
.auth-container,
.game-poster{
  position:relative!important;
  isolation:isolate;
  overflow:hidden;
}

/* BRILLO QUE RECORRE LAS TARJETAS */
.diamond-card::after,
.pk::after,
.ticket-receipt-card::after,
.wallet-box-detail::after,
.wallet-card-option::after,
.admin-req-card::after,
.user-data-card::after,
.auth-container::after,
.game-poster::after{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  border-radius:inherit;
  background:linear-gradient(
    115deg,
    transparent 0%,
    transparent 34%,
    rgba(255,255,255,.04) 43%,
    rgba(255,220,120,.22) 50%,
    rgba(255,255,255,.12) 54%,
    transparent 67%,
    transparent 100%
  );
  background-size:250% 250%;
  animation:dlCardShine 5s linear infinite;
  opacity:.85;
}

/* CONTENIDO ENCIMA DEL RESPLANDOR */
.diamond-card > *,
.pk > *,
.ticket-receipt-card > *,
.wallet-box-detail > *,
.wallet-card-option > *,
.admin-req-card > *,
.user-data-card > *,
.auth-container > *,
.game-poster > *{
  position:relative;
  z-index:1;
}

/* ANIMACIÓN DEL RESPLANDOR */
@keyframes dlCardShine{
  0%{background-position:150% 150%}
  100%{background-position:-150% -150%}
}

/* BORDE DORADO EN LAS TARJETAS */
.diamond-card:hover,
.pk:hover,
.wallet-card-option:hover,
.game-poster:hover{
  border-color:#ffe38a!important;
  box-shadow:0 7px 22px rgba(0,0,0,.35),0 0 12px rgba(255,211,85,.45)!important;
  transform:translateY(-3px);
}

/* TARJETA SELECCIONADA */
.diamond-card.selected,
.pk.selected{
  border:2px solid #ffd45a!important;
  box-shadow:0 0 0 1px #fff1b5,0 0 20px rgba(255,205,65,.45)!important;
}

/* BOTONES DORADOS */
.btn-main,
.pay-tab-btn.active,
.game-banner-btn,
.game-poster-btn,
.auth-tab.active{
  background:linear-gradient(120deg,#fff0a6 0%,#ffd45a 35%,#d69b19 70%,#fff0a6 100%)!important;
  background-size:200% auto!important;
  color:#211600!important;
  border:1px solid #fff0a6!important;
  font-weight:900!important;
  box-shadow:0 3px 12px rgba(255,195,45,.25),inset 0 1px 2px rgba(255,255,255,.65)!important;
  transition:transform .22s ease,box-shadow .22s ease,filter .22s ease,background-position .5s ease!important;
}

/* ANIMACIONES DE BOTONES */
button,
.btn-main,
.nav-item-btn,
.pay-tab-btn,
.game-banner-btn,
.game-poster-btn,
.theme-btn{
  transition:transform .22s ease,filter .22s ease,box-shadow .22s ease!important;
  -webkit-tap-highlight-color:transparent;
}

/* MOVIMIENTO AL TOCAR */
button:active,
.btn-main:active,
.nav-item-btn:active,
.pay-tab-btn:active,
.game-banner-btn:active,
.game-poster-btn:active,
.theme-btn:active{
  transform:scale(.95)!important;
}

/* EFECTO AL PASAR EL RATÓN */
.btn-main:hover,
.pay-tab-btn.active:hover,
.game-banner-btn:hover,
.game-poster-btn:hover,
.auth-tab.active:hover{
  background-position:100% center!important;
  transform:translateY(-2px)!important;
  filter:brightness(1.08)!important;
  box-shadow:0 6px 18px rgba(255,195,45,.4),0 0 12px rgba(255,255,255,.25)!important;
}

/* BOTONES DE NAVEGACIÓN */
.nav-item-btn{
  border-radius:12px!important;
}

.nav-item-btn.active{
  color:#ffd45a!important;
  text-shadow:0 0 10px rgba(255,210,80,.45)!important;
}

/* BOTÓN DE CAMBIO DE TEMA */
.theme-btn{
  border:1px solid #d9ad43!important;
  box-shadow:0 0 12px rgba(255,210,80,.25)!important;
  cursor:pointer!important;
}

/* CAMPOS DE TEXTO OSCUROS */
html[data-theme="dark"] .form-control,
html[data-theme="dark"] .wallet-address-box,
html[data-theme="dark"] .auth-tabs,
html[data-theme="dark"] .ticket-steps-bar,
html[data-theme="dark"] .top-recharge-showcase,
html[data-theme="dark"] .pay-tab-btn{
  background:#100d07!important;
  border-color:#75591f!important;
  color:#fff0c4!important;
}

/* CAMPOS DE TEXTO CLAROS */
html[data-theme="light"] .form-control,
html[data-theme="light"] .wallet-address-box,
html[data-theme="light"] .auth-tabs,
html[data-theme="light"] .ticket-steps-bar,
html[data-theme="light"] .top-recharge-showcase,
html[data-theme="light"] .pay-tab-btn{
  background:#fff!important;
  border-color:#dfbd67!important;
  color:#33250b!important;
}

/* TEXTO DORADO EN OSCURO */
html[data-theme="dark"] .section-title,
html[data-theme="dark"] .brand-header h1,
html[data-theme="dark"] .nav-brand-title,
html[data-theme="dark"] .diamond-card-content h4{
  color:#ffdf82!important;
}

/* TEXTO OSCURO EN CLARO */
html[data-theme="light"] .section-title,
html[data-theme="light"] .brand-header h1,
html[data-theme="light"] .nav-brand-title,
html[data-theme="light"] .diamond-card-content h4{
  color:#8a620c!important;
}

/* ETIQUETAS Y DETALLES */
html[data-theme="dark"] .form-group label,
html[data-theme="dark"] .ticket-row-line span:first-child{
  color:#f5e4b5!important;
}

html[data-theme="light"] .form-group label,
html[data-theme="light"] .ticket-row-line span:first-child{
  color:#70551b!important;
}

/* PRECIO Y SALDO */
.diamond-price-badge,
.wallet-pill-top{
  border:1px solid rgba(255,211,85,.55)!important;
}

/* NOTIFICACIONES */
#notification-toast{
  border:1px solid rgba(255,211,85,.6)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

html[data-theme="dark"] #notification-toast{
  background:#100d07!important;
  color:#fff0c4!important;
}

html[data-theme="light"] #notification-toast{
  background:#fff!important;
  color:#33250b!important;
}

/* AVATAR */
#avatar-big{
  border-color:#fff0a6!important;
  box-shadow:0 0 15px rgba(255,205,65,.35),0 0 30px rgba(255,255,255,.12)!important;
}

/* ANIMACIÓN SUAVE DEL LOGO */
.nav-brand-title svg,
.brand-header svg{
  filter:drop-shadow(0 0 7px rgba(255,205,65,.55));
}

/* TIPOGRAFÍA PROFESIONAL */
html, body, button, input, select, textarea,
h1, h2, h3, h4, p, span, a, label {
  font-family: 'Inter', 'Segoe UI', Roboto, sans-serif !important;
}

/* ACCESIBILIDAD: RESPETAR REDUCCIÓN DE MOVIMIENTO */
@media(prefers-reduced-motion:reduce){
  .diamond-card::after,
  .pk::after,
  .ticket-receipt-card::after,
  .wallet-box-detail::after,
  .wallet-card-option::after,
  .admin-req-card::after,
  .user-data-card::after,
  .auth-container::after,
  .game-poster::after{
    animation:none!important;
  }

  button,
  .btn-main,
  .nav-item-btn,
  .game-poster{
    transition:none!important;
  }
}
`;

// ===== LED DORADO QUE RECORRE EL BORDE (corregido: la luz sigue el contorno exacto) =====
// Antes se giraba toda la tarjeta y la luz se salia del borde en algunos momentos.
// Ahora se anima solo el angulo del degradado con @property.
goldCss.textContent += `
@property --dl-a{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes dlSpin{to{--dl-a:360deg}}

.diamond-card::before,
.pk::before,
.ticket-receipt-card::before,
.wallet-box-detail::before,
.wallet-card-option::before,
.admin-req-card::before,
.user-data-card::before,
.auth-container::before,
.game-poster::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:2;
  padding:2px;
  border-radius:inherit;
  pointer-events:none;
  background:conic-gradient(
    from var(--dl-a),
    transparent 0deg,
    transparent 245deg,
    #a66c08 270deg,
    #ffd45a 290deg,
    #fff8d8 300deg,
    #ffffff 307deg,
    #ffd45a 316deg,
    #b77b0b 330deg,
    transparent 350deg,
    transparent 360deg
  );
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  transform:none;
  animation:dlSpin 3.2s linear infinite;
  filter:drop-shadow(0 0 3px rgba(255,210,75,.8)) drop-shadow(0 0 7px rgba(255,190,35,.45));
}

/* CARTELES DE JUEGOS: NEON MAS INTENSO */
.game-poster{
  position:relative!important;
  isolation:isolate!important;
  overflow:hidden!important;
  border-radius:14px!important;
  border:1px solid rgba(255,218,105,.9)!important;
  box-shadow:0 5px 18px rgba(0,0,0,.45),0 0 8px rgba(255,205,65,.35),inset 0 0 18px rgba(255,210,90,.08)!important;
}
.game-poster::before{
  z-index:10;
  background:conic-gradient(
    from var(--dl-a),
    transparent 0deg,
    transparent 275deg,
    #8a5700 290deg,
    #ffbf00 310deg,
    #fff4b0 325deg,
    #ffffff 332deg,
    #ffd700 340deg,
    #ffae00 350deg,
    transparent 360deg
  );
  filter:drop-shadow(0 0 3px #ffd700) drop-shadow(0 0 7px #ffb700);
  animation:dlSpin 2.8s linear infinite;
}
.game-poster img{position:relative;z-index:1}

@media(prefers-reduced-motion:reduce){
  .diamond-card::before,.pk::before,.ticket-receipt-card::before,.wallet-box-detail::before,
  .wallet-card-option::before,.admin-req-card::before,.user-data-card::before,
  .auth-container::before,.game-poster::before{animation:none!important}
}
`;

// =====================================================
// ===== DECORACIONES PREMIUM 2 (todo en dorado) =======
// =====================================================
goldCss.textContent += `

/* ---------- FONDO: cuadricula fina dorada + destellos ---------- */
html[data-theme="dark"]{background-color:#090805!important}
html[data-theme="dark"] body{
  background-color:transparent!important;
  background-image:linear-gradient(rgba(255,211,85,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,211,85,.05) 1px,transparent 1px)!important;
  background-size:26px 26px!important;
  background-attachment:fixed!important;
}
html[data-theme="light"]{background-color:#fff!important}
html[data-theme="light"] body{
  background-color:transparent!important;
  background-image:linear-gradient(rgba(190,140,20,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(190,140,20,.08) 1px,transparent 1px)!important;
  background-size:26px 26px!important;
  background-attachment:fixed!important;
}
#dl-sparkles{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
#dl-sparkles span{
  position:absolute;width:var(--sz,3px);height:var(--sz,3px);border-radius:50%;
  background:radial-gradient(circle,#fff6c4 0%,#ffd45a 45%,transparent 72%);
  opacity:0;animation:dlTwinkle 4s ease-in-out infinite;
}
@keyframes dlTwinkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:.9;transform:scale(1.4)}}
html[data-theme="light"] #dl-sparkles span{background:radial-gradient(circle,#ffe9a0 0%,#e0a400 50%,transparent 72%)}

/* ---------- TITULOS CON LINEAS DORADAS ---------- */
.section-title{display:flex!important;align-items:center;justify-content:center;gap:10px}
.section-title::before,.section-title::after{
  content:"";flex:1;max-width:64px;height:1px;
  background:linear-gradient(90deg,transparent,#d9ad43);
}
.section-title::after{background:linear-gradient(270deg,transparent,#d9ad43)}

/* ---------- BARRA DE ABAJO: pildora dorada en la pestana activa ---------- */
.app-bottom-nav .nav-item-btn{padding:7px 4px!important;border-radius:16px!important;margin:0 2px}
.app-bottom-nav .nav-item-btn.active{
  background:linear-gradient(135deg,#fff0a6,#ffd45a 45%,#c98f12)!important;
  color:#1a1204!important;text-shadow:none!important;
  box-shadow:0 3px 12px rgba(255,195,45,.4),inset 0 1px 1px rgba(255,255,255,.7)!important;
}

/* ---------- BANNER DE PROMOS ---------- */
.dl-promo{
  position:relative;overflow:hidden;border-radius:18px;margin:0 0 1.2rem;
  border:1px solid rgba(255,211,85,.75);
  background:linear-gradient(120deg,#2a1e08 0%,#0e0a04 72%);
  box-shadow:0 6px 18px rgba(0,0,0,.55),0 0 14px rgba(255,205,65,.18);
}
.dl-promo::before{
  content:"";position:absolute;right:-30px;top:-40px;width:160px;height:160px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,211,85,.3),transparent 68%);pointer-events:none;
}
.dl-track{display:flex;transition:transform .6s cubic-bezier(.4,0,.2,1)}
.dl-slide{flex:0 0 100%;display:flex;align-items:center;gap:12px;padding:14px 16px 22px;position:relative}
.dl-slide-ico{
  width:52px;height:52px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;
  font-size:1.35rem;color:#1a1204;background:linear-gradient(135deg,#fff0a6,#d69b19);
  box-shadow:0 4px 12px rgba(255,195,45,.4),inset 0 1px 2px rgba(255,255,255,.7);
}
.dl-slide-txt{min-width:0}
.dl-slide h5{margin:0;font-size:.98rem;font-weight:900;color:#ffdf82}
.dl-slide p{margin:3px 0 8px;font-size:.72rem;color:#f1e3b8;font-weight:600;line-height:1.35}
.dl-slide button{
  background:linear-gradient(120deg,#fff0a6,#ffd45a 45%,#d69b19);color:#211600;border:0;border-radius:10px;
  padding:6px 12px;font-size:.72rem;font-weight:900;cursor:pointer;box-shadow:0 3px 10px rgba(255,195,45,.3);
}
.dl-dots{position:absolute;right:14px;bottom:8px;display:flex;gap:5px}
.dl-dots i{width:6px;height:6px;border-radius:6px;background:rgba(255,211,85,.35);cursor:pointer;transition:.3s}
.dl-dots i.on{width:18px;background:#ffd45a}
html[data-theme="light"] .dl-promo{background:linear-gradient(120deg,#fff4d0,#ffffff 75%);border-color:#dfbd67;box-shadow:0 6px 18px rgba(120,90,10,.15)}
html[data-theme="light"] .dl-slide h5{color:#8a620c}
html[data-theme="light"] .dl-slide p{color:#6b5527}

/* ---------- BUSCADOR + FILTROS DE JUEGOS ---------- */
#dl-games-bar{margin:0 0 .9rem}
.dl-search{position:relative;margin-bottom:.95rem}
.dl-search i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#d9ad43;font-size:.9rem;pointer-events:none}
.dl-search input{
  width:100%;padding:.8rem 1rem .8rem 2.5rem;border-radius:14px;border:1px solid rgba(255,211,85,.55);
  background:#100d07;color:#fff0c4;font-size:16px;outline:none;
}
.dl-search input:focus{border-color:#ffd45a;box-shadow:0 0 12px rgba(255,205,65,.35)}
.dl-gh{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dl-gh-title{display:flex;align-items:center;gap:8px;font-weight:900;font-size:1.05rem;color:#ffdf82}
.dl-bar{width:4px;height:20px;border-radius:3px;background:linear-gradient(#fff0a6,#d69b19);box-shadow:0 0 8px rgba(255,205,65,.6)}
.dl-count{background:rgba(255,211,85,.16);border:1px solid rgba(255,211,85,.5);color:#ffd45a;border-radius:10px;padding:1px 8px;font-size:.7rem}
.dl-pills{display:flex;gap:6px}
.dl-pill{
  background:transparent;border:1px solid rgba(255,211,85,.5);color:#e8d08a;border-radius:14px;
  padding:5px 12px;font-size:.72rem;font-weight:800;cursor:pointer;white-space:nowrap;
}
.dl-pill.on{background:linear-gradient(120deg,#fff0a6,#ffd45a 50%,#d69b19);color:#211600;border-color:#fff0a6}
.dl-empty{text-align:center;color:var(--text-muted);padding:1.6rem 1rem;font-weight:700;font-size:.82rem}
.dl-empty i{display:block;font-size:2rem;color:#d9ad43;margin-bottom:8px}
html[data-theme="light"] .dl-search input{background:#fff;color:#33250b;border-color:#dfbd67}
html[data-theme="light"] .dl-gh-title{color:#8a620c}
html[data-theme="light"] .dl-pill{color:#8a620c;border-color:#dfbd67}
html[data-theme="light"] .dl-pill.on{color:#211600}

/* ---------- CARTELES: esquinas doradas + estrella de favorito ---------- */
.game-poster > .dl-brk{
  position:absolute;inset:7px;pointer-events:none;z-index:4;opacity:.9;
  background:
    linear-gradient(#ffe38a,#ffe38a) top left/14px 2px no-repeat,
    linear-gradient(#ffe38a,#ffe38a) top left/2px 14px no-repeat,
    linear-gradient(#ffe38a,#ffe38a) top right/14px 2px no-repeat,
    linear-gradient(#ffe38a,#ffe38a) top right/2px 14px no-repeat,
    linear-gradient(#ffe38a,#ffe38a) bottom left/14px 2px no-repeat,
    linear-gradient(#ffe38a,#ffe38a) bottom left/2px 14px no-repeat,
    linear-gradient(#ffe38a,#ffe38a) bottom right/14px 2px no-repeat,
    linear-gradient(#ffe38a,#ffe38a) bottom right/2px 14px no-repeat;
}
.game-poster > .dl-fav{
  position:absolute;top:12px;right:12px;width:30px;height:30px;padding:0;border-radius:50%;z-index:6;
  border:1px solid rgba(255,212,90,.85);background:rgba(10,8,3,.72);color:#ffd45a;
  display:flex;align-items:center;justify-content:center;font-size:.85rem;cursor:pointer;
}
.game-poster > .dl-fav.on{background:linear-gradient(135deg,#fff0a6,#d69b19);color:#1a1204;box-shadow:0 0 10px rgba(255,205,65,.7)}

/* ---------- WALLET: tarjeta de saldo ---------- */
.dl-wallet-card{
  position:relative;overflow:hidden;border-radius:20px;padding:16px;margin-bottom:1rem;
  border:1px solid rgba(255,211,85,.85);
  background:linear-gradient(135deg,#2e2109 0%,#100c05 55%,#211706 100%);
  box-shadow:0 8px 22px rgba(0,0,0,.6),0 0 16px rgba(255,205,65,.22);
}
.dl-wallet-card::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(135deg,rgba(255,211,85,.05) 0 2px,transparent 2px 14px);
}
.dl-wc-top{display:flex;justify-content:space-between;align-items:center;position:relative}
.dl-chip{
  display:inline-flex;align-items:center;gap:6px;font-size:.68rem;font-weight:900;color:#1a1204;
  background:linear-gradient(120deg,#fff0a6,#ffd45a);padding:4px 10px;border-radius:10px;
}
.dl-wc-eq{font-size:.68rem;font-weight:800;color:#e8d08a}
.dl-wc-main{display:flex;align-items:center;justify-content:space-between;gap:10px;position:relative;margin:12px 0}
.dl-wc-amount{font-size:2.4rem;font-weight:900;color:#fff3c4;line-height:1}
.dl-wc-amount small{font-size:1rem;color:#ffd45a;margin-left:6px;font-weight:800}
.dl-wc-sub{font-size:.74rem;color:#e8d08a;margin-top:7px;font-weight:600}
.dl-wc-sub b{color:#fff3c4}
.dl-wc-emblem{width:86px;height:86px;object-fit:contain;filter:drop-shadow(0 0 14px rgba(255,205,65,.7));animation:dlFloat 4s ease-in-out infinite}
@keyframes dlFloat{50%{transform:translateY(-5px) rotate(3deg)}}
.dl-wc-actions{display:flex;gap:8px;position:relative}
.dl-wc-actions .btn-main{flex:1;width:auto!important;margin:0!important;padding:.75rem .6rem!important;font-size:.76rem!important}
.dl-btn-ghost{
  flex:1;background:transparent;border:1px solid rgba(255,211,85,.75);color:#ffd45a;border-radius:14px;
  font-weight:900;font-size:.76rem;cursor:pointer;padding:.75rem .6rem;
}
.dl-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:1.1rem}
.dl-quick button{
  display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 4px;border-radius:16px;
  border:1px solid rgba(255,211,85,.55);background:#100d07;color:#f5e4b5;font-size:.72rem;font-weight:800;cursor:pointer;
}
.dl-quick button i{
  width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1rem;
  background:linear-gradient(135deg,#fff0a6,#d69b19);color:#1a1204;box-shadow:0 3px 10px rgba(255,195,45,.35);
}
html[data-theme="light"] .dl-wallet-card{background:linear-gradient(135deg,#fff3cb,#ffffff 60%,#ffeab0);box-shadow:0 8px 22px rgba(120,90,10,.18)}
html[data-theme="light"] .dl-wallet-card::before{background:repeating-linear-gradient(135deg,rgba(190,140,20,.07) 0 2px,transparent 2px 14px)}
html[data-theme="light"] .dl-wc-amount{color:#33250b}
html[data-theme="light"] .dl-wc-amount small,html[data-theme="light"] .dl-btn-ghost{color:#8a620c}
html[data-theme="light"] .dl-wc-sub,html[data-theme="light"] .dl-wc-eq{color:#6b5527}
html[data-theme="light"] .dl-wc-sub b{color:#33250b}
html[data-theme="light"] .dl-btn-ghost{border-color:#d6ad46}
html[data-theme="light"] .dl-quick button{background:#fff;color:#5b4a1e;border-color:#dfbd67}

/* ---------- PEDIDOS: resumen, pestanas y filtros ---------- */
.dl-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:.9rem}
.dl-stat{background:#100d07;border:1px solid rgba(255,211,85,.55);border-radius:16px;padding:11px 4px;text-align:center}
.dl-stat i{color:#ffd45a;font-size:1rem}
.dl-stat b{display:block;font-size:1.3rem;font-weight:900;color:#fff3c4;margin-top:3px}
.dl-stat span{font-size:.62rem;color:#e8d08a;font-weight:700}
.dl-tabs2{display:flex;gap:6px;padding:4px;border:1px solid rgba(255,211,85,.5);border-radius:14px;background:#100d07;margin-bottom:.75rem}
.dl-tabs2 button{flex:1;padding:.55rem;border:0;border-radius:10px;background:transparent;color:#e8d08a;font-weight:800;font-size:.8rem;cursor:pointer}
.dl-tabs2 button.on{background:linear-gradient(120deg,#fff0a6,#ffd45a 50%,#d69b19);color:#211600}
.dl-fpills{display:flex;gap:6px;overflow-x:auto;margin-bottom:.9rem;padding-bottom:2px}
.dl-fpills .dl-pill{flex:none}
.dl-ord-ico{
  width:34px;height:34px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#fff0a6,#d69b19);color:#1a1204;font-size:.9rem;margin-right:10px;
}
html[data-theme="light"] .dl-stat,html[data-theme="light"] .dl-tabs2{background:#fff;border-color:#dfbd67}
html[data-theme="light"] .dl-stat b{color:#33250b}
html[data-theme="light"] .dl-stat span,html[data-theme="light"] .dl-tabs2 button{color:#6b5527}
html[data-theme="light"] .dl-tabs2 button.on{color:#211600}

/* ---------- PERFIL: carnet de jugador ---------- */
.dl-id-card{
  position:relative;overflow:hidden;border-radius:20px;padding:14px;margin-bottom:.9rem;
  border:1px solid rgba(255,211,85,.85);
  background:linear-gradient(135deg,#2e2109,#0f0b05 60%,#241a07);
  box-shadow:0 8px 22px rgba(0,0,0,.6),0 0 16px rgba(255,205,65,.2);
}
.dl-id-card::after{
  content:"";position:absolute;right:-40px;bottom:-40px;width:190px;height:190px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,211,85,.22),transparent 65%);pointer-events:none;
}
.dl-id-top{display:flex;justify-content:space-between;align-items:center;font-size:.66rem;font-weight:900;letter-spacing:1.6px;color:#ffd45a;position:relative;z-index:1}
.dl-id-brand{display:flex;align-items:center;gap:7px}
.dl-sim{
  width:38px;height:27px;border-radius:7px;border:1px solid #fff3b0;position:relative;
  background:linear-gradient(135deg,#fff0a6,#d69b19);box-shadow:0 2px 8px rgba(255,195,45,.4);
}
.dl-sim::before,.dl-sim::after{content:"";position:absolute;background:rgba(120,80,5,.55)}
.dl-sim::before{left:0;right:0;top:50%;height:1px}
.dl-sim::after{top:0;bottom:0;left:50%;width:1px}
.dl-id-body{display:flex;align-items:center;gap:12px;margin:14px 0;position:relative;z-index:1}
.dl-ava{
  width:78px;height:78px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;
  font-size:36px;font-weight:900;color:#1a1204;background:linear-gradient(135deg,#ffd76a,#b8860b);border:3px solid #fff3b0;
}
.dl-id-who{min-width:0}
.dl-id-name{font-size:1.25rem;font-weight:900;color:#fff3c4;word-break:break-word}
.dl-id-mail{font-size:.72rem;color:#e8d08a;word-break:break-all;margin-top:2px}
.dl-badge{
  display:inline-flex;gap:5px;align-items:center;margin-top:7px;font-size:.62rem;font-weight:900;color:#1a1204;
  background:linear-gradient(120deg,#fff0a6,#ffd45a);padding:3px 9px;border-radius:10px;
}
.dl-id-stats{
  display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:rgba(0,0,0,.38);
  border:1px solid rgba(255,211,85,.4);border-radius:14px;padding:9px 4px;text-align:center;position:relative;z-index:1;
}
.dl-id-stats i{color:#ffd45a;font-size:.85rem}
.dl-id-stats b{display:block;font-size:1.05rem;color:#fff3c4;margin-top:2px}
.dl-id-stats span{font-size:.6rem;color:#e8d08a;font-weight:700}
.dl-barcode{margin-top:13px;height:34px;color:#ffd45a;position:relative;z-index:1}
.dl-barcode svg{width:100%;height:100%;display:block}
.dl-id-code{text-align:right;font-size:.66rem;letter-spacing:2px;color:#e8d08a;margin-top:5px;font-weight:800;position:relative;z-index:1}
.dl-avatars{margin-bottom:.6rem;border:1px solid rgba(255,211,85,.45);border-radius:14px;padding:10px 12px}
.dl-avatars summary{cursor:pointer;font-weight:800;font-size:.8rem;color:#ffd45a;list-style:none}
.dl-avatars summary::-webkit-details-marker{display:none}
html[data-theme="light"] .dl-id-card{background:linear-gradient(135deg,#fff3cb,#ffffff 60%,#ffeab0);box-shadow:0 8px 22px rgba(120,90,10,.18)}
html[data-theme="light"] .dl-id-top,html[data-theme="light"] .dl-id-stats i,html[data-theme="light"] .dl-avatars summary{color:#8a620c}
html[data-theme="light"] .dl-id-name,html[data-theme="light"] .dl-id-stats b{color:#33250b}
html[data-theme="light"] .dl-id-mail,html[data-theme="light"] .dl-id-stats span,html[data-theme="light"] .dl-id-code{color:#6b5527}
html[data-theme="light"] .dl-id-stats{background:rgba(255,255,255,.75);border-color:#dfbd67}
html[data-theme="light"] .dl-barcode{color:#8a620c}

/* ---------- ASISTENTE IA: foto de la pluma dorada ---------- */
#guia-btn{
  background:#100d07 url(guia-ia.png) center/cover no-repeat!important;
  border:2px solid #ffd45a!important;font-size:0!important;color:transparent!important;
  width:58px!important;height:58px!important;
  box-shadow:0 6px 18px rgba(0,0,0,.6),0 0 16px rgba(255,205,65,.6)!important;
}
#guia-btn i{display:none!important}
.dl-ai-ava{width:28px;height:28px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;border:1px solid #ffd45a;box-shadow:0 0 8px rgba(255,205,65,.6)}

/* ---------- ACCESIBILIDAD ---------- */
@media(prefers-reduced-motion:reduce){
  #dl-sparkles span,.dl-wc-emblem{animation:none!important}
  .dl-track{transition:none!important}
}
`;

// ---------- JS de las decoraciones (corre cuando ya cargaron paquetes.js y fotos.js) ----------
function dlInit() {
  const safe = (n, f) => { try { f(); } catch (e) { console.error('Decoracion ' + n + ':', e); } };
  safe('destellos', dlSparkles);
  safe('promos', dlPromo);
  safe('juegos', dlGamesBar);
  safe('wallet', dlWalletCard);
  safe('navegacion', dlNavActive);
  safe('ia', dlAiSkin);
}
if (document.readyState === 'complete') dlInit(); else window.addEventListener('load', dlInit);

// destellos dorados flotando al fondo
function dlSparkles() {
  if (document.getElementById('dl-sparkles')) return;
  const w = document.createElement('div');
  w.id = 'dl-sparkles';
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('span');
    s.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;animation-delay:${(Math.random() * 6).toFixed(2)}s;animation-duration:${(3 + Math.random() * 4).toFixed(2)}s;--sz:${(2 + Math.random() * 3).toFixed(1)}px`;
    w.appendChild(s);
  }
  document.body.appendChild(w);
}

// banner de promos (solo mensajes verdaderos de la tienda)
function dlPromo() {
  const home = document.getElementById('sec-home');
  const banner = home && home.querySelector('.store-banner-img');
  if (!banner || document.getElementById('dl-promo')) return;
  const slides = [
    ['fa-coins', '1 DLC = 1 USDT = 320 saldo', 'Una sola moneda para todas tus recargas.', 'Depositar', () => switchMainTab('wallet')],
    ['fa-gift', 'Gana 4% en DLC', 'Invita a tus amigos y cobra por cada depósito que hagan.', 'Mi link', () => switchMainTab('perfil')],
    ['fa-bolt', 'Depósito USDT automático', 'Paga por la red BEP20 y se acredita solo.', 'Depositar USDT', () => { switchMainTab('wallet'); openUsdtDeposit(); }],
  ];
  const el = document.createElement('div');
  el.id = 'dl-promo'; el.className = 'dl-promo';
  el.innerHTML = `<div class="dl-track">${slides.map((s, i) => `
    <div class="dl-slide"><div class="dl-slide-ico"><i class="fa-solid ${s[0]}"></i></div>
    <div class="dl-slide-txt"><h5>${s[1]}</h5><p>${s[2]}</p><button data-i="${i}">${s[3]}</button></div></div>`).join('')}</div>
    <div class="dl-dots">${slides.map((_, i) => `<i data-d="${i}"></i>`).join('')}</div>`;
  banner.insertAdjacentElement('afterend', el);
  const track = el.querySelector('.dl-track'), dots = [...el.querySelectorAll('.dl-dots i')];
  let cur = 0, timer;
  const go = n => { cur = (n + slides.length) % slides.length; track.style.transform = `translateX(-${cur * 100}%)`; dots.forEach((d, i) => d.classList.toggle('on', i === cur)); };
  const start = () => { clearInterval(timer); timer = setInterval(() => { if (!document.hidden) go(cur + 1); }, 4500); };
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'), d = e.target.closest('i[data-d]');
    if (b) slides[+b.dataset.i][4]();
    else if (d) { go(+d.dataset.d); start(); }
  });
  go(0); start();
}

// buscador, pestañas Todos/Favoritos, estrella y esquinas doradas en los carteles
const dlFavKey = () => 'dl_fav_' + (currentUser || 'anon');
const dlGetFavs = () => { try { return JSON.parse(localStorage.getItem(dlFavKey()) || '[]'); } catch { return []; } };
const dlNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
let dlGameFilter = 'all';

function dlGamesBar() {
  const home = document.getElementById('sec-home');
  const grid = home && home.querySelector('.games-grid');
  if (!grid || document.getElementById('dl-games-bar')) return;
  const old = [...home.querySelectorAll('.section-title')].find(t => /JUEGOS/i.test(t.textContent));
  if (old) old.style.display = 'none';

  const bar = document.createElement('div');
  bar.id = 'dl-games-bar';
  bar.innerHTML = `
    <div class="dl-search"><i class="fa-solid fa-magnifying-glass"></i><input id="dl-search" type="search" placeholder="Buscar un juego..." autocomplete="off"></div>
    <div class="dl-gh">
      <div class="dl-gh-title"><span class="dl-bar"></span>Juegos <span class="dl-count" id="dl-count">0</span></div>
      <div class="dl-pills"><button class="dl-pill on" data-f="all">Todos</button><button class="dl-pill" data-f="fav">Favoritos</button></div>
    </div>`;
  grid.parentNode.insertBefore(bar, grid);
  const empty = document.createElement('div');
  empty.id = 'dl-games-empty'; empty.className = 'dl-empty'; empty.style.display = 'none';
  empty.innerHTML = '<i class="fa-regular fa-star"></i>No hay juegos que coincidan.';
  grid.parentNode.insertBefore(empty, grid.nextSibling);

  grid.querySelectorAll('.game-poster').forEach(p => {
    const name = (p.querySelector('.game-poster-name') || {}).textContent || '';
    p.dataset.game = name.trim();
    const brk = document.createElement('i'); brk.className = 'dl-brk';
    const fav = document.createElement('button'); fav.className = 'dl-fav'; fav.title = 'Favorito';
    fav.innerHTML = '<i class="fa-solid fa-star"></i>';
    fav.addEventListener('click', e => {
      e.stopPropagation();
      const favs = dlGetFavs(), g = p.dataset.game, i = favs.indexOf(g);
      if (i >= 0) favs.splice(i, 1); else favs.push(g);
      try { localStorage.setItem(dlFavKey(), JSON.stringify(favs)); } catch { }
      dlRefreshGames();
    });
    p.appendChild(brk); p.appendChild(fav);
  });

  bar.querySelector('#dl-search').addEventListener('input', dlRefreshGames);
  bar.querySelector('.dl-pills').addEventListener('click', e => {
    const b = e.target.closest('button[data-f]'); if (!b) return;
    dlGameFilter = b.dataset.f;
    bar.querySelectorAll('.dl-pill').forEach(x => x.classList.toggle('on', x === b));
    dlRefreshGames();
  });
  dlRefreshGames();
}

function dlRefreshGames() {
  const grid = document.querySelector('#sec-home .games-grid');
  if (!grid) return;
  const q = dlNorm((document.getElementById('dl-search') || {}).value || '').trim();
  const favs = dlGetFavs();
  let n = 0;
  grid.querySelectorAll('.game-poster').forEach(p => {
    const g = p.dataset.game || '';
    const isFav = favs.includes(g);
    const star = p.querySelector('.dl-fav'); if (star) star.classList.toggle('on', isFav);
    const ok = dlNorm(g).includes(q) && (dlGameFilter === 'all' || isFav);
    p.style.display = ok ? '' : 'none';
    if (ok) n++;
  });
  const c = document.getElementById('dl-count'); if (c) c.textContent = n;
  const e = document.getElementById('dl-games-empty'); if (e) e.style.display = n ? 'none' : '';
}

// tarjeta de saldo y accesos rapidos en Wallet
function dlWalletCard() {
  const sec = document.getElementById('sec-wallet');
  if (!sec || document.getElementById('dl-wallet-card')) return;
  const card = document.createElement('div');
  card.id = 'dl-wallet-card'; card.className = 'dl-wallet-card';
  card.innerHTML = `
    <div class="dl-wc-top"><span class="dl-chip"><i class="fa-solid fa-shield-halved"></i> Saldo disponible</span><span class="dl-wc-eq">1 DLC = 1 USDT</span></div>
    <div class="dl-wc-main">
      <div><div class="dl-wc-amount"><span id="dl-wc-dlc">0.00</span><small>DLC</small></div>
      <div class="dl-wc-sub">≈ <b id="dl-wc-usdt">0.00</b> USDT · <b id="dl-wc-saldo">0</b> saldo móvil</div></div>
      <img class="dl-wc-emblem" src="dlc.png" alt="DLC" onerror="this.style.display='none'">
    </div>
    <div class="dl-wc-actions"><button class="btn-main" data-a="usdt"><i class="fa-solid fa-plus"></i> Depositar USDT</button><button class="dl-btn-ghost" data-a="saldo">Depositar saldo</button></div>`;
  const quick = document.createElement('div');
  quick.className = 'dl-quick';
  quick.innerHTML = `
    <button data-a="orders"><i class="fa-solid fa-receipt"></i>Mis pedidos</button>
    <button data-a="invite"><i class="fa-solid fa-gift"></i>Invitar</button>
    <button data-a="help"><i class="fa-solid fa-headset"></i>Soporte</button>`;
  sec.insertBefore(quick, sec.firstChild);
  sec.insertBefore(card, sec.firstChild);
  const act = {
    usdt: () => openUsdtDeposit(), saldo: () => openSaldoDeposit(),
    orders: () => switchMainTab('orders'), invite: () => switchMainTab('perfil'),
    help: () => { if (typeof abrirSoporte === 'function') abrirSoporte(); else showNotification('Soporte disponible muy pronto.'); },
  };
  [card, quick].forEach(box => box.addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b) act[b.dataset.a](); }));

  const refresh = () => {
    const v = Number((typeof cachedUserData !== 'undefined' && cachedUserData && cachedUserData.dlc) || 0);
    document.getElementById('dl-wc-dlc').textContent = v.toFixed(2);
    document.getElementById('dl-wc-usdt').textContent = v.toFixed(2);
    document.getElementById('dl-wc-saldo').textContent = Math.round(v * 320);
  };
  const _ub = updateUIBalances;
  updateUIBalances = function () { _ub(); refresh(); };
  refresh();
}

// la pestana activa de la barra de abajo sigue a la pantalla en que estas
function dlNavActive() {
  const tabOf = b => b.dataset.sec || ((b.getAttribute('onclick') || '').match(/switchMainTab\('([\w-]+)'\)/) || [])[1] || (b.id === 'ceo-nav-btn' ? 'ceo' : null);
  const parent = { recargas: 'home', bloodstrike: 'home', cod: 'home', arenabreakout: 'home', deltaforce: 'home', 'saldo-detail': 'wallet', 'usdt-detail': 'wallet' };
  const mark = s => {
    const t = parent[s] || s;
    document.querySelectorAll('.app-bottom-nav .nav-item-btn').forEach(b => b.classList.toggle('active', tabOf(b) === t));
  };
  const _sw = switchMainTab;
  switchMainTab = function (s) { _sw(s); mark(s); if (s === 'home') dlRefreshGames(); };
  mark('home');
}

// foto de la pluma dorada en el encabezado del chat de la IA
function dlAiSkin() {
  const apply = () => {
    const head = document.querySelector('#guia-panel .g-head > div');
    if (!head || head.dataset.skin) return !!head;
    head.dataset.skin = '1';
    head.innerHTML = '<img class="dl-ai-ava" src="guia-ia.png" alt=""> Guía Diamons Legión';
    return true;
  };
  if (apply()) return;
  const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
  mo.observe(document.body, { childList: true });
}
