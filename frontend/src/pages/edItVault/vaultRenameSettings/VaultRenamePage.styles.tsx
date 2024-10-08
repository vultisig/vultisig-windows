import styled from 'styled-components';

import { Button } from '../../../lib/ui/buttons/Button';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { Text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';

export const InputFieldWrapper = styled.div`
  position: relative;
  background-color: ${getColor('foreground')};
  padding: 12px;
  ${borderRadius.m};
`;

export const InputField = styled.input`
  background-color: transparent;
  font-size: 16px;
  font-weight: 500;
  color: ${getColor('contrast')};
  display: block;
  width: 100%;

  &::placeholder {
    font-size: 18px;
    color: ${getColor('contrast')};
  }

  &:focus {
    outline: none;
  }
`;

export const IconButton = styled(UnstyledButton)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`;

export const InfoPill = styled(Button)`
  pointer-events: none;
  justify-content: flex-start;
  gap: 4px;
  height: 40px;
`;

export const GradientText = styled(Text)`
  background: linear-gradient(90deg, #33e6bf, #0439c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

export const ButtonWithBottomSpace = styled(Button)`
  margin-bottom: 32px;
`;
