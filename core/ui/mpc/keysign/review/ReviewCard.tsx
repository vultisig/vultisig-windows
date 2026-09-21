import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

/**
 * A summary tile on a review sheet: the amount, or one end of a transfer.
 * Content is centred, so it reads as a badge rather than a list row.
 */
export const ReviewCard = styled(VStack)`
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  ${borderRadius.lg};
  background: ${getColor('foregroundExtra')};
  min-width: 0;
`
