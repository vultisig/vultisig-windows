import { persistentStorage } from '../state/persistentState'

type DesktopNotificationRegistration = {
  vaultId: string
  partyName: string
  registeredAt: number
}

type DesktopNotificationRegistrations = Record<
  string,
  DesktopNotificationRegistration
>

const storageKey = 'desktopNotificationRegistrations'

/** Get all desktop notification registrations. */
export const getDesktopNotificationRegistrations =
  (): DesktopNotificationRegistrations => {
    return (
      persistentStorage.getItem<DesktopNotificationRegistrations>(storageKey) ??
      {}
    )
  }

/** Store a vault's notification registration. */
export const setDesktopNotificationRegistration = ({
  vaultId,
  partyName,
}: {
  vaultId: string
  partyName: string
}): void => {
  const registrations = getDesktopNotificationRegistrations()
  registrations[vaultId] = {
    vaultId,
    partyName,
    registeredAt: Date.now(),
  }
  persistentStorage.setItem(storageKey, registrations)
}

/** Remove a vault's notification registration. */
export const removeDesktopNotificationRegistration = (
  vaultId: string
): void => {
  const registrations = getDesktopNotificationRegistrations()
  delete registrations[vaultId]
  persistentStorage.setItem(storageKey, registrations)
}

/** Check if a vault is registered for desktop notifications. */
export const isDesktopVaultRegistered = (vaultId: string): boolean => {
  return Object.hasOwn(getDesktopNotificationRegistrations(), vaultId)
}
