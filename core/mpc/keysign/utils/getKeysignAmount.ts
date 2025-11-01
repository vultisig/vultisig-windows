import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'

export const getKeysignAmount = ({ toAmount }: KeysignPayload) =>
  BigInt(toAmount)
