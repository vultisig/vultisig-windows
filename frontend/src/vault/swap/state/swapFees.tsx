import { SwapFees } from '../../../lib/types/keysign';
import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';

export const { useState: useSwapFees, provider: SwapFeesProvider } =
  getStateProviderSetup<null | SwapFees>('SwapFees');
