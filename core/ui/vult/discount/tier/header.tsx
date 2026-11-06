import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { useTranslation } from 'react-i18next'

import { VultDiscountTierBadge } from './badge'

/** A tier's badge and name. */
export const VultDiscountTierHeader = ({
  value,
}: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()

  return (
    <HStack alignItems="center" gap={12}>
      <VultDiscountTierBadge size={36} value={value} />
      <SettingsBaselineText variant="subtitle">{t(value)}</SettingsBaselineText>
    </HStack>
  )
}
