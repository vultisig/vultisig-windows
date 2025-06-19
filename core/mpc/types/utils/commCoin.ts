import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import {
  Coin as CommCoin,
  CoinSchema,
} from '@core/mpc/types/vultisig/keysign/v1/coin_pb'

export const fromCommCoin = (coin: CommCoin): AccountCoin => {
  return {
    id: coin.contractAddress || coin.ticker,
    chain: coin.chain as Chain,
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
