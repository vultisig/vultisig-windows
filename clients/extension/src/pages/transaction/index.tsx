import { create } from '@bufbuild/protobuf'
import { MiddleTruncate } from '@clients/extension/src/components/middle-truncate'
import api from '@clients/extension/src/utils/api'
import { splitString } from '@clients/extension/src/utils/functions'
import { ITransaction } from '@clients/extension/src/utils/interfaces'
import {
  getStoredTransactions,
  setStoredTransaction,
} from '@clients/extension/src/utils/storage'
import { getEncodedSignature } from '@clients/extension/src/utils/tx/getCustomMessageSignature'
import { getKeysignPayload } from '@clients/extension/src/utils/tx/getKeySignPayload'
import { getSignedTransaction } from '@clients/extension/src/utils/tx/getSignedTx'
import { getSolanaSwapKeysignPayload } from '@clients/extension/src/utils/tx/solana/solanaKeysignPayload'
import { getParsedSolanaSwap } from '@clients/extension/src/utils/tx/solana/solanaSwap'
import { ParsedSolanaSwapParams } from '@clients/extension/src/utils/tx/solana/types/types'
import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { getOneInchSwapTxInputData } from '@core/chain/swap/general/oneInch/tx/getOneInchSwapTxInputData'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { getJoinKeysignUrl } from '@core/chain/utils/getJoinKeysignUrl'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { getPreSignedInputData } from '@core/mpc/keysign/preSignedInputData'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCore } from '@core/ui/state/core'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useVaults } from '@core/ui/storage/vaults'
import { Vault } from '@core/ui/vault/Vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { Divider } from '@lib/ui/divider'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { formatUnits, toUtf8String } from 'ethers'
import { keccak256 } from 'js-sha3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled from 'styled-components'
import { z } from 'zod'

const StyledCard = styled(VStack)<{ padding?: number }>`
  background-color: ${getColor('backgroundsSecondary')};
  border-radius: 12px;
  overflow-y: hidden;
  padding: ${({ padding = 16 }) => padding}px;
`

interface InitialState {
  fastSign?: boolean
  loading?: boolean
  keySignUrl?: string
  step: number
  transaction?: ITransaction
  vault?: Vault
  hasError?: boolean
  errorTitle?: string
  errorDescription?: string
  keysignPayload?: KeysignPayload
}

export const TransactionPage = () => {
  const { t } = useTranslation()
  const walletCore = useWalletCore()
  const RETRY_TIMEOUT_MS = 120000
  const CLOSE_TIMEOUT_MS = 60000
  const initialState: InitialState = { step: 1, hasError: false }
  const [connectedDevices, setConnectedDevices] = useState([''])
  const vaults = useVaults() ?? []
  const [state, setState] = useState(initialState)
  const {
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
  const currency = useFiatCurrency()
  const { openUrl } = useCore()
  const qrContainerRef = useRef<HTMLDivElement>(null)
  const steps = fastSign ? 5 : 4

  const formSchema = useMemo(
    () =>
      z.object({
        password: z.string().min(2, t('password_required')).max(50),
      }),
    [t]
  )
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  })

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
          // TODO: add success message t('link_copied')
        })
        .catch(() => {
          // TODO: add error message t('failed_to_copy_link')
        })
    }
  }

  const exportQRCode = () => {
    if (qrContainerRef.current) {
      const canvas = qrContainerRef.current.querySelector('canvas')

      if (canvas) {
        try {
          const dataURL = canvas.toDataURL('image/png')
          const link = document.createElement('a')
          link.href = dataURL
          link.download = 'qrcode.png'
          link.click()
        } catch {
          // TODO: add error message t('failed_to_export_qr')
        }
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
            const singaturesRecord: Record<string, KeysignSignature> = {
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
                    step: 6,
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
                  // TODO: add error message t('retry_error')
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
            data as KeysignSignature,
            walletCore!
          )
          setStoredTransaction({
            ...transaction,
            status: 'success',
            customSignature,
          }).then(() => {
            setState(prevState => ({
              ...prevState,
              step: 6,
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
                // TODO: add error message t('retry_error')
              }
            )
          }
        })
    }
    attemptTransaction()
  }

  const handleCheckDevices = (): void => {
    if (transaction) {
      api.transaction
        .getDevices(transaction.id)
        .then(({ data }) => {
          setConnectedDevices(data)
          if (fastSign && data.length > 0) {
            handleStep(3)
          } else if (data?.length > 1) {
            handleStep(3)
          } else {
            setTimeout(() => {
              handleCheckDevices()
            }, 1000)
          }
        })
        .catch(() => {
          setStoredTransaction({ ...transaction, status: 'error' }).then(() => {
            // TODO: add error message t('failed_to_start_keysign')
          })
        })
    }
  }

  const handleStartSigning = () => {
    if (!transaction || fastSign) {
      handleStep(4)
      return
    }

    startSigning(transaction, connectedDevices).catch(err => {
      console.error('Signing failed:', err)
    })
  }

  const startSigning = async (
    transaction: ITransaction,
    connectedDevices: any
  ) => {
    try {
      await api.transaction.setStart(transaction.id, connectedDevices)
    } catch (err) {
      console.error('Failed to set transaction start:', err)
      // TODO: add error message t('failed_to_start_keysign')
      return
    }
    try {
      await setStoredTransaction({ ...transaction, status: 'pending' })
    } catch (err) {
      console.error('Failed to update stored transaction:', err)
      return
    }

    if (transaction.isCustomMessage) {
      setState(prev => ({ ...prev, step: 4 }))
      handleCustomMessagePending()
      return
    }

    if (!keysignPayload || !walletCore) throw new Error('Missing signing data')
    try {
      const inputData = await getTxInputData(keysignPayload)
      const imageHashes = getPreSigningHashes({
        chain: transaction.chain,
        txInputData: inputData,
        walletCore,
      })
      const imageHash = hexEncode({ value: imageHashes[0], walletCore })

      setState(prev => ({ ...prev, step: 4 }))
      handlePending(imageHash, inputData)
    } catch (err) {
      console.error('Unexpected error during signing:', err)
      // TODO: add error message t('signing_error')
    }
  }

  const getTxInputData = async (
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> => {
    if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
      if (keysignPayload.swapPayload.case !== 'oneinchSwapPayload') {
        console.warn(
          `Swap payload type ${keysignPayload.swapPayload.case} not explicitly supported, using fallback`
        )
        return getPreSignedInputData({
          chain: transaction!.chain,
          keysignPayload,
          walletCore: walletCore!,
        })
      }

      return await getOneInchSwapTxInputData({
        keysignPayload,
        walletCore: walletCore!,
      })
    }

    return getPreSignedInputData({
      chain: transaction!.chain,
      keysignPayload,
      walletCore: walletCore!,
    })
  }

  const handleStep = (step: number): void => {
    switch (step) {
      case 1: {
        setState(prevState => ({ ...prevState, step }))

        break
      }
      case 2: {
        if (keySignUrl) {
          setState(prevState => ({ ...prevState, step }))
        } else if (transaction && vault) {
          let payload: KeysignMessagePayload

          setState(prevState => ({ ...prevState, loading: true }))

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
            vaultId: vault.publicKeys.ecdsa,
            payload,
            payloadId: '',
          })
            .then(keySignUrl => {
              setState(prevState => ({
                ...prevState,
                loading: false,
                keySignUrl,
                step,
              }))

              handleCheckDevices()
            })
            .catch(() => {
              setState(prevState => ({ ...prevState, loading: false }))
            })
        }

        break
      }
      case 3: {
        setState(prevState => ({ ...prevState, step }))

        break
      }
      case 4: {
        setState(prevState => ({ ...prevState, step }))

        break
      }
      default: {
        setState(prevState => ({ ...prevState, step }))
        break
      }
    }
  }

  const handleSubmitFastSignPassword = async ({
    password,
  }: FieldValues): Promise<void> => {
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
        if (!keysignPayload) return
        if (
          'swapPayload' in keysignPayload &&
          keysignPayload.swapPayload.value
        ) {
          if (keysignPayload.swapPayload.case !== 'oneinchSwapPayload') {
            console.warn(
              `Swap payload type ${keysignPayload.swapPayload.case} not explicitly supported, using fallback`
            )
            preSignedInputData = getPreSignedInputData({
              chain: transaction!.chain,
              keysignPayload: keysignPayload!,
              walletCore: walletCore!,
            })
          }

          preSignedInputData = await getOneInchSwapTxInputData({
            keysignPayload,
            walletCore: walletCore!,
          })
        } else {
          preSignedInputData = getPreSignedInputData({
            chain: transaction!.chain,
            keysignPayload: keysignPayload!,
            walletCore: walletCore!,
          })
        }

        const preSignedImageHashes = getPreSigningHashes({
          chain: transaction!.chain,
          txInputData: preSignedInputData,
          walletCore: walletCore!,
        })
        imageHash = hexEncode({
          value: preSignedImageHashes[0],
          walletCore: walletCore!,
        })
      }

      const signatureAlgorithm =
        signatureAlgorithms[getChainKind(transaction.chain)]

      if (isValid && isDirty) {
        api.fastVault
          .signWithServer({
            vault_password: password,
            hex_encryption_key: vault?.hexChainCode ?? '',
            is_ecdsa: signatureAlgorithm === 'ecdsa',
            derive_path: walletCore!.CoinTypeExt.derivationPath(
              getCoinType({
                walletCore: walletCore!,
                chain: transaction.chain,
              })
            ),
            messages: [imageHash],
            public_key:
              signatureAlgorithm === 'ecdsa'
                ? vault.publicKeys.ecdsa
                : vault.publicKeys.eddsa,
            session: transaction.id,
          })
          .then(() => {
            setState(prevState => ({ ...prevState, step: 5 }))
            if (transaction.isCustomMessage) handleCustomMessagePending()
            else handlePending(imageHash, preSignedInputData)
          })
          .catch(err => {
            console.error(err)
            // TODO: add error message t('signing_error')
          })
      }
    }
  }

  const getFormattedTxHash = (transaction: ITransaction): string => {
    if (!transaction.txHash) return ''
    const chainKind = getChainKind(transaction.chain)
    const hash =
      chainKind === 'evm'
        ? transaction.txHash
        : stripHexPrefix(transaction.txHash)
    return chainKind === 'cosmos' ? hash.toUpperCase() : hash
  }

  useEffect(() => {
    if (walletCore) {
      Promise.all([getStoredTransactions()]).then(async ([transactions]) => {
        if (!transactions.length) return
        let parsedSolanaSwap: ParsedSolanaSwapParams | undefined
        const [transaction] = transactions
        if ((transaction as any).serializedTx) {
          try {
            parsedSolanaSwap = await getParsedSolanaSwap(
              walletCore,
              (transaction as any).serializedTx
            )
            transaction.transactionDetails = {
              asset: {
                chain: Chain.Solana,
                ticker: parsedSolanaSwap.inputToken.symbol,
                symbol: parsedSolanaSwap.inputToken.name,
              },
              from: parsedSolanaSwap.authority!,
              amount: {
                amount: String(parsedSolanaSwap.inAmount),
                decimals: parsedSolanaSwap.inputToken.decimals,
              },
            }
          } catch (err) {
            console.error('Failed to parse Solana swap transaction:', err)
          }
        }

        const vault = vaults.find(({ coins }) =>
          coins.some(
            ({ address }) =>
              address?.toLowerCase() ===
              transaction?.transactionDetails.from.toLowerCase()
          )
        )

        if (!vault) {
          setState(prevState => ({
            ...prevState,
            hasError: true,
            errorTitle: t('get_vault_failed'),
            errorDescription: t('get_vault_failed_description'),
          }))
          return
        }

        try {
          const fastSign = await api.fastVault.assertVaultExist(
            vault.publicKeys.ecdsa
          )

          if (transaction.isCustomMessage) {
            setState(prev => ({
              ...prev,
              currency,
              fastSign,
              loaded: true,
              transaction,
              vault,
            }))
            return
          }

          let keysignPayload

          if ((transaction as any).serializedTx && parsedSolanaSwap) {
            keysignPayload = await getSolanaSwapKeysignPayload(
              parsedSolanaSwap,
              transaction,
              vault,
              walletCore
            )
          } else if ((transaction as any).serializedTx) {
            console.error('Failed to parse Solana swap transaction')
            throw new Error('Failed to parse Solana swap transaction')
          } else {
            keysignPayload = await getKeysignPayload(
              transaction,
              vault,
              walletCore
            )

            transaction.txFee = String(
              formatUnits(
                getFeeAmount(
                  keysignPayload.blockchainSpecific as KeysignChainSpecific
                ),
                transaction.transactionDetails.amount?.decimals
              )
            )

            transaction.memo = { isParsed: false, value: undefined }

            if (getChainKind(transaction.chain) === 'evm') {
              const parsedMemo = await getParsedMemo(keysignPayload.memo)
              if (parsedMemo) {
                transaction.memo = {
                  isParsed: true,
                  value: parsedMemo,
                }
              }
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
          }

          setState(prev => ({
            ...prev,
            currency,
            fastSign,
            loaded: true,
            transaction,
            keysignPayload,
            vault,
          }))
        } catch (err) {
          console.error('Vault or keysign error:', err)
          setState(prev => ({
            ...prev,
            hasError: true,
            errorTitle: t('get_vault_failed'),
            errorDescription: t('get_vault_failed_description'),
          }))
        }
      })
    }
  }, [walletCore]) // eslint-disable-line react-hooks/exhaustive-deps

  return hasError ? (
    <VStack alignItems="center" justifyContent="center" fullHeight>
      <StyledCard
        alignItems="center"
        gap={24}
        justifyContent="center"
        padding={64}
      >
        <TriangleAlertIcon fontSize={36} />
        <VStack alignItems="center" gap={16} justifyContent="center" fullWidth>
          <Text color="contrast" size={17} weight={500} centerHorizontally>
            {errorTitle}
          </Text>
          <Text color="light" size={14} weight={500} centerHorizontally>
            {errorDescription}
          </Text>
        </VStack>
      </StyledCard>
    </VStack>
  ) : transaction ? (
    step === 1 ? (
      <VStack fullHeight>
        <PageHeader
          primaryControls={
            <PageHeaderIconButton icon={<CrossIcon />} onClick={handleClose} />
          }
          title={
            <PageHeaderTitle>
              {`${t('sign_transaction')} (${step}/${steps})`}
            </PageHeaderTitle>
          }
          hasBorder
        />
        <PageContent flexGrow scrollable>
          <List>
            {transaction.isCustomMessage ? (
              <>
                <ListItem
                  title={t('address')}
                  description={transaction.transactionDetails.from}
                />
                <ListItem
                  title={t('message')}
                  description={transaction.customMessage!.message}
                />
              </>
            ) : (
              <>
                <ListItem
                  title={t('from')}
                  description={
                    <MiddleTruncate
                      text={transaction.transactionDetails.from}
                    />
                  }
                />
                {transaction.transactionDetails.to && (
                  <ListItem
                    title={t('to')}
                    description={
                      <MiddleTruncate
                        text={transaction.transactionDetails.to}
                      />
                    }
                  />
                )}
                {transaction.transactionDetails.amount?.amount && (
                  <ListItem
                    title={t('amount')}
                    description={`${formatUnits(
                      transaction.transactionDetails.amount.amount,
                      transaction.transactionDetails.amount.decimals
                    )} ${keysignPayload?.coin?.ticker}`}
                  />
                )}
                <ListItem title="Network" description={transaction.chain} />
                <ListItem
                  title={t('network_fee')}
                  description={`${transaction.txFee} ${chainFeeCoin[transaction.chain].ticker}`}
                />
                {transaction.memo?.isParsed ? (
                  <>
                    <ListItem
                      title={t('function_signature')}
                      description={
                        <VStack as="pre" scrollable>
                          <Text as="code" family="mono">
                            {
                              (transaction.memo.value as ParsedMemoParams)
                                .functionSignature
                            }
                          </Text>
                        </VStack>
                      }
                    />
                    <ListItem
                      title={t('function_inputs')}
                      description={
                        <VStack as="pre" scrollable>
                          <Text as="code" family="mono">
                            {
                              (transaction.memo.value as ParsedMemoParams)
                                .functionArguments
                            }
                          </Text>
                        </VStack>
                      }
                    />
                  </>
                ) : transaction.memo?.value ? (
                  <ListItem
                    title={t('memo')}
                    description={splitString(
                      transaction.memo.value as string,
                      32
                    ).map((str, index) => (
                      <span key={index}>{str}</span>
                    ))}
                  />
                ) : null}
              </>
            )}
          </List>
        </PageContent>
        <PageFooter>
          <Button kind="primary" onClick={() => handleStep(2)}>
            {t('sign')}
          </Button>
        </PageFooter>
      </VStack>
    ) : step === 2 ? (
      <VStack fullHeight>
        <PageHeader
          primaryControls={
            <PageHeaderIconButton
              icon={<ChevronLeftIcon />}
              onClick={() => handleStep(step - 1)}
            />
          }
          title={
            <PageHeaderTitle>
              {`${t('sign_transaction')} (${step}/${steps})`}
            </PageHeaderTitle>
          }
          hasBorder
        />
        <PageContent gap={16} flexGrow scrollable>
          <List>
            <ListItem icon={<CheckIcon />} title="Starting transaction" />
            <ListItem
              title={
                fastSign
                  ? 'Scan QR with your mobile device'
                  : 'Scan QR with at least 2 other devices linked to this vault'
              }
              description={`Step 2 of ${steps}`}
            />
          </List>
          <StyledCard alignItems="center" ref={qrContainerRef}>
            <QRCode
              bgColor="transparent"
              fgColor="white"
              size={1000}
              value={keySignUrl || ''}
              onClick={exportQRCode}
              style={{ height: 368, width: 368 }}
            />
          </StyledCard>
          {!fastSign && (
            <List>
              {connectedDevices.length > 0 ? (
                <ListItem
                  icon={<CheckIcon />}
                  status="success"
                  title={connectedDevices[0]}
                />
              ) : (
                <ListItem
                  title={
                    <>
                      Scan with 1<sup>st</sup> device
                    </>
                  }
                />
              )}
              {connectedDevices.length > 1 ? (
                <ListItem
                  icon={<CheckIcon />}
                  status="success"
                  title={connectedDevices[1]}
                />
              ) : (
                <ListItem
                  title={
                    <>
                      Scan with 1<sup>st</sup> device
                    </>
                  }
                />
              )}
            </List>
          )}
          <Divider text={t('or')} />
          <Button kind="secondary" onClick={handleApp}>
            Sign with desktop app instead
          </Button>
        </PageContent>
      </VStack>
    ) : step === 3 ? (
      <VStack fullHeight>
        <PageHeader
          primaryControls={
            <PageHeaderIconButton
              icon={<ChevronLeftIcon />}
              onClick={() => handleStep(step - 1)}
            />
          }
          title={
            <PageHeaderTitle>
              {`${t('sign_transaction')} (${step}/${steps})`}
            </PageHeaderTitle>
          }
          hasBorder
        />
        <PageContent flexGrow scrollable>
          <List>
            <ListItem icon={<CheckIcon />} title="Starting transaction" />
            <ListItem
              icon={<CheckIcon />}
              title="Scan QR with your other device"
            />
            <ListItem
              description={`Step 3 of ${steps}`}
              title={
                fastSign
                  ? 'Confirm transaction by signing with server share'
                  : 'Sign with this device and confirm transaction'
              }
            />
          </List>
        </PageContent>
        <PageFooter>
          <Button kind="secondary" onClick={handleStartSigning}>
            {fastSign
              ? 'Confirm & signing with server'
              : 'Confirm & sign with device'}
          </Button>
        </PageFooter>
      </VStack>
    ) : step === 4 ? (
      fastSign ? (
        <VStack
          as="form"
          gap={16}
          onSubmit={handleSubmit(handleSubmitFastSignPassword)}
          fullHeight
        >
          <PageHeader
            primaryControls={
              <PageHeaderIconButton
                icon={<ChevronLeftIcon />}
                onClick={() => handleStep(step - 1)}
              />
            }
            title={
              <PageHeaderTitle>
                {`${t('sign_transaction')} (${step}/${steps})`}
              </PageHeaderTitle>
            }
            hasBorder
          />
          <PageContent gap={16} flexGrow scrollable>
            <List>
              <ListItem icon={<CheckIcon />} title="Starting transaction" />
              <ListItem
                icon={<CheckIcon />}
                title="Scan QR with your other device"
              />
              <ListItem icon={<CheckIcon />} title="Transaction confirmed" />
              <ListItem
                description={`Step 4 of ${steps}`}
                title="Transaction confirmed"
              />
            </List>
            <VStack gap={12}>
              <PasswordInput
                placeholder="Enter password"
                {...register('password')}
              />
              {typeof errors.password?.message === 'string' && (
                <Text color="danger" size={12}>
                  {errors.password.message}
                </Text>
              )}
            </VStack>
          </PageContent>
          <PageFooter>
            <Button disabled={!isValid || !isDirty} kind="secondary">
              Submit
            </Button>
          </PageFooter>
        </VStack>
      ) : (
        <VStack fullHeight>
          <PageHeader
            secondaryControls={<Spinner />}
            title={
              <PageHeaderTitle>
                {`${t('sign_transaction')} (${step}/${steps})`}
              </PageHeaderTitle>
            }
            hasBorder
          />
          <PageContent flexGrow scrollable>
            <List>
              <ListItem icon={<CheckIcon />} title="Starting transaction" />
              <ListItem
                icon={<CheckIcon />}
                title="Scan QR with your other device"
              />
              <ListItem icon={<CheckIcon />} title="Signed with server share" />
              <ListItem
                description={`Step 4 of ${steps}`}
                title="Signing Transaction"
              />
            </List>
          </PageContent>
        </VStack>
      )
    ) : step === 5 && fastSign ? (
      <VStack fullHeight>
        <PageHeader
          secondaryControls={<Spinner />}
          title={<PageHeaderTitle>{t('overview')}</PageHeaderTitle>}
          hasBorder
        />
        <PageContent flexGrow>
          <List>
            <ListItem icon={<CheckIcon />} title="Starting transaction" />
            <ListItem
              icon={<CheckIcon />}
              title="Scan QR with your other device"
            />
            <ListItem icon={<CheckIcon />} title="Transaction confirmed" />
            <ListItem icon={<CheckIcon />} title="Signed with server share" />
            <ListItem
              description="Step 5 of 5"
              title="Finalizing transaction"
            />
          </List>
        </PageContent>
      </VStack>
    ) : (
      <VStack fullHeight>
        <PageHeader
          title={<PageHeaderTitle>{t('overview')}</PageHeaderTitle>}
          hasBorder
        />
        <PageContent flexGrow>
          {transaction.isCustomMessage ? (
            <List>
              <ListItem
                description={
                  <MiddleTruncate text={transaction.customSignature!} />
                }
                title={t('signature')}
              />
            </List>
          ) : (
            <List>
              <ListItem
                description={
                  <MiddleTruncate
                    text={transaction.txHash!}
                    onClick={() => handleCopy()}
                  />
                }
                extra={
                  <IconButton
                    icon={<SquareArrowOutUpRightIcon />}
                    onClick={() =>
                      openUrl(
                        `${getBlockExplorerUrl({ chain: transaction.chain, entity: 'tx', value: getFormattedTxHash(transaction) })}`
                      )
                    }
                  />
                }
                title="TX ID"
              />
              <ListItem
                description={
                  <MiddleTruncate text={transaction.transactionDetails.from} />
                }
                title={t('from')}
              />
              {transaction.transactionDetails.to && (
                <ListItem
                  description={
                    <MiddleTruncate text={transaction.transactionDetails.to} />
                  }
                  title={t('to')}
                />
              )}
              {transaction.transactionDetails.amount?.amount && (
                <ListItem
                  extra={`${formatUnits(
                    transaction.transactionDetails.amount.amount,
                    transaction.transactionDetails.amount.decimals
                  )} ${keysignPayload?.coin?.ticker}`}
                  title={t('amount')}
                />
              )}
              <ListItem extra={transaction.chain} title="Network" />
              <ListItem
                extra={`${transaction.txFee} ${chainFeeCoin[transaction.chain].ticker}`}
                title={t('network_fee')}
              />

              {transaction.memo?.value && !transaction.memo?.isParsed && (
                <ListItem
                  extra={splitString(transaction.memo?.value as string, 32).map(
                    (str, index) => (
                      <span key={index}>{str}</span>
                    )
                  )}
                  title={t('memo')}
                />
              )}
            </List>
          )}
        </PageContent>
        <PageFooter>
          <Button kind="primary" onClick={handleClose}>
            {t('done')}
          </Button>
        </PageFooter>
      </VStack>
    )
  ) : (
    <VStack alignItems="center" justifyContent="center" fullHeight>
      <Spinner size={32} />
    </VStack>
  )
}
