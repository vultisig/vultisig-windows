import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { computeNotificationVaultId } from '@vultisig/sdk'

import { extensionPushRegistrationQueryKey } from './extensionPushRegistrationQueryKey'
import {
  PushForceRegisterVaultMessage,
  pushForceRegisterVaultType,
} from './pushNotificationMessages'

export const useForceRegisterPushNotificationMutation = () => {
  const vault = useCurrentVault()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const vaultId = await computeNotificationVaultId(
        vault.publicKeys.ecdsa,
        vault.hexChainCode
      )
      const message: PushForceRegisterVaultMessage = {
        type: pushForceRegisterVaultType,
        vault: { vaultId, localPartyId: vault.localPartyId },
      }
      const response = await chrome.runtime.sendMessage(message)
      if (!response?.success) {
        throw new Error(response?.error ?? 'Failed to register')
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [extensionPushRegistrationQueryKey],
      })
    },
  })
}
