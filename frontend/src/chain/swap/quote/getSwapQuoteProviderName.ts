import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { oneInchName } from '../oneInch/config';
import { SwapQuote } from './SwapQuote';

export const getSwapQuoteProviderName = (quote: SwapQuote) => {
  return matchRecordUnion(quote, {
    native: ({ swapChain }) => swapChain,
    oneInch: () => oneInchName,
  });
};
