import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'

import { TransactionRecord, TransactionRecordStatus } from '../core'

const toRecordStatus: Record<
  TxStatusResult['status'],
  TransactionRecordStatus
> = {
  pending: 'pending',
  success: 'confirmed',
  error: 'failed',
  // The SDK proved the transaction's protocol expiration, not a UI timeout.
  expired: 'failed',
  // The node has not seen the hash yet (e.g. broadcast-propagation race); treat
  // it as still-awaiting rather than a distinct record state.
  not_found: 'pending',
}

type GetTxStatusRecordUpdateInput = {
  record: TransactionRecord
  result: TxStatusResult
}

/**
 * Maps a chain status result onto a record, returning the update to persist or
 * `null` when nothing changed. The chain is the only authority: a pending
 * record stays pending until the chain reports success or an on-chain failure,
 * no matter how old the record is. Records already stored as `failed` — which
 * older builds wrote from a client-side 5-minute timeout without asking the
 * chain — only move on affirmative chain knowledge: a confirmed tx heals to
 * `confirmed`, a tx the node reports in-flight revives to `pending`, and
 * anything inconclusive leaves them untouched.
 */
export const getTxStatusRecordUpdate = ({
  record,
  result,
}: GetTxStatusRecordUpdateInput): TransactionRecord | null => {
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
  return newStatus === record.status ? null : { ...record, status: newStatus }
}
