import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../Coin';
import { getStorageCoinKey } from './storageCoin';

export const fromStorageCoin = (storageCoin: storage.Coin): Coin => {
  const { chain, id } = getStorageCoinKey(storageCoin);

  return {
    priceProviderId: storageCoin.price_provider_id,
    decimals: storageCoin.decimals,
    ticker: storageCoin.ticker,
    logo: storageCoin.logo,
    chain,
    id,
  };
};
