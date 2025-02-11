import { Chain, EvmChain } from '@core/chain/Chain';
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo';
import { rootApiUrl } from '@core/config';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { useQuery } from '@tanstack/react-query';

import { fromOneInchTokens, OneInchTokensResponse } from '../oneInch/token';

export const useWhitelistedCoinsQuery = (chain: Chain) => {
  return useQuery({
    queryKey: ['whitelistedCoins', chain],
    queryFn: async () => {
      const evmChainId = getEvmChainId(chain as EvmChain);
      if (evmChainId) {
        const url = `${rootApiUrl}/1inch/swap/v6.0/${evmChainId}/tokens`;
        const data = await queryUrl<OneInchTokensResponse>(url);

        const oneInchTokens = Object.values(data.tokens);

        return fromOneInchTokens({
          tokens: oneInchTokens,
          chain,
        });
      }

      return [];
    },
  });
};
