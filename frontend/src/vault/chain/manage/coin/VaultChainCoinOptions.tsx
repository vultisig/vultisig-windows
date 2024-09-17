import { useWhitelistedCoinsQuery } from '../../../../coin/query/useWhitelistedCoinsQuery';
import { getCoinMetaSearchStrings } from '../../../../coin/utils/coinMeta';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { useCurrentSearch } from '../../../../lib/ui/search/CurrentSearchProvider';
import { useSearchFilter } from '../../../../lib/ui/search/hooks/useSearchFilter';
import { Text } from '../../../../lib/ui/text';
import { useCurrentVaultChainId } from '../../useCurrentVaultChainId';
import { ManageVaultChainCoin } from './ManageVaultChainCoin';

export const VaultChainCoinOptions = () => {
  const chainId = useCurrentVaultChainId();

  const query = useWhitelistedCoinsQuery(chainId);

  const [searchQuery] = useCurrentSearch();
  const options = useSearchFilter({
    searchQuery,
    items: query.data ?? [],
    getSearchStrings: getCoinMetaSearchStrings,
  });

  return (
    <>
      {options.map(option => (
        <ManageVaultChainCoin key={option.ticker} value={option} />
      ))}
      {query.isPending && (
        <VStack fullWidth alignItems="center">
          <Text>Loading ...</Text>
        </VStack>
      )}
    </>
  );
};
