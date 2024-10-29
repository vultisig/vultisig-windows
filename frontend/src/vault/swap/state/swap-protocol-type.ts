import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';
import { SwapProtocolType } from '../types';

export const { useState: useSwapProtocol, provider: SwapProtocolProvider } =
  getStateProviderSetup<SwapProtocolType | null>('SwapQuote');
