import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'

import { joinDefiPositionsWithPrices } from './joinDefiPositionsWithPrices'
import {
  fetchBondPositions,
  fetchChurns,
  fetchHealth,
  fetchNetwork,
  fetchNetworkInfo,
} from './services/thorchainBondService'
import { fetchStakePositions } from './services/thorchainStake'
import { thorchainDefiCoins } from './tokens'
import { RawDefiChainPositions } from './types'

type UseThorchainDefiPositionsQueryOptions = {
  enabled?: boolean
}

/**
 * THORChain bond and stake positions with fiat values. The address-keyed
 * cache holds price-free raw data; fiat is joined from the live price query
 * at render, so a transient price failure or partial price data can never be
 * snapshotted into the cache — values self-correct as soon as prices resolve.
 */
export const useThorchainDefiPositionsQuery = (
  options: UseThorchainDefiPositionsQueryOptions = {}
) => {
  const { enabled = true } = options
  const address = useCurrentVaultAddress(Chain.THORChain)
  const priceQuery = useCoinPricesQuery({ coins: thorchainDefiCoins })

  const positionsQuery = useQuery<RawDefiChainPositions>({
    queryKey: ['defi', 'thorchain', 'positions', address],
    enabled: enabled && Boolean(address),
    queryFn: async () => {
      const [churns, networkInfo, health, network] = await Promise.all([
        fetchChurns(),
        fetchNetworkInfo(),
        fetchHealth(),
        fetchNetwork(),
      ])

      const bond = await fetchBondPositions(
        address,
        churns ?? [],
        networkInfo ?? {},
        health ?? {},
        !network?.vaults_migrating
      )

      const stake = await fetchStakePositions(address)

      return { bond, stake }
    },
  })

  return useTransformQueryData(positionsQuery, positions =>
    joinDefiPositionsWithPrices({
      positions,
      prices: priceQuery.data ?? {},
    })
  )
}
