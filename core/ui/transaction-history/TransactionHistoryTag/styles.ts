import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const TagPill = styled(HStack).attrs({
  direction: 'horizontal',
  alignItems: 'center',
  gap: 4,
})`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 99px;
  border: 1px solid ${getColor('info')};
  background: ${({ theme }) => theme.colors.info.withAlpha(0.1).toCssValue()};
  color: ${getColor('info')};
`
