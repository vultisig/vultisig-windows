import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const AgentCardIcon = styled.div<{ $size?: number }>`
  ${({ $size = 36 }) => sameDimensions($size)}
  border-radius: 50%;
  ${centerContent}
  background: ${getColor('foregroundExtra')};
  flex-shrink: 0;
  font-size: ${({ $size = 36 }) => Math.round($size * 0.5)}px;
`
