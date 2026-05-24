export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const CORS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    };

    if (url.pathname === '/api/data') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
      }

      if (request.method === 'GET') {
        const data = await env.KK_KV.get('kk_data');
        if (!data) {
          return new Response(null, { status: 204, headers: CORS });
        }
        return new Response(data, {
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }

      if (request.method === 'POST') {
        if (request.headers.get('X-Admin-Key') !== 'kkadmin2026') {
          return new Response('Unauthorized', { status: 401, headers: CORS });
        }
        const body = await request.text();
        try { JSON.parse(body); } catch {
          return new Response('Invalid JSON', { status: 400, headers: CORS });
        }
        await env.KK_KV.put('kk_data', body);
        return new Response('OK', { status: 200, headers: CORS });
      }

      return new Response('Method Not Allowed', { status: 405, headers: CORS });
    }

    return env.ASSETS.fetch(request);
  },
};
