/**
 * Chrome requires `push`, `notificationclick`, and `pushsubscriptionchange`
 * listeners to be registered during the **initial synchronous evaluation** of the
 * service worker script. The same holds for `chrome.notifications` events: a
 * click on a push notification wakes a dormant worker, and the click is dropped
 * if nothing listens by the end of that evaluation. The rest of the background
 * bundle runs only after a WASM top-level await, so these listeners cannot live
 * there. Keep this file free of heavy static imports; handler bodies live in
 * {@link ./handlePushEvents} and load via dynamic `import()`.
 */

self.addEventListener('push', (event: any) => {
  event.waitUntil(
    import('./handlePushEvents').then(mod => mod.handlePushEvent(event))
  )
})

self.addEventListener('notificationclick', (event: any) => {
  event.waitUntil(
    import('./handlePushEvents').then(mod =>
      mod.handleNotificationClickEvent(event)
    )
  )
})

self.addEventListener('pushsubscriptionchange', (event: any) => {
  event.waitUntil(
    import('./handlePushEvents').then(mod =>
      mod.handlePushSubscriptionChangeEvent(event)
    )
  )
})

if (typeof chrome !== 'undefined' && chrome.notifications) {
  chrome.notifications.onClicked.addListener(notificationId => {
    void import('./handlePushEvents').then(mod =>
      mod.handlePushChromeNotificationClicked(notificationId)
    )
  })

  chrome.notifications.onClosed.addListener(notificationId => {
    void import('./handlePushEvents').then(mod =>
      mod.handlePushChromeNotificationClosed(notificationId)
    )
  })
}
