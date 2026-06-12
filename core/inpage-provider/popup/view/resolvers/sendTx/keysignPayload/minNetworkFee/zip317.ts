import { bigIntMax } from '@vultisig/lib-utils/bigint/bigIntMax'
import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'

/**
 * ZIP-317 conventional fee for a transparent-only Zcash transaction.
 * Nodes relay zero "unpaid actions" by default, so any tx paying less is
 * rejected at broadcast with "tx unpaid action limit exceeded".
 * https://zips.z.cash/zip-0317
 */
const marginalFee = 5000n
const graceActions = 2n
/** Serialized size of a signed transparent P2PKH input (ZIP-317 §3.1). */
const p2pkhInputSize = 148n
const inputActionSize = 150n
const outputActionSize = 34n

type CeilDivInput = {
  value: bigint
  divisor: bigint
}

/** Ceiling division for bigints: smallest n such that n * divisor >= value. */
export const ceilDiv = ({ value, divisor }: CeilDivInput): bigint =>
  (value + divisor - 1n) / divisor

type GetZcashConventionalFeeInput = {
  /** Transparent P2PKH inputs; sized at 148 bytes each per ZIP-317. */
  inputCount: number
  /** Serialized size of each tx_out in bytes (value + script length + script). */
  outputSizes: bigint[]
}

/**
 * Minimum fee the Zcash network relays for a transparent tx of the given
 * shape: 5,000 zats per logical action with a two-action grace window, where
 * logical actions = max(ceil(tx_in bytes / 150), ceil(tx_out bytes / 34)).
 */
export const getZcashConventionalFee = ({
  inputCount,
  outputSizes,
}: GetZcashConventionalFeeInput): bigint => {
  const inputActions = ceilDiv({
    value: BigInt(inputCount) * p2pkhInputSize,
    divisor: inputActionSize,
  })
  const outputActions = ceilDiv({
    value: bigIntSum(outputSizes),
    divisor: outputActionSize,
  })
  const logicalActions = bigIntMax(inputActions, outputActions)

  return marginalFee * bigIntMax(graceActions, logicalActions)
}
