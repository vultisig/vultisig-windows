import { Chain } from '@vultisig/core-chain/Chain'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { hexlify } from 'ethers'

import { unwrapBitcoinSignedMessage } from './bitcoin'
import { getCustomMessageBytes } from './getCustomMessageBytes'
import { unwrapPersonalSignMessage } from './getPersonalSignMessage'

type GetCustomMessageDisplayMessageInput = Pick<
  CustomMessagePayload,
  'chain' | 'method' | 'message'
>

const getBitcoinDisplayMessage = (message: string) => {
  const msgBytes = unwrapBitcoinSignedMessage(getCustomMessageBytes(message))
  if (!msgBytes) return undefined

  const text = attempt(() =>
    new TextDecoder('utf-8', { fatal: true }).decode(msgBytes)
  )

  return 'data' in text ? text.data : hexlify(msgBytes)
}

/**
 * The message to show for a custom-message payload. `personal_sign` and
 * Bitcoin payloads carry their signed-message envelope (see
 * `getPersonalSignMessage` and `getBitcoinSignedMessage`), so screens that
 * only have the payload show the message inside it, the one the user signed.
 */
export const getCustomMessageDisplayMessage = ({
  chain,
  method,
  message,
}: GetCustomMessageDisplayMessageInput) => {
  if (chain === Chain.Bitcoin) {
    return getBitcoinDisplayMessage(message) ?? message
  }

  if (method !== 'personal_sign') return message

  return unwrapPersonalSignMessage(message) ?? message
}
