import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { CosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { MAYAChainSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getMayaChainSpecific: GetChainSpecificResolver<
  'mayaSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin<Chain>(keysignPayload)
  const cosmosCoin = coin as AccountCoin<CosmosChain>
  const { accountNumber, sequence } = await getCosmosAccountInfo(cosmosCoin)

  return create(MAYAChainSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    isDeposit: false,
  })
}
