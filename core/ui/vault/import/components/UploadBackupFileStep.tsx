import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { BackupFileDropzone } from '@core/ui/vault/import/components/BackupFileDropzone'
import { UploadedBackupFile } from '@core/ui/vault/import/components/UploadedBackupFile'
import { isUnsupportedVaultBackupFileError } from '@core/ui/vault/import/utils/UnsupportedVaultBackupFileError'
import { vaultBackupResultFromFile } from '@core/ui/vault/import/utils/vaultBackupResultFromFile'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UploadBackupFileStep = ({
  onFinish,
}: OnFinishProp<FileBasedVaultBackupResult>) => {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: vaultBackupResultFromFile,
    onSuccess: onFinish,
    onError: setError,
  })

  const errorMessage = error
    ? isUnsupportedVaultBackupFileError(error)
      ? t('unsupported_vault_backup_file')
      : extractErrorMsg(error)
    : null

  const isDisabled = !file || !!error

  return (
    <>
      <FlowPageHeader title={t('import_vault')} />
      <PageContent
        as="form"
        data-testid="import-vault-form"
        {...getFormProps({
          onSubmit: () => {
            mutate(shouldBePresent(file))
          },
          isDisabled,
        })}
      >
        <VStack gap={20} flexGrow>
          {file && errorMessage ? (
            <BackupFileDropzone
              fileName={file.name}
              error={errorMessage}
              onFinish={file => {
                setFile(file)
                setError(null)
              }}
              onError={setError}
            />
          ) : file ? (
            <UploadedBackupFile value={file} />
          ) : (
            <BackupFileDropzone
              onFinish={file => {
                setFile(file)
                setError(null)
              }}
              onError={setError}
            />
          )}
        </VStack>
        <Button
          disabled={isDisabled}
          loading={isPending}
          type="submit"
          data-testid="import-continue"
        >
          {t('continue')}
        </Button>
      </PageContent>
    </>
  )
}
