import { TransactionRecord } from './core'
import { SwapFailureReason } from './status/swapFailureReason'

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
 * The failure reason a record has to show, if any. Reasons are only ever
 * resolved for swaps, and only meaningful while the record is failed — a
 * record healed back to confirmed keeps the field but must not explain itself.
 */
export const getRecordFailureReason = (
  record: TransactionRecord
): SwapFailureReason | undefined =>
  record.type === 'swap' && record.status === 'failed'
    ? record.data.failureReason
    : undefined
