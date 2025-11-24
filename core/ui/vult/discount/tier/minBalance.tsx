import { vult } from '@core/chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@core/chain/swap/affiliate/config'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

export const DiscountTierMinBalance = ({
  value,
}: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  return (
    <VStack gap={4}>
      <Text color="shy" size={13} weight="500">
        {t('stake')}
      </Text>
      {formatAmount(vultDiscountTierMinBalances[value], {
        ticker: `$${vult.ticker}`,
      })}
    </VStack>
  )
}
