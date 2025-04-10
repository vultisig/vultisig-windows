import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useCallback } from 'react'

import { GeneralSwapQuote } from '../../../chain/swap/general/GeneralSwapQuote'
import { getNativeSwapDecimals } from '../../../chain/swap/native/utils/getNativeSwapDecimals'
import { SwapQuote } from '../../../chain/swap/quote/SwapQuote'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
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
