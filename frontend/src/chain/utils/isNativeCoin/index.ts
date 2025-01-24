import { areEqualCoins, CoinKey } from '../../../coin/Coin';
import { coinsRecord } from '../../../coin/coins';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';

export const isNativeCoin = (key: CoinKey) => {
  const chainCoins = coinsRecord[key.chain];
  return chainCoins.some(
    coin => coin.isNativeToken && areEqualCoins(getCoinMetaKey(coin), key)
  );
};
