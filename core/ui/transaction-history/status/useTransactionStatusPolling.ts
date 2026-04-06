import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { useQuery } from '@tanstack/react-query'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { useRef } from 'react'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import { toRecordStatus } from './toRecordStatus'

const pendingStatuses: TransactionRecordStatus[] = ['broadcasted', 'pending']

const pollingInterval = 3000

const stalePendingThresholdMs = 5 * 60 * 1000

const isStaleTransaction = (record: TransactionRecord): boolean => {
  const elapsed = Date.now() - new Date(record.timestamp).getTime()
  return elapsed > stalePendingThresholdMs
}

/** Polls chain status for a single pending transaction and updates its record when finalized. */
export const useTransactionStatusPolling = (record: TransactionRecord) => {
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  const isPending = pendingStatuses.includes(record.status)
  const recordRef = useRef(record)
  recordRef.current = record

  useQuery({
    queryKey: ['transactionStatusPolling', record.id, record.txHash],
    queryFn: async () => {
      const current = recordRef.current

      if (isStaleTransaction(current)) {
        updateRecord({ ...current, status: 'failed' })
        return { status: 'error' as const }
      }

      const result = await getTxStatus({
        chain: current.chain,
        hash: current.txHash,
      })

      const newStatus = toRecordStatus[result.status]
      if (newStatus !== current.status) {
        updateRecord({ ...current, status: newStatus })
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
