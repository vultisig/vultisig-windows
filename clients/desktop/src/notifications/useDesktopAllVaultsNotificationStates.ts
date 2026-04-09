import { useVaults } from '@core/ui/storage/vaults'
import { useQuery } from '@tanstack/react-query'
import { computeNotificationVaultId } from '@vultisig/sdk'

import { desktopPushRegistrationQueryKey } from './desktopNotificationQueryKeys'
import { isDesktopVaultRegistered } from './desktopNotificationStorage'

/**
 * Query returning per-vault notification registration state for all vaults.
 * Keyed by ECDSA public key (the vault's identity used in UI item lists).
 */
export const useDesktopAllVaultsNotificationStates = () => {
  const vaults = useVaults()

  return useQuery({
    queryKey: [
      desktopPushRegistrationQueryKey,
      'allVaults',
      ...vaults.map(v => v.publicKeys.ecdsa),
    ],
    queryFn: async () => {
      const result: Record<string, boolean> = {}
      for (const vault of vaults) {
        if (!vault.hexChainCode) continue

        const notificationId = await computeNotificationVaultId(
          vault.publicKeys.ecdsa,
          vault.hexChainCode
        )
        result[vault.publicKeys.ecdsa] =
          isDesktopVaultRegistered(notificationId)
      }
      return result
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}
