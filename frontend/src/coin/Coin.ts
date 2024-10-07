import { haveEqualFields } from '../lib/utils/record/haveEqualFields';

export type CoinKey = {
  chainId: string;
  id: string;
};

export type CoinAmount = {
  amount: string | number;
  decimals: number;
};

export type CoinInfo = {
  symbol: string;
  icon?: string;
};

export const areEqualCoins = (one: CoinKey, another: CoinKey): boolean =>
  haveEqualFields(['chainId', 'id'], one, another);

export const coinKeyToString = (coin: CoinKey): string =>
  `${coin.chainId}:${coin.id}`;

export const coinKeyFromString = (coin: string): CoinKey => {
  const [chainId, id] = coin.split(':');
  return { chainId, id };
};
