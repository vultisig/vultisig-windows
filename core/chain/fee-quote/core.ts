import { Chain } from '../Chain'
import { ChainKind, DeriveChainKind } from '../ChainKind'

type EvmFeeQuote = {
  maxPriorityFeePerGas: bigint
  gasLimit: bigint
  baseFeePerGas: bigint
}

type UtxoFeeQuote = {
  byteFee: bigint
  byteFeeMultiplier: number
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
  sui: GasFeeQuote
}>

export type FeeQuote<T extends ChainKind = ChainKind> = FeeQuoteByKind[T]

export type FeeQuoteForChain<C extends Chain = Chain> =
  FeeQuoteByKind[DeriveChainKind<C>]
