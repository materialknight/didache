"use strict"

// OLD CACHE: "v0.1.0"
const CURRENT_CACHE = "v0.1.1"

self.addEventListener("install", cache_everything)
self.addEventListener("activate", del_prev_caches)
self.addEventListener("fetch", network_first)

const cacheable_responses = [
   "./assets/main.css",
   "./assets/minima-social-icons.svg",
   "./favicon.png",
   "./",
   "./index.html",
   "./index.js",
   "./info.html",
   "./manifest.json",
   "./404.html"
]
console.log(self.registration.scope)
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
            // Note: If fetching.request.url has search params "?key1=val1&key2=val2", the response won't be cached!
            console.log(fetching.request.mode, fetching.request.url)
            if (fetching.request.mode === "navigate")
            {
               window.alert(fetching.request.url)
            }
            const res_is_cacheable = cacheable_responses.some(rel_url => fetching.request.url.endsWith(rel_url.slice(1)))
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
            return new Response('Both network and cache failed', {
               status: 404,
               headers: { 'Content-Type': 'text/plain' }
            })
         })
   )
}
