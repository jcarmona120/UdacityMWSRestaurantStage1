importScripts('idb.js')
importScripts('js/idb-utility.js');

var static_cache = 'mws-static-v7';
var dynamic_cache = 'mws-dynamic-v9';
var serverURL = 'http://127.0.0.1:1337/restaurants'

var staticAssets = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/js/idb.js',
  '/js/main_bundle.js',
  '/js/restaurant_bundle.js',
  serverURL,
  '/worker.js'
]


self.addEventListener('install', function(event) {
  console.log('sw installing')
 event.waitUntil(
   caches.open(static_cache).then(function(cache) {
     console.log('opened cache')
     return cache.addAll(
      staticAssets
     );
   })
 );
});

self.addEventListener('activate', function(event) {
  console.log('activated')
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key => {
          if (key !== static_cache && key !== dynamic_cache) {
            console.log('Removing old cache', key);
            return caches.delete(key)
          }
        })))
      })
  )
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const requestUrl = new URL(request.url)
  console.log(request)

    if (requestUrl.port === "1337") {
      if (request.url.includes('reviews') && request.method !== 'POST') {
        var id = requestUrl.searchParams.get('restaurant_id')
        event.respondWith(
          readByIndex('reviews', id)
            .then(reviews => {
              // check for reviews in IndexedDB
              if (reviews.length) {
                console.log('from idb')
                return reviews;
              }
              //fetch request normally and write to IndexedDB
              return fetch(request) 
                .then(response => response.json())
                .then(reviews => {
                  reviews.forEach(review => {
                    writeData('reviews', review)
                  })
                  return reviews;
                })
            })
            // return response from fetch
            .then(response => new Response(JSON.stringify(response)))
        )
      } else {
        event.respondWith(
          readAllData('restaurants')
          .then(restaurants => {
            if (restaurants.length) {
              return restaurants;
            }
            return fetch(request) 
              .then(response => response.json())
              .then(restaurantsData => {
                restaurantsData.forEach(restaurant => {
                  writeData('restaurants', restaurant)
                })
                return restaurantsData;
              })  
          })
          .then(response => new Response(JSON.stringify(response)))
        )
      }
    } else {
      event.respondWith(
        caches.match(request)
          .then(response => {
            if (response) {
              return response;
            } else {
              return fetch(request)
                .then(res => {
                  return caches.open(dynamic_cache)
                    .then(cache => {
                      cache.put(request.url, res.clone())
                      return res;
                    })
                })
            }
          })
      )
    }
  });

self.addEventListener('message', (event) => {
  console.log('Message received:', event)
  writeData(event.data.store, event.data.review)
  client.postMessage('hello')
})

