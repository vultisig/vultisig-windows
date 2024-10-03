import { TokenSelectionAssets } from '../../../../token-store';

export const getCoinOptions = () =>
  TokenSelectionAssets.map(({ chain, ticker, logo }, index) => ({
    value: chain,
    label: ticker,
    logo: logo,
    isLastOption: index === TokenSelectionAssets.length - 1,
  }));
