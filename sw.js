"use strict"

// OLD CACHE: NONE
const CURRENT_CACHE = "v0.1.0"

self.addEventListener("install", cache_everything)

self.addEventListener("activate", del_prev_caches)

self.addEventListener("fetch", network_first)

// Functions:

function cache_everything(installation) {
   skipWaiting()
   installation.waitUntil(
      caches.open(CURRENT_CACHE).then(cache => cache.addAll([
         "./",
         "./index.html",
         // './assets/index.css',
         // './assets/index.js',
         "./manifest.json"
      ]))
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
      return; // Let the browser handle this request
   }
   fetching.respondWith(
      fetch(fetching.request)
         .then(network_response => {
            if (!network_response.ok)
            {
               throw new Error(`Could not fetch ${fetching.request.url} from the network, retrieving from cache.`)
            }
            const response_clone = network_response.clone()
            caches.open(CURRENT_CACHE).then(cache => cache.put(fetching.request, response_clone))
            return network_response
         })
         .catch(async err => {
            console.error(err.message)
            const cached_response = await caches.open(CURRENT_CACHE).then(cache => cache.match(fetching.request))
            return cached_response ?? new Response('Both network and cache failed', {
               status: 404,
               headers: { 'Content-Type': 'text/plain' }
            })
         })
   )
}
