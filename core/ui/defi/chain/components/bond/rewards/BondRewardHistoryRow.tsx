import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { HStack } from '@lib/ui/layout/Stack'
import { Text, TextColor } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { ReactNode } from 'react'
import styled from 'styled-components'

type BondRewardHistoryRowProps = {
  coin: Coin
  amount: ReactNode
  badge: string
  badgeColor: TextColor
}

const CoinContainer = styled.div`
  ${centerContent};
  ${sameDimensions(40)};
  flex-shrink: 0;
  ${borderRadius.pill};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  font-size: 16px;
`

const Badge = styled.div`
  flex-shrink: 0;
  padding: 3px 8px;
  ${borderRadius.sm};
  border: 1px solid ${getColor('foregroundExtra')};
`

/** One reward in a bonded node's reward history, tagged with when it pays. */
export const BondRewardHistoryRow = ({
  coin,
  amount,
  badge,
  badgeColor,
}: BondRewardHistoryRowProps) => (
  <HStack alignItems="center" gap={12} padding="12px 0">
    <CoinContainer>
      <CoinIcon coin={coin} />
    </CoinContainer>
    <HStack flexGrow alignItems="center">
      <Text size={16} weight="500" color="regular">
        {amount}
      </Text>
    </HStack>
    <Badge>
      <Text size={13} weight="500" color={badgeColor} nowrap>
        {badge}
      </Text>
    </Badge>
  </HStack>
)
