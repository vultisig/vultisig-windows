import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useEffect, useRef } from 'react'

import { TransactionRecord } from '../core'
import {
  getCowSwapOrderApiBase,
  getCowSwapOrderRecordUpdate,
} from './getCowSwapOrderRecordUpdate'
import { getTxStatusRecordUpdate } from './getTxStatusRecordUpdate'
import { isChainPollable } from './pendingRecord'
import { useApplyTransactionRecordUpdate } from './useApplyTransactionRecordUpdate'

const healWindowMs = 30 * 24 * 60 * 60 * 1000

// Older builds failed pending sends from a client-side 5-minute timeout
// without asking the chain, so slow-but-successful sends (e.g. BTC taking an
// hour to confirm) were stored as `failed` forever. Re-check recent failed
// sends so the chain's verdict can heal them; the window bounds how many
// genuinely dead records get re-polled on every history open.
const isHealCandidate = (record: TransactionRecord): boolean =>
  record.type === 'send' &&
  record.status === 'failed' &&
  Date.now() - new Date(record.timestamp).getTime() < healWindowMs

/** Checks chain status for pending/broadcasted transactions and updates their status in storage. */
export const useRefreshPendingTransactions = (records: TransactionRecord[]) => {
  const applyRecordUpdate = useApplyTransactionRecordUpdate()
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    const refreshableRecords = records.filter(
      r => isChainPollable(r) || isHealCandidate(r)
    )

    if (refreshableRecords.length === 0 || isRefreshingRef.current) return

    const refresh = async () => {
      isRefreshingRef.current = true

      try {
        await Promise.all(
          refreshableRecords.map(async record => {
            // CowSwap orders settle off-chain: `txHash` is the orderbook UID,
            // not a chain hash. Poll the orderbook instead — only its
            // authoritative `expired`/`cancelled` status fails an order.
            const cowSwapOrder = getCowSwapOrderApiBase(record)
            if (cowSwapOrder) {
              const { record: updatedRecord } =
                await getCowSwapOrderRecordUpdate({
                  record: cowSwapOrder.record,
                  apiBase: cowSwapOrder.apiBase,
                })
              if (updatedRecord) {
                applyRecordUpdate({ previous: record, update: updatedRecord })
              }
              return
            }

            const result = await attempt(() =>
              getTxStatus({ chain: record.chain, hash: record.txHash })
            )

            // A failed status lookup says nothing about the tx itself — leave
            // the record alone and let the next refresh try again.
            if ('error' in result) return

            const update = getTxStatusRecordUpdate({
              record,
              result: result.data,
            })
            if (update) {
              applyRecordUpdate({ previous: record, update })
            }
          })
        )
      } finally {
        isRefreshingRef.current = false
      }
    }

    refresh()
  }, [records, applyRecordUpdate])
}
