const PAQ = {
  saldo: [[110,254],[341,761],[572,1287],[1166,2392],[2398,4745],[6160,11976]],
  usdt: [[110,0.78],[341,2.34],[572,3.96],[1166,7.36],[2398,14.60],[6160,36.85]],
};
const FALLBACK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4 58 24 32 60 6 24Z" fill="#00f7ff"/><path d="M6 24h52M20 24l12-20 12 20-12 36z" fill="none" stroke="#030614" stroke-width="2"/></svg>');
const st = document.createElement('style');
st.textContent = `
.pk{position:relative;display:flex;align-items:center;gap:8px;background:linear-gradient(145deg,#091026,#030614);border:2px solid var(--border-color);border-radius:18px;padding:1.1rem .6rem .7rem;cursor:pointer;min-height:100px;transition:.3s}
.pk.selected,.pk:hover{border-color:var(--primary-neon);background:#132247;box-shadow:var(--neon-glow)}
.pk img{width:46px;height:46px;object-fit:contain;flex:none}
.pk b{display:block;font-family:Orbitron,sans-serif;font-size:.95rem}
.pk small{display:block;color:var(--text-muted);font-size:.7rem;font-weight:700}
.pk em{display:inline-block;margin-top:4px;font-style:normal;font-weight:900;font-size:.72rem;padding:4px 8px;border-radius:14px;border:1.5px solid var(--primary-neon);color:var(--primary-neon)}
.pk i{position:absolute;top:-1px;left:10px;font-style:normal;font-size:.55rem;font-weight:900;padding:1px 8px;border-radius:0 0 8px 8px;background:linear-gradient(90deg,#ff007f,#ffb703);color:#000}`;
document.head.appendChild(st);

let selectedId = null;
const fmt = (c, p) => c === 'usdt' ? '$' + p.toFixed(2) + ' USDT' : String(p).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' saldo';

['saldo', 'usdt'].forEach(c => {
  const g = document.querySelector('#packages-' + c + '-container .diamonds-grid');
  g.innerHTML = PAQ[c].map(([d, p], n) =>
    `<div class="pk" onclick="pickPkg(this,'${c === 'usdt' ? 'u' : 's'}${n + 1}',${p},'${c}')"><i>${n === 5 ? 'OFERTA VIP' : 'OFERTA'}</i><img src="d${n + 1}.png" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${d}</b><small>Diamantes</small><em>${fmt(c, p)}</em></div></div>`).join('');
});

function pickPkg(el, id, price, cur) {
  document.querySelectorAll('.pk').forEach(x => x.classList.remove('selected'));
  el.classList.add('selected');
  selectedId = id; selectedPkg = id; selectedPrice = price; selectedCurrency = cur;
}

const _sw = switchPaymentMethod;
switchPaymentMethod = function (m) {
  _sw(m); selectedId = null;
  document.querySelectorAll('.pk').forEach(x => x.classList.remove('selected'));
};

async function submitOrder() {
  const playerId = document.getElementById('player-id-input').value.trim();
  if (!/^\d{5,15}$/.test(playerId) || !selectedId) { showNotification('Ingresa un ID válido (solo números) y elige un paquete.'); return; }
  try {
    const d = await api('/api/order', { pkg: selectedId, playerId });
    if (d.success) { showNotification('Compra enviada. Estamos procesando tu recarga.'); switchMainTab('orders'); loadOrdersFromCloud(); loadUserDataFromCloud(); }
    else showNotification(d.message || 'Error al procesar.');
  } catch { showNotification('Error de red.'); }
}
