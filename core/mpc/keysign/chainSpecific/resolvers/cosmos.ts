import { create } from '@bufbuild/protobuf'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { cosmosGasRecord } from '@core/chain/chains/cosmos/gas'
import {
  CosmosSpecific,
  CosmosSpecificSchema,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from '../resolver'

export const getCosmosSpecific: ChainSpecificResolver<CosmosSpecific> = async ({
  coin,
  transactionType = TransactionType.UNSPECIFIED,
  timeoutTimestamp,
}) => {
  const { chain } = coin
  const { accountNumber, sequence, latestBlock } = await getCosmosAccountInfo({
    address: coin.address,
    chain,
  })

  const gas = cosmosGasRecord[chain]

  return create(CosmosSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    gas,
    transactionType,
    ibcDenomTraces: {
      latestBlock: timeoutTimestamp
        ? `${latestBlock.split('_')[0]}_${timeoutTimestamp}`
        : latestBlock,
      baseDenom: '',
      path: '',
    },
  })
}
