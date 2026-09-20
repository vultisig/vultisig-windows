import { NativeSwapChain } from '@vultisig/core-chain/swap/native/NativeSwapChain'
import { SwapArrivalProvider } from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/**
 * The providers whose own status API this app asks whether a swap paid out
 * or refunded. Listed rather than declared as a union so a value read back
 * from a stored record can be checked against it.
 */
export const trackedSwapArrivalProviders = [
  'thorchain',
  'mayachain',
] as const satisfies readonly SwapArrivalProvider[]

/** A provider this app tracks a swap's arrival with. */
export type TrackedSwapArrivalProvider =
  (typeof trackedSwapArrivalProviders)[number]

const nativeSwapArrivalProvider: Record<
  NativeSwapChain,
  TrackedSwapArrivalProvider
> = {
  THORChain: 'thorchain',
  MayaChain: 'mayachain',
}

/**
 * The provider whose own status API can say whether this swap paid out or
 * refunded, or `undefined` when the source-chain receipt is the whole story.
 *
 * Only native swaps are tracked. Their source transaction is a deposit to the
 * protocol: it confirms long before the swap resolves, and a refund arrives as
 * a separate outbound the source chain never links back to it. Aggregator
 * swaps settle inside the source transaction, so its receipt already carries
 * the verdict. LI.FI cross-chain routes could be tracked the same way but are
 * left out until their status API is validated against same-chain routes,
 * which it also handles.
 */
export const getKeysignSwapArrivalProvider = (
  swapPayload: KeysignSwapPayload
): TrackedSwapArrivalProvider | undefined =>
  matchRecordUnion(swapPayload, {
    native: ({ chain }) => nativeSwapArrivalProvider[chain],
    general: () => undefined,
  })
