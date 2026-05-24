const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ env }) {
  try {
    const data = await env.KK_KV.get('kk_data');
    if (!data) return new Response(null, { status: 204, headers: CORS });
    return new Response(data, { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get('X-Admin-Key') !== 'kkadmin2026') {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  let body;
  try {
    body = await request.text();
    JSON.parse(body);
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: CORS });
  }
  try {
    await env.KK_KV.put('kk_data', body);
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
