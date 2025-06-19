import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const getKeysignTwPublicKey = ({ coin }: KeysignPayload) => {
  const { hexPublicKey } = shouldBePresent(coin)

  return new Uint8Array(Buffer.from(hexPublicKey, 'hex'))
}
