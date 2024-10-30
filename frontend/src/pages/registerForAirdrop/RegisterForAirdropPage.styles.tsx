import styled from 'styled-components';

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';

export const Wrapper = styled.div`
  flex: 1;
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
`;

export const LogoAndListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const ListWrapper = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ListItem = styled.li`
  font-size: 18px;
  font-weight: 500;
`;

export const OneOffButton = styled(UnstyledButton)`
  margin-left: 8px;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.foreground.toCssValue()};
  color: ${({ theme }) => theme.colors.primary.toCssValue()};
  font-weight: 600;
`;

export const SaveVaultQRWrapper = styled.div`
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const HiddenQRWrapper = styled.div`
  position: absolute;
  top: -9999px;
  left: -9999px;
  pointer-events: none;
  opacity: 0;
`;
