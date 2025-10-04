import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

const StyledList = styled.div<{ bordered?: boolean }>`
  background-image: linear-gradient(
    90deg,
    ${getColor('foreground')} 0%,
    ${getColor('foregroundExtra')} 49.5%,
    ${getColor('foreground')} 100%
  );
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  ${({ bordered }) => {
    return (
      bordered &&
      css`
        border: solid 1px ${getColor('foregroundExtra')};
      `
    )
  }}
`

type ListProps = {
  bordered?: boolean
} & Pick<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'style'>

export const List: FC<ListProps> = ({ children, ...rest }) => {
  return <StyledList {...rest}>{children}</StyledList>
}
