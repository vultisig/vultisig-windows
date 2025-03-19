import { create } from '@bufbuild/protobuf'
import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'
import { isNativeCoin } from '@core/chain/coin/utils/isNativeCoin'
import {
  TronSpecific,
  TronSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb' // Import the Coin schema

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getTronSpecific: ChainSpecificResolver<TronSpecific> = async ({
  coin,
}) => {
  const isNative = isNativeCoin(coin)

  const coinObject = create(CoinSchema, {
    address: coin.address,
    chain: coin.chain,
    contractAddress: coin.id,
    decimals: coin.decimals,
    hexPublicKey: '',
    isNativeToken: isNative ?? false,
    ticker: coin.ticker,
    logo: coin.logo,
    priceProviderId: coin.priceProviderId ?? '',
  })

  const blockInfo = await getTronBlockInfo(coinObject)

  return create(TronSpecificSchema, {
    timestamp: BigInt(blockInfo.timestamp),
    expiration: BigInt(blockInfo.expiration),
    blockHeaderTimestamp: BigInt(blockInfo.blockHeaderTimestamp),
    blockHeaderNumber: BigInt(blockInfo.blockHeaderNumber),
    blockHeaderVersion: BigInt(blockInfo.blockHeaderVersion),
    blockHeaderTxTrieRoot: blockInfo.blockHeaderTxTrieRoot,
    blockHeaderParentHash: blockInfo.blockHeaderParentHash,
    blockHeaderWitnessAddress: blockInfo.blockHeaderWitnessAddress,
    gasEstimation: BigInt(blockInfo.gasFeeEstimation),
  })
}
