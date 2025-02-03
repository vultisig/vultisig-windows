import styled from 'styled-components';

import { Button } from '../../lib/ui/buttons/Button';
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { ModalCloseButton } from '../../lib/ui/modal/ModalCloseButton';
import { Text } from '../../lib/ui/text';

export const FixedWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 350px;
  height: 350px;
  margin: auto;
  background-color: ${({ theme }) => theme.colors.background.toCssValue()};
  border: 1px solid ${({ theme }) => theme.colors.contrast.toCssValue()};
  padding: 20px;
  border-radius: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

export const StyledButton = styled(Button)`
  align-self: stretch;
`;

export const CenteredText = styled(Text)`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const DownloadButton = styled(UnstyledButton)`
  margin-left: 8px;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.foreground.toCssValue()};
  color: ${({ theme }) => theme.colors.primary.toCssValue()};
  font-weight: 600;
`;

export const StyledModalCloseButton = styled(ModalCloseButton)`
  position: absolute;
  top: 16px;
  right: 16px;
`;
