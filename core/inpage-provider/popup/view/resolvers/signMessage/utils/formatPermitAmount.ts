import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'

const primaryTypeToFunctionName: Record<string, string> = {
  Permit: 'permit',
  PermitSingle: 'permitSingle',
  PermitBatch: 'permitBatch',
}

type FormatPermitAmountInput = {
  amount: bigint
  primaryType: string
  decimals: number
}

/**
 * Formats a permit's approval amount in token units, or returns `null` when
 * the amount is a max-value sentinel. Every permit primary type lets the
 * spender pull tokens, so a sentinel always reads as an unlimited approval,
 * Permit2 signature transfers included. Pass `decimals: 0` to keep the amount
 * in base units when the token's decimals are unknown.
 */
export const formatPermitAmount = ({
  amount,
  primaryType,
  decimals,
}: FormatPermitAmountInput): string | null => {
  const { display, isSentinel } = formatTokenAmount({
    rawAmount: amount,
    decimals,
    functionName: primaryTypeToFunctionName[primaryType],
  })

  return isSentinel ? null : display
}
