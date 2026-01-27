import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { BlockaidSimulationContent } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidSimulationContent'
import { BlockaidSimulationError } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidSimulationError'
import { useBlockaidSimulationQuery } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/useBlockaidSimulationQuery'
import { MemoSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/MemoSection'
import { NetworkFeeSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/NetworkFeeSection'
import { SwapAmountDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/SwapAmountDisplay'
import { ParsedTx } from '@core/inpage-provider/popup/view/resolvers/sendTx/core/parsedTx'
import { getGasEstimationQuery } from '@core/inpage-provider/popup/view/resolvers/sendTx/gasEstimation/getGasEstimationQuery'
import { useSendTxKeysignPayloadQuery } from '@core/inpage-provider/popup/view/resolvers/sendTx/keysignPayload/query'
import { PendingState } from '@core/inpage-provider/popup/view/resolvers/sendTx/PendingState'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { FeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { SignAminoDisplay } from '@core/ui/mpc/keysign/tx/components/SignAminoDisplay'
import { SignDirectDisplay } from '@core/ui/mpc/keysign/tx/components/SignDirectDisplay'
import { SignSolanaDisplay } from '@core/ui/mpc/keysign/tx/components/SignSolanaDisplay'
import { useCurrentVaultPublicKey } from '@core/ui/vault/state/currentVault'
import {
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatUnits } from 'ethers'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetCoin } from './core/coin'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'

type SendTxOverviewProps = {
  parsedTx: ParsedTx
}

export const SendTxOverview = ({ parsedTx }: SendTxOverviewProps) => {
  const { coin, customTxData } = parsedTx
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(coin.chain)
  const { t } = useTranslation()
  const getCoin = useGetCoin()
  const transactionPayload = usePopupInput<'sendTx'>()

  const { chain, address } = coin

  const [feeSettings, setFeeSettings] = useState<FeeSettings<'evm'> | null>(
    null
  )

  const keysignPayloadQuery = useSendTxKeysignPayloadQuery({
    parsedTx,
    feeSettings: feeSettings || undefined,
  })

  const blockaidSimulationQuery = useBlockaidSimulationQuery({
    keysignPayloadQuery,
    walletCore,
  })

  const gasEstimationInput = useTransformQueryData(
    keysignPayloadQuery,
    useCallback(
      (payload: KeysignPayload) => {
        if (!isChainOfKind(chain, 'evm')) {
          return null
        }

        return { keysignPayload: payload }
      },
      [chain]
    )
  )

  const gasEstimationQuery = usePotentialQuery(
    gasEstimationInput.data || undefined,
    getGasEstimationQuery,
    null
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
        success={({ keysignPayload, gasEstimation: estimatedGas }) => {
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

          const isInsufficientGas =
            estimatedGas !== null &&
            actualGasLimit !== null &&
            estimatedGas > actualGasLimit

          return (
            <>
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
              {isChainOfKind(chain, 'evm') ||
                (chain === Chain.Solana && (
                  <MatchQuery
                    value={blockaidSimulationQuery}
                    error={() => <BlockaidSimulationError />}
                    success={() => null}
                    pending={() => null}
                    inactive={() => null}
                  />
                ))}
              {hasSwapPayload ? (
                <>
                  <VStack
                    bgColor="foreground"
                    gap={16}
                    padding={24}
                    radius={16}
                  >
                    {(() => {
                      const swapPayloadValue = shouldBePresent(
                        keysignPayload.swapPayload?.value,
                        'swapPayload.value'
                      )

                      if (
                        isChainOfKind(chain, 'solana') &&
                        'solana' in customTxData &&
                        'swap' in customTxData.solana
                      ) {
                        const provider = customTxData.solana.swap.swapProvider
                        if (provider === 'fallback') {
                          return (
                            <WarningBlock icon={CircleInfoIcon}>
                              {t('fallback_swap_warning')}
                            </WarningBlock>
                          )
                        }
                      }

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
                          <Text color="supporting" size={15}>
                            {t('youre_swapping')}
                          </Text>
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
                </>
              ) : isChainOfKind(chain, 'evm') ? (
                <BlockaidSimulationContent
                  blockaidSimulationQuery={blockaidSimulationQuery}
                  keysignPayload={keysignPayload}
                  address={address}
                  chain={chain}
                  networkFeeProps={{
                    keysignPayload,
                    transactionPayload,
                    chain,
                    feeSettings,
                    setFeeSettings,
                    walletCore,
                    publicKey,
                  }}
                  getCoin={getCoin}
                />
              ) : (
                <>
                  {keysignPayload.signData.case === 'signSolana' ? (
                    <>
                      <BlockaidSimulationContent
                        blockaidSimulationQuery={blockaidSimulationQuery}
                        keysignPayload={keysignPayload}
                        address={address}
                        chain={chain}
                        networkFeeProps={{
                          keysignPayload,
                          transactionPayload,
                          chain,
                          feeSettings,
                          setFeeSettings,
                          walletCore,
                          publicKey,
                        }}
                        getCoin={getCoin}
                      />
                      <SignSolanaDisplay payload={keysignPayload} />
                    </>
                  ) : (
                    <>
                      {(() => {
                        return (
                          <>
                            <List>
                              <ListItem
                                description={address}
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
                            </List>
                            <MemoSection
                              memo={keysignPayload.memo}
                              chain={chain}
                            />
                            <VStack bgColor="foreground" radius={16}>
                              <NetworkFeeSection
                                keysignPayload={keysignPayload}
                                transactionPayload={transactionPayload}
                                chain={chain}
                                feeSettings={feeSettings}
                                setFeeSettings={setFeeSettings}
                                walletCore={walletCore}
                                publicKey={publicKey}
                              />
                            </VStack>
                          </>
                        )
                      })()}
                    </>
                  )}
                </>
              )}
              {keysignPayload.signData.case === 'signAmino' && (
                <SignAminoDisplay signAmino={keysignPayload.signData.value} />
              )}
              {keysignPayload.signData.case === 'signDirect' && (
                <SignDirectDisplay signDirect={keysignPayload.signData.value} />
              )}
            </>
          )
        }}
      />
    </VerifyKeysignStart>
  )
}
