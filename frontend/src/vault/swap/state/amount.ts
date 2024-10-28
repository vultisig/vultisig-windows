import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';

export const { useState: useSwapAmount, provider: SwapAmountProvider } =
  getStateProviderSetup<number | null>('SwapAmount');
