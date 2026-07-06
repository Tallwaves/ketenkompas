// Dashboarddata voor eindverwerkers: onderhoudskalender, verbeterverzoeken
// en noodmeldingen (aanspraak Robuust Plan). Auth via de sessie-cookie —
// alleen accounts met rol 'verwerkers' kunnen hun eigen data lezen/schrijven.

const HEADERS = { 'Content-Type': 'application/json' };
const MAX_ITEMS = 100;

function parseCookie(header, name) {
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

async function getSession(request, env) {
  const token = parseCookie(request.headers.get('Cookie'), 'kk_session');
  if (!token) return null;
  try {
    const raw = await env.KK_KV.get('kk_session_' + token);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.expires < Date.now()) return null;
    return s;
  } catch { return null; }
}

function dataKey(vid) { return 'kk_verwerker_data_' + vid; }

async function loadData(env, vid) {
  try {
    const raw = await env.KK_KV.get(dataKey(vid));
    const d = raw ? JSON.parse(raw) : {};
    return {
      onderhoud: Array.isArray(d.onderhoud) ? d.onderhoud : [],
      requests: Array.isArray(d.requests) ? d.requests : [],
      nood: Array.isArray(d.nood) ? d.nood : [],
    };
  } catch { return { onderhoud: [], requests: [], nood: [] }; }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: HEADERS });
}

async function requireVerwerker(request, env) {
  const s = await getSession(request, env);
  if (!s) return { err: json({ ok: false, error: 'geen sessie' }, 401) };
  if (s.rol !== 'verwerkers' || !s.vid) return { err: json({ ok: false, error: 'geen verwerkersaccount' }, 403) };
  return { s };
}

export async function onRequestGet({ request, env }) {
  const { s, err } = await requireVerwerker(request, env);
  if (err) return err;
  const data = await loadData(env, s.vid);
  return json({ ok: true, wie: s.wie, vid: s.vid, ...data });
}

export async function onRequestPost({ request, env }) {
  const { s, err } = await requireVerwerker(request, env);
  if (err) return err;
  let body;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }

  const { type, item } = body;
  if (!item || typeof item !== 'object') return json({ ok: false }, 400);

  const data = await loadData(env, s.vid);
  const entry = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), ts: Date.now() };

  if (type === 'onderhoud') {
    const van = parseInt(item.van, 10), tot = parseInt(item.tot, 10);
    if (!(van >= 1 && van <= 53) || !(tot >= van && tot <= 53)) return json({ ok: false, error: 'ongeldige weken' }, 400);
    Object.assign(entry, {
      van, tot,
      jaar: parseInt(item.jaar, 10) || new Date().getFullYear(),
      omschrijving: String(item.omschrijving || '').slice(0, 300),
      tonnen: Math.max(0, parseFloat(item.tonnen) || 0),
    });
    data.onderhoud.push(entry);
  } else if (type === 'request') {
    const tekst = String(item.tekst || '').trim().slice(0, 1000);
    if (!tekst) return json({ ok: false, error: 'lege tekst' }, 400);
    Object.assign(entry, { tekst });
    data.requests.unshift(entry);
    // Doorzetten naar de verbeterlijst zodat het verzoek in Beheer zichtbaar is
    try {
      const raw = await env.KK_KV.get('kk_suggestions');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({ id: entry.id, naam: s.wie + ' (verwerkersportaal)', tekst, ts: entry.ts });
      if (list.length > 500) list.splice(500);
      await env.KK_KV.put('kk_suggestions', JSON.stringify(list));
    } catch { /* non-fatal */ }
  } else if (type === 'nood') {
    const situatie = String(item.situatie || '').trim().slice(0, 1500);
    if (!situatie) return json({ ok: false, error: 'lege melding' }, 400);
    Object.assign(entry, {
      situatie,
      tonnen: Math.max(0, parseFloat(item.tonnen) || 0),
      duur: String(item.duur || '').slice(0, 120),
      telefoon: String(item.telefoon || '').slice(0, 40),
    });
    data.nood.unshift(entry);
    // Centrale lijst voor de regiegroep + hoog zichtbaar in de verbeterlijst/Beheer
    try {
      const rawN = await env.KK_KV.get('kk_noodmeldingen');
      const nlist = rawN ? JSON.parse(rawN) : [];
      nlist.unshift({ ...entry, wie: s.wie, vid: s.vid });
      if (nlist.length > 200) nlist.splice(200);
      await env.KK_KV.put('kk_noodmeldingen', JSON.stringify(nlist));
    } catch { /* non-fatal */ }
    try {
      const raw = await env.KK_KV.get('kk_suggestions');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: entry.id,
        naam: '🚨 NOODMELDING — ' + s.wie,
        tekst: `Aanspraak Robuust Plan. ${situatie}` + (entry.tonnen ? ` · ${entry.tonnen} ton/wk` : '') + (entry.duur ? ` · verwachte duur: ${entry.duur}` : '') + (entry.telefoon ? ` · tel: ${entry.telefoon}` : ''),
        ts: entry.ts,
      });
      if (list.length > 500) list.splice(500);
      await env.KK_KV.put('kk_suggestions', JSON.stringify(list));
    } catch { /* non-fatal */ }
  } else {
    return json({ ok: false, error: 'onbekend type' }, 400);
  }

  // Lijsten begrensd houden
  for (const k of ['onderhoud', 'requests', 'nood']) {
    if (data[k].length > MAX_ITEMS) data[k].splice(MAX_ITEMS);
  }
  await env.KK_KV.put(dataKey(s.vid), JSON.stringify(data));
  return json({ ok: true, item: entry });
}

export async function onRequestDelete({ request, env }) {
  const { s, err } = await requireVerwerker(request, env);
  if (err) return err;
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');
  if (type !== 'onderhoud' || !id) return json({ ok: false }, 400);
  const data = await loadData(env, s.vid);
  data.onderhoud = data.onderhoud.filter(o => o.id !== id);
  await env.KK_KV.put(dataKey(s.vid), JSON.stringify(data));
  return json({ ok: true });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
