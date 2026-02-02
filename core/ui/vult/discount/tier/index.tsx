import {
  VultDiscountTier as VultDiscountTierType,
  vultDiscountTiers,
} from '@core/chain/swap/affiliate/config'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'

import { ActiveDiscountTierIndicator } from './active-indicator'
import { DiscountTierContainer } from './container'
import { VultDiscountTierHeader } from './header'
import { DiscountTierMinBalance } from './minBalance'
import { UnlockDiscountTier } from './unlock'

type VultDiscountTierProps = ValueProp<VultDiscountTierType> & {
  activeDiscountTier: VultDiscountTierType | null
}

export const VultDiscountTier = ({
  value,
  activeDiscountTier,
}: VultDiscountTierProps) => {
  const isActive = activeDiscountTier === value

  const isUnlockable = (() => {
    if (!activeDiscountTier) {
      return true
    }
    const activeIndex = vultDiscountTiers.indexOf(activeDiscountTier)
    const currentIndex = vultDiscountTiers.indexOf(value)
    return currentIndex > activeIndex
  })()

  return (
    <DiscountTierContainer value={value} $hasUnlockButton={isUnlockable}>
      <VultDiscountTierHeader value={value} />
      <HStack alignItems="center" justifyContent="space-between" fullWidth>
        <DiscountTierMinBalance value={value} />
        {isActive && <ActiveDiscountTierIndicator />}
      </HStack>
      {isUnlockable && <UnlockDiscountTier value={value} />}
    </DiscountTierContainer>
  )
}
