import { create } from '@bufbuild/protobuf'
import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'
import {
  TronSpecific,
  TronSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from '../resolver'

export const getTronSpecific: ChainSpecificResolver<TronSpecific> = async ({
  coin,
  feeQuote,
}) => {
  const blockInfo = await getTronBlockInfo(coin)

  const gasEstimation = feeQuote?.gasLimit
    ? parseInt(feeQuote.gasLimit.toString())
    : blockInfo.gasFeeEstimation

  return create(TronSpecificSchema, {
    timestamp: BigInt(blockInfo.timestamp),
    expiration: BigInt(blockInfo.expiration),
    blockHeaderTimestamp: BigInt(blockInfo.blockHeaderTimestamp),
    blockHeaderNumber: BigInt(blockInfo.blockHeaderNumber),
    blockHeaderVersion: BigInt(blockInfo.blockHeaderVersion),
    blockHeaderTxTrieRoot: blockInfo.blockHeaderTxTrieRoot,
    blockHeaderParentHash: blockInfo.blockHeaderParentHash,
    blockHeaderWitnessAddress: blockInfo.blockHeaderWitnessAddress,
    gasEstimation: BigInt(gasEstimation),
  })
}
