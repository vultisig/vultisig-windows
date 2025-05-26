import { create } from '@bufbuild/protobuf'
import { getChainKind } from '@core/chain/ChainKind'
import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { getKeysignChain } from '@core/ui/mpc/keysign/utils/getKeysignChain'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMutation } from '@tanstack/react-query'
import { formatUnits, toUtf8String } from 'ethers'
import { t } from 'i18next'
import { useEffect } from 'react'

import { MiddleTruncate } from '../../components/middle-truncate'
import { getVaultTransactions } from '../../transactions/state/transactions'
import { splitString } from '../../utils/functions'
import { getKeysignPayload } from '../../utils/tx/getKeySignPayload'
import { getSolanaSwapKeysignPayload } from '../../utils/tx/solana/solanaKeysignPayload'
import { getParsedSolanaSwap } from '../../utils/tx/solana/solanaSwap'
import { getLastItem } from '@lib/utils/array/getLastItem'

export const TransactionPage = () => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
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
            const keysignPayload = await getKeysignPayload(
              keysign,
              vault,
              walletCore
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
              <PageHeaderIconButton
                icon={<CrossIcon />}
                onClick={handleClose}
              />
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
                          keysign: transactionPayload => (
                            <>
                              <ListItem
                                title={t('network_fee')}
                                description={`${transactionPayload.txFee} ${chainFeeCoin[getKeysignChain(keysign)].ticker}`}
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
              value={keysignMessagePayload}
              isDAppSigning={true}
            />
          </PageFooter>
        </VStack>
      )}
    />
  )
}
