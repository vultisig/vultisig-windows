export const stepFromDecimals = (decimals: number) =>
  decimals <= 0 ? '1' : `0.${'0'.repeat(decimals - 1)}1`
