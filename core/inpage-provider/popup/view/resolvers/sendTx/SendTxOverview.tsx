import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { useKeysignUtxoInfo } from '@core/ui/mpc/keysign/utxo/queries/keysignUtxoInfo'
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
import { formatAmount } from '@lib/utils/formatAmount'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { formatUnits } from 'ethers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePopupContext } from '../../state/context'
import { usePopupInput } from '../../state/input'
import { CustomTxData } from './core/customTxData'
import { getKeysignPayload } from './core/getKeySignPayload'
import { ParsedTx } from './core/parsedTx'
import { getSolanaKeysignPayload } from './core/solana/solanaKeysignPayload'
import { getPsbtKeysignPayload } from './core/utxo/getPsbtKeysignPayload'
import { CosmosMsgType } from './interfaces'
import { ManageEvmFee } from './ManageEvmFee'
import { PendingState } from './PendingState'
import { useChainSpecificQuery } from './queries/txChainSpecific'

type SendTxOverviewProps = {
  parsedTx: ParsedTx
}

export const SendTxOverview = ({
  parsedTx: { customTxData, feeSettings: initialFeeSettings, coin },
}: SendTxOverviewProps) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const { requestOrigin } = usePopupContext()
  const { t } = useTranslation()

  const transactionPayload = usePopupInput<'sendTx'>()

  const { chain, address } = coin

  const [feeSettings, setFeeSettings] = useState(initialFeeSettings)

  const chainSpecificQuery = useChainSpecificQuery({
    customTxData,
    feeSettings,
    coin,
  })

  const utxoInfoQuery = useKeysignUtxoInfo({ chain, address })

  const keysignPayloadQuery = useTransformQueriesData(
    {
      chainSpecific: chainSpecificQuery,
      utxoInfo: utxoInfoQuery,
    },
    ({ chainSpecific, utxoInfo }) => {
      const keysignPayload = matchRecordUnion<CustomTxData, KeysignPayload>(
        customTxData,
        {
          regular: transaction =>
            getKeysignPayload({
              transaction,
              vault,
              walletCore,
              coin,
              chainSpecific,
            }),
          psbt: psbt => {
            const { skipBroadcast, params } = getRecordUnionValue(
              transactionPayload,
              'serialized'
            )

            return getPsbtKeysignPayload({
              psbt,
              walletCore,
              vault,
              coin,
              chainSpecific,
              skipBroadcast,
              params,
            })
          },
          solanaSwap: solanaTx => {
            const { data, skipBroadcast } = getRecordUnionValue(
              transactionPayload,
              'serialized'
            )

            return getSolanaKeysignPayload({
              parsed: solanaTx,
              serialized: Uint8Array.from(Buffer.from(data, 'base64')),
              vault,
              walletCore,
              skipBroadcast,
              requestOrigin,
              coin,
              chainSpecific,
            })
          },
        }
      )

      return create(KeysignPayloadSchema, {
        ...keysignPayload,
        utxoInfo: utxoInfo ?? [],
      })
    }
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
                <MatchRecordUnion
                  value={transactionPayload}
                  handlers={{
                    keysign: transactionPayload => {
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
                              isChainOfKind(chain, 'evm') && feeSettings ? (
                                <ManageEvmFee
                                  value={feeSettings as EvmFeeSettings}
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
        )}
      />
    </VerifyKeysignStart>
  )
}
