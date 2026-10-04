import {
  BuildKeysignPayloadError,
  BuildKeysignPayloadShortfall,
} from '@vultisig/core-mpc/keysign/error'
import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { TFunction } from 'i18next'

// Exact, so "needs" is never rounded down to what the vault holds.
const formatExactAmount = (value: bigint, decimals: number, ticker: string) => {
  const decimal = bigIntToDecimalString(value, decimals)
  const trimmed = decimal.includes('.')
    ? decimal.replace(/0+$/, '').replace(/\.$/, '')
    : decimal

  return `${trimmed} ${ticker}`
}

/** Names the exact asset a send is short of, how much it needs and how much is there. */
export const getInsufficientFundsMessage = (
  shortfall: BuildKeysignPayloadShortfall,
  t: TFunction
): string => {
  const { required, available, ticker, decimals, includesNetworkCosts } =
    shortfall

  return t(
    includesNetworkCosts
      ? 'insufficient_funds_including_network_costs'
      : 'insufficient_funds_asset',
    {
      ticker,
      required: formatExactAmount(required, decimals, ticker),
      available: formatExactAmount(available, decimals, ticker),
    }
  )
}

/** The shortfall message for a failed payload build that reports one, otherwise undefined. */
export const getBuildKeysignPayloadFundsMessage = (
  error: unknown,
  t: TFunction
): string | undefined =>
  error instanceof BuildKeysignPayloadError && error.shortfall
    ? getInsufficientFundsMessage(error.shortfall, t)
    : undefined
