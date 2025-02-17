import { haveEqualFields } from "@lib/utils/record/haveEqualFields";
import { Chain } from "../Chain";
import { Coin, CoinKey } from "@core/chain/coin/Coin";

export type AccountCoinKey<T extends Chain = Chain> = CoinKey<T> & {
  address: string;
};

export type AccountCoin<T extends Chain = Chain> = Coin & AccountCoinKey<T>;

export const areEqualAccountCoins = (
  one: AccountCoinKey,
  another: AccountCoinKey,
): boolean => haveEqualFields(["chain", "id", "address"], one, another);

export const accountCoinKeyToString = ({
  chain,
  id,
  address,
}: AccountCoinKey): string => [chain, id, address].join(":");
