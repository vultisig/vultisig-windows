import styled from 'styled-components';
import { VStack } from '../../lib/ui/layout/Stack';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { pageConfig } from './config';
import { verticalPadding } from '../../lib/ui/css/verticalPadding';

export const PageContent = styled(VStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  flex: 1;
`;
