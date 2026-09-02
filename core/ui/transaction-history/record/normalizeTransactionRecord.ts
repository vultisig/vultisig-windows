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
 *
 * This runs on the far side of a `JSON.parse` and an unchecked cast, so it is
 * the one place that cannot take its own types at face value: a record whose
 * `targetAsset` did not survive storage is passed through untouched rather than
 * throwing. A repair pass that dies on damaged input would take the entire
 * history query down with it — every record, not just the bad one — which is
 * the opposite of what it is here to do.
 */
export const normalizeTransactionRecord = (
  record: TransactionRecord
): TransactionRecord => {
  if (record.type !== 'limitSwap') {
    return record
  }

  const { targetAsset } = record.data
  if (typeof targetAsset !== 'string' || !targetAsset) {
    return record
  }

  const buyTicker = getThorchainAssetTicker(targetAsset)
  if (buyTicker === record.data.buyTicker) {
    return record
  }

  return { ...record, data: { ...record.data, buyTicker } }
}
