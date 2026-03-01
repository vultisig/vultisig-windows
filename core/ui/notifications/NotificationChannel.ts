export type NotificationData = {
  title: string
  subtitle: string
  body: string
}

export type NotificationChannel = {
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  isSubscribed: () => Promise<boolean>
}
