import { create } from '@bufbuild/protobuf'
import { THORChainSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildThorchainSpecific: BuildChainSpecificResolver<
  'thorchainSpecific'
> = ({ feeQuote, txData }) =>
  create(THORChainSpecificSchema, {
    ...txData,
    fee: feeQuote.gas,
  })
