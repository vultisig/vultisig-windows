import { getColor } from '@lib/ui/theme/getters'
import { rem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const StyledList = styled.div<{ bordered?: boolean }>`
  background-color: ${getColor('borderLight')};
  border-radius: ${rem(12)};
  display: flex;
  flex-direction: column;
  gap: ${rem(1)};
  overflow: hidden;
  ${({ bordered }) => {
    return bordered
      ? css`
          border: solid ${rem(1)} ${getColor('borderLight')};
        `
      : css``
  }}
`

interface ListProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export const List: FC<ListProps> = ({ children, ...rest }) => {
  return <StyledList {...rest}>{children}</StyledList>
}
