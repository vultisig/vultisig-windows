import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { keyframes } from 'styled-components'

const appearFromBottom = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`

const iconPop = keyframes`
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
  animation: ${appearFromBottom} 0.45s ease-out;

  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    bottom: calc(60px + ${pageBottomInset} + env(safe-area-inset-bottom));
  }

  ${hStack({
    justifyContent: 'center',
  })};
`

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  background: ${getColor('foregroundExtra')};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  max-width: min(400px, 100%);
`

const CheckWrap = styled.span`
  display: flex;
  color: ${getColor('success')};
  font-size: 22px;
  animation: ${iconPop} 0.35s ease-out 0.08s both;
`

type KeysignNotificationSentToastProps = {
  message: string
}

export const KeysignNotificationSentToast = ({
  message,
}: KeysignNotificationSentToastProps) => {
  return (
    <BodyPortal>
      <Position>
        <Card
          aria-atomic="true"
          aria-live="polite"
          data-testid="keysign-notification-sent-toast"
          role="status"
        >
          <CheckWrap aria-hidden>
            <CircleCheckIcon />
          </CheckWrap>
          <Text color="contrast" size={14} weight="600">
            {message}
          </Text>
        </Card>
      </Position>
    </BodyPortal>
  )
}
