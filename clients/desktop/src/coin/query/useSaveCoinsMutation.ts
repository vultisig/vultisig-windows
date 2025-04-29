import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { vaultsQueryKey } from '@core/ui/query/keys'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { toStorageCoin } from '../../storage/storageCoin'

export const useSaveCoinsMutation = () => {
  const vault = useCurrentVault()

  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async (coins: AccountCoin[]) => {
      await SaveCoins(getVaultId(vault), coins.map(toStorageCoin))
      await invalidateQueries(vaultsQueryKey)
    },
  })
}
