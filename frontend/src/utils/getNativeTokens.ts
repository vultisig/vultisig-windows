import { coinsRecord } from '../coin/coins';

export const getNativeTokens = () =>
  Object.values(coinsRecord)
    .flat()
    .filter(token => token.isNativeToken);
