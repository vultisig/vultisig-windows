import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { errorKey } from '@clients/extension/src/utils/constants'
import {
  calculateWindowPosition,
  toCamelCase,
} from '@clients/extension/src/utils/functions'
import { Vault } from '@clients/extension/src/utils/interfaces'
import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'
import { useSetCurrentVaultIdMutation } from '@core/ui/vault/mutations/useSetCurrentVaultIdMutation'
import { useCreateVault } from '@core/ui/vault/state/createVault'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { QrImageDropZone } from '@lib/ui/qr/upload/QrImageDropZone'
import { UploadedQr } from '@lib/ui/qr/upload/UploadedQr'
import { StyledPageContent } from '@lib/ui/qr/upload/UploadQRPage/UploadQRPage.styled'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'
import { readBarcodes, ReaderOptions } from 'zxing-wasm'

interface InitialState {
  file?: File
  isWindows: boolean
  loading?: boolean
  status: 'default' | 'error' | 'success'
  vault?: Vault
  error?: string
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {
    isWindows: true, // Default to Windows flow, will be updated in useEffect if needed
    status: 'default',
    error: '',
  }
  const [state, setState] = useState(initialState)
  const { file, isWindows, loading, status, vault, error } = state
  const navigate = useAppNavigate()
  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const createVault = useCreateVault()
  const isPopup = new URLSearchParams(window.location.search).get('isPopup')
  const isPopupRef = useRef(isPopup)
  const handleFinish = (): void => {
    if (isPopup) window.close()
    else navigate('root')
  }

  const vaults = useVaults()

  const handleStart = async (): Promise<void> => {
    if (!loading && vault && status === 'success') {
      setState(prevState => ({ ...prevState, loading: true }))
      try {
        const existed =
          vaults.findIndex(v => getVaultId(v) === getVaultId(vault)) >= 0

        if (existed) {
          setCurrentVaultId(getVaultId(vault))
          handleFinish()
        } else {
          createVault(vault).then(() => {
            setCurrentVaultId(getVaultId(vault))
            navigateToMain()
          })
        }
      } finally {
        setState(prevState => ({ ...prevState, loading: false }))
      }
    }
  }

  const handleClear = (): void => {
    setState(initialState)
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

  const handleUpload = (file: File): false => {
    setState(initialState)

    const reader = new FileReader()

    const imageFormats: string[] = [
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/bmp',
    ]

    reader.onload = () => {
      const readerOptions: ReaderOptions = {
        tryHarder: true,
        formats: ['QRCode'],
        maxNumberOfSymbols: 1,
      }

      setState(prevState => ({ ...prevState, file }))

      readBarcodes(file, readerOptions)
        .then(([result]) => {
          if (result) {
            try {
              const {
                hex_chain_code,
                name,
                public_key_ecdsa,
                public_key_eddsa,
                uid,
              } = JSON.parse(result.text)
              console.log({
                hex_chain_code,
                name,
                public_key_ecdsa,
                public_key_eddsa,
                uid,
              })

              // TODO: create new vault with new flow (JoinKeysgin) in another PR
              setState(prevState => ({
                ...prevState,
                vault: {
                  ...toCamelCase(vault),
                  apps: [],
                  chains: [],
                  transactions: [],
                },
                status: 'success',
                error: '',
              }))
            } catch {
              handleError(errorKey.INVALID_VAULT)
            }
          }
        })
        .catch(() => {
          handleError(errorKey.INVALID_QRCODE)
        })
    }

    reader.onerror = () => {
      handleError(errorKey.INVALID_FILE)
    }

    if (imageFormats.indexOf(file.type) >= 0) {
      reader.readAsDataURL(file)
    } else {
      handleError(errorKey.INVALID_EXTENSION)
    }

    return false
  }

  const navigateToMain = useCallback(() => {
    navigate('root')
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
            if (isPopupRef.current) window.close()
            else navigateToMain()
          }
        })
      })
    }
  }, [navigateToMain])

  const [{ title = t('keysign') }] = useCorePathParams<'uploadQr'>()

  return isWindows ? (
    <StyledPageContent fullHeight>
      <FlowPageHeader title={title} />
      <PageContent flexGrow justifyContent="space-between" fullWidth gap={20}>
        <VStack fullWidth alignItems="center" flexGrow gap={20}>
          <Text color="contrast" size={16} weight="700">
            {t('upload_vulttshare')}
          </Text>
          {file ? (
            <UploadedQr value={file} onRemove={handleClear} />
          ) : (
            <QrImageDropZone onFinish={handleUpload} />
          )}
          {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
        </VStack>
        <Text color="shy">{t('vulti_share_not_saved_hint')}</Text>
        <Button
          isLoading={loading}
          onClick={() => {
            if (file) {
              handleStart()
            }
          }}
          isDisabled={!file}
        >
          {t('continue')}
        </Button>
      </PageContent>
    </StyledPageContent>
  ) : (
    <div className="layout import-page">
      <div className="content">
        <div className="hint">{t('continue_in_new_window')}</div>
      </div>
    </div>
  )
}

export default Component
