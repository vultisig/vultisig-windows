import { AccountCoin } from '@core/chain/coin/AccountCoin';

import { storage } from '../../../wailsjs/go/models';
import { getStorageCoinKey } from './storageCoin';

export const fromStorageCoin = (storageCoin: storage.Coin): AccountCoin => {
  const { chain, id } = getStorageCoinKey(storageCoin);

  return {
    priceProviderId: storageCoin.price_provider_id,
    decimals: storageCoin.decimals,
    ticker: storageCoin.ticker,
    logo: storageCoin.logo,
    chain,
    id,
    address: storageCoin.address,
  };
};
