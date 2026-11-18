import { RefreshDefiData } from '@core/ui/defi/RefreshDefiData'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { isSupportedDefiChain } from '@core/ui/storage/defiChains'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Chain } from '@vultisig/core-chain/Chain'
import { ComponentType, useEffect } from 'react'
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
  const navigate = useCoreNavigate()
  const isSupported = isSupportedDefiChain(chain)

  // A restored view (e.g. the extension's persisted view) can point at a chain
  // that is no longer offered in DeFi, like QBTC behind the qbtcDefi flag
  useEffect(() => {
    if (!isSupported) navigate({ id: 'defi', state: {} }, { replace: true })
  }, [isSupported, navigate])

  if (!isSupported) return null

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
