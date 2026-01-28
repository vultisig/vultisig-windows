import { VultDiscountTier } from '@core/chain/swap/affiliate/config'

type SwapDiscountType = 'vult' | 'referral'

type SwapDiscountMap = {
  vult: { tier: VultDiscountTier }
  referral: Record<string, never>
}

export type SwapDiscount = {
  [T in SwapDiscountType]: { [K in T]: SwapDiscountMap[T] }
}[SwapDiscountType]
