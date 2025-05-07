import { fromBinary } from '@bufbuild/protobuf'
import { appPaths } from '@clients/extension/src/navigation'
import { errorKey } from '@clients/extension/src/utils/constants'
import { calculateWindowPosition } from '@clients/extension/src/utils/functions'
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
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { fromBase64 } from '@lib/utils/fromBase64'
import { pipe } from '@lib/utils/pipe'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { UAParser } from 'ua-parser-js'

const StyledEmptyState = styled(VStack)`
  background-color: ${getColor('backgroundsSecondary')};
  border-radius: 12px;
  padding: 64px;
`

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
  const { pathname } = useLocation()
  const isPopupRef = useRef(pathname === appPaths.importTab)

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

  const finalizeVaultImport = async (decodedVault?: Vault) => {
    if (decodedVault) {
      setState(prevState => ({ ...prevState, loading: true }))

      try {
        await createVault(decodedVault)

        if (isPopupRef.current) {
          window.close()
        } else {
          navigateToMain()
        }
      } catch (e) {
        handleError(extractErrorMsg(e))
      } finally {
        setState(prevState => ({ ...prevState, loading: false }))
      }
    }
  }

  const onVaultDecrypted = (decodedVault: Vault, finalize?: boolean) => {
    setState(prevState => ({
      ...prevState,
      status: 'success',
      decodedVault,
    }))

    if (finalize) finalizeVaultImport(decodedVault)
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

  const navigateToMain = useCallback(() => {
    navigate('vault')
  }, [navigate])

  useEffect(() => {
    const parser = new UAParser()
    const parserResult = parser.getResult()

    if (!isPopupRef.current && parserResult.os.name !== 'Windows') {
      setState(prevState => ({ ...prevState, isWindows: false }))

      chrome.windows.getCurrent({ populate: true }, currentWindow => {
        let createdWindowId: number
        const { height, left, top, width } =
          calculateWindowPosition(currentWindow)

        chrome.windows.create(
          {
            url: chrome.runtime.getURL(`index.html#${appPaths.importTab}`),
            type: 'panel',
            height,
            left,
            top,
            width,
          },
          window => {
            if (window?.id) createdWindowId = window.id
          }
        )

        chrome.windows.onRemoved.addListener(closedWindowId => {
          if (closedWindowId === createdWindowId) {
            navigateToMain()
          }
        })
      })
    }
  }, [navigateToMain])

  const isDisabled = !file

  return isWindows ? (
    isEncrypted ? (
      vaultContainer?.vault ? (
        <DecryptVaultContainerStep
          value={vaultContainer.vault}
          onFinish={vault => onVaultDecrypted(vault, true)}
        />
      ) : null
    ) : (
      <VStack
        as="form"
        {...getFormProps({
          onSubmit: () => {
            if (file && !error) finalizeVaultImport(decodedVault)
          },
          isDisabled,
        })}
        fullHeight
      >
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={<PageHeaderTitle>{t('import_vault')}</PageHeaderTitle>}
          hasBorder
        />
        <PageContent gap={12} flexGrow scrollable>
          {file ? (
            <UploadedBackupFile value={file} />
          ) : (
            <BackupFileDropzone onFinish={onFileSelected} />
          )}
          {error && (
            <Text color="danger" centerHorizontally>
              {extractErrorMsg(error)}
            </Text>
          )}
        </PageContent>
        <PageFooter>
          <Button isLoading={loading} isDisabled={isDisabled} type="submit">
            {t('continue')}
          </Button>
        </PageFooter>
      </VStack>
    )
  ) : (
    <PageContent
      alignItems="center"
      justifyContent="center"
      flexGrow
      scrollable
    >
      <StyledEmptyState alignItems="center" gap={24} justifyContent="center">
        <Text color="contrast" size={17} weight={500} centerHorizontally>
          {t('continue_in_new_window')}
        </Text>
      </StyledEmptyState>
    </PageContent>
  )
}

export default Component
