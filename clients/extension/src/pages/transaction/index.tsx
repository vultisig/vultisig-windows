import { create } from '@bufbuild/protobuf'
import { getVaultTransactions } from '@clients/extension/src/transactions/state/transactions'
import { updateTransaction } from '@clients/extension/src/transactions/state/transactions'
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
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
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
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMutation } from '@tanstack/react-query'
import { formatUnits, toUtf8String } from 'ethers'
import { t } from 'i18next'
import { useEffect, useState } from 'react'

import { GasFeeAdjuster } from './GasFeeAdjuster'

export const TransactionPage = () => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const [updatedTxFee, setUpdatedTxFee] = useState<string | null>(null)
  const [updatedGasLimit, setUpdatedGasLimit] = useState<number | null>(null)
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
                            keysign: transactionPayload => (
                              <>
                                <ListItem
                                  title={t('est_network_fee')}
                                  description={`${updatedTxFee || transactionPayload.txFee} ${chainFeeCoin[getKeysignChain(keysign)].ticker}`}
                                  extra={
                                    <GasFeeAdjuster
                                      keysignPayload={keysignMessagePayload}
                                      gasLimit={Number(
                                        transactionPayload.transactionDetails
                                          ?.gasSettings?.gasLimit
                                      )}
                                      baseFee={Number(transactionPayload.txFee)}
                                      onFeeChange={async (fee, gasLimit) => {
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
                                            Number(transactionPayload.txFee) +
                                            Number(priorityFeeInBaseUnit)
                                          setUpdatedTxFee(totalFee.toString())
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
          </VStack>
        )
      }}
    />
  )
}
