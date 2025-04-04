import { borderRadius } from '@lib/ui/css/borderRadius'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { useIsScreenWidthLessThan } from '@lib/ui/hooks/useIsScreenWidthLessThan'
import { vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentPropsWithoutRef, ElementType } from 'react'
import FocusLock from 'react-focus-lock'
import styled, { css } from 'styled-components'

import { modalConfig } from './config'

export type ModalPlacement = 'top' | 'center'

type ContainerProps = {
  width?: number
  placement: ModalPlacement
}

const offset = 40

const Container = styled(FocusLock)<ContainerProps>`
  ${vStack()};

  max-height: 100%;
  background: ${getColor('background')};

  ${({ width, placement }) =>
    width
      ? css`
          width: ${toSizeUnit(width)};
          ${borderRadius.m};
          max-height: calc(100% - ${toSizeUnit(offset * 2)});
          ${placement === 'top' &&
          css`
            align-self: start;
            margin-top: ${toSizeUnit(offset)};
          `}
        `
      : takeWholeSpace};

  border: 1px solid ${getColor('mistExtra')};
  overflow: hidden;
`

type ModalContainerProps = {
  targetWidth?: number
  placement?: ModalPlacement
  as?: ElementType
} & Omit<
  ComponentPropsWithoutRef<ElementType>,
  keyof ContainerProps | 'as' | 'width' | 'placement'
>

export const ModalContainer = ({
  targetWidth = 400,
  placement = 'center',
  as,
  ...props
}: ModalContainerProps) => {
  const isFullScreen = useIsScreenWidthLessThan(
    targetWidth + modalConfig.minHorizontalFreeSpaceForMist
  )

  return (
    <Container
      returnFocus
      as={as}
      width={isFullScreen ? undefined : targetWidth}
      placement={placement}
      {...props}
    />
  )
}
