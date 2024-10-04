import styled from 'styled-components';

import { toPercents } from '../../utils/toPercents';
import { round } from '../css/round';
import { vStack } from '../layout/Stack';
import { ComponentWithValueProps } from '../props';
import { getColor } from '../theme/getters';

const Container = styled.div`
  width: 100%;
  ${round};
  background: ${getColor('foreground')};
  height: 10px;
  overflow: hidden;
  ${vStack()};
`;

const Filler = styled.div`
  height: 100%;
  background: linear-gradient(
    to right,
    ${getColor('primaryAlt')},
    ${getColor('primary')}
  );
`;

export const ProgressLine: React.FC<ComponentWithValueProps<number>> = ({
  value,
}) => (
  <Container>
    <Filler style={{ width: toPercents(value) }} />
  </Container>
);
