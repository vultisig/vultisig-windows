import { getColor } from '@lib/ui/theme/getters'
import { css } from 'styled-components'

export const agentCard = css`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('mist')};
  transition: all 0.15s ease;
`

export const agentCardInteractiveHover = css`
  &:hover {
    background: ${getColor('foregroundExtra')};
    border-color: ${getColor('primary')};
  }
`
