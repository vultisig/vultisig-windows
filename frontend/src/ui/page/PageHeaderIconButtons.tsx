import styled from 'styled-components';
import { HStack } from '../../lib/ui/layout/Stack';
import { toSizeUnit } from '../../lib/ui/css/toSizeUnit';
import { pageConfig } from './config';

export const PageHeaderIconButtons = styled(HStack)`
  gap: ${toSizeUnit(pageConfig.header.iconButton.offset * 2)};
  align-items: center;
`;
