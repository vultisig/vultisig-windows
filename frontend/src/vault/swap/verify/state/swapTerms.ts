import { getStateProviderSetup } from '../../../../lib/ui/state/getStateProviderSetup';

export const swapTermsCount = 2;
export const getSwapTermCopyKey = (index: number) => `swap_terms_${index}`;

export const { useState: useSwapTerms, provider: SwapTermsProvider } =
  getStateProviderSetup<boolean[]>('SwapTerms');
