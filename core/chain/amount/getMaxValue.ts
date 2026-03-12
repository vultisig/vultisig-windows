/**
 * Returns the maximum sendable amount (in smallest units) after reserving the fee.
 * Both balance and fee must be in the same unit.
 */
export const getMaxValue = (balanceRaw: bigint, feeRaw: bigint): bigint =>
  balanceRaw >= feeRaw ? balanceRaw - feeRaw : 0n
