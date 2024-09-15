import styled from 'styled-components';

import { getColor } from '../../lib/ui/theme/getters';

export const PageHeaderTitle = styled.div`
  color: ${getColor('contrast')};
  font-size: 20px;
  font-weight: 600;
`;
