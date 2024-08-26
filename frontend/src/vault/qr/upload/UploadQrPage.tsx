import styled from 'styled-components';
import { VStack } from '../../../lib/ui/layout/Stack';
import { horizontalPadding } from '../../../lib/ui/css/horizontalPadding';
import { UploadQrPageHeader } from './UploadQrPageHeader';
import { Text } from '../../../lib/ui/text';
import { QrImageDropZone } from './QrImageDropZone';
import { useState } from 'react';
import { UploadedQr } from './UploadedQr';

const Container = styled(VStack)`
  flex: 1;
  ${horizontalPadding(40)};
  padding-bottom: 40px;
  gap: 40px;
`;

export const UploadQrPage = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Container>
      <UploadQrPageHeader />
      <VStack fill justifyContent="space-between" gap={20}>
        <VStack fill gap={20}>
          <VStack alignItems="center">
            <Text color="contrast" size={16} weight="700">
              Upload QR-Code to join Keysign
            </Text>
          </VStack>
          {file ? (
            <UploadedQr value={file} onRemove={() => setFile(null)} />
          ) : (
            <QrImageDropZone onFinish={setFile} />
          )}
        </VStack>
      </VStack>
    </Container>
  );
};
