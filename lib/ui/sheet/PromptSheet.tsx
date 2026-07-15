import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode, useId, useRef } from 'react'
import styled from 'styled-components'

type PromptSheetProps = OnCloseProp & {
  eyebrow?: ReactNode
  icon: ReactNode
  title: ReactNode
  description: ReactNode
  actions: ReactNode
  isDismissable?: boolean
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;

  @media ${mediaQuery.tabletDeviceAndUp} {
    align-items: center;
    padding: 16px;
  }
`

const Card = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-bottom: 0;
  border-radius: 34px 34px 0 0;
  box-shadow: 0px 15px 75px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  width: 100%;
  max-height: 100dvh;

  @media ${mediaQuery.tabletDeviceAndUp} {
    border-bottom: 1px solid ${getColor('foregroundExtra')};
    border-radius: 34px;
    max-width: 380px;
    max-height: calc(100dvh - 32px);
  }
`

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 48px 16px calc(32px + env(safe-area-inset-bottom));

  @media ${mediaQuery.tabletDeviceAndUp} {
    padding: 32px 16px 24px;
  }
`

const Grabber = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: ${getColor('foregroundSuper')};

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: none;
  }
`

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
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
  eyebrow,
  icon,
  title,
  description,
  actions,
  isDismissable = true,
  onClose,
}: PromptSheetProps) => {
  useKeyDown('Escape', onClose, { isEnabled: isDismissable })
  const titleId = useId()
  const isPointerDownOnBackdrop = useRef(false)

  return (
    <BodyPortal>
      <Overlay
        onPointerDown={({ target, currentTarget }) => {
          if (isDismissable && target === currentTarget) {
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
          <Grabber />
          <ContentArea>
            {eyebrow}
            {icon}
            <TextContent>
              <div id={titleId}>{title}</div>
              {description}
            </TextContent>
            {actions}
          </ContentArea>
        </Card>
      </Overlay>
    </BodyPortal>
  )
}
