import { EvmChain } from '@core/chain/Chain'

export const evmNativeTokenGasLimit: Record<EvmChain, number> = {
  [EvmChain.Ethereum]: 23000,
  [EvmChain.Base]: 40000,
  [EvmChain.Arbitrum]: 120000,
  [EvmChain.Polygon]: 23000,
  [EvmChain.Optimism]: 40000,
  [EvmChain.CronosChain]: 40000,
  [EvmChain.Blast]: 40000,
  [EvmChain.BSC]: 40000,
  [EvmChain.Avalanche]: 23000,
  [EvmChain.Zksync]: 200000,
}

export const evmTokenGasLimit: Record<EvmChain, number> = {
  [EvmChain.Ethereum]: 120000,
  [EvmChain.Base]: 120000,
  [EvmChain.Arbitrum]: 120000,
  [EvmChain.Polygon]: 120000,
  [EvmChain.Optimism]: 120000,
  [EvmChain.CronosChain]: 120000,
  [EvmChain.Blast]: 120000,
  [EvmChain.BSC]: 120000,
  [EvmChain.Avalanche]: 120000,
  [EvmChain.Zksync]: 200000,
}

export const defaultEvmSwapGasLimit = 600000
