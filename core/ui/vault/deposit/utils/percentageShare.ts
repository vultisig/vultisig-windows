import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'

import { trimTrailingZeros } from './exactAmountString'

type GetPercentageShareAmountInput = {
  balanceUnits: bigint
  percentage: number
  decimals: number
}

/**
 * A percentage share of a balance, as the human decimal string stored in
 * deposit form fields. Must be exact for any balance size — a float64
 * round-trip corrupts shares of balances above 2^53 base units (#4496).
 */
export const getPercentageShareAmount = ({
  balanceUnits,
  percentage,
  decimals,
}: GetPercentageShareAmountInput) => {
  const balance = fromChainAmount(balanceUnits, decimals)

  return trimTrailingZeros(((percentage / 100) * balance).toFixed(decimals))
}
