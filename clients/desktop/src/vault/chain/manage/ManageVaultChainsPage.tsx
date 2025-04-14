import { useScrollTo } from '@lib/ui/hooks/useScrollTo'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { useTranslation } from 'react-i18next'

import { ScrollableFlexboxFiller } from '../../../lib/ui/layout/ScrollableFlexboxFiller'
import { CurrentSearchProvider } from '../../../lib/ui/search/CurrentSearchProvider'
import { CoinSearch } from './coin/search/CoinSearch'
import ManageVaultChainsList from './ManageVaultChainsList'

export const ManageVaultChainsPage = () => {
  const { t } = useTranslation()
  useScrollTo()

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
  )
}
