import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

const bpsPerUnit = 10_000

type NativeSwapPayload = Extract<
  KeysignSwapPayload,
  { native: unknown }
>['native']

// `slippage_bps` was added to the .proto in vultisig/commondata#104 and is
// populated by vultisig-sdk#2330. It will appear on the generated
// `THORChainSwapPayload` type once the SDK publishes a version bundling those
// regenerated files. Intersecting it in here keeps this compiling against the
// currently-published @vultisig/core-mpc without an `as` cast: a payload that
// predates the field is still assignable, and simply reads `undefined`.
type NativeSwapPayloadWithSlippage = NativeSwapPayload & {
  slippageBps?: number
}

const readNativeSlippageBps = ({
  slippageBps,
}: NativeSwapPayloadWithSlippage) => slippageBps

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
    native: native => {
      const slippageBps = readNativeSlippageBps(native)
      return slippageBps === undefined ? undefined : slippageBps / bpsPerUnit
    },
    general: () => undefined,
  })
}
