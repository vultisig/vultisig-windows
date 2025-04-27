import { fromBinary } from '@bufbuild/protobuf'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { errorKey } from '@clients/extension/src/utils/constants'
import { calculateWindowPosition } from '@clients/extension/src/utils/functions'
import { fromCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainer } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { BackupFileDropzone } from '@core/ui/vault/import/components/BackupFileDropzone'
import { DecryptVaultContainerStep } from '@core/ui/vault/import/components/DecryptVaultContainerStep'
import { UploadedBackupFile } from '@core/ui/vault/import/components/UploadedBackupFile'
import { vaultBackupResultFromFile } from '@core/ui/vault/import/utils/vaultBackupResultFromFile'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { useCreateVault } from '@core/ui/vault/state/createVault'
import { useSetCurrentVaultId } from '@core/ui/vault/state/setCurrentVaultId'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
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
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'

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

const initialState: InitialState = {
  isWindows: true,
  status: 'default',
}

const errorMessages = {
  [errorKey.INVALID_EXTENSION]: 'Invalid file extension',
  [errorKey.INVALID_FILE]: 'Invalid file',
  [errorKey.INVALID_QRCODE]: 'Invalid QR code',
  [errorKey.INVALID_VAULT]: 'Invalid vault data',
}

const Component = () => {
  const { t } = useTranslation()
  const [state, setState] = useState(initialState)
  const navigate = useAppNavigate()
  const {
    isWindows,
    loading,
    decodedVault,
    file,
    vaultContainer,
    isEncrypted,
  } = state

  const handleProcessVaultContainer = (data: FileBasedVaultBackupResult) => {
    if ('vaultContainer' in data.result) {
      const container = data.result.vaultContainer
      const { vault: vaultAsBase64String, isEncrypted } = container
      setState(prev => ({
        ...prev,
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

  const createVault = useCreateVault()
  const setCurrentVaultId = useSetCurrentVaultId()
  const finalizeVaultImport = async (): Promise<void> => {
    if (!decodedVault) return
    setState(p => ({ ...p, loading: true }))
    try {
      await createVault(decodedVault)
      await setCurrentVaultId(getVaultId(decodedVault))
      navigate('main')
    } catch (e) {
      handleError(extractErrorMsg(e))
    } finally {
      setState(p => ({ ...p, loading: false }))
    }
  }

  const isPopup = new URLSearchParams(window.location.search).get('isPopup')
  const isPopupRef = useRef(isPopup)

  const handleError = (error: string) => {
    const message =
      errorMessages[error as keyof typeof errorMessages] ||
      'Something went wrong'
    console.error(message)
    setState(prev => ({ ...prev, status: 'error', error: message }))
  }

  const onVaultDecrypted = (decodedVault: Vault, finalize?: boolean) => {
    setState(prev => ({
      ...prev,
      status: 'success',
      decodedVault,
    }))
    if (finalize) {
      finalizeVaultImport()
    }
  }

  const handleFileSelected = (file: File) => {
    setState(prev => ({ ...prev, file }))
    mutate(shouldBePresent(file))
  }

  const openPopupIfNeeded = useCallback(() => {
    const parser = new UAParser()
    const parserResult = parser.getResult()

    if (!isPopupRef.current && parserResult.os.name !== 'Windows') {
      setState(prev => ({ ...prev, isWindows: false }))
      chrome.windows.getCurrent({ populate: true }, currentWindow => {
        const { height, left, top, width } =
          calculateWindowPosition(currentWindow)

        chrome.windows.create(
          {
            url: chrome.runtime.getURL('import.html?isPopup=true'),
            type: 'panel',
            height,
            left,
            top,
            width,
          },
          popupWindow => {
            if (popupWindow?.id) {
              chrome.windows.onRemoved.addListener(closedWindowId => {
                if (closedWindowId === popupWindow.id) {
                  if (isPopupRef.current) {
                    window.close()
                  } else {
                    navigate('main')
                  }
                }
              })
            }
          }
        )
      })
    }
  }, [navigate])

  useEffect(() => {
    openPopupIfNeeded()
  }, [openPopupIfNeeded])

  const renderForm = () => (
    <StyledPageContent fullHeight>
      <FlowPageHeader title={t('import_vault')} />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: () => {
            if (file && !error) {
              setState(prev => ({ ...prev, loading: true }))
              finalizeVaultImport()
            }
          },
          isDisabled: !file,
        })}
      >
        <VStack gap={20} flexGrow>
          {file ? (
            <UploadedBackupFile value={file} />
          ) : (
            <BackupFileDropzone onFinish={handleFileSelected} />
          )}
          {error && (
            <Text centerHorizontally color="danger">
              {extractErrorMsg(error)}
            </Text>
          )}
        </VStack>
        <Button isLoading={loading} isDisabled={!file} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </StyledPageContent>
  )

  const renderDecryptStep = () => (
    <DecryptVaultContainerStep
      value={vaultContainer!.vault}
      onFinish={vault => onVaultDecrypted(vault, true)}
    />
  )

  const renderPopupNotice = () => (
    <div className="layout import-page">
      <div className="content">
        <div className="hint">{t('continue_in_new_window')}</div>
      </div>
    </div>
  )

  if (!isWindows) return renderPopupNotice()
  if (isEncrypted) return renderDecryptStep()
  return renderForm()
}

export default Component
