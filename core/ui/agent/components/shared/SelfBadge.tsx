import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const SelfBadge = styled.div`
  padding: 1px 5px;
  border-radius: 4px;
  background: ${getColor('primary')}20;
  color: ${getColor('primary')};
`
