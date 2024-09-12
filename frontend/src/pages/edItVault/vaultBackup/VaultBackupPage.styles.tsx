import styled from 'styled-components';
import { getColor } from '../../../lib/ui/theme/getters';
import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';

export const InputFieldWrapper = styled.div`
  position: relative;
  background-color: ${getColor('foreground')};
  padding: 12px;
  ${borderRadius.m};
`;

export const InputField = styled.input`
  background-color: transparent;
  display: block;
  width: 100%;

  &::placeholder {
    font-size: 13px;
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
