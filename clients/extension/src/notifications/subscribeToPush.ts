import {
  PushRegisterVaultsMessage,
  pushRegisterVaultsType,
} from './pushNotificationMessages'

type SubscribeToPushInput = {
  vaultId: string
  partyName: string
}

export const subscribeToPush = async ({
  vaultId,
  partyName,
}: SubscribeToPushInput): Promise<void> => {
  const message: PushRegisterVaultsMessage = {
    type: pushRegisterVaultsType,
    vaults: [{ vaultId, localPartyId: partyName }],
  }

  const response = await chrome.runtime.sendMessage(message)
  if (!response?.success) {
    throw new Error(response?.error ?? 'Failed to register for push')
  }
}
