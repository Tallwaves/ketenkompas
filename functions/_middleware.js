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

  // Root → serve home.html (KetenKompas landing) without redirecting
  if (url.pathname === '/' || url.pathname === '') {
    const homeUrl = new URL('/home', url);
    return env.ASSETS.fetch(homeUrl.toString());
  }

  return next();
}
