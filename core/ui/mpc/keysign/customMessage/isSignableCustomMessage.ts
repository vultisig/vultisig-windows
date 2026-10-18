import { EvmChain } from '@vultisig/core-chain/Chain'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from './chains'
import { unwrapPersonalSignMessage } from './getPersonalSignMessage'

type IsSignableCustomMessageInput = Pick<
  CustomMessagePayload,
  'chain' | 'method' | 'message'
>

/**
 * Whether a custom-message payload may be signed. An EVM payload is signed
 * only in a recognised message format and refused otherwise, rather than
 * decoded, and a payload for a chain the pipeline does not support is
 * refused. The other chains are not checked here.
 */
export const isSignableCustomMessage = ({
  chain = customMessageDefaultChain,
  method,
  message,
}: IsSignableCustomMessageInput) => {
  if (!isOneOf(chain, customMessageSupportedChains)) return false

  if (method === 'eth_signTypedData_v4') return true

  if (!isOneOf(chain, Object.values(EvmChain))) return true

  // `getCustomMessageBytes` decodes malformed hex behind `0x` loosely, but
  // here such a payload reads as text, which can't open with the envelope
  // prefix. So an accepted envelope is exactly the bytes the keysign hashes.
  return (
    method === 'personal_sign' &&
    unwrapPersonalSignMessage(message) !== undefined
  )
}
