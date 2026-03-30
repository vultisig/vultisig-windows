import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

export const DiscountTierMinBalance = ({
  value,
}: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  return (
    <VStack gap={4}>
      <Text size={13} color="shy">
        {t('hold')}
      </Text>
      <Text size={14} weight={550}>
        {formatAmount(vultDiscountTierMinBalances[value], {
          ticker: `$${vult.ticker}`,
        })}
      </Text>
    </VStack>
  )
}
