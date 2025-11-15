import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain, EvmChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { parseBlockaidEvmSimulation } from '@core/chain/security/blockaid/tx/simulation/api/core'
import { getBlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/input'
import { BlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/resolver'
import {
  EvmFeeSettings,
  FeeSettings,
} from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getFeeAmount } from '@core/mpc/keysign/fee'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { getBlockaidTxSimulationQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidTxSimulation'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { useCurrentVaultPublicKey } from '@core/ui/vault/state/currentVault'
import {
  ContentWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { round } from '@lib/ui/css/round'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatUnits } from 'ethers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { usePopupInput } from '../../state/input'
import { ParsedTx } from './core/parsedTx'
import { getGasEstimationQuery } from './gasEstimation/getGasEstimationQuery'
import { CosmosMsgType } from './interfaces'
import { useSendTxKeysignPayloadQuery } from './keysignPayload/query'
import { ManageEvmFee } from './ManageEvmFee'
import { PendingState } from './PendingState'

type SendTxOverviewProps = {
  parsedTx: ParsedTx
}

const RoundedCoinIconWrapper = styled.div`
  ${round};
  overflow: hidden;
  display: inline-flex;
`

type NetworkFeeSectionProps = {
  keysignPayload: KeysignPayload
  transactionPayload: ReturnType<typeof usePopupInput<'sendTx'>>
  chain: Chain
  feeSettings: FeeSettings<'evm'> | null
  setFeeSettings: (settings: FeeSettings<'evm'> | null) => void
  walletCore: ReturnType<typeof useAssertWalletCore>
  publicKey: ReturnType<typeof useCurrentVaultPublicKey>
}

const NetworkFeeSection = ({
  keysignPayload,
  transactionPayload,
  chain,
  feeSettings,
  setFeeSettings,
  walletCore,
  publicKey,
}: NetworkFeeSectionProps) => {
  const { t } = useTranslation()

  return (
    <MatchRecordUnion
      value={transactionPayload}
      handlers={{
        keysign: transactionPayload => {
          const feeAmount = getFeeAmount({
            keysignPayload,
            walletCore,
            publicKey,
          })

          const getEvmFeeSettings = (): EvmFeeSettings | null => {
            if (!isChainOfKind(chain, 'evm')) {
              return null
            }

            if (feeSettings) {
              return feeSettings
            }

            const evmSpecific = getBlockchainSpecificValue(
              keysignPayload.blockchainSpecific,
              'ethereumSpecific'
            )

            return {
              maxPriorityFeePerGas: BigInt(evmSpecific.priorityFee),
              gasLimit: BigInt(evmSpecific.gasLimit),
            }
          }

          const evmFeeSettings = getEvmFeeSettings()

          return (
            <>
              <ListItem
                description={formatAmount(
                  fromChainAmount(feeAmount, chainFeeCoin[chain].decimals),
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
              {transactionPayload.transactionDetails.msgPayload?.case ===
                CosmosMsgType.MSG_EXECUTE_CONTRACT && (
                <ListItem
                  description={
                    transactionPayload.transactionDetails.msgPayload.value.msg
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
  )
}

type MemoSectionProps = {
  memo: string | undefined
  chain: Chain
}

const MemoSection = ({ memo, chain }: MemoSectionProps) => {
  if (!memo) {
    return null
  }

  return (
    <TxOverviewPanel>
      <TxOverviewMemo value={memo} chain={chain} />
    </TxOverviewPanel>
  )
}

type SwapAmountDisplayProps = {
  coin: AccountCoin
  amount: string
  useRoundedIcon?: boolean
}

const SwapAmountDisplay = ({
  coin,
  amount,
  useRoundedIcon = false,
}: SwapAmountDisplayProps) => {
  const icon = <CoinIcon coin={coin} style={{ fontSize: 24 }} />

  return (
    <HStack gap={8}>
      {useRoundedIcon ? (
        <RoundedCoinIconWrapper>{icon}</RoundedCoinIconWrapper>
      ) : (
        icon
      )}
      <Text weight="500" size={17} color="contrast">
        {amount}{' '}
        {!useRoundedIcon && (
          <Text as="span" color="shy" size={17}>
            {coin.ticker.toUpperCase()}
          </Text>
        )}
      </Text>
    </HStack>
  )
}

export const SendTxOverview = ({ parsedTx }: SendTxOverviewProps) => {
  const { coin } = parsedTx
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(coin.chain)
  const { t } = useTranslation()

  const transactionPayload = usePopupInput<'sendTx'>()

  const { chain, address } = coin

  const [feeSettings, setFeeSettings] = useState<FeeSettings<'evm'> | null>(
    null
  )

  const keysignPayloadQuery = useSendTxKeysignPayloadQuery({
    parsedTx,
    feeSettings: feeSettings || undefined,
  })

  const blockaidSimulationQuery = useStateDependentQuery(
    {
      keysignPayload: keysignPayloadQuery.data,
    },
    ({
      keysignPayload,
    }: {
      keysignPayload: typeof keysignPayloadQuery.data
    }) => {
      if (!isChainOfKind(chain, 'evm') || !keysignPayload) {
        return {
          queryKey: ['blockaidSimulation', 'skip'],
          queryFn: async () => null,
        }
      }

      const blockaidTxSimulationInput = getBlockaidTxSimulationInput({
        payload: keysignPayload,
        walletCore,
      })

      if (!blockaidTxSimulationInput) {
        return {
          queryKey: ['blockaidSimulation', 'skip'],
          queryFn: async () => null,
        }
      }

      if (!isChainOfKind(blockaidTxSimulationInput.chain, 'evm')) {
        return {
          queryKey: ['blockaidSimulation', 'skip'],
          queryFn: async () => null,
        }
      }

      const evmBlockaidTxSimulationInput: BlockaidTxSimulationInput<EvmChain> =
        {
          chain: blockaidTxSimulationInput.chain,
          data: blockaidTxSimulationInput.data,
        }

      const query = getBlockaidTxSimulationQuery(evmBlockaidTxSimulationInput)

      return {
        ...query,
        queryFn: async () => {
          const sim = await query.queryFn()

          if (
            'assets_diffs' in sim.account_summary &&
            sim.account_summary.assets_diffs.length > 1
          ) {
            return parseBlockaidEvmSimulation(sim, chain)
          }

          return null
        },
      }
    }
  )

  const gasEstimationQuery = useStateDependentQuery(
    {
      keysignPayload: keysignPayloadQuery.data,
    },
    ({
      keysignPayload,
    }: {
      keysignPayload: typeof keysignPayloadQuery.data
    }) => {
      if (!isChainOfKind(chain, 'evm') || !keysignPayload) {
        return {
          queryKey: ['gasEstimation', 'skip'],
          queryFn: async () => null,
        }
      }

      return getGasEstimationQuery({ keysignPayload })
    }
  )

  const gasEstimationDataQuery = useTransformQueriesData(
    {
      keysignPayload: keysignPayloadQuery,
      gasEstimation: gasEstimationQuery,
    },
    ({ keysignPayload, gasEstimation }) => ({
      keysignPayload,
      gasEstimation: gasEstimation ?? null,
    })
  )

  return (
    <VerifyKeysignStart keysignPayloadQuery={keysignPayloadQuery}>
      <MatchQuery
        value={gasEstimationDataQuery}
        pending={() => <PendingState />}
        error={error => (
          <FlowErrorPageContent
            error={error}
            title={t('failed_to_process_transaction')}
          />
        )}
        success={({ keysignPayload, gasEstimation }) => {
          const hasSwapPayload =
            keysignPayload.swapPayload && keysignPayload.swapPayload.value

          const evmSpecific = isChainOfKind(chain, 'evm')
            ? getBlockchainSpecificValue(
                keysignPayload.blockchainSpecific,
                'ethereumSpecific'
              )
            : null

          const actualGasLimit = evmSpecific
            ? BigInt(evmSpecific.gasLimit)
            : null

          const estimatedGas = gasEstimation

          const isInsufficientGas =
            estimatedGas !== null &&
            actualGasLimit !== null &&
            estimatedGas > actualGasLimit

          return (
            <List>
              {isInsufficientGas && (
                <Panel>
                  <VStack gap={12} alignItems="center">
                    <TriangleAlertIcon color="danger" fontSize={24} />
                    <VStack gap={8} alignItems="center">
                      <Text
                        size={15}
                        weight={500}
                        color="danger"
                        centerHorizontally
                      >
                        {t('insufficient_gas_limit')}
                      </Text>
                      <Text size={13} color="shy" centerHorizontally>
                        {t('insufficient_gas_limit_description', {
                          estimated: estimatedGas.toString(),
                          limit: actualGasLimit.toString(),
                        })}
                      </Text>
                    </VStack>
                  </VStack>
                </Panel>
              )}
              {isChainOfKind(chain, 'evm') && (
                <MatchQuery
                  value={blockaidSimulationQuery}
                  error={() => (
                    <Panel>
                      <VStack gap={12} alignItems="center">
                        <TriangleAlertIcon color="warning" fontSize={24} />
                        <VStack gap={8} alignItems="center">
                          <Text
                            size={15}
                            weight={500}
                            color="warning"
                            centerHorizontally
                          >
                            {t('blockaid_simulation_failed')}
                          </Text>
                          <Text size={13} color="shy" centerHorizontally>
                            {t('blockaid_simulation_failed_description')}
                          </Text>
                        </VStack>
                      </VStack>
                    </Panel>
                  )}
                  success={() => null}
                  pending={() => null}
                  inactive={() => null}
                />
              )}
              {hasSwapPayload ? (
                <ContentWrapper gap={24}>
                  <Text color="supporting" size={15}>
                    {t('youre_swapping')}
                  </Text>
                  <VStack gap={16}>
                    {(() => {
                      const swapPayloadValue = shouldBePresent(
                        keysignPayload.swapPayload?.value,
                        'swapPayload.value'
                      )
                      const fromCoin = shouldBePresent(
                        swapPayloadValue.fromCoin,
                        'fromCoin'
                      ) as AccountCoin

                      const toCoin = shouldBePresent(
                        swapPayloadValue.toCoin,
                        'toCoin'
                      ) as AccountCoin

                      const fromAmount = Number(
                        formatUnits(
                          swapPayloadValue.fromAmount,
                          fromCoin.decimals
                        )
                      ).toString()

                      return (
                        <>
                          <SwapAmountDisplay
                            coin={fromCoin}
                            amount={fromAmount}
                          />
                          <HStack alignItems="center" gap={21}>
                            <IconWrapper>
                              <ArrowDownIcon />
                            </IconWrapper>
                            <HorizontalLine />
                          </HStack>
                          <SwapAmountDisplay
                            coin={toCoin}
                            amount={swapPayloadValue.toAmountDecimal}
                          />
                        </>
                      )
                    })()}
                  </VStack>
                  <MemoSection memo={keysignPayload.memo} chain={chain} />
                  <NetworkFeeSection
                    keysignPayload={keysignPayload}
                    transactionPayload={transactionPayload}
                    chain={chain}
                    feeSettings={feeSettings}
                    setFeeSettings={setFeeSettings}
                    walletCore={walletCore}
                    publicKey={publicKey}
                  />
                </ContentWrapper>
              ) : isChainOfKind(chain, 'evm') ? (
                <MatchQuery
                  value={blockaidSimulationQuery}
                  success={blockaidEvmSimulationInfo => {
                    const hasBlockaidSwap =
                      blockaidEvmSimulationInfo &&
                      'swap' in blockaidEvmSimulationInfo

                    if (!hasBlockaidSwap) {
                      return (
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
                          <MemoSection
                            memo={keysignPayload.memo}
                            chain={chain}
                          />
                          <NetworkFeeSection
                            keysignPayload={keysignPayload}
                            transactionPayload={transactionPayload}
                            chain={chain}
                            feeSettings={feeSettings}
                            setFeeSettings={setFeeSettings}
                            walletCore={walletCore}
                            publicKey={publicKey}
                          />
                        </>
                      )
                    }

                    const swapInfo = shouldBePresent(
                      blockaidEvmSimulationInfo,
                      'blockaidEvmSimulationInfo'
                    )
                    const swap = shouldBePresent(
                      'swap' in swapInfo ? swapInfo.swap : null,
                      'swap info'
                    )
                    const fromCoin = swap.fromCoin as AccountCoin
                    const toCoin = swap.toCoin as AccountCoin
                    const fromAmountDecimal = formatAmount(
                      Number(formatUnits(swap.fromAmount, fromCoin.decimals)),
                      fromCoin
                    )
                    const toAmountDecimal = formatAmount(
                      Number(formatUnits(swap.toAmount, toCoin.decimals)),
                      toCoin
                    )

                    return (
                      <ContentWrapper gap={24}>
                        <Text color="supporting" size={15}>
                          {t('youre_swapping')}
                        </Text>
                        <VStack gap={16}>
                          <SwapAmountDisplay
                            coin={fromCoin}
                            amount={fromAmountDecimal}
                            useRoundedIcon
                          />
                          <HStack alignItems="center" gap={21}>
                            <IconWrapper>
                              <ArrowDownIcon />
                            </IconWrapper>
                            <HorizontalLine />
                          </HStack>
                          <SwapAmountDisplay
                            coin={toCoin}
                            amount={toAmountDecimal}
                            useRoundedIcon
                          />
                        </VStack>
                        <MemoSection memo={keysignPayload.memo} chain={chain} />
                        <NetworkFeeSection
                          keysignPayload={keysignPayload}
                          transactionPayload={transactionPayload}
                          chain={chain}
                          feeSettings={feeSettings}
                          setFeeSettings={setFeeSettings}
                          walletCore={walletCore}
                          publicKey={publicKey}
                        />
                      </ContentWrapper>
                    )
                  }}
                  error={() => null}
                  pending={() => null}
                  inactive={() => null}
                />
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
                  <MemoSection memo={keysignPayload.memo} chain={chain} />
                  <NetworkFeeSection
                    keysignPayload={keysignPayload}
                    transactionPayload={transactionPayload}
                    chain={chain}
                    feeSettings={feeSettings}
                    setFeeSettings={setFeeSettings}
                    walletCore={walletCore}
                    publicKey={publicKey}
                  />
                </>
              )}
            </List>
          )
        }}
      />
    </VerifyKeysignStart>
  )
}
