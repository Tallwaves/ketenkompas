const SLIB_HOST = 'slib.ketenkompas.nl';

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  // API routes have their own auth — always pass through
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // slib subdomain: always pass through to the app (handles its own login overlay)
  if (url.hostname === SLIB_HOST) {
    return next();
  }

  // All other hosts (ketenkompas.nl AND *.pages.dev preview URLs):
  // serve landing page at root so previews also show the landing page.
  if (url.pathname === '/' || url.pathname === '') {
    const landingUrl = new URL('/landing.html', request.url);
    if (env.ASSETS) {
      return env.ASSETS.fetch(new Request(landingUrl.toString(), request));
    }
    return Response.redirect(landingUrl.toString(), 302);
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
