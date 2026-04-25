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

type VaultNotificationTarget = {
  ecdsa: string
  hexChainCode: string
  localPartyId: string
}

type ToggleVaultNotificationInput = VaultNotificationTarget & {
  enabled: boolean
}

type ToggleAllVaultsNotificationInput = {
  vaults: VaultNotificationTarget[]
  enabled: boolean
}

const requestNotificationPermissionIfNeeded = async (): Promise<void> => {
  if (typeof Notification === 'undefined') {
    throw new Error('Notifications are unavailable')
  }

  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission

  if (permission !== 'granted') {
    throw new Error(`Notification permission not granted: ${permission}`)
  }
}

/** Toggle push registration for a single vault on desktop (Wails). */
export const useDesktopToggleVaultNotificationMutation = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      ecdsa,
      hexChainCode,
      localPartyId,
      enabled,
    }: ToggleVaultNotificationInput) => {
      if (enabled) {
        await requestNotificationPermissionIfNeeded()
      }

      const vaultId = await computeNotificationVaultId(ecdsa, hexChainCode)
      const token = getOrCreateDesktopNotificationToken()

      if (enabled) {
        await registerDesktopDevice({
          vaultId,
          partyName: localPartyId,
          token,
        })
        setDesktopNotificationRegistration({ vaultId, partyName: localPartyId })
      } else {
        await unregisterDesktopDevice({
          vaultId,
          partyName: localPartyId,
          token,
        })
        removeDesktopNotificationRegistration(vaultId)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [desktopPushRegistrationQueryKey],
      })
    },
    onError: (_error, { enabled }) => {
      addToast({
        message: enabled
          ? t('desktop_push_notification_enable_failed')
          : t('desktop_push_notification_disable_failed'),
      })
    },
  })
}

/** Enable or disable push for every vault passed in (batch). */
export const useDesktopToggleAllVaultsNotificationMutation = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      vaults,
      enabled,
    }: ToggleAllVaultsNotificationInput) => {
      if (enabled) {
        await requestNotificationPermissionIfNeeded()
      }

      const token = getOrCreateDesktopNotificationToken()
      let failedCount = 0

      for (const vault of vaults) {
        try {
          const vaultId = await computeNotificationVaultId(
            vault.ecdsa,
            vault.hexChainCode
          )

          if (enabled) {
            await registerDesktopDevice({
              vaultId,
              partyName: vault.localPartyId,
              token,
            })
            setDesktopNotificationRegistration({
              vaultId,
              partyName: vault.localPartyId,
            })
          } else {
            await unregisterDesktopDevice({
              vaultId,
              partyName: vault.localPartyId,
              token,
            })
            removeDesktopNotificationRegistration(vaultId)
          }
        } catch {
          failedCount++
        }
      }

      if (failedCount > 0) {
        throw new Error(
          `Failed to ${enabled ? 'register' : 'unregister'} ${failedCount} vault(s)`
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [desktopPushRegistrationQueryKey],
      })
    },
    onError: (_error, { enabled }) => {
      addToast({
        message: enabled
          ? t('desktop_push_notification_enable_failed')
          : t('desktop_push_notification_disable_failed'),
      })
    },
  })
}
