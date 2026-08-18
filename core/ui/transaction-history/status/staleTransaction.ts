import { TransactionRecord } from '../core'

const stalePendingThresholdMs = 5 * 60 * 1000

const freshPollingIntervalMs = 3 * 1000

const stalePollingIntervalMs = 30 * 1000

/**
 * Polling cadence for a pending record: every few seconds at first, backed off
 * once the record is older than the stale threshold. Age only slows polling —
 * it is never a chain verdict, so it must not decide status: a BTC send can
 * sit in the mempool for an hour and still confirm.
 */
export const getStatusPollingInterval = (record: TransactionRecord): number => {
  const elapsed = Date.now() - new Date(record.timestamp).getTime()
  return elapsed > stalePendingThresholdMs
    ? stalePollingIntervalMs
    : freshPollingIntervalMs
}
