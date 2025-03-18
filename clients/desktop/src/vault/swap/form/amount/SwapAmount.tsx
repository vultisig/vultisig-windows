import styled from 'styled-components'

import { vStack } from '../../../../lib/ui/layout/Stack'
import { ReverseSwap } from '../ReverseSwap'

const Container = styled.div`
  ${vStack({ gap: 8 })}
  position: relative;
`

export const SwapAmount = () => {
  return (
    <Container>
      <ReverseSwap />
    </Container>
  )
}
