import { match } from '@vultisig/lib-utils/match'

import { TransactionRecordType } from './core'
import { TransactionHistoryTagType } from './TransactionHistoryTag'

/**
 * The tag a record is shown under. Several record types share a tag — a limit
 * order is still a swap, and a trust-line activation is an approval rather than
 * a transfer, because it authorises an issuer to be held rather than moving
 * anything.
 *
 * Exhaustive on purpose: a new record type has to state its tag here instead of
 * defaulting to "send", which is how a TrustSet came to be shown as an enormous
 * outgoing payment.
 */
export const getRecordTagType = (
  type: TransactionRecordType
): TransactionHistoryTagType =>
  match(type, {
    send: () => 'send',
    swap: () => 'swap',
    limitSwap: () => 'swap',
    trustLine: () => 'approve',
  })
