import { setupOptionalValueProvider } from '@lib/ui/state/setupOptionalValueProvider'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'

export const [SwapQuoteProvider, useOptionalSwapQuote] =
  setupOptionalValueProvider<SwapQuote | undefined>()
