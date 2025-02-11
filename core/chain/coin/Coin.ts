import { haveEqualFields } from "@lib/utils/record/haveEqualFields";
import { Chain } from "../Chain";
import { ChainEntity } from "../ChainEntity";

export type CoinKey<T extends Chain = Chain> = ChainEntity<T> & {
  id: string;
};

export type Coin = CoinKey & {
  priceProviderId?: string;
  decimals: number;
  ticker: string;
  logo: string;
};

export type CoinAmount = {
  decimals: number;
  amount: bigint;
};

export const areEqualCoins = (one: CoinKey, another: CoinKey): boolean =>
  haveEqualFields(["chain", "id"], one, another);

export const coinKeyToString = (coin: CoinKey): string =>
  `${coin.chain}:${coin.id}`;

export const coinKeyFromString = (coin: string): CoinKey => {
  const [chain, id] = coin.split(":");
  return { chain: chain as Chain, id };
};
