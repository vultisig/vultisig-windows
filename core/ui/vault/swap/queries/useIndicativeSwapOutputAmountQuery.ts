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

import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { getSwapPayoutEstimate } from './swapPayoutModel'
import { useLastSwapPayoutModel } from './useLastSwapPayoutModel'

type GetSpotSwapOutputAmountInput = {
  amount: number
  fromPrice: number
  toPrice: number
}

/**
 * What the pair is worth at spot prices, gross of every fee. Used only until
 * the pair's first firm quote reveals what it actually costs — it runs 10-12%
 * above the quote that replaces it at small trade sizes.
 */
const getSpotSwapOutputAmount = ({
  amount,
  fromPrice,
  toPrice,
}: GetSpotSwapOutputAmountInput): number => (amount * fromPrice) / toPrice

/**
 * The output estimate shown while a firm swap quote is loading: the payout
 * predicted by the model fitted to the previous firm quote for this pair,
 * falling back to spot until there is one.
 */
export const useIndicativeSwapOutputAmountQuery = (): Query<number> => {
  const [fromAmount] = useFromAmount()
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const fromPriceQuery = useCoinPriceQuery({ coin: fromCoin })
  const toPriceQuery = useCoinPriceQuery({ coin: toCoin })
  const payoutModel = useLastSwapPayoutModel()

  const pricesQuery = useCombineQueries({
    queries: {
      fromPrice: fromPriceQuery,
      toPrice: toPriceQuery,
    },
    joinData: data => data,
    eager: false,
  })

  if (fromAmount === null) {
    return inactiveQuery
  }

  const amount = fromChainAmount(fromAmount, fromCoin.decimals)

  if (payoutModel) {
    return getResolvedQuery(
      getSwapPayoutEstimate({ amount, model: payoutModel })
    )
  }

  if (pricesQuery.data) {
    const { fromPrice, toPrice } = pricesQuery.data

    if (toPrice <= 0) {
      return inactiveQuery
    }

    return getResolvedQuery(
      getSpotSwapOutputAmount({ amount, fromPrice, toPrice })
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
}
