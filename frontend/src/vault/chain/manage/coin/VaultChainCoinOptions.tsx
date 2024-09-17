import { useMemo } from 'react';

import { getCoinMetaSearchStrings } from '../../../../coin/utils/coinMeta';
import { useCurrentSearch } from '../../../../lib/ui/search/CurrentSearchProvider';
import { useSearchFilter } from '../../../../lib/ui/search/hooks/useSearchFilter';
import { TokensStore } from '../../../../services/Coin/CoinList';
import { useCurrentVaultChainId } from '../../useCurrentVaultChainId';
import { ManageVaultChainCoin } from './ManageVaultChainCoin';

export const VaultChainCoinOptions = () => {
  const chainId = useCurrentVaultChainId();

  const items = useMemo(
    () =>
      TokensStore.TokenSelectionAssets.filter(
        token => token.chain === chainId && !token.isNativeToken
      ),
    [chainId]
  );

  const [searchQuery] = useCurrentSearch();
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
    </>
  );
};
