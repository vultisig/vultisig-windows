import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

type Border = 'solid' | 'gradient'

const StyledBorder = styled.div`
  background-image: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.success.toRgba(0.5)} 0%,
    ${({ theme }) => theme.colors.success.getVariant({ l: () => 19 }).toRgba(0)}
      100%
  );
  border-radius: 12px;
  padding: 1px;
`

const StyledList = styled.div<{ border?: Border }>`
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
  ${({ border }) => {
    return (
      border === 'solid' &&
      css`
        border: solid 1px ${getColor('foregroundExtra')};
      `
    )
  }}
`

type ListProps = {
  border?: Border
} & Pick<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'style'>

export const List: FC<ListProps> = ({ border, children, ...rest }) => {
  return border === 'gradient' ? (
    <StyledBorder>
      <StyledList {...rest}>{children}</StyledList>
    </StyledBorder>
  ) : (
    <StyledList border={border} {...rest}>
      {children}
    </StyledList>
  )
}
