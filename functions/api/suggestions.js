const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Access-Key',
};
const ACCESS_KEY = 'ketenkompas2026';
const SG_KEY = 'kk_suggestions';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get('X-Access-Key') !== ACCESS_KEY) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get(SG_KEY);
    return new Response(raw || '[]', {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: CORS });
  }
  const { naam, tekst } = body;
  if (!naam || !tekst) {
    return new Response('Naam en tekst zijn verplicht', { status: 400, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get(SG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ id: Date.now() + '', naam, tekst, ts: Date.now() });
    if (list.length > 500) list.splice(500);
    await env.KK_KV.put(SG_KEY, JSON.stringify(list));
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
