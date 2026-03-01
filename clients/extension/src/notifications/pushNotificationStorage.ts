import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'
import { setStorageValue } from '@lib/extension/storage/set'

const pushNotificationKey = 'pushNotificationRegistrations'

type PushNotificationRegistration = {
  vaultId: string
  partyName: string
  registeredAt: number
}

type PushNotificationRegistrations = Record<
  string,
  PushNotificationRegistration
>

export const getPushNotificationRegistrations =
  async (): Promise<PushNotificationRegistrations> =>
    getStorageValue<PushNotificationRegistrations>(pushNotificationKey, {})

export const setPushNotificationRegistration = async (
  vaultId: string,
  partyName: string
): Promise<void> => {
  const registrations = await getPushNotificationRegistrations()
  registrations[vaultId] = {
    vaultId,
    partyName,
    registeredAt: Date.now(),
  }
  await setStorageValue(pushNotificationKey, registrations)
}

export const removePushNotificationRegistration = async (
  vaultId: string
): Promise<void> => {
  const registrations = await getPushNotificationRegistrations()
  delete registrations[vaultId]
  if (Object.keys(registrations).length === 0) {
    await removeStorageValue(pushNotificationKey)
  } else {
    await setStorageValue(pushNotificationKey, registrations)
  }
}

export const isVaultRegisteredForPush = async (
  vaultId: string
): Promise<boolean> => {
  const registrations = await getPushNotificationRegistrations()
  return vaultId in registrations
}

const pushServerUrlKey = 'pushNotificationServerUrl'

export const getPushServerUrl = async (): Promise<string | null> =>
  getStorageValue<string | null>(pushServerUrlKey, null)

export const setPushServerUrl = async (url: string): Promise<void> => {
  await setStorageValue(pushServerUrlKey, url)
}
