import { Chain } from '../Chain'
import { ChainKind, DeriveChainKind } from '../ChainKind'

type EvmFeeQuote = {
  maxPriorityFeePerGas: bigint
  gasLimit: bigint
  baseFeePerGas: bigint
}

type UtxoFeeQuote = {
  byteFee: bigint
}

type CardanoFeeQuote = {
  byteFee: bigint
}

type SolanaFeeQuote = {
  priorityFee: bigint
}

type GasFeeQuote = {
  gas: bigint
}

type SuiFeeQuote = {
  referenceGasPrice: bigint
  gasBudget: bigint
}

type EnsureAllKindsCovered<T extends Record<ChainKind, unknown>> = T

type FeeQuoteByKind = EnsureAllKindsCovered<{
  evm: EvmFeeQuote
  utxo: UtxoFeeQuote
  cosmos: GasFeeQuote
  solana: SolanaFeeQuote
  ripple: GasFeeQuote
  cardano: CardanoFeeQuote
  polkadot: GasFeeQuote
  ton: GasFeeQuote
  tron: GasFeeQuote
  sui: SuiFeeQuote
}>

export type FeeQuote<T extends ChainKind = ChainKind> = FeeQuoteByKind[T]

export type FeeQuoteForChain<C extends Chain = Chain> =
  FeeQuoteByKind[DeriveChainKind<C>]
