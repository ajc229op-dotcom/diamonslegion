// ===== Imagenes de monedas e iconos =====
const FALLBACK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4 58 24 32 60 6 24Z" fill="#ffc531"/><path d="M6 24h52M20 24l12-20 12 20-12 36z" fill="none" stroke="#1a1204" stroke-width="2"/></svg>');
const DLC_ICON = 'dlc.png', USDT_ICON = 'usdt.png', BS_ICON = 'bs-oro.png';

const st = document.createElement('style');
st.textContent = `
.pk{position:relative;display:flex;align-items:center;gap:8px;background:linear-gradient(145deg,#1b150a,#0d0a04);border:2px solid var(--border-color);border-radius:18px;padding:1.1rem .6rem .7rem;cursor:pointer;min-height:100px;transition:.3s}
.pk.selected,.pk:hover{border-color:var(--primary-neon);background:#2b2110;box-shadow:var(--neon-glow)}
.pk img{width:46px;height:46px;object-fit:contain;flex:none}
.pk b{display:block;font-family:Orbitron,sans-serif;font-size:.95rem}
.pk small{display:block;color:var(--text-muted);font-size:.7rem;font-weight:700}
.pk em{display:inline-block;margin-top:4px;font-style:normal;font-weight:900;font-size:.72rem;padding:4px 8px;border-radius:14px;border:1.5px solid var(--primary-neon);color:var(--primary-neon)}
.pk i{position:absolute;top:-1px;left:10px;font-style:normal;font-size:.55rem;font-weight:900;padding:1px 8px;border-radius:0 0 8px 8px;background:linear-gradient(90deg,#ff007f,#ffb703);color:#000}
.dlc-pill{display:inline-flex;align-items:center;gap:5px}
.dlc-pill img{width:18px;height:18px;object-fit:contain}
.usdt-banner{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#0d3b2e,#0a1f18);border:2px solid #26A17B;border-radius:16px;padding:.8rem 1rem;margin-bottom:1rem;box-shadow:0 0 16px rgba(38,161,123,.35)}
.usdt-banner img{width:50px;height:50px;object-fit:contain;flex:none}
.usdt-banner b{display:block;color:#fff;font-family:Orbitron,sans-serif;font-size:.95rem}
.usdt-banner small{color:#9be8cf;font-weight:700;font-size:.7rem}
.bs-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 1rem}
.bs-tabs .pay-tab-btn{margin:0}
.pk-agotado{opacity:.45;cursor:not-allowed;filter:grayscale(.6)}
.pk-agotado i{background:linear-gradient(90deg,#555,#333)!important;color:#fff!important}
.coming-badge{position:absolute;top:14px;left:14px;background:linear-gradient(135deg,#ffd76a,#b8860b);color:#1a1204;font-weight:900;font-size:.72rem;padding:6px 12px;border-radius:12px;letter-spacing:.5px;box-shadow:0 3px 8px rgba(0,0,0,.5)}
#ceo-rows{display:flex;flex-direction:column;gap:10px}
.ceo-row{background:#0d0a04;border:1.5px solid var(--border-color);border-radius:14px;padding:.8rem}
.ceo-row b{display:block;font-size:.85rem;margin-bottom:6px}
.ceo-row .ceo-line{display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap}
.ceo-row input[type=number],.ceo-row input[type=text]{flex:1;min-width:120px;background:#1b150a;border:1.5px solid var(--border-color);border-radius:10px;color:#fff;padding:.5rem .7rem;font-size:.82rem}
.ceo-row label{display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--text-muted);white-space:nowrap}
.ceo-row button{background:linear-gradient(135deg,#ffd76a,#b8860b);border:none;color:#1a1204;border-radius:10px;padding:.5rem .9rem;font-weight:900;font-size:.78rem;cursor:pointer}`;
document.head.appendChild(st);

// ===== Overrides del panel CEO (precio / agotado / foto), vienen del servidor =====
let PKG_OV = {};
const _luc = loadUserDataFromCloud;
loadUserDataFromCloud = async function () { await _luc(); loadPackageOverrides(); };
async function loadPackageOverrides() {
  try {
    const d = await api('/api/packages');
    if (!d.success) return;
    PKG_OV = {};
    d.packages.forEach(p => PKG_OV[p.id] = p);
    renderFreeFire(); renderBs();
    if (isAdmin) renderCeoPanel();
  } catch { }
}

let selectedId = null;
const fmt = p => p.toFixed(2) + ' <span class="dlc-pill"><img src="' + DLC_ICON + '">DLC</span>';
const usdtBanner = () => `<div class="usdt-banner"><img src="${USDT_ICON}" onerror="this.style.display='none'"><div><b>USDT · Red BEP20 (BSC)</b><small>1 USDT = 1 DLC · depósito automático</small></div></div>`;

// ===== Billetera DLC: reemplaza las pastillas de saldo/USDT y las secciones de deposito =====
(function () {
  document.querySelector('.nav-wallet-pills').insertAdjacentHTML('afterbegin',
    `<div class="wallet-pill-top" onclick="switchMainTab('wallet')" title="DLC"><img src="${DLC_ICON}" style="width:18px;height:18px;object-fit:contain" onerror="this.outerHTML='💎'"><span id="dlc-balance-display">0.00</span></div>`);
  document.getElementById('usdt-balance-display').closest('.wallet-pill-top').remove();
  document.getElementById('saldo-balance-display').closest('.wallet-pill-top').remove();

  const walletSec = document.getElementById('sec-wallet');
  walletSec.querySelector('.wallet-card-option[onclick="openSaldoDeposit()"]').outerHTML =
    `<div class="wallet-card-option" onclick="openSaldoDeposit()"><div class="wallet-card-left"><div class="saldo-icon-box"><i class="fa-solid fa-mobile-screen"></i></div><div class="wallet-info"><h4>Saldo Móvil → DLC</h4><p>Depósito al # 58151457 (320 saldo = 1 DLC)</p></div></div><i class="fa-solid fa-chevron-right" style="color:var(--primary-neon)"></i></div>`;
  walletSec.querySelector('.wallet-card-option[onclick="openUsdtDeposit()"]').outerHTML =
    `<div class="wallet-card-option" onclick="openUsdtDeposit()"><div class="wallet-card-left"><img src="${USDT_ICON}" style="width:45px;height:45px;object-fit:contain" onerror="this.outerHTML='<div class=&quot;usdt-real-icon&quot;></div>'"><div class="wallet-info"><h4>USDT BEP20 → DLC</h4><p>Red Binance Smart Chain (1 USDT = 1 DLC)</p></div></div><i class="fa-solid fa-chevron-right" style="color:var(--primary-neon)"></i></div>`;

  document.getElementById('sec-usdt-detail').querySelector('.wallet-box-detail').insertAdjacentHTML('afterbegin', usdtBanner());
  const l = document.querySelector('#sec-usdt-detail label[for], #sec-usdt-detail .form-group label');
})();

function updateUIBalances() {
  const el = document.getElementById('dlc-balance-display');
  if (el) el.innerText = (cachedUserData.dlc ?? 0).toFixed(2);
}

// ===== Free Fire: paquetes en DLC =====
const PAQ_FF = [[110, 0.78, 'u1'], [341, 2.34, 'u2'], [572, 3.96, 'u3'], [1166, 7.36, 'u4'], [2398, 14.60, 'u5'], [6160, 36.85, 'u6']];
(function () {
  // oculta los tabs y containers viejos de saldo/usdt, deja uno solo en DLC
  document.getElementById('btn-method-saldo')?.closest('.payment-methods-tabs')?.remove();
  document.getElementById('packages-saldo-container').remove();
  [...document.querySelectorAll('#sec-recargas .section-title')].forEach(t => { if (/M[ÉE]TODO/i.test(t.textContent)) t.remove(); });
  document.querySelectorAll('#sec-recargas .payment-methods-tabs').forEach(t => t.remove());
  const usdtCont = document.getElementById('packages-usdt-container');
  usdtCont.classList.remove('hidden');
  usdtCont.querySelector('.section-title').textContent = 'PAQUETES — FREE FIRE LATAM';
  renderFreeFire();
})();
function renderFreeFire() {
  const grid = document.querySelector('#packages-usdt-container .diamonds-grid');
  grid.innerHTML = PAQ_FF.map(([d, p, id], i) => {
    const ov = PKG_OV[id] || {};
    const price = ov.price ?? p, img = ov.image || `d${i + 1}.png`, out = !!ov.soldOut;
    return `<div class="pk${out ? ' pk-agotado' : ''}" ${out ? '' : `onclick="pickPkg(this,'${id}',${price})"`}><i>${out ? 'AGOTADO' : 'OFERTA'}</i><img src="${img}" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${d}</b><small>Diamantes</small><em>${fmt(price)}</em></div></div>`;
  }).join('');
}

function pickPkg(el, id, price) {
  document.querySelectorAll('.pk').forEach(x => x.classList.remove('selected'));
  el.classList.add('selected');
  selectedId = id; selectedPkg = id; selectedPrice = price; selectedCurrency = 'dlc';
}

async function submitOrder() {
  const playerId = document.getElementById('player-id-input').value.trim();
  if (!/^\d{5,15}$/.test(playerId) || !selectedId) { showNotification('Ingresa un ID válido (solo números) y elige un paquete.'); return; }
  try {
    const d = await api('/api/order', { pkg: selectedId, playerId });
    if (d.success) { showNotification('Compra enviada. Estamos procesando tu recarga.'); switchMainTab('orders'); loadOrdersFromCloud(); loadUserDataFromCloud(); }
    else showNotification(d.message || 'Error al procesar.');
  } catch { showNotification('Error de red.'); }
}

// ===== Blood Strike: solo ofertas de oro (pago en DLC) =====
const BS_PAQ = [[51, 0.47, 'bu1'], [105, 0.83, 'bu2'], [320, 2.61, 'bu3'], [540, 4.28, 'bu4'], [1100, 8.69, 'bu5'], [2260, 17.28, 'bu6'], [5800, 43.03, 'bu7']];
(function () {
  const sec = document.createElement('div');
  sec.id = 'sec-bloodstrike'; sec.className = 'vista-sec hidden';
  sec.innerHTML = `<button onclick="switchMainTab('home')" style="background:none;border:none;color:var(--primary-neon);font-weight:800;font-size:.82rem;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-arrow-left"></i> Volver a Inicio</button>
  <div class="game-poster" style="aspect-ratio:2.2/1;cursor:default;background-image:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.85) 100%),url('bloodstrike.jpg')"><div class="game-poster-name" style="font-size:1.05rem">BLOOD STRIKE</div></div>
  <div class="top-recharge-showcase" style="border-radius:18px;padding:1rem;margin:1rem 0;border:2px solid var(--border-color)"><div class="form-group" style="margin-bottom:0"><label>PLAYER ID (solo números)</label><input type="number" id="bs-player-id" class="form-control" placeholder="Ej. 123456789" style="text-align:center;font-weight:bold"></div></div>
  <div id="bs-packages"></div>`;
  document.querySelector('#main-app .container').appendChild(sec);
  renderBs();
})();
function renderBs() {
  const rows = BS_PAQ.map(([q, p, id]) => {
    const ov = PKG_OV[id] || {};
    const price = ov.price ?? p, img = ov.image || BS_ICON, out = !!ov.soldOut;
    return `<div class="pk${out ? ' pk-agotado' : ''}" ${out ? '' : `onclick="pickPkg(this,'${id}',${price})"`}>${out ? '<i>AGOTADO</i>' : ''}<img src="${img}" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${q}</b><small>Oro</small><em>${fmt(price)}</em></div></div>`;
  }).join('');
  document.getElementById('bs-packages').innerHTML =
    `<div class="section-title">OFERTAS DE ORO</div><div class="diamonds-grid">${rows}</div><button onclick="submitBsOrder()" class="btn-main">COMPLETAR RECARGA</button>`;
}
async function submitBsOrder() {
  const playerId = document.getElementById('bs-player-id').value.trim();
  if (!/^\d{5,15}$/.test(playerId) || !selectedId) { showNotification('Ingresa un ID válido (solo números) y elige un paquete.'); return; }
  try {
    const d = await api('/api/order', { pkg: selectedId, playerId });
    if (d.success) { showNotification('Compra enviada. Estamos procesando tu recarga.'); switchMainTab('orders'); loadOrdersFromCloud(); loadUserDataFromCloud(); }
    else showNotification(d.message || 'Error al procesar.');
  } catch { showNotification('Error de red.'); }
}

// ===== Juegos en Inicio =====
const GAMES = [
  ['freefire.jpg', 'FREE FIRE LATAM', 'recargas'],
  ['bloodstrike.jpg', 'BLOOD STRIKE', 'bloodstrike'],
  ['callofduty.jpg', 'CALL OF DUTY', 'cod'],
  ['arenabreakout.jpg', 'ARENA BREAKOUT', 'arenabreakout'],
  ['deltaforce.jpg', 'DELTA FORCE', 'deltaforce'],
];
(function () {
  const old = document.querySelector('.game-banner-card');
  if (old) { old.style.display = 'none'; const h = old.querySelector('h4'); if (h) h.textContent = 'FREE FIRE LATAM'; }
  // quita el boton "Recargar" del menu de abajo: ya se entra a cada juego desde sus tarjetas en Inicio
  [...document.querySelectorAll('.app-bottom-nav .nav-item-btn')].forEach(b => { if (/RECARGAR/i.test(b.textContent)) b.remove(); });
  const grid = document.createElement('div');
  grid.className = 'games-grid';
  grid.innerHTML = GAMES.map(([img, name, go]) =>
    `<div class="game-poster" onclick="switchMainTab('${go}')" style="background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.85) 100%),url('${img}')"><div class="game-poster-name">${name}</div><div class="game-poster-btn">Seleccionar</div></div>`).join('');
  document.getElementById('sec-home').appendChild(grid);
})();

// Pantallas con paquetes reales: Call of Duty (CP) y Arena Breakout (Bonds)
const GAME_PKGS = {
  cod: { icon: 'cp.png', label: 'CP', pkgs: [[115, 2.00, 'cod1'], [253, 3.02, 'cod2'], [529, 5.16, 'cod3'], [794, 8.25, 'cod4'], [1053, 10.34, 'cod5'], [1323, 13.41, 'cod6']] },
  arenabreakout: { icon: 'bonds.png', label: 'Bonds', pkgs: [[66, 0.92, 'ab1'], [335, 4.63, 'ab2'], [675, 9.29, 'ab3'], [1690, 23.20, 'ab4'], [3400, 46.47, 'ab5'], [6820, 92.79, 'ab6']] },
};
(function () {
  Object.entries(GAME_PKGS).forEach(([go, cfg]) => {
    const [img, name] = GAMES.find(g => g[2] === go);
    const sec = document.createElement('div');
    sec.id = 'sec-' + go; sec.className = 'vista-sec hidden';
    sec.innerHTML = `<button onclick="switchMainTab('home')" style="background:none;border:none;color:var(--primary-neon);font-weight:800;font-size:.82rem;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-arrow-left"></i> Volver a Inicio</button>
    <div class="game-poster" style="aspect-ratio:2.2/1;cursor:default;background-image:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.85) 100%),url('${img}')"><div class="game-poster-name" style="font-size:1.05rem">${name}</div></div>
    <div class="top-recharge-showcase" style="border-radius:18px;padding:1rem;margin:1rem 0;border:2px solid var(--border-color)"><div class="form-group" style="margin-bottom:0"><label>PLAYER ID (solo números)</label><input type="number" id="${go}-player-id" class="form-control" placeholder="Ej. 123456789" style="text-align:center;font-weight:bold"></div></div>
    <div id="${go}-packages"></div>`;
    document.querySelector('#main-app .container').appendChild(sec);
    renderGamePkgs(go);
  });
})();
function renderGamePkgs(go) {
  const cfg = GAME_PKGS[go];
  const rows = cfg.pkgs.map(([q, p, id]) => {
    const ov = PKG_OV[id] || {};
    const price = ov.price ?? p, img = ov.image || cfg.icon, out = !!ov.soldOut;
    return `<div class="pk${out ? ' pk-agotado' : ''}" ${out ? '' : `onclick="pickPkg(this,'${id}',${price})"`}>${out ? '<i>AGOTADO</i>' : ''}<img src="${img}" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${q}</b><small>${cfg.label}</small><em>${fmt(price)}</em></div></div>`;
  }).join('');
  document.getElementById(go + '-packages').innerHTML =
    `<div class="section-title">OFERTAS DE ${cfg.label.toUpperCase()}</div><div class="diamonds-grid">${rows}</div><button onclick="submitGameOrder('${go}')" class="btn-main">COMPLETAR RECARGA</button>`;
}
async function submitGameOrder(go) {
  const playerId = document.getElementById(go + '-player-id').value.trim();
  if (!/^\d{5,15}$/.test(playerId) || !selectedId) { showNotification('Ingresa un ID válido (solo números) y elige un paquete.'); return; }
  try {
    const d = await api('/api/order', { pkg: selectedId, playerId });
    if (d.success) { showNotification('Compra enviada. Estamos procesando tu recarga.'); switchMainTab('orders'); loadOrdersFromCloud(); loadUserDataFromCloud(); }
    else showNotification(d.message || 'Error al procesar.');
  } catch { showNotification('Error de red.'); }
}

// Delta Force: aun sin paquetes -> pantalla "Proximamente"
(function () {
  const [img, name] = GAMES.find(g => g[2] === 'deltaforce');
  const sec = document.createElement('div');
  sec.id = 'sec-deltaforce'; sec.className = 'vista-sec hidden';
  sec.innerHTML = `<button onclick="switchMainTab('home')" style="background:none;border:none;color:var(--primary-neon);font-weight:800;font-size:.82rem;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-arrow-left"></i> Volver a Inicio</button>
  <div class="game-poster" style="aspect-ratio:1.6/1;cursor:default;background-image:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.85) 100%),url('${img}')"><div class="coming-badge">PRÓXIMAMENTE</div><div class="game-poster-name" style="font-size:1.05rem">${name}</div></div>
  <p style="text-align:center;color:var(--text-muted);font-weight:700;padding:1.2rem">Los paquetes y precios de ${name} se publicarán muy pronto.</p>`;
  document.querySelector('#main-app .container').appendChild(sec);
})();

// ===== Panel CEO: precio, agotado y foto por paquete (solo para is_admin) =====
(function () {
  const nb = document.createElement('button');
  nb.className = 'nav-item-btn hidden'; nb.id = 'ceo-nav-btn';
  nb.onclick = () => switchMainTab('ceo');
  nb.innerHTML = '<i class="fa-solid fa-crown"></i> CEO';
  document.querySelector('.app-bottom-nav').appendChild(nb);

  const sec = document.createElement('div');
  sec.id = 'sec-ceo'; sec.className = 'vista-sec hidden';
  sec.innerHTML = '<div class="section-title">PANEL CEO · PAQUETES</div><p style="font-size:.75rem;color:var(--text-muted);text-align:center;margin-bottom:.8rem">Cambia el precio (en DLC), marca agotado o pon una foto (nombre de archivo subido al repositorio, o un link https://).</p><div id="ceo-rows">Cargando...</div>';
  document.querySelector('#main-app .container').appendChild(sec);
})();

const _ckAdmin = checkAdminRights;
checkAdminRights = function () {
  _ckAdmin();
  document.getElementById('ceo-nav-btn').classList.toggle('hidden', !isAdmin);
  if (isAdmin) renderCeoPanel();
};

function renderCeoPanel() {
  const box = document.getElementById('ceo-rows');
  if (!box) return;
  const list = Object.values(PKG_OV);
  if (!list.length) { box.innerHTML = 'Cargando...'; return; }
  const porJuego = {};
  list.forEach(p => { (porJuego[p.game] = porJuego[p.game] || []).push(p); });
  box.innerHTML = Object.entries(porJuego).map(([game, pkgs]) => `
    <div class="section-title" style="margin-top:.4rem">${game.toUpperCase()}</div>
    ${pkgs.map(p => `
      <div class="ceo-row" id="ceo-${p.id}">
        <b>${p.name}</b>
        <div class="ceo-line">
          <label>Precio DLC <input type="number" step="0.01" id="ceo-price-${p.id}" value="${p.price}"></label>
          <label><input type="checkbox" id="ceo-sold-${p.id}" ${p.soldOut ? 'checked' : ''}> Agotado</label>
        </div>
        <div class="ceo-line">
          <input type="text" id="ceo-img-${p.id}" placeholder="foto: nombre de archivo o link https://" value="${p.image ? esc(p.image) : ''}">
        </div>
        <div class="ceo-line">
          <input type="text" id="ceo-sku-${p.id}" placeholder="SKU del proveedor (G2Bulk)" value="${p.providerSku ? esc(p.providerSku) : ''}">
          <label><input type="checkbox" id="ceo-auto-${p.id}" ${p.auto ? 'checked' : ''}> Entrega automática</label>
        </div>
        <div class="ceo-line">
          <button onclick="guardarCeoPkg('${p.id}')">Guardar</button>
        </div>
      </div>`).join('')}`).join('');
}

async function guardarCeoPkg(id) {
  const price = parseFloat(document.getElementById('ceo-price-' + id).value);
  const soldOut = document.getElementById('ceo-sold-' + id).checked;
  const image = document.getElementById('ceo-img-' + id).value.trim();
  const providerSku = document.getElementById('ceo-sku-' + id).value.trim();
  const auto = document.getElementById('ceo-auto-' + id).checked;
  if (!(price > 0)) { showNotification('Precio inválido.'); return; }
  try {
    const d = await api('/api/admin/package', { pkg: id, price, soldOut, image, providerSku, auto });
    if (d.success) { showNotification('Paquete actualizado.'); loadPackageOverrides(); }
    else showNotification(d.message || 'Error al guardar.');
  } catch { showNotification('Error de red.'); }
}
