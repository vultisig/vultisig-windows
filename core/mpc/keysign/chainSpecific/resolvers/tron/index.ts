import { create } from '@bufbuild/protobuf'
import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { TronSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignAmount } from '../../../utils/getKeysignAmount'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../../resolver'
import { getTrc20TransferFee } from './fee'

const nativeTronSendFee = 800000n

export const getTronChainSpecific: GetChainSpecificResolver<
  'tronSpecific'
> = async ({
  keysignPayload,
  thirdPartyGasLimitEstimation,
  expiration,
  timestamp,
  refBlockBytesHex,
  refBlockHashHex,
}) => {
  const coin = getKeysignCoin(keysignPayload)

  const blockInfo = await getTronBlockInfo({
    expiration,
    timestamp,
    refBlockBytesHex,
    refBlockHashHex,
  })

  const getGasEstimation = async () => {
    if (thirdPartyGasLimitEstimation) {
      return thirdPartyGasLimitEstimation
    }
    if (isFeeCoin(coin)) {
      return nativeTronSendFee
    }

    return getTrc20TransferFee({
      coin,
      receiver: keysignPayload.toAddress,
      amount: getKeysignAmount(keysignPayload),
    })
  }

  return create(TronSpecificSchema, {
    timestamp: BigInt(blockInfo.timestamp),
    expiration: BigInt(blockInfo.expiration),
    blockHeaderTimestamp: BigInt(blockInfo.blockHeaderTimestamp),
    blockHeaderNumber: BigInt(blockInfo.blockHeaderNumber),
    blockHeaderVersion: BigInt(blockInfo.blockHeaderVersion),
    blockHeaderTxTrieRoot: blockInfo.blockHeaderTxTrieRoot,
    blockHeaderParentHash: blockInfo.blockHeaderParentHash,
    blockHeaderWitnessAddress: blockInfo.blockHeaderWitnessAddress,
    gasEstimation: await getGasEstimation(),
  })
}
