import { chainFeeCoin } from '../../../coin/chainFeeCoins';
import { areEqualCoins, CoinKey } from '../../../coin/Coin';

export const isNativeCoin = (key: CoinKey) => {
  const feeCoin = chainFeeCoin[key.chain];
  return areEqualCoins(feeCoin, key);
};
