import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { fromCommCoin } from '../../types/utils/commCoin'

export const getKeysignCoin = ({ coin }: KeysignPayload) =>
  fromCommCoin(shouldBePresent(coin))
