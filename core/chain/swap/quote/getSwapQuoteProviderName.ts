import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { generalSwapProviderName } from '../general/GeneralSwapProvider'
import { SwapQuote } from './SwapQuote'

export const getSwapQuoteProviderName = (quote: SwapQuote) => {
  return matchRecordUnion<SwapQuote, string>(quote, {
    native: ({ swapChain }) => swapChain,
    general: ({ provider }) => generalSwapProviderName[provider],
  })
}
