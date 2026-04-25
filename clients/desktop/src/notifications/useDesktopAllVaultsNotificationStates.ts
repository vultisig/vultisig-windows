import { useVaults } from '@core/ui/storage/vaults'
import { useQuery } from '@tanstack/react-query'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { computeNotificationVaultId } from '@vultisig/sdk'

import { desktopPushRegistrationQueryKey } from './desktopNotificationQueryKeys'
import { isDesktopVaultRegistered } from './desktopNotificationStorage'

/**
 * Query returning per-vault notification registration state for all vaults.
 * Keys match `getVaultId` / `toVaultNotificationItems` row ids.
 */
export const useDesktopAllVaultsNotificationStates = () => {
  const vaults = useVaults()

  return useQuery({
    queryKey: [
      desktopPushRegistrationQueryKey,
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
        result[getVaultId(vault)] = isDesktopVaultRegistered(notificationId)
      }
      return result
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}
