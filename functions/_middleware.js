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

  // For the slib subdomain: always pass through to the app.
  // The app itself checks /api/session at startup and shows the login overlay
  // when no valid session exists.
  return next();
}

function parseCookie(header, name) {
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}
