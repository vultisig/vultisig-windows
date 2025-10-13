import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'

import { KeysignTxDataResolver } from '../resolver'

export const getTronTxData: KeysignTxDataResolver<'tron'> = async ({
  coin,
}) => {
  const blockInfo = await getTronBlockInfo(coin)

  return {
    timestamp: BigInt(blockInfo.timestamp),
    expiration: BigInt(blockInfo.expiration),
    blockHeaderTimestamp: BigInt(blockInfo.blockHeaderTimestamp),
    blockHeaderNumber: BigInt(blockInfo.blockHeaderNumber),
    blockHeaderVersion: BigInt(blockInfo.blockHeaderVersion),
    blockHeaderTxTrieRoot: blockInfo.blockHeaderTxTrieRoot,
    blockHeaderParentHash: blockInfo.blockHeaderParentHash,
    blockHeaderWitnessAddress: blockInfo.blockHeaderWitnessAddress,
  }
}
