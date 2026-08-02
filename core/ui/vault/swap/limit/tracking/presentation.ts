import { TextColor } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { LimitOrderTrackedStatus } from '../../../../transaction-history/core'

/** THORChain targets ~6s blocks; the queue reports expiry in blocks. */
const secondsPerBlock = 6

/**
 * The queue's block countdown as a coarse human duration ("2d 3h", "45m").
 *
 * Coarse on purpose: it is refreshed once per poll, so minute precision is the
 * most it can honestly claim. The unit abbreviations come from translations —
 * they are short, but they are still words, and `d`/`h`/`m` are English ones.
 */
export const useFormatLimitOrderExpiry = () => {
  const { t } = useTranslation()

  return (timeToExpiryBlocks: number): string => {
    const totalMinutes = Math.floor((timeToExpiryBlocks * secondsPerBlock) / 60)
    if (totalMinutes < 1) {
      return t('swap_limit_expiry_under_minute')
    }

    const days = Math.floor(totalMinutes / (24 * 60))
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) {
      return hours > 0
        ? t('swap_limit_expiry_days_hours', { days, hours })
        : t('swap_limit_expiry_days', { days })
    }
    if (hours > 0) {
      return minutes > 0
        ? t('swap_limit_expiry_hours_minutes', { hours, minutes })
        : t('swap_limit_expiry_hours', { hours })
    }
    return t('swap_limit_expiry_minutes', { minutes })
  }
}

export const limitOrderStatusColor: Record<LimitOrderTrackedStatus, TextColor> =
  {
    pending: 'idle',
    resting: 'idle',
    filled: 'success',
    refunded: 'regular',
    expired: 'regular',
    cancelled: 'regular',
    rejected: 'danger',
  }

/**
 * Translated label per order state, shared by every surface that renders one so
 * the list, detail, and history views can't drift.
 */
export const useLimitOrderStatusLabels = (): Record<
  LimitOrderTrackedStatus,
  string
> => {
  const { t } = useTranslation()

  return {
    pending: t('swap_limit_status_pending'),
    resting: t('swap_limit_status_resting'),
    filled: t('swap_limit_status_filled'),
    refunded: t('swap_limit_status_refunded'),
    expired: t('swap_limit_status_expired'),
    cancelled: t('swap_limit_status_cancelled'),
    rejected: t('swap_limit_status_rejected'),
  }
}
