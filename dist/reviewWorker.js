importScripts('./idb.js')

const dbPromise = idb.open('ud-mws-s3-reviews', 1, upgradeDB => {
        switch(upgradeDB.oldVersion) {
        case 0:
                const reviewStore = upgradeDB.createObjectStore('reviews', {autoIncrement:true})
                reviewStore.createIndex('restaurant_id', 'restaurant_id')
        }
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
        getAll(store) {
        return dbPromise.then(db => {
        return db
        .transaction(store)
        .objectStore(store)
        .getAll();
        });
        },
        getAllIdx(store, idx, key) {
        return dbPromise.then(db => {
        return db
        .transaction(store)
        .objectStore(store)
        .index(idx)
        .getAll(key);
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

self.onmessage = function(e) {
    var databaseURL = e.data
    fetch(databaseURL)
        .then(response => {
                return response.json()
        }).then(data => {
                const reviews = data;
                reviews.forEach(review => {
                        console.log(review)
                        dbPromise.then(db => {
                                const tx = db.transaction('reviews', 'readwrite')
                                const reviewStore = tx.objectStore('reviews')
                                reviewStore.put('retaurant_id', review)
                        })
                })
                
                self.postMessage(review)
        })
}