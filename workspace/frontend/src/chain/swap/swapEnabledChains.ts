import { lifiSwapEnabledChains } from './general/lifi/LifiSwapEnabledChains';
import { oneInchSwapEnabledChains } from './general/oneInch/OneInchSwapEnabledChains';
import { nativeSwapEnabledChains } from './native/NativeSwapChain';

export const swapEnabledChains = [
  ...nativeSwapEnabledChains,
  ...oneInchSwapEnabledChains,
  ...lifiSwapEnabledChains,
] as const;

export type SwapEnabledChain = (typeof swapEnabledChains)[number];
