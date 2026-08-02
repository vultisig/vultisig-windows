import { toExactAmountString } from './exactAmountString'

type GetPercentageShareAmountInput = {
  balanceUnits: bigint
  percentage: number
  decimals: number
}

/**
 * A percentage share of a balance, as the human decimal string stored in
 * deposit form fields. Computed in bigint fixed-point (basis points) so the
 * share is exact for any balance size — a float64 round-trip corrupts shares
 * of balances above 2^53 base units (#4496).
 */
export const getPercentageShareAmount = ({
  balanceUnits,
  percentage,
  decimals,
}: GetPercentageShareAmountInput) => {
  const shareUnits =
    (balanceUnits * BigInt(Math.round(percentage * 100))) / 10_000n

  return toExactAmountString(shareUnits, decimals)
}
