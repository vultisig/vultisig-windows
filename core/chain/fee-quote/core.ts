import { Chain } from '../Chain'
import { ChainKind, DeriveChainKind, getChainKind } from '../ChainKind'

type EvmFeeQuote = {
  maxPriorityFeePerGas: bigint
  gasLimit: bigint
  baseFeePerGas: bigint
}

type UtxoFeeQuote = {
  byteFee: bigint
  txSize: bigint
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

type FeeQuoteRecordUnion<K extends ChainKind = ChainKind> = {
  [Kind in K]: Record<Kind, FeeQuoteByKind[Kind]>
}[K]

export function toFeeQuoteRecordUnion<C extends Chain>(
  chain: C,
  quote: FeeQuoteForChain<C>
): FeeQuoteRecordUnion<DeriveChainKind<C>> {
  const kind = getChainKind(chain)
  return { [kind]: quote } as unknown as FeeQuoteRecordUnion<DeriveChainKind<C>>
}
