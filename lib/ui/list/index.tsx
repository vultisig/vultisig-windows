import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const StyledList = styled.div<{ bordered?: boolean }>`
  background-color: ${getColor('foregroundExtra')};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  ${({ bordered }) => {
    return bordered
      ? css`
          border: solid 1px ${getColor('foregroundExtra')};
        `
      : css``
  }}
`

type ListProps = {
  bordered?: boolean
} & Pick<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'style'>

export const List: FC<ListProps> = ({ children, ...rest }) => {
  return <StyledList {...rest}>{children}</StyledList>
}
