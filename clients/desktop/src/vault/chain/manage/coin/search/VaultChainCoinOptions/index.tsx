import { t } from 'i18next';
import { useMemo } from 'react';

import { areEqualCoins, coinKeyToString } from '../../../../../../coin/Coin';
import { useWhitelistedCoinsQuery } from '../../../../../../coin/query/useWhitelistedCoinsQuery';
import {
  getCoinMetaKey,
  getCoinMetaSearchStrings,
} from '../../../../../../coin/utils/coinMeta';
import { VStack } from '../../../../../../lib/ui/layout/Stack';
import { useCurrentSearch } from '../../../../../../lib/ui/search/CurrentSearchProvider';
import { useSearchFilter } from '../../../../../../lib/ui/search/hooks/useSearchFilter';
import { Text } from '../../../../../../lib/ui/text';
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates';
import { useCurrentVaultChain } from '../../../../useCurrentVaultChain';
import { ManageVaultChainCoin } from '../../ManageVaultChainCoin';
import { useCoinsForChainCoinOptionsMenu } from './hooks/useCoinsForChainCoinOptionsMenu';

export const VaultChainCoinOptions = () => {
  const chain = useCurrentVaultChain();
  const query = useWhitelistedCoinsQuery(chain);
  const [searchQuery] = useCurrentSearch();
  const { selectedCoins, unselectedCoins } =
    useCoinsForChainCoinOptionsMenu(chain);

  const initialItems = useMemo(() => {
    const suggestedItems = [...unselectedCoins];

    return withoutDuplicates(suggestedItems, (one, another) =>
      areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    ).filter(({ isNativeToken }) => !isNativeToken);
  }, [unselectedCoins]);

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
      {selectedCoins.length > 0 && (
        <>
          <Text size={18} color="shy">
            {t('selected').toUpperCase()}
          </Text>
          {selectedCoins.map(option => (
            <ManageVaultChainCoin
              key={coinKeyToString(getCoinMetaKey(option))}
              value={option}
            />
          ))}
        </>
      )}
      {sortedOptions.length > 0 && (
        <>
          <Text size={18} color="shy">
            {t('tokens').toUpperCase()}
          </Text>
          {sortedOptions.map(option => (
            <ManageVaultChainCoin
              key={coinKeyToString(getCoinMetaKey(option))}
              value={option}
            />
          ))}
        </>
      )}
      {searchQuery && query.isPending && (
        <VStack fullWidth alignItems="center">
          <Text>Searching ...</Text>
        </VStack>
      )}
    </>
  );
};
