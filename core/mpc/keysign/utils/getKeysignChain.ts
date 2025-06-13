import { Chain } from '@core/chain/Chain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const getKeysignChain = ({ coin }: KeysignPayload) =>
  shouldBePresent(coin).chain as Chain
