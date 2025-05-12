import { CustomMessagePayload } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import {
  KeysignMessage,
  KeysignPayload,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

type KeysignMessagePayloadType = 'custom' | 'keysign'

interface KeysignMessagePayloadMap {
  custom: CustomMessagePayload
  keysign: KeysignPayload
}

export type KeysignMessagePayload = {
  [T in KeysignMessagePayloadType]: { [K in T]: KeysignMessagePayloadMap[T] }
}[KeysignMessagePayloadType]

export const getKeysignMessagePayload = ({
  keysignPayload,
  customMessagePayload,
}: KeysignMessage): KeysignMessagePayload => {
  if (keysignPayload) {
    return { keysign: keysignPayload }
  }

  if (customMessagePayload) {
    return { custom: customMessagePayload }
  }

  throw new Error('No keysign message payload found')
}

export const isKeysignPayload = (
  payload: KeysignMessagePayload
): payload is { keysign: KeysignPayload } => {
  return 'keysign' in payload
}
