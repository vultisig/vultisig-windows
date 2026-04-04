import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useEffect, useRef } from 'react'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import { toRecordStatus } from './toRecordStatus'

const pendingStatuses: TransactionRecordStatus[] = ['broadcasted', 'pending']

const stalePendingThresholdMs = 5 * 60 * 1000

const isStaleTransaction = (record: TransactionRecord): boolean => {
  const elapsed = Date.now() - new Date(record.timestamp).getTime()
  return elapsed > stalePendingThresholdMs
}

/** Checks chain status for pending/broadcasted transactions and updates their status in storage. */
export const useRefreshPendingTransactions = (records: TransactionRecord[]) => {
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    const pendingRecords = records.filter(r =>
      pendingStatuses.includes(r.status)
    )

    if (pendingRecords.length === 0 || isRefreshingRef.current) return

    const refresh = async () => {
      isRefreshingRef.current = true

      try {
        await Promise.all(
          pendingRecords.map(async record => {
            const result = await attempt(() =>
              getTxStatus({ chain: record.chain, hash: record.txHash })
            )

            if ('error' in result) {
              if (isStaleTransaction(record)) {
                updateRecord({ ...record, status: 'failed' })
              }
              return
            }

            const newStatus = toRecordStatus[result.data.status]

            if (newStatus === 'pending' && isStaleTransaction(record)) {
              updateRecord({ ...record, status: 'failed' })
              return
            }

            if (newStatus === record.status) return

            updateRecord({ ...record, status: newStatus })
          })
        )
      } finally {
        isRefreshingRef.current = false
      }
    }

    refresh()
  }, [records, updateRecord])
}
