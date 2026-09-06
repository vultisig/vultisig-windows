import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { TransactionRecord } from './core'
import {
  SwapFailureReason,
  swapFailureReasons,
} from './status/swapFailureReason'

/**
 * The wording each recognised swap failure gets: a short line for the history
 * row, and the full explanation — including what to do about it — for the
 * detail screen.
 */
export const swapFailureCopy = {
  slippage: {
    label: 'swap_failed_slippage',
    description: 'swap_failed_slippage_description',
  },
} as const satisfies Record<
  SwapFailureReason,
  { label: string; description: string }
>

/**
 * The failure reason a record has to show, if any, and the only place that
 * decides it — a stored reason is never read straight onto the screen.
 *
 * Two things are filtered here. A record healed back to confirmed keeps the
 * field it was failed with and must not go on explaining itself. And a reason
 * written by a newer build is a string this build has no wording for, which
 * would otherwise take the whole history list down with it rather than the one
 * row it belongs to.
 */
export const getRecordFailureReason = (
  record: TransactionRecord
): SwapFailureReason | undefined => {
  if (record.type !== 'swap' || record.status !== 'failed') return undefined

  const { failureReason } = record.data

  return isOneOf(failureReason, swapFailureReasons) ? failureReason : undefined
}
