import { TransactionRecord } from '../core'

const stalePendingThresholdMs = 5 * 60 * 1000

const isStaleTransaction = (record: TransactionRecord): boolean => {
  const elapsed = Date.now() - new Date(record.timestamp).getTime()
  return elapsed > stalePendingThresholdMs
}

export const shouldFailStaleTransaction = (
  record: TransactionRecord
): boolean => record.type === 'send' && isStaleTransaction(record)
