const FOTO_JUEGO = '5bf9771fdf528ef3c1c33a3c21b78fcd.jpg';
const FOTO_CAJA = '0143be3c29a332a7b72af2691b6207ad.jpg';

document.querySelectorAll('.game-banner-card').forEach(e => {
  e.style.backgroundImage = `linear-gradient(180deg,rgba(3,6,20,.1) 0%,rgba(3,6,20,.85) 100%),url('${FOTO_JUEGO}')`;
  e.style.backgroundPosition = 'center 8%';
});

document.querySelectorAll('.pk img').forEach(i => {
  i.onerror = () => { i.onerror = null; i.src = FALLBACK; };
  i.src = FOTO_CAJA;
});
(function () {
  // --- Logo USDT en toda la web ---
  const usdtImg = s => `<img src="usdt.png" alt="USDT" style="width:${s}px;height:${s}px;object-fit:contain;vertical-align:middle">`;
  document.querySelectorAll('.usdt-real-icon').forEach(e => {
    e.style.background = 'transparent'; e.style.boxShadow = 'none';
    e.innerHTML = '<img src="usdt.png" alt="USDT" style="width:100%;height:100%;object-fit:contain">';
  });
  const pill = document.querySelector('.wallet-pill-top[title="USDT"] i');
  if (pill) pill.outerHTML = usdtImg(16);
  const tab = document.querySelector('#btn-method-usdt i');
  if (tab) tab.outerHTML = usdtImg(18);
  const banner = id => `<svg viewBox="0 0 600 170" style="width:100%;display:block;border-radius:16px;margin-bottom:12px;box-shadow:0 8px 22px rgba(0,0,0,.6)"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2bb48a"/><stop offset="1" stop-color="#0d5a45"/></linearGradient></defs><rect width="600" height="170" rx="16" fill="url(#${id})"/><circle cx="95" cy="85" r="60" fill="#fff"/><image href="usdt.png" x="55" y="48" width="80" height="74" preserveAspectRatio="xMidYMid meet"/><text x="185" y="88" font-family="Arial Black,Arial,sans-serif" font-size="60" font-weight="900" fill="#fff">USDT</text><text x="187" y="118" font-family="Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="3" fill="#d6fff1">TETHER · BEP20</text><text x="187" y="144" font-family="Arial,sans-serif" font-size="16" fill="#d6fff1" opacity=".9">Red Binance Smart Chain (BSC)</text><rect x="388" y="20" width="192" height="30" rx="15" fill="#fff" opacity=".18"/><text x="484" y="41" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="800" fill="#fff">✔ DEPÓSITO AUTOMÁTICO</text></svg>`;
  const b1 = document.querySelector('#sec-usdt-detail .wallet-box-detail > svg');
  if (b1) b1.outerHTML = banner('ub5');
  const b2 = document.querySelector('#packages-usdt-container > svg');
  if (b2) b2.outerHTML = banner('ub6');

  // --- Blood Strike: lingotes + saldo y USDT por separado ---
  const box = document.getElementById('bs-packages');
  if (box) {
    const lista = c => BS_PAQ[c].map(([q, p, id], n, arr) =>
      `<div class="pk" onclick="pickPkg(this,'${id}',${p},'${c}')"><i>${n === arr.length - 1 ? 'OFERTA VIP' : 'OFERTA'}</i><img src="bs-oro.png" onerror="this.onerror=null;this.src=FALLBACK" alt=""><div><b>${q}</b><small>Oro</small><em>${fmt(c, p)}</em></div></div>`).join('');
    box.innerHTML = `
      <div class="payment-methods-tabs">
        <div id="bs-tab-saldo" class="pay-tab-btn active" onclick="bsTab('saldo')"><i class="fa-solid fa-mobile-screen"></i> Saldo Móvil</div>
        <div id="bs-tab-usdt" class="pay-tab-btn" onclick="bsTab('usdt')">${usdtImg(18)} USDT</div>
      </div>
      <div id="bs-box-saldo"><div class="section-title">OFERTAS CON SALDO MÓVIL</div><div class="diamonds-grid">${lista('saldo')}</div></div>
      <div id="bs-box-usdt" class="hidden"><div class="section-title">OFERTAS CON USDT</div><div class="diamonds-grid">${lista('usdt')}</div></div>
      <button onclick="submitBsOrder()" class="btn-main">COMPLETAR RECARGA</button>`;
  }
  window.bsTab = function (m) {
    document.getElementById('bs-tab-saldo').classList.toggle('active', m === 'saldo');
    document.getElementById('bs-tab-usdt').classList.toggle('active', m === 'usdt');
    document.getElementById('bs-box-saldo').classList.toggle('hidden', m !== 'saldo');
    document.getElementById('bs-box-usdt').classList.toggle('hidden', m !== 'usdt');
    selectedId = null;
    document.querySelectorAll('.pk').forEach(x => x.classList.remove('selected'));
  };

  // --- Quitar "Recargar" de la barra de abajo (las ofertas salen al tocar el juego) ---
  document.querySelectorAll('.app-bottom-nav .nav-item-btn').forEach(b => {
    if ((b.getAttribute('onclick') || '').includes("'recargas'")) b.remove();
  });

  // --- Botón flotante de soporte ---
  const SOPORTE_NUMERO = '+5358151457'; // tu WhatsApp con código de país, solo números
  if (!document.getElementById('btn-soporte')) {
    const s = document.createElement('div');
    s.id = 'btn-soporte';
    s.innerHTML = '<i class="fa-solid fa-headset"></i>';
    s.style.cssText = 'position:fixed;right:16px;bottom:100px;z-index:999;width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;color:#1a1204;cursor:pointer;background:linear-gradient(135deg,#ffd76a,#b8860b);border:2px solid #fff3b0;box-shadow:0 6px 18px rgba(0,0,0,.7),0 0 18px rgba(255,197,49,.5)';
    s.onclick = () => {
      if (!/^\d{8,15}$/.test(SOPORTE_NUMERO)) { showNotification('Soporte disponible muy pronto.'); return; }
      const u = currentUser ? ' Mi usuario: ' + currentUser : '';
      window.open('https://wa.me/' + SOPORTE_NUMERO + '?text=' + encodeURIComponent('Hola, necesito ayuda con Diamons Legion.' + u), '_blank');
    };
    document.body.appendChild(s);
  }
})();
