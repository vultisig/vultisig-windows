import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { useTranslation } from 'react-i18next'

import { discountTierIcons } from './icons'

export const VultDiscountTierHeader = ({
  value,
}: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  const Icon = discountTierIcons[value]

  return (
    <HStack alignItems="center" gap={12}>
      <Icon fontSize={36} />
      <Text size={15} weight="500">
        {t(value)}
      </Text>
    </HStack>
  )
}
