import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'
import { match } from '@vultisig/lib-utils/match'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
  TransactionRecordStatus,
} from '../core'

const toRecordStatus: Record<
  TxStatusResult['status'],
  TransactionRecordStatus
> = {
  pending: 'pending',
  success: 'confirmed',
  error: 'failed',
  // The SDK proved the transaction's protocol expiration, not a UI timeout.
  expired: 'failed',
  // The node has not seen the hash yet (e.g. broadcast-propagation race) and
  // nothing proves it never will: treat it as still-awaiting rather than a
  // distinct record state. An absence the chain HAS proved permanent arrives
  // as `expired`, never as `not_found`.
  not_found: 'pending',
}

/** The record types that can say why they failed. */
type ExplainableRecord = SendTransactionRecord | SwapTransactionRecord

const isExplainable = (
  record: TransactionRecord
): record is ExplainableRecord =>
  record.type === 'send' || record.type === 'swap'

/**
 * The record with the reason an expiry deserves, so its row can say the
 * transaction never went through rather than merely that it failed. Generic so
 * a send stays a send and a swap a swap.
 */
const withExpiredReason = <T extends ExplainableRecord>(record: T): T => ({
  ...record,
  data: { ...record.data, failureReason: 'expired' },
})

/**
 * Whether the chain itself vouches for the transaction: it holds the hash and
 * has either settled it or is still working on it. A lookup the node could not
 * answer says nothing either way — `not_found` and an unknown `pending` are
 * exactly what a transaction nobody ever broadcast looks like.
 */
const isVouchedForByChain = (result: TxStatusResult): boolean =>
  match(result.status, {
    success: () => true,
    error: () => true,
    pending: () => result.isKnown === true,
    expired: () => result.isKnown === true,
    not_found: () => false,
  })

type GetTxStatusRecordUpdateInput = {
  record: TransactionRecord
  result: TxStatusResult
}

/**
 * Maps a chain status result onto a record, returning the update to persist or
 * `null` when nothing changed. The chain is the only authority: a pending
 * record stays pending until the chain reports success or an on-chain failure,
 * no matter how old the record is. An `expired` verdict is such a failure —
 * the chain proved the transaction could no longer be included, and it never
 * was — and the one the chain explains itself, so it is stored with its
 * reason. Records already stored as `failed` — which older builds wrote from a
 * client-side 5-minute timeout without asking the chain — only move on
 * affirmative chain knowledge: a confirmed tx heals to `confirmed`, a tx the
 * node reports in-flight revives to `pending`, and anything inconclusive
 * leaves them untouched.
 *
 * A `signed` record — one the wallet signed for a dApp but never broadcast —
 * has no in-flight claim to keep, so it too only moves once the chain vouches
 * for the hash. A dApp that dropped the transaction leaves it honestly
 * `signed` rather than "in progress" for good.
 */
export const getTxStatusRecordUpdate = ({
  record,
  result,
}: GetTxStatusRecordUpdateInput): TransactionRecord | null => {
  if (record.status === 'signed') {
    if (!isVouchedForByChain(result)) return null

    const update = { ...record, status: toRecordStatus[result.status] }

    return result.status === 'expired' && isExplainable(update)
      ? withExpiredReason(update)
      : update
  }

  if (record.status === 'failed') {
    if (result.status === 'success') {
      return { ...record, status: 'confirmed' }
    }
    if (result.status === 'pending' && result.isKnown) {
      return { ...record, status: 'pending' }
    }
    return null
  }

  const newStatus = toRecordStatus[result.status]
  if (newStatus === record.status) return null

  const update = { ...record, status: newStatus }

  return result.status === 'expired' && isExplainable(update)
    ? withExpiredReason(update)
    : update
}
