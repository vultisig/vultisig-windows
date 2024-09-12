import styled from 'styled-components';
import { Panel } from '../../lib/ui/panel/Panel';
import { getColor } from '../../lib/ui/theme/getters';
import { VStack } from '../../lib/ui/layout/Stack';
import { pageConfig } from '../../ui/page/config';
import { Text } from '../../lib/ui/text';

export const ListItemPanel = styled(Panel)`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
`;

export const Container = styled(VStack)`
  margin-bottom: ${pageConfig.verticalPadding}px;
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  justify-content: center;
`;

export const IconWrapper = styled.div`
  align-self: center;
  height: 30px;
`;

export const AutoCenteredText = styled(Text)`
  align-self: center;
`;
