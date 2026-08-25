import { useTransactionRecordsQuery } from '@core/ui/storage/transactionHistory'

import { isChainPollable } from './pendingRecord'
import { PendingTransactionWatch } from './PendingTransactionWatch'

/**
 * Polls the active vault's pending transactions app-wide so balances settle
 * wherever the user happens to be.
 *
 * A send or swap lands the user back on the vault page, where nothing used to
 * poll — the record only advanced once transaction history was opened, so the
 * balances it moved kept rendering pre-transaction amounts until a manual
 * refresh. Polling here means confirmation is noticed on the vault page itself.
 *
 * Idle cost is nil: the records read is local storage, and a chain request is
 * only made while a record is actually pending.
 */
export const TransactionStatusWatcher = () => {
  const { data: records } = useTransactionRecordsQuery()

  return (
    <>
      {(records ?? []).filter(isChainPollable).map(record => (
        <PendingTransactionWatch key={record.id} record={record} />
      ))}
    </>
  )
}
