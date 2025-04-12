import '@clients/extension/src/pages/popup/pages/import/index.scss'

import { fromBinary } from '@bufbuild/protobuf'
import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft, CloseLG } from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import AddressProvider from '@clients/extension/src/utils/address-provider'
import {
  errorKey,
  isSupportedChain,
  supportedChains,
} from '@clients/extension/src/utils/constants'
import { calculateWindowPosition } from '@clients/extension/src/utils/functions'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import {
  VaultContainer,
  VaultContainerSchema,
} from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { Vault, VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { useWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Text } from '@lib/ui/text'
import { Button, Upload, UploadProps } from 'antd'
//import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { Buffer } from 'buffer'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { UAParser } from 'ua-parser-js'

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
  const navigate = useAppNavigate()
  const goBack = useGoBack()
  const walletCore = useWalletCore()
  const isPopup = new URLSearchParams(window.location.search).get('isPopup')

  const validateBase64 = (str: string): boolean => {
    const regex =
      /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

    return regex.test(str)
  }

  const decodeData = (data: string): Buffer => {
    return Buffer.from(data, 'base64')
  }

  const decodeContainer = (bytes: Buffer): VaultContainer => {
    return fromBinary(VaultContainerSchema, bytes)
  }

  const decodeVault = (bytes: Buffer): Vault => {
    return fromBinary(VaultSchema, bytes)
  }

  const handleFinish = (): void => {
    if (isPopup) window.close()
    else navigate('main')
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

    reader.onload = () => {
      const data = reader.result as string

      setState(prevState => ({ ...prevState, file }))

      if (data && validateBase64(data)) {
        const decodedData = decodeData(data)
        const decodedContainer = decodeContainer(decodedData)

        if (decodedContainer.vault) {
          if (decodedContainer.isEncrypted) {
            console.log('isEncrypted')

            // get password and decrypt vault
            // use decryptWithAesGcm
          } else {
            const decodedData = decodeData(decodedContainer.vault)
            const decodedVault = decodeVault(decodedData)

            if (decodedVault.hexChainCode) {
              setState(prevState => ({
                ...prevState,
                vault: {
                  ...(decodedVault as any as VaultProps),
                  apps: [],
                  chains: [],
                  transactions: [],
                },
                status: 'success',
              }))
            } else {
              handleError(errorKey.INVALID_VAULT)
            }
          }
        } else {
          handleError(errorKey.INVALID_FILE)
        }
      } else {
        handleError(errorKey.INVALID_FILE)
      }
    }

    reader.onerror = error => {
      handleError(errorKey.INVALID_FILE)
    }

    reader.readAsText(file)

    return false
  }

  const componentDidUpdate = (): void => {
    if (walletCore) {
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
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidUpdate, [walletCore])

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
            onClick={() => goBack(appPaths.main)}
          />
        )}
      </div>
      <div className="content">
        <Upload.Dragger {...props} className={status}>
          <div className="state state-default">
            <img src="/images/qr-code.png" className="icon" alt="QR" />
            <Text className="title" size={16} color="contrast" weight={700}>
              {t('add_vault_qrcode')}
            </Text>
            <span className="desc">
              {t('drop_file_here_or')} <u>{t('upload_it')}</u>
            </span>
          </div>
          <div className="state state-hover">
            <img src="/images/upload.png" className="icon" alt="upload" />
            <Text className="title" color="contrast" weight={700}>
              {t('drop_file_here')}
            </Text>
          </div>
          <div className="state state-done">
            <span className="msg">
              {status === 'error' ? t('import_failed') : t('import_successed')}
            </span>
            <img
              src={`/images/qr-${status}.png`}
              className="image"
              alt={status}
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
