import { SwapErrorCode } from '@vultisig/core-chain/swap/SwapError'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

const swapErrorMessageKey = {
  [SwapErrorCode.AllProvidersFailed]: 'swap_all_providers_failed',
  [SwapErrorCode.AmountBelowMinimum]: 'swap_amount_below_minimum',
  [SwapErrorCode.AmountTooSmall]: 'swap_amount_too_small',
  [SwapErrorCode.InvalidConfig]: 'swap_invalid_config',
  [SwapErrorCode.NoRoutesFound]: 'swap_no_routes_found',
  [SwapErrorCode.TradingHalted]: 'swap_trading_halted',
} as const satisfies Record<SwapErrorCode, string>

type SwapErrorMessageKey =
  (typeof swapErrorMessageKey)[keyof typeof swapErrorMessageKey]

type ResolveMarketSwapErrorMessageInput = {
  error: unknown
  translate: (key: SwapErrorMessageKey) => string
}

const isSwapErrorCode = (value: unknown): value is SwapErrorCode =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(swapErrorMessageKey, value)

export const resolveMarketSwapErrorMessage = ({
  error,
  translate,
}: ResolveMarketSwapErrorMessageInput) => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? error.code
      : undefined

  if (!isSwapErrorCode(code)) {
    return extractErrorMsg(error)
  }

  return translate(swapErrorMessageKey[code])
}
