import { VersionedMessage } from '@solana/web3.js'
import { attempt } from '@vultisig/lib-utils/attempt'

/**
 * Whether the bytes deserialize as a Solana transaction message, legacy or
 * v0. Solana signs messages and transactions with the same key and no
 * prefix, so a message signature over these bytes would authorize the
 * transaction. Trailing bytes are tolerated on purpose: the check errs
 * towards refusing.
 */
export const isSolanaTransactionMessage = (bytes: Uint8Array): boolean =>
  'data' in attempt(() => VersionedMessage.deserialize(bytes))
