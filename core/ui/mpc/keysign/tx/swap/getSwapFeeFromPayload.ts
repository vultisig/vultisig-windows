import { Chain } from '@vultisig/core-chain/Chain'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import {
  getKeysignSwapFeeFields,
  KeysignSwapFeeFields,
} from '@vultisig/core-mpc/keysign/swap/getKeysignSwapFeeFields'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

const chainRegistry = new Set<string>(Object.values(Chain))

const isKnownChain = (value: string): value is Chain => chainRegistry.has(value)

const toSwapFee = ({
  swapFee,
  swapFeeChain,
  swapFeeTokenId,
  swapFeeDecimals,
}: KeysignSwapFeeFields): SwapFee | undefined => {
  if (!swapFee || swapFee === '0') return undefined
  if (!swapFeeChain || swapFeeDecimals == null) return undefined
  // `swap_fee_chain` is a protobuf string. Validate it against the known
  // `Chain` set at this single routing boundary so unknown senders don't
  // produce a broken `SwapFee` downstream.
  if (!isKnownChain(swapFeeChain)) return undefined

  return {
    chain: swapFeeChain,
    // Keep `id` absent when the sender didn't populate it — native fee coins
    // (e.g. ETH on Ethereum) have no token id. Coercing to '' here changes
    // `coinKeyToString` from `"Ethereum"` to `"Ethereum:"` and breaks the
    // vault-coin lookup, zeroing out the fiat value.
    ...(swapFeeTokenId ? { id: swapFeeTokenId } : {}),
    amount: BigInt(swapFee),
    decimals: swapFeeDecimals,
  }
}

/**
 * Extracts the swap-fee `SwapFee` from a built `KeysignPayload`.
 *
 * General swaps (1inch / LI.FI / SwapKit / KyberSwap) need the whole
 * `swap_fee` group, wherever the payload shape keeps it, because the fee coin
 * has to be reconstructed — KyberSwap charges in the destination token while
 * the other providers charge in the source fee coin, so the amount alone is
 * ambiguous. Payloads from senders that pre-date the group leave
 * `swap_fee_chain` empty; this returns `undefined` for them rather than
 * guessing a coin and pricing the amount as something it is not.
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
      general: generalPayload =>
        toSwapFee(getKeysignSwapFeeFields(generalPayload)),
    }
  )
}
