import { create } from '@bufbuild/protobuf'
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
 * Custom-message keysign payload for a message the user typed in. No dApp
 * asked for it, so `dappMetadata` stays unset and co-signers show no
 * "request from" banner.
 */
export const buildManualCustomMessagePayload = ({
  method,
  message,
  vaultPublicKeyEcdsa,
}: BuildManualCustomMessagePayloadInput): CustomMessagePayload =>
  create(CustomMessagePayloadSchema, {
    method,
    message,
    vaultPublicKeyEcdsa,
  })
