"use strict"

// OLD CACHE: "v0.1.0" "v0.1.1"
// All GitHub pages under the same account share the same origin, so the cache must always have a distinctive name (not only the number) so that it won't interfere with the cache of another GitHub page.
const CURRENT_CACHE = "didache-0.1.2"

self.addEventListener("install", cache_everything)
self.addEventListener("activate", del_prev_caches)
self.addEventListener("fetch", network_first)

// In development, sw_scope is: http://localhost:4000/didache/
// In production, sw_scope is: https://materialknight.github.io/didache/
const sw_scope = self.registration.scope
// All requests using a relative url are made relative to this file's registration scope (/didache/).
const cacheable_responses = [
   sw_scope,
   "assets/main.css",
   "assets/minima-social-icons.svg",
   "assets/images/favicon.png",
   "assets/images/icon_chrome.png",
   "assets/images/icon_edge.png",
   "assets/images/QR_BTC.jpeg",
   "index.js",
   "toc.js",
   "manifest.json",
   "info"
]

// Functions:

function cache_everything(installation) {
   skipWaiting()
   installation.waitUntil(
      caches.open(CURRENT_CACHE).then(cache => cache.addAll(cacheable_responses))
   )
}

function del_prev_caches(activation) {
   activation.waitUntil(
      caches.keys().then(cache_keys => {
         const pending_deletions = cache_keys.map(key => key !== CURRENT_CACHE ? caches.delete(key) : null)
         return Promise.all(pending_deletions)
      }).then(() => clients.claim())
   )
}

function network_first(fetching) {
   if (fetching.request.method !== "GET")
   {
      return // Let the browser handle non-GET requests.
   }
   fetching.respondWith(
      fetch(fetching.request)
         .then(network_response => {
            // Note: If fetching.request.url has search params "?key1=val1&key2=val2", the response won't be cached.
            // setTimeout(() => {
            //    console.log(fetching.request.mode, fetching.request.url)
            // }, 1000)
            const res_is_cacheable = cacheable_responses.some(rel_url => fetching.request.url.endsWith(rel_url))
            if (res_is_cacheable)
            {
               const response_clone = network_response.clone()
               caches.open(CURRENT_CACHE).then(cache => cache.put(fetching.request, response_clone))
            }
            return network_response
         })
         .catch(async () => {
            console.warn(`Could not fetch ${fetching.request.url} from the network, retrieving from cache.`)
            const open_cache = await caches.open(CURRENT_CACHE)
            const cached_response = await open_cache.match(fetching.request)
            if (cached_response)
            {
               return cached_response
            }
            const req_keys = await open_cache.keys()
            const req_404 = req_keys.find(req => req.url.endsWith("/404.html"))
            if (req_404)
            {
               const cached_404 = await open_cache.match(req_404)
               return cached_404
            }
            return new Response('La página solicitada no pudo ser traída de la red ni hallada en el cache.', {
               status: 404,
               headers: { 'Content-Type': 'text/plain' }
            })
         })
   )
}
