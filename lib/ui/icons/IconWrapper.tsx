import styled from 'styled-components'

import { ThemeColors } from '../theme/ThemeColors'

export const IconWrapper = styled.span<{
  size?: number
  color?: keyof ThemeColors
}>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  width: fit-content;
  height: fit-content;
  overflow: hidden;
  flex-shrink: 0;
  ${({ size }) => size && `font-size: ${size}px;`}
  color: ${({ color, theme }) => color && theme.colors[color].toCssValue()};
`
