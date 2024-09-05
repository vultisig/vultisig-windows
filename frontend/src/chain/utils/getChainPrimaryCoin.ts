import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { TokensStore } from '../../services/Coin/CoinList';

export const getChainPrimaryCoin = (chain: Chain): CoinMeta => {
  const tokens = TokensStore.TokenSelectionAssets.filter(
    token => token.chain === chain
  );

  const nativeToken = shouldBePresent(
    tokens.find(token => token.isNativeToken)
  );

  return nativeToken;
};
