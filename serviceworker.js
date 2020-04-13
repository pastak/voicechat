self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // JSやHTMLはオンラインのときはキャッシュしない
      if (!/\/assets\/wav\//.test(event.request.url)) {
        if (navigator.onLine) return fetch(event.request)
      }
      return response || fetch(event.request);
    })
  );
});
