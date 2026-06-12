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
const outputActionSize = 34n

export const ceilDiv = (value: bigint, divisor: bigint): bigint =>
  (value + divisor - 1n) / divisor

type ZcashTxShape = {
  /**
   * Transparent P2PKH inputs (148 bytes serialized) map 1:1 to logical
   * actions — ceil(148n / 150) equals n for any realistic input count (< 75).
   */
  inputCount: number
  /** Serialized size of each tx_out in bytes (value + script length + script). */
  outputSizes: bigint[]
}

export const getZcashConventionalFee = ({
  inputCount,
  outputSizes,
}: ZcashTxShape): bigint => {
  const outputActions = ceilDiv(bigIntSum(outputSizes), outputActionSize)
  const logicalActions = bigIntMax(BigInt(inputCount), outputActions)

  return marginalFee * bigIntMax(graceActions, logicalActions)
}
