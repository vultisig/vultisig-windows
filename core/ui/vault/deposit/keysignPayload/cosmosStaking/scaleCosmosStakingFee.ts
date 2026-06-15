type ScaleCosmosStakingFeeInput = {
  gas: bigint
  gasLimit: bigint
  singleMsgGasLimit: bigint
}

const ceilDiv = (dividend: bigint, divisor: bigint) =>
  (dividend + divisor - 1n) / divisor

/**
 * Scales a single-message Cosmos staking fee without dropping below its
 * original gas-price ratio.
 */
export const scaleCosmosStakingFee = ({
  gas,
  gasLimit,
  singleMsgGasLimit,
}: ScaleCosmosStakingFeeInput) => {
  if (gasLimit <= 0n || singleMsgGasLimit <= 0n) {
    return gas
  }

  return ceilDiv(gas * gasLimit, singleMsgGasLimit)
}
