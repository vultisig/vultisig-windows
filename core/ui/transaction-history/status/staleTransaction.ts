import { TransactionRecord } from '../core'

const stalePendingThresholdMs = 5 * 60 * 1000

const agedPendingThresholdMs = 24 * 60 * 60 * 1000

const freshPollingIntervalMs = 3 * 1000

const stalePollingIntervalMs = 30 * 1000

const agedPollingIntervalMs = 10 * 60 * 1000

/**
 * Polling cadence for a pending record: every few seconds at first, backed off
 * once the record is older than the stale threshold, and down to minutes once
 * it is a day old. Age only slows polling — it is never a chain verdict, so it
 * must not decide status: a BTC send can sit in the mempool for an hour and
 * still confirm. The day-old tier exists because a dropped transaction stays
 * pending for good, and the app-wide watcher would otherwise keep asking the
 * chain about it every half minute in every session.
 */
export const getStatusPollingInterval = (record: TransactionRecord): number => {
  const elapsed = Date.now() - new Date(record.timestamp).getTime()
  if (elapsed > agedPendingThresholdMs) return agedPollingIntervalMs
  if (elapsed > stalePendingThresholdMs) return stalePollingIntervalMs
  return freshPollingIntervalMs
}
