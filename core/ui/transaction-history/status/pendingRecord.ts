import { TransactionRecord, TransactionRecordStatus } from '../core'

/** The statuses a transaction still in flight can hold. */
export const pendingStatuses: TransactionRecordStatus[] = [
  'broadcasted',
  'pending',
]

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
