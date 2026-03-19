import { useTranslation } from 'react-i18next'

import { useReferralValidation } from '../../../hooks/useReferralValidation'
import { useUserValidThorchainNameQuery } from '../../../queries/useUserValidThorchainNameQuery'

export const useFriendReferralValidation = (input: string) => {
  const { t } = useTranslation()
  const trimmedInput = (input || '').trim()

  const { data: me } = useUserValidThorchainNameQuery()
  const { error: baseError, isPending } = useReferralValidation(input)

  const isOwn =
    !!trimmedInput &&
    !!me?.name &&
    trimmedInput.toLowerCase() === me.name.toLowerCase()

  const error = isOwn ? t('used_referral_error') : baseError

  return { error, isPending }
}
