import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ActionsWrapper = styled(HStack)`
  padding-inline: 24px;
`

const ActionWrapper = styled(UnstyledButton)`
  min-width: 52px;
  max-height: 52px;
  display: flex;
  padding: 16px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 16px;
  line-height: 0;
  font-size: 20px;
  transition: background 0.3s ease;
`

export const PrimaryActionWrapper = styled(ActionWrapper)`
  background: ${getColor('buttonPrimary')};
  border: 1px solid rgba(255, 255, 255, 0.03);

  &:hover {
    background: ${({ theme }) =>
      theme.colors.buttonPrimary.withAlpha(0.7).toCssValue()};
  }
`

export const SecondaryActionWrapper = styled(ActionWrapper)`
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  background: ${getColor('foregroundExtra')};

  &:hover {
    background: ${({ theme }) =>
      theme.colors.foregroundExtra.withAlpha(0.7).toCssValue()};
  }
`
