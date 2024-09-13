import styled from 'styled-components';
import { getColor } from '../../../lib/ui/theme/getters';
import { Panel } from '../../../lib/ui/panel/Panel';
import { VStack } from '../../../lib/ui/layout/Stack';
import { CheckStatus } from '../../../lib/ui/inputs/checkbox/CheckStatus';
import { sameDimensions } from '../../../lib/ui/css/sameDimensions';
import { Button } from '../../../lib/ui/buttons/Button';

export const Container = styled(VStack)`
  margin-bottom: 32px;
`;

export const ListItemPanel = styled(Panel)`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
`;

export const ActionsWrapper = styled(VStack)`
  margin-bottom: 32px;
`;

export const Check = styled(CheckStatus)`
  ${sameDimensions(14)};
`;

export const DeleteButton = styled(Button)`
  background-color: ${getColor('danger')};
`;
