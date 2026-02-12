import { useTranslation } from 'react-i18next'

import { useReferralValidation } from '../../../hooks/useReferralValidation'
import { useUserValidThorchainNameQuery } from '../../../queries/useUserValidThorchainNameQuery'

export const useFriendReferralValidation = (input: string) => {
  const { t } = useTranslation()
  const trimmedInput = (input || '').trim()

  const { data: me } = useUserValidThorchainNameQuery()
  const baseError = useReferralValidation(input)

  const isOwn =
    !!trimmedInput &&
    !!me?.name &&
    trimmedInput.toLowerCase() === me.name.toLowerCase()

  if (isOwn) return t('used_referral_error')

  return baseError
}
