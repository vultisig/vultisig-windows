import { t } from 'i18next';
import { useMemo } from 'react';

import { storage } from '../../../../../wailsjs/go/models';
import { areEqualCoins, coinKeyToString } from '../../../../coin/Coin';
import { useWhitelistedCoinsQuery } from '../../../../coin/query/useWhitelistedCoinsQuery';
import {
  getCoinMetaKey,
  getCoinMetaSearchStrings,
} from '../../../../coin/utils/coinMeta';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../../../coin/utils/storageCoin';
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
import { useCurrentVaultCoins } from '../../../state/currentVault';
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
  const vaultCoins = useCurrentVaultCoins();
  const { selectedCoins, unselectedCoins } = coins
    .filter(coin => !coin.is_native_token)
    .reduce<{
      selectedCoins: CoinMeta[];
      unselectedCoins: CoinMeta[];
    }>(
      (result, coin) => {
        const isSelected = vaultCoins.some(c =>
          areEqualCoins(getStorageCoinKey(c), getStorageCoinKey(coin))
        );

        if (isSelected) {
          result.selectedCoins.push(CoinMeta.fromCoin(storageCoinToCoin(coin)));
        } else {
          result.unselectedCoins.push(
            CoinMeta.fromCoin(storageCoinToCoin(coin))
          );
        }

        return result;
      },
      { selectedCoins: [], unselectedCoins: [] }
    );

  const initialItems = useMemo(() => {
    const suggestedItems = unselectedCoins.filter(
      token => token.chain === chain
    );

    return withoutDuplicates(suggestedItems, (one, another) =>
      areEqualCoins(getCoinMetaKey(one), getCoinMetaKey(another))
    ).filter(({ isNativeToken }) => !isNativeToken);
  }, [chain, unselectedCoins]);

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
      {unselectedCoins.length > 0 && (
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
