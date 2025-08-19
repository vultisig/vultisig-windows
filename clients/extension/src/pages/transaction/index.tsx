import { create } from '@bufbuild/protobuf'
import { GasFeeAdjuster } from '@clients/extension/src/pages/transaction/GasFeeAdjuster'
import { getVaultTransactions } from '@clients/extension/src/transactions/state/transactions'
import { updateTransaction } from '@clients/extension/src/transactions/state/transactions'
import { CosmosMsgType } from '@clients/extension/src/utils/constants'
import { splitString } from '@clients/extension/src/utils/functions'
import { ITransaction } from '@clients/extension/src/utils/interfaces'
import { getKeysignPayload } from '@clients/extension/src/utils/tx/getKeySignPayload'
import { getParsedSolanaTransaction } from '@clients/extension/src/utils/tx/solana/parseSolanaTransaction'
import { getSolanaKeysignPayload } from '@clients/extension/src/utils/tx/solana/solanaKeysignPayload'
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
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMutation } from '@tanstack/react-query'
import { formatUnits, toUtf8String } from 'ethers'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'

export const TransactionPage = () => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const [updatedTxFee, setUpdatedTxFee] = useState<string | null>(null)
  const [updatedGasLimit, setUpdatedGasLimit] = useState<number | null>(null)
  const handleClose = (): void => {
    window.close()
  }

  const shouldPreventIBCTx = (transaction: ITransaction): boolean => {
    return matchRecordUnion(transaction.transactionPayload, {
      keysign: (payload): boolean => {
        const msgCase = payload.transactionDetails?.cosmosMsgPayload?.case
        return (
          msgCase === CosmosMsgType.MSG_TRANSFER_URL &&
          !!payload.transactionDetails?.cosmosMsgPayload?.value.memo
        )
      },
      custom: () => false,
      serialized: () => false,
    })
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
                  gasLimit: updatedGasLimit || defaultEvmSwapGasLimit,
                }),
                utxo: () => ({ priority: 'fast' }),
                cosmos: () => null,
                sui: () => null,
                solana: () => null,
                polkadot: () => null,
                ton: () => null,
                ripple: () => null,
                tron: () => null,
                cardano: () => null,
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
                chain: custom.chain,
              }),
            }
          },
          serialized: async ({ data: serialized, skipBroadcast }) => {
            const parsed = await getParsedSolanaTransaction(
              walletCore,
              serialized
            )

            const keysignPayload = await getSolanaKeysignPayload(
              parsed,
              serialized,
              vault,
              walletCore,
              skipBroadcast
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
          error={error}
        />
      )}
      success={({ transaction, keysignMessagePayload }) => {
        return (
          <VStack fullHeight>
            <PageHeader
              primaryControls={
                <IconButton onClick={handleClose}>
                  <CrossIcon />
                </IconButton>
              }
              title={t('sign_transaction')}
              hasBorder
            />
            {shouldPreventIBCTx(transaction) ? (
              <PageContent
                alignItems="center"
                gap={12}
                justifyContent="center"
                flexGrow
                scrollable
              >
                <Panel>
                  <VStack alignItems="center" gap={24} justifyContent="center">
                    <Text as={TriangleAlertIcon} color="danger" fontSize={36} />
                    <VStack
                      alignItems="center"
                      gap={16}
                      justifyContent="center"
                      fullWidth
                    >
                      <Text
                        size={17}
                        weight={500}
                        centerHorizontally
                        color="danger"
                      >
                        {t('ibc_transaction_not_supporting_memo_title')}
                      </Text>
                      <Text
                        color="light"
                        size={14}
                        weight={500}
                        centerHorizontally
                      >
                        <Trans
                          i18nKey="ibc_transaction_not_supporting_memo_desc"
                          components={{ b: <b />, br: <br /> }}
                        />
                      </Text>
                    </VStack>
                  </VStack>
                </Panel>
              </PageContent>
            ) : (
              <>
                <PageContent flexGrow scrollable>
                  <List>
                    <MatchRecordUnion
                      value={keysignMessagePayload}
                      handlers={{
                        custom: custom => {
                          const txPayload = transaction.transactionPayload
                          const prefix =
                            'custom' in txPayload &&
                            typeof txPayload.custom?.prefix === 'string'
                              ? txPayload.custom.prefix
                              : undefined

                          const displayMessage =
                            prefix && prefix.length > 0
                              ? custom.message.slice(prefix.length)
                              : custom.message

                          return (
                            <>
                              <ListItem
                                description={custom.method}
                                title={t('method')}
                              />
                              <ListItem
                                description={displayMessage}
                                title={t('message')}
                              />
                            </>
                          )
                        },
                        keysign: keysign => (
                          <>
                            <ListItem
                              description={keysign.coin!.address}
                              title={t('from')}
                            />
                            {keysign.toAddress && (
                              <ListItem
                                description={keysign.toAddress}
                                title={t('to')}
                              />
                            )}
                            {keysign.toAmount && (
                              <ListItem
                                description={`${formatUnits(
                                  keysign.toAmount,
                                  keysign.coin?.decimals
                                )} ${keysign.coin?.ticker}`}
                                title={t('amount')}
                              />
                            )}
                            <ListItem
                              description={getKeysignChain(keysign)}
                              title={t('network')}
                            />
                            <MatchRecordUnion
                              value={transaction.transactionPayload}
                              handlers={{
                                keysign: transactionPayload => (
                                  <>
                                    <ListItem
                                      description={`${updatedTxFee || transactionPayload.txFee} ${chainFeeCoin[getKeysignChain(keysign)].ticker}`}
                                      extra={
                                        <GasFeeAdjuster
                                          keysignPayload={keysignMessagePayload}
                                          gasLimit={Number(
                                            transactionPayload
                                              .transactionDetails?.gasSettings
                                              ?.gasLimit
                                          )}
                                          baseFee={Number(
                                            transactionPayload.txFee
                                          )}
                                          onFeeChange={async (
                                            fee,
                                            gasLimit
                                          ) => {
                                            if (
                                              'keysign' in keysignMessagePayload
                                            ) {
                                              const priorityFeeInBaseUnit =
                                                shouldBePresent(
                                                  formatUnits(
                                                    BigInt(fee),
                                                    keysign.coin?.decimals
                                                  )
                                                )
                                              const totalFee =
                                                Number(
                                                  transactionPayload.txFee
                                                ) +
                                                Number(priorityFeeInBaseUnit)
                                              setUpdatedTxFee(
                                                totalFee.toString()
                                              )
                                              setUpdatedGasLimit(gasLimit)

                                              // Update the stored transaction with new gas limit
                                              const updatedTransaction = {
                                                ...transaction,
                                                transactionPayload: {
                                                  ...transaction.transactionPayload,
                                                  keysign: {
                                                    ...transactionPayload,
                                                    transactionDetails: {
                                                      ...transactionPayload.transactionDetails,
                                                      gasSettings: {
                                                        ...transactionPayload
                                                          .transactionDetails
                                                          .gasSettings,
                                                        gasLimit:
                                                          gasLimit.toString(),
                                                      },
                                                    },
                                                  },
                                                },
                                              }

                                              await updateTransaction(
                                                getVaultId(vault),
                                                updatedTransaction
                                              )

                                              // Re-process transaction with updated gas settings
                                              processTransaction()
                                            }
                                          }}
                                        />
                                      }
                                      title={t('est_network_fee')}
                                    />
                                    {transactionPayload.memo?.isParsed ? (
                                      <>
                                        <ListItem
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
                                          title={t('function_signature')}
                                        />
                                        <ListItem
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
                                          title={t('function_inputs')}
                                        />
                                      </>
                                    ) : (
                                      transactionPayload.memo?.value && (
                                        <ListItem
                                          description={splitString(
                                            transactionPayload.memo
                                              .value as string,
                                            32
                                          ).map((str, index) => (
                                            <span key={index}>{str}</span>
                                          ))}
                                          title={t('memo')}
                                        />
                                      )
                                    )}
                                    {transactionPayload.transactionDetails
                                      .cosmosMsgPayload?.case ===
                                      CosmosMsgType.MSG_EXECUTE_CONTRACT && (
                                      <ListItem
                                        description={
                                          transactionPayload.transactionDetails
                                            .cosmosMsgPayload.value.msg
                                        }
                                        title={t('message')}
                                      />
                                    )}
                                  </>
                                ),
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
              </>
            )}
          </VStack>
        )
      }}
    />
  )
}
