const scope = self.registration.scope;
const cachePrefix = `myra-app:${scope}:`;
const cacheName = `${cachePrefix}1`;
const appFiles = [
  "./",
  "./index.html",
  "./css/myra-app.css",
  "./js/myra-install.js",
  "./js/myra-nlu.js",
  "./js/myra-voice.js",
  "./data/myra-wordmap.json",
  "./data/myra-images.json",
  "./data/inventory.json",
  "./data/beerinventory2.json"
].map((path) => new URL(path, scope).href);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(appFiles)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName)
      .map((key) => caches.delete(key))
  )));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !appFiles.includes(request.url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
