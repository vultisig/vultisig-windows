import { chainFeeCoin } from '../../../../coin/chainFeeCoin';

export const getCoinOptions = () => {
  const coins = Object.values(chainFeeCoin);
  return coins.map(({ chain, ticker, logo }, index) => ({
    value: chain,
    label: ticker,
    logo: logo,
    isLastOption: index === coins.length - 1,
  }));
};
