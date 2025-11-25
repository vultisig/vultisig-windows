export const baseAffiliateBps = 50

export const vultDiscountTiers = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'ultimate',
] as const
export type VultDiscountTier = (typeof vultDiscountTiers)[number]

export const vultDiscountTierMinBalances: Record<VultDiscountTier, number> = {
  bronze: 1500,
  silver: 3000,
  gold: 7500,
  platinum: 15000,
  diamond: 100000,
  ultimate: 1000000,
}

export const vultDiscountTierBps: Record<VultDiscountTier, number> = {
  bronze: 5,
  silver: 10,
  gold: 20,
  platinum: 25,
  diamond: 35,
  ultimate: 50,
}
