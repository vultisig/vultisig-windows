import { EvmChain } from '../../../../Chain'

export type EvmTxFeeFormat = 'enveloped' | 'legacy'

export const evmChainTxFeeFormat: Record<EvmChain, EvmTxFeeFormat> = {
  [EvmChain.Arbitrum]: 'enveloped',
  [EvmChain.Base]: 'enveloped',
  [EvmChain.Blast]: 'enveloped',
  [EvmChain.Optimism]: 'enveloped',
  [EvmChain.Zksync]: 'enveloped',
  [EvmChain.Avalanche]: 'enveloped',
  [EvmChain.CronosChain]: 'enveloped',
  [EvmChain.BSC]: 'legacy',
  [EvmChain.Ethereum]: 'enveloped',
  [EvmChain.Polygon]: 'enveloped',
  [EvmChain.Mantle]: 'enveloped',
  [EvmChain.Sei]: 'legacy',
}
