import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  isVaultRegisteredForPush,
  removePushNotificationRegistration,
  setPushServerUrl,
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
      await removePushNotificationRegistration(vaultId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [pushRegistrationQueryKey, vaultId],
      })
    },
  })
}

export const useSetPushServerUrlMutation = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      await setPushServerUrl(url)
    },
  })
}
