import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { SaveVault } from '../../../wailsjs/go/storage/Store'
import { useDefaultChains } from '../../chain/state/defaultChains'
import { createVaultDefaultCoins } from '../coins/createVaultDefaultCoins'
import { vaultsQueryKey } from '../queries/useVaultsQuery'
import { useCurrentVaultId } from '../state/currentVaultId'
import { toStorageVault } from '../utils/storageVault'

export const useSaveVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()
  const walletCore = useAssertWalletCore()
  const [, setCurrentVaultId] = useCurrentVaultId()

  const [defaultChains] = useDefaultChains()

  return useMutation({
    mutationFn: async (vault: Vault) => {
      const storageVault = toStorageVault(vault)

      await SaveVault(storageVault)

      await createVaultDefaultCoins({
        vault,
        defaultChains,
        walletCore,
      })

      await invalidateQueries(vaultsQueryKey)

      setCurrentVaultId(getVaultId(vault))

      return vault
    },
    ...options,
  })
}
