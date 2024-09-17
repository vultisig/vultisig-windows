import { useMemo } from 'react';

import { areEqualCoins, coinKeyToString } from '../../../../coin/Coin';
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

  return (
    <>
      {options.map(option => (
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
