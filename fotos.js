(function () {
  if (document.getElementById('guia-btn')) return;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const txt = (id, d) => ((document.getElementById(id) || {}).textContent || d).trim();
  const go = (to, label) => `<button class="g-go" data-go="${to}">${label}</button>`;

  const st = document.createElement('style');
  st.textContent = `
#guia-btn{position:fixed;left:16px;bottom:100px;z-index:999;width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:23px;color:var(--primary-neon);cursor:pointer;background:var(--bg-card);border:2px solid var(--primary-neon);box-shadow:0 6px 18px rgba(0,0,0,.7),0 0 18px rgba(255,197,49,.45)}
#guia-btn.nuevo{animation:guiaPulso 1.8s infinite}
@keyframes guiaPulso{0%,100%{box-shadow:0 0 0 0 rgba(255,197,49,.7)}50%{box-shadow:0 0 0 12px rgba(255,197,49,0)}}
#guia-panel{position:fixed;left:12px;right:12px;bottom:92px;max-width:420px;height:min(70vh,520px);z-index:1100;display:flex;flex-direction:column;background:var(--bg-card);border:2px solid var(--primary-neon);border-radius:20px;box-shadow:0 14px 40px rgba(0,0,0,.85);overflow:hidden}
.g-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1.5px solid var(--border-color);font-weight:900;color:var(--primary-neon);font-size:.9rem;flex:none}
.g-head span{cursor:pointer;font-size:1.1rem;padding:2px 8px}
#guia-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.g-m{max-width:90%;padding:9px 12px;border-radius:14px;font-size:.8rem;line-height:1.5;word-break:break-word}
.g-bot{align-self:flex-start;background:var(--bg-main);border:1.5px solid var(--border-color);color:var(--text-main)}
.g-user{align-self:flex-end;background:linear-gradient(135deg,#ffd76a,#b8860b);color:#1a1204;font-weight:700}
#guia-chips{display:flex;gap:6px;overflow-x:auto;padding:8px 10px;border-top:1.5px solid var(--border-color);flex:none}
#guia-chips button{flex:none;background:transparent;border:1.5px solid var(--primary-neon);color:var(--primary-neon);border-radius:14px;padding:5px 10px;font-size:.72rem;font-weight:800;cursor:pointer;white-space:nowrap}
.g-go{background:var(--primary-neon);color:#1a1204;border:0;border-radius:12px;padding:6px 12px;font-size:.74rem;font-weight:900;cursor:pointer;margin:8px 6px 0 0}
.g-in{display:flex;gap:6px;padding:8px 10px;border-top:1.5px solid var(--border-color);flex:none}
.g-in input{flex:1;font-size:16px!important;padding:.55rem .8rem!important}
.g-in button{background:var(--primary-neon);color:#1a1204;border:0;border-radius:12px;width:42px;font-size:1rem;cursor:pointer}`;
  document.head.appendChild(st);

  // Listas de precios en DLC (1 DLC = 1 USDT = 320 saldo movil). PAQ_FF y BS_PAQ vienen de paquetes.js.
  const lineaFF = () => (typeof PAQ_FF !== 'undefined' ? PAQ_FF : []).map(([d, p]) => `• ${d} 💎 → ${fmt(p)}`).join('<br>');
  const lineaBS = () => (typeof BS_PAQ !== 'undefined' ? BS_PAQ : []).map(([q, p]) => `• ${q} oro → ${fmt(p)}`).join('<br>');
  const precios = () => `<b>Free Fire LATAM</b><br>${lineaFF()}<br><br><b>Blood Strike</b><br>${lineaBS()}`;
  const menu = () => `¡Hola${currentUser ? ', ' + esc(currentUser) : ''}! 👋 Soy la <b>Guía de Diamons Legion</b>. Te enseño a usar la página paso a paso.<br><br>Toca una opción abajo o escríbeme tu pregunta.`;

  const KB = [
    { k: ['guia rapida', 'tutorial', 'como funciona', 'paso a paso', 'como uso', 'como se usa', 'empezar', 'que hago', 'que puedo hacer', 'primeros pasos'],
      r: () => `<b>Guía rápida 🚀</b><br>1️⃣ Regístrate o inicia sesión.<br>2️⃣ Ve a <b>Wallet</b> y deposita saldo móvil o USDT (se convierte en <b>DLC</b>).<br>3️⃣ En <b>Inicio</b> toca tu juego (Free Fire o Blood Strike).<br>4️⃣ Escribe tu ID de jugador y elige un paquete.<br>5️⃣ Sigue tu pedido en <b>Pedidos</b>.<br><br>¿Quieres el detalle de algún paso? Pregúntame.${go('wallet', 'Ir a Wallet')}${go('home', 'Ir a Inicio')}` },
    { k: ['registr', 'crear cuenta', 'cuenta nueva', 'unirme', 'inscrib', 'abrir cuenta'],
      r: () => `<b>Crear tu cuenta 📝</b><br>1️⃣ En la pantalla de inicio toca <b>Registrarse</b>.<br>2️⃣ Escribe un usuario (3 a 20 caracteres: letras, números, punto o guion), tu correo y una contraseña de mínimo 7 caracteres.<br>3️⃣ Toca <b>Registrarse</b> y entras directo.<br><br>Si llegas con el link de un amigo, quedas como su invitado automáticamente.` },
    { k: ['iniciar', 'entrar', 'sesion', 'contrasena', 'password', 'clave', 'olvide', 'login'],
      r: () => `<b>Iniciar sesión 🔑</b><br>Toca <b>Iniciar Sesión</b> y escribe tu usuario o correo con tu contraseña. Tu sesión dura 7 días en el mismo teléfono.<br><br>Si olvidaste la contraseña, por ahora no hay recuperación automática: escribe a soporte (botón dorado) con tu usuario.` },
    { k: ['pedido', 'orden', 'historial', 'estado', 'aprobad', 'proceso', 'rechazad', 'tarda', 'demora', 'llego', 'llegaron', 'llega', 'recibi', 'espera'],
      r: () => `<b>Tus pedidos 📦</b><br>En <b>Pedidos</b> ves tus depósitos y compras:<br>🟡 <b>Proceso</b>: en revisión. Las compras y los depósitos de saldo móvil los aprueba el administrador.<br>🟢 <b>Aprobado</b>: listo.<br>🔴 <b>Rechazado</b>: si era una compra, tu DLC vuelve a tu billetera.<br><br>Los depósitos USDT se acreditan automáticamente. Si algo tarda mucho, escribe a soporte con tu usuario y tu ID de jugador.${go('orders', 'Ver mis pedidos')}` },
    { k: ['precio', 'cuanto cuesta', 'cuanto vale', 'costo', 'cuesta', 'vale', 'ofertas', 'lista de paquetes'],
      r: () => `<b>Precios (en DLC) 🏷️</b><br>${precios()}` },
    { k: ['dlc', 'moneda', 'que es dlc', 'diamons legion coins', 'coins'],
      r: () => `<b>¿Qué es DLC? 💎</b><br><b>DLC (Diamons Legión Coins)</b> es la moneda única de la tienda. Todo se compra con DLC.<br><br>Equivalencia: <b>1 DLC = 1 USDT (BEP20) = 320 de saldo móvil</b>.<br><br>Cuando depositas USDT o saldo móvil, se convierte automáticamente a DLC en tu billetera.${go('wallet', 'Ir a Wallet')}` },
    { k: ['compr', 'diamante', 'recarga', 'recargar', 'free fire', 'freefire', 'paquete', 'pedir', 'adquirir', 'comprar'],
      r: () => `<b>Comprar diamantes de Free Fire 🎮</b><br>1️⃣ Ten DLC en tu Wallet (si no, deposita primero).<br>2️⃣ En <b>Inicio</b> toca <b>Free Fire LATAM</b>.<br>3️⃣ Escribe tu <b>Player ID</b> (solo números).<br>4️⃣ Toca el paquete y luego <b>Completar recarga</b>. Se paga con tu DLC.<br><br>Tu pedido queda en <b>Pedidos</b> hasta que se entregue.<br><br><b>Paquetes:</b><br>${lineaFF()}${go('recargas', 'Ir a Free Fire')}` },
    { k: ['blood', 'strike', 'oro', 'bloodstrike'],
      r: () => `<b>Comprar oro de Blood Strike 🪙</b><br>1️⃣ Ten DLC en tu Wallet.<br>2️⃣ En <b>Inicio</b> toca <b>Blood Strike</b>.<br>3️⃣ Escribe tu <b>Player ID</b> (solo números).<br>4️⃣ Mira la oferta en la pestaña <b>Saldo</b> o <b>USDT</b> (el pago siempre es con tu DLC).<br>5️⃣ Toca el paquete y luego <b>Completar recarga</b>.<br><br><b>Paquetes:</b><br>${lineaBS()}${go('bloodstrike', 'Ir a Blood Strike')}` },
    { k: ['saldo movil', 'saldo', 'movil', 'transferi', 'confirmacion'],
      r: () => `<b>Depositar saldo móvil 💰</b><br>1️⃣ Ve a <b>Wallet</b> → <b>Saldo Móvil</b>.<br>2️⃣ Copia el número <b>${esc(txt('saldo-num-text', '58151457'))}</b> con el botón <i>Copiar Número</i> y transfiérele el saldo desde tu teléfono.<br>3️⃣ Guarda el número de confirmación de la transferencia.<br>4️⃣ En la página escribe el monto y ese número de confirmación, y toca <b>Confirmar depósito de saldo</b>.<br>5️⃣ El administrador lo revisa y te acredita en <b>DLC</b> (320 de saldo = 1 DLC).${go('wallet', 'Ir a Wallet')}` },
    { k: ['usdt', 'bep', 'hash', 'binance', 'tether', 'cripto', 'bsc'],
      r: () => `<b>Depositar USDT (red BEP20) 🪙</b><br>1️⃣ Ve a <b>Wallet</b> → <b>USDT BEP 20</b>.<br>2️⃣ Copia la dirección oficial:<br><b style="word-break:break-all">${esc(txt('wallet-addr-text', ''))}</b><br>3️⃣ Desde tu billetera o exchange envía USDT por la red <b>BEP20 (Binance Smart Chain)</b>. ⚠️ Si usas otra red, el dinero se pierde.<br>4️⃣ Copia el <b>hash</b> de la transacción (empieza con 0x).<br>5️⃣ Pégalo en la página con el monto exacto y toca <b>Confirmar depósito</b>.<br><br>Se verifica solo en la blockchain y se acredita en <b>DLC</b> (1 USDT = 1 DLC). Si dice que no la encuentra, espera 1 minuto y reintenta. Cada hash solo se puede usar una vez.${go('wallet', 'Ir a Wallet')}` },
    { k: ['deposit', 'fondos', 'dinero', 'wallet', 'billetera', 'cargar', 'agregar'],
      r: () => `<b>¿Con qué quieres depositar?</b><br>💰 <b>Saldo móvil</b>: lo revisa el administrador.<br>🪙 <b>USDT BEP20</b>: se acredita automáticamente.<br>Ambos se convierten a <b>DLC</b>.<br><br>Toca una opción abajo o escribe "depositar saldo" o "depositar USDT".${go('wallet', 'Ir a Wallet')}` },
    { k: ['referid', 'invit', 'perfil', 'avatar', 'gana', 'link', 'comision'],
      r: () => `<b>Perfil y referidos 🎁</b><br>En <b>Perfil</b> está tu link de invitación. Cuando alguien se registra con tu link y deposita, ganas el <b>4% en DLC</b> de cada depósito suyo. Ahí también eliges tu avatar.${go('perfil', 'Ir a Perfil')}` },
    { k: ['tema', 'oscuro', 'claro', 'modo', 'luna', 'colores'],
      r: () => `<b>Modo claro / oscuro 🌗</b><br>Toca el botón de sol o luna, arriba a la derecha, para cambiar de tema. Se guarda en tu teléfono.` },
    { k: ['soporte', 'agente', 'persona', 'whatsapp', 'contacto', 'problema', 'reclamo', 'error', 'funciona', 'humano'],
      r: () => `<b>Soporte 🎧</b><br>Toca el botón dorado con auricular (abajo a la derecha) para hablar con soporte por WhatsApp. Ten a la mano tu usuario y, si es de una compra, tu ID de jugador.` },
    { k: ['seguro', 'estafa', 'confiable', 'robo', 'fiable', 'confianza', 'real'],
      r: () => `<b>Seguridad 🔒</b><br>Tus depósitos USDT se verifican en la blockchain y cada compra queda registrada en <b>Pedidos</b>.<br><br>Consejos: nunca compartas tu contraseña, revisa bien tu ID de jugador antes de comprar y envía USDT solo por la red BEP20 a la dirección oficial de la página.` },
    { k: ['salir', 'cerrar sesion', 'logout', 'desconectar'],
      r: () => `Ve a <b>Perfil</b> y toca <b>Cerrar sesión</b>.${go('perfil', 'Ir a Perfil')}` },
    { k: ['player', 'jugador', 'uid', 'mi id', 'encuentro mi id', 'donde veo'],
      r: () => `<b>Player ID 🆔</b><br>Es el número de tu cuenta en el juego; lo ves en tu perfil dentro del juego. Escríbelo solo con números (5 a 15 dígitos), sin espacios.<br><br>⚠️ Si lo pones mal, la recarga puede ir a otra cuenta. Revísalo antes de confirmar.` },
    { k: ['gracias', 'genial', 'perfecto', 'excelente', 'listo'],
      r: () => `¡Con gusto! 💛 Si necesitas algo más, aquí estoy.` },
    { k: ['hola', 'buenas', 'hey', 'buenos', 'ayuda', 'ayudame', 'saludos'],
      r: () => menu() },
  ];
  const fallback = () => `No estoy seguro de haber entendido 🤔. Prueba con otras palabras o toca una opción abajo.<br>Si prefieres hablar con una persona, usa el botón dorado de soporte.`;
  const answer = t => {
    const n = ' ' + norm(t).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    let best = null, top = 0;
    for (const e of KB) {
      const s = e.k.filter(k => n.includes(' ' + k)).length;
      if (s > top) { top = s; best = e; }
    }
    return best ? best.r() : fallback();
  };

  const btn = document.createElement('div');
  btn.id = 'guia-btn'; btn.title = 'Guía'; btn.innerHTML = '<i class="fa-solid fa-robot"></i>';
  const panel = document.createElement('div');
  panel.id = 'guia-panel'; panel.className = 'hidden';
  panel.innerHTML = `<div class="g-head"><div>🤖 Guía Diamons Legion</div><span id="guia-x">✕</span></div><div id="guia-msgs"></div><div id="guia-chips"></div><div class="g-in"><input id="guia-in" class="form-control" placeholder="Escribe tu pregunta..." autocomplete="off"><button id="guia-send"><i class="fa-solid fa-paper-plane"></i></button></div>`;
  document.body.appendChild(btn); document.body.appendChild(panel);

  const msgs = panel.querySelector('#guia-msgs'), input = panel.querySelector('#guia-in');
  const CHIPS = [['🚀 Guía rápida', 'guia rapida'], ['📝 Registrarme', 'como me registro'], ['💰 Depositar saldo', 'depositar saldo movil'], ['🪙 Depositar USDT', 'depositar usdt'], ['🎮 Comprar', 'como comprar diamantes'], ['🏷️ Precios', 'precios'], ['📦 Mis pedidos', 'mis pedidos'], ['🎁 Referidos', 'referidos'], ['💬 Soporte', 'soporte']];
  panel.querySelector('#guia-chips').innerHTML = CHIPS.map(c => `<button data-q="${c[1]}">${c[0]}</button>`).join('');

  const say = (content, who) => {
    const d = document.createElement('div');
    d.className = 'g-m g-' + who;
    if (who === 'bot') d.innerHTML = content; else d.textContent = content;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  };
  const ask = t => {
    t = t.trim(); if (!t) return;
    say(t, 'user'); input.value = '';
    setTimeout(() => say(answer(t), 'bot'), 300);
  };

  let seen = false;
  try { seen = !!localStorage.getItem('dl_guia'); } catch { }
  if (!seen) btn.classList.add('nuevo');

  btn.onclick = () => {
    const abrir = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !abrir);
    if (abrir) {
      btn.classList.remove('nuevo');
      try { localStorage.setItem('dl_guia', '1'); } catch { }
      if (!msgs.children.length) say(menu(), 'bot');
    }
  };
  panel.querySelector('#guia-x').onclick = () => panel.classList.add('hidden');
  panel.querySelector('#guia-send').onclick = () => ask(input.value);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') ask(input.value); });
  panel.querySelector('#guia-chips').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) ask(b.dataset.q); });
  msgs.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    if (document.getElementById('main-app').classList.contains('hidden')) { showNotification('Primero inicia sesión o regístrate.'); return; }
    switchMainTab(b.dataset.go); panel.classList.add('hidden');
  });
})();
