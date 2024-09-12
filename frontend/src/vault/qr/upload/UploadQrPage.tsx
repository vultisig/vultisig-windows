import { VStack } from '../../../lib/ui/layout/Stack';
import { UploadQrPageHeader } from './UploadQrPageHeader';
import { Text } from '../../../lib/ui/text';
import { QrImageDropZone } from './QrImageDropZone';
import { useState } from 'react';
import { UploadedQr } from './UploadedQr';
import { Button } from '../../../lib/ui/buttons/Button';
import { useProcessQrMutation } from './useProcessQrMutation';
import { PageContent } from '../../../ui/page/PageContent';

export const UploadQrPage = () => {
  const [file, setFile] = useState<File | null>(null);

  const { mutate, isPending, error } = useProcessQrMutation();

  return (
    <VStack flexGrow>
      <UploadQrPageHeader />
      <PageContent flexGrow justifyContent="space-between" fullWidth gap={20}>
        <VStack fullWidth alignItems="center" flexGrow gap={20}>
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
      </PageContent>
    </VStack>
  );
};
