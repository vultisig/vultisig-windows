import { EvmChain } from '@vultisig/core-chain/Chain'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { customMessageDefaultChain } from './chains'
import { getCustomMessageBytes } from './getCustomMessageBytes'
import { EvmTxPreimage, parseEvmTxPreimage } from './parseEvmTxPreimage'

type GetCustomMessageEvmTxInput = Pick<
  CustomMessagePayload,
  'method' | 'message' | 'chain'
>

/**
 * The EVM transaction that signing a custom-message payload would authorize,
 * or `null` when it authorizes none. EVM signers hash the message bytes with
 * keccak256 alone, so bytes that are a transaction's signing preimage yield a
 * valid signature for that transaction (security review H4).
 */
export const getCustomMessageEvmTx = ({
  method,
  message,
  chain = customMessageDefaultChain,
}: GetCustomMessageEvmTxInput): EvmTxPreimage | null => {
  if (method === 'eth_signTypedData_v4') return null

  if (!isOneOf(chain, Object.values(EvmChain))) return null

  return parseEvmTxPreimage(getCustomMessageBytes(message))
}
