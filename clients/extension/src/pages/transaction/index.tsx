import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/transaction/index.scss'

import { create } from '@bufbuild/protobuf'
import MiddleTruncate from '@clients/extension/src/components/middle-truncate'
import VultiError from '@clients/extension/src/components/vulti-error'
import VultiLoading from '@clients/extension/src/components/vulti-loading'
import {
  ArrowLeft,
  LinkExternal,
  QRCodeBorder,
  SquareArrow,
  SquareBehindSquare,
} from '@clients/extension/src/icons'
import api from '@clients/extension/src/utils/api'
import { splitString } from '@clients/extension/src/utils/functions'
import {
  ITransaction,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import {
  getStoredCurrency,
  getStoredTransactions,
  getStoredVaults,
  setStoredTransaction,
} from '@clients/extension/src/utils/storage'
import { getEncodedSignature } from '@clients/extension/src/utils/tx/getCustomMessageSignature'
import { getKeysignPayload } from '@clients/extension/src/utils/tx/getKeySignPayload'
import { getSignedTransaction } from '@clients/extension/src/utils/tx/getSignedTx'
import { getChainKind } from '@core/chain/ChainKind'
import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { KeysignResponse } from '@core/chain/tx/signature/generateSignature'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { getJoinKeysignUrl } from '@core/chain/utils/getJoinKeysignUrl'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getPreSignedInputData } from '@core/mpc/keysign/preSignedInputData'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Button, Form, Input, message, QRCode } from 'antd'
import { formatUnits, toUtf8String } from 'ethers'
import { keccak256 } from 'js-sha3'
import { StrictMode, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import { AppProviders } from '../../providers/AppProviders'
import ConfigProvider from '../../providers/config-provider'

interface FormProps {
  password: string
}

interface InitialState {
  fastSign?: boolean
  loading?: boolean
  keySignUrl?: string
  step: number
  transaction?: ITransaction
  vault?: VaultProps
  hasError?: boolean
  errorTitle?: string
  errorDescription?: string
  keysignPayload?: KeysignPayload
}

const Component = () => {
  const { t } = useTranslation()
  const walletCore = useWalletCore()
  const RETRY_TIMEOUT_MS = 120000
  const CLOSE_TIMEOUT_MS = 60000
  const initialState: InitialState = { step: 1, hasError: false }
  const [connectedDevices, setConnectedDevices] = useState(0)
  const [form] = Form.useForm()
  const [state, setState] = useState(initialState)
  const {
    loading,
    fastSign,
    keySignUrl,
    step,
    transaction,
    vault,
    hasError,
    errorTitle,
    errorDescription,
    keysignPayload,
  } = state
  const [messageApi, contextHolder] = message.useMessage()
  const qrContainerRef = useRef<HTMLDivElement>(null)

  const handleApp = (): void => {
    window.open(keySignUrl, '_self')
  }

  const handleClose = (): void => {
    window.close()
  }

  const handleCopy = (): void => {
    if (transaction?.txHash) {
      navigator.clipboard
        .writeText(transaction.txHash)
        .then(() => {
          messageApi.open({
            type: 'success',
            content: t('link_copied'),
          })
        })
        .catch(() => {
          messageApi.open({
            type: 'error',
            content: t('failed_to_copy_link'),
          })
        })
    }
  }

  const exportQRCode = () => {
    if (qrContainerRef.current) {
      const canvas = qrContainerRef.current.querySelector('canvas')
      if (canvas) {
        const dataURL = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataURL
        link.download = 'qrcode.png'
        link.click()
      }
    }
  }

  const initCloseTimer = (timeout: number) => {
    setTimeout(handleClose, timeout)
  }

  const handlePending = (
    preSignedImageHash: string,
    preSignedInputData: Uint8Array
  ): void => {
    if (transaction && walletCore) {
      const retryTimeout = setTimeout(() => {
        setStoredTransaction({ ...transaction, status: 'error' }).then(() => {
          setState({
            ...state,
            hasError: true,
            errorTitle: t('timeout_error'),
            errorDescription: t('signing_timeout_description'),
          })
        })
      }, RETRY_TIMEOUT_MS)

      const attemptTransaction = (): void => {
        api.transaction
          .getComplete(transaction.id, preSignedImageHash)
          .then(data => {
            clearTimeout(retryTimeout)
            const singaturesRecord: Record<string, KeysignResponse> = {
              [preSignedImageHash]: {
                ...data,
              },
            }

            getSignedTransaction({
              inputData: preSignedInputData,
              signatures: singaturesRecord,
              transaction,
              vault,
              walletCore,
            })
              .then(({ txResponse, raw }) => {
                setStoredTransaction({
                  ...transaction,
                  status: 'success',
                  txHash: txResponse,
                  raw,
                }).then(() => {
                  setState(prevState => ({
                    ...prevState,
                    step: 5,
                    transaction: { ...transaction, txHash: txResponse, raw },
                  }))

                  initCloseTimer(CLOSE_TIMEOUT_MS)
                })
              })
              .catch(() => {})
          })
          .catch(({ status }) => {
            if (status === 404) {
              setTimeout(attemptTransaction, 1000)
            } else {
              clearTimeout(retryTimeout)

              setStoredTransaction({ ...transaction, status: 'error' }).then(
                () => {
                  messageApi.open({
                    type: 'error',
                    content: t('retry_error'),
                  })
                }
              )
            }
          })
      }

      attemptTransaction()
    }
  }

  const handleCustomMessagePending = (): void => {
    if (!transaction) return
    const retryTimeout = setTimeout(() => {
      setStoredTransaction({ ...transaction, status: 'error' }).then(() => {
        setState({
          ...state,
          hasError: true,
          errorTitle: t('timeout_error'),
          errorDescription: t('signing_timeout_description'),
        })
      })
    }, RETRY_TIMEOUT_MS)

    const attemptTransaction = (): void => {
      api.transaction
        .getComplete(transaction.id)
        .then(data => {
          clearTimeout(retryTimeout)
          const customSignature = getEncodedSignature(
            data as KeysignResponse,
            walletCore!
          )
          setStoredTransaction({
            ...transaction,
            status: 'success',
            customSignature,
          }).then(() => {
            setState(prevState => ({
              ...prevState,
              step: 5,
              transaction: {
                ...transaction,
                customSignature,
              },
            }))
            initCloseTimer(CLOSE_TIMEOUT_MS)
          })
        })
        .catch(({ status }) => {
          if (status === 404) {
            setTimeout(() => {
              attemptTransaction()
            }, 1000)
          } else {
            clearTimeout(retryTimeout)
            setStoredTransaction({ ...transaction, status: 'error' }).then(
              () => {
                messageApi.open({
                  type: 'error',
                  content: t('retry_error'),
                })
              }
            )
          }
        })
    }
    attemptTransaction()
  }

  const handleStart = (): void => {
    if (transaction) {
      api.transaction
        .getDevices(transaction.id)
        .then(({ data }) => {
          setConnectedDevices(data?.length)
          if (data?.length > 1) {
            api.transaction
              .setStart(transaction.id, data)
              .then(() => {
                setStoredTransaction({ ...transaction, status: 'pending' })
                  .then(() => {
                    if (transaction.isCustomMessage) {
                      setState(prevState => ({
                        ...prevState,
                        step: 4,
                      }))
                      handleCustomMessagePending()
                    } else {
                      const preSignedInputData = getPreSignedInputData({
                        chain: transaction.chain.chain,
                        keysignPayload: keysignPayload!,
                        walletCore: walletCore!,
                      })
                      const preSignedImageHashes = getPreSigningHashes({
                        chain: transaction.chain.chain,
                        txInputData: preSignedInputData,
                        walletCore: walletCore!,
                      })
                      const imageHash = hexEncode({
                        value: preSignedImageHashes[0],
                        walletCore: walletCore!,
                      })
                      setState(prevState => ({
                        ...prevState,
                        step: 4,
                      }))
                      handlePending(imageHash, preSignedInputData)
                    }
                  })
                  .catch(err => {
                    console.log(err)
                  })
              })
              .catch(err => {
                console.log(err)
              })
          } else {
            setTimeout(() => {
              handleStart()
            }, 1000)
          }
        })
        .catch(() => {
          setStoredTransaction({ ...transaction, status: 'error' }).then(() => {
            messageApi.open({
              type: 'error',
              content: t('retry_error'),
            })
          })
        })
    }
  }

  const handleStep = (step: number): void => {
    switch (step) {
      case 2: {
        if (keySignUrl) {
          setState(prevState => ({ ...prevState, step }))
        } else if (transaction && vault) {
          setState(prevState => ({ ...prevState, loading: true }))
          let payload: KeysignMessagePayload
          if (transaction.isCustomMessage) {
            payload = {
              custom: create(CustomMessagePayloadSchema, {
                method: transaction.customMessage?.method,
                message: transaction.customMessage?.message,
              }),
            }
          } else {
            payload = {
              keysign: keysignPayload!,
            }
          }

          getJoinKeysignUrl({
            hexEncryptionKey: vault.hexChainCode,
            serverType: 'relay',
            serviceName: 'VultiConnect',
            sessionId: transaction.id,
            vaultId: vault.publicKeyEcdsa,
            payload,
            payloadId: '',
          })
            .then(keySignUrl => {
              api.fastVault
                .assertVaultExist(vault.publicKeyEcdsa)
                .then(exist => {
                  setState(prevState => ({
                    ...prevState,
                    fastSign: exist,
                    loading: false,
                    keySignUrl,
                    step,
                  }))

                  handleStart()
                })
            })
            .catch(() => {
              setState(prevState => ({ ...prevState, loading: false }))
            })
        }
        break
      }
      default: {
        setState(prevState => ({ ...prevState, step }))

        break
      }
    }
  }
  const handleFastSign = (): void => {
    if (connectedDevices >= 1) handleStep(3)
    else
      messageApi.open({
        type: 'warning',
        content: t('scan_first'),
      })
  }

  const handleSubmitFastSignPassword = (): void => {
    let imageHash = ''
    let preSignedInputData: Uint8Array<ArrayBufferLike>
    if (transaction && vault) {
      if (transaction.isCustomMessage) {
        const msg = transaction.customMessage!.message
        const messageToHash = msg.startsWith('0x')
          ? Buffer.from(msg.slice(2), 'hex')
          : msg

        imageHash = keccak256(messageToHash)
      } else {
        preSignedInputData = getPreSignedInputData({
          chain: transaction!.chain.chain,
          keysignPayload: keysignPayload!,
          walletCore: walletCore!,
        })
        const preSignedImageHashes = getPreSigningHashes({
          chain: transaction!.chain.chain,
          txInputData: preSignedInputData,
          walletCore: walletCore!,
        })
        imageHash = hexEncode({
          value: preSignedImageHashes[0],
          walletCore: walletCore!,
        })
      }
      const tssType = signatureAlgorithms[getChainKind(transaction.chain.chain)]
      form
        .validateFields()
        .then(({ password }: FormProps) => {
          api.fastVault
            .signWithServer({
              vault_password: password,
              hex_encryption_key: vault?.hexChainCode ?? '',
              is_ecdsa: tssType === 'ecdsa',
              derive_path: walletCore!.CoinTypeExt.derivationPath(
                getCoinType({
                  walletCore: walletCore!,
                  chain: transaction.chain.chain,
                })
              ),
              messages: [imageHash],
              public_key:
                tssType === 'ecdsa'
                  ? vault.publicKeyEcdsa
                  : vault.publicKeyEddsa,
              session: transaction.id,
            })
            .then(() => {
              setState(prevState => ({ ...prevState, step: 4 }))
              if (transaction.isCustomMessage) handleCustomMessagePending()
              else handlePending(imageHash, preSignedInputData)
            })
            .catch(err => {
              console.error(err)
              messageApi.open({
                type: 'error',
                content: t('signing_error'),
              })
            })
        })
        .catch(() => {})
    }
  }

  useEffect(() => {
    if (!walletCore) return

    Promise.all([
      getStoredCurrency(),
      getStoredTransactions(),
      getStoredVaults(),
    ]).then(([currency, transactions, vaults]) => {
      const [transaction] = transactions

      const vault = vaults.find(({ chains }) =>
        chains.some(
          ({ address }) =>
            address?.toLowerCase() ===
            transaction?.transactionDetails.from.toLowerCase()
        )
      )

      if (vault) {
        if (transaction.isCustomMessage) {
          setState(prevState => ({
            ...prevState,
            currency,
            loaded: true,
            transaction,
            vault,
          }))
        } else {
          getKeysignPayload(transaction, vault).then(keysignPayload => {
            transaction.txFee = String(
              formatUnits(
                getFeeAmount(
                  keysignPayload.blockchainSpecific as KeysignChainSpecific
                ),
                transaction.transactionDetails.amount?.decimals
              )
            )

            // Parse Memo
            transaction.memo = { isParsed: false, value: undefined }
            if (getChainKind(transaction.chain.chain) == 'evm') {
              getParsedMemo(keysignPayload.memo).then(parsedMemo => {
                if (parsedMemo) {
                  setState(prevState => ({
                    ...prevState,
                    transaction: {
                      ...prevState.transaction!,
                      memo: {
                        isParsed: true,
                        value: parsedMemo,
                      },
                    },
                  }))
                }
              })
            }
            if (!transaction.memo.isParsed) {
              try {
                transaction.memo.value = toUtf8String(
                  transaction.transactionDetails.data!
                )
              } catch {
                transaction.memo.value = transaction.transactionDetails.data
              }
            }

            setState(prevState => ({
              ...prevState,
              currency,
              loaded: true,
              transaction,
              keysignPayload,
              vault,
            }))
          })
        }
      } else {
        setState(prevState => ({
          ...prevState,
          hasError: true,
          errorTitle: t('get_vault_failed'),
          errorDescription: t('get_vault_failed_description'),
        }))
      }
    })
  }, [walletCore]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ConfigProvider>
      <div className={`layout step-${step}`}>
        {hasError ? (
          <VultiError
            onClose={handleClose}
            description={errorDescription ?? ''}
            title={errorTitle ?? ''}
          />
        ) : transaction ? (
          <>
            <div className="header">
              <span className="heading">
                {step === 1
                  ? t('verify_send')
                  : step === 5
                    ? t('transaction_successful')
                    : t('sign_transaction')}
              </span>
              {step === 2 && (
                <ArrowLeft
                  onClick={() => handleStep(1)}
                  className="icon icon-left"
                />
              )}
              {step === 2 && (
                <LinkExternal
                  onClick={() => exportQRCode()}
                  className="icon icon-right"
                />
              )}
              <span
                className="progress"
                style={{ width: `${(100 / 4) * step}%` }}
              />
            </div>
            {step === 1 ? (
              <>
                <div className="content">
                  <span className="divider">{t('transaction_details')}</span>
                  {!transaction.isCustomMessage && (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">{t('from')}</span>
                        <MiddleTruncate
                          text={transaction.transactionDetails.from}
                        />
                      </div>
                      {transaction.transactionDetails.to && (
                        <div className="list-item">
                          <span className="label">{t('to')}</span>
                          <MiddleTruncate
                            text={transaction.transactionDetails.to}
                          />
                        </div>
                      )}
                      {transaction.transactionDetails.amount?.amount && (
                        <div className="list-item">
                          <span className="label">{t('amount')}</span>
                          <span className="extra">{`${formatUnits(
                            transaction.transactionDetails.amount.amount,
                            transaction.transactionDetails.amount.decimals
                          )} ${keysignPayload?.coin?.ticker}`}</span>
                        </div>
                      )}
                      {transaction.memo?.value &&
                        !transaction.memo.isParsed && (
                          <div className="memo-item">
                            <span className="label">{t('memo')}</span>
                            <span className="extra">
                              <div>
                                {splitString(
                                  transaction.memo.value as string,
                                  32
                                ).map((str, index) => (
                                  <div key={index}>{str}</div>
                                ))}
                              </div>
                            </span>
                          </div>
                        )}
                      <div className="list-item">
                        <span className="label">{t('network_fee')}</span>
                        <span className="extra">
                          {`${transaction.txFee} ${transaction.chain.ticker}`}
                        </span>
                      </div>
                      {transaction.memo?.isParsed && (
                        <>
                          <div className="list-item">
                            <span className="label">
                              {t('function_signature')}
                            </span>
                            <div className="scrollable-x">
                              {
                                (transaction.memo.value as ParsedMemoParams)
                                  .functionSignature
                              }
                            </div>
                          </div>
                          <div className="list-item">
                            <span className="label">
                              {t('function_inputs')}
                            </span>
                            <div className="scrollable-x monospace-text ">
                              <div style={{ width: 'max-content' }}>
                                <div className="function-inputs">
                                  {
                                    (transaction.memo.value as ParsedMemoParams)
                                      .functionArguments
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {transaction.isCustomMessage && (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">{t('address')}</span>
                        <MiddleTruncate
                          text={transaction.transactionDetails.from}
                        />
                      </div>
                      <div className="list-item">
                        <span className="label">{t('message')}</span>
                        <MiddleTruncate
                          text={transaction.customMessage!.message}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="footer">
                  <Button
                    loading={loading}
                    onClick={() => handleStep(2)}
                    type="primary"
                    shape="round"
                    block
                  >
                    {t('sign')}
                  </Button>
                </div>
              </>
            ) : step === 2 ? (
              <>
                <div className="content">
                  <span className="hint">{t('scan_qr_with_two_devices')}</span>
                  <div className="qrcode">
                    <QRCodeBorder className="border" />
                    <div className="qr-container" ref={qrContainerRef}>
                      <QRCode
                        bordered
                        size={1000}
                        value={keySignUrl || ''}
                        color="white"
                      />
                    </div>
                  </div>
                </div>
                <div className="footer">
                  <Button
                    onClick={handleFastSign}
                    type="primary"
                    shape="round"
                    disabled={!fastSign}
                    block
                  >
                    {t('fast_sign')}
                  </Button>
                  <Button
                    onClick={handleApp}
                    type="default"
                    shape="round"
                    block
                  >
                    {t('open_desktop_app')}
                  </Button>
                </div>
              </>
            ) : step === 3 ? (
              <>
                <div className="content">
                  <div className="content">
                    <Form form={form}>
                      <Form.Item name="password" rules={[{ required: true }]}>
                        <Input
                          placeholder="FastSign Password"
                          type="password"
                        />
                      </Form.Item>
                      <Button htmlType="submit" />
                    </Form>
                  </div>
                  <div className="footer">
                    <Button
                      onClick={handleSubmitFastSignPassword}
                      type="primary"
                      shape="round"
                      block
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </>
            ) : step === 4 ? (
              <>
                <div className="content">
                  <VultiLoading />
                  <span className="message">{t('signing')}</span>
                </div>
              </>
            ) : (
              <>
                <div className="content">
                  {!transaction.isCustomMessage ? (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">{t('transaction')}</span>
                        <MiddleTruncate text={transaction.txHash!} />
                        <div className="actions">
                          <a
                            href={`${getBlockExplorerUrl({ chain: transaction.chain.chain, entity: 'tx', value: transaction.txHash! })}`}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="btn"
                          >
                            <SquareArrow />
                            {t('view_tx')}
                          </a>
                          <button className="btn" onClick={() => handleCopy()}>
                            <SquareBehindSquare />
                            {t('copy_tx')}
                          </button>
                        </div>
                      </div>
                      {transaction.transactionDetails.to && (
                        <div className="list-item">
                          <span className="label">{t('to')}</span>
                          <MiddleTruncate
                            text={transaction.transactionDetails.to}
                          />
                        </div>
                      )}

                      {transaction.transactionDetails.amount?.amount && (
                        <div className="list-item">
                          <span className="label">{t('amount')}</span>
                          <span className="extra">{`${formatUnits(
                            transaction.transactionDetails.amount.amount,
                            transaction.transactionDetails.amount.decimals
                          )} ${keysignPayload?.coin?.ticker}`}</span>
                        </div>
                      )}

                      {transaction.memo?.value &&
                        !transaction.memo?.isParsed && (
                          <div className="memo-item">
                            <span className="label">{t('memo')}</span>
                            <span className="extra">
                              <div>
                                {splitString(
                                  transaction.memo?.value as string,
                                  32
                                ).map((str, index) => (
                                  <div key={index}>{str}</div>
                                ))}
                              </div>
                            </span>
                          </div>
                        )}
                      <div className="list-item">
                        <span className="label">{t('network_fee')}</span>
                        <span className="extra">{`${transaction.txFee} ${transaction.chain.ticker}`}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="list">
                      <div className="list-item">
                        <span className="label">{t('signature')}</span>
                        <MiddleTruncate text={transaction.customSignature!} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="footer">
                  <Button
                    onClick={handleClose}
                    type="primary"
                    shape="round"
                    block
                  >
                    {t('done')}
                  </Button>
                </div>
              </>
            )}

            {contextHolder}
          </>
        ) : (
          <VultiLoading />
        )}
      </div>
    </ConfigProvider>
  )
}

export default Component

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Component />
    </AppProviders>
  </StrictMode>
)
