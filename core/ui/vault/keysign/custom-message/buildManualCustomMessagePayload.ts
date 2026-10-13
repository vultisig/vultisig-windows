import { create } from '@bufbuild/protobuf'
import { getPersonalSignMessage } from '@core/ui/mpc/keysign/customMessage/getPersonalSignMessage'
import {
  CustomMessagePayload,
  CustomMessagePayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'

type BuildManualCustomMessagePayloadInput = {
  method: string
  message: string
  vaultPublicKeyEcdsa: string
}

/**
 * Custom-message keysign payload for a message the user typed in. A
 * `personal_sign` message is wrapped in its EIP-191 envelope here, as the dApp
 * popup does, because co-signers sign the payload message's hash as-is.
 */
export const buildManualCustomMessagePayload = ({
  method,
  message,
  vaultPublicKeyEcdsa,
}: BuildManualCustomMessagePayloadInput): CustomMessagePayload => {
  const signingMethod = method.trim()

  return create(CustomMessagePayloadSchema, {
    method: signingMethod,
    message:
      signingMethod === 'personal_sign'
        ? getPersonalSignMessage(message)
        : message,
    vaultPublicKeyEcdsa,
  })
}
