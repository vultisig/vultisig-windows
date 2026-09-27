import { Chain } from '@vultisig/core-chain/Chain'
import { TxReceiptInfo } from '@vultisig/core-chain/tx/status'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'
import { settledStatuses } from './pendingRecord'

/** The record types that show the fee their transaction paid. */
export type FeeBearingRecord = SendTransactionRecord | SwapTransactionRecord

/** Whether a record is a send or a swap, the two that store a network fee. */
export const isFeeBearingRecord = (
  record: TransactionRecord
): record is FeeBearingRecord =>
  record.type === 'send' || record.type === 'swap'

/**
 * The chain the fee was paid on. A native swap's record is filed under
 * THORChain or MayaChain, but its hash is the deposit on the chain the funds
 * left from, and so is its fee.
 */
export const getRecordFeeChain = (record: FeeBearingRecord): Chain =>
  record.type === 'swap' ? record.data.fromChain : record.chain

/**
 * Whether the user paid for the transaction behind this record. A settled
 * CowSwap order's hash is the solver's settlement transaction: its gas is the
 * solver's, and the user's cost is already inside the order.
 */
const paysOwnNetworkFee = (record: FeeBearingRecord): boolean =>
  record.type === 'send' || record.data.cowSwapOrderApiBase === undefined

type WithReceiptNetworkFeeInput<T extends FeeBearingRecord> = {
  record: T
  receipt: TxReceiptInfo | undefined
}

/**
 * The record with the fee its receipt reports, or `null` when there is nothing
 * to add: no receipt yet, a fee the user did not pay, or one already stored. A
 * mined transaction's fee does not change, so the first one read is kept.
 */
export const withReceiptNetworkFee = <T extends FeeBearingRecord>({
  record,
  receipt,
}: WithReceiptNetworkFeeInput<T>): T | null => {
  if (!receipt || record.data.networkFee || !paysOwnNetworkFee(record)) {
    return null
  }

  return {
    ...record,
    data: {
      ...record.data,
      networkFee: {
        amount: receipt.feeAmount.toString(),
        decimals: receipt.feeDecimals,
        ticker: receipt.feeTicker,
      },
    },
  }
}

/**
 * A settled send or swap whose record still has no fee: one that settled
 * before fees were stored, or whose settling read came back without a
 * receipt. A record still in flight is left to the status poll, which stores
 * the fee with its verdict.
 */
export const getNetworkFeeBackfillRecord = (
  record: TransactionRecord
): FeeBearingRecord | null => {
  if (
    !isFeeBearingRecord(record) ||
    !settledStatuses.includes(record.status) ||
    record.data.networkFee ||
    !paysOwnNetworkFee(record)
  ) {
    return null
  }

  return record
}
