import { useScrollTo } from '@lib/ui/hooks/useScrollTo'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { useTranslation } from 'react-i18next'

import { ScrollableFlexboxFiller } from '../../../../lib/ui/layout/ScrollableFlexboxFiller'
import { CurrentSearchProvider } from '../../../../lib/ui/search/CurrentSearchProvider'
import { CoinSearch } from './search/CoinSearch'
import { VaultChainCoinOptions } from './search/VaultChainCoinOptions'

export const ManageVaultChainCoinsPage = () => {
  const { t } = useTranslation()
  useScrollTo()

  return (
    <CurrentSearchProvider initialValue="">
      <VStack flexGrow>
        <VStack gap={20}>
          <PageHeader
            primaryControls={<PageHeaderBackButton />}
            title={<PageHeaderTitle>{t('choose_tokens')}</PageHeaderTitle>}
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
  )
}
