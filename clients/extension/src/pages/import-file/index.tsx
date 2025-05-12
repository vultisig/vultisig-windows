import { fromBinary } from '@bufbuild/protobuf'
import { errorKey } from '@clients/extension/src/utils/constants'
import { fromCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainer } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BackupFileDropzone } from '@core/ui/vault/import/components/BackupFileDropzone'
import { DecryptVaultContainerStep } from '@core/ui/vault/import/components/DecryptVaultContainerStep'
import { UploadedBackupFile } from '@core/ui/vault/import/components/UploadedBackupFile'
import { vaultBackupResultFromFile } from '@core/ui/vault/import/utils/vaultBackupResultFromFile'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { useCreateVaultMutation } from '@core/ui/vault/mutations/useCreateVaultMutation'
import { Vault } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { StyledPageContent } from '@lib/ui/qr/upload/UploadQRPage/UploadQRPage.styled'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { fromBase64 } from '@lib/utils/fromBase64'
import { pipe } from '@lib/utils/pipe'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  error?: string
  file?: File
  vaultContainer?: VaultContainer
  isEncrypted?: boolean
  isWindows: boolean
  loading?: boolean
  status: 'default' | 'error' | 'success'
  decodedVault?: Vault
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {
    isWindows: true, // Default to Windows flow, will be updated in useEffect if needed
    status: 'default',
  }
  const { mutateAsync: createVault } = useCreateVaultMutation()
  const [state, setState] = useState(initialState)
  const {
    isWindows,
    loading,
    decodedVault,
    file,
    vaultContainer,
    isEncrypted,
  } = state
  const navigate = useCoreNavigate()

  const errorMessages = {
    [errorKey.INVALID_EXTENSION]: 'Invalid file extension',
    [errorKey.INVALID_FILE]: 'Invalid file',
    [errorKey.INVALID_QRCODE]: 'Invalid QR code',
    [errorKey.INVALID_VAULT]: 'Invalid vault data',
  }

  const handleProcessVaultContainer = (data: FileBasedVaultBackupResult) => {
    if ('vaultContainer' in data.result) {
      const container = data.result.vaultContainer
      const { vault: vaultAsBase64String, isEncrypted } = container
      setState(prevState => ({
        ...prevState,
        vaultContainer: container,
        isEncrypted,
      }))
      if (!isEncrypted) {
        const decodedVault = pipe(
          vaultAsBase64String,
          fromBase64,
          v => new Uint8Array(v),
          v => fromBinary(VaultSchema, v),
          fromCommVault
        )
        onVaultDecrypted(decodedVault)
      }
    } else {
      handleError(errorKey.INVALID_VAULT)
    }
  }

  const { mutate, error } = useMutation({
    mutationFn: vaultBackupResultFromFile,
    onSuccess: handleProcessVaultContainer,
  })

  const finalizeVaultImport = async (): Promise<void> => {
    if (!decodedVault) return
    setState(p => ({ ...p, loading: true }))
    try {
      await createVault(decodedVault)
      navigate({ id: 'vault' })
    } catch (e) {
      handleError(extractErrorMsg(e))
    } finally {
      setState(p => ({ ...p, loading: false }))
    }
  }

  const onVaultDecrypted = (decodedVault: Vault, finalize?: boolean) => {
    setState(prevState => ({
      ...prevState,
      status: 'success',
      decodedVault,
    }))
    if (finalize) finalizeVaultImport()
  }

  const handleError = (error: string) => {
    const message =
      errorMessages[error as keyof typeof errorMessages] ||
      'Something went wrong'
    console.error(message)
    setState(prev => ({
      ...prev,
      status: 'error',
      error: message,
    }))
  }

  const onFileSelected = (file: File) => {
    setState(prevState => ({ ...prevState, file }))
    mutate(shouldBePresent(file))
  }

  const isDisabled = !file
  return isWindows ? (
    !isEncrypted ? (
      <>
        <StyledPageContent fullHeight>
          <FlowPageHeader title={t('import_vault')} />
          <PageContent
            as="form"
            {...getFormProps({
              onSubmit: () => {
                if (file && !error) {
                  finalizeVaultImport()
                }
              },
              isDisabled,
            })}
          >
            <VStack gap={20} flexGrow>
              {file ? (
                <UploadedBackupFile value={file} />
              ) : (
                <BackupFileDropzone onFinish={onFileSelected} />
              )}
              {error && (
                <Text centerHorizontally color="danger">
                  {extractErrorMsg(error)}
                </Text>
              )}
            </VStack>
            <Button isLoading={loading} isDisabled={isDisabled} type="submit">
              {t('continue')}
            </Button>
          </PageContent>
        </StyledPageContent>
      </>
    ) : (
      <>
        <DecryptVaultContainerStep
          value={vaultContainer!.vault}
          onFinish={vault => onVaultDecrypted(vault, true)}
        />
      </>
    )
  ) : (
    <div className="layout import-page">
      <div className="content">
        <div className="hint">{t('continue_in_new_window')}</div>
      </div>
    </div>
  )
}

export default Component
