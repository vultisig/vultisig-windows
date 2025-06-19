import { create } from '@bufbuild/protobuf'
import { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { assertChainField } from '@core/chain/utils/assertChainField'
import {
  Coin as CommCoin,
  CoinSchema,
} from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'

export const getCommCoinKey = (
  coin: Pick<CommCoin, 'ticker' | 'chain'> &
    Partial<Pick<CommCoin, 'contractAddress'>>
) => {
  const { chain } = assertChainField(coin)
  const getId = () => {
    if (coin.contractAddress) {
      return coin.contractAddress
    }

    if (isOneOf(chain, Object.values(CosmosChain))) {
      return cosmosFeeCoinDenom[chain]
    }

    return coin.ticker
  }

  return {
    id: getId(),
    chain,
  }
}

export const fromCommCoin = (coin: CommCoin): AccountCoin => {
  return {
    ...getCommCoinKey(coin),
    address: coin.address,
    ticker: coin.ticker,
    logo: coin.logo,
    priceProviderId: coin.priceProviderId,
    decimals: coin.decimals,
  }
}

type ToCommCoinInput = AccountCoin & {
  hexPublicKey: string
}

export const toCommCoin = (coin: ToCommCoinInput): CommCoin => {
  const isNativeToken = isFeeCoin(coin)

  return create(CoinSchema, {
    chain: coin.chain,
    ticker: coin.ticker,
    address: coin.address,
    contractAddress: isNativeToken ? '' : coin.id,
    hexPublicKey: coin.hexPublicKey,
    isNativeToken: isNativeToken,
    logo: coin.logo,
    priceProviderId: coin.priceProviderId ?? '',
    decimals: coin.decimals,
  })
}
