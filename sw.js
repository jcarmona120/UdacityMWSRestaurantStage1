importScripts('idb.js')
importScripts('js/idb-utility.js');
importScripts('js/dbhelper.js')

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
  self.skipWaiting();
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

  if (requestUrl.port === '1337') {
    if (request.url.includes('reviews') && request.method !== 'POST') {        
      var indexId = +requestUrl.searchParams.get('restaurant_id');
        event.respondWith(
          //check for reviews from indexeddb by restaurant id
          readByIndex('reviews','restaurant_id',indexId)
            .then(reviews => {
              console.log(reviews)
              // check for reviews in IndexedDB
              if (reviews.length) {
                console.log('from idb reviews')
                return reviews;
              }
              //fetch request normally and write to IndexedDB
              return fetch(request) 
                .then(response => response.json())
                .then(reviews => {
                  console.log('gotta write em in', reviews)
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
          // get restaurants data from IndexedDB first
          readAllData('restaurants')
          .then(restaurants => {
            if (restaurants.length) {
              console.log('from idb restaurants')
              return restaurants;
            }
            // else get from network and save to IndexedDB
            return fetch(request) 
              .then(response => response.json())
              .then(restaurantsData => {
                restaurantsData.forEach(restaurant => {
                  writeData('restaurants', restaurant);
                });
                return restaurantsData;
              });  
          })
          //send response to client
          .then(response => new Response(JSON.stringify(response)))
        );
      }
    } else {
      event.respondWith(
        //match from caches
        caches.match(request)
          .then(response => {
            if (response) {
              return response;
            } else {
              //fetch and put all responses into dynamic cache
              return fetch(request)
                .then(res => {
                  return caches.open(dynamic_cache)
                    .then(cache => {
                      cache.put(request.url, res.clone())
                      return res;
                    });
                });
            }
          })
      );
    }
  });

// self.addEventListener('message', (event) => {
//   console.log('Message received:', event)
  // writeData(event.data.store, event.data.review)
  // client.postMessage('hello')
// })


//Background Sync Offline Reviews
self.addEventListener('sync', (event) => {
  console.log('Service Worker Syncing');
  if (event.tag === 'send-review') {
    console.log('syncing send-review')
    readAllData('reviews-sync-store')
      .then(data => {
        var storedReviews = data;
        storedReviews.forEach(review => {
          console.log(review)
          DBHelper.sendRestaurantReview(review.id, review.name, review.rating, review.comments,
            (error, review) => {
            if (error) {
              console.log('Error saving review');
            } else {
              // do some other stuff
              window.location.href = `/restaurant.html?id=${self.restaurant.id}`;
            }
          });
        })
      })
  }
})

