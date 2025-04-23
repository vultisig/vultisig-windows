import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const SeparatedByLine = styled(VStack)`
  > *:not(:last-child) {
    border-bottom: 1px solid ${getColor('foregroundExtra')};
    padding-bottom: ${({ gap = 0 }) => toSizeUnit(gap)};
  }
`
