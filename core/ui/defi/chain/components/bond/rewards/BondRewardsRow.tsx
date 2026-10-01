import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Opener } from '@lib/ui/base/Opener'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { BagClockIcon } from '@lib/ui/icons/BagClockIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BondChurn } from '../../../queries/bondRewards/churns'
import { BondChain } from '../../../queries/bondRewards/config'
import { BondInfoLabel } from '../BondInfoLabel'
import { BondLastRewardAmount } from './BondLastRewardAmount'
import { BondRewardHistorySheet } from './BondRewardHistorySheet'
import { noBondRewardValue } from './config'

type BondRewardsRowProps = {
  chain: BondChain
  coin: Coin
  nodeAddress: string
  nextReward: number
  recentChurns: BondChurn[]
}

const LastRewardButton = styled(UnstyledButton)`
  flex: 1;
  min-width: 0;
  text-align: start;
`

const Chevron = styled(ChevronRightIcon)`
  flex-shrink: 0;
  font-size: 16px;
  color: ${getColor('text')};
`

/**
 * A bonded node's Next Reward, still accruing, beside what the latest churn
 * paid. Last Reward opens the node's Total Rewards Earned sheet.
 */
export const BondRewardsRow = ({
  chain,
  coin,
  nodeAddress,
  nextReward,
  recentChurns,
}: BondRewardsRowProps) => {
  const { t } = useTranslation()
  const [lastChurn] = recentChurns

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <HStack gap={10}>
          <VStack flexGrow gap={6}>
            <BondInfoLabel icon={<TrophyIcon />}>
              {t('next_reward')}
            </BondInfoLabel>
            <Text size={14} weight="600" color="shyExtra">
              <BalanceVisibilityAware>
                {formatAmount(nextReward, { ticker: coin.ticker })}
              </BalanceVisibilityAware>
            </Text>
          </VStack>
          <LastRewardButton onClick={onOpen}>
            <VStack gap={6}>
              <BondInfoLabel icon={<BagClockIcon />}>
                {t('last_reward')}
              </BondInfoLabel>
              <HStack alignItems="center" gap={4}>
                {lastChurn ? (
                  <BondLastRewardAmount
                    chain={chain}
                    coin={coin}
                    nodeAddress={nodeAddress}
                    churn={lastChurn}
                  />
                ) : (
                  <Text size={14} weight="600" color="shyExtra">
                    {noBondRewardValue}
                  </Text>
                )}
                <Chevron strokeWidth={3} />
              </HStack>
            </VStack>
          </LastRewardButton>
        </HStack>
      )}
      renderContent={({ onClose }) => (
        <BondRewardHistorySheet
          chain={chain}
          coin={coin}
          nodeAddress={nodeAddress}
          nextReward={nextReward}
          recentChurns={recentChurns}
          onClose={onClose}
        />
      )}
    />
  )
}
