import { formatDateWithFullYear } from '@core/ui/defi/shared/formatters'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { noRewardValue } from './config'
import { RewardHistoryRow } from './RewardHistoryRow'

/** A past payout, in the reward coin's base units. */
type RewardHistoryEntry = {
  date: Date
  amount: bigint
}

type RewardHistorySheetProps = OnCloseProp & {
  coin: Coin
  subtitle: string
  /** The reward still accruing; the Upcoming row is left out when unknown. */
  upcomingReward?: number
  historyQuery: Query<RewardHistoryEntry[]>
}

const Content = styled(VStack)`
  padding: 20px 16px 32px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    padding: 0;
  }
`

const Divider = styled.div`
  height: 1px;
  background: ${getColor('foregroundExtra')};
`

/** Total Rewards Earned: past payouts summed, then one row per payout in the order given. */
export const RewardHistorySheet = ({
  coin,
  subtitle,
  upcomingReward,
  historyQuery,
  onClose,
}: RewardHistorySheetProps) => {
  const { t, i18n } = useTranslation()

  const formatReward = (amount: number) =>
    formatAmount(amount, { ticker: coin.ticker })

  return (
    <ResponsiveModal grabbable isOpen onClose={onClose}>
      <Content gap={20}>
        <VStack alignItems="center" gap={8}>
          <Text size={14} weight="500" color="shy" centerHorizontally>
            {t('total_rewards_earned')}
          </Text>
          <MatchQuery
            value={historyQuery}
            pending={() => <Skeleton width="150px" height="34px" />}
            error={() => (
              <Text size={28} weight="500" color="regular">
                {noRewardValue}
              </Text>
            )}
            success={history => (
              <Text size={28} weight="500" color="regular" centerHorizontally>
                <BalanceVisibilityAware size="l">
                  {formatReward(
                    fromChainAmount(
                      bigIntSum(history.map(({ amount }) => amount)),
                      coin.decimals
                    )
                  )}
                </BalanceVisibilityAware>
              </Text>
            )}
          />
          <Text size={12} weight="500" color="shy" centerHorizontally>
            {subtitle}
          </Text>
        </VStack>
        <VStack>
          <Divider />
          {upcomingReward !== undefined && (
            <RewardHistoryRow
              coin={coin}
              amount={
                <>
                  ~
                  <BalanceVisibilityAware>
                    {formatReward(upcomingReward)}
                  </BalanceVisibilityAware>
                </>
              }
              badge={t('upcoming')}
              badgeColor="warning"
            />
          )}
          <MatchQuery
            value={historyQuery}
            pending={() => (
              <VStack gap={12} padding="12px 0">
                <Skeleton width="100%" height="40px" />
                <Skeleton width="100%" height="40px" />
              </VStack>
            )}
            error={() => (
              <VStack padding="12px 0">
                <Text size={14} weight="500" color="shy" centerHorizontally>
                  {t('bond_reward_history_error')}
                </Text>
              </VStack>
            )}
            success={history =>
              history.map(({ date, amount }) => (
                <RewardHistoryRow
                  key={date.getTime()}
                  coin={coin}
                  amount={
                    <BalanceVisibilityAware>
                      {formatReward(fromChainAmount(amount, coin.decimals))}
                    </BalanceVisibilityAware>
                  }
                  badge={formatDateWithFullYear(date, i18n.language)}
                  badgeColor="shy"
                />
              ))
            }
          />
        </VStack>
      </Content>
    </ResponsiveModal>
  )
}
