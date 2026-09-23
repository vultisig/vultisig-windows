import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'

import { TransactionRecord } from './core'
import {
  SendFailureReason,
  sendFailureReasons,
} from './status/sendFailureReason'
import {
  SwapFailureReason,
  swapFailureReasons,
} from './status/swapFailureReason'

/** A failure history has wording for, whichever record type carries it. */
export type RecordFailureReason = SwapFailureReason | SendFailureReason

/**
 * The wording each recognised failure gets: a short line for the history row,
 * and the full explanation — including what to do about it — for the detail
 * screen.
 */
export const failureCopy = {
  slippage: {
    label: 'swap_failed_slippage',
    description: 'swap_failed_slippage_description',
  },
  refunded: {
    label: 'swap_failed_refunded',
    description: 'swap_failed_refunded_description',
  },
  expired: {
    label: 'tx_failed_expired',
    description: 'tx_failed_expired_description',
  },
} as const satisfies Record<
  RecordFailureReason,
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
 * row it belongs to. Each record type is checked against its own list: a send
 * cannot have failed on slippage, whatever a stored value claims.
 */
export const getRecordFailureReason = (
  record: TransactionRecord
): RecordFailureReason | undefined => {
  if (record.status !== 'failed') return undefined

  return matchDiscriminatedUnion(record, 'type', 'data', {
    send: ({ failureReason }): RecordFailureReason | undefined =>
      isOneOf(failureReason, sendFailureReasons) ? failureReason : undefined,
    swap: ({ failureReason }): RecordFailureReason | undefined =>
      isOneOf(failureReason, swapFailureReasons) ? failureReason : undefined,
    limitSwap: () => undefined,
    trustLine: () => undefined,
  })
}
