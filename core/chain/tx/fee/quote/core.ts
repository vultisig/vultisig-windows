import { ChainKind } from '../../../ChainKind'

type EvmFeeQuote = {
  gasLimit: bigint
  maxPriorityFeePerGas: bigint
}

export type FeeQuote<T extends ChainKind = ChainKind> = T extends 'evm'
  ? EvmFeeQuote
  : bigint
