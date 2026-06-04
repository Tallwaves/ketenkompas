const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Access-Key',
};
const ACCESS_KEY = 'ketenkompas2026';
const SC_KEY = 'kk_scenarios';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get('X-Access-Key') !== ACCESS_KEY) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get(SC_KEY);
    return new Response(raw || '[]', {
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
  let item;
  try {
    item = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: CORS });
  }
  if (!item.naam) return new Response('Missing naam', { status: 400, headers: CORS });
  try {
    const raw = await env.KK_KV.get(SC_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(s => s.naam === item.naam);
    if (idx >= 0) list[idx] = item; else list.push(item);
    await env.KK_KV.put(SC_KEY, JSON.stringify(list));
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}

export async function onRequestDelete({ request, env }) {
  if (request.headers.get('X-Access-Key') !== ACCESS_KEY) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  const url = new URL(request.url);
  const naam = url.searchParams.get('naam');
  if (!naam) return new Response('Missing naam', { status: 400, headers: CORS });
  try {
    const raw = await env.KK_KV.get(SC_KEY);
    const list = raw ? JSON.parse(raw) : [];
    await env.KK_KV.put(SC_KEY, JSON.stringify(list.filter(s => s.naam !== naam)));
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
