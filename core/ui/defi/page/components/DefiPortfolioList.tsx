import { vStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

import { DefiChainsList } from './DefiChainsList'
import { DefiPortfolioHeader } from './DefiPortfolioHeader'
import { SearchChainProvider } from './state/searchChainProvider'

export const DefiPortfolioList = () => {
  return (
    <SearchChainProvider>
      <Container>
        <DefiPortfolioHeader />
        <DefiChainsList />
      </Container>
    </SearchChainProvider>
  )
}

const Container = styled.div`
  ${vStack({
    gap: 16,
  })};
  padding: 0 20px;
`
