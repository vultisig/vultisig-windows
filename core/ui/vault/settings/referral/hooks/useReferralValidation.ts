import { useTranslation } from 'react-i18next'

import { useThorNameByNameQuery } from './useThorNameByNameQuery'

type ReferralValidationResult = {
  error: string | undefined
  isPending: boolean
}

/** Validates a referral code against THORName registry. */
export const useReferralValidation = (
  input: string
): ReferralValidationResult => {
  const { t } = useTranslation()
  const trimmedInput = (input || '').trim()

  const { data: friend, isFetching } = useThorNameByNameQuery(trimmedInput)

  const tooLong = trimmedInput.length > 4
  const badChars = !/^[A-Za-z0-9]*$/.test(trimmedInput)
  const exists = !!friend?.name
  const hasThorAlias = !!friend?.aliases?.some(
    a => a.chain?.toUpperCase() === 'THOR' && a.address
  )

  const isPending = !!trimmedInput && isFetching

  const error = tooLong
    ? t('tns_max_4_chars')
    : badChars
      ? t('tns_alnum_only')
      : trimmedInput && !exists
        ? t('tns_not_found')
        : trimmedInput && exists && !hasThorAlias
          ? t('tns_missing_thor_alias')
          : undefined

  return { error, isPending }
}
