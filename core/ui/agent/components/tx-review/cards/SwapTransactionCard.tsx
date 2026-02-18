import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getCoinBalance } from '@core/chain/coin/balance'
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useQuery } from '@tanstack/react-query'
import { FC } from 'react'
import styled from 'styled-components'

import {
  ResolvedTokenInfo,
  resolveSwapTokenInfo,
} from '../../../tools/shared/assetResolution'
import { Transaction } from '../../../types'
import { TransactionDetailsSection } from '../TransactionDetailsSection'
import { formatTokenAmount } from '../utils'
import { TokenRow } from './TokenRow'

type Props = {
  transaction: Transaction
  chain: string
  sender: string
}

export const SwapTransactionCard: FC<Props> = ({
  transaction,
  chain,
  sender,
}) => {
  const meta = transaction.metadata ?? {}
  const fromChain = (meta.from_chain as string) ?? chain
  const fromSymbol = (meta.from_symbol as string) ?? ''
  const fromDecimals = (meta.from_decimals as number) ?? 18
  const toChain = (meta.to_chain as string) ?? chain
  const toSymbol = (meta.to_symbol as string) ?? ''
  const toDecimals = (meta.to_decimals as number) ?? 18
  const amount = (meta.amount as string) ?? '0'
  const expectedOutput = (meta.expected_output as string) ?? ''
  const minimumOutput = (meta.minimum_output as string) ?? ''

  const fromInfo = resolveSwapTokenInfo(fromChain, fromSymbol, fromDecimals)
  const toInfo = resolveSwapTokenInfo(toChain, toSymbol, toDecimals)

  const priceIds: string[] = []
  if (fromInfo.priceProviderId) priceIds.push(fromInfo.priceProviderId)
  if (toInfo.priceProviderId) priceIds.push(toInfo.priceProviderId)

  const priceQuery = useQuery({
    queryKey: ['txReviewPrices', priceIds],
    queryFn: () => getCoinPrices({ ids: priceIds }),
    enabled: priceIds.length > 0,
  })

  const fromPrice = fromInfo.priceProviderId
    ? (priceQuery.data?.[fromInfo.priceProviderId.toLowerCase()] ?? null)
    : null
  const toPrice = toInfo.priceProviderId
    ? (priceQuery.data?.[toInfo.priceProviderId.toLowerCase()] ?? null)
    : null

  const balanceQuery = useQuery({
    queryKey: ['txReviewBalance', fromChain, fromSymbol, sender],
    queryFn: () =>
      getCoinBalance({
        chain: fromInfo.chain!,
        id: fromInfo.contractAddress,
        address: sender,
      }),
    enabled: fromInfo.chain !== null,
  })

  const fromBalanceHuman =
    balanceQuery.data !== undefined
      ? fromChainAmount(balanceQuery.data, fromInfo.decimals)
      : null

  const insufficientBalance =
    balanceQuery.data !== undefined &&
    toChainAmount(parseFloat(amount), fromInfo.decimals) > balanceQuery.data

  const expectedFormatted = formatTokenAmount(expectedOutput, toInfo.decimals)
  const minimumFormatted = formatTokenAmount(minimumOutput, toInfo.decimals)

  const fromUsdValue =
    fromPrice !== null ? parseFloat(amount) * fromPrice : null
  const expectedNum =
    expectedOutput && expectedOutput !== '<nil>'
      ? fromChainAmount(expectedOutput, toInfo.decimals)
      : null
  const expectedUsdValue =
    toPrice !== null && expectedNum !== null ? expectedNum * toPrice : null

  const makeCoinIcon = (info: ResolvedTokenInfo) =>
    info.chain && info.logo
      ? { chain: info.chain, id: info.contractAddress, logo: info.logo }
      : null

  return (
    <VStack gap={12}>
      <Text size={13} weight={600}>
        {transaction.label}
      </Text>

      <SwapPairContainer>
        <TokenRow
          info={fromInfo}
          coinIcon={makeCoinIcon(fromInfo)}
          amount={`${amount} ${fromInfo.ticker}`}
          usdValue={fromUsdValue}
          balance={fromBalanceHuman}
          verified={fromInfo.isLocallyVerified}
        />

        <HStack alignItems="center" justifyContent="center">
          <ArrowCircle>
            <ArrowDownIcon />
          </ArrowCircle>
        </HStack>

        <TokenRow
          info={toInfo}
          coinIcon={makeCoinIcon(toInfo)}
          amount={`${expectedFormatted} ${toInfo.ticker}`}
          usdValue={expectedUsdValue}
          subAmount={`Min: ${minimumFormatted} ${toInfo.ticker}`}
          verified={toInfo.isLocallyVerified}
        />
      </SwapPairContainer>

      {insufficientBalance && (
        <Text size={13} color="danger">
          Insufficient balance: you have{' '}
          {fromBalanceHuman !== null ? formatAmount(fromBalanceHuman) : '...'}{' '}
          {fromInfo.ticker} but the swap requires {amount} {fromInfo.ticker}
        </Text>
      )}

      <TransactionDetailsSection
        tx={transaction.tx_data}
        chain={chain}
        sender={sender}
        label="Swap"
      />
    </VStack>
  )
}

const SwapPairContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: ${getColor('background')};
`

const ArrowCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${getColor('textShy')};
`
