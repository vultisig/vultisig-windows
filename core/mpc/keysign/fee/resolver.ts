import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Resolver } from '@lib/utils/types/Resolver'

export type GetFeeAmountResolver = Resolver<KeysignPayload, bigint>
