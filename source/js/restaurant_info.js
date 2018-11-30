let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = `/images/${restaurant.id}-270.jpg`;
  image.alt = 'An image of the restaurant ' + restaurant.name;
  image.srcset = `/images/${restaurant.id}-270.jpg 300w, /images/${restaurant.id}-600.jpg 600w`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchRestaurantReviews(restaurant.id, fillReviewsHTML)
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (err, reviews) => {
  self.restaurant.reviews = reviews;
  const container = document.getElementById('reviews-container');

  const reviewHeader = document.createElement('div')
  reviewHeader.className = "reviewHeader"
  container.appendChild(reviewHeader);

  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  reviewHeader.appendChild(title)

  const addReviewsButton = document.createElement('button')
  addReviewsButton.className = "addReviewsButton"
  addReviewsButton.innerHTML = 'Add a Review'
  reviewHeader.appendChild(addReviewsButton)

  const reviewsModal = document.getElementById('addReviewModal')
  const opaqueContent = document.getElementById('maincontent')

  addReviewsButton.addEventListener('click', (event) => {
    reviewsModal.style.display = 'block';
    opaqueContent.style.opacity = '.3'
  })

  const cancelReview = document.getElementById('cancelReview')

  cancelReview.addEventListener('click', (event) => {
    event.preventDefault();
    reviewsModal.style.display = 'none';
    opaqueContent.style.opacity = '1';
  })

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

const submitButton = document.getElementById('submitReview')

submitButton.addEventListener('click', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const rating = document.getElementById('rating').value;
  const comments = document.getElementById('comments').value;

 
  var date = new Date(Date.now())
  var parsedDate = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
  
  var review = {
    name,
    rating,
    comments,
    id: self.restaurant.id,
    createdAt: parsedDate
  }

  //close modal
  const reviewsModal = document.getElementById('addReviewModal')
  const opaqueContent = document.getElementById('maincontent')
  reviewsModal.style.display = 'none';
  opaqueContent.style.opacity = '1';
  

  //register Background Sync

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(sw => {
        var worker = new Worker('./worker.js')
        worker.postMessage({
          review,
          store: 'reviews-sync-store',
          command: 'sendReview'
        })
        worker.onmessage = result => {
            console.log('syncing')
            return sw.sync.register('send-review');
        }
      })
  }



  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));

})

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const headingDiv = document.createElement('div');
  li.appendChild(headingDiv)

  const name = document.createElement('p');
  name.innerHTML = `Author: ${review.name}`;
  name.className = 'review-name';
  headingDiv.className = 'review-heading';
  headingDiv.appendChild(name);
  
  const date = document.createElement('p');
  reviewDate = new Date(review.createdAt);
  displayDate = `${reviewDate.getDay()}/${reviewDate.getDate()}/${reviewDate.getFullYear()}`;
  date.innerHTML = `Date: ${displayDate}`;
  date.className = 'review-date';
  headingDiv.appendChild(date);

  const reviewDiv = document.createElement('div')
  reviewDiv.className = 'review-info';
  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  li.appendChild(reviewDiv);
  reviewDiv.appendChild(rating)

  const comments = document.createElement('p');
  comments.innerHTML = `${review.comments}`;
  comments.className = 'review-comment'
  reviewDiv.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute("aria-current", "page");
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
  .then(function(reg) {
    // registration worked
    console.log('Registration succeeded. Scope is ' + reg.scope);
  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}

