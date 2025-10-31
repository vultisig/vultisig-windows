import { ChainKind, ChainOfKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { getKeysignCoin } from './getKeysignCoin'

export const getKeysignChain = <T extends ChainKind = ChainKind>(
  input: KeysignPayload
) => getKeysignCoin<ChainOfKind<T>>(input).chain
