import { lifiSwapEnabledChains } from './lifi/LifiSwapEnabledChains';
import { nativeSwapEnabledChains } from './native/NativeSwapChain';
import { oneInchSwapEnabledChains } from './oneInch/OneInchSwapEnabledChains';

export const swapEnabledChains = [
  ...nativeSwapEnabledChains,
  ...oneInchSwapEnabledChains,
  ...lifiSwapEnabledChains,
] as const;

export type SwapEnabledChain = (typeof swapEnabledChains)[number];
