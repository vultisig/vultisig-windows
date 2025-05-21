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
const StyledErrorState = styled(VStack)`
  background-color: ${getColor('backgroundsSecondary')};
  border-radius: 12px;
  padding: 64px;
`

const StyledText = styled(Text)`
  text-align: center;
`
type TransactionPageProps = { txHash?: string }

interface InitialState {
  transaction?: ITransaction
  keysignMessagePayload?: KeysignMessagePayload
}

export const TransactionPage = ({ txHash }: TransactionPageProps) => {
  const vaults = useVaults()
  const { openUrl } = useCore()

  const walletCore = useAssertWalletCore()
  const [state, setState] = useState<InitialState>({})
  const { transaction } = state
  const copyTxHash = useCopyTxHash()

  useEffect(() => {
    const getCurrentTransaction = async () => {
      const [transaction] = await getStoredTransactions()
      setState({ transaction })
    }
    getCurrentTransaction()
  }, [])

  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const handleClose = (): void => {
    window.close()
  }

  const { mutate: processTransaction, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      const [transaction] = await getStoredTransactions()
      const vault = shouldBePresent(
        vaults.find(({ coins }) =>
          coins.some(
            ({ address }) =>
              address?.toLowerCase() ===
              transaction?.transactionDetails.from.toLowerCase()
          )
        )
      )

      setCurrentVaultId(vault.publicKeys.ecdsa)

      let keysignMessagePayload: KeysignMessagePayload
      if (transaction.isCustomMessage) {
        keysignMessagePayload = {
          custom: create(CustomMessagePayloadSchema, {
            method: transaction.customMessage?.method,
            message: transaction.customMessage?.message,
          }),
        }
      } else {
        keysignMessagePayload = {
          keysign: await getKeysignPayload(transaction, vault, walletCore),
        }

        transaction.txFee = String(
          formatUnits(
            getFeeAmount(
              keysignMessagePayload.keysign
                .blockchainSpecific as KeysignChainSpecific
            ),
            transaction.transactionDetails.amount?.decimals
          )
        )

        transaction.memo = { isParsed: false, value: undefined }

        if (getChainKind(transaction.chain) === 'evm') {
          const parsedMemo = await getParsedMemo(
            keysignMessagePayload.keysign.memo
          )
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

      return { transaction, keysignMessagePayload }
    },
  })

  useEffect(() => {
    if (txHash && transaction) {
      setStoredTransaction({
        ...transaction,
        status: 'success',
        txHash,
        raw: {},
      })
    }
  }, [txHash, transaction])

  useEffect(() => {
    if (!txHash) processTransaction()
  }, [processTransaction])

  return !txHash ? (
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
                      )} ${(keysignMessagePayload as any).keysign.coin.ticker}`}
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
            <StartKeysignPrompt value={keysignMessagePayload} />
          </PageFooter>
        </VStack>
      )}
    />
  ) : transaction ? (
    <VStack fullHeight>
      <PageHeader
        title={<PageHeaderTitle>{t('overview')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent flexGrow>
        <List>
          <ListItem
            description={
              <MiddleTruncate
                text={txHash}
                onClick={() => copyTxHash(txHash)}
              />
            }
            extra={
              <IconButton
                icon={<SquareArrowOutUpRightIcon />}
                onClick={() =>
                  openUrl(
                    `${getBlockExplorerUrl({ chain: transaction.chain, entity: 'tx', value: txHash })}`
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
              )}`}
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
      </PageContent>
      <PageFooter>
        <Button kind="primary" onClick={handleClose}>
          {t('done')}
        </Button>
      </PageFooter>
    </VStack>
  ) : (
    <></>
  )
}
