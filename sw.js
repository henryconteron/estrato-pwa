/* Increment VERSION on every release that changes any shell file. */
const VERSION = 'v1.3.0';
// Scope-specific prefix: another PWA on the same origin keeps its own caches.
const PREFIX = 'estrato-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Bypass the HTTP cache so the new version contains the new files.
    await cache.addAll(SHELL.map(path => new Request(new URL(path, self.registration.scope), {cache: 'reload'})));
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Navigation always uses the same cached shell, including query strings.
    if (event.request.mode === 'navigate') {
      const shell = await cache.match(new URL('./index.html', self.registration.scope).href);
      if (shell) return shell;
    }
    const cached = await cache.match(event.request);
    if (cached) return cached;
    return fetch(event.request);
  })());
});
