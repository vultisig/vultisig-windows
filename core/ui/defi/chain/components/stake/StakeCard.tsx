import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Button } from '@lib/ui/buttons/Button'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Card = styled(Panel)`
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(
    145deg,
    rgba(13, 26, 53, 0.85),
    rgba(8, 14, 32, 0.95)
  );
  border: 1px solid rgba(255, 255, 255, 0.04);
`

const SectionRow = styled(HStack)`
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

const StatRow = styled(SectionRow)`
  padding: 4px 0;
`

const StatLabel = styled(Text)`
  font-size: 12px;
  color: ${getColor('textShy')};
`

const StatValue = styled(Text)`
  font-size: 14px;
  font-weight: 600;
`

const formatDateShort = (date?: Date, locale?: string) => {
  if (!date) return null
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

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
  onStake?: () => void
  onUnstake?: () => void
  onWithdrawRewards?: () => void
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
  onStake,
  onUnstake,
  onWithdrawRewards,
  isSkeleton,
  actionsDisabled,
}: Props) => {
  const { t, i18n } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Card>
      <VStack gap={12}>
        <SectionRow alignItems="center">
          <HStack gap={12} alignItems="center">
            <CoinIcon coin={coin} style={{ fontSize: 40 }} />
            <VStack gap={4}>
              <Text size={14} color="shy">
                {title}
              </Text>
              {isSkeleton ? (
                <>
                  <Skeleton width="140px" height="26px" />
                  <Skeleton width="100px" height="14px" />
                </>
              ) : (
                <>
                  <Text size={24} weight="700" color="contrast">
                    {formatAmount(fromChainAmount(amount, coin.decimals), {
                      ticker: coin.ticker,
                    })}
                  </Text>
                  <Text size={13} color="shy">
                    {formatFiatAmount(fiat)}
                  </Text>
                </>
              )}
            </VStack>
          </HStack>
          <ArrowUpRightIcon />
        </SectionRow>

        <StatRow>
          <StatLabel>{t('apr')}</StatLabel>
          <StatValue color="success">
            {apr !== undefined ? `${apr.toFixed(2)}%` : '—'}
          </StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>{t('next_payout')}</StatLabel>
          <StatValue color="contrast">
            {isSkeleton ? (
              <Skeleton width="80px" height="14px" />
            ) : (
              (formatDateShort(nextPayout, i18n.language) ?? t('pending'))
            )}
          </StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>{t('estimated_reward')}</StatLabel>
          <StatValue color="contrast">
            {isSkeleton ? (
              <Skeleton width="90px" height="14px" />
            ) : estimatedReward !== undefined ? (
              formatAmount(estimatedReward, {
                ticker: rewardTicker ?? coin.ticker,
              })
            ) : (
              '—'
            )}
          </StatValue>
        </StatRow>

        {rewards !== undefined && rewards > 0 ? (
          <Button
            kind="primary"
            onClick={onWithdrawRewards}
            disabled={actionsDisabled}
          >
            {t('withdraw')}{' '}
            {formatAmount(rewards, { ticker: rewardTicker ?? coin.ticker })}
          </Button>
        ) : null}

        <SectionRow>
          {isSkeleton ? (
            <>
              <Skeleton width="48%" height="42px" borderRadius="10px" />
              <Skeleton width="48%" height="42px" borderRadius="10px" />
            </>
          ) : (
            <>
              <Button
                kind="secondary"
                onClick={onUnstake}
                style={{ flex: 1 }}
                disabled={actionsDisabled}
              >
                {t('unstake')}
              </Button>
              <Button
                kind="primary"
                onClick={onStake}
                style={{ flex: 1 }}
                disabled={actionsDisabled}
              >
                {t('stake')}
              </Button>
            </>
          )}
        </SectionRow>
      </VStack>
    </Card>
  )
}
