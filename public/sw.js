/* SAS PWA v1 — deliberately NO HTML/API/document cache.
 * Fresh editorial data, sessions, admin pages, audio, and navigations always
 * reach the network. Offline navigation uses only the generic offline shell.
 */
const VERSION = "sas-pwa-v1";
const STATIC = VERSION + "-static";
const IMAGES = VERSION + "-images";
const MAX_IMAGES = 45;
const offline = "/offline.html";
const baseFiles = [offline, "/brand/icons/sas-logo-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(STATIC).then(cache => cache.addAll(baseFiles)));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("sas-pwa-") && key !== STATIC && key !== IMAGES)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("message", event => {
  if (event.data?.type === "SAS_SKIP_WAITING") self.skipWaiting();
});
function restricted(url) {
  return /^\/(?:admin|login|auth|api)(?:\/|$)/.test(url.pathname)
    || /(?:^|\/)briefings(?:\/|$)/.test(url.pathname)
    || url.pathname.startsWith("/_next/data/")
    || /\.(?:mp3|mp4|m4a|wav|webm|pdf)$/i.test(url.pathname);
}
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    // Even the newest briefing may show the generic offline shell when offline.
    // Never cache its HTML or substitute an older edition.
    if (/^\/(?:admin|login|auth|api)(?:\/|$)/.test(url.pathname)) return;
    event.respondWith((async () => {
      try { return await fetch(request); }
      catch {
        const cached = await caches.match(offline);
        return cached || Response.error();
      }
    })());
    return;
  }
  if (restricted(url)) return;
  if (url.pathname.startsWith("/_next/static/") || /^\/brand\/(?:icons|logos)\//.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC);
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok && response.type === "basic") await cache.put(request, response.clone());
      return response;
    })());
    return;
  }
  if (/\.(?:webp|png|jpe?g|avif|gif)$/i.test(url.pathname) && !url.pathname.startsWith("/_next/image")) {
    event.respondWith((async () => {
      const cache = await caches.open(IMAGES);
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone());
        const keys = await cache.keys();
        await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_IMAGES)).map(key => cache.delete(key)));
      }
      return response;
    })());
  }
});
