import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'

import { estimateEvmGas } from './estimateEvmGas'

type GetGasEstimationQueryInput = {
  keysignPayload: KeysignPayload
}

export const getGasEstimationQuery = ({
  keysignPayload,
}: GetGasEstimationQueryInput) => ({
  queryKey: ['evmGasEstimation', keysignPayload],
  queryFn: async () => estimateEvmGas({ keysignPayload }),
  ...noRefetchQueryOptions,
})
