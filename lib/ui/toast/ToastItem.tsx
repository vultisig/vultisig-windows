import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { round } from '@lib/ui/css/round'
import { ChildrenProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled, { keyframes } from 'styled-components'

import { hStack } from '../layout/Stack'

const appearFromBottom = keyframes`
  from {
    transform: translateX(-50%) translateY(100%);
  }
  to {
    transform: translateX(-50%) translateY(0);
  }
`

const Position = styled.div`
  position: fixed;
  bottom: 60px;
  padding-inline: 20px;
  right: 0;
  left: 0;
  animation: ${appearFromBottom} 0.5s ease-out;

  ${hStack({
    justifyContent: 'center',
  })};
`

const Container = styled.div`
  ${round};
  padding: 8px 12px;
  ${horizontalPadding(20)};
  background: ${getColor('foregroundExtra')};
  ${centerContent};
  font-weight: 600;
  color: ${getColor('contrast')};

  overflow-x: auto;
`

export const ToastItem = ({ children }: ChildrenProp) => {
  return (
    <Position>
      <Container>{children}</Container>
    </Position>
  )
}
