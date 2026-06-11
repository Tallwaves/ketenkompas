const PROTECTED = 'slib.ketenkompas.nl';
const LOGIN_HOST = 'ketenkompas.nl';

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  // API routes have their own auth — always pass through
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // Serve landing page at the root of the public domain
  if (url.hostname === LOGIN_HOST && (url.pathname === '/' || url.pathname === '')) {
    const landingUrl = new URL('/landing.html', request.url);
    if (env.ASSETS) {
      return env.ASSETS.fetch(new Request(landingUrl.toString(), request));
    }
    return Response.redirect(landingUrl.toString(), 302);
  }

  // Only enforce sessions on the slib subdomain
  if (url.hostname !== PROTECTED) {
    return next();
  }

  const token = parseCookie(request.headers.get('Cookie') || '', 'kk_session');
  if (!token) {
    return Response.redirect(`https://${LOGIN_HOST}/`, 302);
  }

  try {
    const raw = await env.KK_KV.get('kk_session_' + token);
    if (!raw) return Response.redirect(`https://${LOGIN_HOST}/`, 302);
    const session = JSON.parse(raw);
    if (session.expires < Date.now()) {
      await env.KK_KV.delete('kk_session_' + token);
      return Response.redirect(`https://${LOGIN_HOST}/`, 302);
    }
  } catch {
    return Response.redirect(`https://${LOGIN_HOST}/`, 302);
  }

  return next();
}

function parseCookie(header, name) {
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}
