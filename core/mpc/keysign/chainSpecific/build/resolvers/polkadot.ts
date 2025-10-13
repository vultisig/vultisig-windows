import { create } from '@bufbuild/protobuf'
import { PolkadotSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildPolkadotSpecific: BuildChainSpecificResolver<
  'polkadotSpecific'
> = ({ txData }) => create(PolkadotSpecificSchema, txData)
