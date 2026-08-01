import { fromChainAmountExact } from '@vultisig/core-chain/amount/fromChainAmountExact'

/** Trims trailing fraction zeros (and a dangling dot) from a decimal string. */
export const trimTrailingZeros = (value: string) =>
  value.includes('.') ? value.replace(/\.?0+$/, '') : value

/**
 * Exact base-units → trimmed human decimal string for deposit form fields.
 * Never goes through float64, so percentage/max selections keep every digit
 * of the share they compute (#4494).
 */
export const toExactAmountString = (units: bigint, decimals: number) =>
  trimTrailingZeros(fromChainAmountExact(units, decimals))
