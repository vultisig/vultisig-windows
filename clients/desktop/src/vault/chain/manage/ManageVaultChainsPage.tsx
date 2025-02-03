import { useTranslation } from 'react-i18next';

import { ScrollableFlexboxFiller } from '../../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../../lib/ui/layout/Stack';
import { CurrentSearchProvider } from '../../../lib/ui/search/CurrentSearchProvider';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { CoinSearch } from './coin/search/CoinSearch';
import ManageVaultChainsList from './ManageVaultChainsList';

export const ManageVaultChainsPage = () => {
  const { t } = useTranslation();

  return (
    <CurrentSearchProvider initialValue="">
      <VStack flexGrow>
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={<PageHeaderTitle>{t('choose_chains')}</PageHeaderTitle>}
        />
        <ScrollableFlexboxFiller>
          <PageContent>
            <VStack gap={16} data-testid="ManageVaultChainsPage-ChainsWrapper">
              <CoinSearch />
              <ManageVaultChainsList />
            </VStack>
          </PageContent>
        </ScrollableFlexboxFiller>
      </VStack>
    </CurrentSearchProvider>
  );
};
