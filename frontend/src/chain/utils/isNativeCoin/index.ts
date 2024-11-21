import { areEqualCoins, CoinKey } from '../../../coin/Coin';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { TokensStore } from '../../../services/Coin/CoinList';

export const isNativeCoin = (key: CoinKey) => {
  return TokensStore.TokenSelectionAssets.some(
    token => token.isNativeToken && areEqualCoins(getCoinMetaKey(token), key)
  );
};
