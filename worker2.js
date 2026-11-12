// Cloudflare Worker + D1. Bindings: DB (D1). Secrets: JWT_SECRET. Opcionales: WALLET, ORIGIN.
const USDT = '0x55d398326f99059ff775485246999027b3197955';
const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const PKGS = const PKGS = {
  s1: { name: '110 Diamantes (Saldo)', price: 254, cur: 'saldo' },
  s2: { name: '341 Diamantes (Saldo)', price: 761, cur: 'saldo' },
  s3: { name: '572 Diamantes (Saldo)', price: 1287, cur: 'saldo' },
  s4: { name: '1166 Diamantes (Saldo)', price: 2392, cur: 'saldo' },
  s5: { name: '2398 Diamantes (Saldo)', price: 4745, cur: 'saldo' },
  s6: { name: '6160 Diamantes (Saldo)', price: 11976, cur: 'saldo' },
  u1: { name: '110 Diamantes (USDT)', price: 0.78, cur: 'usdt' },
  u2: { name: '341 Diamantes (USDT)', price: 2.34, cur: 'usdt' },
  u3: { name: '572 Diamantes (USDT)', price: 3.96, cur: 'usdt' },
  u4: { name: '1166 Diamantes (USDT)', price: 7.36, cur: 'usdt' },
  u5: { name: '2398 Diamantes (USDT)', price: 14.60, cur: 'usdt' },
  u6: { name: '6160 Diamantes (USDT)', price: 36.85, cur: 'usdt' },
};
  s1: { name: '};
const enc = new TextEncoder();
const b64 = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const hkey = s => crypto.subtle.importKey('raw', enc.encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

async function sign(p, secret) {
  const h = b64(enc.encode('{"alg":"HS256"}')), b = b64(enc.encode(JSON.stringify(p)));
  return `${h}.${b}.${b64(await crypto.subtle.sign('HMAC', await hkey(secret), enc.encode(h + '.' + b)))}`;
}
async function verify(t, secret) {
  try {
    const [h, b, s] = t.split('.');
    if (!await crypto.subtle.verify('HMAC', await hkey(secret), unb64(s), enc.encode(h + '.' + b))) return null;
    const p = JSON.parse(new TextDecoder().decode(unb64(b)));
    return p.exp > Date.now() / 1000 ? p : null;
  } catch { return null; }
}
async function pbkdf2(pw, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unb64(salt), iterations: 100000, hash: 'SHA-256' }, k, 256));
}
async function rpc(method, params) {
  const r = await fetch('https://bsc-dataseed.binance.org', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  return (await r.json()).result;
}
async function checkUsdt(hash, env) {
  const wallet = (env.WALLET || '0x01fFC04c400d0811DEc106E56Bfb5a95576AF18f').toLowerCase().slice(2);
  const rc = await rpc('eth_getTransactionReceipt', [hash]);
  if (!rc) return { error: 'Transacción no encontrada todavía. Espera 1 minuto e intenta de nuevo.' };
  if (rc.status !== '0x1') return { error: 'La transacción falló en la red.' };
  const lg = rc.logs.find(l => l.address.toLowerCase() === USDT && l.topics[0] === TRANSFER && l.topics[2].slice(-40).toLowerCase() === wallet);
  if (!lg) return { error: 'Esa transacción no pagó USDT a la dirección oficial.' };
  const head = parseInt(await rpc('eth_blockNumber', []), 16);
  if (head - parseInt(rc.blockNumber, 16) < 3) return { error: 'Esperando confirmaciones. Intenta en 1 minuto.' };
  return { amount: Number(BigInt(lg.data) / 10n ** 14n) / 1e4 };
}
async function deliverDiamonds(env, order) { return false; }

export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': env.ORIGIN || '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const out = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
    const fail = (m, s = 400) => out({ success: false, message: m }, s);
    const db = env.DB, path = new URL(req.url).pathname;
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const token = id => sign({ sub: id, exp: Math.floor(Date.now() / 1000) + 7 * 86400 }, env.JWT_SECRET);
    try {
      if (path === '/api/register') {
        const { username: n, email, password: p } = body;
        if (!/^[\w.-]{3,20}$/.test(n || '') || !/^\S+@\S+\.\S+$/.test(email || '') || (p || '').length < 7)
          return fail('Usuario de 3-20 caracteres, correo válido y contraseña de mínimo 7.');
        const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
        try { await db.prepare('INSERT INTO users(username,email,salt,hash) VALUES(?,?,?,?)').bind(n, email, salt, await pbkdf2(p, salt)).run(); }
        catch { return fail('Ese usuario o correo ya existe.'); }
        return out({ success: true, username: n, token: await token(n) });
      }
      if (path === '/api/login') {
        const id = String(body.username || '').trim();
        const r = await db.prepare('SELECT * FROM users WHERE username=? COLLATE NOCASE OR email=? COLLATE NOCASE').bind(id, id).first();
        if (!r || await pbkdf2(String(body.password || ''), r.salt) !== r.hash) return fail('Credenciales incorrectas.', 401);
        return out({ success: true, username: r.username, token: await token(r.username) });
      }

      const t = (req.headers.get('Authorization') || '').replace('Bearer ', '');
      const me = t && await verify(t, env.JWT_SECRET);
      const u = me && await db.prepare('SELECT * FROM users WHERE username=?').bind(me.sub).first();
      if (!u) return fail('Sesión inválida.', 401);
      const addOrder = (type, detail, pid, amount, cur, kind, status = 'Proceso') =>
        db.prepare('INSERT INTO orders(user,type,detail,player_id,amount,currency,kind,status,created) VALUES(?,?,?,?,?,?,?,?,?)')
          .bind(u.username, type, detail, pid, amount, cur, kind, status, Date.now());

      if (path === '/api/user') return out({ success: true, balance: u.balance, usdtBalance: u.usdt, isAdmin: !!u.is_admin });

      if (path === '/api/orders') {
        const q = u.is_admin ? db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 200') : db.prepare('SELECT * FROM orders WHERE user=? ORDER BY id DESC LIMIT 100').bind(u.username);
        const orders = (await q.all()).results.map(o => ({ id: o.id, user: o.user, type: o.type, detail: o.detail, playerId: o.player_id, amount: o.amount, currency: o.currency, status: o.status }));
        const res = { success: true, orders };
        if (u.is_admin) res.allUsers = (await db.prepare('SELECT username,email,balance,usdt AS usdtBalance FROM users').all()).results;
        return out(res);
      }

      if (path === '/api/deposit/usdt') {
        const h = String(body.hash || '').trim().toLowerCase();
        if (!/^0x[0-9a-f]{64}$/.test(h)) return fail('Hash inválido.');
        const c = await checkUsdt(h, env);
        if (c.error) return fail(c.error);
        const ins = await db.prepare('INSERT OR IGNORE INTO used_tx(hash) VALUES(?)').bind(h).run();
        if (!ins.meta.changes) return fail('Esa transacción ya fue acreditada.');
        await db.batch([
          db.prepare('UPDATE users SET usdt=usdt+? WHERE username=?').bind(c.amount, u.username),
          addOrder('Depósito USDT automático', 'Hash: ' + h.slice(0, 10) + '...', '-', c.amount, 'usdt', 'dep_usdt', 'Aprobado'),
        ]);
        return out({ success: true, amount: c.amount });
      }

      if (path === '/api/deposit') {
        const amt = Number(body.amount);
        if (!(amt > 0 && amt < 100000)) return fail('Monto inválido.');
        await addOrder('Depósito Saldo Móvil', String(body.detail || '').slice(0, 80), '-', amt, 'saldo', 'dep_saldo').run();
        return out({ success: true });
      }

      if (path === '/api/order') {
        const p = PKGS[body.pkg], pid = String(body.playerId || '').trim();
        if (!p || !/^\d{5,15}$/.test(pid)) return fail('Paquete o ID de jugador inválido.');
        const col = p.cur === 'usdt' ? 'usdt' : 'balance';
        const r = await db.prepare(`UPDATE users SET ${col}=${col}-? WHERE username=? AND ${col}>=?`).bind(p.price, u.username, p.price).run();
        if (!r.meta.changes) return fail('Saldo insuficiente.');
        const o = await addOrder(p.name, 'Compra de Paquete Free Fire', pid, p.price, p.cur, 'buy').run();
        if (await deliverDiamonds(env, { id: o.meta.last_row_id, pid, pkg: p }))
          await db.prepare("UPDATE orders SET status='Aprobado' WHERE id=?").bind(o.meta.last_row_id).run();
        return out({ success: true });
      }

      if (path === '/api/admin/order-status') {
        if (!u.is_admin) return fail('No autorizado.', 403);
        if (!['Aprobado', 'Rechazado'].includes(body.status)) return fail('Estado inválido.');
        const r = await db.prepare("UPDATE orders SET status=? WHERE id=? AND status='Proceso'").bind(body.status, body.orderId).run();
        if (!r.meta.changes) return fail('Ese pedido ya fue procesado.');
        const o = await db.prepare('SELECT * FROM orders WHERE id=?').bind(body.orderId).first();
        const col = o.currency === 'usdt' ? 'usdt' : 'balance';
        if ((o.kind === 'dep_saldo' && body.status === 'Aprobado') || (o.kind === 'buy' && body.status === 'Rechazado'))
          await db.prepare(`UPDATE users SET ${col}=${col}+? WHERE username=?`).bind(o.amount, o.user).run();
        return out({ success: true });
      }
      return fail('Ruta no encontrada.', 404);
    } catch (e) { return fail('Error del servidor.', 500); }
  },
};
