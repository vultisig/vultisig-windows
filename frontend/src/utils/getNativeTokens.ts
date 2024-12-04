import { TokensStore } from '../services/Coin/CoinList';

export const getNativeTokens = () =>
  TokensStore.TokenSelectionAssets.filter(token => token.isNativeToken);
