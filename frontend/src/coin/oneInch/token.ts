import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';

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

type OneInchTokenToCoinMeta = {
  token: OneInchToken;
  chain: Chain;
};

export const oneInchTokenToCoinMeta = ({
  token,
  chain,
}: OneInchTokenToCoinMeta): CoinMeta => {
  return {
    chain,
    contractAddress: token.address,
    decimals: token.decimals,
    isNativeToken: false,
    logo: token.logoURI,
    priceProviderId: '',
    ticker: token.symbol,
  };
};
