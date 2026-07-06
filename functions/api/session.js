const MASTER = 'ketenkompas2026';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;   // 7 days
const TTL_S  = 7 * 24 * 60 * 60;

const HEADERS = { 'Content-Type': 'application/json' };

// Cookies zijn niet cross-domain: wie inlogt via slibkompas.nl moet een cookie
// op .slibkompas.nl krijgen, niet op .ketenkompas.nl. Bepaal het apex-domein
// (zonder portal./www.-prefix) uit de hostname van het inkomende request.
const KNOWN_APEXES = ['ketenkompas.nl', 'slibkompas.nl'];

// Gekozen rol op de loginpagina. Voorlopig informatief (alle rollen delen
// dezelfde login), maar we bewaren en loggen 'm voor toekomstige differentiatie.
const ROLLEN = ['waterschappen', 'verwerkers', 'beheerders'];
function cleanRol(r) {
  return ROLLEN.includes(r) ? r : null;
}

function apexFor(hostname) {
  const stripped = (hostname || '').replace(/^(portal\.|www\.)/, '');
  return KNOWN_APEXES.includes(stripped) ? stripped : KNOWN_APEXES[0];
}

function parseCookie(header, name) {
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

function makeToken() {
  const b = new Uint8Array(20);
  crypto.getRandomValues(b);
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

function setCookie(token, apex) {
  return `kk_session=${token}; Domain=.${apex}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_S}`;
}

function clearCookie(apex) {
  return `kk_session=; Domain=.${apex}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// GET — validate existing session (used by ketenkompas.nl to auto-redirect)
export async function onRequestGet({ request, env }) {
  const token = parseCookie(request.headers.get('Cookie'), 'kk_session');
  if (!token) return json({ ok: false });
  try {
    const raw = await env.KK_KV.get('kk_session_' + token);
    if (!raw) return json({ ok: false });
    const s = JSON.parse(raw);
    if (s.expires < Date.now()) {
      await env.KK_KV.delete('kk_session_' + token);
      return json({ ok: false });
    }
    return json({ ok: true, wie: s.wie, rol: s.rol || null });
  } catch {
    return json({ ok: false });
  }
}

// POST — login: validate password → create session → set cookie
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }

  const { wachtwoord } = body;
  const rol = cleanRol(body.rol);
  let wie = null;

  if (wachtwoord === MASTER) {
    wie = 'Beheerder';
  } else {
    // Check individual passwords
    try {
      const raw = await env.KK_KV.get('kk_passwords');
      const list = raw ? JSON.parse(raw) : [];
      const match = list.find(p => p.wachtwoord === wachtwoord);
      if (match) wie = match.naam + (match.organisatie ? ' · ' + match.organisatie : '');
    } catch { /* ignore */ }
  }

  if (!wie) return json({ ok: false });

  // Log login
  try {
    const logRaw = await env.KK_KV.get('kk_loginlog');
    const log = logRaw ? JSON.parse(logRaw) : [];
    log.unshift({ wie, rol, ts: Date.now() });
    if (log.length > 300) log.splice(300);
    await env.KK_KV.put('kk_loginlog', JSON.stringify(log));
  } catch { /* non-fatal */ }

  // Create session
  const token = makeToken();
  await env.KK_KV.put(
    'kk_session_' + token,
    JSON.stringify({ wie, rol, ts: Date.now(), expires: Date.now() + TTL_MS }),
    { expirationTtl: TTL_S }
  );

  const apex = apexFor(new URL(request.url).hostname);
  return new Response(
    JSON.stringify({ ok: true, redirect: `https://portal.${apex}/` }),
    { status: 200, headers: { ...HEADERS, 'Set-Cookie': setCookie(token, apex) } }
  );
}

// DELETE — logout: destroy session + clear cookie
export async function onRequestDelete({ request, env }) {
  const token = parseCookie(request.headers.get('Cookie'), 'kk_session');
  if (token) {
    try { await env.KK_KV.delete('kk_session_' + token); } catch { /* ignore */ }
  }
  const apex = apexFor(new URL(request.url).hostname);
  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...HEADERS, 'Set-Cookie': clearCookie(apex) } }
  );
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: HEADERS });
}
