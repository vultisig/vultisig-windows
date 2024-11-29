import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../lib/ui/buttons/Button';
import { TakeWholeSpaceAbsolutely } from '../../../lib/ui/css/takeWholeSpaceAbsolutely';
import { PageContent } from '../../../ui/page/PageContent';

const Container = styled(PageContent)`
  position: relative;
  justify-content: flex-end;
`;

type ScanQrViewProps = {
  onUploadQrViewRequest: () => void;
};

export const ScanQrView = ({ onUploadQrViewRequest }: ScanQrViewProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <TakeWholeSpaceAbsolutely />
      <Button onClick={onUploadQrViewRequest}>
        {t('upload_qr_code_image')}
      </Button>
    </Container>
  );
};
