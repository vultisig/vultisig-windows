import styled from 'styled-components';

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { centerContent } from '../../../lib/ui/css/centerContent';
import { round } from '../../../lib/ui/css/round';
import { sameDimensions } from '../../../lib/ui/css/sameDimensions';
import { ReverseIcon } from '../../../lib/ui/icons/ReverseIcon';
import { getColor } from '../../../lib/ui/theme/getters';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';

const Container = styled(UnstyledButton)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  ${round};
  ${sameDimensions(40)};
  background: ${getColor('primaryAlt')};
  border: 2px solid ${getColor('background')};
  ${centerContent};
  font-size: 16px;
  color: ${getColor('contrast')};
`;

export const ReverseSwap = () => {
  const [fromCoin, setFromCoin] = useFromCoin();
  const [toCoin, setToCoin] = useToCoin();

  return (
    <Container
      onClick={() => {
        setFromCoin(toCoin);
        setToCoin(fromCoin);
      }}
    >
      <ReverseIcon />
    </Container>
  );
};
