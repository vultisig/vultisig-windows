import { Chain } from '@core/chain/Chain'

export const oneInchSwapEnabledChains = [
  Chain.Ethereum,
  Chain.Arbitrum,
  Chain.Zksync,
  Chain.BSC,
  Chain.Avalanche,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Base,
] as const

export type OneInchSwapEnabledChain = (typeof oneInchSwapEnabledChains)[number]
