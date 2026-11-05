import {
  BroadcastErrorCode,
  BroadcastTxResult,
} from '@vultisig/core-chain/tx/broadcast'

import { BroadcastError } from './broadcastKeysignTx'

/**
 * Throws a {@link BroadcastError} carrying the chain's reason when a broadcast
 * was definitively refused. Meant for callers that hand the tx hash to someone
 * else — a dApp or the agent — who then tracks inclusion by it.
 *
 * A transport failure does not throw: the transaction may have landed even
 * though neither the broadcast nor the hash lookup could confirm it, and
 * failing would invite a resend that sends the funds twice. Returning the hash
 * lets inclusion tracking settle the outcome.
 */
export const throwIfBroadcastRejected = (result: BroadcastTxResult): void => {
  if (
    result.status === 'failed' &&
    result.code === BroadcastErrorCode.Rejected
  ) {
    throw new BroadcastError(result.cause)
  }
}
