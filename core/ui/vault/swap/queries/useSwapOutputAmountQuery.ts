import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'

import { useSwapToCoin } from '../state/toCoin'
import { getSwapQuoteOutput } from './swapQuoteOutput'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

/**
 * What the active route pays out, in destination-token units. Follows a
 * manual route pick, so the form's output figure matches the route the swap
 * will actually take.
 */
export const useSwapOutputAmountQuery = () => {
  const [toCoinKey] = useSwapToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  return useTransformQueryData(useSwapQuoteQuery(), swapQuote => {
    const { amount, decimals } = getSwapQuoteOutput({
      quote: swapQuote.quote,
      toCoinKey,
      toCoinDecimals: toCoin.decimals,
    })

    return fromChainAmount(amount, decimals)
  })
}
