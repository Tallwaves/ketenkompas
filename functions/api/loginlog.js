const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Access-Key',
};
const ACCESS_KEY = 'ketenkompas2026';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get('X-Access-Key') !== ACCESS_KEY) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get('kk_loginlog');
    const log = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(log), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get('X-Access-Key') !== ACCESS_KEY) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  let entry;
  try {
    entry = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get('kk_loginlog');
    const log = raw ? JSON.parse(raw) : [];
    log.unshift({ wie: entry.wie || 'Onbekend', ts: entry.ts || Date.now() });
    if (log.length > 300) log.splice(300);
    await env.KK_KV.put('kk_loginlog', JSON.stringify(log));
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
