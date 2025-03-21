import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft, CloseLG } from '@clients/extension/src/icons'
import AddressProvider from '@clients/extension/src/utils/address-provider'
import {
  errorKey,
  isSupportedChain,
  supportedChains,
} from '@clients/extension/src/utils/constants'
import {
  calculateWindowPosition,
  toCamelCase,
} from '@clients/extension/src/utils/functions'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import routeKeys from '@clients/extension/src/utils/route-keys'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Button, Upload, UploadProps } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { UAParser } from 'ua-parser-js'
import { readBarcodesFromImageFile, ReaderOptions } from 'zxing-wasm'

interface InitialState {
  file?: File
  isWindows: boolean
  loading?: boolean
  status: 'default' | 'error' | 'success'
  vault?: VaultProps
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { isWindows: true, status: 'default' }
  const [state, setState] = useState(initialState)
  const { file, isWindows, loading, status, vault } = state
  const location = useLocation()
  const navigate = useNavigate()
  const goBack = useGoBack()
  const walletCore = useWalletCore()
  const isPopup = new URLSearchParams(window.location.search).get('isPopup')

  const handleFinish = (): void => {
    if (isPopup) window.close()
    else navigate(routeKeys.main, { state: true })
  }

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
          const addressProvider = new AddressProvider(walletCore!)
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

  const handleClear = (): void => {
    setState(initialState)
  }

  const handleError = (error: string) => {
    setState(prevState => ({ ...prevState, status: 'error' }))

    switch (error) {
      case errorKey.INVALID_EXTENSION:
        console.error('Invalid file extension')
        break
      case errorKey.INVALID_FILE:
        console.error('Invalid file')
        break
      case errorKey.INVALID_QRCODE:
        console.error('Invalid qr code')
        break
      case errorKey.INVALID_VAULT:
        console.error('Invalid vault data')
        break
      default:
        console.error('Someting is wrong')
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

      readBarcodesFromImageFile(file, readerOptions)
        .then(([result]) => {
          if (result) {
            try {
              const vault: VaultProps = JSON.parse(result.text)

              setState(prevState => ({
                ...prevState,
                vault: {
                  ...toCamelCase(vault),
                  apps: [],
                  chains: [],
                  transactions: [],
                },
                status: 'success',
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

  const componentDidMount = (): void => {
    if (!walletCore) {
      return
    }
    const parser = new UAParser()
    const parserResult = parser.getResult()

    if (!isPopup && parserResult.os.name !== 'Windows') {
      setState({ ...state, isWindows: false })

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

              if (active) handleFinish()
            })
          }
        })
      })
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidMount, [walletCore])

  const props: UploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: handleUpload,
    fileList: [],
  }

  return isWindows ? (
    <div className="layout import-page">
      <div className="header">
        <span className="heading">{t('import_vault')}</span>
        {location.state && (
          <ArrowLeft
            className="icon icon-left"
            onClick={() => goBack(routeKeys.main)}
          />
        )}
      </div>
      <div className="content">
        <Upload.Dragger {...props} className={status}>
          <div className="state state-default">
            <img src="/images/qr-code.png" className="icon" alt="QR" />
            <span className="title">{t('add_vault_qrcode')}</span>
            <span className="desc">
              {t('drop_file_here_or')} <u>{t('upload_it')}</u>
            </span>
          </div>
          <div className="state state-hover">
            <img src="/images/upload.png" className="icon" alt="upload" />
            <span className="title">{t('drop_file_here')}</span>
          </div>
          <div className="state state-done">
            <span className="msg">
              {status === 'error' ? t('import_failed') : t('import_successed')}
            </span>
            <img
              src={
                status === 'error'
                  ? '/images/qr-error.png'
                  : '/images/qr-success.png'
              }
              className="image"
              alt={status === 'error' ? 'error' : 'success'}
            />
            {(file as File)?.name && (
              <span className="name">{(file as File).name}</span>
            )}
          </div>
        </Upload.Dragger>

        {status !== 'default' && (
          <CloseLG className="clear" onClick={handleClear} />
        )}

        <span className="hint">{t('find_your_qrcode')}</span>
      </div>
      <div className="footer">
        <Button
          shape="round"
          type="primary"
          disabled={status !== 'success'}
          loading={loading}
          onClick={handleStart}
          block
        >
          {t('import_vault')}
        </Button>
      </div>
    </div>
  ) : (
    <div className="layout import-page">
      <div className="content">
        <div className="hint">{t('contine_in_new_window')}</div>
      </div>
    </div>
  )
}

export default Component
