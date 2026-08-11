import { borderRadius } from '@lib/ui/css/borderRadius'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { ChildrenProp, ValueProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { keyframes } from 'styled-components'

import { hStack, vStack } from '../layout/Stack'
import { ToastStatus } from './ToastStatus'
import { ToastStatusIcon } from './ToastStatusIcon'

type ToastItemProps = ChildrenProp &
  ValueProp<ToastStatus> & {
    duration: number
  }

/**
 * Bottom-anchored toast card. Its status ring fills over `duration`, so the
 * ring completing shows the user the toast is about to dismiss.
 */
export const ToastItem = ({ value, duration, children }: ToastItemProps) => {
  return (
    <BodyPortal>
      <Position>
        <Card aria-atomic="true" aria-live="polite" role="status">
          <ToastStatusIcon duration={duration} value={value} />
          <Text color="contrast" size={13}>
            {children}
          </Text>
        </Card>
      </Position>
    </BodyPortal>
  )
}

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

const Card = styled.div`
  ${vStack({
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  })};

  width: 100%;
  padding: 16px;
  ${borderRadius.xl};
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foregroundExtra')};
  text-align: center;
  overflow-wrap: anywhere;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 340px;
  }
`
