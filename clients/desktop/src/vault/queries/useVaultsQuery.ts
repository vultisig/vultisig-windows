import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { vaultsQueryKey } from '@core/ui/query/keys'
import { Vault } from '@core/ui/vault/Vault'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { useQuery } from '@tanstack/react-query'

import { GetVaults } from '../../../wailsjs/go/storage/Store'
import { fromStorageCoin } from '../../storage/storageCoin'
import { fromStorageVault } from '../utils/storageVault'

const vaultsQueryFn = async (): Promise<
  (Vault & { coins: AccountCoin[] })[]
> => {
  const result = await GetVaults()

  if (result === null) {
    return []
  }

  return sortEntitiesWithOrder(result).map(({ coins, ...rest }) => {
    // We do not delete tokens on that chain when the user removes the chain from the vault.
    // We need to filter out tokens that do not have a corresponding chain in the vault.
    const allCoins = coins.map(fromStorageCoin)
    const vaultChains = allCoins.filter(isFeeCoin).map(coin => coin.chain)

    return {
      ...fromStorageVault(rest),
      coins: allCoins.filter(coin => vaultChains.includes(coin.chain)),
    }
  })
}

export const useVaultsQuery = () => {
  return useQuery({
    queryKey: vaultsQueryKey,
    queryFn: vaultsQueryFn,
  })
}
