import { create } from '@bufbuild/protobuf'
import { IbcEnabledCosmosChain, VaultBasedCosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { cosmosGasRecord } from '@core/chain/chains/cosmos/gas'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CosmosSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getCosmosChainSpecific: GetChainSpecificResolver<
  'cosmosSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin<IbcEnabledCosmosChain>(keysignPayload)
  const cosmosCoin = coin as AccountCoin<IbcEnabledCosmosChain>
  const { accountNumber, sequence, latestBlock } =
    await getCosmosAccountInfo(cosmosCoin)

  const base = {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    transactionType: TransactionType.UNSPECIFIED,
  }

  const gas = cosmosGasRecord[coin.chain]

  if (isOneOf(coin.chain, Object.values(VaultBasedCosmosChain))) {
    return create(CosmosSpecificSchema, {
      ...base,
      gas,
    })
  }

  return create(CosmosSpecificSchema, {
    ...base,
    ibcDenomTraces: {
      latestBlock: latestBlock,
      baseDenom: '',
      path: '',
    },
    gas,
  })
}
