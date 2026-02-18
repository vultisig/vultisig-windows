import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getEvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { getCoinBalance } from '@core/chain/coin/balance'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useQuery } from '@tanstack/react-query'
import { FC, useState } from 'react'
import styled from 'styled-components'

import {
  ResolvedTokenInfo,
  resolveSwapTokenInfo,
} from '../../tools/shared/assetResolution'
import { Action, TxReady } from '../../types'
import { AddressValue } from '../shared/AddressValue'
import { agentCard } from '../shared/agentCard'
import { AgentCardIcon } from '../shared/AgentCardIcon'
import { CopyableValue } from '../shared/CopyableValue'
import { DetailRow } from '../shared/DetailRow'
import { DecodedCalldata } from './DecodedCalldata'
import { TokenRow } from './TokenRow'
import { formatTokenAmount, parseDecodedParams } from './utils'

type SwapReviewState = 'review' | 'signing' | 'success' | 'error'

type Props = {
  txReady: TxReady
  onSign: (action: Action) => void
  onCancel: () => void
}

export const SwapReviewCard: FC<Props> = ({ txReady, onSign, onCancel }) => {
  const [state, setState] = useState<SwapReviewState>('review')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [txDetailsExpanded, setTxDetailsExpanded] = useState(false)

  const fromInfo = resolveSwapTokenInfo(
    txReady.from_chain,
    txReady.from_symbol,
    txReady.from_decimals
  )

  const toInfo = resolveSwapTokenInfo(
    txReady.to_chain,
    txReady.to_symbol,
    txReady.to_decimals
  )

  const priceIds: string[] = []
  if (fromInfo.priceProviderId) priceIds.push(fromInfo.priceProviderId)
  if (toInfo.priceProviderId) priceIds.push(toInfo.priceProviderId)

  const priceQuery = useQuery({
    queryKey: ['swapReviewPrices', priceIds],
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
    queryKey: [
      'swapReviewBalance',
      txReady.from_chain,
      txReady.from_symbol,
      txReady.sender,
    ],
    queryFn: () =>
      getCoinBalance({
        chain: fromInfo.chain!,
        id: fromInfo.contractAddress,
        address: txReady.sender,
      }),
    enabled: fromInfo.chain !== null,
  })

  const fromBalanceHuman =
    balanceQuery.data !== undefined
      ? fromChainAmount(balanceQuery.data, fromInfo.decimals)
      : null

  const insufficientBalance =
    balanceQuery.data !== undefined &&
    toChainAmount(parseFloat(txReady.amount), fromInfo.decimals) >
      balanceQuery.data

  const normalizeHex = (hex: string) =>
    hex.startsWith('0x') ? hex : `0x${hex}`

  const swapData = txReady.swap_tx.data
    ? normalizeHex(txReady.swap_tx.data)
    : ''
  const approvalData = txReady.approval_tx?.data
    ? normalizeHex(txReady.approval_tx.data)
    : ''

  const swapCalldataQuery = useQuery({
    queryKey: ['swapCalldata', swapData.slice(0, 10)],
    queryFn: () => getEvmContractCallInfo(swapData),
    enabled: swapData.length >= 10,
  })

  const approvalCalldataQuery = useQuery({
    queryKey: ['approvalCalldata', approvalData.slice(0, 10)],
    queryFn: () => getEvmContractCallInfo(approvalData),
    enabled: approvalData.length >= 10,
  })

  const expectedFormatted = formatTokenAmount(
    txReady.expected_output,
    toInfo.decimals
  )
  const minimumFormatted = formatTokenAmount(
    txReady.minimum_output,
    toInfo.decimals
  )

  const fromUsdValue =
    fromPrice !== null ? parseFloat(txReady.amount) * fromPrice : null
  const expectedNum =
    txReady.expected_output && txReady.expected_output !== '<nil>'
      ? fromChainAmount(txReady.expected_output, toInfo.decimals)
      : null
  const expectedUsdValue =
    toPrice !== null && expectedNum !== null ? expectedNum * toPrice : null

  const approvalAmount = (() => {
    const decoded = approvalCalldataQuery.data
    if (!decoded) return null
    const params = parseDecodedParams(
      decoded.functionSignature,
      decoded.functionArguments,
      fromInfo.decimals
    )
    const amountParam = params.find(p => p.type === 'uint256')
    if (!amountParam) return null
    return amountParam.formatted ?? amountParam.value
  })()

  const formatTxValue = (value: string): string => {
    if (!value || value === '0') return '0'
    const decimals = fromInfo.chain ? chainFeeCoin[fromInfo.chain].decimals : 18
    const ticker = fromInfo.chain ? chainFeeCoin[fromInfo.chain].ticker : ''
    const num = fromChainAmount(value, decimals)
    return formatAmount(num, { ticker })
  }

  const handleSign = () => {
    setState('signing')
    setErrorMsg(null)

    const action: Action = {
      id: `swap-tx-${Date.now()}`,
      type: 'sign_swap_tx',
      title: `Swap ${txReady.amount} ${txReady.from_symbol} to ${txReady.to_symbol}`,
      params: {
        from_chain: txReady.from_chain,
        sender: txReady.sender,
        needs_approval: txReady.needs_approval,
        swap_tx: txReady.swap_tx,
        approval_tx: txReady.approval_tx,
      },
      auto_execute: false,
    }

    onSign(action)
  }

  const handleRetry = () => {
    setState('review')
    setErrorMsg(null)
  }

  const makeCoinIcon = (info: ResolvedTokenInfo) =>
    info.chain && info.logo
      ? { chain: info.chain, id: info.contractAddress, logo: info.logo }
      : null

  return (
    <Card $state={state}>
      <VStack gap={16}>
        <HStack alignItems="center" justifyContent="space-between">
          <HStack gap={8} alignItems="center">
            <AgentCardIcon $size={32}>&#x1F504;</AgentCardIcon>
            <Text size={15} weight={600}>
              Swap Preview
            </Text>
          </HStack>
          {txReady.provider && (
            <ProviderBadge>
              <Text size={12} weight={500}>
                via {txReady.provider}
              </Text>
            </ProviderBadge>
          )}
        </HStack>

        <SwapPairContainer>
          <TokenRow
            info={fromInfo}
            coinIcon={makeCoinIcon(fromInfo)}
            amount={`${txReady.amount} ${fromInfo.ticker}`}
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

        {txReady.needs_approval && (
          <DetailRow style={{ padding: '4px 0' }}>
            <Text size={13} color="supporting">
              Token Approval
            </Text>
            <Text size={13} weight={500} color="primary">
              Required
            </Text>
          </DetailRow>
        )}

        <ExpandButton onClick={() => setTxDetailsExpanded(prev => !prev)}>
          <HStack
            alignItems="center"
            justifyContent="space-between"
            style={{ width: '100%' }}
          >
            <Text size={14} weight={500}>
              Transaction Details
            </Text>
            <RotatingChevron $expanded={txDetailsExpanded} />
          </HStack>
        </ExpandButton>

        {txDetailsExpanded && (
          <DetailsContainer>
            {txReady.needs_approval && txReady.approval_tx && (
              <>
                <Text size={13} weight={600}>
                  Approval Transaction
                </Text>
                <DetailRow style={{ padding: '4px 0' }}>
                  <Text size={12} color="supporting">
                    Spender
                  </Text>
                  <AddressValue
                    address={txReady.approval_tx.to}
                    chain={fromInfo.chain}
                    selfAddress={txReady.sender}
                  />
                </DetailRow>
                {approvalAmount && (
                  <DetailRow style={{ padding: '4px 0' }}>
                    <Text size={12} color="supporting">
                      Approval Amount
                    </Text>
                    <Text size={12} weight={500}>
                      {approvalAmount} {fromInfo.ticker}
                    </Text>
                  </DetailRow>
                )}
                <DetailRow style={{ padding: '4px 0' }}>
                  <Text size={12} color="supporting">
                    Nonce
                  </Text>
                  <Text size={12} weight={500}>
                    {txReady.approval_tx.nonce}
                  </Text>
                </DetailRow>
                <DetailRow style={{ padding: '4px 0' }}>
                  <Text size={12} color="supporting">
                    Gas Limit
                  </Text>
                  <Text size={12} weight={500}>
                    {txReady.approval_tx.gas_limit.toLocaleString()}
                  </Text>
                </DetailRow>
                <DecodedCalldata
                  data={approvalData}
                  query={approvalCalldataQuery}
                  label="Approval"
                  tokenDecimals={fromInfo.decimals}
                  chain={fromInfo.chain}
                  selfAddress={txReady.sender}
                />
              </>
            )}

            <Text
              size={13}
              weight={600}
              style={txReady.needs_approval ? { paddingTop: 8 } : undefined}
            >
              Swap Transaction
            </Text>
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Router
              </Text>
              <AddressValue
                address={txReady.swap_tx.to}
                chain={fromInfo.chain}
                selfAddress={txReady.sender}
              />
            </DetailRow>
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Msg Value (
                {fromInfo.chain ? chainFeeCoin[fromInfo.chain].ticker : 'ETH'})
              </Text>
              <Text size={12} weight={500}>
                {formatTxValue(txReady.swap_tx.value)}
              </Text>
            </DetailRow>
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Nonce
              </Text>
              <Text size={12} weight={500}>
                {txReady.swap_tx.nonce}
              </Text>
            </DetailRow>
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Gas Limit
              </Text>
              <Text size={12} weight={500}>
                {txReady.swap_tx.gas_limit.toLocaleString()}
              </Text>
            </DetailRow>
            {txReady.swap_tx.chain_id && (
              <DetailRow style={{ padding: '4px 0' }}>
                <Text size={12} color="supporting">
                  Chain ID
                </Text>
                <Text size={12} weight={500}>
                  {txReady.swap_tx.chain_id}
                </Text>
              </DetailRow>
            )}
            {txReady.swap_tx.memo && (
              <DetailRow style={{ padding: '4px 0' }}>
                <Text size={12} color="supporting">
                  Memo
                </Text>
                <CopyableValue value={txReady.swap_tx.memo} />
              </DetailRow>
            )}
            <DecodedCalldata
              data={swapData}
              query={swapCalldataQuery}
              label="Swap"
              chain={fromInfo.chain}
              selfAddress={txReady.sender}
            />
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Sender
              </Text>
              <AddressValue
                address={txReady.sender}
                chain={fromInfo.chain}
                selfAddress={txReady.sender}
              />
            </DetailRow>
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Destination
              </Text>
              <AddressValue
                address={txReady.destination}
                chain={toInfo.chain}
                selfAddress={txReady.sender}
              />
            </DetailRow>
          </DetailsContainer>
        )}

        {insufficientBalance && (
          <Text size={13} color="danger">
            Insufficient balance: you have{' '}
            {fromBalanceHuman !== null ? formatAmount(fromBalanceHuman) : '...'}{' '}
            {fromInfo.ticker} but the swap requires {txReady.amount}{' '}
            {fromInfo.ticker}
          </Text>
        )}

        {state === 'review' && (
          <HStack gap={8}>
            <Button kind="outlined" onClick={onCancel} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              style={{ flex: 1 }}
              disabled={insufficientBalance}
            >
              Sign & Send
            </Button>
          </HStack>
        )}

        {state === 'signing' && <Button loading>Signing...</Button>}

        {state === 'error' && (
          <VStack gap={8}>
            <Text size={13} color="danger">
              {errorMsg || 'Transaction failed'}
            </Text>
            <Button kind="outlined" onClick={handleRetry}>
              Retry
            </Button>
          </VStack>
        )}

        {state === 'success' && (
          <Text size={13} color="primary">
            Transaction submitted
          </Text>
        )}
      </VStack>
    </Card>
  )
}

const Card = styled.div<{ $state: SwapReviewState }>`
  ${agentCard}
  padding: 16px;
  border-color: ${({ $state }) => {
    switch ($state) {
      case 'success':
        return getColor('primary')
      case 'error':
        return getColor('danger')
      default:
        return getColor('mist')
    }
  }};
`

const ProviderBadge = styled.div`
  padding: 4px 10px;
  border-radius: 8px;
  background: ${getColor('primary')}18;
  border: 1px solid ${getColor('primary')}40;
  color: ${getColor('primary')};
`

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

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  background: ${getColor('background')};
`

const ExpandButton = styled(UnstyledButton)`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${getColor('background')};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const RotatingChevron = styled(ChevronDownIcon)<{ $expanded: boolean }>`
  transition: transform 0.2s ease;
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  font-size: 16px;
  color: ${getColor('textShy')};
`
