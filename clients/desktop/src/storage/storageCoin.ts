import {
  AccountCoin,
  accountCoinKeyToString,
} from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getCommCoinKey } from '@core/mpc/types/utils/commCoin'

import { storage } from '../../wailsjs/go/models'

export const fromStorageCoin = (coin: storage.Coin): AccountCoin => {
  return {
    ...getCommCoinKey(coin),
    address: coin.address,
    ticker: coin.ticker,
    logo: coin.logo || undefined,
    priceProviderId: coin.price_provider_id || undefined,
    decimals: coin.decimals,
  }
}

export const toStorageCoin = (coin: AccountCoin): storage.Coin => {
  const isNativeToken = isFeeCoin(coin)

  return {
    id: accountCoinKeyToString(coin),
    chain: coin.chain,
    address: coin.address,
    ticker: coin.ticker,
    contract_address: isNativeToken ? '' : coin.id,
    is_native_token: isNativeToken,
    logo: coin.logo ?? '',
    price_provider_id: coin.priceProviderId ?? '',
    decimals: coin.decimals,
  }
}
