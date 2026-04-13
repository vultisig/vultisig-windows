import { formatUnits } from 'ethers'

// 2^256 - 1 — the standard max-value sentinel used across DeFi.
const maxUint256 = 2n ** 256n - 1n

// Functions where MAX_UINT256 means "unlimited approval" — the only case where
// a sentinel label makes sense. For withdraw/repay MAX_UINT256 means "all
// available" but the exact amount depends on on-chain state, so we return null
// and let the caller skip the amount display.
const unlimitedApprovalFunctions = new Set([
  'approve',
  'increaseAllowance',
  'decreaseAllowance',
  'permit',
  'permitSingle',
  'permitBatch',
])

export type FormattedTokenAmount = {
  /** Human-readable display string (without ticker). "1.234" or "Unlimited".
   *  `null` when MAX_UINT256 is used in a non-approval context (withdraw/repay)
   *  where the exact amount depends on on-chain state. */
  display: string | null
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

/**
 * Format a raw on-chain token amount for user display. Detects the MAX_UINT256
 * sentinel and returns "Unlimited" for approvals, or `null` for non-approval
 * functions (withdraw/repay) where the exact amount depends on on-chain state.
 */
export const formatTokenAmount = (
  rawAmount: bigint,
  decimals: number,
  functionName?: string
): FormattedTokenAmount => {
  if (rawAmount === maxUint256) {
    const isApproval =
      !!functionName && unlimitedApprovalFunctions.has(functionName)
    return {
      display: isApproval ? 'Unlimited' : null,
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
