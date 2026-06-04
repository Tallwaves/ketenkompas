const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Access-Key',
};
const BL_KEY = 'kk_backlog';
const ACCESS_KEY = 'ketenkompas2026';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ env }) {
  try {
    const data = await env.KK_KV.get(BL_KEY);
    const items = data ? JSON.parse(data) : [];
    return new Response(JSON.stringify(items), {
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
  try {
    const data = await env.KK_KV.get(BL_KEY);
    const items = data ? JSON.parse(data) : [];
    items.push(item);
    await env.KK_KV.put(BL_KEY, JSON.stringify(items));
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
  const id = url.searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400, headers: CORS });
  try {
    const data = await env.KK_KV.get(BL_KEY);
    const items = data ? JSON.parse(data) : [];
    await env.KK_KV.put(BL_KEY, JSON.stringify(items.filter(i => i.id !== id)));
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
