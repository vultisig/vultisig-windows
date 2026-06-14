import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

export const DiscountTierMinBalance = ({
  value,
}: ValueProp<VultDiscountTier>) => (
  <Text size={14} weight={500}>
    {formatAmount(vultDiscountTierMinBalances[value], {
      ticker: `$${vult.ticker}`,
    })}
  </Text>
)
