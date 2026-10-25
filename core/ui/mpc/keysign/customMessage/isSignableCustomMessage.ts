import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'

import { isAdr36SignBytes } from './adr36'
import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from './chains'
import { getCustomMessageBytes } from './getCustomMessageBytes'
import { unwrapPersonalSignMessage } from './getPersonalSignMessage'
import { getTypedDataHex } from './getTypedDataHex'

type IsSignableCustomMessageInput = Pick<
  CustomMessagePayload,
  'chain' | 'method' | 'message'
>

// TronWeb signs a message under its own header, or under the Ethereum one
// when a v1 message asks for it.
const tronMessageHeaders = [
  '\x19TRON Signed Message:\n',
  '\x19Ethereum Signed Message:\n',
].map(header => new TextEncoder().encode(header))

const hasTronMessageHeader = (bytes: Uint8Array) =>
  tronMessageHeaders.some(header =>
    header.every((byte, index) => bytes[index] === byte)
  )

/**
 * Whether a custom-message payload may be signed. Where the chain's digest
 * needs it, a payload is signed only in a recognised message format and
 * refused otherwise, rather than decoded; a payload for a chain the pipeline
 * does not support is refused. Mirrors `getCustomMessageHex` branch for
 * branch.
 */
export const isSignableCustomMessage = ({
  chain = customMessageDefaultChain,
  method,
  message,
}: IsSignableCustomMessageInput) => {
  if (!isOneOf(chain, customMessageSupportedChains)) return false

  if (method === 'eth_signTypedData_v4') {
    return (
      getChainKind(chain) === 'evm' &&
      'data' in attempt(() => getTypedDataHex(message))
    )
  }

  // The bytes the keysign hashes, so a check on them holds for what is signed.
  const bytes = getCustomMessageBytes(message)

  return match(getChainKind(chain), {
    // `getCustomMessageBytes` decodes malformed hex behind `0x` loosely, but
    // here such a payload reads as text, which can't open with the envelope
    // prefix. So an accepted envelope is exactly the bytes the keysign hashes.
    evm: () =>
      method === 'personal_sign' &&
      unwrapPersonalSignMessage(message) !== undefined,
    tron: () => hasTronMessageHeader(bytes),
    cosmos: () => isAdr36SignBytes(bytes),
    solana: () => true,
    sui: () => true,
    ton: () => true,
    polkadot: () => true,
    bittensor: () => true,
    cardano: () => true,
    ripple: () => true,
  })
}
