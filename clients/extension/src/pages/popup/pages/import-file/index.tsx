import { fromBinary } from '@bufbuild/protobuf'
import { BackupFileDropzone } from '@clients/desktop/src/vault/import/components/BackupFileDropzone'
import { UploadedBackupFile } from '@clients/desktop/src/vault/import/components/UploadedBackupFile'
import { vaultBackupResultFromFile } from '@clients/desktop/src/vault/import/utils/vaultBackupResultFromFile'
import { FileBasedVaultBackupResult } from '@clients/desktop/src/vault/import/VaultBakupResult'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import AddressProvider from '@clients/extension/src/utils/address-provider'
import {
  errorKey,
  isSupportedChain,
  supportedChains,
} from '@clients/extension/src/utils/constants'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  isWindows: boolean
  loading?: boolean
  status: 'default' | 'error' | 'success'
  vault?: VaultProps
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {
    isWindows: true,
    status: 'default',
  }
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState(initialState)
  const { isWindows, loading, status, vault } = state

  const navigate = useAppNavigate()
  const walletCore = useAssertWalletCore()
  const isPopup = new URLSearchParams(window.location.search).get('isPopup')

  const handleProcessVaultContainer = (data: FileBasedVaultBackupResult) => {
    const handler = {
      vaultContainer: (vaultContainer: VaultContainer) => {
        const { vault: vaultAsBase64String, isEncrypted } = vaultContainer
        if (isEncrypted) {
          console.error('encrypted vault not supported')
        }

        const decodedVault = pipe(
          vaultAsBase64String,
          fromBase64,
          v => new Uint8Array(v),
          v => fromBinary(VaultSchema, v),
          fromCommVault
        )

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
              hexChainCode: decodedVault.hexChainCode,
              name: decodedVault.name,
              publicKeyEcdsa: decodedVault.publicKeys.ecdsa,
              publicKeyEddsa: decodedVault.publicKeys.eddsa,
              uid,
              apps: [],
              chains: [],
              transactions: [],
            },
            status: 'success',
          }))
          handleStart()
        } else {
          handleError(errorKey.INVALID_VAULT)
        }
      },
    }

    const key = Object.keys(data.result)[0] as keyof typeof handler
    const value = (data.result as any)[key]

    handler[key](value)
  }

  const { mutate, error } = useMutation({
    mutationFn: vaultBackupResultFromFile,
    onSuccess: handleProcessVaultContainer,
  })

  const handleStart = (): void => {
    if (!loading && vault && status === 'success') {
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
              }))
            })
        }
      })
    }
  }

  const handleFinish = (): void => {
    if (isPopup) window.close()
    else navigate('main')
  }

  const handleError = (error: string) => {
    setState(prevState => ({ ...prevState, status: 'error' }))

    switch (error) {
      case errorKey.INVALID_EXTENSION:
        console.error('Invalid file extension')
        setState(prevState => ({
          ...prevState,
          error: 'Invalid file extension',
        }))
        break
      case errorKey.INVALID_FILE:
        console.error('Invalid file')
        setState(prevState => ({
          ...prevState,
          error: 'Invalid file',
        }))
        break
      case errorKey.INVALID_QRCODE:
        console.error('Invalid qr code')
        setState(prevState => ({
          ...prevState,
          error: 'Invalid qr code',
        }))
        break
      case errorKey.INVALID_VAULT:
        console.error('Invalid vault data')
        setState(prevState => ({
          ...prevState,
          error: 'Invalid vault data',
        }))
        break
      default:
        console.error('Someting is wrong')
        setState(prevState => ({
          ...prevState,
          error: 'Someting is wrong',
        }))
        break
    }
  }

  const isDisabled = !file
  return isWindows ? (
    <>
      <StyledPageContent fullHeight>
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
          <Button isLoading={loading} isDisabled={isDisabled} type="submit">
            {t('continue')}
          </Button>
        </PageContent>
      </StyledPageContent>
    </>
  ) : (
    <div className="layout import-page">
      <div className="content">
        <div className="hint">{t('contine_in_new_window')}</div>
      </div>
    </div>
  )
}

export default Component
