import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import {
  getResolvedQuery,
  inactiveQuery,
  pendingQuery,
  Query,
} from '@lib/ui/query/Query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { useMemo } from 'react'

import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

type Prices = {
  fromPrice: number
  toPrice: number
}

const getIndicativeSwapOutputAmount = ({
  amount,
  fromPrice,
  toPrice,
}: Prices & { amount: number }) => {
  return (amount * fromPrice) / toPrice
}

export const useIndicativeSwapOutputAmountQuery = (): Query<number> => {
  const [fromAmount] = useFromAmount()
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const fromPriceQuery = useCoinPriceQuery({ coin: fromCoin })
  const toPriceQuery = useCoinPriceQuery({ coin: toCoin })

  const queriesRecord = useMemo(
    () => ({
      fromPrice: fromPriceQuery,
      toPrice: toPriceQuery,
    }),
    [fromPriceQuery, toPriceQuery]
  )

  const pricesQuery = useCombineQueries({
    queries: queriesRecord,
    joinData: data => data,
    eager: false,
  })

  return useMemo((): Query<number> => {
    if (fromAmount === null) {
      return inactiveQuery
    }

    if (pricesQuery.data) {
      const { fromPrice, toPrice } = pricesQuery.data

      if (toPrice <= 0) {
        return inactiveQuery
      }

      return getResolvedQuery(
        getIndicativeSwapOutputAmount({
          amount: fromChainAmount(fromAmount, fromCoin.decimals),
          fromPrice,
          toPrice,
        })
      )
    }

    if (pricesQuery.isPending) {
      return pendingQuery
    }

    return {
      data: undefined,
      isPending: false,
      error: pricesQuery.error,
    }
  }, [fromAmount, fromCoin.decimals, pricesQuery])
}
