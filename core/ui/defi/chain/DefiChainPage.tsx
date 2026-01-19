import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import styled from 'styled-components'

import { DefiChainBalanceBanner } from './DefiChainBalanceBanner'
import { DefiChainTabs } from './tabs/DefiChainTabs'

export const DefiChainPage = () => {
  return (
    <Wrapper
      data-testid="DefiChainPage-Wrapper"
      justifyContent="space-between"
      flexGrow
    >
      <VStack flexGrow>
        <VaultHeader primaryControls={<PageHeaderBackButton />} />
        <StyledPageContent scrollable gap={24} flexGrow>
          <DefiChainBalanceBanner />
          <DefiChainTabs />
        </StyledPageContent>
      </VStack>
      <BottomNavigation activeTab="defi" isActiveTabRoot={false} />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
`

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
`
