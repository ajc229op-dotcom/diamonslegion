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
#support-fab{position:fixed;right:16px;bottom:100px;z-index:200;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#ffd76a,#b8860b);display:flex;align-items:center;justify-content:center;font-size:24px;color:#1a1204;box-shadow:0 8px 22px rgba(0,0,0,.8),0 0 18px rgba(0,0,0,0.35);cursor:pointer;border:2px solid #fff3b0}
#ai-panel{position:fixed;inset:0;background:#0b141a;z-index:999;display:flex;align-items:stretch;justify-content:center}
#ai-box{width:100%;max-width:460px;height:100%;background:#0b141a;display:flex;flex-direction:column;margin:0 auto}
#ai-head{display:flex;align-items:center;gap:12px;padding:14px 14px;background:linear-gradient(135deg,#1f6b4f,#128c5a);flex:none;box-shadow:0 2px 8px rgba(0,0,0,.4)}
#ai-head .ai-back{font-size:20px;color:#fff;cursor:pointer;padding:4px}
#ai-head .ai-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#ffd76a,#b8860b);display:flex;align-items:center;justify-content:center;font-size:18px;color:#1a1204;flex:none}
#ai-head .ai-who{flex:1;line-height:1.25}
#ai-head b{display:block;color:#fff;font-size:.95rem;font-weight:800}
#ai-head small{color:rgba(255,255,255,.75);font-size:.72rem}
#ai-msgs{flex:1;overflow-y:auto;padding:14px 10px;display:flex;flex-direction:column;gap:7px;background:#0b141a;background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px);background-size:14px 14px}
.ai-msg{max-width:78%;padding:8px 11px 9px;border-radius:9px;font-size:.86rem;line-height:1.35;position:relative;box-shadow:0 1px 1px rgba(0,0,0,.25)}
.ai-msg.bot{align-self:flex-start;background:#1f2c34;color:#e9edef;border-top-left-radius:2px}
.ai-msg.me{align-self:flex-end;background:#1f6b4f;color:#fff;border-top-right-radius:2px}
#ai-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 10px 10px;background:#0b141a;flex:none}
#ai-quick button{background:#1f2c34;border:1px solid #2a3942;color:#8fcfb3;font-size:.72rem;font-weight:700;padding:7px 11px;border-radius:16px;cursor:pointer}
#ai-input-row{display:flex;align-items:center;gap:8px;padding:10px;background:#0b141a;flex:none}
#ai-input-row input{flex:1;background:#1f2c34;border:none;border-radius:22px;color:#fff;padding:.75rem 1.1rem;outline:none;font-size:.9rem}
#ai-input-row button{background:#1f6b4f;border:none;color:#fff;border-radius:50%;width:44px;height:44px;flex:none;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
#ai-human{text-align:center;font-size:.72rem;color:#8696a0;padding:0 14px 12px;background:#0b141a;flex:none}
#ai-human a{color:#53bdeb;font-weight:800;text-decoration:none}`;
document.head.appendChild(st);

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
  const g = document.querySelector('#packages-saldo-container .diamonds-grid')?.closest('#packages-saldo-container') ? null : null;
  const box = document.getElementById('sec-recargas');
  // oculta los tabs y containers viejos de saldo/usdt, deja uno solo en DLC
  document.getElementById('btn-method-saldo')?.closest('.payment-methods-tabs')?.remove();
  document.getElementById('packages-saldo-container').remove();
  [...document.querySelectorAll('#sec-recargas .section-title')].forEach(t => { if (/M[ÉE]TODO/i.test(t.textContent)) t.remove(); });
  document.querySelectorAll('#sec-recargas .payment-methods-tabs').forEach(t => t.remove());
  const usdtCont = document.getElementById('packages-usdt-container');
  usdtCont.classList.remove('hidden');
  usdtCont.querySelector('.section-title').textContent = 'PAQUETES — FREE FIRE LATAM';
  const grid = usdtCont.querySelector('.diamonds-grid');
  grid.innerHTML = PAQ_FF.map(([d, p, id], i) =>
    `<div class="pk" onclick="pickPkg(this,'${id}',${p})"><i>OFERTA</i><img src="d${i + 1}.png" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${d}</b><small>Diamantes</small><em>${fmt(p)}</em></div></div>`).join('');
})();

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
  document.getElementById('bs-packages').innerHTML =
    `<div class="section-title">OFERTAS DE ORO</div><div class="diamonds-grid">` +
    BS_PAQ.map(([q, p, id]) => `<div class="pk" onclick="pickPkg(this,'${id}',${p})"><img src="${BS_ICON}" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${q}</b><small>Oro</small><em>${fmt(p)}</em></div></div>`).join('') +
    '</div><button onclick="submitBsOrder()" class="btn-main">COMPLETAR RECARGA</button>';
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
(function () {
  const old = document.querySelector('.game-banner-card');
  if (old) { old.style.display = 'none'; const h = old.querySelector('h4'); if (h) h.textContent = 'FREE FIRE LATAM'; }
  const grid = document.createElement('div');
  grid.className = 'games-grid';
  grid.innerHTML = [['freefire.jpg', 'FREE FIRE LATAM', 'recargas'], ['bloodstrike.jpg', 'BLOOD STRIKE', 'bloodstrike']].map(([img, name, go]) =>
    `<div class="game-poster" onclick="switchMainTab('${go}')" style="background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.85) 100%),url('${img}')"><div class="game-poster-name">${name}</div><div class="game-poster-btn">Seleccionar</div></div>`).join('');
  document.getElementById('sec-home').appendChild(grid);
})();

// ===== Asistente de IA + boton flotante de soporte =====
const SUPPORT_WHATSAPP = ''; // pon aqui tu numero, ej: '584121234567' (sin +, sin espacios)
const AI_QUICK = ['¿Cómo deposito?', '¿Cómo recargo diamantes?', '¿Qué es DLC?', '¿Cómo gano con referidos?'];
let aiHistory = [];
(function () {
  const fab = document.createElement('div');
  fab.id = 'support-fab'; fab.innerHTML = '<i class="fa-solid fa-headset"></i>';
  fab.onclick = openAiPanel;
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.id = 'ai-panel'; panel.className = 'hidden';
  panel.innerHTML = `<div id="ai-box">
    <div id="ai-head"><i class="fa-solid fa-arrow-left ai-back" onclick="closeAiPanel()"></i><div class="ai-avatar"><i class="fa-solid fa-robot"></i></div><div class="ai-who"><b>Asistente Diamons Legión</b><small>en línea</small></div></div>
    <div id="ai-msgs"></div>
    <div id="ai-quick"></div>
    <div id="ai-input-row"><input id="ai-input" placeholder="Mensaje" onkeydown="if(event.key==='Enter')sendAi()"><button onclick="sendAi()"><i class="fa-solid fa-paper-plane"></i></button></div>
    <div id="ai-human">¿Nada de esto resolvió tu duda? <a href="${SUPPORT_WHATSAPP ? 'https://wa.me/' + SUPPORT_WHATSAPP : '#'}" target="_blank" onclick="${SUPPORT_WHATSAPP ? '' : "event.preventDefault();showNotification('Soporte: escribe a nuestro WhatsApp (próximamente)')"}">Hablar con una persona</a></div>
  </div>`;
  document.body.appendChild(panel);
})();

function openAiPanel() {
  document.getElementById('ai-panel').classList.remove('hidden');
  if (!aiHistory.length) {
    addAiMsg('bot', `¡Hola${currentUser ? ', ' + currentUser : ''}! Soy el asistente de Diamons Legión 💎. Puedo explicarte cómo depositar, recargar, usar tus DLC o tus referidos. ¿En qué te ayudo?`);
    document.getElementById('ai-quick').innerHTML = AI_QUICK.map(q => `<button onclick="askQuick('${q.replace(/'/g, "\\'")}')">${q}</button>`).join('');
  }
}
function closeAiPanel() { document.getElementById('ai-panel').classList.add('hidden'); }
function askQuick(q) { document.getElementById('ai-input').value = q; sendAi(); }
function addAiMsg(who, text) {
  const box = document.getElementById('ai-msgs');
  const d = document.createElement('div'); d.className = 'ai-msg ' + who; d.textContent = text;
  box.appendChild(d); box.scrollTop = box.scrollHeight;
}
async function sendAi() {
  const inp = document.getElementById('ai-input'); const msg = inp.value.trim();
  if (!msg) return;
  inp.value = ''; addAiMsg('me', msg); aiHistory.push({ role: 'user', content: msg });
  addAiMsg('bot', '…');
  try {
    const d = await api('/api/assistant', { message: msg, history: aiHistory.slice(-6) });
    document.querySelectorAll('#ai-msgs .ai-msg.bot').forEach(e => { if (e.textContent === '…') e.remove(); });
    const reply = d.success ? d.reply : (d.message || 'No pude responder, intenta de nuevo.');
    addAiMsg('bot', reply); aiHistory.push({ role: 'assistant', content: reply });
  } catch {
    document.querySelectorAll('#ai-msgs .ai-msg.bot').forEach(e => { if (e.textContent === '…') e.remove(); });
    addAiMsg('bot', 'Error de red. Intenta de nuevo o toca "Hablar con una persona".');
  }
}

// Bienvenida guiada la primera vez que el usuario entra
window.addEventListener('load', () => setTimeout(() => {
  if (currentUser && !localStorage.getItem('dl_welcomed_' + currentUser)) {
    localStorage.setItem('dl_welcomed_' + currentUser, '1');
    openAiPanel();
  }
}, 800));
