import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { CosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { getThorNetworkInfo } from '@core/chain/chains/cosmos/thor/getThorNetworkInfo'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { THORChainSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getThorchainChainSpecific: GetChainSpecificResolver<
  'thorchainSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin<Chain>(keysignPayload)
  const cosmosCoin = coin as AccountCoin<CosmosChain>
  const { accountNumber, sequence } = await getCosmosAccountInfo(cosmosCoin)
  const { native_tx_fee_rune } = await getThorNetworkInfo()

  return create(THORChainSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    transactionType: TransactionType.UNSPECIFIED,
    fee: BigInt(native_tx_fee_rune),
  })
}
