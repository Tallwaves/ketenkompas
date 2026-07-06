const MASTER = 'ketenkompas2026';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;   // 7 days
const TTL_S  = 7 * 24 * 60 * 60;

const HEADERS = { 'Content-Type': 'application/json' };

// Cookies zijn niet cross-domain: wie inlogt via slibkompas.nl moet een cookie
// op .slibkompas.nl krijgen, niet op .ketenkompas.nl. Bepaal het apex-domein
// (zonder portal./www.-prefix) uit de hostname van het inkomende request.
const KNOWN_APEXES = ['ketenkompas.nl', 'slibkompas.nl'];

// Gekozen rol op de loginpagina. Accounts kunnen een eigen (autoritaire) rol
// dragen; de gekozen pill is dan alleen een fallback voor oudere accounts.
const ROLLEN = ['waterschappen', 'verwerkers', 'beheerders'];
function cleanRol(r) {
  return ROLLEN.includes(r) ? r : null;
}

// Vaste testaccounts (naast MASTER), o.a. voor de pilot-demonstratie.
// vid = verwerker-id waaronder dashboarddata in KV wordt bewaard.
const TEST_ACCOUNTS = [
  { wachtwoord: 'hvc2026', wie: 'HVC · Eindverwerker', rol: 'verwerkers', vid: 'hvc' },
];

function slugify(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'onbekend';
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
    return json({ ok: true, wie: s.wie, rol: s.rol || null, vid: s.vid || null });
  } catch {
    return json({ ok: false });
  }
}

// POST — login: validate password → create session → set cookie
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }

  const { wachtwoord } = body;
  const gekozenRol = cleanRol(body.rol);
  let wie = null;
  let rol = null;   // autoritaire rol van het account
  let vid = null;   // verwerker-id voor dashboarddata

  if (wachtwoord === MASTER) {
    wie = 'Beheerder';
    rol = 'beheerders';
  } else {
    const test = TEST_ACCOUNTS.find(t => t.wachtwoord === wachtwoord);
    if (test) {
      wie = test.wie; rol = test.rol; vid = test.vid;
    } else {
      // Check individual passwords
      try {
        const raw = await env.KK_KV.get('kk_passwords');
        const list = raw ? JSON.parse(raw) : [];
        const match = list.find(p => p.wachtwoord === wachtwoord);
        if (match) {
          wie = match.naam + (match.organisatie ? ' · ' + match.organisatie : '');
          rol = cleanRol(match.rol);
          if (rol === 'verwerkers') vid = match.vid || slugify(match.organisatie || match.naam);
        }
      } catch { /* ignore */ }
    }
  }

  if (!wie) return json({ ok: false });
  if (!rol) rol = gekozenRol || 'waterschappen';

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
    JSON.stringify({ wie, rol, vid, ts: Date.now(), expires: Date.now() + TTL_MS }),
    { expirationTtl: TTL_S }
  );

  const apex = apexFor(new URL(request.url).hostname);
  const bestemming = rol === 'verwerkers' ? `https://portal.${apex}/verwerker` : `https://portal.${apex}/`;
  return new Response(
    JSON.stringify({ ok: true, rol, redirect: bestemming }),
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
