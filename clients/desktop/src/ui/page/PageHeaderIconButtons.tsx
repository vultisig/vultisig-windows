import styled from 'styled-components';

import { toSizeUnit } from '../../lib/ui/css/toSizeUnit';
import { HStack } from '../../lib/ui/layout/Stack';
import { pageConfig } from './config';

export const PageHeaderIconButtons = styled(HStack)`
  gap: ${toSizeUnit(pageConfig.header.iconButton.offset * 2)};
  align-items: center;
`;
