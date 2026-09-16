import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

/**
 * Row that holds the vault's primary actions. The extension popup leaves this
 * row 328px once the page has taken its own horizontal padding, which five
 * 52px actions cannot share at the desktop gap, so below the breakpoint the
 * gap tightens and the row stops padding itself — the page already does it.
 */
export const ActionsWrapper = styled(HStack)`
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding-inline: 24px;

  @media (max-width: 400px) {
    gap: 12px;
    padding-inline: 0;
  }
`

const ActionWrapper = styled(UnstyledButton)<{ $isExtension?: boolean }>`
  min-width: 52px;
  max-height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;

  ${({ $isExtension }) =>
    $isExtension
      ? css`
          box-sizing: border-box;
          width: 52px;
          height: 52px;
          padding: 15px;
        `
      : css`
          padding: 16px;
        `}
  ${borderRadius.lg};
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
  ${borderRadius.lg};
  border: 1px solid rgba(255, 255, 255, 0.03);
  background: ${getColor('foregroundExtra')};

  &:hover {
    background: ${({ theme }) =>
      theme.colors.foregroundExtra.withAlpha(0.7).toCssValue()};
  }
`
