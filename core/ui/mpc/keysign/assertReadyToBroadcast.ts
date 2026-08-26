import { Chain } from '@vultisig/core-chain/Chain'
import { Tx } from '@vultisig/core-chain/tx'
import { assertNativeSwapReadyForBroadcast } from '@vultisig/core-mpc/keysign/swap/assertNativeSwapReadyForBroadcast'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'

import { BroadcastError } from './broadcastKeysignTx'

type AssertReadyToBroadcastInput = {
  chain: Chain
  keysignPayload: KeysignPayload
  txs: Tx[]
}

/**
 * This device declining to broadcast a transaction that is already fully
 * signed and compiled. Unlike an RPC rejection, a refusal says nothing about
 * the transaction's fate: every signing device broadcasts independently, so a
 * co-signer whose own check passed moments earlier may already have put the
 * exact same bytes on-chain. The compiled txs (hashes included) ride along so
 * the UI can keep the hash visible and present an unconfirmed state instead
 * of a terminal failure.
 */
export class BroadcastRefusedError extends BroadcastError {
  readonly txs: Tx[]

  constructor(cause: unknown, txs: Tx[]) {
    super(cause)
    this.name = 'BroadcastRefusedError'
    this.txs = txs
  }
}

/**
 * Last check before a signed transaction goes out: a native swap must not land
 * in an inbound vault that has churned, a chain that has halted, or past its
 * quote expiry. A no-op for every other payload.
 *
 * This runs on every signing device, co-signers included, because every one of
 * them broadcasts — a device that would broadcast into a halted chain has to
 * refuse for the same reason the initiator does. A device that refuses while
 * another succeeds is the intended asymmetry: the transaction is already signed,
 * and one refusal costs nothing beyond a duplicate broadcast that the other
 * device already handles.
 *
 * Because of that asymmetry a refusal must never look like a terminal failure:
 * the signed txs are attached to the {@link BroadcastRefusedError} so the UI
 * can surface each hash and track the real on-chain outcome.
 */
export const assertReadyToBroadcast = async ({
  chain,
  keysignPayload,
  txs,
}: AssertReadyToBroadcastInput): Promise<void> => {
  const result = await attempt(() =>
    assertNativeSwapReadyForBroadcast({ chain, keysignPayload })
  )

  if ('error' in result) {
    throw new BroadcastRefusedError(result.error, txs)
  }
}
