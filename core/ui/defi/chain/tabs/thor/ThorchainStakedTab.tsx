import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import {
  useRujiStakeViewQuery,
  useThorMergedAssetsQuery,
  useThorTcyStakeQuery,
} from '@core/ui/defi/chain/thor/hooks'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

const decimals = 8

const formatTokenAmount = (value: bigint) =>
  formatAmount(fromChainAmount(value, decimals), { precision: 'high' })

const formatUsd = (value: number) =>
  `$${formatAmount(value, { precision: 'high' })}`

type StakeCardData = {
  label: string
  ticker: string
  amount: bigint
  usdValue: number
  logo: string
  apr?: string
  nextPayout?: string
  estimatedReward?: string
  showWithdrawButton?: boolean
  withdrawAmount?: string
}

export const ThorchainStakedTab = () => {
  const {
    data: tcyStake,
    isPending: isTcyPending,
    isError: isTcyError,
  } = useThorTcyStakeQuery()
  const {
    data: mergedAssets,
    isPending: isMergedPending,
    isError: isMergedError,
  } = useThorMergedAssetsQuery()
  const { data: rujiStake } = useRujiStakeViewQuery()
  const navigate = useCoreNavigate()

  const runeCoin = chainFeeCoin.THORChain
  const pricesQuery = useCoinPricesQuery({
    coins: [
      {
        chain: Chain.THORChain,
        id: runeCoin.id,
        priceProviderId: runeCoin.priceProviderId,
      },
    ],
  })
  const runePrice = pricesQuery.data?.[`${Chain.THORChain}:`] ?? 0

  if (isTcyPending || isMergedPending) {
    return (
      <HStack justifyContent="center">
        <Spinner />
      </HStack>
    )
  }

  if (isTcyError || isMergedError) {
    return (
      <Text color="danger" size={14}>
        Failed to load stake data.
      </Text>
    )
  }

  // Build stake cards data
  const stakeCards: StakeCardData[] = []

  // TCY Card
  const tcyAmount = tcyStake ?? 0n
  if (tcyAmount > 0n) {
    stakeCards.push({
      label: 'Staked TCY',
      ticker: 'TCY',
      amount: tcyAmount,
      usdValue: fromChainAmount(tcyAmount, decimals) * runePrice,
      logo: 'tcy',
      apr: '5.17%',
      nextPayout: 'Oct 15, 25',
      estimatedReward: '20 RUNE',
    })
  }

  // sTCY (Compounded TCY) - from merged assets
  const stcyPosition = mergedAssets?.find(p =>
    p.symbol.toLowerCase().includes('stcy')
  )
  if (stcyPosition) {
    const amount = BigInt(stcyPosition.sizeAmountChain ?? '0')
    stakeCards.push({
      label: 'Compounded TCY',
      ticker: 'sTCY',
      amount,
      usdValue: fromChainAmount(amount, decimals) * runePrice,
      logo: 'tcy',
      apr: '5.17%',
      nextPayout: 'Oct 15, 25',
      estimatedReward: '20 RUNE',
    })
  }

  // RUJI positions
  const rujiPositions =
    mergedAssets?.filter(
      position =>
        position.symbol.toLowerCase().includes('ruji') &&
        !position.symbol.toLowerCase().includes('stcy')
    ) ?? []

  rujiPositions.forEach(position => {
    const amount = BigInt(position.sizeAmountChain ?? '0')
    const hasRewards = rujiStake && BigInt(rujiStake.rewardsAmount ?? '0') > 0n

    stakeCards.push({
      label: `Staked ${position.symbol.toUpperCase()}`,
      ticker: position.symbol.toUpperCase(),
      amount,
      usdValue: fromChainAmount(amount, decimals) * runePrice,
      logo: 'ruji',
      apr: '5.17%',
      nextPayout: 'Oct 15, 25',
      estimatedReward: '20 RUNE',
      showWithdrawButton: hasRewards ?? false,
      withdrawAmount: hasRewards
        ? `${formatTokenAmount(BigInt(rujiStake?.rewardsAmount ?? '0'))} ${rujiStake?.rewardsTicker ?? 'USDC'}`
        : undefined,
    })
  })

  // If no positions at all, show TCY with 0
  if (stakeCards.length === 0) {
    stakeCards.push({
      label: 'Staked TCY',
      ticker: 'TCY',
      amount: 0n,
      usdValue: 0,
      logo: 'tcy',
      apr: '5.17%',
      nextPayout: '--',
      estimatedReward: '-- RUNE',
    })
  }

  return (
    <VStack gap={16}>
      {stakeCards.map((card, index) => (
        <StakeCardPanel key={`${card.ticker}-${index}`}>
          {/* Header with icon and APR */}
          <HStack justifyContent="space-between" alignItems="flex-start">
            <HStack gap={12} alignItems="center">
              <SafeImage
                src={getCoinLogoSrc(card.logo)}
                render={props => <TokenIcon {...props} />}
                fallback={
                  <TokenIconFallback>{card.ticker[0]}</TokenIconFallback>
                }
              />
              <VStack gap={4}>
                <Text size={12} color="shy">
                  {card.label}
                </Text>
                <Text size={20} weight="700" color="contrast">
                  {formatTokenAmount(card.amount)} {card.ticker}
                </Text>
                <Text size={12} color="shy">
                  {formatUsd(card.usdValue)}
                </Text>
              </VStack>
            </HStack>
            {card.apr && (
              <VStack alignItems="flex-end" gap={4}>
                <HStack gap={4} alignItems="center">
                  <AprIcon>@</AprIcon>
                  <Text size={12} color="shy">
                    APR
                  </Text>
                </HStack>
                <Text size={14} weight="600" color="primary">
                  {card.apr}
                </Text>
              </VStack>
            )}
          </HStack>

          {/* Payout info */}
          {(card.nextPayout || card.estimatedReward) && (
            <HStack gap={24}>
              {card.nextPayout && (
                <VStack gap={4}>
                  <HStack gap={4} alignItems="center">
                    <InfoIcon>📅</InfoIcon>
                    <Text size={11} color="shy">
                      Next payout
                    </Text>
                  </HStack>
                  <Text size={12} color="contrast">
                    {card.nextPayout}
                  </Text>
                </VStack>
              )}
              {card.estimatedReward && (
                <VStack gap={4}>
                  <HStack gap={4} alignItems="center">
                    <InfoIcon>@</InfoIcon>
                    <Text size={11} color="shy">
                      Estimated reward
                    </Text>
                  </HStack>
                  <Text size={12} color="contrast">
                    {card.estimatedReward}
                  </Text>
                </VStack>
              )}
            </HStack>
          )}

          {/* Withdraw button for RUJI rewards */}
          {card.showWithdrawButton && card.withdrawAmount && (
            <WithdrawButton
              onClick={() =>
                navigate({
                  id: 'deposit',
                  state: {
                    coin: chainFeeCoin.THORChain,
                    action: 'withdraw_ruji_rewards',
                  },
                })
              }
            >
              Withdraw {card.withdrawAmount}
            </WithdrawButton>
          )}

          {/* Action buttons */}
          <HStack gap={10}>
            <ActionButton
              onClick={() =>
                navigate({
                  id: 'deposit',
                  state: { coin: chainFeeCoin.THORChain, action: 'unstake' },
                })
              }
            >
              <ButtonIcon>⊖</ButtonIcon>
              Unstake
            </ActionButton>
            <PrimaryActionButton
              onClick={() =>
                navigate({
                  id: 'deposit',
                  state: { coin: chainFeeCoin.THORChain, action: 'stake' },
                })
              }
            >
              <ButtonIcon>⊕</ButtonIcon>
              Stake
            </PrimaryActionButton>
          </HStack>
        </StakeCardPanel>
      ))}
    </VStack>
  )
}

const StakeCardPanel = styled(Panel)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TokenIcon = styled.img`
  ${sameDimensions(40)};
  border-radius: 50%;
`

const TokenIconFallback = styled.div`
  ${sameDimensions(40)};
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('primary')};
  font-weight: 700;
`

const AprIcon = styled.span`
  font-size: 10px;
  color: ${getColor('textShy')};
`

const InfoIcon = styled.span`
  font-size: 10px;
  opacity: 0.6;
`

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  background: transparent;
  color: ${getColor('contrast')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

const PrimaryActionButton = styled(ActionButton)`
  background: ${getColor('buttonPrimary')};
  border-color: ${getColor('buttonPrimary')};
`

const ButtonIcon = styled.span`
  font-size: 14px;
`

const WithdrawButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: ${getColor('buttonPrimary')};
  color: ${getColor('contrast')};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`
