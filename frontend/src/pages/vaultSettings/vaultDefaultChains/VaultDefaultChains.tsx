import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { useDefaultChains } from '../../../lib/hooks/useDefaultChains';
import { VStack } from '../../../lib/ui/layout/Stack';
import { useCurrentSearch } from '../../../lib/ui/search/CurrentSearchProvider';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { getNativeTokens } from '../../../utils/getNativeTokens';
import { CoinSearch } from '../../../vault/chain/manage/coin/search/CoinSearch';
import {
  ChainButton,
  Check,
  ColumnOneBothRowsItem,
  ColumnTwoRowOneItem,
  ColumnTwoRowTwoItem,
  HeaderWrapper,
} from './VaultDefaultChains.styles';

const VaultDefaultChains = () => {
  const { t } = useTranslation();
  const [searchQuery] = useCurrentSearch();
  const {
    defaultChains: databaseDefaultChains,
    updateDefaultChains: updateDatabaseDefaultChains,
    isUpdating,
  } = useDefaultChains();

  const [optimisticDefaultChains, setOptimisticDefaultChains] = useState(
    databaseDefaultChains
  );
  const nativeTokens = getNativeTokens();
  const filteredNativeTokens = useMemo(() => {
    if (!searchQuery) {
      return nativeTokens;
    }
    return nativeTokens.filter(token =>
      token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nativeTokens, searchQuery]);

  const handleChainToggle = (chain: string) => {
    let newDefaultChains;

    if (optimisticDefaultChains.includes(chain)) {
      newDefaultChains = optimisticDefaultChains.filter(
        c => c.trim() !== chain.trim()
      );
    } else {
      newDefaultChains = [...optimisticDefaultChains, chain];
    }

    setOptimisticDefaultChains(newDefaultChains);
    updateDatabaseDefaultChains(newDefaultChains);
  };

  // Synchronize in case the mutation was unsuccessful and the optimistic update needs to be reverted
  useEffect(() => {
    if (optimisticDefaultChains !== databaseDefaultChains && !isUpdating) {
      setOptimisticDefaultChains(databaseDefaultChains);
    }
  }, [databaseDefaultChains, optimisticDefaultChains, isUpdating]);

  return (
    <VStack flexGrow gap={16}>
      <HeaderWrapper>
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={
            <PageHeaderTitle>
              {t('vault_settings_default_chains')}
            </PageHeaderTitle>
          }
        />
      </HeaderWrapper>
      <PageSlice gap={16} flexGrow={true}>
        <CoinSearch />
        {filteredNativeTokens.map(({ ticker, chain }, index) => {
          const imgSrc = getChainEntityIconSrc(chain as string);

          return (
            <ChainButton
              key={index}
              onClick={() => handleChainToggle(chain.toLowerCase())}
            >
              <ColumnOneBothRowsItem
                src={imgSrc}
                alt={ticker}
                width={24}
                height={24}
              />
              <ColumnTwoRowOneItem size={16} color="contrast" weight="600">
                {ticker}
              </ColumnTwoRowOneItem>
              <ColumnTwoRowTwoItem size={12} color="contrast" weight="500">
                {chain}
              </ColumnTwoRowTwoItem>
              <Check
                value={optimisticDefaultChains.some(
                  coin => coin.trim() === chain.trim().toLowerCase()
                )}
              />
            </ChainButton>
          );
        })}
      </PageSlice>
    </VStack>
  );
};

export default VaultDefaultChains;
