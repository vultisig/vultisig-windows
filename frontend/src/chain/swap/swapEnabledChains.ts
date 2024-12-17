import { nativeSwapEnabledChains } from './native/NativeSwapChain';

export const swapEnabledChains = [...nativeSwapEnabledChains] as const;

export type SwapEnabledChain = (typeof swapEnabledChains)[number];
