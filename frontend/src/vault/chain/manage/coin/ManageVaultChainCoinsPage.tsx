import { useTranslation } from 'react-i18next';

import { ScrollableFlexboxFiller } from '../../../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { CurrentSearchProvider } from '../../../../lib/ui/search/CurrentSearchProvider';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../../ui/page/PageSlice';
import { CoinSearch } from './search/CoinSearch';
import { VaultChainCoinOptions } from './search/VaultChainCoinOptions';

export const ManageVaultChainCoinsPage = () => {
  const { t } = useTranslation();

  return (
    <CurrentSearchProvider initialValue="">
      <VStack flexGrow>
        <VStack gap={20}>
          <PageHeader
            primaryControls={<PageHeaderBackButton />}
            title={<PageHeaderTitle>{t('choose_coins')}</PageHeaderTitle>}
          />
          <PageSlice>
            <CoinSearch />
          </PageSlice>
          <div />
        </VStack>
        <ScrollableFlexboxFiller>
          <PageContent>
            <VStack gap={16}>
              <VaultChainCoinOptions />
            </VStack>
          </PageContent>
        </ScrollableFlexboxFiller>
      </VStack>
    </CurrentSearchProvider>
  );
};
