import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const StyledContent = styled.div<{ flex?: boolean; gap: number }>`
  flex-grow: 1;
  overflow-x: hidden;
  padding: ${pxToRem(16)};
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

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  flex?: boolean
  gap?: number
}

export const Content: FC<ContentProps> = ({ children, gap = 0, ...rest }) => {
  return (
    <StyledContent gap={gap} {...rest}>
      {children}
    </StyledContent>
  )
}
