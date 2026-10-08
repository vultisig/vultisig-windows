import { getInsufficientFundsMessage } from '@core/ui/vault/send/funds/getInsufficientFundsMessage'
import {
  BuildKeysignPayloadError,
  BuildKeysignPayloadErrorType,
} from '@vultisig/core-mpc/keysign/error'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { TFunction } from 'i18next'

const buildKeysignPayloadErrorMessages: Partial<
  Record<BuildKeysignPayloadErrorType, (t: TFunction) => string>
> = {
  'not-enough-funds': t => t('not_enough_funds'),
  'ripple-destination-tag-required': t => t('ripple_destination_tag_required'),
}

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

  const translate = buildKeysignPayloadErrorMessages[error.type]
  return translate ? translate(t) : extractErrorMsg(error)
}
