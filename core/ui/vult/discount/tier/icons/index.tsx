import { VultDiscountTier } from '@core/chain/swap/affiliate/config'
import { SvgProps } from '@lib/ui/props'

import { BronzeTierIcon } from './bronze'
import { GoldTierIcon } from './gold'
import { PlatinumTierIcon } from './platinum'
import { SilverTierIcon } from './silver'

export const discountTierIcons: Record<VultDiscountTier, React.FC<SvgProps>> = {
  bronze: BronzeTierIcon,
  silver: SilverTierIcon,
  gold: GoldTierIcon,
  platinum: PlatinumTierIcon,
}
