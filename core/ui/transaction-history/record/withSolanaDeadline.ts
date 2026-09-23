import { Chain } from '@vultisig/core-chain/Chain'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { withSolanaRpcTimeout } from '@vultisig/core-chain/chains/solana/rpcTimeout'
import { attempt } from '@vultisig/lib-utils/attempt'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'
import { getRecordLastValidBlockHeight } from '../status/getRecordLastValidBlockHeight'

/** The record types whose status poll can use a Solana blockhash deadline. */
type DeadlineRecord = SendTransactionRecord | SwapTransactionRecord

const needsSolanaDeadline = (
  record: TransactionRecord
): record is DeadlineRecord =>
  record.chain === Chain.Solana &&
  (record.type === 'send' || record.type === 'swap') &&
  getRecordLastValidBlockHeight(record) === undefined

const withDeadline = <T extends DeadlineRecord>(
  record: T,
  lastValidBlockHeight: number
): T => ({
  ...record,
  data: { ...record.data, lastValidBlockHeight },
})

/**
 * Gives a Solana record that reached the recorder without a blockhash deadline
 * one the status poll can still settle on.
 *
 * The keysign payload carries the exact deadline only when the device that
 * built it recorded one. A ceremony started on a phone, or a payload built
 * around a protocol's own transaction (Kamino), arrives without it — and a
 * record with no deadline polls as pending for good once its transaction is
 * dropped, because the chain can only prove an unseen signature dead against
 * a height. The newest blockhash's deadline stands in: the signed blockhash is
 * older than anything the chain hands out now, so this bound sits at or past
 * the real one, and the poll can call the expiry a minute late but never
 * early.
 *
 * This is the chain's verdict, not a wall-clock timeout — the record only
 * fails once the block height passes a bound the transaction cannot outlive.
 * It is asked at record time, right after broadcast, while the signed
 * blockhash is provably the older of the two; records written earlier are
 * never revisited. A chain that will not answer leaves the record without a
 * deadline, exactly as before, rather than holding up the write.
 */
export const withSolanaDeadline = async (
  record: TransactionRecord
): Promise<TransactionRecord> => {
  if (!needsSolanaDeadline(record)) return record

  const { data } = await attempt(() =>
    withSolanaRpcTimeout(
      getSolanaClient().getLatestBlockhash('confirmed'),
      'getLatestBlockhash'
    )
  )

  return data ? withDeadline(record, data.lastValidBlockHeight) : record
}
