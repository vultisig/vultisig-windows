import { create } from '@bufbuild/protobuf'
import { TronSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildTronSpecific: BuildChainSpecificResolver<'tronSpecific'> = ({
  feeQuote,
  txData,
}) =>
  create(TronSpecificSchema, {
    ...txData,
    gasEstimation: feeQuote.gas,
  })
