export type EvmFeeQuote = {
  maxPriorityFeePerGas: bigint
  gasLimit: bigint
  maxFeePerGas: bigint
}

export type EvmFeeSettings = Omit<EvmFeeQuote, 'maxFeePerGas'>
