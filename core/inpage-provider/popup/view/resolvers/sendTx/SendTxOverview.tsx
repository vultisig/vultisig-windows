import { BlockaidSimulationContent } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidSimulationContent'
import { BlockaidSimulationError } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidSimulationError'
import { useBlockaidSimulationQuery } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/useBlockaidSimulationQuery'
import { CosmosTxTypeRow } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/CosmosTxTypeRow'
import { DappRequestHeader } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/DappRequestHeader'
import {
  DappRequestDivider,
  DappRequestRow,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/components/DappRequestRow'
import { MemoSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/MemoSection'
import { NetworkFeeSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/NetworkFeeSection'
import { SwapAmountDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/SwapAmountDisplay'
import { ParsedTx } from '@core/inpage-provider/popup/view/resolvers/sendTx/core/parsedTx'
import { getGasEstimationQuery } from '@core/inpage-provider/popup/view/resolvers/sendTx/gasEstimation/getGasEstimationQuery'
import { getNonNativeDappCosmosFeeDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/keysignPayload/dappCosmosFee'
import { useSendTxKeysignPayloadQuery } from '@core/inpage-provider/popup/view/resolvers/sendTx/keysignPayload/query'
import { PendingState } from '@core/inpage-provider/popup/view/resolvers/sendTx/PendingState'
import { SuiTxIntentDisplay } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/SuiTxIntentDisplay'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useGetCoin } from '@core/ui/chain/coin/useGetCoin'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { BlockaidEvmSimulationView } from '@core/ui/chain/security/blockaid/tx/blockaidEvmSimulationView'
import { useEvmContractCallInfoQuery } from '@core/ui/chain/tx/utils/useEvmContractCallInfoQuery'
import { useUniversalRouterSwap } from '@core/ui/chain/tx/utils/useUniversalRouterSwap'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { SignAminoDisplay } from '@core/ui/mpc/keysign/tx/components/SignAminoDisplay'
import { SignDirectDisplay } from '@core/ui/mpc/keysign/tx/components/SignDirectDisplay'
import { SignSolanaDisplay } from '@core/ui/mpc/keysign/tx/components/SignSolanaDisplay'
import { SignTonDisplay } from '@core/ui/mpc/keysign/tx/components/SignTonDisplay'
import { parseSuiTx } from '@core/ui/mpc/keysign/tx/sui/parser'
import { SignSuiDisplay } from '@core/ui/mpc/keysign/tx/sui/SignSuiDisplay'
import { useCore } from '@core/ui/state/core'
import { useCurrentVaultNullablePublicKey } from '@core/ui/vault/state/currentVault'
import {
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { Button } from '@lib/ui/buttons/Button'
import { ErrorFallbackContent } from '@lib/ui/flow/ErrorFallbackContent'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { Chain, OtherChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { getTxBlockaidSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation'
import { parseBlockaidSuiSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation/api/core'
import { BlockaidSolanaSimulationInfo } from '@vultisig/core-chain/security/blockaid/tx/simulation/core'
import { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getFeeAmount } from '@vultisig/core-mpc/keysign/fee'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatUnits } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { hasBlockaidSimulationErrorBanner } from './blockaid/blockaidSimulationErrorBanner'
import { BlockaidSimulationPending } from './blockaid/BlockaidSimulationPending'
import {
  getTransactionErrorMessage,
  isSendTxOverviewErrorQuery,
} from './sendTxOverviewError'

type SendTxOverviewProps = {
  parsedTx: ParsedTx
  onSendTxOverviewErrorChange?: (isActive: boolean) => void
}

export const SendTxOverview = ({
  parsedTx,
  onSendTxOverviewErrorChange,
}: SendTxOverviewProps) => {
  const { coin, customTxData } = parsedTx
  const walletCore = useAssertWalletCore()
  const { t } = useTranslation()
  const getCoin = useGetCoin()
  const transactionPayload = usePopupInput<'sendTx'>()

  const { chain, address } = coin

  const { goBack } = useCore()

  const [feeSettings, setFeeSettings] = useState<FeeSettings<'evm'> | null>(
    null
  )

  const keysignPayloadQuery = useSendTxKeysignPayloadQuery({
    parsedTx,
    feeSettings: feeSettings || undefined,
  })

  const nativeBalanceQuery = useBalanceQuery(
    extractAccountCoinKey({ ...chainFeeCoin[chain], address })
  )

  const publicKey = useCurrentVaultNullablePublicKey(chain)

  // Chains whose dApp keysign we can gate on native funds before signing: the
  // wallet knows both the native value and the fee up front, and the node
  // rejects `value + fee > balance` at broadcast (mirrors the in-wallet send
  // form). Others can't form a meaningful check — Sui/Polkadot don't surface a
  // value, UTXO pre-selects its inputs, and Solana txs are dApp-built.
  const canCheckFunds =
    isChainOfKind(chain, 'evm') ||
    isChainOfKind(chain, 'cosmos') ||
    isChainOfKind(chain, 'ton')

  const nativeFeeQuery = useQuery({
    queryKey: [
      'dappNativeFee',
      keysignPayloadQuery.data,
      publicKey,
      walletCore,
    ],
    queryFn: () =>
      getFeeAmount({
        keysignPayload: shouldBePresent(keysignPayloadQuery.data),
        walletCore,
        publicKey: shouldBePresent(publicKey),
      }),
    enabled: canCheckFunds && !!keysignPayloadQuery.data && !!publicKey,
  })

  const blockaidSimulationQuery = useBlockaidSimulationQuery({
    keysignPayloadQuery,
    walletCore,
  })

  // Sui dApp signing carries the already-built PTB. Decode it for the human
  // readable command breakdown and ask Blockaid for the predicted balance
  // changes — the popup runs in the extension context, so the dApp page's CSP
  // doesn't block the scan. The generic `useBlockaidSimulationQuery` above is
  // inactive for Sui (it only covers EVM + Solana), so we scan here directly.
  const suiTransactionBytes =
    'sui' in customTxData ? customTxData.sui.transactionBytes : null

  const suiTxData = suiTransactionBytes ? parseSuiTx(suiTransactionBytes) : null

  const suiIntentQuery = useQuery({
    queryKey: ['blockaidSuiScan', address, suiTransactionBytes],
    queryFn: async () => {
      const simulation = await getTxBlockaidSimulation({
        chain: OtherChain.Sui,
        data: {
          chain: 'mainnet',
          options: ['simulation'],
          account_address: address,
          transaction: suiTransactionBytes ?? '',
          metadata: {},
        },
      })
      return parseBlockaidSuiSimulation(simulation)
    },
    enabled: !!suiTransactionBytes,
    staleTime: 30_000,
    retry: false,
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

  const gasEstimationDataQuery = useCombineQueries({
    queries: {
      keysignPayload: keysignPayloadQuery,
      gasEstimation: gasEstimationQuery,
    },
    joinData: ({ keysignPayload, gasEstimation }) => ({
      keysignPayload,
      gasEstimation: gasEstimation ?? null,
    }),
    eager: false,
  })

  const memo = keysignPayloadQuery.data?.memo
  const isEvm = isChainOfKind(chain, 'evm')

  // Gate keysign before it starts: the node rejects a tx whose
  // `value + fee` exceeds the native balance at broadcast — after the MPC
  // ceremony has already run. Block it here instead, mirroring the in-wallet
  // send form. Applies to EVM, Cosmos and Ton (see `canCheckFunds`).
  const insufficientFundsMessage = (() => {
    const payload = keysignPayloadQuery.data
    const nativeBalance = nativeBalanceQuery.data
    const fee = nativeFeeQuery.data

    if (!canCheckFunds || !payload || nativeBalance == null || fee == null) {
      return undefined
    }

    // A Cosmos dApp tx can pay its fee in a non-native token; that amount isn't
    // comparable to the native balance, so don't gate those.
    if (
      isChainOfKind(chain, 'cosmos') &&
      getNonNativeDappCosmosFeeDisplay({ keysignPayload: payload, chain })
    ) {
      return undefined
    }

    // `toAmount` is native for EVM (it's the tx `value`), but for Cosmos/Ton it
    // is only native when the sent coin is the fee coin — a token amount there
    // must not be added to the native fee. Ton Connect also batches up to
    // `maxMessages` transfers into a single request while `toAmount` carries
    // only the first, so sum every message's native amount for the Ton gate.
    const nativeValue =
      payload.signData.case === 'signTon'
        ? payload.signData.value.tonMessages.reduce(
            (sum, message) => sum + BigInt(message.amount),
            0n
          )
        : isChainOfKind(chain, 'evm') || isFeeCoin(coin)
          ? BigInt(payload.toAmount)
          : 0n

    if (nativeValue + fee > nativeBalance) {
      return nativeValue > 0n
        ? t('insufficient_balance')
        : t('insufficient_native_balance_for_fee')
    }

    return undefined
  })()
  const isContractMemo =
    !!memo && memo.startsWith('0x') && memo.length > 2 && isEvm

  const universalRouterSwap = useUniversalRouterSwap({ memo, chain })

  const contractCallQuery = useEvmContractCallInfoQuery({
    memo,
    enabled:
      isContractMemo &&
      !universalRouterSwap.isPending &&
      !universalRouterSwap.data,
  })

  const isContractDecodingPending =
    isContractMemo &&
    (universalRouterSwap.isPending ||
      (!universalRouterSwap.data && contractCallQuery.isPending))

  const isContractDecodingFailed =
    isContractMemo && !universalRouterSwap.data && !!contractCallQuery.error

  const isSendTxOverviewError = isSendTxOverviewErrorQuery(
    gasEstimationDataQuery
  )

  useEffect(() => {
    onSendTxOverviewErrorChange?.(isSendTxOverviewError)
  }, [isSendTxOverviewError, onSendTxOverviewErrorChange])

  useEffect(
    () => () => {
      onSendTxOverviewErrorChange?.(false)
    },
    [onSendTxOverviewErrorChange]
  )

  const extraPendingMessage = (() => {
    if (isSendTxOverviewError) {
      return undefined
    }
    if (
      gasEstimationDataQuery.isPending ||
      isContractDecodingPending ||
      // Keep the start button disabled until the balance and fee are known, or
      // the insufficient-funds gate below would be bypassed during their load.
      (canCheckFunds &&
        (nativeBalanceQuery.isPending || nativeFeeQuery.isPending))
    ) {
      return t('loading')
    }
    if (isContractDecodingFailed) {
      return t('failed_to_process_transaction')
    }
    return undefined
  })()

  return (
    <VerifyKeysignStart
      keysignPayloadQuery={keysignPayloadQuery}
      extraPendingMessage={extraPendingMessage}
      disabledMessage={insufficientFundsMessage}
      footer={
        isSendTxOverviewError ? (
          <Button onClick={goBack}>{t('back')}</Button>
        ) : undefined
      }
    >
      <MatchQuery
        value={gasEstimationDataQuery}
        pending={() => <PendingState />}
        error={error => (
          <ErrorFallbackContent
            error={getTransactionErrorMessage(error)}
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
              {insufficientFundsMessage && (
                <Panel>
                  <VStack gap={12} alignItems="center">
                    <TriangleAlertIcon color="danger" fontSize={24} />
                    <Text
                      size={15}
                      weight={500}
                      color="danger"
                      centerHorizontally
                    >
                      {insufficientFundsMessage}
                    </Text>
                  </VStack>
                </Panel>
              )}
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
              {hasBlockaidSimulationErrorBanner(chain) && (
                <MatchQuery
                  value={blockaidSimulationQuery}
                  error={() => <BlockaidSimulationError />}
                  success={() => null}
                  pending={() => <BlockaidSimulationPending />}
                  inactive={() => null}
                />
              )}
              {hasSwapPayload ? (
                <>
                  <VStack
                    bgColor="foreground"
                    gap={16}
                    padding={24}
                    radius={16}
                  >
                    <DappRequestRow />
                    <DappRequestDivider />
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
                  />
                </>
              ) : (
                <>
                  <DappRequestHeader />
                  {isChainOfKind(chain, 'evm') ? (
                    <BlockaidSimulationContent
                      chain={chain}
                      blockaidSimulationQuery={
                        blockaidSimulationQuery as Query<
                          BlockaidEvmSimulationView,
                          unknown
                        >
                      }
                      keysignPayload={keysignPayload}
                      address={address}
                      networkFeeProps={{
                        keysignPayload,
                        transactionPayload,
                        chain,
                        feeSettings,
                        setFeeSettings,
                      }}
                      getCoin={getCoin}
                    />
                  ) : chain === Chain.Solana &&
                    keysignPayload.signData.case === 'signSolana' ? (
                    <>
                      <BlockaidSimulationContent
                        chain={chain}
                        blockaidSimulationQuery={
                          blockaidSimulationQuery as Query<
                            BlockaidSolanaSimulationInfo,
                            unknown
                          >
                        }
                        keysignPayload={keysignPayload}
                        address={address}
                        networkFeeProps={{
                          keysignPayload,
                          transactionPayload,
                          chain,
                          feeSettings,
                          setFeeSettings,
                        }}
                        getCoin={getCoin}
                      />
                      <SignSolanaDisplay
                        signSolana={keysignPayload.signData.value}
                      />
                    </>
                  ) : chain === Chain.Ton &&
                    keysignPayload.signData.case === 'signTon' ? (
                    <>
                      <List>
                        <ListItem description={address} title={t('from')} />
                        <ListItem
                          description={getKeysignChain(keysignPayload)}
                          title={t('network')}
                        />
                      </List>
                      <SignTonDisplay
                        fromAddress={address}
                        keysignPayload={keysignPayload}
                        signTon={keysignPayload.signData.value}
                      />
                      <VStack bgColor="foreground" radius={16}>
                        <NetworkFeeSection
                          keysignPayload={keysignPayload}
                          transactionPayload={transactionPayload}
                          chain={chain}
                          feeSettings={feeSettings}
                          setFeeSettings={setFeeSettings}
                        />
                      </VStack>
                    </>
                  ) : chain === Chain.Sui &&
                    keysignPayload.signData.case === 'signSui' ? (
                    <>
                      <List>
                        <ListItem description={address} title={t('from')} />
                        <ListItem
                          description={getKeysignChain(keysignPayload)}
                          title={t('network')}
                        />
                      </List>
                      {suiIntentQuery.data ? (
                        <SuiTxIntentDisplay intent={suiIntentQuery.data} />
                      ) : null}
                      {suiTxData ? <SignSuiDisplay data={suiTxData} /> : null}
                    </>
                  ) : (
                    <>
                      <List>
                        <CosmosTxTypeRow keysignPayload={keysignPayload} />
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
                      </List>
                      <MemoSection memo={keysignPayload.memo} chain={chain} />
                      <VStack bgColor="foreground" radius={16}>
                        <NetworkFeeSection
                          keysignPayload={keysignPayload}
                          transactionPayload={transactionPayload}
                          chain={chain}
                          feeSettings={feeSettings}
                          setFeeSettings={setFeeSettings}
                        />
                      </VStack>
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
