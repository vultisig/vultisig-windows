import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useBlockaidPayloadSimulationQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidPayloadSimulation'
import { extractTokenAndAmount } from '@core/ui/chain/tx/utils/extractTokenAndAmount'
import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { getSignDataTxAction } from '@core/ui/mpc/keysign/tx/utils/getSignDataTxAction'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquareArrowTopRightIcon } from '@lib/ui/icons/SquareArrowTopRightIcon'
import { HStack, hStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { useQuery } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getEvmContractCallInfo } from '@vultisig/core-chain/chains/evm/contract/call/info'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { knownTokensIndex } from '@vultisig/core-chain/coin/knownTokens'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { formatUnits } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { useTxHash } from '../../../chain/state/txHash'
import { useCore } from '../../../state/core'
import { TxStatusTracker } from './TxStatusTracker'

export const TxSuccess = ({
  onSeeTxDetails,
  value,
}: ValueProp<KeysignPayload> & {
  onSeeTxDetails: () => void
}) => {
  const { t } = useTranslation()
  const { coin: potentialCoin, toAmount, skipBroadcast } = value
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const walletCore = useAssertWalletCore()
  const txHash = useTxHash()
  const [, copyToClipboard] = useCopyToClipboard()
  const { openUrl } = useCore()

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return 0

    return fromChainAmount(BigInt(toAmount), coin.decimals)
  }, [toAmount, coin.decimals])

  const txAction = useMemo(
    () => getSignDataTxAction(value, formattedToAmount),
    [value, formattedToAmount]
  )

  const isContractExecution = txAction?.action === 'contract_execution'
  const memo = value.memo
  const blockaidSimulationQuery = useBlockaidPayloadSimulationQuery({
    keysignPayload: value,
    walletCore,
  })

  const functionQuery = useQuery({
    queryKey: ['evmContractCallInfo', memo],
    queryFn: () => getEvmContractCallInfo(memo!),
    enabled: isContractExecution && !!memo && memo.length > 2,
    staleTime: Infinity,
  })

  const rawFunctionName =
    functionQuery.data?.functionSignature?.split('(')[0] ?? undefined
  const resolvedLabel = rawFunctionName
    ? capitalizeFirstLetter(rawFunctionName)
    : undefined

  const vaultCoins = useCurrentVaultCoins()

  const resolvedToken = useMemo(() => {
    if (!functionQuery.data) return null
    const pair = extractTokenAndAmount(
      functionQuery.data.functionSignature,
      functionQuery.data.functionArguments,
      value.toAddress
    )
    if (!pair) return null

    const tokenKey = { chain: coin.chain, id: pair.tokenAddress }

    const vaultCoin = vaultCoins.find(c => areEqualCoins(c, tokenKey))
    const knownCoin =
      vaultCoin ??
      knownTokensIndex[coin.chain]?.[pair.tokenAddress.toLowerCase()]
    if (!knownCoin) return null

    // BigInt() throws on non-numeric strings; an uncaught throw here would
    // crash the whole success screen, so swallow and fall back to the native
    // amount.
    let rawAmount: bigint
    try {
      rawAmount = BigInt(pair.rawAmount)
    } catch {
      return null
    }

    const formatted = formatTokenAmount({
      rawAmount,
      decimals: knownCoin.decimals,
      functionName: rawFunctionName,
    })

    if (formatted.isSentinel && !formatted.display) return null

    return {
      coin: knownCoin,
      amount: formatted.numericValue,
      amountOverride:
        formatted.isSentinel && formatted.display
          ? `${formatted.display} ${knownCoin.ticker}`
          : undefined,
    }
  }, [
    functionQuery.data,
    vaultCoins,
    coin.chain,
    value.toAddress,
    rawFunctionName,
  ])

  const simulationBalanceChange = useMemo(() => {
    const data = blockaidSimulationQuery.data
    if (
      !data ||
      !('balanceChanges' in data) ||
      data.balanceChanges.length === 0
    ) {
      return null
    }
    return (
      data.balanceChanges.find(change => change.direction === 'send') ??
      data.balanceChanges[0]
    )
  }, [blockaidSimulationQuery.data])

  const displayCoin =
    simulationBalanceChange?.coin ?? resolvedToken?.coin ?? coin
  const displayAmount = simulationBalanceChange
    ? Number(
        formatUnits(
          simulationBalanceChange.amount,
          simulationBalanceChange.coin.decimals
        )
      )
    : (resolvedToken?.amount ??
      (txAction && 'amount' in txAction && txAction.amount !== undefined
        ? txAction.amount
        : formattedToAmount))
  const displayAmountOverride = simulationBalanceChange
    ? undefined
    : resolvedToken?.amountOverride

  const blockExplorerUrl = getBlockExplorerUrl({
    chain: coin.chain,
    entity: 'tx',
    value: txHash,
  })

  return (
    <VStack gap={36} data-testid="tx-success">
      <TxStatusTracker chain={coin.chain} hash={txHash} />
      <VStack gap={8}>
        <TxOverviewAmount
          amount={displayAmount}
          value={displayCoin}
          actionLabel={
            txAction?.action !== 'send' ? txAction?.labelKey : undefined
          }
          resolvedLabel={resolvedLabel}
          amountOverride={displayAmountOverride}
        />
        {!skipBroadcast && (
          <List>
            <ListItem
              hoverable
              extra={
                <HStack
                  flexGrow
                  alignItems="center"
                  gap={8}
                  justifyContent="flex-end"
                >
                  <TruncatedTextWrapper
                    data-testid="tx-hash"
                    data-hash={txHash}
                  >
                    <Text size={14}>
                      <MiddleTruncate width={85} text={txHash} />
                    </Text>
                  </TruncatedTextWrapper>
                  <TxRowIconButton
                    onClick={() => copyToClipboard(blockExplorerUrl)}
                  >
                    <ClipboardCopyIcon />
                  </TxRowIconButton>
                  <TxRowIconButton onClick={() => openUrl(blockExplorerUrl)}>
                    <SquareArrowTopRightIcon />
                  </TxRowIconButton>
                </HStack>
              }
              title={
                <Text size={14} color="shy">
                  {t('tx_hash')}
                </Text>
              }
            />
            <ListItem
              onClick={onSeeTxDetails}
              title={<Text size={14}>{t('transaction_details')}</Text>}
              hoverable
              showArrow
            />
          </List>
        )}
      </VStack>
    </VStack>
  )
}

const TxRowIconButton = styled(IconWrapper).attrs({
  role: 'button',
  tabIndex: 0,
})`
  cursor: pointer;
  font-size: 16px;
  outline: none;

  &:hover {
    color: ${getColor('textShy')};
  }

  &:focus-visible {
    color: ${getColor('textShy')};
  }
`

const TruncatedTextWrapper = styled.div`
  ${hStack({
    justifyContent: 'flex-end',
  })};
`
