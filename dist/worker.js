importScripts('./idb.js')
importScripts('js/idb-utility.js');

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
      
self.onmessage = function(e) {
        var command = e.data.command
        switch(command) {
                case 'testing':
                var databaseURL = e.data.url
                    fetch(databaseURL)
                        .then(response => {
                                return response.json()
                        }).then(data => {
                                const items = data;
                                items.forEach(item => {
                                        writeData('restaurant', item)
                                })
                                
                                self.postMessage(items)
                        }).catch(() => {
                                console.log('offline')
                        })
                        break;
                case 'sendReview': 
                      console.log(e)
                      writeData(e.data.store, e.data.review)
                        .then(() => {
                             console.log('stored')      
                        })
                        break;
        }
//     

        
}

