import { TransactionRecord } from '../core'
import { useTransactionStatusPolling } from './useTransactionStatusPolling'

/**
 * Polls one pending transaction until it settles. Rendered per record so each
 * gets its own polling query, since `useTransactionStatusPolling` is scoped to
 * a single record.
 */
export const PendingTransactionWatch = ({
  record,
}: {
  record: TransactionRecord
}) => {
  useTransactionStatusPolling(record)

  return null
}
