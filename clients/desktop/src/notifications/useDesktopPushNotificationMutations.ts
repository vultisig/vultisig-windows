import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { computeNotificationVaultId } from '@vultisig/sdk'
import { useTranslation } from 'react-i18next'

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
  const { addToast } = useToast()
  const { t } = useTranslation()

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
    onError: () => {
      addToast({ message: t('desktop_push_notification_enable_failed') })
    },
  })
}

/** Mutation to disable desktop push notifications for the current vault. */
export const useDisableDesktopPushNotificationMutation = () => {
  const vault = useCurrentVault()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const { t } = useTranslation()

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
    onError: () => {
      addToast({ message: t('desktop_push_notification_disable_failed') })
    },
  })
}
