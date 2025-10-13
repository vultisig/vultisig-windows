import { create } from '@bufbuild/protobuf'
import { CosmosSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildCosmosSpecific: BuildChainSpecificResolver<
  'cosmosSpecific'
> = ({ feeQuote, txData }) =>
  create(CosmosSpecificSchema, {
    ...txData,
    ...feeQuote,
  })
