import { Chain } from '@vultisig/core-chain/Chain'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/**
 * Extracts the swap-fee `SwapFee` from a built `KeysignPayload`.
 *
 * General swaps (1inch / LI.FI / SwapKit / KyberSwap) require all four
 * `swap_fee*` fields populated on `OneInchTransaction` so the destination
 * coin can be reconstructed — KyberSwap charges in the destination token
 * while the other providers charge in the source fee coin, so amount alone
 * is ambiguous. Payloads from senders that pre-date that proto extension
 * leave `swap_fee_chain` empty; this function returns `undefined` for them
 * rather than guessing.
 *
 * Native swaps (THORChain / MAYAChain) carry the fee in the destination
 * coin implicitly; only `fee` (amount) is needed.
 */
export const getSwapFeeFromPayload = (
  payload: KeysignPayload
): SwapFee | undefined => {
  const swapPayload = getKeysignSwapPayload(payload)
  if (!swapPayload) return undefined

  return matchRecordUnion<KeysignSwapPayload, SwapFee | undefined>(
    swapPayload,
    {
      native: ({ fee, toCoin }) => {
        if (!fee || fee === '0' || !toCoin) return undefined
        const dst = fromCommCoin(toCoin)
        const dstKey = { chain: dst.chain, id: dst.id }
        return {
          ...dstKey,
          amount: BigInt(fee),
          decimals: getNativeSwapDecimals(dstKey),
        }
      },
      general: ({ quote }) => {
        const tx = quote?.tx
        if (!tx || !tx.swapFee || tx.swapFee === '0') return undefined
        if (!tx.swapFeeChain || tx.swapFeeDecimals == null) return undefined
        return {
          // `swap_fee_chain` is a protobuf string; treat this resolver as the
          // single routing boundary where we cast back to the `Chain` union.
          chain: tx.swapFeeChain as Chain,
          id: tx.swapFeeTokenId ?? '',
          amount: BigInt(tx.swapFee),
          decimals: tx.swapFeeDecimals,
        }
      },
    }
  )
}
