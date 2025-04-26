import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { vaultsQueryKey } from '@core/ui/query/keys'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { useQuery } from '@tanstack/react-query'
import { getVaults } from '../state/vaults'

const vaultsQueryFn = async (): Promise<
  (Vault & { coins: AccountCoin[] })[]
> => {
  const vaultsWithCoins = await getVaults()
  console.log('vaultsWithCoins:', vaultsWithCoins)

  if (!vaultsWithCoins.length) {
    return []
  }

  return sortEntitiesWithOrder(vaultsWithCoins).map(vault => {
    const vaultChains = vault.coins.filter(isFeeCoin).map(coin => coin.chain)

    return {
      ...vault,
      coins: vault.coins.filter(coin => vaultChains.includes(coin.chain)) ?? [],
    }
  })
}

export const useVaultsQuery = () => {
  return useQuery({
    queryKey: vaultsQueryKey,
    queryFn: vaultsQueryFn,
  })
}
