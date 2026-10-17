/**
 * Reads an EIP-712 integer the way ethers accepts it when hashing: a bigint,
 * an integer number, or a decimal/hex string. Anything else is `undefined`.
 */
export const toBigInt = (v: unknown): bigint | undefined => {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number' && Number.isInteger(v)) return BigInt(v)
  if (typeof v === 'string' && v.length > 0) {
    try {
      return BigInt(v)
    } catch {
      return undefined
    }
  }
  return undefined
}
