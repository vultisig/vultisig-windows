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
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px;
`
