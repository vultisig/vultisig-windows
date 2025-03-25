import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { storage } from '../../../wailsjs/go/models'
import { SaveVault } from '../../../wailsjs/go/storage/Store'
import { useDefaultChains } from '../../chain/state/defaultChains'
import { createVaultDefaultCoins } from '../coins/createVaultDefaultCoins'
import { useVaults, vaultsQueryKey } from '../queries/useVaultsQuery'
import { useCurrentVaultId } from '../state/currentVaultId'
import { getStorageVaultId } from '../utils/storageVault'

export const useSaveVaultMutation = (
  options?: UseMutationOptions<any, any, storage.Vault, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()
  const walletCore = useAssertWalletCore()
  const vaults = useVaults()
  const [, setCurrentVaultId] = useCurrentVaultId()

  const [defaultChains] = useDefaultChains()

  return useMutation({
    mutationFn: async (vault: storage.Vault) => {
      const order = getLastItemOrder(vaults.map(vault => vault.order))
      const newVault: storage.Vault = {
        ...vault,
        order,
        convertValues: () => {},
      }

      console.log('saving vault: ', newVault)

      await SaveVault(newVault)

      await createVaultDefaultCoins({
        vault: newVault,
        defaultChains,
        walletCore,
      })

      await invalidateQueries(vaultsQueryKey)

      setCurrentVaultId(getStorageVaultId(newVault))

      return newVault
    },
    ...options,
  })
}
