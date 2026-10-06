import { getInsufficientFundsMessage } from '@core/ui/vault/send/funds/getInsufficientFundsMessage'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import { TFunction } from 'i18next'

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
