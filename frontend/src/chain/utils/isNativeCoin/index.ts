import { chainFeeCoin } from '../../../coin/chainFeeCoin';
import { areEqualCoins, CoinKey } from '../../../coin/Coin';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';

export const isNativeCoin = (key: CoinKey) => {
  const feeCoin = chainFeeCoin[key.chain];
  return areEqualCoins(getCoinMetaKey(feeCoin), key);
};
