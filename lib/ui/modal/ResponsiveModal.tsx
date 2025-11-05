import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { VStack } from '@lib/ui/layout/Stack'
import {
  mediaQuery,
  useIsTabletDeviceAndUp,
} from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
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
  border-radius: 24px 24px 0 0;
  padding: 32px 20px;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: none;
  }
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

  if (!isOpen) return null

  if (isTabletAndUp) {
    return (
      <DesktopWrapper>
        <Modal
          title={title}
          onClose={onClose}
          placement="center"
          targetWidth={480}
          {...modalProps}
        >
          {children}
        </Modal>
      </DesktopWrapper>
    )
  }

  return (
    <BodyPortal>
      <MobileBackdrop onClick={onClose}>
        <MobileDrawer
          style={containerStyles}
          onClick={e => e.stopPropagation()}
          gap={24}
        >
          {children}
        </MobileDrawer>
      </MobileBackdrop>
    </BodyPortal>
  )
}
