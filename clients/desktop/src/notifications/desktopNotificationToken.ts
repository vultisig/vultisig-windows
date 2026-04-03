import { persistentStorage } from '../state/persistentState'

const desktopNotificationTokenStorageKey = 'vultisig_desktop_notification_token'

/** Get or create a unique device token for desktop notification registration. */
export const getOrCreateDesktopNotificationToken = (): string => {
  const existing = persistentStorage.getItem<string>(
    desktopNotificationTokenStorageKey
  )
  if (existing) return existing

  const token = crypto.randomUUID()
  persistentStorage.setItem(desktopNotificationTokenStorageKey, token)
  return token
}
