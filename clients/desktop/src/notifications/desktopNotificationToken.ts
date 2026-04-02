const desktopNotificationTokenStorageKey = 'vultisig_desktop_notification_token'

/** Get or create a unique device token for desktop notification registration. */
export const getOrCreateDesktopNotificationToken = (): string => {
  const existing = localStorage.getItem(desktopNotificationTokenStorageKey)
  if (existing) return existing

  const token = crypto.randomUUID()
  localStorage.setItem(desktopNotificationTokenStorageKey, token)
  return token
}
