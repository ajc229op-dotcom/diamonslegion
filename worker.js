export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === "/api/register" && request.method === "POST") {
        const { username, email, password } = await request.json();
        const existing = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
        if (existing) {
          return new Response(JSON.stringify({ success: false, message: "El usuario ya existe" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        await env.DB.prepare("INSERT INTO users (username, email, password, balance, usdtBalance) VALUES (?, ?, ?, 0, 0)").bind(username, email, password).run();
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (url.pathname === "/api/login" && request.method === "POST") {
        const { username, password } = await request.json();
        const user = await env.DB.prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?").bind(username, username, password).first();
        if (user) {
          return new Response(JSON.stringify({ success: true, username: user.username }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } else {
          return new Response(JSON.stringify({ success: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      return new Response("API de Diamons Legion Activa", { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
};
