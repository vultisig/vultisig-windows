import { mayaSwapEnabledChains } from './maya/mayachainSwapChains';
import { thorchainSwapEnabledChains } from './thor/thorchainSwapChains';

export const swapEnabledChains = [
  ...mayaSwapEnabledChains,
  ...thorchainSwapEnabledChains,
] as const;

export type SwapEnabledChain = (typeof swapEnabledChains)[number];
