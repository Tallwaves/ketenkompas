const SLIB_HOST = 'portal.ketenkompas.nl';

// Zet op true om ketenkompas.nl/ door te sturen naar /slib
// Zet op false om de gouden KetenKompas landingpage op root te tonen
const REDIRECT_ROOT_TO_SLIB = true;

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

  // Root: redirect naar /slib of toon home.html, afhankelijk van de toggle
  if (url.pathname === '/' || url.pathname === '') {
    if (REDIRECT_ROOT_TO_SLIB) {
      return Response.redirect(new URL('/slib', url).toString(), 302);
    }
    return env.ASSETS.fetch(new URL('/home', url).toString());
  }

  return next();
}
