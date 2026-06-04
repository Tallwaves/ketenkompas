const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const ACCESS_KEY = 'ketenkompas2026';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: CORS });
  }

  const { wachtwoord } = body;
  if (!wachtwoord) {
    return new Response(JSON.stringify({ ok: false }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const raw = await env.KK_KV.get('kk_passwords');
    const passwords = raw ? JSON.parse(raw) : [];
    const match = passwords.find(p => p.wachtwoord === wachtwoord);

    if (!match) {
      return new Response(JSON.stringify({ ok: false }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Log the login
    const logRaw = await env.KK_KV.get('kk_loginlog');
    const log = logRaw ? JSON.parse(logRaw) : [];
    log.unshift({
      wie: match.naam + (match.organisatie ? ' · ' + match.organisatie : ''),
      email: match.email,
      ts: Date.now(),
    });
    if (log.length > 300) log.splice(300);
    await env.KK_KV.put('kk_loginlog', JSON.stringify(log));

    return new Response(JSON.stringify({ ok: true, wie: match.naam }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response('KV error: ' + e.message, { status: 500, headers: CORS });
  }
}
