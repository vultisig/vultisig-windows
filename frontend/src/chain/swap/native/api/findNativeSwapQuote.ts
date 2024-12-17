import { isOneOf } from '../../../../lib/utils/array/isOneOf';
import { asyncFallbackChain } from '../../../../lib/utils/promise/asyncFallbackChain';
import { extractChainFromNativeSwapAsset } from '../asset/extractChainFromNativeSwapAsset';
import {
  nativeSwapChains,
  nativeSwapEnabledChainsRecord,
} from '../NativeSwapChain';
import {
  getNativeSwapQuote,
  GetNativeSwapQuoteInput,
} from './getNativeSwapQuote';

type FindNativeSwapQuoteInput = Omit<GetNativeSwapQuoteInput, 'swapChain'>;

export const findNativeSwapQuote = async (input: FindNativeSwapQuoteInput) => {
  const involvedChains = [input.fromAsset, input.toAsset].map(
    extractChainFromNativeSwapAsset
  );

  const matchingSwapChains = nativeSwapChains.filter(swapChain =>
    involvedChains.every(chain =>
      isOneOf(chain, nativeSwapEnabledChainsRecord[swapChain])
    )
  );

  const fetchers = matchingSwapChains.map(
    swapChain => () => getNativeSwapQuote({ swapChain, ...input })
  );

  return asyncFallbackChain(...fetchers);
};
