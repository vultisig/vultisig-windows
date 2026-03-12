import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  PushForceRegisterVaultMessage,
  pushForceRegisterVaultType,
  PushUnregisterVaultMessage,
  pushUnregisterVaultType,
} from './pushNotificationMessages'
import {
  isVaultRegisteredForPush,
  setPushNotificationRegistration,
} from './pushNotificationStorage'
import { subscribeToPush } from './subscribeToPush'

const pushRegistrationQueryKey = 'pushNotificationRegistered'

export const usePushNotificationStatus = () => {
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)

  return useQuery({
    queryKey: [pushRegistrationQueryKey, vaultId],
    queryFn: () => isVaultRegisteredForPush(vaultId),
  })
}

export const useEnablePushNotificationsMutation = () => {
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const partyName = vault.localPartyId
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await subscribeToPush({ vaultId, partyName })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [pushRegistrationQueryKey, vaultId],
      })
    },
  })
}

export const useDisablePushNotificationsMutation = () => {
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const message: PushUnregisterVaultMessage = {
        type: pushUnregisterVaultType,
        vault: { vaultId, localPartyId: vault.localPartyId },
      }
      const response = await chrome.runtime.sendMessage(message)
      if (!response?.success) {
        throw new Error(response?.error ?? 'Failed to unregister')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [pushRegistrationQueryKey, vaultId],
      })
    },
  })
}

export const useForceRegisterPushNotificationMutation = () => {
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const message: PushForceRegisterVaultMessage = {
        type: pushForceRegisterVaultType,
        vault: { vaultId, localPartyId: vault.localPartyId },
      }
      const response = await chrome.runtime.sendMessage(message)
      if (!response?.success) {
        throw new Error(response?.error ?? 'Failed to register')
      }

      await setPushNotificationRegistration({
        vaultId,
        partyName: vault.localPartyId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [pushRegistrationQueryKey, vaultId],
      })
    },
  })
}
