import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

const bpsPerUnit = 10_000

/**
 * Fractional price impact a built `KeysignPayload` carries (`0.0019` == 0.19%
 * of output lost), in the same units {@link getSwapPriceImpact} produces from a
 * quote, or `undefined` when the payload does not state one.
 *
 * This is the only source available to a co-signer, which holds no quote. The
 * figure is deliberately not re-derived from the payload's amounts or a fresh
 * provider call: pools move between initiating and joining, so a second quote
 * disagrees with the one the initiator approved.
 *
 * General swaps carry no impact field yet, so they always report nothing.
 */
export const getSwapPriceImpactFromPayload = (
  payload: KeysignPayload
): number | undefined => {
  const swapPayload = getKeysignSwapPayload(payload)
  if (!swapPayload) return undefined

  return matchRecordUnion<KeysignSwapPayload, number | undefined>(swapPayload, {
    native: ({ slippageBps }) =>
      slippageBps === undefined ? undefined : slippageBps / bpsPerUnit,
    general: () => undefined,
  })
}
