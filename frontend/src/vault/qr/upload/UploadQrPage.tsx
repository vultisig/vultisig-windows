import styled from 'styled-components';
import { VStack } from '../../../lib/ui/layout/Stack';
import { horizontalPadding } from '../../../lib/ui/css/horizontalPadding';
import { UploadQrPageHeader } from './UploadQrPageHeader';
import { Text } from '../../../lib/ui/text';
import { QrImageDropZone } from './QrImageDropZone';
import { useState } from 'react';
import { UploadedQr } from './UploadedQr';
import { Button } from '../../../lib/ui/buttons/Button';
import { useProcessQrMutation } from './useProcessQrMutation';

const Container = styled(VStack)`
  flex: 1;
  ${horizontalPadding(40)};
  padding-bottom: 40px;
  gap: 40px;
`;

export const UploadQrPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const { mutate, isPending, error } = useProcessQrMutation();

  return (
    <Container>
      <UploadQrPageHeader />
      <VStack fill justifyContent="space-between" fullWidth gap={20}>
        <VStack fullWidth alignItems="center" fill gap={20}>
          <Text color="contrast" size={16} weight="700">
            Upload QR-Code to join Keysign
          </Text>
          {file ? (
            <UploadedQr value={file} onRemove={() => setFile(null)} />
          ) : (
            <QrImageDropZone onFinish={setFile} />
          )}
          {error && <Text color="regular">Failed to process QR</Text>}
        </VStack>

        <Button
          isLoading={isPending}
          onClick={() => {
            if (file) {
              mutate(file);
            }
          }}
          isDisabled={!file}
        >
          Continue
        </Button>
      </VStack>
    </Container>
  );
};
