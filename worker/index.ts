/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || "EX-it.", {
        body: data.body || "You have a new message.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: data.data || { url: "/" },
      })
    );
  } catch (e) {
    console.error("Error processing push event:", e);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || "/";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
