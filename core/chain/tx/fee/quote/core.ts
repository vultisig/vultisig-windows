import { ChainKind } from '../../../ChainKind'

export type EvmFeeQuote = {
  gasLimit: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
}

export type FeeQuote<T extends ChainKind = ChainKind> = T extends 'evm'
  ? EvmFeeQuote
  : bigint
