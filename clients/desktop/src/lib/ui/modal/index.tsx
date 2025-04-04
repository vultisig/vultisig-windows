import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { AsProp, TitleProp } from '@lib/ui/props'
import { ComponentProps, ReactNode } from 'react'
import styled from 'styled-components'

import { BodyPortal } from '../dom/BodyPortal'
import { Backdrop } from './Backdrop'
import { modalConfig } from './config'
import { ModalCloseButton } from './ModalCloseButton'
import { ModalContainer, ModalPlacement } from './ModalContainer'
import { ModalContent } from './ModalContent'
import { ModalSubTitleText } from './ModalSubTitleText'
import { ModalTitleText } from './ModalTitleText'

type ModalProps = AsProp &
  Omit<ComponentProps<typeof Container>, 'title'> &
  TitleProp & {
    onClose?: () => void
    subTitle?: ReactNode
    placement?: ModalPlacement
    footer?: ReactNode
    targetWidth?: number
    titleAlign?: 'left' | 'center' | 'right'
    withDefaultStructure?: boolean
  }

const contentVerticalPadding = 8

const Container = styled(ModalContainer)`
  > * {
    padding: ${toSizeUnit(modalConfig.padding)};
  }

  > *:nth-child(2) {
    padding-top: ${toSizeUnit(contentVerticalPadding)};
  }

  > *:not(:first-child):not(:last-child) {
    padding-bottom: ${toSizeUnit(contentVerticalPadding)};
  }
`

export const Modal = ({
  title,
  children,
  onClose,
  footer,
  subTitle,
  as,
  withDefaultStructure = true,
  ...rest
}: ModalProps) => {
  return (
    <BodyPortal>
      <Backdrop onClose={onClose}>
        {withDefaultStructure ? (
          <Container forwardedAs={as} {...rest}>
            <VStack gap={8}>
              <HStack
                alignItems="start"
                justifyContent="space-between"
                gap={16}
              >
                <ModalTitleText>{title}</ModalTitleText>
                {onClose && <ModalCloseButton onClick={onClose} />}
              </HStack>
              {subTitle && <ModalSubTitleText>{subTitle}</ModalSubTitleText>}
            </VStack>
            <ModalContent>{children}</ModalContent>
            {footer && <VStack>{footer}</VStack>}
          </Container>
        ) : (
          children
        )}
      </Backdrop>
    </BodyPortal>
  )
}
