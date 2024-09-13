import styled from 'styled-components';
import { Panel } from '../../../lib/ui/panel/Panel';
import { getColor } from '../../../lib/ui/theme/getters';

export const ListItemPanel = styled(Panel)`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
`;
