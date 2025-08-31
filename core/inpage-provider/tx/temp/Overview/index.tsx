import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import {
  getParsedMemo,
  ParsedMemoParams,
} from '@core/chain/chains/evm/tx/getParsedMemo'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { defaultEvmSwapGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
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
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useQuery } from '@tanstack/react-query'
import { Psbt } from 'bitcoinjs-lib'
import { formatUnits, toUtf8String } from 'ethers'
import { t } from 'i18next'
import { useMemo, useState } from 'react'
import { Trans } from 'react-i18next'

import { usePopupInput } from '../../../popup/view/state/input'
import { getKeysignPayload } from '../core/getKeySignPayload'
import { parseSolanaTx } from '../core/solana/parser'
import { getSolanaKeysignPayload } from '../core/solana/solanaKeysignPayload'
import { getPsbtKeysignPayload } from '../core/utxo/getPsbtKeysignPayload'
import { CosmosMsgType, ITransactionPayload } from '../interfaces'
import { GasFeeAdjuster } from './GasFeeAdjuster'

const splitString = (str: string, size: number): string[] => {
  const result: string[] = []

  for (let i = 0; i < str.length; i += size) {
    result.push(str.slice(i, i + size))
  }

  return result
}

export const SendTxOverview = () => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const [updatedTxFee, setUpdatedTxFee] = useState<string | null>(null)
  const [updatedGasLimit, setUpdatedGasLimit] = useState<number | null>(null)
  const handleClose = (): void => {
    window.close()
  }

  const initialTransactionPayload = usePopupInput<'sendTx'>()

  const [transactionPayload, setTransactionPayload] =
    useState<ITransactionPayload>(initialTransactionPayload)

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
    queryKey: ['inpage-provider-keysignPayload', transactionPayload],
    queryFn: () =>
      matchRecordUnion<ITransactionPayload, Promise<KeysignPayload>>(
        transactionPayload,
        {
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

            return keysignPayload
          },
          serialized: async ({ data: serialized, chain, skipBroadcast }) => {
            if (chain === Chain.Bitcoin) {
              const txInputDataArray = Object.values(serialized)
              const dataBuffer = Buffer.from(txInputDataArray)
              const psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))
              const gasSettings: FeeSettings | null = { priority: 'fast' }
              return await getPsbtKeysignPayload(
                psbt,
                walletCore,
                vault,
                gasSettings
              )
            } else {
              const parsed = await parseSolanaTx({
                walletCore,
                inputTx: serialized,
              })

              if (!parsed) {
                throw new Error('Could not parse transaction')
              }
              return await getSolanaKeysignPayload(
                parsed,
                serialized,
                vault,
                walletCore,
                skipBroadcast
              )
            }
          },
        }
      ),
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
              primaryControls={
                <IconButton onClick={handleClose}>
                  <CrossIcon />
                </IconButton>
              }
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
                            keysign: transactionPayload => (
                              <>
                                <ListItem
                                  description={`${updatedTxFee || transactionPayload.txFee} ${chainFeeCoin[getKeysignChain(keysignPayload)].ticker}`}
                                  extra={
                                    <GasFeeAdjuster
                                      keysignPayload={{
                                        keysign: keysignPayload,
                                      }}
                                      gasLimit={Number(
                                        transactionPayload.transactionDetails
                                          ?.gasSettings?.gasLimit
                                      )}
                                      baseFee={Number(transactionPayload.txFee)}
                                      onFeeChange={async (fee, gasLimit) => {
                                        const priorityFeeInBaseUnit =
                                          shouldBePresent(
                                            formatUnits(
                                              BigInt(fee),
                                              keysignPayload.coin?.decimals
                                            )
                                          )
                                        const totalFee =
                                          Number(transactionPayload.txFee) +
                                          Number(priorityFeeInBaseUnit)
                                        setUpdatedTxFee(totalFee.toString())
                                        setUpdatedGasLimit(gasLimit)

                                        // Update the stored transaction with new gas limit
                                        setTransactionPayload({
                                          ...transactionPayload,
                                          keysign: {
                                            ...transactionPayload,
                                            transactionDetails: {
                                              ...transactionPayload.transactionDetails,
                                              gasSettings: {
                                                ...transactionPayload
                                                  .transactionDetails
                                                  .gasSettings,
                                                gasLimit: gasLimit.toString(),
                                              },
                                            },
                                          },
                                        })
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
                                        transactionPayload.memo.value as string,
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
