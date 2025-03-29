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
  variant?: 'rectangular' | 'circular'
  height?: string
  width?: string
  borderRadius?: string
}>`
  background-color: ${({ fill }) =>
    fill ? getColor(fill) : 'rgba(255, 255, 255, 0.05)'};
  ${({ variant = 'rectangular' }) =>
    variant === 'circular' ? 'border-radius: 50%' : ''};
  animation: ${skeletonAnimation} 1.5s ease-in-out 0.5s infinite;
  height: ${({ height }) => height ?? '100%'};
  width: ${({ width }) => width ?? '100%'};
  border-radius: ${({ borderRadius }) => borderRadius ?? '4px'};
`
