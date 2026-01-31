self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("quiz-cache").then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./questions.json",
        "./manifest.json"
      ])
    )
  );
});
