import { CosmosChain } from '@core/chain/Chain'
import { ChainEntity } from '@core/chain/ChainEntity'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getDenom } from '@core/chain/coin/utils/getDenom'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'

import { KeysignPayload } from '../../../types/vultisig/keysign/v1/keysign_message_pb'
import { getKeysignCoin } from '../../utils/getKeysignCoin'

export const getCosmosCoinAmount = (input: KeysignPayload) => {
  const coin = getKeysignCoin<CosmosChain>(input)

  const denom = isFeeCoin(coin)
    ? cosmosFeeCoinDenom[coin.chain as CosmosChain]
    : getDenom(coin as ChainEntity<CosmosChain>)

  return {
    amount: input.toAmount,
    denom,
  }
}
