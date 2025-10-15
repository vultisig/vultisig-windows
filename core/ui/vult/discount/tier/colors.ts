import { VultDiscountTier } from '@core/chain/swap/affiliate/config'
import { HSLA } from '@lib/ui/colors/HSLA'

export const discountTierColors: Record<VultDiscountTier, HSLA> = {
  bronze: new HSLA(14, 100, 60, 1),
  silver: new HSLA(215, 40, 85, 1),
  gold: new HSLA(38, 100, 68, 1),
  platinum: new HSLA(180, 60, 51, 1),
}
