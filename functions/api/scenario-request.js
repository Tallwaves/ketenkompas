const ADMIN_KEY = 'kkadmin2026';
const MAX_ENTRIES = 500;

const HEADERS = { 'Content-Type': 'application/json' };
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { ...HEADERS, ...CORS } });
}

// POST — public: store a new scenario request
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid json' }, 400); }

  const { naam, organisatie, email, type, beschrijving } = body;
  if (!naam || !organisatie || !email || !type || !beschrijving) {
    return json({ ok: false, error: 'missing required fields' }, 422);
  }

  const entry = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    naam: String(naam).slice(0, 120),
    organisatie: String(organisatie).slice(0, 120),
    functie: String(body.functie || '').slice(0, 120),
    regio: String(body.regio || '').slice(0, 200),
    email: String(email).slice(0, 200),
    telefoon: String(body.telefoon || '').slice(0, 40),
    type: String(type).slice(0, 60),
    beschrijving: String(beschrijving).slice(0, 2000),
    opleverdatum: body.opleverdatum ? String(body.opleverdatum).slice(0, 20) : null,
    urgentie: ['normaal', 'hoog', 'acuut'].includes(body.urgentie) ? body.urgentie : 'normaal',
    status: 'nieuw',
  };

  try {
    const raw = await env.KK_KV.get('kk_scenario_requests');
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    if (list.length > MAX_ENTRIES) list.splice(MAX_ENTRIES);
    await env.KK_KV.put('kk_scenario_requests', JSON.stringify(list));
  } catch (e) {
    return json({ ok: false, error: 'storage error' }, 500);
  }

  return json({ ok: true }, 201);
}

// GET — admin only: retrieve all requests
export async function onRequestGet({ request, env }) {
  const key = request.headers.get('X-Admin-Key');
  if (key !== ADMIN_KEY) return json({ ok: false }, 403);

  try {
    const raw = await env.KK_KV.get('kk_scenario_requests');
    const list = raw ? JSON.parse(raw) : [];
    return json({ ok: true, requests: list });
  } catch {
    return json({ ok: false, error: 'storage error' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...HEADERS, ...CORS } });
}
