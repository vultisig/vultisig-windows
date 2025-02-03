import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../lib/ui/layout/Stack';
import { OnFinishProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';
import { vaultBackupResultFromFile } from '../utils/vaultBackupResultFromFile';
import { VaultBackupResult } from '../VaultBakupResult';
import { BackupFileDropzone } from './BackupFileDropzone';
import { UploadedBackupFile } from './UploadedBackupFile';

export const UploadBackupFileStep = ({
  onFinish,
}: OnFinishProp<VaultBackupResult>) => {
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: vaultBackupResultFromFile,
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
            mutate(shouldBePresent(file));
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
            <Text centerHorizontally color="danger">
              {extractErrorMsg(error)}
            </Text>
          )}
        </VStack>
        <Button isLoading={isPending} isDisabled={isDisabled} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
