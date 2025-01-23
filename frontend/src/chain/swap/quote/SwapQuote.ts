import { GeneralSwapQuote } from '../general/GeneralSwapQuote';
import { NativeSwapQuote } from '../native/NativeSwapQuote';

export const swapTypes = ['native', 'general'] as const;
export type SwapType = (typeof swapTypes)[number];

interface SwapQuoteMap {
  native: NativeSwapQuote;
  general: GeneralSwapQuote;
}

export type SwapQuote = {
  [T in SwapType]: { [K in T]: SwapQuoteMap[T] };
}[SwapType];
