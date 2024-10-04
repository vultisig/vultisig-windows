import { TokenSelectionAssets } from '../token-store';

export const getNativeTokens = () =>
  TokenSelectionAssets.filter(token => token.isNativeToken);
