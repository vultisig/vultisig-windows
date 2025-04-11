import { Chain } from '@core/chain/Chain'
import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { DeleteCoin } from '../../../wailsjs/go/storage/Store'
import { vaultsQueryKey } from '../queries/useVaultsQuery'
import { useCurrentVaultAddreses } from '../state/currentVaultCoins'

export const useDeleteCoinMutation = () => {
  const vault = useCurrentVault()

  const invalidate = useInvalidateQueries()

  const addresses = useCurrentVaultAddreses()

  return useMutation({
    mutationFn: async (key: CoinKey) => {
      const address = addresses[key.chain as Chain]

      await DeleteCoin(
        getVaultId(vault),
        accountCoinKeyToString({
          ...key,
          address,
        })
      )

      await invalidate(vaultsQueryKey)
    },
  })
}
