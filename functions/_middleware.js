const KETEN_APEX = 'ketenkompas.nl';
const SLIB_APEX = 'slibkompas.nl';
const PORTAL_HOSTS = new Set(['portal.' + KETEN_APEX, 'portal.' + SLIB_APEX]);

// Zet op true om ketenkompas.nl/ door te sturen naar /slib
// Zet op false om de gouden KetenKompas landingpage op root te tonen
const REDIRECT_ROOT_TO_SLIB = true;

function isApexOrWww(hostname, apex) {
  return hostname === apex || hostname === 'www.' + apex;
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const hn = url.hostname;

  // API routes have their own auth — always pass through
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // portal.* op beide domeinen: altijd passthrough naar de app (handelt eigen login overlay af)
  if (PORTAL_HOSTS.has(hn)) {
    return next();
  }

  // Portal expliciet bereikbaar op /portal — serveert de app (index.html) op elke host.
  // Nodig voor preview-deployments (*.pages.dev), waar de hostname-check op PORTAL_HOSTS
  // niet matcht en /index.html via clean-URLs naar / → /slib zou terugkaatsen.
  if (url.pathname === '/portal' || url.pathname === '/portal/') {
    return env.ASSETS.fetch(new URL('/', url).toString());
  }

  // slibkompas.nl (en www): dit domein IS de slib-toepassing, dus root en /verwerkers
  // serveren de content direct op de kale URL — geen /slib-prefix zoals op ketenkompas.nl.
  if (isApexOrWww(hn, SLIB_APEX)) {
    if (url.pathname === '/' || url.pathname === '') {
      return env.ASSETS.fetch(new URL('/slib', url).toString());
    }
    if (url.pathname === '/verwerkers' || url.pathname === '/verwerkers/') {
      return env.ASSETS.fetch(new URL('/slib/verwerkers', url).toString());
    }
    return next();
  }

  // ketenkompas.nl (en overige hosts): root redirect naar /slib of home.html, afhankelijk van de toggle
  if (url.pathname === '/' || url.pathname === '') {
    if (REDIRECT_ROOT_TO_SLIB) {
      return Response.redirect(new URL('/slib', url).toString(), 302);
    }
    return env.ASSETS.fetch(new URL('/home', url).toString());
  }

  return next();
}
