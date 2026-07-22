/**
 * THORChain expresses quote amounts and memo LIM values in 1e8 fixed point,
 * regardless of the asset's own decimals.
 */
const thorchainFixedPointDecimals = 8

const thorchainScale = 10n ** BigInt(thorchainFixedPointDecimals)

type ToThorchainFixedPointInput = {
  amount: bigint
  decimals: number
}

/**
 * Convert an amount from a coin's native smallest units (`10^decimals`) to
 * THORChain's 1e8 fixed point.
 *
 * Both the quote endpoint's `amount` and `buildLimitSwapMemo`'s `source_amount`
 * are 1e8-scaled. An 8-decimal source (BTC/RUNE) already matches and this is a
 * no-op, but an 18-decimal source (ETH) passed through raw would be 1e10x too
 * large — producing a mis-scaled quote and, worse, a LIM that encodes a
 * completely different minimum-received into the signed memo. Multiplies before
 * dividing so precision is not lost on the way down.
 */
export const toThorchainFixedPoint = ({
  amount,
  decimals,
}: ToThorchainFixedPointInput): bigint =>
  (amount * thorchainScale) / 10n ** BigInt(decimals)

/**
 * Interpret a THORChain 1e8 fixed-point amount as a natural-unit number.
 *
 * Used for display and price math only — never to derive a value that ends up
 * in a signed memo, where the bigint path above is authoritative.
 */
export const fromThorchainFixedPoint = (amount: bigint | string): number =>
  Number(amount) / Number(thorchainScale)
