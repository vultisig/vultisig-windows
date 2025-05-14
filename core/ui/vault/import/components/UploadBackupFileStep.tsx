import { BackupFileDropzone } from '@core/ui/vault/import/components/BackupFileDropzone'
import { UploadedBackupFile } from '@core/ui/vault/import/components/UploadedBackupFile'
import { vaultBackupResultFromFile } from '@core/ui/vault/import/utils/vaultBackupResultFromFile'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UploadBackupFileStep = ({
  onFinish,
}: OnFinishProp<FileBasedVaultBackupResult>) => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)

  const { mutate, isPending, error } = useMutation({
    mutationFn: vaultBackupResultFromFile,
    onSuccess: onFinish,
  })

  const isDisabled = !file

  return (
    <>
      <FlowPageHeader title={t('import_vault')} />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: () => {
            mutate(shouldBePresent(file))
          },
          isDisabled,
        })}
      >
        <VStack gap={20} flexGrow>
          {file ? (
            <UploadedBackupFile value={file} />
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
  )
}
