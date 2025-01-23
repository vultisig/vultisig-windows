import { NativeSwapQuote } from '../native/NativeSwapQuote';
import { OneInchSwapQuote } from '../oneInch/OneInchSwapQuote';

export const swapTypes = ['native', 'oneInch', 'lifi'] as const;
export type SwapType = (typeof swapTypes)[number];

interface SwapQuoteMap {
  native: NativeSwapQuote;
  oneInch: OneInchSwapQuote;
  lifi: OneInchSwapQuote;
}

export type SwapQuote = {
  [T in SwapType]: { [K in T]: SwapQuoteMap[T] };
}[SwapType];
