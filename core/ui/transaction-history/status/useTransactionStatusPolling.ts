import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { useQuery } from '@tanstack/react-query'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { useRef } from 'react'

import {
  SwapTransactionRecord,
  TransactionRecord,
  TransactionRecordStatus,
} from '../core'
import { getCowSwapOrderRecordUpdate } from './getCowSwapOrderRecordUpdate'
import { toRecordStatus } from './toRecordStatus'

const pendingStatuses: TransactionRecordStatus[] = ['broadcasted', 'pending']

const pollingInterval = 3000

const stalePendingThresholdMs = 5 * 60 * 1000

const isStaleTransaction = (record: TransactionRecord): boolean => {
  const elapsed = Date.now() - new Date(record.timestamp).getTime()
  return elapsed > stalePendingThresholdMs
}

/** A pending CowSwap order: `txHash` is the orderbook UID, not a chain hash. */
const getCowSwapOrderApiBase = (
  record: TransactionRecord
): { record: SwapTransactionRecord; apiBase: string } | null => {
  if (record.type !== 'swap') {
    return null
  }
  const { cowSwapOrderApiBase } = record.data
  return cowSwapOrderApiBase ? { record, apiBase: cowSwapOrderApiBase } : null
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

      // CowSwap orders settle off-chain. Poll the orderbook by UID instead of a
      // chain hash, and skip the generic stale-timeout: a CowSwap order can stay
      // open up to its 15-min validity window, and the orderbook's authoritative
      // `expired` status is what fails it — not an arbitrary client-side cutoff.
      const cowSwapOrder = getCowSwapOrderApiBase(current)
      if (cowSwapOrder) {
        const { status, record: updatedRecord } =
          await getCowSwapOrderRecordUpdate({
            record: cowSwapOrder.record,
            apiBase: cowSwapOrder.apiBase,
          })
        if (updatedRecord) {
          updateRecord(updatedRecord)
        }
        return { status }
      }

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
