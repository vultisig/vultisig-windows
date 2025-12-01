import { EvmChain } from '../../Chain'

const blockaidEvmChain = {
  [EvmChain.Arbitrum]: 'arbitrum',
  [EvmChain.Avalanche]: 'avalanche',
  [EvmChain.Base]: 'base',
  [EvmChain.Blast]: 'blast',
  [EvmChain.BSC]: 'bsc',
  [EvmChain.Ethereum]: 'ethereum',
  [EvmChain.Hyperliquid]: 'hyperevm',
  [EvmChain.Mantle]: 'mantle',
  [EvmChain.Optimism]: 'optimism',
  [EvmChain.Polygon]: 'polygon',
  [EvmChain.Sei]: 'sei',
  [EvmChain.Zksync]: 'zksync',
} as const

export type BlockaidSupportedEvmChain = keyof typeof blockaidEvmChain

export const blockaidSupportedEvmChains = Object.keys(
  blockaidEvmChain
) as BlockaidSupportedEvmChain[]

export const getBlockaidEvmChainName = (
  chain: BlockaidSupportedEvmChain
): string => blockaidEvmChain[chain]
