import { GeneralSwapQuote } from '../GeneralSwapQuote';
import { NativeSwapQuote } from '../native/NativeSwapQuote';

export const swapTypes = ['native', 'oneInch', 'lifi'] as const;
export type SwapType = (typeof swapTypes)[number];

interface SwapQuoteMap {
  native: NativeSwapQuote;
  oneInch: GeneralSwapQuote;
  lifi: GeneralSwapQuote;
}

export type SwapQuote = {
  [T in SwapType]: { [K in T]: SwapQuoteMap[T] };
}[SwapType];
