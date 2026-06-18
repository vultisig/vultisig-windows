import { decodeCowSwapKeysignData } from '@vultisig/core-chain/swap/general/cowswap/keysign/cowSwapKeysignData'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/**
 * THORChain/MayaChain swap memos encode the payout destination as the third
 * colon-separated segment: `SWAP:ASSET:DESTINATION:...`.
 */
const getNativeSwapMemoDestination = (memo: string | undefined) => {
  const destination = memo?.split(':')[2]?.trim()
  return destination || undefined
}

/**
 * Resolves the address the swap output will actually be paid to, read from the
 * built keysign payload (the bytes that will be signed) rather than live form
 * state. Returns `undefined` for swaps with no explicit recipient — e.g.
 * EVM/Solana aggregator routes that always pay the initiator's own address.
 */
export const getSwapRecipientAddress = (
  keysignPayload: KeysignPayload
): string | undefined => {
  const swapPayload = getKeysignSwapPayload(keysignPayload)
  if (!swapPayload) {
    return undefined
  }

  return matchRecordUnion(swapPayload, {
    native: () => getNativeSwapMemoDestination(keysignPayload.memo),
    general: ({ quote }) => {
      const data = quote?.tx?.data
      if (!data) {
        return undefined
      }

      return decodeCowSwapKeysignData(data)?.order.receiver
    },
  })
}
