import { formatUnits } from 'ethers'

// 2^256 - 1 — the standard max-value sentinel used across DeFi.
// Its meaning is CONTEXTUAL:
//  - approve / permit / increaseAllowance → "Unlimited" approval
//  - withdraw / redeem / repay / repayWithATokens → "Max" (all available)
const maxUint256 = 2n ** 256n - 1n

const unlimitedApprovalFunctions = new Set([
  'approve',
  'increaseAllowance',
  'decreaseAllowance',
  'permit',
  'permitSingle',
  'permitBatch',
])

const maxAvailableFunctions = new Set([
  'withdraw',
  'withdrawTo',
  'redeem',
  'repay',
  'repayWithPermit',
  'repayWithATokens',
])

export type FormattedTokenAmount = {
  /** Human-readable display string (without ticker). "1.234", "Unlimited",
   *  or "Max" depending on the value and function context. */
  display: string
  /** True when the raw amount is MAX_UINT256 — the UI should treat this as a
   *  sentinel (no numeric fiat, no chart). */
  isSentinel: boolean
  /** Numeric value suitable for fiat calculation. Zero for sentinel values. */
  numericValue: number
}

const trimTrailingZeros = (decimalStr: string): string => {
  if (!decimalStr.includes('.')) return decimalStr
  return decimalStr.replace(/0+$/, '').replace(/\.$/, '')
}

const capDecimalPlaces = (decimalStr: string, max: number): string => {
  const dotIndex = decimalStr.indexOf('.')
  if (dotIndex === -1) return decimalStr
  return decimalStr.slice(0, dotIndex + 1 + max)
}

const sentinelLabel = (functionName?: string): string => {
  if (!functionName) return 'Unlimited'
  if (unlimitedApprovalFunctions.has(functionName)) return 'Unlimited'
  if (maxAvailableFunctions.has(functionName)) return 'Max'
  return 'Unlimited'
}

/**
 * Format a raw on-chain token amount for user display. Detects the MAX_UINT256
 * sentinel and returns a contextual label ("Unlimited" for approvals, "Max"
 * for withdrawals) instead of an absurdly long number.
 */
export const formatTokenAmount = (
  rawAmount: bigint,
  decimals: number,
  functionName?: string
): FormattedTokenAmount => {
  if (rawAmount === maxUint256) {
    return {
      display: sentinelLabel(functionName),
      isSentinel: true,
      numericValue: 0,
    }
  }

  const raw = formatUnits(rawAmount, decimals)
  const capped = capDecimalPlaces(raw, 6)
  const display = trimTrailingZeros(capped)

  const numeric = Number(display)
  return {
    display,
    isSentinel: false,
    numericValue: Number.isFinite(numeric) ? numeric : 0,
  }
}
