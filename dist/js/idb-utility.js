var dbPromise = idb.open('restaurant-store', 3, upgradeDB => {
  switch(upgradeDB.oldVersion) {
    case 0: 
          upgradeDB.createObjectStore('restaurants', {keyPath: 'id', unique: true});
    case 1: 
          const reviewStore = upgradeDB.createObjectStore('reviews', { autoIncrement: true });
          reviewStore.createIndex('restaurant_id', 'restaurant_id');
    case 2: 
          upgradeDB.createObjectStore('reviews-sync-store', {autoIncrement: true})
  }
})
  
  function writeData(str, data) {
    return dbPromise.then(db => {
        var tx = db.transaction(str, 'readwrite');
        var store = tx.objectStore(str)
        store.put(data)
        return tx.complete;
    })
  }
  
  function readAllData(str) {
    return dbPromise.then(db => {
      var tx = db.transaction(str, 'readonly');
      var store = tx.objectStore(str)
      return store.getAll();
    })
  }

  function readByIndex(str, idx, key) {
    return dbPromise.then(db => {
      return db
        .transaction(str)
        .objectStore(str)
        .index(idx)
        .getAll(key);
    });
  }