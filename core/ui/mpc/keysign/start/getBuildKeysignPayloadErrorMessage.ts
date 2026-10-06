import { getInsufficientFundsMessage } from '@core/ui/vault/send/funds/getInsufficientFundsMessage'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { TFunction } from 'i18next'

/**
 * The translated reason a payload build refused, for every surface that shows
 * one; the error's own text when there is no translation for it.
 */
export const getBuildKeysignPayloadErrorMessage = (
  error: unknown,
  t: TFunction
): string => {
  if (!(error instanceof BuildKeysignPayloadError)) {
    return extractErrorMsg(error)
  }

  if (error.shortfall) {
    return getInsufficientFundsMessage(error.shortfall, t)
  }

  switch (error.type) {
    case 'not-enough-funds':
      return t('not_enough_funds')
    case 'ripple-destination-tag-required':
      return t('ripple_destination_tag_required')
    default:
      return extractErrorMsg(error)
  }
}
