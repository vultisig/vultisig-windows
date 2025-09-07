import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import {
  ContentWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { noPersistQueryOptions } from '@lib/ui/query/utils/options'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useQuery } from '@tanstack/react-query'
import { Psbt } from 'bitcoinjs-lib'
import { formatUnits } from 'ethers'
import { t } from 'i18next'
import { useMemo, useState } from 'react'
import { Trans } from 'react-i18next'

import { usePopupContext } from '../../state/context'
import { usePopupInput } from '../../state/input'
import { getKeysignPayload } from './core/getKeySignPayload'
import { parseSolanaTx } from './core/solana/parser'
import { getSolanaKeysignPayload } from './core/solana/solanaKeysignPayload'
import { getPsbtKeysignPayload } from './core/utxo/getPsbtKeysignPayload'
import { CosmosMsgType, ITransactionPayload } from './interfaces'
import { ManageEvmFee } from './ManageEvmFee'

export const SendTxOverview = () => {
  const transactionPayload = usePopupInput<'sendTx'>()

  const query = useQuery({
    queryKey: ['inpage-provider-sendTxOverview'],
    queryFn: async (): Promise<FeeSettings | null> => {
      const { chain } = getRecordUnionValue(transactionPayload)
      if (isChainOfKind(chain, 'utxo')) {
        return { priority: 'fast' }
      }

      return matchRecordUnion(transactionPayload, {
        keysign: async transaction => {
          if (!isChainOfKind(chain, 'evm')) {
            return null
          }
          const { gasSettings } = transaction.transactionDetails

          const gasLimit = gasSettings?.gasLimit
            ? BigInt(gasSettings.gasLimit)
            : getEvmGasLimit({ chain })

          const priorityFee = BigInt(
            gasSettings?.maxPriorityFeePerGas ||
              (await getEvmMaxPriorityFeePerGas(chain))
          )

          return { gasLimit, priorityFee }
        },
        serialized: () => null,
      })
    },
    ...noPersistQueryOptions,
  })

  return (
    <MatchQuery
      value={query}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title="Failed to process transaction"
          error={error}
        />
      )}
      success={feeSettings => (
        <SendTxOverviewContent initialFeeSettings={feeSettings} />
      )}
    />
  )
}

const SendTxOverviewContent = ({
  initialFeeSettings,
}: {
  initialFeeSettings: FeeSettings | null
}) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const { requestOrigin } = usePopupContext()

  const transactionPayload = usePopupInput<'sendTx'>()

  const [feeSettings, setFeeSettings] = useState<FeeSettings | null>(
    initialFeeSettings
  )

  const shouldPreventIBCTx = useMemo(
    () =>
      matchRecordUnion(transactionPayload, {
        keysign: (payload): boolean => {
          const msgCase = payload.transactionDetails?.cosmosMsgPayload?.case
          return (
            msgCase === CosmosMsgType.MSG_TRANSFER_URL &&
            !!payload.transactionDetails?.cosmosMsgPayload?.value.memo
          )
        },
        serialized: () => false,
      }),
    [transactionPayload]
  )

  const keysignPayloadQuery = useQuery({
    queryKey: [
      'inpage-provider-keysignPayload',
      transactionPayload,
      feeSettings,
    ],
    queryFn: () =>
      matchRecordUnion<ITransactionPayload, Promise<KeysignPayload>>(
        transactionPayload,
        {
          keysign: async transaction =>
            getKeysignPayload({
              transaction,
              vault,
              walletCore,
              feeSettings,
            }),
          serialized: async ({ data, chain, skipBroadcast }) => {
            if (chain === Chain.Bitcoin) {
              const dataBuffer = Buffer.from(data, 'base64')
              const psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))
              return await getPsbtKeysignPayload(
                psbt,
                walletCore,
                vault,
                feeSettings
              )
            } else {
              const serialized = Uint8Array.from(Buffer.from(data, 'base64'))
              const parsed = await parseSolanaTx({
                walletCore,
                inputTx: serialized,
              })

              if (!parsed) {
                throw new Error('Could not parse transaction')
              }
              return await getSolanaKeysignPayload({
                parsed,
                serialized,
                vault,
                walletCore,
                skipBroadcast,
                requestOrigin,
              })
            }
          },
        }
      ),
    ...noPersistQueryOptions,
  })

  return (
    <MatchQuery
      value={keysignPayloadQuery}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title="Failed to process transaction"
          error={error}
        />
      )}
      success={keysignPayload => {
        return (
          <VStack fullHeight>
            <PageHeader
              primaryControls={<PageHeaderBackButton />}
              title={t('sign_transaction')}
              hasBorder
            />
            {shouldPreventIBCTx ? (
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
                    {keysignPayload.swapPayload &&
                    keysignPayload.swapPayload.value ? (
                      <>
                        <ContentWrapper gap={24}>
                          <Text color="supporting" size={15}>
                            {t('youre_swapping')}
                          </Text>
                          <VStack gap={16}>
                            <HStack gap={8}>
                              <CoinIcon
                                coin={
                                  keysignPayload.swapPayload.value
                                    .fromCoin as AccountCoin
                                }
                                style={{ fontSize: 24 }}
                              />
                              <Text weight="500" size={17} color="contrast">
                                {Number(
                                  formatUnits(
                                    keysignPayload.swapPayload.value.fromAmount,
                                    keysignPayload.swapPayload.value.fromCoin
                                      ?.decimals
                                  )
                                )}{' '}
                                <Text as="span" color="shy" size={17}>
                                  {keysignPayload.swapPayload.value.fromCoin?.ticker.toUpperCase()}
                                </Text>
                              </Text>
                            </HStack>
                            <HStack alignItems="center" gap={21}>
                              <IconWrapper>
                                <ArrowDownIcon />
                              </IconWrapper>
                              <HorizontalLine />
                            </HStack>
                            <HStack gap={8}>
                              <CoinIcon
                                coin={
                                  keysignPayload.swapPayload.value
                                    .toCoin as AccountCoin
                                }
                                style={{ fontSize: 24 }}
                              />
                              <Text weight="500" size={17} color="contrast">
                                {
                                  keysignPayload.swapPayload.value
                                    .toAmountDecimal
                                }{' '}
                                <Text as="span" color="shy" size={17}>
                                  {keysignPayload.swapPayload.value.toCoin?.ticker.toUpperCase()}
                                </Text>
                              </Text>
                            </HStack>
                          </VStack>
                        </ContentWrapper>
                      </>
                    ) : (
                      <>
                        <ListItem
                          description={keysignPayload.coin!.address}
                          title={t('from')}
                        />
                        {keysignPayload.toAddress && (
                          <ListItem
                            description={keysignPayload.toAddress}
                            title={t('to')}
                          />
                        )}
                        {keysignPayload.toAmount && (
                          <ListItem
                            description={`${formatUnits(
                              keysignPayload.toAmount,
                              keysignPayload.coin?.decimals
                            )} ${keysignPayload.coin?.ticker}`}
                            title={t('amount')}
                          />
                        )}
                        <ListItem
                          description={getKeysignChain(keysignPayload)}
                          title={t('network')}
                        />
                        <MatchRecordUnion
                          value={transactionPayload}
                          handlers={{
                            keysign: transactionPayload => {
                              const chain = getKeysignChain(keysignPayload)
                              const feeAmount = getFeeAmount(
                                keysignPayload.blockchainSpecific as KeysignChainSpecific
                              )
                              return (
                                <>
                                  <ListItem
                                    description={formatAmount(
                                      fromChainAmount(
                                        feeAmount,
                                        chainFeeCoin[chain].decimals
                                      ),
                                      chainFeeCoin[chain].ticker
                                    )}
                                    extra={
                                      isChainOfKind(chain, 'evm') ? (
                                        <ManageEvmFee
                                          value={
                                            shouldBePresent(
                                              feeSettings
                                            ) as EvmFeeSettings
                                          }
                                          chain={chain}
                                          onChange={setFeeSettings}
                                        />
                                      ) : null
                                    }
                                    title={t('est_network_fee')}
                                  />
                                  {keysignPayload.memo && (
                                    <TxOverviewPanel>
                                      <TxOverviewMemo
                                        value={keysignPayload.memo}
                                        chain={chain}
                                      />
                                    </TxOverviewPanel>
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
                              )
                            },
                            serialized: () => null,
                          }}
                        />
                      </>
                    )}
                  </List>
                </PageContent>
                <PageFooter>
                  <StartKeysignPrompt
                    keysignPayload={{
                      keysign: keysignPayload,
                    }}
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
