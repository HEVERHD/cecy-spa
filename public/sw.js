const CACHE_NAME = "cecy-spa-v2"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return
  if (event.request.url.includes("localhost")) return
  if (event.request.url.includes("/api/") || event.request.url.includes("/_next/")) return

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Push notification received
self.addEventListener("push", (event) => {
  let data = { title: "Cecy Spa", body: "Tienes una notificación nueva." }
  if (event.data) {
    try { data = event.data.json() } catch { data.body = event.data.text() || data.body }
  }

  const options = {
    body: data.body || "",
    icon: "/logo.png",
    tag: data.tag || "cecy-spa-notification",
    renotify: true,
    data: { url: data.url || "/dashboard" },
  }

  event.waitUntil(self.registration.showNotification(data.title || "Cecy Spa", options))
})

// Notification clicked → open dashboard
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/dashboard"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
