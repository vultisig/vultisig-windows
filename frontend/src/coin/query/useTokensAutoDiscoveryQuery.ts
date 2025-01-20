import { useQuery } from '@tanstack/react-query';

import { ChainAccount } from '../../chain/ChainAccount';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';
import { findAccountCoins } from '../balance/find/findAccountCoins';

export const getTokensAutoDiscoveryQueryKey = (account: ChainAccount) => [
  'autoDiscoverTokens',
  account,
];

export const useTokensAutoDiscoveryQuery = (account: ChainAccount) => {
  const [hasSeenChainPage, setHasSeenChainPage] = usePersistentState<
    Record<string, boolean>
  >(PersistentStateKey.ChainVisibilityAutoDiscovery, {});

  const isFirstVisit = !hasSeenChainPage[account.chain];

  return useQuery({
    queryKey: getTokensAutoDiscoveryQueryKey(account),
    queryFn: async () => {
      const coins = await findAccountCoins(account);

      if (isFirstVisit) {
        setHasSeenChainPage({
          ...hasSeenChainPage,
          [account.chain]: true,
        });
      }

      return coins;
    },
    enabled: isFirstVisit,
  });
};
