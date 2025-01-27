import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ValueFinishProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';
import { vaultContainerFromString } from '../utils/vaultContainerFromString';
import { BackupFileDropzone } from './BackupFileDropzone';
import { UploadedBackupFile } from './UploadedBackupFile';

export const UploadBackupFileStep = ({
  onFinish,
}: ValueFinishProps<VaultContainer>) => {
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (file: File) => {
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

      return vaultContainerFromString(fileContent);
    },
    onSuccess: onFinish,
  });

  const isDisabled = !file;

  return (
    <>
      <FlowPageHeader title={t('import_vault')} />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: () => {
            if (file) {
              mutate(file, {
                onSuccess: container => {
                  onFinish(container);
                },
              });
            }
          },
          isDisabled,
        })}
      >
        <VStack gap={20} flexGrow>
          {file ? (
            <UploadedBackupFile value={file} onRemove={() => setFile(null)} />
          ) : (
            <BackupFileDropzone onFinish={setFile} />
          )}
          {error && (
            <VStack alignItems="center">
              <Text centerHorizontally color="danger">
                {extractErrorMsg(error)}
              </Text>
            </VStack>
          )}
        </VStack>
        <Button isLoading={isPending} isDisabled={isDisabled} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
