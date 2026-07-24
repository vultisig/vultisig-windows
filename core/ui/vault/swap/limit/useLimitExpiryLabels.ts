import { LimitSwapExpiryHours } from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { useTranslation } from 'react-i18next'

/**
 * Translated label for each expiry option (`72` reads as "3d", not "72h").
 *
 * Shared so the compose card and the review screen render the same copy through
 * `useTranslation()` rather than each hardcoding the strings.
 */
export const useLimitExpiryLabels = (): Record<
  LimitSwapExpiryHours,
  string
> => {
  const { t } = useTranslation()

  return {
    12: t('swap_limit_expiry_12h'),
    24: t('swap_limit_expiry_24h'),
    72: t('swap_limit_expiry_3d'),
  }
}
