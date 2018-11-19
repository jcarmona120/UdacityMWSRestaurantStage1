importScripts('./idb.js')

const dbPromise = idb.open('ud-mws-s3', 1, upgradeDB => {
        switch(upgradeDB.oldVersion) {
        case 0:
                upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
        case 1: 
                upgradeDB.createObjectStore('reviews', {keyPath: 'restaurant_id'})
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

    var databaseURL = e.data.url
    var store = e.data.store
    fetch(databaseURL)
        .then(response => {
                return response.json()
        }).then(data => {
                const items = data;
                items.forEach(item => {
                        dbPromise.then(db => {
                                const tx = db.transaction(store, 'readwrite')
                                const itemStore = tx.objectStore(store)
                                itemStore.put(item)
                        })
                })
                
                self.postMessage(items)
        })
        
}

