import styled from 'styled-components'

import { toSizeUnit } from '../css/toSizeUnit'
import { getColor } from '../theme/getters'
import { VStack } from './Stack'

export const SeparatedByLine = styled(VStack)`
  > *:not(:last-child) {
    border-bottom: 1px solid ${getColor('foregroundExtra')};
    padding-bottom: ${({ gap = 0 }) => toSizeUnit(gap)};
  }
`
