import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useQuery } from '@tanstack/react-query'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { Coin, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import {
  getThorchainMemoAsset,
  isThorchainRoutable,
} from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

import { fetchLimitSwapMarketPrice, getMarketProbeAmount } from '../marketPrice'

const limitMarketPriceQueryKeyPrefix = 'limitMarketPrice'

type UseLimitMarketPriceQueryInput = {
  fromCoin: Coin
  /**
   * Needs its `address`: THORChain validates the quote's destination against the
   * target asset's chain, so the probe has to say where the payout would go.
   */
  toCoin: AccountCoin
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
 *
 * The probe carries the payout address even though it is only reference data.
 * THORChain validates `destination` against the target asset's chain, and
 * without one a SECURED target fails with "swap destination address is not the
 * same chain as the target asset" — no price, so the presets die and the order
 * cannot be priced at all. Layer-1 targets quote identically with or without it,
 * so sending it always costs nothing and removes the special case.
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
      toCoin.address,
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
        destinationAddress: toCoin.address,
      }),
    enabled: isRoutablePair,
    staleTime: 30_000,
    retry: false,
  })
}
