import { TransactionRecord, TransactionRecordStatus } from '../core'

/** The statuses a transaction still in flight can hold. */
export const pendingStatuses: TransactionRecordStatus[] = [
  'broadcasted',
  'pending',
]

const settledStatuses: TransactionRecordStatus[] = ['confirmed', 'failed']

/**
 * Whether a record's status should be driven by reading chain state.
 *
 * Limit orders are queue-driven: their inbound deposit confirms in seconds
 * while the order rests for hours, so chain status would mark the record
 * `confirmed` and contradict the order's own state. `useLimitOrderTracking`
 * owns their lifecycle.
 */
export const isChainPollable = (record: TransactionRecord) =>
  pendingStatuses.includes(record.status) && record.type !== 'limitSwap'

type IsSettlingTransitionInput = {
  previous: TransactionRecord
  update: TransactionRecord
}

/**
 * Whether an update moves a record into a settled status it did not hold
 * before — the one moment per chain verdict at which the balances it touched
 * are worth re-reading. A healed send counts: `failed` to `confirmed` is a new
 * verdict, while a re-poll reporting the same settled status is not.
 */
export const isSettlingTransition = ({
  previous,
  update,
}: IsSettlingTransitionInput) =>
  settledStatuses.includes(update.status) && update.status !== previous.status
