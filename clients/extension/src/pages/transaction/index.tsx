import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useMutation } from '@tanstack/react-query'

import {
  getStoredTransactions,
  setStoredTransaction,
} from '../../utils/storage'
import { useVaults } from '@core/ui/storage/vaults'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getKeysignPayload } from '../../utils/tx/getKeySignPayload'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'

import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { create } from '@bufbuild/protobuf'
import { PageHeader } from '@lib/ui/page/PageHeader'

import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { formatUnits, toUtf8String } from 'ethers'
import { t } from 'i18next'
import { MiddleTruncate } from '../../components/middle-truncate'
import { splitString } from '../../utils/functions'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { getChainKind } from '@core/chain/ChainKind'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { useCurrentTxHash } from '@core/ui/chain/state/currentTxHash'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ITransaction } from '../../utils/interfaces'
import { useCopyTxHash } from '@core/ui/chain/hooks/useCopyTxHash'
import { useCore } from '@core/ui/state/core'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { Button } from '@lib/ui/buttons/Button'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Vault } from '@core/ui/vault/Vault'

const StyledErrorState = styled(VStack)`
  background-color: ${getColor('backgroundsSecondary')};
  border-radius: 12px;
  padding: 64px;
`

const StyledText = styled(Text)`
  text-align: center;
`

export const TransactionPage = () => {
  const vaults = useVaults()
  const walletCore = useAssertWalletCore()
  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const handleClose = (): void => {
    window.close()
  }

  const { mutate: processTransaction, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      const [transaction] = await getStoredTransactions()
      if (!transaction) {
        throw new Error('No current transaction present')
      }

      const vault: Vault = await matchRecordUnion(
        transaction.transactionPayload,
        {
          keysign: keysign => {
            return shouldBePresent(
              vaults.find(({ coins }) =>
                coins.some(
                  ({ address }) =>
                    address?.toLowerCase() ===
                    keysign.transactionDetails.from.toLowerCase()
                )
              )
            )
          },
          custom: custom => {
            return shouldBePresent(
              vaults.find(({ coins }) =>
                coins.some(
                  ({ address }) =>
                    address?.toLowerCase() === custom.address.toLowerCase()
                )
              )
            )
          },
        }
      )

      setCurrentVaultId(vault.publicKeys.ecdsa)

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
                value={transaction.transactionPayload}
                handlers={{
                  custom: custom => (
                    <>
                      <ListItem
                        title={t('address')}
                        description={custom.address}
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
                          <MiddleTruncate
                            text={keysign.transactionDetails.from}
                          />
                        }
                      />
                      {keysign.transactionDetails.to && (
                        <ListItem
                          title={t('to')}
                          description={
                            <MiddleTruncate
                              text={keysign.transactionDetails.to}
                            />
                          }
                        />
                      )}
                      {keysign.transactionDetails.amount?.amount && (
                        <ListItem
                          title={t('amount')}
                          description={`${formatUnits(
                            keysign.transactionDetails.amount.amount,
                            keysign.transactionDetails.amount.decimals
                          )} ${(keysignMessagePayload as any).keysign.coin.ticker}`}
                        />
                      )}
                      <ListItem title="Network" description={keysign.chain} />
                      <ListItem
                        title={t('network_fee')}
                        description={`${keysign.txFee} ${chainFeeCoin[keysign.chain].ticker}`}
                      />
                      {keysign.memo?.isParsed ? (
                        <>
                          <ListItem
                            title={t('function_signature')}
                            description={
                              <VStack as="pre" scrollable>
                                <Text as="code" family="mono">
                                  {
                                    (keysign.memo.value as ParsedMemoParams)
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
                                    (keysign.memo.value as ParsedMemoParams)
                                      .functionArguments
                                  }
                                </Text>
                              </VStack>
                            }
                          />
                        </>
                      ) : (
                        keysign.memo?.value && (
                          <ListItem
                            title={t('memo')}
                            description={splitString(
                              keysign.memo.value as string,
                              32
                            ).map((str, index) => (
                              <span key={index}>{str}</span>
                            ))}
                          />
                        )
                      )}
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
