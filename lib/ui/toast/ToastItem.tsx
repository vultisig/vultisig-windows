import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { round } from '@lib/ui/css/round'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled, { keyframes } from 'styled-components'

import { hStack } from '../layout/Stack'

const appearFromBottom = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`

const pageBottomInset = `var(${pageBottomInsetVar}, 0px)`

const Position = styled.div`
  position: fixed;
  bottom: calc(60px + ${pageBottomInset});
  padding-inline: 20px;
  right: 0;
  left: 0;
  z-index: 1100;
  animation: ${appearFromBottom} 0.5s ease-out;

  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    bottom: calc(60px + ${pageBottomInset} + env(safe-area-inset-bottom));
  }

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
    <BodyPortal>
      <Position>
        <Container>{children}</Container>
      </Position>
    </BodyPortal>
  )
}
