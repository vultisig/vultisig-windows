import { Chain } from '@core/chain/Chain';
import { ChainAccount } from '@core/chain/ChainAccount';
import { haveEqualFields } from '@lib/utils/record/haveEqualFields';

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
