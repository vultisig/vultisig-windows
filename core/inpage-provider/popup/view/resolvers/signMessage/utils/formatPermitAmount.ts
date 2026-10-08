import { formatUnits } from 'ethers'

type FormatPermitAmountInput = {
  amount: bigint
  decimals: number
}

/**
 * Formats a finite permit amount in token units with every fractional digit
 * kept, so the popup shows exactly the amount being signed rather than a
 * rounded one.
 */
export const formatPermitAmount = ({
  amount,
  decimals,
}: FormatPermitAmountInput): string => {
  const formatted = formatUnits(amount, decimals)

  return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted
}
