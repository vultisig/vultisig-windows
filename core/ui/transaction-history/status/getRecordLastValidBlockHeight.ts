import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'

import { TransactionRecord } from '../core'

/**
 * The Solana blockhash deadline a record was broadcast under, for the status
 * poll. Only sends and swaps can be Solana transactions; limit orders and
 * trust lines never carry one.
 */
export const getRecordLastValidBlockHeight = (
  record: TransactionRecord
): number | undefined =>
  matchDiscriminatedUnion(record, 'type', 'data', {
    send: ({ lastValidBlockHeight }) => lastValidBlockHeight,
    swap: ({ lastValidBlockHeight }) => lastValidBlockHeight,
    limitSwap: () => undefined,
    trustLine: () => undefined,
  })
