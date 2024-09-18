import styled from 'styled-components';

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { getColor } from '../../../lib/ui/theme/getters';

export const FaqBox = styled.div`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
`;

export const FaqButton = styled(UnstyledButton)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  padding: 16px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  width: 100%;

  & > * {
    text-align: start;
  }
`;

export const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${getColor('textShy')};
`;
