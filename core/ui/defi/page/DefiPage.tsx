import { CircleView } from '@core/ui/defi/protocols/circle/CircleView'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { useRef } from 'react'
import styled from 'styled-components'

import {
  BottomNavigation,
  bottomNavigationHeight,
} from '../../vault/components/BottomNavigation'
import { DefiOverview } from './components/DefiOverview'
import { DefiPageHeader } from './components/DefiPageHeader'

export const DefiPage = () => {
  const vault = useCurrentVault()
  const scrollContainerRef = useRef<HTMLDivElement>(null!)
  const [{ protocol }] = useCoreViewState<'defi'>()

  return (
    <Wrapper justifyContent="space-between" flexGrow>
      <VStack flexGrow>
        {protocol === 'circle' ? (
          <CircleView />
        ) : (
          <>
            <DefiPageHeader
              vault={vault}
              scrollContainerRef={scrollContainerRef}
            />
            <DefiOverview scrollContainerRef={scrollContainerRef} />
          </>
        )}
      </VStack>
      <BottomNavigation activeTab="defi" />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  margin-bottom: ${bottomNavigationHeight}px;

  @media (min-width: 768px) {
    margin-bottom: 75px;
  }
`
