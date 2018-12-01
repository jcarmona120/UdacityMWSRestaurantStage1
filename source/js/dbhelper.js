

/**
 * Common database helper functions.
 */
class DBHelper {


  static get DATABASE_URL() {
    const port = 1337;
    return `http://127.0.0.1:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // var worker = new Worker('../worker.js')
    // worker.postMessage({
    //   url: this.DATABASE_URL,
    //   store: 'restaurants',
    //   command: 'testing'
    // })
    // worker.onmessage = result => {
    //   var restaurants = result.data
    //   return callback(null, restaurants)
    // }
    fetch(this.DATABASE_URL)
        .then(response => {
                return response.json()
        }).then(data => {
                const restaurants = data
                return callback(null, restaurants)
        })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  static restaurantIsFavorite(restaurantId) {
    fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=true`, {
      method: 'PUT'
    }).then(() => {
      console.log('its your favorite')
      var worker = new Worker('./worker.js')
      worker.postMessage({
        isFavorite: true,
        restaurantId,
        store: 'id',
        command: 'isFavorite'
      })
      worker.onmessage = result => {
          console.log(result)
      }
    })
  }
  
  static restaurantNotFavorite(restaurantId) {
    fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=false`, {
      method: 'PUT'
    }).then(() => {
      console.log('not your favorite')
      var worker = new Worker('./worker.js')
      worker.postMessage({
        isFavorite: false,
        restaurantId,
        store: 'id',
        command: 'isFavorite'
      })
      worker.onmessage = result => {
          console.log(result)
      }
    })
  }

  static fetchRestaurantReviews(id, callback) {
      fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
        .then(response => {
                return response.json()
        }).then(data => {
                const reviews = data
                return callback(null, reviews)
        })

  }

  static sendRestaurantReview(id, name, rating, comments, callback) {
      
     const reviewBody = {
       'restaurant_id': id,
       'name': name,
       'rating': rating,
       'comments': comments
     }

      fetch(`http://localhost:1337/reviews/`, {
        headers: {
          'Content-Type': 'application/form-data'
        },
        method: 'POST',
        body: JSON.stringify(reviewBody)
      }).then(() => {
          console.log('updated')
      })

  }
}

