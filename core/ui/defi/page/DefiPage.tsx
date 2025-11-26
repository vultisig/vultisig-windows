import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { useRef } from 'react'
import styled from 'styled-components'

import {
  BottomNavigation,
  mobileBottomNavigationHeight,
} from '../../vault/components/BottomNavigation'
import { DefiOverview } from './components/DefiOverview'
import { DefiPageHeader } from './components/DefiPageHeader'

export const DefiPage = () => {
  const vault = useCurrentVault()
  const scrollContainerRef = useRef<HTMLDivElement>(null!)

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
  margin-bottom: ${mobileBottomNavigationHeight}px;

  @media (min-width: 768px) {
    margin-bottom: 75px;
  }
`
