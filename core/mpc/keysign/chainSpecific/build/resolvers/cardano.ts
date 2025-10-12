import { create } from '@bufbuild/protobuf'

import { CardanoChainSpecificSchema } from '../../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { BuildChainSpecificResolver } from '../resolver'

export const buildCardanoSpecific: BuildChainSpecificResolver<'cardano'> = ({
  feeQuote,
  txData,
}) =>
  create(CardanoChainSpecificSchema, {
    ...txData,
    ...feeQuote,
  })
