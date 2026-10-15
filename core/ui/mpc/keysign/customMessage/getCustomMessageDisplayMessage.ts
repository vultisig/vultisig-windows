import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'

import { unwrapPersonalSignMessage } from './getPersonalSignMessage'

type GetCustomMessageDisplayMessageInput = Pick<
  CustomMessagePayload,
  'method' | 'message'
>

/**
 * The message to show for a custom-message payload. A `personal_sign` payload
 * carries its EIP-191 envelope (see `getPersonalSignMessage`), so screens that
 * only have the payload show the message inside it, the one the user signed.
 */
export const getCustomMessageDisplayMessage = ({
  method,
  message,
}: GetCustomMessageDisplayMessageInput) => {
  if (method !== 'personal_sign') return message

  return unwrapPersonalSignMessage(message) ?? message
}
