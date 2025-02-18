import { Chain } from '@core/chain/Chain'
import {
  AccountCoin,
  accountCoinKeyToString,
} from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'

import { storage } from '../../wailsjs/go/models'

export const fromStorageCoin = (coin: storage.Coin): AccountCoin => {
  return {
    id: coin.contract_address || coin.ticker,
    chain: coin.chain as Chain,
    address: coin.address,
    ticker: coin.ticker,
    logo: coin.logo,
    priceProviderId: coin.price_provider_id,
    decimals: coin.decimals,
  }
}

type ToStorageCoinInput = AccountCoin & {
  hexPublicKey: string
}

export const toStorageCoin = (coin: ToStorageCoinInput): storage.Coin => {
  const isNativeToken = isFeeCoin(coin)

  return {
    id: accountCoinKeyToString(coin),
    chain: coin.chain,
    address: coin.address,
    hex_public_key: coin.hexPublicKey,
    ticker: coin.ticker,
    contract_address: isNativeToken ? '' : coin.id,
    is_native_token: isNativeToken,
    logo: coin.logo,
    price_provider_id: coin.priceProviderId ?? '',
    decimals: coin.decimals,
  }
}
