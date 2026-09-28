import { KeyboardEvent, ReactNode, useId, useRef } from 'react'
import FocusLock from 'react-focus-lock'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { UnstyledButton } from '../buttons/UnstyledButton'
import { borderRadius, borderRadiusPx } from '../css/borderRadius'
import { centerContent } from '../css/centerContent'
import { sameDimensions } from '../css/sameDimensions'
import { BodyPortal } from '../dom/BodyPortal'
import { CrossIcon } from '../icons/CrossIcon'
import { HStack, VStack } from '../layout/Stack'
import { OnCloseProp, TitleProp } from '../props'
import { text } from '../text'
import { getColor } from '../theme/getters'

/**
 * The sheet is edge-to-edge, but a phone-sized layout stretched across a
 * maximised desktop window reads badly, so it stops growing here and centres
 * instead. Comfortably wider than both the extension popup and the design's
 * phone frame.
 */
const maxWidth = 480

const contentInset = 24
const headerControlSize = 32

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
`

const Card = styled(FocusLock)`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${maxWidth}px;
  max-height: 100%;
  min-height: 0;
  padding: 7px ${contentInset}px 32px;
  gap: 28px;
  border-radius: ${borderRadiusPx.xl}px ${borderRadiusPx.xl}px 0 0;
  background: ${getColor('foreground')};
  box-shadow:
    inset 0 0 0 1px ${({ theme }) => theme.colors.white.toRgba(0.03)},
    0 15px 75px rgba(0, 0, 0, 0.18);
  overscroll-behavior: contain;
`

const Header = styled(VStack)`
  flex-shrink: 0;
`

const Grabber = styled.div`
  align-self: center;
  width: 36px;
  height: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
  ${borderRadius.pill};
  background: ${getColor('foregroundSuper')};
`

const HeaderRow = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: ${headerControlSize}px;
`

const HeaderSlot = styled.div`
  ${sameDimensions(headerControlSize)};
  ${centerContent};
  flex-shrink: 0;
`

const Title = styled.h2`
  ${text({
    variant: 'title3',
    color: 'contrast',
    centerHorizontally: true,
    cropped: true,
  })}
  flex: 1;
  min-width: 0;
  margin: 0;
`

const CloseButton = styled(UnstyledButton)`
  ${sameDimensions(headerControlSize)};
  ${centerContent};
  ${borderRadius.pill};
  font-size: 16px;
  color: ${getColor('textShyExtra')};
  background: ${({ theme }) => theme.colors.contrast.toRgba(0.12)};
  transition: color 0.2s;

  &:hover {
    color: ${getColor('contrast')};
  }
`

const Body = styled(VStack)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
`

const Footer = styled(VStack)`
  flex-shrink: 0;
`

type SheetProps = OnCloseProp &
  TitleProp & {
    /** Sits in the header's leading slot, opposite the close button. */
    leading?: ReactNode
    children: ReactNode
    /** Pinned under the scrolling body. */
    footer?: ReactNode
  }

/**
 * A sheet rising from the bottom of the screen it was opened from, which stays
 * visible (dimmed) behind it. It meets the left, right and bottom edges of the
 * window and rounds only its top corners, up to `maxWidth`, beyond which it
 * centres. Escape and the backdrop close it, and the body scrolls on its own so
 * the header and footer stay put.
 */
export const Sheet = ({
  title,
  leading,
  children,
  footer,
  onClose,
}: SheetProps) => {
  const { t } = useTranslation()
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
        onPointerUp={({ target, currentTarget }) => {
          if (isPointerDownOnBackdrop.current && target === currentTarget) {
            onClose()
          }
          isPointerDownOnBackdrop.current = false
        }}
        onPointerCancel={() => {
          isPointerDownOnBackdrop.current = false
        }}
      >
        <Card
          returnFocus
          lockProps={{
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': titleId,
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key !== 'Escape') return

              // A dialog opened inside the sheet (the fast-vault password
              // prompt) owns Escape while it is up; the sheet only closes
              // when it is the innermost dialog the key was pressed in.
              const dialog =
                event.target instanceof Element
                  ? event.target.closest('[role="dialog"]')
                  : null
              if (dialog === event.currentTarget) {
                onClose()
              }
            },
          }}
        >
          <Header>
            <Grabber />
            <HeaderRow>
              <HeaderSlot>{leading}</HeaderSlot>
              <Title id={titleId}>{title}</Title>
              <HeaderSlot>
                <CloseButton
                  data-testid="sheet-close-button"
                  aria-label={t('close')}
                  onClick={onClose}
                >
                  <CrossIcon />
                </CloseButton>
              </HeaderSlot>
            </HeaderRow>
          </Header>
          <Body gap={20}>{children}</Body>
          {footer && <Footer gap={20}>{footer}</Footer>}
        </Card>
      </Overlay>
    </BodyPortal>
  )
}
