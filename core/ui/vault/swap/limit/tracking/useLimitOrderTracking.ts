import {
  useTransactionRecordsQuery,
  useUpdateTransactionRecordMutation,
} from '@core/ui/storage/transactionHistory'
import { useQuery } from '@tanstack/react-query'
import { getThorchainTxResult } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainTxResult'
import { resolveLimitSwapOutcome } from '@vultisig/core-chain/swap/native/limitSwapOutcome'
import {
  getLimitSwapQueue,
  LimitSwapQueueEntry,
} from '@vultisig/core-chain/swap/native/limitSwapQueue'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useRef } from 'react'

import {
  LimitSwapTransactionRecord,
  TransactionRecord,
} from '../../../../transaction-history/core'
import {
  absencePollsBeforeClosing,
  findLimitOrderQueueEntry,
  getLimitOrderCloseUpdate,
  getLimitOrderRejectionUpdate,
  getLimitOrderRestingUpdate,
  isLiveLimitOrderStatus,
} from './reconcile'

const pollingInterval = 15_000

const isLiveLimitOrder = (
  record: TransactionRecord
): record is LimitSwapTransactionRecord =>
  record.type === 'limitSwap' && isLiveLimitOrderStatus(record.data.orderStatus)

/**
 * Keeps every live limit order's record in step with THORChain.
 *
 * One queue call per source address in play (the endpoint is sender-scoped),
 * then per order: present in the queue → resting, with the queue's fill split
 * and expiry countdown; absent from a DEFINITE queue on
 * `absencePollsBeforeClosing` consecutive polls → resolve the outcome through
 * the SDK, writing a terminal state only when THORChain answered. A pending
 * order that stays unresolved is probed for outright rejection via the cosmos
 * tx result — the one failure Midgard never indexes.
 *
 * All classification is the SDK's; nothing here guesses. A failed queue fetch
 * is "no information": nothing is written and absence streaks don't advance,
 * so an infrastructure hiccup can never close an order (ported from iOS's
 * tracker, including the two-poll absence corroboration — a reappearance
 * resets the streak, being the stale-backend signature itself).
 *
 * Mounted by the pages that display order state; polling stops on its own when
 * no live orders remain.
 */
export const useLimitOrderTracking = () => {
  const recordsQuery = useTransactionRecordsQuery()
  const { mutateAsync: updateRecord } = useUpdateTransactionRecordMutation()

  // In-memory on purpose: a restart restarts corroboration, which fails toward
  // keeping orders open — the safe direction.
  const absentPollsRef = useRef(new Map<string, number>())

  const liveOrders = (recordsQuery.data ?? []).filter(isLiveLimitOrder)

  useQuery({
    queryKey: [
      'limitOrderTracking',
      liveOrders
        .map(record => record.id)
        .sort()
        .join(','),
    ],
    enabled: liveOrders.length > 0,
    queryFn: async () => {
      const senders = withoutDuplicates(
        liveOrders.map(record => record.data.fromAddress)
      )

      const queueBySender = new Map<string, LimitSwapQueueEntry[] | null>()
      await Promise.all(
        senders.map(async sender => {
          const result = await attempt(() => getLimitSwapQueue(sender))
          queueBySender.set(
            sender,
            'data' in result ? (result.data ?? null) : null
          )
        })
      )

      for (const record of liveOrders) {
        const queue = queueBySender.get(record.data.fromAddress) ?? null

        if (queue === null) {
          // No information — leave the order and its absence streak untouched.
          continue
        }

        const entry = findLimitOrderQueueEntry({
          entries: queue,
          txHash: record.txHash,
        })

        if (entry) {
          absentPollsRef.current.delete(record.id)
          const updated = getLimitOrderRestingUpdate({ record, entry })
          if (updated) {
            await updateRecord(updated)
          }
          continue
        }

        const streak = Math.min(
          (absentPollsRef.current.get(record.id) ?? 0) + 1,
          absencePollsBeforeClosing
        )
        absentPollsRef.current.set(record.id, streak)
        if (streak < absencePollsBeforeClosing) {
          continue
        }

        const outcome = await resolveLimitSwapOutcome(record.txHash)
        const closed = getLimitOrderCloseUpdate({ record, outcome })
        if (closed) {
          absentPollsRef.current.delete(record.id)
          await updateRecord(closed)
          continue
        }

        if (record.data.orderStatus === 'pending') {
          const rejection = getLimitOrderRejectionUpdate({
            record,
            txResult: await getThorchainTxResult(record.txHash),
          })
          if (rejection) {
            absentPollsRef.current.delete(record.id)
            await updateRecord(rejection)
          }
        }
      }

      return liveOrders.length
    },
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
  })
}
