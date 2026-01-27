import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { generalSwapProviderName } from '../general/GeneralSwapProvider'
import { SwapQuote, SwapQuoteResult } from './SwapQuote'

export const getSwapQuoteProviderName = (quote: SwapQuote) => {
  return matchRecordUnion<SwapQuoteResult, string>(quote.quote, {
    native: ({ swapChain }) => swapChain,
    general: ({ provider }) => generalSwapProviderName[provider],
  })
}
