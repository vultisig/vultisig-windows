import { create } from '@bufbuild/protobuf'
import { SolanaSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildSolanaSpecific: BuildChainSpecificResolver<
  'solanaSpecific'
> = ({ feeQuote, txData }) =>
  create(SolanaSpecificSchema, {
    ...txData,
    priorityFee: feeQuote.priorityFee.toString(),
  })
