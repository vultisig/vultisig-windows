import { useQuery } from '@tanstack/react-query'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { useRef } from 'react'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import {
  getCowSwapOrderApiBase,
  getCowSwapOrderRecordUpdate,
} from './getCowSwapOrderRecordUpdate'
import { getTxStatusRecordUpdate } from './getTxStatusRecordUpdate'
import { getStatusPollingInterval } from './staleTransaction'
import { useApplyTransactionRecordUpdate } from './useApplyTransactionRecordUpdate'

const pendingStatuses: TransactionRecordStatus[] = ['broadcasted', 'pending']

/** Polls chain status for a single pending transaction and updates its record when finalized. */
export const useTransactionStatusPolling = (record: TransactionRecord) => {
  const applyRecordUpdate = useApplyTransactionRecordUpdate()
  // Limit orders are queue-driven, not chain-status-driven: the inbound tx
  // confirms long before the order settles, and letting this poller flip the
  // record to `confirmed` would end tracking on an order that is still resting.
  // useLimitOrderTracking owns their lifecycle.
  const isPending =
    pendingStatuses.includes(record.status) && record.type !== 'limitSwap'
  const recordRef = useRef(record)
  recordRef.current = record

  useQuery({
    queryKey: ['transactionStatusPolling', record.id, record.txHash],
    queryFn: async () => {
      const current = recordRef.current

      // CowSwap orders settle off-chain. Poll the orderbook by UID instead of
      // a chain hash: an order can rest up to its 15-min validity window, and
      // only the orderbook's authoritative `expired`/`cancelled` status fails
      // it.
      const cowSwapOrder = getCowSwapOrderApiBase(current)
      if (cowSwapOrder) {
        const { status, record: updatedRecord } =
          await getCowSwapOrderRecordUpdate({
            record: cowSwapOrder.record,
            apiBase: cowSwapOrder.apiBase,
          })
        if (updatedRecord) {
          applyRecordUpdate(current, updatedRecord)
        }
        return { status }
      }

      const result = await getTxStatus({
        chain: current.chain,
        hash: current.txHash,
      })

      const update = getTxStatusRecordUpdate({ record: current, result })
      if (update) {
        applyRecordUpdate(current, update)
      }

      return result
    },
    enabled: isPending,
    refetchInterval: query => {
      const status = query.state.data?.status
      if (status === 'success' || status === 'error') return false
      return getStatusPollingInterval(recordRef.current)
    },
  })
}
