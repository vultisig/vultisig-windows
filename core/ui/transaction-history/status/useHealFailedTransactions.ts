import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useEffect, useRef } from 'react'

import { TransactionRecord } from '../core'
import { getTxStatusRecordUpdate } from './getTxStatusRecordUpdate'
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

/**
 * Asks the chain once, per history open, about recently failed sends and
 * heals the ones that actually landed.
 *
 * Pending records are deliberately not swept here: `TransactionStatusWatcher`
 * already polls them app-wide, and a second reader would apply the same
 * verdict twice. Each candidate is checked once per mount, so the records
 * refetch every applied update triggers does not re-poll the whole backlog.
 */
export const useHealFailedTransactions = (records: TransactionRecord[]) => {
  const applyRecordUpdate = useApplyTransactionRecordUpdate()
  const checkedIdsRef = useRef(new Set<string>())

  useEffect(() => {
    const candidates = records.filter(
      record => isHealCandidate(record) && !checkedIdsRef.current.has(record.id)
    )

    if (candidates.length === 0) return

    candidates.forEach(record => checkedIdsRef.current.add(record.id))

    candidates.forEach(async record => {
      const result = await attempt(() =>
        getTxStatus({ chain: record.chain, hash: record.txHash })
      )

      // A failed status lookup says nothing about the tx itself — leave the
      // record alone and let the next history open try again.
      if ('error' in result) return

      const update = getTxStatusRecordUpdate({ record, result: result.data })
      if (update) {
        applyRecordUpdate({ previous: record, update })
      }
    })
  }, [records, applyRecordUpdate])
}
