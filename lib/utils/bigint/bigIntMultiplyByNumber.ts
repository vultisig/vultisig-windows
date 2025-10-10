const scale = 1_000_000

export const multiplyBigInt = (value: bigint, multiplier: number): bigint => {
  const scaled = Math.round(multiplier * scale)
  return (value * BigInt(scaled)) / BigInt(scale)
}
