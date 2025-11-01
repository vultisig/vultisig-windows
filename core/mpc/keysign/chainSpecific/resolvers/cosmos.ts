import { create } from '@bufbuild/protobuf'
import { IbcEnabledCosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { cosmosGasRecord } from '@core/chain/chains/cosmos/gas'
import {
  CosmosSpecificSchema,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getCosmosChainSpecific: GetChainSpecificResolver<
  'cosmosSpecific'
> = async ({
  keysignPayload,
  transactionType = TransactionType.UNSPECIFIED,
  timeoutTimestamp,
}) => {
  const coin = getKeysignCoin<IbcEnabledCosmosChain>(keysignPayload)
  const { accountNumber, sequence, latestBlock } =
    await getCosmosAccountInfo(coin)

  return create(CosmosSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    transactionType,
    gas: cosmosGasRecord[coin.chain],
    ibcDenomTraces: {
      latestBlock: timeoutTimestamp
        ? `${latestBlock.split('_')[0]}_${timeoutTimestamp}`
        : latestBlock,
      baseDenom: '',
      path: '',
    },
  })
}
