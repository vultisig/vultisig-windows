import {
  PushForceRegisterVaultMessage,
  pushForceRegisterVaultType,
} from './pushNotificationMessages'

type SubscribeToPushInput = {
  vaultId: string
  partyName: string
}

export const subscribeToPush = async ({
  vaultId,
  partyName,
}: SubscribeToPushInput): Promise<void> => {
  const message: PushForceRegisterVaultMessage = {
    type: pushForceRegisterVaultType,
    vault: { vaultId, localPartyId: partyName },
  }

  const response = await chrome.runtime.sendMessage(message)
  if (!response?.success) {
    throw new Error(response?.error ?? 'Failed to register for push')
  }
}
