import { Chain } from '../../model/chain';
import { AccountCoinKey } from '../AccountCoin';

export type GetCoinBalanceInput<T extends Chain = Chain> = AccountCoinKey<T>;
