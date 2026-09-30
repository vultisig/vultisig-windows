import { formatDateWithFullYear } from '@core/ui/defi/shared/formatters'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BondChurn } from '../../../queries/bondRewards/churns'
import { BondChain } from '../../../queries/bondRewards/config'
import { useBondRewardHistoryQuery } from '../../../queries/bondRewards/useBondRewardHistoryQuery'
import { BondRewardHistoryRow } from './BondRewardHistoryRow'
import { noBondRewardValue } from './config'

type BondRewardHistorySheetProps = OnCloseProp & {
  chain: BondChain
  coin: Coin
  nodeAddress: string
  nextReward: number
  recentChurns: BondChurn[]
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

/**
 * Total Rewards Earned on one bonded node: the churn payouts summed, the
 * share still accruing toward the next churn, then one row per past churn,
 * newest first. The history loads when the sheet opens.
 */
export const BondRewardHistorySheet = ({
  chain,
  coin,
  nodeAddress,
  nextReward,
  recentChurns,
  onClose,
}: BondRewardHistorySheetProps) => {
  const { t, i18n } = useTranslation()
  const historyQuery = useBondRewardHistoryQuery({
    chain,
    nodeAddress,
    churns: recentChurns,
  })

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
                {noBondRewardValue}
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
            {t('bond_reward_history_node', {
              address: formatWalletAddress(nodeAddress),
            })}
          </Text>
        </VStack>
        <VStack>
          <Divider />
          <BondRewardHistoryRow
            coin={coin}
            amount={
              <>
                ~
                <BalanceVisibilityAware>
                  {formatReward(nextReward)}
                </BalanceVisibilityAware>
              </>
            }
            badge={t('upcoming')}
            badgeColor="warning"
          />
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
              history.map(({ height, date, amount }) => (
                <BondRewardHistoryRow
                  key={height}
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
