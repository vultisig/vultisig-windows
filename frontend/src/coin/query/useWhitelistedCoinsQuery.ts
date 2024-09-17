import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Fetch } from '../../../wailsjs/go/utils/GoHttp';
import { EvmChain, evmChainIds } from '../../chain/evm/EvmChain';
import { EagerQuery } from '../../lib/ui/query/Query';
import { withoutDuplicates } from '../../lib/utils/array/withoutDuplicates';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { TokensStore } from '../../services/Coin/CoinList';
import { Endpoint } from '../../services/Endpoint';
import { areEqualCoins } from '../Coin';
import {
  OneInchTokensResponse,
  oneInchTokenToCoinMeta,
} from '../oneInch/token';
import { getCoinMetaKey } from '../utils/coinMeta';

export const useWhitelistedCoinsQuery = (
  chain: Chain
): EagerQuery<CoinMeta[]> => {
  const query = useQuery({
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

  return useMemo(() => {
    const initialData = TokensStore.TokenSelectionAssets.filter(
      token => token.chain === chain && !token.isNativeToken
    );

    const data = withoutDuplicates(
      [...initialData, ...(query.data ?? [])],
      (one, another) =>
        areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    );

    return {
      data,
      isPending: query.isPending,
      errors: query.error ? [query.error] : [],
    };
  }, [chain]);
};
