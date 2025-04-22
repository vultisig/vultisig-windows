import { fromBinary } from '@bufbuild/protobuf'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import AddressProvider from '@clients/extension/src/utils/address-provider'
import {
  errorKey,
  isSupportedChain,
  supportedChains,
} from '@clients/extension/src/utils/constants'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { fromCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainer } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { BackupFileDropzone } from '@core/ui/vault/import/components/BackupFileDropzone'
import { DecryptVaultContainerStep } from '@core/ui/vault/import/components/DecryptVaultContainerStep'
import { UploadedBackupFile } from '@core/ui/vault/import/components/UploadedBackupFile'
import { vaultBackupResultFromFile } from '@core/ui/vault/import/utils/vaultBackupResultFromFile'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
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
import { createHash } from 'crypto'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'

import { calculateWindowPosition } from '../../../../utils/functions'
import { Vault } from '../../../../utils/interfaces'

interface InitialState {
  error?: string
  file?: File
  vaultContainer?: VaultContainer
  isEncrypted?: boolean
  isWindows: boolean
  loading?: boolean
  status: 'default' | 'error' | 'success'
  vault?: Vault
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {
    isWindows: true, // Default to Windows flow, will be updated in useEffect if needed
    status: 'default',
  }
  const [state, setState] = useState(initialState)
  const { isWindows, loading, vault, file, vaultContainer, isEncrypted } = state

  const navigate = useAppNavigate()
  const walletCore = useAssertWalletCore()
  const isPopup = new URLSearchParams(window.location.search).get('isPopup')
  const isPopupRef = useRef(isPopup)

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
        // TODO: Ehsan to fix when we merge the proper type for this
        onVaultDecrypted(decodedVault as any)
      }
    } else {
      handleError(errorKey.INVALID_VAULT)
    }
  }

  const { mutate, error } = useMutation({
    mutationFn: vaultBackupResultFromFile,
    onSuccess: handleProcessVaultContainer,
  })

  const finalizeVaultImport = (): void => {
    if (!loading && vaultContainer && vault) {
      getStoredVaults().then(vaults => {
        const existed = vaults.findIndex(({ uid }) => uid === vault.uid) >= 0
        setState(prevState => ({ ...prevState, loading: true }))
        if (existed) {
          const modifiedVaults = vaults.map(item => ({
            ...item,
            active: item.uid === vault.uid,
          }))
          setStoredVaults(modifiedVaults).then(() => {
            setState(prevState => ({ ...prevState, loading: false }))
            handleFinish()
          })
        } else {
          const addressProvider = new AddressProvider(walletCore)
          const promises = Object.keys(supportedChains)
            .filter(key => isSupportedChain(key as Chain))
            .map(key => addressProvider.getAddress(key as Chain, vault))
          Promise.all(promises)
            .then(props => {
              vault.chains = Object.keys(supportedChains)
                .filter(key => isSupportedChain(key as Chain))
                .map((chainKey, index) => ({
                  ...chainFeeCoin[chainKey as Chain],
                  ...props[index],
                }))
              const modifiedVaults = [
                { ...vault, active: true },
                ...vaults
                  .filter(({ uid }) => uid !== vault.uid)
                  .map(vault => ({ ...vault, active: false })),
              ]
              setStoredVaults(modifiedVaults).then(() => {
                setState(prevState => ({ ...prevState, loading: false }))
                handleFinish()
              })
            })
            .catch(error => {
              console.error('Failed to retrieve addresses:', error)
              setState(prevState => ({
                ...prevState,
                loading: false,
                status: 'error',
                error: t('failed_to_retrieve_addresses'),
              }))
            })
        }
      })
    }
  }

  const onVaultDecrypted = (decodedVault: Vault) => {
    console.log('decodedVault:', decodedVault)
    if (decodedVault.hexChainCode) {
      const uid = createHash('sha256')
        .update(
          [
            decodedVault.name,
            decodedVault.publicKeys.ecdsa,
            decodedVault.publicKeys.eddsa,
            decodedVault.hexChainCode,
          ].join('-')
        )
        .digest('hex')

      setState(prevState => ({
        ...prevState,
        vault: {
          ...decodedVault,
          uid,
          apps: [],
          chains: [],
          transactions: [],
          // TODO: Ehsan to fix when we merge the proper type for this
        } as any,
        status: 'success',
      }))
      finalizeVaultImport()
    } else {
      handleError(errorKey.INVALID_VAULT)
    }
  }

  const handleFinish = (): void => {
    if (isPopup) window.close()
    else navigate('main')
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
    navigate('main')
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
            url: chrome.runtime.getURL('import.html?isPopup=true'),
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
            getStoredVaults().then(vaults => {
              const active = vaults.find(({ active }) => active)

              if (active) {
                if (isPopupRef.current) window.close()
                else navigateToMain()
              }
            })
          }
        })
      })
    }
  }, [navigateToMain])

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
          // TODO: Ehsan to fix when we merge the proper type for this
          onFinish={onVaultDecrypted as any}
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
