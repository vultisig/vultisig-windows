import { Chain } from '@vultisig/core-chain/Chain'
import { assertNativeSwapReadyForBroadcast } from '@vultisig/core-mpc/keysign/swap/assertNativeSwapReadyForBroadcast'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'

import { BroadcastError } from './broadcastKeysignTx'

type AssertReadyToBroadcastInput = {
  chain: Chain
  keysignPayload: KeysignPayload
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
 * Reported as a {@link BroadcastError} because signing has already completed by
 * the time this runs: the failure belongs to the broadcast stage, and the
 * device/timeout copy the generic branch shows would be actively misleading.
 */
export const assertReadyToBroadcast = async ({
  chain,
  keysignPayload,
}: AssertReadyToBroadcastInput): Promise<void> => {
  const result = await attempt(() =>
    assertNativeSwapReadyForBroadcast({ chain, keysignPayload })
  )

  if ('error' in result) {
    throw new BroadcastError(result.error)
  }
}
