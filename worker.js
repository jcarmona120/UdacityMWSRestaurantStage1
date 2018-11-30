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
                case 'isFavorite':
                        dbPromise.then(db => {
                        const tx = db.transaction('restaurants', 'readwrite');
                        const restStore = tx.objectStore('restaurants');
                        restStore.get(e.data.restaurantId)
                                .then(restaurant => {
                                        restaurant.is_favorite = e.data.isFavorite;
                                        restStore.put(restaurant);
                                        self.postMessage(restaurant)
                                })
                        })
                        break;
                case 'sendReview': 
                      console.log(e)
                      writeData(e.data.store, e.data.review)
                        .then(() => {
                             self.postMessage('success') 
                        })
                        break;
                // case 'syncReview':
                //         var storedReviews = e.data.storedReviews 
                //         storedReviews.forEach(review => {
                //                 DBHelper.sendRestaurantReview(self.restaurant.id, review.name, review.rating, review.comments,
                //                 (error, review) => {
                //                 if (error) {
                //                 console.log('Error saving review');
                //                 } else {
                //                 // do some other stuff
                //                 console.log(review);
                //                 window.location.href = `/restaurant.html?id=${self.restaurant.id}`;
                //                 }
                //         });
                //       })
        }
}

