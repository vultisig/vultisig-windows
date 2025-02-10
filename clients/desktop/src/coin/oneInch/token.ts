import { Chain } from '@core/chain/Chain';

import { Coin } from '../Coin';

export type OneInchToken = {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  logoURI: string;
  eip2612: boolean;
  tags: string[];
};

export type OneInchTokensResponse = {
  tokens: Record<string, OneInchToken>;
};

type FromOneInchTokenInput = {
  token: OneInchToken;
  chain: Chain;
};

export const fromOneInchToken = ({
  token,
  chain,
}: FromOneInchTokenInput): Coin => {
  return {
    chain,
    id: token.address,
    decimals: token.decimals,
    logo: token.logoURI,
    ticker: token.symbol,
  };
};
