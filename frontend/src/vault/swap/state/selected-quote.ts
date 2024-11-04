import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';
import { SwapQuote } from '../types';

export const { useState: useSwapQuote, provider: SwapQuoteProvider } =
  getStateProviderSetup<SwapQuote | null>('SwapQuote');
