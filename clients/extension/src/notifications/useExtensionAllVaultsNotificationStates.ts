import { useVaults } from '@core/ui/storage/vaults'
import { useQuery } from '@tanstack/react-query'
import { computeNotificationVaultId } from '@vultisig/sdk'

import { extensionPushRegistrationQueryKey } from './extensionPushRegistrationQueryKey'
import { isVaultRegisteredForPush } from './pushNotificationStorage'

export const useExtensionAllVaultsNotificationStates = () => {
  const vaults = useVaults()

  return useQuery({
    queryKey: [
      extensionPushRegistrationQueryKey,
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
          await isVaultRegisteredForPush(notificationId)
      }
      return result
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}
