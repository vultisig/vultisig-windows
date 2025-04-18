import { lifiSwapEnabledChains } from '@core/chain/swap/general/lifi/LifiSwapEnabledChains'
import { oneInchSwapEnabledChains } from '@core/chain/swap/general/oneInch/OneInchSwapEnabledChains'

import { nativeSwapEnabledChains } from './native/NativeSwapChain'

export const swapEnabledChains = [
  ...nativeSwapEnabledChains,
  ...oneInchSwapEnabledChains,
  ...lifiSwapEnabledChains,
] as const
