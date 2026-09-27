import { Chain } from '@vultisig/core-chain/Chain'

import { TransactionRecord } from '../core'

/**
 * The chain a record's `txHash` was broadcast on, and so the one to ask about
 * its status. A swap's `chain` is where it is tracked — THORChain or MayaChain
 * for a native swap — while its hash belongs to the chain the funds left from.
 */
export const getRecordTxChain = (record: TransactionRecord): Chain =>
  record.type === 'swap' ? record.data.fromChain : record.chain
