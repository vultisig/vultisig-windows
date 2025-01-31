import styled, { keyframes } from 'styled-components';

import { centerContent } from '../css/centerContent';
import { horizontalPadding } from '../css/horizontalPadding';
import { round } from '../css/round';
import { ChildrenProp } from '../props';
import { getColor } from '../theme/getters';

const appearFromBottom = keyframes`
  from {
    transform: translateX(-50%) translateY(100%);
  }
  to {
    transform: translateX(-50%) translateY(0);
  }
`;

const Position = styled.div`
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  z-index: 1;
  animation: ${appearFromBottom} 0.5s ease-out;
`;

const Container = styled.div`
  ${round};
  height: 48px;
  ${horizontalPadding(20)};
  background: ${getColor('foregroundExtra')};
  ${centerContent};
  font-weight: 600;
  color: ${getColor('contrast')};
`;

export const ToastItem = ({ children }: ChildrenProp) => {
  return (
    <Position>
      <Container>{children}</Container>
    </Position>
  );
};
