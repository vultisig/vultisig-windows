import { TextColor } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { LimitOrderTrackedStatus } from '../../../../transaction-history/core'

/** THORChain targets ~6s blocks; the queue reports expiry in blocks. */
const secondsPerBlock = 6

/**
 * The queue's block countdown as a coarse human duration ("2d 3h", "45m").
 * Coarse on purpose: it is refreshed once per poll, so minute precision is the
 * most it can honestly claim.
 */
export const formatLimitOrderExpiry = (timeToExpiryBlocks: number): string => {
  const totalMinutes = Math.floor((timeToExpiryBlocks * secondsPerBlock) / 60)
  if (totalMinutes < 1) {
    return '<1m'
  }
  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${minutes}m`
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
