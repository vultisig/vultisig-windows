import { useQuery } from '@tanstack/react-query';

import { ChainAccount } from '../../chain/ChainAccount';
import { findAccountCoins } from '../balance/find/findAccountCoins';

export const getTokensAutoDiscoveryQueryKey = (account: ChainAccount) => [
  'autoDiscoverTokens',
  account,
];

export const useTokensAutoDiscoveryQuery = (account: ChainAccount) => {
  return useQuery({
    queryKey: getTokensAutoDiscoveryQueryKey(account),
    queryFn: async () => findAccountCoins(account),
  });
};
