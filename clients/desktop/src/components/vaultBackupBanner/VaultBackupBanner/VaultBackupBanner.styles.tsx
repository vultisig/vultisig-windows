import styled from 'styled-components'

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton'

export const ContentWrapperButton = styled(UnstyledButton)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.danger.toCssValue()};
  background-color: ${({ theme }) =>
    theme.colors.danger.withAlpha(0.2).toCssValue()};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.danger.toCssValue()};
`

export const ChevronIconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.text.toCssValue()};
  display: grid;
  place-items: center;
`
