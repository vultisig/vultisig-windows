import { create } from '@bufbuild/protobuf'
import { RippleSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildRippleSpecific: BuildChainSpecificResolver<
  'rippleSpecific'
> = ({ feeQuote, txData }) =>
  create(RippleSpecificSchema, {
    ...txData,
    ...feeQuote,
  })
