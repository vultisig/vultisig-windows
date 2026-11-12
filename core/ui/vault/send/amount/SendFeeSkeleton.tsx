import { Skeleton } from '@lib/ui/loaders/Skeleton'
import styled from 'styled-components'

/** Two bars standing in for a fee and its fiat value while it loads. */
export const SendFeeSkeleton = () => (
  <Container aria-hidden>
    <Skeleton width="72px" height="12px" />
    <Skeleton width="44px" height="10px" />
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`
