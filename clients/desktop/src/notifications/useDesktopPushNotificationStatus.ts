import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useQuery } from '@tanstack/react-query'
import { computeNotificationVaultId } from '@vultisig/sdk'

import { desktopPushRegistrationQueryKey } from './desktopNotificationQueryKeys'
import { isDesktopVaultRegistered } from './desktopNotificationStorage'

/** Query whether the current vault is registered for desktop push notifications. */
export const useDesktopPushNotificationStatus = () => {
  const vault = useCurrentVault()

  return useQuery({
    queryKey: [
      desktopPushRegistrationQueryKey,
      vault.publicKeys.ecdsa,
      vault.hexChainCode,
    ],
    queryFn: async () => {
      const vaultId = await computeNotificationVaultId(
        vault.publicKeys.ecdsa,
        vault.hexChainCode
      )
      return isDesktopVaultRegistered(vaultId)
    },
  })
}
