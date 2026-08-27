import { getThorchainAssetTicker } from '../../mpc/keysign/join/tx/thorchainAssetTicker'
import { TransactionRecord } from '../core'

/**
 * Repair a record on its way out of storage, re-deriving the display fields that
 * were denormalized off a memo at write time.
 *
 * A limit order's `buyTicker` is decoded from `targetAsset`, so an order placed
 * before that decode understood secured-asset notation has the entire raw denom
 * sitting where its ticker belongs — on the history row, the pending card, the
 * detail screen and the cancel confirmation alike. Re-deriving on read fixes
 * those orders without a migration: the memo the record already carries is the
 * source of truth, so the derivation is correct whenever it runs, and it stays
 * correct for records this bug never touched.
 *
 * Returns the record unchanged when nothing needed repairing, so React Query
 * consumers keep their referential identity.
 */
export const normalizeTransactionRecord = (
  record: TransactionRecord
): TransactionRecord => {
  if (record.type !== 'limitSwap') {
    return record
  }

  const buyTicker = getThorchainAssetTicker(record.data.targetAsset)
  if (buyTicker === record.data.buyTicker) {
    return record
  }

  return { ...record, data: { ...record.data, buyTicker } }
}
