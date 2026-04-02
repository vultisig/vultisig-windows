import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { computeNotificationVaultId } from '@vultisig/sdk'

import {
  registerDesktopDevice,
  unregisterDesktopDevice,
} from './desktopNotificationApi'
import { desktopPushRegistrationQueryKey } from './desktopNotificationQueryKeys'
import {
  removeDesktopNotificationRegistration,
  setDesktopNotificationRegistration,
} from './desktopNotificationStorage'
import { getOrCreateDesktopNotificationToken } from './desktopNotificationToken'

/** Mutation to enable desktop push notifications for the current vault. */
export const useEnableDesktopPushNotificationMutation = () => {
  const vault = useCurrentVault()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'default'
      ) {
        await Notification.requestPermission()
      }

      const vaultId = await computeNotificationVaultId(
        vault.publicKeys.ecdsa,
        vault.hexChainCode
      )
      const token = getOrCreateDesktopNotificationToken()

      await registerDesktopDevice({
        vaultId,
        partyName: vault.localPartyId,
        token,
      })
      setDesktopNotificationRegistration({
        vaultId,
        partyName: vault.localPartyId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          desktopPushRegistrationQueryKey,
          vault.publicKeys.ecdsa,
          vault.hexChainCode,
        ],
      })
    },
  })
}

/** Mutation to disable desktop push notifications for the current vault. */
export const useDisableDesktopPushNotificationMutation = () => {
  const vault = useCurrentVault()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const vaultId = await computeNotificationVaultId(
        vault.publicKeys.ecdsa,
        vault.hexChainCode
      )
      const token = getOrCreateDesktopNotificationToken()

      await unregisterDesktopDevice({
        vaultId,
        partyName: vault.localPartyId,
        token,
      })
      removeDesktopNotificationRegistration(vaultId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          desktopPushRegistrationQueryKey,
          vault.publicKeys.ecdsa,
          vault.hexChainCode,
        ],
      })
    },
  })
}
