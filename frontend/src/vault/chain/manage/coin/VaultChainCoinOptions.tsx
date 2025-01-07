import { useMemo } from 'react';

import { areEqualCoins, coinKeyToString } from '../../../../coin/Coin';
import { useAutoDiscoverTokensForNativeToken } from '../../../../coin/query/useAutoDiscoverTokensForNativeToken';
import { useWhitelistedCoinsQuery } from '../../../../coin/query/useWhitelistedCoinsQuery';
import {
  getCoinMetaKey,
  getCoinMetaSearchStrings,
} from '../../../../coin/utils/coinMeta';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { useCurrentSearch } from '../../../../lib/ui/search/CurrentSearchProvider';
import { useSearchFilter } from '../../../../lib/ui/search/hooks/useSearchFilter';
import { Text } from '../../../../lib/ui/text';
import { withoutDuplicates } from '../../../../lib/utils/array/withoutDuplicates';
import { TokensStore } from '../../../../services/Coin/CoinList';
import { useCurrentVaultChainCoins } from '../../../state/currentVault';
import { useCurrentVaultChain } from '../../useCurrentVaultChain';
import { ManageVaultChainCoin } from './ManageVaultChainCoin';

export const VaultChainCoinOptions = () => {
  const chain = useCurrentVaultChain();
  const vaultCoins = useCurrentVaultChainCoins(chain);
  const nativeToken = vaultCoins.find(
    coin => coin.chain === chain && coin.is_native_token
  )!;

  const {
    data: autoDiscoveredTokens = [],
    isLoading: isLoadingAutoDiscover,
    error: errorAutoDiscover,
  } = useAutoDiscoverTokensForNativeToken({
    chain,
    coin: storageCoinToCoin(nativeToken),
  });

  const query = useWhitelistedCoinsQuery(chain);

  const initialItems = useMemo(() => {
    const suggestedItems = TokensStore.TokenSelectionAssets.filter(
      token => token.chain === chain
    );

    return withoutDuplicates(
      [...autoDiscoveredTokens, ...suggestedItems],
      (one, another) =>
        areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    ).filter(({ isNativeToken }) => !isNativeToken);
  }, [chain, autoDiscoveredTokens]);

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
      {isLoadingAutoDiscover && <Spinner />}
      {errorAutoDiscover && (
        <Text color="danger">{errorAutoDiscover?.message}</Text>
      )}
    </>
  );
};
