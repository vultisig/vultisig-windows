import { haveEqualFields } from '../lib/utils/record/haveEqualFields';
import { Chain } from '../model/chain';

export type CoinKey = {
  chain: Chain;
  id: string;
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
