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
  const [
    hasAutoDiscoveryBeenDoneForChain,
    setHasAutoDiscoveryBeenDoneForChain,
  ] = usePersistentState<Record<string, boolean>>(
    PersistentStateKey.HasAutoDiscoveryBeenDoneForChain,
    {}
  );

  const isFirstVisit = !hasAutoDiscoveryBeenDoneForChain[account.chain];

  return useQuery({
    queryKey: getTokensAutoDiscoveryQueryKey(account),
    queryFn: async () => {
      const coins = await findAccountCoins(account);

      setHasAutoDiscoveryBeenDoneForChain({
        ...hasAutoDiscoveryBeenDoneForChain,
        [account.chain]: true,
      });

      return coins;
    },
    enabled: isFirstVisit,
  });
};
