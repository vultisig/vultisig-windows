import { useToast } from '@lib/ui/toast/ToastProvider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { computeNotificationVaultId } from '@vultisig/sdk'
import { useTranslation } from 'react-i18next'

import { extensionPushRegistrationQueryKey } from './extensionPushRegistrationQueryKey'
import {
  PushUnregisterVaultMessage,
  pushUnregisterVaultType,
} from './pushNotificationMessages'
import { subscribeToPush } from './subscribeToPush'

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

type UnregisterExtensionVaultInput = {
  vaultId: string
  localPartyId: string
}

const unregisterExtensionVault = async ({
  vaultId,
  localPartyId,
}: UnregisterExtensionVaultInput): Promise<void> => {
  const message: PushUnregisterVaultMessage = {
    type: pushUnregisterVaultType,
    vault: { vaultId, localPartyId },
  }
  const response = await chrome.runtime.sendMessage(message)
  if (!response?.success) {
    throw new Error(response?.error ?? 'Failed to unregister')
  }
}

/** Toggle push registration for one vault via the extension service worker. */
export const useExtensionToggleVaultNotificationMutation = () => {
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
      const vaultId = await computeNotificationVaultId(ecdsa, hexChainCode)

      if (enabled) {
        await subscribeToPush({ vaultId, partyName: localPartyId })
      } else {
        await unregisterExtensionVault({ vaultId, localPartyId })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [extensionPushRegistrationQueryKey],
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

/** Enable or disable push for each vault in the batch. */
export const useExtensionToggleAllVaultsNotificationMutation = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      vaults,
      enabled,
    }: ToggleAllVaultsNotificationInput) => {
      let failedCount = 0

      for (const vault of vaults) {
        try {
          const vaultId = await computeNotificationVaultId(
            vault.ecdsa,
            vault.hexChainCode
          )

          if (enabled) {
            await subscribeToPush({
              vaultId,
              partyName: vault.localPartyId,
            })
          } else {
            await unregisterExtensionVault({
              vaultId,
              localPartyId: vault.localPartyId,
            })
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
        queryKey: [extensionPushRegistrationQueryKey],
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
