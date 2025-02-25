import { create } from '@bufbuild/protobuf'
import {
  TronSpecific,
  TronSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getTronSpecific: ChainSpecificResolver<TronSpecific> = async ({
  coin,
}) => {

  return create(TronSpecificSchema, {
    timestamp: 0,
    expiration: 0,
    blockHeaderTimestamp: 0,
    blockHeaderNumber: 0,
    blockHeaderVersion: 0,
    blockHeaderTxTrieRoot: 0,
    blockHeaderParentHash: 0,
    blockHeaderWitnessAddress: 0,
    gasEstimation: 0,
  })
}
