import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { ReviewConnector } from '../../../../mpc/keysign/review/ReviewConnector'

const Container = styled(HStack)`
  position: relative;
  gap: 8px;
  align-items: stretch;
`

type SwapReviewCardsProps = {
  from: ReactNode
  to: ReactNode
}

/** The two sides of the trade, joined by an arrow. */
export const SwapReviewCards = ({ from, to }: SwapReviewCardsProps) => (
  <Container>
    {from}
    <ReviewConnector>
      <ChevronRightIcon />
    </ReviewConnector>
    {to}
  </Container>
)
