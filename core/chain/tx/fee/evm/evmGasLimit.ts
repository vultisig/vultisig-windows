import { EvmChain } from '@core/chain/Chain'

export const evmNativeTokenGasLimit: Record<EvmChain, bigint> = {
  [EvmChain.Ethereum]: 23000n,
  [EvmChain.Base]: 40000n,
  [EvmChain.Arbitrum]: 120000n,
  [EvmChain.Polygon]: 23000n,
  [EvmChain.Optimism]: 40000n,
  [EvmChain.CronosChain]: 40000n,
  [EvmChain.Blast]: 40000n,
  [EvmChain.BSC]: 40000n,
  [EvmChain.Avalanche]: 23000n,
  [EvmChain.Zksync]: 200000n,
  [EvmChain.Mantle]: 90_000_000n,
}

export const evmTokenGasLimit: Record<EvmChain, bigint> = {
  [EvmChain.Ethereum]: 120000n,
  [EvmChain.Base]: 120000n,
  [EvmChain.Arbitrum]: 120000n,
  [EvmChain.Polygon]: 120000n,
  [EvmChain.Optimism]: 120000n,
  [EvmChain.CronosChain]: 120000n,
  [EvmChain.Blast]: 120000n,
  [EvmChain.BSC]: 120000n,
  [EvmChain.Avalanche]: 120000n,
  [EvmChain.Zksync]: 200000n,
  [EvmChain.Mantle]: 90_000_000n,
}

export const defaultEvmSwapGasLimit = 600000
