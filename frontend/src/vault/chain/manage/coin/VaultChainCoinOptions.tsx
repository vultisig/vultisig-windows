import { useMemo } from 'react';

import { areEqualCoins } from '../../../../coin/Coin';
import { useWhitelistedCoinsQuery } from '../../../../coin/query/useWhitelistedCoinsQuery';
import {
  getCoinMetaKey,
  getCoinMetaSearchStrings,
} from '../../../../coin/utils/coinMeta';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { useCurrentSearch } from '../../../../lib/ui/search/CurrentSearchProvider';
import { useSearchFilter } from '../../../../lib/ui/search/hooks/useSearchFilter';
import { Text } from '../../../../lib/ui/text';
import { withoutDuplicates } from '../../../../lib/utils/array/withoutDuplicates';
import { TokensStore } from '../../../../services/Coin/CoinList';
import { useCurrentVaultChainId } from '../../useCurrentVaultChainId';
import { ManageVaultChainCoin } from './ManageVaultChainCoin';

export const VaultChainCoinOptions = () => {
  const chainId = useCurrentVaultChainId();

  const query = useWhitelistedCoinsQuery(chainId);

  const initialItems = useMemo(
    () =>
      TokensStore.TokenSelectionAssets.filter(
        token => token.chain === chainId && !token.isNativeToken
      ),
    [chainId]
  );

  const [searchQuery] = useCurrentSearch();

  const items = useMemo(() => {
    if (!searchQuery) {
      return initialItems;
    }

    return withoutDuplicates(
      [...initialItems, ...(query.data ?? [])],
      (one, another) =>
        areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    );
  }, [searchQuery, initialItems, query]);

  const options = useSearchFilter({
    searchQuery,
    items,
    getSearchStrings: getCoinMetaSearchStrings,
  });

  return (
    <>
      {options.map(option => (
        <ManageVaultChainCoin key={option.ticker} value={option} />
      ))}
      {searchQuery && query.isPending && (
        <VStack fullWidth alignItems="center">
          <Text>Searching ...</Text>
        </VStack>
      )}
    </>
  );
};
