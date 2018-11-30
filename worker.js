importScripts('.js/idb.js')

self.onmessage = function(e) {
    var databaseURL = e.data
    fetch(databaseURL)
        .then(response => {
                return response.json()
        }).then(data => {
                const restaurants = data
                self.postMessage(restaurants)
        })
}