import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { applyFeeSettings } from '@core/chain/feeQuote/applyFeeSettings'
import { FeeQuote } from '@core/chain/feeQuote/core'
import { getFeeAmount } from '@core/chain/feeQuote/getFeeAmount'
import {
  FeeSettings,
  FeeSettingsChainKind,
  feeSettingsChainKinds,
} from '@core/chain/feeQuote/settings/core'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFeeQuoteQuery } from '@core/ui/chain/feeQuote/query'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { useKeysignTxDataQuery } from '@core/ui/mpc/keysign/txData/query'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import {
  ContentWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatUnits } from 'ethers'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePopupInput } from '../../state/input'
import { getFeeQuoteInput } from './core/feeQuote'
import { getKeysignPayload } from './core/keysignPayload'
import { getKeysignTxDataInput } from './core/keysignTxData'
import { ParsedTx } from './core/parsedTx'
import { CosmosMsgType } from './interfaces'
import { ManageEvmFee } from './ManageEvmFee'
import { PendingState } from './PendingState'

type SendTxOverviewProps = {
  parsedTx: ParsedTx
}

export const SendTxOverview = ({ parsedTx }: SendTxOverviewProps) => {
  const { coin } = parsedTx
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const { t } = useTranslation()

  const transactionPayload = usePopupInput<'sendTx'>()

  const { chain, address } = coin

  const [feeSettings, setFeeSettings] = useState<FeeSettings<'evm'> | null>(
    null
  )

  const keysignTxData = useKeysignTxDataQuery(
    useMemo(() => getKeysignTxDataInput(parsedTx), [parsedTx])
  )

  const feeQuote = useFeeQuoteQuery(
    useMemo(() => getFeeQuoteInput(parsedTx), [parsedTx])
  )

  const keysignPayloadQuery = useTransformQueriesData(
    {
      keysignTxData,
      feeQuote,
    },
    useCallback(
      ({ keysignTxData, feeQuote }) => {
        const chainKind = getChainKind(chain)

        return getKeysignPayload({
          keysignTxData,
          feeQuote:
            isOneOf(chainKind, feeSettingsChainKinds) && feeSettings
              ? applyFeeSettings({
                  chainKind,
                  quote: feeQuote as FeeQuote<FeeSettingsChainKind>,
                  settings: feeSettings,
                })
              : feeQuote,
          tx: parsedTx,
          vault,
          walletCore,
        })
      },
      [chain, feeSettings, parsedTx, vault, walletCore]
    )
  )

  return (
    <VerifyKeysignStart keysignPayloadQuery={keysignPayloadQuery}>
      <MatchQuery
        value={keysignPayloadQuery}
        pending={() => <PendingState />}
        error={error => (
          <FlowErrorPageContent
            error={error}
            title={t('failed_to_process_transaction')}
          />
        )}
        success={keysignPayload => (
          <List>
            {keysignPayload.swapPayload && keysignPayload.swapPayload.value ? (
              <ContentWrapper gap={24}>
                <Text color="supporting" size={15}>
                  {t('youre_swapping')}
                </Text>
                <VStack gap={16}>
                  <HStack gap={8}>
                    <CoinIcon
                      coin={
                        keysignPayload.swapPayload.value.fromCoin as AccountCoin
                      }
                      style={{ fontSize: 24 }}
                    />
                    <Text weight="500" size={17} color="contrast">
                      {Number(
                        formatUnits(
                          keysignPayload.swapPayload.value.fromAmount,
                          keysignPayload.swapPayload.value.fromCoin?.decimals
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
                        keysignPayload.swapPayload.value.toCoin as AccountCoin
                      }
                      style={{ fontSize: 24 }}
                    />
                    <Text weight="500" size={17} color="contrast">
                      {keysignPayload.swapPayload.value.toAmountDecimal}{' '}
                      <Text as="span" color="shy" size={17}>
                        {keysignPayload.swapPayload.value.toCoin?.ticker.toUpperCase()}
                      </Text>
                    </Text>
                  </HStack>
                </VStack>
              </ContentWrapper>
            ) : (
              <>
                <ListItem description={address} title={t('from')} />
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
                {keysignPayload.memo && (
                  <TxOverviewPanel>
                    <TxOverviewMemo value={keysignPayload.memo} chain={chain} />
                  </TxOverviewPanel>
                )}
                <MatchRecordUnion
                  value={transactionPayload}
                  handlers={{
                    keysign: transactionPayload => {
                      const feeAmount = getFeeAmount(
                        chain,
                        shouldBePresent(feeQuote.data)
                      )

                      const getEvmFeeSettings = (): EvmFeeSettings | null => {
                        if (!isChainOfKind(chain, 'evm')) {
                          return null
                        }

                        if (feeSettings) {
                          return feeSettings
                        }

                        return shouldBePresent(feeQuote.data) as FeeQuote<'evm'>
                      }

                      const evmFeeSettings = getEvmFeeSettings()

                      return (
                        <>
                          <ListItem
                            description={formatAmount(
                              fromChainAmount(
                                feeAmount,
                                chainFeeCoin[chain].decimals
                              ),
                              chainFeeCoin[chain]
                            )}
                            extra={
                              isChainOfKind(chain, 'evm') && evmFeeSettings ? (
                                <ManageEvmFee
                                  value={evmFeeSettings}
                                  chain={chain}
                                  onChange={setFeeSettings}
                                />
                              ) : null
                            }
                            title={t('est_network_fee')}
                          />
                          {transactionPayload.transactionDetails.msgPayload
                            ?.case === CosmosMsgType.MSG_EXECUTE_CONTRACT && (
                            <ListItem
                              description={
                                transactionPayload.transactionDetails.msgPayload
                                  .value.msg
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
        )}
      />
    </VerifyKeysignStart>
  )
}
