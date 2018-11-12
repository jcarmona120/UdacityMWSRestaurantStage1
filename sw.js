importScripts('./idb.js')

const dbPromise = idb.open('udacity-mws-stage-2-jc', 1, upgradeDB => {
  upgradeDB.createObjectStore('restaurants');
});
  
  const idbKeyval = {
    get(key) {
      return dbPromise.then(db => {
        return db.transaction('restaurants')
          .objectStore('restaurants').get(key);
      });
    },
    set(key, val) {
      return dbPromise.then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        tx.objectStore('restaurants').put(val, key);
        return tx.complete;
      });
    },
    delete(key) {
      return dbPromise.then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        tx.objectStore('restaurants').delete(key);
        return tx.complete;
      });
    },
    clear() {
      return dbPromise.then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        tx.objectStore('restaurants').clear();
        return tx.complete;
      });
    },
    keys() {
      return dbPromise.then(db => {
        const tx = db.transaction('restaurants');
        const keys = [];
        const store = tx.objectStore('restaurants');
  
        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // openKeyCursor isn't supported by Safari, so we fall back
        (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
          if (!cursor) return;
          keys.push(cursor.key);
          cursor.continue();
        });
  
        return tx.complete.then(() => keys);
      });
    }
  };

  

var CACHE_NAME = 'mws-stage-2';
var serverURL = 'http://127.0.0.1:1337/restaurants'
var urlsToCache = [
    serverURL
];

self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open(CACHE_NAME).then(function(cache) {
     console.log('opened cache')
      
     return cache.addAll([
      '/',
      './index.html',
     './restaurant.html',
     serverURL
     ]);
   })
 );
});

self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate');
  fetch('http://127.0.0.1:1337/restaurants')
  .then(response => {
		return response.json()
  }).then(data => {
      console.log('we got data')
      console.log(data)
      idbKeyval.set('restaurants', data);
  })
});

self.addEventListener('fetch', function(event) {

  //  monitor requests
  //  const acceptHeader = event.request.headers.get('accept')
  //  console.log("Fetching", acceptHeader, event.request.url)

  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        return caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, response.clone());
          return response;
        });  
      });
    })
  );
});