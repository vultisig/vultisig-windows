import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

type Border = 'solid' | 'gradient'
type Radius = number | string

const StyledBorder = styled.div<{ radius?: Radius }>`
  background-image: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.success.toRgba(0.5)} 0%,
    ${({ theme }) => theme.colors.success.getVariant({ l: () => 19 }).toRgba(0)}
      100%
  );
  ${({ radius = 16 }) => css`
    border-radius: ${toSizeUnit(radius)};
  `}
  padding: 1px;
`

const StyledList = styled.div<{ border?: Border; radius?: Radius }>`
  background-image: linear-gradient(
    90deg,
    ${getColor('foreground')} 0%,
    ${getColor('foregroundExtra')} 49.5%,
    ${getColor('foreground')} 100%
  );
  ${({ border }) => {
    return (
      border === 'solid' &&
      css`
        border: solid 1px ${getColor('foregroundExtra')};
      `
    )
  }}
  ${({ radius = 16 }) => css`
    border-radius: ${toSizeUnit(radius)};
  `}
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
`

type ListProps = {
  border?: Border
  radius?: Radius
} & Pick<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'style'>

export const List: FC<ListProps> = ({ border, children, radius, ...rest }) => {
  return border === 'gradient' ? (
    <StyledBorder radius={radius}>
      <StyledList radius={radius} {...rest}>
        {children}
      </StyledList>
    </StyledBorder>
  ) : (
    <StyledList border={border} radius={radius} {...rest}>
      {children}
    </StyledList>
  )
}
