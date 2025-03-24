import { Chain } from '@core/chain/Chain'
import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { DeleteCoin } from '../../../wailsjs/go/storage/Store'
import { vaultsQueryKey } from '../queries/useVaultsQuery'
import { useCurrentVault, useCurrentVaultAddreses } from '../state/currentVault'
import { getStorageVaultId } from '../utils/storageVault'

export const useDeleteCoinMutation = () => {
  const vault = useCurrentVault()

  const invalidate = useInvalidateQueries()

  const addresses = useCurrentVaultAddreses()

  return useMutation({
    mutationFn: async (key: CoinKey) => {
      const address = addresses[key.chain as Chain]

      await DeleteCoin(
        getStorageVaultId(vault),
        accountCoinKeyToString({
          ...key,
          address,
        })
      )

      await invalidate(vaultsQueryKey)
    },
  })
}
