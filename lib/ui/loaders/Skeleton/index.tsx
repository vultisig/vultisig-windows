import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColors } from '@lib/ui/theme/ThemeColors'
import { keyframes } from 'styled-components'
import styled from 'styled-components'

const skeletonAnimation = keyframes`
  0% {
    opacity:1;
  }
  
  50%{
    opacity:0.4;
  }
  
  100%{
    opacity:1;
  }
`

export const Skeleton = styled.div<{
  fill?: keyof ThemeColors
  height?: string
  width?: string
  borderRadius?: string
}>`
  background-color: ${({ fill }) =>
    fill ? getColor(fill) : 'rgba(255, 255, 255, 0.05)'};
  animation: ${skeletonAnimation} 1.5s ease-in-out 0.5s infinite;
  height: ${({ height }) => height ?? '100%'};
  width: ${({ width }) => width ?? '100%'};
  border-radius: ${({ borderRadius }) =>
    borderRadius ?? `${borderRadiusPx.xs}px`};
`
