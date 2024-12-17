import { asyncFallbackChain } from '../../../../lib/utils/promise/asyncFallbackChain';
import {
  nativeSwapChains,
  NativeSwapEnabledChain,
  nativeSwapEnabledChainsRecord,
} from '../NativeSwapChain';
import {
  getNativeSwapQuote,
  GetNativeSwapQuoteInput,
} from './getNativeSwapQuote';

type FindNativeSwapQuoteInput = Omit<GetNativeSwapQuoteInput, 'swapChain'> & {
  fromChain: NativeSwapEnabledChain;
};

export const findNativeSwapQuote = async ({
  fromChain,
  ...rest
}: FindNativeSwapQuoteInput) => {
  const matchingSwapChains = nativeSwapChains.filter(swapChain =>
    nativeSwapEnabledChainsRecord[swapChain].includes(fromChain as any)
  );

  const fetchers = matchingSwapChains.map(
    swapChain => () => getNativeSwapQuote({ swapChain, ...rest })
  );

  return asyncFallbackChain(...fetchers);
};
