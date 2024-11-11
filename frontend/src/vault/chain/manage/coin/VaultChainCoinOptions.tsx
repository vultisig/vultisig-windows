import { useMemo } from 'react';

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
import { TokensStore } from '../../../../services/Coin/CoinList';
import { useAssertCurrentVaultChainCoins } from '../../../state/useCurrentVault';
import { useCurrentVaultChain } from '../../useCurrentVaultChain';
import { ManageVaultChainCoin } from './ManageVaultChainCoin';

export const VaultChainCoinOptions = () => {
  const chainId = useCurrentVaultChain();
  const vaultCoins = useAssertCurrentVaultChainCoins(chainId);
  const query = useWhitelistedCoinsQuery(chainId);

  const initialItems = useMemo(() => {
    const vaultItems = vaultCoins.map(storageCoinToCoin).map(CoinMeta.fromCoin);
    const suggestedItems = TokensStore.TokenSelectionAssets.filter(
      token => token.chain === chainId
    );

    return withoutDuplicates(
      [...vaultItems, ...suggestedItems],
      (one, another) =>
        areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    ).filter(({ isNativeToken }) => !isNativeToken);
  }, [chainId, vaultCoins]);

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
