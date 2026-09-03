import { useQuery } from '@tanstack/react-query'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { useRef } from 'react'

import { TransactionRecord } from '../core'
import {
  getCowSwapOrderApiBase,
  getCowSwapOrderRecordUpdate,
} from './getCowSwapOrderRecordUpdate'
import { getTxStatusRecordUpdate } from './getTxStatusRecordUpdate'
import { isChainPollable } from './pendingRecord'
import { getStatusPollingInterval } from './staleTransaction'
import {
  isUnaskedEvmSwapFailure,
  readSwapFailureReason,
  withSwapFailureReason,
} from './swapFailureReasonUpdate'
import { useApplyTransactionRecordUpdate } from './useApplyTransactionRecordUpdate'

/**
 * Polls chain status for a single pending transaction and updates its record
 * when finalized.
 *
 * A swap the chain has just failed is asked why here rather than later, because
 * the answer has a shelf life: reading a revert means replaying the transaction
 * against the block it was mined in, and several of the chains we talk to keep
 * only the last 128 blocks — minutes, not days. This runs seconds after the
 * failure, and folds the reason into the same write the verdict already makes.
 */
export const useTransactionStatusPolling = (record: TransactionRecord) => {
  const applyRecordUpdate = useApplyTransactionRecordUpdate()
  const isPending = isChainPollable(record)
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
          applyRecordUpdate({ previous: current, update: updatedRecord })
        }
        return { status }
      }

      const result = await getTxStatus({
        chain: current.chain,
        hash: current.txHash,
      })

      const update = getTxStatusRecordUpdate({ record: current, result })
      if (update) {
        applyRecordUpdate({
          previous: current,
          update: isUnaskedEvmSwapFailure(update)
            ? withSwapFailureReason({
                record: update,
                reason: await readSwapFailureReason(update),
              })
            : update,
        })
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
