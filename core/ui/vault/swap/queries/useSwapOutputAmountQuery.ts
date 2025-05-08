import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { GeneralSwapQuote } from '@core/chain/swap/general/GeneralSwapQuote'
import { getNativeSwapDecimals } from '@core/chain/swap/native/utils/getNativeSwapDecimals'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useCallback } from 'react'

import { useToCoin } from '../state/toCoin'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapOutputAmountQuery = () => {
  const [toCoinKey] = useToCoin()

  const toCoin = useCurrentVaultCoin(toCoinKey)

  return useTransformQueryData(
    useSwapQuoteQuery(),
    useCallback(
      swapQuote => {
        return matchRecordUnion<SwapQuote, number>(swapQuote, {
          native: ({ expected_amount_out }) =>
            fromChainAmount(
              expected_amount_out,
              getNativeSwapDecimals(toCoinKey)
            ),
          general: (quote: GeneralSwapQuote) => {
            return fromChainAmount(quote.dstAmount, toCoin.decimals)
          },
        })
      },
      [toCoin.decimals, toCoinKey]
    )
  )
}
