import { Chain } from '@core/chain/Chain'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'

import {
  fetchBondPositions,
  fetchChurns,
  fetchHealth,
  fetchNetwork,
  fetchNetworkInfo,
} from './services/thorchainBondService'
import { fetchStakePositions } from './services/thorchainStake'
import { thorchainDefiCoins } from './tokens'
import { ThorchainDefiPositions } from './types'

type UseThorchainDefiPositionsQueryOptions = {
  enabled?: boolean
}

export const useThorchainDefiPositionsQuery = (
  options: UseThorchainDefiPositionsQueryOptions = {}
) => {
  const { enabled = true } = options
  const address = useCurrentVaultAddress(Chain.THORChain)
  const priceQuery = useCoinPricesQuery({ coins: thorchainDefiCoins })

  const isEnabled = enabled && Boolean(address) && Boolean(priceQuery.data)

  return useQuery<ThorchainDefiPositions>({
    queryKey: ['defi', 'thorchain', 'positions', address],
    enabled: isEnabled,
    queryFn: async () => {
      const prices = priceQuery.data ?? {}

      const [churns, networkInfo, health, network] = await Promise.all([
        fetchChurns(),
        fetchNetworkInfo(),
        fetchHealth(),
        fetchNetwork(),
      ])

      const bond = await fetchBondPositions(
        address,
        prices,
        churns ?? [],
        networkInfo ?? {},
        health ?? {},
        !network?.vaults_migrating
      )

      const stake = await fetchStakePositions(address, prices)

      return {
        bond,
        stake,
        prices,
      }
    },
  })
}
