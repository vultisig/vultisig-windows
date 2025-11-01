import { create } from '@bufbuild/protobuf'
import { OtherChain } from '@core/chain/Chain'
import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'
import { TronSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getTronChainSpecific: GetChainSpecificResolver<
  'tronSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin<OtherChain.Tron>(keysignPayload)

  const blockInfo = await getTronBlockInfo({ coin })

  const gasEstimation = BigInt(blockInfo.gasFeeEstimation)

  return create(TronSpecificSchema, {
    timestamp: BigInt(blockInfo.timestamp),
    expiration: BigInt(blockInfo.expiration),
    blockHeaderTimestamp: BigInt(blockInfo.blockHeaderTimestamp),
    blockHeaderNumber: BigInt(blockInfo.blockHeaderNumber),
    blockHeaderVersion: BigInt(blockInfo.blockHeaderVersion),
    blockHeaderTxTrieRoot: blockInfo.blockHeaderTxTrieRoot,
    blockHeaderParentHash: blockInfo.blockHeaderParentHash,
    blockHeaderWitnessAddress: blockInfo.blockHeaderWitnessAddress,
    gasEstimation,
  })
}
