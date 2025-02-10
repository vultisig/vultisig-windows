import { Chain } from '@core/chain/Chain';
import { haveEqualFields } from '@lib/utils/record/haveEqualFields';

import { ChainEntity } from '../chain/ChainEntity';

export type CoinKey<T extends Chain = Chain> = ChainEntity<T> & {
  id: string;
};

export type PriceProviderIdField = {
  priceProviderId: string;
};

export type DecimalsField = {
  decimals: number;
};

export type CoinAmount = DecimalsField & {
  amount: bigint;
};

export type TickerField = {
  ticker: string;
};

export type LogoField = {
  logo: string;
};

export type AddressField = {
  address: string;
};

export type Coin = Partial<PriceProviderIdField> &
  DecimalsField &
  TickerField &
  LogoField &
  CoinKey;

export type AccountCoin = Coin & AddressField;

export const areEqualCoins = (one: CoinKey, another: CoinKey): boolean =>
  haveEqualFields(['chain', 'id'], one, another);

export const coinKeyToString = (coin: CoinKey): string =>
  `${coin.chain}:${coin.id}`;

export const coinKeyFromString = (coin: string): CoinKey => {
  const [chain, id] = coin.split(':');
  return { chain: chain as Chain, id };
};
