// ===== Imagenes de monedas e iconos =====
const FALLBACK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4 58 24 32 60 6 24Z" fill="#ffc531"/><path d="M6 24h52M20 24l12-20 12 20-12 36z" fill="none" stroke="#1a1204" stroke-width="2"/></svg>');
const DLC_ICON = 'dlc.png', USDT_ICON = 'usdt.png', BS_ICON = 'bsgold.png';

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
#support-fab{position:fixed;right:16px;bottom:96px;z-index:200;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#ffd76a,#b8860b);display:flex;align-items:center;justify-content:center;font-size:24px;color:#1a1204;box-shadow:0 8px 22px rgba(0,0,0,.8),0 0 18px rgba(255,197,49,.6);cursor:pointer;border:2px solid #fff3b0}
#ai-panel{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999;display:flex;align-items:flex-end;justify-content:center}
#ai-box{width:100%;max-width:460px;height:78vh;background:var(--bg-card);border:2px solid var(--primary-neon);border-radius:22px 22px 0 0;display:flex;flex-direction:column;box-shadow:0 -10px 30px rgba(0,0,0,.8)}
#ai-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1.5px solid var(--border-color)}
#ai-head b{font-family:Orbitron,sans-serif;color:var(--primary-neon)}
#ai-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.ai-msg{max-width:85%;padding:9px 13px;border-radius:14px;font-size:.84rem;line-height:1.35}
.ai-msg.bot{align-self:flex-start;background:#1b150a;border:1px solid var(--border-color);color:#f0e2b0}
.ai-msg.me{align-self:flex-end;background:linear-gradient(135deg,#ffd76a,#b8860b);color:#1a1204;font-weight:700}
#ai-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 8px}
#ai-quick button{background:#1b150a;border:1px solid var(--border-color);color:var(--primary-neon);font-size:.7rem;font-weight:800;padding:6px 10px;border-radius:12px;cursor:pointer}
#ai-input-row{display:flex;gap:8px;padding:12px 14px;border-top:1.5px solid var(--border-color)}
#ai-input-row input{flex:1;background:#0d0a04;border:1.5px solid var(--border-color);border-radius:12px;color:#fff;padding:.7rem 1rem;outline:none}
#ai-input-row button{background:linear-gradient(135deg,#ffd76a,#b8860b);border:none;color:#1a1204;border-radius:12px;padding:0 16px;font-weight:900;cursor:pointer}
#ai-human{text-align:center;font-size:.72rem;color:var(--text-muted);padding:0 14px 10px}
#ai-human a{color:var(--primary-neon);font-weight:800;text-decoration:none}`;
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

// ===== Blood Strike: pantalla con pestañas Saldo / USDT (mismo precio en DLC, referencia visual distinta) =====
const BS_PAQ = [[51, 0.47, 'bu1'], [105, 0.83, 'bu2'], [320, 2.61, 'bu3'], [540, 4.28, 'bu4'], [1100, 8.69, 'bu5'], [2260, 17.28, 'bu6'], [5800, 43.03, 'bu7']];
let bsTab = 'saldo';
(function () {
  const sec = document.createElement('div');
  sec.id = 'sec-bloodstrike'; sec.className = 'vista-sec hidden';
  sec.innerHTML = `<button onclick="switchMainTab('home')" style="background:none;border:none;color:var(--primary-neon);font-weight:800;font-size:.82rem;cursor:pointer;margin-bottom:1rem;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-arrow-left"></i> Volver a Inicio</button>
  <div class="game-poster" style="aspect-ratio:2.2/1;cursor:default;background-image:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.85) 100%),url('bloodstrike.jpg')"><div class="game-poster-name" style="font-size:1.05rem">BLOOD STRIKE</div></div>
  <div class="top-recharge-showcase" style="border-radius:18px;padding:1rem;margin:1rem 0;border:2px solid var(--border-color)"><div class="form-group" style="margin-bottom:0"><label>PLAYER ID (solo números)</label><input type="number" id="bs-player-id" class="form-control" placeholder="Ej. 123456789" style="text-align:center;font-weight:bold"></div></div>
  <div class="bs-tabs"><div id="bs-btn-saldo" class="pay-tab-btn active" onclick="switchBsTab('saldo')"><i class="fa-solid fa-mobile-screen"></i> Oferta Saldo</div><div id="bs-btn-usdt" class="pay-tab-btn" onclick="switchBsTab('usdt')"><img src="${USDT_ICON}" style="width:18px;height:18px;object-fit:contain" onerror="this.remove()"> Oferta USDT</div></div>
  <div id="bs-usdt-banner" class="hidden">${usdtBanner()}</div>
  <div id="bs-packages"></div>`;
  document.querySelector('#main-app .container').appendChild(sec);
  renderBs();
})();
function switchBsTab(t) {
  bsTab = t;
  document.getElementById('bs-btn-saldo').classList.toggle('active', t === 'saldo');
  document.getElementById('bs-btn-usdt').classList.toggle('active', t === 'usdt');
  document.getElementById('bs-usdt-banner').classList.toggle('hidden', t !== 'usdt');
  selectedId = null; renderBs();
}
function renderBs() {
  const icon = bsTab === 'usdt' ? USDT_ICON : BS_ICON;
  document.getElementById('bs-packages').innerHTML =
    `<div class="section-title">${bsTab === 'usdt' ? 'OFERTA EN USDT' : 'OFERTA EN SALDO (pagas con tu DLC)'}</div><div class="diamonds-grid">` +
    BS_PAQ.map(([q, p, id]) => `<div class="pk" onclick="pickPkg(this,'${id}',${p})"><i>OFERTA</i><img src="${icon}" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${q}</b><small>Oro</small><em>${fmt(p)}</em></div></div>`).join('') +
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
    <div id="ai-head"><b><i class="fa-solid fa-robot"></i> Asistente Diamons Legión</b><i class="fa-solid fa-xmark" style="cursor:pointer;font-size:20px" onclick="closeAiPanel()"></i></div>
    <div id="ai-msgs"></div>
    <div id="ai-quick"></div>
    <div id="ai-input-row"><input id="ai-input" placeholder="Escribe tu pregunta..." onkeydown="if(event.key==='Enter')sendAi()"><button onclick="sendAi()"><i class="fa-solid fa-paper-plane"></i></button></div>
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
