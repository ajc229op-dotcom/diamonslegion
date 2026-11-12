export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Cabeceras CORS obligatorias para permitir la conexión desde GitHub Pages
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. REGISTRO DE USUARIOS
      if (url.pathname === "/api/register" && request.method === "POST") {
        const { username, email, password } = await request.json();
        if (!username || !email || !password) {
          return Response.json({ success: false, message: "Faltan datos" }, { headers: corsHeaders });
        }
        const existing = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
        if (existing) {
          return Response.json({ success: false, message: "El usuario ya existe" }, { headers: corsHeaders });
        }
        await env.DB.prepare("INSERT INTO users (username, email, password, balance, usdtBalance) VALUES (?, ?, ?, 0, 0)")
          .bind(username, email, password).run();
        return Response.json({ success: true, username }, { headers: corsHeaders });
      }

      // 2. INICIO DE SESIÓN
      if (url.pathname === "/api/login" && request.method === "POST") {
        const { username, password } = await request.json();
        const user = await env.DB.prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?")
          .bind(username, username, password).first();
        if (!user) {
          return Response.json({ success: false, message: "Credenciales incorrectas" }, { headers: corsHeaders });
        }
        return Response.json({ success: true, username: user.username }, { headers: corsHeaders });
      }

      // 3. CONSULTAR SALDOS DEL USUARIO
      if (url.pathname === "/api/user" && request.method === "GET") {
        const username = url.searchParams.get("username");
        const user = await env.DB.prepare("SELECT balance, usdtBalance FROM users WHERE username = ?")
          .bind(username).first();
        if (!user) {
          return Response.json({ success: false, message: "Usuario no encontrado" }, { headers: corsHeaders });
        }
        return Response.json({ success: true, balance: user.balance, usdtBalance: user.usdtBalance }, { headers: corsHeaders });
      }

      // 4. LISTAR PEDIDOS Y USUARIOS (PARA ADMIN)
      if (url.pathname === "/api/orders" && request.method === "GET") {
        const username = url.searchParams.get("username");
        const { results: orders } = await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();
        
        let allUsers = [];
        if (username && username.toLowerCase() === 'admin') {
          const uRes = await env.DB.prepare("SELECT username, email, balance, usdtBalance FROM users").all();
          allUsers = uRes.results || [];
        }
        return Response.json({ success: true, orders, allUsers }, { headers: corsHeaders });
      }

      // 5. SOLICITUD DE DEPÓSITO (SALDO MÓVIL O USDT)
      if (url.pathname === "/api/deposit" && request.method === "POST") {
        const { username, type, amount, currency, detail } = await request.json();
        await env.DB.prepare("INSERT INTO orders (user, type, playerId, amount, currency, status, detail, date) VALUES (?, ?, 'N/A', ?, ?, 'Proceso', ?, datetime('now'))")
          .bind(username, type, amount, currency, detail).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // 6. COMPRA DE PAQUETES DE DIAMANTES
      if (url.pathname === "/api/order" && request.method === "POST") {
        const { username, type, playerId, amount, currency, detail } = await request.json();
        const user = await env.DB.prepare("SELECT balance, usdtBalance FROM users WHERE username = ?")
          .bind(username).first();
        if (!user) return Response.json({ success: false, message: "Usuario no encontrado" }, { headers: corsHeaders });

        if (currency === 'saldo' && user.balance < amount) {
          return Response.json({ success: false, message: "Saldo insuficiente" }, { headers: corsHeaders });
        }
        if (currency === 'usdt' && user.usdtBalance < amount) {
          return Response.json({ success: false, message: "USDT insuficiente" }, { headers: corsHeaders });
        }

        if (currency === 'saldo') {
          await env.DB.prepare("UPDATE users SET balance = balance - ? WHERE username = ?").bind(amount, username).run();
        } else {
          await env.DB.prepare("UPDATE users SET usdtBalance = usdtBalance - ? WHERE username = ?").bind(amount, username).run();
        }

        await env.DB.prepare("INSERT INTO orders (user, type, playerId, amount, currency, status, detail, date) VALUES (?, ?, ?, ?, ?, 'Proceso', ?, datetime('now'))")
          .bind(username, type, playerId, amount, currency, detail).run();

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // 7. APROBAR O RECHAZAR SOLICITUDES (PANEL DE ADMINISTRADOR)
      if (url.pathname === "/api/admin/order-status" && request.method === "POST") {
        const { orderId, status } = await request.json();
        const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
        if (!order) return Response.json({ success: false, message: "Pedido no encontrado" }, { headers: corsHeaders });

        if (status === 'Aprobado' && order.status === 'Proceso') {
          if (order.type.includes('Depósito')) {
            if (order.currency === 'saldo') {
              await env.DB.prepare("UPDATE users SET balance = balance + ? WHERE username = ?").bind(order.amount, order.user).run();
            } else {
              await env.DB.prepare("UPDATE users SET usdtBalance = usdtBalance + ? WHERE username = ?").bind(order.amount, order.user).run();
            }
          }
        }

        await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, orderId).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return Response.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};
