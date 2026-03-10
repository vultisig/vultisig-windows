import { getTxStatus } from '@core/chain/tx/status'
import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { useQuery } from '@tanstack/react-query'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import { toRecordStatus } from './toRecordStatus'

const pendingStatuses: TransactionRecordStatus[] = ['broadcasted', 'pending']

const pollingInterval = 3000

/** Polls chain status for a single pending transaction and updates its record when finalized. */
export const useTransactionStatusPolling = (record: TransactionRecord) => {
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  const isPending = pendingStatuses.includes(record.status)

  useQuery({
    queryKey: ['transactionStatusPolling', record.id, record.txHash],
    queryFn: async () => {
      const result = await getTxStatus({
        chain: record.chain,
        hash: record.txHash,
      })

      const newStatus = toRecordStatus[result.status]
      if (newStatus !== record.status) {
        updateRecord({ ...record, status: newStatus })
      }

      return result
    },
    enabled: isPending,
    refetchInterval: query => {
      const status = query.state.data?.status
      if (status === 'success' || status === 'error') return false
      return pollingInterval
    },
  })
}
