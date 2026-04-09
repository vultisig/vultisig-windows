import { useVaults } from '@core/ui/storage/vaults'
import { useQuery } from '@tanstack/react-query'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { computeNotificationVaultId } from '@vultisig/sdk'

import { extensionPushRegistrationQueryKey } from './extensionPushRegistrationQueryKey'
import { isVaultRegisteredForPush } from './pushNotificationStorage'

/**
 * Per-vault push registration flags for the extension, keyed by `getVaultId`
 * (same ids as `toVaultNotificationItems` rows).
 */
export const useExtensionAllVaultsNotificationStates = () => {
  const vaults = useVaults()

  return useQuery({
    queryKey: [
      extensionPushRegistrationQueryKey,
      'allVaults',
      ...vaults.map(v => `${v.publicKeys.ecdsa}:${v.hexChainCode ?? ''}`),
    ],
    queryFn: async () => {
      const result: Record<string, boolean> = {}
      for (const vault of vaults) {
        if (!vault.hexChainCode) continue

        const notificationId = await computeNotificationVaultId(
          vault.publicKeys.ecdsa,
          vault.hexChainCode
        )
        result[getVaultId(vault)] =
          await isVaultRegisteredForPush(notificationId)
      }
      return result
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}
