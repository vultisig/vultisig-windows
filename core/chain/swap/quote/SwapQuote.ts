import { GeneralSwapQuote } from '../general/GeneralSwapQuote'
import { NativeSwapQuote } from '../native/NativeSwapQuote'

type SwapType = 'native' | 'general'

interface SwapQuoteMap {
  native: NativeSwapQuote
  general: GeneralSwapQuote
}

export type SwapQuote = {
  [T in SwapType]: { [K in T]: SwapQuoteMap[T] }
}[SwapType]
