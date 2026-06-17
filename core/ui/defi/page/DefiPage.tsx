import { CircleView } from '@core/ui/defi/protocols/circle/CircleView'
import { DefiProtocol } from '@core/ui/defi/protocols/core'
import { VultStakingView } from '@core/ui/defi/protocols/vultStaking/VultStakingView'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { ComponentType, useRef } from 'react'
import styled from 'styled-components'

import { BottomNavigation } from '../../vault/components/BottomNavigation'
import { DefiOverview } from './components/DefiOverview'
import { DefiPageHeader } from './components/DefiPageHeader'

const protocolViews: Record<DefiProtocol, ComponentType> = {
  circle: CircleView,
  vultStaking: VultStakingView,
}

export const DefiPage = () => {
  const vault = useCurrentVault()
  const scrollContainerRef = useRef<HTMLDivElement>(null!)
  const [{ protocol }] = useCoreViewState<'defi'>()

  const ProtocolView = protocol ? protocolViews[protocol] : null

  // Protocol pages (Circle, VULT staking) are full-screen pushed views with their
  // own back button, so they omit the DeFi bottom navigation — only the portfolio
  // overview shows it.
  if (ProtocolView) {
    return (
      <Wrapper flexGrow>
        <ProtocolView />
      </Wrapper>
    )
  }

  return (
    <Wrapper justifyContent="space-between" flexGrow>
      <VStack flexGrow>
        <DefiPageHeader vault={vault} scrollContainerRef={scrollContainerRef} />
        <DefiOverview scrollContainerRef={scrollContainerRef} />
      </VStack>
      <BottomNavigation activeTab="defi" />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
`
