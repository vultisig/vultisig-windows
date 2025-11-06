import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  BottomNavigation,
  bottomNavigationHeight,
} from '@core/ui/vault/components/BottomNavigation'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import styled from 'styled-components'

import { RefreshVaultBalance } from '../page/balance/RefreshVaultBalance'
import { VaultChainTabs } from './tabs/VaultChainTabs'
import { VaultChainOverview } from './VaultChainOverview'

export const VaultChainPage = () => {
  return (
    <Wrapper
      data-testid="VaultChainPage-Wrapper"
      justifyContent="space-between"
      flexGrow
    >
      <VStack flexGrow>
        <VaultHeader
          primaryControls={<PageHeaderBackButton />}
          showRefresh
          refreshButton={<RefreshVaultBalance />}
        />
        <StyledPageContent scrollable gap={32} flexGrow>
          <VaultChainOverview />
          <VaultChainTabs />
        </StyledPageContent>
      </VStack>
      <BottomNavigation />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  margin-bottom: ${bottomNavigationHeight}px;
`

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
`
