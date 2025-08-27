import { useTranslation } from 'react-i18next'

import { useUserValidThorchainNameQuery } from '../../../queries/useUserValidThorchainNameQuery'
import { ValidThorchainNameDetails } from '../../../services/getUserValidThorchainName'

export const useFriendReferralValidation = (input: string) => {
  const {
    data: {
      name: lookedUpName = '',
      aliases = [],
    } = {} as ValidThorchainNameDetails,
  } = useUserValidThorchainNameQuery()

  const { t } = useTranslation()
  const tooLong = input.length > 4
  const badChars = !/^[A-Za-z0-9]*$/.test(input)
  const isOwn = input.toLowerCase() === lookedUpName?.toLowerCase()
  const exists = Boolean(lookedUpName)
  const hasThorAlias = Boolean(
    aliases?.some(
      alias => alias.chain?.toUpperCase() === 'THOR' && alias.address
    )
  )

  if (isOwn) {
    return t('used_referral_error')
  }

  if (tooLong) {
    return t('tns_max_4_chars')
  }

  if (badChars) {
    return t('tns_alnum_only')
  }

  if (input && !exists) {
    return t('tns_not_found')
  }

  if (input && exists && !hasThorAlias) {
    return t('tns_missing_thor_alias')
  }
}
