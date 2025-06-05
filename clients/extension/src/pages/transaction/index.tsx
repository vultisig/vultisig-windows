import { create } from '@bufbuild/protobuf'
import { getVaultTransactions } from '@clients/extension/src/transactions/state/transactions'
import { splitString } from '@clients/extension/src/utils/functions'
import { getKeysignPayload } from '@clients/extension/src/utils/tx/getKeySignPayload'
import { getSolanaSwapKeysignPayload } from '@clients/extension/src/utils/tx/solana/solanaKeysignPayload'
import { getParsedSolanaSwap } from '@clients/extension/src/utils/tx/solana/solanaSwap'
import { getChainKind } from '@core/chain/ChainKind'
import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { defaultEvmSwapGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { getKeysignChain } from '@core/ui/mpc/keysign/utils/getKeysignChain'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMutation } from '@tanstack/react-query'
import { formatUnits, toUtf8String, parseUnits } from 'ethers'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { GasPumpIcon } from '@lib/ui/icons/GasPumpIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { Modal } from '@lib/ui/modal'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { FeeContainer } from '@core/ui/vault/send/fee/settings/FeeContainer'
import { useEvmBaseFeeQuery } from '@core/ui/chain/queries/evm/useEvmBaseFeeQuery'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { EvmChain } from '@core/chain/Chain'
import { Opener } from '@lib/ui/base/Opener'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { OnCloseProp } from '@lib/ui/props'
import styled from 'styled-components'
import { IKeysignTransactionPayload } from '@clients/extension/src/utils/interfaces'

const GasFeeAdjuster = ({ 
  keysignPayload, 
  onFeeChange,
  baseFee
}: { 
  keysignPayload: KeysignMessagePayload
  onFeeChange: (fee: number, gasLimit: number) => void
  baseFee: number
}) => {
  if (!('keysign' in keysignPayload)) return null
  
  const chain = getKeysignChain(keysignPayload.keysign)
  const chainKind = getChainKind(chain)
  
  if (chainKind !== 'evm') return null

  const [isOpen, setIsOpen] = useState(false)
  const [gasFee, setGasFee] = useState(() => {
    // Get initial fee from transaction and convert from wei to gwei
    const transactionPayload = keysignPayload.keysign as unknown as IKeysignTransactionPayload
    if (transactionPayload.transactionDetails?.gasSettings?.maxPriorityFeePerGas) {
      return Number(formatUnits(BigInt(transactionPayload.transactionDetails.gasSettings.maxPriorityFeePerGas), gwei.decimals))
    }
    if (transactionPayload.maxPriorityFeePerGas) {
      return Number(formatUnits(BigInt(transactionPayload.maxPriorityFeePerGas), gwei.decimals))
    }
    return 0
  })
  const [gasLimit, setGasLimit] = useState(() => {
    const transactionPayload = keysignPayload.keysign as unknown as IKeysignTransactionPayload
    if (transactionPayload.transactionDetails?.gasSettings?.gasLimit) {
      return Number(transactionPayload.transactionDetails.gasSettings.gasLimit)
    }
    if (transactionPayload.gasLimit) {
      return Number(transactionPayload.gasLimit)
    }
    return 21000
  })

  const handleSubmit = () => {
    // Update the transaction with the new fee and gas limit
    if ('keysign' in keysignPayload) {
      const keysign = keysignPayload.keysign
      const totalFee = baseFee + gasFee
      
      // Update the transaction fee in the blockchain specific data
      if (keysign.blockchainSpecific && 'evm' in keysign.blockchainSpecific) {
        const evmSpecific = keysign.blockchainSpecific.evm as { priorityFee: string, maxFeePerGasWei: string, gasLimit?: string }
        // Convert gwei to wei for blockchain
        const priorityFeeInWei = (BigInt(Math.floor(gasFee * 1e9))).toString()
        const maxFeePerGasWei = (BigInt(Math.floor((baseFee * 1.5 + gasFee) * 1e9))).toString()
        evmSpecific.priorityFee = priorityFeeInWei
        evmSpecific.maxFeePerGasWei = maxFeePerGasWei
        evmSpecific.gasLimit = gasLimit.toString()
      }

      // Update the transaction payload
      const transactionPayload = keysign as unknown as IKeysignTransactionPayload
      // Convert gwei to wei for blockchain
      const priorityFeeInWei = (BigInt(Math.floor(gasFee * 1e9))).toString()
      const maxFeePerGasWei = (BigInt(Math.floor((baseFee * 1.5 + gasFee) * 1e9))).toString()
      transactionPayload.maxPriorityFeePerGas = priorityFeeInWei
      transactionPayload.maxFeePerGas = maxFeePerGasWei
      transactionPayload.gasLimit = gasLimit.toString()
      transactionPayload.txFee = totalFee.toString()
    }
    onFeeChange(gasFee, gasLimit)
    setIsOpen(false)
  }

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)}>
        <IconWrapper style={{ fontSize: 16 }}>
          <GasPumpIcon />
        </IconWrapper>
      </IconButton>

      {isOpen && (
        <Modal
          as="form"
          {...getFormProps({
            onSubmit: handleSubmit,
            onClose: () => setIsOpen(false),
          })}
          onClose={() => setIsOpen(false)}
          title={t('advanced_gas_fee')}
          footer={<Button htmlType="submit">{t('save')}</Button>}
        >
          <VStack gap={12}>
            <LineWrapper>
              <HorizontalLine />
            </LineWrapper>
            <InputContainer>
              <Text size={14} color="supporting">
                {t('current_base_fee')} ({t('gwei')})
              </Text>
              <FeeContainer>
                {formatTokenAmount(fromChainAmount(BigInt(Math.floor(baseFee * 1e9)), gwei.decimals))}
              </FeeContainer>
            </InputContainer>
            <AmountTextInput
              labelPosition="left"
              label={
                <Tooltip
                  content={<Text>{t('priority_fee_tooltip_content')}</Text>}
                  renderOpener={props => {
                    return (
                      <Text size={14} color="supporting" {...props}>
                        {t('priority_fee')} ({t('gwei')})
                      </Text>
                    )
                  }}
                />
              }
              value={gasFee}
              onValueChange={fee => {
                if (fee === null) {
                  setGasFee(0)
                  return
                }
                // Convert to gwei using BigInt
                const feeInGwei = Number(BigInt(Math.floor(fee * 1e9))) / 1e9
                setGasFee(feeInGwei)
              }}
            />
            <AmountTextInput
              labelPosition="left"
              label={
                <Tooltip
                  content={<Text>{t('gas_limit_tooltip_content')}</Text>}
                  renderOpener={props => (
                    <Text size={14} color="supporting" {...props}>
                      {t('gas_limit')}
                    </Text>
                  )}
                />
              }
              value={gasLimit}
              onValueChange={limit => {
                if (limit === null) {
                  setGasLimit(21000)
                  return
                }
                setGasLimit(Math.floor(limit))
              }}
            />
          </VStack>
        </Modal>
      )}
    </>
  )
}

const LineWrapper = styled.div`
  margin-top: -5px;
  margin-bottom: 14px;
`

export const TransactionPage = () => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const [updatedTxFee, setUpdatedTxFee] = useState<string | null>(null)
  const handleClose = (): void => {
    window.close()
  }
  const { mutate: processTransaction, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      const transactions = await getVaultTransactions(getVaultId(vault))
      const transaction = getLastItem(transactions)
      if (!transaction) {
        throw new Error('No current transaction present')
      }
      const keysignMessagePayload: KeysignMessagePayload =
        await matchRecordUnion(transaction.transactionPayload, {
          keysign: async keysign => {
            const gasSettings: FeeSettings | null = match(
              getChainKind(keysign.chain),
              {
                evm: () => ({
                  priority: 'fast',
                  gasLimit: defaultEvmSwapGasLimit,
                }),
                utxo: () => ({ priority: 'fast' }),
                cosmos: () => null,
                sui: () => null,
                solana: () => null,
                polkadot: () => null,
                ton: () => null,
                ripple: () => null,
                tron: () => null,
              }
            )

            const keysignPayload = await getKeysignPayload(
              keysign,
              vault,
              walletCore,
              gasSettings
            )

            keysign.txFee = String(
              formatUnits(
                getFeeAmount(
                  keysignPayload.blockchainSpecific as KeysignChainSpecific
                ),
                keysign.transactionDetails.amount?.decimals
              )
            )

            keysign.memo = { isParsed: false, value: undefined }

            if (getChainKind(keysign.chain) === 'evm') {
              const parsedMemo = await getParsedMemo(keysignPayload.memo)
              if (parsedMemo) {
                keysign.memo = { isParsed: true, value: parsedMemo }
              }
            }

            if (!keysign.memo.isParsed) {
              try {
                keysign.memo.value = toUtf8String(
                  keysign.transactionDetails.data!
                )
              } catch {
                keysign.memo.value = keysign.transactionDetails.data
              }
            }

            return { keysign: keysignPayload }
          },
          custom: async custom => {
            return {
              custom: create(CustomMessagePayloadSchema, {
                method: custom.method,
                message: custom.message,
              }),
            }
          },
          serialized: async serialized => {
            const parsed = await getParsedSolanaSwap(walletCore, serialized)
            const keysignPayload = await getSolanaSwapKeysignPayload(
              parsed,
              serialized,
              vault,
              walletCore
            )
            return { keysign: keysignPayload }
          },
        })

      return { transaction, keysignMessagePayload }
    },
  })

  useEffect(() => {
    processTransaction()
  }, [processTransaction])

  return (
    <MatchQuery
      value={mutationStatus}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title="Failed to process transaction"
          message={extractErrorMsg(error)}
        />
      )}
      success={({ transaction, keysignMessagePayload }) => (
        <VStack fullHeight>
          <PageHeader
            primaryControls={
              <IconButton onClick={handleClose}>
                <CrossIcon />
              </IconButton>
            }
            title={
              <PageHeaderTitle>{`${t('sign_transaction')}`}</PageHeaderTitle>
            }
            hasBorder
          />
          <PageContent flexGrow scrollable>
            <List>
              <MatchRecordUnion
                value={keysignMessagePayload}
                handlers={{
                  custom: custom => (
                    <>
                      <ListItem
                        title={t('method')}
                        description={custom.method}
                      />
                      <ListItem
                        title={t('message')}
                        description={custom.message}
                      />
                    </>
                  ),
                  keysign: keysign => (
                    <>
                      <ListItem
                        title={t('from')}
                        description={
                          <MiddleTruncate text={keysign.coin!.address} />
                        }
                      />
                      {keysign.toAddress && (
                        <ListItem
                          title={t('to')}
                          description={
                            <MiddleTruncate text={keysign.toAddress} />
                          }
                        />
                      )}
                      {keysign.toAmount && (
                        <ListItem
                          title={t('amount')}
                          description={`${formatUnits(
                            keysign.toAmount,
                            keysign.coin?.decimals
                          )} ${keysign.coin?.ticker}`}
                        />
                      )}
                      <ListItem
                        title="Network"
                        description={getKeysignChain(keysign)}
                      />
                      <MatchRecordUnion
                        value={transaction.transactionPayload}
                        handlers={{
                          keysign: transactionPayload => {
                            const chain = getKeysignChain(keysign)
                            const query = useEvmBaseFeeQuery(chain as EvmChain)
                            const baseFee = query.data ? Number(formatUnits(query.data, gwei.decimals)) : 0
                            
                            return (
                              <>
                                <ListItem
                                  title={t('network_fee')}
                                  description={`${updatedTxFee || transactionPayload.txFee} ${chainFeeCoin[getKeysignChain(keysign)].ticker}`}
                                  extra={
                                    <GasFeeAdjuster 
                                      keysignPayload={keysignMessagePayload}
                                      baseFee={baseFee}
                                      onFeeChange={(fee, gasLimit) => {
                                        console.log('fee', fee)
                                        console.log('baseFee', baseFee)
                                        console.log('totalFee', baseFee + fee)
                                        console.log('keysignMessagePayload', keysignMessagePayload)
                                        console.log('keysignMessagePayload type', typeof keysignMessagePayload)
                                        console.log('keysignMessagePayload keys', Object.keys(keysignMessagePayload))
                                        if ('keysign' in keysignMessagePayload) {
                                          const keysign = keysignMessagePayload.keysign
                                          const totalFee = baseFee + fee
                                          
                                          // Update the transaction fee in the blockchain specific data
                                          if (keysign.blockchainSpecific && 'evm' in keysign.blockchainSpecific) {
                                            const evmSpecific = keysign.blockchainSpecific.evm as { priorityFee: string, maxFeePerGasWei: string, gasLimit?: string }
                                            // Convert gwei to wei for blockchain
                                            const priorityFeeInWei = (BigInt(Math.floor(fee * 1e9))).toString()
                                            const maxFeePerGasWei = (BigInt(Math.floor((baseFee * 1.5 + fee) * 1e9))).toString()
                                            evmSpecific.priorityFee = priorityFeeInWei
                                            evmSpecific.maxFeePerGasWei = maxFeePerGasWei
                                            evmSpecific.gasLimit = gasLimit.toString()
                                          }

                                          // Update the transaction payload
                                          const transactionPayload = keysign as unknown as IKeysignTransactionPayload
                                          // Convert gwei to wei for blockchain
                                          const priorityFeeInWei = (BigInt(Math.floor(fee * 1e9))).toString()
                                          const maxFeePerGasWei = (BigInt(Math.floor((baseFee * 1.5 + fee) * 1e9))).toString()
                                          transactionPayload.maxPriorityFeePerGas = priorityFeeInWei
                                          transactionPayload.maxFeePerGas = maxFeePerGasWei
                                          transactionPayload.gasLimit = gasLimit.toString()
                                          transactionPayload.txFee = totalFee.toString()
                                          setUpdatedTxFee(totalFee.toString())
                                          console.log('updated payload', transactionPayload)
                                        } else {
                                          console.log('keysign not found in payload')
                                        }
                                      }}
                                    />
                                  }
                                />
                                {transactionPayload.memo?.isParsed ? (
                                  <>
                                    <ListItem
                                      title={t('function_signature')}
                                      description={
                                        <VStack as="pre" scrollable>
                                          <Text as="code" family="mono">
                                            {
                                              (
                                                transactionPayload.memo
                                                  .value as ParsedMemoParams
                                              ).functionSignature
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
                                              (
                                                transactionPayload.memo
                                                  .value as ParsedMemoParams
                                              ).functionArguments
                                            }
                                          </Text>
                                        </VStack>
                                      }
                                    />
                                  </>
                                ) : (
                                  transactionPayload.memo?.value && (
                                    <ListItem
                                      title={t('memo')}
                                      description={splitString(
                                        transactionPayload.memo.value as string,
                                        32
                                      ).map((str, index) => (
                                        <span key={index}>{str}</span>
                                      ))}
                                    />
                                  )
                                )}
                              </>
                            )
                          },
                          custom: () => null,
                          serialized: () => null,
                        }}
                      />
                    </>
                  ),
                }}
              />
            </List>
          </PageContent>
          <PageFooter>
            <StartKeysignPrompt
              keysignPayload={keysignMessagePayload}
              isDAppSigning={true}
            />
          </PageFooter>
        </VStack>
      )}
    />
  )
}
