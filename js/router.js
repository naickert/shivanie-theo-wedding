/* Hash router — single source of view changes.
   Usage: register routes, then call start(). */

const routes = new Map();
let notFound = null;
let beforeEachFn = null;

export function register(path, handler) {
  routes.set(path, handler);
}

export function setNotFound(handler) { notFound = handler; }

export function beforeEach(fn) { beforeEachFn = fn; }

export function navigate(path) {
  if (path.startsWith('#')) path = path.slice(1);
  if (!path) path = '/';
  if (location.hash === '#' + path) {
    handle(); // re-render
  } else {
    location.hash = '#' + path;
  }
}

function parse(hash) {
  // hash like #/events/mehendi → path "/events/mehendi"
  let path = hash.replace(/^#/, '') || '/';
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

function findHandler(path) {
  // exact match first
  if (routes.has(path)) return { handler: routes.get(path), params: {} };
  // very simple param matcher: /events/:id
  for (const [pattern, handler] of routes) {
    if (!pattern.includes(':')) continue;
    const pParts = pattern.split('/');
    const aParts = path.split('/');
    if (pParts.length !== aParts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < pParts.length; i++) {
      if (pParts[i].startsWith(':')) params[pParts[i].slice(1)] = aParts[i];
      else if (pParts[i] !== aParts[i]) { ok = false; break; }
    }
    if (ok) return { handler, params };
  }
  return null;
}

async function handle() {
  const path = parse(location.hash);
  if (beforeEachFn) {
    try {
      await beforeEachFn(path);
    } catch (e) {
      // beforeEach threw — typically because it redirected via navigate().
      // Abort this render; the navigation will trigger handle() again.
      if (e && e.message !== 'redirect') console.error('beforeEach error', e);
      return;
    }
  }
  const found = findHandler(path);
  if (!found) {
    if (notFound) notFound(path);
    return;
  }
  try {
    await found.handler({ path, params: found.params });
    document.querySelectorAll('[data-route]').forEach(el => {
      const r = el.getAttribute('data-route');
      const active = r === '/' ? path === '/' : path.startsWith(r);
      if (active) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    document.getElementById('main')?.focus({ preventScroll: false });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  } catch (e) {
    console.error('Route handler error', e);
    document.getElementById('view').innerHTML = `<div class="container section"><div class="notice notice--error">Something went wrong rendering this page. Please reload.</div></div>`;
  }
}

export function start() {
  window.addEventListener('hashchange', handle);
  // first paint
  if (!location.hash) location.hash = '#/';
  handle();
}

export function currentPath() { return parse(location.hash); }
