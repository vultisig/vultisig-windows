import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { VStack } from '@lib/ui/layout/Stack'
import {
  mediaQuery,
  useIsTabletDeviceAndUp,
} from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { ReactNode, useRef, useState } from 'react'
import styled from 'styled-components'

import { Modal, ModalProps } from './index'

type ResponsiveModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: ReactNode
  modalProps?: Partial<ModalProps>
  containerStyles?: React.CSSProperties
}

const MobileDrawer = styled(VStack)`
  position: fixed;
  bottom: 0;
  left: 16px;
  right: 16px;
  background: ${getColor('background')};
  max-height: 90vh;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  overscroll-behavior: contain;
  z-index: 1000;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: none;
  }
`

const MobileDrawerHeader = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 0;
  background: ${getColor('background')};
  border-radius: 24px 24px 0 0;
  touch-action: none;
  cursor: grab;
`

const MobileDrawerGrabber = styled.div`
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: ${getColor('foregroundSuper')};
`

const MobileDrawerContent = styled(VStack)`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
`

const MobileBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: none;
  }
`

const DesktopWrapper = styled.div`
  display: none;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: block;
  }
`

export const ResponsiveModal = ({
  isOpen,
  onClose,
  children,
  title,
  modalProps,
  containerStyles,
}: ResponsiveModalProps) => {
  const isTabletAndUp = useIsTabletDeviceAndUp()
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const drawerContentRef = useRef<HTMLDivElement | null>(null)
  const dragStartYRef = useRef<number | null>(null)
  const [translateY, setTranslateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (!isOpen) return null

  if (isTabletAndUp) {
    return (
      <DesktopWrapper>
        <Modal
          title={title}
          onClose={onClose}
          placement="center"
          targetWidth={480}
          style={containerStyles}
          {...modalProps}
        >
          {children}
        </Modal>
      </DesktopWrapper>
    )
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const drawerContent = shouldBePresent(
      drawerContentRef.current,
      'ResponsiveModal MobileDrawerContent'
    )
    if (drawerContent.scrollTop !== 0) return

    dragStartYRef.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const dragStartY = shouldBePresent(
      dragStartYRef.current,
      'ResponsiveModal dragStartY'
    )

    const nextTranslateY = Math.max(0, event.clientY - dragStartY)
    setTranslateY(nextTranslateY)
  }

  const handlePointerEnd = () => {
    if (!isDragging) return

    const drawer = shouldBePresent(
      drawerRef.current,
      'ResponsiveModal MobileDrawer'
    )
    const drawerHeight = drawer.getBoundingClientRect().height
    const closeThreshold = Math.max(120, drawerHeight * 0.25)

    dragStartYRef.current = null
    setIsDragging(false)

    if (translateY > closeThreshold) {
      onClose()
      return
    }

    setTranslateY(0)
  }

  return (
    <BodyPortal>
      <MobileBackdrop onClick={onClose}>
        <MobileDrawer
          ref={drawerRef}
          style={{
            transform: `translate3d(0, ${translateY}px, 0)`,
            transition: isDragging ? 'none' : 'transform 180ms ease',
            willChange: 'transform',
          }}
          onClick={e => e.stopPropagation()}
          gap={0}
        >
          <MobileDrawerHeader
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <MobileDrawerGrabber />
          </MobileDrawerHeader>
          <MobileDrawerContent
            ref={drawerContentRef}
            style={containerStyles}
            gap={24}
          >
            {children}
          </MobileDrawerContent>
        </MobileDrawer>
      </MobileBackdrop>
    </BodyPortal>
  )
}
