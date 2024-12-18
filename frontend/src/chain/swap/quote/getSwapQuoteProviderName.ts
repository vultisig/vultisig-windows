import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { SwapQuote } from './SwapQuote';

export const getSwapQuoteProviderName = (quote: SwapQuote) => {
  return matchRecordUnion(quote, {
    native: ({ swapChain }) => swapChain,
    oneInch: () => '1inch',
  });
};
