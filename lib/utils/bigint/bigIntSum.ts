export const bigIntSum = (values: bigint[]): bigint => {
  return values.reduce((sum, value) => sum + value, 0n)
}
