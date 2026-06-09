import { fromBase64 } from '@cosmjs/encoding'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

/**
 * Extracts the typeUrl of the first message in a Cosmos `signDirect` payload.
 *
 * Both QBTC dApp `sign_and_broadcast` txs and in-wallet Cosmos staking txs sign
 * over a proto `TxBody` carried in `signData.signDirect.bodyBytes`, so decoding
 * that body recovers the message typeUrl(s) for transaction-history labeling.
 * Multi-message txs are labeled by their primary (first) message.
 *
 * Returns undefined when the payload isn't `signDirect`, fails to decode, or
 * carries no messages — the caller then falls back to the default "Send" label.
 */
export const getPrimaryCosmosMessageTypeUrl = (
  payload: KeysignPayload
): string | undefined => {
  const { signData } = payload
  if (signData.case !== 'signDirect') return undefined

  const decoded = attempt(() =>
    TxBody.decode(fromBase64(signData.value.bodyBytes))
  )
  if ('error' in decoded) return undefined

  return decoded.data.messages[0]?.typeUrl || undefined
}
