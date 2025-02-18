import styled from 'styled-components'

import { Text } from '../../../lib/ui/text'

export const Content = styled.div`
  width: 500px;
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.danger.toCssValue()};
  background-color: ${({ theme }) =>
    theme.colors.danger.withAlpha(0.2).toCssValue()};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.danger.toCssValue()};
`

export const FullWidthText = styled(Text)`
  flex: 1;
  text-align: center;
`
