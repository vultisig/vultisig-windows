import styled from 'styled-components';
import { Panel } from '../../lib/ui/panel/Panel';
import { getColor } from '../../lib/ui/theme/getters';
import { VStack } from '../../lib/ui/layout/Stack';
import { pageConfig } from '../../ui/page/config';

export const ListItemPanel = styled(Panel)`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
`;

export const Container = styled(VStack)`
  margin-bottom: ${pageConfig.verticalPadding}px;
`;

export const StyledVStack = styled(VStack)`
  &:not(:last-child) {
    margin-bottom: 18px;
  }
`;
