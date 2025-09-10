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

const defaultEvmTokenGasLimit = 120000n

export const evmTokenGasLimit: Record<EvmChain, bigint> = {
  [EvmChain.Ethereum]: defaultEvmTokenGasLimit,
  [EvmChain.Base]: defaultEvmTokenGasLimit,
  [EvmChain.Arbitrum]: defaultEvmTokenGasLimit,
  [EvmChain.Polygon]: defaultEvmTokenGasLimit,
  [EvmChain.Optimism]: defaultEvmTokenGasLimit,
  [EvmChain.CronosChain]: defaultEvmTokenGasLimit,
  [EvmChain.Blast]: defaultEvmTokenGasLimit,
  [EvmChain.BSC]: defaultEvmTokenGasLimit,
  [EvmChain.Avalanche]: defaultEvmTokenGasLimit,
  [EvmChain.Zksync]: evmNativeTokenGasLimit[EvmChain.Zksync],
  [EvmChain.Mantle]: evmNativeTokenGasLimit[EvmChain.Mantle],
}

export const defaultEvmSwapGasLimit = 600000n
