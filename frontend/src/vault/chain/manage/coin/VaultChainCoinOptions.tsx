import { useMemo } from 'react';

import { storage } from '../../../../../wailsjs/go/models';
import { areEqualCoins, coinKeyToString } from '../../../../coin/Coin';
import { useWhitelistedCoinsQuery } from '../../../../coin/query/useWhitelistedCoinsQuery';
import {
  getCoinMetaKey,
  getCoinMetaSearchStrings,
} from '../../../../coin/utils/coinMeta';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { useCurrentSearch } from '../../../../lib/ui/search/CurrentSearchProvider';
import { useSearchFilter } from '../../../../lib/ui/search/hooks/useSearchFilter';
import { Text } from '../../../../lib/ui/text';
import { withoutDuplicates } from '../../../../lib/utils/array/withoutDuplicates';
import { CoinMeta } from '../../../../model/coin-meta';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../../../state/persistentState';
import { useCurrentVaultChain } from '../../useCurrentVaultChain';
import { ManageVaultChainCoin } from './ManageVaultChainCoin';

export const VaultChainCoinOptions = () => {
  const chain = useCurrentVaultChain();
  const [chainToCoinsMap] = usePersistentState<Record<string, storage.Coin[]>>(
    PersistentStateKey.ChainAllTokens,
    {}
  );
  const coins = useMemo(
    () => chainToCoinsMap[chain] ?? ([] as storage.Coin[]),
    [chain, chainToCoinsMap]
  );
  const query = useWhitelistedCoinsQuery(chain);
  const [searchQuery] = useCurrentSearch();

  const initialItems = useMemo(() => {
    const suggestedItems = coins
      .filter(token => token.chain === chain)
      .map(coin => CoinMeta.fromCoin(storageCoinToCoin(coin)));

    return withoutDuplicates(suggestedItems, (one, another) =>
      areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    ).filter(({ isNativeToken }) => !isNativeToken);
  }, [chain, coins]);

  const allUniqueItems = useMemo(() => {
    return withoutDuplicates(
      [...initialItems, ...(query.data ?? [])],
      (one, another) =>
        areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    );
  }, [initialItems, query.data]);

  const options = useSearchFilter({
    searchQuery,
    items: searchQuery ? allUniqueItems : initialItems,
    getSearchStrings: getCoinMetaSearchStrings,
  });

  const sortedOptions = useMemo(() => {
    return options.sort((a, b) => a.ticker.localeCompare(b.ticker));
  }, [options]);

  return (
    <>
      {sortedOptions.map(option => (
        <ManageVaultChainCoin
          key={coinKeyToString(getCoinMetaKey(option))}
          value={option}
        />
      ))}
      {searchQuery && query.isPending && (
        <VStack fullWidth alignItems="center">
          <Text>Searching ...</Text>
        </VStack>
      )}
    </>
  );
};
