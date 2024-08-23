import styled from 'styled-components';
import { VStack } from '../../../lib/ui/layout/Stack';
import { horizontalPadding } from '../../../lib/ui/css/horizontalPadding';
import { UploadQrPageHeader } from './UploadQrPageHeader';

const Container = styled(VStack)`
  flex: 1;
  ${horizontalPadding(40)};
  padding-bottom: 40px;
`;

export const UploadQrPage = () => {
  return (
    <Container>
      <UploadQrPageHeader />
    </Container>
  );
};
