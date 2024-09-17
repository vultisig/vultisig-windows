import { useQuery } from '@tanstack/react-query';

import { Fetch } from '../../../wailsjs/go/utils/GoHttp';
import { EvmChain, evmChainIds } from '../../chain/evm/EvmChain';
import { Chain } from '../../model/chain';
import { Endpoint } from '../../services/Endpoint';
import {
  OneInchTokensResponse,
  oneInchTokenToCoinMeta,
} from '../oneInch/token';

export const useWhitelistedCoinsQuery = (chain: Chain) => {
  return useQuery({
    queryKey: ['whitelistedCoins', chain],
    queryFn: async () => {
      const evmChainId = evmChainIds[chain as EvmChain];
      if (evmChainId) {
        const data = (await Fetch(
          Endpoint.fetchTokens(evmChainId)
        )) as OneInchTokensResponse;

        const oneInchTokens = Object.values(data.tokens);

        return oneInchTokens.map(token =>
          oneInchTokenToCoinMeta({
            token,
            chain,
          })
        );
      }

      return [];
    },
  });
};
