import { haveEqualFields } from '@lib/utils/record/haveEqualFields';

import { ChainAccount } from '../chain/ChainAccount';
import { Chain } from '@core/chain/Chain';
import { CoinKey } from './Coin';

export type AccountCoinKey<T extends Chain = Chain> = CoinKey & ChainAccount<T>;

export const areEqualAccountCoins = (
  one: AccountCoinKey,
  another: AccountCoinKey
): boolean => haveEqualFields(['chain', 'id', 'address'], one, another);

export const accountCoinKeyToString = ({
  chain,
  id,
  address,
}: AccountCoinKey): string => [chain, id, address].join(':');
