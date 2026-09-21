import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

/** Hairline between review rows. */
export const ReviewDivider = styled.div`
  height: 1px;
  flex-shrink: 0;
  background: ${getColor('foregroundExtra')};
`
