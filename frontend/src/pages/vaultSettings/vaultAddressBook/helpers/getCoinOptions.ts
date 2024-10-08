import { TokenSelectionAssets } from '../../../../token-store';
import { getNativeTokens } from '../../../../utils/getNativeTokens';

export const getCoinOptions = () => {
  const nativeTokens = getNativeTokens();
  return nativeTokens.map(({ chain, ticker, logo }, index) => ({
    value: chain,
    label: ticker,
    logo: logo,
    isLastOption: index === TokenSelectionAssets.length - 1,
  }));
};
