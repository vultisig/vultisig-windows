import styled from 'styled-components';

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';

export const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.danger.toCssValue()};
  background-color: ${({ theme }) =>
    theme.colors.danger.withAlpha(0.2).toCssValue()};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.danger.toCssValue()};
`;

export const Wrapper = styled.div`
  padding-inline: 20px;
`;

export const ChevronIconButton = styled(UnstyledButton)`
  color: ${({ theme }) => theme.colors.contrast.toCssValue()};
  display: grid;
  place-items: center;
`;
