import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { RefObject } from 'react'
import styled from 'styled-components'

import { DefiPortfolioBalance } from './DefiPortfolioBalance'
import { DefiPortfolioList } from './DefiPortfolioList'

type DefiOverviewProps = {
  scrollContainerRef: RefObject<HTMLDivElement>
}

export const DefiOverview = ({ scrollContainerRef }: DefiOverviewProps) => {
  return (
    <VStack fullHeight>
      <StyledPageContent ref={scrollContainerRef} scrollable gap={24} flexGrow>
        <DefiPortfolioBalance />
        <DefiPortfolioList />
      </StyledPageContent>
    </VStack>
  )
}

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
`
