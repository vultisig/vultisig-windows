import { persistentStorage } from '../state/persistentState'

/** Window event: registration map changed (connect/disconnect WebSockets). */
export const desktopNotificationRegistrationsChangedEvent =
  'vultisig:desktopNotificationRegistrationsChanged'

const dispatchRegistrationsChanged = (): void => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(desktopNotificationRegistrationsChangedEvent))
}

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
    const stored =
      persistentStorage.getItem<DesktopNotificationRegistrations>(storageKey)
    return stored ? { ...stored } : {}
  }

type SetDesktopNotificationRegistrationInput = {
  vaultId: string
  partyName: string
}

/** Store a vault's notification registration. */
export const setDesktopNotificationRegistration = ({
  vaultId,
  partyName,
}: SetDesktopNotificationRegistrationInput): void => {
  const registrations = getDesktopNotificationRegistrations()
  registrations[vaultId] = {
    vaultId,
    partyName,
    registeredAt: Date.now(),
  }
  persistentStorage.setItem(storageKey, registrations)
  dispatchRegistrationsChanged()
}

/** Remove a vault's notification registration. */
export const removeDesktopNotificationRegistration = (
  vaultId: string
): void => {
  const registrations = getDesktopNotificationRegistrations()
  delete registrations[vaultId]
  persistentStorage.setItem(storageKey, registrations)
  dispatchRegistrationsChanged()
}

/** Check if a vault is registered for desktop notifications. */
export const isDesktopVaultRegistered = (vaultId: string): boolean => {
  return Object.hasOwn(getDesktopNotificationRegistrations(), vaultId)
}
