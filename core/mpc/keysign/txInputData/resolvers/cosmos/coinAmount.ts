import { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { getKeysignCoin } from '../../../utils/getKeysignCoin'

export const getCosmosCoinAmount = (input: KeysignPayload) => {
  const coin = getKeysignCoin<CosmosChain>(input)

  const denom = isFeeCoin(coin)
    ? cosmosFeeCoinDenom[coin.chain as CosmosChain]
    : coin.id

  return {
    amount: input.toAmount,
    denom,
  }
}
