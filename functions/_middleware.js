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

  // Root → redirect to /slib where the landing page lives
  if (url.pathname === '/' || url.pathname === '') {
    const target = new URL('/slib', url);
    return Response.redirect(target.toString(), 302);
  }

  return next();
}
