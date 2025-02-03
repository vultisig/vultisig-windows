import styled from 'styled-components';

import { vStack } from '../../../../lib/ui/layout/Stack';
import { ReverseSwap } from '../ReverseSwap';
import { ManageFromAmount } from './ManageFromAmount';
import { ToAmount } from './ToAmount';

const Container = styled.div`
  ${vStack({ gap: 8 })}
  position: relative;
`;

export const SwapAmount = () => {
  return (
    <Container>
      <ManageFromAmount />
      <ToAmount />
      <ReverseSwap />
    </Container>
  );
};
