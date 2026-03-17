import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { VStack } from '@lib/ui/layout/Stack'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode, useId, useRef } from 'react'
import styled from 'styled-components'

type PromptSheetProps = OnCloseProp & {
  icon: ReactNode
  title: ReactNode
  description: ReactNode
  actions: ReactNode
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;

  @media ${mediaQuery.mobileDeviceAndUp} {
    align-items: center;
  }
`

const Card = styled(VStack)`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
  border-radius: 34px;
  box-shadow: 0px 15px 75px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  width: 100%;

  @media ${mediaQuery.mobileDeviceAndUp} {
    max-width: 328px;
  }
`

const ContentArea = styled(VStack)`
  padding: 32px 16px 24px;
`

/** Circular badge with a visible border ring and a subtle bottom glow. */
export const PromptSheetIcon = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: ${getColor('background')};
  border: 1px solid ${getColor('foregroundSuperContrast')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 8px;
    background: ${getColor('buttonPrimary')};
    filter: blur(9px);
  }
`

/**
 * Responsive prompt overlay that renders as a bottom sheet on mobile
 * and a centered dialog on larger screens. The visual card is identical
 * in both modes — only the positioning changes.
 */
export const PromptSheet = ({
  icon,
  title,
  description,
  actions,
  onClose,
}: PromptSheetProps) => {
  useKeyDown('Escape', onClose)
  const titleId = useId()
  const isPointerDownOnBackdrop = useRef(false)

  return (
    <BodyPortal>
      <Overlay
        onPointerDown={({ target, currentTarget }) => {
          if (target === currentTarget) {
            isPointerDownOnBackdrop.current = true
          }
        }}
        onPointerUp={() => {
          if (isPointerDownOnBackdrop.current) {
            onClose()
          }
          isPointerDownOnBackdrop.current = false
        }}
        onPointerCancel={() => {
          isPointerDownOnBackdrop.current = false
        }}
      >
        <Card role="dialog" aria-modal aria-labelledby={titleId}>
          <ContentArea gap={32} alignItems="center">
            {icon}
            <VStack gap={12} fullWidth alignItems="center" padding="0 12px">
              <div id={titleId}>{title}</div>
              {description}
            </VStack>
            {actions}
          </ContentArea>
        </Card>
      </Overlay>
    </BodyPortal>
  )
}
