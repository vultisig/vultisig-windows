import { haveEqualFields } from '@lib/utils/record/haveEqualFields';

import { ChainEntity } from '../chain/ChainEntity';
import { Chain } from '../model/chain';

export type CoinKey<T extends Chain = Chain> = ChainEntity<T> & {
  id: string;
};

export type PriceProviderIdField = {
  priceProviderId: string;
};

export type EntityWithDecimals = {
  decimals: number;
};

export type CoinAmount = EntityWithDecimals & {
  amount: bigint;
};

export const areEqualCoins = (one: CoinKey, another: CoinKey): boolean =>
  haveEqualFields(['chain', 'id'], one, another);

export const coinKeyToString = (coin: CoinKey): string =>
  `${coin.chain}:${coin.id}`;

export const coinKeyFromString = (coin: string): CoinKey => {
  const [chain, id] = coin.split(':');
  return { chain: chain as Chain, id };
};
