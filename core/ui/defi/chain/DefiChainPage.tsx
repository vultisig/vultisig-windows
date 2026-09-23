import { RefreshDefiData } from '@core/ui/defi/RefreshDefiData'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Chain } from '@vultisig/core-chain/Chain'
import { ComponentType } from 'react'
import styled from 'styled-components'

import { DefiChainBalanceBanner } from './DefiChainBalanceBanner'
import { DefiChainTabs } from './tabs/DefiChainTabs'
import { TronDefiDashboard } from './tron/TronDefiDashboard'
import { useCurrentDefiChain } from './useCurrentDefiChain'

const defiChainContent: Partial<Record<Chain, ComponentType>> = {
  [Chain.Tron]: TronDefiDashboard,
}

export const DefiChainPage = () => {
  const chain = useCurrentDefiChain()
  const Content = defiChainContent[chain]

  return (
    <Wrapper
      data-testid="DefiChainPage-Wrapper"
      justifyContent="space-between"
      flexGrow
    >
      <VStack flexGrow>
        <PageHeader
          hasBorder
          primaryControls={<PageHeaderBackButton />}
          secondaryControls={<RefreshDefiData />}
        />
        <StyledPageContent scrollable gap={24} flexGrow>
          <DefiChainBalanceBanner />
          {Content ? <Content /> : <DefiChainTabs />}
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
