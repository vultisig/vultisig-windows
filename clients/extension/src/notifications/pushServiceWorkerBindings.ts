/**
 * Chrome requires `push`, `notificationclick`, and `pushsubscriptionchange`
 * listeners to be registered during the **initial synchronous evaluation** of the
 * service worker script. Keep this file free of heavy static imports; handler
 * bodies live in {@link ./handlePushEvents} and load via dynamic `import()`.
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
