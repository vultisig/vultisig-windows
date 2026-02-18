import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ExplorerLink = styled.a`
  font-size: 11px;
  font-family: monospace;
  color: ${getColor('primary')};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`
