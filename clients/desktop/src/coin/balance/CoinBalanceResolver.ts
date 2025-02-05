import { Chain } from '../../model/chain';
import { AccountCoinKey } from '../AccountCoin';

export type CoinBalanceResolver<T extends Chain = Chain> = (
  input: AccountCoinKey<T>
) => Promise<bigint>;
