import { ChainKind } from '../ChainKind'

export type EvmFeeQuote = {
  maxPriorityFeePerGas: bigint
  gasLimit: bigint
  maxFeePerGas: bigint
}

type UtxoFeeQuote = {
  byteFee: bigint
}

type SolanaFeeQuote = {
  priorityFee: bigint
}

type GasFeeQuote = {
  gas: bigint
}

export type FeeQuote<T extends ChainKind> = T extends 'evm'
  ? EvmFeeQuote
  : T extends 'utxo'
    ? UtxoFeeQuote
    : T extends 'cosmos'
      ? GasFeeQuote
      : T extends 'solana'
        ? SolanaFeeQuote
        : T extends 'ripple'
          ? GasFeeQuote
          : T extends 'cardano'
            ? UtxoFeeQuote
            : T extends 'polkadot'
              ? GasFeeQuote
              : T extends 'ton'
                ? GasFeeQuote
                : T extends 'tron'
                  ? GasFeeQuote
                  : T extends 'sui'
                    ? GasFeeQuote
                    : never
