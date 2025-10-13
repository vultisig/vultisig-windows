import { create } from '@bufbuild/protobuf'
import { TonSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildTonSpecific: BuildChainSpecificResolver<'tonSpecific'> = ({
  txData,
}) => create(TonSpecificSchema, txData)
