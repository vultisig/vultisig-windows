import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'

import {
  fetchBondPositions,
  fetchChurns,
  fetchHealth,
  fetchNetworkInfo,
} from './services/mayachainBondService'
import { fetchMayaStakePositions } from './services/mayachainStake'
import { mayaDefiCoins } from './tokens'
import { DefiChainPositions } from './types'

type UseMayaDefiPositionsQueryOptions = {
  enabled?: boolean
}

export const useMayaDefiPositionsQuery = (
  options: UseMayaDefiPositionsQueryOptions = {}
) => {
  const { enabled = true } = options
  const address = useCurrentVaultAddress(Chain.MayaChain)
  const priceQuery = useCoinPricesQuery({ coins: mayaDefiCoins })

  // Same guard as useThorchainDefiPositionsQuery: don't snapshot the eager
  // price query's partial (zero-filled) data into the positions cache.
  const isEnabled =
    enabled &&
    Boolean(address) &&
    !priceQuery.isPending &&
    Boolean(priceQuery.data)

  return useQuery<DefiChainPositions>({
    queryKey: ['defi', 'mayachain', 'positions', address],
    enabled: isEnabled,
    queryFn: async () => {
      const prices = priceQuery.data ?? {}

      const [churns, networkInfo, health] = await Promise.all([
        fetchChurns(),
        fetchNetworkInfo(),
        fetchHealth(),
      ])

      const [bond, stake] = await Promise.all([
        fetchBondPositions({
          address,
          prices,
          churns: churns ?? [],
          networkInfo: networkInfo ?? {},
          health: health ?? {},
        }),
        fetchMayaStakePositions({ address, prices }),
      ])

      return {
        bond,
        stake,
        prices,
      }
    },
  })
}
