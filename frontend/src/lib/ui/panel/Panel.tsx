import styled from 'styled-components';

import { getColor } from '../theme/getters';
import { borderRadius } from '../css/borderRadius';

export const Panel = styled.div`
  ${borderRadius.m};
  background: ${getColor('foreground')};
  padding: 20px;
`;
