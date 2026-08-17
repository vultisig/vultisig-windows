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
  fetchNetworkInfo,
} from './services/mayachainBondService'
import { fetchMayaStakePositions } from './services/mayachainStake'
import { mayaDefiCoins } from './tokens'
import { RawDefiChainPositions } from './types'

type UseMayaDefiPositionsQueryOptions = {
  enabled?: boolean
}

/**
 * MayaChain bond and stake positions with fiat values. Same shape as
 * useThorchainDefiPositionsQuery: the cache holds price-free raw data and
 * fiat is joined from the live price query at render.
 */
export const useMayaDefiPositionsQuery = (
  options: UseMayaDefiPositionsQueryOptions = {}
) => {
  const { enabled = true } = options
  const address = useCurrentVaultAddress(Chain.MayaChain)
  const priceQuery = useCoinPricesQuery({ coins: mayaDefiCoins })

  const positionsQuery = useQuery<RawDefiChainPositions>({
    queryKey: ['defi', 'mayachain', 'positions', address],
    enabled: enabled && Boolean(address),
    queryFn: async () => {
      const [churns, networkInfo, health] = await Promise.all([
        fetchChurns(),
        fetchNetworkInfo(),
        fetchHealth(),
      ])

      const [bond, stake] = await Promise.all([
        fetchBondPositions({
          address,
          churns: churns ?? [],
          networkInfo: networkInfo ?? {},
          health: health ?? {},
        }),
        fetchMayaStakePositions(address),
      ])

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
