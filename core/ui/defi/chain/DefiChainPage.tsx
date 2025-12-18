import { Chain } from '@core/chain/Chain'
import { featureFlags } from '@core/ui/featureFlags'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { useEffect } from 'react'
import styled from 'styled-components'

import { DefiChainBalanceBanner } from './DefiChainBalanceBanner'
import { DefiChainTabs } from './tabs/DefiChainTabs'
import { useCurrentDefiChain } from './useCurrentDefiChain'

export const DefiChainPage = () => {
  const chain = useCurrentDefiChain()
  const navigate = useCoreNavigate()

  useEffect(() => {
    if (chain === Chain.MayaChain && !featureFlags.mayaChainDefi) {
      navigate({ id: 'defi', state: {} })
    }
  }, [chain, navigate])

  if (chain === Chain.MayaChain && !featureFlags.mayaChainDefi) {
    return null
  }

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
