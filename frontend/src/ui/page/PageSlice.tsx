import styled from 'styled-components';
import { VStack } from '../../lib/ui/layout/Stack';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { pageConfig } from './config';

export const PageSlice = styled(VStack)`
  width: 100%;
  ${horizontalPadding(pageConfig.horizontalPadding)};
`;
