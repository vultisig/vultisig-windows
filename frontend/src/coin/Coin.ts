import { haveEqualFields } from '../lib/utils/record/haveEqualFields';

export type CoinKey = {
  chainId: string;
  id: string;
};

export type CoinAmount = {
  amount: number;
  decimals: number;
};

export type CoinInfo = {
  name: string;
  symbol: string;
  icon?: string;
};

export const areEqualCoins = (one: CoinKey, another: CoinKey): boolean =>
  haveEqualFields(['chainId', 'id'], one, another);

export const coinKeyToString = (coin: CoinKey): string =>
  `${coin.chainId}:${coin.id}`;
