import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const StyledComponent = styled.div<{ flex?: boolean; gap: number }>`
  flex-grow: 1;
  overflow-x: hidden;
  padding: ${pxToRem(24)};
  position: relative;
  width: 100%;
  ${({ flex, gap }) => {
    return flex
      ? css`
          display: flex;
          flex-direction: column;
          gap: ${pxToRem(gap)};

          > * {
            flex: none;
          }
        `
      : css``
  }}
`

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  flex?: boolean
  gap?: number
}

const Component: FC<ComponentProps> = ({ children, gap = 0, ...rest }) => {
  return (
    <StyledComponent gap={gap} {...rest}>
      {children}
    </StyledComponent>
  )
}

export { Component as Content }
