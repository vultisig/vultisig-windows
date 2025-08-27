import { useTranslation } from 'react-i18next'

import { useThorNameByNameQuery } from '../../../hooks/useThorNameByNameQuery'
import { useUserValidThorchainNameQuery } from '../../../queries/useUserValidThorchainNameQuery'

export const useFriendReferralValidation = (input: string) => {
  const { t } = useTranslation()
  const trimmedInput = (input || '').trim()

  const { data: me } = useUserValidThorchainNameQuery()
  const { data: friend } = useThorNameByNameQuery(trimmedInput)

  const tooLong = trimmedInput.length > 4
  const badChars = !/^[A-Za-z0-9]*$/.test(trimmedInput)
  const isOwn =
    !!trimmedInput &&
    !!me?.name &&
    trimmedInput.toLowerCase() === me.name.toLowerCase()
  const exists = !!friend?.name
  const hasThorAlias = !!friend?.aliases?.some(
    a => a.chain?.toUpperCase() === 'THOR' && a.address
  )

  if (isOwn) return t('used_referral_error')
  if (tooLong) return t('tns_max_4_chars')
  if (badChars) return t('tns_alnum_only')
  if (trimmedInput && !exists) return t('tns_not_found')
  if (trimmedInput && exists && !hasThorAlias)
    return t('tns_missing_thor_alias')
}
