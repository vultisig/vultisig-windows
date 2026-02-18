import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { getEvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { getCoinBalance } from '@core/chain/coin/balance'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useQuery } from '@tanstack/react-query'
import { FC, useMemo, useState } from 'react'
import styled from 'styled-components'

import { truncateAddress } from '../../tools/shared/coinHelpers'
import { Action, TxReady } from '../../types'
import { ResolvedTokenInfo, resolveSwapTokenInfo } from './resolveSwapTokenInfo'

const formatTokenAmount = (raw: string, decimals: number): string => {
  if (!raw || raw === '<nil>') return '\u2014'

  const s = raw.replace(/^0+/, '') || '0'

  if (decimals <= 0) return s

  const padded = s.padStart(decimals + 1, '0')
  const intPart = padded.slice(0, padded.length - decimals)
  const fracPart = padded.slice(padded.length - decimals).replace(/0+$/, '')

  if (!fracPart) return intPart

  const trimmed = fracPart.length > 8 ? fracPart.slice(0, 8) : fracPart
  return `${intPart}.${trimmed}`
}

const truncateHex = (hex: string): string => {
  if (hex.length <= 20) return hex
  return hex.slice(0, 10) + '\u2026' + hex.slice(-4)
}

const getExplorerAddressUrl = (
  chain: Chain | null,
  address: string
): string | null => {
  if (!chain) return null
  return getBlockExplorerUrl({ chain, entity: 'address', value: address })
}

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

  const fromInfo = useMemo(
    () =>
      resolveSwapTokenInfo(
        txReady.from_chain,
        txReady.from_symbol,
        txReady.from_decimals
      ),
    [txReady.from_chain, txReady.from_symbol, txReady.from_decimals]
  )

  const toInfo = useMemo(
    () =>
      resolveSwapTokenInfo(
        txReady.to_chain,
        txReady.to_symbol,
        txReady.to_decimals
      ),
    [txReady.to_chain, txReady.to_symbol, txReady.to_decimals]
  )

  const priceIds = useMemo(() => {
    const ids: string[] = []
    if (fromInfo.priceProviderId) ids.push(fromInfo.priceProviderId)
    if (toInfo.priceProviderId) ids.push(toInfo.priceProviderId)
    return ids
  }, [fromInfo.priceProviderId, toInfo.priceProviderId])

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

  const fromBalanceHuman = useMemo(() => {
    if (balanceQuery.data === undefined) return null
    return fromChainAmount(balanceQuery.data, fromInfo.decimals)
  }, [balanceQuery.data, fromInfo.decimals])

  const insufficientBalance = useMemo(() => {
    if (balanceQuery.data === undefined) return false
    const swapAmount = toChainAmount(
      parseFloat(txReady.amount),
      fromInfo.decimals
    )
    return swapAmount > balanceQuery.data
  }, [balanceQuery.data, txReady.amount, fromInfo.decimals])

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

  const expectedFormatted = useMemo(
    () => formatTokenAmount(txReady.expected_output, toInfo.decimals),
    [txReady.expected_output, toInfo.decimals]
  )
  const minimumFormatted = useMemo(
    () => formatTokenAmount(txReady.minimum_output, toInfo.decimals),
    [txReady.minimum_output, toInfo.decimals]
  )

  const fromUsdValue =
    fromPrice !== null ? parseFloat(txReady.amount) * fromPrice : null
  const expectedNum = useMemo(
    () =>
      txReady.expected_output && txReady.expected_output !== '<nil>'
        ? fromChainAmount(txReady.expected_output, toInfo.decimals)
        : null,
    [txReady.expected_output, toInfo.decimals]
  )
  const expectedUsdValue =
    toPrice !== null && expectedNum !== null ? expectedNum * toPrice : null

  const approvalAmount = useMemo(() => {
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
  }, [approvalCalldataQuery.data, fromInfo.decimals])

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

  const fromCoinIcon =
    fromInfo.chain && fromInfo.logo
      ? {
          chain: fromInfo.chain,
          id: fromInfo.contractAddress,
          logo: fromInfo.logo,
        }
      : null

  const toCoinIcon =
    toInfo.chain && toInfo.logo
      ? {
          chain: toInfo.chain,
          id: toInfo.contractAddress,
          logo: toInfo.logo,
        }
      : null

  return (
    <Card $state={state}>
      <VStack gap={16}>
        <HStack alignItems="center" justifyContent="space-between">
          <HStack gap={8} alignItems="center">
            <SwapIcon>&#x1F504;</SwapIcon>
            <Text size={15} weight={600}>
              Swap Preview
            </Text>
          </HStack>
          {txReady.provider && (
            <ProviderBadge>
              <Text size={11} color="supporting">
                via {txReady.provider}
              </Text>
            </ProviderBadge>
          )}
        </HStack>

        <SwapPairContainer>
          <TokenRow
            info={fromInfo}
            coinIcon={fromCoinIcon}
            amount={`${txReady.amount} ${fromInfo.ticker}`}
            usdValue={fromUsdValue}
            balance={fromBalanceHuman}
          />

          <HStack alignItems="center" justifyContent="center">
            <ArrowCircle>
              <ArrowDownIcon />
            </ArrowCircle>
          </HStack>

          <TokenRow
            info={toInfo}
            coinIcon={toCoinIcon}
            amount={`${expectedFormatted} ${toInfo.ticker}`}
            usdValue={expectedUsdValue}
            subAmount={`Min: ${minimumFormatted} ${toInfo.ticker}`}
          />
        </SwapPairContainer>

        <HStack gap={8}>
          <VerificationBadge $verified={fromInfo.isLocallyVerified}>
            <Text size={11}>
              {fromInfo.ticker}{' '}
              {fromInfo.isLocallyVerified ? 'verified' : 'unverified'}
            </Text>
          </VerificationBadge>
          <VerificationBadge $verified={toInfo.isLocallyVerified}>
            <Text size={11}>
              {toInfo.ticker}{' '}
              {toInfo.isLocallyVerified ? 'verified' : 'unverified'}
            </Text>
          </VerificationBadge>
        </HStack>

        {txReady.needs_approval && (
          <DetailRow>
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
                <DetailRow>
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
                  <DetailRow>
                    <Text size={12} color="supporting">
                      Approval Amount
                    </Text>
                    <Text size={12} weight={500}>
                      {approvalAmount} {fromInfo.ticker}
                    </Text>
                  </DetailRow>
                )}
                <DetailRow>
                  <Text size={12} color="supporting">
                    Nonce
                  </Text>
                  <Text size={12} weight={500}>
                    {txReady.approval_tx.nonce}
                  </Text>
                </DetailRow>
                <DetailRow>
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
            <DetailRow>
              <Text size={12} color="supporting">
                Router
              </Text>
              <AddressValue
                address={txReady.swap_tx.to}
                chain={fromInfo.chain}
                selfAddress={txReady.sender}
              />
            </DetailRow>
            <DetailRow>
              <Text size={12} color="supporting">
                Msg Value (
                {fromInfo.chain ? chainFeeCoin[fromInfo.chain].ticker : 'ETH'})
              </Text>
              <Text size={12} weight={500}>
                {formatTxValue(txReady.swap_tx.value)}
              </Text>
            </DetailRow>
            <DetailRow>
              <Text size={12} color="supporting">
                Nonce
              </Text>
              <Text size={12} weight={500}>
                {txReady.swap_tx.nonce}
              </Text>
            </DetailRow>
            <DetailRow>
              <Text size={12} color="supporting">
                Gas Limit
              </Text>
              <Text size={12} weight={500}>
                {txReady.swap_tx.gas_limit.toLocaleString()}
              </Text>
            </DetailRow>
            {txReady.swap_tx.chain_id && (
              <DetailRow>
                <Text size={12} color="supporting">
                  Chain ID
                </Text>
                <Text size={12} weight={500}>
                  {txReady.swap_tx.chain_id}
                </Text>
              </DetailRow>
            )}
            {txReady.swap_tx.memo && (
              <DetailRow>
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
            <DetailRow>
              <Text size={12} color="supporting">
                Sender
              </Text>
              <AddressValue
                address={txReady.sender}
                chain={fromInfo.chain}
                selfAddress={txReady.sender}
              />
            </DetailRow>
            <DetailRow>
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

const TokenRow: FC<{
  info: ResolvedTokenInfo
  coinIcon: {
    chain: ResolvedTokenInfo['chain']
    id?: string
    logo: string
  } | null
  amount: string
  usdValue: number | null
  subAmount?: string
  balance?: number | null
}> = ({ info, coinIcon, amount, usdValue, subAmount, balance }) => {
  const explorerUrl = info.contractAddress
    ? getExplorerAddressUrl(info.chain, info.contractAddress)
    : null

  return (
    <HStack gap={12} alignItems="center" justifyContent="space-between">
      <HStack gap={12} alignItems="center" style={{ flex: 1, minWidth: 0 }}>
        {coinIcon && coinIcon.chain ? (
          <CoinIcon
            coin={{
              chain: coinIcon.chain,
              id: coinIcon.id,
              logo: coinIcon.logo,
            }}
            style={{ fontSize: 32 }}
          />
        ) : (
          <ChainEntityIcon style={{ fontSize: 32 }} />
        )}
        <VStack gap={2} style={{ minWidth: 0 }}>
          <HStack gap={6} alignItems="baseline">
            <Text size={15} weight={600}>
              {info.ticker}
            </Text>
            <Text size={12} color="supporting">
              {info.chain ?? info.ticker}
            </Text>
          </HStack>
          {info.contractAddress ? (
            explorerUrl ? (
              <ExplorerLink
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncateAddress(info.contractAddress)} &#x2197;
              </ExplorerLink>
            ) : (
              <CopyableValue value={info.contractAddress} />
            )
          ) : (
            <Text size={11} color="supporting">
              Native
            </Text>
          )}
          <Text size={11} color="supporting">
            Decimals: {info.decimals}
          </Text>
          {balance !== undefined && balance !== null && (
            <Text size={11} color="supporting">
              Balance: {formatAmount(balance)} {info.ticker}
            </Text>
          )}
        </VStack>
      </HStack>
      <VStack gap={2} alignItems="end" style={{ flexShrink: 0 }}>
        <Text size={14} weight={500}>
          {amount}
        </Text>
        {usdValue !== null && (
          <Text size={12} color="supporting">
            {formatAmount(usdValue, { currency: 'usd' })}
          </Text>
        )}
        {subAmount && (
          <Text size={11} color="shy">
            {subAmount}
          </Text>
        )}
      </VStack>
    </HStack>
  )
}

const CopyableValue: FC<{ value: string; display?: string }> = ({
  value,
  display,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <HStack gap={4} alignItems="center">
      <MonoText size={12} color="supporting">
        {display ?? truncateAddress(value)}
      </MonoText>
      <CopyButton onClick={handleCopy}>
        <CopyIcon />
      </CopyButton>
    </HStack>
  )
}

const AddressValue: FC<{
  address: string
  chain: Chain | null
  selfAddress?: string
}> = ({ address, chain, selfAddress }) => {
  const isSelf =
    selfAddress && address.toLowerCase() === selfAddress.toLowerCase()
  const url = getExplorerAddressUrl(chain, address)

  if (url) {
    return (
      <HStack gap={4} alignItems="center">
        <ExplorerLink href={url} target="_blank" rel="noopener noreferrer">
          {truncateAddress(address)} &#x2197;
        </ExplorerLink>
        {isSelf && (
          <SelfBadge>
            <Text size={10}>(SELF)</Text>
          </SelfBadge>
        )}
      </HStack>
    )
  }

  return (
    <HStack gap={4} alignItems="center">
      <CopyableValue value={address} />
      {isSelf && (
        <SelfBadge>
          <Text size={10}>(SELF)</Text>
        </SelfBadge>
      )}
    </HStack>
  )
}

type CalldataInfo = {
  functionSignature: string
  functionArguments: string
} | null

type CalldataQuery = {
  data: CalldataInfo | undefined
  isPending: boolean
}

type DecodedParam = {
  type: string
  value: string
  formatted?: string
}

const parseDecodedParams = (
  signature: string,
  argsJson: string,
  tokenDecimals?: number
): DecodedParam[] => {
  const paramsStr = signature.slice(
    signature.indexOf('(') + 1,
    signature.lastIndexOf(')')
  )
  if (!paramsStr) return []

  const types = paramsStr.split(',').map(t => t.trim())

  let values: string[] = []
  try {
    const parsed = JSON.parse(argsJson)
    if (Array.isArray(parsed)) {
      values = parsed.map(v => String(v))
    }
  } catch {
    return []
  }

  return types.map((type, i) => {
    const raw = values[i] ?? ''
    const param: DecodedParam = { type, value: raw }

    if (type === 'uint256' && raw && tokenDecimals !== undefined) {
      const maxUint256 =
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      if (raw === maxUint256) {
        param.formatted = 'Unlimited (Max uint256)'
      } else {
        const num = fromChainAmount(raw, tokenDecimals)
        param.formatted = formatAmount(num)
      }
    }

    if (type === 'address' && raw.length === 42) {
      param.formatted = truncateAddress(raw)
    }

    return param
  })
}

const DecodedCalldata: FC<{
  data: string
  query: CalldataQuery
  label: string
  tokenDecimals?: number
  chain?: Chain | null
  selfAddress?: string
}> = ({ data, query, label, tokenDecimals, chain, selfAddress }) => {
  const [expanded, setExpanded] = useState(false)
  const decoded = query.data

  const functionName = decoded ? decoded.functionSignature.split('(')[0] : null

  const params = useMemo(() => {
    if (!decoded) return []
    return parseDecodedParams(
      decoded.functionSignature,
      decoded.functionArguments,
      tokenDecimals
    )
  }, [decoded, tokenDecimals])

  if (!data) return null

  const selector = data.slice(0, 10)

  return (
    <>
      <DetailRow>
        <Text size={12} color="supporting">
          {label} Function
        </Text>
        <HStack gap={4} alignItems="center">
          {query.isPending ? (
            <Text size={12} color="shy">
              Decoding...
            </Text>
          ) : functionName ? (
            <FunctionButton onClick={() => setExpanded(prev => !prev)}>
              <MonoText size={12} weight={600} color="primary">
                {decoded?.functionSignature}
              </MonoText>
              <RotatingChevron $expanded={expanded} style={{ fontSize: 12 }} />
            </FunctionButton>
          ) : (
            <MonoText size={12} color="supporting">
              {selector}
            </MonoText>
          )}
        </HStack>
      </DetailRow>
      {expanded && decoded && (
        <CalldataParamsBlock>
          {params.map((param, i) => {
            if (!param.value) return null

            const isAddress = param.type === 'address'
            const isSelf =
              isAddress &&
              selfAddress &&
              param.value.toLowerCase() === selfAddress.toLowerCase()
            const addressUrl =
              isAddress && chain
                ? getExplorerAddressUrl(chain, param.value)
                : null

            return (
              <DetailRow key={i}>
                <Text size={12} color="supporting">
                  arg{i}{' '}
                  <MonoText as="span" size={11} color="shy">
                    ({param.type})
                  </MonoText>
                </Text>
                <VStack gap={1} alignItems="end">
                  {isAddress ? (
                    <HStack gap={4} alignItems="center">
                      {addressUrl ? (
                        <ExplorerLink
                          href={addressUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {param.formatted ?? param.value} &#x2197;
                        </ExplorerLink>
                      ) : (
                        <CopyableValue value={param.value} />
                      )}
                      {isSelf && (
                        <SelfBadge>
                          <Text size={10}>(SELF)</Text>
                        </SelfBadge>
                      )}
                    </HStack>
                  ) : (
                    <>
                      <MonoText size={12} weight={500}>
                        {param.formatted ?? truncateHex(param.value)}
                      </MonoText>
                      {param.formatted && <CopyableValue value={param.value} />}
                    </>
                  )}
                </VStack>
              </DetailRow>
            )
          })}
          <DetailRow>
            <Text size={12} color="supporting">
              Raw Data
            </Text>
            <CopyableValue value={data} display={truncateHex(data)} />
          </DetailRow>
        </CalldataParamsBlock>
      )}
    </>
  )
}

const Card = styled.div<{ $state: SwapReviewState }>`
  padding: 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  border: 1px solid
    ${({ $state }) => {
      switch ($state) {
        case 'success':
          return getColor('primary')
        case 'error':
          return getColor('danger')
        default:
          return getColor('mist')
      }
    }};
  transition: all 0.15s ease;
`

const SwapIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`

const ProviderBadge = styled.div`
  padding: 2px 8px;
  border-radius: 8px;
  background: ${getColor('foregroundExtra')};
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

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
`

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  background: ${getColor('background')};
`

const VerificationBadge = styled.div<{ $verified: boolean }>`
  padding: 2px 8px;
  border-radius: 6px;
  background: ${({ $verified }) =>
    $verified ? 'rgba(0, 200, 83, 0.12)' : 'rgba(255, 171, 0, 0.12)'};
  color: ${({ $verified }) =>
    $verified ? 'rgb(0, 200, 83)' : 'rgb(255, 171, 0)'};
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

const FunctionButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`

const CalldataParamsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${getColor('foreground')};
`

const RotatingChevron = styled(ChevronDownIcon)<{ $expanded: boolean }>`
  transition: transform 0.2s ease;
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  font-size: 16px;
  color: ${getColor('textShy')};
`

const ExplorerLink = styled.a`
  font-size: 11px;
  font-family: monospace;
  color: ${getColor('primary')};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

const MonoText = styled(Text)`
  font-family: monospace;
`

const SelfBadge = styled.div`
  padding: 1px 5px;
  border-radius: 4px;
  background: ${getColor('primary')}20;
  color: ${getColor('primary')};
`

const CopyButton = styled(UnstyledButton)`
  padding: 2px;
  border-radius: 4px;
  color: ${getColor('textShy')};
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: ${getColor('text')};
  }
`
