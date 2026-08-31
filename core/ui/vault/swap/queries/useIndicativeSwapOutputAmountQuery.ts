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
import {
  FirmSwapQuoteReference,
  useLastFirmSwapQuoteReference,
} from './useLastFirmSwapQuoteReference'

type Prices = {
  fromPrice: number
  toPrice: number
}

type GetImpliedSwapFeeInput = Prices & {
  reference: FirmSwapQuoteReference
}

/**
 * What the last firm quote charged, expressed in destination-token units: the
 * gap between what spot prices imply the swap is worth and what the provider
 * actually promised.
 *
 * Re-applied to a new amount as a flat cost, because the components that
 * dominate it — the network fee and the protocol's outbound fee — are flat
 * amounts that do not scale with trade size. The part that does scale is the
 * affiliate bps, a fraction of a percent, so carrying the whole figure over
 * errs on the conservative side by less than that.
 */
export const getImpliedSwapFee = ({
  reference,
  fromPrice,
  toPrice,
}: GetImpliedSwapFeeInput): number => {
  const spotValueOfInput = (reference.input * fromPrice) / toPrice

  return Math.max(spotValueOfInput - reference.output, 0)
}

type GetIndicativeSwapOutputAmountInput = Prices & {
  amount: number
  impliedFee: number
}

/**
 * The payout to show while a firm quote resolves. Spot value less the fee the
 * last firm quote for this pair revealed — without that subtraction the figure
 * runs 10-12% above the quote that replaces it at these trade sizes, which
 * reads as a worse rate arriving rather than an estimate settling.
 *
 * Floors at zero: a trade too small to cover the flat fees really does pay out
 * nothing, and a negative payout is not a thing to display.
 */
export const getIndicativeSwapOutputAmount = ({
  amount,
  fromPrice,
  toPrice,
  impliedFee,
}: GetIndicativeSwapOutputAmountInput): number =>
  Math.max((amount * fromPrice) / toPrice - impliedFee, 0)

/**
 * A price-based output estimate for while a firm swap quote is loading,
 * corrected by the fees the previous firm quote for the same pair revealed.
 */
export const useIndicativeSwapOutputAmountQuery = (): Query<number> => {
  const [fromAmount] = useFromAmount()
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const fromPriceQuery = useCoinPriceQuery({ coin: fromCoin })
  const toPriceQuery = useCoinPriceQuery({ coin: toCoin })
  const reference = useLastFirmSwapQuoteReference()

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

  if (pricesQuery.data) {
    const { fromPrice, toPrice } = pricesQuery.data

    if (toPrice <= 0) {
      return inactiveQuery
    }

    const impliedFee = reference
      ? getImpliedSwapFee({ reference, fromPrice, toPrice })
      : 0

    return getResolvedQuery(
      getIndicativeSwapOutputAmount({
        amount: fromChainAmount(fromAmount, fromCoin.decimals),
        fromPrice,
        toPrice,
        impliedFee,
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
}
