import { ThorchainTxResult } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainTxResult'
import { LimitSwapOutcome } from '@vultisig/core-chain/swap/native/limitSwapOutcome'
import { LimitSwapQueueEntry } from '@vultisig/core-chain/swap/native/limitSwapQueue'

import {
  LimitOrderTrackedStatus,
  LimitSwapTransactionRecord,
  TransactionRecordStatus,
} from '../../../../transaction-history/core'

/**
 * How many consecutive polls an order must be missing from a definite queue
 * response before its closure is acted on. Ported from iOS: absence is the only
 * terminal signal the queue gives, and one a desynced backend can fabricate —
 * a reappearance after an absent poll is the stale-backend signature itself.
 */
export const absencePollsBeforeClosing = 2

const terminalStatuses: readonly LimitOrderTrackedStatus[] = [
  'filled',
  'refunded',
  'expired',
  'cancelled',
  'rejected',
]

/** Whether the order can still change — i.e. the tracker should keep polling it. */
export const isLiveLimitOrderStatus = (
  status: LimitOrderTrackedStatus
): boolean => !terminalStatuses.includes(status)

/**
 * The generic record badge for each order state. The record's `status` speaks
 * the history UI's language (pending/confirmed/failed); the order's own
 * lifecycle lives in `data.orderStatus` and is what limit-specific UI renders.
 * Non-fill closures still map to `confirmed` — the deposit transaction did
 * succeed; what the order did is the orderStatus's story.
 */
const limitOrderRecordStatus: Record<
  LimitOrderTrackedStatus,
  TransactionRecordStatus
> = {
  pending: 'broadcasted',
  resting: 'pending',
  filled: 'confirmed',
  refunded: 'confirmed',
  expired: 'confirmed',
  cancelled: 'confirmed',
  rejected: 'failed',
}

/** Hex case is not semantic, and the queue's casing needn't match the hash we broadcast under. */
const normalizeTxId = (txHash: string): string =>
  (txHash.startsWith('0x') || txHash.startsWith('0X')
    ? txHash.slice(2)
    : txHash
  ).toUpperCase()

type FindLimitOrderQueueEntryInput = {
  entries: LimitSwapQueueEntry[]
  txHash: string
}

export const findLimitOrderQueueEntry = ({
  entries,
  txHash,
}: FindLimitOrderQueueEntryInput): LimitSwapQueueEntry | undefined =>
  entries.find(entry => normalizeTxId(entry.txId) === normalizeTxId(txHash))

const withOrderStatus = (
  record: LimitSwapTransactionRecord,
  orderStatus: LimitOrderTrackedStatus
): LimitSwapTransactionRecord => ({
  ...record,
  status: limitOrderRecordStatus[orderStatus],
  data: { ...record.data, orderStatus },
})

type GetLimitOrderRestingUpdateInput = {
  record: LimitSwapTransactionRecord
  entry: LimitSwapQueueEntry
}

/**
 * The order is in the queue: it is resting, and the queue's fill split and
 * expiry countdown are the freshest observation there is. Returns `null` when
 * nothing changed, so a quiet order doesn't rewrite storage every poll.
 *
 * The queue's own spelling of the order's identity is copied across too. That
 * is what makes an order cancellable: a cancel addresses its target by
 * `(assets, deposit, trade target)` and this is the only place those can be
 * read back as THORChain holds them — the placement memo abbreviates an L1
 * contract, and cancel memos skip the fuzzy matching that would expand it.
 */
export const getLimitOrderRestingUpdate = ({
  record,
  entry,
}: GetLimitOrderRestingUpdateInput): LimitSwapTransactionRecord | null => {
  const updated = withOrderStatus(record, 'resting')
  updated.data = {
    ...updated.data,
    deposit: entry.deposit?.toString() ?? record.data.deposit,
    amountIn: entry.amountIn?.toString() ?? record.data.amountIn,
    amountOut: entry.amountOut?.toString() ?? record.data.amountOut,
    timeToExpiryBlocks:
      entry.timeToExpiryBlocks ?? record.data.timeToExpiryBlocks,
    observedSourceAsset: entry.sourceAsset ?? record.data.observedSourceAsset,
    observedTargetAsset: entry.targetAsset ?? record.data.observedTargetAsset,
    observedTradeTarget:
      entry.tradeTarget?.toString() ?? record.data.observedTradeTarget,
  }

  const unchanged =
    record.data.orderStatus === 'resting' &&
    record.status === updated.status &&
    record.data.deposit === updated.data.deposit &&
    record.data.amountIn === updated.data.amountIn &&
    record.data.amountOut === updated.data.amountOut &&
    record.data.timeToExpiryBlocks === updated.data.timeToExpiryBlocks &&
    record.data.observedSourceAsset === updated.data.observedSourceAsset &&
    record.data.observedTargetAsset === updated.data.observedTargetAsset &&
    record.data.observedTradeTarget === updated.data.observedTradeTarget

  return unchanged ? null : updated
}

type GetLimitOrderCloseUpdateInput = {
  record: LimitSwapTransactionRecord
  outcome: LimitSwapOutcome
}

/**
 * The order left the queue and Midgard answered why. `unresolved` writes
 * nothing — almost always indexing lag; the order keeps the state and the last
 * resting observation it already had, and the tracker asks again. A guess here
 * would be permanent: nothing revisits a terminal order.
 *
 * The last-seen fill split is deliberately retained on close: a TTL-expiry
 * settle can follow a real partial fill, and dropping the split would hide
 * that the user received something.
 */
export const getLimitOrderCloseUpdate = ({
  record,
  outcome,
}: GetLimitOrderCloseUpdateInput): LimitSwapTransactionRecord | null => {
  if (outcome === 'unresolved') {
    return null
  }
  return withOrderStatus(record, outcome)
}

type GetLimitOrderRejectionUpdateInput = {
  record: LimitSwapTransactionRecord
  txResult: ThorchainTxResult | null
}

/**
 * A pending order that never reached the queue may have been refused by the
 * deposit handler outright — which produces no Midgard action, ever, so the tx
 * result is the only place it shows. `null` (not indexed / unreachable) writes
 * nothing; a rejection is only ever claimed from a parsed nonzero code.
 */
export const getLimitOrderRejectionUpdate = ({
  record,
  txResult,
}: GetLimitOrderRejectionUpdateInput): LimitSwapTransactionRecord | null => {
  if (!txResult || txResult.code === 0) {
    return null
  }
  return withOrderStatus(record, 'rejected')
}
