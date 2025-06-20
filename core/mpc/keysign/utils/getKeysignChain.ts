import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { getKeysignCoin } from './getKeysignCoin'

export const getKeysignChain = (input: KeysignPayload) =>
  getKeysignCoin(input).chain
