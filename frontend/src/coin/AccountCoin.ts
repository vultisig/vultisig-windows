import { ChainAccount } from '../chain/ChainAccount';
import { haveEqualFields } from '../lib/utils/record/haveEqualFields';
import { CoinKey } from './Coin';

export type AccountCoinKey = CoinKey & ChainAccount;

export const areEqualAccountCoins = (
  one: AccountCoinKey,
  another: AccountCoinKey
): boolean => haveEqualFields(['chainId', 'id', 'address'], one, another);

export const accountCoinKeyToString = ({
  chainId,
  id,
  address,
}: AccountCoinKey): string => [chainId, id, address].join(':');
