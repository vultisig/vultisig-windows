import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'

import {
  fetchBondPositions,
  fetchChurns,
  fetchHealth,
  fetchNetwork,
  fetchNetworkInfo,
} from './services/thorchainBondService'
import { fetchStakePositions } from './services/thorchainStake'
import { thorchainDefiCoins } from './tokens'
import { DefiChainPositions } from './types'

type UseThorchainDefiPositionsQueryOptions = {
  enabled?: boolean
}

export const useThorchainDefiPositionsQuery = (
  options: UseThorchainDefiPositionsQueryOptions = {}
) => {
  const { enabled = true } = options
  const address = useCurrentVaultAddress(Chain.THORChain)
  const priceQuery = useCoinPricesQuery({ coins: thorchainDefiCoins })

  // The eager price query exposes partial data (missing coins zero-filled) as
  // soon as one of its sub-queries resolves. Positions snapshot prices into a
  // cache keyed only by address, so firing on partial data would pin e.g. the
  // staked RUJI card at $0 — wait until every price sub-query settles.
  const isEnabled =
    enabled &&
    Boolean(address) &&
    !priceQuery.isPending &&
    Boolean(priceQuery.data)

  return useQuery<DefiChainPositions>({
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

      const stake = await fetchStakePositions({ address, prices })

      return {
        bond,
        stake,
        prices,
      }
    },
  })
}
