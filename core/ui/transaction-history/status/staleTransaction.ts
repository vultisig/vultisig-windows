import { TransactionRecord } from '../core'

const stalePendingThresholdMs = 5 * 60 * 1000

const isStaleTransaction = (record: TransactionRecord): boolean => {
  const elapsed = Date.now() - new Date(record.timestamp).getTime()
  return elapsed > stalePendingThresholdMs
}

/**
 * Decides whether a pending record should be marked failed by the client-side
 * stale timeout. Swap records stay pending until an authoritative provider
 * status resolves them.
 */
export const shouldFailStaleTransaction = (
  record: TransactionRecord
): boolean => record.type === 'send' && isStaleTransaction(record)
