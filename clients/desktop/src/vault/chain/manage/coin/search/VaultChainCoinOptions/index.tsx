import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates';
import { t } from 'i18next';
import { useCallback, useMemo } from 'react';

import { assertChainField } from '../../../../../../chain/utils/assertChainField';
import { chainFeeCoin } from '../../../../../../coin/chainFeeCoins';
import { chainTokens } from '../../../../../../coin/chainTokens';
import {
  areEqualCoins,
  Coin,
  coinKeyToString,
} from '../../../../../../coin/Coin';
import { useWhitelistedCoinsQuery } from '../../../../../../coin/query/useWhitelistedCoinsQuery';
import { fromStorageCoin } from '../../../../../../coin/utils/fromStorageCoin';
import { getCoinSearchString } from '../../../../../../coin/utils/getCoinSearchStrings';
import { sortCoinsAlphabetically } from '../../../../../../coin/utils/sortCoinsAlphabetically';
import { NonEmptyOnly } from '../../../../../../lib/ui/base/NonEmptyOnly';
import { useTransform } from '../../../../../../lib/ui/hooks/useTransform';
import { VStack } from '../../../../../../lib/ui/layout/Stack';
import { useCurrentSearch } from '../../../../../../lib/ui/search/CurrentSearchProvider';
import { useSearchFilter } from '../../../../../../lib/ui/search/hooks/useSearchFilter';
import { Text } from '../../../../../../lib/ui/text';
import { useCurrentVaultChainCoins } from '../../../../../state/currentVault';
import { useCurrentVaultChain } from '../../../../useCurrentVaultChain';
import { ManageVaultChainCoin } from '../../ManageVaultChainCoin';

export const VaultChainCoinOptions = () => {
  const chain = useCurrentVaultChain();
  const query = useWhitelistedCoinsQuery(chain);
  const [searchQuery] = useCurrentSearch();
  const selectedCoins = useTransform(
    useCurrentVaultChainCoins(chain),
    useCallback(
      coins =>
        coins
          .filter(
            coin => !areEqualCoins(assertChainField(coin), chainFeeCoin[chain])
          )
          .map(fromStorageCoin),
      [chain]
    )
  );

  const allItems = useMemo(() => {
    let result: Coin[] = [];

    const tokens = chainTokens[chain];

    if (tokens) {
      result.push(...tokens);
    }

    if (query.data) {
      result.push(...query.data);
    }

    result = result.filter(
      coin =>
        !selectedCoins.some(selectedCoin => areEqualCoins(selectedCoin, coin))
    );

    return withoutDuplicates(result, areEqualCoins);
  }, [chain, query.data, selectedCoins]);

  const options = useTransform(
    useSearchFilter({
      searchQuery,
      items: allItems,
      getSearchStrings: getCoinSearchString,
    }),
    sortCoinsAlphabetically
  );

  return (
    <>
      <NonEmptyOnly
        value={selectedCoins}
        render={coins => (
          <>
            <Text size={18} color="shy">
              {t('selected').toUpperCase()}
            </Text>
            {coins.map(option => (
              <ManageVaultChainCoin
                key={coinKeyToString(option)}
                value={option}
              />
            ))}
          </>
        )}
      />
      <NonEmptyOnly
        value={options}
        render={coins => (
          <>
            <Text size={18} color="shy">
              {t('tokens').toUpperCase()}
            </Text>
            {coins.map(option => (
              <ManageVaultChainCoin
                key={coinKeyToString(option)}
                value={option}
              />
            ))}
          </>
        )}
      />
      {searchQuery && query.isPending && (
        <VStack fullWidth alignItems="center">
          <Text>Searching ...</Text>
        </VStack>
      )}
    </>
  );
};
