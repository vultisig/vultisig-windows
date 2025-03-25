import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { EagerQuery } from '@lib/ui/query/Query'
import { order } from '@lib/utils/array/order'
import { sum } from '@lib/utils/array/sum'
import { recordMap } from '@lib/utils/record/recordMap'
import { toEntries } from '@lib/utils/record/toEntries'
import { useMemo } from 'react'

import { useBalancesQuery } from '../../coin/query/useBalancesQuery'
import { useCoinPricesQuery } from '../../coin/query/useCoinPricesQuery'
import {
  useCurrentVaultCoins,
  useCurrentVaultCoinsByChain,
} from '../state/currentVault'
import { VaultChainCoin } from './useVaultChainCoinsQuery'

export type VaultChainBalance = {
  chain: Chain
  coins: VaultChainCoin[]
}

export const useVaultChainsBalancesQuery = (): EagerQuery<
  VaultChainBalance[]
> => {
  const coins = useCurrentVaultCoins()
  const groupedCoins = useCurrentVaultCoinsByChain()

  const pricesQuery = useCoinPricesQuery({
    coins: coins,
  })

  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  return useMemo(() => {
    const isPending = pricesQuery.isPending || balancesQuery.isPending

    const balancesByChain = recordMap(groupedCoins, coins => {
      return coins.map(coin => {
        const getAmount = () => {
          if (balancesQuery.data) {
            const key = coinKeyToString(coin)
            if (key in balancesQuery.data) {
              return balancesQuery.data[key]
            }
          }

          return BigInt(0)
        }

        const price = pricesQuery?.data?.[coinKeyToString(coin)] ?? 0
        return {
          ...coin,
          amount: getAmount(),
          price,
        }
      })
    })

    const data = order(
      toEntries(balancesByChain).map(({ key, value }) => ({
        chain: key,
        coins: value,
      })),
      ({ coins }) => sum(coins.map(getCoinValue)),
      'desc'
    )

    return {
      isPending,
      data,
      errors: [...balancesQuery.errors, ...pricesQuery.errors],
    }
  }, [groupedCoins, pricesQuery, balancesQuery])
}
