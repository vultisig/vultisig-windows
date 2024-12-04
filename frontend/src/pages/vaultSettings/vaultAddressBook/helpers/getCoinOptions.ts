import { TokensStore } from '../../../../services/Coin/CoinList';
import { getNativeTokens } from '../../../../utils/getNativeTokens';

export const getCoinOptions = () => {
  const nativeTokens = getNativeTokens();
  return nativeTokens.map(({ chain, ticker, logo }, index) => ({
    value: chain,
    label: ticker,
    logo: logo,
    isLastOption: index === TokensStore.TokenSelectionAssets.length - 1,
  }));
};
