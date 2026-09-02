import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { chainPromises } from '@vultisig/lib-utils/promise/chainPromises'
import { useEffect, useRef } from 'react'

import { TransactionRecord } from '../core'
import {
  isUnaskedEvmSwapFailure,
  readSwapFailureReason,
  withSwapFailureReason,
} from './swapFailureReasonUpdate'

// Bounds the one sweep a record ever gets. Beyond this the answer is gone on
// every chain, archive node or not, so asking would only cost a request.
const revertLookupWindowMs = 7 * 24 * 60 * 60 * 1000

const isWithinLookupWindow = (record: TransactionRecord) =>
  Date.now() - new Date(record.timestamp).getTime() < revertLookupWindowMs

/**
 * Explains failed EVM swaps that were never asked about at the moment they
 * failed — records already in history before this shipped, and any swap that
 * failed while the app was closed.
 *
 * `useTransactionStatusPolling` is where a reason is normally read, seconds
 * after the verdict. This is the late pass, and late only works where the RPC
 * serves archive state: on a node keeping the last 128 blocks it will find
 * nothing, mark the record asked, and stop. That is the intended outcome rather
 * than a failure — one request per record, once, instead of two on every
 * history open for a week.
 *
 * Lookups run one at a time. A backlog is not urgent, and a vault with a long
 * failed-swap history should not open its way into a burst of parallel calls.
 */
export const useResolveSwapFailureReasons = (records: TransactionRecord[]) => {
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  const recordsRef = useRef(records)
  recordsRef.current = records
  const askedIdsRef = useRef(new Set<string>())

  useEffect(() => {
    const candidates = records
      .filter(isUnaskedEvmSwapFailure)
      .filter(isWithinLookupWindow)
      .filter(record => !askedIdsRef.current.has(record.id))

    if (candidates.length === 0) return

    candidates.forEach(record => askedIdsRef.current.add(record.id))

    void chainPromises(
      candidates.map(record => async () => {
        const reason = await readSwapFailureReason(record)

        // The record is re-read after the lookup, never written back from the
        // snapshot this pass started with: the chain takes its time answering,
        // and whatever else the app decided about this record meanwhile is
        // newer than anything held here.
        const current = recordsRef.current.find(({ id }) => id === record.id)
        if (!current || !isUnaskedEvmSwapFailure(current)) return

        updateRecord(withSwapFailureReason({ record: current, reason }))
      })
    )
  }, [records, updateRecord])
}
