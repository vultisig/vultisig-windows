import { registerFirefoxDevice } from './firefoxNotificationApi'
import { getOrCreateFirefoxNotificationToken } from './firefoxNotificationToken'
import {
  PushForceRegisterVaultMessage,
  pushForceRegisterVaultType,
} from './pushNotificationMessages'
import { setPushNotificationRegistration } from './pushNotificationStorage'

type SubscribeToPushInput = {
  vaultId: string
  partyName: string
}

export const subscribeToPush = async ({
  vaultId,
  partyName,
}: SubscribeToPushInput): Promise<void> => {
  if (__IS_FIREFOX_EXTENSION_BUILD__) {
    const token = await getOrCreateFirefoxNotificationToken()
    await registerFirefoxDevice({ vaultId, partyName, token })
    await setPushNotificationRegistration({ vaultId, partyName })
    return
  }

  const message: PushForceRegisterVaultMessage = {
    type: pushForceRegisterVaultType,
    vault: { vaultId, localPartyId: partyName },
  }

  const response = await chrome.runtime.sendMessage(message)
  if (!response?.success) {
    throw new Error(response?.error ?? 'Failed to register for push')
  }
}
