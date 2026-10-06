import { toExactAmountString } from '@core/ui/vault/deposit/utils/exactAmountString'
import {
  BuildKeysignPayloadError,
  BuildKeysignPayloadShortfall,
} from '@vultisig/core-mpc/keysign/error'
import { TFunction } from 'i18next'

// Exact, so "needs" is never rounded down to what the vault holds.
const formatExactAmount = (value: bigint, decimals: number, ticker: string) =>
  `${toExactAmountString(value, decimals)} ${ticker}`

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
const getBuildKeysignPayloadFundsMessage = (
  error: unknown,
  t: TFunction
): string | undefined =>
  error instanceof BuildKeysignPayloadError && error.shortfall
    ? getInsufficientFundsMessage(error.shortfall, t)
    : undefined

/** The translated reason a payload build refused, for every surface that shows one. */
export const getBuildKeysignPayloadErrorMessage = (
  error: unknown,
  t: TFunction
): string | undefined => {
  const fundsMessage = getBuildKeysignPayloadFundsMessage(error, t)
  if (fundsMessage || !(error instanceof BuildKeysignPayloadError)) {
    return fundsMessage
  }

  switch (error.type) {
    case 'not-enough-funds':
      return t('not_enough_funds')
    case 'ripple-destination-tag-required':
      return t('ripple_destination_tag_required')
    default:
      return undefined
  }
}
