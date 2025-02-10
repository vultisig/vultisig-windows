import { Chain, EvmChain } from '@core/chain/Chain';
import { rootApiUrl } from '@core/config';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { useQuery } from '@tanstack/react-query';

import { getEvmChainId } from '../../chain/evm/chainInfo';
import { fromOneInchToken, OneInchTokensResponse } from '../oneInch/token';

export const useWhitelistedCoinsQuery = (chain: Chain) => {
  return useQuery({
    queryKey: ['whitelistedCoins', chain],
    queryFn: async () => {
      const evmChainId = getEvmChainId(chain as EvmChain);
      if (evmChainId) {
        const url = `${rootApiUrl}/1inch/swap/v6.0/${evmChainId}/tokens`;
        const data = await queryUrl<OneInchTokensResponse>(url);

        const oneInchTokens = Object.values(data.tokens);

        return oneInchTokens.map(token =>
          fromOneInchToken({
            token,
            chain,
          })
        );
      }

      return [];
    },
  });
};
