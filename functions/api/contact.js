const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get('X-Admin-Key') !== 'kkadmin2026') {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }
  try {
    const raw = await env.KK_KV.get('kk_contact_requests');
    const list = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(list), {
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

  const { naam, organisatie, email } = body;
  if (!naam || !email) {
    return new Response('Naam en email zijn verplicht', { status: 400, headers: CORS });
  }

  try {
    const raw = await env.KK_KV.get('kk_contact_requests');
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({
      naam,
      organisatie: organisatie || '',
      email,
      datum: new Date().toISOString(),
    });
    await env.KK_KV.put('kk_contact_requests', JSON.stringify(list));
    return new Response('OK', { status: 200, headers: CORS });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
