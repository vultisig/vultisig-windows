import { SwapDiscount } from '../discount/SwapDiscount'
import { GeneralSwapQuote } from '../general/GeneralSwapQuote'
import { NativeSwapQuote } from '../native/NativeSwapQuote'

export type SwapType = 'native' | 'general'

type SwapQuoteMap = {
  native: NativeSwapQuote
  general: GeneralSwapQuote
}

export type SwapQuoteResult = {
  [T in SwapType]: { [K in T]: SwapQuoteMap[T] }
}[SwapType]

export type SwapQuote = {
  quote: SwapQuoteResult
  discounts: SwapDiscount[]
}
