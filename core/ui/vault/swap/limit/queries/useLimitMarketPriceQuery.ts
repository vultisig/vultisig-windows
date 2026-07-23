import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useQuery } from '@tanstack/react-query'
import { Coin, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import {
  getThorchainMemoAsset,
  isThorchainRoutable,
} from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

import { featureFlags } from '../../../../featureFlags'
import { fetchLimitSwapMarketPrice, getMarketProbeAmount } from '../marketPrice'

const limitMarketPriceQueryKeyPrefix = 'limitMarketPrice'

type UseLimitMarketPriceQueryInput = {
  fromCoin: Coin
  toCoin: Coin
}

/**
 * Current market price of the pair, in target units per source unit.
 *
 * Reference data for the form: it seeds the price field and anchors the
 * percentage presets. It is never what gets signed — the order's price is
 * whatever the user commits to, encoded as LIM in the memo.
 *
 * A successful result also doubles as proof the pair has a THORChain pool, which
 * is why placement is gated on it.
 */
export const useLimitMarketPriceQuery = ({
  fromCoin,
  toCoin,
}: UseLimitMarketPriceQueryInput) => {
  const { data: fromCoinFiatPrice } = useCoinPriceQuery({ coin: fromCoin })

  const isRoutablePair =
    isThorchainRoutable(fromCoin.chain) && isThorchainRoutable(toCoin.chain)

  return useQuery({
    queryKey: [
      limitMarketPriceQueryKeyPrefix,
      coinKeyToString(fromCoin),
      coinKeyToString(toCoin),
      fromCoinFiatPrice,
    ],
    queryFn: () =>
      fetchLimitSwapMarketPrice({
        sourceAsset: getThorchainMemoAsset(fromCoin),
        targetAsset: getThorchainMemoAsset(toCoin),
        sourceAmount: getMarketProbeAmount({
          price: fromCoinFiatPrice ?? 0,
          decimals: fromCoin.decimals,
        }),
        sourceDecimals: fromCoin.decimals,
      }),
    enabled: featureFlags.limitSwap && isRoutablePair,
    staleTime: 30_000,
    retry: false,
  })
}
