import { Chain } from '@core/chain/Chain'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'

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

  const isEnabled = enabled && Boolean(address) && Boolean(priceQuery.data)

  return useQuery<DefiChainPositions>({
    queryKey: ['defi', 'mayachain', 'positions', address],
    enabled: isEnabled,
    queryFn: async () => {
      const prices = priceQuery.data ?? {}
      const stake = await fetchMayaStakePositions({ address, prices })

      return {
        stake,
        prices,
      }
    },
  })
}
