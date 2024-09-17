export enum EvmChain {
  Arbitrum = 'Arbitrum',
  Avalanche = 'Avalanche',
  Base = 'Base',
  CronosChain = 'CronosChain',
  BSC = 'BSC',
  Blast = 'Blast',
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
  Polygon = 'Polygon',
  ZkSync = 'ZkSync',
}

export const evmChainIds: Record<EvmChain, number> = {
  [EvmChain.Arbitrum]: 42161,
  [EvmChain.Avalanche]: 43114,
  [EvmChain.Base]: 8453,
  [EvmChain.CronosChain]: 25,
  [EvmChain.BSC]: 56,
  [EvmChain.Blast]: 81457,
  [EvmChain.Ethereum]: 1,
  [EvmChain.Optimism]: 10,
  [EvmChain.Polygon]: 137,
  [EvmChain.ZkSync]: 324,
};
