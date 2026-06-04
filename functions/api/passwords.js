const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Access-Key',
};
const ACCESS_KEY = 'ketenkompas2026';
const PW_KEY = 'kk_passwords';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get('X-Access-Key') !== ACCESS_KEY) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get(PW_KEY);
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
  if (!item.email || !item.wachtwoord) {
    return new Response('Missing email or wachtwoord', { status: 400, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get(PW_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Replace existing entry for this email
    const filtered = list.filter(p => p.email !== item.email);
    filtered.push({ id: Date.now() + '', ...item });
    await env.KK_KV.put(PW_KEY, JSON.stringify(filtered));
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
  const email = url.searchParams.get('email');
  if (!email) return new Response('Missing email', { status: 400, headers: CORS });
  try {
    const raw = await env.KK_KV.get(PW_KEY);
    const list = raw ? JSON.parse(raw) : [];
    await env.KK_KV.put(PW_KEY, JSON.stringify(list.filter(p => p.email !== email)));
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
