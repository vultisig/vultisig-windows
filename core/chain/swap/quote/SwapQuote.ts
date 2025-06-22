import { GeneralSwapQuote } from '../general/GeneralSwapQuote'
import { NativeSwapQuote } from '../native/NativeSwapQuote'

export type SwapType = 'native' | 'general' | 'hybrid'

type SwapQuoteMap = {
  native: NativeSwapQuote
  general: GeneralSwapQuote
  hybrid: any
}

export type SwapQuote = {
  [T in SwapType]: { [K in T]: SwapQuoteMap[T] }
}[SwapType]
