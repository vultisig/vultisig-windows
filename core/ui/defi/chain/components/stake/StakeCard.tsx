import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { formatDateShort } from '@core/ui/defi/shared/formatters'
import { CalendarIcon } from '@lib/ui/icons/CalendarIcon'
import { CircleMinusIcon } from '@lib/ui/icons/CircleMinusIcon'
import { CirclePlusIcon } from '@lib/ui/icons/CirclePlusIcon'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { ButtonHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

const Card = styled(Panel)`
  padding: 20px;
  border-radius: 24px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
`

const SectionRow = styled(HStack)`
  width: 100%;
  align-items: center;
  gap: 12px;
`

const StatRow = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const StatLabel = styled(HStack)`
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${getColor('textShy')};
`

const StatValue = styled(Text)`
  font-size: 16px;
  font-weight: 600;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${getColor('foregroundSuper')};
`

const ActionsRow = styled(HStack)`
  width: 100%;
  gap: 12px;
  flex-wrap: wrap;
`

const ActionButton = styled.button.attrs({ type: 'button' })<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant: 'primary' | 'secondary'
  }
>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 999px;
  height: 48px;
  padding: 0 26px;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.2s ease;
  color: ${getColor('contrast')};

  ${({ variant }) =>
    variant === 'primary'
      ? css`
          background: ${getColor('buttonPrimary')};
          box-shadow: 0px 8px 24px rgba(31, 39, 61, 0.35);
        `
      : css`
          background: rgba(11, 19, 38, 0.95);
          border-color: ${getColor('buttonPrimary')};
        `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
      cursor: default;
    `}
`

const ActionIcon = styled.span<{ variant: 'primary' | 'secondary' }>`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-left: -12px;
  color: ${getColor('contrast')};
  ${({ variant }) =>
    variant === 'primary'
      ? css`
          background: rgba(255, 255, 255, 0.2);
        `
      : css`
          background: rgba(255, 255, 255, 0.12);
        `}
`

type Props = {
  id: string
  coin: Coin
  title: string
  amount: bigint
  fiat: number
  apr?: number
  estimatedReward?: number
  rewards?: number
  rewardTicker?: string
  nextPayout?: Date
  canUnstake?: boolean
  unstakeAvailableDate?: Date
  onStake?: () => void
  onUnstake?: () => void
  onWithdrawRewards?: () => void
  stakeLabel?: string
  unstakeLabel?: string
  isSkeleton?: boolean
  actionsDisabled?: boolean
}

export const StakeCard = ({
  id: _id,
  coin,
  title,
  amount,
  fiat,
  apr,
  estimatedReward,
  rewards,
  rewardTicker,
  nextPayout,
  canUnstake,
  unstakeAvailableDate,
  onStake,
  onUnstake,
  onWithdrawRewards,
  stakeLabel: _stakeLabel,
  unstakeLabel: _unstakeLabel,
  isSkeleton,
  actionsDisabled,
}: Props) => {
  const { t, i18n } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const unstakeAllowed = canUnstake ?? true
  const unstakeDisabled = actionsDisabled || !unstakeAllowed
  const unstakeMessage =
    !unstakeAllowed && unstakeAvailableDate
      ? t('unstake_available_on', {
          date: formatDateShort(unstakeAvailableDate, i18n.language),
        })
      : undefined

  return (
    <Card>
      <VStack gap={16}>
        <SectionRow>
          <HStack gap={12} alignItems="center" fullWidth>
            <CoinIcon coin={coin} style={{ fontSize: 44 }} />
            <VStack gap={4}>
              <Text size={14} color="shy">
                {title}
              </Text>
              {isSkeleton ? (
                <>
                  <Skeleton width="140px" height="28px" />
                  <Skeleton width="100px" height="12px" />
                </>
              ) : (
                <>
                  <Text size={28} weight="700" color="contrast">
                    {formatAmount(fromChainAmount(amount, coin.decimals), {
                      ticker: coin.ticker,
                    })}
                  </Text>
                  <Text size={12} color="shy">
                    {formatFiatAmount(fiat)}
                  </Text>
                </>
              )}
            </VStack>
          </HStack>
        </SectionRow>
        <Divider />
        <VStack gap={16}>
          <StatRow>
            <StatLabel>
              <PercentIcon />
              <Text size={13} color="shy">
                {t('apr')}
              </Text>
            </StatLabel>
            <StatValue color="success">
              {apr !== undefined ? `${apr.toFixed(2)}%` : '—'}
            </StatValue>
          </StatRow>
          <HStack gap={16} alignItems="center">
            <VStack flexGrow gap={8}>
              <StatLabel>
                <CalendarIcon />
                <Text size={13} color="shy">
                  {t('next_payout')}
                </Text>
              </StatLabel>
              <StatValue color="shyExtra">
                {isSkeleton ? (
                  <Skeleton width="80px" height="14px" />
                ) : (
                  (formatDateShort(nextPayout, i18n.language) ?? t('pending'))
                )}
              </StatValue>
            </VStack>
            <VStack flexGrow gap={8}>
              <StatLabel>
                <TrophyIcon />
                <Text size={14} color="shy">
                  {t('estimated_reward')}
                </Text>
              </StatLabel>
              <StatValue color="shyExtra">
                {isSkeleton ? (
                  <Skeleton width="90px" height="16px" />
                ) : estimatedReward !== undefined ? (
                  formatAmount(estimatedReward, {
                    ticker: rewardTicker ?? coin.ticker,
                  })
                ) : (
                  '—'
                )}
              </StatValue>
            </VStack>
          </HStack>
        </VStack>

        <Divider />

        <StatRow>
          {rewards !== undefined && rewards > 0 ? (
            <ActionButton
              variant="primary"
              onClick={onWithdrawRewards}
              disabled={actionsDisabled}
              style={{ width: '100%' }}
            >
              <ActionIcon variant="primary">
                <CircleMinusIcon />
              </ActionIcon>
              <Text as="span" size={14} weight="600" color="contrast">
                {t('withdraw')}{' '}
                {formatAmount(rewards, {
                  ticker: rewardTicker ?? coin.ticker,
                })}
              </Text>
            </ActionButton>
          ) : null}
        </StatRow>

        <ActionsRow>
          {isSkeleton ? (
            <>
              <Skeleton width="48%" height="42px" borderRadius="10px" />
              <Skeleton width="48%" height="42px" borderRadius="10px" />
            </>
          ) : (
            <>
              <ActionButton
                variant="secondary"
                onClick={onUnstake}
                style={{ flex: 1 }}
                disabled={unstakeDisabled}
              >
                <ActionIcon variant="secondary">
                  <CircleMinusIcon />
                </ActionIcon>
                {_unstakeLabel ?? t('unstake')}
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={onStake}
                style={{ flex: 1 }}
                disabled={actionsDisabled}
              >
                <ActionIcon variant="primary">
                  <CirclePlusIcon />
                </ActionIcon>
                {_stakeLabel ?? t('stake')}
              </ActionButton>
            </>
          )}
        </ActionsRow>
        {unstakeMessage ? (
          <Text size={12} color="shy">
            {unstakeMessage}
          </Text>
        ) : null}
      </VStack>
    </Card>
  )
}
